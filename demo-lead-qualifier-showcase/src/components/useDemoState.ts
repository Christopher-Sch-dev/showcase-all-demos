/**
 * USEDEMOSTATE — hook que orquesta la demo determinista (core src/lib) desde React.
 * Consume el core (reduce, loadState/saveState/resetDemo, scoreLead, deriveKpi) SIN modificarlo.
 * Encapsula: estado global + FSM + persistencia + reset + calificación determinista.
 * SSR-safe: en servidor devuelve seed (no localStorage); en cliente hidrata y persiste.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { reduce } from '@/lib/state';
import type { AgentAction, DemoState, Kpi, Lead, Niche } from '@/lib/types';
import { loadState, saveState, resetDemo } from '@/lib/storage';
import { deriveKpi } from '@/lib/kpi';
import { scoreLead } from '@/lib/score';

const SSR_STATE: DemoState = {
  version: 1,
  leads: [],
  leadCounter: 0,
  seeded: false,
};

export interface UseDemoState {
  state: DemoState;
  /** Dispara una acción agéntica sobre la FSM determinista (capture/qualify/book). */
  dispatch: (action: AgentAction, now?: number) => boolean;
  /** Califica un lead de forma determinista según su nicho (score+razón). */
  qualify: (lead: Lead, now?: number) => void;
  /** Agenda (book) un lead qualified con bookingUrl=Calendly central. */
  book: (leadId: string, bookingUrl: string) => void;
  /** KPIs derivados del estado (nunca guardados). */
  kpi: Kpi;
  /** Restaura el seed y limpia localStorage. */
  reset: () => void;
  /** Booleano: si ya hidrató desde localStorage (evita render SSR→CSR distinto). */
  ready: boolean;
}

export function useDemoState(): UseDemoState {
  // rol: detectar entorno cliente (jsdom/browser) para evitar crash SSR de localStorage.
  const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  const [state, setState] = useState<DemoState>(() => (isBrowser ? loadState() : SSR_STATE));
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // rol: hidratar desde localStorage tras el primer mount del cliente (evita mismatch SSR).
  useEffect(() => {
    if (isBrowser) {
      setState(loadState());
      setReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // rol: persistir en cada cambio (SOLO en cliente).
  useEffect(() => {
    if (isBrowser && ready) {
      saveState(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, ready]);

  const dispatch = useCallback((action: AgentAction, now: number = Date.now()): boolean => {
    const { state: next, changed } = reduce(stateRef.current, action, now);
    if (changed) {
      stateRef.current = next;
      setState(next);
    }
    return changed;
  }, []);

  const qualify = useCallback(
    (lead: Lead, now: number = Date.now()): void => {
      const res = scoreLead(lead, lead.niche);
      dispatch({ type: 'qualify', leadId: lead.id, score: res.score, reason: res.reason }, now);
    },
    [dispatch],
  );

  const book = useCallback((leadId: string, bookingUrl: string): void => {
    dispatch({ type: 'book', leadId, bookingUrl });
  }, [dispatch]);

  const reset = useCallback((): void => {
    if (isBrowser) resetDemo();
    setState(isBrowser ? loadState() : SSR_STATE);
  }, [isBrowser]);

  return { state, dispatch, qualify, book, kpi: deriveKpi(state), reset, ready };
}
