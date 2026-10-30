// ════════════════════════════════════════════════════════════════════
//  ADS ENGINE — Marketing Hub eCura
//  Logica pura (nessun accesso a env/DB): preset campagna, lint, CSV per
//  Google Ads Editor, previsioni, analisi termini di ricerca, parsing pagine.
//  Le campagne generate sono SEMPRE in pausa (Campaign Status = Paused).
// ════════════════════════════════════════════════════════════════════

export const SITE = 'https://www.ecura.it'

export const LIMITS = {
  headline: 30, description: 90, path: 15,
  sitelinkText: 25, sitelinkDesc: 35, callout: 25, snippet: 25,
  headlinesMax: 15, descriptionsMax: 4, headlinesMin: 3, descriptionsMin: 2,
}

export type Match = 'Exact' | 'Phrase' | 'Broad'
export interface Keyword { text: string; match: Match }
export interface AdGroup {
  name: string; finalUrl: string
  keywords: Keyword[]; negatives: string[]
  headlines: string[]; descriptions: string[]
  path1?: string; path2?: string
  pin1?: string           // titolo da fissare in posizione 1 (solo se indispensabile)
  startPaused?: boolean   // gruppo creato in pausa: si accende nel giorno del calendario di lancio
  launchDay?: number
}
export interface Sitelink { text: string; desc1?: string; desc2?: string; url: string }
export interface Region { key: string; name: string; id: string; bid: number }
export interface PlanData {
  campaignName: string; utmCampaign: string
  dailyBudget: number; maxCpc: number
  regions: Region[]
  campaignNegatives: string[]
  adGroups: AdGroup[]
  sitelinks: Sitelink[]; callouts: string[]
  snippetHeader: string; snippetValues: string[]
  phone?: string
  origin?: 'preset' | 'ai' | 'template'
}
export interface Issue { level: 'error' | 'warn' | 'info'; where: string; msg: string }

// ── Zone (Criteria ID ufficiali Google Ads geotargets, regioni IT) ────
export const REGIONS_IT: Region[] = [
  { key: 'lombardia', name: 'Lombardia', id: '9053433', bid: -40 },
  { key: 'lazio', name: 'Lazio', id: '9053431', bid: 15 },
  { key: 'veneto', name: 'Veneto', id: '9053442', bid: 0 },
  { key: 'toscana', name: 'Toscana', id: '9053440', bid: 20 },
  { key: 'piemonte', name: 'Piemonte', id: '9053436', bid: 50 },
  { key: 'campania', name: 'Campania', id: '9053428', bid: 0 },
  { key: 'liguria', name: 'Liguria', id: '9053432', bid: 0 },
]

// Prezzi pubblici ammessi nei testi (IVA esclusa, listino ecura-pricing.ts / sito)
export const ALLOWED_PRICES = [390, 480, 590, 690, 840, 990]

// ── Negative: fonte Negative_Keyword_eCura.txt ────────────────────────
export const NEG_CAMPAIGN: string[] = [
  'amazon', 'ebay', 'aliexpress', 'subito.it', 'kijiji', 'temu', 'vinted', 'wish',
  'gratis', 'gratuito', 'fai da te',
  'usato', 'usata', 'ricondizionato',
  'badante', 'badanti', 'colf', 'casa di riposo', 'casa di cura', 'rsa',
  'significato', 'normativa', 'legge 104', 'invalidita', 'inps', 'wikipedia',
  'offerte di lavoro', 'cerca lavoro', 'curriculum', 'stipendio', 'concorso', 'corso', 'corsi', 'formazione',
  'app', 'apk', 'firmware', 'manuale pdf',
  'classifica', 'migliori marche', 'top 10',
]
// Solo livello gruppo G2/G3 (NON su G1, che deve intercettare "seremy recensioni")
export const NEG_COMPETITORS: string[] = [
  'seremy', 'beghelli', 'salvalavita', 'vivavox', 'tunstall', 'lifeline', 'secutel', 'philips', 'sidly', 'life alert', 'medical alert',
]
// Brand proprio: clic gia' gratuiti in posizione 1 (solo G2/G3; mai su G1)
export const NEG_OWN_BRAND: string[] = ['ecura', 'e cura', 'e-cura']

