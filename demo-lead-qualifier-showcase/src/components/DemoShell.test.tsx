import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DemoShell from '@/components/DemoShell';
import { t, cfg } from '../../tests/helpers/fixture';

describe('DemoShell (integración: form → qualify → dashboard compartido)', () => {
  it('captura un lead → lo califica → lo muestra en dashboard (FSM core)', async () => {
    render(<DemoShell t={t()} niche="realestate" />);

    // llenar el form y capturar
    fireEvent.change(screen.getByTestId('lf-name'), { target: { value: 'Ana Torres' } });
    fireEvent.change(screen.getByTestId('lf-email'), { target: { value: 'ana@example.com' } });
    fireEvent.change(screen.getByTestId('lf-phone'), { target: { value: '555-0202' } });
    fireEvent.change(screen.getByTestId('lf-topic'), { target: { value: 'buying a 4-bedroom house near downtown' } });
    fireEvent.change(screen.getByTestId('lf-budget'), { target: { value: '500000' } });
    fireEvent.click(screen.getByTestId('lf-submit'));

    // el nuevo lead aparece en la tabla de leads (persistido) y es el activo (cabeza de lista)
    await waitFor(() => {
      expect(screen.getAllByText('Ana Torres').length).toBeGreaterThan(0);
    });

    // el QualifyCard del lead activo pasa de "new" a "qualified" (score visible) via IA invisible
    await waitFor(() => {
      const card = screen.getByTestId('qualify-card');
      expect(card.querySelector('[data-testid="score"]')).toBeTruthy();
      expect(card.textContent).toContain('Qualified');
    });
  });

  it('muestra KPIs derivados del seed', () => {
    render(<DemoShell t={t()} niche="realestate" />);
    // seed 5 leads → KpiBar muestra total
    expect(screen.getByTestId('kpi-bar')).toBeTruthy();
  });

  it('muestra el badge MODO DEMO y botón reset', () => {
    render(<DemoShell t={t()} niche="realestate" />);
    expect(screen.getByTestId('mode-badge')).toHaveTextContent('MODO DEMO');
    expect(screen.getByRole('button', { name: /reset demo/i })).toBeTruthy();
  });

  it('no muestra nota de ética IA para Real Estate (invisible AI)', () => {
    render(<DemoShell t={t()} niche="realestate" />);
    expect(screen.queryByTestId('ai-ethics')).toBeNull();
  });
});
