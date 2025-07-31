import { Router, Request, Response } from 'express';
import { weatherService } from '../../services/weather';
import { WeatherRequest, WeatherResponse } from '../../interfaces/weather';
import { validateJoi } from '../../middlewares/validations';
import {
    getRealtimeWeatherQuerySchema,
    getRealtimeWeatherBodySchema,
    getWeatherForecastQuerySchema,
    getBatchWeatherBodySchema,
    searchLocationsParamsSchema,
    searchLocationsQuerySchema,
    cityParamsSchema,
    coordinatesParamsSchema,
    locationEndpointQuerySchema
} from '../../schemas';
import HttpError from '../../utils/httpError';

/**
 * 🌤️ Weather Routes
 * Enhanced CRUD operations using distributed weather services
 */

const router = Router();

/**
 * @route GET /api/v1/weather/realtime
 * @desc Get real-time weather data for a location
 * @access Public
 */
router.get('/realtime', 
    validateJoi({ query: getRealtimeWeatherQuerySchema }),
    async (req: Request, res: Response) => {
    try {
        const { lat, lon, city, format = 'full', units = 'metric' } = req.query;

        const locationQuery = {
            lat: lat as unknown as number | undefined,
            lon: lon as unknown as number | undefined,
            city: city as unknown as string | undefined
        };

        const weatherData = await weatherService.getWeatherWithFormat(
            locationQuery, 
            format as 'full' | 'compact',
            units as 'metric' | 'imperial'
        );

        const response: WeatherResponse = {
            success: true,
            data: weatherData as any,
            message: 'Real-time weather data retrieved successfully'
        };

        res.json(response);
    } catch (error) {
        if (error instanceof HttpError) {
            error.sendError(res);
        } else {
            HttpError.internalServerError('Failed to fetch weather data').sendError(res);
        }
    }
});

/**
 * @route POST /api/v1/weather/realtime
 * @desc Get real-time weather data using POST (for complex requests)
 * @access Public
 */
router.post('/realtime',
    validateJoi({ body: getRealtimeWeatherBodySchema }),
    async (req: Request, res: Response) => {
    try {
        const { location, format = 'full', units = 'metric' }: WeatherRequest = req.body;

        const weatherData = await weatherService.getWeatherWithFormat(
            location, 
            format as 'full' | 'compact',
            units as 'metric' | 'imperial'
        );

        const response: WeatherResponse = {
            success: true,
            data: weatherData as any,
            message: 'Real-time weather data retrieved successfully'
        };

        res.json(response);
    } catch (error) {
        if (error instanceof HttpError) {
            error.sendError(res);
        } else {
            HttpError.internalServerError('Failed to fetch weather data').sendError(res);
        }
    }
});

/**
 * @route GET /api/v1/weather/locations/:city
 * @desc Get current weather for a specific city
 * @access Public
 */
router.get('/locations/:city',
    validateJoi({ 
        params: cityParamsSchema,
        query: locationEndpointQuerySchema 
    }),
    async (req: Request, res: Response) => {
    try {
        const { city } = req.params;
        const { format = 'full', units = 'metric' } = req.query;

        const weatherData = await weatherService.getWeatherWithFormat(
            { city },
            format as 'full' | 'compact',
            units as 'metric' | 'imperial'
        );

        const response: WeatherResponse = {
            success: true,
            data: weatherData as any,
            message: `Weather data for ${city} retrieved successfully`
        };

        res.json(response);
    } catch (error) {
        if (error instanceof HttpError) {
            error.sendError(res);
        } else {
            HttpError.internalServerError('Failed to fetch weather data').sendError(res);
        }
    }
});

/**
 * @route GET /api/v1/weather/coordinates/:lat/:lon
 * @desc Get current weather for specific coordinates
 * @access Public
 */
router.get('/coordinates/:lat/:lon',
    validateJoi({ 
        params: coordinatesParamsSchema,
        query: locationEndpointQuerySchema 
    }),
    async (req: Request, res: Response) => {
    try {
        const { lat, lon } = req.params;
        const { format = 'full', units = 'metric' } = req.query;

        const weatherData = await weatherService.getWeatherWithFormat(
            { lat: lat as unknown as number, lon: lon as unknown as number },
            format as 'full' | 'compact',
            units as 'metric' | 'imperial'
        );

        const response: WeatherResponse = {
            success: true,
            data: weatherData as any,
            message: `Weather data for coordinates ${lat},${lon} retrieved successfully`
        };

        res.json(response);
    } catch (error) {
        if (error instanceof HttpError) {
            error.sendError(res);
        } else {
            HttpError.internalServerError('Failed to fetch weather data').sendError(res);
        }
    }
});

/**
 * @route POST /api/v1/weather/batch
 * @desc Get weather data for multiple locations
 * @access Public
 */
router.post('/batch',
    validateJoi({ body: getBatchWeatherBodySchema }),
    async (req: Request, res: Response) => {
    try {
        const { locations, units = 'metric' } = req.body;

        const weatherDataList = await weatherService.getBatchWeather(locations, units);

        res.json({
            success: true,
            data: weatherDataList as any,
            total: weatherDataList.length,
            message: 'Batch weather data retrieved successfully'
        });
    } catch (error) {
        if (error instanceof HttpError) {
            error.sendError(res);
        } else {
            HttpError.internalServerError('Failed to fetch batch weather data').sendError(res);
        }
    }
});

/**
 * @route GET /api/v1/weather/search/:query
 * @desc Search for locations by name
 * @access Public
 */
router.get('/search/:query',
    validateJoi({ 
        params: searchLocationsParamsSchema,
        query: searchLocationsQuerySchema 
    }),
    async (req: Request, res: Response) => {
    try {
        const { query } = req.params;
        const { limit = 5 } = req.query;

        const locations = await weatherService.searchLocations(query, limit as number);

        res.json({
            success: true,
            data: locations,
            total: locations.length,
            message: `Found ${locations.length} locations for "${query}"`
        });
    } catch (error) {
        if (error instanceof HttpError) {
            error.sendError(res);
        } else {
            HttpError.internalServerError('Failed to search locations').sendError(res);
        }
    }
});

/**
 * @route GET /api/v1/weather/forecast
 * @desc Get weather forecast for a location
 * @access Public
 */
router.get('/forecast',
    validateJoi({ query: getWeatherForecastQuerySchema }),
    async (req: Request, res: Response) => {
    try {
        const { lat, lon, city, timesteps = '1h', units = 'metric' } = req.query;

        const locationQuery = {
            lat: lat as unknown as number | undefined,
            lon: lon as unknown as number | undefined,
            city: city as unknown as string | undefined
        };

        const forecastData = await weatherService.getWeatherForecast(
            locationQuery,
            timesteps as '1h' | '1d',
            units as 'metric' | 'imperial'
        );

        res.json({
            success: true,
            data: forecastData as any,
            message: 'Weather forecast retrieved successfully'
        });
    } catch (error) {
        if (error instanceof HttpError) {
            error.sendError(res);
        } else {
            HttpError.internalServerError('Failed to fetch weather forecast').sendError(res);
        }
    }
});

/**
 * @route GET /api/v1/weather/health
 * @desc Get weather service health status
 * @access Public
 */
router.get('/health', async (req: Request, res: Response) => {
    try {
        const health = await weatherService.getServiceHealth();
        
        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: 'Failed to check service health',
            timestamp: new Date()
        });
    }
});

export default router; 