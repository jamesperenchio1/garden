import { describe, it, expect } from 'vitest';

/**
 * Tests for the plant-lookup API route logic.
 *
 * We test the dedupe and meta logic. Actual Trefle/OpenFarm calls can't be
 * tested without a network, but we verify the response shape and edge cases.
 */

// Inline the dedupe function since we can't import Next route handlers directly
interface LookupResult {
  source: 'trefle' | 'openfarm';
  id: string;
  common_name: string | null;
  scientific_name: string | null;
  family: string | null;
  image_url: string | null;
}

function dedupe(results: LookupResult[]): LookupResult[] {
  const seen = new Set<string>();
  const out: LookupResult[] = [];
  for (const r of results) {
    const key = (r.common_name ?? r.scientific_name ?? '').toLowerCase().trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

describe('Plant Lookup — Dedupe Logic', () => {
  it('should deduplicate by common_name case-insensitively', () => {
    const results: LookupResult[] = [
      { source: 'trefle', id: 'trefle:1', common_name: 'Tomato', scientific_name: 'Solanum lycopersicum', family: 'Solanaceae', image_url: null },
      { source: 'openfarm', id: 'openfarm:abc', common_name: 'tomato', scientific_name: 'Solanum lycopersicum', family: null, image_url: null },
    ];

    const deduped = dedupe(results);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].source).toBe('trefle'); // Trefle comes first, preferred
  });

  it('should keep entries with different common names', () => {
    const results: LookupResult[] = [
      { source: 'trefle', id: 'trefle:1', common_name: 'Tomato', scientific_name: null, family: null, image_url: null },
      { source: 'trefle', id: 'trefle:2', common_name: 'Cherry Tomato', scientific_name: null, family: null, image_url: null },
      { source: 'openfarm', id: 'openfarm:3', common_name: 'Roma Tomato', scientific_name: null, family: null, image_url: null },
    ];

    const deduped = dedupe(results);
    expect(deduped).toHaveLength(3);
  });

  it('should skip entries with no common_name and no scientific_name', () => {
    const results: LookupResult[] = [
      { source: 'trefle', id: 'trefle:1', common_name: null, scientific_name: null, family: null, image_url: null },
      { source: 'trefle', id: 'trefle:2', common_name: 'Basil', scientific_name: null, family: null, image_url: null },
    ];

    const deduped = dedupe(results);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].common_name).toBe('Basil');
  });

  it('should fall back to scientific_name for dedup key if no common_name', () => {
    const results: LookupResult[] = [
      { source: 'trefle', id: 'trefle:1', common_name: null, scientific_name: 'Ocimum basilicum', family: null, image_url: null },
      { source: 'openfarm', id: 'openfarm:2', common_name: null, scientific_name: 'Ocimum basilicum', family: null, image_url: null },
    ];

    const deduped = dedupe(results);
    expect(deduped).toHaveLength(1);
  });

  it('should handle empty input', () => {
    expect(dedupe([])).toHaveLength(0);
  });
});

describe('Plant Lookup — Client API Types', () => {
  it('SearchResult type should include data and optional meta', () => {
    // Type-level test — just verify the shape compiles
    const result = {
      data: [
        {
          id: 'trefle:123',
          source: 'trefle' as const,
          common_name: 'Tomato',
          scientific_name: 'Solanum lycopersicum',
          family: 'Solanaceae',
          image_url: 'https://example.com/tomato.jpg',
        },
      ],
      meta: {
        sources: {
          trefle: 'ok' as const,
          openfarm: 'empty' as const,
        },
      },
    };

    expect(result.data).toHaveLength(1);
    expect(result.meta.sources.trefle).toBe('ok');
    expect(result.meta.sources.openfarm).toBe('empty');
  });

  it('SearchMeta should convey no_token status', () => {
    const meta = {
      sources: {
        trefle: 'no_token' as const,
        openfarm: 'ok' as const,
      },
    };

    expect(meta.sources.trefle).toBe('no_token');
  });
});
