// Test della sonda batteria SiDLY (autonomia Care Pro): SiDLY simulata, D1 sql.js. Solo GET, nessuna scrittura, nessun set/delete-url-for-band.
import { readFileSync } from 'node:fs'
import { bersagliCarePro, faseProbe, faseSnapshot, snapshotCsv, campiBatteria, riepilogoStats, chiamante, serieBatteria, puntiBatteria, cicliScarica, mensileCicli, faseStorico, storicoCsv, cicliCsv, mensileCsv } from '../../src/modules/sidly-batteria'
import { SidlyClient, resetSidlyTokenCache, type Fetch } from '../../src/modules/sidly-sync'
import { makeD1 } from './sidly-telemetria-tests'

type Ok = (c: boolean, msg: string) => void
type Section = (t: string) => void
const BASE = 'https://api.sidly-platform-dev.com/api'
const ENV = { SIDLY_USER: 'u@example.com', SIDLY_PASSWORD: 'x', SIDLY_BASE_URL: BASE }
const NOW = Date.UTC(2026, 10, 20, 12, 0, 0) / 1000

interface Opz { serieBatteria?: 'corta' | 'lunga'; conBatteria?: boolean; conCarica?: boolean; storicoLungo?: boolean; r429?: number; sempre429?: boolean; levelWrap?: boolean }
function finta(o: Opz = {}) {
  const calls: { method: string; path: string }[] = []
  let n429 = o.r429 || 0
  const f: Fetch = async (url, init) => {
    const method = init?.method || 'GET'; const path = url.replace(BASE, '')
    const reply = (status: number, json?: any) => ({ status, text: async () => (json === undefined ? '' : JSON.stringify(json)), headers: { get: () => null } })
    if (path === '/user/login') return reply(200, { data: { authentication_token: 'tok' } })
    calls.push({ method, path })
    if (o.sempre429) return reply(429, {})
    if (n429 > 0) { n429--; return reply(429, {}) }
    let m = path.match(/^\/patient\/(\d+)\/stats\?fromDate=([^&]+)&toDate=(.+)$/)
    if (m) {
      const da = Date.parse(decodeURIComponent(m[2]).replace(' ', 'T') + 'Z') / 1000
      const lungo = da < NOW - 100 * 86400
      const lm: any[] = [{ timestamp: lungo && o.storicoLungo ? NOW - 300 * 86400 : NOW - 3600, pulse: 70, sat: 97, info: '' }]
      if (o.conCarica) { lm.push({ timestamp: NOW - 7200, info: 'Band charging' }, { timestamp: NOW - 5400, info: 'Band fullcharged' }) }
      if (o.conBatteria) lm.forEach(x => { (x as any).batt_percent = 55 })
      const body: any = { pulse: { chart: [{ x: NOW - 3600, y: 70 }], stats: {} }, lastMeasurements: lm }
      if (o.serieBatteria) {
        // serie «battery» come pulse/sat: la finestra richiesta parte da `da`; se lo storico e' corto parte comunque al massimo 20 giorni fa
        const inizio = o.serieBatteria === 'lunga' ? Math.max(da, NOW - 400 * 86400) : Math.max(da, NOW - 20 * 86400)
        const chart: any[] = []
        for (let t = inizio, i = 0; t < NOW; t += 86400 * 2, i++) chart.push({ x: t, y: 100 - ((i * 13) % 80) })
        body.battery = { chart, stats: { min: 20, max: 100, mean: 60 }, newest: chart[chart.length - 1] }
      }
      return reply(200, body)
    }
    m = path.match(/^\/patientIntegrate\/(\d+)$/)
    if (m) { const j = { imei: m[1], batteryLevel: Number(m[1].slice(-2)), lastMeasurement: String(NOW - 600) }; return reply(200, o.levelWrap ? { data: j } : j) }
    return reply(404, {})
  }
  return { f, calls }
}
const pausaFinta = () => { const ms: number[] = []; return { ms, pausa: async (x: number) => { ms.push(x) } } }

