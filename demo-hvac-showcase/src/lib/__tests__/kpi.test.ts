import { describe, it, expect } from 'vitest';
import { deriveKpi } from '../kpi';
import type { DemoState, Lead } from '../types';

// rol: fixture mínimo de estado para pruebas puras de deriveKpi
function makeLead(overrides: Partial<Lead>): Lead {
  return {
    id: 'l1',
    status: 'lead',
    customerName: 'Test',
    customerPhone: '555',
    address: 'Addr',
    city: 'City',
    issue: 'no AC',
    zone: 'north',
    priority: 'normal',
    capturedAt: 0,
    timeline: [],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function makeState(leads: Lead[]): DemoState {
  return { version: 1, leads, technicians: [], callCounter: 0, seeded: false };
}

describe('deriveKpi — invariantes base', () => {
  it('estado vacío → todos los KPIs en cero y no negativos', () => {
    const k = deriveKpi(makeState([]));
    expect(k.totalCallsCaptured).toBe(0);
    expect(k.qualifiedLeads).toBe(0);
    expect(k.bookedJobs).toBe(0);
    expect(k.dispatchedJobs).toBe(0);
    expect(k.completedJobs).toBe(0);
    expect(k.invoicedJobs).toBe(0);
    expect(k.noShow).toBe(0);
    expect(k.canceled).toBe(0);
    expect(k.recoveredRevenue).toBe(0);
    expect(k.avgTicket).toBe(0);
    expect(k.avgSpeedToLeadMin).toBe(0);
    expect(k.conversionRate).toBe(0);
    expect(Object.values(k).every((v) => typeof v === 'number' && v >= 0)).toBe(true);
  });

  it('nunca produce KPIs negativos con datos corruptos (invoiceTotal negativo)', () => {
    const k = deriveKpi(makeState([
      makeLead({ status: 'invoiced', invoiceTotal: -500 }),
    ]));
    expect(k.recoveredRevenue).toBeGreaterThanOrEqual(0);
    expect(k.avgTicket).toBeGreaterThanOrEqual(0);
  });
});

describe('deriveKpi — conteos de funnel', () => {
  it('cuenta cada etapa por umbral del funnel (lead→…→invoiced)', () => {
    const leads: Lead[] = [
      makeLead({ id: 'a', status: 'lead' }),
      makeLead({ id: 'b', status: 'qualified', qualification: { score: 80, reason: 'ok' } }),
      makeLead({ id: 'c', status: 'booked', qualification: { score: 90, reason: 'ok' } }),
      makeLead({ id: 'd', status: 'dispatched', qualification: { score: 70, reason: 'ok' } }),
      makeLead({ id: 'e', status: 'invoiced', qualification: { score: 60, reason: 'ok' }, invoiceTotal: 2200 }),
    ];
    const k = deriveKpi(makeState(leads));
    expect(k.totalCallsCaptured).toBe(5);
    expect(k.qualifiedLeads).toBe(4);
    expect(k.bookedJobs).toBe(3);
    expect(k.dispatchedJobs).toBe(2);
    expect(k.completedJobs).toBe(1);
    expect(k.invoicedJobs).toBe(1);
  });

  it('no_show y canceled se cuentan aparte y NO aportan al revenue', () => {
    const leads: Lead[] = [
      makeLead({ id: 'a', status: 'no_show' }),
      makeLead({ id: 'b', status: 'canceled' }),
      makeLead({ id: 'c', status: 'invoiced', invoiceTotal: 2200 }),
    ];
    const k = deriveKpi(makeState(leads));
    expect(k.noShow).toBe(1);
    expect(k.canceled).toBe(1);
    expect(k.totalCallsCaptured).toBe(3);
    // el único que aporta al funnel forward es el invoiced (pasó por qualified/booked)
    expect(k.qualifiedLeads).toBe(1);
    expect(k.bookedJobs).toBe(1);
    expect(k.invoicedJobs).toBe(1);
    expect(k.recoveredRevenue).toBe(2200);
  });
});

describe('deriveKpi — revenue y tickets', () => {
  it('recoveredRevenue = suma de invoiceTotal de los invoiced', () => {
    const leads: Lead[] = [
      makeLead({ id: 'a', status: 'invoiced', invoiceTotal: 1500 }),
      makeLead({ id: 'b', status: 'invoiced', invoiceTotal: 700 }),
      makeLead({ id: 'c', status: 'completed', invoiceTotal: 999 }),
    ];
    const k = deriveKpi(makeState(leads));
    expect(k.recoveredRevenue).toBe(2200);
    expect(k.invoicedJobs).toBe(2);
  });

  it('avgTicket = promedio de invoiceTotal de invoiced; sin invoiced → 0', () => {
    const withRevenue = deriveKpi(makeState([
      makeLead({ id: 'a', status: 'invoiced', invoiceTotal: 2000 }),
      makeLead({ id: 'b', status: 'invoiced', invoiceTotal: 1000 }),
    ]));
    expect(withRevenue.avgTicket).toBe(1500);

    const noRevenue = deriveKpi(makeState([makeLead({ id: 'a', status: 'completed' })]));
    expect(noRevenue.avgTicket).toBe(0);
  });
});

describe('deriveKpi — avg speed-to-lead', () => {
  it('promedio en minutos de (respondedAt - capturedAt); sin respuestas → 0', () => {
    const k = deriveKpi(makeState([
      makeLead({ id: 'a', capturedAt: 0, respondedAt: 120_000 }),   // 2 min
      makeLead({ id: 'b', capturedAt: 0, respondedAt: 300_000 }),   // 5 min
      makeLead({ id: 'c', capturedAt: 0, respondedAt: 60_000 }),    // 1 min
      makeLead({ id: 'd', capturedAt: 0 }),                          // sin respuesta
    ]));
    expect(k.avgSpeedToLeadMin).toBeCloseTo(2.6667, 2);

    const none = deriveKpi(makeState([makeLead({ id: 'a' })]));
    expect(none.avgSpeedToLeadMin).toBe(0);
  });
});

describe('deriveKpi — conversión derivada', () => {
  it('conversionRate = invoiced / totalCallsCaptured (fracción 0-1)', () => {
    const leads: Lead[] = [
      makeLead({ id: 'a', status: 'invoiced', invoiceTotal: 2200 }),
      makeLead({ id: 'b', status: 'invoiced', invoiceTotal: 2200 }),
      makeLead({ id: 'c', status: 'canceled' }),
      makeLead({ id: 'd', status: 'lead' }),
    ];
    const k = deriveKpi(makeState(leads));
    expect(k.conversionRate).toBeCloseTo(2 / 4, 5);
  });
});
