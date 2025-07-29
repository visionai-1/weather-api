// ====================================
// 🌍 ENVIRONMENT CONSTANTS
// ====================================

import dotenv from 'dotenv';

// Load environment variables from .env file first
dotenv.config();

export const ENV = {
    // Server Configuration
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3001', 10),

    // Database Configuration
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/users-management',
    MONGO_DB_USER: process.env.MONGO_DB_USER,
    MONGO_DB_PASSWORD: process.env.MONGO_DB_PASSWORD,
    MONGO_CLUSTER: process.env.MONGO_CLUSTER,
    MONGO_DATABASE: process.env.MONGO_DATABASE,

    // Tomorrow.io API Configuration
    TOMORROW_API_KEY: process.env.TOMORROW_API_KEY,
    TOMORROW_API_BASE_URL: process.env.TOMORROW_API_BASE_URL || 'https://api.tomorrow.io/v4',

    // Keycloak Configuration
    KEYCLOAK: {
        AUTH_SERVER_URL: process.env.KEYCLOAK_AUTH_SERVER_URL,
        CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
        REALM: process.env.KEYCLOAK_REALM || 'master',
        PUBLIC_CLIENT: process.env.KEYCLOAK_PUBLIC_CLIENT === 'true',
        BEARER_ONLY: process.env.KEYCLOAK_BEARER_ONLY === 'true',
        VERIFY_TOKEN_AUDIENCE: process.env.KEYCLOAK_VERIFY_TOKEN_AUDIENCE === 'true',
        USE_RESOURCE_ROLE_MAPPINGS: process.env.KEYCLOAK_USE_RESOURCE_ROLE_MAPPINGS === 'true',
        ENABLE_CORS: process.env.KEYCLOAK_ENABLE_CORS === 'true',
        SSL_REQUIRED: 'external' as const,
        CONFIDENTIAL_PORT: 0,
    },

    // Keycloak Admin Configuration
    KEYCLOAK_ADMIN: {
        USERNAME: process.env.KEYCLOAK_ADMIN_USERNAME || 'admin',
        PASSWORD: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
        ADMIN_CLIENT_SECRET: process.env.KEYCLOAK_ADMIN_CLIENT_SECRET,
    },

    // Email Configuration
    EMAIL: {
        SMTP_HOST: process.env.SMTP_HOST || 'smtp.gmail.com',
        SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
        SMTP_USERNAME: process.env.SMTP_USERNAME,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD,
        SMTP_SENDER: process.env.SMTP_SENDER,
        SMTP_TLS: process.env.SMTP_TLS === 'yes' || process.env.SMTP_TLS === 'true', // Support TLS setting
        VERIFICATION_TEMPLATE: process.env.EMAIL_VERIFICATION_TEMPLATE || 'verify-email',
        PASSWORD_RESET_TEMPLATE: process.env.PASSWORD_RESET_TEMPLATE || 'reset-password',
    },

    // JWT Configuration
    JWT: {
        SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
        EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    },

    // AWS Configuration
    AWS: {
        ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        REGION: process.env.AWS_REGION || 'us-east-1',
        S3_BUCKET: process.env.AWS_S3_BUCKET,
    },

    // RabbitMQ Configuration
    RABBITMQ: {
        URI: process.env.RABBITMQ_URI || 'amqp://localhost:5672',
    },
} as const;

// ====================================
// 🔧 VALIDATION FUNCTIONS
// ====================================

