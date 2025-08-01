import { Router, Request, Response } from 'express';
import {
    getWeatherWithFormat,
    getBatchWeather,
    getWeatherForecastData,
    getServiceHealth,
} from '../../services/weather';
import { LocationQuery, WeatherRequest, WeatherResponse } from '../../interfaces/weather';
import { validateJoi } from '../../middlewares/validations';
import {
    getRealtimeWeatherQuerySchema,
    getRealtimeWeatherBodySchema,
    getWeatherForecastQuerySchema,
    getBatchWeatherBodySchema,
} from '../../schemas';
import HttpError from '../../utils/httpError';
import { requireAuth } from '../../middlewares/auth';

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
    [validateJoi({ query: getRealtimeWeatherQuerySchema }), requireAuth],
    async (req: Request, res: Response) => {
        try {
            const { lat, lon, city, format = 'full', units = 'metric' } = req.query;

            const locationQuery: LocationQuery = {
                lat: lat as unknown as number | undefined,
                lon: lon as unknown as number | undefined,
                city: city as unknown as string | undefined
            };

            const weatherData = await getWeatherWithFormat(
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

            const weatherData = await getWeatherWithFormat(
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

            const forecastData = await getWeatherForecastData(
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
 * @route POST /api/v1/weather/batch
 * @desc Get weather data for multiple locations
 * @access Public
 */
router.post('/batch',
    validateJoi({ body: getBatchWeatherBodySchema }),
    async (req: Request, res: Response) => {
        try {
            const { locations, units = 'metric' } = req.body;

            const weatherDataList = await getBatchWeather(locations, units);

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
 * @route GET /api/v1/weather/health
 * @desc Get weather service health status
 * @access Public
 */
router.get('/health', async (req: Request, res: Response) => {
    try {
        const health = await getServiceHealth();

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