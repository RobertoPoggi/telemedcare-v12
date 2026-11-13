// Test della telemetria SiDLY (ricevitore frame, storico, registrazione frame, report medie).
// Nessuna rete reale: fetch finto; DB = SQLite vero (sql.js) con un adattatore minimo dell'API D1. Dati finti.
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import * as T from '../../src/modules/sidly-telemetria'
import { SidlyClient } from '../../src/modules/sidly-sync'
import type { Fetch, SidlyEnv } from '../../src/modules/sidly-sync'

type Ok = (c: boolean, msg: string) => void
type Section = (t: string) => void

const BASE = 'https://api.sidly-platform-dev.com/api'
const ENV: SidlyEnv = { SIDLY_USER: 'u-test', SIDLY_PASSWORD: 'p-segreta-xyz', SIDLY_BASE_URL: BASE }
const IMEI_A = '868298061208378'
const IMEI_B = '868298066718967'
const IMEI_X = '868298060000001'

/** D1 minimale sopra sql.js: prepare/bind/first/all/run e batch transazionale. Conta batch e istruzioni per verificare il raggruppamento delle scritture. */
async function makeD1() {
  const req = createRequire(join(process.cwd(), 'package.json'))
  const initSqlJs = req('sql.js')
  const SQL = await initSqlJs({ locateFile: (f: string) => join(process.cwd(), 'node_modules', 'sql.js', 'dist', f) })
  const raw = new SQL.Database()
  const all = (sql: string, p: any[]) => { const s = raw.prepare(sql); s.bind(p.map(x => (x === undefined ? null : x))); const out: any[] = []; while (s.step()) out.push(s.getAsObject()); s.free(); return out }
  const stats = { batches: 0, stmtsInBatches: 0, singles: 0 }
  const stmt = (sql: string, p: any[] = []): any => ({
    _sql: sql, _p: p,
    bind: (...b: any[]) => stmt(sql, b),
    run: async () => { stats.singles++; raw.run(sql, p.map(x => (x === undefined ? null : x))); return { success: true } },
    first: async () => all(sql, p)[0] ?? null,
    all: async () => ({ results: all(sql, p) }),
  })
  const db = {
    prepare: (sql: string) => stmt(sql),
    batch: async (list: any[]) => {
      stats.batches++; stats.stmtsInBatches += list.length
      raw.run('BEGIN')
      try {
        const res: any[] = []
        for (const s of list) {
          if (/^\s*SELECT/i.test(s._sql)) res.push({ results: all(s._sql, s._p) })
          else { raw.run(s._sql, s._p.map((x: any) => (x === undefined ? null : x))); res.push({ results: [] }) }
        }
        raw.run('COMMIT'); return res
      } catch (e) { raw.run('ROLLBACK'); throw e }
    },
  }
  raw.run(`CREATE TABLE assistiti (id INTEGER PRIMARY KEY, imei TEXT, status TEXT, nome TEXT, nome_assistito TEXT, cognome_assistito TEXT)`)
  return { db, raw, stats, q: (sql: string, ...p: any[]) => all(sql, p), count: (t: string) => Number(all(`SELECT COUNT(*) AS n FROM ${t}`, [])[0].n), hasTable: (t: string) => all(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [t]).length > 0 }
}

interface Call { method: string; path: string; body: any }
/** SiDLY finta: login, /stats con punti orari, allarmi. Le chiamate verso i dispositivi (set/delete-url-for-band) rispondono 200 ma i test verificano che NON partano mai. */
function makeSidly(opts: { statsStatus?: number; alarms?: any[]; urlStatus?: number; registerDate?: any; registerWrap?: boolean } = {}) {
  const calls: Call[] = []
  const fetchImpl: Fetch = async (url, init) => {
    const method = init?.method || 'GET'
    const path = url.replace(BASE, '')
    const reply = (status: number, json?: any) => ({ status, text: async () => (json === undefined ? '' : JSON.stringify(json)), headers: { get: () => null } })
    if (path === '/user/login') return reply(200, { data: { authentication_token: 'tok-1' } })
    const body = init?.body ? JSON.parse(init.body) : undefined
    calls.push({ method, path, body })
    if (init?.headers?.['X-Access-Token'] !== 'tok-1') return reply(401, {})
    let m = path.match(/^\/patient\/(\d+)\/stats\?fromDate=([^&]+)&toDate=(.+)$/)
    if (method === 'GET' && m) {
      if (opts.statsStatus) return reply(opts.statsStatus, { error: 'boom' })
      const f = Date.parse(decodeURIComponent(m[2]).replace(' ', 'T') + 'Z') / 1000
      const t = Date.parse(decodeURIComponent(m[3]).replace(' ', 'T') + 'Z') / 1000
      const pts = (step: number, y: number | ((x: number) => number), extra: any = {}) => {
        const chart: any[] = []
        for (let x = Math.ceil(f / step) * step; x <= t; x += step) chart.push({ x, y: typeof y === 'function' ? y(x) : y, total: null, trust_lvl: 'HR=3,SpO2=2', ...extra })
        return { chart, stats: { min: 1, max: 2, mean: 1.5 } }
      }
      return reply(200, { pulse: pts(3600, 70), sat: pts(3600, 97), sdnn: pts(86400, 42), rmssd: pts(86400, 35), respiration: pts(3600, 15), steps: { dailyTarget: 5000, ...pts(3600, 100), total: 2400, totalKm: 1.8 }, lastMeasurements: [] })
    }
    if (method === 'GET' && /^\/patientIntegrate\/\d+$/.test(path)) {
      const rd = 'registerDate' in opts ? opts.registerDate : Date.UTC(2026, 10, 3, 10, 0, 0) / 1000
      const o: any = { imei: path.split('/').pop(), ...(rd === undefined ? {} : { registerDate: rd }) }
      return reply(200, opts.registerWrap ? { data: o } : o)
    }
    if (method === 'GET' && /^\/patientIntegrateAlarm\/\d+$/.test(path)) return reply(200, opts.alarms || [])
    if (path === '/manager/set-url-for-band' || path === '/manager/delete-url-for-band') return reply(opts.urlStatus || 200, {})
    return reply(404, {})
  }
  return { calls, fetchImpl }
}

const NOW = Date.UTC(2026, 10, 12, 12, 0, 0) / 1000

