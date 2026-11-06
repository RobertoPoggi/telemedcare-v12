// Rigenera tests/fixtures/report-*.json dalla fixture parametrica (dati SINTETICI, non reali).
// Uso: npm run fixtures:report   (i JSON sono congelati nel repo: il test li confronta con questa generazione per rilevare derive)
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { makeFixture, type FixtureOpts } from './fixture'

export interface FixtureDef { name: string; description: string; opts: FixtureOpts; expected: { errors: string[]; anomalies: string[]; midnight: number; tailDays: number } }

export const FIXTURES: FixtureDef[] = [
  { name: 'report-sane', description: 'Caso sano: nessun errore, nessuna anomalia. 7 sessioni a cavallo della mezzanotte (attese).', opts: {}, expected: { errors: [], anomalies: [], midnight: 7, tailDays: 0 } },
  { name: 'report-consolidating', description: 'Organico degli ultimi 3 giorni incompleto (GA4 non consolidato): coda esclusa da aggregati e trend.', opts: { tailOrganic: 0.2 }, expected: { errors: [], anomalies: [], midnight: 7, tailDays: 3 } },
  { name: 'report-organic-over-clicks', description: 'Una settimana con organico GA4 > click GSC × 1,05: marcata non affidabile ed esclusa dal rapporto medio.', opts: { gaOrganicBoost: [{ week: '2026-09-14', factor: 3 }] }, expected: { errors: [], anomalies: ['ratiomax'], midnight: 7, tailDays: 0 } },
  { name: 'report-ratio-rupture', description: 'Una settimana con rapporto crollato (rottura rispetto alla mediana delle precedenti): anomalia.', opts: { gaOrganicBoost: [{ week: '2026-10-12', factor: 0.4 }] }, expected: { errors: [], anomalies: ['ratio'], midnight: 7, tailDays: 0 } },
  { name: 'report-midnight-wide', description: 'Scarto serie datata − totale oltre la tolleranza della sola mezzanotte: errore bloccante.', opts: { midnight: 45 }, expected: { errors: ['H2'], anomalies: [], midnight: 45, tailDays: 0 } },
  { name: 'report-device-mismatch', description: 'Totale device ≠ totale oltre la tolleranza di aggregazione (max(2 sessioni, 0,2%)): anomalia.', opts: { mutate: i => { i.ga4.devices![0].sessions += 12 } }, expected: { errors: [], anomalies: ['dev'], midnight: 7, tailDays: 0 } },
]

export const fixtureJson = (d: FixtureDef) => JSON.stringify({ name: d.name, description: d.description, synthetic: true, expected: d.expected, input: makeFixture(d.opts) }, null, 1) + '\n'

export function writeFixtures() {
  const dir = join(process.cwd(), 'tests', 'fixtures'); mkdirSync(dir, { recursive: true })
  for (const d of FIXTURES) { writeFileSync(join(dir, d.name + '.json'), fixtureJson(d)); console.log('scritto tests/fixtures/' + d.name + '.json') }
}
