'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Camera, Plus, Trash2, X, Upload, Leaf, TrendingUp, Scale } from 'lucide-react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/db';
import { usePlantPhotos, usePlantLog } from '@/hooks/use-plants';
import {
  usePlantYields,
  useYieldReference,
  calculateYieldRating,
  YIELD_RATING_LABELS,
  YIELD_RATING_COLORS,
} from '@/hooks/use-yields';
import type { Plant, HealthTag, HealthTagCategory, HealthSeverity, YieldRating } from '@/types/plant';

export default function PlantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const plantId = Number(params.id);
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const { photos, addPhoto, deletePhoto } = usePlantPhotos(plantId);
  const { entries, addEntry } = usePlantLog(plantId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});

  // Health tag dialog state
  const [showHealthDialog, setShowHealthDialog] = useState(false);
  const [newTagCategory, setNewTagCategory] = useState<HealthTagCategory>('overall');
  const [newTagValue, setNewTagValue] = useState('');
  const [newTagSeverity, setNewTagSeverity] = useState<HealthSeverity>('low');

  // Note dialog state
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [noteText, setNoteText] = useState('');

  // Yield tracking
  const { records: yieldRecords, addYield, deleteYield, totalGrams, harvestCount } = usePlantYields(plantId);
  const { reference: yieldRef } = useYieldReference(plant?.name);
  const [showYieldDialog, setShowYieldDialog] = useState(false);
  const [yieldAmount, setYieldAmount] = useState('');
  const [yieldRatingInput, setYieldRatingInput] = useState<YieldRating>('moderate');
  const [yieldNotes, setYieldNotes] = useState('');

  useEffect(() => {
    async function load() {
      const p = await db.plants.get(plantId);
      setPlant(p || null);
      setLoading(false);
    }
    load();
  }, [plantId]);

  // Create object URLs for photos
  useEffect(() => {
    const urls: Record<number, string> = {};
    photos.forEach((photo) => {
      if (photo.id && photo.thumbnail) {
        urls[photo.id] = URL.createObjectURL(photo.thumbnail);
      }
    });
    setPhotoUrls(urls);
    return () => {
      Object.values(urls).forEach(URL.revokeObjectURL);
    };
  }, [photos]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Plant not found</h2>
        <Link href="/plants" className="text-green-600 hover:underline">Back to plants</Link>
      </div>
    );
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create thumbnail
    const thumbnail = await createThumbnail(file, 200);

    await addPhoto({
      plantId,
      blob: file,
      thumbnail,
      type: 'plant',
      createdAt: new Date(),
    });

    await addEntry({
      plantId,
      type: 'photo',
      title: 'Photo added',
      createdAt: new Date(),
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddHealthTag = async () => {
    if (!newTagValue.trim()) return;

    const tag: HealthTag = {
      category: newTagCategory,
      value: newTagValue.trim(),
      severity: newTagSeverity,
      addedAt: new Date(),
    };

    const updatedTags = [...(plant.healthTags || []), tag];
    await db.plants.update(plantId, { healthTags: updatedTags, updatedAt: new Date() });
    setPlant({ ...plant, healthTags: updatedTags });

    await addEntry({
      plantId,
      type: 'health',
      title: `Health tag added: ${newTagCategory} - ${newTagValue}`,
      healthTags: [tag],
      createdAt: new Date(),
    });

    setNewTagValue('');
    setShowHealthDialog(false);
  };

  const handleRemoveHealthTag = async (index: number) => {
    const updatedTags = plant.healthTags.filter((_, i) => i !== index);
    await db.plants.update(plantId, { healthTags: updatedTags, updatedAt: new Date() });
    setPlant({ ...plant, healthTags: updatedTags });
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    await addEntry({
      plantId,
      type: 'note',
      title: noteText.trim(),
      createdAt: new Date(),
    });
    setNoteText('');
    setShowNoteDialog(false);
  };

  const handleAddYield = async () => {
    const grams = Number(yieldAmount);
    if (!grams || grams <= 0) return;
    await addYield({
      plantId,
      amountGrams: grams,
      rating: yieldRatingInput,
      notes: yieldNotes.trim() || undefined,
      harvestedAt: new Date(),
    });
    await addEntry({
      plantId,
      type: 'action',
      title: `Harvested ${grams}g (${YIELD_RATING_LABELS[yieldRatingInput]})`,
      content: yieldNotes.trim() || undefined,
      createdAt: new Date(),
    });
    setYieldAmount('');
    setYieldNotes('');
    setYieldRatingInput('moderate');
    setShowYieldDialog(false);
  };

  const overallRating = calculateYieldRating(totalGrams, yieldRef);

  const handleDelete = async () => {
    if (!confirm('Delete this plant and all its photos and logs?')) return;
    await db.transaction('rw', [db.plants, db.photos, db.logEntries, db.tasks], async () => {
      await db.photos.where('plantId').equals(plantId).delete();
      await db.logEntries.where('plantId').equals(plantId).delete();
      await db.tasks.where('plantId').equals(plantId).delete();
      await db.plants.delete(plantId);
    });
    router.push('/plants');
  };

  const age = formatDistanceToNow(new Date(plant.plantedDate));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/plants" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to plants
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{plant.name}</h1>
          {plant.variety && <p className="text-muted-foreground">{plant.variety}</p>}
          <div className="flex gap-2 mt-2">
            <Badge variant="secondary" className="capitalize">{plant.category}</Badge>
            <Badge variant="outline" className="capitalize">{plant.growingMethod}</Badge>
            {plant.systemType && <Badge variant="outline">{plant.systemType}</Badge>}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Planted {format(new Date(plant.plantedDate), 'PPP')} ({age} old)
          </p>
          {plant.location && (
            <p className="text-sm text-muted-foreground">Location: {plant.location}</p>
          )}
        </div>
        <Button variant="destructive" size="sm" onClick={handleDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Photo Gallery */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Photos</CardTitle>
              <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-4 w-4 mr-1" />
                Add Photo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </CardHeader>
            <CardContent>
              {photos.length === 0 ? (
                <div className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}>
                  <div className="text-center text-muted-foreground">
                    <Camera className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Add your first photo</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden bg-muted">
                      {photoUrls[photo.id!] ? (
                        <img
                          src={photoUrls[photo.id!]}
                          alt="Plant photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Leaf className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <button
                        onClick={() => photo.id && deletePhoto(photo.id)}
                        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1">
                        {format(new Date(photo.createdAt), 'PP')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Timeline</CardTitle>
              <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
                <DialogTrigger render={<span />}>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    placeholder="What's happening with this plant?"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={handleAddNote} className="bg-green-600 hover:bg-green-700">
                    Add Note
                  </Button>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-sm text-muted-foreground">No log entries yet.</p>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div key={entry.id} className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{entry.title}</p>
                        {entry.content && <p className="text-sm text-muted-foreground">{entry.content}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(entry.createdAt), 'PPp')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">
                        {entry.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Health Tags */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Health Status</CardTitle>
              <Dialog open={showHealthDialog} onOpenChange={setShowHealthDialog}>
                <DialogTrigger render={<span />}>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Health Tag</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newTagCategory} onValueChange={(v) => v && setNewTagCategory(v as HealthTagCategory)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overall">Overall</SelectItem>
                          <SelectItem value="pest">Pest</SelectItem>
                          <SelectItem value="disease">Disease</SelectItem>
                          <SelectItem value="nutrient">Nutrient</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        placeholder="e.g. Aphids, Nitrogen deficiency"
                        value={newTagValue}
                        onChange={(e) => setNewTagValue(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select value={newTagSeverity} onValueChange={(v) => v && setNewTagSeverity(v as HealthSeverity)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddHealthTag} className="w-full bg-green-600 hover:bg-green-700">
                      Add Tag
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {(!plant.healthTags || plant.healthTags.length === 0) ? (
                <p className="text-sm text-muted-foreground">No health tags</p>
              ) : (
                <div className="space-y-2">
                  {plant.healthTags.map((tag, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 p-2 rounded-lg border">
                      <div>
                        <Badge
                          variant={tag.severity === 'high' ? 'destructive' : tag.severity === 'medium' ? 'default' : 'secondary'}
                          className="text-xs capitalize mb-1"
                        >
                          {tag.category}
                        </Badge>
                        <p className="text-sm">{tag.value}</p>
                      </div>
                      <button onClick={() => handleRemoveHealthTag(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Yield Tracker */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Yield Tracker</CardTitle>
              <Dialog open={showYieldDialog} onOpenChange={setShowYieldDialog}>
                <DialogTrigger render={<span />}>
                  <Button size="sm" variant="outline">
                    <Scale className="h-4 w-4 mr-1" />
                    Log
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Harvest</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Amount (grams)</Label>
                      <Input
                        type="number"
                        min={1}
                        placeholder="e.g. 250"
                        value={yieldAmount}
                        onChange={(e) => setYieldAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quality Rating</Label>
                      <Select value={yieldRatingInput} onValueChange={(v) => v && setYieldRatingInput(v as YieldRating)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very_low">Very Low</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="very_high">Very High</SelectItem>
                          <SelectItem value="exceptional">Exceptional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes (optional)</Label>
                      <Input
                        placeholder="e.g. First harvest, nice color"
                        value={yieldNotes}
                        onChange={(e) => setYieldNotes(e.target.value)}
                      />
                    </div>
                    <Button onClick={handleAddYield} className="w-full bg-green-600 hover:bg-green-700">
                      Log Harvest
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {/* Overall yield rating from DB thresholds */}
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <Badge className={`${YIELD_RATING_COLORS[overallRating]} border-0`}>
                  {YIELD_RATING_LABELS[overallRating]}
                </Badge>
                <span className="text-sm font-medium ml-auto">
                  {totalGrams > 1000
                    ? `${(totalGrams / 1000).toFixed(1)} kg`
                    : `${totalGrams} g`}
                </span>
              </div>

              {/* Expected yield from DB */}
              {yieldRef && (
                <div className="rounded-lg border bg-muted/40 p-2.5 mb-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected yield</span>
                    <span className="font-medium">
                      {yieldRef.expectedYieldGramsPerPlant > 1000
                        ? `${(yieldRef.expectedYieldGramsPerPlant / 1000).toFixed(1)} kg`
                        : `${yieldRef.expectedYieldGramsPerPlant} g`}
                      /plant
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Days to harvest</span>
                    <span className="font-medium">{yieldRef.daysToFirstHarvest}–{yieldRef.daysToLastHarvest}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Harvests/season</span>
                    <span className="font-medium">{yieldRef.harvestsPerSeason}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1.5">
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span>Progress</span>
                      <span>{Math.min(100, Math.round((totalGrams / yieldRef.expectedYieldGramsPerPlant) * 100))}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (totalGrams / yieldRef.expectedYieldGramsPerPlant) * 100)}%` }}
                      />
                    </div>
                  </div>
                  {yieldRef.tips && (
                    <p className="text-muted-foreground italic mt-1.5">{yieldRef.tips}</p>
                  )}
                </div>
              )}

              {/* Harvest log */}
              {yieldRecords.length === 0 ? (
                <p className="text-sm text-muted-foreground">No harvests logged yet</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {yieldRecords.map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between gap-2 text-xs p-1.5 rounded border">
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{rec.amountGrams}g</span>
                        <Badge className={`ml-1.5 text-[10px] ${YIELD_RATING_COLORS[rec.rating]} border-0`}>
                          {YIELD_RATING_LABELS[rec.rating]}
                        </Badge>
                        {rec.notes && <p className="text-muted-foreground truncate mt-0.5">{rec.notes}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-muted-foreground">{format(new Date(rec.harvestedAt), 'MM/dd')}</span>
                        <button onClick={() => rec.id && deleteYield(rec.id)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-2">
                {harvestCount} harvest{harvestCount !== 1 ? 's' : ''} total
              </p>
            </CardContent>
          </Card>

          {/* Tags */}
          {plant.tags && plant.tags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {plant.tags.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {plant.notes && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{plant.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Seed Packet */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Seed Packet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted">
                <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Upload seed packet photo</p>
                <p className="text-xs text-muted-foreground">OCR will extract planting info</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

async function createThumbnail(file: File, maxSize: number): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxSize / img.width, maxSize / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob || new Blob());
      }, 'image/jpeg', 0.7);
    };
    img.src = url;
  });
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="text-sm font-medium">{children}</label>;
}
