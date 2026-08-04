/**
 * Servicio de localStorage para operaciones CRUD
 * Reemplaza las llamadas al backend Spring Boot
 * Autor: Christopher Schiefelbein
 */

import { initializeDemoData } from '../data/demoData';

// Inicializar datos demo al cargar el módulo
initializeDemoData();

// ==================== UTILIDADES ====================

/**
 * Obtiene el siguiente ID disponible para una entidad
 */
const getNextId = (key) => {
    const currentId = parseInt(localStorage.getItem(`next_${key}_id`) || '1');
    localStorage.setItem(`next_${key}_id`, String(currentId + 1));
    return currentId;
};

/**
 * Simula un delay de red para hacer la experiencia más realista
 */
const simulateNetworkDelay = (ms = 100) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// ==================== EVENTOS ====================

/**
 * Obtiene todos los eventos
 */
export const getEventos = async () => {
    await simulateNetworkDelay();
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    return eventos;
};

/**
 * Obtiene eventos vigentes (fecha fin >= hoy)
 */
export const getEventosVigentes = async () => {
    await simulateNetworkDelay();
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    const hoy = new Date();
    return eventos.filter(e => {
        const fechaFin = new Date(e.fechaFin);
        return fechaFin >= hoy && e.estado === 'ACTIVO';
    });
};

/**
 * Obtiene eventos pasados (fecha fin < hoy)
 */
export const getEventosPasados = async () => {
    await simulateNetworkDelay();
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    const hoy = new Date();
    return eventos.filter(e => {
        const fechaFin = new Date(e.fechaFin);
        return fechaFin < hoy;
    });
};

/**
 * Obtiene un evento por ID
 */
export const getEventoById = async (id) => {
    await simulateNetworkDelay();
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    return eventos.find(e => e.id === parseInt(id)) || null;
};

/**
 * Crea un nuevo evento
 */
export const createEvento = async (eventoData) => {
    await simulateNetworkDelay(200);
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');

    const nuevoEvento = {
        ...eventoData,
        id: getNextId('evento'),
        asistentesConfirmados: 0,
        estado: 'ACTIVO',
        createdAt: new Date().toISOString()
    };

    eventos.push(nuevoEvento);
    localStorage.setItem('eventos', JSON.stringify(eventos));

    return nuevoEvento;
};

/**
 * Actualiza un evento existente
 */
export const updateEvento = async (id, eventoData) => {
    await simulateNetworkDelay(200);
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    const index = eventos.findIndex(e => e.id === parseInt(id));

    if (index === -1) {
        throw new Error('Evento no encontrado');
    }

    eventos[index] = {
        ...eventos[index],
        ...eventoData,
        id: parseInt(id),
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('eventos', JSON.stringify(eventos));
    return eventos[index];
};

/**
 * Elimina un evento
 */
export const deleteEvento = async (id) => {
    await simulateNetworkDelay(200);
    let eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    const eventoEliminado = eventos.find(e => e.id === parseInt(id));

    if (!eventoEliminado) {
        throw new Error('Evento no encontrado');
    }

    eventos = eventos.filter(e => e.id !== parseInt(id));
    localStorage.setItem('eventos', JSON.stringify(eventos));

    // Eliminar asistencias asociadas
    let asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');
    asistencias = asistencias.filter(a => a.eventoId !== parseInt(id));
    localStorage.setItem('asistencias', JSON.stringify(asistencias));

    return eventoEliminado;
};

/**
 * Obtiene eventos por usuario (creador)
 * Busca por creadoPorId que es el campo usado en los eventos demo
 */
export const getEventosByUsuario = async (usuarioId) => {
    await simulateNetworkDelay();
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    // Filtrar por creadoPorId (campo principal) u organizadorId (legacy fallback)
    return eventos.filter(e =>
        e.creadoPorId === parseInt(usuarioId) ||
        e.organizadorId === parseInt(usuarioId)
    );
};

// ==================== USUARIOS ====================

/**
 * Obtiene todos los usuarios
 */
export const getUsuarios = async () => {
    await simulateNetworkDelay();
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    // Retornar sin contraseñas por seguridad
    return usuarios.map(({ password, ...user }) => user);
};

/**
 * Obtiene un usuario por ID
 */
export const getUsuarioById = async (id) => {
    await simulateNetworkDelay();
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === parseInt(id));
    if (usuario) {
        const { password, ...userSinPassword } = usuario;
        return userSinPassword;
    }
    return null;
};

/**
 * Obtiene un usuario por email
 */
