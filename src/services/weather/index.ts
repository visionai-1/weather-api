import { WeatherData, ForecastData, LocationQuery, Location, CompactWeatherData } from '../../interfaces/weather';
import { 
    getRealTimeWeather, 
    getRealTimeWeatherByCity, 
    getWeatherForecast, 
    getWeatherForecastByCity, 
    searchLocation, 
    checkApiHealth 
} from './weatherApiClient';
import { validateLocationQuery, validateCoordinates, getWeatherDescription, sanitizeWeatherData } from '../../utils/weather';
import HttpError from '../../utils/httpError';

/**
 * 🌤️ Weather Service
 * Functional approach for Tomorrow.io weather API integration
 */

/**
 * Resolve location query - flexible to handle coordinates, city, or both
 */
const resolveLocation = (query: LocationQuery): Location => {
    // Validate location query
    const validation = validateLocationQuery(query);
    if (!validation.isValid) {
        throw HttpError.badRequest(validation.error || 'Invalid location query');
    }

    // If coordinates provided, validate and use them
    if (query.lat !== undefined && query.lon !== undefined) {
        if (!validateCoordinates(query.lat, query.lon)) {
            throw HttpError.badRequest('Invalid coordinates');
        }

        return {
            lat: query.lat,
            lon: query.lon,
            name: query.city || `${query.lat.toFixed(4)}, ${query.lon.toFixed(4)}`
        };
    }

    // If only city provided, return it (Tomorrow.io API can handle city names directly)
    if (query.city) {
        return { 
            name: query.city,
            lat: undefined,
            lon: undefined
        };
    }

    throw HttpError.badRequest('Location must include coordinates or city name');
};

/**
 * Transform Tomorrow.io realtime response to our WeatherData format
 */
const transformRealtimeResponse = (apiResponse: any): WeatherData => {
    const values = apiResponse.data.values;

    const weatherData: WeatherData = {
        location: apiResponse.location,
        timestamp: new Date(apiResponse.data.time),
        temperature: values.temperature,
        humidity: values.humidity,
        windSpeed: values.windSpeed,
        windDirection: values.windDirection,
        precipitation: {
            intensity: values.precipitationIntensity,
            probability: values.precipitationProbability
        },
        visibility: values.visibility,
        uvIndex: values.uvIndex,
        cloudCover: values.cloudCover,
        pressure: values.pressureSurfaceLevel,
        weatherCode: values.weatherCode,
        description: getWeatherDescription(values.weatherCode)
    };

    const sanitizedWeatherData = sanitizeWeatherData(weatherData);

    return sanitizedWeatherData;
};

/**
 * Transform Tomorrow.io forecast response to our ForecastData format
 */
const transformForecastResponse = (apiResponse: any, location: Location): ForecastData => {
    const timeline = apiResponse.timelines[0];

    return {
        location,
        timestep: timeline.timestep,
        intervals: timeline.intervals.map((interval: any) => ({
            time: new Date(interval.startTime),
            temperature: interval.values.temperature,
            humidity: interval.values.humidity,
            windSpeed: interval.values.windSpeed,
            windDirection: interval.values.windDirection,
            precipitation: {
                intensity: interval.values.precipitationIntensity,
                probability: interval.values.precipitationProbability
            },
            visibility: interval.values.visibility,
            uvIndex: interval.values.uvIndex,
            cloudCover: interval.values.cloudCover,
            pressure: interval.values.pressureSurfaceLevel,
            weatherCode: interval.values.weatherCode,
            description: getWeatherDescription(interval.values.weatherCode)
        }))
    };
};

/**
 * Get real-time weather for a location (flexible: coordinates or city name)
 */
export const getRealTimeWeatherData = async (
    locationQuery: LocationQuery,
    units: 'metric' | 'imperial' = 'metric'
): Promise<WeatherData> => {
    // Validate and resolve location
    const location = resolveLocation(locationQuery);

    let apiResponse;
    
    // Use coordinates if available, otherwise use city name
    if (location.lat !== undefined && location.lon !== undefined) {
        apiResponse = await getRealTimeWeather(location.lat, location.lon, units);
    } else if (location.name) {
        // Tomorrow.io API accepts city names as location parameter
        apiResponse = await getRealTimeWeatherByCity(location.name, units);
    } else {
        throw HttpError.badRequest('Invalid location data');
    }

    // Transform API response to our format
    return transformRealtimeResponse(apiResponse);
};

/**
 * Get weather forecast for a location (flexible: coordinates or city name)
 */
