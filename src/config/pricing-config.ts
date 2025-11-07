/**
 * TeleMedCare V11.0 - Configurazione Prezzi e Commissioni
 * 
 * File centralizzato per evitare hardcoding di prezzi e logiche di business
 */

// 📊 ALIQUOTE IVA
export const IVA_RATES = {
  STANDARD: 0.22,        // 22% - Aliquota standard per servizi sanitari
  REDUCED: 0.04,         // 4% - Aliquota ridotta (se applicabile)
  EXEMPT: 0.00           // 0% - Esente IVA
} as const

// 💰 PREZZI SERVIZI (in Euro, IVA esclusa)
export const SERVICE_PRICES = {
  BASE: {
    FIRST_YEAR: 480,     // Prezzo primo anno BASE
    RENEWAL: 240         // Prezzo rinnovo annuale BASE
  },
  ADVANCED: {
    FIRST_YEAR: 840,     // Prezzo primo anno ADVANCED
    RENEWAL: 600         // Prezzo rinnovo annuale ADVANCED
  }
} as const

// 🏢 CANALI DI VENDITA
export enum SalesChannel {
  DIRECT = 'DIRECT',                    // Vendita diretta
  IRBEMA = 'IRBEMA',                   // Partner IRBEMA
  LUXOTTICA = 'LUXOTTICA',             // Partner Luxottica
  PIRELLI = 'PIRELLI',                 // Partner Pirelli
  FAS = 'FAS',                         // Partner FAS
  BLK_CONDOMINI = 'BLK_CONDOMINI',     // BLK - Condomini
  EUDAIMON = 'EUDAIMON',               // Welfare Provider
  DOUBLEYOU = 'DOUBLEYOU',             // Welfare Provider
  EDENRED = 'EDENRED',                 // Welfare Provider
  MONDADORI = 'MONDADORI',             // Convenzione aziendale
  CORPORATE = 'CORPORATE'              // Altre convenzioni aziendali
}

// 💸 COMMISSIONI PER CANALE (in percentuale)
export const CHANNEL_COMMISSIONS = {
  [SalesChannel.DIRECT]: 0,              // 0% - Vendita diretta
  [SalesChannel.IRBEMA]: 0,              // 0% - IRBEMA non prevede commissioni
  [SalesChannel.LUXOTTICA]: 0.05,        // 5% - Partner standard
  [SalesChannel.PIRELLI]: 0.05,          // 5% - Partner standard
  [SalesChannel.FAS]: 0.05,              // 5% - Partner standard
  [SalesChannel.BLK_CONDOMINI]: 0.05,    // 5% - BLK Condomini
  [SalesChannel.EUDAIMON]: 0.05,         // 5% - Welfare
  [SalesChannel.DOUBLEYOU]: 0.05,        // 5% - Welfare
  [SalesChannel.EDENRED]: 0.05,          // 5% - Welfare
  [SalesChannel.MONDADORI]: 0,           // 0% - Mondadori ha sconto invece di commissione
  [SalesChannel.CORPORATE]: 0            // 0% - Default per convenzioni
} as const

// 🎁 SCONTI PER CONVENZIONI (in percentuale)
export const CORPORATE_DISCOUNTS = {
  [SalesChannel.MONDADORI]: 0.10,        // 10% sconto Mondadori
  [SalesChannel.CORPORATE]: 0            // 0% default
} as const

// 📋 LOGICA FATTURAZIONE PER CANALE
export enum InvoicingLogic {
  TO_CUSTOMER = 'TO_CUSTOMER',           // Fattura intestata al cliente finale
  TO_PROVIDER = 'TO_PROVIDER',           // Fattura intestata al provider
  TO_REQUESTER = 'TO_REQUESTER',         // Fattura al richiedente (anche se diverso da assistito)
  TO_ASSISTED = 'TO_ASSISTED'            // Fattura all'assistito
}

export const CHANNEL_INVOICING_LOGIC = {
  [SalesChannel.DIRECT]: InvoicingLogic.TO_CUSTOMER,
  [SalesChannel.IRBEMA]: InvoicingLogic.TO_REQUESTER,           // IRBEMA: intestato a richiedente/assistito
  [SalesChannel.LUXOTTICA]: InvoicingLogic.TO_CUSTOMER,
  [SalesChannel.PIRELLI]: InvoicingLogic.TO_CUSTOMER,
  [SalesChannel.FAS]: InvoicingLogic.TO_CUSTOMER,
  [SalesChannel.BLK_CONDOMINI]: InvoicingLogic.TO_REQUESTER,    // BLK: intestato a richiedente
  [SalesChannel.EUDAIMON]: InvoicingLogic.TO_PROVIDER,          // Welfare: fattura al provider
  [SalesChannel.DOUBLEYOU]: InvoicingLogic.TO_PROVIDER,         // Welfare: fattura al provider
  [SalesChannel.EDENRED]: InvoicingLogic.TO_PROVIDER,           // Welfare: fattura al provider
  [SalesChannel.MONDADORI]: InvoicingLogic.TO_REQUESTER,        // Convenzione: intestato a richiedente
  [SalesChannel.CORPORATE]: InvoicingLogic.TO_REQUESTER         // Convenzione: intestato a richiedente
} as const

