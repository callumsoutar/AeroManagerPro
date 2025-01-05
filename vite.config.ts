import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      external: ['@react-pdf/renderer'],
      output: {
        globals: {
          '@react-pdf/renderer': 'ReactPDF'
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['@react-pdf/renderer']
  },
  server: {
    port: 3000
  }
})
