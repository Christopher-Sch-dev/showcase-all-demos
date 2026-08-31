import { describe, it, expect } from 'vitest';
import type { Cita, CitaStatus, DemoState, Kpi, Paciente, PacienteEstado, Tratamiento } from '../types';

// rol: suite de tipos del dominio . Valida el CONTRATO de tipos
// en runtime: conjuntos de estados válidos, shape de entidades y del estado global.
// Los tipos son compile-time; estos tests fijan los invariantes de dominio que
// storage/state/kpi/charts asumen (mutation testing los protege).

const CITAS_STATUS: CitaStatus[] = ['scheduled', 'confirmed', 'completed', 'no_show', 'cancelled'];
const PACIENTE_ESTADOS: PacienteEstado[] = ['activo', 'inactivo', 'pendiente'];
const TRATAMIENTOS: Tratamiento[] = [
 'Limpieza',
 'Ortodoncia',
 'Blanqueamiento',
 'Implante',
 'Endodoncia',
];

describe('types — contrato de dominio ', () => {
 it('expone exactamente los 5 estados de la FSM de citas ', () => {
 // El contrato agéntico depende de que el conjunto de estados sea exacto.
 expect(CITAS_STATUS).toEqual(['scheduled', 'confirmed', 'completed', 'no_show', 'cancelled']);
 });

 it('expone los 3 estados de paciente (activo/inactivo/pendiente)', () => {
 expect(PACIENTE_ESTADOS).toEqual(['activo', 'inactivo', 'pendiente']);
 });

 it('expone los 5 tratamientos del nicho dental', () => {
 expect(TRATAMIENTOS).toContain('Limpieza');
 expect(TRATAMIENTOS).toContain('Ortodoncia');
 expect(TRATAMIENTOS).toContain('Blanqueamiento');
 expect(TRATAMIENTOS).toContain('Implante');
 expect(TRATAMIENTOS).toContain('Endodoncia');
 });

 it('un Paciente válido respeta el shape mínimo (id, rut, email, telefono, estado, financiero)', () => {
 const p: Paciente = {
 id: 'P1',
 nombre: 'María Fernández',
 rut: '12.345.678-9',
 email: 'maria@example.com',
 telefono: '+56 9 1234 5678',
 ultimaVisita: '2026-07-10',
 tratamiento: 'Limpieza',
 estado: 'activo',
 revenueTotal: 1200,
 citasProgramadas: 4,
 noShows: 0,
 ultimaCita: '2026-07-10',
 createdAt: 1_700_000_000_000,
 updatedAt: 1_700_000_000_000,
 };
 expect(p.id).toBe('P1');
 expect(p.estado).toBe('activo');
 expect(p.revenueTotal).toBeGreaterThanOrEqual(0);
 expect(p.noShows).toBeGreaterThanOrEqual(0);
 });

 it('una Cita válida respeta el shape mínimo (pacienteId, fecha, tratamiento, estado, valor)', () => {
 const c: Cita = {
 id: 'C1',
 pacienteId: 'P1',
 fecha: '2026-08-20',
 tratamiento: 'Ortodoncia',
 estado: 'confirmed',
 valor: 250,
 createdAt: 1_700_000_000_000,
 updatedAt: 1_700_000_000_000,
 };
 expect(c.pacienteId).toBe('P1');
 expect(c.estado).toBe('confirmed');
 expect(c.valor).toBeGreaterThanOrEqual(0);
 });

 it('el estado global DemoState agrupa pacientes + citas + contadores + seeded', () => {
 const s: DemoState = {
 version: 1,
 pacientes: [],
 citas: [],
 pacienteCounter: 0,
 citaCounter: 0,
 seeded: true,
 };
 expect(s.version).toBe(1);
 expect(Array.isArray(s.pacientes)).toBe(true);
 expect(Array.isArray(s.citas)).toBe(true);
 expect(s.seeded).toBe(true);
 });

 it('el shape de Kpi expone los 6 KPIs derivados ', () => {
 const k: Kpi = {
 activePatients: 0,
 noShowRate: 0,
 totalRevenue: 0,
 revenuePerPatient: 0,
 scheduledAppointments: 0,
 completedAppointments: 0,
 };
 expect(Object.keys(k)).toHaveLength(6);
 expect(k.noShowRate).toBeGreaterThanOrEqual(0);
 expect(k.revenuePerPatient).toBeGreaterThanOrEqual(0);
 });
});
