// Sonda SOLA LETTURA sulla batteria dei braccialetti SiDLY (autonomia storica Care Pro).
// Chiama SOLO GET (login a parte): /patient/{imei}/stats e /patientIntegrate/{imei}. Nessun set-url-for-band / delete-url-for-band, nessuna scrittura su D1.
// Cadenza: 1 richiesta al secondo; su HTTP 429 una sola attesa di 60 s, poi la sonda si ferma e lo dichiara.
import { SidlyClient, sidlyConfigError, type SidlyEnv, type Fetch } from './sidly-sync'
import { assistitiAttivi, fmtSidlyData } from './sidly-telemetria'
import { gruppoModello, colonneImei } from './spo2-modelli'

export const INIZIO_STORICO = '2025-05-01 00:00:00'
const RE_CARICA = /charg|discharg/i
export type Pausa = (ms: number) => Promise<void>
const pausaReale: Pausa = ms => new Promise(r => setTimeout(r, ms))

export interface Bersaglio { imei: string; assistito_id: number }

/** Assistiti ATTIVI il cui braccialetto attuale e' Care Pro (modello senza «VITAL»). Nessun nome: solo id e IMEI. */
export async function bersagliCarePro(db: any): Promise<Bersaglio[]> {
  const attivi = await assistitiAttivi(db)
  const modello = new Map<string, string>()
  for (const col of await colonneImei(db)) {
    for (let i = 0; i < attivi.length; i += 40) {
      const part = attivi.slice(i, i + 40).map(a => a.imei)
      try {
        const r = await db.prepare(`SELECT ${col} AS k, modello FROM dispositivi WHERE ${col} IN (${part.map(() => '?').join(',')})`).bind(...part).all()
        for (const x of r?.results || []) if (!modello.has(String(x.k))) modello.set(String(x.k), String(x.modello ?? ''))
      } catch { /* tabella assente */ }
    }
  }
  return attivi.filter(a => gruppoModello(modello.get(a.imei)) === 'CARE PRO').map(a => ({ imei: a.imei, assistito_id: a.assistito_id }))
}

/** Chiamata GET con cadenza 1/s e backoff 60 s su 429 (una volta). */
export function chiamante(client: SidlyClient, pausa: Pausa = pausaReale) {
  let prima = true
  const stato = { chiamate: 0, bloccato429: false }
  const get = async (path: string) => {
    if (stato.bloccato429) return { status: 429, json: null as any, motivo: 'rate limit persistente: sonda interrotta' }
    if (!prima) await pausa(1000); prima = false
    stato.chiamate++
    let r = await client.request('GET', path)
    if (r.status === 429) { await pausa(60000); stato.chiamate++; r = await client.request('GET', path); if (r.status === 429) stato.bloccato429 = true }
    return r
  }
  return { get, stato }
}

/** Percorsi (senza indici di array) delle chiavi che parlano di batteria/carica, con un valore d'esempio e quante volte compaiono. */
export function campiBatteria(json: any): Array<{ percorso: string; esempio: unknown; n: number }> {
  const m = new Map<string, { esempio: unknown; n: number }>()
  const visita = (o: any, p: string, d: number) => {
    if (d > 6 || o === null || typeof o !== 'object') return
    if (Array.isArray(o)) { for (const x of o.slice(0, 2000)) visita(x, p + '[]', d + 1); return }
    for (const [k, v] of Object.entries(o)) {
      const q = p ? p + '.' + k : k
      if (/batt|charge|volt/i.test(k) && (v === null || typeof v !== 'object')) { const e = m.get(q); if (e) e.n++; else m.set(q, { esempio: v, n: 1 }) }
      visita(v, q, d + 1)
    }
  }
  visita(json, '', 0)
  return [...m.entries()].map(([percorso, v]) => ({ percorso, ...v })).slice(0, 15)
}

export function riepilogoStats(json: any, da: number, a: number) {
  const lm: any[] = Array.isArray(json?.lastMeasurements) ? json.lastMeasurements : []
  const ts = lm.map(x => Number(x?.timestamp)).filter(Number.isFinite)
  const info = new Map<string, number>()
  for (const x of lm) { const t = typeof x?.info === 'string' ? x.info.trim() : ''; if (t) info.set(t, (info.get(t) || 0) + 1) }
  const eventiCarica = [...info.entries()].filter(([t]) => RE_CARICA.test(t)).reduce((s, [, n]) => s + n, 0)
  const punti = Object.fromEntries(Object.entries(json || {}).filter(([, v]: any) => v && Array.isArray(v.chart)).map(([k, v]: any) => [k, v.chart.length]))
  return {
    richiesto: { da: fmtSidlyData(da), a: fmtSidlyData(a) },
    metriche_con_serie: Object.keys(punti), punti_per_metrica: punti,
    campi_batteria: campiBatteria(json),
    lastMeasurements: { n: lm.length, chiavi: [...new Set(lm.flatMap(x => (x && typeof x === 'object' ? Object.keys(x) : [])))].slice(0, 30),
      dal: ts.length ? fmtSidlyData(Math.min(...ts)) : null, al: ts.length ? fmtSidlyData(Math.max(...ts)) : null },
    info_distinti: [...info.entries()].sort((x, y) => y[1] - x[1]).slice(0, 15).map(([testo, n]) => ({ testo, n })),
    eventi_carica: eventiCarica,
    campione_grezzo: lm.slice(0, 5),
  }
}