export const validateRequiredEnvVars = (): void => {
    const required = [
        { key: 'MONGODB_URI', value: ENV.MONGODB_URI },
    ];

    const missing = required.filter(({ value }) => !value);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.map(m => m.key).join(', ')}`);
    }
};

export const validateKeycloakConfig = (): boolean => {
    return !!(ENV.KEYCLOAK.AUTH_SERVER_URL && ENV.KEYCLOAK.CLIENT_ID);
};

export const validateKeycloakAdminConfig = (): boolean => {
    return !!(
        ENV.KEYCLOAK_ADMIN.USERNAME &&
        ENV.KEYCLOAK_ADMIN.PASSWORD &&
        ENV.KEYCLOAK_ADMIN.ADMIN_CLIENT_SECRET
    );
};

export const validateEmailConfig = (): boolean => {
    return !!(ENV.EMAIL.SMTP_HOST && ENV.EMAIL.SMTP_USERNAME && ENV.EMAIL.SMTP_PASSWORD);
};

export const validateAWSConfig = (): boolean => {
    return !!(ENV.AWS.ACCESS_KEY_ID && ENV.AWS.SECRET_ACCESS_KEY && ENV.AWS.S3_BUCKET);
};

// ====================================
// 🎯 CONFIGURATION HELPERS
// ====================================

export const getKeycloakConfig = () => ({
    realm: ENV.KEYCLOAK.REALM,
    'auth-server-url': ENV.KEYCLOAK.AUTH_SERVER_URL!,
    'ssl-required': ENV.KEYCLOAK.SSL_REQUIRED,
    resource: ENV.KEYCLOAK.CLIENT_ID!,
    'public-client': ENV.KEYCLOAK.PUBLIC_CLIENT,
    'confidential-port': ENV.KEYCLOAK.CONFIDENTIAL_PORT,
    'bearer-only': ENV.KEYCLOAK.BEARER_ONLY,
    'verify-token-audience': ENV.KEYCLOAK.VERIFY_TOKEN_AUDIENCE,
    'use-resource-role-mappings': ENV.KEYCLOAK.USE_RESOURCE_ROLE_MAPPINGS,
    'enable-cors': ENV.KEYCLOAK.ENABLE_CORS,
});

export const getEmailConfig = () => ({
    host: ENV.EMAIL.SMTP_HOST,
    port: ENV.EMAIL.SMTP_PORT,
    user: ENV.EMAIL.SMTP_USERNAME!,
    pass: ENV.EMAIL.SMTP_PASSWORD!,
    from: ENV.EMAIL.SMTP_SENDER || ENV.EMAIL.SMTP_USERNAME!,
    secure: ENV.EMAIL.SMTP_PORT === 465, // SSL for port 465
    requireTLS: ENV.EMAIL.SMTP_TLS, // STARTTLS for other ports
});

export const getAWSConfig = () => ({
    accessKeyId: ENV.AWS.ACCESS_KEY_ID!,
    secretAccessKey: ENV.AWS.SECRET_ACCESS_KEY!,
    region: ENV.AWS.REGION,
    bucket: ENV.AWS.S3_BUCKET!,
});

// ====================================
// 📊 ENVIRONMENT STATUS
// ====================================

export const getEnvironmentStatus = () => ({
    nodeEnv: ENV.NODE_ENV,
    port: ENV.PORT,
    database: {
        uri: ENV.MONGODB_URI,
        configured: !!ENV.MONGODB_URI,
    },
    keycloak: {
        configured: validateKeycloakConfig(),
        adminConfigured: validateKeycloakAdminConfig(),
        authServerUrl: ENV.KEYCLOAK.AUTH_SERVER_URL,
        clientId: ENV.KEYCLOAK.CLIENT_ID,
        realm: ENV.KEYCLOAK.REALM,
    },
    email: {
        configured: validateEmailConfig(),
        host: ENV.EMAIL.SMTP_HOST,
        port: ENV.EMAIL.SMTP_PORT,
        user: ENV.EMAIL.SMTP_USERNAME,
    },
    jwt: {
        secret: ENV.JWT.SECRET ? 'configured' : 'not configured',
        expiresIn: ENV.JWT.EXPIRES_IN,
    },
    aws: {
        configured: validateAWSConfig(),
        region: ENV.AWS.REGION,
        bucket: ENV.AWS.S3_BUCKET,
    },
    rabbitmq: {
        uri: ENV.RABBITMQ.URI,
        configured: !!ENV.RABBITMQ.URI,
    },
});

// ====================================
// 🔐 AUTHENTICATION CONFIGURATION
// ====================================

/**
 * Authentication configuration for Keycloak-based setup
 * 
 * This microservice uses Keycloak as the central identity provider:
 * - Social auth (Google, Facebook) goes through Keycloak identity brokering
 * - Keycloak handles all token management (access, refresh, rotation)
 * - This service validates Keycloak tokens and syncs user data with MongoDB
 */
export const AUTH_CONFIG = {
    // Keycloak handles all social auth token management (recommended: true)
    USE_KEYCLOAK_FOR_SOCIAL_AUTH: process.env.USE_KEYCLOAK_FOR_SOCIAL_AUTH !== 'false',
} as const;

// ====================================
// 🚀 EXPORTS
// ====================================

export default ENV; 