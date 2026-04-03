'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { companionData, getAllCompanionPlants, getCompanionsFor, getCompanionship } from '@/data/companion-planting';
import type { Compatibility } from '@/types/companion';

const compatibilityColors: Record<Compatibility, string> = {
  beneficial: 'bg-green-100 text-green-800 border-green-200',
  harmful: 'bg-red-100 text-red-800 border-red-200',
  neutral: 'bg-yellow-100 text-yellow-800 border-yellow-200',
};

const compatibilityLabels: Record<Compatibility, string> = {
  beneficial: 'Good Companion',
  harmful: 'Bad Companion',
  neutral: 'Neutral',
};

export default function CompanionsPage() {
  const [search, setSearch] = useState('');
  const [selectedPlant1, setSelectedPlant1] = useState<string>('');
  const [selectedPlant2, setSelectedPlant2] = useState<string>('');

  const allPlants = getAllCompanionPlants();
  const filteredPlants = allPlants.filter((p) =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  const comparison = selectedPlant1 && selectedPlant2
    ? getCompanionship(selectedPlant1, selectedPlant2)
    : null;

  const plant1Companions = selectedPlant1 ? getCompanionsFor(selectedPlant1) : [];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="lookup">
        <TabsList>
          <TabsTrigger value="lookup">Quick Lookup</TabsTrigger>
          <TabsTrigger value="grid">Compatibility Grid</TabsTrigger>
        </TabsList>

        <TabsContent value="lookup" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Plant Selection */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Select Plants to Compare</CardTitle>
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

                <div className="max-h-64 overflow-y-auto space-y-1">
                  {filteredPlants.map((plant) => (
                    <button
                      key={plant}
                      onClick={() => {
                        if (!selectedPlant1 || selectedPlant1 === plant) {
                          setSelectedPlant1(plant);
                        } else {
                          setSelectedPlant2(plant);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-muted transition-colors ${
                        plant === selectedPlant1 ? 'bg-green-100 font-medium' :
                        plant === selectedPlant2 ? 'bg-blue-100 font-medium' : ''
                      }`}
                    >
                      {plant}
                    </button>
                  ))}
                </div>

                {(selectedPlant1 || selectedPlant2) && (
                  <button
                    onClick={() => { setSelectedPlant1(''); setSelectedPlant2(''); }}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear selection
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Results */}
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
                      <div className={`p-4 rounded-lg border ${compatibilityColors[comparison.compatibility]}`}>
                        <Badge className={compatibilityColors[comparison.compatibility]}>
                          {compatibilityLabels[comparison.compatibility]}
                        </Badge>
                        <p className="text-sm mt-2">{comparison.reason}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No companion data available for this pair.</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {selectedPlant1 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">All companions for {selectedPlant1}</CardTitle>
                    <CardDescription>{plant1Companions.length} relationships found</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {plant1Companions.map((comp) => (
                        <div
                          key={comp.name}
                          className={`p-3 rounded-lg border cursor-pointer ${compatibilityColors[comp.compatibility]}`}
                          onClick={() => setSelectedPlant2(comp.name)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm">{comp.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {compatibilityLabels[comp.compatibility]}
                            </Badge>
                          </div>
                          <p className="text-xs">{comp.reason}</p>
                        </div>
                      ))}
                      {plant1Companions.length === 0 && (
                        <p className="text-sm text-muted-foreground">No companion data for this plant.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="grid" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Companion Planting Grid</CardTitle>
              <CardDescription>Click any cell to see details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="text-xs">
                  <thead>
                    <tr>
                      <th className="p-1 text-left sticky left-0 bg-white"></th>
                      {allPlants.slice(0, 20).map((plant) => (
                        <th key={plant} className="p-1 text-center writing-mode-vertical min-w-[30px]">
                          <span className="inline-block transform -rotate-45 whitespace-nowrap">{plant}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allPlants.slice(0, 20).map((plant1) => (
                      <tr key={plant1}>
                        <td className="p-1 font-medium sticky left-0 bg-white whitespace-nowrap">{plant1}</td>
                        {allPlants.slice(0, 20).map((plant2) => {
                          if (plant1 === plant2) return <td key={plant2} className="p-1 text-center bg-gray-100">-</td>;
                          const rel = getCompanionship(plant1, plant2);
                          return (
                            <td
                              key={plant2}
                              className={`p-1 text-center cursor-pointer ${
                                rel?.compatibility === 'beneficial' ? 'bg-green-200' :
                                rel?.compatibility === 'harmful' ? 'bg-red-200' :
                                rel ? 'bg-yellow-100' : ''
                              }`}
                              title={rel ? `${plant1} + ${plant2}: ${rel.reason}` : ''}
                              onClick={() => { setSelectedPlant1(plant1); setSelectedPlant2(plant2); }}
                            >
                              {rel?.compatibility === 'beneficial' ? '+' : rel?.compatibility === 'harmful' ? '-' : rel ? '~' : ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-200 rounded" /> Beneficial</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-200 rounded" /> Harmful</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-100 rounded" /> Neutral</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
