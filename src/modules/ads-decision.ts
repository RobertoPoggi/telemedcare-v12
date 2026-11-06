// ============================================================
//  ADS DECISION — Marketing Hub eCura: gestione ADS guidata dai dati SEO
//  Logica pura (nessun accesso a env/DB/rete): classificazione delle query (Parte 2), ottimizzatore di budget (Parte 3),
//  ciclo di vita (Parte 4), misurazione su lead qualificati e soglie di stop (Parte 5), «Decisioni di oggi» (Parte 6),
//  liste operative verso SEO/GEO e proiezione del moltiplicatore (Parte 7).
//  Si AGGIUNGE sopra ads-engine.ts: lintPlan, buildEditorCsv, forecast, gscOpportunities, analyzeSearchTerms non sono toccati.
//  Nessuna azione in scrittura su Google Ads: l'ottimizzatore PROPONE, l'approvazione resta umana.
//  Stimato e misurato non si confondono mai: ogni grandezza porta `basis: 'misurato' | 'stimato'`.
// ============================================================
import * as E from './ads-engine'
import { QUALIFIED_LEAD } from './seo-report-engine'

export const DAYS_PER_MONTH = 30.4

// ── Costanti documentate (nessun valore sparso nel codice) ────────────────────────────────────────────────
/** CTR_target: quota di impressioni che diventa clic quando si presidia la query.
 *  Fino a pos. 3: 0,28 (valore della specifica, stesso usato da gscOpportunities). Oltre: curva DECRESCENTE, ASSUNZIONE tipica di settore
 *  (non misurata su eCura): va verificata con i dati reali e resta sempre elencata tra le assunzioni. */
export const CTR_TARGET = {
  upTo3: 0.28,
  curve: [{ maxPos: 5, ctr: 0.10 }, { maxPos: 10, ctr: 0.06 }, { maxPos: 20, ctr: 0.025 }, { maxPos: Infinity, ctr: 0.01 }],
}
export function ctrTarget(position: number): number {
  const rank = Math.round(position)
  if (rank <= 3) return CTR_TARGET.upTo3
  return (CTR_TARGET.curve.find(c => rank <= c.maxPos) || CTR_TARGET.curve[CTR_TARGET.curve.length - 1]).ctr
}

export const THRESHOLDS = {
  organicWinsMaxPos: 3,      // posizione organica ≤ 3 → NO_ADS_ORGANIC_WINS (la posizione media si arrotonda al rango intero)
  oppMaxPos: 20,             // 4-20 con ≥ oppMinImpr impressioni → ADS_OPPORTUNITY
  oppMinImpr: 50,
  testMinImpr: 100,          // > 20 con ≥ testMinImpr impressioni → ADS_TEST; altrimenti SEO_ONLY
  testShare: 0.35,           // quota coperta di un bucket ADS_TEST (1 per ADS_OPPORTUNITY)
  briefMinImpr: 10,          // liste operative: sotto questo volume una query non entra nel brief (rumore di coda lunga)
  geoMinImpr: 20,            // NEGATIVE «con volume»: impressioni minime per generare un'azione GEO/AEO
}
/** Assunzioni di default, SEMPRE dichiarate nell'output con il loro effetto. */
export const DEFAULTS = {
  cr: 0.03,                  // clic → lead qualificato: ASSUNZIONE (estremo basso della previsione già in uso, POST /forecast) finché non ci sono 10 lead qualificati con click ID
  crRange: [0.03, 0.05] as [number, number],    // intervallo della proiezione quando cr non è misurato (stesso intervallo di POST /forecast)
  cpc: 0.70,                 // CPC reale/di mercato: CPC massimo del piano «Primo lancio» (nessun dato di mercato: niente SEMrush/Ahrefs)
  maxCpl: 15,                // costo massimo per lead qualificato: estremo alto dell'obiettivo 12-15 € del piano
  seoCostPerLead: 20,        // costo implicito stimato di un lead ottenuto via contenuto SEO: ASSUNZIONE da verificare
  leadInstability: 0.3,      // variazione dei lead organici/giorno tra i due mesi precedenti oltre la quale la proiezione mostra un intervallo
}
export const STOP = {
  qcplFactor: 1.3, qcplMinQualified: 10,          // QCPL > maxCpl × 1,3 su ≥ 10 lead qualificati → fermare il bucket
  minQualificationRate: 0.10, rateMinLeads: 15,   // qualificazione < 10% su ≥ 15 lead → query fuori target
  zeroQualifiedClicks: 40,                        // 0 lead qualificati dopo 40 clic → spegnere l'esperimento
}
export const MIN_SAMPLE = QUALIFIED_LEAD.minSample
export const insufficientData = (n: number) => `dati insufficienti: ${n}/${MIN_SAMPLE}`

