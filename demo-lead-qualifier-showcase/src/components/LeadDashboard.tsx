/**
 * LEADDASHBOARD — tabla de leads por estado (new/qualified/booked) + KPIs en vivo.
 * Consume el core (deriveKpi, useDemoState) y StatusBadge. Persistencia vía useDemoState.
 * Consume la config (accent) por DI. NUNCA mailto.
 */
import type { UIStrings } from '@/i18n/strings';
import type { DemoState, Lead } from '@/lib/types';
import type { NicheConfig } from '@/config/schema';
import StatusBadge from './ui/StatusBadge';
import CTACalendly from './ui/CTACalendly';

export interface LeadDashboardProps {
  t: UIStrings;
  /** Estado del demo (leads persistidos). */
  state: DemoState;
  /** Config del nicho (DI). */
  config: NicheConfig;
}

// rol: label i18n del estado para StatusBadge.
function statusLabel(t: UIStrings, status: Lead['status']): string {
  switch (status) {
    case 'booked':
      return t.statusBooked;
    case 'qualified':
      return t.statusQualified;
    default:
      return t.statusNew;
  }
}

export default function LeadDashboard({ t, state, config }: LeadDashboardProps) {
  const accent = config.aesthetic.accent;
  const radius = config.aesthetic.radius;
  const leads = state.leads;

  if (leads.length === 0) {
    return (
      <div data-testid="dashboard" className="rounded-lg border p-6 text-center text-muted">
        {t.emptyDashboard}
      </div>
    );
  }

  return (
    <div data-testid="dashboard" className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-sm">
        <thead>
          <tr className="border-b text-left text-muted">
            <th className="py-2 pr-4 font-semibold">{t.colLead}</th>
            <th className="px-4 py-2 font-semibold">{t.colStatus}</th>
            <th className="px-4 py-2 font-semibold">{t.colScore}</th>
            <th className="px-4 py-2 font-semibold">{t.colTopic}</th>
            <th className="px-4 py-2 font-semibold">{t.colAction}</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} className="border-b">
              <td className="py-3 pr-4">
                <div className="font-medium">{lead.name}</div>
                <div className="text-xs text-muted">{lead.email}</div>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={lead.status} accent={accent} label={statusLabel(t, lead.status)} />
              </td>
              <td className="px-4 py-3" data-testid={`score-${lead.id}`}>
                {lead.qualification ? lead.qualification.score : '—'}
              </td>
              <td className="max-w-[220px] truncate px-4 py-3 text-muted">{lead.topic}</td>
              <td className="px-4 py-3">
                {lead.status === 'qualified' && (
                  <CTACalendly
                    href={config.cta.url}
                    label={t.bookCta}
                    radius={radius}
                    accent={accent}
                  />
                )}
                {lead.status === 'booked' && (
                  <a
                    href={lead.bookingUrl ?? config.cta.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`booking-${lead.id}`}
                    className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg px-3 text-xs font-semibold"
                    style={{ color: accent }}
                  >
                    {t.bookedCta} ↗
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
