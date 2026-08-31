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
      className="flex items-center gap-3 rounded-full border border-dashed px-3 py-1.5 text-xs"
      style={{ borderColor: '#C9A24B', color: '#C9A24B' }}
    >
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="font-mono uppercase tracking-widest">{t.modeBadge}</span>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1 rounded-full px-2 font-semibold transition hover:bg-black/10"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
        {t.reset}
      </button>
    </div>
  );
}
