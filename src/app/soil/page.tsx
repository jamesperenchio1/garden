'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Mountain } from 'lucide-react';
import { db } from '@/lib/db';
import type { SoilBed } from '@/types/companion';

export default function SoilPage() {
  const [beds, setBeds] = useState<SoilBed[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const allBeds = await db.soilBeds.toArray();
      setBeds(allBeds);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="beds">
        <TabsList>
          <TabsTrigger value="beds">Garden Beds</TabsTrigger>
          <TabsTrigger value="amendments">Soil Management</TabsTrigger>
        </TabsList>

        <TabsContent value="beds" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold">My Garden Beds</h3>
              <p className="text-sm text-muted-foreground">Design bed layouts and manage plant spacing</p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              New Bed
            </Button>
          </div>

          {beds.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Mountain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No garden beds yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first garden bed to plan plant placement and spacing.
                </p>
                <p className="text-sm text-muted-foreground">
                  Visual bed designer with companion planting overlay and spacing guides coming soon.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {beds.map((bed) => (
                <Card key={bed.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{bed.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {bed.width}cm x {bed.length}cm
                    </p>
                    {bed.ph && (
                      <Badge variant="outline" className="text-xs mt-2">pH: {bed.ph}</Badge>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {bed.plants.length} plants | {bed.amendments.length} amendments
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="amendments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Soil Management Guide</CardTitle>
              <CardDescription>Track amendments, pH, and fertilizer schedules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Common Thai Soil Amendments</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Rice Husk Charcoal (แกลบดำ)', use: 'Improves drainage, adds silica' },
                      { name: 'Coconut Coir (ขุยมะพร้าว)', use: 'Water retention, root aeration' },
                      { name: 'Vermicompost (มูลไส้เดือน)', use: 'Rich in nutrients, improves soil structure' },
                      { name: 'Dolomite Lime', use: 'Raises pH, adds calcium and magnesium' },
                      { name: 'Fish Meal (กระดูกปลา)', use: 'Slow-release nitrogen and phosphorus' },
                      { name: 'Bat Guano (มูลค้างคาว)', use: 'High phosphorus for flowering' },
                      { name: 'Neem Cake (กากสะเดา)', use: 'Natural pest deterrent + nitrogen' },
                      { name: 'EM (Effective Microorganisms)', use: 'Soil biology, decomposition' },
                    ].map((item) => (
                      <div key={item.name} className="p-3 rounded-lg border">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.use}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">pH Guide for Thai Soil</h4>
                  <div className="space-y-2">
                    <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                      <p className="font-medium text-sm">pH 4.5-5.5 (Very Acidic)</p>
                      <p className="text-xs text-muted-foreground">Common in tropical soils. Add lime to raise pH. Good for: blueberries, tea.</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                      <p className="font-medium text-sm">pH 5.5-6.0 (Acidic)</p>
                      <p className="text-xs text-muted-foreground">Typical Thai garden soil. Good for: sweet potato, tomato, chili.</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                      <p className="font-medium text-sm">pH 6.0-7.0 (Slightly Acidic to Neutral)</p>
                      <p className="text-xs text-muted-foreground">Ideal for most vegetables. Add organic matter to maintain. Good for: most crops.</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="font-medium text-sm">pH 7.0-8.0 (Alkaline)</p>
                      <p className="text-xs text-muted-foreground">Less common in Thailand. Add sulfur or peat to lower. Good for: asparagus, cabbage.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
