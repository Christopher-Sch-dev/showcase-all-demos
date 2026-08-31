import type { DemoState, Kpi } from './types';

/**
 * KPIs derivados del ESTADO (invariante: nunca se guardan independientes).
 * Funciones puras: deriveKpi(demoState) → Kpi.
 */

// rol: fracción (0-1) de un conteo sobre el total; total 0 → 0.
function rateOf(numerator: number, total: number): number {
  return total === 0 ? 0 : numerator / total;
}

// rol: promedio en segundos de (respondedAt - capturedAt) sobre los que respondieron; sin respuestas → 0.
function speedToSec(leads: DemoState['leads']): number {
  const responded = leads.filter((l) => typeof l.respondedAt === 'number');
  if (responded.length === 0) return 0;
  const totalMs = responded.reduce((s, l) => s + ((l.respondedAt ?? 0) - l.capturedAt), 0);
  return totalMs / responded.length / 1000;
}

/** Deriva todos los KPIs del estado. Nunca negativos; tasas derivadas (0-1). */
export function deriveKpi(state: DemoState): Kpi {
  const { leads } = state;
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter((l) => l.status === 'qualified' || l.status === 'booked').length;
  const bookedLeads = leads.filter((l) => l.status === 'booked').length;
  const under60 = leads.filter(
    (l) => typeof l.respondedAt === 'number' && l.respondedAt - l.capturedAt < 60_000,
  ).length;

  const kpi: Kpi = {
    totalLeads,
    qualifiedLeads,
    bookedLeads,
    avgSpeedToLeadSec: speedToSec(leads),
    responseRateUnder60: rateOf(under60, totalLeads),
    bookingRate: rateOf(bookedLeads, totalLeads),
  };

  // invariante: KPI nunca negativo (doble defensa ante datos corruptos).
  for (const key of Object.keys(kpi) as (keyof Kpi)[]) {
    if (kpi[key] < 0) kpi[key] = 0 as never;
  }
  return kpi;
}
