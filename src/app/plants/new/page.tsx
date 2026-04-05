'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { usePlants } from '@/hooks/use-plants';
import {
  ArrowLeft,
  X,
  Search,
  Database,
  Loader2,
  Check,
  Upload,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { PlantCategory, GrowingMethod, HealthTag, CustomPlant } from '@/types/plant';
import { db } from '@/lib/db';
import { searchPlants, getPlantById, type TreflePlant } from '@/lib/api/plants';
import { extractSeedPacketViaGemini, type SeedPacketData } from '@/lib/ocr';

const categories: { value: PlantCategory; label: string }[] = [
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'herb', label: 'Herb' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'flower', label: 'Flower' },
  { value: 'ornamental', label: 'Ornamental' },
  { value: 'medicinal', label: 'Medicinal' },
];

const growingMethods: { value: GrowingMethod; label: string; description: string }[] = [
  { value: 'soil', label: 'Soil', description: 'Traditional soil growing' },
  { value: 'hydroponic', label: 'Hydroponic', description: 'Water-based nutrient solution' },
  { value: 'aeroponic', label: 'Aeroponic', description: 'Mist-based root feeding' },
  { value: 'aquaponic', label: 'Aquaponic', description: 'Fish + plant ecosystem' },
];

const systemTypes = [
  'NFT', 'DWC', 'Ebb & Flow', 'Drip', 'Wicking', 'Dutch Bucket',
  'Kratky', 'Vertical Tower', 'Rail/Gutter', 'Aeroponics', 'Aquaponics',
];

const healthStatuses: { value: string; label: string; category: HealthTag['category'] }[] = [
  { value: 'healthy', label: 'Healthy', category: 'overall' },
  { value: 'thriving', label: 'Thriving', category: 'overall' },
  { value: 'watch', label: 'Watch', category: 'overall' },
  { value: 'stressed', label: 'Stressed', category: 'overall' },
  { value: 'seedling', label: 'Seedling', category: 'overall' },
  { value: 'dormant', label: 'Dormant', category: 'overall' },
];

