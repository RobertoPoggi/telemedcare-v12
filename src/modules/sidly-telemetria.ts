/**
 * Telemetria SiDLY: DB delle misure degli assistiti eCura.
 *
 *  - Ricevitore frame (push):  gestisciFrame()   <- POST /api/sidly/ingest?k=TOKEN
 *  - Storico (pull):           eseguiStorico()   <- GET /patient/{imei}/stats  (+ /patientIntegrateAlarm/{imei})
 *  - Registrazione frame:      registraFrame()   -> POST /manager/set-url-for-band (o DELETE .../delete-url-for-band)
 *  - Report medie:             reportMedie(), statoTelemetria()
 *
 * Vincoli di D1 rispettati:
 *  - nessun ALTER sulla tabella leads (100 colonne): solo tabelle laterali nuove (sidly_misure, sidly_eventi, sidly_stato);
 *  - UNA riga per (imei, istante) con tutte le metriche in colonne: meno scritture (limite giornaliero di operazioni D1);
 *  - scritture sempre a blocchi (db.batch) e storico a finestre di 7 giorni con tetto di righe per chiamata, ripartendo dal cursore;
 *  - le letture (GET stato/report) NON creano tabelle: le tabelle si creano alla prima scrittura confermata o al primo frame.
 *
 * Cosa arriva da dove (documentazione SiDLY aggiornata): i frame del Vital portano FC, SpO2, temperatura, respiration (FR), hr_store, measurements[] e campi di rete;
 * HRV (SDNN/RMSSD), passi, indice di stress, sonno e indice di attivita' NON sono nei frame. HRV e passi arrivano solo da /stats, quindi servono aggiornamenti
 * periodici dello storico (riletture degli ultimi giorni); stress/sonno/attivita' non sono disponibili. Il ritmo dei frame non e' fisso (i Vital mandano batch).
 * Tutti i timestamp di SiDLY sono UTC, tranne quelli delle misure TIMMEAS / hr_store dei frame, che sono in ora locale del braccialetto.
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
  ultimo_frame_ts INTEGER, ultimo_reason TEXT, batt INTEGER, device_type TEXT, segnale TEXT, rete TEXT, n_frame INTEGER DEFAULT 0,
  frame_registrato_at TEXT, backfill_da_ts INTEGER, backfill_fino_ts INTEGER, backfill_righe INTEGER DEFAULT 0,
  ultimo_errore TEXT, updated_at TEXT)`

let tabelleOk: any = null
/** Crea le tabelle (una volta per istanza). Chiamata SOLO da percorsi di scrittura. */
export async function assicuraTabelle(db: any): Promise<void> {
  if (tabelleOk === db) return
  await db.batch([db.prepare(MISURE_SQL), db.prepare(EVENTI_SQL), db.prepare(STATO_SQL)])
  tabelleOk = db
}
/** Solo per i test: dimentica che le tabelle sono state create. */
export function dimenticaTabelle(): void { tabelleOk = null }

// ─────────────────────────────────────────────────────────────────────────────
// Utilità
// ─────────────────────────────────────────────────────────────────────────────
const digits = (v: unknown) => String(v ?? '').replace(/\D/g, '')
const IMEI_RE = /^\d{14,17}$/
export const BAND_TZ = 'Europe/Rome'
/** Misure ravvicinate (frame vs storico) si fondono in un solo punto per queste finestre di secondi nei report. */
export const BUCKET_S = 120

function num(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const x = typeof v === 'number' ? v : Number(String(v).replace(',', '.'))
  return Number.isFinite(x) ? x : null
}
function inRange(v: number | null, lo: number, hi: number): number | null { return v !== null && v >= lo && v <= hi ? v : null }
const sqlNum = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : 'NULL')

function offsetSec(utcSec: number, tz: string): number {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).formatToParts(new Date(utcSec * 1000))
  const g = (t: string) => Number(p.find(x => x.type === t)?.value)
  return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) / 1000 - utcSec
}
/** Il braccialetto manda l'ora locale come se fosse un epoch: lo riporto a UTC con il fuso del braccialetto. */
export function bandLocalToUtc(localSec: number, tz: string = BAND_TZ): number {
  let u = localSec - offsetSec(localSec, tz)
  u = localSec - offsetSec(u, tz)
  return Math.round(u)
}

