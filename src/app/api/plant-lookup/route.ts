import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side plant lookup proxy.
 *
 * Called from the browser instead of hitting Trefle/OpenFarm directly — this
 * sidesteps CORS (Trefle has no CORS headers) and keeps any API token server-only.
 *
 * Sources, in order of preference:
 *   1. Trefle (if TREFLE_TOKEN env var is set)
 *   2. OpenFarm (always — no auth required, free, public)
 *
 * Query params:
 *   ?q=<search>          list results
 *   ?id=<source>:<id>    fetch details for a single result
 */

export interface LookupResult {
  source: 'trefle' | 'openfarm';
  id: string; // prefixed: "trefle:123" or "openfarm:abc"
  common_name: string | null;
  scientific_name: string | null;
  family: string | null;
  image_url: string | null;
  // Optional rich fields (populated on detail fetch)
  description?: string;
  sun_requirements?: string;
  sowing_method?: string;
  spacing?: string;
  row_spacing?: string;
  height?: string;
  growing_degree_days?: number;
  min_temp_c?: number;
  max_temp_c?: number;
  ph_minimum?: number;
  ph_maximum?: number;
  growth_rate?: string;
}

const TREFLE_BASE = 'https://trefle.io/api/v1';
const OPENFARM_BASE = 'https://openfarm.cc/api/v1';

async function searchTrefle(q: string): Promise<LookupResult[]> {
  const token = process.env.TREFLE_TOKEN;
  if (!token) return [];
  try {
    const res = await fetch(
      `${TREFLE_BASE}/plants/search?q=${encodeURIComponent(q)}&token=${token}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).slice(0, 10).map(
      (p: {
        id: number;
        common_name: string | null;
        scientific_name: string | null;
        family: string | null;
        image_url: string | null;
      }): LookupResult => ({
        source: 'trefle',
        id: `trefle:${p.id}`,
        common_name: p.common_name,
        scientific_name: p.scientific_name,
        family: p.family,
        image_url: p.image_url,
      }),
    );
  } catch {
    return [];
  }
}

async function searchOpenFarm(q: string): Promise<LookupResult[]> {
  try {
    const res = await fetch(
      `${OPENFARM_BASE}/crops?filter=${encodeURIComponent(q)}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data ?? []).slice(0, 10).map(
      (p: {
        id: string;
        attributes: {
          name?: string;
          binomial_name?: string;
          main_image_path?: string;
        };
      }): LookupResult => ({
        source: 'openfarm',
        id: `openfarm:${p.id}`,
        common_name: p.attributes?.name ?? null,
        scientific_name: p.attributes?.binomial_name ?? null,
        family: null,
        image_url: p.attributes?.main_image_path ?? null,
      }),
    );
  } catch {
    return [];
  }
}

async function getTrefleDetail(id: string): Promise<LookupResult | null> {
  const token = process.env.TREFLE_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(`${TREFLE_BASE}/plants/${id}?token=${token}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json.data;
    if (!d) return null;
    const growth = d.main_species?.growth ?? {};
    const specs = d.main_species?.specifications ?? {};
    return {
      source: 'trefle',
      id: `trefle:${d.id}`,
      common_name: d.common_name,
      scientific_name: d.scientific_name,
      family: d.family,
      image_url: d.image_url,
      min_temp_c: growth.minimum_temperature?.deg_c,
      max_temp_c: growth.maximum_temperature?.deg_c,
      ph_minimum: growth.ph_minimum,
      ph_maximum: growth.ph_maximum,
      growth_rate: specs.growth_rate,
    };
  } catch {
    return null;
  }
}

async function getOpenFarmDetail(id: string): Promise<LookupResult | null> {
  try {
    const res = await fetch(`${OPENFARM_BASE}/crops/${encodeURIComponent(id)}`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json.data;
    if (!d) return null;
    const a = d.attributes ?? {};
    return {
      source: 'openfarm',
      id: `openfarm:${d.id}`,
      common_name: a.name ?? null,
      scientific_name: a.binomial_name ?? null,
      family: null,
      image_url: a.main_image_path ?? null,
      description: a.description,
      sun_requirements: a.sun_requirements,
      sowing_method: a.sowing_method,
      spacing: a.spread !== undefined ? `${a.spread} cm` : undefined,
      row_spacing: a.row_spacing !== undefined ? `${a.row_spacing} cm` : undefined,
      height: a.height !== undefined ? `${a.height} cm` : undefined,
      growing_degree_days: a.growing_degree_days,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const id = searchParams.get('id');

  if (id) {
    const [source, rawId] = id.split(':');
    let detail: LookupResult | null = null;
    if (source === 'trefle') detail = await getTrefleDetail(rawId);
    else if (source === 'openfarm') detail = await getOpenFarmDetail(rawId);
    return NextResponse.json({ data: detail });
  }

  if (!q || !q.trim()) {
    return NextResponse.json({ data: [] });
  }

  // Run both lookups in parallel. OpenFarm is always available; Trefle is
  // optional depending on whether a TREFLE_TOKEN is configured.
  const [trefle, openfarm] = await Promise.all([
    searchTrefle(q.trim()),
    searchOpenFarm(q.trim()),
  ]);

  // De-duplicate by common_name (case-insensitive), preferring Trefle entries.
  const seen = new Set<string>();
  const merged: LookupResult[] = [];
  for (const r of [...trefle, ...openfarm]) {
    const key = (r.common_name ?? r.scientific_name ?? '').toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }

  return NextResponse.json({ data: merged });
}
