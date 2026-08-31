import { describe, it, expect } from 'vitest';
import { deriveKpi } from '../kpi';
import type { Cita, DemoState, Paciente } from '../types';

// rol: suite de KPIs derivados del estado . NUNCA guardados.
// Valida fórmulas: activos, no-show rate, revenue total, revenue/patient,
// citas programadas, citas completadas. Edge cases: vacío, división por cero.

const NOW = 1_700_000_000_000;

function makePaciente(id: string, estado: Paciente['estado'], overrides: Partial<Paciente> = {}): Paciente {
 return {
 id,
 nombre: 'Test',
 rut: '12.345.678-9',
 email: 't@example.com',
 telefono: '+56 9 1234 5678',
 ultimaVisita: '2026-08-01',
 tratamiento: 'Limpieza',
 estado,
 revenueTotal: 0,
 citasProgramadas: 0,
 noShows: 0,
 ultimaCita: '2026-08-01',
 createdAt: NOW,
 updatedAt: NOW,
 ...overrides,
 };
}

function makeCita(id: string, estado: Cita['estado'], valor: number, overrides: Partial<Cita> = {}): Cita {
 return {
 id,
 pacienteId: 'P1',
 fecha: '2026-08-01',
 tratamiento: 'Limpieza',
 estado,
 valor,
 createdAt: NOW,
 updatedAt: NOW,
 ...overrides,
 };
}

function makeState(pacientes: Paciente[] = [], citas: Cita[] = []): DemoState {
 return { version: 1, pacientes, citas, pacienteCounter: pacientes.length, citaCounter: citas.length, seeded: false };
}

describe('deriveKpi — 6 KPIs derivados (, §7.2)', () => {
 it('estado vacío → todos los KPIs en 0 (sin NaN ni negativos)', () => {
 const k = deriveKpi(makeState());
 expect(k).toEqual({
 activePatients: 0,
 noShowRate: 0,
 totalRevenue: 0,
 revenuePerPatient: 0,
 scheduledAppointments: 0,
 completedAppointments: 0,
 });
 });

 it('activePatients cuenta solo pacientes con estado activo', () => {
 const s = makeState([
 makePaciente('P1', 'activo'),
 makePaciente('P2', 'activo'),
 makePaciente('P3', 'inactivo'),
 makePaciente('P4', 'pendiente'),
 ]);
 expect(deriveKpi(s).activePatients).toBe(2);
 });

 it('noShowRate = noShows / citasProgramadas × 100 (sobre pacientes)', () => {
 // 2 pacientes: P1 (4 programadas, 1 no-show), P2 (2 programadas, 0 no-show)
 const s = makeState([
 makePaciente('P1', 'activo', { citasProgramadas: 4, noShows: 1 }),
 makePaciente('P2', 'activo', { citasProgramadas: 2, noShows: 0 }),
 ]);
 // total programadas = 6, total no-shows = 1 → 1/6 = 16.67%
 expect(deriveKpi(s).noShowRate).toBeCloseTo(16.67, 1);
 });

 it('noShowRate con 0 citas programadas → 0 (sin división por cero)', () => {
 const s = makeState([makePaciente('P1', 'activo', { citasProgramadas: 0, noShows: 0 })]);
 expect(deriveKpi(s).noShowRate).toBe(0);
 });

 it('totalRevenue = Σ valor de citas completed', () => {
 const s = makeState([], [
 makeCita('C1', 'completed', 120),
 makeCita('C2', 'completed', 400),
 makeCita('C3', 'confirmed', 350), // no cuenta
 makeCita('C4', 'no_show', 180), // no cuenta
 ]);
 expect(deriveKpi(s).totalRevenue).toBe(520);
 });

 it('revenuePerPatient = totalRevenue / activePatients', () => {
 const s = makeState( [makePaciente('P1', 'activo'), makePaciente('P2', 'activo')],
 [makeCita('C1', 'completed', 500), makeCita('C2', 'completed', 500)],
);
 // 1000 / 2 = 500
 expect(deriveKpi(s).revenuePerPatient).toBe(500);
 });

 it('revenuePerPatient con 0 pacientes activos → 0 (sin división por cero)', () => {
 const s = makeState([], [makeCita('C1', 'completed', 500)]);
 expect(deriveKpi(s).revenuePerPatient).toBe(0);
 });

 it('scheduledAppointments cuenta citas scheduled + confirmed', () => {
 const s = makeState([], [
 makeCita('C1', 'scheduled', 0),
 makeCita('C2', 'confirmed', 0),
 makeCita('C3', 'completed', 0),
 makeCita('C4', 'no_show', 0),
 makeCita('C5', 'cancelled', 0),
 ]);
 expect(deriveKpi(s).scheduledAppointments).toBe(2);
 });

 it('completedAppointments cuenta citas completed', () => {
 const s = makeState([], [
 makeCita('C1', 'completed', 0),
 makeCita('C2', 'completed', 0),
 makeCita('C3', 'confirmed', 0),
 ]);
 expect(deriveKpi(s).completedAppointments).toBe(2);
 });

 it('los KPIs nunca son negativos (doble defensa ante datos corruptos)', () => {
 const s = makeState( [makePaciente('P1', 'activo', { citasProgramadas: -5, noShows: -2 })],
 [makeCita('C1', 'completed', -100)],
);
 const k = deriveKpi(s);
 for (const v of Object.values(k)) {
 expect(v).toBeGreaterThanOrEqual(0);
 }
 });
});
