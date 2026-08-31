import { reduce, type Action } from './state';
import type { DemoState, Lead, ParsedIntent } from './types';

/**
 * LOOPS ASÍNCRONOS de la demo — función PURA y testeable.
 * applyLoopTick(state, tickIndex, now, timing) → DemoState
 * Dado un estado y un tick, devuelve el siguiente estado SIN efectos.
 * El tiempo se pasa por arg (determinista); la UI llama esto con setInterval.
 *
 * 7 loops:
 *   1. auto-qualify  — lead 'lead' viejo sin respuesta → se califica solo (speed-to-lead <5min)
 *   2. call feed     — cada N ticks entra un lead nuevo capturado (simulateMissedCall)
 *   3. autoplay téc  — dispatched → in_progress → completed tras M ms
 *   4. KPIs en vivo  — deriveKpi ya los deriva del estado (no hay nada que animar aquí)
 *   5. emergencia    — cada K ticks entra un lead urgent 🚨 (AC muerto, bebé en casa)
 *   6. reset/fade    — re-seed determinista (createSeedState); el fade es UI
 *   7. LIVE pulse    — bool de parpadeo; se alterna en la UI, documentado aquí
 */

/** Parámetros de timing de los loops (inyectables para tests). */
export interface LoopTiming {
  /** Cada cuántos ticks entra una llamada nueva (loop 2). */
  callEveryTicks: number;
  /** Ms desde capture para que la IA auto-califique un lead sin respuesta (loop 1). */
  autoQualifyAfterMs: number;
  /** Ms desde updatedAt para que un técnico avance de etapa (loop 3). */
  jobAdvanceMs: number;
  /** Cada cuántos ticks entra una alerta de emergencia (loop 5). */
  emergencyEveryTicks: number;
}

/** Timing por defecto de la demo (1 tick ≈ 1s en la UI). */
export const DEFAULT_LOOP_TIMING: LoopTiming = {
  callEveryTicks: 3,
  autoQualifyAfterMs: 5 * 60_000, // <5 min de speed-to-lead objetivo
  jobAdvanceMs: 45_000,
  emergencyEveryTicks: 6,
};

/** Timing "fast" para demo/demo E2E: auto-qualify observable en segundos reales.
 *  NO es mock: es la misma función pura con un reloj acelerado (los unit tests ya
 *  inyectan timing custom). Se activa con localStorage['demo-hvac:loop-speed']='fast'. */
const FAST_LOOP_TIMING: LoopTiming = {
  callEveryTicks: 0, // sin feed automático (determinista en demo)
  autoQualifyAfterMs: 4_000, // la IA califica sola a los 4s reales
  jobAdvanceMs: 30_000, // autoplay técnico desactivado en la ventana de test
  emergencyEveryTicks: 0, // sin emergencias automáticas
};

/** Devuelve el timing del loop según el knob de demo (localStorage) o el default. */
export function getDemoLoopTiming(): LoopTiming {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('demo-hvac:loop-speed') === 'fast') {
      return FAST_LOOP_TIMING;
    }
  } catch {
    // localStorage no disponible (SSR) → default
  }
  return DEFAULT_LOOP_TIMING;
}

// rol: reusar el reducer con una acción (si no cambió nada, devuelve el mismo estado).
function run(state: DemoState, action: Action, now: number): DemoState {
  const r = reduce(state, action, now);
  return r.changed ? r.state : state;
}

// rol: generar la acción de captura a partir de una intención parseada (loop 2 y 5).
function captureAction(intent: ParsedIntent, priority: Lead['priority'], now: number): Action {
  return {
    type: 'captureCall',
    payload: {
      customerName: intent.serviceType,
      customerPhone: '555-CALL',
      address: 'Incoming call',
      city: intent.zone,
      issue: intent.issue,
      zone: intent.zone,
      priority,
    },
  };
}

// rol: loop 1 — auto-calificar leads capturados que superaron el umbral de tiempo sin respuesta.
function autoQualify(state: DemoState, now: number, timing: LoopTiming): DemoState {
  let s = state;
  for (const lead of s.leads) {
    if (lead.status === 'lead' && now - lead.capturedAt >= timing.autoQualifyAfterMs) {
      s = run(s, {
        type: 'qualify',
        id: lead.id,
        payload: {
          score: 90,
          reason: 'Auto-qualified — AI called back within 5 min and booked intent detected.',
        },
      }, now);
    }
  }
  return s;
}

