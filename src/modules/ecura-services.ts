/**
 * eCura Services Configuration - TeleMedCare V12.0
 * Definizioni complete per i 3 servizi eCura con dispositivi e piani
 * Fonte: www.ecura.it (aggiornato luglio 2026)
 *
 * GERARCHIA FUNZIONALITÀ (cumulative):
 *   FAMILY  → funzioni base (SOS, cadute, GPS base, voce, app familiari, IP67)
 *   PRO     → FAMILY + AI cadute avanzata, GPS multi-tech indoor/outdoor,
 *             freq. cardiaca, ossimetria, promemoria farmaci vocali, geofencing avanzato
 *   PREMIUM → PRO + analisi sonno, AI predittiva, dashboard clinica,
 *             alert intelligenti, saturazione SpO2, telemedicina integrata
 *
 * PIANI (ortogonali al servizio):
 *   BASE     → allarmi/notifiche ai familiari/caregiver direttamente
 *   AVANZATO → + Centrale Operativa H24/7: intervento immediato,
 *               coordinamento emergenze (118), chiamata mensile cortesia
 */

export type ServizioeCura = 'FAMILY' | 'PRO' | 'PREMIUM'
export type PianoeCura = 'BASE' | 'AVANZATO'

/**
 * Dati aziendali
 */
export const DATI_AZIENDA = {
  ragioneSociale: 'Medica GB S.r.l.',
  indirizzo: 'Corso Giuseppe Garibaldi, 34 – 20121 Milano',
  partitaIva: '12435130963',
  email: 'info@ecura.it',
  sito: 'www.ecura.it',
  sitoPrivacy: 'www.ecura.it/privacy'
}

/**
 * Configurazione completa di un servizio eCura
 */
export interface ServizioConfig {
  nome: string
  nomeCompleto: string
  dispositivo: string
  dispositivoDescrizione: string
  servizioDescrizione: string
  caratteristiche: string[]
}

/**
 * Configurazione completa di un piano (BASE o AVANZATO)
 */
export interface PianoConfig {
  nome: string
  nomeCompleto: string
  descrizione: string
  caratteristiche: string[]
  centraleOperativa: boolean
}

/**
 * Database completo servizi eCura — fonte: www.ecura.it
 */
