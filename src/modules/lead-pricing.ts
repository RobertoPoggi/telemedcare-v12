/**
 * Prezzo di un lead da servizio + piano (unico punto di calcolo).
 *
 * Accetta le forme che arrivano dai vari canali: "eCura PRO", "eCura Family",
 * "eCura Family PRO", "eCura PREMIUM", "eCura", "FAMILY", "pro", ... e piano
 * "BASE" / "AVANZATO" (anche "Piano Avanzato"). Valori mancanti o non riconosciuti
 * usano gli stessi default del resto del CRM (servizio PRO, piano BASE).
 * Prezzi IVA esclusa, come prezzo_anno / prezzo_rinnovo nel DB.
 */
import { calculatePrice, type ServizioEcura, type PianoEcura } from './pricing-calculator'

export function normalizeServizioEcura(raw: unknown): ServizioEcura {
  const v = String(raw ?? '').toUpperCase()
  if (v.includes('FAMILY')) return 'FAMILY'   // "Family PRO" resta FAMILY (come fix-prices)
  if (v.includes('PREMIUM')) return 'PREMIUM' // prima di PRO
  return 'PRO'
}

export function normalizePianoEcura(raw: unknown): PianoEcura {
  const v = String(raw ?? '').toUpperCase()
  return (v.includes('AVANZAT') || v.includes('ADVANCED')) ? 'AVANZATO' : 'BASE'
}

export interface LeadPricing {
  servizio: ServizioEcura
  piano: PianoEcura
  prezzoAnno: number     // setup 1° anno, IVA esclusa
  prezzoRinnovo: number  // rinnovo annuale, IVA esclusa
}

export function computeLeadPricing(servizio: unknown, piano: unknown): LeadPricing {
  const s = normalizeServizioEcura(servizio)
  const p = normalizePianoEcura(piano)
  const price = calculatePrice(s, p)
  return { servizio: s, piano: p, prezzoAnno: price.setupBase, prezzoRinnovo: price.rinnovoBase }
}
