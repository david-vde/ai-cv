import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import configInjectPlugin from './vite-plugin-config-inject.js';

export default defineConfig({
  plugins: [
    react(),
    configInjectPlugin()
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    css: true
  }
})