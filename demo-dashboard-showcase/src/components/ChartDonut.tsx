/**
 * CHART DONUT — donut chart de revenueByTreatment .
 * Consume el core determinista (charts.ts). Presentacional, sin lógica de negocio.
 * Paleta: teal + lavanda + neutros (estética light clínico). Accesible: leyenda + aria-label.
 * prefers-reduced-motion: la animación de stroke se desactiva vía CSS global.
 */
import type { DemoState } from '../lib/types';
import type { TreatmentPoint } from '../lib/charts';
import type { UiStrings } from '../i18n/strings';
import { revenueByTreatment } from '../lib/charts';
import { formatCurrency } from './ui/format';

interface Props {
 state: DemoState;
 strings: UiStrings;
}

/** Paleta de segmentos (teal + lavanda + neutros — light clínico). */
const PALETTE = ['#2F9E9B', '#B8A7E8', '#7FB8B6', '#D9CFF2', '#4B5563'];

export default function ChartDonut({ state, strings }: Props) {
 const data: TreatmentPoint[] = revenueByTreatment(state);
 const total = data.reduce((s, d) => s + d.value, 0);
 const title = strings.charts.revenueByTreatment;

 // Construir arcos SVG (donut) con stroke-dasharray por segmento.
 let acc = 0;
 const segments = data.map((d, i) => {
 const frac = total === 0 ? 0 : d.value / total;
 const start = acc;
 acc += frac;
 return { ...d, color: PALETTE[i % PALETTE.length], start, frac };
 });

 return ( <section aria-label={title} className="rounded-card border border-border bg-surface p-4 shadow-sm">
 <h3 className="font-display text-base font-semibold text-text">{title}</h3>
 <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
 <div className="relative h-40 w-40" role="img" aria-label={`${title}: ${data.length} treatments`}>
 <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
 <circle cx="21" cy="21" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="6" />
 {segments.map((s) => ( <circle
 key={s.treatment}
 cx="21"
 cy="21"
 r="15.9"
 fill="none"
 stroke={s.color}
 strokeWidth="6"
 strokeDasharray={`${s.frac * 100} ${100 - s.frac * 100}`}
 strokeDashoffset={-s.start * 100}
 className="transition-[stroke-dasharray] duration-300 ease-out"
 />
))}
 </svg>
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="font-display text-lg font-bold text-text">{formatCurrency(total, strings.lang)}</span>
 </div>
 </div>
 <ul className="w-full space-y-1.5" aria-label={strings.charts.legend}>
 {segments.map((s) => ( <li key={s.treatment} className="flex items-center justify-between gap-2 text-sm">
 <span className="flex items-center gap-2 text-text-secondary">
 <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: s.color }} aria-hidden="true" />
 {s.treatment}
 </span>
 <span className="font-medium text-text">{formatCurrency(s.value, strings.lang)}</span>
 </li>
))}
 </ul>
 </div>
 </section>
);
}
