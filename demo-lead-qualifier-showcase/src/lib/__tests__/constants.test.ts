import { describe, it, expect } from 'vitest';
import { CALENDLY_URL, DEFAULT_NICHE } from '../constants';

// rol: suite para la configuración centralizada del core (AC-3, AC-6, AC-8).
// Single source of truth: Calendly URL y nicho por defecto NO se hardcodean en seed/reducer.

describe('constants — CALENDLY_URL centralizada (AC-3, AC-8)', () => {
  it('es la URL canónica de agendado del demo', () => {
    expect(CALENDLY_URL).toBe('https://calendly.com/csch1305');
  });

  it('NUNCA es mailto (AC-8: CTA Calendly, nunca mailto)', () => {
    expect(CALENDLY_URL.startsWith('mailto:')).toBe(false);
    expect(CALENDLY_URL).toContain('calendly.com');
  });
});

describe('constants — DEFAULT_NICHE por configuración (AC-6, DI)', () => {
  it('nicho por defecto es realestate (config, no hardcode en reducer)', () => {
    expect(DEFAULT_NICHE).toBe('realestate');
  });
});
