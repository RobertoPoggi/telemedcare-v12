// ============================================================
// google-analytics.ts
// Integrazione GA4 Analytics Data API + Google Search Console
// Usa OAuth2 refresh_token (stessi segreti di gsheet-import)
// ============================================================

export interface GoogleAnalyticsConfig {
  refreshToken: string
  oauthClientId: string
  oauthClientSecret: string
  ga4PropertyId: string        // es. "549216845"
  searchConsoleSiteUrl?: string // es. "https://www.ecura.it/"
}

// ── Token refresh ────────────────────────────────────────────
async function getAccessToken(config: GoogleAnalyticsConfig): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: config.refreshToken,
      client_id: config.oauthClientId,
      client_secret: config.oauthClientSecret
    }).toString()
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OAuth2 token refresh failed: ${err}`)
  }
  const json = await res.json() as { access_token?: string; error?: string }
  if (!json.access_token) throw new Error(`No access_token in response: ${JSON.stringify(json)}`)
  return json.access_token
}

// ── GA4 Analytics Data API ───────────────────────────────────

export interface GA4ReportRow {
  dimensions: string[]
  metrics: string[]
}

export interface GA4ReportResult {
  rows: GA4ReportRow[]
  rowCount: number
  dimensionHeaders: string[]
  metricHeaders: string[]
}

/**
 * Chiama GA4 Analytics Data API (runReport)
 * https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport
 */
export async function ga4RunReport(
  config: GoogleAnalyticsConfig,
  body: {
    dateRanges: { startDate: string; endDate: string }[]
    dimensions?: { name: string }[]
    metrics: { name: string }[]
    dimensionFilter?: any
    orderBys?: any[]
    limit?: number
    offset?: number
  }
): Promise<GA4ReportResult> {
  const token = await getAccessToken(config)
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${config.ga4PropertyId}:runReport`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`GA4 runReport failed (${res.status}): ${err}`)
  }

  const data = await res.json() as any

  const dimHeaders: string[] = (data.dimensionHeaders || []).map((h: any) => h.name)
  const metHeaders: string[] = (data.metricHeaders || []).map((h: any) => h.name)

  const rows: GA4ReportRow[] = (data.rows || []).map((row: any) => ({
    dimensions: (row.dimensionValues || []).map((v: any) => v.value),
    metrics: (row.metricValues || []).map((v: any) => v.value)
  }))

  return {
    rows,
    rowCount: data.rowCount || rows.length,
    dimensionHeaders: dimHeaders,
    metricHeaders: metHeaders
  }
}

// ── Search Console API ───────────────────────────────────────

export interface SearchConsoleRow {
  keys: string[]
  clicks: number
  impressions: number
  ctr: number
  position: number
}

export interface SearchConsoleResult {
  rows: SearchConsoleRow[]
  responseAggregationType?: string
}

/**
 * Chiama Search Console API (query)
 * https://developers.google.com/webmaster-tools/v1/searchanalytics/query
 */
export async function searchConsoleQuery(
  config: GoogleAnalyticsConfig,
  body: {
    startDate: string
    endDate: string
    dimensions?: string[]
    dimensionFilterGroups?: any[]
    rowLimit?: number
    startRow?: number
    searchType?: string
  }
): Promise<SearchConsoleResult> {
  if (!config.searchConsoleSiteUrl) throw new Error('searchConsoleSiteUrl not configured')

  const token = await getAccessToken(config)
  const siteUrl = encodeURIComponent(config.searchConsoleSiteUrl)
  const url = `https://searchconsole.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ rowLimit: 1000, searchType: 'web', ...body })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Search Console query failed (${res.status}): ${err}`)
  }

  const data = await res.json() as any
  const rows: SearchConsoleRow[] = (data.rows || []).map((r: any) => ({
    keys: r.keys || [],
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0
  }))

  return { rows, responseAggregationType: data.responseAggregationType }
}

// ── High-level: raccoglie tutti i dati per il report ────────

export interface FullAnalyticsReport {
  generatedAt: string
  period: { startDate: string; endDate: string }
  ga4PropertyId: string
  overview: {
    sessions: number
    users: number
    newUsers: number
    bounceRate: number
    avgSessionDuration: number
    pageviews: number
    conversions: number
  }
  channelBreakdown: { channel: string; sessions: number; users: number }[]
  topPages: { page: string; pageviews: number; sessions: number }[]
  deviceBreakdown: { device: string; sessions: number }[]
  countryBreakdown: { country: string; sessions: number }[]
  dailyTrend: { date: string; sessions: number; users: number }[]
  searchConsole?: {
    totalClicks: number
    totalImpressions: number
    avgCtr: number
    avgPosition: number
    topQueries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[]
    topPages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[]
  }
  errors: string[]
}

