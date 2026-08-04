/**
 * MathPreloader - BREAKCORE EDITION
 * 
 * Efectos que ROMPEN LA MATRIX:
 * - Nebulosas breathing
 * - Ondas expansivas
 * - Túnel hiperespacial
 * - Partículas fluyendo
 * - Geometría fractal
 * - GLITCH: Screen tear, RGB split, static noise
 * - TEXTO ANIMADO: Letras explotando en espiral
 * - PORTAL: Distorsión dimensional
 * - VHS Lines: Tracking retro
 * 
 * Props:
 * - progress: número 0-100
 * - onComplete: callback cuando termina
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    generateStars,
    generateWaves,
    generateTunnelLines,
    generateFlowParticles,
    generateOrbitalParticles,
    renderBackground,
    renderStarfield,
    renderExpandingWaves,
    renderHyperspaceTunnel,
    renderFlowParticles,
    renderHolographicGrid,
    renderFractalGeometry,
    renderOrbitalParticles,
    renderProgressHUD
} from './MandalaRenderer.js';

import {
    renderScreenTear,
    renderVHSLines,
    renderDimensionFracture,
    renderQuantumSnakeText,
    renderSecondarySnakeText,
    renderOrbitalText,
    renderPortalDistortion,
    renderGlitchFrame,
    renderEnergyFlash
} from './glitchEffects.js';

// Configuración BREAKCORE INTENSO
const CONFIG = {
    starCount: 600,
    waveCount: 15,
    tunnelLines: 120,
    flowParticles: 250,
    orbitalParticles: 150,
    fadeOutDuration: 1500,
    exitZoomDuration: 1000
};

// Textos que se animan
const ANIMATED_TEXTS = [
    "EVENTOS",
    "CHILE",
    "PORTAL",
    "DIMENSIONAL"
];

/**
 * Hook para detección de móvil
 */
function useIsMobile() {
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
}

