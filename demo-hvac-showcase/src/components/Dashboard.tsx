import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Radio } from 'lucide-react';
import type { DemoState } from '../lib/types';
import { reduce, type Action } from '../lib/state';
import { loadState, saveState, resetDemo } from '../lib/storage';
import { createSeedState } from '../lib/seed';
import { applyLoopTick, getDemoLoopTiming } from '../lib/loop';
import { KpiBar } from './KpiBar';
import { LeadQueue } from './LeadQueue';
import { DispatchBoard } from './DispatchBoard';
import { LiveCallSimulator } from './LiveCallSimulator';
import { ROICalculator } from './ROICalculator';
import { OnboardingGuide } from './OnboardingGuide';
import type { Locale } from '../i18n/strings';

// rol: island principal de la demo. Compone OnboardingGuide (guía de uso) + KpiBar +
// LeadQueue + DispatchBoard + LiveCallSimulator + ROICalculator. Estado con useState +
// reduce puro (now inyectado). Persistencia con storage.ts. Los 7 loops asíncronos
// corren con useEffect+setInterval llamando a applyLoopTick (fuera del reducer). Reset con fade.

const TICK_MS = 1000; // 1 tick ≈ 1s
const FADE_MS = 250; // transición de reset

/** Dashboard completo de la demo HVAC (componente cliente island). */
export function Dashboard({ locale = 'en' }: { locale?: Locale }) {
  // rol: estado inicial = seed (idéntico al server render → evita hydration mismatch #418).
  // El estado persistido de localStorage se carga en useEffect (tras mount), no en el
  // render inicial (que correría distinto en server vs cliente → React error #418/#423).
  const [state, setState] = useState<DemoState>(() => createSeedState());
  const [hydrated, setHydrated] = useState(false);

  // rol: tick del loop + liveTick (indicador LIVE pulsando, loop 7).
  const [tick, setTick] = useState(0);
  const [liveTick, setLiveTick] = useState(false);

  // rol: fade al hacer reset (loop 6).
  const [fading, setFading] = useState(false);

  // ref del tick para no depender del closure del reducer en el intervalo.
  const tickRef = useRef(0);

  // rol: onAction tipado para las islands hijas → reduce puro con now inyectado.
  const onAction = (action: Action) => {
    setState((prev) => {
      const r = reduce(prev, action, Date.now());
      return r.changed ? r.state : prev;
    });
  };

  // ── Loop 7: LIVE pulse (parpadeo del indicador) ──
  useEffect(() => {
    const id = setInterval(() => setLiveTick((v) => !v), 700);
    return () => clearInterval(id);
  }, []);

  // ── Loops 1-5: aplicar applyLoopTick cada TICK_MS (fuera del reducer) ──
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current += 1;
      const nextTick = tickRef.current;
      // applyLoopTick es puro; actualización funcional evita closures stale.
      // El timing del loop se lee por tick (respeta el knob de demo 'fast').
      setState((prev) => applyLoopTick(prev, nextTick, Date.now(), getDemoLoopTiming()));
      setTick(nextTick);
    }, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // rol: tras el primer render (mount del cliente), cargar el estado persistido
  // de localStorage. No se lee en el render inicial para evitar hydration mismatch.
  useEffect(() => {
    setState(loadState());
    setHydrated(true);
    // solo una vez al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // rol: persiste cada cambio de estado (storage.ts). Se guarda SOLO después de
  // hidratar — si se guardara antes, el mount con seed pisaría el estado persistido
  // en localStorage antes de que el useEffect de carga lo lea (bug de persistencia
  // que rompía el E2E 'recargar a mitad de flujo').
  useEffect(() => {
    if (!hydrated) return;
    saveState(state);
  }, [state, hydrated]);

  // rol: Reset con fade — limpia storage + re-seed + transición (loop 6).
  const handleReset = () => {
    resetDemo();
    setFading(true);
    tickRef.current = 0;
    setTick(0);
    setTimeout(() => {
      setState(createSeedState());
      setFading(false);
    }, FADE_MS);
  };

  return (
    <div className={`space-y-4 transition-opacity duration-300 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      {/* header + LIVE indicator + reset */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-hvac-text">
          Dispatch live
        </h1>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-hvac-border-real bg-hvac-surface px-3 py-1 font-mono text-[11px] uppercase tracking-wide text-hvac-text">
            <Radio
              className={`h-3.5 w-3.5 ${liveTick ? 'text-hvac-urgent' : 'text-hvac-muted'}`}
              aria-hidden
            />
            <span data-live={liveTick ? 'on' : 'off'} className={liveTick ? 'text-hvac-urgent' : 'text-hvac-muted'}>
              live
            </span>
          </span>
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset"
            className="inline-flex items-center gap-1.5 rounded-md border border-hvac-border-real bg-hvac-surface px-3 py-2.5 text-xs font-semibold text-hvac-text transition-colors hover:bg-hvac-neutral"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset
          </button>
        </div>
      </div>

      <OnboardingGuide locale={locale} />

      <KpiBar state={state} />

      {/* columna izquierda: board de despacho + lead queue */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <DispatchBoard state={state} onAction={onAction} />
          <LeadQueue state={state} onAction={onAction} />
        </div>
        {/* columna derecha: llamada en vivo + ROI */}
        <div className="space-y-4">
          <LiveCallSimulator state={state} onAction={onAction} />
          <ROICalculator />
        </div>
      </div>
    </div>
  );
}
