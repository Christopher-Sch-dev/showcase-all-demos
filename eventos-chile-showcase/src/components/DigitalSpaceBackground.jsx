import { useEffect, useRef, useState } from 'react';

// Fondo Global "Digital Space Rain"
// Lluvia de código/estrellas sutil para todo el sitio
// Optimizado para bajo consumo de CPU (30 FPS, baja densidad)

export default function DigitalSpaceBackground() {
    const canvasRef = useRef(null);
    const [glitchActive, setGlitchActive] = useState(false);
    const glitchActiveRef = useRef(false); // Ref para acceso dentro del loop de animación

    // Lógica para activar el Glitch "Cyberpunk Matrix" (Cada 3.5s, dura 2s)
    useEffect(() => {
        let timeoutLoop;
        let timeoutDuration;

        const triggerGlitch = () => {
            // Intervalo: Exactamente cada 3.5 segundos (3500ms)
            timeoutLoop = setTimeout(() => {
                setGlitchActive(true);
                glitchActiveRef.current = true;

                // Duración: Exactamente 2 segundos
                timeoutDuration = setTimeout(() => {
                    setGlitchActive(false);
                    glitchActiveRef.current = false;
                    triggerGlitch(); // Siguiente ciclo
                }, 2000);

            }, 3500);
        };

        triggerGlitch();

        return () => {
            clearTimeout(timeoutLoop);
            clearTimeout(timeoutDuration);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        let animationId;

        // Configuración Normal
        const config = {
            fps: 30,
            chars: "1010░▒▓█<>/[]*•.⚡",
            colors: ['#8B5CF6', '#00F0FF', '#ffffff', '#FF0055'], // Paleta Base
            fontSize: 16,
            density: 0.95,
            fadeSpeed: 0.08
        };

        // Paleta Glitch Cyberpunk Matrix
        const glitchColors = ['#00FF00', '#ADFF2F', '#FF00FF', '#FFFF00', '#00FFFF'];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const columns = Math.ceil(canvas.width / config.fontSize);
        const drops = new Array(columns).fill(1);

        let lastTime = 0;
        const interval = 1000 / config.fps;

        const draw = (currentTime) => {
            animationId = requestAnimationFrame(draw);

            if (currentTime - lastTime < interval) return;
            lastTime = currentTime;

            // Determinar estado actual (Normal vs Glitch)
            const isGlitch = glitchActiveRef.current;

            // Fade: Si hay glitch, el fade es más agresivo (o de otro color)
            ctx.fillStyle = isGlitch
                ? `rgba(0, 20, 0, 0.2)` // Tinte verdoso Matrix durante glitch
                : `rgba(5, 5, 10, ${config.fadeSpeed})`;

            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `bold ${config.fontSize}px monospace`;
            ctx.textAlign = 'center';

            // Glow Effect
            if (isGlitch) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = "#00FF00"; // Glow Matrix
            } else {
                ctx.shadowBlur = 4;
                ctx.shadowColor = "#6C63FF";
            }

            // Seleccionar paleta de colores activa
            const activeColors = isGlitch ? glitchColors : config.colors;

            for (let i = 0; i < drops.length; i++) {
                if (Math.random() > 0.85) continue;

                const color = activeColors[Math.floor(Math.random() * activeColors.length)];
                ctx.fillStyle = color;

                ctx.globalAlpha = Math.random() * 0.6 + 0.3;

                // En modo glitch, caracteres más "corruptos"
                const charSet = isGlitch ? "☣ERROR_SYSTEM_FAILURE_☣" : config.chars;
                const text = charSet[Math.floor(Math.random() * charSet.length)];

                let x = i * config.fontSize;
                let y = drops[i] * config.fontSize;

                // --- GLITCH EFFECT ---
                // Probabilidad de desplazamiento aumenta drásticamente en modo Glitch
                const glitchChance = isGlitch ? 0.8 : 0.995;

                if (Math.random() > glitchChance) {
                    ctx.fillStyle = '#ffffff';
                    ctx.globalAlpha = 1;
                    const offsetX = (Math.random() - 0.5) * (isGlitch ? 20 : 50);
                    x += offsetX;
                }

                ctx.fillText(text, x, y);

                if (y > canvas.height && Math.random() > config.density) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
            ctx.globalAlpha = 1.0;
            ctx.shadowBlur = 0;
        };

        draw(0);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={glitchActive ? 'global-virus-glitch' : ''}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'none',
                opacity: glitchActive ? 0.9 : 0.6, // Más visible durante el glitch
                mixBlendMode: 'screen',
                transition: 'opacity 0.2s ease',
                // Filtro CSS para distorsión global
                filter: glitchActive ? 'url(#virus-flow) contrast(1.2) hue-rotate(90deg)' : 'none'
            }}
        />
    );
}
