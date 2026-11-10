// ============================================================
// seo-report-render.ts — rendering HTML (A4) del "Report Analytics Live — eCura".
// Funzione pura: (ReportInput) → { html, model, checks }. Lancia ReportAssertionError se falliscono
// gli assert hard (quadrature H1/H2, giorni non consolidati H3, coerenza percentuali H6).
// ============================================================
import {
  buildModel, runChecks, checkPercentages, blockingErrors, anomalies, ReportAssertionError, PctRegistry, PARAMS,
  esc, fmtInt, fmtDec, fmtDay, fmtDayY, formatDuration, CHART_CHANNELS, TEMP_ORDER,
  crmDenominator, gaChanSessions, GA_CHAN_LABEL, CRM_UNSET, CRM_AI_NOT_EMITTED, trendVerdict,
  type ReportInput, type Model, type Check, type Level, type SmRow, type WeekRow,
} from './seo-report-engine'
import { REPORT_CSS } from './seo-report-css'

const J = (x: any) => JSON.stringify(x).replace(/</g, '\\u003c')
const CH_COLOR: Record<string, string> = { 'Google organic': '#4285F4', AI: '#7C3AED', Direct: '#068D86', Paid: '#F59E0B', Altro: '#9CA3AF' }
const CAT_COLOR: Record<string, string> = { SEO: '#4285F4', AI: '#7C3AED', Direct: '#068D86', Paid: '#F59E0B', Social: '#EC4899', Email: '#10B981', Other: '#9CA3AF' }
const CAT_BG: Record<string, string> = { SEO: '#dbeafe', AI: '#ede9fe', Direct: '#ccfbf1', Paid: '#fef3c7', Social: '#fce7f3', Email: '#d1fae5', Other: '#f3f4f6' }
const ICON: Record<string, string> = { caldo: '🔥', tiepido: '🌡️', freddo: '🧊', 'n/a': '❓' }
const PLACE_BANNER = '<!--@@BANNER@@-->'
const PLACE_PCT = '<!--@@PCTROW@@-->'
// Geometria dei grafici e delle colonne: costanti nominate (nessun numero con % scritto nel testo del report)
const DONUT_CUTOUT = { device: 55, macro: 52, crm: 55 }
const QA_COL = { label: 34, status: 14 }

export interface GenerateOptions { diagnostic?: boolean }

const ATTRIBUTION_CHECKS = ['ratiomax', 'ratio']   // anomalie di attribuzione GA4 (non un calo di traffico)
/** Avviso di finestra ridotta: se i giorni esclusi (lag + consolidamento) superano la soglia. */
export const reducedWindowNote = (excludedDays: number): string => excludedDays > PARAMS.reducedWindowDays ? `finestra ridotta: i dati degli ultimi ${excludedDays} giorni non sono consolidati` : ''
/** Banner in testa: massimo UNA frase. Nessun errore e nessuna anomalia = nessun banner. */
/** F1/F3: sezioni non raccolte per errore delle API. «Dati parziali: N sezioni non disponibili per quota GA4». Null se tutte le query sono andate a buon fine. */
const KIND_CAUSE: Record<string, string> = { quota: 'quota', auth: 'credenziali Google', invalid: 'query non valida', server: 'errore temporaneo', other: 'errore' }
export function partialNote(st: ReportInput['queryStats']): { text: string; sections: string[]; line: string } | null {
  if (!st || st.failed === 0) return null
  const sections = st.failures.map(f => f.label.replace(/^(GA4|GSC) /, f.api === 'GSC' ? 'Search Console: ' : ''))
  const causes = [...new Set(st.failures.map(f => f.kind === 'quota' ? `quota ${f.api === 'GSC' ? 'Search Console' : f.api}` : f.api === 'CRM' ? 'CRM non disponibile' : KIND_CAUSE[f.kind] || 'errore'))]
  const why = causes.length ? ` per ${causes.join(' e ')}` : ''
  const msgs = [...new Set(st.failures.map(f => f.message))].slice(0, 3)
  return {
    text: `Dati parziali: ${st.failed} ${st.failed === 1 ? 'sezione non disponibile' : 'sezioni non disponibili'}${why}`,
    sections,
    // una riga, mai il body di Google: «N query fallite su M totali»
    line: `${st.failed} query fallite su ${st.total} totali · non disponibili: ${sections.join(', ')} · ${msgs.join(' · ')}`,
  }
}
export function reportBanner(m: Model, errs: Check[], anoms: Check[]): string {
  const oneLine = (t: string) => t.replace(/\s+/g, ' ').replace(/[.;:\s]+$/, '')
  if (errs.length) {
    const first = errs[0]
    return `<div class="banner banner-err">🔴 Report non generato: ${esc(oneLine(`${first.label} — ${first.value}`).slice(0, 220))}${errs.length > 1 ? esc(` (+${errs.length - 1} altri controlli bloccanti)`) : ''}.</div>`
  }
  const reduced = reducedWindowNote(m.excl.total)
  const attr = anoms.filter(a => ATTRIBUTION_CHECKS.includes(a.id)), other = anoms.filter(a => !ATTRIBUTION_CHECKS.includes(a.id))
  const partial = partialNote(m.input.queryStats)
  if (!anoms.length && !reduced && !partial) return ''
  const parts: string[] = []
  const wk = m.ratio.anomalous === 1 ? `1 settimana su ${m.ratio.fullCount} ha` : `${m.ratio.anomalous} settimane su ${m.ratio.fullCount} hanno`
  const tol = other.length === 1 ? 'un controllo è fuori tolleranza' : `${other.length} controlli sono fuori tolleranza`
  // Regola F: se una sezione manca per un errore, NESSUNA frase del documento dice che i dati sono completi o verificati.
  if (partial) {
    parts.push(partial.text)
    if (attr.length) parts.push(`${wk} un'anomalia di attribuzione GA4 (non un calo di traffico)`)
    if (other.length) parts.push(tol)
    if (anoms.length) parts.push('dettaglio in appendice')
  }
  else if (attr.length && !other.length) parts.push(`Dati completi e quadrature verificate. ${wk} un'anomalia di attribuzione GA4 (non un calo di traffico): dettaglio in appendice`)
  else if (attr.length) parts.push(`Quadrature principali verificate. ${wk} un'anomalia di attribuzione GA4 (non un calo di traffico) e ${tol}: dettaglio in appendice`)
  else if (other.length) parts.push(`Quadrature principali verificate; ${tol}: dettaglio in appendice`)
  else parts.push('Dati e quadrature verificati')
  if (reduced) parts.push(reduced)
  return `<div class="banner banner-anom">🟠 ${esc(parts.join('; '))}.</div>`
}
export interface GenerateResult { html: string; model: Model; checks: Check[]; pct: ReturnType<typeof checkPercentages>; hardFailed: boolean; errors: Check[]; anomalies: Check[] }

/** Livelli: 🔴 errore bloccante (il report NON si genera), 🟠 anomalia (banner arancione + elenco), 🟡 avviso di metodo (solo riga in tabella). */
export function generateReport(input: ReportInput, opts: GenerateOptions = {}): GenerateResult {
  const m = buildModel(input)
  const R = new PctRegistry()
  const checks = runChecks(m, R)
  const html0 = renderHtml(m, checks, R)
  const pct = checkPercentages(html0, R)
  const pctErr: Check[] = pct.ok ? [] : [{ id: 'H6', label: 'Coerenza percentuali testo vs tabelle', level: 'error', value: pct.problems.join('; ') }]
  const errs = [...blockingErrors(checks), ...pctErr]
  const hardFailed = errs.length > 0
  if (hardFailed && !opts.diagnostic) throw new ReportAssertionError(errs)
  const anoms = anomalies(checks)
  // Un solo banner, una sola frase, in linguaggio di business. L'elenco puntuale sta nell'appendice «Qualità del dato».
  const bannerHtml = reportBanner(m, errs, anoms)
  const pctText = pct.ok
    ? `<span class="qa-ok">✓ OK</span></td><td>${pct.total} percentuali registrate; ${pct.textClaims} citate nel testo, ciascuna con calcolo gemello in tabella (stessi due numeri, stesso decimale)`
    : `${statusCell('error')}</td><td>${esc(pct.problems.join(' · '))}`
  const html = html0.replace(PLACE_BANNER, bannerHtml).replace(PLACE_PCT, `<tr><td>Coerenza percentuali testo vs tabelle</td><td>${pctText}</td></tr>`)
  return { html, model: m, checks, pct, hardFailed, errors: errs, anomalies: anoms }
}

/** Intestazione: periodo effettivo, giorni esclusi e causa di ciascuna esclusione, in una riga sola. */
export function periodLine(m: Model): string {
  const e = m.excl
  const causes = [e.lag ? `${e.lag} per lag GA4` : '', e.consolidation ? `${e.consolidation} perché l'organico non è ancora consolidato` : ''].filter(Boolean).join(', ')
  return `Periodo ${fmtDay(m.win.start)} → ${fmtDay(m.win.aggEnd)} (${m.periodDaysGa4} giorni). ${e.total ? `Esclusi ${e.total} giorni: ${causes}.` : 'Nessun giorno escluso.'}`
}

/** Caption delle date: generato SEMPRE dalle stesse variabili di data usate per costruire i grafici (mai scritto a mano). */
export const dateCaption = (m: Model): string => `GA4: ${fmtDayY(m.win.aggEnd)} · GSC: ${m.gsc ? fmtDayY(m.win.gscEnd) : 'n.d.'} · periodo comune: ${fmtDayY(m.win.commonEnd)}`

// ── helpers di layout ───────────────────────────────────────────────────────
const rng = (src: string, start: string, end: string, days: number, extra = '') =>
  `<div class="rng">Fonte: ${esc(src)} · intervallo effettivo ${start} → ${end} (${days} giorni)${extra ? ' · ' + extra : ''}</div>`
/** Testo da fonte esterna → una riga senza markup, max 200 caratteri (difesa in profondità: gli errori arrivano già ripuliti). */
const oneLineText = (t: string) => String(t ?? '').replace(/<[^>]*(>|$)/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200)
const na = (what: string) => `<p style="color:#6b7280;font-size:.88rem">dato non disponibile — ${esc(what)}</p>`
const kpi = (color: string, num: string, lbl: string, sub = '', numStyle = '') =>
  `<div class="kpi" style="border-top-color:${color}"><span class="num" style="${numStyle}">${num}</span><div class="lbl">${lbl}</div>${sub ? `<div class="sub">${sub}</div>` : ''}</div>`
