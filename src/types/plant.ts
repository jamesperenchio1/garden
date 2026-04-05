export type PlantCategory = 'vegetable' | 'herb' | 'fruit' | 'flower' | 'ornamental' | 'medicinal';
export type GrowingMethod = 'soil' | 'hydroponic' | 'aeroponic' | 'aquaponic';
export type HealthTagCategory = 'overall' | 'pest' | 'disease' | 'nutrient' | 'environmental';
export type HealthSeverity = 'low' | 'medium' | 'high';
export type PhotoType = 'plant' | 'seedPacket';
export type LogEntryType = 'note' | 'health' | 'photo' | 'action';

export interface HealthTag {
  category: HealthTagCategory;
  value: string;
  severity: HealthSeverity;
  addedAt: Date;
}

export interface Plant {
  id?: number;
  name: string;
  variety?: string;
  category: PlantCategory;
  growingMethod: GrowingMethod;
  systemType?: string;
  location?: string;
  plantedDate: Date;
  healthTags: HealthTag[];
  tags: string[];
  trefleId?: number;
  perenualId?: number;
  seedPacketPhotoId?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id?: number;
  plantId: number;
  blob: Blob;
  thumbnail: Blob;
  type: PhotoType;
  note?: string;
  createdAt: Date;
}

export interface LogEntry {
  id?: number;
  plantId: number;
  type: LogEntryType;
  title: string;
  content?: string;
  photoId?: number;
  healthTags?: HealthTag[];
  createdAt: Date;
}

// ── Yield tracking ──────────────────────────────────────────────────────────

export type YieldRating = 'none' | 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' | 'exceptional';

export interface YieldRecord {
  id?: number;
  plantId: number;
  amountGrams: number;
  rating: YieldRating;
  notes?: string;
  harvestedAt: Date;
  createdAt: Date;
}

export interface CustomPlant {
  id?: number;
  name: string;
  scientificName?: string;
  variety?: string;
  category: PlantCategory;
  notes?: string;
  trefleId?: number;
  imageUrl?: string;
  source: 'user' | 'trefle';
  createdAt: Date;
}

export interface YieldReference {
  id?: number;
  plantName: string;
  category: PlantCategory;
  expectedYieldGramsPerPlant: number;
  yieldUnit: string;
  daysToFirstHarvest: number;
  daysToLastHarvest: number;
  harvestsPerSeason: number;
  yieldRatingThresholds: {
    veryLow: number;
    low: number;
    moderate: number;
    high: number;
    veryHigh: number;
  };
  tips: string;
}