const b64ToBytes = (s: string) => { const bin = atob(s.replace(/\s+/g, '')); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out }
const bytesToB64 = (b: Uint8Array) => { let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s) }

/** Chiave di cifratura valida = stringa di esattamente 32 byte (AES-256). */
export function chiaveCifraturaValida(k: unknown): k is string { return typeof k === 'string' && new TextEncoder().encode(k).length === 32 }

/** AES-256-CBC: data = base64( IV(16 byte) | cifrato ), padding PKCS7 (come da documentazione SiDLY). */
export async function decifraFrame(payload: { data: string }, key: string): Promise<any> {
  if (!chiaveCifraturaValida(key)) throw new Error('chiave di cifratura non valida (servono 32 byte)')
  const raw = b64ToBytes(String(payload?.data || ''))
  if (raw.length < 32) throw new Error('dati cifrati troppo corti')
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'AES-CBC' }, false, ['decrypt'])
  const pt = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: raw.slice(0, 16) }, k, raw.slice(16))
  return JSON.parse(new TextDecoder().decode(pt))
}
/** Solo per i test (simula quello che fa SiDLY). */
export async function cifraFrameTest(obj: any, key: string, iv: Uint8Array): Promise<{ encrypted: true; data: string }> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'AES-CBC' }, false, ['encrypt'])
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-CBC', iv }, k, new TextEncoder().encode(JSON.stringify(obj))))
  const all = new Uint8Array(16 + ct.length); all.set(iv, 0); all.set(ct, 16)
  return { encrypted: true, data: bytesToB64(all) }
}

