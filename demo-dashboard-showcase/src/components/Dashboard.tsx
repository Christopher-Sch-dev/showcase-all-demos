/**
 * DASHBOARD — orquestador del flujo funcional .
 * Consume el core determinista (loadState/saveState/resetDemo/reduce) + la config Zod
 * del nicho (getNicheConfig). Presentacional: une las islands (KpiBar, charts, tabla).
 * Badge MODO DEMO siempre visible + botón Reset + CTA Calendly (demo segura).
 * client:load — estado en vivo con persistencia localStorage.
 */
import { useState } from 'react';
import type { DemoState } from '../lib/types';
import type { NicheConfig } from '../config/schema';
import type { UiStrings } from '../i18n/strings';
import { loadState, saveState, resetDemo } from '../lib/storage';
import { CALENDLY_URL } from '../lib/constants';
import KpiBar from './KpiBar';
import ChartBar from './ChartBar';
import ChartDonut from './ChartDonut';
import PatientTable from './PatientTable';
import ModeBadge from './ModeBadge';
import CTACalendly from './ui/CTACalendly';
import { RotateCcw } from 'lucide-react';

interface Props {
 config: NicheConfig;
 strings: UiStrings;
}

export default function Dashboard({ config, strings }: Props) {
 const [state, setState] = useState<DemoState>(() => loadState());

 const handleReset = () => {
 if (window.confirm(strings.reset.confirm)) {
 resetDemo();
 setState(loadState());
 }
 };

 return ( <div className="space-y-6">
 {/* Header: título + badge MODO DEMO + reset */}
 <div className="flex flex-wrap items-center justify-between gap-3">
 <div>
 <p className="text-xs font-medium uppercase tracking-widest text-accent-strong">{strings.dashboard.eyebrow}</p>
 <h2 className="font-display text-2xl font-bold text-text">{strings.dashboard.title}</h2>
 </div>
 <div className="flex items-center gap-3">
 <ModeBadge strings={strings} />
 <button
 onClick={handleReset}
 className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-border px-4 font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
 >
 <RotateCcw className="h-4 w-4" aria-hidden="true" />
 {strings.reset.label}
 </button>
 </div>
 </div>

 {/* KPIs derivados */}
 <KpiBar state={state} config={config} strings={strings} />

 {/* Charts */}
 <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
 <ChartBar state={state} strings={strings} kind="revenue" />
 <ChartDonut state={state} strings={strings} />
 </div>

 {/* Tabla paginada + filtros + CRUD */}
 <PatientTable state={state} strings={strings} onStateChange={setState} />

 {/* CTA cierre (, demo segura) */}
 <div className="flex flex-col items-center gap-3 rounded-card border border-border bg-surface p-6 text-center shadow-sm">
 <p className="font-display text-lg font-semibold text-text">{strings.cta.bookDemo}</p>
 <CTACalendly label={config.cta.label} url={config.cta.url ?? CALENDLY_URL} strings={strings} microTrust={strings.cta.microTrust} />
 </div>
 </div>
);
}
