// ============================================================
// seo-report-engine.ts
// Motore PURO del "Report Analytics Live — eCura" (nessun I/O, nessun fetch).
//
// Principi (vedi prompt di correzione D1–D14):
//  - UNA sola query base GA4 (date × canale × source × medium → sessioni) alimenta KPI,
//    macro-canali, tabella source/medium e serie giornaliera.
//  - Finestre temporali dichiarate: GA4 fino a oggi−2, GSC fino a oggi−3 (dataState final).
//  - Nessun numero scritto a mano: ogni cifra nasce da dati; ogni percentuale passa dal
//    registro `PctRegistry` e viene verificata (assert 6).
//  - Controlli di qualità calcolati a runtime; gli assert 1, 2, 3, 6 sono "hard".
// ============================================================

// ── Parametri di metodo (soglie dichiarate nel report, non misure) ──────────
export const PARAMS = {
  ga4LagDays: 2,            // GA4: ultimo giorno incluso = oggi − 2
  gscLagDays: 3,            // GSC: ultimo giorno incluso = oggi − 3 (dataState: final)
  tolerance: 0.005,         // ±0,5% quadratura serie giornaliera / query di controllo
  directAlert: 0.25,        // Direct > 25% → possibile sotto-attribuzione
  notSetWarn: 0.05,         // quota (not set)/(other) oltre la quale si avvisa
  ratioLow: 0.75,           // rapporto sessioni GA4 Google organic / click GSC: soglia operativa
  ratioHigh: 0.90,          //   (indicativa, definita dal committente: non è uno standard di settore)
  minCrmSourceCoverage: 0.5,// copertura minima del campo fonte lead per mostrare la cross-tab
  trendBand: 0.10,          // variazione MA7 oltre ±10% = 'in aumento/in calo' (convenzione di lettura, non test statistico)
  minChannelSample: 30,     // sotto questa numerosità per canale i confronti sono dichiarati non affidabili
  minBaselineMonths: 3,     // mesi pre-attivazione GEO con dati GA4 per parlare di baseline
  topQueries: 15,
  topPages: 10,
  smTableRows: 30,
}

