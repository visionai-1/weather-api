// ====================================
// 🌍 ENVIRONMENT CONSTANTS
// ====================================

import dotenv from 'dotenv';

// Load environment variables from .env file first
dotenv.config();

export const ENV = {
    // Server Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
    MONGO_DB_USER: process.env.MONGO_DB_USER,
    MONGO_DB_PASSWORD: process.env.MONGO_DB_PASSWORD,
    MONGO_CLUSTER: process.env.MONGO_CLUSTER,
    MONGO_DATABASE: process.env.MONGO_DATABASE,

    // Tomorrow.io API Configuration
    TOMORROW_API_KEY: process.env.TOMORROW_API_KEY,
    TOMORROW_API_BASE_URL: process.env.TOMORROW_API_BASE_URL || 'https://api.tomorrow.io/v4',
    
    // Mock Configuration
    USE_MOCK_WEATHER: process.env.USE_MOCK_WEATHER === 'true' || process.env.NODE_ENV === 'test',

    // CORS Configuration - Completely Permissive
    CORS: {
        ALLOWED_ORIGINS: ['*'], // Allow all origins
        ALLOW_CREDENTIALS: true, // Allow credentials
        ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        ALLOWED_HEADERS: [
            'Origin',
            'X-Requested-With', 
            'Content-Type',
            'Accept',
            'Authorization',
            'X-Request-Id',
            'X-API-Key',
            'X-Client-Version',
            'Cache-Control',
            'Pragma'
        ],
    },

    // JWT Configuration
    JWT: {
        SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    },
} as const;