const statusCell = (l: Level) => l === 'ok' ? '<span class="qa-ok">✓ OK</span>' : l === 'notice' ? '<span class="qa-notice">🟡 Avviso di metodo</span>' : l === 'anomaly' ? '<span class="qa-warn">🟠 Anomalia</span>' : '<span class="qa-fail">🔴 Errore bloccante</span>'
const yTitle = (t: string) => `title:{display:true,text:${J(t)},font:{size:10}}`

function renderHtml(m: Model, checks: Check[], R: PctRegistry): string {
  const i = m.input
  const w = m.win
  const generatedAt = new Intl.DateTimeFormat('it-IT', { timeZone: 'Europe/Rome', dateStyle: 'short', timeStyle: 'medium' }).format(i.now).replace(',', '')
  const gaRange = `${w.start} → ${w.aggEnd}`
  const gscRange = m.gsc ? `${w.start} → ${w.gscEnd}` : 'n.d.'
  // Una riga sola, sintetica: mai il body di Google (può essere una pagina HTML), mai un elenco di URL.
  const pn = partialNote(i.queryStats)
  const errLine = pn ? pn.line : i.errors.map(e => oneLineText(e)).join(' | ')
  const errorsBlock = i.errors.length
    ? `<div style="background:#fff3cd;border:1px solid #ffc107;border-radius:8px;padding:12px 16px;margin-bottom:24px;font-size:.85rem">⚠️ <strong>Avvisi:</strong> ${esc(errLine)}</div>` : ''
  const tailTxt = m.cons.tailDays ? `, più ${m.cons.tailDays} giorni in consolidamento (organico incompleto)` : ''
  const lagNote = `Giorni non consolidati esclusi: GA4 fino al ${fmtDayY(w.aggEnd)} (lag ${PARAMS.ga4LagDays} giorni${tailTxt}), GSC fino al ${fmtDayY(w.gscEnd)} (lag ${PARAMS.gscLagDays} giorni).`

  if (!m.ok) {
    return `<!doctype html><html lang="it"><head><meta charset="utf-8"><title>Report Analytics Live — eCura</title><style>${REPORT_CSS}</style></head><body>${PLACE_BANNER}
<div class="container"><div class="section"><h2>Report Analytics Live — eCura</h2>${errorsBlock}<p>dato non disponibile — la query base GA4 non ha restituito dati per ${esc(gaRange)}.</p>
<table><tbody>${checks.map(c => `<tr><td>${esc(c.label)}</td><td>${statusCell(c.level)}</td><td>${esc(c.value)}</td></tr>`).join('')}${PLACE_PCT}</tbody></table></div></div></body></html>`
  }

  const total = m.total
  const sessPct = (n: number, kind: 'table' | 'text' = 'table') => R.P(n, total, 1, kind)
  const ctl = i.ga4.control
  const leadsTotal = m.crm ? m.crm.total : null
  const mobile = (i.ga4.devices || []).find(d => d.device === 'mobile')?.sessions ?? null

  // ── 1. KPI ──
  const kpiHtml = `
<div class="kpi-grid">
  ${kpi('#4285F4', fmtInt(total), 'Sessioni totali', `sessioni GA4 · ${m.periodDaysGa4} giorni · query senza dimensioni`)}
  ${ctl ? kpi('#34A853', fmtInt(ctl.users), 'Utenti attivi', 'utenti (non additivi tra canali)') : kpi('#34A853', 'n.d.', 'Utenti attivi', 'dato non disponibile')}
  ${ctl ? kpi('#00BCD4', fmtInt(ctl.newUsers), 'Nuovi utenti', 'utenti') : kpi('#00BCD4', 'n.d.', 'Nuovi utenti', 'dato non disponibile')}
  ${ctl ? kpi('#9C27B0', fmtInt(ctl.pageviews), 'Pageviews', 'visualizzazioni di pagina') : kpi('#9C27B0', 'n.d.', 'Pageviews', 'dato non disponibile')}
  ${ctl ? kpi('#EA4335', R.R(ctl.bounceRate, 1, 'kpi'), 'Bounce rate', 'quota di sessioni non coinvolte') : kpi('#EA4335', 'n.d.', 'Bounce rate', 'dato non disponibile')}
  ${ctl ? kpi('#FF9800', formatDuration(ctl.avgSessionDuration), 'Durata media', 'min:sec per sessione') : kpi('#FF9800', 'n.d.', 'Durata media', 'dato non disponibile')}
  ${kpi('#059669', leadsTotal == null ? 'n.d.' : fmtInt(leadsTotal), 'Lead CRM <span class="tag tag-crm">D1</span>', leadsTotal == null ? 'dato non disponibile' : 'lead nel periodo')}
</div>`

  // ── trend: verdetto SOLO sulla MA28 (giorni consolidati); la MA7 e' un indicatore di breve, senza giudizio ──
  const trendRows = m.trend.map(t => {
    const v = trendVerdict(t.ma28.cur, t.ma28.prev)
    const ma7 = t.ma7.cur != null && t.ma7.prev != null && t.ma7.prev > 0
      ? `${fmtDec(t.ma7.cur, 1)} vs ${fmtDec(t.ma7.prev, 1)} ${esc(t.unit)} · ${R.PS(t.ma7.cur - t.ma7.prev, t.ma7.prev, 1)}`
      : 'n.d.'
    if (!v) return `<tr><td>${esc(t.label)}</td><td colspan="4">trend strutturale: dato non disponibile (servono ${PARAMS.maLong * 2} giorni consolidati)</td><td style="text-align:center">${ma7}</td></tr>`
    return `<tr><td>${esc(t.label)}</td><td style="text-align:center">${fmtDec(t.ma28.cur as number, 1)} ${esc(t.unit)}<br><span style="font-size:.72rem;color:#6b7280">MA${PARAMS.maLong} al ${fmtDay(t.endDate)}</span></td>
      <td style="text-align:center">${fmtDec(t.ma28.prev as number, 1)} ${esc(t.unit)}<br><span style="font-size:.72rem;color:#6b7280">MA${PARAMS.maLong} al ${fmtDay(t.prev28Date)}</span></td>
      <td style="text-align:center;font-weight:700">${R.PS((t.ma28.cur as number) - (t.ma28.prev as number), t.ma28.prev as number, 1)}</td><td style="font-weight:700">${v.verdict}</td>
      <td style="text-align:center;font-size:.8rem;color:#6b7280">${ma7}<br><span style="font-size:.7rem">indicatore di breve, nessun giudizio</span></td></tr>`
  }).join('')
  const sanity = m.trendSanity
  const sanityNote = sanity && sanity.flagged
    ? `<div class="note-box"><strong>Sanità del trend:</strong> GA4 e GSC descrivono andamenti diversi (organico GA4 ${R.PS(m.trend[1].ma28.cur! - m.trend[1].ma28.prev!, m.trend[1].ma28.prev!, 1, 'text')} vs click GSC ${R.PS(m.trend[2].ma28.cur! - m.trend[2].ma28.prev!, m.trend[2].ma28.prev!, 1, 'text')}, MA${PARAMS.maLong}). La causa più probabile è l’attribuzione GA4, non il traffico: il click GSC è la misura di riferimento.</div>` : ''
  const consNote = m.cons.tailDays
    ? `<div class="note-box"><strong>Ultimi ${m.cons.tailDays} giorni in consolidamento</strong> (${fmtDay(m.cons.tailDates[0])} → ${fmtDay(m.cons.tailDates[m.cons.tailDates.length - 1])}): organico GA4 pari a ${R.P(m.cons.tailMean as number, m.cons.refMean as number, 1, 'text')} della media dei ${m.cons.refDays} giorni precedenti; ${m.cons.weakDays} giorni su ${PARAMS.consolidationTailDays} sotto la soglia di ${R.PM(PARAMS.consolidationMinShare * 100, 0)} (ne servono almeno ${PARAMS.consolidationMinDays}). Esclusi da aggregati, trend e rapporto settimanale; nei grafici sono tratteggiati.</div>` : ''
  const trendBox = `
<h3>Lettura del trend — media mobile a ${PARAMS.maLong} giorni (strutturale) e a ${PARAMS.maShort} giorni (breve)</h3>
<table><thead><tr><th>Serie</th><th style="text-align:center">MA${PARAMS.maLong} ultimo giorno consolidato</th><th style="text-align:center">MA${PARAMS.maLong} ${PARAMS.maLong} giorni prima</th><th style="text-align:center">Variazione</th><th>Verdetto (solo MA${PARAMS.maLong})</th><th style="text-align:center">Indicatore di breve MA${PARAMS.maShort}</th></tr></thead><tbody>${trendRows}</tbody></table>
${consNote}${sanityNote}
<div class="cap">Il verdetto si basa solo sulla MA${PARAMS.maLong}: media dei ${PARAMS.maLong} giorni terminanti nell’ultimo giorno consolidato, confrontata con la MA${PARAMS.maLong} di ${PARAMS.maLong} giorni prima (i giorni in consolidamento sono esclusi). «In aumento»/«in calo» oltre ±${R.PM(PARAMS.trendBand * 100, 0)} di variazione, altrimenti «stabile» — convenzione di lettura, non un test statistico. La MA${PARAMS.maShort} resta visibile come indicatore di breve ma non produce giudizio.</div>`

  // ── grafico 1: canali impilati + settimanale ──
  const fullWeeks = m.weeks
  const weekLabels = fullWeeks.map(x => `${fmtDay(x.weekStart)}${x.days < 7 ? ' (parz.)' : ''}`)
  const weekPartial = fullWeeks.map(x => x.days < 7)

  // ── 2. macro canali ──
  const macroDefs: [string, string, number, string][] = [
    ['#4285F4', '🔍 SEO totale (organico)', m.macro.SEO, 'SEO'], ['#7C3AED', '🤖 AI / GEO totale', m.macro.AI, 'AI'],
    ['#068D86', '🎯 Direct', m.macro.Direct, 'Direct'], ['#F59E0B', '💰 ADS (Paid)', m.macro.Paid, 'Paid'],
    ['#EC4899', '📱 Social', m.macro.Social, 'Social'], ['#9CA3AF', '📦 Altro', m.macro.Altro, 'Altro'],
  ]
  const macroCards = macroDefs.map(([c, l, n]) => `<div class="kpi" style="border-top-color:${c}"><span class="num" style="color:${c};font-size:1.5rem">${fmtInt(n)}</span><div class="lbl">${l}</div><div class="sub">sessioni · ${R.P(n, total, 1, 'kpi')} delle sessioni</div></div>`).join('')
  const donutLabels = macroDefs.map(([, l, n]) => `${l.replace(/^\S+\s/, '')} (${fmtInt(n)} sessioni · ${R.P(n, total, 1)})`)
  const natLabels = m.nativeChannels.map(([c, n]) => `${c} (${fmtInt(n)} sessioni)`)

  // Direct (D12)
  const dShare = total > 0 ? m.macro.Direct / total : 0
  const directAlert = dShare > PARAMS.directAlert
  let directBox = ''
  if (m.macro.Direct > 0) {
    const d = m.direct
    const rows = d ? `
      <tr><td>Sessioni Direct (totale)</td><td style="text-align:center">${fmtInt(m.macro.Direct)} sessioni</td><td style="text-align:center">${R.P(m.macro.Direct, total, 1)} delle sessioni totali</td></tr>
      <tr><td>Direct con landing page che contiene parametri UTM / click-ID</td><td style="text-align:center">${fmtInt(d.withParams)} sessioni</td><td style="text-align:center">${R.P(d.withParams, d.total, 1)} del Direct</td></tr>
      <tr><td>Direct da browser in-app (Instagram, Facebook, LinkedIn, ecc.)</td><td style="text-align:center">${d.inAppEvidence ? fmtInt(d.inApp) + ' sessioni' : 'dato non disponibile'}</td><td style="text-align:center">${d.inAppEvidence ? R.P(d.inApp, d.total, 1) + ' del Direct' : '–'}</td></tr>`
      : `<tr><td colspan="3">dato non disponibile — dettaglio landing/browser del Direct non recuperato</td></tr>`
    directBox = `
<div class="note-box">
  <strong>Direct: ${directAlert ? `⚠️ quota ${R.P(m.macro.Direct, total, 1, 'text')} oltre la soglia di allerta del ${R.PM(PARAMS.directAlert * 100, 0)} — possibile sotto-attribuzione.` : `quota ${R.P(m.macro.Direct, total, 1, 'text')} delle sessioni, entro la soglia di allerta del ${R.PM(PARAMS.directAlert * 100, 0)}.`}</strong>
  Il Direct non è una prova di «brand recall»: GA4 lo usa anche quando il referrer non è disponibile (app, PDF, email, browser in-app, alcuni assistenti AI). Va letto come limite di attribuzione, non come segnale positivo.
  <table style="margin-top:8px"><thead><tr><th>Evidenza</th><th style="text-align:center">Sessioni</th><th style="text-align:center">Quota</th></tr></thead><tbody>${rows}</tbody></table>
</div>`
  }

  // ── 3. SEO ──
  const engineRows = m.seoEngines.map(([label, sess], idx) => {
    const users = m.smTable.filter(r => r.category === 'SEO' && r.label === label).reduce((s, r) => s + (r.users ?? 0), 0)
    const hasU = m.smTable.some(r => r.category === 'SEO' && r.label === label && r.users != null)
    return `<tr><td style="color:#999;font-size:.8rem">${idx + 1}</td><td><strong>${esc(label)}</strong></td><td style="text-align:center;font-weight:700;color:#1d4ed8">${fmtInt(sess)}</td><td style="text-align:center">${R.P(sess, total, 1)}</td><td style="text-align:center">${hasU ? fmtInt(users) : 'n.d.'}</td></tr>`
  }).join('')
  const seoTable = m.seoEngines.length ? `
<div class="charts-grid">
  <div class="chart-box"><h3>Sessioni per motore di ricerca</h3><canvas id="seoEnginesChart" height="220"></canvas></div>
  <div class="chart-box" style="overflow:auto"><h3>Dettaglio motori — sessioni</h3>
    <table><thead><tr><th>#</th><th>Motore</th><th style="text-align:center">Sessioni</th><th style="text-align:center">Quota sessioni</th><th style="text-align:center">Utenti</th></tr></thead><tbody>${engineRows}
    <tr style="background:#dbeafe;font-weight:700"><td colspan="2">TOTALE SEO Organic</td><td style="text-align:center;color:#1d4ed8">${fmtInt(m.macro.SEO)}</td><td style="text-align:center">${R.P(m.macro.SEO, total, 1)}</td><td></td></tr></tbody></table>
  </div>
</div>` : '<p style="color:#888">Nessuna sessione organica nel periodo.</p>'

  // GSC
  let gscBlock = ''
  if (m.gsc) {
    const g = m.gsc
    const top = i.gsc!.queries.slice(0, PARAMS.topQueries)
    const topC = top.reduce((s, q) => s + q.clicks, 0), topI = top.reduce((s, q) => s + q.impressions, 0)
    const brandRe = /e[\s-]?cura/i
    const brandC = top.filter(q => brandRe.test(q.query)).reduce((s, q) => s + q.clicks, 0)
    const brandN = top.filter(q => brandRe.test(q.query)).length
    const qRows = top.map(q => `<tr><td>${esc(q.query)}${brandRe.test(q.query) ? ' <span class="tag tag-gsc">marca</span>' : ''}</td><td style="text-align:center">${fmtInt(q.clicks)}</td><td style="text-align:center">${fmtInt(q.impressions)}</td><td style="text-align:center">${fmtDec(q.position, 1)}</td></tr>`).join('')
    const pRows = i.gsc!.pages.slice(0, PARAMS.topPages).map(p => `<tr><td style="font-size:.82rem">${esc(p.page)}</td><td style="text-align:center">${fmtInt(p.clicks)}</td><td style="text-align:center">${fmtInt(p.impressions)}</td><td style="text-align:center">${fmtDec(p.position, 1)}</td></tr>`).join('')
    gscBlock = `
<h3>🔎 Google Search Console <span class="tag tag-gsc">GSC</span></h3>
${rng(`Search Console · ${i.siteUrl} · tipo web · dataState final`, w.start, w.gscEnd, m.periodDaysGsc, 'date nel fuso orario di Search Console')}
<div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
  ${kpi('#1d4ed8', fmtInt(g.clicks), 'Click organici (click)', `${fmtInt(g.clicks)} click su ${m.periodDaysGsc} giorni = ${fmtDec(g.clicksPerDay, 1)} click/giorno`, 'color:#1d4ed8')}
  ${kpi('#0891b2', fmtInt(g.impressions), 'Impressioni SERP (impressioni)', 'volte in cui il sito è apparso nei risultati', 'color:#0891b2')}
  ${kpi('#059669', R.P(g.clicks, g.impressions, 1, 'kpi'), 'CTR (click / impressioni)', `${fmtInt(g.clicks)} click / ${fmtInt(g.impressions)} impressioni`, 'color:#059669')}
  ${kpi('#d97706', fmtDec(g.position, 1), 'Posizione media', 'posizione media nei risultati', 'color:#d97706')}
</div>
<div class="charts-grid">
  <div class="chart-box" style="overflow:auto"><h3>Top ${PARAMS.topQueries} query per click</h3>
    <table><thead><tr><th>Query di ricerca</th><th style="text-align:center">Click</th><th style="text-align:center">Impressioni</th><th style="text-align:center">Posizione</th></tr></thead><tbody>${qRows || '<tr><td colspan="4">dato non disponibile</td></tr>'}
    ${top.length ? `<tr style="background:#fef3c7;font-weight:700"><td>CTR medio delle top ${top.length} query (Σ click / Σ impressioni)</td><td style="text-align:center">${fmtInt(topC)}</td><td style="text-align:center">${fmtInt(topI)}</td><td style="text-align:center">${R.P(topC, topI, 1)}</td></tr>
    <tr><td>di cui query di marca (${brandN} query): quota dei click delle top ${top.length}</td><td style="text-align:center">${fmtInt(brandC)}</td><td style="text-align:center">–</td><td style="text-align:center">${R.P(brandC, topC, 1)}</td></tr>` : ''}</tbody></table>
    <div class="cap">Il CTR di sito è uno solo (sopra): click / impressioni sull'intero periodo (vedi definizione di CTR in appendice). Il CTR delle top ${top.length} query è un'altra grandezza, calcolata esplicitamente sulla riga di totale. Le query di marca (contengono «ecura» / «e cura») sono mostrate, non rimosse.</div>
  </div>
  <div class="chart-box" style="overflow:auto"><h3>Top pagine per click organici</h3>
    <table><thead><tr><th>Pagina</th><th style="text-align:center">Click</th><th style="text-align:center">Impr.</th><th style="text-align:center">Pos.</th></tr></thead><tbody>${pRows || '<tr><td colspan="4">dato non disponibile</td></tr>'}</tbody></table>
  </div>
</div>`
  } else {
    gscBlock = `<h3>🔎 Google Search Console <span class="tag tag-gsc">GSC</span></h3>${na('Search Console non configurata o non raggiungibile (vedi Avvisi)')}`
  }

  // Box GA4 vs GSC + rapporto settimanale: l'allarme segnala ROTTURE, non livelli
  let ratioBlock = ''
  if (m.gsc) {
    const rt = m.ratio
    const stateLabel = (x: WeekRow) => x.state === 'partial' ? 'parziale — esclusa' : x.state === 'unreliable' ? 'dato GA4 non affidabile — conta nel rapporto, esclusa dalle rotture' : x.state === 'break' ? 'rottura (ribasso)' : 'regolare'
    const stateCol = (x: WeekRow) => x.state === 'partial' ? '#6b7280' : x.state === 'ok' ? '#166534' : '#b91c1c'
    const wr = m.weeks.map(x => `<tr><td>${fmtDay(x.weekStart)} → ${fmtDay(x.weekEnd)}</td><td style="text-align:center">${x.days}${x.days < PARAMS.weekDays ? ` / ${PARAMS.weekDays}` : ''}</td><td style="text-align:center">${fmtInt(x.ga4Org)}</td><td style="text-align:center">${x.gscClicks == null ? 'n.d.' : fmtInt(x.gscClicks)}</td><td style="text-align:center;font-weight:700">${x.ratio == null ? '–' : R.P(x.ga4Org, x.gscClicks as number, 1)}</td><td style="color:${stateCol(x)}">${stateLabel(x)}</td></tr>`).join('')
    const summary = rt.fullCount
      ? `<tr style="background:#eff6ff;font-weight:700"><td>Periodo: tutte le settimane complete (${rt.fullCount})</td><td></td><td style="text-align:center">${fmtInt(rt.sumGa)}</td><td style="text-align:center">${fmtInt(rt.sumGsc)}</td><td style="text-align:center">${R.P(rt.sumGa, rt.sumGsc, 1)}</td><td>${rt.fullCount} settimane complete, di cui ${rt.anomalous} con attribuzione GA4 anomala · mediana ${rt.median == null ? 'n.d.' : R.P(rt.median, 1, 1)} · settimane distanti dalla mediana oltre ${R.PM(PARAMS.ratioBreak * 100, 0)}: ${rt.deviating}</td></tr>`
      : `<tr><td colspan="6">nessuna settimana completa nel periodo</td></tr>`
    ratioBlock = `
<h3>Organico: sessioni GA4 vs click Search Console — rapporto settimanale</h3>
${rng('GA4 (sessioni con source google e medium organic) e Search Console (click)', w.start, w.commonEnd, m.common.days, 'periodo comune ai due strumenti, solo giorni consolidati')}
<table><thead><tr><th>Settimana (lun–dom)</th><th style="text-align:center">Giorni coperti</th><th style="text-align:center">Sessioni GA4 google / organic (sessioni)</th><th style="text-align:center">Click GSC (click)</th><th style="text-align:center">Rapporto sessioni / click</th><th>Lettura</th></tr></thead><tbody>${wr}
${summary}</tbody></table>
<div class="info-box"><strong>Perché GA4 e Search Console non coincidono — e perché il rapporto può superare il ${R.PM(PARAMS.per, 0)}.</strong> I due strumenti misurano eventi diversi: un click in SERP non è una sessione GA4. Lo scarto atteso (sessioni inferiori ai click) deriva da: (1) click che non producono un pageview perché JavaScript è disattivato o il tag non fa in tempo a partire; (2) consenso cookie / Consent Mode: senza consenso GA4 non registra la sessione, e la quota di consenso cambia nel tempo; (3) script blocker e browser con protezione dal tracciamento; (4) abbandono prima del caricamento della pagina; (5) lag di consolidamento e fusi orari diversi dei due strumenti.
  <br>Un rapporto <strong>superiore al ${R.PM(PARAMS.per, 0)}</strong> (sessioni GA4 più numerose dei click) non è un traffico in più: nasce da (a) fusi orari e confini di giornata diversi tra GA4 e Search Console; (b) più sessioni GA4 generate dallo stesso click (ritorni alla pagina, riapertura da cronologia, scadenza della sessione dopo inattività); (c) sessioni con source «google» e medium «organic» assegnate per override manuale o per parametri UTM scritti a mano, non per ricerca reale; (d) modellazione dei dati con Consent Mode, che stima le sessioni senza consenso. Per questo ogni settimana con sessioni GA4 oltre ${fmtDec(PARAMS.ratioMax, 2)} volte i click è marcata «dato GA4 non affidabile» ed <strong>esclusa</strong> dal rapporto medio; il fattore ${fmtDec(PARAMS.ratioMax, 2)} copre solo il fuso orario.
  <br><strong>Come si usa il rapporto:</strong> il suo livello dipende dalla quota di consenso cookie, quindi non esiste una fascia «giusta». Il rapporto del periodo è calcolato su <em>tutte</em> le settimane complete: le settimane marcate «dato GA4 non affidabile» non vengono sottratte. L’allarme scatta sulle <em>rotture</em>, che sono solo cadute: rapporto oltre ${R.PM(PARAMS.ratioBreak * 100, 0)} sotto la mediana delle ${PARAMS.ratioBaselineWeeks} settimane complete precedenti, oppure ${PARAMS.ratioBandRun} settimane consecutive fuori dalla banda ${R.PM(PARAMS.ratioBandLow * 100, 0)}–${R.PM(PARAMS.ratioBandHigh * 100, 0)}, (una salita è coperta dal limite di ${R.PM(PARAMS.ratioMax * 100, 0)}, oltre il quale il dato è impossibile). Solo la settimana parziale in corso non entra nel calcolo.</div>`
  }

  // ── 4. AI / GEO ──
  const aiRows = m.aiTools.map(([label, sess], idx) => {
    const rows = m.smTable.filter(r => r.category === 'AI' && r.label === label)
    const users = rows.reduce((s, r) => s + (r.users ?? 0), 0)
    return `<tr><td style="color:#999;font-size:.8rem">${idx + 1}</td><td><strong>${esc(label)}</strong></td><td style="text-align:center;font-weight:700;color:#5b21b6">${fmtInt(sess)}</td><td style="text-align:center">${R.P(sess, total, 1)}</td><td style="text-align:center">${rows.some(r => r.users != null) ? fmtInt(users) : 'n.d.'}</td></tr>`
  }).join('')
  let geoBlock = ''
  if (m.geo) {
    const g = m.geo
    const gq = g.monthsQueried
    const avail = g.firstDataMonth ? `serie disponibile da ${g.firstDataMonth} (${g.monthsWithData} mesi con dati GA4 su ${gq} interrogati)` : `nessun mese con dati GA4 nei ${gq} mesi interrogati`
    geoBlock = `
<h3>Serie storica sessioni da AI / GEO — ultimi ${PARAMS.geoMonths} mesi (sessioni/mese)</h3>
${rng('GA4 · sessioni con sorgente di tipo assistente AI · intervallo proprio, indipendente dal periodo del report', g.range.start, g.range.end, gq, `${gq} mesi coperti, ultimo parziale`).replace(`(${gq} giorni)`, `(${gq} mesi)`)}
<div class="chart-box"><canvas id="geoChart" height="110"></canvas></div>
<div class="cap">Annotazione: attivazione ottimizzazioni GEO = ${esc(i.geoActivation.date)} (${esc(i.geoActivation.label)}). Mese di attivazione evidenziato in viola scuro; l'ultimo mese è parziale (giorni non consolidati esclusi). I mesi senza sessioni sono mostrati a zero.</div>
<div class="note-box"><strong>Disponibilità della serie:</strong> ${esc(avail)}.<br>${g.sufficient
      ? `<strong>Esito del controllo:</strong> baseline sufficiente — ${g.monthsBefore} mesi con dati GA4 prima dell'attivazione (${fmtInt(g.aiBefore)} sessioni AI) e ${g.monthsAfter} mesi dall'attivazione (${fmtInt(g.aiAfter)} sessioni AI). Il confronto è descrittivo: la serie mostra quando è comparso il traffico, non dimostra da sola la causa.`
      : `<strong>Esito del controllo:</strong> serie insufficiente per attribuzione — solo ${g.monthsBefore} mesi con dati GA4 precedenti all'attivazione (minimo richiesto ${PARAMS.minBaselineMonths}). Non dipende dall'intervallo interrogato (${gq} mesi): l'account non ha storico precedente. Le sessioni AI sono riportate, la causa non è attribuita.`}</div>`
  } else geoBlock = `<h3>Serie storica AI / GEO</h3>${na('serie mensile GA4 non recuperata (vedi Avvisi)')}`

  // ── 5. Paid ──
  const paidBlock = m.macro.Paid === 0 ? `
<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:18px 20px;font-size:.88rem;color:#92400e">
  <strong>🟡 Nessuna sessione paid nel periodo selezionato</strong> — 0 sessioni.<br><br>
  <strong>Checklist pre-lancio:</strong><br>
  ✅ UTM consistenti: <code>utm_source=google&amp;utm_medium=cpc&amp;utm_campaign=NOME</code><br>
  ✅ Conversion tracking GA4 sul form eCura (evento <code>generate_lead</code>)<br>
  ✅ Escludere le keyword di marca («ecura») dalle campagne generiche<br>
  ✅ Landing page dedicata con form above-the-fold
</div>` : `
<div style="background:#fffbeb;border-left:4px solid #F59E0B;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:18px;font-size:.87rem">
  <strong>${fmtInt(m.macro.Paid)} sessioni paid</strong> — ${R.P(m.macro.Paid, total, 1, 'text')} delle sessioni totali.
</div>
<div class="charts-grid">
  <div class="chart-box"><h3>Sessioni per piattaforma ADS</h3><canvas id="paidChart" height="220"></canvas></div>
  <div class="chart-box" style="overflow:auto"><h3>Dettaglio campagne paid</h3>
    <table><thead><tr><th>Fonte</th><th style="text-align:center">Sessioni</th><th style="text-align:center">Quota sessioni</th></tr></thead><tbody>
    ${m.paidSources.map(([l, s]) => `<tr><td><strong>${esc(l)}</strong></td><td style="text-align:center;font-weight:700;color:#d97706">${fmtInt(s)}</td><td style="text-align:center">${R.P(s, total, 1)}</td></tr>`).join('')}</tbody></table>
  </div>
</div>`

  // ── 6. Tabella source/medium (somma = KPI) ──
  const shown = m.smTable.slice(0, PARAMS.smTableRows)
  const rest = m.smTable.slice(PARAMS.smTableRows)
  const restSess = rest.reduce((s, r) => s + r.sessions, 0)
  const tip = (c: string) => c === 'SEO' ? 'Verificare query e pagine' : c === 'AI' ? 'Verificare citazioni / FAQ' : c === 'Direct' ? 'Possibile referrer perso' : c === 'Paid' ? 'Monitorare costo per lead' : c === 'Social' ? 'Verificare UTM' : '–'
  const smRows = shown.map((r: SmRow, idx) => `<tr>
    <td style="color:#999;font-size:.78rem">${idx + 1}</td><td style="font-weight:600;font-size:.85rem">${esc(r.source)}</td><td style="font-size:.8rem;color:#666">${esc(r.medium)}</td>
    <td><span class="src-badge" style="background:${CAT_BG[r.category]};color:${CAT_COLOR[r.category]}">${r.category}</span></td>
    <td style="text-align:center;font-weight:700">${fmtInt(r.sessions)}</td><td style="text-align:center;font-size:.83rem">${R.P(r.sessions, total, 1)}</td>
    <td style="text-align:center;font-size:.83rem">${r.users == null ? 'n.d.' : fmtInt(r.users)}</td>
    <td style="text-align:center;font-size:.83rem">${r.bounceRate == null ? 'n.d.' : R.R(r.bounceRate, 0)}</td><td style="font-size:.78rem;color:#888">${tip(r.category)}</td></tr>`).join('')
  const smTable = `
${rng('GA4 · query base unica (data × canale × source × medium)', w.start, w.aggEnd, m.periodDaysGa4)}
<div style="margin-bottom:16px;font-size:.85rem;color:#555">${m.smTable.length} combinazioni source/medium distinte · ordinate per sessioni decrescenti · la somma delle righe coincide con le sessioni totali</div>
<div style="overflow:auto"><table><thead><tr><th>#</th><th>Fonte (source)</th><th>Medium</th><th>Categoria</th><th style="text-align:center">Sessioni</th><th style="text-align:center">Quota sessioni</th><th style="text-align:center">Utenti</th><th style="text-align:center">Bounce</th><th>Nota</th></tr></thead><tbody>
${smRows}
${rest.length ? `<tr><td></td><td colspan="3"><em>Altre ${rest.length} combinazioni</em></td><td style="text-align:center;font-weight:700">${fmtInt(restSess)}</td><td style="text-align:center">${R.P(restSess, total, 1)}</td><td colspan="4"></td></tr>` : ''}
<tr style="background:#dbeafe;font-weight:700"><td></td><td colspan="3">TOTALE (= Sessioni totali KPI)</td><td style="text-align:center">${fmtInt(m.smTable.reduce((s, r) => s + r.sessions, 0))}</td><td style="text-align:center">${R.P(total, total, 1)}</td><td colspan="4"></td></tr>
</tbody></table></div>
<div class="cap">Gli utenti per riga non sono additivi (lo stesso utente può comparire in più fonti): per questo la riga di totale non li somma.</div>`

  // ── 7. CRM ──
  let crmBlock = ''
  if (m.crm && m.crm.total > 0) {
    const c = m.crm
    const rowsHtml = TEMP_ORDER.map(t => {
      const row = c.tempStatus[t] || {}; const tot = c.byTemp[t] || 0
      if (!tot) return ''
      const ct = row['CONTRACT_SENT'] || 0, br = row['BROCHURE_SENT'] || 0, nw = row['NEW'] || 0
      const other = tot - ct - br - nw
      return `<tr><td><strong>${ICON[t]} ${t}</strong></td><td style="text-align:center;color:#065f46;font-weight:700">${ct}</td><td style="text-align:center;color:#1d4ed8">${br}</td><td style="text-align:center;color:#6b7280">${nw}</td><td style="text-align:center">${other}</td><td style="text-align:center;font-weight:700">${tot}</td><td style="text-align:center">${R.P(tot, c.total, 0)}</td><td style="text-align:center">${R.P(ct + br, tot, 0)}</td></tr>`
    }).join('')
    const sum = (k: string) => c.statusTotals[k] || 0
    const ctTot = sum('CONTRACT_SENT'), brTot = sum('BROCHURE_SENT'), nwTot = sum('NEW')
    const ctWarm = ((c.tempStatus['caldo'] || {})['CONTRACT_SENT'] || 0) + ((c.tempStatus['tiepido'] || {})['CONTRACT_SENT'] || 0)
    const warmRow = ctTot > 0 ? `<tr style="background:#ecfdf5;font-weight:700"><td>di cui lead caldi + tiepidi</td><td style="text-align:center;color:#065f46">${ctWarm} su ${ctTot} = ${R.P(ctWarm, ctTot, 0)}</td><td colspan="6" style="font-weight:400;font-size:.8rem;color:#555">quota dei CONTRACT_SENT proveniente da lead caldi o tiepidi</td></tr>` : ''
    const claim = ctTot > 0
      ? `${ctWarm} su ${ctTot} (${R.P(ctWarm, ctTot, 0, 'text')}) dei contratti inviati proviene da lead caldi o tiepidi.`
      : 'Nessun contratto inviato (CONTRACT_SENT) nel periodo.'
    // cross-tab fonte × status
    let srcBlock = ''
    {
      // Una riga per OGNI valore presente (inclusa «non valorizzata»); la riga AI e' predisposta anche a zero lead.
      const keys = Object.keys(c.byCanale)
      const empty = { canale: 'AI', total: 0, web: 0, status: {}, details: {} }
      const rowsData = [...keys.map(k => c.byCanale[k]), ...(c.byCanale['AI'] ? [] : [empty])]
        .sort((a, b) => (a.canale === CRM_UNSET ? 1 : b.canale === CRM_UNSET ? -1 : b.total - a.total))
      const rows = rowsData.map(v => {
        const ct = v.status['CONTRACT_SENT'] || 0, br = v.status['BROCHURE_SENT'] || 0, nw = v.status['NEW'] || 0
        const den = crmDenominator(m, v)
        const small = v.total < PARAMS.minChannelSample
        const warn = small ? `<br><span style="color:#92400e;font-size:.72rem">⚠ campione &lt; ${PARAMS.minChannelSample} lead: rapporto indicativo</span>` : ''
        const rate = (n: number, d: number) => `${fmtDec((PARAMS.per * n) / d, 1)} lead per ${PARAMS.per} sessioni`
        let cell: string
        if (v.canale === CRM_UNSET) cell = `non calcolabile: ${esc(den.note)}<br><span style="font-size:.72rem;color:#6b7280">${v.total} lead senza fonte, nessun denominatore GA4</span>`
        else if (den.unique) {
          const d = gaChanSessions(m, den.unique)
          cell = d > 0
            ? `<strong>${rate(v.total, d)}</strong><br><span style="font-size:.72rem;color:#6b7280">numeratore ${v.total} lead · denominatore ${fmtInt(d)} sessioni GA4 canale ${GA_CHAN_LABEL[den.unique]}</span>${warn}<br><span style="font-size:.7rem;color:#6b7280">${esc(den.note)}</span>`
            : `denominatore a zero (canale GA4 ${GA_CHAN_LABEL[den.unique]} senza sessioni)${warn}`
        } else {
          const cand = den.candidates.map(x => `${GA_CHAN_LABEL[x.ga]}: ${fmtInt(x.sessions)} sessioni`).join(' · ')
          cell = `non univoco — denominatori candidati: ${esc(cand || 'nessuno')}<br><span style="font-size:.72rem;color:#6b7280">numeratore ${v.total} lead</span>${warn}<br><span style="font-size:.7rem;color:#6b7280">${esc(den.note)}</span>`
        }
        const aiNote = v.canale === 'AI' && v.total === 0 ? `<br><span style="font-size:.7rem;color:#6b7280">${esc(CRM_AI_NOT_EMITTED)}</span>` : ''
        const label = v.canale === CRM_UNSET ? 'non valorizzata' : v.canale
        return `<tr><td><strong>${esc(label)}</strong>${aiNote}</td><td style="text-align:center;font-weight:700">${v.total}</td><td style="text-align:center">${v.web}</td><td style="text-align:center;color:#065f46">${ct}</td><td style="text-align:center;color:#1d4ed8">${br}</td><td style="text-align:center;color:#6b7280">${nw}</td><td style="text-align:center">${v.total - ct - br - nw}</td><td style="font-size:.8rem">${cell}</td></tr>`
      }).join('')
      const lowCov = c.sourceCoverage < PARAMS.minCrmSourceCoverage
      srcBlock = `
<h3>Fonte lead (campo CRM <code>canale_acquisizione</code>) × Status</h3>
<div style="overflow:auto"><table><thead><tr><th>Canale CRM</th><th style="text-align:center">Lead</th><th style="text-align:center">di cui da form sito</th><th style="text-align:center">CONTRACT_SENT</th><th style="text-align:center">BROCHURE_SENT</th><th style="text-align:center">NEW</th><th style="text-align:center">Altri stati</th><th>Lead per ${PARAMS.per} sessioni GA4 (numeratore / denominatore)</th></tr></thead><tbody>${rows}
<tr style="background:#f0fdf4;font-weight:700"><td>TOTALE (= lead del periodo)</td><td style="text-align:center">${c.rowsSum}</td><td colspan="6" style="font-weight:400;font-size:.8rem">somma delle righe ${c.rowsSum} = lead totali ${c.total} · fonte valorizzata ${c.sourceFilled}/${c.total} = ${R.P(c.sourceFilled, c.total, 1)}; senza fonte ${c.total - c.sourceFilled} lead (riga «non valorizzata»)</td></tr></tbody></table></div>
<div class="cap">Il canale CRM è dedotto dal form (UTM o referrer al momento dell'invio): è un modello di attribuzione diverso da quello di GA4, quindi il rapporto è indicativo. Mappatura CRM → canale GA4 (costante unica nel codice): GOOGLE con dettaglio google_organico → SEO; GOOGLE con google_ads → Paid; ORGANICO → SEO; DIRETTO → Direct; META → Paid o Social (dipende da utm_medium); EMAIL, REFERRAL, ALTRO → Altro; AI → AI/GEO. Dove la corrispondenza non è univoca si mostrano i denominatori candidati, non un rapporto. Rapporto = lead attribuiti al canale / sessioni GA4 dello stesso canale × ${PARAMS.per}; avviso se i lead sono meno di ${PARAMS.minChannelSample}.${lowCov ? ' La fonte è valorizzata su meno della metà dei lead: la lettura per canale è fragile.' : ''}</div>
<div class="note-box"><strong>Lead da assistenti AI.</strong> ${c.hasAi ? `Il CRM contiene ${c.byCanale['AI'].total} lead con canale AI.` : `I lead da assistenti AI non sono distinguibili: il canale non è emesso dal form. Da implementare in ecura-landing. Oggi quei lead finiscono in ALTRO (referral non classificabile).`}</div>`
    }
    crmBlock = `
<div class="section">
<h2>🌡️ Qualità Lead CRM — Temperatura × Pipeline <span class="tag tag-crm">CRM D1</span></h2>
${rng('CRM D1 · tabella leads · created_at (UTC)', w.start, w.aggEnd, m.periodDaysGa4)}
<div style="background:#f0fdf4;border-left:4px solid #059669;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:18px;font-size:.87rem;color:#166534">
  <strong>${c.total} lead nel periodo · ${claim}</strong>
</div>
<div class="charts-grid">
  <div class="chart-box"><h3>Temperatura × Status CRM (lead)</h3><canvas id="tempStatusChart" height="220"></canvas></div>
  <div class="chart-box"><h3>Distribuzione temperatura (lead)</h3><canvas id="tempPieChart" height="220"></canvas></div>
</div>
<div style="overflow:auto;margin-top:20px"><table><thead><tr><th>Temperatura</th><th style="text-align:center">CONTRACT_SENT</th><th style="text-align:center">BROCHURE_SENT</th><th style="text-align:center">NEW</th><th style="text-align:center">Altri stati</th><th style="text-align:center">Totale lead</th><th style="text-align:center">Quota dei lead</th><th style="text-align:center">Con CONTRACT/BROCHURE</th></tr></thead><tbody>${rowsHtml}
<tr style="background:#f0fdf4;font-weight:700"><td>TOTALE</td><td style="text-align:center;color:#065f46">${ctTot}</td><td style="text-align:center;color:#1d4ed8">${brTot}</td><td style="text-align:center">${nwTot}</td><td style="text-align:center">${c.total - ctTot - brTot - nwTot}</td><td style="text-align:center">${c.total}</td><td style="text-align:center">${R.P(c.total, c.total, 0)}</td><td style="text-align:center">${R.P(ctTot + brTot, c.total, 0)}</td></tr>
${warmRow}</tbody></table></div>
${srcBlock}
</div>`
  } else {
    crmBlock = `<div class="section"><h2>🌡️ Qualità Lead CRM — Temperatura × Pipeline <span class="tag tag-crm">CRM D1</span></h2>${m.crm ? '<p>Nessun lead nel periodo.</p>' : na(i.crmError || 'CRM non raggiungibile')}</div>`
  }

  // ── Qualità del dato e metodo ──
  const qRows = checks.map(c => `<tr><td>${esc(c.label)}</td><td>${statusCell(c.level)}</td><td>${esc(c.value)}</td></tr>`).join('')
  const geoRange = m.geo ? m.geo.range : null
  const srcRows = `
    <tr><td>GA4 — property ${esc(i.ga4PropertyId)} (${esc(i.measurementId)}): totale, canali, source/medium</td><td>${w.start}</td><td>${w.aggEnd}</td><td style="text-align:center">${m.periodDaysGa4}</td><td>richiesto fino al ${esc(i.requestedEnd)}; lag ${PARAMS.ga4LagDays} giorni${m.cons.tailDays ? ` e ${m.cons.tailDays} giorni in consolidamento` : ''}; stessa dateRanges per tutte le query non datate</td></tr>
    <tr><td>GA4 — serie giornaliera (scaricata)</td><td>${w.start}</td><td>${w.ga4End}</td><td style="text-align:center">${m.downloadedDays}</td><td>comprende i giorni in consolidamento, mostrati tratteggiati e mai sommati</td></tr>
    <tr><td>Search Console — ${esc(i.siteUrl)} (web, dataState final)</td><td>${m.gsc ? w.start : 'n.d.'}</td><td>${m.gsc ? w.gscEnd : 'n.d.'}</td><td style="text-align:center">${m.gsc ? m.periodDaysGsc : 'n.d.'}</td><td>lag ${PARAMS.gscLagDays} giorni</td></tr>
    <tr><td>CRM lead (D1)</td><td>${m.crm ? w.start : 'n.d.'}</td><td>${m.crm ? w.aggEnd : 'n.d.'}</td><td style="text-align:center">${m.crm ? m.periodDaysGa4 : 'n.d.'}</td><td>stesso intervallo di GA4 (created_at, UTC)</td></tr>
    <tr><td>GA4 — serie mensile AI/GEO (intervallo proprio)</td><td>${geoRange ? geoRange.start : 'n.d.'}</td><td>${geoRange ? geoRange.end : 'n.d.'}</td><td style="text-align:center">${m.geo ? m.geo.monthsQueried + ' mesi' : 'n.d.'}</td><td>${PARAMS.geoMonths} mesi interi fino all’ultimo giorno aggregato; ultimo mese parziale</td></tr>`
  const qualityBlock = `
<div class="section qa-page">
<h2>🧪 Appendice — Qualità del dato e metodo</h2>
<p style="font-size:.88rem">Ogni riga è calcolata a runtime dalle stesse query che alimentano il report. Tre livelli: <span class="qa-fail">🔴 errore bloccante</span> (quadrature hard: il report non si genera), <span class="qa-warn">🟠 anomalia</span> (il report si genera; in testa resta una sola frase, l’elenco puntuale è in questa tabella), <span class="qa-notice">🟡 avviso di metodo</span> (nessun banner, solo la riga in tabella).</p>
<table><thead><tr><th style="width:${QA_COL.label}%">Controllo</th><th style="width:${QA_COL.status}%">Esito</th><th>Valore calcolato</th></tr></thead><tbody>${qRows}${PLACE_PCT}</tbody></table>
<h3>Intervalli effettivamente usati da ogni fonte</h3>
<table><thead><tr><th>Fonte</th><th>startDate</th><th>endDate</th><th style="text-align:center">Giorni</th><th>Nota</th></tr></thead><tbody>${srcRows}</tbody></table>
<h3>Definizioni di metodo</h3>
<ul style="font-size:.84rem;line-height:1.6">
  <li><strong>Sessioni totali</strong> = totale GA4 della query <em>senza dimensioni</em> sullo stesso periodo: è l’unica fonte di verità. Macro-canali, tabella source/medium e canali nativi derivano da query senza data sullo stesso intervallo e devono coincidere con esso.</li>
  <li><strong>Serie giornaliera</strong> = query con la dimensione data. Una sessione che attraversa la mezzanotte è contata su due date: la somma datata supera il totale di N sessioni (<em>sessioni a cavallo della mezzanotte</em>, N = somma datata − totale senza dimensioni). N è atteso e dichiarato; la tolleranza (${R.PM(PARAMS.tolerance * 100, 1)} del totale o ${PARAMS.toleranceAbs} sessioni, la più permissiva) copre solo questo caso, oltre resta errore bloccante. <strong>Totale device</strong> = stessa dateRanges, nessuna data: deve coincidere esattamente.</li>
  <li><strong>CTR</strong> di sito = click / impressioni sull’intero periodo GSC. Il <strong>CTR delle top ${PARAMS.topQueries} query</strong> è un’altra grandezza (Σ click / Σ impressioni delle sole ${PARAMS.topQueries} query) e non va confuso con il CTR di sito. <strong>Click al giorno</strong> = click / giorni effettivi dopo il taglio dei giorni non consolidati.</li>
  <li><strong>MA${PARAMS.maShort}</strong> = media dei ${PARAMS.maShort} giorni terminanti nella data indicata: indicatore di breve, senza verdetto. <strong>MA${PARAMS.maLong}</strong> = media dei ${PARAMS.maLong} giorni terminanti nella data indicata, esclusi i giorni in consolidamento: è l’unica base del verdetto «in calo / stabile / in aumento» (confronto con la MA${PARAMS.maLong} di ${PARAMS.maLong} giorni prima).</li>
  <li><strong>Giorni in consolidamento</strong>: se in almeno ${PARAMS.consolidationMinDays} degli ultimi ${PARAMS.consolidationTailDays} giorni l’organico è sotto ${R.PM(PARAMS.consolidationMinShare * 100, 0)} della media dei ${PARAMS.consolidationRefDays} giorni precedenti (una singola giornata debole non basta), quei ${PARAMS.consolidationTailDays} giorni sono esclusi da aggregati e trend e tratteggiati nei grafici. Lag GA4 ${PARAMS.ga4LagDays} giorni, GSC ${PARAMS.gscLagDays}.</li>
  <li><strong>Google organic</strong> = sessioni con <code>sessionSource = google</code> e <code>sessionMedium = organic</code> (non il channel group, che comprende Discover, News e referral google.* riclassificati). <strong>Macro-canali</strong>: SEO (tutti i motori organici), AI (assistenti AI), Direct, Paid, Social, Altro.</li>
  <li><strong>Rapporto organico</strong> = sessioni GA4 google / organic ÷ click GSC, su settimane complete (lun–dom) e affidabili: sono escluse le settimane con sessioni oltre ${fmtDec(PARAMS.ratioMax, 2)} volte i click.</li>
  <li><strong>Quota Direct</strong> = sessioni Direct ÷ sessioni totali.</li>
  <li><strong>Lead per ${PARAMS.per} sessioni</strong> = lead attribuiti al canale ÷ sessioni GA4 dello stesso canale × ${PARAMS.per}; si mostrano sempre numeratore e denominatore, con avviso se i lead sono meno di ${PARAMS.minChannelSample}. Dove la mappatura CRM → GA4 non è univoca si mostrano i denominatori candidati.</li>
  <li>Fusi orari: GA4 usa il fuso della property, Search Console il proprio: piccoli scostamenti sul singolo giorno sono attesi; per questo il confronto affidabile è settimanale.</li>
</ul>
</div>`

  // ── Insight (conclusioni, solo affermazioni con dato accanto) ──
  const ins: string[] = []
  const gOrg = m.googleOrganic
  if (m.macro.SEO > 0) {
    const t0 = i.gsc?.queries[0]
    ins.push(`<li class="seo">🔍 <strong>Organico</strong>: ${fmtInt(m.macro.SEO)} sessioni (${sessPct(m.macro.SEO, 'text')} delle sessioni), di cui ${fmtInt(gOrg)} da Google. ${m.gsc ? `Search Console: ${fmtInt(m.gsc.clicks)} click e CTR ${R.P(m.gsc.clicks, m.gsc.impressions, 1, 'text')} (click / impressioni).` : 'Search Console: dato non disponibile.'}${t0 ? ` Query con più click: «${esc(t0.query)}» (${fmtInt(t0.clicks)} click su ${fmtInt(t0.impressions)} impressioni).` : ''}</li>`)
  }
  if (m.macro.AI > 0) {
    const top = m.aiTools[0]
    ins.push(`<li class="ai">🤖 <strong>AI/GEO</strong>: ${fmtInt(m.macro.AI)} sessioni (${sessPct(m.macro.AI, 'text')} delle sessioni)${top ? `; sorgente principale ${esc(top[0])} con ${fmtInt(top[1])} sessioni` : ''}. ${m.geo && !m.geo.sufficient ? 'Serie storica insufficiente per attribuire l\'andamento alle ottimizzazioni GEO.' : 'Vedi serie mensile per il momento di comparsa del traffico.'}</li>`)
  }
  if (m.macro.Direct > 0) {
    ins.push(`<li class="direct">🎯 <strong>Direct</strong>: ${fmtInt(m.macro.Direct)} sessioni (${sessPct(m.macro.Direct, 'text')} delle sessioni)${directAlert ? ' — oltre la soglia di allerta: possibile sotto-attribuzione, da leggere con cautela (referrer perso da app, PDF, email, assistenti AI).' : '.'}</li>`)
  }
  ins.push(m.macro.Paid === 0 ? `<li class="paid">💰 <strong>ADS</strong>: 0 sessioni paid nel periodo.</li>` : `<li class="paid">💰 <strong>ADS</strong>: ${fmtInt(m.macro.Paid)} sessioni paid (${sessPct(m.macro.Paid, 'text')} delle sessioni).</li>`)
  if (m.crm && m.crm.total > 0) {
    const web = m.crm.webTotal
    ins.push(`<li class="seo" style="border-left-color:#059669;background:#f0fdf4">🎯 <strong>Form eCura</strong>: ${web} lead dal form del sito (dettaglio_fonte = ecura_landing) su ${fmtInt(total)} sessioni GA4 = ${fmtDec(total > 0 ? (100 * web) / total : 0, 1)} lead ogni 100 sessioni${mobile != null && total > 0 ? `; sessioni da mobile: ${R.P(mobile, total, 1, 'text')} delle sessioni (${fmtInt(mobile)} sessioni)` : ''}. Il tasso è un rapporto grezzo: le sessioni includono visite non orientate al contatto.</li>`)
  }
  const insights = `
<div class="section">
<h2>💡 Insight e conclusioni (ogni affermazione è accompagnata dal dato)</h2>
<ul class="insight-list">${ins.join('')}</ul>
${trendBox}
<h3 style="margin-top:24px">📊 Top ${PARAMS.topPages} pagine GA4 per visualizzazioni</h3>
${rng('GA4', w.start, w.aggEnd, m.periodDaysGa4)}
${i.ga4.topPages ? `<table><thead><tr><th>Pagina</th><th style="text-align:center">Pageviews</th><th style="text-align:center">Sessioni</th></tr></thead><tbody>${i.ga4.topPages.map(p => `<tr><td style="font-size:.82rem">${esc(p.page)}</td><td style="text-align:center">${fmtInt(p.pageviews)}</td><td style="text-align:center">${fmtInt(p.sessions)}</td></tr>`).join('')}</tbody></table>` : na('pagine GA4 non recuperate')}
</div>`

  // ── Geografico ──
  const geoBlockCountry = `
<div class="section geo-sec">
<h2>🌍 Geografico <span class="tag tag-ga4">GA4</span></h2>
${rng('GA4', w.start, w.aggEnd, m.periodDaysGa4)}
${i.ga4.countries ? `<div class="charts-grid"><div class="chart-box"><h3>Top paesi per sessioni</h3>
<table><thead><tr><th>Paese</th><th style="text-align:center">Sessioni</th><th style="text-align:center">Quota sessioni</th></tr></thead><tbody>
${i.ga4.countries.map(c => `<tr><td>${esc(c.country)}</td><td style="text-align:center;font-weight:600">${fmtInt(c.sessions)}</td><td style="text-align:center;color:#666">${R.P(c.sessions, total, 1)}</td></tr>`).join('')}</tbody></table></div></div>` : na('paesi GA4 non recuperati')}
</div>`

  // ── dati per i grafici ──
  const dev = i.ga4.devices || []
  const devLabels = dev.map(d => `${d.device} (${fmtInt(d.sessions)} sessioni · ${R.P(d.sessions, total, 1)})`)
  const orgDays = m.dates
  const chartData = {
    labels: m.dates.map(fmtDay),
    series: CHART_CHANNELS.map(c => ({ name: c, data: m.series[c], color: CH_COLOR[c] })),
    ma7: m.ma7Total.map((v, k) => (v == null || k >= m.aggCount ? null : Math.round(v * 100) / 100)),
    aggCount: m.aggCount,
    weekLabels, weekPartial,
    weekSeries: CHART_CHANNELS.map(c => ({ name: c, data: fullWeeks.map(x => x.byChannel[c]), color: CH_COLOR[c] })),
    commonCount: m.dates.filter(d => d <= m.win.commonEnd).length,
    gaOrg: m.gaOrgDaily, gaOrgMa: m.gaOrgMa7.map((v, k) => (v == null || k >= m.aggCount ? null : Math.round(v * 100) / 100)),
    gsc: m.gscDaily, gscMa: m.gscMa7.map(v => (v == null ? null : Math.round(v * 100) / 100)),
    gscEndLabel: fmtDay(w.gscEnd), ga4EndLabel: fmtDay(w.aggEnd),
    devLabels, devData: dev.map(d => d.sessions),
    donutLabels, donutData: macroDefs.map(d => d[2]), natLabels, natData: m.nativeChannels.map(x => x[1]),
    seoLabels: m.seoEngines.map(([k, v]) => `${k} (${fmtInt(v)} sessioni)`), seoData: m.seoEngines.map(x => x[1]),
    aiLabels: m.aiTools.map(([k, v]) => `${k} (${fmtInt(v)} sessioni)`), aiData: m.aiTools.map(x => x[1]),
    paidLabels: m.paidSources.map(([k, v]) => `${k} (${fmtInt(v)} sessioni)`), paidData: m.paidSources.map(x => x[1]),
    geo: m.geo ? { labels: m.geo.months.map(x => x.month + (x.partial ? ' (parz.)' : '')), ai: m.geo.months.map(x => x.ai), partial: m.geo.months.map(x => x.partial), act: m.geo.months.map(x => x.month === m.geo!.activationMonth) } : null,
    crm: m.crm && m.crm.total > 0 ? (() => {
      const c = m.crm!
      const lab = TEMP_ORDER.map(t => `${ICON[t]} ${t} (${c.byTemp[t] || 0} lead)`)
      const g = (st: string) => TEMP_ORDER.map(t => (c.tempStatus[t] || {})[st] || 0)
      const ct = g('CONTRACT_SENT'), br = g('BROCHURE_SENT'), nw = g('NEW')
      const oth = TEMP_ORDER.map((t, k) => (c.byTemp[t] || 0) - ct[k] - br[k] - nw[k])
      return { lab, ct, br, nw, oth, tot: TEMP_ORDER.map(t => c.byTemp[t] || 0) }
    })() : null,
  }
  void orgDays

  const css = REPORT_CSS
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Report Analytics Live — eCura · ${esc(generatedAt)}</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"><\/script>
<style>
${css}
</style>
</head>
<body>
${PLACE_BANNER}
<div class="cover">
  <div class="cover-inner">
    <span class="pill">${i.sampleNote ? '🧪 ESEMPIO' : '🔴 LIVE'} · Generato ${esc(generatedAt)}</span>
    ${i.sampleNote ? `<div style="margin-top:12px;background:#fbbf24;color:#3b2a00;border-radius:8px;padding:8px 14px;font-weight:700;font-size:.85rem;max-width:760px">${esc(i.sampleNote)}</div>` : ''}
    <h1 style="margin-top:16px">Report Analytics Live — eCura</h1>
    <p class="subtitle">Analisi dettagliata per fonte di acquisizione: SEO tradizionale (motore per motore), AI/GEO (tool per tool), Direct, ADS.<br>
    <span id="periodo-effettivo">${esc(periodLine(m))}</span></p>
    <div class="meta">
      <span>📊 GA4: ${esc(i.measurementId)}</span>
      <span>🔍 Search Console: ${esc(i.siteUrl)}</span>
      <span>🗄️ Lead CRM: ${leadsTotal == null ? 'n.d.' : leadsTotal}</span>
      <span>📡 Fonti distinte: ${m.smTable.length}</span>
      ${i.errors.length ? `<span style="color:#fbbf24">⚠️ ${i.queryStats ? `${i.queryStats.failed} query fallite su ${i.queryStats.total}` : `${i.errors.length} avvisi`}</span>` : ''}
    </div>
  </div>
</div>

<div class="container">
${errorsBlock}

<!-- 1. KPI OVERVIEW -->
<div class="section">
<h2>📊 Overview GA4 <span class="tag tag-ga4">GA4</span></h2>
${rng('GA4', w.start, w.aggEnd, m.periodDaysGa4)}
${kpiHtml}
<div class="charts-grid">
  <div class="chart-box" style="grid-column:span 2">
    <h3>Sessioni per canale di acquisizione</h3>
    <canvas id="dailyChart" height="95"></canvas>
    <div class="cap">Barre impilate: sessioni al giorno per canale (Google organic, AI, Direct, Paid, Altro). Linea: media mobile a ${PARAMS.maShort} giorni del totale (sessioni/giorno). ${esc(lagNote)}</div>
  </div>
  <div class="chart-box">
    <h3>📱 Device</h3>
    ${i.ga4.devices ? '<canvas id="deviceChart" height="220"></canvas>' : na('device GA4 non recuperati')}
  </div>
</div>
<div class="charts-grid">
  <div class="chart-box" style="grid-column:span 2">
    <h3>Organico: sessioni GA4 vs click Search Console</h3>
    <div class="panel"><canvas id="orgGaChart" height="62"></canvas></div>
    <div class="panel"><canvas id="orgGscChart" height="62"></canvas></div>
    <div class="cap">Due pannelli separati con lo stesso asse temporale (nessun doppio asse): sopra le sessioni GA4 di Google organic, sotto i click di Search Console. Linea sottile: dato giornaliero; linea spessa: media mobile a ${PARAMS.maShort} giorni. Entrambe le serie sono ritagliate al periodo comune; i giorni di Search Console oltre tale data restano visibili solo nei KPI di Search Console e nella tabella settimanale. ${esc(dateCaption(m))}</div>
  </div>
  <div class="chart-box">
    <h3>Sessioni per settimana (lun–dom)</h3>
    <canvas id="weekChart" height="220"></canvas>
    <div class="cap">Vista settimanale come lettura primaria; le settimane parziali sono più chiare e marcate «parz.».</div>
  </div>
</div>
</div>

<!-- 2. CANALI -->
<div class="section">
<h2>🎯 Analisi Canali di Acquisizione <span class="tag tag-ga4">GA4</span></h2>
${rng('GA4 · query base unica', w.start, w.aggEnd, m.periodDaysGa4)}
<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:14px 18px;margin-bottom:20px;font-size:.88rem;color:#1e40af">
  <strong>Come leggere questa sezione:</strong> ogni sessione è classificata nella sua fonte (motore di ricerca, assistente AI, accesso diretto, campagna ADS). La somma dei sei macro-canali coincide con le sessioni totali del KPI (controllo nella sezione Qualità del dato).
</div>
<div class="kpi-grid" style="grid-template-columns:repeat(6,1fr)">${macroCards}</div>
${directBox}
<div class="charts-grid">
  <div class="chart-box"><h3>Distribuzione macro canali (sessioni)</h3><canvas id="summaryDonut" height="260"></canvas></div>
  <div class="chart-box"><h3>Canali GA4 nativi (sessioni)</h3><canvas id="channelChart" height="260"></canvas></div>
</div>
</div>

<!-- 3. SEO -->
<div class="section">
<h2>🔍 SEO Tradizionale — Dettaglio per Motore di Ricerca <span class="tag tag-seo">Organic</span></h2>
${rng('GA4', w.start, w.aggEnd, m.periodDaysGa4)}
<div style="background:#eff6ff;border-left:4px solid #4285F4;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:18px;font-size:.87rem">
  <strong>${fmtInt(m.macro.SEO)} sessioni organiche</strong> — ${sessPct(m.macro.SEO, 'text')} delle sessioni totali.
  ${m.gsc ? `Search Console (${gscRange}, ${m.periodDaysGsc} giorni): <strong>${fmtInt(m.gsc.clicks)} click</strong> su ${fmtInt(m.gsc.impressions)} impressioni, CTR ${R.P(m.gsc.clicks, m.gsc.impressions, 1, 'text')} (click / impressioni).` : 'Search Console: dato non disponibile.'}
</div>
${seoTable}
${gscBlock}
${ratioBlock}
</div>

<!-- 4. AI / GEO -->
<div class="section">
<h2>🤖 AI / GEO — Dettaglio per Tool AI <span class="tag tag-ai">AI Assistant</span></h2>
${rng('GA4', w.start, w.aggEnd, m.periodDaysGa4)}
<div style="background:#f5f3ff;border-left:4px solid #7C3AED;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:18px;font-size:.87rem">
  <strong>${fmtInt(m.macro.AI)} sessioni da assistenti AI</strong> — ${sessPct(m.macro.AI, 'text')} delle sessioni totali.
</div>
${m.aiTools.length ? `
<div class="charts-grid">
  <div class="chart-box"><h3>Sessioni per tool AI</h3><canvas id="aiToolsChart" height="220"></canvas></div>
  <div class="chart-box" style="overflow:auto"><h3>Dettaglio tool AI — sessioni</h3>
    <table><thead><tr><th>#</th><th>Tool AI</th><th style="text-align:center">Sessioni</th><th style="text-align:center">Quota sessioni</th><th style="text-align:center">Utenti</th></tr></thead><tbody>${aiRows}
    <tr style="background:#ede9fe;font-weight:700"><td colspan="2">TOTALE AI / GEO</td><td style="text-align:center;color:#5b21b6">${fmtInt(m.macro.AI)}</td><td style="text-align:center">${R.P(m.macro.AI, total, 1)}</td><td></td></tr></tbody></table>
  </div>
</div>` : `<div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:16px;color:#6d28d9;font-size:.88rem">Nessuna sessione da assistenti AI nel periodo selezionato.</div>`}
${geoBlock}
</div>

<!-- 5. ADS -->
<div class="section">
<h2>💰 Campagne ADS — Paid Acquisition <span class="tag tag-paid">Paid</span></h2>
${rng('GA4', w.start, w.aggEnd, m.periodDaysGa4)}
${paidBlock}
</div>

<!-- 6. SOURCE / MEDIUM -->
<div class="section">
<h2>📋 Tutte le Fonti — Source / Medium Granulare <span class="tag tag-ga4">GA4</span></h2>
${smTable}
</div>

<!-- 7. CRM -->
${crmBlock}

<!-- Insight -->
${insights}

${geoBlockCountry}

<!-- Appendice: Qualità del dato e metodo (dopo il Geografico) -->
${qualityBlock}

</div><!-- /container -->

<footer>
  <strong>eCura — Medica GB Srl</strong> · Report Analytics Live · Generato ${esc(generatedAt)}<br>
  GA4: ${esc(i.measurementId)} · Search Console: ${esc(i.siteUrl)} · CRM: D1 SQLite · Solo uso interno
</footer>

<script>
Chart.defaults.animation = false; Chart.defaults.font.size = 11;
const D = ${J(chartData)};
const ax = (t, extra) => Object.assign({ beginAtZero: true, title: { display: true, text: t, font: { size: 10 } } }, extra || {});
const legendBottom = { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } };

// 1. Sessioni per canale (barre impilate) + media mobile 7 gg
new Chart(document.getElementById('dailyChart'), {
  data: { labels: D.labels, datasets: D.series.map(s => ({ type: 'bar', label: s.name + ' (sessioni)', data: s.data, stack: 'ch', borderWidth: 0,
      backgroundColor: ctx => ctx.dataIndex >= D.aggCount ? s.color + '55' : s.color,
      borderColor: ctx => ctx.dataIndex >= D.aggCount ? s.color : 'transparent',
      borderDash: [4, 3] }))
    .concat([{ type: 'line', label: 'Media mobile ${PARAMS.maShort} giorni — totale (sessioni/giorno), indicatore di breve', data: D.ma7, borderColor: '#080E49', borderWidth: 2, pointRadius: 0, tension: .25, spanGaps: false, order: 0 }]) },
  options: { responsive: true, plugins: legendBottom, scales: { x: { stacked: true, title: { display: true, text: 'giorno (gg/mm)', font: { size: 10 } }, ticks: { maxTicksLimit: 16 } }, y: Object.assign(ax('sessioni al giorno'), { stacked: true }) } }
});

// 2. Device
if (document.getElementById('deviceChart')) new Chart(document.getElementById('deviceChart'), { type: 'doughnut',
  data: { labels: D.devLabels, datasets: [{ data: D.devData, backgroundColor: ['#4285F4','#34A853','#FBBC05','#9CA3AF'], borderWidth: 2, borderColor: '#fff' }] },
  options: { responsive: true, cutout: '${DONUT_CUTOUT.device}%', plugins: legendBottom } });

