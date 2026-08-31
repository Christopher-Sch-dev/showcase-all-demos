/**
 * STATUS BADGE — badge de estado de cita (FSM) o paciente con color semántico + icono lucide.
 * Presentacional: recibe el estado y los strings ya resueltos (DI). Sin lógica de negocio.
 * Colores semánticos (light clínico): confirmed=teal, scheduled=lavanda, completed=success,
 * no_show=danger, cancelled=muted. Paciente: activo=teal, pendiente=ámbar, inactivo=gris.
 */
import type { CitaStatus, PacienteEstado } from '../../lib/types';
import type { UiStrings } from '../../i18n/strings';
import { CalendarCheck, CalendarClock, CheckCircle2, XCircle, Ban, UserCheck, UserX, Clock } from 'lucide-react';

export type StatusValue = CitaStatus | PacienteEstado;

interface Props {
 value: StatusValue;
 strings: UiStrings;
}

/** Mapa de estilo + icono por estado (semántico, no hardcode de nicho). */
const STYLE: Record<StatusValue, { cls: string; Icon: typeof CheckCircle2 }> = {
 // Citas (FSM)
 scheduled: { cls: 'bg-lavender-soft text-accent-strong', Icon: CalendarClock },
 confirmed: { cls: 'bg-accent-soft text-accent-strong', Icon: CalendarCheck },
 completed: { cls: 'bg-accent-soft text-accent-strong', Icon: CheckCircle2 },
 no_show: { cls: 'bg-red-100 text-danger', Icon: XCircle },
 cancelled: { cls: 'bg-gray-100 text-text-secondary', Icon: Ban },
 // Pacientes
 activo: { cls: 'bg-accent-soft text-accent-strong', Icon: UserCheck },
 inactivo: { cls: 'bg-gray-100 text-text-secondary', Icon: UserX },
 pendiente: { cls: 'bg-amber-100 text-warning', Icon: Clock },
};

export default function StatusBadge({ value, strings }: Props) {
 const { cls, Icon } = STYLE[value] ?? STYLE.cancelled;
 const label = strings.status[value] ?? value;
 return ( <span
 className={`inline-flex min-h-[28px] items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium ${cls}`}
 role="status"
 aria-label={label}
 >
 <Icon className="h-3.5 w-3.5" aria-hidden="true" />
 {label}
 </span>
);
}
