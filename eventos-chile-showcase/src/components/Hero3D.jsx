// Hero 3D Interactivo estilo 109ichiki
// Optimizado para móviles y todas las resoluciones: desactiva 3D pesado en dispositivos móviles
import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from "react";
import { logger } from '../utils/logger';

// Hook para detectar si es móvil
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const isMobileDevice = window.innerWidth < 768 ||
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            setIsMobile(isMobileDevice);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

// Giroscopio Quantum - 3 anillos concéntricos girando en diferentes ejes
function QuantumGyroscope() {
    const outerRing = useRef();
    const middleRing = useRef();
    const innerRing = useRef();

    useFrame((state, delta) => {
        // Anillo Exterior: Rotación en eje X
        if (outerRing.current) {
            outerRing.current.rotation.x += delta * 0.3;
        }
        // Anillo Medio: Rotación en eje Y
        if (middleRing.current) {
            middleRing.current.rotation.y += delta * 0.4;
        }
        // Anillo Interior: Rotación en eje Z
        if (innerRing.current) {
            innerRing.current.rotation.z += delta * 0.5;
        }
    });

    return (
        <group>
            {/* Anillo Exterior - Cyan Neon */}
            <mesh ref={outerRing} position={[0, 0, 0]}>
                <torusGeometry args={[3, 0.15, 16, 100]} />
                <meshBasicMaterial
                    wireframe={true}
                    color="#00f0ff" // Cyan Neon
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Anillo Medio - Magenta Neon */}
            <mesh ref={middleRing} position={[0, 0, 0]}>
                <torusGeometry args={[2.3, 0.12, 16, 100]} />
                <meshBasicMaterial
                    wireframe={true}
                    color="#ff00ff" // Magenta Neon
                    transparent
                    opacity={0.8}
                />
            </mesh>

            {/* Anillo Interior - Blanco brillante */}
            <mesh ref={innerRing} position={[0, 0, 0]}>
                <torusGeometry args={[1.6, 0.1, 16, 100]} />
                <meshBasicMaterial
                    wireframe={true}
                    color="#ffffff" // Blanco brillante
                    transparent
                    opacity={0.9}
                />
            </mesh>
        </group>
    );
}

