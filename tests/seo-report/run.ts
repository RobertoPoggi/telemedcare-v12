// npm run test:report — regressione del generatore "Report Analytics Live".
// Genera l'HTML dalle fixture congelate in tests/fixtures/report-*.json (dati SINTETICI con totali noti) e verifica:
// quadrature (canali = source/medium = totale; serie = totale + N dichiarato), device = totale, CTR ricalcolabile,
// percentuali del testo = percentuali delle tabelle, livelli (errore / anomalia / avviso), dateRanges delle query,
// tabella lead, assenza di percentuali e divisori letterali nel generatore e MUTAZIONI che devono far fallire il test.
// Exit code != 0 se un'asserzione fallisce → `npm run build` si ferma e il deploy non parte.
// Uso: node scripts/test-seo-report.cjs [--write-fixtures] [--html out.html]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateReport, reportBanner, reducedWindowNote } from '../../src/modules/seo-report-render'
import { collectReportInput } from '../../src/modules/seo-report-data'
import { ReportAssertionError, addDays, PctRegistry, checkPercentages, PARAMS, GEO_ACTIVATION, mapCrmChannel, CRM_UNSET, type ReportInput } from '../../src/modules/seo-report-engine'
import { makeFixture } from './fixture'
import { FIXTURES, fixtureJson, writeFixtures } from './gen-fixtures'

if (process.argv.includes('--write-fixtures')) { writeFixtures(); process.exit(0) }

