// Separador Cyber con efecto neón y animación pulse
import { motion } from 'framer-motion';
import { memo } from 'react';

function CyberDivider() {
    return (
        <div style={{
            width: '100%',
            padding: '2rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        }}>
            {/* Línea gradiente */}
            <div style={{
                width: '100%',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #8B5CF6, #00F0FF, #8B5CF6, transparent)',
                position: 'relative',
                boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)'
            }} />

            {/* Rombo central animado */}
            <motion.div
                animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{
                    position: 'absolute',
                    width: '20px',
                    height: '20px',
                    background: 'linear-gradient(135deg, #8B5CF6, #00F0FF)',
                    transform: 'rotate(45deg)',
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
            />
        </div>
    );
}

export default memo(CyberDivider);
