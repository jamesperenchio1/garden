import type { WeatherData, CurrentWeather, HourlyForecast, DailyForecast, SoilData } from '@/types/weather';

const BASE_URL = 'https://api.open-meteo.com/v1';

interface FetchWeatherParams {
  latitude: number;
  longitude: number;
  forecastDays?: number;
  pastDays?: number;
}

export async function fetchWeather({
  latitude,
  longitude,
  forecastDays = 14,
  pastDays = 0,
}: FetchWeatherParams): Promise<WeatherData> {
  const currentParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'weather_code',
    'wind_speed_10m',
    'wind_direction_10m',
    'precipitation',
    'cloud_cover',
    'surface_pressure',
    'uv_index',
    'dew_point_2m',
    'visibility',
  ].join(',');

  const hourlyParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'precipitation',
    'precipitation_probability',
    'weather_code',
    'wind_speed_10m',
    'wind_direction_10m',
    'uv_index',
    'dew_point_2m',
    'cloud_cover',
    'visibility',
    'surface_pressure',
    'soil_temperature_0cm',
    'soil_temperature_6cm',
    'soil_temperature_18cm',
    'soil_moisture_0_to_1cm',
    'soil_moisture_1_to_3cm',
    'soil_moisture_3_to_9cm',
  ].join(',');

  const dailyParams = [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'precipitation_probability_max',
    'weather_code',
    'wind_speed_10m_max',
    'uv_index_max',
    'sunrise',
    'sunset',
    'precipitation_hours',
    'et0_fao_evapotranspiration',
  ].join(',');

  const url = `${BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentParams}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=auto&forecast_days=${forecastDays}&past_days=${pastDays}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`);
  }

  const data = await response.json();
  return transformWeatherResponse(data);
}

export async function fetchHistoricalWeather(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<{ daily: DailyForecast }> {
  const dailyParams = [
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_sum',
    'weather_code',
    'wind_speed_10m_max',
    'et0_fao_evapotranspiration',
  ].join(',');

  const url = `${BASE_URL}/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=${dailyParams}&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Historical weather API error: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    daily: {
      time: data.daily.time,
      temperatureMax: data.daily.temperature_2m_max,
      temperatureMin: data.daily.temperature_2m_min,
      precipitationSum: data.daily.precipitation_sum,
      precipitationProbabilityMax: [],
      weatherCode: data.daily.weather_code,
      windSpeedMax: data.daily.wind_speed_10m_max,
      uvIndexMax: [],
      sunrise: [],
      sunset: [],
      precipitationHours: [],
      et0: data.daily.et0_fao_evapotranspiration,
    },
  };
}

function transformWeatherResponse(data: Record<string, unknown>): WeatherData {
  const current = data.current as Record<string, unknown>;
  const hourly = data.hourly as Record<string, unknown[]>;
  const daily = data.daily as Record<string, unknown[]>;

  return {
    latitude: data.latitude as number,
    longitude: data.longitude as number,
    timezone: data.timezone as string,
    current: {
      temperature: current.temperature_2m as number,
      feelsLike: current.apparent_temperature as number,
      humidity: current.relative_humidity_2m as number,
      windSpeed: current.wind_speed_10m as number,
      windDirection: current.wind_direction_10m as number,
      weatherCode: current.weather_code as number,
      uvIndex: current.uv_index as number,
      pressure: current.surface_pressure as number,
      precipitation: current.precipitation as number,
      cloudCover: current.cloud_cover as number,
      dewPoint: current.dew_point_2m as number,
      visibility: current.visibility as number,
      time: current.time as string,
    } as CurrentWeather,
    hourly: {
      time: hourly.time as string[],
      temperature: hourly.temperature_2m as number[],
      humidity: hourly.relative_humidity_2m as number[],
      precipitation: hourly.precipitation as number[],
      precipitationProbability: hourly.precipitation_probability as number[],
      weatherCode: hourly.weather_code as number[],
      windSpeed: hourly.wind_speed_10m as number[],
      windDirection: hourly.wind_direction_10m as number[],
      uvIndex: hourly.uv_index as number[],
      dewPoint: hourly.dew_point_2m as number[],
      cloudCover: hourly.cloud_cover as number[],
      visibility: hourly.visibility as number[],
      pressure: hourly.surface_pressure as number[],
    } as HourlyForecast,
    daily: {
      time: daily.time as string[],
      temperatureMax: daily.temperature_2m_max as number[],
      temperatureMin: daily.temperature_2m_min as number[],
      precipitationSum: daily.precipitation_sum as number[],
      precipitationProbabilityMax: daily.precipitation_probability_max as number[],
      weatherCode: daily.weather_code as number[],
      windSpeedMax: daily.wind_speed_10m_max as number[],
      uvIndexMax: daily.uv_index_max as number[],
      sunrise: daily.sunrise as string[],
      sunset: daily.sunset as string[],
      precipitationHours: daily.precipitation_hours as number[],
      et0: daily.et0_fao_evapotranspiration as number[],
    } as DailyForecast,
    soil: {
      time: hourly.time as string[],
      soilTemperature0cm: hourly.soil_temperature_0cm as number[],
      soilTemperature6cm: hourly.soil_temperature_6cm as number[],
      soilTemperature18cm: hourly.soil_temperature_18cm as number[],
      soilMoisture0to1cm: hourly.soil_moisture_0_to_1cm as number[],
      soilMoisture1to3cm: hourly.soil_moisture_1_to_3cm as number[],
      soilMoisture3to9cm: hourly.soil_moisture_3_to_9cm as number[],
    } as SoilData,
  };
}

export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    56: 'Light freezing drizzle',
    57: 'Dense freezing drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return descriptions[code] || 'Unknown';
}

export function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  return '⛈️';
}
