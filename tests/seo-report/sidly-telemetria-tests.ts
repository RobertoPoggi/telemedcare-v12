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
function makeSidly(opts: { statsStatus?: number; alarms?: any[]; urlStatus?: number; registerDate?: any; registerWrap?: boolean; vuotoDopo?: number; senzaTrust?: boolean; failImei?: string; pressione?: boolean; soloPressione?: boolean } = {}) {
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
      if (opts.failImei && m[1] === opts.failImei) return reply(404, { error: 'imei sconosciuto' })
      const f = Date.parse(decodeURIComponent(m[2]).replace(' ', 'T') + 'Z') / 1000
      const t = Date.parse(decodeURIComponent(m[3]).replace(' ', 'T') + 'Z') / 1000
      const pts = (step: number, y: number | ((x: number) => number), extra: any = {}) => {
        const chart: any[] = []
        for (let x = Math.ceil(f / step) * step; x <= t; x += step) { if (opts.vuotoDopo !== undefined && x > opts.vuotoDopo) continue; chart.push({ x, y: typeof y === 'function' ? y(x) : y, total: null, trust_lvl: opts.senzaTrust ? null : 'HR=3,SpO2=2', ...extra }) }
        return { chart, stats: { min: 1, max: 2, mean: 1.5 } }
      }
      // pressione = valore barometrico (~1013 hPa) ogni mezz'ora: meta' dei punti cade tra due misure vere e NON e' una misura della persona
      const press = opts.pressione || opts.soloPressione ? { pressure: pts(1800, (x: number) => 1010 + (x % 7)) } : {}
      if (opts.soloPressione) return reply(200, { ...press, lastMeasurements: [] })
      return reply(200, { pulse: pts(3600, 70), sat: pts(3600, 97), sdnn: pts(86400, 42), rmssd: pts(86400, 35), respiration: pts(3600, 15), steps: { dailyTarget: 5000, ...pts(3600, 100), total: 2400, totalKm: 1.8 }, ...press, lastMeasurements: [] })
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

    // ── indice di affidabilita' (trust_lvl) e valori veri dell'anteprima ──
    {
      ok(JSON.stringify(T.livelliTrust('HR=3,SpO2=2')) === JSON.stringify({ hr: 3, spo2: 2, min: 2 }), 'affidabilita\': «HR=3,SpO2=2» -> battito 3, SpO2 2, complessiva = la piu\' bassa (2)')
      ok(T.livelliTrust('HR=0').min === 0 && T.livelliTrust('hr = 1 , spo2 = 3').spo2 === 3 && T.livelliTrust('2').min === 2, 'affidabilita\': livello 0 riconosciuto (non scambiato per assente), spazi e maiuscole tollerati, numero singolo = complessiva')
      ok(Object.keys(T.livelliTrust('')).length === 0 && Object.keys(T.livelliTrust('HR=9,x=77')).length === 0 && Object.keys(T.livelliTrust('boh')).length === 0, 'affidabilita\': testo vuoto, sconosciuto o fuori scala 0-3 -> nessun valore inventato')
      const q = T.parseStats({
        pulse: { chart: [{ x: 1781241462, y: 70, trust_lvl: 'HR=3,SpO2=2' }, { x: 1781241762, y: 90, trust_lvl: 'HR=1' }, { x: 1781242062, y: 80, trust_lvl: 'HR=0' }, { x: 1781242362, y: 100 }] },
        sat: { chart: [{ x: 1781241462, y: 96, trust_lvl: 'HR=3,SpO2=2' }, { x: 1781241762, y: 98, trust_lvl: 'HR=1,SpO2=3' }] },
        steps: { total: 10, chart: [{ x: 1781241462, y: 10, total: 10 }] } }, IMEI_A)
      const m1 = q.righe.find(r => r.ts === 1781241462)!, m2 = q.righe.find(r => r.ts === 1781241762)!, m3 = q.righe.find(r => r.ts === 1781242062)!, m4 = q.righe.find(r => r.ts === 1781242362)!
      ok(m1.affid === 2 && m2.affid === 1 && m3.affid === 0 && (m4.affid === undefined || m4.affid === null), 'affidabilita\' per misurazione: la piu\' bassa tra i livelli dichiarati; senza testo nessun valore')
      ok(m3.hr_q === 0 && m1.hr_q === 3 && m1.spo2_q === 2 && m2.spo2_q === 3, 'affidabilita\' separata per battito e SpO2')
      ok(q.affidabilita.fc.n === 3 && q.affidabilita.fc.livelli['0'] === 1 && q.affidabilita.fc.buone_pct === 33 && q.affidabilita.complessiva.n === 3, 'riepilogo affidabilita\': conteggio per livello e % di letture buone (>=2); le letture senza indicazione non entrano nella media')
      ok(q.affidabilita.valori_grezzi.some(g => g.testo === 'HR=3,SpO2=2' && g.n === 2), 'riepilogo: i testi grezzi di SiDLY si vedono a video per verificare la scala')
      const fc = q.riepilogo.find(x => x.chiave === 'pulse')!
      ok(fc.n === 4 && fc.min === 70 && fc.max === 100 && fc.media === 85 && fc.ultimo === 100 && fc.unita === 'bpm' && /Frequenza/.test(fc.nome), 'riepilogo: valori veri (letture, min, media, max, ultima) con unita\', non conteggi di punti')
      ok(!q.riepilogo.some(x => x.chiave === 'steps'), 'riepilogo: i passi non sono nel riepilogo dei valori (hanno il confronto dichiarato/somma)')
      ok(T.parseStats({ pulse: { chart: [{ x: 1781241462, y: 70 }] } }, IMEI_A).affidabilita.complessiva.n === 0, 'senza testo di affidabilita\': n = 0, nessun valore inventato')
      // salvataggio: la colonna c'e' e un NULL non cancella il valore
      const dq = await makeD1(); T.dimenticaTabelle(); await T.assicuraTabelle(dq.db)
      await dq.db.batch(T.istruzioniMisure(dq.db, q.righe))
      ok(dq.q(`SELECT affid FROM sidly_misure WHERE imei='${IMEI_A}' AND ts=1781241462`)[0].affid === 2 && dq.q(`SELECT affid FROM sidly_misure WHERE ts=1781242062`)[0].affid === 0, 'affidabilita\' salvata per ogni misurazione (anche il livello 0)')
      await dq.db.batch(T.istruzioniMisure(dq.db, [{ imei: IMEI_A, ts: 1781241462, fonte: 'stats', hr: 70 }]))
      ok(dq.q(`SELECT affid FROM sidly_misure WHERE ts=1781241462`)[0].affid === 2, 'una rilettura senza affidabilita\' non cancella quella gia\' salvata')
      // migrazione di una tabella creata prima della colonna
      const dm = await makeD1(); T.dimenticaTabelle()
      dm.raw.run(`CREATE TABLE sidly_misure (imei TEXT NOT NULL, ts INTEGER NOT NULL, hr REAL, hr_q INTEGER, spo2 REAL, spo2_q INTEGER, temp REAL, steps REAL, steps_tot REAL, pressure REAL, sdnn REAL, rmssd REAL, resp REAL, hr_rest REAL, wear REAL, fonte TEXT, PRIMARY KEY (imei, ts)) WITHOUT ROWID`)
      dm.raw.run(`INSERT INTO sidly_misure (imei, ts, hr, fonte) VALUES ('${IMEI_A}', 1700000000, 66, 'stats')`)
      await T.assicuraTabelle(dm.db)
      ok(dm.q(`SELECT COUNT(*) AS n FROM pragma_table_info('sidly_misure') WHERE name='affid'`)[0].n === 1 && dm.q(`SELECT hr FROM sidly_misure`)[0].hr === 66, 'migrazione: colonna affid aggiunta a una tabella esistente senza perdere le misure')
      T.dimenticaTabelle(); await T.assicuraTabelle(dm.db)
      ok(dm.q(`SELECT COUNT(*) AS n FROM pragma_table_info('sidly_misure') WHERE name='affid'`)[0].n === 1, 'migrazione ripetibile (nessun doppione di colonna)')
      ok(T.DATASET_COLONNE.includes('affid' as any) && T.DATASET_COLONNE.indexOf('affid' as any) > T.DATASET_COLONNE.indexOf('spo2_q' as any), 'dataset CSV: colonna affid (indice di affidabilita\' 0-3) per ogni misurazione')
    }
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
  section('SiDLY telemetria 8c: ultime N partendo dall\'ULTIMA misura (anche se il braccialetto e\' fermo da settimane)')
  {
    const nuovoDb = async () => {
      const d = await makeD1(); T.dimenticaTabelle()
      d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Mario', 'Silenzioso')`)
      return d
    }
    const ultimaMisura = NOW - 30 * 86400
    const reg = Date.UTC(2026, 5, 1) / 1000
    const mk = () => makeSidly({ vuotoDopo: ultimaMisura, registerDate: reg })
    const base = (d: any, P: any, extra: any = {}) => ({ db: d.db, env: ENV, ultime: 100, assistitoId: 1, dryRun: false, nowSec: NOW, fetchImpl: P.fetchImpl, ...extra })

    const d0 = await nuovoDb(); const P0 = mk()
    const rp = await T.eseguiUltime(base(d0, P0, { dryRun: true }))
    const an = rp.result.assistiti![0].anteprima!
    ok(rp.result.esito === 'anteprima' && (an.righe || 0) > 0, 'silenzioso: l\'anteprima non si ferma alle settimane vuote e trova la settimana con misure')
    ok(typeof an.silenzio_giorni === 'number' && an.silenzio_giorni >= 29 && an.silenzio_giorni <= 31, `silenzioso: l'anteprima dice da quanti giorni non misura (${an.silenzio_giorni})`)
    ok(!!an.ultima_misura && Date.parse(an.ultima_misura.replace(' UTC', '').replace(' ', 'T') + 'Z') / 1000 <= ultimaMisura, 'silenzioso: «ultima_misura» e\' quella vera, non oggi')
    ok(P0.calls.every(c => c.method === 'GET') && !d0.hasTable('sidly_misure') && d0.stats.batches === 0 && d0.stats.singles === 0, 'silenzioso: anteprima solo GET e nessuna scrittura')
    ok(P0.calls.filter(c => c.path.includes('/stats')).length <= T.ULTIME_SONDA_MAX, 'silenzioso: le settimane sondate sono limitate')

    // Esecuzione: parte dalla sua ultima misura e va indietro di N, a pezzi come fa la Dashboard
    const d = await nuovoDb(); const P = mk()
    let r = await T.eseguiUltime(base(d, P, { maxFinestre: 8 }))
    let giri = 1
    while (!r.result.completato && giri < 20) {
      const c = r.result.assistiti![0].continua!
      r = await T.eseguiUltime(base(d, P, { maxFinestre: 8, primaDi: c.prima_di, raccolte: c.raccolte })); giri++
    }
    const mx = Number(d.q('SELECT MAX(ts) AS m FROM sidly_misure')[0].m)
    ok(r.result.completato === true && d.count('sidly_misure') === 100, `silenzioso: importa esattamente 100 misure (trovate ${d.count('sidly_misure')}) in ${giri} richieste`)
    ok(mx <= ultimaMisura && mx > ultimaMisura - 3600, 'silenzioso: la prima misura importata e\' la sua ultima, di 30 giorni fa')
    ok(P.calls.every(c => c.method === 'GET'), 'silenzioso: nessuna scrittura su SiDLY')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 8d: «aggiorna l\'affidabilita\'» sulle misure gia\' presenti')
  {
    const nuovoDb = async () => {
      const d = await makeD1(); T.dimenticaTabelle()
      d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Giorgia', 'Origoni'), (2, '${IMEI_B}', 'ATTIVO', 'Laura', 'Calvi'), (3, '${IMEI_X}', 'CESSATO', 'Non', 'Attivo')`)
      return d
    }
    const base = (d: any, P: any, extra: any = {}) => ({ db: d.db, env: ENV, assistitoId: 1, dryRun: false, nowSec: NOW, fetchImpl: P.fetchImpl, ...extra })
    // DB "vecchio": misure importate PRIMA della colonna affid (senza affid/hr_q/spo2_q), 400 istanti orari consecutivi
    const preparaVecchio = async (d: any, n = 400) => {
      await T.assicuraTabelle(d.db)
      const t0 = Math.floor(NOW / 3600) * 3600 - 3600
      const righe: any[] = []
      for (let i = 0; i < n; i++) righe.push({ imei: IMEI_A, ts: t0 - i * 3600, fonte: 'stats', hr: 70, spo2: 97 })
      await d.db.batch(T.istruzioniMisure(d.db, righe))
      d.raw.run('UPDATE sidly_misure SET affid = NULL, hr_q = NULL, spo2_q = NULL')
      return t0
    }

    // Anteprima: solo GET, nessuna scrittura, spiega quanto manca
    {
      const d = await nuovoDb(); await preparaVecchio(d); const P = makeSidly()
      const prima = d.stats.singles + d.stats.stmtsInBatches
      const r = await T.eseguiAffidabilita(base(d, P, { dryRun: true }))
      const an = r.result.assistiti![0].anteprima!
      ok(r.httpStatus === 200 && r.result.esito === 'anteprima', 'affidabilita: anteprima per un solo assistito')
      ok(d.stats.singles + d.stats.stmtsInBatches === prima && d.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE affid IS NOT NULL')[0].n === 0, 'affidabilita: anteprima senza NESSUNA scrittura nel DB')
      ok(P.calls.every(c => c.method === 'GET') && P.calls.filter(c => c.path.includes('/stats')).length === 1, 'affidabilita: anteprima = solo GET, una sola settimana')
      ok(an.affid_db?.righe === 400 && an.affid_db?.senza_affidabilita === 400 && (an.affid_finestra?.da_aggiornare || 0) > 0, 'affidabilita: anteprima dice quante misure nel DB sono senza affidabilita\' e quante si aggiornerebbero')
      ok((an.affidabilita?.valori_grezzi || []).some(g => g.testo === 'HR=3,SpO2=2'), 'affidabilita: anteprima mostra il testo grezzo di SiDLY per verificarne il formato')
    }

    // Esecuzione: aggiorna solo righe esistenti, nessuna nuova, nessun valore sovrascritto
    const d = await nuovoDb(); const t0 = await preparaVecchio(d); const P = makeSidly()
    const vecchieRighe = d.q('SELECT imei, ts, hr, spo2, fonte FROM sidly_misure ORDER BY ts')
    // una riga gia' con affid: non si tocca nemmeno se SiDLY dice altro
    d.raw.run('UPDATE sidly_misure SET affid = 1, hr_q = 1, spo2_q = 1 WHERE ts = ?', [t0])
    // una riga con hr_q gia' valorizzato ma affid NULL: hr_q resta
    d.raw.run('UPDATE sidly_misure SET hr_q = 0 WHERE ts = ?', [t0 - 3600])
    d.raw.run(`INSERT INTO sidly_stato (imei, assistito_id, backfill_da_ts, backfill_fino_ts, backfill_righe) VALUES ('${IMEI_A}', 1, 111, 222, 5)`)
    const statoPrima = d.q('SELECT * FROM sidly_stato WHERE imei = ?', IMEI_A)[0]
    let r = await T.eseguiAffidabilita(base(d, P, { maxFinestre: 1 }))
    let giri = 1, tot = r.result.righe_scritte || 0
    while (!r.result.completato && giri < 20) {
      const c = r.result.assistiti![0].continua!
      r = await T.eseguiAffidabilita(base(d, P, { maxFinestre: 1, primaDi: c.prima_di })); tot += r.result.righe_scritte || 0; giri++
    }
    ok(r.result.completato === true && d.count('sidly_misure') === 400, 'affidabilita: nessuna riga nuova, ne\' cancellata')
    ok(d.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE affid IS NULL')[0].n === 0 && tot === 399, `affidabilita: tutte le misure hanno ora l'indice (aggiornate ${tot}, la riga gia' valorizzata esclusa)`)
    ok(d.q('SELECT affid, hr_q, spo2_q FROM sidly_misure WHERE ts = ?', t0)[0].affid === 1 && d.q('SELECT hr_q FROM sidly_misure WHERE ts = ?', t0)[0].hr_q === 1, 'affidabilita: un indice gia\' presente non viene sovrascritto')
    const rr = d.q('SELECT affid, hr_q, spo2_q FROM sidly_misure WHERE ts = ?', t0 - 3600)[0]
    ok(rr.affid === 2 && rr.hr_q === 0 && rr.spo2_q === 2, 'affidabilita: l\'indice complessivo e\' il livello piu\' basso dichiarato; hr_q gia\' presente non si sovrascrive')
    const dopo = d.q('SELECT imei, ts, hr, spo2, fonte FROM sidly_misure ORDER BY ts')
    ok(JSON.stringify(dopo) === JSON.stringify(vecchieRighe), 'affidabilita: i valori misurati (FC, SpO2, fonte) non cambiano')
    const statoDopo = d.q('SELECT * FROM sidly_stato WHERE imei = ?', IMEI_A)[0]
    ok(statoDopo.backfill_da_ts === statoPrima.backfill_da_ts && statoDopo.backfill_fino_ts === 222 && statoDopo.backfill_righe === 5, 'affidabilita: il cursore dello storico completo non viene toccato')
    ok(P.calls.every(c => c.method === 'GET' && !/url-for-band/.test(c.path)), 'affidabilita: solo GET su SiDLY, nessuna scrittura ne\' sui braccialetti')
    ok(giri === 3, `affidabilita: 400 misure orarie = 3 settimane, una per richiesta con ripresa da prima_di (${giri} richieste)`)
    const dU = await nuovoDb(); await preparaVecchio(dU); const PU = makeSidly()
    const rU = await T.eseguiAffidabilita(base(dU, PU))
    ok(rU.result.completato === true && dU.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE affid IS NULL')[0].n === 0, 'affidabilita: con il budget normale (8 settimane) 400 misure si aggiornano in una sola richiesta')

    // Rilancio: niente da aggiornare = nessuna chiamata a SiDLY
    const P2 = makeSidly()
    const rRil = await T.eseguiAffidabilita(base(d, P2))
    ok(rRil.result.completato === true && rRil.result.righe_scritte === 0 && P2.calls.filter(c => c.path.includes('/stats')).length === 0, 'affidabilita: rilancio senza righe da aggiornare = zero chiamate a SiDLY e zero scritture')

    // SiDLY non indica l'affidabilita': le righe restano NULL, mai inventate, e la procedura termina
    const dN = await nuovoDb(); await preparaVecchio(dN, 50)
    let rN = await T.eseguiAffidabilita(base(dN, makeSidly({ senzaTrust: true })))
    let gN = 1
    while (!rN.result.completato && gN < 10) { const c = rN.result.assistiti![0].continua!; rN = await T.eseguiAffidabilita(base(dN, makeSidly({ senzaTrust: true }), { primaDi: c.prima_di })); gN++ }
    ok(rN.result.completato === true && dN.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE affid IS NOT NULL')[0].n === 0, 'affidabilita: se SiDLY non da l\'affidabilita\' le righe restano senza (nessun valore inventato) e la procedura termina')

    // Tabella creata prima della colonna: la migrazione avviene alla prima scrittura, non in anteprima
    const dM = await nuovoDb()
    dM.raw.run(`CREATE TABLE sidly_misure (imei TEXT NOT NULL, ts INTEGER NOT NULL, hr REAL, hr_q INTEGER, spo2 REAL, spo2_q INTEGER, temp REAL, steps REAL, steps_tot REAL, pressure REAL, sdnn REAL, rmssd REAL, resp REAL, hr_rest REAL, wear INTEGER, fonte TEXT, PRIMARY KEY (imei, ts)) WITHOUT ROWID`)
    const tm = Math.floor(NOW / 3600) * 3600 - 3600
    dM.raw.run(`INSERT INTO sidly_misure (imei, ts, hr, spo2, fonte) VALUES ('${IMEI_A}', ${tm}, 70, 97, 'stats'), ('${IMEI_A}', ${tm - 3600}, 71, 96, 'stats')`)
    const anM = await T.eseguiAffidabilita(base(dM, makeSidly(), { dryRun: true }))
    ok(anM.result.assistiti![0].anteprima?.affid_db?.colonna_presente === false && anM.result.assistiti![0].anteprima?.affid_db?.senza_affidabilita === 2, 'affidabilita: anteprima su tabella vecchia (senza colonna) = tutte le righe da aggiornare')
    ok(dM.q(`SELECT COUNT(*) AS n FROM pragma_table_info('sidly_misure') WHERE name='affid'`)[0].n === 0, 'affidabilita: l\'anteprima non modifica lo schema')
    const rM = await T.eseguiAffidabilita(base(dM, makeSidly()))
    ok(rM.result.completato === true && dM.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE affid = 2')[0].n === 2, 'affidabilita: la prima scrittura aggiunge la colonna e aggiorna le righe esistenti')

    // Errori e validazioni
    const dE = await nuovoDb(); await preparaVecchio(dE, 20)
    const rE = await T.eseguiAffidabilita(base(dE, makeSidly({ statsStatus: 500 })))
    ok(rE.result.assistiti![0].errore!.includes('HTTP 500') && rE.result.completato === false && dE.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE affid IS NOT NULL')[0].n === 0, 'affidabilita: errore 500 di SiDLY: nessuna riga modificata, errore riportato')
    ok((await T.eseguiAffidabilita(base(dE, makeSidly(), { assistitoId: 3, dryRun: true }))).httpStatus === 404, 'affidabilita: assistito non ATTIVO: 404')
    ok((await T.eseguiAffidabilita({ ...base(dE, makeSidly()), env: {} })).httpStatus === 503, 'affidabilita: senza credenziali SiDLY: 503')
    ok((await T.eseguiAffidabilita(base(dE, makeSidly(), { primaDi: NOW * 2, dryRun: true }))).httpStatus === 400, 'affidabilita: \"prima_di\" non valido: 400')
    const rV = await T.eseguiAffidabilita(base(dE, makeSidly(), { assistitoId: 2, dryRun: true }))
    ok(rV.httpStatus === 200 && !!rV.result.assistiti![0].errore && /importa prima/.test(rV.result.assistiti![0].errore!), 'affidabilita: assistito senza misure: messaggio chiaro, nessuna chiamata inutile')

    // Sorgente: rotta e Dashboard
    const idx = readFileSync('src/index.tsx', 'utf8'), dash = readFileSync('src/modules/dashboard-templates-new.ts', 'utf8')
    const i = idx.search(/app\.post\('\/api\/sidly\/storico'/)
    const blk = idx.slice(i, i + 6000)
    ok(/body\?\.affidabilita === true/.test(blk) && /eseguiAffidabilita\(/.test(blk) && /checkSessionOrKey\(/.test(blk) && /dryRun: !scrive/.test(blk), 'rotta storico: «affidabilita» resta protetta e scrive solo con conferma_scrittura')
    ok(/sidlyAffidAnteprima/.test(dash) && /sidlyAffidScrivi/.test(dash) && /affidabilita:\s*true/.test(dash) && /Aggiorna l&rsquo;affidabilit/.test(dash), 'Dashboard: box «Aggiorna l\'affidabilita\'» con anteprima e conferma')
    ok(/ultima_misura/.test(dash) && /silenzio_giorni/.test(dash), 'Dashboard: l\'anteprima «ultime» mostra la data dell\'ultima misura e i giorni di silenzio')
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
    ok(A.passi_medi_giorno === 400 && A.giorni_con_dati === 2, 'passi: somma per giorno poi media dei giorni (300 e 500 → 400); i giorni con soli passi contano come giorni con dati')
    ok(A.punti === 3, 'punti = solo misurazioni vere (3 istanti con un valore fisiologico): la riga con i soli passi non e\' una misurazione')
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
    ok(sa.misure_totali === d.q(`SELECT COUNT(*) AS n FROM sidly_misure WHERE imei = ? AND ${T.VITALE_SQL}`, IMEI_A)[0].n && sa.misure_totali > 0, 'stato: «misure_totali» = misurazioni vere (con un valore fisiologico) realmente nel DB, non dipende dal contatore dello storico completo')
    ok(s.assistiti.filter(x => x.imei !== IMEI_A && x.imei !== IMEI_B).every(x => x.misure_totali === 0), 'stato: chi non ha misure risulta a 0')
    {
      const dsh = readFileSync('src/modules/dashboard-templates-new.ts', 'utf8')
      ok(/misure_totali/.test(dsh) && /Misurazioni nel DB/.test(dsh) && /Nessun dato da /.test(dsh) && /Nessuna misura scaricata/.test(dsh), 'Dashboard: stato con conteggio reale e motivo (nessuna misura / fermo da N giorni)')
    }
    ok(!('frame_registrato' in sa) && !('ultimo_frame' in sa) && !('n_frame' in sa), 'stato: nessun concetto di frame ricevuti/registrati (i dati arrivano solo da SiDLY via API)')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 11b: assistiti con braccialetto cambiato (IMEI precedenti): le misure restano dell\'assistito')
  {
    const nuovoDb = async () => {
      const d = await makeD1(); T.dimenticaTabelle()
      d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Tommaso', 'Badano'), (2, '${IMEI_B}', 'ATTIVO', 'Laura', 'Calvi'), (3, '868298060000009', 'INATTIVO', 'Gianni', 'Pizzutto')`)
      return d
    }
    const base = (d: any, P: any, extra: any = {}) => ({ db: d.db, env: ENV, ultime: 100, assistitoId: 1, dryRun: false, nowSec: NOW, fetchImpl: P.fetchImpl, ...extra })

    // Registrazione: validazioni
    const d = await nuovoDb(); await T.assicuraTabelle(d.db)
    const g = (o: any) => T.gestisciImeiPrecedente(d.db, { assistitoId: 1, ...o })
    ok((await g({ imei: '123' })).httpStatus === 400, 'IMEI precedente non valido: 400')
    ok((await T.gestisciImeiPrecedente(d.db, { assistitoId: 99, imei: IMEI_X })).httpStatus === 404, 'IMEI precedente su assistito inesistente: 404')
    ok((await g({ imei: IMEI_A })).httpStatus === 400, 'l\'IMEI attuale non puo\' essere registrato come precedente')
    ok((await g({ imei: IMEI_B })).httpStatus === 409, 'l\'IMEI attuale di un altro assistito non puo\' essere registrato come precedente: 409')
    const r1 = await g({ imei: IMEI_X })
    ok(r1.httpStatus === 200 && JSON.stringify(r1.result.imei_precedenti) === JSON.stringify([IMEI_X]), 'IMEI precedente registrato')
    ok((await g({ imei: IMEI_X })).httpStatus === 200 && d.count('sidly_imei') === 1, 'registrarlo di nuovo non duplica')
    ok((await T.gestisciImeiPrecedente(d.db, { assistitoId: 2, imei: IMEI_X })).httpStatus === 409, 'un IMEI precedente di un assistito non si assegna a un altro: 409')

    // Misure su entrambi i braccialetti
    const T0 = Math.floor((NOW - 3 * 86400) / 86400) * 86400 + 12 * 3600
    await d.db.batch(T.istruzioniMisure(d.db, [
      { imei: IMEI_X, ts: T0, fonte: 'stats', hr: 60, spo2: 95, affid: 3 },
      { imei: IMEI_X, ts: T0 + 3600, fonte: 'stats', hr: 70, affid: 3 },
      { imei: IMEI_A, ts: T0 + 7200, fonte: 'stats', hr: 80, spo2: 99, affid: 3 },
      { imei: IMEI_B, ts: T0, fonte: 'stats', hr: 90, affid: 3 },
    ]))
    const st = await T.statoTelemetria(d.db, NOW)
    const sa = st.assistiti.find(x => x.assistito_id === 1)!
    ok(st.assistiti.length === 2 && sa.misure_totali === 3 && JSON.stringify(sa.imei_precedenti) === JSON.stringify([IMEI_X]), 'stato: le misure dell\'assistito sommano braccialetto attuale e precedente (3), una sola riga per assistito')
    ok(sa.misure_dal === T.fmtSidlyData(T0) + ' UTC' && sa.misure_al === T.fmtSidlyData(T0 + 7200) + ' UTC', 'stato: periodo coperto dal primo braccialetto all\'ultimo')
    const rp = await T.reportMedie(d.db, { giorni: 30, nowSec: NOW })
    const A = rp.assistiti.find(x => x.assistito_id === 1)!
    ok(A.metriche.hr.n === 3 && A.metriche.hr.media === 70 && A.imei_considerati === 2, 'medie: includono le misure del braccialetto precedente (FC 60, 70, 80 → 70)')
    ok(rp.assistiti.length === 2 && rp.assistiti.every(x => x.assistito_id !== 3), 'medie: un assistito INATTIVO (Pizzutto) non compare')
    const ds: any = await T.datasetMisure(d.db, {})
    const righe = ds.csv.trim().split('\n').slice(1).map((x: string) => x.split(','))
    ok(righe.length === 4 && righe.filter((x: string[]) => x[1] === IMEI_X).every((x: string[]) => x[0] === '1'), 'dataset: le righe del vecchio IMEI portano l\'id dell\'assistito')
    const ds1: any = await T.datasetMisure(d.db, { assistitoId: 1 })
    ok(ds1.ok && ds1.csv.trim().split('\n').length === 4, 'dataset di un assistito: comprende tutti i suoi braccialetti (3 righe)')
    ok(!/Tommaso|Badano/.test(ds.csv), 'dataset: nessun nome')

    // Un IMEI che oggi e' attuale di un altro assistito non conta come precedente
    d.raw.run(`UPDATE assistiti SET imei = '${IMEI_X}' WHERE id = 2`)
    ok(((await T.imeiPrecedenti(d.db, 1)).get(1) || []).length === 0, 'se un vecchio IMEI diventa attuale di un altro assistito, non e\' piu\' contato come precedente')
    d.raw.run(`UPDATE assistiti SET imei = '${IMEI_B}' WHERE id = 2`)

    // Rimozione: nessuna misura cancellata
    const rm = await g({ imei: IMEI_X, rimuovi: true })
    ok(rm.httpStatus === 200 && (rm.result.imei_precedenti || []).length === 0 && d.count('sidly_misure') === 4, 'togliere un braccialetto precedente non cancella le misure')

    // Importazione "ultime N" per il braccialetto precedente
    const d2 = await nuovoDb(); const P2 = makeSidly()
    ok((await T.eseguiUltime(base(d2, P2, { imei: IMEI_X, dryRun: true }))).httpStatus === 404, 'ultime: IMEI non registrato come precedente: 404, nessuna chiamata')
    ok(P2.calls.length === 0, 'ultime: IMEI non registrato = zero chiamate a SiDLY')
    await T.gestisciImeiPrecedente(d2.db, { assistitoId: 1, imei: IMEI_X })
    const rU = await T.eseguiUltime(base(d2, P2, { imei: IMEI_X }))
    ok(rU.result.completato === true && d2.count('sidly_misure') === 100 && d2.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE imei = ?', IMEI_X)[0].n === 100, 'ultime sul braccialetto precedente: 100 misure salvate sotto il vecchio IMEI')
    ok(P2.calls.every(c => c.method === 'GET' && (!/\/patient\/\d+\/stats/.test(c.path) || c.path.includes(IMEI_X))), 'ultime sul braccialetto precedente: legge solo l\'IMEI scelto, solo GET')
    ok(rU.result.assistiti![0].precedente === true, 'ultime: risposta segnala che e\' un braccialetto precedente')
    const aff = await T.eseguiAffidabilita(base(d2, makeSidly(), { imei: IMEI_X, dryRun: true }))
    ok(aff.httpStatus === 200 && aff.result.assistiti![0].anteprima?.affid_db?.righe === 100, 'affidabilita: funziona anche sul braccialetto precedente')

    // Storico completo di tutti: include i precedenti, e un precedente sconosciuto a SiDLY non blocca gli altri
    const d3 = await nuovoDb(); await T.assicuraTabelle(d3.db)
    await T.gestisciImeiPrecedente(d3.db, { assistitoId: 1, imei: IMEI_X })
    const P3 = makeSidly({ failImei: IMEI_X })
    let r3 = await T.eseguiStorico({ db: d3.db, env: ENV, da: 'inizio', dryRun: false, nowSec: NOW, fetchImpl: P3.fetchImpl, maxFinestre: 20, maxRighe: 20000 })
    let g3 = 0
    while (!r3.result.completato && g3++ < 10) r3 = await T.eseguiStorico({ db: d3.db, env: ENV, da: 'inizio', dryRun: false, nowSec: NOW, fetchImpl: P3.fetchImpl, maxFinestre: 20, maxRighe: 20000 })
    ok(r3.result.completato === true && d3.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE imei = ?', IMEI_A)[0].n > 0 && d3.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE imei = ?', IMEI_B)[0].n > 0, 'storico di tutti: un braccialetto precedente non riconosciuto da SiDLY non blocca gli altri assistiti')
    ok((r3.result.avvisi || []).some(x => /precedente/.test(x) && /saltato/.test(x)), 'storico di tutti: il braccialetto precedente in errore e\' segnalato come avviso')
    const P4 = makeSidly(); const d4 = await nuovoDb(); await T.assicuraTabelle(d4.db)
    await T.gestisciImeiPrecedente(d4.db, { assistitoId: 1, imei: IMEI_X })
    let r4 = await T.eseguiStorico({ db: d4.db, env: ENV, da: 'inizio', dryRun: false, nowSec: NOW, fetchImpl: P4.fetchImpl, maxFinestre: 20, maxRighe: 20000 }), g4 = 0
    while (!r4.result.completato && g4++ < 10) r4 = await T.eseguiStorico({ db: d4.db, env: ENV, da: 'inizio', dryRun: false, nowSec: NOW, fetchImpl: P4.fetchImpl, maxFinestre: 20, maxRighe: 20000 })
    ok(d4.q('SELECT COUNT(*) AS n FROM sidly_misure WHERE imei = ?', IMEI_X)[0].n > 0 && P4.calls.every(c => c.method === 'GET'), 'storico di tutti: scarica anche le misure del braccialetto precedente (solo GET)')

    // Cambio di IMEI dal confronto con SiDLY / da modifica assistito: il vecchio viene registrato
    {
      const S = await import('../../src/modules/sidly-sync')
      const stm: Array<{ sql: string; b: any[] }> = []
      const dbB: any = { prepare: (sql: string) => ({ sql, b: [] as any[], bind(...b: any[]) { return { sql, b } } }), batch: async (x: any[]) => { for (const y of x) stm.push({ sql: y.sql, b: y.b || [] }) } }
      const ctx = { assistitoId: 7, leadId: 'L1', configId: 5, imei: IMEI_X, cronicheRaw: '' }
      await S.applyCrmOps(dbB, [{ t: 'col', tabella: 'assistiti', col: 'imei', val: IMEI_A, chiave: 'band.imei' }], ctx)
      const ins = stm.find(x => /INSERT OR IGNORE INTO sidly_imei/.test(x.sql))
      ok(!!ins && ins.b[0] === IMEI_X && ins.b[1] === 7, 'confronto SiDLY: cambiando l\'IMEI nel CRM il vecchio viene registrato come precedente')
      stm.length = 0
      await S.applyCrmOps(dbB, [{ t: 'col', tabella: 'assistiti', col: 'imei', val: IMEI_X, chiave: 'band.imei' }], ctx)
      ok(!stm.some(x => /sidly_imei/.test(x.sql)), 'confronto SiDLY: stesso IMEI = nessuna registrazione')
      stm.length = 0
      await S.applyCrmOps(dbB, [{ t: 'col', tabella: 'assistiti', col: 'peso', val: 70, chiave: 'x' }], ctx)
      ok(!stm.some(x => /sidly_imei/.test(x.sql)), 'confronto SiDLY: altre colonne = nessuna registrazione')
    }

    // Sorgente
    const idx = readFileSync('src/index.tsx', 'utf8'), dash = readFileSync('src/modules/dashboard-templates-new.ts', 'utf8')
    const ip = idx.search(/app\.put\('\/api\/assistiti\/:id'/)
    ok(/gestisciImeiPrecedente/.test(idx.slice(ip, ip + 4500)), 'PUT assistito: se l\'IMEI cambia registra il vecchio come braccialetto precedente')
    const ir = idx.search(/app\.post\('\/api\/sidly\/telemetria\/imei-precedenti'/)
    ok(ir > 0 && /checkSessionOrKey\(/.test(idx.slice(ir, ir + 600)) && /checkSessionOrKey\(/.test(idx.slice(idx.search(/app\.get\('\/api\/sidly\/telemetria\/imei-precedenti'/), idx.search(/app\.get\('\/api\/sidly\/telemetria\/imei-precedenti'/) + 600)), 'rotte imei-precedenti: protette da sessione o chiave')
    ok(/sidlyImeiPrecAggiungi/.test(dash) && /imei-precedenti/.test(dash) && /telConImei/.test(dash), 'Dashboard: riquadro braccialetti precedenti e importazione per IMEI')
    ok(!/set-url-for-band|delete-url-for-band/.test(readFileSync('src/modules/sidly-telemetria.ts', 'utf8').replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')), 'telemetria: ancora nessuna scrittura di URL sui braccialetti')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 11c: medie filtrate per affidabilita\' minima (0 = tutte, 1 = 1-3, 2 = 2-3, 3 = solo 3)')
  {
    const d = await makeD1(); T.dimenticaTabelle()
    d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Giorgia', 'Origoni'), (2, '${IMEI_B}', 'ATTIVO', 'Laura', 'Calvi')`)
    await T.assicuraTabelle(d.db)
    const T0 = Math.floor((NOW - 3 * 86400) / 86400) * 86400 + 12 * 3600
    // FC = 10 * (affid + 1) per riconoscere quali misure entrano: indice 0 -> 10, 1 -> 20, 2 -> 30, 3 -> 40; una misura senza indice -> 500
    await d.db.batch(T.istruzioniMisure(d.db, [
      { imei: IMEI_A, ts: T0, fonte: 'stats', hr: 10, spo2: 90, affid: 0, steps: 100 },
      { imei: IMEI_A, ts: T0 + 3600, fonte: 'stats', hr: 20, spo2: 91, affid: 1, steps: 100 },
      { imei: IMEI_A, ts: T0 + 7200, fonte: 'stats', hr: 30, spo2: 92, affid: 2, steps: 100 },
      { imei: IMEI_A, ts: T0 + 10800, fonte: 'stats', hr: 40, spo2: 93, affid: 3, steps: 100 },
      { imei: IMEI_A, ts: T0 + 14400, fonte: 'stats', hr: 100, spo2: 99 },
      { imei: IMEI_B, ts: T0, fonte: 'stats', hr: 50, affid: 3 },
    ]))
    const hr = async (aff: number | undefined, id = 1) => { const r = await T.reportMedie(d.db, { giorni: 30, assistitoId: id, nowSec: NOW, affidMin: aff }); return { r, m: r.assistiti[0].metriche.hr } }
    const t0 = await hr(0), tU = await hr(undefined)
    ok(t0.m.n === 5 && t0.m.media === (10 + 20 + 30 + 40 + 100) / 5, 'affidabilita 0: tutte le misure, anche quella senza indice (media 40)')
    ok(tU.m.n === 5 && tU.r.affid_min === 0, 'senza filtro = soglia 0')
    const t1 = await hr(1)
    ok(t1.m.n === 3 && t1.m.media === 30 && t1.m.min === 20 && t1.m.max === 40, 'affidabilita 1: solo indice 1, 2 e 3 (20, 30, 40 → 30); lo 0 e la misura senza indice sono escluse')
    const t2 = await hr(2)
    ok(t2.m.n === 2 && t2.m.media === 35, 'affidabilita 2: solo indice 2 e 3 (30, 40 → 35)')
    const t3 = await hr(3)
    ok(t3.m.n === 1 && t3.m.media === 40 && t3.m.min === 40 && t3.m.max === 40, 'affidabilita 3: solo indice 3 (40)')
    const sp = (await T.reportMedie(d.db, { giorni: 30, assistitoId: 1, nowSec: NOW, affidMin: 3 })).assistiti[0].metriche.spo2
    ok(sp.n === 1 && sp.media === 93, 'il filtro vale anche per SpO2 (con soglia 3 resta solo 93)')
    ok(t3.r.assistiti[0].misure_periodo === 5 && t3.r.assistiti[0].misure_incluse === 1 && t3.r.assistiti[0].misure_senza_affid === 1, 'il report dice quante misure usa su quante del periodo e quante non hanno l\'indice')
    ok(t0.r.assistiti[0].misure_incluse === 5, 'soglia 0: tutte le misure risultano usate')
    ok(t3.r.assistiti[0].passi_medi_giorno === t0.r.assistiti[0].passi_medi_giorno && t0.r.assistiti[0].passi_medi_giorno !== null, 'i passi non sono filtrati dall\'affidabilita\' (contatore, non misura di segnale)')
    ok(t3.r.assistiti[0].punti === 1 && t0.r.assistiti[0].punti === 5, 'punti del periodo coerenti con il filtro')
    const coorte = await T.reportMedie(d.db, { giorni: 30, nowSec: NOW, affidMin: 3 })
    ok(coorte.coorte.metriche.hr.assistiti === 2 && coorte.coorte.metriche.hr.media === (40 + 50) / 2, 'coorte con soglia 3: media delle medie filtrate (40 e 50 → 45)')
    const coorte2 = await T.reportMedie(d.db, { giorni: 30, nowSec: NOW, affidMin: 2 })
    ok(coorte2.coorte.metriche.hr.media === (35 + 50) / 2, 'coorte con soglia 2: (35 e 50 → 42,5)')
    // soglia fuori scala: il modulo non allarga mai il filtro (valori oltre 3 = 3, negativi = 0)
    ok((await hr(7)).m.n === 1 && (await hr(-2)).m.n === 5, 'soglia fuori scala limitata a 0-3 dal modulo')
    // assistito senza nessuna misura abbastanza affidabile: media assente, non zero
    d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (4, '868298060000004', 'ATTIVO', 'Poca', 'Qualita')`)
    await d.db.batch(T.istruzioniMisure(d.db, [{ imei: '868298060000004', ts: T0, fonte: 'stats', hr: 75, affid: 1 }]))
    const pq = (await T.reportMedie(d.db, { giorni: 30, assistitoId: 4, nowSec: NOW, affidMin: 3 })).assistiti[0]
    ok(pq.metriche.hr.n === 0 && pq.metriche.hr.media === null && pq.misure_incluse === 0, 'nessuna misura con l\'affidabilita\' richiesta: media assente (non zero) e 0 misure usate')

    // Tabella creata prima della colonna affid: soglia 0 funziona, soglia > 0 non include nulla e non genera errori
    const dv = await makeD1(); T.dimenticaTabelle()
    dv.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Vecchio', 'Db')`)
    dv.raw.run(`CREATE TABLE sidly_misure (imei TEXT NOT NULL, ts INTEGER NOT NULL, hr REAL, hr_q INTEGER, spo2 REAL, spo2_q INTEGER, temp REAL, steps REAL, steps_tot REAL, pressure REAL, sdnn REAL, rmssd REAL, resp REAL, hr_rest REAL, wear INTEGER, fonte TEXT, PRIMARY KEY (imei, ts)) WITHOUT ROWID`)
    dv.raw.run(`INSERT INTO sidly_misure (imei, ts, hr, fonte) VALUES ('${IMEI_A}', ${T0}, 70, 'stats'), ('${IMEI_A}', ${T0 + 3600}, 80, 'stats')`)
    const v0 = await T.reportMedie(dv.db, { giorni: 30, nowSec: NOW, affidMin: 0 })
    const v2 = await T.reportMedie(dv.db, { giorni: 30, nowSec: NOW, affidMin: 2 })
    ok(v0.assistiti[0].metriche.hr.media === 75 && v0.affid_colonna === false, 'tabella senza colonna affid: soglia 0 = tutte le misure')
    ok(v2.assistiti[0].metriche.hr.n === 0 && v2.assistiti[0].misure_senza_affid === 2 && v2.tabelle_presenti === true, 'tabella senza colonna affid: con soglia > 0 nessuna misura entra e il report spiega che non hanno l\'indice')
    ok(dv.q(`SELECT COUNT(*) AS n FROM pragma_table_info('sidly_misure') WHERE name='affid'`)[0].n === 0, 'il report non modifica lo schema')

    // Sorgente: rotta e Dashboard
    const idx = readFileSync('src/index.tsx', 'utf8'), dash = readFileSync('src/modules/dashboard-templates-new.ts', 'utf8')
    const i = idx.search(/app\.get\('\/api\/sidly\/telemetria\/report'/)
    const blk = idx.slice(i, i + 2500)
    ok(/affid_min/.test(blk) && /affid_min deve essere 0, 1, 2 o 3/.test(blk) && /Number\.isInteger\(affMin\)/.test(blk) && /checkSessionOrKey\(/.test(blk), 'rotta report: affid_min accettato solo 0-3 (altrimenti 400) e rotta protetta')
    ok(/id="telAffMin"/.test(dash) && /affid_min=/.test(dash) && /tutte le misure/.test(dash) && /solo affidabilit&agrave; 3/.test(dash), 'Dashboard: selettore dell\'affidabilita\' minima (0-3) per le medie')
    ok(/Misure usate/.test(dash) && /non hanno ancora l&rsquo;indice/.test(dash), 'Dashboard: mostra quante misure sono usate e avvisa se mancano gli indici')
  }

  // ───────────────────────────────────────────────────────────────────
  section('SiDLY telemetria 11d: misurazioni VERE (la pressione atmosferica non conta), N nuove e modalita\' «aggiorna»')
  {
    const nuovoDb = async () => {
      const d = await makeD1(); T.dimenticaTabelle()
      d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${IMEI_A}', 'ATTIVO', 'Giorgia', 'Origoni'), (2, '${IMEI_B}', 'ATTIVO', 'Laura', 'Calvi')`)
      return d
    }
    const base = (d: any, P: any, extra: any = {}) => ({ db: d.db, env: ENV, ultime: 100, assistitoId: 1, dryRun: false, nowSec: NOW, fetchImpl: P.fetchImpl, ...extra })
    const vere = (d: any, imei = IMEI_A) => Number(d.q(`SELECT COUNT(*) AS n FROM sidly_misure WHERE imei = ? AND ${T.VITALE_SQL}`, imei)[0].n)

    // parseStats: i valori di pressione (~1013) sono pressione atmosferica, non una misura della persona
    const pp = T.parseStats({ pulse: { chart: [{ x: 1781241600, y: 70 }] }, pressure: { chart: [{ x: 1781241600, y: 1013 }, { x: 1781243400, y: 1012 }] } }, IMEI_A)
    ok(pp.righe.length === 1 && pp.righe[0].hr === 70 && pp.righe[0].pressure === 1013, 'parse: la pressione sullo stesso istante di una misura vera resta sulla riga, quella da sola viene scartata')
    ok(pp.vitali === 1 && pp.a_vitale === 1781241600, 'parse: «vitali» e «a_vitale» contano solo le misurazioni con un valore fisiologico')
    const soloP = T.parseStats({ pressure: { chart: [{ x: 1781241600, y: 1013 }] } }, IMEI_A)
    ok(soloP.righe.length === 0 && soloP.vitali === 0 && soloP.a_vitale === null, 'parse: solo pressione atmosferica = nessuna misurazione, nessuna ultima misura')
    const soloPassi = T.parseStats({ steps: { total: 50, chart: [{ x: 1781241600, y: 50 }] } }, IMEI_A)
    ok(soloPassi.righe.length === 1 && soloPassi.vitali === 0, 'parse: i soli passi si tengono (servono ai passi/giorno) ma non sono una misurazione')
    ok(T.ETICHETTE_STATS.pressure.unita === 'hPa' && /atmosferica/i.test(T.ETICHETTE_STATS.pressure.nome) && /NON la pressione arteriosa/.test(T.ETICHETTE_STATS.pressure.nome), 'etichetta: «Pressione atmosferica ... NON la pressione arteriosa» in hPa')

    // N nuove VERE: con la pressione mezz\'ora-per-mezz\'ora, 100 richieste = 100 misurazioni vere, non 100 righe di cui meta' di pressione
    const d = await nuovoDb(); const P = makeSidly({ pressione: true })
    const r1 = await T.eseguiUltime(base(d, P, { ultime: 100 }))
    const a1 = r1.result.assistiti![0]
    ok(vere(d) === 100 && a1.misurazioni === 100 && a1.motivo_fine === 'richieste', `ultime 100 con pressione: esattamente 100 misurazioni VERE (trovate ${vere(d)}), motivo «richieste»`)
    ok(Number(d.q(`SELECT COUNT(*) AS n FROM sidly_misure WHERE NOT ${T.VITALE_SQL} AND steps IS NULL`)[0].n) === 0, 'nessuna riga di sola pressione scritta nel DB')
    const r2 = await T.eseguiUltime(base(d, P, { ultime: 100 }))
    ok(vere(d) === 200 && r2.result.assistiti![0].misurazioni === 100, `rilancio: altre 100 misurazioni NUOVE (totale ${vere(d)}), le prime 100 saltate`)
    // righe di sola pressione GIA' nel DB (importate prima di questa regola) non contano come «gia' caricate»
    const dL = await nuovoDb(); const PL = makeSidly({ pressione: true })
    T.dimenticaTabelle(); await T.assicuraTabelle(dL.db)
    await dL.db.batch(T.istruzioniMisure(dL.db, [{ imei: IMEI_A, ts: NOW - 1800, fonte: 'stats', pressure: 1013 }, { imei: IMEI_A, ts: NOW - 5400, fonte: 'stats', pressure: 1012 }]))
    const rL = await T.eseguiUltime(base(dL, PL, { ultime: 50 }))
    ok(vere(dL) === 50 && rL.result.assistiti![0].misurazioni === 50, 'righe di sola pressione gia\' nel DB: non contano come misurazioni caricate, le 50 nuove arrivano comunque')
    const stL = await T.statoTelemetria(dL.db, NOW)
    ok(stL.assistiti.find(x => x.assistito_id === 1)!.misure_totali === 50, 'stato: «misure_totali» ignora le righe di sola pressione')
    // motivo «inizio»: meno misure disponibili di N
    const dI = await nuovoDb(); const PI = makeSidly({ pressione: true })
    const rI = await T.eseguiUltime(base(dI, PI, { ultime: 5000 }))
    ok(rI.result.completato === true && rI.result.assistiti![0].motivo_fine === 'inizio' && vere(dI) < 5000 && vere(dI) > 100, `N maggiore del disponibile: prende tutte (${vere(dI)}) e dice che e' arrivato all'attivazione («inizio»)`)
    // Braccialetto che manda solo pressione: nessuna ultima misura
    const dS = await nuovoDb(); const PS = makeSidly({ soloPressione: true })
    const rS = await T.eseguiUltime(base(dS, PS, { dryRun: true, ultime: 1000 }))
    const aS = rS.result.assistiti![0]
    ok(!aS.anteprima?.ultima_misura && (rS.result.avvisi || []).some(x => /nessuna misura trovata/.test(x)), 'braccialetto che manda solo pressione atmosferica: l\'anteprima dice «nessuna misura trovata», non una falsa ultima misura')

    // Report: la pressione non gonfia misure usate ne' giorni con dati
    const dR = await nuovoDb(); T.dimenticaTabelle(); await T.assicuraTabelle(dR.db)
    const G = Math.floor((NOW - 2 * 86400) / 86400) * 86400 + 10 * 3600
    await dR.db.batch(T.istruzioniMisure(dR.db, [{ imei: IMEI_A, ts: G, fonte: 'stats', hr: 70 }, { imei: IMEI_A, ts: G + 1800, fonte: 'stats', pressure: 1013 }, { imei: IMEI_A, ts: G - 86400, fonte: 'stats', pressure: 1012 }, { imei: IMEI_B, ts: G, fonte: 'stats', pressure: 1010 }]))
    const rep0 = await T.reportMedie(dR.db, { giorni: 30, nowSec: NOW })
    const RA = rep0.assistiti.find(x => x.assistito_id === 1)!, RB = rep0.assistiti.find(x => x.assistito_id === 2)!
    ok(RA.misure_periodo === 1 && RA.giorni_con_dati === 1 && RA.punti === 1, 'report: una misura vera + due righe di sola pressione = 1 misura, 1 giorno con dati')
    ok(RB.misure_periodo === 0 && RB.giorni_con_dati === 0 && RB.punti === 0 && rep0.coorte.assistiti_con_dati === 1, 'report: chi ha solo pressione atmosferica non risulta con dati')

    // «Aggiorna»: da adesso a ritroso fino alle misure gia' caricate
    const dU = await nuovoDb(); const PU = makeSidly({ pressione: true })
    const ie = await T.eseguiAggiorna({ db: dU.db, env: ENV, assistitoId: 1, dryRun: true, nowSec: NOW, fetchImpl: PU.fetchImpl })
    ok(ie.httpStatus === 200 && /Nessuna misura nel DB/.test(ie.result.assistiti![0].errore || '') && PU.calls.filter(c => c.path.includes('/stats')).length === 0, 'aggiorna: assistito senza misure nel DB -> messaggio chiaro e nessuna chiamata a SiDLY')
    const TRE = 3 * 86400
    await T.eseguiUltime(base(dU, PU, { ultime: 100, nowSec: NOW - TRE }))
    const prima = vere(dU), maxPrima = Number(dU.q(`SELECT MAX(ts) AS m FROM sidly_misure`)[0].m)
    ok(prima === 100 && maxPrima <= NOW - TRE, 'aggiorna: preparazione = 100 misurazioni fino a 3 giorni fa')
    const calls0 = PU.calls.length, scr0 = dU.stats.singles + dU.stats.stmtsInBatches
    const dry = await T.eseguiAggiorna({ db: dU.db, env: ENV, assistitoId: 1, dryRun: true, nowSec: NOW, fetchImpl: PU.fetchImpl })
    const an = dry.result.assistiti![0].anteprima!
    ok(dry.result.esito === 'anteprima' && !!an.ultima_nel_db && (an.giorni_scoperti || 0) >= 2.9 && (an.giorni_scoperti || 0) <= 3.1 && (an.nuove_settimana || 0) > 0, `aggiorna: anteprima con ultima misura nel DB e giorni da coprire (${an.giorni_scoperti})`)
    ok(dU.stats.singles + dU.stats.stmtsInBatches === scr0 && PU.calls.slice(calls0).every(c => c.method === 'GET'), 'aggiorna: l\'anteprima non scrive nulla e usa solo GET')
    const ru = await T.eseguiAggiorna({ db: dU.db, env: ENV, assistitoId: 1, dryRun: false, nowSec: NOW, fetchImpl: PU.fetchImpl })
    const au = ru.result.assistiti![0]
    // la finestra arriva fino a NOW-1 secondo: l'ora esatta di NOW non c'e' ancora
    const attese = Math.floor((NOW - 1) / 3600) - Math.floor(maxPrima / 3600)
    ok(ru.result.completato === true && au.motivo_fine === 'gia_caricate' && au.misurazioni === attese && vere(dU) === prima + attese, `aggiorna: aggiunge solo le misure mancanti (${au.misurazioni} = ${attese}) e si ferma quando trova quelle gia' caricate`)
    ok(PU.calls.slice(calls0).filter(c => c.path.includes('/stats')).length === 1 + 1 /* anteprima */, 'aggiorna: una sola finestra letta da SiDLY (non rilegge l\'archivio)')
    ok(Number(dU.q(`SELECT COUNT(*) AS n FROM sidly_misure WHERE NOT ${T.VITALE_SQL} AND steps IS NULL`)[0].n) === 0, 'aggiorna: nessuna riga di sola pressione scritta')
    const dopo = vere(dU)
    const ru2 = await T.eseguiAggiorna({ db: dU.db, env: ENV, assistitoId: 1, dryRun: false, nowSec: NOW, fetchImpl: PU.fetchImpl })
    ok(ru2.result.completato === true && ru2.result.assistiti![0].misurazioni === 0 && vere(dU) === dopo, 'aggiorna: rilancio subito dopo = 0 misure nuove, nessun duplicato')
    ok(PU.calls.every(c => c.method === 'GET'), 'aggiorna: nessuna scrittura su SiDLY (solo GET)')
    const stU = dU.q('SELECT backfill_fino_ts, backfill_da_ts, completo_ts FROM sidly_stato WHERE imei = ?', IMEI_A)[0]
    ok(stU && stU.backfill_fino_ts === null && stU.backfill_da_ts === null && stU.completo_ts === null, 'aggiorna: il cursore dello storico completo non viene toccato')
    // Errore di SiDLY: nessuna riga, errore riportato
    const dX = await nuovoDb(); await T.eseguiUltime(base(dX, makeSidly(), { ultime: 50, nowSec: NOW - TRE }))
    const nX = dX.count('sidly_misure')
    const rX = await T.eseguiAggiorna({ db: dX.db, env: ENV, assistitoId: 1, dryRun: false, nowSec: NOW, fetchImpl: makeSidly({ statsStatus: 500 }).fetchImpl })
    ok(/HTTP 500/.test(rX.result.assistiti![0].errore || '') && dX.count('sidly_misure') === nX && rX.result.completato === false, 'aggiorna: errore 500 di SiDLY: niente scritto, errore riportato')
    ok((await T.eseguiAggiorna({ db: dX.db, env: {}, assistitoId: 1, dryRun: true, nowSec: NOW, fetchImpl: makeSidly().fetchImpl })).httpStatus === 503, 'aggiorna: senza credenziali SiDLY: 503')
    ok((await T.eseguiAggiorna({ db: dX.db, env: ENV, assistitoId: 99, dryRun: true, nowSec: NOW, fetchImpl: makeSidly().fetchImpl })).httpStatus === 404, 'aggiorna: assistito inesistente: 404')
    ok((await T.eseguiAggiorna({ db: dX.db, env: ENV, assistitoId: 1, dryRun: true, primaDi: NOW + 100, nowSec: NOW, fetchImpl: makeSidly().fetchImpl })).httpStatus === 400, 'aggiorna: prima_di nel futuro: 400')

    // Sorgente: rotta protetta e Dashboard
    const idx = readFileSync('src/index.tsx', 'utf8'), dash = readFileSync('src/modules/dashboard-templates-new.ts', 'utf8')
    const i0 = idx.search(/app\.post\('\/api\/sidly\/storico'/)
    const blk = idx.slice(i0, i0 + 9000)
    ok(/body\?\.aggiorna === true/.test(blk) && /eseguiAggiorna\(/.test(blk) && /checkSessionOrKey\(/.test(blk) && /dryRun: !scrive/.test(blk), 'rotta storico: «aggiorna» protetta da sessione/chiave, senza conferma_scrittura e\' sempre anteprima')
    ok(/sidlyAggiornaAnteprima/.test(dash) && /sidlyAggiornaScrivi/.test(dash) && /aggiorna:\s*true/.test(dash) && /Aggiorna con le misure nuove/.test(dash), 'Dashboard: riquadro «Aggiorna con le misure nuove» con anteprima e conferma')
    ok(/Misurazioni nuove aggiunte/.test(dash) && /telEsitiHtml/.test(dash) && /motivo_fine/.test(dash), 'Dashboard: dopo l\'importazione si vede, per ogni assistito, quante misurazioni nuove e perche\' si e\' fermato')
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
    ok((mod.match(/ALTER\s+TABLE\s+\w+/gi) || []).every(x => /(sidly_stato|sidly_misure)$/i.test(x)), 'gli unici ALTER sono migrazioni di tabelle della telemetria (sidly_stato, sidly_misure), mai di altre tabelle')
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
