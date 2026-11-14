// Genera tests/seo-report/fixtures/stress-golden.json (fixture SINTETICHE costruite per riprodurre i valori di accettazione 1-3).
// Uso: node tests/seo-report/gen-stress-fixture.mjs   (non fa parte del build; il JSON e' committato e verificato dai test)
// Ogni valore RMSSD giornaliero e' ricavato risolvendo la media mobile a 3 giorni per ottenere l'indice voluto (poi verificato con stressModel.js).
import { writeFileSync } from 'node:fs'
import * as M from '../../src/modules/stressModel.js'

const OGGI = '2026-11-12'
const A = M.giornoANumero(OGGI)
const r4 = x => Math.round(x * 1e4) / 1e4
const ts = (n, h = 6) => n * 86400 + h * 3600

// ── Caso 1: Lavarini ────────────────────────────────────────────────────────
function lavarini() {
  const manca = new Set(['2026-10-01', '2026-10-02', '2026-10-20', '2026-10-21', '2026-10-22'])
  const giorni = []
  for (let n = A - 59; n <= A; n++) { const g = M.numeroAGiorno(n); if (!manca.has(g)) giorni.push(g) }
  const fissi = { '2026-11-03': 130, '2026-11-04': 110, '2026-11-05': 98.5, '2026-11-10': 150, '2026-11-11': 151.6, '2026-11-12': 152 }
  const rum = [-1.5, 0.5, 1, -0.5, 0, 1.5, -1, 0.5, -0.5, 0]
  const liberi = giorni.filter(g => !(g in fissi))
  const sumFissi = Object.values(fissi).reduce((t, x) => t + x, 0)
  const sumRum = liberi.reduce((t, g, i) => t + rum[i % rum.length], 0)
  const beta = (150.7 * giorni.length - sumFissi - sumRum) / liberi.length
  let i = 0
  const righe = giorni.map(g => [ts(M.giornoANumero(g)), r4(g in fissi ? fissi[g] : beta + rum[i++ % rum.length])])
  return { imei: '862246079768608', nome: 'Lavarini', righe }
}

// ── Casi 2-3: platea di 10 assistiti ────────────────────────────────────────
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 } }

function costruisciPlatea(L, seed) {
  const R = rng(seed)
  const BASE = [150, 120, 135, 160, 110, 140, 125, 130, 145, 155]
  const FINE = [A, A, A, A, A, A, A - 28, A - 28, A - 35, A - 35] // ultimo giorno con dati
  const INI = A - 89
  const ANTICHI = 60
  const out = []
  for (let j = 0; j < 10; j++) {
    const giorniFin = []
    for (let n = INI; n <= FINE[j]; n++) giorniFin.push(n)
    const manca = j === 2 ? new Set([A - 53, A - 52, A - 51, A - 50]) : j === 4 ? new Set([A - 60]) : new Set()
    const gg = giorniFin.filter(n => !manca.has(n))
    const t = new Map(gg.map(n => [n, Math.floor(R() * (L + 1))]))
    // bump del 3 settembre (A-70): picco di platea 44 = media di [70,65,60,55,50,45,40,30,15,10]
    const picco = [70, 65, 60, 55, 50, 45, 40, 30, 15, 10][j]
    ;[[-2, 0.3], [-1, 0.65], [0, 1], [1, 0.65], [2, 0.3]].forEach(([d, f]) => { if (t.has(A - 70 + d)) t.set(A - 70 + d, Math.round(picco * f)) })
    const poni = (inizio, valori) => valori.forEach((v, k) => t.set(inizio + k, v))
    if (j === 0) poni(A - 4, [8, 28, 48, 66, 85]) // 1 Moderato, 1 Alto, 1 Molto alto (ultimo giorno 85)
    if (j === 1) poni(A - 2, [22, 31, 40]) // 1 Moderato sull'ultimo giorno
    if (j === 2) { poni(A - 20, [30, 48, 65, 52, 30]); poni(A, [4]) } // 2 Moderato + 1 Alto
    if (j === 3) { poni(A - 26, [30, 44, 50, 44, 30]); poni(A, [3]) } // 3 Moderato
    if (j === 4) { poni(A - 12, [30, 44, 50, 44, 30]); poni(A, [3]) }
    if (j === 5) { poni(A - 17, [30, 44, 50, 44, 30]); poni(A, [3]) }
    // risolve i valori giornalieri con la media mobile a 3 date disponibili; la parte "antica" (>90 gg) a valore costante A0 fissa la baseline
    const b = BASE[j]
    const finestra = gg.map(n => t.get(n))
    const calcola = A0 => {
      const v = []; const tutti = [...Array(ANTICHI).fill(A0)]
      let p1 = A0, p2 = A0
      for (const idx of finestra) { const m = b - (idx - 10) / M.PENDENZA; const x = 3 * m - p1 - p2; v.push(x); p2 = p1; p1 = x }
      return { v, media: (ANTICHI * A0 + v.reduce((s, x) => s + x, 0)) / (ANTICHI + v.length) }
    }
    const f0 = calcola(b).media - b, f1 = calcola(b + 10).media - b
    const A0 = b - f0 * 10 / (f1 - f0)
    const { v } = calcola(A0)
    if (Math.min(A0, ...v) < 15 || Math.max(A0, ...v) > 400) return null
    const righe = []
    for (let k = 0; k < ANTICHI; k++) righe.push([ts(INI - ANTICHI + k), r4(A0)])
    gg.forEach((n, k) => righe.push([ts(n), r4(v[k])]))
    out.push({ imei: `86224607${String(9000 + j).padStart(7, '0')}`.slice(0, 15), nome: `Assistito ${j + 1}`, righe })
  }
  return out
}

