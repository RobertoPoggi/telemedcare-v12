/**
 * Utility functions for lead data processing
 */

/**
 * Calcola l'età da una data di nascita
 * @param dataNascita - Data nel formato YYYY-MM-DD, DD/MM/YYYY, o DD-MM-YYYY
 * @returns Età in anni o null se data non valida
 */
export function calcolaEta(dataNascita: string | null | undefined): number | null {
  if (!dataNascita) return null
  
  try {
    // Normalizza formato data
    let data: Date
    
    // Formato YYYY-MM-DD
    if (dataNascita.match(/^\d{4}-\d{2}-\d{2}$/)) {
      data = new Date(dataNascita)
    }
    // Formato DD/MM/YYYY
    else if (dataNascita.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [giorno, mese, anno] = dataNascita.split('/')
      data = new Date(`${anno}-${mese}-${giorno}`)
    }
    // Formato DD-MM-YYYY
    else if (dataNascita.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const [giorno, mese, anno] = dataNascita.split('-')
      data = new Date(`${anno}-${mese}-${giorno}`)
    }
    else {
      return null
    }
    
    if (isNaN(data.getTime())) return null
    
    const oggi = new Date()
    let eta = oggi.getFullYear() - data.getFullYear()
    const meseDiff = oggi.getMonth() - data.getMonth()
    
    // Aggiusta se il compleanno non è ancora passato quest'anno
    if (meseDiff < 0 || (meseDiff === 0 && oggi.getDate() < data.getDate())) {
      eta--
    }
    
    return eta >= 0 ? eta : null
  } catch (error) {
    console.error('Errore calcolo età:', error)
    return null
  }
}

/**
 * Aggiunge età calcolata ai dati del lead se mancante
 */
export function enrichLeadWithAge(leadData: any): any {
  if (!leadData.etaAssistito && leadData.dataNascitaAssistito) {
    leadData.etaCalcolata = calcolaEta(leadData.dataNascitaAssistito)
    leadData.etaAssistito = leadData.etaCalcolata
  }
  return leadData
}
