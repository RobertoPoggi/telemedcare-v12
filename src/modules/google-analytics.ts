// ============================================================
// google-analytics.ts
// Integrazione GA4 Analytics Data API + Google Search Console
//
// AUTENTICAZIONE (in ordine di priorità):
//   1. Service Account JSON  →  GOOGLE_SERVICE_ACCOUNT_JSON (secret Cloudflare)
//      JWT firmato con RS256, access token dura 1h e si auto-rinnova.
//      Non scade mai, non richiede flusso OAuth utente.
//
//   2. OAuth2 refresh_token  →  GOOGLE_REFRESH_TOKEN_ANALYTICS (fallback legacy)
//      Scade ogni 7 giorni se l'app è in modalità "Testing" su Google Cloud.
// ============================================================

// ── Interfacce config ────────────────────────────────────────

export interface GoogleAnalyticsConfig {
  // Service Account (metodo preferito — non scade mai)
  serviceAccountJson?: string   // JSON completo del service account (da Cloudflare secret)

  // OAuth2 legacy (fallback)
  refreshToken?: string
  oauthClientId?: string
  oauthClientSecret?: string

  ga4PropertyId: string         // es. "549216845"
  searchConsoleSiteUrl?: string // es. "https://www.ecura.it/"
}

// ── Helpers base64url ────────────────────────────────────────

function base64urlEncode(data: ArrayBuffer): string {
  const bytes = new Uint8Array(data)
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function strToBase64url(str: string): string {
  const enc = new TextEncoder()
  const bytes = enc.encode(str)
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

// ── JWT firmato RS256 per Service Account ────────────────────

async function getServiceAccountToken(serviceAccountJson: string, scopes: string[]): Promise<string> {
  let sa: any
  try {
    sa = JSON.parse(serviceAccountJson)
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON non è JSON valido')
  }

  if (!sa.private_key || !sa.client_email) {
    throw new Error('Service account JSON mancante di private_key o client_email')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const payload = {
    iss: sa.client_email,
    scope: scopes.join(' '),
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  }

  const headerB64  = strToBase64url(JSON.stringify(header))
  const payloadB64 = strToBase64url(JSON.stringify(payload))
  const sigInput   = `${headerB64}.${payloadB64}`

  // Importa la chiave privata PEM RSA
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '')

  const keyDer = Uint8Array.from(atob(pemBody), c => c.charCodeAt(0))
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyDer.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const sigBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(sigInput)
  )
  const sigB64 = base64urlEncode(sigBuffer)
  const jwt = `${sigInput}.${sigB64}`

  // Scambia JWT con access token
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    }).toString()
  })

  if (!tokenRes.ok) {
    const err = await tokenRes.text()
    throw new Error(`Service Account token exchange failed: ${err}`)
  }

  const json = await tokenRes.json() as { access_token?: string; error?: string }
  if (!json.access_token) throw new Error(`No access_token from Service Account: ${JSON.stringify(json)}`)
  return json.access_token
}

// ── OAuth2 refresh token (legacy) ────────────────────────────

async function getOAuth2Token(refreshToken: string, clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret
    }).toString()
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OAuth2 token refresh failed: ${err}`)
  }
  const json = await res.json() as { access_token?: string; error?: string }
  if (!json.access_token) throw new Error(`No access_token in OAuth2 response: ${JSON.stringify(json)}`)
  return json.access_token
}

// ── getAccessToken: sceglie automaticamente il metodo migliore ──

const GA4_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly'
]

async function getAccessToken(config: GoogleAnalyticsConfig): Promise<string> {
  // 1. Service Account — non scade mai, metodo preferito
  if (config.serviceAccountJson) {
    return getServiceAccountToken(config.serviceAccountJson, GA4_SCOPES)
  }

  // 2. OAuth2 refresh token — legacy, scade ogni 7gg se app in Testing
  if (config.refreshToken && config.oauthClientId && config.oauthClientSecret) {
    return getOAuth2Token(config.refreshToken, config.oauthClientId, config.oauthClientSecret)
  }

  throw new Error('Nessuna credenziale Google configurata. Imposta GOOGLE_SERVICE_ACCOUNT_JSON oppure GOOGLE_REFRESH_TOKEN_ANALYTICS + GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET nei secrets Cloudflare.')
}

// ── Utility: quale metodo di auth è attivo ───────────────────

export function detectAuthMethod(config: GoogleAnalyticsConfig): 'service_account' | 'oauth2' | 'none' {
  if (config.serviceAccountJson) return 'service_account'
  if (config.refreshToken && config.oauthClientId && config.oauthClientSecret) return 'oauth2'
  return 'none'
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
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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

  return { rows, rowCount: data.rowCount || rows.length, dimensionHeaders: dimHeaders, metricHeaders: metHeaders }
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
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
  authMethod: 'service_account' | 'oauth2' | 'none'
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
  sourceMediumBreakdown: { source: string; medium: string; sessions: number; users: number; bounceRate: number }[]
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
  startDate: string,
  endDate: string
): Promise<FullAnalyticsReport> {
  const errors: string[] = []
  const period = { startDate, endDate }
  const dateRanges = [{ startDate, endDate }]
  const authMethod = detectAuthMethod(config)

  async function safeRun<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
    try { return await fn() }
    catch (e: any) {
      errors.push(`${label}: ${e.message}`)
      return null
    }
  }

  // 1. Overview
  const overviewRaw = await safeRun(() => ga4RunReport(config, {
    dateRanges,
    metrics: [
      { name: 'sessions' }, { name: 'activeUsers' }, { name: 'newUsers' },
      { name: 'bounceRate' }, { name: 'averageSessionDuration' },
      { name: 'screenPageViews' }, { name: 'conversions' }
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

  // 2b. Source/Medium granular
  const sourceMediumRaw = await safeRun(() => ga4RunReport(config, {
    dateRanges,
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [{ name: 'sessions' }, { name: 'activeUsers' }, { name: 'bounceRate' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 50
  }), 'GA4 source/medium')

  const sourceMediumBreakdown = (sourceMediumRaw?.rows || []).map(r => ({
    source: r.dimensions[0],
    medium: r.dimensions[1],
    sessions: parseInt(r.metrics[0]),
    users: parseInt(r.metrics[1]),
    bounceRate: parseFloat(r.metrics[2] || '0')
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
    const d = r.dimensions[0]
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

    const scQueries = await safeRun(() => searchConsoleQuery(config, {
      startDate, endDate, dimensions: ['query'], rowLimit: 20
    }), 'GSC queries')

    const scPages = await safeRun(() => searchConsoleQuery(config, {
      startDate, endDate, dimensions: ['page'], rowLimit: 15
    }), 'GSC pages')

    searchConsole = {
      totalClicks: scRow?.clicks || 0,
      totalImpressions: scRow?.impressions || 0,
      avgCtr: scRow?.ctr || 0,
      avgPosition: scRow?.position || 0,
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
    authMethod,
    overview,
    channelBreakdown,
    sourceMediumBreakdown,
    topPages,
    deviceBreakdown,
    countryBreakdown,
    dailyTrend,
    searchConsole,
    errors
  }
}
