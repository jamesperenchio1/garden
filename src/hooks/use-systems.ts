import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { HydroSystem } from '@/types';

export interface UseSystemsReturn {
  systems: HydroSystem[];
  loading: boolean;
  addSystem: (
    system: Omit<HydroSystem, 'id' | 'createdAt'>
  ) => Promise<void>;
  updateSystem: (id: string, updates: Partial<HydroSystem>) => Promise<void>;
  deleteSystem: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSystems(): UseSystemsReturn {
  const [systems, setSystems] = useState<HydroSystem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await db.systems.toArray();
    setSystems(data);
    setLoading(false);
  }, []);

  const addSystem = useCallback(
    async (system: Omit<HydroSystem, 'id' | 'createdAt'>) => {
      await db.systems.add({
        ...system,
        createdAt: new Date(),
      } as HydroSystem);
      await refresh();
    },
    [refresh]
  );

  const updateSystem = useCallback(
    async (id: string, updates: Partial<HydroSystem>) => {
      await db.systems.update(id, updates);
      await refresh();
    },
    [refresh]
  );

  const deleteSystem = useCallback(
    async (id: string) => {
      await db.systems.delete(id);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { systems, loading, addSystem, updateSystem, deleteSystem, refresh };
}
