import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'
import { copyFileSync, readdirSync, statSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

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
          // Copy _headers file
          if (entry === '_headers') {
            copyFileSync(srcPath, destPath)
            console.log(`✅ Copied: ${entry} (cache control)`)
          }
        }
      }
      
      copyRecursive(publicDir, distDir)
    }
  }
}

// Plugin per iniettare versione in HTML (anti-cache V11 rollback)
function injectVersionPlugin() {
  return {
    name: 'inject-version',
    closeBundle() {
      try {
        const distDir = join(process.cwd(), 'dist')
        
        // Get version info
        const commit = execSync('git rev-parse --short HEAD').toString().trim()
        const buildDate = new Date().toISOString()
        const version = {
          version: 'V12',
          commit,
          buildDate,
          buildTimestamp: Date.now()
        }
        
        console.log(`🏷️  Injecting version: ${JSON.stringify(version)}`)
        
        // Inject into firma-contratto.html
        const targetFile = join(distDir, 'firma-contratto.html')
        if (existsSync(targetFile)) {
          let content = readFileSync(targetFile, 'utf8')
          
          // Inject version meta tags
          const versionMeta = `
    <!-- BUILD INFO: ANTI-CACHE V11 ROLLBACK -->
    <meta name="build-version" content="${version.version}">
    <meta name="build-commit" content="${version.commit}">
    <meta name="build-date" content="${version.buildDate}">
    <meta name="build-timestamp" content="${version.buildTimestamp}">
    <!-- END BUILD INFO -->`
          
          content = content.replace('</head>', `${versionMeta}\n</head>`)
          writeFileSync(targetFile, content)
          console.log(`✅ Version injected in firma-contratto.html`)
        } else {
          console.warn(`⚠️  File not found: ${targetFile}`)
        }
      } catch (error) {
        console.error(`❌ Error injecting version:`, error)
      }
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
    copyPublicHtmlPlugin(),
    injectVersionPlugin()  // CRITICAL: Anti-cache V11 rollback
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
