import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // or 'media' if you want it to follow system preferences automatically
  theme: {
    extend: {
      fontFamily: {
        title: ['Pacifico', 'cursive'],
        body: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