/** Confronto a tempo costante del token del ricevitore. */
export function tokenUguale(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || !a || !b) return false
  const ea = new TextEncoder().encode(a), eb = new TextEncoder().encode(b)
  let d = ea.length ^ eb.length
  for (let i = 0; i < Math.max(ea.length, eb.length); i++) d |= (ea[i] ?? 0) ^ (eb[i] ?? 0)
  return d === 0
}
export function verificaTokenIngest(fornito: string | undefined | null, env: { SIDLY_INGEST_TOKEN?: string }): { ok: true } | { ok: false; status: number; errore: string } {
  const atteso = (env.SIDLY_INGEST_TOKEN || '').trim()
  if (atteso.length < 16) return { ok: false, status: 503, errore: 'Ricevitore frame non configurato (manca SIDLY_INGEST_TOKEN, almeno 16 caratteri)' }
  if (!fornito || !tokenUguale(fornito, atteso)) return { ok: false, status: 401, errore: 'Token non valido' }
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Modello dati
// ─────────────────────────────────────────────────────────────────────────────
export type Fonte = 'frame' | 'stats'
export interface Misura {
  imei: string; ts: number; fonte: Fonte
  hr?: number | null; hr_q?: number | null; spo2?: number | null; spo2_q?: number | null; temp?: number | null
  steps?: number | null; steps_tot?: number | null; pressure?: number | null; sdnn?: number | null; rmssd?: number | null
  resp?: number | null; hr_rest?: number | null; wear?: number | null
}
const COLS = ['hr', 'hr_q', 'spo2', 'spo2_q', 'temp', 'steps', 'steps_tot', 'pressure', 'sdnn', 'rmssd', 'resp', 'hr_rest', 'wear'] as const
export interface Evento {
  imei: string; ts: number; tipo: string; origine: 'frame' | 'api'; alarm_id?: number | null; batt?: number | null
  pulse?: number | null; spo2?: number | null; temp?: number | null; lat?: number | null; lon?: number | null; dettaglio?: string; gestito_da?: string
}
export interface StatoFrame { ts: number; reason: string; batt: number | null; device: string; segnale: string; rete: string }

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
    const vals = rr.slice(i, i + dimBlocco).map(r => `('${r.imei}',${r.ts},${COLS.map(c => sqlNum((r as any)[c])).join(',')},'${r.fonte === 'stats' ? 'stats' : 'frame'}')`).join(',')
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
// Frame in arrivo (push)
// ─────────────────────────────────────────────────────────────────────────────
const REASON_EVENTO: Record<string, string> = { SOS: 'sos', FALL: 'fall', ZONE: 'zone', SOS_CPL: 'sos_cpl', INFO: 'info' }

function posizioneFrame(f: any): { lat: number | null; lon: number | null } {
  // Convenzione storica: il campo "lat" contiene la LONGITUDINE e "long" la LATITUDINE; "loc" = "lon,lat,SORGENTE".
  let lon = num(f.lat), lat = num(f.long)
  if ((lon === null || lat === null) && typeof f.loc === 'string') {
    const p = f.loc.split(',')
    if (p.length >= 2) { lon = num(p[0]); lat = num(p[1]) }
  }
  lat = inRange(lat, -90, 90); lon = inRange(lon, -180, 180)
  if (lat === null || lon === null || (lat === 0 && lon === 0)) return { lat: null, lon: null }
  return { lat, lon }
}

export interface FrameParsed { imei: string; misure: Misura[]; eventi: Evento[]; stato: StatoFrame }

export function parseFrame(f: any, nowSec: number, tz: string = BAND_TZ): FrameParsed | { errore: string } {
  if (!f || typeof f !== 'object' || Array.isArray(f)) return { errore: 'frame non valido' }
  const imei = digits(f.imei)
  if (!IMEI_RE.test(imei)) return { errore: 'IMEI mancante o non valido' }
  const reason = String(f.reason || '').trim().toUpperCase()
  const misure: Misura[] = []
  const eventi: Evento[] = []

  const hrQ = num(f.trustLvl)
  const pulse = inRange(num(f.pulse), 25, 250) // 0 / null = nessuna misura
  const spo2 = inRange(num(f.saturation), 50, 100)
  const temp = inRange(num(f.temp), 20, 45) // 255 = sensore assente, 0 = nessun dato
  // I passi del frame sono ambigui (intervallo oppure dall'ultimo reset): si prendono solo da /stats, per non contarli due volte.
  const resp = inRange(num(f.respiration), 3, 60)
  const batt = inRange(num(f.batt_percent), 1, 100)

  const voci: any[] = []
  if (Array.isArray(f.measurements)) voci.push(...f.measurements)
  if (Array.isArray(f.hr_store)) voci.push(...f.hr_store)
  let ultimo: Misura | null = null
  for (const v of voci) {
    const lt = num(v?.timestamp)
    if (lt === null || lt <= 0) continue
    const ts = bandLocalToUtc(Math.round(lt), tz)
    const m: Misura = { imei, ts, fonte: 'frame',
      hr: inRange(num(v.hr), 25, 250), spo2: inRange(num(v.sat), 50, 100),
      wear: inRange(num(v.wear_percent), 0, 100) }
    if (m.hr !== null) m.hr_q = num(v.hr_quality)
    if (m.spo2 !== null) m.spo2_q = num(v.sat_quality)
    if (m.hr === null && m.spo2 === null && m.wear === null) continue
    misure.push(m)
    if (!ultimo || m.ts >= ultimo.ts) ultimo = m
  }
  const haBatch = voci.length > 0
  if (reason === 'TIMER') {
    if (haBatch) {
      // TIMMEAS: il top-level ripete la misura piu' recente del batch; qui si aggiungono solo i campi che il batch non ha.
      if (ultimo && resp !== null) ultimo.resp = resp
    } else {
      const ts = Math.floor(nowSec / 60) * 60
      const m: Misura = { imei, ts, fonte: 'frame', hr: pulse, hr_q: pulse !== null ? hrQ : null, spo2, spo2_q: spo2 !== null ? hrQ : null, temp, resp }
      if (COLS.some(c => (m as any)[c] !== null && (m as any)[c] !== undefined && c !== 'hr_q' && c !== 'spo2_q')) misure.push(m)
    }
    if (temp !== null && ultimo && haBatch) ultimo.temp = temp
  }

  const tipo = REASON_EVENTO[reason]
  if (tipo) {
    const pos = posizioneFrame(f)
    const det = String(f.meas || f.type || '').trim()
    eventi.push({ imei, ts: Math.floor(nowSec / 60) * 60, tipo, origine: 'frame', batt, pulse, spo2, temp, lat: pos.lat, lon: pos.lon, dettaglio: det || undefined })
  }

  // Campi di rete (Vital): solo diagnostica dell'ultimo frame, nessun dato sanitario.
  const rete = [f.is_wifi === true ? 'WiFi' : '', f.network_access, f.network_band, f.rsrp, f.oprt].filter(x => x !== null && x !== undefined && String(x).trim() !== '').map(x => String(x).replace(/[^\w .+\-/]/g, '').slice(0, 24)).join(' | ').slice(0, 90)
  return { imei, misure, eventi, stato: { ts: Math.round(nowSec), reason, batt, device: String(f.device_type || '').slice(0, 30), segnale: f.signal === null || f.signal === undefined ? '' : String(f.signal).slice(0, 20), rete } }
}

export interface IngestRisultato { status: number; body: Record<string, any> }

/** Elabora un frame ricevuto. Risposta veloce: una sola lettura (assistito noto) + un solo blocco di scritture. */
export async function gestisciFrame(db: any, env: SidlyEnv, corpo: string, nowSec: number): Promise<IngestRisultato> {
  if (corpo.length > 262144) return { status: 413, body: { ok: false, errore: 'frame troppo grande' } }
  let json: any
  try { json = JSON.parse(corpo) } catch { return { status: 400, body: { ok: false, errore: 'JSON non valido' } } }
  if (json && json.encrypted === true) {
    if (!chiaveCifraturaValida(env.SIDLY_ENCRYPT_KEY)) return { status: 400, body: { ok: false, errore: 'frame cifrato ma SIDLY_ENCRYPT_KEY non configurata' } }
    try { json = await decifraFrame(json, env.SIDLY_ENCRYPT_KEY) } catch { return { status: 400, body: { ok: false, errore: 'decifratura non riuscita' } } }
  }
  const p = parseFrame(json, nowSec)
  if ('errore' in p) return { status: 400, body: { ok: false, errore: p.errore } }

  // Si registrano solo i dati dei bracciali dei nostri assistiti.
  const as = await db.prepare('SELECT id FROM assistiti WHERE imei = ? LIMIT 1').bind(p.imei).first()
  if (!as) return { status: 202, body: { ok: true, ignorato: 'IMEI non associato a un assistito' } }

  try {
    await assicuraTabelle(db)
    const st: any[] = [...istruzioniMisure(db, p.misure), ...p.eventi.map(e => istruzioneEvento(db, e, false))]
    st.push(db.prepare(`INSERT INTO sidly_stato (imei,assistito_id,ultimo_frame_ts,ultimo_reason,batt,device_type,segnale,rete,n_frame,updated_at) VALUES (?,?,?,?,?,?,?,?,1,?)
      ON CONFLICT(imei) DO UPDATE SET assistito_id=excluded.assistito_id, ultimo_frame_ts=excluded.ultimo_frame_ts, ultimo_reason=excluded.ultimo_reason,
        batt=COALESCE(excluded.batt,batt), device_type=COALESCE(NULLIF(excluded.device_type,''),device_type), segnale=excluded.segnale, rete=excluded.rete, n_frame=COALESCE(n_frame,0)+1, updated_at=excluded.updated_at`)
      .bind(p.imei, (as as any).id ?? null, p.stato.ts, p.stato.reason, p.stato.batt, p.stato.device, p.stato.segnale, p.stato.rete, new Date(nowSec * 1000).toISOString()))
    await db.batch(st)
  } catch (e: any) {
    return { status: 500, body: { ok: false, errore: 'scrittura non riuscita' } }
  }
  return { status: 200, body: { ok: true, misure: fondiMisure(p.misure).length, eventi: p.eventi.length } }
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
  anteprima?: { finestra: string; punti: Record<string, number>; righe: number; da?: string; a?: string; passi: StatsParsed['passi']; eventi_trovati?: number; stima_righe_totali?: number; esempio?: any[] }
}
export interface StoricoRisultato { httpStatus: number; result: { esito: 'anteprima' | 'eseguito' | 'errore'; completato?: boolean; errore?: string; assistiti?: StoricoAssistito[]; righe_scritte?: number; finestre_eseguite?: number; avvisi?: string[]; limiti?: { max_finestre: number; max_righe: number } } }

export async function eseguiStorico(o: StoricoOpzioni): Promise<StoricoRisultato> {
  const cfg = sidlyConfigError(o.env)
  if (cfg) return { httpStatus: 503, result: { esito: 'errore', errore: cfg } }
  const nowSec = o.nowSec ?? Math.floor(Date.now() / 1000)
  const daSec = dataToSec(o.da)
  if (daSec === null) return { httpStatus: 400, result: { esito: 'errore', errore: 'Data di inizio non valida (formato AAAA-MM-GG)' } }
  if (daSec > nowSec) return { httpStatus: 400, result: { esito: 'errore', errore: 'La data di inizio e\' nel futuro' } }
  if (nowSec - daSec > 800 * 86400) return { httpStatus: 400, result: { esito: 'errore', errore: 'Periodo troppo lungo (massimo circa 26 mesi)' } }
  const maxFinestre = Math.max(1, Math.min(o.maxFinestre ?? 6, 20))
  const maxRighe = Math.max(100, Math.min(o.maxRighe ?? 4000, 20000))
  const lista = await assistitiAttivi(o.db, o.assistitoId)
  if (!lista.length) return { httpStatus: 404, result: { esito: 'errore', errore: o.assistitoId ? 'Assistito non trovato, non ATTIVO o senza IMEI' : 'Nessun assistito ATTIVO con IMEI' } }
  const client = new SidlyClient(o.env, o.fetchImpl)
  const avvisi: string[] = []
  const res: StoricoAssistito[] = []
  let finestreTot = 0, righeTot = 0

  // ANTEPRIMA: una finestra per al massimo 3 assistiti, nessuna scrittura (nemmeno la creazione delle tabelle).
  if (o.dryRun) {
    const campione = lista.slice(0, 3)
    if (lista.length > campione.length) avvisi.push(`Anteprima su ${campione.length} assistiti su ${lista.length} (le chiamate a SiDLY sono limitate per richiesta)`)
    for (const a of campione) {
      const r: StoricoAssistito = { assistito_id: a.assistito_id, imei: a.imei, nome: a.nome, finestre: 0, righe: 0, fino_a: null, completato: false }
      try {
        const fine = Math.min(daSec + FINESTRA_S, nowSec)
        const g = await client.request('GET', `/patient/${a.imei}/stats?fromDate=${encodeURIComponent(fmtSidlyData(daSec))}&toDate=${encodeURIComponent(fmtSidlyData(fine - 1))}`)
        if (g.status < 200 || g.status >= 300) { r.errore = `SiDLY ha risposto HTTP ${g.status}${g.motivo ? ': ' + g.motivo : ''}`; res.push(r); continue }
        const p = parseStats(g.json, a.imei)
        const ev = await client.request('GET', `/patientIntegrateAlarm/${a.imei}`)
        const giorni = Math.max(1, Math.ceil((nowSec - daSec) / 86400))
        const giorniFin = Math.max(1, (fine - daSec) / 86400)
        r.anteprima = { finestra: `${fmtSidlyData(daSec)} - ${fmtSidlyData(fine)} (UTC)`, punti: p.punti, righe: p.righe.length, da: p.da ? fmtSidlyData(p.da) : undefined, a: p.a ? fmtSidlyData(p.a) : undefined, passi: p.passi,
          eventi_trovati: ev.status >= 200 && ev.status < 300 ? parseAllarmi(ev.json, a.imei).length : undefined,
          stima_righe_totali: Math.round(p.righe.length / giorniFin * giorni), esempio: p.righe.slice(0, 3).map(x => ({ ts: fmtSidlyData(x.ts), hr: x.hr ?? null, spo2: x.spo2 ?? null, steps: x.steps ?? null, resp: x.resp ?? null })) }
        r.righe = p.righe.length
      } catch (e: any) { r.errore = String(e?.message || e).slice(0, 160) }
      res.push(r)
    }
    return { httpStatus: 200, result: { esito: 'anteprima', assistiti: res, avvisi, limiti: { max_finestre: maxFinestre, max_righe: maxRighe } } }
  }

  // ESECUZIONE: riprende dal cursore salvato; si ferma a fine budget e il chiamante richiama finche' completato=true.
  try { await assicuraTabelle(o.db) } catch { return { httpStatus: 500, result: { esito: 'errore', errore: 'Impossibile preparare le tabelle della telemetria' } } }
  let tuttiCompleti = true
  for (const a of lista) {
    const r: StoricoAssistito = { assistito_id: a.assistito_id, imei: a.imei, nome: a.nome, finestre: 0, righe: 0, fino_a: null, completato: false, eventi: 0 }
    res.push(r)
    const st = await safeFirst(o.db, 'SELECT backfill_da_ts, backfill_fino_ts FROM sidly_stato WHERE imei = ?', a.imei)
    let da0: number = st?.backfill_da_ts ?? daSec
    let cursore: number = st?.backfill_fino_ts ?? daSec
    if (st?.backfill_da_ts != null && daSec < st.backfill_da_ts) { da0 = daSec; cursore = daSec } // periodo esteso all'indietro: si riparte (idempotente)
    // Aggiornamento periodico: HRV (SDNN/RMSSD), passi e FR arrivano solo da /stats e possono comparire in ritardo,
    // quindi a storico gia' al passo si rileggono gli ultimi RILETTURA_S (idempotente: stesse chiavi, nessun duplicato).
    else if (st?.backfill_fino_ts != null && nowSec - cursore < RILETTURA_S + FINESTRA_S) cursore = Math.max(da0, Math.min(cursore, nowSec - RILETTURA_S))
    r.fino_a = fmtSidlyData(cursore)
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
        st2.push(o.db.prepare(`INSERT INTO sidly_stato (imei,assistito_id,backfill_da_ts,backfill_fino_ts,backfill_righe,ultimo_errore,updated_at) VALUES (?,?,?,?,?,NULL,?)
          ON CONFLICT(imei) DO UPDATE SET assistito_id=excluded.assistito_id, backfill_da_ts=excluded.backfill_da_ts, backfill_fino_ts=excluded.backfill_fino_ts,
            backfill_righe=COALESCE(backfill_righe,0)+excluded.backfill_righe, ultimo_errore=NULL, updated_at=excluded.updated_at`)
          .bind(a.imei, a.assistito_id, da0, fine, p.righe.length, new Date(nowSec * 1000).toISOString()))
        await o.db.batch(st2)
      } catch { errore = 'Scrittura nel DB non riuscita'; break }
      cursore = fine; r.finestre++; r.righe += p.righe.length; righeTot += p.righe.length; r.fino_a = fmtSidlyData(cursore)
    }
    if (errore) {
      r.errore = errore
      try { await o.db.prepare(`INSERT INTO sidly_stato (imei,assistito_id,ultimo_errore,updated_at) VALUES (?,?,?,?) ON CONFLICT(imei) DO UPDATE SET ultimo_errore=excluded.ultimo_errore, updated_at=excluded.updated_at`).bind(a.imei, a.assistito_id, errore, new Date(nowSec * 1000).toISOString()).run() } catch { /* solo diagnostica */ }
    }
    r.completato = !errore && nowSec - cursore < MIN_FINESTRA_S
    // Allarmi (patientIntegrateAlarm): a ogni aggiornamento a storico completato, solo i nuovi (con 1 giorno di margine per gli aggiornamenti di gestione).
    if (r.completato) {
      try {
        const ev = await client.request('GET', `/patientIntegrateAlarm/${a.imei}`)
        if (ev.status >= 200 && ev.status < 300) {
          const ultimoApi = await safeFirst(o.db, `SELECT MAX(ts) AS m FROM sidly_eventi WHERE imei = ? AND origine = 'api'`, a.imei)
          const soglia = Math.max(daSec, ultimoApi?.m ? Number(ultimoApi.m) - 86400 : 0)
          const tutti = parseAllarmi(ev.json, a.imei).filter(e => e.ts >= soglia)
          const frame = await safeAll(o.db, `SELECT ts, tipo FROM sidly_eventi WHERE imei = ? AND origine = 'frame'`, a.imei)
          // Un allarme gia' arrivato come frame (stesso tipo, entro 10 minuti) non si duplica.
          const nuovi = tutti.filter(e => !frame.some((f: any) => f.tipo === e.tipo && Math.abs(Number(f.ts) - e.ts) <= 600))
          if (nuovi.length) await o.db.batch(nuovi.map(e => istruzioneEvento(o.db, e, true)))
          r.eventi = nuovi.length
        } else avvisi.push(`Allarmi di ${a.nome || a.imei} non letti (HTTP ${ev.status}): verranno ritentati`)
      } catch { avvisi.push(`Allarmi di ${a.nome || a.imei} non importati: verranno ritentati`) }
    }
    if (!r.completato) tuttiCompleti = false
  }
  return { httpStatus: 200, result: { esito: 'eseguito', completato: tuttiCompleti, assistiti: res, righe_scritte: righeTot, finestre_eseguite: finestreTot, avvisi, limiti: { max_finestre: maxFinestre, max_righe: maxRighe } } }
}

