// ============================================================
// seo-report-engine.ts
// Motore PURO del "Report Analytics Live — eCura" (nessun I/O, nessun fetch).
//
// Principi:
//  - Il TOTALE del periodo e' uno solo: la query GA4 senza dimensioni. KPI, macro-canali, tabella
//    source/medium e canali nativi sono riconciliati su quello (query senza la dimensione data).
//  - La serie giornaliera usa la dimensione data: una sessione a cavallo della mezzanotte compare su due
//    date, quindi la somma datata supera il totale. Lo scarto N e' dichiarato (riga di controllo), non
//    trattato come errore, purche' entro la tolleranza.
//  - Finestre dichiarate: GA4 fino a oggi meno ga4LagDays (valore unico per KPI, canali e trend),
//    GSC fino a oggi meno gscLagDays (dataState final). Gli ultimi giorni in consolidamento
//    (rilevati a runtime) sono esclusi dagli aggregati e mostrati tratteggiati.
//  - Nessun numero scritto a mano: ogni cifra nasce da dati; ogni percentuale passa dal registro
//    `PctRegistry` e viene verificata. Nessun divisore letterale: i periodi arrivano da PARAMS.
//  - Tre livelli di esito: errore (blocca il PDF), anomalia (PDF con banner arancione), avviso di
//    metodo (solo riga in tabella).
// ============================================================

/** Attivazione delle ottimizzazioni GEO: UNICA fonte nel codice (usata da index.tsx e dal render).
 *  Il commit indicato e' quello che ha pubblicato llms.txt. Cambiare qui, mai nel testo. */
export const GEO_ACTIVATION = { date: '2026-08-06', commit: '19c1b6c', label: 'pubblicazione llms.txt (commit 19c1b6c)' } as const

// ── Parametri di metodo (soglie dichiarate nel report, non misure) ──────────
export const PARAMS = {
  ga4LagDays: 4,              // GA4: ultimo giorno incluso = oggi − 4 (attribuzione per canale non ancora consolidata prima)
  gscLagDays: 3,              // GSC: ultimo giorno incluso = oggi − 3 (dataState: final)
  tolerance: 0.006,           // SOLO sessioni a cavallo della mezzanotte: somma datata vs totale senza dimensioni
  deviceTolAbs: 2,            // totale device vs totale: scarto ammesso in sessioni (aggregazione indipendente delle query GA4)…
  deviceTolRel: 0.002,        // …oppure in quota del totale: vale la piu' permissiva delle due. Unico controllo con tolleranza
  toleranceGsc: 0.005,        // somma click giornalieri GSC vs totale GSC
  directAlert: 0.25,          // quota Direct oltre la quale si avvisa di possibile sotto-attribuzione
  notSetWarn: 0.05,           // quota (not set)/(other) oltre la quale si avvisa
  ratioMax: 1.05,             // sessioni GA4 Google organic <= click GSC per questo fattore (copre il fuso orario): oltre = dato non affidabile
  ratioBandLow: 0.6,          // banda di plausibilita' del rapporto settimanale (estremo basso)
  ratioBandHigh: 1.1,         //   (estremo alto)
  ratioBandRun: 3,            // settimane consecutive fuori banda = rottura
  ratioBreak: 0.3,            // scostamento relativo dalla mediana delle settimane precedenti = rottura
  ratioBaselineWeeks: 8,      // settimane precedenti usate per la mediana di confronto
  ratioBaselineMin: 3,        // minimo di settimane affidabili per valutare la rottura
  consolidationTailDays: 3,   // ultimi giorni valutati per il consolidamento dell'organico
  consolidationRefDays: 28,   // giorni di riferimento (precedenti alla coda) per la media di confronto
  consolidationMinShare: 0.35, // un giorno della coda e' «debole» se il suo organico e' sotto questa frazione della media di riferimento
  consolidationMinDays: 2,    // la condizione deve persistere su almeno questi giorni (su consolidationTailDays): una giornata debole isolata non basta
  reducedWindowDays: 7,       // se i giorni esclusi (lag + consolidamento) superano questo valore compare l'avviso di finestra ridotta
  maShort: 7,                 // media mobile breve: indicatore, senza verdetto
  maLong: 28,                 // media mobile strutturale: unica base del verdetto di trend
  weekDays: 7,                // giorni di una settimana lun–dom
  minCrmSourceCoverage: 0.5,  // copertura minima del campo fonte lead per non segnalare il campo come inaffidabile
  trendGap: 0.15,             // sanita' del trend: |variazione MA28 organico GA4 − variazione MA28 click GSC| entro questa distanza (punti)
  trendBand: 0.10,            // variazione MA28 oltre questa fascia = 'in aumento/in calo' (convenzione di lettura, non test statistico)
  minChannelSample: 30,       // sotto questa numerosita' le percentuali per canale sono dichiarate non affidabili
  minBaselineMonths: 3,       // mesi pre-attivazione GEO con dati GA4 per parlare di baseline
  geoMonths: 12,              // mesi della serie AI/GEO (l'ultimo e' parziale)
  topQueries: 15,
  topPages: 10,
  smTableRows: 30,
  per: 100,                   // base del rapporto «lead per 100 sessioni»
}

// ── Tipi di input ───────────────────────────────────────────────────────────
export interface BaseRow { date: string; channelGrouping: string; source: string; medium: string; sessions: number }
export interface SmBaseRow { channelGrouping: string; source: string; medium: string; sessions: number }
export interface SmDetail { source: string; medium: string; users: number; bounceRate: number }
/** Metadati della risposta GA4 (servono a spiegare un eventuale scarto tra due chiamate). */
export interface GaMeta { timeZone?: string; dataLossFromOtherRow?: boolean; subjectToThresholding?: boolean; sampled?: boolean; range?: string }
export interface ReportInput {
  now: Date
  requestedStart: string
  requestedEnd: string
  siteUrl: string
  measurementId: string
  ga4PropertyId: string
  ga4: {
    channelDimension: string | null   // nome dimensione GA4 usata per il raggruppamento canali (null = non disponibile)
    baseRows: BaseRow[] | null        // data × canale × source × medium (SOLO serie giornaliera e consolidamento)
    smBase: SmBaseRow[] | null        // canale × source × medium SENZA data: fonte di macro-canali e tabella source/medium
    queryEnd: string | null           // ultimo giorno delle query non datate (deve coincidere con l'ultimo giorno aggregato)
    control: { sessions: number; users: number; newUsers: number; bounceRate: number; avgSessionDuration: number; pageviews: number } | null
    smDetail: SmDetail[] | null
    topPages: { page: string; pageviews: number; sessions: number }[] | null
    devices: { device: string; sessions: number }[] | null
    countries: { country: string; sessions: number }[] | null
    directLanding: { landing: string; sessions: number }[] | null
    directBrowsers: { browser: string; sessions: number }[] | null
    monthly: { month: string; source: string; medium: string; sessions: number }[] | null
    monthlyRange: { start: string; end: string } | null   // intervallo PROPRIO interrogato per la serie mensile
    meta: { control: GaMeta | null; devices: GaMeta | null }
  }
  gsc: null | {
    totals: { clicks: number; impressions: number; position: number }
    daily: { date: string; clicks: number; impressions: number }[]
    queries: { query: string; clicks: number; impressions: number; position: number }[]
    pages: { page: string; clicks: number; impressions: number; position: number }[]
  }
  crm: null | { rows: { temperatura: string; status: string; canale: string; dettaglio: string; count: number }[] }
  crmError?: string
  geoActivation: { date: string; label: string }
  errors: string[]
  sampleNote?: string   // se valorizzato il report e' un ESEMPIO (dati sintetici) e lo dichiara in copertina
}

