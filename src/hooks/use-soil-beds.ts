'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { SoilBed, BedPlant, SoilAmendment } from '@/types/companion';

export function useSoilBeds() {
  const [beds, setBeds] = useState<SoilBed[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const allBeds = await db.soilBeds.orderBy('createdAt').reverse().toArray();
    setBeds(allBeds);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createBed = useCallback(
    async (data: Omit<SoilBed, 'id' | 'createdAt' | 'updatedAt' | 'plants' | 'amendments'>) => {
      const now = new Date();
      const id = await db.soilBeds.add({
        ...data,
        plants: [],
        amendments: [],
        createdAt: now,
        updatedAt: now,
      } as SoilBed);
      await refresh();
      return id as number;
    },
    [refresh]
  );

  const updateBed = useCallback(
    async (id: number, updates: Partial<Omit<SoilBed, 'id' | 'createdAt'>>) => {
      await db.soilBeds.update(id, { ...updates, updatedAt: new Date() });
      await refresh();
    },
    [refresh]
  );

  const deleteBed = useCallback(
    async (id: number) => {
      await db.soilBeds.delete(id);
      await refresh();
    },
    [refresh]
  );

  /** Replace the plant list for a specific bed (used by designer on every move/drop). */
  const savePlants = useCallback(
    async (bedId: number, plants: BedPlant[]) => {
      await db.soilBeds.update(bedId, { plants, updatedAt: new Date() });
      await refresh();
    },
    [refresh]
  );

  const addAmendment = useCallback(
    async (bedId: number, amendment: SoilAmendment) => {
      const bed = await db.soilBeds.get(bedId);
      if (!bed) return;
      const amendments = [...bed.amendments, amendment];
      await db.soilBeds.update(bedId, { amendments, updatedAt: new Date() });
      await refresh();
    },
    [refresh]
  );

  const removeAmendment = useCallback(
    async (bedId: number, index: number) => {
      const bed = await db.soilBeds.get(bedId);
      if (!bed) return;
      const amendments = bed.amendments.filter((_, i) => i !== index);
      await db.soilBeds.update(bedId, { amendments, updatedAt: new Date() });
      await refresh();
    },
    [refresh]
  );

  return {
    beds,
    loading,
    refresh,
    createBed,
    updateBed,
    deleteBed,
    savePlants,
    addAmendment,
    removeAmendment,
  };
}
