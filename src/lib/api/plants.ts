/**
 * Client-side wrapper around our /api/plant-lookup server route.
 *
 * We proxy through a server route for two reasons:
 *   1. Trefle does not send CORS headers — calling it directly from the
 *      browser throws.
 *   2. API tokens (TREFLE_TOKEN) stay server-only.
 *
 * The server route layers in OpenFarm as a free, no-auth fallback and also
 * supports a broad "varieties" mode for cascading search (plant → variety).
 */

export interface TreflePlant {
  // Prefixed id, e.g. "trefle:123" or "openfarm:abc".
  id: string;
  source: 'trefle' | 'openfarm';
  common_name: string | null;
  scientific_name: string | null;
  family: string | null;
  image_url: string | null;
  // Some list endpoints (OpenFarm) already include rich fields.
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

async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Plant lookup failed: ${res.statusText}`);
  return res.json();
}

export async function searchPlants(query: string, signal?: AbortSignal): Promise<TreflePlant[]> {
  const json = await fetchJson<{ data: TreflePlant[] }>(
    `/api/plant-lookup?q=${encodeURIComponent(query)}`,
    signal,
  );
  return json.data ?? [];
}

/**
 * Broad variety/cultivar list for a given common name (e.g. "tomato").
 * Pulls extra Trefle pages and merges with OpenFarm.
 */
export async function searchVarieties(commonName: string, signal?: AbortSignal): Promise<TreflePlant[]> {
  const json = await fetchJson<{ data: TreflePlant[] }>(
    `/api/plant-lookup?varieties=${encodeURIComponent(commonName)}`,
    signal,
  );
  return json.data ?? [];
}

export async function getPlantById(id: string, signal?: AbortSignal): Promise<TreflePlantDetail | null> {
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
