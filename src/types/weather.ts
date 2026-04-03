export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  uvIndex: number;
  pressure: number;
  precipitation: number;
  cloudCover: number;
  dewPoint: number;
  visibility: number;
  time: string;
}

export interface HourlyForecast {
  time: string[];
  temperature: number[];
  humidity: number[];
  precipitation: number[];
  precipitationProbability: number[];
  weatherCode: number[];
  windSpeed: number[];
  windDirection: number[];
  uvIndex: number[];
  dewPoint: number[];
  cloudCover: number[];
  visibility: number[];
  pressure: number[];
}

export interface DailyForecast {
  time: string[];
  temperatureMax: number[];
  temperatureMin: number[];
  precipitationSum: number[];
  precipitationProbabilityMax: number[];
  weatherCode: number[];
  windSpeedMax: number[];
  uvIndexMax: number[];
  sunrise: string[];
  sunset: string[];
  precipitationHours: number[];
  et0: number[]; // evapotranspiration
}

export interface SoilData {
  time: string[];
  soilTemperature0cm: number[];
  soilTemperature6cm: number[];
  soilTemperature18cm: number[];
  soilMoisture0to1cm: number[];
  soilMoisture1to3cm: number[];
  soilMoisture3to9cm: number[];
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyForecast;
  daily: DailyForecast;
  soil: SoilData;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ThaiHazard {
  type: 'monsoon' | 'burning_season' | 'flood_risk' | 'extreme_heat' | 'storm';
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  title: string;
  description: string;
  farmingImpact: string;
  active: boolean;
}
