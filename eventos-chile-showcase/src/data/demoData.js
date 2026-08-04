/**
 * Datos de demostración para Eventos Chile
 * Incluye eventos chilenos variados (presenciales y streaming)
 * Autor: Christopher Schiefelbein
 * 
 * IMPORTANTE: Los nombres de campos deben coincidir con lo que espera el frontend:
 * - titulo (no nombre)
 * - imagen (no imagenUrl)
 * - lugar (no ubicacion)
 * - fecha (no fechaInicio)
 * - tipo (no modalidad)
 * - totalAsistentes (no asistentesConfirmados)
 * - creadoPorNombre (no organizadorNombre)
 * - creadoPorId (no organizadorId)
 * - fechaCreacion (no createdAt)
 */

// Generar fechas dinámicas basadas en la fecha actual
const hoy = new Date();
const generarFecha = (diasAdelante, hora = '20:00') => {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() + diasAdelante);
    return `${fecha.toISOString().split('T')[0]}T${hora}:00`;
};

// Eventos de demostración con campos correctos para el frontend
export const eventosDemo = [
    {
        id: 1,
        titulo: "Lollapalooza Chile 2025",
        descripcion: `<h3>El festival más grande de Latinoamérica</h3>
        <p>Tres días de música con los mejores artistas internacionales y nacionales en el Parque Bicentenario de Cerrillos.</p>
        <ul>
            <li>Más de 100 artistas en 7 escenarios</li>
            <li>Zona gastronómica con food trucks</li>
            <li>Áreas de descanso y activaciones de marca</li>
        </ul>
        <p><strong>Headliners confirmados:</strong> Artistas internacionales de primer nivel</p>`,
        fecha: generarFecha(45, '12:00'),
        fechaFin: generarFecha(47, '23:59'),
        lugar: "Parque Bicentenario de Cerrillos, Santiago",
        capacidad: 80000,
        totalAsistentes: 45230,
        imagen: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=80",
        categoria: "Festival",
        tipo: "PRESENCIAL",
        precio: 125000,
        estado: "ACTIVO",
        creadoPorId: 2,
        creadoPorNombre: "Usuario Demo",
        fechaCreacion: new Date().toISOString()
    },
    {
        id: 2,
        titulo: "Feria del Libro de Santiago - FILSA 2025",
        descripcion: `<h3>FILSA 2025</h3>
        <p>La Feria Internacional del Libro de Santiago reúne a las principales editoriales, autores y amantes de la lectura.</p>
        <ul>
            <li>Más de 200 expositores nacionales e internacionales</li>
            <li>Charlas y firmas de libros con autores destacados</li>
            <li>Talleres de escritura y lectura para todas las edades</li>
            <li>Espacio infantil con actividades educativas</li>
        </ul>`,
        fecha: generarFecha(30, '10:00'),
        fechaFin: generarFecha(45, '21:00'),
        lugar: "Estación Mapocho, Plaza de la Cultura, Santiago",
        capacidad: 5000,
        totalAsistentes: 3420,
        imagen: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=80",
        categoria: "Cultural",
        tipo: "PRESENCIAL",
        precio: 3000,
        estado: "ACTIVO",
        creadoPorId: 2,
        creadoPorNombre: "Usuario Demo",
        fechaCreacion: new Date().toISOString()
    },
    {
        id: 3,
        titulo: "Concierto Sinfónico: Tributo a Los Jaivas",
        descripcion: `<h3>Orquesta Filarmónica de Chile</h3>
        <p>Un homenaje sinfónico a la banda más emblemática del rock chileno. La Orquesta Filarmónica interpreta los clásicos de Los Jaivas con arreglos orquestales únicos.</p>
        <p><strong>Programa:</strong></p>
        <ul>
            <li>Todos Juntos</li>
            <li>Mira Niñita</li>
            <li>Sube a Nacer Conmigo Hermano</li>
            <li>Arauco Tiene Una Pena</li>
        </ul>`,
        fecha: generarFecha(15, '20:00'),
        fechaFin: generarFecha(15, '22:30'),
        lugar: "Teatro Municipal de Santiago, Agustinas 794",
        capacidad: 1500,
        totalAsistentes: 1234,
        imagen: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&q=80",
        categoria: "Concierto",
        tipo: "HIBRIDO",
        precio: 25000,
        streamingUrl: "https://streaming.teatromunicipal.cl/live",
        estado: "ACTIVO",
        creadoPorId: 2,
        creadoPorNombre: "Usuario Demo",
        fechaCreacion: new Date().toISOString()
    },
    {
        id: 4,
        titulo: "TechSummit Chile 2025",
        descripcion: `<h3>El evento tech más importante del año</h3>
        <p>Conferencia de tecnología e innovación con speakers internacionales, workshops prácticos y networking.</p>
        <h4>Tracks disponibles:</h4>
        <ul>
            <li>Inteligencia Artificial y Machine Learning</li>
            <li>Cloud Computing y DevOps</li>
            <li>Ciberseguridad</li>
            <li>Startups y Emprendimiento Tech</li>
        </ul>
        <p><em>Incluye acceso a grabaciones por 30 días</em></p>`,
        fecha: generarFecha(60, '09:00'),
        fechaFin: generarFecha(61, '18:00'),
        lugar: "Centro de Convenciones Espacio Riesco, Santiago",
        capacidad: 3000,
        totalAsistentes: 1856,
        imagen: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
        categoria: "Conferencia",
        tipo: "HIBRIDO",
        precio: 150000,
        streamingUrl: "https://techsummit.cl/streaming",
        estado: "ACTIVO",
        creadoPorId: 2,
        creadoPorNombre: "Usuario Demo",
        fechaCreacion: new Date().toISOString()
    },
    {
        id: 5,
        titulo: "Festival de Viña del Mar 2025",
        descripcion: `<h3>El festival de la canción más importante de Latinoamérica</h3>
        <p>Seis noches de música en vivo desde la Quinta Vergara con artistas nacionales e internacionales.</p>
        <ul>
            <li>Competencia internacional de la canción</li>
            <li>Competencia folclórica</li>
            <li>Shows de humor</li>
            <li>Artistas estelares cada noche</li>
        </ul>
        <p><strong>Transmisión en vivo por streaming para todo el mundo</strong></p>`,
        fecha: generarFecha(90, '22:00'),
        fechaFin: generarFecha(95, '02:00'),
        lugar: "Quinta Vergara, Viña del Mar",
        capacidad: 15000,
        totalAsistentes: 14500,
        imagen: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
        categoria: "Festival",
        tipo: "HIBRIDO",
        precio: 85000,
        streamingUrl: "https://festivaldevina.cl/streaming",
        estado: "ACTIVO",
        creadoPorId: 2,
        creadoPorNombre: "Usuario Demo",
        fechaCreacion: new Date().toISOString()
    },
    {
        id: 6,
        titulo: "Workshop: Desarrollo Web con React",
        descripcion: `<h3>Aprende React desde cero hasta avanzado</h3>
        <p>Workshop 100% online en vivo con ejercicios prácticos y proyecto final.</p>
        <h4>Contenido:</h4>
        <ul>
            <li>Fundamentos de React y JSX</li>
            <li>Hooks y Context API</li>
            <li>React Router y navegación</li>
            <li>Integración con APIs REST</li>
            <li>Deploy en Vercel</li>
        </ul>
        <p><strong>Incluye:</strong> Certificado de participación y acceso a comunidad Discord</p>`,
        fecha: generarFecha(20, '19:00'),
        fechaFin: generarFecha(20, '22:00'),
        lugar: "Online - Plataforma Zoom",
        capacidad: 100,
        totalAsistentes: 67,
        imagen: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
        categoria: "Workshop",
        tipo: "STREAMING",
        precio: 45000,
        streamingUrl: "https://zoom.us/j/workshop-react",
        estado: "ACTIVO",
        creadoPorId: 2,
        creadoPorNombre: "Usuario Demo",
        fechaCreacion: new Date().toISOString()
    },
    {
        id: 7,
        titulo: "Fiestas Patrias: Fondas del Parque O'Higgins",
        descripcion: `<h3>Celebra el 18 de Septiembre en grande</h3>
        <p>Las tradicionales fondas del Parque O'Higgins con lo mejor de la cultura chilena.</p>
        <ul>
            <li>Comida típica: empanadas, anticuchos, choripanes</li>
            <li>Juegos tradicionales chilenos</li>
            <li>Shows de cueca y música folclórica</li>
            <li>Zona de rodeo y exhibiciones ecuestres</li>
        </ul>
        <p><strong>Entrada liberada - Abierto para toda la familia</strong></p>`,
        fecha: generarFecha(100, '11:00'),
        fechaFin: generarFecha(105, '02:00'),
        lugar: "Parque O'Higgins, Av. Beauchef 1255, Santiago",
        capacidad: 50000,
        totalAsistentes: 28900,
        imagen: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&q=80",
        categoria: "Cultural",
        tipo: "PRESENCIAL",
        precio: 0,
        estado: "ACTIVO",
        creadoPorId: 2,
        creadoPorNombre: "Usuario Demo",
        fechaCreacion: new Date().toISOString()
    },
    {
        id: 8,
        titulo: "Gaming Night: Torneo de eSports Chile",
        descripcion: `<h3>El torneo de videojuegos más grande del sur</h3>
        <p>Competencias profesionales de los juegos más populares con premios en efectivo.</p>
        <h4>Juegos del torneo:</h4>
        <ul>
            <li>League of Legends - Copa Chile</li>
            <li>Valorant - Clasificatorio regional</li>
            <li>FIFA 25 - Torneo abierto</li>
            <li>Counter-Strike 2 - Showmatch</li>
        </ul>
        <p><strong>Transmisión en vivo por Twitch y YouTube</strong></p>`,
        fecha: generarFecha(25, '16:00'),
        fechaFin: generarFecha(26, '23:00'),
        lugar: "Movistar Arena, Av. Tupper 1941, Santiago",
        capacidad: 8000,
        totalAsistentes: 5670,
        imagen: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
        categoria: "Gaming",
        tipo: "HIBRIDO",
        precio: 15000,
        streamingUrl: "https://twitch.tv/esportschile",
        estado: "ACTIVO",
        creadoPorId: 2,
        creadoPorNombre: "Usuario Demo",
        fechaCreacion: new Date().toISOString()
    }
];

