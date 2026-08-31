// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// Config Astro static + React islands + Tailwind.
// output: 'static' — demo ungated, sin backend.
export default defineConfig({
 output: 'static',
 integrations: [
 react(),
 tailwind({
 // Tailwind v3 via @astrojs/tailwind; content apunta a src (islands + layouts).
 // applyBaseStyles: true inyecta el CSS base de Tailwind (preflight + utilities).
 applyBaseStyles: true,
 }),
 ],
});
