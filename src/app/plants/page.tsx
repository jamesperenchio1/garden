'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePlants } from '@/hooks/use-plants';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Leaf, TrendingUp, Package, Sprout } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/db';
import { YIELD_RATING_LABELS, YIELD_RATING_COLORS, calculateYieldRating } from '@/hooks/use-yields';
import type { Plant, PlantCategory, YieldRating, YieldReference } from '@/types/plant';

type ViewTab = 'growing' | 'bank';

export default function PlantsPage() {
  const { plants, loading, updatePlant } = usePlants();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [tab, setTab] = useState<ViewTab>('growing');

  const [yieldTotals, setYieldTotals] = useState<Record<number, number>>({});
  const [yieldRefs, setYieldRefs] = useState<Record<string, YieldReference>>({});
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const [locationNames, setLocationNames] = useState<Record<number, string>>({});

  useEffect(() => {
    (async () => {
      const allRecords = await db.yieldRecords.toArray();
      const totals: Record<number, number> = {};
      for (const r of allRecords) {
        totals[r.plantId] = (totals[r.plantId] || 0) + r.amountGrams;
      }
      setYieldTotals(totals);

      const refs = await db.yieldReferences.toArray();
      const refMap: Record<string, YieldReference> = {};
      for (const r of refs) refMap[r.plantName] = r;
      setYieldRefs(refMap);

      const locs = await db.locations.toArray();
      const locMap: Record<number, string> = {};
      for (const l of locs) if (l.id) locMap[l.id] = l.zone ? `${l.zone} > ${l.name}` : l.name;
      setLocationNames(locMap);
    })();
  }, [plants]);

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    (async () => {
      const urls: Record<number, string> = {};
      for (const p of plants) {
        if (!p.id) continue;
        const photo = await db.photos
          .where('plantId')
          .equals(p.id)
          .filter((ph) => ph.type === 'plant')
          .first();
        if (photo?.thumbnail) {
          const url = URL.createObjectURL(photo.thumbnail);
          urls[p.id] = url;
          created.push(url);
        }
      }
      if (!cancelled) setPhotoUrls(urls);
    })();
    return () => {
      cancelled = true;
      created.forEach(URL.revokeObjectURL);
    };
  }, [plants]);

  // Split plants into bank vs growing (anything not 'bank')
  const bankPlants = useMemo(() => plants.filter((p) => p.status === 'bank'), [plants]);
  const growingPlants = useMemo(() => plants.filter((p) => p.status !== 'bank'), [plants]);
  const activePlants = tab === 'bank' ? bankPlants : growingPlants;

  const filtered = activePlants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.variety?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchesMethod = methodFilter === 'all' || p.growingMethod === methodFilter;
    return matchesSearch && matchesCategory && matchesMethod;
  });

  const handlePlantFromBank = async (plant: Plant) => {
    if (!plant.id) return;
    await updatePlant(plant.id, {
      status: 'growing',
      plantedDate: new Date(),
    });
  };

  const getHealthColor = (plant: Plant) => {
    if (!plant.healthTags?.length) return 'bg-gray-100 text-gray-600';
    if (plant.healthTags.some((t) => t.severity === 'high')) return 'bg-red-100 text-red-600';
    if (plant.healthTags.some((t) => t.severity === 'medium')) return 'bg-amber-100 text-amber-600';
    return 'bg-green-100 text-green-600';
  };

  const getHealthLabel = (plant: Plant) => {
    if (!plant.healthTags?.length) return 'No status';
    const overall = plant.healthTags.find((t) => t.category === 'overall');
    if (overall) return overall.value;
    if (plant.healthTags.some((t) => t.severity === 'high')) return 'Critical';
    if (plant.healthTags.some((t) => t.severity === 'medium')) return 'Watch';
    return 'Good';
  };

  /** Force CE calendar (not Buddhist Era) by using en-US locale */
  const formatDate = (date: Date | undefined) => {
    if (!date) return null;
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* ─── Tab toggle ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="flex rounded-lg border bg-muted p-0.5 gap-0.5">
          <button
            type="button"
            onClick={() => setTab('growing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'growing'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sprout className="h-3.5 w-3.5" />
            Growing
            {growingPlants.length > 0 && (
              <Badge variant="secondary" className="text-[10px] ml-1 h-4 px-1">
                {growingPlants.length}
              </Badge>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab('bank')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === 'bank'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Package className="h-3.5 w-3.5" />
            Plant Bank
            {bankPlants.length > 0 && (
              <Badge variant="secondary" className="text-[10px] ml-1 h-4 px-1">
                {bankPlants.length}
              </Badge>
            )}
          </button>
        </div>
        <div className="flex-1" />
        <Link href="/plants/new">
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Plant
          </Button>
        </Link>
      </div>

      {/* ─── Toolbar ─────────────────────────────────────────────────────── */}
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
        {tab === 'growing' && (
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
        )}
      </div>

      {/* ─── Grid ────────────────────────────────────────────────────────── */}
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
            {tab === 'bank' ? (
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            ) : (
              <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            )}
            <h3 className="text-lg font-semibold mb-2">
              {activePlants.length === 0
                ? tab === 'bank'
                  ? 'Plant Bank is empty'
                  : 'No plants growing'
                : 'No matching plants'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {activePlants.length === 0
                ? tab === 'bank'
                  ? 'Add seeds or plants you have at home to keep track of your inventory.'
                  : 'Start by adding your first plant to track its growth.'
                : 'Try adjusting your search or filters.'}
            </p>
            {activePlants.length === 0 && (
              <Link href="/plants/new">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {tab === 'bank' ? 'Add to Plant Bank' : 'Add Your First Plant'}
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : tab === 'bank' ? (
        /* ─── Bank grid (compact table-like cards) ──────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((plant) => (
            <Card key={plant.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/30 rounded-lg flex items-center justify-center shrink-0">
                    {plant.id && photoUrls[plant.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrls[plant.id]} alt="" className="h-full w-full object-cover rounded-lg" />
                    ) : (
                      <Package className="h-5 w-5 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <Link href={`/plants/${plant.id}`} className="hover:underline">
                      <h3 className="font-semibold text-sm truncate">{plant.name}</h3>
                    </Link>
                    {plant.variety && (
                      <p className="text-xs text-muted-foreground truncate">{plant.variety}</p>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="secondary" className="text-[10px] capitalize">{plant.category}</Badge>
                      {plant.quantity && (
                        <Badge variant="outline" className="text-[10px]">
                          qty: {plant.quantity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 bg-green-600 hover:bg-green-700 text-xs h-7"
                    onClick={() => handlePlantFromBank(plant)}
                  >
                    <Sprout className="h-3 w-3 mr-1" />
                    Plant
                  </Button>
                </div>
                {plant.notes && (
                  <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{plant.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* ─── Growing grid ─────────────────────────────────────────────── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((plant) => (
            <Link key={plant.id} href={`/plants/${plant.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="h-32 bg-muted rounded-lg overflow-hidden flex items-center justify-center mb-3">
                    {plant.id && photoUrls[plant.id] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photoUrls[plant.id]} alt={plant.name} className="w-full h-full object-cover" />
                    ) : (
                      <Leaf className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{plant.name}</h3>
                        {plant.variety && <p className="text-sm text-muted-foreground">{plant.variety}</p>}
                      </div>
                      <Badge className={`text-xs ${getHealthColor(plant)}`} variant="outline">
                        {getHealthLabel(plant)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs capitalize">{plant.category}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{plant.growingMethod}</Badge>
                    </div>
                    {plant.plantedDate && (
                      <p className="text-xs text-muted-foreground">
                        Planted {formatDate(plant.plantedDate)}
                      </p>
                    )}
                    {plant.locationId && locationNames[plant.locationId] && (
                      <p className="text-xs text-muted-foreground truncate">
                        {locationNames[plant.locationId]}
                      </p>
                    )}
                    {!plant.locationId && plant.location && (
                      <p className="text-xs text-muted-foreground truncate">{plant.location}</p>
                    )}
                    {/* Yield rating */}
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
                          <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
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
