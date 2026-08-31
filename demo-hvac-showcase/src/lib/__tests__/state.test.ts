import { describe, it, expect } from 'vitest';
import { reduce, type Action, type NewLeadInput } from '../state';
import { deriveKpi } from '../kpi';
import { createSeedState } from '../seed';
import type { DemoState, Lead, LeadStatus } from '../types';

const NOW = 1_700_000_000_000;

const input: NewLeadInput = {
  customerName: 'John Doe',
  customerPhone: '555-0100',
  address: '123 Main St',
  city: 'Springfield',
  issue: 'No AC, urgent',
  zone: 'north',
  priority: 'urgent',
};

function makeLead(id: string, status: LeadStatus, overrides: Partial<Lead> = {}): Lead {
  return {
    id,
    status,
    customerName: 'Test Customer',
    customerPhone: '555-0000',
    address: '1 Test St',
    city: 'Testville',
    issue: 'Furnace not heating',
    zone: 'north',
    priority: 'normal',
    capturedAt: NOW - 1000,
    respondedAt: NOW - 500,
    timeline: [{ status, at: NOW - 1000 }],
    createdAt: NOW - 1000,
    updatedAt: NOW - 1000,
    ...overrides,
  };
}

function makeState(leads: Lead[]): DemoState {
  return {
    version: 1,
    leads,
    technicians: createSeedState().technicians,
    callCounter: 100,
    seeded: true,
  };
}

/** Aplica la acción y afirma que produjo cambio (GREEN esperado). */
function reduceOk(state: DemoState, action: Action): DemoState {
  const r = reduce(state, action, NOW);
  expect(r.changed).toBe(true);
  return r.state;
}

describe('captureCall', () => {
  it('crea un lead nuevo en estado lead al top del queue con timeline y capturedAt', () => {
    const s = makeState([]);
    const after = reduceOk(s, { type: 'captureCall', payload: input });
    expect(after.leads).toHaveLength(1);
    const lead = after.leads[0];
    expect(lead.status).toBe('lead');
    expect(lead.capturedAt).toBe(NOW);
    expect(lead.timeline).toHaveLength(1);
    expect(lead.timeline[0].status).toBe('lead');
    expect(lead.timeline[0].at).toBe(NOW);
    expect(lead.customerName).toBe('John Doe');
    expect(lead.zone).toBe('north');
  });

  it('incrementa callCounter y no muta el estado original', () => {
    const s = makeState([]);
    const after = reduceOk(s, { type: 'captureCall', payload: input });
    expect(after.callCounter).toBe(s.callCounter + 1);
    expect(s.leads).toHaveLength(0);
  });
});

describe('camino forward completo lead → invoiced', () => {
  it('recorre todas las transiciones válidas del funnel', () => {
    let s = makeState([]);
    s = reduceOk(s, { type: 'captureCall', payload: input });
    const id = s.leads[0].id;

    s = reduceOk(s, { type: 'qualify', id, payload: { score: 85, reason: 'Needs AC repair' } });
    let lead = s.leads[0];
    expect(lead.status).toBe('qualified');
    expect(lead.qualification?.score).toBe(85);
    expect(lead.respondedAt).toBe(NOW);

    s = reduceOk(s, { type: 'book', id, payload: { scheduledDate: '2026-08-21', scheduledTime: '09:00' } });
    lead = s.leads[0];
    expect(lead.status).toBe('booked');
    expect(lead.bookedAt).toBe(NOW);

    s = reduceOk(s, { type: 'assignTechnician', id, technicianId: 'tech-north' });
    lead = s.leads[0];
    expect(lead.status).toBe('scheduled');
    expect(lead.technicianId).toBe('tech-north');

    s = reduceOk(s, { type: 'dispatch', id, etaMinutes: 25 });
    lead = s.leads[0];
    expect(lead.status).toBe('dispatched');
    expect(lead.etaMinutes).toBe(25);
    expect(lead.technicianId).toBe('tech-north');

    s = reduceOk(s, { type: 'startJob', id });
    lead = s.leads[0];
    expect(lead.status).toBe('in_progress');

    s = reduceOk(s, { type: 'completeJob', id, note: 'Replaced capacitor' });
    lead = s.leads[0];
    expect(lead.status).toBe('completed');
    expect(lead.completionNote).toBe('Replaced capacitor');

    s = reduceOk(s, { type: 'invoice', id, total: 2200 });
    lead = s.leads[0];
    expect(lead.status).toBe('invoiced');
    expect(lead.invoiceTotal).toBe(2200);
    expect(lead.invoiceId).toBeDefined();

    // timeline refleja cada estado recorrido
    const statuses = lead.timeline.map((e) => e.status);
    expect(statuses).toEqual([
      'lead',
      'qualified',
      'booked',
      'scheduled',
      'dispatched',
      'in_progress',
      'completed',
      'invoiced',
    ]);
  });
});

