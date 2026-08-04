// Página individual del evento con detalles completos y editor de descripción
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Eventos from '../assets/eventosIMG.png';
import CKEditorWrapper from '../components/CKEditorWrapper';
import Footer from '../components/Footer';
import ModalAsistencia from '../components/ModalAsistencia';
import ModalDecisionAsistencia from '../components/ModalDecisionAsistencia';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { actualizarEvento, obtenerEventoPorId } from '../services/apiEventos';
import '../styles/evento-detalle.css';
import { showError, showSuccess, showWarning } from '../utils/toast';

function EventoDetalle() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const [evento, setEvento] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editandoDescripcion, setEditandoDescripcion] = useState(false);
    const [descripcionEditada, setDescripcionEditada] = useState('');
    const [guardando, setGuardando] = useState(false);
    const [mostrarModalAsistencia, setMostrarModalAsistencia] = useState(false);
    const [mostrarModalDecision, setMostrarModalDecision] = useState(false);

    useEffect(() => {
        const cargarEvento = async () => {
            try {
                setLoading(true);
                setError(null);
                const resultado = await obtenerEventoPorId(id);

                if (resultado.success) {
                    setEvento(resultado.data);
                    setDescripcionEditada(resultado.data.descripcion || '');
                } else {
                    setError(resultado.error || 'Error al cargar el evento');
                }
            } catch (error) {
                setError(error.message || 'Error inesperado al cargar el evento');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            cargarEvento();
        }
    }, [id]);

    const esCreador = evento && user && evento.creadoPorId === user.id;

    const handleGuardarDescripcion = async () => {
        // Validar que haya contenido (remover tags HTML para validar)
        const textoLimpio = descripcionEditada.replace(/<[^>]*>/g, '').trim();
        if (!evento || !textoLimpio) {
            showWarning('La descripción no puede estar vacía');
            return;
        }

        try {
            setGuardando(true);
            const resultado = await actualizarEvento(evento.id, {
                ...evento,
                descripcion: descripcionEditada
            });

            if (resultado.success) {
                setEvento(resultado.data);
                setEditandoDescripcion(false);
                showSuccess('Descripción actualizada exitosamente');
            } else {
                showError(resultado.error || 'Error al actualizar la descripción');
            }
        } catch (error) {
            showError('Error al guardar: ' + (error.message || 'Error inesperado'));
        } finally {
            setGuardando(false);
        }
    };

    const handleCancelarEdicion = () => {
        setDescripcionEditada(evento?.descripcion || '');
        setEditandoDescripcion(false);
    };

    const handleAsistir = () => {
        if (!isLoggedIn()) {
            setMostrarModalDecision(true);
        } else {
            setMostrarModalAsistencia(true);
        }
    };

    const handleSeleccionarInvitado = () => {
        setMostrarModalDecision(false);
        setMostrarModalAsistencia(true);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="container my-5">
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Cargando evento...</span>
                        </div>
                        <p className="mt-3 text-muted">Cargando detalles del evento...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !evento) {
        return (
            <>
                <Navbar />
                <main className="container my-5">
                    <div className="alert alert-danger" role="alert">
                        <h4 className="alert-heading">Error</h4>
                        <p>{error || 'Evento no encontrado'}</p>
                        <hr />
                        <Link to="/eventos" className="btn btn-primary">
                            Volver a Eventos
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="evento-detalle-container">
                {/* Botón volver - Minimalista */}
                <div className="evento-detalle-header mb-4">
                    <button
                        className="btn-volver-minimalista"
                        onClick={() => navigate(-1)}
                    >
                        ← Volver
                    </button>
                </div>

                {/* Header del evento - Minimalista y profesional */}
                <div className="evento-detalle-hero mb-5">
                    <div className="evento-header-top">
                        <div className="evento-badges">
                            <span className="badge-tipo">{evento.tipo}</span>
                            {evento.categoria && (
                                <span className="badge-categoria">{evento.categoria}</span>
                            )}
                            {/* Etiqueta de Pago/Gratis */}
                            {evento.precio > 0 ? (
                                <span className="badge-pago presencial">
                                    <i className="bi bi-cash-coin me-2"></i>
                                    Pago presencial: ${evento.precio}
                                </span>
                            ) : (
                                <span className="badge-pago gratis">
                                    <i className="bi bi-gift-fill me-2"></i>
                                    ¡Evento Gratuito!
                                </span>
                            )}
                        </div>
                        <div className="evento-lugar">
                            <span className="lugar-icono"></span>
                            <span className="lugar-texto">{evento.lugar}</span>
                        </div>
                    </div>
                    <h1 className="evento-titulo-principal">{evento.titulo}</h1>
                </div>

                {/* Imagen del evento - Mejorada */}
                {/* Imagen del evento - Mejorada con Smart Fit */}
                {evento.imagen && (
                    <div className="evento-imagen-container mb-5">
                        <div
                            className="evento-imagen-blur-bg"
                            style={{ backgroundImage: `url(${evento.imagen})` }}
                        ></div>
                        <img
                            src={evento.imagen}
                            alt={evento.titulo}
                            className="evento-imagen"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = Eventos;
                            }}
                        />
                    </div>
                )}

                {/* Descripción del evento - Minimalista */}
                <div className="evento-descripcion-seccion mb-5">
                    <div className="descripcion-header">
                        <h2 className="descripcion-titulo">Descripción</h2>
                        {esCreador && isLoggedIn() && (
                            <button
                                className="btn-editar-descripcion"
                                onClick={() => setEditandoDescripcion(!editandoDescripcion)}
                            >
                                {editandoDescripcion ? 'Cancelar' : 'Editar'}
                            </button>
                        )}
                    </div>
                    <div className="descripcion-contenido">
                        {editandoDescripcion && esCreador ? (
                            <div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <CKEditorWrapper
                                        value={descripcionEditada}
                                        onChange={setDescripcionEditada}
                                        placeholder="Escribe la descripción del evento aquí..."
                                    />
                                </div>
                                <div className="d-flex gap-2 justify-content-end">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={handleCancelarEdicion}
                                        disabled={guardando}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleGuardarDescripcion}
                                        disabled={guardando || !descripcionEditada.replace(/<[^>]*>/g, '').trim()}
                                    >
                                        {guardando ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                Guardando...
                                            </>
                                        ) : (
                                            'Guardar Cambios'
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="descripcion-evento"
                                dangerouslySetInnerHTML={{ __html: evento.descripcion || 'Sin descripción disponible' }}
                            />
                        )}
                    </div>
                </div>

                {/* Información adicional y acciones - Minimalista */}
                <div className="evento-detalle-footer">
                    <div className="row g-4">
                        <div className="col-md-8">
                            <div className="evento-detalles-adicionales">
                                <h3 className="detalles-titulo">Detalles</h3>
                                <div className="detalles-grid">
                                    <div className="detalle-item">
                                        <span className="detalle-etiqueta">Organizador</span>
                                        <span className="detalle-valor">{evento.creadoPorNombre || 'N/A'}</span>
                                    </div>
                                    <div className="detalle-item">
                                        <span className="detalle-etiqueta">Capacidad</span>
                                        <span className="detalle-valor">{evento.capacidad} personas</span>
                                    </div>
                                    <div className="detalle-item">
                                        <span className="detalle-etiqueta">Cupos disponibles</span>
                                        <span className="detalle-valor">{evento.capacidad - (evento.totalAsistentes || 0)}</span>
                                    </div>
                                    {evento.fechaCreacion && (
                                        <div className="detalle-item">
                                            <span className="detalle-etiqueta">Creado</span>
                                            <span className="detalle-valor">
                                                {new Date(evento.fechaCreacion).toLocaleDateString('es-CL', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="evento-acciones">
                                <button
                                    className="btn-accion-principal"
                                    onClick={handleAsistir}
                                >
                                    Asistir al Evento
                                </button>
                                <Link
                                    to="/eventos"
                                    className="btn-accion-secundaria"
                                >
                                    Ver Todos los Eventos
                                </Link>
                                {esCreador && (
                                    <Link
                                        to="/admin"
                                        className="btn-accion-secundaria"
                                    >
                                        Gestionar Evento
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de decisión (NO logueados) */}
                {mostrarModalDecision && evento && createPortal(
                    <ModalDecisionAsistencia
                        evento={evento}
                        onClose={() => setMostrarModalDecision(false)}
                        onSeleccionarInvitado={handleSeleccionarInvitado}
                    />,
                    document.body
                )}

                {/* Modal de asistencia */}
                {mostrarModalAsistencia && evento && createPortal(
                    <ModalAsistencia
                        evento={evento}
                        onClose={() => setMostrarModalAsistencia(false)}
                        onSuccess={() => {
                            // Recargar evento para actualizar asistentes
                            obtenerEventoPorId(id).then(resultado => {
                                if (resultado.success) {
                                    setEvento(resultado.data);
                                }
                            });
                        }}
                    />,
                    document.body
                )}
            </main>
            <Footer />
        </>
    );
}

export default EventoDetalle;

