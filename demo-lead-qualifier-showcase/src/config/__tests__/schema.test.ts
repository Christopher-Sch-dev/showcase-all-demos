import { describe, it, expect } from 'vitest';
import { NicheConfigSchema } from '../schema';

// rol: suite del contrato Zod de la narrativa de venta por nicho (spec.md AC-6, AC-7, AC-8, AC-12).
// Verifica que el schema FUERZA una narrativa completa con honestidad de métricas (source) y CTA Calendly.

/** Config de prueba completa y válida que satisface todos los campos obligatorios. */
const validConfig = {
  type: 'b',
  niche: 'realestate',
  name: 'Real Estate AI Lead Response',
  aesthetic: {
    theme: 'dark' as const,
    mode: 'dark' as const,
    background: '#0E0F13',
    surface: '#12151A',
    accent: '#C9A24B',
    text: '#F5F3EF',
    muted: '#8A8F98',
    displayFont: 'Cormorant',
    bodyFont: 'Inter',
    radius: 'pill',
  },
  hero: {
    eyebrow: 'AI Lead Response · <60s',
    headline: 'Never lose a lead to a slow reply.',
    subheadline: 'Your buyer is not waiting. See a lead answered, qualified and booked in under 60 seconds.',
    ctaLabel: 'See it in action',
  },
  painPoint: {
    headline: 'Your lead cools in minutes.',
    body: 'A buyer submits the form at 9pm while you are at a showing.',
    metrics: [
      {
        label: 'More likely to reach a lead in 5 min vs 30 min',
        value: '100x',
        source: 'https://onecavo.com/lead-response-management-study',
      },
    ],
  },
  metrics: [
    {
      label: 'More likely to qualify a lead in 5 min vs 30 min',
      value: '21x',
      source: 'https://onecvo.com/lead-response-management-study',
    },
  ],
  roiFormula: {
    inputKey: 'leadsPerMonth',
    inputLabel: 'Leads per month',
    inputMin: 0,
    inputMax: 500,
    inputStep: 10,
    inputDefault: 50,
    compute: (leadsPerMonth: number) => leadsPerMonth * 0.21 * 20000 * 12,
    note: 'Estimated based on industry averages',
  },
  integrations: [
    { name: 'AI Intake', category: 'ai_receptionist' },
    { name: 'CRM sync', category: 'crm' },
  ],
  proof: [
    { type: 'statistic', text: 'A lead contacted in 5 minutes is 21x more likely to be qualified.', source: 'https://example.com/source' },
  ],
  cta: {
    label: 'See it in action',
    url: 'https://calendly.com/csch1305',
  },
};

describe('NicheConfigSchema — contrato de narrativa de venta (AC-6)', () => {
  it('acepta una config de nicho completa y válida', () => {
    const parsed = NicheConfigSchema.parse(validConfig);
    expect(parsed.niche).toBe('realestate');
    expect(parsed.aesthetic.theme).toBe('dark');
  });

  it('NUNCA compila sin painPoint (anti-tech-demo, AC-6)', () => {
    const { painPoint, ...rest } = validConfig;
    const res = NicheConfigSchema.safeParse(rest);
    expect(res.success).toBe(false);
  });

  it('NUNCA compila sin hero (anti-tech-demo, AC-6)', () => {
    const { hero, ...rest } = validConfig;
    const res = NicheConfigSchema.safeParse(rest);
    expect(res.success).toBe(false);
  });

  it('NUNCA compila sin metrics[] (anti-tech-demo, AC-6)', () => {
    const { metrics, ...rest } = validConfig;
    const res = NicheConfigSchema.safeParse(rest);
    expect(res.success).toBe(false);
  });

  it('NUNCA compila sin aesthetic (estética por nicho, AC-12)', () => {
    const { aesthetic, ...rest } = validConfig;
    const res = NicheConfigSchema.safeParse(rest);
    expect(res.success).toBe(false);
  });
});

describe('MetricSchema — honestidad de métricas (AC-7)', () => {
  it('exige source URL en cada métrica', () => {
    const { metrics } = validConfig;
    const bad = NicheConfigSchema.safeParse({ ...validConfig, metrics: [{ label: 'x', value: '21x' }] });
    expect(bad.success).toBe(false);
    expect(metrics[0].source).toMatch(/^https?:\/\//);
  });
});

describe('CTASchema — Calendly, nunca mailto (AC-8)', () => {
  it('rechaza una CTA mailto', () => {
    const res = NicheConfigSchema.safeParse({ ...validConfig, cta: { label: 'Email us', url: 'mailto:hi@firm.com' } });
    expect(res.success).toBe(false);
  });

  it('acepta la URL canónica de Calendly', () => {
    const parsed = NicheConfigSchema.parse(validConfig);
    expect(parsed.cta.url).toBe('https://calendly.com/csch1305');
    expect(parsed.cta.url.startsWith('mailto:')).toBe(false);
  });
});
