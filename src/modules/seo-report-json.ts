// ============================================================
//  Report Analytics Live → JSON machine-readable (Parte 1 del Marketing Hub)
//  Nessuna seconda implementazione dei numeri: il JSON si costruisce dallo STESSO modello del PDF
//  (generateReport → model), cioè dalle stesse query GA4 / GSC / CRM.
//  Regola: sezione non disponibile → null + nota. Mai 0 al posto di «non disponibile».
// ============================================================
import type { GoogleAnalyticsConfig } from './google-analytics'
import { generateReport, type GenerateResult } from './seo-report-render'
import { collectReportInput } from './seo-report-data'
import { PARAMS, GEO_ACTIVATION, QUALIFIED_LEAD, isQualifiedLead, mapCrmChannel, CRM_UNSET, type ReportInput } from './seo-report-engine'

export interface ReportJson {
  period: { startDate: string; endDate: string; days: number; excludedDays: number } | null
  channels: { channel: string; sessions: number }[] | null
  engines: { engine: string; sessions: number }[] | null
  aiTools: { tool: string; sessions: number }[] | null
  direct: { sessions: number; share: number | null; withUtm: number | null } | null
  gsc: null | {
    clicks: number; impressions: number; ctr: number | null; avgPosition: number | null
    period: { startDate: string; endDate: string; days: number }
    queries: { query: string; clicks: number; impressions: number; position: number }[]
  }
  leads: null | {
    total: number; qualified: number; qualifiedDefinition: string
    adsAttributed: number | null; adsAttributedQualified: number | null
    byChannel: { channel: string; leads: number; qualified: number }[]
  }
  quality: { blocking: { id: string; label: string; value: string }[]; anomalies: { id: string; label: string }[] }
  notes: Record<string, string>
  generatedAt: string
}

const round1 = (x: number) => Math.round(x * 10) / 10

