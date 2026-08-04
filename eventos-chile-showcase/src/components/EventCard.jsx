// Tarjeta 3D con flip + efecto mouse - REFACTORIZADO ZERO-LAG
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Eventos from '../assets/eventosIMG.png';
import { useAuth } from '../context/AuthContext';
import { formatearFecha, stripHtml } from '../services/helpers';
import { logger } from '../utils/logger';
import ModalAsistencia from './ModalAsistencia';
import ModalDecisionAsistencia from './ModalDecisionAsistencia';

// URL API para imágenes lazy loading
let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Asegurar que la URL termine en /api/v1 (mismo fix que en api.js)
if (API_BASE_URL && !API_BASE_URL.includes('/api/v1')) {
    API_BASE_URL = API_BASE_URL.replace(/\/$/, '') + '/api/v1';
}

// Hook para detectar móvil
const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

// Función auxiliar para recortar textos largos
function truncarTexto(texto, maxCaracteres) {
    if (typeof texto !== "string") return "";
    return texto.length > maxCaracteres ? texto.substring(0, maxCaracteres) + '...' : texto;
}

// Función para limpiar HTML (fallback local si stripHtml no está disponible)
function stripHtmlLocal(html) {
    if (!html || typeof html !== 'string') return '';
    try {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    } catch (error) {
        // Fallback: remover etiquetas básicas con regex
        return html.replace(/<[^>]*>/g, '').trim();
    }
}

// Función para formatear fecha ISO a formato legible chileno (con hora)
function formatearFechaLegible(fechaISO) {
    if (!fechaISO) return 'No disponible';
    try {
        const fecha = new Date(fechaISO);
        if (isNaN(fecha.getTime())) return 'Fecha inválida';
        const opciones = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return fecha.toLocaleDateString('es-CL', opciones);
    } catch (error) {
        return fechaISO;
    }
}

