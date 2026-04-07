import { describe, it, expect, beforeEach } from 'vitest';
import { GardenDB } from '@/lib/db';
import type { Plant, GardenLocation } from '@/types/plant';

describe('Plant Bank & Status System', () => {
  let db: GardenDB;

  beforeEach(async () => {
    db = new GardenDB();
    await db.delete();
    await db.open();
  });

  describe('status field', () => {
    it('should store a plant with status "growing"', async () => {
      const id = await db.plants.add({
        name: 'Tomato',
        category: 'vegetable',
        status: 'growing',
        growingMethod: 'soil',
        plantedDate: new Date(),
        healthTags: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plant);

      const plant = await db.plants.get(id);
      expect(plant!.status).toBe('growing');
      expect(plant!.plantedDate).toBeDefined();
    });

    it('should store a plant with status "bank" and no plantedDate', async () => {
      const id = await db.plants.add({
        name: 'Basil Seeds',
        category: 'herb',
        status: 'bank',
        growingMethod: 'soil',
        quantity: 50,
        healthTags: [],
        tags: ['seeds'],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plant);

      const plant = await db.plants.get(id);
      expect(plant!.status).toBe('bank');
      expect(plant!.plantedDate).toBeUndefined();
      expect(plant!.quantity).toBe(50);
    });

    it('should filter plants by status index', async () => {
      await db.plants.bulkAdd([
        { name: 'Growing Tomato', category: 'vegetable', status: 'growing', growingMethod: 'soil', plantedDate: new Date(), healthTags: [], tags: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Bank Basil', category: 'herb', status: 'bank', growingMethod: 'soil', healthTags: [], tags: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Growing Pepper', category: 'vegetable', status: 'growing', growingMethod: 'soil', plantedDate: new Date(), healthTags: [], tags: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Bank Lettuce', category: 'vegetable', status: 'bank', growingMethod: 'soil', quantity: 100, healthTags: [], tags: [], createdAt: new Date(), updatedAt: new Date() },
      ] as Plant[]);

      const growing = await db.plants.where('status').equals('growing').toArray();
      expect(growing).toHaveLength(2);
      expect(growing.map((p) => p.name).sort()).toEqual(['Growing Pepper', 'Growing Tomato']);

      const bank = await db.plants.where('status').equals('bank').toArray();
      expect(bank).toHaveLength(2);
      expect(bank.map((p) => p.name).sort()).toEqual(['Bank Basil', 'Bank Lettuce']);
    });

    it('should transition a plant from bank to growing', async () => {
      const id = await db.plants.add({
        name: 'Cilantro Seeds',
        category: 'herb',
        status: 'bank',
        growingMethod: 'soil',
        quantity: 30,
        healthTags: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plant);

      const now = new Date();
      await db.plants.update(id, {
        status: 'growing',
        plantedDate: now,
        updatedAt: now,
      });

      const updated = await db.plants.get(id);
      expect(updated!.status).toBe('growing');
      expect(updated!.plantedDate).toBeDefined();
    });

    it('should support all valid status values', async () => {
      const statuses = ['bank', 'seedling', 'growing', 'harvested', 'dormant', 'deceased'] as const;

      for (const status of statuses) {
        const id = await db.plants.add({
          name: `Plant-${status}`,
          category: 'vegetable',
          status,
          growingMethod: 'soil',
          healthTags: [],
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Plant);

        const plant = await db.plants.get(id);
        expect(plant!.status).toBe(status);
      }
    });
  });

  describe('quantity field', () => {
    it('should store and retrieve quantity for bank items', async () => {
      const id = await db.plants.add({
        name: 'Sunflower Seeds',
        category: 'flower',
        status: 'bank',
        growingMethod: 'soil',
        quantity: 200,
        healthTags: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plant);

      const plant = await db.plants.get(id);
      expect(plant!.quantity).toBe(200);
    });

    it('should work without quantity (undefined)', async () => {
      const id = await db.plants.add({
        name: 'Mystery Plant',
        category: 'vegetable',
        status: 'bank',
        growingMethod: 'soil',
        healthTags: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Plant);

      const plant = await db.plants.get(id);
      expect(plant!.quantity).toBeUndefined();
    });
  });
});

describe('Locations System', () => {
  let db: GardenDB;

  beforeEach(async () => {
    db = new GardenDB();
    await db.delete();
    await db.open();
  });

  it('should add and retrieve a location', async () => {
    const id = await db.locations.add({
      name: 'Raised Bed A',
      zone: 'Backyard',
      createdAt: new Date(),
    });

    const loc = await db.locations.get(id);
    expect(loc!.name).toBe('Raised Bed A');
    expect(loc!.zone).toBe('Backyard');
  });

  it('should filter locations by zone', async () => {
    await db.locations.bulkAdd([
      { name: 'Raised Bed A', zone: 'Backyard', createdAt: new Date() },
      { name: 'Raised Bed B', zone: 'Backyard', createdAt: new Date() },
      { name: 'Windowsill', zone: 'Indoor', createdAt: new Date() },
      { name: 'Rack 1', zone: 'Greenhouse', createdAt: new Date() },
    ] as GardenLocation[]);

    const backyard = await db.locations.where('zone').equals('Backyard').toArray();
    expect(backyard).toHaveLength(2);

    const indoor = await db.locations.where('zone').equals('Indoor').toArray();
    expect(indoor).toHaveLength(1);
  });

  it('should link a plant to a location via locationId', async () => {
    const locId = await db.locations.add({
      name: 'Herb Spiral',
      zone: 'Backyard',
      createdAt: new Date(),
    });

    const plantId = await db.plants.add({
      name: 'Mint',
      category: 'herb',
      status: 'growing',
      growingMethod: 'soil',
      locationId: locId as number,
      plantedDate: new Date(),
      healthTags: [],
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Plant);

    const plant = await db.plants.get(plantId);
    expect(plant!.locationId).toBe(locId);

    // Verify we can find plants at a location
    const plantsAtLoc = await db.plants.where('locationId').equals(locId as number).toArray();
    expect(plantsAtLoc).toHaveLength(1);
    expect(plantsAtLoc[0].name).toBe('Mint');
  });

  it('should delete a location', async () => {
    const id = await db.locations.add({
      name: 'Temp Bed',
      zone: 'Backyard',
      createdAt: new Date(),
    });

    await db.locations.delete(id);
    const loc = await db.locations.get(id);
    expect(loc).toBeUndefined();
  });

  it('should work without a zone (optional)', async () => {
    const id = await db.locations.add({
      name: 'My Spot',
      createdAt: new Date(),
    } as GardenLocation);

    const loc = await db.locations.get(id);
    expect(loc!.name).toBe('My Spot');
    expect(loc!.zone).toBeUndefined();
  });
});
