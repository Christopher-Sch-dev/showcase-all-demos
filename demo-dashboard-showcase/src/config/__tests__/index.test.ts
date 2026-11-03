import { describe, it, expect } from 'vitest';
import { getNicheConfig, DEFAULT_REGISTRY } from '../index';
import type { NicheConfig } from '../schema';

// rol: suite del router de config por nicho (spec.md AC-6, AC-12).
// getNicheConfig resuelve la config por DI (registry inyectable), NUNCA if(niche==='x') en componente.
// Patrón: demo-lead-qualifier/src/config/__tests__/index.test.ts.

describe('getNicheConfig — router por DI, nunca if-por-nicho (AC-6)', () => {
  it('resuelve la config de dental desde el registro por defecto', () => {
    const cfg = getNicheConfig('dental');
    expect(cfg).toBeDefined();
    expect(cfg?.niche).toBe('dental');
    expect(cfg?.type).toBe('e');
  });

  it('devuelve undefined para un nicho desconocido (sin lanzar)', () => {
    const cfg = getNicheConfig('medspa');
    expect(cfg).toBeUndefined();
  });

  it('el registro por defecto trae el nicho dental configurado (AC-6)', () => {
    expect(Object.keys(DEFAULT_REGISTRY)).toEqual(['dental']);
    for (const cfg of Object.values(DEFAULT_REGISTRY)) {
      expect(cfg).toBeDefined();
      expect(cfg.type).toBe('e');
    }
  });

  it('acepta un registry inyectado por DI (nunca hardcodea el mapa)', () => {
    const custom: Record<string, NicheConfig> = {
      // registry custom que resuelve un nicho extra sin tocar los componentes
      medspa: { ...DEFAULT_REGISTRY.dental, niche: 'medspa' },
    };
    const viaDi = getNicheConfig('medspa', custom as typeof DEFAULT_REGISTRY);
    expect(viaDi?.niche).toBe('medspa');
  });

  it('cada config por defecto tiene CTA Calendly (AC-8, nunca mailto)', () => {
    for (const cfg of Object.values(DEFAULT_REGISTRY)) {
      expect(cfg.cta.url.startsWith('mailto:')).toBe(false);
      expect(cfg.cta.url).toContain('calendly.com');
    }
  });

  it('cada config por defecto expone narrativa completa con estética (AC-6/AC-12)', () => {
    for (const cfg of Object.values(DEFAULT_REGISTRY)) {
      expect(cfg.hero.headline.length).toBeGreaterThan(0);
      expect(cfg.painPoint.metrics.length).toBeGreaterThan(0);
      expect(cfg.metrics.length).toBeGreaterThan(0);
      expect(cfg.aesthetic.theme).toBeTruthy();
      expect(cfg.aesthetic.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });
});
