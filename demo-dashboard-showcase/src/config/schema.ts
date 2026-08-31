/**
 * SCHEMA ZOD — Contrato tipado de config por NICHO (demo-dashboard, tipo e).
 * El schema FUERZA la narrativa de venta: sin painPoint/hero/metrics[] con source/
 * roiFormula/integrations[]/proof[]/cta/aesthetic → la config NO compila (anti-tech-demo,
 * /1). NICHO = configuración, NO código (DI,).
 * NUNCA `if (niche === 'x')` en un componente.
 * Patrón: schema + niches + router DI, adaptado al tipo e (dashboard/backoffice).
 */
import { z } from 'zod';

/** Tema de estética por nicho : dental/med spa = light clínico cálido (teal + lavanda). */
export const AestheticSchema = z.object({
 /** Modo de pantalla por defecto del nicho (fijo, NO un toggle dark/light genérico). */
 theme: z.enum(['dark', 'light']),
 /** Alias de tema para resolver tokens de marca. */
 mode: z.enum(['dark', 'light']),
 /** Fondo base (dental crema/blanco cálido #FAFAF8). */
 background: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'background debe ser hex #RRGGBB'),
 /** Superficie elevada (tarjetas). */
 surface: z.string().regex(/^#[0-9a-fA-F]{6}$/),
 /** Acento de marca (dental teal #2F9E9B —). */
 accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
 /** Acento fuerte para texto normal (contraste AA, #1F7A78). */
 accentStrong: z.string().regex(/^#[0-9a-fA-F]{6}$/),
 /** Acento suave para badges/estado activo (#E0F2F1). */
 accentSoft: z.string().regex(/^#[0-9a-fA-F]{6}$/),
 /** Secundario lavanda (charts, acentos —). */
 lavender: z.string().regex(/^#[0-9a-fA-F]{6}$/),
 /** Lavanda suave (#F0EBFA). */
 lavenderSoft: z.string().regex(/^#[0-9a-fA-F]{6}$/),
 /** Texto primario. */
 text: z.string().regex(/^#[0-9a-fA-F]{6}$/),
 /** Texto atenuado. */
 muted: z.string().regex(/^#[0-9a-fA-F]{6}$/),
 /** Display font (dental Plus Jakarta Sans —). */
 displayFont: z.string().min(1),
 /** Body font (dental Inter). */
 bodyFont: z.string().min(1),
 /** Radio de CTA: pill o rectificado (dental rounded — clínico cálido). */
 radius: z.enum(['pill', 'rounded']),
});
export type Aesthetic = z.infer<typeof AestheticSchema>;

/** Métrica del sector: SIEMPRE con source URL (regla dura de honestidad). */
export const MetricSchema = z.object({
 label: z.string().min(1, 'Métrica necesita label'),
 value: z.string().min(1, 'Métrica necesita value'),
 /** Fuente verificable (URL del estudio/vendor). Regla dura: sin source → no compila. */
 source: z.string().url('Métrica necesita source URL verificable'),
});
export type Metric = z.infer<typeof MetricSchema>;

/** Prueba / señal de confianza. Testimonio SOLO si real (anti-invención). */
export const ProofSchema = z.object({
 type: z.enum(['case_study', 'statistic', 'testimonial']),
 text: z.string().min(1),
 source: z.string().url().optional(),
});
export type Proof = z.infer<typeof ProofSchema>;

/** Fórmula de ROI (multiplica datos del sector por inputs del prospecto). */
export const RoiFormulaSchema = z.object({
 /** Variable que ajusta el prospecto (ej. appointmentsPerDay). */
 inputKey: z.string().min(1),
 inputLabel: z.string().min(1),
 inputMin: z.number().min(0),
 inputMax: z.number().positive(),
 inputStep: z.number().positive(),
 inputDefault: z.number(),
 /** Cálculo: recibe el input y devuelve el valor anual recuperado. */
 compute: z.function().args(z.number()).returns(z.number()),
 /** Nota de honestidad: SIEMPRE etiquetar proyecciones . */
 note: z.literal('Estimated based on industry averages'),
});
export type RoiFormula = z.infer<typeof RoiFormulaSchema>;

/** Integración que el demo "conecta" (scheduling, crm, sms, etc). */
export const IntegrationSchema = z.object({
 name: z.string().min(1),
 category: z.enum(['ai_receptionist', 'sms', 'crm', 'scheduling', 'payments']),
});
export type Integration = z.infer<typeof IntegrationSchema>;

/**
 * Contrato NICHO (tipo e) — Dashboard/Backoffice Dental.
 * Configuración de venta + estética. Todo nicho del demo implementa ESTE contrato.
 */
export const NicheConfigSchema = z.object({
 type: z.literal('e'), // dashboard/backoffice
 /** Clave del nicho (dental | medspa) — configuración, NUNCA hardcode en componente. */
 niche: z.string().min(1),
 name: z.string().min(1),
 /** Estética exacta por nicho : light clínico cálido. */
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
 /** SIEMPRE Calendly, NUNCA mailto . */
 url: z.literal('https://calendly.com/csch1305'),
 }),
});

export type NicheConfig = z.infer<typeof NicheConfigSchema>;
export type TypeE = NicheConfig;
