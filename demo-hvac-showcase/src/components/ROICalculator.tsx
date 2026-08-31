import { useMemo, useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';
import { hvacConfig } from '../config/niches/hvac';
import { formatCurrency } from '../lib/intl';

// rol: calculadora de ROI del add-on IA. Slider de llamadas perdidas/semana → compute()
// del roiFormula → revenue anual recuperado (USD). Nota honesta + CTA Calendly.

const { roiFormula, cta } = hvacConfig;

/** Calculadora de ROI: slider + revenue proyectado + nota honesta + CTA. */
export function ROICalculator() {
  // rol: input del prospecto (missed calls per week), arranca en inputDefault.
  const [missed, setMissed] = useState(roiFormula.inputDefault);

  // rol: compute() puro del config (determinista); useMemo para no recalcular en cada render.
  const revenue = useMemo(() => roiFormula.compute(missed), [missed]);

  const pct = Math.round((missed / roiFormula.inputMax) * 100);

  return (
    <div className="overflow-hidden rounded-lg border border-hvac-border-real bg-hvac-surface">
      <div className="flex items-center gap-2 border-b border-hvac-border-real px-4 py-3">
        <Calculator className="h-4 w-4 text-hvac-brand" aria-hidden />
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-hvac-text">
          Revenue you're leaving on the table
        </h3>
      </div>

      <div className="px-4 py-4">
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="roi-slider" className="font-body text-sm font-medium text-hvac-text">
            {roiFormula.inputLabel}
          </label>
          <span className="font-display text-2xl font-bold text-hvac-brand">{missed}</span>
        </div>

        <input
          id="roi-slider"
          type="range"
          role="slider"
          min={roiFormula.inputMin}
          max={roiFormula.inputMax}
          step={roiFormula.inputStep}
          value={missed}
          onChange={(e) => setMissed(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-hvac-neutral accent-hvac-brand"
          aria-label={roiFormula.inputLabel}
        />

        {/* barra de progreso del rango */}
        <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-hvac-neutral">
          <div className="h-full bg-hvac-brand" style={{ width: `${pct}%` }} aria-hidden />
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-md border border-hvac-border-real bg-hvac-base p-3">
        <div className="flex items-baseline justify-between">
          <span className="flex items-center gap-1.5 font-body text-xs font-medium uppercase tracking-wide text-hvac-muted">
            <TrendingUp className="h-3.5 w-3.5" aria-hidden />
            Recovered / year
          </span>
          <span className="font-display text-3xl font-bold text-hvac-on-route">
            {formatCurrency(revenue)}
          </span>
        </div>
        <p className="mt-1 text-[11px] text-hvac-muted">{roiFormula.note}</p>
      </div>

      <div className="px-4 pb-4">
        <a
          href={cta.url}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-hvac-steel bg-hvac-steel px-3 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          {cta.label}
        </a>
      </div>
    </div>
  );
}
