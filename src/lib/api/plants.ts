const TREFLE_BASE = 'https://trefle.io/api/v1';

export interface TreflePlant {
  id: number;
  common_name: string | null;
  scientific_name: string;
  family_common_name: string | null;
  image_url: string | null;
  genus: string;
  family: string;
}

export interface TreflePlantDetail extends TreflePlant {
  main_species: {
    growth: {
      minimum_temperature?: { deg_c: number };
      maximum_temperature?: { deg_c: number };
      soil_humidity?: number;
      light?: number;
      atmospheric_humidity?: number;
      minimum_root_depth?: { cm: number };
      ph_minimum?: number;
      ph_maximum?: number;
    };
    specifications: {
      growth_rate?: string;
      average_height?: { cm: number };
      maximum_height?: { cm: number };
      toxicity?: string;
    };
  };
}

export async function searchPlants(query: string, token?: string): Promise<TreflePlant[]> {
  const apiToken = token || process.env.NEXT_PUBLIC_TREFLE_TOKEN;
  if (!apiToken) {
    console.warn('Trefle API token not configured');
    return [];
  }

  const url = `${TREFLE_BASE}/plants/search?q=${encodeURIComponent(query)}&token=${apiToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Trefle API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data || [];
}

export async function getPlantById(id: number, token?: string): Promise<TreflePlantDetail | null> {
  const apiToken = token || process.env.NEXT_PUBLIC_TREFLE_TOKEN;
  if (!apiToken) return null;

  const url = `${TREFLE_BASE}/plants/${id}?token=${apiToken}`;
  const response = await fetch(url);

  if (!response.ok) return null;

  const data = await response.json();
  return data.data || null;
}
