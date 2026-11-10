// Test del Marketing Hub ADS (Parti 1-7 della specifica). Dati SINTETICI: nessuna chiamata di rete, nessun DB reale.
// Richiamato da run.ts: stesse funzioni ok/section, stesso exit code → se fallisce, `npm run build` si ferma.
import { generateReport } from '../../src/modules/seo-report-render'
import { buildReportJson } from '../../src/modules/seo-report-json'
import { QUALIFIED_LEAD, isQualifiedLead, qualifiedSql } from '../../src/modules/seo-report-engine'
import * as D from '../../src/modules/ads-decision'
import { renderGoogleAdsStudio } from '../../src/modules/google-ads-studio'
import * as CV from '../../src/modules/ads-conversions'
import { makeFixture } from './fixture'

type Ok = (c: boolean, msg: string) => void
type Section = (t: string) => void
const fmtDate = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')

// DB finto: tiene ads_plans e ads_history in memoria, riconosce solo le query usate dal ciclo di vita
function fakeDb() {
  const plans = new Map<number, { id: number; status: string }>()
  const history: any[] = []
  const db = {
    plans, history,
    prepare(sql: string) {
      let args: any[] = []
      const q = {
        bind(...a: any[]) { args = a; return q },
        async first() { if (/FROM ads_plans WHERE id=\?/.test(sql)) return plans.get(Number(args[0])) || null; return null },
        async run() {
          if (/UPDATE ads_plans SET status=\?/.test(sql)) { const p = plans.get(Number(args[1])); if (p) p.status = args[0] }
          if (/INSERT INTO ads_history/.test(sql)) history.push({ plan_id: args[0], azione: args[1], da_stato: args[2], a_stato: args[3], utente: args[4], note: args[5], created_at: new Date().toISOString() })
          return { meta: {} }
        },
        async all() { return { results: [] } },
      }
      return q
    },
  }
  return db
}

const Q = (query: string, clicks: number, impressions: number, position: number): D.GscQuery => ({ query, clicks, impressions, position })

