import PropTypes from 'prop-types';
import '../styles/loading.css';

/**
 * Componente SkeletonCard para mostrar placeholder mientras cargan eventos.
 * Simula la estructura de una tarjeta de evento con animacion pulse.
 * 
 * Uso:
 *   <SkeletonCard />
 *   <SkeletonCard showFooter={false} />
 */
const SkeletonCard = ({ showFooter = true, showBadges = true }) => {
    return (
        <div className="skeleton-card">
            {/* Imagen placeholder */}
            <div className="skeleton-image skeleton"></div>

            {/* Contenido placeholder */}
            <div className="skeleton-content">
                {/* Titulo */}
                <div className="skeleton-title skeleton"></div>

                {/* Badges de categoria y tipo */}
                {showBadges && (
                    <div style={{ marginBottom: '0.75rem' }}>
                        <div className="skeleton-badge skeleton"></div>
                        <div className="skeleton-badge skeleton"></div>
                    </div>
                )}

                {/* Lineas de texto */}
                <div className="skeleton-text skeleton"></div>
                <div className="skeleton-text skeleton"></div>

                {/* Footer con precio y boton */}
                {showFooter && (
                    <div className="skeleton-footer">
                        <div className="skeleton-text skeleton" style={{ width: '80px', marginBottom: 0 }}></div>
                        <div className="skeleton-button skeleton"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

SkeletonCard.propTypes = {
    showFooter: PropTypes.bool,
    showBadges: PropTypes.bool
};

/**
 * Grid de SkeletonCards para mostrar multiples placeholders.
 * Util para listas de eventos en carga.
 * 
 * Uso:
 *   <SkeletonGrid count={6} />
 */
export const SkeletonGrid = ({ count = 6 }) => {
    return (
        <div className="skeleton-grid">
            {Array.from({ length: count }, (_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
};

SkeletonGrid.propTypes = {
    count: PropTypes.number
};

export default SkeletonCard;
