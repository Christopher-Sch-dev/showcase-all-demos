/**
 * DOMAIN TYPES — Demo Dashboard/Backoffice Dental (tipo e)
 * Fuente de verdad del dominio (spec.md, AC-1..AC-12).
 * Máquina de estados de CITAS (FSM determinista) + CRUD de pacientes + KPIs.
 * Invariantes protegidos por mutation testing (TESTING.md):
 *  - FSM citas: scheduled → confirmed → completed/no_show/cancelled (AC-5)
 *  - KPIs derivados del estado, NUNCA guardados independientes (AC-1)
 *  - contrato agéntico: acciones que CUALQUIER IA externa opera vía reduce()
 *    sin romper lo determinista (AC-5, CANON §8)
 *  - nicho = configuración Zod (fase posterior src/config/), NUNCA if(nicho==='x')
 *  - métricas con source; proyecciones etiquetadas (AC-7)
 *  - CTA siempre Calendly, nunca mailto (AC-8)
 */

/** Estados de la FSM de citas (spec AC-5). */
export type CitaStatus =
  | 'scheduled' // agendada, sin confirmar
  | 'confirmed' // confirmada por el paciente
  | 'completed' // asistió y se completó
  | 'no_show' // no asistió (recuperable)
  | 'cancelled'; // cancelada

/** Estados de un paciente (spec funcional §7.1). */
export type PacienteEstado = 'activo' | 'inactivo' | 'pendiente';

/** Tratamientos del nicho dental (spec funcional §7.1). */
export type Tratamiento =
  | 'Limpieza'
  | 'Ortodoncia'
  | 'Blanqueamiento'
  | 'Implante'
  | 'Endodoncia';

/** Paciente de la demo (persistido en localStorage `demo-dashboard:v1`). */
export interface Paciente {
  id: string;
  nombre: string;
  rut: string;
  email: string;
  telefono: string;
  /** Fecha de la última visita (YYYY-MM-DD). */
  ultimaVisita: string;
  tratamiento: Tratamiento;
  estado: PacienteEstado;
  /** Revenue acumulado del paciente (financiero, spec §7.1). */
  revenueTotal: number;
  citasProgramadas: number;
  noShows: number;
  /** Fecha de la última cita (YYYY-MM-DD). */
  ultimaCita: string;
  createdAt: number;
  updatedAt: number;
}

/** Cita de la demo (entidad de la FSM de no-shows, spec §7.1). */
export interface Cita {
  id: string;
  pacienteId: string;
  /** Fecha de la cita (YYYY-MM-DD). */
  fecha: string;
  tratamiento: Tratamiento;
  estado: CitaStatus;
  /** Valor de la cita (USD). */
  valor: number;
  createdAt: number;
  updatedAt: number;
}

/** KPIs derivados del estado (NUNCA guardados independientes — invariante AC-1). */
export interface Kpi {
  /** Pacientes activos: count(estado='activo'). */
  activePatients: number;
  /** No-show rate: noShows / citasProgramadas × 100 (%). */
  noShowRate: number;
  /** Revenue total: Σ valor citas completed. */
  totalRevenue: number;
  /** Revenue per patient: totalRevenue / activePatients. */
  revenuePerPatient: number;
  /** Citas programadas: count(estado scheduled|confirmed). */
  scheduledAppointments: number;
  /** Citas completadas: count(estado completed). */
  completedAppointments: number;
}

/** Estado global de la demo (persistido en localStorage `demo-dashboard:v1`). */
export interface DemoState {
  version: 1;
  pacientes: Paciente[];
  citas: Cita[];
  /** Contador de pacientes creados (ids secuenciales). */
  pacienteCounter: number;
  /** Contador de citas creadas (ids secuenciales). */
  citaCounter: number;
  /** Marca si el seed fue aplicado. */
  seeded: boolean;
}

/**
 * CONTRATO AGÉNTICO (AC-5, CANON §8): las acciones que CUALQUIER IA externa
 * puede operar sobre la FSM determinista sin romperla. El reducer valida cada
 * transición. Incluye FSM de citas + CRUD de pacientes.
 */
export type AgentAction =
  // ── FSM de citas ──
  | { type: 'create_cita'; cita: Omit<Cita, 'id' | 'estado' | 'createdAt' | 'updatedAt'> }
  | { type: 'confirm_cita'; citaId: string }
  | { type: 'complete_cita'; citaId: string }
  | { type: 'no_show_cita'; citaId: string }
  | { type: 'cancel_cita'; citaId: string }
  // ── CRUD de pacientes ──
  | { type: 'create_paciente'; paciente: Omit<Paciente, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'update_paciente'; pacienteId: string; cambios: Partial<Omit<Paciente, 'id' | 'createdAt' | 'updatedAt'>> }
  | { type: 'delete_paciente'; pacienteId: string };

/** Resultado del reducer FSM (reduce). changed=false = transición inválida/REJECT. */
export interface ReduceResult {
  state: DemoState;
  changed: boolean;
  reason?: string;
}