let fails = 0, passes = 0
const ok = (c: boolean, msg: string) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${msg}`); c ? passes++ : fails++ }
const section = (t: string) => console.log(`\n── ${t}`)
const ids = (xs: { id: string }[]) => xs.map(x => x.id).sort().join(',') || '—'
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ')
const throwsWith = (f: () => any, idRe: RegExp): string | null => {
  try { f(); return null } catch (e: any) { return e instanceof ReportAssertionError && idRe.test(e.message) ? String(e.message).slice(0, 150) : `eccezione diversa: ${String(e?.message).slice(0, 100)}` }
}
const mustFail = (label: string, mutate: (i: ReportInput) => void, idRe: RegExp) => {
  const r = throwsWith(() => generateReport(makeFixture({ mutate })), idRe)
  ok(r != null && !r.startsWith('eccezione'), `MUTAZIONE «${label}» → il report NON si genera (${r ?? 'ma è stato generato!'})`)
}

// ── 0) Fixture congelate ──────────────────────────────────────────────────────
section('0. Fixture tests/fixtures/report-*.json')
const dir = join(process.cwd(), 'tests', 'fixtures')
const files = readdirSync(dir).filter(f => /^report-.*\.json$/.test(f))
ok(files.length === FIXTURES.length, `${files.length} fixture JSON presenti (attese ${FIXTURES.length})`)
const loaded = new Map<string, { expected: any; input: ReportInput }>()
for (const d of FIXTURES) {
  let raw = ''
  try { raw = readFileSync(join(dir, d.name + '.json'), 'utf8') } catch { /* manca */ }
  ok(raw === fixtureJson(d), `${d.name}.json coincide con la generazione deterministica (npm run fixtures:report per rigenerarla)`)
  if (raw) { const j = JSON.parse(raw); j.input.now = new Date(j.input.now); loaded.set(d.name, j) }
}

// ── 1) Caso sano ─────────────────────────────────────────────────────────────
section('1. Caso sano (report-sane)')
const sane = loaded.get('report-sane')!
const g = generateReport(sane.input)
const m = g.model, h = g.html, ht = text(h)
const macroSum = Object.values(m.macro).reduce((a, b) => a + b, 0)
const smSum = m.smTable.reduce((s, r) => s + r.sessions, 0)
const natSum = m.nativeChannels.reduce((s, [, v]) => s + v, 0)
const dailySum = m.dailyTotal.slice(0, m.aggCount).reduce((a, b) => a + b, 0)
const N = dailySum - m.total
ok(m.total === sane.input.ga4.control!.sessions && m.totalSource === 'control', `totale = query senza dimensioni = ${m.total} (fonte: ${m.totalSource})`)
ok(macroSum === m.total, `somma macro-canali ${macroSum} = totale ${m.total}`)
ok(smSum === m.total, `somma source/medium ${smSum} = totale ${m.total}`)
ok(natSum === m.total, `somma canali GA4 nativi ${natSum} = totale ${m.total}`)
ok(N === sane.expected.midnight && m.midnight === N, `serie giornaliera ${dailySum} = totale ${m.total} + sessioni a cavallo della mezzanotte ${N} (dichiarate)`)
ok(N >= 0 && N / m.total <= PARAMS.tolerance, `N entro la tolleranza della sola mezzanotte (${N} ≤ ${(PARAMS.tolerance * m.total).toFixed(1)})`)
ok(/Sessioni a cavallo della mezzanotte/.test(ht) && /atteso, non è un errore/.test(ht), 'riga «Sessioni a cavallo della mezzanotte … atteso, non è un errore» valorizzata')
ok(new RegExp(`${N} = somma serie giornaliera`).test(ht), `la riga riporta N = ${N} con la differenza esplicita`)
ok(sane.input.ga4.devices!.reduce((s, d) => s + d.sessions, 0) === m.total, 'totale device = totale sul caso sano')
ok(g.checks.find(c => c.id === 'dev')!.level === 'ok', 'controllo device: ok')
ok(m.gsc != null && Math.abs(m.gsc.ctr - m.gsc.clicks / m.gsc.impressions) < 1e-12 && g.checks.find(c => c.id === 'ctr')!.level === 'ok', 'CTR di sito ricalcolabile = click / impressioni')
ok(g.pct.ok && g.pct.textClaims > 0, `percentuali del testo = percentuali delle tabelle (${g.pct.total} registrate, ${g.pct.textClaims} citate nel testo)`)
ok(g.errors.length === 0 && g.anomalies.length === 0, `nessun errore bloccante, nessuna anomalia (${ids(g.errors)} / ${ids(g.anomalies)})`)
ok(!/class="banner/.test(h), 'P7: nessun errore e nessuna anomalia → nessun banner (solo avvisi di metodo nelle righe di tabella)')
ok(g.checks.filter(c => c.level === 'notice').map(c => c.id).sort().join(',') === 'aicrm,direct,geo,sample', `avvisi 🟡 motivati: ${g.checks.filter(c => c.level === 'notice').map(c => c.id).sort().join(', ')}`)
ok(m.win.start === '2026-08-09' && m.win.aggEnd === '2026-10-31' && m.win.gscEnd === '2026-11-01', `finestre: GA4 ${m.win.start} → ${m.win.aggEnd} (lag ${PARAMS.ga4LagDays}), GSC → ${m.win.gscEnd}`)
ok(PARAMS.ga4LagDays === 4, 'GA4_LAG_DAYS = 4')

// A3: trend solo su MA28, MA7 senza verdetto
ok(/MA28 ultimo giorno consolidato/.test(ht) && /Verdetto \(solo MA28\)/.test(ht), 'verdetto del trend solo su MA28')
ok(/indicatore di breve, nessun giudizio/.test(ht), 'MA7 mostrata come indicatore di breve, senza verdetto')
ok(m.trend.every(t => t.endDate <= m.dates[m.aggCount - 1]), 'le MA terminano nell’ultimo giorno consolidato')

// A4/A5: rapporto settimanale
ok(m.weeks.filter(w => w.full).every(w => w.state === 'ok') && m.ratio.unreliable.length === 0 && m.ratio.anomalous === 0, `tutte le ${m.ratio.fullCount} settimane complete sono regolari (ratio ≤ ${PARAMS.ratioMax})`)
ok(m.ratio.median != null && /mediana/.test(ht) && /settimane distanti dalla mediana/.test(ht), 'mediana del periodo e numero di settimane distanti dalla mediana mostrati')
{
  // A5: nessuna fascia assoluta 75–90 come allarme: nel generatore non esistono soglie 0,75 / 0,90 sul rapporto
  const eng = readFileSync(join(process.cwd(), 'src', 'modules', 'seo-report-engine.ts'), 'utf8').split('\n').filter(l => !/^\s*(\/\/|\*)/.test(l)).join('\n')
  ok(!/\b0?\.(75|9)0?\b/.test(eng.replace(/ratioBand\w+|PARAMS\.\w+/g, '')) && !/75\s*[–-]\s*90/.test(readFileSync(join(process.cwd(), 'src', 'modules', 'seo-report-render.ts'), 'utf8')), 'nessuna fascia assoluta 75–90 come allarme (solo rotture)')
}
ok(/Perché GA4 e Search Console non coincidono/.test(ht) && /fusi orari/.test(ht) && /Consent Mode/.test(ht) && /override manuale/.test(ht) && /stesso click/.test(ht), 'testo «Perché GA4 e Search Console non coincidono» con le 4 cause del rapporto > 100%')

// A2: serie mensile con intervallo proprio
ok(m.geo != null && m.geo.monthsQueried === PARAMS.geoMonths && /12 mesi coperti, ultimo parziale/.test(ht) && /\(12 mesi\)/.test(ht), `serie mensile AI/GEO: ${m.geo?.monthsQueried} mesi interrogati, etichetta «12 mesi coperti, ultimo parziale»`)
ok(m.geo != null && m.geo.range.start === '2025-11-01' && m.geo.range.end === m.win.aggEnd, `intervallo proprio ${m.geo?.range.start} → ${m.geo?.range.end} (primo del mese di oggi−11 mesi → fine report)`)
ok(/serie disponibile da 2026-08/.test(ht) && /serie insufficiente per attribuzione/.test(ht), '«serie disponibile da X» distinta da «serie insufficiente per attribuzione»')
ok(GEO_ACTIVATION.date === '2026-08-06' && GEO_ACTIVATION.commit === '19c1b6c' && sane.input.geoActivation.date === GEO_ACTIVATION.date, 'data di attivazione GEO = costante unica 2026-08-06 (commit 19c1b6c)')

// B: tabella lead
const crm = m.crm!
const leadRowsSum = Object.values(crm.byCanale).reduce((s, r) => s + r.total, 0)
ok(leadRowsSum === crm.total && crm.rowsSum === crm.total && crm.total === 67, `tabella fonte lead: somma righe ${leadRowsSum} = lead totali ${crm.total}`)
ok(crm.byCanale[CRM_UNSET]?.total === 11 && /non valorizzata/.test(ht), 'riga «non valorizzata» = 11 lead su 67 senza fonte')
ok(Object.keys(crm.byCanale).every(k => new RegExp(`<td><strong>${k === CRM_UNSET ? 'non valorizzata' : k}</strong>`).test(h)), 'una riga per ogni valore CRM presente')
ok(/<td><strong>AI<\/strong>/.test(h) && /I lead da assistenti AI non sono distinguibili: il canale non è emesso dal form\. Da implementare in ecura-landing\./.test(ht), 'riga AI predisposta + nota «non emesso dal form. Da implementare in ecura-landing»')
const mapOk = (c: string, d: string, ga: string[]) => JSON.stringify(mapCrmChannel(c, d).ga) === JSON.stringify(ga)
ok(mapOk('GOOGLE', 'google_organico', ['SEO']) && mapOk('GOOGLE', 'google_ads', ['Paid']) && mapOk('ORGANICO', '', ['SEO']) && mapOk('DIRETTO', '', ['Direct']) && mapOk('META', '', ['Paid', 'Social']) && mapOk('EMAIL', '', ['Altro']) && mapOk('REFERRAL', '', ['Altro']) && mapOk('ALTRO', '', ['Altro']) && mapOk('AI', '', ['AI']), 'mappatura CRM → GA4 (B1) come da specifica')
ok(/non univoco — denominatori candidati: SEO: \d/.test(ht), 'mappatura non univoca: mostra i denominatori GA4 candidati (non «non attribuibile»)')
ok(!/non attribuibile/i.test(ht), 'nessun «non attribuibile»')
const rowsHtml = [...h.matchAll(/<tr><td><strong>([^<]+)<\/strong>[\s\S]*?<\/tr>/g)].filter(x => Object.keys(crm.byCanale).some(k => (k === CRM_UNSET ? 'non valorizzata' : k) === x[1]))
ok(rowsHtml.length >= Object.keys(crm.byCanale).length && rowsHtml.every(x => /numeratore \d+ lead|non calcolabile|denominatore a zero|canale non ancora emesso/.test(x[0])), 'ogni riga lead riporta numeratore/denominatore (o il motivo per cui non è calcolabile)')
ok(rowsHtml.filter(x => /campione &lt; 30 lead/.test(x[0])).length >= 1 && PARAMS.minChannelSample === 30, 'avviso «campione < 30 lead» sulle righe piccole')

// B4: definizioni
for (const [re, lab] of [[/Lead per 100 sessioni<\/strong> = lead attribuiti al canale ÷ sessioni GA4 dello stesso canale/, 'lead per 100 sessioni (numeratore, denominatore)'], [/Quota Direct<\/strong> = sessioni Direct ÷ sessioni totali/, 'quota Direct'], [/Rapporto organico<\/strong> = sessioni GA4 google \/ organic ÷ click GSC, su settimane complete/, 'rapporto organico (settimane complete)'], [/MA28<\/strong> = media dei 28 giorni[^.]*esclusi i giorni in consolidamento/, 'MA28 (esclusi i giorni in consolidamento)'], [/CTR delle top 15 query<\/strong> è un’altra grandezza/, 'CTR sito ≠ CTR top 15 query']] as [RegExp, string][]) ok(re.test(h.replace(/<\/?em>/g, '')), `definizione presente: ${lab}`)
ok((h.match(/CTR delle top 15 query|CTR di sito/g) || []).length >= 3, 'la distinzione CTR sito / CTR top 15 query è ripetuta dove compare il CTR')

// ── 2) Casi congelati: livelli ───────────────────────────────────────────────
section('2. Livelli: errore / anomalia / avviso')
for (const d of FIXTURES) {
  const f = loaded.get(d.name)!
  const diag = generateReport(f.input, { diagnostic: true })
  ok(ids(diag.errors) === (f.expected.errors.sort().join(',') || '—') && ids(diag.anomalies) === (f.expected.anomalies.sort().join(',') || '—'), `${d.name}: errori [${ids(diag.errors)}] anomalie [${ids(diag.anomalies)}] come atteso`)
  ok(diag.model.midnight === f.expected.midnight && diag.model.cons.tailDays === f.expected.tailDays, `${d.name}: sessioni a cavallo mezzanotte ${diag.model.midnight}, giorni in consolidamento ${diag.model.cons.tailDays}`)
  if (f.expected.errors.length) {
    const r = throwsWith(() => generateReport(f.input), new RegExp(f.expected.errors[0]))
    ok(r != null && !r.startsWith('eccezione'), `${d.name}: 🔴 PDF/report NON generato (${r})`)
    ok(/class="banner banner-err"/.test(diag.html), `${d.name}: banner rosso presente solo in modalità diagnostica`)
  } else {
    const gen = generateReport(f.input)
    ok(gen.html.length > 1000, `${d.name}: report generato`)
    ok(f.expected.anomalies.length ? /class="banner banner-anom"/.test(gen.html) && f.expected.anomalies.every((a: string) => new RegExp(`banner-anom[\\s\\S]*?</div>`).test(gen.html)) : !/class="banner banner-anom"/.test(gen.html), `${d.name}: ${f.expected.anomalies.length ? '🟠 banner arancione con elenco' : 'nessun banner arancione'}`)
    ok(!/class="banner banner-err"/.test(gen.html), `${d.name}: nessun banner rosso`)
  }
}

// A3: consolidamento
section('3. Consolidamento GA4 (A3)')
{
  const c = generateReport(loaded.get('report-consolidating')!.input), cm = c.model, ct = text(c.html)
  ok(cm.cons.tailDays === PARAMS.consolidationTailDays && cm.cons.ratio != null && cm.cons.ratio < PARAMS.consolidationMinShare, `rilevati ${cm.cons.tailDays} giorni in consolidamento: rapporto misurato ${(cm.cons.ratio! * 100).toFixed(1)} < soglia`)
  ok(cm.aggCount === cm.dates.length - cm.cons.tailDays && cm.win.aggEnd === cm.dates[cm.aggCount - 1], `coda esclusa dagli aggregati (aggEnd ${cm.win.aggEnd}, ${cm.aggCount} su ${cm.dates.length} giorni)`)
  ok(cm.cons.tailDates.every(d => d > cm.win.aggEnd) && cm.trend.every(t => t.endDate <= cm.win.aggEnd), 'coda esclusa dal trend (MA28/MA7 terminano nell’ultimo giorno consolidato)')
  ok(/borderDash/.test(c.html), 'coda tratteggiata nei grafici')
  const row = c.checks.find(x => x.id === 'cons')!
  ok(/IN CONSOLIDAMENTO/.test(row.value) && /\d+,\d% /.test(row.value) || /IN CONSOLIDAMENTO/.test(row.value) && /=\s*\d+,\d%/.test(row.value), `riga di controllo con il rapporto misurato: ${row.value.slice(0, 120)}…`)
  ok(/Ultimi 3 giorni in consolidamento/.test(ct), 'avviso di consolidamento visibile nel trend')
  const s = generateReport(sane.input).model
  ok(s.cons.tailDays === 0, 'nessun consolidamento sul caso sano')
}

// A4: settimane con organico > click × 1,05
section('4. Organico GA4 > click GSC (A4/A5)')
{
  const o = generateReport(loaded.get('report-organic-over-clicks')!.input), om = o.model, ot = text(o.html)
  const w = om.weeks.find(x => x.weekStart === '2026-09-14')!
  ok(w.state === 'unreliable' && w.ga4Org > (w.gscClicks as number) * PARAMS.ratioMax, `settimana ${w.weekStart}: organico ${w.ga4Org} > click ${w.gscClicks} × ${PARAMS.ratioMax} → non affidabile`)
  ok(/dato GA4 non affidabile/.test(ot), 'settimana marcata «dato GA4 non affidabile»')
  const allFull = om.weeks.filter(x => x.full)
  ok(om.ratio.sumGa === allFull.reduce((s, x) => s + x.ga4Org, 0) && om.ratio.sumGsc === allFull.reduce((s, x) => s + (x.gscClicks as number), 0) && om.ratio.unreliable.length === 1, 'P2: la settimana non affidabile resta nel rapporto del periodo (denominatore = click di TUTTE le settimane complete)')
  ok(!om.weeks.some(x => x.state === 'break' && x.weekStart === '2026-09-14'), 'una settimana non affidabile non è contata anche come rottura')
  const r = generateReport(loaded.get('report-ratio-rupture')!.input).model
  ok(r.ratio.breaks.some(x => x.weekStart === '2026-10-12') && r.weeks.find(x => x.weekStart === '2026-10-12')!.state === 'break', `rottura rilevata: sett. 2026-10-12 oltre ${PARAMS.ratioBreak} SOTTO la mediana delle precedenti`)
  ok(PARAMS.ratioBandRun === 3 && PARAMS.ratioBandLow === 0.6 && PARAMS.ratioBandHigh === 1.1 && PARAMS.ratioMax === 1.05, 'parametri A5: 3 settimane fuori 0,60–1,10; oltre 1,05 impossibile')
}

// P5: sanità del trend = distanza tra i due tassi di variazione
{
  const f = makeFixture({ mutate: i => { for (const r of i.ga4.baseRows!) if (r.source === 'google' && r.medium === 'organic' && r.date >= '2026-10-04') r.sessions = Math.max(0, Math.round(r.sessions * 0.15)) } })
  const gg = generateReport(f, { diagnostic: true }), sn = gg.model.trendSanity!
  const row = gg.checks.find(c => c.id === 'trendsanity')!
  ok(sn != null && sn.flagged && Math.abs(Math.abs(sn.ga4Rel - sn.gscRel) - sn.gap) < 1e-12 && sn.gap > PARAMS.trendGap && row.level === 'notice', `P5: distanza ${(sn.gap * 100).toFixed(1)} punti > ${PARAMS.trendGap * 100} → 🟡 informativo (non anomalia)`)
  ok(/GA4 e GSC descrivono andamenti diversi/.test(text(gg.html)) && /attribuzione GA4, non il traffico/.test(text(gg.html)) && /misura di riferimento/.test(text(gg.html)), 'P5: testo «GA4 e GSC descrivono andamenti diversi … il click GSC è la misura di riferimento» con entrambi i valori')
  ok(!gg.anomalies.some(a => a.id === 'trendsanity') && !gg.errors.some(a => a.id === 'trendsanity'), 'P5: la divergenza non è mai un’anomalia né un errore')
  // direzioni opposte (+24 / −3 = 27 punti) NON sono «nessuna divergenza»
  const opp = makeFixture({ mutate: i => { for (const d of i.gsc!.daily) if (d.date >= '2026-09-20') d.clicks = Math.round(d.clicks * 0.5) } })
  const oo = generateReport(opp, { diagnostic: true }), so = oo.model.trendSanity!
  ok(so.ga4Rel > 0 && so.gscRel < so.ga4Rel && so.gap > PARAMS.trendGap && oo.checks.find(c => c.id === 'trendsanity')!.level === 'notice' && !/andamenti coerenti/.test(oo.checks.find(c => c.id === 'trendsanity')!.value), `P5: GA4 ${(so.ga4Rel * 100).toFixed(0)}% vs GSC ${(so.gscRel * 100).toFixed(0)}% (direzioni opposte) → NON «nessuna divergenza»`)
  ok(generateReport(sane.input).checks.find(c => c.id === 'trendsanity')!.level === 'ok' && generateReport(sane.input).model.trendSanity!.gap <= PARAMS.trendGap, 'P5: caso sano (distanza ≤ 15 punti) → ✓ OK')
}

// ── Correzione mirata: i 9 punti ────────────────────────────────────────────
section('P1. Totale device vs totale: tolleranza di aggregazione')
{
  const T = m.total, tolRel = Math.max(PARAMS.deviceTolAbs, T * PARAMS.deviceTolRel)
  const devCheck = (delta: number) => { const r = generateReport(makeFixture({ mutate: i => { i.ga4.devices![0].sessions += delta } }), { diagnostic: true }); return r.checks.find(c => c.id === 'dev')! }
  for (const d of [0, 1, -1, PARAMS.deviceTolAbs, -PARAMS.deviceTolAbs]) ok(devCheck(d).level === 'ok', `Δ ${d >= 0 ? '+' : ''}${d} sessioni → ✓ OK`)
  ok(/entro ±/.test(devCheck(1).value) && /Δ \+1 \(entro ±/.test(devCheck(1).value), 'la tolleranza adottata è scritta accanto al valore (Δ +1 (entro ±…))')
  const over = Math.floor(tolRel) + 1
  ok(devCheck(over).level === 'anomaly' && devCheck(-over).level === 'anomaly', `Δ ±${over} sessioni (oltre la tolleranza ±${tolRel.toFixed(1)}) → 🟠 anomalia`)
  ok(PARAMS.deviceTolAbs === 2 && PARAMS.deviceTolRel === 0.002, 'tolleranza = la più permissiva tra ±2 sessioni e ±0,2%')
}

section('P2/P3. Rapporto organico su tutte le settimane complete; rotture = solo ribassi')
{
  const o = generateReport(loaded.get('report-organic-over-clicks')!.input), om = o.model
  const full = om.weeks.filter(x => x.full)
  ok(om.ratio.fullCount === full.length && om.ratio.sumGsc === full.reduce((s, x) => s + (x.gscClicks as number), 0), `denominatore = somma dei click GSC di tutte le ${full.length} settimane complete (fissato prima di vedere i dati)`)
  ok(om.ratio.median === [...full.map(x => x.ratio as number)].sort((a, b) => a - b)[Math.floor(full.length / 2)] || Math.abs((om.ratio.median as number) - (() => { const v = full.map(x => x.ratio as number).sort((a, b) => a - b); return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2 })()) < 1e-12, 'mediana calcolata su TUTTE le settimane complete')
  const row = o.checks.find(c => c.id === 'ratio')!
  ok(new RegExp(`${om.ratio.fullCount} settimane complete, di cui ${om.ratio.anomalous} con attribuzione GA4 anomala`).test(row.value), `accanto al valore: «${om.ratio.fullCount} settimane complete, di cui ${om.ratio.anomalous} con attribuzione GA4 anomala»`)
  ok(new RegExp(`${om.ratio.fullCount} settimane complete, di cui ${om.ratio.anomalous} con attribuzione GA4 anomala`).test(text(o.html)), 'lo stesso conteggio è nella tabella settimanale del report')
  // il rapporto con la settimana alta NON è quello calcolato sul sottoinsieme
  const subset = full.filter(x => x.state === 'ok')
  ok(om.ratio.sumGa / om.ratio.sumGsc > subset.reduce((s, x) => s + x.ga4Org, 0) / subset.reduce((s, x) => s + (x.gscClicks as number), 0), 'il rapporto del periodo non viene abbassato dall’esclusione delle settimane alte')
  ok(!om.ratio.breaks.some(x => x.state === 'unreliable'), 'le settimane non affidabili non entrano nel calcolo delle rotture')
  // una SALITA non è una rottura: settimana a rapporto sano ma alto (≤ 1,05) con mediana bassa
  const up = makeFixture({ mutate: i => { for (const r of i.ga4.baseRows!) if (r.source === 'google' && r.medium === 'organic' && r.date >= '2026-10-12' && r.date <= '2026-10-18') r.sessions = Math.round(r.sessions * 1.25) } })
  const gu = generateReport(up, { diagnostic: true })
  ok(gu.model.ratio.breaks.length === 0 && gu.model.weeks.every(w => w.state !== 'break'), `una salita (sett. 2026-10-12 al ${((gu.model.weeks.find(w => w.weekStart === '2026-10-12')!.ratio as number) * 100).toFixed(0)}) non è una rottura`)
  ok(gu.checks.find(c => c.id === 'ratio')!.value.includes('nessuna rottura'), 'se le rotture sono zero il report scrive «nessuna rottura»')
  // un ribasso oltre il 30% sotto la mediana precedente è una rottura, scritta con settimana e valore
  const rp = generateReport(loaded.get('report-ratio-rupture')!.input), rw = rp.model.ratio.breaks[0]
  const rv = rp.checks.find(c => c.id === 'ratio')!.value
  ok(rp.model.ratio.breaks.length === 1 && rw.ratio! < 1 && new RegExp(`1 rottura — sett\\. ${rw.weekStart.slice(8, 10)}/${rw.weekStart.slice(5, 7)} al ${(rw.ratio! * 100).toFixed(1).replace('.', ',')}%`).test(rv), `rottura scritta con settimana e valore: «${rv.match(/\d rottur[ae] — [^·]*/)?.[0]}»`)
  const prevMed = (() => { const full2 = rp.model.weeks.filter(x => x.full); const k = full2.indexOf(rp.model.weeks.find(x => x.weekStart === rw.weekStart)!); const v = full2.slice(Math.max(0, k - PARAMS.ratioBaselineWeeks), k).map(x => x.ratio as number).sort((a, b) => a - b); return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2 })()
  ok((rw.ratio as number) < prevMed * (1 - PARAMS.ratioBreak), 'la rottura è oltre il 30% SOTTO la mediana delle settimane complete precedenti')
}

section('P4/P6. Periodo comune nel grafico e caption generato dalle date')
{
  const dd = generateReport(loaded.get('report-sane')!.input), dm = dd.model
  const common = dm.dates.filter(d => d <= dm.win.commonEnd).length
  ok(/commonCount":\d+/.test(dd.html) && new RegExp(`"commonCount":${common}`).test(dd.html), `grafico a due pannelli: entrambe le serie ritagliate a ${common} giorni (periodo comune, fino al ${dm.win.commonEnd})`)
  ok(/const cut = a => a\.slice\(0, D\.commonCount\)/.test(dd.html) && (dd.html.match(/cut\(D\./g) || []).length === 6, 'sei serie (GA4 + MA, GSC + MA, due asse delle etichette) passano per lo stesso ritaglio')
  const cap = `GA4: ${dm.win.aggEnd.slice(8, 10)}/${dm.win.aggEnd.slice(5, 7)}/${dm.win.aggEnd.slice(0, 4)} · GSC: ${dm.win.gscEnd.slice(8, 10)}/${dm.win.gscEnd.slice(5, 7)}/${dm.win.gscEnd.slice(0, 4)} · periodo comune: ${dm.win.commonEnd.slice(8, 10)}/${dm.win.commonEnd.slice(5, 7)}/${dm.win.commonEnd.slice(0, 4)}`
  ok(text(dd.html).includes(cap), `caption generato dalle variabili: «${cap}»`)
  ok(!/un giorno prima di GA4/.test(dd.html) && !/lag diverso/.test(dd.html), 'la frase residua «un giorno prima di GA4: lag diverso» non esiste più')
  ok(/giorni di Search Console oltre tale data restano visibili solo nei KPI di Search Console e nella tabella settimanale/.test(text(dd.html)), 'caption: i giorni GSC in più restano solo nei KPI GSC e nella tabella settimanale')
  // ogni data nel testo del report proviene da una variabile calcolata (stesso principio delle percentuali)
  const allowed = new Set<string>()
  const addIso = (d: string) => { if (!d) return; allowed.add(d); allowed.add(`${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`); allowed.add(`${d.slice(8, 10)}/${d.slice(5, 7)}`) }
  for (const d of dm.dates) addIso(d)
  for (const d of [dm.win.start, dm.win.today, dm.win.ga4End, dm.win.aggEnd, dm.win.gscEnd, dm.win.commonEnd, dm.win.ga4Cut, dm.win.gscCut, dm.input.requestedStart, dm.input.requestedEnd, dm.input.geoActivation.date, dm.geo?.range.start || '', dm.geo?.range.end || '']) addIso(d)
  for (const w of dm.weeks) { addIso(w.weekStart); addIso(w.weekEnd) }
  for (const d of [dm.win.ga4Cut, dm.win.gscCut, dm.win.aggEnd, dm.win.gscEnd]) addIso(addDays(d, 1))
  const bodyText = text(dd.html.replace(/<span class="pill">[\s\S]*?<\/span>/, '').replace(/<footer>[\s\S]*?<\/footer>/, '').replace(/<script[\s\S]*?<\/script>/g, ''))
  // solo date calendariali valide (gg ≤ 31, mm ≤ 12): le frazioni dei lead CRM (es. «56/67») non sono date
  const isDate = (t: string) => { const m = t.match(/^(?:\d{4}-(\d{2})-(\d{2})|(\d{2})\/(\d{2})(?:\/\d{4})?)$/); if (!m) return false; const mm = +(m[1] || m[4]), dd = +(m[2] || m[3]); return mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31 }
  const found = [...bodyText.matchAll(/(?<![\d\/])(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2})(?![\d\/])/g)].map(x => x[1]).filter(isDate)
  const stray = [...new Set(found.filter(d => !allowed.has(d) && !/^\d{4}-\d{2}$/.test(d)))]
  ok(stray.length === 0, `ogni data del testo coincide con una variabile calcolata (${new Set(found).size} date distinte controllate)${stray.length ? ' → ESTRANEE: ' + stray.join(', ') : ''}`)
  // il test FALLISCE se una data scritta a mano non coincide con la variabile
  const wrong = bodyText + ' Search Console termina il 03/11/2026 (un giorno prima di GA4)'
  const wrongFound = [...wrong.matchAll(/(?<![\d\/])(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2})(?![\d\/])/g)].map(x => x[1]).filter(isDate).filter(d => !allowed.has(d))
  ok(wrongFound.includes('03/11/2026') || dm.win.gscEnd === '2026-11-03', 'MUTAZIONE «data scritta a mano diversa dalla variabile» → il controllo sulle date la rileva')
  const cc = generateReport(loaded.get('report-consolidating')!.input).model
  ok(cc.win.commonEnd === cc.win.aggEnd && cc.dates.filter(d => d <= cc.win.commonEnd).length === cc.aggCount, 'con consolidamento: periodo comune = ultimo giorno consolidato (la coda non entra nel confronto)')
}

section('P7. Banner unico, una frase, linguaggio di business')
{
  const bannerSentences = (html: string) => { const b = html.match(/<div class="banner[^"]*">([\s\S]*?)<\/div>/); return b ? text(b[1]).trim() : '' }
  const count = (html: string) => (html.match(/class="banner/g) || []).length
  const o = generateReport(loaded.get('report-organic-over-clicks')!.input), ob = bannerSentences(o.html)
  ok(count(o.html) === 1 && !/<ul>/.test(o.html.match(/<div class="banner[^"]*">[\s\S]*?<\/div>/)![0]), 'anomalie di attribuzione → UN solo banner, senza elenco tecnico in testa')
  ok(new RegExp(`^🟠 Dati completi e quadrature verificate\\. ${o.model.ratio.anomalous} settimana su ${o.model.ratio.fullCount} ha un'anomalia di attribuzione GA4 \\(non un calo di traffico\\): dettaglio in appendice\\.$`).test(ob), `banner 🟠: «${ob}»`)
  ok((ob.replace(/dettaglio in appendice/, '').match(/[.!?](\s|$)/g) || []).length <= 2 && ob.length < 220, 'il banner contiene al massimo una frase (più l’incipit fisso)')
  ok(!/ratiomax|H1a|H2|Totale device/.test(o.html.match(/<div class="banner[^"]*">[\s\S]*?<\/div>/)![0]), 'nessun nome di controllo o termine tecnico nel banner')
  ok(/Appendice — Qualità del dato e metodo/.test(o.html) && o.html.indexOf('dato GA4 non affidabile') > 0 && text(o.html.slice(o.html.indexOf('Appendice — Qualità'))).includes('«dato GA4 non affidabile»'), 'l’elenco puntuale delle anomalie è nella tabella in appendice')
  const e = (() => { try { generateReport(loaded.get('report-midnight-wide')!.input); return '' } catch (x: any) { return String(x.message) } })()
  const ed = generateReport(loaded.get('report-midnight-wide')!.input, { diagnostic: true }), eb = bannerSentences(ed.html)
  ok(e.startsWith('REPORT_ASSERT_FAILED') && /^🔴 Report non generato: /.test(eb) && count(ed.html) === 1, `errore bloccante → «${eb.slice(0, 110)}…» (un solo banner 🔴)`)
  ok(count(generateReport(sane.input).html) === 0, 'nessun errore, nessuna anomalia → nessun banner')
  const dv = generateReport(loaded.get('report-device-mismatch')!.input), dvb = bannerSentences(dv.html)
  ok(count(dv.html) === 1 && /fuori tolleranza: dettaglio in appendice/.test(dvb), `anomalia non di attribuzione → una frase senza elenco: «${dvb}»`)
}

section('P8. Appendice «Qualità del dato e metodo» dopo il Geografico')
{
  const ap = generateReport(sane.input), hh = ap.html
  const iGeo = hh.indexOf('🌍 Geografico'), iApp = hh.indexOf('Appendice — Qualità del dato e metodo'), iDef = hh.indexOf('Definizioni di metodo'), iCrm = hh.indexOf('Qualità Lead CRM')
  ok(iGeo > 0 && iApp > iGeo, 'la sezione «Appendice — Qualità del dato e metodo» è DOPO il Geografico')
  ok(iApp > iCrm && iDef > iApp && hh.indexOf('<footer>') > iDef, 'ordine: … CRM → Insight → Geografico → Appendice (tabella + definizioni) → footer')
  ok(!/<h2>🧪 Qualità del dato e metodo<\/h2>/.test(hh) && (hh.match(/Qualità del dato e metodo/g) || []).length >= 1, 'il titolo non compare più tra le sezioni principali')
  const tbl = hh.slice(iApp)
  ok(ap.checks.every(c => tbl.includes(c.label.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'))), `nessuna riga di controllo eliminata: ${ap.checks.length} righe presenti in appendice`)
  ok(/vedi definizione di CTR in appendice/.test(text(hh.slice(0, iApp))), 'rimando «vedi definizione di CTR in appendice» dalla sezione Search Console')
}

section('P9. Intestazione: periodo effettivo, giorni esclusi e causa; consolidamento 2 giorni su 3 al 35%')
{
  const pe = (html: string) => text((html.match(/<span id="periodo-effettivo">([\s\S]*?)<\/span>/) || [])[1] || '')
  const a = generateReport(sane.input), am = a.model
  const dd = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`
  ok(pe(a.html).trim() === `Periodo ${dd(am.win.start)} → ${dd(am.win.aggEnd)} (${am.periodDaysGa4} giorni). Esclusi ${am.excl.total} giorni: ${am.excl.lag} per lag GA4.`, `intestazione (una riga): «${pe(a.html).trim()}»`)
  ok(am.excl.lag === PARAMS.ga4LagDays && am.excl.consolidation === 0 && am.excl.total === PARAMS.ga4LagDays, 'giorni esclusi = lag GA4 (4) + consolidamento (0), derivati dalle date')
  const c = generateReport(loaded.get('report-consolidating')!.input), cm = c.model
  ok(pe(c.html).trim() === `Periodo ${dd(cm.win.start)} → ${dd(cm.win.aggEnd)} (${cm.periodDaysGa4} giorni). Esclusi ${cm.excl.total} giorni: ${cm.excl.lag} per lag GA4, ${cm.excl.consolidation} perché l'organico non è ancora consolidato.`, `con consolidamento: «${pe(c.html).trim()}»`)
  // lag 4 + coda 3 = 7 giorni: NON supera la soglia (> 7) → nessun avviso di finestra ridotta, nessun banner senza anomalie
  ok(cm.excl.total === PARAMS.ga4LagDays + PARAMS.consolidationTailDays && cm.excl.total === PARAMS.reducedWindowDays, `giorni esclusi con consolidamento = ${cm.excl.lag} + ${cm.excl.consolidation} = ${cm.excl.total} (soglia: oltre ${PARAMS.reducedWindowDays})`)
  ok(reducedWindowNote(PARAMS.reducedWindowDays) === '' && !/finestra ridotta/.test(text(c.html)), 'esattamente 7 giorni esclusi: nessun avviso di finestra ridotta')
  const rn = reducedWindowNote(PARAMS.reducedWindowDays + 1)
  ok(rn === 'finestra ridotta: i dati degli ultimi 8 giorni non sono consolidati', `oltre 7 giorni esclusi → «${rn}»`)
  // con più di 7 giorni esclusi l'avviso va NELLO STESSO banner (nessuna voce separata)
  const wide = { ...cm, excl: { ...cm.excl, total: PARAMS.reducedWindowDays + 1 } }
  const wb = reportBanner(wide, [], []), wa = reportBanner(wide, [], generateReport(loaded.get('report-organic-over-clicks')!.input).anomalies)
  ok((wb.match(/class="banner/g) || []).length === 1 && text(wb).includes('finestra ridotta: i dati degli ultimi 8 giorni non sono consolidati'), `senza anomalie: un solo banner con l'avviso: «${text(wb).trim()}»`)
  ok((wa.match(/class="banner/g) || []).length === 1 && /Dati completi e quadrature verificate\./.test(text(wa)) && text(wa).includes('finestra ridotta'), `con anomalia di attribuzione: avviso nello STESSO banner: «${text(wa).trim()}»`)
  ok(reportBanner(cm, [], []) === '' , 'consolidamento con 7 giorni esclusi e nessuna anomalia → nessun banner')
  ok(!/finestra ridotta/.test(text(a.html)), 'nessun avviso di finestra ridotta se i giorni esclusi non superano la soglia')
  // trigger: 2 giorni su 3 sotto il 35%
  ok(PARAMS.consolidationMinShare === 0.35 && PARAMS.consolidationMinDays === 2 && PARAMS.consolidationTailDays === 3, 'parametri: soglia 35%, almeno 2 giorni su 3')
  const dayOrg = (i: ReportInput, d: string, f: number) => { for (const r of i.ga4.baseRows!) if (r.source === 'google' && r.medium === 'organic' && r.date === d) r.sessions = Math.round(r.sessions * f) }
  const lastDays = ['2026-10-29', '2026-10-30', '2026-10-31']
  const one = generateReport(makeFixture({ mutate: i => dayOrg(i, lastDays[2], 0) }), { diagnostic: true })
  ok(one.model.cons.weakDays === 1 && one.model.cons.tailDays === 0 && one.model.excl.consolidation === 0, 'una SOLA giornata debole (organico a zero) NON scatta il trigger')
  const weekend = generateReport(makeFixture({ mutate: i => { dayOrg(i, lastDays[2], 0.1) } }), { diagnostic: true })
  ok(weekend.model.cons.tailDays === 0, 'una giornata molto debole isolata non accorcia la finestra')
  const two = generateReport(makeFixture({ mutate: i => { dayOrg(i, lastDays[1], 0); dayOrg(i, lastDays[2], 0) } }), { diagnostic: true })
  ok(two.model.cons.weakDays >= 2 && two.model.cons.tailDays === 3, `2 giorni su 3 sotto il 35% (${two.model.cons.weakDays} deboli) → scatta: ${two.model.cons.tailDays} giorni esclusi`)
  const between = generateReport(makeFixture({ mutate: i => { dayOrg(i, lastDays[1], 0.5); dayOrg(i, lastDays[2], 0.5) } }), { diagnostic: true })
  ok(between.model.cons.tailDays === 0, 'giorni al 50% della media (sopra il 35%) NON scattano: la soglia non è più il 50%')
}

// ── 5) Mutazioni: il test DEVE fallire se una quadratura è rotta ─────────────
section('5. Mutazioni deliberate (devono far fallire)')
mustFail('totale KPI ≠ somma macro-canali', i => { i.ga4.control!.sessions += 5 }, /H1a/)
mustFail('totale KPI ≠ somma source/medium', i => { i.ga4.control!.sessions -= 3 }, /H1b/)
mustFail('riga source/medium perduta', i => { i.ga4.smBase!.pop() }, /H1b/)
mustFail('serie giornaliera ≠ KPI oltre la tolleranza (+100 sessioni datate)', i => { i.ga4.baseRows!.push({ date: '2026-09-10', channelGrouping: 'Direct', source: '(direct)', medium: '(none)', sessions: 100 }) }, /H2/)
mustFail('serie giornaliera < KPI (sessioni perse)', i => { i.ga4.control!.sessions += 40; i.ga4.smBase![0].sessions += 40 }, /H2/)
mustFail('CTR non ricalcolabile (click > impressioni)', i => { i.gsc!.totals.impressions = i.gsc!.totals.clicks - 1 }, /ctr/)
mustFail('query senza data su intervallo diverso dalla serie', i => { i.ga4.queryEnd = '2026-10-20' }, /qend/)
{
  const R = new PctRegistry(); R.P(4, 7, 0, 'text')
  const r = checkPercentages('<p>100% dei CONTRACT_SENT</p><p>57%</p>', R)
  ok(!r.ok, 'MUTAZIONE «percentuale scritta a mano nel testo» → controllo percentuali FALLISCE')
}
{
  // solo anomalie → il report si genera (niente 🔴)
  const r = generateReport(makeFixture({ mutate: i => { i.ga4.devices![0].sessions += 12 } }))
  ok(r.anomalies.some(a => a.id === 'dev') && !r.hardFailed, 'MUTAZIONE device ≠ KPI oltre la tolleranza → 🟠 anomalia, report comunque generato')
}

// ── 6) dateRanges delle query (mock fetch) ───────────────────────────────────
section('6. dateRanges delle query GA4 (A1/A2) con fetch simulato')
async function runCollect(name: string) {
  const f = loaded.get(name)!.input
  const reqs: { dims: string[]; body: any }[] = []
  const gscReqs: any[] = []
  const dbBinds: any[][] = []
  const origFetch = (globalThis as any).fetch
  const rowsIn = (dr: { startDate: string; endDate: string }) => f.ga4.baseRows!.filter(r => r.date >= dr.startDate && r.date <= dr.endDate)
  const ymd = (s: string) => s.replace(/-/g, '')
  ;(globalThis as any).fetch = async (url: string, init: any) => {
    const J = (o: any) => ({ ok: true, status: 200, json: async () => o, text: async () => JSON.stringify(o) })
    if (String(url).includes('oauth2.googleapis.com')) return J({ access_token: 'test' })
    const body = JSON.parse(init.body)
    if (String(url).includes('analyticsdata')) {
      const dims: string[] = (body.dimensions || []).map((d: any) => d.name)
      reqs.push({ dims, body })
      const src = rowsIn(body.dateRanges[0]), tot = src.reduce((s, r) => s + r.sessions, 0)
      const group = (key: (r: any) => string[]) => { const mp = new Map<string, number>(); for (const r of src) { const k = key(r); mp.set(k.join('|'), (mp.get(k.join('|')) || 0) + r.sessions) } return [...mp.entries()].map(([k, v]) => ({ dimensionValues: k.split('|').map(value => ({ value })), metricValues: [{ value: String(v) }] })) }
      let rows: any[]
      if (dims.length === 0) rows = [{ metricValues: [tot, Math.round(tot * 0.8), Math.round(tot * 0.7), 0.41, 95, tot * 2].map(v => ({ value: String(v) })) }]
      else if (dims[0] === 'date') rows = src.map(r => ({ dimensionValues: [ymd(r.date), ...(dims.length === 4 ? [r.channelGrouping, r.source, r.medium] : [r.source, r.medium])].map(value => ({ value })), metricValues: [{ value: String(r.sessions) }] }))
      else if (dims[0] === 'yearMonth') rows = group(r => [ymd(r.date).slice(0, 6), r.source, r.medium])
      else if (dims.includes('sessionSource') && dims.length === 3) rows = group(r => [r.channelGrouping, r.source, r.medium])
      else if (dims.includes('sessionSource') && dims.length === 2) rows = group(r => [r.source, r.medium]).map(x => ({ ...x, metricValues: [x.metricValues[0], { value: '0.4' }] }))
      else if (dims[0] === 'deviceCategory') rows = [{ dimensionValues: [{ value: 'mobile' }], metricValues: [{ value: String(tot) }] }]
      else rows = []
      return J({ dimensionHeaders: dims.map(name => ({ name })), metricHeaders: [], rows: init.body && body.offset > 0 ? [] : rows, rowCount: rows.length, metadata: { timeZone: 'Europe/Rome', dataLossFromOtherRow: false } })
    }
    gscReqs.push(body)
    const dims: string[] = body.dimensions || []
    const daily = f.gsc!.daily.filter(r => r.date >= body.startDate && r.date <= body.endDate)
    const c = daily.reduce((s, r) => s + r.clicks, 0), im = daily.reduce((s, r) => s + r.impressions, 0)
    return J({ rows: dims.length === 0 ? [{ keys: [], clicks: c, impressions: im, ctr: im ? c / im : 0, position: 12 }] : dims[0] === 'date' ? daily.map(r => ({ keys: [r.date], clicks: r.clicks, impressions: r.impressions, ctr: 0, position: 12 })) : [] })
  }
  const db = { prepare: () => ({ bind: (...a: any[]) => { dbBinds.push(a); return { all: async () => ({ results: f.crm!.rows.map(r => ({ temperatura: r.temperatura, status: r.status, canale: r.canale, dettaglio: r.dettaglio, cnt: r.count })) }) } } }) }
  try {
    const input = await collectReportInput(
      { refreshToken: 'x', oauthClientId: 'y', oauthClientSecret: 'z', ga4PropertyId: '123', searchConsoleSiteUrl: 'sc-domain:ecura.it' } as any, db,
      { now: f.now, startDate: f.requestedStart, endDate: f.requestedEnd, siteUrl: f.siteUrl, measurementId: f.measurementId, geoActivation: f.geoActivation })
    return { input, reqs, gscReqs, dbBinds }
  } finally { (globalThis as any).fetch = origFetch }
}
{
  const { input, reqs, gscReqs, dbBinds } = await runCollect('report-sane')
  const dated = reqs.filter(r => r.dims[0] === 'date'), monthly = reqs.filter(r => r.dims[0] === 'yearMonth'), nodate = reqs.filter(r => r.dims[0] !== 'date' && r.dims[0] !== 'yearMonth')
  const drOf = (r: { body: any }) => JSON.stringify(r.body.dateRanges)
  ok(dated.length === 1 && dated[0].body.dateRanges[0].startDate === '2026-08-09' && dated[0].body.dateRanges[0].endDate === '2026-10-31', `serie datata: ${drOf(dated[0])} (lag ${PARAMS.ga4LagDays})`)
  ok(nodate.length >= 6 && new Set(nodate.map(drOf)).size === 1, `${nodate.length} query non datate (controllo, canale×source×medium, device, pagine, paesi, Direct…) con LO STESSO dateRanges: ${drOf(nodate[0])}`)
  ok(nodate.some(r => r.dims.length === 0) && nodate.some(r => r.dims[0] === 'deviceCategory'), 'controllo (senza dimensioni) e device interrogati con gli stessi dateRanges e filtri')
  ok(monthly.length === 1 && monthly[0].body.dateRanges[0].startDate === '2025-11-01' && monthly[0].body.dateRanges[0].endDate === '2026-10-31', `serie mensile: intervallo proprio ${drOf(monthly[0])} (dimensione yearMonth)`)
  ok(monthly[0].body.dateRanges[0].startDate !== nodate[0].body.dateRanges[0].startDate, 'la serie mensile NON eredita lo startDate del report')
  ok(gscReqs.every(b => b.dataState === 'final' && b.endDate === '2026-11-01'), 'GSC: dataState final, fino a oggi−3')
  ok(dbBinds.length === 1 && dbBinds[0][0] === '2026-08-09' && dbBinds[0][1] === '2026-10-31', 'CRM sullo stesso intervallo di GA4')
  const gen = generateReport(input)
  ok(gen.errors.length === 0 && gen.anomalies.length === 0 && gen.model.geo!.monthsQueried === 12, 'report generato dai dati simulati: nessun errore/anomalia, 12 mesi interrogati')
  ok(gen.model.total === input.ga4.control!.sessions, `totale ${gen.model.total} = query senza dimensioni (con la mezzanotte a zero nel mock)`)
}
{
  const { input, reqs } = await runCollect('report-consolidating')
  const nodate = reqs.filter(r => r.dims[0] !== 'date' && r.dims[0] !== 'yearMonth')
  const datedEnd = reqs.find(r => r.dims[0] === 'date')!.body.dateRanges[0].endDate
  ok(datedEnd === '2026-10-31' && nodate.every(r => r.body.dateRanges[0].endDate === '2026-10-28'), `consolidamento: serie fino al ${datedEnd}, query non datate (e CRM) fino al 2026-10-28`)
  ok(reqs.find(r => r.dims[0] === 'yearMonth')!.body.dateRanges[0].endDate === '2026-10-28', 'serie mensile fino all’ultimo giorno consolidato')
  const gen = generateReport(input, { diagnostic: true })
  ok(gen.model.cons.tailDays === 3 && gen.errors.length === 0, `report dai dati simulati: ${gen.model.cons.tailDays} giorni in consolidamento, nessun errore`)
}

// ── 7) Lint sul sorgente del generatore ──────────────────────────────────────
section('7. Sorgente del generatore: niente percentuali né divisori letterali')
const srcDir = join(process.cwd(), 'src', 'modules')
const genFiles = readdirSync(srcDir).filter(f => /^seo-report-.*\.ts$/.test(f))
for (const f of genFiles) {
  const src = readFileSync(join(srcDir, f), 'utf8')
  const pctHits = src.split('\n').map((l, n) => [n + 1, l] as const).filter(([, l]) => /[0-9]+([.,][0-9]+)?%/.test(l))
  ok(pctHits.length === 0, `${f}: nessuna percentuale letterale (rg '[0-9]+([.,][0-9]+)?%') ${pctHits.length ? '→ riga ' + pctHits.map(h => h[0]).join(',') : ''}`)
  const divHits = src.split('\n').map((l, n) => [n + 1, l] as const).filter(([, l]) => /[^/*]\/ ?(33|30|7|28|90|85|14)(?![0-9.])\b/.test(l.replace(/\/\/.*$/, '')))
  ok(divHits.length === 0, `${f}: nessun divisore letterale (/ 33, / 30, / 7 …) → periodDaysGsc / periodDaysGa4 ${divHits.length ? '→ riga ' + divHits.map(h => h[0]).join(',') : ''}`)
  ok(!/\*\s*24\s*\/\s*(elapsed|ore)/i.test(src) && !/elapsed\s*hours/i.test(src), `${f}: nessuna proiezione «sessioni × 24 / ore trascorse»`)
}
ok(genFiles.length >= 4, `${genFiles.length} file del generatore controllati (${genFiles.join(', ')})`)

const idx = process.argv.indexOf('--html'); if (idx > 0) { writeFileSync(process.argv[idx + 1], h); console.log('html →', process.argv[idx + 1]) }
console.log('\nQUALITÀ DEL DATO (caso sano)')
const sym = { ok: '🟢', notice: '🟡', anomaly: '🟠', error: '🔴' } as const
for (const c of g.checks) console.log(` ${sym[c.level]} ${c.label}: ${c.value.slice(0, 170)}`)
console.log(`\n${passes} asserzioni OK, ${fails} FALLITE`)
console.log(fails ? '❌ TEST FALLITI' : '✅ TUTTI I TEST OK')
process.exit(fails ? 1 : 0)
