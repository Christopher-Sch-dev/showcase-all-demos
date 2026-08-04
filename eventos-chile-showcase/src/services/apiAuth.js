/**
 * Servicio de autenticación usando localStorage (Modo Demo)
 * Reemplaza las llamadas al backend Spring Boot
 * Autor: Christopher Schiefelbein
 */

import { logger } from '../utils/logger';
import {
    validateCredentials,
    generateFakeToken,
    createUsuario,
    getUsuarioByEmail,
    deleteUsuario
} from './localStorageService';

/**
 * Inicia sesión con email y contraseña
 * Valida contra localStorage y genera token fake
 */
export const login = async (email, password) => {
    try {
        logger.info('[DEMO] Intentando login para:', email);

        const usuario = await validateCredentials(email, password);

        if (!usuario) {
            logger.warn('[DEMO] Credenciales inválidas para:', email);
            return {
                success: false,
                error: 'Email o contraseña incorrectos'
            };
        }

        // Generar token fake y guardar en localStorage
        const token = generateFakeToken(usuario);

        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user-data', JSON.stringify({
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombre,
            rol: usuario.rol
        }));

        logger.info('[DEMO] Login exitoso para:', usuario.email);

        return {
            success: true,
            data: {
                token,
                usuarioId: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        };
    } catch (error) {
        logger.error('[DEMO] Error en login:', error);
        return {
            success: false,
            error: error.message || 'Error al iniciar sesión'
        };
    }
};

/**
 * Registra un nuevo usuario
 * Guarda en localStorage y genera token fake
 */
export const register = async (userData) => {
    try {
        logger.info('[DEMO] Intentando registro para:', userData.email);

        // Verificar si el email ya existe
        const existente = await getUsuarioByEmail(userData.email);
        if (existente) {
            return {
                success: false,
                error: 'El email ya está registrado'
            };
        }

        // Crear usuario en localStorage
        const nuevoUsuario = await createUsuario({
            email: userData.email,
            password: userData.password,
            nombre: userData.nombre,
            telefono: userData.telefono || '',
            direccion: userData.direccion || '',
            rol: 'USUARIO' // Por defecto, todos son usuarios normales
        });

        // Generar token fake y guardar en localStorage
        const token = generateFakeToken(nuevoUsuario);

        localStorage.setItem('jwt_token', token);
        localStorage.setItem('user-data', JSON.stringify({
            id: nuevoUsuario.id,
            email: nuevoUsuario.email,
            nombre: nuevoUsuario.nombre,
            rol: nuevoUsuario.rol
        }));

        logger.info('[DEMO] Registro exitoso para:', nuevoUsuario.email);

        return {
            success: true,
            data: {
                token,
                usuarioId: nuevoUsuario.id,
                email: nuevoUsuario.email,
                nombre: nuevoUsuario.nombre,
                rol: nuevoUsuario.rol
            }
        };
    } catch (error) {
        logger.error('[DEMO] Error en registro:', error);
        return {
            success: false,
            error: error.message || 'Error al registrar usuario'
        };
    }
};

/**
 * Cierra sesión limpiando localStorage
 */
export const logout = () => {
    logger.info('[DEMO] Cerrando sesión');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user-data');
};

/**
 * Simula refresh de token (en demo siempre es exitoso si hay usuario)
 */
export const refreshToken = async () => {
    try {
        const userData = localStorage.getItem('user-data');

        if (!userData) {
            return { success: false };
        }

        const usuario = JSON.parse(userData);
        const newToken = generateFakeToken(usuario);

        localStorage.setItem('jwt_token', newToken);

        logger.info('[DEMO] Token refrescado para:', usuario.email);

        return {
            success: true,
            token: newToken,
            data: {
                token: newToken,
                usuarioId: usuario.id,
                email: usuario.email,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        };
    } catch (error) {
        logger.error('[DEMO] Error al refrescar token:', error);
        logout();
        return { success: false };
    }
};

/**
 * Elimina la cuenta del usuario actual
 */
export const eliminarCuenta = async () => {
    try {
        const userData = localStorage.getItem('user-data');

        if (!userData) {
            return {
                success: false,
                error: 'No hay sesión activa'
            };
        }

        const usuario = JSON.parse(userData);

        // Eliminar usuario de localStorage
        await deleteUsuario(usuario.id);

        // Limpiar sesión
        logout();

        logger.info('[DEMO] Cuenta eliminada para:', usuario.email);

        return { success: true };
    } catch (error) {
        logger.error('[DEMO] Error al eliminar cuenta:', error);
        return {
            success: false,
            error: error.message || 'Error al eliminar cuenta'
        };
    }
};
