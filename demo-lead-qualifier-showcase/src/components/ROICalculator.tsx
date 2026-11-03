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
    <div data-testid="roi-calculator" className="rounded-lg border p-5">
      <label htmlFor="roi-input" className="mb-2 block text-sm font-medium">
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
        className="w-full"
        aria-label={roi.inputLabel}
      />
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span>{roi.inputMin}</span>
        <span className="font-semibold">{value}</span>
        <span>{roi.inputMax}</span>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="text-xs text-muted">{t.roiAnnualValue}</div>
          <div className="text-3xl font-bold" style={{ color: config.aesthetic.accent }}>
            {formatUSDCompact(annual)}
          </div>
          <p className="mt-1 text-xs italic text-muted">{roi.note}</p>
        </div>
      </div>

      <div className="mt-5">
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
