import type { NutrientBrand, NutrientTarget } from "@/types";

export type { NutrientBrand, NutrientTarget };

export const nutrientBrands: NutrientBrand[] = [
  {
    name: "General Hydroponics",
    country: "USA",
    products: [
      {
        name: "FloraGro",
        type: "base",
        npk: "2-1-6",
        mixingRatio: { ml: 5, perLiters: 1 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.0, max: 2.5 },
      },
      {
        name: "FloraBloom",
        type: "base",
        npk: "0-5-4",
        mixingRatio: { ml: 5, perLiters: 1 },
        stage: ["vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.0, max: 2.5 },
      },
      {
        name: "FloraMicro",
        type: "base",
        npk: "5-0-1",
        mixingRatio: { ml: 5, perLiters: 1 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.0, max: 2.5 },
      },
      {
        name: "CaliMagic",
        type: "supplement",
        npk: "1-0-0",
        mixingRatio: { ml: 5, perLiters: 1 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.0, max: 2.5 },
      },
      {
        name: "pH Down",
        type: "pH",
        mixingRatio: { ml: 1, perLiters: 10 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.0, max: 2.5 },
      },
    ],
  },
  {
    name: "Hydro A+B Thai",
    country: "Thailand",
    products: [
      {
        name: "Hydro A",
        type: "base",
        npk: "5-0-5",
        mixingRatio: { ml: 4, perLiters: 1 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.8, max: 6.3 },
        targetEC: { min: 1.2, max: 2.8 },
      },
      {
        name: "Hydro B",
        type: "base",
        npk: "2-5-3",
        mixingRatio: { ml: 4, perLiters: 1 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.8, max: 6.3 },
        targetEC: { min: 1.2, max: 2.8 },
      },
      {
        name: "Root Booster",
        type: "supplement",
        npk: "0-1-0",
        mixingRatio: { ml: 2, perLiters: 1 },
        stage: ["seedling", "vegetative"],
        targetPH: { min: 5.8, max: 6.3 },
        targetEC: { min: 1.2, max: 2.8 },
      },
    ],
  },
  {
    name: "Masterblend",
    country: "USA",
    products: [
      {
        name: "Masterblend 4-18-38",
        type: "base",
        npk: "4-18-38",
        mixingRatio: { ml: 2, perLiters: 1 },
        stage: ["vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.5, max: 3.0 },
      },
      {
        name: "Calcium Nitrate",
        type: "supplement",
        npk: "15.5-0-0",
        mixingRatio: { ml: 2, perLiters: 1 },
        stage: ["vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.5, max: 3.0 },
      },
      {
        name: "Epsom Salt",
        type: "supplement",
        npk: "0-0-0",
        mixingRatio: { ml: 1, perLiters: 1 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.5, max: 3.0 },
      },
    ],
  },
  {
    name: "BioThai",
    country: "Thailand",
    products: [
      {
        name: "Bio Grow",
        type: "base",
        npk: "3-1-4",
        mixingRatio: { ml: 5, perLiters: 1 },
        stage: ["seedling", "vegetative"],
        targetPH: { min: 6.0, max: 6.8 },
        targetEC: { min: 0.8, max: 1.8 },
      },
      {
        name: "Bio Bloom",
        type: "base",
        npk: "1-3-5",
        mixingRatio: { ml: 5, perLiters: 1 },
        stage: ["flowering", "fruiting"],
        targetPH: { min: 6.0, max: 6.8 },
        targetEC: { min: 0.8, max: 1.8 },
      },
      {
        name: "Fish Emulsion",
        type: "supplement",
        npk: "5-1-1",
        mixingRatio: { ml: 10, perLiters: 1 },
        stage: ["vegetative", "flowering"],
        targetPH: { min: 6.0, max: 6.8 },
        targetEC: { min: 0.8, max: 1.8 },
      },
      {
        name: "Seaweed Extract",
        type: "supplement",
        npk: "0-0-1",
        mixingRatio: { ml: 5, perLiters: 1 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 6.0, max: 6.8 },
        targetEC: { min: 0.8, max: 1.8 },
      },
    ],
  },
  {
    name: "Chia Tai",
    country: "Thailand",
    products: [
      {
        name: "Chia Tai A",
        type: "base",
        npk: "18-18-18",
        mixingRatio: { ml: 3, perLiters: 1 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.0, max: 2.5 },
      },
      {
        name: "Chia Tai Fruiting",
        type: "base",
        npk: "10-20-30",
        mixingRatio: { ml: 3, perLiters: 1 },
        stage: ["flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.0, max: 2.5 },
      },
      {
        name: "Micronutrient Mix",
        type: "supplement",
        npk: "0-0-0",
        mixingRatio: { ml: 2, perLiters: 1 },
        stage: ["seedling", "vegetative", "flowering", "fruiting"],
        targetPH: { min: 5.5, max: 6.5 },
        targetEC: { min: 1.0, max: 2.5 },
      },
    ],
  },
];

export const nutrientTargets: NutrientTarget[] = [
  // Tomatoes
  { plant: "tomato", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 150, p: 80, k: 150 }, micronutrients: { ca: 120, mg: 40, s: 50, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "tomato", stage: "vegetative", ec: { min: 1.5, max: 2.2 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 200, p: 60, k: 200 }, micronutrients: { ca: 150, mg: 50, s: 60, fe: 3.0, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "tomato", stage: "flowering", ec: { min: 2.0, max: 3.0 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 180, p: 90, k: 280 }, micronutrients: { ca: 180, mg: 55, s: 70, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "tomato", stage: "fruiting", ec: { min: 2.2, max: 3.5 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 160, p: 80, k: 320 }, micronutrients: { ca: 200, mg: 60, s: 75, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Chili / Pepper
  { plant: "chili", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.2 }, npk: { n: 140, p: 80, k: 140 }, micronutrients: { ca: 110, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "chili", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 5.5, max: 6.2 }, npk: { n: 190, p: 60, k: 190 }, micronutrients: { ca: 140, mg: 50, s: 55, fe: 3.0, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "chili", stage: "flowering", ec: { min: 1.8, max: 2.8 }, ph: { min: 5.5, max: 6.2 }, npk: { n: 170, p: 90, k: 260 }, micronutrients: { ca: 170, mg: 55, s: 65, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "chili", stage: "fruiting", ec: { min: 2.0, max: 3.2 }, ph: { min: 5.5, max: 6.2 }, npk: { n: 150, p: 80, k: 300 }, micronutrients: { ca: 190, mg: 60, s: 70, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Cucumber
  { plant: "cucumber", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 140, p: 70, k: 140 }, micronutrients: { ca: 120, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "cucumber", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 190, p: 60, k: 190 }, micronutrients: { ca: 150, mg: 50, s: 55, fe: 3.0, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "cucumber", stage: "flowering", ec: { min: 1.8, max: 2.8 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 170, p: 80, k: 260 }, micronutrients: { ca: 180, mg: 55, s: 65, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "cucumber", stage: "fruiting", ec: { min: 2.0, max: 3.0 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 160, p: 70, k: 300 }, micronutrients: { ca: 200, mg: 60, s: 70, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Eggplant
  { plant: "eggplant", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 130, p: 70, k: 130 }, micronutrients: { ca: 110, mg: 35, s: 40, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "eggplant", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 180, p: 60, k: 180 }, micronutrients: { ca: 140, mg: 45, s: 50, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "eggplant", stage: "flowering", ec: { min: 1.8, max: 2.6 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 160, p: 80, k: 240 }, micronutrients: { ca: 170, mg: 50, s: 60, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "eggplant", stage: "fruiting", ec: { min: 2.0, max: 3.0 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 150, p: 70, k: 280 }, micronutrients: { ca: 190, mg: 55, s: 65, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Lettuce
  { plant: "lettuce", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 120, p: 60, k: 140 }, micronutrients: { ca: 100, mg: 30, s: 40, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "lettuce", stage: "vegetative", ec: { min: 1.0, max: 1.6 }, ph: { min: 5.5, max: 6.0 }, npk: { n: 170, p: 50, k: 180 }, micronutrients: { ca: 130, mg: 40, s: 50, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Kale
  { plant: "kale", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 140, p: 60, k: 140 }, micronutrients: { ca: 120, mg: 35, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "kale", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 190, p: 50, k: 180 }, micronutrients: { ca: 150, mg: 45, s: 55, fe: 3.0, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },

  // Basil
  { plant: "basil", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 50, k: 120 }, micronutrients: { ca: 90, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "basil", stage: "vegetative", ec: { min: 1.0, max: 1.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 170, p: 40, k: 160 }, micronutrients: { ca: 120, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Okra
  { plant: "okra", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 6.0, max: 6.8 }, npk: { n: 130, p: 70, k: 130 }, micronutrients: { ca: 110, mg: 35, s: 40, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "okra", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 6.0, max: 6.8 }, npk: { n: 180, p: 60, k: 180 }, micronutrients: { ca: 140, mg: 45, s: 50, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "okra", stage: "flowering", ec: { min: 1.8, max: 2.6 }, ph: { min: 6.0, max: 6.8 }, npk: { n: 160, p: 80, k: 240 }, micronutrients: { ca: 170, mg: 50, s: 60, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "okra", stage: "fruiting", ec: { min: 2.0, max: 3.0 }, ph: { min: 6.0, max: 6.8 }, npk: { n: 150, p: 70, k: 280 }, micronutrients: { ca: 190, mg: 55, s: 65, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Long Bean (Yardlong Bean)
  { plant: "long bean", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 6.0, max: 6.5 }, npk: { n: 130, p: 60, k: 130 }, micronutrients: { ca: 110, mg: 35, s: 40, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "long bean", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 6.0, max: 6.5 }, npk: { n: 170, p: 50, k: 170 }, micronutrients: { ca: 140, mg: 45, s: 50, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "long bean", stage: "flowering", ec: { min: 1.6, max: 2.4 }, ph: { min: 6.0, max: 6.5 }, npk: { n: 150, p: 70, k: 220 }, micronutrients: { ca: 160, mg: 50, s: 55, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "long bean", stage: "fruiting", ec: { min: 1.8, max: 2.6 }, ph: { min: 6.0, max: 6.5 }, npk: { n: 140, p: 60, k: 260 }, micronutrients: { ca: 180, mg: 55, s: 60, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Papaya
  { plant: "papaya", stage: "seedling", ec: { min: 1.0, max: 1.4 }, ph: { min: 6.0, max: 6.8 }, npk: { n: 150, p: 80, k: 150 }, micronutrients: { ca: 130, mg: 40, s: 50, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "papaya", stage: "vegetative", ec: { min: 1.5, max: 2.2 }, ph: { min: 6.0, max: 6.8 }, npk: { n: 200, p: 60, k: 200 }, micronutrients: { ca: 160, mg: 50, s: 60, fe: 3.0, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "papaya", stage: "flowering", ec: { min: 2.0, max: 2.8 }, ph: { min: 6.0, max: 6.8 }, npk: { n: 180, p: 90, k: 280 }, micronutrients: { ca: 190, mg: 55, s: 70, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "papaya", stage: "fruiting", ec: { min: 2.0, max: 3.0 }, ph: { min: 6.0, max: 6.8 }, npk: { n: 170, p: 80, k: 320 }, micronutrients: { ca: 210, mg: 60, s: 75, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Bok Choy (Pak Bung)
  { plant: "bok choy", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 60, k: 140 }, micronutrients: { ca: 100, mg: 30, s: 40, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "bok choy", stage: "vegetative", ec: { min: 1.0, max: 1.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 170, p: 50, k: 180 }, micronutrients: { ca: 130, mg: 40, s: 50, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Chinese Broccoli (Kailan)
  { plant: "chinese broccoli", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 140, p: 60, k: 140 }, micronutrients: { ca: 110, mg: 35, s: 45, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "chinese broccoli", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 190, p: 50, k: 170 }, micronutrients: { ca: 140, mg: 45, s: 55, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },

  // Water Spinach (Pak Boong)
  { plant: "water spinach", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 130, p: 50, k: 130 }, micronutrients: { ca: 100, mg: 30, s: 40, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "water spinach", stage: "vegetative", ec: { min: 1.0, max: 1.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 170, p: 40, k: 160 }, micronutrients: { ca: 120, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Coriander
  { plant: "coriander", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.8, max: 6.5 }, npk: { n: 110, p: 50, k: 110 }, micronutrients: { ca: 80, mg: 25, s: 30, fe: 1.5, mn: 0.3, zn: 0.2, b: 0.2, cu: 0.05, mo: 0.03 } },
  { plant: "coriander", stage: "vegetative", ec: { min: 1.0, max: 1.4 }, ph: { min: 5.8, max: 6.5 }, npk: { n: 150, p: 40, k: 140 }, micronutrients: { ca: 100, mg: 35, s: 40, fe: 2.0, mn: 0.4, zn: 0.3, b: 0.3, cu: 0.1, mo: 0.04 } },

  // Mint
  { plant: "mint", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 50, k: 120 }, micronutrients: { ca: 90, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "mint", stage: "vegetative", ec: { min: 1.0, max: 1.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 40, k: 150 }, micronutrients: { ca: 110, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Lemongrass
  { plant: "lemongrass", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 130, p: 50, k: 130 }, micronutrients: { ca: 100, mg: 30, s: 40, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "lemongrass", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 170, p: 40, k: 160 }, micronutrients: { ca: 120, mg: 40, s: 50, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Green Onion
  { plant: "green onion", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 50, k: 120 }, micronutrients: { ca: 90, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "green onion", stage: "vegetative", ec: { min: 1.0, max: 1.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 40, k: 140 }, micronutrients: { ca: 110, mg: 35, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Spring Onion
  { plant: "spring onion", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 50, k: 120 }, micronutrients: { ca: 90, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "spring onion", stage: "vegetative", ec: { min: 1.0, max: 1.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 40, k: 140 }, micronutrients: { ca: 110, mg: 35, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Bitter Melon
  { plant: "bitter melon", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 130, p: 70, k: 130 }, micronutrients: { ca: 110, mg: 35, s: 40, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "bitter melon", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 180, p: 60, k: 180 }, micronutrients: { ca: 140, mg: 45, s: 50, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "bitter melon", stage: "flowering", ec: { min: 1.8, max: 2.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 80, k: 240 }, micronutrients: { ca: 170, mg: 50, s: 60, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "bitter melon", stage: "fruiting", ec: { min: 2.0, max: 3.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 150, p: 70, k: 280 }, micronutrients: { ca: 190, mg: 55, s: 65, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Pumpkin
  { plant: "pumpkin", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 130, p: 70, k: 130 }, micronutrients: { ca: 110, mg: 35, s: 40, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "pumpkin", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 180, p: 60, k: 180 }, micronutrients: { ca: 140, mg: 45, s: 50, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "pumpkin", stage: "flowering", ec: { min: 1.8, max: 2.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 80, k: 240 }, micronutrients: { ca: 170, mg: 50, s: 60, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "pumpkin", stage: "fruiting", ec: { min: 2.0, max: 3.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 150, p: 70, k: 280 }, micronutrients: { ca: 190, mg: 55, s: 65, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Winged Bean
  { plant: "winged bean", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 60, k: 120 }, micronutrients: { ca: 100, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "winged bean", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 50, k: 160 }, micronutrients: { ca: 130, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "winged bean", stage: "flowering", ec: { min: 1.6, max: 2.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 140, p: 70, k: 200 }, micronutrients: { ca: 150, mg: 45, s: 50, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "winged bean", stage: "fruiting", ec: { min: 1.8, max: 2.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 130, p: 60, k: 240 }, micronutrients: { ca: 170, mg: 50, s: 55, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },

  // Galangal
  { plant: "galangal", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 130, p: 50, k: 130 }, micronutrients: { ca: 100, mg: 30, s: 40, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "galangal", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 170, p: 40, k: 160 }, micronutrients: { ca: 120, mg: 40, s: 50, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Turmeric
  { plant: "turmeric", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 60, k: 120 }, micronutrients: { ca: 100, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "turmeric", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 50, k: 160 }, micronutrients: { ca: 130, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Fingerroot
  { plant: "fingerroot", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 50, k: 120 }, micronutrients: { ca: 100, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "fingerroot", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 40, k: 150 }, micronutrients: { ca: 120, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Shallot
  { plant: "shallot", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 60, k: 120 }, micronutrients: { ca: 90, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "shallot", stage: "vegetative", ec: { min: 1.0, max: 1.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 150, p: 50, k: 140 }, micronutrients: { ca: 110, mg: 35, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Garlic
  { plant: "garlic", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 60, k: 120 }, micronutrients: { ca: 90, mg: 30, s: 40, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "garlic", stage: "vegetative", ec: { min: 1.0, max: 1.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 150, p: 50, k: 140 }, micronutrients: { ca: 110, mg: 35, s: 50, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Radish
  { plant: "radish", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 110, p: 60, k: 120 }, micronutrients: { ca: 90, mg: 25, s: 30, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "radish", stage: "vegetative", ec: { min: 1.0, max: 1.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 140, p: 50, k: 140 }, micronutrients: { ca: 100, mg: 35, s: 40, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Carrot
  { plant: "carrot", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 100, p: 60, k: 120 }, micronutrients: { ca: 90, mg: 25, s: 30, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "carrot", stage: "vegetative", ec: { min: 1.0, max: 1.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 130, p: 50, k: 140 }, micronutrients: { ca: 100, mg: 35, s: 40, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Sweet Potato
  { plant: "sweet potato", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 60, k: 120 }, micronutrients: { ca: 100, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "sweet potato", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 50, k: 160 }, micronutrients: { ca: 130, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Cassava
  { plant: "cassava", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 60, k: 120 }, micronutrients: { ca: 100, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "cassava", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 50, k: 160 }, micronutrients: { ca: 130, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Corn
  { plant: "corn", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.8, max: 6.8 }, npk: { n: 140, p: 60, k: 140 }, micronutrients: { ca: 110, mg: 35, s: 40, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "corn", stage: "vegetative", ec: { min: 1.5, max: 2.2 }, ph: { min: 5.8, max: 6.8 }, npk: { n: 200, p: 50, k: 180 }, micronutrients: { ca: 150, mg: 45, s: 55, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "corn", stage: "flowering", ec: { min: 2.0, max: 2.8 }, ph: { min: 5.8, max: 6.8 }, npk: { n: 180, p: 70, k: 240 }, micronutrients: { ca: 180, mg: 50, s: 65, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "corn", stage: "fruiting", ec: { min: 2.0, max: 3.0 }, ph: { min: 5.8, max: 6.8 }, npk: { n: 170, p: 60, k: 280 }, micronutrients: { ca: 200, mg: 55, s: 70, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Yardlong Bean
  { plant: "yardlong bean", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 6.0, max: 6.5 }, npk: { n: 130, p: 60, k: 130 }, micronutrients: { ca: 110, mg: 35, s: 40, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "yardlong bean", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 6.0, max: 6.5 }, npk: { n: 170, p: 50, k: 170 }, micronutrients: { ca: 140, mg: 45, s: 50, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "yardlong bean", stage: "flowering", ec: { min: 1.6, max: 2.4 }, ph: { min: 6.0, max: 6.5 }, npk: { n: 150, p: 70, k: 220 }, micronutrients: { ca: 160, mg: 50, s: 55, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "yardlong bean", stage: "fruiting", ec: { min: 1.8, max: 2.6 }, ph: { min: 6.0, max: 6.5 }, npk: { n: 140, p: 60, k: 260 }, micronutrients: { ca: 180, mg: 55, s: 60, fe: 3.0, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Roselle
  { plant: "roselle", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 60, k: 120 }, micronutrients: { ca: 100, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "roselle", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 50, k: 160 }, micronutrients: { ca: 130, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "roselle", stage: "flowering", ec: { min: 1.6, max: 2.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 140, p: 70, k: 200 }, micronutrients: { ca: 150, mg: 45, s: 50, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "roselle", stage: "fruiting", ec: { min: 1.8, max: 2.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 130, p: 60, k: 240 }, micronutrients: { ca: 170, mg: 50, s: 55, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },

  // Moringa
  { plant: "moringa", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 6.0, max: 7.0 }, npk: { n: 130, p: 50, k: 130 }, micronutrients: { ca: 120, mg: 35, s: 40, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "moringa", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 6.0, max: 7.0 }, npk: { n: 170, p: 40, k: 160 }, micronutrients: { ca: 150, mg: 45, s: 50, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Morning Glory (Pak Boong)
  { plant: "morning glory", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 130, p: 50, k: 130 }, micronutrients: { ca: 100, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "morning glory", stage: "vegetative", ec: { min: 1.0, max: 1.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 170, p: 40, k: 160 }, micronutrients: { ca: 120, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Swamp Cabbage (Pak Good)
  { plant: "swamp cabbage", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 110, p: 50, k: 110 }, micronutrients: { ca: 90, mg: 25, s: 30, fe: 1.5, mn: 0.3, zn: 0.2, b: 0.2, cu: 0.05, mo: 0.03 } },
  { plant: "swamp cabbage", stage: "vegetative", ec: { min: 1.0, max: 1.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 150, p: 40, k: 140 }, micronutrients: { ca: 110, mg: 35, s: 40, fe: 2.0, mn: 0.4, zn: 0.3, b: 0.3, cu: 0.1, mo: 0.04 } },

  // Perilla (Bai Yira)
  { plant: "perilla", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 50, k: 120 }, micronutrients: { ca: 90, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "perilla", stage: "vegetative", ec: { min: 1.0, max: 1.4 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 40, k: 150 }, micronutrients: { ca: 110, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Pandan
  { plant: "pandan", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 50, k: 120 }, micronutrients: { ca: 100, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "pandan", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 40, k: 160 }, micronutrients: { ca: 130, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Chili Pepper (Thai Bird)
  { plant: "thai bird chili", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.2 }, npk: { n: 140, p: 80, k: 140 }, micronutrients: { ca: 110, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "thai bird chili", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 5.5, max: 6.2 }, npk: { n: 190, p: 60, k: 190 }, micronutrients: { ca: 140, mg: 50, s: 55, fe: 3.0, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },
  { plant: "thai bird chili", stage: "flowering", ec: { min: 1.8, max: 2.8 }, ph: { min: 5.5, max: 6.2 }, npk: { n: 170, p: 90, k: 260 }, micronutrients: { ca: 170, mg: 55, s: 65, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },
  { plant: "thai bird chili", stage: "fruiting", ec: { min: 2.0, max: 3.2 }, ph: { min: 5.5, max: 6.2 }, npk: { n: 150, p: 80, k: 300 }, micronutrients: { ca: 190, mg: 60, s: 70, fe: 3.5, mn: 0.7, zn: 0.5, b: 0.6, cu: 0.15, mo: 0.06 } },

  // Celery
  { plant: "celery", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.8, max: 6.5 }, npk: { n: 120, p: 60, k: 140 }, micronutrients: { ca: 110, mg: 30, s: 40, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "celery", stage: "vegetative", ec: { min: 1.2, max: 1.8 }, ph: { min: 5.8, max: 6.5 }, npk: { n: 180, p: 50, k: 180 }, micronutrients: { ca: 150, mg: 40, s: 50, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },

  // Cabbage
  { plant: "cabbage", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 140, p: 60, k: 140 }, micronutrients: { ca: 120, mg: 35, s: 45, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "cabbage", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 200, p: 50, k: 180 }, micronutrients: { ca: 160, mg: 45, s: 55, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },

  // Cauliflower
  { plant: "cauliflower", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 140, p: 60, k: 140 }, micronutrients: { ca: 120, mg: 35, s: 45, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "cauliflower", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 200, p: 50, k: 180 }, micronutrients: { ca: 160, mg: 45, s: 55, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },

  // Broccoli
  { plant: "broccoli", stage: "seedling", ec: { min: 0.8, max: 1.2 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 140, p: 60, k: 140 }, micronutrients: { ca: 120, mg: 35, s: 45, fe: 2.0, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
  { plant: "broccoli", stage: "vegetative", ec: { min: 1.4, max: 2.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 200, p: 50, k: 180 }, micronutrients: { ca: 160, mg: 45, s: 55, fe: 2.5, mn: 0.6, zn: 0.4, b: 0.5, cu: 0.1, mo: 0.05 } },

  // Spinach
  { plant: "spinach", stage: "seedling", ec: { min: 0.6, max: 1.0 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 120, p: 50, k: 120 }, micronutrients: { ca: 90, mg: 30, s: 35, fe: 2.0, mn: 0.4, zn: 0.2, b: 0.3, cu: 0.05, mo: 0.04 } },
  { plant: "spinach", stage: "vegetative", ec: { min: 1.0, max: 1.6 }, ph: { min: 5.5, max: 6.5 }, npk: { n: 160, p: 40, k: 150 }, micronutrients: { ca: 110, mg: 40, s: 45, fe: 2.5, mn: 0.5, zn: 0.3, b: 0.4, cu: 0.1, mo: 0.05 } },
];

export function getNutrientTarget(plant: string, stage: string): NutrientTarget | undefined {
  return nutrientTargets.find(
    (t) => t.plant.toLowerCase() === plant.toLowerCase() && t.stage.toLowerCase() === stage.toLowerCase()
  );
}
