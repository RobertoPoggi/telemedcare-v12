/**
 * Telemetria SiDLY: DB statistico delle misure degli assistiti eCura.
 *
 * PRINCIPI (decisi dal titolare, non negoziabili):
 *  - i dati passano SEMPRE da SiDLY: il CRM li LEGGE con le API di SiDLY (GET /patient/{imei}/stats e GET /patientIntegrateAlarm/{imei});
 *  - il CRM NON riceve frame dai braccialetti e NON scrive URL di consegna sui dispositivi (nessun set-url-for-band / delete-url-for-band);
 *  - uso esclusivamente statistico, non gestionale: assistiti e caregiver continuano a usare la piattaforma SiDLY.
 *
 *  - Storico (pull):  eseguiStorico()  <- GET /patient/{imei}/stats  (+ /patientIntegrateAlarm/{imei})
 *  - Report medie / dataset CSV: reportMedie(), datasetMisure(), statoTelemetria()
 *
 * Vincoli di D1 rispettati:
 *  - nessun ALTER sulla tabella leads (100 colonne): solo tabelle laterali (sidly_misure, sidly_eventi, sidly_stato);
 *  - UNA riga per (imei, istante) con tutte le metriche in colonne: meno scritture (limite giornaliero di operazioni D1);
 *  - scritture sempre a blocchi (db.batch) e storico a finestre di 7 giorni con tetto di righe per chiamata, ripartendo dal cursore;
 *  - le letture (GET stato/report) NON creano tabelle: le tabelle si creano alla prima scrittura confermata.
 *
 * HRV (SDNN/RMSSD), passi e le altre metriche arrivano da /stats, quindi servono aggiornamenti periodici dello storico (riletture degli ultimi giorni).
 * Tutti i timestamp di /stats e degli allarmi di SiDLY sono UTC.
 */
import { SidlyClient, sidlyConfigError, type SidlyEnv, type Fetch } from './sidly-sync'

export const MISURE_SQL = `CREATE TABLE IF NOT EXISTS sidly_misure (
  imei TEXT NOT NULL, ts INTEGER NOT NULL,
  hr REAL, hr_q INTEGER, spo2 REAL, spo2_q INTEGER, temp REAL, steps REAL, steps_tot REAL, pressure REAL,
  sdnn REAL, rmssd REAL, resp REAL, hr_rest REAL, wear REAL, fonte TEXT,
  PRIMARY KEY (imei, ts)) WITHOUT ROWID`
export const EVENTI_SQL = `CREATE TABLE IF NOT EXISTS sidly_eventi (
  imei TEXT NOT NULL, ts INTEGER NOT NULL, tipo TEXT NOT NULL, origine TEXT, alarm_id INTEGER,
  batt INTEGER, pulse REAL, spo2 REAL, temp REAL, lat REAL, lon REAL, dettaglio TEXT, gestito_da TEXT,
  PRIMARY KEY (imei, ts, tipo)) WITHOUT ROWID`
export const STATO_SQL = `CREATE TABLE IF NOT EXISTS sidly_stato (
  imei TEXT PRIMARY KEY, assistito_id INTEGER,
  backfill_da_ts INTEGER, backfill_fino_ts INTEGER, backfill_righe INTEGER DEFAULT 0,
  ultimo_errore TEXT, registrato_ts INTEGER, completo_ts INTEGER, updated_at TEXT)`

let tabelleOk: any = null
/** Crea le tabelle (una volta per istanza). Chiamata SOLO da percorsi di scrittura. */
export async function assicuraTabelle(db: any): Promise<void> {
  if (tabelleOk === db) return
  await db.batch([db.prepare(MISURE_SQL), db.prepare(EVENTI_SQL), db.prepare(STATO_SQL)])
  // Tabella creata da una versione precedente: aggiunge le due colonne nuove (solo sidly_stato, piccola).
  try {
    const c = await db.prepare(`SELECT COUNT(*) AS n FROM pragma_table_info('sidly_stato') WHERE name IN ('registrato_ts','completo_ts')`).first()
    if (Number(c?.n) < 2) for (const col of ['registrato_ts', 'completo_ts']) { try { await db.prepare(`ALTER TABLE sidly_stato ADD COLUMN ${col} INTEGER`).run() } catch { /* gia' presente */ } }
  } catch { /* solo migrazione */ }
  tabelleOk = db
}
/** Solo per i test: dimentica che le tabelle sono state create. */
export function dimenticaTabelle(): void { tabelleOk = null }

// ─────────────────────────────────────────────────────────────────────────────
// Utilità
// ─────────────────────────────────────────────────────────────────────────────
const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '')
const IMEI_RE = /^\d{14,17}$/
/** Misure ravvicinate si fondono in un solo punto per queste finestre di secondi nei report. */
export const BUCKET_S = 120

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const x = typeof v === 'number' ? v : Number(String(v).replace(',', '.'))
  return Number.isFinite(x) ? x : null
}
function inRange(v: number | null, lo: number, hi: number): number | null { return v !== null && v >= lo && v <= hi ? v : null }
const sqlNum = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : 'NULL')

