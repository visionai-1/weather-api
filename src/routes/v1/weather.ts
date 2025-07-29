import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { fetchWeatherData } from '../../services/weatherService';
import { WeatherRequest, WeatherResponse } from '../../interfaces/weather';
import HttpError from '../../utils/httpError';

/**
 * 🌤️ Weather Routes
 * CRUD operations for weather data with Tomorrow.io API integration
 */

const router = Router();

/**
 * @route GET /api/v1/weather/current
 * @desc Get current weather data for a location
 * @access Public
 */
router.get('/current', [
    query('lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    query('lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    query('city').optional().isString().trim().isLength({ min: 1 }).withMessage('City name cannot be empty'),
], async (req: Request, res: Response) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw HttpError.badRequest('Validation failed', 'validation_error');
        }

        const { lat, lng, city } = req.query;

        // Ensure location is provided
        if ((!lat || !lng) && !city) {
            throw HttpError.badRequest('Location required: provide lat/lng or city name');
        }

        const locationQuery = {
            lat: lat ? parseFloat(lat as string) : undefined,
            lng: lng ? parseFloat(lng as string) : undefined,
            city: city as string
        };

        const weatherData = await fetchWeatherData(locationQuery);

        const response: WeatherResponse = {
            success: true,
            data: weatherData,
            message: 'Weather data retrieved successfully'
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
 * @route POST /api/v1/weather/current
 * @desc Get current weather data using POST (for complex requests)
 * @access Public
 */
router.post('/current', [
    body('location').exists().withMessage('Location is required'),
    body('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
    body('location.city').optional().isString().trim().isLength({ min: 1 }).withMessage('City name cannot be empty'),
], async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw HttpError.badRequest('Validation failed', 'validation_error');
        }

        const { location }: WeatherRequest = req.body;

        if ((!location.lat || !location.lng) && !location.city) {
            throw HttpError.badRequest('Location required: provide lat/lng or city name');
        }

        const weatherData = await fetchWeatherData(location);

        const response: WeatherResponse = {
            success: true,
            data: weatherData,
            message: 'Weather data retrieved successfully'
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
router.get('/locations/:city', async (req: Request, res: Response) => {
    try {
        const { city } = req.params;

        if (!city || city.trim().length === 0) {
            throw HttpError.badRequest('City name is required');
        }

        const weatherData = await fetchWeatherData({ city: city.trim() });

        const response: WeatherResponse = {
            success: true,
            data: weatherData,
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
 * @route GET /api/v1/weather/coordinates/:lat/:lng
 * @desc Get current weather for specific coordinates
 * @access Public
 */
router.get('/coordinates/:lat/:lng', async (req: Request, res: Response) => {
    try {
        const lat = parseFloat(req.params.lat);
        const lng = parseFloat(req.params.lng);

        if (isNaN(lat) || isNaN(lng)) {
            throw HttpError.badRequest('Invalid coordinates provided');
        }

        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw HttpError.badRequest('Coordinates out of valid range');
        }

        const weatherData = await fetchWeatherData({ lat, lng });

        const response: WeatherResponse = {
            success: true,
            data: weatherData,
            message: `Weather data for coordinates ${lat},${lng} retrieved successfully`
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

export default router; 