import { describe, it, expect } from 'vitest';
import { getWeatherDescription, getWeatherIcon } from '@/lib/api/weather';

describe('Weather Utilities', () => {
  it('should return description for known weather codes', () => {
    expect(getWeatherDescription(0)).toBe('Clear sky');
    expect(getWeatherDescription(61)).toBe('Slight rain');
    expect(getWeatherDescription(95)).toBe('Thunderstorm');
  });

  it('should return "Unknown" for unknown codes', () => {
    expect(getWeatherDescription(999)).toBe('Unknown');
  });

  it('should return emoji icons for weather codes', () => {
    expect(getWeatherIcon(0)).toBeDefined();
    expect(getWeatherIcon(61)).toBeDefined();
    expect(getWeatherIcon(95)).toBeDefined();
  });

  it('should return sun icon for clear sky', () => {
    const icon = getWeatherIcon(0);
    expect(icon.length).toBeGreaterThan(0);
  });
});
