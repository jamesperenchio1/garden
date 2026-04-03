'use client';

import { useState } from 'react';
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
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import type { PlantCategory, GrowingMethod, HealthTag } from '@/types/plant';

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
    });

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
