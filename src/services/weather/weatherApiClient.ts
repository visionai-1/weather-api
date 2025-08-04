import axios, { AxiosInstance } from 'axios';
import { TomorrowRealtimeResponse, TomorrowForecastResponse } from '../../interfaces/weather';
import { ENV } from '../../config/constants';
import HttpError from '../../utils/httpError';
import {
    getMockRealtimeWeatherByCoordinates,
    getMockRealtimeWeatherByCity,
    getMockForecastByCoordinates,
    getMockForecastByCity,
    getMockApiHealth
} from '../../mocks/simpleMocks';

/**
 * 🌐 Tomorrow.io API Client
 * Functional approach for Tomorrow.io weather API integration
 */

/**
 * Create and configure axios client for Tomorrow.io API
 */
const createApiClient = (): AxiosInstance => {
    // Skip API client creation if using mocks
    if (ENV.USE_MOCK_WEATHER) {
        return axios.create(); // Return empty client for mock mode
    }
    
    const apiKey = ENV.TOMORROW_API_KEY || '';
    
    if (!apiKey) {
        throw HttpError.internalServerError('Tomorrow.io API key not configured');
    }

    const client = axios.create({
        baseURL: ENV.TOMORROW_API_BASE_URL,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });

    // Add API key to all requests
    client.interceptors.request.use((config) => {
        config.params = { ...config.params, apikey: apiKey };
        return config;
    });

    // Handle API errors consistently
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            const status = error.response?.status;
            
            switch (status) {
                case 401:
                    throw HttpError.unauthorized('Invalid Tomorrow.io API key');
                case 403:
                    throw HttpError.forbidden('Tomorrow.io API access forbidden');
                case 429:
                    throw HttpError.tooManyRequests('Tomorrow.io API rate limit exceeded');
                case 404:
                    throw HttpError.notFound('Location not found');
                default:
                    if (status >= 500) {
                        throw HttpError.internalServerError('Tomorrow.io API server error');
                    }
                    throw HttpError.internalServerError('Failed to fetch weather data');
            }
        }
    );

    return client;
};

// Create the shared API client instance
const apiClient = createApiClient();

/**
 * Fetch real-time weather data for coordinates
 */
export const getRealTimeWeatherByCoordinates = async (
    lat: number, 
    lon: number, 
    units: 'metric' | 'imperial' = 'metric'
): Promise<TomorrowRealtimeResponse> => {
    // Return mock data if enabled
    if (ENV.USE_MOCK_WEATHER) {
        return getMockRealtimeWeatherByCoordinates(lat, lon);
    }
    
    const response = await apiClient.get('/weather/realtime', {
        params: {
            location: `${lat},${lon}`,
            units,
        },
    });
    return response.data;
};

/**
 * Fetch real-time weather data for city name
 */
export const getRealTimeWeatherByCity = async (
    city: string,
    units: 'metric' | 'imperial' = 'metric'
): Promise<TomorrowRealtimeResponse> => {
    // Return mock data if enabled
    if (ENV.USE_MOCK_WEATHER) {
        return getMockRealtimeWeatherByCity(city);
    }
    
    const response = await apiClient.get('/weather/realtime', {
        params: {
            location: city,
            units,
        },
    });
    return response.data;
};

/**
 * Fetch weather forecast for coordinates
 */
export const getWeatherForecastByCoordinates = async (
    lat: number, 
    lon: number, 
    timesteps: '1h' | '1d' = '1h',
    units: 'metric' | 'imperial' = 'metric'
): Promise<TomorrowForecastResponse> => {
    // Return mock data if enabled
    if (ENV.USE_MOCK_WEATHER) {
        return getMockForecastByCoordinates(lat, lon, timesteps);
    }
    
    const response = await apiClient.get('/weather/forecast', {
        params: {
            location: `${lat},${lon}`,
            timesteps,
            units,
        },
    });
    return response.data;
};

/**
 * Fetch weather forecast for city name
 */
export const getWeatherForecastByCity = async (
    city: string,
    timesteps: '1h' | '1d' = '1h',
    units: 'metric' | 'imperial' = 'metric'
): Promise<TomorrowForecastResponse> => {
    // Return mock data if enabled
    if (ENV.USE_MOCK_WEATHER) {
        return getMockForecastByCity(city, timesteps);
    }
    
    const response = await apiClient.get('/weather/forecast', {
        params: {
            location: city,
            timesteps,
            units,
        },
    });
    return response.data;
};

/**
 * Check API health status
 */
export const checkApiHealth = async (): Promise<{ status: 'healthy' | 'unhealthy' }> => {
    // Return mock health if enabled
    if (ENV.USE_MOCK_WEATHER) {
        return getMockApiHealth();
    }
    
    try {
        await apiClient.get('/weather/realtime', {
            params: {
                location: '0,0',
                units: 'metric',
            },
        });
        return { status: 'healthy' };
    } catch {
        return { status: 'unhealthy' };
    }
};