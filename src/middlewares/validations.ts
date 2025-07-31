import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import HttpError from '../utils/httpError';

/**
 * 🔍 Joi Validation Middleware
 * Handles Joi schema validation for request data
 */

interface ValidationSchemas {
    query?: Joi.ObjectSchema;
    body?: Joi.ObjectSchema;
    params?: Joi.ObjectSchema;
}

/**
 * Create Joi validation middleware for request validation
 */
export const validateJoi = (schemas: ValidationSchemas) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const errors: string[] = [];

        // Validate query parameters
        if (schemas.query) {
            const { error, value } = schemas.query.validate(req.query, { 
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true
            });
            
            if (error) {
                const queryErrors = error.details.map(detail => `Query ${detail.path.join('.')}: ${detail.message}`);
                errors.push(...queryErrors);
            } else {
                req.query = value;
            }
        }

        // Validate request body
        if (schemas.body) {
            const { error, value } = schemas.body.validate(req.body, { 
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true
            });
            
            if (error) {
                const bodyErrors = error.details.map(detail => `Body ${detail.path.join('.')}: ${detail.message}`);
                errors.push(...bodyErrors);
            } else {
                req.body = value;
            }
        }

        // Validate route parameters
        if (schemas.params) {
            const { error, value } = schemas.params.validate(req.params, { 
                abortEarly: false,
                allowUnknown: false,
                stripUnknown: true
            });
            
            if (error) {
                const paramErrors = error.details.map(detail => `Param ${detail.path.join('.')}: ${detail.message}`);
                errors.push(...paramErrors);
            } else {
                req.params = value;
            }
        }

        // If there are validation errors, throw HttpError
        if (errors.length > 0) {
            throw HttpError.badRequest(`Validation failed: ${errors.join('; ')}`);
        }

        next();
    };
};

/**
 * Alternative Joi validation middleware that returns detailed errors
 */
export const validateJoiDetailed = (schemas: ValidationSchemas) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const allErrors: any[] = [];

        // Validate and collect all errors
        ['query', 'body', 'params'].forEach(source => {
            const schema = schemas[source as keyof ValidationSchemas];
            const data = req[source as keyof Request];
            
            if (schema) {
                const { error } = schema.validate(data, { 
                    abortEarly: false,
                    allowUnknown: false
                });
                
                if (error) {
                    const sourceErrors = error.details.map(detail => ({
                        source,
                        field: detail.path.join('.'),
                        message: detail.message,
                        value: detail.context?.value
                    }));
                    allErrors.push(...sourceErrors);
                }
            }
        });

        if (allErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: allErrors
            });
        }

        next();
    };
};

/**
 * Simple query validation helper
 */
export const validateQuery = (schema: Joi.ObjectSchema) => 
    validateJoi({ query: schema });

/**
 * Simple body validation helper
 */
export const validateBody = (schema: Joi.ObjectSchema) => 
    validateJoi({ body: schema });

/**
 * Simple params validation helper
 */
export const validateParams = (schema: Joi.ObjectSchema) => 
    validateJoi({ params: schema });

/**
 * Backward compatibility - basic validation middleware
 */
export const validateRequest = validateJoi;

// Legacy exports for compatibility
export const handleValidationErrors = validateJoi;
export const handleDetailedValidationErrors = validateJoiDetailed;