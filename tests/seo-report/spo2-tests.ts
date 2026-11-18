// Test dell'elaborazione SpO2 mensile per modello (Care Pro vs Vital Care): dati SINTETICI su D1 (sql.js), sola lettura.
import { readFileSync } from 'node:fs'
import * as T from '../../src/modules/sidly-telemetria'
import { spo2PerModello, spo2TabellaHtml, gruppoModello } from '../../src/modules/spo2-modelli'
import { makeD1 } from './sidly-telemetria-tests'

type Ok = (c: boolean, msg: string) => void
type Section = (t: string) => void
const ts = (y: number, m: number, d: number, h = 10) => Date.UTC(y, m - 1, d, h) / 1000

export async function runSpo2Tests(ok: Ok, section: Section) {
  section('SpO2 mensili per modello: classificazione, conteggi, mesi parziali, assistiti con piu\' braccialetti, schema dispositivi')
  ok(gruppoModello('SiDLY VITAL CARE') === 'VITAL CARE' && gruppoModello('SiDLY Vital Care V12') === 'VITAL CARE' && gruppoModello('SiDLY CARE PRO') === 'CARE PRO' && gruppoModello('SiDLY Care Pro V12.0') === 'CARE PRO', 'modello con «VITAL» = Vital Care; altrimenti Care Pro (stessa regola dell\'inventario)')
  ok(gruppoModello(null) === 'non registrato' && gruppoModello('') === 'non registrato' && gruppoModello(undefined) === 'non registrato', 'modello assente = non registrato (non inventato)')

  const NOW = ts(2026, 11, 12, 12)
  const IM = { a: '860000000000001', b: '860000000000002', c: '860000000000003', d: '860000000000004', old: '860000000000009', e: '860000000000005' }
  for (const schema of ['serial_number', 'imei'] as const) {
    const d = await makeD1(); T.dimenticaTabelle(); await T.assicuraTabelle(d.db)
    d.raw.run(`CREATE TABLE dispositivi (id INTEGER PRIMARY KEY, ${schema} TEXT, modello TEXT)`)
    const ass = (id: number, imei: string, st = 'ATTIVO') => d.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (${id}, '${imei}', '${st}', 'N${id}', 'C${id}')`)
    ass(1, IM.a); ass(2, IM.b); ass(3, IM.c); ass(4, IM.d); ass(5, IM.e); ass(6, '860000000000006', 'CESSATO')
    d.raw.run(`INSERT INTO dispositivi (${schema}, modello) VALUES ('${IM.a}','SiDLY CARE PRO'),('${IM.b}','SiDLY CARE PRO'),('${IM.c}','SiDLY VITAL CARE'),('${IM.d}','SiDLY VITAL CARE'),('860000000000006','SiDLY CARE PRO')`)
    d.raw.run(`INSERT INTO sidly_imei (imei, assistito_id, creato_il) VALUES ('${IM.old}', 1, '2026-01-01')`)
    const righe: any[] = []
    const mis = (imei: string, y: number, m: number, giorni: number, spo2: number | null = 97) => { for (let g = 1; g <= giorni; g++) righe.push({ imei, ts: ts(y, m, g), fonte: 'stats' as const, spo2, hr: 70 }) }
    mis(IM.a, 2026, 9, 10); mis(IM.a, 2026, 10, 20)            // Care Pro #1: set 10, ott 20
    mis(IM.old, 2026, 9, 6)                                      // vecchio braccialetto di #1: conta per lui (set 10+6)
    mis(IM.b, 2026, 10, 10)                                      // Care Pro #2: ott 10
    mis(IM.c, 2026, 9, 4); mis(IM.c, 2026, 10, 6)                // Vital #3: set 4, ott 6
    mis(IM.d, 2026, 10, 2)                                       // Vital #4: ott 2
    mis(IM.c, 2026, 10, 3, null)                                 // senza SpO2 (solo hr): NON conta (stessi giorni, ts diversi ore)
    for (const r of righe.slice(-3)) r.ts += 7200
    mis('860000000000006', 2026, 10, 28)         // assistito CESSATO: escluso
    mis(IM.e, 2026, 10, 9)                                       // assistito senza dispositivo registrato: non e' ne' Care Pro ne' Vital
    mis(IM.a, 2026, 11, 5)                                       // mese corrente (parziale)
    await d.db.batch(T.istruzioniMisure(d.db, righe))
    const antes = d.count('sidly_misure')
    const R = await spo2PerModello(d.db, { nowSec: NOW })
    const m = (x: string) => R.mesi.find((y: any) => y.mese === x)
    ok(R.esito === 'ok' && R.mesi.map((x: any) => x.mese).join() === '2026-09,2026-10,2026-11', `[${schema}] serie mensile continua dal primo all'ultimo mese con dati`)
    ok(m('2026-09').care_pro.misure === 16 && m('2026-09').care_pro.assistiti_con_misure === 1 && m('2026-09').care_pro.media_per_assistito === 16, `[${schema}] Care Pro settembre: 16 misure (10 + 6 del braccialetto precedente) di 1 assistito`)
    ok(m('2026-10').care_pro.misure === 30 && m('2026-10').care_pro.assistiti_con_misure === 2 && m('2026-10').care_pro.media_per_assistito === 15, `[${schema}] Care Pro ottobre: 30 misure / 2 assistiti = 15`)
    ok(m('2026-09').vital_care.misure === 4 && m('2026-10').vital_care.misure === 8 && m('2026-10').vital_care.assistiti_con_misure === 2 && m('2026-10').vital_care.media_per_assistito === 4, `[${schema}] Vital Care ottobre: 6+2 misure / 2 assistiti = 4 (le righe senza SpO2 non contano)`)
    ok(m('2026-10').rapporto_care_pro_su_vital === 3.75, `[${schema}] rapporto medie ottobre 15 / 4 = 3,75`)
    ok(m('2026-11').parziale === true && m('2026-09').parziale === false && m('2026-10').parziale === false, `[${schema}] il mese corrente e' marcato parziale, gli altri no`)
    const t = R.totali
    ok(t.care_pro.assistiti_attivi === 2 && t.vital_care.assistiti_attivi === 2 && t.care_pro.mesi_completi === 2, `[${schema}] assistiti attivi 2+2; totali su 2 mesi completi`)
    ok(t.care_pro.media_mensile_per_assistito === Math.round(((16 + 30) / (1 + 2)) * 100) / 100 && t.vital_care.media_mensile_per_assistito === Math.round(((4 + 8) / (1 + 2)) * 100) / 100, `[${schema}] media mensile per assistito = misure dei mesi completi / somma assistiti-mese (15,33 vs 4)`)
    ok(R.mesi.every((x: any) => x.care_pro.misure + x.vital_care.misure < 100) && !JSON.stringify(R).includes('N5') && R.totali.non_registrato.assistiti_attivi === 1, `[${schema}] l'assistito CESSATO e' escluso; quello senza modello registrato e' contato a parte (non attribuito a nessun gruppo)`)
    ok(d.count('sidly_misure') === antes, `[${schema}] sola lettura: nessuna riga scritta in sidly_misure`)
    ok(/<table/.test(spo2TabellaHtml(R)) && /2026-10/.test(spo2TabellaHtml(R)) && /3,75/.test(spo2TabellaHtml(R)), `[${schema}] vista tabella HTML con i mesi e il rapporto (virgola decimale)`)
  }
  // senza tabelle / senza dispositivi: nessun errore
  const v = await makeD1()
  const E = await spo2PerModello(v.db, { nowSec: NOW })
  ok(E.esito === 'ok' && E.mesi.length === 0 && E.totali.care_pro.media_mensile_per_assistito === null, 'database vuoto: risposta valida, nessun numero inventato (null)')

  const idx = readFileSync('src/index.tsx', 'utf8')
  const blocco = idx.slice(idx.indexOf("app.get('/api/analisi/spo2-mensili'"), idx.indexOf("app.get('/api/sidly/telemetria/imei-precedenti'"))
  ok(/checkSessionOrKey/.test(blocco) && !/\.run\(|INSERT|UPDATE|DELETE/.test(blocco), 'rotta /api/analisi/spo2-mensili: protetta da sessione/chiave e di sola lettura')
}
