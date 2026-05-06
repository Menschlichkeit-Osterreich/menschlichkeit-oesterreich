import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        moe: {
          // Hauptfarben (Compass Artifact v1.0)
          'logo-orange': '#D4611E',
          'text-orange': '#B54A0F',
          'demokratie-blau': '#1B4965',

          // Sekundärfarben
          'petrol': '#00695C',
          'warmton': '#8B6F4E',

          // Neutrale (Warmgrau)
          'n50': '#FAF7F5',
          'n100': '#F0EBE6',
          'n200': '#DDD5CC',
          'n300': '#B8ADA0',
          'n500': '#7A6E62',
          'n700': '#4A4039',
          'n900': '#2B231D',

          // Funktionsfarben
          'success': '#2E7D32',
          'warning': '#E65100',
          'error': '#C62828',
          'info': '#1565C0',
        },
      },
      fontFamily: {
        'heading': ['var(--font-nunito-sans)', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        'body': ['var(--font-source-sans-3)', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'],
        'quote': ['Merriweather', 'Georgia', 'serif'],
      },
      fontSize: {
        'h1': ['3rem', { lineHeight: '1.2', fontWeight: '800' }],
        'h2': ['2.25rem', { lineHeight: '1.25', fontWeight: '700' }],
        'h3': ['1.75rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h4': ['1.375rem', { lineHeight: '1.35', fontWeight: '600' }],
        'lead': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        'caption': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label': ['0.8125rem', { lineHeight: '1.4', fontWeight: '600', letterSpacing: '0.05em' }],
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
      borderRadius: {
        'moe-sm': '8px',
        'moe-md': '12px',
        'moe-lg': '16px',
      },
      maxWidth: {
        'moe': '1200px',
      },
      boxShadow: {
        'moe-sm': '0 2px 8px rgba(43, 35, 29, 0.06)',
        'moe-md': '0 4px 16px rgba(43, 35, 29, 0.10)',
        'moe-lg': '0 8px 32px rgba(43, 35, 29, 0.14)',
      },
      ringColor: {
        'moe': '#1B4965',
      },
      ringWidth: {
        'moe': '3px',
      },
      transitionDuration: {
        'moe': '200ms',
      },
      transitionTimingFunction: {
        'moe': 'cubic-bezier(0.4, 0, 0.2, 1)',
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
