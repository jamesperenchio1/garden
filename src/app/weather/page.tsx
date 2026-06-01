'use client';

import { useMemo } from 'react';
import { useWeather } from '@/hooks/use-weather';
import { useAppStore } from '@/store/app-store';
import { generateWeatherAlerts } from '@/lib/weather-alerts';
import { evaluateThaiHazards } from '@/data/thai-hazards';
import { getWeatherIcon, getWeatherDescription } from '@/lib/api/weather';
import { getMoonPhase, getMoonPhaseEmoji, getMoonPhaseName } from '@/lib/api/moon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

function severityClass(severity: string) {
  switch (severity) {
    case 'low':
      return 'border-l-4 border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950/30 dark:text-blue-100';
    case 'medium':
      return 'border-l-4 border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-100';
    case 'high':
      return 'border-l-4 border-orange-500 bg-orange-50 text-orange-900 dark:bg-orange-950/30 dark:text-orange-100';
    case 'extreme':
      return 'border-l-4 border-red-500 bg-red-50 text-red-900 dark:bg-red-950/30 dark:text-red-100';
    default:
      return '';
  }
}

function SkeletonLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function WeatherPage() {
  const location = useAppStore((s) => s.location);
  const { weather, loading, error, refresh } = useWeather();

  const hourly = useMemo(() => {
    if (!weather) return [];
    const now = new Date();
    const startIndex = weather.hourly.time.findIndex((t) => new Date(t) >= now);
    const safeStart = startIndex === -1 ? 0 : startIndex;
    return weather.hourly.time.slice(safeStart, safeStart + 12).map((time, i) => {
      const idx = safeStart + i;
      const date = new Date(time);
      return {
        timeLabel: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: weather.hourly.temperature[idx],
        code: weather.hourly.weatherCode[idx],
      };
    });
  }, [weather]);

  const daily = useMemo(() => {
    if (!weather) return [];
    return weather.daily.time.map((date, i) => ({
      date,
      dayName: new Date(`${date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' }),
      max: weather.daily.temperatureMax[i],
      min: weather.daily.temperatureMin[i],
      code: weather.daily.weatherCode[i],
      precipProb: weather.daily.precipitationProbabilityMax[i],
    }));
  }, [weather]);

  const alerts = useMemo(() => {
    if (!weather) return [];
    return generateWeatherAlerts(weather);
  }, [weather]);

  const hazards = useMemo(() => {
    if (!weather) return [];
    return evaluateThaiHazards(
      new Date(),
      weather.current.temperature,
      weather.current.precipitation,
      weather.current.humidity,
      weather.current.windSpeed
    );
  }, [weather]);

  const moon = useMemo(() => getMoonPhase(), []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Weather</h1>
          <p className="text-muted-foreground">{location.name}</p>
        </div>
        <Button onClick={refresh} disabled={loading} variant="outline">
          Refresh
        </Button>
      </div>

      {loading && <SkeletonLoading />}
      {error && <p className="text-destructive">{error}</p>}

      {weather && !loading && (
        <>
          {/* Current Conditions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-6xl">{getWeatherIcon(weather.current.weatherCode)}</span>
                  <div>
                    <p className="text-4xl font-semibold">{Math.round(weather.current.temperature)}°C</p>
                    <p className="text-muted-foreground">{getWeatherDescription(weather.current.weatherCode)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Humidity</p>
                    <p className="font-medium">{weather.current.humidity}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Wind</p>
                    <p className="font-medium">{Math.round(weather.current.windSpeed)} km/h</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">UV Index</p>
                    <p className="font-medium">{weather.current.uvIndex}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Pressure</p>
                    <p className="font-medium">{Math.round(weather.current.pressure)} hPa</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hourly Forecast */}
          <section>
            <h2 className="mb-3 text-lg font-medium">Hourly Forecast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {hourly.map((h, i) => (
                <Card key={i} size="sm" className="min-w-[5.5rem] items-center text-center">
                  <CardContent className="flex flex-col items-center gap-1 py-3">
                    <span className="text-xs text-muted-foreground">{h.timeLabel}</span>
                    <span className="text-xl">{getWeatherIcon(h.code)}</span>
                    <span className="text-sm font-medium">{Math.round(h.temp)}°</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 7-Day Forecast */}
          <section>
            <h2 className="mb-3 text-lg font-medium">7-Day Forecast</h2>
            <div className="grid gap-3">
              {daily.map((d, i) => (
                <Card key={i} size="sm" className="flex-row items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getWeatherIcon(d.code)}</span>
                    <div>
                      <p className="text-sm font-medium">{d.dayName}</p>
                      <p className="text-xs text-muted-foreground">{d.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">💧 {d.precipProb}%</span>
                    <span className="font-medium">
                      {Math.round(d.max)}° / {Math.round(d.min)}°
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Alerts */}
          {alerts.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-medium">Alerts</h2>
              <div className="grid gap-3">
                {alerts.map((alert, i) => (
                  <Card key={i} className={severityClass(alert.severity)}>
                    <CardContent className="py-3">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm opacity-90">{alert.message}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Thai Hazards */}
          {hazards.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-medium">Thai Farming Hazards</h2>
              <div className="grid gap-3">
                {hazards.map((h, i) => (
                  <Card key={i} className={severityClass(h.severity)}>
                    <CardContent className="py-3">
                      <p className="font-medium">{h.title}</p>
                      <p className="text-sm opacity-90">{h.description}</p>
                      <p className="mt-1 text-xs opacity-80">{h.farmingImpact}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Moon Phase */}
          <Card>
            <CardHeader>
              <CardTitle>Moon Phase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getMoonPhaseEmoji(moon.phase)}</span>
                <div>
                  <p className="font-medium">{getMoonPhaseName(moon.phase)}</p>
                  <p className="text-sm text-muted-foreground">{moon.illumination}% illuminated</p>
                  <p className="mt-1 text-sm text-muted-foreground">{moon.plantingAdvice}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
