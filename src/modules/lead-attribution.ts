// Attribuzione dei lead (click ID Google Ads, campagna, primo referrer) in una TABELLA LATERALE.
// Motivo: `leads` in produzione ha già 100 colonne, il massimo di D1 per tabella: ALTER TABLE leads ADD COLUMN non è più possibile
// (e un JOIN che seleziona tutte le colonne di leads supera le 100 colonne per risultato). Un record per lead, chiave = leads.id.
// Regola «il primo click vince»: un valore già presente non viene sovrascritto da un invio successivo.

export interface LeadAttribution {
  gclid?: string | null; gbraid?: string | null; wbraid?: string | null
  click_ts?: number | null; landing_page?: string | null
  utm_campaign?: string | null; first_referrer?: string | null
}
const COLS = ['gclid', 'gbraid', 'wbraid', 'click_ts', 'landing_page', 'utm_campaign', 'first_referrer'] as const

let _ready = false
/** Solo per i test: azzera la cache «tabella già pronta» di questo isolate. */
export function resetLeadAttributionCache() { _ready = false }

/** Crea la tabella se manca (additivo e idempotente: nessuna colonna di `leads` viene toccata). */
export async function ensureLeadAttributionTable(db: any): Promise<string[]> {
  const log: string[] = []
  if (_ready) return log
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS lead_attribution (
      lead_id TEXT PRIMARY KEY,
      gclid TEXT DEFAULT NULL, gbraid TEXT DEFAULT NULL, wbraid TEXT DEFAULT NULL,
      click_ts INTEGER DEFAULT NULL, landing_page TEXT DEFAULT NULL,
      utm_campaign TEXT DEFAULT NULL, first_referrer TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
    )`).run()
    log.push('ℹ️ lead_attribution pronta')
    for (const idx of [
      'CREATE INDEX IF NOT EXISTS idx_lead_attr_gclid ON lead_attribution(gclid)',
      'CREATE INDEX IF NOT EXISTS idx_lead_attr_click_ts ON lead_attribution(click_ts)',
    ]) {
      try { await db.prepare(idx).run() } catch (e: any) { log.push(`⚠️ Errore indice: ${e?.message}`) }
    }
    _ready = !log.some(l => l.startsWith('⚠️'))
  } catch (e: any) { log.push(`⚠️ Errore lead_attribution: ${e?.message}`) }
  return log
}

/** Scrive (o completa) il record del lead. Valori vuoti/null non cancellano nulla; un valore già presente resta (primo click vince). */
export async function saveLeadAttribution(db: any, leadId: string, a: LeadAttribution): Promise<void> {
  const vals = COLS.map(c => { const v = (a as any)[c]; return v === '' || v === undefined ? null : v })
  if (vals.every(v => v == null)) return
  const log = await ensureLeadAttributionTable(db)
  if (log.some(l => l.startsWith('⚠️'))) throw new Error(log.filter(l => l.startsWith('⚠️')).join('; '))
  const set = COLS.map(c => `${c} = CASE WHEN lead_attribution.${c} IS NULL OR lead_attribution.${c} = '' THEN excluded.${c} ELSE lead_attribution.${c} END`).join(', ')
  await db.prepare(
    `INSERT INTO lead_attribution (lead_id, ${COLS.join(', ')}) VALUES (?, ${COLS.map(() => '?').join(', ')})
     ON CONFLICT(lead_id) DO UPDATE SET ${set}, updated_at = datetime('now')`
  ).bind(leadId, ...vals).run()
}

/** Condizione SQL «ha un click ID» sulla tabella laterale (alias `a`). */
export const HAS_CLICK_ID_SQL = `((a.gclid IS NOT NULL AND a.gclid != '') OR (a.gbraid IS NOT NULL AND a.gbraid != '') OR (a.wbraid IS NOT NULL AND a.wbraid != ''))`
/** JOIN standard: i lead restano tutti, l'attribuzione è facoltativa. Mai `l.*`: si selezionano solo le colonne necessarie. */
export const ATTRIBUTION_JOIN = `LEFT JOIN lead_attribution a ON a.lead_id = l.id`
