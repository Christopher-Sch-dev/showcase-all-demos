// Funciones helper para compatibilidad con código existente
import { logger } from '../utils/logger';
import { obtenerAsistenciasPorEvento } from './apiAsistencia';

/**
 * Cuenta los asistentes de un evento
 * @param {Object} evento - Objeto evento
 * @returns {Promise<number>} - Número de asistentes
 */
export const contarAsistentes = async (evento) => {
    if (!evento || !evento.id) return 0;
    try {
        const resultado = await obtenerAsistenciasPorEvento(evento.id);
        if (resultado.success) {
            return resultado.data?.length || 0;
        }
        return 0;
    } catch (error) {
        logger.error('Error al contar asistentes:', error);
        return 0;
    }
};

/**
 * Versión síncrona que retorna 0 (para compatibilidad temporal)
 * @param {Object} evento - Objeto evento
 * @returns {number} - Siempre retorna 0 (usar versión async cuando sea posible)
 */
export const contarAsistentesSync = (evento) => {
    // Esta función se mantiene para compatibilidad pero retorna 0
    // Los componentes deberían usar la versión async
    return 0;
};

/**
 * Formatea una fecha ISO (YYYY-MM-DD o YYYY-MM-DDTHH:mm:ss) a formato legible chileno
 * @param {string} fechaISO - Fecha en formato ISO
 * @returns {string} - Fecha formateada en español chileno
 */
export const formatearFecha = (fechaISO) => {
    if (!fechaISO) return 'No disponible';
    try {
        // Si ya es un objeto Date, usarlo directamente
        let fecha;
        if (typeof fechaISO === 'string') {
            // Si la fecha ya incluye hora (tiene T), usarla directamente
            // Si no tiene T, agregar T00:00:00 para evitar problemas de timezone
            fecha = fechaISO.includes('T') ? new Date(fechaISO) : new Date(fechaISO + 'T00:00:00');
        } else {
            fecha = fechaISO;
        }

        if (isNaN(fecha.getTime())) return 'Fecha inválida';

        const opciones = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return fecha.toLocaleDateString('es-CL', opciones);
    } catch (error) {
        logger.error('Error al formatear fecha:', error);
        return fechaISO; // Retornar el valor original si hay error
    }
};

/**
 * Limpia etiquetas HTML de un string (para CKEditor)
 * @param {string} html - String con HTML
 * @returns {string} - Texto plano sin etiquetas HTML
 */
export const stripHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    } catch (error) {
        logger.error('Error al limpiar HTML:', error);
        // Fallback: remover etiquetas básicas con regex
        return html.replace(/<[^>]*>/g, '').trim();
    }
};

