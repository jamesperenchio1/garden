import { describe, it, expect, beforeEach } from 'vitest';
import { GardenDB } from '@/lib/db';
import type { Plant } from '@/types/plant';

describe('GardenDB', () => {
  let db: GardenDB;

  beforeEach(async () => {
    db = new GardenDB();
    await db.delete();
    await db.open();
  });

  describe('plants table', () => {
    it('should add and retrieve a plant', async () => {
      const plant: Plant = {
        name: 'Thai Basil',
        variety: 'Sweet',
        category: 'herb',
        growingMethod: 'soil',
        plantedDate: new Date('2024-01-15'),
        healthTags: [],
        tags: ['kitchen', 'thai'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const id = await db.plants.add(plant);
      expect(id).toBeDefined();

      const retrieved = await db.plants.get(id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.name).toBe('Thai Basil');
      expect(retrieved!.category).toBe('herb');
      expect(retrieved!.tags).toContain('kitchen');
    });

    it('should filter plants by category', async () => {
      await db.plants.bulkAdd([
        { name: 'Kale', category: 'vegetable', growingMethod: 'hydroponic', plantedDate: new Date(), healthTags: [], tags: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Basil', category: 'herb', growingMethod: 'soil', plantedDate: new Date(), healthTags: [], tags: [], createdAt: new Date(), updatedAt: new Date() },
        { name: 'Tomato', category: 'vegetable', growingMethod: 'soil', plantedDate: new Date(), healthTags: [], tags: [], createdAt: new Date(), updatedAt: new Date() },
      ] as Plant[]);

      const vegetables = await db.plants.where('category').equals('vegetable').toArray();
      expect(vegetables).toHaveLength(2);
    });

    it('should delete a plant and related records', async () => {
      const plantId = await db.plants.add({
        name: 'Test Plant', category: 'vegetable', growingMethod: 'soil',
        plantedDate: new Date(), healthTags: [], tags: [], createdAt: new Date(), updatedAt: new Date(),
      } as Plant);

      await db.photos.add({ plantId: plantId as number, blob: new Blob(), thumbnail: new Blob(), type: 'plant', createdAt: new Date() });
      await db.logEntries.add({ plantId: plantId as number, type: 'note', title: 'Test', createdAt: new Date() });

      // Delete plant and related
      await db.transaction('rw', [db.plants, db.photos, db.logEntries], async () => {
        await db.photos.where('plantId').equals(plantId as number).delete();
        await db.logEntries.where('plantId').equals(plantId as number).delete();
        await db.plants.delete(plantId);
      });

      const plant = await db.plants.get(plantId);
      expect(plant).toBeUndefined();
      const photos = await db.photos.where('plantId').equals(plantId as number).toArray();
      expect(photos).toHaveLength(0);
    });
  });

  describe('systems table', () => {
    it('should store hydroponic system designs', async () => {
      const id = await db.systems.add({
        name: 'NFT Lettuce Rack',
        type: 'nft',
        components: [
          { id: 'comp-1', type: 'reservoir', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, connections: [], properties: {} },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const system = await db.systems.get(id);
      expect(system!.name).toBe('NFT Lettuce Rack');
      expect(system!.components).toHaveLength(1);
    });
  });
});