// ── Preset "Primo Lancio" (fonte Annunci_Google_Ads_Primo_Lancio.docx) ─
export function presetPrimoLancio(): PlanData {
  const kw = (m: Match, ...t: string[]): Keyword[] => t.map(text => ({ text, match: m }))
  return {
    campaignName: 'Search - eCura Iniezione Organico',
    utmCampaign: 'ecura_search_primo_lancio',
    dailyBudget: 10, maxCpc: 0.70,
    regions: REGIONS_IT.map(r => ({ ...r })),
    campaignNegatives: [...NEG_CAMPAIGN],
    origin: 'preset',
    adGroups: [
      {
        name: 'G1 Confronto', finalUrl: SITE + '/confronto-bracciali-anziani/', path1: 'confronto', path2: 'bracciali',
        keywords: kw('Phrase', 'seremy recensioni', 'confronto bracciali anziani', 'ecura vs seremy', 'bracciale seremy prezzo', 'orologio seremy recensioni', 'alternative salvavita'),
        launchDay: 1, pin1: 'Confronto Bracciali Anziani',
        negatives: [],
        headlines: ['Confronto Bracciali Anziani', 'eCura vs Seremy: Differenze', 'Leggi il Confronto Completo', 'Quale Salvavita Scegliere',
          'Prezzi Chiari e Trasparenti', 'Assistenza 24/7 Inclusa', 'Confronta Prima di Comprare', 'Bracciale Salvavita eCura',
          'Funzioni e Prezzi a Confronto', 'Scopri le Differenze', 'Nessun Costo Nascosto', 'Dispositivo Certificato CE'],
        descriptions: ['Confronta eCura con Seremy: funzioni, prezzi e assistenza a confronto.',
          'Leggi il confronto tra bracciali e servizi di assistenza prima di scegliere.',
          'Assistenza 24/7, dispositivo certificato e prezzi trasparenti. Richiedi informazioni ora.',
          'Cosa cambia davvero tra un bracciale e un servizio di assistenza.'],
      },
      {
        name: 'G2 Costi', finalUrl: SITE + '/blog/teleassistenza-anziani-come-funziona-costi/', path1: 'costi', path2: 'teleassistenza',
        keywords: kw('Phrase', 'teleassistenza anziani costi', 'quanto costa un salvavita', 'bracciale salvavita prezzo', 'costo teleassistenza anziani', 'salvavita anziani prezzo', 'canone mensile teleassistenza'),
        startPaused: true, launchDay: 4, pin1: 'Quanto Costa un Salvavita',
        negatives: [...NEG_COMPETITORS, ...NEG_OWN_BRAND],
        headlines: ['Quanto Costa un Salvavita', 'Costi Chiari, Nessuna Sorpresa', 'Teleassistenza: Prezzi 2026', 'Come Funziona e Quanto Costa',
          "Da 390 € l'Anno + IVA", 'Confronta i Costi', 'Scopri il Costo Annuale', 'Nessun Costo di Attivazione',
          'Tutto Incluso nel Canone', 'Leggi la Guida ai Costi', 'Prezzo Trasparente', 'Canone Annuale Chiaro'],
        descriptions: ['Scopri quanto costa un bracciale salvavita: canone e assistenza inclusi.',
          "Teleassistenza anziani da 390 € l'anno + IVA. Prezzi trasparenti, nessun costo nascosto.",
          'Come funziona il servizio, cosa include il canone e quanto costa attivarlo.',
          'Confronta i costi dei bracciali salvavita e capisci cosa è incluso e cosa no.'],
      },
      {
        name: 'G3 Prodotto', finalUrl: SITE + '/come-funziona-bracciale-ecura/', path1: 'bracciale', path2: 'cadute',
        keywords: [{ text: 'salvavita anziani', match: 'Exact' }, ...kw('Phrase', 'bracciale salvavita anziani', 'bracciale cadute anziani', 'bracciale sos anziani', 'orologio salvavita anziani', 'dispositivo salvavita anziani')],
        startPaused: true, launchDay: 8,
        negatives: [...NEG_COMPETITORS, ...NEG_OWN_BRAND],
        headlines: ['Bracciale Cadute Anziani', 'Rileva la Caduta e Avvisa', 'Bracciale SOS per Anziani', 'Allarme Cadute Immediato',
          'Orologio Salvavita Anziani', 'Protezione Giorno e Notte', 'Avviso Immediato alla Famiglia', 'Salvavita Certificato CE',
          'Assistenza Sempre Attiva', 'Richiedi Informazioni Gratis', 'Dispositivo Salvavita eCura', 'Pulsante SOS Sempre Attivo'],
        descriptions: ['Il bracciale rileva la caduta e avvisa subito la famiglia e il centro assistenza.',
          'Bracciale SOS con pulsante di emergenza e rilevamento cadute. Assistenza 24 ore su 24.',
          'Orologio e bracciale salvavita per anziani: protezione continua, dentro e fuori casa.',
          'Dispositivo medico certificato con operatore sempre raggiungibile. Scopri come funziona.'],
      },
    ],
    sitelinks: [
      { text: 'Come funziona', desc1: 'Rileva cadute e avvisa subito', desc2: 'Il servizio passo dopo passo', url: SITE + '/come-funziona-bracciale-ecura/' },
      { text: 'Prezzi e canoni', desc1: 'Costi chiari, tutto spiegato', desc2: 'Cosa include il canone', url: SITE + '/blog/teleassistenza-anziani-come-funziona-costi/' },
      { text: 'Confronto bracciali', desc1: 'eCura a confronto con Seremy', desc2: 'Differenze e prezzi', url: SITE + '/confronto-bracciali-anziani/' },
      { text: 'Recensioni a confronto', desc1: 'eCura, Seremy e Beghelli', desc2: 'Cosa dicono le recensioni', url: SITE + '/recensioni-ecura-seremy-beghelli/' },
    ],
    callouts: ['Assistenza 24/7', 'Dispositivo certificato', 'Nessun costo nascosto', 'Attivazione rapida'],
    snippetHeader: 'Services',
    snippetValues: ['Teleassistenza', 'Allarme cadute', 'Monitoraggio', 'Assistenza anziani'],
    phone: '+39 335 730 1206',
  }
}

