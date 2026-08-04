// Carrusel infinito de eventos con auto-scroll
// Portado desde eventos_interaccion.js SIN REACT -
// mantiene lógica de loop infinito
// Ahora integra ModalAsistencia para confirmar asistencia
// Modal se renderiza fuera del carrusel usando Portal

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Eventos from '../assets/eventosIMG.png';
import { useAuth } from '../context/AuthContext';
import { formatearFecha } from '../services/helpers';
import { logger } from '../utils/logger';
import ModalAsistencia from './ModalAsistencia';
import ModalDecisionAsistencia from './ModalDecisionAsistencia';

// Función auxiliar para recortar textos largos
function truncarTexto(texto, maxCaracteres) {
    if (typeof texto !== "string") return "";
    return texto.length > maxCaracteres ? texto.substring(0, maxCaracteres) + '...' : texto;
}

function EventCarousel({ eventos }) {
    logger.debug('EventCarousel: Renderizando', { totalEventos: eventos?.length || 0 });

    const carruselRef = useRef(null);
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
    const [mostrarModalDecision, setMostrarModalDecision] = useState(false);
    const [mostrarModalAsistencia, setMostrarModalAsistencia] = useState(false);

    // Auto-scroll y lógica de loop infinito
    useEffect(() => {
        const carrusel = carruselRef.current;
        if (!carrusel) return;

        // Auto-scroll suave cada 18ms - ACELERADO
        const intervalo = setInterval(() => {
            carrusel.scrollLeft += 2.0;
        }, 18);

        // Lógica de scroll infinito: si llego al final, vuelvo al inicio
        const handleScroll = () => {
            // Fin derecho, salto adelante un pixel para no quedar pegado
            if (carrusel.scrollLeft + carrusel.clientWidth >= carrusel.scrollWidth - 1) {
                carrusel.scrollLeft = 1;
            }
            // Inicio, salto a mitad del scroll
            if (carrusel.scrollLeft === 0) {
                carrusel.scrollLeft = carrusel.scrollWidth / 2;
            }
        };

        carrusel.addEventListener('scroll', handleScroll);

        // Cleanup al desmontar componente
        return () => {
            clearInterval(intervalo);
            carrusel.removeEventListener('scroll', handleScroll);
        };
    }, [eventos]);

    // Abrir modal según estado de login
    const handleAsistir = (evento) => {
        setEventoSeleccionado(evento);
        if (!isLoggedIn()) {
            setMostrarModalDecision(true);
        } else {
            setMostrarModalAsistencia(true);
        }
    };

    // Handler para cuando el usuario elige asistir como invitado
    const handleSeleccionarInvitado = () => {
        setMostrarModalDecision(false);
        setMostrarModalAsistencia(true);
    };

    // Duplicar el array para dar efecto de loop infinito
    const eventosDobles = eventos.length > 0 ? [...eventos, ...eventos] : [];
    logger.debug('EventCarousel: eventosDobles generado', { total: eventosDobles.length });

    // Si no hay eventos, mostrar mensaje
    if (eventos.length === 0) {
        logger.warn('EventCarousel: No hay eventos para mostrar');
        return (
            <div className="carrusel-lista text-center py-5">
                <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No hay eventos disponibles en este momento</p>
            </div>
        );
    }

    logger.debug('EventCarousel: Renderizando carrusel', { totalEventos: eventos.length });

    return (
        <>
            <div id="carrusel-lista" className="carrusel-lista" ref={carruselRef}>
                {eventosDobles.map((evento, index) => (
                    <article className="Tarjetas" key={`${evento.id}-${index}`}>
                        <img
                            className="imagen-evento"
                            src={evento.imagen || Eventos}
                            alt={truncarTexto(evento.titulo, 30)}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = Eventos;
                            }}
                        />
                        <h3>{truncarTexto(evento.titulo, 40)}</h3>
                        <p>
                            Fecha: {formatearFecha(evento.fecha)}<br />
                            Lugar: {truncarTexto(evento.lugar, 50)}
                        </p>
                        <p><b className="tipo-evento">{evento.tipo}</b></p>
                        <button
                            className="btn-asistir"
                            onClick={() => handleAsistir(evento)}
                        >
                            Asistir al Evento
                        </button>
                    </article>
                ))}
            </div>

            {/* Modal de decisión (NO logueados) - Renderizado fuera del carrusel usando Portal */}
            {mostrarModalDecision && eventoSeleccionado && createPortal(
                <ModalDecisionAsistencia
                    evento={eventoSeleccionado}
                    onClose={() => {
                        setMostrarModalDecision(false);
                        setEventoSeleccionado(null);
                    }}
                    onSeleccionarInvitado={handleSeleccionarInvitado}
                />,
                document.body
            )}

            {/* Modal de asistencia - Renderizado fuera del carrusel usando Portal */}
            {mostrarModalAsistencia && eventoSeleccionado && createPortal(
                <ModalAsistencia
                    evento={eventoSeleccionado}
                    onClose={() => {
                        setMostrarModalAsistencia(false);
                        setEventoSeleccionado(null);
                    }}
                    onSuccess={() => {
                        logger.debug('Asistencia confirmada desde carrusel');
                    }}
                />,
                document.body
            )}
        </>
    );
}

export default EventCarousel;
