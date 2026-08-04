// Call To Action Final - Estilo Cyberpunk épico
import { motion } from 'framer-motion';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CtaFinal() {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    const handleCrearEvento = () => {
        if (isLoggedIn()) {
            navigate('/admin'); // Panel de gestión de eventos (CRUD)
        } else {
            navigate('/auth', { state: { from: '/admin' } });
        }
    };

    return (
        <section style={{
            position: 'relative',
            padding: 'clamp(3rem, 6vw, 6rem) clamp(1rem, 2vw, 2rem)',
            background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
            borderTop: '1px solid rgba(139, 92, 246, 0.2)',
            borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
            overflow: 'hidden'
        }}>
            {/* Partículas de fondo animadas */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                opacity: 0.3
            }}>
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -100, 0],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        style={{
                            position: 'absolute',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: '2px',
                            height: '2px',
                            background: '#00F0FF',
                            borderRadius: '50%',
                            boxShadow: '0 0 10px #00F0FF'
                        }}
                    />
                ))}
            </div>

            {/* Contenido */}
            <div style={{
                maxWidth: '900px',
                margin: '0 auto',
                textAlign: 'center',
                position: 'relative',
                zIndex: 10
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 style={{
                        fontSize: 'clamp(2rem, 6vw, 4rem)',
                        fontWeight: '800',
                        marginBottom: '1.5rem',
                        background: 'linear-gradient(135deg, #ffffff, #00F0FF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        letterSpacing: '2px',
                        lineHeight: '1.2'
                    }}>
                        Crea tu propio universo
                    </h2>

                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                        color: 'rgba(255, 255, 255, 0.7)',
                        marginBottom: '3rem',
                        lineHeight: '1.6',
                        maxWidth: '600px',
                        margin: '0 auto 3rem'
                    }}>
                        Miles de personas están esperando tu próximo evento. Conéctate con ellos ahora.
                    </p>

                    {/* Botón gigante con efecto neón */}
                    <motion.button
                        onClick={handleCrearEvento}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                            fontWeight: '700',
                            padding: 'clamp(1rem, 2vw, 1.5rem) clamp(2rem, 4vw, 4rem)',
                            background: 'transparent',
                            color: '#00F0FF',
                            border: '2px solid #00F0FF',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 0 30px rgba(0, 240, 255, 0.3), inset 0 0 20px rgba(0, 240, 255, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(0, 240, 255, 0.1)';
                            e.target.style.boxShadow = '0 0 50px rgba(0, 240, 255, 0.6), inset 0 0 30px rgba(0, 240, 255, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.boxShadow = '0 0 30px rgba(0, 240, 255, 0.3), inset 0 0 20px rgba(0, 240, 255, 0.1)';
                        }}
                    >
                        CREAR MI EVENTO
                    </motion.button>

                    {/* Texto adicional */}
                    <p style={{
                        fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                        color: 'rgba(255, 255, 255, 0.5)',
                        marginTop: '2rem',
                        fontFamily: 'monospace'
                    }}>
                        {isLoggedIn() ? 'Tu audiencia te está esperando' : 'Únete a la galaxia de creadores'}
                    </p>
                </motion.div>
            </div>

            {/* Línea decorativa inferior */}
            <motion.div
                animate={{
                    opacity: [0.3, 0.7, 0.3]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #8B5CF6, #00F0FF, #8B5CF6, transparent)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
                }}
            />
        </section>
    );
}

export default memo(CtaFinal);
