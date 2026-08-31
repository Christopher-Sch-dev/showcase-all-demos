import { describe, it, expect } from 'vitest';
import { operateDashboard, createPatient, updatePatient, deletePatient, transitionCita } from './plugin';
import type { Cita, DemoState, Paciente, ReduceResult } from '../lib/types';

const NOW = 1_700_000_000_000;

// ───────────── helpers (estado + entidades construidas a mano, sin seed externo) ─────────────

function makePaciente(id: string, overrides: Partial<Paciente> = {}): Paciente {
 return {
 id,
 nombre: 'Test Paciente',
 rut: '12.345.678-9',
 email: 'test@example.com',
 telefono: '+56 9 1234 5678',
 ultimaVisita: '2026-08-01',
 tratamiento: 'Limpieza',
 estado: 'activo',
 revenueTotal: 0,
 citasProgramadas: 0,
 noShows: 0,
 ultimaCita: '2026-08-01',
 createdAt: NOW,
 updatedAt: NOW,
 ...overrides,
 };
}

function makeCita(id: string, pacienteId: string, overrides: Partial<Cita> = {}): Cita {
 return {
 id,
 pacienteId,
 fecha: '2026-09-01',
 tratamiento: 'Limpieza',
 estado: 'scheduled',
 valor: 120,
 createdAt: NOW,
 updatedAt: NOW,
 ...overrides,
 };
}

function makeState(pacientes: Paciente[] = [], citas: Cita[] = [], pacienteCounter = 0, citaCounter = 0): DemoState {
 return { version: 1, pacientes, citas, pacienteCounter, citaCounter, seeded: false };
}

// ─────────────────────────────────────────── operateDashboard ───────────────────────────────────────────

describe('operateDashboard — manejador agéntico ()', () => {
 it('delega en reduce(): una acción agéntica produce cambio y estado nuevo', () => {
 const s = makeState([makePaciente('P1')], [], 1, 0);
 const r = operateDashboard(s, {
 type: 'create_cita',
 cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 },
 }, NOW);
 expect(r.changed).toBe(true);
 expect(r.state.citas).toHaveLength(1);
 expect(r.state.citas[0].estado).toBe('scheduled');
 });

 it('nunca muta el estado de entrada (reducer puro)', () => {
 const s = makeState([makePaciente('P1')], [], 1, 0);
 operateDashboard(s, {
 type: 'create_cita',
 cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 },
 }, NOW);
 expect(s.citas).toHaveLength(0);
 expect(s.citaCounter).toBe(0);
 });

 it('la IA no puede forzar una transición ilegal: complete desde scheduled → REJECT', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1')], 1, 1);
 const r = operateDashboard(s, { type: 'complete_cita', citaId: 'C1' }, NOW);
 expect(r.changed).toBe(false);
 expect(r.reason).toMatch(/inválida/i);
 expect(r.state).toBe(s); // misma referencia: no-cambio
 });

 it('la IA no puede forzar una transición ilegal: no_show desde scheduled → REJECT', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1')], 1, 1);
 const r = operateDashboard(s, { type: 'no_show_cita', citaId: 'C1' }, NOW);
 expect(r.changed).toBe(false);
 expect(r.reason).toMatch(/inválida/i);
 });
});

// ─────────────────────────────────────────── wrappers CRUD pacientes ───────────────────────────────────────────

