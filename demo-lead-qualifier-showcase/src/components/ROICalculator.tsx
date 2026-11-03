/**
 * ROICALCULATOR — slider ROI que usa config.roiFormula (compute) → valor anual.
 * Proyección SIEMPRE etiquetada "Estimated based on industry averages" (AC-7).
 * CTA Calendly. Consume la config (DI); NUNCA if-por-nicho.
 */
import { useState } from 'react';
import type { UIStrings } from '@/i18n/strings';
import type { NicheConfig } from '@/config/schema';
import { computeAnnual, formatUSDCompact } from '@/lib/roi';
import CTACalendly from './ui/CTACalendly';

export interface ROICalculatorProps {
  t: UIStrings;
  /** Config del nicho: roiFormula (inputKey/inputMin/inputMax/inputStep/inputDefault/multiplier/note). */
  config: NicheConfig;
}

export default function ROICalculator({ t, config }: ROICalculatorProps) {
  const roi = config.roiFormula;
  const [value, setValue] = useState<number>(roi.inputDefault);
  // rol: la fórmula es dato serializable (multiplier), no una función del config.
  const annual = computeAnnual(roi.multiplier, value);

  return (
    <div data-testid="roi-calculator" className="lq-panel p-7">
      <label htmlFor="roi-input" className="lq-field-label">
        {roi.inputLabel}
      </label>
      <input
        id="roi-input"
        data-testid="roi-input"
        type="range"
        min={roi.inputMin}
        max={roi.inputMax}
        step={roi.inputStep}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--brand-accent)]"
        style={{ accentColor: 'var(--brand-accent)' }}
        aria-label={roi.inputLabel}
      />
      <div className="lq-label mt-2 flex justify-between">
        <span>{roi.inputMin}</span>
        <span style={{ color: 'var(--brand-accent)' }}>{value}</span>
        <span>{roi.inputMax}</span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="lq-label">{t.roiAnnualValue}</div>
          <div
            className="lq-num mt-2"
            style={{
              color: 'var(--brand-accent)',
              fontSize: 'clamp(2.6rem, 5vw, 3.6rem)',
            }}
          >
            {formatUSDCompact(annual)}
          </div>
          <p className="mt-2 text-xs italic text-muted">{roi.note}</p>
        </div>
      </div>

      <div className="mt-6">
        <CTACalendly
          href={config.cta.url}
          label={t.roiCta}
          radius={config.aesthetic.radius}
          accent={config.aesthetic.accent}
        />
      </div>
    </div>
  );
}
