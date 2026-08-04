/**
 * Renderizador de Efectos Trippy Multidimensionales
 * Efectos que llenan TODA la pantalla, no solo el centro
 * 
 * Capas:
 * 1. Nebula de fondo con ondas
 * 2. Ondas expansivas desde el centro
 * 3. Líneas del infinito (túnel hiperespacial)
 * 4. Partículas que atraviesan la pantalla
 * 5. Geometría fractal que se expande
 * 6. Grid holográfico
 * 
 * Razón: Crear experiencia inmersiva de 5 segundos que "respire"
 */

import { polarToCart, simpleNoise, lerp, easeInOutCubic } from './math.js';
import { COLORS, hexToRgba } from './colors.js';

// Paleta de colores coherente con la página principal
const PALETTE = {
    cyan: '#00F0FF',
    magenta: '#FF00FF',
    purple: '#6C63FF',
    pink: '#d53f8c',
    white: '#ffffff',
    space: '#050505'
};

/**
 * Genera estrellas de fondo más densas
 */
export function generateStars(count, width, height) {
    const stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random(),
            twinkleSpeed: Math.random() * 0.003 + 0.001,
            color: Math.random() > 0.7 ? PALETTE.cyan : (Math.random() > 0.5 ? PALETTE.purple : PALETTE.white)
        });
    }
    return stars;
}

/**
 * Renderiza estrellas con colores de marca
 */
export function renderStarfield(ctx, stars, time) {
    stars.forEach(star => {
        const twinkle = 0.4 + 0.6 * Math.sin(time * star.twinkleSpeed + star.brightness * 10);
        const alpha = star.brightness * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(star.color, alpha);
        ctx.fill();
    });
}

/**
 * Renderiza fondo con nebulosa dinámica que "respira"
 */
export function renderBackground(ctx, width, height, time) {
    // Fondo base negro
    ctx.fillStyle = PALETTE.space;
    ctx.fillRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;
    const maxDim = Math.max(width, height);

    // Breathing del fondo
    const breathe = 0.8 + Math.sin(time * 0.001) * 0.2;

    // Nebulosa 1 - Púrpura central
    const gradient1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxDim * 0.6 * breathe);
    gradient1.addColorStop(0, 'rgba(108, 99, 255, 0.25)');
    gradient1.addColorStop(0.4, 'rgba(108, 99, 255, 0.1)');
    gradient1.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, width, height);

    // Nebulosa 2 - Cyan desplazada
    const offsetX = Math.sin(time * 0.0005) * 100;
    const offsetY = Math.cos(time * 0.0007) * 100;
    const gradient2 = ctx.createRadialGradient(cx + offsetX, cy + offsetY, 0, cx + offsetX, cy + offsetY, maxDim * 0.4);
    gradient2.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
    gradient2.addColorStop(0.5, 'rgba(0, 240, 255, 0.05)');
    gradient2.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient2;
    ctx.fillRect(0, 0, width, height);

    // Nebulosa 3 - Magenta en otra posición
    const gradient3 = ctx.createRadialGradient(cx - offsetX, cy - offsetY, 0, cx - offsetX, cy - offsetY, maxDim * 0.35);
    gradient3.addColorStop(0, 'rgba(255, 0, 255, 0.1)');
    gradient3.addColorStop(0.5, 'rgba(255, 0, 255, 0.03)');
    gradient3.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient3;
    ctx.fillRect(0, 0, width, height);
}

/**
 * Genera ondas expansivas
 */
export function generateWaves(count) {
    const waves = [];
    for (let i = 0; i < count; i++) {
        waves.push({
            phase: (i / count) * Math.PI * 2,
            speed: 0.0004 + Math.random() * 0.0006, // 2x más rápido
            maxRadius: 0.9 + Math.random() * 0.3,
            thickness: 2 + Math.random() * 3,
            colorIndex: i % 3
        });
    }
    return waves;
}

/**
 * Renderiza ondas que se expanden desde el centro
 */
export function renderExpandingWaves(ctx, waves, cx, cy, time, maxRadius) {
    const colors = [PALETTE.cyan, PALETTE.purple, PALETTE.magenta];

    waves.forEach(wave => {
        const progress = ((time * wave.speed + wave.phase) % 1);
        const radius = progress * maxRadius * wave.maxRadius;
        const alpha = (1 - progress) * 0.8; // Más opaco

        if (alpha > 0.05) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = hexToRgba(colors[wave.colorIndex], alpha);
            ctx.lineWidth = wave.thickness * (1 - progress * 0.5);
            ctx.stroke();
        }
    });
}

