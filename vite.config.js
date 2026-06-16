import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_LOGIN_URL': JSON.stringify(process.env.VITE_LOGIN_URL),
    'process.env.VITE_SCRAPER_URL': JSON.stringify(process.env.VITE_SCRAPER_URL),
  },
  server: {
    host: '127.0.0.1',
    port: 3000,
    open: true
  },
  build: {
    outDir: 'build',
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
