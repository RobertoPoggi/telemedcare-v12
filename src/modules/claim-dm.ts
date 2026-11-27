/**
 * claim-dm.ts — FASE 2: meccanismo Claim DM lato CRM (D.Lgs. 137/2022, art. 26).
 *
 * Responsabilita':
 *  - stato globale del meccanismo (ORIGINALE di default, TRANSITORIA, AUTORIZZATA) + scostamenti per blocco;
 *  - push immediato alla landing (POST /internal/claim-blocks/sync per ogni blocco, poi /purge);
 *  - endpoint di lettura GET /api/claim-block-states per la riconciliazione della landing;
 *  - job periodico POST /api/cron/claim-reconcile con log ed email di alert dopo 3 fallimenti consecutivi.
 *
 * Contratto della landing (fonte di verita': ecura-landing/functions/internal/claim-blocks/*):
 *  - sync: un solo evento { block_id, stato, updated_at (ISO UTC), motivo } per chiamata;
 *  - purge: { block_ids?, paths? } — senza argomenti invalida tutte le pagine censite;
 *  - riconcilia: la landing CHIAMA il CRM su /api/claim-block-states e si aspetta una lista di eventi
 *    (array o { states: [...] }). Nessun testo di blocco nella risposta.
 */

export const STATI = ['ORIGINALE', 'TRANSITORIA', 'AUTORIZZATA'] as const
export type Stato = (typeof STATI)[number]

export const BLOCCHI = [
  'EC-01', 'EC-02', 'EC-03', 'EC-04', 'EC-05', 'EC-06',
  'EC-07', 'EC-08', 'EC-09', 'EC-10', 'EC-11', 'EC-12',
] as const

export const STATO_DEFAULT: Stato = 'ORIGINALE'

export interface StatoBlocchi {
  stato_globale: Stato
  blocchi: Record<string, Stato | null>
  updated_at: string | null
  updated_by: string | null
  motivo?: string | null
}

export interface EventoLanding {
  block_id: string
  stato: Stato
  updated_at: string
  motivo?: string | null
}

export interface EsitoChiamata {
  ok: boolean
  status: number
  durata_ms: number
  dettaglio?: any
}

const isStato = (v: any): v is Stato => typeof v === 'string' && (STATI as readonly string[]).includes(v)
const isIso = (s: any) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(s) && !Number.isNaN(Date.parse(s))

/** Confronto a tempo costante (bearer server-to-server). */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false
  let d = 0
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return d === 0
}

/** Autenticazione Bearer per /api/claim-block-states: 503 se il segreto manca, 401 se il bearer non torna. */
export function checkClaimApiToken(authHeader: string | undefined | null, token: string | undefined | null):
  { ok: true } | { ok: false; status: 401 | 503; error: string } {
  if (!token || !String(token).trim()) return { ok: false, status: 503, error: 'CLAIM_API_TOKEN non configurato' }
  const m = authHeader ? /^Bearer (.+)$/.exec(authHeader) : null
  if (!m) return { ok: false, status: 401, error: 'Non autorizzato' }
  if (!timingSafeEqual(m[1], String(token))) return { ok: false, status: 401, error: 'Non autorizzato' }
  return { ok: true }
}

/** Crea le tabelle se la migration non e' passata (difesa in profondita', idempotente). */
export async function ensureSchema(db: any): Promise<void> {
  await db.prepare(`CREATE TABLE IF NOT EXISTS claim_dm_stato (
    chiave TEXT PRIMARY KEY, valore TEXT, motivo TEXT, updated_at TEXT NOT NULL, updated_by TEXT)`).run()
  await db.prepare(`CREATE TABLE IF NOT EXISTS claim_dm_sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT, chiamata TEXT NOT NULL, esito TEXT NOT NULL,
    http_status INTEGER, durata_ms INTEGER, dettaglio TEXT, created_at TEXT NOT NULL)`).run()
  await db.prepare(`INSERT OR IGNORE INTO claim_dm_stato (chiave, valore, motivo, updated_at, updated_by)
    VALUES ('stato_globale', 'ORIGINALE', 'Impostazione iniziale Fase 2', ?, 'system')`)
    .bind(new Date().toISOString()).run()
}

