import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import loggingMiddleware from '../logging-middleware/index.js'

export default defineConfig({
  plugins: [react(), loggingMiddleware()],
  server: {
    port: 3000,
    strictPort: true
  }
})
