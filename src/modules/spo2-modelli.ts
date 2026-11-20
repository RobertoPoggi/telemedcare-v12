// Elaborazione ad hoc (SOLA LETTURA): misurazioni di SpO2 mensili per modello di braccialetto (SiDLY CARE PRO vs SiDLY VITAL CARE).
// Fonte: sidly_misure (storico caricato via API SiDLY), righe con spo2 valorizzata. Mese = mese UTC della misura.
// Un assistito conta con TUTTI i suoi braccialetti (attuale + precedenti), il modello e' quello del braccialetto ATTUALE (tabella dispositivi).
import { assistitiAttivi, imeiPrecedenti, tuttiImei } from './sidly-telemetria'

export type GruppoModello = 'CARE PRO' | 'VITAL CARE' | 'non registrato'

/** Stessa regola dell'inventario del CRM: modello con «VITAL» = VITAL CARE, qualsiasi altro modello registrato = CARE PRO. */
export const gruppoModello = (modello: string | null | undefined): GruppoModello =>
  modello === null || modello === undefined || String(modello).trim() === '' ? 'non registrato' : /VITAL/i.test(String(modello)) ? 'VITAL CARE' : 'CARE PRO'

async function safeAll(db: any, sql: string, ...b: any[]): Promise<any[]> { try { const r = await db.prepare(sql).bind(...b).all(); return r?.results || [] } catch { return [] } }

