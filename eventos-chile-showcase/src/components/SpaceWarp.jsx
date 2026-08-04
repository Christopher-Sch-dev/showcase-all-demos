// Fondo Warp Speed - Efecto de estrellas moviéndose hacia la cámara (eje Z positivo)
// Simula velocidad de viaje espacial
import { Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';

// Componente 3D para el efecto Warp Speed con animación hacia la cámara
function WarpStars() {
    const groupRef = useRef();

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Animar el grupo moviéndose hacia la cámara (eje Z positivo)
            // Esto simula el efecto de viaje a velocidad de la luz
            groupRef.current.position.z += delta * 20; // Velocidad de movimiento hacia adelante

            // Si el grupo se aleja demasiado, resetear posición
            if (groupRef.current.position.z > 100) {
                groupRef.current.position.z = -100;
            }
        }
    });

    return (
        <group ref={groupRef}>
            <Stars
                radius={300}
                depth={60}
                count={6000} // Alta cantidad de estrellas para efecto profundo
                factor={4}
                saturation={0}
                fade // Fade para que se vea profundo
                speed={1}
            />
        </group>
    );
}

// Componente principal con Canvas
export default function SpaceWarp() {
    // Manejo de WebGL Context Lost/Restored
    const handleContextLost = (event) => {
        event.preventDefault();
        logger.warn('[SpaceWarp] WebGL Context Lost - Intentando restaurar...');
    };

    const handleContextRestored = () => {
        logger.debug('[SpaceWarp] WebGL Context Restored');
        // El Canvas se re-renderizará automáticamente
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: -1, // Detrás de todo
            background: '#050505',
            pointerEvents: 'none'
        }}>
            <Canvas
                camera={{ position: [0, 0, 0], fov: 75 }}
                onCreated={({ gl }) => {
                    // Agregar listeners para context lost/restored
                    const canvas = gl.domElement;
                    canvas.addEventListener('webglcontextlost', handleContextLost);
                    canvas.addEventListener('webglcontextrestored', handleContextRestored);

                    // Cleanup
                    return () => {
                        canvas.removeEventListener('webglcontextlost', handleContextLost);
                        canvas.removeEventListener('webglcontextrestored', handleContextRestored);
                    };
                }}
                gl={{
                    antialias: false, // Reducir carga para evitar context lost
                    powerPreference: 'low-power', // Priorizar estabilidad sobre rendimiento
                    preserveDrawingBuffer: false
                }}
            >
                <WarpStars />
            </Canvas>
        </div>
    );
}

