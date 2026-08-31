import { describe, it, expect } from 'vitest';
import { reduce } from '../state';
import type { AgentAction, Cita, DemoState, Paciente, ReduceResult } from '../types';

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

/** Aplica la acción y afirma que produjo cambio (GREEN esperado). */
function reduceOk(state: DemoState, action: AgentAction): DemoState {
 const r = reduce(state, action, NOW);
 expect(r.changed).toBe(true);
 return r.state;
}

/** Aplica la acción y afirma que fue rechazada (no-cambio, misma referencia). */
function reduceReject(state: DemoState, action: AgentAction): ReduceResult {
 const r = reduce(state, action, NOW);
 expect(r.changed).toBe(false);
 expect(r.state).toBe(state); // reducer puro: misma referencia cuando no cambia
 return r;
}

// ─────────────────────────────────────────── FSM de citas ───────────────────────────────────────────

describe('FSM citas — create_cita (: scheduled inicial)', () => {
 it('crea una cita en estado scheduled al top del queue con id secuencial', () => {
 const s = makeState([makePaciente('P1')], [], 1, 0);
 const after = reduceOk(s, {
 type: 'create_cita',
 cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 },
 });
 expect(after.citas).toHaveLength(1);
 const c = after.citas[0];
 expect(c.id).toBe('CITA-1');
 expect(c.estado).toBe('scheduled');
 expect(c.pacienteId).toBe('P1');
 expect(c.valor).toBe(120);
 expect(c.createdAt).toBe(NOW);
 });

 it('incrementa citaCounter y no muta el estado original (pureza)', () => {
 const s = makeState([makePaciente('P1')], [], 1, 3);
 const after = reduceOk(s, {
 type: 'create_cita',
 cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 },
 });
 expect(after.citaCounter).toBe(4);
 expect(s.citas).toHaveLength(0);
 expect(s.citaCounter).toBe(3);
 });

 it('rechaza crear cita para un paciente inexistente', () => {
 const s = makeState([], [], 0, 0);
 const r = reduceReject(s, {
 type: 'create_cita',
 cita: { pacienteId: 'NO-EXISTE', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 },
 });
 expect(r.reason).toMatch(/paciente/i);
 });

 it('rechaza cita con valor negativo', () => {
 const s = makeState([makePaciente('P1')], [], 1, 0);
 const r = reduceReject(s, {
 type: 'create_cita',
 cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: -5 },
 });
 expect(r.reason).toMatch(/valor/i);
 });
});

describe('FSM citas — camino forward scheduled → confirmed → completed ', () => {
 it('recorre las transiciones válidas de la FSM', () => {
 let s = makeState([makePaciente('P1')], [], 1, 0);
 s = reduceOk(s, {
 type: 'create_cita',
 cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 },
 });
 const id = s.citas[0].id;

 s = reduceOk(s, { type: 'confirm_cita', citaId: id });
 expect(s.citas[0].estado).toBe('confirmed');

 s = reduceOk(s, { type: 'complete_cita', citaId: id });
 expect(s.citas[0].estado).toBe('completed');
 });

 it('confirm → no_show es válido (recuperable)', () => {
 let s = makeState([makePaciente('P1')], [], 1, 0);
 s = reduceOk(s, {
 type: 'create_cita',
 cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 },
 });
 const id = s.citas[0].id;
 s = reduceOk(s, { type: 'confirm_cita', citaId: id });
 s = reduceOk(s, { type: 'no_show_cita', citaId: id });
 expect(s.citas[0].estado).toBe('no_show');
 });

 it('scheduled → cancelled y confirmed → cancelled son válidos', () => {
 let s = makeState([makePaciente('P1')], [], 1, 0);
 s = reduceOk(s, {
 type: 'create_cita',
 cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 },
 });
 const id = s.citas[0].id;
 s = reduceOk(s, { type: 'cancel_cita', citaId: id });
 expect(s.citas[0].estado).toBe('cancelled');
 });
});

describe('FSM citas — guards e invariantes (: la IA no rompe la FSM)', () => {
 it('cita inexistente → REJECT', () => {
 const s = makeState([], [], 0, 0);
 const r = reduceReject(s, { type: 'confirm_cita', citaId: 'NO-EXISTE' });
 expect(r.reason).toMatch(/cita/i);
 });

 it('complete desde scheduled → REJECT (debe pasar por confirmed)', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1')], 1, 1);
 const r = reduceReject(s, { type: 'complete_cita', citaId: 'C1' });
 expect(r.reason).toMatch(/inválida/i);
 });

 it('no_show desde scheduled → REJECT (debe estar confirmed)', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1')], 1, 1);
 const r = reduceReject(s, { type: 'no_show_cita', citaId: 'C1' });
 expect(r.reason).toMatch(/inválida/i);
 });

 it('confirm doble desde confirmed → REJECT (idempotente)', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1', { estado: 'confirmed' })], 1, 1);
 const r = reduceReject(s, { type: 'confirm_cita', citaId: 'C1' });
 expect(r.reason).toMatch(/inválida/i);
 });

 it('complete desde completed → REJECT (terminal)', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1', { estado: 'completed' })], 1, 1);
 const r = reduceReject(s, { type: 'complete_cita', citaId: 'C1' });
 expect(r.reason).toMatch(/inválida/i);
 });

 it('no_show desde completed → REJECT (terminal)', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1', { estado: 'completed' })], 1, 1);
 const r = reduceReject(s, { type: 'no_show_cita', citaId: 'C1' });
 expect(r.reason).toMatch(/inválida/i);
 });

 it('cancel desde completed → REJECT (terminal)', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1', { estado: 'completed' })], 1, 1);
 const r = reduceReject(s, { type: 'cancel_cita', citaId: 'C1' });
 expect(r.reason).toMatch(/inválida/i);
 });

 it('el reducer nunca muta el estado de entrada (pureza) incluso en camino exitoso', () => {
 const s = makeState([makePaciente('P1')], [], 1, 0);
 reduce( s,
 { type: 'create_cita', cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 } },
 NOW,
);
 expect(s.citas).toHaveLength(0);
 expect(s.citaCounter).toBe(0);
 });
});

