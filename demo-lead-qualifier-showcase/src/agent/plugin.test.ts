import { describe, it, expect } from 'vitest';
import { reduce } from '../lib/state';
import { CALENDLY_URL } from '../lib/constants';
import type { DemoState, Lead, LeadStatus } from '../lib/types';
import { operateLead, captureLead, qualifyLead, bookLead } from './plugin';

const NOW = 1_700_000_000_000;

// ───────────── helpers (estado + leads construidos a mano, sin seed externo) ─────────────

function makeLead(id: string, status: LeadStatus, overrides: Partial<Lead> = {}): Lead {
  return {
    id,
    status,
    niche: 'realestate',
    source: 'form',
    name: 'Test Customer',
    email: 'customer@example.com',
    phone: '555-0000',
    topic: 'Looking for a 4br house under $600k',
    urgency: 'normal',
    capturedAt: NOW - 1000,
    timeline: [{ status, at: NOW - 1000 }],
    createdAt: NOW - 1000,
    updatedAt: NOW - 1000,
    ...overrides,
  };
}

function makeState(leads: Lead[] = [], leadCounter = 0, seeded = false): DemoState {
  return { version: 1, leads, leadCounter, seeded };
}

const INTENT = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '555-0100',
  topic: 'Looking for a 4 bed house under $600k',
  budget: 550000,
  capturedAt: NOW,
};

// ───────────── operateLead: manejador explícito del contrato agéntico (AC-5) ─────────────

describe('operateLead — manejador explícito sobre reduce (AC-5, CAN §8)', () => {
  it('despacha las 3 acciones del contrato agéntico al reducer sin romperlo', () => {
    const s = makeState();
    const captured = operateLead(s, { type: 'capture_lead', intent: INTENT }, NOW);
    expect(captured.changed).toBe(true);
    expect(captured.state.leads[0].status).toBe('new');

    const id = captured.state.leads[0].id;
    const qualified = operateLead(captured.state, { type: 'qualify', leadId: id, score: 85, reason: 'High budget' }, NOW);
    expect(qualified.changed).toBe(true);
    expect(qualified.state.leads[0].status).toBe('qualified');

    const booked = operateLead(qualified.state, { type: 'book', leadId: id }, NOW);
    expect(booked.changed).toBe(true);
    expect(booked.state.leads[0].status).toBe('booked');
  });

  it('la IA no puede forzar una transición inválida (book desde new) aunque use operateLead', () => {
    const s = makeState([makeLead('LEAD-1', 'new')]);
    const r = operateLead(s, { type: 'book', leadId: 'LEAD-1', bookingUrl: 'https://calendly.com/x' }, NOW);
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/inválida/i);
    expect(r.state).toBe(s); // reducer puro: misma referencia al rechazar
  });

  it('es equivalente a reduce(): mismo output para el mismo input (capa, no reimplementación)', () => {
    const viaPlugin = captureLead(makeState(), INTENT, NOW);
    const viaReduce = reduce(makeState(), { type: 'capture_lead', intent: INTENT }, NOW);
    expect(viaPlugin.state.leads).toEqual(viaReduce.state.leads);
  });
});

// ───────────── captureLead wrapper ─────────────

describe('captureLead — wrapper puro (captura → lead new, AC-1)', () => {
  it('crea un lead new y devuelve changed=true', () => {
    const r = captureLead(makeState(), INTENT, NOW);
    expect(r.changed).toBe(true);
    expect(r.state.leads[0].status).toBe('new');
    expect(r.state.leads[0].name).toBe('Jane Smith');
  });

  it('no muta el estado de entrada (puro, igual que reduce)', () => {
    const s = makeState();
    captureLead(s, INTENT, NOW);
    expect(s.leads).toHaveLength(0);
  });
});

// ───────────── qualifyLead wrapper ─────────────

