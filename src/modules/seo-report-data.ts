// ============================================================
// seo-report-data.ts — raccolta dati per il "Report Analytics Live".
// Il totale e' la query GA4 SENZA dimensioni; macro-canali e source/medium vengono dalla query senza data sullo
// stesso intervallo; la query datata serve solo per serie giornaliera e consolidamento. Finestre tagliate sui giorni consolidati.
// ============================================================
import { ga4RunReport, searchConsoleQuery, type GoogleAnalyticsConfig } from './google-analytics'
import { computeWindows, detectConsolidation, addDays, addMonths, monthOf, PARAMS, type ReportInput, type BaseRow, type SmBaseRow, type GaMeta } from './seo-report-engine'

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

export interface CollectParams {
  now: Date; startDate: string; endDate: string; siteUrl: string; measurementId: string
  geoActivation: { date: string; label: string }
}

export async function collectReportInput(
  config: GoogleAnalyticsConfig, db: any | undefined, p: CollectParams
): Promise<ReportInput> {
  const errors: string[] = []
  const win0 = computeWindows(p.now, p.startDate, p.endDate)
  const safe = async <T>(label: string, fn: () => Promise<T>): Promise<T | null> => {
    try { return await fn() } catch (e: any) { errors.push(`${label}: ${String(e?.message || e).slice(0, 300)}`); return null }
  }
  const metaOf = (r: { metadata?: any }, range: string): GaMeta => ({ ...(r.metadata || {}), range })

  // ── 1. Serie datata (data × canale × source × medium): SOLO serie giornaliera e rilevamento del consolidamento ──
  const drDated = [{ startDate: win0.start, endDate: win0.ga4End }]
  let channelDimension: string | null = null
  let baseRows: BaseRow[] | null = null
  for (const dim of ['sessionDefaultChannelGroup', 'sessionDefaultChannelGrouping']) {
    try {
      const rows = await paged(config, {
        dateRanges: drDated,
        dimensions: [{ name: 'date' }, { name: dim }, { name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }],
      })
      baseRows = rows.map(r => ({ date: fromYmd(r.dimensions[0]), channelGrouping: r.dimensions[1], source: r.dimensions[2], medium: r.dimensions[3], sessions: parseInt(r.metrics[0] || '0', 10) }))
      channelDimension = dim; break
    } catch (e: any) { errors.push(`GA4 base (${dim}): ${String(e?.message || e).slice(0, 200)}`) }
  }
  if (!baseRows) {
    baseRows = await safe('GA4 base (senza canale)', async () => (await paged(config, {
      dateRanges: drDated, dimensions: [{ name: 'date' }, { name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'sessions' }],
    })).map(r => ({ date: fromYmd(r.dimensions[0]), channelGrouping: 'n.d.', source: r.dimensions[1], medium: r.dimensions[2], sessions: parseInt(r.metrics[0] || '0', 10) })))
  }

  // ── 2. Finestra definitiva: gli ultimi giorni in consolidamento sono esclusi da TUTTE le query non datate ──
  const cons = detectConsolidation(baseRows, win0.start, win0.ga4End)
  const win = computeWindows(p.now, p.startDate, p.endDate, cons.tailDays)
  const dr = [{ startDate: win.start, endDate: win.aggEnd }]
  const drTxt = `${win.start} → ${win.aggEnd}`

  // ── 3. Query SENZA data: stessa dateRanges, stessi filtri. Totale = query senza dimensioni (unica fonte di verita') ──
  let controlMeta: GaMeta | null = null
  const control = await safe('GA4 controllo', async () => {
    const r = await ga4RunReport(config, { dateRanges: dr, metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'newUsers' }, { name: 'bounceRate' }, { name: 'averageSessionDuration' }, { name: 'screenPageViews' }] })
    controlMeta = metaOf(r, drTxt)
    const v = r.rows[0]?.metrics || []
    return { sessions: num(v[0]), users: num(v[1]), newUsers: num(v[2]), bounceRate: num(v[3]), avgSessionDuration: num(v[4]), pageviews: num(v[5]) }
  })
  // canale × source × medium senza data: fonte di macro-canali e tabella source/medium
  const smBaseDims = channelDimension ? [{ name: channelDimension }, { name: 'sessionSource' }, { name: 'sessionMedium' }] : [{ name: 'sessionSource' }, { name: 'sessionMedium' }]
  const smBase: SmBaseRow[] | null = await safe('GA4 source/medium (senza data)', async () => (await paged(config, {
    dateRanges: dr, dimensions: smBaseDims, metrics: [{ name: 'sessions' }],
  })).map(r => channelDimension
    ? { channelGrouping: r.dimensions[0], source: r.dimensions[1], medium: r.dimensions[2], sessions: parseInt(r.metrics[0] || '0', 10) }
    : { channelGrouping: 'n.d.', source: r.dimensions[0], medium: r.dimensions[1], sessions: parseInt(r.metrics[0] || '0', 10) }))
  const smDetail = await safe('GA4 source/medium (utenti, bounce)', async () => (await paged(config, {
    dateRanges: dr, dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'activeUsers' }, { name: 'bounceRate' }],
  })).map(r => ({ source: r.dimensions[0], medium: r.dimensions[1], users: num(r.metrics[0]), bounceRate: num(r.metrics[1]) })))
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

  // ── Search Console: dataState final, fino a oggi−3 ──
  let gsc: ReportInput['gsc'] = null
  if (config.searchConsoleSiteUrl && win.gscEnd >= win.start) {
    const q = (b: any) => searchConsoleQuery(config, { startDate: win.start, endDate: win.gscEnd, searchType: 'web', dataState: 'final', ...b })
    const totals = await safe('GSC totali', async () => (await q({ dimensions: [] })).rows[0] || null)
    const daily = await safe('GSC serie giornaliera', async () => (await q({ dimensions: ['date'], rowLimit: 25000 })).rows)
    const queries = await safe('GSC query', async () => (await q({ dimensions: ['query'], rowLimit: Math.max(PARAMS.topQueries, PARAMS.hubQueries) })).rows)
    const pages = await safe('GSC pagine', async () => (await q({ dimensions: ['page'], rowLimit: PARAMS.topPages })).rows)
    if (totals && daily) {
      gsc = {
        totals: { clicks: totals.clicks, impressions: totals.impressions, position: totals.position },
        daily: daily.map(r => ({ date: r.keys[0], clicks: r.clicks, impressions: r.impressions })),
        queries: (queries || []).map(r => ({ query: r.keys[0] || '', clicks: r.clicks, impressions: r.impressions, position: r.position })),
        pages: (pages || []).map(r => ({ page: r.keys[0] || '', clicks: r.clicks, impressions: r.impressions, position: r.position })),
      }
    }
  }

  // ── CRM (stesso intervallo di GA4; date UTC su created_at) ──
  let crm: ReportInput['crm'] = null
  let crmError: string | undefined
  if (db) {
    try {
      const res = await db.prepare(`
        SELECT temperatura, status, canale_acquisizione AS canale, dettaglio_fonte AS dettaglio, COUNT(*) AS cnt
        FROM leads
        WHERE substr(created_at,1,10) >= ? AND substr(created_at,1,10) <= ?
        GROUP BY temperatura, status, canale_acquisizione, dettaglio_fonte
      `).bind(win.start, win.aggEnd).all()
      crm = { rows: (res.results as any[]).map(r => ({ temperatura: r.temperatura || 'n/a', status: r.status || 'UNKNOWN', canale: r.canale || '', dettaglio: r.dettaglio || '', count: Number(r.cnt) })) }
    } catch (e: any) { crmError = String(e?.message || e).slice(0, 160); errors.push(`CRM: ${crmError}`) }
  } else crmError = 'database non collegato'

  return {
    now: p.now, requestedStart: p.startDate, requestedEnd: p.endDate, siteUrl: p.siteUrl,
    measurementId: p.measurementId, ga4PropertyId: config.ga4PropertyId,
    ga4: { channelDimension, baseRows, smBase, queryEnd: smBase ? win.aggEnd : null, control, smDetail, topPages, devices, countries, directLanding, directBrowsers, monthly, monthlyRange: monthly ? monthlyRange : null, meta: { control: controlMeta, devices: devicesMeta } },
    gsc, crm, crmError, geoActivation: p.geoActivation, errors,
  }
}
void addDays
