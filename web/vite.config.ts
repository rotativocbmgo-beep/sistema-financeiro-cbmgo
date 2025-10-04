import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths' // 1. Importar

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react( ), 
    tsconfigPaths() // 2. Adicionar o plugin aqui
  ], 
})
