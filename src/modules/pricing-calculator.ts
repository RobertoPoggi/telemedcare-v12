/**
 * Pricing Calculator Module
 * TeleMedCare V12.0 - eCura Services
 * 
 * Calcola automaticamente i prezzi dei servizi eCura
 * basandosi su: Servizio (FAMILY/PRO/PREMIUM) + Piano (BASE/AVANZATO)
 * 
 * IMPORTANTE: Tutti i prezzi sono IVA ESCLUSA (22%)
 * Fonte: www.ecura.it
 * 
 * @module pricing-calculator
 */

// ============================================
// TYPES
// ============================================

export type ServizioEcura = 'FAMILY' | 'PRO' | 'PREMIUM'
export type PianoEcura = 'BASE' | 'AVANZATO'

export interface PriceBreakdown {
  // Prezzo Setup (1° anno)
  setupBase: number      // Prezzo IVA esclusa
  setupIva: number       // IVA 22%
  setupTotale: number    // Totale con IVA
  
  // Prezzo Rinnovo (2° anno+)
  rinnovoBase: number    // Prezzo IVA esclusa
  rinnovoIva: number     // IVA 22%
  rinnovoTotale: number  // Totale con IVA
  
  // Metadata
  servizio: ServizioEcura
  piano: PianoEcura
  detrazioneFiscale19: number  // 19% su setupTotale
}

// ============================================
// PRICE MATRIX (IVA ESCLUSA)
// ============================================

/**
 * Matrice Prezzi eCura (IVA ESCLUSA 22%)
 * Fonte: www.ecura.it
 */
const PRICE_MATRIX: Record<ServizioEcura, Record<PianoEcura, { setup: number; rinnovo: number }>> = {
  FAMILY: {
    BASE: {
      setup: 390,    // 1° anno IVA esclusa
      rinnovo: 200   // Rinnovo IVA esclusa
    },
    AVANZATO: {
      setup: 690,
      rinnovo: 500
    }
  },
  PRO: {
    BASE: {
      setup: 480,
      rinnovo: 240
    },
    AVANZATO: {
      setup: 840,
      rinnovo: 600
    }
  },
  PREMIUM: {
    BASE: {
      setup: 590,
      rinnovo: 300
    },
    AVANZATO: {
      setup: 990,
      rinnovo: 750
    }
  }
}

/**
 * IVA italiana su dispositivi medici e servizi
 */
const IVA_RATE = 0.22 // 22%

/**
 * Detrazione fiscale sanitaria
 */
const DETRAZIONE_RATE = 0.19 // 19%

// ============================================
// CALCULATOR FUNCTIONS
// ============================================

/**
 * Calcola il prezzo completo per un servizio+piano
 * 
 * @param servizio - FAMILY, PRO, PREMIUM
 * @param piano - BASE, AVANZATO
 * @returns PriceBreakdown con tutti i dettagli
 * @throws Error se servizio o piano non validi
 */
export function calculatePrice(
  servizio: string | ServizioEcura,
  piano: string | PianoEcura
): PriceBreakdown {
  // Normalizza input
  const servizioNorm = servizio.toUpperCase() as ServizioEcura
  const pianoNorm = piano.toUpperCase() as PianoEcura
  
  // Validazione
  if (!PRICE_MATRIX[servizioNorm]) {
    throw new Error(`Servizio non valido: ${servizio}. Valori ammessi: FAMILY, PRO, PREMIUM`)
  }
  
  if (!PRICE_MATRIX[servizioNorm][pianoNorm]) {
    throw new Error(`Piano non valido: ${piano}. Valori ammessi: BASE, AVANZATO`)
  }
  
  // Recupera prezzi base (IVA esclusa)
  const { setup, rinnovo } = PRICE_MATRIX[servizioNorm][pianoNorm]
  
  // Calcola IVA
  const setupIva = Math.round(setup * IVA_RATE * 100) / 100
  const rinnovoIva = Math.round(rinnovo * IVA_RATE * 100) / 100
  
  // Calcola totali con IVA
  const setupTotale = Math.round((setup + setupIva) * 100) / 100
  const rinnovoTotale = Math.round((rinnovo + rinnovoIva) * 100) / 100
  
  // Calcola detrazione fiscale 19% (su totale con IVA)
  const detrazioneFiscale19 = Math.round(setupTotale * DETRAZIONE_RATE * 100) / 100
  
  return {
    setupBase: setup,
    setupIva,
    setupTotale,
    rinnovoBase: rinnovo,
    rinnovoIva,
    rinnovoTotale,
    servizio: servizioNorm,
    piano: pianoNorm,
    detrazioneFiscale19
  }
}

/**
 * Ottiene tutti i prezzi disponibili (per UI dropdown)
 */
export function getAllPrices(): PriceBreakdown[] {
  const prices: PriceBreakdown[] = []
  
  const servizi: ServizioEcura[] = ['FAMILY', 'PRO', 'PREMIUM']
  const piani: PianoEcura[] = ['BASE', 'AVANZATO']
  
  for (const servizio of servizi) {
    for (const piano of piani) {
      prices.push(calculatePrice(servizio, piano))
    }
  }
  
  return prices
}

/**
 * Verifica se un prezzo è valido per un servizio+piano
 */
export function isValidPrice(
  servizio: string,
  piano: string,
  setupBase: number
): boolean {
  try {
    const calculated = calculatePrice(servizio, piano)
    return calculated.setupBase === setupBase
  } catch {
    return false
  }
}

/**
 * Formatta un prezzo per visualizzazione
 */
export function formatPrice(price: number): string {
  return `€${price.toFixed(2).replace('.', ',')}`
}

/**
 * Formatta un breakdown completo per visualizzazione
 */
export function formatPriceBreakdown(breakdown: PriceBreakdown): string {
  return `
📦 ${breakdown.servizio} - ${breakdown.piano}

💰 Setup (1° Anno):
   Base (IVA esclusa): ${formatPrice(breakdown.setupBase)}
   IVA 22%: ${formatPrice(breakdown.setupIva)}
   Totale: ${formatPrice(breakdown.setupTotale)}

🔄 Rinnovo (dal 2° anno):
   Base (IVA esclusa): ${formatPrice(breakdown.rinnovoBase)}
   IVA 22%: ${formatPrice(breakdown.rinnovoIva)}
   Totale: ${formatPrice(breakdown.rinnovoTotale)}

💊 Detrazione Fiscale 19%: ${formatPrice(breakdown.detrazioneFiscale19)}
  `.trim()
}

// ============================================
// EXPORT
// ============================================

export default {
  calculatePrice,
  getAllPrices,
  isValidPrice,
  formatPrice,
  formatPriceBreakdown
}