// ─────────────────────────────────────────────────────────────────────────────
// Modello dati
// ─────────────────────────────────────────────────────────────────────────────
export type Fonte = 'stats'
export interface Misura {
  imei: string; ts: number; fonte: Fonte
  hr?: number | null; hr_q?: number | null; spo2?: number | null; spo2_q?: number | null; temp?: number | null
  steps?: number | null; steps_tot?: number | null; pressure?: number | null; sdnn?: number | null; rmssd?: number | null
  resp?: number | null; hr_rest?: number | null; wear?: number | null
}
const COLS = ['hr', 'hr_q', 'spo2', 'spo2_q', 'temp', 'steps', 'steps_tot', 'pressure', 'sdnn', 'rmssd', 'resp', 'hr_rest', 'wear'] as const
export interface Evento {
  imei: string; ts: number; tipo: string; origine: 'api'; alarm_id?: number | null; batt?: number | null
  pulse?: number | null; spo2?: number | null; temp?: number | null; lat?: number | null; lon?: number | null; dettaglio?: string; gestito_da?: string
}

/** Fonde righe con la stessa chiave (imei, ts): i valori presenti vincono su quelli assenti. */
export function fondiMisure(righe: Misura[]): Misura[] {
  const m = new Map<string, Misura>()
  for (const r of righe) {
    if (!IMEI_RE.test(r.imei) || !Number.isInteger(r.ts) || r.ts <= 0) continue
    const k = r.imei + ':' + r.ts
    const o = m.get(k)
    if (!o) { m.set(k, { ...r }); continue }
    for (const c of COLS) if (r[c] !== null && r[c] !== undefined) (o as any)[c] = r[c]
    o.fonte = r.fonte
  }
  return [...m.values()]
}

/** INSERT multi-riga con upsert: solo numeri sanificati e IMEI di sole cifre (nessun testo libero). I NULL non cancellano valori esistenti. */
export function istruzioniMisure(db: any, righe: Misura[], dimBlocco = 40): any[] {
  const rr = fondiMisure(righe)
  const out: any[] = []
  const set = COLS.map(c => `${c}=COALESCE(excluded.${c},${c})`).join(',') + ',fonte=excluded.fonte'
  for (let i = 0; i < rr.length; i += dimBlocco) {
    const vals = rr.slice(i, i + dimBlocco).map(r => `('${r.imei}',${r.ts},${COLS.map(c => sqlNum((r as any)[c])).join(',')},'stats')`).join(',')
    out.push(db.prepare(`INSERT INTO sidly_misure (imei,ts,${COLS.join(',')},fonte) VALUES ${vals} ON CONFLICT(imei,ts) DO UPDATE SET ${set}`))
  }
  return out
}

function istruzioneEvento(db: any, e: Evento, aggiorna: boolean): any {
  const base = `INSERT INTO sidly_eventi (imei,ts,tipo,origine,alarm_id,batt,pulse,spo2,temp,lat,lon,dettaglio,gestito_da) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`
  const sql = aggiorna
    ? base + ` ON CONFLICT(imei,ts,tipo) DO UPDATE SET alarm_id=COALESCE(excluded.alarm_id,alarm_id), dettaglio=COALESCE(excluded.dettaglio,dettaglio), gestito_da=COALESCE(excluded.gestito_da,gestito_da)`
    : base + ` ON CONFLICT(imei,ts,tipo) DO NOTHING`
  const n = (v: any) => (typeof v === 'number' && Number.isFinite(v) ? v : null)
  return db.prepare(sql).bind(e.imei, e.ts, e.tipo, e.origine, n(e.alarm_id), n(e.batt), n(e.pulse), n(e.spo2), n(e.temp), n(e.lat), n(e.lon),
    e.dettaglio ? String(e.dettaglio).replace(/[\u0000-\u001f]+/g, ' ').slice(0, 300) : null, e.gestito_da ? String(e.gestito_da).slice(0, 80) : null)
}

// ─────────────────────────────────────────────────────────────────────────────
// Storico (pull) da /patient/{imei}/stats
// ─────────────────────────────────────────────────────────────────────────────
type Colonna = typeof COLS[number]
const STATS_MAP: Array<{ k: string; col: Colonna; lo: number; hi: number }> = [
  { k: 'pulse', col: 'hr', lo: 25, hi: 250 }, { k: 'sat', col: 'spo2', lo: 50, hi: 100 }, { k: 'temperature', col: 'temp', lo: 20, hi: 45 },
  { k: 'pressure', col: 'pressure', lo: 0.0001, hi: 1e6 }, { k: 'sdnn', col: 'sdnn', lo: 0.0001, hi: 1000 }, { k: 'rmssd', col: 'rmssd', lo: 0.0001, hi: 1000 },
  { k: 'respiration', col: 'resp', lo: 3, hi: 60 }, { k: 'restingPulse', col: 'hr_rest', lo: 25, hi: 200 }, { k: 'steps', col: 'steps', lo: 0, hi: 1e6 },
]

export interface StatsParsed {
  righe: Misura[]
  punti: Record<string, number>
  da: number | null; a: number | null
  /** Controllo sul significato dei passi: totale dichiarato da SiDLY vs somma dei punti del grafico. */
  passi: { dichiarato: number | null; somma_punti: number; dailyTarget: number | null }
}

