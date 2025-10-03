import type { Config } from 'tailwindcss';

// Austrian Red Design Tokens direkt definiert
const austrianRedTheme = {
  colors: {
    brand: {
      'austria-red': '#c8102e',
      orange: '#ff6b35',
      red: '#e63946',
    },
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#c8102e', // Austrian Red
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
      DEFAULT: '#c8102e',
    },
    secondary: {
      500: '#ff6b35', // Orange
      600: '#e63946', // Red
      DEFAULT: '#ff6b35',
    },
    destructive: {
      DEFAULT: '#dc2626',
      foreground: '#fef2f2',
    },
    success: {
      DEFAULT: '#16a34a',
      foreground: '#f0fdf4',
    },
    warning: {
      DEFAULT: '#ca8a04',
      foreground: '#fefce8',
    },
    muted: {
      DEFAULT: '#f4f4f5',
      foreground: '#71717a',
    },
    accent: {
      DEFAULT: '#f4f4f5',
      foreground: '#18181b',
    },
    background: '#ffffff',
    foreground: '#0a0a0a',
    card: '#ffffff',
    'card-foreground': '#0a0a0a',
    popover: '#ffffff',
    'popover-foreground': '#0a0a0a',
    border: '#e4e4e7',
    input: '#e4e4e7',
    ring: '#c8102e',
  },
  fontFamily: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
    serif: ['Merriweather', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
    mono: ['JetBrains Mono', 'Courier New', 'Courier', 'monospace'],
  },
};

export default {
  content: ['./*.html', './scripts/**/*.js', '../figma-design-system/components/**/*.{tsx,jsx}'],
  darkMode: 'class',
  theme: {
    extend: austrianRedTheme,
  },
  plugins: [],
} satisfies Config;
