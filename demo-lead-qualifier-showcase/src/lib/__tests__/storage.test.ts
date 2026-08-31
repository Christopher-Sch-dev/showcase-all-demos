import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadState, saveState, resetDemo, STORAGE_KEY } from '../storage';
import { seedLeads } from '../seed';
import { CALENDLY_URL } from '../constants';
import type { DemoState } from '../types';

// rol: suite de pruebas para la persistencia en localStorage (spec AC-9, AC-1)

describe('storage — seed ÚNICO inyectado desde seed.ts (fix duplicación)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('loadState usa EXACTAMENTE el seedLeads de seed.ts (DI, no seed duplicado)', () => {
    const state = loadState();
    // Misma longitud y mismos ids que la única fuente de verdad seed.ts.
    expect(state.leads).toHaveLength(seedLeads.length);
    const seedIds = seedLeads.map((l) => l.id).sort();
    const stateIds = state.leads.map((l) => l.id).sort();
    expect(stateIds).toEqual(seedIds);
  });

  it('todo lead booked en el seed lleva bookingUrl Calendly centralizada (CALENDLY_URL)', () => {
    const state = loadState();
    for (const lead of state.leads) {
      if (lead.status === 'booked') {
        expect(lead.bookingUrl).toBe(CALENDLY_URL);
      }
    }
  });

  it('L1 (booked) en storage coincide con L1 en seed.ts (mismo score/reason/topic)', () => {
    const state = loadState();
    const storedL1 = state.leads.find((l) => l.id === 'L1');
    const seedL1 = seedLeads.find((l) => l.id === 'L1');
    expect(seedL1).toBeDefined();
    expect(storedL1).toBeDefined();
    expect(storedL1!.status).toBe(seedL1!.status);
    expect(storedL1!.qualification?.score).toBe(seedL1!.qualification?.score);
    expect(storedL1!.topic).toBe(seedL1!.topic);
  });
});

describe('storage — loadState con versión y fallback', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('sin datos en localStorage → devuelve estado seed válido (no lanza)', () => {
    const state = loadState();
    expect(state.version).toBe(1);
    expect(Array.isArray(state.leads)).toBe(true);
    expect(state.seeded).toBe(true);
  });

  it('JSON corrupto → fallback a seed sin lanzar', () => {
    localStorage.setItem(STORAGE_KEY, '{"version":1,"leads":['); // JSON inválido
    const state = loadState();
    expect(state.seeded).toBe(true);
    expect(state.leads.length).toBeGreaterThan(0);
  });

  it('versión incompatible → fallback a seed', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 99, leads: [], leadCounter: 5, seeded: true }),
    );
    const state = loadState();
    expect(state.version).toBe(1);
    expect(state.seeded).toBe(true);
  });

  it('carga correctamente un estado guardado (round-trip)', () => {
    const state = loadState();
    saveState(state);
    const loaded = loadState();
    expect(loaded).toEqual(state);
    expect(loaded.leads.length).toBe(state.leads.length);
  });
});

describe('storage — localStorage corrupto a nivel de contenido (deep validation)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  // rol: guardar un estado válido como base para corromper campos individuales.
  function storedBaseline(): DemoState {
    const s = loadState();
    saveState(s);
    return s;
  }

  it('lead con status inválido → fallback a seed (no crashea StatusBadge/KPI)', () => {
    storedBaseline();
    const base = loadState();
    const corrupt = { ...base, leads: [{ ...base.leads[0], status: 'bogus' }] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(corrupt));
    const state = loadState();
    expect(state.seeded).toBe(true);
    expect(state.leads.length).toBeGreaterThan(0);
  });

  it('lead con niche inválido → fallback a seed', () => {
    storedBaseline();
    const base = loadState();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...base, leads: [{ ...base.leads[0], niche: 'plumbing' }] }),
    );
    expect(loadState().seeded).toBe(true);
  });

  it('lead sin timeline (array) → fallback a seed', () => {
    storedBaseline();
    const base = loadState();
    const { timeline, ...noTimeline } = base.leads[0];
    void timeline;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, leads: [noTimeline] }));
    expect(loadState().seeded).toBe(true);
  });

  it('lead con capturedAt no numérico → fallback a seed', () => {
    storedBaseline();
    const base = loadState();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...base, leads: [{ ...base.leads[0], capturedAt: 'yesterday' }] }),
    );
    expect(loadState().seeded).toBe(true);
  });

  it('lead sin id → fallback a seed', () => {
    storedBaseline();
    const base = loadState();
    const { id, ...noId } = base.leads[0];
    void id;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...base, leads: [noId] }));
    expect(loadState().seeded).toBe(true);
  });

  it('leads no es array → fallback a seed', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: 1, leads: 'nope', leadCounter: 0, seeded: true }),
    );
    expect(loadState().seeded).toBe(true);
  });

  it('parsed no es objeto (null / string / número) → fallback a seed sin lanzar', () => {
    localStorage.setItem(STORAGE_KEY, 'null');
    expect(loadState().seeded).toBe(true);
    localStorage.setItem(STORAGE_KEY, '"hello"');
    expect(loadState().seeded).toBe(true);
    localStorage.setItem(STORAGE_KEY, '42');
    expect(loadState().seeded).toBe(true);
  });
});

describe('storage — saveState / resetDemo', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('saveState persiste el estado en la clave correcta', () => {
    const state: DemoState = {
      version: 1,
      leads: [],
      leadCounter: 7,
      seeded: true,
    };
    saveState(state);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).leadCounter).toBe(7);
  });

  it('resetDemo limpia localStorage de la clave demo', () => {
    saveState(loadState());
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
    resetDemo();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
