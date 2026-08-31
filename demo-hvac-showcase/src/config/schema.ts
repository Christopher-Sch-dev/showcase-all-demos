/**
 * SCHEMA ZOD — Contrato tipado de config por TIPO y NICHO (demo-kit v2).
 * El schema FUERZA la narrativa de venta: sin painPoint/hero/metrics con source/
 * roiFormula/proof/cta → la config NO compila (anti-tech-demo, Mandamiento 0/1).
 * TIPO y NICHO = configuración, NO código (DI, Mandamiento 2).
 * NUNCA `if (tipo === 'x')` / `if (nicho === 'x')` en un componente.
 */
import { z } from 'zod';

/** Métrica del sector: SIEMPRE con source URL (regla dura de honestidad). */
export const MetricSchema = z.object({
  label: z.string().min(1, 'Métrica necesita label'),
  value: z.string().min(1, 'Métrica necesita value'),
  /** Fuente verificable (URL del vendor/estudio). Regla dura: sin source → no compila. */
  source: z.string().url('Métrica necesita source URL verificable'),
});
export type Metric = z.infer<typeof MetricSchema>;

/** Una prueba / señal de confianza. Testimonio SOLO si real. */
export const ProofSchema = z.object({
  type: z.enum(['case_study', 'statistic', 'testimonial']),
  text: z.string().min(1),
  source: z.string().url().optional(),
});
export type Proof = z.infer<typeof ProofSchema>;

/** Fórmula de ROI del add-on IA (multiplica datos del sector por inputs del prospecto). */
export const RoiFormulaSchema = z.object({
  /** Variable que ajusta el prospecto (ej. missedCallsPerWeek). */
  inputKey: z.string().min(1),
  inputLabel: z.string().min(1),
  inputMin: z.number().min(0),
  inputMax: z.number().positive(),
  inputStep: z.number().positive(),
  inputDefault: z.number(),
  /** Cálculo: recibe el input y devuelve $/año recuperado. */
  compute: z.function().args(z.number()).returns(z.number()),
  /** Nota de honestidad: SIEMPRE etiquetar proyecciones. */
  note: z.literal('Estimated based on industry averages'),
});
export type RoiFormula = z.infer<typeof RoiFormulaSchema>;

/** Integración que el demo "conecta" (voz, SMS, CRM, etc). */
export const IntegrationSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['ai_receptionist', 'sms', 'crm', 'scheduling', 'payments']),
});
export type Integration = z.infer<typeof IntegrationSchema>;

/**
 * Contrato TIPO (a) — Sistema + Dashboard.
 * Los 5 tipos (a-e) viven en src/config/types/; aquí solo el (a) que es la demo actual.
 * Cada tipo extiende la base de venta con sus campos funcionales.
 */
export const TypeBaseSchema = z.object({
  type: z.literal('a'), // sistema + dashboard
  name: z.string().min(1),
  /** Narrativa de venta (no compila sin esto — anti-tech-demo). */
  hero: z.object({
    eyebrow: z.string().min(1),
    headline: z.string().min(1),
    subheadline: z.string().min(1),
    ctaLabel: z.string().min(1),
  }),
  painPoint: z.object({
    headline: z.string().min(1),
    body: z.string().min(1),
    metrics: z.array(MetricSchema).min(1, 'Necesita al menos 1 métrica con source'),
  }),
  metrics: z.array(MetricSchema).min(1, 'Necesita métricas del sector con source'),
  roiFormula: RoiFormulaSchema,
  integrations: z.array(IntegrationSchema),
  proof: z.array(ProofSchema),
  cta: z.object({
    label: z.string().min(1),
    /** SIEMPRE Calendly, NUNCA mailto. */
    url: z.literal('https://calendly.com/csch1305'),
  }),
  /** Campos funcionales del tipo (a): sistema + dashboard. */
  demo: z.object({
    technicians: z.array(z.object({
      name: z.string().min(1),
      zone: z.enum(['north', 'central', 'south']),
      color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    })).min(1),
    zones: z.array(z.enum(['north', 'central', 'south'])).min(1),
    seedLeads: z.number().min(0),
  }),
});

/** Config completa de un nicho (tipo + contenido). */
export const NicheConfigSchema = TypeBaseSchema;
export type NicheConfig = z.infer<typeof NicheConfigSchema>;
export type TypeBase = z.infer<typeof TypeBaseSchema>;
