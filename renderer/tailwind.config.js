/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./renderer/pages/**/*.{js,ts,jsx,tsx}', './renderer/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      scale: {
        400: '4',
        800: '8',
      },
    },
  },
  plugins: [],
}