// ── Utility testo ─────────────────────────────────────────────────────
const norm = (s: string) => (s || '').toLowerCase().replace(/["'\[\]]/g, '').replace(/\s+/g, ' ').trim()
const tokens = (s: string) => norm(s).split(/[\s]+/).filter(Boolean)
const slug = (s: string) => norm(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
export { slug as slugify }

function phraseContained(neg: string, kw: string): boolean {
  const n = tokens(neg), k = tokens(kw)
  if (!n.length || n.length > k.length) return false
  for (let i = 0; i <= k.length - n.length; i++) {
    let ok = true
    for (let j = 0; j < n.length; j++) if (k[i + j] !== n[j]) { ok = false; break }
    if (ok) return true
  }
  return false
}

// ── LINT ──────────────────────────────────────────────────────────────
const COMPETITOR_RE = /seremy|beghelli|vivavox|tunstall|lifeline|secutel|philips|televita|salvalavita/i
const CLAIM_RULES: Array<{ re: RegExp; msg: string }> = [
  { re: /verificat/i, msg: 'Claim "verificate/i": oggi non esiste una pagina di recensioni clienti verificate (la pagina collegata è un confronto). Rischio annuncio ingannevole.' },
  { re: /recensioni (reali|clienti)/i, msg: 'Claim "recensioni reali/clienti": la pagina di destinazione non raccoglie recensioni clienti. Valuta "Recensioni a confronto".' },
  { re: /\b(unico|unica|migliore|migliori|numero 1|n\. ?1|primo)\b/i, msg: 'Superlativo/esclusività non dimostrabile: Google lo richiede documentato in pagina.' },
  { re: /garantit|garanzia/i, msg: 'Claim di garanzia: usalo solo se coincide con la condizione pubblicata sul sito.' },
  { re: /rimbors|inps/i, msg: 'Rimborsi/INPS: non confermati in pagina, evitare.' },
  { re: /\d[\d.]*\s?(famiglie|clienti|utenti)/i, msg: 'Numero di clienti/famiglie senza fonte pubblica.' },
  { re: /\b\d+\s?(sec|secondi)\b/i, msg: 'Tempo di rilevamento/intervento promesso: non documentato.' },
  { re: /guar[ia]|diagnos|cura(re)? (la|le|il)\b/i, msg: 'Linguaggio sanitario: Google applica regole stringenti agli annunci di salute.' },
]

function priceIssues(text: string): string[] {
  const out: string[] = []
  const re = /(\d{1,3}(?:[.,]\d{1,2})?)\s?(?:€|euro)|(?:€)\s?(\d{1,3}(?:[.,]\d{1,2})?)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const v = parseFloat((m[1] || m[2]).replace(',', '.'))
    if (!ALLOWED_PRICES.includes(v)) out.push(m[0].trim())
  }
  return out
}

export function lintPlan(p: PlanData, knownUrls?: Set<string>): Issue[] {
  const I: Issue[] = []
  const add = (level: Issue['level'], where: string, msg: string) => I.push({ level, where, msg })

  if (!(p.dailyBudget > 0)) add('error', 'Campagna', 'Budget giornaliero non valido')
  if (!(p.maxCpc > 0)) add('error', 'Campagna', 'CPC massimo non valido')
  if (!p.regions?.length) add('error', 'Zone', 'Nessuna zona selezionata')
  if (!p.adGroups?.length) add('error', 'Campagna', 'Nessun gruppo di annunci')

  const allKw: Array<{ g: string; k: Keyword }> = []
  for (const g of p.adGroups || []) {
    const w = 'Gruppo ' + g.name
    if (!g.keywords.length) add('error', w, 'Nessuna keyword')
    if (g.headlines.length < LIMITS.headlinesMin) add('error', w, 'Servono almeno ' + LIMITS.headlinesMin + ' titoli')
    else if (g.headlines.length < 8) add('warn', w, 'Meno di 8 titoli: Google consiglia 8-15 per ottimizzare le combinazioni')
    if (g.headlines.length > LIMITS.headlinesMax) add('error', w, 'Massimo ' + LIMITS.headlinesMax + ' titoli')
    if (g.descriptions.length < LIMITS.descriptionsMin) add('error', w, 'Servono almeno ' + LIMITS.descriptionsMin + ' descrizioni')
    if (g.descriptions.length > LIMITS.descriptionsMax) add('error', w, 'Massimo ' + LIMITS.descriptionsMax + ' descrizioni')

    const seen = new Set<string>()
    g.headlines.forEach((h, i) => {
      const where = w + ' · Titolo ' + (i + 1)
      if (h.length > LIMITS.headline) add('error', where, h.length + '/' + LIMITS.headline + ' caratteri: "' + h + '"')
      if (/!/.test(h)) add('error', where, 'Il punto esclamativo non è ammesso nei titoli')
      const key = norm(h); if (seen.has(key)) add('warn', where, 'Titolo duplicato'); seen.add(key)
    })
    const seenD = new Set<string>()
    g.descriptions.forEach((d, i) => {
      const where = w + ' · Descrizione ' + (i + 1)
      if (d.length > LIMITS.description) add('error', where, d.length + '/' + LIMITS.description + ' caratteri')
      const key = norm(d); if (seenD.has(key)) add('warn', where, 'Descrizione duplicata'); seenD.add(key)
    })
    if (g.pin1 && !g.headlines.some(h => norm(h) === norm(g.pin1 as string))) add('error', w, 'Il titolo fissato non è tra i titoli: "' + g.pin1 + '"')
    ;[g.path1, g.path2].forEach((x, i) => { if (x && x.length > LIMITS.path) add('error', w + ' · Path ' + (i + 1), x.length + '/' + LIMITS.path + ' caratteri') })

    const text = [...g.headlines, ...g.descriptions].join(' | ')
    if (/sidly/i.test(text)) add('error', w, 'Marca/modello del dispositivo (riservato) presente nel testo pubblico')
    for (const bad of priceIssues(text)) add('error', w, 'Prezzo "' + bad + '" non presente nel listino (ammessi: ' + ALLOWED_PRICES.join(', ') + ' € IVA esclusa)')
    const reported = new Set<string>()
    for (const r of CLAIM_RULES) if (r.re.test(text) && !reported.has(r.msg)) { reported.add(r.msg); add('warn', w, r.msg) }
    if (COMPETITOR_RE.test(text)) add('warn', w, 'Marchio di terzi nel testo dell\'annuncio: possibile reclamo per marchio. Ammesso nei keyword, più rischioso nel testo.')

    if (!g.finalUrl.startsWith(SITE + '/')) add('error', w, 'URL finale fuori da ' + SITE)
    else if (knownUrls && knownUrls.size && !knownUrls.has(g.finalUrl)) add('error', w, 'URL finale non presente nella sitemap: ' + g.finalUrl)

    for (const k of g.keywords) {
      allKw.push({ g: g.name, k })
      if (/^e[- ]?cura(\s+(bracciale|it|sito))?$/.test(norm(k.text))) add('warn', w, 'Keyword di brand "' + k.text + '": sei già primo in organico, il clic sarebbe gratuito')
      if (k.match === 'Broad') add('info', w, 'Keyword "' + k.text + '" in corrispondenza generica: con 10 €/giorno consuma budget su query poco pertinenti')
      const negs = [...p.campaignNegatives, ...g.negatives]
      for (const n of negs) if (phraseContained(n, k.text)) add('error', w, 'La keyword "' + k.text + '" è bloccata dalla negativa "' + n + '": il gruppo non partirebbe')
    }
  }
  const byText = new Map<string, string>()
  for (const { g, k } of allKw) {
    const key = norm(k.text) + '|' + k.match
    if (byText.has(key) && byText.get(key) !== g) add('warn', 'Keyword', '"' + k.text + '" presente in due gruppi (' + byText.get(key) + ', ' + g + '): i gruppi si fanno concorrenza')
    byText.set(key, g)
  }

  p.sitelinks.forEach((s, i) => {
    const w = 'Sitelink ' + (i + 1)
    if (s.text.length > LIMITS.sitelinkText) add('error', w, s.text.length + '/' + LIMITS.sitelinkText + ' caratteri')
    ;[s.desc1, s.desc2].forEach(d => { if (d && d.length > LIMITS.sitelinkDesc) add('error', w, 'Descrizione ' + d.length + '/' + LIMITS.sitelinkDesc + ' caratteri') })
    if (!s.url.startsWith(SITE + '/')) add('error', w, 'URL fuori dal sito')
    else if (knownUrls && knownUrls.size && !knownUrls.has(s.url)) add('error', w, 'URL non presente nella sitemap: ' + s.url)
    if (COMPETITOR_RE.test(s.text + ' ' + (s.desc1 || '') + ' ' + (s.desc2 || ''))) add('warn', w, 'Marchio di terzi nel sitelink')
  })
  if (p.sitelinks.length && p.sitelinks.length < 4) add('info', 'Sitelink', 'Google consiglia almeno 4 sitelink')
  p.callouts.forEach((c, i) => { if (c.length > LIMITS.callout) add('error', 'Callout ' + (i + 1), c.length + '/' + LIMITS.callout + ' caratteri') })
  p.snippetValues.forEach((c, i) => { if (c.length > LIMITS.snippet) add('error', 'Snippet ' + (i + 1), c.length + '/' + LIMITS.snippet + ' caratteri') })
  if (p.snippetValues.length && p.snippetValues.length < 3) add('error', 'Snippet', 'Servono almeno 3 valori')
  if (p.phone && !/^\+39 ?\d[\d ]{7,12}$/.test(p.phone)) add('warn', 'Chiamata', 'Numero non in formato +39…')
  for (const r of p.regions || []) if (r.bid < -90 || r.bid > 900) add('error', 'Zone', 'Modificatore offerta fuori intervallo per ' + r.name)

  // Display/Partner: il CSV imposta solo Rete di ricerca Google
  add('info', 'Rete', 'Il file imposta solo "Google Search" (Display e Search Partners esclusi) e strategia "Massimizza clic" con CPC max ' + p.maxCpc.toFixed(2) + ' €')
  return I
}

// ── CSV Google Ads Editor ─────────────────────────────────────────────
const H_COLS = Array.from({ length: 15 }, (_, i) => 'Headline ' + (i + 1))
const D_COLS = Array.from({ length: 4 }, (_, i) => 'Description ' + (i + 1))
const P_COLS = ['Headline 1 position', 'Headline 2 position', 'Headline 3 position', 'Headline 4 position', 'Headline 5 position', 'Headline 6 position', 'Headline 7 position', 'Headline 8 position', 'Headline 9 position', 'Headline 10 position', 'Headline 11 position', 'Headline 12 position', 'Headline 13 position', 'Headline 14 position', 'Headline 15 position']
export const CSV_COLUMNS = [
  'Campaign', 'Campaign Type', 'Campaign Status', 'Campaign Daily Budget', 'Bid Strategy Type', 'Maximum CPC bid limit',
  'Networks', 'Languages', 'Final URL Suffix', 'Location ID', 'Bid Modifier',
  'Ad Group', 'Ad Group Status', 'Max CPC', 'Keyword', 'Criterion Type', 'Status',
  'Ad Type', ...H_COLS, ...D_COLS, ...P_COLS, 'Path 1', 'Path 2', 'Final URL',
  'Link Text', 'Description Line 1', 'Description Line 2', 'Callout Text', 'Header', 'Snippet Values', 'Phone Number', 'Country Code',
]
const csvCell = (v: any) => { const s = String(v ?? ''); return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

export function buildEditorCsv(p: PlanData, opts: { assets?: boolean } = {}): string {
  const assets = opts.assets !== false
  const rows: Array<Record<string, any>> = []
  const camp = p.campaignName
  const suffix = 'utm_source=google&utm_medium=cpc&utm_campaign=' + (p.utmCampaign || slug(camp)) + '&utm_term={keyword}&utm_content={adgroupid}'

  rows.push({
    'Campaign': camp, 'Campaign Type': 'Search', 'Campaign Status': 'Paused',   // SEMPRE in pausa
    'Campaign Daily Budget': p.dailyBudget.toFixed(2), 'Bid Strategy Type': 'Maximize clicks',
    'Maximum CPC bid limit': p.maxCpc.toFixed(2), 'Networks': 'Google Search', 'Languages': 'it', 'Final URL Suffix': suffix,
  })
  for (const r of p.regions) rows.push({ 'Campaign': camp, 'Location ID': r.id, 'Bid Modifier': r.bid ? (r.bid > 0 ? '+' : '') + r.bid + '%' : '' })
  for (const n of p.campaignNegatives) rows.push({ 'Campaign': camp, 'Keyword': n, 'Criterion Type': 'Negative Phrase' })
  for (const g of p.adGroups) {
    rows.push({ 'Campaign': camp, 'Ad Group': g.name, 'Ad Group Status': g.startPaused ? 'Paused' : 'Enabled', 'Max CPC': p.maxCpc.toFixed(2) })
    for (const k of g.keywords) rows.push({ 'Campaign': camp, 'Ad Group': g.name, 'Keyword': k.text, 'Criterion Type': k.match, 'Status': 'Enabled' })
    for (const n of g.negatives) rows.push({ 'Campaign': camp, 'Ad Group': g.name, 'Keyword': n, 'Criterion Type': 'Negative Phrase' })
    const ad: Record<string, any> = { 'Campaign': camp, 'Ad Group': g.name, 'Ad Type': 'Responsive search ad', 'Path 1': g.path1 || '', 'Path 2': g.path2 || '', 'Final URL': g.finalUrl, 'Status': 'Enabled' }
    g.headlines.slice(0, 15).forEach((h, i) => { ad[H_COLS[i]] = h; if (g.pin1 && norm(h) === norm(g.pin1)) ad[P_COLS[i]] = '1' })
    g.descriptions.slice(0, 4).forEach((d, i) => { ad[D_COLS[i]] = d })
    rows.push(ad)
  }
  if (assets) {
    for (const s of p.sitelinks) rows.push({ 'Campaign': camp, 'Link Text': s.text, 'Description Line 1': s.desc1 || '', 'Description Line 2': s.desc2 || '', 'Final URL': s.url, 'Status': 'Enabled' })
    for (const c of p.callouts) rows.push({ 'Campaign': camp, 'Callout Text': c, 'Status': 'Enabled' })
    if (p.snippetValues.length >= 3) rows.push({ 'Campaign': camp, 'Header': p.snippetHeader || 'Services', 'Snippet Values': p.snippetValues.join(';'), 'Status': 'Enabled' })
    if (p.phone) rows.push({ 'Campaign': camp, 'Phone Number': p.phone, 'Country Code': 'IT', 'Status': 'Enabled' })
  }
  const lines = [CSV_COLUMNS.map(csvCell).join(',')]
  for (const r of rows) lines.push(CSV_COLUMNS.map(c => csvCell(r[c])).join(','))
  return '\ufeff' + lines.join('\r\n') + '\r\n'
}

// ── Previsioni ────────────────────────────────────────────────────────
export function forecast(budgetDay: number, cpcMin: number, cpcMax: number, crMin: number, crMax: number, days = 30.4) {
  const spend = budgetDay * days
  const clicksMin = spend / cpcMax, clicksMax = spend / cpcMin
  return {
    spendMonth: Math.round(spend),
    clicks: [Math.round(clicksMin), Math.round(clicksMax)],
    leads: [Math.round(clicksMin * crMin), Math.round(clicksMax * crMax)],
    cpl: [+(cpcMin / crMax).toFixed(1), +(cpcMax / crMin).toFixed(1)],
  }
}

// ── CSV parsing generico (report Google Ads, delimitatori , ; tab) ─────
export function parseCsv(text: string): string[][] {
  text = text.replace(/^\ufeff/, '')
  const first = text.split(/\r?\n/).slice(0, 5).join('\n')
  const delim = [['\t', (first.match(/\t/g) || []).length], [';', (first.match(/;/g) || []).length], [',', (first.match(/,/g) || []).length]]
    .sort((a: any, b: any) => b[1] - a[1])[0][0] as string
  const rows: string[][] = []; let row: string[] = []; let cur = ''; let q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) { if (c === '"') { if (text[i + 1] === '"') { cur += '"'; i++ } else q = false } else cur += c }
    else if (c === '"') q = true
    else if (c === delim) { row.push(cur); cur = '' }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cur); cur = ''; if (row.some(x => x.trim() !== '')) rows.push(row); row = [] }
    else cur += c
  }
  if (cur !== '' || row.length) { row.push(cur); if (row.some(x => x.trim() !== '')) rows.push(row) }
  return rows
}
export function parseNum(s: string): number {
  let t = String(s ?? '').replace(/[^\d.,\-]/g, '')
  if (!t) return 0
  if (t.includes(',') && t.includes('.')) t = t.lastIndexOf(',') > t.lastIndexOf('.') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '')
  else if (t.includes(',')) t = t.replace(',', '.')
  const n = parseFloat(t); return isNaN(n) ? 0 : n
}

