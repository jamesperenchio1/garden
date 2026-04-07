'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Info, Leaf, CircleSlash, AlertTriangle, ThumbsUp, Sprout, ShoppingCart } from 'lucide-react';
import {
  companionData,
  getAllCompanionPlants,
  getCompanionsFor,
  getCompanionship,
} from '@/data/companion-planting';
import type { Compatibility } from '@/types/companion';
import { db } from '@/lib/db';
import type { Plant } from '@/types/plant';

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

const compatColors: Record<Compatibility, string> = {
  beneficial: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20',
  harmful: 'bg-rose-50 border-rose-200 dark:bg-rose-900/20',
  neutral: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20',
};

export default function CompanionsPage() {
  const [search, setSearch] = useState('');
  const [gridFilter, setGridFilter] = useState('');
  const [onlyMyPlants, setOnlyMyPlants] = useState(false);
  const [myPlants, setMyPlants] = useState<Plant[]>([]);
  const [myPlantNames, setMyPlantNames] = useState<Set<string>>(new Set());
  const [selectedPlant1, setSelectedPlant1] = useState<string>('');
  const [selectedPlant2, setSelectedPlant2] = useState<string>('');
  const [hoverRow, setHoverRow] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const plants = await db.plants.toArray();
      setMyPlants(plants);
      setMyPlantNames(new Set(plants.map((p) => p.name)));
    })();
  }, []);

  const allPlants = useMemo(() => getAllCompanionPlants(), []);
  const filteredLookupPlants = allPlants.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase()),
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

  const summaryFor = (plant: string) => {
    const rels = getCompanionsFor(plant);
    const counts: Record<Strength, number> = { beneficial: 0, harmful: 0, neutral: 0 };
    rels.forEach((r) => { counts[r.compatibility] += 1; });
    return counts;
  };

  // ── My Garden analysis ──────────────────────────────────────────────────
  const gardenAnalysis = useMemo(() => {
    const names = Array.from(myPlantNames);
    const pairs: { plant1: string; plant2: string; compatibility: Compatibility; reason: string }[] = [];
    const warnings: typeof pairs = [];
    const good: typeof pairs = [];

    // Check all pairs of my plants
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const rel = getCompanionship(names[i], names[j]);
        if (rel) {
          const entry = { plant1: names[i], plant2: names[j], compatibility: rel.compatibility, reason: rel.reason };
          pairs.push(entry);
          if (rel.compatibility === 'harmful') warnings.push(entry);
          if (rel.compatibility === 'beneficial') good.push(entry);
        }
      }
    }

    // Suggestions: plants NOT in my garden that would benefit what I have
    const suggestions: { plant: string; benefitsCount: number; benefits: string[] }[] = [];
    const myLowered = new Set(names.map((n) => n.toLowerCase()));
    const allKnown = getAllCompanionPlants();

    for (const candidate of allKnown) {
      if (myLowered.has(candidate.toLowerCase())) continue;
      const rels = getCompanionsFor(candidate);
      const benefitsMyPlants = rels.filter(
        (r) => r.compatibility === 'beneficial' && myLowered.has(r.name.toLowerCase()),
      );
      if (benefitsMyPlants.length >= 2) {
        suggestions.push({
          plant: candidate,
          benefitsCount: benefitsMyPlants.length,
          benefits: benefitsMyPlants.map((r) => r.name),
        });
      }
    }
    suggestions.sort((a, b) => b.benefitsCount - a.benefitsCount);

    return { pairs, warnings, good, suggestions: suggestions.slice(0, 10) };
  }, [myPlantNames]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="garden">
        <TabsList>
          <TabsTrigger value="garden">
            <Leaf className="h-3.5 w-3.5 mr-1" />
            My Garden
          </TabsTrigger>
          <TabsTrigger value="lookup">Quick Lookup</TabsTrigger>
          <TabsTrigger value="grid">Compatibility Grid</TabsTrigger>
        </TabsList>

        {/* ==================== MY GARDEN TAB ============================= */}
        <TabsContent value="garden" className="mt-4 space-y-4">
          {myPlants.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No plants yet</h3>
                <p className="text-muted-foreground">
                  Add plants to see companion relationships and suggestions.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{gardenAnalysis.good.length}</p>
                    <p className="text-xs text-muted-foreground">Beneficial pairs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-red-600">{gardenAnalysis.warnings.length}</p>
                    <p className="text-xs text-muted-foreground">Conflicts</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{myPlantNames.size}</p>
                    <p className="text-xs text-muted-foreground">Plants</p>
                  </CardContent>
                </Card>
              </div>

              {/* Warnings */}
              {gardenAnalysis.warnings.length > 0 && (
                <Card className="border-red-200 dark:border-red-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-400">
                      <AlertTriangle className="h-4 w-4" />
                      Garden Conflicts
                    </CardTitle>
                    <CardDescription>
                      These plants in your garden don&apos;t get along.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {gardenAnalysis.warnings.map((w, i) => (
                      <div key={i} className="p-3 rounded-lg border bg-rose-50 border-rose-200 dark:bg-rose-900/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{w.plant1} + {w.plant2}</span>
                          <Badge variant="outline" className="text-xs text-red-600">Harmful</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{w.reason}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Good pairs */}
              {gardenAnalysis.good.length > 0 && (
                <Card className="border-green-200 dark:border-green-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-green-700 dark:text-green-400">
                      <ThumbsUp className="h-4 w-4" />
                      Beneficial Pairs in Your Garden
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {gardenAnalysis.good.map((g, i) => (
                      <div key={i} className="p-3 rounded-lg border bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{g.plant1} + {g.plant2}</span>
                          <Badge variant="outline" className="text-xs text-green-600">Beneficial</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{g.reason}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {gardenAnalysis.suggestions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-blue-600" />
                      Suggested Plants to Add
                    </CardTitle>
                    <CardDescription>
                      These plants would benefit multiple things you&apos;re already growing.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {gardenAnalysis.suggestions.map((s, i) => (
                      <div key={i} className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{s.plant}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            Benefits {s.benefitsCount} of your plants
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {s.benefits.map((b) => (
                            <Badge key={b} variant="outline" className="text-[10px]">
                              {b}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Per-plant breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Per-Plant Companion Map</CardTitle>
                  <CardDescription>
                    What each of your plants likes and dislikes (from the full database).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.from(myPlantNames).sort().map((name) => {
                    const companions = getCompanionsFor(name);
                    if (companions.length === 0) return null;
                    const beneficial = companions.filter((c) => c.compatibility === 'beneficial');
                    const harmful = companions.filter((c) => c.compatibility === 'harmful');
                    return (
                      <details key={name} className="group">
                        <summary className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-muted transition-colors">
                          <Sprout className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-sm font-medium flex-1">{name}</span>
                          <span className="text-[10px] text-emerald-600">{beneficial.length}+</span>
                          <span className="text-[10px] text-rose-600">{harmful.length}−</span>
                        </summary>
                        <div className="ml-6 mt-1 space-y-1">
                          {companions.map((c) => (
                            <div
                              key={c.name}
                              className={`px-3 py-1.5 rounded text-xs border ${compatColors[c.compatibility]}`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {c.name}
                                  {myPlantNames.has(c.name) && (
                                    <Leaf className="inline h-2.5 w-2.5 ml-1 text-emerald-600" />
                                  )}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {compatibilityLabels[c.compatibility]}
                                </span>
                              </div>
                              <p className="text-muted-foreground mt-0.5">{c.reason}</p>
                            </div>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ==================== QUICK LOOKUP TAB ========================== */}
        <TabsContent value="lookup" className="mt-4">
          <div
            className={selectedPlant1 ? 'grid md:grid-cols-2 gap-6' : 'max-w-2xl mx-auto'}
          >
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

                <div className="max-h-[60vh] overflow-y-auto space-y-1 pr-1">
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
                        {isMine && <Leaf className="h-3 w-3 text-emerald-600" />}
                        <span className="text-[10px] text-emerald-600">{summary.beneficial}+</span>
                        <span className="text-[10px] text-rose-600">{summary.harmful}−</span>
                      </button>
                    );
                  })}
                  {filteredLookupPlants.length === 0 && (
                    <p className="text-xs text-muted-foreground italic px-2 py-1">No plants match.</p>
                  )}
                </div>

                {(selectedPlant1 || selectedPlant2) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedPlant1(''); setSelectedPlant2(''); }}
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
                    <CardTitle className="text-base">{selectedPlant1} + {selectedPlant2}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {comparison ? (
                      <div className={`p-4 rounded-lg border ${compatColors[comparison.compatibility]}`}>
                        <Badge>{compatibilityLabels[comparison.compatibility]}</Badge>
                        <p className="text-sm mt-2 leading-relaxed">{comparison.reason}</p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg border bg-muted/40 flex items-center gap-2">
                        <CircleSlash className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">No documented interaction — treat as neutral.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedPlant1 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Companions for {selectedPlant1}</CardTitle>
                    <CardDescription>{plant1Companions.length} documented relationships</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plant1Companions.map((comp) => (
                        <div
                          key={comp.name}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors hover:opacity-80 ${compatColors[comp.compatibility]}`}
                          onClick={() => setSelectedPlant2(comp.name)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">
                              {comp.name}
                              {myPlantNames.has(comp.name) && (
                                <Leaf className="inline h-3 w-3 ml-1 text-emerald-600" />
                              )}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {compatibilityLabels[comp.compatibility]}
                            </Badge>
                          </div>
                          <p className="text-xs leading-relaxed">{comp.reason}</p>
                        </div>
                      ))}
                      {plant1Companions.length === 0 && (
                        <p className="text-sm text-muted-foreground">No documented companions.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ==================== GRID TAB ================================== */}
        <TabsContent value="grid" className="mt-4">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <CardTitle>Companion Planting Grid</CardTitle>
                  <CardDescription>Hover to trace a pair. Click to open it in Quick Lookup.</CardDescription>
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
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-emerald-500/70" /> Beneficial</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-rose-500/70" /> Harmful</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded bg-amber-300/60" /> Neutral</span>
                <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded border" /> No data</span>
              </div>
            </CardHeader>
            <CardContent>
              {gridPlants.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No plants match your filters.</p>
              ) : (
                <div className="overflow-auto max-h-[70vh] border rounded-md">
                  <table className="text-xs border-collapse">
                    <thead>
                      <tr>
                        <th className="sticky left-0 top-0 z-20 bg-background border-b border-r p-1" />
                        {gridPlants.map((p) => (
                          <th
                            key={p}
                            className={`sticky top-0 bg-background border-b p-1 min-w-[28px] align-bottom ${hoverCol === p ? 'bg-muted' : ''}`}
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
                          <td className={`sticky left-0 z-10 bg-background border-r p-1 pr-2 font-medium whitespace-nowrap text-[11px] ${hoverRow === plant1 ? 'bg-muted' : ''}`}>
                            {plant1}
                          </td>
                          {gridPlants.map((plant2) => {
                            if (plant1 === plant2) {
                              return <td key={plant2} className="text-center bg-muted/60 border-b border-r/20">·</td>;
                            }
                            const rel = getCompanionship(plant1, plant2);
                            return (
                              <td
                                key={plant2}
                                className={`text-center cursor-pointer w-7 h-7 border-b border-r border-border/30 transition-colors ${cellClassFor(rel?.compatibility)}`}
                                title={rel ? `${plant1} + ${plant2}: ${rel.reason}` : `${plant1} + ${plant2}: no data`}
                                onMouseEnter={() => { setHoverRow(plant1); setHoverCol(plant2); }}
                                onMouseLeave={() => { setHoverRow(null); setHoverCol(null); }}
                                onClick={() => { setSelectedPlant1(plant1); setSelectedPlant2(plant2); }}
                              >
                                {rel?.compatibility === 'beneficial' ? '+' : rel?.compatibility === 'harmful' ? '−' : rel ? '~' : ''}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

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
        <p className="text-xs font-medium">{row} × {col}</p>
        {rel ? (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {compatibilityLabels[rel.compatibility]} — {rel.reason}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground mt-0.5">No documented interaction between these plants.</p>
        )}
      </div>
    </div>
  );
}
