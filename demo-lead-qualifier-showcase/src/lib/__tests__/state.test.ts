import { describe, it, expect } from 'vitest';
import { reduce } from '../state';
import { urgencyFromScore } from '../score';
import { DEFAULT_NICHE } from '../constants';
import type { AgentAction, DemoState, Lead, LeadStatus, ReduceResult } from '../types';

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

/** Aplica la acción y afirma que produjo cambio (GREEN esperado). */
function reduceOk(state: DemoState, action: AgentAction): DemoState {
  const r = reduce(state, action, NOW);
  expect(r.changed).toBe(true);
  return r.state;
}

/** Aplica la acción y afirma que fue rechazada (no-cambio, misma referencia). */
function reduceReject(state: DemoState, action: AgentAction): ReduceResult {
  const r = reduce(state, action, NOW);
  expect(r.changed).toBe(false);
  expect(r.state).toBe(state); // reducer puro: misma referencia cuando no cambia
  return r;
}

const INTENT = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  phone: '555-0100',
  topic: 'Looking for a 4 bed house under $600k',
  budget: 550000,
  capturedAt: NOW,
};

// ─────────────────────────────────────────── capture_lead ───────────────────────────────────────────

describe('capture_lead (AC-1: lead new + timer speed-to-lead <60s)', () => {
  it('crea un lead nuevo en estado new al top del queue con timeline y capturedAt', () => {
    const s = makeState();
    const after = reduceOk(s, { type: 'capture_lead', intent: INTENT });
    expect(after.leads).toHaveLength(1);
    const lead = after.leads[0];
    expect(lead.status).toBe('new');
    expect(lead.capturedAt).toBe(NOW); // inicia contador speed-to-lead
    expect(lead.respondedAt).toBeUndefined(); // aún sin respuesta
    expect(lead.name).toBe('Jane Smith');
    expect(lead.niche).toBe('realestate');
    expect(lead.source).toBe('form');
    expect(lead.urgency).toBe(urgencyFromScore(0)); // fuente única: score.ts (bajo 40 → low)
    expect(lead.timeline).toHaveLength(1);
    expect(lead.timeline[0].status).toBe('new');
    expect(lead.timeline[0].at).toBe(NOW);
  });

  it('incrementa leadCounter, genera id secuencial y no muta el estado original', () => {
    const s = makeState([], 3, true);
    const after = reduceOk(s, { type: 'capture_lead', intent: INTENT_CAPTURE });
    expect(after.leads[0].id).toBe('LEAD-4');
    expect(after.leadCounter).toBe(4);
    expect(s.leads).toHaveLength(0); // inmutable
    expect(s.leadCounter).toBe(3);
  });

  it('encola por delante de leads existentes (FIFO por prioridad de respuesta)', () => {
    const s = makeState([makeLead('LEAD-1', 'new')], 1, true);
    const after = reduceOk(s, { type: 'capture_lead', intent: INTENT_CAPTURE });
    expect(after.leads).toHaveLength(2);
    expect(after.leads[0].id).toBe('LEAD-2');
    expect(after.leads[1].id).toBe('LEAD-1');
  });

  it('aplica la urgencia POR DEFECTO (new, sin score) igual a urgencyFromScore(0) — fuente única', () => {
    // Sin score aún, el lead se trata como score 0 → la urgencia debe coincidir
    // exactamente con urgencyFromScore(0) (bajo el bucket 40 → 'low').
    const s = makeState();
    const after = reduceOk(s, { type: 'capture_lead', intent: INTENT_CAPTURE });
    expect(after.leads[0].urgency).toBe(urgencyFromScore(0));
    // El estado por defecto del reducer ya NO es 'normal' (era heurística por presupuesto).
    expect(after.leads[0].urgency).not.toBe('normal');
  });
});

describe('capture_lead — niche por DI (AC-6: nicho = configuración, nunca hardcode)', () => {
  it('usa el niche del intent cuando viene (DI), sin asumir realestate', () => {
    const s = makeState();
    const intent = { ...INTENT_CAPTURE, niche: 'law' as const };
    const after = reduceOk(s, { type: 'capture_lead', intent });
    expect(after.leads[0].niche).toBe('law');
  });

  it('sin niche en el intent → aplica DEFAULT_NICHE de config (no hardcode en reducer)', () => {
    const s = makeState();
    const after = reduceOk(s, { type: 'capture_lead', intent: INTENT_CAPTURE });
    expect(after.leads[0].niche).toBe(DEFAULT_NICHE);
  });
});