/** Legge lo stato corrente (default ORIGINALE se la tabella e' vuota). */
export async function getStato(db: any): Promise<StatoBlocchi> {
  let rows: any[] = []
  try {
    const r = await db.prepare('SELECT chiave, valore, motivo, updated_at, updated_by FROM claim_dm_stato').all()
    rows = r.results || []
  } catch {
    await ensureSchema(db)
    rows = []
  }
  const perChiave = new Map<string, any>(rows.map(r => [r.chiave, r]))
  const globaleRow = perChiave.get('stato_globale')
  const stato_globale: Stato = isStato(globaleRow?.valore) ? globaleRow!.valore : STATO_DEFAULT
  const blocchi: Record<string, Stato | null> = {}
  for (const b of BLOCCHI) {
    const v = perChiave.get(b)?.valore
    blocchi[b] = isStato(v) ? v : null
  }
  const aggiornamenti = rows.map(r => r.updated_at).filter(isIso).sort()
  return {
    stato_globale,
    blocchi,
    updated_at: aggiornamenti.length ? aggiornamenti[aggiornamenti.length - 1] : null,
    updated_by: globaleRow?.updated_by || null,
    motivo: globaleRow?.motivo || null,
  }
}

/** Stato effettivo di un blocco: scostamento se impostato, altrimenti stato globale. */
export function statoEffettivo(s: StatoBlocchi, blockId: string): Stato {
  const v = s.blocchi?.[blockId]
  return isStato(v) ? v : s.stato_globale
}

/** Eventi da inviare alla landing (uno per blocco, stato effettivo). */
export function eventiDaStato(s: StatoBlocchi, updatedAt?: string | null): EventoLanding[] {
  const ts = isIso(updatedAt) ? updatedAt! : new Date().toISOString()
  return BLOCCHI.map(b => ({
    block_id: b,
    stato: statoEffettivo(s, b),
    updated_at: ts,
    motivo: s.motivo || null,
  }))
}

/**
 * Valida un payload di salvataggio.
 * Accetta { stato_globale, blocchi?: {EC-01: 'AUTORIZZATA'|null}, motivo? }
 */
export function validaPayload(body: any): { ok: true; stato_globale: Stato; blocchi: Record<string, Stato | null>; motivo: string | null } | { ok: false; error: string } {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Body non valido' }
  const g = body.stato_globale
  if (!isStato(g)) return { ok: false, error: 'stato_globale non valido (ORIGINALE | TRANSITORIA | AUTORIZZATA)' }
  const blocchi: Record<string, Stato | null> = {}
  const input = body.blocchi
  if (input !== undefined && input !== null) {
    if (typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'blocchi deve essere un oggetto' }
    for (const [k, v] of Object.entries(input)) {
      if (!(BLOCCHI as readonly string[]).includes(k)) return { ok: false, error: `Blocco sconosciuto: ${k}` }
      if (v === null || v === '') { blocchi[k] = null; continue }
      if (!isStato(v)) return { ok: false, error: `Stato non valido per ${k}` }
      blocchi[k] = v
    }
  }
  const motivo = body.motivo === undefined || body.motivo === null ? null : String(body.motivo).slice(0, 500)
  return { ok: true, stato_globale: g, blocchi, motivo }
}

