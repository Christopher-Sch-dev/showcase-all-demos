import { describe, it, expect } from 'vitest';
import {
  scoreLead,
  isQualified,
  urgencyFromScore,
  QUALIFIED_THRESHOLD,
} from '../score';
import type { Lead, Niche, Urgency } from '../types';

const CAPTURED = 1_760_000_000_000;

// rol: helper de test para construir un Lead mínimo y determinista.
function makeLead(over: Partial<Lead> = {}): Lead {
  const base: Lead = {
    id: 'lead-test',
    status: 'new',
    niche: 'realestate',
    source: 'form',
    name: 'Test Lead',
    email: 'lead@example.com',
    phone: '555-0000',
    topic: 'looking for a house',
    urgency: 'normal',
    capturedAt: CAPTURED,
    timeline: [],
    createdAt: CAPTURED,
    updatedAt: CAPTURED,
  };
  return { ...base, ...over };
}

describe('QUALIFIED_THRESHOLD / isQualified', () => {
  it('el umbral de calificación es 60 (AC-2)', () => {
    expect(QUALIFIED_THRESHOLD).toBe(60);
  });

  it('isQualified: 49 no, 60 sí, 61 sí', () => {
    expect(isQualified(49)).toBe(false);
    expect(isQualified(60)).toBe(true);
    expect(isQualified(61)).toBe(true);
  });
});

describe('scoreLead — realestate', () => {
  it('es determinista: mismo input → mismo score y razón', () => {
    const leadA = makeLead({
      niche: 'realestate',
      topic: 'first house, pre-approved condo',
      budget: 280000,
    });
    const leadB = makeLead({
      niche: 'realestate',
      topic: 'first house, pre-approved condo',
      budget: 280000,
    });
    const a = scoreLead(leadA, 'realestate');
    const b = scoreLead(leadB, 'realestate');
    expect(a).toEqual(b);
  });

  it('score dentro de 0-100 y razón no vacía', () => {
    const r = scoreLead(
      makeLead({ niche: 'realestate', topic: 'first house, pre-approved condo', budget: 280000 }),
      'realestate',
    );
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.reason.length).toBeGreaterThan(0);
  });

  it('lead con propiedad + intento de compra + presupuesto califica alto', () => {
    const r = scoreLead(
      makeLead({ niche: 'realestate', topic: 'first house, pre-approved condo', budget: 280000 }),
      'realestate',
    );
    expect(r.score).toBe(95);
    expect(isQualified(r.score)).toBe(true);
  });

  it('lead sin presupuesto ni intención fuerte queda bajo el umbral', () => {
    const r = scoreLead(
      makeLead({ niche: 'realestate', topic: 'checking prices', budget: undefined }),
      'realestate',
    );
    expect(isQualified(r.score)).toBe(false);
  });
});

describe('scoreLead — law', () => {
  it('caso de daño + urgencia + presupuesto de retainer califica alto', () => {
    const r = scoreLead(
      makeLead({ niche: 'law', topic: 'injury settlement, urgent consult', budget: 3000 }),
      'law',
    );
    expect(r.score).toBe(70);
    expect(isQualified(r.score)).toBe(true);
    expect(r.reason.length).toBeGreaterThan(0);
  });

  it('consulta genérica sin señal califica bajo', () => {
    const r = scoreLead(
      makeLead({ niche: 'law', topic: 'general question', budget: undefined }),
      'law',
    );
    expect(isQualified(r.score)).toBe(false);
  });
});

describe('scoreLead — nicho inválido', () => {
  it('lanza error en lugar de silencio (nicho = configuración, DI)', () => {
    expect(() => scoreLead(makeLead(), 'x' as Niche)).toThrow();
  });
});

describe('urgencyFromScore', () => {
  it('deriva urgencia determinista del score (0-100)', () => {
    const cases: Array<[number, Urgency]> = [
      [30, 'low'],
      [50, 'normal'],
      [70, 'high'],
      [85, 'urgent'],
    ];
    for (const [score, expected] of cases) {
      expect(urgencyFromScore(score)).toBe(expected);
    }
  });
});
