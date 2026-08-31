/**
 * DOMAIN TYPES — Demo Lead Qualifier AI (tipo b · Real Estate/Law)
 * Fuente de verdad del dominio (spec.md, AC-1..AC-12).
 * Máquina de estados de LEADS (diferente a demo-hvac que es HVAC dispatch).
 * Invariantes protegidos por mutation testing (TESTING.md):
 *  - speed-to-lead SIEMPRE <60s (AC-1) — se mide entre captura y respuesta
 *  - calificación determinista con score (0-100) + razón (AC-2)
 *  - lead solo se agenda una vez (booked idempotente, AC-3)
 *  - contrato agéntico: qualificar/agendar = acciones que CUALQUIER IA externa
 *    puede operar sin romper lo determinista (AC-5)
 *  - nicho = configuración Zod, NUNCA if(nicho==='x') en componente (AC-6, DI)
 *  - métricas con source; proyecciones etiquetadas "Estimated based on industry averages" (AC-7)
 *  - CTA siempre Calendly, nunca mailto (AC-8)
 */

/** Nichos de la demo (tipo b). Cada uno es configuración Zod, no hardcode. */
export type Niche = 'realestate' | 'law';

/** Estados del funnel de leads (spec AC-1..AC-4). */
export type LeadStatus =
  | 'new'          // form completado → inicia timer speed-to-lead <60s (AC-1)
  | 'qualified'    // IA califica: score + razón (AC-2)
  | 'booked';      // agendado → CTA Calendly (AC-3)

/** Estado transitable de un Lead en la FSM. */
export type FsmState = LeadStatus;

/** Urgencia de un lead (deriva de score + reglas de nicho). */
export type Urgency = 'low' | 'normal' | 'high' | 'urgent';

/** Fuente de un lead (canal de captura). */
export type LeadSource = 'form' | 'website' | 'referral' | 'call';

/** Intención parseada por la IA desde el form/transcript del prospecto. */
export interface ParsedLeadIntent {
  name: string;
  email: string;
  phone: string;
  /** Servicio/problema del prospecto (p.ej. "buying 4br in North", "family law consult"). */
  topic: string;
  /** Presupuesto/satisfacción del lead (dato del form). */
  budget?: number;
  /** Nicho del lead (AC-6 DI): configuración del intent, NO hardcode en el reducer.
   *  Si no viene, el reducer aplica DEFAULT_NICHE desde constants (config). */
  niche?: Niche;
  /** Timestamp de captura (inicia el contador speed-to-leader <60s). */
  capturedAt: number;
}

/** Lead de la demo (persistido en localStorage `demo-lead-qualifier:v1`). */
export interface Lead {
  id: string;
  status: LeadStatus;
  niche: Niche;
  source: LeadSource;
  name: string;
  email: string;
  phone: string;
  /** Asunto/pedido del prospecto (p.ej. "looking for 4br house under $600k"). */
  topic: string;
  /** Presupuesto del prospecto (si lo dio). */
  budget?: number;
  /** Urgencia derivada determinista. */
  urgency: Urgency;
  /** Timestamp de captura (inicia contador <60s). */
  capturedAt: number;
  /** Timestamp de la primera respuesta de la IA (para medir <60s). */
  respondedAt?: number;
  /** Set cuando pasa a qualified (AC-2). */
  qualification?: {
    score: number;   // 0-100
    reason: string;  // por qué (reglas de nicho)
  };
  /** Set cuando pasa a booked (AC-3). */
  bookedAt?: number;
  /** URL de agendado (Calendly del nicho o del contacto). */
  bookingUrl?: string;
  /** Timeline de auditoría del funnel. */
  timeline: TimelineEvent[];
  createdAt: number;
  updatedAt: number;
}

/** Evento de timeline (auditoría del funnel lead). */
export interface TimelineEvent {
  status: LeadStatus;
  at: number;
  note?: string;
}

/** KPIs derivados del estado (NUNCA guardados independientes — invariante). */
export interface Kpi {
  totalLeads: number;          // +1 por lead capturado
  qualifiedLeads: number;
  bookedLeads: number;
  /** Speed-to-lead promedio (seg) entre captura y primera respuesta. Debe ser <60s (AC-1). */
  avgSpeedToLeadSec: number;
  /** Tasa de respuesta <60s (AC-1): leads respondidos en <60s / total. */
  responseRateUnder60: number;
  /** Conversión del funnel: booked / totalLeads. */
  bookingRate: number;
}

/** Estado global de la demo (persistido en localStorage `demo-lead-qualifier:v1`). */
export interface DemoState {
  version: 1;
  leads: Lead[];
  /** Contador de leads capturados. */
  leadCounter: number;
  /** Marca si el seed fue aplicado. */
  seeded: boolean;
}

/**
 * CONTRATO AGÉNTICO (AC-5): las acciones que CUALQUIER IA externa puede operar
 * sobre la FSM determinista sin romperla. El reducer valida cada transición.
 */
export type AgentAction =
  | { type: 'capture_lead'; intent: ParsedLeadIntent }
  | { type: 'qualify'; leadId: string; score: number; reason: string }
  | { type: 'book'; leadId: string; bookingUrl?: string };

/** Resultado del reducer FSM (reduce). changed=false = transición inválida/REJECT. */
export interface ReduceResult {
  state: DemoState;
  changed: boolean;
  reason?: string;
}
