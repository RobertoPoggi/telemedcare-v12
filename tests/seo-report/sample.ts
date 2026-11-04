// Genera l'HTML del report di ESEMPIO (dati SINTETICI della fixture) per il PDF di dimostrazione.
// Uso: npx esbuild tests/seo-report/sample.ts --bundle --platform=node --format=esm --outfile=/tmp/seo-sample.mjs && node /tmp/seo-sample.mjs out.html
import { generateReport } from '../../src/modules/seo-report-render'
import { makeFixture } from './fixture'
import { writeFileSync } from 'node:fs'
const input = makeFixture({ now: '2026-11-04T10:05:30Z', start: '2026-08-09', req_end: '2026-11-04' })
input.sampleNote = 'ESEMPIO con dati SINTETICI generati da fixture di test — NON sono dati reali eCura. Serve a mostrare layout, controlli e quadrature.'
const g = generateReport(input)
writeFileSync(process.argv[2] || '/tmp/report-sample.html', g.html)
console.log('ok', g.hardFailed ? 'HARD-FAIL' : 'no-hard-fail')
