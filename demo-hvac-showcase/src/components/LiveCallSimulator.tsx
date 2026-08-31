import { useEffect, useMemo, useRef, useState } from 'react';
import { PhoneCall, UserCheck } from 'lucide-react';
import type { DemoState } from '../lib/types';
import type { Action } from '../lib/state';
import { simulateMissedCall } from '../lib/ai';
import { StatusBadge } from './ui/StatusBadge';

// rol: simula una llamada perdida EN VIVO entrando: transcript con efecto typing,
// intención parseada (serviceType, urgency, zone, ticket) y botón 'Capture as lead'
// que despacha captureCall con la intención. IA invisible: se ve la llamada real.

const TYPE_SPEED_MS = 30; // velocidad del efecto typing

/** Simulador de llamada perdida en vivo → botón de captura. */
export function LiveCallSimulator({
  state,
  onAction,
  call,
}: {
  state: DemoState;
  onAction: (action: Action) => void;
  /** Llamada a simular (DI); por defecto generate una simulada determinista por montaje. */
  call?: { transcript: string; intent: ReturnType<typeof simulateMissedCall>['intent'] };
}) {
  // rol: llamada estable por montaje (o inyectada por el test vía DI).
  const { transcript, intent } = useMemo(
    () => call ?? simulateMissedCall(),
    [call],
  );

  // rol: efecto typing — revela el transcript char a char.
  const [visibleChars, setVisibleChars] = useState(0);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visibleChars >= transcript.length) {
      setDone(true);
      return;
    }
    timerRef.current = setInterval(() => {
      setVisibleChars((n) => Math.min(transcript.length, n + 1));
    }, TYPE_SPEED_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visibleChars, transcript.length]);

  const typed = transcript.slice(0, visibleChars);

  // rol: capturar la llamada como lead → despacha captureCall con la intención.
  const handleCapture = () => {
    const action: Action = {
      type: 'captureCall',
      payload: {
        customerName: intent.serviceType,
        customerPhone: '555-CALL',
        address: 'Incoming call',
        city: intent.zone,
        issue: intent.issue,
        zone: intent.zone,
        priority: intent.urgency,
      },
    };
    onAction(action);
  };

  const priority = intent.urgency;

  return (
    <div
      data-testid="call-simulator"
      className="overflow-hidden rounded-lg border border-hvac-border-real bg-hvac-surface"
    >
      <div className="flex items-center justify-between border-b border-hvac-border-real px-4 py-3">
        <h3 className="flex items-center gap-2 font-display text-lg font-semibold uppercase tracking-wide text-hvac-text">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-hvac-urgent" aria-hidden />
          Live call
        </h3>
        <span className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wide text-hvac-muted">
          <PhoneCall className="h-3.5 w-3.5" aria-hidden />
          ringing
        </span>
      </div>

      {/* transcript con efecto typing (IA invisible: se ve la llamada real) */}
      <div className="border-b border-hvac-border-real px-4 py-3">
        <p data-testid="call-transcript" className="font-body text-sm italic leading-relaxed text-hvac-text">
          {typed}
          {!done && <span className="animate-pulse text-hvac-brand" aria-hidden>▍</span>}
        </p>
      </div>

      {/* intención parseada por la IA */}
      <div data-testid="call-intent" className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className="font-body text-sm font-semibold text-hvac-text">{intent.serviceType}</span>
        <StatusBadge status="lead" priority={priority} />
        <span className="font-mono text-[11px] uppercase text-hvac-muted">{intent.zone}</span>
        <span className="ml-auto font-display text-lg font-bold text-hvac-brand">
          ${intent.estimatedTicket.toLocaleString('en-US')}
        </span>
      </div>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleCapture}
          aria-label="Capture as lead"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-hvac-brand bg-hvac-brand px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-hvac-brand-strong"
        >
          <UserCheck className="h-4 w-4" aria-hidden />
          Capture as lead
        </button>
      </div>
    </div>
  );
}
