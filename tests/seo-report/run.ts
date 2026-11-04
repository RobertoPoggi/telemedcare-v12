// Test del report: esegue le quadrature sulla fixture e verifica che i difetti iniettati facciano FALLIRE la build.
// Uso: npx esbuild tests/seo-report/run.ts --bundle --platform=node --format=esm --outfile=/tmp/seo-report-test.mjs && node /tmp/seo-report-test.mjs [--pdf out.html]
import { generateReport } from '../../src/modules/seo-report-render'
import { ReportAssertionError, PctRegistry, checkPercentages, computeWindows, PARAMS, buildModel, runChecks, hardFailures } from '../../src/modules/seo-report-engine'
import { makeFixture } from './fixture'
import { writeFileSync } from 'node:fs'

let fails = 0
const ok = (c: boolean, msg: string) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${msg}`); if (!c) fails++ }
const expectThrow = (label: string, f: () => any, idMatch: RegExp) => {
  try { f(); ok(false, `${label}: doveva fallire (assert hard) ma il report è stato generato`) }
  catch (e: any) { ok(e instanceof ReportAssertionError && idMatch.test(e.message), `${label}: build fallita come atteso → ${String(e.message).slice(0, 140)}`) }
}

// 1) caso sano
const g = generateReport(makeFixture())
const m = g.model
ok(!g.hardFailed, 'fixture sana: nessun assert hard fallito')
const macroSum = Object.values(m.macro).reduce((a, b) => a + b, 0)
const smSum = m.smTable.reduce((s, r) => s + r.sessions, 0)
const dailySum = m.dailyTotal.reduce((a, b) => a + b, 0)
ok(macroSum === m.total && smSum === m.total && dailySum === m.total, `quadratura: canali ${macroSum} = source/medium ${smSum} = serie ${dailySum} = KPI ${m.total}`)
ok(m.win.ga4End === '2026-11-02' && m.win.gscEnd === '2026-11-01', `finestre: GA4 fino a ${m.win.ga4End}, GSC fino a ${m.win.gscEnd}`)
ok(m.dates[m.dates.length - 1] === '2026-11-02', 'nessuna data oltre oggi−2 nelle serie GA4')
ok(m.excludedRows.count > 0, `righe GA4 non consolidate scartate: ${m.excludedRows.count} (${m.excludedRows.sessions} sessioni)`)
ok(m.gsc!.maxDailyDate! <= '2026-11-01', `GSC ultimo giorno incluso ${m.gsc!.maxDailyDate}`)
ok(Math.abs(m.gsc!.clicksPerDay - m.gsc!.clicks / m.gscDays) < 1e-9 && m.gscDays === 85, `click/giorno = click/${m.gscDays} giorni = ${m.gsc!.clicksPerDay.toFixed(2)}`)
ok(!/CTR[^<]{0,40}9,8%/.test(g.html), 'nessun CTR hardcoded 9,8%')
ok(!/media industria/i.test(g.html), 'nessun confronto con "media industria"')
ok(!/brand recall/i.test(g.html.replace(/Il Direct non è una prova di «brand recall»/, '')), 'nessun "segnale positivo di brand recall"')
ok(!/inesistente prima/i.test(g.html), 'nessuna affermazione causale GEO senza baseline')
ok(/4 su 7 \(57%\) dei contratti inviati proviene da lead caldi o tiepidi/.test(g.html.replace(/<[^>]+>/g, '')), 'frase CRM generata dal calcolo: "4 su 7 (57%)"')
ok(!/100% dei CONTRACT_SENT/.test(g.html), 'nessun "100% dei CONTRACT_SENT"')
ok(!/conversion quality nettamente superiore/i.test(g.html), 'nessun giudizio di qualità per canale')
ok(/Serie storica insufficiente per attribuire l'incremento alle ottimizzazioni GEO/.test(g.html), 'GEO: dichiarata serie storica insufficiente')
ok(/Rapporto sessioni Google organic \(GA4\) \/ click GSC/.test(g.html) && /Quota Direct/.test(g.html) && /Lead con fonte valorizzata/.test(g.html), 'sezione Qualità del dato presente con le righe richieste')
ok(g.pct.ok, `percentuali coerenti (${g.pct.total} registrate, ${g.pct.textClaims} nel testo)`)
ok(!/class="banner"/.test(g.html) || g.checks.some(c => c.status === 'fail'), 'banner anomalie solo se un controllo è rosso')

// 2) difetti iniettati → la build DEVE fallire
expectThrow('H1 quadratura: riga GA4 con sessioni non numeriche (perdita di sessioni nelle aggregazioni)', () => {
  const bad = makeFixture(); (bad.ga4.baseRows as any).push({ date: '2026-09-10', channelGrouping: 'x', source: 'x', medium: 'x', sessions: NaN })
  generateReport(bad)
}, /H1/)
expectThrow('H2 serie giornaliera ≠ KPI (righe con data malformata: nel KPI, non nella serie)', () => {
  const bad = makeFixture(); const e = makeFixture().ga4.baseRows![0]
  ;(bad.ga4.baseRows as any).push({ ...e, date: '2026-09-xx', sessions: 40 }); generateReport(bad)
}, /H2/)
// H3 reale: la finestra scarta le righe oltre il cutoff; qui verifichiamo sia lo scarto sia che il CONTROLLO blocchi un giorno non consolidato entrato nel modello.
{
  const bad = makeFixture(); bad.gsc!.daily.push({ date: '2026-11-03', clicks: 5, impressions: 50 })
  const r = generateReport(bad)
  ok(r.model.gsc!.excludedRows >= 1 && r.model.gsc!.maxDailyDate! <= '2026-11-01', `H3: riga GSC del 03/11 scartata (excludedRows=${r.model.gsc!.excludedRows}), ultimo giorno incluso ${r.model.gsc!.maxDailyDate}`)
  const mm = buildModel(makeFixture()); mm.dates.push('2026-11-03'); mm.dailyTotal.push(1)
  const chk = runChecks(mm, new PctRegistry()).find(c => c.id === 'H3')!
  ok(chk.status === 'fail' && !!chk.hard, `H3: giorno 03/11 forzato nel modello → controllo hard FALLISCE (${chk.value.slice(0, 80)})`)
  expectThrow('H3 giorno non consolidato negli aggregati', () => { if (hardFailures([chk]).length) throw new ReportAssertionError(hardFailures([chk])) }, /H3/)
}
expectThrow('H6 percentuale hardcoded nel testo', () => {
  const R = new PctRegistry(); R.P(4, 7, 0, 'text')
  const r = checkPercentages('<p>100% dei CONTRACT_SENT</p><p>57%</p>', R)
  if (!r.ok) throw new ReportAssertionError([{ id: 'H6', label: 'pct', status: 'fail', value: r.problems.join('; '), hard: true }])
}, /H6/)

// 3) lag: giorno corrente escluso anche con endDate futura/oggi
const w = computeWindows(new Date('2026-11-04T10:05:30Z'), '2026-08-09', '2026-11-04')
ok(w.ga4End === '2026-11-02' && w.gscEnd === '2026-11-01' && w.commonEnd === '2026-11-01', `computeWindows: ga4 ${w.ga4End}, gsc ${w.gscEnd}, comune ${w.commonEnd}`)
ok(PARAMS.ga4LagDays === 2 && PARAMS.gscLagDays === 3, 'parametri lag = 2 / 3 giorni')

// 4) Se un dato manca → "dato non disponibile" e non stime
const g2 = generateReport(makeFixture({ mutate: i => { i.gsc = null; i.crm = null; i.crmError = 'database non collegato'; i.ga4.monthly = null; i.ga4.directLanding = null } }))
ok(/dato non disponibile/.test(g2.html), 'GSC/CRM/serie mancanti → "dato non disponibile"')

// 5) CRM senza fonte → niente qualità per canale
const g3 = generateReport(makeFixture({ mutate: i => { i.crm!.rows.forEach(r => (r.canale = '')) } }))
ok(/il CRM non espone la fonte del lead/i.test(g3.html.replace(/<[^>]+>/g, '')), 'CRM senza fonte → dichiarata non misurabile')

const idx = process.argv.indexOf('--html'); if (idx > 0) { writeFileSync(process.argv[idx + 1], g.html); console.log('html →', process.argv[idx + 1]) }
console.log('\nQUALITÀ DEL DATO (fixture sana)')
for (const c of g.checks) console.log(` [${c.status.toUpperCase().padEnd(4)}]${c.hard ? ' (hard)' : '       '} ${c.label}: ${c.value}`)
console.log(` [${g.pct.ok ? 'OK  ' : 'FAIL'}] (hard) Coerenza percentuali testo vs tabelle: ${g.pct.total} registrate, ${g.pct.textClaims} nel testo`)
console.log(fails ? `\n${fails} TEST FALLITI` : '\nTUTTI I TEST OK')
process.exit(fails ? 1 : 0)
