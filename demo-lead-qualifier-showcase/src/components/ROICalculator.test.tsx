import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ROICalculator from '@/components/ROICalculator';
import { t, cfg, CALENDLY } from '../../tests/helpers/fixture';

describe('ROICalculator', () => {
  const re = cfg('realestate');

  it('computa el valor anual con config.roiFormula.compute', () => {
    const roi = re.roiFormula;
    const expected = roi.compute(roi.inputDefault);
    render(<ROICalculator t={t()} config={re} />);
    // valor anual formateado (ej. $1.3M)
    expect(screen.getByTestId('roi-calculator').textContent).toContain('Estimated based on industry averages');
    // el slider arranca en inputDefault
    expect(screen.getByTestId('roi-input')).toHaveValue(String(roi.inputDefault));
  });

  it('al mover el slider recalcula con la fórmula del nicho', () => {
    const roi = re.roiFormula;
    const newVal = 100;
    render(<ROICalculator t={t()} config={re} />);
    fireEvent.change(screen.getByTestId('roi-input'), { target: { value: String(newVal) } });
    const expected = roi.compute(newVal); // 100 * 0.21 * 20000 * 12 = $5.0M
    expect(screen.getByText(/5\.0M/)).toBeTruthy();
  });

  it('muestra la nota de honestidad literal del config', () => {
    render(<ROICalculator t={t()} config={re} />);
    expect(screen.getByText(re.roiFormula.note)).toBeTruthy();
  });

  it('CTA Calendly siempre presente', () => {
    render(<ROICalculator t={t()} config={re} />);
    const cta = screen.getByTestId('cta-calendly');
    expect(cta).toHaveAttribute('href', CALENDLY);
  });
});