export async function fetchFullAnalyticsReport(
  config: GoogleAnalyticsConfig,
  startDate: string,  // es. "2026-08-09"
  endDate: string     // es. "2026-09-03"
): Promise<FullAnalyticsReport> {
  const errors: string[] = []
  const period = { startDate, endDate }
  const dateRanges = [{ startDate, endDate }]

  // Helper: esegui con fallback
  async function safeRun<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
    try { return await fn() }
    catch (e: any) {
      errors.push(`${label}: ${e.message}`)
      return null
    }
  }

  // 1. Overview (sessioni, utenti, bounce, durata, pageviews)
  const overviewRaw = await safeRun(() => ga4RunReport(config, {
    dateRanges,
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'newUsers' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' },
      { name: 'conversions' }
    ]
  }), 'GA4 overview')

  const ov = overviewRaw?.rows[0]?.metrics || []
  const overview = {
    sessions: parseInt(ov[0] || '0'),
    users: parseInt(ov[1] || '0'),
    newUsers: parseInt(ov[2] || '0'),
    bounceRate: parseFloat(ov[3] || '0'),
    avgSessionDuration: parseFloat(ov[4] || '0'),
    pageviews: parseInt(ov[5] || '0'),
    conversions: parseInt(ov[6] || '0')
  }

  // 2. Channel breakdown
  const channelRaw = await safeRun(() => ga4RunReport(config, {
    dateRanges,
    dimensions: [{ name: 'sessionDefaultChannelGrouping' }],
    metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 20
  }), 'GA4 channels')

  const channelBreakdown = (channelRaw?.rows || []).map(r => ({
    channel: r.dimensions[0],
    sessions: parseInt(r.metrics[0]),
    users: parseInt(r.metrics[1])
  }))

  // 3. Top pages
  const pagesRaw = await safeRun(() => ga4RunReport(config, {
    dateRanges,
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 15
  }), 'GA4 pages')

  const topPages = (pagesRaw?.rows || []).map(r => ({
    page: r.dimensions[0],
    pageviews: parseInt(r.metrics[0]),
    sessions: parseInt(r.metrics[1])
  }))

  // 4. Device breakdown
  const deviceRaw = await safeRun(() => ga4RunReport(config, {
    dateRanges,
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }]
  }), 'GA4 devices')

  const deviceBreakdown = (deviceRaw?.rows || []).map(r => ({
    device: r.dimensions[0],
    sessions: parseInt(r.metrics[0])
  }))

  // 5. Country breakdown
  const countryRaw = await safeRun(() => ga4RunReport(config, {
    dateRanges,
    dimensions: [{ name: 'country' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10
  }), 'GA4 countries')

  const countryBreakdown = (countryRaw?.rows || []).map(r => ({
    country: r.dimensions[0],
    sessions: parseInt(r.metrics[0])
  }))

  // 6. Daily trend
  const dailyRaw = await safeRun(() => ga4RunReport(config, {
    dateRanges,
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }, { name: 'activeUsers' }],
    orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
  }), 'GA4 daily trend')

  const dailyTrend = (dailyRaw?.rows || []).map(r => {
    const d = r.dimensions[0] // YYYYMMDD
    return {
      date: `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`,
      sessions: parseInt(r.metrics[0]),
      users: parseInt(r.metrics[1])
    }
  })

  // 7. Search Console
  let searchConsole: FullAnalyticsReport['searchConsole'] | undefined
  if (config.searchConsoleSiteUrl) {
    const scOverview = await safeRun(() => searchConsoleQuery(config, {
      startDate, endDate, dimensions: []
    }), 'GSC overview')

    const scRow = scOverview?.rows[0]
    const totalClicks = scRow?.clicks || 0
    const totalImpressions = scRow?.impressions || 0
    const avgCtr = scRow?.ctr || 0
    const avgPosition = scRow?.position || 0

    const scQueries = await safeRun(() => searchConsoleQuery(config, {
      startDate, endDate,
      dimensions: ['query'],
      rowLimit: 20
    }), 'GSC queries')

    const scPages = await safeRun(() => searchConsoleQuery(config, {
      startDate, endDate,
      dimensions: ['page'],
      rowLimit: 15
    }), 'GSC pages')

    searchConsole = {
      totalClicks,
      totalImpressions,
      avgCtr,
      avgPosition,
      topQueries: (scQueries?.rows || []).map(r => ({
        query: r.keys[0] || '',
        clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position
      })),
      topPages: (scPages?.rows || []).map(r => ({
        page: r.keys[0] || '',
        clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position
      }))
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    period,
    ga4PropertyId: config.ga4PropertyId,
    overview,
    channelBreakdown,
    topPages,
    deviceBreakdown,
    countryBreakdown,
    dailyTrend,
    searchConsole,
    errors
  }
}
