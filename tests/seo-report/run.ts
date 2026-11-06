// npm run test:report — regressione del generatore "Report Analytics Live".
// Genera l'HTML dalle fixture congelate in tests/fixtures/report-*.json (dati SINTETICI con totali noti) e verifica:
// quadrature (canali = source/medium = totale; serie = totale + N dichiarato), device = totale, CTR ricalcolabile,
// percentuali del testo = percentuali delle tabelle, livelli (errore / anomalia / avviso), dateRanges delle query,
// tabella lead, assenza di percentuali e divisori letterali nel generatore e MUTAZIONI che devono far fallire il test.
// Exit code != 0 se un'asserzione fallisce → `npm run build` si ferma e il deploy non parte.
// Uso: node scripts/test-seo-report.cjs [--write-fixtures] [--html out.html]
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { generateReport } from '../../src/modules/seo-report-render'
import { collectReportInput } from '../../src/modules/seo-report-data'
import { ReportAssertionError, PctRegistry, checkPercentages, PARAMS, GEO_ACTIVATION, mapCrmChannel, CRM_UNSET, type ReportInput } from '../../src/modules/seo-report-engine'
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
ok(sane.input.ga4.devices!.reduce((s, d) => s + d.sessions, 0) === m.total, 'totale device = totale (coincidenza esatta, senza tolleranza)')
ok(g.checks.find(c => c.id === 'dev')!.level === 'ok', 'controllo device: ok')
ok(m.gsc != null && Math.abs(m.gsc.ctr - m.gsc.clicks / m.gsc.impressions) < 1e-12 && g.checks.find(c => c.id === 'ctr')!.level === 'ok', 'CTR di sito ricalcolabile = click / impressioni')
ok(g.pct.ok && g.pct.textClaims > 0, `percentuali del testo = percentuali delle tabelle (${g.pct.total} registrate, ${g.pct.textClaims} citate nel testo)`)
ok(g.errors.length === 0 && g.anomalies.length === 0, `nessun errore bloccante, nessuna anomalia (${ids(g.errors)} / ${ids(g.anomalies)})`)
ok(!/class="banner/.test(h), 'nessun banner (solo avvisi di metodo nelle righe di tabella)')
ok(g.checks.filter(c => c.level === 'notice').map(c => c.id).sort().join(',') === 'aicrm,direct,geo,sample', `avvisi 🟡 motivati: ${g.checks.filter(c => c.level === 'notice').map(c => c.id).sort().join(', ')}`)
ok(m.win.start === '2026-08-09' && m.win.aggEnd === '2026-10-31' && m.win.gscEnd === '2026-11-01', `finestre: GA4 ${m.win.start} → ${m.win.aggEnd} (lag ${PARAMS.ga4LagDays}), GSC → ${m.win.gscEnd}`)
ok(PARAMS.ga4LagDays === 4, 'GA4_LAG_DAYS = 4')

// A3: trend solo su MA28, MA7 senza verdetto
ok(/MA28 ultimo giorno consolidato/.test(ht) && /Verdetto \(solo MA28\)/.test(ht), 'verdetto del trend solo su MA28')
ok(/indicatore di breve, nessun giudizio/.test(ht), 'MA7 mostrata come indicatore di breve, senza verdetto')
ok(m.trend.every(t => t.endDate <= m.dates[m.aggCount - 1]), 'le MA terminano nell’ultimo giorno consolidato')

// A4/A5: rapporto settimanale
ok(m.weeks.filter(w => w.full).every(w => w.state === 'ok') && m.ratio.reliableCount === m.ratio.fullCount, `tutte le ${m.ratio.fullCount} settimane complete sono affidabili (ratio ≤ ${PARAMS.ratioMax})`)
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
  const rel = om.weeks.filter(x => x.state === 'ok')
  ok(om.ratio.sumGa === rel.reduce((s, x) => s + x.ga4Org, 0) && om.ratio.reliableCount === rel.length && om.ratio.unreliable.length === 1, 'settimana non affidabile ESCLUSA dal rapporto medio')
  ok(!om.weeks.some(x => x.state === 'break' && x.weekStart === '2026-09-14'), 'una settimana non affidabile non è contata anche come rottura')
  const r = generateReport(loaded.get('report-ratio-rupture')!.input).model
  ok(r.ratio.breaks.some(x => x.weekStart === '2026-10-12') && r.weeks.find(x => x.weekStart === '2026-10-12')!.state === 'break', `rottura rilevata: sett. 2026-10-12 oltre ±${PARAMS.ratioBreak} dalla mediana delle precedenti`)
  ok(PARAMS.ratioBandRun === 3 && PARAMS.ratioBandLow === 0.6 && PARAMS.ratioBandHigh === 1.1 && PARAMS.ratioMax === 1.05, 'parametri A5: 3 settimane fuori 0,60–1,10; oltre 1,05 impossibile')
}

// Sanità del trend GA4 vs GSC
{
  const f = makeFixture({ mutate: i => { for (const r of i.ga4.baseRows!) if (r.source === 'google' && r.medium === 'organic' && r.date >= '2026-10-04') r.sessions = Math.max(0, Math.round(r.sessions * 0.15)) } })
  const gg = generateReport(f, { diagnostic: true })
  ok(gg.model.trendSanity != null && gg.model.trendSanity.flagged && /possibile problema di consolidamento o di attribuzione GA4, non un calo di traffico/.test(text(gg.html)), 'GA4 cala più del doppio di GSC → «possibile problema di consolidamento o di attribuzione GA4, non un calo di traffico»')
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
  const r = generateReport(makeFixture({ mutate: i => { i.ga4.devices![0].sessions += 2 } }))
  ok(r.anomalies.some(a => a.id === 'dev') && !r.hardFailed, 'MUTAZIONE device ≠ KPI → 🟠 anomalia, report comunque generato')
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
