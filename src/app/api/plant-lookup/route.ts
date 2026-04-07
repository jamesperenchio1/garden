import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side plant lookup proxy.
 *
 * Called from the browser instead of hitting Trefle/OpenFarm directly — this
 * sidesteps CORS (Trefle has no CORS headers) and keeps any API token server-only.
 *
 * Sources:
 *   1. Trefle  (if TREFLE_TOKEN env var is set)
 *   2. OpenFarm (always — no auth required, free, public)
 *
 * Query params:
 *   ?q=<search>                  merged list of plants matching the term.
 *   ?varieties=<common-name>     a broad list of varieties/cultivars of the
 *                                given plant, pulled from both sources.
 *   ?id=<source>:<id>            fetch rich details for a single result.
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
  days_to_maturity?: string;
  sowing_depth?: string;
  tags?: string[];
}

const TREFLE_BASE = 'https://trefle.io/api/v1';
const OPENFARM_BASE = 'https://openfarm.cc/api/v1';
const SEARCH_LIMIT = 30;

type TrefleListItem = {
  id: number;
  common_name: string | null;
  scientific_name: string | null;
  family: string | null;
  image_url: string | null;
};

function mapTrefleListItem(p: TrefleListItem): LookupResult {
  return {
    source: 'trefle',
    id: `trefle:${p.id}`,
    common_name: p.common_name,
    scientific_name: p.scientific_name,
    family: p.family,
    image_url: p.image_url,
  };
}

async function searchTrefle(q: string, pages = 1): Promise<LookupResult[]> {
  const token = process.env.TREFLE_TOKEN;
  if (!token) return [];
  const results: LookupResult[] = [];
  for (let page = 1; page <= pages; page++) {
    try {
      const res = await fetch(
        `${TREFLE_BASE}/plants/search?q=${encodeURIComponent(q)}&page=${page}&token=${token}`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) break;
      const json = await res.json();
      const data: TrefleListItem[] = json.data ?? [];
      if (data.length === 0) break;
      results.push(...data.map(mapTrefleListItem));
      if (data.length < 20) break; // last page
    } catch {
      break;
    }
  }
  return results.slice(0, SEARCH_LIMIT * pages);
}

type OpenFarmListItem = {
  id: string;
  attributes: {
    name?: string;
    binomial_name?: string;
    main_image_path?: string;
    description?: string;
    sun_requirements?: string;
    sowing_method?: string;
    spread?: number;
    row_spacing?: number;
    height?: number;
    growing_degree_days?: number;
    tags_array?: string[];
  };
};

function mapOpenFarmListItem(p: OpenFarmListItem): LookupResult {
  const a = p.attributes ?? {};
  return {
    source: 'openfarm',
    id: `openfarm:${p.id}`,
    common_name: a.name ?? null,
    scientific_name: a.binomial_name ?? null,
    family: null,
    image_url: a.main_image_path && a.main_image_path.startsWith('http') ? a.main_image_path : null,
    description: a.description,
    sun_requirements: a.sun_requirements,
    sowing_method: a.sowing_method,
    spacing: a.spread !== undefined ? `${a.spread} cm` : undefined,
    row_spacing: a.row_spacing !== undefined ? `${a.row_spacing} cm` : undefined,
    height: a.height !== undefined ? `${a.height} cm` : undefined,
    growing_degree_days: a.growing_degree_days,
    tags: a.tags_array,
  };
}

async function searchOpenFarm(q: string): Promise<LookupResult[]> {
  try {
    const res = await fetch(
      `${OPENFARM_BASE}/crops?filter=${encodeURIComponent(q)}&include=pictures`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) return [];
    const json = await res.json();
    const data: OpenFarmListItem[] = json.data ?? [];
    return data.slice(0, SEARCH_LIMIT).map(mapOpenFarmListItem);
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
    const ms = d.main_species ?? {};
    const growth = ms.growth ?? {};
    const specs = ms.specifications ?? {};
    const seed = ms.seed ?? {};
    return {
      source: 'trefle',
      id: `trefle:${d.id}`,
      common_name: d.common_name,
      scientific_name: d.scientific_name,
      family: d.family,
      image_url: d.image_url,
      description: growth.description ?? undefined,
      sun_requirements: growth.light !== undefined ? `Light: ${growth.light}/10` : undefined,
      sowing_method: seed.sowing ?? undefined,
      sowing_depth: seed.depth !== undefined ? `${seed.depth} cm` : undefined,
      days_to_maturity: growth.days_to_harvest ? `${growth.days_to_harvest} days` : undefined,
      spacing: growth.row_spacing?.cm !== undefined ? `${growth.row_spacing.cm} cm` : undefined,
      row_spacing: growth.spread?.cm !== undefined ? `${growth.spread.cm} cm` : undefined,
      height: specs.average_height?.cm !== undefined ? `${specs.average_height.cm} cm` : undefined,
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
      image_url: a.main_image_path && a.main_image_path.startsWith('http') ? a.main_image_path : null,
      description: a.description,
      sun_requirements: a.sun_requirements,
      sowing_method: a.sowing_method,
      sowing_depth: a.sowing_depth !== undefined ? `${a.sowing_depth} cm` : undefined,
      spacing: a.spread !== undefined ? `${a.spread} cm` : undefined,
      row_spacing: a.row_spacing !== undefined ? `${a.row_spacing} cm` : undefined,
      height: a.height !== undefined ? `${a.height} cm` : undefined,
      growing_degree_days: a.growing_degree_days,
      tags: a.tags_array,
    };
  } catch {
    return null;
  }
}

/**
 * De-duplicate by common name (case-insensitive). Trefle entries are preferred
 * because they carry botanical data; OpenFarm gets kept when it provides a
 * name Trefle didn't return.
 */
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const varieties = searchParams.get('varieties');
  const id = searchParams.get('id');

  if (id) {
    const [source, ...rest] = id.split(':');
    const rawId = rest.join(':');
    let detail: LookupResult | null = null;
    if (source === 'trefle') detail = await getTrefleDetail(rawId);
    else if (source === 'openfarm') detail = await getOpenFarmDetail(rawId);
    return NextResponse.json({ data: detail });
  }

  if (varieties && varieties.trim()) {
    // Fetch a wide list of cultivars/varieties for the given plant. Both Trefle
    // and OpenFarm return mostly variety-level records for common veggies,
    // so a plain search against the common name works well. We pull extra pages
    // from Trefle to get more cultivars.
    const term = varieties.trim();
    const [trefle, openfarm] = await Promise.all([
      searchTrefle(term, 3),
      searchOpenFarm(term),
    ]);
    const merged = dedupe([...trefle, ...openfarm]);
    return NextResponse.json({ data: merged });
  }

  if (!q || !q.trim()) {
    return NextResponse.json({ data: [] });
  }

  const [trefle, openfarm] = await Promise.all([
    searchTrefle(q.trim(), 1),
    searchOpenFarm(q.trim()),
  ]);
  const merged = dedupe([...trefle, ...openfarm]);
  return NextResponse.json({ data: merged });
}