/** Salva stato globale + scostamenti. Ritorna lo stato persistito (con timestamp nuovo). */
export async function setStato(db: any, p: { stato_globale: Stato; blocchi: Record<string, Stato | null>; motivo: string | null }, user: string): Promise<StatoBlocchi> {
  await ensureSchema(db)
  const now = new Date().toISOString()
  await db.prepare(`INSERT INTO claim_dm_stato (chiave, valore, motivo, updated_at, updated_by)
    VALUES ('stato_globale', ?, ?, ?, ?)
    ON CONFLICT(chiave) DO UPDATE SET valore = excluded.valore, motivo = excluded.motivo,
      updated_at = excluded.updated_at, updated_by = excluded.updated_by`)
    .bind(p.stato_globale, p.motivo, now, user).run()
  for (const [k, v] of Object.entries(p.blocchi)) {
    if (v === null) {
      await db.prepare('DELETE FROM claim_dm_stato WHERE chiave = ?').bind(k).run()
    } else {
      await db.prepare(`INSERT INTO claim_dm_stato (chiave, valore, motivo, updated_at, updated_by)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(chiave) DO UPDATE SET valore = excluded.valore, motivo = excluded.motivo,
          updated_at = excluded.updated_at, updated_by = excluded.updated_by`)
        .bind(k, v, p.motivo, now, user).run()
    }
  }
  return await getStato(db)
}

async function chiamaJson(url: string, init: RequestInit, timeoutMs = 8000): Promise<EsitoChiamata & { body?: any }> {
  const t0 = Date.now()
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    const r = await fetch(url, { ...init, signal: ctrl.signal })
    clearTimeout(timer)
    const testo = await r.text()
    let body: any = null
    try { body = JSON.parse(testo) } catch { body = testo.slice(0, 500) }
    return { ok: r.ok, status: r.status, durata_ms: Date.now() - t0, dettaglio: body, body }
  } catch (e: any) {
    return { ok: false, status: 0, durata_ms: Date.now() - t0, dettaglio: e?.message || String(e) }
  }
}

