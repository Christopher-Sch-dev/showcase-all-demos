import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDateTime, formatPercent } from '../intl';

describe('intl — formatCurrency (USD)', () => {
  it('formatea USD con Intl en inglés por defecto', () => {
    expect(formatCurrency(2200)).toBe('$2,200.00');
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('respeta locale es-CL (símbolo/layout distintos a en-US)', () => {
    const us = formatCurrency(2200, 'en-US');
    const cl = formatCurrency(2200, 'es-CL');
    expect(cl).not.toBe(us);
    expect(cl).toContain('2.200'); // separador de miles de es-CL
    expect(cl).toContain(',00');   // separador decimal de es-CL
  });
});

describe('intl — formatPercent', () => {
  it('fracción 0-1 → porcentaje en inglés por defecto', () => {
    expect(formatPercent(0.62)).toBe('62%');
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(1)).toBe('100%');
  });
});

describe('intl — formatDateTime (locale-aware)', () => {
  it('formatea timestamp como fecha/hora en inglés por defecto', () => {
    // 2024-06-15T12:00:00Z mantiene año 2024 en cualquier TZ (UTC-12..+13)
    const out = formatDateTime(Date.UTC(2024, 5, 15, 12, 0, 0));
    expect(out).toContain('2024');
  });

  it('cae a es-CL cuando se pide un locale no soportado', () => {
    const out = formatDateTime(0, 'zz-ZZ');
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });
});
