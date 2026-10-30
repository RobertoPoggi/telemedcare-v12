// ============================================================
// Marketing Hub API  —  /api/marketing/*
// Bozze e CSV: nessuna azione tocca mai Google Ads direttamente.
// Ogni campagna nasce in pausa e va approvata a mano.
// Auth: cookie di sessione CRM (il middleware globale NON copre questo percorso).
// ============================================================
import { Hono } from 'hono'
import * as E from './ads-engine'
import { searchConsoleQuery } from './google-analytics'
import { isSessionValid } from './auth-service'

type Ctx = any

// ── Auth ───────────────────────────────────────────────────────────────
function sessionOf(c: Ctx): any | null {
  try {
    const cookie = c.req.header('Cookie') || ''
    const m = cookie.match(/(?:^|;\s*)session=([^;]+)/)
    if (!m) return null
    const s = JSON.parse(decodeURIComponent(m[1]))
    return isSessionValid(s) ? s : null
  } catch (_) { return null }
}

// ── DB ─────────────────────────────────────────────────────────────────
let _ensured = false
async function ensureTables(db: any) {
  if (_ensured) return
  await db.prepare(`CREATE TABLE IF NOT EXISTS ads_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    origin TEXT,
    plan_json TEXT NOT NULL,
    created_by TEXT,
    approved_by TEXT,
    approved_at TEXT,
    exported_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`).run()
  await db.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, description TEXT, updated_at TEXT DEFAULT (datetime('now')))`).run()
  _ensured = true
}

// ── OpenAI ─────────────────────────────────────────────────────────────
function aiConfig(env: any) {
  const key = env?.OPENAI_API_KEY
  return {
    key: key as string | undefined,
    base: String(env?.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
    model: String(env?.OPENAI_MODEL || 'gpt-5-mini'),
  }
}

async function aiJson(env: any, sys: string, user: string): Promise<{ ok: true; data: any; model: string } | { ok: false; error: string }> {
  const cfg = aiConfig(env)
  if (!cfg.key) return { ok: false, error: 'OPENAI_API_KEY non configurata' }
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 45000)
  try {
    const res = await fetch(cfg.base + '/chat/completions', {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Authorization': 'Bearer ' + cfg.key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
        response_format: { type: 'json_object' },
      }),
    })
    if (!res.ok) return { ok: false, error: 'OpenAI ' + res.status + ': ' + (await res.text()).slice(0, 200) }
    const j: any = await res.json()
    const txt = j?.choices?.[0]?.message?.content || ''
    return { ok: true, data: JSON.parse(txt), model: cfg.model }
  } catch (e: any) {
    return { ok: false, error: e?.name === 'AbortError' ? 'OpenAI: timeout' : 'OpenAI: ' + (e?.message || e) }
  } finally { clearTimeout(t) }
}

// ── Google config ──────────────────────────────────────────────────────
function googleCfg(env: any) {
  const serviceAccountJson = env?.GOOGLE_SERVICE_ACCOUNT_JSON
  const refreshToken = env?.GOOGLE_REFRESH_TOKEN_ANALYTICS || env?.GOOGLE_REFRESH_TOKEN
  const oauthClientId = env?.GOOGLE_OAUTH_CLIENT_ID
  const oauthClientSecret = env?.GOOGLE_OAUTH_CLIENT_SECRET
  const ok = !!serviceAccountJson || !!(refreshToken && oauthClientId && oauthClientSecret)
  return {
    ok,
    cfg: { serviceAccountJson, refreshToken, oauthClientId, oauthClientSecret, ga4PropertyId: env?.GA4_PROPERTY_ID || '549216845', searchConsoleSiteUrl: env?.SC_SITE_URL || 'https://www.ecura.it/' } as any,
  }
}

// ── Fetch pagine del sito (solo dominio eCura) ─────────────────────────
const isSiteUrl = (u: string) => u.startsWith(E.SITE + '/') || u === E.SITE
async function getText(url: string, ms = 12000): Promise<{ status: number; text: string }> {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), ms)
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'eCuraMarketingHub/1.0', 'Accept': 'text/html,application/xml,text/plain' }, redirect: 'follow' })
    return { status: r.status, text: await r.text() }
  } catch (_) { return { status: 0, text: '' } } finally { clearTimeout(t) }
}
async function mapLimit<T, R>(arr: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = []
  for (let i = 0; i < arr.length; i += n) out.push(...await Promise.all(arr.slice(i, i + n).map(fn)))
  return out
}
const textOf = (html: string) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<(header|nav|footer)[\s\S]*?<\/\1>|<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

let _smCache: { at: number; urls: string[] } | null = null
async function sitemapUrls(): Promise<string[]> {
  if (_smCache && Date.now() - _smCache.at < 600000) return _smCache.urls
  const r = await getText(E.SITE + '/sitemap.xml')
  const urls = E.parseSitemap(r.text).map(u => u.replace('http://', 'https://').replace('://ecura.it', '://www.ecura.it'))
  const out = urls.filter(isSiteUrl).filter(u => !/\/(grazie|privacy|cookie|admin)/.test(u))
  if (out.length) _smCache = { at: Date.now(), urls: out }
  return out
}

function validatePlan(p: any): string | null {
  if (!p || typeof p !== 'object') return 'Piano mancante'
  if (typeof p.campaignName !== 'string' || !p.campaignName.trim()) return 'Nome campagna mancante'
  if (!Array.isArray(p.adGroups) || !Array.isArray(p.regions) || !Array.isArray(p.campaignNegatives)) return 'Struttura del piano non valida'
  if (!(Number(p.dailyBudget) > 0) || !(Number(p.maxCpc) > 0)) return 'Budget o CPC non validi'
  return null
}
function normalizePlan(p: any): E.PlanData {
  const base = E.presetPrimoLancio()
  return {
    ...base, ...p,
    dailyBudget: Number(p.dailyBudget), maxCpc: Number(p.maxCpc),
    regions: p.regions.map((r: any) => ({ key: String(r.key), name: String(r.name), id: String(r.id), bid: Number(r.bid) || 0 })),
    campaignNegatives: p.campaignNegatives.map((x: any) => String(x).trim()).filter(Boolean),
    adGroups: p.adGroups.map((g: any) => ({
      name: String(g.name || ''), finalUrl: String(g.finalUrl || ''), path1: g.path1 || '', path2: g.path2 || '', pin1: g.pin1 || '', startPaused: !!g.startPaused, launchDay: Number(g.launchDay) || undefined,
      keywords: (g.keywords || []).map((k: any) => ({ text: String(k.text || '').trim(), match: (['Exact', 'Phrase', 'Broad'].includes(k.match) ? k.match : 'Phrase') })).filter((k: any) => k.text),
      negatives: (g.negatives || []).map((x: any) => String(x).trim()).filter(Boolean),
      headlines: (g.headlines || []).map((x: any) => String(x).trim()).filter(Boolean),
      descriptions: (g.descriptions || []).map((x: any) => String(x).trim()).filter(Boolean),
    })),
    sitelinks: Array.isArray(p.sitelinks) ? p.sitelinks : base.sitelinks,
    callouts: Array.isArray(p.callouts) ? p.callouts : base.callouts,
    snippetValues: Array.isArray(p.snippetValues) ? p.snippetValues : base.snippetValues,
  }
}

export function createMarketingApi() {
  const api = new Hono<any>()

  api.use('*', async (c, next) => {
    const s = sessionOf(c)
    if (!s) return c.json({ success: false, error: 'Non autenticato', login_url: '/login' }, 401)
    c.set('user', s)
    c.header('Cache-Control', 'no-store')
    await next()
  })

  // ── Stato integrazioni ─────────────────────────────────────────────
  api.get('/health', async (c) => {
    const ai = aiConfig(c.env); const g = googleCfg(c.env)
    return c.json({
      success: true,
      openai: { configured: !!ai.key, model: ai.model, base: ai.base.replace(/^https?:\/\//, '').split('/')[0] },
      searchConsole: { configured: g.ok, site: g.cfg.searchConsoleSiteUrl },
      ga4: { configured: g.ok, property: g.cfg.ga4PropertyId },
      db: !!c.env?.DB,
      safety: 'Le campagne generate sono sempre in pausa. Nessun invio automatico a Google Ads.',
    })
  })

  // ── Preset + previsione ────────────────────────────────────────────
  api.get('/preset', (c) => {
    const plan = E.presetPrimoLancio()
    return c.json({ success: true, plan, issues: E.lintPlan(plan), brandRules: E.BRAND_RULES, limits: E.LIMITS })
  })
  api.post('/forecast', async (c) => {
    const b: any = await c.req.json().catch(() => ({}))
    const n = (v: any, d: number) => Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d
    return c.json({ success: true, forecast: E.forecast(n(b.budget, 10), n(b.cpcMin, 0.55), n(b.cpcMax, 0.70), n(b.crMin, 0.03), n(b.crMax, 0.05), 30.4) })
  })
  api.post('/lint', async (c) => {
    const b: any = await c.req.json().catch(() => ({}))
    const err = validatePlan(b.plan); if (err) return c.json({ success: false, error: err }, 400)
    const known = new Set(await sitemapUrls())
    return c.json({ success: true, issues: E.lintPlan(normalizePlan(b.plan), known.size ? known : undefined) })
  })

  // ── Bozze (CRUD + approvazione) ────────────────────────────────────
  api.get('/plans', async (c) => {
    await ensureTables(c.env.DB)
    const { results } = await c.env.DB.prepare('SELECT id,name,status,origin,created_by,approved_by,approved_at,exported_at,created_at,updated_at FROM ads_plans ORDER BY updated_at DESC LIMIT 100').all()
    return c.json({ success: true, plans: results || [] })
  })
  api.get('/plans/:id', async (c) => {
    await ensureTables(c.env.DB)
    const r: any = await c.env.DB.prepare('SELECT * FROM ads_plans WHERE id=?').bind(c.req.param('id')).first()
    if (!r) return c.json({ success: false, error: 'Bozza non trovata' }, 404)
    const plan = JSON.parse(r.plan_json)
    return c.json({ success: true, meta: { id: r.id, name: r.name, status: r.status, origin: r.origin, approved_by: r.approved_by, approved_at: r.approved_at, exported_at: r.exported_at }, plan, issues: E.lintPlan(plan) })
  })
  // Crea o aggiorna: ogni modifica riporta la bozza a "draft" (va riapprovata)
  api.post('/plans', async (c) => {
    await ensureTables(c.env.DB)
    const b: any = await c.req.json().catch(() => ({}))
    const err = validatePlan(b.plan); if (err) return c.json({ success: false, error: err }, 400)
    const plan = normalizePlan(b.plan); const u: any = c.get('user')
    const name = String(b.name || plan.campaignName).slice(0, 120)
    if (b.id) {
      const r = await c.env.DB.prepare(`UPDATE ads_plans SET name=?, plan_json=?, status='draft', approved_by=NULL, approved_at=NULL, exported_at=NULL, updated_at=datetime('now') WHERE id=?`).bind(name, JSON.stringify(plan), b.id).run()
      return c.json({ success: true, id: Number(b.id), status: 'draft', issues: E.lintPlan(plan), changed: r.meta?.changes ?? 1 })
    }
    const r = await c.env.DB.prepare(`INSERT INTO ads_plans (name,status,origin,plan_json,created_by) VALUES (?,?,?,?,?)`).bind(name, 'draft', plan.origin || 'preset', JSON.stringify(plan), u?.username || null).run()
    return c.json({ success: true, id: r.meta?.last_row_id, status: 'draft', issues: E.lintPlan(plan) })
  })
  // Approvazione: possibile solo senza errori di lint. Resta una decisione umana.
  api.post('/plans/:id/approve', async (c) => {
    await ensureTables(c.env.DB)
    const r: any = await c.env.DB.prepare('SELECT * FROM ads_plans WHERE id=?').bind(c.req.param('id')).first()
    if (!r) return c.json({ success: false, error: 'Bozza non trovata' }, 404)
    const issues = E.lintPlan(JSON.parse(r.plan_json))
    const errors = issues.filter(i => i.level === 'error')
    if (errors.length) return c.json({ success: false, error: 'Ci sono ' + errors.length + ' errori da correggere prima dell\'approvazione', issues }, 409)
    const u: any = c.get('user')
    await c.env.DB.prepare(`UPDATE ads_plans SET status='approved', approved_by=?, approved_at=datetime('now'), updated_at=datetime('now') WHERE id=?`).bind(u?.username || 'utente', r.id).run()
    return c.json({ success: true, status: 'approved', issues })
  })
  api.post('/plans/:id/revoke', async (c) => {
    await ensureTables(c.env.DB)
    await c.env.DB.prepare(`UPDATE ads_plans SET status='draft', approved_by=NULL, approved_at=NULL, updated_at=datetime('now') WHERE id=?`).bind(c.req.param('id')).run()
    return c.json({ success: true, status: 'draft' })
  })
  api.delete('/plans/:id', async (c) => {
    await ensureTables(c.env.DB)
    await c.env.DB.prepare('DELETE FROM ads_plans WHERE id=?').bind(c.req.param('id')).run()
    return c.json({ success: true })
  })
  // CSV per Google Ads Editor: solo bozze approvate (Campaign Status sempre "Paused")
  api.get('/plans/:id/csv', async (c) => {
    await ensureTables(c.env.DB)
    const r: any = await c.env.DB.prepare('SELECT * FROM ads_plans WHERE id=?').bind(c.req.param('id')).first()
    if (!r) return c.json({ success: false, error: 'Bozza non trovata' }, 404)
    if (r.status === 'draft') return c.json({ success: false, error: 'La bozza non è approvata: approvala prima di esportare.' }, 409)
    const plan = JSON.parse(r.plan_json)
    const errors = E.lintPlan(plan).filter(i => i.level === 'error')
    if (errors.length) return c.json({ success: false, error: 'Errori di validazione nel piano', issues: errors }, 409)
    await c.env.DB.prepare(`UPDATE ads_plans SET status='exported', exported_at=datetime('now') WHERE id=?`).bind(r.id).run()
    const fname = 'google-ads-editor_' + E.slugify(plan.campaignName) + '_' + new Date().toISOString().slice(0, 10) + '.csv'
    return new Response(E.buildEditorCsv(plan), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="' + fname + '"', 'Cache-Control': 'no-store' } })
  })
  // Elenco negative (testo, una per riga) per incollarle in Google Ads
  api.get('/negatives.txt', (c) => {
    const p = E.presetPrimoLancio()
    return new Response(p.campaignNegatives.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  })

  // ── Sitemap e pagine ───────────────────────────────────────────────
  api.get('/sitemap', async (c) => {
    const urls = await sitemapUrls()
    return c.json({ success: true, count: urls.length, urls: urls.map(u => ({ url: u, kind: /\/blog\/./.test(u) ? 'blog' : u === E.SITE + '/' ? 'home' : 'guida' })) })
  })

  // Genera una bozza di campagna da una pagina del sito (AI → fallback template)
  api.post('/generate', async (c) => {
    await ensureTables(c.env.DB)
    const b: any = await c.req.json().catch(() => ({}))
    const url = String(b.url || '')
    if (!isSiteUrl(url)) return c.json({ success: false, error: 'L\'URL deve appartenere a ' + E.SITE }, 400)
    const pg = await getText(url)
    if (pg.status !== 200) return c.json({ success: false, error: 'Pagina non raggiungibile (HTTP ' + pg.status + ')' }, 502)
    const info = E.extractPageInfo(pg.text, url)
    const base = E.presetPrimoLancio()
    let plan: E.PlanData | null = null; let used: 'ai' | 'template' = 'template'; let dropped: string[] = []; let note = ''; let model = ''
    if (b.mode !== 'template') {
      const { sys, user } = E.buildAiPrompt(info)
      const r = await aiJson(c.env, sys, user)
      if (r.ok) {
        const s = E.sanitizeAiGroup(r.data, info)
        dropped = s.dropped
        if (s.group) {
          const topic = info.h1s[0] || info.title || E.slugFromUrl(url)
          plan = { ...base, campaignName: 'eCura | Search | ' + topic.slice(0, 40), utmCampaign: 'ecura_search_' + E.slugFromUrl(url), origin: 'ai', adGroups: [s.group] }
          used = 'ai'; model = r.model
        } else note = 'L\'AI non ha prodotto abbastanza testi validi: usato il modello base.'
      } else note = r.error + ' — usato il modello base.'
    }
    if (!plan) plan = E.templatePlanFromPage(info, base)
    const issues = E.lintPlan(plan)
    // Salva come bozza (mai attiva)
    const u: any = c.get('user')
    let newId: any = null
    if (b.save !== false) {
      const ins = await c.env.DB.prepare(`INSERT INTO ads_plans (name,status,origin,plan_json,created_by) VALUES (?,?,?,?,?)`).bind(plan.campaignName, 'draft', used, JSON.stringify(plan), u?.username || null).run()
      newId = ins.meta?.last_row_id
    }
    return c.json({ success: true, id: newId, used, model, note, dropped, page: { url, title: info.title, h1: info.h1s[0] || '' }, plan, issues })
  })

  // ── Termini di ricerca → negative ──────────────────────────────────
  api.post('/search-terms', async (c) => {
    const b: any = await c.req.json().catch(() => ({}))
    const csv = String(b.csv || '')
    if (csv.length < 20) return c.json({ success: false, error: 'File vuoto' }, 400)
    if (csv.length > 2_000_000) return c.json({ success: false, error: 'File troppo grande (max 2 MB)' }, 413)
    const min = Math.min(100, Math.max(1, Number(b.minClicks) || 15))
    const r = E.analyzeSearchTerms(csv, min)
    if (r.error) return c.json({ success: false, error: r.error }, 400)
    // Una negativa non deve bloccare una keyword attiva: segnala i conflitti
    const preset = E.presetPrimoLancio()
    const activeKw = preset.adGroups.flatMap(g => g.keywords.map(k => k.text))
    const conflicts = r.negatives.filter(n => activeKw.some(k => k.toLowerCase().includes(n.term.toLowerCase()))).map(n => n.term)
    return c.json({ success: true, noConvData: r.noConvData, review: r.review.slice(0, 200), totals: r.totals, negatives: r.negatives.slice(0, 200), watch: r.watch.slice(0, 100), conflicts, minClicks: min, topTerms: r.terms.sort((a, b) => b.cost - a.cost).slice(0, 25) })
  })

  // ── Opportunità da Search Console ──────────────────────────────────
  api.get('/gsc', async (c) => {
    const g = googleCfg(c.env)
    if (!g.ok) return c.json({ success: false, error: 'Search Console non collegata (manca GOOGLE_SERVICE_ACCOUNT_JSON oppure OAuth)', notConfigured: true }, 200)
    try {
      const days = Math.min(90, Math.max(7, Number(c.req.query('giorni')) || 28))
      const end = new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10)
      const start = new Date(Date.now() - (days + 2) * 864e5).toISOString().slice(0, 10)
      const r = await searchConsoleQuery(g.cfg, { startDate: start, endDate: end, dimensions: ['query'], rowLimit: 500 })
      const ops = E.gscOpportunities(r.rows)
      return c.json({ success: true, range: { start, end }, total: ops.length, ads: ops.filter(o => o.verdict === 'ADS').slice(0, 40), seo: ops.filter(o => o.verdict === 'SEO').slice(0, 40), noAds: ops.filter(o => o.verdict === 'NO_ADS').slice(0, 20), all: ops.slice(0, 100) })
    } catch (e: any) {
      return c.json({ success: false, error: String(e?.message || e).slice(0, 300) }, 200)
    }
  })

  // ── Risultati dal CRM (lead da Google) ─────────────────────────────
  api.get('/performance', async (c) => {
    await ensureTables(c.env.DB)
    try { const { ensureAdsClickColumns } = await import('./workflow-email-manager'); await ensureAdsClickColumns(c.env.DB) } catch (_) { /* colonne già presenti */ }
    const days = Math.min(120, Math.max(7, Number(c.req.query('giorni')) || 30))
    const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 19).replace('T', ' ')
    const q = async (sql: string, ...bind: any[]) => { try { return (await c.env.DB.prepare(sql).bind(...bind).all()).results || [] } catch (_) { return [] } }
    const [tot, withClick, byStatus, byCampaign] = await Promise.all([
      q(`SELECT COUNT(*) n FROM leads WHERE created_at >= ?`, since),
      q(`SELECT COUNT(*) n FROM leads WHERE created_at >= ? AND ((gclid IS NOT NULL AND gclid!='') OR (gbraid IS NOT NULL AND gbraid!='') OR (wbraid IS NOT NULL AND wbraid!=''))`, since),
      q(`SELECT status, COUNT(*) n FROM leads WHERE created_at >= ? AND ((gclid IS NOT NULL AND gclid!='') OR (gbraid IS NOT NULL AND gbraid!='') OR (wbraid IS NOT NULL AND wbraid!='')) GROUP BY status ORDER BY n DESC`, since),
      q(`SELECT COALESCE(NULLIF(canale_acquisizione,''),'(vuoto)') canale, COUNT(*) n FROM leads WHERE created_at >= ? GROUP BY 1 ORDER BY n DESC`, since),
    ])
    const spendRow: any = await c.env.DB.prepare(`SELECT value FROM settings WHERE key='ads_spend_log'`).first().catch(() => null)
    let spend: Record<string, number> = {}
    try { spend = spendRow ? JSON.parse(spendRow.value) : {} } catch (_) { spend = {} }
    const month = new Date().toISOString().slice(0, 7)
    const leadsGoogle = Number((withClick[0] as any)?.n || 0)
    const spendMonth = Number(spend[month] || 0)
    return c.json({ success: true, days, leads: Number((tot[0] as any)?.n || 0), leadsGoogle, byStatus, byChannel: byCampaign, spend, month, spendMonth, cpl: leadsGoogle && spendMonth ? +(spendMonth / leadsGoogle).toFixed(2) : null, target: { leadsMonth: [30, 40], cpl: [12, 15] } })
  })
  api.post('/spend', async (c) => {
    await ensureTables(c.env.DB)
    const b: any = await c.req.json().catch(() => ({}))
    const month = String(b.month || ''); const amount = Number(b.amount)
    if (!/^\d{4}-\d{2}$/.test(month) || !Number.isFinite(amount) || amount < 0 || amount > 100000) return c.json({ success: false, error: 'Mese (AAAA-MM) o importo non validi' }, 400)
    const row: any = await c.env.DB.prepare(`SELECT value FROM settings WHERE key='ads_spend_log'`).first()
    let log: Record<string, number> = {}; try { log = row ? JSON.parse(row.value) : {} } catch (_) { log = {} }
    log[month] = amount
    await c.env.DB.prepare(`INSERT INTO settings (key,value,description,updated_at) VALUES ('ads_spend_log',?,'Spesa Google Ads inserita a mano (EUR per mese)',datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`).bind(JSON.stringify(log)).run()
    return c.json({ success: true, spend: log })
  })

  // ═══════════════ SEO / GEO ═══════════════
  // Audit del sito dalla sitemap (a blocchi, per restare nei limiti delle subrequest)
  api.get('/seo/audit', async (c) => {
    const urls = await sitemapUrls()
    const offset = Math.max(0, Number(c.req.query('offset')) || 0)
    const limit = Math.min(20, Math.max(1, Number(c.req.query('limit')) || 12))
    const slice = urls.slice(offset, offset + limit)
    const pages = await mapLimit(slice, 6, async (u) => {
      const r = await getText(u)
      if (r.status !== 200) return { url: u, status: r.status, issues: [{ level: 'error', where: u.replace(E.SITE, '') || '/', msg: 'Pagina non raggiungibile (HTTP ' + r.status + ')' }], info: null as any }
      const info = E.extractPageInfo(r.text, u)
      return { url: u, status: 200, issues: E.auditPage(info), info: { title: info.title, description: info.description, h1: info.h1s[0] || '', kind: info.kind, words: info.words, types: info.types, faq: info.faq.length, internal: info.internal, imgsNoAlt: info.imgsNoAlt } }
    })
    return c.json({ success: true, total: urls.length, offset, next: offset + limit < urls.length ? offset + limit : null, pages })
  })

  // Prontezza per motori di risposta AI (GEO/AEO): file e regole che i crawler leggono
  api.get('/seo/geo', async (c) => {
    const [llms, llmsFull, robots, sm] = await Promise.all([getText(E.SITE + '/llms.txt'), getText(E.SITE + '/llms-full.txt'), getText(E.SITE + '/robots.txt'), getText(E.SITE + '/sitemap.xml')])
    const bots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']
    const blocks = (bot: string) => {
      const re = new RegExp('user-agent:\\s*' + bot + '[^\\n]*\\n((?:\\s*(?:allow|disallow|crawl-delay)[^\\n]*\\n?)*)', 'i')
      const m = robots.text.match(re); if (!m) return null
      return /disallow:\s*\/\s*(\n|$)/i.test(m[1])
    }
    const checks = [
      { id: 'llms', label: 'llms.txt', ok: llms.status === 200 && llms.text.length > 100, detail: llms.status === 200 ? llms.text.length + ' caratteri' : 'HTTP ' + llms.status },
      { id: 'llmsfull', label: 'llms-full.txt', ok: llmsFull.status === 200 && llmsFull.text.length > 500, detail: llmsFull.status === 200 ? llmsFull.text.length + ' caratteri' : 'HTTP ' + llmsFull.status },
      { id: 'robots', label: 'robots.txt con riferimento alla sitemap', ok: robots.status === 200 && /sitemap:/i.test(robots.text), detail: robots.status === 200 ? 'presente' : 'HTTP ' + robots.status },
      { id: 'sitemap', label: 'sitemap.xml', ok: sm.status === 200 && /<loc>/.test(sm.text), detail: sm.status === 200 ? E.parseSitemap(sm.text).length + ' URL' : 'HTTP ' + sm.status },
    ]
    const crawlers = bots.map(b => { const bl = blocks(b); return { bot: b, state: bl === null ? 'non indicato (consentito)' : bl ? 'BLOCCATO' : 'consentito', ok: bl !== true } })
    const priceMentions = (llmsFull.text.match(/\d{3}\s?€/g) || []).length
    return c.json({ success: true, checks, crawlers, llmsPreview: llms.text.slice(0, 600), priceMentions })
  })

  // Risposte pronte per FAQ/AEO, generate SOLO dal testo reale della pagina
  api.post('/seo/answers', async (c) => {
    const b: any = await c.req.json().catch(() => ({}))
    const url = String(b.url || '')
    if (!isSiteUrl(url)) return c.json({ success: false, error: 'L\'URL deve appartenere a ' + E.SITE }, 400)
    const pg = await getText(url)
    if (pg.status !== 200) return c.json({ success: false, error: 'Pagina non raggiungibile (HTTP ' + pg.status + ')' }, 502)
    const info = E.extractPageInfo(pg.text, url)
    const body = textOf(pg.text).slice(0, 7000)
    const sys = 'Sei un redattore SEO italiano. Rispondi SOLO con JSON valido. Scrivi domande e risposte per una FAQ, usando ESCLUSIVAMENTE informazioni presenti nel TESTO fornito. Se un dato non è nel testo, non scrivere la domanda. Regole: ' + E.BRAND_RULES.join(' ') + ' Ogni risposta: 25-60 parole, frase iniziale autosufficiente, nessun superlativo, nessuna promessa sanitaria.'
    const user = 'URL: ' + url + '\nTitolo: ' + info.title + '\n\nTESTO:\n' + body + '\n\nFAQ già presenti: ' + info.faq.map(f => f.q).join(' | ') + '\n\nRestituisci JSON: {"faqs":[{"q":string,"a":string}]} con 4-6 elementi, diversi dalle FAQ già presenti.'
    const r = await aiJson(c.env, sys, user)
    if (!r.ok) return c.json({ success: false, error: r.error, notConfigured: /non configurata/.test(r.error) })
    const bad = /sidly|il migliore|numero 1|rimborsabil|inps/i
    const faqs = (Array.isArray(r.data?.faqs) ? r.data.faqs : []).map((f: any) => ({ q: String(f.q || '').trim(), a: String(f.a || '').trim() }))
      .filter((f: any) => f.q && f.a && !bad.test(f.q + ' ' + f.a)).slice(0, 6)
    const jsonld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((f: any) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
    return c.json({ success: true, model: r.model, page: { url, title: info.title }, existing: info.faq.length, faqs, jsonld: JSON.stringify(jsonld, null, 2), warning: 'Bozza da rivedere: pubblica solo ciò che è vero e già presente sul sito.' })
  })

  return api
}
