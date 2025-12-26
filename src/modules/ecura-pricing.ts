/**
 * eCura - Pricing Matrix Configuration
 * Matrice prezzi completa per tutti i servizi e piani
 * 
 * SERVIZI:
 * - FAMILY: Senium (protezione base famiglia)
 * - PRO: SiDLY Care PRO (assistenza professionale)
 * - PREMIUM: SiDLY Vital Care (monitoraggio avanzato)
 * 
 * PIANI:
 * - BASE: Servizi standard
 * - AVANZATO: Servizi premium con centrale operativa H24
 */

export interface PricingDetails {
  servizio: 'FAMILY' | 'PRO' | 'PREMIUM'
  piano: 'BASE' | 'AVANZATO'
  dispositivo: string
  descrizioneDispositivo: string
  
  // Prezzi primo anno
  setupBase: number
  setupIva: number
  setupTotale: number
  
  // Prezzi rinnovo annuale
  rinnovoBase: number
  rinnovoIva: number
  rinnovoTotale: number
  
  // Detrazione fiscale
  detrazioneFiscale19: number
  
  // Servizi inclusi
  serviziInclusi: string[]
}

/**
 * MATRICE PREZZI COMPLETA eCura
 * Tutti i prezzi sono IVA 22% inclusa
 */
export const ECURA_PRICING: Record<string, Record<string, PricingDetails>> = {
  'FAMILY': {
    'BASE': {
      servizio: 'FAMILY',
      piano: 'BASE',
      dispositivo: 'Senium',
      descrizioneDispositivo: 'Dispositivo base per monitoraggio familiare',
      
      // Primo anno (da sito www.ecura.it)
      setupBase: 319.67,
      setupIva: 70.33,
      setupTotale: 390.00,
      
      // Rinnovo (da sito www.ecura.it)
      rinnovoBase: 163.93,
      rinnovoIva: 36.07,
      rinnovoTotale: 200.00,
      
      // Detrazione
      detrazioneFiscale19: 74.10, // 19% di 390.00
      
      serviziInclusi: [
        'Dispositivo medicale Senium',
        'Monitoraggio parametri vitali base',
        'Supporto tecnico (orario lavorativo)',
        'Report mensili',
        'Aggiornamenti software'
      ]
    },
    'AVANZATO': {
      servizio: 'FAMILY',
      piano: 'AVANZATO',
      dispositivo: 'Senium',
      descrizioneDispositivo: 'Dispositivo base con centrale operativa H24',
      
      // Primo anno (da sito www.ecura.it)
      setupBase: 565.57,
      setupIva: 124.43,
      setupTotale: 690.00,
      
      // Rinnovo (da sito www.ecura.it)
      rinnovoBase: 409.84,
      rinnovoIva: 90.16,
      rinnovoTotale: 500.00,
      
      // Detrazione
      detrazioneFiscale19: 131.10, // 19% di 690.00
      
      serviziInclusi: [
        'Dispositivo medicale Senium',
        'Centrale Operativa H24/7',
        'Monitoraggio parametri vitali avanzato',
        'Supporto professionale continuo',
        'Assistenza medica specializzata',
        'Report sanitari periodici',
        'Coordinamento emergenze'
      ]
    }
  },
  'PRO': {
    'BASE': {
      servizio: 'PRO',
      piano: 'BASE',
      dispositivo: 'SiDLY Care PRO',
      descrizioneDispositivo: 'Dispositivo professionale per assistenza avanzata',
      
      // Primo anno (da sito www.ecura.it)
      setupBase: 393.44,
      setupIva: 86.56,
      setupTotale: 480.00,
      
      // Rinnovo (da sito www.ecura.it)
      rinnovoBase: 196.72,
      rinnovoIva: 43.28,
      rinnovoTotale: 240.00,
      
      // Detrazione
      detrazioneFiscale19: 91.20, // 19% di 480.00
      
      serviziInclusi: [
        'Dispositivo medicale SiDLY Care PRO (Classe IIa)',
        'Rilevamento automatico cadute',
        'GPS e geolocalizzazione',
        'Monitoraggio parametri vitali',
        'Comunicazione bidirezionale',
        'Pulsante SOS',
        'Supporto tecnico standard'
      ]
    },
    'AVANZATO': {
      servizio: 'PRO',
      piano: 'AVANZATO',
      dispositivo: 'SiDLY Care PRO',
      descrizioneDispositivo: 'Dispositivo professionale con centrale operativa H24',
      
      // Primo anno (da sito www.ecura.it)
      setupBase: 688.52,
      setupIva: 151.48,
      setupTotale: 840.00,
      
      // Rinnovo (da sito www.ecura.it)
      rinnovoBase: 491.80,
      rinnovoIva: 108.20,
      rinnovoTotale: 600.00,
      
      // Detrazione
      detrazioneFiscale19: 159.60, // 19% di 840.00
      
      serviziInclusi: [
        'Dispositivo medicale SiDLY Care PRO (Classe IIa)',
        'Centrale Operativa H24/7',
        'Rilevamento cadute con algoritmi avanzati',
        'GPS e geolocalizzazione precisa',
        'Monitoraggio parametri vitali avanzato',
        'Comunicazione bidirezionale vocale',
        'Pulsante SOS geolocalizzato',
        'Promemoria farmaci',
        'Supporto familiare con notifiche',
        'Assistenza professionale continua',
        'Intervento immediato emergenze',
        'Consulenze mediche specializzate'
      ]
    }
  },
  'PREMIUM': {
    'BASE': {
      servizio: 'PREMIUM',
      piano: 'BASE',
      dispositivo: 'SiDLY Vital Care',
      descrizioneDispositivo: 'Dispositivo premium per monitoraggio completo',
      
      // Primo anno (da sito www.ecura.it)
      setupBase: 483.61,
      setupIva: 106.39,
      setupTotale: 590.00,
      
      // Rinnovo (da sito www.ecura.it)
      rinnovoBase: 245.90,
      rinnovoIva: 54.10,
      rinnovoTotale: 300.00,
      
      // Detrazione
      detrazioneFiscale19: 112.10, // 19% di 590.00
      
      serviziInclusi: [
        'Dispositivo medicale SiDLY Vital Care (Classe IIa)',
        'Monitoraggio completo parametri vitali',
        'Rilevamento cadute avanzato',
        'GPS e tracking',
        'Comunicazione vocale HD',
        'Dashboard famiglia avanzata',
        'Supporto tecnico standard'
      ]
    },
    'AVANZATO': {
      servizio: 'PREMIUM',
      piano: 'AVANZATO',
      dispositivo: 'SiDLY Vital Care',
      descrizioneDispositivo: 'Dispositivo premium con centrale operativa H24',
      
      // Primo anno (da sito www.ecura.it)
      setupBase: 811.48,
      setupIva: 178.52,
      setupTotale: 990.00,
      
      // Rinnovo (da sito www.ecura.it)
      rinnovoBase: 614.75,
      rinnovoIva: 135.25,
      rinnovoTotale: 750.00,
      
      // Detrazione
      detrazioneFiscale19: 188.10, // 19% di 990.00
      
      serviziInclusi: [
        'Dispositivo medicale SiDLY Vital Care (Classe IIa)',
        'Centrale Operativa H24/7',
        'Monitoraggio completo parametri vitali',
        'Rilevamento cadute intelligente',
        'GPS e geolocalizzazione avanzata',
        'Comunicazione vocale HD bidirezionale',
        'Pulsante SOS prioritario',
        'Dashboard famiglia premium',
        'Promemoria farmaci intelligenti',
        'Assistenza medica specializzata H24',
        'Intervento emergenze immediato',
        'Report sanitari dettagliati',
        'Consulenze mediche illimitate',
        'Supporto psicologico famiglia'
      ]
    }
  }
}