function EventCard({ evento }) {
    logger.debug('EventCard: Renderizando', {
        id: evento?.id,
        titulo: evento?.titulo,
        fecha: evento?.fecha,
        tipo: evento?.tipo
    });

    // FORENSIC ANALYSIS: Log image source
    useEffect(() => {
        if (evento?.id) {
            console.log(`[FORENSIC] Evento ${evento.id} Imagen data:`, {
                hasImagenField: !!evento.imagen,
                imagenValue: evento.imagen ? (evento.imagen.substring(0, 50) + '...') : 'null',
                fallbackUrl: `${API_BASE_URL}/eventos/${evento.id}/imagen`
            });
        }
    }, [evento]);

    const isMobile = useIsMobile();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [volteada, setVolteada] = useState(false);
    const [mostrarModalDecision, setMostrarModalDecision] = useState(false);
    const [mostrarModalAsistencia, setMostrarModalAsistencia] = useState(false);

    // Referencias DOM
    const cardRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Variables para rotación (NO usar useState para evitar re-renders)
    const rotateXRef = useRef(0);
    const rotateYRef = useRef(0);
    const targetRotateXRef = useRef(0);
    const targetRotateYRef = useRef(0);

    // OPTIMIZACIÓN CRÍTICA: Animación fuera del ciclo de React usando RAF
    const animate = useCallback(() => {
        if (!cardRef.current || volteada || isMobile) return;

        const lerpFactor = 0.15;

        // Interpolación suave (lerp)
        rotateXRef.current += (targetRotateXRef.current - rotateXRef.current) * lerpFactor;
        rotateYRef.current += (targetRotateYRef.current - rotateYRef.current) * lerpFactor;

        // Actualizar directamente las variables CSS (sin triggear re-render)
        cardRef.current.style.setProperty('--rotate-x', `${rotateXRef.current}deg`);
        cardRef.current.style.setProperty('--rotate-y', `${rotateYRef.current}deg`);

        // Continuar animación solo si hay movimiento significativo
        if (Math.abs(targetRotateXRef.current - rotateXRef.current) > 0.1 ||
            Math.abs(targetRotateYRef.current - rotateYRef.current) > 0.1) {
            animationFrameRef.current = requestAnimationFrame(animate);
        }
    }, [volteada, isMobile]);

    // Efecto 3D con mouse - SOLO actualiza targets, NO el DOM directamente
    const handleMouseMove = useCallback((e) => {
        if (volteada || !cardRef.current || isMobile) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calcular rotación objetivo (valores más amplios para ver la parte trasera)
        targetRotateXRef.current = (y - centerY) / 2.5; // Aumentado de /3.5 a /2.5 para máxima sensibilidad
        targetRotateYRef.current = (centerX - x) / 2.5; // Aumentado de /3.5 a /2.5 para máxima sensibilidad

        // Cancelar animación previa y empezar nueva
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [volteada, isMobile, animate]);

    // Al salir del mouse, resetear rotación con animación suave
    const handleMouseLeave = useCallback(() => {
        if (volteada || !cardRef.current || isMobile) return;

        targetRotateXRef.current = 0;
        targetRotateYRef.current = 0;

        // Cancelar animación previa y empezar nueva hacia reset
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(animate);
    }, [volteada, isMobile, animate]);

    // Cleanup: cancelar animación al desmontar
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    // SOLUCIÓN CRÍTICA: Click en la tarjeta para voltearla (solo cuando NO está volteada)
    const handleCardClick = useCallback((e) => {
        console.log(`[EventCard-${evento.id}] handleCardClick DISPARADO`, {
            volteada,
            targetTag: e.target.tagName,
            targetClass: e.target.className,
            closestButton: !!e.target.closest('button'),
            timestamp: new Date().toISOString()
        });

        // Si ya está volteada, NO hacer nada (permitir clicks en botones)
        if (volteada) {
            console.log(`[EventCard-${evento.id}] Ya volteada, click ignorado`);
            return;
        }

        // Si el click es en un botón o link, ignorar
        const target = e.target;
        if (target.closest('button') || target.closest('a') || target.tagName === 'BUTTON' || target.tagName === 'A') {
            console.log(`[EventCard-${evento.id}] Click en botón/link, ignorado`);
            return;
        }

        console.log(`[EventCard-${evento.id}] Volteando tarjeta`);
        setVolteada(true);
    }, [volteada, evento.id]);

    // Botón ver más detalles (redirige a página individual del evento)
    const handleVerDetalle = useCallback((e) => {
        console.log(`[EventCard-${evento.id}] handleVerDetalle DISPARADO`, {
            type: e.type,
            button: e.button,
            target: e.target.tagName,
            volteada,
            timestamp: new Date().toISOString()
        });
        e.stopPropagation();
        e.preventDefault();
        navigate(`/eventos/${evento.id}`);
    }, [evento.id, navigate, volteada]);

    // Botón volver (devuelve tarjeta a su cara frontal)
    const handleVolver = useCallback((e) => {
        console.log(`[EventCard-${evento.id}] handleVolver DISPARADO`, {
            type: e.type,
            button: e.button,
            target: e.target.tagName,
            volteada,
            timestamp: new Date().toISOString()
        });
        e.stopPropagation();
        e.preventDefault();
        setVolteada(false);

        // Resetear rotación 3D al volver
        if (cardRef.current) {
            rotateXRef.current = 0;
            rotateYRef.current = 0;
            targetRotateXRef.current = 0;
            targetRotateYRef.current = 0;
            cardRef.current.style.setProperty('--rotate-x', '0deg');
            cardRef.current.style.setProperty('--rotate-y', '0deg');
        }
    }, [evento.id, volteada]);

    // Abrir modal de asistencia
    const handleAsistir = useCallback((e) => {
        console.log(`[EventCard-${evento.id}] handleAsistir DISPARADO`, {
            type: e.type,
            button: e.button,
            target: e.target.tagName,
            volteada,
            timestamp: new Date().toISOString()
        });
        e.stopPropagation();
        e.preventDefault();

        if (isLoggedIn()) {
            setMostrarModalAsistencia(true);
        } else {
            setMostrarModalDecision(true);
        }
    }, [evento.id, isLoggedIn, volteada]);

    // Handler cuando selecciona "Asistir como Invitado"
    const handleSeleccionarInvitado = useCallback(() => {
        setMostrarModalDecision(false);
        setMostrarModalAsistencia(true);
    }, []);

    // Log de estado actual en cada render
    console.log(`[EventCard-${evento.id}] RENDER - Estado:`, {
        volteada,
        isMobile,
        frontal: {
            opacity: volteada ? 0 : 1,
            visibility: volteada ? 'hidden' : 'visible',
            pointerEvents: volteada ? 'none' : 'auto',
            zIndex: volteada ? 1 : 2
        },
        posterior: {
            opacity: volteada ? 1 : 0,
            visibility: volteada ? 'visible' : 'hidden',
            pointerEvents: volteada ? 'auto' : 'none',
            zIndex: volteada ? 2 : 1
        },
        onClickContenedor: volteada ? 'undefined' : 'handleCardClick',
        timestamp: new Date().toISOString()
    });

    return (
        <div
            className="tarjeta-evento-3d"
            ref={cardRef}
            onMouseMove={!isMobile ? handleMouseMove : undefined}
            onMouseLeave={!isMobile ? handleMouseLeave : undefined}
        >
            <div
                className={`carta-evento-flip ${volteada ? 'volteada' : ''}`}
                onClick={!volteada ? handleCardClick : undefined}
                style={{
                    pointerEvents: 'auto',
                    cursor: volteada ? 'default' : 'pointer'
                }}
            >
                {/* Cara frontal */}
                <div
                    className="cara-frontal"
                    style={{
                        display: volteada ? 'none' : 'flex',
                        opacity: volteada ? 0 : 1,
                        visibility: volteada ? 'hidden' : 'visible',
                        pointerEvents: volteada ? 'none' : 'auto',
                        zIndex: volteada ? 1 : 2,
                        cursor: volteada ? 'default' : 'pointer'
                    }}
                    onMouseEnter={() => !volteada && console.log(`[EventCard-${evento.id}] Mouse ENTRÓ a cara-frontal`)}
                >
                    <img
                        className="imagen-evento"
                        src={evento.imagen || `${API_BASE_URL}/eventos/${evento.id}/imagen`}
                        alt={truncarTexto(evento.titulo, 30)}
                        loading="lazy"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = Eventos;
                        }}
                    />
                    <div className="informacion-evento">
                        <h3>{truncarTexto(evento.titulo, 50)}</h3>
                        <p><strong>Fecha:</strong> {formatearFecha(evento.fecha)}</p>
                        <p><strong>Lugar:</strong> {truncarTexto(evento.lugar, 50)}</p>
                        <span className="etiqueta-tipo">{evento.tipo}</span>
                    </div>
                    {!volteada && (
                        <div className="text-center small" style={{
                            marginTop: 'auto',
                            padding: '0.5rem',
                            color: 'rgba(34, 211, 238, 0.9)',
                            textShadow: '0 0 10px rgba(34, 211, 238, 0.5)',
                            fontWeight: '500',
                            fontSize: '0.875rem'
                        }}>
                            Haz clic para ver más detalles
                        </div>
                    )}
                </div>

                {/* Cara posterior */}
                <div
                    className="cara-posterior"
                    style={{
                        display: volteada ? 'flex' : 'none',
                        opacity: volteada ? 1 : 0,
                        visibility: volteada ? 'visible' : 'hidden',
                        pointerEvents: volteada ? 'auto' : 'none',
                        zIndex: volteada ? 10 : 1,
                        userSelect: volteada ? 'text' : 'none'
                    }}
                    onClick={(e) => {
                        console.log(`[EventCard-${evento.id}] Click en cara-posterior`, {
                            target: e.target.tagName,
                            className: e.target.className,
                            closestButton: !!e.target.closest('button')
                        });
                    }}
                    onMouseEnter={() => volteada && console.log(`[EventCard-${evento.id}] Mouse ENTRÓ a cara-posterior`)}
                >
                    <div className="informacion-evento">
                        <h3>{truncarTexto(evento.titulo, 40)}</h3>
                        <p><strong>Descripción:</strong></p>
                        <p className="detalle-completo" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                            {truncarTexto(stripHtml ? stripHtml(evento.descripcion || '') : stripHtmlLocal(evento.descripcion || ''), 120)}...
                        </p>
                        <p><strong>Asistentes:</strong> {evento.totalAsistentes || 0}/{evento.capacidad}</p>
                        <p><strong>Precio:</strong> {evento.precio === 0 ? 'Gratis' : `$${evento.precio.toLocaleString('es-CL')}`}</p>
                        <p><strong>Organizador:</strong> {truncarTexto(evento.creadoPorNombre || 'N/A', 30)}</p>
                        <p><strong>Creado:</strong> {formatearFechaLegible(evento.fechaCreacion)}</p>
                    </div>
                </div>
            </div>

            {/* Botones FUERA de .carta-evento-flip para evitar contexto 3D */}
            {volteada && (
                <div
                    className="botones-cara-posterior"
                    style={{
                        position: 'absolute',
                        bottom: '1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 'calc(100% - 2rem)',
                        pointerEvents: 'auto',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'center',
                        touchAction: 'auto'
                    }}
                    onMouseEnter={() => console.log(`[EventCard-${evento.id}] Mouse ENTRÓ al área de botones`)}
                    onTouchStart={() => console.log(`[EventCard-${evento.id}] Touch en área de botones`)}
                >
                    <button
                        className="boton-detalle"
                        onTouchStart={(e) => {
                            e.stopPropagation();
                            console.log(`[EventCard-${evento.id}] TOUCH en Ver Detalles`);
                            handleVerDetalle(e);
                        }}
                        onMouseDown={handleVerDetalle}
                        onClick={handleVerDetalle}
                        onMouseEnter={() => console.log(`[EventCard-${evento.id}] Mouse SOBRE botón Ver Detalles`)}
                        style={{
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 10000,
                            touchAction: 'auto',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        Ver más detalles
                    </button>
                    <button
                        className="boton-asistir"
                        onTouchStart={(e) => {
                            e.stopPropagation();
                            console.log(`[EventCard-${evento.id}] TOUCH en Asistir`);
                            handleAsistir(e);
                        }}
                        onMouseDown={handleAsistir}
                        onClick={handleAsistir}
                        onMouseEnter={() => console.log(`[EventCard-${evento.id}] Mouse SOBRE botón Asistir`)}
                        style={{
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 10000,
                            touchAction: 'auto',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        Asistir
                    </button>
                    <button
                        className="boton-volver"
                        onTouchStart={(e) => {
                            e.stopPropagation();
                            console.log(`[EventCard-${evento.id}] TOUCH en Volver`);
                            handleVolver(e);
                        }}
                        onMouseDown={handleVolver}
                        onClick={handleVolver}
                        onMouseEnter={() => console.log(`[EventCard-${evento.id}] Mouse SOBRE botón Volver`)}
                        style={{
                            pointerEvents: 'auto',
                            cursor: 'pointer',
                            position: 'relative',
                            zIndex: 10000,
                            touchAction: 'auto',
                            WebkitTapHighlightColor: 'transparent'
                        }}
                    >
                        Volver
                    </button>
                </div>
            )}

            {/* Modal de decisión (NO logueados) */}
            {mostrarModalDecision && createPortal(
                <ModalDecisionAsistencia
                    evento={evento}
                    onClose={() => setMostrarModalDecision(false)}
                    onSeleccionarInvitado={handleSeleccionarInvitado}
                />,
                document.body
            )}

            {/* Modal de asistencia */}
            {mostrarModalAsistencia && createPortal(
                <ModalAsistencia
                    evento={evento}
                    onClose={() => setMostrarModalAsistencia(false)}
                    onSuccess={() => logger.debug('EventCard: Asistencia confirmada')}
                />,
                document.body
            )}
        </div>
    );
}

// React.memo para evitar re-renders innecesarios cuando cambian filtros que no afectan esta tarjeta
export default memo(EventCard);
