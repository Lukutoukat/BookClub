import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    hmr: {
      host: 'localhost',
      port: 13000,
    },
    proxy: {
      '/api': {
        target: 'http://bookclub-backend:3003',
        changeOrigin: true,
      },
    }
  },
})
