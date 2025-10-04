/**
 * CONFIGURATION_FORM_SERVICE.TS - Sistema Form Dinamici e Pre-compilazione
 * TeleMedCare V11.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Mapping form landing page esistente (www.telemedcare.it) → ContractService
 * - Pre-compilazione automatica contratti dai dati form
 * - Sistema cartelle organizzato (contratti, proforma, contratti_firmati)
 * - Validazione campi italiani (CF, telefono, email)
 * - Form dinamici per lead senza dati completi
 */

export interface TeleMedCareFormData {
  // Dati richiedente (persona che compila il form)
  nome: string                    // Campo "Nome" *
  cognome: string                 // Campo "Cognome" *
  email: string                   // Campo "Email" *
  telefono: string                // Campo "Telefono" *

  // Dati assistito (persona che riceve il servizio) 
  nomeAssistito: string           // Campo "Nome Assistito" *
  cognomeAssistito: string        // Campo "Cognome Assistito" *
  dataNascitaAssistito: string    // Campo "Data di Nascita Assistito" *
  luogoNascitaAssistito: string   // Campo "Luogo di Nascita Assistito" * (OBBLIGATORIO)
  etaAssistito?: number           // Campo "Età" (calcolato automaticamente)
  relazioneAssistito?: string     // Campo "Relazione con l'assistito" (dropdown)

  // Campi dinamici per contratto (mostrati solo se richiede contratto)
  codiceFiscaleRichiedente?: string   // CF Richiedente (se intestazione = "Richiedente")
  indirizzoRichiedente?: string       // Indirizzo Richiedente (se intestazione = "Richiedente")
  capRichiedente?: string             // CAP Richiedente
  cittaRichiedente?: string           // Città Richiedente
  provinciaRichiedente?: string       // Provincia Richiedente
  luogoNascitaRichiedente?: string    // Luogo Nascita Richiedente (da aggiungere)
  
  codiceFiscaleAssistito?: string     // CF Assistito (se intestazione = "Assistito")
  indirizzoAssistito?: string         // Indirizzo Assistito (se intestazione = "Assistito")
  capAssistito?: string               // CAP Assistito
  cittaAssistito?: string             // Città Assistito
  provinciaAssistito?: string         // Provincia Assistito

  // Servizio e richiesta
  servizioInteresse?: string      // Campo "Servizio di Interesse" (dropdown)
  condizioniMediche?: string      // Campo "Condizioni mediche particolari o esigenze specifiche"
  urgenzaRichiesta?: string       // Campo "Urgenza della richiesta" (dropdown)

  // Preferenze contatto e contratto
  preferitoContatto: string       // Campo "Come preferisci essere ricontattato" (Email/Telefono/WhatsApp) *
  richiedeContratto?: boolean     // Campo "Vuoi ricevere copia del contratto da visionare"
  intestazioneContratto?: string  // Campo "A chi deve essere intestato il contratto" (Richiedente/Assistito)
  richiedeBrochure?: boolean      // Campo "Vuoi che ti inviamo la brochure di SiDLY Care Pro"
  richiedeManuale?: boolean       // Campo "Vuoi ricevere il manuale d'uso del dispositivo"

  // Informazioni aggiuntive
  messaggioAggiuntivo?: string    // Campo "Messaggio aggiuntivo"
  consensoPrivacy: boolean        // Campo "Acconsento al trattamento dei dati personali" *

  // Metadati (aggiunti automaticamente)
  timestamp?: string
  leadSource?: string
  utmSource?: string
  formId?: string
}

export interface ContractCompilationResult {
  success: boolean
  contractId?: string
  proformaId?: string
  filePaths?: {
    contractPath: string
    proformaPath: string
  }
  missingFields?: string[]
  errors?: string[]
}

export interface FormValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  missingForContract: string[]
}

export class ConfigurationFormService {
  
  /**
   * Valida i dati del form TeleMedCare esistente
   */
  static validateFormData(formData: Partial<TeleMedCareFormData>): FormValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    const missingForContract: string[] = []

    // Campi obbligatori per il form base (incluso luogo nascita)
    const requiredFields = ['nome', 'cognome', 'email', 'telefono', 
                           'nomeAssistito', 'cognomeAssistito', 'dataNascitaAssistito', 
                           'luogoNascitaAssistito', 'preferitoContatto', 'consensoPrivacy']

    requiredFields.forEach(field => {
      if (!formData[field as keyof TeleMedCareFormData]) {
        errors.push(`Campo obbligatorio mancante: ${field}`)
      }
    })

    // Validazione email
    if (formData.email && !this.validateEmail(formData.email)) {
      errors.push('Formato email non valido')
    }