/**
 * Genera líneas del túnel hiperespacial
 */
export function generateTunnelLines(count) {
    const lines = [];
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        lines.push({
            angle,
            speed: 0.5 + Math.random() * 1,
            length: 0.3 + Math.random() * 0.4,
            offset: Math.random(),
            colorIndex: i % 4
        });
    }
    return lines;
}

/**
 * Renderiza túnel hiperespacial - líneas que van desde el centro hacia afuera
 */
export function renderHyperspaceTunnel(ctx, lines, cx, cy, time, maxRadius, progress) {
    if (progress < 10) return;

    const intensity = easeInOutCubic(Math.min((progress - 10) / 40, 1));
    const colors = [PALETTE.cyan, PALETTE.purple, PALETTE.magenta, PALETTE.pink];

    lines.forEach(line => {
        const currentOffset = (line.offset + time * 0.0005 * line.speed) % 1;
        const startRadius = currentOffset * maxRadius * 0.3;
        const endRadius = startRadius + maxRadius * line.length * intensity;

        const alpha = (1 - currentOffset) * 0.5 * intensity;

        if (alpha > 0.02 && endRadius > startRadius) {
            const startPoint = polarToCart(startRadius, line.angle);
            const endPoint = polarToCart(endRadius, line.angle);

            ctx.beginPath();
            ctx.moveTo(cx + startPoint.x, cy + startPoint.y);
            ctx.lineTo(cx + endPoint.x, cy + endPoint.y);
            ctx.strokeStyle = hexToRgba(colors[line.colorIndex], alpha);
            ctx.lineWidth = 1.5 * intensity;
            ctx.stroke();
        }
    });
}

/**
 * Genera partículas que atraviesan la pantalla
 */
export function generateFlowParticles(count, width, height) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            life: Math.random(),
            colorIndex: Math.floor(Math.random() * 3)
        });
    }
    return particles;
}

/**
 * Renderiza partículas fluyendo por toda la pantalla
 */
export function renderFlowParticles(ctx, particles, cx, cy, width, height, time, progress) {
    if (progress < 20) return;

    const intensity = easeInOutCubic(Math.min((progress - 20) / 30, 1));
    const colors = [PALETTE.cyan, PALETTE.purple, PALETTE.white];

    particles.forEach(particle => {
        // Movimiento hacia el centro con espiral
        const dx = cx - particle.x;
        const dy = cy - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Fuerza hacia el centro con rotación
        const angle = Math.atan2(dy, dx) + Math.PI / 4;
        const force = 0.0001 * dist;
        particle.vx += Math.cos(angle) * force;
        particle.vy += Math.sin(angle) * force;

        // Aplicar velocidad
        particle.x += particle.vx * 0.5;
        particle.y += particle.vy * 0.5;

        // Wrap around
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Dibujar con trail
        const alpha = 0.6 * intensity * (0.5 + Math.sin(time * 0.002 + particle.life * 10) * 0.5);
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * intensity, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(colors[particle.colorIndex], alpha);
        ctx.fill();
    });
}

/**
 * Renderiza grid holográfico que cubre toda la pantalla
 */
