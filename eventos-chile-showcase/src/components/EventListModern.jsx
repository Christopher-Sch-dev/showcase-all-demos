// Lista de eventos moderna con efecto parallax estilo Clou Architects
// Integrado con datos reales del backend - Optimizado para móviles y todas las resoluciones
// Corregido: Usa useSpring como intermediario para evitar errores de useTransform

import { memo, useEffect, useRef, useState } from "react";

// Importar framer-motion con useSpring para suavizado y seguridad
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

import { Link } from "react-router-dom";
import Eventos from '../assets/eventosIMG.png';
import { formatearFecha } from "../services/helpers";
import { logger } from '../utils/logger';

// Hook para detectar móvil y reducir efectos pesados
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

const EventItem = memo(({ evento, index }) => {
    const ref = useRef(null);
    const isMobile = useIsMobile();

    // Reforzar useScroll con layoutEffect: false para evitar conflictos con SSR/Hydration
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"],
        layoutEffect: false // CRÍTICO: Evita problemas de hidratación
    });

    // Usar useSpring como intermediario (Suavizado + Seguridad)
    // Esto evita el error "t[r].get is not a function" porque useSpring siempre devuelve un MotionValue válido
    const scrollY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Reducir parallax en móviles para mejor rendimiento
    const parallaxAmount = isMobile ? 30 : 100;

    // Ahora transformar el valor suavizado (más seguro y profesional)
    const y = useTransform(scrollY, [0, 1], [parallaxAmount, -parallaxAmount]);
    const opacity = useTransform(scrollY, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

    // Usar imagen del evento o fallback
    const imagenUrl = evento.imagen || Eventos;

    return (
        <motion.div
            ref={ref}
            className="event-row-modern"
            // Verificación de renderizado: Estilos iniciales para garantizar que Framer lo maneje correctamente
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            // Aplicar opacity del parallax solo cuando el elemento esté en vista
            style={{ opacity: isMobile ? 1 : opacity }}
        >
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                padding: isMobile
                    ? 'clamp(1.5rem, 4vw, 2rem) clamp(1rem, 3vw, 1.5rem)'
                    : 'clamp(2rem, 4vw, 4rem) clamp(1rem, 2vw, 2rem)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '1.5rem' : '2rem'
            }}>
                <div style={{
                    flex: 1,
                    minWidth: isMobile ? '100%' : '300px',
                    width: isMobile ? '100%' : 'auto'
                }}>
                    <span style={{
                        color: '#6C63FF',
                        fontFamily: 'monospace',
                        fontSize: 'clamp(0.75rem, 1.2vw, 1rem)',
                        letterSpacing: '2px',
                        display: 'block',
                        marginBottom: '0.5rem'
                    }}>
                        0{index + 1} — {evento.categoria || 'Evento'}
                    </span>
                    <Link
                        to={`/eventos/${evento.id}`}
                        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                    >
                        <h2 style={{
                            fontSize: isMobile ? 'clamp(1.5rem, 6vw, 2.5rem)' : 'clamp(2rem, 4vw, 4rem)',
                            margin: '0.5rem 0',
                            fontWeight: '300',
                            lineHeight: '1.1',
                            cursor: 'pointer',
                            transition: 'color 0.3s ease',
                            wordBreak: 'break-word'
                        }}
                            onMouseEnter={(e) => !isMobile && (e.target.style.color = '#6C63FF')}
                            onMouseLeave={(e) => !isMobile && (e.target.style.color = 'white')}
                        >
                            {evento.titulo}
                        </h2>
                    </Link>
                    <p style={{
                        color: '#888',
                        fontSize: 'clamp(0.85rem, 1.1vw, 1.1rem)',
                        marginTop: '0.5rem',
                        lineHeight: '1.5'
                    }}>
                        {formatearFecha(evento.fecha)}<br />
                        {evento.lugar}
                    </p>
                    <p style={{
                        color: '#aaa',
                        fontSize: 'clamp(0.8rem, 1vw, 1rem)',
                        marginTop: '0.5rem'
                    }}>
                        {evento.totalAsistentes || 0}/{evento.capacidad} | {evento.precio === 0 ? 'Gratis' : `$${evento.precio.toLocaleString('es-CL')}`}
                    </p>
                </div>

                {/* Contenedor de imagen Parallax - Optimizado para móviles */}
                <div style={{
                    width: isMobile ? '100%' : 'clamp(300px, 400px, 500px)',
                    height: isMobile ? 'clamp(200px, 40vw, 250px)' : 'clamp(200px, 250px, 300px)',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    flexShrink: 0,
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    order: isMobile ? -1 : 0 // Imagen primero en móvil
                }}>
                    <motion.img
                        src={imagenUrl}
                        alt={evento.titulo}
                        loading="lazy" // Lazy loading nativo
                        style={{
                            y: isMobile ? 0 : y, // Sin parallax en móvil
                            width: '100%',
                            height: '120%',
                            objectFit: 'cover',
                            cursor: 'pointer'
                        }}
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = Eventos;
                        }}
                        onClick={() => window.location.href = `/eventos/${evento.id}`}
                    />
                </div>
            </div>
        </motion.div>
    );
});

EventItem.displayName = 'EventItem';

function EventListModern({ eventos = [] }) {
    if (!eventos || eventos.length === 0) {
        logger.warn('EventListModern: No hay eventos para mostrar');
        return (
            <section style={{
                background: '#050505',
                padding: '5rem 0',
                minHeight: '50vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.5rem', color: '#888' }}>
                        No hay eventos disponibles en este momento
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section style={{
            background: '#050505',
            padding: 'clamp(3rem, 5vw, 5rem) 0',
            position: 'relative'
        }}>
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '0 clamp(1rem, 2vw, 2rem)'
            }}>
                {eventos.map((evt, i) => (
                    <EventItem key={evt.id || i} evento={evt} index={i} />
                ))}
            </div>
        </section>
    );
}

// Optimización: Memoizar EventListModern para evitar re-renders cuando eventos no cambian
export default memo(EventListModern);