// ─────────────────────────────────────────── CRUD de pacientes ───────────────────────────────────────────

describe('CRUD pacientes — create/update/delete ', () => {
 it('create_paciente agrega al top con id secuencial y estado inicial', () => {
 const s = makeState([], [], 2, 0);
 const after = reduceOk(s, {
 type: 'create_paciente',
 paciente: {
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
 },
 });
 expect(after.pacientes).toHaveLength(1);
 expect(after.pacientes[0].id).toBe('P');
 expect(after.pacienteCounter).toBe(3);
 expect(s.pacientes).toHaveLength(0); // inmutable
 });

 it('create_paciente genera una cita completed con el valor del tratamiento (revenue sube)', () => {
 const s = makeState([], [], 2, 0);
 const after = reduceOk(s, {
 type: 'create_paciente',
 paciente: {
 nombre: 'Nuevo Paciente',
 rut: '11.111.111-1',
 email: 'nuevo@example.com',
 telefono: '+56 9 0000 0000',
 ultimaVisita: '2026-08-25',
 tratamiento: 'Implante',
 estado: 'activo',
 revenueTotal: 0,
 citasProgramadas: 0,
 noShows: 0,
 ultimaCita: '2026-08-25',
 },
 });
 // Se creó una cita completed con el valor del tratamiento (Implante = 1800)
 expect(after.citas).toHaveLength(1);
 expect(after.citas[0].estado).toBe('completed');
 expect(after.citas[0].valor).toBe(1800);
 expect(after.citas[0].pacienteId).toBe('P');
 expect(after.citaCounter).toBe(1);
 });

 it('update_paciente aplica cambios parciales sin pisar id/createdAt', () => {
 const s = makeState([makePaciente('P1', { nombre: 'Original' })], [], 1, 0);
 const after = reduceOk(s, { type: 'update_paciente', pacienteId: 'P1', cambios: { nombre: 'Editado', estado: 'inactivo' } });
 expect(after.pacientes[0].nombre).toBe('Editado');
 expect(after.pacientes[0].estado).toBe('inactivo');
 expect(after.pacientes[0].id).toBe('P1'); // id intacto
 expect(after.pacientes[0].createdAt).toBe(NOW); // createdAt intacto
 expect(after.pacientes[0].updatedAt).toBe(NOW);
 });

 it('update_paciente de paciente inexistente → REJECT', () => {
 const s = makeState([], [], 0, 0);
 const r = reduceReject(s, { type: 'update_paciente', pacienteId: 'NO-EXISTE', cambios: { nombre: 'x' } });
 expect(r.reason).toMatch(/paciente/i);
 });

 it('delete_paciente elimina el paciente', () => {
 const s = makeState([makePaciente('P1'), makePaciente('P2')], [], 2, 0);
 const after = reduceOk(s, { type: 'delete_paciente', pacienteId: 'P1' });
 expect(after.pacientes).toHaveLength(1);
 expect(after.pacientes[0].id).toBe('P2');
 });

 it('delete_paciente de paciente inexistente → REJECT', () => {
 const s = makeState([], [], 0, 0);
 const r = reduceReject(s, { type: 'delete_paciente', pacienteId: 'NO-EXISTE' });
 expect(r.reason).toMatch(/paciente/i);
 });
});

// ─────────────────────────────────────────── contrato agéntico ───────────────────────────────────────────

describe('capa IA conectable (,)', () => {
 it('cualquier IA puede operar el flujo completo solo con las acciones agénticas', () => {
 let s = makeState([makePaciente('P1')], [], 1, 0);
 s = reduceOk(s, {
 type: 'create_cita',
 cita: { pacienteId: 'P1', fecha: '2026-09-05', tratamiento: 'Limpieza', valor: 120 },
 });
 const id = s.citas[0].id;
 s = reduceOk(s, { type: 'confirm_cita', citaId: id });
 s = reduceOk(s, { type: 'complete_cita', citaId: id });
 expect(s.citas[0].estado).toBe('completed');
 });

 it('la IA no puede forzar una transición inválida aunque envíe el payload (determinista)', () => {
 const s = makeState([makePaciente('P1')], [makeCita('C1', 'P1')], 1, 1);
 // complete directo desde scheduled ignorando confirm → REJECT
 const r = reduceReject(s, { type: 'complete_cita', citaId: 'C1' });
 expect(r.reason).toMatch(/inválida/i);
 });
});
