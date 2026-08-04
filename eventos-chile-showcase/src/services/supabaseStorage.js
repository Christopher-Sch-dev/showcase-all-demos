// Servicio para manejar la subida de imágenes a Supabase Storage
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

// Configuración de Supabase (usar variables de entorno)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'tu-anon-key';

// Crear cliente de Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Nombre del bucket para imágenes de eventos
// IMPORTANTE: Debe coincidir exactamente con el nombre del bucket en Supabase (eventos-imagenes en minúsculas)
const BUCKET_NAME = 'eventos-imagenes';

/**
 * Sube una imagen a Supabase Storage
 * @param {File|Blob} file - Archivo de imagen a subir (File o Blob)
 * @param {string} pathOrEventoId - Path completo o ID del evento (opcional, para organizar archivos)
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const subirImagen = async (file, pathOrEventoId = null) => {
    try {
        // Validar que sea un archivo de imagen
        if (!file || !file.type || !file.type.startsWith('image/')) {
            return {
                success: false,
                error: 'El archivo debe ser una imagen'
            };
        }

        // Validar tamaño (máximo 5MB)
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
        if (file.size > MAX_SIZE) {
            return {
                success: false,
                error: 'La imagen no debe superar los 5MB'
            };
        }

        // Determinar extensión del archivo
        let fileExtension = 'png'; // Por defecto PNG
        if (file.name && typeof file.name === 'string' && file.name.includes('.')) {
            // Si es un File con nombre, extraer extensión del nombre
            fileExtension = file.name.split('.').pop().toLowerCase();
        } else {
            // Si es un Blob, extraer extensión del tipo MIME
            const mimeType = file.type.toLowerCase();
            if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
                fileExtension = 'jpg';
            } else if (mimeType.includes('png')) {
                fileExtension = 'png';
            } else if (mimeType.includes('gif')) {
                fileExtension = 'gif';
            } else if (mimeType.includes('webp')) {
                fileExtension = 'webp';
            }
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);

        // Determinar nombre del archivo y ruta
        let fileName;
        let path;
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        if (pathOrEventoId && typeof pathOrEventoId === 'string' && pathOrEventoId.includes('/')) {
            // Es un path completo (ej: "perfiles/123")
            const pathParts = pathOrEventoId.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            // Generar nombre único para el archivo usando la última parte del path
            fileName = `${lastPart}_${timestamp}-${randomString}.${fileExtension}`;
            // Construir path completo: "perfiles/123/nombreArchivo.png"
            path = `${pathOrEventoId}/${fileName}`;
        } else if (pathOrEventoId) {
            // Es un ID de evento (número o string sin '/')
            // Construir nombre con prefijo de evento
            fileName = `evento-${pathOrEventoId}-${timestamp}-${randomString}.${fileExtension}`;
            // Organizar por fecha
            path = `${year}/${month}/${fileName}`;
        } else {
            // Sin path ni ID, generar nombre genérico
            fileName = `evento-${timestamp}-${randomString}.${fileExtension}`;
            // Organizar por fecha
            path = `${year}/${month}/${fileName}`;
        }

        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false // No sobrescribir si existe
            });

        if (error) {
            logger.error('Error al subir imagen:', error);
            return {
                success: false,
                error: error.message || 'Error al subir la imagen'
            };
        }

        // Obtener URL pública de la imagen
        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(path);

        return {
            success: true,
            url: urlData.publicUrl,
            path: path
        };
    } catch (error) {
        logger.error('Error inesperado al subir imagen:', error);
        return {
            success: false,
            error: error.message || 'Error inesperado al subir la imagen'
        };
    }
};

/**
 * Elimina una imagen de Supabase Storage
 * @param {string} path - Ruta del archivo en el bucket
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const eliminarImagen = async (path) => {
    try {
        // Extraer la ruta del bucket desde la URL completa si es necesario
        let filePath = path;
        if (path.includes(BUCKET_NAME)) {
            // Si es una URL completa, extraer solo la ruta
            const urlParts = path.split(`${BUCKET_NAME}/`);
            if (urlParts.length > 1) {
                filePath = urlParts[1];
            }
        }

        const { error } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        if (error) {
            logger.error('Error al eliminar imagen:', error);
            return {
                success: false,
                error: error.message || 'Error al eliminar la imagen'
            };
        }

        return { success: true };
    } catch (error) {
        logger.error('Error inesperado al eliminar imagen:', error);
        return {
            success: false,
            error: error.message || 'Error inesperado al eliminar la imagen'
        };
    }
};

/**
 * Verifica si una URL es de Supabase Storage
 * @param {string} url - URL a verificar
 * @returns {boolean}
 */
export const esUrlSupabase = (url) => {
    return url && (url.includes('supabase.co') || url.includes(BUCKET_NAME));
};

/**
 * Obtiene la URL pública de una imagen desde su path
 * @param {string} path - Ruta del archivo en el bucket
 * @returns {string}
 */
export const obtenerUrlPublica = (path) => {
    if (!path) return null;

    // Si ya es una URL completa, retornarla
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    // Si es una ruta relativa, construir la URL pública
    const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(path);

    return data.publicUrl;
};

