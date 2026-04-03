'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SoilBed } from '@/types/companion';

const SOIL_TYPES = [
  'Sandy Loam',
  'Clay Loam',
  'Silty Loam',
  'Sandy Clay',
  'Peat-based Mix',
  'Coconut Coir Mix',
  'Red Laterite (Thai)',
  'Alluvial (Thai River)',
  'Custom Mix',
];

interface BedFormProps {
  initial?: Partial<SoilBed>;
  onSave: (data: Omit<SoilBed, 'id' | 'createdAt' | 'updatedAt' | 'plants' | 'amendments'>) => void;
  onCancel?: () => void;
  saving?: boolean;
}

export function BedForm({ initial, onSave, onCancel, saving }: BedFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [width, setWidth] = useState(String(initial?.width ?? 120));
  const [length, setLength] = useState(String(initial?.length ?? 240));
  const [soilType, setSoilType] = useState(initial?.soilType ?? '');
  const [ph, setPh] = useState(String(initial?.ph ?? ''));
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Bed name is required';
    const w = Number(width);
    const l = Number(length);
    if (!width || isNaN(w) || w < 10 || w > 2000) e.width = 'Width must be 10–2000 cm';
    if (!length || isNaN(l) || l < 10 || l > 2000) e.length = 'Length must be 10–2000 cm';
    if (ph) {
      const p = Number(ph);
      if (isNaN(p) || p < 0 || p > 14) e.ph = 'pH must be 0–14';
    }
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSave({
      name: name.trim(),
      width: Number(width),
      length: Number(length),
      soilType: soilType || undefined,
      ph: ph ? Number(ph) : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="bed-name">Bed Name *</Label>
        <Input
          id="bed-name"
          placeholder="e.g. Front Raised Bed"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: '' }));
          }}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="bed-width">Width (cm) *</Label>
          <Input
            id="bed-width"
            type="number"
            min={10}
            max={2000}
            placeholder="120"
            value={width}
            onChange={(e) => {
              setWidth(e.target.value);
              setErrors((prev) => ({ ...prev, width: '' }));
            }}
          />
          {errors.width && <p className="text-xs text-destructive">{errors.width}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="bed-length">Length (cm) *</Label>
          <Input
            id="bed-length"
            type="number"
            min={10}
            max={2000}
            placeholder="240"
            value={length}
            onChange={(e) => {
              setLength(e.target.value);
              setErrors((prev) => ({ ...prev, length: '' }));
            }}
          />
          {errors.length && <p className="text-xs text-destructive">{errors.length}</p>}
        </div>
      </div>

      {/* Soil type */}
      <div className="space-y-1">
        <Label>Soil Type</Label>
        <Select
          value={soilType}
          onValueChange={(v) => v && setSoilType(v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select soil type…" />
          </SelectTrigger>
          <SelectContent>
            {SOIL_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* pH */}
      <div className="space-y-1">
        <Label htmlFor="bed-ph">Soil pH (optional)</Label>
        <Input
          id="bed-ph"
          type="number"
          min={0}
          max={14}
          step={0.1}
          placeholder="e.g. 6.5"
          value={ph}
          onChange={(e) => {
            setPh(e.target.value);
            setErrors((prev) => ({ ...prev, ph: '' }));
          }}
        />
        {errors.ph && <p className="text-xs text-destructive">{errors.ph}</p>}
        <p className="text-xs text-muted-foreground">
          Most Thai vegetables thrive at pH 5.5–7.0
        </p>
      </div>

      {/* Preview */}
      {width && length && !errors.width && !errors.length && (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Bed area: {Number(width)} × {Number(length)} cm ={' '}
          <span className="font-medium text-foreground">
            {((Number(width) * Number(length)) / 10000).toFixed(2)} m²
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>
          {saving ? 'Saving…' : initial?.name ? 'Update Bed' : 'Create Bed'}
        </Button>
      </div>
    </form>
  );
}
