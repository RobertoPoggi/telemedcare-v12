// Test dell'indice di stress (HRV): modello puro, pipeline D1 (sql.js) su fixture golden, invarianti, sorgente di rotta/UI.
// Le fixture sono SINTETICHE (gen-stress-fixture.mjs) costruite per riprodurre i valori di accettazione 1-3.
import { readFileSync } from 'node:fs'
import * as M from '../../src/modules/stressModel.js'
import * as T from '../../src/modules/sidly-telemetria'
import { analisiStress, SQL_STRESS_WINDOW } from '../../src/modules/stress-analisi'
import { makeD1 } from './sidly-telemetria-tests'

type Ok = (c: boolean, msg: string) => void
type Section = (t: string) => void
const near = (a: number | null, b: number, e = 1e-9) => a !== null && Math.abs(a - b) < e
const G = (g: string, v: number, n = 1) => ({ giorno: g, somma: v * n, n })
const dayN = (n: number) => M.numeroAGiorno(n)

export async function runStressTests(ok: Ok, section: Section) {
  // ───────────────────────────────────────────────────────────────────
  section('Indice di stress 1: modello puro (costanti, clamp, fasce, media mobile adattiva, platea, guardia storico)')
  {
    ok(M.PENDENZA === 1.4 && M.ANCORAGGIO === 10 && JSON.stringify(M.SOGLIE_FASCE) === '[40,60,80]' && M.MIN_GIORNI_STORICO === 7 && M.AFFIDABILITA === 3, 'costanti del modello: pendenza 1,4, ancoraggio 10, soglie 40/60/80, storico minimo 7 giorni, affidabilita\' 3')
    ok(near(M.PENDENZA, 90 / 64, 0.01), 'pendenza 1,4 ~ 90/64 (calibrazione sul report SiDLY)')
    ok(M.indiceStress(64, 64) === 10 && M.indiceStress(100, 100) === 10, 'RMSSD pari alla baseline → indice 10 (ancoraggio, «Basso»)')
    ok(M.indiceStress(100, 80) === 38 && M.indiceStress(100, 60) === 66, 'indice = 10 + 1,4 × (baseline − RMSSD 3gg), arrotondato (20 ms sotto → 38; 40 ms sotto → 66)')
    ok(M.indiceStress(100, 1000) === 0 && M.indiceStress(100, 0) === 100 && M.indiceStress(0, 500) === 0, 'clamp: mai sotto 0 (RMSSD molto sopra baseline) ne\' sopra 100')
    ok(Object.is(M.indiceStress(100, 107.2), 0) && M.indiceStress(100, 107.2) === 0, 'nessun -0: un risultato a zero e\' 0')
    ok(M.indiceStress(NaN, 50) === null && M.indiceStress(50, Infinity) === null, 'input non numerici → null (nessun indice inventato)')
    ok(M.clamp(5, 0, 3) === 3 && M.clamp(-1, 0, 3) === 0 && M.clamp(2, 0, 3) === 2, 'clamp(x, min, max)')
    const f = (i: number) => M.fasciaStress(i)
    ok(f(0) === 'Basso' && f(39) === 'Basso' && f(40) === 'Moderato' && f(59) === 'Moderato' && f(60) === 'Alto' && f(79) === 'Alto' && f(80) === 'Molto alto' && f(100) === 'Molto alto', 'fasce ai confini: <40 Basso, <60 Moderato, <80 Alto, ≥80 Molto alto')
    ok(M.fasciaStress(null) === null, 'fascia di un indice assente = null')
    const iv = M.intervalliFasce()
    ok(iv.map(x => `${x.da}-${x.a}`).join(',') === '0-39,40-59,60-79,80-100' && iv.map(x => x.colore_barra).join(',') === '#7db8d8,#f0b429,#e0705a,#b3453a', 'intervalli delle fasce derivati dalle soglie; colori barre blu/ambra/arancio/rosso')
    ok(M.COLORI_CARD.length === 4 && M.NOMI_FASCE.join('|') === 'Basso|Moderato|Alto|Molto alto', 'colori card (verde/ambra/arancio/rosso) e nomi delle fasce')

    // Media mobile ADATTIVA: finestra di 1, 2, poi 3 date; i giorni senza HRV non sono interpolati ne' contati
    const mm = M.mediaMobileAdattiva([G('2026-11-01', 100), G('2026-11-02', 110), G('2026-11-03', 120), G('2026-11-10', 90)])
    ok(mm.map(x => x.giorni_finestra).join() === '1,2,3,3', 'media mobile adattiva: 1, 2 e poi 3 date disponibili')
    ok(near(mm[0].rmssd_3gg, 100) && near(mm[1].rmssd_3gg, 105) && near(mm[2].rmssd_3gg, 110), 'media mobile sui primi giorni: 100, 105, 110')
    ok(near(mm[3].rmssd_3gg, (110 + 120 + 90) / 3) && mm.length === 4, 'dopo un buco di 6 giorni la finestra usa le ultime 3 date DISPONIBILI (110,120,90), nessuna interpolazione e nessun giorno inventato')
    ok(near(M.mediaMobileAdattiva([G('2026-11-01', 100, 4), { giorno: '2026-11-01', somma: 200, n: 2 }])[0].rmssd_giorno, 600 / 6), 'piu\' braccialetti dello stesso giorno: valore giornaliero = media pesata sulle misure')
    ok(M.mediaMobileAdattiva([{ giorno: '2026-11-01', somma: 0, n: 0 }]).length === 0, 'un giorno senza misure RMSSD e\' escluso')

    // Baseline: media delle MISURE (non dei giorni); rolling60
    const bl = [G('2026-01-01', 100, 9), G('2026-01-02', 200, 1)]
    ok(near(M.baselineStorico(bl, 'full'), 110), 'baseline = media delle misure (9 a 100 e 1 a 200 → 110), non media dei giorni (150)')
    const lungo = Array.from({ length: 100 }, (_, k) => G(dayN(M.giornoANumero('2026-01-01') + k), k < 40 ? 200 : 100))
    ok(near(M.baselineStorico(lungo, 'full'), (40 * 200 + 60 * 100) / 100) && near(M.baselineStorico(lungo, 'rolling60', dayN(M.giornoANumero('2026-01-01') + 99)), 100), 'baseline rolling60: solo gli ultimi 60 giorni; full: intero storico')

    // Guardia: storico < 7 giorni di HRV
    const poco = M.serieIndividuale(Array.from({ length: 6 }, (_, k) => G(`2026-11-0${k + 1}`, 50)))
    ok(poco.ok === false && poco.serie.length === 0 && poco.baseline === null && poco.motivo === 'storico HRV insufficiente' && poco.giorni_storico === 6, 'storico di 6 giorni: nessun indice, motivo «storico HRV insufficiente»')
    const sette = M.serieIndividuale(Array.from({ length: 7 }, (_, k) => G(`2026-11-0${k + 1}`, 50)))
    ok(sette.ok === true && sette.serie.length === 7 && sette.serie.every(p => p.indice === 10), '7 giorni di storico: l\'indice si calcola (RMSSD costante = baseline → 10)')
    const buchi = M.serieIndividuale([G('2026-11-01', 50), G('2026-11-02', 50), G('2026-11-03', 50), G('2026-11-20', 50), G('2026-11-21', 50), G('2026-11-22', 50), G('2026-12-10', 50)])
    ok(buchi.ok && buchi.giorni_storico === 7, 'i giorni di storico sono i giorni CON dati (anche non consecutivi)')

    // Platea = media degli indici individuali, mai la formula applicata alla media RMSSD
    const sa = M.serieIndividuale([...Array.from({ length: 7 }, (_, k) => G(`2026-11-0${k + 1}`, 100)), G('2026-11-08', 40), G('2026-11-09', 40), G('2026-11-10', 40)])
    const sb = M.serieIndividuale([...Array.from({ length: 7 }, (_, k) => G(`2026-11-0${k + 1}`, 60)), G('2026-11-08', 60), G('2026-11-09', 60), G('2026-11-10', 200)])
    const pl = M.aggregaPlatea([sa.serie, sb.serie])
    const p10 = pl.find(x => x.giorno === '2026-11-10')!
    const ia = sa.serie.find(x => x.giorno === '2026-11-10')!, ib = sb.serie.find(x => x.giorno === '2026-11-10')!
    ok(p10.indice === Math.round(((ia.indice as number) + (ib.indice as number)) / 2) && p10.n_assistiti === 2, 'platea: media degli indici individuali (non indice della media RMSSD)')
    const mediaRmssd = (ia.rmssd_3gg + ib.rmssd_3gg) / 2, baseMedia = ((sa.baseline as number) + (sb.baseline as number)) / 2
    ok(p10.indice !== M.indiceStress(baseMedia, mediaRmssd), 'con la non-linearita\' (clamp) l\'indice di platea differisce da quello calcolato sulla media RMSSD: aggregazione sugli indici')
    const solo = M.aggregaPlatea([sa.serie, sb.serie.slice(0, 5)])
    ok(solo.find(x => x.giorno === '2026-11-10')!.n_assistiti === 1 && solo.find(x => x.giorno === '2026-11-03')!.n_assistiti === 2, 'platea: ogni giorno media solo di chi ha un indice quel giorno (n_assistiti)')
    ok(M.aggregaPlatea([]).length === 0, 'platea senza assistiti idonei: serie vuota')

    // Riepilogo, picco, distribuzione
    const ser = [{ giorno: '2026-09-01', indice: 70, fascia: 'Alto', rmssd_3gg: 1 }, { giorno: '2026-10-20', indice: 50, fascia: 'Moderato', rmssd_3gg: 1 }, { giorno: '2026-11-05', indice: 20, fascia: 'Basso', rmssd_3gg: 1 }, { giorno: '2026-11-10', indice: 10, fascia: 'Basso', rmssd_3gg: 2 }]
    const r = M.riepilogoSerie(ser, '2026-11-12')
    ok(r.indice_attuale === 10 && r.fascia === 'Basso' && r.indice_medio_30gg === 27 && r.picco_90gg === 70 && r.data_picco === '2026-09-01', 'riepilogo: attuale = ultimo giorno con dati, media 30gg (20, 10 e 50 del 20 ottobre → 27), picco 90gg con data')
    const r2 = M.riepilogoSerie(ser, '2026-12-20')
    ok(r2.picco_90gg === 50 && r2.indice_medio_30gg === null && r2.indice_attuale === 10, 'picco 90gg guarda solo gli ultimi 90 giorni; senza dati negli ultimi 30 giorni la media e\' null')
    ok(M.riepilogoSerie([], '2026-11-12').indice_attuale === null, 'nessun dato: indice attuale null')
    const di = M.distribuzioneFasce([ser], '2026-11-12', 30)
    ok(di.Basso === 2 && di.Moderato === 1 && di.Alto === 0 && di.totale === 3, 'distribuzione per fascia sugli ultimi 30 giorni (il 2026-09-01, oltre 30 giorni, non conta)')
    const t = M.testiStress()
    ok(t.formula === 'Indice individuale = 10 + 1,4 × (baseline personale − RMSSD media mobile 3gg), limitato a 0–100 · platea = media degli indici individuali · Basso 0–39 · Moderato 40–59 · Alto 60–79 · Molto alto 80–100', 'footer del grafico: formula e fasce (testo atteso, generato dalle costanti)')
    ok(t.descrizione === 'Indicatore orientativo calcolato dall\'HRV: stima calibrata sul comportamento osservato dell\'app SiDLY (RMSSD medio 64 ms → indice 10, «Basso»). Baseline personale + media mobile 3 giorni. Non è la formula ufficiale SiDLY (non disponibile) e non serve per la diagnosi medica.', 'descrizione della sezione verbatim')
    ok(t.limiti === 'Sonno disturbato, malattie in corso, alcol e farmaci (es. beta-bloccanti) abbassano l\'RMSSD senza che si tratti di stress psicologico. Calibrazione da raffinare con confronti diretti con l\'app SiDLY.', 'nota sui limiti verbatim')
  }

  // ───────────────────────────────────────────────────────────────────
  section('Indice di stress 2: fixture golden (casi 1-5) attraverso D1 vero, endpoint logico analisiStress')
  {
    const fx = JSON.parse(readFileSync('tests/seo-report/fixtures/stress-golden.json', 'utf8'))
    const NOWS = Date.UTC(2026, 10, 12, 12, 0, 0) / 1000
    const carica = async (d: any, lista: { imei: string; righe: number[][] }[], aff = 3) => {
      for (const x of lista) await d.db.batch(T.istruzioniMisure(d.db, x.righe.map(([ts, v]) => ({ imei: x.imei, ts, fonte: 'stats' as const, rmssd: v, affid: aff }))))
    }
    // ── caso 1: Lavarini
    const d1 = await makeD1(); T.dimenticaTabelle(); await T.assicuraTabelle(d1.db)
    d1.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${fx.lavarini.imei}', 'ATTIVO', 'Mario', 'Lavarini')`)
    d1.raw.run(`CREATE TABLE dispositivi (id INTEGER PRIMARY KEY, imei TEXT, modello TEXT)`)
    d1.raw.run(`INSERT INTO dispositivi (imei, modello) VALUES ('${fx.lavarini.imei}', 'SiDLY Care Pro')`)
    await carica(d1, [fx.lavarini])
    // misure con affidabilita' 2 e senza RMSSD: devono essere ignorate
    await d1.db.batch(T.istruzioniMisure(d1.db, [{ imei: fx.lavarini.imei, ts: NOWS - 3600, fonte: 'stats', rmssd: 5, affid: 2 }, { imei: fx.lavarini.imei, ts: NOWS - 7200, fonte: 'stats', hr: 70, affid: 3 }]))
    const L = await analisiStress(d1.db, { imei: fx.lavarini.imei, nowSec: NOWS })
    ok(L.esito === 'ok' && L.vista === 'individuale' && L.indice_attuale === 9 && L.fascia === 'Basso', 'caso 1 Lavarini: indice attuale 9 «Basso»')
    ok(L.baseline === 150.7 && L.rmssd_3gg === 151.2, 'caso 1: baseline 150,7 e RMSSD 3gg 151,2')
    ok(L.picco_90gg === 63 && L.fascia_picco === 'Alto' && L.data_picco === '2026-11-05', 'caso 1: picco 63 «Alto» il 2026-11-05')
    ok(L.dispositivo === 'SiDLY Care Pro', 'vista individuale: dispositivo = modello reale letto da D1 (non fisso)')
    ok(L.serie.length > 0 && L.serie.length <= 90 && L.serie.every((p: any) => typeof p.giorno === 'string' && 'rmssd_3gg' in p && 'n_assistiti' in p && p.n_assistiti === 1), 'serie: [{giorno, indice, fascia, rmssd_3gg, n_assistiti}], al massimo 90 giorni')
    ok(L.testi.formula.includes('1,4') && L.fasce.length === 4, 'la risposta porta testi e fasce dal modello (la UI non ha numeri propri)')
    d1.raw.run(`UPDATE dispositivi SET modello = 'VITAL CARE' WHERE imei = '${fx.lavarini.imei}'`)
    ok((await analisiStress(d1.db, { imei: fx.lavarini.imei, nowSec: NOWS })).dispositivo === 'VITAL CARE', 'cambiando il modello nel DB cambia il dispositivo mostrato (VITAL CARE / Care Pro, nessun hard-code)')
    d1.raw.run(`DELETE FROM dispositivi`)
    ok((await analisiStress(d1.db, { imei: '1', nowSec: NOWS })).dispositivo === null && (await analisiStress(d1.db, { imei: fx.lavarini.imei, nowSec: NOWS })).dispositivo === null, 'dispositivo non registrato: null (la UI lo dichiara, non inventa)')
    const per = await analisiStress(d1.db, { imei: '1', nowSec: NOWS })
    ok(per.indice_attuale === L.indice_attuale && per.vista === 'individuale', 'selezione per id assistito = selezione per IMEI')
    ok((await analisiStress(d1.db, { imei: '999', nowSec: NOWS })).stato === 404 && (await analisiStress(d1.db, { imei: '862246079999999', nowSec: NOWS })).stato === 404, 'assistito sconosciuto: 404')
    // finestra e baseline
    const w30 = await analisiStress(d1.db, { imei: fx.lavarini.imei, window: 30, nowSec: NOWS })
    ok(w30.serie.length <= 30 && w30.indice_attuale === 9 && w30.picco_90gg === 63, 'window=30 riduce la serie ma gli indicatori (attuale, picco 90gg) restano calcolati come da specifica')
    const rl = await analisiStress(d1.db, { imei: fx.lavarini.imei, baseline: 'rolling60', nowSec: NOWS })
    ok(rl.baseline_modo === 'rolling60' && rl.baseline !== null && rl.indice_attuale !== null, 'baseline rolling60 accettata e ricalcolata')
    // query D1 equivalente via window function
    const q = d1.q(SQL_STRESS_WINDOW, fx.lavarini.imei)
    const mod = M.serieIndividuale(fx.lavarini.righe.map((r: number[]) => ({ giorno: dayN(Math.floor(r[0] / 86400)), somma: r[1], n: 1 })))
    ok(q.length === mod.serie.length && q.every((x: any, i: number) => x.giorno === mod.serie[i].giorno && near(Number(x.rmssd_3gg), mod.serie[i].rmssd_3gg, 1e-6)), 'query D1 con AVG() OVER (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) = media mobile del modello, giorno per giorno')
    ok(/ROWS BETWEEN 2 PRECEDING AND CURRENT ROW/.test(SQL_STRESS_WINDOW) && /PARTITION BY imei ORDER BY giorno/.test(SQL_STRESS_WINDOW), 'la query documentata usa PARTITION BY imei ORDER BY giorno ROWS BETWEEN 2 PRECEDING AND CURRENT ROW')

    // ── casi 2, 3, 4: platea
    const d2 = await makeD1(); T.dimenticaTabelle(); await T.assicuraTabelle(d2.db)
    fx.platea.forEach((x: any, j: number) => d2.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (${j + 1}, '${x.imei}', 'ATTIVO', 'A${j + 1}', 'Platea')`))
    // caso 4: assistito con 5 giorni di storico HRV (escluso), uno CESSATO con dati (non conta), uno senza dati
    const poco = { imei: '862246070001111', righe: Array.from({ length: 5 }, (_, k) => [Math.floor(NOWS / 86400 - k) * 86400 + 21600, 20]) }
    const cess = { imei: '862246070002222', righe: fx.platea[0].righe }
    d2.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (20, '${poco.imei}', 'ATTIVO', 'Poco', 'Storico'), (21, '${cess.imei}', 'CESSATO', 'Ex', 'Cessato'), (22, '862246070003333', 'ATTIVO', 'Senza', 'Dati')`)
    await carica(d2, [...fx.platea, poco, cess])
    const P = await analisiStress(d2.db, { imei: 'platea', nowSec: NOWS })
    ok(P.esito === 'ok' && P.vista === 'platea' && P.dispositivo === null, 'platea: nessun modello di dispositivo (null)')
    ok(P.assistiti_inclusi === 10 && P.assistiti_esclusi === 2, 'caso 2: platea di 10 assistiti con almeno 7 giorni di HRV (esclusi: storico insufficiente e assistito senza dati; il CESSATO non entra)')
    ok(P.indice_attuale === 23 && P.fascia === 'Basso', 'caso 2: indice attuale platea 23 «Basso»')
    ok(P.indice_medio_30gg === 14, 'caso 2: indice medio 30gg 14')
    ok(P.picco_90gg === 44 && P.fascia_picco === 'Moderato' && P.data_picco === '2026-09-03', 'caso 2: picco 90gg 44 «Moderato» il 2026-09-03')
    const ultimo = P.serie[P.serie.length - 1]
    ok(ultimo.giorno === '2026-11-12' && ultimo.n_assistiti === 6, 'caso 2: 6 assistiti con dati recenti sull\'ultimo giorno')
    const dd = P.distribuzione_30gg
    ok(dd.Basso === 168 && dd.Moderato === 13 && dd.Alto === 2 && dd['Molto alto'] === 1, 'caso 3: distribuzione individuale ultime 30 gg 168 Basso / 13 Moderato / 2 Alto / 1 Molto alto')
    ok(P.esclusi.some((e: any) => e.assistito_id === 20 && e.giorni_storico === 5 && e.motivo === 'storico HRV insufficiente'), 'caso 4: l\'assistito con storico < 7 giorni e\' escluso dall\'aggregato con il motivo')
    const P0 = await analisiStress(d2.db, { imei: 'platea', nowSec: NOWS })
    ok(JSON.stringify(P0.serie) === JSON.stringify(P.serie), 'determinismo: stessa risposta a parita\' di dati')

    // ── caso 4 individuale
    const I4 = await analisiStress(d2.db, { imei: poco.imei, nowSec: NOWS })
    ok(I4.esito === 'ok' && I4.indice_attuale === null && I4.fascia === null && I4.motivo === 'storico HRV insufficiente' && I4.serie.length === 0 && I4.picco_90gg === null, 'caso 4: storico < 7 giorni → indice_attuale null + motivo, nessuna serie')

    // ── caso 5: invarianti su tutte le righe (platea e individuali)
    const tutte: any[] = [...P.serie]
    for (const x of fx.platea) tutte.push(...(await analisiStress(d2.db, { imei: x.imei, window: 3650, nowSec: NOWS })).serie)
    const fasceOk = tutte.every((p: any) => Number.isInteger(p.indice) && p.indice >= 0 && p.indice <= 100 && p.fascia === M.fasciaStress(p.indice))
    ok(tutte.length > 500 && fasceOk, `caso 5: indice intero in [0,100] e fascia coerente su tutte le ${tutte.length} righe`)
    const giorniDati = new Set<string>(); for (const x of fx.platea) for (const r of x.righe) giorniDati.add(dayN(Math.floor(r[0] / 86400)))
    ok(P.serie.every((p: any) => giorniDati.has(p.giorno)) && new Set(P.serie.map((p: any) => p.giorno)).size === P.serie.length, 'caso 5: nessuna interpolazione, la serie contiene solo giorni con almeno un dato HRV, senza duplicati')
    const ass3 = fx.platea[2], giorniA3 = new Set<string>(ass3.righe.map((r: number[]) => dayN(Math.floor(r[0] / 86400))))
    const s3 = (await analisiStress(d2.db, { imei: ass3.imei, window: 3650, nowSec: NOWS })).serie
    ok(s3.every((p: any) => giorniA3.has(p.giorno)) && s3.length === giorniA3.size && s3.some((p: any, i: number) => i > 0 && M.giornoANumero(p.giorno) - M.giornoANumero(s3[i - 1].giorno) > 1), 'caso 5: i giorni mancanti di un assistito restano buchi nella serie (non riempiti)')
    // affidabilita' 3: con misure a 2 l'indice non si calcola
    const d3 = await makeD1(); T.dimenticaTabelle(); await T.assicuraTabelle(d3.db)
    d3.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${fx.lavarini.imei}', 'ATTIVO', 'Mario', 'Lavarini')`)
    await carica(d3, [fx.lavarini], 2)
    const A2 = await analisiStress(d3.db, { imei: fx.lavarini.imei, nowSec: NOWS })
    ok(A2.indice_attuale === null && A2.motivo === 'storico HRV insufficiente', 'solo le misure con affidabilita\' 3 contano: con affid=2 non c\'e\' storico utile')
    const dv = await makeD1(); T.dimenticaTabelle()
    dv.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${fx.lavarini.imei}', 'ATTIVO', 'Mario', 'Lavarini')`)
    const Ev = await analisiStress(dv.db, { imei: 'platea', nowSec: NOWS })
    ok(Ev.esito === 'ok' && Ev.indice_attuale === null && Ev.assistiti_inclusi === 0 && !dv.hasTable('sidly_misure'), 'senza tabelle (storico mai caricato): risposta vuota con motivo, nessuna tabella creata dalla lettura')
    // braccialetto precedente: le misure dei vecchi IMEI si sommano all'assistito
    const d4 = await makeD1(); T.dimenticaTabelle(); await T.assicuraTabelle(d4.db)
    const meta = fx.lavarini.righe.length >> 1
    const vecchio = { imei: '862246070009999', righe: fx.lavarini.righe.slice(0, meta) }, nuovo = { imei: fx.lavarini.imei, righe: fx.lavarini.righe.slice(meta) }
    d4.raw.run(`INSERT INTO assistiti (id, imei, status, nome_assistito, cognome_assistito) VALUES (1, '${nuovo.imei}', 'ATTIVO', 'Mario', 'Lavarini')`)
    d4.raw.run(`INSERT INTO sidly_imei (imei, assistito_id, origine, creato_il) VALUES ('${vecchio.imei}', 1, 'test', '2026-11-01')`)
    await carica(d4, [vecchio, nuovo])
    const Pr = await analisiStress(d4.db, { imei: '1', nowSec: NOWS })
    ok(Pr.baseline === 150.7 && Pr.indice_attuale === 9, 'braccialetti precedenti: le misure dei vecchi IMEI contano per la baseline e la media mobile dell\'assistito')
  }

  // ───────────────────────────────────────────────────────────────────
  section('Indice di stress 3: sorgente (rotta, modulo unico, sezione Dashboard)')
  {
    const idx = readFileSync('src/index.tsx', 'utf8'), dash = readFileSync('src/modules/dashboard-templates-new.ts', 'utf8')
    const mod = readFileSync('src/modules/stressModel.js', 'utf8'), an = readFileSync('src/modules/stress-analisi.ts', 'utf8')
    const i0 = idx.indexOf("app.get('/api/analisi/stress'"), rotta = idx.slice(i0, i0 + 1800)
    ok(i0 > 0 && /checkSessionOrKey\(/.test(rotta) && /win < 1 \|\| win > 3650/.test(rotta) && /base !== 'full' && base !== 'rolling60'/.test(rotta) && /\.status|r\.stato/.test(rotta), 'rotta GET /api/analisi/stress: autenticata, valida window (1-3650) e baseline (full|rolling60), 404 per assistito sconosciuto')
    ok(!/\.(run|exec)\(|INSERT|UPDATE |DELETE |CREATE TABLE|ALTER/i.test(an.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '')) && !/\.run\(/.test(rotta), 'analisi stress: sola lettura (nessuna scrittura su D1)')
    const testa = mod.slice(0, mod.indexOf('const num1'))
    ok(/PENDENZA = 1\.4/.test(testa) && /ANCORAGGIO = 10/.test(testa) && /SOGLIE_FASCE = \[40, 60, 80\]/.test(testa), 'stressModel.js: costanti in cima al file (PENDENZA, ANCORAGGIO, SOGLIE_FASCE)')
    ok(!/1\.4|\b90\s*\/\s*64/.test(mod.slice(mod.indexOf('const num1')).replace(/\/\/.*/g, '')) && !/1\.4|SOGLIE|ANCORAGGIO/.test(an.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '').replace(/M\.\w+/g, '')), 'nessun coefficiente duplicato fuori dalle costanti del modulo unico (sostituibili senza toccare altro codice)')
    const i1 = dash.indexOf('window.sidlyStress = async function'), blocco = dash.slice(dash.indexOf('function telStressBarre'), i1 + 4500)
    ok(/Analisi &middot; Indice di stress \(HRV\)/.test(dash) && /id="telStressSel"/.test(dash) && /id="telStressBody"/.test(dash) && /window\.sidlyStress\(selStress\)/.test(dash), 'Dashboard Telemetria: sezione «Analisi» con selettore Media platea / assistito e baseline')
    ok(/'Indice attuale'/.test(blocco) && /'RMSSD 3gg'/.test(blocco) && /'Indice medio 30gg'/.test(blocco) && /'Picco 90gg'/.test(blocco), 'Dashboard: 4 card (indice attuale, RMSSD 3gg, indice medio 30gg, picco 90gg con data)')
    ok(/Telemetria &middot; Media platea/.test(blocco) && /r\.dispositivo \|\| 'dispositivo non registrato'/.test(blocco) && !/VITAL CARE|Care Pro/.test(blocco), 'Dashboard: badge «Telemetria · Media platea» in platea, dispositivo reale in individuale; nessun modello scritto nella UI')
    ok(/t\.descrizione/.test(blocco) && /t\.formula/.test(blocco) && /t\.limiti/.test(blocco) && /r\.fasce/.test(blocco) && !/#7db8d8|#f0b429|#e0705a|#b3453a/.test(dash.slice(dash.indexOf('function telStressBarre'), i1 + 4500)), 'Dashboard: testi e colori vengono dal modello (nessun valore duplicato nella UI)')
    ok(/Y 0|viewBox/.test(blocco) && /\[0, 25, 50, 75, 100\]/.test(blocco) && /mesi\[mm\]/.test(blocco), 'grafico: asse Y 0–100 e etichette dei mesi')
    ok(/Numero|telFmt\(r\.rmssd_3gg, 1\)/.test(blocco) && /telFmt\(r\.baseline, 1\)/.test(blocco), 'RMSSD e baseline con virgola decimale italiana (telFmt)')
  }
}
