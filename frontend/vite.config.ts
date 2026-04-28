import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'dist',
  },
  base: './',
  // Add this resolve section to define path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../shared'), // <-- This is the key line
    },
  },
})