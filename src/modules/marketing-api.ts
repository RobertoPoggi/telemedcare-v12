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
import * as D from './ads-decision'
import * as CV from './ads-conversions'
import { qualifiedSql, mapCrmChannel, QUALIFIED_LEAD } from './seo-report-engine'

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
  // Storico del ciclo di vita: ogni transizione (e ogni modifica) lascia una riga, anche se la bozza viene poi eliminata
  await db.prepare(`CREATE TABLE IF NOT EXISTS ads_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER,
    azione TEXT NOT NULL,
    da_stato TEXT,
    a_stato TEXT,
    utente TEXT,
    note TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`).run()
  _ensured = true
}

const userName = (u: any) => String(u?.username || u?.email || 'utente')

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


// ═══════════════ ADS guidate dai dati SEO — helper (la logica pura è in ads-decision.ts) ═══════════════
/** F4: tre esiti distinti. `quota_exhausted` NON è «nessun dato»: i lead non sono zero, GA4 non ha risposto. */
export type HubStatus = 'ok' | 'quota_exhausted' | 'no_data' | 'unavailable'
type SeoJsonRes = { ok: true; json: any } | { ok: false; error: string; notConfigured?: boolean; status: HubStatus }
const _seoCache = new Map<string, { at: number; json: any }>()
/** Parte 1 → Hub: stessa pipeline del PDF (collectSeoReportJson). Cache di 5 minuti per isolate: lo stesso periodo non rilancia GA4/GSC a ogni pannello. */
async function loadSeoJson(env: any, days: number): Promise<SeoJsonRes> {
  const g = googleCfg(env)
  if (!g.ok) return { ok: false, error: 'GA4 / Search Console non collegati (manca GOOGLE_SERVICE_ACCOUNT_JSON oppure OAuth)', notConfigured: true, status: 'unavailable' }
  const now = new Date(); const end = now.toISOString().slice(0, 10); const start = new Date(now.getTime() - days * 864e5).toISOString().slice(0, 10)
  const key = `${days}|${end}`; const hit = _seoCache.get(key)
  if (hit && Date.now() - hit.at < 300000) return { ok: true, json: hit.json }
  try {
    const { collectSeoReportJson } = await import('./seo-report-json')
    const json = await collectSeoReportJson(g.cfg, env.DB, { now, startDate: start, endDate: end, diagnostic: true })
    _seoCache.set(key, { at: Date.now(), json })
    return { ok: true, json }
  } catch (e: any) {
    const q = e?.status === 'quota_exhausted' || e?.kind === 'quota'
    return { ok: false, status: q ? 'quota_exhausted' : 'unavailable', error: q ? QUOTA_MESSAGE : String(e?.message || e).replace(/<[^>]*(>|$)/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200) }
  }
}
export const QUOTA_MESSAGE = 'Dati GA4 temporaneamente non disponibili (quota esaurita). Riprova tra ~1h: i lead non sono zero.'
export const NO_DATA_MESSAGE = 'Nessuna query disponibile nel periodo'
const clampDays = (v: any, d = 28) => Math.min(120, Math.max(7, Number(v) || d))

/** Keyword attive: piani approvati/esportati/in corso + il preset «Primo lancio» (il piano di riferimento). */
async function activeKeywords(db: any): Promise<D.ActiveKeyword[]> {
  const out: D.ActiveKeyword[] = []
  try {
    const { results } = await db.prepare(`SELECT name, plan_json FROM ads_plans WHERE status IN ('approved','exported','running')`).all()
    for (const r of (results || []) as any[]) { try { for (const g of JSON.parse(r.plan_json).adGroups || []) for (const k of g.keywords || []) out.push({ text: String(k.text), plan: String(r.name) }) } catch (_) { /* piano illeggibile */ } }
  } catch (_) { /* tabella assente */ }
  const preset = E.presetPrimoLancio()
  for (const g of preset.adGroups) for (const k of g.keywords) out.push({ text: k.text, plan: preset.campaignName + ' (preset)' })
  return out
}