// ── Analisi report "Termini di ricerca" ───────────────────────────────
const IRRELEVANT_THEMES = ['gratis', 'gratuito', 'usato', 'lavoro', 'offerte di lavoro', 'corso', 'corsi', 'amazon', 'ebay', 'subito', 'badante', 'colf', 'wikipedia', 'pdf', 'apk', 'download']
export interface TermRow { term: string; clicks: number; impr: number; cost: number; conv: number }
export function analyzeSearchTerms(csv: string, minClicks = 15) {
  const rows = parseCsv(csv)
  const hi = rows.findIndex(r => r.some(c => /^(search term|termine di ricerca|query)/i.test(c.trim())))
  if (hi < 0) return { error: 'Intestazione non riconosciuta: serve la colonna "Termine di ricerca" (o "Search term")', terms: [] as TermRow[], negatives: [] as any[], review: [] as any[], noConvData: false, watch: [] as any[], totals: null as any }
  const head = rows[hi].map(c => c.trim().toLowerCase())
  const col = (re: RegExp) => head.findIndex(h => re.test(h))
  const iT = col(/^(search term|termine di ricerca|query)/), iC = col(/^(clicks|clic)/), iI = col(/^(impr)/), iCost = col(/^(cost|costo)/), iConv = col(/^(conversions|conversioni)/)
  const terms: TermRow[] = []
  for (const r of rows.slice(hi + 1)) {
    const term = (r[iT] || '').trim()
    if (!term || /^total|^totale/i.test(term)) continue
    terms.push({ term, clicks: iC >= 0 ? parseNum(r[iC]) : 0, impr: iI >= 0 ? parseNum(r[iI]) : 0, cost: iCost >= 0 ? parseNum(r[iCost]) : 0, conv: iConv >= 0 ? parseNum(r[iConv]) : 0 })
  }
  // Regola del piano: 0 conversioni e almeno N clic -> negativa; non decidere senza dati.
  // Se in Google Ads non c'e' alcuna conversione registrata, la regola non e' affidabile:
  // ogni termine risulterebbe "da escludere". In quel caso si propone solo una revisione manuale.
  const noConvData = terms.length > 0 && terms.every(t => t.conv === 0) && !(iConv >= 0 && terms.some(t => t.conv > 0))
  const candidates = terms.filter(t => t.conv === 0 && t.clicks >= minClicks).sort((a, b) => b.cost - a.cost)
  const negatives = noConvData ? [] : candidates.map(t => ({ ...t, reason: '0 conversioni e ' + t.clicks + ' clic (soglia ' + minClicks + ')' }))
  const review = noConvData ? candidates.map(t => ({ ...t, reason: 'Nessuna conversione tracciata in Google Ads: valuta a mano se il termine e\' pertinente' })) : []
  const watch = terms.filter(t => !negatives.includes(t as any) && t.conv === 0 && t.clicks >= 1 && IRRELEVANT_THEMES.some(th => phraseContained(th, t.term)))
    .map(t => ({ ...t, reason: 'Contiene un tema già escluso a livello di campagna: verifica che la negativa sia attiva' }))
  const totals = { terms: terms.length, clicks: terms.reduce((a, t) => a + t.clicks, 0), cost: +terms.reduce((a, t) => a + t.cost, 0).toFixed(2), conv: terms.reduce((a, t) => a + t.conv, 0), wasted: +(noConvData ? review : negatives).reduce((a, t) => a + t.cost, 0).toFixed(2) }
  return { error: null as any, terms, negatives, review, noConvData, watch, totals }
}

