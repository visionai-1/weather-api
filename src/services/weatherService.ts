import axios from 'axios';
import { ENV } from '../config/constants';
import { WeatherData, TomorrowAPIResponse, LocationQuery } from '../interfaces/weather';
import HttpError from '../utils/httpError';

/**
 * 🌤️ Weather Service
 * Integration with Tomorrow.io API for real-time weather data
 */

const TOMORROW_API_BASE_URL = 'https://api.tomorrow.io/v4';
const API_KEY = process.env.TOMORROW_API_KEY;

/**
 * Convert city name to coordinates using geocoding
 */
const geocodeCity = async (city: string): Promise<{ lat: number; lng: number }> => {
    try {
        // Using Tomorrow.io's location search
        const response = await axios.get(`${TOMORROW_API_BASE_URL}/map/search`, {
            params: {
                apikey: API_KEY,
                query: city,
                limit: 1
            }
        });

        const location = response.data?.features?.[0];
        if (!location) {
            throw HttpError.notFound(`City "${city}" not found`);
        }

        const [lng, lat] = location.geometry.coordinates;
        return { lat, lng };
    } catch (error) {
        if (error instanceof HttpError) throw error;
        throw HttpError.badRequest(`Failed to geocode city: ${city}`);
    }
};

/**
 * Fetch weather data from Tomorrow.io API
 */
export const fetchWeatherData = async (location: LocationQuery): Promise<WeatherData> => {
    if (!API_KEY) {
        throw HttpError.internalServerError('Tomorrow.io API key not configured');
    }

    try {
        let lat: number, lng: number;

        // Handle different location inputs
        if (location.lat && location.lng) {
            lat = location.lat;
            lng = location.lng;
        } else if (location.city) {
            const coords = await geocodeCity(location.city);
            lat = coords.lat;
            lng = coords.lng;
        } else {
            throw HttpError.badRequest('Location must include lat/lng or city name');
        }

        // Fetch current weather data
        const response = await axios.get(`${TOMORROW_API_BASE_URL}/weather/realtime`, {
            params: {
                location: `${lat},${lng}`,
                apikey: API_KEY,
                units: 'metric'
            },
            timeout: 10000
        });

        const apiData: TomorrowAPIResponse = response.data;
        
        // Transform API response to our weather data format
        const weatherData: WeatherData = {
            location: {
                lat,
                lng,
                name: location.city || `${lat},${lng}`
            },
            timestamp: new Date(apiData.data.time),
            temperature: apiData.data.values.temperature,
            humidity: apiData.data.values.humidity,
            windSpeed: apiData.data.values.windSpeed,
            windDirection: apiData.data.values.windDirection,
            precipitation: {
                intensity: apiData.data.values.precipitationIntensity,
                probability: apiData.data.values.precipitationProbability
            },
            visibility: apiData.data.values.visibility,
            uvIndex: apiData.data.values.uvIndex,
            cloudCover: apiData.data.values.cloudCover,
            pressure: apiData.data.values.pressureSurfaceLevel,
            weatherCode: apiData.data.values.weatherCode,
            description: getWeatherDescription(apiData.data.values.weatherCode),
            createdAt: new Date()
        };

        return weatherData;

    } catch (error) {
        if (error instanceof HttpError) throw error;
        
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 401) {
                throw HttpError.unauthorized('Invalid Tomorrow.io API key');
            }
            if (error.response?.status === 429) {
                throw HttpError.tooManyRequests('Tomorrow.io API rate limit exceeded');
            }
        }

        throw HttpError.internalServerError('Failed to fetch weather data');
    }
};

/**
 * Get weather description from weather code
 */
const getWeatherDescription = (code: number): string => {
    const descriptions: Record<number, string> = {
        0: 'Unknown',
        1000: 'Clear',
        1100: 'Mostly Clear',
        1101: 'Partly Cloudy',
        1102: 'Mostly Cloudy',
        1001: 'Cloudy',
        2000: 'Fog',
        2100: 'Light Fog',
        4000: 'Drizzle',
        4001: 'Rain',
        4200: 'Light Rain',
        4201: 'Heavy Rain',
        5000: 'Snow',
        5001: 'Flurries',
        5100: 'Light Snow',
        5101: 'Heavy Snow',
        6000: 'Freezing Drizzle',
        6001: 'Freezing Rain',
        6200: 'Light Freezing Rain',
        6201: 'Heavy Freezing Rain',
        7000: 'Ice Pellets',
        7101: 'Heavy Ice Pellets',
        7102: 'Light Ice Pellets',
        8000: 'Thunderstorm'
    };

    return descriptions[code] || 'Unknown';
}; 