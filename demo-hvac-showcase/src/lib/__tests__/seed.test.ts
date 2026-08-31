import { describe, it, expect } from 'vitest';
import { seedTechnicians, seedLeads, createSeedState } from '../seed';
import type { Zone } from '../types';

const ZONES: Zone[] = ['north', 'central', 'south'];

describe('seedTechnicians', () => {
  it('tiene exactamente 3 técnicos', () => {
    expect(seedTechnicians).toHaveLength(3);
  });

  it('incluye Carlos, Ana y Mike cubriendo las 3 zonas', () => {
    const names = seedTechnicians.map((t) => t.name);
    expect(names).toContain('Carlos');
    expect(names).toContain('Ana');
    expect(names).toContain('Mike');
    expect(new Set(seedTechnicians.map((t) => t.zone))).toEqual(new Set(ZONES));
  });

  it('cada técnico tiene un color distinto, en formato hex, y está activo', () => {
    const colors = seedTechnicians.map((t) => t.color);
    expect(new Set(colors).size).toBe(3);
    for (const t of seedTechnicians) {
      expect(t.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(t.active).toBe(true);
    }
  });
});

describe('seedLeads', () => {
  it('tiene exactamente 5 leads', () => {
    expect(seedLeads).toHaveLength(5);
  });

  it('todos los leads están en estado qualified', () => {
    for (const l of seedLeads) expect(l.status).toBe('qualified');
  });

  it('cada lead tiene zona válida y qualification con score 0-100 y razón', () => {
    for (const l of seedLeads) {
      expect(ZONES).toContain(l.zone);
      expect(l.qualification).toBeDefined();
      expect(l.qualification!.score).toBeGreaterThanOrEqual(0);
      expect(l.qualification!.score).toBeLessThanOrEqual(100);
      expect(l.qualification!.reason.length).toBeGreaterThan(0);
    }
  });

  it('cada lead tiene timeline coherente que empieza en lead y llega a qualified', () => {
    for (const l of seedLeads) {
      const statuses = l.timeline.map((e) => e.status);
      expect(statuses[0]).toBe('lead');
      expect(statuses).toContain('qualified');
      for (let i = 1; i < l.timeline.length; i++) {
        expect(l.timeline[i].at).toBeGreaterThanOrEqual(l.timeline[i - 1].at);
      }
    }
  });

  it('los leads tienen campos demográficos realistas y captura anterior a la respuesta', () => {
    for (const l of seedLeads) {
      expect(l.customerName.length).toBeGreaterThan(0);
      expect(l.customerPhone).toMatch(/\d/);
      expect(l.address.length).toBeGreaterThan(0);
      expect(l.city.length).toBeGreaterThan(0);
      expect(l.issue.length).toBeGreaterThan(0);
      if (l.respondedAt !== undefined) {
        expect(l.respondedAt).toBeGreaterThanOrEqual(l.capturedAt);
      }
    }
  });
});

describe('createSeedState', () => {
  it('retorna un estado seed aplicado con versión 1', () => {
    const s = createSeedState();
    expect(s.version).toBe(1);
    expect(s.seeded).toBe(true);
    expect(s.technicians).toHaveLength(3);
    expect(s.leads).toHaveLength(5);
    expect(s.callCounter).toBeGreaterThanOrEqual(5);
  });

  it('retorna un estado fresco (reset re-crea sin mutar el anterior)', () => {
    const a = createSeedState();
    const b = createSeedState();
    expect(a).not.toBe(b);
    expect(a.leads).not.toBe(b.leads);
    expect(a.technicians).not.toBe(b.technicians);
  });
});
