/**
 * Página Acerca del Proyecto
 * Muestra información resumida del proyecto Eventos Chile
 * Similar al README del repositorio pero con UI profesional
 * Autor: Christopher Schiefelbein
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/acerca-proyecto.css';

const AcercaDelProyecto = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="acerca-proyecto-page">
            <Navbar />

            <main className="container py-5 mt-4">
                {/* Hero Section */}
                <section className="acerca-hero text-center mb-5">
                    <div className="acerca-badge">PROYECTO ACADÉMICO</div>
                    <h1 className="acerca-title">
                        Eventos <span className="acerca-highlight">Chile</span>
                    </h1>
                    <p className="acerca-subtitle">
                        Plataforma Integral de Gestión de Eventos
                    </p>
                    <div className="acerca-meta">
                        <span className="acerca-meta-item">
                            <i className="bi bi-building"></i>
                            Duoc UC
                        </span>
                        <span className="acerca-meta-divider">•</span>
                        <span className="acerca-meta-item">
                            <i className="bi bi-book"></i>
                            Desarrollo Full Stack 2
                        </span>
                        <span className="acerca-meta-divider">•</span>
                        <span className="acerca-meta-item">
                            <i className="bi bi-calendar3"></i>
                            2° Semestre 2025
                        </span>
                    </div>
                </section>

                {/* Resumen Ejecutivo */}
                <section className="acerca-section">
                    <div className="acerca-section-header">
                        <div className="acerca-section-icon">
                            <i className="bi bi-info-circle"></i>
                        </div>
                        <h2>Resumen del Proyecto</h2>
                    </div>
                    <div className="acerca-card">
                        <p>
                            <strong>Eventos Chile</strong> es una solución tecnológica orientada a la
                            centralización y sistematización de la oferta de eventos culturales, deportivos
                            y sociales a nivel nacional.
                        </p>
                        <p>
                            El sistema implementa una lógica de negocio robusta que permite a los
                            administradores gestionar el ciclo de vida completo de los eventos, mientras
                            provee a los usuarios finales una experiencia de descubrimiento fluida,
                            potenciada por algoritmos de filtrado e integración de Inteligencia Artificial.
                        </p>
                    </div>
                </section>

                {/* Arquitectura */}
                <section className="acerca-section">
                    <div className="acerca-section-header">
                        <div className="acerca-section-icon">
                            <i className="bi bi-diagram-3"></i>
                        </div>
                        <h2>Arquitectura de Software</h2>
                    </div>

                    <div className="acerca-grid">
                        {/* Backend */}
                        <div className="acerca-card tech-card">
                            <div className="tech-card-header backend">
                                <i className="bi bi-server"></i>
                                <h3>Backend</h3>
                            </div>
                            <ul className="tech-list">
                                <li>
                                    <span className="tech-tag">Framework</span>
                                    Spring Boot 3.2.0 (Java 17)
                                </li>
                                <li>
                                    <span className="tech-tag">Base de Datos</span>
                                    PostgreSQL + Spring Data JPA
                                </li>
                                <li>
                                    <span className="tech-tag">Seguridad</span>
                                    Spring Security + JWT
                                </li>
                                <li>
                                    <span className="tech-tag">IA</span>
                                    Google Gemini Pro (WebClient)
                                </li>
                                <li>
                                    <span className="tech-tag">API Docs</span>
                                    OpenAPI 3.0 / Swagger UI
                                </li>
                            </ul>
                        </div>

                        {/* Frontend */}
                        <div className="acerca-card tech-card">
                            <div className="tech-card-header frontend">
                                <i className="bi bi-window-desktop"></i>
                                <h3>Frontend</h3>
                            </div>
                            <ul className="tech-list">
                                <li>
                                    <span className="tech-tag">Core</span>
                                    React 18 + Vite
                                </li>
                                <li>
                                    <span className="tech-tag">Estado</span>
                                    Context API
                                </li>
                                <li>
                                    <span className="tech-tag">UI/UX</span>
                                    Bootstrap 5 + CSS Modules
                                </li>
                                <li>
                                    <span className="tech-tag">3D</span>
                                    Three.js (Hero Section)
                                </li>
                                <li>
                                    <span className="tech-tag">Testing</span>
                                    Vitest + React Testing Library
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Funcionalidades */}
                <section className="acerca-section">
                    <div className="acerca-section-header">
                        <div className="acerca-section-icon">
                            <i className="bi bi-stars"></i>
                        </div>
                        <h2>Funcionalidades Principales</h2>
                    </div>

                    <div className="features-grid">
                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="bi bi-search"></i>
                            </div>
                            <h4>Catálogo Interactivo</h4>
                            <p>Motor de búsqueda con scroll infinito y filtrado multidimensional</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="bi bi-person-badge"></i>
                            </div>
                            <h4>Gestión de Identidad</h4>
                            <p>Registro con validación de RUT chileno y gestión de perfiles</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="bi bi-calendar-check"></i>
                            </div>
                            <h4>Control de Asistencia</h4>
                            <p>Reserva de cupos y confirmación en tiempo real</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="bi bi-shield-lock"></i>
                            </div>
                            <h4>Panel Administrativo</h4>
                            <p>CRUD protegido por roles (RBAC) y monitoreo de métricas</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="bi bi-robot"></i>
                            </div>
                            <h4>Asistente Virtual</h4>
                            <p>Chatbot con IA para recomendaciones personalizadas</p>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon">
                                <i className="bi bi-palette"></i>
                            </div>
                            <h4>Diseño Moderno</h4>
                            <p>Interfaz cyberpunk con efectos 3D y animaciones fluidas</p>
                        </div>
                    </div>
                </section>

                {/* Desarrollador */}
                <section className="acerca-section">
                    <div className="acerca-section-header">
                        <div className="acerca-section-icon">
                            <i className="bi bi-code-square"></i>
                        </div>
                        <h2>Desarrollado por</h2>
                    </div>

                    <div className="developer-card">
                        <div className="developer-avatar">
                            <div className="avatar-glow"></div>
                            <i className="bi bi-person-workspace"></i>
                        </div>
                        <div className="developer-info">
                            <h3>Christopher Schiefelbein</h3>
                            <span className="developer-role">Full Stack Developer</span>
                            <p className="developer-description">
                                Proyecto desarrollado íntegramente como parte de la asignatura
                                Desarrollo Full Stack 2 en Duoc UC.
                            </p>
                            <div className="developer-links">
                                <a
                                    href="https://portafolio-devchris.vercel.app/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="developer-link"
                                >
                                    <i className="bi bi-globe2"></i> Portafolio
                                </a>
                                <a
                                    href="https://github.com/Ch-sch-xxx"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="developer-link"
                                >
                                    <i className="bi bi-github"></i> GitHub
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tecnologías Visual */}
                <section className="acerca-section">
                    <div className="acerca-section-header">
                        <div className="acerca-section-icon">
                            <i className="bi bi-code-slash"></i>
                        </div>
                        <h2>Stack Tecnológico</h2>
                    </div>

                    <div className="tech-badges">
                        <span className="tech-badge react">React 18</span>
                        <span className="tech-badge vite">Vite</span>
                        <span className="tech-badge spring">Spring Boot</span>
                        <span className="tech-badge java">Java 17</span>
                        <span className="tech-badge postgres">PostgreSQL</span>
                        <span className="tech-badge bootstrap">Bootstrap 5</span>
                        <span className="tech-badge threejs">Three.js</span>
                        <span className="tech-badge jwt">JWT</span>
                        <span className="tech-badge gemini">Google Gemini</span>
                    </div>
                </section>

                {/* CTA */}
                <section className="acerca-cta">
                    <h3>¿Listo para explorar eventos?</h3>
                    <p>Descubre eventos culturales, deportivos y sociales en todo Chile</p>
                    <div className="acerca-cta-buttons">
                        <Link to="/eventos" className="btn-acerca-primary">
                            <i className="bi bi-calendar-event"></i>
                            Ver Eventos
                        </Link>
                        <Link to="/auth" className="btn-acerca-secondary">
                            <i className="bi bi-person-plus"></i>
                            Registrarse
                        </Link>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AcercaDelProyecto;
