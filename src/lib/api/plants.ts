import {
  searchPlantDatabase,
  getPlantByDatabaseId,
  findPlantByName,
  type PlantDatabaseEntry,
} from '@/data/plant-database';

// ---------------------------------------------------------------------------
// Perenual API integration (free tier: 100 requests/day)
// ---------------------------------------------------------------------------

const PERENUAL_BASE = 'https://perenual.com/api';

export interface PerenualPlant {
  id: number;
  common_name: string | null;
  scientific_name: string[];
  other_name: string[];
  family: string | null;
  default_image?: {
    thumbnail: string | null;
    small_url: string | null;
    medium_url: string | null;
    regular_url: string | null;
  } | null;
}

export interface PerenualPlantDetail extends PerenualPlant {
  description: string | null;
  type: string | null;
  cycle: string | null;
  watering: string | null;
  sunlight: string[];
  hardiness: { min: string; max: string } | null;
  growth_rate: string | null;
  care_level: string | null;
  pruning_month: string[];
  dimension: string | null;
  attracts: string[];
  propagation: string[];
  flowers: boolean;
  flowering_season: string | null;
  color: string | null;
  soil: string[];
  pest_susceptibility: string[];
  diseases: string[];
  edible_fruit: boolean;
  edible_leaf: boolean;
  cuisine: string | null;
  medicinal: boolean;
  poisonous_to_humans: boolean;
  poisonous_to_pets: boolean;
}

