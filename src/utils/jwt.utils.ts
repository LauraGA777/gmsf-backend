import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

interface JwtPayload {
    userId: number;
}

/**
 * Genera un token de acceso JWT
 * @param userId - ID del usuario
 * @param expiresIn - Duración de la expiración del token
 * @returns Token de acceso
 */
export const generateAccessToken = (userId: number, expiresIn: SignOptions['expiresIn'] = '1h'): string => {
    const payload: JwtPayload = { userId };
    const secret: Secret = env.JWT_SECRET;
    const options: SignOptions = { expiresIn };
    return jwt.sign(payload, secret, options);
};

/**
 * Genera un token de refresco JWT
 * @param userId - ID del usuario
 * @returns Token de refresco
 */
export const generateRefreshToken = (userId: number): string => {
    const payload: JwtPayload = { userId };
    const secret: Secret = env.JWT_REFRESH_SECRET;
    const options: SignOptions = { expiresIn: '7d' };
    return jwt.sign(payload, secret, options);
}; 