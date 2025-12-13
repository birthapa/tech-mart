import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      // Proxy all /api requests to backend
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: false,
        // Optional: rewrite if needed (usually not)
        // rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
  },
})