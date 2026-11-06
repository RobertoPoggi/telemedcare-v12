#!/usr/bin/env node
// npm run test:report — regressione del generatore "Report Analytics Live" (fixture congelate, quadrature, mutazioni).
// Exit code != 0 se un assert non passa -> il build fallisce.
const { execFileSync } = require('child_process')
const path = require('path')
const os = require('os')
const out = path.join(os.tmpdir(), 'seo-report-test.mjs')
try {
  require('esbuild').buildSync({
    entryPoints: ['tests/seo-report/run.ts'], bundle: true, platform: 'node', format: 'esm', target: 'node18',
    outfile: out, logLevel: 'error',
  })
  execFileSync(process.execPath, [out, ...process.argv.slice(2)], { stdio: 'inherit' })
} catch (e) {
  console.error('❌ test:report FALLITO')
  process.exit(1)
}
