import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

// Render test: verifica el OUTPUT estatico real de astro build.
// Ejecutar con: npm run build && vitest run --no-isolate  (el build genera dist/)
// Este test asume que dist/index.html existe (generado por astro build).
const HTML_PATH = new URL('../dist/index.html', import.meta.url);

let html: string;
let ok = false;

beforeAll(() => {
  if (existsSync(HTML_PATH)) {
    html = readFileSync(HTML_PATH, 'utf-8');
    ok = true;
  }
});

describe('render de index.astro (build estatico)', () => {
  it('el build existe (señal externa: dist/index.html generado por astro build)', () => {
    expect(ok, 'dist/index.html no existe — correr `npm run build` primero').toBe(true);
  });

  it('los hrefs de contacto se interpolaron (regresion 9aa2db8)', () => {
    expect(html).toContain('href="tel:+56 2 2345 6789"');
    expect(html).toContain('href="https://wa.me/56912345678"');
    expect(html).toContain('href="mailto:hola@sonrisavital.cl"');
  });

  it('NO queda ningun literal sin interpolar {BUSINESS.*}', () => {
    expect(html).not.toMatch(/\{BUSINESS\./);
  });

  it('expone el titulo de la clinica y el data-json del negocio', () => {
    expect(html).toContain('<title>Sonrisa Vital · Asistente virtual</title>');
    expect(html).toContain('id="business-data"');
  });
});
