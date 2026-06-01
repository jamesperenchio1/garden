import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/store/app-store';
import { fetchWeather } from '@/lib/api/weather';
import type { WeatherData } from '@/types';

export interface UseWeatherReturn {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

let weatherCache: { data: WeatherData; timestamp: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function useWeather(): UseWeatherReturn {
  const location = useAppStore((s) => s.location);
  const [weather, setWeather] = useState<WeatherData | null>(
    weatherCache?.data ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      if (weatherCache && Date.now() - weatherCache.timestamp < CACHE_TTL) {
        setWeather(weatherCache.data);
        setLoading(false);
        return;
      }

      const data = await fetchWeather(
        location.latitude,
        location.longitude,
        controller.signal
      );
      weatherCache = { data, timestamp: Date.now() };
      setWeather(data);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setError((err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    refresh();
    return () => abortRef.current?.abort();
  }, [refresh]);

  return { weather, loading, error, refresh };
}