export async function logChiamata(db: any, chiamata: string, esito: EsitoChiamata, extra?: any): Promise<void> {
  try {
    await db.prepare(`INSERT INTO claim_dm_sync_log (chiamata, esito, http_status, durata_ms, dettaglio, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(chiamata, esito.ok ? 'ok' : 'errore', esito.status, esito.durata_ms,
        JSON.stringify(extra !== undefined ? extra : esito.dettaglio).slice(0, 2000), new Date().toISOString()).run()
  } catch { /* il log non deve mai bloccare il flusso */ }
}

/** Purge cache landing (best effort). */
export async function purgeLanding(env: any, db: any): Promise<EsitoChiamata> {
  const base = String(env.LANDING_BASE_URL || 'https://www.ecura.it').replace(/\/+$/, '')
  const esito = await chiamaJson(`${base}/internal/claim-blocks/purge`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.LANDING_CLAIM_TOKEN || ''}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  await logChiamata(db, 'purge', esito)
  return esito
}

/**
 * Push immediato alla landing: un POST /sync per blocco, poi un /purge.
 * La landing valida block_id/stato/updated_at e non torna indietro se l'evento e' obsoleto.
 */
export async function pushLanding(env: any, db: any, eventi: EventoLanding[]) {
  const base = String(env.LANDING_BASE_URL || 'https://www.ecura.it').replace(/\/+$/, '')
  const token = env.LANDING_CLAIM_TOKEN
  const risultati: Array<{ block_id: string; ok: boolean; status: number; esito?: any }> = []
  if (!token || !String(token).trim()) {
    const esito: EsitoChiamata = { ok: false, status: 503, durata_ms: 0, dettaglio: 'LANDING_CLAIM_TOKEN non configurato' }
    await logChiamata(db, 'save', esito, esito.dettaglio)
    return { ok: false, errore: 'LANDING_CLAIM_TOKEN non configurato', risultati: [], purge: null }
  }
  for (const ev of eventi) {
    const esito = await chiamaJson(`${base}/internal/claim-blocks/sync`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(ev),
    })
    risultati.push({ block_id: ev.block_id, ok: esito.ok, status: esito.status, esito: esito.body })
    await logChiamata(db, 'save', esito, { block_id: ev.block_id, stato: ev.stato })
  }
  const purge = await purgeLanding(env, db)
  return { ok: risultati.every(r => r.ok) && purge.ok, errore: null, risultati, purge }
}

export interface EsitoCatturaBlocco { block_id: string; esito: string; byte_prima?: number; byte_dopo?: number; errore?: string }
export interface EsitoCattura { eseguita: boolean; ok: boolean; status: number; blocchi: EsitoCatturaBlocco[]; errore?: string | null }

/**
 * Principio ORIGINALE (Fase 2-ter): "al primo giro vince il sito, poi vince D1".
 * Chiede alla landing di portare in D1 (versione_originale) il contenuto reale dei template, per i soli blocchi in stato ORIGINALE.
 * Con TRANSITORIA/AUTORIZZATA non si chiama: quei testi vengono da D1, non dal sito.
 */
export async function catturaOriginaleLanding(env: any, db: any, eventi: EventoLanding[]): Promise<EsitoCattura> {
  const ids = eventi.filter(e => e.stato === 'ORIGINALE').map(e => e.block_id)
  if (!ids.length) return { eseguita: false, ok: true, status: 0, blocchi: [] }
  const base = String(env.LANDING_BASE_URL || 'https://www.ecura.it').replace(/\/+$/, '')
  const token = env.LANDING_CLAIM_TOKEN
  if (!token || !String(token).trim()) {
    const esito: EsitoChiamata = { ok: false, status: 503, durata_ms: 0, dettaglio: 'LANDING_CLAIM_TOKEN non configurato' }
    await logChiamata(db, 'capture-original', esito, esito.dettaglio)
    return { eseguita: true, ok: false, status: 503, blocchi: [], errore: 'LANDING_CLAIM_TOKEN non configurato' }
  }
  const esito = await chiamaJson(`${base}/internal/claim-blocks/capture-original`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ block_ids: ids }),
  }, 15000)
  const lista: any[] = Array.isArray(esito.body?.blocchi) ? esito.body.blocchi : []
  const blocchi: EsitoCatturaBlocco[] = lista.map(b => ({
    block_id: String(b.block_id), esito: String(b.esito), byte_prima: b.byte_prima, byte_dopo: b.byte_dopo,
    ...(b.errore ? { errore: String(b.errore).slice(0, 200) } : {}),
  }))
  // nel log solo gli esiti per blocco: mai testi
  await logChiamata(db, 'capture-original', esito, blocchi.length ? blocchi.map(b => `${b.block_id}:${b.esito}`).join(' ') : esito.dettaglio)
  const ok = esito.ok && blocchi.length > 0 && !blocchi.some(b => b.esito === 'errore')
  return { eseguita: true, ok, status: esito.status, blocchi, errore: ok ? null : (esito.ok ? 'cattura con errori' : `cattura non riuscita (HTTP ${esito.status})`) }
}

/**
 * Salva-e-sincronizza: PRIMA la cattura ORIGINALE (se serve), poi sync + purge come sempre.
 * Fail-safe: un blocco ORIGINALE la cui cattura non e' riuscita NON viene pubblicato come ORIGINALE (la landing resta nello stato
 * precedente), perche' D1 potrebbe non coincidere col sito. I blocchi 'non_mappato' (es. EC-02) si pubblicano: restano al contenuto statico.
 */
export async function sincronizzaLanding(env: any, db: any, eventi: EventoLanding[]) {
  const cattura = await catturaOriginaleLanding(env, db, eventi)
  const esiti = new Map(cattura.blocchi.map(b => [b.block_id, b.esito]))
  const sicuro = (ev: EventoLanding) => ev.stato !== 'ORIGINALE' || (cattura.status > 0 && cattura.blocchi.length > 0 && esiti.has(ev.block_id) && esiti.get(ev.block_id) !== 'errore')
  const daPubblicare = eventi.filter(sicuro)
  const saltati = eventi.filter(e => !sicuro(e)).map(e => e.block_id)
  const sync = await pushLanding(env, db, daPubblicare)
  return { ...sync, ok: sync.ok && saltati.length === 0, cattura, saltati }
}

/** Riconciliazione: chiama la landing, che a sua volta rilegge /api/claim-block-states. */
export async function riconcilia(env: any, db: any) {
  const base = String(env.LANDING_BASE_URL || 'https://www.ecura.it').replace(/\/+$/, '')
  const token = env.LANDING_CLAIM_TOKEN
  if (!token || !String(token).trim()) {
    const esito: EsitoChiamata = { ok: false, status: 503, durata_ms: 0, dettaglio: 'LANDING_CLAIM_TOKEN non configurato' }
    await logChiamata(db, 'riconcilia', esito, esito.dettaglio)
    return { ok: false, esito, alert: false }
  }
  const esito = await chiamaJson(`${base}/internal/claim-blocks/riconcilia`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ origine: 'crm-cron' }),
  })
  await logChiamata(db, 'riconcilia', esito)
  const alert = esito.ok ? false : await forseAlert(env, db)
  return { ok: esito.ok, esito, alert }
}

/** Fallimenti consecutivi (dalla piu' recente) sul job di riconciliazione. */
export async function fallimentiConsecutivi(db: any): Promise<number> {
  const r = await db.prepare(`SELECT esito FROM claim_dm_sync_log WHERE chiamata = 'riconcilia' ORDER BY id DESC LIMIT 10`).all()
  let n = 0
  for (const row of (r.results || [])) { if (row.esito === 'errore') n++; else break }
  return n
}

/** Email di alert dopo 3 fallimenti consecutivi (destinatario da settings.claim_alert_email). */
export async function forseAlert(env: any, db: any): Promise<boolean> {
  try {
    const n = await fallimentiConsecutivi(db)
    if (n < 3) return false
    const row = await db.prepare(`SELECT value FROM settings WHERE key = 'claim_alert_email'`).first()
    const to = row && row.value ? String(row.value).trim() : ''
    if (!to) return false
    const { EmailService } = await import('./email-service')
    const svc = EmailService.getInstance()
    const stato = await getStato(db).catch(() => null as any)
    await svc.sendEmail({
      to,
      from: env.EMAIL_FROM || 'info@ecura.it',
      subject: `[Claim DM] ${n} riconciliazioni consecutive fallite`,
      html: `<p>Il job di riconciliazione Claim DM ha fallito <strong>${n}</strong> volte consecutive.</p>
             <p>Stato globale corrente sul CRM: <strong>${stato?.stato_globale || 'n/d'}</strong>.</p>
             <p>Controllare i log in <code>claim_dm_sync_log</code> e la raggiungibilita' di /internal/claim-blocks/riconcilia.</p>`,
    })
    return true
  } catch (e: any) {
    console.error('[claim-dm] alert email fallito:', e?.message || e)
    return false
  }
}

/** Ultimi log per la pagina admin. */
export async function ultimiLog(db: any, limite = 20): Promise<any[]> {
  try {
    const r = await db.prepare(`SELECT chiamata, esito, http_status, durata_ms, dettaglio, created_at
      FROM claim_dm_sync_log ORDER BY id DESC LIMIT ?`).bind(limite).all()
    return r.results || []
  } catch { return [] }
}


/**
 * Autorizzazione dei job cron: accetta `Authorization: Bearer <CRON_SECRET>` oppure `x-cron-secret: <CRON_SECRET>`.
 * Se CRON_SECRET non e' configurato resta il comportamento storico delle altre rotte cron (non protetta).
 */
export function cronAutorizzato(cronSecret: string | undefined | null, authorization: string | undefined | null, xCronSecret: string | undefined | null): boolean {
  if (!cronSecret) return true
  return authorization === `Bearer ${cronSecret}` || xCronSecret === cronSecret
}