export default function Hero3D() {
    const isMobile = useIsMobile();
    const [use3D, setUse3D] = useState(!isMobile);

    useEffect(() => {
        // En móviles, desactivar 3D pesado para mejor rendimiento
        if (isMobile) {
            setUse3D(false);
        } else {
            // Verificar si WebGL está disponible
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (!gl) {
                    setUse3D(false);
                    logger.warn('Hero3D: WebGL no disponible, usando fallback');
                } else {
                    setUse3D(true);
                }
            } catch (e) {
                setUse3D(false);
                logger.warn('Hero3D: Error al verificar WebGL, usando fallback');
            }
        }
    }, [isMobile]);

    // OPTIMIZACIÓN: Calcular valores de render una vez con useMemo
    const canvasConfig = useMemo(() => {
        const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

        return {
            antialias: width >= 1024, // Solo antialiasing en pantallas grandes
            dpr: [1, Math.min(dpr, width >= 1920 ? 2 : 1.5)] // DPR adaptativo según resolución
        };
    }, []); // Sin dependencias - se calcula una vez al montar

    try {
        return (
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                minHeight: '600px',
                background: 'transparent', // Transparente para que se vea el SpaceWarp
                overflow: 'hidden'
            }}>
                {/* Canvas 3D al fondo (z-index: 0) - Decoración atmosférica */}
                {use3D ? (
                    <Canvas
                        camera={{ position: [0, 0, 7], fov: 45 }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 0,
                            opacity: 0.4 // Baja opacidad para que no tape el texto
                        }}
                        gl={{
                            antialias: canvasConfig.antialias,
                            alpha: true,
                            powerPreference: 'low-power', // Cambiar a low-power para evitar context lost
                            stencil: false,
                            depth: true,
                            preserveDrawingBuffer: false
                        }}
                        dpr={canvasConfig.dpr}
                        onCreated={({ gl }) => {
                            // Manejo de WebGL Context Lost/Restored
                            const handleContextLost = (event) => {
                                event.preventDefault();
                                logger.warn('[Hero3D] WebGL Context Lost - Intentando restaurar...');
                            };

                            const handleContextRestored = () => {
                                logger.debug('[Hero3D] WebGL Context Restored');
                            };

                            const canvas = gl.domElement;
                            canvas.addEventListener('webglcontextlost', handleContextLost);
                            canvas.addEventListener('webglcontextrestored', handleContextRestored);

                            // Cleanup
                            return () => {
                                canvas.removeEventListener('webglcontextlost', handleContextLost);
                                canvas.removeEventListener('webglcontextrestored', handleContextRestored);
                            };
                        }}
                    >
                        <ambientLight intensity={0.3} />
                        {/* PointLights de colores para pintar el fondo y dar profundidad */}
                        <pointLight position={[-5, 2, 5]} color="#00f0ff" intensity={1.5} distance={10} />
                        <pointLight position={[5, 2, 5]} color="#ff00ff" intensity={1.5} distance={10} />
                        <pointLight position={[0, -3, 5]} color="#9d4edd" intensity={1} distance={8} />

                        {/* Giroscopio Quantum - 3 anillos concéntricos detrás del texto */}
                        <QuantumGyroscope />
                    </Canvas>
                ) : null}

                {/* Texto principal ENCIMA del 3D (z-index: 10) - Protagonista */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    zIndex: 10,
                    pointerEvents: 'none',
                    width: '100%',
                    padding: '0 1rem'
                }}>
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 12rem)',
                        lineHeight: '0.8',
                        fontWeight: '900',
                        margin: 0,
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                    }}>
                        {/* EVENTOS en outline - Animación desde la izquierda (MÁS LENTA) */}
                        <motion.span
                            style={{
                                WebkitTextStroke: '3px #ffffff',
                                WebkitTextFillColor: 'transparent',
                                textShadow: 'none',
                                display: 'inline-block'
                            }}
                            initial={{ x: '-100vw', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                type: 'tween',
                                ease: [0.25, 0.1, 0.25, 1], // Cubic bezier suave sin rebote
                                duration: 1.2 // Duración óptima para ver el movimiento
                            }}
                        >
                            EVENTOS
                        </motion.span>
                        <br />
                        {/* CHILE en relleno sólido blanco - Animación desde la derecha (MÁS LENTA) */}
                        <motion.span
                            style={{
                                color: '#ffffff',
                                textShadow: '0 0 30px rgba(108, 99, 255, 0.5)',
                                display: 'inline-block'
                            }}
                            initial={{ x: '100vw', opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{
                                type: 'tween',
                                ease: [0.25, 0.1, 0.25, 1], // Cubic bezier suave sin rebote
                                duration: 1.2, // Misma duración que EVENTOS para sincronía
                                delay: 0.3 // Delay para efecto secuencial elegante
                            }}
                        >
                            CHILE
                        </motion.span>
                    </h1>
                </div>

                {/* Fallback visual para móviles o sin WebGL */}
                {!use3D && (
                    // Fallback visual para móviles o sin WebGL
                    <div style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{
                            width: 'clamp(200px, 40vw, 400px)',
                            height: 'clamp(200px, 40vw, 400px)',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.3) 0%, rgba(159, 122, 234, 0.3) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'pulse 3s ease-in-out infinite',
                            boxShadow: '0 0 100px rgba(108, 99, 255, 0.5)'
                        }}>
                            <div style={{
                                width: '80%',
                                height: '80%',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(108, 99, 255, 0.5) 0%, rgba(159, 122, 234, 0.5) 100%)',
                                animation: 'pulse 2s ease-in-out infinite reverse'
                            }} />
                        </div>
                        <style>{`
                            @keyframes pulse {
                                0%, 100% { transform: scale(1); opacity: 0.8; }
                                50% { transform: scale(1.1); opacity: 1; }
                            }
                        `}</style>
                    </div>
                )}

                <div style={{
                    position: 'absolute',
                    bottom: 'clamp(30px, 5vh, 50px)',
                    width: '100%',
                    textAlign: 'center',
                    color: 'white',
                    textTransform: 'uppercase',
                    letterSpacing: 'clamp(2px, 0.5vw, 4px)',
                    fontSize: 'clamp(10px, 1.2vw, 14px)',
                    zIndex: 2,
                    pointerEvents: 'none',
                    padding: '0 1rem'
                }}>
                    Scroll para descubrir
                </div>
            </div>
        );
    } catch (error) {
        logger.error('Error en Hero3D:', error);
        // Fallback si Three.js falla
        return (
            <div style={{
                position: 'relative',
                width: '100%',
                height: '100vh',
                minHeight: '600px',
                background: 'transparent', // Transparente para que se vea el SpaceWarp
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: '0 1rem'
            }}>
                <h1 style={{
                    fontSize: 'clamp(2.5rem, 8vw, 10rem)',
                    fontWeight: '900',
                    textAlign: 'center'
                }}>
                    EVENTOS CHILE
                </h1>
            </div>
        );
    }
}