async function leadsHasColumn(db: any, col: string): Promise<boolean> {
  try { const r = await db.prepare(`SELECT name FROM pragma_table_info('leads')`).all(); return ((r.results || []) as any[]).some(x => x.name === col) } catch (_) { return false }
}
async function loadImported(db: any): Promise<any | null> {
  try { const r: any = await db.prepare(`SELECT value, updated_at FROM settings WHERE key='ads_last_report'`).first(); return r ? { ...JSON.parse(r.value), savedAt: r.updated_at } : null } catch (_) { return null }
}
/** Lead attribuiti ad ADS (click ID o landing con utm_medium=cpc) con flag «qualificato» calcolato dalla definizione unica, + totale lead del periodo. */
async function loadPerfRows(db: any, days: number) {
  try { const m = await import('./workflow-email-manager'); await m.ensureAdsClickColumns(db); await m.ensureLeadAttributionColumns(db) } catch (_) { /* colonne già presenti */ }
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 19).replace('T', ' ')
  const hasUtm = await leadsHasColumn(db, 'utm_campaign')
  const q = async (sql: string, ...b: any[]) => { try { return (await db.prepare(sql).bind(...b).all()).results || [] } catch (_) { return null } }
  const rows = await q(`SELECT gclid, gbraid, wbraid, landing_page, ${hasUtm ? 'utm_campaign' : "NULL AS utm_campaign"}, CASE WHEN ${qualifiedSql()} THEN 1 ELSE 0 END AS q
    FROM leads WHERE created_at >= ? AND ((gclid IS NOT NULL AND gclid!='') OR (gbraid IS NOT NULL AND gbraid!='') OR (wbraid IS NOT NULL AND wbraid!='') OR landing_page LIKE '%utm_medium=cpc%')`, since)
  const all = await q(`SELECT COUNT(*) AS n, COALESCE(SUM(CASE WHEN ${qualifiedSql()} THEN 1 ELSE 0 END),0) AS q FROM leads WHERE created_at >= ?`, since)
  return { rows: rows as any[] | null, all: all ? { total: Number((all[0] as any)?.n || 0), qualified: Number((all[0] as any)?.q || 0) } : null, hasUtmColumn: hasUtm, since }
}
async function spendOfMonth(db: any): Promise<number | null> {
  try { const r: any = await db.prepare(`SELECT value FROM settings WHERE key='ads_spend_log'`).first(); const v = r ? JSON.parse(r.value)[new Date().toISOString().slice(0, 7)] : null; return Number(v) > 0 ? Number(v) : null } catch (_) { return null }
}
/** Performance ADS misurata: la usano /performance, /ads/optimize (cr), /ads/decisions e /ads/projection. */
async function adsPerformance(db: any, days: number) {
  const pr = await loadPerfRows(db, days)
  const imported = await loadImported(db)
  const spend = await spendOfMonth(db)
  const perf = D.perfFromLeads((pr.rows || []) as any[], (imported?.campaigns || []) as D.ImportedCampaign[], spend)
  const built = D.buildPerformance({ total: perf.total, campaigns: perf.campaigns, maxCpl: D.DEFAULTS.maxCpl, seoCostPerLead: D.DEFAULTS.seoCostPerLead })
  return { pr, imported, perf, built }
}
const _num = (v: any) => (v === '' || v == null ? NaN : Number(v))

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
      const prev: any = await c.env.DB.prepare('SELECT status FROM ads_plans WHERE id=?').bind(b.id).first()
      if (prev && prev.status !== 'draft' && !D.canModify(prev.status)) return c.json({ success: false, error: `La bozza è nello stato «${D.LIFECYCLE[prev.status as D.PlanState]?.label || prev.status}»: non si modifica. Duplicala come nuova bozza.` }, 409)
      const r = await c.env.DB.prepare(`UPDATE ads_plans SET name=?, plan_json=?, status='draft', approved_by=NULL, approved_at=NULL, exported_at=NULL, updated_at=datetime('now') WHERE id=?`).bind(name, JSON.stringify(plan), b.id).run()
      await D.logHistory(c.env.DB, { planId: b.id, azione: 'modifica', da: prev?.status || null, a: 'draft', utente: userName(u) })
      return c.json({ success: true, id: Number(b.id), status: 'draft', issues: E.lintPlan(plan), changed: r.meta?.changes ?? 1 })
    }
    const r = await c.env.DB.prepare(`INSERT INTO ads_plans (name,status,origin,plan_json,created_by) VALUES (?,?,?,?,?)`).bind(name, 'draft', plan.origin || 'preset', JSON.stringify(plan), u?.username || null).run()
    await D.logHistory(c.env.DB, { planId: r.meta?.last_row_id, azione: 'crea', da: null, a: 'draft', utente: userName(u) })
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
    const t = D.transition('approva', r.status)
    if (!t.ok) return c.json({ success: false, error: t.error }, 409)
    await c.env.DB.prepare(`UPDATE ads_plans SET status='approved', approved_by=?, approved_at=datetime('now'), updated_at=datetime('now') WHERE id=?`).bind(userName(u), r.id).run()
    await D.logHistory(c.env.DB, { planId: r.id, azione: 'approva', da: r.status, a: 'approved', utente: userName(u) })
    return c.json({ success: true, status: 'approved', issues })
  })
  api.post('/plans/:id/revoke', async (c) => {
    await ensureTables(c.env.DB)
    const r: any = await c.env.DB.prepare('SELECT id,status FROM ads_plans WHERE id=?').bind(c.req.param('id')).first()
    if (!r) return c.json({ success: false, error: 'Bozza non trovata' }, 404)
    const t = D.transition('revoca', r.status)
    if (!t.ok) return c.json({ success: false, error: t.error }, 409)
    await c.env.DB.prepare(`UPDATE ads_plans SET status='draft', approved_by=NULL, approved_at=NULL, updated_at=datetime('now') WHERE id=?`).bind(r.id).run()
    await D.logHistory(c.env.DB, { planId: r.id, azione: 'revoca', da: r.status, a: 'draft', utente: userName(c.get('user')) })
    return c.json({ success: true, status: 'draft' })
  })
  api.delete('/plans/:id', async (c) => {
    await ensureTables(c.env.DB)
    const r: any = await c.env.DB.prepare('SELECT id,status FROM ads_plans WHERE id=?').bind(c.req.param('id')).first()
    if (!r) return c.json({ success: false, error: 'Bozza non trovata' }, 404)
    if (r.status !== 'draft') return c.json({ success: false, error: `Si elimina solo una bozza: questa è «${D.LIFECYCLE[r.status as D.PlanState]?.label || r.status}». Revocala (se approvata) o archiviala.` }, 409)
    await c.env.DB.prepare('DELETE FROM ads_plans WHERE id=?').bind(r.id).run()
    await D.logHistory(c.env.DB, { planId: r.id, azione: 'elimina', da: r.status, a: null, utente: userName(c.get('user')) })
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
    if (r.status === 'approved') {
      await c.env.DB.prepare(`UPDATE ads_plans SET status='exported', exported_at=datetime('now') WHERE id=?`).bind(r.id).run()
      await D.logHistory(c.env.DB, { planId: r.id, azione: 'esporta', da: 'approved', a: 'exported', utente: userName(c.get('user')) })
    } else await D.logHistory(c.env.DB, { planId: r.id, azione: 'riesporta', da: r.status, a: r.status, utente: userName(c.get('user')) })
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
    // Parte 5: misura sui lead QUALIFICATI (definizione unica QUALIFIED_LEAD), complessiva e per campagna (join su click ID e utm_campaign)
    let ext: any = {}
    try {
      const ap = await adsPerformance(c.env.DB, days)
      const b = ap.built
      ext = {
        qualifiedLeads: b.overall.qualified, qcpl: b.overall.qcpl, qualificationRate: b.overall.qualificationRate,
        qualifiedLeadsAll: ap.pr.all ? ap.pr.all.qualified : null,
        sample: b.sample, sufficient: b.sufficient, definition: b.definition,
        campaigns: b.campaigns, stops: b.stops, thresholds: b.thresholds, spendBasis: ap.perf.spendBasis, note: b.note,
        importedReport: ap.imported ? { kind: ap.imported.kind, savedAt: ap.imported.savedAt, totals: ap.imported.totals } : null,
        // Campagna = leads.utm_campaign; l'URL di landing_page è solo il fallback dei lead storici (prima del salvataggio della colonna)
        attribution: { ...ap.perf.attribution, columnPresent: ap.pr.hasUtmColumn,
          note: ap.perf.attribution.fallbackLeads > 0 ? `${ap.perf.attribution.fallbackLeads} lead attribuiti alla campagna leggendo l'URL di landing (storici, senza utm_campaign salvata)` : null },
      }
    } catch (e: any) { ext = { qualifiedLeads: null, qcpl: null, qualificationRate: null, definition: QUALIFIED_LEAD.definition, error: 'dato non disponibile: ' + String(e?.message || e).slice(0, 160) } }
    return c.json({ success: true, days, leads: Number((tot[0] as any)?.n || 0), leadsGoogle, byStatus, byChannel: byCampaign, spend, month, spendMonth, cpl: leadsGoogle && spendMonth ? +(spendMonth / leadsGoogle).toFixed(2) : null, target: { leadsMonth: [30, 40], cpl: [12, 15] }, ...ext })
  })
  // ── Conversioni offline: conteggi (= righe del CSV), CSV e data dell'ultimo upload (inserita a mano) ──
  api.get('/conversions/summary', async (c) => {
    await ensureTables(c.env.DB)
    try { const m = await import('./workflow-email-manager'); await m.ensureAdsClickColumns(c.env.DB) } catch (_) { /* colonne già presenti */ }
    const tipo = String(c.req.query('tipo') || 'gclid'); const giorni = Number(c.req.query('giorni')) || 90
    const ex = await CV.loadConversionExport(c.env.DB, { kind: tipo, giorni, tutti: false })
    const last = await CV.loadLastUpload(c.env.DB)
    return c.json({ success: true, tipo: ex.kind, giorni: ex.giorni, qualificati: ex.qualified, conClickId: ex.withClickId, leadPeriodo: ex.leadsPeriod, conValore: ex.valued,
      definition: QUALIFIED_LEAD.definition, lastUpload: last, manual: 'Il file lo carichi tu in Google Ads: nessun invio automatico.' })
  })
  api.get('/conversions/csv', async (c) => {
    await ensureTables(c.env.DB)
    try { const m = await import('./workflow-email-manager'); await m.ensureAdsClickColumns(c.env.DB) } catch (_) { /* colonne già presenti */ }
    const ex = await CV.loadConversionExport(c.env.DB, { kind: String(c.req.query('tipo') || 'gclid'), giorni: Number(c.req.query('giorni')) || 90, tutti: c.req.query('tutti') === '1', name: c.req.query('nome') || undefined })
    return new Response(ex.csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="' + ex.fileName + '"', 'X-Rows': String(ex.rows.length), 'Cache-Control': 'no-store' } })
  })
  api.post('/conversions/last-upload', async (c) => {
    await ensureTables(c.env.DB)
    const b: any = await c.req.json().catch(() => ({}))
    const date = CV.parseUploadDate(b.date)
    if (!date) return c.json({ success: false, error: 'Data non valida (AAAA-MM-GG, non nel futuro)' }, 400)
    await CV.saveLastUpload(c.env.DB, date)
    return c.json({ success: true, lastUpload: { date } })
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


  // ═══════════════ ADS guidate dai dati SEO (Parti 2-7) ═══════════════
  // Nessuna di queste rotte scrive su Google Ads: producono proposte e liste. L'approvazione resta umana.

  /** Query GSC classificate (Parte 2) a partire dal JSON della Parte 1 + guardrail bloccante sulle negative. */
  async function seoInputs(c: Ctx, days: number) {
    const r = await loadSeoJson(c.env, days)
    if (!r.ok) return { ok: false as const, error: r.error, notConfigured: (r as any).notConfigured, status: r.status }
    await ensureTables(c.env.DB)
    const inputs = D.buildSeoInputs(r.json, await activeKeywords(c.env.DB))
    // GSC/GA4 parzialmente fallite per quota: i dati letti non sono «nessun dato»
    const quotaPartial = !!r.json?.sources?.failures?.some((f: any) => f.kind === 'quota')
    const status: HubStatus = !inputs.available ? (quotaPartial ? 'quota_exhausted' : 'unavailable') : (inputs.items && inputs.items.length > 0 ? 'ok' : 'no_data')
    return { ok: true as const, json: r.json, inputs, status }
  }
  /** F4: risposta uniforme quando GA4/GSC non hanno risposto. `quota_exhausted` ≠ «nessun dato». */
  const seoFail = (c: Ctx, r: { error: string; notConfigured?: boolean; status: HubStatus }) =>
    c.json({ success: false, status: r.status, error: r.error, message: r.status === 'quota_exhausted' ? QUOTA_MESSAGE : r.error, notConfigured: r.notConfigured }, 200)
  const noDataResp = (c: Ctx, reason: string | null, status: HubStatus) =>
    c.json({ success: false, status, error: reason || NO_DATA_MESSAGE, message: status === 'quota_exhausted' ? QUOTA_MESSAGE : (reason || NO_DATA_MESSAGE) }, 200)
  const periodDaysOf = (json: any, fallback: number) => Number(json?.gsc?.period?.days) > 0 ? Number(json.gsc.period.days) : fallback

  // Parte 2
  api.get('/ads/seo-inputs', async (c) => {
    const days = clampDays(c.req.query('giorni'))
    const r = await seoInputs(c, days)
    if (!r.ok) return seoFail(c, r)
    const i = r.inputs
    const blocked = i.blocking.length > 0
    return c.json({
      success: true, status: r.status, message: r.status === 'ok' ? null : r.status === 'quota_exhausted' ? QUOTA_MESSAGE : (i.reason || NO_DATA_MESSAGE), valid: !blocked,
      blockingError: blocked ? `${i.blocking.length} negativa/e colpiscono keyword attive: correggi prima di procedere` : null,
      period: r.json.gsc?.period || r.json.period || null, available: i.available, reason: i.reason,
      counts: i.counts, coverage: i.coverage, items: i.items, blocking: i.blocking, negativeCandidates: i.negativeCandidates,
      ctrTarget: i.ctrTarget, thresholds: D.THRESHOLDS, basis: 'misurato (Search Console) — i clic persi sono una stima: CTR_target è un\'assunzione',
      notes: r.json.notes,
    })
  })
  // Guardrail bloccante usabile da chiunque proponga negative (UI, import): 409 se una negativa uccide una keyword attiva
  api.post('/ads/negatives/validate', async (c) => {
    await ensureTables(c.env.DB)
    const b: any = await c.req.json().catch(() => ({}))
    const negs = (Array.isArray(b.negatives) ? b.negatives : []).map((x: any) => String(x).trim()).filter(Boolean).slice(0, 500)
    const col = D.negativeCollisions(negs, await activeKeywords(c.env.DB))
    if (col.length) return c.json({ success: false, valid: false, level: 'error', error: `${col.length} negativa/e bloccano keyword attive`, blocking: col }, 409)
    return c.json({ success: true, valid: true, blocking: [] })
  })

  // Parte 3
  api.post('/ads/optimize', async (c) => {
    await ensureTables(c.env.DB)
    const b: any = await c.req.json().catch(() => ({}))
    const target = _num(b.targetQualifiedLeads), maxCpl = _num(b.maxCpl)
    if (!(target > 0) || target > 100000) return c.json({ success: false, error: 'targetQualifiedLeads (lead qualificati/mese) deve essere un numero maggiore di zero' }, 400)
    if (!(maxCpl > 0) || maxCpl > 10000) return c.json({ success: false, error: 'maxCpl (costo massimo per lead qualificato, €) deve essere un numero maggiore di zero' }, 400)
    const cap = b.budgetCap == null || b.budgetCap === '' ? null : _num(b.budgetCap)
    if (cap != null && !(cap > 0)) return c.json({ success: false, error: 'budgetCap (€/mese) deve essere maggiore di zero oppure assente' }, 400)
    const days = clampDays(b.giorni)
    const r = await seoInputs(c, days)
    if (!r.ok) return seoFail(c, r)
    if (!r.inputs.available || !r.inputs.items) return noDataResp(c, r.inputs.reason || 'query Search Console non disponibili', r.status)
    if (r.status === 'no_data') return noDataResp(c, NO_DATA_MESSAGE, 'no_data')
    const perf = await adsPerformance(c.env.DB, 90)
    const measured = D.measuredCr(perf.perf.total)
    const crDeclared = _num(b.cr)
    const cr = crDeclared > 0 && crDeclared < 1 ? { cr: crDeclared, source: 'assunzione' as const, note: `cr dichiarato dall'utente (${crDeclared}), non misurato` } : measured
    const cpcIn = _num(b.cpc)
    const inp: D.OptimizeInput = { targetQualifiedLeads: target, maxCpl, budgetCap: cap, cr: cr.cr, crSource: cr.source, cpc: cpcIn > 0 ? cpcIn : D.DEFAULTS.cpc, cpcSource: cpcIn > 0 ? 'inserito' : 'assunzione', periodDays: periodDaysOf(r.json, days), items: r.inputs.items }
    const out = D.optimizeBudget(inp)
    return c.json({ success: true, status: r.status, ...out, crNote: cr.note, range: D.optimizeRange(inp), blocking: r.inputs.blocking, note: 'Proposta: nessuna campagna viene creata o modificata su Google Ads.' })
  })

  // Parte 4 — import del report di Google Ads (CSV, nessuna API)
  api.post('/ads/import-report', async (c) => {
    await ensureTables(c.env.DB)
    const b: any = await c.req.json().catch(() => null)
    if (!b || typeof b !== 'object') return c.json({ success: false, error: 'Richiesta non valida: invia un JSON con il campo «csv»' }, 400)
    const csv = String(b.csv || '')
    if (csv.length > 2_000_000) return c.json({ success: false, error: 'File troppo grande (max 2 MB)' }, 413)
    const min = Math.min(100, Math.max(1, Number(b.minClicks) || 15))
    const rep = D.parseAdsReport(csv, min)
    if (!rep.ok) return c.json({ success: false, error: rep.error }, 400)
    // aggregato per campagna (join con i lead su utm_campaign) + termini per le decisioni
    const camp = new Map<string, D.ImportedCampaign>()
    for (const r of rep.rows) {
      const name = r.campaign || '(senza campagna)'
      const e = camp.get(name) || { campaign: name, impressions: 0, clicks: 0, cost: 0, conversions: 0 }
      e.impressions += r.impressions; e.clicks += r.clicks; e.cost += r.cost; e.conversions += r.conversions; camp.set(name, e)
    }
    const campaigns = [...camp.values()].map(x => ({ ...x, cost: Math.round(x.cost * 100) / 100 }))
    const terms = rep.kind === 'search_terms' ? rep.rows.map(r => ({ term: r.search_term, campaign: r.campaign, clicks: r.clicks, impressions: r.impressions, cost: r.cost, conversions: r.conversions })).sort((a, z) => z.clicks - a.clicks).slice(0, 400) : []
    const u: any = c.get('user')
    // Un report per volta: sostituisce il precedente (il periodo coperto lo dichiara il file, non l'import)
    const prev = await loadImported(c.env.DB)
    const saved = rep.kind === 'campaigns' && prev?.terms?.length ? { ...prev, campaigns, kind: 'campaigns', totals: rep.totals } : { kind: rep.kind, campaigns, terms: terms.length ? terms : (prev?.terms || []), totals: rep.totals }
    await c.env.DB.prepare(`INSERT INTO settings (key,value,description,updated_at) VALUES ('ads_last_report',?,'Ultimo report Google Ads importato (campagne e termini)',datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`).bind(JSON.stringify(saved)).run()
    await D.logHistory(c.env.DB, { planId: b.planId || null, azione: 'importa', da: null, a: null, utente: userName(u), note: `${rep.kind}: ${rep.totals!.rows} righe, ${rep.totals!.clicks} clic, ${rep.totals!.cost} €` })
    // guardrail: le negative proposte non devono colpire keyword attive
    const negCol = rep.analysis ? D.negativeCollisions(rep.analysis.negatives.map((n: any) => n.term), await activeKeywords(c.env.DB)) : []
    return c.json({
      success: true, kind: rep.kind, totals: rep.totals, warnings: rep.warnings, campaigns,
      terms: terms.slice(0, 100).map(t => ({ search_term: t.term, campaign: t.campaign, impressions: t.impressions, clicks: t.clicks, cost: t.cost, conversions: t.conversions })),
      negatives: rep.analysis ? rep.analysis.negatives.slice(0, 200) : [], review: rep.analysis ? rep.analysis.review.slice(0, 200) : [],
      noConvData: rep.analysis ? rep.analysis.noConvData : null, blocking: negCol, basis: 'misurato (report Google Ads)',
    })
  })

  // Parte 4 — ciclo di vita: azioni di stato (attiva, pausa, riprendi, archivia) + duplica + storico
  api.get('/ads/lifecycle', (c) => c.json({ success: true, states: D.LIFECYCLE, transitions: D.TRANSITIONS }))
  api.post('/plans/:id/action', async (c) => {
    await ensureTables(c.env.DB)
    const b: any = await c.req.json().catch(() => ({}))
    const action = String(b.action || '')
    // approva / revoca / esporta hanno rotte dedicate (lint, CSV); qui le altre transizioni manuali
    if (['approva', 'revoca', 'esporta'].includes(action)) return c.json({ success: false, error: `«${action}» si fa dalla scheda della bozza (controlli di validazione e file CSV)` }, 400)
    const r = await D.applyTransition(c.env.DB, c.req.param('id'), action, userName(c.get('user')), b.note ? String(b.note).slice(0, 300) : undefined)
    if (!r.ok) return c.json({ success: false, error: r.error }, r.status as any)
    return c.json({ success: true, from: r.from, status: r.to, actions: D.LIFECYCLE[r.to as D.PlanState].actions })
  })
  api.post('/plans/:id/duplicate', async (c) => {
    await ensureTables(c.env.DB)
    const r: any = await c.env.DB.prepare('SELECT * FROM ads_plans WHERE id=?').bind(c.req.param('id')).first()
    if (!r) return c.json({ success: false, error: 'Bozza non trovata' }, 404)
    if (r.status !== 'archived') return c.json({ success: false, error: `«duplica» è disponibile solo per una campagna archiviata (questa è «${D.LIFECYCLE[r.status as D.PlanState]?.label || r.status}»)` }, 409)
    const u: any = c.get('user')
    const name = (String(r.name) + ' (copia)').slice(0, 120)
    const ins = await c.env.DB.prepare(`INSERT INTO ads_plans (name,status,origin,plan_json,created_by) VALUES (?,?,?,?,?)`).bind(name, 'draft', r.origin, r.plan_json, userName(u)).run()
    const id = ins.meta?.last_row_id
    await D.logHistory(c.env.DB, { planId: r.id, azione: 'duplica', da: 'archived', a: 'archived', utente: userName(u), note: `nuova bozza #${id}` })
    await D.logHistory(c.env.DB, { planId: id, azione: 'crea', da: null, a: 'draft', utente: userName(u), note: `duplicata dalla #${r.id}` })
    return c.json({ success: true, id, status: 'draft' })
  })
  api.get('/plans/:id/history', async (c) => {
    await ensureTables(c.env.DB)
    const { results } = await c.env.DB.prepare('SELECT id,plan_id,azione,da_stato,a_stato,utente,note,created_at FROM ads_history WHERE plan_id=? ORDER BY id DESC LIMIT 200').bind(c.req.param('id')).all()
    return c.json({ success: true, history: results || [] })
  })
  api.get('/ads/history', async (c) => {
    await ensureTables(c.env.DB)
    const { results } = await c.env.DB.prepare('SELECT id,plan_id,azione,da_stato,a_stato,utente,note,created_at FROM ads_history ORDER BY id DESC LIMIT 100').all()
    return c.json({ success: true, history: results || [] })
  })

  // Parte 6 — «Decisioni di oggi» (max 5 righe, ognuna col numero che la genera)
  api.get('/ads/decisions', async (c) => {
    await ensureTables(c.env.DB)
    const days = clampDays(c.req.query('giorni'))
    const perf = await adsPerformance(c.env.DB, 90)
    // F4: lo stato di GA4/GSC si legge PRIMA. Con quota esaurita il pannello dice «quota esaurita», mai «dati insufficienti: 0/10».
    const r = await seoInputs(c, days)
    const status: HubStatus = r.ok ? r.status : r.status
    if (status === 'quota_exhausted') return c.json({ success: true, status, message: QUOTA_MESSAGE, rows: [], insufficient: null, max: D.MAX_DECISIONS, qualified: perf.built.sample.qualified, seoAvailable: false, seoError: QUOTA_MESSAGE })
    // «dati insufficienti: N/10» è consentito SOLO con status ok (dati letti, query classificate)
    if (!perf.built.sufficient) {
      if (status === 'ok') return c.json({ success: true, status, message: null, rows: [], insufficient: `${perf.built.sample.message} lead qualificati`, max: D.MAX_DECISIONS, qualified: perf.built.sample.qualified, seoAvailable: true, seoError: null })
      const msg = status === 'no_data' ? NO_DATA_MESSAGE : (r.ok ? (r.inputs.reason || NO_DATA_MESSAGE) : r.error)
      return c.json({ success: true, status, message: msg, rows: [], insufficient: null, max: D.MAX_DECISIONS, qualified: perf.built.sample.qualified, seoAvailable: r.ok, seoError: r.ok ? null : r.error })
    }
    const items = r.ok && r.inputs.available && r.inputs.items ? r.inputs.items : []
    const cr = D.measuredCr(perf.perf.total)
    const terms = ((perf.imported?.terms || []) as any[]).map(t => ({ term: String(t.term), clicks: Number(t.clicks) || 0, conversions: Number(t.conversions) || 0 }))
    const out = D.decisionsOfToday({
      qualifiedTotal: perf.perf.total.qualified, measured: perf.built.campaigns, stops: perf.built.stops, maxCpl: D.DEFAULTS.maxCpl,
      terms, convTracked: terms.some(t => t.conversions > 0), items, cpc: D.DEFAULTS.cpc, cr: cr.cr, seoCostPerLead: D.DEFAULTS.seoCostPerLead,
    })
    return c.json({ success: true, status, message: null, ...out, max: D.MAX_DECISIONS, qualified: perf.built.sample.qualified, seoAvailable: r.ok, seoError: r.ok ? null : r.error, crBasis: cr.source })
  })

  // Parte 7 — tre liste operative (JSON, oppure ?list=brief|geo|protect&format=csv)
  api.get('/ads/lists', async (c) => {
    const days = clampDays(c.req.query('giorni'))
    const r = await seoInputs(c, days)
    if (!r.ok) return seoFail(c, r)
    if (!r.inputs.available || !r.inputs.items) return noDataResp(c, r.inputs.reason || 'query Search Console non disponibili', r.status)
    if (r.status === 'no_data') return noDataResp(c, NO_DATA_MESSAGE, 'no_data')
    let pages: string[] = []; try { pages = await sitemapUrls() } catch (_) { pages = [] }
    const perf = await adsPerformance(c.env.DB, 90)
    const cr = D.measuredCr(perf.perf.total)
    const L = D.buildLists(r.inputs.items, { periodDays: periodDaysOf(r.json, days), cpc: D.DEFAULTS.cpc, cr: cr.cr, seoCostPerLead: D.DEFAULTS.seoCostPerLead, pages })
    const which = String(c.req.query('list') || '')
    if (c.req.query('format') === 'csv') {
      if (!['brief', 'geo', 'protect'].includes(which)) return c.json({ success: false, error: 'Indica list=brief, geo oppure protect' }, 400)
      const names: any = { brief: 'brief-contenuto', geo: 'azioni-geo-aeo', protect: 'query-da-proteggere' }
      return new Response(D.toCsv((L as any)[which], (D.LIST_COLUMNS as any)[which]), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="ecura_${names[which]}_${new Date().toISOString().slice(0, 10)}.csv"`, 'Cache-Control': 'no-store' } })
    }
    return c.json({
      success: true, period: r.json.gsc?.period || null, counts: { brief: L.brief.length, geo: L.geo.length, protect: L.protect.length },
      brief: L.brief, geo: L.geo, protect: L.protect, sitemapAvailable: pages.length > 0,
      assumptions: [`QCPL stimato ${L.qcplEstimated ?? 'n.d.'} € = CPC ${D.DEFAULTS.cpc} € / cr ${cr.cr} (${cr.source}) contro costo SEO ${D.DEFAULTS.seoCostPerLead} € per lead (assunzione dichiarata): ${L.adsNotWorth ? 'le ADS non convengono' : 'le ADS convengono'}`,
        'titolo e H2 proposti sono bozze generate da regole, non da AI: il redattore li rivede'],
      note: 'Le liste partono dalle stesse query della Parte 2. Se una query protetta scende oltre la posizione ' + D.THRESHOLDS.organicWinsMaxPos + ' compare tra le candidate ADS alla prossima lettura.',
    })
  })

  // Parte 7 — proiezione del moltiplicatore («proiezione, non previsione»)
  api.get('/ads/projection', async (c) => {
    await ensureTables(c.env.DB)
    const days = clampDays(c.req.query('giorni'))
    const target = _num(c.req.query('target')) > 0 ? _num(c.req.query('target')) : 30
    const maxCpl = _num(c.req.query('maxCpl')) > 0 ? _num(c.req.query('maxCpl')) : D.DEFAULTS.maxCpl
    const r = await seoInputs(c, days)
    if (!r.ok) return seoFail(c, r)
    if (!r.inputs.available || !r.inputs.items) return noDataResp(c, r.inputs.reason || 'query Search Console non disponibili', r.status)
    if (r.status === 'no_data') return noDataResp(c, NO_DATA_MESSAGE, 'no_data')
    const perf = await adsPerformance(c.env.DB, 90)
    const cr = D.measuredCr(perf.perf.total)
    const inp: D.OptimizeInput = { targetQualifiedLeads: target, maxCpl, budgetCap: null, cr: cr.cr, crSource: cr.source, cpc: D.DEFAULTS.cpc, cpcSource: 'assunzione', periodDays: periodDaysOf(r.json, days), items: r.inputs.items }
    const rng = D.optimizeRange(inp)
    // lead organici dei due mesi precedenti (stessa mappatura canale CRM del report)
    const now = new Date(); const y = now.getUTCFullYear(), mo = now.getUTCMonth()
    const months = [2, 1].map(k => { const d = new Date(Date.UTC(y, mo - k, 1)); return { month: d.toISOString().slice(0, 7), days: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate() } })
    let previousMonths: { month: string; organicLeads: number; days: number }[] | undefined
    try {
      const { results } = await c.env.DB.prepare(`SELECT substr(created_at,1,7) AS m, canale_acquisizione AS canale, dettaglio_fonte AS dettaglio, COUNT(*) AS n FROM leads WHERE substr(created_at,1,7) >= ? AND substr(created_at,1,7) <= ? GROUP BY 1,2,3`).bind(months[0].month, months[1].month).all()
      previousMonths = months.map(mm => {
        let tot = 0, ads = 0
        for (const x of (results || []) as any[]) if (x.m === mm.month) { tot += Number(x.n); const mp = mapCrmChannel(x.canale || '', x.dettaglio || ''); if (mp.ga.length === 1 && mp.ga[0] === 'Paid') ads += Number(x.n) }
        return { month: mm.month, organicLeads: tot - ads, days: mm.days }
      })
    } catch (_) { previousMonths = undefined }
    const L = r.json.leads
    const proj = D.projectMultiplier({
      totalLeads: L ? L.total : null, adsAttributedLeads: L ? L.adsAttributed : null, periodDays: Number(r.json.period?.days) || days,
      ads: { min: { leads: rng.min.leads, budgetMonth: rng.min.budgetMonth }, max: { leads: rng.max.leads, budgetMonth: rng.max.budgetMonth } },
      adsBasis: cr.source === 'misurato' ? 'misurato' : 'stimato', previousMonths,
    })
    return c.json({ success: true, ...proj, optimizeInput: { target, maxCpl, cr: cr.cr, crSource: cr.source, cpc: D.DEFAULTS.cpc }, adsRange: rng, period: r.json.period })
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
    const focus = typeof b.query === 'string' && b.query.trim() ? '\nDOMANDA DA COPRIRE (query di ricerca reale): «' + b.query.trim().slice(0, 120) + '». Scrivi la domanda corrispondente SOLO se il testo contiene la risposta.' : ''
    const user = 'URL: ' + url + '\nTitolo: ' + info.title + focus + '\n\nTESTO:\n' + body + '\n\nFAQ già presenti: ' + info.faq.map(f => f.q).join(' | ') + '\n\nRestituisci JSON: {"faqs":[{"q":string,"a":string}]} con 4-6 elementi, diversi dalle FAQ già presenti.'
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