export function renderHolographicGrid(ctx, width, height, time, progress) {
    if (progress < 30) return;

    const intensity = easeInOutCubic(Math.min((progress - 30) / 40, 1)) * 0.15;
    const gridSize = 50;
    const offset = (time * 0.02) % gridSize;

    ctx.strokeStyle = hexToRgba(PALETTE.purple, intensity);
    ctx.lineWidth = 0.5;

    // Líneas verticales
    for (let x = offset; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }

    // Líneas horizontales
    for (let y = offset; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

/**
 * Renderiza geometría fractal central que se expande
 */
export function renderFractalGeometry(ctx, cx, cy, time, progress, scale) {
    const layers = 5;
    const baseRadius = 80 * scale;

    for (let layer = 0; layer < layers; layer++) {
        const layerProgress = (progress / 100) * (1 - layer * 0.15);
        if (layerProgress <= 0) continue;

        const radius = baseRadius * (layer + 1) * 0.6 * easeInOutCubic(Math.min(layerProgress, 1));
        const segments = 6 + layer * 2;
        const rotation = time * (0.0003 * (layer % 2 === 0 ? 1 : -1)) + layer * Math.PI / 6;

        // Breathing por capa
        const breathe = 1 + Math.sin(time * 0.002 + layer * 0.5) * 0.1;
        const finalRadius = radius * breathe;

        // Hue shift por capa
        const hue = (260 + time * 0.03 + layer * 30) % 360;
        const alpha = 0.7 - layer * 0.1;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rotation);

        // Dibujar polígono
        ctx.beginPath();
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const wave = Math.sin(angle * 3 + time * 0.003) * 10;
            const point = polarToCart(finalRadius + wave, angle);
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.closePath();
        ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 2 - layer * 0.2;
        ctx.stroke();

        // Conectar vértices al centro
        if (layer < 3) {
            for (let i = 0; i < segments; i++) {
                const angle = (i / segments) * Math.PI * 2;
                const point = polarToCart(finalRadius, angle);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(point.x * 0.3, point.y * 0.3);
                ctx.strokeStyle = `hsla(${hue + 60}, 70%, 50%, ${alpha * 0.3})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    // Núcleo central brillante
    const coreSize = 20 + Math.sin(time * 0.004) * 8;
    const coreHue = (280 + time * 0.1) % 360;

    const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreSize * 2);
    coreGradient.addColorStop(0, '#ffffff');
    coreGradient.addColorStop(0.3, `hsla(${coreHue}, 80%, 60%, 0.8)`);
    coreGradient.addColorStop(0.7, `hsla(${coreHue + 40}, 70%, 50%, 0.3)`);
    coreGradient.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(cx, cy, coreSize * 2, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();
}

/**
 * Renderiza HUD de progreso con estilo holográfico
 */
export function renderProgressHUD(ctx, cx, cy, progress, time) {
    const radius = 160;
    const progressAngle = (progress / 100) * Math.PI * 2 - Math.PI / 2;

    // Arco de fondo
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(108, 99, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Arco de progreso con gradiente
    if (progress > 0) {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, -Math.PI / 2, progressAngle);
        const hue = (260 + time * 0.05) % 360;
        ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Punto brillante al final del arco
        const endPoint = polarToCart(radius, progressAngle + Math.PI / 2);
        ctx.beginPath();
        ctx.arc(cx + endPoint.x, cy + endPoint.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = PALETTE.white;
        ctx.fill();
    }

    // Porcentaje
    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = PALETTE.white;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.floor(progress)}%`, cx, cy + radius + 40);
}

/**
 * Genera partículas orbitales
 */
export function generateOrbitalParticles(count, minRadius, maxRadius) {
    const particles = [];
    for (let i = 0; i < count; i++) {
        const orbitRadius = lerp(minRadius, maxRadius, Math.random());
        particles.push({
            angle: Math.random() * Math.PI * 2,
            orbitRadius,
            speed: (0.0008 + Math.random() * 0.002) * (Math.random() > 0.5 ? 1 : -1),
            size: Math.random() * 3 + 1,
            colorIndex: Math.floor(Math.random() * 3)
        });
    }
    return particles;
}

/**
 * Renderiza partículas orbitales alrededor del centro
 */
export function renderOrbitalParticles(ctx, particles, cx, cy, time, progress, scale) {
    if (progress < 15) return;

    const intensity = easeInOutCubic(Math.min((progress - 15) / 25, 1));
    const colors = [PALETTE.cyan, PALETTE.purple, PALETTE.magenta];

    particles.forEach(particle => {
        particle.angle += particle.speed;

        const { x, y } = polarToCart(particle.orbitRadius * scale, particle.angle);
        const alpha = 0.7 * intensity * (0.6 + Math.sin(time * 0.003 + particle.angle) * 0.4);

        ctx.beginPath();
        ctx.arc(cx + x, cy + y, particle.size * intensity, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(colors[particle.colorIndex], alpha);
        ctx.fill();

        // Trail
        for (let i = 1; i < 4; i++) {
            const trailAngle = particle.angle - particle.speed * i * 3;
            const trailPoint = polarToCart(particle.orbitRadius * scale, trailAngle);
            ctx.beginPath();
            ctx.arc(cx + trailPoint.x, cy + trailPoint.y, particle.size * 0.5 * intensity, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(colors[particle.colorIndex], alpha * (1 - i * 0.25));
            ctx.fill();
        }
    });
}
