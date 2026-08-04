/**
 * Servicio API para gestionar solicitudes de eliminación de eventos (Modo Demo)
 * Reemplaza las llamadas al backend Spring Boot
 * Autor: Christopher Schiefelbein
 * 
 * Endpoints simulados:
 *   - POST /solicitudes-eliminacion (crear solicitud)
 *   - GET /solicitudes-eliminacion/mis-solicitudes (listar propias)
 *   - GET /solicitudes-eliminacion/pendientes (listar pendientes - SUPER_ADMIN)
 *   - GET /solicitudes-eliminacion/pendientes/count (contar pendientes - SUPER_ADMIN)
 *   - POST /solicitudes-eliminacion/:id/aprobar (aprobar - SUPER_ADMIN)
 *   - POST /solicitudes-eliminacion/:id/rechazar (rechazar - SUPER_ADMIN)
 */

import {
    createSolicitud,
    getSolicitudesByUsuario,
    getSolicitudesPendientes,
    countSolicitudesPendientes,
    getSolicitudById,
    aprobarSolicitud as lsAprobarSolicitud,
    rechazarSolicitud as lsRechazarSolicitud,
    getHistorialSolicitudes
} from './localStorageService';

/**
 * Crea una solicitud de eliminación para un evento.
 * @param {Object} data - { eventoId: number, motivo: string }
 * @returns {Promise} Solicitud creada
 */
export const crearSolicitudEliminacion = async (data) => {
    try {
        // Obtener ID del usuario actual
        const userData = localStorage.getItem('user-data');
        if (!userData) {
            throw new Error('No hay sesión activa');
        }

        const user = JSON.parse(userData);
        const solicitud = await createSolicitud({
            ...data,
            solicitanteId: user.id
        });

        return solicitud;
    } catch (error) {
        throw error;
    }
};

/**
 * Lista las solicitudes de eliminación del usuario actual.
 * @returns {Promise} Lista de solicitudes propias
 */
export const listarMisSolicitudes = async () => {
    try {
        const userData = localStorage.getItem('user-data');
        if (!userData) {
            throw new Error('No hay sesión activa');
        }

        const user = JSON.parse(userData);
        const solicitudes = await getSolicitudesByUsuario(user.id);
        return solicitudes;
    } catch (error) {
        throw error;
    }
};

/**
 * Lista todas las solicitudes pendientes (solo SUPER_ADMIN).
 * @returns {Promise} Lista de solicitudes pendientes
 */
export const listarSolicitudesPendientes = async () => {
    try {
        const solicitudes = await getSolicitudesPendientes();
        return solicitudes;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtiene el conteo de solicitudes pendientes (solo SUPER_ADMIN).
 * Útil para mostrar badge de notificaciones.
 * @returns {Promise} { pendientes: number }
 */
export const contarSolicitudesPendientes = async () => {
    try {
        const count = await countSolicitudesPendientes();
        return count;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtiene una solicitud por su ID.
 * @param {number} id - ID de la solicitud
 * @returns {Promise} Detalles de la solicitud
 */
export const obtenerSolicitudPorId = async (id) => {
    try {
        const solicitud = await getSolicitudById(id);
        if (!solicitud) {
            throw new Error('Solicitud no encontrada');
        }
        return solicitud;
    } catch (error) {
        throw error;
    }
};

/**
 * Aprueba una solicitud de eliminación (solo SUPER_ADMIN).
 * Esto elimina el evento asociado.
 * @param {number} id - ID de la solicitud
 * @param {Object} data - { respuesta: string } (opcional)
 * @returns {Promise} Solicitud actualizada
 */
export const aprobarSolicitud = async (id, data = {}) => {
    try {
        const solicitud = await lsAprobarSolicitud(id, data);
        return solicitud;
    } catch (error) {
        throw error;
    }
};

/**
 * Rechaza una solicitud de eliminación (solo SUPER_ADMIN).
 * El evento permanece activo.
 * @param {number} id - ID de la solicitud
 * @param {Object} data - { respuesta: string } (opcional)
 * @returns {Promise} Solicitud actualizada
 */
export const rechazarSolicitud = async (id, data = {}) => {
    try {
        const solicitud = await lsRechazarSolicitud(id, data);
        return solicitud;
    } catch (error) {
        throw error;
    }
};

/**
 * Lista el historial de solicitudes resueltas (solo SUPER_ADMIN).
 * Incluye solicitudes aprobadas y rechazadas para auditoría.
 * @returns {Promise} Lista de solicitudes resueltas
 */
export const listarHistorialSolicitudes = async () => {
    try {
        const historial = await getHistorialSolicitudes();
        return historial;
    } catch (error) {
        throw error;
    }
};

export default {
    crearSolicitudEliminacion,
    listarMisSolicitudes,
    listarSolicitudesPendientes,
    contarSolicitudesPendientes,
    obtenerSolicitudPorId,
    aprobarSolicitud,
    rechazarSolicitud,
    listarHistorialSolicitudes
};
