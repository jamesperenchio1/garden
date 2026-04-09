'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImageIcon, Search, X, Calendar, Leaf, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';
import { db } from '@/lib/db';
import type { Photo, Plant } from '@/types/plant';

interface PhotoEntry {
  photo: Photo;
  plant: Plant;
  url: string;
}

export default function GalleryPage() {
  const [entries, setEntries] = useState<PhotoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoEntry | null>(null);

  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];

    (async () => {
      const [photos, plants] = await Promise.all([
        db.photos.orderBy('createdAt').reverse().toArray(),
        db.plants.toArray(),
      ]);

      const plantMap = new Map<number, Plant>();
      for (const p of plants) if (p.id) plantMap.set(p.id, p);

      const result: PhotoEntry[] = [];
      for (const photo of photos) {
        const plant = plantMap.get(photo.plantId);
        if (!plant) continue;
        const blob = photo.thumbnail || photo.blob;
        if (!blob) continue;
        const url = URL.createObjectURL(blob);
        urls.push(url);
        result.push({ photo, plant, url });
      }

      if (!cancelled) {
        setEntries(result);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      urls.forEach(URL.revokeObjectURL);
    };
  }, []);

  // Group by date
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchesSearch =
        e.plant.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.plant.variety?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesType =
        typeFilter === 'all' || e.photo.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [entries, search, typeFilter]);

  const grouped = useMemo(() => {
    const groups = new Map<string, PhotoEntry[]>();
    for (const entry of filtered) {
      const key = format(new Date(entry.photo.createdAt), 'yyyy-MM-dd');
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    }
    return [...groups.entries()].map(([date, photos]) => ({
      date,
      label: format(new Date(date), 'EEEE, MMMM d, yyyy'),
      photos,
    }));
  }, [filtered]);

  // Lightbox navigation
  const currentIndex = selectedPhoto
    ? filtered.findIndex((e) => e.photo.id === selectedPhoto.photo.id)
    : -1;

  const goNext = () => {
    if (currentIndex < filtered.length - 1) {
      setSelectedPhoto(filtered[currentIndex + 1]);
    }
  };
  const goPrev = () => {
    if (currentIndex > 0) {
      setSelectedPhoto(filtered[currentIndex - 1]);
    }
  };

  // Full-size URL for lightbox — use a ref to avoid stale closure leaks
  const [fullUrl, setFullUrl] = useState<string | null>(null);
  const fullUrlRef = useRef<string | null>(null);
  useEffect(() => {
    if (fullUrlRef.current) {
      URL.revokeObjectURL(fullUrlRef.current);
      fullUrlRef.current = null;
    }
    if (!selectedPhoto) {
      setFullUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedPhoto.photo.blob);
    fullUrlRef.current = url;
    setFullUrl(url);
    return () => {
      if (fullUrlRef.current) {
        URL.revokeObjectURL(fullUrlRef.current);
        fullUrlRef.current = null;
      }
    };
  }, [selectedPhoto?.photo.id]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Photo Gallery</h1>
          <p className="text-sm text-muted-foreground">
            {entries.length} photos across all your plants
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by plant name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Photos</SelectItem>
            <SelectItem value="plant">Plant Photos</SelectItem>
            <SelectItem value="seedPacket">Seed Packets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {entries.length === 0 ? 'No photos yet' : 'No matching photos'}
            </h3>
            <p className="text-muted-foreground">
              {entries.length === 0
                ? 'Upload photos from individual plant pages to see them here.'
                : 'Try adjusting your search or filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">{group.label}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {group.photos.length}
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
                {group.photos.map((entry) => (
                  <button
                    key={entry.photo.id}
                    type="button"
                    onClick={() => setSelectedPhoto(entry)}
                    className="group relative aspect-square rounded-lg overflow-hidden bg-muted hover:ring-2 hover:ring-green-500 transition-all"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={entry.url}
                      alt={entry.plant.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 pt-6">
                      <p className="text-white text-xs font-medium truncate">
                        {entry.plant.name}
                      </p>
                      {entry.plant.variety && (
                        <p className="text-white/70 text-[10px] truncate">
                          {entry.plant.variety}
                        </p>
                      )}
                    </div>
                    {/* Type badge */}
                    {entry.photo.type === 'seedPacket' && (
                      <Badge className="absolute top-1.5 right-1.5 text-[9px] bg-amber-600 hover:bg-amber-600">
                        Packet
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedPhoto && fullUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setSelectedPhoto(null)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation */}
          {currentIndex > 0 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-2"
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          {currentIndex < filtered.length - 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white z-10 p-2"
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              aria-label="Next photo"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* Image */}
          <div
            className="max-w-[90vw] max-h-[80vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fullUrl}
              alt={selectedPhoto.plant.name}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            {/* Info bar */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8 rounded-b-lg">
              <div className="flex items-end justify-between">
                <div>
                  <Link
                    href={`/plants/${selectedPhoto.plant.id}`}
                    className="text-white font-semibold hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {selectedPhoto.plant.name}
                  </Link>
                  {selectedPhoto.plant.variety && (
                    <p className="text-white/70 text-sm">{selectedPhoto.plant.variety}</p>
                  )}
                  {selectedPhoto.photo.note && (
                    <p className="text-white/60 text-xs mt-1">{selectedPhoto.photo.note}</p>
                  )}
                </div>
                <div className="text-right text-white/60 text-xs">
                  <p>{format(new Date(selectedPhoto.photo.createdAt), 'PPP')}</p>
                  <p>{format(new Date(selectedPhoto.photo.createdAt), 'p')}</p>
                  <Badge
                    variant="outline"
                    className="mt-1 text-[10px] text-white/60 border-white/30"
                  >
                    {selectedPhoto.photo.type === 'seedPacket' ? 'Seed Packet' : 'Plant Photo'}
                  </Badge>
                </div>
              </div>
              <p className="text-white/40 text-[10px] mt-1">
                {currentIndex + 1} / {filtered.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
