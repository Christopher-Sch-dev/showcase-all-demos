// Artefactos Wireframe Flotantes - Figuras geométricas 3D con física de "patada"
// Estética Cyberpunk/Tron con wireframe y física interactiva
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '../utils/logger';

// Tipos de geometrías disponibles (solo Box y Octahedron para wireframe)
const GEOMETRIES = ['box', 'octahedron'];

// Componente de artefacto individual con física de "patada"
function Artifact({ position, geometryType, index, mousePos }) {
    const mesh = useRef();
    // Velocidad inicial aleatoria para movimiento libre constante (como en el espacio)
    // REDUCIDA para movimiento más lento y elegante
    const velocity = useRef({
        x: (Math.random() - 0.5) * 0.5, // Velocidad inicial aleatoria en X (reducida)
        y: (Math.random() - 0.5) * 0.5, // Velocidad inicial aleatoria en Y (reducida)
        z: (Math.random() - 0.5) * 0.3   // Velocidad inicial aleatoria en Z (reducida)
    });
    const [isHovered, setIsHovered] = useState(false);
    const [scale, setScale] = useState(1);
    const { camera, raycaster, viewport } = useThree();

    // Color neón aleatorio (Green, Pink, Cyan)
    const color = useMemo(() => {
        const colors = ['#00ff88', '#ff00ff', '#00f0ff']; // Green, Pink, Cyan
        return colors[index % colors.length];
    }, [index]);

    useFrame((state, delta) => {
        if (mesh.current) {
            // Rotación suave continua
            mesh.current.rotation.x += delta * 0.2;
            mesh.current.rotation.y += delta * 0.3;

            // MOVIMIENTO LIBRE CONSTANTE (como en el espacio - sin fricción)
            // Los objetos siempre se mueven, incluso sin interacción del mouse

            // Calcular posición del mouse en el espacio 3D usando raycaster
            if (mousePos) {
                // Crear un rayo desde la cámara a través del mouse
                raycaster.setFromCamera(mousePos, camera);

                // Obtener el punto en el plano Z del objeto (aproximadamente donde están los objetos)
                const planeZ = mesh.current.position.z;
                const distanceToPlane = (planeZ - camera.position.z) / raycaster.ray.direction.z;
                const mouseWorldPos = {
                    x: raycaster.ray.origin.x + raycaster.ray.direction.x * distanceToPlane,
                    y: raycaster.ray.origin.y + raycaster.ray.direction.y * distanceToPlane,
                    z: planeZ
                };

                // Calcular distancia entre el mouse y el objeto en el plano
                const objectPos = mesh.current.position;
                const distance = Math.sqrt(
                    Math.pow(mouseWorldPos.x - objectPos.x, 2) +
                    Math.pow(mouseWorldPos.y - objectPos.y, 2)
                );

                // Física de "Patada": Si el mouse está cerca (< 3 unidades), aplicar fuerza opuesta
                const interactionRadius = 3;
                if (distance < interactionRadius) {
                    setIsHovered(true);
                    // Efecto visual: aumentar escala y brillo
                    setScale(1 + (interactionRadius - distance) * 0.2);

                    // Vector de dirección desde el mouse hacia el objeto
                    const direction = {
                        x: (objectPos.x - mouseWorldPos.x) / distance,
                        y: (objectPos.y - mouseWorldPos.y) / distance,
                        z: 0
                    };

                    // Fuerza MUY fuerte en dirección opuesta al mouse (disparo)
                    const force = (interactionRadius - distance) * 80; // Fuerza aún más fuerte
                    velocity.current.x += direction.x * force * delta;
                    velocity.current.y += direction.y * force * delta;
                    velocity.current.z += (Math.random() - 0.5) * 2 * delta; // También en Z
                } else {
                    setIsHovered(false);
                    setScale(1);
                    // SIN FRICCIÓN - los objetos mantienen su velocidad (flotación libre en el espacio)
                }
            } else {
                setIsHovered(false);
                setScale(1);
                // SIN FRICCIÓN - los objetos mantienen su velocidad (flotación libre en el espacio)
            }

            // Aplicar velocidad (movimiento libre constante)
            mesh.current.position.x += velocity.current.x * delta;
            mesh.current.position.y += velocity.current.y * delta;
            mesh.current.position.z += velocity.current.z * delta;

            // Límites de la "caja" (rebote realista en los bordes)
            const bounds = viewport.width / 2 + 1; // Límites basados en el viewport real
            const boundsY = viewport.height / 2 + 1;
            const boundsZ = 4; // Límites en Z

            // Rebote en X (como si fuera el límite de una caja)
            if (mesh.current.position.x > bounds || mesh.current.position.x < -bounds) {
                // Invertir velocidad y reposicionar en el borde
                velocity.current.x *= -0.8; // Rebote con pérdida de energía (más realista)
                mesh.current.position.x = Math.max(-bounds, Math.min(bounds, mesh.current.position.x));
            }

            // Rebote en Y (como si fuera el límite de una caja)
            if (mesh.current.position.y > boundsY || mesh.current.position.y < -boundsY) {
                // Invertir velocidad y reposicionar en el borde
                velocity.current.y *= -0.8; // Rebote con pérdida de energía (más realista)
                mesh.current.position.y = Math.max(-boundsY, Math.min(boundsY, mesh.current.position.y));
            }

            // Rebote en Z (como si fuera el límite de una caja)
            if (mesh.current.position.z > boundsZ || mesh.current.position.z < -boundsZ) {
                // Invertir velocidad y reposicionar en el borde
                velocity.current.z *= -0.8; // Rebote con pérdida de energía (más realista)
                mesh.current.position.z = Math.max(-boundsZ, Math.min(boundsZ, mesh.current.position.z));
            }

            // Aplicar escala
            mesh.current.scale.setScalar(scale);
        }
    });

    // Renderizar geometría según tipo
    const renderGeometry = () => {
        switch (geometryType) {
            case 'octahedron':
                return <octahedronGeometry args={[0.4, 0]} />;
            case 'box':
                return <boxGeometry args={[0.4, 0.4, 0.4]} />;
            default:
                return <boxGeometry args={[0.4, 0.4, 0.4]} />;
        }
    };

    return (
        <mesh ref={mesh} position={position}>
            {renderGeometry()}
            {/* Material wireframe neón con efectos visuales */}
            <meshBasicMaterial
                wireframe={true}
                color={color}
                transparent
                opacity={isHovered ? 1 : 0.7} // Más opaco cuando está cerca del mouse
            />
        </mesh>
    );
}

