/**
 * CHART BAR — bar chart de revenueByMonth / appointmentsByMonth .
 * Consume el core determinista (charts.ts). Presentacional, sin lógica de negocio.
 * Accesible: aria-label por barra + valor visible (no color como único canal).
 * prefers-reduced-motion: la animación de altura se desactiva vía CSS global.
 */
import type { DemoState } from '../lib/types';
import type { MonthPoint } from '../lib/charts';
import type { UiStrings } from '../i18n/strings';
import { revenueByMonth, appointmentsByMonth } from '../lib/charts';
import { formatCurrency } from './ui/format';

interface Props {
 state: DemoState;
 strings: UiStrings;
 /** 'revenue' (revenueByMonth) o 'appointments' (appointmentsByMonth). */
 kind: 'revenue' | 'appointments';
}

export default function ChartBar({ state, strings, kind }: Props) {
 const data: MonthPoint[] = kind === 'revenue' ? revenueByMonth(state) : appointmentsByMonth(state);
 const title = kind === 'revenue' ? strings.charts.revenueByMonth : strings.charts.appointmentsByMonth;
 const max = Math.max(1, ...data.map((d) => d.value));
 return ( <section aria-label={title} className="rounded-card border border-border bg-surface p-4 shadow-sm">
 <h3 className="font-display text-base font-semibold text-text">{title}</h3>
 <div className="mt-4 flex h-48 items-end gap-1.5" role="img" aria-label={`${title}: ${data.length} months`}>
 {data.length === 0 ? ( <p className="text-sm text-text-muted">—</p>
) : ( data.map((d) => ( <div key={d.month} className="group flex flex-1 flex-col items-center gap-1" aria-label={`${d.month}: ${d.value}`}>
 <span className="text-[10px] text-text-muted">
 {kind === 'revenue' ? formatCurrency(d.value, strings.lang) : d.value}
 </span>
 <div
 className="w-full rounded-t bg-accent transition-[height] duration-300 ease-out group-hover:bg-accent-strong"
 style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
 />
 <span className="text-[10px] text-text-muted">{d.month.slice(5)}</span>
 </div>
))
)}
 </div>
 </section>
);
}
