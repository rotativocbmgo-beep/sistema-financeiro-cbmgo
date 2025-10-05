/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Adiciona um breakpoint para telas extra pequenas
    screens: {
      'xs': '475px',
      // Mantém os breakpoints padrão do Tailwind
      ...require('tailwindcss/defaultTheme').screens,
    },
    extend: {
      // Você pode estender cores, fontes, etc., aqui no futuro.
    },
  },
  // Centraliza a classe 'container' por padrão
  corePlugins: {
    container: {
      center: true,
    },
  },
  plugins: [],
}
