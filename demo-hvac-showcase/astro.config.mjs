// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), tailwind()],
  output: 'static',
  // i18n manual por contenido (static, sin server middleware)
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: 'manual',
  },
});
