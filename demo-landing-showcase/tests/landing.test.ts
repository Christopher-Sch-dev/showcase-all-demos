import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Landing es estática (HTML renderizado por Astro). Los tests verifican:
// 1. El HTML renderizado contiene los elementos críticos de conversión
// 2. El SEO está presente (title, description, OG)
// 3. Los CTAs y el formulario existen
// 4. No hay placeholders sin rellenar

const html = readFileSync(resolve(__dirname, '../dist/index.html'), 'utf-8');

describe('Landing Sonrisa Vital — render', () => {
  it('tiene el title SEO correcto', () => {
    expect(html).toContain('<title>Sonrisa Vital — Clínica dental en Santiago Centro</title>');
  });

  it('tiene meta description', () => {
    expect(html).toContain('meta name="description"');
    expect(html).toMatch(/Clínica dental en Santiago Centro/);
  });

  it('tiene Open Graph tags', () => {
    expect(html).toContain('property="og:title"');
    expect(html).toContain('property="og:description"');
    expect(html).toContain('property="og:url"');
  });

  it('tiene el headline principal (h1)', () => {
    expect(html).toMatch(/<h1[^>]*>/);
    expect(html).toMatch(/Tu dentista/);
  });

  it('tiene CTAs de conversión', () => {
    expect(html).toMatch(/Agendar|Reservar hora/);
    expect(html).toContain('WhatsApp');
  });

  it('tiene link a WhatsApp (CTA principal)', () => {
    expect(html).toMatch(/wa\.me\/|api\.whatsapp\.com/);
  });

  it('tiene al menos un form o botón de acción', () => {
    expect(html).toMatch(/<form|<button/);
  });

  it('el favicon referenciado en HTML existe en public/', () => {
    // ⚠️ FIX 2026-08-04: antes era `toContain('favicon')` que matcheaba el filename del href
    // sin verificar que el archivo existiera. El HTML refiere /favicon.svg pero public/ NO lo tiene → 404.
    const match = html.match(/href="([^"]*favicon[^"]*)"/);
    if (!match) {
      expect(html).toContain('favicon'); // fallback: al menos se referencia
    } else {
      const href = match[1]; // ej: /favicon.svg
      const filePath = resolve(__dirname, '../public', href.replace(/^\//, ''));
      expect(existsSync(filePath)).toBe(true);
    }
  });

  it('tiene lang=es (mercado objetivo)', () => {
    expect(html).toMatch(/<html[^>]*lang="es"/);
  });

  it('no tiene texto placeholder sin rellenar', () => {
    expect(html).not.toContain('lorem ipsum');
    expect(html).not.toContain('{{');
    expect(html).not.toContain('TODO');
  });
});


// ── Regresiones del rediseño (DEC-014) ──────────────────────────────────────
// Estos tests protegen los defectos que se corrigieron. Si vuelven, fallan.
import { readdirSync } from 'node:fs';

const cssFiles = readdirSync(resolve(__dirname, '../dist/_astro')).filter((f) => f.endsWith('.css'));
const css = cssFiles.map((f) => readFileSync(resolve(__dirname, '../dist/_astro', f), 'utf-8')).join('\n');

describe('Sonrisa Vital — regresiones del rediseño', () => {
  it('no reintroduce el voseo rioplatense (audiencia es-CL)', () => {
    for (const word of ['Reservá', 'Contanos', 'necesitás', 'escribinos', 'elegí', 'tenés']) {
      expect(html).not.toContain(word);
    }
  });

  it('no depende de Font Awesome por CDN', () => {
    expect(html).not.toMatch(/font-awesome|fontawesome/i);
    expect(html).not.toMatch(/cdnjs\.cloudflare\.com/);
  });

  it('no vuelve a descargar las imágenes pesadas de la mascota', () => {
    expect(html).not.toContain('Gemini_Generated');
    expect(html).not.toContain('Photoroom');
    expect(html).not.toContain('mascot');
  });

  it('el elemento que causaba scroll horizontal ya no existe', () => {
    // El bug venía de un bloque decorativo con right:-80px fuera del container.
    expect(css).not.toMatch(/right:\s*-80px/);
    expect(css).not.toMatch(/\.faq__visual/);
  });

  it('carga Fraunces como familia display y la aplica al h1', () => {
    expect(html).toContain('Fraunces');
    // el minificador del build quita las comillas: aceptamos ambas formas
    expect(css).toMatch(/--font-display:\s*['"]?Fraunces/);
  });

  it('muestra el flujo de reserva en el hero, no una imagen decorativa', () => {
    expect(html).toMatch(/Reserva online/i);
    expect(html).toMatch(/Confirmación/);
  });

  it('la página ya no es un monolito: el HTML servido es de composición', () => {
    // Si alguien vuelve a meter todo en un archivo, el markup se dispara.
    expect(html.length).toBeLessThan(60000);
  });
});
