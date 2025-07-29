import jwt from 'jsonwebtoken';
import { JWTPayload, JWTOptions, DecodedToken } from '../interfaces';
import { ENV } from '../config/constants';
import HttpError from './httpError';

/**
 * 🔐 Token Utilities
 * Simple and focused JWT token management with access/refresh token support
 */

/**
 * Generate JWT token
 * @param payload - Data to encode in the JWT
 * @param options - JWT options (expiry, issuer, etc.)
 * @returns Signed JWT token string
 */
export const generateJWT = (
    payload: JWTPayload = {},
    options: JWTOptions = {}
): string => {
    if (!ENV.JWT.SECRET) {
        throw HttpError.internalServerError('JWT secret not configured');
    }

    const finalOptions: JWTOptions = {
        expiresIn: ENV.JWT.EXPIRES_IN,
        algorithm: 'HS256',
        ...options,
    };

    try {
        return jwt.sign(payload, ENV.JWT.SECRET, finalOptions);
    } catch (error) {
        throw HttpError.internalServerError('Failed to generate JWT token');
    }
};

/**
 * 🎯 Generate Access Token (short-lived for API access)
 * @param payload - User data to encode
 * @returns Access token string
 */
export const generateAccessToken = (payload: Omit<JWTPayload, 'tokenType'>): string => {
    const accessPayload: JWTPayload = {
        ...payload,
        tokenType: 'access',
    };

    return generateJWT(accessPayload, {
        expiresIn: ENV.JWT.EXPIRES_IN || '15m', // Short-lived
    });
};

/**
 * 🔄 Generate Refresh Token (long-lived for token renewal)
 * @param payload - User data to encode (minimal data)
 * @returns Refresh token string
 */
export const generateRefreshToken = (payload: Pick<JWTPayload, 'id' | 'email'>): string => {
    const refreshPayload: JWTPayload = {
        id: payload.id,
        email: payload.email,
        tokenType: 'refresh',
    };

    return generateJWT(refreshPayload, {
        expiresIn: '7d', // Long-lived
    });
};

/**
 * 🎫 Generate Token Pair (access + refresh tokens)
 * @param payload - User data for tokens
 * @returns Object with both tokens and expiry info
 */
export const generateTokenPair = (payload: Omit<JWTPayload, 'tokenType'>) => {
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken({
        id: payload.id,
        email: payload.email,
    });

    return {
        accessToken,
        refreshToken,
        tokenType: 'Bearer' as const,
        expiresIn: ENV.JWT.EXPIRES_IN || '15m',
        scope: 'api_access',
    };
};

/**
 * Validate and decode JWT token
 * @param token - JWT token to validate
 * @returns Decoded token payload
 */
export const validateToken = (token: string): DecodedToken => {
    if (!ENV.JWT.SECRET) {
        throw HttpError.internalServerError('JWT secret not configured');
    }

    if (!token?.trim()) {
        throw HttpError.unauthorized('Token is required');
    }

    try {
        return jwt.verify(token, ENV.JWT.SECRET) as DecodedToken;
    } catch (error) {
        const jwtError = error as jwt.JsonWebTokenError;

        if (jwtError.name === 'TokenExpiredError') {
            throw HttpError.unauthorized('Token has expired');
        } else if (jwtError.name === 'JsonWebTokenError') {
            throw HttpError.unauthorized('Malformed token');
        } else if (jwtError.name === 'NotBeforeError') {
            throw HttpError.unauthorized('Token not active yet');
        }

        throw HttpError.unauthorized('Invalid token');
    }
};

/**
 * ✅ Validate Access Token specifically
 * @param token - Access token to validate
 * @returns Decoded access token payload
 */
export const validateAccessToken = (token: string): DecodedToken => {
    const decoded = validateToken(token);
    
    if (decoded.tokenType !== 'access') {
        throw HttpError.unauthorized('Invalid token type - access token required');
    }
    
    return decoded;
};

/**
 * 🔄 Validate Refresh Token specifically
 * @param token - Refresh token to validate
 * @returns Decoded refresh token payload
 */
export const validateRefreshToken = (token: string): DecodedToken => {
    const decoded = validateToken(token);
    
    if (decoded.tokenType !== 'refresh') {
        throw HttpError.unauthorized('Invalid token type - refresh token required');
    }
    
    return decoded;
};

/**
 * Extract Bearer token from Authorization header
 * @param authHeader - Authorization header value
 * @returns Extracted token or null
 */
export const extractToken = (authHeader: string): string | null => {
    if (!authHeader?.startsWith('Bearer ')) {
        return null;
    }
    
    const token = authHeader.slice(7).trim();
    return token || null;
};

/**
 * Check if token is expired
 * @param token - JWT token to check
 * @returns True if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
    try {
        const decoded = jwt.decode(token) as DecodedToken;
        if (!decoded?.exp) return true;
        
        return decoded.exp < Math.floor(Date.now() / 1000);
    } catch {
        return true;
    }
};

/**
 * Decode JWT token without verification
 * @param token - JWT token to decode
 * @returns Decoded token payload or null
 */
export const decodeJWT = (token: string): DecodedToken | null => {
    try {
        return jwt.decode(token) as DecodedToken;
    } catch {
        return null;
    }
};