/**
 * CTACALENDLY — componente CTA que SIEMPRE apunta a calendly.com/csch1305 (AC-3/AC-8).
 * NUNCA mailto. touch >= 44px. target=_blank rel=noopener.
 * La URL sale de config.cta.url (contrato Zod), que es literal a la Calendly central.
 */
import { CalendarClock } from 'lucide-react';

export interface CTACalendlyProps {
  /** URL de CTA desde config.cta.url (contrato Zod, literal Calendly). */
  href: string;
  /** Texto del CTA (i18n o config.cta.label). */
  label: string;
  /** Radio: pill (RE) o rounded (Law), desde config.aesthetic.radius. */
  radius?: 'pill' | 'rounded';
  /** Acento del CTA (config.aesthetic.accent). */
  accent: string;
  /** Texto del CTA sobre el acento (contraste). */
  fg?: string;
  /** Acción al hacer clic (p.ej. dispatch book antes de abrir Calendly). */
  onClick?: () => void;
}

export default function CTACalendly({ href, label, radius = 'pill', accent, fg = '#ffffff', onClick }: CTACalendlyProps) {
  const radiusClass = radius === 'pill' ? 'rounded-full' : 'rounded-lg';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="cta-calendly"
      onClick={onClick}
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 px-6 py-3 font-semibold transition ${radiusClass}`}
      style={{ backgroundColor: accent, color: fg }}
    >
      <CalendarClock className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}
