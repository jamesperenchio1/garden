import { describe, it, expect } from 'vitest';
import { getMoonPhase, getMoonPhaseEmoji, getMoonPhaseName, getMonthMoonPhases } from '@/lib/api/moon';

describe('Moon Phase Calculator', () => {
  it('should return a valid moon phase for any date', () => {
    const phase = getMoonPhase(new Date('2024-03-25'));
    expect(phase.phase).toBeDefined();
    expect(phase.illumination).toBeGreaterThanOrEqual(0);
    expect(phase.illumination).toBeLessThanOrEqual(100);
    expect(phase.plantingAdvice).toBeDefined();
    expect(phase.date).toBe('2024-03-25');
  });

  it('should return full moon phase near known full moon', () => {
    // January 25, 2024 was a full moon
    const phase = getMoonPhase(new Date('2024-01-25'));
    expect(phase.illumination).toBeGreaterThan(80);
  });

  it('should return new moon phase near known new moon', () => {
    // January 11, 2024 was a new moon
    const phase = getMoonPhase(new Date('2024-01-11'));
    expect(phase.illumination).toBeLessThan(20);
  });

  it('should return emoji for each phase', () => {
    const phases: Array<'new' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous' | 'full' | 'waning_gibbous' | 'third_quarter' | 'waning_crescent'> = [
      'new', 'waxing_crescent', 'first_quarter', 'waxing_gibbous',
      'full', 'waning_gibbous', 'third_quarter', 'waning_crescent',
    ];
    phases.forEach((phase) => {
      expect(getMoonPhaseEmoji(phase)).toBeDefined();
      expect(getMoonPhaseName(phase)).toBeDefined();
    });
  });

  it('should generate phases for a full month', () => {
    const phases = getMonthMoonPhases(2024, 3);
    expect(phases).toHaveLength(31); // March has 31 days
    phases.forEach((p) => {
      expect(p.illumination).toBeGreaterThanOrEqual(0);
      expect(p.illumination).toBeLessThanOrEqual(100);
    });
  });
});
