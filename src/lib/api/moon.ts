export interface MoonPhaseResult {
  phase: number; // 0-7
  illumination: number; // 0-100
  plantingAdvice: string;
}

// Simple astronomical approximation using known new moon epoch
// Known new moon: 2000-01-06 18:14 UTC (Julian date 2451549.5 approx)
const LUNAR_CYCLE = 29.53058867; // days
const KNOWN_NEW_MOON_JD = 2451549.5; // Jan 6, 2000 approx new moon

function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

function calculateMoonAge(date: Date): number {
  const jd = getJulianDate(date);
  const daysSinceKnown = jd - KNOWN_NEW_MOON_JD;
  const moonAge = ((daysSinceKnown % LUNAR_CYCLE) + LUNAR_CYCLE) % LUNAR_CYCLE;
  return moonAge;
}

export function getMoonPhase(date: Date = new Date()): MoonPhaseResult {
  const moonAge = calculateMoonAge(date);
  const phase = Math.round((moonAge / LUNAR_CYCLE) * 8) % 8;
  const illumination = Math.round((1 - Math.cos((moonAge / LUNAR_CYCLE) * 2 * Math.PI)) / 2 * 100);

  const adviceMap: Record<number, string> = {
    0: "New Moon — Rest the soil. Good time for pruning, weeding, and soil preparation.",
    1: "Waxing Crescent — Plant leafy greens and annuals that produce above ground.",
    2: "First Quarter — Strong growth energy. Plant crops with above-ground fruit (tomatoes, peppers, beans).",
    3: "Waxing Gibbous — Continue planting above-ground crops. Good for grafting and pruning to encourage growth.",
    4: "Full Moon — Peak energy. Harvest for maximum flavor and storage life. Avoid planting today.",
    5: "Waning Gibbous — Plant root crops (carrots, radish, sweet potato) and perennials.",
    6: "Last Quarter — Ideal for root crops, bulbs, and transplanting. Good for pruning to retard growth.",
    7: "Waning Crescent — Rest period. Focus on composting, mulching, and soil improvement.",
  };

  return {
    phase,
    illumination,
    plantingAdvice: adviceMap[phase],
  };
}

export function getMoonPhaseEmoji(phase: number): string {
  const emojis = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
  return emojis[phase] ?? "🌑";
}

export function getMoonPhaseName(phase: number): string {
  const names = [
    "New Moon",
    "Waxing Crescent",
    "First Quarter",
    "Waxing Gibbous",
    "Full Moon",
    "Waning Gibbous",
    "Last Quarter",
    "Waning Crescent",
  ];
  return names[phase] ?? "Unknown";
}

export function moonSuggestion(date: Date = new Date()): string {
  const { phase } = getMoonPhase(date);
  const suggestions: Record<number, string> = {
    0: "Today is best for soil prep, weeding, and pruning. Give your garden a rest from planting.",
    1: "Plant leafy greens: lettuce, kale, bok choy, spinach, and herbs like basil and coriander.",
    2: "Plant fruiting crops: tomato, chili, eggplant, cucumber, long bean, and okra.",
    3: "Continue with fruiting crops, grafting, and transplanting seedlings.",
    4: "Harvest crops for best flavor and storage. Dry herbs and seeds today.",
    5: "Plant root crops: carrot, radish, sweet potato, cassava, galangal, turmeric, and fingerroot.",
    6: "Plant bulbs, tubers, and root vegetables. Good for dividing perennials like lemongrass and mint.",
    7: "Work on compost, mulch beds, and improve soil structure. Plan your next planting cycle.",
  };
  return suggestions[phase];
}
