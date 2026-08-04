/**
 * Efectos Glitch y Breakcore para Canvas 2D
 * Screen tearing, RGB split, noise, VHS lines, texto animado
 * 
 * Razón: Efectos de post-procesamiento para intensificar el preloader
 */

/**
 * Efecto de Screen Tearing - Cortes horizontales desplazados
 */
export function renderScreenTear(ctx, sourceCanvas, time, intensity = 0.3) {
    const height = sourceCanvas.height;
    const width = sourceCanvas.width;
    const sliceCount = 10 + Math.floor(Math.sin(time * 0.005) * 5);
    const sliceHeight = height / sliceCount;

    for (let i = 0; i < sliceCount; i++) {
        const y = i * sliceHeight;
        const offset = Math.sin(time * 0.01 + i * 0.5) * intensity * 30;
        const glitchChance = Math.random();

        // Añadir glitch aleatorio más intenso
        const extraOffset = glitchChance < 0.1 ? (Math.random() - 0.5) * 100 : 0;

        ctx.drawImage(
            sourceCanvas,
            0, y, width, sliceHeight,
            offset + extraOffset, y, width, sliceHeight
        );
    }
}

/**
 * Efecto RGB Split / Chromatic Aberration
 */
export function renderRGBSplit(ctx, sourceCanvas, time, intensity = 1) {
    const offset = Math.sin(time * 0.008) * 6 * intensity;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Canal Rojo
    ctx.globalAlpha = 0.8;
    ctx.filter = 'saturate(0) brightness(1.2)';
    ctx.drawImage(sourceCanvas, offset, 0);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Canal Cyan (opuesto al rojo)
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.6;
    ctx.filter = 'saturate(0) brightness(1.2)';
    ctx.drawImage(sourceCanvas, -offset * 0.7, offset * 0.3);
    ctx.filter = 'none';
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.restore();
}

/**
 * Efecto de ruido estático
 */
export function renderStaticNoise(ctx, width, height, intensity = 0.05, time = 0) {
    // Solo renderizar en frames aleatorios para efecto de burst
    if (Math.random() > 0.15) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        if (Math.random() < intensity) {
            const noise = Math.random() * 255;
            data[i] = noise;     // R
            data[i + 1] = noise; // G
            data[i + 2] = noise; // B
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

/**
 * Líneas VHS / Scanlines animadas
 */
export function renderVHSLines(ctx, width, height, time) {
    ctx.save();

    // Scanlines horizontales
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.lineWidth = 1;

    const offset = (time * 0.5) % 4;
    for (let y = offset; y < height; y += 4) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Línea de tracking VHS que sube
    const trackingY = (time * 0.2) % height;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, trackingY, width, 3);
    ctx.fillRect(0, trackingY - 50, width, 1);
    ctx.fillRect(0, trackingY + 50, width, 1);

    ctx.restore();
}

/**
 * Efecto de fractura dimensional - geometría que se rompe
 */
export function renderDimensionFracture(ctx, cx, cy, time, progress) {
    if (progress < 40) return;

    const intensity = Math.min((progress - 40) / 40, 1);
    const fractureCount = 6;
    const maxRadius = Math.max(ctx.canvas.width, ctx.canvas.height) * 0.8;

    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < fractureCount; i++) {
        const angle = (i / fractureCount) * Math.PI * 2 + time * 0.001;
        const wobble = Math.sin(time * 0.003 + i) * 20;

        ctx.save();
        ctx.rotate(angle);

        // Línea de fractura
        ctx.beginPath();
        ctx.moveTo(0, 0);

        const segments = 8;
        for (let j = 1; j <= segments; j++) {
            const dist = (j / segments) * maxRadius * intensity;
            const sideWobble = Math.sin(time * 0.005 + j) * 15;
            ctx.lineTo(dist, sideWobble + wobble * (j / segments));
        }

        ctx.strokeStyle = `hsla(${260 + i * 20}, 80%, 60%, ${0.4 * intensity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Efecto de "fragmento" triangular
        if (Math.random() < 0.05 && intensity > 0.5) {
            ctx.beginPath();
            ctx.moveTo(50, 0);
            ctx.lineTo(80 + Math.random() * 40, -20);
            ctx.lineTo(80 + Math.random() * 40, 20);
            ctx.closePath();
            ctx.fillStyle = `hsla(${180 + Math.random() * 60}, 70%, 50%, 0.2)`;
            ctx.fill();
        }

        ctx.restore();
    }

    ctx.restore();
}

/**
 * TEXTO SERPIENTE CUÁNTICA - Letras que se mueven como onda por la pantalla
 * Colores del sistema: #6C63FF (primario)
 */
export function renderQuantumSnakeText(ctx, text, width, height, time, progress) {
    const letters = text.split('');
    const letterCount = letters.length;
    const cx = width / 2;
    const cy = height / 2;

    const fontSize = Math.min(width, height) * 0.08;
    ctx.save();
    ctx.font = `bold ${fontSize}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    letters.forEach((letter, i) => {
        // Movimiento serpiente suave
        const wavePhase = time * 0.002 + i * 0.25;
        const snakeX = Math.sin(wavePhase) * 50;
        const snakeY = Math.cos(wavePhase * 0.7) * 25;

        const baseX = cx + (i - letterCount / 2) * fontSize * 0.7;
        const baseY = cy + snakeY;

        const x = baseX + snakeX;
        const y = baseY + Math.sin(time * 0.002 + i * 0.4) * 15;

        const rotation = Math.sin(wavePhase) * 0.15;
        const scale = 0.9 + Math.sin(time * 0.004 + i * 0.3) * 0.2;
        const alpha = 0.9 + Math.sin(time * 0.003 + i) * 0.1;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // Sombra con color primario
        ctx.shadowColor = '#6C63FF';
        ctx.shadowBlur = 20;

        // Letra principal - Color primario del sistema
        ctx.fillStyle = `rgba(108, 99, 255, ${alpha})`;
        ctx.fillText(letter, 0, 0);

        // Contorno sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeText(letter, 0, 0);

        ctx.restore();
    });

    ctx.restore();
}

/**
 * TEXTO SERPIENTE SECUNDARIO - Segunda línea que se mueve en dirección opuesta
 */
export function renderSecondarySnakeText(ctx, text, width, height, time, progress) {
    const letters = text.split('');
    const letterCount = letters.length;
    const cx = width / 2;
    const cy = height / 2 + height * 0.15;

    const fontSize = Math.min(width, height) * 0.05;
    ctx.save();
    ctx.font = `bold ${fontSize}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    letters.forEach((letter, i) => {
        // Movimiento serpiente inverso
        const wavePhase = -time * 0.004 + i * 0.25;
        const snakeX = Math.sin(wavePhase) * 60;
        const snakeY = Math.cos(wavePhase * 0.8) * 25;

        const baseX = cx + (i - letterCount / 2) * fontSize * 0.65;
        const baseY = cy + snakeY;

        const x = baseX + snakeX;
        const y = baseY + Math.sin(time * 0.003 + i * 0.6) * 15;

        const rotation = Math.cos(wavePhase) * 0.25;
        const scale = 0.7 + Math.sin(time * 0.006 + i * 0.5) * 0.3;
        const alpha = 0.7 + Math.sin(time * 0.004 + i) * 0.2;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        ctx.shadowColor = '#6C63FF';
        ctx.shadowBlur = 12;
        ctx.fillStyle = `rgba(108, 99, 255, ${alpha})`;
        ctx.fillText(letter, 0, 0);

        ctx.restore();
    });

    ctx.restore();
}

/**
 * TEXTO ORBITAL - Letras orbitando el centro como electrones
 */
export function renderOrbitalText(ctx, text, width, height, time, progress) {
    if (progress < 15) return;

    const intensity = Math.min((progress - 15) / 40, 1);
    const letters = text.split('');
    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.35;

    const fontSize = Math.min(width, height) * 0.04;
    ctx.save();
    ctx.font = `bold ${fontSize}px "Share Tech Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    letters.forEach((letter, i) => {
        // Órbita elíptica
        const orbitSpeed = 0.001 + (i % 3) * 0.0003;
        const angle = time * orbitSpeed + (i / letters.length) * Math.PI * 2;
        const orbitA = baseRadius * (0.8 + (i % 3) * 0.15);
        const orbitB = baseRadius * (0.4 + (i % 4) * 0.1);

        const x = cx + Math.cos(angle) * orbitA;
        const y = cy + Math.sin(angle) * orbitB;

        // Efecto de profundidad: más lejos = más pequeño y transparente
        const depth = (Math.sin(angle) + 1) / 2;
        const scale = 0.5 + depth * 0.8;
        const alpha = 0.3 + depth * 0.7;

        const hue = (247 + i * 30 + time * 0.05) % 360; // Primario #6C63FF

        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale * intensity, scale * intensity);

        ctx.shadowColor = `hsla(${hue}, 80%, 50%, 0.9)`;
        ctx.shadowBlur = 20;
        ctx.fillStyle = `hsla(${hue}, 85%, 60%, ${alpha * intensity})`;
        ctx.fillText(letter, 0, 0);

        ctx.restore();
    });

    ctx.restore();
}

