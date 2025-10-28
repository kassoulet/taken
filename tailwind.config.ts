import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' if you want it to follow system preferences automatically
  theme: {
    extend: {
      fontFamily: {
        title: ["Pacifico", "cursive"],
        body: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
