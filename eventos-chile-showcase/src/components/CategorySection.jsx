// Sección de categoría con scroll horizontal estilo Netflix
import { motion } from 'framer-motion';
import { memo } from 'react';
import '../styles/category-section.css';
import EventCard from './EventCard';

function CategorySection({ title, events = [] }) {
    if (!events || events.length === 0) return null;

    return (
        <section style={{
            padding: '2rem 0',
            position: 'relative'
        }}>
            {/* Título de categoría con efecto glitch */}
            <motion.h2
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                style={{
                    fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                    fontWeight: '700',
                    marginBottom: '2rem',
                    marginLeft: 'clamp(1rem, 2vw, 2rem)',
                    background: 'linear-gradient(135deg, #8B5CF6, #00F0FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textShadow: '0 0 30px rgba(139, 92, 246, 0.5)',
                    letterSpacing: '1px'
                }}
            >
                {title}
            </motion.h2>

            {/* Contenedor scrolleable horizontal */}
            <div
                style={{
                    display: 'flex',
                    gap: '2rem',
                    overflowX: 'auto',
                    overflowY: 'visible',
                    paddingLeft: 'clamp(1rem, 2vw, 2rem)',
                    paddingRight: 'clamp(1rem, 2vw, 2rem)',
                    paddingTop: '1rem',
                    paddingBottom: '3rem',
                    scrollBehavior: 'smooth',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    WebkitOverflowScrolling: 'touch'
                }}
                className="category-scroll-container"
            >
                {events.map((evento, index) => (
                    <motion.div
                        key={evento.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        style={{
                            minWidth: '320px',
                            maxWidth: '320px',
                            flexShrink: 0
                        }}
                    >
                        <EventCard evento={evento} />
                    </motion.div>
                ))}
            </div>

            {/* Indicador de scroll (opcional) */}
            <div style={{
                textAlign: 'center',
                marginTop: '1rem',
                color: 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem',
                fontFamily: 'monospace'
            }}>
                ← Desliza para ver más →
            </div>
        </section>
    );
}

export default memo(CategorySection);
