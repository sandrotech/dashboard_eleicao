import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/tse-api': {
        target: 'https://resultados.tse.jus.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tse-api/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://resultados.tse.jus.br/'
        }
      }
    }
  }
})