export async function runBatteriaTests(ok: Ok, section: Section) {
  section('Sonda batteria SiDLY: selezione Care Pro, fase 1 (probe), backoff 429, snapshot CSV, sola lettura')

  // Selezione dei dispositivi: solo ATTIVI e Care Pro (VITAL, cessati, senza modello esclusi)
  {
    const d = await makeD1()
    const ass = (id: number, imei: string, st = 'ATTIVO') => d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (${id}, '${imei}', '${st}', 'N', 'C')`)
    ass(1, '860000000000001'); ass(2, '860000000000002'); ass(3, '860000000000003'); ass(4, '860000000000004', 'CESSATO'); ass(5, '860000000000005')
    d.raw.run(`CREATE TABLE dispositivi (id INTEGER PRIMARY KEY, imei TEXT, serial_number TEXT, modello TEXT)`)
    d.raw.run(`INSERT INTO dispositivi (serial_number, modello) VALUES ('860000000000001','SiDLY CARE PRO'),('860000000000002','SiDLY VITAL CARE'),('860000000000004','SiDLY CARE PRO'),('860000000000005','SiDLY CARE PRO')`)
    const b = await bersagliCarePro(d.db)
    ok(b.map(x => x.imei).join() === '860000000000001,860000000000005' && b.every(x => Object.keys(x).sort().join() === 'assistito_id,imei'), 'bersagli = assistiti ATTIVI con braccialetto Care Pro (Vital, cessati e senza modello esclusi); solo id e IMEI, nessun nome')
  }

  // Fase 1 con batteria e carica nello storico
  {
    const F = finta({ conBatteria: true, conCarica: true, storicoLungo: true }); const P = pausaFinta(); resetSidlyTokenCache()
    const R = await faseProbe(ENV, [{ imei: '860000000000001', assistito_id: 1 }, { imei: '860000000000005', assistito_id: 5 }, { imei: '860000000000007', assistito_id: 7 }, { imei: '860000000000008', assistito_id: 8 }], { nowSec: NOW, fetchImpl: F.f, pausa: P.pausa })
    ok(R.esito === 'ok' && R.esito_fase1.batteria_in_stats === 'SI' && R.esito_fase1.eventi_carica_nello_storico === 'SI', 'probe: campo batteria in /stats e messaggi «Band charging/fullcharged» riconosciuti → SI / SI')
    ok(R.imei.length === 3, 'probe: massimo 3 IMEI campione')
    ok(R.esito_fase1.eventi_carica_coprono_oltre_60_giorni === true, 'probe: con storico lungo dichiara che gli eventi di carica coprono oltre 60 giorni')
    ok(F.calls.length === R.chiamate && F.calls.every(c => c.method === 'GET'), 'probe: solo richieste GET (oltre al login)')
    ok(F.calls.every(c => /^\/patient\/\d+\/stats\?|^\/patientIntegrate\//.test(c.path)) && !F.calls.some(c => /set-url-for-band|delete-url-for-band/.test(c.path)), 'probe: nessuna chiamata verso i dispositivi (mai set/delete-url-for-band)')
    ok(P.ms.length === F.calls.length - 1 && P.ms.every(x => x === 1000), 'probe: cadenza di 1 richiesta al secondo (pausa di 1000 ms tra le chiamate)')
    ok(F.calls.some(c => c.path.includes('fromDate=2025-05-01')), 'probe: se c\'e\' batteria/carica rilegge dal 2025-05-01 per verificare la copertura')
    ok(R.imei[0].recente.campi_batteria.some((c: any) => c.percorso === 'lastMeasurements[].batt_percent') && R.imei[0].recente.info_distinti.some((x: any) => x.testo === 'Band charging'), 'probe: elenca i percorsi dei campi batteria e i testi «info» distinti')
  }
  // Fase 1: serie «battery» in /stats (come pulse/sat), storico lungo -> caso A, rilettura dal 2025-05-01
  {
    const F = finta({ serieBatteria: 'lunga' }); const P = pausaFinta(); resetSidlyTokenCache()
    const R = await faseProbe(ENV, [{ imei: '860000000000001', assistito_id: 1 }], { nowSec: NOW, fetchImpl: F.f, pausa: P.pausa })
    ok(R.esito_fase1.batteria_in_stats === 'SI', 'probe: la serie «battery» (chart come pulse/sat) in /stats viene riconosciuta → batteria_in_stats SI')
    ok(F.calls.some(c => c.path.includes('fromDate=2025-05-01')), 'probe: con la serie «battery» rilegge dal 2025-05-01')
    ok(R.esito_fase1.batteria_copre_oltre_60_giorni === true && R.esito_fase1.batteria_storico_giorni >= 300 && /^A \(serie/.test(R.esito_fase1.caso), 'probe: storico lungo della serie battery → caso A, giorni di storico indicati')
    ok(R.imei[0].esteso.serie_batteria[0].chiave === 'battery' && Object.keys(R.imei[0].esteso.serie_batteria[0].per_mese).length >= 10 && R.imei[0].esteso.serie_batteria[0].primi_punti.length === 5, 'probe: riepilogo della serie battery con punti per mese e primi punti')
    ok(F.calls.every(c => c.method === 'GET') && R.sola_lettura === true, 'probe serie battery: solo GET')
  }
  {
    const F = finta({ serieBatteria: 'corta' }); const P = pausaFinta(); resetSidlyTokenCache()
    const R = await faseProbe(ENV, [{ imei: '860000000000001', assistito_id: 1 }], { nowSec: NOW, fetchImpl: F.f, pausa: P.pausa })
    ok(R.esito_fase1.batteria_in_stats === 'SI' && R.esito_fase1.batteria_copre_oltre_60_giorni === false && /^A parziale/.test(R.esito_fase1.caso), 'probe: serie battery presente ma storico breve (<60 giorni) → «A parziale», non B')
  }
  // Fase 1 senza nulla
  {
    const F = finta({}); const P = pausaFinta(); resetSidlyTokenCache()
    const R = await faseProbe(ENV, [{ imei: '860000000000001', assistito_id: 1 }], { nowSec: NOW, fetchImpl: F.f, pausa: P.pausa })
    ok(R.esito_fase1.batteria_in_stats === 'NO' && R.esito_fase1.eventi_carica_nello_storico === 'NO' && R.esito_fase1.caso === 'B', 'probe senza batteria ne\' eventi di carica → NO / NO, caso B')
    ok(F.calls.length === 1 && !F.calls[0].path.includes('2025-05-01'), 'probe senza batteria: nessuna rilettura dello storico lungo')
  }
  // Config mancante
  {
    const R = await faseProbe({}, [{ imei: '860000000000001', assistito_id: 1 }], { nowSec: NOW, fetchImpl: finta().f })
    ok(R.esito === 'errore' && /non configurata/.test(R.errore), 'senza credenziali SiDLY: errore chiaro, nessuna chiamata')
  }
  // 429: una attesa di 60 s e si riprova; persistente -> si ferma
  {
    const F = finta({ r429: 1 }); const P = pausaFinta(); resetSidlyTokenCache()
    const { get, stato } = chiamante(new SidlyClient(ENV, F.f), P.pausa)
    const r = await get('/patientIntegrate/860000000000001')
    ok(r.status === 200 && P.ms.includes(60000) && stato.chiamate === 2, 'HTTP 429: attesa di 60 s e un nuovo tentativo')
    const F2 = finta({ sempre429: true }); const P2 = pausaFinta(); resetSidlyTokenCache()
    const c2 = chiamante(new SidlyClient(ENV, F2.f), P2.pausa)
    await c2.get('/patientIntegrate/1'); const n = F2.calls.length; const r2 = await c2.get('/patientIntegrate/2')
    ok(c2.stato.bloccato429 === true && r2.status === 429 && F2.calls.length === n, '429 persistente: la sonda si ferma e non martella SiDLY')
  }
  // Snapshot CSV
  {
    const F = finta({ levelWrap: true }); const P = pausaFinta(); resetSidlyTokenCache()
    const R = await faseSnapshot(ENV, [{ imei: '860000000000047', assistito_id: 3 }, { imei: '860000000000099', assistito_id: 4 }], { nowSec: NOW, fetchImpl: F.f, pausa: P.pausa })
    ok(R.righe.length === 2 && R.righe[0].batteryLevel === 47 && R.righe[1].batteryLevel === 99 && R.righe[0].stato === 'ok', 'snapshot: una GET /patientIntegrate per dispositivo, batteryLevel letto (anche con risposta in «data»)')
    const csv = snapshotCsv(R.righe).split('\n')
    ok(csv[0] === 'ts_utc,imei,assistito_id,batteryLevel,ultima_misura_utc,stato' && csv[1].startsWith('2026-11-20T12:00:00.000Z,860000000000047,3,47,') && csv.length === 4, 'snapshot: CSV con intestazione ts_utc,imei,assistito_id,batteryLevel,… e una riga per IMEI')
    ok(F.calls.every(c => c.method === 'GET' && /^\/patientIntegrate\/\d+$/.test(c.path)), 'snapshot: solo GET /patientIntegrate/{imei}')
  }
  // Utilita' pure
  {
    ok(serieBatteria({ battery: { chart: [{ x: 200, y: 50 }, { x: 100, y: 90 }] }, pulse: { chart: [{ x: 1, y: 1 }] } }).length === 1 && serieBatteria({ battery: { chart: [{ x: 200, y: 50 }, { x: 100, y: 90 }] } })[0].primi_punti[0].x === 100 && serieBatteria({ battery: 5 }).length === 0 && serieBatteria(null).length === 0, 'serieBatteria: solo metriche batteria con chart, punti ordinati nel tempo, input anomali senza errori')
    ok(campiBatteria({ a: { batt_mv: 3700, b: [{ batteryLevel: 40 }, { batteryLevel: 41 }] }, nulla: 1 }).map(x => `${x.percorso}:${x.n}`).sort().join() === 'a.b[].batteryLevel:2,a.batt_mv:1', 'campiBatteria: percorsi senza indici, con conteggio')
    ok(riepilogoStats({}, NOW - 100, NOW).lastMeasurements.n === 0 && riepilogoStats(null, NOW - 100, NOW).eventi_carica === 0, 'riepilogoStats: risposta vuota/nulla senza errori')
  }
  // FASE 2: punti, ricariche, cicli, autonomia mensile
  {
    const H = 3600
    const T0 = Date.UTC(2026, 0, 1) / 1000
    // scarica 100->20 in 10 giorni (1 punto ogni 6 ore), ricarica, poi scarica 100->20 in 8 giorni
    const pts = (ini: number, dalP: number, alP: number, giorni: number) => { const o: any[] = []; const n = giorni * 4; for (let i = 0; i <= n; i++) o.push({ ts: ini + i * 6 * H, pct: Math.round(dalP - ((dalP - alP) * i) / n) }); return o }
    const a = pts(T0, 100, 20, 10), b = pts(a[a.length - 1].ts + 3 * H, 100, 20, 8)
    const r = cicliScarica([...a, ...b], T0 + 60 * 86400)
    ok(r.ricariche.length === 1 && r.cicli.length === 2, 'cicli: una ricarica separa due scariche')
    ok(r.cicli[0].autonomia_ore_100_20 === 240 && r.cicli[0].completo && !r.cicli[0].ricarica_iniziale_osservata && r.cicli[1].autonomia_ore_100_20 === 192 && r.cicli[1].ricarica_iniziale_osservata, 'cicli: autonomia 100→20 = 240 h e 192 h; il primo ciclo non ha la ricarica osservata')
    // un ciclo che copre solo 100->60 viene riportato alla scala 100->20
    const c = cicliScarica(pts(T0, 100, 60, 5), T0 + 90 * 86400).cicli[0]
    ok(c.caduta === 40 && c.autonomia_ore_100_20 === 240 && !c.completo, 'cicli: caduta parziale (40 punti) riportata a 80 punti in proporzione, ciclo non «completo»')
    // caduta troppo piccola o ciclo in corso: nessuna autonomia
    ok(cicliScarica(pts(T0, 100, 80, 3), T0 + 90 * 86400).cicli[0].autonomia_ore_100_20 === null, 'cicli: caduta sotto i 40 punti non entra nelle statistiche')
    const inCorso = cicliScarica(pts(T0, 100, 30, 7), T0 + 7 * 86400 + 6 * H).cicli[0]
    ok(inCorso.in_corso && inCorso.autonomia_ore_100_20 === null, 'cicli: ultimo ciclo con dato recente = in corso, escluso')
    // rumore: risalita di pochi punti non e' una ricarica
    const rum = cicliScarica([{ ts: 0, pct: 90 }, { ts: 6 * H, pct: 80 }, { ts: 12 * H, pct: 86 }, { ts: 18 * H, pct: 70 }, { ts: 24 * H, pct: 50 }], 400 * 86400)
    ok(rum.ricariche.length === 0 && rum.cicli.length === 1, 'cicli: una risalita di 6 punti e\' rumore, non una ricarica')
    // ricarica in piu' passi (50 -> 70 -> 65 -> 100)
    const piu = cicliScarica([{ ts: 0, pct: 100 }, { ts: 10 * H, pct: 50 }, { ts: 12 * H, pct: 70 }, { ts: 13 * H, pct: 65 }, { ts: 14 * H, pct: 100 }, { ts: 60 * H, pct: 40 }], 400 * 86400)
    ok(piu.ricariche.length === 1 && piu.ricariche[0].pct_da === 50 && piu.ricariche[0].pct_a === 100, 'cicli: salite separate da un calo piccolo = una sola ricarica')
    ok(cicliScarica([], 0).cicli.length === 0 && cicliScarica([{ ts: 1, pct: 5 }], 0).cicli.length === 0, 'cicli: serie vuota o di un punto senza errori')
    ok(r.cicli[0].ore_80_40 === 120 && r.cicli[1].ore_80_40 === 96, 'cicli: ore da 80% a 40% (120 h e 96 h) interpolate, indipendenti dal punto di arrivo')
    ok(cicliScarica(pts(T0, 100, 60, 5), T0 + 90 * 86400).cicli[0].ore_80_40 === null && cicliScarica(pts(T0, 70, 10, 5), T0 + 90 * 86400).cicli[0].ore_80_40 === null, 'cicli: ore_80_40 nulla se il ciclo non arriva a 40% o non parte da almeno 80%')
    // stessa pendenza (1/3 di punto all'ora): una persona ricarica a 40%, l'altra scende a 20%
    const corto = cicliScarica([...pts(T0, 100, 40, 7.5), ...pts(T0 + 7.5 * 86400 + 6 * H, 100, 40, 7.5)], T0 + 90 * 86400).cicli[0]
    const lungo = cicliScarica(pts(T0, 100, 20, 10), T0 + 90 * 86400).cicli[0]
    ok(corto.ore_80_40 === lungo.ore_80_40 && corto.autonomia_ore_100_20 === lungo.autonomia_ore_100_20, 'cicli: scarica con la stessa pendenza ricaricando a 40% o a 20% → stessa ore_80_40 e stessa autonomia')
    const buco = cicliScarica([{ ts: 0, pct: 100 }, { ts: 6 * H, pct: 85 }, { ts: 30 * H, pct: 30 }, { ts: 36 * H, pct: 20 }], 400 * 86400).cicli[0]
    ok(buco.ore_80_40 === null, 'cicli: buco di dati > 12 h dentro la fascia 80-40 → ore_80_40 non valutata')
    ok(puntiBatteria({ battery: { chart: [{ x: 5, y: 50 }, { x: 5, y: 51 }, { x: 3, y: 60 }, { x: 4, y: null }, { x: 6, y: 140 }, { x: 'a', y: 1 }] } }).map(p => `${p.ts}:${p.pct}`).join() === '3:60,5:51', 'puntiBatteria: ordina, toglie duplicati, null, valori fuori 0-100 e x non numerici')
    const m = mensileCicli([{ imei: '1', assistito_id: 1, cicli: r.cicli }, { imei: '2', assistito_id: 2, cicli: r.cicli }])
    ok(m.per_dispositivo.length === 2 && m.per_dispositivo[0].mese === '2026-01' && m.per_dispositivo[0].n_cicli === 2 && m.per_dispositivo[0].mediana_ore === 216 && m.per_dispositivo[0].mediana_ore_80_40 === 108 && m.per_dispositivo[0].n_cicli_80_40 === 2 && m.complessivo[0].n_dispositivi === 2 && m.complessivo[0].n_cicli === 4, 'mensile: mediana per dispositivo e complessiva, mese = quello di fine ciclo')
    // faseStorico con SiDLY simulata: una sola GET per IMEI, 1 al secondo, CSV
    const BASE2 = BASE
    const calls: string[] = []
    const f: Fetch = async (url, init) => {
      const path = url.replace(BASE2, ''); const reply = (st: number, j?: any) => ({ status: st, text: async () => (j === undefined ? '' : JSON.stringify(j)), headers: { get: () => null } })
      if (path === '/user/login') return reply(200, { data: { authentication_token: 'tok' } })
      calls.push((init?.method || 'GET') + ' ' + path)
      if (path.includes('/860000000000009/')) return reply(500, {})
      return reply(200, { pulse: { chart: [] }, battery: { chart: [...a, ...b].map(p => ({ x: p.ts, y: p.pct })) } })
    }
    const P = pausaFinta(); resetSidlyTokenCache()
    const R = await faseStorico(ENV, [{ imei: '860000000000001', assistito_id: 1 }, { imei: '860000000000009', assistito_id: 9 }, { imei: '860000000000002', assistito_id: 2 }], { nowSec: T0 + 60 * 86400, fetchImpl: f, pausa: P.pausa })
    ok(R.esito === 'ok' && R.sola_lettura && calls.length === 3 && calls.every(x => x.startsWith('GET /patient/') && x.includes('fromDate=2025-05-01')), 'storico: una GET /stats per dispositivo dal 2025-05-01, solo lettura')
    ok(P.ms.length === 2 && P.ms.every(x => x === 1000), 'storico: 1 richiesta al secondo')
    ok(R.completo === false && R.dispositivi[1].stato.startsWith('HTTP 500') && R.dispositivi[0].cicli_validi === 2 && R.dispositivi[0].autonomia_mediana_ore === 216, 'storico: un dispositivo in errore e\' dichiarato (completo=false) senza fermare gli altri')
    const csv = storicoCsv(R.dati).split('\n')
    ok(csv[0] === 'ts_utc,imei,assistito_id,batt_percent,batt_mv' && csv[1] === '2026-01-01T00:00:00.000Z,860000000000001,1,100,' && csv.length === a.length * 2 + b.length * 2 + 2, 'batteria_storico.csv: intestazione richiesta, una riga per punto, batt_mv vuoto')
    ok(cicliCsv(R.dati).split('\n')[1].startsWith('860000000000001,1,1,2026-01-01T00:00:00.000Z,') && mensileCsv(R.mensile).split('\n')[0].startsWith('imei,assistito_id,mese,n_cicli'), 'CSV cicli e autonomia mensile con intestazioni')
    const G = await faseStorico(ENV, [{ imei: '860000000000001', assistito_id: 1 }], { nowSec: T0 + 60 * 86400, fetchImpl: f, pausa: P.pausa, grezzo: true })
    ok(Object.keys(G.grezzo)[0] === '860000000000001' && Array.isArray(G.grezzo['860000000000001'].battery.chart), 'storico formato=raw: risposta /stats intera conservata (test_stats_<imei>.json)')
    ok((await faseStorico({}, [{ imei: '860000000000001', assistito_id: 1 }], { fetchImpl: f })).esito === 'errore', 'storico senza credenziali: errore chiaro')
  }
  // Sorgente: sola lettura
  {
    const mod = readFileSync('src/modules/sidly-batteria.ts', 'utf8').replace(/^\s*\/\/.*$/gm, '')
    ok(!/set-url-for-band|delete-url-for-band/.test(mod) && !/'(POST|PUT|PATCH|DELETE)'/.test(mod) && !/\.run\(|INSERT|UPDATE |DELETE FROM/.test(mod), 'modulo sidly-batteria: nessuna scrittura (ne\' verso SiDLY ne\' su D1) e nessun set/delete-url-for-band nel codice')
    const idx = readFileSync('src/index.tsx', 'utf8')
    const blocco = idx.slice(idx.indexOf("app.get('/api/sidly/batteria'"), idx.indexOf("app.get('/api/sidly/telemetria/imei-precedenti'"))
    ok(/checkSessionOrKey/.test(blocco) && !/\.run\(|INSERT|UPDATE |DELETE/.test(blocco), 'rotta /api/sidly/batteria: protetta da sessione/chiave, di sola lettura')
  }
}