describe('guards e invariantes', () => {
  it('un lead sin técnico NO se despacha (dominio guard)', () => {
    const s = makeState([makeLead('L1', 'scheduled')]);
    const r = reduce(s, { type: 'dispatch', id: 'L1', etaMinutes: 20 }, NOW);
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/technician/i);
    expect(r.state).toBe(s); // sin cambio: misma referencia
  });

  it('una transición inválida (qualified → dispatch) no cambia el estado', () => {
    const s = makeState([makeLead('L1', 'qualified', { qualification: { score: 80, reason: 'ok' } })]);
    const r = reduce(s, { type: 'dispatch', id: 'L1', etaMinutes: 15 }, NOW);
    expect(r.changed).toBe(false);
    expect(r.state).toBe(s);
  });

  it('no permite facturar un lead que aún no está completed (lead → invoice inválido)', () => {
    const s = makeState([makeLead('L1', 'qualified', { qualification: { score: 90, reason: 'ok' } })]);
    const r = reduce(s, { type: 'invoice', id: 'L1', total: 1000 }, NOW);
    expect(r.changed).toBe(false);
    expect(r.state).toBe(s);
  });

  it('invoice es idempotente: facturar dos veces no cambia ni el total', () => {
    let s = makeState([makeLead('L1', 'completed', { completionNote: 'done' })]);
    s = reduceOk(s, { type: 'invoice', id: 'L1', total: 1200 });
    const first = s.leads[0];
    expect(first.status).toBe('invoiced');
    const r = reduce(s, { type: 'invoice', id: 'L1', total: 9999 }, NOW);
    expect(r.changed).toBe(false);
    expect(r.state.leads[0].invoiceTotal).toBe(1200);
  });

  it('rechaza invoiceTotal negativo (precio/KPI nunca negativo)', () => {
    const s = makeState([makeLead('L1', 'completed')]);
    const r = reduce(s, { type: 'invoice', id: 'L1', total: -50 }, NOW);
    expect(r.changed).toBe(false);
  });

  it('booked → no_show es válido', () => {
    const s = makeState([makeLead('L1', 'booked')]);
    const r = reduce(s, { type: 'markNoShow', id: 'L1' }, NOW);
    expect(r.changed).toBe(true);
    expect(r.state.leads[0].status).toBe('no_show');
  });

  it('booked → canceled es válido', () => {
    const s = makeState([makeLead('L2', 'booked')]);
    const r = reduce(s, { type: 'cancel', id: 'L2' }, NOW);
    expect(r.changed).toBe(true);
    expect(r.state.leads[0].status).toBe('canceled');
  });

  it('scheduled → canceled es válido', () => {
    const s = makeState([makeLead('L3', 'scheduled', { technicianId: 'tech-north' })]);
    const r = reduce(s, { type: 'cancel', id: 'L3' }, NOW);
    expect(r.changed).toBe(true);
    expect(r.state.leads[0].status).toBe('canceled');
  });

  it('no permite cancelar desde qualified (solo desde booked/scheduled — invariante)', () => {
    const s = makeState([makeLead('L4', 'qualified', { qualification: { score: 70, reason: 'ok' } })]);
    const r = reduce(s, { type: 'cancel', id: 'L4' }, NOW);
    expect(r.changed).toBe(false);
    expect(r.state).toBe(s);
  });

  it('no permite asignar un técnico inexistente', () => {
    const s = makeState([makeLead('L5', 'booked')]);
    const r = reduce(s, { type: 'assignTechnician', id: 'L5', technicianId: 'no-such-tech' }, NOW);
    expect(r.changed).toBe(false);
  });

  it('no permite asignar un técnico inactivo', () => {
    const s = makeState([makeLead('L6', 'booked')]);
    const r = reduce(s, { type: 'assignTechnician', id: 'L6', technicianId: 'tech-north' }, NOW);
    // tech-north existe y está activo → permitido; probar inactivo: clonamos y lo apagamos
    const withInactive: DemoState = {
      ...s,
      technicians: s.technicians.map((t) => (t.id === 'tech-north' ? { ...t, active: false } : t)),
    };
    const r2 = reduce(withInactive, { type: 'assignTechnician', id: 'L6', technicianId: 'tech-north' }, NOW);
    expect(r2.changed).toBe(false);
    expect(r2.reason).toMatch(/inactiv/i);
  });

  it('no permite asignar un técnico de OTRA zona (guard de zona AC-3)', () => {
    // lead en zona north, asignar tech-south (zona south) → rechazado
    const s = makeState([makeLead('L7', 'booked', { zone: 'north' })]);
    const r = reduce(s, { type: 'assignTechnician', id: 'L7', technicianId: 'tech-south' }, NOW);
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/zona/i);
  });

  it('permite asignar un técnico de la MISMA zona', () => {
    const s = makeState([makeLead('L8', 'booked', { zone: 'north' })]);
    const r = reduce(s, { type: 'assignTechnician', id: 'L8', technicianId: 'tech-north' }, NOW);
    expect(r.changed).toBe(true);
    expect(r.state.leads[0].status).toBe('scheduled');
    expect(r.state.leads[0].technicianId).toBe('tech-north');
  });

  it('rechaza book sin fecha u hora (spec AC-2: Job con fecha/hora)', () => {
    const s = makeState([makeLead('L9', 'qualified', { qualification: { score: 80, reason: 'ok' } })]);
    const r = reduce(s, { type: 'book', id: 'L9', payload: { scheduledDate: '', scheduledTime: '09:00' } }, NOW);
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/fecha/i);
  });

  it('rechaza completeJob con nota vacía (spec AC-4: nota de cierre)', () => {
    const s = makeState([makeLead('L10', 'in_progress')]);
    const r = reduce(s, { type: 'completeJob', id: 'L10', note: '   ' }, NOW);
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/nota/i);
  });

  it('no permite marcar no_show desde dispatched (solo booked/scheduled — invariante)', () => {
    const s = makeState([makeLead('L11', 'dispatched', { technicianId: 'tech-north' })]);
    const r = reduce(s, { type: 'markNoShow', id: 'L11' }, NOW);
    expect(r.changed).toBe(false);
  });

  it('un lead inexistente devuelve no-cambio con razón clara', () => {
    const s = makeState([]);
    const r = reduce(s, { type: 'cancel', id: 'no-such-lead' }, NOW);
    expect(r.changed).toBe(false);
    expect(r.reason).toMatch(/no encontrado/i);
  });

  it('reset restaura el seed baseline', () => {
    let s = makeState([makeLead('L1', 'completed')]);
    s = reduceOk(s, { type: 'invoice', id: 'L1', total: 100 });
    const seeded = createSeedState();
    const r = reduce(s, { type: 'reset' }, NOW);
    expect(r.changed).toBe(true);
    expect(r.state.leads).toEqual(seeded.leads);
    expect(r.state.technicians).toEqual(seeded.technicians);
    expect(r.state.seeded).toBe(true);
  });
});

