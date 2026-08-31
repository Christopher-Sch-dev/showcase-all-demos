/**
 * STATUSBADGE — badge de estado de lead (new/qualified/booked) con color semántico + icono lucide.
 * Consume la config del nicho (accent) para el estado "qualified"; NO if-por-nicho en el componente.
 * Semántica de estado (no de nicho): new=neutro, qualified=acento de marca, booked=verde/éxito.
 */
import { CircleDot, BadgeCheck, CalendarCheck2 } from 'lucide-react';
import type { LeadStatus } from '@/lib/types';

// fix: CircleCheck no existe en lucide — usar CircleDot para new.
export interface StatusBadgeProps {
  status: LeadStatus;
  /** Acento de marca desde config.aesthetic.accent (para "qualified"). */
  accent: string;
  /** Texto del estado (i18n). */
  label: string;
}

// rol: mapear estado → color de fondo y texto (semántico, NO por nicho).
function colorFor(status: LeadStatus, accent: string): { bg: string; fg: string } {
  switch (status) {
    case 'booked':
      return { bg: '#22c55e', fg: '#06281a' }; // verde éxito
    case 'qualified':
      return { bg: accent, fg: '#ffffff' }; // acento de marca
    default:
      return { bg: '#8A8F98', fg: '#FFFFFF' }; // neutro (new)
  }
}

// rol: icono por estado (lucide), semántico.
function iconFor(status: LeadStatus) {
  switch (status) {
    case 'booked':
      return CalendarCheck2;
    case 'qualified':
      return BadgeCheck;
    default:
      return CircleDot;
  }
}

export default function StatusBadge({ status, accent, label }: StatusBadgeProps) {
  const { bg, fg } = colorFor(status, accent);
  const Icon = iconFor(status);
  return (
    <span
      data-testid="status-badge"
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: bg, color: fg }}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
