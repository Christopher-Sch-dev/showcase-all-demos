// Servicio API para comunicarse con el backend Spring Boot
import axios from 'axios';
import { logger } from '../utils/logger';
import { refreshToken } from './apiAuth';

// URL base del backend (configurable por variables de entorno)
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Asegurar que la URL termine en /api/v1 para evitar errores de configuración (403/404)
// Muchos usuarios configuran solo el dominio raíz en Vercel
if (API_BASE_URL && !API_BASE_URL.includes('/api/v1')) {
    // Eliminar slash final si existe antes de agregar el path
    API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api/v1';
}

console.log('API Base URL configurada:', API_BASE_URL); // Log para debugging en producción

// Crear instancia de Axios
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token JWT a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Log detallado para debugging (siempre loggear errores)
        logger.error('Error en petición API:', {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.message,
            responseData: error.response?.data
        });

        if (error.response?.status === 401) {
            // Token expirado o inválido
            const currentPath = window.location.pathname;

            // No intentar refrescar si estamos en endpoints de autenticación
            if (error.config?.url?.includes('/auth/login') ||
                error.config?.url?.includes('/auth/register') ||
                error.config?.url?.includes('/auth/refresh')) {
                // Si falla el refresh o login, limpiar sesión
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user-data');
                if (currentPath !== '/auth' && !currentPath.startsWith('/auth')) {
                    if (window.history && window.history.pushState) {
                        window.history.pushState(null, '', '/auth');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    } else {
                        window.location.href = '/auth';
                    }
                }
                return Promise.reject(error);
            }

            // Intentar refrescar el token antes de limpiar la sesión
            const currentToken = localStorage.getItem('jwt_token');
            if (currentToken) {
                logger.info('Token expirado, intentando refrescar...');
                return refreshToken().then((result) => {
                    if (result.success && result.token) {
                        // Reintentar la petición original con el nuevo token
                        error.config.headers.Authorization = `Bearer ${result.token}`;
                        return api.request(error.config);
                    } else {
                        // No se pudo refrescar, limpiar sesión
                        localStorage.removeItem('jwt_token');
                        localStorage.removeItem('user-data');
                        if (currentPath !== '/auth' && !currentPath.startsWith('/auth')) {
                            if (window.history && window.history.pushState) {
                                window.history.pushState(null, '', '/auth');
                                window.dispatchEvent(new PopStateEvent('popstate'));
                            } else {
                                window.location.href = '/auth';
                            }
                        }
                        return Promise.reject(error);
                    }
                }).catch((refreshError) => {
                    logger.error('Error al refrescar token:', refreshError);
                    localStorage.removeItem('jwt_token');
                    localStorage.removeItem('user-data');
                    if (currentPath !== '/auth' && !currentPath.startsWith('/auth')) {
                        if (window.history && window.history.pushState) {
                            window.history.pushState(null, '', '/auth');
                            window.dispatchEvent(new PopStateEvent('popstate'));
                        } else {
                            window.location.href = '/auth';
                        }
                    }
                    return Promise.reject(error);
                });
            } else {
                // No hay token, limpiar sesión
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user-data');
                if (currentPath !== '/auth' && !currentPath.startsWith('/auth')) {
                    if (window.history && window.history.pushState) {
                        window.history.pushState(null, '', '/auth');
                        window.dispatchEvent(new PopStateEvent('popstate'));
                    } else {
                        window.location.href = '/auth';
                    }
                }
            }
        }

        // Si no hay respuesta del servidor (error de red, CORS, 502, etc.)
        if (!error.response) {
            // Detectar tipo específico de error
            let errorType = 'Error de conexión';
            if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
                errorType = 'Error de red: El servidor no está disponible (502 Bad Gateway)';
            } else if (error.message?.includes('CORS')) {
                errorType = 'Error CORS: El servidor no permite esta solicitud';
            }

            logger.error('Error de conexión: No se pudo conectar con el servidor', {
                baseURL: API_BASE_URL,
                message: error.message,
                code: error.code,
                errorType,
                // Información adicional para debugging
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers
                }
            });
        }

        return Promise.reject(error);
    }
);

export default api;

