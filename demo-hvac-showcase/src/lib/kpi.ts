import type { DemoState, Kpi } from './types';

/**
 * KPIs derivados del ESTADO (invariante: nunca se guardan independientes).
 * Funciones puras: deriveKpi(demoState) → Kpi.
 */

// rol: contar leads que alcanzaron una etapa del funnel (por umbral de estado)
function stageCount(leads: DemoState['leads'], statuses: readonly string[]): number {
  return leads.reduce((n, l) => (statuses.includes(l.status) ? n + 1 : n), 0);
}

// rol: suma de invoiceTotal de los leads facturados (protege contra negativos)
function revenueOf(leads: DemoState['leads']): number {
  return leads
    .filter((l) => l.status === 'invoiced')
    .reduce((sum, l) => sum + Math.max(0, l.invoiceTotal ?? 0), 0);
}

// rol: promedio en minutos de (respondedAt - capturedAt) sobre los que respondieron
function avgSpeedToLeadMin(leads: DemoState['leads']): number {
  const responded = leads.filter((l) => typeof l.respondedAt === 'number');
  if (responded.length === 0) return 0;
  const totalMs = responded.reduce((s, l) => s + ((l.respondedAt ?? 0) - l.capturedAt), 0);
  return totalMs / responded.length / 60000;
}

/** Deriva todos los KPIs del estado. Nunca negativos; conversión derivada. */
export function deriveKpi(state: DemoState): Kpi {
  const { leads } = state;
  const invoiced = stageCount(leads, ['invoiced']);
  const totalCallsCaptured = leads.length;
  const recoveredRevenue = revenueOf(leads);

  const kpi: Kpi = {
    totalCallsCaptured,
    qualifiedLeads: stageCount(leads, ['qualified', 'booked', 'scheduled', 'dispatched', 'in_progress', 'completed', 'invoiced']),
    bookedJobs: stageCount(leads, ['booked', 'scheduled', 'dispatched', 'in_progress', 'completed', 'invoiced']),
    dispatchedJobs: stageCount(leads, ['dispatched', 'in_progress', 'completed', 'invoiced']),
    completedJobs: stageCount(leads, ['completed', 'invoiced']),
    invoicedJobs: invoiced,
    noShow: stageCount(leads, ['no_show']),
    canceled: stageCount(leads, ['canceled']),
    recoveredRevenue,
    avgTicket: invoiced === 0 ? 0 : recoveredRevenue / invoiced,
    avgSpeedToLeadMin: avgSpeedToLeadMin(leads),
    conversionRate: totalCallsCaptured === 0 ? 0 : invoiced / totalCallsCaptured,
  };

  // invariante: KPI nunca negativo (doble defensa ante datos corruptos)
  for (const key of Object.keys(kpi) as (keyof Kpi)[]) {
    if (kpi[key] < 0) kpi[key] = 0 as never;
  }
  return kpi;
}