const sino = (b: boolean | null) => (b === null ? 'NON VERIFICABILE' : b ? 'SI' : 'NO')

/** FASE 1: 2-3 IMEI campione. 14 giorni recenti; se compare batteria o carica, rilegge dal 2025-05-01 per vedere la copertura storica. */
export async function faseProbe(env: SidlyEnv, bersagli: Bersaglio[], o: { nowSec?: number; fetchImpl?: Fetch; pausa?: Pausa } = {}): Promise<any> {
  const err = sidlyConfigError(env)
  if (err) return { esito: 'errore', errore: err }
  const nowSec = o.nowSec ?? Math.floor(Date.now() / 1000)
  const campione = bersagli.slice(0, 3)
  const { get, stato } = chiamante(new SidlyClient(env, o.fetchImpl), o.pausa)
  const out: any[] = []
  const inizioSec = Math.floor(Date.parse(INIZIO_STORICO.replace(' ', 'T') + 'Z') / 1000)
  for (const b of campione) {
    const da = nowSec - 14 * 86400
    const r = await get(`/patient/${b.imei}/stats?fromDate=${encodeURIComponent(fmtSidlyData(da))}&toDate=${encodeURIComponent(fmtSidlyData(nowSec - 1))}`)
    if (r.status < 200 || r.status >= 300) { out.push({ imei: b.imei, assistito_id: b.assistito_id, errore: `HTTP ${r.status}${r.motivo ? ' ' + r.motivo : ''}` }); continue }
    const recente = riepilogoStats(r.json, da, nowSec - 1)
    let esteso: any = null
    if (recente.campi_batteria.length > 0 || recente.eventi_carica > 0) {
      const r2 = await get(`/patient/${b.imei}/stats?fromDate=${encodeURIComponent(fmtSidlyData(inizioSec))}&toDate=${encodeURIComponent(fmtSidlyData(nowSec - 1))}`)
      esteso = r2.status >= 200 && r2.status < 300 ? riepilogoStats(r2.json, inizioSec, nowSec - 1) : { errore: `HTTP ${r2.status}${r2.motivo ? ' ' + r2.motivo : ''}` }
    }
    out.push({ imei: b.imei, assistito_id: b.assistito_id, recente, esteso })
  }
  const valutati = out.filter(x => x.recente)
  const batt = valutati.length ? valutati.some(x => x.recente.campi_batteria.length > 0 || (x.esteso?.campi_batteria?.length ?? 0) > 0) : null
  const carica = valutati.length ? valutati.some(x => x.recente.eventi_carica > 0 || (x.esteso?.eventi_carica ?? 0) > 0) : null
  const coperturaStorica = valutati.some(x => x.esteso?.lastMeasurements?.dal && Date.parse(x.esteso.lastMeasurements.dal.replace(' ', 'T') + 'Z') / 1000 < nowSec - 60 * 86400)
  return {
    esito: 'ok', sola_lettura: true, chiamate: stato.chiamate, interrotto_per_429: stato.bloccato429,
    esito_fase1: { batteria_in_stats: sino(batt), eventi_carica_nello_storico: sino(carica), eventi_carica_coprono_oltre_60_giorni: carica ? coperturaStorica : null,
      caso: batt === null ? '?' : (batt || carica) && (coperturaStorica || batt) ? 'A (verificare copertura)' : 'B' },
    imei: out,
  }
}

export interface RigaSnapshot { ts_utc: string; imei: string; assistito_id: number; batteryLevel: number | null; ultima_misura_utc: string; stato: string }

/** CASO B (sola lettura): una GET /patientIntegrate/{imei} per dispositivo, con batteryLevel. */
export async function faseSnapshot(env: SidlyEnv, bersagli: Bersaglio[], o: { nowSec?: number; fetchImpl?: Fetch; pausa?: Pausa } = {}): Promise<any> {
  const err = sidlyConfigError(env)
  if (err) return { esito: 'errore', errore: err }
  const nowSec = o.nowSec ?? Math.floor(Date.now() / 1000)
  const { get, stato } = chiamante(new SidlyClient(env, o.fetchImpl), o.pausa)
  const righe: RigaSnapshot[] = []
  for (const b of bersagli) {
    const r = await get(`/patientIntegrate/${b.imei}`)
    const j = r.json?.data && typeof r.json.data === 'object' ? r.json.data : r.json
    const lvl = Number(j?.batteryLevel), lm = Number(j?.lastMeasurement)
    righe.push({ ts_utc: new Date(nowSec * 1000).toISOString(), imei: b.imei, assistito_id: b.assistito_id,
      batteryLevel: r.status >= 200 && r.status < 300 && Number.isFinite(lvl) ? lvl : null,
      ultima_misura_utc: Number.isFinite(lm) && lm > 0 ? new Date(lm * 1000).toISOString() : '', stato: r.status >= 200 && r.status < 300 ? 'ok' : `HTTP ${r.status}` })
  }
  return { esito: 'ok', sola_lettura: true, chiamate: stato.chiamate, interrotto_per_429: stato.bloccato429, righe }
}

export const snapshotCsv = (righe: RigaSnapshot[]) =>
  ['ts_utc,imei,assistito_id,batteryLevel,ultima_misura_utc,stato', ...righe.map(r => [r.ts_utc, r.imei, r.assistito_id, r.batteryLevel ?? '', r.ultima_misura_utc, r.stato].join(','))].join('\n') + '\n'