export function parseStats(json: any, imei: string): StatsParsed {
  const righe: Misura[] = []
  const punti: Record<string, number> = {}
  let da: number | null = null, a: number | null = null
  let somma = 0
  const root = json && typeof json === 'object' ? (json.data && typeof json.data === 'object' && !Array.isArray(json.data) && !json.pulse ? json.data : json) : {}
  for (const mp of STATS_MAP) {
    const blocco = root[mp.k]
    const chart = blocco && Array.isArray(blocco.chart) ? blocco.chart : []
    let n = 0
    for (const pt of chart) {
      let x = num(pt?.x)
      const y = inRange(num(pt?.y), mp.lo, mp.hi)
      if (x === null || y === null) continue
      if (x > 1e12) x = Math.round(x / 1000) // millisecondi
      x = Math.round(x)
      if (x <= 0) continue
      const m: Misura = { imei, ts: x, fonte: 'stats' }
      ;(m as any)[mp.col] = y
      const tr = String(pt?.trust_lvl ?? '')
      if (mp.col === 'hr') { const q = /HR\s*=\s*(\d)/i.exec(tr); if (q) m.hr_q = Number(q[1]) }
      if (mp.col === 'spo2') { const q = /SpO2\s*=\s*(\d)/i.exec(tr); if (q) m.spo2_q = Number(q[1]) }
      if (mp.col === 'steps') { m.steps_tot = inRange(num(pt?.total), 0, 1e7); somma += y }
      righe.push(m)
      n++
      da = da === null ? x : Math.min(da, x); a = a === null ? x : Math.max(a, x)
    }
    if (n) punti[mp.k] = n
  }
  const st = root.steps
  return { righe: fondiMisure(righe), punti, da, a, passi: { dichiarato: st ? num(st.total) : null, somma_punti: somma, dailyTarget: st ? num(st.dailyTarget) : null } }
}

const MAPPA_ALLARMI: Record<string, string> = { sos: 'sos', fall: 'fall', leavezone: 'zone', zone: 'zone', immo: 'immo', ocall: 'call', call: 'call' }

/** Cronologia allarmi di /patientIntegrateAlarm/{imei}: array (o oggetto con array) dal piu' recente. */
export function parseAllarmi(json: any, imei: string): Evento[] {
  const arr: any[] = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : Array.isArray(json?.items) ? json.items : Array.isArray(json?.alarms) ? json.alarms : []
  const out: Evento[] = []
  for (const x of arr) {
    const tipo = MAPPA_ALLARMI[String(x?.type || '').toLowerCase()]
    const t = Date.parse(String(x?.receivedDate || ''))
    if (!tipo || !Number.isFinite(t)) continue
    const lat = inRange(num(x.latitude), -90, 90), lon = inRange(num(x.longitude), -180, 180)
    const nz = (v: number | null) => (v !== null && v !== 0 ? v : null)
    const noLoc = lat === null || lon === null || (lat === 0 && lon === 0)
    out.push({ imei, ts: Math.round(t / 1000), tipo, origine: 'api', alarm_id: num(x.id), batt: inRange(num(x.batteryLevel), 1, 100),
      pulse: nz(num(x.pulse)), spo2: nz(num(x.sat)), temp: inRange(num(x.temperature), 20, 45), lat: noLoc ? null : lat, lon: noLoc ? null : lon,
      dettaglio: typeof x?.description?.caseDescription === 'string' ? x.description.caseDescription : undefined, gestito_da: typeof x?.handledBy === 'string' ? x.handledBy : undefined })
  }
  return out
}