/**
 * Ottiene i dettagli di pricing per una combinazione servizio/piano
 */
export function getPricing(servizio: 'FAMILY' | 'PRO' | 'PREMIUM', piano: 'BASE' | 'AVANZATO'): PricingDetails | null {
  const serviceType = ECURA_PRICING[servizio]
  if (!serviceType) return null
  
  return serviceType[piano] || null
}

/**
 * Calcola il prezzo totale primo anno
 */
export function calculatePrimoAnno(servizio: 'FAMILY' | 'PRO' | 'PREMIUM', piano: 'BASE' | 'AVANZATO'): number {
  const pricing = getPricing(servizio, piano)
  return pricing ? pricing.setupTotale : 0
}

/**
 * Calcola il prezzo rinnovo annuale
 */
export function calculateRinnovo(servizio: 'FAMILY' | 'PRO' | 'PREMIUM', piano: 'BASE' | 'AVANZATO'): number {
  const pricing = getPricing(servizio, piano)
  return pricing ? pricing.rinnovoTotale : 0
}

/**
 * Ottiene il nome del dispositivo per il servizio
 */
export function getDispositivoForService(servizio: 'FAMILY' | 'PRO' | 'PREMIUM'): string {
  const pricing = getPricing(servizio, 'BASE')
  return pricing ? pricing.dispositivo : 'Dispositivo eCura'
}

/**
 * Formatta il nome completo del servizio
 * Es: "eCura FAMILY Base", "eCura PRO Avanzato", "eCura PREMIUM Avanzato"
 */
export function formatServiceName(servizio: 'FAMILY' | 'PRO' | 'PREMIUM', piano: 'BASE' | 'AVANZATO'): string {
  const pianoLabel = piano === 'BASE' ? 'Base' : 'Avanzato'
  return `eCura ${servizio} ${pianoLabel}`
}
