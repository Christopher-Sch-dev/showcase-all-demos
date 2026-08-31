/**
 * TESTS RoiCalculator — consume config.roiFormula.compute + etiqueta proyección .
 */
import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import RoiCalculator from '../RoiCalculator';
import { config, strings, renderWith } from './helpers';

describe('RoiCalculator', () => {
 it('muestra la nota de honestidad "Estimated based on industry averages"', () => {
 renderWith(<RoiCalculator config={config} strings={strings} />);
 expect(screen.getByText(strings.kpi.estimatedNote)).toBeInTheDocument();
 });

 it('calcula el ROI con el input default de la config', () => {
 renderWith(<RoiCalculator config={config} strings={strings} />);
 const f = config.roiFormula;
 const expected = f.compute(f.inputDefault);
 const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(expected);
 expect(screen.getByText(formatted)).toBeInTheDocument();
 });

 it('recalcula al mover el slider', () => {
 renderWith(<RoiCalculator config={config} strings={strings} />);
 const slider = screen.getByLabelText(config.roiFormula.inputLabel) as HTMLInputElement;
 fireEvent.change(slider, { target: { value: '50' } });
 const f = config.roiFormula;
 const expected = f.compute(50);
 const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(expected);
 expect(screen.getByText(formatted)).toBeInTheDocument();
 });
});
