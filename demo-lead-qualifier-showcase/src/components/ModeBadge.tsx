/**
 * MODEBADGE — badge "MODO DEMO" siempre visible (AC-9) + botón reset (resetDemo).
 * Ungated, sin registro. La CTA de cierre puede anclarse a Calendly.
 */
import { FlaskConical, RotateCcw } from 'lucide-react';
import type { UIStrings } from '@/i18n/strings';

export interface ModeBadgeProps {
  /** Strings de UI (i18n). */
  t: UIStrings;
  /** Acción de reset (resetDemo del core + re-sync de estado). */
  onReset: () => void;
}

export default function ModeBadge({ t, onReset }: ModeBadgeProps) {
  return (
    <div
      data-testid="mode-badge"
      className="inline-flex items-center gap-3 rounded-full px-4 py-1.5 text-xs"
      style={{
        border: '1px solid var(--lq-accent-soft)',
        backgroundColor: 'var(--lq-accent-soft)',
        color: 'var(--brand-accent)',
      }}
    >
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="uppercase tracking-[0.16em]">{t.modeBadge}</span>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-full px-2 font-medium uppercase tracking-[0.12em] transition-opacity hover:opacity-60"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        {t.reset}
      </button>
    </div>
  );
}
