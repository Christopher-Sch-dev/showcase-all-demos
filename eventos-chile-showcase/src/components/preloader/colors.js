/**
 * Paleta de Colores para Preloader Generativo
 * Colores de marca de Eventos Chile adaptados para efectos visuales
 * 
 * Razón: Centralizar colores para mantener coherencia visual
 */

export const COLORS = {
    // Fondos
    space: '#050505',
    nebula: '#1a1a2e',

    // Marca principal
    primary: '#6C63FF',
    primaryDark: '#5a52d5',

    // Energía/Neón
    energy: '#00F0FF',
    energyDark: '#00b8c4',

    // Acentos
    accent: '#a855f7',
    magenta: '#d53f8c',

    // Texto
    white: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.6)'
};

/**
 * Genera un color HSL dinámico basado en el tiempo
 * Útil para efectos de hue-shift
 * 
 * @param {number} time - Tiempo actual (ms o frame count)
 * @param {number} baseHue - Hue base (0-360)
 * @param {number} saturation - Saturación (0-100)
 * @param {number} lightness - Luminosidad (0-100)
 * @param {number} alpha - Opacidad (0-1)
 * @returns {string} Color en formato hsla()
 */
export function dynamicHSL(time, baseHue = 260, saturation = 80, lightness = 60, alpha = 1) {
    const hueShift = Math.sin(time * 0.001) * 20;
    return `hsla(${baseHue + hueShift}, ${saturation}%, ${lightness}%, ${alpha})`;
}

/**
 * Genera un gradiente radial para el fondo
 * 
 * @param {CanvasRenderingContext2D} ctx - Contexto del canvas
 * @param {number} cx - Centro X
 * @param {number} cy - Centro Y
 * @param {number} radius - Radio del gradiente
 * @returns {CanvasGradient} Gradiente listo para usar
 */
export function createNebulaGradient(ctx, cx, cy, radius) {
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    gradient.addColorStop(0, 'rgba(108, 99, 255, 0.15)');
    gradient.addColorStop(0.5, 'rgba(26, 26, 46, 0.8)');
    gradient.addColorStop(1, COLORS.space);
    return gradient;
}

/**
 * Genera el color de una capa del mandala basado en el índice
 * 
 * @param {number} layerIndex - Índice de la capa (0, 1, 2...)
 * @param {number} alpha - Opacidad (0-1)
 * @returns {string} Color en formato rgba o hex
 */
export function getLayerColor(layerIndex, alpha = 1) {
    const layerColors = [
        COLORS.primary,
        COLORS.energy,
        COLORS.accent,
        COLORS.magenta
    ];

    const color = layerColors[layerIndex % layerColors.length];

    if (alpha < 1) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return color;
}

/**
 * Convierte hex a rgba
 * 
 * @param {string} hex - Color en formato #RRGGBB
 * @param {number} alpha - Opacidad (0-1)
 * @returns {string} Color en formato rgba()
 */
export function hexToRgba(hex, alpha = 1) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