/**
 * Calcola il prezzo IVA inclusa
 */
export function calculatePriceWithVAT(basePrice: number, vatRate: number = IVA_RATES.STANDARD): number {
  return Math.round(basePrice * (1 + vatRate) * 100) / 100
}

/**
 * Calcola la commissione per un canale
 */
export function calculateCommission(amount: number, channel: SalesChannel): number {
  const commissionRate = CHANNEL_COMMISSIONS[channel] || 0
  return Math.round(amount * commissionRate * 100) / 100
}

/**
 * Calcola lo sconto per una convenzione aziendale
 */
export function calculateCorporateDiscount(amount: number, channel: SalesChannel): number {
  const discountRate = CORPORATE_DISCOUNTS[channel] || 0
  return Math.round(amount * discountRate * 100) / 100
}

/**
 * Ottiene il prezzo finale applicando sconti e commissioni
 */
export function getFinalPrice(
  serviceType: 'BASE' | 'ADVANCED',
  isRenewal: boolean,
  channel: SalesChannel = SalesChannel.DIRECT
): {
  basePrice: number
  discount: number
  commission: number
  priceBeforeVAT: number
  vat: number
  finalPrice: number
} {
  // Prezzo base
  const basePrice = isRenewal
    ? (serviceType === 'BASE' ? SERVICE_PRICES.BASE.RENEWAL : SERVICE_PRICES.ADVANCED.RENEWAL)
    : (serviceType === 'BASE' ? SERVICE_PRICES.BASE.FIRST_YEAR : SERVICE_PRICES.ADVANCED.FIRST_YEAR)

  // Calcola sconto
  const discount = calculateCorporateDiscount(basePrice, channel)
  const priceAfterDiscount = basePrice - discount

  // Calcola commissione (sulla base scontata)
  const commission = calculateCommission(priceAfterDiscount, channel)

  // Prezzo prima dell'IVA
  const priceBeforeVAT = priceAfterDiscount

  // Calcola IVA
  const vat = Math.round(priceBeforeVAT * IVA_RATES.STANDARD * 100) / 100

  // Prezzo finale IVA inclusa
  const finalPrice = priceBeforeVAT + vat

  return {
    basePrice,
    discount,
    commission,
    priceBeforeVAT,
    vat,
    finalPrice
  }
}

/**
 * Determina l'intestatario della fattura in base al canale
 */
export function getInvoiceRecipient(
  channel: SalesChannel,
  requesterData: { nome: string; cognome: string; cf?: string },
  assistedData?: { nome: string; cognome: string; cf?: string }
): {
  logic: InvoicingLogic
  recipientName: string
  recipientCF?: string
  isProvider: boolean
} {
  const logic = CHANNEL_INVOICING_LOGIC[channel]

  switch (logic) {
    case InvoicingLogic.TO_PROVIDER:
      // Welfare: fattura al provider
      return {
        logic,
        recipientName: getProviderName(channel),
        isProvider: true
      }

    case InvoicingLogic.TO_ASSISTED:
      // Fattura all'assistito
      if (assistedData) {
        return {
          logic,
          recipientName: `${assistedData.nome} ${assistedData.cognome}`,
          recipientCF: assistedData.cf,
          isProvider: false
        }
      }
      // Fallback a richiedente se assistito non disponibile
      return {
        logic: InvoicingLogic.TO_REQUESTER,
        recipientName: `${requesterData.nome} ${requesterData.cognome}`,
        recipientCF: requesterData.cf,
        isProvider: false
      }

    case InvoicingLogic.TO_REQUESTER:
    case InvoicingLogic.TO_CUSTOMER:
    default:
      // Fattura al richiedente
      return {
        logic,
        recipientName: `${requesterData.nome} ${requesterData.cognome}`,
        recipientCF: requesterData.cf,
        isProvider: false
      }
  }
}

/**
 * Ottiene il nome del provider per fatturazione welfare
 */
function getProviderName(channel: SalesChannel): string {
  const providerNames = {
    [SalesChannel.EUDAIMON]: 'Eudaimon S.p.A.',
    [SalesChannel.DOUBLEYOU]: 'Double You S.r.l.',
    [SalesChannel.EDENRED]: 'Edenred Italia S.r.l.'
  }
  return providerNames[channel] || 'Provider'
}
