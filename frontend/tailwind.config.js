/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        docker: {
          blue: '#2496ed',
          dark: '#0db7ed',
        },
      },
    },
  },
  plugins: [],
};
