import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  server: {
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '54d6-142-58-219-95.ngrok-free.app',
      '89c4-142-58-219-95.ngrok-free.app'
    ],
    host: true
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:3001')
  }
})
