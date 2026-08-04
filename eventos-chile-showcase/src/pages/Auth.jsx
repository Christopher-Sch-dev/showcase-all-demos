// Página de autenticación con login y registro
// Sistema mejorado de validación y seguridad

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/apiAuth';
import '../styles/auth.css';
import { logger } from '../utils/logger';
import { showSuccess } from '../utils/toast';
import {
    formatearRUT,
    validarEmail,
    validarNombre,
    validarPassword,
    validarRUT
} from '../utils/validation';

// DATOS DE REGIONES Y COMUNAS
import { regionesYcomunas } from '../data/ubicaciones';

// COMPONENTE MODAL DE TERMINOS
import ModalTerminos from '../components/ModalTerminos';

// COMPONENTE AUTH
function Auth() {
    const navigate = useNavigate();
    const { login, isLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn()) {
            navigate('/perfil', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    if (isLoggedIn()) {
        return null; // No renderiza nada mientras redirige
    }

    // Estado para toggle entre login/registro
    const [mostrarRegistro, setMostrarRegistro] = useState(false);

    // Estados para manejo de errores
    const [errors, setErrors] = useState({});
    const [loginError, setLoginError] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);

    // Estados formulario LOGIN
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Estados formulario REGISTRO
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerRut, setRegisterRut] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerRegion, setRegisterRegion] = useState('');
    const [registerComuna, setRegisterComuna] = useState('');
    const [comunasDisponibles, setComunasDisponibles] = useState([]);
    const [aceptoTerminos, setAceptoTerminos] = useState(false);
    const [mostrarModalTerminos, setMostrarModalTerminos] = useState(false);

    // Cargar comunas cuando cambia la región
    useEffect(() => {
        if (registerRegion && regionesYcomunas[registerRegion]) {
            setComunasDisponibles(regionesYcomunas[registerRegion]);
            setRegisterComuna(''); // Reset comuna al cambiar región
        } else {
            setComunasDisponibles([]);
        }
    }, [registerRegion]);

    // Formateo automático de RUT mientras escribe
    const handleRutChange = (e) => {
        const valorFormateado = formatearRUT(e.target.value);
        setRegisterRut(valorFormateado);
    };

    // MANEJO LOGIN
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoginError('');
        setErrors({});

        try {
            const email = loginEmail.trim();
            const pass = loginPassword.trim();

            const resultado = await login(email, pass);

            if (resultado.success) {
                setLoginError('');
                // Redirección basada en rol: SUPER_ADMIN va a panel especial
                const userData = JSON.parse(localStorage.getItem('user-data'));
                if (userData?.rol === 'SUPER_ADMIN') {
                    navigate('/super-admin', { replace: true });
                } else {
                    navigate('/perfil', { replace: true });
                }
            } else {
                setLoginError(resultado.error || 'El email o la contraseña son incorrectos');
                setLoginPassword(''); // Limpiar solo la contraseña para facilitar reintentos
            }
        } catch (error) {
            logger.error('Error al iniciar sesión:', error);
            setLoginError('Error al iniciar sesión. Por favor, intenta nuevamente.');
        }
    };

    // MANEJO REGISTRO
    const handleRegister = async (e) => {
        e.preventDefault();
        setFormSubmitting(true);

        try {
            // Obtener y limpiar valores
            const name = registerName.trim();
            const email = registerEmail.trim();
            const rut = registerRut.trim();
            const pass = registerPassword.trim();

            // Validaciones
            const newErrors = {};

            // Validar nombre
            if (!validarNombre(name)) {
                newErrors.name = 'El nombre debe contener solo letras y tener al menos 2 caracteres';
            }

            // Validar email
            if (!validarEmail(email)) {
                newErrors.email = 'Por favor, ingresa un email válido';
            }

            // Validar RUT
            if (!validarRUT(rut)) {
                newErrors.rut = 'Por favor, ingresa un RUT chileno válido';
            }

            // Validar contraseña
            const validacionPass = validarPassword(pass);
            if (!validacionPass.isValid) {
                newErrors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
            }

            // Validar ubicación
            if (!registerRegion || !registerComuna) {
                newErrors.ubicacion = 'Por favor, selecciona región y comuna';
            }

            // Validar aceptacion de terminos y condiciones
            if (!aceptoTerminos) {
                newErrors.terminos = 'Debes aceptar los terminos y condiciones para registrarte';
            }

            // Si hay errores, actualizamos el estado y detenemos el proceso
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                setFormSubmitting(false);
                // Hacer scroll al primer error
                const firstErrorField = document.querySelector('.is-invalid');
                if (firstErrorField) {
                    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    firstErrorField.focus();
                }
                return;
            }

            // Limpiar errores si todo está bien
            setErrors({});

            // Crear nuevo usuario (rol siempre USER - unificado)
            const nuevoUsuario = {
                nombre: name,
                email,
                rut: formatearRUT(rut),
                password: pass,
                region: registerRegion,
                comuna: registerComuna,
                rol: 'USER' // Rol unificado para todos los usuarios
            };

            const resultado = await register(nuevoUsuario);

            if (resultado.success) {
                setErrors({});
                setLoginError('');
                showSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');

                // Limpiar formulario
                setRegisterName('');
                setRegisterEmail('');
                setRegisterRut('');
                setRegisterPassword('');
                setRegisterRegion('');
                setRegisterComuna('');

                // Volver al login
                setMostrarRegistro(false);
            } else {
                setErrors(prev => ({
                    ...prev,
                    submit: resultado.error || 'Error al crear el usuario'
                }));
            }
        } catch (error) {
            logger.error('Error en el registro:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Error del servidor. Por favor, intenta más tarde.'
            }));
        } finally {
            setFormSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="container my-5">
                <section className="row justify-content-center align-items-start g-4">
                    {/* Columna del formulario */}
                    <div className="col-lg-5 col-xl-5">
                        <div className="auth-contenedor">

                            {/* FORMULARIO LOGIN */}
                            {!mostrarRegistro && (
                                <form onSubmit={handleLogin} className="auth-form">
                                    <h2 className="text-center mb-4">Iniciar sesión</h2>

                                    <div className="mb-3">
                                        <label htmlFor="login-email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className={`form-control ${loginError ? 'is-invalid' : ''}`}
                                            id="login-email"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
                                            required
                                            placeholder="ejemplo@correo.com"
                                        />
                                        {loginError && <div className="error-message">{loginError}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="login-password" className="form-label">Contraseña</label>
                                        <div className="input-group">
                                            <input
                                                type="password"
                                                className="form-control"
                                                id="login-password"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                required
                                                minLength="4"
                                                maxLength="20"
                                                placeholder="Contraseña"
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => {
                                                    const input = document.getElementById('login-password');
                                                    input.type = input.type === 'password' ? 'text' : 'password';
                                                }}
                                            >
                                                Ver
                                            </button>
                                        </div>
                                    </div>

                                    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold" id="logueado">
                                        Entrar
                                    </button>

                                    <p className="text-center mt-3 mb-0">
                                        ¿No tienes cuenta?{' '}
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setMostrarRegistro(true);
                                            }}
                                            className="text-decoration-none"
                                            id="link-register"
                                        >
                                            Regístrate
                                        </a>
                                    </p>
                                </form>
                            )}

                            {/* FORMULARIO REGISTRO */}
                            {mostrarRegistro && (
                                <form
                                    onSubmit={handleRegister}
                                    className="auth-form needs-validation"
                                    noValidate
                                >
                                    <h2 className="text-center mb-4">Crear cuenta nueva</h2>
                                    {errors.submit && (
                                        <div className="alert alert-danger" role="alert">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            {errors.submit}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label htmlFor="register-name" className="form-label">Nombre completo</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                            id="register-name"
                                            value={registerName}
                                            onChange={(e) => {
                                                setRegisterName(e.target.value);
                                                if (errors.name) {
                                                    setErrors(prev => ({ ...prev, name: null }));
                                                }
                                            }}
                                            aria-describedby="nameHelp"
                                            required
                                            placeholder="Tu nombre completo"
                                        />
                                        {errors.name && (
                                            <div className="invalid-feedback">
                                                {errors.name}
                                            </div>
                                        )}
                                        <div id="nameHelp" className="form-text">
                                            Ingresa tu nombre y apellido
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="register-email" className="form-label">Email</label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            id="register-email"
                                            value={registerEmail}
                                            onChange={(e) => setRegisterEmail(e.target.value)}
                                            required
                                            placeholder="ejemplo-correo@dominio.cl"
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">
                                                {errors.email}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="register-rut" className="form-label">RUT chileno</label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.rut ? 'is-invalid' : ''}`}
                                            id="register-rut"
                                            value={registerRut}
                                            onChange={(e) => {
                                                handleRutChange(e);
                                                if (errors.rut) {
                                                    setErrors(prev => ({ ...prev, rut: null }));
                                                }
                                            }}
                                            required
                                            placeholder="12345678-9"
                                            maxLength="12"
                                        />
                                        {errors.rut ? (
                                            <div className="invalid-feedback">
                                                {errors.rut}
                                            </div>
                                        ) : (
                                            <small className="form-text text-muted">Formato: 12345678-9</small>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="register-password" className="form-label">Contraseña</label>
                                        <div className="input-group">
                                            <input
                                                type="password"
                                                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                                id="register-password"
                                                value={registerPassword}
                                                onChange={(e) => {
                                                    setRegisterPassword(e.target.value);
                                                    if (errors.password) {
                                                        setErrors(prev => ({ ...prev, password: null }));
                                                    }
                                                }}
                                                required
                                                placeholder="Contraseña"
                                                autoComplete="new-password"
                                                aria-describedby="passwordHelp"
                                            />
                                            <button
                                                className="btn btn-outline-secondary"
                                                type="button"
                                                onClick={() => {
                                                    const input = document.getElementById('register-password');
                                                    input.type = input.type === 'password' ? 'text' : 'password';
                                                }}
                                            >
                                                Ver
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <div className="invalid-feedback d-block">
                                                {errors.password}
                                            </div>
                                        )}
                                        <div id="passwordHelp" className="form-text">
                                            La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="register-region" className="form-label">Región</label>
                                        <select
                                            className={`form-select ${errors.ubicacion ? 'is-invalid' : ''}`}
                                            id="register-region"
                                            value={registerRegion}
                                            onChange={(e) => {
                                                setRegisterRegion(e.target.value);
                                                if (errors.ubicacion) {
                                                    setErrors(prev => ({ ...prev, ubicacion: null }));
                                                }
                                            }}
                                            required
                                        >
                                            <option value="">Selecciona región</option>
                                            {Object.keys(regionesYcomunas).map((region) => (
                                                <option key={region} value={region}>{region}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="register-comuna" className="form-label">Comuna</label>
                                        <select
                                            className={`form-select ${errors.ubicacion ? 'is-invalid' : ''}`}
                                            id="register-comuna"
                                            value={registerComuna}
                                            onChange={(e) => {
                                                setRegisterComuna(e.target.value);
                                                if (errors.ubicacion) {
                                                    setErrors(prev => ({ ...prev, ubicacion: null }));
                                                }
                                            }}
                                            required
                                            disabled={!registerRegion}
                                        >
                                            <option value="">Selecciona comuna</option>
                                            {comunasDisponibles.map((comuna) => (
                                                <option key={comuna} value={comuna}>{comuna}</option>
                                            ))}
                                        </select>
                                        {errors.ubicacion && (
                                            <div className="invalid-feedback">
                                                {errors.ubicacion}
                                            </div>
                                        )}
                                    </div>

                                    {/* Checkbox de Terminos y Condiciones */}
                                    <div className="mb-3">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className={`form-check-input ${errors.terminos ? 'is-invalid' : ''}`}
                                                id="acepto-terminos"
                                                checked={aceptoTerminos}
                                                onChange={() => {
                                                    if (!aceptoTerminos) {
                                                        setMostrarModalTerminos(true);
                                                    } else {
                                                        setAceptoTerminos(false);
                                                    }
                                                }}
                                            />
                                            <label className="form-check-label" htmlFor="acepto-terminos">
                                                Acepto los{' '}
                                                <button
                                                    type="button"
                                                    className="btn btn-link p-0 text-primary"
                                                    onClick={() => setMostrarModalTerminos(true)}
                                                    style={{ verticalAlign: 'baseline' }}
                                                >
                                                    Terminos y Condiciones
                                                </button>
                                            </label>
                                        </div>
                                        {errors.terminos && (
                                            <div className="invalid-feedback d-block">
                                                {errors.terminos}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-2 fw-bold"
                                        disabled={formSubmitting}
                                    >
                                        {formSubmitting ? (
                                            <span>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Procesando...
                                            </span>
                                        ) : 'Registrar'}
                                    </button>
                                    {errors.submit && (
                                        <div className="alert alert-danger mt-3" role="alert">
                                            {errors.submit}
                                        </div>
                                    )}                                    <div className="d-grid gap-2">

                                    </div>

                                    <hr className="my-4" />

                                    <p className="text-center mb-0">
                                        ¿Ya tienes cuenta?{' '}
                                        <button
                                            type="button"
                                            className="btn btn-link p-0 border-0 align-baseline"
                                            onClick={() => {
                                                setMostrarRegistro(false);
                                                setErrors({});
                                            }}
                                        >
                                            Inicia sesión aquí
                                        </button>
                                    </p>
                                </form>
                            )}

                        </div>
                    </div>

                    {/* Columna de credenciales demo */}
                    <div className="col-lg-5 col-xl-4">
                        <div className="demo-credentials-card">
                            <div className="demo-header">
                                <span className="demo-badge">MODO DEMO</span>
                                <h3>Credenciales de Prueba</h3>
                                <p className="demo-subtitle">
                                    Usa estas cuentas para explorar todas las funcionalidades del sistema.
                                </p>
                            </div>

                            {/* Super Admin */}
                            <div className="demo-user-card super-admin">
                                <div className="demo-user-header">
                                    <div className="demo-icon">
                                        <i className="bi bi-shield-lock-fill"></i>
                                    </div>
                                    <div className="demo-user-info">
                                        <span className="demo-role-badge super">SUPER ADMIN</span>
                                        <span className="demo-note">Único - Acceso total</span>
                                    </div>
                                </div>
                                <div className="demo-credentials">
                                    <div className="demo-field">
                                        <label>Email:</label>
                                        <code>admin@eventochile.cl</code>
                                    </div>
                                    <div className="demo-field">
                                        <label>Contraseña:</label>
                                        <code>Admin123!</code>
                                    </div>
                                </div>
                                <div className="demo-features">
                                    <small>Panel Super Admin, gestión de usuarios, aprobar/rechazar solicitudes</small>
                                </div>
                                <button
                                    type="button"
                                    className="btn-use-credentials super"
                                    onClick={() => {
                                        setLoginEmail('admin@eventochile.cl');
                                        setLoginPassword('Admin123!');
                                        setMostrarRegistro(false);
                                    }}
                                >
                                    Usar credenciales
                                </button>
                            </div>

                            {/* Usuario Normal */}
                            <div className="demo-user-card user-normal">
                                <div className="demo-user-header">
                                    <div className="demo-icon">
                                        <i className="bi bi-person-fill"></i>
                                    </div>
                                    <div className="demo-user-info">
                                        <span className="demo-role-badge user">USUARIO</span>
                                        <span className="demo-note">Tiene eventos creados</span>
                                    </div>
                                </div>
                                <div className="demo-credentials">
                                    <div className="demo-field">
                                        <label>Email:</label>
                                        <code>demo@eventochile.cl</code>
                                    </div>
                                    <div className="demo-field">
                                        <label>Contraseña:</label>
                                        <code>Demo123!</code>
                                    </div>
                                </div>
                                <div className="demo-features">
                                    <small>Crear/editar eventos, gestionar asistentes, ver perfil</small>
                                </div>
                                <button
                                    type="button"
                                    className="btn-use-credentials user"
                                    onClick={() => {
                                        setLoginEmail('demo@eventochile.cl');
                                        setLoginPassword('Demo123!');
                                        setMostrarRegistro(false);
                                    }}
                                >
                                    Usar credenciales
                                </button>
                            </div>

                            {/* Invitación a crear cuenta */}
                            <div className="demo-footer">
                                <div className="demo-divider">
                                    <span>o</span>
                                </div>
                                <p className="demo-invite">
                                    <strong>¿Quieres probar el registro?</strong><br />
                                    Crea tu propia cuenta usando el formulario de registro.
                                    Los nuevos usuarios tienen rol <code>USER</code> por defecto.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />

            {/* Modal de Terminos y Condiciones */}
            {mostrarModalTerminos && (
                <ModalTerminos
                    onAceptar={() => {
                        setAceptoTerminos(true);
                        setMostrarModalTerminos(false);
                        if (errors.terminos) {
                            setErrors(prev => ({ ...prev, terminos: null }));
                        }
                    }}
                    onCancelar={() => {
                        setMostrarModalTerminos(false);
                    }}
                />
            )}
        </>
    );
}

export default Auth;