/** Costruisce il JSON dal risultato di generateReport (stesso modello, stessi numeri del PDF). */
export function buildReportJson(res: GenerateResult): ReportJson {
  const m = res.model, i: ReportInput = m.input
  const notes: Record<string, string> = {}
  const share = (n: number, d: number) => (d > 0 ? round1((n / d) * PARAMS.per) : null)

  // ── GA4 ──
  let channels: ReportJson['channels'] = null, engines: ReportJson['engines'] = null, aiTools: ReportJson['aiTools'] = null
  let direct: ReportJson['direct'] = null, period: ReportJson['period'] = null
  if (m.ok) {
    period = { startDate: m.win.start, endDate: m.win.aggEnd, days: m.periodDaysGa4, excludedDays: m.excl.total }
    channels = (['SEO', 'AI', 'Direct', 'Paid', 'Social', 'Altro'] as const).map(c => ({ channel: c, sessions: m.macro[c] }))
    engines = m.seoEngines.map(([engine, sessions]) => ({ engine, sessions }))
    aiTools = m.aiTools.map(([tool, sessions]) => ({ tool, sessions }))
    direct = { sessions: m.macro.Direct, share: share(m.macro.Direct, m.total), withUtm: m.direct ? m.direct.withParams : null }
    if (!m.direct) notes.direct = 'landing page del Direct non disponibili: «withUtm» non calcolabile'
    else notes.direct = '«withUtm» = sessioni Direct con parametri utm_ / gclid / gbraid / wbraid / fbclid nella landing'
    if (m.excl.total > 0) notes.period = `${m.excl.lag} giorni esclusi per lag GA4${m.excl.consolidation ? `, ${m.excl.consolidation} perché l'organico non è ancora consolidato` : ''}`
  } else {
    const why = i.errors.filter(e => /^GA4/.test(e)).join(' · ') || 'query base GA4 fallita o intervallo vuoto'
    notes.period = notes.channels = notes.engines = notes.aiTools = notes.direct = `dato non disponibile: ${why}`
  }

  // ── Search Console ──
  let gsc: ReportJson['gsc'] = null
  if (m.gsc && i.gsc) {
    gsc = {
      clicks: m.gsc.clicks, impressions: m.gsc.impressions, ctr: share(m.gsc.clicks, m.gsc.impressions), avgPosition: round1(m.gsc.position),
      period: { startDate: m.win.start, endDate: m.win.gscEnd, days: m.periodDaysGsc },
      queries: i.gsc.queries.map(q => ({ query: q.query, clicks: q.clicks, impressions: q.impressions, position: round1(q.position) })),
    }
    notes.gsc = `periodo ${m.win.start} → ${m.win.gscEnd} (${m.periodDaysGsc} giorni, dati definitivi)`
    notes.gscQueries = 'Search Console omette le query anonimizzate: la somma dei click per query può essere inferiore al totale'
  } else {
    notes.gsc = 'dato non disponibile: ' + (i.errors.filter(e => /^GSC/.test(e)).join(' · ') || 'Search Console non collegata o periodo senza dati')
  }

  // ── Lead CRM (stessa query del report; qualificato = QUALIFIED_LEAD, definizione unica) ──
  let leads: ReportJson['leads'] = null
  if (m.crm && i.crm) {
    const byCh = new Map<string, { leads: number; qualified: number }>()
    let qualified = 0, ads = 0, adsQ = 0
    for (const r of i.crm.rows) {
      const q = isQualifiedLead(r.temperatura, r.status)
      if (q) qualified += r.count
      const ch = (r.canale || '').trim().toUpperCase() || CRM_UNSET
      const e = byCh.get(ch) || { leads: 0, qualified: 0 }
      e.leads += r.count; if (q) e.qualified += r.count; byCh.set(ch, e)
      // lead attribuiti ad ADS: solo dove la mappatura CRM → GA4 è univoca (Paid); META è ambiguo (Paid o Social) e non si conta
      const map = mapCrmChannel(r.canale, r.dettaglio)
      if (map.ga.length === 1 && map.ga[0] === 'Paid') { ads += r.count; if (q) adsQ += r.count }
    }
    leads = {
      total: m.crm.total, qualified, qualifiedDefinition: QUALIFIED_LEAD.definition, adsAttributed: ads, adsAttributedQualified: adsQ,
      byChannel: [...byCh.entries()].map(([channel, v]) => ({ channel, ...v })).sort((a, b) => b.leads - a.leads),
    }
    notes.leads = 'lead attribuiti ad ADS = canale GOOGLE con fonte google_ads (mappatura univoca); i lead senza fonte o con fonte ambigua non sono attribuiti'
  } else {
    notes.leads = 'dato non disponibile: ' + (i.crmError || 'CRM non disponibile')
  }

  return {
    period, channels, engines, aiTools, direct, gsc, leads,
    quality: {
      blocking: res.errors.map(e => ({ id: e.id, label: e.label, value: e.value })),
      anomalies: res.anomalies.map(a => ({ id: a.id, label: a.label })),
    },
    notes, generatedAt: i.now.toISOString(),
  }
}

/** Raccolta + JSON: usata dall'endpoint ?format=json e dal Marketing Hub (stessa pipeline del PDF, nessuna query duplicata). */
export async function collectSeoReportJson(
  config: GoogleAnalyticsConfig, db: any | undefined,
  p: { now: Date; startDate: string; endDate: string; diagnostic?: boolean }
): Promise<ReportJson> {
  const input = await collectReportInput(config, db, {
    now: p.now, startDate: p.startDate, endDate: p.endDate,
    siteUrl: (config as any).searchConsoleSiteUrl, measurementId: 'G-5DY4TY34WK',
    geoActivation: { date: GEO_ACTIVATION.date, label: GEO_ACTIVATION.label },
  })
  return buildReportJson(generateReport(input, { diagnostic: p.diagnostic ?? true }))
}