// ═══════════════ PARTE 2 — classificatore query → bucket con motivazione ═══════════════
export type Decision = 'NO_ADS_BRAND' | 'NO_ADS_ORGANIC_WINS' | 'ADS_OPPORTUNITY' | 'ADS_TEST' | 'SEO_ONLY' | 'NEGATIVE'
export const DECISIONS: Decision[] = ['NO_ADS_BRAND', 'NO_ADS_ORGANIC_WINS', 'ADS_OPPORTUNITY', 'ADS_TEST', 'SEO_ONLY', 'NEGATIVE']
export interface GscQuery { query: string; clicks: number; impressions: number; position: number }
export interface QueryItem {
  query: string; position: number; impressions: number; clicks: number
  decision: Decision; reason: string; lostClicksEstimate: number
}
const norm = (q: string) => String(q || '').toLowerCase().replace(/[’`´]/g, "'").replace(/\s+/g, ' ').trim()
const BRAND_RE = /(^|[^a-z0-9])e[\s-]?cura([^a-z0-9]|$)/          // ecura, e cura, e-cura
const INFO_PATTERNS = ["come funziona", "cos'è", "cos'e", 'cos è', 'cosè', 'cosa è', 'sintomi', 'quando', 'differenza']
export const isBrandQuery = (q: string) => BRAND_RE.test(norm(q))
export function isInformational(q: string): string | null {
  const n = norm(q)
  for (const p of INFO_PATTERNS) {
    const i = n.indexOf(p)
    if (i < 0) continue
    const before = i === 0 ? '' : n[i - 1], after = n[i + p.length] || ''
    if (!/[a-zà-ù0-9]/.test(before) && !/[a-zà-ù0-9]/.test(after)) return p
  }
  return null
}

/** Una voce per query. Ordine delle regole: marca → informativa → organico già sopra → opportunità → test → solo SEO. */
export function classifyQuery(q: GscQuery): QueryItem {
  const pos = Number(q.position) || 0, impr = Number(q.impressions) || 0, clicks = Number(q.clicks) || 0
  const rank = Math.round(pos)
  const base = { query: q.query, position: Math.round(pos * 10) / 10, impressions: impr, clicks }
  const lost = () => Math.max(0, Math.round(impr * (ctrTarget(pos) - (impr > 0 ? clicks / impr : 0))))
  const info = isInformational(q.query)
  if (isBrandQuery(q.query)) return { ...base, decision: 'NO_ADS_BRAND', reason: `query di marca eCura: l'organico è in pos. ${base.position}, pagarla è costo puro`, lostClicksEstimate: 0 }
  if (info) return { ...base, decision: 'NEGATIVE', reason: `intento informativo («${info}»): consuma budget senza portare lead`, lostClicksEstimate: 0 }
  if (rank <= THRESHOLDS.organicWinsMaxPos) return { ...base, decision: 'NO_ADS_ORGANIC_WINS', reason: `posizione organica ${base.position} (≤ ${THRESHOLDS.organicWinsMaxPos}): sei già sopra tutti`, lostClicksEstimate: 0 }
  if (rank <= THRESHOLDS.oppMaxPos && impr >= THRESHOLDS.oppMinImpr) return { ...base, decision: 'ADS_OPPORTUNITY', reason: `pos. ${base.position} con ${impr} impressioni: l'organico perde clic recuperabili`, lostClicksEstimate: lost() }
  if (rank > THRESHOLDS.oppMaxPos && impr >= THRESHOLDS.testMinImpr) return { ...base, decision: 'ADS_TEST', reason: `pos. ${base.position} (> ${THRESHOLDS.oppMaxPos}) con ${impr} impressioni: solo test con CPC stretto e budget limitato`, lostClicksEstimate: lost() }
  if (rank > THRESHOLDS.oppMaxPos) return { ...base, decision: 'SEO_ONLY', reason: `pos. ${base.position} (> ${THRESHOLDS.oppMaxPos}) con ${impr} impressioni (< ${THRESHOLDS.testMinImpr}): serve contenuto, non budget`, lostClicksEstimate: lost() }
  // pos. 4-20 sotto la soglia di volume: la specifica non prevede questa casella → trattata come SEO_ONLY e dichiarata nelle assunzioni
  return { ...base, decision: 'SEO_ONLY', reason: `pos. ${base.position} ma solo ${impr} impressioni (< ${THRESHOLDS.oppMinImpr}): volume troppo basso per comprarla, serve contenuto`, lostClicksEstimate: lost() }
}
export function classifyQueries(rows: GscQuery[]): QueryItem[] {
  return rows.filter(r => r && r.query).map(classifyQuery).sort((a, b) => b.impressions - a.impressions)
}
export function countByDecision(items: QueryItem[]): Record<Decision, number> {
  const out = Object.fromEntries(DECISIONS.map(d => [d, 0])) as Record<Decision, number>
  for (const i of items) out[i.decision]++
  return out
}

/** Guardrail BLOCCANTE: una NEGATIVE che contiene una keyword attiva (o che una keyword attiva contiene) ucciderebbe una keyword pagata. */
export interface Collision { negative: string; keyword: string; plan: string; level: 'error'; msg: string }
export function negativeCollisions(negatives: string[], activeKeywords: { text: string; plan: string }[]): Collision[] {
  const out: Collision[] = []
  for (const neg of negatives) for (const k of activeKeywords) {
    if (E.phraseContained(k.text, neg) || E.phraseContained(neg, k.text))
      out.push({ negative: neg, keyword: k.text, plan: k.plan, level: 'error', msg: `la negativa «${neg}» colpisce la keyword attiva «${k.text}» del piano «${k.plan}»: spegnerebbe una keyword pagata` })
  }
  return out
}

// ═══════════════ PARTE 3 — ottimizzatore di budget giornaliero ═══════════════
export interface OptimizeInput {
  targetQualifiedLeads: number; maxCpl: number; budgetCap?: number | null   // budgetCap in €/mese
  cr: number; crSource: 'misurato' | 'assunzione'
  cpc: number; cpcSource: 'inserito' | 'assunzione'
  periodDays: number; items: QueryItem[]
}
export interface Bucket {
  query: string; decision: Decision; position: number; impressionsMonth: number; share: number
  clicksAvailable: number; leadsExpected: number; cpcEstimated: number; cpcCapped: boolean; cost: number; qcplEstimated: number | null
  allocatedFraction: number; allocatedClicks: number; allocatedLeads: number; allocatedCost: number
}
export interface Step { n: number; title: string; formula: string; result: string }
const r1 = (x: number) => Math.round(x * 10) / 10, r2 = (x: number) => Math.round(x * 100) / 100

function plan(buckets: Bucket[], targetLeads: number, cap: number | null): { picked: Map<Bucket, number>; leads: number; cost: number; limitedBy: 'target' | 'budgetCap' | 'domanda' } {
  const picked = new Map<Bucket, number>(); let leads = 0, cost = 0, limitedBy: 'target' | 'budgetCap' | 'domanda' = 'domanda'
  const order = [...buckets].filter(b => b.leadsExpected > 0 && b.cost > 0).sort((a, b) => b.leadsExpected / b.cost - a.leadsExpected / a.cost)
  for (const b of order) {
    const remLeads = targetLeads - leads, remBudget = cap == null ? Infinity : cap - cost
    if (remLeads <= 0) { limitedBy = 'target'; break }
    if (remBudget <= 0) { limitedBy = 'budgetCap'; break }
    let f = Math.min(1, remLeads / b.leadsExpected, remBudget / b.cost)
    if (f <= 0) continue
    const l = Math.floor(b.leadsExpected * f + 1e-9)
    if (l <= 0) { if (remBudget / b.cost < 1) { limitedBy = 'budgetCap'; break } continue }
    // la frazione si ricalcola sui lead interi allocati: mai più budget del necessario
    f = Math.min(f, l / b.leadsExpected)
    picked.set(b, f); leads += l; cost += b.cost * f
    if (leads >= targetLeads) { limitedBy = 'target'; break }
  }
  return { picked, leads, cost, limitedBy }
}

function core(inp: OptimizeInput, crOverride?: number) {
  const cr = crOverride ?? inp.cr
  const ceiling = inp.maxCpl * cr
  const cand = inp.items.filter(i => i.decision === 'ADS_OPPORTUNITY' || i.decision === 'ADS_TEST')
  const buckets: Bucket[] = cand.map(i => {
    const share = i.decision === 'ADS_TEST' ? THRESHOLDS.testShare : 1
    const impressionsMonth = inp.periodDays > 0 ? i.impressions * DAYS_PER_MONTH / inp.periodDays : 0
    const clicks = impressionsMonth * ctrTarget(i.position) * share
    const cpcEst = Math.min(ceiling, inp.cpc)
    return {
      query: i.query, decision: i.decision, position: i.position, impressionsMonth, share, clicksAvailable: clicks,
      leadsExpected: Math.floor(clicks * cr), cpcEstimated: cpcEst, cpcCapped: inp.cpc > ceiling, cost: clicks * cpcEst,
      qcplEstimated: cr > 0 ? cpcEst / cr : null, allocatedFraction: 0, allocatedClicks: 0, allocatedLeads: 0, allocatedCost: 0,
    }
  })
  const cap = inp.budgetCap != null && inp.budgetCap > 0 ? inp.budgetCap : null
  const toTarget = plan(buckets, inp.targetQualifiedLeads, cap)
  const maxObt = plan(buckets, Infinity, cap)
  for (const [b, f] of toTarget.picked) { b.allocatedFraction = f; b.allocatedClicks = b.clicksAvailable * f; b.allocatedLeads = Math.floor(b.leadsExpected * f + 1e-9); b.allocatedCost = b.cost * f }
  return { cr, ceiling, buckets, toTarget, maxObt, cap }
}

/** Sette passaggi visibili; il budget giornaliero non è mai più alto del necessario per il target. */
export function optimizeBudget(inp: OptimizeInput) {
  const c = core(inp)
  const allocated = [...c.toTarget.picked.keys()]
  const leadsAlloc = allocated.reduce((s, b) => s + b.allocatedLeads, 0)
  const budgetMonth = allocated.reduce((s, b) => s + b.allocatedCost, 0)
  const budgetDay = budgetMonth / DAYS_PER_MONTH
  const reachable = c.maxObt.leads >= inp.targetQualifiedLeads
  const maxObtainable = c.maxObt.leads
  const missing = reachable ? 0 : inp.targetQualifiedLeads - maxObtainable
  const estimated = inp.crSource !== 'misurato'
  const steps: Step[] = [
    { n: 1, title: 'Soglia di CPC', formula: 'cpcCeiling = maxCpl × cr', result: `${inp.maxCpl} € × ${inp.cr} = ${r2(c.ceiling)} € — oltre questo CPC il canale non sta in piedi` },
    { n: 2, title: 'Clic disponibili per bucket', formula: 'clicDisponibili = impressioni/mese × CTR_target × quotaCoperta  (quota: 1 opportunity, ' + THRESHOLDS.testShare + ' test)', result: `${c.buckets.length} bucket (ADS_OPPORTUNITY / ADS_TEST); totale ${Math.round(c.buckets.reduce((s, b) => s + b.clicksAvailable, 0))} clic/mese; impressioni normalizzate al mese (${DAYS_PER_MONTH} giorni)` },
    { n: 3, title: 'Lead attesi (per difetto)', formula: 'leadAttesi = floor(clicDisponibili × cr)', result: `totale ${c.buckets.reduce((s, b) => s + b.leadsExpected, 0)} lead qualificati/mese su tutti i bucket (arrotondati per difetto: meglio sottostimare)` },
    { n: 4, title: 'Costo per bucket', formula: 'costoBucket = clicDisponibili × cpcStimato;  cpcStimato = min(cpcCeiling, CPC di mercato)', result: `CPC di mercato usato: ${inp.cpc} € (${inp.cpcSource}); ${c.buckets.filter(b => b.cpcCapped).length} bucket con CPC di mercato oltre la soglia: acquistabili solo se l'asta lo consente (stima ottimistica)` },
    { n: 5, title: 'Allocazione a riempimento progressivo', formula: 'ordina per leadAttesi / costo decrescente; assegna finché target coperto o budgetCap raggiunto', result: `${allocated.length} bucket assegnati, ${leadsAlloc} lead qualificati/mese, limite: ${c.toTarget.limitedBy === 'target' ? 'target coperto' : c.toTarget.limitedBy === 'budgetCap' ? 'budgetCap raggiunto' : 'domanda disponibile esaurita'}` },
    { n: 6, title: 'Budget giornaliero', formula: `budgetGiornaliero = budgetAllocato / ${DAYS_PER_MONTH}`, result: `${r2(budgetMonth)} € / ${DAYS_PER_MONTH} = ${r2(budgetDay)} €/giorno — il minimo necessario al target, non il massimo disponibile` },
    { n: 7, title: 'Target raggiungibile?', formula: 'somma lead attesi ≥ target', result: reachable ? `sì: massimo ottenibile ${maxObtainable} ≥ target ${inp.targetQualifiedLeads}` : `NO — target non raggiungibile: massimo ottenibile ${maxObtainable} lead qualificati/mese, mancano ${missing} (${inp.targetQualifiedLeads})` },
  ]
  // assunzioni con il loro effetto sul risultato (sensibilità calcolata, non scritta a mano)
  const low = core(inp, inp.cr / 2)
  const qcplNow = inp.cr > 0 ? Math.min(c.ceiling, inp.cpc) / inp.cr : null
  const qcplPlus = inp.cr > 0 ? Math.min(c.ceiling, inp.cpc * 1.3) / inp.cr : null
  const assumptions = [
    { name: 'cr (clic → lead qualificato)', value: inp.cr, source: inp.crSource, effect: `con cr dimezzato (${r2(inp.cr / 2)}) i lead ottenibili scendono da ${maxObtainable} a ${low.maxObt.leads} al mese` },
    { name: 'CPC di mercato', value: inp.cpc, source: inp.cpcSource === 'inserito' ? 'inserito dall\'utente (CPC reale)' : 'assunzione (CPC massimo del piano Primo lancio, nessun dato di mercato)', effect: `con CPC +30% il QCPL stimato passa da ${qcplNow == null ? 'n.d.' : r2(qcplNow)} € a ${qcplPlus == null ? 'n.d.' : r2(qcplPlus)} € (invariato se il CPC resta sopra la soglia: il tetto è la soglia)` },
    { name: 'CTR_target oltre pos. 3', value: CTR_TARGET.curve.map(x => `≤${x.maxPos === Infinity ? '∞' : x.maxPos}: ${x.ctr}`).join(' · '), source: 'assunzione tipica di settore (fino a pos. 3: ' + CTR_TARGET.upTo3 + ' da specifica)', effect: 'i clic disponibili sono proporzionali: CTR_target −20% = clic −20% e lead attesi in proporzione' },
    { name: 'quota coperta ADS_TEST', value: THRESHOLDS.testShare, source: 'specifica', effect: 'riduce i clic delle query oltre pos. 20 al 35%: test, non copertura piena' },
    { name: 'budgetCap', value: c.cap ?? 'non indicato', source: c.cap == null ? 'nessun tetto' : 'inserito (€/mese)', effect: c.cap == null ? 'senza tetto il budget è determinato solo dal target' : `limita la spesa mensile a ${c.cap} €` },
    { name: 'caselle senza regola', value: 'pos. 4-20 con < ' + THRESHOLDS.oppMinImpr + ' impressioni', source: 'decisione di implementazione', effect: 'classificate SEO_ONLY (volume troppo basso per comprarle): non entrano nell\'ottimizzatore' },
  ]
  return {
    input: { targetQualifiedLeads: inp.targetQualifiedLeads, maxCpl: inp.maxCpl, budgetCap: c.cap, cr: inp.cr, cpc: inp.cpc, periodDays: inp.periodDays },
    estimate: estimated ? 'stima da verificare' : 'cr misurato sui dati',
    basis: estimated ? 'stimato' : 'misurato',
    steps,
    buckets: c.buckets.sort((a, b) => (b.leadsExpected / Math.max(b.cost, 1e-9)) - (a.leadsExpected / Math.max(a.cost, 1e-9))).map(b => ({
      query: b.query, decision: b.decision, position: b.position, clicks: Math.round(b.clicksAvailable), leadsExpected: b.leadsExpected,
      cost: r2(b.cost), qcplEstimated: b.qcplEstimated == null ? null : r2(b.qcplEstimated), cpcCapped: b.cpcCapped,
      allocated: b.allocatedFraction > 0, allocatedLeads: b.allocatedLeads, allocatedCost: r2(b.allocatedCost),
    })),
    totals: { leads: leadsAlloc, budgetMonth: r2(budgetMonth), budgetDay: r2(budgetDay), qcpl: leadsAlloc > 0 ? r2(budgetMonth / leadsAlloc) : null, limitedBy: c.toTarget.limitedBy },
    reachable, maxObtainable, missing,
    verdict: reachable ? `target raggiungibile: ${r2(budgetDay)} €/giorno` : `target non raggiungibile: massimo ottenibile ${maxObtainable} lead qualificati/mese (mancano ${missing})`,
    assumptions,
  }
}
export type OptimizeResult = ReturnType<typeof optimizeBudget>

// ═══════════════ PARTE 4 — ciclo di vita + import del report di Google Ads ═══════════════
export type PlanState = 'draft' | 'approved' | 'exported' | 'running' | 'paused' | 'archived'
export const PLAN_STATES: PlanState[] = ['draft', 'approved', 'exported', 'running', 'paused', 'archived']
/** Cosa vede il Marketing e quali azioni ha in ciascuno stato (tabella della specifica). «approva» e «metti in pausa» sono le due
 *  transizioni che la tabella richiede implicitamente (senza «approva» non si arriva ad `approved`, senza «pausa» non si arriva a `paused`). */
export const LIFECYCLE: Record<PlanState, { label: string; sees: string; actions: string[] }> = {
  draft:    { label: 'Bozza',      sees: 'bozza generata da query SEO o da pagina',           actions: ['modifica', 'valida', 'approva', 'elimina'] },
  approved: { label: 'Approvata',  sees: 'superato il lint senza errori',                    actions: ['esporta', 'revoca'] },
  exported: { label: 'Esportata',  sees: 'CSV scaricato, da caricare in Google Ads Editor',   actions: ['attiva'] },
  running:  { label: 'Attiva',     sees: 'attiva su Google Ads: si inseriscono i dati reali', actions: ['importa', 'spesa', 'pausa'] },
  paused:   { label: 'In pausa',   sees: 'fermata per soglia o decisione',                   actions: ['riprendi', 'archivia'] },
  archived: { label: 'Archiviata', sees: 'chiusa, resta nello storico',                      actions: ['duplica'] },
}
/** Azioni che CAMBIANO stato. `modifica` (draft→draft, o approved/exported→draft) e `elimina` sono gestite a parte ma sempre registrate. */
export const TRANSITIONS: Record<string, { from: PlanState[]; to: PlanState }> = {
  approva:  { from: ['draft'],    to: 'approved' },
  revoca:   { from: ['approved'], to: 'draft' },
  esporta:  { from: ['approved'], to: 'exported' },
  attiva:   { from: ['exported'], to: 'running' },
  pausa:    { from: ['running'],  to: 'paused' },
  riprendi: { from: ['paused'],   to: 'running' },
  archivia: { from: ['paused'],   to: 'archived' },
}
export function isPlanState(s: any): s is PlanState { return PLAN_STATES.includes(s) }
export function transition(action: string, from: string): { ok: true; to: PlanState } | { ok: false; error: string } {
  const t = TRANSITIONS[action]
  if (!t) return { ok: false, error: `azione «${action}» sconosciuta` }
  if (!isPlanState(from)) return { ok: false, error: `stato «${from}» sconosciuto` }
  if (!t.from.includes(from as PlanState)) return { ok: false, error: `«${action}» non è disponibile nello stato «${LIFECYCLE[from as PlanState].label}» (disponibile da: ${t.from.map(f => LIFECYCLE[f].label).join(', ')}). Azioni possibili ora: ${LIFECYCLE[from as PlanState].actions.join(', ')}` }
  return { ok: true, to: t.to }
}
export const canModify = (from: string) => from === 'draft' || from === 'approved' || from === 'exported'

export interface ReportRow { campaign: string; search_term: string; impressions: number; clicks: number; cost: number; conversions: number }
export interface ParsedReport {
  ok: boolean; error: string | null; kind: 'search_terms' | 'campaigns' | null
  rows: ReportRow[]; totals: { rows: number; impressions: number; clicks: number; cost: number; conversions: number } | null
  analysis: ReturnType<typeof E.analyzeSearchTerms> | null; warnings: string[]
}
/** Colonne a valore intero (Impr., Clic): punti e virgole sono sempre separatori delle migliaia. */
const integerCount = (raw: string): number => {
  const t = String(raw ?? '').replace(/[^\d]/g, '')
  return t ? parseInt(t, 10) : 0
}
const fail = (error: string): ParsedReport => ({ ok: false, error, kind: null, rows: [], totals: null, analysis: null, warnings: [] })
/** Import del CSV di Google Ads (campagne o termini di ricerca). Nessuna API: il file lo scarica il Marketing.
 *  Per i termini di ricerca l'analisi delle negative è E.analyzeSearchTerms (riusata, non duplicata). */
export function parseAdsReport(csvRaw: string, minClicks = 15): ParsedReport {
  const csv = String(csvRaw || '')
  if (csv.trim().length < 10) return fail('File vuoto o troppo corto: scarica il report da Google Ads (Campagne o Termini di ricerca → Scarica → CSV) e caricalo di nuovo')
  if (/[\u0000-\u0008\u000e-\u001f]/.test(csv.slice(0, 2000))) return fail('Il file non è un CSV di testo (sembra un file binario, ad esempio un .xlsx): in Google Ads scegli «Scarica → .csv»')
  let rows: string[][]
  try { rows = E.parseCsv(csv) } catch (_) { return fail('CSV non leggibile: controlla che il file non sia stato modificato') }
  const isHead = (r: string[]) => r.some(c => /^(search term|termine di ricerca|query|campaign|campagna)$/i.test(c.trim()))
  const hi = rows.findIndex(isHead)
  if (hi < 0) return fail('Intestazione non riconosciuta: servono le colonne «Campagna» (Campaign) oppure «Termine di ricerca» (Search term), più Impr., Clic, Costo, Conversioni')
  const head = rows[hi].map(c => c.trim().toLowerCase())
  const col = (re: RegExp) => head.findIndex(h => re.test(h))
  const iT = col(/^(search term|termine di ricerca|query)$/), iCamp = col(/^(campaign|campagna)$/)
  const iI = col(/^(impr\.?|impressions|impressioni)$/), iC = col(/^(clicks|clic|click)$/)
  const iCost = col(/^(cost|costo)(\s*\(.*\))?$/), iConv = col(/^(conversions|conversioni|conv\.)$/)
  const found = [iI, iC, iCost, iConv].filter(i => i >= 0).length
  if (found < 2) return fail('Mancano le colonne dei numeri: servono almeno due tra Impr., Clic, Costo, Conversioni (trovate: ' + head.filter(Boolean).join(', ') + ')')
  const kind: ParsedReport['kind'] = iT >= 0 ? 'search_terms' : 'campaigns'
  const out: ReportRow[] = []; const warnings: string[] = []; let skipped = 0
  for (const r of rows.slice(hi + 1)) {
    const name = ((kind === 'search_terms' ? r[iT] : r[iCamp]) || '').trim()
    if (!name || /^(total|totale)\b/i.test(name) || /^(total|totale)\b/i.test((r[0] || '').trim())) continue
    if (r.length < Math.max(iI, iC, iCost, iConv) + 1) { skipped++; continue }
    const n = (i: number) => (i >= 0 ? E.parseNum(r[i]) : 0)
    // impressioni e clic sono interi: in un CSV italiano «1.200» = milleduecento, non 1,2 (parseNum lo leggerebbe come decimale)
    const cnt = (i: number) => (i >= 0 ? integerCount(r[i]) : 0)
    out.push({ campaign: iCamp >= 0 ? (r[iCamp] || '').trim() : '', search_term: kind === 'search_terms' ? name : '', impressions: cnt(iI), clicks: cnt(iC), cost: n(iCost), conversions: n(iConv) })
  }
  if (skipped) warnings.push(`${skipped} righe ignorate perché hanno meno colonne dell'intestazione (CSV troncato o modificato)`)
  if (!out.length) return fail('Nessuna riga di dati dopo l\'intestazione: il file contiene solo titoli o totali')
  if (iI < 0) warnings.push('colonna Impressioni assente: impressioni = 0')
  if (iC < 0) warnings.push('colonna Clic assente: clic = 0')
  if (iCost < 0) warnings.push('colonna Costo assente: costo = 0, il QCPL non sarà calcolabile')
  if (iConv < 0) warnings.push('colonna Conversioni assente: conversioni = 0')
  const sum = (f: (r: ReportRow) => number) => out.reduce((s, r) => s + f(r), 0)
  const totals = { rows: out.length, impressions: sum(r => r.impressions), clicks: sum(r => r.clicks), cost: Math.round(sum(r => r.cost) * 100) / 100, conversions: sum(r => r.conversions) }
  const analysis = kind === 'search_terms' ? E.analyzeSearchTerms(csv, minClicks) : null
  if (analysis && analysis.error) return fail(analysis.error)
  return { ok: true, error: null, kind, rows: out, totals, analysis, warnings }
}

// ═══════════════ PARTE 5 — misurazione su lead qualificati, soglie di stop (solo raccomandazioni) ═══════════════
export interface PerfInput { campaign: string; leads: number; qualified: number; clicks: number | null; spend: number | null }
export interface Measured extends PerfInput {
  qualificationRate: number | null      // frazione 0-1; null sotto il campione minimo
  qcpl: number | null                   // spesa / lead qualificati; null sotto il campione minimo o senza spesa
  note: string | null                   // «dati insufficienti: N/10» oppure motivo per cui manca un numero
  basis: 'misurato'
}
const num2 = (x: number) => Math.round(x * 100) / 100
export function measure(p: PerfInput): Measured {
  const enough = p.qualified >= MIN_SAMPLE
  const rate = enough && p.leads > 0 ? p.qualified / p.leads : null
  const qcpl = enough && p.spend != null && p.spend > 0 ? num2(p.spend / p.qualified) : null
  const note = !enough ? insufficientData(p.qualified) : p.spend == null || p.spend <= 0 ? 'spesa non indicata: QCPL non calcolabile' : null
  return { ...p, qualificationRate: rate == null ? null : Math.round(rate * 1000) / 1000, qcpl, note, basis: 'misurato' }
}
export interface StopRec { rule: 'QCPL' | 'RATE' | 'ZERO_QUALIFIED' | 'SEO_CHEAPER'; campaign: string; action: string; text: string; numbers: Record<string, number> }
/** Le 4 soglie della specifica. Ognuna scatta SOLO sul proprio campione minimo (10 qualificati / 15 lead / 40 clic).
 *  RATE e ZERO_QUALIFIED hanno per costruzione meno di 10 qualificati: i numeri nel testo sono CONTEGGI, mai percentuali. */
export function stopRecommendations(rows: Measured[], o: { maxCpl: number; seoCostPerLead: number }): StopRec[] {
  const out: StopRec[] = []
  const limit = num2(o.maxCpl * STOP.qcplFactor)
  for (const m of rows) {
    if (m.qualified >= STOP.qcplMinQualified && m.qcpl != null && m.qcpl > limit)
      out.push({ rule: 'QCPL', campaign: m.campaign, action: 'fermare il bucket', text: `QCPL ${m.qcpl} € > soglia ${limit} € (${m.qualified} lead qualificati): fermare il bucket`, numbers: { qcpl: m.qcpl, soglia: limit, qualificati: m.qualified } })
    if (m.leads >= STOP.rateMinLeads && m.qualified / m.leads < STOP.minQualificationRate)
      out.push({ rule: 'RATE', campaign: m.campaign, action: 'sposta a SEO o negativa', text: `${m.qualified} lead qualificati su ${m.leads} lead (sotto la quota minima): query fuori target, sposta a SEO o negativa`, numbers: { qualificati: m.qualified, lead: m.leads } })
    if (m.clicks != null && m.clicks >= STOP.zeroQualifiedClicks && m.qualified === 0)
      out.push({ rule: 'ZERO_QUALIFIED', campaign: m.campaign, action: 'spegnere l\'esperimento', text: `0 lead qualificati su ${m.clicks} clic: spegnere l'esperimento`, numbers: { clic: m.clicks, qualificati: 0 } })
    if (m.qualified >= STOP.qcplMinQualified && m.qcpl != null && m.qcpl > o.seoCostPerLead)
      out.push({ rule: 'SEO_CHEAPER', campaign: m.campaign, action: 'conviene investire in contenuto, non in ADS', text: `QCPL ${m.qcpl} € > costo implicito SEO ${o.seoCostPerLead} € (stima dichiarata): conviene investire in contenuto, non in ADS`, numbers: { qcpl: m.qcpl, costoSeo: o.seoCostPerLead } })
  }
  return out
}

// ═══════════════ PARTE 6 — «Decisioni di oggi» ═══════════════
export interface DecisionRow { kind: 'TAGLIA' | 'AUMENTA' | 'NEGATIVA' | 'NON_PAGARE' | 'SERVE_CONTENUTO'; text: string; subject: string; numbers: Record<string, number>; source: string }
export const MAX_DECISIONS = 5
const eur = (x: number) => x.toFixed(2).replace('.', ',')
export function adsQcplEstimate(cpc: number, cr: number): number | null { return cr > 0 ? cpc / cr : null }
export function decisionsOfToday(i: {
  qualifiedTotal: number; measured: Measured[]; stops: StopRec[]; maxCpl: number
  terms: { term: string; clicks: number; conversions: number }[]; convTracked: boolean
  items: QueryItem[]; cpc: number; cr: number; seoCostPerLead: number
}): { rows: DecisionRow[]; insufficient: string | null } {
  if (i.qualifiedTotal < MIN_SAMPLE) return { rows: [], insufficient: `${insufficientData(i.qualifiedTotal)} lead qualificati` }
  const taglia: DecisionRow[] = i.stops.filter(s => s.rule === 'QCPL').map(s => ({ kind: 'TAGLIA' as const, subject: s.campaign, numbers: s.numbers, source: 'Parte 5: soglia QCPL su lead qualificati misurati', text: `Taglia: ${s.campaign} — QCPL ${eur(s.numbers.qcpl)} € > soglia ${eur(s.numbers.soglia)} €` }))
  const aumenta: DecisionRow[] = i.measured.filter(m => m.qcpl != null && m.qualified >= STOP.qcplMinQualified && m.qcpl <= i.maxCpl).map(m => ({ kind: 'AUMENTA' as const, subject: m.campaign, numbers: { qcpl: m.qcpl!, qualificati: m.qualified, target: i.maxCpl }, source: 'Parte 5: QCPL misurato ≤ costo massimo per lead', text: `Aumenta: ${m.campaign} — QCPL ${eur(m.qcpl!)} €, ${m.qualified} lead qualificati, sotto target` }))
  const negativa: DecisionRow[] = !i.convTracked ? [] : i.terms.filter(t => t.conversions === 0 && t.clicks >= STOP.zeroQualifiedClicks).sort((a, b) => b.clicks - a.clicks).map(t => ({ kind: 'NEGATIVA' as const, subject: t.term, numbers: { clic: t.clicks }, source: 'import del report Google Ads: 0 conversioni registrate su questo termine', text: `Negativa: ${t.term} — 0 lead qualificati su ${t.clicks} clic` }))
  const nonPagare: DecisionRow[] = i.items.filter(x => x.decision === 'NO_ADS_ORGANIC_WINS' || x.decision === 'NO_ADS_BRAND').sort((a, b) => b.impressions - a.impressions).map(x => ({ kind: 'NON_PAGARE' as const, subject: x.query, numbers: { posizione: x.position, impressioni: x.impressions }, source: 'Parte 2: posizione organica da Search Console', text: `Non pagare: ${x.query} — organico in posizione ${String(x.position).replace('.', ',')}` }))
  const q = adsQcplEstimate(i.cpc, i.cr)
  const serve: DecisionRow[] = q == null || q <= i.seoCostPerLead ? [] : i.items.filter(x => x.decision === 'ADS_OPPORTUNITY' || x.decision === 'ADS_TEST').sort((a, b) => b.lostClicksEstimate - a.lostClicksEstimate).map(x => ({ kind: 'SERVE_CONTENUTO' as const, subject: x.query, numbers: { posizione: x.position, qcplStimato: num2(q), costoSeo: i.seoCostPerLead }, source: 'stima: CPC / cr contro costo SEO dichiarato (assunzioni, non misure)', text: `Serve contenuto: ${x.query} — pos. ${String(x.position).replace('.', ',')}, ADS non convenienti (QCPL stimato ${eur(q)} € vs SEO ${eur(i.seoCostPerLead)} €)` }))
  // priorità: prima ciò che fa perdere soldi, poi ciò che li fa guadagnare; a rotazione tra i tipi, massimo 5 righe
  const lists = [taglia, negativa, serve, aumenta, nonPagare]; const rows: DecisionRow[] = []
  for (let k = 0; rows.length < MAX_DECISIONS && lists.some(l => k < l.length); k++) for (const l of lists) if (k < l.length && rows.length < MAX_DECISIONS) rows.push(l[k])
  return { rows, insufficient: null }
}

// ═══════════════ PARTE 7 — liste operative verso SEO/GEO, CSV, proiezione del moltiplicatore ═══════════════
const cap1 = (s: string) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s
const STOP_WORDS = new Set(['di', 'a', 'da', 'in', 'con', 'su', 'per', 'il', 'lo', 'la', 'le', 'i', 'gli', 'un', 'una', 'del', 'della', 'dei', 'e', 'o', 'che', 'come', 'cosa', 'quale', 'quali'])
const toks = (s: string) => norm(s).replace(/[^a-z0-9à-ù ]/g, ' ').split(' ').filter(t => t.length > 2 && !STOP_WORDS.has(t))
const stem = (t: string) => t.replace(/[aeio]$/, '')
/** Pagina del sito più vicina alla query (sovrapposizione di parole con lo slug dell'URL). null se nessuna parola coincide. */
export function closestPage(query: string, urls: string[]): { url: string; score: number } | null {
  const q = toks(query).map(stem); let best: { url: string; score: number } | null = null
  for (const u of urls) {
    const path = u.replace(E.SITE, '').toLowerCase()
    const words = path.split(/[^a-z0-9à-ù]+/).filter(Boolean).map(stem)
    const score = q.filter(t => words.some(w => w === t || (t.length > 4 && w.startsWith(t)) || (w.length > 4 && t.startsWith(w)))).length
    if (score > 0 && (!best || score > best.score)) best = { url: u, score }
  }
  return best
}
export interface BriefRow { query: string; impressions: number; position: number; lostClicksMonth: number; why: string; proposedTitle: string; h2: string[]; closestPage: string | null }
export interface GeoRow { query: string; impressions: number; position: number; why: string; suggestedPage: string | null }
export interface ProtectRow { query: string; position: number; impressions: number; clicks: number; kind: 'organico' | 'marca'; rule: string }
const monthly = (x: number, periodDays: number) => periodDays > 0 ? Math.round(x * DAYS_PER_MONTH / periodDays) : 0
export function proposeTitle(query: string): string { return `${cap1(norm(query))}: cosa sapere prima di scegliere` }
export function proposeH2(query: string): string[] {
  const n = norm(query); const h: string[] = [`Che cos'è: ${n}`, 'A chi serve e quando conviene']
  if (/prezz|cost|quanto/.test(n)) h.push('Quanto costa e cosa include')
  if (/bracciale|orolog|dispositiv/.test(n)) h.push('Come funziona il dispositivo')
  if (/cadut|gps|emergenz|sos/.test(n)) h.push('Cosa succede in caso di emergenza')
  h.push('Come attivare il servizio', 'Domande frequenti')
  return h
}
export function buildLists(items: QueryItem[], o: { periodDays: number; cpc: number; cr: number; seoCostPerLead: number; pages: string[] }) {
  const q = adsQcplEstimate(o.cpc, o.cr)
  const adsNotWorth = q != null && q > o.seoCostPerLead
  const briefSrc = items.filter(x => (x.decision === 'SEO_ONLY' && x.impressions >= THRESHOLDS.briefMinImpr) || (adsNotWorth && (x.decision === 'ADS_OPPORTUNITY' || x.decision === 'ADS_TEST')))
  const brief: BriefRow[] = briefSrc.map(x => ({
    query: x.query, impressions: x.impressions, position: x.position, lostClicksMonth: monthly(x.lostClicksEstimate, o.periodDays),
    why: x.decision === 'SEO_ONLY' ? 'SEO_ONLY: oltre pos. 20 o volume troppo basso per comprarla' : `ADS non convenienti: QCPL stimato ${eur(q!)} € > costo SEO ${eur(o.seoCostPerLead)} € (assunzioni)`,
    proposedTitle: proposeTitle(x.query), h2: proposeH2(x.query), closestPage: closestPage(x.query, o.pages)?.url || null,
  })).sort((a, b) => b.lostClicksMonth - a.lostClicksMonth || b.impressions - a.impressions)
  const geo: GeoRow[] = items.filter(x => x.decision === 'NEGATIVE' && x.impressions >= THRESHOLDS.geoMinImpr).map(x => ({
    query: x.query, impressions: x.impressions, position: x.position, why: x.reason, suggestedPage: closestPage(x.query, o.pages)?.url || null,
  })).sort((a, b) => b.impressions - a.impressions)
  const protect: ProtectRow[] = items.filter(x => x.decision === 'NO_ADS_ORGANIC_WINS' || x.decision === 'NO_ADS_BRAND').map(x => ({
    query: x.query, position: x.position, impressions: x.impressions, clicks: x.clicks, kind: x.decision === 'NO_ADS_BRAND' ? 'marca' as const : 'organico' as const,
    rule: x.decision === 'NO_ADS_BRAND' ? 'marca: non pagarla mai; monitorare la posizione' : `se la posizione supera ${THRESHOLDS.organicWinsMaxPos} diventa candidata ADS`,
  })).sort((a, b) => b.impressions - a.impressions)
  return { brief, geo, protect, adsNotWorth, qcplEstimated: q == null ? null : num2(q) }
}
/** CSV con «;» e BOM: si apre correttamente in Excel italiano. */
export function toCsv(rows: Record<string, any>[], cols: { key: string; label: string }[]): string {
  const cell = (v: any) => { const s = Array.isArray(v) ? v.join(' | ') : v == null ? '' : String(v); return /[";\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }
  return '\ufeff' + [cols.map(c => cell(c.label)).join(';'), ...rows.map(r => cols.map(c => cell(r[c.key])).join(';'))].join('\r\n') + '\r\n'
}
export const LIST_COLUMNS = {
  brief: [{ key: 'query', label: 'query' }, { key: 'impressions', label: 'impressioni' }, { key: 'position', label: 'posizione' }, { key: 'lostClicksMonth', label: 'clic persi/mese' }, { key: 'proposedTitle', label: 'titolo proposto' }, { key: 'h2', label: 'H2 da coprire' }, { key: 'closestPage', label: 'pagina esistente più vicina' }, { key: 'why', label: 'motivo' }],
  geo: [{ key: 'query', label: 'query' }, { key: 'impressions', label: 'impressioni' }, { key: 'position', label: 'posizione' }, { key: 'suggestedPage', label: 'pagina suggerita' }, { key: 'why', label: 'motivo' }],
  protect: [{ key: 'query', label: 'query' }, { key: 'kind', label: 'tipo' }, { key: 'position', label: 'posizione' }, { key: 'impressions', label: 'impressioni' }, { key: 'clicks', label: 'clic' }, { key: 'rule', label: 'regola' }],
}

export interface ProjectionInput {
  totalLeads: number | null; adsAttributedLeads: number | null; periodDays: number
  ads: { min: { leads: number; budgetMonth: number }; max: { leads: number; budgetMonth: number } }
  adsBasis: 'misurato' | 'stimato'
  previousMonths?: { month: string; organicLeads: number; days: number }[]   // i due mesi precedenti, in ordine cronologico
}
const range = (a: number, b: number): [number, number] => [Math.min(a, b), Math.max(a, b)]
const r0 = (x: number) => Math.round(x), rr1 = (x: number) => Math.round(x * 10) / 10
/** Proiezione del moltiplicatore: formula visibile, ogni passaggio con valore e base (misurato / stimato). */
export function projectMultiplier(p: ProjectionInput) {
  const label = 'proiezione, non previsione'
  if (p.totalLeads == null || p.adsAttributedLeads == null || !(p.periodDays > 0))
    return { label, available: false, reason: 'dato non disponibile: lead CRM o periodo mancanti (nessuno zero al loro posto)', formula: [] as any[], assumptions: [] as string[] }
  const organic = Math.max(0, p.totalLeads - p.adsAttributedLeads)
  const perDay = organic / p.periodDays
  const prev = (p.previousMonths || []).filter(m => m.days > 0)
  let instability: number | null = null; let perDayRange: [number, number] = [perDay, perDay]
  if (prev.length >= 2) {
    const a = prev[prev.length - 2].organicLeads / prev[prev.length - 2].days, b = prev[prev.length - 1].organicLeads / prev[prev.length - 1].days
    instability = a > 0 ? Math.abs(b - a) / a : (b > 0 ? 1 : 0)
    if (instability > DEFAULTS.leadInstability) perDayRange = range(a, b)
  }
  const unstable = instability != null && instability > DEFAULTS.leadInstability
  const organicMonth = range(perDayRange[0] * DAYS_PER_MONTH, perDayRange[1] * DAYS_PER_MONTH)
  const adsLeads = range(p.ads.min.leads, p.ads.max.leads)
  const projected = range(organicMonth[0] + adsLeads[0], organicMonth[1] + adsLeads[1])
  const incr = range(organicMonth[1] > 0 ? adsLeads[0] / organicMonth[1] : 0, organicMonth[0] > 0 ? adsLeads[1] / organicMonth[0] : 0)
  const cpl = (b: { leads: number; budgetMonth: number }) => b.leads > 0 ? b.budgetMonth / b.leads : null
  const c1 = cpl(p.ads.min), c2 = cpl(p.ads.max)
  const cplRange = c1 != null && c2 != null ? range(c1, c2) : null
  const fm = (r: [number, number], f = rr1) => f(r[0]) === f(r[1]) ? String(f(r[0])) : `${f(r[0])} – ${f(r[1])}`
  const adsB = p.adsBasis
  const formula = [
    { n: 1, label: 'lead organici attuali', formula: 'lead totali − lead attribuiti ad ADS', value: `${p.totalLeads} − ${p.adsAttributedLeads} = ${organic}`, basis: 'misurato' },
    { n: 2, label: 'lead organici/giorno', formula: 'lead organici attuali / giorni del periodo', value: `${organic} / ${p.periodDays} = ${rr1(perDay)}${unstable ? `; intervallo tra i due mesi precedenti: ${fm(perDayRange, x => Math.round(x * 100) / 100)}` : ''}`, basis: 'misurato' },
    { n: 3, label: 'lead ADS attesi/mese', formula: 'da POST /ads/optimize (minimo e massimo)', value: fm(adsLeads, r0), basis: adsB },
    { n: 4, label: 'lead totali proiettati/mese', formula: `(lead organici/giorno × ${DAYS_PER_MONTH}) + lead ADS attesi`, value: `${fm(organicMonth, r0)} + ${fm(adsLeads, r0)} = ${fm(projected, r0)}`, basis: adsB === 'stimato' || unstable ? 'stimato' : 'misurato' },
    { n: 5, label: 'incremento', formula: 'lead ADS attesi / lead organici mensili', value: `${fm(incr, x => Math.round(x * 100) / 100)} (× ${DAYS_PER_MONTH ? 'frazione' : ''} dei lead organici)`.replace(/ \(× frazione.*$/, ' (frazione dei lead organici mensili)'), basis: adsB },
    { n: 6, label: 'costo incrementale per lead', formula: 'budget mensile / lead ADS attesi', value: cplRange ? `${fm(cplRange, x => Math.round(x * 100) / 100)} €` : 'non calcolabile: nessun lead ADS atteso', basis: adsB },
  ]
  const assumptions = [
    adsB === 'stimato' ? 'lead ADS attesi: STIMA (cr e CPC non misurati), si veda l\'elenco delle assunzioni di POST /ads/optimize' : 'lead ADS attesi: calcolati con cr misurato',
    'i lead organici futuri sono assunti pari a quelli del periodo: nessuna crescita, nessuna stagionalità',
    'lead attribuiti ad ADS = canale CRM GOOGLE con fonte google_ads (mappatura univoca del report): un lead ADS con canale non valorizzato risulta «organico»',
  ]
  if (unstable) assumptions.push(`lead organici/giorno instabili tra i due mesi precedenti (variazione ${Math.round(instability! * 100)} %): mostrato l'intervallo, non un numero singolo`)
  else if (prev.length < 2) assumptions.push('stabilità dei lead organici non verificabile: servono due mesi precedenti completi')
  return { label, available: true, formula, organic: { leads: organic, perDay: rr1(perDay), perMonth: organicMonth.map(r0), instability: instability == null ? null : Math.round(instability * 100) / 100, unstable }, adsLeadsMonth: adsLeads, projectedMonth: projected.map(r0), increment: incr.map(x => Math.round(x * 100) / 100), incrementalCostPerLead: cplRange ? cplRange.map(num2) : null, interval: unstable || adsLeads[0] !== adsLeads[1], assumptions }
}

/** Aggrega la performance (Parte 5). Il campione minimo si applica a livello di ACCOUNT: sotto MIN_SAMPLE lead qualificati
 *  totali non esce nessuna percentuale, nessun QCPL e nessuna raccomandazione di stop («dati insufficienti: N/10»).
 *  Sopra il campione, ogni soglia scatta sul proprio minimo (10 qualificati, 15 lead, 40 clic). Le raccomandazioni non vengono mai eseguite. */
export function buildPerformance(i: { total: PerfInput; campaigns: PerfInput[]; maxCpl: number; seoCostPerLead: number }) {
  const overall = measure(i.total)
  const campaigns = i.campaigns.map(measure)
  const enough = i.total.qualified >= MIN_SAMPLE
  const stops = enough ? stopRecommendations(campaigns, { maxCpl: i.maxCpl, seoCostPerLead: i.seoCostPerLead }) : []
  return {
    overall, campaigns, stops, sufficient: enough,
    sample: { qualified: i.total.qualified, minimum: MIN_SAMPLE, message: enough ? null : insufficientData(i.total.qualified) },
    definition: QUALIFIED_LEAD.definition,
    thresholds: { qcpl: `QCPL > maxCpl × ${STOP.qcplFactor} su ≥ ${STOP.qcplMinQualified} lead qualificati`, rate: `lead qualificati / lead < ${STOP.minQualificationRate} su ≥ ${STOP.rateMinLeads} lead`, zero: `0 lead qualificati dopo ${STOP.zeroQualifiedClicks} clic`, seo: 'QCPL > costo implicito SEO (stima dichiarata)', maxCpl: i.maxCpl, seoCostPerLead: i.seoCostPerLead },
    note: 'Raccomandazioni: nessuna viene eseguita. Qualificato e QCPL sono misurati sul CRM; i clic e la spesa per campagna arrivano dal CSV di Google Ads importato.',
  }
}

/** Intervallo min/max dei lead ADS attesi per la proiezione. Con cr misurato min = max; con cr in assunzione si usa DEFAULTS.crRange. */
export function optimizeRange(inp: OptimizeInput) {
  const lo = inp.crSource === 'misurato' ? inp.cr : DEFAULTS.crRange[0], hi = inp.crSource === 'misurato' ? inp.cr : DEFAULTS.crRange[1]
  const a = optimizeBudget({ ...inp, cr: lo }), b = optimizeBudget({ ...inp, cr: hi })
  return { min: { leads: a.totals.leads, budgetMonth: a.totals.budgetMonth, cr: lo }, max: { leads: b.totals.leads, budgetMonth: b.totals.budgetMonth, cr: hi } }
}

// ═══════════════ PARTE 2 (orchestrazione pura) — ingresso dal JSON della Parte 1 ═══════════════
export interface SeoJsonLike {
  period?: { startDate: string; endDate: string; days: number } | null
  gsc: null | { clicks: number; impressions: number; period?: { startDate: string; endDate: string; days: number }; queries: GscQuery[] }
  leads?: null | { total: number; qualified: number; adsAttributed: number | null; adsAttributedQualified?: number | null }
  notes: Record<string, string>
}
export interface ActiveKeyword { text: string; plan: string }
/** Classifica TUTTE le query del JSON della Parte 1 (anche quelle senza clic) e applica il guardrail bloccante sulle NEGATIVE.
 *  Sezione GSC non disponibile → `available:false`, items `null` + motivo (mai un elenco vuoto spacciato per «nessuna query»). */
export function buildSeoInputs(json: SeoJsonLike, activeKeywords: ActiveKeyword[]) {
  const ctr = { upTo3: CTR_TARGET.upTo3, curve: CTR_TARGET.curve.map(c => ({ maxPos: c.maxPos === Infinity ? 'oltre' : c.maxPos, ctr: c.ctr })), formula: 'lostClicksEstimate = impressions × (CTR_target − CTR_attuale); CTR_attuale = clic / impressions' }
  if (!json.gsc) return { available: false as const, reason: json.notes?.gsc || 'dato non disponibile: Search Console', items: null, counts: null, coverage: null, blocking: [] as Collision[], negativeCandidates: [] as string[], ctrTarget: ctr }
  const items = classifyQueries(json.gsc.queries)
  const negs = items.filter(i => i.decision === 'NEGATIVE')
  const blocking = negativeCollisions(negs.map(n => n.query), activeKeywords)
  const blockedQ = new Set(blocking.map(b => b.negative))
  const out = items.map(i => ({ ...i, blocking: blockedQ.has(i.query) }))
  const withClicks = out.filter(i => i.clicks > 0)
  return {
    available: true as const, reason: null as string | null, items: out, counts: countByDecision(items),
    coverage: { queries: out.length, withClicks: withClicks.length, classifiedWithClicks: withClicks.filter(i => !!i.decision).length, withReason: out.filter(i => i.reason.length > 0).length },
    blocking, negativeCandidates: negs.filter(n => !blockedQ.has(n.query)).map(n => n.query), ctrTarget: ctr,
  }
}

// ═══════════════ PARTE 4 (DB) — storico del ciclo di vita ═══════════════
export async function logHistory(db: any, h: { planId: number | string | null; azione: string; da: string | null; a: string | null; utente?: string | null; note?: string | null }) {
  await db.prepare(`INSERT INTO ads_history (plan_id,azione,da_stato,a_stato,utente,note) VALUES (?,?,?,?,?,?)`)
    .bind(h.planId == null ? null : Number(h.planId), h.azione, h.da, h.a, h.utente || 'utente', h.note || null).run()
}
/** Transizione di stato: valida (macchina a stati) → aggiorna ads_plans → scrive ads_history con utente e timestamp. */
export async function applyTransition(db: any, planId: number | string, action: string, utente: string, note?: string): Promise<{ ok: true; from: string; to: string } | { ok: false; status: number; error: string }> {
  const r: any = await db.prepare('SELECT id,status FROM ads_plans WHERE id=?').bind(planId).first()
  if (!r) return { ok: false, status: 404, error: 'Bozza non trovata' }
  const from = String(r.status)   // letto PRIMA dell'UPDATE: lo storico deve registrare lo stato di partenza
  const t = transition(action, from)
  if (!t.ok) return { ok: false, status: 409, error: t.error }
  await db.prepare(`UPDATE ads_plans SET status=?, updated_at=datetime('now') WHERE id=?`).bind(t.to, planId).run()
  await logHistory(db, { planId, azione: action, da: from, a: t.to, utente, note })
  return { ok: true, from, to: t.to }
}

// ═══════════════ PARTE 5 (dati) — attribuzione dei lead ad ADS e aggregazione per campagna ═══════════════
export interface LeadPerfRow { gclid?: string | null; gbraid?: string | null; wbraid?: string | null; landing_page?: string | null; utm_campaign?: string | null; q: number | boolean }
const qp = (url: string, k: string) => { const m = String(url || '').match(new RegExp('[?&]' + k + '=([^&#]+)', 'i')); if (!m) return ''; try { return decodeURIComponent(m[1].replace(/\+/g, ' ')) } catch (_) { return m[1] } }
/** Un lead è «da ADS» se ha un click ID Google (gclid/gbraid/wbraid) OPPURE la landing aveva utm_medium=cpc.
 *  Campagna = colonna utm_campaign se esiste, altrimenti il parametro utm_campaign dell'URL di landing (la landing salva landing_page, non utm_campaign). */
export function adsAttribution(r: LeadPerfRow): { attributed: boolean; campaign: string | null; byClickId: boolean } {
  const byClickId = [r.gclid, r.gbraid, r.wbraid].some(x => !!x && String(x).trim() !== '')
  const lp = String(r.landing_page || '')
  const campaign = (String(r.utm_campaign || '').trim() || qp(lp, 'utm_campaign') || '').trim() || null
  const cpc = /^(cpc|ppc|paid)/i.test(qp(lp, 'utm_medium'))
  return { attributed: byClickId || (cpc && !!campaign), campaign, byClickId }
}
export interface ImportedCampaign { campaign: string; impressions: number; clicks: number; cost: number; conversions: number }
const NO_CAMPAIGN = '(senza utm_campaign)'
/** Dalle righe lead (CRM) + ultimo report importato → input per buildPerformance. Il join è su click ID (attribuzione) e utm_campaign (campagna). */
export function perfFromLeads(rows: LeadPerfRow[], imported: ImportedCampaign[], spendFallback: number | null) {
  const key = (s: string) => E.slugify(s)
  const groups = new Map<string, { campaign: string; leads: number; qualified: number }>()
  let leads = 0, qualified = 0
  for (const r of rows) {
    const a = adsAttribution(r); if (!a.attributed) continue
    const name = a.campaign || NO_CAMPAIGN, k = key(name)
    const g = groups.get(k) || { campaign: name, leads: 0, qualified: 0 }
    g.leads++; leads++; if (r.q) { g.qualified++; qualified++ }; groups.set(k, g)
  }
  const imp = new Map(imported.map(c => [key(c.campaign), c]))
  const names = new Set([...groups.keys(), ...imp.keys()])
  const campaigns: PerfInput[] = [...names].map(k => {
    const g = groups.get(k), c = imp.get(k)
    return { campaign: c?.campaign || g!.campaign, leads: g?.leads || 0, qualified: g?.qualified || 0, clicks: c ? c.clicks : null, spend: c ? c.cost : null }
  }).sort((a, b) => b.qualified - a.qualified || b.leads - a.leads)
  const impTotal = imported.length ? { clicks: imported.reduce((s, c) => s + c.clicks, 0), cost: Math.round(imported.reduce((s, c) => s + c.cost, 0) * 100) / 100 } : null
  const total: PerfInput = { campaign: 'Totale ADS', leads, qualified, clicks: impTotal ? impTotal.clicks : null, spend: impTotal ? impTotal.cost : spendFallback }
  return { total, campaigns, spendBasis: impTotal ? 'costo del report Google Ads importato' : spendFallback != null ? 'spesa del mese inserita a mano' : 'spesa non disponibile' }
}
/** cr misurato = lead qualificati con click ID / clic del report importato; solo sopra il campione minimo, altrimenti assunzione dichiarata. */
export function measuredCr(total: PerfInput): { cr: number; source: 'misurato' | 'assunzione'; note: string } {
  if (total.qualified >= MIN_SAMPLE && total.clicks != null && total.clicks > 0) return { cr: total.qualified / total.clicks, source: 'misurato', note: `${total.qualified} lead qualificati su ${total.clicks} clic del report importato` }
  const why = total.qualified < MIN_SAMPLE ? insufficientData(total.qualified) : 'clic non disponibili: importa il report di Google Ads'
  return { cr: DEFAULTS.cr, source: 'assunzione', note: `cr non misurato (${why}): uso l'assunzione ${DEFAULTS.cr}` }
}
