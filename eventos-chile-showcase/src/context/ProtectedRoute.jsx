// HOC para proteger rutas que requieren autenticación
// Redirige a /auth si no hay sesión activa

import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Componente que protege rutas privadas
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si hay sesión
 * Ruta protegida - requiere autenticación (sistema unificado sin roles)
 */
function ProtectedRoute({ children }) {
    const { isLoggedIn, loading } = useAuth();

    // Esperar a que termine la carga inicial
    if (loading) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Verificando sesión...</p>
            </div>
        );
    }

    // Si no hay sesión, redirigir a login
    if (!isLoggedIn()) {
        return <Navigate to="/auth" replace />;
    }

    // Si todo está ok, renderizar el componente hijo
    return children;
}

export default ProtectedRoute;