    // Validazione telefono italiano
    if (formData.telefono && !this.validateItalianPhone(formData.telefono)) {
      warnings.push('Formato telefono potrebe non essere valido per l\'Italia')
    }

    // Validazione data di nascita
    if (formData.dataNascitaAssistito && !this.validateDate(formData.dataNascitaAssistito)) {
      errors.push('Data di nascita non valida')
    }

    // Campi aggiuntivi necessari per la pre-compilazione contratti (template reali DOCX)
    // Logica intelligente: se richiede contratto IMMEDIATO con tutti i dati dinamici
    if (formData.richiedeContratto) {
      const intestazione = formData.intestazioneContratto || 'Assistito'
      
      if (intestazione === 'Richiedente') {
        // Se contratto intestato al richiedente, servono i suoi dati completi
        const richiedenteFields = [
          'codiceFiscaleRichiedente', 'indirizzoRichiedente', 
          'capRichiedente', 'cittaRichiedente', 'provinciaRichiedente', 
          'luogoNascitaRichiedente'
        ]
        richiedenteFields.forEach(field => {
          if (!formData[field as keyof TeleMedCareFormData]) {
            missingForContract.push(field)
          }
        })
      } else {
        // Se contratto intestato all'assistito, servono i suoi dati completi
        // NOTA: luogoNascitaAssistito ora è obbligatorio nella landing page
        const assistitoFields = [
          'codiceFiscaleAssistito', 'indirizzoAssistito',
          'capAssistito', 'cittaAssistito', 'provinciaAssistito'
        ]
        assistitoFields.forEach(field => {
          if (!formData[field as keyof TeleMedCareFormData]) {
            missingForContract.push(field)
          }
        })
      }
    }