// ── Estrazione dati pagina (sito ecura) ───────────────────────────────
const strip = (s: string) => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
export function parseSitemap(xml: string): string[] {
  const out: string[] = []; const re = /<loc>\s*([^<\s]+)\s*<\/loc>/g; let m: RegExpExecArray | null
  while ((m = re.exec(xml))) out.push(m[1])
  return out
}
export function extractPageInfo(html: string, url: string) {
  const g = (re: RegExp) => { const m = html.match(re); return m ? strip(m[1]) : '' }
  const title = g(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const dm = html.match(/<meta[^>]+name=["']description["'][^>]*>/i)
  const description = dm ? ((dm[0].match(/content=["']([^"']*)["']/i) || [])[1] || '') : ''
  const cm = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)
  const canonical = cm ? ((cm[0].match(/href=["']([^"']*)["']/i) || [])[1] || '') : ''
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => strip(m[1])).filter(Boolean)
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => strip(m[1])).filter(Boolean).slice(0, 12)
  const types = new Set<string>(); const faq: Array<{ q: string; a: string }> = []
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n: any) => {
        if (!n || typeof n !== 'object') return
        if (Array.isArray(n)) return n.forEach(walk)
        const t = n['@type']; (Array.isArray(t) ? t : t ? [t] : []).forEach((x: string) => types.add(x))
        if (t === 'FAQPage' && Array.isArray(n.mainEntity)) for (const q of n.mainEntity) faq.push({ q: String(q.name || ''), a: strip(String(q.acceptedAnswer?.text || '')) })
        Object.values(n).forEach(walk)
      }
      walk(JSON.parse(m[1]))
    } catch (_) { /* JSON-LD non valido: lo segnala l'audit */ }
  }
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)].map(m => m[0])
  const imgsNoAlt = imgs.filter(i => !/\balt=["'][^"']+["']/i.test(i)).length
  const hrefs = new Set([...html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)].map(m => m[1]).filter(h => h.startsWith('/') || h.includes('ecura.it')))
  const body = strip(html.replace(/<(header|nav|footer)[\s\S]*?<\/\1>/gi, ' '))
  const path = url.replace(SITE, '')
  return {
    url, kind: /^\/blog\/.+/.test(path) ? 'blog' : path === '/' ? 'home' : 'guida',
    title, description, canonical, h1s, h2s, types: [...types], faq, words: body.split(' ').length,
    imgs: imgs.length, imgsNoAlt, internal: hrefs.size, noindex: /<meta[^>]+robots[^>]+noindex/i.test(html),
  }
}
export function auditPage(p: any): Issue[] {
  const I: Issue[] = []; const w = p.url.replace(SITE, '') || '/'
  const a = (level: Issue['level'], msg: string) => I.push({ level, where: w, msg })
  if (!p.title) a('error', 'Title mancante'); else if (p.title.length > 60) a('warn', 'Title di ' + p.title.length + ' caratteri (oltre 60 viene troncato)'); else if (p.title.length < 30) a('warn', 'Title corto (' + p.title.length + ')')
  if (!p.description) a('error', 'Meta description mancante'); else if (p.description.length > 160) a('warn', 'Description di ' + p.description.length + ' caratteri (oltre 160 viene troncata)'); else if (p.description.length < 70) a('warn', 'Description corta (' + p.description.length + ')')
  if (p.h1s.length !== 1) a(p.h1s.length ? 'warn' : 'error', p.h1s.length ? p.h1s.length + ' H1 nella pagina (ne serve 1)' : 'H1 mancante')
  if (!p.canonical) a('warn', 'Canonical mancante'); else if (p.canonical.replace(/\/$/, '') !== p.url.replace(/\/$/, '')) a('warn', 'Canonical diverso dall\'URL: ' + p.canonical)
  if (p.noindex) a('error', 'Pagina con noindex')
  if (!p.types.length) a('warn', 'Nessun dato strutturato JSON-LD')
  if (p.kind === 'blog' && !p.faq.length) a('info', 'Nessuna FAQ strutturata (utile per risposte AI/featured snippet)')
  if (p.words < 300 && p.kind !== 'home') a('warn', 'Contenuto breve (' + p.words + ' parole)')
  if (p.imgsNoAlt) a('warn', p.imgsNoAlt + ' immagini senza testo alternativo')
  if (p.internal < 3) a('info', 'Pochi link interni (' + p.internal + ')')
  return I
}

