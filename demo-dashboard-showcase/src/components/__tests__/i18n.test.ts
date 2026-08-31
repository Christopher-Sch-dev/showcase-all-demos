/**
 * TESTS i18n strings — objeto bilingüe EN/es-CL (DI).
 */
import { describe, it, expect } from 'vitest';
import { getStrings, STRINGS } from '../../i18n/strings';

describe('i18n strings', () => {
 it('resuelve EN por defecto', () => {
 expect(getStrings().lang).toBe('en');
 expect(getStrings('en').nav.brand).toBe('Dental Dashboard');
 });

 it('resuelve es-CL', () => {
 expect(getStrings('es').lang).toBe('es');
 expect(getStrings('es').nav.brand).toBe('Panel Dental');
 });

 it('ambos idiomas tienen las mismas claves de UI', () => {
 const en = STRINGS.en;
 const es = STRINGS.es;
 // Verificar que las claves de primer nivel coinciden (excepto landing, solo en es).
 const enKeys = Object.keys(en).filter((k) => k !== 'landing').sort();
 const esKeys = Object.keys(es).filter((k) => k !== 'landing').sort();
 expect(esKeys).toEqual(enKeys);
 });

 it('el copy de venta es-CL existe (landing)', () => {
 const es = getStrings('es');
 expect(es.landing?.hero.headline).toContain('ingresos');
 expect(es.landing?.cta.label).toBeTruthy();
 });
});
