/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
        // Design tokens base neutros del scaffold. La paleta de nicho (RE dark luxury / Law navy)
        // se resuelve desde src/config/schema.ts aesthetic (DI) y se aplica por CSS vars en el layout.
        // displayFont/bodyFont/accent/background/text/muted se inyectan desde config.aesthetic.
        // OJO: las familias apuntan a --brand-* (las que BaseLayout declara). Si apuntan a un
        // token inexistente, la declaración queda inválida y el texto hereda la fuente del body.
        colors: {
          // Semánticos: resuelven a los tokens que BaseLayout inyecta desde config.aesthetic,
          // así los componentes del demo heredan la paleta del nicho sin hardcodear color.
          muted: 'var(--brand-muted)',
          surface: 'var(--brand-surface)',
          accent: 'var(--brand-accent)',
          ink: 'var(--brand-text)',
          lq: {
            base: '#FAFAF7',
            surface: '#FFFFFF',
            text: '#1C2B39',
            muted: '#5B6B7C',
            'border-real': '#D8DEE6',
          },
        },
        borderColor: {
          DEFAULT: 'var(--lq-border-soft)',
        },
        divideColor: {
          DEFAULT: 'var(--lq-border-soft)',
        },
        fontFamily: {
          display: ['var(--brand-display)', 'Georgia', 'serif'],
          body: ['var(--brand-body)', 'system-ui', 'sans-serif'],
          mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
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