// Hook para rastrear la posición del mouse
function useMousePosition() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (event) => {
            // Normalizar coordenadas del mouse (-1 a 1)
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return mousePos;
}

// Componente principal
export default function FloatingArtifacts() {
    const mousePos = useMousePosition();

    // Generar 20 artefactos distribuidos aleatoriamente en el viewport completo
    // OPTIMIZACIÓN: Usar valores fijos en lugar de window.innerWidth/innerHeight en render
    const artifacts = useMemo(() => {
        const count = 20; // Más objetos para mejor cobertura
        const result = [];

        // Usar valores del viewport en el momento de la creación (más eficiente)
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

        for (let i = 0; i < count; i++) {
            // Distribución aleatoria en todo el viewport (usando coordenadas de pantalla)
            // Convertir coordenadas de pantalla a coordenadas 3D del viewport
            const screenX = Math.random() * viewportWidth;
            const screenY = Math.random() * viewportHeight;

            // Normalizar a coordenadas del viewport de Three.js
            const normalizedX = ((screenX / viewportWidth) * 2 - 1) * 8; // -8 a 8
            const normalizedY = -((screenY / viewportHeight) * 2 - 1) * 6; // -6 a 6 (invertido Y)
            const z = (Math.random() - 0.5) * 8; // -4 a 4 (más rango en Z)

            result.push({
                id: i,
                position: [normalizedX, normalizedY, z],
                geometryType: GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)]
            });
        }

        return result;
    }, []); // Sin dependencias - se genera una vez al montar

    // Manejo de WebGL Context Lost/Restored
    const handleContextLost = (event) => {
        event.preventDefault();
        logger.warn('[FloatingArtifacts] WebGL Context Lost - Intentando restaurar...');
    };

    const handleContextRestored = () => {
        logger.debug('[FloatingArtifacts] WebGL Context Restored');
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 15, // AL FRENTE de todo (encima del contenido también)
            pointerEvents: 'none' // CRÍTICO: No bloquea clicks por defecto
        }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 75 }} // Cámara más alejada para ver más área
                style={{
                    pointerEvents: 'none', // CRÍTICO: Deshabilitar pointer-events en el Canvas
                    width: '100%',
                    height: '100%'
                }}
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
                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, 10]} intensity={0.5} />
                {artifacts.map((artifact) => (
                    <Artifact
                        key={artifact.id}
                        position={artifact.position}
                        geometryType={artifact.geometryType}
                        index={artifact.id}
                        mousePos={mousePos}
                    />
                ))}
            </Canvas>
        </div>
    );
}

