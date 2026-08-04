/**
 * Manejo global de autenticación (Modo Demo con localStorage)
 * Simplificado para funcionar sin backend Spring Boot
 * Autor: Christopher Schiefelbein
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/apiAuth';
import { logger } from '../utils/logger';

// Creo el contexto para compartir datos de autenticación entre componentes
const AuthContext = createContext(null);

// Proveedor que envuelve la app y comparte el estado de autenticación
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Al cargar la app, reviso si hay una sesión guardada en localStorage
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const userData = localStorage.getItem('user-data');
                const token = localStorage.getItem('jwt_token');

                if (!userData || !token) {
                    logger.info('[DEMO] No hay sesión activa');
                    setLoading(false);
                    return;
                }

                // En modo demo, si hay datos guardados, los cargamos directamente
                // No necesitamos validar JWT real
                const parsedUser = JSON.parse(userData);
                setUser({
                    ...parsedUser,
                    logged: parsedUser.rol?.toLowerCase() || 'user'
                });

                logger.info('[DEMO] Sesión restaurada para:', parsedUser.email);
            } catch (error) {
                logger.error('[DEMO] Error al inicializar autenticación:', error);
                apiLogout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Inicio sesión usando localStorage
    const login = async (email, password) => {
        const result = await apiLogin(email, password);
        if (result.success) {
            const userData = JSON.parse(localStorage.getItem('user-data'));
            setUser({
                ...userData,
                logged: userData.rol?.toLowerCase() || 'user'
            });
            return { success: true };
        }
        return { success: false, error: result.error };
    };

    // Registro usando localStorage
    const register = async (userData) => {
        const result = await apiRegister(userData);
        if (result.success) {
            const savedUserData = JSON.parse(localStorage.getItem('user-data'));
            setUser({
                ...savedUserData,
                logged: savedUserData.rol?.toLowerCase() || 'user'
            });
            return { success: true };
        }
        return { success: false, error: result.error };
    };

    // Cierro sesión limpiando localStorage y estado
    const logout = () => {
        apiLogout();
        setUser(null);
    };

    // Verificar si el usuario es admin (cualquier tipo de admin)
    const isAdmin = () => {
        return user?.rol === 'SUPER_ADMIN';
    };

    // Verificar si es SUPER_ADMIN específicamente
    const isSuperAdmin = () => {
        return user?.rol === 'SUPER_ADMIN';
    };

    // Verifico si hay alguien logueado
    const isLoggedIn = () => {
        return user !== null && localStorage.getItem('jwt_token') !== null;
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            logout,
            isAdmin,
            isSuperAdmin,
            isLoggedIn,
            loading
        }}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar el contexto de autenticación en cualquier componente
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
}
