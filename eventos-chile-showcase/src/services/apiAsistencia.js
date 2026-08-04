/**
 * Servicio de asistencia usando localStorage (Modo Demo)
 * Reemplaza las llamadas al backend Spring Boot
 * Autor: Christopher Schiefelbein
 */

import {
    confirmarAsistencia as lsConfirmarAsistencia,
    cancelarAsistencia as lsCancelarAsistencia,
    getAsistenciasByUsuario,
    getAsistenciasByEvento
} from './localStorageService';

/**
 * Confirma asistencia a un evento
 */
export const confirmarAsistencia = async (asistenciaData) => {
    try {
        const asistencia = await lsConfirmarAsistencia(asistenciaData);
        return { success: true, data: asistencia };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al confirmar asistencia'
        };
    }
};

/**
 * Cancela una asistencia
 */
export const cancelarAsistencia = async (asistenciaId) => {
    try {
        await lsCancelarAsistencia(asistenciaId);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al cancelar asistencia'
        };
    }
};

/**
 * Obtiene las asistencias de un usuario
 */
export const obtenerAsistenciasPorUsuario = async (usuarioId) => {
    try {
        const asistencias = await getAsistenciasByUsuario(usuarioId);
        return { success: true, data: asistencias };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al obtener asistencias'
        };
    }
};

/**
 * Obtiene las asistencias de un evento
 */
export const obtenerAsistenciasPorEvento = async (eventoId) => {
    try {
        const asistencias = await getAsistenciasByEvento(eventoId);
        return { success: true, data: asistencias };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al obtener asistencias del evento'
        };
    }
};
