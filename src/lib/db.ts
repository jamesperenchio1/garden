import Dexie, { type Table } from 'dexie';
import type { Plant, Photo, LogEntry, YieldRecord, YieldReference } from '@/types/plant';
import type { HydroSystem } from '@/types/system';
import type { Task } from '@/types/calendar';
import type { SoilBed } from '@/types/companion';

export class GardenDB extends Dexie {
  plants!: Table<Plant>;
  photos!: Table<Photo>;
  logEntries!: Table<LogEntry>;
  systems!: Table<HydroSystem>;
  soilBeds!: Table<SoilBed>;
  tasks!: Table<Task>;
  yieldRecords!: Table<YieldRecord>;
  yieldReferences!: Table<YieldReference>;

  constructor() {
    super('gardenCompanion');
    this.version(1).stores({
      plants: '++id, name, category, growingMethod, createdAt, *tags',
      photos: '++id, plantId, createdAt, type',
      logEntries: '++id, plantId, createdAt, type',
      systems: '++id, name, type, createdAt',
      soilBeds: '++id, name, createdAt',
      tasks: '++id, plantId, dueDate, type, completed',
    });
    this.version(2).stores({
      plants: '++id, name, category, growingMethod, createdAt, *tags',
      photos: '++id, plantId, createdAt, type',
      logEntries: '++id, plantId, createdAt, type',
      systems: '++id, name, type, createdAt',
      soilBeds: '++id, name, createdAt',
      tasks: '++id, plantId, dueDate, type, completed',
      yieldRecords: '++id, plantId, harvestedAt, rating',
      yieldReferences: '++id, plantName, category',
    });
  }
}

export const db = new GardenDB();