export const SERVIZI_ECURA: Record<ServizioeCura, ServizioConfig> = {

  // ─── FAMILY ────────────────────────────────────────────────────────────────
  // Protezione essenziale: SOS, cadute, GPS base, voce, app familiari
  // NON include: parametri vitali, ossimetria, geofencing avanzato, AI avanzata
  FAMILY: {
    nome: 'eCura FAMILY',
    nomeCompleto: 'eCura Family',
    dispositivo: 'SiDLY Care PRO',
    dispositivoDescrizione:
      'Bracciale intelligente certificato come Dispositivo Medico di Classe IIa. ' +
      'Impermeabile IP67, con SIM 4G integrata, GPS e sensori per rilevamento cadute e localizzazione.',
    servizioDescrizione:
      'Servizio di teleassistenza con protezione essenziale: rilevamento cadute automatico, ' +
      'pulsante SOS geolocalizzato, localizzazione GPS in tempo reale e comunicazione vocale bidirezionale. ' +
      'Gli allarmi e le notifiche sono indirizzati direttamente ai familiari e ai care giver.',
    caratteristiche: [
      'Dispositivo SiDLY Care PRO (Dispositivo Medico certificato Classe IIa)',
      'Pulsante SOS geolocalizzato con comunicazione vocale bidirezionale',
      'Rilevamento cadute automatico',
      'GPS localizzazione in tempo reale',
      'App dedicata per familiari e care giver',
      'Assistenza vocale sul dispositivo',
      'Impermeabile IP67',
      'SIM multiprovider integrata (prefisso +48 o +33) con copertura in tutta Europa'
    ]
  },

  // ─── PRO ───────────────────────────────────────────────────────────────────
  // Tutte le funzioni FAMILY + AI avanzata cadute, GPS multi-tech indoor/outdoor,
  // monitoraggio freq. cardiaca e ossimetria, promemoria farmaci vocali, geofencing avanzato
  PRO: {
    nome: 'eCura PRO',
    nomeCompleto: 'eCura PRO',
    dispositivo: 'SiDLY Care PRO',
    dispositivoDescrizione:
      'Bracciale intelligente certificato come Dispositivo Medico di Classe IIa. ' +
      'Impermeabile IP67, SIM 4G integrata, GPS multi-tecnologia (GPS+Wi-Fi+BLE) indoor e outdoor, ' +
      'sensori per parametri vitali (frequenza cardiaca e ossimetria), AI avanzata per rilevamento cadute.',
    servizioDescrizione:
      'Servizio professionale di teleassistenza che include tutte le funzioni eCura Family, ' +
      'più il monitoraggio della frequenza cardiaca e dell\'ossimetria con soglie personalizzabili, ' +
      'AI avanzata per il rilevamento cadute (addestrata su 14.000 eventi), GPS multi-tecnologia ' +
      'indoor/outdoor, geofencing avanzato e promemoria farmaci vocali.',
    caratteristiche: [
      'Dispositivo SiDLY Care PRO (Dispositivo Medico certificato Classe IIa)',
      'Pulsante SOS geolocalizzato con comunicazione vocale bidirezionale',
      'Rilevamento cadute con AI avanzata (addestrata su 14.000 cadute reali)',
      'GPS multi-tecnologia indoor/outdoor (GPS + Wi-Fi beacon + BLE)',
      'Monitoraggio frequenza cardiaca con soglie di allarme personalizzabili',
      'Monitoraggio ossimetria (SpO2) con soglie di allarme personalizzabili',
      'Geofencing avanzato con area sicura personalizzabile',
      'Promemoria farmaci vocali',
      'App dedicata per familiari e care giver',
      'Assistenza vocale sul dispositivo',
      'Impermeabile IP67',
      'SIM multiprovider integrata (prefisso +48 o +33) con copertura in tutta Europa'
    ]
  },

  // ─── PREMIUM ───────────────────────────────────────────────────────────────
  // Tutte le funzioni PRO + analisi sonno, AI predittiva, dashboard clinica,
  // alert intelligenti, telemedicina integrata, SiDLY Vital Care
  PREMIUM: {
    nome: 'eCura PREMIUM',
    nomeCompleto: 'eCura Premium',
    dispositivo: 'SiDLY Vital Care',
    dispositivoDescrizione:
      'Dispositivo medico top di gamma certificato Classe IIa con AI predittiva integrata. ' +
      'Impermeabile IP67, SIM 4G integrata, GPS multi-tecnologia, sensori avanzati per ' +
      'monitoraggio completo dei parametri vitali (frequenza cardiaca, SpO2, analisi del sonno).',
    servizioDescrizione:
      'Servizio premium di teleassistenza e telemedicina che include tutte le funzioni eCura PRO, ' +
      'più analisi completa del sonno, AI predittiva per la prevenzione dei rischi, dashboard clinica ' +
      'professionale, alert intelligenti personalizzati e telemedicina integrata.',
    caratteristiche: [
      'Dispositivo SiDLY Vital Care (Dispositivo Medico certificato Classe IIa + AI predittiva)',
      'Pulsante SOS geolocalizzato con comunicazione vocale bidirezionale',
      'Rilevamento cadute con AI avanzata (addestrata su 14.000 cadute reali)',
      'GPS multi-tecnologia indoor/outdoor (GPS + Wi-Fi beacon + BLE)',
      'Monitoraggio frequenza cardiaca con soglie di allarme personalizzabili',
      'Monitoraggio saturazione ossigeno SpO2 con soglie personalizzabili',
      'Analisi completa del sonno',
      'AI predittiva per la prevenzione dei rischi',
      'Dashboard clinica professionale',
      'Alert intelligenti personalizzati',
      'Telemedicina integrata',
      'Geofencing avanzato con area sicura personalizzabile',
      'Promemoria farmaci vocali',
      'App dedicata per familiari e care giver',
      'Impermeabile IP67',
      'SIM multiprovider integrata (prefisso +48 o +33) con copertura in tutta Europa'
    ]
  }
}

