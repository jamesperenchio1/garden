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
  {
    name: 'BioThai',
    country: 'Thailand',
    availableInThailand: true,
    products: [
      { name: 'Organic Veggie Grow', type: 'base', npk: '3-1-4', mixingRatio: { ml: 5, perLiters: 1 }, stage: ['seedling', 'vegetative'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 0.8, max: 1.6 } },
      { name: 'Organic Fruit Bloom', type: 'base', npk: '1-3-5', mixingRatio: { ml: 5, perLiters: 1 }, stage: ['flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.0, max: 2.0 } },
      { name: 'Organic Micro', type: 'base', npk: '2-0-1', mixingRatio: { ml: 2.5, perLiters: 1 }, stage: ['seedling', 'vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 0.8, max: 2.0 } },
      { name: 'Seaweed Extract', type: 'supplement', npk: '0-0-1', mixingRatio: { ml: 2, perLiters: 1 }, stage: ['vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 0.8, max: 2.0 } },
    ],
  },
  {
    name: 'Chia Tai',
    country: 'Thailand',
    availableInThailand: true,
    products: [
      { name: 'Hi-Grow 20-20-20', type: 'base', npk: '20-20-20', mixingRatio: { ml: 1.5, perLiters: 1 }, stage: ['seedling', 'vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.0, max: 2.5 } },
      { name: 'Hi-Bloom 15-30-15', type: 'base', npk: '15-30-15', mixingRatio: { ml: 1.5, perLiters: 1 }, stage: ['flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.2, max: 2.5 } },
      { name: 'CalMag Booster', type: 'supplement', npk: '10-0-0', mixingRatio: { ml: 2, perLiters: 1 }, stage: ['vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.0, max: 2.5 } },
      { name: 'pH Down Citric', type: 'pH', mixingRatio: { ml: 1, perLiters: 1 }, stage: ['seedling', 'vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 0.8, max: 2.5 } },
    ],
  },
  {
    name: 'Green World',
    country: 'Malaysia',
    availableInThailand: true,
    products: [
      { name: 'Hydro Part A', type: 'base', npk: '5-0-2', mixingRatio: { ml: 4, perLiters: 1 }, stage: ['seedling', 'vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.0, max: 2.5 } },
      { name: 'Hydro Part B', type: 'base', npk: '2-4-6', mixingRatio: { ml: 4, perLiters: 1 }, stage: ['seedling', 'vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 1.0, max: 2.5 } },
      { name: 'Root Booster', type: 'supplement', npk: '1-2-0', mixingRatio: { ml: 2, perLiters: 1 }, stage: ['seedling', 'vegetative'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 0.8, max: 2.0 } },
      { name: 'pH Buffer', type: 'pH', mixingRatio: { ml: 1, perLiters: 1 }, stage: ['seedling', 'vegetative', 'flowering', 'fruiting'], targetPH: { min: 5.5, max: 6.5 }, targetEC: { min: 0.8, max: 2.5 } },
    ],
  },
];

export const nutrientTargets: NutrientTarget[] = [
  // Leafy greens
  {
    plant: 'Lettuce',
    stage: 'vegetative',
    ec: { min: 0.8, max: 1.2 },
    ph: { min: 5.5, max: 6.0 },
    npk: { n: 200, p: 50, k: 200 },
    micronutrients: { ca: 200, mg: 50, s: 65, fe: 5, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
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
    plant: 'Water Spinach',
    stage: 'vegetative',
    ec: { min: 0.8, max: 1.4 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 50, k: 220 },
    micronutrients: { ca: 190, mg: 48, s: 60, fe: 4.5, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Chinese Cabbage',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 200, p: 55, k: 240 },
    micronutrients: { ca: 200, mg: 50, s: 65, fe: 5, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Spinach',
    stage: 'vegetative',
    ec: { min: 0.8, max: 1.4 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 190, p: 50, k: 210 },
    micronutrients: { ca: 190, mg: 48, s: 62, fe: 5, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Malabar Spinach',
    stage: 'vegetative',
    ec: { min: 0.8, max: 1.4 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 50, k: 200 },
    micronutrients: { ca: 180, mg: 45, s: 60, fe: 4.5, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },

  // Fruiting vegetables - Tomato
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

  // Chili Pepper
  {
    plant: 'Chili Pepper',
    stage: 'vegetative',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 190, p: 45, k: 280 },
    micronutrients: { ca: 180, mg: 45, s: 60, fe: 4, mn: 0.7, zn: 0.25, b: 0.6, cu: 0.06, mo: 0.04 },
  },
  {
    plant: 'Chili Pepper',
    stage: 'fruiting',
    ec: { min: 2.0, max: 3.0 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 150, p: 50, k: 330 },
    micronutrients: { ca: 200, mg: 50, s: 65, fe: 4, mn: 0.7, zn: 0.25, b: 0.6, cu: 0.06, mo: 0.04 },
  },

  // Cucumber
  {
    plant: 'Cucumber',
    stage: 'vegetative',
    ec: { min: 1.5, max: 2.0 },
    ph: { min: 5.5, max: 6.0 },
    npk: { n: 200, p: 55, k: 280 },
    micronutrients: { ca: 185, mg: 45, s: 60, fe: 4, mn: 0.6, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },
  {
    plant: 'Cucumber',
    stage: 'fruiting',
    ec: { min: 1.8, max: 2.8 },
    ph: { min: 5.5, max: 6.0 },
    npk: { n: 160, p: 55, k: 340 },
    micronutrients: { ca: 200, mg: 50, s: 68, fe: 4, mn: 0.6, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },

  // Eggplant
  {
    plant: 'Eggplant',
    stage: 'vegetative',
    ec: { min: 2.0, max: 3.0 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 200, p: 50, k: 300 },
    micronutrients: { ca: 190, mg: 48, s: 65, fe: 4, mn: 0.7, zn: 0.25, b: 0.65, cu: 0.06, mo: 0.04 },
  },
  {
    plant: 'Eggplant',
    stage: 'fruiting',
    ec: { min: 2.5, max: 3.5 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 160, p: 55, k: 360 },
    micronutrients: { ca: 210, mg: 52, s: 70, fe: 4, mn: 0.7, zn: 0.25, b: 0.65, cu: 0.06, mo: 0.04 },
  },

  // Long Bean
  {
    plant: 'Long Bean',
    stage: 'vegetative',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 190, p: 50, k: 280 },
    micronutrients: { ca: 180, mg: 45, s: 62, fe: 4, mn: 0.7, zn: 0.22, b: 0.6, cu: 0.05, mo: 0.04 },
  },
  {
    plant: 'Long Bean',
    stage: 'fruiting',
    ec: { min: 2.0, max: 3.0 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 150, p: 55, k: 340 },
    micronutrients: { ca: 200, mg: 50, s: 68, fe: 4, mn: 0.7, zn: 0.22, b: 0.6, cu: 0.05, mo: 0.04 },
  },

  // Bitter Melon
  {
    plant: 'Bitter Melon',
    stage: 'vegetative',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 200, p: 50, k: 280 },
    micronutrients: { ca: 185, mg: 46, s: 62, fe: 4, mn: 0.7, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },
  {
    plant: 'Bitter Melon',
    stage: 'fruiting',
    ec: { min: 2.0, max: 3.0 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 160, p: 55, k: 350 },
    micronutrients: { ca: 205, mg: 50, s: 68, fe: 4, mn: 0.7, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },

  // Okra
  {
    plant: 'Okra',
    stage: 'vegetative',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 190, p: 50, k: 270 },
    micronutrients: { ca: 180, mg: 45, s: 60, fe: 4, mn: 0.7, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },
  {
    plant: 'Okra',
    stage: 'fruiting',
    ec: { min: 2.0, max: 3.0 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 150, p: 55, k: 330 },
    micronutrients: { ca: 200, mg: 50, s: 66, fe: 4, mn: 0.7, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },

  // Sweet Potato
  {
    plant: 'Sweet Potato',
    stage: 'vegetative',
    ec: { min: 1.5, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 50, k: 250 },
    micronutrients: { ca: 170, mg: 42, s: 58, fe: 3.8, mn: 0.6, zn: 0.18, b: 0.55, cu: 0.05, mo: 0.03 },
  },
  {
    plant: 'Sweet Potato',
    stage: 'fruiting',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 140, p: 60, k: 320 },
    micronutrients: { ca: 190, mg: 48, s: 64, fe: 3.8, mn: 0.6, zn: 0.18, b: 0.55, cu: 0.05, mo: 0.03 },
  },

  // Corn
  {
    plant: 'Corn',
    stage: 'vegetative',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.8, max: 6.5 },
    npk: { n: 200, p: 55, k: 280 },
    micronutrients: { ca: 180, mg: 45, s: 62, fe: 4, mn: 0.7, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },
  {
    plant: 'Corn',
    stage: 'fruiting',
    ec: { min: 2.0, max: 3.0 },
    ph: { min: 5.8, max: 6.5 },
    npk: { n: 160, p: 60, k: 340 },
    micronutrients: { ca: 200, mg: 50, s: 68, fe: 4, mn: 0.7, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },

  // Pumpkin
  {
    plant: 'Pumpkin',
    stage: 'vegetative',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 200, p: 55, k: 280 },
    micronutrients: { ca: 185, mg: 46, s: 62, fe: 4, mn: 0.7, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },
  {
    plant: 'Pumpkin',
    stage: 'fruiting',
    ec: { min: 2.0, max: 3.0 },
    ph: { min: 5.8, max: 6.3 },
    npk: { n: 150, p: 60, k: 350 },
    micronutrients: { ca: 205, mg: 50, s: 68, fe: 4, mn: 0.7, zn: 0.2, b: 0.6, cu: 0.05, mo: 0.04 },
  },

  // Radish
  {
    plant: 'Radish',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 50, k: 220 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.1, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Radish',
    stage: 'fruiting',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 140, p: 65, k: 300 },
    micronutrients: { ca: 180, mg: 46, s: 62, fe: 3.5, mn: 0.5, zn: 0.1, b: 0.5, cu: 0.04, mo: 0.03 },
  },

  // Carrot
  {
    plant: 'Carrot',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 50, k: 230 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.1, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Carrot',
    stage: 'fruiting',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 130, p: 65, k: 310 },
    micronutrients: { ca: 180, mg: 46, s: 62, fe: 3.5, mn: 0.5, zn: 0.1, b: 0.5, cu: 0.04, mo: 0.03 },
  },

  // Pepper (existing - kept for backward compatibility)
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

  // Herbs
  {
    plant: 'Basil',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 45, k: 200 },
    micronutrients: { ca: 180, mg: 40, s: 55, fe: 4, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Thai Basil',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.8 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 45, k: 210 },
    micronutrients: { ca: 180, mg: 42, s: 56, fe: 4, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Holy Basil',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 45, k: 200 },
    micronutrients: { ca: 170, mg: 40, s: 55, fe: 4, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Cilantro',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 160, p: 50, k: 200 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.05, b: 0.45, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Lemongrass',
    stage: 'vegetative',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 45, k: 220 },
    micronutrients: { ca: 170, mg: 42, s: 58, fe: 4, mn: 0.6, zn: 0.08, b: 0.5, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Galangal',
    stage: 'vegetative',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 160, p: 50, k: 210 },
    micronutrients: { ca: 160, mg: 42, s: 56, fe: 3.8, mn: 0.6, zn: 0.08, b: 0.5, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Turmeric',
    stage: 'vegetative',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 50, k: 220 },
    micronutrients: { ca: 170, mg: 42, s: 58, fe: 4, mn: 0.6, zn: 0.08, b: 0.5, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Ginger',
    stage: 'vegetative',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 50, k: 220 },
    micronutrients: { ca: 170, mg: 42, s: 58, fe: 4, mn: 0.6, zn: 0.08, b: 0.5, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Mint',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 45, k: 200 },
    micronutrients: { ca: 170, mg: 40, s: 55, fe: 3.8, mn: 0.5, zn: 0.05, b: 0.5, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Pandan',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 160, p: 45, k: 200 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.05, b: 0.45, cu: 0.02, mo: 0.01 },
  },
  {
    plant: 'Kaffir Lime',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.8 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 150, p: 45, k: 180 },
    micronutrients: { ca: 150, mg: 38, s: 52, fe: 3.5, mn: 0.5, zn: 0.05, b: 0.45, cu: 0.02, mo: 0.01 },
  },

  // Fruits / Trees
  {
    plant: 'Papaya',
    stage: 'vegetative',
    ec: { min: 1.5, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 50, k: 250 },
    micronutrients: { ca: 170, mg: 42, s: 58, fe: 3.8, mn: 0.6, zn: 0.15, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Papaya',
    stage: 'fruiting',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 140, p: 60, k: 320 },
    micronutrients: { ca: 190, mg: 48, s: 64, fe: 3.8, mn: 0.6, zn: 0.15, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Banana',
    stage: 'vegetative',
    ec: { min: 1.5, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 200, p: 50, k: 280 },
    micronutrients: { ca: 180, mg: 45, s: 62, fe: 4, mn: 0.6, zn: 0.15, b: 0.55, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Banana',
    stage: 'fruiting',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 160, p: 60, k: 340 },
    micronutrients: { ca: 200, mg: 50, s: 68, fe: 4, mn: 0.6, zn: 0.15, b: 0.55, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Dragon Fruit',
    stage: 'vegetative',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 160, p: 50, k: 220 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.12, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Dragon Fruit',
    stage: 'fruiting',
    ec: { min: 1.5, max: 2.5 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 130, p: 60, k: 300 },
    micronutrients: { ca: 180, mg: 46, s: 62, fe: 3.5, mn: 0.5, zn: 0.12, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Passion Fruit',
    stage: 'vegetative',
    ec: { min: 1.5, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 50, k: 240 },
    micronutrients: { ca: 170, mg: 42, s: 58, fe: 3.8, mn: 0.6, zn: 0.15, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Passion Fruit',
    stage: 'fruiting',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 140, p: 60, k: 310 },
    micronutrients: { ca: 190, mg: 48, s: 64, fe: 3.8, mn: 0.6, zn: 0.15, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Mango',
    stage: 'vegetative',
    ec: { min: 1.5, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 50, k: 240 },
    micronutrients: { ca: 170, mg: 42, s: 58, fe: 3.8, mn: 0.6, zn: 0.15, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Mango',
    stage: 'fruiting',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 130, p: 60, k: 310 },
    micronutrients: { ca: 190, mg: 48, s: 64, fe: 3.8, mn: 0.6, zn: 0.15, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Guava',
    stage: 'vegetative',
    ec: { min: 1.5, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 50, k: 240 },
    micronutrients: { ca: 170, mg: 42, s: 58, fe: 3.8, mn: 0.6, zn: 0.15, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Guava',
    stage: 'fruiting',
    ec: { min: 1.8, max: 2.5 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 140, p: 55, k: 300 },
    micronutrients: { ca: 190, mg: 48, s: 64, fe: 3.8, mn: 0.6, zn: 0.15, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Starfruit',
    stage: 'vegetative',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 160, p: 50, k: 220 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.12, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Starfruit',
    stage: 'fruiting',
    ec: { min: 1.5, max: 2.5 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 130, p: 60, k: 290 },
    micronutrients: { ca: 180, mg: 46, s: 62, fe: 3.5, mn: 0.5, zn: 0.12, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Lime',
    stage: 'vegetative',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 160, p: 50, k: 220 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.12, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Lime',
    stage: 'fruiting',
    ec: { min: 1.5, max: 2.5 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 130, p: 60, k: 290 },
    micronutrients: { ca: 180, mg: 46, s: 62, fe: 3.5, mn: 0.5, zn: 0.12, b: 0.5, cu: 0.04, mo: 0.03 },
  },

  // Flowers
  {
    plant: 'Marigold',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 50, k: 220 },
    micronutrients: { ca: 170, mg: 42, s: 56, fe: 3.8, mn: 0.5, zn: 0.12, b: 0.5, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Marigold',
    stage: 'flowering',
    ec: { min: 1.2, max: 1.8 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 140, p: 65, k: 300 },
    micronutrients: { ca: 180, mg: 46, s: 62, fe: 3.8, mn: 0.5, zn: 0.12, b: 0.5, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Jasmine',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 50, k: 220 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.1, b: 0.5, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Jasmine',
    stage: 'flowering',
    ec: { min: 1.2, max: 1.8 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 130, p: 65, k: 290 },
    micronutrients: { ca: 180, mg: 46, s: 62, fe: 3.5, mn: 0.5, zn: 0.1, b: 0.5, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Orchid',
    stage: 'vegetative',
    ec: { min: 0.8, max: 1.4 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 140, p: 50, k: 180 },
    micronutrients: { ca: 140, mg: 35, s: 50, fe: 3, mn: 0.4, zn: 0.08, b: 0.4, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Orchid',
    stage: 'flowering',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 110, p: 60, k: 260 },
    micronutrients: { ca: 160, mg: 42, s: 56, fe: 3, mn: 0.4, zn: 0.08, b: 0.4, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Sunflower',
    stage: 'vegetative',
    ec: { min: 1.2, max: 1.8 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 190, p: 55, k: 240 },
    micronutrients: { ca: 180, mg: 45, s: 60, fe: 4, mn: 0.6, zn: 0.15, b: 0.55, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Sunflower',
    stage: 'flowering',
    ec: { min: 1.5, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 150, p: 65, k: 310 },
    micronutrients: { ca: 200, mg: 50, s: 66, fe: 4, mn: 0.6, zn: 0.15, b: 0.55, cu: 0.04, mo: 0.03 },
  },

  // Medicinal
  {
    plant: 'Aloe Vera',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 150, p: 45, k: 180 },
    micronutrients: { ca: 150, mg: 38, s: 52, fe: 3.2, mn: 0.5, zn: 0.08, b: 0.45, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Moringa',
    stage: 'vegetative',
    ec: { min: 1.2, max: 2.0 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 180, p: 50, k: 220 },
    micronutrients: { ca: 170, mg: 42, s: 58, fe: 4, mn: 0.6, zn: 0.12, b: 0.5, cu: 0.04, mo: 0.03 },
  },
  {
    plant: 'Butterfly Pea',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 160, p: 50, k: 200 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.1, b: 0.45, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Butterfly Pea',
    stage: 'flowering',
    ec: { min: 1.2, max: 1.8 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 130, p: 60, k: 280 },
    micronutrients: { ca: 180, mg: 46, s: 62, fe: 3.5, mn: 0.5, zn: 0.1, b: 0.45, cu: 0.03, mo: 0.02 },
  },
  {
    plant: 'Centella Asiatica',
    stage: 'vegetative',
    ec: { min: 1.0, max: 1.6 },
    ph: { min: 5.5, max: 6.5 },
    npk: { n: 170, p: 50, k: 200 },
    micronutrients: { ca: 160, mg: 40, s: 55, fe: 3.5, mn: 0.5, zn: 0.08, b: 0.45, cu: 0.03, mo: 0.02 },
  },

  // Existing Strawberry (kept for backward compatibility)
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
