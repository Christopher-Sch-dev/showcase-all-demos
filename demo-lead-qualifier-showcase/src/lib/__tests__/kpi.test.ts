import { describe, it, expect } from 'vitest';
import { deriveKpi } from '../kpi';
import type { DemoState, Lead } from '../types';

// rol: fixture mínimo de estado para pruebas puras de deriveKpi (KPI NUNCA guardados)
function makeLead(overrides: Partial<Lead>): Lead {
  return {
    id: 'l1',
    status: 'new',
    niche: 'realestate',
    source: 'form',
    name: 'Test',
    email: 't@example.com',
    phone: '555',
    topic: 'looking for 4br house',
    urgency: 'normal',
    capturedAt: 0,
    timeline: [],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function makeState(leads: Lead[]): DemoState {
  return { version: 1, leads, leadCounter: leads.length, seeded: false };
}

describe('deriveKpi — invariantes base', () => {
  it('estado vacío → todos los KPIs en cero y no negativos', () => {
    const k = deriveKpi(makeState([]));
    expect(k.totalLeads).toBe(0);
    expect(k.qualifiedLeads).toBe(0);
    expect(k.bookedLeads).toBe(0);
    expect(k.avgSpeedToLeadSec).toBe(0);
    expect(k.responseRateUnder60).toBe(0);
    expect(k.bookingRate).toBe(0);
    expect(Object.values(k).every((v) => typeof v === 'number' && v >= 0)).toBe(true);
  });
});

describe('deriveKpi — conteos de funnel', () => {
  it('cuenta cada etapa por umbral del funnel (new → qualified → booked)', () => {
    const leads: Lead[] = [
      makeLead({ id: 'a', status: 'new' }),
      makeLead({ id: 'b', status: 'qualified', qualification: { score: 80, reason: 'ok' } }),
      makeLead({ id: 'c', status: 'booked', qualification: { score: 90, reason: 'ok' } }),
    ];
    const k = deriveKpi(makeState(leads));
    expect(k.totalLeads).toBe(3);
    expect(k.qualifiedLeads).toBe(2); // qualified + booked (alcanzaron al menos qualified)
    expect(k.bookedLeads).toBe(1);
  });
});

describe('deriveKpi — avg speed-to-lead', () => {
  it('promedio en segundos de (respondedAt - capturedAt); sin respuestas → 0', () => {
    const k = deriveKpi(makeState([
      makeLead({ id: 'a', capturedAt: 0, respondedAt: 30_000 }),   // 30s
      makeLead({ id: 'b', capturedAt: 0, respondedAt: 90_000 }),   // 90s
      makeLead({ id: 'c', capturedAt: 0, respondedAt: 60_000 }),   // 60s
      makeLead({ id: 'd', capturedAt: 0 }),                          // sin respuesta
    ]));
    // (30 + 90 + 60) / 3 = 60s
    expect(k.avgSpeedToLeadSec).toBeCloseTo(60, 2);

    const none = deriveKpi(makeState([makeLead({ id: 'a' })]));
    expect(none.avgSpeedToLeadSec).toBe(0);
  });
});

describe('deriveKpi — tasas derivadas', () => {
  it('responseRateUnder60 = leads respondidos en <60s / totalLeads', () => {
    const leads: Lead[] = [
      makeLead({ id: 'a', capturedAt: 0, respondedAt: 45_000 }),   // <60s ✓
      makeLead({ id: 'b', capturedAt: 0, respondedAt: 90_000 }),   // no
      makeLead({ id: 'c', capturedAt: 0, respondedAt: 20_000 }),   // <60s ✓
      makeLead({ id: 'd', capturedAt: 0 }),                          // sin respuesta
    ];
    const k = deriveKpi(makeState(leads));
    expect(k.responseRateUnder60).toBeCloseTo(2 / 4, 5);
  });

  it('bookingRate = bookedLeads / totalLeads; sin leads → 0', () => {
    const leads: Lead[] = [
      makeLead({ id: 'a', status: 'booked' }),
      makeLead({ id: 'b', status: 'booked' }),
      makeLead({ id: 'c', status: 'new' }),
    ];
    const k = deriveKpi(makeState(leads));
    expect(k.bookingRate).toBeCloseTo(2 / 3, 5);
    expect(deriveKpi(makeState([])).bookingRate).toBe(0);
  });
});
