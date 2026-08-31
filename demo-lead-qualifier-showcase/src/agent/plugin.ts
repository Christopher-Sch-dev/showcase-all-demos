/**
 * PLUGIN — capa agéntica del demo lead-qualifier (CANON §8, AC-5).
 *
 * Explica a CUALQUIER IA externa (Claude Code, ChatGPT, Cursor, Codex, MCP)
 * cómo OPERAR el lead-funnel sin romper lo determinista. Es una CAPA sobre el
 * reducer puro src/lib/state.ts: NUNCA muta estado directo, nunca reimplementa
 * la FSM. Cada acción pasa por `reduce()` que valida cada transición → la IA
 * no puede forzar una transición ilegal.
 *
 * "Tu sistema lo opera una IA 24/7 — contesta, agenda, califica solo,
 *  y vos aprobás cada paso." (CAN §8, framing SMB)
 *
 * El `now` se inyecta (el reducer es puro, sin Date.now()): agnóstico de modelo,
 * testeable, SSR-safe.
 */
import type { AgentAction, DemoState, ParsedLeadIntent, ReduceResult } from '../lib/types';
import { reduce } from '../lib/state';

/**
 * Manejador explícito del contrato agéntico (AC-5): despacha cualquier
 * AgentAction al reducer y devuelve el ReduceResult (state + changed + reason?).
 * Solo vía reduce() — la FSM valida cada transición.
 */
export function operateLead(state: DemoState, action: AgentAction, now: number): ReduceResult {
  return reduce(state, action, now);
}

/**
 * Wrapper de captura (AC-1): crea un Lead `new` e inicia el timer speed-to-lead.
 * Puro: devuelve un nuevo estado, no muta `state`.
 */
export function captureLead(state: DemoState, intent: ParsedLeadIntent, now: number): ReduceResult {
  return reduce(state, { type: 'capture_lead', intent }, now);
}

/**
 * Wrapper de calificación (AC-2): `new → qualified` con score (0-100) + razón.
 * Marca respondedAt → mide speed-to-lead <60s. Rechaza si el lead no está `new`.
 */
export function qualifyLead(state: DemoState, leadId: string, score: number, reason: string, now: number): ReduceResult {
  return reduce(state, { type: 'qualify', leadId, score, reason }, now);
}

/**
 * Wrapper de agendado (AC-3/AC-8): `qualified → booked`. Sin `bookingUrl`,
 * aplica CALENDLY_URL centralizado (NUNCA mailto). Rechaza si no está `qualified`.
 */
export function bookLead(state: DemoState, leadId: string, bookingUrl: string | undefined, now: number): ReduceResult {
  return reduce(state, { type: 'book', leadId, bookingUrl }, now);
}