// rol: loop 2 — cada N ticks captura una llamada simulada (rota escenarios HVAC).
function callFeed(state: DemoState, tick: number, now: number, timing: LoopTiming): DemoState {
  if (tick === 0 || tick % timing.callEveryTicks !== 0) return state;
  const { transcript, intent } = simulateCall();
  void transcript; // el transcript se transcribe en la UI del LiveCallSimulator
  return run(state, captureAction(intent, intent.urgency, now), now);
}

// rol: loop 5 — cada K ticks entra una alerta de emergencia (🚨 AC muerto, bebé en casa).
function emergencyFeed(state: DemoState, tick: number, now: number, timing: LoopTiming): DemoState {
  if (tick === 0 || tick % timing.emergencyEveryTicks !== 0) return state;
  const intent: ParsedIntent = {
    issue: 'No AC, 95°F, baby in home, urgent north side',
    serviceType: 'AC repair',
    urgency: 'urgent',
    zone: 'north',
    estimatedTicket: 2200,
  };
  return run(state, captureAction(intent, 'urgent', now), now);
}

// rol: loop 3 — técnico avanza solo: dispatched→in_progress→completed tras jobAdvanceMs.
function autoplay(state: DemoState, now: number, timing: LoopTiming): DemoState {
  let s = state;
  for (const lead of s.leads) {
    if (lead.status === 'dispatched' && now - lead.updatedAt >= timing.jobAdvanceMs) {
      s = run(s, { type: 'startJob', id: lead.id }, now);
    }
  }
  for (const lead of s.leads) {
    if (lead.status === 'in_progress' && now - lead.updatedAt >= timing.jobAdvanceMs) {
      s = run(s, { type: 'completeJob', id: lead.id, note: 'Completed on site' }, now);
    }
  }
  return s;
}

// rol: wrapper puro sobre simulateMissedCall (rotación por índice, sin aleatoriedad).
let callIdx = 0;
function simulateCall(): { transcript: string; intent: ParsedIntent } {
  // re-export local puro: rota los 3 escenarios HVAC por índice.
  const SCENARIOS: Array<{ phrase: string; intent: ParsedIntent }> = [
    {
      phrase:
        "Hi, my AC broke down and there's no cool air coming out. Please come as soon as possible, " +
        "we have a baby at home and it's 95 degrees. We're on the north side of town.",
      intent: { issue: 'No cool air, baby at home, north side', serviceType: 'AC repair', urgency: 'urgent', zone: 'north', estimatedTicket: 2200 },
    },
    {
      phrase:
        "Can someone do a furnace tune-up before winter? It's not an emergency, just maintenance. " +
        "We are downtown near the central district.",
      intent: { issue: 'Furnace tune-up, maintenance, central district', serviceType: 'furnace tune-up', urgency: 'low', zone: 'central', estimatedTicket: 180 },
    },
    {
      phrase:
        'We need duct cleaning, the air smells dusty every time the fan runs. House is on the south side.',
      intent: { issue: 'Duct cleaning, dusty air, south side', serviceType: 'duct cleaning', urgency: 'normal', zone: 'south', estimatedTicket: 450 },
    },
  ];
  const s = SCENARIOS[callIdx % SCENARIOS.length];
  callIdx++;
  return { transcript: s.phrase, intent: s.intent };
}

/**
 * Aplica todos los loops de datos al estado en un tick dado.
 * Función pura: no muta el estado de entrada ni hace side-effects.
 * Los loops 4, 6 y 7 no requieren lógica de estado aquí (ver doc de arriba).
 */
export function applyLoopTick(
  state: DemoState,
  tickIndex: number,
  now: number,
  timing: LoopTiming = DEFAULT_LOOP_TIMING,
): DemoState {
  let s = state;
  s = autoQualify(s, now, timing);   // loop 1
  // loop 5 (emergencia) tiene prioridad sobre el feed normal en su tick (evita duplicar).
  const isEmergencyTick = tickIndex > 0 && tickIndex % timing.emergencyEveryTicks === 0;
  if (isEmergencyTick) {
    s = emergencyFeed(s, tickIndex, now, timing);
  } else {
    s = callFeed(s, tickIndex, now, timing);   // loop 2
  }
  s = autoplay(s, now, timing);     // loop 3
  return s;
}
