/**
 * Servicio de eventos usando localStorage (Modo Demo)
 * Reemplaza las llamadas al backend Spring Boot
 * Autor: Christopher Schiefelbein
 */

import {
    getEventos as lsGetEventos,
    getEventosVigentes as lsGetEventosVigentes,
    getEventosPasados as lsGetEventosPasados,
    getEventoById,
    createEvento,
    updateEvento,
    deleteEvento,
    getEventosByUsuario
} from './localStorageService';

/**
 * Obtiene todos los eventos
 */
export const obtenerEventos = async () => {
    try {
        const eventos = await lsGetEventos();
        return { success: true, data: eventos };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al obtener eventos',
            detalles: { message: error.message }
        };
    }
};

/**
 * Obtiene eventos vigentes (con fechas futuras)
 */
export const obtenerEventosVigentes = async () => {
    try {
        const eventos = await lsGetEventosVigentes();
        return { success: true, data: eventos };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al obtener eventos vigentes'
        };
    }
};

/**
 * Obtiene eventos pasados
 */
export const obtenerEventosPasados = async () => {
    try {
        const eventos = await lsGetEventosPasados();
        return { success: true, data: eventos };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al obtener eventos pasados'
        };
    }
};

/**
 * Obtiene un evento por su ID
 */
export const obtenerEventoPorId = async (id) => {
    try {
        const evento = await getEventoById(id);
        if (!evento) {
            return {
                success: false,
                error: 'Evento no encontrado'
            };
        }
        return { success: true, data: evento };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al obtener evento'
        };
    }
};

/**
 * Crea un nuevo evento
 */
export const crearEvento = async (eventoData) => {
    try {
        // Obtener datos del organizador de la sesión actual
        const userData = localStorage.getItem('user-data');
        let organizadorId = 1;
        let organizadorNombre = 'Usuario Demo';

        if (userData) {
            const user = JSON.parse(userData);
            organizadorId = user.id;
            organizadorNombre = user.nombre;
        }

        const nuevoEvento = await createEvento({
            ...eventoData,
            organizadorId,
            organizadorNombre
        });

        return { success: true, data: nuevoEvento };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al crear evento'
        };
    }
};

/**
 * Actualiza un evento existente
 */
export const actualizarEvento = async (id, eventoData) => {
    try {
        const eventoActualizado = await updateEvento(id, eventoData);
        return { success: true, data: eventoActualizado };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al actualizar evento'
        };
    }
};

/**
 * Elimina un evento
 */
export const eliminarEvento = async (id) => {
    try {
        await deleteEvento(id);
        return { success: true };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al eliminar evento'
        };
    }
};

/**
 * Obtiene eventos creados por un usuario específico
 */
export const obtenerEventosPorUsuario = async (usuarioId) => {
    try {
        const eventos = await getEventosByUsuario(usuarioId);
        return { success: true, data: eventos };
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Error al obtener eventos del usuario'
        };
    }
};
