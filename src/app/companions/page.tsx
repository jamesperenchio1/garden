'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Info, Leaf, CircleSlash } from 'lucide-react';
import {
  companionData,
  getAllCompanionPlants,
  getCompanionsFor,
  getCompanionship,
} from '@/data/companion-planting';
import type { Compatibility } from '@/types/companion';
import { db } from '@/lib/db';

type Strength = 'beneficial' | 'harmful' | 'neutral';

const cellClassFor = (c: Compatibility | undefined) => {
  if (!c) return 'bg-transparent hover:bg-muted/40';
  if (c === 'beneficial') return 'bg-emerald-500/70 hover:bg-emerald-500 text-white';
  if (c === 'harmful') return 'bg-rose-500/70 hover:bg-rose-500 text-white';
  return 'bg-amber-300/60 hover:bg-amber-300 text-amber-950';
};

const compatibilityLabels: Record<Compatibility, string> = {
  beneficial: 'Good Companion',
  harmful: 'Bad Companion',
  neutral: 'Neutral',
};

export default function CompanionsPage() {
  const [search, setSearch] = useState('');
  const [gridFilter, setGridFilter] = useState('');
  const [onlyMyPlants, setOnlyMyPlants] = useState(false);
  const [myPlantNames, setMyPlantNames] = useState<Set<string>>(new Set());
  const [selectedPlant1, setSelectedPlant1] = useState<string>('');
  const [selectedPlant2, setSelectedPlant2] = useState<string>('');
  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const plants = await db.plants.toArray();
      setMyPlantNames(new Set(plants.map((p) => p.name)));
    })();
  }, []);

  const allPlants = useMemo(() => getAllCompanionPlants(), []);
  const filteredLookupPlants = allPlants.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  const gridPlants = useMemo(() => {
    let list = allPlants;
    if (onlyMyPlants && myPlantNames.size > 0) {
      const lowered = new Set(Array.from(myPlantNames).map((n) => n.toLowerCase()));
      list = list.filter((p) => lowered.has(p.toLowerCase()));
    }
    if (gridFilter.trim()) {
      const q = gridFilter.toLowerCase();
      list = list.filter((p) => p.toLowerCase().includes(q));
    }
    return list;
  }, [allPlants, onlyMyPlants, myPlantNames, gridFilter]);

  const comparison =
    selectedPlant1 && selectedPlant2
      ? getCompanionship(selectedPlant1, selectedPlant2)
      : null;

  const plant1Companions = selectedPlant1 ? getCompanionsFor(selectedPlant1) : [];

  // Summary counts for quick-glance
  const summaryFor = (plant: string) => {
    const rels = getCompanionsFor(plant);
    const counts: Record<Strength, number> = { beneficial: 0, harmful: 0, neutral: 0 };
    rels.forEach((r) => {
      counts[r.compatibility] += 1;
    });
    return counts;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lookup">
        <TabsList>
          <TabsTrigger value="lookup">Quick Lookup</TabsTrigger>
          <TabsTrigger value="grid">Compatibility Grid</TabsTrigger>
        </TabsList>

        {/* ======================== QUICK LOOKUP TAB ======================= */}
        <TabsContent value="lookup" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Pick two plants to compare</CardTitle>
                <CardDescription>
                  Click a plant to set it as Plant A, click another for Plant B.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search plants..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {filteredLookupPlants.map((plant) => {
                    const summary = summaryFor(plant);
                    const isMine = myPlantNames.has(plant);
                    return (
                      <button
                        key={plant}
                        onClick={() => {
                          if (!selectedPlant1 || selectedPlant1 === plant) {
                            setSelectedPlant1(plant);
                          } else {
                            setSelectedPlant2(plant);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-muted transition-colors flex items-center gap-2 ${
                          plant === selectedPlant1
                            ? 'bg-emerald-100 font-medium dark:bg-emerald-900/40'
                            : plant === selectedPlant2
                              ? 'bg-sky-100 font-medium dark:bg-sky-900/40'
                              : ''
                        }`}
                      >
                        <span className="flex-1 truncate">{plant}</span>
                        {isMine && (
                          <Leaf className="h-3 w-3 text-emerald-600" aria-label="In your garden" />
                        )}
                        <span className="text-[10px] text-emerald-600">{summary.beneficial}+</span>
                        <span className="text-[10px] text-rose-600">{summary.harmful}−</span>
                      </button>
                    );
                  })}
                  {filteredLookupPlants.length === 0 && (
                    <p className="text-xs text-muted-foreground italic px-2 py-1">
                      No plants match.
                    </p>
                  )}
                </div>

                {(selectedPlant1 || selectedPlant2) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPlant1('');
                      setSelectedPlant2('');
                    }}
                    className="h-7 text-xs"
                  >
                    Clear selection
                  </Button>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              {selectedPlant1 && selectedPlant2 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {selectedPlant1} + {selectedPlant2}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comparison ? (
                      <div
                        className={`p-4 rounded-lg border ${
                          comparison.compatibility === 'beneficial'
                            ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20'
                            : comparison.compatibility === 'harmful'
                              ? 'bg-rose-50 border-rose-200 dark:bg-rose-900/20'
                              : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20'
                        }`}
                      >
                        <Badge>{compatibilityLabels[comparison.compatibility]}</Badge>
                        <p className="text-sm mt-2 leading-relaxed">{comparison.reason}</p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg border bg-muted/40 flex items-center gap-2">
                        <CircleSlash className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No documented interaction — treat as neutral.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedPlant1 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Companions for {selectedPlant1}
                    </CardTitle>
                    <CardDescription>
                      {plant1Companions.length} documented relationships
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plant1Companions.map((comp) => (
                        <div
                          key={comp.name}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            comp.compatibility === 'beneficial'
                              ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20'
                              : comp.compatibility === 'harmful'
                                ? 'bg-rose-50 border-rose-200 hover:bg-rose-100 dark:bg-rose-900/20'
                                : 'bg-amber-50 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20'
                          }`}
                          onClick={() => setSelectedPlant2(comp.name)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{comp.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {compatibilityLabels[comp.compatibility]}
                            </Badge>
                          </div>
                          <p className="text-xs leading-relaxed">{comp.reason}</p>
                        </div>
                      ))}
                      {plant1Companions.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          No documented companions.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ======================== GRID TAB =============================== */}
        <TabsContent value="grid" className="mt-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <CardTitle>Companion Planting Grid</CardTitle>
                  <CardDescription>
                    Hover to trace a pair. Click to open it in Quick Lookup.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Filter plants…"
                      value={gridFilter}
                      onChange={(e) => setGridFilter(e.target.value)}
                      className="pl-7 h-8 w-44 text-xs"
                    />
                  </div>
                  <Button
                    variant={onlyMyPlants ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs"
                    disabled={myPlantNames.size === 0}
                    onClick={() => setOnlyMyPlants((v) => !v)}
                  >
                    <Leaf className="h-3 w-3 mr-1" />
                    Only my plants ({myPlantNames.size})
                  </Button>
                </div>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-emerald-500/70" /> Beneficial
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-rose-500/70" /> Harmful
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded bg-amber-300/60" /> Neutral
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-block w-3 h-3 rounded border" /> No data
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {gridPlants.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No plants match your filters.
                </p>
              ) : (
                <div className="overflow-auto max-h-[70vh] border rounded-md">
                  <table className="text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky left-0 top-0 z-20 bg-background border-b border-r p-1" />
                        {gridPlants.map((p) => (
                          <th
                            key={p}
                            className={`sticky top-0 bg-background border-b p-1 min-w-[28px] align-bottom ${
                              hoverCol === p ? 'bg-muted' : ''
                            }`}
                          >
                            <span className="inline-block transform -rotate-45 origin-bottom-left whitespace-nowrap text-[10px] translate-x-2">
                              {p}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gridPlants.map((plant1) => (
                        <tr key={plant1} className={hoverRow === plant1 ? 'bg-muted/50' : ''}>
                          <td
                            className={`sticky left-0 z-10 bg-background border-r p-1 pr-2 font-medium whitespace-nowrap text-[11px] ${
                              hoverRow === plant1 ? 'bg-muted' : ''
                            }`}
                          >
                            {plant1}
                          </td>
                          {gridPlants.map((plant2) => {
                            if (plant1 === plant2) {
                              return (
                                <td
                                  key={plant2}
                                  className="text-center bg-muted/60 border-b border-r/20"
                                >
                                  ·
                                </td>
                              );
                            }
                            const rel = getCompanionship(plant1, plant2);
                            return (
                              <td
                                key={plant2}
                                className={`text-center cursor-pointer w-7 h-7 border-b border-r border-border/30 transition-colors ${cellClassFor(rel?.compatibility)}`}
                                title={
                                  rel
                                    ? `${plant1} + ${plant2}: ${rel.reason}`
                                    : `${plant1} + ${plant2}: no data`
                                }
                                onMouseEnter={() => {
                                  setHoverRow(plant1);
                                  setHoverCol(plant2);
                                }}
                                onMouseLeave={() => {
                                  setHoverRow(null);
                                  setHoverCol(null);
                                }}
                                onClick={() => {
                                  setSelectedPlant1(plant1);
                                  setSelectedPlant2(plant2);
                                }}
                              >
                                {rel?.compatibility === 'beneficial'
                                  ? '+'
                                  : rel?.compatibility === 'harmful'
                                    ? '−'
                                    : rel
                                      ? '~'
                                      : ''}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Why panel — shows details for the hovered pair. */}
              {hoverRow && hoverCol && hoverRow !== hoverCol && (
                <WhyPanel row={hoverRow} col={hoverCol} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function WhyPanel({ row, col }: { row: string; col: string }) {
  const rel = getCompanionship(row, col);
  return (
    <div className="mt-3 p-3 rounded-lg border bg-muted/40 flex items-start gap-2">
      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium">
          {row} × {col}
        </p>
        {rel ? (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {compatibilityLabels[rel.compatibility]} — {rel.reason}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">
            No documented interaction between these plants.
          </p>
        )}
      </div>
    </div>
  );
}
