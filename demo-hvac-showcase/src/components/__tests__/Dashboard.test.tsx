import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Dashboard } from '../Dashboard';
import { createSeedState } from '../../lib/seed';
import { STORAGE_KEY } from '../../lib/ai';

// rol: suite del Dashboard (compone todas las islands + loops + persistencia + reset).

// helper: limpiar el localStorage entre tests (jsdom comparte el storage).
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Dashboard — compone todas las islands', () => {
  it('renderiza KpiBar, LeadQueue, DispatchBoard, LiveCallSimulator y ROICalculator', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('kpi-bar')).toBeInTheDocument();
    expect(screen.getByTestId('lead-queue')).toBeInTheDocument();
    expect(screen.getByTestId('dispatch-board')).toBeInTheDocument();
    expect(screen.getByTestId('call-simulator')).toBeInTheDocument();
    expect(screen.getByRole('slider')).toBeInTheDocument(); // ROI
  });

  it('persiste el estado inicial en localStorage', () => {
    render(<Dashboard />);
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();
  });
});

describe('Dashboard — reset con fade', () => {
  it('el botón Reset re-seedea (vuelve a 5 leads capturados) y limpia el storage', () => {
    vi.useFakeTimers();
    render(<Dashboard />);
    // simular un avance: capturar una llamada manual → 6 leads
    fireEvent.click(screen.getByRole('button', { name: /capture as lead/i }));
    // el fade dura FADE_MS (250ms); avanzamos los timers para completarlo
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    // tras el fade, el estado se re-seedea y se vuelve a persistir (seed = 5 leads)
    expect(screen.getByText('5')).toBeInTheDocument(); // Calls captured vuelve a 5
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(persisted.leads.length).toBe(5);
  });
});

describe('Dashboard — loops asíncronos avanzan el estado', () => {
  it('el call feed captura una llamada nueva tras varios ticks (interval)', () => {
    vi.useFakeTimers();
    render(<Dashboard />);
    // tick 0 → 5 calls; el feed captura en tick 3, 6, ... (default callEveryTicks=3)
    act(() => {
      vi.advanceTimersByTime(3400); // ~3.4 ticks → al menos 1 captura
    });
    expect(screen.getByText('6')).toBeInTheDocument(); // Calls captured sube a 6
  });
});