export const FINESTRA_S = 7 * 86400
/** Giorni riletti a ogni aggiornamento incrementale. */
export const RILETTURA_S = 2 * 86400
/** Se l'ultimo completamento e' piu' recente di cosi', l'assistito e' considerato aggiornato: nessuna chiamata (evita di rileggere gli stessi giorni a ogni passaggio). */
export const AGGIORNATO_S = 6 * 3600
/** Tetto del periodo richiesto (10 anni). */
export const MAX_STORICO_S = 3650 * 86400
const MIN_FINESTRA_S = 3600
export const fmtSidlyData = (s: number) => new Date(s * 1000).toISOString().slice(0, 19).replace('T', ' ')
/** 'YYYY-MM-DD' -> secondi UTC a mezzanotte; null se non valida. */
export function dataToSec(d: unknown): number | null {
  if (typeof d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return null
  const t = Date.parse(d + 'T00:00:00Z')
  return Number.isFinite(t) ? Math.floor(t / 1000) : null
}

export interface AssistitoTel { assistito_id: number; imei: string; nome: string }

async function safeAll(db: any, sql: string, ...b: any[]): Promise<any[]> { try { const r = await db.prepare(sql).bind(...b).all(); return r?.results || [] } catch { return [] } }
async function safeFirst(db: any, sql: string, ...b: any[]): Promise<any | null> { try { return (await db.prepare(sql).bind(...b).first()) || null } catch { return null } }

/** Assistiti ATTIVI con IMEI. Il nome serve solo alla Dashboard. */
export async function assistitiAttivi(db: any, assistitoId?: number): Promise<AssistitoTel[]> {
  const rows = await safeAll(db, `SELECT id, imei, nome, nome_assistito, cognome_assistito FROM assistiti WHERE UPPER(COALESCE(status,'')) = 'ATTIVO' AND imei IS NOT NULL AND imei != '' ${assistitoId ? 'AND id = ?' : ''} ORDER BY id`, ...(assistitoId ? [assistitoId] : []))
  const out: AssistitoTel[] = []
  const visti = new Set<string>()
  for (const r of rows) {
    const imei = digits(r.imei)
    if (!IMEI_RE.test(imei) || visti.has(imei)) continue
    visti.add(imei)
    const nome = [r.nome_assistito, r.cognome_assistito].filter(Boolean).join(' ').trim() || String(r.nome || '')
    out.push({ assistito_id: Number(r.id), imei, nome })
  }
  return out
}

export interface StoricoOpzioni {
  db: any; env: SidlyEnv; da: string; dryRun: boolean; assistitoId?: number
  nowSec?: number; fetchImpl?: Fetch; maxFinestre?: number; maxRighe?: number
}
export interface StoricoAssistito {
  assistito_id: number; imei: string; nome: string; finestre: number; righe: number; fino_a: string | null; completato: boolean
  eventi?: number; errore?: string
  inizio_da?: string; aggiornato?: boolean
  anteprima?: { finestra: string; punti: Record<string, number>; righe: number; da?: string; a?: string; passi: StatsParsed['passi']; eventi_trovati?: number; stima_righe_totali?: number; inizio_da?: string; finestre_totali?: number; esempio?: any[] }
}
export interface StoricoRisultato { httpStatus: number; result: { esito: 'anteprima' | 'eseguito' | 'errore'; completato?: boolean; errore?: string; assistiti?: StoricoAssistito[]; righe_scritte?: number; finestre_eseguite?: number; avvisi?: string[]; limiti?: { max_finestre: number; max_righe: number } } }

/** Data di registrazione del braccialetto su SiDLY (registerDate di /patientIntegrate/{imei}): mezzanotte UTC meno un giorno di margine. */
export async function dataRegistrazione(client: SidlyClient, imei: string, nowSec: number): Promise<{ ts: number | null; errore?: string }> {
  const g = await client.request('GET', `/patientIntegrate/${imei}`)
  if (g.status < 200 || g.status >= 300) return { ts: null, errore: `data di registrazione non letta (HTTP ${g.status})` }
  const j = g.json && typeof g.json === 'object' && g.json.data && typeof g.json.data === 'object' && !Array.isArray(g.json.data) ? g.json.data : g.json
  const raw = j?.registerDate
  let v = num(raw)
  if (v === null && typeof raw === 'string') { const t = Date.parse(raw); if (Number.isFinite(t)) v = Math.round(t / 1000) }
  if (v !== null && v > 1e12) v = Math.round(v / 1000)
  if (v === null || v < 946684800 || v > nowSec + 86400) return { ts: null, errore: 'data di registrazione non disponibile su SiDLY: indica una data di inizio' }
  return { ts: Math.floor(v / 86400) * 86400 - 86400 }
}

/**
 * Storico dalle misure di SiDLY. `da` = 'AAAA-MM-GG' oppure 'inizio' (per ogni assistito dalla data di registrazione del suo braccialetto).
 * Riprende dal cursore salvato; un assistito completato resta "aggiornato" per AGGIORNATO_S (nessuna chiamata); dopo, rilegge gli ultimi RILETTURA_S.
 */
export async function eseguiStorico(o: StoricoOpzioni): Promise<StoricoRisultato> {
  const cfg = sidlyConfigError(o.env)
  if (cfg) return { httpStatus: 503, result: { esito: 'errore', errore: cfg } }
  const nowSec = o.nowSec ?? Math.floor(Date.now() / 1000)
  const inizio = String(o.da || '').trim().toLowerCase() === 'inizio'
  let daSec = 0
  if (!inizio) {
    const d = dataToSec(o.da)
    if (d === null) return { httpStatus: 400, result: { esito: 'errore', errore: 'Data di inizio non valida (formato AAAA-MM-GG, oppure "inizio")' } }
    if (d > nowSec) return { httpStatus: 400, result: { esito: 'errore', errore: 'La data di inizio e\' nel futuro' } }
    if (nowSec - d > MAX_STORICO_S) return { httpStatus: 400, result: { esito: 'errore', errore: 'Periodo troppo lungo (massimo 10 anni)' } }
    daSec = d
  }
  const maxFinestre = Math.max(1, Math.min(o.maxFinestre ?? 6, 20))
  const maxRighe = Math.max(100, Math.min(o.maxRighe ?? 4000, 20000))
  const lista = await assistitiAttivi(o.db, o.assistitoId)
  if (!lista.length) return { httpStatus: 404, result: { esito: 'errore', errore: o.assistitoId ? 'Assistito non trovato, non ATTIVO o senza IMEI' : 'Nessun assistito ATTIVO con IMEI' } }
  const client = new SidlyClient(o.env, o.fetchImpl)
  const avvisi: string[] = []
  const res: StoricoAssistito[] = []
  let finestreTot = 0, righeTot = 0

  // ANTEPRIMA: l'ultima settimana di al massimo 3 assistiti (stima il totale), nessuna scrittura (nemmeno la creazione delle tabelle).
  if (o.dryRun) {
    const campione = lista.slice(0, 3)
    if (lista.length > campione.length) avvisi.push(`Anteprima su ${campione.length} assistiti su ${lista.length} (le chiamate a SiDLY sono limitate per richiesta)`)
    for (const a of campione) {
      const r: StoricoAssistito = { assistito_id: a.assistito_id, imei: a.imei, nome: a.nome, finestre: 0, righe: 0, fino_a: null, completato: false }
      try {
        let daA = daSec
        if (inizio) {
          const d = await dataRegistrazione(client, a.imei, nowSec)
          if (d.ts === null) { r.errore = d.errore; res.push(r); continue }
          daA = d.ts
        }
        const campDa = Math.max(daA, nowSec - FINESTRA_S)
        const g = await client.request('GET', `/patient/${a.imei}/stats?fromDate=${encodeURIComponent(fmtSidlyData(campDa))}&toDate=${encodeURIComponent(fmtSidlyData(nowSec - 1))}`)
        if (g.status < 200 || g.status >= 300) { r.errore = `SiDLY ha risposto HTTP ${g.status}${g.motivo ? ': ' + g.motivo : ''}`; res.push(r); continue }
        const p = parseStats(g.json, a.imei)
        const ev = await client.request('GET', `/patientIntegrateAlarm/${a.imei}`)
        const giorni = Math.max(1, (nowSec - daA) / 86400)
        const giorniCamp = Math.max(1, (nowSec - campDa) / 86400)
        r.anteprima = { finestra: `${fmtSidlyData(campDa)} - ${fmtSidlyData(nowSec)} (UTC, ultima settimana)`, punti: p.punti, righe: p.righe.length, da: p.da ? fmtSidlyData(p.da) : undefined, a: p.a ? fmtSidlyData(p.a) : undefined, passi: p.passi,
          eventi_trovati: ev.status >= 200 && ev.status < 300 ? parseAllarmi(ev.json, a.imei).length : undefined,
          inizio_da: fmtSidlyData(daA) + ' UTC', finestre_totali: Math.ceil((nowSec - daA) / FINESTRA_S),
          stima_righe_totali: Math.round(p.righe.length / giorniCamp * giorni), esempio: p.righe.slice(0, 3).map(x => ({ ts: fmtSidlyData(x.ts), hr: x.hr ?? null, spo2: x.spo2 ?? null, steps: x.steps ?? null, resp: x.resp ?? null })) }
        r.righe = p.righe.length
      } catch (e: any) { r.errore = String(e?.message || e).slice(0, 160) }
      res.push(r)
    }
    return { httpStatus: 200, result: { esito: 'anteprima', assistiti: res, avvisi, limiti: { max_finestre: maxFinestre, max_righe: maxRighe } } }
  }

  // ESECUZIONE
  try { await assicuraTabelle(o.db) } catch { return { httpStatus: 500, result: { esito: 'errore', errore: 'Impossibile preparare le tabelle della telemetria' } } }
  let tuttiCompleti = true
  const adesso = new Date(nowSec * 1000).toISOString()
  for (const a of lista) {
    const r: StoricoAssistito = { assistito_id: a.assistito_id, imei: a.imei, nome: a.nome, finestre: 0, righe: 0, fino_a: null, completato: false, eventi: 0 }
    res.push(r)
    const st = await safeFirst(o.db, 'SELECT backfill_da_ts, backfill_fino_ts, registrato_ts, completo_ts FROM sidly_stato WHERE imei = ?', a.imei)
    let daA: number | null = inizio ? (st?.registrato_ts != null ? Number(st.registrato_ts) : null) : daSec
    const estende = st?.backfill_da_ts != null && daA !== null && daA < Number(st.backfill_da_ts)
    if (st?.backfill_fino_ts != null) r.fino_a = fmtSidlyData(Number(st.backfill_fino_ts))
    if (st?.backfill_da_ts != null) r.inizio_da = fmtSidlyData(Number(st.backfill_da_ts))
    // Gia' aggiornato da poco: nessuna chiamata.
    if (!estende && st?.completo_ts != null && nowSec - Number(st.completo_ts) < AGGIORNATO_S) { r.completato = true; r.aggiornato = true; continue }
    // Budget della richiesta finito: gli altri assistiti restano in coda per il passaggio successivo (nessuna chiamata).
    if (finestreTot >= maxFinestre || righeTot >= maxRighe) { tuttiCompleti = false; continue }
    if (daA === null) {
      const d = await dataRegistrazione(client, a.imei, nowSec)
      if (d.ts === null) { r.errore = d.errore; tuttiCompleti = false; continue }
      daA = d.ts
      try { await o.db.prepare(`INSERT INTO sidly_stato (imei,assistito_id,registrato_ts,updated_at) VALUES (?,?,?,?) ON CONFLICT(imei) DO UPDATE SET registrato_ts=excluded.registrato_ts, assistito_id=excluded.assistito_id, updated_at=excluded.updated_at`).bind(a.imei, a.assistito_id, daA, adesso).run() } catch { /* si rilegge al prossimo passaggio */ }
    }
    let da0: number = st?.backfill_da_ts != null ? Number(st.backfill_da_ts) : daA
    let cursore: number = st?.backfill_fino_ts != null ? Number(st.backfill_fino_ts) : daA
    if (st?.backfill_da_ts != null && daA < Number(st.backfill_da_ts)) { da0 = daA; cursore = daA } // periodo esteso all'indietro: si riparte (idempotente)
    else if (st?.completo_ts != null) cursore = Math.max(da0, cursore - RILETTURA_S) // aggiornamento: HRV e passi possono arrivare in ritardo
    r.fino_a = fmtSidlyData(cursore); r.inizio_da = fmtSidlyData(da0)
    let errore = ''
    while (nowSec - cursore >= MIN_FINESTRA_S) {
      if (finestreTot >= maxFinestre || righeTot >= maxRighe) break
      const fine = Math.min(cursore + FINESTRA_S, nowSec)
      let g
      try { g = await client.request('GET', `/patient/${a.imei}/stats?fromDate=${encodeURIComponent(fmtSidlyData(cursore))}&toDate=${encodeURIComponent(fmtSidlyData(fine - 1))}`) }
      catch (e: any) { errore = String(e?.message || e).slice(0, 160); break }
      finestreTot++
      if (g.status < 200 || g.status >= 300) { errore = `SiDLY ha risposto HTTP ${g.status}${g.motivo ? ': ' + g.motivo : ''}`; break }
      const p = parseStats(g.json, a.imei)
      try {
        const st2: any[] = [...istruzioniMisure(o.db, p.righe)]
        // completo_ts a NULL: finche' non si e' arrivati a oggi (e importati gli allarmi) il cursore riprende esattamente da qui
        st2.push(o.db.prepare(`INSERT INTO sidly_stato (imei,assistito_id,backfill_da_ts,backfill_fino_ts,backfill_righe,ultimo_errore,completo_ts,updated_at) VALUES (?,?,?,?,?,NULL,NULL,?)
          ON CONFLICT(imei) DO UPDATE SET assistito_id=excluded.assistito_id, backfill_da_ts=excluded.backfill_da_ts, backfill_fino_ts=excluded.backfill_fino_ts,
            backfill_righe=COALESCE(backfill_righe,0)+excluded.backfill_righe, ultimo_errore=NULL, completo_ts=NULL, updated_at=excluded.updated_at`)
          .bind(a.imei, a.assistito_id, da0, fine, p.righe.length, adesso))
        await o.db.batch(st2)
      } catch { errore = 'Scrittura nel DB non riuscita'; break }
      cursore = fine; r.finestre++; r.righe += p.righe.length; righeTot += p.righe.length; r.fino_a = fmtSidlyData(cursore)
    }
    if (errore) {
      r.errore = errore
      try { await o.db.prepare(`INSERT INTO sidly_stato (imei,assistito_id,ultimo_errore,updated_at) VALUES (?,?,?,?) ON CONFLICT(imei) DO UPDATE SET ultimo_errore=excluded.ultimo_errore, updated_at=excluded.updated_at`).bind(a.imei, a.assistito_id, errore, adesso).run() } catch { /* solo diagnostica */ }
    }
    r.completato = !errore && nowSec - cursore < MIN_FINESTRA_S
    // Arrivati a oggi: allarmi (patientIntegrateAlarm), solo i nuovi (1 giorno di margine per gli aggiornamenti di gestione); poi l'assistito risulta aggiornato.
    if (r.completato) {
      let alOk = false
      try {
        const ev = await client.request('GET', `/patientIntegrateAlarm/${a.imei}`)
        if (ev.status >= 200 && ev.status < 300) {
          const ultimoApi = await safeFirst(o.db, `SELECT MAX(ts) AS m FROM sidly_eventi WHERE imei = ? AND origine = 'api'`, a.imei)
          const soglia = Math.max(daA, ultimoApi?.m ? Number(ultimoApi.m) - 86400 : 0)
          const tutti = parseAllarmi(ev.json, a.imei).filter(e => e.ts >= soglia)
          const nuovi = tutti
          if (nuovi.length) await o.db.batch(nuovi.map(e => istruzioneEvento(o.db, e, true)))
          r.eventi = nuovi.length
          alOk = true
        } else avvisi.push(`Allarmi di ${a.nome || a.imei} non letti (HTTP ${ev.status}): verranno ritentati al prossimo aggiornamento`)
      } catch { avvisi.push(`Allarmi di ${a.nome || a.imei} non importati: verranno ritentati al prossimo aggiornamento`) }
      if (alOk) { try { await o.db.prepare('UPDATE sidly_stato SET completo_ts = ? WHERE imei = ?').bind(nowSec, a.imei).run() } catch { /* ritenta al prossimo passaggio */ } }
    }
    if (!r.completato) tuttiCompleti = false
  }
  return { httpStatus: 200, result: { esito: 'eseguito', completato: tuttiCompleti, assistiti: res, righe_scritte: righeTot, finestre_eseguite: finestreTot, avvisi, limiti: { max_finestre: maxFinestre, max_righe: maxRighe } } }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stato e report (sola lettura)
// ─────────────────────────────────────────────────────────────────────────────
export async function statoTelemetria(db: any, nowSec: number = Math.floor(Date.now() / 1000)) {
  const lista = await assistitiAttivi(db)
  const stati = await safeAll(db, 'SELECT * FROM sidly_stato')
  const byImei = new Map<string, any>(stati.map((s: any) => [String(s.imei), s]))
  const tabelle = (await safeFirst(db, `SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name IN ('sidly_misure','sidly_eventi','sidly_stato')`))?.n === 3
  const ranges: any[] = []
  if (tabelle && lista.length) {
    for (let i = 0; i < lista.length; i += 40) {
      const part = lista.slice(i, i + 40)
      try {
        const rs = await db.batch(part.map(a => db.prepare('SELECT MIN(ts) AS dal, MAX(ts) AS al FROM sidly_misure WHERE imei = ?').bind(a.imei)))
        part.forEach((a, j) => ranges.push({ imei: a.imei, ...((rs[j]?.results || [])[0] || {}) }))
      } catch { /* senza range */ }
    }
  }
  const rg = new Map<string, any>(ranges.map(r => [r.imei, r]))
  const fm = (s: any) => (s ? fmtSidlyData(Number(s)) + ' UTC' : null)
  return {
    tabelle_presenti: tabelle,
    assistiti: lista.map(a => {
      const s = byImei.get(a.imei) || {}
      const r = rg.get(a.imei) || {}
      return {
        assistito_id: a.assistito_id, imei: a.imei, nome: a.nome,
        // nessun dato arriva dai braccialetti: tutto e' letto da SiDLY con le API
        misure_dal: fm(r.dal), misure_al: fm(r.al), storico_fino_a: fm(s.backfill_fino_ts), righe_storico: s.backfill_righe ?? 0, errore: s.ultimo_errore || null,
      }
    }),
  }
}

/** Come si interpretano i passi di un punto: 'somma' = passi dell'intervallo (si sommano nel giorno), 'max' = contatore progressivo del giorno. Da verificare con l'anteprima dello storico. */
export const PASSI_MODO: 'somma' | 'max' = 'somma'
const METRICHE = [['hr', 'Frequenza cardiaca (bpm)'], ['spo2', 'SpO2 (%)'], ['sdnn', 'HRV SDNN (ms)'], ['rmssd', 'HRV RMSSD (ms)'], ['resp', 'Frequenza respiratoria (atti/min)'], ['temp', 'Temperatura cutanea (C)'], ['hr_rest', 'FC a riposo (bpm)']] as const
const OFFSET_GIORNO_S = 7200 // giorno "italiano" approssimato (UTC+2): serve solo a raggruppare i passi per giorno

export interface StatMetrica { n: number; media: number | null; min: number | null; max: number | null; sd: number | null }
export interface RigaReport { assistito_id: number; imei: string; nome: string; giorni_con_dati: number; punti: number; passi_medi_giorno: number | null; metriche: Record<string, StatMetrica> }

export async function reportMedie(db: any, o: { giorni: number; assistitoId?: number; nowSec?: number }) {
  const nowSec = o.nowSec ?? Math.floor(Date.now() / 1000)
  const giorni = Math.max(1, Math.min(Math.round(o.giorni || 30), 400))
  const dal = nowSec - giorni * 86400
  const lista = await assistitiAttivi(db, o.assistitoId)
  const aggr = METRICHE.map(([c]) => `AVG(${c}) AS ${c}_a, MIN(${c}) AS ${c}_mn, MAX(${c}) AS ${c}_mx`).join(', ')
  const outer = METRICHE.map(([c]) => `COUNT(${c}_a) AS ${c}_n, AVG(${c}_a) AS ${c}_m, AVG(${c}_a*${c}_a) AS ${c}_q, MIN(${c}_mn) AS ${c}_min, MAX(${c}_mx) AS ${c}_max`).join(', ')
  // I punti entro BUCKET_S (punti dello stesso istante) contano una volta sola.
  const sqlM = `SELECT COUNT(*) AS punti, ${outer} FROM (SELECT ts/${BUCKET_S} AS b, ${aggr} FROM sidly_misure WHERE imei = ? AND ts >= ? AND ts < ? GROUP BY b)`
  const passi = PASSI_MODO === 'max' ? 'MAX(steps)' : 'SUM(s)'
  const sqlS = `SELECT d, COUNT(*) AS n, ${passi} AS s FROM (SELECT (ts+${OFFSET_GIORNO_S})/86400 AS d, ts/${BUCKET_S} AS b, MAX(steps) AS s FROM sidly_misure WHERE imei = ? AND ts >= ? AND ts < ? GROUP BY d, b) GROUP BY d`
  const righe: RigaReport[] = []
  let tabelle = true
  for (let i = 0; i < lista.length; i += 20) {
    const part = lista.slice(i, i + 20)
    let rs: any[] = []
    try { rs = await db.batch(part.flatMap(a => [db.prepare(sqlM).bind(a.imei, dal, nowSec), db.prepare(sqlS).bind(a.imei, dal, nowSec)])) } catch { tabelle = false; break }
    part.forEach((a, j) => {
      const m = (rs[j * 2]?.results || [])[0] || {}
      const gg: any[] = rs[j * 2 + 1]?.results || []
      const metriche: Record<string, StatMetrica> = {}
      for (const [c] of METRICHE) {
        const n = Number(m[`${c}_n`] || 0)
        const media = n ? Number(m[`${c}_m`]) : null
        const sd = n && media !== null ? Math.sqrt(Math.max(0, Number(m[`${c}_q`]) - media * media)) : null
        metriche[c] = { n, media, min: n ? Number(m[`${c}_min`]) : null, max: n ? Number(m[`${c}_max`]) : null, sd }
      }
      const conPassi = gg.filter(x => Number(x.s) > 0)
      righe.push({ assistito_id: a.assistito_id, imei: a.imei, nome: a.nome, giorni_con_dati: gg.length, punti: Number(m.punti || 0),
        passi_medi_giorno: conPassi.length ? conPassi.reduce((t, x) => t + Number(x.s), 0) / conPassi.length : null, metriche })
    })
  }
  // Coorte: ogni assistito pesa uno (media delle medie), per non far dominare chi ha piu' misure.
  const coorte: Record<string, StatMetrica & { assistiti: number }> = {}
  for (const [c] of METRICHE) {
    const v = righe.map(r => r.metriche[c]).filter(x => x.n > 0 && x.media !== null)
    const medie = v.map(x => x.media as number)
    const mm = medie.length ? medie.reduce((t, x) => t + x, 0) / medie.length : null
    const sd = mm !== null && medie.length > 1 ? Math.sqrt(medie.reduce((t, x) => t + (x - mm) ** 2, 0) / (medie.length - 1)) : null
    coorte[c] = { assistiti: v.length, n: v.reduce((t, x) => t + x.n, 0), media: mm, min: v.length ? Math.min(...v.map(x => x.min as number)) : null, max: v.length ? Math.max(...v.map(x => x.max as number)) : null, sd }
  }
  const pm = righe.map(r => r.passi_medi_giorno).filter((x): x is number => x !== null)
  return {
    tabelle_presenti: tabelle, periodo: { giorni, dal: fmtSidlyData(dal) + ' UTC', al: fmtSidlyData(nowSec) + ' UTC' },
    etichette: Object.fromEntries(METRICHE.map(([c, e]) => [c, e])), assistiti: righe,
    coorte: { assistiti_con_dati: righe.filter(r => r.punti > 0).length, assistiti_totali: righe.length, metriche: coorte, passi_medi_giorno: pm.length ? pm.reduce((t, x) => t + x, 0) / pm.length : null, passi_assistiti: pm.length },
    passi_modo: PASSI_MODO,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Dataset delle sole misure (CSV) per le analisi statistiche
// ─────────────────────────────────────────────────────────────────────────────
export const DATASET_COLONNE = ['assistito_id', 'imei', 'ts_utc', 'ts', 'hr', 'hr_q', 'spo2', 'spo2_q', 'temp', 'steps', 'steps_tot', 'pressure', 'sdnn', 'rmssd', 'resp', 'hr_rest', 'wear', 'fonte'] as const

export interface DatasetOpzioni { da?: string; a?: string; assistitoId?: number; dopo?: string; limite?: number }
/**
 * Una pagina del dataset: una riga per (imei, istante), ordinata per imei e ts, con l'id dell'assistito ma SENZA nome o dati anagrafici.
 * L'intestazione c'e' solo nella prima pagina; `prossimo` e' il cursore "imei:ts" per la pagina successiva (null = finito).
 */
export async function datasetMisure(db: any, o: DatasetOpzioni): Promise<{ ok: true; csv: string; righe: number; prossimo: string | null } | { ok: false; status: number; errore: string }> {
  const limite = Math.max(1, Math.min(Math.round(o.limite ?? 20000), 50000))
  const da = o.da ? dataToSec(o.da) : 0
  const a = o.a ? dataToSec(o.a) : null
  if (da === null || (o.a && a === null)) return { ok: false, status: 400, errore: 'Date non valide (formato AAAA-MM-GG)' }
  const fine = a === null ? 4102444800 : a + 86400
  const tab = await safeFirst(db, `SELECT COUNT(*) AS n FROM sqlite_master WHERE type='table' AND name='sidly_misure'`)
  if (!tab || Number(tab.n) < 1) return { ok: false, status: 404, errore: 'Nessuna misura: le tabelle non sono ancora state create (caricare prima lo storico da SiDLY)' }
  const where = ['m.ts >= ?', 'm.ts < ?']
  const par: any[] = [da, fine]
  if (o.assistitoId !== undefined) {
    const x = await safeFirst(db, 'SELECT imei FROM assistiti WHERE id = ?', o.assistitoId)
    const imei = digits(x?.imei)
    if (!IMEI_RE.test(imei)) return { ok: false, status: 404, errore: 'Assistito non trovato o senza IMEI' }
    where.push('m.imei = ?'); par.push(imei)
  }
  if (o.dopo) {
    const m = /^(\d{14,17}):(\d{1,12})$/.exec(o.dopo)
    if (!m) return { ok: false, status: 400, errore: 'Cursore non valido' }
    where.push('(m.imei > ? OR (m.imei = ? AND m.ts > ?))'); par.push(m[1], m[1], Number(m[2]))
  }
  let rows: any[]
  try {
    const r = await db.prepare(`SELECT a.id AS assistito_id, m.imei, m.ts, m.hr, m.hr_q, m.spo2, m.spo2_q, m.temp, m.steps, m.steps_tot, m.pressure, m.sdnn, m.rmssd, m.resp, m.hr_rest, m.wear, m.fonte
      FROM sidly_misure m LEFT JOIN assistiti a ON a.imei = m.imei WHERE ${where.join(' AND ')} ORDER BY m.imei, m.ts LIMIT ?`).bind(...par, limite + 1).all()
    rows = r?.results || []
  } catch { return { ok: false, status: 500, errore: 'Lettura del dataset non riuscita' } }
  const pagina = rows.slice(0, limite)
  const v = (x: any) => (x === null || x === undefined ? '' : String(x))
  const righe = pagina.map(r => [v(r.assistito_id), v(r.imei), new Date(Number(r.ts) * 1000).toISOString(), v(r.ts), v(r.hr), v(r.hr_q), v(r.spo2), v(r.spo2_q), v(r.temp), v(r.steps), v(r.steps_tot), v(r.pressure), v(r.sdnn), v(r.rmssd), v(r.resp), v(r.hr_rest), v(r.wear), v(r.fonte)].join(','))
  const csv = (o.dopo ? '' : DATASET_COLONNE.join(',') + '\n') + righe.join('\n') + (righe.length ? '\n' : '')
  const ultimo = pagina[pagina.length - 1]
  return { ok: true, csv, righe: pagina.length, prossimo: rows.length > limite && ultimo ? `${ultimo.imei}:${ultimo.ts}` : null }
}