export default function NewPlantPage() {
  const router = useRouter();
  const { addPlant } = usePlants();
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState<PlantCategory>('vegetable');
  const [growingMethod, setGrowingMethod] = useState<GrowingMethod>('soil');
  const [systemType, setSystemType] = useState('');
  const [location, setLocation] = useState('');
  const [plantedDate, setPlantedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [healthStatus, setHealthStatus] = useState('healthy');
  const [saving, setSaving] = useState(false);

  // ── Lookup state ──────────────────────────────────────────────────────────
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResults, setLookupResults] = useState<
    Array<{ source: 'trefle' | 'custom'; plant: TreflePlant | CustomPlant }>
  >([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [saveAsCustom, setSaveAsCustom] = useState(true);
  const [lastPickedTrefleId, setLastPickedTrefleId] = useState<number | null>(null);
  const [lastPickedLookupId, setLastPickedLookupId] = useState<string | null>(null);

  // ── Seed packet OCR state ─────────────────────────────────────────────────
  type OcrStatus = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error';
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>('idle');
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<SeedPacketData | null>(null);
  const [ocrFilledFields, setOcrFilledFields] = useState<string[]>([]);
  const [seedPacketPreview, setSeedPacketPreview] = useState<string | null>(null);
  const [seedPacketFile, setSeedPacketFile] = useState<File | null>(null);
  const seedPacketInputRef = useRef<HTMLInputElement>(null);

  const runLookup = async () => {
    const q = lookupQuery.trim();
    if (!q) return;
    setLookupLoading(true);
    setLookupError(null);
    try {
      // Search locally-saved custom plants first so offline-entered plants surface.
      const customMatches = await db.customPlants
        .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
        .toArray();
      let trefleMatches: TreflePlant[] = [];
      try {
        trefleMatches = await searchPlants(q);
      } catch (err) {
        // Don't fail the whole lookup — still show custom matches.
        setLookupError('Plant database unreachable. Showing local results only.');
      }
      setLookupResults([
        ...customMatches.map((p) => ({ source: 'custom' as const, plant: p })),
        ...trefleMatches.map((p) => ({ source: 'trefle' as const, plant: p })),
      ]);
    } finally {
      setLookupLoading(false);
    }
  };

  const applyTreflePlant = async (tp: TreflePlant) => {
    // Always set the name immediately so the user sees the form update even
    // if the detail fetch is slow or fails.
    const displayName = tp.common_name ?? tp.scientific_name ?? '';
    if (displayName) setName(displayName);
    setLastPickedLookupId(tp.id);
    if (tp.source === 'trefle') {
      const n = Number(tp.id.split(':')[1]);
      setLastPickedTrefleId(Number.isFinite(n) ? n : null);
    } else {
      setLastPickedTrefleId(null);
    }
    try {
      const detail = await getPlantById(tp.id);
      if (!detail) return;
      const bits: string[] = [];
      if (tp.scientific_name) bits.push(`Scientific name: ${tp.scientific_name}`);
      if (tp.family) bits.push(`Family: ${tp.family}`);
      if (detail.description) bits.push(detail.description);
      if (detail.sun_requirements) bits.push(`Sun: ${detail.sun_requirements}`);
      if (detail.sowing_method) bits.push(`Sowing: ${detail.sowing_method}`);
      if (detail.spacing) bits.push(`Spacing: ${detail.spacing}`);
      if (detail.row_spacing) bits.push(`Row spacing: ${detail.row_spacing}`);
      if (detail.height) bits.push(`Height: ${detail.height}`);
      if (detail.min_temp_c !== undefined) bits.push(`Min temp: ${detail.min_temp_c}°C`);
      if (detail.max_temp_c !== undefined) bits.push(`Max temp: ${detail.max_temp_c}°C`);
      if (detail.ph_minimum !== undefined)
        bits.push(`pH ${detail.ph_minimum}–${detail.ph_maximum ?? '?'}`);
      if (detail.growth_rate) bits.push(`Growth rate: ${detail.growth_rate}`);
      if (bits.length > 0) setNotes(bits.join('\n'));
    } catch {
      /* ignore — notes stay as-is */
    }
  };

  const applyCustomPlant = (cp: CustomPlant) => {
    setName(cp.name);
    if (cp.variety) setVariety(cp.variety);
    if (cp.category) setCategory(cp.category);
    if (cp.notes) setNotes(cp.notes);
    if (cp.trefleId) setLastPickedTrefleId(cp.trefleId);
  };

  // ── Seed packet OCR ────────────────────────────────────────────────────────
  const handleSeedPacketUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrError(null);
    setOcrResult(null);
    setOcrFilledFields([]);
    setSeedPacketFile(file);
    if (seedPacketPreview) URL.revokeObjectURL(seedPacketPreview);
    setSeedPacketPreview(URL.createObjectURL(file));

    setOcrStatus('uploading');
    // Small defer so the UI reflects "uploading" before the heavier work.
    await new Promise((r) => setTimeout(r, 50));
    setOcrStatus('analyzing');

    try {
      const data = await extractSeedPacketViaGemini(file);
      setOcrResult(data);

      // Apply to form fields — but only to empty ones, so we don't clobber
      // anything the user has already typed.
      const filled: string[] = [];
      if (data.plantName && !name.trim()) {
        setName(data.plantName);
        filled.push('Name');
      }
      if (data.variety && !variety.trim()) {
        setVariety(data.variety);
        filled.push('Variety');
      }

      // Build a notes block from the structured fields.
      const noteBits: string[] = [];
      if (data.brand) noteBits.push(`Brand: ${data.brand}`);
      if (data.daysToGermination)
        noteBits.push(`Days to germination: ${data.daysToGermination}`);
      if (data.daysToMaturity) noteBits.push(`Days to maturity: ${data.daysToMaturity}`);
      if (data.plantingDepth) noteBits.push(`Planting depth: ${data.plantingDepth}`);
      if (data.spacing) noteBits.push(`Spacing: ${data.spacing}`);
      if (data.rowSpacing) noteBits.push(`Row spacing: ${data.rowSpacing}`);
      if (data.sunRequirement) noteBits.push(`Sun: ${data.sunRequirement}`);
      if (data.sowingMethod) noteBits.push(`Sowing: ${data.sowingMethod}`);
      if (data.whenToPlant) noteBits.push(`When to plant: ${data.whenToPlant}`);
      if (data.notes) noteBits.push(data.notes);

      if (noteBits.length > 0) {
        const header = 'From seed packet:';
        const block = `${header}\n${noteBits.join('\n')}`;
        setNotes((prev) => (prev.trim() ? `${prev}\n\n${block}` : block));
        filled.push('Notes');
      }

      setOcrFilledFields(filled);
      setOcrStatus('done');
    } catch (err) {
      setOcrError((err as Error).message);
      setOcrStatus('error');
    }
  };

  const clearSeedPacket = () => {
    if (seedPacketPreview) URL.revokeObjectURL(seedPacketPreview);
    setSeedPacketPreview(null);
    setSeedPacketFile(null);
    setOcrStatus('idle');
    setOcrError(null);
    setOcrResult(null);
    setOcrFilledFields([]);
    if (seedPacketInputRef.current) seedPacketInputRef.current.value = '';
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);

    const statusInfo = healthStatuses.find((s) => s.value === healthStatus);
    const healthTags: HealthTag[] = statusInfo
      ? [{ category: statusInfo.category, value: statusInfo.value, severity: 'low', addedAt: new Date() }]
      : [];

    const id = await addPlant({
      name: name.trim(),
      variety: variety.trim() || undefined,
      category,
      growingMethod,
      systemType: growingMethod !== 'soil' ? systemType : undefined,
      location: location.trim() || undefined,
      plantedDate: new Date(plantedDate),
      healthTags,
      tags,
      notes: notes.trim() || undefined,
      trefleId: lastPickedTrefleId ?? undefined,
    });

    // Persist the seed packet photo (if uploaded) now that we have a plant id.
    if (seedPacketFile) {
      try {
        const thumbnail = await createThumbnail(seedPacketFile, 400);
        await db.photos.add({
          plantId: id,
          blob: seedPacketFile,
          thumbnail,
          type: 'seedPacket',
          createdAt: new Date(),
        });
      } catch {
        /* non-fatal */
      }
    }

    // Optionally persist as a reusable custom-plant template.
    if (saveAsCustom) {
      try {
        const exists = await db.customPlants
          .filter((p) => p.name.toLowerCase() === name.trim().toLowerCase())
          .first();
        if (!exists) {
          await db.customPlants.add({
            name: name.trim(),
            variety: variety.trim() || undefined,
            category,
            notes: notes.trim() || undefined,
            trefleId: lastPickedTrefleId ?? undefined,
            source: lastPickedTrefleId ? 'trefle' : 'user',
            createdAt: new Date(),
          });
        }
      } catch {
        /* non-fatal */
      }
    }

    router.push(`/plants/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/plants" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to plants
      </Link>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Lookup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Plant Lookup
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Search the Trefle plant database or your saved custom plants to auto-fill fields.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Thai Basil"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        runLookup();
                      }
                    }}
                    className="pl-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={runLookup}
                  disabled={lookupLoading || !lookupQuery.trim()}
                >
                  {lookupLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Search'
                  )}
                </Button>
              </div>
              {lookupError && (
                <p className="text-xs text-amber-600">{lookupError}</p>
              )}
              {lookupResults.length > 0 && (
                <div className="max-h-64 overflow-y-auto space-y-1 border rounded-md p-1">
                  {lookupResults.map((res, i) => {
                    const key = `${res.source}-${i}`;
                    if (res.source === 'custom') {
                      const cp = res.plant as CustomPlant;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => applyCustomPlant(cp)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-left"
                        >
                          <Badge variant="secondary" className="text-[10px]">Saved</Badge>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{cp.name}</p>
                            {cp.scientificName && (
                              <p className="text-[10px] text-muted-foreground italic truncate">
                                {cp.scientificName}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    }
                    const tp = res.plant as TreflePlant;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => applyTreflePlant(tp)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted text-left"
                      >
                        <Badge variant="outline" className="text-[10px]">Trefle</Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {tp.common_name ?? tp.scientific_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground italic truncate">
                            {tp.scientific_name}
                          </p>
                        </div>
                        {lastPickedLookupId === tp.id && (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={saveAsCustom}
                  onChange={(e) => setSaveAsCustom(e.target.checked)}
                  className="rounded"
                />
                Save this plant to my custom plants for next time
              </label>
            </CardContent>
          </Card>

          {/* Seed Packet OCR (Gemini) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Seed Packet Scan
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Upload a photo of your seed packet. Google Gemini will read it
                and pre-fill the fields below.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <input
                ref={seedPacketInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleSeedPacketUpload}
                className="hidden"
              />

              {!seedPacketPreview ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => seedPacketInputRef.current?.click()}
                  className="w-full border-dashed h-24 flex flex-col items-center justify-center gap-1"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Upload seed packet photo</span>
                  <span className="text-[10px] text-muted-foreground">
                    JPG/PNG — Gemini will extract the details
                  </span>
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={seedPacketPreview}
                      alt="Seed packet preview"
                      className="h-28 w-28 object-cover rounded border"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      {ocrStatus === 'uploading' && (
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Preparing image…
                        </div>
                      )}
                      {ocrStatus === 'analyzing' && (
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Analyzing with Gemini…
                        </div>
                      )}
                      {ocrStatus === 'done' && (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <Check className="h-4 w-4" />
                          Extraction complete
                        </div>
                      )}
                      {ocrStatus === 'error' && (
                        <div className="flex items-start gap-2 text-sm text-red-700">
                          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                          <span className="break-words">{ocrError}</span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => seedPacketInputRef.current?.click()}
                        >
                          Replace
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearSeedPacket}
                        >
                          Remove
                        </Button>
                        {ocrStatus === 'error' && seedPacketFile && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Retry by re-running against the stored file.
                              const f = seedPacketFile;
                              const fakeEvent = {
                                target: { files: [f] as unknown as FileList },
                              } as unknown as React.ChangeEvent<HTMLInputElement>;
                              handleSeedPacketUpload(fakeEvent);
                            }}
                          >
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {ocrStatus === 'done' && ocrResult && (
                    <div className="rounded-md border bg-muted/30 p-3 space-y-2">
                      {ocrFilledFields.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs text-muted-foreground">
                            Auto-filled:
                          </span>
                          {ocrFilledFields.map((f) => (
                            <Badge
                              key={f}
                              variant="secondary"
                              className="text-[10px]"
                            >
                              {f}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Nothing confidently extracted. Check the packet photo
                          or fill in fields manually.
                        </p>
                      )}
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View extracted data
                        </summary>
                        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                          {(
                            [
                              ['Plant', ocrResult.plantName],
                              ['Variety', ocrResult.variety],
                              ['Brand', ocrResult.brand],
                              ['Germination', ocrResult.daysToGermination],
                              ['Maturity', ocrResult.daysToMaturity],
                              ['Depth', ocrResult.plantingDepth],
                              ['Spacing', ocrResult.spacing],
                              ['Row spacing', ocrResult.rowSpacing],
                              ['Sun', ocrResult.sunRequirement],
                              ['Sowing', ocrResult.sowingMethod],
                              ['When', ocrResult.whenToPlant],
                            ] as const
                          )
                            .filter(([, v]) => v !== undefined && v !== '')
                            .map(([k, v]) => (
                              <div key={k} className="contents">
                                <dt className="font-medium text-muted-foreground">
                                  {k}:
                                </dt>
                                <dd className="break-words">{String(v)}</dd>
                              </div>
                            ))}
                        </dl>
                      </details>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Plant Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plant Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Thai Basil"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="variety">Variety</Label>
                  <Input
                    id="variety"
                    placeholder="e.g. Sweet Basil"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat.value}
                      type="button"
                      variant={category === cat.value ? 'default' : 'outline'}
                      className={category === cat.value ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => setCategory(cat.value)}
                      size="sm"
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="planted">Date Planted</Label>
                <Input
                  id="planted"
                  type="date"
                  value={plantedDate}
                  onChange={(e) => setPlantedDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Backyard raised bed, Greenhouse rack 2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Growing Method */}
          <Card>
            <CardHeader>
              <CardTitle>Growing Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={growingMethod} onValueChange={(v) => setGrowingMethod(v as GrowingMethod)}>
                {growingMethods.map((method) => (
                  <div key={method.value} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer">
                    <RadioGroupItem value={method.value} id={method.value} />
                    <Label htmlFor={method.value} className="cursor-pointer flex-1">
                      <span className="font-medium">{method.label}</span>
                      <span className="text-sm text-muted-foreground ml-2">{method.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {growingMethod !== 'soil' && (
                <div className="space-y-2">
                  <Label>System Type</Label>
                  <Select value={systemType} onValueChange={(v) => v && setSystemType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select system type" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Health Status */}
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {healthStatuses.map((status) => (
                  <Button
                    key={status.value}
                    type="button"
                    variant={healthStatus === status.value ? 'default' : 'outline'}
                    className={healthStatus === status.value ? 'bg-green-600 hover:bg-green-700' : ''}
                    onClick={() => setHealthStatus(status.value)}
                    size="sm"
                  >
                    {status.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional notes about this plant..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 flex-1"
              disabled={!name.trim() || saving}
            >
              {saving ? 'Saving...' : 'Add Plant'}
            </Button>
            <Link href="/plants">
              <Button type="button" variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

async function createThumbnail(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(blob || new Blob());
        },
        'image/jpeg',
        0.7,
      );
    };
    img.src = url;
  });
}
