import { db } from '@/lib/db';
import type { Plant, GrowingMethod, PlantCategory } from '@/types/plant';
import type { Task, TaskType } from '@/types/calendar';
import { thaiPlantingCalendar } from '@/data/thai-plants';
import { getMoonPhase } from '@/lib/api/moon';

/**
 * Deterministic task generator.
 *
 * For each plant, emits the recurring tasks that should exist in the next
 * few weeks if they don't already. Tasks are identified by a stable
 * `sourceKey` in their title so we don't create duplicates on every run.
 */

const DAY = 24 * 60 * 60 * 1000;

interface GeneratedTask {
  plantId: number;
  type: TaskType;
  title: string;
  description?: string;
  dueDate: Date;
  recurring?: Task['recurring'];
}

function wateringInterval(category: PlantCategory, method: GrowingMethod): number {
  if (method === 'hydroponic' || method === 'aeroponic' || method === 'aquaponic') {
    // Hydro systems don't need manual watering; reservoir top-up instead.
    return 7;
  }
  if (category === 'vegetable' || category === 'herb') return 2;
  if (category === 'fruit') return 3;
  return 4;
}

function taskKey(plantId: number, type: TaskType, dayKey: string) {
  return `[#${plantId}:${type}:${dayKey}]`;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function stripTime(d: Date): Date {
  const out = new Date(d);
  out.setHours(8, 0, 0, 0);
  return out;
}

/**
 * Generate the next water, nutrient, and harvest tasks for a single plant.
 * Only tasks within `daysAhead` are produced.
 */
export function generateTasksForPlant(
  plant: Plant,
  now: Date = new Date(),
  daysAhead = 14
): GeneratedTask[] {
  if (!plant.id || !plant.plantedDate) return [];
  const tasks: GeneratedTask[] = [];

  const planted = new Date(plant.plantedDate);
  const ageDays = Math.floor((now.getTime() - planted.getTime()) / DAY);

  // ── Watering / reservoir checks ─────────────────────────────────────────
  const waterEvery = wateringInterval(plant.category, plant.growingMethod);
  const nextWater = new Date(now);
  nextWater.setDate(nextWater.getDate() + 1);
  const isHydro = plant.growingMethod !== 'soil';
  tasks.push({
    plantId: plant.id,
    type: 'water',
    title: `${isHydro ? 'Top up reservoir' : 'Water'}: ${plant.name} ${taskKey(plant.id, 'water', dayKey(nextWater))}`,
    description: `Every ${waterEvery} days (${plant.category}, ${plant.growingMethod}).`,
    dueDate: stripTime(nextWater),
    recurring: { interval: waterEvery, unit: 'days' },
  });

  // ── Nutrient change (hydro only) ────────────────────────────────────────
  if (isHydro) {
    const nextNutes = new Date(now);
    nextNutes.setDate(nextNutes.getDate() + 7);
    tasks.push({
      plantId: plant.id,
      type: 'nutrient_change',
      title: `Nutrient change: ${plant.name} ${taskKey(plant.id, 'nutrient_change', dayKey(nextNutes))}`,
      description: 'Swap reservoir solution weekly.',
      dueDate: stripTime(nextNutes),
      recurring: { interval: 1, unit: 'weeks' },
    });
  }

  // ── Pest check — weekly ─────────────────────────────────────────────────
  const nextPest = new Date(now);
  nextPest.setDate(nextPest.getDate() + 3);
  tasks.push({
    plantId: plant.id,
    type: 'pest_check',
    title: `Pest check: ${plant.name} ${taskKey(plant.id, 'pest_check', dayKey(nextPest))}`,
    dueDate: stripTime(nextPest),
    recurring: { interval: 1, unit: 'weeks' },
  });

  // ── Harvest window (from thai planting calendar) ────────────────────────
  const window = thaiPlantingCalendar.find(
    (p) => p.plantName.toLowerCase() === plant.name.toLowerCase()
  );
  if (window?.harvest) {
    const nowMonth = now.getMonth() + 1;
    const { start, end } = window.harvest;
    // Handle wrap-around (e.g. Oct–Feb)
    const inSeason =
      start <= end ? nowMonth >= start && nowMonth <= end : nowMonth >= start || nowMonth <= end;
    if (inSeason && ageDays > 30) {
      const harvestDue = new Date(now);
      harvestDue.setDate(harvestDue.getDate() + 2);
      tasks.push({
        plantId: plant.id,
        type: 'harvest',
        title: `Harvest window open: ${plant.name} ${taskKey(plant.id, 'harvest', dayKey(harvestDue))}`,
        description: window.notes,
        dueDate: stripTime(harvestDue),
      });
    }
  }

  return tasks.filter((t) => {
    const diffDays = (t.dueDate.getTime() - now.getTime()) / DAY;
    return diffDays <= daysAhead && diffDays >= -1;
  });
}

/** Insert generated tasks into Dexie, skipping any whose `sourceKey` already exists. */
export async function syncGeneratedTasks(now: Date = new Date()): Promise<number> {
  const plants = await db.plants.toArray();
  const existing = await db.tasks.toArray();
  const existingKeys = new Set(
    existing.map((t) => t.title.match(/\[#[^\]]+\]/)?.[0]).filter(Boolean) as string[]
  );

  let inserted = 0;
  for (const plant of plants) {
    const generated = generateTasksForPlant(plant, now);
    for (const t of generated) {
      const keyMatch = t.title.match(/\[#[^\]]+\]/);
      if (keyMatch && existingKeys.has(keyMatch[0])) continue;
      await db.tasks.add({
        plantId: t.plantId,
        type: t.type,
        title: t.title,
        description: t.description,
        dueDate: t.dueDate,
        completed: false,
        recurring: t.recurring,
        createdAt: now,
      } as Task);
      if (keyMatch) existingKeys.add(keyMatch[0]);
      inserted += 1;
    }
  }
  return inserted;
}

/**
 * "What next" advice for a plant — suggests the immediate next action based
 * on its age and the thai planting calendar entry, without writing anything.
 */
export interface NextStep {
  plantId: number;
  plantName: string;
  action: string;
  detail: string;
  priority: 'soon' | 'upcoming' | 'later';
}

export function computeNextStep(plant: Plant, now: Date = new Date()): NextStep | null {
  if (!plant.id || !plant.plantedDate) return null;
  const planted = new Date(plant.plantedDate);
  const ageDays = Math.floor((now.getTime() - planted.getTime()) / DAY);
  const window = thaiPlantingCalendar.find(
    (p) => p.plantName.toLowerCase() === plant.name.toLowerCase()
  );

  if (ageDays < 7) {
    return {
      plantId: plant.id,
      plantName: plant.name,
      action: 'Germination check',
      detail: 'Keep soil/medium moist and check for seedling emergence.',
      priority: 'soon',
    };
  }
  if (ageDays < 21) {
    return {
      plantId: plant.id,
      plantName: plant.name,
      action: 'Thin seedlings',
      detail: 'Remove weakest seedlings to give the strongest room to grow.',
      priority: 'soon',
    };
  }
  if (ageDays < 45 && window?.transplant) {
    return {
      plantId: plant.id,
      plantName: plant.name,
      action: 'Transplant',
      detail: window.notes ?? 'Move to final growing location.',
      priority: 'upcoming',
    };
  }
  if (window?.harvest) {
    const nowMonth = now.getMonth() + 1;
    const { start, end } = window.harvest;
    const inSeason =
      start <= end ? nowMonth >= start && nowMonth <= end : nowMonth >= start || nowMonth <= end;
    if (inSeason) {
      return {
        plantId: plant.id,
        plantName: plant.name,
        action: 'Harvest window open',
        detail: window.notes ?? 'This plant is within its harvest window.',
        priority: 'soon',
      };
    }
  }
  return {
    plantId: plant.id,
    plantName: plant.name,
    action: 'Maintain',
    detail: 'Continue watering, feeding, and monitoring for pests.',
    priority: 'later',
  };
}

/** Short human phrase for the current moon phase, keyed on seed/root bias. */
export function moonSuggestion(date: Date = new Date()): { phase: string; text: string; favours: 'leaf' | 'fruit' | 'root' | 'rest' } {
  const mp = getMoonPhase(date);
  switch (mp.phase) {
    case 'new':
    case 'waxing_crescent':
      return { phase: mp.phase, text: 'Favourable for sowing leafy greens and herbs.', favours: 'leaf' };
    case 'first_quarter':
    case 'waxing_gibbous':
      return { phase: mp.phase, text: 'Favourable for fruiting annuals like tomatoes and peppers.', favours: 'fruit' };
    case 'full':
    case 'waning_gibbous':
      return { phase: mp.phase, text: 'Favourable for root crops, bulbs, and perennials.', favours: 'root' };
    default:
      return { phase: mp.phase, text: 'Rest period — prune, harvest, prep soil.', favours: 'rest' };
  }
}
