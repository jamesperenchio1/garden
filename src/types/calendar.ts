export type TaskType = 'water' | 'fertilize' | 'harvest' | 'sow' | 'transplant' | 'prune' | 'pest_check' | 'ph_check' | 'nutrient_change' | 'custom';

export interface Task {
  id?: number;
  plantId?: number;
  type: TaskType;
  title: string;
  description?: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  recurring?: {
    interval: number; // days
    unit: 'days' | 'weeks' | 'months';
  };
  createdAt: Date;
}

export interface PlantingWindow {
  plantName: string;
  plantCategory: string;
  sowIndoors?: { start: number; end: number }; // month numbers 1-12
  sowOutdoors?: { start: number; end: number };
  transplant?: { start: number; end: number };
  harvest?: { start: number; end: number };
  notes?: string;
}

export interface MoonPhase {
  date: string;
  phase: 'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'third_quarter' | 'waning_crescent';
  illumination: number;
  plantingAdvice: string;
}
