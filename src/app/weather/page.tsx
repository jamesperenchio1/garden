'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useWeather } from '@/hooks/use-weather';
import { useAppStore } from '@/store/app-store';
import { getWeatherDescription, getWeatherIcon } from '@/lib/api/weather';
import { evaluateThaiHazards } from '@/data/thai-hazards';
import { getMoonPhase, getMoonPhaseEmoji, getMoonPhaseName } from '@/lib/api/moon';
import { format } from 'date-fns';

export default function WeatherPage() {
  const { weather, loading, error, refresh } = useWeather();
  const { thaiHazardsEnabled, setThaiHazardsEnabled, location } = useAppStore();
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const today = new Date();
  const moonPhase = getMoonPhase(today);
  const hazards = weather
    ? evaluateThaiHazards(today, weather.current.temperature, weather.current.precipitation, weather.current.humidity, weather.current.windSpeed)
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <Card>
        <CardContent className="pt-6 text-center py-12 space-y-4">
          <p className="text-lg font-semibold text-destructive">Unable to load weather data</p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {error ?? 'Weather service is unreachable.'} Check your connection and try again.
          </p>
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Conditions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Current Conditions</CardTitle>
            <p className="text-sm text-muted-foreground">{location.name}</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-4">
                <span className="text-5xl">{getWeatherIcon(weather.current.weatherCode)}</span>
                <div>
                  <p className="text-4xl font-bold">{Math.round(weather.current.temperature)}°C</p>
                  <p className="text-muted-foreground">{getWeatherDescription(weather.current.weatherCode)}</p>
                  <p className="text-sm text-muted-foreground">Feels like {Math.round(weather.current.feelsLike)}°C</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Humidity</p>
                <p className="text-lg font-semibold">{weather.current.humidity}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Wind</p>
                <p className="text-lg font-semibold">{Math.round(weather.current.windSpeed)} km/h</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">UV Index</p>
                <p className="text-lg font-semibold">{weather.current.uvIndex}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Pressure</p>
                <p className="text-lg font-semibold">{Math.round(weather.current.pressure)} hPa</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Dew Point</p>
                <p className="text-lg font-semibold">{Math.round(weather.current.dewPoint)}°C</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Precipitation</p>
                <p className="text-lg font-semibold">{weather.current.precipitation} mm</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Cloud Cover</p>
                <p className="text-lg font-semibold">{weather.current.cloudCover}%</p>
              </div>
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-muted-foreground">Visibility</p>
                <p className="text-lg font-semibold">{(weather.current.visibility / 1000).toFixed(1)} km</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Thai Hazards */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Thai Weather Hazards</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="hazard-toggle" className="text-sm">Show hazards</Label>
              <Switch
                id="hazard-toggle"
                checked={thaiHazardsEnabled}
                onCheckedChange={setThaiHazardsEnabled}
              />
            </div>
          </div>
        </CardHeader>
        {thaiHazardsEnabled && (
          <CardContent>
            {hazards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active hazards for current conditions.</p>
            ) : (
              <Accordion>
                {hazards.map((hazard, i) => (
                  <AccordionItem key={i} value={`hazard-${i}`}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={hazard.severity === 'extreme' || hazard.severity === 'high' ? 'destructive' : 'default'}
                          className="text-xs"
                        >
                          {hazard.severity}
                        </Badge>
                        <span>{hazard.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        <p className="text-sm">{hazard.description}</p>
                        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                          <p className="text-sm font-medium text-amber-800">Farming Impact</p>
                          <p className="text-sm text-amber-700">{hazard.farmingImpact}</p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        )}
      </Card>

      {/* Forecast Tabs */}
      <Tabs defaultValue="hourly">
        <TabsList>
          <TabsTrigger value="hourly">Hourly</TabsTrigger>
          <TabsTrigger value="daily">14-Day</TabsTrigger>
          <TabsTrigger value="agricultural">Agricultural</TabsTrigger>
          <TabsTrigger value="moon">Moon Phases</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-max pb-2">
                  {weather.hourly.time.slice(0, 24).map((time, i) => (
                    <div key={time} className="text-center min-w-[60px]">
                      <p className="text-xs text-muted-foreground">{format(new Date(time), 'HH:mm')}</p>
                      <p className="text-lg my-1">{getWeatherIcon(weather.hourly.weatherCode[i])}</p>
                      <p className="text-sm font-semibold">{Math.round(weather.hourly.temperature[i])}°</p>
                      <p className="text-xs text-blue-600">{weather.hourly.precipitation[i]}mm</p>
                      <p className="text-xs text-muted-foreground">{weather.hourly.humidity[i]}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="mt-4">
          <div className="space-y-2">
            {weather.daily.time.map((date, i) => (
              <Accordion key={date}>
                <AccordionItem value={date}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-4 flex-1">
                      <span className="w-20 text-sm">{format(new Date(date), 'EEE, MMM d')}</span>
                      <span className="text-lg">{getWeatherIcon(weather.daily.weatherCode[i])}</span>
                      <span className="text-sm font-semibold w-16">
                        {Math.round(weather.daily.temperatureMax[i])}° / {Math.round(weather.daily.temperatureMin[i])}°
                      </span>
                      <span className="text-xs text-blue-600">{weather.daily.precipitationSum[i]}mm</span>
                      {weather.daily.precipitationProbabilityMax[i] > 50 && (
                        <Badge variant="secondary" className="text-xs">
                          {weather.daily.precipitationProbabilityMax[i]}% rain
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-2">
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Max Wind</p>
                        <p className="font-medium">{Math.round(weather.daily.windSpeedMax[i])} km/h</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">UV Index</p>
                        <p className="font-medium">{weather.daily.uvIndexMax[i]}</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Sunrise</p>
                        <p className="font-medium">{weather.daily.sunrise[i] ? format(new Date(weather.daily.sunrise[i]), 'HH:mm') : '-'}</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Sunset</p>
                        <p className="font-medium">{weather.daily.sunset[i] ? format(new Date(weather.daily.sunset[i]), 'HH:mm') : '-'}</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Rain Hours</p>
                        <p className="font-medium">{weather.daily.precipitationHours[i]}h</p>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <p className="text-xs text-muted-foreground">Evapotranspiration</p>
                        <p className="font-medium">{weather.daily.et0[i]?.toFixed(1)} mm</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="agricultural" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Soil Temperature</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weather.soil.soilTemperature0cm?.[0] !== undefined && (
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Surface (0cm)</span>
                      <span className="font-semibold">{weather.soil.soilTemperature0cm[0]?.toFixed(1)}°C</span>
                    </div>
                  )}
                  {weather.soil.soilTemperature6cm?.[0] !== undefined && (
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Shallow (6cm)</span>
                      <span className="font-semibold">{weather.soil.soilTemperature6cm[0]?.toFixed(1)}°C</span>
                    </div>
                  )}
                  {weather.soil.soilTemperature18cm?.[0] !== undefined && (
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Deep (18cm)</span>
                      <span className="font-semibold">{weather.soil.soilTemperature18cm[0]?.toFixed(1)}°C</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Soil Moisture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weather.soil.soilMoisture0to1cm?.[0] !== undefined && (
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Surface (0-1cm)</span>
                      <span className="font-semibold">{(weather.soil.soilMoisture0to1cm[0] * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {weather.soil.soilMoisture1to3cm?.[0] !== undefined && (
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Shallow (1-3cm)</span>
                      <span className="font-semibold">{(weather.soil.soilMoisture1to3cm[0] * 100).toFixed(1)}%</span>
                    </div>
                  )}
                  {weather.soil.soilMoisture3to9cm?.[0] !== undefined && (
                    <div className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">Root zone (3-9cm)</span>
                      <span className="font-semibold">{(weather.soil.soilMoisture3to9cm[0] * 100).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Growing Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Evapotranspiration</span>
                    <span className="font-semibold">{weather.daily.et0[0]?.toFixed(1)} mm/day</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">Dew Point</span>
                    <span className="font-semibold">{Math.round(weather.current.dewPoint)}°C</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted rounded">
                    <span className="text-sm">UV Index</span>
                    <span className="font-semibold">{weather.current.uvIndex} ({weather.current.uvIndex > 8 ? 'Very High' : weather.current.uvIndex > 5 ? 'High' : 'Moderate'})</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Farming Advice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {weather.current.temperature > 35 && (
                    <p className="p-2 bg-amber-50 rounded text-amber-800">High heat: Water early morning or evening. Use shade cloth for sensitive crops.</p>
                  )}
                  {weather.current.humidity > 80 && (
                    <p className="p-2 bg-blue-50 rounded text-blue-800">High humidity: Watch for fungal diseases. Improve air circulation around plants.</p>
                  )}
                  {weather.current.uvIndex > 8 && (
                    <p className="p-2 bg-orange-50 rounded text-orange-800">Extreme UV: Leafy greens may bolt. Consider shade cloth protection.</p>
                  )}
                  {weather.current.windSpeed > 25 && (
                    <p className="p-2 bg-gray-50 rounded text-gray-800">High winds: Stake tall plants. Protect seedlings and young transplants.</p>
                  )}
                  {weather.current.temperature <= 35 && weather.current.humidity <= 80 && weather.current.uvIndex <= 8 && weather.current.windSpeed <= 25 && (
                    <p className="p-2 bg-green-50 rounded text-green-800">Good growing conditions today. Great time for transplanting and general garden work.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="moon" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <span className="text-6xl">{getMoonPhaseEmoji(moonPhase.phase)}</span>
                <p className="text-xl font-semibold mt-2">{getMoonPhaseName(moonPhase.phase)}</p>
                <p className="text-sm text-muted-foreground">Illumination: {moonPhase.illumination}%</p>
                <p className="text-sm mt-2 p-3 bg-muted rounded-lg">{moonPhase.plantingAdvice}</p>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 14 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() + i);
                  const phase = getMoonPhase(date);
                  return (
                    <div key={i} className="text-center p-2 rounded-lg hover:bg-muted cursor-pointer" title={getMoonPhaseName(phase.phase)}>
                      <p className="text-xs text-muted-foreground">{format(date, 'dd')}</p>
                      <p className="text-lg">{getMoonPhaseEmoji(phase.phase)}</p>
                      <p className="text-xs">{phase.illumination}%</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
