const { blue, gray } = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../apps/website/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: blue,
        secondary: gray,
      },
    },
  },
  plugins: [],
};
