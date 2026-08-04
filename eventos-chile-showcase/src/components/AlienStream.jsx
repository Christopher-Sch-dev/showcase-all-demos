// Alien Data Stream - Flujo infinito de baldosas holográficas
// Carrusel automático con efecto Marquee que muestra eventos como tiles cuadradas
// dev chris from scratch eventos chile
import { motion, useAnimation } from 'framer-motion';
import { memo, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AlienTile({ evento }) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        navigate(`/eventos/${evento.id}`);
    };

    // URL base del backend para imágenes
    const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '') + (import.meta.env.VITE_API_BASE_URL?.includes('/api/v1') ? '' : '/api/v1');

    // Obtener imagen o usar placeholder
    // Si evento.imagen es null o no empieza con http/data, construir URL del endpoint
    const imagenUrl = evento.imagen
        ? (evento.imagen.startsWith('http') || evento.imagen.startsWith('data:') ? evento.imagen : `${API_BASE_URL}/eventos/${evento.id}/imagen`)
        : `${API_BASE_URL}/eventos/${evento.id}/imagen`;

    return (
        <motion.div
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ scale: 1.05, y: -5 }}
            style={{
                position: 'relative',
                width: '280px',
                height: '280px',
                flexShrink: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                borderRadius: '8px',
                border: isHovered
                    ? '2px solid #00F0FF'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                transition: 'all 0.3s ease',
                boxShadow: isHovered
                    ? '0 0 30px rgba(0, 240, 255, 0.6)'
                    : '0 0 10px rgba(0, 0, 0, 0.5)',
                marginRight: '20px'
            }}
        >
            {/* Imagen de fondo con filtro o gradiente placeholder */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: imagenUrl
                        ? `url(${imagenUrl})`
                        : 'linear-gradient(135deg, #1a1a1a 0%, #2d1b4e 50%, #1a1a1a 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: isHovered ? 'grayscale(0) brightness(1)' : 'grayscale(1) brightness(0.4)',
                    transition: 'filter 0.4s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {/* Icono de evento si no hay imagen */}
                {!imagenUrl && (
                    <div style={{
                        fontSize: '4rem',
                        opacity: 0.3,
                        filter: 'none'
                    }}>

                    </div>
                )}
            </div>

            {/* Overlay con info - Aparece desde abajo al hover */}
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: isHovered ? '0%' : '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.7))',
                    padding: '1.5rem 1rem',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
            >
                <h3 style={{
                    color: '#00F0FF',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    lineHeight: '1.3',
                    fontFamily: 'system-ui, sans-serif',
                    textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                }}>
                    {evento.titulo}
                </h3>
                <p style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.85rem',
                    fontFamily: 'monospace',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <span></span> {evento.lugar || 'Ubicación no especificada'}
                </p>
            </motion.div>

            {/* Indicador de estado holográfico en esquina superior */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isHovered ? '#00F0FF' : 'rgba(255, 255, 255, 0.3)',
                boxShadow: isHovered ? '0 0 10px #00F0FF' : 'none',
                transition: 'all 0.3s ease'
            }} />
        </motion.div>
    );
}

