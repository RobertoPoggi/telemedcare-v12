/**
 * Descrizioni dispositivi per template proforma
 * Basato su Pro Forma reale Medica GB (D'Avella 11.02.2026)
 */

export const dispositivoDescriptions = {
  SIDLY_VITAL_CARE_BASE: `Sistema di allarme mobile di piccole dimensioni ed indossabile. È progettato per monitorare e proteggere le persone. In caso di emergenza, la persona può attivarlo premendo un pulsante SOS sull'unità e la funzione di comunicazione vocale bidirezionale consente di parlare con i famigliari / caregivers. E' integrato con sensori che consentono la geolocalizzazione, il geo-fencing, il rilevamento cadute, il reminder dei farmaci e il monitoraggio dei parametri vitali (frequenza cardiaca e saturazione ossigeno). Le funzionalità di comunicazione vocale, di geolocalizzazione e di SOS permettono a tutte le persone che sono nella lista dei contatti salvata su piattaforma web, di gestire la chiamata di aiuto dell'assistito (anche quando l'assistito è in giro fuori casa o non è presente nessun familiare nelle vicinanze). Inoltre, è integrato con una SIM dedicata che garantisce la connettività in tutta Italia e permette la trasmissione dei dati e la comunicazione vocale. Il dispositivo è accompagnato da una piattaforma web e un'app mobile che consentono di gestire le impostazioni, visualizzare la posizione dell'assistito e ricevere notifiche in tempo reale.`,

  SIDLY_CARE_PRO_BASE: `Sistema di allarme mobile di piccole dimensioni ed indossabile. È progettato per monitorare e proteggere le persone. In caso di emergenza, la persona può attivarlo premendo un pulsante SOS sull'unità e la funzione di comunicazione vocale bidirezionale consente di parlare con i famigliari / caregivers. E' integrato con sensori che consentono la geolocalizzazione, il geo-fencing, il rilevamento cadute, il reminder dei farmaci e il monitoraggio dei parametri vitali (frequenza cardiaca e saturazione ossigeno). Le funzionalità di comunicazione vocale, di geolocalizzazione e di SOS permettono a tutte le persone che sono nella lista dei contatti salvata su piattaforma web, di gestire la chiamata di aiuto dell'assistito. Il dispositivo è accompagnato da una piattaforma web e un'app mobile che consentono di gestire le impostazioni, visualizzare la posizione dell'assistito e ricevere notifiche in tempo reale.`,

  SIDLY_VITAL_CARE_AVANZATO: `Sistema di allarme mobile di piccole dimensioni ed indossabile con servizio di TeleAssistenza AVANZATO. È progettato per monitorare e proteggere le persone con supporto di Centrale Operativa h24. In caso di emergenza, la persona può attivarlo premendo un pulsante SOS e la Centrale Operativa risponde immediatamente tramite comunicazione vocale bidirezionale. E' integrato con sensori avanzati che consentono la geolocalizzazione, il geo-fencing, il rilevamento cadute automatico con notifica immediata alla Centrale, il reminder personalizzato dei farmaci e il monitoraggio continuo dei parametri vitali con alert automatici alla Centrale Operativa. Le funzionalità di comunicazione vocale e geolocalizzazione permettono alla Centrale Operativa e ai famigliari di gestire tempestivamente la chiamata di aiuto dell'assistito. Il dispositivo è accompagnato da una piattaforma web professionale e un'app mobile avanzata con accesso allo storico completo delle attività.`,

  SIDLY_CARE_PRO_AVANZATO: `Sistema di allarme mobile di piccole dimensioni ed indossabile con servizio di TeleAssistenza AVANZATO. È progettato per monitorare e proteggere le persone con supporto di Centrale Operativa h24. In caso di emergenza, la persona può attivarlo premendo un pulsante SOS e la Centrale Operativa risponde immediatamente tramite comunicazione vocale bidirezionale. E' integrato con sensori avanzati che consentono la geolocalizzazione, il geo-fencing, il rilevamento cadute automatico con notifica immediata alla Centrale, il reminder personalizzato dei farmaci e il monitoraggio continuo dei parametri vitali con alert automatici alla Centrale Operativa. Le funzionalità di comunicazione vocale e geolocalizzazione permettono alla Centrale Operativa e ai famigliari di gestire tempestivamente la chiamata di aiuto dell'assistito. Il dispositivo è accompagnato da una piattaforma web professionale e un'app mobile avanzata con accesso allo storico completo delle attività.`
}

export function getDispositivoDescription(servizio: string, piano: string): string {
  const dispositivo = servizio?.includes('PREMIUM') ? 'SIDLY_VITAL_CARE' : 'SIDLY_CARE_PRO'
  const livello = piano === 'AVANZATO' ? 'AVANZATO' : 'BASE'
  const key = `${dispositivo}_${livello}` as keyof typeof dispositivoDescriptions
  
  return dispositivoDescriptions[key] || dispositivoDescriptions.SIDLY_CARE_PRO_BASE
}

export function getTipoPrestazione(servizio: string, piano: string): string {
  const dispositivo = servizio?.includes('PREMIUM') ? 'SiDLY VITAL CARE' : 'SiDLY CARE PRO'
  const livello = piano === 'AVANZATO' ? 'AVANZATO' : 'BASE'
  
  return `SERVIZI DI TELEASSISTENZA ${livello} CON ${dispositivo}`
}
