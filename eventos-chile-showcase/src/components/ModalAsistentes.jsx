// Modal de gestión de asistentes para Admin
// Muestra lista de asistentes con opciones de:
// - Ver información de cada asistente
// - Eliminar asistente
// - Agregar nuevo asistente manualmente

import { useEffect, useState } from 'react';
import {
    cancelarAsistencia,
    confirmarAsistencia,
    obtenerAsistenciasPorEvento
} from '../services/apiAsistencia';
import '../styles/modalAsistentes.css';
import { logger } from '../utils/logger';
import { showError, showSuccess } from '../utils/toast';
import { validarEmail, validarNombre, validarRUT } from '../utils/validation';

function ModalAsistentes({ evento, onClose, onUpdate }) {
    const [asistentes, setAsistentes] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);
    const [vistaActual, setVistaActual] = useState('lista'); // 'lista' o 'agregar'

    // Estados del formulario de agregar
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        rut: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Estado para confirmacion de eliminacion (reemplaza window.confirm)
    const [confirmEliminar, setConfirmEliminar] = useState({ show: false, id: null, nombre: '' });

    // Cargar asistentes y estadísticas
    const cargarAsistentes = async () => {
        try {
            const resultado = await obtenerAsistenciasPorEvento(evento.id);
            if (resultado.success) {
                setAsistentes(resultado.data || []);
                // Calcular estadísticas básicas
                const totalAsistentes = resultado.data?.length || 0;
                const stats = {
                    total: totalAsistentes,
                    registrados: resultado.data?.filter(a => a.tipoAsistente === 'REGISTRADO').length || 0,
                    invitados: resultado.data?.filter(a => a.tipoAsistente === 'INVITADO').length || 0,
                    disponibles: evento.capacidad ? Math.max(0, evento.capacidad - totalAsistentes) : null
                };
                setEstadisticas(stats);
            }
        } catch (error) {
            logger.error('Error al cargar asistentes:', error);
        }
    };

    // Cargar asistentes al montar
    useEffect(() => {
        cargarAsistentes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Formatear RUT automáticamente
    const formatearRUTInput = (rut) => {
        // Eliminar todo lo que no sea número o K
        let rutLimpio = rut.replace(/[^0-9kK]/g, '');

        // Limitar longitud máxima (8 o 9 dígitos)
        if (rutLimpio.length > 9) {
            rutLimpio = rutLimpio.substring(0, 9);
        }

        // Si no hay nada, retornar vacío
        if (rutLimpio.length === 0) return '';

        // Separar cuerpo y dígito verificador
        const cuerpo = rutLimpio.slice(0, -1);
        const dv = rutLimpio.slice(-1).toUpperCase();

        // Si solo hay un dígito, retornarlo sin formato
        if (cuerpo.length === 0) return dv;

        // Formatear cuerpo con puntos
        const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

        return `${cuerpoFormateado}-${dv}`;
    };

    // Manejar cambios en formulario
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Si es el campo RUT, aplicar formato
        if (name === 'rut') {
            const rutFormateado = formatearRUTInput(value);
            setFormData(prev => ({ ...prev, [name]: rutFormateado }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Limpiar error al escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Mostrar confirmacion de eliminacion
    const mostrarConfirmEliminar = (asistenteId, nombreAsistente) => {
        setConfirmEliminar({ show: true, id: asistenteId, nombre: nombreAsistente });
    };

    // Cancelar eliminacion
    const cancelarConfirmEliminar = () => {
        setConfirmEliminar({ show: false, id: null, nombre: '' });
    };

    // Confirmar y ejecutar eliminacion
    const confirmarEliminar = async () => {
        const { id: asistenteId, nombre } = confirmEliminar;
        if (!asistenteId) return;

        try {
            const resultado = await cancelarAsistencia(asistenteId);
            if (resultado.success) {
                showSuccess(`${nombre} ha sido eliminado exitosamente`);
                cargarAsistentes();
                onUpdate();
            } else {
                showError(resultado.error || 'Error al eliminar asistente');
            }
        } catch (error) {
            logger.error('Error al eliminar asistente:', error);
            showError('Error al eliminar asistente. Por favor, intenta nuevamente.');
        } finally {
            cancelarConfirmEliminar();
        }
    };

    // Agregar asistente manual
    const handleAgregar = async (e) => {
        e.preventDefault();

        // Validar campos
        const newErrors = {};

        if (!validarNombre(formData.nombre)) {
            newErrors.nombre = 'Ingresa el nombre completo (mínimo 2 caracteres)';
        }

        if (!validarEmail(formData.email)) {
            newErrors.email = 'Ingresa un email válido';
        }

        // RUT es obligatorio y debe ser válido
        if (!formData.rut || formData.rut.trim() === '') {
            newErrors.rut = 'El RUT es obligatorio';
        } else if (!validarRUT(formData.rut)) {
            newErrors.rut = 'Ingresa un RUT válido (ej: 12.345.678-9)';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            const resultado = await confirmarAsistencia({
                eventoId: evento.id,
                tipoAsistente: 'INVITADO',
                nombreInvitado: formData.nombre,
                emailInvitado: formData.email,
                rutInvitado: formData.rut
            });

            if (resultado.success) {
                showSuccess('Asistente agregado exitosamente');
                setFormData({ nombre: '', email: '', rut: '' });
                setVistaActual('lista');
                cargarAsistentes();
                onUpdate();
            } else {
                showError(resultado.error);
            }
        } catch (error) {
            logger.error('Error al agregar asistente:', error);
            showError('Error al agregar asistente. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Obtener icono según tipo de asistente
    const obtenerIconoTipo = (tipo) => {
        switch (tipo) {
            case 'registrado': return 'R';
            case 'invitado': return 'I';
            case 'manual': return 'M';
            default: return 'A';
        }
    };

    // Formatear fecha
    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal-overlay-asistentes" onClick={onClose}>
            <div className="modal-asistentes-contenido" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-asistentes-header">
                    <div>
                        <h2 className="modal-asistentes-titulo">
                            Gestión de Asistentes
                        </h2>
                        <p className="modal-asistentes-subtitulo">{evento.titulo}</p>
                    </div>
                    <button className="btn-cerrar-asistentes" onClick={onClose}>×</button>
                </div>

                {/* Estadísticas */}
                {estadisticas && (
                    <div className="estadisticas-asistentes">
                        <div className="stat-card">
                            <div className="stat-numero">{estadisticas.total}</div>
                            <div className="stat-label">Total Asistentes</div>
                        </div>
                        {estadisticas.disponibles !== null && (
                            <div className="stat-card">
                                <div className="stat-numero">{estadisticas.disponibles}</div>
                                <div className="stat-label">Cupos Disponibles</div>
                            </div>
                        )}
                        <div className="stat-card">
                            <div className="stat-numero">{estadisticas.registrados}</div>
                            <div className="stat-label">Registrados</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-numero">{estadisticas.invitados}</div>
                            <div className="stat-label">Invitados</div>
                        </div>
                    </div>
                )}

                {/* Botones de acción */}
                <div className="acciones-asistentes">
                    <button
                        className={`btn-vista ${vistaActual === 'lista' ? 'activo' : ''}`}
                        onClick={() => setVistaActual('lista')}
                    >
                        Ver Lista
                    </button>
                    <button
                        className={`btn-vista ${vistaActual === 'agregar' ? 'activo' : ''}`}
                        onClick={() => setVistaActual('agregar')}
                        disabled={!estadisticas || (estadisticas.disponibles !== null && estadisticas.disponibles <= 0)}
                    >
                        Agregar Asistente
                    </button>
                </div>

                {/* Contenido según vista */}
                <div className="modal-asistentes-body">
                    {vistaActual === 'lista' ? (
                        // VISTA LISTA
                        <div className="lista-asistentes">
                            {asistentes.length === 0 ? (
                                <div className="sin-asistentes">
                                    <p>Aún no hay asistentes confirmados para este evento</p>
                                </div>
                            ) : (
                                <div className="tabla-asistentes-wrapper">
                                    <table className="tabla-asistentes">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Tipo</th>
                                                <th>Nombre</th>
                                                <th>Email</th>
                                                <th>RUT</th>
                                                <th>Fecha Confirmación</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {asistentes.map((asistente, index) => (
                                                <tr key={asistente.id}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <span
                                                            className={`badge-tipo tipo-${asistente.tipoAsistente}`}
                                                            title={asistente.tipoAsistente}
                                                        >
                                                            {obtenerIconoTipo(asistente.tipoAsistente)}
                                                        </span>
                                                    </td>
                                                    <td className="nombre-asistente">
                                                        {asistente.tipoAsistente === 'REGISTRADO'
                                                            ? asistente.usuarioNombre
                                                            : asistente.nombreInvitado}
                                                    </td>
                                                    <td className="email-asistente">
                                                        {asistente.tipoAsistente === 'REGISTRADO'
                                                            ? '-'
                                                            : asistente.emailInvitado}
                                                    </td>
                                                    <td>
                                                        {asistente.tipoAsistente === 'REGISTRADO'
                                                            ? '-'
                                                            : asistente.rutInvitado}
                                                    </td>
                                                    <td className="fecha-asistente">
                                                        {formatearFecha(asistente.fechaConfirmacion)}
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn-eliminar-asistente"
                                                            onClick={() => mostrarConfirmEliminar(
                                                                asistente.id,
                                                                asistente.tipoAsistente === 'REGISTRADO'
                                                                    ? asistente.usuarioNombre
                                                                    : asistente.nombreInvitado
                                                            )}
                                                            title="Eliminar asistente"
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Leyenda de tipos */}
                            <div className="leyenda-tipos">
                                <div className="leyenda-item">
                                    <span className="badge-tipo tipo-REGISTRADO">R</span>
                                    <span>Usuario Registrado</span>
                                </div>
                                <div className="leyenda-item">
                                    <span className="badge-tipo tipo-INVITADO">I</span>
                                    <span>Invitado (sin cuenta)</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // VISTA AGREGAR
                        <div className="agregar-asistente-form">
                            <h3 className="form-titulo">Agregar Nuevo Asistente</h3>
                            <p className="form-descripcion">
                                Completa los datos del asistente. Se enviará un correo de confirmación automáticamente.
                            </p>

                            <form onSubmit={handleAgregar}>
                                <div className="form-group">
                                    <label htmlFor="nombre">Nombre Completo *</label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        placeholder="Ej: Juan Pérez"
                                        className={errors.nombre ? 'input-error' : ''}
                                    />
                                    {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Ej: juan@email.com"
                                        className={errors.email ? 'input-error' : ''}
                                    />
                                    {errors.email && <span className="error-text">{errors.email}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="rut">RUT *</label>
                                    <input
                                        type="text"
                                        id="rut"
                                        name="rut"
                                        value={formData.rut}
                                        onChange={handleChange}
                                        placeholder="Ej: 12.345.678-9"
                                        className={errors.rut ? 'input-error' : ''}
                                        maxLength="12"
                                    />
                                    {errors.rut && <span className="error-text">{errors.rut}</span>}
                                    <small className="form-hint">Se formatea automáticamente mientras escribes. Acepta 8 o 9 dígitos.</small>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn-agregar"
                                        disabled={loading}
                                    >
                                        {loading ? 'Agregando...' : 'Agregar Asistente'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-cancelar"
                                        onClick={() => {
                                            setFormData({ nombre: '', email: '', rut: '' });
                                            setErrors({});
                                            setVistaActual('lista');
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Dialogo de confirmacion de eliminacion */}
                {confirmEliminar.show && (
                    <div className="confirm-eliminar-overlay">
                        <div className="confirm-eliminar-dialog">
                            <h4>Confirmar Eliminacion</h4>
                            <p>Seguro que deseas eliminar a <strong>{confirmEliminar.nombre}</strong>?</p>
                            <div className="confirm-eliminar-actions">
                                <button
                                    className="btn-confirm-cancelar"
                                    onClick={cancelarConfirmEliminar}
                                >
                                    Cancelar
                                </button>
                                <button
                                    className="btn-confirm-eliminar"
                                    onClick={confirmarEliminar}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="modal-asistentes-footer">
                    <button className="btn-cerrar-footer" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ModalAsistentes;
