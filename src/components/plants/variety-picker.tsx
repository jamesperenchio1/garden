'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Loader2, Leaf } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { searchVarieties, type TreflePlant } from '@/lib/api/plants';

interface VarietyPickerProps {
  plantName: string;
  onSelect: (variety: TreflePlant) => void;
  onSkip: () => void;
}

export function VarietyPicker({ plantName, onSelect, onSkip }: VarietyPickerProps) {
  const [filter, setFilter] = useState('');
  const [varieties, setVarieties] = useState<TreflePlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setError(null);

    searchVarieties(plantName, ac.signal)
      .then((data) => {
        if (!ac.signal.aborted) setVarieties(data);
      })
      .catch(() => {
        if (!ac.signal.aborted) setError('Could not load varieties.');
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [plantName]);

  const filtered = useMemo(() => {
    const f = filter.toLowerCase().trim();
    if (!f) return varieties;
    return varieties.filter(
      (v) =>
        (v.common_name ?? '').toLowerCase().includes(f) ||
        (v.scientific_name ?? '').toLowerCase().includes(f),
    );
  }, [varieties, filter]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">
            Varieties of{' '}
            <span className="text-green-600 capitalize">{plantName}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {loading
              ? 'Loading from Trefle + OpenFarm…'
              : `${varieties.length} varieties found — type to narrow down`}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onSkip} className="shrink-0">
          Skip
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter varieties…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>

      {error && <p className="text-xs text-amber-600">{error}</p>}

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="max-h-72 overflow-y-auto border rounded-lg divide-y">
          {filtered.map((v, i) => (
            <button
              key={`${v.id}-${i}`}
              type="button"
              onClick={() => onSelect(v)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted/50 text-left transition-colors"
            >
              {v.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.image_url}
                  alt=""
                  className="h-9 w-9 rounded object-cover shrink-0"
                />
              ) : (
                <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0">
                  <Leaf className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {v.common_name ?? v.scientific_name}
                </p>
                {v.scientific_name && (
                  <p className="text-xs text-muted-foreground italic truncate">
                    {v.scientific_name}
                  </p>
                )}
              </div>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {v.source === 'openfarm' ? 'OpenFarm' : 'Trefle'}
              </Badge>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          {filter.trim()
            ? `No varieties match "${filter}"`
            : 'No varieties found'}
        </p>
      )}
    </div>
  );
}
