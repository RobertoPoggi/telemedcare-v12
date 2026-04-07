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
            // ✅ Copia anche le directory e il loro contenuto
            continue // Le directory vengono gestite da Vite publicDir
          }
          
          // Copia tutti i file HTML (non solo dalla root)
          if (entry.endsWith('.html')) {
            copyFileSync(srcPath, destPath)
            console.log(`✅ Copied HTML: ${entry}`)
          }
          // Copy _headers file
          if (entry === '_headers') {
            copyFileSync(srcPath, destPath)
            console.log(`✅ Copied: ${entry} (cache control)`)
          }
          // Copy _routes.json file (Cloudflare Pages routing config)
          if (entry === '_routes.json') {
            copyFileSync(srcPath, destPath)
            console.log(`✅ Copied: ${entry} (Cloudflare Pages routing)`)
          }
        }
      }
      
      copyRecursive(publicDir, distDir)
    }
  }
}

// Plugin per generare _worker.js.metadata.json con il binding D1 corretto
// CF_PAGES_BRANCH è iniettato automaticamente da Cloudflare Pages durante la build
function generateWorkerMetadataPlugin() {
  return {
    name: 'generate-worker-metadata',
    closeBundle() {
      const branch = process.env.CF_PAGES_BRANCH
      const distDir = join(process.cwd(), 'dist')

      let bindings: Array<{ type: string; name: string; id: string }> = []

      if (branch === 'main') {
        // Build di produzione
        bindings = [{ type: 'd1', name: 'DB', id: 'e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f' }]
      } else if (branch) {
        // Build di preview (qualsiasi branch non-main)
        bindings = [{ type: 'd1', name: 'DB', id: '128fb147-b114-42d9-8c4d-500d70b8cb43' }]
      }
      // Se CF_PAGES_BRANCH non è impostato (sviluppo locale) → bindings vuoti,
      // i binding vengono iniettati dal dashboard di Cloudflare

      const metadata = { main_module: '_worker.js', bindings }
      writeFileSync(join(distDir, '_worker.js.metadata.json'), JSON.stringify(metadata, null, 2))
      console.log(`✅ Worker metadata: branch=${branch || 'local'}, bindings=${bindings.length}`)
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
    injectVersionPlugin(),   // CRITICAL: Anti-cache V11 rollback
    generateWorkerMetadataPlugin()  // Correct D1 binding per environment
  ],
  // Copia file statici da public/ nella build
  publicDir: 'public',
  build: {
    rollupOptions: {
      output: {
        // Mantieni file statici nella root
        assetFileNames: (assetInfo) => {
          // ✅ FIX: Mantieni struttura directory originale per PDF
          // NON forzare tutti i PDF in /brochures/
          // Lascia che Vite mantenga la struttura di public/
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  }
})
