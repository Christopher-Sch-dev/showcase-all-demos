/**
 * ROI CALCULATOR — mini-calculador de ROI (venta §2.4). Consume config.roiFormula.compute.
 * Multiplica datos del sector citados por inputs del prospecto. Proyección SIEMPRE etiquetada
 * "Estimated based on industry averages" . Presentacional, sin lógica de negocio.
 */
import { useState } from 'react';
import type { NicheConfig } from '../config/schema';
import type { UiStrings } from '../i18n/strings';
import { formatCurrency } from './ui/format';
import { computeRoi } from './ui/roiFormula';

interface Props {
 config: NicheConfig;
 strings: UiStrings;
}

export default function RoiCalculator({ config, strings }: Props) {
 const f = config.roiFormula;
 const [input, setInput] = useState<number>(f.inputDefault);
 // computeRoi importado (no config.roiFormula.compute): Astro no serializa funciones
 // en props de islands (bug de producción detectado por E2E real). Misma fórmula que la config.
 const recovered = computeRoi(input);

 return ( <div className="rounded-card border border-border bg-surface p-6 shadow-sm">
 <label htmlFor="roi-input" className="mb-2 block text-sm font-medium text-text-secondary">
 {strings.roi.inputLabel}
 </label>
 <div className="flex items-center gap-3">
 <input
 id="roi-input"
 type="range"
 min={f.inputMin}
 max={f.inputMax}
 step={f.inputStep}
 value={input}
 onChange={(e) => setInput(Number(e.target.value))}
 className="min-h-[44px] w-full accent-accent"
 aria-label={f.inputLabel}
 />
 <span className="w-16 text-right font-display text-lg font-bold text-accent-strong">{input}</span>
 </div>
 <div className="mt-4 rounded-lg bg-accent-soft p-4">
 <p className="text-sm text-text-secondary">{strings.kpi.estimatedNote}</p>
 <p className="mt-1 font-display text-2xl font-bold text-accent-strong">
 {formatCurrency(recovered, strings.lang)}
 <span className="ml-1 text-sm font-medium text-text-secondary">{strings.roi.perYear}</span>
 </p>
 </div>
 </div>
);
}
