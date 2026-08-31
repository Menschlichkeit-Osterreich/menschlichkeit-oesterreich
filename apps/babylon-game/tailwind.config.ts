import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/game/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        moe: {
          // Hauptfarben (Compass Artifact v1.0)
          'logo-orange': '#D4611E',
          'text-orange': '#B54A0F',
          'demokratie-blau': '#1B4965',

          // Signal- und Auszeichnungsstufen
          'signal': '#D4611E',
          'signal-hell': '#EEA06F',
          'signal-tief': '#B54A0F',

          // Sekundärfarben
          'petrol': '#1B4965',
          'petrol-hell': '#EEF5F8',
          'warmton': '#8B6F4E',

          // Neutrale (Warmgrau)
          'n50': '#FAF7F5',
          'n100': '#F0EBE6',
          'n200': '#DDD5CC',
          'n300': '#B8ADA0',
          'n500': '#7A6E62',
          'n700': '#4A4039',
          'n900': '#2B231D',

          // Papier und Haarlinien (Website-Vertrag)
          'paper': '#F7F4F1',
          'rule': '#DCD4CD',
          'rule-soft': '#ECE7E2',

          // Tinte — dunkle Flächen von HUD, Kopfzeilen und Szene
          'ink': '#0D2B3A',
          'ink-tief': '#12212B',
          'ink-body': '#3C4A52',
          'ink-muted': '#5D6B73',
          'ink-on-dark': '#C3D3DB',
          'ink-on-dark-muted': '#8FB3C4',

          // HUD-Grundflächen — deckend statt backdrop-filter
          'hud': 'rgba(7, 26, 36, 0.86)',
          'hud-soft': 'rgba(7, 26, 36, 0.82)',
          'hud-rule': 'rgba(247, 244, 241, 0.16)',
          'hud-rule-strong': 'rgba(247, 244, 241, 0.28)',

          // Funktionsfarben
          'success': '#2E7D32',
          'warning': '#E65100',
          'error': '#C62828',
          'info': '#1565C0',
        },
        // Szenen-Palette Welt 1 — Orange ausschliesslich fuer Interagierbares
        welt1: {
          'grund': '#143B4D',
          'platz': '#1C4A5E',
          'pflaster-1': '#6F6259',
          'pflaster-2': '#7D7167',
          'pflaster-3': '#5D5148',
          'pflaster-4': '#8A7D70',
          'stein-hell': '#C9BFB4',
          'holz': '#8A6F52',
          'gusseisen': '#2F3338',
          'messing': '#9A7B45',
          'kupferpatina': '#5E8B7E',
          'dachziegel': '#A9532C',
          'schiefer': '#4B5057',
          'laub': '#55663F',
        },
      },
      fontFamily: {
        'heading': ['var(--font-familjen-grotesk)', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        'body': ['var(--font-ibm-plex-sans)', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        'mono': ['var(--font-ibm-plex-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        'h1': ['2.5rem', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h2': ['2.125rem', { lineHeight: '1.15', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h3': ['1.625rem', { lineHeight: '1.25', fontWeight: '600' }],
        'h4': ['1.3125rem', { lineHeight: '1.35', fontWeight: '600' }],
        'lead': ['1.1875rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['0.8125rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.14em' }],
      },
      spacing: {
        'moe-1': '8px',
        'moe-2': '16px',
        'moe-3': '24px',
        'moe-4': '32px',
        'moe-5': '40px',
        'moe-6': '48px',
        'moe-8': '64px',
        'moe-10': '80px',
      },
      // Geometrie folgt dem Website-Vertrag: 4 px fuer Bedienelemente, sonst 0.
      borderRadius: {
        'moe-sm': '4px',
        'moe-md': '4px',
        'moe-lg': '4px',
        DEFAULT: '4px',
        sm: '4px',
        md: '4px',
        lg: '4px',
        xl: '4px',
        '2xl': '4px',
        '3xl': '4px',
        none: '0px',
        full: '9999px',
      },
      maxWidth: {
        'moe': '1200px',
      },
      // Keine Schatten. Flaechen werden ueber Haarlinien getrennt.
      boxShadow: {
        'moe-sm': '0 0 #0000',
        'moe-md': '0 0 #0000',
        'moe-lg': '0 0 #0000',
        sm: '0 0 #0000',
        DEFAULT: '0 0 #0000',
        md: '0 0 #0000',
        lg: '0 0 #0000',
        xl: '0 0 #0000',
        '2xl': '0 0 #0000',
        inner: '0 0 #0000',
      },
      ringColor: {
        'moe': '#1B4965',
      },
      ringWidth: {
        'moe': '3px',
      },
      transitionDuration: {
        'moe': '140ms',
      },
      transitionTimingFunction: {
        'moe': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
