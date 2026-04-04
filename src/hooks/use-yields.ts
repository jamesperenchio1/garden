'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/db';
import type { YieldRecord, YieldReference, YieldRating } from '@/types/plant';

/**
 * Hook to manage yield records for a specific plant.
 */
export function usePlantYields(plantId: number | undefined) {
  const [records, setRecords] = useState<YieldRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!plantId) return;
    setLoading(true);
    const all = await db.yieldRecords
      .where('plantId')
      .equals(plantId)
      .reverse()
      .sortBy('harvestedAt');
    setRecords(all);
    setLoading(false);
  }, [plantId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
    async (id: number) => {
      await db.yieldRecords.delete(id);
      await refresh();
    },
    [refresh]
  );

  const totalGrams = records.reduce((sum, r) => sum + r.amountGrams, 0);
  const harvestCount = records.length;

  return { records, loading, addYield, deleteYield, totalGrams, harvestCount, refresh };
}

/**
 * Hook to fetch yield reference data from IndexedDB (not hardcoded).
 */
export function useYieldReference(plantName: string | undefined) {
  const [reference, setReference] = useState<YieldReference | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plantName) {
      setReference(null);
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const ref = await db.yieldReferences
        .where('plantName')
        .equalsIgnoreCase(plantName)
        .first();
      setReference(ref ?? null);
      setLoading(false);
    })();
  }, [plantName]);

  return { reference, loading };
}

/**
 * Hook to get all yield references from the DB.
 */
export function useAllYieldReferences() {
  const [references, setReferences] = useState<YieldReference[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const all = await db.yieldReferences.toArray();
      setReferences(all);
      setLoading(false);
    })();
  }, []);

  return { references, loading };
}

/**
 * Calculate a yield rating based on total grams harvested vs reference thresholds.
 * All thresholds come from the DB — no hardcoding.
 */
export function calculateYieldRating(
  totalGrams: number,
  reference: YieldReference | null
): YieldRating {
  if (!reference || totalGrams === 0) return 'none';
  const t = reference.yieldRatingThresholds;
  if (totalGrams >= t.veryHigh) return 'exceptional';
  if (totalGrams >= t.high) return 'very_high';
  if (totalGrams >= t.moderate) return 'high';
  if (totalGrams >= t.low) return 'moderate';
  if (totalGrams >= t.veryLow) return 'low';
  return 'very_low';
}

export const YIELD_RATING_LABELS: Record<YieldRating, string> = {
  none: 'No Harvest',
  very_low: 'Very Low',
  low: 'Low',
  moderate: 'Moderate',
  high: 'High',
  very_high: 'Very High',
  exceptional: 'Exceptional',
};

export const YIELD_RATING_COLORS: Record<YieldRating, string> = {
  none: 'bg-gray-100 text-gray-600',
  very_low: 'bg-red-100 text-red-700',
  low: 'bg-orange-100 text-orange-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  high: 'bg-green-100 text-green-700',
  very_high: 'bg-emerald-100 text-emerald-700',
  exceptional: 'bg-purple-100 text-purple-700',
};
