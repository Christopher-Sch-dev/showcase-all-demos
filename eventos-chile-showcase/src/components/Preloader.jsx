/**
 * Preloader - Componente Wrapper para el Preloader Generativo Matemático
 * 
 * DURACIÓN: 3 segundos exactos, liberación inmediata
 * 
 * Arquitectura: Wrapper pattern para compatibilidad hacia atrás
 * El Home ya carga en segundo plano, así que liberamos inmediatamente
 */

import { useEffect, useState, useRef } from 'react';
import MathPreloader from './preloader/MathPreloader';

export default function Preloader({ onFinished }) {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const completedRef = useRef(false);

    useEffect(() => {
        const DURATION = 3000; // 3 segundos exactos
        const INTERVAL = 16;
        const startTime = Date.now();

        const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / DURATION) * 100, 100);
            setProgress(newProgress);

            // A los 3 segundos exactos, liberar inmediatamente
            if (elapsed >= DURATION && !completedRef.current) {
                completedRef.current = true;
                clearInterval(timer);
                setIsVisible(false);

                // Llamar onFinished inmediatamente para liberar el Home
                if (onFinished) {
                    onFinished();
                }
            }
        }, INTERVAL);

        return () => clearInterval(timer);
    }, [onFinished]);

    if (!isVisible) {
        return null;
    }

    return (
        <MathPreloader
            progress={progress}
            onComplete={() => { }}
        />
    );
}
