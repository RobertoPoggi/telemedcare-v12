import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import { copyFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Plugin per copiare forzatamente i file HTML da public/ a dist/
function copyPublicHtmlPlugin() {
  return {
    name: 'copy-public-html',
    closeBundle() {
      const publicDir = join(process.cwd(), 'public')
      const distDir = join(process.cwd(), 'dist')
      
      function copyRecursive(src: string, dest: string) {
        const entries = readdirSync(src)
        for (const entry of entries) {
          const srcPath = join(src, entry)
          const destPath = join(dest, entry)
          if (statSync(srcPath).isDirectory()) {
            continue // Skip directories for now
          }
          if (entry.endsWith('.html')) {
            copyFileSync(srcPath, destPath)
            console.log(`✅ Copied: ${entry}`)
          }
        }
      }
      
      copyRecursive(publicDir, distDir)
    }
  }
}

export default defineConfig({
  plugins: [
    build(),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    }),
    copyPublicHtmlPlugin()
  ],
  // Copia file statici da public/ nella build
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        // Mantieni file statici nella root
        assetFileNames: (assetInfo) => {
          // File PDF nella cartella brochures
          if (assetInfo.name?.endsWith('.pdf')) {
            return 'brochures/[name][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
