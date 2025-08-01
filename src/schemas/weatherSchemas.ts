import Joi from 'joi';

/**
 * 🔍 Weather API Validation Schemas (DRY version)
 * Joi-based validation schemas for weather routes
 */

// === Base field schemas ===
export const latSchema = Joi.number().min(-90).max(90).messages({
    'number.min': 'Latitude must be between -90 and 90',
    'number.max': 'Latitude must be between -90 and 90'
});

export const lonSchema = Joi.number().min(-180).max(180).messages({
    'number.min': 'Longitude must be between -180 and 180',
    'number.max': 'Longitude must be between -180 and 180'
});

export const citySchema = Joi.string().trim().min(1).messages({
    'string.min': 'City name cannot be empty'
});

// === Reusable field groups ===
export const unitsSchema = Joi.string().valid('metric', 'imperial').default('metric');
export const formatSchema = Joi.string().valid('full', 'compact').default('full');
export const timestepsSchema = Joi.string().valid('1h', '1d').default('1h');

// === Location schema (city or lat/lon pair) ===
export const locationSchema = Joi.object({
    lat: latSchema.optional(),
    lon: lonSchema.optional(),
    city: citySchema.optional()
})
.or('city', 'lat')
.and('lat', 'lon')
.messages({
    'object.missing': 'Location must include either coordinates (lat/lon) or city name',
    'object.and': 'When providing coordinates, both lat and lon are required'
});

// === Realtime weather via query string ===
export const getRealtimeWeatherQuerySchema = Joi.object({
    lat: latSchema.optional(),
    lon: lonSchema.optional(),
    city: citySchema.optional(),
    format: formatSchema,
    units: unitsSchema
})
.or('city', 'lat')
.and('lat', 'lon')
.messages({
    'object.missing': 'Location must include either coordinates (lat/lon) or city name',
    'object.and': 'When providing coordinates, both lat and lon are required'
});

// === Realtime weather via POST body ===
export const getRealtimeWeatherBodySchema = Joi.object({
    location: locationSchema.required().messages({
        'any.required': 'Location is required'
    }),
    format: formatSchema,
    units: unitsSchema
});

// === Forecast schema via query string ===
export const getWeatherForecastQuerySchema = Joi.object({
    lat: latSchema.optional(),
    lon: lonSchema.optional(),
    city: citySchema.optional(),
    timesteps: timestepsSchema,
    units: unitsSchema
})
.or('city', 'lat')
.and('lat', 'lon')
.messages({
    'object.missing': 'Location must include either coordinates (lat/lon) or city name',
    'object.and': 'When providing coordinates, both lat and lon are required'
});

// === Batch weather schema ===
export const getBatchWeatherBodySchema = Joi.object({
    locations: Joi.array()
        .items(locationSchema)
        .min(1)
        .max(10)
        .required()
        .messages({
            'array.min': 'At least one location is required',
            'array.max': 'Maximum 10 locations allowed per batch request',
            'any.required': 'Locations array is required'
        }),
    units: unitsSchema
});
