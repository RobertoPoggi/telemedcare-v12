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

// Plugin per correggere i backtick escapati nei template HTML dentro _worker.js
// Problema: esbuild compila \` (TS) come \\` nel JS output.
// Nel browser, \\` dentro uno <script> = backslash letterale + apre nuovo template → SyntaxError.
// Fix: dentro le sezioni HTML (FUORI dai <script> blocks), converte \\` → \`
// I blocchi <script> contengono JS legittimo con template literals → NON toccare.
function fixWorkerBackticksPlugin() {
  return {
    name: 'fix-worker-backticks',
    closeBundle() {
      const workerFile = join(process.cwd(), 'dist', '_worker.js')
      if (!existsSync(workerFile)) return

      let content = readFileSync(workerFile, 'utf8')
      let fixed = content
      let fixCount = 0
      let searchFrom = 0

      // Each HTML page is a JS template literal starting with `<!DOCTYPE html>
      // We process each one, skipping <script>...</script> blocks inside it.
      while (true) {
        const htmlStart = fixed.indexOf('`<!DOCTYPE html>', searchFrom)
        if (htmlStart < 0) break

        // Scan for the matching OUTER closing backtick.
        // Skip \X sequences (\\n, \\`, etc.) — they are escape sequences, not real backticks.
        let pos = htmlStart + 1
        let templateEnd = -1
        while (pos < fixed.length) {
          const ch = fixed[pos]
          if (ch === '\\') { pos += 2; continue }
          if (ch === '`') { templateEnd = pos; break }
          pos++
        }
        if (templateEnd < 0) break

        // Get the HTML content between the outer backticks
        const htmlSection = fixed.slice(htmlStart + 1, templateEnd)

        // ESCAPED_BT = the two chars \` (backslash + backtick) as they appear in the JS file
        // PLAIN_BT   = single backtick ` (the correct escaped-backtick inside a JS template literal)
        const ESCAPED_BT = '\\\`'
        const PLAIN_BT = '\`'

        // Process htmlSection segment by segment, skipping <script>...</script> blocks
        let fixedSection = ''
        let sectionChanges = 0
        let sPos = 0

        while (sPos < htmlSection.length) {
          // Find next <script opening
          const scriptOpenIdx = htmlSection.toLowerCase().indexOf('<script', sPos)

          if (scriptOpenIdx === -1) {
            // No more script tags: fix everything remaining
            const rest = htmlSection.slice(sPos)
            sectionChanges += (rest.split(ESCAPED_BT).length - 1)
            fixedSection += rest.split(ESCAPED_BT).join(PLAIN_BT)
            break
          }

          // Fix the HTML portion before this <script>
          const htmlPart = htmlSection.slice(sPos, scriptOpenIdx)
          sectionChanges += (htmlPart.split(ESCAPED_BT).length - 1)
          fixedSection += htmlPart.split(ESCAPED_BT).join(PLAIN_BT)

          // Find the matching </script>
          const scriptCloseIdx = htmlSection.toLowerCase().indexOf('</script>', scriptOpenIdx)
          if (scriptCloseIdx === -1) {
            // No closing </script>: leave the rest untouched
            fixedSection += htmlSection.slice(scriptOpenIdx)
            sPos = htmlSection.length
            break
          }

          // Append the <script>...</script> block UNCHANGED (it contains valid JS)
          const scriptEnd = scriptCloseIdx + '</script>'.length
          fixedSection += htmlSection.slice(scriptOpenIdx, scriptEnd)
          sPos = scriptEnd
        }

        if (sectionChanges > 0) {
          fixed = fixed.slice(0, htmlStart + 1) + fixedSection + fixed.slice(templateEnd)
          fixCount += sectionChanges
          templateEnd = htmlStart + 1 + fixedSection.length
        }
        searchFrom = templateEnd + 1
      }

      if (fixCount > 0) {
        writeFileSync(workerFile, fixed)
        console.log('✅ Fixed ' + fixCount + ' escaped backticks in _worker.js HTML templates (script blocks preserved)')
      } else {
        console.log('ℹ️  No escaped backtick issues found in _worker.js')
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
    generateWorkerMetadataPlugin(),  // Correct D1 binding per environment
    fixWorkerBackticksPlugin()  // Fix \\` → \` in HTML template literals
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