// ─────────────────────────────────────────── camino forward new → qualified → booked ───────────────────────────────────────────

describe('camino forward completo new → qualified → booked (AC-2, AC-3)', () => {
  it('recorre las transiciones válidas del funnel lead', () => {
    let s = makeState();
    s = reduceOk(s, { type: 'capture_lead', intent: INTENT_CAPTURE });
    const id = s.leads[0].id;

    s = reduceOk(s, { type: 'qualify', leadId: id, score: 85, reason: 'High budget, ready this week' });
    let lead = s.leads[0];
    expect(lead.status).toBe('qualified');
    expect(lead.qualification?.score).toBe(85);
    expect(lead.qualification?.reason).toBe('High budget, ready this week');
    expect(lead.respondedAt).toBe(NOW); // primera respuesta → se mide <60s (AC-1)

    s = reduceOk(s, { type: 'book', leadId: id, bookingUrl: 'https://calendly.com/csch1305' });
    lead = s.leads[0];
    expect(lead.status).toBe('booked');
    expect(lead.bookedAt).toBe(NOW);
    expect(lead.bookingUrl).toBe('https://calendly.com/csch1305');

    // timeline refleja cada estado recorrido, con timestamps de auditoría
    const timeline = lead.timeline.map((e) => ({ status: e.status, at: e.at, note: e.note }));
    expect(timeline).toEqual([
      { status: 'new', at: NOW },
      { status: 'qualified', at: NOW, note: 'High budget, ready this week' },
      { status: 'booked', at: NOW },
    ] as typeof timeline);
  });
});

// ─────────────────────────────────────────── guards e invariantes ───────────────────────────────────────────

describe('guards e invariantes', () => {
  it('lead inexistente devuelve no-cambio con razón clara (REJECT)', () => {
    const s = makeState([makeLead('LEAD-1', 'new')]);
    const r = reduceReject(s, { type: 'qualify', leadId: 'no-such-lead', score: 80, reason: 'ok' });
    expect(r.reason).toMatch(/no encontrado/i);
  });

  it('qualify doble desde qualified → REJECT', () => {
    const s = makeState([
      makeLead('LEAD-1', 'qualified', { qualification: { score: 80, reason: 'ok' }, respondedAt: NOW }),
    ]);
    const r = reduceReject(s, { type: 'qualify', leadId: 'LEAD-1', score: 95, reason: 'again' });
    expect(r.reason).toMatch(/inválida/i);
  });

  it('qualify desde booked → REJECT (solo desde new)', () => {
    const s = makeState([makeLead('LEAD-1', 'booked', { bookedAt: NOW })]);
    const r = reduceReject(s, { type: 'qualify', leadId: 'LEAD-1', score: 90, reason: 'late' });
    expect(r.reason).toMatch(/inválida/i);
  });

  it('book sin qualify (desde new) → REJECT', () => {
    const s = makeState([makeLead('LEAD-1', 'new')]);
    const r = reduceReject(s, { type: 'book', leadId: 'LEAD-1', bookingUrl: 'https://calendly.com/csch1305' });
    expect(r.reason).toMatch(/inválida/i);
  });

  it('book doble desde booked → REJECT (idempotente, AC-3)', () => {
    const s = makeState([
      makeLead('LEAD-1', 'booked', { bookedAt: NOW, bookingUrl: 'https://calendly.com/csch1305' }),
    ]);
    const r = reduceReject(s, { type: 'book', leadId: 'LEAD-1', bookingUrl: 'https://calendly.com/other' });
    expect(r.reason).toMatch(/inválida/i);
    expect(r.state.leads[0].bookingUrl).toBe('https://calendly.com/csch1305'); // no pisado
  });

  it('rechaza score fuera de rango 0-100', () => {
    const s = makeState([makeLead('LEAD-1', 'new')]);
    const tooHigh = reduceReject(s, { type: 'qualify', leadId: 'LEAD-1', score: 101, reason: 'ok' });
    expect(tooHigh.reason).toMatch(/score/i);
    const tooLow = reduceReject(s, { type: 'qualify', leadId: 'LEAD-1', score: -1, reason: 'ok' });
    expect(tooLow.reason).toMatch(/score/i);
  });

  it('rechaza qualify con razón vacía', () => {
    const s = makeState([makeLead('LEAD-1', 'new')]);
    const r = reduceReject(s, { type: 'qualify', leadId: 'LEAD-1', score: 80, reason: '   ' });
    expect(r.reason).toMatch(/razón|reason/i);
  });

  it('el reducer nunca muta el estado de entrada (pureza) incluso en camino exitoso', () => {
    const s = makeState();
    reduce(s, { type: 'capture_lead', intent: INTENT_CAPTURE }, NOW);
    expect(s.leads).toHaveLength(0);
    expect(s.leadCounter).toBe(0);
  });
});

