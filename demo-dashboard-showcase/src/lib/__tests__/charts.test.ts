import { describe, it, expect } from 'vitest';
import { revenueByMonth, appointmentsByMonth, revenueByTreatment } from '../charts';
import type { Cita, DemoState, Paciente } from '../types';

// rol: suite de charts data derivada del estado . NUNCA guardados.
// Valida: bar por mes (revenue + citas) y donut por tratamiento (revenue).

const NOW = 1_700_000_000_000;

function makeCita(id: string, fecha: string, tratamiento: Cita['tratamiento'], estado: Cita['estado'], valor: number): Cita {
 return {
 id,
 pacienteId: 'P1',
 fecha,
 tratamiento,
 estado,
 valor,
 createdAt: NOW,
 updatedAt: NOW,
 };
}

function makeState(citas: Cita[] = []): DemoState {
 return { version: 1, pacientes: [], citas, pacienteCounter: 0, citaCounter: citas.length, seeded: false };
}

describe('revenueByMonth — bar chart 12 meses (, §7.3)', () => {
 it('agrega Σ valor de citas completed por mes (YYYY-MM), ordenado cronológico', () => {
 const s = makeState([
 makeCita('C1', '2026-08-18', 'Limpieza', 'completed', 120),
 makeCita('C2', '2026-08-12', 'Ortodoncia', 'completed', 400),
 makeCita('C3', '2026-07-28', 'Blanqueamiento', 'completed', 350),
 makeCita('C4', '2026-09-02', 'Limpieza', 'confirmed', 120), // no cuenta (no completed)
 ]);
 const data = revenueByMonth(s);
 expect(data).toEqual([
 { month: '2026-07', value: 350 },
 { month: '2026-08', value: 520 },
 ]);
 });

 it('estado vacío → array vacío', () => {
 expect(revenueByMonth(makeState())).toEqual([]);
 });

 it('solo cuenta citas completed (no scheduled/confirmed/no_show/cancelled)', () => {
 const s = makeState([
 makeCita('C1', '2026-08-01', 'Limpieza', 'completed', 100),
 makeCita('C2', '2026-08-02', 'Limpieza', 'no_show', 200),
 makeCita('C3', '2026-08-03', 'Limpieza', 'cancelled', 300),
 ]);
 expect(revenueByMonth(s)).toEqual([{ month: '2026-08', value: 100 }]);
 });
});

describe('appointmentsByMonth — bar chart citas por mes (, §7.3)', () => {
 it('cuenta todas las citas por mes (independiente del estado)', () => {
 const s = makeState([
 makeCita('C1', '2026-08-01', 'Limpieza', 'completed', 0),
 makeCita('C2', '2026-08-02', 'Limpieza', 'no_show', 0),
 makeCita('C3', '2026-07-03', 'Limpieza', 'confirmed', 0),
 ]);
 const data = appointmentsByMonth(s);
 expect(data).toEqual([
 { month: '2026-07', value: 1 },
 { month: '2026-08', value: 2 },
 ]);
 });

 it('estado vacío → array vacío', () => {
 expect(appointmentsByMonth(makeState())).toEqual([]);
 });
});

describe('revenueByTreatment — donut chart por tratamiento (, §7.3)', () => {
 it('agrega Σ valor de citas completed por tratamiento', () => {
 const s = makeState([
 makeCita('C1', '2026-08-01', 'Limpieza', 'completed', 120),
 makeCita('C2', '2026-08-02', 'Limpieza', 'completed', 120),
 makeCita('C3', '2026-08-03', 'Ortodoncia', 'completed', 400),
 makeCita('C4', '2026-08-04', 'Implante', 'confirmed', 1800), // no cuenta
 ]);
 const data = revenueByTreatment(s);
 expect(data).toEqual([
 { treatment: 'Limpieza', value: 240 },
 { treatment: 'Ortodoncia', value: 400 },
 ]);
 });

 it('estado vacío → array vacío', () => {
 expect(revenueByTreatment(makeState())).toEqual([]);
 });

 it('solo cuenta citas completed', () => {
 const s = makeState([
 makeCita('C1', '2026-08-01', 'Limpieza', 'completed', 100),
 makeCita('C2', '2026-08-02', 'Limpieza', 'no_show', 200),
 ]);
 expect(revenueByTreatment(s)).toEqual([{ treatment: 'Limpieza', value: 100 }]);
 });
});
