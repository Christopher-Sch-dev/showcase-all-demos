/**
 * TESTS ChartDonut — donut chart de revenueByTreatment .
 */
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import ChartDonut from '../ChartDonut';
import { strings, seedState, renderWith } from './helpers';

describe('ChartDonut', () => {
 it('renderiza el donut con aria-label accesible', () => {
 renderWith(<ChartDonut state={seedState} strings={strings} />);
 expect(screen.getByRole('img', { name: /Revenue by treatment/i })).toBeInTheDocument();
 });

 it('muestra la leyenda con tratamientos del seed', () => {
 renderWith(<ChartDonut state={seedState} strings={strings} />);
 // El seed tiene citas completed de Limpieza, Ortodoncia, Implante, Endodoncia, Blanqueamiento.
 expect(screen.getByText('Limpieza')).toBeInTheDocument();
 expect(screen.getByText('Ortodoncia')).toBeInTheDocument();
 });

 it('muestra el total de revenue en el centro', () => {
 renderWith(<ChartDonut state={seedState} strings={strings} />);
 // Total de citas completed del seed: 120+400+1800+700+350+120+400+1800 = 5690.
 expect(screen.getByText('$5,690')).toBeInTheDocument();
 });
});
