/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design tokens compartidos (CANON web-creador · auditoría 2026)
        // CORREGIDO 20 ago 2026 por auditoría externa anti-slop:
        //   - naranja #FF7A1A = MARCA (calor/urgencia HVAC, fuera del azul saturado)
        //   - azul #0B5FFF = ACENTO técnico de soporte (NO primario)
        hvac: {
          base: '#FAFAF7',
          surface: '#FFFFFF',
          brand: '#FF7A1A',        // marca (era primary #0B5FFF)
          'brand-strong': '#FF8400', // hover de marca
          accent: '#0B5FFF',        // acento técnico (era primary)
          'accent-strong': '#0E6BE6',
          steel: '#1C2B39',
          urgent: '#FF5C33',        // urgencia más fuerte que brand
          'on-route': '#16A34A',
          neutral: '#F5F6F8',
          text: '#1C2B39',
          muted: '#5B6B7C',
          'border-real': '#D8DEE6', // bordes reales 1px (en vez de sombras difusas)
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
        elevated: '0 4px 12px rgba(0,0,0,0.10), 0 12px 32px rgba(0,0,0,0.08)',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
