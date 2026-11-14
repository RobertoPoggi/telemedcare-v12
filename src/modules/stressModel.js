// Indice di stress (0-100) calcolato dal CRM a partire dall'HRV (RMSSD) dello storico SiDLY.
// SiDLY non espone l'indice via API: questa e' una STIMA calibrata sul report dell'app (RMSSD medio 64 ms -> indice 10, "Basso").
// Modulo UNICO e puro (nessun accesso a DB o rete): per usare i coefficienti ufficiali SiDLY, se mai disponibili, basta cambiare le costanti qui sotto.
//
//   baseline(imei)  = media delle misure RMSSD con affidabilita' 3 (intero storico, oppure ultimi 60 giorni con baseline = 'rolling60')
//   rmssd_3gg(g)    = media dei valori RMSSD GIORNALIERI delle ultime <= 3 date che HANNO dati (nessuna interpolazione dei giorni mancanti)
//   indice(g)       = clamp(0, 100, round(ANCORAGGIO + PENDENZA * (baseline - rmssd_3gg)))
//   platea(g)       = media degli indici individuali del giorno (MAI la formula applicata alla media RMSSD: e' non lineare)

// ── Costanti (unico punto da modificare) ─────────────────────────────────────
export const PENDENZA = 1.4 // 90 / 64
export const ANCORAGGIO = 10
export const SOGLIE_FASCE = [40, 60, 80] // Basso < 40 <= Moderato < 60 <= Alto < 80 <= Molto alto
export const NOMI_FASCE = ['Basso', 'Moderato', 'Alto', 'Molto alto']
export const COLORI_BARRE = ['#7db8d8', '#f0b429', '#e0705a', '#b3453a'] // grafico
export const COLORI_CARD = ['#16a34a', '#d97706', '#ea580c', '#dc2626'] // card: verde / ambra / arancio / rosso
export const FINESTRA_GIORNI = 3 // media mobile sulle ultime N date disponibili
export const MIN_GIORNI_STORICO = 7 // giorni con HRV sotto i quali l'indice non si calcola
export const GIORNI_BASELINE_ROLLING = 60
export const AFFIDABILITA = 3 // unico livello di affidabilita' usato
export const GIORNI_MEDIA = 30
export const GIORNI_PICCO = 90
export const MOTIVO_STORICO_INSUFFICIENTE = 'storico HRV insufficiente'

const num1 = (x) => String(x).replace('.', ',')

/** Intervalli di indice di ogni fascia, ricavati dalle soglie: [[0,39],[40,59],[60,79],[80,100]]. */
export function intervalliFasce() {
  const lim = [0, ...SOGLIE_FASCE, 101]
  return NOMI_FASCE.map((nome, i) => ({ nome, da: lim[i], a: lim[i + 1] - 1, colore_barra: COLORI_BARRE[i], colore_card: COLORI_CARD[i] }))
}

/** Testi della sezione (la formula e le fasce seguono le costanti). */
export function testiStress() {
  const f = intervalliFasce()
  return {
    descrizione: 'Indicatore orientativo calcolato dall\'HRV: stima calibrata sul comportamento osservato dell\'app SiDLY (RMSSD medio 64 ms → indice 10, «Basso»). Baseline personale + media mobile 3 giorni. Non è la formula ufficiale SiDLY (non disponibile) e non serve per la diagnosi medica.',
    limiti: 'Sonno disturbato, malattie in corso, alcol e farmaci (es. beta-bloccanti) abbassano l\'RMSSD senza che si tratti di stress psicologico. Calibrazione da raffinare con confronti diretti con l\'app SiDLY.',
    formula: `Indice individuale = ${ANCORAGGIO} + ${num1(PENDENZA)} × (baseline personale − RMSSD media mobile ${FINESTRA_GIORNI}gg), limitato a 0–100 · platea = media degli indici individuali · ` + f.map(x => `${x.nome} ${x.da}–${x.a}`).join(' · '),
  }
}

// ── Funzioni pure ────────────────────────────────────────────────────────────
export function clamp(x, min, max) { return Math.min(max, Math.max(min, x)) }

/** Indice 0-100 (intero) da baseline e RMSSD a media mobile. null se un input non e' un numero. */
export function indiceStress(baseline, rmssd3gg) {
  if (!Number.isFinite(baseline) || !Number.isFinite(rmssd3gg)) return null
  return clamp(Math.round(ANCORAGGIO + PENDENZA * (baseline - rmssd3gg)), 0, 100) + 0 // +0: evita -0
}

/** Numero di fascia (0..3) di un indice. */
export function numeroFascia(indice) { return SOGLIE_FASCE.filter(s => indice >= s).length }
export function fasciaStress(indice) { return Number.isFinite(indice) ? NOMI_FASCE[numeroFascia(indice)] : null }

const GG = 86400000
/** 'YYYY-MM-DD' -> numero progressivo del giorno (UTC). */
export function giornoANumero(g) { const [y, m, d] = String(g).split('-').map(Number); return Math.floor(Date.UTC(y, m - 1, d) / GG) }
export function numeroAGiorno(n) { return new Date(n * GG).toISOString().slice(0, 10) }

/** Unisce righe {giorno, somma, n} dello stesso giorno (piu' braccialetti dello stesso assistito) e scarta quelle senza misure. Ordine cronologico. */
export function normalizzaGiorni(righe) {
  const m = new Map()
  for (const r of righe || []) {
    const n = Number(r.n), somma = Number(r.somma)
    if (!(n > 0) || !Number.isFinite(somma)) continue
    const x = m.get(r.giorno) || { giorno: r.giorno, somma: 0, n: 0 }
    x.somma += somma; x.n += n; m.set(r.giorno, x)
  }
  return [...m.values()].sort((a, b) => (a.giorno < b.giorno ? -1 : a.giorno > b.giorno ? 1 : 0))
}

