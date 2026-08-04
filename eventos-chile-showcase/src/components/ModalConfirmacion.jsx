import PropTypes from 'prop-types';
import '../styles/modalConfirmacion.css';

/**
 * Modal de confirmacion profesional que reemplaza window.confirm y window.prompt.
 * Soporta:
 *   - Confirmacion simple (si/no)
 *   - Confirmacion con input de texto (para razones, etc.)
 * 
 * Uso:
 *   <ModalConfirmacion
 *     visible={true}
 *     titulo="Eliminar Evento"
 *     mensaje="Esta accion es irreversible."
 *     tipo="confirmacion"  // o "input"
 *     inputPlaceholder="Escribe la razon..."
 *     inputMinLength={50}
 *     textoConfirmar="Confirmar"
 *     textoCancelar="Cancelar"
 *     variante="danger"  // "danger", "warning", "info"
 *     onConfirm={(inputValue) => {}}
 *     onCancel={() => {}}
 *   />
 */
const ModalConfirmacion = ({
    visible,
    titulo,
    mensaje,
    tipo = 'confirmacion', // 'confirmacion' | 'input'
    inputPlaceholder = '',
    inputMinLength = 0,
    inputValue = '',
    onInputChange,
    textoConfirmar = 'Confirmar',
    textoCancelar = 'Cancelar',
    variante = 'warning', // 'danger' | 'warning' | 'info'
    onConfirm,
    onCancel,
    procesando = false
}) => {
    if (!visible) return null;

    const handleConfirm = () => {
        if (tipo === 'input' && inputMinLength > 0) {
            if (!inputValue || inputValue.trim().length < inputMinLength) {
                return; // No permitir si no cumple minimo
            }
        }
        onConfirm(inputValue);
    };

    const inputValido = tipo !== 'input' || !inputMinLength || (inputValue && inputValue.trim().length >= inputMinLength);

    return (
        <div className="modal-confirmacion-overlay" onClick={onCancel}>
            <div className={`modal-confirmacion-content modal-${variante}`} onClick={e => e.stopPropagation()}>
                <div className="modal-confirmacion-header">
                    <h3>{titulo}</h3>
                </div>
                <div className="modal-confirmacion-body">
                    {mensaje && <p className="modal-mensaje">{mensaje}</p>}

                    {tipo === 'input' && (
                        <div className="modal-input-container">
                            <textarea
                                className="modal-input"
                                placeholder={inputPlaceholder}
                                value={inputValue}
                                onChange={(e) => onInputChange && onInputChange(e.target.value)}
                                rows={4}
                                maxLength={1000}
                            />
                            {inputMinLength > 0 && (
                                <span className={`char-count ${inputValido ? 'valid' : 'invalid'}`}>
                                    {inputValue?.trim().length || 0} / {inputMinLength} min
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="modal-confirmacion-actions">
                    <button
                        className="btn-modal-cancelar"
                        onClick={onCancel}
                        disabled={procesando}
                    >
                        {textoCancelar}
                    </button>
                    <button
                        className={`btn-modal-confirmar btn-${variante}`}
                        onClick={handleConfirm}
                        disabled={procesando || !inputValido}
                    >
                        {procesando ? 'Procesando...' : textoConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
};

ModalConfirmacion.propTypes = {
    visible: PropTypes.bool.isRequired,
    titulo: PropTypes.string.isRequired,
    mensaje: PropTypes.string,
    tipo: PropTypes.oneOf(['confirmacion', 'input']),
    inputPlaceholder: PropTypes.string,
    inputMinLength: PropTypes.number,
    inputValue: PropTypes.string,
    onInputChange: PropTypes.func,
    textoConfirmar: PropTypes.string,
    textoCancelar: PropTypes.string,
    variante: PropTypes.oneOf(['danger', 'warning', 'info']),
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    procesando: PropTypes.bool
};

export default ModalConfirmacion;
