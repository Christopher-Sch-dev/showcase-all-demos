import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { ui, type Locale } from '../i18n/strings';

// rol: guía de onboarding del dashboard — paso a paso LITERAL (qué botón, en qué orden)
// del flujo captura → califica → agenda → asigna → despacha → completa → factura.
// Lenguaje de negocio, no técnico. Colapsable (toggle Show/Hide). i18n EN/es via prop.
// Visible por defecto como card principal para que el prospecto sepa usar la demo.

/** Guía de uso del dashboard (primer card, colapsable). */
export function OnboardingGuide({ locale = 'en' }: { locale?: Locale }) {
  const [open, setOpen] = useState(true);
  const t = ui[locale].onboarding;

  return (
    <div
      data-testid="onboarding-guide"
      className="overflow-hidden rounded-lg border border-hvac-brand/40 bg-hvac-surface"
    >
      {/* header colapsable */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 border-b border-hvac-border-real px-4 py-3 text-left transition-colors hover:bg-hvac-neutral"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-hvac-brand" aria-hidden />
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide text-hvac-text">
            {t.title}
          </h2>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-hvac-border-real bg-hvac-base px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-hvac-text">
          {open ? t.toggleHide : t.toggleShow}
          {open ? (
            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          )}
        </span>
      </button>

      {open && (
        <div className="px-4 py-4">
          <p className="font-body text-sm text-hvac-muted">{t.subtitle}</p>

          {/* pasos numerados 1-4 */}
          <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.steps.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-3 rounded-md border border-hvac-border-real bg-hvac-base p-3"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-hvac-brand bg-hvac-brand/10 font-display text-base font-bold text-hvac-brand">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-hvac-text">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-hvac-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* nota de auto-calificación */}
          <div className="mt-4 rounded-md border border-hvac-border-real bg-hvac-neutral p-3">
            <p className="flex items-center gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-hvac-text">
              <Sparkles className="h-3.5 w-3.5 text-hvac-brand" aria-hidden />
              {t.tipTitle}
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-hvac-muted">{t.tipBody}</p>
          </div>
        </div>
      )}
    </div>
  );
}
