import { Phone, DollarSign, Timer, TrendingUp } from 'lucide-react';
import type { DemoState } from '../lib/types';
import { deriveKpi } from '../lib/kpi';
import { formatCurrency, formatPercent } from '../lib/intl';

// rol: barra de 4 KPIs derivados del estado (deriveKpi). Cards blancas con borde real 1px.

interface KpiCard {
  label: string;
  value: string;
  unit?: string;
  tone: 'brand' | 'success' | 'accent' | 'neutral';
  icon: typeof Phone;
}

/** Barra de 4 KPIs del funnel, derivada del estado determinista. */
export function KpiBar({ state }: { state: DemoState }) {
  const k = deriveKpi(state);

  const cards: KpiCard[] = [
    { label: 'Calls captured', value: String(k.totalCallsCaptured), tone: 'brand', icon: Phone },
    {
      label: 'Recovered revenue',
      value: formatCurrency(k.recoveredRevenue),
      tone: 'success',
      icon: DollarSign,
    },
    {
      label: 'Avg speed-to-lead',
      value: String(Math.round(k.avgSpeedToLeadMin)),
      unit: 'min',
      tone: 'accent',
      icon: Timer,
    },
    {
      label: 'Conversion',
      value: formatPercent(k.conversionRate),
      tone: 'neutral',
      icon: TrendingUp,
    },
  ];

  const toneValue: Record<KpiCard['tone'], string> = {
    brand: 'text-hvac-brand',
    success: 'text-hvac-on-route',
    accent: 'text-hvac-accent',
    neutral: 'text-hvac-text',
  };

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="kpi-bar">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            data-kpi={card.label}
            data-tone={card.tone}
            className="rounded-lg border border-hvac-border-real bg-hvac-surface p-4"
          >
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-hvac-muted">
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {card.label}
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`font-display text-3xl font-bold leading-none ${toneValue[card.tone]}`}>
                {card.value}
              </span>
              {card.unit && (
                <span className="font-body text-xs font-medium text-hvac-muted">{card.unit}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
