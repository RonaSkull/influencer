import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All requests to /bubblelab/* are forwarded server-side (no CORS restriction)
      '/bubblelab': {
        target: 'https://api.nodex.bubblelab.ai',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/bubblelab/, ''),
        // Extend timeout to 30 minutes — workflow with 3+ videos can take 20+ min
        timeout: 1800000,
        proxyTimeout: 1800000,
      },
    },
  },
})