// 3. Organico: due pannelli, stessa scala temporale
const orgOpts = (title, last) => ({ responsive: true, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12 } } },
  scales: { x: { title: { display: last, text: 'giorno (gg/mm)', font: { size: 10 } }, ticks: { maxTicksLimit: 16, display: true } }, y: ax(title) } });
// entrambe le serie sono ritagliate al PERIODO COMUNE (D.commonCount giorni): stesso inizio, stessa fine
const cut = a => a.slice(0, D.commonCount);
new Chart(document.getElementById('orgGaChart'), { type: 'line',
  data: { labels: cut(D.labels), datasets: [
    { label: 'Sessioni GA4 Google organic — giornaliero (sessioni/giorno)', data: cut(D.gaOrg), borderColor: 'rgba(66,133,244,.45)', borderWidth: 1, pointRadius: 1.5, tension: 0 },
    { label: 'Media mobile ${PARAMS.maShort} giorni (sessioni/giorno), indicatore di breve', data: cut(D.gaOrgMa), borderColor: '#1d4ed8', borderWidth: 2.5, pointRadius: 0, tension: .25 } ] },
  options: orgOpts('sessioni GA4 al giorno', false) });
new Chart(document.getElementById('orgGscChart'), { type: 'line',
  data: { labels: cut(D.labels), datasets: [
    { label: 'Click Search Console — giornaliero (click/giorno)', data: cut(D.gsc), borderColor: 'rgba(217,119,6,.5)', borderWidth: 1, pointRadius: 1.5, tension: 0, spanGaps: false },
    { label: 'Media mobile ${PARAMS.maShort} giorni (click/giorno), indicatore di breve', data: cut(D.gscMa), borderColor: '#b45309', borderWidth: 2.5, pointRadius: 0, tension: .25, spanGaps: false } ] },
  options: orgOpts('click GSC al giorno', true) });