// ─────────────────────────────────────────────────────────────────────────────
// Registrazione dell'URL di consegna frame (Canale 2) per tutti gli assistiti attivi
// ─────────────────────────────────────────────────────────────────────────────
export function urlFrameDaVerificare(env: SidlyEnv): { ok: true; url: string; cifrato: boolean } | { ok: false; errore: string } {
  const u = (env.SIDLY_FRAME_URL || '').trim()
  if (!u) return { ok: false, errore: 'SIDLY_FRAME_URL non configurato' }
  let url: URL
  try { url = new URL(u) } catch { return { ok: false, errore: 'SIDLY_FRAME_URL non e\' un indirizzo valido' } }
  if (url.protocol !== 'https:') return { ok: false, errore: 'SIDLY_FRAME_URL deve essere https://' }
  if (!/\/api\/sidly\/ingest\/?$/.test(url.pathname)) return { ok: false, errore: 'SIDLY_FRAME_URL deve puntare a /api/sidly/ingest del CRM' }
  const t = (env.SIDLY_INGEST_TOKEN || '').trim()
  if (t.length < 16) return { ok: false, errore: 'Manca SIDLY_INGEST_TOKEN (almeno 16 caratteri): senza, il ricevitore rifiuta tutti i frame' }
  if (!tokenUguale(url.searchParams.get('k') || '', t)) return { ok: false, errore: 'SIDLY_FRAME_URL deve contenere ?k= uguale a SIDLY_INGEST_TOKEN' }
  if (env.SIDLY_ENCRYPT_KEY && !chiaveCifraturaValida(env.SIDLY_ENCRYPT_KEY)) return { ok: false, errore: 'SIDLY_ENCRYPT_KEY non valida: servono esattamente 32 byte' }
  return { ok: true, url: u, cifrato: !!env.SIDLY_ENCRYPT_KEY }
}

