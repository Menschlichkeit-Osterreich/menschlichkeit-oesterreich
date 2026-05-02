 
const tokens = require('../../figma-design-system/00_design-tokens.json');

const tt = tokens.designTokens;

const fontFamily = {
  ...tt.typography.fontFamily,
  sans: tt.typography.fontFamily.primary,
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
      screens: tt.breakpoints,
      backgroundImage: {
        'brand-gradient': 'var(--brand-gradient)',
        'hero-pattern': 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
        glass: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
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
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
          '70%': { transform: 'translate3d(0, -4px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
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
          background: 'var(--brand-gradient)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.bg-brand-gradient': { background: 'var(--brand-gradient)' },
        '.glass': {
          background: 'rgba(255, 255, 255, 0.1)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.1)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.austria-border': {
          position: 'relative',
          'border-top': '3px solid var(--brand-austria-red)',
          'border-bottom': '3px solid var(--brand-austria-red)',
        },
        '.interactive-hover': {
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { transform: 'translateY(-2px)', 'box-shadow': theme('boxShadow.lg') },
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
          'border-radius': 'var(--radius-md)',
          padding: '0.75rem 1.5rem',
          'font-weight': '600',
          'font-size': '0.875rem',
          'line-height': '1.25rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          border: 'none',
          'text-decoration': 'none',
          '&:focus-visible': { outline: '2px solid var(--ring)', 'outline-offset': '2px' },
          '&:disabled': { opacity: '0.5', cursor: 'not-allowed' },
        },
        '.btn-primary': {
          background: theme('colors.primary.500'),
          '&:hover:not(:disabled)': {
            background: theme('colors.primary.600'),
            transform: 'translateY(-1px)',
            'box-shadow': theme('boxShadow.md'),
          },
          '&:active': { transform: 'translateY(0)' },
        },
        '.btn-ghost': {
          background: 'transparent',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          '&:hover:not(:disabled)': { background: 'var(--surface-elevated)', 'border-color': 'var(--ring)' },
        },
        '.btn-sm': { padding: '0.5rem 1rem', 'font-size': '0.75rem', 'line-height': '1rem' },
        '.btn-lg': { padding: '1rem 2rem', 'font-size': '1rem', 'line-height': '1.5rem' },
        '.card-modern': {
          background: 'var(--surface)',
          'border-radius': 'var(--radius-lg)',
          'box-shadow': 'var(--shadow-md)',
          border: '1px solid var(--border-muted)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': { 'box-shadow': 'var(--shadow-lg)', transform: 'translateY(-2px)' },
        },
        '.input': {
          display: 'flex',
          width: '100%',
          'border-radius': 'var(--radius-md)',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '0.75rem 1rem',
          'font-size': '0.875rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:focus': { outline: 'none', 'border-color': 'var(--ring)' },
          '&:disabled': { opacity: '0.5', cursor: 'not-allowed' },
          '&::placeholder': { color: 'var(--text-muted)' },
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
