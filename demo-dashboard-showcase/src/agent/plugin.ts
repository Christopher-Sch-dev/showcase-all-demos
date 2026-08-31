import { reduce } from '../lib/state';
import type { AgentAction, Cita, DemoState, Paciente, ReduceResult } from '../lib/types';

/**
 * CAPA AGÉNTICA / PLUGIN — demo-dashboard.
 * Expone la FSM determinista del dashboard dental a CUALQUIER IA externa
 * (Claude, ChatGPT, Cursor, Codex, MCP) SIN romperla.
 *
 * El plugin ES UNA CAPA sobre reduce() (src/lib/state.ts): cada acción se
 * construye como AgentAction y se delega en el reducer puro, que valida cada
 * transición. La IA NUNCA muta el estado directo: solo puede pedir acciones
 * legales. Transición inválida → ReduceResult { changed:false, reason }.
 *
 * NO modifica src/lib ni src/config (solo lee). Reducer puro: `now` se inyecta
 * por parámetro (sin Date.now()), el estado de entrada nunca se muta.
 */

// rol: mapear estado destino de la FSM → tipo de AgentAction del reducer (nombres exactos).
// scheduled se excluye: transitionCita solo transiciona a confirmed/completed/no_show/cancelled.
type CitaActionType = 'confirm_cita' | 'complete_cita' | 'no_show_cita' | 'cancel_cita';
const TRANSITION_ACTION: Record<Exclude<Cita['estado'], 'scheduled'>, CitaActionType> = {
 confirmed: 'confirm_cita',
 completed: 'complete_cita',
 no_show: 'no_show_cita',
 cancelled: 'cancel_cita',
};

// rol: construir la AgentAction de transición de cita y delegar en reduce().
function transitionAction(state: DemoState, citaId: string, to: Exclude<Cita['estado'], 'scheduled'>, now: number): ReduceResult {
 const action: AgentAction = { type: TRANSITION_ACTION[to], citaId };
 return reduce(state, action, now);
}

/**
 * Manejador agéntico principal: cualquier IA externa opera la FSM pasando una
 * AgentAction. Delega en reduce() (la FSM valida cada transición).
 */
export function operateDashboard(state: DemoState, action: AgentAction, now: number): ReduceResult {
 return reduce(state, action, now);
}

/** Wrapper puro: crea un paciente vía reduce() (nunca muta directo). */
export function createPatient( state: DemoState,
 paciente: Omit<Paciente, 'id' | 'createdAt' | 'updatedAt'>,
 now: number,
): ReduceResult {
 return reduce(state, { type: 'create_paciente', paciente }, now);
}

/** Wrapper puro: actualiza un paciente vía reduce() (id/createdAt nunca se pisan). */
export function updatePatient( state: DemoState,
 pacienteId: string,
 cambios: Partial<Omit<Paciente, 'id' | 'createdAt' | 'updatedAt'>>,
 now: number,
): ReduceResult {
 return reduce(state, { type: 'update_paciente', pacienteId, cambios }, now);
}

/** Wrapper puro: elimina un paciente vía reduce(). */
export function deletePatient(state: DemoState, pacienteId: string, now: number): ReduceResult {
 return reduce(state, { type: 'delete_paciente', pacienteId }, now);
}

/**
 * Wrapper puro de la FSM de citas: transición a un estado destino.
 * La FSM valida la transición (scheduled→confirmed→completed/no_show/cancelled,
 * terminales). Transición ilegal → changed:false con reason.
 */
export function transitionCita(state: DemoState, citaId: string, to: Exclude<Cita['estado'], 'scheduled'>, now: number): ReduceResult {
 return transitionAction(state, citaId, to, now);
}
