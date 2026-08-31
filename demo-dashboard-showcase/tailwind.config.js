/** @type {import('tailwindcss').Config} */
// Tailwind v3. Los tokens de color se resuelven desde CSS variables inyectadas por
// la config Zod del nicho (getNicheConfig('dental').aesthetic) en BaseLayout.astro.
// NUNCA hardcodear el aesthetic aquí: los valores viven en src/config/niches/dental.ts.
export default {
 content: ['./src/**/*.{astro,ts,tsx}'],
 theme: {
 extend: {
 colors: {
 // Resueltos en runtime desde CSS vars (config Zod) — light clínico dental.
 bg: 'var(--bg)',
 surface: 'var(--surface)',
 'surface-2': 'var(--surface-2)',
 text: 'var(--text)',
 'text-secondary': 'var(--text-secondary)',
 'text-muted': 'var(--text-muted)',
 accent: 'var(--accent)',
 'accent-strong': 'var(--accent-strong)',
 'accent-soft': 'var(--accent-soft)',
 lavender: 'var(--lavender)',
 'lavender-soft': 'var(--lavender-soft)',
 success: 'var(--success)',
 warning: 'var(--warning)',
 danger: 'var(--danger)',
 border: 'var(--border)',
 },
 fontFamily: {
 display: 'var(--font-display)',
 body: 'var(--font-body)',
 mono: 'var(--font-mono)',
 },
 borderRadius: {
 card: 'var(--radius-card)',
 pill: 'var(--radius-pill)',
 },
 transitionTimingFunction: {
 ease: 'var(--ease)',
 },
 },
 },
 plugins: [],
};