// 4. Settimanale per canale
new Chart(document.getElementById('weekChart'), { type: 'bar',
  data: { labels: D.weekLabels, datasets: D.weekSeries.map(s => ({ label: s.name + ' (sessioni)', data: s.data, stack: 'w', borderWidth: 0,
    backgroundColor: ctx => D.weekPartial[ctx.dataIndex] ? s.color + '88' : s.color })) },
  options: { responsive: true, plugins: legendBottom, scales: { x: { stacked: true, title: { display: true, text: 'settimana (lunedì, gg/mm)', font: { size: 10 } } }, y: Object.assign(ax('sessioni per settimana'), { stacked: true }) } } });

// 5. Macro canali
new Chart(document.getElementById('summaryDonut'), { type: 'doughnut',
  data: { labels: D.donutLabels, datasets: [{ data: D.donutData, backgroundColor: ['#4285F4','#7C3AED','#068D86','#F59E0B','#EC4899','#9CA3AF'], borderWidth: 2, borderColor: '#fff' }] },
  options: { responsive: true, cutout: '${DONUT_CUTOUT.macro}%', plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, padding: 8 } } } } });
new Chart(document.getElementById('channelChart'), { type: 'bar',
  data: { labels: D.natLabels, datasets: [{ label: 'Sessioni', data: D.natData, backgroundColor: ['#4285F4','#34A853','#FBBC05','#EA4335','#5F6368','#00BCD4','#9C27B0','#FF5722','#607D8B','#795548'], borderRadius: 4 }] },
  options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: ax('sessioni') } } });
