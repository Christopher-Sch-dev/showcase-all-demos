import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadState, saveState, resetDemo } from '../storage';
import type { DemoState } from '../types';

// rol: suite de pruebas para la persistencia en localStorage

const KEY = 'demo-hvac:v1';

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
    localStorage.setItem(KEY, '{"version":1,"leads":['); // JSON inválido
    const state = loadState();
    expect(state.seeded).toBe(true);
    expect(state.leads.length).toBeGreaterThan(0);
  });

  it('versión incompatible → fallback a seed', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ version: 99, leads: [], technicians: [], callCounter: 5, seeded: true }),
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
    const corrupt = { ...loadState(), leads: [{ ...loadState().leads[0], status: 'bogus' }] };
    localStorage.setItem(KEY, JSON.stringify(corrupt));
    const state = loadState();
    expect(state.seeded).toBe(true);
    expect(state.leads.length).toBeGreaterThan(0);
  });

  it('lead sin timeline (array) → fallback a seed', () => {
    storedBaseline();
    const base = loadState();
    const { timeline, ...noTimeline } = base.leads[0];
    void timeline;
    localStorage.setItem(KEY, JSON.stringify({ ...base, leads: [noTimeline] }));
    expect(loadState().seeded).toBe(true);
  });

  it('lead con capturedAt no numérico → fallback a seed', () => {
    storedBaseline();
    const base = loadState();
    localStorage.setItem(KEY, JSON.stringify({ ...base, leads: [{ ...base.leads[0], capturedAt: 'yesterday' }] }));
    expect(loadState().seeded).toBe(true);
  });

  it('lead sin id → fallback a seed', () => {
    storedBaseline();
    const base = loadState();
    const { id, ...noId } = base.leads[0];
    void id;
    localStorage.setItem(KEY, JSON.stringify({ ...base, leads: [noId] }));
    expect(loadState().seeded).toBe(true);
  });

  it('técnico con active no booleano → fallback a seed', () => {
    storedBaseline();
    const base = loadState();
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...base, technicians: [{ ...base.technicians[0], active: 'yes' }] }),
    );
    expect(loadState().seeded).toBe(true);
  });

  it('parsed no es objeto (null / string / número) → fallback a seed sin lanzar', () => {
    localStorage.setItem(KEY, 'null');
    expect(loadState().seeded).toBe(true);
    localStorage.setItem(KEY, '"hello"');
    expect(loadState().seeded).toBe(true);
    localStorage.setItem(KEY, '42');
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
      technicians: [],
      callCounter: 7,
      seeded: true,
    };
    saveState(state);
    expect(localStorage.getItem(KEY)).not.toBeNull();
    expect(JSON.parse(localStorage.getItem(KEY)!).callCounter).toBe(7);
  });

  it('resetDemo limpia localStorage de la clave demo', () => {
    saveState(loadState());
    expect(localStorage.getItem(KEY)).not.toBeNull();
    resetDemo();
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
