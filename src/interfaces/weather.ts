/**
 * 🌤️ Weather Data Interfaces
 * Tomorrow.io API integration and weather data models
 */

// Location interfaces
export interface Location {
    lat: number;
    lng: number;
    name?: string;
    country?: string;
}

export interface LocationQuery {
    lat?: number;
    lng?: number;
    city?: string;
}

// Tomorrow.io API response interfaces
export interface TomorrowAPIResponse {
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
        name?: string;
        type?: string;
    };
}

// Our simplified weather data
export interface WeatherData {
    id?: string;
    location: Location;
    timestamp: Date;
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
    description?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

// API request/response interfaces
export interface WeatherRequest {
    location: LocationQuery;
    fields?: string[];
    units?: 'metric' | 'imperial';
}

export interface WeatherResponse {
    success: boolean;
    data?: WeatherData;
    message?: string;
}

export interface WeatherListResponse {
    success: boolean;
    data?: WeatherData[];
    total?: number;
    page?: number;
    limit?: number;
} 