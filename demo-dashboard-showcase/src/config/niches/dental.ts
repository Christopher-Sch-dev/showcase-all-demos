/**
 * NICHO DENTAL — implementa el contrato Zod (src/config/schema.ts).
 * Nicho = configuración, NO código (DI,).
 * Estética light clínico cálido: teal #2F9E9B + lavanda + Plus Jakarta Sans.
 * Copy EN de (tesis 5 movimientos: problema→solución→ROI→prueba→CTA).
 * HONESTIDAD : métricas SIEMPRE con source (Planet DDS, Teero, Clerri, Arini, Denzif,
 * Tandem, Dental Tribune/Sesame); proyecciones etiquetadas; sin testimonios falsos.
 * CTA SIEMPRE Calendly , NUNCA mailto.
 */
import { NicheConfigSchema } from '../schema';

export const dentalConfig = NicheConfigSchema.parse({
 type: 'e',
 niche: 'dental',
 name: 'Dental Dashboard & Backoffice',

 // ── Estética light clínico cálido (,) ──
 aesthetic: {
 theme: 'light',
 mode: 'light',
 background: '#FAFAF8', // blanco cálido/crema — fondo clínico
 surface: '#FFFFFF', // tarjetas
 accent: '#2F9E9B', // teal clínico — CTA, KPIs, focus
 accentStrong: '#1F7A78', // hover/active del teal (contraste AA)
 accentSoft: '#E0F2F1', // fondo de badges/estado activo
 lavender: '#B8A7E8', // lavanda — acentos secundarios, charts
 lavenderSoft: '#F0EBFA',
 text: '#1A1F26', // texto principal (casi negro, no #000)
 muted: '#4B5563',
 displayFont: 'Plus Jakarta Sans', // display/títulos ()
 bodyFont: 'Inter', // body/datos
 radius: 'rounded', // CTA rectificado (clínico cálido)
 },

 // ── Narrativa de venta (anti-tech-demo) ──
 hero: {
 eyebrow: 'DENTAL · BACKOFFICE · LIVE',
 headline: 'Your schedule is leaking revenue. See exactly where — and how much.',
 subheadline:
 'Every empty chair is money you already earned. This dashboard shows your no-show rate, revenue per patient, and production in real time — so you stop guessing and start recovering.',
 ctaLabel: 'See your numbers in a live demo',
 },

 painPoint: {
 headline: "You don't have a patient problem. You have a no-show problem.",
 body: "You book the chair, staff the room, and prep the tray. Then the patient doesn't show. The average dental practice loses 7.4% of confirmed appointments to no-shows — and another 15.5% to advance cancellations (Planet DDS, 3,400 practices). That's not a scheduling annoyance. At $200–$375 per missed slot (Denzif, Tandem Health), it's $105,000+ a year walking out the door (Clerri, Arini).",
 metrics: [
 {
 label: 'Average dental no-show rate',
 value: '7.4%',
 source: 'https://www.planetdds.com/resources/2025-dental-industry-outlook-report/',
 },
 {
 label: 'True cost of one missed appointment',
 value: '$200–$375',
 source: 'https://denzif.com/blog/dental-no-show-cost-revenue-loss-2026/',
 },
 {
 label: 'What the average practice loses to no-shows per year',
 value: '$105K+',
 source: 'https://clerri.com/blog/dental-patient-no-show-statistics',
 },
 ],
 },

 metrics: [
 {
 label: 'Average dental no-show rate',
 value: '7.4%',
 source: 'https://www.planetdds.com/resources/2025-dental-industry-outlook-report/',
 },
 {
 label: 'Advance cancellations on top of no-shows',
 value: '15.5%',
 source: 'https://www.planetdds.com/resources/2025-dental-industry-outlook-report/',
 },
 {
 label: 'Revenue per patient (Total Revenue / Active Patients)',
 value: '$500',
 source: 'https://teero.com/blog/dental-kpis',
 },
 {
 label: 'Average daily production',
 value: '$8,436',
 source: 'https://www.planetdds.com/resources/2025-dental-industry-outlook-report/',
 },
 {
 label: 'No-show reduction from automated reminders (1.6M appointments)',
 value: '22.95%',
 source: 'https://us.dental-tribune.com/news/study-reveals-how-automated-patient-appointment-reminders-affect-dental-practice-no-show-rates-and-production/',
 },
 {
 label: 'Retention drop after a patient\u2019s first no-show',
 value: '-70%',
 source: 'https://denzif.com/blog/dental-no-show-cost-revenue-loss-2026/',
 },
 ],

 roiFormula: {
 inputKey: 'appointmentsPerDay',
 inputLabel: 'Appointments per day',
 inputMin: 0,
 inputMax: 100,
 inputStep: 1,
 inputDefault: 36,
 // compute: (citas/día) × 7.4% no-show × $250 valor promedio × 365 días
 // = pérdida anual por sillas vacías; reminders cortan 22.95% → revenue recuperado.
 compute: (appointmentsPerDay: number) => appointmentsPerDay * 0.074 * 250 * 365 * 0.2295,
 note: 'Estimated based on industry averages',
 },

 integrations: [
 { name: 'Calendly scheduling', category: 'scheduling' },
 { name: 'SMS appointment reminders', category: 'sms' },
 { name: 'Patient CRM sync', category: 'crm' },
 { name: 'Online payments', category: 'payments' },
 ],

 proof: [
 {
 type: 'statistic',
 text: 'Automated reminders cut no-shows 22.95% across 1,604,184 appointments in 64 practices — $31,456.88 in incremental production documented.',
 source: 'https://us.dental-tribune.com/news/study-reveals-how-automated-patient-appointment-reminders-affect-dental-practice-no-show-rates-and-production/',
 },
 {
 type: 'statistic',
 text: 'Top 10% of dental practices hold no-shows at 1% while the average sits at 15% — the gap is systems, not luck.',
 source: 'https://clerri.com/blog/dental-patient-no-show-statistics',
 },
 {
 type: 'case_study',
 text: 'Weave — Sonrisa Dental saves $50K/year and Smith Dental adds +28% new patients (named case studies, vendor-reported).',
 source: 'https://getweave.com/industry/dentistry/',
 },
 ],

 cta: {
 label: 'Book your live demo',
 url: 'https://calendly.com/csch1305',
 },
});

export type DentalConfig = typeof dentalConfig;
