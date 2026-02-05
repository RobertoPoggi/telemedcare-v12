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
 * ⚠️ IMPORTANTE: Prezzi da www.ecura.it sono IVA ESCLUSA (22%)
 * setupBase = prezzo sul sito (IVA esclusa)
 * setupIva = setupBase * 0.22
 * setupTotale = setupBase * 1.22
 */
export const ECURA_PRICING: Record<string, Record<string, PricingDetails>> = {
  'FAMILY': {
    'BASE': {
      servizio: 'FAMILY',
      piano: 'BASE',
      dispositivo: 'Senium',
      descrizioneDispositivo: 'Dispositivo base per monitoraggio familiare',
      
      // Primo anno (da sito www.ecura.it - IVA ESCLUSA)
      setupBase: 390.00,        // Prezzo base sito (IVA esclusa)
      setupIva: 85.80,          // 390 * 0.22
      setupTotale: 475.80,      // 390 * 1.22
      
      // Rinnovo (da sito www.ecura.it - IVA ESCLUSA)
      rinnovoBase: 200.00,      // Prezzo rinnovo sito (IVA esclusa)
      rinnovoIva: 44.00,        // 200 * 0.22
      rinnovoTotale: 244.00,    // 200 * 1.22
      
      // Detrazione
      detrazioneFiscale19: 90.40, // 19% di 475.80
      
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
      
      // Primo anno (da sito www.ecura.it - IVA ESCLUSA)
      setupBase: 690.00,        // Prezzo base sito (IVA esclusa)
      setupIva: 151.80,         // 690 * 0.22
      setupTotale: 841.80,      // 690 * 1.22
      
      // Rinnovo (da sito www.ecura.it - IVA ESCLUSA)
      rinnovoBase: 500.00,      // Prezzo rinnovo sito (IVA esclusa)
      rinnovoIva: 110.00,       // 500 * 0.22
      rinnovoTotale: 610.00,    // 500 * 1.22
      
      // Detrazione
      detrazioneFiscale19: 159.94, // 19% di 841.80
      
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
      
      // Primo anno (da sito www.ecura.it - IVA ESCLUSA)
      setupBase: 480.00,        // Prezzo base sito (IVA esclusa)
      setupIva: 105.60,         // 480 * 0.22
      setupTotale: 585.60,      // 480 * 1.22
      
      // Rinnovo (da sito www.ecura.it - IVA ESCLUSA)
      rinnovoBase: 240.00,      // Prezzo rinnovo sito (IVA esclusa)
      rinnovoIva: 52.80,        // 240 * 0.22
      rinnovoTotale: 292.80,    // 240 * 1.22
      
      // Detrazione
      detrazioneFiscale19: 111.26, // 19% di 585.60
      
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
      
      // Primo anno (da sito www.ecura.it - IVA ESCLUSA)
      setupBase: 840.00,        // Prezzo base sito (IVA esclusa)
      setupIva: 184.80,         // 840 * 0.22
      setupTotale: 1024.80,     // 840 * 1.22
      
      // Rinnovo (da sito www.ecura.it - IVA ESCLUSA)
      rinnovoBase: 600.00,      // Prezzo rinnovo sito (IVA esclusa)
      rinnovoIva: 132.00,       // 600 * 0.22
      rinnovoTotale: 732.00,    // 600 * 1.22
      
      // Detrazione
      detrazioneFiscale19: 194.71, // 19% di 1024.80
      
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
      
      // Primo anno (da sito www.ecura.it - IVA ESCLUSA)
      setupBase: 590.00,        // Prezzo base sito (IVA esclusa)
      setupIva: 129.80,         // 590 * 0.22
      setupTotale: 719.80,      // 590 * 1.22
      
      // Rinnovo (da sito www.ecura.it - IVA ESCLUSA)
      rinnovoBase: 300.00,      // Prezzo rinnovo sito (IVA esclusa)
      rinnovoIva: 66.00,        // 300 * 0.22
      rinnovoTotale: 366.00,    // 300 * 1.22
      
      // Detrazione
      detrazioneFiscale19: 136.76, // 19% di 719.80
      
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
      
      // Primo anno (da sito www.ecura.it - IVA ESCLUSA)
      setupBase: 990.00,        // Prezzo base sito (IVA esclusa)
      setupIva: 217.80,         // 990 * 0.22
      setupTotale: 1207.80,     // 990 * 1.22
      
      // Rinnovo (da sito www.ecura.it - IVA ESCLUSA)
      rinnovoBase: 750.00,      // Prezzo rinnovo sito (IVA esclusa)
      rinnovoIva: 165.00,       // 750 * 0.22
      rinnovoTotale: 915.00,    // 750 * 1.22
      
      // Detrazione
      detrazioneFiscale19: 229.48, // 19% di 1207.80
      
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
