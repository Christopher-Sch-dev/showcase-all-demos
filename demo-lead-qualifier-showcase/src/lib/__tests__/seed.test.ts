import { describe, it, expect } from 'vitest';
import { seedLeads, createSeedState } from '../seed';
import type { LeadStatus, Niche } from '../types';

const STATUSES: LeadStatus[] = ['new', 'qualified', 'booked'];
const NICHES: Niche[] = ['realestate', 'law'];

describe('seedLeads', () => {
  it('tiene exactamente 5 leads con ids únicos', () => {
    expect(seedLeads).toHaveLength(5);
    const ids = seedLeads.map((l) => l.id);
    expect(new Set(ids).size).toBe(5);
  });

  it('todos tienen status válido y nicho válido', () => {
    for (const l of seedLeads) {
      expect(STATUSES).toContain(l.status);
      expect(NICHES).toContain(l.niche);
    }
  });

  it('cubre ambos nichos (realestate y law)', () => {
    const niches = new Set(seedLeads.map((l) => l.niche));
    expect(niches).toEqual(new Set(NICHES));
  });

  it('capturedAt es numérico válido y en el pasado de la demo', () => {
    const now = Date.now();
    for (const l of seedLeads) {
      expect(typeof l.capturedAt).toBe('number');
      expect(l.capturedAt).toBeGreaterThanOrEqual(1_000_000_000_000);
      expect(l.capturedAt).toBeLessThanOrEqual(now);
    }
  });

  it('leads qualified/booked tienen score 0-100, razón y score ≥ umbral 60', () => {
    for (const l of seedLeads) {
      if (l.status === 'qualified' || l.status === 'booked') {
        expect(l.qualification).toBeDefined();
        expect(l.qualification!.score).toBeGreaterThanOrEqual(0);
        expect(l.qualification!.score).toBeLessThanOrEqual(100);
        expect(l.qualification!.score).toBeGreaterThanOrEqual(60);
        expect(l.qualification!.reason.length).toBeGreaterThan(0);
      }
    }
  });

  it('timeline coherente y respuesta posterior a la captura (<60s)', () => {
    for (const l of seedLeads) {
      for (let i = 1; i < l.timeline.length; i++) {
        expect(l.timeline[i].at).toBeGreaterThanOrEqual(l.timeline[i - 1].at);
      }
      if (l.respondedAt !== undefined) {
        expect(l.respondedAt).toBeGreaterThanOrEqual(l.capturedAt);
      }
    }
  });

  it('leads realistas: nombre, email, phone y topic no vacíos', () => {
    for (const l of seedLeads) {
      expect(l.name.length).toBeGreaterThan(0);
      expect(l.email).toMatch(/@/);
      expect(l.phone).toMatch(/\d/);
      expect(l.topic.length).toBeGreaterThan(0);
    }
  });
});

describe('createSeedState', () => {
  it('retorna estado seed versión 1, seeded true, con leads y counter', () => {
    const s = createSeedState();
    expect(s.version).toBe(1);
    expect(s.seeded).toBe(true);
    expect(s.leads).toHaveLength(seedLeads.length);
    expect(s.leadCounter).toBeGreaterThanOrEqual(seedLeads.length);
  });

  it('retorna estado fresco en cada llamada (reset sin mutar el previo)', () => {
    const a = createSeedState();
    const b = createSeedState();
    expect(a).not.toBe(b);
    expect(a.leads).not.toBe(b.leads);
  });
});
