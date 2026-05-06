const tokens = require('./figma-design-system/00_design-tokens.json');

const tt = tokens.designTokens;

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './figma-design-system/**/*.{ts,tsx,md}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: tt.colors,
      fontFamily: {
        ...tt.typography.fontFamily,
        sans: tt.typography.fontFamily.primary,
        serif: tt.typography.fontFamily.secondary,
        mono: tt.typography.fontFamily.mono,
      },
      fontSize: tt.typography.fontSize,
      fontWeight: tt.typography.fontWeight,
      lineHeight: tt.typography.lineHeight,
      letterSpacing: tt.typography.letterSpacing,
      spacing: tt.spacing,
      borderRadius: tt.borderRadius,
      boxShadow: tt.shadows,
      screens: tt.breakpoints,
    },
  },
  plugins: [],
};
