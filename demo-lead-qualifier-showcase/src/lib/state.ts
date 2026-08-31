import type { AgentAction, DemoState, Lead, LeadStatus, ReduceResult } from './types';
import { urgencyFromScore } from './score';
import { CALENDLY_URL, DEFAULT_NICHE } from './constants';

// ─────────────────────────────────────────────
// FSM comercial pura del LEAD: new → qualified → booked.
// INVARIANTES (spec + ancla types.ts):
//   - solo transiciones forward new→qualified→booked (FSM determinista)
//   - speed-to-lead SIEMPRE <60s (AC-1): se mide entre capture y respuesta
//   - calificación determinista con score (0-100) + razón (AC-2)
//   - lead solo se agenda una vez (booked idempotente, AC-3)
//   - lead inexistente → REJECT (no-cambio)
//   - contrato agéntico (AC-5): cualquier IA opera con las 3 acciones sin romper lo determinista
//   - reducer PURO: sin side-effects ni Date.now(); el tiempo se pasa por arg `now`
// ─────────────────────────────────────────────

/** Mapa de transiciones válidas por estado origen (forward). */
const TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['qualified'],
  qualified: ['booked'],
  booked: [],
};

// rol: ¿es válido ir de `from` a `to`? Solo forward estricto (sin auto-idempotencia).
function isValidTransition(from: LeadStatus, to: LeadStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

// rol: localizar el índice de un lead por id; -1 si no existe.
function findLeadIndex(s: DemoState, id: string): number {
  return s.leads.findIndex((l) => l.id === id);
}

// rol: sustituir el lead en `idx` dentro de un clon del estado (inmutable).
function replaceLead(s: DemoState, idx: number, next: Lead): DemoState {
  const leads = s.leads.slice();
  leads[idx] = next;
  return { ...s, leads };
}

// rol: construir el evento de timeline para un cambio de estado (auditoría del funnel).
function timelineEvent(status: LeadStatus, at: number, note?: string) {
  return { status, at, note };
}

/**
 * Reducer puro de la FSM de leads. Nunca muta el estado de entrada.
 * reduce(state, action, now) → ReduceResult { state, changed, reason? }.
 * - capture_lead: crea Lead new, inicia contador speed-to-lead (capturedAt = now).
 * - qualify: new → qualified, score+razón, marca respondedAt (primera respuesta → mide <60s).
 * - book: qualified → booked, bookingUrl Calendly, marca bookedAt.
 * Guards: lead inexistente REJECT; transición inválida REJECT; score/razón inválidos REJECT.
 */
export function reduce(state: DemoState, action: AgentAction, now: number): ReduceResult {
  // capture_lead: única acción que no requiere un lead pre-existente.
  if (action.type === 'capture_lead') {
    const intent = action.intent;
    const nextCounter = state.leadCounter + 1;
    const lead: Lead = {
      id: `LEAD-${nextCounter}`,
      status: 'new',
      niche: intent.niche ?? DEFAULT_NICHE, // nicho = config (AC-6 DI): intent lo porta o DEFAULT_NICHE
      source: 'form',      // fuente por defecto de captura (canal form)
      name: intent.name,
      email: intent.email,
      phone: intent.phone,
      topic: intent.topic,
      budget: intent.budget,
      urgency: urgencyFromScore(0), // lead sin score aún → fuente única score.ts (AC-2)
      capturedAt: intent.capturedAt ?? now, // inicia contador speed-to-lead (AC-1)
      timeline: [{ status: 'new', at: intent.capturedAt ?? now }],
      createdAt: now,
      updatedAt: now,
    };
    return {
      state: { ...state, leadCounter: nextCounter, leads: [lead, ...state.leads] },
      changed: true,
    };
  }

  const idx = findLeadIndex(state, action.leadId);
  if (idx === -1) {
    return { state, changed: false, reason: 'Lead no encontrado' };
  }
  const lead = state.leads[idx];

  switch (action.type) {
    case 'qualify': {
      if (!isValidTransition(lead.status, 'qualified')) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → qualified` };
      }
      if (action.score < 0 || action.score > 100) {
        return { state, changed: false, reason: 'Score 0-100 requerido' };
      }
      if (action.reason.trim() === '') {
        return { state, changed: false, reason: 'Razón requerida' };
      }
      const next: Lead = {
        ...lead,
        status: 'qualified',
        qualification: { score: action.score, reason: action.reason },
        respondedAt: now, // primera respuesta de la IA → se mide <60s (AC-1)
        urgency: urgencyFromScore(action.score), // fuente única: score.ts (AC-2)
        updatedAt: now,
        timeline: [...lead.timeline, timelineEvent('qualified', now, action.reason)],
      };
      return { state: replaceLead(state, idx, next), changed: true };
    }

    case 'book': {
      if (!isValidTransition(lead.status, 'booked')) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → booked` };
      }
      const bookingUrl = action.bookingUrl ?? CALENDLY_URL; // default centralizado (AC-3/AC-8)
      if (bookingUrl.trim() === '') {
        return { state, changed: false, reason: 'bookingUrl requerida' };
      }
      const next: Lead = {
        ...lead,
        status: 'booked',
        bookedAt: now,
        bookingUrl,
        updatedAt: now,
        timeline: [...lead.timeline, timelineEvent('booked', now)],
      };
      return { state: replaceLead(state, idx, next), changed: true };
    }

    default:
      return { state, changed: false, reason: 'Acción no soportada' };
  }
}