export const getUsuarioByEmail = async (email) => {
    await simulateNetworkDelay();
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    return usuarios.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

/**
 * Crea un nuevo usuario
 */
export const createUsuario = async (userData) => {
    await simulateNetworkDelay(200);
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Verificar si el email ya existe
    if (usuarios.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error('El email ya está registrado');
    }

    const nuevoUsuario = {
        ...userData,
        id: getNextId('usuario'),
        rol: userData.rol || 'USUARIO',
        createdAt: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    const { password, ...userSinPassword } = nuevoUsuario;
    return userSinPassword;
};

/**
 * Actualiza un usuario existente
 */
export const updateUsuario = async (id, userData) => {
    await simulateNetworkDelay(200);
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const index = usuarios.findIndex(u => u.id === parseInt(id));

    if (index === -1) {
        throw new Error('Usuario no encontrado');
    }

    // Si se cambia el email, verificar que no exista
    if (userData.email && userData.email !== usuarios[index].email) {
        if (usuarios.some(u => u.email.toLowerCase() === userData.email.toLowerCase() && u.id !== parseInt(id))) {
            throw new Error('El email ya está registrado');
        }
    }

    usuarios[index] = {
        ...usuarios[index],
        ...userData,
        id: parseInt(id),
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    const { password, ...userSinPassword } = usuarios[index];
    return userSinPassword;
};

/**
 * Elimina un usuario
 */
export const deleteUsuario = async (id) => {
    await simulateNetworkDelay(200);
    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioEliminado = usuarios.find(u => u.id === parseInt(id));

    if (!usuarioEliminado) {
        throw new Error('Usuario no encontrado');
    }

    usuarios = usuarios.filter(u => u.id !== parseInt(id));
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Eliminar asistencias del usuario
    let asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');
    asistencias = asistencias.filter(a => a.usuarioId !== parseInt(id));
    localStorage.setItem('asistencias', JSON.stringify(asistencias));

    const { password, ...userSinPassword } = usuarioEliminado;
    return userSinPassword;
};

// ==================== AUTENTICACIÓN ====================

/**
 * Valida credenciales y retorna usuario si son correctas
 */
export const validateCredentials = async (email, password) => {
    await simulateNetworkDelay(300);
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!usuario) {
        return null;
    }

    const { password: pwd, ...userSinPassword } = usuario;
    return userSinPassword;
};

/**
 * Genera un token JWT fake para mantener compatibilidad
 */
export const generateFakeToken = (usuario) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        sub: usuario.email,
        id: usuario.id,
        rol: usuario.rol,
        iat: Date.now(),
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
    }));
    const signature = btoa('demo-signature-eventos-chile');
    return `${header}.${payload}.${signature}`;
};

// ==================== ASISTENCIAS ====================

/**
 * Obtiene todas las asistencias
 */
export const getAsistencias = async () => {
    await simulateNetworkDelay();
    return JSON.parse(localStorage.getItem('asistencias') || '[]');
};

/**
 * Obtiene asistencias por usuario
 */
export const getAsistenciasByUsuario = async (usuarioId) => {
    await simulateNetworkDelay();
    const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');
    return asistencias.filter(a => a.usuarioId === parseInt(usuarioId));
};

/**
 * Obtiene asistencias por evento
 */
export const getAsistenciasByEvento = async (eventoId) => {
    await simulateNetworkDelay();
    const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');
    return asistencias.filter(a => a.eventoId === parseInt(eventoId));
};

/**
 * Confirma asistencia a un evento
 */
export const confirmarAsistencia = async (asistenciaData) => {
    await simulateNetworkDelay(200);
    const asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');

    // Verificar si ya existe la asistencia
    const existente = asistencias.find(
        a => a.usuarioId === parseInt(asistenciaData.usuarioId) &&
            a.eventoId === parseInt(asistenciaData.eventoId)
    );

    if (existente) {
        throw new Error('Ya confirmaste asistencia a este evento');
    }

    const nuevaAsistencia = {
        id: getNextId('asistencia'),
        usuarioId: parseInt(asistenciaData.usuarioId),
        eventoId: parseInt(asistenciaData.eventoId),
        fechaConfirmacion: new Date().toISOString(),
        estado: 'CONFIRMADO'
    };

    asistencias.push(nuevaAsistencia);
    localStorage.setItem('asistencias', JSON.stringify(asistencias));

    // Incrementar contador de asistentes en el evento
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    const eventoIndex = eventos.findIndex(e => e.id === parseInt(asistenciaData.eventoId));
    if (eventoIndex !== -1) {
        eventos[eventoIndex].asistentesConfirmados = (eventos[eventoIndex].asistentesConfirmados || 0) + 1;
        localStorage.setItem('eventos', JSON.stringify(eventos));
    }

    return nuevaAsistencia;
};

/**
 * Cancela una asistencia
 */
