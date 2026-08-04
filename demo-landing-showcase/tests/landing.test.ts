import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
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

  it('tiene el favicon', () => {
    expect(html).toContain('favicon');
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
