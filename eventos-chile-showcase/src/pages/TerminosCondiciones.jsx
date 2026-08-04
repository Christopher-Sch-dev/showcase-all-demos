// Pagina de Terminos y Condiciones
// Accesible desde el footer, muestra los terminos del uso de la plataforma

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/terminos.css';

const TerminosCondiciones = () => {
    return (
        <>
            <Navbar />
            <main className="terminos-page">
                <div className="container py-5">
                    <div className="terminos-card">
                        <h1 className="terminos-titulo">Terminos y Condiciones</h1>
                        <p className="terminos-fecha">Ultima actualizacion: Diciembre 2025</p>

                        <section className="terminos-seccion">
                            <h2>1. Aceptacion de los Terminos</h2>
                            <p>
                                Al acceder y utilizar la plataforma Eventos Chile, aceptas estos terminos y
                                condiciones en su totalidad. Si no estas de acuerdo con alguna parte de estos
                                terminos, no debes utilizar nuestros servicios.
                            </p>
                        </section>

                        <section className="terminos-seccion">
                            <h2>2. Descripcion del Servicio</h2>
                            <p>
                                Eventos Chile es una plataforma que permite a los usuarios:
                            </p>
                            <ul>
                                <li>Descubrir y buscar eventos en Chile</li>
                                <li>Confirmar asistencia a eventos publicos</li>
                                <li>Crear y gestionar eventos (usuarios administradores)</li>
                                <li>Interactuar con un asistente virtual para consultas</li>
                            </ul>
                        </section>

                        <section className="terminos-seccion">
                            <h2>3. Registro de Usuario</h2>
                            <p>
                                Para acceder a ciertas funcionalidades, deberas crear una cuenta proporcionando
                                informacion veraz y completa. Eres responsable de mantener la confidencialidad
                                de tu contrasena y de todas las actividades que ocurran bajo tu cuenta.
                            </p>
                        </section>

                        <section className="terminos-seccion">
                            <h2>4. Proteccion de Datos Personales</h2>
                            <p>
                                Nos comprometemos a proteger tu informacion personal de acuerdo con la
                                Ley 19.628 sobre Proteccion de la Vida Privada de Chile. Los datos que
                                recopilamos incluyen:
                            </p>
                            <ul>
                                <li>Nombre completo</li>
                                <li>Correo electronico</li>
                                <li>RUT (para usuarios registrados)</li>
                                <li>Region de residencia</li>
                            </ul>
                            <p>
                                Estos datos seran utilizados exclusivamente para la gestion de la plataforma
                                y no seran compartidos con terceros sin tu consentimiento expreso.
                            </p>
                        </section>

                        <section className="terminos-seccion">
                            <h2>5. Uso Aceptable</h2>
                            <p>
                                Al utilizar la plataforma, te comprometes a:
                            </p>
                            <ul>
                                <li>No publicar contenido ofensivo, difamatorio o ilegal</li>
                                <li>No intentar acceder a areas restringidas del sistema</li>
                                <li>No utilizar la plataforma para actividades fraudulentas</li>
                                <li>Respetar los derechos de otros usuarios</li>
                                <li>Proporcionar informacion veridica en tu perfil y confirmaciones</li>
                            </ul>
                        </section>

                        <section className="terminos-seccion">
                            <h2>6. Eventos y Asistencia</h2>
                            <p>
                                La confirmacion de asistencia a un evento es un compromiso. Si no puedes
                                asistir, debes cancelar tu registro con anticipacion razonable. Los
                                organizadores se reservan el derecho de gestionar la capacidad de sus eventos.
                            </p>
                        </section>

                        <section className="terminos-seccion">
                            <h2>7. Propiedad Intelectual</h2>
                            <p>
                                Todo el contenido de la plataforma, incluyendo logos, disenos, textos y
                                codigo, es propiedad de Eventos Chile o sus licenciantes. No esta permitida
                                la reproduccion sin autorizacion expresa.
                            </p>
                        </section>

                        <section className="terminos-seccion">
                            <h2>8. Limitacion de Responsabilidad</h2>
                            <p>
                                Eventos Chile no se hace responsable por:
                            </p>
                            <ul>
                                <li>Cancelacion o modificacion de eventos por parte de organizadores</li>
                                <li>Danos derivados del uso de la plataforma</li>
                                <li>Contenido publicado por usuarios</li>
                                <li>Interrupciones temporales del servicio</li>
                            </ul>
                        </section>

                        <section className="terminos-seccion">
                            <h2>9. Modificaciones</h2>
                            <p>
                                Nos reservamos el derecho de modificar estos terminos en cualquier momento.
                                Las modificaciones entraran en vigor desde su publicacion en la plataforma.
                                Es tu responsabilidad revisar periodicamente estos terminos.
                            </p>
                        </section>

                        <section className="terminos-seccion">
                            <h2>10. Ley Aplicable</h2>
                            <p>
                                Estos terminos se rigen por las leyes de la Republica de Chile. Cualquier
                                disputa sera sometida a los tribunales competentes de Santiago de Chile.
                            </p>
                        </section>

                        <section className="terminos-seccion">
                            <h2>11. Contacto</h2>
                            <p>
                                Para consultas sobre estos terminos, puedes contactarnos a traves de
                                nuestra plataforma o al correo: soporte@eventoschile.cl
                            </p>
                        </section>

                        <div className="terminos-pie">
                            <p>
                                Al utilizar Eventos Chile, confirmas que has leido, comprendido y aceptado
                                estos Terminos y Condiciones.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default TerminosCondiciones;
