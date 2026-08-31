import { describe, it, expect } from 'vitest';
import { NicheConfigSchema } from '../schema';

// rol: suite del contrato Zod de la narrativa de venta por nicho.
// Verifica que el schema FUERZA una narrativa completa con honestidad de métricas (source) y CTA Calendly.
// Patrón: schema + niches + router DI.

/** Config de prueba completa y válida que satisface todos los campos obligatorios. */
const validConfig = {
 type: 'e' as const,
 niche: 'dental',
 name: 'Dental Dashboard & Backoffice',
 aesthetic: {
 theme: 'light' as const,
 mode: 'light' as const,
 background: '#FAFAF8',
 surface: '#FFFFFF',
 accent: '#2F9E9B',
 accentStrong: '#1F7A78',
 accentSoft: '#E0F2F1',
 lavender: '#B8A7E8',
 lavenderSoft: '#F0EBFA',
 text: '#1A1F26',
 muted: '#4B5563',
 displayFont: 'Plus Jakarta Sans',
 bodyFont: 'Inter',
 radius: 'rounded' as const,
 },
 hero: {
 eyebrow: 'DENTAL · BACKOFFICE · LIVE',
 headline: 'Your schedule is leaking revenue. See exactly where — and how much.',
 subheadline:
 'Every empty chair is money you already earned. This dashboard shows your no-show rate, revenue per patient, and production in real time — so you stop guessing and start recovering.',
 ctaLabel: 'See your numbers in a live demo',
 },
 painPoint: {
 headline: "You don't have a patient problem. You have a no-show problem.",
 body: 'You book the chair, staff the room, and prep the tray. Then the patient does not show.',
 metrics: [
 {
 label: 'Average dental no-show rate',
 value: '7.4%',
 source: 'https://www.planetdds.com/resources/2025-dental-industry-outlook-report/',
 },
 ],
 },
 metrics: [
 {
 label: 'Average dental no-show rate',
 value: '7.4%',
 source: 'https://www.planetdds.com/resources/2025-dental-industry-outlook-report/',
 },
 ],
 roiFormula: {
 inputKey: 'appointmentsPerDay',
 inputLabel: 'Appointments per day',
 inputMin: 0,
 inputMax: 100,
 inputStep: 1,
 inputDefault: 36,
 compute: (appointmentsPerDay: number) => appointmentsPerDay * 0.074 * 250 * 365,
 note: 'Estimated based on industry averages',
 },
 integrations: [{ name: 'Calendly scheduling', category: 'scheduling' as const }],
 proof: [
 {
 type: 'statistic' as const,
 text: 'Automated reminders cut no-shows 22.95% across 1.6M appointments.',
 source: 'https://us.dental-tribune.com/news/study-reveals-how-automated-patient-appointment-reminders-affect-dental-practice-no-show-rates-and-production/',
 },
 ],
 cta: {
 label: 'Book your live demo',
 url: 'https://calendly.com/csch1305',
 },
};

describe('NicheConfigSchema — contrato de narrativa de venta ', () => {
 it('acepta una config de nicho completa y válida', () => {
 const parsed = NicheConfigSchema.parse(validConfig);
 expect(parsed.niche).toBe('dental');
 expect(parsed.type).toBe('e');
 expect(parsed.aesthetic.theme).toBe('light');
 });

 it('NUNCA compila sin painPoint (anti-tech-demo,)', () => {
 const { painPoint, ...rest } = validConfig;
 const res = NicheConfigSchema.safeParse(rest);
 expect(res.success).toBe(false);
 });

 it('NUNCA compila sin hero (anti-tech-demo,)', () => {
 const { hero, ...rest } = validConfig;
 const res = NicheConfigSchema.safeParse(rest);
 expect(res.success).toBe(false);
 });

 it('NUNCA compila sin metrics[] (anti-tech-demo,)', () => {
 const { metrics, ...rest } = validConfig;
 const res = NicheConfigSchema.safeParse(rest);
 expect(res.success).toBe(false);
 });

 it('NUNCA compila sin aesthetic (estética por nicho,)', () => {
 const { aesthetic, ...rest } = validConfig;
 const res = NicheConfigSchema.safeParse(rest);
 expect(res.success).toBe(false);
 });

 it('NUNCA compila sin roiFormula (anti-tech-demo,)', () => {
 const { roiFormula, ...rest } = validConfig;
 const res = NicheConfigSchema.safeParse(rest);
 expect(res.success).toBe(false);
 });

 it('NUNCA compila sin cta (anti-tech-demo,)', () => {
 const { cta, ...rest } = validConfig;
 const res = NicheConfigSchema.safeParse(rest);
 expect(res.success).toBe(false);
 });
});

describe('MetricSchema — honestidad de métricas ', () => {
 it('exige source URL en cada métrica', () => {
 const bad = NicheConfigSchema.safeParse({
 ...validConfig,
 metrics: [{ label: 'x', value: '21x' }],
 });
 expect(bad.success).toBe(false);
 });

 it('rechaza una métrica con source no-URL', () => {
 const bad = NicheConfigSchema.safeParse({
 ...validConfig,
 metrics: [{ label: 'x', value: '21x', source: 'not-a-url' }],
 });
 expect(bad.success).toBe(false);
 });
});

describe('RoiFormulaSchema — proyecciones etiquetadas ', () => {
 it('exige la nota literal de honestidad en proyecciones', () => {
 const bad = NicheConfigSchema.safeParse({
 ...validConfig,
 roiFormula: {
 ...validConfig.roiFormula,
 note: 'Guaranteed results',
 },
 });
 expect(bad.success).toBe(false);
 });
});

describe('CTASchema — Calendly, nunca mailto ', () => {
 it('rechaza una CTA mailto', () => {
 const res = NicheConfigSchema.safeParse({
 ...validConfig,
 cta: { label: 'Email us', url: 'mailto:hi@clinic.com' },
 });
 expect(res.success).toBe(false);
 });

 it('acepta la URL canónica de Calendly', () => {
 const parsed = NicheConfigSchema.parse(validConfig);
 expect(parsed.cta.url).toBe('https://calendly.com/csch1305');
 expect(parsed.cta.url.startsWith('mailto:')).toBe(false);
 });
});
