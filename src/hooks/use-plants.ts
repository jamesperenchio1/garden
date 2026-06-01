import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { Plant } from '@/types';

export interface UsePlantsReturn {
  plants: Plant[];
  loading: boolean;
  addPlant: (plant: Omit<Plant, 'id' | 'createdAt'>) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  deletePlant: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePlants(): UsePlantsReturn {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await db.plants.toArray();
    setPlants(data);
    setLoading(false);
  }, []);

  const addPlant = useCallback(
    async (plant: Omit<Plant, 'id' | 'createdAt'>) => {
      await db.plants.add({
        ...plant,
        createdAt: new Date(),
      } as Plant);
      await refresh();
    },
    [refresh]
  );

  const updatePlant = useCallback(
    async (id: string, updates: Partial<Plant>) => {
      await db.plants.update(id, updates);
      await refresh();
    },
    [refresh]
  );

  const deletePlant = useCallback(
    async (id: string) => {
      await db.plants.delete(id);
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { plants, loading, addPlant, updatePlant, deletePlant, refresh };
}