export default function MathPreloader({ progress = 0, onComplete }) {
    const canvasRef = useRef(null);
    const offscreenCanvasRef = useRef(null);
    const animationRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const exitStartRef = useRef(null);

    // Referencias a elementos generados
    const starsRef = useRef([]);
    const wavesRef = useRef([]);
    const tunnelLinesRef = useRef([]);
    const flowParticlesRef = useRef([]);
    const orbitalParticlesRef = useRef([]);

    const [isExiting, setIsExiting] = useState(false);
    const [opacity, setOpacity] = useState(1);
    const [exitScale, setExitScale] = useState(1);
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const isMobile = useIsMobile();

    // Cambiar texto animado
    useEffect(() => {
        const textInterval = setInterval(() => {
            setCurrentTextIndex(prev => (prev + 1) % ANIMATED_TEXTS.length);
        }, 1200);
        return () => clearInterval(textInterval);
    }, []);

    // Inicializar elementos
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const width = window.innerWidth;
        const height = window.innerHeight;

        // Crear canvas offscreen para efectos de post-procesamiento
        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        offscreenCanvasRef.current = offscreen;

        const factor = isMobile ? 0.5 : 1;

        starsRef.current = generateStars(Math.floor(CONFIG.starCount * factor), width, height);
        wavesRef.current = generateWaves(CONFIG.waveCount);
        tunnelLinesRef.current = generateTunnelLines(Math.floor(CONFIG.tunnelLines * factor));
        flowParticlesRef.current = generateFlowParticles(Math.floor(CONFIG.flowParticles * factor), width, height);
        orbitalParticlesRef.current = generateOrbitalParticles(
            Math.floor(CONFIG.orbitalParticles * factor),
            isMobile ? 100 : 200,
            isMobile ? 220 : 400
        );
    }, [isMobile]);

    // Loop de animación BREAKCORE
    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        const offscreen = offscreenCanvasRef.current;
        if (!canvas || !offscreen) return;

        const ctx = canvas.getContext('2d');
        const offCtx = offscreen.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const time = Date.now() - startTimeRef.current;
        const maxRadius = Math.max(width, height) * 0.6;

        // Escala responsive
        const minDim = Math.min(width, height);
        const scale = isMobile ? minDim / 600 : minDim / 800;

        // === RENDERIZAR A CANVAS OFFSCREEN ===
        offCtx.clearRect(0, 0, width, height);

        // CAPA 1: Fondo
        renderBackground(offCtx, width, height, time);

        // CAPA 2: Grid holográfico
        renderHolographicGrid(offCtx, width, height, time, progress);

        // CAPA 3: Estrellas
        renderStarfield(offCtx, starsRef.current, time);

        // CAPA 4: Ondas expansivas (MÁS INTENSAS)
        renderExpandingWaves(offCtx, wavesRef.current, cx, cy, time, maxRadius);

        // CAPA 5: Túnel hiperespacial
        renderHyperspaceTunnel(offCtx, tunnelLinesRef.current, cx, cy, time, maxRadius, progress);

        // CAPA 6: Partículas fluyendo
        renderFlowParticles(offCtx, flowParticlesRef.current, cx, cy, width, height, time, progress);

        // CAPA 7: Portal distorsión (NUEVO)
        renderPortalDistortion(offCtx, cx, cy, time, progress);

        // CAPA 8: Fractura dimensional (NUEVO)
        renderDimensionFracture(offCtx, cx, cy, time, progress);

        // CAPA 9: Geometría fractal central
        offCtx.save();
        if (isExiting) {
            offCtx.translate(cx, cy);
            offCtx.scale(exitScale, exitScale);
            offCtx.translate(-cx, -cy);
        }
        renderFractalGeometry(offCtx, cx, cy, time, progress, scale);
        offCtx.restore();

        // CAPA 10: Partículas orbitales
        renderOrbitalParticles(offCtx, orbitalParticlesRef.current, cx, cy, time, progress, scale);

        // CAPA 11: TEXTO SERPIENTE CUÁNTICA PRINCIPAL (NOTORIO)
        renderQuantumSnakeText(offCtx, ANIMATED_TEXTS[currentTextIndex], width, height, time, progress);

        // CAPA 12: TEXTO SERPIENTE SECUNDARIO (movimiento inverso)
        renderSecondarySnakeText(offCtx, "EVENTOS CHILE", width, height, time, progress);

        // CAPA 13: TEXTO ORBITAL (electrones)
        renderOrbitalText(offCtx, "PORTALWEB", width, height, time, progress);

        // CAPA 13: HUD de progreso
        if (!isExiting) {
            renderProgressHUD(offCtx, cx, cy, progress, time);
        }

        // === APLICAR EFECTOS GLITCH AL CANVAS PRINCIPAL ===
        ctx.clearRect(0, 0, width, height);

        // Aplicar screen tear con intensidad variable según progreso
        const tearIntensity = 0.2 + (progress / 100) * 0.4;
        if (progress > 20 && Math.random() < 0.3) {
            renderScreenTear(ctx, offscreen, time, tearIntensity);
        } else {
            ctx.drawImage(offscreen, 0, 0);
        }

        // VHS Lines siempre activas
        renderVHSLines(ctx, width, height, time);

        // Glitch frame aleatorio
        if (progress > 30) {
            renderGlitchFrame(ctx, time);
        }

        // Energy flash en momentos clave
        const flashMoments = [25, 50, 75, 95];
        const isFlashMoment = flashMoments.some(m => progress >= m && progress < m + 2);
        renderEnergyFlash(ctx, cx, cy, time, isFlashMoment);

        // Flash de salida épico
        if (isExiting && exitStartRef.current) {
            const exitElapsed = Date.now() - exitStartRef.current;
            const flashIntensity = Math.max(0, 1 - exitElapsed / 500);
            if (flashIntensity > 0) {
                const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 1.5);
                gradient.addColorStop(0, `rgba(255, 255, 255, ${flashIntensity})`);
                gradient.addColorStop(0.2, `rgba(108, 99, 255, ${flashIntensity * 0.8})`);
                gradient.addColorStop(0.5, `rgba(0, 240, 255, ${flashIntensity * 0.5})`);
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
            }
        }

        animationRef.current = requestAnimationFrame(animate);
    }, [progress, isMobile, isExiting, exitScale, currentTextIndex]);

    // Resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            if (offscreenCanvasRef.current) {
                offscreenCanvasRef.current.width = canvas.width;
                offscreenCanvasRef.current.height = canvas.height;
            }

            const factor = isMobile ? 0.5 : 1;
            starsRef.current = generateStars(Math.floor(CONFIG.starCount * factor), canvas.width, canvas.height);
            flowParticlesRef.current = generateFlowParticles(Math.floor(CONFIG.flowParticles * factor), canvas.width, canvas.height);
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    // Iniciar animación
    useEffect(() => {
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate]);

    // Transición de salida ÉPICA
    useEffect(() => {
        if (progress >= 100 && !isExiting) {
            setIsExiting(true);
            exitStartRef.current = Date.now();

            const exitStart = Date.now();
            const exitInterval = setInterval(() => {
                const elapsed = Date.now() - exitStart;

                const zoomProgress = Math.min(elapsed / CONFIG.exitZoomDuration, 1);
                const easeOut = 1 - Math.pow(1 - zoomProgress, 3);
                setExitScale(1 + easeOut * 4);

                if (elapsed > CONFIG.exitZoomDuration * 0.2) {
                    const fadeProgress = (elapsed - CONFIG.exitZoomDuration * 0.2) / (CONFIG.fadeOutDuration * 0.8);
                    setOpacity(Math.max(0, 1 - fadeProgress));
                }

                if (elapsed >= CONFIG.fadeOutDuration) {
                    clearInterval(exitInterval);
                    setOpacity(0);
                    if (onComplete) {
                        onComplete();
                    }
                }
            }, 16);

            return () => clearInterval(exitInterval);
        }
    }, [progress, isExiting, onComplete]);

    // Texto de estado
    const getStatusText = () => {
        if (progress < 15) return "◈ ABRIENDO PORTAL ◈";
        if (progress < 30) return "◈ ROMPIENDO DIMENSIONES ◈";
        if (progress < 50) return "◈ SINCRONIZANDO REALIDADES ◈";
        if (progress < 70) return "◈ CALIBRANDO MATRIX ◈";
        if (progress < 90) return "◈ ESTABILIZANDO CONEXIÓN ◈";
        return "◈ ¡BIENVENIDO! ◈";
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 9999,
                opacity,
                pointerEvents: isExiting ? 'none' : 'auto',
                backgroundColor: '#050505',
                overflow: 'hidden'
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    display: 'block',
                    width: '100%',
                    height: '100%'
                }}
            />

            {/* Texto de estado con glitch */}
            {!isExiting && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: isMobile ? '6%' : '8%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        textAlign: 'center',
                        color: '#fff',
                        fontFamily: '"Share Tech Mono", monospace',
                        fontSize: isMobile ? '14px' : '18px',
                        letterSpacing: '4px',
                        textTransform: 'uppercase',
                        textShadow: `
                            0 0 10px rgba(108, 99, 255, 0.8),
                            0 0 20px rgba(0, 240, 255, 0.6),
                            0 0 40px rgba(255, 0, 255, 0.4),
                            3px 0 0 rgba(255, 0, 0, 0.5),
                            -3px 0 0 rgba(0, 255, 255, 0.5)
                        `,
                        animation: 'glitchText 0.3s infinite'
                    }}
                >
                    {getStatusText()}
                </div>
            )}

            {/* Overlay de efectos */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
                    pointerEvents: 'none',
                    opacity: 0.4
                }}
            />

            {/* Viñeta */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.6) 100%)',
                    pointerEvents: 'none'
                }}
            />

            {/* CSS para animaciones */}
            <style>{`
                @keyframes glitchText {
                    0%, 100% { 
                        transform: translateX(-50%) skewX(0deg);
                        filter: hue-rotate(0deg);
                    }
                    20% { 
                        transform: translateX(-48%) skewX(-2deg);
                        filter: hue-rotate(10deg);
                    }
                    40% { 
                        transform: translateX(-52%) skewX(2deg);
                        filter: hue-rotate(-10deg);
                    }
                    60% { 
                        transform: translateX(-50%) skewX(0deg);
                        filter: hue-rotate(5deg);
                    }
                    80% { 
                        transform: translateX(-51%) skewX(-1deg);
                        filter: hue-rotate(-5deg);
                    }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}
