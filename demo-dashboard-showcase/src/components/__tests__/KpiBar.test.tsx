/**
 * TESTS KpiBar — 6 KPIs derivados con source visible .
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import KpiBar from '../KpiBar';
import { config, strings, seedState, renderWith } from './helpers';

describe('KpiBar', () => {
 it('muestra los 6 KPIs derivados del estado seed', () => {
 renderWith(<KpiBar state={seedState} config={config} strings={strings} />);
 // 6 labels de KPI presentes.
 expect(screen.getByText(strings.kpi.activePatients)).toBeInTheDocument();
 expect(screen.getByText(strings.kpi.noShowRate)).toBeInTheDocument();
 expect(screen.getByText(strings.kpi.totalRevenue)).toBeInTheDocument();
 expect(screen.getByText(strings.kpi.revenuePerPatient)).toBeInTheDocument();
 expect(screen.getByText(strings.kpi.scheduledAppointments)).toBeInTheDocument();
 expect(screen.getByText(strings.kpi.completedAppointments)).toBeInTheDocument();
 });

 it('etiqueta las proyecciones como "Estimated based on industry averages" ', () => {
 renderWith(<KpiBar state={seedState} config={config} strings={strings} />);
 // noShowRate y revenuePerPatient son proyecciones → nota de honestidad visible.
 expect(screen.getAllByText(strings.kpi.estimatedNote).length).toBeGreaterThanOrEqual(2);
 });

 it('deriva valores reales del seed (no hardcode)', () => {
 renderWith(<KpiBar state={seedState} config={config} strings={strings} />);
 // activePatients = count(estado activo) en seed = 5 (P1..P5).
 expect(screen.getByText('5')).toBeInTheDocument();
 });
});