// ── Tipi di input ───────────────────────────────────────────────────────────
export interface BaseRow { date: string; channelGrouping: string; source: string; medium: string; sessions: number }
export interface SmDetail { source: string; medium: string; users: number; bounceRate: number }
export interface ReportInput {
  now: Date
  requestedStart: string
  requestedEnd: string
  siteUrl: string
  measurementId: string
  ga4PropertyId: string
  ga4: {
    channelDimension: string | null   // nome dimensione GA4 usata per il raggruppamento canali (null = non disponibile)
    baseRows: BaseRow[] | null
    control: { sessions: number; users: number; newUsers: number; bounceRate: number; avgSessionDuration: number; pageviews: number } | null
    smDetail: SmDetail[] | null
    topPages: { page: string; pageviews: number; sessions: number }[] | null
    devices: { device: string; sessions: number }[] | null
    countries: { country: string; sessions: number }[] | null
    directLanding: { landing: string; sessions: number }[] | null
    directBrowsers: { browser: string; sessions: number }[] | null
    monthly: { month: string; source: string; medium: string; sessions: number }[] | null
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
  sampleNote?: string   // se valorizzato il report è un ESEMPIO (dati sintetici) e lo dichiara in copertina
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
export const monthOf = (s: string) => s.slice(0, 7)
export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number); const t = y * 12 + (m - 1) + n
  return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`
}
export const fmtDay = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}`
export const fmtDayY = (s: string) => `${s.slice(8, 10)}/${s.slice(5, 7)}/${s.slice(0, 4)}`

export interface Windows { today: string; start: string; ga4End: string; gscEnd: string; commonEnd: string; ga4Cut: string; gscCut: string }
export function computeWindows(now: Date, reqStart: string, reqEnd: string): Windows {
  const today = romeToday(now)
  const ga4Cut = addDays(today, -PARAMS.ga4LagDays)
  const gscCut = addDays(today, -PARAMS.gscLagDays)
  const ga4End = minDate(reqEnd, ga4Cut)
  const gscEnd = minDate(reqEnd, gscCut)
  return { today, start: reqStart, ga4End, gscEnd, commonEnd: minDate(ga4End, gscEnd), ga4Cut, gscCut }
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
  const mk = (category: Category, label: string): Classified => ({ category, label, isGoogleOrganic: category === 'SEO' && src === 'google' })
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
export type Status = 'ok' | 'warn' | 'fail'
export interface Check { id: string; label: string; status: Status; value: string; hard?: boolean; note?: string }
export interface WeekRow { weekStart: string; weekEnd: string; days: number; full: boolean; ga4Org: number; gscClicks: number | null; gscDays: number; byChannel: Record<ChartChannel, number>; total: number }
export interface SmRow { source: string; medium: string; label: string; category: Category; sessions: number; users: number | null; bounceRate: number | null }

export interface Model {
  input: ReportInput
  win: Windows
  ga4Days: number
  gscDays: number
  ok: boolean                      // base query disponibile
  total: number
  dates: string[]
  series: Record<ChartChannel, number[]>
  dailyTotal: number[]
  ma7Total: (number | null)[]
  gaOrgDaily: number[]
  gaOrgMa7: (number | null)[]
  gscDaily: (number | null)[]      // allineata a `dates`; null oltre il cutoff GSC
  gscMa7: (number | null)[]
  weeks: WeekRow[]
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
  trend: { label: string; unit: string; cur: number | null; prev: number | null; curDate: string; prevDate: string }[]
  direct: null | { total: number; withParams: number; inApp: number; inAppEvidence: boolean }
  geo: null | {
    months: { month: string; total: number; ai: number; partial: boolean }[]
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
    byCanale: Record<string, { total: number; web: number; status: Record<string, number> }>
    showSourceTable: boolean
  }
}

const STATUS_COLS = ['CONTRACT_SENT', 'BROCHURE_SENT', 'NEW'] as const
export const TEMP_ORDER = ['caldo', 'tiepido', 'freddo', 'n/a']

export function movingAvg(values: (number | null)[], w = 7): (number | null)[] {
  return values.map((_, i) => {
    if (i < w - 1) return null
    let s = 0
    for (let k = i - w + 1; k <= i; k++) { const v = values[k]; if (v == null) return null; s += v }
    return s / w
  })
}

export function buildModel(input: ReportInput): Model {
  const win = computeWindows(input.now, input.requestedStart, input.requestedEnd)
  const base = input.ga4.baseRows
  const ga4Days = Math.max(0, diffDaysInclusive(win.start, win.ga4End))
  const gscDays = Math.max(0, diffDaysInclusive(win.start, win.gscEnd))
  const dates = ga4Days > 0 ? dateRange(win.start, win.ga4End) : []
  const zeros = () => dates.map(() => 0)
  const series = Object.fromEntries(CHART_CHANNELS.map(c => [c, zeros()])) as Record<ChartChannel, number[]>

  const m: Model = {
    input, win, ga4Days, gscDays, ok: !!base && dates.length > 0, total: 0, dates, series,
    dailyTotal: zeros(), ma7Total: [], gaOrgDaily: zeros(), gaOrgMa7: [], gscDaily: [], gscMa7: [], weeks: [],
    macro: { SEO: 0, AI: 0, Direct: 0, Paid: 0, Social: 0, Altro: 0 },
    seoEngines: [], aiTools: [], paidSources: [], googleOrganic: 0, smTable: [], nativeChannels: [], notSet: 0,
    excludedRows: { count: 0, sessions: 0, maxDate: null },
    gsc: null, common: { ga4Org: 0, gscClicks: 0, days: 0, ratio: null }, trend: [], direct: null, geo: null, crm: null,
  }
  if (!m.ok) return m

  // ── 1. Righe nella finestra (le righe oltre il cutoff vengono ESCLUSE e contate) ──
  const idx = new Map(dates.map((d, i) => [d, i]))
  const rows: BaseRow[] = []
  for (const r of base!) {
    if (r.date < win.start || r.date > win.ga4End) {
      m.excludedRows.count++; m.excludedRows.sessions += r.sessions
      if (!m.excludedRows.maxDate || r.date > m.excludedRows.maxDate) m.excludedRows.maxDate = r.date
      continue
    }
    rows.push(r)
  }
  m.total = rows.reduce((s, r) => s + r.sessions, 0)

  // ── 2. Aggregazioni indipendenti dalla stessa base ──
  const seo: Record<string, number> = {}, ai: Record<string, number> = {}, paid: Record<string, number> = {}
  const smMap = new Map<string, SmRow>()
  const native = new Map<string, number>()
  for (const r of rows) {
    const cl = classifySource(r.source, r.medium)
    const i = idx.get(r.date)!
    m.series[chartChannelOf(cl)][i] += r.sessions
    m.dailyTotal[i] += r.sessions
    if (cl.isGoogleOrganic) { m.gaOrgDaily[i] += r.sessions; m.googleOrganic += r.sessions }
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

  m.ma7Total = movingAvg(m.dailyTotal)
  m.gaOrgMa7 = movingAvg(m.gaOrgDaily)

  // ── 3. GSC ──
  const gscMap = new Map<string, number>()
  if (input.gsc) {
    for (const r of input.gsc.daily) if (r.date >= win.start && r.date <= win.gscEnd) gscMap.set(r.date, (gscMap.get(r.date) || 0) + r.clicks)
  }
  m.gscDaily = dates.map(d => (input.gsc && d <= win.gscEnd ? (gscMap.get(d) ?? 0) : null))
  m.gscMa7 = movingAvg(m.gscDaily)
  if (input.gsc) {
    const t = input.gsc.totals
    const dailyRows = input.gsc.daily.filter(r => r.date >= win.start && r.date <= win.gscEnd)
    const brandRe = /e[\s-]?cura/i
    const topN = input.gsc.queries.slice(0, PARAMS.topQueries)
    m.gsc = {
      clicks: t.clicks, impressions: t.impressions, position: t.position,
      ctr: t.impressions > 0 ? t.clicks / t.impressions : 0,
      clicksPerDay: gscDays > 0 ? t.clicks / gscDays : 0,
      dailySum: { clicks: dailyRows.reduce((s, r) => s + r.clicks, 0), impressions: dailyRows.reduce((s, r) => s + r.impressions, 0) },
      maxDailyDate: dailyRows.reduce<string | null>((mx, r) => (!mx || r.date > mx ? r.date : mx), null),
      excludedRows: input.gsc.daily.length - dailyRows.length,
      brand: { clicks: topN.filter(q => brandRe.test(q.query)).reduce((s, q) => s + q.clicks, 0), rows: topN.filter(q => brandRe.test(q.query)).length },
    }
  }

  // ── 4. Finestra comune GA4/GSC e settimane lun–dom ──
  const commonDates = dates.filter(d => d <= win.commonEnd)
  m.common.days = commonDates.length
  m.common.ga4Org = commonDates.reduce((s, d) => s + m.gaOrgDaily[idx.get(d)!], 0)
  m.common.gscClicks = input.gsc ? commonDates.reduce((s, d) => s + (gscMap.get(d) || 0), 0) : 0
  m.common.ratio = input.gsc && m.common.gscClicks > 0 ? m.common.ga4Org / m.common.gscClicks : null
  const wk = new Map<string, WeekRow>()
  dates.forEach((d, i) => {
    const ws = weekStart(d)
    let w = wk.get(ws)
    if (!w) {
      w = { weekStart: ws, weekEnd: addDays(ws, 6), days: 0, full: false, ga4Org: 0, gscClicks: input.gsc ? 0 : null, gscDays: 0,
        byChannel: Object.fromEntries(CHART_CHANNELS.map(c => [c, 0])) as Record<ChartChannel, number>, total: 0 }
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
  m.weeks = [...wk.values()].map(w => ({ ...w, full: w.days === 7 && (!input.gsc || w.gscDays === 7) }))

  // ── 5. Lettura del trend: sempre su media mobile 7 gg ──
  const last = dates.length - 1
  const tr = (label: string, unit: string, ma: (number | null)[], endIdx: number) => {
    const cur = endIdx >= 0 ? ma[endIdx] : null
    const prev = endIdx - 7 >= 0 ? ma[endIdx - 7] : null
    m.trend.push({ label, unit, cur: cur ?? null, prev: prev ?? null, curDate: dates[endIdx] || '', prevDate: dates[endIdx - 7] || '' })
  }
  tr('Sessioni GA4 totali', 'sessioni/giorno', m.ma7Total, last)
  tr('Sessioni GA4 Google organic', 'sessioni/giorno', m.gaOrgMa7, last)
  if (input.gsc) tr('Click Search Console', 'click/giorno', m.gscMa7, dates.indexOf(win.gscEnd))

  // ── 6. Direct (D12) ──
  const dl = input.ga4.directLanding, db = input.ga4.directBrowsers
  if (dl) {
    const tot = dl.reduce((s, r) => s + r.sessions, 0)
    const withParams = dl.filter(r => /[?&](utm_[a-z]+|gclid|gbraid|wbraid|fbclid)=/i.test(r.landing)).reduce((s, r) => s + r.sessions, 0)
    const inAppRe = /webview|in-app|instagram|facebook|linkedin|snapchat|tiktok|line|wechat|gsa|\(in-app\)/i
    const inApp = db ? db.filter(r => inAppRe.test(r.browser)).reduce((s, r) => s + r.sessions, 0) : 0
    m.direct = { total: tot, withParams, inApp, inAppEvidence: !!db }
  }

  // ── 7. GEO 12 mesi (D10) ──
  if (input.ga4.monthly) {
    const mm = new Map<string, { total: number; ai: number }>()
    for (const r of input.ga4.monthly) {
      const e = mm.get(r.month) || { total: 0, ai: 0 }
      e.total += r.sessions
      if (classifySource(r.source, r.medium).category === 'AI') e.ai += r.sessions
      mm.set(r.month, e)
    }
    const lastMonth = monthOf(win.ga4End)
    const months = [...mm.keys()].sort().map(k => ({ month: k, total: mm.get(k)!.total, ai: mm.get(k)!.ai, partial: k === lastMonth }))
    const act = monthOf(input.geoActivation.date)
    const before = months.filter(x => x.month < act && x.total > 0)
    const after = months.filter(x => x.month >= act)
    m.geo = {
      months, activationMonth: act,
      monthsBefore: before.length, aiBefore: before.reduce((s, x) => s + x.ai, 0),
      monthsAfter: after.length, aiAfter: after.reduce((s, x) => s + x.ai, 0),
      sufficient: before.length >= PARAMS.minBaselineMonths,
    }
  }

  // ── 8. CRM (D8, D9) ──
  if (input.crm) {
    const tempStatus: Record<string, Record<string, number>> = {}
    const byTemp: Record<string, number> = {}
    const statusTotals: Record<string, number> = {}
    const byCanale: Record<string, { total: number; web: number; status: Record<string, number> }> = {}
    let total = 0, filled = 0, webTotal = 0
    for (const r of input.crm.rows) {
      const t = (r.temperatura || 'n/a').toLowerCase()
      const s = r.status || 'UNKNOWN'
      total += r.count
      ;(tempStatus[t] ||= {})[s] = ((tempStatus[t] || {})[s] || 0) + r.count
      byTemp[t] = (byTemp[t] || 0) + r.count
      statusTotals[s] = (statusTotals[s] || 0) + r.count
      if ((r.dettaglio || '') === 'ecura_landing') webTotal += r.count
      const canale = (r.canale || '').trim().toUpperCase()
      if (canale) {
        filled += r.count
        const c = (byCanale[canale] ||= { total: 0, web: 0, status: {} })
        c.total += r.count
        if ((r.dettaglio || '') === 'ecura_landing') c.web += r.count
        c.status[s] = (c.status[s] || 0) + r.count
      }
    }
    const coverage = total > 0 ? filled / total : 0
    m.crm = { total, tempOrder: TEMP_ORDER, byTemp, tempStatus, statusTotals, sourceFilled: filled, sourceCoverage: coverage, webTotal, byCanale,
      showSourceTable: total > 0 && coverage >= PARAMS.minCrmSourceCoverage }
  }
  return m
}

// ── Mappa canale CRM → canale GA4 (solo dove la corrispondenza è univoca) ──
export function ga4SessionsForCrmChannel(m: Model, canale: string): number | null {
  if (canale === 'DIRETTO') return m.macro.Direct
  if (canale === 'ORGANICO') return m.macro.SEO
  return null
}

// ── Controlli di qualità ────────────────────────────────────────────────────
// Ogni riga è calcolata a runtime. Le percentuali passano dal registro (assert 6).
export function runChecks(m: Model, R: PctRegistry): Check[] {
  const checks: Check[] = []
  const win = m.win
  if (!m.ok) {
    checks.push({ id: 'base', label: 'Query base GA4', status: 'fail', value: 'dato non disponibile (query base fallita o intervallo vuoto)', hard: true })
    return checks
  }
  const sgn = (n: number) => (n > 0 ? `+${fmtInt(n)}` : n < 0 ? `−${fmtInt(-n)}` : '0')
  const dpct = (a: number, b: number) => R.PS(a - b, b, 2)

  // H1 — quadratura canali / source-medium / canali nativi vs KPI (Δ esatto)
  const chanSum = Object.values(m.macro).reduce((a, b) => a + b, 0)
  const smSum = m.smTable.reduce((s, r) => s + r.sessions, 0)
  const natSum = m.nativeChannels.reduce((s, [, v]) => s + v, 0)
  const eq = (id: string, label: string, v: number) => checks.push({ id, label, hard: true, status: v === m.total ? 'ok' : 'fail',
    value: `${fmtInt(v)} vs ${fmtInt(m.total)} sessioni · Δ ${sgn(v - m.total)}` })
  eq('H1a', 'Quadratura macro-canali vs KPI', chanSum)
  eq('H1b', 'Quadratura tabella source/medium vs KPI', smSum)
  if (m.input.ga4.channelDimension) eq('H1c', 'Quadratura canali GA4 nativi vs KPI', natSum)
  else checks.push({ id: 'H1c', label: 'Quadratura canali GA4 nativi vs KPI', status: 'warn', value: 'dato non disponibile (dimensione canale GA4 non interrogabile)' })

  // H2 — serie giornaliera vs KPI (±0,5%), stesso intervallo
  const dailySum = m.dailyTotal.reduce((a, b) => a + b, 0)
  const dRel = m.total > 0 ? Math.abs(dailySum - m.total) / m.total : (dailySum === 0 ? 0 : 1)
  const sameLen = m.dates.length === m.ga4Days
  checks.push({ id: 'H2', label: 'Quadratura serie giornaliera vs KPI', hard: true, status: dRel <= PARAMS.tolerance && sameLen ? 'ok' : 'fail',
    value: `${fmtInt(dailySum)} vs ${fmtInt(m.total)} sessioni · Δ ${dpct(dailySum, m.total)} (tolleranza ±${R.PM(PARAMS.tolerance * 100, 1)}) · ${m.dates.length} punti su ${m.ga4Days} giorni (${win.start} → ${win.ga4End})` })

  // H3 — nessuna data oltre il cutoff negli aggregati
  const maxGa = m.dates.length ? m.dates[m.dates.length - 1] : ''
  const gscUsedMax = m.gscDaily.reduce<string>((mx, v, i) => (v != null && m.dates[i] > mx ? m.dates[i] : mx), '')
  const h3ok = maxGa <= win.ga4Cut && (!gscUsedMax || gscUsedMax <= win.gscCut) && (m.gsc?.maxDailyDate == null || m.gsc.maxDailyDate <= win.gscCut)
  checks.push({ id: 'H3', label: 'Nessun giorno non consolidato negli aggregati', hard: true, status: h3ok ? 'ok' : 'fail',
    value: `GA4 ultimo giorno incluso ${maxGa || 'n.d.'} (limite ${win.ga4Cut}) · GSC ultimo giorno incluso ${m.gsc?.maxDailyDate ?? 'n.d.'} (limite ${win.gscCut})` })

  // Giorni esclusi per lag
  const exGa = Math.max(0, diffDaysInclusive(addDays(win.ga4End, 1), m.input.requestedEnd > win.today ? win.today : m.input.requestedEnd))
  const exGsc = m.input.gsc ? Math.max(0, diffDaysInclusive(addDays(win.gscEnd, 1), m.input.requestedEnd > win.today ? win.today : m.input.requestedEnd)) : null
  const exTxt = (n: number, from: string) => (n === 0 ? '0 gg' : `${n} gg (da ${fmtDayY(from)})`)
  checks.push({ id: 'lag', label: 'Giorni esclusi per lag (GA4 / GSC)', status: 'ok',
    value: `GA4: ${exTxt(exGa, addDays(win.ga4End, 1))} · GSC: ${exGsc == null ? 'dato non disponibile' : exTxt(exGsc, addDays(win.gscEnd, 1))}` +
      (m.excludedRows.count ? ` · righe GA4 fuori finestra scartate: ${m.excludedRows.count} (${fmtInt(m.excludedRows.sessions)} sessioni)` : '') +
      (m.gsc && m.gsc.excludedRows ? ` · righe GSC fuori finestra scartate: ${m.gsc.excludedRows}` : '') })

  // Query di controllo senza dimensioni
  const ctl = m.input.ga4.control
  if (ctl) {
    const rel = m.total > 0 ? Math.abs(ctl.sessions - m.total) / m.total : 0
    checks.push({ id: 'ctl', label: 'Totale GA4 (query di controllo senza dimensioni) vs KPI', status: rel <= PARAMS.tolerance ? 'ok' : 'fail',
      value: `${fmtInt(ctl.sessions)} vs ${fmtInt(m.total)} sessioni · Δ ${sgn(ctl.sessions - m.total)} (${dpct(ctl.sessions, m.total)})` })
  } else checks.push({ id: 'ctl', label: 'Totale GA4 (query di controllo senza dimensioni) vs KPI', status: 'warn', value: 'dato non disponibile' })

  const dev = m.input.ga4.devices
  if (dev) {
    const ds = dev.reduce((s, d) => s + d.sessions, 0)
    checks.push({ id: 'dev', label: 'Totale device vs KPI', status: m.total > 0 && Math.abs(ds - m.total) / m.total <= PARAMS.tolerance ? 'ok' : 'fail',
      value: `${fmtInt(ds)} vs ${fmtInt(m.total)} sessioni · Δ ${sgn(ds - m.total)}` })
  }

  checks.push({ id: 'notset', label: 'Quota (not set) / (other)', status: m.total > 0 && m.notSet / m.total > PARAMS.notSetWarn ? 'warn' : 'ok',
    value: `${fmtInt(m.notSet)} su ${fmtInt(m.total)} sessioni = ${R.P(m.notSet, m.total, 1)} (soglia di avviso ${R.PM(PARAMS.notSetWarn * 100, 0)})` })

  const dShare = m.total > 0 ? m.macro.Direct / m.total : 0
  checks.push({ id: 'direct', label: 'Quota Direct', status: dShare > PARAMS.directAlert ? 'warn' : 'ok',
    value: `${fmtInt(m.macro.Direct)} su ${fmtInt(m.total)} sessioni = ${R.P(m.macro.Direct, m.total, 1)}` +
      (dShare > PARAMS.directAlert ? ` · ⚠️ oltre ${R.PM(PARAMS.directAlert * 100, 0)}: possibile sotto-attribuzione` : '') })

  if (m.gsc) {
    const dc = m.gsc.dailySum.clicks
    checks.push({ id: 'gscsum', label: 'GSC: somma click giornalieri vs totale', status: m.gsc.clicks > 0 && Math.abs(dc - m.gsc.clicks) / m.gsc.clicks <= PARAMS.tolerance ? 'ok' : 'fail',
      value: `${fmtInt(dc)} vs ${fmtInt(m.gsc.clicks)} click · Δ ${sgn(dc - m.gsc.clicks)}` })
    const full = m.weeks.filter(w => w.full && (w.gscClicks || 0) > 0)
    const rr = (w: WeekRow) => w.ga4Org / (w.gscClicks as number)
    const out = full.filter(w => rr(w) < PARAMS.ratioLow || rr(w) > PARAMS.ratioHigh)
    const lo = full.length ? full.reduce((a, b) => (rr(b) < rr(a) ? b : a)) : null
    const hi = full.length ? full.reduce((a, b) => (rr(b) > rr(a) ? b : a)) : null
    checks.push({ id: 'ratio', label: 'Rapporto sessioni Google organic (GA4) / click GSC', status: !full.length || out.length ? 'warn' : 'ok',
      value: `periodo comune ${win.start} → ${win.commonEnd} (${m.common.days} gg): ${fmtInt(m.common.ga4Org)} sessioni / ${fmtInt(m.common.gscClicks)} click = ${m.common.ratio == null ? 'n.d.' : R.P(m.common.ga4Org, m.common.gscClicks, 1)}` +
        ` · settimane complete ${full.length}` + (lo && hi ? `, min ${R.P(lo.ga4Org, lo.gscClicks as number, 1)} (sett. ${fmtDay(lo.weekStart)}), max ${R.P(hi.ga4Org, hi.gscClicks as number, 1)} (sett. ${fmtDay(hi.weekStart)})` : '') +
        `, fuori soglia ${R.PM(PARAMS.ratioLow * 100, 0)}–${R.PM(PARAMS.ratioHigh * 100, 0)}: ${out.length}` })
  } else checks.push({ id: 'ratio', label: 'Rapporto sessioni Google organic (GA4) / click GSC', status: 'warn', value: 'dato non disponibile (Search Console non raggiungibile)' })

  const aligned = !m.gsc || (win.start === m.input.requestedStart)
  checks.push({ id: 'range', label: 'Intervalli GA4 / GSC / CRM allineati', status: aligned ? 'ok' : 'fail',
    value: `inizio comune ${win.start} · GA4 fino a ${win.ga4End} (${m.ga4Days} gg) · GSC fino a ${m.gsc ? `${win.gscEnd} (${m.gscDays} gg)` : 'n.d.'} · CRM ${m.crm ? `fino a ${win.ga4End}` : 'n.d.'} — le differenze di fine derivano solo dal taglio per lag dichiarato` })

  if (m.crm) {
    checks.push({ id: 'crm', label: 'Lead con fonte valorizzata', status: m.crm.total === 0 ? 'warn' : m.crm.sourceCoverage >= PARAMS.minCrmSourceCoverage ? 'ok' : 'warn',
      value: `${m.crm.sourceFilled}/${m.crm.total} lead (campo canale_acquisizione)` + (m.crm.total > 0 ? ` = ${R.P(m.crm.sourceFilled, m.crm.total, 1)}` : '') })
  } else checks.push({ id: 'crm', label: 'Lead con fonte valorizzata', status: 'warn', value: `dato non disponibile${m.input.crmError ? ' (' + m.input.crmError + ')' : ''}` })

  if (m.geo) checks.push({ id: 'geo', label: 'Baseline storica AI/GEO', status: m.geo.sufficient ? 'ok' : 'warn',
    value: `${m.geo.monthsBefore} mesi con dati GA4 prima dell'attivazione (${m.input.geoActivation.date}); minimo richiesto ${PARAMS.minBaselineMonths}` })
  else checks.push({ id: 'geo', label: 'Baseline storica AI/GEO', status: 'warn', value: 'dato non disponibile' })
  return checks
}

export class ReportAssertionError extends Error {
  failures: Check[]
  constructor(failures: Check[]) {
    super('REPORT_ASSERT_FAILED: ' + failures.map(f => `${f.id} → ${f.value}`).join(' | '))
    this.name = 'ReportAssertionError'; this.failures = failures
  }
}
export const hardFailures = (checks: Check[]) => checks.filter(c => c.hard && c.status === 'fail')
