// Modal para confirmar asistencia a un evento
// Detecta si el usuario está logueado o no
// - Logueado: confirmación rápida con sus datos
// - Invitado: formulario con validaciones (nombre, email, RUT)

import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { confirmarAsistencia, obtenerAsistenciasPorEvento } from '../services/apiAsistencia';
import '../styles/modalAsistencia.css';
import '../styles/modalDecision.css';
import { logger } from '../utils/logger';
import { showError, showSuccess } from '../utils/toast';
import { formatearRUT, validarEmail, validarNombre, validarRUT } from '../utils/validation';

function ModalAsistencia({ evento, onClose, onSuccess }) {
    const { user, isLoggedIn } = useAuth();

    // Estados del formulario (solo para invitados)
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        rut: ''
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [asistentesActuales, setAsistentesActuales] = useState(0);

    // Manejar cambios en inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Limpiar error al escribir
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    // Formateo automático del RUT mientras se escribe
    const handleRutChange = (e) => {
        let value = e.target.value;

        // Solo permitir números y k/K
        value = value.replace(/[^0-9kK]/g, '').toLowerCase();

        // Limitar a 9 caracteres (8 números + 1 dígito verificador)
        if (value.length > 9) {
            value = value.slice(0, 9);
        }

        // Formatear con puntos y guión si hay suficientes caracteres
        if (value.length > 1) {
            value = formatearRUT(value);
        }

        setFormData(prev => ({ ...prev, rut: value }));

        // Limpiar error al escribir
        if (errors.rut) {
            setErrors(prev => ({ ...prev, rut: null }));
        }
    };

    // Cargar número de asistentes
    useEffect(() => {
        const cargarAsistentes = async () => {
            try {
                const resultado = await obtenerAsistenciasPorEvento(evento.id);
                if (resultado.success) {
                    setAsistentesActuales(resultado.data?.length || 0);
                }
            } catch (error) {
                logger.error('ModalAsistencia: Error al cargar asistentes', error);
            }
        };
        cargarAsistentes();
    }, [evento.id]);

    // Confirmar asistencia de usuario logueado
    const confirmarLogueado = async () => {
        setLoading(true);

        // DEBUG: Log para consola web
        console.log('[ModalAsistencia] Confirmando asistencia usuario logueado:', {
            eventoId: evento.id,
            eventoTitulo: evento.titulo,
            tipoAsistente: 'REGISTRADO'
        });

        try {
            const resultado = await confirmarAsistencia({
                eventoId: evento.id,
                tipoAsistente: 'REGISTRADO'
            });

            // DEBUG: Log del resultado
            console.log('[ModalAsistencia] Resultado confirmación logueado:', resultado);

            if (resultado.success) {
                showSuccess('Asistencia confirmada exitosamente');
                setAsistentesActuales(prev => prev + 1);
                onSuccess();
                onClose();
            } else {
                console.error('[ModalAsistencia] Error en confirmación:', resultado.error);
                showError(resultado.error || 'Error al confirmar asistencia');
            }
        } catch (error) {
            console.error('[ModalAsistencia] Excepción al confirmar (logueado):', error);
            logger.error('ModalAsistencia: Error al confirmar asistencia (logueado)', error);
            showError('Error al confirmar asistencia. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Confirmar asistencia de invitado
    const confirmarInvitado = async (e) => {
        e.preventDefault();

        // Validar todos los campos
        const newErrors = {};

        if (!validarNombre(formData.nombre)) {
            newErrors.nombre = 'Ingresa tu nombre completo (mínimo 3 caracteres)';
        }

        if (!validarEmail(formData.email)) {
            newErrors.email = 'Ingresa un email válido';
        }

        if (!validarRUT(formData.rut)) {
            newErrors.rut = 'Ingresa un RUT válido (ej: 12.345.678-9)';
        }

        // Si hay errores, mostrarlos y no enviar
        if (Object.keys(newErrors).length > 0) {
            console.log('[ModalAsistencia] Errores de validación:', newErrors);
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        // DEBUG: Log para consola web
        const datosEnvio = {
            eventoId: evento.id,
            tipoAsistente: 'INVITADO',
            nombreInvitado: formData.nombre,
            emailInvitado: formData.email,
            rutInvitado: formData.rut
        };
        console.log('[ModalAsistencia] Confirmando asistencia invitado:', datosEnvio);

        try {
            const resultado = await confirmarAsistencia(datosEnvio);

            // DEBUG: Log del resultado
            console.log('[ModalAsistencia] Resultado confirmación invitado:', resultado);

            if (resultado.success) {
                showSuccess('Asistencia confirmada exitosamente');
                setAsistentesActuales(prev => prev + 1);
                onSuccess();
                onClose();
            } else {
                console.error('[ModalAsistencia] Error en confirmación invitado:', resultado.error);
                showError(resultado.error || 'Error al confirmar asistencia');
            }
        } catch (error) {
            console.error('[ModalAsistencia] Excepción al confirmar (invitado):', error);
            logger.error('ModalAsistencia: Error al confirmar asistencia (invitado)', error);
            showError('Error al confirmar asistencia. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Calcular cupos disponibles
    const cuposDisponibles = evento.capacidad - asistentesActuales;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-contenido-asistencia" onClick={(e) => e.stopPropagation()}>
                <button className="btn-cerrar-modal" onClick={onClose}>×</button>

                <h2 className="modal-titulo">Confirmar Asistencia</h2>
                <h3 className="evento-titulo">{evento.titulo}</h3>

                <div className="info-evento-modal">
                    <p><strong>Fecha:</strong> {evento.fecha}</p>
                    <p><strong>Lugar:</strong> {evento.lugar}</p>
                    <p><strong>Cupos:</strong> {asistentesActuales}/{evento.capacidad}</p>
                    <p className={cuposDisponibles < 10 ? 'cupos-limitados' : ''}>
                        {cuposDisponibles > 0
                            ? `${cuposDisponibles} cupos disponibles`
                            : 'Sin cupos disponibles'
                        }
                    </p>
                </div>

                {cuposDisponibles === 0 ? (
                    // Sin cupos - mostrar mensaje
                    <div className="sin-cupos">
                        <p>Lo sentimos, este evento está lleno</p>
                        <button className="btn-cerrar-principal" onClick={onClose}>
                            Cerrar
                        </button>
                    </div>
                ) : isLoggedIn() ? (
                    // Usuario logueado - confirmación rápida
                    <div className="confirmacion-logueado">
                        <p className="texto-info">
                            ¿Confirmas tu asistencia a este evento?
                        </p>
                        <button
                            className="btn-confirmar-principal"
                            onClick={confirmarLogueado}
                            disabled={loading}
                        >
                            {loading ? 'Confirmando...' : 'Confirmar Asistencia'}
                        </button>
                    </div>
                ) : (
                    // Invitado - formulario completo
                    <form onSubmit={confirmarInvitado} className="form-invitado">
                        <p className="texto-info">
                            Para confirmar tu asistencia, necesitamos tus datos:
                        </p>

                        <div className="form-group">
                            <label>Nombre Completo *</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                className={errors.nombre ? 'input-error' : ''}
                                placeholder="Juan Pérez González"
                                required
                            />
                            {errors.nombre && <span className="error-text">{errors.nombre}</span>}
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'input-error' : ''}
                                placeholder="juan@email.com"
                                required
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>RUT *</label>
                            <input
                                type="text"
                                name="rut"
                                value={formData.rut}
                                onChange={handleRutChange}
                                className={errors.rut ? 'input-error' : ''}
                                placeholder="12.345.678-9"
                                maxLength={12}
                                required
                            />
                            {errors.rut && <span className="error-text">{errors.rut}</span>}
                        </div>

                        <button
                            type="submit"
                            className="btn-confirmar-principal"
                            disabled={loading}
                        >
                            {loading ? 'Confirmando...' : 'Confirmar Asistencia'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ModalAsistencia;
