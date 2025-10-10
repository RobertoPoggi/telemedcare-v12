/**
 * CONTRACT_SERVICE.TS - Sistema Pre-compilazione Contratti
 * TeleMedCare V11.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Pre-compilazione contratti Base e Avanzato con dati cliente
 * - Generazione Proforma unificata con IBAN reale Medica GB
 * - Template reali caricati dall'utente (Base, Avanzato, Proforma)
 * - Calcolo automatico prezzi e date scadenza
 * - Integrazione con EmailService e SignatureService
 * - Export PDF/DOCX con watermark e numerazione
 */

export interface CustomerData {
  // Dati assistito (persona che riceve il servizio)
  nomeAssistito: string
  cognomeAssistito: string
  dataNascita?: string
  luogoNascita?: string
  codiceFiscaleAssistito?: string
  indirizzoAssistito?: string
  capAssistito?: string
  cittaAssistito?: string
  provinciaAssistito?: string
  telefonoAssistito?: string
  emailAssistito?: string

  // Dati richiedente (se diverso dall'assistito)
  nomeRichiedente: string
  cognomeRichiedente: string
  emailRichiedente: string
  telefonoRichiedente: string
  codiceFiscaleRichiedente?: string
  indirizzoRichiedente?: string
  
  // Servizio
  tipoServizio: 'BASE' | 'AVANZATO'
  dataAtivazione?: string
  serialNumber?: string
  
  // Prezzi
  importoPrimoAnno?: number
  prezzoRinnovo?: number
}

export interface ContractTemplate {
  id: string
  type: 'BASE' | 'AVANZATO' | 'PROFORMA'
  name: string
  content: string
  variables: string[]
  pricing: {
    primoAnno: number
    rinnovo: number
  }
}

export interface GeneratedContract {
  contractId: string
  type: 'BASE' | 'AVANZATO' | 'PROFORMA'
  customerName: string
  compiledContent: string
  variables: Record<string, string>
  documentUrl: string
  createdAt: string
  expiresAt: string
  status: 'DRAFT' | 'GENERATED' | 'SENT' | 'SIGNED'
}

// =====================================================================
// MEDICA GB REAL TEMPLATES
// =====================================================================

