import type { WeatherData } from "@/types";

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

export async function fetchWeather(lat: number, lon: number, signal?: AbortSignal): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,cloud_cover,visibility,dew_point_2m,uv_index",
    hourly: "temperature_2m,relative_humidity_2m,precipitation,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset,precipitation_hours,et0_fao_evapotranspiration",
    timezone: "auto",
    forecast_days: "7",
  });

  const soilParams = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm",
    timezone: "auto",
    forecast_days: "7",
  });

  try {
    const [weatherRes, soilRes] = await Promise.all([
      fetch(`${OPEN_METEO_URL}?${params.toString()}`, { signal }),
      fetch(`${OPEN_METEO_URL}?${soilParams.toString()}`, { signal }),
    ]);

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status} ${weatherRes.statusText}`);
    }

    const weatherJson = await weatherRes.json();
    const soilJson = soilRes.ok ? await soilRes.json() : null;

    const current = weatherJson.current;
    const hourly = weatherJson.hourly;
    const daily = weatherJson.daily;
    const soilHourly = soilJson?.hourly;

    const weatherData: WeatherData = {
      current: {
        temperature: current.temperature_2m ?? 0,
        feelsLike: current.apparent_temperature ?? 0,
        humidity: current.relative_humidity_2m ?? 0,
        windSpeed: current.wind_speed_10m ?? 0,
        windDirection: current.wind_direction_10m ?? 0,
        weatherCode: current.weather_code ?? 0,
        precipitation: current.precipitation ?? 0,
        uvIndex: current.uv_index ?? 0,
        pressure: current.pressure_msl ?? 0,
        dewPoint: current.dew_point_2m ?? 0,
        cloudCover: current.cloud_cover ?? 0,
        visibility: current.visibility ?? 0,
      },
      hourly: {
        time: hourly.time ?? [],
        temperature: hourly.temperature_2m ?? [],
        weatherCode: hourly.weather_code ?? [],
        precipitation: hourly.precipitation ?? [],
        humidity: hourly.relative_humidity_2m ?? [],
      },
      daily: {
        time: daily.time ?? [],
        weatherCode: daily.weather_code ?? [],
        temperatureMax: daily.temperature_2m_max ?? [],
        temperatureMin: daily.temperature_2m_min ?? [],
        precipitationSum: daily.precipitation_sum ?? [],
        precipitationProbabilityMax: daily.precipitation_probability_max ?? [],
        windSpeedMax: daily.wind_speed_10m_max ?? [],
        uvIndexMax: daily.uv_index_max ?? [],
        sunrise: daily.sunrise ?? [],
        sunset: daily.sunset ?? [],
        precipitationHours: daily.precipitation_hours ?? [],
        et0: daily.et0_fao_evapotranspiration ?? [],
      },
      soil: {
        soilTemperature0cm: soilHourly?.soil_temperature_0cm,
        soilTemperature6cm: soilHourly?.soil_temperature_6cm,
        soilTemperature18cm: soilHourly?.soil_temperature_18cm,
        soilMoisture0to1cm: soilHourly?.soil_moisture_0_to_1cm,
        soilMoisture1to3cm: soilHourly?.soil_moisture_1_to_3cm,
        soilMoisture3to9cm: soilHourly?.soil_moisture_3_to_9cm,
      },
    };

    return weatherData;
  } catch (err) {
    console.error("Failed to fetch weather:", err);
    throw err instanceof Error ? err : new Error("Unknown weather fetch error");
  }
}

export function getWeatherIcon(code: number): string {
  const mapping: Record<number, string> = {
    0: "☀️",
    1: "🌤️",
    2: "⛅",
    3: "☁️",
    45: "🌫️",
    48: "🌫️",
    51: "🌦️",
    53: "🌦️",
    55: "🌧️",
    56: "🌧️",
    57: "🌧️",
    61: "🌧️",
    63: "🌧️",
    65: "🌧️",
    66: "🌨️",
    67: "🌨️",
    71: "🌨️",
    73: "🌨️",
    75: "🌨️",
    77: "🌨️",
    80: "🌦️",
    81: "🌧️",
    82: "🌧️",
    85: "🌨️",
    86: "🌨️",
    95: "⛈️",
    96: "⛈️",
    99: "⛈️",
  };
  return mapping[code] ?? "🌡️";
}

export function getWeatherDescription(code: number): string {
  const mapping: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };
  return mapping[code] ?? "Unknown";
}
