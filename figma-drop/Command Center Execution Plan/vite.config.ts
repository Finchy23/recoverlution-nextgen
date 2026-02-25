import { defineConfig } from 'vite'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used - do not remove them
    react({
      babel: {
        // Suppress Babel's "code generator has deoptimised the styling" note
        // for large data files (LabViewer specimens exceed 500KB threshold)
        generatorOpts: {
          compact: true,
        },
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Keep warnings meaningful while avoiding noise for intentionally large
    // route-level chunks in this generated Figma codebase.
    chunkSizeWarningLimit: 1400,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.split('?')[0].replace(/\\/g, '/')
          if (!moduleId.includes('/node_modules/')) {
            return undefined
          }

          if (
            moduleId.includes('/node_modules/react/') ||
            moduleId.includes('/node_modules/react-dom/') ||
            moduleId.includes('/node_modules/scheduler/')
          ) {
            return 'vendor-react'
          }

          if (
            moduleId.includes('/node_modules/react-router/') ||
            moduleId.includes('/node_modules/react-router-dom/')
          ) {
            return 'vendor-router'
          }

          if (
            moduleId.includes('/node_modules/@mui/') ||
            moduleId.includes('/node_modules/@emotion/')
          ) {
            return 'vendor-mui'
          }

          if (moduleId.includes('/node_modules/@radix-ui/')) {
            return 'vendor-radix'
          }

          if (
            moduleId.includes('/node_modules/recharts/') ||
            moduleId.includes('/node_modules/@visx/') ||
            moduleId.includes('/node_modules/d3-')
          ) {
            return 'vendor-charts'
          }

          if (moduleId.includes('/node_modules/reactflow/')) {
            return 'vendor-reactflow'
          }

          if (moduleId.includes('/node_modules/@supabase/')) {
            return 'vendor-supabase'
          }

          return 'vendor'
        },
      },
    },
  },
})
