/**
 * Client-side wrapper around our /api/plant-lookup server route.
 *
 * We proxy through a server route for two reasons:
 *   1. Trefle does not send CORS headers — calling it directly from the
 *      browser throws.
 *   2. API tokens (TREFLE_TOKEN) stay server-only.
 *
 * The server route also layers in OpenFarm as a free, no-auth fallback.
 */

export interface TreflePlant {
  // Prefixed id, e.g. "trefle:123" or "openfarm:abc". Kept as `number | string`
  // is awkward, so we expose `id` as string here (matching the server route)
  // and also keep a numeric `trefleId` where applicable.
  id: string;
  source: 'trefle' | 'openfarm';
  common_name: string | null;
  scientific_name: string | null;
  family: string | null;
  image_url: string | null;
}

export interface TreflePlantDetail extends TreflePlant {
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

export async function searchPlants(query: string): Promise<TreflePlant[]> {
  const res = await fetch(`/api/plant-lookup?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error(`Plant lookup failed: ${res.statusText}`);
  const json = await res.json();
  return json.data ?? [];
}

export async function getPlantById(id: string): Promise<TreflePlantDetail | null> {
  const res = await fetch(`/api/plant-lookup?id=${encodeURIComponent(id)}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}
