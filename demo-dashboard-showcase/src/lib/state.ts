import type { AgentAction, Cita, DemoState, Paciente, ReduceResult } from './types';
import { TRATAMIENTO_VALOR } from './constants';

// ─────────────────────────────────────────────
// FSM comercial pura del DASHBOARD DENTAL: citas + CRUD pacientes.
// INVARIANTES :
// - FSM citas determinista: scheduled → confirmed → completed/no_show/cancelled // - completed/no_show/cancelled son TERMINALES (no se puede salir)
// - cita inexistente → REJECT (no-cambio)
// - CRUD pacientes: create/update/delete con guards // - contrato agéntico (,): cualquier IA opera con las acciones sin romper lo determinista
// - reducer PURO: sin side-effects ni Date.now(); el tiempo se pasa por arg `now`
// ─────────────────────────────────────────────

/** Mapa de transiciones válidas por estado origen de la FSM de citas. */
const TRANSITIONS: Record<Cita['estado'], Cita['estado'][]> = {
 scheduled: ['confirmed', 'cancelled'],
 confirmed: ['completed', 'no_show', 'cancelled'],
 completed: [],
 no_show: [],
 cancelled: [],
};

// rol: ¿es válido ir de `from` a `to` en la FSM de citas?
function isValidTransition(from: Cita['estado'], to: Cita['estado']): boolean {
 return TRANSITIONS[from]?.includes(to) ?? false;
}

// rol: localizar el índice de una cita por id; -1 si no existe.
function findCitaIndex(s: DemoState, id: string): number {
 return s.citas.findIndex((c) => c.id === id);
}

// rol: localizar el índice de un paciente por id; -1 si no existe.
function findPacienteIndex(s: DemoState, id: string): number {
 return s.pacientes.findIndex((p) => p.id === id);
}

// rol: sustituir la cita en `idx` dentro de un clon del estado (inmutable).
function replaceCita(s: DemoState, idx: number, next: Cita): DemoState {
 const citas = s.citas.slice();
 citas[idx] = next;
 return { ...s, citas };
}

// rol: sustituir el paciente en `idx` dentro de un clon del estado (inmutable).
function replacePaciente(s: DemoState, idx: number, next: Paciente): DemoState {
 const pacientes = s.pacientes.slice();
 pacientes[idx] = next;
 return { ...s, pacientes };
}

// rol: aplicar una transición de estado a una cita (valida + clona + actualiza updatedAt).
function transitionCita(s: DemoState, citaId: string, to: Cita['estado'], now: number): ReduceResult {
 const idx = findCitaIndex(s, citaId);
 if (idx === -1) {
 return { state: s, changed: false, reason: 'Cita no encontrada' };
 }
 const cita = s.citas[idx];
 if (!isValidTransition(cita.estado, to)) {
 return { state: s, changed: false, reason: `Transición inválida: ${cita.estado} → ${to}` };
 }
 const next: Cita = { ...cita, estado: to, updatedAt: now };
 return { state: replaceCita(s, idx, next), changed: true };
}

/**
 * Reducer puro de la FSM del dashboard dental. Nunca muta el estado de entrada.
 * reduce(state, action, now) → ReduceResult { state, changed, reason? }.
 * - create_cita: crea Cita scheduled , valida paciente existente + valor ≥ 0.
 * - confirm/complete/no_show/cancel_cita: transiciones de la FSM .
 * - create/update/delete_paciente: CRUD .
 * Guards: entidad inexistente REJECT; transición inválida REJECT; valor negativo REJECT.
 */
export function reduce(state: DemoState, action: AgentAction, now: number): ReduceResult {
 // ── FSM de citas ──
 if (action.type === 'create_cita') {
 const c = action.cita;
 if (findPacienteIndex(state, c.pacienteId) === -1) {
 return { state, changed: false, reason: 'Paciente no encontrado' };
 }
 if (c.valor < 0) {
 return { state, changed: false, reason: 'Valor no puede ser negativo' };
 }
 const nextCounter = state.citaCounter + 1;
 const cita: Cita = {
 id: `CITA-${nextCounter}`,
 pacienteId: c.pacienteId,
 fecha: c.fecha,
 tratamiento: c.tratamiento,
 estado: 'scheduled', // FSM: toda cita nueva arranca scheduled  valor: c.valor,
 createdAt: now,
 updatedAt: now,
 };
 return {
 state: { ...state, citaCounter: nextCounter, citas: [cita, ...state.citas] },
 changed: true,
 };
 }

 if (action.type === 'confirm_cita') return transitionCita(state, action.citaId, 'confirmed', now);
 if (action.type === 'complete_cita') return transitionCita(state, action.citaId, 'completed', now);
 if (action.type === 'no_show_cita') return transitionCita(state, action.citaId, 'no_show', now);
 if (action.type === 'cancel_cita') return transitionCita(state, action.citaId, 'cancelled', now);

 // ── CRUD de pacientes ──
 if (action.type === 'create_paciente') {
 const p = action.paciente;
 const nextCounter = state.pacienteCounter + 1;
 const paciente: Paciente = {
 id: `PAC-${nextCounter}`,
 ...p,
 createdAt: now,
 updatedAt: now,
 };
 // Al crear un paciente con tratamiento, se genera su primera cita completed
 // con el valor de referencia (el revenue del dashboard se deriva de citas
 // completed,). Así el revenue y el gráfico suben de verdad.
 const valor = TRATAMIENTO_VALOR[p.tratamiento] ?? 0;
 const nextCitaCounter = state.citaCounter + 1;
 const cita: Cita = {
 id: `CITA-${nextCitaCounter}`,
 pacienteId: paciente.id,
 fecha: new Date(now).toISOString().slice(0, 10),
 tratamiento: p.tratamiento,
 estado: 'completed',
 valor,
 createdAt: now,
 updatedAt: now,
 };
 return {
 state: {
 ...state,
 pacienteCounter: nextCounter,
 pacientes: [paciente, ...state.pacientes],
 citaCounter: nextCitaCounter,
 citas: [cita, ...state.citas],
 },
 changed: true,
 };
 }

 if (action.type === 'update_paciente') {
 const idx = findPacienteIndex(state, action.pacienteId);
 if (idx === -1) {
 return { state, changed: false, reason: 'Paciente no encontrado' };
 }
 const next: Paciente = {
 ...state.pacientes[idx],
 ...action.cambios,
 id: state.pacientes[idx].id, // id nunca se pisa
 createdAt: state.pacientes[idx].createdAt, // createdAt nunca se pisa
 updatedAt: now,
 };
 return { state: replacePaciente(state, idx, next), changed: true };
 }

 if (action.type === 'delete_paciente') {
 const idx = findPacienteIndex(state, action.pacienteId);
 if (idx === -1) {
 return { state, changed: false, reason: 'Paciente no encontrado' };
 }
 const pacientes = state.pacientes.slice();
 pacientes.splice(idx, 1);
 return { state: { ...state, pacientes }, changed: true };
 }

 return { state, changed: false, reason: 'Acción no soportada' };
}
