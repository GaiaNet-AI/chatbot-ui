/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        //rebranding
        pearl: '#F5F5EF',
        onyx: '#121314',
        stone: '#666666',
        pebble: '#A4A3A3',
        fontPrimary: '#121314',
        fontSecondary: '#666666',
        fontTertiary: '#A4A3A3',
        fontLight: '#F5F5EF',
        fontWrong: '#DC3545',
        fontSuccess: '#28A745',
        fillPrimary: '#121314',
        fill: '#121314',
        fillSecondary: '#666666',
        fillTertiary: '#A4A3A3',
        fillLine: 'rgba(164,163,163,0.5)',
        fillBackground: 'rgba(164,163,163,0.1)',
        fillSuccess: '#28A745',
        fillDanger: '#DC3545',
        fillLight: '#F5F5EF',
      },
    },
  },
  variants: {
    extend: {
      visibility: ['group-hover'],
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
