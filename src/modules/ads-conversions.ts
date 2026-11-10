// Export delle conversioni offline per Google Ads: SOLO lead qualificati (default) oppure tutti (?tutti=1).
// Una sola definizione di «qualificato»: qualifiedSql() / QUALIFIED_LEAD di seo-report-engine (nessuna copia qui).
// Nessun upload automatico: il CSV lo carica a mano l'utente in Google Ads.
import { qualifiedSql } from './seo-report-engine'

export type ClickKind = 'gclid' | 'gbraid' | 'wbraid'
export const CLICK_KINDS: Array<{ key: ClickKind; header: string }> = [
  { key: 'gclid', header: 'Google Click ID' },
  { key: 'gbraid', header: 'Gbraid' },
  { key: 'wbraid', header: 'Wbraid' },
]
export const LAST_UPLOAD_KEY = 'ads_last_conversion_upload'

export interface ConvLead {
  id: string | number
  gclid?: string | null; gbraid?: string | null; wbraid?: string | null
  click_ts?: number | string | null
  created_at?: string | null; updated_at?: string | null
  q?: number | boolean | null           // flag «qualificato» calcolato in SQL da qualifiedSql()
  prezzo_scontato?: number | null; prezzo_anno?: number | null
}
export interface ConvRow { clickId: string; leadId: string; convMs: number; value: string; qualified: boolean }

/** Prezzo noto del piano: prezzo effettivamente applicato (scontato) se > 0, altrimenti prezzo annuo > 0, altrimenti VUOTO. */
export function planValue(l: Pick<ConvLead, 'prezzo_scontato' | 'prezzo_anno'>): string {
  const a = Number(l.prezzo_scontato), b = Number(l.prezzo_anno)
  const v = Number.isFinite(a) && a > 0 ? a : (Number.isFinite(b) && b > 0 ? b : NaN)
  return Number.isFinite(v) ? v.toFixed(2) : ''
}

/** Un record per click ID (la data più vecchia vince); l'ora di conversione è sempre successiva al click. */
export function buildConversionRows(leads: ConvLead[], kind: ClickKind, now = Date.now()): ConvRow[] {
  const best = new Map<string, ConvRow>()
  for (const l of leads) {
    const id = String((l as any)[kind] || '').trim()
    if (!id) continue
    const clickMs = Number(l.click_ts)
    if (!Number.isFinite(clickMs)) continue
    let convMs = Date.parse(String(l.updated_at || l.created_at || '').replace(' ', 'T') + (/[zZ]|[+-]\d\d:?\d\d$/.test(String(l.updated_at || l.created_at || '')) ? '' : 'Z'))
    if (!Number.isFinite(convMs) || convMs <= clickMs) convMs = clickMs + 60000
    if (convMs > now) convMs = now - 60000
    const row: ConvRow = { clickId: id, leadId: String(l.id), convMs, value: planValue(l), qualified: !!Number(l.q) }
    const prev = best.get(id)
    if (!prev || row.convMs < prev.convMs) best.set(id, row)
  }
  return [...best.values()].sort((a, b) => a.convMs - b.convMs)
}

const fmtTime = (ms: number) => new Date(ms).toISOString().slice(0, 19).replace('T', ' ') + '+00:00'
const esc = (v: any) => { const t = String(v ?? ''); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t }

/** CSV nel formato del template Google Ads. Valore e valuta restano VUOTI se il prezzo del piano non è noto. */
export function buildConversionCsv(rows: ConvRow[], kind: ClickKind, name: string): string {
  const header = CLICK_KINDS.find(k => k.key === kind)!.header
  return ['Parameters:TimeZone=+0000', [header, 'Conversion Name', 'Conversion Time', 'Conversion Value', 'Conversion Currency'].join(',')]
    .concat(rows.map(r => [r.clickId, name, fmtTime(r.convMs), r.value, r.value ? 'EUR' : ''].map(esc).join(',')))
    .join('\n')
}

export function conversionFileName(kind: ClickKind, tutti: boolean, n: number): string {
  return `ecura-offline-conversions-${kind}_${tutti ? 'tutti' : 'qualificati'}_${n}.csv`
}

export interface ConversionExport {
  kind: ClickKind; tutti: boolean; giorni: number
  rows: ConvRow[]                 // righe che finiscono nel CSV (= quelle conteggiate in `qualified` se tutti=false)
  qualified: number               // lead qualificati con click ID (stesso tipo) nel periodo = righe del CSV in modalità qualificati
  withClickId: number             // lead con click ID (stesso tipo) nel periodo, qualificati o no
  leadsPeriod: number | null      // tutti i lead creati nel periodo
  valued: number                  // righe con valore noto
  csv: string; fileName: string
}

