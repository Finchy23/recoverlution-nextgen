import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const SERIES_CHUNK_RE = /[\\/]src[\\/]app[\\/]components[\\/]atoms[\\/](series-[^\\/]+)[\\/]/
const REGISTRY_COLLECTION_RE =
  /[\\/]src[\\/]app[\\/]components[\\/]atoms[\\/]atom-registry-c(\d+)\.ts$/

function getAtomSeriesChunk(id: string): string | null {
  const match = id.match(SERIES_CHUNK_RE)
  return match ? `atoms-${match[1]}` : null
}

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'

          const atomSeriesChunk = getAtomSeriesChunk(id)
          if (atomSeriesChunk) return atomSeriesChunk

          const registryCollectionMatch = id.match(REGISTRY_COLLECTION_RE)
          if (registryCollectionMatch) return `atoms-registry-c${registryCollectionMatch[1]}`

          if (id.includes('/src/app/components/atoms/atom-registry.ts')) return 'atoms-registry-core'
          if (id.includes('/src/app/components/atoms/index.ts')) return 'atoms-index'
          if (id.includes('/src/app/pages/voice/atomic-voice-copy.ts')) return 'voice-atomic-copy'
          if (id.includes('/src/app/pages/voice/narrative-copy.ts')) return 'voice-narrative-copy'
          if (id.includes('/src/app/pages/home-sections/')) return 'home-sections'
          if (id.includes('/src/design-system/mechanisms-300')) return 'mechanisms-catalog'
          if (id.includes('/src/navicue-data.ts')) return 'navicue-data'
          if (id.includes('/src/app/data/atom-copy-profile.ts')) return 'atom-copy-profile'
          if (id.includes('/src/app/data/composition-presets.ts')) return 'composition-presets'

          return undefined
        },
      },
    },
  },
})