// ── Generazione: template (senza AI) e prompt/validazione AI ──────────
export const BRAND_RULES = [
  'Il servizio si chiama eCura: è un servizio di teleassistenza per anziani che si avvale di un dispositivo medico certificato Classe IIA. Mai nominare marca o modello del dispositivo.',
  'Prezzi: l\'unico prezzo citabile è "da 390 € l\'anno + IVA". Nessun altro importo.',
  'Vietati: superlativi ("il migliore", "unico", "numero 1"), numeri di clienti/famiglie, "rimborsabile", INPS, garanzie, tempi promessi in secondi, "recensioni verificate", promesse sanitarie.',
  'Nessun punto esclamativo nei titoli. Tono rassicurante, concreto, in italiano, rivolto a figli/caregiver.',
  'Non usare marchi di concorrenti nei testi.',
]
export function slugFromUrl(url: string) { return slug(url.replace(SITE, '').replace(/\/$/, '').split('/').pop() || 'home') }

export function templatePlanFromPage(page: { url: string; title?: string; h1s?: string[] }, base: PlanData): PlanData {
  const topic = (page.h1s && page.h1s[0]) || (page.title || '').split(/[|\u2013\u2014-]/)[0].trim() || slugFromUrl(page.url).replace(/_/g, ' ')
  const short = (s: string, n: number) => s.length <= n ? s : s.slice(0, n).replace(/\s+\S*$/, '')
  const bank = ['Teleassistenza per Anziani', 'Bracciale con Rilevamento Cadute', 'Assistenza 24 Ore su 24', 'Avviso Immediato alla Famiglia',
    "Da 390 € l'Anno + IVA", 'Nessun Costo di Attivazione', 'Richiedi Informazioni Gratis', 'Dispositivo Medico Certificato']
  const t = short(topic, 30)
  const headlines = [t, ...bank].filter((h, i, a) => h.length <= LIMITS.headline && a.indexOf(h) === i)
  const kwBase = norm(topic).replace(/[^a-z0-9àèéìòù ]/g, ' ').replace(/\s+/g, ' ').trim()
  return {
    ...base, campaignName: 'eCura | Search | ' + short(topic, 40), utmCampaign: 'ecura_search_' + slugFromUrl(page.url), origin: 'template',
    adGroups: [{
      name: short(topic, 40), finalUrl: page.url, path1: 'teleassistenza', path2: 'anziani',
      keywords: [{ text: kwBase, match: 'Phrase' }], negatives: [...NEG_COMPETITORS, ...NEG_OWN_BRAND],
      headlines,
      descriptions: ['Servizio di teleassistenza per anziani con bracciale, GPS e centrale operativa sempre attiva.',
        'Scopri come funziona eCura e richiedi informazioni senza impegno.'],
    }],
  }
}

