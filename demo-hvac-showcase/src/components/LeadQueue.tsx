import { ArrowRight, CheckCircle2, Flame } from 'lucide-react';
import type { DemoState, Lead, Priority } from '../lib/types';
import type { Action } from '../lib/state';
import { StatusBadge } from './ui/StatusBadge';

// rol: cola de leads pendientes de calificar/citar. Muestra leads recién capturados
// ('lead') con botón Qualify, y leads 'qualified' con botón Book. Cumple el Gherkin
// lead-to-invoice: captura → el lead aparece aquí → Qualify → Book.
// Fila clickeable → despacha la acción vía onAction.

const PENDING: Lead['status'][] = ['lead', 'qualified', 'booked'];

// rol: un lead pendiente es "urgente" si prioridad urgent o score alto.
function isUrgent(lead: Lead): boolean {
  return lead.priority === 'urgent' || (lead.qualification?.score ?? 0) >= 90;
}

/** Cola de leads pendientes de calificar/citar. Estado: prop + onAction para despachar. */
export function LeadQueue({
  state,
  onAction,
}: {
  state: DemoState;
  onAction: (action: Action) => void;
}) {
  const pending = state.leads.filter((l) => PENDING.includes(l.status));

  // rol: calificar un lead capturado (lead → qualified) con score y razón deterministas.
  const handleQualify = (id: string) => {
    const action: Action = {
      type: 'qualify',
      id,
      payload: {
        score: 90,
        reason: 'AI called back within 5 min and booked intent detected.',
      },
    };
    onAction(action);
  };

  // rol: agendar cita (qualified → booked); fecha/hora deterministas.
  const handleBook = (id: string) => {
    const action: Action = {
      type: 'book',
      id,
      payload: { scheduledDate: '2026-08-21', scheduledTime: '09:00' },
    };
    onAction(action);
  };

  return (
    <div data-testid="lead-queue" className="overflow-hidden rounded-lg border border-hvac-border-real bg-hvac-surface">
      <div className="flex items-center justify-between border-b border-hvac-border-real px-4 py-3">
        <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-hvac-text">
          Lead queue
        </h3>
        <span className="rounded-full border border-hvac-border-real bg-hvac-neutral px-2 py-0.5 font-mono text-[11px] text-hvac-muted">
          {pending.length} pending
        </span>
      </div>

      <ul className="divide-y divide-hvac-border-real">
        {pending.map((lead) => {
          const urgent = isUrgent(lead);
          const priority: Priority = urgent ? 'urgent' : lead.priority;
          return (
            <li key={lead.id} className="px-4 py-3">
              <div className="flex w-full items-start gap-3 text-left">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-body text-sm font-semibold text-hvac-text">
                      {lead.customerName}
                    </span>
                    {urgent && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold uppercase text-hvac-urgent">
                        <Flame className="h-3 w-3" aria-hidden />
                        urgent
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2 font-mono text-[11px] text-hvac-muted">
                    {lead.status === 'lead' ? (
                      <span className="italic">{lead.issue}</span>
                    ) : (
                      <>
                        <span>
                          score <span data-score={lead.id}>{lead.qualification?.score ?? 0}</span>
                        </span>
                        <span aria-hidden>·</span>
                        <span className="truncate italic">{lead.qualification?.reason}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <StatusBadge status={lead.status} priority={priority} />
                  {lead.status === 'lead' && (
                    <button
                      type="button"
                      data-qualify-id={lead.id}
                      aria-label={`Qualify ${lead.customerName}`}
                      onClick={() => handleQualify(lead.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-hvac-brand bg-hvac-brand px-2.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-hvac-brand-strong"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                      Qualify
                    </button>
                  )}
                  {lead.status === 'qualified' && (
                    <button
                      type="button"
                      data-book-id={lead.id}
                      aria-label={`Book ${lead.customerName}`}
                      onClick={() => handleBook(lead.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-hvac-brand px-2.5 py-2 text-xs font-semibold text-hvac-brand transition-colors hover:bg-hvac-neutral"
                    >
                      Book <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  )}
                  {lead.status === 'booked' && (
                    <span className="text-xs font-semibold text-hvac-muted">Scheduled</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {pending.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-hvac-muted">No pending leads.</li>
        )}
      </ul>
    </div>
  );
}
