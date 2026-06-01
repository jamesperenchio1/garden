import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { YieldRecord, YieldReference } from '@/types';

export interface UsePlantYieldsReturn {
  yields: YieldRecord[];
  totalGrams: number;
  loading: boolean;
  addYield: (record: Omit<YieldRecord, 'id' | 'createdAt'>) => Promise<void>;
  deleteYield: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function usePlantYields(plantId: number): UsePlantYieldsReturn {
  const [yields, setYields] = useState<YieldRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await db.yieldRecords.where('plantId').equals(plantId).toArray();
    setYields(data);
    setLoading(false);
  }, [plantId]);

  const addYield = useCallback(
    async (record: Omit<YieldRecord, 'id' | 'createdAt'>) => {
      await db.yieldRecords.add({
        ...record,
        createdAt: new Date(),
      } as YieldRecord);
      await refresh();
    },
    [refresh]
  );

  const deleteYield = useCallback(
    async (id: string) => {
      await db.yieldRecords.delete(Number(id));
      await refresh();
    },
    [refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalGrams = yields.reduce((sum, y) => sum + (y.amountGrams ?? 0), 0);

  return { yields, totalGrams, loading, addYield, deleteYield, refresh };
}

export interface UseYieldReferenceReturn {
  reference: YieldReference | null;
  loading: boolean;
}

export function useYieldReference(plantName: string): UseYieldReferenceReturn {
  const [reference, setReference] = useState<YieldReference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    db.yieldReferences
      .where('plantName')
      .equalsIgnoreCase(plantName)
      .first()
      .then((ref) => {
        if (!cancelled) setReference(ref ?? null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [plantName]);

  return { reference, loading };
}

export function calculateYieldRating(
  totalGrams: number,
  reference: YieldReference | null
): number {
  if (!reference || reference.expectedYieldGramsPerPlant <= 0) return 0;
  const ratio = totalGrams / reference.expectedYieldGramsPerPlant;
  return Math.min(Math.max(Math.round(ratio * 100), 0), 200); // 0–200 scale
}
