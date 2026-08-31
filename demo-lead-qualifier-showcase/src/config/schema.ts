/**
 * SCHEMA ZOD — Contrato tipado de config por NICHO (demo-lead-qualifier, tipo b).
 * El schema FUERZA la narrativa de venta: sin painPoint/hero/metrics con source/
 * roiFormula/proof/cta/aesthetic → la config NO compila (anti-tech-demo, Mandamiento 0/1).
 * NICHO = configuración, NO código (DI, Mandamiento 2).
 * NUNCA `if (niche === 'x')` en un componente.
 */
import { z } from 'zod';

/** Tema de estética por nicho (AC-12): RE dark luxury, Law light/navy serio. */
export const AestheticSchema = z.object({
  /** Modo de pantalla por defecto del nicho (fijo, NO un toggle dark/light genérico). */
  theme: z.enum(['dark', 'light']),
  /** Alias de tema para resolver tokens de marca. */
  mode: z.enum(['dark', 'light']),
  /** Fondo base (RE grafito #0E0F13 · Law crema/blanco). */
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'background debe ser hex #RRGGBB'),
  /** Superficie elevada (+4-8% por nivel, Material). */
  surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  /** Acento de marca (RE champagne #C9A24B · Law burdeos #7B2D3A). */
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  /** Texto primario. */
  text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  /** Texto atenuado. */
  muted: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  /** Display serif (RE Cormorant/Playfair · Law Source Serif). */
  displayFont: z.string().min(1),
  /** Body font. */
  bodyFont: z.string().min(1),
  /** Radio de CTA: pill (RE elegante) o rectificado (Law autoridad). */
  radius: z.enum(['pill', 'rounded']),
});
export type Aesthetic = z.infer<typeof AestheticSchema>;

/** Métrica del sector: SIEMPRE con source URL (regla dura de honestidad AC-7). */
export const MetricSchema = z.object({
  label: z.string().min(1, 'Métrica necesita label'),
  value: z.string().min(1, 'Métrica necesita value'),
  /** Fuente verificable (URL del estudio/vendor). Regla dura: sin source → no compila. */
  source: z.string().url('Métrica necesita source URL verificable'),
});
export type Metric = z.infer<typeof MetricSchema>;

/** Prueba / señal de confianza. Testimonio SOLO si real (AC-7 anti-invención). */
export const ProofSchema = z.object({
  type: z.enum(['case_study', 'statistic', 'testimonial']),
  text: z.string().min(1),
  source: z.string().url().optional(),
});
export type Proof = z.infer<typeof ProofSchema>;

/** Fórmula de ROI del add-on IA (multiplica datos del sector por inputs del prospecto). */
export const RoiFormulaSchema = z.object({
  /** Variable que ajusta el prospecto (ej. leadsPerMonth). */
  inputKey: z.string().min(1),
  inputLabel: z.string().min(1),
  inputMin: z.number().min(0),
  inputMax: z.number().positive(),
  inputStep: z.number().positive(),
  inputDefault: z.number(),
  /** Cálculo: recibe el input y devuelve el valor anual recuperado. */
  compute: z.function().args(z.number()).returns(z.number()),
  /** Nota de honestidad: SIEMPRE etiquetar proyecciones. */
  note: z.literal('Estimated based on industry averages'),
});
export type RoiFormula = z.infer<typeof RoiFormulaSchema>;

/** Integración que el demo "conecta" (intake, CRM, scheduling, etc). */
export const IntegrationSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['ai_receptionist', 'sms', 'crm', 'scheduling', 'payments']),
});
export type Integration = z.infer<typeof IntegrationSchema>;

/**
 * Contrato NICHO (tipo b) — Lead Qualifier AI (Real Estate/Law).
 * Configuración de venta + estética. Todo nicho del demo implementa ESTE contrato.
 */
export const NicheConfigSchema = z.object({
  type: z.literal('b'), // lead qualifier AI
  /** Clave del nicho (realestate | law) — configuración, NUNCA hardcode en componente. */
  niche: z.string().min(1),
  name: z.string().min(1),
  /** Estética exacta por nicho (AC-12): dark luxury vs navy serio. */
  aesthetic: AestheticSchema,
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
    /** SIEMPRE Calendly, NUNCA mailto (AC-8). */
    url: z.literal('https://calendly.com/csch1305'),
  }),
});

export type NicheConfig = z.infer<typeof NicheConfigSchema>;
export type TypeB = NicheConfig;
