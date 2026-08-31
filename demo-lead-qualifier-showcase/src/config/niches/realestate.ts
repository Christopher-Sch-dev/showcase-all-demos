/**
 * NICHO REAL ESTATE — implementa el contrato Zod (src/config/schema.ts).
 * Nicho = configuración, NO código (DI, Mandamiento 2).
 * Dark luxury (AC-12): grafito #0E0F13 + champagne #C9A24B + Cormorant.
 * HONESTIDAD (AC-7/anti-invención): métricas SIEMPRE con source verificada.
 * NUNCA el "78% primer-agente" (refutado sin fuente primaria, .audit/venta.md §0).
 * Cadena verificada: 100x contactar / 21x calificar / 42h promedio industria.
 */
import { NicheConfigSchema } from '../schema';

export const realestateConfig = NicheConfigSchema.parse({
  type: 'b',
  niche: 'realestate',
  name: 'Real Estate AI Lead Response',

  // ── Estética dark luxury (AC-12) ──
  aesthetic: {
    theme: 'dark',
    mode: 'dark',
    background: '#0E0F13', // grafito (nunca #000 puro — halation)
    surface: '#12151A',    // elevación +4-8%
    accent: '#C9A24B',     // champagne (oro frío)
    text: '#F5F3EF',
    muted: '#8A8F98',
    displayFont: 'Cormorant',
    bodyFont: 'Inter',
    radius: 'pill',        // CTA pill elegante (RE)
  },

  // ── Narrativa de venta (anti-tech-demo) ──
  hero: {
    eyebrow: 'AI LEAD RESPONSE · <60s',
    headline: 'Never lose a lead to a slow reply.',
    subheadline:
      "Your buyer isn't waiting. The average firm takes 42 hours to respond — your next client decides in minutes. See a lead get answered, qualified and booked in under 60 seconds.",
    ctaLabel: 'See it in action',
  },

  painPoint: {
    headline: 'Your lead cools in minutes.',
    body: "Your listing goes live. A buyer submits the form at 9pm — while you're at a showing. If no one answers in minutes, they're on the phone with a competing agent. The numbers aren't subtle: a lead contacted in 5 minutes is 100x more likely to be reached and 21x more likely to be qualified than one answered 30 minutes later. The industry average first response is 42 hours.",
    metrics: [
      {
        label: 'More likely to reach a lead in 5 min vs 30 min',
        value: '100x',
        source: 'https://onecavo.com/lead-response-management-study',
      },
      {
        label: 'More likely to qualify a lead in 5 min vs 30 min',
        value: '21x',
        source: 'https://onecavo.com/lead-response-management-study',
      },
      {
        label: 'Average first response time to a web lead',
        value: '42h',
        source: 'https://hbr.org/2011/02/the-short-life-of-online-sales-leads',
      },
    ],
  },

  metrics: [
    {
      label: 'More likely to reach a lead in 5 min vs 30 min',
      value: '100x',
      source: 'https://onecavo.com/lead-response-management-study',
    },
    {
      label: 'More likely to qualify a lead in 5 min vs 30 min',
      value: '21x',
      source: 'https://onecavo.com/lead-response-management-study',
    },
    {
      label: 'Average first response time to a web lead',
      value: '42h',
      source: 'https://hbr.org/2011/02/the-short-life-of-online-sales-leads',
    },
  ],

  roiFormula: {
    inputKey: 'leadsPerMonth',
    inputLabel: 'Leads per month',
    inputMin: 0,
    inputMax: 500,
    inputStep: 10,
    inputDefault: 50,
    // compute: (leads/mo) × 21% (calificables extra por responder en 5min) × deal avg $20K × 12
    compute: (leadsPerMonth: number) => leadsPerMonth * 0.21 * 20000 * 12,
    note: 'Estimated based on industry averages',
  },

  integrations: [
    { name: 'AI Intake Concierge', category: 'ai_receptionist' },
    { name: 'CRM sync', category: 'crm' },
    { name: 'SMS follow-up', category: 'sms' },
    { name: 'Calendly scheduling', category: 'scheduling' },
  ],

  proof: [
    {
      type: 'statistic',
      text: 'A lead contacted within 5 minutes is 21x more likely to be qualified than one answered 30 minutes later.',
      source: 'https://onecavo.com/lead-response-management-study',
    },
    {
      type: 'statistic',
      text: 'Responding within an hour vs a day makes you up to 60x more likely to qualify the lead.',
      source: 'https://hbr.org/2011/02/the-short-life-of-online-sales-leads',
    },
  ],

  cta: {
    label: 'See it in action',
    url: 'https://calendly.com/csch1305',
  },
});

export type RealestateConfig = typeof realestateConfig;