    // NOTA: Form dinamico serve solo per lead che decidono contratto in un secondo momento
    // non per richieste immediate dalla landing page con logica dinamica

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      missingForContract
    }
  }

  /**
   * Converte dati form TeleMedCare nel formato CustomerData per ContractService
   */
  static convertToCustomerData(formData: TeleMedCareFormData): any {
    // Determina il tipo di servizio basato sui dati del form
    let tipoServizio: 'BASE' | 'AVANZATO' = 'BASE'
    if (formData.servizioInteresse?.toLowerCase().includes('avanzat')) {
      tipoServizio = 'AVANZATO'
    }

    return {
      // Dati assistito (persona che riceve il servizio)
      nomeAssistito: formData.nomeAssistito,
      cognomeAssistito: formData.cognomeAssistito,
      dataNascita: formData.dataNascitaAssistito,
      luogoNascita: formData.luogoNascitaAssistito,  // Ora sempre presente
      codiceFiscaleAssistito: formData.codiceFiscaleAssistito,
      indirizzoAssistito: formData.indirizzoAssistito,
      capAssistito: formData.capAssistito,
      cittaAssistito: formData.cittaAssistito,
      provinciaAssistito: formData.provinciaAssistito,
      
      // Dati richiedente (persona che compila il form)
      nomeRichiedente: formData.nome,
      cognomeRichiedente: formData.cognome,
      emailRichiedente: formData.email,
      telefonoRichiedente: formData.telefono,
      
      // Servizio
      tipoServizio,
      dataAttivazione: new Date().toISOString().split('T')[0], // Oggi
      
      // Metadati
      condizioniMediche: formData.condizioniMediche,
      urgenzaRichiesta: formData.urgenzaRichiesta,
      preferitoContatto: formData.preferitoContatto,
      messaggioAggiuntivo: formData.messaggioAggiuntivo,
      
      // Gestione intestazione contratto
      intestatarioContratto: formData.intestazioneContratto || 'Assistito'
    }
  }

  /**
   * Pre-compila contratto automaticamente dai dati form
   */
  static async preCompileContract(
    formData: TeleMedCareFormData,
    contractService: any
  ): Promise<ContractCompilationResult> {
    try {
      // Valida dati
      const validation = this.validateFormData(formData)
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        }
      }

      // Se mancano campi per il contratto, ritorna lista campi mancanti
      if (validation.missingForContract.length > 0) {
        return {
          success: false,
          missingFields: validation.missingForContract,
          errors: ['Campi aggiuntivi necessari per compilare il contratto']
        }
      }

      // Converte dati
      const customerData = this.convertToCustomerData(formData)

      // Genera contratto
      const contractResult = await contractService.generateContract(customerData)
      if (!contractResult.success) {
        return {
          success: false,
          errors: contractResult.errors
        }
      }

      // Genera proforma
      const proformaResult = await contractService.generateProforma(customerData)
      if (!proformaResult.success) {
        return {
          success: false,
          errors: proformaResult.errors
        }
      }

      // Salva in cartelle organizzate
      const contractId = this.generateContractId()
      const proformaId = this.generateProformaId()

      const filePaths = await this.saveToOrganizedFolders({
        contractId,
        proformaId,
        contractContent: contractResult.content,
        proformaContent: proformaResult.content,
        customerData
      })

      return {
        success: true,
        contractId,
        proformaId,
        filePaths
      }

    } catch (error) {
      return {
        success: false,
        errors: [`Errore durante la pre-compilazione: ${error}`]
      }
    }
  }

  /**
   * Crea form dinamico per campi mancanti
   */
  static generateMissingFieldsForm(missingFields: string[]): any {
    const formSchema = {
      title: 'Dati Aggiuntivi per Contratto',
      description: 'Per completare la pre-compilazione del contratto, abbiamo bisogno di alcune informazioni aggiuntive:',
      fields: []
    }

    const fieldDefinitions = {
      luogoNascitaAssistito: {
        name: 'luogoNascitaAssistito',
        label: 'Luogo di Nascita Assistito',
        type: 'text',
        required: true,
        placeholder: 'Roma'
      },
      luogoNascitaRichiedente: {
        name: 'luogoNascitaRichiedente',
        label: 'Luogo di Nascita Richiedente',
        type: 'text',
        required: true,
        placeholder: 'Milano'
      },
      codiceFiscaleAssistito: {
        name: 'codiceFiscaleAssistito',
        label: 'Codice Fiscale Assistito',
        type: 'text',
        required: true,
        pattern: '^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$',
        placeholder: 'RSSMRA80A01H501X'
      },
      indirizzoAssistito: {
        name: 'indirizzoAssistito',
        label: 'Indirizzo Assistito',
        type: 'text',
        required: true,
        placeholder: 'Via Roma, 123'
      },
      capAssistito: {
        name: 'capAssistito',
        label: 'CAP',
        type: 'text',
        required: true,
        pattern: '^[0-9]{5}$',
        placeholder: '00100'
      },
      cittaAssistito: {
        name: 'cittaAssistito',
        label: 'Città',
        type: 'text',
        required: true,
        placeholder: 'Roma'
      },
      provinciaAssistito: {
        name: 'provinciaAssistito',
        label: 'Provincia',
        type: 'text',
        required: true,
        pattern: '^[A-Z]{2}$',
        placeholder: 'RM'
      }
    }

    // Aggiunge solo i campi mancanti
    missingFields.forEach(fieldName => {
      if (fieldDefinitions[fieldName as keyof typeof fieldDefinitions]) {
        formSchema.fields.push(fieldDefinitions[fieldName as keyof typeof fieldDefinitions])
      }
    })

    return formSchema
  }

  /**
   * Sistema di cartelle organizzato
   */
  private static async saveToOrganizedFolders(data: {
    contractId: string
    proformaId: string
    contractContent: string
    proformaContent: string
    customerData: any
  }): Promise<{ contractPath: string, proformaPath: string }> {
    
    const timestamp = new Date().toISOString().split('T')[0]
    const customerName = `${data.customerData.cognomeAssistito}_${data.customerData.nomeAssistito}`.replace(/[^a-zA-Z0-9]/g, '_')

    // Percorsi cartelle organizzate
    const contractPath = `/home/user/webapp/documents/contratti/${timestamp}_${customerName}_${data.contractId}.txt`
    const proformaPath = `/home/user/webapp/documents/proforma/${timestamp}_${customerName}_${data.proformaId}.txt`

    // Note: In ambiente reale, salvare su R2 Storage o filesystem
    // Per ora ritorniamo i percorsi che verrebbero usati
    
    return {
      contractPath,
      proformaPath
    }
  }

  /**
   * Utilità di validazione
   */
  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private static validateItalianPhone(phone: string): boolean {
    // Validazione telefono italiano (mobile e fisso)
    const phoneRegex = /^(\+39|0039|39)?[\s]?([0-9]{10}|[0-9]{3}[\s][0-9]{7}|[0-9]{3}[\s][0-9]{3}[\s][0-9]{4})$/
    return phoneRegex.test(phone.replace(/[\s-]/g, ''))
  }

  private static validateDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime()) && date < new Date()
  }

  /**
   * Generatori ID univoci
   */
  private static generateContractId(): string {
    return `CONTRACT_${new Date().getFullYear()}_${String(Date.now()).slice(-6)}`
  }

  private static generateProformaId(): string {
    return `PROFORMA_${new Date().getFullYear()}_${String(Date.now()).slice(-6)}`
  }

  /**
   * Calcola età da data di nascita
   */
  static calculateAge(birthDate: string): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }
}