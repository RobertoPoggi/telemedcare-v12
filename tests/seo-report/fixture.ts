// Fixture SINTETICA e deterministica per i test del report (NON sono dati reali eCura).
// Struttura volutamente simile al caso reale: ~1.330 sessioni, 88 giorni, Direct alto, AI presente,
// 64 lead con CONTRACT_SENT = 7 (3 caldo + 1 tiepido + 2 freddo + 1 n/a).
import type { ReportInput, BaseRow } from '../../src/modules/seo-report-engine'

function rng(seed: number) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }
const addDays = (s: string, n: number) => { const d = new Date(s + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10) }

export interface FixtureOpts { now?: string; start?: string; req_end?: string; mutate?: (i: ReportInput) => void }
export function makeFixture(o: FixtureOpts = {}): ReportInput {
  const now = new Date(o.now || '2026-11-04T10:05:30Z')
  const start = o.start || '2026-08-09'
  const reqEnd = o.req_end || '2026-11-04'
  const R = rng(42)
  const ga4End = addDays(now.toISOString().slice(0, 10), -2)
  const gscEnd = addDays(now.toISOString().slice(0, 10), -3)
  const lastDay = reqEnd < ga4End ? reqEnd : ga4End
  const base: BaseRow[] = []
  const gscDaily: { date: string; clicks: number; impressions: number }[] = []
  // include anche giorni NON consolidati (oggi−1, oggi) per verificare che vengano scartati
  for (let d = start; d <= reqEnd; d = addDays(d, 1)) {
    const k = (Date.parse(d) - Date.parse(start)) / 864e5
    const growth = 0.7 + k / 120
    const partial = d > ga4End
    const f = partial ? 0.15 : 1
    const mk = (src: string, med: string, ch: string, mean: number) => {
      const n = Math.round(mean * growth * f * (0.6 + R() * 0.9))
      if (n > 0) base.push({ date: d, channelGrouping: ch, source: src, medium: med, sessions: n })
    }
    mk('google', 'organic', 'Organic Search', 6.2)
    mk('bing', 'organic', 'Organic Search', 0.25)
    mk('chatgpt.com', 'referral', 'Referral', 2.0)
    mk('perplexity.ai', 'referral', 'Referral', 0.7)
    mk('(direct)', '(none)', 'Direct', 4.4)
    mk('facebook.com', 'referral', 'Referral', 0.15)
    mk('l.instagram.com', 'referral', 'Referral', 0.2)
    if (d <= gscEnd) gscDaily.push({ date: d, clicks: Math.round(7.4 * growth * (0.5 + R())), impressions: Math.round(140 * growth * (0.7 + R() * 0.6)) })
  }
  const clicks = gscDaily.reduce((s, r) => s + r.clicks, 0), impr = gscDaily.reduce((s, r) => s + r.impressions, 0)
  const inWin = base.filter(r => r.date <= lastDay)
  const tot = inWin.reduce((s, r) => s + r.sessions, 0)
  const smMap = new Map<string, number>()
  for (const r of inWin) smMap.set(r.source + '|' + r.medium, (smMap.get(r.source + '|' + r.medium) || 0) + r.sessions)
  const monthlyRows: ReportInput['ga4']['monthly'] = []
  for (const r of base) if (r.date <= lastDay) monthlyRows.push({ month: r.date.slice(0, 7), source: r.source, medium: r.medium, sessions: r.sessions })
  const input: ReportInput = {
    now, requestedStart: start, requestedEnd: reqEnd, siteUrl: 'sc-domain:ecura.it', measurementId: 'G-5DY4TY34WK', ga4PropertyId: '000000000',
    ga4: {
      channelDimension: 'sessionDefaultChannelGroup', baseRows: base,
      control: { sessions: tot, users: Math.round(tot * 0.8), newUsers: Math.round(tot * 0.75), bounceRate: 0.41, avgSessionDuration: 95, pageviews: Math.round(tot * 2.1) },
      smDetail: [...smMap.entries()].map(([k, v]) => { const [s, m] = k.split('|'); return { source: s, medium: m, users: Math.round(v * 0.8), bounceRate: 0.4 } }),
      topPages: [{ page: '/', pageviews: 500, sessions: 400 }, { page: '/blog/', pageviews: 120, sessions: 90 }],
      devices: [{ device: 'mobile', sessions: Math.round(tot * 0.7) }, { device: 'desktop', sessions: tot - Math.round(tot * 0.7) - Math.round(tot * 0.04) }, { device: 'tablet', sessions: Math.round(tot * 0.04) }],
      countries: [{ country: 'Italy', sessions: Math.round(tot * 0.95) }, { country: 'Switzerland', sessions: Math.round(tot * 0.02) }],
      directLanding: [{ landing: '/', sessions: 300 }, { landing: '/?utm_source=newsletter', sessions: 20 }, { landing: '/?gclid=abc', sessions: 5 }],
      directBrowsers: [{ browser: 'Chrome', sessions: 250 }, { browser: 'Safari (in-app)', sessions: 40 }, { browser: 'Instagram In-App', sessions: 10 }],
      monthly: monthlyRows,
    },
    gsc: {
      totals: { clicks, impressions: impr, position: 14.2 }, daily: gscDaily,
      queries: [{ query: 'ecura teleassistenza', clicks: 60, impressions: 400, position: 2.1 }, { query: 'bracciale cadute anziani', clicks: 40, impressions: 3000, position: 9.3 }, { query: 'teleassistenza anziani', clicks: 25, impressions: 2500, position: 11.2 }],
      pages: [{ page: 'https://www.ecura.it/', clicks: 300, impressions: 5000, position: 8.1 }],
    },
    crm: { rows: [
      { temperatura: 'caldo', status: 'CONTRACT_SENT', canale: 'ORGANICO', dettaglio: 'ecura_landing', count: 2 },
      { temperatura: 'caldo', status: 'CONTRACT_SENT', canale: 'DIRETTO', dettaglio: 'ecura_landing', count: 1 },
      { temperatura: 'tiepido', status: 'CONTRACT_SENT', canale: 'GOOGLE', dettaglio: 'ecura_landing', count: 1 },
      { temperatura: 'freddo', status: 'CONTRACT_SENT', canale: 'DIRETTO', dettaglio: '', count: 2 },
      { temperatura: 'n/a', status: 'CONTRACT_SENT', canale: '', dettaglio: '', count: 1 },
      { temperatura: 'caldo', status: 'BROCHURE_SENT', canale: 'ORGANICO', dettaglio: 'ecura_landing', count: 6 },
      { temperatura: 'tiepido', status: 'BROCHURE_SENT', canale: 'DIRETTO', dettaglio: 'ecura_landing', count: 5 },
      { temperatura: 'freddo', status: 'BROCHURE_SENT', canale: '', dettaglio: '', count: 4 },
      { temperatura: 'caldo', status: 'NEW', canale: 'ORGANICO', dettaglio: 'ecura_landing', count: 8 },
      { temperatura: 'tiepido', status: 'NEW', canale: 'DIRETTO', dettaglio: 'ecura_landing', count: 10 },
      { temperatura: 'freddo', status: 'NEW', canale: 'ALTRO', dettaglio: '', count: 12 },
      { temperatura: 'n/a', status: 'NEW', canale: '', dettaglio: '', count: 12 },
    ] },
    geoActivation: { date: '2026-08-06', label: 'pubblicazione llms.txt (commit 19c1b6c)' },
    errors: [],
  }
  o.mutate?.(input)
  return input
}