${m.seoEngines.length ? `new Chart(document.getElementById('seoEnginesChart'), { type: 'bar', data: { labels: D.seoLabels, datasets: [{ label: 'Sessioni', data: D.seoData, backgroundColor: '#4285F4', borderRadius: 4 }] }, options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: ax('sessioni') } } });` : ''}
${m.aiTools.length ? `new Chart(document.getElementById('aiToolsChart'), { type: 'bar', data: { labels: D.aiLabels, datasets: [{ label: 'Sessioni AI', data: D.aiData, backgroundColor: ['#7C3AED','#8B5CF6','#A78BFA','#C4B5FD','#DDD6FE'], borderRadius: 4 }] }, options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: ax('sessioni') } } });` : ''}
${m.geo ? `new Chart(document.getElementById('geoChart'), { type: 'bar', data: { labels: D.geo.labels, datasets: [{ label: 'Sessioni AI/GEO (sessioni/mese)', data: D.geo.ai, backgroundColor: ctx => D.geo.act[ctx.dataIndex] ? '#4c1d95' : (D.geo.partial[ctx.dataIndex] ? '#C4B5FD' : '#7C3AED'), borderRadius: 4 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { x: { title: { display: true, text: 'mese (aaaa-mm)', font: { size: 10 } } }, y: ax('sessioni AI al mese') } } });` : ''}
${m.macro.Paid > 0 ? `new Chart(document.getElementById('paidChart'), { type: 'bar', data: { labels: D.paidLabels, datasets: [{ label: 'Sessioni Paid', data: D.paidData, backgroundColor: ['#F59E0B','#EF4444','#3B82F6'], borderRadius: 4 }] }, options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: ax('sessioni') } } });` : ''}
${m.crm && m.crm.total > 0 ? `
new Chart(document.getElementById('tempStatusChart'), { type: 'bar', data: { labels: D.crm.lab, datasets: [
  { label: 'CONTRACT_SENT (lead)', data: D.crm.ct, backgroundColor: '#059669', borderRadius: 4 }, { label: 'BROCHURE_SENT (lead)', data: D.crm.br, backgroundColor: '#1d4ed8', borderRadius: 4 },
  { label: 'NEW (lead)', data: D.crm.nw, backgroundColor: '#9ca3af', borderRadius: 4 }, { label: 'Altri stati (lead)', data: D.crm.oth, backgroundColor: '#d1d5db', borderRadius: 4 } ] },
  options: { responsive: true, plugins: legendBottom, scales: { x: { grid: { display: false } }, y: Object.assign(ax('lead'), { ticks: { stepSize: 1 } }) } } });
new Chart(document.getElementById('tempPieChart'), { type: 'doughnut', data: { labels: D.crm.lab, datasets: [{ data: D.crm.tot, backgroundColor: ['#dc2626','#d97706','#2563eb','#9ca3af'], borderWidth: 2, borderColor: '#fff' }] }, options: { responsive: true, cutout: '${DONUT_CUTOUT.crm}%', plugins: legendBottom } });` : ''}
window.__chartsReady = true;
<\/script>
</body>
</html>`
}