describe('qualifyLead — wrapper puro (new → qualified, AC-2)', () => {
  it('califica un lead new con score + razón y avanza la FSM', () => {
    const s = makeState([makeLead('LEAD-1', 'new')]);
    const r = qualifyLead(s, 'LEAD-1', 85, 'High budget, ready this week', NOW);
    expect(r.changed).toBe(true);
    expect(r.state.leads[0].status).toBe('qualified');
    expect(r.state.leads[0].qualification?.score).toBe(85);
    expect(r.state.leads[0].qualification?.reason).toBe('High budget, ready this week');
  });

  it('rechaza una transición inválida (qualify doble desde qualified)', () => {
    const s = makeState([
      makeLead('LEAD-1', 'qualified', { qualification: { score: 80, reason: 'ok' }, respondedAt: NOW }),
    ]);
    const r = qualifyLead(s, 'LEAD-1', 95, 'again', NOW);
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/inválida/i);
  });

  it('no muta el estado de entrada (puro)', () => {
    const s = makeState([makeLead('LEAD-1', 'new')]);
    qualifyLead(s, 'LEAD-1', 85, 'ok', NOW);
    expect(s.leads[0].status).toBe('new');
  });
});

// ───────────── bookLead wrapper ─────────────

describe('bookLead — wrapper puro (qualified → booked, AC-3/AC-8)', () => {
  it('agenda un lead qualified y aplica CALENDLY_URL por defecto (sin bookingUrl)', () => {
    const s = makeState([
      makeLead('LEAD-1', 'qualified', { qualification: { score: 80, reason: 'ok' }, respondedAt: NOW }),
    ]);
    const r = bookLead(s, 'LEAD-1', undefined, NOW);
    expect(r.changed).toBe(true);
    expect(r.state.leads[0].status).toBe('booked');
    expect(r.state.leads[0].bookingUrl).toBe(CALENDLY_URL); // AC-8: NUNCA mailto, CTA centralizado
  });

  it('acepta una bookingUrl propia si viene', () => {
    const s = makeState([
      makeLead('LEAD-1', 'qualified', { qualification: { score: 80, reason: 'ok' }, respondedAt: NOW }),
    ]);
    const r = bookLead(s, 'LEAD-1', 'https://calendly.com/csch1305', NOW);
    expect(r.changed).toBe(true);
    expect(r.state.leads[0].bookingUrl).toBe('https://calendly.com/csch1305');
  });

  it('rechaza book sin qualificar (desde new) — la IA no puede saltarse la FSM', () => {
    const s = makeState([makeLead('LEAD-1', 'new')]);
    const r = bookLead(s, 'LEAD-1', 'https://calendly.com/x', NOW);
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/inválida/i);
  });

  it('no muta el estado de entrada (puro)', () => {
    const s = makeState([
      makeLead('LEAD-1', 'qualified', { qualification: { score: 80, reason: 'ok' }, respondedAt: NOW }),
    ]);
    bookLead(s, 'LEAD-1', 'https://calendly.com/x', NOW);
    expect(s.leads[0].status).toBe('qualified');
  });
});

// ───────────── recorrido completo vía wrappers (el 'uso completo para el agente') ─────────────

describe('funnel completo vía wrappers del plugin (el uso completo para el agente, CAN §8)', () => {
  it('cualquier IA recorre capture → qualify → book usando solo los 3 wrappers', () => {
    let s = makeState();
    s = captureLead(s, INTENT, NOW).state;
    const id = s.leads[0].id;

    s = qualifyLead(s, id, 88, 'Agent externo: alto interés', NOW).state;
    expect(s.leads[0].status).toBe('qualified');

    s = bookLead(s, id, undefined, NOW).state;
    expect(s.leads[0].status).toBe('booked');
    expect(s.leads[0].bookingUrl).toBe(CALENDLY_URL);
    expect(s.leads[0].timeline.map((e) => e.status)).toEqual(['new', 'qualified', 'booked']);
  });
});
