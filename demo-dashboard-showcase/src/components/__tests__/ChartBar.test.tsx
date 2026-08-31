/**
 * TESTS ChartBar — bar chart de revenueByMonth / appointmentsByMonth .
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import ChartBar from '../ChartBar';
import { strings, seedState, renderWith } from './helpers';

describe('ChartBar', () => {
 it('renderiza revenue por mes con aria-label accesible', () => {
 renderWith(<ChartBar state={seedState} strings={strings} kind="revenue" />);
 expect(screen.getByRole('img', { name: /Revenue by month/i })).toBeInTheDocument();
 });

 it('renderiza citas por mes', () => {
 renderWith(<ChartBar state={seedState} strings={strings} kind="appointments" />);
 expect(screen.getByRole('img', { name: /Appointments by month/i })).toBeInTheDocument();
 });

 it('muestra el título correcto', () => {
 renderWith(<ChartBar state={seedState} strings={strings} kind="revenue" />);
 expect(screen.getByText(strings.charts.revenueByMonth)).toBeInTheDocument();
 });
});