export const getWeatherForecastData = async (
    locationQuery: LocationQuery,
    timesteps: '1h' | '1d' = '1h',
    units: 'metric' | 'imperial' = 'metric'
) => {
    // Validate and resolve location
    const location = resolveLocation(locationQuery);

    let apiResponse;
    
    // Use coordinates if available, otherwise use city name
    if (location.lat !== undefined && location.lon !== undefined) {
        apiResponse = await getWeatherForecast(location.lat, location.lon, timesteps, units);
    } else if (location.name) {
        // Tomorrow.io API accepts city names as location parameter
        apiResponse = await getWeatherForecastByCity(location.name, timesteps, units);
    } else {
        throw HttpError.badRequest('Invalid location data');
    }

    // Transform API response to our format
    const forecastData = transformForecastResponse(apiResponse, location);

    // Return only essential forecast data
    return {
        location: {
            name: forecastData.location.name || location.name,
            lat: forecastData.location.lat || location.lat,
            lon: forecastData.location.lon || location.lon,
            country: forecastData.location.country
        },
        timestep: forecastData.timestep,
        intervals: forecastData.intervals.map(interval => ({
            time: interval.time,
            temperature: interval.temperature,
            windSpeed: interval.windSpeed,
            windDirection: interval.windDirection,
            precipitation: {
                intensity: interval.precipitation.intensity,
                probability: interval.precipitation.probability
            },
            condition: interval.description
        }))
    };
};

/**
 * Search for locations by name
 */
export const searchLocations = async (query: string, limit: number = 5): Promise<Location[]> => {
    if (!query || query.trim().length < 2) {
        throw HttpError.badRequest('Search query must be at least 2 characters');
    }

    const searchResponse = await searchLocation(query, limit);

    return searchResponse.features.map(feature => {
        const [lon, lat] = feature.geometry.coordinates;
        const props = feature.properties || {};

        return {
            lat: Number(lat),
            lon: Number(lon),
            name: props.name || props.full_name || query,
            country: props.country
        };
    });
};

/**
 * Transform weather data to essential information only
 */
const transformToEssentialData = (weatherData: WeatherData) => {
    return {
        location: {
            name: weatherData.location.name || `${weatherData.location.lat}, ${weatherData.location.lon}`,
            lat: weatherData.location.lat,
            lon: weatherData.location.lon,
            country: weatherData.location.country
        },
        temperature: weatherData.temperature,
        windSpeed: weatherData.windSpeed,
        windDirection: weatherData.windDirection,
        precipitation: {
            intensity: weatherData.precipitation.intensity,
            probability: weatherData.precipitation.probability
        },
        condition: weatherData.description,
        timestamp: weatherData.timestamp
    };
};

/**
 * Get weather with different response formats
 */
export const getWeatherWithFormat = async (
    locationQuery: LocationQuery,
    format: 'full' | 'compact' = 'full',
    units: 'metric' | 'imperial' = 'metric'
) => {
    const weatherData = await getRealTimeWeatherData(locationQuery, units);

    if (format === 'compact') {
        return {
            location: weatherData.location.name || `${weatherData.location.lat}, ${weatherData.location.lon}`,
            temperature: weatherData.temperature,
            windSpeed: weatherData.windSpeed,
            precipitation: weatherData.precipitation.intensity,
            timestamp: weatherData.timestamp
        };
    }

    // Return only essential data for full format
    return transformToEssentialData(weatherData);
};

/**
 * Get weather for multiple locations (flexible: coordinates, city names, or mixed)
 */
export const getBatchWeather = async (
    locationQueries: LocationQuery[],
    units: 'metric' | 'imperial' = 'metric'
) => {
    if (!locationQueries?.length) {
        throw HttpError.badRequest('Locations array is required');
    }

    if (locationQueries.length > 10) {
        throw HttpError.badRequest('Maximum 10 locations allowed');
    }

    // Fetch weather for all locations in parallel
    const results = await Promise.allSettled(
        locationQueries.map(query => getRealTimeWeatherData(query, units))
    );

    // Return only successful results with essential data only
    return results
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<WeatherData>).value)
        .map(weatherData => transformToEssentialData(weatherData));
};

/**
 * Check service health
 */
export const getServiceHealth = async () => {
    const apiHealth = await checkApiHealth();

    return {
        status: apiHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
        services: {
            tomorrowApi: apiHealth
        },
        timestamp: new Date()
    };
};

// Export all functions as a service object for backward compatibility
export const weatherService = {
    getRealTimeWeather: getRealTimeWeatherData,
    getWeatherForecast: getWeatherForecastData,
    searchLocations,
    getWeatherWithFormat,
    getBatchWeather,
    getServiceHealth
};

// Export alias for backward compatibility
export {
    getRealTimeWeatherData as getCurrentWeather
};

// Re-export the API client functions for direct access
export * from './weatherApiClient'; 