/**
 * Efecto de "portal" distorsionador
 */
export function renderPortalDistortion(ctx, cx, cy, time, progress) {
    const rings = 8;
    const maxRadius = Math.min(ctx.canvas.width, ctx.canvas.height) * 0.4;

    ctx.save();
    ctx.translate(cx, cy);

    for (let i = 0; i < rings; i++) {
        const ringProgress = ((time * 0.001 + i * 0.2) % 1);
        const radius = ringProgress * maxRadius;
        const alpha = (1 - ringProgress) * 0.4;

        ctx.beginPath();

        // Distorsión del círculo
        const segments = 60;
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            const wobble = Math.sin(angle * 6 + time * 0.005) * 10 * ringProgress;
            const r = radius + wobble;
            const x = Math.cos(angle) * r;
            const y = Math.sin(angle) * r;

            if (j === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.closePath();
        ctx.strokeStyle = `hsla(${280 + i * 10}, 80%, 60%, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.restore();
}

/**
 * Efecto de "glitch frame" - duplicación offset con colores
 */
export function renderGlitchFrame(ctx, time) {
    // Solo activar esporádicamente
    if (Math.random() > 0.08) return;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Copiar una franja y desplazarla
    const sliceY = Math.random() * height;
    const sliceHeight = 20 + Math.random() * 80;
    const offset = (Math.random() - 0.5) * 50;

    try {
        const imageData = ctx.getImageData(0, sliceY, width, sliceHeight);
        ctx.putImageData(imageData, offset, sliceY);
    } catch (e) {
        // Si falla getImageData, simplemente saltar
    }
}

/**
 * Flash de energía intenso
 */
export function renderEnergyFlash(ctx, cx, cy, time, trigger) {
    if (!trigger) return;

    const flashIntensity = Math.sin(time * 0.05) * 0.5 + 0.5;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, ctx.canvas.width * 0.6);

    gradient.addColorStop(0, `rgba(108, 99, 255, ${flashIntensity * 0.3})`);
    gradient.addColorStop(0.3, `rgba(0, 240, 255, ${flashIntensity * 0.2})`);
    gradient.addColorStop(0.6, `rgba(255, 0, 255, ${flashIntensity * 0.1})`);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}
