// Sistema de logging condicional para desarrollo/producción
const isDevelopment = import.meta.env.DEV;

export const logger = {
    log: (...args) => {
        if (isDevelopment) {
            console.log(...args);
        }
    },
    info: (...args) => {
        if (isDevelopment) {
            console.info(...args);
        }
    },
    error: (...args) => {
        // Siempre loggear errores
        console.error(...args);
    },
    warn: (...args) => {
        if (isDevelopment) {
            console.warn(...args);
        }
    },
    debug: (...args) => {
        if (isDevelopment) {
            console.log('[DEBUG]', ...args);
        }
    }
};

