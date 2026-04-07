import { describe, it, expect } from 'vitest';
import {
  companionData,
  getAllCompanionPlants,
  getCompanionsFor,
  getCompanionship,
} from '@/data/companion-planting';

describe('Companion Planting — My Garden Analysis', () => {
  it('should detect beneficial pairs between garden plants', () => {
    const myPlants = ['Tomato', 'Basil'];
    const pairs: { plant1: string; plant2: string; compatibility: string }[] = [];

    for (let i = 0; i < myPlants.length; i++) {
      for (let j = i + 1; j < myPlants.length; j++) {
        const rel = getCompanionship(myPlants[i], myPlants[j]);
        if (rel) pairs.push({ plant1: myPlants[i], plant2: myPlants[j], compatibility: rel.compatibility });
      }
    }

    expect(pairs).toHaveLength(1);
    expect(pairs[0].compatibility).toBe('beneficial');
  });

  it('should detect harmful pairs between garden plants', () => {
    const myPlants = ['Tomato', 'Fennel'];
    const pairs: { compatibility: string }[] = [];

    for (let i = 0; i < myPlants.length; i++) {
      for (let j = i + 1; j < myPlants.length; j++) {
        const rel = getCompanionship(myPlants[i], myPlants[j]);
        if (rel) pairs.push({ compatibility: rel.compatibility });
      }
    }

    expect(pairs).toHaveLength(1);
    expect(pairs[0].compatibility).toBe('harmful');
  });

  it('should suggest plants that benefit multiple existing plants', () => {
    const myPlants = ['Tomato', 'Pepper', 'Eggplant'];
    const myLowered = new Set(myPlants.map((n) => n.toLowerCase()));
    const allKnown = getAllCompanionPlants();

    const suggestions: { plant: string; benefitsCount: number }[] = [];
    for (const candidate of allKnown) {
      if (myLowered.has(candidate.toLowerCase())) continue;
      const rels = getCompanionsFor(candidate);
      const benefitsMyPlants = rels.filter(
        (r) => r.compatibility === 'beneficial' && myLowered.has(r.name.toLowerCase()),
      );
      if (benefitsMyPlants.length >= 2) {
        suggestions.push({ plant: candidate, benefitsCount: benefitsMyPlants.length });
      }
    }

    expect(suggestions.length).toBeGreaterThan(0);
    // Marigold should benefit multiple nightshades
    const marigold = suggestions.find((s) => s.plant === 'Marigold');
    expect(marigold).toBeDefined();
    expect(marigold!.benefitsCount).toBeGreaterThanOrEqual(2);
  });

  it('should handle empty garden gracefully', () => {
    const myPlants: string[] = [];
    const pairs: unknown[] = [];

    for (let i = 0; i < myPlants.length; i++) {
      for (let j = i + 1; j < myPlants.length; j++) {
        const rel = getCompanionship(myPlants[i], myPlants[j]);
        if (rel) pairs.push(rel);
      }
    }

    expect(pairs).toHaveLength(0);
  });

  it('should handle single-plant garden gracefully', () => {
    const myPlants = ['Tomato'];
    const companions = getCompanionsFor(myPlants[0]);

    expect(companions.length).toBeGreaterThan(0);
    const beneficial = companions.filter((c) => c.compatibility === 'beneficial');
    const harmful = companions.filter((c) => c.compatibility === 'harmful');
    expect(beneficial.length).toBeGreaterThan(0);
    expect(harmful.length).toBeGreaterThan(0);
  });

  it('should produce per-plant breakdown for all garden plants', () => {
    const myPlants = ['Tomato', 'Basil', 'Pepper', 'Marigold'];

    for (const plant of myPlants) {
      const companions = getCompanionsFor(plant);
      expect(companions.length).toBeGreaterThan(0);
      // Each companion entry should have name, compatibility, and reason
      for (const c of companions) {
        expect(c.name).toBeTruthy();
        expect(['beneficial', 'harmful', 'neutral']).toContain(c.compatibility);
        expect(c.reason).toBeTruthy();
      }
    }
  });
});