async function searchPerenual(query: string, apiKey?: string): Promise<PerenualPlant[]> {
  const key = apiKey || process.env.NEXT_PUBLIC_PERENUAL_API_KEY;
  if (!key) return [];
  try {
    const url = `${PERENUAL_BASE}/species-list?q=${encodeURIComponent(query)}&key=${key}&page=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).slice(0, 10);
  } catch {
    return [];
  }
}

async function getPerenualDetail(id: number, apiKey?: string): Promise<PerenualPlantDetail | null> {
  const key = apiKey || process.env.NEXT_PUBLIC_PERENUAL_API_KEY;
  if (!key) return null;
  try {
    const url = `${PERENUAL_BASE}/species/details/${id}?key=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Unified search result type
// ---------------------------------------------------------------------------

export interface UnifiedPlantResult {
  id: string;
  name: string;
  scientificName: string;
  family?: string;
  category: 'vegetable' | 'herb' | 'fruit' | 'flower' | 'ornamental' | 'medicinal' | 'unknown';
  imageUrl?: string;
  source: 'local' | 'perenual';
  raw: PlantDatabaseEntry | PerenualPlant;
}

function mapPerenualCategory(plant: PerenualPlant): UnifiedPlantResult['category'] {
  const name = (plant.common_name || '').toLowerCase();
  const sci = (plant.scientific_name[0] || '').toLowerCase();
  const family = (plant.family || '').toLowerCase();
  if (family.includes('rosaceae') || family.includes('cucurbit') || family.includes('solanaceae') || family.includes('brassicaceae') || family.includes('fabaceae') || family.includes('apiaceae')) return 'vegetable';
  if (family.includes('lamiaceae') || family.includes('zingiberaceae') || family.includes('poaceae') || family.includes('basellaceae') || family.includes('pandanaceae') || family.includes('rutaceae')) return 'herb';
  if (family.includes('musaceae') || family.includes('caricaceae') || family.includes('cactaceae') || family.includes('passifloraceae') || family.includes('anacardiaceae') || family.includes('myrtaceae') || family.includes('oxalidaceae')) return 'fruit';
  if (family.includes('asteraceae') || family.includes('oleaceae') || family.includes('orchidaceae')) return 'flower';
  if (name.includes('basil') || name.includes('mint') || name.includes('thyme') || name.includes('rosemary') || name.includes('cilantro') || name.includes('parsley') || name.includes('oregano') || name.includes('sage') || name.includes('dill') || name.includes('chive')) return 'herb';
  if (name.includes('tomato') || name.includes('pepper') || name.includes('eggplant') || name.includes('cucumber') || name.includes('pumpkin') || name.includes('zucchini') || name.includes('bean') || name.includes('pea') || name.includes('corn') || name.includes('lettuce') || name.includes('spinach') || name.includes('kale') || name.includes('cabbage') || name.includes('carrot') || name.includes('radish') || name.includes('onion') || name.includes('garlic') || name.includes('potato') || name.includes('okra')) return 'vegetable';
  if (name.includes('apple') || name.includes('banana') || name.includes('mango') || name.includes('papaya') || name.includes('orange') || name.includes('lemon') || name.includes('lime') || name.includes('guava') || name.includes('dragon') || name.includes('passion') || name.includes('grape') || name.includes('berry') || name.includes('melon') || name.includes('watermelon')) return 'fruit';
  if (name.includes('rose') || name.includes('lily') || name.includes('sunflower') || name.includes('marigold') || name.includes('jasmine') || name.includes('orchid') || name.includes('daisy') || name.includes('tulip') || name.includes('hibiscus')) return 'flower';
  if (name.includes('aloe') || name.includes('moringa') || name.includes('ginseng') || name.includes('turmeric') || name.includes('ginger') || name.includes('echinacea')) return 'medicinal';
  return 'unknown';
}

function perenualToUnified(p: PerenualPlant): UnifiedPlantResult {
  return {
    id: `perenual-${p.id}`,
    name: p.common_name || p.scientific_name[0] || 'Unknown',
    scientificName: p.scientific_name[0] || '',
    family: p.family || undefined,
    category: mapPerenualCategory(p),
    imageUrl: p.default_image?.thumbnail || p.default_image?.small_url || undefined,
    source: 'perenual',
    raw: p,
  };
}

function localToUnified(p: PlantDatabaseEntry): UnifiedPlantResult {
  return {
    id: `local-${p.id}`,
    name: p.name,
    scientificName: p.scientificName,
    family: p.family,
    category: p.category,
    imageUrl: p.imageUrl,
    source: 'local',
    raw: p,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Search across local database + Perenual API.
 * Local results are returned first (fast, offline-capable).
 * Perenual results supplement when online and API key is available.
 */
export async function searchPlants(query: string, apiKey?: string): Promise<UnifiedPlantResult[]> {
  const q = query.trim();
  if (!q) return [];

  // Always search local DB first (instant, offline)
  const local = searchPlantDatabase(q).map(localToUnified);

  // Then try Perenual in parallel
  let perenual: UnifiedPlantResult[] = [];
  try {
    const perenualRaw = await searchPerenual(q, apiKey);
    // Filter out duplicates already in local DB
    const localNames = new Set(local.map((l) => l.name.toLowerCase()));
    perenual = perenualRaw
      .map(perenualToUnified)
      .filter((p) => !localNames.has(p.name.toLowerCase()));
  } catch {
    /* Perenual is optional — local DB is the primary source */
  }

  return [...local, ...perenual];
}

/**
 * Get detail for a unified result.
 * For local plants, returns the full entry.
 * For Perenual plants, fetches detail from API.
 */
export async function getPlantDetail(
  result: UnifiedPlantResult,
  apiKey?: string
): Promise<{
  description?: string;
  minTempC?: number;
  maxTempC?: number;
  minPh?: number;
  maxPh?: number;
  lightHours?: number;
  waterNeeds?: string;
  daysToGermination?: [number, number];
  daysToMaturity?: [number, number];
  spacingCm?: number;
  companions?: string[];
  antagonists?: string[];
  pests?: string[];
  diseases?: string[];
  harvestWindow?: string;
  preservation?: string[];
  culinaryUses?: string[];
  medicinalUses?: string[];
  imageUrl?: string;
  raw?: PlantDatabaseEntry | PerenualPlantDetail;
}> {
  if (result.source === 'local' && 'growingInfo' in result.raw) {
    const p = result.raw as PlantDatabaseEntry;
    return {
      description: p.description,
      minTempC: p.growingInfo.minTempC,
      maxTempC: p.growingInfo.maxTempC,
      minPh: p.growingInfo.minPh,
      maxPh: p.growingInfo.maxPh,
      lightHours: p.growingInfo.lightHours,
      waterNeeds: p.growingInfo.waterNeeds,
      daysToGermination: p.growingInfo.daysToGermination,
      daysToMaturity: p.growingInfo.daysToMaturity,
      spacingCm: p.growingInfo.spacingCm,
      companions: p.companions,
      antagonists: p.antagonists,
      pests: p.pests,
      diseases: p.diseases,
      harvestWindow: p.harvestWindow,
      preservation: p.preservation,
      culinaryUses: p.culinaryUses,
      medicinalUses: p.medicinalUses,
      imageUrl: p.imageUrl,
      raw: p,
    };
  }

  // Perenual detail fetch
  const perenualId = result.id.replace('perenual-', '');
  const detail = await getPerenualDetail(Number(perenualId), apiKey);
  if (!detail) return {};

  return {
    description: detail.description || undefined,
    minTempC: detail.hardiness ? Number(detail.hardiness.min) : undefined,
    maxTempC: detail.hardiness ? Number(detail.hardiness.max) : undefined,
    waterNeeds: detail.watering || undefined,
    lightHours: detail.sunlight ? detail.sunlight.length * 2 : undefined,
    companions: detail.attracts,
    pests: detail.pest_susceptibility,
    diseases: detail.diseases,
    culinaryUses: detail.cuisine ? [detail.cuisine] : undefined,
    medicinalUses: detail.medicinal ? ['Medicinal properties documented'] : undefined,
    imageUrl: detail.default_image?.medium_url || detail.default_image?.small_url || undefined,
    raw: detail,
  };
}

/**
 * Find a plant by exact name match in the local database.
 * Fast, offline-capable.
 */
export function findLocalPlant(name: string): PlantDatabaseEntry | undefined {
  return findPlantByName(name);
}

// Re-export types for convenience
export type { PlantDatabaseEntry };