const r2 = (x: number) => Math.round(x * 100) / 100
const meseDi = (ts: number) => new Date(ts * 1000).toISOString().slice(0, 7)
const segui = (m: string) => { const [y, mm] = m.split('-').map(Number); return mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, '0')}` }

interface Cella { misure: number; assistiti_con_misure: number; media_per_assistito: number | null }
const cella = (misure: number, assistiti: number): Cella => ({ misure, assistiti_con_misure: assistiti, media_per_assistito: assistiti > 0 ? r2(misure / assistiti) : null })

/** Colonne di `dispositivi` che possono contenere l'IMEI (a seconda della versione dello schema: imei e/o serial_number). */
export async function colonneImei(db: any): Promise<string[]> {
  const rows = await safeAll(db, `SELECT name FROM pragma_table_info('dispositivi') WHERE name IN ('imei','serial_number')`)
  return rows.map(r => String(r.name))
}

export async function spo2PerModello(db: any, o: { nowSec?: number } = {}): Promise<any> {
  const nowSec = o.nowSec ?? Math.floor(Date.now() / 1000)
  const meseCorrente = meseDi(nowSec)
  const attivi = await assistitiAttivi(db)
  const prec = await imeiPrecedenti(db)
  const imeiDi = attivi.map(a => ({ a, ims: tuttiImei(a.imei, prec, a.assistito_id) }))

  // 1) Modello del braccialetto ATTUALE di ciascun assistito
  const modelloPerImei = new Map<string, string>()
  const cols = await colonneImei(db)
  const attuali = attivi.map(a => a.imei)
  for (let i = 0; i < attuali.length; i += 40) {
    const part = attuali.slice(i, i + 40)
    for (const col of cols) {
      for (const r of await safeAll(db, `SELECT ${col} AS k, modello FROM dispositivi WHERE ${col} IN (${part.map(() => '?').join(',')})`, ...part)) {
        if (r.k !== null && r.k !== undefined && !modelloPerImei.has(String(r.k))) modelloPerImei.set(String(r.k), String(r.modello ?? ''))
      }
    }
  }
  const gruppoDi = new Map<number, GruppoModello>()
  for (const { a } of imeiDi) gruppoDi.set(a.assistito_id, gruppoModello(modelloPerImei.get(a.imei)))

  // 2) Misure SpO2 per IMEI e mese (a blocchi: limite di parametri di D1)
  const tutti = [...new Set(imeiDi.flatMap(x => x.ims))]
  const perImei = new Map<string, Map<string, number>>()
  let primoTs: number | null = null
  for (let i = 0; i < tutti.length; i += 40) {
    const part = tutti.slice(i, i + 40)
    for (const r of await safeAll(db, `SELECT imei, strftime('%Y-%m', ts, 'unixepoch') AS mese, COUNT(spo2) AS n, MIN(ts) AS primo FROM sidly_misure WHERE spo2 IS NOT NULL AND ts <= ? AND imei IN (${part.map(() => '?').join(',')}) GROUP BY imei, mese`, nowSec, ...part)) {
      const m = perImei.get(String(r.imei)) || new Map<string, number>()
      m.set(String(r.mese), Number(r.n)); perImei.set(String(r.imei), m)
      if (primoTs === null || Number(r.primo) < primoTs) primoTs = Number(r.primo)
    }
  }

  // 3) Unione per assistito (tutti i suoi IMEI) → gruppo × mese
  const perGruppoMese = new Map<string, Map<string, { misure: number; assistiti: number }>>()
  const totAssistiti: Record<string, number> = { 'CARE PRO': 0, 'VITAL CARE': 0, 'non registrato': 0 }
  const conSpo2: Record<string, number> = { 'CARE PRO': 0, 'VITAL CARE': 0, 'non registrato': 0 }
  for (const { a, ims } of imeiDi) {
    const g = gruppoDi.get(a.assistito_id) as GruppoModello
    totAssistiti[g]++
    const mesi = new Map<string, number>()
    for (const im of ims) for (const [m, n] of perImei.get(im) || []) mesi.set(m, (mesi.get(m) || 0) + n)
    if (mesi.size) conSpo2[g]++
    const gm = perGruppoMese.get(g) || new Map(); perGruppoMese.set(g, gm)
    for (const [m, n] of mesi) { const c = gm.get(m) || { misure: 0, assistiti: 0 }; c.misure += n; c.assistiti++; gm.set(m, c) }
  }

  // 4) Serie mensile continua (mesi senza misure = 0) e totali sui mesi COMPLETI
  const mesiPresenti = [...perGruppoMese.values()].flatMap(gm => [...gm.keys()]).sort()
  const mesi: any[] = []
  const primoMeseParziale = primoTs !== null && new Date(primoTs * 1000).getUTCDate() > 1 ? meseDi(primoTs) : null
  if (mesiPresenti.length) for (let m = mesiPresenti[0]; m <= mesiPresenti[mesiPresenti.length - 1]; m = segui(m)) {
    const g = (nome: GruppoModello) => { const c = perGruppoMese.get(nome)?.get(m); return cella(c?.misure ?? 0, c?.assistiti ?? 0) }
    const cp = g('CARE PRO'), vc = g('VITAL CARE')
    mesi.push({
      mese: m, parziale: m === meseCorrente || m === primoMeseParziale, care_pro: cp, vital_care: vc,
      rapporto_care_pro_su_vital: cp.media_per_assistito !== null && vc.media_per_assistito ? r2(cp.media_per_assistito / vc.media_per_assistito) : null,
    })
  }
  const completi = mesi.filter(x => !x.parziale)
  const totale = (nome: GruppoModello, k: 'care_pro' | 'vital_care') => {
    const misure = completi.reduce((t, x) => t + x[k].misure, 0)
    const am = completi.reduce((t, x) => t + x[k].assistiti_con_misure, 0)
    return { assistiti_attivi: totAssistiti[nome], assistiti_con_spo2: conSpo2[nome], mesi_completi: completi.length, misure_mesi_completi: misure, media_mensile_per_assistito: am > 0 ? r2(misure / am) : null }
  }
  const cpT = totale('CARE PRO', 'care_pro'), vcT = totale('VITAL CARE', 'vital_care')
  return {
    esito: 'ok', generato: new Date(nowSec * 1000).toISOString(), mese_corrente: meseCorrente, primo_mese_parziale: primoMeseParziale,
    definizione: 'Misurazione SpO2 = riga di sidly_misure con spo2 valorizzata (un istante). Mese UTC. Assistiti ATTIVI, con tutti i braccialetti (attuale + precedenti); modello = quello del braccialetto attuale. media_per_assistito = misure del mese / assistiti del gruppo con almeno una misura SpO2 in quel mese. Totali: solo mesi completi (esclusi mese corrente e primo mese se iniziato a meta\').',
    totali: { care_pro: cpT, vital_care: vcT, non_registrato: { assistiti_attivi: totAssistiti['non registrato'], assistiti_con_spo2: conSpo2['non registrato'] },
      rapporto_care_pro_su_vital: cpT.media_mensile_per_assistito !== null && vcT.media_mensile_per_assistito ? r2(cpT.media_mensile_per_assistito / vcT.media_mensile_per_assistito) : null },
    mesi,
  }
}

/** Tabella HTML minimale (solo numeri e testo fisso: nessun dato libero). */
export function spo2TabellaHtml(r: any): string {
  const f = (x: number | null) => (x === null ? '–' : String(x).replace('.', ','))
  const righe = (r.mesi as any[]).map(m => `<tr${m.parziale ? ' style="color:#888"' : ''}><td>${m.mese}${m.parziale ? ' (parziale)' : ''}</td><td>${m.care_pro.misure}</td><td>${m.care_pro.assistiti_con_misure}</td><td><b>${f(m.care_pro.media_per_assistito)}</b></td><td>${m.vital_care.misure}</td><td>${m.vital_care.assistiti_con_misure}</td><td><b>${f(m.vital_care.media_per_assistito)}</b></td><td>${f(m.rapporto_care_pro_su_vital)}</td></tr>`).join('')
  const t = r.totali
  return `<!doctype html><html lang="it"><meta charset="utf-8"><title>SpO2 mensili per modello</title><body style="font-family:system-ui,sans-serif;margin:24px"><h2>Misurazioni SpO2 mensili: Care Pro vs Vital Care</h2>
<p>Assistiti attivi: Care Pro <b>${t.care_pro.assistiti_attivi}</b> (con SpO2: ${t.care_pro.assistiti_con_spo2}) · Vital Care <b>${t.vital_care.assistiti_attivi}</b> (con SpO2: ${t.vital_care.assistiti_con_spo2}) · modello non registrato: ${t.non_registrato.assistiti_attivi}</p>
<p>Media mensile per assistito (mesi completi): Care Pro <b>${f(t.care_pro.media_mensile_per_assistito)}</b> · Vital Care <b>${f(t.vital_care.media_mensile_per_assistito)}</b> · rapporto Care Pro / Vital Care <b>${f(t.rapporto_care_pro_su_vital)}</b></p>
<table border="1" cellpadding="5" cellspacing="0" style="border-collapse:collapse"><tr><th rowspan="2">Mese</th><th colspan="3">Care Pro</th><th colspan="3">Vital Care</th><th rowspan="2">Rapporto medie</th></tr><tr><th>Misure</th><th>Assistiti</th><th>Media/assistito</th><th>Misure</th><th>Assistiti</th><th>Media/assistito</th></tr>${righe}</table>
<p style="font-size:12px;color:#666">Mese UTC · misure = righe con SpO2 · media/assistito = misure / assistiti con almeno una misura nel mese · mesi parziali esclusi dai totali.</p></body></html>`
}
