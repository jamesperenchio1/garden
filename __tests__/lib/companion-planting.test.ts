import { describe, it, expect } from 'vitest';
import { getAllCompanionPlants, getCompanionship, getCompanionsFor } from '@/data/companion-planting';

describe('Companion Planting', () => {
  it('should return all unique plants', () => {
    const plants = getAllCompanionPlants();
    expect(plants.length).toBeGreaterThan(10);
    expect(plants).toContain('Tomato');
    expect(plants).toContain('Thai Basil');
    expect(plants).toContain('Lemongrass');
  });

  it('should find beneficial companions', () => {
    const result = getCompanionship('Tomato', 'Basil');
    expect(result).toBeDefined();
    expect(result!.compatibility).toBe('beneficial');
  });

  it('should find harmful companions', () => {
    const result = getCompanionship('Tomato', 'Fennel');
    expect(result).toBeDefined();
    expect(result!.compatibility).toBe('harmful');
  });

  it('should work in reverse order', () => {
    const result = getCompanionship('Basil', 'Tomato');
    expect(result).toBeDefined();
    expect(result!.compatibility).toBe('beneficial');
  });

  it('should return undefined for unknown pairs', () => {
    const result = getCompanionship('Tomato', 'Unknown Plant XYZ');
    expect(result).toBeUndefined();
  });

  it('should get all companions for a plant', () => {
    const companions = getCompanionsFor('Tomato');
    expect(companions.length).toBeGreaterThan(3);
    expect(companions.some((c) => c.name === 'Basil')).toBe(true);
    expect(companions.some((c) => c.compatibility === 'harmful')).toBe(true);
  });

  it('should include Thai-specific plants', () => {
    const plants = getAllCompanionPlants();
    expect(plants).toContain('Lemongrass');
    expect(plants).toContain('Water Spinach');
    expect(plants).toContain('Galangal');
    expect(plants).toContain('Papaya');
  });
});
