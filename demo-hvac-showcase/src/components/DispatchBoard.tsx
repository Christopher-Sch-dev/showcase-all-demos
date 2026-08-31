import type { DemoState, Lead, Technician, Zone } from '../lib/types';
import type { Action } from '../lib/state';
import { StatusBadge } from './ui/StatusBadge';

// rol: board de despacho por zonas (north/central/south). Cada zona es una columna con sus
// jobs (scheduled/dispatched/in_progress). Cada job: ticket JOB-xxx, cliente, técnico
// (dot con su color), StatusBadge y acciones Dispatch/Start/Complete según el estado.

const ZONES: Zone[] = ['north', 'central', 'south'];
const ZONE_LABEL: Record<Zone, string> = { north: 'North', central: 'Central', south: 'South' };

// rol: estados que se muestran en el board. Incluye canceled/no_show para que las ramas
// no-dead-end (AC-5) queden VISIBLES con su badge (no desaparecen de la vista).
const JOB_STATES: Lead['status'][] = [
  'booked', 'scheduled', 'dispatched', 'in_progress', 'completed', 'invoiced',
  'canceled', 'no_show',
];

function JobCard({
  lead,
  technicians,
  technician,
  onAction,
}: {
  lead: Lead;
  technicians: Technician[];
  technician?: { name: string; color: string; id: string };
  onAction: (action: Action) => void;
}) {
  const ticket = `JOB-${lead.id}`;
  const handle = (action: Action) => () => onAction(action);

  // rol: técnicos disponibles de la MISMA zona que el job (guard de zona del dispatch).
  const zoneTechs = technicians.filter((t) => t.zone === lead.zone && t.active);

  return (
    <div className="rounded-lg border border-hvac-border-real bg-hvac-surface p-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase text-hvac-muted">
          {ticket}
        </span>
        <StatusBadge status={lead.status} />
      </div>
      <p className="mt-2 font-body text-sm font-semibold text-hvac-text">{lead.customerName}</p>
      <p className="truncate text-xs text-hvac-muted">{lead.issue}</p>
      {technician && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-hvac-muted">
          <span
            data-tech-dot={technician.id}
            style={{ backgroundColor: technician.color }}
            className="inline-block h-2.5 w-2.5 rounded-full"
            aria-hidden
          />
          <span className="font-medium text-hvac-text">{technician.name}</span>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {lead.status === 'booked' && (
          <select
            aria-label={`Assign technician to ${lead.customerName}`}
            data-assign-id={lead.id}
            value=""
            onChange={(e) =>
              e.target.value && onAction({ type: 'assignTechnician', id: lead.id, technicianId: e.target.value })
            }
            className="flex-1 rounded-md border border-hvac-border-real bg-hvac-surface px-2 py-2.5 text-xs font-semibold text-hvac-text"
          >
            <option value="" disabled>
              Assign…
            </option>
            {zoneTechs.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({ZONE_LABEL[t.zone]})
              </option>
            ))}
          </select>
        )}
        {lead.status === 'scheduled' && (
          <button
            type="button"
            onClick={handle({ type: 'dispatch', id: lead.id, etaMinutes: 25 })}
            className="flex-1 rounded-md border border-hvac-brand bg-hvac-brand px-2 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-hvac-brand-strong"
          >
            Dispatch
          </button>
        )}
        {(lead.status === 'booked' || lead.status === 'scheduled') && (
          <div className="flex w-full flex-wrap gap-1.5">
            <button
              type="button"
              data-cancel-id={lead.id}
              onClick={handle({ type: 'cancel', id: lead.id })}
              className="flex-1 rounded-md border border-hvac-border-real bg-hvac-surface px-2 py-2.5 text-xs font-semibold text-hvac-muted transition-colors hover:bg-hvac-neutral"
            >
              Cancel
            </button>
            <button
              type="button"
              data-noshow-id={lead.id}
              onClick={handle({ type: 'markNoShow', id: lead.id })}
              className="flex-1 rounded-md border border-hvac-border-real bg-hvac-surface px-2 py-2.5 text-xs font-semibold text-hvac-muted transition-colors hover:bg-hvac-neutral"
            >
              No-show
            </button>
          </div>
        )}
        {lead.status === 'dispatched' && (
          <button
            type="button"
            onClick={handle({ type: 'startJob', id: lead.id })}
            className="flex-1 rounded-md border border-hvac-accent bg-hvac-accent px-2 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-hvac-accent-strong"
          >
            Start
          </button>
        )}
        {lead.status === 'in_progress' && (
          <button
            type="button"
            onClick={handle({ type: 'completeJob', id: lead.id, note: 'Completed on site' })}
            className="flex-1 rounded-md border border-hvac-on-route bg-hvac-on-route px-2 py-2.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
          >
            Complete
          </button>
        )}
        {lead.status === 'completed' && (
          <button
            type="button"
            data-invoice-id={lead.id}
            onClick={handle({ type: 'invoice', id: lead.id, total: 2200 })}
            className="flex-1 rounded-md border border-hvac-steel bg-hvac-steel px-2 py-2.5 text-xs font-semibold text-white transition-colors hover:opacity-90"
          >
            Invoice
          </button>
        )}
      </div>
    </div>
  );
}

/** Board de despacho por zonas. Estado prop + onAction para despachar al reducer. */
export function DispatchBoard({
  state,
  onAction,
}: {
  state: DemoState;
  onAction: (action: Action) => void;
}) {
  const techById = new Map(state.technicians.map((t) => [t.id, t]));

  return (
    <div data-testid="dispatch-board" className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {ZONES.map((zone) => {
        const jobs = state.leads.filter((l) => l.zone === zone && JOB_STATES.includes(l.status));
        return (
          <div
            key={zone}
            className="rounded-lg border border-hvac-border-real bg-hvac-neutral p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h4 className="font-display text-base font-semibold uppercase tracking-wide text-hvac-text">
                {ZONE_LABEL[zone]}
              </h4>
              <span className="font-mono text-[11px] text-hvac-muted">{jobs.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  lead={job}
                  technicians={state.technicians}
                  technician={job.technicianId ? techById.get(job.technicianId) : undefined}
                  onAction={onAction}
                />
              ))}
              {jobs.length === 0 && (
                <p className="px-1 py-6 text-center text-xs text-hvac-muted">No jobs in {ZONE_LABEL[zone]}.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
