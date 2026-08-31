import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ROICalculator } from '../ROICalculator';
import { hvacConfig } from '../../config/niches/hvac';
import { formatCurrency } from '../../lib/intl';

// rol: suite de la calculadora de ROI (slider + compute + nota honesta + CTA).
// ROI formula: missedPerWeek * 0.62 * 2200 * 52, default 20.

const { compute } = hvacConfig.roiFormula;

describe('ROICalculator — compute correcto', () => {
  it('calcula el revenue anual recuperado con el default', () => {
    const expected = compute(hvacConfig.roiFormula.inputDefault);
    render(<ROICalculator />);
    // el slider existe
    expect(screen.getByRole('slider')).toBeInTheDocument();
    // el revenue aparece formateado en USD
    expect(screen.getByText(formatCurrency(expected))).toBeInTheDocument();
  });

  it('el valor del slider arranca en inputDefault', () => {
    render(<ROICalculator />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(Number(slider.value)).toBe(hvacConfig.roiFormula.inputDefault);
  });

  it('al mover el slider a un valor, el revenue se recalcula', () => {
    render(<ROICalculator />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(slider, { target: { value: '40' } });
    const expected = compute(40);
    expect(screen.getByText(formatCurrency(expected))).toBeInTheDocument();
  });
});

describe('ROICalculator — honestidad y CTA', () => {
  it('muestra la nota de proyección del roiFormula', () => {
    render(<ROICalculator />);
    expect(screen.getByText(hvacConfig.roiFormula.note)).toBeInTheDocument();
  });

  it('muestra el CTA a Calendly', () => {
    render(<ROICalculator />);
    const link = screen.getByRole('link', { name: hvacConfig.cta.label });
    expect(link).toHaveAttribute('href', hvacConfig.cta.url);
  });

  it('muestra el label del input', () => {
    render(<ROICalculator />);
    expect(screen.getByText(hvacConfig.roiFormula.inputLabel)).toBeInTheDocument();
  });
});
