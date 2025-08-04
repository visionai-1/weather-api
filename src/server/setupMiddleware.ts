// ====================================
// 🔧 EXPRESS MIDDLEWARE SETUP
// ====================================

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { Logging } from '../utils/logging';
import { ENV } from '../config/constants';

// ====================================
// 🛡️ SECURITY MIDDLEWARE
// ====================================

const setupSecurityMiddleware = (app: Application): void => {
    // Essential security headers with Helmet
    app.use(helmet({
        contentSecurityPolicy: false, // Disable for API - can be enabled later if needed
        crossOriginEmbedderPolicy: false, // Disable for API compatibility
    }));

    // Allow all CORS requests - completely permissive
    const corsOptions = {
        origin: true, // Allow all origins
        credentials: true, // Allow credentials
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
        allowedHeaders: [
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
        optionsSuccessStatus: 200,
        preflightContinue: false,
        maxAge: 86400, // Cache preflight for 24 hours
    };

    app.use(cors(corsOptions));

    // Additional CORS headers for maximum compatibility
    app.use((req, res, next) => {
        // Remove server information disclosure
        res.removeHeader('X-Powered-By');
        res.setHeader('X-API-Version', '1.0.0');
        
        // Set permissive CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Request-Id, X-API-Key, X-Client-Version, Cache-Control, Pragma');
        res.header('Access-Control-Max-Age', '86400');
        
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            res.status(200).end();
            return;
        }
        
        next();
    });

    Logging.startup('🛡️ Security middleware configured');
};

// ====================================
// 📝 REQUEST LOGGING MIDDLEWARE
// ====================================

const setupRequestLogging = (app: Application): void => {
    app.use((req, res, next) => {
        const startTime = Date.now();

        Logging.http(`📥 ${req.method} ${req.url}`, {
            method: req.method,
            url: req.url,
            ip: req.socket.remoteAddress,
            userAgent: req.get('User-Agent'),
            contentType: req.get('Content-Type')
        });

        res.on('finish', () => {
            const responseTime = Date.now() - startTime;
            Logging.request(req.method, req.url, res.statusCode, responseTime, req.socket.remoteAddress);
        });

        next();
    });

    Logging.startup('📝 Request logging middleware configured');
};

// ====================================
// 📦 BODY PARSING MIDDLEWARE
// ====================================

const setupBodyParsing = (app: Application): void => {
    // Apply body parsing middleware
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    // Removed detailed startup log
};

// ====================================
// 🚀 MAIN MIDDLEWARE SETUP FUNCTION
// ====================================

/**
 * Configure all Express middleware in the correct order
 * @param app - Express application instance
 */
export const setupMiddleware = (app: Application): void => {
    Logging.info('🔧 Setting up Express middleware...');

    // Order matters! Security first, then logging, then body parsing
    setupSecurityMiddleware(app);
    setupRequestLogging(app);
    setupBodyParsing(app);

    Logging.info('✅ All middleware configured successfully');
};