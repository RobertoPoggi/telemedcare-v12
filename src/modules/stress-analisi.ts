// Indice di stress: lettura da D1 (sola lettura) + orchestrazione. Tutta la matematica sta in stressModel.js.
// Tabella usata: sidly_misure (solo misure con affidabilita' 3 e RMSSD valorizzato). Giorno = data UTC della misura (nessuna interpolazione dei giorni senza HRV).
import { assistitiAttivi, imeiPrecedenti, tuttiImei } from './sidly-telemetria'
import * as M from './stressModel.js'

/** Giorno x IMEI: somma e numero delle misure RMSSD affidabili. Alimenta il modello (che fa media mobile adattiva, baseline e indice). */
const sqlGiorni = (n: number) =>
  `SELECT imei, date(ts,'unixepoch') AS giorno, SUM(rmssd) AS somma, COUNT(rmssd) AS n FROM sidly_misure WHERE affid = ${M.AFFIDABILITA} AND rmssd IS NOT NULL AND ts <= ? AND imei IN (${Array(n).fill('?').join(',')}) GROUP BY imei, giorno ORDER BY imei, giorno`

/**
 * Query D1 EQUIVALENTE alla media mobile del modello (per un IMEI): media dei valori giornalieri sulle ultime 3 date DISPONIBILI.
 * Serve per verifiche e analisi ad hoc; l'endpoint usa il modello JS (stessi risultati, verificato nei test).
 */
export const SQL_STRESS_WINDOW = `WITH g AS (SELECT imei, date(ts,'unixepoch') AS giorno, AVG(rmssd) AS rmssd_g FROM sidly_misure WHERE affid = ${M.AFFIDABILITA} AND rmssd IS NOT NULL AND imei = ? GROUP BY imei, giorno)
SELECT imei, giorno, AVG(rmssd_g) OVER (PARTITION BY imei ORDER BY giorno ROWS BETWEEN ${M.FINESTRA_GIORNI - 1} PRECEDING AND CURRENT ROW) AS rmssd_3gg FROM g ORDER BY imei, giorno`

async function safeAll(db: any, sql: string, ...b: any[]): Promise<any[]> { try { const r = await db.prepare(sql).bind(...b).all(); return r?.results || [] } catch { return [] } }
async function safeFirst(db: any, sql: string, ...b: any[]): Promise<any | null> { try { return (await db.prepare(sql).bind(...b).first()) || null } catch { return null } }

const r1 = (x: number | null) => (x === null || !Number.isFinite(x) ? null : Math.round(x * 10) / 10)

export interface OpzioniStress { imei?: string; window?: number; baseline?: 'full' | 'rolling60'; nowSec?: number }

/** imei = 'platea' (o assente) | IMEI (14-17 cifre) | id assistito. Restituisce { stato: 404 } se l'assistito non e' tra gli ATTIVI. */
export async function analisiStress(db: any, o: OpzioniStress = {}): Promise<any> {
  const nowSec = o.nowSec ?? Math.floor(Date.now() / 1000)
  const oggi = new Date(nowSec * 1000).toISOString().slice(0, 10)
  const finestra = Math.max(1, Math.min(3650, Math.round(Number(o.window ?? 90)) || 90))
  const baselineModo = o.baseline === 'rolling60' ? 'rolling60' : 'full'
  const richiesta = String(o.imei ?? 'platea').trim().toLowerCase()
  const platea = richiesta === '' || richiesta === 'platea'

  const attivi = await assistitiAttivi(db)
  const prec = await imeiPrecedenti(db)
  const cifre = richiesta.replace(/\D/g, '')
  const scelti = platea ? attivi
    : attivi.filter(a => (/^\d{14,17}$/.test(cifre) ? tuttiImei(a.imei, prec, a.assistito_id).includes(cifre) : a.assistito_id === Number(richiesta)))
  if (!platea && !scelti.length) return { stato: 404, esito: 'errore', errore: 'Assistito non trovato tra quelli attivi' }

  // Righe giorno x IMEI, a blocchi (limite di parametri di D1), poi unite per assistito (braccialetto attuale + precedenti)
  const imeiDi = scelti.map(a => ({ a, ims: tuttiImei(a.imei, prec, a.assistito_id) }))
  const tutti = [...new Set(imeiDi.flatMap(x => x.ims))]
  const perImei = new Map<string, any[]>()
  for (let i = 0; i < tutti.length; i += 40) {
    const part = tutti.slice(i, i + 40)
    for (const r of await safeAll(db, sqlGiorni(part.length), nowSec, ...part)) { const l = perImei.get(String(r.imei)) || []; l.push({ giorno: String(r.giorno), somma: Number(r.somma), n: Number(r.n) }); perImei.set(String(r.imei), l) }
  }
  const risultati = imeiDi.map(({ a, ims }) => ({ a, s: M.serieIndividuale(ims.flatMap(im => perImei.get(im) || []), { baseline: baselineModo }) }))
  const inclusi = risultati.filter(x => x.s.ok)
  const esclusi = risultati.filter(x => !x.s.ok).map(x => ({ assistito_id: x.a.assistito_id, giorni_storico: x.s.giorni_storico, motivo: x.s.motivo }))

  const liste = inclusi.map(x => x.s.serie)
  let serieFull: any[]
  let baseline: number | null
  let motivo: string | null = null
  let dispositivo: string | null = null
  if (platea) {
    serieFull = M.aggregaPlatea(liste)
    baseline = inclusi.length ? inclusi.reduce((t, x) => t + (x.s.baseline as number), 0) / inclusi.length : null
    if (!inclusi.length) motivo = 'nessun assistito con storico HRV sufficiente'
  } else {
    const x = risultati[0]
    serieFull = x.s.serie.map((p: any) => ({ giorno: p.giorno, indice: p.indice, fascia: p.fascia, rmssd_3gg: p.rmssd_3gg, n_assistiti: 1 }))
    baseline = x.s.baseline
    motivo = x.s.ok ? null : x.s.motivo
    // Modello REALE del dispositivo dell'assistito (mai fissato nella UI)
    const d = await safeFirst(db, `SELECT modello FROM dispositivi WHERE imei = ? LIMIT 1`, x.a.imei)
    dispositivo = d && d.modello ? String(d.modello) : null
  }
  const riep = M.riepilogoSerie(serieFull, oggi)
  const a = M.giornoANumero(oggi)
  const serie = serieFull.filter((p: any) => { const n = M.giornoANumero(p.giorno); return n <= a && n > a - finestra })
    .map((p: any) => ({ giorno: p.giorno, indice: p.indice, fascia: p.fascia, rmssd_3gg: r1(p.rmssd_3gg), n_assistiti: p.n_assistiti }))
  const distr = M.distribuzioneFasce(liste, oggi)
  const dist30 = { ...distr }
  return {
    esito: 'ok', vista: platea ? 'platea' : 'individuale', baseline_modo: baselineModo, finestra_giorni: finestra, oggi,
    serie, indice_attuale: riep.indice_attuale, fascia: riep.fascia, giorno_attuale: riep.giorno_attuale, rmssd_3gg: r1(riep.rmssd_3gg),
    baseline: r1(baseline), indice_medio_30gg: riep.indice_medio_30gg, picco_90gg: riep.picco_90gg, fascia_picco: riep.fascia_picco, data_picco: riep.data_picco,
    dispositivo, motivo, assistiti_inclusi: inclusi.length, assistiti_esclusi: esclusi.length, esclusi, distribuzione_30gg: dist30,
    fasce: M.intervalliFasce(), testi: M.testiStress(),
  }
}
