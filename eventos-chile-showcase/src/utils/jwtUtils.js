// Utilidades para manejar tokens JWT
import { logger } from './logger';

/**
 * Decodifica un token JWT sin verificar la firma
 * @param {string} token - Token JWT
 * @returns {Object|null} - Payload del token o null si es inválido
 */
export const decodeToken = (token) => {
    if (!token || typeof token !== 'string') {
        return null;
    }

    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) {
            return null;
        }

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        logger.error('Error al decodificar token JWT:', error);
        return null;
    }
};

/**
 * Verifica si un token JWT está expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - true si está expirado o inválido, false si es válido
 */
export const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return true;
    }

    // exp está en segundos, Date.now() está en milisegundos
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    // Considerar expirado si falta menos de 5 minutos (300000 ms)
    // Esto permite refrescar antes de que expire completamente
    const bufferTime = 5 * 60 * 1000; // 5 minutos

    return currentTime >= (expirationTime - bufferTime);
};

/**
 * Verifica si un token JWT es completamente inválido (no solo expirado)
 * @param {string} token - Token JWT
 * @returns {boolean} - true si es inválido, false si es válido
 */
export const isTokenInvalid = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
        return true;
    }

    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();

    // Completamente expirado (sin buffer)
    return currentTime >= expirationTime;
};

