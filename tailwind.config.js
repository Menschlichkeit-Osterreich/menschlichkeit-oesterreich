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
      padding: tt.grid?.container?.padding ?? '2rem',
      screens: tt.grid?.container?.screens ?? { '2xl': '1400px' },
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
      zIndex: tt.zIndex,
      screens: tt.breakpoints,
      transitionDuration: tt.animation?.duration,
      transitionTimingFunction: {
        linear: tt.animation?.easing?.linear,
        ease: tt.animation?.easing?.ease,
        DEFAULT: tt.animation?.easing?.['ease-in-out'],
        in: tt.animation?.easing?.['ease-in'],
        out: tt.animation?.easing?.['ease-out'],
        'in-out': tt.animation?.easing?.['ease-in-out'],
        bounce: tt.animation?.easing?.bounce,
      },
    },
  },
  plugins: [],
};
