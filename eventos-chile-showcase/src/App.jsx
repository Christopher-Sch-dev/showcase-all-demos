// Configuración de rutas principales con React Router
// Optimizado con lazy loading para code splitting

import { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Chatbot from './components/Chatbot';
import ErrorBoundary from './components/ErrorBoundary';
import FloatingArtifacts from './components/FloatingArtifacts';
import SpaceWarp from './components/SpaceWarp';
import ProtectedRoute from './context/ProtectedRoute';
import { PreloaderProvider, usePreloader } from './context/PreloaderContext';
import { logger } from './utils/logger';
import DigitalSpaceBackground from './components/DigitalSpaceBackground';

// Lazy load de páginas
import Home from './pages/Home'; // Importación directa
const Eventos = lazy(() => import('./pages/Eventos'));
const EventoDetalle = lazy(() => import('./pages/EventoDetalle'));
const Auth = lazy(() => import('./pages/Auth'));
const Admin = lazy(() => import('./pages/Admin'));
const Perfil = lazy(() => import('./pages/Perfil'));
const SuperAdmin = lazy(() => import('./pages/SuperAdmin'));
const TerminosCondiciones = lazy(() => import('./pages/TerminosCondiciones'));
const AcercaDelProyecto = lazy(() => import('./pages/AcercaDelProyecto'));

// Componente wrapper para FloatingArtifacts
function FloatingArtifactsConditional({ basename }) {
    const location = useLocation();
    const normalizedPath = location.pathname.replace(basename, '') || '/';
    const isHome = normalizedPath === '/' || normalizedPath === '';

    if (!isHome) return null;
    return <FloatingArtifacts />;
}

// Fallback de carga
const LoadingFallback = () => (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
        </div>
    </div>
);

// Contenido interno de la App (dentro del Router)
function AppContent({ basename }) {
    const location = useLocation();
    const { setPreloaderActive } = usePreloader();

    // Lógica de visibilidad del Chatbot / Preloader
    useEffect(() => {
        // El preloader solo debe estar activo en la carga inicial del Home.
        // Si navegamos fuera del home, aseguramos que el chatbot sea visible (preloader inactivo).
        // Nota: Home maneja su propia activación del preloader al montar.
        if (location.pathname !== '/') {
            setPreloaderActive(false);
        }
    }, [location, setPreloaderActive]);

    return (
        <>
            <FloatingArtifactsConditional basename={basename} />

            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/eventos" element={<Eventos />} />
                    <Route path="/eventos/:id" element={<EventoDetalle />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/panel" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
                    <Route path="/super-admin" element={<ProtectedRoute><SuperAdmin /></ProtectedRoute>} />
                    <Route path="/terminos" element={<TerminosCondiciones />} />
                    <Route path="/acerca-proyecto" element={<AcercaDelProyecto />} />
                </Routes>
            </Suspense>

            {/* Chatbot disponible globalmente */}
            <Chatbot />
        </>
    );
}

function App() {
    const renderStartTimeRef = useRef(performance.now());
    const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

    useEffect(() => {
        const renderTime = performance.now() - renderStartTimeRef.current;
        logger.debug('[APP] Performance - Render time:', `${renderTime.toFixed(2)}ms`);
        document.documentElement.style.scrollBehavior = 'smooth';
        return () => {
            document.documentElement.style.scrollBehavior = 'auto';
        };
    }, []);

    return (
        <PreloaderProvider>
            <ErrorBoundary>
                <ToastContainer
                    position="top-right"
                    autoClose={4000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="dark"
                    style={{ zIndex: 99999 }}
                />

                {/* Filtros Globales */}
                <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
                    <defs>
                        <filter id="virus-flow">
                            <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="2" result="warp">
                                <animate attributeName="baseFrequency" values="0.01;0.08;0.01" dur="2s" repeatCount="indefinite" />
                            </feTurbulence>
                            <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="60" in="SourceGraphic" in2="warp" />
                        </filter>
                    </defs>
                </svg>

                {/* Fondos Globales */}
                <SpaceWarp />
                <DigitalSpaceBackground />

                <BrowserRouter basename={basename}>
                    <AppContent basename={basename} />
                </BrowserRouter>
            </ErrorBoundary>
        </PreloaderProvider>
    );
}

export default App;