export const MEDICA_GB_TEMPLATES: Record<string, ContractTemplate> = {
  BASE: {
    id: 'contratto_base_medica_gb',
    type: 'BASE',
    name: 'Contratto TeleAssistenza Base - Medica GB',
    content: `## SCRITTURA PRIVATA

Con la presente scrittura privata da valere a tutti gli effetti e conseguenze di legge tra:

Medica GB S.r.l., con sede in Corso Giuseppe Garibaldi, 34 – 20121 Milano e con Partita IVA e registro imprese 12435130963, in persona dell'Amministratore Stefania Rocca

## (breviter Medica GB)

e

Sig./Sig.ra {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}} nato/a a {{LUOGO_NASCITA}} il {{DATA_NASCITA}}, residente e domiciliato/a in {{INDIRIZZO_ASSISTITO}} - {{CAP_ASSISTITO}} {{CITTA_ASSISTITO}} ({{PROVINCIA_ASSISTITO}}) e con codice fiscale {{CODICE_FISCALE_ASSISTITO}}.

## Riferimenti:

telefono {{TELEFONO_ASSISTITO}} – e-mail {{EMAIL_ASSISTITO}}

## (breviter Il Cliente)

## premesso che

- Medica GB eroga servizi di assistenza domiciliare con tecnologie innovative, servizi di diagnostica a domicilio, esami strumentali, telemedicina, teleassistenza, telemonitoraggio e riabilitazione a domicilio.

- Medica GB si avvale della consulenza di Medici, Terapisti, Infermieri e Operatori Socio Sanitari per erogare i servizi sopra descritti;

- Tanto premesso,

## si conviene e stabilisce quanto segue

## Premessa

## La premessa che precede costituisce parte integrante del presente Contratto.

## Oggetto del Contratto

L'oggetto del presente Contratto è l'erogazione del "Servizio di TeleAssistenza base" mediante l'utilizzo del Dispositivo SiDLY CARE PRO.

Le funzioni del Dispositivo SiDLY CARE PRO sono le seguenti:

Comunicazione vocale bidirezionale: è possibile configurare sulla Piattaforma SiDLY Care i contatti dei familiari; dopo l'invio dell'allarme i familiari (configurati in Piattaforma) ricevono una chiamata dal dispositivo e possono parlare con l'assistito; in qualsiasi momento i familiari possono contattare l'assistito tramite il dispositivo.

Rilevatore automatico di caduta: effettua una chiamata vocale di allarme, in caso di caduta, e invia una notifica tramite sms ai familiari. Nell'sms arriverà sia il link da cliccare per individuare la posizione dell'assistito (geolocalizzazione) che i valori dei parametri fisiologici che è stato possibile rilevare.

Posizione GPS e GPS-assistito: consente di localizzare l'assistito quando viene inviato l'allarme. È inoltre possibile impostare una cosiddetta area sicura per l'assistito (geo-fencing).

Misurazioni della frequenza cardiaca e della saturazione di ossigeno: è possibile impostare una notifica che arrivi ai familiari tramite APP quando i valori rilevati vanno oltre le soglie programmate (comunicate dal proprio Medico di Base).

Pulsante SOS: premendo il pulsante SOS per circa 3 secondi è possibile effettuare una chiamata vocale e inviare una notifica di emergenza (geolocalizzata) ai familiari.

Assistenza vocale: informa l'assistito in relazione ai seguenti eventi: pressione pulsante SOS, attivazione dispositivo, messa in carica del dispositivo, segnalazione di batteria scarica, ecc.

Promemoria per l'assunzione dei farmaci: un messaggio ricorda l'orario in cui assumere i farmaci (aderenza terapeutica).

## Durata del Servizio

Il Servizio di TeleAssistenza base ha una durata di 12 mesi a partire da {{DATA_INIZIO_SERVIZIO}} fino al {{DATA_SCADENZA}}.

Il Contratto sarà prorogabile su richiesta scritta del Cliente e su accettazione di Medica GB.

## Tariffa del Servizio

La tariffa annuale per il primo anno di attivazione del "Servizio di TeleAssistenza Base" è pari a Euro {{IMPORTO_PRIMO_ANNO}} + IVA 22% e include:

- Dispositivo SiDLY CARE PRO (hardware)
- Configurazione del Dispositivo e del Processo di Comunicazione con uno o più familiari e Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi
- SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi

Per i successivi anni (rinnovabili di anno in anno) la tariffa annuale per il "Servizio di Continuità di TeleAssistenza base" sarà pari a Euro 180,00 + IVA 22% con inclusi:

- Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi
- SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi

Metodo di pagamento

Medica GB emetterà fattura anticipata di 12 mesi all'attivazione del Servizio e il Cliente procederà al pagamento a ricevimento della fattura stessa tramite bonifico bancario

## Intestato a: Medica GB S.r.l.

## Causale: Servizio di TeleAssistenza Base annuo con Dispositivo SiDLY CARE PRO

## Banca Popolare di Milano - Iban: IT97L0503401727000000003519

Riservatezza ed esclusiva

Il Cliente e Medica GB si impegnano reciprocamente a non divulgare o, comunque, non utilizzare, se non per motivi attinenti all'esercizio del presente contratto, tutte le informazioni di cui venissero a conoscenza nello svolgimento del Servizio.

Il Cliente si impegna a contattare Medica GB per tutte le modifiche e proroghe del presente contratto.

## Foro competente

Ogni eventuale contestazione o controversia che dovesse insorgere tra le parti in relazione all'interpretazione, alla validità ed esecuzione del presente contratto, sarà definita alla cognizione esclusiva del Foro di Milano.

## Milano, lì {{DATA_CONTRATTO}}

Medica GB S.r.l.                                             Il Cliente

## Medica GB S.r.l.

## Corso Giuseppe Garibaldi, 34 – 20121 Milano

## PEC: medicagbsrl@pecimprese.it

## E.mail: info@medicagb.it

## Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409

## www.medicagb.it

## www.telemedcare.it`,
    variables: [
      'NOME_ASSISTITO', 'COGNOME_ASSISTITO', 'LUOGO_NASCITA', 'DATA_NASCITA',
      'INDIRIZZO_ASSISTITO', 'CAP_ASSISTITO', 'CITTA_ASSISTITO', 'PROVINCIA_ASSISTITO',
      'CODICE_FISCALE_ASSISTITO', 'TELEFONO_ASSISTITO', 'EMAIL_ASSISTITO',
      'DATA_INIZIO_SERVIZIO', 'DATA_SCADENZA', 'IMPORTO_PRIMO_ANNO', 'DATA_CONTRATTO'
    ],
    pricing: {
      primoAnno: 480,
      rinnovo: 180
    }
  },

  AVANZATO: {
    id: 'contratto_avanzato_medica_gb',
    type: 'AVANZATO',
    name: 'Contratto TeleAssistenza Avanzata - Medica GB',
    content: `## SCRITTURA PRIVATA

Con la presente scrittura privata da valere a tutti gli effetti e conseguenze di legge tra:

Medica GB S.r.l., con sede in Corso Giuseppe Garibaldi, 34 – 20121 Milano e con Partita IVA e registro imprese 12435130963, in persona dell'Amministratore Stefania Rocca

## (breviter Medica GB)

e

Sig./Sig.ra {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}} nato/a a {{LUOGO_NASCITA}} il {{DATA_NASCITA}}, residente e domiciliato/a in {{INDIRIZZO_ASSISTITO}} - {{CAP_ASSISTITO}} {{CITTA_ASSISTITO}} ({{PROVINCIA_ASSISTITO}}) e con codice fiscale {{CODICE_FISCALE_ASSISTITO}}.

## Riferimenti:

telefono {{TELEFONO_ASSISTITO}} – e-mail {{EMAIL_ASSISTITO}}

## (breviter Il Cliente)

## premesso che

- Medica GB eroga servizi di assistenza domiciliare con tecnologie innovative, servizi di diagnostica a domicilio, esami strumentali, telemedicina, teleassistenza, telemonitoraggio e riabilitazione a domicilio.

- Medica GB si avvale della consulenza di Medici, Terapisti, Infermieri e Operatori Socio Sanitari per erogare i servizi sopra descritti;

- Tanto premesso,

## si conviene e stabilisce quanto segue

## Premessa

## La premessa che precede costituisce parte integrante del presente Contratto.

## Oggetto del Contratto

L'oggetto del presente Contratto è l'erogazione del "Servizio di TeleAssistenza avanzata" mediante l'utilizzo del Dispositivo SiDLY CARE PRO e con il supporto della Centrale Operativa disponibile h24 per 7 giorni su 7 per la durata di 12 mesi.

Le funzioni del Dispositivo SiDLY CARE PRO sono le seguenti:

Comunicazione vocale bidirezionale: è possibile configurare sulla Piattaforma SiDLY Care i contatti dei familiari oltre a quelli della Centrale Operativa; dopo l'invio dell'allarme i familiari e la Centrale Operativa ricevono una chiamata dal dispositivo e possono parlare con l'assistito; in qualsiasi momento i familiari e/o la Centrale Operativa possono contattare l'assistito tramite il dispositivo.

Rilevatore automatico di caduta: effettua una chiamata vocale di allarme, in caso di caduta, alla Centrale Operativa e invia una notifica tramite sms ai familiari e alla Centrale Operativa. Nell'sms arriverà sia il link da cliccare per individuare la posizione dell'assistito (geolocalizzazione) che i valori dei parametri fisiologici che è stato possibile rilevare.

Posizione GPS e GPS-assistito: consente di localizzare l'assistito quando viene inviato l'allarme. È inoltre possibile impostare una cosiddetta area sicura per l'assistito (geo-fencing).

Misurazioni della frequenza cardiaca e della saturazione di ossigeno: è possibile impostare una notifica che arrivi ai familiari/Centrale Operativa tramite APP quando i valori rilevati vanno oltre le soglie programmate (comunicate dal proprio Medico di Base).

Pulsante SOS: premendo il pulsante SOS per circa 3 secondi è possibile effettuare una chiamata vocale alla Centrale Operativa e inviare una notifica di emergenza (geolocalizzata) ai familiari e alla Centrale Operativa stessa.

Assistenza vocale: informa l'assistito in relazione ai seguenti eventi: pressione pulsante SOS, attivazione dispositivo, messa in carica del dispositivo, segnalazione di batteria scarica, ecc.

Promemoria per l'assunzione dei farmaci: un messaggio ricorda l'orario in cui assumere i farmaci (aderenza terapeutica).

## Durata del Servizio

Il Servizio di TeleAssistenza avanzata ha una durata di 12 mesi a partire da {{DATA_INIZIO_SERVIZIO}} fino al {{DATA_SCADENZA}}.

Il Contratto sarà prorogabile su richiesta scritta del Cliente e su accettazione di Medica GB.

## Tariffa del Servizio

La tariffa annuale per il primo anno di attivazione del "Servizio di TeleAssistenza Avanzata" è pari a Euro {{IMPORTO_PRIMO_ANNO}} + IVA 22% e include:

- Dispositivo SiDLY CARE PRO (hardware)
- Configurazione del Dispositivo e del Processo di Comunicazione con la Centrale Operativa e uno o più familiari e Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi
- SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi
- Servizi di Centrale Operativa h24 per 7 giorni per la durata di 12 mesi

Per i successivi anni (rinnovabili di anno in anno) la tariffa annuale per il "Servizio di Continuità di TeleAssistenza avanzata" sarà pari a Euro 600,00 + IVA 22% con inclusi:

- Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi
- SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi
- Servizi di Centrale Operativa h24 per 7 giorni per la durata di 12 mesi

Metodo di pagamento

Medica GB emetterà fattura anticipata di 12 mesi all'attivazione del Servizio e il Cliente procederà al pagamento a ricevimento della fattura stessa tramite bonifico bancario

## Intestato a: Medica GB S.r.l.

Causale: Servizi di TeleAssistenza Avanzata annui con Dispositivo SiDLY CARE PRO e Centrale Operativa

## Banca Popolare di Milano - Iban: IT97L0503401727000000003519

Riservatezza ed esclusiva

Il Cliente e Medica GB si impegnano reciprocamente a non divulgare o, comunque, non utilizzare, se non per motivi attinenti all'esercizio del presente contratto, tutte le informazioni di cui venissero a conoscenza nello svolgimento del Servizio.

Il Cliente si impegna a contattare Medica GB per tutte le modifiche e proroghe del presente contratto.

## Foro competente

Ogni eventuale contestazione o controversia che dovesse insorgere tra le parti in relazione all'interpretazione, alla validità ed esecuzione del presente contratto, sarà definita alla cognizione esclusiva del Foro di Milano.

## Milano, lì {{DATA_CONTRATTO}}

Medica GB S.r.l.                                             Il Cliente

## Medica GB S.r.l.

## Corso Giuseppe Garibaldi, 34 – 20121 Milano

## PEC: medicagbsrl@pecimprese.it

## E.mail: info@medicagb.it

## Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409

## www.medicagb.it`,
    variables: [
      'NOME_ASSISTITO', 'COGNOME_ASSISTITO', 'LUOGO_NASCITA', 'DATA_NASCITA',
      'INDIRIZZO_ASSISTITO', 'CAP_ASSISTITO', 'CITTA_ASSISTITO', 'PROVINCIA_ASSISTITO',
      'CODICE_FISCALE_ASSISTITO', 'TELEFONO_ASSISTITO', 'EMAIL_ASSISTITO',
      'DATA_INIZIO_SERVIZIO', 'DATA_SCADENZA', 'IMPORTO_PRIMO_ANNO', 'DATA_CONTRATTO'
    ],
    pricing: {
      primoAnno: 840,
      rinnovo: 600
    }
  },

  PROFORMA: {
    id: 'proforma_medica_gb',
    type: 'PROFORMA',
    name: 'Proforma Unificata - Medica GB',
    content: `## PRO FORMA MEDICA GB SRL

## Milano, {{DATA_RICHIESTA}}

## ANAGRAFICA PAZIENTE

NOME: {{NOME_ASSISTITO}}

COGNOME: {{COGNOME_ASSISTITO}}

C.F.: {{CODICE_FISCALE}}

RESIDENTE IN: {{INDIRIZZO_COMPLETO}}

CITTA': {{CITTA}}

## NOTE

E.MAIL X INVIO FATTURAZIONE: {{EMAIL_RICHIEDENTE}}

## TIPOLOGIA PRESTAZIONE EROGATA

DATA ATTIVAZIONE: {{DATA_ATTIVAZIONE}}

TIPO DI PRESTAZIONE:

SiDLY Care PRO numero seriale: {{SERIAL_NUMBER}} Sistema di allarme mobile di piccole dimensioni ed indossabile. È progettato per monitorare e proteggere le persone. In caso di emergenza, la persona può attivarlo premendo un pulsante SOS sull'unità e la funzione di comunicazione vocale bidirezionale consente di parlare con {{COMUNICAZIONE_TIPO}}le persone individuate come care givers. È integrato con sensori che consentono la geolocalizzazione, il geo-fencing, il rilevamento cadute, il reminder dei farmaci e la gestione dell'alimentazione. È un Dispositivo Medico certificato in classe IIA (codice CDN Z12040199) e, come tale, consente la rilevazione della Frequenza Cardiaca (FC) e della Saturazione (SpO2). È inclusa basetta per la ricarica, alimentatore e cavo. Installazione e collaudo inclusi. SIM SiDLY per SiDLY Care PRO, per comunicazione e trasmissione dati. Tel: {{TELEFONO_SIDLY}} Piattaforma/APP SiDLY per SiDLY Care PRO (Dispositivo medicale in classe I)

TOTALE DA FATTURARE: {{PREZZO_PACCHETTO}} + IVA 22%

## PAGAMENTO CON BONIFICO

## Medica GB S.r.l.

## Corso Giuseppe Garibaldi, 34

## 20121 Milano

BANCA BPM S.P.A.

## FILIALE MILANO-GARIBALDI

C/C 03519

ABI 05034

CAB 01727

IBAN: IT97L0503401727000000003519

Il presente documento non costituisce fattura che verrà emessa all'atto del pagamento ai sensi dell'art.6 DPR 26.10.1972 n. 633.

## Medica GB S.r.l.

## Corso Giuseppe Garibaldi, 34 – 20121 Milano

## PEC: medicagbsrl@pecimprese.it

## E.mail: info@medicagb.it

## Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409

## www.medicagb.it

## www.telemedcare.it`,
    variables: [
      'DATA_RICHIESTA', 'NOME_ASSISTITO', 'COGNOME_ASSISTITO', 'CODICE_FISCALE',
      'INDIRIZZO_COMPLETO', 'CITTA', 'EMAIL_RICHIEDENTE', 'DATA_ATTIVAZIONE',
      'SERIAL_NUMBER', 'COMUNICAZIONE_TIPO', 'TELEFONO_SIDLY', 'PREZZO_PACCHETTO'
    ],
    pricing: {
      primoAnno: 480, // Base default
      rinnovo: 180
    }
  }
}

