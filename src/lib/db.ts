import Dexie, { type Table } from 'dexie';
import type { Plant, Photo, LogEntry, YieldRecord, YieldReference, Task, HydroSystem, SoilBed, CustomPlant } from '@/types';

export class GardenDB extends Dexie {
  plants!: Table<Plant>;
  photos!: Table<Photo>;
  logEntries!: Table<LogEntry>;
  yieldRecords!: Table<YieldRecord>;
  yieldReferences!: Table<YieldReference>;
  customPlants!: Table<CustomPlant>;
  tasks!: Table<Task>;
  systems!: Table<HydroSystem>;
  soilBeds!: Table<SoilBed>;

  constructor() {
    super('gardenCompanionV2');
    this.version(1).stores({
      plants: '++id, name, category, growingMethod, createdAt',
      photos: '++id, plantId, createdAt, type',
      logEntries: '++id, plantId, createdAt, type',
      yieldRecords: '++id, plantId, harvestedAt, rating',
      yieldReferences: '++id, plantName, category',
      customPlants: '++id, name, category',
      tasks: '++id, plantId, dueDate, type, completed',
      systems: '++id, name, type, createdAt',
      soilBeds: '++id, name, createdAt',
    });
  }
}

export const db = new GardenDB();
