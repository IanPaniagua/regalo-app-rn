/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#D4AF37',
        secondary: '#1C1C1C',
        tertiary: '#D9534F',
        white: '#FFFFFF',
        black: '#000000',
      },
      fontFamily: {
        title: ['TitleFont'],
        text: ['TextFont'],
      },
    },
  },
  plugins: [],
};
