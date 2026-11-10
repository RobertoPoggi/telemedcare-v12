// ============================================================
// seo-report-data.ts — raccolta dati per il "Report Analytics Live".
// Il totale e' la query GA4 SENZA dimensioni; macro-canali e source/medium vengono dalla query senza data sullo
// stesso intervallo; la query datata serve solo per serie giornaliera e consolidamento. Finestre tagliate sui giorni consolidati.
// ============================================================
import { ga4RunReport, searchConsoleQuery, GoogleApiError, sanitizeGoogleText, type GoogleAnalyticsConfig, type GoogleErrorKind } from './google-analytics'
import { computeWindows, gscProbeEnd, detectConsolidation, addDays, addMonths, monthOf, PARAMS, type ReportInput, type BaseRow, type SmBaseRow, type SmDetail, type GaMeta, type QueryStats, type QueryFailure } from './seo-report-engine'

const ymd = (d: string) => d.replace(/-/g, '')
const fromYmd = (d: string) => `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
const num = (x: string | undefined) => { const n = parseFloat(x || '0'); return Number.isFinite(n) ? n : 0 }

async function paged(config: GoogleAnalyticsConfig, body: Parameters<typeof ga4RunReport>[1]) {
  const limit = 100000
  const first = await ga4RunReport(config, { ...body, limit, offset: 0 })
  const rows = [...first.rows]
  while (rows.length < first.rowCount && rows.length > 0) {
    const nxt = await ga4RunReport(config, { ...body, limit, offset: rows.length })
    if (!nxt.rows.length) break
    rows.push(...nxt.rows)
  }
  return rows
}

/** F1: una query che alimenta KPI e quadrature è fallita → il report NON si genera (nessun PDF con sezioni vuote). */
export class ReportUnavailableError extends Error {
  kind: GoogleErrorKind
  status: 'quota_exhausted' | 'unavailable'
  constructor(kind: GoogleErrorKind, reason: string) {
    super(`Report non disponibile: ${reason.charAt(0).toLowerCase()}${reason.slice(1)}`)
    this.name = 'ReportUnavailableError'; this.kind = kind; this.status = kind === 'quota' ? 'quota_exhausted' : 'unavailable'
  }
}

export interface CollectParams {
  now: Date; startDate: string; endDate: string; siteUrl: string; measurementId: string
  geoActivation: { date: string; label: string }
}

export async function collectReportInput(
  config: GoogleAnalyticsConfig, db: any | undefined, p: CollectParams
): Promise<ReportInput> {
  const errors: string[] = []
  const win0 = computeWindows(p.now, p.startDate, p.endDate)
  // Ogni query è contata: serve a scrivere «N query fallite su M totali». Messaggi sempre sintetici e su una riga (mai il body di Google).
  const stats: QueryStats = { total: 0, failed: 0, failures: [] }
  const kindOf = (e: any): GoogleErrorKind => (e instanceof GoogleApiError ? e.kind : 'other')
  const msgOf = (e: any) => (e instanceof GoogleApiError ? e.message : sanitizeGoogleText(e?.message || e, 200))
  const fail = (label: string, api: QueryFailure['api'], e: any) => {
    const f: QueryFailure = { label, api, kind: kindOf(e), message: msgOf(e) }
    stats.failed++; stats.failures.push(f); errors.push(`${label}: ${f.message}`)
    return f
  }
  /** Sezione accessoria (pagine, device, paesi, Direct, serie mensile, GSC): se fallisce il report si genera e la dichiara. */
  const safe = async <T>(label: string, fn: () => Promise<T>, api: QueryFailure['api'] = 'GA4'): Promise<T | null> => {
    stats.total++
    try { return await fn() } catch (e: any) { fail(label, api, e); return null }
  }
  /** Query di base (serie giornaliera, controllo senza dimensioni, canale × source × medium): se fallisce il report NON si genera. */
  const required = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    stats.total++
    try { return await fn() } catch (e: any) { const f = fail(label, 'GA4', e); throw new ReportUnavailableError(f.kind as GoogleErrorKind, f.message) }
  }
  const metaOf = (r: { metadata?: any }, range: string): GaMeta => ({ ...(r.metadata || {}), range })

  // ── 1. Serie datata (data × canale × source × medium): SOLO serie giornaliera e rilevamento del consolidamento ──
  const drDated = [{ startDate: win0.start, endDate: win0.ga4End }]
  let channelDimension: string | null = null
  let baseRows: BaseRow[] | null = null
  const datedQuery = (dims: string[]) => paged(config, { dateRanges: drDated, dimensions: dims.map(name => ({ name })), metrics: [{ name: 'sessions' }] })
  // Due nomi possibili per la dimensione canale: si passa al secondo SOLO se il primo è «query non valida» (400).
  // Con quota esaurita, credenziali errate o errore del server riprovare con un altro nome brucerebbe solo altra quota.
  for (const dim of ['sessionDefaultChannelGroup', 'sessionDefaultChannelGrouping']) {
    try {
      const rows = await datedQuery(['date', dim, 'sessionSource', 'sessionMedium'])
      baseRows = rows.map(r => ({ date: fromYmd(r.dimensions[0]), channelGrouping: r.dimensions[1], source: r.dimensions[2], medium: r.dimensions[3], sessions: parseInt(r.metrics[0] || '0', 10) }))
      channelDimension = dim; stats.total++; break
    } catch (e: any) {
      if (!(e instanceof GoogleApiError) || e.kind !== 'invalid') { stats.total++; const f = fail('GA4 serie giornaliera', 'GA4', e); throw new ReportUnavailableError(f.kind as GoogleErrorKind, f.message) }
    }
  }
  if (!baseRows) {
    baseRows = await required('GA4 serie giornaliera (senza canale)', async () => (await datedQuery(['date', 'sessionSource', 'sessionMedium']))
      .map(r => ({ date: fromYmd(r.dimensions[0]), channelGrouping: 'n.d.', source: r.dimensions[1], medium: r.dimensions[2], sessions: parseInt(r.metrics[0] || '0', 10) })))
  }

  // ── 2. Finestra definitiva: gli ultimi giorni in consolidamento sono esclusi da TUTTE le query non datate ──
  const cons = detectConsolidation(baseRows, win0.start, win0.ga4End)
  const win = computeWindows(p.now, p.startDate, p.endDate, cons.tailDays)
  const dr = [{ startDate: win.start, endDate: win.aggEnd }]
  const drTxt = `${win.start} → ${win.aggEnd}`

  // ── 3. Query SENZA data: stessa dateRanges, stessi filtri. Totale = query senza dimensioni (unica fonte di verita') ──
  let controlMeta: GaMeta | null = null
  const control = await required('GA4 controllo', async () => {
    const r = await ga4RunReport(config, { dateRanges: dr, metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'newUsers' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }, { name: 'screenPageViews' }] })
    controlMeta = metaOf(r, drTxt)
    const v = r.rows[0]?.metrics || []
    return { sessions: num(v[0]), users: num(v[1]), newUsers: num(v[2]), bounceRate: num(v[3]), avgSessionDuration: num(v[4]), pageviews: num(v[5]) }
  })
  // canale × source × medium senza data, UNA sola query con tutte le metriche (sessioni, utenti, bounce): prima erano due chiamate,
  // una per i totali e una per utenti/bounce. Fonte di macro-canali e tabella source/medium.
  const smBaseDims = channelDimension ? [{ name: channelDimension }, { name: 'sessionSource' }, { name: 'sessionMedium' }] : [{ name: 'sessionSource' }, { name: 'sessionMedium' }]
  const off = channelDimension ? 1 : 0
  const smRaw = await required('GA4 source/medium', async () => await paged(config, {
    dateRanges: dr, dimensions: smBaseDims, metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'bounceRate' }],
  }))
  const smBase: SmBaseRow[] = smRaw.map(r => ({ channelGrouping: channelDimension ? r.dimensions[0] : 'n.d.', source: r.dimensions[off], medium: r.dimensions[off + 1], sessions: parseInt(r.metrics[0] || '0', 10) }))
  // utenti e bounce per source/medium: se GA4 separa lo stesso source/medium in più canali si sommano gli utenti e si pesa il bounce sulle sessioni
  const smAcc = new Map<string, { source: string; medium: string; sessions: number; users: number; bounceW: number }>()
  for (const r of smRaw) {
    const source = r.dimensions[off], medium = r.dimensions[off + 1], sess = parseInt(r.metrics[0] || '0', 10)
    const e = smAcc.get(`${source}|||${medium}`) || { source, medium, sessions: 0, users: 0, bounceW: 0 }
    e.sessions += sess; e.users += num(r.metrics[1]); e.bounceW += num(r.metrics[2]) * sess
    smAcc.set(`${source}|||${medium}`, e)
  }
  const smDetail: SmDetail[] = [...smAcc.values()].map(e => ({ source: e.source, medium: e.medium, users: e.users, bounceRate: e.sessions > 0 ? e.bounceW / e.sessions : 0 }))
  const topPages = await safe('GA4 pagine', async () => (await ga4RunReport(config, {
    dateRanges: dr, dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: PARAMS.topPages,
  })).rows.map(r => ({ page: r.dimensions[0], pageviews: num(r.metrics[0]), sessions: num(r.metrics[1]) })))
  let devicesMeta: GaMeta | null = null
  const devices = await safe('GA4 device', async () => {
    const r = await ga4RunReport(config, { dateRanges: dr, dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }] })
    devicesMeta = metaOf(r, drTxt)
    return r.rows.map(x => ({ device: x.dimensions[0], sessions: num(x.metrics[0]) }))
  })
  const countries = await safe('GA4 paesi', async () => (await ga4RunReport(config, {
    dateRanges: dr, dimensions: [{ name: 'country' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 10,
  })).rows.map(r => ({ country: r.dimensions[0], sessions: num(r.metrics[0]) })))

  const directFilter = { filter: { fieldName: 'sessionSource', stringFilter: { matchType: 'EXACT', value: '(direct)' } } }
  const directLanding = await safe('GA4 Direct (landing)', async () => (await ga4RunReport(config, {
    dateRanges: dr, dimensions: [{ name: 'landingPagePlusQueryString' }], metrics: [{ name: 'sessions' }], dimensionFilter: directFilter, limit: 1000,
  })).rows.map(r => ({ landing: r.dimensions[0], sessions: num(r.metrics[0]) })))
  const directBrowsers = await safe('GA4 Direct (browser)', async () => (await ga4RunReport(config, {
    dateRanges: dr, dimensions: [{ name: 'browser' }], metrics: [{ name: 'sessions' }], dimensionFilter: directFilter, limit: 100,
  })).rows.map(r => ({ browser: r.dimensions[0], sessions: num(r.metrics[0]) })))

  // ── 4. Serie mensile AI/GEO: intervallo PROPRIO (non eredita startDate del report) ──
  // geoMonths mesi interi: dal primo giorno del mese (ultimo − (geoMonths−1)) fino all'ultimo giorno aggregato.
  const monthStart = `${addMonths(monthOf(win.aggEnd), -(PARAMS.geoMonths - 1))}-01`
  const monthlyRange = { start: monthStart, end: win.aggEnd }
  const monthly = await safe('GA4 serie mensile', async () => (await paged(config, {
    dateRanges: [{ startDate: monthlyRange.start, endDate: monthlyRange.end }],
    dimensions: [{ name: 'yearMonth' }, { name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'sessions' }],
  })).map(r => ({ month: `${r.dimensions[0].slice(0, 4)}-${r.dimensions[0].slice(4, 6)}`, source: r.dimensions[1], medium: r.dimensions[2], sessions: parseInt(r.metrics[0] || '0', 10) })))

  // ── Search Console: dati freschi (dataState all) tagliati al primo giorno incompleto indicato da Google ──
  // 1) serie giornaliera fino a ieri con dataState all: la risposta contiene metadata.first_incomplete_date (fuso America/Los_Angeles),
  //    il primo giorno che puo' ancora cambiare. L'ultimo giorno incluso e' il giorno PRIMA, quindi il dato e' corretto, non provvisorio.
  // 2) se Google non indica quella data (o la query fallisce) si torna ai dati definitivi (dataState final) con il ritardo fisso gscLagDays.
  let gsc: ReportInput['gsc'] = null
  let winG = win
  if (config.searchConsoleSiteUrl) {
    const probeEnd = gscProbeEnd(p.now, p.endDate)
    let fresh: { rows: any[]; firstIncomplete: string } | null = null
    if (probeEnd >= win.start) {
      stats.total++
      try {
        const r = await searchConsoleQuery(config, { startDate: win.start, endDate: probeEnd, searchType: 'web', dataState: 'all', dimensions: ['date'], rowLimit: 25000 })
        const fid = r.metadata?.first_incomplete_date
        if (typeof fid === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fid)) fresh = { rows: r.rows, firstIncomplete: fid }
      } catch (e: any) { fail('GSC serie giornaliera (dati freschi)', 'GSC', e) }
    }
    winG = computeWindows(p.now, p.startDate, p.endDate, cons.tailDays, fresh ? fresh.firstIncomplete : null)
    const dataState: 'all' | 'final' = fresh ? 'all' : 'final'
    if (winG.gscEnd >= winG.start) {
      const q = (b: any) => searchConsoleQuery(config, { startDate: winG.start, endDate: winG.gscEnd, searchType: 'web', dataState, ...b })
      const totals = await safe('GSC totali', async () => (await q({ dimensions: [] })).rows[0] || null, 'GSC')
      // con i dati freschi la serie e' quella gia' scaricata, ridotta ai giorni completi (stessa finestra dei totali); con i definitivi si interroga
      const daily = fresh
        ? fresh.rows.filter(r => (r.keys[0] || '') <= winG.gscEnd)
        : await safe('GSC serie giornaliera', async () => (await q({ dimensions: ['date'], rowLimit: 25000 })).rows, 'GSC')
      const queries = await safe('GSC query', async () => (await q({ dimensions: ['query'], rowLimit: Math.max(PARAMS.topQueries, PARAMS.hubQueries) })).rows, 'GSC')
      const pages = await safe('GSC pagine', async () => (await q({ dimensions: ['page'], rowLimit: PARAMS.topPages })).rows, 'GSC')
      if (totals && daily) {
        gsc = {
          totals: { clicks: totals.clicks, impressions: totals.impressions, position: totals.position },
          daily: daily.map(r => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
          queries: (queries || []).map(r => ({ query: r.keys[0] || '', clicks: r.clicks, impressions: r.impressions, position: r.position })),
          pages: (pages || []).map(r => ({ page: r.keys[0] || '', clicks: r.clicks, impressions: r.impressions, position: r.position })),
          dataState, firstIncompleteDate: fresh ? fresh.firstIncomplete : null,
        }
      }
    }
  }

  // ── CRM (stesso intervallo di GA4; date UTC su created_at) ──
  let crm: ReportInput['crm'] = null
  let crmError: string | undefined
  if (db) {
    stats.total++
    try {
      const res = await db.prepare(`
        SELECT temperatura, status, canale_acquisizione AS canale, dettaglio_fonte AS dettaglio, COUNT(*) AS cnt
        FROM leads
        WHERE substr(created_at,1,10) >= ? AND substr(created_at,1,10) <= ?
        GROUP BY temperatura, status, canale_acquisizione, dettaglio_fonte
      `).bind(win.start, win.aggEnd).all()
      crm = { rows: (res.results as any[]).map(r => ({ temperatura: r.temperatura || 'n/a', status: r.status || 'UNKNOWN', canale: r.canale || '', dettaglio: r.dettaglio || '', count: Number(r.cnt) })) }
    } catch (e: any) { crmError = sanitizeGoogleText(e?.message || e, 160); fail('CRM', 'CRM', e) }
  } else crmError = 'database non collegato'

  return {
    now: p.now, requestedStart: p.startDate, requestedEnd: p.endDate, siteUrl: p.siteUrl,
    measurementId: p.measurementId, ga4PropertyId: config.ga4PropertyId,
    ga4: { channelDimension, baseRows, smBase, queryEnd: smBase ? win.aggEnd : null, control, smDetail, topPages, devices, countries, directLanding, directBrowsers, monthly, monthlyRange: monthly ? monthlyRange : null, meta: { control: controlMeta, devices: devicesMeta } },
    gsc, crm, crmError, geoActivation: p.geoActivation, errors, queryStats: stats,
  }
}
void addDays
