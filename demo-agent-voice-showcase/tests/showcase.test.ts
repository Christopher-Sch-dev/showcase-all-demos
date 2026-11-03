import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildShowcase } from '../src/lib/showcase';

const business = {
  whatsapp: '+56 9 1234 5678',
  ubicacion: 'Av. Libertador 1234, Santiago Centro, Chile',
  estacionamiento: 'Si, gratuito para pacientes en el subterraneo del edificio',
  horarios: 'Lun a vie 9:00-20:00, sab 9:00-14:00',
  medios_pago: 'Efectivo, tarjeta, transferencia, Webpay, Flow',
  promo: '20% off en limpieza profunda este mes',
  equipo: [{ nombre: 'Dra. Carolina Perez', rol: 'Directora y odontologa general' }],
};

const { items, pickShowcase, renderText } = buildShowcase(business);

describe('showcase — motor de chat local (sin backend externo)', () => {
  it('tiene 10 preguntas de showcase', () => {
    expect(items.length).toBe(10);
  });

  it('responde a "cuanto cuesta la limpieza?" con el precio de limpieza', () => {
    expect(pickShowcase('cuanto cuesta la limpieza?')).toContain('$25.000 CLP');
  });

  it('responde a "toman consalud?" mencionando Consalud', () => {
    expect(pickShowcase('toman consalud?')).toContain('Consalud');
  });

  it('el modulo showcase NO contiene fetch ni backend externo (modo local puro)', () => {
    const src = readFileSync(new URL('../src/lib/showcase.ts', import.meta.url), 'utf-8');
    expect(src).not.toMatch(/\bfetch\s*\(/);
    expect(src).not.toMatch(/WebSocket|https?:\/\/(?!xgnition\.pages\.dev)/);
    expect(src).not.toMatch(/node_modules|require\(/);
  });

  it('renderText escapa HTML y convierte URLs a links', () => {
    expect(renderText('<script>&')).toBe('&lt;script&gt;&amp;');
    expect(renderText('visita https://xgnition.pages.dev hoy')).toContain(
      '<a href="https://xgnition.pages.dev" target="_blank" rel="noopener">https://xgnition.pages.dev</a>'
    );
    expect(renderText('linea1\nlinea2')).toContain('<br>');
  });

  it('interpola datos del negocio (whatsapp/ubicacion) en las respuestas', () => {
    expect(pickShowcase('atienden urgencias?')).toContain(business.whatsapp);
    expect(pickShowcase('como llego?')).toContain(business.ubicacion);
  });

  it('devuelve un fallback local para preguntas desconocidas', () => {
    const r = pickShowcase('qwerty zzz no existe esto');
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });
});
