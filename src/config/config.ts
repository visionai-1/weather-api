import { ENV } from './constants';

// ====================================
// 🔧 APPLICATION CONFIGURATION
// ====================================

const appName = "users-management";

// ====================================
// 📦 CONFIG OBJECT
// ====================================

const config = {
    app: {
        name: appName,
        version: '1.0.0',
    },
    server: { 
        port: ENV.PORT 
    },
    environment: ENV.NODE_ENV,
    database: {
        uri: ENV.MONGODB_URI,
    },
    keycloak: {
        configured: !!ENV.KEYCLOAK.AUTH_SERVER_URL,
        realm: ENV.KEYCLOAK.REALM,
        clientId: ENV.KEYCLOAK.CLIENT_ID,
    },
    email: {
        configured: !!(ENV.EMAIL.SMTP_HOST && ENV.EMAIL.SMTP_USERNAME && ENV.EMAIL.SMTP_PASSWORD),
        host: ENV.EMAIL.SMTP_HOST,
        port: ENV.EMAIL.SMTP_PORT,
    },
    jwt: {
        secret: ENV.JWT.SECRET,
        expiresIn: ENV.JWT.EXPIRES_IN,
    },
};

export default config;
