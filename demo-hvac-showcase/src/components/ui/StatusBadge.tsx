import { CircleCheck, Clock3, Flame, UserCheck, XCircle } from 'lucide-react';
import type { LeadStatus, Priority } from '../../lib/types';

// rol: badge semántico de estado de lead: color por estado FSM + icono lucide + uppercase.

type Tone = 'success' | 'accent' | 'neutral' | 'muted' | 'urgent';

// rol: mapa de color semántico por estado (invariante visual del spec).
const TONE_BY_STATUS: Record<LeadStatus, Tone> = {
  completed: 'success',
  invoiced: 'success',
  dispatched: 'accent',
  in_progress: 'accent',
  scheduled: 'neutral',
  booked: 'neutral',
  qualified: 'neutral',
  canceled: 'muted',
  no_show: 'muted',
  lead: 'neutral',
};

// rol: clases Tailwind por tono (borde real 1px, sin sombras difusas).
const TONE_CLASS: Record<Tone, string> = {
  success: 'text-[#16A34A] bg-[#16A34A]/10 border-[#16A34A]/30',
  accent: 'text-hvac-accent bg-hvac-accent/10 border-hvac-accent/30',
  neutral: 'text-hvac-text bg-hvac-neutral border-hvac-border-real',
  muted: 'text-hvac-muted bg-hvac-neutral border-hvac-border-real',
  urgent: 'text-hvac-urgent bg-hvac-urgent/10 border-hvac-urgent/30',
};

const ICON_BY_STATUS: Record<LeadStatus, typeof CircleCheck> = {
  completed: CircleCheck,
  invoiced: CircleCheck,
  dispatched: Clock3,
  in_progress: Clock3,
  scheduled: Clock3,
  booked: Clock3,
  qualified: UserCheck,
  canceled: XCircle,
  no_show: XCircle,
  lead: UserCheck,
};

const LABEL: Record<LeadStatus, string> = {
  lead: 'LEAD',
  qualified: 'QUALIFIED',
  booked: 'BOOKED',
  scheduled: 'SCHEDULED',
  dispatched: 'DISPATCHED',
  in_progress: 'IN PROGRESS',
  completed: 'COMPLETED',
  invoiced: 'INVOICED',
  canceled: 'CANCELED',
  no_show: 'NO SHOW',
};

export interface StatusBadgeProps {
  status: LeadStatus;
  priority?: Priority;
}

/** Badge semántico de estado con color por FSM, icono lucide, mono uppercase. */
export function StatusBadge({ status, priority }: StatusBadgeProps) {
  // rol: la prioridad urgente sobreescribe el tono neutral del estado (urgencia de venta).
  const tone: Tone = priority === 'urgent' ? 'urgent' : TONE_BY_STATUS[status];
  const Icon = priority === 'urgent' ? Flame : ICON_BY_STATUS[status];
  const label = priority === 'urgent' ? 'Urgent' : LABEL[status];

  return (
    <span
      data-testid="status-badge"
      data-tone={tone}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${TONE_CLASS[tone]}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}