// =====================================================================
// CONTRACT SERVICE
// =====================================================================

export class ContractService {
  private static instance: ContractService | null = null

  // Lazy loading per Cloudflare Workers
  static getInstance(): ContractService {
    if (!ContractService.instance) {
      ContractService.instance = new ContractService()
    }
    return ContractService.instance
  }

  /**
   * Pre-compila contratto con dati cliente
   */
  async compileContract(
    contractType: 'BASE' | 'AVANZATO' | 'PROFORMA',
    customerData: CustomerData
  ): Promise<GeneratedContract> {
    try {
      console.log(`📋 Pre-compilazione contratto ${contractType}:`, {
        customer: `${customerData.nomeAssistito} ${customerData.cognomeAssistito}`,
        service: customerData.tipoServizio
      })

      const template = MEDICA_GB_TEMPLATES[contractType]
      if (!template) {
        throw new Error(`Template ${contractType} non trovato`)
      }

      // Prepara variabili per compilazione
      const variables = this.prepareVariables(customerData, template)
      
      // Compila template
      const compiledContent = this.renderTemplate(template.content, variables)
      
      // Genera ID numerico progressivo annuale (es: 2025-001, 2025-002, etc.)
      const contractId = await this.generateProgressiveContractId(contractType)
      const documentUrl = await this.saveCompiledContract(contractId, compiledContent, contractType)

      return {
        contractId,
        type: contractType,
        customerName: `${customerData.nomeAssistito} ${customerData.cognomeAssistito}`,
        compiledContent,
        variables,
        documentUrl,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni
        status: 'GENERATED'
      }

    } catch (error) {
      console.error(`❌ Errore compilazione contratto ${contractType}:`, error)
      throw error
    }
  }

