import { describe, it, expect } from 'vitest';
import { evaluateThaiHazards } from '@/data/thai-hazards';

describe('Thai Weather Hazards', () => {
  it('should detect burning season in March', () => {
    const hazards = evaluateThaiHazards(new Date('2024-03-15'), 35, 0, 50, 10);
    const burning = hazards.find((h) => h.type === 'burning_season');
    expect(burning).toBeDefined();
    expect(burning!.severity).toBe('high'); // March is peak
    expect(burning!.farmingImpact).toBeDefined();
  });

  it('should detect monsoon in August', () => {
    const hazards = evaluateThaiHazards(new Date('2024-08-15'), 30, 15, 85, 15);
    const monsoon = hazards.find((h) => h.type === 'monsoon');
    expect(monsoon).toBeDefined();
    expect(monsoon!.severity).toBe('high'); // Aug-Sep is heaviest
  });

  it('should detect extreme heat', () => {
    const hazards = evaluateThaiHazards(new Date('2024-04-15'), 42, 0, 40, 5);
    const heat = hazards.find((h) => h.type === 'extreme_heat');
    expect(heat).toBeDefined();
    expect(heat!.severity).toBe('extreme');
  });

  it('should detect flood risk from heavy rain', () => {
    const hazards = evaluateThaiHazards(new Date('2024-10-01'), 28, 85, 90, 20);
    const flood = hazards.find((h) => h.type === 'flood_risk');
    expect(flood).toBeDefined();
    expect(flood!.severity).toBe('extreme');
  });

  it('should detect storm warnings', () => {
    const hazards = evaluateThaiHazards(new Date('2024-09-15'), 28, 35, 90, 50);
    const storm = hazards.find((h) => h.type === 'storm');
    expect(storm).toBeDefined();
  });

  it('should return no hazards for mild conditions in cool season', () => {
    const hazards = evaluateThaiHazards(new Date('2024-12-15'), 25, 0, 60, 10);
    expect(hazards).toHaveLength(0);
  });
});
