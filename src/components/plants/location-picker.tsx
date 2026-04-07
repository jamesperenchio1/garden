'use client';

import { useCallback, useEffect, useState } from 'react';
import { MapPin, Plus, X, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import type { GardenLocation } from '@/types/plant';

interface LocationPickerProps {
  selectedId: number | undefined;
  onSelect: (location: GardenLocation | null) => void;
  freeText: string;
  onFreeTextChange: (v: string) => void;
}

export function LocationPicker({
  selectedId,
  onSelect,
  freeText,
  onFreeTextChange,
}: LocationPickerProps) {
  const [locations, setLocations] = useState<GardenLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newZone, setNewZone] = useState('');

  const refresh = useCallback(async () => {
    const all = await db.locations.orderBy('zone').toArray();
    setLocations(all);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selected = locations.find((l) => l.id === selectedId);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    const id = await db.locations.add({
      name,
      zone: newZone.trim() || undefined,
      createdAt: new Date(),
    });
    const loc = await db.locations.get(id);
    if (loc) onSelect(loc);
    setNewName('');
    setNewZone('');
    setAdding(false);
    await refresh();
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.locations.delete(id);
    if (selectedId === id) onSelect(null);
    await refresh();
  };

  // Group locations by zone
  const zones = new Map<string, GardenLocation[]>();
  for (const loc of locations) {
    const z = loc.zone || 'Other';
    if (!zones.has(z)) zones.set(z, []);
    zones.get(z)!.push(loc);
  }

  return (
    <div className="space-y-1.5">
      {/* Selected display / toggle */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 h-9 px-3 rounded-md border bg-background text-sm text-left hover:bg-muted/50 transition-colors"
      >
        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className={`flex-1 truncate ${selected ? '' : 'text-muted-foreground'}`}>
          {selected
            ? `${selected.zone ? `${selected.zone} > ` : ''}${selected.name}`
            : freeText || 'Choose or add a location…'}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border rounded-lg bg-background shadow-sm">
          {/* Free text fallback */}
          <div className="p-2 border-b">
            <Input
              placeholder="Or type a custom location…"
              value={freeText}
              onChange={(e) => {
                onFreeTextChange(e.target.value);
                if (selectedId) onSelect(null);
              }}
              className="h-8 text-xs"
            />
          </div>

          {/* Saved locations */}
          {locations.length > 0 && (
            <div className="max-h-48 overflow-y-auto divide-y">
              {[...zones.entries()].map(([zone, locs]) => (
                <div key={zone}>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide px-3 py-1.5 bg-muted/30">
                    {zone}
                  </p>
                  {locs.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        onSelect(loc);
                        onFreeTextChange('');
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-muted/50 transition-colors ${
                        selectedId === loc.id ? 'bg-green-50 dark:bg-green-950/30' : ''
                      }`}
                    >
                      <span className="flex-1 truncate">{loc.name}</span>
                      {loc.description && (
                        <span className="text-[10px] text-muted-foreground truncate max-w-24">
                          {loc.description}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDelete(loc.id!, e)}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Add new */}
          <div className="p-2 border-t">
            {!adding ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setAdding(true)}
                className="w-full text-xs h-7"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add saved location
              </Button>
            ) : (
              <div className="space-y-1.5">
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    placeholder="Zone (e.g. Backyard)"
                    value={newZone}
                    onChange={(e) => setNewZone(e.target.value)}
                    className="h-7 text-xs"
                  />
                  <Input
                    placeholder="Name (e.g. Raised Bed A) *"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAdd();
                      }
                    }}
                    className="h-7 text-xs"
                    autoFocus
                  />
                </div>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAdd}
                    disabled={!newName.trim()}
                    className="h-6 text-[10px] bg-green-600 hover:bg-green-700"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAdding(false);
                      setNewName('');
                      setNewZone('');
                    }}
                    className="h-6 text-[10px]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
