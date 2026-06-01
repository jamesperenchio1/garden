import { getYieldReference } from "@/data/seed-yield-references";

export interface GrowthPrediction {
  plantName: string;
  plantedDate: Date;
  daysSincePlanted: number;
  currentStage: string;
  nextMilestone: string;
  nextMilestoneDate: Date;
  predictedFloweringDate: Date | null;
  predictedFruitingDate: Date | null;
  predictedFirstHarvestDate: Date | null;
  predictedLastHarvestDate: Date | null;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  return Math.floor((b.getTime() - a.getTime()) / msPerDay);
}

export function predictPlantGrowth(
  plantName: string,
  plantedDate: Date
): GrowthPrediction {
  const ref = getYieldReference(plantName);
  const now = new Date();
  const daysSincePlanted = Math.max(0, daysBetween(plantedDate, now));

  // Default timelines when reference data is missing
  const defaultGerminationDays = 7;
  const defaultSeedlingDays = 14;
  const defaultVegetativeDays = 21;
  const defaultFloweringDays = 14;
  const defaultDaysToFirstHarvest = 60;
  const defaultDaysToLastHarvest = 120;

  const daysToFirstHarvest = ref?.daysToFirstHarvest ?? defaultDaysToFirstHarvest;
  const daysToLastHarvest = ref?.daysToLastHarvest ?? defaultDaysToLastHarvest;

  // Estimate stage durations as proportions of total cycle
  const totalCycle = daysToLastHarvest;
  const germinationEnd = defaultGerminationDays;
  const seedlingEnd = germinationEnd + defaultSeedlingDays;
  const vegetativeEnd = seedlingEnd + defaultVegetativeDays;
  const floweringEnd = vegetativeEnd + defaultFloweringDays;
  const fruitingEnd = daysToFirstHarvest;

  let currentStage = "Unknown";
  if (daysSincePlanted < germinationEnd) currentStage = "Germination";
  else if (daysSincePlanted < seedlingEnd) currentStage = "Seedling";
  else if (daysSincePlanted < vegetativeEnd) currentStage = "Vegetative";
  else if (daysSincePlanted < floweringEnd) currentStage = "Flowering";
  else if (daysSincePlanted < fruitingEnd) currentStage = "Fruiting";
  else currentStage = "Harvesting";

  // Determine next milestone
  let nextMilestone = "";
  let nextMilestoneDate = now;

  if (daysSincePlanted < germinationEnd) {
    nextMilestone = "Germination complete";
    nextMilestoneDate = addDays(plantedDate, germinationEnd);
  } else if (daysSincePlanted < seedlingEnd) {
    nextMilestone = "Seedling stage complete";
    nextMilestoneDate = addDays(plantedDate, seedlingEnd);
  } else if (daysSincePlanted < vegetativeEnd) {
    nextMilestone = "Vegetative stage complete";
    nextMilestoneDate = addDays(plantedDate, vegetativeEnd);
  } else if (daysSincePlanted < floweringEnd) {
    nextMilestone = "Flowering begins";
    nextMilestoneDate = addDays(plantedDate, floweringEnd);
  } else if (daysSincePlanted < fruitingEnd) {
    nextMilestone = "First harvest ready";
    nextMilestoneDate = addDays(plantedDate, fruitingEnd);
  } else {
    nextMilestone = "Last harvest window closes";
    nextMilestoneDate = addDays(plantedDate, daysToLastHarvest);
  }

  const predictedFloweringDate =
    floweringEnd > daysSincePlanted ? addDays(plantedDate, floweringEnd) : null;

  const predictedFruitingDate =
    fruitingEnd > daysSincePlanted ? addDays(plantedDate, fruitingEnd) : null;

  const predictedFirstHarvestDate = addDays(plantedDate, daysToFirstHarvest);
  const predictedLastHarvestDate = addDays(plantedDate, daysToLastHarvest);

  return {
    plantName,
    plantedDate,
    daysSincePlanted,
    currentStage,
    nextMilestone,
    nextMilestoneDate,
    predictedFloweringDate,
    predictedFruitingDate,
    predictedFirstHarvestDate,
    predictedLastHarvestDate,
  };
}
