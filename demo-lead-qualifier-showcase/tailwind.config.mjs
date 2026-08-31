/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
        // Design tokens base neutros del scaffold. La paleta de nicho (RE dark luxury / Law navy)
        // se resuelve desde src/config/schema.ts aesthetic (DI) y se aplica por CSS vars en el layout.
        // displayFont/bodyFont/accent/background/text/muted se inyectan desde config.aesthetic.
        colors: {
          lq: {
            base: '#FAFAF7',
            surface: '#FFFFFF',
            text: '#1C2B39',
            muted: '#5B6B7C',
            'border-real': '#D8DEE6',
          },
        },
        fontFamily: {
          display: ['var(--lq-display)', 'serif'],
          body: ['var(--lq-body)', 'system-ui', 'sans-serif'],
          mono: ['"JetBrains Mono"', 'monospace'],
        },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
    },
  },
  plugins: [],
};
