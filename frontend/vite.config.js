import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import configInjectPlugin from './vite-plugin-config-inject.js';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      configInjectPlugin(env.VITE_CHATBOT_PERSON_NAME)
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
  }
})