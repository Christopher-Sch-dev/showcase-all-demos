/**
 * TESTS Dashboard — orquestador: KPIs + charts + tabla + badge MODO DEMO + reset + CTA .
 */
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { config, strings, renderWith, mockLocalStorage } from './helpers';

describe('Dashboard', () => {
 it('muestra badge MODO DEMO siempre visible ', () => {
 mockLocalStorage();
 renderWith(<Dashboard config={config} strings={strings} />);
 expect(screen.getByText(strings.demoBadge.label)).toBeInTheDocument();
 });

 it('muestra KPIs + charts + tabla + CTA Calendly', () => {
 mockLocalStorage();
 renderWith(<Dashboard config={config} strings={strings} />);
 expect(screen.getByText(strings.kpi.activePatients)).toBeInTheDocument();
 expect(screen.getByText(strings.charts.revenueByMonth)).toBeInTheDocument();
 expect(screen.getByText(strings.charts.revenueByTreatment)).toBeInTheDocument();
 expect(screen.getByText(strings.table.newPatient)).toBeInTheDocument();
 // CTA Calendly (config.cta.label).
 expect(screen.getByRole('link', { name: new RegExp(config.cta.label) })).toHaveAttribute('href', config.cta.url);
 });

 it('reset restaura el estado seed', () => {
 const ls = mockLocalStorage();
 // Corromper el estado para verificar que reset lo restaura.
 ls.setItem('demo-dashboard:v1', JSON.stringify({ version: 1, pacientes: [], citas: [], pacienteCounter: 0, citaCounter: 0, seeded: false }));
 const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
 renderWith(<Dashboard config={config} strings={strings} />);
 fireEvent.click(screen.getByRole('button', { name: strings.reset.label }));
 // Tras reset, el estado vuelve al seed (9 pacientes → tabla con 8 filas + header).
 expect(screen.getByText(strings.table.pageOf.replace('{current}', '1').replace('{total}', '2'))).toBeInTheDocument();
 confirmSpy.mockRestore();
 });
});
