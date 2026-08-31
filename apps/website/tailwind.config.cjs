const tokens = require('../../figma-design-system/00_design-tokens.json');

const tt = tokens.designTokens;

const fontFamily = {
  ...tt.typography.fontFamily,
  sans: tt.typography.fontFamily.secondary,
  heading: tt.typography.fontFamily.primary,
  body: tt.typography.fontFamily.secondary,
  serif: tt.typography.fontFamily.secondary,
  mono: tt.typography.fontFamily.mono,
};

module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  safelist: [
    { pattern: /(bg|text|border)-(success|warning|error)-(50|100|200|300|400|500|600|700|800|900|950)/ },
    { pattern: /(bg|text|border)-(primary|secondary|accent)-(50|100|200|300|400|500|600|700|800|900|950)/ },
  ],
  theme: {
    container: {
      center: true,
      padding: tt.grid?.container?.padding ?? '2rem',
      screens: tt.grid?.container?.screens ?? { '2xl': '1400px' },
    },
    extend: {
      colors: tt.colors,
      fontFamily,
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
      backgroundImage: {
        'hero-pattern': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        bounceSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
        'bounce-soft': 'bounceSoft 2s infinite',
        'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        wiggle: 'wiggle 1s ease-in-out infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    function ({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.text-gradient': {
          color: 'var(--ds-colors-primary-600)',
        },
        '.bg-brand-gradient': { background: 'var(--ds-colors-ink-surface)' },
        '.glass': {
          background: 'var(--ds-colors-ink-surface)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
        },
        '.glass-dark': {
          background: 'var(--ds-colors-ink-deep)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.austria-border': {
          position: 'relative',
          'border-top': '3px solid var(--brand-austria-red)',
          'border-bottom': '3px solid var(--brand-austria-red)',
        },
        '.interactive-hover': {
          transition: 'border-color 0.15s cubic-bezier(0, 0, 0.2, 1), background-color 0.15s cubic-bezier(0, 0, 0.2, 1)',
          '&:hover': { 'border-color': theme('colors.primary.600') },
        },
        '.safe-area-top': { 'padding-top': 'env(safe-area-inset-top)' },
        '.safe-area-bottom': { 'padding-bottom': 'env(safe-area-inset-bottom)' },
      });
      addComponents({
        '.btn': {
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          gap: '0.5rem',
          'border-radius': '4px',
          padding: '0.75rem 1.5rem',
          'font-weight': '600',
          'font-size': '0.875rem',
          'line-height': '1.25rem',
          transition: 'background-color 0.15s cubic-bezier(0, 0, 0.2, 1), border-color 0.15s cubic-bezier(0, 0, 0.2, 1)',
          cursor: 'pointer',
          border: 'none',
          'text-decoration': 'none',
          '&:disabled': { opacity: '0.5', cursor: 'not-allowed' },
        },
        '.btn-primary': {
          background: theme('colors.primary.600'),
          color: '#ffffff',
          '&:hover:not(:disabled)': {
            background: theme('colors.primary.700'),
          },
          '&:active:not(:disabled)': { background: theme('colors.primary.800') },
        },
        '.btn-ghost': {
          background: 'transparent',
          color: theme('colors.ink.body'),
          border: `1px solid ${theme('colors.paper.rule')}`,
          '&:hover:not(:disabled)': {
            background: theme('colors.paper.DEFAULT'),
            'border-color': theme('colors.primary.600'),
          },
        },
        '.btn-sm': { padding: '0.5rem 1rem', 'font-size': '0.75rem', 'line-height': '1rem' },
        '.btn-lg': { padding: '1rem 2rem', 'font-size': '1rem', 'line-height': '1.5rem' },
        '.card-modern': {
          background: '#ffffff',
          'border-radius': '0px',
          border: `1px solid ${theme('colors.paper.rule')}`,
          transition: 'border-color 0.15s cubic-bezier(0, 0, 0.2, 1)',
          '&:hover': { 'border-color': theme('colors.primary.600') },
        },
        '.input': {
          display: 'flex',
          width: '100%',
          'border-radius': '4px',
          border: `1px solid ${theme('colors.paper.rule')}`,
          background: '#ffffff',
          padding: '0.75rem 1rem',
          'font-size': '1rem',
          transition: 'border-color 0.15s cubic-bezier(0, 0, 0.2, 1)',
          '&:disabled': { opacity: '0.5', cursor: 'not-allowed' },
          '&::placeholder': { color: theme('colors.ink.subtle') },
        },
        '.section-padding': {
          'padding-top': '5rem',
          'padding-bottom': '5rem',
          '@media (max-width: 768px)': { 'padding-top': '3rem', 'padding-bottom': '3rem' },
        },
        '.section-padding-sm': {
          'padding-top': '3rem',
          'padding-bottom': '3rem',
          '@media (max-width: 768px)': { 'padding-top': '2rem', 'padding-bottom': '2rem' },
        },
        '.section-padding-lg': {
          'padding-top': '7rem',
          'padding-bottom': '7rem',
          '@media (max-width: 768px)': { 'padding-top': '4rem', 'padding-bottom': '4rem' },
        },
      });
    },
  ],
};
