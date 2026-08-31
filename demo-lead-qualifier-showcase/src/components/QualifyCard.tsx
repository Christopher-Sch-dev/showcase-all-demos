/**
 * QUALIFYCARD — muestra score + razón de la calificación + timer countdown <60s visible
 * + CTA "Agenda consulta" → book(bookingUrl=Calendly central). NUNCA mailto.
 * Si el lead es "new" y aún no calificó, muestra countdown y llama qualify (determinista).
 * Consume el core (useDemoState.qualify/book) y la config (accent/radius) por DI.
 */
import { useEffect, useRef, useState } from 'react';
import { Timer, ShieldCheck, BadgeCheck } from 'lucide-react';
import type { UIStrings } from '@/i18n/strings';
import type { Lead } from '@/lib/types';
import StatusBadge from './ui/StatusBadge';
import CTACalendly from './ui/CTACalendly';

// rol: label i18n del estado para StatusBadge.
function statusLabel(t: UIStrings, status: Lead['status']): string {
  switch (status) {
    case 'booked':
      return t.statusBooked;
    case 'qualified':
      return t.statusQualified;
    default:
      return t.statusNew;
  }
}

export interface QualifyCardProps {
  t: UIStrings;
  /** Lead actual del demo (new → calificará en vivo). */
  lead: Lead;
  /** Acento desde config.aesthetic.accent. */
  accent: string;
  /** radius desde config.aesthetic.radius. */
  radius: 'pill' | 'rounded';
  /** Calendly central (config.cta.url). */
  bookingUrl: string;
  demo: {
    qualify: (lead: Lead) => void;
    book: (leadId: string, bookingUrl: string) => void;
  };
  /** Texto del CTA agendar (config.cta.label o i18n). */
  ctaLabel: string;
}

// rol: formato de ms a "Xs" para el timer.
function formatSec(ms: number): string {
  return `${Math.max(0, Math.round(ms / 1000))}s`;
}

export default function QualifyCard({ t, lead, accent, radius, bookingUrl, demo, ctaLabel }: QualifyCardProps) {
  // rol: medir el speed-to-lead en vivo entre capturedAt y now (timer <60s).
  const [now, setNow] = useState(() => Date.now());
  // rol: trackear auto-calificación POR LEAD (ref por id), no por componente: si llega un
  // lead distinto (p.ej. doble-submit), el nuevo también debe calificarse. (bug real adversarial)
  const [autoQualifiedId, setAutoQualifiedId] = useState<string | null>(null);
  const qualified = lead.status === 'qualified' || lead.status === 'booked';
  const respondedMs = lead.respondedAt ? lead.respondedAt - lead.capturedAt : undefined;

  // rol: si el lead sigue "new" y no es el que ya auto-calificamos, calificarlo (IA invisible, determinista).
  useEffect(() => {
    if (lead.status === 'new' && autoQualifiedId !== lead.id) {
      demo.qualify(lead);
      setAutoQualifiedId(lead.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead.status, lead.id]);

  // rol: tick del timer cada 250ms mientras el lead no haya respondido.
  useEffect(() => {
    if (qualified) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [qualified]);

  const elapsedMs = now - lead.capturedAt;
  const under60 = qualified && respondedMs !== undefined && respondedMs < 60000;

  return (
    <div data-testid="qualify-card" className="rounded-lg border p-5" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          {lead.name}
        </div>
        <StatusBadge status={lead.status} accent={accent} label={statusLabel(t, lead.status)} />
      </div>

      {/* Timer / speed-to-lead */}
      <div className="mt-4 flex items-center gap-2 text-sm" data-testid="timer">
        <Timer className="h-4 w-4" aria-hidden="true" />
        {qualified ? (
          <span>
            {t.timerResponded}{' '}
            <strong data-testid="speed">{respondedMs !== undefined ? formatSec(respondedMs) : '—'}</strong>
            {under60 ? ' · <60s ✓' : ' · >60s'}
          </span>
        ) : (
          <span>
            {t.timerLabel}{' '}
            <strong data-testid="countdown">{formatSec(60000 - elapsedMs)}</strong> / 60s
          </span>
        )}
      </div>

      {/* Score + razón */}
      {lead.qualification && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm text-muted">{t.scoreLabel}</span>
            <span className="ml-auto text-2xl font-bold" data-testid="score">
              {lead.qualification.score}
            </span>
          </div>
          <p className="text-sm text-muted" data-testid="reason">
            {lead.qualification.reason}
          </p>
        </div>
      )}

      {/* CTA agendar → Calendly (AC-3/8) */}
      {qualified && (
        <div className="mt-5">
          <CTACalendly
            href={bookingUrl}
            label={lead.status === 'booked' ? t.bookedCta : ctaLabel}
            radius={radius}
            accent={accent}
            onClick={lead.status === 'qualified' ? () => demo.book(lead.id, bookingUrl) : undefined}
          />
        </div>
      )}
    </div>
  );
}
