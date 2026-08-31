/**
 * DOMAIN TYPES — Demo HVAC call-capture + dispatch
 * Fuente de verdad del dominio (spec.md + features/lead-to-invoice.feature).
 * La máquina de estados comercial es NUEVA (no existe en el repo MIT de referencia).
 * Invariantes protegidos por mutation testing (TESTING.md):
 *  - KPI/precio nunca negativo
 *  - transición válida solo forward (lead→…→invoiced) o a canceled/no_show desde booked/scheduled
 *  - un lead solo se factura una vez (idempotente invoiced)
 *  - un ticket/lead sin técnico no se despacha (guard)
 *  - KPI deriva del estado, nunca se guarda independiente
 *  - ROI siempre con source; proyecciones etiquetadas "Estimated based on industry averages"
 */

/** Estados del funnel comercial (spec AC-1..AC-5). */
export type LeadStatus =
  | 'lead'          // llamada capturada por IA (inicia speed-to-lead)
  | 'qualified'     // IA/CSR califica: score + razón
  | 'booked'        // cliente confirma cita → pasa a ser Job
  | 'scheduled'     // job en el board con técnico asignado
  | 'dispatched'    // técnico en ruta (verde #16A34A)
  | 'in_progress'   // técnico en sitio
  | 'completed'     // trabajo cerrado
  | 'invoiced'      // facturado (solo una vez)
  | 'no_show'       // rama no-dead-end
  | 'canceled';     // rama no-dead-end

/** Estado transitable de un Lead en la FSM. */
export type FsmState = LeadStatus;

/** Prioridad de un job (patrón del repo MIT, extendido). */
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

/** Zona de despacho (a diferencia del repo MIT que es por semana). */
export type Zone = 'north' | 'central' | 'south';

/** Intención parseada por la IA desde el transcript de la llamada. */
export interface ParsedIntent {
  issue: string;          // p.ej. "no AC, urgent, North zone"
  serviceType: string;    // p.ej. "AC repair", "furnace installation"
  urgency: 'low' | 'normal' | 'high' | 'urgent';
  zone: Zone;
  estimatedTicket: number; // $ estimado del trabajo
}

/** Lead capturado por la IA (AC-1). */
export interface Lead {
  id: string;
  status: LeadStatus;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  issue: string;
  zone: Zone;
  priority: Priority;
  /** Timestamp de captura (inicia contador speed-to-lead). */
  capturedAt: number;
  /** Timestamp del primer contacto de respuesta (para medir speed-to-lead <5min). */
  respondedAt?: number;
  /** Set cuando pasa a qualified. */
  qualification?: {
    score: number;        // 0-100
    reason: string;
  };
  /** Set cuando pasa a booked (se convierte en Job). */
  bookedAt?: number;
  scheduledDate?: string;
  scheduledTime?: string;
  /** Set en completed. */
  completionNote?: string;
  /** Set en invoiced. */
  invoiceTotal?: number;
  invoiceId?: string;
  /** Set en dispatched (AC-3). */
  technicianId?: string;
  /** Set en dispatched. */
  etaMinutes?: number;
  timeline: TimelineEvent[];
  createdAt: number;
  updatedAt: number;
}

/** Técnico de campo (patrón repo MIT). */
export interface Technician {
  id: string;
  name: string;
  color: string;
  zone: Zone;
  active: boolean;
}

/** Evento de timeline (auditoría del funnel). */
export interface TimelineEvent {
  status: LeadStatus;
  at: number;
  note?: string;
}

/** KPIs derivados del estado (NUNCA guardados independientes — invariante). */
export interface Kpi {
  totalCallsCaptured: number;      // +1 por lead
  qualifiedLeads: number;
  bookedJobs: number;
  dispatchedJobs: number;
  completedJobs: number;
  invoicedJobs: number;
  noShow: number;
  canceled: number;
  /** Revenue recuperado (suma de invoiceTotal de invoiced). */
  recoveredRevenue: number;
  /** Ticket promedio de los completados. */
  avgTicket: number;
  /** Speed-to-lead promedio (min) entre captura y respuesta. */
  avgSpeedToLeadMin: number;
  /** Conversión del funnel: invoiced / totalCallsCaptured. */
  conversionRate: number;
}

/** Estado global de la demo (persistido en localStorage `demo-hvac:v1`). */
export interface DemoState {
  version: 1;
  leads: Lead[];
  technicians: Technician[];
  /** Contador de llamadas simuladas. */
  callCounter: number;
  /** Marca si el seed fue aplicado. */
  seeded: boolean;
}