describe('deriveKpi — KPI deriva del estado', () => {
  it('sobre el seed baseline cuenta los 5 qualified y sin revenue', () => {
    const k = deriveKpi(createSeedState());
    expect(k.totalCallsCaptured).toBe(5);
    expect(k.qualifiedLeads).toBe(5);
    expect(k.bookedJobs).toBe(0);
    expect(k.dispatchedJobs).toBe(0);
    expect(k.completedJobs).toBe(0);
    expect(k.invoicedJobs).toBe(0);
    expect(k.recoveredRevenue).toBe(0);
    expect(k.conversionRate).toBe(0);
    expect(k.avgSpeedToLeadMin).toBeGreaterThanOrEqual(0);
  });

  it('deriva revenue, avgTicket y conversión de los leads facturados', () => {
    const s: DemoState = {
      version: 1,
      technicians: createSeedState().technicians,
      callCounter: 10,
      seeded: true,
      leads: [
        makeLead('a', 'invoiced', { invoiceTotal: 2000 }),
        makeLead('b', 'invoiced', { invoiceTotal: 1500 }),
        makeLead('c', 'completed', { completionNote: 'ok' }),
        makeLead('d', 'dispatched', { technicianId: 'tech-north' }),
        makeLead('e', 'lead'),
      ],
    };
    const k = deriveKpi(s);
    expect(k.totalCallsCaptured).toBe(5);
    expect(k.qualifiedLeads).toBe(4);
    expect(k.bookedJobs).toBe(4);
    expect(k.dispatchedJobs).toBe(4);
    expect(k.completedJobs).toBe(3);
    expect(k.invoicedJobs).toBe(2);
    expect(k.recoveredRevenue).toBe(3500);
    expect(k.avgTicket).toBe(1750);
    expect(k.conversionRate).toBeCloseTo(2 / 5);
  });

  it('el revenue derivado nunca es negativo', () => {
    const k = deriveKpi(makeState([makeLead('a', 'invoiced', { invoiceTotal: 0 })]));
    expect(k.recoveredRevenue).toBeGreaterThanOrEqual(0);
  });
});
