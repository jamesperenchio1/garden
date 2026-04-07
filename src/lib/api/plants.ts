/**
 * Client-side wrapper around our /api/plant-lookup server route.
 *
 * Proxies through the server to avoid CORS (Trefle) and to keep API tokens
 * server-only. OpenFarm is always available as a free fallback.
 */

export interface TreflePlant {
  id: string;
  source: 'trefle' | 'openfarm';
  common_name: string | null;
  scientific_name: string | null;
  family: string | null;
  image_url: string | null;
  description?: string;
  sun_requirements?: string;
  sowing_method?: string;
  spacing?: string;
  row_spacing?: string;
  height?: string;
  growing_degree_days?: number;
  tags?: string[];
}

export interface TreflePlantDetail extends TreflePlant {
  description?: string;
  sun_requirements?: string;
  sowing_method?: string;
  sowing_depth?: string;
  days_to_maturity?: string;
  spacing?: string;
  row_spacing?: string;
  height?: string;
  growing_degree_days?: number;
  min_temp_c?: number;
  max_temp_c?: number;
  ph_minimum?: number;
  ph_maximum?: number;
  growth_rate?: string;
  tags?: string[];
}

export interface SearchMeta {
  sources: {
    trefle: 'ok' | 'empty' | 'no_token';
    openfarm: 'ok' | 'empty';
  };
}

export interface SearchResult {
  data: TreflePlant[];
  meta?: SearchMeta;
}

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Plant lookup failed: ${res.statusText}`);
  return res.json();
}

export async function searchPlants(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult> {
  return fetchJson<SearchResult>(
    `/api/plant-lookup?q=${encodeURIComponent(query)}`,
    signal,
  );
}

export async function searchVarieties(
  commonName: string,
  signal?: AbortSignal,
): Promise<TreflePlant[]> {
  const json = await fetchJson<{ data: TreflePlant[] }>(
    `/api/plant-lookup?varieties=${encodeURIComponent(commonName)}`,
    signal,
  );
  return json.data ?? [];
}

export async function getPlantById(
  id: string,
  signal?: AbortSignal,
): Promise<TreflePlantDetail | null> {
  try {
    const json = await fetchJson<{ data: TreflePlantDetail | null }>(
      `/api/plant-lookup?id=${encodeURIComponent(id)}`,
      signal,
    );
    return json.data ?? null;
  } catch {
    return null;
  }
}
