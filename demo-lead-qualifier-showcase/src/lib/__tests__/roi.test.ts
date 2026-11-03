import { describe, it, expect } from 'vitest';
import { computeAnnual, formatUSDCompact } from '../roi';
import { getNicheConfig } from '@/config';

// rol: suite del cálculo de ROI y del contrato de serialización del island.

describe('roi — cálculo del valor anual', () => {
  it('multiplica el input por el multiplicador del nicho', () => {
    expect(computeAnnual(50400, 50)).toBe(2_520_000);
    expect(computeAnnual(30600, 20)).toBe(612_000);
  });

  it('es lineal y devuelve 0 con input 0', () => {
    expect(computeAnnual(50400, 0)).toBe(0);
    expect(computeAnnual(50400, 100)).toBe(computeAnnual(50400, 50) * 2);
  });
});

describe('roi — formato compacto USD', () => {
  it('usa millones, miles y unidades', () => {
    expect(formatUSDCompact(2_520_000)).toBe('$2.5M');
    expect(formatUSDCompact(50_000)).toBe('$50K');
    expect(formatUSDCompact(900)).toBe('$900');
    expect(formatUSDCompact(0)).toBe('$0');
  });
});

describe('roi — contrato de serialización del island (regresión)', () => {
  // El bug de producción fue "t.compute is not a function": las props de un island
  // `client:*` se serializan a JSON y una función NO sobrevive el boundary.
  // Esta suite falla si alguien vuelve a meter una función en roiFormula.
  it('roiFormula sobrevive un round-trip JSON sin perder datos', () => {
    for (const niche of ['realestate', 'law']) {
      const config = getNicheConfig(niche)!;
      const roundTripped = JSON.parse(JSON.stringify(config.roiFormula));
      expect(roundTripped).toEqual(config.roiFormula);
      expect(typeof roundTripped.multiplier).toBe('number');
      expect(roundTripped.multiplier).toBeGreaterThan(0);
    }
  });

  it('roiFormula no contiene ninguna función', () => {
    for (const niche of ['realestate', 'law']) {
      const config = getNicheConfig(niche)!;
      const functions = Object.entries(config.roiFormula).filter(
        ([, value]) => typeof value === 'function',
      );
      expect(functions).toEqual([]);
    }
  });
});