export const cancelarAsistencia = async (asistenciaId) => {
    await simulateNetworkDelay(200);
    let asistencias = JSON.parse(localStorage.getItem('asistencias') || '[]');
    const asistencia = asistencias.find(a => a.id === parseInt(asistenciaId));

    if (!asistencia) {
        throw new Error('Asistencia no encontrada');
    }

    asistencias = asistencias.filter(a => a.id !== parseInt(asistenciaId));
    localStorage.setItem('asistencias', JSON.stringify(asistencias));

    // Decrementar contador de asistentes en el evento
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    const eventoIndex = eventos.findIndex(e => e.id === asistencia.eventoId);
    if (eventoIndex !== -1 && eventos[eventoIndex].asistentesConfirmados > 0) {
        eventos[eventoIndex].asistentesConfirmados -= 1;
        localStorage.setItem('eventos', JSON.stringify(eventos));
    }

    return asistencia;
};

// ==================== SOLICITUDES DE ELIMINACIÓN ====================

/**
 * Obtiene todas las solicitudes
 */
export const getSolicitudes = async () => {
    await simulateNetworkDelay();
    return JSON.parse(localStorage.getItem('solicitudes') || '[]');
};

/**
 * Obtiene solicitudes pendientes
 */
export const getSolicitudesPendientes = async () => {
    await simulateNetworkDelay();
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]');
    return solicitudes.filter(s => s.estado === 'PENDIENTE');
};

/**
 * Cuenta solicitudes pendientes
 */
export const countSolicitudesPendientes = async () => {
    const pendientes = await getSolicitudesPendientes();
    return { pendientes: pendientes.length };
};

/**
 * Obtiene solicitudes por usuario
 */
export const getSolicitudesByUsuario = async (usuarioId) => {
    await simulateNetworkDelay();
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]');
    return solicitudes.filter(s => s.solicitanteId === parseInt(usuarioId));
};

/**
 * Crea una solicitud de eliminación
 */
export const createSolicitud = async (solicitudData) => {
    await simulateNetworkDelay(200);
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]');

    // Verificar si ya existe una solicitud pendiente para este evento
    const existente = solicitudes.find(
        s => s.eventoId === parseInt(solicitudData.eventoId) && s.estado === 'PENDIENTE'
    );

    if (existente) {
        throw new Error('Ya existe una solicitud pendiente para este evento');
    }

    const nuevaSolicitud = {
        id: getNextId('solicitud'),
        eventoId: parseInt(solicitudData.eventoId),
        solicitanteId: parseInt(solicitudData.solicitanteId),
        motivo: solicitudData.motivo,
        estado: 'PENDIENTE',
        fechaSolicitud: new Date().toISOString(),
        respuesta: null,
        fechaRespuesta: null
    };

    solicitudes.push(nuevaSolicitud);
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));

    return nuevaSolicitud;
};

/**
 * Aprueba una solicitud (y elimina el evento)
 */
export const aprobarSolicitud = async (id, respuestaData = {}) => {
    await simulateNetworkDelay(300);
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]');
    const index = solicitudes.findIndex(s => s.id === parseInt(id));

    if (index === -1) {
        throw new Error('Solicitud no encontrada');
    }

    const solicitud = solicitudes[index];

    // Eliminar el evento asociado
    await deleteEvento(solicitud.eventoId);

    // Actualizar la solicitud
    solicitudes[index] = {
        ...solicitud,
        estado: 'APROBADA',
        respuesta: respuestaData.respuesta || 'Solicitud aprobada',
        fechaRespuesta: new Date().toISOString()
    };

    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
    return solicitudes[index];
};

/**
 * Rechaza una solicitud
 */
export const rechazarSolicitud = async (id, respuestaData = {}) => {
    await simulateNetworkDelay(200);
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]');
    const index = solicitudes.findIndex(s => s.id === parseInt(id));

    if (index === -1) {
        throw new Error('Solicitud no encontrada');
    }

    solicitudes[index] = {
        ...solicitudes[index],
        estado: 'RECHAZADA',
        respuesta: respuestaData.respuesta || 'Solicitud rechazada',
        fechaRespuesta: new Date().toISOString()
    };

    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
    return solicitudes[index];
};

/**
 * Obtiene historial de solicitudes resueltas
 */
export const getHistorialSolicitudes = async () => {
    await simulateNetworkDelay();
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]');
    return solicitudes.filter(s => s.estado !== 'PENDIENTE');
};

/**
 * Obtiene una solicitud por ID
 */
export const getSolicitudById = async (id) => {
    await simulateNetworkDelay();
    const solicitudes = JSON.parse(localStorage.getItem('solicitudes') || '[]');
    return solicitudes.find(s => s.id === parseInt(id)) || null;
};
