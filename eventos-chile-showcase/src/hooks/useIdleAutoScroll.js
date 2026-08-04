import { useEffect, useRef, useState } from 'react';

/**
 * Hook para auto-scroll cuando el usuario está inactivo.
 * @param {number} idleTimeMs Tiempo en ms antes de iniciar el scroll (def: 5000)
 * @param {number} speed Velocidad de scroll en px por frame (def: 4.5 - aumentado para mejor UX)
 */
export const useIdleAutoScroll = (idleTimeMs = 5000, speed = 4.5) => {
    const [isIdle, setIsIdle] = useState(false);
    const scrollDirection = useRef(1); // 1: down, -1: up
    const idleTimer = useRef(null);
    const animationFrame = useRef(null);

    useEffect(() => {
        const resetTimer = () => {
            setIsIdle(false);
            if (idleTimer.current) clearTimeout(idleTimer.current);
            if (animationFrame.current) cancelAnimationFrame(animationFrame.current);

            idleTimer.current = setTimeout(() => {
                setIsIdle(true);
            }, idleTimeMs);
        };

        // Eventos que resetean el timer
        // Eliminado 'scroll' para permitir comportamiento normal, pero 'wheel' lo detiene
        const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'click'];
        events.forEach(e => window.addEventListener(e, resetTimer));

        resetTimer();

        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimer));
            if (idleTimer.current) clearTimeout(idleTimer.current);
            if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        };
    }, [idleTimeMs]);

    useEffect(() => {
        if (!isIdle) return;

        const autoScroll = () => {
            // Calcular límites
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const currentScroll = window.scrollY;

            // Cambiar dirección si toca bordes
            if (currentScroll >= maxScroll - 1) {
                scrollDirection.current = -1;
            } else if (currentScroll <= 0) {
                scrollDirection.current = 1;
            }

            // IMPORTANTE: behavior: 'auto' evita conflicto con 'scroll-behavior: smooth' global
            window.scrollBy({
                top: speed * scrollDirection.current,
                left: 0,
                behavior: 'auto'
            });

            animationFrame.current = requestAnimationFrame(autoScroll);
        };

        animationFrame.current = requestAnimationFrame(autoScroll);

        return () => {
            if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
        };
    }, [isIdle, speed]);

    return isIdle;
};