/**
 * Media mobile ADATTIVA: per ogni giorno CON dati, media dei valori giornalieri delle ultime <= `finestra` date disponibili
 * (i giorni senza HRV sono esclusi dalla finestra, non contati e non interpolati).
 */
export function mediaMobileAdattiva(righe, finestra = FINESTRA_GIORNI) {
  const gg = normalizzaGiorni(righe).map(x => ({ giorno: x.giorno, v: x.somma / x.n }))
  return gg.map((x, k) => {
    const w = gg.slice(Math.max(0, k - finestra + 1), k + 1)
    return { giorno: x.giorno, rmssd_giorno: x.v, rmssd_3gg: w.reduce((t, y) => t + y.v, 0) / w.length, giorni_finestra: w.length }
  })
}

/** Baseline = media delle MISURE (non dei giorni). 'full' = intero storico; 'rolling60' = ultimi 60 giorni di calendario fino a `giornoRif` incluso. */
export function baselineStorico(righe, modo = 'full', giornoRif = null) {
  let gg = normalizzaGiorni(righe)
  if (modo === 'rolling60' && giornoRif) {
    const a = giornoANumero(giornoRif), da = a - (GIORNI_BASELINE_ROLLING - 1)
    gg = gg.filter(x => { const n = giornoANumero(x.giorno); return n >= da && n <= a })
  }
  const n = gg.reduce((t, x) => t + x.n, 0)
  return n ? gg.reduce((t, x) => t + x.somma, 0) / n : null
}

/**
 * Serie giornaliera dell'indice per UN assistito. `righe` = [{giorno, somma, n}] (somma e conteggio delle misure RMSSD affid=3 del giorno).
 * Storico con meno di MIN_GIORNI_STORICO giorni di HRV -> ok:false, nessun indice.
 */
export function serieIndividuale(righe, { baseline = 'full' } = {}) {
  const gg = normalizzaGiorni(righe)
  if (gg.length < MIN_GIORNI_STORICO) return { ok: false, motivo: MOTIVO_STORICO_INSUFFICIENTE, giorni_storico: gg.length, baseline: null, serie: [] }
  const fisso = baselineStorico(gg, 'full')
  const serie = mediaMobileAdattiva(gg).map(x => {
    const b = baseline === 'rolling60' ? baselineStorico(gg, 'rolling60', x.giorno) : fisso
    const indice = indiceStress(b, x.rmssd_3gg)
    return { giorno: x.giorno, indice, fascia: fasciaStress(indice), rmssd_3gg: x.rmssd_3gg, baseline: b }
  })
  return { ok: true, motivo: null, giorni_storico: gg.length, baseline: serie[serie.length - 1].baseline, serie }
}

/** Platea: per ogni giorno, MEDIA degli indici individuali (interi) di chi ha un indice quel giorno. rmssd_3gg e' solo informativo (media dei valori individuali). */
export function aggregaPlatea(listaSerie) {
  const per = new Map()
  for (const s of listaSerie || []) for (const p of s || []) { if (p.indice === null || p.indice === undefined) continue; const l = per.get(p.giorno) || []; l.push(p); per.set(p.giorno, l) }
  return [...per.keys()].sort().map(giorno => {
    const l = per.get(giorno)
    const indice = clamp(Math.round(l.reduce((t, p) => t + p.indice, 0) / l.length), 0, 100) + 0
    return { giorno, indice, fascia: fasciaStress(indice), rmssd_3gg: l.reduce((t, p) => t + p.rmssd_3gg, 0) / l.length, n_assistiti: l.length }
  })
}

const entro = (serie, oggi, giorni) => { const a = giornoANumero(oggi); return serie.filter(p => { const n = giornoANumero(p.giorno); return n <= a && n > a - giorni }) }

/** Indice attuale (ultimo giorno con dati <= oggi), media sugli ultimi 30 giorni, picco sugli ultimi 90 (a parita' vale la data piu' recente). */
export function riepilogoSerie(serie, oggi) {
  const tutti = entro(serie, oggi, 36500)
  const ultimo = tutti[tutti.length - 1] || null
  const m = entro(serie, oggi, GIORNI_MEDIA)
  const p = entro(serie, oggi, GIORNI_PICCO)
  let picco = null
  for (const x of p) if (!picco || x.indice >= picco.indice) picco = x
  return {
    indice_attuale: ultimo ? ultimo.indice : null, fascia: ultimo ? ultimo.fascia : null, giorno_attuale: ultimo ? ultimo.giorno : null, rmssd_3gg: ultimo ? ultimo.rmssd_3gg : null,
    indice_medio_30gg: m.length ? clamp(Math.round(m.reduce((t, x) => t + x.indice, 0) / m.length), 0, 100) + 0 : null,
    picco_90gg: picco ? picco.indice : null, fascia_picco: picco ? picco.fascia : null, data_picco: picco ? picco.giorno : null,
  }
}

/** Quanti indici INDIVIDUALI (assistito x giorno) cadono in ogni fascia negli ultimi `giorni` giorni. */
export function distribuzioneFasce(listaSerie, oggi, giorni = GIORNI_MEDIA) {
  const out = Object.fromEntries(NOMI_FASCE.map(n => [n, 0])); out.totale = 0
  for (const s of listaSerie || []) for (const p of entro(s || [], oggi, giorni)) { if (p.indice === null || p.indice === undefined) continue; out[fasciaStress(p.indice)]++; out.totale++ }
  return out
}
