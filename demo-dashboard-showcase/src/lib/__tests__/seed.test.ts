import { describe, it, expect } from 'vitest';
import { createSeedState, seedPacientes, seedCitas } from '../seed';
import type { CitaStatus, PacienteEstado } from '../types';

// rol: suite del seed realista dental (, datos realistas).
// Valida: cobertura de estados FSM, datos financieros, coherencia paciente↔cita,
// y que createSeedState devuelva una copia FRESCA (reset = re-seed sin mutar).

describe('seed — datos realistas dental (,)', () => {
 it('expone pacientes y citas seed con datos reales (nunca lorem)', () => {
 expect(seedPacientes.length).toBeGreaterThanOrEqual(8);
 expect(seedCitas.length).toBeGreaterThanOrEqual(10);
 // nombres reales, no "Test Company"
 expect(seedPacientes[0].nombre).not.toMatch(/test|lorem/i);
 expect(seedPacientes[0].email).toMatch(/@/);
 });

 it('cada paciente tiene datos financieros (revenueTotal, citasProgramadas, noShows)', () => {
 for (const p of seedPacientes) {
 expect(p.revenueTotal).toBeGreaterThanOrEqual(0);
 expect(p.citasProgramadas).toBeGreaterThanOrEqual(0);
 expect(p.noShows).toBeGreaterThanOrEqual(0);
 expect(p.noShows).toBeLessThanOrEqual(p.citasProgramadas);
 }
 });

 it('cubre los 3 estados de paciente (activo/inactivo/pendiente)', () => {
 const estados = new Set<PacienteEstado>(seedPacientes.map((p) => p.estado));
 expect(estados.has('activo')).toBe(true);
 expect(estados.has('inactivo')).toBe(true);
 expect(estados.has('pendiente')).toBe(true);
 });

 it('cubre los 5 estados de la FSM de citas (scheduled/confirmed/completed/no_show/cancelled)', () => {
 const estados = new Set<CitaStatus>(seedCitas.map((c) => c.estado));
 for (const s of ['scheduled', 'confirmed', 'completed', 'no_show', 'cancelled'] as CitaStatus[]) {
 expect(estados.has(s)).toBe(true);
 }
 });

 it('cada cita referencia un paciente existente del seed', () => {
 const ids = new Set(seedPacientes.map((p) => p.id));
 for (const c of seedCitas) {
 expect(ids.has(c.pacienteId)).toBe(true);
 }
 });

 it('las citas se reparten en varios meses (para charts por mes)', () => {
 const meses = new Set(seedCitas.map((c) => c.fecha.slice(0, 7)));
 expect(meses.size).toBeGreaterThanOrEqual(3);
 });

 it('hay citas completed con valor > 0 (para revenue total)', () => {
 const completed = seedCitas.filter((c) => c.estado === 'completed');
 expect(completed.length).toBeGreaterThan(0);
 for (const c of completed) {
 expect(c.valor).toBeGreaterThan(0);
 }
 });

 it('createSeedState devuelve una copia FRESCA (reset = re-seed sin mutar previo)', () => {
 const a = createSeedState();
 const b = createSeedState();
 expect(a).toEqual(b);
 // mutar la copia no afecta la fuente ni la siguiente copia
 a.pacientes[0].nombre = 'MUTADO';
 expect(b.pacientes[0].nombre).not.toBe('MUTADO');
 expect(seedPacientes[0].nombre).not.toBe('MUTADO');
 });

 it('createSeedState copia PROFUNDA de citas (mutar la copia no afecta seed ni siguiente copia)', () => {
 const a = createSeedState();
 const b = createSeedState();
 // C9 es 'confirmed' (no terminal) → mutarla a 'completed' es un cambio detectable.
 a.citas[0].valor = 999;
 a.citas[0].estado = 'no_show';
 expect(b.citas[0].valor).not.toBe(999);
 expect(seedCitas[0].valor).not.toBe(999);
 expect(b.citas[0].estado).not.toBe('no_show');
 expect(seedCitas[0].estado).not.toBe('no_show');
 });

 it('createSeedState arma el estado global con contadores coherentes', () => {
 const s = createSeedState();
 expect(s.version).toBe(1);
 expect(s.seeded).toBe(true);
 expect(s.pacientes).toHaveLength(seedPacientes.length);
 expect(s.citas).toHaveLength(seedCitas.length);
 expect(s.pacienteCounter).toBeGreaterThanOrEqual(seedPacientes.length);
 expect(s.citaCounter).toBeGreaterThanOrEqual(seedCitas.length);
 });
});
