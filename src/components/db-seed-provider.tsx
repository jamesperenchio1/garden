'use client';

import { useEffect } from 'react';
import { seedYieldReferences } from '@/lib/seed-yield-references';

/**
 * Seeds the IndexedDB yield reference data on first load.
 * Renders children immediately — seeding is fire-and-forget.
 */
export function DbSeedProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    seedYieldReferences().catch(console.error);
  }, []);

  return <>{children}</>;
}