function verificaPlatea(p) {
  const liste = p.map(x => M.serieIndividuale(x.righe.map(r => ({ giorno: M.numeroAGiorno(Math.floor(r[0] / 86400)), somma: r[1], n: 1 }))))
  if (!liste.every(s => s.ok)) return null
  const serie = M.aggregaPlatea(liste.map(s => s.serie))
  const rie = M.riepilogoSerie(serie, OGGI)
  const dist = M.distribuzioneFasce(liste.map(s => s.serie), OGGI)
  const ultimo = serie[serie.length - 1]
  return { rie, dist, nUltimo: ultimo.n_assistiti }
}

let trovata = null
for (let L = 10; L <= 38 && !trovata; L++) for (let seed = 1; seed <= 400 && !trovata; seed++) {
  const p = costruisciPlatea(L, seed); if (!p) continue
  const v = verificaPlatea(p); if (!v) continue
  const d = v.dist
  if (v.rie.indice_attuale === 23 && v.rie.fascia === 'Basso' && v.rie.indice_medio_30gg === 14 && v.rie.picco_90gg === 44 && v.rie.data_picco === '2026-09-03' && v.rie.fascia_picco === 'Moderato'
    && d.Basso === 168 && d.Moderato === 13 && d.Alto === 2 && d['Molto alto'] === 1 && v.nUltimo === 6) trovata = { p, L, seed, v }
}
if (!trovata) { console.error('nessuna combinazione trovata'); process.exit(1) }
console.log('platea OK  L=' + trovata.L + ' seed=' + trovata.seed, JSON.stringify(trovata.v))

const lav = lavarini()
const sl = M.serieIndividuale(lav.righe.map(r => ({ giorno: M.numeroAGiorno(Math.floor(r[0] / 86400)), somma: r[1], n: 1 })))
const rl = M.riepilogoSerie(sl.serie, OGGI)
console.log('lavarini  baseline', sl.baseline.toFixed(3), JSON.stringify(rl))
if (Math.round(sl.baseline * 10) / 10 !== 150.7 || rl.indice_attuale !== 9 || Math.round(rl.rmssd_3gg * 10) / 10 !== 151.2 || rl.picco_90gg !== 63 || rl.data_picco !== '2026-11-05') { console.error('lavarini non conforme'); process.exit(1) }

writeFileSync(new URL('./fixtures/stress-golden.json', import.meta.url), JSON.stringify({ nota: 'Fixture SINTETICHE (non dati reali) costruite da gen-stress-fixture.mjs per riprodurre i valori di accettazione. righe = [ts, rmssd] con affid=3.', oggi: OGGI, lavarini: lav, platea: trovata.p }))
console.log('scritto fixtures/stress-golden.json')
