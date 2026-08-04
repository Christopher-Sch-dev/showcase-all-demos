/**
 * Servicio de usuarios usando localStorage (Modo Demo)
 * Reemplaza las llamadas al backend Spring Boot
 * Autor: Christopher Schiefelbein
 */

import { logger } from '../utils/logger';
import {
    getUsuarios as lsGetUsuarios,
    getUsuarioById,
    updateUsuario
} from './localStorageService';

/**
 * Obtiene el perfil del usuario actual
 */
export const obtenerPerfil = async () => {
    try {
        const userData = localStorage.getItem('user-data');

        if (!userData) {
            return {
                success: false,
                error: 'No hay sesión activa'
            };
        }

        const user = JSON.parse(userData);
        const perfil = await getUsuarioById(user.id);

        if (!perfil) {
            return {
                success: false,
                error: 'Usuario no encontrado'
            };
        }

        return { success: true, data: perfil };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al obtener perfil'
        };
    }
};

/**
 * Actualiza el perfil del usuario actual
 */
export const actualizarPerfil = async (userData) => {
    try {
        const currentUser = localStorage.getItem('user-data');

        if (!currentUser) {
            return {
                success: false,
                error: 'No hay sesión activa'
            };
        }

        const user = JSON.parse(currentUser);
        const perfilActualizado = await updateUsuario(user.id, userData);

        // Actualizar datos en localStorage
        localStorage.setItem('user-data', JSON.stringify({
            id: perfilActualizado.id,
            email: perfilActualizado.email,
            nombre: perfilActualizado.nombre,
            rol: perfilActualizado.rol
        }));

        logger.info('[DEMO] Perfil actualizado para:', perfilActualizado.email);

        return { success: true, data: perfilActualizado };
    } catch (error) {
        const errorMessage = error.message || 'Error al actualizar perfil';
        logger.error('[DEMO] Error al actualizar perfil:', {
            message: errorMessage
        });
        return {
            success: false,
            error: errorMessage
        };
    }
};

/**
 * Obtiene un usuario por su ID
 */
export const obtenerUsuarioPorId = async (id) => {
    try {
        const usuario = await getUsuarioById(id);

        if (!usuario) {
            return {
                success: false,
                error: 'Usuario no encontrado'
            };
        }

        return { success: true, data: usuario };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al obtener usuario'
        };
    }
};

/**
 * Obtiene la lista de todos los usuarios (solo SUPER_ADMIN)
 * @returns {Promise<Array>} Lista de usuarios
 */
export const getUsuarios = async () => {
    try {
        const usuarios = await lsGetUsuarios();
        return usuarios;
    } catch (error) {
        logger.error('[DEMO] Error al obtener usuarios:', error);
        throw error;
    }
};
