import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  define: {
    // by default, Vite doesn't include shims for NodeJS which v1.0.2 of the
    // typed-array-byte-offset which is an indirect dependency requires
    global: {}
  }
})