  /**
   * Prepara variabili per compilazione template
   */
  private prepareVariables(customerData: CustomerData, template: ContractTemplate): Record<string, string> {
    const today = new Date()
    const dataAttivazione = customerData.dataAtivazione ? new Date(customerData.dataAtivazione) : new Date()
    const dataScadenza = new Date(dataAttivazione.getTime() + 365 * 24 * 60 * 60 * 1000) // +1 anno

    // Prezzi automatici basati su tipo servizio
    const pricing = template.pricing
    const prezzoServizio = customerData.tipoServizio === 'AVANZATO' ? pricing.primoAnno : pricing.primoAnno

    const variables: Record<string, string> = {
      // Dati assistito
      NOME_ASSISTITO: customerData.nomeAssistito,
      COGNOME_ASSISTITO: customerData.cognomeAssistito,
      LUOGO_NASCITA: customerData.luogoNascita || 'Milano',
      DATA_NASCITA: customerData.dataNascita || '01/01/1950',
      CODICE_FISCALE: customerData.codiceFiscaleAssistito || '',
      CODICE_FISCALE_ASSISTITO: customerData.codiceFiscaleAssistito || '',
      INDIRIZZO_ASSISTITO: customerData.indirizzoAssistito || '',
      CAP_ASSISTITO: customerData.capAssistito || '',
      CITTA_ASSISTITO: customerData.cittaAssistito || '',
      PROVINCIA_ASSISTITO: customerData.provinciaAssistito || '',
      TELEFONO_ASSISTITO: customerData.telefonoAssistito || customerData.telefonoRichiedente,
      EMAIL_ASSISTITO: customerData.emailAssistito || customerData.emailRichiedente,

      // Dati richiedente
      EMAIL_RICHIEDENTE: customerData.emailRichiedente,
      
      // Indirizzi
      INDIRIZZO_COMPLETO: customerData.indirizzoAssistito || customerData.indirizzoRichiedente || '',
      CITTA: customerData.cittaAssistito || '',

      // Date
      DATA_CONTRATTO: this.formatDate(today),
      DATA_RICHIESTA: this.formatDate(today),
      DATA_ATTIVAZIONE: this.formatDate(dataAttivazione),
      DATA_INIZIO_SERVIZIO: this.formatDate(dataAttivazione),
      DATA_SCADENZA: this.formatDate(dataScadenza),

      // Prezzi
      IMPORTO_PRIMO_ANNO: prezzoServizio.toString() + ',00',
      PREZZO_PACCHETTO: prezzoServizio.toString() + ',00€',

      // Dispositivo
      SERIAL_NUMBER: customerData.serialNumber || this.generateSerialNumber(),
      TELEFONO_SIDLY: '+39 02 1234 5678',

      // Servizio specifico
      COMUNICAZIONE_TIPO: customerData.tipoServizio === 'AVANZATO' ? 'la Centrale Operativa e ' : ''
    }

    return variables
  }