export async function runAdsTests(ok: Ok, section: Section) {
  // ── A) Parte 1: JSON = PDF ─────────────────────────────────────────────────────────────────
  section('A. Parte 1 — JSON machine-readable coincide col PDF')
  const res = generateReport(makeFixture(), { diagnostic: true })
  const j = buildReportJson(res), t = text(res.html)
  const seo = j.channels!.find(c => c.channel === 'SEO')!.sessions
  ok(j.leads!.qualifiedDefinition === QUALIFIED_LEAD.definition && /temperatura in \(caldo,tiepido\) OR status in \(CONTRACT_SENT,CONTRACT_SIGNED,CONVERTED\)/.test(j.leads!.qualifiedDefinition), `qualifiedDefinition presente e uguale alla costante unica: «${j.leads!.qualifiedDefinition}»`)
  ok(t.includes(String(seo)), `campione 1 — sessioni SEO: JSON ${seo} = valore nel PDF`)
  ok(t.includes(String(j.gsc!.clicks)), `campione 2 — clic Search Console: JSON ${j.gsc!.clicks} = valore nel PDF`)
  ok(t.includes(String(j.leads!.total)) && j.leads!.total === res.model.crm!.total, `campione 3 — lead totali: JSON ${j.leads!.total} = modello del PDF (${res.model.crm!.total}) e presente nel testo`)
  ok(!!j.period && !!j.channels && !!j.engines && !!j.aiTools && !!j.direct && !!j.gsc && !!j.leads && typeof j.generatedAt === 'string', 'contratto: period, channels, engines, aiTools, direct, gsc, leads, generatedAt presenti')
  ok(j.gsc!.queries.length > 0 && 'position' in j.gsc!.queries[0], 'gsc.queries[] con query, clic, impressioni, posizione')
  const q = j.leads!.byChannel.reduce((s, c) => s + c.qualified, 0)
  ok(q === j.leads!.qualified && j.leads!.byChannel.reduce((s, c) => s + c.leads, 0) === j.leads!.total, `leads.byChannel quadra: lead ${j.leads!.total}, qualificati ${q}`)
  // qualificato = una sola definizione: la funzione e il frammento SQL nascono dalla stessa costante
  ok(isQualifiedLead('caldo', 'NEW') && isQualifiedLead('tiepido', 'NEW') && isQualifiedLead('freddo', 'CONVERTED') && isQualifiedLead('freddo', 'CONTRACT_SENT') && !isQualifiedLead('freddo', 'NEW') && !isQualifiedLead('n/a', 'BROCHURE_SENT'), 'isQualifiedLead: caldo/tiepido o contratto inviato/firmato/convertito')
  const sql = qualifiedSql('l')
  ok(QUALIFIED_LEAD.temperatures.every(x => sql.includes(`'${x}'`)) && QUALIFIED_LEAD.statuses.every(x => sql.includes(`'${x}'`)), 'qualifiedSql() è generato dalla stessa costante (stessi valori)')
  // sezione non disponibile → null + nota, mai 0
  const noGsc = buildReportJson(generateReport(makeFixture({ mutate: i => { i.gsc = null; i.errors.push('GSC: non collegata') } }), { diagnostic: true }))
  ok(noGsc.gsc === null && /dato non disponibile/.test(noGsc.notes.gsc), `GSC assente → gsc = null con nota («${noGsc.notes.gsc}»), non zero`)
  const noCrm = buildReportJson(generateReport(makeFixture({ mutate: i => { i.crm = null; i.crmError = 'database non collegato' } }), { diagnostic: true }))
  ok(noCrm.leads === null && /dato non disponibile/.test(noCrm.notes.leads), `CRM assente → leads = null con nota («${noCrm.notes.leads}»), non zero`)

  // ── B) Parte 2: classificatore ─────────────────────────────────────────────────────────────
  section('B. Parte 2 — classificazione delle query')
  const rows: D.GscQuery[] = [
    Q('ecura teleassistenza', 60, 400, 2.1), Q('e cura anziani', 3, 40, 5), Q('E-Cura recensioni', 1, 30, 12),
    Q('bracciale cadute anziani', 40, 3000, 9.3), Q('teleassistenza anziani prezzo', 25, 2500, 11.2), Q('teleassistenza anziani', 22, 900, 6),
    Q('come funziona la teleassistenza', 8, 700, 8), Q("cos'è il telesoccorso", 2, 300, 14), Q('sintomi caduta anziano', 1, 120, 25), Q('quando serve il braccialetto', 1, 90, 18), Q('differenza telesoccorso teleassistenza', 1, 80, 22),
    Q('telesoccorso milano', 12, 600, 1), Q('telesoccorso roma', 5, 200, 3.2), Q('allarme anziani domicilio', 1, 150, 33), Q('sensore caduta casa', 1, 40, 44), Q('orologio sos anziani', 2, 70, 7),
  ]
  const items = D.classifyQueries(rows)
  const by = (s: string) => items.find(i => i.query === s)!
  ok(items.length === rows.length && rows.filter(r => r.clicks > 0).every(r => by(r.query).decision), `tutte le ${rows.length} query (con clic) sono classificate`)
  ok(items.every(i => i.reason.trim().length > 0 && !/\n/.test(i.reason)), 'ogni voce ha una reason non vuota, di una frase')
  ok(items.filter(i => D.isBrandQuery(i.query)).length === 3 && items.filter(i => D.isBrandQuery(i.query)).every(i => i.decision === 'NO_ADS_BRAND'), 'ecura / e cura / e-cura → NO_ADS_BRAND (anche in pos. 5 e 12)')
  ok(!items.some(i => D.isBrandQuery(i.query) && i.decision === 'ADS_OPPORTUNITY'), 'nessuna query di marca risulta ADS_OPPORTUNITY')
  ok(by('come funziona la teleassistenza').decision === 'NEGATIVE' && by("cos'è il telesoccorso").decision === 'NEGATIVE' && by('sintomi caduta anziano').decision === 'NEGATIVE' && by('quando serve il braccialetto').decision === 'NEGATIVE' && by('differenza telesoccorso teleassistenza').decision === 'NEGATIVE', 'intento informativo (come funziona, cos\'è, sintomi, quando, differenza) → NEGATIVE')
  ok(by('bracciale cadute anziani').decision === 'ADS_OPPORTUNITY' && by('teleassistenza anziani prezzo').decision === 'ADS_OPPORTUNITY' && by('teleassistenza anziani').decision === 'ADS_OPPORTUNITY', 'commerciale in pos. 5-15 con ≥ 50 impressioni → ADS_OPPORTUNITY')
  ok(by('telesoccorso milano').decision === 'NO_ADS_ORGANIC_WINS' && by('telesoccorso roma').decision === 'NO_ADS_ORGANIC_WINS', 'pos. 1-3 → NO_ADS_ORGANIC_WINS')
  ok(by('allarme anziani domicilio').decision === 'ADS_TEST' && by('sensore caduta casa').decision === 'SEO_ONLY', 'pos. > 20: ≥ 100 impressioni → ADS_TEST, < 100 → SEO_ONLY')
  const lost = by('bracciale cadute anziani').lostClicksEstimate
  const expLost = Math.round(3000 * (D.ctrTarget(9.3) - 40 / 3000))
  ok(lost === expLost && lost > 0, `clic persi = impressioni × (CTR_target − CTR attuale) = ${lost} (atteso ${expLost})`)
  ok(D.ctrTarget(1) === 0.28 && D.ctrTarget(3) === 0.28 && D.ctrTarget(4) < 0.28 && D.ctrTarget(10) < D.ctrTarget(4) && D.ctrTarget(30) < D.ctrTarget(10), 'CTR_target: 0,28 fino a pos. 3, poi decrescente (costante documentata)')
  const cnt = D.countByDecision(items)
  ok(Object.values(cnt).reduce((a, b) => a + b, 0) === items.length, `conteggio per decisione quadra con le query: ${JSON.stringify(cnt)}`)

  // guardrail bloccante: NEGATIVE che collide con keyword attiva
  const active = [{ text: 'teleassistenza anziani', plan: 'Primo lancio' }, { text: 'bracciale anziani', plan: 'Primo lancio' }]
  const noColl = D.buildSeoInputs({ gsc: { clicks: 1, impressions: 1, queries: [Q("cos'è il telesoccorso", 2, 300, 14)] }, notes: {} }, active)
  ok(noColl.available && noColl.blocking.length === 0, 'negativa che non tocca keyword attive → nessun blocco')
  const coll = D.buildSeoInputs({ gsc: { clicks: 1, impressions: 1, queries: [Q('come funziona teleassistenza anziani', 5, 400, 9)] }, notes: {} }, active)
  ok(coll.available && coll.blocking.length === 1 && coll.blocking[0].level === 'error' && /keyword attiva/.test(coll.blocking[0].msg), `NEGATIVE che contiene una keyword attiva → errore BLOCCANTE (level=error): «${coll.blocking[0]?.msg}»`)
  ok(D.negativeCollisions(['quando'], [{ text: 'quando chiamare teleassistenza', plan: 'p' }]).length === 1, 'collisione anche quando la keyword attiva contiene la negativa')
  const nogsc = D.buildSeoInputs({ gsc: null, notes: { gsc: 'dato non disponibile: Search Console non collegata' } }, active)
  ok(!nogsc.available && nogsc.items === null && /dato non disponibile/.test(String(nogsc.reason)), 'Search Console assente → items = null con motivo, non un elenco vuoto')

  // ── C) Parte 3: ottimizzatore ──────────────────────────────────────────────────────────────
  section('C. Parte 3 — ottimizzatore di budget')
  const base: D.OptimizeInput = { targetQualifiedLeads: 10, maxCpl: 15, budgetCap: null, cr: 0.03, crSource: 'assunzione', cpc: 0.7, cpcSource: 'assunzione', periodDays: 28, items }
  const o = D.optimizeBudget(base)
  ok(o.steps.length === 7 && o.steps.every((s, i) => s.n === i + 1 && s.formula && s.result), 'restituisce i 7 passaggi, ciascuno con formula e risultato')
  ok(/cpcCeiling = maxCpl × cr/.test(o.steps[0].formula) && /0\.45/.test(o.steps[0].result), `passo 1: cpcCeiling = 15 × 0,03 = 0,45 (${o.steps[0].result})`)
  ok(o.totals.budgetDay > 0 && Math.abs(o.totals.budgetDay - o.totals.budgetMonth / D.DAYS_PER_MONTH) < 0.011, `budget giornaliero = mensile / ${D.DAYS_PER_MONTH}: ${o.totals.budgetMonth} € → ${o.totals.budgetDay} €/giorno`)
  ok(o.reachable ? o.totals.leads >= 10 : true, 'se il target è raggiungibile, i lead allocati lo coprono')
  const hi = D.optimizeBudget({ ...base, targetQualifiedLeads: 100000 })
  ok(!hi.reachable && hi.maxObtainable > 0 && hi.missing === 100000 - hi.maxObtainable && /target non raggiungibile/.test(hi.verdict), `target molto alto → «target non raggiungibile», massimo ottenibile ${hi.maxObtainable}, mancano ${hi.missing}`)
  const small = D.optimizeBudget({ ...base, targetQualifiedLeads: 1 })
  ok(small.totals.budgetMonth < o.totals.budgetMonth || o.totals.leads <= small.totals.leads, `budget mai più alto del necessario: target 1 → ${small.totals.budgetMonth} € ≤ target 10 → ${o.totals.budgetMonth} €`)
  ok(o.basis === 'stimato' && o.estimate === 'stima da verificare', 'cr non misurato → output marcato «stima da verificare» (basis = stimato)')
  const meas = D.optimizeBudget({ ...base, cr: 0.04, crSource: 'misurato' })
  ok(meas.basis === 'misurato' && meas.estimate !== 'stima da verificare', 'cr misurato → basis = misurato, nessuna etichetta di stima')
  ok(o.assumptions.length >= 5 && o.assumptions.every(a => a.name && a.effect), `assunzioni dichiarate con il loro effetto (${o.assumptions.length})`)
  const capped = D.optimizeBudget({ ...base, targetQualifiedLeads: 1000, budgetCap: 20 })
  ok(capped.totals.budgetMonth <= 20.01 && capped.totals.limitedBy === 'budgetCap', `budgetCap rispettato: ${capped.totals.budgetMonth} € ≤ 20 €`)
  const rng = D.optimizeRange(base)
  ok(rng.min.leads <= rng.max.leads && rng.min.cr < rng.max.cr, `intervallo lead ADS con cr in assunzione: ${rng.min.leads}-${rng.max.leads}`)
  ok(D.measuredCr({ campaign: 't', leads: 5, qualified: 4, clicks: 200, spend: 100 }).source === 'assunzione' && D.measuredCr({ campaign: 't', leads: 14, qualified: 12, clicks: 400, spend: 100 }).source === 'misurato', 'cr misurato solo con ≥ 10 lead qualificati e clic importati')

  // ── D) Parte 4: import report + ciclo di vita ──────────────────────────────────────────────
  section('D. Parte 4 — import del report Google Ads e ciclo di vita')
  const csvTerms = 'Report termini di ricerca\n"Termine di ricerca","Campagna","Impr.","Clic","Costo","Conversioni"\n"teleassistenza anziani","eCura | Search | Primo lancio","1.200","80","56,40","3"\n"badante gratis","eCura | Search | Primo lancio","300","41","28,70","0"\nTotale,,"1.500","121","85,10","3"\n'
  const pr = D.parseAdsReport(csvTerms, 15)
  ok(pr.ok && pr.kind === 'search_terms' && pr.rows.length === 2, `CSV termini di ricerca: ${pr.rows.length} righe, totale escluso`)
  ok(pr.rows[0].impressions === 1200 && pr.rows[0].clicks === 80 && pr.rows[0].cost === 56.4 && pr.rows[0].conversions === 3 && pr.rows[0].campaign.includes('Primo lancio') && pr.rows[0].search_term === 'teleassistenza anziani', 'estrae impressions, clicks, cost (virgola decimale), conversions, campaign, search_term')
  ok(!!pr.analysis && pr.analysis.negatives.some((n: any) => n.term === 'badante gratis'), 'riusa analyzeSearchTerms: «badante gratis» (41 clic, 0 conversioni) è proposta come negativa')
  const csvCamp = 'Campagna,Impr.,Clic,Costo,Conversioni\neCura | Search | Primo lancio,5000,230,"161,00",9\n'
  const pc = D.parseAdsReport(csvCamp)
  ok(pc.ok && pc.kind === 'campaigns' && pc.totals!.clicks === 230 && pc.totals!.cost === 161, 'CSV campagne importato (separatore virgola)')
  ok(D.parseAdsReport('Campagna;Impr.;Clic;Costo;Conversioni\nTest;100;10;"5,50";1\n').ok, 'CSV con separatore «;» (Google Ads in italiano) importato')
  for (const [label, csv] of [['vuoto', ''], ['testo libero', 'ciao questo non è un csv\nne un report'], ['senza dati', 'Campagna,Impr.,Clic,Costo\n'], ['colonne mancanti', 'Campagna,Note\nA,B\n'], ['binario', 'PK\u0003\u0004\u0000\u0000xlsx']] as const) {
    let r: D.ParsedReport | null = null, threw = false
    try { r = D.parseAdsReport(csv) } catch { threw = true }
    ok(!threw && !!r && !r.ok && !!r.error && r.error.length > 15, `CSV malformato (${label}) → errore leggibile, nessuna eccezione: «${(r?.error || '').slice(0, 70)}»`)
  }

  // ciclo di vita: macchina a stati
  ok(D.PLAN_STATES.join('>') === 'draft>approved>exported>running>paused>archived', 'sei stati: draft → approved → exported → running → paused → archived')
  ok(D.LIFECYCLE.draft.actions.includes('elimina') && D.LIFECYCLE.approved.actions.includes('esporta') && D.LIFECYCLE.exported.actions.includes('attiva') && D.LIFECYCLE.running.actions.includes('importa') && D.LIFECYCLE.paused.actions.includes('riprendi') && D.LIFECYCLE.archived.actions.includes('duplica'), 'azioni disponibili per stato come da specifica')
  ok(D.transition('attiva', 'draft').ok === false && D.transition('pausa', 'approved').ok === false && D.transition('riprendi', 'running').ok === false, 'transizioni non consentite rifiutate (attiva da bozza, pausa da approvata, riprendi da attiva)')
  const chain: [string, string][] = [['approva', 'approved'], ['esporta', 'exported'], ['attiva', 'running'], ['pausa', 'paused'], ['riprendi', 'running'], ['pausa', 'paused'], ['archivia', 'archived']]
  let st = 'draft', chainOk = true
  for (const [a, to] of chain) { const r = D.transition(a, st); if (!r.ok || r.to !== to) chainOk = false; else st = r.to }
  ok(chainOk && st === 'archived', 'percorso completo draft → … → archived percorribile')
  // storico su DB: ogni transizione lascia una riga con utente e timestamp
  const db = fakeDb(); db.plans.set(7, { id: 7, status: 'exported' })
  const r1 = await D.applyTransition(db, 7, 'attiva', 'mario.rossi', 'caricata in Editor')
  const r2 = await D.applyTransition(db, 7, 'pausa', 'mario.rossi')
  const r3 = await D.applyTransition(db, 7, 'attiva', 'mario.rossi')
  ok(r1.ok && r2.ok && !r3.ok && db.plans.get(7)!.status === 'paused', `applyTransition: exported → running → paused; «attiva» da pausa rifiutata (${(r3 as any).error?.slice(0, 60)})`)
  ok(db.history.length === 2 && db.history.every(h => h.plan_id === 7 && h.utente === 'mario.rossi' && h.created_at) && db.history[0].da_stato === 'exported' && db.history[0].a_stato === 'running' && db.history[0].note === 'caricata in Editor', `ads_history: ${db.history.length} righe con plan_id, azione, da/a stato, utente, note, timestamp`)
  ok(!(await D.applyTransition(db, 99, 'pausa', 'x')).ok, 'bozza inesistente → errore 404, nessuna riga di storico spuria')
  ok(db.history.length === 2, 'una transizione rifiutata non scrive nello storico')

  // ── E) Parte 5: misura sui qualificati, soglie ─────────────────────────────────────────
  section('E. Parte 5 — lead qualificati, QCPL, soglie di stop')
  const lowTot = D.buildPerformance({ total: { campaign: 'Totale ADS', leads: 6, qualified: 4, clicks: 300, spend: 120 }, campaigns: [{ campaign: 'A', leads: 6, qualified: 4, clicks: 300, spend: 120 }], maxCpl: 15, seoCostPerLead: 20 })
  ok(!lowTot.sufficient && lowTot.sample.message === 'dati insufficienti: 4/10', `sotto il campione: «${lowTot.sample.message}»`)
  ok(lowTot.overall.qcpl === null && lowTot.overall.qualificationRate === null && lowTot.campaigns.every(c => c.qcpl === null && c.qualificationRate === null && c.note === 'dati insufficienti: 4/10'), 'sotto 10 qualificati: nessun QCPL e nessuna percentuale (null), nota «dati insufficienti: N/10»')
  ok(lowTot.stops.length === 0, 'sotto il campione: nessuna raccomandazione di stop')
  const zeroQ = D.buildPerformance({ total: { campaign: 'Totale ADS', leads: 20, qualified: 0, clicks: 500, spend: 300 }, campaigns: [{ campaign: 'B', leads: 20, qualified: 0, clicks: 500, spend: 300 }], maxCpl: 15, seoCostPerLead: 20 })
  ok(zeroQ.stops.length === 0, 'anche con 0 qualificati su 500 clic: finché il campione totale è sotto 10, nessuna raccomandazione (nessun numero rassicurante e falso)')
  const camps: D.PerfInput[] = [
    { campaign: 'Costosa', leads: 20, qualified: 12, clicks: 900, spend: 300 },   // QCPL 25 > 19,5 e > 20 SEO
    { campaign: 'Buona', leads: 30, qualified: 14, clicks: 400, spend: 140 },     // QCPL 10 ≤ 15
    { campaign: 'Fuori target', leads: 20, qualified: 1, clicks: 120, spend: 80 }, // 1/20 < 10 %
    { campaign: 'Esperimento', leads: 2, qualified: 0, clicks: 60, spend: 40 },    // 0 qualificati su 60 clic
    { campaign: 'Piccola', leads: 9, qualified: 4, clicks: 30, spend: 90 },        // sotto ogni minimo
  ]
  const tot: D.PerfInput = { campaign: 'Totale ADS', leads: 81, qualified: 31, clicks: 1510, spend: 650 }
  const perf = D.buildPerformance({ total: tot, campaigns: camps, maxCpl: 15, seoCostPerLead: 20 })
  const rule = (r: string, c: string) => perf.stops.some(s => s.rule === r && s.campaign === c)
  ok(perf.sufficient && perf.overall.qcpl === 20.97 && perf.overall.qualificationRate === 0.383, `sopra il campione: QCPL totale ${perf.overall.qcpl} € (650 / 31), quota ${perf.overall.qualificationRate}`)
  ok(rule('QCPL', 'Costosa') && !rule('QCPL', 'Buona') && !rule('QCPL', 'Piccola'), 'soglia 1: QCPL > maxCpl × 1,3 con ≥ 10 qualificati → ferma il bucket (solo «Costosa»)')
  ok(rule('RATE', 'Fuori target') && !rule('RATE', 'Buona') && !rule('RATE', 'Piccola'), 'soglia 2: quota < 10 % con ≥ 15 lead → sposta a SEO/negativa (solo «Fuori target»)')
  ok(rule('ZERO_QUALIFIED', 'Esperimento') && !rule('ZERO_QUALIFIED', 'Piccola'), 'soglia 3: 0 qualificati dopo 40 clic → spegni l\'esperimento')
  ok(rule('SEO_CHEAPER', 'Costosa') && !rule('SEO_CHEAPER', 'Buona') && /conviene investire in contenuto, non in ADS/.test(perf.stops.find(s => s.rule === 'SEO_CHEAPER')!.text), 'soglia 4: QCPL > costo SEO → «conviene investire in contenuto, non in ADS»')
  ok(perf.stops.every(s => s.text.length > 0 && Object.keys(s.numbers).length > 0), 'ogni raccomandazione porta i numeri che la generano; nessuna viene eseguita (solo testo)')
  ok(perf.definition === QUALIFIED_LEAD.definition && perf.sample.minimum === 10, 'il payload include la definizione di qualificato e il campione minimo')
  // attribuzione lead → campagna (click ID + utm_campaign nella landing)
  const A = D.adsAttribution({ gclid: 'abc123456', landing_page: 'https://www.ecura.it/x?utm_source=google&utm_medium=cpc&utm_campaign=ecura_search_primo_lancio', q: 1 })
  ok(A.attributed && A.byClickId && A.campaign === 'ecura_search_primo_lancio', 'lead con gclid: attribuito, campagna da utm_campaign della landing')
  ok(D.adsAttribution({ landing_page: 'https://www.ecura.it/?utm_medium=cpc&utm_campaign=c1', q: 0 }).attributed && !D.adsAttribution({ landing_page: 'https://www.ecura.it/', q: 1 }).attributed, 'senza click ID ma con utm_medium=cpc → attribuito; senza nulla → non attribuito')
  const pl = D.perfFromLeads([
    { gclid: 'g1xxxxx', landing_page: '?utm_campaign=Camp A', q: 1 }, { gclid: 'g2xxxxx', landing_page: '?utm_campaign=Camp A', q: 0 }, { gclid: 'g3xxxxx', utm_campaign: 'camp-b', q: 1 }, { landing_page: '/', q: 1 },
  ], [{ campaign: 'Camp A', impressions: 100, clicks: 40, cost: 30, conversions: 0 }], 999)
  ok(pl.total.leads === 3 && pl.total.qualified === 2 && pl.campaigns.length === 2, `perfFromLeads: 3 lead ADS (il quarto non ha attribuzione), 2 qualificati, 2 campagne`)
  const ca = pl.campaigns.find(c => c.campaign === 'Camp A')!
  ok(ca.leads === 2 && ca.qualified === 1 && ca.clicks === 40 && ca.spend === 30, 'join campagna: lead del CRM + clic e costo del report importato (stessa campagna anche con maiuscole/spazi diversi)')
  ok(pl.total.spend === 30 && /importato/.test(pl.spendBasis), 'con report importato la spesa è quella del report (misurata), non quella manuale')

  // ── A) utm_campaign dalla colonna, URL solo come fallback per i lead storici ──────────
  section('A. Attribuzione campagna da leads.utm_campaign')
  {
    const col = D.adsAttribution({ gclid: 'gclidAAAA', landing_page: 'https://www.ecura.it/', utm_campaign: 'ecura_search_primo_lancio', q: 1 })
    ok(col.campaign === 'ecura_search_primo_lancio' && col.via === 'utm_campaign', 'A: lead con colonna utm_campaign e landing_page SENZA parametri → campagna corretta, via=utm_campaign')
    const both = D.adsAttribution({ gclid: 'gclidAAAA', landing_page: '?utm_campaign=da_url', utm_campaign: 'da_colonna', q: 1 })
    ok(both.campaign === 'da_colonna', 'A: se colonna e URL discordano vince la colonna')
    const hist = D.adsAttribution({ gclid: 'gclidAAAA', landing_page: '?utm_campaign=storica', utm_campaign: '   ', q: 1 })
    ok(hist.campaign === 'storica' && hist.via === 'landing_page', 'A: colonna vuota (lead storico) → ripiego sull\'URL, via=landing_page')
    const none = D.adsAttribution({ gclid: 'gclidAAAA', landing_page: 'https://www.ecura.it/', q: 1 })
    ok(none.attributed && none.campaign === null && none.via === null, 'A: click ID senza alcuna campagna → attribuito ma senza campagna')
    const pa = D.perfFromLeads([
      { gclid: 'g1xxxxx', landing_page: 'https://www.ecura.it/', utm_campaign: 'Camp X', q: 1 },
      { gclid: 'g2xxxxx', landing_page: '/', utm_campaign: 'Camp X', q: 0 },
      { gclid: 'g3xxxxx', landing_page: '?utm_campaign=Camp X', q: 1 },
      { gclid: 'g4xxxxx', landing_page: '/', q: 0 },
    ], [], null)
    const cx = pa.campaigns.find(c => c.campaign === 'Camp X')!
    ok(cx.leads === 3 && cx.qualified === 2, `A: 3 lead in «Camp X» (2 dalla colonna + 1 storico dall'URL), 2 qualificati (${cx.leads}/${cx.qualified})`)
    ok(pa.attribution.source === 'utm_campaign' && pa.attribution.coveredLeads === 2 && pa.attribution.fallbackLeads === 1 && pa.attribution.unattributedLeads === 1, `A: attribution = {source:'utm_campaign', coveredLeads:2, fallbackLeads:1} (${JSON.stringify(pa.attribution)})`)
    ok(pa.campaigns.some(c => c.campaign === '(non attribuita)' && c.leads === 1), 'A: lead con click ID ma senza campagna → bucket «(non attribuita)»')
    ok(D.cleanUtmCampaign('  ecura  <b>x</b>\n\tsearch ') === 'ecura b x /b search' && D.cleanUtmCampaign('   ') === null && D.cleanUtmCampaign(null) === null && D.cleanUtmCampaign('x'.repeat(500))!.length === 120, 'A: cleanUtmCampaign — una riga, senza markup né controlli, max 120, vuoto → null')
    ok(D.referrerDomain('https://chatgpt.com/c/abc?x=1#y') === 'chatgpt.com' && D.referrerDomain('https://www.Perplexity.ai/search') === 'perplexity.ai' && D.referrerDomain('gemini.google.com') === 'gemini.google.com', 'F/B: referrerDomain → solo dominio, minuscolo, senza www/path/query')
    ok(D.referrerDomain('') === null && D.referrerDomain('javascript:alert(1)') === null && D.referrerDomain('mario.rossi@mail.it') === null && D.referrerDomain('https://user:pw@evil.com/p') === 'evil.com', 'B: referrerDomain scarta ciò che non è un hostname e toglie userinfo (nessun dato personale)')

    // migrazione additiva e idempotente (db finto con schema vivo)
    const { ensureLeadAttributionColumns, resetLeadAttributionColumnsCache } = await import('../../src/modules/workflow-email-manager')
    resetLeadAttributionColumnsCache() // la cache di isolate può essere stata accesa da test precedenti con db finti
    const cols = new Set(['id', 'gclid']); const alters: string[] = []
    const mkDb = (dupErr = false): any => ({ prepare: (sql: string) => ({
      all: async () => ({ results: [...cols].map(name => ({ name })) }),
      run: async () => { const m = /ADD COLUMN (\w+)/.exec(sql); if (!m) return {}; alters.push(m[1]); if (dupErr || cols.has(m[1])) throw new Error('duplicate column name: ' + m[1]); cols.add(m[1]); return {} },
    }) })
    await ensureLeadAttributionColumns(mkDb())
    ok(cols.has('utm_campaign') && cols.has('first_referrer') && alters.length === 2, 'A/B: migrazione aggiunge utm_campaign e first_referrer')
    const before = alters.length
    resetLeadAttributionColumnsCache() // simula un nuovo isolate: lo schema ora ha già le colonne
    await ensureLeadAttributionColumns(mkDb())
    ok(alters.length === before, 'A/B: seconda esecuzione idempotente (nessun ALTER ripetuto)')
    cols.delete('first_referrer'); resetLeadAttributionColumnsCache()
    const lg = await ensureLeadAttributionColumns({ prepare: (sql: string) => ({ all: async () => ({ results: [] }), run: async () => { if (/ADD COLUMN/.test(sql)) throw new Error('duplicate column name: x'); return {} } }) } as any)
    ok(!lg.some(l => l.startsWith('⚠️')), 'A/B: «duplicate column» (esecuzioni concorrenti) è ignorato, non è un errore')
  }
  // endpoint /performance: la campagna arriva dalla colonna anche se la landing non ha parametri
  {
    const { createMarketingApi } = await import('../../src/modules/marketing-api')
    const hub = createMarketingApi()
    const leadRows = [
      { gclid: 'g1xxxxx', gbraid: null, wbraid: null, landing_page: 'https://www.ecura.it/', utm_campaign: 'ecura_search_primo_lancio', q: 1 },
      { gclid: 'g2xxxxx', gbraid: null, wbraid: null, landing_page: 'https://www.ecura.it/', utm_campaign: 'ecura_search_primo_lancio', q: 0 },
      { gclid: 'g3xxxxx', gbraid: null, wbraid: null, landing_page: '?utm_campaign=vecchia', utm_campaign: null, q: 1 },
    ]
    const db: any = { prepare: (sql: string) => { const q: any = { bind: () => q,
      all: async () => {
        if (/pragma_table_info/.test(sql)) return { results: ['id', 'gclid', 'gbraid', 'wbraid', 'landing_page', 'utm_campaign', 'first_referrer', 'created_at'].map(name => ({ name })) }
        if (/COUNT\(\*\)/.test(sql)) return { results: [{ n: 10, q: 2 }] }
        if (/FROM leads/.test(sql)) { ok(/utm_campaign, CASE/.test(sql) && !/json_extract/.test(sql), 'A: la query legge la colonna utm_campaign (nessun json_extract su landing_page)'); return { results: leadRows } }
        return { results: [] }
      }, first: async () => null, run: async () => ({ meta: {} }) }; return q } }
    const cookie = 'session=' + encodeURIComponent(JSON.stringify({ expiresAt: new Date(Date.now() + 3600e3).toISOString(), user: { name: 't', email: 't@e.it' } }))
    const r = await hub.request('/performance?giorni=28', { headers: { Cookie: cookie } }, { DB: db } as any)
    const body: any = await r.json()
    const names = JSON.stringify(body)
    ok(r.status === 200 && /ecura_search_primo_lancio/.test(names), `A: /performance attribuisce i lead alla campagna dalla colonna (status ${r.status})`)
    ok(body.attribution && body.attribution.source === 'utm_campaign' && body.attribution.coveredLeads === 2 && body.attribution.fallbackLeads === 1, `A: /performance dichiara attribution.source='utm_campaign', covered 2, fallback 1 (${JSON.stringify(body.attribution)})`)
  }

  // ── F) Parte 6: Decisioni di oggi ──────────────────────────────────────────────────────
  section('F. Parte 6 — «Decisioni di oggi»')
  const dec = D.decisionsOfToday({
    qualifiedTotal: 31, measured: perf.campaigns, stops: perf.stops, maxCpl: 15,
    terms: [{ term: 'badante gratis', clicks: 41, conversions: 0 }, { term: 'teleassistenza anziani', clicks: 80, conversions: 3 }], convTracked: true,
    items, cpc: 0.7, cr: 0.03, seoCostPerLead: 20,
  })
  ok(dec.rows.length > 0 && dec.rows.length <= 5 && dec.insufficient === null, `massimo 5 righe (${dec.rows.length})`)
  ok(dec.rows.every(r => /\d/.test(r.text) && Object.keys(r.numbers).length > 0 && r.source.length > 0), 'ogni riga contiene il numero che la genera e dichiara la fonte')
  const kinds = dec.rows.map(r => r.kind)
  ok(dec.rows.some(r => /^Taglia: Costosa — QCPL 25,00 € > soglia 19,50 €$/.test(r.text)), 'formato «Taglia: <bucket> — QCPL <x> € > soglia <y> €»')
  ok(dec.rows.some(r => /^Negativa: badante gratis — 0 lead qualificati su 41 clic$/.test(r.text)), 'formato «Negativa: <termine> — 0 lead qualificati su <n> clic»')
  ok(kinds.includes('TAGLIA') && kinds.includes('NEGATIVA'), `le righe più urgenti (taglia, negativa) hanno la precedenza: ${kinds.join(', ')}`)
  const all = D.decisionsOfToday({ qualifiedTotal: 31, measured: [{ ...D.measure({ campaign: 'Buona', leads: 30, qualified: 14, clicks: 400, spend: 140 }) }], stops: [], maxCpl: 15, terms: [], convTracked: false, items, cpc: 0.7, cr: 0.03, seoCostPerLead: 20 })
  ok(all.rows.some(r => /^Aumenta: Buona — QCPL 10,00 €, 14 lead qualificati, sotto target$/.test(r.text)), 'formato «Aumenta: <bucket> — QCPL <x> €, <n> lead qualificati, sotto target»')
  ok(all.rows.some(r => /^Non pagare: telesoccorso milano — organico in posizione 1$/.test(r.text)), 'formato «Non pagare: <query> — organico in posizione <p>»')
  ok(all.rows.some(r => /^Serve contenuto: .+ — pos\. [\d,]+, ADS non convenienti \(QCPL stimato 23,33 € vs SEO 20,00 €\)$/.test(r.text)), 'formato «Serve contenuto: <query> — pos. <p>, ADS non convenienti (QCPL stimato <x> € vs SEO)»')
  ok(all.rows.length <= 5, 'con molte query candidate resta il limite di 5 righe')
  const ins = D.decisionsOfToday({ qualifiedTotal: 4, measured: perf.campaigns, stops: perf.stops, maxCpl: 15, terms: [], convTracked: false, items, cpc: 0.7, cr: 0.03, seoCostPerLead: 20 })
  ok(ins.rows.length === 0 && ins.insufficient === 'dati insufficienti: 4/10 lead qualificati', `dati insufficienti → nessun suggerimento, solo «${ins.insufficient}»`)

  // ── G) Parte 7: liste, CSV, proiezione ─────────────────────────────────────────────────
  section('G. Parte 7 — liste operative, CSV e proiezione')
  const pages = ['https://www.ecura.it/', 'https://www.ecura.it/teleassistenza-anziani', 'https://www.ecura.it/blog/bracciale-cadute-anziani', 'https://www.ecura.it/blog/costo-teleassistenza']
  const L = D.buildLists(items, { periodDays: 28, cpc: 0.7, cr: 0.03, seoCostPerLead: 20, pages })
  ok(L.brief.length > 0 && L.geo.length > 0 && L.protect.length > 0, `le 3 liste non sono vuote con dati realistici: brief ${L.brief.length}, GEO/AEO ${L.geo.length}, da proteggere ${L.protect.length}`)
  ok(L.brief.every(b => b.proposedTitle && b.h2.length >= 3 && b.why) && L.brief.some(b => b.closestPage), 'brief: titolo proposto, H2 da coprire, motivo, pagina più vicina')
  ok(L.brief.some(b => b.query === 'sensore caduta casa' || b.query === 'allarme anziani domicilio'), 'il brief contiene le SEO_ONLY e (con QCPL stimato > costo SEO) le query dove le ADS non convengono')
  ok(L.adsNotWorth && L.brief.some(b => b.query === 'bracciale cadute anziani'), `QCPL stimato ${L.qcplEstimated} € > costo SEO 20 €: anche le ADS_OPPORTUNITY entrano nel brief`)
  ok(L.geo.every(g => /informativo/.test(g.why)) && L.geo.length === items.filter(i => i.decision === 'NEGATIVE' && i.impressions >= D.THRESHOLDS.geoMinImpr).length, 'azioni GEO/AEO = query NEGATIVE con volume')
  ok(L.protect.every(p => p.kind === 'marca' || p.kind === 'organico') && L.protect.some(p => /diventa candidata ADS/.test(p.rule)), 'da proteggere = NO_ADS_ORGANIC_WINS + NO_ADS_BRAND, con la regola «sotto pos. 3 diventa candidata ADS»')
  const csv = D.toCsv(L.brief, D.LIST_COLUMNS.brief)
  const lines = csv.replace(/^\ufeff/, '').trim().split('\r\n')
  ok(csv.startsWith('\ufeff') && lines.length === L.brief.length + 1 && lines[0] === 'query;impressioni;posizione;clic persi/mese;titolo proposto;H2 da coprire;pagina esistente più vicina;motivo', `CSV brief: intestazione con le colonne della specifica, ${lines.length - 1} righe`)
  ok(D.toCsv([{ query: 'a;b "c"', impressions: 1, position: 2, lostClicksMonth: 3, proposedTitle: 'x', h2: ['u', 'v'], closestPage: null, why: 'w' }], D.LIST_COLUMNS.brief).includes('"a;b ""c"""'), 'CSV: separatori e virgolette protetti')
  ok(D.toCsv(L.geo, D.LIST_COLUMNS.geo).split('\r\n').length > 2 && D.toCsv(L.protect, D.LIST_COLUMNS.protect).split('\r\n').length > 2, 'CSV GEO/AEO e «da proteggere» non vuoti')
  ok(D.closestPage('bracciale cadute anziani', pages)?.url.includes('bracciale-cadute') === true && D.closestPage('zzz qqq', pages) === null, 'pagina più vicina per sovrapposizione di parole; nessuna pagina inventata se non c\'è corrispondenza')

  const projBase = { totalLeads: 67, adsAttributedLeads: 6, periodDays: 84, ads: { min: { leads: 4, budgetMonth: 60 }, max: { leads: 9, budgetMonth: 120 } }, adsBasis: 'stimato' as const }
  const stable = D.projectMultiplier({ ...projBase, previousMonths: [{ month: '2026-08', organicLeads: 20, days: 31 }, { month: '2026-09', organicLeads: 21, days: 30 }] })
  ok(stable.available && stable.label === 'proiezione, non previsione', `etichetta «${stable.label}»`)
  ok(stable.formula!.length === 6 && stable.formula![0].value === '67 − 6 = 61' && /61 \/ 84/.test(stable.formula![1].value), `formula visibile: ${stable.formula![0].value}; ${stable.formula![1].value}`)
  ok(stable.formula!.filter((f: any) => f.n >= 3).every((f: any) => f.basis === 'stimato') && stable.formula![0].basis === 'misurato', 'input non misurati marcati «stimato», lead organici «misurato»')
  ok(stable.organic!.unstable === false && stable.assumptions.length >= 3, 'dato organico stabile (variazione ≤ 30 %): nessun intervallo aggiuntivo')
  const unstable = D.projectMultiplier({ ...projBase, previousMonths: [{ month: '2026-08', organicLeads: 10, days: 31 }, { month: '2026-09', organicLeads: 30, days: 30 }] })
  ok(unstable.organic!.unstable === true && unstable.organic!.perMonth[0] < unstable.organic!.perMonth[1] && unstable.interval === true && unstable.assumptions.some(a => /instabil/.test(a)), `variazione > 30 % tra i due mesi precedenti → intervallo (${unstable.organic!.perMonth.join('–')} lead organici/mese), non un numero singolo`)
  ok(unstable.projectedMonth![0] < unstable.projectedMonth![1], `totale proiettato come intervallo: ${unstable.projectedMonth!.join('–')}`)
  const exact = D.projectMultiplier({ ...projBase, adsBasis: 'misurato', ads: { min: { leads: 6, budgetMonth: 90 }, max: { leads: 6, budgetMonth: 90 } } })
  ok(exact.interval === false && exact.formula![5].value === '15 €', 'con ADS misurato e organico stabile: numero singolo, costo incrementale 90 / 6 = 15 €')
  const nul = D.projectMultiplier({ ...projBase, totalLeads: null })
  ok(!nul.available && /dato non disponibile/.test(String((nul as any).reason)), 'lead CRM non disponibili → «dato non disponibile», non una proiezione costruita su zeri')
  const noPrev = D.projectMultiplier({ ...projBase })
  ok(noPrev.assumptions.some(a => /stabilità .* non verificabile/.test(a)), 'senza i due mesi precedenti la stabilità è dichiarata non verificabile')

  // ── H) Parte C — conversioni offline: solo qualificati, dedup per click ID, valore vuoto se ignoto ─────────
  section('H. Parte C — export conversioni offline (solo lead qualificati)')
  const T0 = Date.parse('2026-10-01T10:00:00Z')
  const mk = (id: string, gclid: string | null, temp: string, status: string, upd: string, extra: any = {}) => ({
    id, gclid, gbraid: null, wbraid: null, click_ts: T0, created_at: '2026-10-01 10:05:00', updated_at: upd,
    prezzo_scontato: null, prezzo_anno: null, ...extra, q: isQualifiedLead(temp, status) ? 1 : 0,
  })
  const leadsDb = [
    mk('L1', 'G-AAA', 'caldo', 'NEW', '2026-10-05 09:00:00', { prezzo_anno: 480 }),
    mk('L2', 'G-BBB', 'freddo', 'NEW', '2026-10-06 09:00:00'),                       // NON qualificato
    mk('L3', 'G-CCC', '', 'CONTRACT_SIGNED', '2026-10-07 09:00:00', { prezzo_scontato: 399, prezzo_anno: 480 }),
    mk('L4', 'G-AAA', 'tiepido', 'NEW', '2026-10-02 09:00:00', { prezzo_anno: 480 }), // stesso gclid di L1, data più vecchia
    mk('L5', 'G-DDD', 'tiepido', 'NEW', '2026-10-08 09:00:00'),                       // qualificato, prezzo ignoto
    mk('L6', 'G-EEE', '', 'LEAD', '2026-10-09 09:00:00'),                             // NON qualificato
  ]
  let lastSql = ''
  const exDb = (leadCount: number) => ({
    prepare(sql: string) {
      if (/pragma_table_info/.test(sql)) return { all: async () => ({ results: [{ name: 'prezzo_anno' }, { name: 'prezzo_scontato' }] }) }
      const q: any = {
        bind() { return q },
        all: async () => { lastSql = sql; return { results: leadsDb } },
        first: async () => ({ n: leadCount }),
      }
      return q
    },
  })
  const qOnly = await CV.loadConversionExport(exDb(40), { kind: 'gclid', giorni: 90 })
  const csvLines = (x: string) => x.split('\n')
  const body = csvLines(qOnly.csv).slice(2)
  ok(lastSql.includes(qualifiedSql()), 'la query usa qualifiedSql() (stessa definizione di report e Hub, nessuna seconda copia)')
  ok(!/IN \('CONTRACT_SIGNED','SIGNED'|PAYMENT_RECEIVED|ATTIVO/.test(CV.buildConversionCsv.toString() + CV.loadConversionExport.toString()), 'nessuna lista di stati scritta a mano nel modulo conversioni')
  ok(body.length === 3 && body.every(l => /^G-(AAA|CCC|DDD),/.test(l)), `predefinito: solo qualificati (${body.length} righe: ${body.map(l => l.split(',')[0]).join(', ')})`)
  ok(!body.some(l => /G-BBB|G-EEE/.test(l)), 'nessun lead non qualificato nel CSV predefinito')
  ok(new Set(body.map(l => l.split(',')[0])).size === body.length, 'nessun gclid duplicato')
  const aaa = qOnly.rows.find(r => r.clickId === 'G-AAA')!
  ok(aaa.leadId === 'L4' && fmtDate(aaa.convMs) === '2026-10-02', 'gclid duplicato: vince la data più vecchia (L4, 02/10)')
  const bySrc = Object.fromEntries(body.map(l => l.split(',')).map(a => [a[0], a]))
  ok(bySrc['G-AAA'][3] === '480.00' && bySrc['G-CCC'][3] === '399.00', 'valore = prezzo del piano (scontato se presente, altrimenti annuo)')
  ok(bySrc['G-DDD'][3] === '' && bySrc['G-DDD'][4] === '', 'prezzo ignoto → valore e valuta VUOTI (nessun 29,90 inventato)')
  ok(!/29[.,]90/.test(qOnly.csv), 'nessun valore fisso predefinito nel CSV')
  ok(csvLines(qOnly.csv)[0] === 'Parameters:TimeZone=+0000' && csvLines(qOnly.csv)[1] === 'Google Click ID,Conversion Name,Conversion Time,Conversion Value,Conversion Currency', 'intestazione nel formato Google Ads')
  ok(qOnly.fileName === 'ecura-offline-conversions-gclid_qualificati_3.csv', `Content-Disposition con il conteggio: ${qOnly.fileName}`)
  ok(qOnly.qualified === 3 && qOnly.withClickId === 5 && qOnly.leadsPeriod === 40, `conteggio UI «${qOnly.qualified} qualificati con click ID su ${qOnly.withClickId}» (lead del periodo ${qOnly.leadsPeriod})`)
  ok(qOnly.qualified === body.length, 'il conteggio mostrato in UI coincide con le righe del CSV')
  ok(body.every(l => { const t = l.split(',')[2]; return Date.parse(t.replace(' ', 'T').replace('+00:00', 'Z')) > T0 }), 'ora di conversione sempre successiva al click')
  const allEx = await CV.loadConversionExport(exDb(40), { kind: 'gclid', giorni: 90, tutti: true })
  const allBody = csvLines(allEx.csv).slice(2)
  ok(allBody.length === 5 && /G-BBB/.test(allEx.csv) && /G-EEE/.test(allEx.csv), `?tutti=1: export completo (${allBody.length} righe, include non qualificati)`)
  ok(allEx.fileName === 'ecura-offline-conversions-gclid_tutti_5.csv', `nome file «tutti» con conteggio: ${allEx.fileName}`)
  ok(allEx.qualified === 3 && allEx.withClickId === 5, 'in modalità «tutti» il conteggio dei qualificati resta 3 su 5')
  ok(CV.parseUploadDate('2026-10-12', new Date('2026-10-14T00:00:00Z')) === '2026-10-12' && CV.parseUploadDate('2026-13-45') === null && CV.parseUploadDate('12/10/2026') === null && CV.parseUploadDate('2099-01-01') === null, 'data ultimo upload: solo AAAA-MM-GG valida e non nel futuro')
  // settings: la data è salvata come inserita, non calcolata
  const store = new Map<string, string>()
  const setDb = { prepare(sql: string) { let a: any[] = []; const q: any = { bind(...x: any[]) { a = x; return q }, run: async () => { if (/INSERT INTO settings/.test(sql)) store.set(a[0], a[1]); return {} }, first: async () => (store.has(a[0]) ? { value: store.get(a[0]), updated_at: '2026-10-14 10:00:00' } : null) }; return q } }
  ok((await CV.loadLastUpload(setDb)) === null, 'nessuna data salvata → riga «nessuna data registrata», non una data inventata')
  await CV.saveLastUpload(setDb, '2026-10-12')
  const lu = await CV.loadLastUpload(setDb)
  ok(!!lu && lu.date === '2026-10-12' && store.has(CV.LAST_UPLOAD_KEY), 'ultimo upload salvato in settings e riletto')
  const studioSrc = renderGoogleAdsStudio()
  ok(/lead qualificati con click ID su/.test(studioSrc) && /ultimo upload di conversioni/i.test(studioSrc) && /NON qualificati/.test(studioSrc), 'UI Hub: conteggio «N qualificati su M», riga «ultimo upload di conversioni» e avviso per «tutti»')
}
