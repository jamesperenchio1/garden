'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { nutrientBrands, nutrientTargets, getNutrientTarget } from '@/data/nutrient-brands';

export default function NutrientsPage() {
  // Simple mode
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedPlant, setSelectedPlant] = useState('');
  const [waterVolume, setWaterVolume] = useState(10);

  // Advanced mode
  const [advPlant, setAdvPlant] = useState('');
  const [advStage, setAdvStage] = useState('');
  const [advVolume, setAdvVolume] = useState(10);
  const [sourceEC, setSourceEC] = useState(0.2);

  const brand = nutrientBrands.find((b) => b.name === selectedBrand);
  const target = getNutrientTarget(advPlant, advStage);
  const uniquePlants = [...new Set(nutrientTargets.map((t) => t.plant))];
  const stagesForPlant = nutrientTargets.filter((t) => t.plant === advPlant).map((t) => t.stage);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="simple">
        <TabsList>
          <TabsTrigger value="simple">Simple Mode</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Mode</TabsTrigger>
        </TabsList>

        <TabsContent value="simple" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nutrient Mixing Calculator</CardTitle>
                <CardDescription>Select your brand and plant for mixing ratios</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nutrient Brand</Label>
                  <Select value={selectedBrand} onValueChange={(v) => v && setSelectedBrand(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {nutrientBrands.map((b) => (
                        <SelectItem key={b.name} value={b.name}>
                          {b.name} {b.availableInThailand ? '(Available in TH)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Plant Type</Label>
                  <Select value={selectedPlant} onValueChange={(v) => v && setSelectedPlant(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plant" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniquePlants.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Water Volume (Liters)</Label>
                  <Input
                    type="number"
                    value={waterVolume}
                    onChange={(e) => setWaterVolume(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </CardContent>
            </Card>

            {brand && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mixing Instructions</CardTitle>
                  <CardDescription>{brand.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {brand.products.map((product) => (
                      <div key={product.name} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{product.name}</span>
                          {product.npk && <Badge variant="outline" className="text-xs">NPK: {product.npk}</Badge>}
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {(product.mixingRatio.ml * waterVolume / product.mixingRatio.perLiters).toFixed(1)} ml
                        </p>
                        <p className="text-sm text-muted-foreground">
                          for {waterVolume}L ({product.mixingRatio.ml}ml per {product.mixingRatio.perLiters}L)
                        </p>
                        <div className="flex gap-2 mt-2">
                          {product.stage.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs capitalize">{s}</Badge>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Target pH: {product.targetPH.min}-{product.targetPH.max} | Target EC: {product.targetEC.min}-{product.targetEC.max}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="mt-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Nutrient Formulation</CardTitle>
                <CardDescription>Calculate exact nutrient amounts for your setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Plant</Label>
                  <Select value={advPlant} onValueChange={(v) => { if (v) { setAdvPlant(v); setAdvStage(''); } }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plant" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniquePlants.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Growth Stage</Label>
                  <Select value={advStage} onValueChange={(v) => v && setAdvStage(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stagesForPlant.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Water Volume (Liters)</Label>
                  <Input type="number" value={advVolume} onChange={(e) => setAdvVolume(Number(e.target.value))} min={1} />
                </div>

                <div className="space-y-2">
                  <Label>Source Water EC (mS/cm)</Label>
                  <Input type="number" value={sourceEC} onChange={(e) => setSourceEC(Number(e.target.value))} step={0.1} min={0} />
                </div>
              </CardContent>
            </Card>

            {target && (
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Target Values</CardTitle>
                    <CardDescription>{target.plant} - {target.stage}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Target EC</p>
                        <p className="text-lg font-bold">{target.ec.min} - {target.ec.max} mS/cm</p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground">Target pH</p>
                        <p className="text-lg font-bold">{target.ph.min} - {target.ph.max}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Macronutrients (ppm for {advVolume}L)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-green-50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Nitrogen (N)</p>
                        <p className="text-xl font-bold text-green-700">{target.npk.n}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Phosphorus (P)</p>
                        <p className="text-xl font-bold text-blue-700">{target.npk.p}</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Potassium (K)</p>
                        <p className="text-xl font-bold text-orange-700">{target.npk.k}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Secondary + Micronutrients (ppm)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      {Object.entries(target.micronutrients).map(([key, value]) => (
                        <div key={key} className="p-2 bg-muted rounded text-center">
                          <p className="text-xs text-muted-foreground uppercase">{key}</p>
                          <p className="font-semibold">{value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
