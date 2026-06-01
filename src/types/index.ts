export type PlantCategory = 'vegetable' | 'herb' | 'fruit' | 'flower' | 'ornamental' | 'medicinal';
export type GrowingMethod = 'soil' | 'hydroponic' | 'aeroponic' | 'aquaponic';
export type HealthSeverity = 'low' | 'medium' | 'high';
export type YieldRating = 'none' | 'very_low' | 'low' | 'moderate' | 'high' | 'very_high' | 'exceptional';

export interface HealthTag {
  category: string;
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
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Photo {
  id?: number;
  plantId: number;
  blob: Blob;
  thumbnail: Blob;
  type: 'plant' | 'seedPacket';
  createdAt: Date;
}

export interface LogEntry {
  id?: number;
  plantId: number;
  type: string;
  title: string;
  description?: string;
  createdAt: Date;
}

export interface YieldRecord {
  id?: number;
  plantId: number;
  amountGrams: number;
  rating: YieldRating;
  notes?: string;
  harvestedAt: Date;
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

export interface Task {
  id?: number;
  plantId?: number;
  type: 'water' | 'fertilize' | 'prune' | 'harvest' | 'pest_control' | 'custom';
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  recurring?: { interval: number; unit: 'days' | 'weeks' | 'months' };
  createdAt: Date;
}

export interface PlantingWindow {
  plantName: string;
  plantCategory: PlantCategory;
  sowIndoors?: { start: number; end: number };
  sowOutdoors?: { start: number; end: number };
  transplant?: { start: number; end: number };
  harvest: { start: number; end: number };
  notes: string;
}

export type SystemType = 'nft' | 'dwc' | 'ebb_flow' | 'drip' | 'aeroponics' | 'wicking' | 'dutch_bucket' | 'kratky' | 'vertical_tower' | 'rail_gutter' | 'aquaponics';
export type ComponentType = 'reservoir' | 'pump' | 'pipe' | 'gutter' | 'net_pot' | 'grow_bed' | 'air_stone' | 'valve' | 'drip_emitter' | 'wicking_material' | 'vertical_tower' | 'fish_tank' | 'timer';

export interface Vec3 { x: number; y: number; z: number; }

export interface Connection {
  toId: string;
  waypoints: Vec3[];
  lengthOverride?: number;
}

export interface SystemComponent {
  id: string;
  type: ComponentType;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  connections: Connection[];
  properties: Record<string, number | string | boolean>;
}

export interface HydroSystem {
  id?: number;
  name: string;
  type: SystemType;
  components: SystemComponent[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowIssue {
  type: 'dead_spot' | 'pressure_drop' | 'undersized_pipe' | 'overflow';
  componentId: string;
  severity: 'warning' | 'critical';
  description: string;
}

export interface SoilBed {
  id?: number;
  name: string;
  widthCm: number;
  heightCm: number;
  plants: BedPlant[];
  createdAt: Date;
}

export interface BedPlant {
  plantName: string;
  x: number;
  y: number;
  spacingRadius: number;
}

export interface CompanionRelation {
  plantA: string;
  plantB: string;
  relationship: 'beneficial' | 'harmful' | 'neutral';
  reason: string;
}

export interface WeatherData {
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    weatherCode: number;
    precipitation: number;
    uvIndex: number;
    pressure: number;
    dewPoint: number;
    cloudCover: number;
    visibility: number;
  };
  hourly: {
    time: string[];
    temperature: number[];
    weatherCode: number[];
    precipitation: number[];
    humidity: number[];
  };
  daily: {
    time: string[];
    weatherCode: number[];
    temperatureMax: number[];
    temperatureMin: number[];
    precipitationSum: number[];
    precipitationProbabilityMax: number[];
    windSpeedMax: number[];
    uvIndexMax: number[];
    sunrise: string[];
    sunset: string[];
    precipitationHours: number[];
    et0: number[];
  };
  soil: {
    soilTemperature0cm?: number[];
    soilTemperature6cm?: number[];
    soilTemperature18cm?: number[];
    soilMoisture0to1cm?: number[];
    soilMoisture1to3cm?: number[];
    soilMoisture3to9cm?: number[];
  };
}

export interface MoonPhase {
  phase: number;
  illumination: number;
  plantingAdvice: string;
}

export interface NutrientTarget {
  plant: string;
  stage: string;
  ec: { min: number; max: number };
  ph: { min: number; max: number };
  npk: { n: number; p: number; k: number };
  micronutrients: {
    ca: number; mg: number; s: number; fe: number; mn: number;
    zn: number; b: number; cu: number; mo: number;
  };
}

export interface NutrientProduct {
  name: string;
  type: 'base' | 'supplement' | 'pH';
  npk?: string;
  mixingRatio: { ml: number; perLiters: number };
  stage: ('seedling' | 'vegetative' | 'flowering' | 'fruiting')[];
  targetPH: { min: number; max: number };
  targetEC: { min: number; max: number };
}

export interface NutrientBrand {
  name: string;
  country: string;
  products: NutrientProduct[];
}

export interface CustomPlant {
  id?: number;
  name: string;
  category: PlantCategory;
  growingMethod: GrowingMethod;
  sunNeeds: string;
  waterNeeds: string;
  soilType: string;
  daysToGermination: number;
  daysToMaturity: number;
  companions: string[];
  antagonists: string[];
  commonPests: string[];
  commonDiseases: string[];
  notes?: string;
}

export interface IoTDevice {
  id: string;
  name: string;
  type: 'ph_sensor' | 'ec_sensor' | 'temp_sensor' | 'humidity_sensor' | 'light_sensor' | 'flow_meter' | 'pump_controller' | 'valve_controller' | 'camera' | 'weather_station';
  connected: boolean;
  lastReading?: { value: number; unit: string; timestamp: Date };
  batteryLevel?: number;
  location?: string;
  alertsEnabled: boolean;
  thresholdMin?: number;
  thresholdMax?: number;
}
