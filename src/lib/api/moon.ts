import type { MoonPhase } from '@/types/calendar';

/**
 * Calculate moon phase using a simplified astronomical algorithm.
 * Based on the synodic month (29.53059 days).
 */
export function getMoonPhase(date: Date): MoonPhase {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Calculate days since known new moon (Jan 6, 2000)
  const referenceNewMoon = new Date(2000, 0, 6, 18, 14).getTime();
  const current = date.getTime();
  const daysSinceNewMoon = (current - referenceNewMoon) / (1000 * 60 * 60 * 24);

  const synodicMonth = 29.53059;
  const moonAge = ((daysSinceNewMoon % synodicMonth) + synodicMonth) % synodicMonth;
  const illumination = Math.round((1 - Math.cos((moonAge / synodicMonth) * 2 * Math.PI)) / 2 * 100);

  let phase: MoonPhase['phase'];
  let plantingAdvice: string;

  if (moonAge < 1.85) {
    phase = 'new';
    plantingAdvice = 'Good for planting leafy annuals, herbs. Gravitational pull draws water up.';
  } else if (moonAge < 7.38) {
    phase = 'waxing_crescent';
    plantingAdvice = 'Good for planting leafy annuals with seeds outside the fruit (e.g., lettuce, spinach).';
  } else if (moonAge < 9.23) {
    phase = 'first_quarter';
    plantingAdvice = 'Good for planting annuals with seeds inside the fruit (e.g., tomatoes, peppers).';
  } else if (moonAge < 14.77) {
    phase = 'waxing_gibbous';
    plantingAdvice = 'Good for planting annuals with seeds inside the fruit. Strong leaf growth period.';
  } else if (moonAge < 16.61) {
    phase = 'full';
    plantingAdvice = 'Best for planting root crops, bulbs, and perennials. Moonlight promotes leaf growth.';
  } else if (moonAge < 22.15) {
    phase = 'waning_gibbous';
    plantingAdvice = 'Good for planting root crops, bulbs, biennials, and perennials.';
  } else if (moonAge < 23.99) {
    phase = 'third_quarter';
    plantingAdvice = 'Rest period. Good for harvesting, pruning, transplanting, and maintenance.';
  } else {
    phase = 'waning_crescent';
    plantingAdvice = 'Rest period. Avoid planting. Good for soil preparation and composting.';
  }

  return {
    date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    phase,
    illumination,
    plantingAdvice,
  };
}

export function getMoonPhaseEmoji(phase: MoonPhase['phase']): string {
  const emojis: Record<MoonPhase['phase'], string> = {
    new: '🌑',
    waxing_crescent: '🌒',
    first_quarter: '🌓',
    waxing_gibbous: '🌔',
    full: '🌕',
    waning_gibbous: '🌖',
    third_quarter: '🌗',
    waning_crescent: '🌘',
  };
  return emojis[phase];
}

export function getMoonPhaseName(phase: MoonPhase['phase']): string {
  const names: Record<MoonPhase['phase'], string> = {
    new: 'New Moon',
    waxing_crescent: 'Waxing Crescent',
    first_quarter: 'First Quarter',
    waxing_gibbous: 'Waxing Gibbous',
    full: 'Full Moon',
    waning_gibbous: 'Waning Gibbous',
    third_quarter: 'Third Quarter',
    waning_crescent: 'Waning Crescent',
  };
  return names[phase];
}

export function getMonthMoonPhases(year: number, month: number): MoonPhase[] {
  const phases: MoonPhase[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    phases.push(getMoonPhase(new Date(year, month - 1, day)));
  }

  return phases;
}
