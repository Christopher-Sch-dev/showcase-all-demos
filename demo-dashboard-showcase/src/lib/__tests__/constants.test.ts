import { describe, it, expect } from 'vitest';
import { CALENDLY_URL, STORAGE_KEY, CURRENT_VERSION } from '../constants';

// rol: suite de constantes centralizadas del core .
// Centraliza valores que antes se hardcodeaban en seed/reducer/storage.

describe('constants — config centralizada del core ', () => {
 it('CALENDLY_URL es la URL de agendado del demo (: NUNCA mailto)', () => {
 expect(CALENDLY_URL).toBe('https://calendly.com/csch1305');
 expect(CALENDLY_URL).not.toMatch(/^mailto:/);
 });

 it('STORAGE_KEY es la clave de persistencia versionada de la demo ', () => {
 expect(STORAGE_KEY).toBe('demo-dashboard:v1');
 });

 it('CURRENT_VERSION es 1 (versión del shape persistido)', () => {
 expect(CURRENT_VERSION).toBe(1);
 });
});
