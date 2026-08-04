import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
    listarSolicitudesPendientes,
    aprobarSolicitud,
    rechazarSolicitud,
    contarSolicitudesPendientes,
    listarHistorialSolicitudes
} from '../services/apiSolicitudes';
import { getUsuarios } from '../services/apiUsuarios';
import { obtenerEventosPorUsuario } from '../services/apiEventos';
import { obtenerAsistenciasPorEvento } from '../services/apiAsistencia';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/super-admin.css';

/**
 * Panel de administracion exclusivo para SUPER_ADMIN.
 * Funcionalidades:
 *   - Gestionar usuarios (ver listado, roles)
 *   - Aprobar/rechazar solicitudes de eliminacion de eventos
 *   - Ver estadisticas del sistema
 */
const SuperAdmin = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Estados
    const [activeTab, setActiveTab] = useState('solicitudes');
    const [loading, setLoading] = useState(true);
    const [solicitudes, setSolicitudes] = useState([]);
    const [historial, setHistorial] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [pendientesCount, setPendientesCount] = useState(0);
    const [procesando, setProcesando] = useState(null);
    const [respuestaModal, setRespuestaModal] = useState({ show: false, solicitudId: null, tipo: null, respuesta: '' });

    // Estados para drill-down: Usuario -> Eventos -> Asistentes
    const [expandedUserId, setExpandedUserId] = useState(null);
    const [userEvents, setUserEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [attendeesModal, setAttendeesModal] = useState({ show: false, evento: null, asistentes: [], loading: false });

    // Verificar que el usuario sea SUPER_ADMIN
    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        if (user.rol !== 'SUPER_ADMIN') {
            toast.error('Acceso denegado. Solo SUPER_ADMIN puede acceder a esta pagina.');
            navigate('/panel');
            return;
        }
        cargarDatos();
    }, [user, navigate]);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            // Cargar solicitudes y conteo primero (siempre deberian funcionar)
            const [solicitudesData, countData, historialData] = await Promise.all([
                listarSolicitudesPendientes(),
                contarSolicitudesPendientes(),
                listarHistorialSolicitudes()
            ]);
            setSolicitudes(solicitudesData || []);
            setPendientesCount(countData?.pendientes || 0);
            setHistorial(historialData || []);

            // Intentar cargar usuarios (puede fallar si el token no tiene el rol correcto)
            try {
                const usuariosData = await getUsuarios();
                setUsuarios(usuariosData || []);
            } catch (usuariosError) {
                // Si falla por 403, mostrar mensaje y sugerir re-login
                if (usuariosError.response?.status === 403) {
                    toast.warning('Para ver usuarios, cierra sesion y vuelve a entrar.');
                } else {
                    toast.error('Error al cargar lista de usuarios');
                }
                setUsuarios([]);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error al cargar datos del panel');
        } finally {
            setLoading(false);
        }
    };

    const handleAprobar = async (solicitudId) => {
        if (procesando) return;
        setProcesando(solicitudId);
        try {
            await aprobarSolicitud(solicitudId, { respuesta: respuestaModal.respuesta });
            toast.success('Solicitud aprobada. El evento ha sido eliminado.');
            setRespuestaModal({ show: false, solicitudId: null, tipo: null, respuesta: '' });
            cargarDatos();
        } catch (error) {
            console.error('Error aprobando solicitud:', error);
            toast.error(error.response?.data?.mensaje || 'Error al aprobar solicitud');
        } finally {
            setProcesando(null);
        }
    };

    const handleRechazar = async (solicitudId) => {
        if (procesando) return;
        setProcesando(solicitudId);
        try {
            await rechazarSolicitud(solicitudId, { respuesta: respuestaModal.respuesta });
            toast.success('Solicitud rechazada. El evento permanece activo.');
            setRespuestaModal({ show: false, solicitudId: null, tipo: null, respuesta: '' });
            cargarDatos();
        } catch (error) {
            console.error('Error rechazando solicitud:', error);
            toast.error(error.response?.data?.mensaje || 'Error al rechazar solicitud');
        } finally {
            setProcesando(null);
        }
    };

    const abrirModalRespuesta = (solicitudId, tipo) => {
        setRespuestaModal({ show: true, solicitudId, tipo, respuesta: '' });
    };

    const cerrarModal = () => {
        setRespuestaModal({ show: false, solicitudId: null, tipo: null, respuesta: '' });
    };

    // Drill-down: Cargar eventos de un usuario
    const toggleUserEvents = async (usuarioId) => {
        if (expandedUserId === usuarioId) {
            setExpandedUserId(null);
            setUserEvents([]);
            return;
        }
        setExpandedUserId(usuarioId);
        setLoadingEvents(true);
        try {
            const result = await obtenerEventosPorUsuario(usuarioId);
            if (result.success) {
                setUserEvents(result.data || []);
            } else {
                toast.error('Error al cargar eventos del usuario');
                setUserEvents([]);
            }
        } catch (error) {
            toast.error('Error al cargar eventos');
            setUserEvents([]);
        } finally {
            setLoadingEvents(false);
        }
    };

    // Drill-down: Ver asistentes de un evento
    const verAsistentes = async (evento) => {
        setAttendeesModal({ show: true, evento, asistentes: [], loading: true });
        try {
            const result = await obtenerAsistenciasPorEvento(evento.id);
            if (result.success) {
                setAttendeesModal(prev => ({ ...prev, asistentes: result.data || [], loading: false }));
            } else {
                toast.error('Error al cargar asistentes');
                setAttendeesModal(prev => ({ ...prev, loading: false }));
            }
        } catch (error) {
            toast.error('Error al cargar asistentes');
            setAttendeesModal(prev => ({ ...prev, loading: false }));
        }
    };

    const cerrarAttendeesModal = () => {
        setAttendeesModal({ show: false, evento: null, asistentes: [], loading: false });
    };

    const formatearFecha = (fecha) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <main className="super-admin-page">
                    <LoadingSpinner fullscreen message="Cargando panel de administracion..." />
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <main className="super-admin-page">
                <div className="container py-4">
                    {/* Header */}
                    <div className="super-admin-header">
                        <h1>Panel Super Administrador</h1>
                        <p className="text-muted">Gestion de usuarios y moderacion de contenido</p>
                    </div>

                    {/* Estadisticas */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon pending">
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{pendientesCount}</span>
                                <span className="stat-label">Solicitudes Pendientes</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon users">
                                <i className="bi bi-people"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{usuarios.length}</span>
                                <span className="stat-label">Usuarios Registrados</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon admins">
                                <i className="bi bi-shield-check"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">
                                    {usuarios.filter(u => u.rol === 'SUPER_ADMIN').length}
                                </span>
                                <span className="stat-label">Super Admins</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="admin-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'solicitudes' ? 'active' : ''}`}
                            onClick={() => setActiveTab('solicitudes')}
                        >
                            Solicitudes de Eliminacion
                            {pendientesCount > 0 && (
                                <span className="badge-count">{pendientesCount}</span>
                            )}
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'usuarios' ? 'active' : ''}`}
                            onClick={() => setActiveTab('usuarios')}
                        >
                            Gestion de Usuarios
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
                            onClick={() => setActiveTab('historial')}
                        >
                            Historial de Auditoria
                            {historial.length > 0 && (
                                <span className="badge-count" style={{ background: '#6c757d' }}>{historial.length}</span>
                            )}
                        </button>
                    </div>

                    {/* Contenido de Tabs */}
                    <div className="tab-content">
                        {/* Tab: Solicitudes */}
                        {activeTab === 'solicitudes' && (
                            <div className="solicitudes-section">
                                {solicitudes.length === 0 ? (
                                    <div className="empty-state">
                                        <i className="bi bi-inbox"></i>
                                        <h3>No hay solicitudes pendientes</h3>
                                        <p>Todas las solicitudes han sido procesadas.</p>
                                    </div>
                                ) : (
                                    <div className="solicitudes-list">
                                        {solicitudes.map((solicitud) => (
                                            <div key={solicitud.id} className="solicitud-card">
                                                <div className="solicitud-header">
                                                    <div className="evento-info">
                                                        <h4>{solicitud.eventoTitulo}</h4>
                                                        <span className="badge-asistentes">
                                                            {solicitud.eventoAsistentes} asistentes
                                                        </span>
                                                    </div>
                                                    <span className="fecha">
                                                        {formatearFecha(solicitud.fechaSolicitud)}
                                                    </span>
                                                </div>

                                                <div className="solicitud-body">
                                                    <div className="usuario-info">
                                                        <strong>Solicitante:</strong> {solicitud.usuarioNombre}
                                                        <span className="email">({solicitud.usuarioEmail})</span>
                                                    </div>
                                                    <div className="motivo">
                                                        <strong>Motivo:</strong>
                                                        <p>{solicitud.motivo}</p>
                                                    </div>
                                                </div>

                                                <div className="solicitud-actions">
                                                    <button
                                                        className="btn-aprobar"
                                                        onClick={() => abrirModalRespuesta(solicitud.id, 'aprobar')}
                                                        disabled={procesando === solicitud.id}
                                                    >
                                                        {procesando === solicitud.id ? 'Procesando...' : 'Aprobar'}
                                                    </button>
                                                    <button
                                                        className="btn-rechazar"
                                                        onClick={() => abrirModalRespuesta(solicitud.id, 'rechazar')}
                                                        disabled={procesando === solicitud.id}
                                                    >
                                                        Rechazar
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Tab: Usuarios */}
                        {activeTab === 'usuarios' && (
                            <div className="usuarios-section">
                                <div className="table-responsive">
                                    <table className="users-table">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Nombre</th>
                                                <th>Email</th>
                                                <th>Rol</th>
                                                <th>Region</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuarios.map((usuario) => (
                                                <>
                                                    <tr key={usuario.id} className={expandedUserId === usuario.id ? 'expanded' : ''}>
                                                        <td>{usuario.id}</td>
                                                        <td>{usuario.nombre}</td>
                                                        <td>{usuario.email}</td>
                                                        <td>
                                                            <span className={`role-badge ${usuario.rol.toLowerCase()}`}>
                                                                {usuario.rol}
                                                            </span>
                                                        </td>
                                                        <td>{usuario.region || '-'}</td>
                                                        <td>
                                                            <button
                                                                className="btn-ver-eventos"
                                                                onClick={() => toggleUserEvents(usuario.id)}
                                                            >
                                                                {expandedUserId === usuario.id ? 'Ocultar' : 'Ver Eventos'}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                    {expandedUserId === usuario.id && (
                                                        <tr className="eventos-row">
                                                            <td colSpan="6">
                                                                <div className="eventos-expandido">
                                                                    {loadingEvents ? (
                                                                        <p className="loading-text">Cargando eventos...</p>
                                                                    ) : userEvents.length === 0 ? (
                                                                        <p className="empty-text">Este usuario no ha creado eventos.</p>
                                                                    ) : (
                                                                        <table className="eventos-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Evento</th>
                                                                                    <th>Fecha</th>
                                                                                    <th>Capacidad</th>
                                                                                    <th>Precio</th>
                                                                                    <th>Acciones</th>
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                {userEvents.map((evento) => (
                                                                                    <tr key={evento.id}>
                                                                                        <td>{evento.titulo}</td>
                                                                                        <td>{formatearFecha(evento.fecha)}</td>
                                                                                        <td>{evento.capacidad}</td>
                                                                                        <td>{evento.precio > 0 ? `$${evento.precio.toLocaleString()}` : 'Gratis'}</td>
                                                                                        <td>
                                                                                            <button
                                                                                                className="btn-ver-asistentes"
                                                                                                onClick={() => verAsistentes(evento)}
                                                                                            >
                                                                                                Ver Asistentes
                                                                                            </button>
                                                                                        </td>
                                                                                    </tr>
                                                                                ))}
                                                                            </tbody>
                                                                        </table>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Tab: Historial de Auditoría */}
                        {activeTab === 'historial' && (
                            <div className="historial-section">
                                {historial.length === 0 ? (
                                    <div className="empty-state">
                                        <i className="bi bi-journal-text"></i>
                                        <h3>No hay registros en el historial</h3>
                                        <p>Las solicitudes aprobadas y rechazadas aparecerán aquí.</p>
                                    </div>
                                ) : (
                                    <div className="historial-list">
                                        {historial.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`historial-card ${item.estado === 'APROBADA' ? 'aprobada' : 'rechazada'}`}
                                            >
                                                <div className="historial-header">
                                                    <div className="evento-info">
                                                        <h4>{item.eventoTitulo}</h4>
                                                        <span className={`badge-estado ${item.estado.toLowerCase()}`}>
                                                            {item.estado === 'APROBADA' ? '✓ Aprobada' : '✗ Rechazada'}
                                                        </span>
                                                    </div>
                                                    <span className="fecha">
                                                        {formatearFecha(item.fechaResolucion)}
                                                    </span>
                                                </div>

                                                <div className="historial-body">
                                                    <div className="info-row">
                                                        <strong>Solicitante:</strong>
                                                        <span>{item.usuarioNombre} ({item.usuarioEmail})</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <strong>Resuelto por:</strong>
                                                        <span>{item.resueltoPorNombre || 'N/A'}</span>
                                                    </div>
                                                    <div className="info-row">
                                                        <strong>Asistentes afectados:</strong>
                                                        <span>{item.eventoAsistentes}</span>
                                                    </div>
                                                    <div className="motivo-section">
                                                        <strong>Motivo original:</strong>
                                                        <p>{item.motivo}</p>
                                                    </div>
                                                    {item.respuestaAdmin && (
                                                        <div className="respuesta-section">
                                                            <strong>Respuesta del admin:</strong>
                                                            <p>{item.respuestaAdmin}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="historial-footer">
                                                    <small className="text-muted">
                                                        Solicitud creada: {formatearFecha(item.fechaSolicitud)}
                                                    </small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal de Respuesta */}
                {respuestaModal.show && (
                    <div className="modal-overlay" onClick={cerrarModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <h3>
                                {respuestaModal.tipo === 'aprobar'
                                    ? 'Aprobar Solicitud'
                                    : 'Rechazar Solicitud'}
                            </h3>
                            <p>
                                {respuestaModal.tipo === 'aprobar'
                                    ? 'Al aprobar, el evento sera eliminado permanentemente.'
                                    : 'Al rechazar, el evento permanecera activo.'}
                            </p>
                            <textarea
                                placeholder="Mensaje para el usuario (opcional)"
                                value={respuestaModal.respuesta}
                                onChange={(e) => setRespuestaModal(prev => ({ ...prev, respuesta: e.target.value }))}
                                rows={3}
                            />
                            <div className="modal-actions">
                                <button className="btn-cancelar" onClick={cerrarModal}>
                                    Cancelar
                                </button>
                                <button
                                    className={respuestaModal.tipo === 'aprobar' ? 'btn-aprobar' : 'btn-rechazar'}
                                    onClick={() => respuestaModal.tipo === 'aprobar'
                                        ? handleAprobar(respuestaModal.solicitudId)
                                        : handleRechazar(respuestaModal.solicitudId)
                                    }
                                    disabled={procesando}
                                >
                                    {procesando ? 'Procesando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de Asistentes */}
                {attendeesModal.show && (
                    <div className="modal-overlay" onClick={cerrarAttendeesModal}>
                        <div className="modal-content modal-asistentes" onClick={(e) => e.stopPropagation()}>
                            <h3>Asistentes: {attendeesModal.evento?.titulo}</h3>
                            {attendeesModal.loading ? (
                                <p className="loading-text">Cargando asistentes...</p>
                            ) : attendeesModal.asistentes.length === 0 ? (
                                <p className="empty-text">No hay asistentes registrados para este evento.</p>
                            ) : (
                                <div className="asistentes-list">
                                    <table className="asistentes-table">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Email</th>
                                                <th>Tipo</th>
                                                <th>Confirmado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendeesModal.asistentes.map((asistente, idx) => (
                                                <tr key={asistente.id || idx}>
                                                    <td>
                                                        {asistente.tipoAsistente === 'REGISTRADO'
                                                            ? (asistente.usuarioNombre || '-')
                                                            : (asistente.nombreInvitado || '-')}
                                                    </td>
                                                    <td>
                                                        {asistente.tipoAsistente === 'REGISTRADO'
                                                            ? '-'
                                                            : (asistente.emailInvitado || '-')}
                                                    </td>
                                                    <td>
                                                        <span className={`tipo-badge ${asistente.tipoAsistente?.toLowerCase()}`}>
                                                            {asistente.tipoAsistente || 'Usuario'}
                                                        </span>
                                                    </td>
                                                    <td>{asistente.fechaConfirmacion ? formatearFecha(asistente.fechaConfirmacion) : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <p className="total-asistentes">Total: {attendeesModal.asistentes.length} asistente(s)</p>
                                </div>
                            )}
                            <div className="modal-actions">
                                <button className="btn-cancelar" onClick={cerrarAttendeesModal}>
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main >
            <Footer />
        </>
    );
};

export default SuperAdmin;
