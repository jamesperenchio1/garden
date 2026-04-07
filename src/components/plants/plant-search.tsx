'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, Leaf, Check, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { searchPlants, type TreflePlant, type SearchMeta } from '@/lib/api/plants';
import { db } from '@/lib/db';
import type { CustomPlant } from '@/types/plant';

type ResultItem =
  | { source: 'custom'; plant: CustomPlant }
  | { source: 'trefle' | 'openfarm'; plant: TreflePlant };

interface PlantSearchProps {
  onSelect: (plant: TreflePlant) => void;
  onCustomSelect: (plant: CustomPlant) => void;
  selectedId: string | null;
}

export function PlantSearch({ onSelect, onCustomSelect, selectedId }: PlantSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      setHint(null);
      return;
    }

    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setLoading(true);
      setError(null);
      setHint(null);

      try {
        let remote: TreflePlant[] = [];
        let meta: SearchMeta | undefined;
        const [customs, searchResult] = await Promise.all([
          db.customPlants
            .filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
            .toArray(),
          searchPlants(q, ac.signal).catch(() => {
            if (!ac.signal.aborted)
              setError('Plant databases unreachable — showing local results only.');
            return { data: [], meta: undefined };
          }),
        ]);

        if ('data' in searchResult) {
          remote = searchResult.data ?? [];
          meta = searchResult.meta;
        }

        if (!ac.signal.aborted) {
          // Surface helpful hints about data source status
          if (meta?.sources.trefle === 'no_token' && meta?.sources.openfarm !== 'ok') {
            setHint('No Trefle API key configured and OpenFarm returned no results. Add TREFLE_TOKEN to .env.local for better search.');
          } else if (meta?.sources.trefle === 'no_token') {
            setHint('Results from OpenFarm only. Add TREFLE_TOKEN to .env.local for more plants.');
          }

          setResults([
            ...customs.map((p): ResultItem => ({ source: 'custom', plant: p })),
            ...remote.map((p): ResultItem => ({
              source: (p.source ?? 'trefle') as 'trefle' | 'openfarm',
              plant: p,
            })),
          ]);
        }
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search plants — e.g. tomato, basil, lavender…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 h-11 text-base"
          autoFocus
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {hint && (
        <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-2 rounded-md">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{hint}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-80 overflow-y-auto border rounded-lg divide-y">
          {results.map((res, i) => {
            const key = `${res.source}-${i}`;

            if (res.source === 'custom') {
              const cp = res.plant as CustomPlant;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onCustomSelect(cp)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 text-left transition-colors"
                >
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                    <Leaf className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{cp.name}</p>
                    {cp.scientificName && (
                      <p className="text-xs text-muted-foreground italic truncate">
                        {cp.scientificName}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    Saved
                  </Badge>
                </button>
              );
            }

            const tp = res.plant as TreflePlant;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onSelect(tp)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 text-left transition-colors"
              >
                {tp.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tp.image_url}
                    alt=""
                    className="h-10 w-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                    <Leaf className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">
                    {tp.common_name ?? tp.scientific_name}
                  </p>
                  <p className="text-xs text-muted-foreground italic truncate">
                    {tp.scientific_name}
                  </p>
                  {tp.family && (
                    <p className="text-[10px] text-muted-foreground truncate">
                      {tp.family}
                    </p>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {res.source === 'openfarm' ? 'OpenFarm' : 'Trefle'}
                </Badge>
                {selectedId === tp.id && (
                  <Check className="h-4 w-4 text-green-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {query.trim().length >= 2 && !loading && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No plants found for &ldquo;{query}&rdquo;
        </p>
      )}
    </div>
  );
}
