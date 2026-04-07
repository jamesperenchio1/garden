'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  X,
  Search,
  Sparkles,
  ChevronLeft,
  Leaf,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { usePlants } from '@/hooks/use-plants';
import type {
  PlantCategory,
  GrowingMethod,
  HealthTag,
} from '@/types/plant';
import { db } from '@/lib/db';
import { getPlantById, type TreflePlant, type TreflePlantDetail } from '@/lib/api/plants';
import type { CustomPlant } from '@/types/plant';
import type { SeedPacketData } from '@/lib/ocr';

import { PlantSearch } from '@/components/plants/plant-search';
import { VarietyPicker } from '@/components/plants/variety-picker';
import { PlantInfoPanel } from '@/components/plants/plant-info-panel';
import { SeedPacketScanner } from '@/components/plants/seed-packet-scanner';

// ── Constants ──────────────────────────────────────────────────────────────────

const categories: { value: PlantCategory; label: string }[] = [
  { value: 'vegetable', label: 'Vegetable' },
  { value: 'herb', label: 'Herb' },
  { value: 'fruit', label: 'Fruit' },
  { value: 'flower', label: 'Flower' },
  { value: 'ornamental', label: 'Ornamental' },
  { value: 'medicinal', label: 'Medicinal' },
];

const growingMethods: { value: GrowingMethod; label: string; desc: string }[] = [
  { value: 'soil', label: 'Soil', desc: 'Traditional soil' },
  { value: 'hydroponic', label: 'Hydroponic', desc: 'Water-based nutrients' },
  { value: 'aeroponic', label: 'Aeroponic', desc: 'Mist-based feeding' },
  { value: 'aquaponic', label: 'Aquaponic', desc: 'Fish + plant ecosystem' },
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

// ── Component ──────────────────────────────────────────────────────────────────

type AddMode = 'search' | 'scan';
type SearchStep = 'plant' | 'variety' | 'done';

export default function NewPlantPage() {
  const router = useRouter();
  const { addPlant } = usePlants();

  // ── Add mode ──────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<AddMode>('search');
  const [searchStep, setSearchStep] = useState<SearchStep>('plant');

  // ── Selected plant from search ────────────────────────────────────────────
  const [selectedPlant, setSelectedPlant] = useState<TreflePlant | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<TreflePlantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── Form fields ───────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [category, setCategory] = useState<PlantCategory>('vegetable');
  const [growingMethod, setGrowingMethod] = useState<GrowingMethod>('soil');
  const [systemType, setSystemType] = useState('');
  const [location, setLocation] = useState('');
  const [plantedDate, setPlantedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [healthStatus, setHealthStatus] = useState('healthy');
  const [saving, setSaving] = useState(false);
  const [saveAsCustom, setSaveAsCustom] = useState(true);

  // ── OCR state ─────────────────────────────────────────────────────────────
  const [seedPacketFile, setSeedPacketFile] = useState<File | null>(null);

  // ── Trefle tracking ───────────────────────────────────────────────────────
  const [lastPickedTrefleId, setLastPickedTrefleId] = useState<number | null>(null);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const fetchDetail = async (plant: TreflePlant) => {
    setDetailLoading(true);
    try {
      const detail = await getPlantById(plant.id);
      setSelectedDetail(detail);
      if (detail) {
        buildNotesFromDetail(detail);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const buildNotesFromDetail = (detail: TreflePlantDetail) => {
    const bits: string[] = [];
    if (detail.scientific_name) bits.push(`Scientific name: ${detail.scientific_name}`);
    if (detail.family) bits.push(`Family: ${detail.family}`);
    if (detail.description) bits.push(detail.description);
    if (detail.sun_requirements) bits.push(`Sun: ${detail.sun_requirements}`);
    if (detail.sowing_method) bits.push(`Sowing: ${detail.sowing_method}`);
    if (detail.sowing_depth) bits.push(`Planting depth: ${detail.sowing_depth}`);
    if (detail.days_to_maturity) bits.push(`Days to maturity: ${detail.days_to_maturity}`);
    if (detail.spacing) bits.push(`Spacing: ${detail.spacing}`);
    if (detail.row_spacing) bits.push(`Row spacing: ${detail.row_spacing}`);
    if (detail.height) bits.push(`Height: ${detail.height}`);
    if (detail.min_temp_c !== undefined) bits.push(`Min temp: ${detail.min_temp_c}°C`);
    if (detail.max_temp_c !== undefined) bits.push(`Max temp: ${detail.max_temp_c}°C`);
    if (detail.ph_minimum !== undefined)
      bits.push(`pH ${detail.ph_minimum}–${detail.ph_maximum ?? '?'}`);
    if (detail.growth_rate) bits.push(`Growth rate: ${detail.growth_rate}`);
    if (bits.length > 0) setNotes(bits.join('\n'));
  };

  const handlePlantSelect = (plant: TreflePlant) => {
    setSelectedPlant(plant);
    const displayName = plant.common_name ?? plant.scientific_name ?? '';
    setName(displayName);
    if (plant.source === 'trefle') {
      const n = Number(plant.id.split(':')[1]);
      setLastPickedTrefleId(Number.isFinite(n) ? n : null);
    } else {
      setLastPickedTrefleId(null);
    }
    fetchDetail(plant);
    setSearchStep('variety');
  };

  const handleCustomSelect = (cp: CustomPlant) => {
    setName(cp.name);
    if (cp.variety) setVariety(cp.variety);
    if (cp.category) setCategory(cp.category);
    if (cp.notes) setNotes(cp.notes);
    if (cp.trefleId) setLastPickedTrefleId(cp.trefleId);
    setSearchStep('done');
  };

  const handleVarietySelect = (v: TreflePlant) => {
    const vName = v.common_name ?? v.scientific_name ?? '';
    // If the variety name differs from the base plant name, extract the variety portion
    const baseName = selectedPlant?.common_name?.toLowerCase() ?? '';
    if (vName.toLowerCase() !== baseName && vName.toLowerCase().includes(baseName)) {
      setVariety(vName.replace(new RegExp(baseName, 'i'), '').trim().replace(/^[-–,]+\s*/, ''));
    } else if (vName.toLowerCase() !== baseName) {
      setVariety(vName);
    }
    // Fetch detail for the variety too
    if (v.id !== selectedPlant?.id) {
      fetchDetail(v);
    }
    setSearchStep('done');
  };

  const handleVarietySkip = () => {
    setSearchStep('done');
  };

  const handleOcrExtracted = (data: SeedPacketData) => {
    if (data.plantName && !name.trim()) setName(data.plantName);
    if (data.variety && !variety.trim()) setVariety(data.variety);

    const noteBits: string[] = [];
    if (data.brand) noteBits.push(`Brand: ${data.brand}`);
    if (data.daysToGermination)
      noteBits.push(`Days to germination: ${data.daysToGermination}`);
    if (data.daysToMaturity)
      noteBits.push(`Days to maturity: ${data.daysToMaturity}`);
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
    }
  };

  const resetSearch = () => {
    setSelectedPlant(null);
    setSelectedDetail(null);
    setSearchStep('plant');
    setName('');
    setVariety('');
    setNotes('');
    setLastPickedTrefleId(null);
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);

    const statusInfo = healthStatuses.find((s) => s.value === healthStatus);
    const healthTags: HealthTag[] = statusInfo
      ? [
          {
            category: statusInfo.category,
            value: statusInfo.value,
            severity: 'low',
            addedAt: new Date(),
          },
        ]
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/plants"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to plants
      </Link>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* ─── Smart Add Hero ────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Add Plant
                </CardTitle>
                {/* Mode toggle */}
                <div className="flex rounded-lg border bg-muted p-0.5">
                  <button
                    type="button"
                    onClick={() => setMode('search')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      mode === 'search'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Search className="h-3 w-3 inline mr-1" />
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('scan')}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      mode === 'scan'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Sparkles className="h-3 w-3 inline mr-1" />
                    Scan Packet
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === 'search'
                  ? 'Search Trefle + OpenFarm databases. Pick a plant, then narrow to a variety.'
                  : 'Upload a seed packet photo. Gemini AI will extract all planting details.'}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {mode === 'search' ? (
                <>
                  {searchStep === 'plant' && (
                    <PlantSearch
                      onSelect={handlePlantSelect}
                      onCustomSelect={handleCustomSelect}
                      selectedId={selectedPlant?.id ?? null}
                    />
                  )}

                  {searchStep === 'variety' && selectedPlant && (
                    <div className="space-y-3">
                      {/* Selected plant chip */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                        {selectedPlant.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={selectedPlant.image_url}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Leaf className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate capitalize">
                            {selectedPlant.common_name ?? selectedPlant.scientific_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground italic truncate">
                            {selectedPlant.scientific_name}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={resetSearch}
                          className="shrink-0 h-7 text-xs"
                        >
                          <ChevronLeft className="h-3 w-3 mr-1" />
                          Change
                        </Button>
                      </div>

                      <VarietyPicker
                        plantName={selectedPlant.common_name ?? selectedPlant.scientific_name ?? ''}
                        onSelect={handleVarietySelect}
                        onSkip={handleVarietySkip}
                      />
                    </div>
                  )}

                  {searchStep === 'done' && (
                    <div className="space-y-3">
                      {/* Summary chip */}
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
                        {selectedPlant?.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={selectedPlant.image_url}
                            alt=""
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-green-100 dark:bg-green-900 flex items-center justify-center">
                            <Leaf className="h-4 w-4 text-green-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{name}</p>
                          {variety && (
                            <p className="text-xs text-muted-foreground truncate">
                              Variety: {variety}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={resetSearch}
                          className="shrink-0 h-7 text-xs"
                        >
                          <ChevronLeft className="h-3 w-3 mr-1" />
                          Start over
                        </Button>
                      </div>

                      {/* Detail panel */}
                      <PlantInfoPanel detail={selectedDetail} loading={detailLoading} />
                    </div>
                  )}
                </>
              ) : (
                <SeedPacketScanner
                  onExtracted={handleOcrExtracted}
                  onFileChange={setSeedPacketFile}
                />
              )}
            </CardContent>
          </Card>

          {/* ─── Plant Info ─────────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Plant Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">
                    Plant Name *
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Tomato"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="variety" className="text-xs">
                    Variety
                  </Label>
                  <Input
                    id="variety"
                    placeholder="e.g. Roma, Cherry"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Category</Label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {categories.map((cat) => (
                    <Button
                      key={cat.value}
                      type="button"
                      variant={category === cat.value ? 'default' : 'outline'}
                      className={`text-xs h-8 ${category === cat.value ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      onClick={() => setCategory(cat.value)}
                      size="sm"
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="planted" className="text-xs">
                    Date Planted
                  </Label>
                  <Input
                    id="planted"
                    type="date"
                    value={plantedDate}
                    onChange={(e) => setPlantedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-xs">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Raised bed A"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ─── Growing Method ─────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Growing Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {growingMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setGrowingMethod(method.value)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      growingMethod === method.value
                        ? 'border-green-600 bg-green-50 dark:bg-green-950/30'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <p
                      className={`text-sm font-medium ${growingMethod === method.value ? 'text-green-700 dark:text-green-400' : ''}`}
                    >
                      {method.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{method.desc}</p>
                  </button>
                ))}
              </div>

              {growingMethod !== 'soil' && (
                <div className="space-y-1.5">
                  <Label className="text-xs">System Type</Label>
                  <Select value={systemType} onValueChange={(v) => v && setSystemType(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select system type" />
                    </SelectTrigger>
                    <SelectContent>
                      {systemTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── Health + Tags (merged, compact) ────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-1.5">
                  {healthStatuses.map((status) => (
                    <Button
                      key={status.value}
                      type="button"
                      variant={healthStatus === status.value ? 'default' : 'outline'}
                      className={`text-xs h-8 ${healthStatus === status.value ? 'bg-green-600 hover:bg-green-700' : ''}`}
                      onClick={() => setHealthStatus(status.value)}
                      size="sm"
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex gap-1.5">
                  <Input
                    placeholder="Add tag…"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="h-8 text-xs"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-8 text-xs">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                          className="hover:text-destructive"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ─── Notes ──────────────────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Growing notes, observations, or seed packet info will appear here…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="text-sm"
              />
            </CardContent>
          </Card>

          {/* ─── Options + Submit ────────────────────────────────────────────── */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={saveAsCustom}
                onChange={(e) => setSaveAsCustom(e.target.checked)}
                className="rounded"
              />
              Save to my custom plants for quick reuse
            </label>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700 flex-1 h-11 text-sm font-medium"
                disabled={!name.trim() || saving}
              >
                {saving ? 'Saving…' : 'Add Plant'}
              </Button>
              <Link href="/plants">
                <Button type="button" variant="outline" className="h-11">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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
