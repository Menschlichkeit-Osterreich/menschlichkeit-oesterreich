 
const tokens = require('../figma-design-system/00_design-tokens.json');

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
    { pattern: /(bg|text|border)-(success|warning|error)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /(bg|text|border)-(primary|secondary)-(50|100|200|300|400|500|600|700|800|900)/ },
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
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
