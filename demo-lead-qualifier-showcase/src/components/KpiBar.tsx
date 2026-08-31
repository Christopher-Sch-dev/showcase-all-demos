/**
 * KPIBAR — KPIs derivados (deriveKpi) con source visible del sector + proyecciones etiquetadas.
 * Consume el core (deriveKpi) y la config (metrics con source). Honestidad AC-7.
 */
import type { UIStrings } from '@/i18n/strings';
import type { Kpi } from '@/lib/types';
import type { NicheConfig } from '@/config/schema';
import { ExternalLink } from 'lucide-react';

export interface KpiBarProps {
  t: UIStrings;
  /** KPIs derivados del estado (nunca guardados). */
  kpi: Kpi;
  /** Config del nicho: metrics[] con source + accent (DI). */
  config: NicheConfig;
}

// rol: formatear tasas (0-1) a porcentaje.
function pct(v: number): string {
  return `${Math.round(v * 100)}%`;
}

export default function KpiBar({ t, kpi, config }: KpiBarProps) {
  const accent = config.aesthetic.accent;
  const staticCards = [
    { label: t.kpiTotalLeads, value: String(kpi.totalLeads) },
    { label: t.kpiQualified, value: String(kpi.qualifiedLeads) },
    { label: t.kpiBooked, value: String(kpi.bookedLeads) },
    { label: t.kpiAvgSpeed, value: `${kpi.avgSpeedToLeadSec.toFixed(0)}${t.kpiSeconds}` },
    { label: t.kpiResponseUnder60, value: pct(kpi.responseRateUnder60) },
    { label: t.kpiBookingRate, value: pct(kpi.bookingRate) },
  ];

  return (
    <div data-testid="kpi-bar" className="space-y-6">
      {/* KPIs derivados del demo en vivo */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {staticCards.map((c) => (
          <div key={c.label} className="rounded-lg border p-3">
            <div className="text-xs text-muted">{c.label}</div>
            <div className="mt-1 text-2xl font-bold" style={{ color: accent }}>
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Métricas del sector con source visible (AC-7) */}
      <div className="rounded-lg border p-4">
        <div className="mb-3 text-sm font-semibold">{t.kpiSource}</div>
        <ul className="space-y-2">
          {config.metrics.map((m, i) => (
            <li key={i} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-medium">{m.value}</span>
              <span className="text-muted">{m.label}</span>
              <a
                href={m.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] min-w-[44px] items-center gap-1 text-xs underline"
                style={{ color: accent }}
              >
                {t.kpiSource} <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs italic text-muted">{t.kpiEstimatedNote}</p>
      </div>
    </div>
  );
}
