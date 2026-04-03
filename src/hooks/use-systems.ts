'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { HydroSystem } from '@/types/system';

export function useSystems() {
  const [systems, setSystems] = useState<HydroSystem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const allSystems = await db.systems.orderBy('createdAt').reverse().toArray();
    setSystems(allSystems);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSystem = useCallback(async (system: Omit<HydroSystem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const id = await db.systems.add({
      ...system,
      createdAt: now,
      updatedAt: now,
    } as HydroSystem);
    await refresh();
    return id;
  }, [refresh]);

  const updateSystem = useCallback(async (id: number, updates: Partial<HydroSystem>) => {
    await db.systems.update(id, { ...updates, updatedAt: new Date() });
    await refresh();
  }, [refresh]);

  const deleteSystem = useCallback(async (id: number) => {
    await db.systems.delete(id);
    await refresh();
  }, [refresh]);

  return { systems, loading, addSystem, updateSystem, deleteSystem, refresh };
}
