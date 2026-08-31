import type { DemoState, Lead, LeadStatus } from './types';
import { createSeedState } from './seed';

// ─────────────────────────────────────────────────────────────
// FSM comercial pura: lead → qualified → booked → scheduled →
// dispatched → in_progress → completed → invoiced.
// Ramas no-dead-end: booked/scheduled → no_show | canceled.
// INVARIANTES (spec + features/lead-to-invoice.feature):
//   - solo transiciones forward o a no_show/canceled desde booked/scheduled
//   - un lead sin técnico NO se despacha (domain guard)
//   - invoice solo una vez (idempotente)
//   - precio/KPI nunca negativo
//   - reducer PURO: sin side-effects ni Date.now(); el tiempo se pasa por arg
// ─────────────────────────────────────────────────────────────

/** Estados desde los que un lead puede ir a no_show o canceled (spec AC-5). */
const ABANDONABLE: LeadStatus[] = ['booked', 'scheduled'];

/** Mapa de transiciones válidas por estado origen (forward). */
const TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  lead: ['qualified'],
  qualified: ['booked'],
  booked: ['scheduled', 'no_show', 'canceled'],
  scheduled: ['dispatched', 'no_show', 'canceled'],
  dispatched: ['in_progress'],
  in_progress: ['completed'],
  completed: ['invoiced'],
  invoiced: [],
  no_show: [],
  canceled: [],
};

// ─────────────────────────────── Acciones tipadas ───────────────────────────────

export interface NewLeadInput {
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  issue: string;
  zone: Lead['zone'];
  priority: Lead['priority'];
}

export type Action =
  | { type: 'captureCall'; payload: NewLeadInput }
  | { type: 'qualify'; id: string; payload: { score: number; reason: string } }
  | { type: 'book'; id: string; payload: { scheduledDate: string; scheduledTime: string } }
  | { type: 'assignTechnician'; id: string; technicianId: string }
  | { type: 'dispatch'; id: string; etaMinutes: number }
  | { type: 'startJob'; id: string }
  | { type: 'completeJob'; id: string; note: string }
  | { type: 'invoice'; id: string; total: number }
  | { type: 'markNoShow'; id: string }
  | { type: 'cancel'; id: string }
  | { type: 'reset' };

/** Resultado del reducer: estado nuevo + si hubo cambio + razón del no-cambio. */
export interface ReduceResult {
  state: DemoState;
  changed: boolean;
  reason?: string;
}

// rol: clonar estado/lead de forma inmutable (reducer puro, sin mutación).
function cloneState(s: DemoState): DemoState {
  return {
    ...s,
    leads: s.leads.map((l) => ({
      ...l,
      qualification: l.qualification ? { ...l.qualification } : undefined,
      timeline: l.timeline.map((e) => ({ ...e })),
    })),
    technicians: s.technicians.map((t) => ({ ...t })),
  };
}

// rol: aplicar una transición válida a un lead (marca timestamps + append timeline).
function transitionTo(
  lead: Lead,
  status: LeadStatus,
  at: number,
  note?: string,
): Lead {
  const next: Lead = {
    ...lead,
    status,
    updatedAt: at,
    timeline: [...lead.timeline, { status, at, note }],
  };
  if (status === 'qualified') {
    next.respondedAt = at;
    if (note) next.qualification = { score: lead.qualification?.score ?? 0, reason: note };
  }
  if (status === 'booked') next.bookedAt = at;
  if (status === 'invoiced') {
    next.invoiceId = next.invoiceId ?? `INV-${lead.id}-${at}`;
  }
  return next;
}

// rol: localizar un lead por id; devuelve undefined si no existe.
function findLead(s: DemoState, id: string): Lead | undefined {
  return s.leads.find((l) => l.id === id);
}

