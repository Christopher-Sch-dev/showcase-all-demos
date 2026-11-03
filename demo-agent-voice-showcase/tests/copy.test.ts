import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildShowcase } from '../src/lib/showcase';

// Regresión de copy: la audiencia es Santiago de Chile. El voseo rioplatense
// apareció en producción ("Queres reservar?", "Dale! Decime") y no debe volver.
// Solo formas inequívocamente voseo. "sabes" y "puedes" son tuteo correcto:
// el voseo lleva tilde en la final (sabés, podés, tenés, querés).
const VOSEO = /\b(querés|queres|podés|podes|tenés|tenes|sabés|necesitás|reservá|escribinos|contanos|elegí|dejá|decime|acordate|fijate)\b/i;

const files = [
  'src/lib/showcase.ts',
  'src/client/prompt.ts',
  'src/client/app.ts',
  'src/pages/index.astro',
];

describe('copy en español chileno neutro', () => {
  for (const file of files) {
    it(`${file} no tiene voseo rioplatense`, () => {
      const src = readFileSync(new URL('../' + file, import.meta.url), 'utf-8');
      const match = src.match(VOSEO);
      expect(match?.[0] ?? null, `voseo encontrado: ${match?.[0]}`).toBe(null);
    });
  }

  it('las respuestas del showcase usan tildes correctas', () => {
    const business = {
      whatsapp: '+56 9 1234 5678',
      ubicacion: 'Av. Libertador 1234',
      estacionamiento: 'Sí, gratuito',
      horarios: 'Lun a vie',
      medios_pago: 'Efectivo',
      promo: '20% off',
      equipo: [{ nombre: 'Dra. Carolina Pérez', rol: 'Directora' }],
    };
    const { items } = buildShowcase(business);
    const joined = items.map(i => i.q + ' ' + i.a).join(' ');
    expect(joined).toContain('¿Cuánto');
    expect(joined).toContain('Sí,');
    expect(joined).toContain('odontólogos');
    expect(joined).not.toMatch(/\bSi,\b/); // "Si" sin tilde como afirmación
  });

  it('el matching ignora tildes en ambos sentidos', () => {
    const business = {
      whatsapp: '+56 9 1234 5678',
      ubicacion: 'Av. Libertador 1234',
      estacionamiento: 'Sí',
      horarios: 'Lun a vie',
      medios_pago: 'Efectivo',
      promo: '20% off',
      equipo: [{ nombre: 'Dra. Carolina Pérez', rol: 'Directora' }],
    };
    const { pickShowcase } = buildShowcase(business);
    // con tilde en la pregunta del usuario, sin tilde en el item (y viceversa)
    expect(pickShowcase('cuanto cuesta la limpieza')).toContain('$25.000');
    expect(pickShowcase('¿Cuánto cuesta la limpieza?')).toContain('$25.000');
    expect(pickShowcase('como llego?')).toContain('Av. Libertador');
  });
});