describe('wrappers puros — createPatient/updatePatient/deletePatient', () => {
 it('createPatient crea un paciente con id secuencial sin mutar el estado de entrada', () => {
 const s = makeState([], [], 2, 0);
 const r = createPatient(s, {
 nombre: 'Nuevo Paciente',
 rut: '11.111.111-1',
 email: 'nuevo@example.com',
 telefono: '+56 9 0000 0000',
 ultimaVisita: '2026-08-25',
 tratamiento: 'Limpieza',
 estado: 'pendiente',
 revenueTotal: 0,
 citasProgramadas: 0,
 noShows: 0,
 ultimaCita: '2026-08-25',
 }, NOW);
 expect(r.changed).toBe(true);
 expect(r.state.pacientes).toHaveLength(1);
 expect(r.state.pacientes[0].id).toBe('P');
 expect(s.pacientes).toHaveLength(0); // inmutable
 });

 it('updatePatient aplica cambios parciales sin pisar id/createdAt', () => {
 const s = makeState([makePaciente('P1', { nombre: 'Original' })], [], 1, 0);
 const r = updatePatient(s, 'P1', { nombre: 'Editado', estado: 'inactivo' }, NOW);
 expect(r.changed).toBe(true);
 expect(r.state.pacientes[0].nombre).toBe('Editado');
 expect(r.state.pacientes[0].estado).toBe('inactivo');
 expect(r.state.pacientes[0].id).toBe('P1');
 expect(r.state.pacientes[0].createdAt).toBe(NOW);
 });

 it('updatePatient de paciente inexistente → REJECT', () => {
 const s = makeState([], [], 0, 0);
 const r = updatePatient(s, 'NO-EXISTE', { nombre: 'x' }, NOW);
 expect(r.changed).toBe(false);
 expect(r.reason).toMatch(/paciente/i);
 });

 it('deletePatient elimina el paciente', () => {
 const s = makeState([makePaciente('P1'), makePaciente('P2')], [], 2, 0);
 const r = deletePatient(s, 'P1', NOW);
 expect(r.changed).toBe(true);
 expect(r.state.pacientes).toHaveLength(1);
 expect(r.state.pacientes[0].id).toBe('P2');
 });

 it('deletePatient de paciente inexistente → REJECT', () => {
 const s = makeState([], [], 0, 0);
 const r = deletePatient(s, 'NO-EXISTE', NOW);
 expect(r.changed).toBe(false);
 expect(r.reason).toMatch(/paciente/i);
 });
});

// ─────────────────────────────────────────── wrapper transitionCita (FSM) ───────────────────────────────────────────

describe('wrapper transitionCita — FSM determinista de citas', () => {
 it('recorre el camino válido scheduled → confirmed → completed', () => {
 let s = makeState([makePaciente('P1')], [makeCita('C1', 'P1')], 1, 1);
 let r: ReduceResult = transitionCita(s, 'C1', 'confirmed', NOW);
 expect(r.changed).toBe(true);
 expect(r.state.citas[0].estado).toBe('confirmed');
 s = r.state;

 r = transitionCita(s, 'C1', 'completed', NOW);
 expect(r.changed).toBe(true);
 expect(r.state.citas[0].estado).toBe('completed');
 });

 it('confirm → no_show es válido (recuperable)', () => {
 let s = makeState([makePaciente('P1')], [makeCita('C1', 'P1')], 1, 1);
 s = transitionCita(s, 'C1', 'confirmed', NOW).state;
 const r = transitionCita(s, 'C1', 'no_show', NOW);
 expect(r.changed).toBe(true);
 expect(r.state.citas[0].estado).toBe('no_show');
 });

 it('no puede forzar una transición ilegal: complete desde scheduled → REJECT', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1')], 1, 1);
 const r = transitionCita(s, 'C1', 'completed', NOW);
 expect(r.changed).toBe(false);
 expect(r.reason).toMatch(/inválida/i);
 expect(r.state).toBe(s);
 });

 it('no puede forzar una transición ilegal: cancel desde completed (terminal) → REJECT', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1', { estado: 'completed' })], 1, 1);
 const r = transitionCita(s, 'C1', 'cancelled', NOW);
 expect(r.changed).toBe(false);
 expect(r.reason).toMatch(/inválida/i);
 });

 it('cita inexistente → REJECT', () => {
 const s = makeState([], [], 0, 0);
 const r = transitionCita(s, 'NO-EXISTE', 'confirmed', NOW);
 expect(r.changed).toBe(false);
 expect(r.reason).toMatch(/cita/i);
 });

 it('nunca muta el estado de entrada', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1')], 1, 1);
 transitionCita(s, 'C1', 'confirmed', NOW);
 expect(s.citas[0].estado).toBe('scheduled');
 });
});
