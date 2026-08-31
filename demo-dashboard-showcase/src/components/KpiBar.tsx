/**
 * KPI BAR — 6 KPIs derivados (deriveKpi) con source visible .
 * Consume el core determinista (deriveKpi) + la config Zod del nicho (metrics[] con source).
 * Presentacional: recibe el estado y la config ya resuelta (DI). NUNCA if-por-nicho.
 * Honestidad: métricas del sector con source; proyecciones etiquetadas "Estimated based on industry averages".
 */
import type { DemoState, Kpi } from '../lib/types';
import type { NicheConfig } from '../config/schema';
import type { UiStrings } from '../i18n/strings';
import { deriveKpi } from '../lib/kpi';
import { formatCurrency, formatPercent } from './ui/format';
import { Users, CalendarX2, DollarSign, UserCheck, CalendarClock, CheckCircle2 } from 'lucide-react';

interface Props {
 state: DemoState;
 config: NicheConfig;
 strings: UiStrings;
}

/** Icono + label por KPI (presentación, no lógica). */
function kpiMeta(k: Kpi, strings: UiStrings) {
 return [
 { key: 'activePatients', label: strings.kpi.activePatients, value: String(k.activePatients), Icon: Users },
 { key: 'noShowRate', label: strings.kpi.noShowRate, value: formatPercent(k.noShowRate, strings.lang), Icon: CalendarX2 },
 { key: 'totalRevenue', label: strings.kpi.totalRevenue, value: formatCurrency(k.totalRevenue, strings.lang), Icon: DollarSign },
 { key: 'revenuePerPatient', label: strings.kpi.revenuePerPatient, value: formatCurrency(k.revenuePerPatient, strings.lang), Icon: UserCheck },
 { key: 'scheduledAppointments', label: strings.kpi.scheduledAppointments, value: String(k.scheduledAppointments), Icon: CalendarClock },
 { key: 'completedAppointments', label: strings.kpi.completedAppointments, value: String(k.completedAppointments), Icon: CheckCircle2 },
 ];
}

export default function KpiBar({ state, config, strings }: Props) {
 const kpi = deriveKpi(state);
 const items = kpiMeta(kpi, strings);
 return ( <section aria-label="Key performance indicators" className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
 {items.map(({ key, label, value, Icon }) => ( <div key={key} className="rounded-card border border-border bg-surface p-4 shadow-sm">
 <div className="flex items-center gap-2 text-text-secondary">
 <Icon className="h-4 w-4 text-accent" aria-hidden="true" />
 <span className="text-xs font-medium">{label}</span>
 </div>
 <p className="mt-2 font-display text-2xl font-bold text-text">{value}</p>
 {/* Source visible : métricas del sector con source; proyecciones etiquetadas. */}
 {key === 'noShowRate' || key === 'revenuePerPatient' ? ( <p className="mt-1 text-[11px] leading-tight text-text-muted">
 {strings.kpi.estimatedNote}
 </p>
) : null}
 </div>
))}
 </section>
);
}
