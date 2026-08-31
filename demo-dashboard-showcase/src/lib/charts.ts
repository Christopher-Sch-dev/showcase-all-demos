import type { Cita, DemoState, Tratamiento } from './types';

/**
 * CHARTS DATA — agregaciones derivadas del estado . NUNCA guardadas.
 * Funciones puras: revenueByMonth, appointmentsByMonth, revenueByTreatment.
 * - revenueByMonth: Σ valor citas completed por mes (bar chart 12 meses)
 * - appointmentsByMonth: count citas por mes (bar/line chart)
 * - revenueByTreatment: Σ valor citas completed por tratamiento (donut chart)
 */

/** Punto de un chart de barras por mes. */
export interface MonthPoint {
 month: string; // YYYY-MM
 value: number;
}

/** Punto de un donut por tratamiento. */
export interface TreatmentPoint {
 treatment: Tratamiento;
 value: number;
}

// rol: extraer la clave de mes (YYYY-MM) de una fecha YYYY-MM-DD.
function monthKey(fecha: string): string {
 return fecha.slice(0, 7);
}

// rol: agregar citas completed por clave (mes o tratamiento), ordenado por clave.
function aggregateCompleted<T extends string>( citas: Cita[],
 keyOf: (c: Cita) => T,
): { key: T; value: number }[] {
 const map = new Map<T, number>();
 for (const c of citas) {
 if (c.estado !== 'completed') continue;
 const key = keyOf(c);
 map.set(key, (map.get(key) ?? 0) + c.valor);
 }
 return [...map.entries()]
 .map(([key, value]) => ({ key, value }))
 .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
}

/** Revenue por mes (bar chart): Σ valor citas completed, ordenado cronológico. */
export function revenueByMonth(state: DemoState): MonthPoint[] {
 return aggregateCompleted(state.citas, (c) => monthKey(c.fecha)).map(({ key, value }) => ({
 month: key,
 value,
 }));
}

/** Citas por mes (bar/line chart): count citas, ordenado cronológico. */
export function appointmentsByMonth(state: DemoState): MonthPoint[] {
 const map = new Map<string, number>();
 for (const c of state.citas) {
 const key = monthKey(c.fecha);
 map.set(key, (map.get(key) ?? 0) + 1);
 }
 return [...map.entries()]
 .map(([month, value]) => ({ month, value }))
 .sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0));
}

/** Revenue por tratamiento (donut chart): Σ valor citas completed. */
export function revenueByTreatment(state: DemoState): TreatmentPoint[] {
 return aggregateCompleted(state.citas, (c) => c.tratamiento).map(({ key, value }) => ({
 treatment: key,
 value,
 }));
}
