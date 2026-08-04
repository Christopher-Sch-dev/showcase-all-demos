/**
 * Sistema de notificaciones profesional con react-toastify
 * Reemplaza todos los alerts del sistema de forma no bloqueante
 *
 * Uso:
 * import { showSuccess, showError, showWarning, showInfo } from '../utils/toast';
 * showSuccess('Operación exitosa');
 * showError('Hubo un error');
 */

import { toast } from 'react-toastify';

// Configuración base para todas las notificaciones
const defaultConfig = {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: 'dark', // Coherente con el tema oscuro del sistema
};

/**
 * Notificación de éxito (verde)
 * @param {string} message - Mensaje a mostrar
 * @param {object} options - Opciones adicionales de react-toastify
 */
export const showSuccess = (message, options = {}) => {
    toast.success(message, {
        ...defaultConfig,
        ...options,
    });
};

/**
 * Notificación de error (rojo)
 * @param {string} message - Mensaje a mostrar
 * @param {object} options - Opciones adicionales de react-toastify
 */
export const showError = (message, options = {}) => {
    toast.error(message, {
        ...defaultConfig,
        autoClose: 5000, // Errores duran más tiempo
        ...options,
    });
};

/**
 * Notificación de advertencia (naranja/amarillo)
 * @param {string} message - Mensaje a mostrar
 * @param {object} options - Opciones adicionales de react-toastify
 */
export const showWarning = (message, options = {}) => {
    toast.warning(message, {
        ...defaultConfig,
        ...options,
    });
};

/**
 * Notificación informativa (azul)
 * @param {string} message - Mensaje a mostrar
 * @param {object} options - Opciones adicionales de react-toastify
 */
export const showInfo = (message, options = {}) => {
    toast.info(message, {
        ...defaultConfig,
        ...options,
    });
};

/**
 * Notificación de promesa - Muestra loading, success o error según el resultado
 * Útil para operaciones async como API calls
 *
 * Ejemplo:
 * showPromise(
 *   apiCall(),
 *   {
 *     pending: 'Guardando...',
 *     success: 'Guardado exitosamente',
 *     error: 'Error al guardar'
 *   }
 * );
 */
export const showPromise = (promise, messages) => {
    return toast.promise(promise, {
        pending: {
            render() {
                return messages.pending || 'Procesando...';
            },
            ...defaultConfig,
        },
        success: {
            render() {
                return messages.success || 'Operación exitosa';
            },
            ...defaultConfig,
        },
        error: {
            render({ data }) {
                return messages.error || data?.message || 'Ha ocurrido un error';
            },
            ...defaultConfig,
        },
    });
};

/**
 * Notificación con confirmación - Muestra un toast con botones de acción
 * @param {string} message - Mensaje a mostrar
 * @param {function} onConfirm - Callback cuando se confirma
 * @param {function} onCancel - Callback cuando se cancela (opcional)
 */
export const showConfirmation = (message, onConfirm, onCancel) => {
    const toastId = toast.info(
        <div>
            <p>{message}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                    onClick={() => {
                        onConfirm();
                        toast.dismiss(toastId);
                    }}
                    style={{
                        padding: '6px 12px',
                        background: '#6C63FF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Confirmar
                </button>
                <button
                    onClick={() => {
                        if (onCancel) onCancel();
                        toast.dismiss(toastId);
                    }}
                    style={{
                        padding: '6px 12px',
                        background: '#666',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    Cancelar
                </button>
            </div>
        </div>,
        {
            ...defaultConfig,
            autoClose: false,
            closeButton: false,
        }
    );
};
