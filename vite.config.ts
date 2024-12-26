import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/cesium/Build/Cesium/Workers/*',
          dest: 'Workers'
        },
        {
          src: 'node_modules/cesium/Build/Cesium/ThirdParty/*',
          dest: 'ThirdParty'
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Assets/*',
          dest: 'Assets'
        },
        {
          src: 'node_modules/cesium/Build/Cesium/Widgets/*',
          dest: 'Widgets'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    CESIUM_BASE_URL: JSON.stringify('')
  }
}) 