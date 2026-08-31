/**
 * NICHO HVAC — implementa el contrato Zod (src/config/schema.ts).
 * Nicho = configuración, NO código (DI, Mandamiento 2).
 * Sin narrativa de venta completa → no compila (anti-tech-demo).
 * HONESTIDAD: métricas del sector SIEMPRE con source (CallJolt 2026).
 */
import { NicheConfigSchema } from '../schema';

export const hvacConfig = NicheConfigSchema.parse({
  type: 'a',
  name: 'HVAC Call-Capture + Dispatch',

  // ── Narrativa de venta (anti-tech-demo) ──
  hero: {
    eyebrow: 'AI Receptionist · Field Service',
    headline: 'Stop losing $2,200 jobs to missed calls',
    subheadline:
      'Every call your crew misses while on the road is a job a competitor books. Capture, qualify, dispatch, and invoice in one board.',
    ctaLabel: 'See it live',
  },

  painPoint: {
    headline: '62% of HVAC calls go unanswered',
    body: 'Your techs are in the truck, your office is understaffed, and the phone keeps ringing. 62% of calls to HVAC businesses get missed — and 85% of those callers never call back. That is $14.7B leaking out of the industry every year.',
    metrics: [
      {
        label: 'Calls missed by HVAC businesses',
        value: '62%',
        source: 'https://calljolt.com/blog/hvac/hvac-industry-missed-call-statistics-2026',
      },
      {
        label: 'Callers who never call back',
        value: '85%',
        source: 'https://skipcalls.com/blog/the-62-percent-problem-contractor-speed-to-lead',
      },
      {
        label: 'Average HVAC service ticket',
        value: '$2,200',
        source: 'https://calljolt.com/blog/hvac/hvac-industry-missed-call-statistics-2026',
      },
    ],
  },

  metrics: [
    {
      label: 'Caller patience before hanging up',
      value: '2.3s',
      source: 'https://calljolt.com/blog/hvac/hvac-industry-missed-call-statistics-2026',
    },
    {
      label: 'Likelihood of qualifying a lead under 5 min',
      value: '21x',
      source: 'https://calljolt.com/blog/guides/speed-to-lead-statistics-5-minute-rule',
    },
    {
      label: 'Industry revenue lost to missed calls',
      value: '$14.7B/yr',
      source: 'https://calljolt.com/blog/hvac/hvac-industry-missed-call-statistics-2026',
    },
  ],

  roiFormula: {
    inputKey: 'missedCallsPerWeek',
    inputLabel: 'Missed calls per week',
    inputMin: 0,
    inputMax: 100,
    inputStep: 5,
    inputDefault: 20,
    // compute: (missed calls/wk) × (62% would book) × $2,200 × 52 wk
    compute: (missedPerWeek: number) =>
      missedPerWeek * 0.62 * 2200 * 52,
    note: 'Estimated based on industry averages',
  },

  integrations: [
    { name: 'AI Receptionist', category: 'ai_receptionist' },
    { name: 'SMS follow-up', category: 'sms' },
    { name: 'Dispatch board', category: 'scheduling' },
    { name: 'Invoicing', category: 'payments' },
  ],

  proof: [
    {
      type: 'statistic',
      text: 'Responding within 5 minutes makes you 21x more likely to qualify a lead than 30 minutes.',
      source: 'https://calljolt.com/blog/guides/speed-to-lead-statistics-5-minute-rule',
    },
    {
      type: 'case_study',
      text: 'A 2-truck HVAC shop recovering 5 missed calls a week at a $2,200 ticket adds ~$350K in annual revenue.',
    },
  ],

  cta: {
    label: 'Book a demo call',
    url: 'https://calendly.com/csch1305',
  },

  // ── Campos funcionales del tipo (a): sistema + dashboard ──
  demo: {
    technicians: [
      { name: 'Carlos', zone: 'north', color: '#2563EB' },
      { name: 'Ana', zone: 'central', color: '#9333EA' },
      { name: 'Mike', zone: 'south', color: '#0D9488' },
    ],
    zones: ['north', 'central', 'south'],
    seedLeads: 5,
  },
});

export type HvacConfig = typeof hvacConfig;
