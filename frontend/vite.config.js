import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Force Vite à écouter sur toutes les adresses IP (0.0.0.0)
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true // Indispensable sous Windows pour que le Hot Reload fonctionne à travers Docker
    }
  }
})