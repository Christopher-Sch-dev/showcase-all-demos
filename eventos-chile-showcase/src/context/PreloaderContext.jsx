/**
 * PreloaderContext - Contexto global para estado del Preloader
 * 
 * Propósito: Compartir el estado del preloader con toda la aplicación
 * para que componentes como Chatbot puedan ocultarse durante la carga
 * 
 * Arquitectura: Context API de React para estado global sin prop drilling
 */

import { createContext, useContext, useState, useCallback } from 'react';

const PreloaderContext = createContext({
    isPreloaderActive: true,
    setPreloaderActive: () => { }
});

/**
 * Hook para acceder al estado del preloader
 * @returns {{ isPreloaderActive: boolean, setPreloaderActive: (active: boolean) => void }}
 */
export function usePreloader() {
    const context = useContext(PreloaderContext);
    if (!context) {
        throw new Error('usePreloader must be used within PreloaderProvider');
    }
    return context;
}

/**
 * Provider del contexto del preloader
 */
export function PreloaderProvider({ children }) {
    const [isPreloaderActive, setIsPreloaderActive] = useState(true);

    const setPreloaderActive = useCallback((active) => {
        setIsPreloaderActive(active);
    }, []);

    return (
        <PreloaderContext.Provider value={{ isPreloaderActive, setPreloaderActive }}>
            {children}
        </PreloaderContext.Provider>
    );
}

export default PreloaderContext;
