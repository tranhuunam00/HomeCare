import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Worker giải mã DICOM dùng dynamic import (codec WASM) -> cần định dạng ES module
  worker: {
    format: 'es',
  },
  test: {
    environment: "jsdom",
    globals: true,
  },
})
