// Componente Chatbot con Gemini API
// Botón flotante con modal de conversación

import Markdown from 'markdown-to-jsx';
import React, { useEffect, useRef, useState } from 'react';
import mascotaGif from '../assets/mascota.gif';
import { useAuth } from '../context/AuthContext';
import { usePreloader } from '../context/PreloaderContext';
import { confirmarAsistencia } from '../services/apiAsistencia';
import { enviarMensaje } from '../services/apiChatbot';
import '../styles/chatbot.css';
import { formatearRUT, validarEmail, validarNombre, validarRUT } from '../utils/validation';

function Chatbot() {
    const { isLoggedIn, user } = useAuth();
    const { isPreloaderActive } = usePreloader();
    const [abierto, setAbierto] = useState(false);
    const [mensajes, setMensajes] = useState([
        {
            tipo: 'bot',
            texto: '¡Hola! Bienvenido a la **Demo Académica** de Eventos Chile.\n\nEste entorno es una demostración de interfaz (Frontend Only). La conexión con IA y Backend está simulada para esta presentación.',
            timestamp: new Date()
        }
    ]);
    const [mensajeActual, setMensajeActual] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [mostrarFormularioAsistencia, setMostrarFormularioAsistencia] = useState(false);
    const [enviandoFormulario, setEnviandoFormulario] = useState(false); // NUEVO: Estado de carga del formulario
    const [eventoAsistencia, setEventoAsistencia] = useState(null);
    const [formularioAsistencia, setFormularioAsistencia] = useState({
        nombre: '',
        rut: '',
        email: ''
    });
    // Contexto conversacional para mantener el último evento mencionado
    const [ultimoEventoMencionadoId, setUltimoEventoMencionadoId] = useState(null);
    const mensajesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll automático al final cuando hay nuevos mensajes
    useEffect(() => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [mensajes]);

    // Focus en input cuando se abre el chat
    useEffect(() => {
        if (abierto && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [abierto]);

    // Función para confirmar asistencia directamente (usuario logueado)
    const confirmarAsistenciaDirecta = async (eventoId, eventoTitulo) => {
        try {
            const resultado = await confirmarAsistencia({
                eventoId: eventoId,
                tipoAsistente: 'REGISTRADO'
            });

            if (resultado.success) {
                const mensajeExito = {
                    tipo: 'bot',
                    texto: `¡Excelente! Has confirmado tu asistencia para **"${eventoTitulo}"**. \n\nRecibirás una notificación con los detalles. ¡Nos vemos allí!`,
                    timestamp: new Date()
                };
                setMensajes(prev => [...prev, mensajeExito]);
            } else {
                // Manejo de errores específicos
                let mensajeError = resultado.error || 'Error al registrar asistencia';

                if (mensajeError.toLowerCase().includes('ya has confirmado') ||
                    mensajeError.toLowerCase().includes('ya confirmado')) {
                    mensajeError = 'Ya tienes confirmada tu asistencia a este evento.';
                } else if (mensajeError.toLowerCase().includes('capacidad') ||
                    mensajeError.toLowerCase().includes('cupo') ||
                    mensajeError.toLowerCase().includes('lleno')) {
                    mensajeError = 'Lo sentimos, este evento ya no tiene cupos disponibles.';
                }

                const botError = {
                    tipo: 'bot',
                    texto: mensajeError,
                    timestamp: new Date()
                };
                setMensajes(prev => [...prev, botError]);
            }
        } catch (error) {
            const mensajeError = {
                tipo: 'bot',
                texto: 'Error al confirmar asistencia. Por favor, intenta nuevamente.',
                timestamp: new Date()
            };
            setMensajes(prev => [...prev, mensajeError]);
        }
    };

    const enviarMensajeUsuario = async (e) => {
        e.preventDefault();

        if (!mensajeActual.trim() || enviando) return;

        const textoUsuario = mensajeActual.trim();
        setMensajeActual('');

        // Agregar mensaje del usuario
        const nuevoMensajeUsuario = {
            tipo: 'usuario',
            texto: textoUsuario,
            timestamp: new Date()
        };
        // Limito el historial a 50 mensajes para evitar acumulacion de memoria
        setMensajes(prev => [...prev, nuevoMensajeUsuario].slice(-50));
        setEnviando(true);

        try {
            const resultado = await enviarMensaje(textoUsuario, null, ultimoEventoMencionadoId);

            if (resultado.success) {
                const respuestaBot = {
                    tipo: 'bot',
                    texto: resultado.data?.respuesta || 'Lo siento, no pude procesar tu mensaje.',
                    timestamp: new Date()
                };
                // Limito el historial a 50 mensajes para evitar acumulacion de memoria
                setMensajes(prev => [...prev, respuestaBot].slice(-50));

                // Actualizar contexto conversacional
                if (resultado.data?.ultimoEventoMencionadoId) {
                    setUltimoEventoMencionadoId(resultado.data.ultimoEventoMencionadoId);
                }

                // FLUJO DE CONFIRMACIÓN DE ASISTENCIA
                // Si el chatbot detecta intención de asistir a un evento
                if (resultado.data?.requiereDatosAsistencia && resultado.data?.eventoId) {
                    console.log('Intención de asistencia detectada:', {
                        eventoId: resultado.data.eventoId,
                        titulo: resultado.data.eventoTitulo,
                        usuarioLogueado: isLoggedIn()
                    });

                    // FLUJO A: Usuario autenticado - confirmación automática
                    if (isLoggedIn()) {
                        console.log('Usuario logueado - Confirmando automáticamente...');

                        const mensajeConfirmando = {
                            tipo: 'bot',
                            texto: 'Confirmando tu asistencia...',
                            timestamp: new Date()
                        };
                        setMensajes(prev => [...prev, mensajeConfirmando]);

                        // Confirmar asistencia directamente con datos del usuario
                        await confirmarAsistenciaDirecta(
                            resultado.data.eventoId,
                            resultado.data.eventoTitulo
                        );
                    }
                    // FLUJO B: Usuario invitado - solicitar datos
                    else {
                        console.log('Usuario no logueado - Mostrando formulario...');

                        // Mensaje del bot informando que se necesitan datos
                        const mensajeFormulario = {
                            tipo: 'bot',
                            texto: 'Para confirmar tu asistencia, necesito algunos datos:',
                            timestamp: new Date()
                        };
                        setMensajes(prev => [...prev, mensajeFormulario]);

                        // Configurar datos del evento y mostrar formulario
                        setEventoAsistencia({
                            id: resultado.data.eventoId,
                            titulo: resultado.data.eventoTitulo
                        });
                        setMostrarFormularioAsistencia(true);

                        // Scroll automático al formulario después de renderizar
                        setTimeout(() => {
                            if (mensajesEndRef.current) {
                                mensajesEndRef.current.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'end'
                                });
                            }
                        }, 100);
                    }
                }
            } else {
                // Manejo de respuestas de error del backend
                console.error('Error en respuesta del chatbot:', resultado);

                let mensajeError = resultado.error || 'Lo siento, ocurrió un error. Por favor, intenta nuevamente.';

                // Personalizar mensajes según el tipo de error
                if (resultado.detalles?.status === 500) {
                    mensajeError = 'Error interno del servidor. Por favor, contacta al administrador.';
                    console.error('Error 500:', resultado.detalles);
                } else if (resultado.detalles?.status === 404) {
                    mensajeError = 'No pude encontrar la información solicitada.';
                } else if (resultado.detalles?.data?.mensaje) {
                    mensajeError = resultado.detalles.data.mensaje;
                }

                const errorBot = {
                    tipo: 'bot',
                    texto: mensajeError,
                    timestamp: new Date()
                };
                setMensajes(prev => [...prev, errorBot]);
            }
        } catch (error) {
            console.error('Excepción al enviar mensaje:', error);

            // Determinar el tipo de error
            let mensajeUsuario = 'Lo siento, ocurrió un error al comunicarme con el servidor.';

            if (error.message?.includes('CORS')) {
                mensajeUsuario = 'Error de conexión (CORS). Por favor, contacta al administrador.';
            } else if (error.message?.includes('Network')) {
                mensajeUsuario = 'Error de red. Verifica tu conexión a internet e intenta nuevamente.';
            } else if (error.message) {
                mensajeUsuario = `${error.message}`;
            }

            const errorBot = {
                tipo: 'bot',
                texto: mensajeUsuario,
                timestamp: new Date()
            };
            setMensajes(prev => [...prev, errorBot]);
        } finally {
            setEnviando(false);
        }
    };

    const limpiarChat = () => {
        setMensajes([
            {
                tipo: 'bot',
                texto: '¡Hola! Soy tu asistente virtual de Eventos Chile. ¿En qué te puedo ayudar?',
                timestamp: new Date()
            }
        ]);
        // Reseteo el contexto conversacional al limpiar el chat
        setUltimoEventoMencionadoId(null);
    };

    return (
        <>
            {/* Botón flotante del chatbot */}
            <button
                className={`chatbot-boton-flotante ${abierto || isPreloaderActive ? 'oculto' : ''}`}
                onClick={() => setAbierto(true)}
                aria-label="Abrir chatbot"
                title="Abrir asistente virtual"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z" fill="currentColor" />
                    <path d="M7 9H17V11H7V9ZM7 12H14V14H7V12Z" fill="currentColor" />
                </svg>
            </button>

            {/* Modal del chatbot */}
            {abierto && (
                <div className="chatbot-overlay" onClick={() => setAbierto(false)}>
                    <div className="chatbot-container" onClick={(e) => e.stopPropagation()}>
                        {/* Header del chatbot */}
                        <div className="chatbot-header">
                            <div className="chatbot-header-info">
                                <div className="chatbot-avatar">
                                    <img
                                        src={mascotaGif}
                                        alt="Mascota"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                    />
                                </div>
                                <div>
                                    <h3 className="chatbot-titulo">Asistente Virtual</h3>
                                    <p className="chatbot-subtitulo">Eventos Chile</p>
                                </div>
                            </div>
                            <div className="chatbot-header-acciones">
                                <button
                                    className="chatbot-btn-icon"
                                    onClick={limpiarChat}
                                    title="Limpiar conversación"
                                    aria-label="Limpiar conversación"
                                >
                                    Limpiar
                                </button>
                                <button
                                    className="chatbot-btn-icon"
                                    onClick={() => setAbierto(false)}
                                    title="Cerrar"
                                    aria-label="Cerrar chatbot"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>

                        {/* Área de mensajes */}
                        <div className="chatbot-mensajes">
                            {mensajes.map((mensaje, index) => (
                                <div
                                    key={index}
                                    className={`chatbot-mensaje ${mensaje.tipo === 'usuario' ? 'mensaje-usuario' : 'mensaje-bot'}`}
                                >
                                    <div className="chatbot-mensaje-contenido">
                                        {mensaje.tipo === 'bot' ? (
                                            <div className="chatbot-markdown">
                                                <Markdown
                                                    options={{
                                                        overrides: {
                                                            p: ({ children }) => children ? <p className="chatbot-markdown-p">{children}</p> : null,
                                                            strong: ({ children }) => children ? <strong className="chatbot-markdown-strong">{children}</strong> : null,
                                                            b: ({ children }) => children ? <strong className="chatbot-markdown-strong">{children}</strong> : null,
                                                            em: ({ children }) => children ? <em className="chatbot-markdown-em">{children}</em> : null,
                                                            i: ({ children }) => children ? <em className="chatbot-markdown-em">{children}</em> : null,
                                                            ul: ({ children }) => children ? <ul className="chatbot-markdown-ul">{children}</ul> : null,
                                                            ol: ({ children }) => children ? <ol className="chatbot-markdown-ol">{children}</ol> : null,
                                                            li: ({ children }) => children ? <li className="chatbot-markdown-li">{children}</li> : null,
                                                            code: ({ children, className }) => {
                                                                if (!children) return null;
                                                                const isInline = !className || !className.includes('language-');
                                                                return isInline ? (
                                                                    <code className="chatbot-markdown-code-inline">{children}</code>
                                                                ) : (
                                                                    <code className="chatbot-markdown-code-block">{children}</code>
                                                                );
                                                            },
                                                            pre: ({ children }) => children ? <pre className="chatbot-markdown-pre">{children}</pre> : null,
                                                            h1: ({ children }) => children ? <h1 className="chatbot-markdown-h1">{children}</h1> : null,
                                                            h2: ({ children }) => children ? <h2 className="chatbot-markdown-h2">{children}</h2> : null,
                                                            h3: ({ children }) => children ? <h3 className="chatbot-markdown-h3">{children}</h3> : null,
                                                            blockquote: ({ children }) => children ? <blockquote className="chatbot-markdown-blockquote">{children}</blockquote> : null,
                                                            a: ({ href, children }) => (href && children) ? (
                                                                <a href={href} className="chatbot-markdown-a" target="_blank" rel="noopener noreferrer">
                                                                    {children}
                                                                </a>
                                                            ) : null
                                                        },
                                                        wrapper: React.Fragment
                                                    }}
                                                >
                                                    {mensaje.texto || ''}
                                                </Markdown>
                                            </div>
                                        ) : (
                                            <p>{mensaje.texto}</p>
                                        )}
                                        <span className="chatbot-timestamp">
                                            {mensaje.timestamp.toLocaleTimeString('es-CL', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {enviando && (
                                <div className="chatbot-mensaje mensaje-bot">
                                    <div className="chatbot-mensaje-contenido">
                                        <div className="chatbot-typing">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={mensajesEndRef} />
                        </div>

                        {/* Input para enviar mensajes */}
                        <form className="chatbot-input-container" onSubmit={enviarMensajeUsuario}>
                            <input
                                ref={inputRef}
                                type="text"
                                className="chatbot-input"
                                placeholder="Escribe tu mensaje..."
                                value={mensajeActual}
                                onChange={(e) => setMensajeActual(e.target.value)}
                                disabled={enviando}
                            />
                            <button
                                type="submit"
                                className="chatbot-btn-enviar"
                                disabled={!mensajeActual.trim() || enviando}
                                aria-label="Enviar mensaje"
                            >
                                {enviando ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
                                    </svg>
                                )}
                            </button>
                        </form>

                        {/* FORMULARIO DE ASISTENCIA - Para usuarios no autenticados */}
                        {mostrarFormularioAsistencia && eventoAsistencia && (
                            <div className="chatbot-formulario-asistencia">
                                <div className="chatbot-formulario-header">
                                    <h4>Registrarse para: {eventoAsistencia.titulo}</h4>
                                    <button
                                        className="chatbot-btn-cerrar-form"
                                        onClick={() => {
                                            console.log('Formulario cerrado por el usuario');
                                            setMostrarFormularioAsistencia(false);
                                            setEventoAsistencia(null);
                                            setFormularioAsistencia({ nombre: '', rut: '', email: '' });
                                        }}
                                        disabled={enviandoFormulario}
                                        aria-label="Cerrar formulario"
                                    >
                                        Cerrar
                                    </button>
                                </div>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        console.log('Enviando formulario de asistencia:', formularioAsistencia);

                                        // === VALIDACIÓN 1: Nombre completo ===
                                        if (!formularioAsistencia.nombre.trim()) {
                                            const mensajeError = {
                                                tipo: 'bot',
                                                texto: 'El nombre es obligatorio.',
                                                timestamp: new Date()
                                            };
                                            setMensajes(prev => [...prev, mensajeError]);
                                            console.warn('Validación fallida: nombre vacío');
                                            return;
                                        }

                                        if (!validarNombre(formularioAsistencia.nombre)) {
                                            const mensajeError = {
                                                tipo: 'bot',
                                                texto: 'Ingresa un nombre válido (solo letras y espacios, mínimo 2 caracteres).',
                                                timestamp: new Date()
                                            };
                                            setMensajes(prev => [...prev, mensajeError]);
                                            console.warn('Validación fallida: nombre inválido');
                                            return;
                                        }

                                        // === VALIDACIÓN 2: Email ===
                                        if (!formularioAsistencia.email.trim()) {
                                            const mensajeError = {
                                                tipo: 'bot',
                                                texto: 'El email es obligatorio.',
                                                timestamp: new Date()
                                            };
                                            setMensajes(prev => [...prev, mensajeError]);
                                            console.warn('Validación fallida: email vacío');
                                            return;
                                        }

                                        if (!validarEmail(formularioAsistencia.email)) {
                                            const mensajeError = {
                                                tipo: 'bot',
                                                texto: 'Por favor ingresa un email válido.',
                                                timestamp: new Date()
                                            };
                                            setMensajes(prev => [...prev, mensajeError]);
                                            console.warn('Validación fallida: email inválido');
                                            return;
                                        }

                                        // === VALIDACIÓN 3: RUT (OBLIGATORIO con Módulo 11) ===
                                        if (!formularioAsistencia.rut.trim()) {
                                            const mensajeError = {
                                                tipo: 'bot',
                                                texto: 'El RUT es obligatorio.',
                                                timestamp: new Date()
                                            };
                                            setMensajes(prev => [...prev, mensajeError]);
                                            console.warn('Validación fallida: RUT vacío');
                                            return;
                                        }

                                        if (!validarRUT(formularioAsistencia.rut)) {
                                            const mensajeError = {
                                                tipo: 'bot',
                                                texto: 'El RUT ingresado no es válido. Verifica el dígito verificador (formato: 12.345.678-9).',
                                                timestamp: new Date()
                                            };
                                            setMensajes(prev => [...prev, mensajeError]);
                                            console.warn('Validación fallida: RUT inválido (Módulo 11)');
                                            return;
                                        }

                                        // === ENVÍO DE DATOS ===
                                        setEnviandoFormulario(true);
                                        console.log('Validaciones OK - Enviando a backend...');

                                        try {
                                            const resultado = await confirmarAsistencia({
                                                eventoId: eventoAsistencia.id,
                                                tipoAsistente: 'INVITADO',
                                                nombreInvitado: formularioAsistencia.nombre.trim(),
                                                emailInvitado: formularioAsistencia.email.trim(),
                                                rutInvitado: formularioAsistencia.rut.trim()
                                            });

                                            if (resultado.success) {
                                                console.log('Asistencia confirmada exitosamente');

                                                const mensajeExito = {
                                                    tipo: 'bot',
                                                    texto: `¡Perfecto! Te has registrado exitosamente para **"${eventoAsistencia.titulo}"**. \n\nRecibirás un correo de confirmación con todos los detalles del evento. ¡Te esperamos!`,
                                                    timestamp: new Date()
                                                };
                                                setMensajes(prev => [...prev, mensajeExito]);

                                                // Limpiar y cerrar formulario
                                                setMostrarFormularioAsistencia(false);
                                                setEventoAsistencia(null);
                                                setFormularioAsistencia({ nombre: '', rut: '', email: '' });
                                            } else {
                                                console.error('Error al confirmar asistencia:', resultado.error);

                                                // Manejo de errores específicos del backend
                                                let mensajeError = resultado.error || 'Error al registrar asistencia';

                                                if (mensajeError.toLowerCase().includes('correo') ||
                                                    mensajeError.toLowerCase().includes('email') ||
                                                    mensajeError.toLowerCase().includes('ya registrado')) {
                                                    mensajeError = 'Este correo ya está registrado para este evento. Si necesitas modificar tu registro, contacta al organizador.';
                                                } else if (mensajeError.toLowerCase().includes('capacidad') ||
                                                    mensajeError.toLowerCase().includes('cupo') ||
                                                    mensajeError.toLowerCase().includes('lleno')) {
                                                    mensajeError = 'Lo sentimos, este evento ya no tiene cupos disponibles.';
                                                } else if (mensajeError.toLowerCase().includes('rut')) {
                                                    mensajeError = 'El RUT ingresado no es válido. Por favor, verifica el formato (XX.XXX.XXX-X).';
                                                }

                                                const botError = {
                                                    tipo: 'bot',
                                                    texto: mensajeError,
                                                    timestamp: new Date()
                                                };
                                                setMensajes(prev => [...prev, botError]);

                                                // Cerrar formulario después del error
                                                setMostrarFormularioAsistencia(false);
                                                setEventoAsistencia(null);
                                                setFormularioAsistencia({ nombre: '', rut: '', email: '' });
                                            }
                                        } catch (error) {
                                            console.error('Excepción al registrar asistencia:', error);

                                            const mensajeError = {
                                                tipo: 'bot',
                                                texto: 'Error al registrar asistencia. Por favor, intenta nuevamente o contacta al soporte.',
                                                timestamp: new Date()
                                            };
                                            setMensajes(prev => [...prev, mensajeError]);

                                            // Cerrar formulario después de excepción
                                            setMostrarFormularioAsistencia(false);
                                            setEventoAsistencia(null);
                                            setFormularioAsistencia({ nombre: '', rut: '', email: '' });
                                        } finally {
                                            setEnviandoFormulario(false);
                                        }
                                    }}
                                >
                                    {/* CAMPOS DEL FORMULARIO */}
                                    <div className="chatbot-formulario-campos">
                                        {/* Campo: Nombre Completo */}
                                        <input
                                            type="text"
                                            id="chatbot-nombre"
                                            name="nombre"
                                            placeholder="Nombre completo *"
                                            value={formularioAsistencia.nombre}
                                            onChange={(e) => setFormularioAsistencia(prev => ({
                                                ...prev,
                                                nombre: e.target.value
                                            }))}
                                            disabled={enviandoFormulario}
                                            required
                                            aria-label="Nombre completo"
                                        />

                                        {/* Campo: RUT con formateo automático */}
                                        <input
                                            type="text"
                                            id="chatbot-rut"
                                            name="rut"
                                            placeholder="RUT * (ej: 12.345.678-9)"
                                            value={formularioAsistencia.rut}
                                            onChange={(e) => {
                                                const valor = e.target.value.replace(/[^0-9Kk]/g, '');
                                                if (valor.length > 0) {
                                                    setFormularioAsistencia(prev => ({
                                                        ...prev,
                                                        rut: formatearRUT(valor)
                                                    }));
                                                } else {
                                                    setFormularioAsistencia(prev => ({
                                                        ...prev,
                                                        rut: ''
                                                    }));
                                                }
                                            }}
                                            disabled={enviandoFormulario}
                                            maxLength="12"
                                            required
                                            aria-label="RUT"
                                        />

                                        {/* Campo: Email */}
                                        <input
                                            type="email"
                                            id="chatbot-email"
                                            name="email"
                                            placeholder="Email *"
                                            value={formularioAsistencia.email}
                                            onChange={(e) => setFormularioAsistencia(prev => ({
                                                ...prev,
                                                email: e.target.value
                                            }))}
                                            disabled={enviandoFormulario}
                                            required
                                            aria-label="Correo electrónico"
                                        />
                                    </div>

                                    {/* BOTONES DE ACCIÓN */}
                                    <div className="chatbot-formulario-acciones">
                                        <button
                                            type="submit"
                                            className="chatbot-btn-confirmar"
                                            disabled={enviandoFormulario}
                                        >
                                            {enviandoFormulario ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Registrando...
                                                </>
                                            ) : (
                                                'Confirmar asistencia'
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            className="chatbot-btn-cancelar"
                                            onClick={() => {
                                                console.log('Cancelar registro');
                                                setMostrarFormularioAsistencia(false);
                                                setEventoAsistencia(null);
                                                setFormularioAsistencia({ nombre: '', rut: '', email: '' });
                                            }}
                                            disabled={enviandoFormulario}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Sugerencias rápidas */}
                        {mensajes.length === 1 && !mostrarFormularioAsistencia && (
                            <div className="chatbot-sugerencias">
                                <p className="chatbot-sugerencias-titulo">Preguntas sugeridas:</p>
                                <div className="chatbot-sugerencias-botones">
                                    <button
                                        className="chatbot-sugerencia-btn"
                                        onClick={() => setMensajeActual('¿Qué eventos hay disponibles?')}
                                    >
                                        ¿Qué eventos hay?
                                    </button>
                                    <button
                                        className="chatbot-sugerencia-btn"
                                        onClick={() => setMensajeActual('¿Hay eventos gratuitos?')}
                                    >
                                        Eventos gratuitos
                                    </button>
                                    <button
                                        className="chatbot-sugerencia-btn"
                                        onClick={() => setMensajeActual('¿Hay eventos este fin de semana?')}
                                    >
                                        Eventos fin de semana
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default Chatbot;