// ── Date utils (tutto in UTC su stringhe YYYY-MM-DD) ───────────────────────
export const isoOf = (d: Date) => d.toISOString().slice(0, 10)
export function addDays(s: string, n: number): string {
  const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return isoOf(d)
}
export function diffDaysInclusive(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5) + 1
}
export function romeToday(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}
export function weekStart(s: string): string { // lunedì
  const d = new Date(s + 'T00:00:00Z'); const dow = (d.getUTCDay() + 6) % 7
  d.setUTCDate(d.getUTCDate() - dow); return isoOf(d)
}
export function dateRange(a: string, b: string): string[] {
  const out: string[] = []; for (let d = a; d <= b; d = addDays(d, 1)) out.push(d); return out
}
export const minDate = (a: string, b: string) => (a < b ? a : b)
export const maxDate = (a: string, b: string) => (a > b ? a : b)
/** numero di mesi (inclusi gli estremi) tra due 'YYYY-MM' */
export function monthsBetween(a: string, b: string): number {
  const [ya, ma] = a.split('-').map(Number); const [yb, mb] = b.split('-').map(Number)
  return (yb * 12 + mb) - (ya * 12 + ma) + 1
}
export const monthOf = (s: string) => s.slice(0, 7)
export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number); const t = y * 12 + (m - 1) + n
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`
}
export const fmtDay = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`
export const fmtDayY = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`

/** ga4End = ultimo giorno scaricato (oggi − lag); aggEnd = ultimo giorno AGGREGATO (ga4End meno i giorni in consolidamento). */
export interface Windows { today: string; start: string; ga4End: string; aggEnd: string; gscEnd: string; commonEnd: string; ga4Cut: string; gscCut: string }
export function computeWindows(now: Date, reqStart: string, reqEnd: string, tailDays = 0): Windows {
  const today = romeToday(now)
  const ga4Cut = addDays(today, -PARAMS.ga4LagDays)
  const gscCut = addDays(today, -PARAMS.gscLagDays)
  const ga4End = minDate(reqEnd, ga4Cut)
  const gscEnd = minDate(reqEnd, gscCut)
  const aggEnd = tailDays > 0 ? addDays(ga4End, -tailDays) : ga4End
  return { today, start: reqStart, ga4End, aggEnd, gscEnd, commonEnd: minDate(aggEnd, gscEnd), ga4Cut, gscCut }
}

// ── Formattazione ───────────────────────────────────────────────────────────
export const fmtDec = (x: number, dec = 1) => x.toFixed(dec).replace('.', ',')
export const fmtInt = (n: number) => Math.round(n).toLocaleString('it-IT')
export const esc = (s: any) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
export function formatDuration(secs: number): string {
  if (!secs || secs < 0) return '0:00'
  return `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`
}

// ── Registro percentuali (assert 6) ─────────────────────────────────────────
// Ogni percentuale visibile nel report nasce da P/PS/R/PM e viene registrata con numeratore e
// denominatore. Un testo narrativo ('text') è valido solo se esiste una cella di tabella/KPI
// ('table'|'kpi') calcolata con gli STESSI numeratore e denominatore (stesso valore, stesso decimale).
export type PctKind = 'table' | 'kpi' | 'text' | 'param'
export interface PctEntry { shown: string; core: string; n: number; d: number; dec: number; kind: PctKind }
export class PctRegistry {
  entries: PctEntry[] = []
  private reg(shown: string, n: number, d: number, dec: number, kind: PctKind) {
    this.entries.push({ shown, core: shown.replace(/^[+−-]/, ''), n, d, dec, kind })
  }
  /** percentuale n/d */
  P(n: number, d: number, dec = 1, kind: PctKind = 'table'): string {
    if (!(d > 0)) return 'n.d.'
    const s = fmtDec((100 * n) / d, dec) + '%'; this.reg(s, n, d, dec, kind); return s
  }
  /** variazione percentuale con segno (n = nuovo − vecchio, d = vecchio) */
  PS(n: number, d: number, dec = 1, kind: PctKind = 'table'): string {
    if (!(d > 0)) return 'n.d.'
    const v = (100 * n) / d; const s = (v >= 0 ? '+' : '−') + fmtDec(Math.abs(v), dec) + '%'
    this.reg(s, n, d, dec, kind); return s
  }
  /** tasso già calcolato da GA4 (0–1), es. bounce rate */
  R(x: number, dec = 1, kind: PctKind = 'table'): string { const s = fmtDec(x * 100, dec) + '%'; this.reg(s, x, 1, dec, kind); return s }
  /** parametro/soglia dichiarata (valore già in %, es. 25) */
  PM(valuePct: number, dec = 0): string { const s = fmtDec(valuePct, dec) + '%'; this.reg(s, valuePct, 100, dec, 'param'); return s }
}
const PCT_TOKEN = /(\d+(?:,\d+)?)%/g
export function visibleText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--noscan-->[\s\S]*?<!--\/noscan-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
}
export interface PctCheckResult { ok: boolean; problems: string[]; total: number; textClaims: number }
/** Assert 6 */
export function checkPercentages(html: string, reg: PctRegistry): PctCheckResult {
  const problems: string[] = []
  const known = new Set(reg.entries.map(e => e.core))
  for (const e of reg.entries) {
    const again = fmtDec(Math.abs((100 * e.n) / e.d), e.dec) + '%'
    if (again !== e.core) problems.push(`${e.shown}: ricalcolo ${again} ≠ mostrato`)
  }
  const seen = new Set<string>()
  const txt = visibleText(html)
  let m: RegExpExecArray | null
  PCT_TOKEN.lastIndex = 0
  while ((m = PCT_TOKEN.exec(txt))) {
    const tok = `${m[1]}%`
    if (!known.has(tok) && !seen.has(tok)) { seen.add(tok); problems.push(`${tok}: percentuale visibile non generata da un calcolo`) }
  }
  const twins = reg.entries.filter(e => e.kind === 'table' || e.kind === 'kpi')
  const texts = reg.entries.filter(e => e.kind === 'text')
  for (const t of texts) {
    const ok = twins.some(e => e.n === t.n && e.d === t.d && e.dec === t.dec && e.core === t.core)
    if (!ok) problems.push(`${t.shown}: citata nel testo ma nessuna tabella/KPI ha lo stesso calcolo (${t.n}/${t.d})`)
  }
  return { ok: problems.length === 0, problems: [...new Set(problems)], total: reg.entries.length, textClaims: texts.length }
}

// ── Classificazione fonti (porting fedele della logica precedente) ─────────
export type Category = 'SEO' | 'AI' | 'Direct' | 'Paid' | 'Social' | 'Email' | 'Other'
const AI_SOURCES: Record<string, string> = {
  'chatgpt.com': 'ChatGPT', 'chat.openai.com': 'ChatGPT', 'perplexity.ai': 'Perplexity',
  'gemini.google.com': 'Google Gemini', 'bard.google.com': 'Google Gemini',
  'copilot.microsoft.com': 'MS Copilot', 'bing.com/chat': 'MS Copilot', 'claude.ai': 'Claude AI',
  'you.com': 'You.com', 'phind.com': 'Phind', 'poe.com': 'Poe',
}
const SEO_SOURCES: Record<string, string> = {
  google: 'Google Organic', bing: 'Bing Organic', duckduckgo: 'DuckDuckGo', yahoo: 'Yahoo',
  ecosia: 'Ecosia', yandex: 'Yandex', baidu: 'Baidu', qwant: 'Qwant',
}
export interface Classified { category: Category; label: string; isGoogleOrganic: boolean }
export function classifySource(sourceRaw: string, mediumRaw: string): Classified {
  const src = (sourceRaw || '').toLowerCase().trim()
  const med = (mediumRaw || '').toLowerCase().trim()
  // Google organic = sessionSource 'google' AND sessionMedium 'organic' (NON il channel group: include Discover/News e referral google.*)
  const mk = (category: Category, label: string): Classified => ({ category, label, isGoogleOrganic: src === 'google' && med === 'organic' })
  if (src === '(direct)' || src === 'direct') return mk('Direct', 'Accesso Diretto')
  if (med === 'organic') return mk('SEO', SEO_SOURCES[src] || `${sourceRaw} Organic`)
  if (med === 'cpc' || med === 'paid' || med === 'ppc' || med.includes('paid')) {
    const l = src.includes('google') ? '🟡 Google Ads' : (src.includes('bing') || src.includes('microsoft')) ? '🔵 Microsoft Ads'
      : (src.includes('meta') || src.includes('facebook') || src.includes('instagram')) ? '🔴 Meta Ads' : `💰 ${sourceRaw}`
    return mk('Paid', l)
  }
  if (AI_SOURCES[src]) return mk('AI', AI_SOURCES[src])
  if (src.includes('chatgpt') || src.includes('openai')) return mk('AI', 'ChatGPT')
  if (src.includes('perplexity')) return mk('AI', 'Perplexity')
  if (src.includes('gemini')) return mk('AI', 'Google Gemini')
  if (src.includes('copilot') || (src.includes('bing') && med === 'chat')) return mk('AI', 'MS Copilot')
  if (src.includes('claude')) return mk('AI', 'Claude AI')
  if (med === 'email' || med === 'newsletter') return mk('Email', `📧 ${sourceRaw}`)
  if (med === 'social' || ['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok'].some(k => src.includes(k))) {
    const l = src.includes('facebook') ? '📘 Facebook' : src.includes('instagram') ? '📸 Instagram' : src.includes('linkedin') ? '💼 LinkedIn' : `📱 ${sourceRaw}`
    return mk('Social', l)
  }
  if (med === 'referral') {
    const hit = Object.entries(AI_SOURCES).find(([k]) => src.includes(k.split('.')[0]))
    if (hit) return mk('AI', hit[1])
  }
  return mk('Other', `${sourceRaw} / ${mediumRaw}`)
}
export const CHART_CHANNELS = ['Google organic', 'AI', 'Direct', 'Paid', 'Altro'] as const
export type ChartChannel = typeof CHART_CHANNELS[number]
export function chartChannelOf(c: Classified): ChartChannel {
  if (c.isGoogleOrganic) return 'Google organic'
  if (c.category === 'AI') return 'AI'
  if (c.category === 'Direct') return 'Direct'
  if (c.category === 'Paid') return 'Paid'
  return 'Altro'
}


// ── Modello calcolato ───────────────────────────────────────────────────────
/** Tre livelli di esito (piu' 'ok'):
 *   error   = errore bloccante: il report NON si genera (quadrature hard)
 *   anomaly = anomalia: il report si genera con banner arancione ed elenco puntuale
 *   notice  = avviso di metodo: nessun banner, solo la riga nella tabella */
export type Level = 'ok' | 'notice' | 'anomaly' | 'error'
export interface Check { id: string; label: string; level: Level; value: string; note?: string }
export type WeekState = 'partial' | 'unreliable' | 'ok' | 'break'
export interface WeekRow {
  weekStart: string; weekEnd: string; days: number; full: boolean; ga4Org: number; gscClicks: number | null; gscDays: number
  byChannel: Record<ChartChannel, number>; total: number
  ratio: number | null; state: WeekState
}
export interface SmRow { source: string; medium: string; label: string; category: Category; sessions: number; users: number | null; bounceRate: number | null }
export interface MaPair { cur: number | null; prev: number | null }
export interface TrendRow { label: string; unit: string; endDate: string; prev28Date: string; prev7Date: string; ma28: MaPair; ma7: MaPair }
export interface Consolidation {
  evaluated: boolean; tailDays: number; tailDates: string[]
  tailMean: number | null; refMean: number | null; refDays: number; ratio: number | null
  weakDays: number                 // giorni della coda con organico sotto la soglia (servono consolidationMinDays)
}
export interface RatioAnalysis {
  fullCount: number                // settimane complete (lun–dom): denominatore FISSO dell'indicatore, nessuna esclusione
  unreliable: WeekRow[]            // settimane con GA4 > GSC × ratioMax: marcate, restano nel rapporto, escluse dalle rotture
  anomalous: number                // settimane complete con attribuzione GA4 anomala (non affidabili + rotture)
  sumGa: number; sumGsc: number    // somme su TUTTE le settimane complete
  median: number | null            // mediana su TUTTE le settimane complete
  deviating: number                // settimane distanti dalla mediana oltre ratioBreak (descrittivo)
  breaks: WeekRow[]                // rotture = SOLO ribassi oltre ratioBreak sotto la mediana delle settimane complete precedenti
  outsideRun: { from: string; to: string; len: number } | null
}

// ── Mappatura CRM → canale GA4 (UNICA, usata per il rapporto lead / 100 sessioni) ─────────
export type GaChan = 'SEO' | 'Paid' | 'Direct' | 'Social' | 'AI' | 'Altro'
export const GA_CHAN_LABEL: Record<GaChan, string> = { SEO: 'SEO', Paid: 'Paid', Direct: 'Direct', Social: 'Social', AI: 'AI/GEO', Altro: 'Altro' }
export const CRM_UNSET = 'NON VALORIZZATA'
export interface CrmMapping { ga: GaChan[]; note: string }
/** `canale_acquisizione` (+ `dettaglio_fonte`) → canali GA4 candidati. Piu' di un candidato = non univoco. */
export function mapCrmChannel(canaleRaw: string, dettaglioRaw: string): CrmMapping {
  const c = (canaleRaw || '').trim().toUpperCase()
  const d = (dettaglioRaw || '').toLowerCase()
  switch (c) {
    case 'GOOGLE':
      if (/google[_\s-]?organic/.test(d)) return { ga: ['SEO'], note: 'GOOGLE + google_organico → SEO' }
      if (/google[_\s-]?ads|cpc/.test(d)) return { ga: ['Paid'], note: 'GOOGLE + google_ads → Paid' }
      return { ga: ['SEO', 'Paid'], note: 'GOOGLE senza fonte_dettaglio google_organico / google_ads: SEO o Paid, non univoco' }
    case 'ORGANICO': return { ga: ['SEO'], note: 'ORGANICO → SEO' }
    case 'DIRETTO': return { ga: ['Direct'], note: 'DIRETTO → Direct' }
    case 'META': return { ga: ['Paid', 'Social'], note: 'META → Paid o Social, dipende da utm_medium (non presente nel CRM)' }
    case 'EMAIL': return { ga: ['Altro'], note: 'EMAIL → Altro' }
    case 'REFERRAL': case 'ALTRO': return { ga: ['Altro'], note: `${c} → Altro` }
    case 'AI': return { ga: ['AI'], note: 'AI → AI/GEO' }
    default: return { ga: [], note: 'valore non presente nella tabella di mappatura' }
  }
}
export const CRM_AI_NOT_EMITTED = 'canale non ancora emesso dal form: da implementare in ecura-landing'

export interface CrmChannelRow { canale: string; total: number; web: number; status: Record<string, number>; details: Record<string, number> }
export interface Model {
  input: ReportInput
  win: Windows
  periodDaysGa4: number            // giorni aggregati GA4 (start → aggEnd)
  periodDaysGsc: number
  downloadedDays: number           // giorni scaricati (start → ga4End), compresa la coda in consolidamento
  excl: { lag: number; consolidation: number; total: number }   // giorni esclusi dal periodo richiesto, con la causa
  ok: boolean                      // base query disponibile
  total: number                    // totale del periodo: query SENZA dimensioni (unica fonte di verita')
  totalSource: 'control' | 'breakdown' | 'dated'
  dates: string[]                  // tutti i giorni scaricati; i primi `aggCount` sono aggregati, gli altri in consolidamento
  aggCount: number
  cons: Consolidation
  series: Record<ChartChannel, number[]>
  dailyTotal: number[]
  ma7Total: (number | null)[]
  gaOrgDaily: number[]
  gaOrgMa7: (number | null)[]
  gscDaily: (number | null)[]      // allineata a `dates`; null oltre il cutoff GSC
  gscMa7: (number | null)[]
  dailySumAgg: number              // somma della serie datata sui soli giorni aggregati
  midnight: number                 // dailySumAgg − total: sessioni contate su due date
  weeks: WeekRow[]
  ratio: RatioAnalysis
  macro: { SEO: number; AI: number; Direct: number; Paid: number; Social: number; Altro: number }
  seoEngines: [string, number][]
  aiTools: [string, number][]
  paidSources: [string, number][]
  googleOrganic: number
  smTable: SmRow[]
  nativeChannels: [string, number][]
  notSet: number
  excludedRows: { count: number; sessions: number; maxDate: string | null }
  gsc: null | {
    clicks: number; impressions: number; position: number; ctr: number
    clicksPerDay: number
    dailySum: { clicks: number; impressions: number }
    maxDailyDate: string | null
    excludedRows: number
    brand: { clicks: number; rows: number }
  }
  common: { ga4Org: number; gscClicks: number; days: number; ratio: number | null }
  trend: TrendRow[]
  trendSanity: null | { ga4Rel: number; gscRel: number; gap: number; flagged: boolean }   // gap = |Δ GA4 − Δ GSC| in frazione (punti / 100)
  direct: null | { total: number; withParams: number; inApp: number; inAppEvidence: boolean }
  geo: null | {
    months: { month: string; total: number; ai: number; partial: boolean }[]
    range: { start: string; end: string }
    monthsQueried: number            // mesi coperti dall'intervallo interrogato
    firstDataMonth: string | null    // primo mese con dati GA4
    monthsWithData: number
    activationMonth: string
    monthsBefore: number; aiBefore: number; monthsAfter: number; aiAfter: number
    sufficient: boolean
  }
  crm: null | {
    total: number
    tempOrder: string[]
    byTemp: Record<string, number>
    tempStatus: Record<string, Record<string, number>>
    statusTotals: Record<string, number>
    sourceFilled: number
    sourceCoverage: number
    webTotal: number
    byCanale: Record<string, CrmChannelRow>   // include CRM_UNSET: la somma delle righe = lead totali
    rowsSum: number
    hasAi: boolean
  }
}

export const TEMP_ORDER = ['caldo', 'tiepido', 'freddo', 'n/a']

export function movingAvg(values: (number | null)[], w = PARAMS.maShort): (number | null)[] {
  return values.map((_, i) => {
    if (i < w - 1) return null
    let s = 0
    for (let k = i - w + 1; k <= i; k++) { const v = values[k]; if (v == null) return null; s += v }
    return s / w
  })
}
export function median(xs: number[]): number | null {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b); const h = Math.floor(s.length / 2)
  return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2
}
/** Verdetto di trend: SOLO sulla MA28 (la MA7 e' un indicatore di breve, senza giudizio). */
export function trendVerdict(cur: number | null, prev: number | null): { rel: number; verdict: 'in aumento' | 'in calo' | 'stabile' } | null {
  if (cur == null || prev == null || !(prev > 0)) return null
  const rel = (cur - prev) / prev
  return { rel, verdict: rel > PARAMS.trendBand ? 'in aumento' : rel < -PARAMS.trendBand ? 'in calo' : 'stabile' }
}

/** Consolidamento dell'organico: se la media degli ultimi giorni e' sotto la frazione dichiarata della
 *  media dei giorni precedenti, quegli ultimi giorni sono "in consolidamento" (GA4 non ha ancora attribuito il canale). */
export function detectConsolidation(base: BaseRow[] | null, start: string, ga4End: string): Consolidation {
  const none: Consolidation = { evaluated: false, tailDays: 0, tailDates: [], tailMean: null, refMean: null, refDays: 0, ratio: null, weakDays: 0 }
  if (!base || ga4End < start) return none
  const org = new Map<string, number>()
  for (const r of base) {
    if (r.date < start || r.date > ga4End) continue
    if (classifySource(r.source, r.medium).isGoogleOrganic) org.set(r.date, (org.get(r.date) || 0) + r.sessions)
  }
  const n = PARAMS.consolidationTailDays
  const tailDates = dateRange(addDays(ga4End, -(n - 1)), ga4End).filter(d => d >= start)
  const refTo = addDays(ga4End, -n)
  const refFrom = maxDate(start, addDays(refTo, -(PARAMS.consolidationRefDays - 1)))
  const refDates = refTo >= refFrom ? dateRange(refFrom, refTo) : []
  if (refDates.length < PARAMS.maShort * 2 || tailDates.length < n) return { ...none, refDays: refDates.length }
  const mean = (ds: string[]) => ds.reduce((s, d) => s + (org.get(d) || 0), 0) / ds.length
  const tailMean = mean(tailDates), refMean = mean(refDates)
  const ratio = refMean > 0 ? tailMean / refMean : null
  // La condizione deve persistere: almeno consolidationMinDays giorni su n sotto la soglia (una giornata debole isolata, es. weekend o festivo, non basta)
  const weakDays = refMean > 0 ? tailDates.filter(d => (org.get(d) || 0) / refMean < PARAMS.consolidationMinShare).length : 0
  const incomplete = ratio != null && weakDays >= PARAMS.consolidationMinDays
  return { evaluated: true, tailDays: incomplete ? n : 0, tailDates: incomplete ? tailDates : [], tailMean, refMean, refDays: refDates.length, ratio, weakDays }
}

/** Rapporto settimanale GA4 Google organic / click GSC.
 *  Il rapporto del periodo e la mediana si calcolano su TUTTE le settimane complete (denominatore fissato prima di vedere i dati).
 *  Le settimane con GA4 > GSC × ratioMax sono MARCATE «non affidabili» ma non vengono sottratte dall'indicatore: sono solo escluse dalle rotture.
 *  Una rottura e' solo una CADUTA (la salita e' gia' coperta da ratioMax). */
export function analyseRatio(weeks: WeekRow[], hasGsc: boolean): RatioAnalysis {
  const out: RatioAnalysis = { fullCount: 0, unreliable: [], anomalous: 0, sumGa: 0, sumGsc: 0, median: null, deviating: 0, breaks: [], outsideRun: null }
  if (!hasGsc) return out
  const full = weeks.filter(w => w.full && (w.gscClicks || 0) > 0)
  out.fullCount = full.length
  for (const w of weeks) { w.ratio = null; w.state = 'partial' }
  for (const w of full) {
    w.ratio = w.ga4Org / (w.gscClicks as number)
    if (w.ratio > PARAMS.ratioMax) { w.state = 'unreliable'; out.unreliable.push(w) } else w.state = 'ok'
  }
  out.sumGa = full.reduce((s, w) => s + w.ga4Org, 0)
  out.sumGsc = full.reduce((s, w) => s + (w.gscClicks as number), 0)
  out.median = median(full.map(w => w.ratio as number))
  if (out.median != null && out.median > 0) out.deviating = full.filter(w => Math.abs((w.ratio as number) - out.median!) / out.median! > PARAMS.ratioBreak).length
  // rottura 1: SOLO ribasso oltre ratioBreak sotto la mediana delle settimane complete precedenti (ultime ratioBaselineWeeks)
  full.forEach((w, k) => {
    if (w.state !== 'ok') return                      // le settimane non affidabili non entrano nel calcolo delle rotture
    const prev = full.slice(Math.max(0, k - PARAMS.ratioBaselineWeeks), k).map(x => x.ratio as number)
    if (prev.length < PARAMS.ratioBaselineMin) return
    const med = median(prev)!
    if (med > 0 && (w.ratio as number) < med * (1 - PARAMS.ratioBreak)) { w.state = 'break'; out.breaks.push(w) }
  })
  // rottura 2: settimane consecutive fuori dalla banda di plausibilita' (anche le settimane della serie contano come anomale)
  const bandWeeks = new Set<string>()
  let runWeeks: WeekRow[] = []
  const closeRun = () => {
    if (runWeeks.length >= PARAMS.ratioBandRun) {
      runWeeks.forEach(x => bandWeeks.add(x.weekStart))
      if (!out.outsideRun) out.outsideRun = { from: runWeeks[0].weekStart, to: runWeeks[runWeeks.length - 1].weekStart, len: runWeeks.length }
    }
    runWeeks = []
  }
  for (const w of full) {
    const outside = (w.ratio as number) < PARAMS.ratioBandLow || (w.ratio as number) > PARAMS.ratioBandHigh
    if (outside) runWeeks.push(w); else closeRun()
  }
  closeRun()
  out.anomalous = full.filter(w => w.state === 'unreliable' || w.state === 'break' || bandWeeks.has(w.weekStart)).length
  return out
}

export function buildModel(input: ReportInput): Model {
  const base = input.ga4.baseRows
  const win0 = computeWindows(input.now, input.requestedStart, input.requestedEnd)
  const cons = detectConsolidation(base, win0.start, win0.ga4End)
  const win = computeWindows(input.now, input.requestedStart, input.requestedEnd, cons.tailDays)
  const downloadedDays = Math.max(0, diffDaysInclusive(win.start, win.ga4End))
  // giorni esclusi dal periodo richiesto (fino a oggi), con la causa: lag GA4 + coda in consolidamento
  const reqCeil = input.requestedEnd > win.today ? win.today : input.requestedEnd
  const exLag = Math.max(0, diffDaysInclusive(addDays(win.ga4Cut, 1), reqCeil))
  const periodDaysGa4 = Math.max(0, diffDaysInclusive(win.start, win.aggEnd))
  const periodDaysGsc = Math.max(0, diffDaysInclusive(win.start, win.gscEnd))
  const dates = downloadedDays > 0 ? dateRange(win.start, win.ga4End) : []
  const aggCount = Math.min(dates.length, periodDaysGa4)
  const zeros = () => dates.map(() => 0)
  const series = Object.fromEntries(CHART_CHANNELS.map(c => [c, zeros()])) as Record<ChartChannel, number[]>

  const m: Model = {
    input, win, periodDaysGa4, periodDaysGsc, downloadedDays, excl: { lag: exLag, consolidation: cons.tailDays, total: exLag + cons.tailDays }, ok: !!base && periodDaysGa4 > 0, total: 0, totalSource: 'control',
    dates, aggCount, cons, series, dailyTotal: zeros(), ma7Total: [], gaOrgDaily: zeros(), gaOrgMa7: [], gscDaily: [], gscMa7: [],
    dailySumAgg: 0, midnight: 0, weeks: [],
    ratio: { fullCount: 0, unreliable: [], anomalous: 0, sumGa: 0, sumGsc: 0, median: null, deviating: 0, breaks: [], outsideRun: null },
    macro: { SEO: 0, AI: 0, Direct: 0, Paid: 0, Social: 0, Altro: 0 },
    seoEngines: [], aiTools: [], paidSources: [], googleOrganic: 0, smTable: [], nativeChannels: [], notSet: 0,
    excludedRows: { count: 0, sessions: 0, maxDate: null },
    gsc: null, common: { ga4Org: 0, gscClicks: 0, days: 0, ratio: null }, trend: [], trendSanity: null, direct: null, geo: null, crm: null,
  }
  if (!m.ok) return m

  // ── 1. Serie giornaliera (data × canale × source × medium): SOLO per serie, consolidamento e settimane ──
  const idx = new Map(dates.map((d, i) => [d, i]))
  const dated: BaseRow[] = []
  for (const r of base!) {
    if (r.date < win.start || r.date > win.ga4End) {
      m.excludedRows.count++; m.excludedRows.sessions += r.sessions
      if (!m.excludedRows.maxDate || r.date > m.excludedRows.maxDate) m.excludedRows.maxDate = r.date
      continue
    }
    dated.push(r)
    const cl = classifySource(r.source, r.medium)
    const i = idx.get(r.date)
    if (i == null) continue
    m.series[chartChannelOf(cl)][i] += r.sessions
    m.dailyTotal[i] += r.sessions
    if (cl.isGoogleOrganic) m.gaOrgDaily[i] += r.sessions
  }
  m.dailySumAgg = m.dailyTotal.slice(0, aggCount).reduce((a, b) => a + b, 0)

  // ── 2. Aggregati senza data: unica fonte per macro-canali, source/medium, canali nativi ──
  const agg: SmBaseRow[] = input.ga4.smBase ?? (() => {
    const mp = new Map<string, SmBaseRow>()
    for (const r of dated) {
      if (r.date > win.aggEnd) continue
      const k = `${r.channelGrouping}|||${r.source}|||${r.medium}`
      const e = mp.get(k); if (e) e.sessions += r.sessions; else mp.set(k, { channelGrouping: r.channelGrouping, source: r.source, medium: r.medium, sessions: r.sessions })
    }
    return [...mp.values()]
  })()
  m.totalSource = input.ga4.control ? 'control' : input.ga4.smBase ? 'breakdown' : 'dated'
  const aggSum = agg.reduce((s, r) => s + r.sessions, 0)
  m.total = input.ga4.control ? input.ga4.control.sessions : aggSum

  const seo: Record<string, number> = {}, ai: Record<string, number> = {}, paid: Record<string, number> = {}
  const smMap = new Map<string, SmRow>()
  const native = new Map<string, number>()
  for (const r of agg) {
    const cl = classifySource(r.source, r.medium)
    if (cl.isGoogleOrganic) m.googleOrganic += r.sessions
    switch (cl.category) {
      case 'SEO': m.macro.SEO += r.sessions; seo[cl.label] = (seo[cl.label] || 0) + r.sessions; break
      case 'AI': m.macro.AI += r.sessions; ai[cl.label] = (ai[cl.label] || 0) + r.sessions; break
      case 'Direct': m.macro.Direct += r.sessions; break
      case 'Paid': m.macro.Paid += r.sessions; paid[cl.label] = (paid[cl.label] || 0) + r.sessions; break
      case 'Social': m.macro.Social += r.sessions; break
      default: m.macro.Altro += r.sessions
    }
    const k = `${r.source}|||${r.medium}`
    const e = smMap.get(k)
    if (e) e.sessions += r.sessions
    else smMap.set(k, { source: r.source, medium: r.medium, label: cl.label, category: cl.category, sessions: r.sessions, users: null, bounceRate: null })
    native.set(r.channelGrouping, (native.get(r.channelGrouping) || 0) + r.sessions)
    const ns = (x: string) => x === '(not set)' || x === '(other)'
    if (ns(r.source) || ns(r.medium) || r.channelGrouping === 'Unassigned') m.notSet += r.sessions
  }
  const sortEntries = (o: Record<string, number>) => Object.entries(o).sort((a, b) => b[1] - a[1])
  m.seoEngines = sortEntries(seo); m.aiTools = sortEntries(ai); m.paidSources = sortEntries(paid)
  m.nativeChannels = [...native.entries()].sort((a, b) => b[1] - a[1])
  m.smTable = [...smMap.values()].sort((a, b) => b.sessions - a.sessions)
  for (const d of input.ga4.smDetail || []) {
    const e = smMap.get(`${d.source}|||${d.medium}`)
    if (e) { e.users = d.users; e.bounceRate = d.bounceRate }
  }
  m.ma7Total = movingAvg(m.dailyTotal, PARAMS.maShort)
  m.gaOrgMa7 = movingAvg(m.gaOrgDaily, PARAMS.maShort)

  // ── 3. GSC ──
  const gscMap = new Map<string, number>()
  if (input.gsc) {
    for (const r of input.gsc.daily) if (r.date >= win.start && r.date <= win.gscEnd) gscMap.set(r.date, (gscMap.get(r.date) || 0) + r.clicks)
  }
  m.gscDaily = dates.map(d => (input.gsc && d <= win.gscEnd ? (gscMap.get(d) ?? 0) : null))
  m.gscMa7 = movingAvg(m.gscDaily, PARAMS.maShort)
  if (input.gsc) {
    const t = input.gsc.totals
    const dailyRows = input.gsc.daily.filter(r => r.date >= win.start && r.date <= win.gscEnd)
    const brandRe = /e[\s-]?cura/i
    const topN = input.gsc.queries.slice(0, PARAMS.topQueries)
    m.gsc = {
      clicks: t.clicks, impressions: t.impressions, position: t.position,
      ctr: t.impressions > 0 ? t.clicks / t.impressions : 0,
      clicksPerDay: periodDaysGsc > 0 ? t.clicks / periodDaysGsc : 0,
      dailySum: { clicks: dailyRows.reduce((s, r) => s + r.clicks, 0), impressions: dailyRows.reduce((s, r) => s + r.impressions, 0) },
      maxDailyDate: dailyRows.reduce<string | null>((mx, r) => (!mx || r.date > mx ? r.date : mx), null),
      excludedRows: input.gsc.daily.length - dailyRows.length,
      brand: { clicks: topN.filter(q => brandRe.test(q.query)).reduce((s, q) => s + q.clicks, 0), rows: topN.filter(q => brandRe.test(q.query)).length },
    }
  }

  // ── 4. Finestra comune GA4/GSC (solo giorni consolidati) e settimane lun–dom ──
  const commonDates = dates.filter(d => d <= win.commonEnd)
  m.common.days = commonDates.length
  m.common.ga4Org = commonDates.reduce((s, d) => s + m.gaOrgDaily[idx.get(d)!], 0)
  m.common.gscClicks = input.gsc ? commonDates.reduce((s, d) => s + (gscMap.get(d) || 0), 0) : 0
  m.common.ratio = input.gsc && m.common.gscClicks > 0 ? m.common.ga4Org / m.common.gscClicks : null
  const wk = new Map<string, WeekRow>()
  dates.forEach((d, i) => {
    if (d > win.aggEnd) return                       // la coda in consolidamento non entra mai negli aggregati
    const ws = weekStart(d)
    let w = wk.get(ws)
    if (!w) {
      w = { weekStart: ws, weekEnd: addDays(ws, PARAMS.weekDays - 1), days: 0, full: false, ga4Org: 0, gscClicks: input.gsc ? 0 : null, gscDays: 0,
        byChannel: Object.fromEntries(CHART_CHANNELS.map(c => [c, 0])) as Record<ChartChannel, number>, total: 0, ratio: null, state: 'partial' }
      wk.set(ws, w)
    }
    w.days++
    w.total += m.dailyTotal[i]
    for (const c of CHART_CHANNELS) w.byChannel[c] += m.series[c][i]
    if (d <= win.commonEnd) {
      w.ga4Org += m.gaOrgDaily[i]
      if (input.gsc) { w.gscClicks = (w.gscClicks || 0) + (gscMap.get(d) || 0); w.gscDays++ }
    }
  })
  m.weeks = [...wk.values()].map(w => ({ ...w, full: w.days === PARAMS.weekDays && (!input.gsc || w.gscDays === PARAMS.weekDays) }))
  m.ratio = analyseRatio(m.weeks, !!input.gsc)

  // ── 5. Trend: verdetto sulla MA28 (giorni consolidati); MA7 solo come indicatore di breve ──
  const endIdx = dates.indexOf(win.commonEnd)
  const tr = (label: string, unit: string, daily: (number | null)[]): TrendRow => {
    const ma28 = movingAvg(daily, PARAMS.maLong), ma7 = movingAvg(daily, PARAMS.maShort)
    const p28 = endIdx - PARAMS.maLong, p7 = endIdx - PARAMS.maShort
    const at = (ma: (number | null)[], k: number) => (k >= 0 && k < ma.length ? ma[k] : null)
    return { label, unit, endDate: dates[endIdx] || '', prev28Date: dates[p28] || '', prev7Date: dates[p7] || '',
      ma28: { cur: at(ma28, endIdx), prev: at(ma28, p28) }, ma7: { cur: at(ma7, endIdx), prev: at(ma7, p7) } }
  }
  if (endIdx >= 0) {
    m.trend.push(tr('Sessioni GA4 totali', 'sessioni/giorno', m.dailyTotal))
    m.trend.push(tr('Sessioni GA4 Google organic', 'sessioni/giorno', m.gaOrgDaily))
    if (input.gsc) m.trend.push(tr('Click Search Console', 'click/giorno', m.gscDaily))
  }
  if (input.gsc && m.trend.length === 3) {
    const a = trendVerdict(m.trend[1].ma28.cur, m.trend[1].ma28.prev), g = trendVerdict(m.trend[2].ma28.cur, m.trend[2].ma28.prev)
    if (a && g) {
      // differenza tra i due tassi di variazione (in punti): serie che si muovono in direzioni opposte NON sono «nessuna divergenza»
      const gap = Math.abs(a.rel - g.rel)
      m.trendSanity = { ga4Rel: a.rel, gscRel: g.rel, gap, flagged: gap > PARAMS.trendGap }
    }
  }

  // ── 6. Direct ──
  const dl = input.ga4.directLanding, db = input.ga4.directBrowsers
  if (dl) {
    const tot = dl.reduce((s, r) => s + r.sessions, 0)
    const withParams = dl.filter(r => /[?&](utm_[a-z]+|gclid|gbraid|wbraid|fbclid)=/i.test(r.landing)).reduce((s, r) => s + r.sessions, 0)
    const inAppRe = /webview|in-app|instagram|facebook|linkedin|snapchat|tiktok|line|wechat|gsa|\(in-app\)/i
    const inApp = db ? db.filter(r => inAppRe.test(r.browser)).reduce((s, r) => s + r.sessions, 0) : 0
    m.direct = { total: tot, withParams, inApp, inAppEvidence: !!db }
  }

  // ── 7. Serie mensile AI/GEO: intervallo PROPRIO (12 mesi), mesi senza dati inclusi come zero ──
  if (input.ga4.monthly) {
    const mm = new Map<string, { total: number; ai: number }>()
    for (const r of input.ga4.monthly) {
      const e = mm.get(r.month) || { total: 0, ai: 0 }
      e.total += r.sessions
      if (classifySource(r.source, r.medium).category === 'AI') e.ai += r.sessions
      mm.set(r.month, e)
    }
    const keys = [...mm.keys()].sort()
    const range = input.ga4.monthlyRange || { start: `${keys[0] ?? monthOf(win.aggEnd)}-01`, end: win.aggEnd }
    const first = monthOf(range.start), lastMonth = monthOf(range.end)
    const monthsQueried = monthsBetween(first, lastMonth)
    const months = Array.from({ length: Math.max(0, monthsQueried) }, (_, k) => {
      const key = addMonths(first, k); const e = mm.get(key) || { total: 0, ai: 0 }
      return { month: key, total: e.total, ai: e.ai, partial: key === lastMonth }
    })
    const act = monthOf(input.geoActivation.date)
    const withData = months.filter(x => x.total > 0)
    const before = withData.filter(x => x.month < act)
    const after = months.filter(x => x.month >= act)
    m.geo = {
      months, range, monthsQueried, firstDataMonth: withData[0]?.month ?? null, monthsWithData: withData.length, activationMonth: act,
      monthsBefore: before.length, aiBefore: before.reduce((s, x) => s + x.ai, 0),
      monthsAfter: after.length, aiAfter: after.reduce((s, x) => s + x.ai, 0),
      sufficient: before.length >= PARAMS.minBaselineMonths,
    }
  }

  // ── 8. CRM: ogni valore presente (inclusa la fonte non valorizzata) ha la sua riga ──
  if (input.crm) {
    const tempStatus: Record<string, Record<string, number>> = {}
    const byTemp: Record<string, number> = {}
    const statusTotals: Record<string, number> = {}
    const byCanale: Record<string, CrmChannelRow> = {}
    let total = 0, filled = 0, webTotal = 0
    for (const r of input.crm.rows) {
      const t = (r.temperatura || 'n/a').toLowerCase()
      const s = r.status || 'UNKNOWN'
      total += r.count
      ;(tempStatus[t] ||= {})[s] = ((tempStatus[t] || {})[s] || 0) + r.count
      byTemp[t] = (byTemp[t] || 0) + r.count
      statusTotals[s] = (statusTotals[s] || 0) + r.count
      const isWeb = (r.dettaglio || '') === 'ecura_landing'
      if (isWeb) webTotal += r.count
      const canale = (r.canale || '').trim().toUpperCase() || CRM_UNSET
      if (canale !== CRM_UNSET) filled += r.count
      const c = (byCanale[canale] ||= { canale, total: 0, web: 0, status: {}, details: {} })
      c.total += r.count
      if (isWeb) c.web += r.count
      c.status[s] = (c.status[s] || 0) + r.count
      const dk = (r.dettaglio || '').trim(); c.details[dk] = (c.details[dk] || 0) + r.count
    }
    m.crm = { total, tempOrder: TEMP_ORDER, byTemp, tempStatus, statusTotals, sourceFilled: filled, sourceCoverage: total > 0 ? filled / total : 0, webTotal, byCanale,
      rowsSum: Object.values(byCanale).reduce((s, c) => s + c.total, 0), hasAi: !!byCanale['AI'] }
  }
  return m
}

/** Sessioni GA4 del macro-canale. */
export function gaChanSessions(m: Model, g: GaChan): number { return g === 'SEO' ? m.macro.SEO : g === 'AI' ? m.macro.AI : g === 'Paid' ? m.macro.Paid : g === 'Direct' ? m.macro.Direct : g === 'Social' ? m.macro.Social : m.macro.Altro }
export interface CrmDenominator { unique: GaChan | null; candidates: { ga: GaChan; sessions: number }[]; note: string }
/** Denominatore del rapporto lead/100 sessioni per una riga CRM: univoco solo se tutte le righe dettaglio mappano su UN canale GA4. */
export function crmDenominator(m: Model, row: CrmChannelRow): CrmDenominator {
  if (row.canale === CRM_UNSET) return { unique: null, candidates: [], note: 'fonte non valorizzata nel CRM: nessun canale GA4 associabile' }
  const set = new Set<GaChan>(); const notes = new Set<string>()
  for (const dk of Object.keys(row.details)) { const mp = mapCrmChannel(row.canale, dk); mp.ga.forEach(x => set.add(x)); notes.add(mp.note) }
  if (!Object.keys(row.details).length) mapCrmChannel(row.canale, '').ga.forEach(x => set.add(x))
  const list = [...set]
  const candidates = list.map(ga => ({ ga, sessions: gaChanSessions(m, ga) }))
  const note = [...notes].join(' · ') + (row.canale === 'AI' ? ` · ${CRM_AI_NOT_EMITTED}` : '')
  return { unique: list.length === 1 ? list[0] : null, candidates, note }
}

// ── Controlli di qualità ────────────────────────────────────────────────────
// Ogni riga e' calcolata a runtime. Le percentuali passano dal registro. I livelli sono tre (vedi Level).
export function runChecks(m: Model, R: PctRegistry): Check[] {
  const checks: Check[] = []
  const add = (id: string, label: string, level: Level, value: string, note?: string) => checks.push({ id, label, level, value, note })
  const win = m.win
  if (!m.ok) { add('base', 'Query base GA4', 'error', 'dato non disponibile (query base fallita o intervallo vuoto)'); return checks }
  const sgn = (n: number) => (n > 0 ? `+${fmtInt(n)}` : n < 0 ? `−${fmtInt(-n)}` : '0')
  const g4 = m.input.ga4
  const T = m.total

  // ── Errori bloccanti: quadrature sul totale unico (query senza dimensioni) ──
  const chanSum = Object.values(m.macro).reduce((a, b) => a + b, 0)
  const smSum = m.smTable.reduce((s, r) => s + r.sessions, 0)
  const natSum = m.nativeChannels.reduce((s, [, v]) => s + v, 0)
  // «Stessa query, dimensione diversa»: GA4 aggrega ogni query in modo indipendente, poche unita' di scarto sono aggregazione, non errore.
  // Stessa tolleranza del device (la piu' permissiva tra ±deviceTolAbs sessioni e ±deviceTolRel del totale); oltre resta errore bloccante.
  const sameQueryTol = Math.max(PARAMS.deviceTolAbs, T * PARAMS.deviceTolRel)
  const sameQueryTolTxt = `±${fmtDec(sameQueryTol, Number.isInteger(sameQueryTol) ? 0 : 1)} sessioni`
  const eq = (id: string, label: string, v: number) => add(id, label, Math.abs(v - T) <= sameQueryTol ? 'ok' : 'error',
    `${fmtInt(v)} vs ${fmtInt(T)} sessioni · Δ ${sgn(v - T)}` + (Math.abs(v - T) <= sameQueryTol ? ` (entro ${sameQueryTolTxt})` : ` · oltre la tolleranza di aggregazione (${sameQueryTolTxt})`))
  if (m.totalSource === 'control') add('ctl', 'Totale del periodo (query GA4 senza dimensioni) = KPI', 'ok', `${fmtInt(T)} sessioni · ${win.start} → ${win.aggEnd} · fonte unica di verità per KPI, canali e source/medium`)
  else add('ctl', 'Totale del periodo (query GA4 senza dimensioni) = KPI', 'notice', `dato non disponibile: il totale è la somma source/medium (${fmtInt(T)} sessioni)`)
  eq('H1a', 'Quadratura macro-canali vs totale', chanSum)
  eq('H1b', 'Quadratura tabella source/medium vs totale', smSum)
  if (g4.channelDimension) eq('H1c', 'Quadratura canali GA4 nativi vs totale', natSum)
  else add('H1c', 'Quadratura canali GA4 nativi vs totale', 'notice', 'dato non disponibile (dimensione canale GA4 non interrogabile)')
  if (!g4.smBase) add('nodate', 'Query senza dimensione data', 'anomaly', 'non disponibile: macro-canali e source/medium sono calcolati sulla serie datata (le sessioni a cavallo della mezzanotte possono essere contate due volte)')

  // Serie giornaliera vs totale: lo scarto N e' atteso (una sessione a cavallo della mezzanotte compare su due date)
  const N = m.midnight = m.dailySumAgg - T
  const nRel = T > 0 ? N / T : (N === 0 ? 0 : 1)
  const sameLen = m.aggCount === m.periodDaysGa4
  const nOk = N >= 0 && nRel <= PARAMS.tolerance && sameLen
  add('H2', 'Sessioni a cavallo della mezzanotte (date multiple)', nOk ? 'ok' : 'error',
    nOk
      ? `${fmtInt(N)} = somma serie giornaliera ${fmtInt(m.dailySumAgg)} − totale senza dimensioni ${fmtInt(T)} (${R.P(N, T, 2)} del totale, tolleranza ${R.PM(PARAMS.tolerance * 100, 1)}) — atteso, non è un errore: ${m.aggCount} punti su ${m.periodDaysGa4} giorni (${win.start} → ${win.aggEnd})`
      : `${sgn(N)} = somma serie giornaliera ${fmtInt(m.dailySumAgg)} − totale senza dimensioni ${fmtInt(T)} (${R.PS(N, T, 2)}): fuori dalla tolleranza di ${R.PM(PARAMS.tolerance * 100, 1)} che copre solo la mezzanotte, oppure la serie perde sessioni · ${m.aggCount} punti su ${m.periodDaysGa4} giorni`)

  // Device: stessa dateRanges, nessuna dimensione data → coincidenza esatta
  const dev = g4.devices
  if (dev) {
    const ds = dev.reduce((s, d) => s + d.sessions, 0)
    const meta = (x: GaMeta | null) => x ? `fuso ${x.timeZone ?? 'n.d.'}, thresholding ${x.subjectToThresholding ? 'sì' : 'no'}, dati in «other» ${x.dataLossFromOtherRow ? 'sì' : 'no'}, intervallo ${x.range ?? 'n.d.'}` : 'metadata n.d.'
    // Unico controllo con tolleranza: GA4 aggrega ogni query in modo indipendente, pochi punti di scarto non sono diagnosticabili.
    const devTol = Math.max(PARAMS.deviceTolAbs, T * PARAMS.deviceTolRel)
    const devOk = Math.abs(ds - T) <= devTol
    const tolTxt = `±${fmtDec(devTol, Number.isInteger(devTol) ? 0 : 1)} sessioni = la più permissiva tra ±${PARAMS.deviceTolAbs} sessioni e ±${R.PM(PARAMS.deviceTolRel * 100, 1)} del totale`
    add('dev', 'Totale device vs totale (stessa dateRanges; tolleranza di aggregazione GA4)', devOk ? 'ok' : 'anomaly',
      `${fmtInt(ds)} vs ${fmtInt(T)} sessioni · Δ ${sgn(ds - T)}` + (devOk ? ` (entro ${tolTxt})` : ` · oltre la tolleranza (${tolTxt}) · metadata GA4 — controllo: ${meta(g4.meta.control)} · device: ${meta(g4.meta.devices)}`))
  } else add('dev', 'Totale device vs totale (stessa dateRanges; tolleranza di aggregazione GA4)', 'notice', 'dato non disponibile')

  // Coerenza finestra delle query senza data con l'ultimo giorno aggregato
  if (g4.queryEnd != null) add('qend', 'Query senza data sullo stesso intervallo della serie', g4.queryEnd === win.aggEnd ? 'ok' : 'error',
    `query senza data fino al ${g4.queryEnd} · ultimo giorno aggregato ${win.aggEnd}`)

  // Nessun giorno non consolidato negli aggregati
  const maxAgg = m.aggCount ? m.dates[m.aggCount - 1] : ''
  const gscUsedMax = m.gscDaily.reduce<string>((mx, v, i) => (v != null && m.dates[i] > mx ? m.dates[i] : mx), '')
  const h3ok = maxAgg <= win.ga4Cut && (!gscUsedMax || gscUsedMax <= win.gscCut) && (m.gsc?.maxDailyDate == null || m.gsc.maxDailyDate <= win.gscCut)
  add('H3', 'Nessun giorno non consolidato negli aggregati', h3ok ? 'ok' : 'error',
    `GA4 ultimo giorno aggregato ${maxAgg || 'n.d.'} (limite per lag ${win.ga4Cut}) · GSC ultimo giorno incluso ${m.gsc?.maxDailyDate ?? 'n.d.'} (limite ${win.gscCut})`)

  // Lag e coda in consolidamento
  const ceil = m.input.requestedEnd > win.today ? win.today : m.input.requestedEnd
  const exLag = Math.max(0, diffDaysInclusive(addDays(win.ga4Cut, 1), ceil))
  const exGsc = m.input.gsc ? Math.max(0, diffDaysInclusive(addDays(win.gscEnd, 1), ceil)) : null
  const exTxt = (n: number, from: string) => (n === 0 ? '0 gg' : `${n} gg (da ${fmtDayY(from)})`)
  add('lag', 'Giorni esclusi per lag (GA4 / GSC)', 'ok',
    `GA4: ${exTxt(exLag, addDays(win.ga4Cut, 1))} (lag ${PARAMS.ga4LagDays} gg, valore unico per totali, canali e trend) · GSC: ${exGsc == null ? 'dato non disponibile' : exTxt(exGsc, addDays(win.gscEnd, 1))}` +
      (m.excludedRows.count ? ` · righe GA4 fuori finestra scartate: ${m.excludedRows.count} (${fmtInt(m.excludedRows.sessions)} sessioni)` : '') +
      (m.gsc && m.gsc.excludedRows ? ` · righe GSC fuori finestra scartate: ${m.gsc.excludedRows}` : ''))
  const c = m.cons
  if (!c.evaluated) add('cons', 'Consolidamento dell’organico negli ultimi giorni', 'notice', `non valutabile: servono almeno ${PARAMS.maShort * 2} giorni di riferimento prima della coda (disponibili ${c.refDays})`)
  else if (c.ratio == null) add('cons', 'Consolidamento dell’organico negli ultimi giorni', 'notice', 'non valutabile: media di riferimento a zero sessioni organiche')
  else add('cons', 'Consolidamento dell’organico negli ultimi giorni', c.tailDays ? 'notice' : 'ok',
    `organico ultimi ${PARAMS.consolidationTailDays} gg: ${fmtDec(c.tailMean as number, 1)} sessioni/giorno vs media ${c.refDays} gg precedenti ${fmtDec(c.refMean as number, 1)} = ${R.P(c.tailMean as number, c.refMean as number, 1)} · giorni sotto la soglia di ${R.PM(PARAMS.consolidationMinShare * 100, 0)}: ${c.weakDays} su ${PARAMS.consolidationTailDays} (ne servono almeno ${PARAMS.consolidationMinDays})` +
      (c.tailDays ? ` · IN CONSOLIDAMENTO: ${c.tailDates[0]} → ${c.tailDates[c.tailDates.length - 1]} esclusi da aggregati e trend, tratteggiati nei grafici` : ' · nessun giorno escluso'))

  // ── Avvisi di metodo / anomalie sul contenuto ──
  add('notset', 'Quota (not set) / (other)', T > 0 && m.notSet / T > PARAMS.notSetWarn ? 'notice' : 'ok',
    `${fmtInt(m.notSet)} su ${fmtInt(T)} sessioni = ${R.P(m.notSet, T, 1)} (soglia di avviso ${R.PM(PARAMS.notSetWarn * 100, 0)})`)
  const dShare = T > 0 ? m.macro.Direct / T : 0
  add('direct', 'Quota Direct', dShare > PARAMS.directAlert ? 'notice' : 'ok',
    `${fmtInt(m.macro.Direct)} su ${fmtInt(T)} sessioni = ${R.P(m.macro.Direct, T, 1)}` + (dShare > PARAMS.directAlert ? ` · oltre ${R.PM(PARAMS.directAlert * 100, 0)}: possibile sotto-attribuzione (limite di attribuzione, non un errore)` : ''))

  if (m.gsc) {
    const dc = m.gsc.dailySum.clicks
    add('gscsum', 'GSC: somma click giornalieri vs totale', m.gsc.clicks > 0 && Math.abs(dc - m.gsc.clicks) / m.gsc.clicks <= PARAMS.toleranceGsc ? 'ok' : 'anomaly',
      `${fmtInt(dc)} vs ${fmtInt(m.gsc.clicks)} click · Δ ${sgn(dc - m.gsc.clicks)}`)
    const g = m.gsc
    const ctrOk = g.impressions > 0 ? g.clicks <= g.impressions : g.clicks === 0
    add('ctr', 'CTR ricalcolabile (click / impressioni)', ctrOk ? 'ok' : 'error',
      g.impressions > 0 ? `${fmtInt(g.clicks)} click / ${fmtInt(g.impressions)} impressioni = ${R.P(g.clicks, g.impressions, 1)} (CTR di sito, non delle top ${PARAMS.topQueries} query)` : 'impressioni a zero: CTR non calcolabile')

    // Rapporto organico GA4 / click GSC: affidabilita' per settimana e rotture (non livelli)
    const r = m.ratio
    const wlab = (w: WeekRow) => `sett. ${fmtDay(w.weekStart)} ${R.P(w.ga4Org, w.gscClicks as number, 1)}`
    add('ratiomax', `Organico GA4 ≤ click GSC × ${fmtDec(PARAMS.ratioMax, 2)} su ogni settimana completa`, r.unreliable.length ? 'anomaly' : 'ok',
      r.unreliable.length
        ? `${r.unreliable.length} settimane su ${r.fullCount} con sessioni organiche GA4 > click GSC × ${fmtDec(PARAMS.ratioMax, 2)}: «dato GA4 non affidabile» (marcate; restano nel rapporto del periodo, escluse solo dal calcolo delle rotture) — ${r.unreliable.map(wlab).join('; ')}`
        : `nessuna settimana fuori limite su ${r.fullCount} settimane complete (il margine copre il fuso orario GA4 vs Search Console)`)
    const rupture = r.breaks.length > 0 || !!r.outsideRun
    const ruptureTxt = r.breaks.length ? `${r.breaks.length} ${r.breaks.length === 1 ? 'rottura' : 'rotture'} — ${r.breaks.map(w => `sett. ${fmtDay(w.weekStart)} al ${R.P(w.ga4Org, w.gscClicks as number, 1)}`).join('; ')}` : 'nessuna rottura'
    add('ratio', 'Rapporto sessioni Google organic (GA4) / click GSC — rotture', !r.fullCount ? 'notice' : rupture ? 'anomaly' : 'ok',
      !r.fullCount ? 'nessuna settimana completa nel periodo' :
        `${R.P(r.sumGa, r.sumGsc, 1)} — ${r.fullCount} settimane complete, di cui ${r.anomalous} con attribuzione GA4 anomala (${fmtInt(r.sumGa)} sessioni / ${fmtInt(r.sumGsc)} click su tutte le settimane complete) · mediana ${r.median == null ? 'n.d.' : R.P(r.median, 1, 1)}, ` +
        `settimane distanti dalla mediana oltre ${R.PM(PARAMS.ratioBreak * 100, 0)}: ${r.deviating}` +
        ` · ${ruptureTxt} (rottura = solo ribasso oltre ${R.PM(PARAMS.ratioBreak * 100, 0)} sotto la mediana delle ${PARAMS.ratioBaselineWeeks} settimane complete precedenti)` +
        (r.outsideRun ? ` · ${r.outsideRun.len} settimane consecutive fuori banda ${R.PM(PARAMS.ratioBandLow * 100, 0)}–${R.PM(PARAMS.ratioBandHigh * 100, 0)} (da ${fmtDay(r.outsideRun.from)})` : ` · nessuna serie di ${PARAMS.ratioBandRun} settimane fuori banda`))
    // Sanita' del trend: distanza tra i due tassi di variazione MA28 (punti), non solo «GA4 cala il doppio»
    const s = m.trendSanity
    add('trendsanity', 'Sanità del trend organico: GA4 vs Search Console', !s ? 'notice' : s.flagged ? 'notice' : 'ok',
      !s ? 'non valutabile (servono 2 finestre MA28 complete)' :
        `MA28 organico GA4 ${R.PS(m.trend[1].ma28.cur! - m.trend[1].ma28.prev!, m.trend[1].ma28.prev!, 1)} · click GSC ${R.PS(m.trend[2].ma28.cur! - m.trend[2].ma28.prev!, m.trend[2].ma28.prev!, 1)} · distanza ${fmtDec(s.gap * 100, 1)} punti (limite ${fmtDec(PARAMS.trendGap * 100, 0)} punti)` +
        (s.flagged ? ' · GA4 e GSC descrivono andamenti diversi: la causa più probabile è l’attribuzione GA4, non il traffico; il click GSC è la misura di riferimento' : ' · andamenti coerenti'))
  } else {
    add('ratio', 'Rapporto sessioni Google organic (GA4) / click GSC — rotture', 'notice', 'dato non disponibile (Search Console non raggiungibile)')
  }

  const aligned = !m.gsc || (win.start === m.input.requestedStart)
  add('range', 'Intervalli GA4 / GSC / CRM allineati', aligned ? 'ok' : 'anomaly',
    `inizio comune ${win.start} · GA4 e CRM fino a ${win.aggEnd} (${m.periodDaysGa4} gg) · GSC fino a ${m.gsc ? `${win.gscEnd} (${m.periodDaysGsc} gg)` : 'n.d.'} — le differenze di fine derivano solo dal taglio per lag dichiarato`)

  if (m.crm) {
    const k = m.crm
    add('crmsum', 'Somma delle righe fonte lead = lead totali', k.rowsSum === k.total ? 'ok' : 'error', `${k.rowsSum} vs ${k.total} lead (inclusa la riga «${CRM_UNSET.toLowerCase()}»)`)
    add('crm', 'Lead con fonte valorizzata', k.total === 0 ? 'notice' : k.sourceCoverage >= PARAMS.minCrmSourceCoverage ? 'ok' : 'notice',
      `${k.sourceFilled}/${k.total} lead (campo canale_acquisizione)` + (k.total > 0 ? ` = ${R.P(k.sourceFilled, k.total, 1)}; senza fonte ${k.total - k.sourceFilled} lead, visibili nella tabella` : ''))
    const small = Object.values(k.byCanale).filter(x => x.total < PARAMS.minChannelSample && x.canale !== CRM_UNSET)
    add('sample', `Campione per canale CRM (minimo ${PARAMS.minChannelSample} lead)`, small.length ? 'notice' : 'ok',
      `${small.length} canali su ${Object.values(k.byCanale).filter(x => x.canale !== CRM_UNSET).length} sotto la soglia: i rapporti lead per 100 sessioni sono indicativi`)
    add('aicrm', 'Lead da assistenti AI distinguibili nel CRM', k.hasAi ? 'ok' : 'notice',
      k.hasAi ? `${k.byCanale['AI'].total} lead con canale AI` : `no: ${CRM_AI_NOT_EMITTED}; i lead da assistenti AI finiscono in ALTRO e non sono distinguibili`)
  } else add('crm', 'Lead con fonte valorizzata', 'notice', `dato non disponibile${m.input.crmError ? ' (' + m.input.crmError + ')' : ''}`)

  if (m.geo) {
    const geo = m.geo
    add('geoq', 'Serie mensile AI/GEO: intervallo interrogato', geo.monthsQueried >= PARAMS.geoMonths ? 'ok' : 'anomaly',
      `${geo.range.start} → ${geo.range.end} = ${geo.monthsQueried} mesi interrogati (richiesti ${PARAMS.geoMonths}, ultimo parziale)` + (geo.monthsQueried >= PARAMS.geoMonths ? '' : ' · la query è troncata: non è un limite del dato'))
    add('geo', 'Baseline storica AI/GEO', geo.sufficient ? 'ok' : 'notice',
      (geo.firstDataMonth ? `serie disponibile da ${geo.firstDataMonth} (${geo.monthsWithData} mesi con dati GA4 su ${geo.monthsQueried} interrogati)` : `nessun mese con dati GA4 nei ${geo.monthsQueried} mesi interrogati`) +
      ` · ${geo.monthsBefore} mesi con dati prima dell'attivazione (${m.input.geoActivation.date}), minimo richiesto ${PARAMS.minBaselineMonths}` +
      (geo.sufficient ? ' · serie sufficiente per un confronto descrittivo' : ' · serie insufficiente per attribuzione (esito del controllo, non di una query troncata)'))
  } else add('geo', 'Baseline storica AI/GEO', 'notice', 'dato non disponibile')
  return checks
}

export class ReportAssertionError extends Error {
  failures: Check[]
  constructor(failures: Check[]) {
    super('REPORT_ASSERT_FAILED: ' + failures.map(f => `${f.id} → ${f.value}`).join(' | '))
    this.name = 'ReportAssertionError'; this.failures = failures
  }
}
export const blockingErrors = (checks: Check[]) => checks.filter(c => c.level === 'error')
export const anomalies = (checks: Check[]) => checks.filter(c => c.level === 'anomaly')
