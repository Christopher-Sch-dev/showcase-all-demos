// Página de inicio moderna estilo 109ichiki/Chirpley
// Integrada con backend real - mantiene toda la funcionalidad existente
// Implementa lazy loading de componentes pesados para evitar race conditions

import React, { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// Componentes ligeros (importación directa)
import AlienStream from '../components/AlienStream';
import CtaFinal from '../components/CtaFinal';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import CyberDivider from '../components/ui/CyberDivider';

// Lazy load de componentes pesados (framer-motion, three.js)
// Esto garantiza que React esté completamente inicializado antes de cargar estas librerías
const Hero3D = React.lazy(() => import('../components/Hero3D'));

// SpaceWarp y FloatingArtifacts ahora están en App.jsx (arquitectura SINGLE UNIVERSE)
import Preloader from '../components/Preloader';
import { obtenerEventos } from '../services/apiEventos';
import '../styles/category-section.css';
import '../styles/home-mejoras.css';
import '../styles/home.css';
import { logger } from '../utils/logger';
import { useIdleAutoScroll } from '../hooks/useIdleAutoScroll';
import { usePreloader } from '../context/PreloaderContext';

function Home() {
    const location = useLocation();
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { setPreloaderActive } = usePreloader();

    // Auto-scroll (Attract Mode): 4 segundos de inactividad, velocidad 5.0 (Acelerado)
    useIdleAutoScroll(4000, 5.0);

    const [error, setError] = useState(null);
    const [preloaderDone, setPreloaderDone] = useState(false);

    // Cargar eventos del backend y pre-cargar componentes pesados
    useEffect(() => {
        // Preload del componente 3D para que esté listo apenas termine el preloader
        import('../components/Hero3D').then(() => {
            logger.debug('Home: Hero3D pre-cargado en segundo plano');
        });

        const cargarEventos = async () => {
            try {
                setLoading(true);
                setError(null);
                const resultado = await obtenerEventos();

                if (resultado.success) {
                    const eventosData = Array.isArray(resultado.data) ? resultado.data : [];
                    // Cargar todos los eventos para categorizar
                    setEventos(eventosData);
                    logger.debug('Home: Eventos cargados', { total: eventosData.length });
                } else {
                    logger.warn('Home: Error al cargar eventos', resultado.error);
                    setError(resultado.error);
                }
            } catch (err) {
                logger.error('Home: Error inesperado al cargar eventos', err);
                setError(err.message || 'Error al cargar eventos');
            } finally {
                setLoading(false);
            }
        };

        cargarEventos();
    }, []);

    // Auto-scroll hacia abajo después del preloader
    // Auto-scroll eliminado para evitar saltos bruscos y respetar la posición del usuario
    // useEffect(() => { ... }, [preloaderDone, loading]);

    // Categorizar eventos por tipo
    const eventosDestacados = eventos.slice(0, 6); // Primeros 6 como destacados
    const eventosMusica = eventos.filter(e =>
        e.categoria?.toLowerCase().includes('música') ||
        e.tipo?.toLowerCase().includes('música') ||
        e.titulo?.toLowerCase().includes('música') ||
        e.titulo?.toLowerCase().includes('festival') ||
        e.titulo?.toLowerCase().includes('concierto')
    ).slice(0, 10);
    const eventosTech = eventos.filter(e =>
        e.categoria?.toLowerCase().includes('tech') ||
        e.categoria?.toLowerCase().includes('tecnología') ||
        e.tipo?.toLowerCase().includes('online') ||
        e.titulo?.toLowerCase().includes('tech') ||
        e.titulo?.toLowerCase().includes('hackathon') ||
        e.titulo?.toLowerCase().includes('workshop')
    ).slice(0, 10);
    const eventosDeportes = eventos.filter(e =>
        e.categoria?.toLowerCase().includes('deporte') ||
        e.titulo?.toLowerCase().includes('deporte') ||
        e.titulo?.toLowerCase().includes('marathon') ||
        e.titulo?.toLowerCase().includes('running')
    ).slice(0, 10);

    // Manejar scroll a sección cuando la URL contiene hash (compatibilidad)
    useEffect(() => {
        if (location.hash) {
            const id = location.hash.replace('#', '');
            setTimeout(() => {
                const elemento = document.getElementById(id);
                if (elemento) {
                    elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [location]);

    return (
        <>
            {/* Preloader: Muestra mientras React se inicializa y componentes pesados se cargan */}
            {!preloaderDone && (
                <Preloader onFinished={() => { setPreloaderDone(true); setPreloaderActive(false); }} />
            )}

            {/* Contenido principal: Solo se muestra después del preloader */}
            {preloaderDone && (
                <main style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: '100vh',
                    color: 'white',
                    overflowX: 'hidden'
                }}>
                    {/* Fondo Warp Speed ahora está en App.jsx (arquitectura SINGLE UNIVERSE) */}

                    {/* Contenido Normal - z-index: 10 */}
                    <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}>
                        <Navbar />

                        {/* Hero 3D Interactivo con Portal Alien - Lazy loaded */}
                        <Suspense fallback={<div style={{ height: '100vh', background: '#050505' }} />}>
                            <Hero3D />
                        </Suspense>

                        {/* CTA Final épico - Justo después del impacto visual del Hero */}
                        {/* CTA Final removido de aquí, ahora este en medio de los eventos */}

                        {/* Secciones de categorías con scroll horizontal estilo Netflix */}
                        {loading ? (
                            <section style={{
                                background: 'transparent',
                                padding: '5rem 0',
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                    <span className="visually-hidden">Cargando eventos...</span>
                                </div>
                                <p style={{ marginTop: '1rem', color: '#888' }}>Cargando eventos...</p>
                            </section>
                        ) : error ? (
                            <section style={{
                                background: 'transparent',
                                padding: '5rem 0',
                                textAlign: 'center',
                                color: 'white'
                            }}>
                                <p style={{ color: '#888', fontSize: '1.2rem' }}>
                                    No se pudieron cargar los eventos. Intenta más tarde.
                                </p>
                            </section>
                        ) : (
                            <div
                                id="contenido-principal"
                                style={{
                                    position: 'relative',
                                    zIndex: 10,
                                    background: '#050505',
                                    paddingTop: '4rem',
                                    paddingBottom: '4rem'
                                }}>
                                {/* Alien Stream de eventos destacados */}
                                {eventosDestacados.length > 0 && (
                                    <>
                                        <AlienStream title="Tendencias" events={eventosDestacados} />
                                        <CyberDivider />
                                    </>
                                )}

                                {/* CTA Final épico - Ahora INTERCALADO para mayor impacto */}
                                <div style={{ margin: '4rem 0' }}>
                                    <CtaFinal />
                                </div>

                                {/* Alien Stream de música */}
                                {eventosMusica.length > 0 && (
                                    <>
                                        <AlienStream title="Música y Festivales" events={eventosMusica} />
                                        <CyberDivider />
                                    </>
                                )}

                                {/* Alien Stream de tecnología */}
                                {eventosTech.length > 0 && (
                                    <>
                                        <AlienStream title="Tech & Innovation" events={eventosTech} />
                                        <CyberDivider />
                                    </>
                                )}

                                {/* Alien Stream de deportes */}
                                {eventosDeportes.length > 0 && (
                                    <>
                                        <AlienStream title="Deportes y Fitness" events={eventosDeportes} />
                                        <CyberDivider />
                                    </>
                                )}

                                {/* Si no hay eventos filtrados, mostrar todos */}
                                {eventosDestacados.length === 0 && eventos.length > 0 && (
                                    <AlienStream title="Todos los Eventos" events={eventos.slice(0, 12)} />
                                )}
                            </div>
                        )}

                        <Footer />
                    </div>

                    {/* FloatingArtifacts ahora está en App.jsx (arquitectura SINGLE UNIVERSE) */}
                </main>
            )}
        </>
    );
}

export default Home;
