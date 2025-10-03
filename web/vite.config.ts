import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths' // 1. Importar o plugin

// https://vitejs.dev/config/
export default defineConfig({
  // 2. Adicionar o plugin à lista de plugins
  plugins: [react( ), tsconfigPaths()], 
})
