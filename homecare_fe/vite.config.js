import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
  preview: {
    port: 3003,
    host: '0.0.0.0',
    strictPort: true,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
  },
})
