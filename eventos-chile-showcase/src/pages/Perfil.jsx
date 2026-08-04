// Página de perfil con información del usuario, eventos y estadísticas
// Incluye formulario de edición con regiones/comunas dinámicas

import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import iconoPerfil from '../assets/ICONOperfil.png';
import Footer from '../components/Footer';
import ImageCropper from '../components/ImageCropper';
import ModalConfirmacion from '../components/ModalConfirmacion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { obtenerAsistenciasPorEvento, obtenerAsistenciasPorUsuario } from '../services/apiAsistencia';
import { eliminarCuenta } from '../services/apiAuth';
import { obtenerEventosPorUsuario } from '../services/apiEventos';
import { actualizarPerfil, obtenerPerfil } from '../services/apiUsuarios';
import { subirImagen } from '../services/supabaseStorage';
import '../styles/perfil.css';
import { logger } from '../utils/logger';
import { showError, showInfo, showSuccess, showWarning } from '../utils/toast';

// Importo las regiones desde el archivo centralizado
import { regionesYcomunas } from '../data/ubicaciones';

function Perfil() {
    const { user, isAdmin, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // Verificar autenticación al montar
    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/auth', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    // ESTADOS
    const [modoEdicion, setModoEdicion] = useState(false);
    const [userData, setUserData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        fotoUrl: '',
        region: '',
        comuna: ''
    });
    const [comunasDisponibles, setComunasDisponibles] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        eventosCreados: 0,
        eventosInscritos: 0,
        eventosPasados: 0,
        eventosVigentes: 0,
        totalAsistentesAMisEventos: 0,
        totalUsuarios: 0
    });

    // Estado para modal de eliminacion de cuenta
    const [modalEliminarCuenta, setModalEliminarCuenta] = useState({
        visible: false,
        paso: 1,
        confirmText: '',
        procesando: false
    });
    const [modalAsistentes, setModalAsistentes] = useState({
        mostrar: false,
        eventoId: null,
        eventoTitulo: '',
        asistentes: []
    });
    const [mostrarTodosEventos, setMostrarTodosEventos] = useState(false);
    const [eventosInscritos, setEventosInscritos] = useState([]);
    const [eventosInscritosVigentes, setEventosInscritosVigentes] = useState([]);
    const [eventosInscritosPasados, setEventosInscritosPasados] = useState([]);
    const [mostrarCropper, setMostrarCropper] = useState(false);
    const [imagenParaCrop, setImagenParaCrop] = useState(null);

    // FUNCIÓN: Cargar datos del usuario desde el backend
    const cargarDatosUsuario = useCallback(async () => {
        if (!user) return;

        try {
            // Intentar cargar desde el backend
            const resultado = await obtenerPerfil();
            if (resultado.success && resultado.data) {
                const backendData = resultado.data;
                // Cargar fotoUrl desde localStorage (no está en el backend aún)
                const storedData = localStorage.getItem('user-data');
                let fotoUrl = iconoPerfil;
                if (storedData) {
                    try {
                        const parsed = JSON.parse(storedData);
                        fotoUrl = parsed.fotoUrl || iconoPerfil;
                    } catch (e) {
                        logger.error('Error al parsear fotoUrl:', e);
                    }
                }

                const finalData = {
                    name: backendData.nombre || user.nombre || 'Usuario',
                    email: backendData.email || user.email || '',
                    fotoUrl: fotoUrl,
                    region: backendData.region || '',
                    comuna: backendData.comuna || '',
                    rut: backendData.rut || user.rut || ''
                };

                setUserData(finalData);
                setFormData({
                    name: finalData.name,
                    email: finalData.email,
                    fotoUrl: finalData.fotoUrl,
                    region: finalData.region,
                    comuna: finalData.comuna
                });

                // Actualizar localStorage con datos del backend
                const userDataToStore = {
                    ...finalData,
                    id: backendData.id,
                    nombre: finalData.name,
                    rol: backendData.rol
                };
                localStorage.setItem('user-data', JSON.stringify(userDataToStore));
            } else {
                // Fallback a localStorage si falla el backend
                logger.warn('No se pudo cargar perfil del backend, usando localStorage');
                const storedData = localStorage.getItem('user-data');
                if (storedData) {
                    try {
                        const data = JSON.parse(storedData);
                        const finalData = {
                            name: data.name || data.nombre || user.nombre || 'Usuario',
                            email: data.email || user.email || '',
                            fotoUrl: data.fotoUrl || iconoPerfil,
                            region: data.region || '',
                            comuna: data.comuna || '',
                            rut: data.rut || user.rut || ''
                        };
                        setUserData(finalData);
                        setFormData({
                            name: finalData.name,
                            email: finalData.email,
                            fotoUrl: finalData.fotoUrl,
                            region: finalData.region,
                            comuna: finalData.comuna
                        });
                    } catch (e) {
                        logger.error('Error al parsear datos de usuario:', e);
                    }
                }
            }
        } catch (error) {
            logger.error('Error al cargar datos del usuario:', error);
            // Fallback a datos básicos
            const finalData = {
                name: user.nombre || 'Usuario',
                email: user.email || '',
                fotoUrl: iconoPerfil,
                region: '',
                comuna: '',
                rut: user.rut || ''
            };
            setUserData(finalData);
            setFormData({
                name: finalData.name,
                email: finalData.email,
                fotoUrl: finalData.fotoUrl,
                region: finalData.region,
                comuna: finalData.comuna
            });
        }
    }, [user]);

    // FUNCIÓN: Cargar eventos del usuario
    const cargarEventosUsuario = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user-data') || '{}');
            if (!userData.id) {
                logger.warn('No se puede cargar eventos del usuario: usuario sin ID');
                logger.debug('User data completo:', userData);
                return;
            }
            logger.debug('Cargando eventos para usuario ID:', userData.id);
            const resultado = await obtenerEventosPorUsuario(userData.id);
            if (resultado.success) {
                logger.debug('Eventos del usuario cargados:', resultado.data?.length || 0);
                setEventos(Array.isArray(resultado.data) ? resultado.data : []);
            } else {
                logger.error('Error al cargar eventos del usuario:', resultado.error);
            }
        } catch (error) {
            logger.error('Error al cargar eventos:', error);
        }
    };

    // FUNCIÓN: Cargar eventos inscritos del usuario
    const cargarEventosInscritos = useCallback(async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user-data') || '{}');
            if (!userData.id) {
                logger.warn('No se puede cargar eventos inscritos: usuario sin ID');
                logger.debug('User data completo:', userData);
                return;
            }
            logger.debug('Cargando eventos inscritos para usuario ID:', userData.id);
            const resultado = await obtenerAsistenciasPorUsuario(userData.id);
            if (resultado.success) {
                const asistencias = resultado.data || [];
                logger.debug('Eventos inscritos cargados:', asistencias.length);
                setEventosInscritos(asistencias);

                // Separar eventos vigentes y pasados
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                const vigentes = asistencias.filter(asistencia => {
                    if (!asistencia.evento || !asistencia.evento.fecha) return false;
                    const fechaEvento = new Date(asistencia.evento.fecha);
                    fechaEvento.setHours(0, 0, 0, 0);
                    return fechaEvento >= hoy;
                });

                const pasados = asistencias.filter(asistencia => {
                    if (!asistencia.evento || !asistencia.evento.fecha) return false;
                    const fechaEvento = new Date(asistencia.evento.fecha);
                    fechaEvento.setHours(0, 0, 0, 0);
                    return fechaEvento < hoy;
                });

                logger.debug('Eventos vigentes:', vigentes.length, 'Eventos pasados:', pasados.length);
                setEventosInscritosVigentes(vigentes);
                setEventosInscritosPasados(pasados);
            } else {
                logger.error('Error al cargar eventos inscritos:', resultado.error);
            }
        } catch (error) {
            logger.error('Error al cargar eventos inscritos:', error);
        }
    }, []);

    // FUNCIÓN: Actualizar estadísticas
    const actualizarEstadisticas = () => {
        // Calcular total de asistentes a mis eventos
        let totalAsistentes = 0;
        eventos.forEach(evento => {
            totalAsistentes += evento.totalAsistentes || 0;
        });

        // Estadísticas unificadas para todos los usuarios
        setEstadisticas({
            eventosCreados: eventos.length,
            eventosInscritos: eventosInscritos.length,
            eventosPasados: eventosInscritosPasados.length,
            eventosVigentes: eventosInscritosVigentes.length,
            totalAsistentesAMisEventos: totalAsistentes,
            totalUsuarios: 0 // Se puede expandir más adelante si es necesario
        });
    };

    // CARGAR DATOS AL MONTAR
    // OPTIMIZADO: Usar user?.id como dependencia para evitar re-ejecuciones innecesarias
    useEffect(() => {
        // Solo cargar si el usuario está logueado y user está disponible
        if (!isLoggedIn() || !user || !user.id) {
            return;
        }

        // Prevenir múltiples ejecuciones simultáneas
        let isMounted = true;

        const loadData = async () => {
            try {
                await cargarDatosUsuario();

                // Cargar eventos del usuario
                const userData = JSON.parse(localStorage.getItem('user-data') || '{}');
                if (isMounted && userData?.id) {
                    await Promise.all([
                        cargarEventosUsuario(),
                        cargarEventosInscritos()
                    ]);
                }
            } catch (error) {
                if (isMounted) {
                    logger.error('Error al cargar datos del perfil:', error);
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [user?.id, isLoggedIn]); // OPTIMIZADO: Solo dependencias esenciales

    // Actualizar estadísticas cuando cambian los eventos o eventos inscritos
    useEffect(() => {
        if (eventos !== null && eventos !== undefined) {
            actualizarEstadisticas();
        }
    }, [eventos, eventosInscritos, eventosInscritosVigentes, eventosInscritosPasados]);

    // Actualizar comunas cuando cambia región en el formulario
    useEffect(() => {
        if (formData.region && regionesYcomunas[formData.region]) {
            setComunasDisponibles(regionesYcomunas[formData.region]);
        } else {
            setComunasDisponibles([]);
        }
    }, [formData.region]);

    // FUNCIÓN: Manejar cambios en inputs
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // FUNCIÓN: Manejar upload de foto - mostrar cropper
    const handleFotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            showWarning('Por favor selecciona una imagen válida');
            return;
        }

        // Validar tamaño (máx 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showWarning('La imagen no debe pesar más de 5MB');
            return;
        }

        // Leer archivo y mostrar cropper
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagenParaCrop(reader.result);
            setMostrarCropper(true);
        };
        reader.readAsDataURL(file);
    };

    // FUNCIÓN: Manejar crop de imagen
    const handleImageCrop = async (croppedImageDataUrl) => {
        try {
            // Convertir base64 a Blob para subir a Supabase
            const response = await fetch(croppedImageDataUrl);
            const blob = await response.blob();

            // Crear un File desde el Blob para mejor compatibilidad
            const file = new File([blob], `perfil_${user?.id || 'temp'}_${Date.now()}.png`, { type: blob.type || 'image/png' });

            // Subir a Supabase Storage
            const resultado = await subirImagen(file, `perfiles/${user?.id || 'temp'}`);

            if (resultado.success && resultado.url) {
                const imagenUrl = resultado.url;

                setFormData(prev => ({
                    ...prev,
                    fotoUrl: imagenUrl
                }));

                // Actualizar también userData para que se vea inmediatamente
                const userDataStored = JSON.parse(localStorage.getItem('user-data') || '{}');
                userDataStored.fotoUrl = imagenUrl;
                localStorage.setItem('user-data', JSON.stringify(userDataStored));
                window.dispatchEvent(new Event('userDataUpdated'));

                logger.info('Imagen de perfil actualizada exitosamente:', imagenUrl);
                showSuccess('Imagen de perfil actualizada correctamente');
            } else {
                // Fallback a base64 si falla Supabase
                logger.warn('Error al subir imagen a Supabase, usando base64 como fallback:', resultado.error);
                setFormData(prev => ({
                    ...prev,
                    fotoUrl: croppedImageDataUrl
                }));

                // Actualizar también userData
                const userDataStored = JSON.parse(localStorage.getItem('user-data') || '{}');
                userDataStored.fotoUrl = croppedImageDataUrl;
                localStorage.setItem('user-data', JSON.stringify(userDataStored));
                window.dispatchEvent(new Event('userDataUpdated'));

                showWarning('Imagen guardada localmente (no se pudo subir a Supabase)');
            }

            setMostrarCropper(false);
            setImagenParaCrop(null);
        } catch (error) {
            logger.error('Error al procesar imagen recortada:', error);
            showError('Error al procesar la imagen. Inténtalo de nuevo.');
            setMostrarCropper(false);
            setImagenParaCrop(null);
        }
    };

    // FUNCIÓN: Cancelar crop
    const handleCancelCrop = () => {
        setMostrarCropper(false);
        setImagenParaCrop(null);
        // Limpiar input file
        const fileInput = document.getElementById('fotoFile');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    // FUNCIÓN: Ver asistentes de un evento
    const handleVerAsistentes = async (evento) => {
        try {
            const resultado = await obtenerAsistenciasPorEvento(evento.id);
            if (resultado.success) {
                setModalAsistentes({
                    mostrar: true,
                    eventoId: evento.id,
                    eventoTitulo: evento.titulo,
                    asistentes: resultado.data || []
                });
            } else {
                logger.error('Error al cargar asistentes:', resultado.error);
                showError('Error al cargar los asistentes del evento');
            }
        } catch (error) {
            logger.error('Error al cargar asistentes:', error);
            showError('Error al cargar los asistentes del evento');
        }
    };

    // FUNCIÓN: Cerrar modal de asistentes
    const cerrarModalAsistentes = () => {
        setModalAsistentes({
            mostrar: false,
            eventoId: null,
            eventoTitulo: '',
            asistentes: []
        });
    };


    // FUNCIÓN: Guardar perfil usando API del backend
    const handleGuardarPerfil = async (e) => {
        e.preventDefault();

        const { name, email, fotoUrl, region, comuna } = formData;

        // Validaciones
        if (!name || name.trim().length < 2) {
            showWarning('El nombre debe tener al menos 2 caracteres');
            return;
        }

        if (!email || !email.includes('@') || !email.includes('.')) {
            showWarning('Ingresa un email válido');
            return;
        }

        if (!region || !comuna) {
            showWarning('Selecciona región y comuna');
            return;
        }

        try {
            // Obtener datos actuales del usuario para mantener RUT y rol
            const userDataStored = JSON.parse(localStorage.getItem('user-data') || '{}');
            const rutActual = userDataStored.rut || user.rut || userData?.rut || '';
            const rolActual = userDataStored.rol || user.rol || 'USER';

            // Preparar datos para el backend
            // Password vacío = no cambiar (el nuevo DTO UpdatePerfilRequest lo permite)
            // El rol debe ser USER según el sistema unificado (solo existe USER en el enum)
            const datosActualizacion = {
                nombre: name.trim(),
                email: email.trim(),
                rut: rutActual, // RUT no se puede cambiar
                password: '', // Vacío = no cambiar password
                rol: 'USER', // Siempre USER según el sistema unificado
                region: region || null,
                comuna: comuna || null,
                fotoUrl: fotoUrl?.trim() || null // URL de la imagen de perfil
            };

            logger.debug('Datos de actualización:', datosActualizacion);

            // Actualizar en el backend
            const resultado = await actualizarPerfil(datosActualizacion);

            if (resultado.success) {
                // El backend ahora devuelve fotoUrl, usarlo si está disponible
                const datosCompletos = {
                    ...resultado.data,
                    name: resultado.data.nombre,
                    fotoUrl: resultado.data.fotoUrl || fotoUrl?.trim() || iconoPerfil,
                    id: userDataStored.id || user.id
                };

                // Actualizar localStorage
                localStorage.setItem('user-data', JSON.stringify(datosCompletos));

                // Notificar a otros componentes (como Navbar) que los datos del usuario cambiaron
                window.dispatchEvent(new Event('userDataUpdated'));

                // Actualizar contexto de autenticación si el email cambió
                if (email !== user.email) {
                    const userDataUpdated = JSON.parse(localStorage.getItem('user-data') || '{}');
                    userDataUpdated.email = email;
                    localStorage.setItem('user-data', JSON.stringify(userDataUpdated));
                    window.dispatchEvent(new Event('userDataUpdated'));
                }

                showSuccess('Perfil actualizado exitosamente');
                setModoEdicion(false);
                await cargarDatosUsuario();
                actualizarEstadisticas();
            } else {
                showError('Error al actualizar perfil: ' + (resultado.error || 'Error desconocido'));
            }
        } catch (error) {
            logger.error('Error al guardar perfil:', error);
            showError('Error al guardar el perfil. Inténtalo de nuevo.');
        }
    };

    // Manejar confirmacion de eliminacion de cuenta (paso 1)
    const handleConfirmarEliminarCuenta = () => {
        // Avanzar al paso 2 (pedir escribir ELIMINAR)
        setModalEliminarCuenta(prev => ({ ...prev, paso: 2 }));
    };

    // Manejar confirmacion final de eliminacion (paso 2)
    const handleConfirmarEliminarFinal = async (inputValue) => {
        if (inputValue.trim() !== 'ELIMINAR') {
            showInfo('Debes escribir ELIMINAR en mayusculas para confirmar.');
            return;
        }

        setModalEliminarCuenta(prev => ({ ...prev, procesando: true }));

        try {
            const resultado = await eliminarCuenta();
            if (resultado.success) {
                showSuccess('Tu cuenta ha sido eliminada exitosamente.');
                setModalEliminarCuenta({ visible: false, paso: 1, confirmText: '', procesando: false });
                navigate('/');
                window.location.reload();
            } else {
                showError('Error al eliminar cuenta: ' + (resultado.error || 'Error desconocido'));
                setModalEliminarCuenta(prev => ({ ...prev, procesando: false }));
            }
        } catch (error) {
            logger.error('Error al eliminar cuenta:', error);
            showError('Error al eliminar cuenta. Por favor, intenta nuevamente.');
            setModalEliminarCuenta(prev => ({ ...prev, procesando: false }));
        }
    };

    // Cerrar modal de eliminacion
    const cerrarModalEliminarCuenta = () => {
        setModalEliminarCuenta({ visible: false, paso: 1, confirmText: '', procesando: false });
    };

    // RENDERIZADO
    // Si no hay userData o user, mostrar loading
    if (!userData || !user) {
        return (
            <>
                <Navbar />
                <div className="container my-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando perfil...</span>
                    </div>
                    <p className="mt-3">Cargando perfil...</p>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />

            <main className="container my-5">

                {/* HERO CON FOTO DE PERFIL */}
                <section className="row justify-content-center mb-4">
                    <div className="col-12 col-lg-10 col-xl-9">
                        <div className="perfil-hero-card">
                            <div className="perfil-hero-background">
                                <div className="hero-pattern"></div>
                            </div>

                            <div className="perfil-hero-content">
                                <div className="imagen-container-mejorado">
                                    {/* Anillos del portal con runas */}
                                    <div className="anillo-portal-1"></div>
                                    <div className="anillo-portal-2"></div>
                                    <div className="anillo-portal-3"></div>

                                    {/* Partículas orbitando */}
                                    {[...Array(8)].map((_, i) => (
                                        <span key={i} className="particula-portal"></span>
                                    ))}

                                    {/* Imagen de perfil */}
                                    <img
                                        src={formData.fotoUrl || iconoPerfil}
                                        alt="Foto de perfil"
                                        className="imagen-perfil-mejorado"
                                        onError={(e) => { e.target.src = iconoPerfil; }}
                                    />
                                </div>

                                <div className="info-basica-mejorada">
                                    <h2 className="perfil-nombre">{userData.name || 'Usuario'}</h2>
                                    <p className="perfil-email">{userData.email || user.email}</p>
                                    {userData.region && userData.comuna && (
                                        <p className="perfil-ubicacion">
                                            {userData.comuna}, {userData.region}
                                        </p>
                                    )}
                                    <div className="perfil-badges">
                                        <span className={`badge-rol-mejorado ${isAdmin() ? 'admin' : 'user'}`}>
                                            {isAdmin() ? 'Administrador' : 'Usuario'}
                                        </span>
                                        <span className="badge-eventos">
                                            {estadisticas.eventosCreados} {estadisticas.eventosCreados === 1 ? 'evento' : 'eventos'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ACCORDION */}
                <section className="row justify-content-center">
                    <div className="col-lg-10 col-xl-9">
                        <div className="accordion accordion-flush" id="accordionPerfil">

                            {/* ITEM 1: MI INFORMACIÓN */}
                            <div className="accordion-item mb-3 rounded shadow-sm">
                                <h2 className="accordion-header">
                                    <button
                                        className="accordion-button fw-bold"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapseInfo"
                                        aria-expanded="true"
                                    >
                                        Mi Información Personal
                                    </button>
                                </h2>
                                <div id="collapseInfo" className="accordion-collapse collapse show" data-bs-parent="#accordionPerfil">
                                    <div className="accordion-body">

                                        {/* VISTA DE SOLO LECTURA */}
                                        {!modoEdicion && (
                                            <div>
                                                <h3 className="h5 mb-4 fw-bold text-center">Información Actual</h3>

                                                <div className="vista-datos">
                                                    <div className="dato-item row mb-3">
                                                        <div className="col-5 col-md-4"><strong>Nombre:</strong></div>
                                                        <div className="col-7 col-md-8">{userData.name || 'No registrado'}</div>
                                                    </div>
                                                    <div className="dato-item row mb-3">
                                                        <div className="col-5 col-md-4"><strong>Email:</strong></div>
                                                        <div className="col-7 col-md-8">{userData.email || user.email}</div>
                                                    </div>
                                                    <div className="dato-item row mb-3">
                                                        <div className="col-5 col-md-4"><strong>RUT:</strong></div>
                                                        <div className="col-7 col-md-8">{userData.rut || 'No registrado'}</div>
                                                    </div>
                                                    <div className="dato-item row mb-3">
                                                        <div className="col-5 col-md-4"><strong>Región:</strong></div>
                                                        <div className="col-7 col-md-8">{userData.region || 'No registrada'}</div>
                                                    </div>
                                                    <div className="dato-item row mb-3">
                                                        <div className="col-5 col-md-4"><strong>Comuna:</strong></div>
                                                        <div className="col-7 col-md-8">{userData.comuna || 'No registrada'}</div>
                                                    </div>
                                                </div>

                                                <div className="text-center mt-4">
                                                    <button
                                                        className="btn btn-primary px-5 py-2 fw-bold"
                                                        onClick={() => setModoEdicion(true)}
                                                    >
                                                        Editar mi información
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* FORMULARIO DE EDICIÓN */}
                                        {modoEdicion && (
                                            <div>
                                                <h3 className="h5 mb-4 fw-bold text-center">Editar Información</h3>

                                                <form onSubmit={handleGuardarPerfil}>
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label htmlFor="name" className="form-label">Nombre completo</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="name"
                                                                value={formData.name}
                                                                onChange={handleInputChange}
                                                                required
                                                                placeholder="Tu nombre completo"
                                                            />
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label htmlFor="email" className="form-label">Email</label>
                                                            <input
                                                                type="email"
                                                                className="form-control"
                                                                id="email"
                                                                value={formData.email}
                                                                onChange={handleInputChange}
                                                                required
                                                                placeholder="ejemplo@correo.cl"
                                                            />
                                                        </div>

                                                        <div className="col-12">
                                                            <label htmlFor="rut" className="form-label">RUT (No editable)</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="rut"
                                                                value={userData.rut || ''}
                                                                disabled
                                                                readOnly
                                                                style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                                                            />
                                                            <small className="form-text text-muted">El RUT no se puede modificar por seguridad</small>
                                                        </div>

                                                        <div className="col-12">
                                                            <label htmlFor="fotoUrl" className="form-label">Foto de perfil</label>

                                                            {/* Vista previa de la foto con crop circular */}
                                                            {formData.fotoUrl && (
                                                                <div className="mb-3 text-center">
                                                                    <div
                                                                        style={{
                                                                            width: '150px',
                                                                            height: '150px',
                                                                            margin: '0 auto',
                                                                            borderRadius: '50%',
                                                                            overflow: 'hidden',
                                                                            border: '4px solid #0d6efd',
                                                                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                                                            position: 'relative'
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={formData.fotoUrl}
                                                                            alt="Vista previa"
                                                                            style={{
                                                                                width: '100%',
                                                                                height: '100%',
                                                                                objectFit: 'cover',
                                                                                objectPosition: 'center'
                                                                            }}
                                                                            onError={(e) => { e.target.src = iconoPerfil; }}
                                                                        />
                                                                    </div>
                                                                    <small className="form-text text-muted d-block mt-2">
                                                                        La imagen se ajustará automáticamente a formato circular
                                                                    </small>
                                                                </div>
                                                            )}

                                                            {/* Botón para subir foto */}
                                                            <div className="mb-2">
                                                                <input
                                                                    type="file"
                                                                    className="form-control"
                                                                    id="fotoFile"
                                                                    accept="image/*"
                                                                    onChange={handleFotoUpload}
                                                                />
                                                                <small className="form-text text-muted">Sube una imagen (máx. 2MB)</small>
                                                            </div>

                                                            {/* O pegar URL */}
                                                            <div className="text-center my-2">
                                                                <small className="text-muted">- o pega una URL -</small>
                                                            </div>

                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                id="fotoUrl"
                                                                value={formData.fotoUrl}
                                                                onChange={handleInputChange}
                                                                placeholder="https://ejemplo.com/foto.jpg"
                                                            />
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label htmlFor="region" className="form-label">Región</label>
                                                            <select
                                                                className="form-select"
                                                                id="region"
                                                                value={formData.region}
                                                                onChange={handleInputChange}
                                                                required
                                                            >
                                                                <option value="">Selecciona región</option>
                                                                {Object.keys(regionesYcomunas).map((region) => (
                                                                    <option key={region} value={region}>{region}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label htmlFor="comuna" className="form-label">Comuna</label>
                                                            <select
                                                                className="form-select"
                                                                id="comuna"
                                                                value={formData.comuna}
                                                                onChange={handleInputChange}
                                                                required
                                                                disabled={!formData.region}
                                                            >
                                                                <option value="">Selecciona comuna</option>
                                                                {comunasDisponibles.map((comuna) => (
                                                                    <option key={comuna} value={comuna}>{comuna}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="col-12 text-center mt-4">
                                                            <button type="submit" className="btn btn-primary px-5 py-2 fw-bold me-2">
                                                                Guardar cambios
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-secondary px-4 py-2 fw-bold"
                                                                onClick={() => {
                                                                    setModoEdicion(false);
                                                                    cargarDatosUsuario();
                                                                }}
                                                            >
                                                                Cancelar
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>

                            {/* ITEM 2: MIS EVENTOS */}
                            <div className="accordion-item mb-3 rounded shadow-sm">
                                <h2 className="accordion-header">
                                    <button
                                        className="accordion-button collapsed fw-bold"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapseEventos"
                                        aria-expanded="false"
                                    >
                                        {isAdmin() ? 'Todos los Eventos del Sistema' : 'Mis Eventos Creados'}
                                        <span className="badge bg-primary ms-2">{eventos.length}</span>
                                    </button>
                                </h2>
                                <div id="collapseEventos" className="accordion-collapse collapse" data-bs-parent="#accordionPerfil">
                                    <div className="accordion-body p-4">
                                        {eventos.length === 0 ? (
                                            <div className="sin-eventos-mensaje">
                                                <div className="sin-eventos-icon"></div>
                                                <p>{isAdmin() ? 'No hay eventos en el sistema' : 'No has creado eventos aún'}</p>
                                                <Link to={isAdmin() ? "/admin" : "/eventos"} className="btn btn-primary btn-sm mt-2">
                                                    {isAdmin() ? 'Ir al Panel Admin' : 'Explorar Eventos'}
                                                </Link>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="eventos-grid-compacto">
                                                    {(mostrarTodosEventos ? eventos : eventos.slice(0, 6)).map((evento) => (
                                                        <div key={evento.id} className="evento-card-compacto">
                                                            <div className="evento-compacto-header">
                                                                <span className="evento-compacto-tipo">{evento.tipo}</span>
                                                                {isAdmin() && evento.creadoPor && (
                                                                    <span className="evento-compacto-autor" title={`Creado por ${evento.creadoPor}`}>

                                                                    </span>
                                                                )}
                                                            </div>

                                                            <h5 className="evento-compacto-titulo">{evento.titulo}</h5>

                                                            <div className="evento-compacto-info">
                                                                <div className="info-compacto-item">
                                                                    <span className="icon"></span>
                                                                    <span className="text">{evento.fecha}</span>
                                                                </div>
                                                                <div className="info-compacto-item">
                                                                    <span className="icon">Hora:</span>
                                                                    <span className="text">{evento.hora || 'Por definir'}</span>
                                                                </div>
                                                                <div className="info-compacto-item">
                                                                    <span className="icon"></span>
                                                                    <span className="text">{evento.lugar}</span>
                                                                </div>
                                                            </div>

                                                            <div className="evento-compacto-footer">
                                                                <div className="asistentes-count">
                                                                    <span className="icon"></span>
                                                                    <span className="count">{evento.asistencias?.length || 0}</span>
                                                                    <span className="total">/ {evento.capacidad || '∞'}</span>
                                                                </div>
                                                                <button
                                                                    className="btn-ver-participantes"
                                                                    onClick={() => handleVerAsistentes(evento)}
                                                                >
                                                                    Ver participantes
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {eventos.length > 6 && (
                                                    <div className="text-center mt-4">
                                                        <button
                                                            className="btn btn-outline-primary"
                                                            onClick={() => setMostrarTodosEventos(!mostrarTodosEventos)}
                                                        >
                                                            {mostrarTodosEventos ? 'Ver menos' : `Ver todos (${eventos.length})`}
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ITEM 3: MIS EVENTOS INSCRITOS (Solo usuarios normales) */}
                            {!isAdmin() && (
                                <div className="accordion-item mb-3 rounded shadow-sm">
                                    <h2 className="accordion-header">
                                        <button
                                            className="accordion-button collapsed fw-bold"
                                            type="button"
                                            data-bs-toggle="collapse"
                                            data-bs-target="#collapseInscritos"
                                            aria-expanded="false"
                                        >
                                            Mis Eventos Inscritos
                                            <span className="badge bg-success ms-2">{eventosInscritos.length}</span>
                                        </button>
                                    </h2>
                                    <div id="collapseInscritos" className="accordion-collapse collapse" data-bs-parent="#accordionPerfil">
                                        <div className="accordion-body p-4">
                                            {/* Eventos Vigentes */}
                                            <div className="mb-4">
                                                <h5 className="fw-bold mb-3">
                                                    Eventos Vigentes ({eventosInscritosVigentes.length})
                                                </h5>
                                                {eventosInscritosVigentes.length === 0 ? (
                                                    <p className="text-muted">No tienes eventos vigentes inscritos.</p>
                                                ) : (
                                                    <div className="eventos-grid-compacto">
                                                        {eventosInscritosVigentes.map((asistencia) => {
                                                            const evento = asistencia.evento;
                                                            if (!evento) return null;
                                                            return (
                                                                <div key={asistencia.id} className="evento-card-compacto border-success">
                                                                    <div className="evento-compacto-header">
                                                                        <span className="evento-compacto-tipo bg-success">{evento.tipo}</span>
                                                                        <span className="badge bg-success">Inscrito</span>
                                                                    </div>
                                                                    <h5 className="evento-compacto-titulo">{evento.titulo}</h5>
                                                                    <div className="evento-compacto-info">
                                                                        <div className="info-compacto-item">
                                                                            <span className="icon"></span>
                                                                            <span className="text">{evento.fecha}</span>
                                                                        </div>
                                                                        <div className="info-compacto-item">
                                                                            <span className="icon"></span>
                                                                            <span className="text">{evento.lugar}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="evento-compacto-footer">
                                                                        <Link
                                                                            to={`/eventos/${evento.id}`}
                                                                            className="btn btn-sm btn-outline-primary"
                                                                        >
                                                                            Ver detalles
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Eventos Pasados */}
                                            <div>
                                                <h5 className="fw-bold mb-3">
                                                    Eventos Pasados ({eventosInscritosPasados.length})
                                                </h5>
                                                {eventosInscritosPasados.length === 0 ? (
                                                    <p className="text-muted">No has asistido a eventos pasados.</p>
                                                ) : (
                                                    <div className="eventos-grid-compacto">
                                                        {eventosInscritosPasados.map((asistencia) => {
                                                            const evento = asistencia.evento;
                                                            if (!evento) return null;
                                                            return (
                                                                <div key={asistencia.id} className="evento-card-compacto border-secondary opacity-75">
                                                                    <div className="evento-compacto-header">
                                                                        <span className="evento-compacto-tipo bg-secondary">{evento.tipo}</span>
                                                                        <span className="badge bg-secondary">Finalizado</span>
                                                                    </div>
                                                                    <h5 className="evento-compacto-titulo">{evento.titulo}</h5>
                                                                    <div className="evento-compacto-info">
                                                                        <div className="info-compacto-item">
                                                                            <span className="icon"></span>
                                                                            <span className="text">{evento.fecha}</span>
                                                                        </div>
                                                                        <div className="info-compacto-item">
                                                                            <span className="icon"></span>
                                                                            <span className="text">{evento.lugar}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="evento-compacto-footer">
                                                                        <span className="text-muted small">
                                                                            Asististe el {new Date(asistencia.fechaConfirmacion).toLocaleDateString('es-CL')}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ITEM 4: ESTADÍSTICAS */}
                            <div className="accordion-item mb-3 rounded shadow-sm">
                                <h2 className="accordion-header">
                                    <button
                                        className="accordion-button collapsed fw-bold"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapseStats"
                                        aria-expanded="false"
                                    >
                                        Mis Estadísticas
                                    </button>
                                </h2>
                                <div id="collapseStats" className="accordion-collapse collapse" data-bs-parent="#accordionPerfil">
                                    <div className="accordion-body">
                                        <div className="row g-4 text-center">
                                            <div className="col-md-6 col-lg-4">
                                                <div className="stat-card p-4 rounded shadow-sm border-primary">
                                                    <span className="numero-stat display-4 fw-bold d-block mb-2 text-primary">
                                                        {estadisticas.eventosCreados}
                                                    </span>
                                                    <span className="label-stat text-muted">Eventos Creados</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-lg-4">
                                                <div className="stat-card p-4 rounded shadow-sm border-success">
                                                    <span className="numero-stat display-4 fw-bold d-block mb-2 text-success">
                                                        {estadisticas.eventosInscritos}
                                                    </span>
                                                    <span className="label-stat text-muted">Eventos Inscritos</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-lg-4">
                                                <div className="stat-card p-4 rounded shadow-sm border-info">
                                                    <span className="numero-stat display-4 fw-bold d-block mb-2 text-info">
                                                        {estadisticas.eventosVigentes}
                                                    </span>
                                                    <span className="label-stat text-muted">Eventos Vigentes</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-lg-4">
                                                <div className="stat-card p-4 rounded shadow-sm border-secondary">
                                                    <span className="numero-stat display-4 fw-bold d-block mb-2 text-secondary">
                                                        {estadisticas.eventosPasados}
                                                    </span>
                                                    <span className="label-stat text-muted">Eventos Pasados</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6 col-lg-4">
                                                <div className="stat-card p-4 rounded shadow-sm border-warning">
                                                    <span className="numero-stat display-4 fw-bold d-block mb-2 text-warning">
                                                        {estadisticas.totalAsistentesAMisEventos}
                                                    </span>
                                                    <span className="label-stat text-muted">Asistentes a Mis Eventos</span>
                                                </div>
                                            </div>
                                            {isAdmin() && (
                                                <div className="col-md-6 col-lg-4">
                                                    <div className="stat-card p-4 rounded shadow-sm border-danger">
                                                        <span className="numero-stat display-4 fw-bold d-block mb-2 text-danger">
                                                            {estadisticas.totalUsuarios}
                                                        </span>
                                                        <span className="label-stat text-muted">Usuarios Registrados</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ITEM 5: CONFIGURACIONES DE CUENTA */}
                            <div className="accordion-item mb-3 rounded shadow-sm border-danger">
                                <h2 className="accordion-header">
                                    <button
                                        className="accordion-button collapsed fw-bold text-danger"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target="#collapseConfig"
                                        aria-expanded="false"
                                    >
                                        Configuración de Cuenta
                                    </button>
                                </h2>
                                <div id="collapseConfig" className="accordion-collapse collapse" data-bs-parent="#accordionPerfil">
                                    <div className="accordion-body">
                                        <div className="alert alert-warning" role="alert">
                                            <strong>Zona de peligro</strong>
                                            <p className="mb-0">Las acciones aquí son irreversibles. Por favor, ten cuidado.</p>
                                        </div>

                                        <div className="d-grid gap-2 mt-4">
                                            <button
                                                className="btn btn-danger btn-lg"
                                                onClick={() => setModalEliminarCuenta({ visible: true, paso: 1, confirmText: '', procesando: false })}
                                            >
                                                Eliminar mi cuenta
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* ACCIONES RÁPIDAS */}
                <section className="row justify-content-center mt-5 mb-5">
                    <div className="col-lg-8 col-xl-7">
                        <div className="card border-0 shadow-lg">
                            <div className="card-body p-4">
                                <h2 className="card-title h5 mb-4 text-center fw-bold">Acciones Rápidas</h2>

                                <div className="d-flex flex-wrap justify-content-center gap-3">
                                    <Link to="/eventos" className="btn btn-primary px-4 py-2 fw-bold">
                                        Ver todos los eventos
                                    </Link>
                                    <Link to="/admin" className="btn btn-primary px-4 py-2 fw-bold">
                                        {isAdmin() ? 'Ir a Panel Admin' : 'Ir a mi panel'}
                                    </Link>
                                    <Link to="/" className="btn btn-secondary px-4 py-2 fw-bold">
                                        Ir al inicio
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* MODAL DE PARTICIPANTES */}
            {modalAsistentes.mostrar && (
                <div className="modal-overlay-participantes" onClick={cerrarModalAsistentes}>
                    <div className="modal-content-participantes" onClick={(e) => e.stopPropagation()}>

                        {/* Header mejorado */}
                        <div className="modal-header-participantes">
                            <div className="header-titulo-section">
                                <div className="header-icon"></div>
                                <div>
                                    <h3 className="header-titulo">Participantes</h3>
                                    <p className="header-subtitulo">{modalAsistentes.eventoTitulo}</p>
                                </div>
                            </div>
                            <button className="btn-cerrar-modal-nuevo" onClick={cerrarModalAsistentes}>
                                <span>Cerrar</span>
                            </button>
                        </div>

                        <div className="modal-body-participantes">
                            {modalAsistentes.asistentes.length === 0 ? (
                                <div className="sin-participantes-estado">
                                    <div className="estado-icono"></div>
                                    <h4>Sin confirmaciones aún</h4>
                                    <p>Este evento todavía no tiene participantes confirmados</p>
                                </div>
                            ) : (
                                <>
                                    {/* Stats mejoradas */}
                                    <div className="participantes-stats-mejorado">
                                        <div className="stat-card-modal total">
                                            <div className="stat-icono"></div>
                                            <div className="stat-info">
                                                <span className="stat-numero-grande">{modalAsistentes.asistentes.length}</span>
                                                <span className="stat-texto">Total Participantes</span>
                                            </div>
                                        </div>
                                        <div className="stat-card-modal registrados">
                                            <div className="stat-icono"></div>
                                            <div className="stat-info">
                                                <span className="stat-numero-grande">
                                                    {modalAsistentes.asistentes.filter(a => a.tipoAsistente === 'registrado').length}
                                                </span>
                                                <span className="stat-texto">Registrados</span>
                                            </div>
                                        </div>
                                        <div className="stat-card-modal invitados">
                                            <div className="stat-icono"></div>
                                            <div className="stat-info">
                                                <span className="stat-numero-grande">
                                                    {modalAsistentes.asistentes.filter(a => a.tipoAsistente === 'invitado').length}
                                                </span>
                                                <span className="stat-texto">Invitados</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lista mejorada */}
                                    <div className="lista-participantes-mejorada">
                                        <div className="lista-header">
                                            <h4>Lista de Participantes ({modalAsistentes.asistentes.length})</h4>
                                        </div>
                                        <div className="participantes-grid">
                                            {modalAsistentes.asistentes.map((asistente, index) => (
                                                <div key={index} className="participante-card">
                                                    <div className="participante-header-card">
                                                        <div className="participante-avatar-mejorado">
                                                            <span>{asistente.nombre.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <span className={`badge-tipo-mejorado ${asistente.tipoAsistente}`}>
                                                            {asistente.tipoAsistente === 'registrado' ? 'Registrado' :
                                                                asistente.tipoAsistente === 'invitado' ? 'Invitado' : 'Manual'}
                                                        </span>
                                                    </div>

                                                    <div className="participante-info-mejorada">
                                                        <h5 className="participante-nombre-mejorado">{asistente.nombre}</h5>
                                                        <div className="participante-datos">
                                                            <div className="dato-row">
                                                                <span className="dato-icono"></span>
                                                                <span className="dato-texto">{asistente.email}</span>
                                                            </div>
                                                            <div className="dato-row">
                                                                <span className="dato-icono">RUT:</span>
                                                                <span className="dato-texto">{asistente.rut}</span>
                                                            </div>
                                                            {asistente.fechaConfirmacion && (
                                                                <div className="dato-row fecha">
                                                                    <span className="dato-icono"></span>
                                                                    <span className="dato-texto">
                                                                        {new Date(asistente.fechaConfirmacion).toLocaleDateString('es-CL', {
                                                                            day: '2-digit',
                                                                            month: 'short',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="modal-footer-participantes">
                            <button className="btn-cerrar-footer" onClick={cerrarModalAsistentes}>
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de crop de imagen */}
            {mostrarCropper && imagenParaCrop && (
                <ImageCropper
                    imageSrc={imagenParaCrop}
                    onCrop={handleImageCrop}
                    onCancel={handleCancelCrop}
                />
            )}

            {/* Modal de eliminacion de cuenta */}
            <ModalConfirmacion
                visible={modalEliminarCuenta.visible}
                titulo={modalEliminarCuenta.paso === 1 ? 'Eliminar Cuenta' : 'Confirmacion Final'}
                mensaje={modalEliminarCuenta.paso === 1
                    ? 'Esta seguro de que deseas eliminar tu cuenta?\n\nEsta accion es IRREVERSIBLE y eliminara:\n- Tu perfil\n- Todos tus eventos creados\n- Todas tus asistencias'
                    : 'Para confirmar, escribe ELIMINAR (en mayusculas):'}
                tipo={modalEliminarCuenta.paso === 1 ? 'confirmacion' : 'input'}
                inputPlaceholder="Escribe ELIMINAR para confirmar..."
                inputMinLength={0}
                inputValue={modalEliminarCuenta.confirmText}
                onInputChange={(val) => setModalEliminarCuenta(prev => ({ ...prev, confirmText: val }))}
                textoConfirmar={modalEliminarCuenta.paso === 1 ? 'Continuar' : 'Eliminar Cuenta'}
                textoCancelar="Cancelar"
                variante="danger"
                onConfirm={modalEliminarCuenta.paso === 1 ? handleConfirmarEliminarCuenta : handleConfirmarEliminarFinal}
                onCancel={cerrarModalEliminarCuenta}
                procesando={modalEliminarCuenta.procesando}
            />

            <Footer />
        </>
    );
}

export default Perfil;
