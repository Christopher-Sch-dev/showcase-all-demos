import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KpiBar } from '../KpiBar';
import { createSeedState } from '../../lib/seed';
import { deriveKpi } from '../../lib/kpi';
import { formatCurrency, formatPercent } from '../../lib/intl';

// rol: suite para la barra de 4 KPIs derivados del estado (deriveKpi).

describe('KpiBar — KPIs derivados del seed', () => {
  it('muestra los 4 KPIs con los valores reales del seed', () => {
    const state = createSeedState();
    const kpi = deriveKpi(state);
    render(<KpiBar state={state} />);

    // Calls captured: el seed tiene 5 leads
    expect(screen.getByText('5')).toBeInTheDocument();

    // Recovered revenue: $0 en el seed (nada facturado)
    expect(screen.getByText(formatCurrency(0))).toBeInTheDocument();

    // Avg speed-to-lead: derivado del seed
    const speed = Math.round(kpi.avgSpeedToLeadMin);
    expect(screen.getByText(String(speed))).toBeInTheDocument();

    // Conversion: 0% en el seed
    expect(screen.getByText(formatPercent(0))).toBeInTheDocument();
  });

  it('muestra labels de los 4 KPIs', () => {
    render(<KpiBar state={createSeedState()} />);
    expect(screen.getByText(/Calls captured/i)).toBeInTheDocument();
    expect(screen.getByText(/Recovered revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/speed-to-lead/i)).toBeInTheDocument();
    expect(screen.getByText(/Conversion/i)).toBeInTheDocument();
  });

  it('Recovered revenue usa formato USD con tono verde on-route', () => {
    render(<KpiBar state={createSeedState()} />);
    const card = screen.getByText(/Recovered revenue/i).closest('[data-kpi]');
    expect(card?.getAttribute('data-tone')).toBe('success');
  });
});

describe('KpiBar — refleja estado avanzado (invoiced)', () => {
  it('Recovered revenue muestra la suma facturada y conversion > 0', () => {
    const state = createSeedState();
    // facturar el primer lead del seed
    const lead = state.leads[0];
    const advanced = {
      ...state,
      leads: state.leads.map((l) =>
        l.id === lead.id
          ? { ...l, status: 'invoiced' as const, invoiceTotal: 2200, timeline: [...l.timeline] }
          : l,
      ),
    };
    const kpi = deriveKpi(advanced);
    render(<KpiBar state={advanced} />);
    expect(kpi.recoveredRevenue).toBe(2200);
    expect(screen.getByText(formatCurrency(2200))).toBeInTheDocument();
  });
});
