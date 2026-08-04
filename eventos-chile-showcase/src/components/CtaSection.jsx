// CTA Section estilo Chirpley con efectos neón y glow - Optimizado para móviles y todas las resoluciones

// Verificar React antes de importar framer-motion
import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { logger } from '../utils/logger';

// Logs de debug solo en desarrollo
if (import.meta.env.DEV) {
    logger.debug('[CtaSection] Iniciando importaciones del módulo...');
    logger.debug('[CtaSection] React completo importado:', typeof React !== 'undefined' ? 'SI' : 'NO');
    logger.debug('[CtaSection] React.useLayoutEffect:', typeof React.useLayoutEffect !== 'undefined' ? 'DISPONIBLE' : 'NO DISPONIBLE');

    if (typeof React.useLayoutEffect === 'undefined') {
        logger.error('[CtaSection] ERROR CRÍTICO: React.useLayoutEffect NO está disponible');
        logger.error('[CtaSection] React object:', React);
        logger.error('[CtaSection] React keys:', Object.keys(React));
    }

    logger.debug('[CtaSection] framer-motion importado');
    logger.debug('[CtaSection] motion disponible:', typeof motion !== 'undefined' ? 'SI' : 'NO');
    logger.debug('[CtaSection] Todas las importaciones completadas');
}

export default function CtaSection() {
    console.log('[CtaSection] Componente renderizando...');
    console.log('[CtaSection] motion disponible:', typeof motion !== 'undefined' ? 'SI' : 'NO');
    return (
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{
                position: 'relative',
                width: '100%',
                padding: 'clamp(4rem, 8vw, 8rem) clamp(2rem, 4vw, 4rem)',
                background: 'linear-gradient(135deg, #1a0033 0%, #2d1b4e 50%, #1a0033 100%)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: 'white',
                minHeight: '60vh'
            }}
        >
            {/* Fondo animado con gradiente */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle at 50% 50%, rgba(108, 99, 255, 0.3) 0%, transparent 70%)',
                    animation: 'pulse 4s ease-in-out infinite',
                    pointerEvents: 'none'
                }}
            />

            {/* Noise texture overlay (opcional, estilo 109ichiki) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 400 400\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.05\'/%3E%3C/svg%3E")',
                    opacity: 0.3,
                    pointerEvents: 'none'
                }}
            />

            <motion.div
                initial={{ scale: 0.9 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ position: 'relative', zIndex: 1 }}
            >
                <h2 style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                    fontWeight: '700',
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, #ffffff 0%, #6C63FF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    ¿Listo para crear tu evento?
                </h2>

                <p style={{
                    fontSize: 'clamp(1rem, 1.5vw, 1.3rem)',
                    color: '#aaa',
                    marginBottom: '3rem',
                    maxWidth: '600px',
                    margin: '0 auto 3rem auto',
                    lineHeight: '1.6'
                }}>
                    Únete a nuestra plataforma y descubre eventos increíbles o crea el tuyo propio.
                    Conecta con personas que comparten tus intereses.
                </p>

                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to="/eventos"
                            style={{
                                display: 'inline-block',
                                padding: 'clamp(1rem, 1.5vw, 1.5rem) clamp(2rem, 3vw, 3rem)',
                                background: 'linear-gradient(135deg, #6C63FF 0%, #9F7AEA 100%)',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '50px',
                                fontSize: 'clamp(1rem, 1.2vw, 1.2rem)',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                position: 'relative',
                                overflow: 'hidden',
                                boxShadow: '0 10px 40px rgba(108, 99, 255, 0.4)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.boxShadow = '0 15px 50px rgba(108, 99, 255, 0.6)';
                                e.target.style.filter = 'brightness(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.boxShadow = '0 10px 40px rgba(108, 99, 255, 0.4)';
                                e.target.style.filter = 'brightness(1)';
                            }}
                        >
                            <span style={{ position: 'relative', zIndex: 1 }}>
                                Explorar Eventos
                            </span>
                            {/* Efecto de brillo deslizante */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)'
                                }}
                                animate={{
                                    left: ['-100%', '100%']
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    repeatDelay: 3
                                }}
                            />
                        </Link>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link
                            to="/auth"
                            style={{
                                display: 'inline-block',
                                padding: 'clamp(1rem, 1.5vw, 1.5rem) clamp(2rem, 3vw, 3rem)',
                                background: 'transparent',
                                color: 'white',
                                textDecoration: 'none',
                                borderRadius: '50px',
                                fontSize: 'clamp(1rem, 1.2vw, 1.2rem)',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                border: '2px solid #6C63FF',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(108, 99, 255, 0.1)';
                                e.target.style.borderColor = '#9F7AEA';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'transparent';
                                e.target.style.borderColor = '#6C63FF';
                            }}
                        >
                            Crear Cuenta
                        </Link>
                    </motion.div>
                </div>
            </motion.div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.1); }
                }
            `}</style>
        </motion.section>
    );
}