/**
 * Database piani eCura (BASE e AVANZATO) — fonte: www.ecura.it
 */
export const PIANI_ECURA: Record<PianoeCura, PianoConfig> = {
  BASE: {
    nome: 'Base',
    nomeCompleto: 'Base con Connessione diretta h24 con i Care Giver e famigliari per 7 giorni per la durata di 12 mesi',
    descrizione:
      'Piano base: configurazione e assistenza con notifiche e allarmi indirizzati ' +
      'direttamente ai care giver e ai familiari 24h/7 giorni.',
    caratteristiche: [
      'Configurazione da remoto del dispositivo',
      'Settaggio dei contatti dei familiari e care giver',
      'Formazione una tantum per aggiornamenti in autonomia (incluso reporting)',
      'Notifiche e allarmi direttamente ai familiari h24/7 giorni',
      'Supporto tecnico per il dispositivo'
    ],
    centraleOperativa: false
  },

  AVANZATO: {
    nome: 'Avanzato',
    nomeCompleto: 'Avanzato con Servizi di Centrale Operativa h24 per 7 giorni per la durata di 12 mesi',
    descrizione:
      'Piano avanzato: include tutto il Piano Base più il supporto della Centrale Operativa H24 ' +
      '7 giorni su 7, con intervento immediato, coordinamento emergenze e chiamata mensile di cortesia.',
    caratteristiche: [
      'Tutto il Piano Base incluso',
      'Supporto Centrale Operativa H24/7 giorni su 7',
      'Supporto centralizzato ai familiari con filtro delle segnalazioni',
      'Intervento immediato H24 in caso di emergenza',
      'Coordinamento emergenze (chiamata mezzi di soccorso / 118)',
      'Chiamata mensile di cortesia al caregiver'
    ],
    centraleOperativa: true
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// ─────────────────────────────────────────────────────────────────────────────

export function getServizioConfig(servizio: ServizioeCura): ServizioConfig {
  return SERVIZI_ECURA[servizio]
}

export function getPianoConfig(piano: PianoeCura): PianoConfig {
  return PIANI_ECURA[piano]
}

export function getNomeCompletoServizio(servizio: ServizioeCura, piano: PianoeCura): string {
  return `${SERVIZI_ECURA[servizio].nome} ${PIANI_ECURA[piano].nome}`
}

export function getDescrizioneServizio(servizio: ServizioeCura, piano: PianoeCura): string {
  return `${SERVIZI_ECURA[servizio].servizioDescrizione}\n\n${PIANI_ECURA[piano].descrizione}`
}

export function getCaratteristicheComplete(servizio: ServizioeCura, piano: PianoeCura): string[] {
  const isProOrPremium = servizio === 'PRO' || servizio === 'PREMIUM'

  // Le caratteristiche del piano BASE non includono i promemoria farmaci:
  // quella voce è riservata a PRO e PREMIUM (fonte: www.ecura.it)
  const pianoCaratteristiche = [...PIANI_ECURA[piano].caratteristiche]
  if (isProOrPremium && piano === 'BASE') {
    // Inserisci 'Inserimento iniziale dei promemoria farmaci' dopo 'Settaggio dei contatti'
    const idxSettaggio = pianoCaratteristiche.findIndex(c => c.startsWith('Settaggio dei contatti'))
    const insertAt = idxSettaggio >= 0 ? idxSettaggio + 1 : 1
    pianoCaratteristiche.splice(insertAt, 0, 'Inserimento iniziale dei promemoria farmaci')
  }

  return [
    ...SERVIZI_ECURA[servizio].caratteristiche,
    ...pianoCaratteristiche
  ]
}

/**
 * Restituisce il blocco HTML delle funzioni del dispositivo per la sezione
 * "Oggetto del Contratto", differenziato per servizio (FAMILY/PRO/PREMIUM)
 * e per piano (BASE/AVANZATO).
 *
 * FAMILY BASE:      SOS→familiari, cadute→familiari, voce→familiari, GPS base — NO geofencing, NO farmaci
 * FAMILY AVANZATO:  SOS→CO, cadute→CO, voce→CO, GPS base — NO geofencing, NO farmaci
 * PRO BASE:         come FAMILY BASE + AI cadute avanzata, GPS multi-tech, freq.card/SpO2, geofencing avanzato, farmaci vocali
 * PRO AVANZATO:     come FAMILY AVANZATO + AI cadute avanzata, GPS multi-tech, freq.card/SpO2 (notifica CO), geofencing avanzato, farmaci vocali
 * PREMIUM BASE:     come PRO BASE + sonno, AI predittiva, dashboard clinica, telemedicina
 * PREMIUM AVANZATO: come PRO AVANZATO + sonno, AI predittiva, dashboard clinica, telemedicina
 */
export function getDescrizioneFunzioniDispositivo(
  servizio: ServizioeCura,
  piano: PianoeCura
): string {
  const isAvanzato = piano === 'AVANZATO'
  const isPro     = servizio === 'PRO'
  const isPremium = servizio === 'PREMIUM'
  const isProOrPremium = isPro || isPremium
  const dest = isAvanzato ? 'alla Centrale Operativa' : 'ai familiari'

  // ── Rilevatore caduta ─────────────────────────────────────────────────────
  const cadutaAI = isProOrPremium
    ? ' grazie all\'AI avanzata addestrata su 14.000 cadute reali'
    : ''
  const sezioneCADUTA = `<p><strong>Rilevatore automatico di caduta:</strong> effettua una chiamata vocale di allarme, in caso di caduta${cadutaAI}, e invia una notifica tramite sms ${dest}. Nell'sms arriverà sia il link per individuare la posizione dell'assistito (geolocalizzazione) che i valori dei parametri fisiologici rilevati.</p>`

  // ── Pulsante SOS ──────────────────────────────────────────────────────────
  const sosDestinatario = isAvanzato
    ? '(Centrale Operativa disponibile H24/7 giorni su 7)'
    : '(in caso di mancata risposta, in cascata, ai successivi contatti di emergenza configurati)'
  const sosDest2 = isAvanzato ? 'alla Centrale Operativa' : 'ai familiari configurati in Piattaforma'
  const sezioneSOS = `<p><strong>Pulsante SOS:</strong> premendo il pulsante SOS è possibile effettuare una chiamata vocale al primo contatto di emergenza ${sosDestinatario} ed inviare una notifica di emergenza (SMS geolocalizzato) ${sosDest2}.</p>`

  // ── Comunicazione vocale bidirezionale ───────────────────────────────────
  const voceDest = isAvanzato ? 'della Centrale Operativa' : 'dei familiari'
  const voceRiceve = isAvanzato ? 'la Centrale Operativa riceve' : 'i familiari (configurati in Piattaforma) ricevono'
  const vocePuoContattare = isAvanzato
    ? 'la Centrale Operativa (configurata in Piattaforma) può contattare'
    : 'i familiari (configurati in Piattaforma) possono contattare'
  const sezioneVOCE = `<p><strong>Comunicazione vocale bidirezionale:</strong> è possibile configurare sulla Piattaforma i contatti ${voceDest}; dopo l'invio dell'allarme ${voceRiceve} una chiamata dal bracciale e possono parlare con l'assistito; inoltre, in qualsiasi momento, ${vocePuoContattare} l'assistito tramite il bracciale.</p>`

  // ── GPS ───────────────────────────────────────────────────────────────────
  const gpsMultitech = isProOrPremium ? ' con tecnologia multi-sistema (GPS + Wi-Fi beacon + BLE) per localizzazione precisa sia indoor che outdoor' : ''
  const gpsGeofencing = isProOrPremium  // solo PRO e PREMIUM (qualsiasi piano); FAMILY mai
    ? ' È inoltre possibile impostare una cosiddetta area sicura per l\'assistito (geo-fencing) con invio automatico dell\'allarme in caso di uscita dalla zona sicura.'
    : ''
  const sezioneGPS = `<p><strong>Posizione gps e gps-assistito:</strong> consente di geolocalizzare l'assistito quando viene inviato l'allarme oppure, in ogni momento, tramite l'APP${gpsMultitech}.${gpsGeofencing}</p>`

  // ── Parametri vitali (solo PRO e PREMIUM) ────────────────────────────────
  const vitaliDest = isAvanzato ? 'alla Centrale Operativa' : 'ai familiari'
  const sezioneVITALI = isProOrPremium
    ? `<p><strong>Monitoraggio frequenza cardiaca${isPremium ? ' e saturazione ossigeno (SpO2)' : ' e ossimetria'}:</strong> misurazioni continue con accuratezza clinica. È possibile impostare soglie personalizzabili (comunicate dal proprio Medico di Base) con invio di notifica di allarme ${vitaliDest} tramite APP quando i valori rilevati superano le soglie programmate.</p>`
    : ''

  // ── Analisi del sonno (solo PREMIUM) ─────────────────────────────────────
  const sezioneSonno = isPremium
    ? `<p><strong>Analisi completa del sonno:</strong> monitoraggio notturno dei parametri fisiologici per valutare la qualità del sonno e individuare eventuali anomalie.</p>`
    : ''

  // ── AI predittiva (solo PREMIUM) ─────────────────────────────────────────
  const sezioneAI = isPremium
    ? `<p><strong>AI predittiva per la prevenzione dei rischi:</strong> algoritmi di intelligenza artificiale analizzano i dati raccolti per individuare situazioni di rischio prima che si manifestino, con generazione di alert intelligenti personalizzati.</p>`
    : ''

  // ── Dashboard clinica e telemedicina (solo PREMIUM) ──────────────────────
  const sezioneDashboard = isPremium
    ? `<p><strong>Dashboard clinica professionale e telemedicina integrata:</strong> accesso a una piattaforma clinica completa con storico dei parametri vitali, report periodici e servizi di telemedicina per consulti a distanza con personale sanitario.</p>`
    : ''

  // ── Assistenza vocale (tutti) ─────────────────────────────────────────────
  const sezioneASSISTENZA = `<p><strong>Assistenza vocale:</strong> informa l'assistito in relazione ai seguenti eventi: pressione pulsante SOS, attivazione bracciale, messa in carica del bracciale, segnalazione di batteria scarica, ecc.</p>`

  // ── Promemoria farmaci (solo PRO e PREMIUM — qualsiasi piano; FAMILY MAI)
  // Fonte: www.ecura.it — FAMILY non include promemoria farmaci vocali
  const sezioneFARMACI = isProOrPremium
    ? `<p><strong>Promemoria farmaci vocali:</strong> messaggi vocali ricordano all'assistito l'orario in cui assumere i farmaci (aderenza terapeutica).</p>`
    : ''

  // ── Registrazione passi (tutti) ──────────────────────────────────────────
  const sezionePASSI = `<p><strong>Registrazione dei passi:</strong> aiuta a valutare l'attività giornaliera e, monitorando le calorie bruciate, contribuisce al mantenimento di uno stile di vita sano.</p>`

  // ── Composizione finale ───────────────────────────────────────────────────
  const sezioni = [
    sezioneCADUTA,
    sezioneSOS,
    sezioneVOCE,
    sezioneGPS,
    sezioneVITALI,
    sezioneSonno,
    sezioneAI,
    sezioneDashboard,
    sezioneASSISTENZA,
    sezioneFARMACI,
    sezionePASSI
  ].filter(s => s.trim() !== '')

  return sezioni.join('\n\n        ')
}