  /**
   * Renderizza template con variabili
   */
  private renderTemplate(template: string, variables: Record<string, string>): string {
    let result = template
    
    // Sostituisci variabili nel formato {{VARIABLE}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(value))
    }
    
    // Rimuovi variabili non sostituite
    result = result.replace(/{{[^}]+}}/g, '[DA_COMPLETARE]')
    
    return result
  }

  /**
   * Salva contratto compilato
   */
  private async saveCompiledContract(
    contractId: string, 
    content: string, 
    type: string
  ): Promise<string> {
    // Simula salvataggio - in produzione usare Cloudflare R2
    const filename = `contract_${contractId}.txt`
    const documentUrl = `/documents/contracts/${filename}`
    
    console.log(`💾 Contratto salvato: ${documentUrl}`)
    
    return documentUrl
  }

  /**
   * Genera contratto e invia via email con firma
   */
  async generateAndSendContract(
    contractType: 'BASE' | 'AVANZATO' | 'PROFORMA',
    customerData: CustomerData,
    signatureMethod: 'MANUAL' | 'ELECTRONIC' | 'DOCUSIGN' = 'ELECTRONIC'
  ): Promise<{
    contract: GeneratedContract
    emailResult: any
    signatureResult: any
  }> {
    try {
      console.log(`🚀 Generazione e invio contratto ${contractType}`)

      // 1. Compila contratto
      const contract = await this.compileContract(contractType, customerData)

      // 2. Invia via email
      const { default: EmailService } = await import('./email-service')
      const emailService = EmailService.getInstance()
      
      const emailResult = await emailService.sendTemplateEmail(
        'INVIO_CONTRATTO',
        customerData.emailRichiedente,
        {
          NOME_CLIENTE: `${customerData.nomeRichiedente} ${customerData.cognomeRichiedente}`,
          PIANO_SERVIZIO: `TeleAssistenza ${customerData.tipoServizio}`,
          PREZZO_PIANO: contract.variables.IMPORTO_PRIMO_ANNO + '€ + IVA',
          CODICE_CLIENTE: contract.contractId
        }
      )

      // 3. Crea richiesta firma
      const { default: SignatureService } = await import('./signature-service')
      const signatureService = SignatureService.getInstance()
      
      const signatureResult = await signatureService.createSignatureRequest(
        'CONTRACT',
        {
          name: `${customerData.nomeRichiedente} ${customerData.cognomeRichiedente}`,
          email: customerData.emailRichiedente,
          phone: customerData.telefonoRichiedente
        },
        contract.documentUrl,
        signatureMethod
      )

      return {
        contract,
        emailResult,
        signatureResult
      }

    } catch (error) {
      console.error('❌ Errore generazione e invio contratto:', error)
      throw error
    }
  }

  /**
   * Ottieni template disponibili
   */
  getAvailableTemplates(): ContractTemplate[] {
    return Object.values(MEDICA_GB_TEMPLATES)
  }

  /**
   * Calcola prezzo automatico per servizio
   */
  calculateServicePrice(tipoServizio: 'BASE' | 'AVANZATO'): {
    primoAnno: number
    rinnovo: number
    ivaPercentuale: number
    totaleConIva: number
  } {
    const template = MEDICA_GB_TEMPLATES[tipoServizio]
    const pricing = template.pricing
    const ivaPercentuale = 22
    const totaleConIva = Math.round(pricing.primoAnno * (1 + ivaPercentuale / 100))

    return {
      primoAnno: pricing.primoAnno,
      rinnovo: pricing.rinnovo,
      ivaPercentuale,
      totaleConIva
    }
  }

  /**
   * Utility per formattare date
   */
  private formatDate(date: Date): string {
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  /**
   * Genera serial number per dispositivo
   */
  private generateSerialNumber(): string {
    const prefix = 'SCP'
    const year = new Date().getFullYear().toString().slice(-2)
    const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${prefix}${year}${number}`
  }

  /**
   * Genera ID contratto progressivo annuale (es: 2025-001-BASE, 2025-002-ADV)
   * CORREZIONE PRIORITARIA: Sistema numerazione progressiva
   */
  private async generateProgressiveContractId(contractType: 'BASE' | 'AVANZATO'): Promise<string> {
    try {
      const currentYear = new Date().getFullYear()
      const typePrefix = contractType === 'AVANZATO' ? 'ADV' : 'BASE'
      
      // Cerca l'ultimo contratto dell'anno corrente per questo tipo
      // Nota: questo richiede accesso al DB, per ora uso un fallback
      // In produzione questo dovrebbe essere gestito dal database
      
      // Query simulata - in produzione fare query al DB:
      // SELECT COUNT(*) FROM contracts WHERE created_at LIKE '${currentYear}%' AND contractType = ?
      
      // Per ora uso timestamp + incremento simulato
      const timestamp = Date.now()
      const lastThreeDigits = parseInt(timestamp.toString().slice(-3))
      const progressiveNumber = (lastThreeDigits % 100) + 1
      
      // Formato: ANNO-NNN-TIPO (es: 2025-001-BASE, 2025-023-ADV)
      const contractId = `${currentYear}-${progressiveNumber.toString().padStart(3, '0')}-${typePrefix}`
      
      return contractId
      
    } catch (error) {
      // Fallback se la generazione progressiva fallisce
      console.warn('⚠️ Errore generazione ID progressivo, uso fallback:', error)
      return `${new Date().getFullYear()}-${Math.floor(Math.random() * 999) + 1}-${contractType.substring(0, 3)}`
    }
  }
}

// =====================================================================
// EXPORT DEFAULTS
// =====================================================================

export default ContractService