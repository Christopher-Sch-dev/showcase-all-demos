// Barra de navegación responsive que cambia según el estado de sesión

import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import iconoPerfil from '../assets/ICONOperfil.png';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { user, logout, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Detecto la ruta actual
    const [showDropdown, setShowDropdown] = useState(false);
    const [fotoPerfil, setFotoPerfil] = useState(iconoPerfil);
    const dropdownRef = useRef(null);

    // Cargar foto de perfil desde localStorage y actualizar cuando cambie
    useEffect(() => {
        const loadFotoPerfil = () => {
            const userData = localStorage.getItem('user-data');
            if (userData) {
                try {
                    const parsed = JSON.parse(userData);
                    if (parsed.fotoUrl) {
                        setFotoPerfil(parsed.fotoUrl);
                    } else {
                        setFotoPerfil(iconoPerfil);
                    }
                } catch (e) {
                    setFotoPerfil(iconoPerfil);
                }
            } else {
                setFotoPerfil(iconoPerfil);
            }
        };

        if (isLoggedIn()) {
            loadFotoPerfil();

            // Escuchar cambios en localStorage
            const handleStorageChange = () => {
                loadFotoPerfil();
            };

            window.addEventListener('storage', handleStorageChange);
            // También escuchar eventos personalizados para cambios en la misma pestaña
            window.addEventListener('userDataUpdated', handleStorageChange);

            return () => {
                window.removeEventListener('storage', handleStorageChange);
                window.removeEventListener('userDataUpdated', handleStorageChange);
            };
        } else {
            setFotoPerfil(iconoPerfil);
        }
    }, [isLoggedIn]); // Removido 'user' de dependencias - isLoggedIn() ya verifica el estado

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleLogout = () => {
        // Logout directo con feedback visual (no necesita confirmacion)
        logout();
        navigate('/');
    };

    return (
        <header
            className="navbar navbar-expand-lg navbar-dark"
            style={{
                background: 'rgba(0, 0, 0, 0.5)', // Fondo semitransparente oscuro (glass)
                backdropFilter: 'blur(20px)', // Efecto glass aumentado a 20px
                WebkitBackdropFilter: 'blur(20px)', // Soporte Safari
                minHeight: '80px',
                position: location.pathname === '/' ? 'fixed' : 'sticky',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                width: '100%',
                transition: 'background 0.3s ease',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)' // Borde sutil
            }}
        >
            <div className="container-fluid px-4">
                {/* Título estático que siempre redirige a inicio - Estilo minimalista y profesional */}
                <Link
                    to="/"
                    className="navbar-brand mb-0 fw-bold text-white text-decoration-none d-flex align-items-center gap-2"
                    id="h1_titulo"
                    style={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '6px',
                        background: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <img
                        src="/assets/logo-oficial.png"
                        alt="Eventos Chile Logo"
                        style={{
                            width: '45px', // Tamaño ajustado para visibilidad
                            height: '45px',
                            objectFit: 'contain',
                            filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.6))', // Glow sutil cyan
                            mixBlendMode: 'lighten', // Mejor para eliminar fondos negros en UI oscura
                            borderRadius: '12px' // Suavizar bordes por si acaso
                        }}
                    />
                    <span style={{
                        background: 'linear-gradient(90deg, #fff, #00f0ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: '800',
                        letterSpacing: '0.5px'
                    }}>Eventos Chile</span>
                </Link>

                {/* Botón de menú para pantallas móviles */}
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navegacionPrincipal"
                    aria-controls="navegacionPrincipal"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                {/* Links de navegación que se colapsan en móvil */}
                <nav className="collapse navbar-collapse justify-content-end" id="navegacionPrincipal">
                    <ul className="navbar-nav gap-2">
                        <li className="nav-item">
                            <Link className="nav-link px-3 py-2 rounded-pill" to="/">
                                Inicio
                            </Link>
                        </li>

                        <li className="nav-item">
                            <Link className="nav-link px-3 py-2 rounded-pill" to="/eventos">
                                Eventos
                            </Link>
                        </li>

                        {/* Si no hay sesión activa, muestro el botón de login */}
                        {!isLoggedIn() ? (
                            <li className="nav-item">
                                <Link className="nav-link px-3 py-2 rounded-pill" to="/auth">
                                    Iniciar sesión
                                </Link>
                            </li>
                        ) : (
                            // Si hay sesión, muestro dropdown con foto de perfil
                            <li className="nav-item dropdown" ref={dropdownRef}>
                                <button
                                    className="nav-link px-2 py-2 rounded-pill btn btn-link text-white d-flex align-items-center"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    style={{
                                        textDecoration: 'none',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    aria-expanded={showDropdown}
                                >
                                    <img
                                        src={fotoPerfil}
                                        alt="Perfil"
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            marginRight: '8px'
                                        }}
                                        onError={(e) => { e.target.src = iconoPerfil; }}
                                    />
                                    <span className="d-none d-md-inline">{user?.nombre || 'Usuario'}</span>
                                    <span className="ms-1">▼</span>
                                </button>
                                {showDropdown && (
                                    <div
                                        className="dropdown-menu dropdown-menu-end show"
                                        style={{
                                            marginTop: '8px',
                                            minWidth: '200px',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                        }}
                                    >
                                        <Link
                                            className="dropdown-item d-flex align-items-center"
                                            to="/admin"
                                            onClick={() => setShowDropdown(false)}
                                        >

                                            Gestión de Eventos
                                        </Link>
                                        <Link
                                            className="dropdown-item d-flex align-items-center"
                                            to="/perfil"
                                            onClick={() => setShowDropdown(false)}
                                        >

                                            Mi Perfil
                                        </Link>
                                        {/* Link a Super Admin - Solo visible para SUPER_ADMIN */}
                                        {user?.rol === 'SUPER_ADMIN' && (
                                            <Link
                                                className="dropdown-item d-flex align-items-center"
                                                to="/super-admin"
                                                onClick={() => setShowDropdown(false)}
                                                style={{ color: '#10b981' }}
                                            >

                                                Panel Super Admin
                                            </Link>
                                        )}
                                        <hr className="dropdown-divider" />
                                        <button
                                            className="dropdown-item d-flex align-items-center text-danger"
                                            onClick={() => {
                                                setShowDropdown(false);
                                                handleLogout();
                                            }}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                width: '100%',
                                                textAlign: 'left'
                                            }}
                                        >

                                            Cerrar sesión
                                        </button>
                                    </div>
                                )}
                            </li>
                        )}
                    </ul>
                </nav>
            </div>
        </header>
    );
}

export default Navbar;
