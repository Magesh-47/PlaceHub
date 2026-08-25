import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port 8080 is commonly taken on this machine (Apache/XAMPP), so the backend runs
// on 8081. Override with VITE_API_TARGET if you start Spring Boot elsewhere.
const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:8081'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
