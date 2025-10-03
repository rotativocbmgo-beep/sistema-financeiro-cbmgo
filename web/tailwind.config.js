// /web/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  // Informa ao Tailwind para procurar classes em todos os arquivos .jsx e .tsx
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
