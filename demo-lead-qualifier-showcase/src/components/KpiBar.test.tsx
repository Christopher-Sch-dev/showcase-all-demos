import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KpiBar from '@/components/KpiBar';
import { t, cfg } from '../../tests/helpers/fixture';
import { deriveKpi } from '@/lib/kpi';
import { createSeedState } from '@/lib/seed';

describe('KpiBar', () => {
  const re = cfg('realestate');

  it('muestra KPIs derivados del estado (deriveKpi)', () => {
    const s = createSeedState();
    const kpi = deriveKpi(s);
    render(<KpiBar t={t()} kpi={kpi} config={re} />);
    expect(screen.getByText(String(kpi.totalLeads))).toBeTruthy();
    expect(screen.getByText(`${kpi.avgSpeedToLeadSec.toFixed(0)}s`)).toBeTruthy();
  });

  it('muestra métricas del sector con source visible (AC-7)', () => {
    render(<KpiBar t={t()} kpi={deriveKpi(createSeedState())} config={re} />);
    // cada métrica de config aparece con su value + label
    for (const m of re.metrics) {
      expect(screen.getAllByText(m.value).length).toBeGreaterThan(0);
    }
    // hay al menos un link de source externo
    expect(screen.getAllByRole('link').length).toBeGreaterThan(0);
  });

  it('etiqueta proyecciones como Estimated based on industry averages', () => {
    render(<KpiBar t={t()} kpi={deriveKpi(createSeedState())} config={re} />);
    expect(screen.getByText('Estimated based on industry averages')).toBeTruthy();
  });

  it('formatea tasa de respuesta <60s como porcentaje', () => {
    const s = createSeedState();
    const kpi = deriveKpi(s);
    render(<KpiBar t={t()} kpi={kpi} config={re} />);
    expect(screen.getByText(`${Math.round(kpi.responseRateUnder60 * 100)}%`)).toBeTruthy();
  });
});
