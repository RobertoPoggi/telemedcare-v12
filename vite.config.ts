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
// Problema: esbuild compila \` dentro template literal TS come \\` nel JS output,
// ma le template literal HTML nel worker devono contenere \` (singolo) non \\`.
// Fix: dentro le stringhe HTML (template literal del worker), \\` → \`
function fixWorkerBackticksPlugin() {
  return {
    name: 'fix-worker-backticks',
    closeBundle() {
      const workerFile = join(process.cwd(), 'dist', '_worker.js')
      if (!existsSync(workerFile)) return

      let content = readFileSync(workerFile, 'utf8')
      const originalLen = content.length

      // Le template HTML nel worker sono contenute in template literal JS (backtick).
      // Dentro di esse, esbuild ha trasformato \` (TS escape) in \\` (doppio).
      // Ma il browser esegue il contenuto come JS e trova \\` = backslash letterale + backtick.
      // Fix: replace \\` → \` SOLO dentro le sezioni HTML template (non nel codice worker).
      // Strategia: il contenuto HTML è dentro grandi template literal del worker.
      // I template literal HTML iniziano con <!DOCTYPE html> e sono delimitati da backtick.
      // Facciamo un replace globale di \\\\` → \\` (che nel file = \\` → \`)
      // ma solo nelle sezioni HTML identificate da <!DOCTYPE html>.
      
      // Approccio: trova ogni template literal HTML nel worker e fix i backtick interni
      let fixed = content
      let fixCount = 0

      // Pattern: inside template literal (between ` chars), \\` should be \`
      // We target specifically the HTML templates that contain <!DOCTYPE
      // Strategy: split on the HTML template boundaries and fix each one
      
      // Simpler approach: replace all \\\\` that are inside HTML content
      // The HTML templates are large strings containing HTML tags
      // We can identify them by looking for \\\\` followed by common HTML patterns
      // OR: simply replace \\\\` with \\` everywhere in the worker EXCEPT in actual JS code
      
      // Safest approach: find the template literal sections (large HTML blocks)
      // They all start with `<!DOCTYPE html> and end with the matching backtick
      
      // Strategy: inside the HTML template literal sections (which start with `<!DOCTYPE html>),
      // esbuild has encoded \` (escaped backtick in TS) as \\` (backslash + backtick in JS output).
      // Inside a JS template literal, \` is a valid escape for a literal backtick.
      // But \\` means: literal backslash char followed by start of a new template literal → WRONG.
      // Fix: within the HTML template sections only, replace \\` with \`.
      // (In the JS file as text: the sequence is \ + ` i.e. two chars 0x5c 0x60)

      let searchFrom = 0
      while (true) {
        const htmlStart = fixed.indexOf('`<!DOCTYPE html>', searchFrom)
        if (htmlStart < 0) break

        // Find the matching closing backtick by scanning forward
        // \` inside the template is an escaped backtick (not the end), so skip those
        let pos = htmlStart + 1
        let templateEnd = -1
        while (pos < fixed.length) {
          const ch = fixed[pos]
          if (ch === '\\') {
            pos += 2 // skip the escaped character (\\n, \\`, etc.)
            continue
          }
          if (ch === '`') {
            templateEnd = pos
            break
          }
          pos++
        }

        if (templateEnd < 0) break

        // Extract the HTML template section (between the backticks)
        const htmlSection = fixed.slice(htmlStart + 1, templateEnd)

        // In the HTML section, \` (0x5c 0x60) should be just ` (0x60)
        // because inside HTML content (which is put into the DOM), a backslash before
        // a backtick is meaningless and causes the JS parser to misinterpret the HTML script.
        // The JS template literal that WRAPS the HTML uses ` as delimiter;
        // inside it, \` means literal backtick character.
        // When the HTML is set as innerHTML/document, the browser parses it as HTML+JS.
        // In that JS context, \\` (the two chars: backslash + backtick) is INVALID
        // because the browser sees a JS template literal with \\` = literal backslash + start of template.
        // Solution: strip the backslash → just ` in the HTML output.
        
        // Replace: \\` → ` inside HTML section (strip the backslash escape)
        const ESCAPED_BT = '\\\`'   // the two chars: \ + `
        const PLAIN_BT = '\`'       // just: `
        
        const fixedSection = htmlSection.split(ESCAPED_BT).join(PLAIN_BT)
        const changes = htmlSection.split(ESCAPED_BT).length - 1

        if (changes > 0) {
          fixed = fixed.slice(0, htmlStart + 1) + fixedSection + fixed.slice(templateEnd)
          fixCount += changes
          // Adjust next search position after replacement (section is shorter by `changes` chars)
          templateEnd = htmlStart + 1 + fixedSection.length
        }

        searchFrom = templateEnd + 1
      }

      if (fixCount > 0) {
        writeFileSync(workerFile, fixed)
        console.log('✅ Fixed ' + fixCount + ' escaped backticks in _worker.js HTML templates')
      } else {
        console.log(`ℹ️  No escaped backtick issues found in _worker.js`)
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
