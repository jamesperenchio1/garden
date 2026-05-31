import { findPlantByName } from '@/data/plant-database';

export interface GrowthMilestone {
  stage: 'germination' | 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest' | 'dormant';
  label: string;
  dayStart: number;
  dayEnd: number;
  description: string;
}

export interface PlantPrediction {
  milestones: GrowthMilestone[];
  predictedFloweringDate?: Date;
  predictedFruitingDate?: Date;
  predictedFirstHarvestDate?: Date;
  predictedLastHarvestDate?: Date;
  daysToNextMilestone: number;
  nextMilestoneLabel: string;
  currentStage: GrowthMilestone['stage'];
}

/**
 * Predict growth milestones based on planting date and plant type.
 */
export function predictPlantGrowth(
  plantName: string,
  plantedDate: Date
): PlantPrediction {
  const dbPlant = findPlantByName(plantName);
  const now = new Date();
  const daysSincePlanted = Math.floor((now.getTime() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));

  const germinationDays = dbPlant?.growingInfo.daysToGermination ?? [5, 14];
  const maturityDays = dbPlant?.growingInfo.daysToMaturity ?? [60, 90];
  const avgGermination = Math.round((germinationDays[0] + germinationDays[1]) / 2);
  const avgMaturity = Math.round((maturityDays[0] + maturityDays[1]) / 2);

  // Build milestone timeline
  const milestones: GrowthMilestone[] = [
    {
      stage: 'germination',
      label: 'Germination',
      dayStart: 0,
      dayEnd: avgGermination,
      description: 'Seeds sprout and roots establish. Keep moist and warm.',
    },
    {
      stage: 'seedling',
      label: 'Seedling',
      dayStart: avgGermination,
      dayEnd: avgGermination + 14,
      description: 'First true leaves appear. Protect from intense sun and pests.',
    },
    {
      stage: 'vegetative',
      label: 'Vegetative Growth',
      dayStart: avgGermination + 14,
      dayEnd: Math.round(avgMaturity * 0.6),
      description: 'Rapid leaf and stem growth. Ensure adequate nutrients and water.',
    },
  ];

  // Fruiting plants get flowering + fruiting milestones
  const isFruiting = dbPlant?.category === 'fruit' ||
    ['Tomato', 'Chili Pepper', 'Cucumber', 'Eggplant', 'Bitter Melon', 'Okra', 'Long Bean', 'Pumpkin', 'Papaya', 'Banana', 'Dragon Fruit', 'Passion Fruit', 'Mango', 'Guava', 'Starfruit', 'Lime'].some(
      (n) => plantName.toLowerCase().includes(n.toLowerCase())
    );

  if (isFruiting) {
    const floweringStart = Math.round(avgMaturity * 0.5);
    const floweringEnd = Math.round(avgMaturity * 0.7);
    const fruitingStart = floweringEnd;
    const fruitingEnd = avgMaturity;

    milestones.push({
      stage: 'flowering',
      label: 'Flowering',
      dayStart: floweringStart,
      dayEnd: floweringEnd,
      description: 'Buds form and open. Pollination is critical. Avoid overwatering.',
    });
    milestones.push({
      stage: 'fruiting',
      label: 'Fruiting',
      dayStart: fruitingStart,
      dayEnd: fruitingEnd,
      description: 'Fruits develop and swell. Increase potassium, reduce nitrogen.',
    });
    milestones.push({
      stage: 'harvest',
      label: 'Harvest',
      dayStart: fruitingEnd,
      dayEnd: fruitingEnd + 30,
      description: 'Pick fruits at peak ripeness. Harvest regularly to encourage more.',
    });
  } else {
    // Leafy/root/herb plants go straight to harvest
    milestones.push({
      stage: 'harvest',
      label: 'Harvest',
      dayStart: Math.round(avgMaturity * 0.7),
      dayEnd: avgMaturity,
      description: 'Begin harvesting outer leaves or pull entire plant.',
    });
  }

  // Determine current stage
  let currentStage: GrowthMilestone['stage'] = 'germination';
  for (const m of milestones) {
    if (daysSincePlanted >= m.dayStart) {
      currentStage = m.stage;
    }
  }

  // Find next milestone
  const nextMilestone = milestones.find((m) => daysSincePlanted < m.dayStart);
  const daysToNextMilestone = nextMilestone ? nextMilestone.dayStart - daysSincePlanted : 0;
  const nextMilestoneLabel = nextMilestone?.label ?? 'Mature';

  // Calculate predicted dates
  const predictedFloweringDate = milestones.find((m) => m.stage === 'flowering')
    ? new Date(plantedDate.getTime() + milestones.find((m) => m.stage === 'flowering')!.dayStart * 24 * 60 * 60 * 1000)
    : undefined;
  const predictedFruitingDate = milestones.find((m) => m.stage === 'fruiting')
    ? new Date(plantedDate.getTime() + milestones.find((m) => m.stage === 'fruiting')!.dayStart * 24 * 60 * 60 * 1000)
    : undefined;
  const predictedFirstHarvestDate = milestones.find((m) => m.stage === 'harvest')
    ? new Date(plantedDate.getTime() + milestones.find((m) => m.stage === 'harvest')!.dayStart * 24 * 60 * 60 * 1000)
    : undefined;
  const predictedLastHarvestDate = dbPlant?.growingInfo.perennial
    ? undefined
    : new Date(plantedDate.getTime() + avgMaturity * 24 * 60 * 60 * 1000);

  return {
    milestones,
    predictedFloweringDate,
    predictedFruitingDate,
    predictedFirstHarvestDate,
    predictedLastHarvestDate,
    daysToNextMilestone: Math.max(0, daysToNextMilestone),
    nextMilestoneLabel,
    currentStage,
  };
}

/**
 * Get a human-readable description of the current growth stage.
 */
export function getStageDescription(stage: GrowthMilestone['stage']): string {
  const descriptions: Record<string, string> = {
    germination: 'Seeds are sprouting. Keep soil moist and warm.',
    seedling: 'Young plants with first leaves. Protect from harsh sun.',
    vegetative: 'Active leaf and stem growth. Feed with nitrogen-rich fertilizer.',
    flowering: 'Buds are forming. Ensure good pollination and reduce nitrogen.',
    fruiting: 'Fruits are developing. Increase potassium for better fruit set.',
    harvest: 'Ready to pick! Harvest regularly to prolong production.',
    dormant: 'Plant is resting. Reduce watering and stop fertilizing.',
  };
  return descriptions[stage] || 'Growing steadily.';
}
