'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchWeather } from '@/lib/api/weather';
import type { WeatherData } from '@/types/weather';
import { useAppStore } from '@/store/app-store';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useAppStore((s) => s.location);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setWeather(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { weather, loading, error, refresh };
}
