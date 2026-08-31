/**
 * DEMOSHELL — orquesta el demo en vivo completo (LeadForm → QualifyCard → LeadDashboard → KpiBar → ModeBadge).
 * Es el ÚNICO island que monta useDemoState (estado compartido entre las islands hijas).
 * Consume la config del nicho (getNicheConfig) y el core. Consume, NO modifica.
 * El lead "activo" es el más reciente; se califica determinista y se puede agendar.
 */
import { useMemo } from 'react';
import type { UIStrings } from '@/i18n/strings';
import { getNicheConfig } from '@/config';
import type { Niche } from '@/lib/types';
import { useDemoState } from './useDemoState';
import LeadForm from './LeadForm';
import QualifyCard from './QualifyCard';
import LeadDashboard from './LeadDashboard';
import KpiBar from './KpiBar';
import ModeBadge from './ModeBadge';

export interface DemoShellProps {
  t: UIStrings;
  /** Nicho de la landing (config). */
  niche: Niche;
}

export default function DemoShell({ t, niche }: DemoShellProps) {
  const config = getNicheConfig(niche);
  const demo = useDemoState();
  const { state, qualify, book, reset, kpi, ready } = demo;

  // rol: lead activo = el más recientemente capturado (o el primero del seed).
  const activeLead = useMemo(() => state.leads[0] ?? undefined, [state.leads]);

  // config nunca undefined si el nicho existe (contrato Zod registrado en DEFAULT_REGISTRY).
  if (!config) return null;

  const accent = config.aesthetic.accent;
  const radius = config.aesthetic.radius;

  return (
    <div data-testid="demo-shell" className="space-y-6">
      <ModeBadge t={t} onReset={reset} />

      {/* Solution: form + cualificación en vivo */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LeadForm t={t} niche={niche} demo={demo} />
        {activeLead && (
          <QualifyCard
            t={t}
            lead={activeLead}
            accent={accent}
            radius={radius}
            bookingUrl={config.cta.url}
            demo={{ qualify, book }}
            ctaLabel={config.cta.label}
          />
        )}
      </div>

      {/* KPIs del sector + demo en vivo */}
      {ready && (
        <div data-testid="demo-ready">
          <KpiBar t={t} kpi={kpi} config={config} />
        </div>
      )}

      {/* Dashboard de leads persistidos */}
      <LeadDashboard t={t} state={state} config={config} />

      {/* Ética de bar: solo si el nicho lo requiere (Law). La config lo decide, no hardcode. */}
      {config.integrations.some((i) => i.name.includes('Conflict')) && (
        <p data-testid="ai-ethics" className="rounded-lg border p-4 text-sm italic text-muted">
          {t.aiEthicsNote}
        </p>
      )}
    </div>
  );
}