export interface RegistraOpzioni { db: any; env: SidlyEnv; dryRun: boolean; rimuovi?: boolean; assistitoId?: number; offset?: number; limite?: number; fetchImpl?: Fetch; nowSec?: number }
export async function registraFrame(o: RegistraOpzioni): Promise<{ httpStatus: number; result: any }> {
  const cfg = sidlyConfigError(o.env)
  if (cfg) return { httpStatus: 503, result: { esito: 'errore', errore: cfg } }
  const v = urlFrameDaVerificare(o.env)
  if (!v.ok) return { httpStatus: 422, result: { esito: 'errore', errore: v.errore } }
  const lista = await assistitiAttivi(o.db, o.assistitoId)
  if (!lista.length) return { httpStatus: 404, result: { esito: 'errore', errore: 'Nessun assistito ATTIVO con IMEI' } }
  const limite = Math.max(1, Math.min(o.limite ?? 20, 30))
  const offset = Math.max(0, o.offset ?? 0)
  const fetta = lista.slice(offset, offset + limite)
  const host = new URL(v.url)
  const mostrato = host.origin + host.pathname // mai il token
  const base = { url: mostrato, cifrato: v.cifrato, totale: lista.length }
  if (o.dryRun) {
    return { httpStatus: 200, result: { esito: 'anteprima', ...base, azione: o.rimuovi ? 'DELETE /manager/delete-url-for-band' : 'POST /manager/set-url-for-band',
      assistiti: fetta.map(a => ({ assistito_id: a.assistito_id, imei: a.imei, nome: a.nome, risultato: 'non eseguito (anteprima)' })), completato: true,
      avviso: 'L\'indirizzo registrato SOSTITUISCE quello eventualmente gia\' impostato su SiDLY per quei braccialetti' } }
  }
  const client = new SidlyClient(o.env, o.fetchImpl)
  const out: any[] = []
  try { await assicuraTabelle(o.db) } catch { /* lo stato e' solo informativo */ }
  for (const a of fetta) {
    try {
      const body: any = o.rimuovi ? { imei: a.imei, url: 'non-usato' } : { imei: a.imei, url: v.url }
      if (!o.rimuovi && v.cifrato) body.encryptKey = o.env.SIDLY_ENCRYPT_KEY
      const r = await client.request(o.rimuovi ? 'DELETE' : 'POST', o.rimuovi ? '/manager/delete-url-for-band' : '/manager/set-url-for-band', body)
      const ok = r.status >= 200 && r.status < 300
      out.push({ assistito_id: a.assistito_id, imei: a.imei, nome: a.nome, risultato: ok ? 'ok' : `HTTP ${r.status}${r.motivo ? ': ' + r.motivo : ''}` })
      if (ok) {
        const t = o.rimuovi ? null : new Date((o.nowSec ?? Math.floor(Date.now() / 1000)) * 1000).toISOString()
        try { await o.db.prepare(`INSERT INTO sidly_stato (imei,assistito_id,frame_registrato_at,updated_at) VALUES (?,?,?,?) ON CONFLICT(imei) DO UPDATE SET frame_registrato_at=excluded.frame_registrato_at, updated_at=excluded.updated_at`).bind(a.imei, a.assistito_id, t, t || new Date().toISOString()).run() } catch { /* ignore */ }
      }
    } catch (e: any) { out.push({ assistito_id: a.assistito_id, imei: a.imei, nome: a.nome, risultato: 'errore: ' + String(e?.message || e).slice(0, 120) }) }
  }
  const prossimo = offset + fetta.length
  const errori = out.filter(x => x.risultato !== 'ok').length
  return { httpStatus: 200, result: { esito: errori ? 'parziale' : 'eseguito', ...base, azione: o.rimuovi ? 'rimozione' : 'registrazione', assistiti: out, completato: prossimo >= lista.length, prossimo_offset: prossimo, errori } }
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
      const ultimo = s.ultimo_frame_ts ? Number(s.ultimo_frame_ts) : null
      return {
        assistito_id: a.assistito_id, imei: a.imei, nome: a.nome,
        frame_registrato: !!s.frame_registrato_at, ultimo_frame: fm(ultimo), ore_dall_ultimo_frame: ultimo ? Math.round((nowSec - ultimo) / 360) / 10 : null, n_frame: s.n_frame ?? 0, batt: s.batt ?? null, device: s.device_type || null, rete: s.rete || null,
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
  // I punti entro BUCKET_S (frame + storico dello stesso istante) contano una volta sola.
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