// ─────────────────────────────────────────── timer speed-to-lead <60s (AC-1) ───────────────────────────────────────────

describe('speed-to-lead <60s (AC-1)', () => {
  it('si la IA responde dentro de 60s, respondedAt-capturedAt < 60000', () => {
    const captured = 1_700_000_000_000;
    const responded = captured + 45_000; // 45s < 60s
    let s = afterState(captured);
    const id = s.leads[0].id;
    s = reduce(s, { type: 'qualify', leadId: id, score: 88, reason: 'Urgent' }, responded).state;
    const lead = s.leads[0];
    expect(lead.respondedAt! - lead.capturedAt).toBeLessThan(60_000);
    expect(lead.respondedAt! - lead.capturedAt).toBe(45_000);
  });

  it('reduce calcula la velocidad de respuesta del lead desde capturedAt a respondedAt (determinista)', () => {
    const captured = 1_700_000_000_000;
    const responded = captured + 59_999; // justo bajo el umbral <60s
    let s = afterState(captured);
    const id = s.leads[0].id;
    s = reduce(s, { type: 'qualify', leadId: id, score: 90, reason: 'ok' }, responded).state;
    const lead = s.leads[0];
    expect(lead.respondedAt).toBe(responded);
    // el contador arrancó en captura y terminó en la primera respuesta
    expect(lead.respondedAt! - lead.capturedAt).toBe(59_999);
    expect(lead.respondedAt! - lead.capturedAt).toBeLessThan(60_000);
  });
});

// ─────────────────────────────────────────── contrato agéntico (AC-5) ───────────────────────────────────────────

describe('capa IA conectable (AC-5)', () => {
  it('cualquier IA puede operar el funnel completo solo con las 3 acciones agénticas', () => {
    let s = afterState();
    const id = s.leads[0].id;
    s = reduceOk(s, { type: 'qualify', leadId: id, score: 82, reason: 'IA externa: alto interés' });
    s = reduceOk(s, { type: 'book', leadId: id, bookingUrl: 'https://calendly.com/csch1305' });
    expect(s.leads[0].status).toBe('booked');
    expect(s.leads[0].qualification?.score).toBe(82);
    expect(s.leads[0].bookingUrl).toBe('https://calendly.com/csch1305');
  });

  it('la IA no puede forzar una transición inválida aunque envíe el payload (determinista)', () => {
    const s = makeState([makeLead('LEAD-1', 'new')]);
    // book directo desde new ignorando el paso qualify → REJECT
    const r = reduceReject(s, { type: 'book', leadId: 'LEAD-1', bookingUrl: 'https://calendly.com/x' });
    expect(r.reason).toMatch(/inválida/i);
  });
});

describe('book — bookingUrl centralizada por defecto (AC-3/AC-8, contrato agéntico)', () => {
  it('book sin bookingUrl → aplica CALENDLY_URL (default centralizado, no caller hardcode)', () => {
    let s = makeState();
    s = reduceOk(s, { type: 'capture_lead', intent: INTENT_CAPTURE });
    const id = s.leads[0].id;
    s = reduceOk(s, { type: 'qualify', leadId: id, score: 82, reason: 'IA: alto interés' });
    // El caller NO hardcodea la URL: el contrato agéntico usa el default central.
    s = reduceOk(s, { type: 'book', leadId: id });
    expect(s.leads[0].status).toBe('booked');
    expect(s.leads[0].bookingUrl).toBe('https://calendly.com/csch1305');
  });
});

// helpers de estado encadenado (construyen el lead con capturedAt propio)
function afterState(capturedAt: number = NOW): DemoState {
  return reduceOk(makeState(), { type: 'capture_lead', intent: { ...INTENT_CAPTURE, capturedAt } });
}

const INTENT_CAPTURE = INTENT;
