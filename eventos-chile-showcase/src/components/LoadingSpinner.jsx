import PropTypes from 'prop-types';
import '../styles/loading.css';

/**
 * Componente LoadingSpinner reutilizable.
 * Muestra un spinner de carga con mensaje opcional.
 * 
 * Uso:
 *   <LoadingSpinner />
 *   <LoadingSpinner fullscreen />
 *   <LoadingSpinner message="Cargando eventos..." size="lg" />
 */
const LoadingSpinner = ({ 
    fullscreen = false, 
    message = 'Cargando...', 
    size = 'md',
    showMessage = true 
}) => {
    const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';

    return (
        <div className={`loading-spinner ${fullscreen ? 'fullscreen' : ''}`}>
            <div className={`spinner ${sizeClass}`} aria-hidden="true"></div>
            {showMessage && <p className="loading-text">{message}</p>}
        </div>
    );
};

LoadingSpinner.propTypes = {
    fullscreen: PropTypes.bool,
    message: PropTypes.string,
    size: PropTypes.oneOf(['sm', 'md', 'lg']),
    showMessage: PropTypes.bool
};

export default LoadingSpinner;
