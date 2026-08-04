// Panel unificado de gestión de eventos
// Usuario puede crear eventos, gestionar sus eventos e invitados, ver estadísticas

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eventoIMG from '../assets/eventosIMG.png';
import CKEditorWrapper from '../components/CKEditorWrapper';
import Footer from '../components/Footer';
import ModalAsistentes from '../components/ModalAsistentes';
import ModalConfirmacion from '../components/ModalConfirmacion';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
    actualizarEvento,
    crearEvento,
    eliminarEvento,
    obtenerEventosPorUsuario
} from '../services/apiEventos';
import { crearSolicitudEliminacion } from '../services/apiSolicitudes';
import { subirImagen } from '../services/supabaseStorage';
import '../styles/admin.css';
import { logger } from '../utils/logger';
import { showError, showSuccess, showWarning } from '../utils/toast';

function Admin() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    // Redirigir si no está logueado
    useEffect(() => {
        if (!isLoggedIn()) {
            navigate('/auth', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    // Estados de vista
    const [vistaActual, setVistaActual] = useState('listar'); // 'crear' o 'listar'
    const [eventos, setEventos] = useState([]);
    const [editandoIndice, setEditandoIndice] = useState(null);

    // Estados del formulario
    const [formData, setFormData] = useState({
        titulo: '',
        fecha: '',
        lugar: '',
        tipo: '',
        imagen: '',
        descripcion: '',
        capacidad: '',
        precio: ''
    });

    // Estados para manejo de imágenes
    const [tipoImagen, setTipoImagen] = useState('url'); // 'url' o 'archivo'
    const [imagenPreview, setImagenPreview] = useState(null);
    const [subiendoImagen, setSubiendoImagen] = useState(false);
    const [archivoImagen, setArchivoImagen] = useState(null); // Guardar el archivo para subirlo al crear/editar

    // Estados para validación y mensajes
    const [errores, setErrores] = useState({});
    const [camposTocados, setCamposTocados] = useState({});
    const [mensajeExito, setMensajeExito] = useState('');
    const [mensajeError, setMensajeError] = useState('');

    // Estados del modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [eventoDetalle, setEventoDetalle] = useState(null);
    const [descripcionExpandida, setDescripcionExpandida] = useState(false);

    // Estados del modal de asistentes
    const [modalAsistentesAbierto, setModalAsistentesAbierto] = useState(false);
    const [eventoAsistentes, setEventoAsistentes] = useState(null);

    // Estados para modal de confirmacion de eliminacion
    const [modalEliminar, setModalEliminar] = useState({
        visible: false,
        evento: null,
        tipo: 'confirmacion', // 'confirmacion' para sin asistentes, 'input' para con asistentes
        razon: '',
        procesando: false
    });

    // Cargar eventos al montar y cuando cambia la vista
    useEffect(() => {
        cargarEventos();
    }, []);

    // Función para cargar eventos del usuario
    const cargarEventos = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user-data') || '{}');
            const resultado = await obtenerEventosPorUsuario(userData.id);
            if (resultado.success) {
                setEventos(resultado.data || []);
            }
        } catch (error) {
            logger.error('Admin: Error al cargar eventos', error);
        }
    };

    // Cambiar vista (crear/listar)
    const cambiarVista = (vista) => {
        setVistaActual(vista);
    };

    // Función para truncar HTML manteniendo estructura
    const truncarHTML = (html, maxCaracteres = 200) => {
        if (!html || typeof html !== 'string') return '';
        // Remover tags HTML para contar caracteres
        const textoLimpio = html.replace(/<[^>]*>/g, '');
        if (textoLimpio.length <= maxCaracteres) return html;

        // Truncar texto limpio
        const textoTruncado = textoLimpio.substring(0, maxCaracteres);

        // Intentar mantener estructura HTML básica
        // Si el HTML es muy complejo, simplemente truncar y agregar ...
        return textoTruncado + '...';
    };

    // Función para obtener texto plano de HTML (para preview)
    const obtenerTextoPlano = (html) => {
        if (!html || typeof html !== 'string') return '';
        const textoLimpio = html.replace(/<[^>]*>/g, '');
        return textoLimpio.trim();
    };

    // Limpiar formulario
    const limpiarFormulario = () => {
        setFormData({
            titulo: '',
            fecha: '',
            lugar: '',
            tipo: '',
            imagen: '',
            descripcion: '',
            capacidad: '',
            precio: ''
        });
        setImagenPreview(null);
        setTipoImagen('url');
        setArchivoImagen(null);
        setSubiendoImagen(false);
        setErrores({});
        setCamposTocados({});
        setMensajeExito('');
        setMensajeError('');
    };

    // Validar un campo individual
    const validarCampo = (nombre, valor) => {
        let error = '';

        switch (nombre) {
            case 'titulo':
                if (!valor || valor.trim().length === 0) {
                    error = 'El título es obligatorio';
                } else if (valor.trim().length < 3) {
                    error = 'El título debe tener al menos 3 caracteres';
                } else if (valor.trim().length > 100) {
                    error = 'El título no puede superar 100 caracteres';
                }
                break;

            case 'fecha':
                if (!valor) {
                    error = 'La fecha es obligatoria';
                } else {
                    const fechaSeleccionada = new Date(valor);
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);

                    const año = fechaSeleccionada.getFullYear();

                    if (isNaN(fechaSeleccionada.getTime())) {
                        error = 'Fecha inválida';
                    } else if (año < 1900 || año > 2100) {
                        error = 'El año debe estar entre 1900 y 2100';
                    } else if (fechaSeleccionada < hoy) {
                        error = 'La fecha no puede ser anterior a hoy';
                    }
                }
                break;

            case 'lugar':
                if (!valor || valor.trim().length === 0) {
                    error = 'El lugar es obligatorio';
                } else if (valor.trim().length < 3) {
                    error = 'El lugar debe tener al menos 3 caracteres';
                } else if (valor.trim().length > 150) {
                    error = 'El lugar no puede superar 150 caracteres';
                }
                break;

            case 'tipo':
                if (!valor) {
                    error = 'El tipo de evento es obligatorio';
                }
                break;

            case 'capacidad':
                if (valor && valor !== '') {
                    const num = parseInt(valor);
                    if (isNaN(num)) {
                        error = 'La capacidad debe ser un número';
                    } else if (num < 1) {
                        error = 'La capacidad debe ser al menos 1';
                    } else if (num > 1000000) {
                        error = 'Capacidad máxima: 1,000,000';
                    }
                }
                break;

            case 'precio':
                if (valor && String(valor).trim().length > 50) {
                    error = 'El precio no puede superar 50 caracteres';
                }
                break;

            case 'descripcion':
                if (valor && String(valor).trim().length > 500) {
                    error = 'La descripción no puede superar 500 caracteres';
                }
                break;

            default:
                break;
        }

        return error;
    };

    // Validar todo el formulario
    const validarFormulario = () => {
        const nuevosErrores = {};

        // Validar campos obligatorios
        nuevosErrores.titulo = validarCampo('titulo', formData.titulo);
        nuevosErrores.fecha = validarCampo('fecha', formData.fecha);
        nuevosErrores.lugar = validarCampo('lugar', formData.lugar);
        nuevosErrores.tipo = validarCampo('tipo', formData.tipo);

        // Validar campos opcionales solo si tienen valor
        if (formData.capacidad) {
            nuevosErrores.capacidad = validarCampo('capacidad', formData.capacidad);
        }
        if (formData.precio) {
            nuevosErrores.precio = validarCampo('precio', formData.precio);
        }
        if (formData.descripcion) {
            nuevosErrores.descripcion = validarCampo('descripcion', formData.descripcion);
        }

        // Filtrar errores vacíos
        Object.keys(nuevosErrores).forEach(key => {
            if (!nuevosErrores[key]) delete nuevosErrores[key];
        });

        setErrores(nuevosErrores);
        return Object.keys(nuevosErrores).length === 0;
    };

    // Manejar cuando un campo pierde el foco
    const handleBlur = (e) => {
        const { id } = e.target;
        setCamposTocados(prev => ({ ...prev, [id]: true }));

        const error = validarCampo(id, formData[id]);
        setErrores(prev => ({
            ...prev,
            [id]: error
        }));
    };

    // Manejar cambios en inputs
    const handleInputChange = (e) => {
        const { id, value } = e.target;

        // Validación especial para fecha: limitar año a 4 dígitos
        if (id === 'fecha' && value) {
            const [year] = value.split('-');
            if (year && year.length > 4) {
                return; // No actualizar si el año tiene más de 4 dígitos
            }
        }

        setFormData(prev => ({
            ...prev,
            [id]: value
        }));

        // Validar en tiempo real solo si el campo ya fue tocado
        if (camposTocados[id]) {
            const error = validarCampo(id, value);
            setErrores(prev => ({
                ...prev,
                [id]: error
            }));
        }
    };

    // Manejar subida de archivo de imagen
    const handleImagenArchivo = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            showWarning('Por favor selecciona un archivo de imagen válido');
            return;
        }

        // Validar tamaño (máximo 5MB para Supabase Storage)
        if (file.size > 5 * 1024 * 1024) {
            showWarning('La imagen no debe superar los 5MB');
            return;
        }

        // Guardar el archivo para subirlo cuando se guarde el evento
        setArchivoImagen(file);

        // Mostrar preview local mientras se prepara
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagenPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Procesar formulario (crear o editar)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Limpiar mensajes anteriores
        setMensajeExito('');
        setMensajeError('');

        // Marcar todos los campos como tocados
        const todosTocados = {
            titulo: true,
            fecha: true,
            lugar: true,
            tipo: true,
            capacidad: true,
            precio: true,
            descripcion: true
        };
        setCamposTocados(todosTocados);

        // Validar formulario completo
        if (!validarFormulario()) {
            setMensajeError('Por favor corrige los errores antes de continuar');
            // Scroll al primer error
            setTimeout(() => {
                const primerError = document.querySelector('.is-invalid');
                if (primerError) {
                    primerError.focus();
                    primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }

        const { titulo, fecha, lugar, tipo, imagen, descripcion, capacidad, precio } = formData;

        // Normalizar tipo a mayúsculas para coincidir con el enum del backend
        // Si llegamos aquí, el tipo ya fue validado y no debería estar vacío
        const tipoNormalizado = tipo && tipo.trim() ? tipo.trim().toUpperCase() : null;

        // Validación adicional de seguridad (no debería llegar aquí si la validación funcionó)
        if (!tipoNormalizado || (tipoNormalizado !== 'PRESENCIAL' && tipoNormalizado !== 'STREAMING')) {
            setMensajeError('Error: Tipo de evento inválido. Por favor selecciona Presencial o Streaming.');
            return;
        }

        // Determinar URL de imagen final
        let imagenUrl = imagen.trim() || eventoIMG;

        // Si hay un archivo para subir, subirlo a Supabase Storage
        if (archivoImagen && tipoImagen === 'archivo') {
            setSubiendoImagen(true);
            try {
                // Si estamos editando, usar el ID del evento; si no, usar null (se generará uno único)
                const eventoId = editandoIndice !== null ? eventos[editandoIndice]?.id : null;
                const resultadoSubida = await subirImagen(archivoImagen, eventoId);

                if (resultadoSubida.success) {
                    imagenUrl = resultadoSubida.url;
                } else {
                    setMensajeError(`Error al subir imagen: ${resultadoSubida.error}`);
                    setSubiendoImagen(false);
                    return;
                }
            } catch (error) {
                logger.error('Admin: Error al subir imagen', error);
                setMensajeError('Error al subir la imagen. Intenta nuevamente.');
                setSubiendoImagen(false);
                return;
            } finally {
                setSubiendoImagen(false);
            }
        }

        // Construir objeto evento
        const eventoData = {
            titulo: titulo.trim(),
            fecha,
            lugar: lugar.trim(),
            tipo: tipoNormalizado,
            imagen: imagenUrl,
            descripcion: descripcion.trim() || 'Sin descripción',
            capacidad: parseInt(capacidad, 10) || 100, // Siempre como número
            precio: parseInt(precio, 10) || 0 // Siempre como número, 0 si es gratis
        };

        try {
            if (editandoIndice !== null) {
                // Modo edición
                const eventoId = eventos[editandoIndice]?.id;
                if (!eventoId) {
                    showError('Error: No se pudo encontrar el ID del evento');
                    return;
                }
                const resultado = await actualizarEvento(eventoId, eventoData);
                if (resultado.success) {
                    setMensajeExito('Evento editado exitosamente! Redirigiendo...');
                    setTimeout(() => {
                        limpiarFormulario();
                        setEditandoIndice(null);
                        cambiarVista('listar');
                        cargarEventos();
                    }, 1500);
                } else {
                    setMensajeError('No tienes permisos para editar este evento');
                }
            } else {
                // Modo creación
                const resultado = await crearEvento(eventoData);
                if (resultado.success) {
                    setMensajeExito('Evento creado exitosamente! Redirigiendo...');
                    setTimeout(() => {
                        limpiarFormulario();
                        cambiarVista('listar');
                        cargarEventos();
                    }, 1500);
                } else {
                    setMensajeError(resultado.error || 'Error al crear el evento. Intenta nuevamente.');
                }
            }
        } catch (error) {
            logger.error('Admin: Error al guardar evento', error);
            setMensajeError('Error inesperado al guardar el evento');
        }
    };

    // Iniciar edición
    const iniciarEdicion = (idx) => {
        const evento = eventos[idx];

        if (!evento) {
            showError('Evento no encontrado');
            return;
        }

        // Verificar permisos
        if (evento.creadoPorId !== user?.id) {
            showError('Solo puedes editar tus propios eventos');
            return;
        }

        // Cargar datos en el formulario
        // Normalizar tipo a mayúsculas para coincidir con los valores del select
        const tipoNormalizado = evento.tipo ? evento.tipo.toUpperCase() : '';

        setFormData({
            titulo: evento.titulo,
            fecha: evento.fecha,
            lugar: evento.lugar,
            tipo: tipoNormalizado,
            imagen: evento.imagen,
            descripcion: evento.descripcion || '',
            capacidad: evento.capacidad || '',
            precio: evento.precio || ''
        });

        // Encontrar índice del evento en la lista actual
        const indiceReal = eventos.findIndex(e => e.id === evento.id);
        setEditandoIndice(indiceReal);

        // Cambiar a vista crear (modo edición)
        cambiarVista('crear');
    };

    // Eliminar evento con validación de asistentes (abre modal)
    const borrarEventoConValidacion = (idx) => {
        const evento = eventos[idx];

        if (!evento) {
            showError('Evento no encontrado');
            return;
        }

        // Verificar permisos
        if (evento.creadoPorId !== user?.id) {
            showError('Solo puedes eliminar tus propios eventos');
            return;
        }

        // Verificar si tiene asistentes
        const totalAsistentes = evento.totalAsistentes || 0;

        if (totalAsistentes > 0) {
            // Con asistentes: mostrar modal con input para razon
            setModalEliminar({
                visible: true,
                evento,
                tipo: 'input',
                razon: '',
                procesando: false
            });
        } else {
            // Sin asistentes: confirmacion simple
            setModalEliminar({
                visible: true,
                evento,
                tipo: 'confirmacion',
                razon: '',
                procesando: false
            });
        }
    };

    // Manejar confirmacion de eliminacion
    const handleConfirmarEliminar = async (razon) => {
        const evento = modalEliminar.evento;
        if (!evento) return;

        const totalAsistentes = evento.totalAsistentes || 0;

        setModalEliminar(prev => ({ ...prev, procesando: true }));

        try {
            if (totalAsistentes > 0) {
                // Enviar solicitud de eliminacion al admin
                const solicitudData = {
                    eventoId: evento.id,
                    motivo: razon
                };
                await crearSolicitudEliminacion(solicitudData);
                showSuccess('Solicitud enviada correctamente. Un administrador revisara tu peticion.');
            } else {
                // Eliminacion directa
                const resultado = await eliminarEvento(evento.id);
                if (resultado.success) {
                    cargarEventos();
                    showSuccess('Evento eliminado correctamente');
                } else {
                    showError('Error: No se pudo eliminar el evento');
                }
            }
            cerrarModalEliminar();
            cerrarModal();
        } catch (error) {
            logger.error('Admin: Error al procesar eliminacion', error);
            const msg = error.response?.data?.mensaje || error.message || 'Error al procesar solicitud';
            showError(`Error: ${msg}`);
            setModalEliminar(prev => ({ ...prev, procesando: false }));
        }
    };

    // Cerrar modal de eliminacion
    const cerrarModalEliminar = () => {
        setModalEliminar({
            visible: false,
            evento: null,
            tipo: 'confirmacion',
            razon: '',
            procesando: false
        });
    };

    // Eliminar evento (versión original mantenida para compatibilidad)
    const borrarEvento = async (idx) => {
        await borrarEventoConValidacion(idx);
    };

    // Ver detalle (modal)
    const verEvento = (idx) => {
        const evento = eventos[idx];
        if (!evento) {
            showError('Evento no encontrado');
            return;
        }
        setEventoDetalle(evento);
        setModalAbierto(true);
    };

    // Cerrar modal
    const cerrarModal = () => {
        setModalAbierto(false);
        setEventoDetalle(null);
        setDescripcionExpandida(false);
    };

    // Abrir modal de asistentes
    const abrirModalAsistentes = () => {
        if (!eventoDetalle) return;
        setEventoAsistentes(eventoDetalle);
        setModalAsistentesAbierto(true);
    };

    // Cerrar modal de asistentes
    const cerrarModalAsistentes = () => {
        setModalAsistentesAbierto(false);
        setEventoAsistentes(null);
    };

    // Actualizar eventos después de cambios en asistentes
    const actualizarDespuesAsistentes = () => {
        cargarEventos();
    };

    return (
        <>
            <Navbar />

            <div className="container-fluid">
                <div className="row">
                    {/* Sidebar */}
                    <aside className="col-lg-2 col-md-3 sidebar bg-light border-end p-4">
                        <h2 className="h5 mb-3 fw-bold text-dark">Eventos</h2>
                        <ul className="nav flex-column gap-2">
                            <li className="nav-item">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        limpiarFormulario();        // Limpiar al crear NUEVO
                                        setEditandoIndice(null);    // Resetear índice
                                        cambiarVista('crear');
                                    }}
                                    className={`nav-link text-dark px-3 py-2 rounded ${vistaActual === 'crear' ? 'active' : ''}`}
                                >
                                    Crear Evento
                                </a>
                            </li>
                            <li className="nav-item">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        cambiarVista('listar');
                                    }}
                                    className={`nav-link text-dark px-3 py-2 rounded ${vistaActual === 'listar' ? 'active' : ''}`}
                                >
                                    Listar Eventos
                                </a>
                            </li>
                        </ul>
                    </aside>

                    {/* Contenido principal */}
                    <main className="col-lg-10 col-md-9 admin-content p-4">

                        {/* SECCIÓN CREAR/EDITAR */}
                        {vistaActual === 'crear' && (
                            <section>
                                <div className="row justify-content-center">
                                    <div className="col-xl-10">
                                        <div className="card border-0 shadow-lg mb-4">
                                            <div className="card-body p-4">
                                                <h2 className="card-title h3 mb-4 text-center fw-bold">
                                                    {editandoIndice !== null ? 'Editar Evento' : 'Crear Evento'}
                                                </h2>

                                                {/* Alerta de éxito */}
                                                {mensajeExito && (
                                                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                                                        <strong>{mensajeExito}</strong>
                                                        <button type="button" className="btn-close" onClick={() => setMensajeExito('')}></button>
                                                    </div>
                                                )}

                                                {/* Alerta de error */}
                                                {mensajeError && (
                                                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                                        <strong>{mensajeError}</strong>
                                                        <button type="button" className="btn-close" onClick={() => setMensajeError('')}></button>
                                                    </div>
                                                )}

                                                <form onSubmit={handleSubmit}>
                                                    <div className="row g-3">
                                                        <div className="col-md-6">
                                                            <label htmlFor="titulo" className="form-label">Título *</label>
                                                            <input
                                                                id="titulo"
                                                                type="text"
                                                                className={`form-control ${camposTocados.titulo && errores.titulo ? 'is-invalid' : ''} ${camposTocados.titulo && !errores.titulo && formData.titulo ? 'is-valid' : ''}`}
                                                                value={formData.titulo}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                placeholder="Nombre del evento"
                                                                maxLength="100"
                                                            />
                                                            {camposTocados.titulo && errores.titulo && (
                                                                <div className="invalid-feedback d-block">
                                                                    {errores.titulo}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label htmlFor="fecha" className="form-label">Fecha *</label>
                                                            <div className="input-group">
                                                                <input
                                                                    id="fecha"
                                                                    type="date"
                                                                    className={`form-control ${camposTocados.fecha && errores.fecha ? 'is-invalid' : ''} ${camposTocados.fecha && !errores.fecha && formData.fecha ? 'is-valid' : ''}`}
                                                                    value={formData.fecha}
                                                                    onChange={handleInputChange}
                                                                    onBlur={handleBlur}
                                                                    min={new Date().toISOString().split('T')[0]}
                                                                    max="2100-12-31"
                                                                    placeholder="YYYY-MM-DD"
                                                                    style={{
                                                                        cursor: 'text'
                                                                    }}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-outline-secondary"
                                                                    onClick={() => {
                                                                        const input = document.getElementById('fecha');
                                                                        if (input) {
                                                                            input.showPicker?.();
                                                                        }
                                                                    }}
                                                                    title="Abrir calendario"
                                                                >

                                                                </button>
                                                            </div>
                                                            {camposTocados.fecha && errores.fecha && (
                                                                <div className="invalid-feedback d-block">
                                                                    {errores.fecha}
                                                                </div>
                                                            )}
                                                            <small className="form-text text-muted">
                                                                Puedes escribir la fecha (YYYY-MM-DD) o hacer clic en el icono del calendario
                                                            </small>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label htmlFor="lugar" className="form-label">Lugar *</label>
                                                            <input
                                                                id="lugar"
                                                                type="text"
                                                                className={`form-control ${camposTocados.lugar && errores.lugar ? 'is-invalid' : ''} ${camposTocados.lugar && !errores.lugar && formData.lugar ? 'is-valid' : ''}`}
                                                                value={formData.lugar}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                placeholder="Ubicación del evento"
                                                                maxLength="150"
                                                            />
                                                            {camposTocados.lugar && errores.lugar && (
                                                                <div className="invalid-feedback d-block">
                                                                    {errores.lugar}
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label htmlFor="tipo" className="form-label">Tipo *</label>
                                                            <select
                                                                id="tipo"
                                                                className={`form-select ${camposTocados.tipo && errores.tipo ? 'is-invalid' : ''} ${camposTocados.tipo && !errores.tipo && formData.tipo ? 'is-valid' : ''}`}
                                                                value={formData.tipo}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                            >
                                                                <option value="">Selecciona tipo</option>
                                                                <option value="PRESENCIAL">Presencial</option>
                                                                <option value="STREAMING">Streaming</option>
                                                            </select>
                                                            {camposTocados.tipo && errores.tipo && (
                                                                <div className="invalid-feedback d-block">
                                                                    {errores.tipo}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Selector de tipo de imagen */}
                                                        <div className="col-md-12">
                                                            <label className="form-label">Imagen del Evento</label>
                                                            <div className="btn-group w-100 mb-3" role="group">
                                                                <button
                                                                    type="button"
                                                                    className={`btn ${tipoImagen === 'url' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                                    onClick={() => {
                                                                        setTipoImagen('url');
                                                                        setImagenPreview(null);
                                                                    }}
                                                                >
                                                                    URL
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className={`btn ${tipoImagen === 'archivo' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                                    onClick={() => {
                                                                        setTipoImagen('archivo');
                                                                        setFormData(prev => ({ ...prev, imagen: '' }));
                                                                        setImagenPreview(null);
                                                                        setArchivoImagen(null);
                                                                    }}
                                                                >
                                                                    Subir Archivo
                                                                </button>
                                                            </div>

                                                            {tipoImagen === 'url' ? (
                                                                <div>
                                                                    <input
                                                                        id="imagen"
                                                                        type="text"
                                                                        className="form-control"
                                                                        value={formData.imagen}
                                                                        onChange={handleInputChange}
                                                                        placeholder="https://ejemplo.com/imagen.jpg"
                                                                    />
                                                                    <small className="form-text text-muted">
                                                                        Ingresa la URL de una imagen o deja vacío para usar la imagen por defecto
                                                                    </small>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <input
                                                                        type="file"
                                                                        className="form-control"
                                                                        accept="image/*"
                                                                        onChange={handleImagenArchivo}
                                                                    />
                                                                    <small className="form-text text-muted">
                                                                        Sube una imagen (máximo 5MB). Formatos: JPG, PNG, GIF, WebP
                                                                    </small>
                                                                    {subiendoImagen && (
                                                                        <div className="mt-2">
                                                                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                                                <span className="visually-hidden">Subiendo imagen...</span>
                                                                            </div>
                                                                            <span className="ms-2 text-muted">Subiendo imagen a Supabase Storage...</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Vista previa de la imagen */}
                                                            {(imagenPreview || formData.imagen) && (
                                                                <div className="mt-3 text-center">
                                                                    <p className="text-muted small mb-2">Vista previa:</p>
                                                                    <img
                                                                        src={imagenPreview || formData.imagen}
                                                                        alt="Preview"
                                                                        className="img-thumbnail"
                                                                        style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label htmlFor="capacidad" className="form-label">Capacidad</label>
                                                            <input
                                                                id="capacidad"
                                                                type="number"
                                                                className={`form-control ${camposTocados.capacidad && errores.capacidad ? 'is-invalid' : ''} ${camposTocados.capacidad && !errores.capacidad && formData.capacidad ? 'is-valid' : ''}`}
                                                                value={formData.capacidad}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                min="1"
                                                                max="1000000"
                                                                placeholder="100"
                                                            />
                                                            {camposTocados.capacidad && errores.capacidad && (
                                                                <div className="invalid-feedback d-block">
                                                                    {errores.capacidad}
                                                                </div>
                                                            )}
                                                            <small className="form-text text-muted">Opcional. Deja vacío para capacidad por defecto (100)</small>
                                                        </div>

                                                        <div className="col-md-6">
                                                            <label htmlFor="precio" className="form-label">Precio</label>
                                                            <input
                                                                id="precio"
                                                                type="text"
                                                                className={`form-control ${camposTocados.precio && errores.precio ? 'is-invalid' : ''} ${camposTocados.precio && !errores.precio && formData.precio ? 'is-valid' : ''}`}
                                                                value={formData.precio}
                                                                onChange={handleInputChange}
                                                                onBlur={handleBlur}
                                                                placeholder="Gratis o $5000"
                                                                maxLength="50"
                                                            />
                                                            {camposTocados.precio && errores.precio && (
                                                                <div className="invalid-feedback d-block">
                                                                    {errores.precio}
                                                                </div>
                                                            )}
                                                            <small className="form-text text-muted">Opcional. Ejemplo: Gratis, $5000, $15.000</small>
                                                        </div>

                                                        <div className="col-md-12">
                                                            <label htmlFor="descripcion" className="form-label">Descripción</label>
                                                            <CKEditorWrapper
                                                                value={formData.descripcion}
                                                                onChange={(data) => {
                                                                    setFormData(prev => ({ ...prev, descripcion: data }));
                                                                    // Validar descripción
                                                                    if (data && data.replace(/<[^>]*>/g, '').trim().length > 500) {
                                                                        setErrores(prev => ({ ...prev, descripcion: 'La descripción no puede exceder 500 caracteres' }));
                                                                    } else {
                                                                        setErrores(prev => ({ ...prev, descripcion: '' }));
                                                                    }
                                                                }}
                                                                placeholder="Describe los detalles y atractivos del evento..."
                                                            />
                                                            {errores.descripcion && (
                                                                <div className="text-danger small mt-1">
                                                                    {errores.descripcion}
                                                                </div>
                                                            )}
                                                            <small className="form-text text-muted d-block mt-2">
                                                                Opcional. Máximo 500 caracteres ({formData.descripcion ? formData.descripcion.replace(/<[^>]*>/g, '').trim().length : 0}/500)
                                                            </small>
                                                        </div>

                                                        <div className="col-12 text-center mt-4">
                                                            <button type="submit" className="btn btn-primary px-5 py-2 fw-bold">
                                                                {editandoIndice !== null ? 'Guardar Cambios' : 'Crear Evento'}
                                                            </button>
                                                            {editandoIndice !== null && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-secondary px-5 py-2 fw-bold ms-2"
                                                                    onClick={() => {
                                                                        limpiarFormulario();
                                                                        setEditandoIndice(null);
                                                                        cambiarVista('listar');
                                                                    }}
                                                                >
                                                                    Cancelar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* SECCIÓN LISTAR */}
                        {vistaActual === 'listar' && (
                            <section>
                                <div className="card border-0 shadow-lg">
                                    <div className="card-body p-4">
                                        <h2 className="card-title h3 mb-4 text-center fw-bold">
                                            Gestión de Eventos (Administrador)
                                        </h2>

                                        <div className="table-responsive">
                                            <table className="table table-hover table-striped align-middle">
                                                <thead className="table-dark">
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Imagen</th>
                                                        <th>Título</th>
                                                        <th>Fecha</th>
                                                        <th>Lugar</th>
                                                        <th>Tipo</th>
                                                        <th>Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {eventos.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                                                No tienes eventos creados aún. ¡Crea tu primer evento!
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        eventos.map((evento, i) => {
                                                            const autor = evento.creadoPor || 'Sistema';
                                                            const esMiEvento = evento.creadoPor === user.email;
                                                            const puedeEditar = esMiEvento;

                                                            return (
                                                                <tr key={evento.id}>
                                                                    <td>{i + 1}</td>
                                                                    <td>
                                                                        <img
                                                                            src={evento.imagen}
                                                                            alt="Evento"
                                                                            className="img-fluid rounded"
                                                                            style={{ width: '60px', height: '50px', objectFit: 'cover' }}
                                                                            onError={(e) => {
                                                                                e.target.onerror = null; // Prevenir bucle infinito
                                                                                e.target.src = eventoIMG;
                                                                            }}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <strong>{evento.titulo}</strong><br />
                                                                        <small style={{ color: '#666' }}>Por: {autor}</small>
                                                                        {esMiEvento && (
                                                                            <><br /><span style={{ color: 'var(--primario)', fontSize: '0.75rem', fontWeight: '600' }}>● Tu evento</span></>
                                                                        )}
                                                                    </td>
                                                                    <td>{evento.fecha}</td>
                                                                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                        {evento.lugar}
                                                                    </td>
                                                                    <td>
                                                                        <span className="badge" style={{ background: 'var(--acento)', color: 'white', fontSize: '0.8rem' }}>
                                                                            {evento.tipo}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <button
                                                                            className="btn-ver"
                                                                            onClick={() => verEvento(i)}
                                                                            title="Ver detalles"
                                                                        >
                                                                            Ver
                                                                        </button>
                                                                        {puedeEditar && (
                                                                            <>
                                                                                <button
                                                                                    className="btn-editar"
                                                                                    onClick={() => iniciarEdicion(i)}
                                                                                    title="Editar evento"
                                                                                >
                                                                                    Editar
                                                                                </button>
                                                                                <button
                                                                                    className="btn-eliminar"
                                                                                    onClick={() => borrarEvento(i)}
                                                                                    title="Eliminar evento"
                                                                                >
                                                                                    Eliminar
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                    </main>
                </div>
            </div>

            {/* MODAL DETALLE */}
            {modalAbierto && eventoDetalle && (
                <>
                    {/* Backdrop */}
                    <div
                        className="modal-backdrop fade show"
                        onClick={cerrarModal}
                        style={{ zIndex: 1040 }}
                    ></div>

                    {/* Modal */}
                    <div
                        className="modal fade show d-block"
                        tabIndex="-1"
                        style={{ zIndex: 1050 }}
                        onClick={cerrarModal}
                    >
                        <div
                            className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg"
                            style={{
                                maxWidth: 'min(95vw, 600px)',
                                margin: '1rem auto'
                            }}
                            onClick={(e) => e.stopPropagation()} // Evita cerrar al click dentro
                        >
                            <div className="modal-content" style={{
                                borderRadius: '16px',
                                overflow: 'hidden',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                            }}>
                                <div className="modal-header border-0" style={{
                                    background: 'linear-gradient(135deg, var(--primario, #6D28D9), #9F7AEA)',
                                    color: 'white',
                                    padding: '1.25rem 1.5rem'
                                }}>
                                    <h3 className="modal-title fw-bold" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)' }}>
                                        {eventoDetalle.titulo}
                                    </h3>
                                    <button
                                        type="button"
                                        className="btn-close btn-close-white"
                                        onClick={cerrarModal}
                                        aria-label="Cerrar"
                                    ></button>
                                </div>
                                <div className="modal-body" style={{
                                    maxHeight: '65vh',
                                    overflowY: 'auto',
                                    padding: '1.5rem'
                                }}>
                                    {/* Imagen centrada */}
                                    <div className="text-center mb-4">
                                        <img
                                            src={eventoDetalle.imagen}
                                            alt="Imagen Evento"
                                            className="img-fluid rounded shadow-sm"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '200px',
                                                objectFit: 'cover',
                                                borderRadius: '12px'
                                            }}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = eventoIMG;
                                            }}
                                        />
                                    </div>

                                    {/* Datos del evento en grid */}
                                    <div className="row g-3">
                                        <div className="col-sm-6">
                                            <div className="p-3 rounded" style={{ background: 'rgba(109, 40, 217, 0.05)' }}>
                                                <small className="text-muted d-block mb-1">Fecha</small>
                                                <strong>{eventoDetalle.fecha}</strong>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="p-3 rounded" style={{ background: 'rgba(109, 40, 217, 0.05)' }}>
                                                <small className="text-muted d-block mb-1">Tipo</small>
                                                <span className="badge" style={{
                                                    background: 'var(--acento, #00F0FF)',
                                                    color: '#1a1a2e',
                                                    fontSize: '0.85rem',
                                                    padding: '0.4rem 0.8rem'
                                                }}>
                                                    {eventoDetalle.tipo}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="p-3 rounded" style={{ background: 'rgba(109, 40, 217, 0.05)' }}>
                                                <small className="text-muted d-block mb-1">Lugar</small>
                                                <strong>{eventoDetalle.lugar}</strong>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="p-3 rounded" style={{ background: 'rgba(109, 40, 217, 0.05)' }}>
                                                <small className="text-muted d-block mb-1">Asistentes</small>
                                                <strong>{eventoDetalle.totalAsistentes || 0}/{eventoDetalle.capacidad || 'N/A'}</strong>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="p-3 rounded" style={{ background: 'rgba(109, 40, 217, 0.05)' }}>
                                                <small className="text-muted d-block mb-1">Precio</small>
                                                <strong>{eventoDetalle.precio === 0 ? 'Gratis' : `$${eventoDetalle.precio?.toLocaleString('es-CL') || 'Gratis'}`}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    {eventoDetalle.descripcion && (
                                        <div className="mt-4">
                                            <h6 className="fw-bold mb-2">Descripción</h6>
                                            <div className="p-3 rounded" style={{
                                                background: 'rgba(0,0,0,0.02)',
                                                border: '1px solid rgba(0,0,0,0.08)',
                                                maxHeight: '150px',
                                                overflowY: 'auto'
                                            }}>
                                                {descripcionExpandida ? (
                                                    <div
                                                        className="descripcion-completa-modal"
                                                        dangerouslySetInnerHTML={{ __html: eventoDetalle.descripcion }}
                                                    />
                                                ) : (
                                                    <div
                                                        className="descripcion-preview-modal"
                                                        dangerouslySetInnerHTML={{
                                                            __html: obtenerTextoPlano(eventoDetalle.descripcion).length > 200
                                                                ? truncarHTML(obtenerTextoPlano(eventoDetalle.descripcion), 200)
                                                                : eventoDetalle.descripcion
                                                        }}
                                                    />
                                                )}
                                                {obtenerTextoPlano(eventoDetalle.descripcion).length > 200 && (
                                                    <button
                                                        className="btn btn-link btn-sm p-0 mt-2"
                                                        onClick={() => setDescripcionExpandida(!descripcionExpandida)}
                                                    >
                                                        {descripcionExpandida ? 'Ver menos' : 'Ver más'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer border-0 flex-wrap gap-2" style={{
                                    padding: '1rem 1.5rem',
                                    background: 'rgba(0,0,0,0.02)'
                                }}>
                                    {/* Botones de acción solo si es mi evento */}
                                    {eventoDetalle.creadoPorId === user?.id && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn-warning"
                                                onClick={() => {
                                                    const indice = eventos.findIndex(e => e.id === eventoDetalle.id);
                                                    if (indice !== -1) {
                                                        iniciarEdicion(indice);
                                                        cerrarModal();
                                                    }
                                                }}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-danger"
                                                onClick={async () => {
                                                    const indice = eventos.findIndex(e => e.id === eventoDetalle.id);
                                                    if (indice !== -1) {
                                                        await borrarEventoConValidacion(indice);
                                                    }
                                                }}
                                            >
                                                Eliminar
                                            </button>
                                        </>
                                    )}
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={abrirModalAsistentes}
                                        style={{
                                            background: 'linear-gradient(135deg, var(--primario, #6D28D9), #9F7AEA)',
                                            border: 'none',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Ver Asistentes
                                    </button>
                                    <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* MODAL ASISTENTES */}
            {modalAsistentesAbierto && eventoAsistentes && (
                <ModalAsistentes
                    evento={eventoAsistentes}
                    onClose={cerrarModalAsistentes}
                    onUpdate={actualizarDespuesAsistentes}
                />
            )}

            {/* MODAL CONFIRMACION ELIMINAR */}
            <ModalConfirmacion
                visible={modalEliminar.visible}
                titulo={modalEliminar.tipo === 'input'
                    ? `Solicitud de Eliminacion: ${modalEliminar.evento?.titulo || ''}`
                    : `Eliminar: ${modalEliminar.evento?.titulo || ''}`}
                mensaje={modalEliminar.tipo === 'input'
                    ? `Este evento tiene ${modalEliminar.evento?.totalAsistentes || 0} asistentes confirmados.\n\nPor favor, indica la razon de la eliminacion. Un administrador revisara tu solicitud.`
                    : `¿Estas seguro de que deseas eliminar este evento?\n\nEsta accion es irreversible.`}
                tipo={modalEliminar.tipo}
                inputPlaceholder="Escribe la razon de la eliminacion (minimo 50 caracteres)..."
                inputMinLength={modalEliminar.tipo === 'input' ? 50 : 0}
                inputValue={modalEliminar.razon}
                onInputChange={(val) => setModalEliminar(prev => ({ ...prev, razon: val }))}
                textoConfirmar={modalEliminar.tipo === 'input' ? 'Enviar Solicitud' : 'Eliminar'}
                textoCancelar="Cancelar"
                variante="danger"
                onConfirm={handleConfirmarEliminar}
                onCancel={cerrarModalEliminar}
                procesando={modalEliminar.procesando}
            />

            <Footer />
        </>
    );
}

export default Admin;