export async function runTelemetriaTests(ok: Ok, section: Section) {
  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 6: scrittura delle misure (fusione, COALESCE, blocchi)')
  {
    const d = await makeD1(); T.dimenticaTabelle(); await T.assicuraTabelle(d.db)
    const ts = 1780000000
    await d.db.batch(T.istruzioniMisure(d.db, [{ imei: IMEI_A, ts, fonte: 'stats', hr: 70, spo2: 98 }]))
    await d.db.batch(T.istruzioniMisure(d.db, [{ imei: IMEI_A, ts, fonte: 'stats', hr: null, resp: 15, sdnn: 40 }]))
    const r = d.q(`SELECT * FROM sidly_misure`)
    ok(r.length === 1 && r[0].hr === 70 && r[0].spo2 === 98 && r[0].resp === 15 && r[0].sdnn === 40 && r[0].fonte === 'stats', 'un valore assente non cancella quello già salvato; i nuovi valori si aggiungono')
    await d.db.batch(T.istruzioniMisure(d.db, [{ imei: IMEI_A, ts, fonte: 'stats', hr: 72 }]))
    ok(d.q(`SELECT hr FROM sidly_misure`)[0].hr === 72, 'un valore nuovo aggiorna quello vecchio')
    const molte: T.Misura[] = []
    for (let i = 0; i < 100; i++) molte.push({ imei: IMEI_A, ts: 1790000000 + i * 60, fonte: 'stats', hr: 60 + (i % 10) })
    const ist = T.istruzioniMisure(d.db, molte)
    ok(ist.length === 3, '100 righe → 3 INSERT multi-riga (40 per istruzione), non 100 scritture')
    await d.db.batch(ist)
    ok(d.count('sidly_misure') === 101, 'tutte le righe scritte')
    ok(T.fondiMisure([{ imei: 'abc', ts: 5, fonte: 'stats', hr: 70 }, { imei: IMEI_A, ts: -1, fonte: 'stats', hr: 70 }, { imei: IMEI_A, ts: 0, fonte: 'stats', hr: 70 }]).length === 0, 'IMEI non numerico o istante non valido: scartati (niente testo libero nell\'SQL)')
    ok(d.q(`SELECT COUNT(*) AS n FROM pragma_table_info('sidly_misure')`)[0].n < 30, 'tabella misure con poche colonne (limite D1 di 100 colonne rispettato)')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 7: lettura di /stats e degli allarmi')
  {
    const p = T.parseStats({
      pulse: { chart: [{ x: 1781241462, y: 72, total: null, trust_lvl: 'HR=3,SpO2=2' }, { x: 1781241500000, y: 400, trust_lvl: '' }, { x: 1781241600, y: 0 }, { x: 'abc', y: 70 }], stats: { min: 58, max: 96, mean: 71.4 }, newest: 72 },
      sat: { chart: [{ x: 1781241462, y: 97, trust_lvl: 'HR=3,SpO2=2' }, { x: 1781241800, y: 40 }] },
      sdnn: { chart: [{ x: 1781241462, y: 42.5 }] }, rmssd: { chart: [{ x: 1781241462, y: 31 }] }, respiration: { chart: [{ x: 1781241462, y: 15 }, { x: 1781241900, y: 120 }] },
      temperature: { chart: [{ x: 1781241462, y: 32.5 }] }, restingPulse: { chart: [{ x: 1781241462, y: 58 }] },
      steps: { dailyTarget: 5000, chart: [{ x: 1781241462, y: 120, total: 3420 }, { x: 1781245062, y: 80, total: 3500 }], total: 3420, totalKm: 2.61 }, lastMeasurements: [] }, IMEI_A)
    const r0 = p.righe.find(r => r.ts === 1781241462)!
    ok(r0.hr === 72 && r0.hr_q === 3 && r0.spo2 === 97 && r0.spo2_q === 2 && r0.sdnn === 42.5 && r0.rmssd === 31 && r0.resp === 15 && r0.temp === 32.5 && r0.hr_rest === 58 && r0.steps === 120 && r0.steps_tot === 3420, 'stesso istante: tutte le metriche (FC, SpO2, HRV, FR, temperatura, riposo, passi) sulla stessa riga')
    ok(p.righe.some(r => r.ts === 1781241500 && r.hr === undefined) === false, 'timestamp in millisecondi normalizzati a secondi e valore fuori range (FC 400) scartato')
    ok(!p.righe.some(r => r.ts === 1781241600) && !p.righe.some(r => r.spo2 === 40) && !p.righe.some(r => r.resp === 120), 'zero e valori impossibili (SpO2 40, FR 120) scartati')
    ok(p.punti.pulse === 1 && p.punti.sat === 1 && p.passi.dichiarato === 3420 && p.passi.somma_punti === 200 && p.passi.dailyTarget === 5000, 'conteggio punti per metrica e controllo passi (dichiarato vs somma) per la verifica')
    ok(T.parseStats(null, IMEI_A).righe.length === 0 && T.parseStats({ error: 'x' }, IMEI_A).righe.length === 0, 'risposta vuota o di errore: nessuna riga')

    const al = T.parseAllarmi([
      { id: 591109, type: 'sos', receivedDate: '2026-08-14T07:47:24+00:00', pulse: 0, batteryLevel: 46, sat: 0, temperature: 0, latitude: 45.480154, longitude: 9.199744, handledBy: 'Mario Rossi', handledTime: 0.132, description: { caseDescription: 'Falso allarme', takenActionDescription: 'x' } },
      { id: 2, type: 'leavezone', receivedDate: '2026-08-15T10:00:00+00:00', latitude: 0, longitude: 0 },
      { id: 3, type: 'boh', receivedDate: '2026-08-15T10:00:00+00:00' }, { id: 4, type: 'fall', receivedDate: 'non-una-data' }], IMEI_A)
    ok(al.length === 2 && al[0].tipo === 'sos' && al[0].ts === Date.parse('2026-08-14T07:47:24Z') / 1000 && al[0].lat === 45.480154 && al[0].pulse === null && al[0].alarm_id === 591109, 'allarme SOS: data UTC, coordinate corrette, pulse 0 → assente')
    ok(al[1].tipo === 'zone' && al[1].lat === null && al[1].lon === null, 'leavezone → zone; posizione 0,0 = assente; tipi o date sconosciuti scartati')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 8: storico (anteprima senza scritture, esecuzione a finestre, ripresa, incrementale)')
  {
    const d = await makeD1(); T.dimenticaTabelle()
    d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Giorgia', 'Origoni'), (2, '${IMEI_B}', 'ATTIVO', 'Laura', 'Calvi'), (3, '868298060000009', 'CESSATO', 'Ex', 'Assistito'), (4, NULL, 'ATTIVO', 'Senza', 'Imei')`)
    const P = makeSidly()

    const dry = await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-11-01', dryRun: true, nowSec: NOW, fetchImpl: P.fetchImpl })
    ok(dry.httpStatus === 200 && dry.result.esito === 'anteprima' && dry.result.assistiti!.length === 2, 'anteprima: solo assistiti ATTIVI con IMEI')
    ok(!d.hasTable('sidly_misure') && !d.hasTable('sidly_stato') && d.stats.batches === 0 && d.stats.singles === 0, 'anteprima: NESSUNA scrittura nel DB (nemmeno la creazione delle tabelle)')
    ok(P.calls.every(c => c.method === 'GET'), 'anteprima: solo chiamate GET a SiDLY')
    const a0 = dry.result.assistiti![0]
    ok(a0.anteprima && a0.anteprima.punti.pulse > 0 && a0.anteprima.passi.dichiarato === 2400 && a0.anteprima.righe > 0 && (a0.anteprima.stima_righe_totali || 0) > a0.anteprima.righe, 'anteprima: punti per metrica, controllo passi e stima delle righe totali')

    ok((await T.eseguiStorico({ db: d.db, env: ENV, da: 'ieri', dryRun: true, nowSec: NOW, fetchImpl: P.fetchImpl })).httpStatus === 400, 'data di inizio non valida: 400')
    ok((await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-12-01', dryRun: true, nowSec: NOW, fetchImpl: P.fetchImpl })).httpStatus === 400, 'data di inizio nel futuro: 400')
    ok((await T.eseguiStorico({ db: d.db, env: ENV, da: '2010-01-01', dryRun: true, nowSec: NOW, fetchImpl: P.fetchImpl })).httpStatus === 400, 'periodo oltre 10 anni: 400')
    ok((await T.eseguiStorico({ db: d.db, env: {}, da: '2026-11-01', dryRun: true, nowSec: NOW, fetchImpl: P.fetchImpl })).httpStatus === 503, 'senza credenziali SiDLY: 503')

    // Esecuzione con una sola finestra per chiamata: si riprende dal cursore
    const calls0 = P.calls.length
    const e1 = await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-11-01', dryRun: false, assistitoId: 1, nowSec: NOW, fetchImpl: P.fetchImpl, maxFinestre: 1 })
    ok(e1.result.esito === 'eseguito' && e1.result.completato === false && e1.result.finestre_eseguite === 1, 'esecuzione parziale: una finestra, non completato')
    ok(P.calls.slice(calls0).filter(c => c.path.includes('/stats')).length === 1 && d.count('sidly_misure') === 7 * 24, 'prima finestra: 7 giorni × 24 punti orari (una riga per istante)')
    ok(d.q(`SELECT sdnn, rmssd, resp, steps FROM sidly_misure WHERE ts = ?`, Date.UTC(2026, 10, 2) / 1000)[0]?.sdnn === 42, 'HRV (SDNN/RMSSD), FR e passi dallo storico sulla stessa riga')
    const e2 = await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-11-01', dryRun: false, assistitoId: 1, nowSec: NOW, fetchImpl: P.fetchImpl, maxFinestre: 5 })
    ok(e2.result.completato === true && d.count('sidly_misure') === 276, 'ripresa dal cursore: storico completo (11,5 giorni = 276 istanti), nessun buco')
    const wins = P.calls.slice(calls0).filter(c => c.path.includes('/stats'))
    ok(wins.length === 2 && !P.calls.some(c => c.method !== 'GET'), `due chiamate /stats in tutto (finestre di 7 + 4,5 giorni; trovate ${wins.length}) e nessuna scrittura su SiDLY`)
    ok(/fromDate=2026-11-01%2000%3A00%3A00/.test(wins[0].path) && /toDate=2026-11-07%2023%3A59%3A59/.test(wins[0].path), 'finestra in UTC con formato AAAA-MM-GG HH:MM:SS, fine inclusa -1 secondo')
    const nCalls = P.calls.length
    const e3 = await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-11-01', dryRun: false, assistitoId: 1, nowSec: NOW, fetchImpl: P.fetchImpl })
    ok(d.count('sidly_misure') === 276 && e3.result.completato === true && e3.result.assistiti![0].aggiornato === true, 'rilancio a storico completo: nessun duplicato, assistito «aggiornato»')
    ok(P.calls.length === nCalls, 'assistito aggiornato da meno di 6 ore: nessuna chiamata a SiDLY (si risparmiano richieste)')
    const e3b = await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-11-01', dryRun: false, assistitoId: 1, nowSec: NOW + T.AGGIORNATO_S + 60, fetchImpl: P.fetchImpl })
    ok(e3b.result.assistiti![0].aggiornato !== true && P.calls.slice(nCalls).filter(c => c.path.includes('/stats')).length >= 1, 'oltre le 6 ore si rileggono gli ultimi 2 giorni (HRV e passi possono arrivare in ritardo)')
    const T7 = NOW + 13 * 3600
    const e4 = await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-11-01', dryRun: false, assistitoId: 1, nowSec: T7, fetchImpl: P.fetchImpl })
    ok(e4.result.completato === true && d.count('sidly_misure') === 289, `aggiornamento incrementale dopo 13 ore (oltre le 6 di «aggiornato»): solo i punti nuovi, nessun duplicato (trovate ${d.count('sidly_misure')} righe)`)
    ok(d.stats.batches <= 16, `scritture a blocchi: ${d.stats.batches} batch in totale per 289 punti (non una scrittura per punto)`)
    const stato = d.q(`SELECT * FROM sidly_stato WHERE imei = ?`, IMEI_A)[0]
    ok(stato.backfill_da_ts === Date.UTC(2026, 10, 1) / 1000 && stato.backfill_fino_ts === T7 && stato.ultimo_errore === null && stato.completo_ts === T7, 'stato: inizio, cursore e nessun errore')

    // Tetto di righe per richiesta
    const d2 = await makeD1(); T.dimenticaTabelle()
    d2.raw.run(`INSERT INTO assistiti (id, imei, status) VALUES (1, '${IMEI_A}', 'ATTIVO'), (2, '${IMEI_B}', 'ATTIVO')`)
    const r2 = await T.eseguiStorico({ db: d2.db, env: ENV, da: '2026-11-01', dryRun: false, nowSec: NOW, fetchImpl: makeSidly().fetchImpl, maxFinestre: 20, maxRighe: 100 })
    ok(r2.result.completato === false && r2.result.assistiti!.some(a => !a.completato), 'tetto di righe per richiesta: si ferma e chiede di rilanciare')
    let guard = 0
    while (!(await T.eseguiStorico({ db: d2.db, env: ENV, da: '2026-11-01', dryRun: false, nowSec: NOW, fetchImpl: makeSidly().fetchImpl, maxFinestre: 20, maxRighe: 100 })).result.completato && guard++ < 20) { /* rilancio */ }
    ok(guard < 20 && d2.count('sidly_misure') === 552, 'rilanci successivi: entrambi gli assistiti completi (2 × 276), nessun duplicato')

    // Errore SiDLY: registrato, nessun dato parziale inventato
    const d3 = await makeD1(); T.dimenticaTabelle()
    d3.raw.run(`INSERT INTO assistiti (id, imei, status) VALUES (1, '${IMEI_A}', 'ATTIVO')`)
    const r3 = await T.eseguiStorico({ db: d3.db, env: ENV, da: '2026-11-01', dryRun: false, nowSec: NOW, fetchImpl: makeSidly({ statsStatus: 500 }).fetchImpl })
    ok(r3.result.completato === false && /HTTP 500/.test(r3.result.assistiti![0].errore || '') && d3.count('sidly_misure') === 0, 'errore 500 di SiDLY: nessuna riga, errore riportato')
    ok(/HTTP 500/.test(d3.q(`SELECT ultimo_errore FROM sidly_stato`)[0]?.ultimo_errore || ''), 'errore salvato nello stato per la Dashboard')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 8b: «ultime N misurazioni» per assistito (prova controllata)')
  {
    const nuovoDb = async () => {
      const d = await makeD1(); T.dimenticaTabelle()
      d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Giorgia', 'Origoni'), (2, '${IMEI_B}', 'ATTIVO', 'Laura', 'Calvi'), (3, '${IMEI_X}', 'CESSATO', 'Non', 'Attivo')`)
      return d
    }
    const base = (d: any, P: any, extra: any = {}) => ({ db: d.db, env: ENV, ultime: 100, assistitoId: 1, dryRun: false, nowSec: NOW, fetchImpl: P.fetchImpl, ...extra })

    // Anteprima: solo GET, nessuna scrittura (nemmeno le tabelle)
    {
      const d = await nuovoDb(); const P = makeSidly()
      const r = await T.eseguiUltime(base(d, P, { dryRun: true, ultime: 1000 }))
      ok(r.httpStatus === 200 && r.result.esito === 'anteprima' && r.result.assistiti!.length === 1 && !!r.result.assistiti![0].anteprima, 'ultime: anteprima per un solo assistito')
      ok(!d.hasTable('sidly_misure') && !d.hasTable('sidly_stato') && d.stats.batches === 0 && d.stats.singles === 0, 'ultime: anteprima senza NESSUNA scrittura nel DB')
      ok(P.calls.every(c => c.method === 'GET') && P.calls.filter(c => c.path.includes('/stats')).length === 1, 'ultime: anteprima = solo GET, una sola finestra /stats')
    }

    // Esecuzione con N minore del disponibile: esattamente N, le piu' recenti
    const d = await nuovoDb(); const P = makeSidly()
    const r1 = await T.eseguiUltime(base(d, P, { ultime: 100 }))
    const a1 = r1.result.assistiti![0]
    ok(r1.result.esito === 'eseguito' && r1.result.completato === true && d.count('sidly_misure') === 100, `ultime 100: esattamente 100 misurazioni importate (trovate ${d.count('sidly_misure')})`)
    const mx = Number(d.q('SELECT MAX(ts) AS m FROM sidly_misure')[0].m), mn = Number(d.q('SELECT MIN(ts) AS m FROM sidly_misure')[0].m)
    ok(mx >= NOW - 3600 && mx <= NOW, 'ultime 100: sono le PIU\' RECENTI (la piu\' nuova e\' di meno di un\'ora fa)')
    ok(mx - mn === 99 * 3600, 'ultime 100: 100 istanti orari consecutivi senza buchi')
    ok(a1.raccolte_totali === 100 && !!a1.dal && !!a1.al, 'ultime 100: risposta con periodo coperto (dal/al)')
    ok(P.calls.every(c => c.method === 'GET'), 'ultime: nessuna scrittura su SiDLY (solo GET)')
    const st = d.q('SELECT * FROM sidly_stato WHERE imei = ?', IMEI_A)[0]
    ok(st && st.backfill_fino_ts === null && st.backfill_da_ts === null && st.completo_ts === null, 'ultime: il cursore dello storico completo NON viene toccato')
    ok(st.registrato_ts === Date.UTC(2026, 10, 2) / 1000, 'ultime: salvata la data di attivazione del braccialetto')
    ok(d.count('sidly_misure') === 100 && d.q('SELECT COUNT(DISTINCT imei) AS n FROM sidly_misure')[0].n === 1, 'ultime: solo le misure dell\'assistito richiesto')

    // Rilancio: le misurazioni gia' nel DB non si rileggono ne' si riscrivono; si aggiungono le 100 NUOVE successive (piu' vecchie)
    const mnPrima = mn
    const dryDopo = await T.eseguiUltime(base(d, P, { ultime: 100, dryRun: true }))
    ok(dryDopo.result.assistiti![0].anteprima?.gia_nel_db === 100, 'ultime: l\'anteprima dopo un import dice quante misurazioni sono gia\' nel DB (100)')
    const scritturePrima = d.stats.singles + d.stats.stmtsInBatches
    const r1b = await T.eseguiUltime(base(d, P, { ultime: 100 }))
    ok(r1b.result.completato === true && r1b.result.righe_scritte === 100 && d.count('sidly_misure') === 200, `ultime: rilancio = altre 100 misurazioni NUOVE (non le stesse 100): totale ${d.count('sidly_misure')}`)
    const mn2 = Number(d.q('SELECT MIN(ts) AS m FROM sidly_misure')[0].m), mx2 = Number(d.q('SELECT MAX(ts) AS m FROM sidly_misure')[0].m)
    ok(mx2 === mx && mn2 === mnPrima - 100 * 3600 && mx2 - mn2 === 199 * 3600, 'ultime: il rilancio parte dalla piu\' recente NON presente e prosegue a ritroso senza buchi ne\' sovrapposizioni')
    ok(d.stats.singles + d.stats.stmtsInBatches > scritturePrima, 'ultime: il rilancio scrive solo righe nuove')
    // Se tutto il recente e' gia' nel DB e l'assistito e' arrivato all'inizio, non c'e' nulla da aggiungere
    const dTutto = await nuovoDb(); const PT = makeSidly()
    await T.eseguiUltime(base(dTutto, PT, { ultime: 1000 }))
    const totTutto = dTutto.count('sidly_misure')
    const rTutto = await T.eseguiUltime(base(dTutto, PT, { ultime: 1000 }))
    ok(rTutto.result.completato === true && rTutto.result.righe_scritte === 0 && dTutto.count('sidly_misure') === totTutto, 'ultime: se le misurazioni disponibili sono gia\' tutte nel DB, il rilancio non aggiunge nulla')

    // N maggiore di quelle esistenti: prende solo quelle che ci sono
    const d2 = await nuovoDb(); const P2 = makeSidly()
    const r2 = await T.eseguiUltime(base(d2, P2, { ultime: 1000 }))
    const tot = d2.count('sidly_misure')
    ok(r2.result.completato === true && tot > 100 && tot < 1000, `ultime 1000 con meno di 1000 misurazioni disponibili: prende solo quelle che esistono (${tot})`)
    ok(Number(d2.q('SELECT MIN(ts) AS m FROM sidly_misure')[0].m) >= Date.UTC(2026, 10, 2) / 1000, 'ultime 1000: non va prima della data di attivazione del braccialetto')
    const pagine = r2.result.assistiti![0].finestre
    ok(pagine >= 2 && P2.calls.filter(c => c.path.includes('/stats')).length === pagine, `ultime 1000: legge a ritroso a finestre di 7 giorni e si ferma all'attivazione (${pagine} finestre)`)

    // Ripresa a pezzi (una finestra per richiesta) = stesso risultato di una richiesta sola
    const d3 = await nuovoDb(); const P3 = makeSidly()
    let r3 = await T.eseguiUltime(base(d3, P3, { ultime: 1000, maxFinestre: 1 }))
    let giri = 1
    while (!r3.result.completato && giri < 10) {
      const c = r3.result.assistiti![0].continua!
      r3 = await T.eseguiUltime(base(d3, P3, { ultime: 1000, maxFinestre: 1, primaDi: c.prima_di, raccolte: c.raccolte })); giri++
    }
    ok(giri >= 2 && d3.count('sidly_misure') === tot, `ultime: ripresa con prima_di + raccolte (${giri} richieste) = stesso numero di misure di una richiesta sola (${tot})`)

    // N tagliato esattamente a meta' di una finestra: nessuna riga in piu'
    const d4 = await nuovoDb(); const P4 = makeSidly()
    await T.eseguiUltime(base(d4, P4, { ultime: 200 }))
    ok(d4.count('sidly_misure') === 200, 'ultime 200 (oltre una finestra da 168): esattamente 200, le righe in eccesso della finestra piu\' vecchia sono scartate')

    // Compatibile con lo storico completo successivo: nessun duplicato, copre tutto
    const dC = await nuovoDb(); const PC = makeSidly()
    await T.eseguiUltime(base(dC, PC, { ultime: 100 }))
    let g = 0
    while (!(await T.eseguiStorico({ db: dC.db, env: ENV, da: 'inizio', dryRun: false, assistitoId: 1, nowSec: NOW, fetchImpl: PC.fetchImpl, maxFinestre: 20 })).result.completato && g++ < 10) { /* rilancia */ }
    ok(dC.count('sidly_misure') === tot, `dopo «ultime 100», lo storico dall'inizio completa senza duplicati (${dC.count('sidly_misure')} = ${tot})`)

    // Allarmi: solo dal punto piu' vecchio delle misure tenute
    const iso = (x: number) => new Date(x * 1000).toISOString().replace('.000Z', '+00:00')
    const dA = await nuovoDb()
    const PA = makeSidly({ alarms: [
      { id: 21, type: 'sos', receivedDate: iso(NOW - 3600), pulse: 80, batteryLevel: 50 },
      { id: 22, type: 'fall', receivedDate: iso(NOW - 8 * 86400), pulse: 80, batteryLevel: 50 }] })
    await T.eseguiUltime(base(dA, PA, { ultime: 100 }))
    ok(dA.count('sidly_eventi') === 1 && dA.q('SELECT tipo FROM sidly_eventi')[0].tipo === 'sos', 'ultime 100: importa solo gli allarmi del periodo coperto dalle misure (non quello di 8 giorni fa)')

    // Errori e validazioni
    const dE = await nuovoDb()
    const rE = await T.eseguiUltime(base(dE, makeSidly({ statsStatus: 500 })))
    ok(rE.result.assistiti![0].errore!.includes('HTTP 500') && dE.count('sidly_misure') === 0 && rE.result.completato === false, 'ultime: errore 500 di SiDLY: nessuna riga scritta, errore riportato')
    ok(/HTTP 500/.test(dE.q('SELECT ultimo_errore FROM sidly_stato')[0]?.ultimo_errore || ''), 'ultime: errore salvato nello stato')
    for (const [n, nome] of [[0, '0'], [-5, 'negativo'], [1.5, 'decimale'], [T.ULTIME_MAX + 1, 'oltre il massimo']] as const) {
      ok((await T.eseguiUltime(base(dE, makeSidly(), { ultime: n as number, dryRun: true }))).httpStatus === 400, `ultime ${nome}: 400`)
    }
    ok((await T.eseguiUltime(base(dE, makeSidly(), { ultime: 100, raccolte: 100, dryRun: true }))).httpStatus === 400, 'ultime: "raccolte" non valido: 400')
    ok((await T.eseguiUltime(base(dE, makeSidly(), { primaDi: NOW + 1000, dryRun: true }))).httpStatus === 400, 'ultime: "prima_di" nel futuro: 400')
    ok((await T.eseguiUltime(base(dE, makeSidly(), { assistitoId: 3, dryRun: true }))).httpStatus === 404, 'ultime: assistito non ATTIVO: 404')
    ok((await T.eseguiUltime({ ...base(dE, makeSidly()), env: {} })).httpStatus === 503, 'ultime: senza credenziali SiDLY: 503')

    // Data di registrazione non disponibile (es. HTTP 404/assente): avviso e ricerca limitata a 12 mesi, nessuna data inventata
    const dR = await nuovoDb()
    const rR = await T.eseguiUltime(base(dR, makeSidly({ registerDate: undefined }), { ultime: 100 }))
    ok(rR.result.completato === true && dR.count('sidly_misure') === 100 && (rR.result.avvisi || []).some(x => /12 mesi/.test(x)), 'ultime: senza data di registrazione le ultime N si leggono comunque, con avviso (ricerca limitata a 12 mesi)')
    ok(dR.q('SELECT registrato_ts FROM sidly_stato')[0].registrato_ts === null, 'ultime: senza data di registrazione non si salva nessuna data inventata')

    // Sorgente: rotta e Dashboard
    const idx = readFileSync('src/index.tsx', 'utf8'), dash = readFileSync('src/modules/dashboard-templates-new.ts', 'utf8')
    const i = idx.search(/app\.post\('\/api\/sidly\/storico'/)
    const blk = idx.slice(i, i + 3500)
    ok(/body\?\.ultime/.test(blk) && /Con "ultime" serve assistito_id/.test(blk) && /checkSessionOrKey\(/.test(blk) && /conferma_scrittura === true/.test(blk), 'rotta storico: «ultime» richiede assistito_id, resta protetta e scrive solo con conferma_scrittura')
    ok(/telModoUltime/.test(dash) && /ultime:\s*n,\s*assistito_id/.test(dash) && /dry_run:\s*true/.test(dash), 'Dashboard: modalita\' «Ultime N» con anteprima in sola lettura prima della conferma')
    ok(/id="telN"[^>]*value="1000"/.test(dash), 'Dashboard: valore predefinito 1000 misurazioni per assistito')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 9: allarmi letti da SiDLY (nessun duplicato)')
  {
    const d = await makeD1(); T.dimenticaTabelle()
    d.raw.run(`INSERT INTO assistiti (id, imei, status) VALUES (1, '${IMEI_A}', 'ATTIVO')`)
    const tSos = Date.UTC(2026, 10, 5, 8, 30, 0) / 1000
    const iso = (s: number) => new Date(s * 1000).toISOString().replace('.000Z', '+00:00')
    const alarms = [
      { id: 11, type: 'sos', receivedDate: iso(tSos + 90), pulse: 88, batteryLevel: 50, sat: 95, temperature: 36.1, latitude: 45.4, longitude: 9.1, handledBy: 'Op Uno', description: { caseDescription: 'Chiamata ai familiari' } },
      { id: 12, type: 'fall', receivedDate: iso(Date.UTC(2026, 10, 7, 15, 0, 0) / 1000), pulse: 0, batteryLevel: 44, sat: 0, temperature: 0, latitude: 0, longitude: 0 },
      { id: 13, type: 'immo', receivedDate: iso(Date.UTC(2026, 9, 1, 15, 0, 0) / 1000) }] // prima del periodo
    const P = makeSidly({ alarms })
    const r = await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-11-01', dryRun: false, nowSec: NOW, fetchImpl: P.fetchImpl, maxFinestre: 10 })
    ok(r.result.completato === true && d.count('sidly_eventi') === 2, 'allarmi letti da SiDLY: SOS e caduta importati; l\'allarme precedente al periodo no')
    ok(d.q(`SELECT origine FROM sidly_eventi WHERE tipo = 'fall'`)[0]?.origine === 'api' && d.q(`SELECT lat FROM sidly_eventi WHERE tipo = 'fall'`)[0]?.lat === null, 'allarme da API: origine api, posizione assente = nulla')
    await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-11-01', dryRun: false, nowSec: NOW + 7 * 3600, fetchImpl: P.fetchImpl, maxFinestre: 10 })
    ok(d.count('sidly_eventi') === 2, 'rilancio: gli allarmi non si duplicano')
    const alarms2 = [...alarms, { id: 14, type: 'sos', receivedDate: iso(NOW + 3 * 3600), pulse: 70, batteryLevel: 40 }]
    await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-11-01', dryRun: false, nowSec: NOW + 14 * 3600, fetchImpl: makeSidly({ alarms: alarms2 }).fetchImpl, maxFinestre: 10 })
    ok(d.count('sidly_eventi') === 3, 'un nuovo allarme comparso dopo viene importato all\'aggiornamento successivo')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 11: report delle medie e stato')
  {
    const d = await makeD1(); T.dimenticaTabelle()
    d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Giorgia', 'Origoni'), (2, '${IMEI_B}', 'ATTIVO', 'Laura', 'Calvi'), (3, '868298060000009', 'CESSATO', 'Ex', 'Assistito')`)
    const vuoto = await T.reportMedie(d.db, { giorni: 30, nowSec: NOW })
    ok(vuoto.tabelle_presenti === false && vuoto.assistiti.length === 0 && !d.hasTable('sidly_misure'), 'report senza tabelle: nessun errore e nessuna tabella creata dalla lettura')
    const sv = await T.statoTelemetria(d.db, NOW)
    ok(sv.tabelle_presenti === false && sv.assistiti.length === 2 && !d.hasTable('sidly_stato'), 'stato senza tabelle: elenco assistiti, nessuna scrittura')

    await T.assicuraTabelle(d.db)
    const T0 = Math.floor((NOW - 3 * 86400) / 86400) * 86400 + 12 * 3600 // mezzogiorno UTC di 3 giorni fa (multiplo di 120)
    await d.db.batch(T.istruzioniMisure(d.db, [
      { imei: IMEI_A, ts: T0, fonte: 'stats', hr: 60, spo2: 96, steps: 100 },
      { imei: IMEI_A, ts: T0 + 3600, fonte: 'stats', hr: 70, spo2: 98 },
      { imei: IMEI_A, ts: T0 + 3630, fonte: 'stats', hr: 72, sdnn: 40, rmssd: 30, resp: 14 }, // stesso istante del precedente (entro 2 minuti)
      { imei: IMEI_A, ts: T0 + 7200, fonte: 'stats', hr: 80, steps: 200, resp: 16, sdnn: 50 },
      { imei: IMEI_A, ts: T0 + 86400, fonte: 'stats', steps: 500 },
      { imei: IMEI_B, ts: T0, fonte: 'stats', hr: 90, spo2: 94 },
      { imei: IMEI_A, ts: NOW - 100 * 86400, fonte: 'stats', hr: 200 }, // fuori periodo
    ]))
    const r = await T.reportMedie(d.db, { giorni: 30, nowSec: NOW })
    const A = r.assistiti.find(x => x.imei === IMEI_A)!, B = r.assistiti.find(x => x.imei === IMEI_B)!
    ok(r.assistiti.length === 2 && r.tabelle_presenti === true, 'solo assistiti ATTIVI nel report')
    ok(A.metriche.hr.n === 3 && Math.abs((A.metriche.hr.media as number) - (60 + 71 + 80) / 3) < 1e-9, 'FC: frame e storico dello stesso istante contano una volta (media 71) → media 70,33')
    ok(A.metriche.hr.min === 60 && A.metriche.hr.max === 80 && Math.abs((A.metriche.hr.sd as number) - Math.sqrt(((60 - 70.3333) ** 2 + (71 - 70.3333) ** 2 + (80 - 70.3333) ** 2) / 3)) < 1e-6, 'FC: min, max e deviazione standard')
    ok(A.metriche.spo2.n === 2 && A.metriche.spo2.media === 97 && A.metriche.sdnn.n === 2 && A.metriche.sdnn.media === 45 && A.metriche.rmssd.media === 30 && A.metriche.resp.media === 15, 'SpO2, HRV (SDNN, RMSSD) e frequenza respiratoria')
    ok(A.passi_medi_giorno === 400 && A.giorni_con_dati === 2 && A.punti === 4, 'passi: somma per giorno poi media dei giorni (300 e 500 → 400)')
    ok(B.metriche.hr.media === 90 && B.metriche.sdnn.n === 0 && B.metriche.sdnn.media === null && B.passi_medi_giorno === null, 'metrica senza dati: n 0 e media assente (non zero)')
    ok(!A.metriche.hr.max || (A.metriche.hr.max as number) < 200, 'la misura fuori periodo (200 bpm di 100 giorni fa) non entra')
    ok(r.coorte.metriche.hr.assistiti === 2 && Math.abs((r.coorte.metriche.hr.media as number) - ((60 + 71 + 80) / 3 + 90) / 2) < 1e-9, 'coorte: media delle medie (ogni assistito pesa uno)')
    ok(r.coorte.passi_medi_giorno === 400 && r.coorte.passi_assistiti === 1 && r.coorte.assistiti_con_dati === 2, 'coorte: passi solo dagli assistiti che li hanno')
    const un = await T.reportMedie(d.db, { giorni: 30, assistitoId: 2, nowSec: NOW })
    ok(un.assistiti.length === 1 && un.assistiti[0].imei === IMEI_B, 'report del singolo assistito')
    const lungo = await T.reportMedie(d.db, { giorni: 400, assistitoId: 1, nowSec: NOW })
    ok(lungo.assistiti[0].metriche.hr.max === 200, 'periodo più lungo: la misura vecchia entra')

    await d.db.batch([d.db.prepare(`INSERT INTO sidly_stato (imei, assistito_id, backfill_fino_ts, backfill_righe) VALUES (?,?,?,?)`).bind(IMEI_A, 1, NOW, 276)])
    const s = await T.statoTelemetria(d.db, NOW)
    const sa = s.assistiti.find(x => x.imei === IMEI_A)!
    ok(s.tabelle_presenti === true && sa.righe_storico === 276 && sa.misure_dal !== null && sa.storico_fino_a !== null, 'stato: righe di storico, copertura e data fino a cui lo storico è stato letto da SiDLY')
    ok(!('frame_registrato' in sa) && !('ultimo_frame' in sa) && !('n_frame' in sa), 'stato: nessun concetto di frame ricevuti/registrati (i dati arrivano solo da SiDLY via API)')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 12: controlli sul sorgente (accessi, segreti, vincoli D1)')
  {
    const idx = readFileSync('src/index.tsx', 'utf8')
    const mod = readFileSync('src/modules/sidly-telemetria.ts', 'utf8')
    const blocco = (re: RegExp) => { const i = idx.search(re); return i < 0 ? '' : idx.slice(i, i + 1400) }
    for (const [re, nome] of [[/app\.post\('\/api\/sidly\/storico'/, 'storico'], [/app\.get\('\/api\/sidly\/telemetria\/stato'/, 'stato'], [/app\.get\('\/api\/sidly\/telemetria\/report'/, 'report']] as const) {
      const b = blocco(re)
      ok(!!b && /checkSessionOrKey\(/.test(b), `endpoint ${nome}: protetto da sessione dashboard o chiave`)
    }
    ok(/conferma_scrittura === true/.test(blocco(/app\.post\('\/api\/sidly\/storico'/)), 'storico: senza conferma_scrittura è sempre anteprima')
    ok(!/console\./.test(mod), 'il modulo non scrive log (nessun rischio di stampare token o chiavi)')
    ok(!/SELECT\s+(l\.)?\*\s+FROM\s+leads/i.test(mod) && !/ALTER\s+TABLE\s+leads/i.test(mod), 'nessun ALTER su leads e nessun SELECT * su leads (limite D1 di 100 colonne)')
    ok((mod.match(/ALTER\s+TABLE\s+\w+/gi) || []).every(x => /sidly_stato$/i.test(x)), 'l\'unico ALTER e\' la migrazione di una tabella della telemetria (sidly_stato)')
    ok(/app\.get\('\/api\/sidly\/telemetria\/dataset'/.test(idx) && /checkSessionOrKey\(/.test(blocco(/app\.get\('\/api\/sidly\/telemetria\/dataset'/)), 'endpoint dataset: protetto da sessione dashboard o chiave')
    // REGOLA DEL TITOLARE: i dati passano sempre da SiDLY (API in lettura); il CRM non riceve frame e non tocca gli URL dei braccialetti.
    const sync = readFileSync('src/modules/sidly-sync.ts', 'utf8')
    const dash = readFileSync('src/modules/dashboard-templates-new.ts', 'utf8')
    const codice = (t: string) => t.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')
    ok(!/url-for-band/.test(codice(mod)) && !/url-for-band/.test(codice(sync)) && !/url-for-band/.test(codice(idx)) && !/url-for-band/.test(codice(dash)), 'REGOLA: nessun codice chiama set-url-for-band / delete-url-for-band (il CRM non modifica gli URL dei braccialetti)')
    ok(!/app\.(post|get|put|all)\('\/api\/sidly\/(ingest|registra-frame)/.test(idx), 'REGOLA: non esistono rotte per ricevere frame (/api/sidly/ingest) né per registrare URL (/api/sidly/registra-frame)')
    ok(!/SIDLY_FRAME_URL|SIDLY_INGEST_TOKEN|SIDLY_ENCRYPT_KEY/.test(codice(idx)) && !/SIDLY_FRAME_URL|SIDLY_INGEST_TOKEN|SIDLY_ENCRYPT_KEY/.test(codice(sync)) && !/SIDLY_FRAME_URL|SIDLY_INGEST_TOKEN|SIDLY_ENCRYPT_KEY/.test(codice(mod)), 'REGOLA: nessuna variabile d\'ambiente per frame, token di ingest o cifratura')
    ok(!/gestisciFrame|parseFrame|decifraFrame|registraFrame|verificaTokenIngest/.test(codice(mod) + codice(idx)), 'REGOLA: nessuna funzione che elabora frame dei braccialetti')
    ok(!/sendFrame|sidlyFrame|registra-frame|Ricezione dei frame/.test(dash), 'REGOLA: la Dashboard non offre nessuna azione sui frame')
    const richieste = [...mod.matchAll(/client\.request\('([A-Z]+)',\s*`([^`]*)`/g)].map(m => m[1] + ' ' + m[2].replace(/\$\{[^}]*\}/g, '{x}').replace(/\?.*$/, ''))
    ok(richieste.length >= 3 && richieste.every(r => r.startsWith('GET ')), `REGOLA: la telemetria usa SiDLY solo in lettura (GET): ${[...new Set(richieste)].join(', ')}`)
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 13: storico dall\'inizio (data di registrazione) e dataset delle sole misure')
  {
    const REG = Date.UTC(2026, 10, 3, 10, 0, 0) / 1000
    const INIZIO = Date.UTC(2026, 10, 2) / 1000 // mezzanotte UTC del giorno di registrazione meno un giorno
    const cl = (o: any = {}) => new SidlyClient(ENV, makeSidly(o).fetchImpl)
    const dr = async (o: any) => T.dataRegistrazione(cl(o), IMEI_A, NOW)
    ok((await dr({ registerDate: REG })).ts === INIZIO, 'registerDate in secondi → mezzanotte UTC del giorno prima')
    ok((await dr({ registerDate: REG * 1000 })).ts === INIZIO, 'registerDate in millisecondi riconosciuto')
    ok((await dr({ registerDate: '2026-11-03T10:00:00+00:00' })).ts === INIZIO, 'registerDate ISO riconosciuto')
    ok((await dr({ registerDate: REG, registerWrap: true })).ts === INIZIO, 'risposta avvolta in data{} riconosciuta')
    ok((await dr({ registerDate: undefined })).ts === null && /data di registrazione/.test((await dr({ registerDate: undefined })).errore || ''), 'registerDate assente → nessuna data inventata, errore esplicito')
    ok((await dr({ registerDate: 5 })).ts === null && (await dr({ registerDate: NOW + 90 * 86400 })).ts === null, 'registerDate implausibile (1970 o nel futuro) → rifiutata')

    const d = await makeD1(); T.dimenticaTabelle()
    d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Giorgia', 'Origoni'), (2, '${IMEI_B}', 'ATTIVO', 'Laura', 'Calvi')`)
    const P = makeSidly()
    const dry = await T.eseguiStorico({ db: d.db, env: ENV, da: 'inizio', dryRun: true, assistitoId: 1, nowSec: NOW, fetchImpl: P.fetchImpl })
    ok(dry.result.esito === 'anteprima' && dry.result.assistiti![0].anteprima?.inizio_da === '2026-11-02 00:00:00 UTC' && (dry.result.assistiti![0].anteprima?.finestre_totali || 0) >= 2, 'anteprima «inizio»: data di partenza e numero di finestre dichiarati')
    ok(!d.hasTable('sidly_misure') && d.stats.batches === 0 && d.stats.singles === 0 && P.calls.every(c => c.method === 'GET'), 'anteprima «inizio»: nessuna scrittura (DB e SiDLY)')

    const r = await T.eseguiStorico({ db: d.db, env: ENV, da: 'inizio', dryRun: false, nowSec: NOW, fetchImpl: P.fetchImpl, maxFinestre: 20, maxRighe: 20000 })
    ok(r.result.completato === true && d.count('sidly_misure') === 2 * 252, `«inizio»: entrambi gli assistiti caricati dalla registrazione fino a oggi (2 × 252, trovate ${d.count('sidly_misure')})`)
    ok(d.q(`SELECT MIN(ts) AS m FROM sidly_misure`)[0].m === INIZIO, 'la prima misura è quella della data di partenza: nessun dato tagliato a 90 giorni o simili')
    ok(d.q(`SELECT registrato_ts, completo_ts FROM sidly_stato WHERE imei = ?`, IMEI_A)[0].registrato_ts === INIZIO, 'data di registrazione salvata nello stato')
    const n0 = P.calls.length
    const r2 = await T.eseguiStorico({ db: d.db, env: ENV, da: 'inizio', dryRun: false, nowSec: NOW + 3600, fetchImpl: P.fetchImpl })
    ok(r2.result.completato === true && P.calls.length === n0 && d.count('sidly_misure') === 2 * 252, 'rilancio entro 6 ore: nessuna chiamata (nemmeno la data di registrazione) e nessun duplicato')

    // Periodo esteso all'indietro: si riparte dalla nuova data
    const r3 = await T.eseguiStorico({ db: d.db, env: ENV, da: '2026-10-25', dryRun: false, assistitoId: 1, nowSec: NOW + 3600, fetchImpl: P.fetchImpl, maxFinestre: 20 })
    ok(r3.result.completato === true && d.q(`SELECT MIN(ts) AS m FROM sidly_misure WHERE imei = ?`, IMEI_A)[0].m === Date.UTC(2026, 9, 25) / 1000, 'periodo esteso all\'indietro: si carica anche la parte precedente')

    // Senza data di registrazione: non si inventa nulla
    const d2 = await makeD1(); T.dimenticaTabelle()
    d2.raw.run(`INSERT INTO assistiti (id, imei, status) VALUES (1, '${IMEI_A}', 'ATTIVO')`)
    const r4 = await T.eseguiStorico({ db: d2.db, env: ENV, da: 'inizio', dryRun: false, nowSec: NOW, fetchImpl: makeSidly({ registerDate: undefined }).fetchImpl })
    ok(r4.result.completato === false && /data di registrazione/.test(r4.result.assistiti![0].errore || '') && d2.count('sidly_misure') === 0, '«inizio» senza registerDate: nessuna riga, errore che chiede una data esplicita')

    // Migrazione di sidly_stato creata prima delle colonne nuove
    const d3 = await makeD1(); T.dimenticaTabelle()
    d3.raw.run(`CREATE TABLE sidly_stato (imei TEXT PRIMARY KEY, assistito_id INTEGER, ultimo_frame_ts INTEGER, ultimo_reason TEXT, batt INTEGER, device_type TEXT, segnale TEXT, rete TEXT, n_frame INTEGER, frame_registrato_at TEXT, backfill_da_ts INTEGER, backfill_fino_ts INTEGER, backfill_righe INTEGER, ultimo_errore TEXT, updated_at TEXT)`)
    await T.assicuraTabelle(d3.db)
    const cols = d3.q(`SELECT name FROM pragma_table_info('sidly_stato')`).map((x: any) => x.name)
    ok(cols.includes('registrato_ts') && cols.includes('completo_ts'), 'migrazione: colonne registrato_ts e completo_ts aggiunte a una tabella esistente')
    T.dimenticaTabelle(); await T.assicuraTabelle(d3.db)
    ok(true, 'migrazione ripetibile senza errori')

    // Dataset CSV
    const tot = d.count('sidly_misure')
    const ds = await T.datasetMisure(d.db, {})
    ok(ds.ok === true && ds.csv.split('\n')[0] === T.DATASET_COLONNE.join(','), 'dataset: intestazione con le colonne dichiarate')
    ok(ds.ok === true && ds.righe === tot && ds.prossimo === null && ds.csv.trim().split('\n').length === tot + 1, 'dataset: tutte le righe in una pagina, nessun cursore residuo')
    ok(ds.ok === true && !/Giorgia|Origoni|Laura|Calvi/.test(ds.csv) && ds.csv.split('\n')[1].split(',')[0] === '1', 'dataset: solo id assistito e IMEI, nessun nome')
    let cur: string | null = null, righe = 0, pag = 0, header = 0, prevKey = ''
    let sorted = true
    do {
      const pg: any = await T.datasetMisure(d.db, { limite: 100, dopo: cur || undefined })
      ok(pg.ok === true, 'dataset: pagina valida')
      const linee = pg.csv.split('\n').filter((x: string) => x)
      if (linee[0].startsWith('assistito_id')) { header++; linee.shift() }
      for (const l of linee) { const c = l.split(','); const k = c[1] + ':' + String(c[3]).padStart(12, '0'); if (k <= prevKey) sorted = false; prevKey = k }
      righe += pg.righe; pag++; cur = pg.prossimo
    } while (cur && pag < 50)
    ok(righe === tot && header === 1 && pag === Math.ceil(tot / 100) && sorted, `dataset a pagine da 100: ${pag} pagine, ${righe}/${tot} righe, un'unica intestazione, ordine (imei, ts) stabile, nessun duplicato né buco`)
    const f1 = await T.datasetMisure(d.db, { assistitoId: 2 })
    ok(f1.ok === true && f1.csv.trim().split('\n').slice(1).every(l => l.split(',')[1] === IMEI_B) && f1.righe === 252, 'dataset: filtro per assistito')
    const f2 = await T.datasetMisure(d.db, { da: '2026-11-05', a: '2026-11-05', assistitoId: 2 })
    ok(f2.ok === true && f2.righe === 24, 'dataset: filtro per periodo (un giorno = 24 misure orarie, estremi inclusi)')
    ok((await T.datasetMisure(d.db, { da: 'ieri' })).ok === false && (await T.datasetMisure(d.db, { dopo: 'xx' })).ok === false && (await T.datasetMisure(d.db, { assistitoId: 99 })).ok === false, 'dataset: date, cursore e assistito non validi → errore')
    const vuoto = await makeD1(); T.dimenticaTabelle()
    const nv: any = await T.datasetMisure(vuoto.db, {})
    ok(nv.ok === false && nv.status === 404, 'dataset senza tabelle: 404 (nessuna creazione di tabelle in lettura)')
    ok(!vuoto.hasTable('sidly_misure'), 'dataset: sola lettura')
  }
}