async function hasCols(db: any, cols: string[]): Promise<Record<string, boolean>> {
  const out: Record<string, boolean> = {}; cols.forEach(c => { out[c] = false })
  try { const r = await db.prepare(`SELECT name FROM pragma_table_info('leads')`).all(); for (const x of ((r.results || []) as any[])) if (x.name in out) out[x.name] = true } catch (_) { /* colonne assenti */ }
  return out
}

export async function loadConversionExport(db: any, o: { kind?: string; giorni?: number; tutti?: boolean; name?: string }): Promise<ConversionExport> {
  const kind = (CLICK_KINDS.find(k => k.key === o.kind) || CLICK_KINDS[0]).key
  const giorni = Math.min(90, Math.max(1, Math.floor(Number(o.giorni)) || 90))
  const tutti = !!o.tutti
  const name = (o.name || 'Lead qualificato eCura').slice(0, 100)
  const minTs = Date.now() - giorni * 864e5
  const c = await hasCols(db, ['prezzo_anno', 'prezzo_scontato'])
  // Click ID dalla tabella laterale lead_attribution; colonne di `leads` elencate una a una (mai `l.*`: leads è a 100 colonne)
  const { results } = await db.prepare(`
    SELECT l.id AS id, a.gclid AS gclid, a.gbraid AS gbraid, a.wbraid AS wbraid, a.click_ts AS click_ts, l.created_at AS created_at, l.updated_at AS updated_at,
           ${c.prezzo_scontato ? 'l.prezzo_scontato' : 'NULL'} AS prezzo_scontato, ${c.prezzo_anno ? 'l.prezzo_anno' : 'NULL'} AS prezzo_anno,
           CASE WHEN ${qualifiedSql('l')} THEN 1 ELSE 0 END AS q
      FROM leads l JOIN lead_attribution a ON a.lead_id = l.id
     WHERE (a.${kind} IS NOT NULL AND a.${kind} != '') AND a.click_ts IS NOT NULL AND a.click_ts >= ?
     ORDER BY l.updated_at DESC
     LIMIT 5000
  `).bind(minTs).all()
  const all = buildConversionRows((results || []) as ConvLead[], kind)
  const qual = all.filter(r => r.qualified)
  const rows = tutti ? all : qual
  let leadsPeriod: number | null = null
  try {
    const since = new Date(minTs).toISOString().slice(0, 19).replace('T', ' ')
    const r: any = await db.prepare(`SELECT COUNT(*) AS n FROM leads WHERE created_at >= ?`).bind(since).first()
    leadsPeriod = Number(r?.n ?? 0)
  } catch (_) { leadsPeriod = null }
  return {
    kind, tutti, giorni, rows, qualified: qual.length, withClickId: all.length, leadsPeriod,
    valued: rows.filter(r => r.value).length,
    csv: buildConversionCsv(rows, kind, name), fileName: conversionFileName(kind, tutti, rows.length),
  }
}

/** Riga di stato «ultimo upload di conversioni»: data inserita a mano (AAAA-MM-GG), mai nel futuro. */
export function parseUploadDate(v: any, now = new Date()): string | null {
  const s = String(v || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
  const d = new Date(s + 'T00:00:00Z')
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== s) return null
  if (d.getTime() > now.getTime() + 864e5) return null
  return s
}
export async function loadLastUpload(db: any): Promise<{ date: string; savedAt: string | null } | null> {
  try {
    const r: any = await db.prepare(`SELECT value, updated_at FROM settings WHERE key=?`).bind(LAST_UPLOAD_KEY).first()
    if (!r) return null
    const date = parseUploadDate(JSON.parse(r.value)?.date)
    return date ? { date, savedAt: r.updated_at || null } : null
  } catch (_) { return null }
}
export async function saveLastUpload(db: any, date: string): Promise<void> {
  await db.prepare(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, description TEXT, updated_at TEXT DEFAULT (datetime('now')))`).run()
  await db.prepare(`INSERT INTO settings (key,value,description,updated_at) VALUES (?,?,'Data (inserita a mano) dell''ultimo upload di conversioni offline in Google Ads',datetime('now')) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')`).bind(LAST_UPLOAD_KEY, JSON.stringify({ date })).run()
}