export function buildAiPrompt(page: { url: string; title?: string; description?: string; h1s?: string[]; h2s?: string[]; faq?: Array<{ q: string; a: string }> }) {
  const sys = 'Sei un esperto di Google Ads Search in italiano per il settore teleassistenza anziani. Rispondi SOLO con JSON valido.\nREGOLE OBBLIGATORIE:\n- ' + BRAND_RULES.join('\n- ') +
    '\n- Titoli: massimo ' + LIMITS.headline + ' caratteri ciascuno (conta i caratteri). Descrizioni: massimo ' + LIMITS.description + '. Path: massimo ' + LIMITS.path + ', minuscolo, senza spazi.' +
    '\n- Produci 12 titoli diversi, 4 descrizioni, da 4 a 6 keyword (frasi di ricerca realistiche con intento commerciale/informativo coerente con la pagina), 2 path.'
  const user = 'PAGINA DI DESTINAZIONE: ' + page.url + '\nTitolo: ' + (page.title || '') + '\nDescrizione: ' + (page.description || '') +
    '\nH1: ' + (page.h1s || []).join(' / ') + '\nSezioni: ' + (page.h2s || []).slice(0, 8).join(' / ') +
    '\nFAQ: ' + (page.faq || []).slice(0, 5).map(f => f.q).join(' / ') +
    '\n\nRestituisci JSON: {"adGroupName": string, "keywords": [string], "headlines": [string], "descriptions": [string], "path1": string, "path2": string}'
  return { sys, user }
}

