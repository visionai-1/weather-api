/**
 * 🌤️ Weather Data Interfaces
 * Simplified interfaces for Tomorrow.io API integration
 */

// Location interfaces
export interface Location {
    lat?: number;
    lon?: number;
    name?: string;
    country?: string;
}

export interface LocationQuery {
    lat?: number;
    lon?: number;
    city?: string;
}

export type TimestepKey = 'hourly' | 'daily';
// Tomorrow.io API response interfaces
export interface TomorrowRealtimeResponse {
    data: {
        time: string;
        values: {
            temperature: number;
            humidity: number;
            windSpeed: number;
            windDirection: number;
            precipitationIntensity: number;
            precipitationProbability: number;
            visibility: number;
            uvIndex: number;
            cloudCover: number;
            pressureSurfaceLevel: number;
            weatherCode: number;
        };
    };
    location: {
        lat: number;
        lon: number;
    };
}

export interface TomorrowForecastResponse {
    timelines: {
        timestep: string;
        intervals: Array<{
            startTime: string;
            values: {
                temperature: number;
                humidity: number;
                windSpeed: number;
                windDirection: number;
                precipitationIntensity?: number;
                precipitationProbability?: number;
                visibility: number;
                uvIndex: number;
                cloudCover: number;
                pressureSurfaceLevel: number;
                weatherCode: number;
            };
        }>;
    }[];
    location: {
        lat: number;
        lon: number;
    };
}
// Our weather data models
export interface WeatherData {
    location: Location;
    timestamp?: Date | string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: {
        intensity: number;
        probability: number;
    };
    visibility: number;
    uvIndex: number;
    cloudCover: number;
    pressure: number;
    weatherCode: number;
    description: string;
}
export interface ForecastData {
    location: Location;
    timestep: '1d' | '1h';
    intervals: Array<{
      time: Date | string;
      temperature: number;              // hourly: temperature, daily: max temp
      feelsLike: number;               // hourly: apparent, daily: max apparent
      humidity: number;                // avg humidity
      cloudCover: number;              // avg cloud cover
      precipitationChance: number;     // max precipitation probability
      windSpeed: number;               // avg wind speed
      uvIndex: number;                 // max uv
      sunrise?: string;                // only in daily
      sunset?: string;                 // only in daily
      weatherCode: number;
      description: string;
    }>;
  }
  

// Compact weather response format
export interface CompactWeatherData {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    timestamp?: Date | string;
}

// API response interfaces
export interface WeatherResponse {
    success: boolean;
    data?: WeatherData | ForecastData | WeatherData[] | CompactWeatherData;
    message?: string;
}

export interface WeatherRequest {
    location: LocationQuery;
    units?: 'metric' | 'imperial';
    format?: 'full' | 'compact';
} 