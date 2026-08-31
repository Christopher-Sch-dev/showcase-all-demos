// Humo: verifica que el runner Vitest + jsdom + jest-dom están configurados.
// Vive en tests/ (NO en src/lib, que aún no existe en el scaffold).
import { describe, it, expect } from 'vitest';

describe('scaffold vitest', () => {
  it('runner vitest + jsdom + jest-dom configurados', () => {
    const el = document.createElement('button');
    el.textContent = 'Leer';
    expect(el).toHaveTextContent('Leer');
    expect(window !== undefined).toBe(true);
  });
});
