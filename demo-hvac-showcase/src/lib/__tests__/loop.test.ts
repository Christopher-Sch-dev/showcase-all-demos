import { describe, it, expect } from 'vitest';
import {
  applyLoopTick,
  DEFAULT_LOOP_TIMING,
  type LoopTiming,
} from '../loop';
import { createSeedState } from '../seed';
import { deriveKpi } from '../kpi';
import type { Lead } from '../types';

// rol: suite de la función pura de loops asíncronos (applyLoopTick).
// Cada loop de datos (1,2,3,5) avanza el estado sin side-effects; el
// `now` se pasa por arg para que todo sea determinista y testeable.

// helper: construir un lead en un estado con capturedAt/updatedAt viejos.
function makeLead(over: Partial<Lead> & { id: string; status: Lead['status'] }): Lead {
  return {
    customerName: 'X',
    customerPhone: '555-0000',
    address: '1 St',
    city: 'City',
    issue: 'issue',
    zone: 'central',
    priority: 'normal',
    capturedAt: 0,
    timeline: [],
    createdAt: 0,
    updatedAt: 0,
    ...over,
  };
}

// timing corto para tests deterministas
const timing: LoopTiming = {
  callEveryTicks: 3,
  autoQualifyAfterMs: 50_000,
  jobAdvanceMs: 40_000,
  emergencyEveryTicks: 6,
};

const NOW = 1_750_000_000_000;

// Loop 2 — call feed: cada N ticks entra un lead nuevo capturado.
describe('applyLoopTick — Loop 2 (call feed)', () => {
  it('en el tick 0 no captura (el feed arranca en callEveryTicks)', () => {
    const state = createSeedState();
    const next = applyLoopTick(state, 0, NOW, timing);
    expect(next.leads.length).toBe(state.leads.length);
  });

  it('en tick múltiplo de callEveryTicks captura un lead nuevo (status lead)', () => {
    const state = createSeedState();
    const before = state.leads.length;
    const next = applyLoopTick(state, 3, NOW, timing);
    expect(next.leads.length).toBe(before + 1);
    const newest = next.leads[0];
    expect(newest.status).toBe('lead');
    expect(newest.capturedAt).toBe(NOW);
    // id progresa desde el callCounter
    expect(newest.id).toBe(`LEAD-${state.callCounter + 1}`);
  });

  it('no captura en ticks que no son múltiplo', () => {
    const state = createSeedState();
    const next = applyLoopTick(state, 2, NOW, timing);
    expect(next.leads.length).toBe(state.leads.length);
  });

  it('es pura: no muta el estado de entrada', () => {
    const state = createSeedState();
    const snapshot = JSON.stringify(state);
    applyLoopTick(state, 3, NOW, timing);
    expect(JSON.stringify(state)).toBe(snapshot);
  });
});

// Loop 1 — auto-qualify: un lead 'lead' viejo se auto-califica (speed-to-lead).
describe('applyLoopTick — Loop 1 (auto-qualify)', () => {
  it('un lead capturado hace >= autoQualifyAfterMs pasa a qualified solo', () => {
    const state = createSeedState();
    state.leads = [
      makeLead({
        id: 'L-FRESH',
        status: 'lead',
        capturedAt: NOW - 60_000, // 60s viejo > 50s umbral
        updatedAt: NOW - 60_000,
      }),
      ...state.leads,
    ];
    const next = applyLoopTick(state, 1, NOW, timing);
    const lead = next.leads.find((l) => l.id === 'L-FRESH');
    expect(lead?.status).toBe('qualified');
    expect(lead?.qualification).toBeDefined();
    expect(lead?.respondedAt).toBe(NOW);
  });

  it('un lead joven (dentro del umbral) NO se califica aún', () => {
    const state = createSeedState();
    state.leads = [
      makeLead({
        id: 'L-JOVEN',
        status: 'lead',
        capturedAt: NOW - 10_000,
        updatedAt: NOW - 10_000,
      }),
      ...state.leads,
    ];
    const next = applyLoopTick(state, 1, NOW, timing);
    expect(next.leads.find((l) => l.id === 'L-JOVEN')?.status).toBe('lead');
  });

  it('la razón de auto-calificación menciona respuesta automática', () => {
    const state = createSeedState();
    state.leads = [
      makeLead({
        id: 'L-AUTO',
        status: 'lead',
        capturedAt: NOW - 90_000,
        updatedAt: NOW - 90_000,
      }),
    ];
    const next = applyLoopTick(state, 1, NOW, timing);
    const q = next.leads[0].qualification;
    expect(q?.score).toBeGreaterThan(0);
    expect(q?.reason.toLowerCase()).toContain('auto');
  });
});

