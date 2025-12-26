/**
 * eCura Services Configuration - TeleMedCare V12.0
 * Definizioni complete per i 3 servizi eCura con dispositivi e piani
 */

export type ServizioeCura = 'FAMILY' | 'PRO' | 'PREMIUM'
export type PianoeCura = 'BASE' | 'AVANZATO'

/**
 * Dati aziendali (da configurare in base all'azienda reale)
 */
export const DATI_AZIENDA = {
  ragioneSociale: 'Medica GB S.r.l.',
  indirizzo: 'Via Example 123, 00100 Roma',
  partitaIva: '12345678901',
  email: 'info@telemedcare.it',
  sito: 'www.ecura.it',
  sitoPrivacy: 'www.ecura.it/privacy'
}

/**
 * Configurazione completa di un servizio eCura
 */
export interface ServizioConfig {
  nome: string                    // Es: "eCura FAMILY"
  nomeCompleto: string            // Es: "eCura FAMILY - Assistenza Familiare"
  dispositivo: string             // Es: "Senium Care"
  dispositivoDescrizione: string  // Descrizione dispositivo
  servizioDescrizione: string     // Descrizione servizio
  caratteristiche: string[]       // Lista caratteristiche principali
}

/**
 * Configurazione completa di un piano (BASE o AVANZATO)
 */
export interface PianoConfig {
  nome: string                    // "Base" o "Avanzato"
  nomeCompleto: string            // Es: "Piano Base (senza centrale operativa h24)"
  descrizione: string             // Descrizione piano
  caratteristiche: string[]       // Lista caratteristiche piano
  centraleOperativa: boolean      // true = h24, false = solo ore ufficio
}

/**
 * Database completo servizi eCura
 */
export const SERVIZI_ECURA: Record<ServizioeCura, ServizioConfig> = {
  FAMILY: {
    nome: 'eCura FAMILY',
    nomeCompleto: 'eCura Family',  // Per template DOCX
    dispositivo: 'Senium CARE',
    dispositivoDescrizione: 'Dispositivo indossabile con sensori avanzati per il monitoraggio continuo della salute e localizzazione GPS',
    servizioDescrizione: 'Servizio di teleassistenza dedicato alla famiglia, con monitoraggio dei parametri vitali e supporto per anziani',
    caratteristiche: [
      'Dispositivo Senium CARE in comodato d\'uso',
      'Monitoraggio parametri vitali (frequenza cardiaca, pressione, temperatura)',
      'Localizzazione GPS per sicurezza e tranquillità',
      'App dedicata per familiari',
      'Supporto tecnico e assistenza'
    ]
  },
  
  PRO: {
    nome: 'eCura PRO',
    nomeCompleto: 'eCura PRO',  // Per template DOCX
    dispositivo: 'SiDLY CARE PRO',
    dispositivoDescrizione: 'Sistema di telemonitoraggio professionale con centrale operativa avanzata e sensori medicali certificati',
    servizioDescrizione: 'Soluzione professionale per il monitoraggio remoto della salute con dispositivo medicale certificato e servizi avanzati',
    caratteristiche: [
      'Dispositivo SiDLY CARE PRO certificato medicale',
      'Monitoraggio continuo parametri vitali avanzati',
      'Sistema di allarme automatico',
      'Storico completo dei dati sanitari',
      'Integrazione con sistemi sanitari',
      'Supporto tecnico dedicato'
    ]
  },
  
  PREMIUM: {
    nome: 'eCura PREMIUM',
    nomeCompleto: 'eCura Premium',  // Per template DOCX
    dispositivo: 'SiDLY VITAL CARE',
    dispositivoDescrizione: 'Dispositivo medicale premium con sensori di ultima generazione per monitoraggio completo e telediagnosi',
    servizioDescrizione: 'Servizio premium completo con dispositivo SiDLY VITAL CARE e supporto sanitario h24',
    caratteristiche: [
      'Dispositivo SiDLY VITAL CARE top di gamma',
      'Monitoraggio completo parametri vitali',
      'Telediagnosi con medici specialisti',
      'Analisi predittiva con AI',
      'Report sanitari periodici',
      'Consulenza medica prioritaria',
      'Assistenza premium dedicata'
    ]
  }
}

/**
 * Database piani eCura (BASE e AVANZATO)
 */
export const PIANI_ECURA: Record<PianoeCura, PianoConfig> = {
  BASE: {
    nome: 'Base',
    nomeCompleto: 'Base con Connessione diretta h24 con i Care Giver e famigliari per 7 giorni per la durata di 12 mesi',
    descrizione: 'Piano base con notifiche e allarmi indirizzati direttamente ai care givers e familiari',
    caratteristiche: [
      'Connessione diretta h24 con Care Giver e familiari',
      'Notifiche e allarmi 7 giorni su 7',
      'Monitoraggio parametri vitali',
      'App dedicata per familiari',
      'Storico dati disponibile',
      'Supporto tecnico per il dispositivo',
      'Manutenzione ordinaria inclusa'
    ],
    centraleOperativa: false
  },
  
  AVANZATO: {
    nome: 'Avanzato',
    nomeCompleto: 'Avanzato con Servizi di Centrale Operativa h24 per 7 giorni per la durata di 12 mesi',
    descrizione: 'Piano avanzato con centrale operativa attiva 24 ore su 24, 7 giorni su 7',
    caratteristiche: [
      'Centrale operativa h24 365 giorni/anno',
      'Servizi di Centrale Operativa per 7 giorni',
      'Intervento immediato in caso di emergenza',
      'Monitoraggio continuo parametri vitali',
      'Allarmi automatici alla centrale',
      'Coordinamento con servizi sanitari di emergenza',
      'Report medici periodici',
      'Manutenzione prioritaria'
    ],
    centraleOperativa: true
  }
}

/**
 * Ottiene configurazione completa servizio
 */
export function getServizioConfig(servizio: ServizioeCura): ServizioConfig {
  return SERVIZI_ECURA[servizio]
}

/**
 * Ottiene configurazione completa piano
 */
export function getPianoConfig(piano: PianoeCura): PianoConfig {
  return PIANI_ECURA[piano]
}

/**
 * Genera nome completo servizio + piano
 * Es: "eCura PRO Avanzato (con centrale operativa h24)"
 */
export function getNomeCompletoServizio(servizio: ServizioeCura, piano: PianoeCura): string {
  const servizioConfig = getServizioConfig(servizio)
  const pianoConfig = getPianoConfig(piano)
  return `${servizioConfig.nome} ${pianoConfig.nome}`
}

/**
 * Genera descrizione completa per il contratto
 */
export function getDescrizioneServizio(servizio: ServizioeCura, piano: PianoeCura): string {
  const servizioConfig = getServizioConfig(servizio)
  const pianoConfig = getPianoConfig(piano)
  
  return `${servizioConfig.servizioDescrizione}\n\n${pianoConfig.descrizione}`
}

/**
 * Ottiene lista completa caratteristiche servizio + piano
 */
export function getCaratteristicheComplete(servizio: ServizioeCura, piano: PianoeCura): string[] {
  const servizioConfig = getServizioConfig(servizio)
  const pianoConfig = getPianoConfig(piano)
  
  return [
    ...servizioConfig.caratteristiche,
    ...pianoConfig.caratteristiche
  ]
}
