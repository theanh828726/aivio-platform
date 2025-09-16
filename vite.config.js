import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This allows Vercel's /api routes to work in development
    proxy: {
      '/api': 'http://localhost:3001' // You might need a separate terminal to run Vercel's API functions
    }
  }
})