export function sanitizeAiGroup(raw: any, page: { url: string }): { group: AdGroup | null; dropped: string[] } {
  const dropped: string[] = []
  const clean = (arr: any, max: number) => {
    const out: string[] = []
    for (const x of Array.isArray(arr) ? arr : []) {
      const s = String(x || '').replace(/\s+/g, ' ').trim()
      if (!s) continue
      if (s.length > max || /!/.test(s) && max === LIMITS.headline || /sidly/i.test(s) || priceIssues(s).length) { dropped.push(s); continue }
      if (!out.some(o => norm(o) === norm(s))) out.push(s)
    }
    return out
  }
  const headlines = clean(raw?.headlines, LIMITS.headline).slice(0, 15)
  const descriptions = clean(raw?.descriptions, LIMITS.description).slice(0, 4)
  const keywords = (Array.isArray(raw?.keywords) ? raw.keywords : []).map((k: any) => norm(String(k))).filter((k: string) => k && k.split(' ').length <= 6 && !/sidly/.test(k))
    .filter((k: string, i: number, a: string[]) => a.indexOf(k) === i).slice(0, 8).map((text: string) => ({ text, match: 'Phrase' as Match }))
  const p = (x: any) => String(x || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, LIMITS.path)
  if (headlines.length < LIMITS.headlinesMin || descriptions.length < LIMITS.descriptionsMin || !keywords.length) return { group: null, dropped }
  return { group: { name: String(raw?.adGroupName || 'Gruppo').slice(0, 40), finalUrl: page.url, keywords, negatives: [...NEG_COMPETITORS, ...NEG_OWN_BRAND], headlines, descriptions, path1: p(raw?.path1), path2: p(raw?.path2) }, dropped }
}

// ── Opportunità da Search Console ─────────────────────────────────────
export function gscOpportunities(rows: Array<{ keys: string[]; clicks: number; impressions: number; position: number }>) {
  const isBrand = (q: string) => /^e[- ]?cur(a|e)(\s|$)/.test(q.toLowerCase())
  const out = rows.map(r => {
    const key = r.keys[0] || ''
    const brand = isBrand(key)
    let verdict: 'NO_ADS' | 'ADS' | 'SEO' | 'OK'
    if (brand && r.position <= 3.5) verdict = 'NO_ADS'
    else if (r.position >= 4 && r.position <= 20 && r.impressions >= 50) verdict = 'ADS'
    else if (r.position > 20 && r.impressions >= 100) verdict = 'SEO'
    else verdict = 'OK'
    const lostClicks = verdict === 'ADS' ? Math.round(r.impressions * (0.28 - (r.clicks / Math.max(r.impressions, 1)))) : 0
    return { key, brand, clicks: r.clicks, impressions: r.impressions, position: +r.position.toFixed(1), verdict, lostClicks: Math.max(lostClicks, 0) }
  })
  return out.sort((a, b) => b.impressions - a.impressions)
}
