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
    // Keep this as a warning guard only. Avoid forced manual chunk splitting,
    // which can destabilize module initialization order in very large bundles.
    chunkSizeWarningLimit: 10000,
  },
})
