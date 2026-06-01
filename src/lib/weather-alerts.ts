import type { WeatherData } from "@/types";

export interface WeatherAlert {
  type: "storm" | "heat" | "uv" | "wind" | "fungal" | "drought";
  severity: "low" | "medium" | "high";
  title: string;
  message: string;
}

export function generateWeatherAlerts(weather: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const { current, daily } = weather;

  // Storm alert: thunderstorm codes (95-99) or very high precipitation probability
  const hasStormCode = daily.weatherCode.some((c) => c >= 95 && c <= 99);
  const highPrecipProb = daily.precipitationProbabilityMax.some((p) => p >= 80);
  if (hasStormCode || highPrecipProb) {
    alerts.push({
      type: "storm",
      severity: hasStormCode ? "high" : "medium",
      title: "Storm Warning",
      message: hasStormCode
        ? "Thunderstorms forecasted. Secure young plants, trellises, and covers. Avoid working in the garden during lightning."
        : "Heavy rain likely. Check drainage and avoid overwatering. Protect sensitive seedlings.",
    });
  }

  // Heat alert: daily max temps >= 35°C
  const maxTemp = Math.max(...daily.temperatureMax);
  if (maxTemp >= 35) {
    alerts.push({
      type: "heat",
      severity: maxTemp >= 38 ? "high" : "medium",
      title: "Extreme Heat",
      message: `Peak temperature reaching ${Math.round(maxTemp)}°C. Provide shade cloth for tender crops, water early morning or evening, and watch for wilting in lettuce, coriander, and bok choy.`,
    });
  }

  // Frost/cold alert: daily min temps <= 5°C (relevant for Thai highlands)
  const minTemp = Math.min(...daily.temperatureMin);
  if (minTemp <= 5) {
    alerts.push({
      type: "heat",
      severity: "high",
      title: "Frost Risk",
      message: `Lows dropping to ${Math.round(minTemp)}°C. Cover sensitive plants or move containers indoors. Basil and papaya are especially vulnerable.`,
    });
  }

  // UV alert
  const maxUv = Math.max(...daily.uvIndexMax);
  if (maxUv >= 8) {
    alerts.push({
      type: "uv",
      severity: maxUv >= 11 ? "high" : "medium",
      title: "High UV Index",
      message: `UV index reaching ${Math.round(maxUv)}. Use shade cloth for seedlings and sensitive leafy greens. Water in the morning to reduce transpiration stress.`,
    });
  }

  // Wind alert
  const maxWind = Math.max(...daily.windSpeedMax);
  if (maxWind >= 30) {
    alerts.push({
      type: "wind",
      severity: maxWind >= 50 ? "high" : "medium",
      title: "Strong Winds",
      message: `Gusts up to ${Math.round(maxWind)} km/h expected. Stake tall plants like tomato, eggplant, and papaya. Secure trellises and covers. Delay spraying.`,
    });
  }

  // Humidity / fungal alert
  const avgHumidity =
    weather.hourly.humidity.reduce((a, b) => a + b, 0) /
    (weather.hourly.humidity.length || 1);
  if (avgHumidity >= 85) {
    alerts.push({
      type: "fungal",
      severity: "medium",
      title: "High Humidity — Fungal Risk",
      message: "Prolonged high humidity increases risk of powdery mildew and downy mildew. Ensure good airflow, avoid wetting foliage, and inspect cucumber, bok choy, and basil for early signs.",
    });
  }

  // Drought alert: no rain forecast + high ET0 + low current humidity
  const totalPrecip = daily.precipitationSum.reduce((a, b) => a + b, 0);
  const avgEt0 = daily.et0.reduce((a, b) => a + b, 0) / (daily.et0.length || 1);
  if (totalPrecip < 5 && avgEt0 > 4 && current.humidity < 50) {
    alerts.push({
      type: "drought",
      severity: "medium",
      title: "Dry Conditions",
      message: "Little rain expected with high evapotranspiration. Increase watering frequency for container plants and shallow-rooted crops. Mulch to conserve soil moisture.",
    });
  }

  return alerts;
}
