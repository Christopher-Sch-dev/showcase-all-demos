/**
 * NICHO LAW — implementa el contrato Zod (src/config/schema.ts).
 * Nicho = configuración, NO código (DI, Mandamiento 2).
 * Navy serio / light-first (AC-12): navy #0F2440 + burdeos #7B2D3A + Source Serif.
 * HONESTIDAD (AC-7): métricas SIEMPRE con source (Clio 2024, Hennessey 2025, ABA 2024).
 * Diferenciador Law (CANON 6C): intake 24/7 + conflict check + REVELAR que es IA (ética de bar).
 */
import { NicheConfigSchema } from '../schema';

export const lawConfig = NicheConfigSchema.parse({
  type: 'b',
  niche: 'law',
  name: 'Law Firm AI Intake Concierge',

  // ── Estética navy serio / light (AC-12) ──
  aesthetic: {
    theme: 'light',
    mode: 'light',
    background: '#F5F3EF', // crema (light-first, audiencias 50+)
    surface: '#FFFFFF',
    accent: '#B30036',    // burdeos/crimson (CTA 10% de la paleta)
    text: '#0F2440',      // navy primario (trust/autoridad)
    muted: '#5B6B7C',
    displayFont: 'Source Serif',
    bodyFont: 'Inter',
    radius: 'rounded',    // CTA rectificado (autoridad)
  },

  // ── Narrativa de venta (anti-tech-demo) ──
  hero: {
    eyebrow: 'INTAKE · 24/7 · <60s',
    headline: 'Every inquiry, answered the moment it arrives.',
    subheadline:
      "Your client has a family crisis at 9pm — your intake is closed, and 26% of law firms never respond to a web lead at all. This system answers, qualifies and books 24/7, and a lawyer reviews every step.",
    ctaLabel: 'Book your consultation',
  },

  painPoint: {
    headline: 'Your intake is your revenue front door — and it is half-closed.',
    body: "Attorneys spend only ~30% of their day on billable work; the rest disappears into administrative follow-up. Meanwhile 35% of calls go unanswered in business hours, and 79% of legal clients expect a reply within 24 hours — not days. Every slow reply is a case that signed with the firm that answered first.",
    metrics: [
      {
        label: 'Share of a law day spent on billable work',
        value: '~30%',
        source: 'https://www.clio.com/resources/legal-trends/',
      },
      {
        label: 'Legal clients who expect a reply within 24 hours',
        value: '79%',
        source: 'https://www.clio.com/resources/legal-trends/',
      },
      {
        label: 'Law firms that never respond to a web lead',
        value: '26%',
        source: 'https://hennessey.digital/lead-form-response-time-study/',
      },
    ],
  },

  metrics: [
    {
      label: 'Share of a lawyer day spent on billable work',
      value: '~30%',
      source: 'https://www.clio.com/resources/legal-trends/',
    },
    {
      label: 'Legal clients expecting a reply within 24h',
      value: '79%',
      source: 'https://www.clio.com/resources/legal-trends/',
    },
    {
      label: 'Firms that never respond to a web lead (7 days)',
      value: '26%',
      source: 'https://hennessey.digital/lead-form-response-time-study/',
    },
    {
      label: 'More leads for firms with client-intake tech',
      value: '+51%',
      source: 'https://www.clio.com/resources/legal-trends/',
    },
  ],

  roiFormula: {
    inputKey: 'missedCallsPerMonth',
    inputLabel: 'Missed intake calls per month',
    inputMin: 0,
    inputMax: 200,
    inputStep: 5,
    inputDefault: 20,
    // compute: (missed calls/mo) × 51% (recuperables con intake tech) × avg matter $5K × 12
    compute: (missedPerMonth: number) => missedPerMonth * 0.51 * 5000 * 12,
    note: 'Estimated based on industry averages',
  },

  integrations: [
    { name: 'Intake Concierge 24/7', category: 'ai_receptionist' },
    { name: 'Conflict check', category: 'crm' },
    { name: 'Matter scoring', category: 'ai_receptionist' },
    { name: 'Calendly scheduling', category: 'scheduling' },
  ],

  proof: [
    {
      type: 'statistic',
      text: 'Firms using client-intake tech see 51% more leads and 52% more revenue on average.',
      source: 'https://www.clio.com/resources/legal-trends/',
    },
    {
      type: 'statistic',
      text: 'Only 23% of solo / 18% of small firms offer online scheduling on their website.',
      source: 'https://www.americanbar.org/groups/law_practice/publications/techreport/',
    },
    {
      type: 'case_study',
      text: 'Every intake is answered by an AI 24/7, runs a conflict check, and a licensed lawyer reviews every qualified matter before it is booked. No client is handled by an AI alone.',
    },
  ],

  cta: {
    label: 'Book your consultation',
    url: 'https://calendly.com/csch1305',
  },
});

export type LawConfig = typeof lawConfig;