/** Reducer puro de la FSM. Nunca muta el estado de entrada. */
export function reduce(state: DemoState, action: Action, now: number): ReduceResult {
  // reset: restaura el seed baseline (AC-8) — siempre válido y siempre nuevo.
  if (action.type === 'reset') {
    return { state: createSeedState(), changed: true };
  }

  const s = cloneState(state);

  if (action.type === 'captureCall') {
    const { payload } = action;
    const lead: Lead = {
      id: `LEAD-${s.callCounter + 1}`,
      status: 'lead',
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      address: payload.address,
      city: payload.city,
      issue: payload.issue,
      zone: payload.zone,
      priority: payload.priority,
      capturedAt: now,
      timeline: [{ status: 'lead', at: now }],
      createdAt: now,
      updatedAt: now,
    };
    return { state: { ...s, callCounter: s.callCounter + 1, leads: [lead, ...s.leads] }, changed: true };
  }

  const idx = s.leads.findIndex((l) => l.id === action.id);
  if (idx === -1) {
    return { state, changed: false, reason: 'Lead no encontrado' };
  }
  const lead = s.leads[idx];

  switch (action.type) {
    case 'qualify': {
      const { score, reason } = action.payload;
      if (!isValidTransition(lead.status, 'qualified')) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → qualified` };
      }
      if (score < 0 || score > 100 || reason.trim() === '') {
        return { state, changed: false, reason: 'Score 0-100 y razón requeridos' };
      }
      const next = {
        ...lead,
        status: 'qualified' as LeadStatus,
        qualification: { score, reason },
        respondedAt: now,
        updatedAt: now,
        timeline: [...lead.timeline, { status: 'qualified' as LeadStatus, at: now, note: reason }],
      };
      return { state: replaceLead(s, idx, next), changed: true };
    }

    case 'book': {
      if (!isValidTransition(lead.status, 'booked')) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → booked` };
      }
      // guard: una cita requiere fecha y hora (spec AC-2: Job con fecha/hora).
      if (action.payload.scheduledDate.trim() === '' || action.payload.scheduledTime.trim() === '') {
        return { state, changed: false, reason: 'Fecha y hora de la cita requeridas' };
      }
      const next = {
        ...lead,
        status: 'booked' as LeadStatus,
        bookedAt: now,
        scheduledDate: action.payload.scheduledDate,
        scheduledTime: action.payload.scheduledTime,
        updatedAt: now,
        timeline: [...lead.timeline, { status: 'booked' as LeadStatus, at: now }],
      };
      return { state: replaceLead(s, idx, next), changed: true };
    }

    case 'assignTechnician': {
      if (!isValidTransition(lead.status, 'scheduled')) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → scheduled` };
      }
      const tech = s.technicians.find((t) => t.id === action.technicianId);
      if (!tech || !tech.active) {
        return { state, changed: false, reason: 'Técnico inexistente o inactivo' };
      }
      // guard de zona: un job solo puede asignarse a un técnico de su MISMA zona
      // (spec AC-3: "asignarse a un técnico por zona"; DispatchBoard filtra por zona).
      if (tech.zone !== lead.zone) {
        return { state, changed: false, reason: `Técnico de zona ${tech.zone} no cubre la zona ${lead.zone}` };
      }
      const next = {
        ...lead,
        status: 'scheduled' as LeadStatus,
        technicianId: tech.id,
        updatedAt: now,
        timeline: [...lead.timeline, { status: 'scheduled' as LeadStatus, at: now, note: `Asignado a ${tech.name}` }],
      };
      return { state: replaceLead(s, idx, next), changed: true };
    }

    case 'dispatch': {
      if (!isValidTransition(lead.status, 'dispatched')) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → dispatched` };
      }
      // domain guard: sin técnico no se despacha.
      if (!lead.technicianId) {
        return { state, changed: false, reason: 'Lead sin technician asignado, no se despacha' };
      }
      if (action.etaMinutes < 0) {
        return { state, changed: false, reason: 'ETA no puede ser negativo' };
      }
      const next = {
        ...lead,
        status: 'dispatched' as LeadStatus,
        etaMinutes: action.etaMinutes,
        updatedAt: now,
        timeline: [...lead.timeline, { status: 'dispatched' as LeadStatus, at: now }],
      };
      return { state: replaceLead(s, idx, next), changed: true };
    }

    case 'startJob': {
      if (!isValidTransition(lead.status, 'in_progress')) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → in_progress` };
      }
      const next = transitionTo(lead, 'in_progress', now);
      return { state: replaceLead(s, idx, next), changed: true };
    }

    case 'completeJob': {
      if (!isValidTransition(lead.status, 'completed')) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → completed` };
      }
      // guard: un trabajo completado requiere una nota de cierre (spec AC-4).
      if (action.note.trim() === '') {
        return { state, changed: false, reason: 'Nota de cierre requerida' };
      }
      const next = {
        ...lead,
        status: 'completed' as LeadStatus,
        completionNote: action.note,
        updatedAt: now,
        timeline: [...lead.timeline, { status: 'completed' as LeadStatus, at: now, note: action.note }],
      };
      return { state: replaceLead(s, idx, next), changed: true };
    }

    case 'invoice': {
      // idempotente: un lead ya facturado no se vuelve a facturar.
      if (lead.status === 'invoiced') {
        return { state, changed: false, reason: 'Lead ya facturado (idempotente)' };
      }
      if (!isValidTransition(lead.status, 'invoiced')) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → invoiced` };
      }
      if (action.total < 0) {
        return { state, changed: false, reason: 'Total no puede ser negativo' };
      }
      const next = {
        ...lead,
        status: 'invoiced' as LeadStatus,
        invoiceTotal: action.total,
        invoiceId: `INV-${lead.id}-${now}`,
        updatedAt: now,
        timeline: [...lead.timeline, { status: 'invoiced' as LeadStatus, at: now }],
      };
      return { state: replaceLead(s, idx, next), changed: true };
    }

    case 'markNoShow': {
      if (!ABANDONABLE.includes(lead.status)) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → no_show` };
      }
      const next = transitionTo(lead, 'no_show', now);
      return { state: replaceLead(s, idx, next), changed: true };
    }

    case 'cancel': {
      if (!ABANDONABLE.includes(lead.status)) {
        return { state, changed: false, reason: `Transición inválida: ${lead.status} → canceled` };
      }
      const next = transitionTo(lead, 'canceled', now);
      return { state: replaceLead(s, idx, next), changed: true };
    }

    default:
      // exhaustividad: nunca debería llegar aquí con el tipo Action.
      return { state, changed: false, reason: 'Acción no soportada' };
  }
}

// rol: ¿es válido ir de `from` a `to`? Solo forward o a no_show/canceled desde booked/scheduled.
function isValidTransition(from: LeadStatus, to: LeadStatus): boolean {
  if (from === to) return true; // transiciones que no cambian de estado (idempotencia en no_show/canceled)
  return TRANSITIONS[from]?.includes(to) ?? false;
}

// rol: sustituir el lead en `idx` dentro de un clon del estado.
function replaceLead(s: DemoState, idx: number, next: Lead): DemoState {
  const leads = s.leads.slice();
  leads[idx] = next;
  return { ...s, leads };
}
