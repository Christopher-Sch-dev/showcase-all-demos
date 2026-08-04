// Modal de decisión para usuarios NO logueados
// Pregunta si quiere: 1) Login/Registro  o  2) Asistir como Invitado
// Se muestra ANTES del modal principal de asistencia

import { useNavigate } from 'react-router-dom';
import '../styles/modalAsistencia.css';

function ModalDecisionAsistencia({ evento, onClose, onSeleccionarInvitado }) {
    const navigate = useNavigate();

    // Redirigir a login/registro
    const irALogin = () => {
        onClose();
        // Guardar el evento en sessionStorage para volver después del login
        sessionStorage.setItem('evento-pendiente-asistencia', JSON.stringify(evento));
        navigate('/auth');
    };

    // Continuar como invitado
    const continuarInvitado = () => {
        onSeleccionarInvitado();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-contenido-decision" onClick={(e) => e.stopPropagation()}>
                <button className="btn-cerrar-modal" onClick={onClose}>×</button>

                <h2 className="modal-titulo">¿Cómo deseas asistir?</h2>
                <h3 className="evento-titulo">{evento.titulo}</h3>

                <div className="info-evento-modal">
                    <p><strong>Fecha:</strong> {evento.fecha}</p>
                    <p><strong>Lugar:</strong> {evento.lugar}</p>
                </div>

                <div className="opciones-decision">
                    {/* Opción 1: Login/Registro */}
                    <div className="opcion-card">
                        {/* <div className="opcion-icono"></div> Icono eliminado */}
                        <h4>Iniciar Sesión / Registrarse</h4>
                        <p className="opcion-descripcion">
                            Accede con tu cuenta para gestionar tus eventos, ver tu perfil
                            y recibir notificaciones.
                        </p>
                        <ul className="beneficios-lista">
                            <li>Ver todos tus eventos</li>
                            <li>Confirmación más rápida</li>
                            <li>Gestión desde tu perfil</li>
                        </ul>
                        <button
                            className="btn-opcion btn-principal"
                            onClick={irALogin}
                        >
                            Ir a Iniciar Sesión
                        </button>
                    </div>

                    {/* Opción 2: Invitado */}
                    <div className="opcion-card">
                        {/* <div className="opcion-icono"></div> Icono eliminado */}
                        <h4>Asistir como Invitado</h4>
                        <p className="opcion-descripcion">
                            Confirma tu asistencia rápidamente. Te enviaremos un correo
                            con los detalles del evento.
                        </p>
                        <ul className="beneficios-lista">
                            <li>Confirmación rápida</li>
                            <li>Sin necesidad de registro</li>
                            <li>Correo de confirmación</li>
                        </ul>
                        <button
                            className="btn-opcion btn-secundario"
                            onClick={continuarInvitado}
                        >
                            Continuar como Invitado
                        </button>
                    </div>
                </div>

                <p className="texto-ayuda">
                    Consejo: Crear una cuenta te permite gestionar mejor todos tus eventos
                </p>
            </div>
        </div>
    );
}

export default ModalDecisionAsistencia;
