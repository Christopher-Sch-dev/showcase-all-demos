// Página principal de eventos con carrusel infinito y grilla de tarjetas 3D
// Mejorada con buscador, filtros, ordenamiento y mejor UX

import { useEffect, useMemo, useRef, useState } from 'react';
import EventCard from '../components/EventCard';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
// SpaceWarp eliminado - se usa el fondo global de App.jsx para evitar múltiples contextos WebGL
import { obtenerEventos } from '../services/apiEventos';
import '../styles/eventos-filtros.css';
import '../styles/eventos.css';
import { logger } from '../utils/logger';
import { useIdleAutoScroll } from '../hooks/useIdleAutoScroll';

function Eventos() {
    const componentStartTimeRef = useRef(performance.now());
    logger.debug('[Eventos] Componente Eventos montado');

    logger.debug('[Eventos] Componente Eventos montado');

    // Auto-scroll para modo "atract" si inactivo
    useIdleAutoScroll(4000, 3.5);

    // Estado para eventos
    const [todosLosEventos, setTodosLosEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para filtros y búsqueda
    const [busqueda, setBusqueda] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [filtroCategoria, setFiltroCategoria] = useState('todos');
    const [ordenamiento, setOrdenamiento] = useState('fecha');

    // Scroll al inicio cuando el componente se monta
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const cargarEventos = async () => {
            const loadStartTime = performance.now();
            logger.debug('[Eventos] Iniciando carga de eventos');

            try {
                setLoading(true);
                setError(null);
                const resultado = await obtenerEventos();

                if (resultado.success) {
                    const eventos = Array.isArray(resultado.data) ? resultado.data : [];
                    setTodosLosEventos(eventos);
                    const loadTime = performance.now() - loadStartTime;
                    logger.debug('[Eventos] Eventos cargados exitosamente', {
                        total: eventos.length,
                        tiempo: `${loadTime.toFixed(2)}ms`
                    });
                } else {
                    // Mejorar mensaje de error para incluir detalles del 502
                    const mensajeError = resultado.error || 'Error desconocido al cargar eventos';
                    const detallesError = resultado.detalles;

                    // Si es un error de red (502, CORS, etc.), mostrar mensaje más claro
                    let mensajeFinal = mensajeError;
                    if (detallesError?.status === 502 || mensajeError.includes('Network Error') || mensajeError.includes('Failed to fetch')) {
                        mensajeFinal = 'El servidor no está disponible en este momento. Por favor, intenta más tarde.';
                    } else if (mensajeError.includes('CORS')) {
                        mensajeFinal = 'Error de configuración del servidor. Contacta al administrador.';
                    }

                    setError(mensajeFinal);
                    const loadTime = performance.now() - loadStartTime;
                    logger.error('[Eventos] Error al cargar eventos', {
                        error: mensajeError,
                        detalles: detallesError,
                        tiempo: `${loadTime.toFixed(2)}ms`
                    });
                }
            } catch (error) {
                const loadTime = performance.now() - loadStartTime;
                const mensajeError = error.message || 'Error inesperado al cargar eventos';

                // Mejorar mensaje para errores de red
                let mensajeFinal = mensajeError;
                if (mensajeError.includes('Network Error') || mensajeError.includes('Failed to fetch')) {
                    mensajeFinal = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
                }

                logger.error('[Eventos] Error inesperado', {
                    error: mensajeError,
                    tiempo: `${loadTime.toFixed(2)}ms`
                });
                setError(mensajeFinal);
            } finally {
                setLoading(false);
            }
        };

        cargarEventos();
    }, []);

    // Log de rendimiento del componente
    useEffect(() => {
        const mountTime = performance.now() - componentStartTimeRef.current;
        logger.debug('[Eventos] Performance - Tiempo de montaje:', `${mountTime.toFixed(2)}ms`);
    }, []);

    // Obtener tipos únicos de eventos
    const tiposDisponibles = useMemo(() => {
        const tipos = [...new Set(todosLosEventos.map(e => e.tipo))];
        return tipos.sort();
    }, [todosLosEventos]);

    // Obtener categorías únicas y filtrar inválidas
    const categoriasDisponibles = useMemo(() => {
        const categorias = [...new Set(todosLosEventos.map(e => e.categoria))]
            .filter(cat => cat && cat !== 'string' && cat.trim() !== ''); // Filtrar categorías inválidas
        return categorias.sort();
    }, [todosLosEventos]);

    // Filtrar y ordenar eventos
    const eventosFiltrados = useMemo(() => {
        const filterStartTime = performance.now();
        let resultado = [...todosLosEventos];

        // Filtro por búsqueda
        if (busqueda.trim()) {
            const termino = busqueda.toLowerCase();
            resultado = resultado.filter(e =>
                e.titulo?.toLowerCase().includes(termino) ||
                e.descripcion?.toLowerCase().includes(termino) ||
                e.lugar?.toLowerCase().includes(termino) ||
                e.creadoPorNombre?.toLowerCase().includes(termino)
            );
        }

        // Filtro por tipo
        if (filtroTipo !== 'todos') {
            resultado = resultado.filter(e => e.tipo === filtroTipo);
        }

        // Filtro por categoría
        if (filtroCategoria !== 'todos') {
            resultado = resultado.filter(e => e.categoria === filtroCategoria);
        }

        // Ordenamiento
        switch (ordenamiento) {
            case 'fecha':
                resultado.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
                break;
            case 'titulo':
                resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
                break;
            case 'precio-asc':
                resultado.sort((a, b) => a.precio - b.precio);
                break;
            case 'precio-desc':
                resultado.sort((a, b) => b.precio - a.precio);
                break;
            case 'cupos':
                resultado.sort((a, b) => {
                    const cuposA = a.capacidad - (a.totalAsistentes || 0);
                    const cuposB = b.capacidad - (b.totalAsistentes || 0);
                    return cuposB - cuposA;
                });
                break;
            default:
                break;
        }

        const filterTime = performance.now() - filterStartTime;
        logger.debug('[Eventos] Filtrado completado', {
            total: resultado.length,
            tiempo: `${filterTime.toFixed(2)}ms`
        });

        return resultado;
    }, [todosLosEventos, busqueda, filtroTipo, filtroCategoria, ordenamiento]);

    // Limpiar todos los filtros
    const limpiarFiltros = () => {
        setBusqueda('');
        setFiltroTipo('todos');
        setFiltroCategoria('todos');
        setOrdenamiento('fecha');
    };

    return (
        <>
            {/* Fondo Warp Speed - z-index: -1 */}
            {/* SpaceWarp eliminado - usar fondo global de App.jsx */}

            {/* FloatingArtifacts NO se muestra en Eventos para reducir distracción */}
            {/* Los objetos flotantes solo están en Home para mantener la experiencia limpia aquí */}

            <Navbar />

            <main style={{
                position: 'relative',
                zIndex: 10,
                background: 'transparent', // Transparente para que se vea el SpaceWarp
                minHeight: '100vh',
                color: 'white',
                overflow: 'visible', // CRÍTICO: Permitir scroll sin bloqueos
                paddingBottom: '2rem' // Espacio adicional al final para scroll libre
            }} className="container my-5">
                {/* Indicador de carga */}
                {loading && (
                    <div className="row justify-content-center mb-5">
                        <div className="col-12 text-center">
                            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Cargando eventos...</span>
                            </div>
                            <p className="mt-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cargando eventos...</p>
                        </div>
                    </div>
                )}

                {/* Mensaje de error */}
                {error && !loading && (
                    <div className="row justify-content-center mb-4">
                        <div className="col-lg-10">
                            <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                <strong>Error al cargar eventos:</strong>
                                <div className="mt-2">
                                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.9em' }}>{error}</pre>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setError(null)}
                                    aria-label="Cerrar"
                                ></button>
                                <div className="mt-2">
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => {
                                            setError(null);
                                            setLoading(true);
                                            obtenerEventos().then(resultado => {
                                                if (resultado.success) {
                                                    setTodosLosEventos(resultado.data || []);
                                                } else {
                                                    const mensajeError = resultado.error || 'Error desconocido';
                                                    const detallesError = resultado.detalles ? `\nDetalles: ${JSON.stringify(resultado.detalles, null, 2)}` : '';
                                                    setError(mensajeError + detallesError);
                                                }
                                                setLoading(false);
                                            }).catch(err => {
                                                setError(`${err.message}\n\nDetalles: ${JSON.stringify(err, null, 2)}`);
                                                setLoading(false);
                                            });
                                        }}
                                    >
                                        Reintentar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Cyber Scanner - Panel de Control Futurista */}
                {!loading && !error && (
                    <section className="mb-5" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                        <div
                            className="cyber-scanner-header"
                            style={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '64rem', // max-w-4xl
                                margin: '0 auto 3rem auto',
                                padding: '2rem',
                                border: '1px solid rgba(6, 182, 212, 0.3)', // border-cyan-500/30
                                borderRadius: '0.5rem',
                                background: 'rgba(0, 0, 0, 0.4)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Efecto de Scanline (Línea que baja) */}
                            <div
                                className="animate-scanline"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to bottom, transparent, rgba(6, 182, 212, 0.1), transparent)',
                                    height: '20%',
                                    width: '100%',
                                    pointerEvents: 'none'
                                }}
                            ></div>

                            <div style={{ textAlign: 'center', position: 'relative', zIndex: 10 }}>
                                <h1
                                    className="glitch-title-cyber"
                                    data-text="SYSTEM: EVENTS"
                                    style={{
                                        fontSize: 'clamp(3rem, 7vw, 4.5rem)',
                                        fontWeight: '900',
                                        fontFamily: 'monospace',
                                        letterSpacing: '-0.05em',
                                        marginBottom: '1rem',
                                        position: 'relative'
                                    }}
                                >
                                    SYSTEM: EVENTS
                                </h1>
                                <p style={{
                                    color: 'rgba(162, 230, 255, 0.7)', // text-cyan-200/70
                                    marginTop: '1rem',
                                    fontFamily: 'monospace',
                                    fontSize: '0.875rem',
                                    letterSpacing: '0.3em',
                                    textTransform: 'uppercase'
                                }}>
                                    // Accediendo a la base de datos global...
                                </p>
                            </div>

                            {/* Esquinas decorativas */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '1rem',
                                height: '1rem',
                                borderTop: '2px solid #06b6d4',
                                borderLeft: '2px solid #06b6d4'
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                width: '1rem',
                                height: '1rem',
                                borderTop: '2px solid #06b6d4',
                                borderRight: '2px solid #06b6d4'
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '1rem',
                                height: '1rem',
                                borderBottom: '2px solid #06b6d4',
                                borderLeft: '2px solid #06b6d4'
                            }}></div>
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                right: 0,
                                width: '1rem',
                                height: '1rem',
                                borderBottom: '2px solid #06b6d4',
                                borderRight: '2px solid #06b6d4'
                            }}></div>
                        </div>
                    </section>
                )}

                {/* Sección de Filtros y Búsqueda - Glass Panel Unificado */}
                {!loading && !error && (
                    <section className="row justify-content-center" style={{ marginTop: '3rem', marginBottom: '3rem' }}>
                        <div className="col-lg-10">
                            <div className="filtros-container p-4" style={{
                                backdropFilter: 'blur(20px)',
                                WebkitBackdropFilter: 'blur(20px)',
                                background: 'rgba(0, 5, 10, 0.8)', // Casi negro, muy opaco
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderTop: '1px solid rgba(139, 92, 246, 0.5)',
                                borderRadius: '1rem',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                            }}>
                                <h3 className="mb-3 text-center">
                                    Busca tu evento
                                </h3>

                                {/* Barra de búsqueda */}
                                <div className="row g-3">
                                    <div className="col-md-12">
                                        <div className="input-group">
                                            <span className="input-group-text" style={{
                                                background: '#0a0a0a',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRight: 'none',
                                                color: '#e5e7eb'
                                            }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
                                                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                                </svg>
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Buscar eventos..."
                                                value={busqueda}
                                                onChange={(e) => setBusqueda(e.target.value)}
                                                style={{
                                                    background: '#0a0a0a',
                                                    color: '#e5e7eb', // text-gray-200
                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                    outline: 'none'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = 'rgba(168, 85, 247, 1)'; // focus:border-purple-500
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                                }}
                                            />
                                            {busqueda && (
                                                <button
                                                    className="btn"
                                                    onClick={() => setBusqueda('')}
                                                    style={{
                                                        background: 'rgba(22, 78, 99, 0.3)', // bg-cyan-900/30
                                                        border: '1px solid rgba(6, 182, 212, 0.5)', // border-cyan-500/50
                                                        color: '#22d3ee', // text-cyan-400
                                                        backdropFilter: 'blur(10px)',
                                                        WebkitBackdropFilter: 'blur(10px)',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.background = '#06b6d4'; // hover:bg-cyan-500
                                                        e.target.style.color = '#000000'; // hover:text-black
                                                        e.target.style.borderColor = '#06b6d4';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.background = 'rgba(22, 78, 99, 0.3)';
                                                        e.target.style.color = '#22d3ee';
                                                        e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                                                    }}
                                                >
                                                    Cerrar
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Filtros - Versión Compacta con Dark Mode Forzado */}
                                    <div className="col-md-4" style={{ position: 'relative' }}>
                                        <select
                                            className="form-select"
                                            value={filtroTipo}
                                            onChange={(e) => setFiltroTipo(e.target.value)}
                                            style={{
                                                background: '#0a0a0a',
                                                color: '#e5e7eb', // text-gray-200
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                outline: 'none',
                                                appearance: 'none', // Eliminar flecha nativa
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                                paddingRight: '2.5rem' // Espacio para flecha personalizada
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = 'rgba(168, 85, 247, 1)'; // focus:border-purple-500
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                        >
                                            <option key="todos-tipos" value="todos" style={{ background: '#0a0a0a' }}>Todos los tipos</option>
                                            {tiposDisponibles.map(tipo => (
                                                <option key={tipo} value={tipo} style={{ background: '#0a0a0a' }}>{tipo}</option>
                                            ))}
                                        </select>
                                        {/* Flecha personalizada SVG */}
                                        <svg
                                            style={{
                                                position: 'absolute',
                                                right: '0.75rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                pointerEvents: 'none',
                                                width: '1rem',
                                                height: '1rem',
                                                color: '#e5e7eb'
                                            }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    <div className="col-md-4" style={{ position: 'relative' }}>
                                        <select
                                            className="form-select"
                                            value={filtroCategoria}
                                            onChange={(e) => setFiltroCategoria(e.target.value)}
                                            style={{
                                                background: '#0a0a0a',
                                                color: '#e5e7eb', // text-gray-200
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                outline: 'none',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                                paddingRight: '2.5rem'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = 'rgba(168, 85, 247, 1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                        >
                                            <option key="todas-categorias" value="todos" style={{ background: '#0a0a0a' }}>Todas las categorías</option>
                                            {categoriasDisponibles.map(cat => (
                                                <option key={cat} value={cat} style={{ background: '#0a0a0a' }}>{cat}</option>
                                            ))}
                                        </select>
                                        {/* Flecha personalizada SVG */}
                                        <svg
                                            style={{
                                                position: 'absolute',
                                                right: '0.75rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                pointerEvents: 'none',
                                                width: '1rem',
                                                height: '1rem',
                                                color: '#e5e7eb'
                                            }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>

                                    <div className="col-md-4" style={{ position: 'relative' }}>
                                        <select
                                            className="form-select"
                                            value={ordenamiento}
                                            onChange={(e) => setOrdenamiento(e.target.value)}
                                            style={{
                                                background: '#0a0a0a',
                                                color: '#e5e7eb', // text-gray-200
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                outline: 'none',
                                                appearance: 'none',
                                                WebkitAppearance: 'none',
                                                MozAppearance: 'none',
                                                paddingRight: '2.5rem'
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.borderColor = 'rgba(168, 85, 247, 1)';
                                            }}
                                            onBlur={(e) => {
                                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                            }}
                                        >
                                            <option key="fecha" value="fecha" style={{ background: '#0a0a0a' }}>Más recientes</option>
                                            <option key="titulo" value="titulo" style={{ background: '#0a0a0a' }}>Nombre</option>
                                            <option key="precio-asc" value="precio-asc" style={{ background: '#0a0a0a' }}>Precio ↑</option>
                                            <option key="precio-desc" value="precio-desc" style={{ background: '#0a0a0a' }}>Precio ↓</option>
                                            <option key="cupos" value="cupos" style={{ background: '#0a0a0a' }}>Más cupos</option>
                                        </select>
                                        {/* Flecha personalizada SVG */}
                                        <svg
                                            style={{
                                                position: 'absolute',
                                                right: '0.75rem',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                pointerEvents: 'none',
                                                width: '1rem',
                                                height: '1rem',
                                                color: '#e5e7eb'
                                            }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Resultados y limpiar */}
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <span className="badge" style={{
                                        backgroundColor: '#000000',
                                        border: '1px solid #22c55e',
                                        color: '#4ade80',
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '0.125rem'
                                    }}>
                                        {eventosFiltrados.length} eventos
                                    </span>

                                    {(busqueda || filtroTipo !== 'todos' || filtroCategoria !== 'todos' || ordenamiento !== 'fecha') && (
                                        <button
                                            className="btn btn-sm"
                                            onClick={limpiarFiltros}
                                            style={{
                                                background: 'rgba(22, 78, 99, 0.3)', // bg-cyan-900/30
                                                border: '1px solid rgba(6, 182, 212, 0.5)', // border-cyan-500/50
                                                color: '#22d3ee', // text-cyan-400
                                                backdropFilter: 'blur(10px)',
                                                WebkitBackdropFilter: 'blur(10px)',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.background = '#06b6d4'; // hover:bg-cyan-500
                                                e.target.style.color = '#000000'; // hover:text-black
                                                e.target.style.borderColor = '#06b6d4';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.background = 'rgba(22, 78, 99, 0.3)';
                                                e.target.style.color = '#22d3ee';
                                                e.target.style.borderColor = 'rgba(6, 182, 212, 0.5)';
                                            }}
                                        >
                                            Limpiar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Sección Grid de Tarjetas 3D */}
                {!loading && !error && (
                    <section className="eventos-tarjetas-3d container py-4 my-4">
                        <div className="row gy-3 justify-content-center">
                            <h2 className="mb-3 text-center fw-bold" style={{ color: '#ffffff' }}>
                                {eventosFiltrados.length > 0 ? 'Todos los Eventos' : 'Sin resultados'}
                            </h2>
                            {eventosFiltrados.length > 0 ? (
                                <p className="mb-3 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    Haz click en las tarjetas para ver más detalles
                                </p>
                            ) : (
                                <p className="mb-3 text-center" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    No encontramos eventos.
                                    <button
                                        className="btn btn-link p-0 ms-1"
                                        onClick={limpiarFiltros}
                                        style={{ color: 'rgba(108, 99, 255, 0.8)' }}
                                    >
                                        Limpiar filtros
                                    </button>
                                </p>
                            )}
                        </div>

                        {/* Grid de eventos */}
                        <div id="contenedor-grid-eventos" className="row g-4 justify-content-center">
                            {eventosFiltrados.length > 0 ? (
                                eventosFiltrados.map((evento) => (
                                    <div
                                        key={evento.id}
                                        className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-4 d-flex justify-content-center align-items-stretch"
                                    >
                                        <EventCard evento={evento} />
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center py-5">
                                    <div className="sin-resultados">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" style={{ color: 'rgba(255, 255, 255, 0.5)' }} className="mb-3" viewBox="0 0 16 16">
                                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                                            <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z" />
                                        </svg>
                                        <h4 style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No hay eventos disponibles</h4>
                                        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Intenta ajustar tus filtros o búsqueda</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>

            <Footer />
        </>
    );
}

export default Eventos;
