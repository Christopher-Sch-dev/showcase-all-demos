// Pie de página profesional con enlaces útiles y marca de agua académica

import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/footer.css';
import { logger } from '../utils/logger';

function Footer() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleAcercaDeClick = (e) => {
        e.preventDefault();
        logger.debug('Footer: Click en "Acerca de Nosotros"', { pathname: location.pathname });

        if (location.pathname === '/') {
            logger.debug('Footer: Ya en Home, haciendo scroll a #nosotros');
            const elemento = document.getElementById('nosotros');
            if (elemento) {
                logger.debug('Footer: Elemento #nosotros encontrado');
                elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                logger.warn('Footer: Elemento #nosotros no encontrado');
            }
        } else {
            logger.debug('Footer: Navegando a Home y luego scroll a #nosotros');
            navigate('/');
            setTimeout(() => {
                const elemento = document.getElementById('nosotros');
                if (elemento) {
                    logger.debug('Footer: Elemento #nosotros encontrado después de navegar');
                    elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
                } else {
                    logger.warn('Footer: Elemento #nosotros no encontrado después de navegar');
                }
            }, 100);
        }
    };

    return (
        <footer
            className="mt-5 py-5 text-white"
            style={{
                background: 'linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.6) 100%)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                borderTop: '2px solid rgba(139, 92, 246, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Grid de líneas cyberpunk */}
            <div
                data-watermark="dev chris from scratch eventos chile"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                    linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px),
                    linear-gradient(0deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)
                `,
                    backgroundSize: '50px 50px',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.3
                }} />

            {/* Texto gigante al fondo */}
            <div style={{
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: 'clamp(6rem, 15vw, 12rem)',
                fontWeight: '900',
                color: 'transparent',
                WebkitTextStroke: '1px rgba(0, 240, 255, 0.1)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                zIndex: 0,
                letterSpacing: '0.1em'
            }}>
                EVENTOS CHILE
            </div>

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="row g-4">
                    {/* Enlaces rápidos */}
                    <div className="col-md-4 col-lg-3">
                        <h5 className="fw-bold mb-3" style={{
                            color: '#00F0FF',
                            textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                            letterSpacing: '1px',
                            fontSize: '0.95rem',
                            textTransform: 'uppercase',
                            fontFamily: 'monospace'
                        }}>Enlaces Rápidos</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link to="/" className="footer-link">
                                    Inicio
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/eventos" className="footer-link">
                                    Eventos
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link
                                    id="Ftnosotros"
                                    to="/#nosotros"
                                    onClick={handleAcercaDeClick}
                                    className="footer-link"
                                >
                                    Acerca de Nosotros
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/auth" className="footer-link">
                                    Iniciar Sesión
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Información de contacto */}
                    <div className="col-md-4 col-lg-3">
                        <h5 className="fw-bold mb-3" style={{
                            color: '#00F0FF',
                            textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                            letterSpacing: '1px',
                            fontSize: '0.95rem',
                            textTransform: 'uppercase',
                            fontFamily: 'monospace'
                        }}>Contacto</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <span className="footer-text-secondary">Email:</span>{' '}
                                <a
                                    id="mail"
                                    href="mailto:eventoschile@gmail.com"
                                    className="footer-link footer-link-email"
                                >
                                    eventoschile@gmail.com
                                </a>
                            </li>
                            <li className="mb-2">
                                <span className="footer-text-secondary">Soporte:</span>{' '}
                                <span className="footer-text">Disponible 24/7</span>
                            </li>
                        </ul>
                    </div>

                    {/* Información adicional */}
                    <div className="col-md-4 col-lg-3">
                        <h5 className="fw-bold mb-3" style={{
                            color: '#00F0FF',
                            textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                            letterSpacing: '1px',
                            fontSize: '0.95rem',
                            textTransform: 'uppercase',
                            fontFamily: 'monospace'
                        }}>Información</h5>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <span className="footer-text">Plataforma de eventos en Chile</span>
                            </li>
                            <li className="mb-2">
                                <span className="footer-text">Crea y gestiona eventos fácilmente</span>
                            </li>
                            <li className="mb-2">
                                <Link to="/terminos" className="footer-link">
                                    Terminos y Condiciones
                                </Link>
                            </li>
                        </ul>
                    </div>


                    {/* Redes sociales y más */}
                    <div className="col-md-12 col-lg-3">
                        <h5 className="fw-bold mb-3" style={{
                            color: '#00F0FF',
                            textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                            letterSpacing: '1px',
                            fontSize: '0.95rem',
                            textTransform: 'uppercase',
                            fontFamily: 'monospace'
                        }}>Síguenos</h5>
                        <div className="d-flex flex-wrap gap-3 mb-3">
                            <a
                                href="#"
                                className="footer-social-icon"
                                aria-label="Facebook"
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fab fa-facebook"></i>
                            </a>
                            <a
                                href="#"
                                className="footer-social-icon"
                                aria-label="Twitter"
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a
                                href="#"
                                className="footer-social-icon"
                                aria-label="Instagram"
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fab fa-instagram"></i>
                            </a>
                            <a
                                href="#"
                                className="footer-social-icon"
                                aria-label="LinkedIn"
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fab fa-linkedin"></i>
                            </a>
                            <a
                                href="#"
                                className="footer-social-icon"
                                aria-label="YouTube"
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fab fa-youtube"></i>
                            </a>
                            <a
                                href="#"
                                className="footer-social-icon"
                                aria-label="TikTok"
                                onClick={(e) => e.preventDefault()}
                            >
                                <i className="fab fa-tiktok"></i>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Línea divisoria con efecto neón */}
                <div className="my-4" style={{
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), rgba(0, 240, 255, 0.5), rgba(139, 92, 246, 0.5), transparent)',
                    boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)'
                }} />

                {/* Marca de agua académica y copyright */}
                <div className="row">
                    <div className="col-12 text-center">
                        <p className="mb-2" style={{
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '0.9rem',
                            fontFamily: 'monospace',
                            letterSpacing: '1px'
                        }}>
                            © {new Date().getFullYear()} <span style={{
                                color: '#00F0FF',
                                fontWeight: 'bold'
                            }}>EVENTOS CHILE</span> · Todos los derechos reservados
                        </p>
                        {/* Link discreto a Acerca del Proyecto */}
                        <Link
                            to="/acerca-proyecto"
                            className="footer-link-subtle"
                        >
                            <i className="bi bi-info-circle"></i>
                            Acerca del Proyecto
                        </Link>
                        <p className="mb-0" style={{
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: '0.8rem',
                            fontFamily: 'monospace'
                        }}>
                            Desarrollado por <a
                                href="https://portafolio-devchris.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#8B5CF6',
                                    fontWeight: 'bold',
                                    textDecoration: 'none',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.color = '#00F0FF';
                                    e.target.style.textShadow = '0 0 10px rgba(0, 240, 255, 0.5)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = '#8B5CF6';
                                    e.target.style.textShadow = 'none';
                                }}
                            >Christopher Schiefelbein</a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