/**
 * Usuarios de demostración para testing rápido
 * 
 * CREDENCIALES DEMO:
 * - Super Admin: admin@eventochile.cl / Admin123! (acceso total al sistema)
 * - Usuario Demo: demo@eventochile.cl / Demo123! (usuario normal con eventos creados)
 * 
 * NOTA: El usuario demo (ID: 2) tiene asignados todos los eventos para demostrar
 * el flujo completo de gestión de eventos (crear, editar, eliminar, ver asistentes).
 */
export const usuariosDemo = [
    {
        // SUPER ADMIN - Único usuario con acceso al Panel Super Admin
        // Puede: gestionar usuarios, aprobar/rechazar solicitudes de eliminación, ver estadísticas
        id: 1,
        email: "admin@eventochile.cl",
        password: "Admin123!",
        nombre: "Administrador Sistema",
        rut: "11.111.111-1",
        rol: "SUPER_ADMIN",
        region: "Región Metropolitana",
        comuna: "Santiago",
        telefono: "+56 9 1234 5678",
        fotoUrl: null,
        createdAt: new Date().toISOString()
    },
    {
        // USUARIO DEMO - Usuario normal para demostrar funcionalidades
        // Puede: crear eventos, editar sus eventos, ver asistentes, solicitar eliminación
        // IMPORTANTE: Todos los eventos demo están asignados a este usuario (creadoPorId: 2)
        id: 2,
        email: "demo@eventochile.cl",
        password: "Demo123!",
        nombre: "Usuario Demo",
        rut: "22.222.222-2",
        rol: "USER",
        region: "Región Metropolitana",
        comuna: "Providencia",
        telefono: "+56 9 8765 4321",
        fotoUrl: null,
        createdAt: new Date().toISOString()
    }
];