function AlienStream({ title, events }) {
    const [isPaused, setIsPaused] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const controls = useAnimation();
    const autoScrollRef = useRef(null);
    const tileWidth = 300; // 280px width + 20px margin

    // Si no hay eventos, no renderizar nada
    if (!events || events.length === 0) {
        return null;
    }

    // Duplicar eventos para loop infinito perfecto
    const duplicatedEvents = [...events, ...events];

    // Auto-scroll effect
    useEffect(() => {
        if (!isPaused) {
            // Reiniciar animación automática
            autoScrollRef.current = setInterval(() => {
                setCurrentIndex((prev) => {
                    const next = prev + 1;
                    // Reset cuando llegamos al final del primer set
                    if (next >= events.length) {
                        return 0;
                    }
                    return next;
                });
            }, 2500); // Cambia cada 2.5 segundos - más dinámico
        } else {
            // Limpiar intervalo cuando está pausado
            if (autoScrollRef.current) {
                clearInterval(autoScrollRef.current);
            }
        }

        return () => {
            if (autoScrollRef.current) {
                clearInterval(autoScrollRef.current);
            }
        };
    }, [isPaused, events.length]);

    // Actualizar posición del carrusel
    useEffect(() => {
        controls.start({
            x: -(currentIndex * tileWidth),
            transition: {
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1]
            }
        });
    }, [currentIndex, controls, tileWidth]);

    // Navegación manual
    const handlePrev = () => {
        setIsPaused(true);
        setCurrentIndex((prev) => {
            if (prev === 0) {
                return events.length - 1;
            }
            return prev - 1;
        });
        // Reanudar auto-scroll después de 3 segundos
        setTimeout(() => setIsPaused(false), 3000);
    };

    const handleNext = () => {
        setIsPaused(true);
        setCurrentIndex((prev) => {
            if (prev >= events.length - 1) {
                return 0;
            }
            return prev + 1;
        });
        // Reanudar auto-scroll después de 3 segundos
        setTimeout(() => setIsPaused(false), 3000);
    };

    return (
        <section style={{
            width: '100%',
            overflow: 'hidden',
            paddingTop: '2rem',
            paddingBottom: '2rem',
            position: 'relative'
        }}>
            {/* Título de la sección */}
            <div style={{
                paddingLeft: 'clamp(1rem, 5vw, 3rem)',
                marginBottom: '1.5rem'
            }}>
                <h2 style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                    fontWeight: '800',
                    color: '#ffffff',
                    fontFamily: 'system-ui, sans-serif',
                    letterSpacing: '1px',
                    textShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
                }}>
                    {title}
                </h2>
            </div>

            {/* Contenedor del stream */}
            <div
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                style={{
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden'
                }}
            >
                {/* Botón navegación izquierda */}
                <motion.button
                    onClick={handlePrev}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 240, 255, 0.2)' }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 20,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '2px solid rgba(0, 240, 255, 0.5)',
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        color: '#00F0FF',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                        transition: 'all 0.3s ease',
                        fontWeight: 'bold'
                    }}
                    aria-label="Anterior"
                >
                    ‹
                </motion.button>

                {/* Botón navegación derecha */}
                <motion.button
                    onClick={handleNext}
                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 240, 255, 0.2)' }}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 20,
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '2px solid rgba(0, 240, 255, 0.5)',
                        background: 'rgba(0, 0, 0, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        color: '#00F0FF',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)',
                        transition: 'all 0.3s ease',
                        fontWeight: 'bold'
                    }}
                    aria-label="Siguiente"
                >
                    ›
                </motion.button>

                {/* Gradientes laterales para efecto fade */}
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '100px',
                    background: 'linear-gradient(to right, #050505, transparent)',
                    zIndex: 10,
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: '100px',
                    background: 'linear-gradient(to left, #050505, transparent)',
                    zIndex: 10,
                    pointerEvents: 'none'
                }} />

                {/* Stream animado */}
                <motion.div
                    animate={controls}
                    style={{
                        display: 'flex',
                        width: 'fit-content',
                        paddingLeft: '20px',
                        paddingRight: '20px'
                    }}
                >
                    {duplicatedEvents.map((evento, index) => (
                        <AlienTile key={`${evento.id}-${index}`} evento={evento} />
                    ))}
                </motion.div>
            </div>

            {/* Indicador de pausa y posición */}
            <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '0.5rem',
                zIndex: 20
            }}>
                {isPaused && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            color: '#00F0FF',
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            background: 'rgba(0, 0, 0, 0.8)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(0, 240, 255, 0.3)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)'
                        }}
                    >
                        ⏸ PAUSED
                    </motion.div>
                )}
                {/* Indicador de posición */}
                <div style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.7rem',
                    fontFamily: 'monospace',
                    background: 'rgba(0, 0, 0, 0.6)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}>
                    {currentIndex + 1} / {events.length}
                </div>
            </div>
        </section>
    );
}

export default memo(AlienStream);
