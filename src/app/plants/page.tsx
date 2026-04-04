'use client';

import { useState } from 'react';
import { usePlants } from '@/hooks/use-plants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Leaf, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState as useStatePlain } from 'react';
import { db } from '@/lib/db';
import { YIELD_RATING_LABELS, YIELD_RATING_COLORS, calculateYieldRating } from '@/hooks/use-yields';
import type { PlantCategory, GrowingMethod, YieldRating, YieldReference } from '@/types/plant';

export default function PlantsPage() {
  const { plants, loading } = usePlants();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Load yield totals and references from DB
  const [yieldTotals, setYieldTotals] = useStatePlain<Record<number, number>>({});
  const [yieldRefs, setYieldRefs] = useStatePlain<Record<string, YieldReference>>({});

  useEffect(() => {
    (async () => {
      // Get all yield records grouped by plantId
      const allRecords = await db.yieldRecords.toArray();
      const totals: Record<number, number> = {};
      for (const r of allRecords) {
        totals[r.plantId] = (totals[r.plantId] || 0) + r.amountGrams;
      }
      setYieldTotals(totals);

      // Get all references indexed by name
      const refs = await db.yieldReferences.toArray();
      const refMap: Record<string, YieldReference> = {};
      for (const r of refs) {
        refMap[r.plantName] = r;
      }
      setYieldRefs(refMap);
    })();
  }, [plants]);

  const filtered = plants.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.variety?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesMethod = methodFilter === 'all' || p.growingMethod === methodFilter;
    return matchesSearch && matchesCategory && matchesMethod;
  });

  const getHealthColor = (plant: typeof plants[0]) => {
    if (!plant.healthTags?.length) return 'bg-gray-100 text-gray-600';
    if (plant.healthTags.some((t) => t.severity === 'high')) return 'bg-red-100 text-red-600';
    if (plant.healthTags.some((t) => t.severity === 'medium')) return 'bg-amber-100 text-amber-600';
    return 'bg-green-100 text-green-600';
  };

  const getHealthLabel = (plant: typeof plants[0]) => {
    if (!plant.healthTags?.length) return 'No status';
    const overall = plant.healthTags.find((t) => t.category === 'overall');
    if (overall) return overall.value;
    if (plant.healthTags.some((t) => t.severity === 'high')) return 'Critical';
    if (plant.healthTags.some((t) => t.severity === 'medium')) return 'Watch';
    return 'Good';
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => v && setCategoryFilter(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="vegetable">Vegetable</SelectItem>
            <SelectItem value="herb">Herb</SelectItem>
            <SelectItem value="fruit">Fruit</SelectItem>
            <SelectItem value="flower">Flower</SelectItem>
            <SelectItem value="ornamental">Ornamental</SelectItem>
            <SelectItem value="medicinal">Medicinal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={methodFilter} onValueChange={(v) => v && setMethodFilter(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="soil">Soil</SelectItem>
            <SelectItem value="hydroponic">Hydroponic</SelectItem>
            <SelectItem value="aeroponic">Aeroponic</SelectItem>
            <SelectItem value="aquaponic">Aquaponic</SelectItem>
          </SelectContent>
        </Select>
        <Link href="/plants/new">
          <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Plant
          </Button>
        </Link>
      </div>

      {/* Plant Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-32 w-full mb-3" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {plants.length === 0 ? 'No plants yet' : 'No matching plants'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {plants.length === 0
                ? 'Start by adding your first plant to track its growth.'
                : 'Try adjusting your search or filters.'}
            </p>
            {plants.length === 0 && (
              <Link href="/plants/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Plant
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((plant) => (
            <Link key={plant.id} href={`/plants/${plant.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="h-32 bg-muted rounded-lg flex items-center justify-center mb-3">
                    <Leaf className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{plant.name}</h3>
                        {plant.variety && (
                          <p className="text-sm text-muted-foreground">{plant.variety}</p>
                        )}
                      </div>
                      <Badge className={`text-xs ${getHealthColor(plant)}`} variant="outline">
                        {getHealthLabel(plant)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {plant.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {plant.growingMethod}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Planted {formatDistanceToNow(new Date(plant.plantedDate), { addSuffix: true })}
                    </p>
                    {/* Yield rating from DB */}
                    {(() => {
                      const total = yieldTotals[plant.id!] || 0;
                      const ref = yieldRefs[plant.name] ?? null;
                      const rating = calculateYieldRating(total, ref);
                      if (rating === 'none') return null;
                      return (
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <Badge className={`text-[10px] border-0 ${YIELD_RATING_COLORS[rating]}`}>
                            {YIELD_RATING_LABELS[rating]}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {total > 1000 ? `${(total / 1000).toFixed(1)}kg` : `${total}g`}
                          </span>
                        </div>
                      );
                    })()}
                    {plant.tags?.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {plant.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
