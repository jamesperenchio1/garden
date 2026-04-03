export interface NutrientBrand {
  name: string;
  country: string;
  availableInThailand: boolean;
  products: NutrientProduct[];
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

export interface NutrientTarget {
  plant: string;
  stage: string;
  ec: { min: number; max: number };
  ph: { min: number; max: number };
  npk: { n: number; p: number; k: number };
  micronutrients: {
    ca: number;
    mg: number;
    s: number;
    fe: number;
    mn: number;
    zn: number;
    b: number;
    cu: number;
    mo: number;
  };
}

export const nutrientBrands: NutrientBrand[] = [
  {
    name: 'General Hydroponics Flora Series',
    country: 'USA',
    availableInThailand: true,
    products: [
      { name: 'FloraGro', type: 'base', npk: '2-1-6', mixingRatio: { ml: 2.5, perLiters: 1 }, stage: ['vegetative'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.0, max: 1.6 } },
      { name: 'FloraMicro', type: 'base', npk: '5-0-1', mixingRatio: { ml: 2.5, perLiters: 1 }, stage: ['seedling', 'vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 0.8, max: 2.0 } },
      { name: 'FloraBloom', type: 'base', npk: '0-5-4', mixingRatio: { ml: 2.5, perLiters: 1 }, stage: ['flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.2, max: 2.2 } },
    ],
  },
  {
    name: 'Hydro A+B (Thai Brand)',
    country: 'Thailand',
    availableInThailand: true,
    products: [
      { name: 'Part A', type: 'base', npk: '4-0-1', mixingRatio: { ml: 5, perLiters: 1 }, stage: ['seedling', 'vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.0, max: 2.0 } },
      { name: 'Part B', type: 'base', npk: '1-3-5', mixingRatio: { ml: 5, perLiters: 1 }, stage: ['seedling', 'vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.0, max: 2.0 } },
    ],
  },
  {
    name: 'Masterblend',
    country: 'USA',
    availableInThailand: true,
    products: [
      { name: 'Masterblend 4-18-38', type: 'base', npk: '4-18-38', mixingRatio: { ml: 2, perLiters: 1 }, stage: ['vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.0 }, targetEC: { min: 1.2, max: 2.0 } },
      { name: 'Calcium Nitrate', type: 'base', npk: '15.5-0-0', mixingRatio: { ml: 2, perLiters: 1 }, stage: ['vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.0 }, targetEC: { min: 1.2, max: 2.0 } },
      { name: 'Epsom Salt', type: 'supplement', mixingRatio: { ml: 1, perLiters: 1 }, stage: ['vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.0 }, targetEC: { min: 1.2, max: 2.0 } },
    ],
  },
];

export const nutrientTargets: NutrientTarget[] = [
  {
    plant: 'Lettuce',
    stage: 'vegetative',
    ec: { min: 0.8, max: 1.2 },
    ph: { min: 5.5, max: 6.0 },
    npk: { n: 200, p: 50, k: 200 },
    micronutrients: { ca: 200, mg: 50, s: 65, fe: 5, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Tomato',
    stage: 'vegetative',
    ec: { min: 2.0, max: 3.5 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 190, p: 40, k: 310 },
    micronutrients: { ca: 190, mg: 45, s: 65, fe: 4, mn: 0.8, zn: 0.3, b: 0.7, cu: 0.07, mo: 0.05 },
  },
  {
    plant: 'Tomato',
    stage: 'fruiting',
    ec: { min: 2.5, max: 4.0 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 150, p: 50, k: 350 },
    micronutrients: { ca: 210, mg: 50, s: 70, fe: 4, mn: 0.8, zn: 0.3, b: 0.7, cu: 0.07, mo: 0.05 },
  },
  {
    plant: 'Basil',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 45, k: 200 },
    micronutrients: { ca: 180, mg: 40, s: 55, fe: 4, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Kale',
    stage: 'vegetative',
    ec: { min: 1.2, max: 1.8 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 200, p: 60, k: 250 },
    micronutrients: { ca: 200, mg: 50, s: 65, fe: 5, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Pepper',
    stage: 'vegetative',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 190, p: 45, k: 280 },
    micronutrients: { ca: 180, mg: 45, s: 60, fe: 4, mn: 0.7, zn: 0.25, b: 0.6, cu: 0.06, mo: 0.04 },
  },
  {
    plant: 'Pepper',
    stage: 'fruiting',
    ec: { min: 2.0, max: 3.0 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 150, p: 50, k: 320 },
    micronutrients: { ca: 200, mg: 50, s: 65, fe: 4, mn: 0.7, zn: 0.25, b: 0.6, cu: 0.06, mo: 0.04 },
  },
  {
    plant: 'Cucumber',
    stage: 'vegetative',
    ec: { min: 1.5, max: 2.0 },
    ph: { min: 5.5, max: 6.0 },
    npk: { n: 200, p: 55, k: 280 },
    micronutrients: { ca: 185, mg: 45, s: 60, fe: 4, mn: 0.6, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },
  {
    plant: 'Strawberry',
    stage: 'fruiting',
    ec: { min: 1.0, max: 1.5 },
    ph: { min: 5.5, max: 6.0 },
    npk: { n: 80, p: 50, k: 180 },
    micronutrients: { ca: 100, mg: 40, s: 50, fe: 3, mn: 0.4, zn: 0.15, b: 0.4, cu: 0.03, mo: 0.02 },
  },
];

export function getNutrientTarget(plant: string, stage: string): NutrientTarget | undefined {
  return nutrientTargets.find(
    (t) => t.plant.toLowerCase() === plant.toLowerCase() && t.stage.toLowerCase() === stage.toLowerCase()
  );
}
