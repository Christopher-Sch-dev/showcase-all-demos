import type { DemoState, Kpi } from './types';

/**
 * KPIs derivados del ESTADO (invariante: nunca se guardan independientes —).
 * Funciones puras: deriveKpi(demoState) → Kpi.
 * Fórmulas :
 * - activePatients: count(estado='activo')
 * - noShowRate: Σ noShows / Σ citasProgramadas × 100 (%)
 * - totalRevenue: Σ valor citas completed
 * - revenuePerPatient: totalRevenue / activePatients
 * - scheduledAppointments: count(estado scheduled|confirmed)
 * - completedAppointments: count(estado completed)
 */

// rol: fracción (0-1) de un conteo sobre el total; total 0 → 0 (sin división por cero).
function rateOf(numerator: number, total: number): number {
 return total === 0 ? 0 : numerator / total;
}

/** Deriva todos los KPIs del estado. Nunca negativos; tasas derivadas (0-1 → %). */
export function deriveKpi(state: DemoState): Kpi {
 const { pacientes, citas } = state;

 const activePatients = pacientes.filter((p) => p.estado === 'activo').length;

 // no-show rate sobre los campos financieros del paciente.
 const totalProgramadas = pacientes.reduce((s, p) => s + p.citasProgramadas, 0);
 const totalNoShows = pacientes.reduce((s, p) => s + p.noShows, 0);
 const noShowRate = rateOf(totalNoShows, totalProgramadas) * 100;

 const totalRevenue = citas
 .filter((c) => c.estado === 'completed')
 .reduce((s, c) => s + c.valor, 0);

 const revenuePerPatient = activePatients === 0 ? 0 : totalRevenue / activePatients;

 const scheduledAppointments = citas.filter( (c) => c.estado === 'scheduled' || c.estado === 'confirmed',
).length;

 const completedAppointments = citas.filter((c) => c.estado === 'completed').length;

 const kpi: Kpi = {
 activePatients,
 noShowRate,
 totalRevenue,
 revenuePerPatient,
 scheduledAppointments,
 completedAppointments,
 };

 // invariante: KPI nunca negativo (doble defensa ante datos corruptos).
 for (const key of Object.keys(kpi) as (keyof Kpi)[]) {
 if (kpi[key] < 0) kpi[key] = 0 as never;
 }
 return kpi;
}
