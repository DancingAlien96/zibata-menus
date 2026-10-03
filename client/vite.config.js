import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Escucha en IPv4 e IPv6 (algunos navegadores resuelven localhost a 127.0.0.1)
    host: true,
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
