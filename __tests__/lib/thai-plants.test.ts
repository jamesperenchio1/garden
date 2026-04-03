import { describe, it, expect } from 'vitest';
import { thaiPlantingCalendar, getPlantingWindowsForMonth, getActivityForPlant } from '@/data/thai-plants';

describe('Thai Planting Calendar', () => {
  it('should have a comprehensive plant list', () => {
    expect(thaiPlantingCalendar.length).toBeGreaterThan(30);
  });

  it('should include all plant categories', () => {
    const categories = new Set(thaiPlantingCalendar.map((p) => p.plantCategory));
    expect(categories).toContain('vegetable');
    expect(categories).toContain('herb');
    expect(categories).toContain('fruit');
    expect(categories).toContain('flower');
    expect(categories).toContain('medicinal');
  });

  it('should return plants for cool season (November)', () => {
    const plants = getPlantingWindowsForMonth(11);
    expect(plants.length).toBeGreaterThan(5);
    const names = plants.map((p) => p.plantName);
    expect(names).toContain('Kale');
    expect(names).toContain('Lettuce');
  });

  it('should return plants for rainy season (July)', () => {
    const plants = getPlantingWindowsForMonth(7);
    expect(plants.length).toBeGreaterThan(5);
    const names = plants.map((p) => p.plantName);
    expect(names).toContain('Cucumber');
    expect(names).toContain('Water Spinach');
  });

  it('should detect sowing activity', () => {
    const kale = thaiPlantingCalendar.find((p) => p.plantName === 'Kale')!;
    const activities = getActivityForPlant(kale, 11);
    expect(activities).toContain('Sow outdoors');
  });

  it('should detect harvest activity', () => {
    const kale = thaiPlantingCalendar.find((p) => p.plantName === 'Kale')!;
    const activities = getActivityForPlant(kale, 1);
    expect(activities).toContain('Harvest');
  });

  it('should handle wrap-around months (Oct-Feb)', () => {
    const kale = thaiPlantingCalendar.find((p) => p.plantName === 'Kale')!;
    // Kale sows Oct-Feb (wraps around year)
    expect(getActivityForPlant(kale, 10)).toContain('Sow outdoors');
    expect(getActivityForPlant(kale, 1)).toContain('Sow outdoors');
  });

  it('should include Thai-specific plants', () => {
    const names = thaiPlantingCalendar.map((p) => p.plantName);
    expect(names).toContain('Thai Basil');
    expect(names).toContain('Holy Basil');
    expect(names).toContain('Lemongrass');
    expect(names).toContain('Galangal');
    expect(names).toContain('Pandan');
    expect(names).toContain('Water Spinach');
    expect(names).toContain('Butterfly Pea');
  });
});
