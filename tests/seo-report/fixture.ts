// Fixture SINTETICA e deterministica per i test del report (NON sono dati reali eCura).
// Struttura simile al caso reale: ~1.340 sessioni, Direct alto, AI presente, 67 lead di cui 11 senza fonte.
// Con le opzioni si ottengono i casi che DEVONO produrre anomalie/errori (coda in consolidamento, settimane
// con organico > click, device diverso dal totale, ...). I JSON in tests/fixtures/ sono generati da qui.
import type { ReportInput, BaseRow, SmBaseRow } from '../../src/modules/seo-report-engine'

function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }
const addDays = (s: string, n: number) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }
const addMonths = (ym: string, n: number) => { const [y, m] = ym.split('-').map(Number); const t = y * 12 + (m - 1) + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}` }

export interface FixtureOpts {
  now?: string; start?: string; req_end?: string
  midnight?: number            // sessioni contate su due date (somma datata − totale senza dimensioni)
  tailOrganic?: number         // moltiplicatore dell'organico negli ultimi 3 giorni scaricati (es. 0.2 = consolidamento incompleto)
  gaOrganicBoost?: { week: string; factor: number }[]  // moltiplica l'organico GA4 di una settimana (lunedì) per rendere GA4 > GSC
  longHistory?: boolean        // storico GA4 mensile anche prima dell'attivazione GEO
  mutate?: (i: ReportInput) => void
}

export function makeFixture(o: FixtureOpts = {}): ReportInput {
  const now = new Date(o.now || '2026-11-04T10:05:30Z')
  const today = now.toISOString().slice(0, 10)
  const start = o.start || '2026-08-09'
  const reqEnd = o.req_end || '2026-11-04'
  const midnight = o.midnight ?? 7
  const R = rng(42)
  const ga4End = addDays(today, -4)          // lag GA4 = 4
  const gscEnd = addDays(today, -3)
  const boost = new Map((o.gaOrganicBoost || []).map(b => [b.week, b.factor]))
  const weekMonday = (d: string) => { const x = new Date(d + 'T00:00:00Z'); x.setUTCDate(x.getUTCDate() - ((x.getUTCDay() + 6) % 7)); return x.toISOString().slice(0, 10) }
  const base: BaseRow[] = []
  const gscDaily: { date: string; clicks: number; impressions: number }[] = []
  for (let d = start; d <= reqEnd; d = addDays(d, 1)) {
    const k = (Date.parse(d) - Date.parse(start)) / 864e5
    const growth = 0.7 + k / 120
    const partial = d > ga4End
    const f = partial ? 0.15 : 1
    const tail = o.tailOrganic != null && d > addDays(ga4End, -3) && d <= ga4End ? o.tailOrganic : 1
    const mk = (src: string, med: string, ch: string, mean: number, extra = 1) => {
      const n = Math.round(mean * growth * f * extra * (0.6 + R() * 0.9))
      if (n > 0) base.push({ date: d, channelGrouping: ch, source: src, medium: med, sessions: n })
    }
    mk('google', 'organic', 'Organic Search', 6.2, tail * (boost.get(weekMonday(d)) ?? 1))
    mk('bing', 'organic', 'Organic Search', 0.25)
    mk('chatgpt.com', 'referral', 'Referral', 2.0)
    mk('perplexity.ai', 'referral', 'Referral', 0.7)
    mk('(direct)', '(none)', 'Direct', 4.4)
    mk('facebook.com', 'referral', 'Referral', 0.15)
    mk('l.instagram.com', 'referral', 'Referral', 0.2)
    mk('google', 'cpc', 'Paid Search', 0.5)
    mk('search.google.com', 'referral', 'Referral', 0.08)
    if (d <= gscEnd) gscDaily.push({ date: d, clicks: Math.round(8.2 * growth * (0.5 + R())), impressions: Math.round(140 * growth * (0.7 + R() * 0.6)) })
  }
  const clicks = gscDaily.reduce((s, r) => s + r.clicks, 0), impr = gscDaily.reduce((s, r) => s + r.impressions, 0)

  // Finestra aggregata (come nel generatore): consolidamento rilevato solo se si richiede la coda incompleta
  const aggEnd = o.tailOrganic != null && o.tailOrganic < 0.5 ? addDays(ga4End, -3) : ga4End
  const lastDay = reqEnd < aggEnd ? reqEnd : aggEnd

  // Query senza data: aggregazione per canale × source × medium, meno le sessioni a cavallo della mezzanotte
  const smMap = new Map<string, SmBaseRow>()
  for (const r of base) {
    if (r.date > lastDay) continue
    const key = `${r.channelGrouping}|${r.source}|${r.medium}`
    const e = smMap.get(key); if (e) e.sessions += r.sessions; else smMap.set(key, { channelGrouping: r.channelGrouping, source: r.source, medium: r.medium, sessions: r.sessions })
  }
  const smBase = [...smMap.values()]
  if (midnight > 0) { const top = [...smBase].sort((a, b) => b.sessions - a.sessions)[0]; top.sessions -= midnight }
  const tot = smBase.reduce((s, r) => s + r.sessions, 0)

  // Mensile: intervallo PROPRIO di 12 mesi; storico solo dall'attivazione (caso reale) o lungo (longHistory)
  const monthStart = `${addMonths(lastDay.slice(0, 7), -11)}-01`
  const monthlyRows: NonNullable<ReportInput['ga4']['monthly']> = []
  for (const r of base) if (r.date <= lastDay) monthlyRows.push({ month: r.date.slice(0, 7), source: r.source, medium: r.medium, sessions: r.sessions })
  if (o.longHistory) {
    for (let mo = addMonths(start.slice(0, 7), -9); mo < start.slice(0, 7); mo = addMonths(mo, 1)) {
      monthlyRows.push({ month: mo, source: 'google', medium: 'organic', sessions: 120 })
      monthlyRows.push({ month: mo, source: '(direct)', medium: '(none)', sessions: 90 })
      monthlyRows.push({ month: mo, source: 'chatgpt.com', medium: 'referral', sessions: 3 })
    }
  }

  const input: ReportInput = {
    now, requestedStart: start, requestedEnd: reqEnd, siteUrl: 'sc-domain:ecura.it', measurementId: 'G-5DY4TY34WK', ga4PropertyId: '000000000',
    ga4: {
      channelDimension: 'sessionDefaultChannelGroup', baseRows: base, smBase, queryEnd: lastDay,
      control: { sessions: tot, users: Math.round(tot * 0.8), newUsers: Math.round(tot * 0.75), bounceRate: 0.41, avgSessionDuration: 95, pageviews: Math.round(tot * 2.1) },
      smDetail: smBase.map(r => ({ source: r.source, medium: r.medium, users: Math.round(r.sessions * 0.8), bounceRate: 0.4 })),
      topPages: [{ page: '/', pageviews: 500, sessions: 400 }, { page: '/blog/', pageviews: 120, sessions: 90 }],
      devices: [{ device: 'mobile', sessions: Math.round(tot * 0.7) }, { device: 'desktop', sessions: tot - Math.round(tot * 0.7) - Math.round(tot * 0.04) }, { device: 'tablet', sessions: Math.round(tot * 0.04) }],
      countries: [{ country: 'Italy', sessions: Math.round(tot * 0.95) }, { country: 'Switzerland', sessions: Math.round(tot * 0.02) }],
      directLanding: [{ landing: '/', sessions: 300 }, { landing: '/?utm_source=newsletter', sessions: 20 }, { landing: '/?gclid=abc', sessions: 5 }],
      directBrowsers: [{ browser: 'Chrome', sessions: 250 }, { browser: 'Safari (in-app)', sessions: 40 }, { browser: 'Instagram In-App', sessions: 10 }],
      monthly: monthlyRows, monthlyRange: { start: monthStart, end: lastDay },
      meta: {
        control: { timeZone: 'Europe/Rome', range: `${start} → ${lastDay}`, subjectToThresholding: false, dataLossFromOtherRow: false },
        devices: { timeZone: 'Europe/Rome', range: `${start} → ${lastDay}`, subjectToThresholding: false, dataLossFromOtherRow: false },
      },
    },
    gsc: {
      totals: { clicks, impressions: impr, position: 14.2 }, daily: gscDaily,
      queries: [{ query: 'ecura teleassistenza', clicks: 60, impressions: 400, position: 2.1 }, { query: 'bracciale cadute anziani', clicks: 40, impressions: 3000, position: 9.3 }, { query: 'teleassistenza anziani', clicks: 25, impressions: 2500, position: 11.2 }],
      pages: [{ page: 'https://www.ecura.it/', clicks: 300, impressions: 5000, position: 8.1 }],
    },
    // 67 lead: CONTRACT_SENT 7 (3 caldo + 1 tiepido + 2 freddo + 1 n/a), 11 senza fonte
    crm: { rows: [
      { temperatura: 'caldo', status: 'CONTRACT_SENT', canale: 'ORGANICO', dettaglio: 'ecura_landing', count: 2 },
      { temperatura: 'caldo', status: 'CONTRACT_SENT', canale: 'DIRETTO', dettaglio: 'ecura_landing', count: 1 },
      { temperatura: 'tiepido', status: 'CONTRACT_SENT', canale: 'GOOGLE', dettaglio: 'google_organico', count: 1 },
      { temperatura: 'freddo', status: 'CONTRACT_SENT', canale: 'DIRETTO', dettaglio: '', count: 2 },
      { temperatura: 'n/a', status: 'CONTRACT_SENT', canale: '', dettaglio: '', count: 1 },
      { temperatura: 'caldo', status: 'BROCHURE_SENT', canale: 'ORGANICO', dettaglio: 'ecura_landing', count: 6 },
      { temperatura: 'tiepido', status: 'BROCHURE_SENT', canale: 'DIRETTO', dettaglio: 'ecura_landing', count: 5 },
      { temperatura: 'freddo', status: 'BROCHURE_SENT', canale: '', dettaglio: '', count: 4 },
      { temperatura: 'caldo', status: 'NEW', canale: 'GOOGLE', dettaglio: 'google_organico', count: 6 },
      { temperatura: 'caldo', status: 'NEW', canale: 'GOOGLE', dettaglio: '', count: 2 },
      { temperatura: 'caldo', status: 'NEW', canale: 'ORGANICO', dettaglio: 'ecura_landing', count: 2 },
      { temperatura: 'tiepido', status: 'NEW', canale: 'DIRETTO', dettaglio: 'ecura_landing', count: 3 },
      { temperatura: 'tiepido', status: 'NEW', canale: 'GOOGLE', dettaglio: 'google_ads', count: 6 },
      { temperatura: 'freddo', status: 'NEW', canale: 'ALTRO', dettaglio: '', count: 20 },
      { temperatura: 'n/a', status: 'NEW', canale: '', dettaglio: '', count: 6 },
    ] },
    geoActivation: { date: '2026-08-06', label: 'pubblicazione llms.txt (commit 19c1b6c)' },
    errors: [],
  }
  o.mutate?.(input)
  return input
}