// Asistencias de demostración
export const asistenciasDemo = [
    {
        id: 1,
        usuarioId: 3,
        eventoId: 1,
        fechaConfirmacion: new Date().toISOString(),
        estado: "CONFIRMADO"
    },
    {
        id: 2,
        usuarioId: 3,
        eventoId: 3,
        fechaConfirmacion: new Date().toISOString(),
        estado: "CONFIRMADO"
    }
];

// Solicitudes de eliminación de demostración
export const solicitudesDemo = [
    {
        id: 1,
        eventoId: 2,
        solicitanteId: 2,
        motivo: "El evento fue cancelado por el organizador original",
        estado: "PENDIENTE",
        fechaSolicitud: new Date().toISOString(),
        respuesta: null,
        fechaRespuesta: null
    }
];

/**
 * Asegura que los usuarios demo siempre existan con las credenciales correctas
 * Esto se ejecuta SIEMPRE para garantizar que las credenciales demo funcionen
 */
const ensureDemoUsersExist = () => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');

    // Credenciales de usuarios demo que deben existir siempre
    const demoUsers = [
        {
            id: 1,
            email: "admin@eventochile.cl",
            password: "Admin123!",
            nombre: "Administrador Sistema",
            rut: "11.111.111-1",
            rol: "SUPER_ADMIN",
            region: "Región Metropolitana",
            comuna: "Santiago",
            telefono: "+56 9 1234 5678",
            fotoUrl: null,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            email: "demo@eventochile.cl",
            password: "Demo123!",
            nombre: "Usuario Demo",
            rut: "22.222.222-2",
            rol: "USER",
            region: "Región Metropolitana",
            comuna: "Providencia",
            telefono: "+56 9 8765 4321",
            fotoUrl: null,
            createdAt: new Date().toISOString()
        }
    ];

    let updated = false;

    demoUsers.forEach(demoUser => {
        const existingIndex = usuarios.findIndex(u => u.email.toLowerCase() === demoUser.email.toLowerCase());

        if (existingIndex === -1) {
            // Usuario no existe, agregarlo
            usuarios.push(demoUser);
            updated = true;
            console.log(`[DEMO] Usuario demo ${demoUser.email} creado`);
        } else {
            // Usuario existe, actualizar contraseña y datos críticos
            usuarios[existingIndex] = {
                ...usuarios[existingIndex],
                password: demoUser.password,
                rol: demoUser.rol,
                nombre: demoUser.nombre
            };
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        console.log('[DEMO] Usuarios demo actualizados correctamente');
    }
};

/**
 * Asegura que todos los eventos demo pertenezcan al Usuario Demo (ID: 2)
 * Esto permite que el usuario demo pueda gestionar (editar/eliminar) todos los eventos
 */
const ensureDemoEventsOwnership = () => {
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');

    if (eventos.length === 0) return;

    let updated = false;
    const DEMO_USER_ID = 2;
    const DEMO_USER_NAME = "Usuario Demo";

    eventos.forEach(evento => {
        // Si el evento no pertenece al usuario demo, actualizarlo
        // Actualizamos TODOS los campos de propiedad para asegurar compatibilidad
        if (evento.creadoPorId !== DEMO_USER_ID || evento.organizadorId !== DEMO_USER_ID) {
            evento.creadoPorId = DEMO_USER_ID;
            evento.creadoPorNombre = DEMO_USER_NAME;
            evento.organizadorId = DEMO_USER_ID;
            evento.organizadorNombre = DEMO_USER_NAME;
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem('eventos', JSON.stringify(eventos));
        console.log('[DEMO] Eventos asignados al Usuario Demo (ID: 2)');
    }
};

/**
 * Inicializa localStorage con datos demo si está vacío
 */
export const initializeDemoData = () => {
    // Inicializar datos base si no existen
    if (!localStorage.getItem('demo_initialized')) {
        localStorage.setItem('eventos', JSON.stringify(eventosDemo));
        localStorage.setItem('usuarios', JSON.stringify(usuariosDemo));
        localStorage.setItem('asistencias', JSON.stringify(asistenciasDemo));
        localStorage.setItem('solicitudes', JSON.stringify(solicitudesDemo));
        localStorage.setItem('next_evento_id', '9');
        localStorage.setItem('next_usuario_id', '3');
        localStorage.setItem('next_asistencia_id', '3');
        localStorage.setItem('next_solicitud_id', '2');
        localStorage.setItem('demo_initialized', 'true');
        console.log('[DEMO] Datos de demostración inicializados correctamente');
    }

    // SIEMPRE asegurar que los usuarios demo existan con credenciales correctas
    ensureDemoUsersExist();

    // SIEMPRE asegurar que los eventos pertenezcan al Usuario Demo
    ensureDemoEventsOwnership();
};

/**
 * Reinicia todos los datos demo (útil para testing)
 */
export const resetDemoData = () => {
    localStorage.removeItem('demo_initialized');
    localStorage.removeItem('eventos');
    localStorage.removeItem('usuarios');
    localStorage.removeItem('asistencias');
    localStorage.removeItem('solicitudes');
    localStorage.removeItem('next_evento_id');
    localStorage.removeItem('next_usuario_id');
    localStorage.removeItem('next_asistencia_id');
    localStorage.removeItem('next_solicitud_id');
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user-data');
    initializeDemoData();
    console.log('[DEMO] Datos de demostración reiniciados');
};
