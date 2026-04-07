import Dexie, { type Table } from 'dexie';
import type { Plant, Photo, LogEntry, YieldRecord, YieldReference, CustomPlant, GardenLocation } from '@/types/plant';
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
  customPlants!: Table<CustomPlant>;
  locations!: Table<GardenLocation>;

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
    this.version(3).stores({
      plants: '++id, name, category, growingMethod, createdAt, *tags',
      photos: '++id, plantId, createdAt, type',
      logEntries: '++id, plantId, createdAt, type',
      systems: '++id, name, type, createdAt',
      soilBeds: '++id, name, createdAt',
      tasks: '++id, plantId, dueDate, type, completed',
      yieldRecords: '++id, plantId, harvestedAt, rating',
      yieldReferences: '++id, plantName, category',
      customPlants: '++id, name, scientificName, category, createdAt',
    });
    // v4: add status + locationId indexes on plants, add locations table
    this.version(4).stores({
      plants: '++id, name, category, growingMethod, status, locationId, createdAt, *tags',
      photos: '++id, plantId, createdAt, type',
      logEntries: '++id, plantId, createdAt, type',
      systems: '++id, name, type, createdAt',
      soilBeds: '++id, name, createdAt',
      tasks: '++id, plantId, dueDate, type, completed',
      yieldRecords: '++id, plantId, harvestedAt, rating',
      yieldReferences: '++id, plantName, category',
      customPlants: '++id, name, scientificName, category, createdAt',
      locations: '++id, name, zone, createdAt',
    }).upgrade(tx => {
      // Migrate existing plants: give them a status of 'growing' since they
      // were all assumed to be planted before this schema version.
      return tx.table('plants').toCollection().modify(plant => {
        if (!plant.status) {
          plant.status = 'growing';
        }
      });
    });
  }
}

export const db = new GardenDB();
