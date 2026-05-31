import type { WeatherData } from '@/types/weather';

export interface WeatherAlert {
  id: string;
  type: 'storm' | 'heat' | 'frost' | 'wind' | 'drought' | 'flood' | 'uv' | 'humidity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  action: string;
  affectedPlants?: string[];
}

/**
 * Generate actionable weather alerts for gardeners based on forecast data.
 */
export function generateWeatherAlerts(weather: WeatherData | null): WeatherAlert[] {
  if (!weather) return [];

  const alerts: WeatherAlert[] = [];
  const current = weather.current;
  const daily = weather.daily;

  // Storm alert — heavy rain or thunderstorm in forecast
  const maxRainNext3Days = Math.max(
    ...daily.precipitationSum.slice(0, 3)
  );
  if (maxRainNext3Days > 50) {
    alerts.push({
      id: 'storm-heavy-rain',
      type: 'storm',
      severity: 'critical',
      title: 'Heavy Rain Incoming',
      description: `Up to ${maxRainNext3Days.toFixed(0)}mm of rain expected in the next 3 days. Risk of root rot and nutrient leaching.`,
      action: 'Move potted plants under cover. Ensure drainage is clear. Pause fertilizing.',
      affectedPlants: ['Lettuce', 'Tomato', 'Herbs', 'Strawberry'],
    });
  } else if (maxRainNext3Days > 20) {
    alerts.push({
      id: 'storm-moderate-rain',
      type: 'storm',
      severity: 'warning',
      title: 'Moderate Rain Expected',
      description: `Up to ${maxRainNext3Days.toFixed(0)}mm of rain in the next 3 days.`,
      action: 'Check drainage. Cover sensitive seedlings. Harvest ripe produce before rain.',
    });
  }

  // Heat alert
  const maxTempNext3Days = Math.max(
    ...daily.temperatureMax.slice(0, 3)
  );
  if (maxTempNext3Days > 38) {
    alerts.push({
      id: 'heat-extreme',
      type: 'heat',
      severity: 'critical',
      title: 'Extreme Heat Warning',
      description: `Temperatures reaching ${Math.round(maxTempNext3Days)}°C. Plants may wilt or bolt.`,
      action: 'Water deeply early morning. Set up shade cloth for sensitive crops. Avoid transplanting.',
      affectedPlants: ['Lettuce', 'Cilantro', 'Spinach', 'Seedlings'],
    });
  } else if (maxTempNext3Days > 35) {
    alerts.push({
      id: 'heat-high',
      type: 'heat',
      severity: 'warning',
      title: 'High Heat Alert',
      description: `Temperatures up to ${Math.round(maxTempNext3Days)}°C expected.`,
      action: 'Increase watering frequency. Mulch soil surface to retain moisture.',
    });
  }

  // Frost alert (unlikely in Thailand but included for completeness)
  const minTempNext3Days = Math.min(
    ...daily.temperatureMin.slice(0, 3)
  );
  if (minTempNext3Days < 10) {
    alerts.push({
      id: 'frost-risk',
      type: 'frost',
      severity: 'critical',
      title: 'Frost Risk',
      description: `Lows dropping to ${Math.round(minTempNext3Days)}°C. Tender plants at risk.`,
      action: 'Cover tender plants with cloth overnight. Move containers indoors if possible.',
    });
  }

  // Wind alert
  const maxWindNext3Days = Math.max(
    ...daily.windSpeedMax.slice(0, 3)
  );
  if (maxWindNext3Days > 40) {
    alerts.push({
      id: 'wind-strong',
      type: 'wind',
      severity: 'warning',
      title: 'Strong Winds Expected',
      description: `Winds up to ${Math.round(maxWindNext3Days)} km/h. Risk of plant damage.`,
      action: 'Stake tall plants. Secure trellises. Move lightweight containers to shelter.',
    });
  }

  // UV alert
  const maxUvNext3Days = Math.max(
    ...daily.uvIndexMax.slice(0, 3)
  );
  if (maxUvNext3Days > 10) {
    alerts.push({
      id: 'uv-extreme',
      type: 'uv',
      severity: 'warning',
      title: 'Extreme UV Index',
      description: `UV index reaching ${Math.round(maxUvNext3Days)}. Intense sun can scorch leaves.`,
      action: 'Deploy shade cloth (30-50%) over sensitive crops. Water early to prevent heat stress.',
    });
  }

  // Humidity / fungal risk
  if (current.humidity > 85) {
    alerts.push({
      id: 'humidity-high',
      type: 'humidity',
      severity: 'warning',
      title: 'High Humidity — Fungal Risk',
      description: `Current humidity is ${current.humidity}%. Ideal conditions for fungal diseases.`,
      action: 'Improve air circulation. Avoid overhead watering. Apply fungicide preventively if needed.',
      affectedPlants: ['Tomato', 'Cucumber', 'Squash', 'Basil'],
    });
  }

  // Drought alert — no rain forecast for 7+ days
  const rainNext7Days = daily.precipitationSum.slice(0, 7).reduce((a, b) => a + b, 0);
  if (rainNext7Days < 5 && current.temperature > 30) {
    alerts.push({
      id: 'drought-risk',
      type: 'drought',
      severity: 'warning',
      title: 'Dry Spell Ahead',
      description: `Less than 5mm of rain forecast over the next 7 days with temps above 30°C.`,
      action: 'Deep water in early morning. Apply mulch to reduce evaporation. Prioritize fruiting plants.',
    });
  }

  return alerts.sort((a, b) => {
    const severityOrder = { critical: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}
