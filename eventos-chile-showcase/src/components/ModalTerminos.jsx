// Modal de Terminos y Condiciones obligatorio para registro
// El usuario debe hacer scroll hasta el final para poder aceptar

import React, { useEffect, useRef, useState } from 'react';
import '../styles/modal-terminos.css';

const ModalTerminos = ({ onAceptar, onCancelar }) => {
    const [puedeAceptar, setPuedeAceptar] = useState(false);
    const contenidoRef = useRef(null);

    // Detectar cuando el usuario llega al final del scroll
    const handleScroll = () => {
        const elemento = contenidoRef.current;
        if (!elemento) return;

        // Calcular si llego al final (con margen de 10px)
        const llegaAlFinal = elemento.scrollHeight - elemento.scrollTop <= elemento.clientHeight + 10;

        if (llegaAlFinal && !puedeAceptar) {
            setPuedeAceptar(true);
        }
    };

    // Agregar listener de scroll
    useEffect(() => {
        const elemento = contenidoRef.current;
        if (elemento) {
            elemento.addEventListener('scroll', handleScroll);
            // Verificar estado inicial por si el contenido es corto
            handleScroll();
        }
        return () => {
            if (elemento) {
                elemento.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div className="modal-terminos-overlay">
            <div className="modal-terminos-container">
                <div className="modal-terminos-header">
                    <h2>Terminos y Condiciones</h2>
                    <p className="modal-terminos-subtitulo">
                        Por favor, lee los terminos hasta el final para continuar
                    </p>
                </div>

                <div
                    className="modal-terminos-contenido"
                    ref={contenidoRef}
                >
                    <section>
                        <h3>1. Aceptacion de los Terminos</h3>
                        <p>
                            Al registrarte y utilizar la plataforma Eventos Chile, aceptas estos terminos y
                            condiciones en su totalidad. Si no estas de acuerdo con alguna parte de estos
                            terminos, no debes utilizar nuestros servicios.
                        </p>
                    </section>

                    <section>
                        <h3>2. Descripcion del Servicio</h3>
                        <p>Eventos Chile es una plataforma que permite a los usuarios:</p>
                        <ul>
                            <li>Descubrir y buscar eventos en Chile</li>
                            <li>Confirmar asistencia a eventos publicos</li>
                            <li>Crear y gestionar eventos (usuarios administradores)</li>
                            <li>Interactuar con un asistente virtual para consultas</li>
                        </ul>
                    </section>

                    <section>
                        <h3>3. Registro de Usuario</h3>
                        <p>
                            Para acceder a ciertas funcionalidades, deberas crear una cuenta proporcionando
                            informacion veraz y completa. Eres responsable de mantener la confidencialidad
                            de tu contrasena y de todas las actividades que ocurran bajo tu cuenta.
                        </p>
                    </section>

                    <section>
                        <h3>4. Proteccion de Datos Personales</h3>
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

                    <section>
                        <h3>5. Uso Aceptable</h3>
                        <p>Al utilizar la plataforma, te comprometes a:</p>
                        <ul>
                            <li>No publicar contenido ofensivo, difamatorio o ilegal</li>
                            <li>No intentar acceder a areas restringidas del sistema</li>
                            <li>No utilizar la plataforma para actividades fraudulentas</li>
                            <li>Respetar los derechos de otros usuarios</li>
                            <li>Proporcionar informacion veridica en tu perfil y confirmaciones</li>
                        </ul>
                    </section>

                    <section>
                        <h3>6. Eventos y Asistencia</h3>
                        <p>
                            La confirmacion de asistencia a un evento es un compromiso. Si no puedes
                            asistir, debes cancelar tu registro con anticipacion razonable. Los
                            organizadores se reservan el derecho de gestionar la capacidad de sus eventos.
                        </p>
                    </section>

                    <section>
                        <h3>7. Propiedad Intelectual</h3>
                        <p>
                            Todo el contenido de la plataforma, incluyendo logos, disenos, textos y
                            codigo, es propiedad de Eventos Chile o sus licenciantes. No esta permitida
                            la reproduccion sin autorizacion expresa.
                        </p>
                    </section>

                    <section>
                        <h3>8. Limitacion de Responsabilidad</h3>
                        <p>Eventos Chile no se hace responsable por:</p>
                        <ul>
                            <li>Cancelacion o modificacion de eventos por parte de organizadores</li>
                            <li>Danos derivados del uso de la plataforma</li>
                            <li>Contenido publicado por usuarios</li>
                            <li>Interrupciones temporales del servicio</li>
                        </ul>
                    </section>

                    <section>
                        <h3>9. Modificaciones</h3>
                        <p>
                            Nos reservamos el derecho de modificar estos terminos en cualquier momento.
                            Las modificaciones entraran en vigor desde su publicacion en la plataforma.
                            Es tu responsabilidad revisar periodicamente estos terminos.
                        </p>
                    </section>

                    <section>
                        <h3>10. Ley Aplicable</h3>
                        <p>
                            Estos terminos se rigen por las leyes de la Republica de Chile. Cualquier
                            disputa sera sometida a los tribunales competentes de Santiago de Chile.
                        </p>
                    </section>

                    <div className="modal-terminos-final">
                        <p>
                            Al hacer clic en "Aceptar", confirmas que has leido, comprendido y
                            aceptado estos Terminos y Condiciones.
                        </p>
                    </div>
                </div>

                <div className="modal-terminos-footer">
                    {!puedeAceptar && (
                        <p className="modal-terminos-aviso">
                            Desplazate hasta el final para poder aceptar
                        </p>
                    )}
                    <div className="modal-terminos-botones">
                        <button
                            type="button"
                            className="btn-cancelar-terminos"
                            onClick={onCancelar}
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            className="btn-aceptar-terminos"
                            disabled={!puedeAceptar}
                            onClick={onAceptar}
                        >
                            {puedeAceptar ? 'Aceptar Terminos' : 'Lee hasta el final'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalTerminos;