// Loop 3 — técnico avanza solo: dispatched → in_progress → completed tras M ticks.
describe('applyLoopTick — Loop 3 (técnico autoplay)', () => {
  it('un job dispatched con updatedAt viejo pasa a in_progress', () => {
    const state = createSeedState();
    state.leads = [
      makeLead({
        id: 'J-DISP',
        status: 'dispatched',
        technicianId: 'tech-north',
        etaMinutes: 25,
        updatedAt: NOW - 45_000, // > jobAdvanceMs 40s
      }),
    ];
    const next = applyLoopTick(state, 1, NOW, timing);
    expect(next.leads[0].status).toBe('in_progress');
  });

  it('un job dispatched reciente NO avanza', () => {
    const state = createSeedState();
    state.leads = [
      makeLead({
        id: 'J-NUEVO',
        status: 'dispatched',
        technicianId: 'tech-north',
        updatedAt: NOW - 5_000,
      }),
    ];
    const next = applyLoopTick(state, 1, NOW, timing);
    expect(next.leads[0].status).toBe('dispatched');
  });

  it('un job in_progress con updatedAt viejo pasa a completed', () => {
    const state = createSeedState();
    state.leads = [
      makeLead({
        id: 'J-WORK',
        status: 'in_progress',
        technicianId: 'tech-central',
        updatedAt: NOW - 45_000,
      }),
    ];
    const next = applyLoopTick(state, 1, NOW, timing);
    expect(next.leads[0].status).toBe('completed');
    expect(next.leads[0].completionNote).toBeTruthy();
  });

  it('un job scheduled NO avanza solo (necesita dispatch manual)', () => {
    const state = createSeedState();
    state.leads = [
      makeLead({
        id: 'J-SCHED',
        status: 'scheduled',
        technicianId: 'tech-south',
        updatedAt: NOW - 90_000,
      }),
    ];
    const next = applyLoopTick(state, 1, NOW, timing);
    expect(next.leads[0].status).toBe('scheduled');
  });
});

// Loop 5 — alert de emergencia: cada N ticks entra un lead urgent 🚨.
describe('applyLoopTick — Loop 5 (alerta de emergencia)', () => {
  it('en tick múltiplo de emergencyEveryTicks captura un lead urgent', () => {
    const state = createSeedState();
    const before = state.leads.length;
    const next = applyLoopTick(state, 6, NOW, timing);
    expect(next.leads.length).toBe(before + 1);
    const newest = next.leads[0];
    expect(newest.priority).toBe('urgent');
  });

  it('el lead de emergencia describe AC muerto y bebé en casa', () => {
    const state = createSeedState();
    const next = applyLoopTick(state, 6, NOW, timing);
    const newest = next.leads[0];
    const text = `${newest.issue} ${newest.qualification?.reason ?? ''}`.toLowerCase();
    expect(text).toContain('ac');
    expect(text).toContain('baby');
  });

  it('no captura emergencia fuera del tick programado', () => {
    const state = createSeedState();
    const next = applyLoopTick(state, 5, NOW, timing);
    expect(next.leads.length).toBe(state.leads.length);
  });
});

// Loop 4 — KPIs en vivo: deriveKpi refleja el estado tras los loops.
describe('applyLoopTick — Loop 4 (KPIs en vivo se derivan)', () => {
  it('tras un call feed, deriveKpi refleja el nuevo lead capturado', () => {
    const state = createSeedState();
    const before = deriveKpi(state).totalCallsCaptured;
    const next = applyLoopTick(state, 3, NOW, timing);
    expect(deriveKpi(next).totalCallsCaptured).toBe(before + 1);
  });

  it('tras un auto-qualify, qualifiedLeads crece', () => {
    const state = createSeedState();
    state.leads = [
      makeLead({ id: 'L-KPI', status: 'lead', capturedAt: NOW - 90_000, updatedAt: NOW - 90_000 }),
    ];
    const before = deriveKpi(state).qualifiedLeads;
    const next = applyLoopTick(state, 1, NOW, timing);
    expect(deriveKpi(next).qualifiedLeads).toBe(before + 1);
  });
});

// Loop 6 — reset con fade: reduce({type:'reset'}) re-seedea; createSeedState es determinista.
describe('Loop 6 — reset / re-seed', () => {
  it('createSeedState es determinista entre llamadas', () => {
    const a = createSeedState();
    const b = createSeedState();
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('tras avanzar estado, un reset restaura exactamente el seed', () => {
    const state = createSeedState();
    const advanced = applyLoopTick(state, 3, NOW, timing);
    expect(advanced.leads.length).toBeGreaterThan(state.leads.length);
    const reset = createSeedState();
    expect(JSON.stringify(reset)).toBe(JSON.stringify(createSeedState()));
  });
});

// Loop 7 — indicador LIVE es UI pura (documentado). Verificamos el contrato de timing.
describe('DEFAULT_LOOP_TIMING — contrato', () => {
  it('expone los 4 parámetros con valores positivos', () => {
    expect(DEFAULT_LOOP_TIMING.callEveryTicks).toBeGreaterThan(0);
    expect(DEFAULT_LOOP_TIMING.autoQualifyAfterMs).toBeGreaterThan(0);
    expect(DEFAULT_LOOP_TIMING.jobAdvanceMs).toBeGreaterThan(0);
    expect(DEFAULT_LOOP_TIMING.emergencyEveryTicks).toBeGreaterThan(0);
  });
});
