/**
 * TeleMedCare V11.0 Functional Test Service
 * Test completo del flusso automatizzato Lead → Assistito
 */

import { DataManagementService } from './data-management-service'

export interface TestResult {
  success: boolean
  phase: string
  message: string
  data?: any
  error?: string
  timestamp: string
}

export interface FullSystemTest {
  test_id: string
  start_time: string
  end_time?: string
  total_duration?: number
  phases_completed: number
  phases_total: number
  success: boolean
  results: TestResult[]
  summary: {
    lead_created: boolean
    emails_sent: number
    payment_simulated: boolean
    assistito_converted: boolean
    workflow_completed: boolean
    forms_processed: boolean
  }
}

export class FunctionalTestService {
  
  constructor(private db: D1Database) {}

  /**
   * Esegue test completo del sistema end-to-end
   */
  async runFullSystemTest(): Promise<FullSystemTest> {
    const testId = `TEST_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const startTime = new Date().toISOString()
    
    const test: FullSystemTest = {
      test_id: testId,
      start_time: startTime,
      phases_completed: 0,
      phases_total: 12,
      success: false,
      results: [],
      summary: {
        lead_created: false,
        emails_sent: 0,
        payment_simulated: false,
        assistito_converted: false,
        workflow_completed: false,
        forms_processed: false
      }
    }

    try {
      // FASE 1: Creazione Lead automatica
      const leadResult = await this.simulateLeadCreation(testId)
      test.results.push(leadResult)
      if (leadResult.success) {
        test.phases_completed++
        test.summary.lead_created = true
      }

      // FASE 2: Invio Email Notifica Info
      if (leadResult.success) {
        const notifyResult = await this.simulateEmailSend('NOTIFICA_INFO', leadResult.data.leadId, leadResult.data.email)
        test.results.push(notifyResult)
        if (notifyResult.success) {
          test.phases_completed++
          test.summary.emails_sent++
        }
      }

      // FASE 3: Invio Documenti Informativi
      if (test.summary.lead_created) {
        const docsResult = await this.simulateEmailSend('DOCUMENTI_INFORMATIVI', leadResult.data.leadId, leadResult.data.email)
        test.results.push(docsResult)
        if (docsResult.success) {
          test.phases_completed++
          test.summary.emails_sent++
        }
      }

      // FASE 4: Invio Contratto per firma
      if (test.summary.lead_created) {
        const contractResult = await this.simulateEmailSend('INVIO_CONTRATTO', leadResult.data.leadId, leadResult.data.email)
        test.results.push(contractResult)
        if (contractResult.success) {
          test.phases_completed++
          test.summary.emails_sent++
        }
      }

      // FASE 5: Conversione Lead → Assistito
      if (test.summary.lead_created) {
        const conversionResult = await this.simulateLeadConversion(leadResult.data.leadId)
        test.results.push(conversionResult)
        if (conversionResult.success) {
          test.phases_completed++
          test.summary.assistito_converted = true
        }
      }

      // FASE 6: Invio Proforma
      let assistitoId = null
      if (test.summary.assistito_converted) {
        const proformaResult = await this.simulateEmailSend('INVIO_PROFORMA', 
          test.results.find(r => r.phase === 'LEAD_CONVERSION')?.data?.assistitoId, 
          leadResult.data.email)
        test.results.push(proformaResult)
        if (proformaResult.success) {
          test.phases_completed++
          test.summary.emails_sent++
          assistitoId = test.results.find(r => r.phase === 'LEAD_CONVERSION')?.data?.assistitoId
        }
      }

      // FASE 7: Simulazione Pagamento
      if (assistitoId) {
        const paymentResult = await this.simulatePayment(assistitoId)
        test.results.push(paymentResult)
        if (paymentResult.success) {
          test.phases_completed++
          test.summary.payment_simulated = true
        }
      }

      // FASE 8: Email Benvenuto con Form
      if (test.summary.payment_simulated && assistitoId) {
        const welcomeResult = await this.simulateEmailSend('EMAIL_BENVENUTO', assistitoId, leadResult.data.email)
        test.results.push(welcomeResult)
        if (welcomeResult.success) {
          test.phases_completed++
          test.summary.emails_sent++
        }
      }

      // FASE 9: Simulazione Compilazione Form
      if (assistitoId) {
        const formResult = await this.simulateFormConfiguration(assistitoId)
        test.results.push(formResult)
        if (formResult.success) {
          test.phases_completed++
          test.summary.forms_processed = true
        }
      }

      // FASE 10: Email Conferma Attivazione
      if (test.summary.forms_processed && assistitoId) {
        const confirmResult = await this.simulateEmailSend('EMAIL_CONFERMA', assistitoId, leadResult.data.email)
        test.results.push(confirmResult)
        if (confirmResult.success) {
          test.phases_completed++
          test.summary.emails_sent++
        }
      }

      // FASE 11: Simulazione Spedizione
      if (assistitoId) {
        const shipmentResult = await this.simulateShipment(assistitoId)
        test.results.push(shipmentResult)
        if (shipmentResult.success) {
          test.phases_completed++
        }
      }

      // FASE 12: Verifica Workflow Completo
      if (assistitoId) {
        const workflowResult = await this.verifyWorkflowCompletion(assistitoId)
        test.results.push(workflowResult)
        if (workflowResult.success) {
          test.phases_completed++
          test.summary.workflow_completed = true
        }
      }

      // Calcola risultati finali
      test.end_time = new Date().toISOString()
      test.total_duration = new Date(test.end_time).getTime() - new Date(test.start_time).getTime()
      test.success = test.phases_completed >= 10 // Almeno 10/12 fasi completate

      // Log del test
      await this.logTestResult(test)

    } catch (error) {
      test.results.push({
        success: false,
        phase: 'SYSTEM_ERROR',
        message: 'Errore critico durante il test',
        error: error.message,
        timestamp: new Date().toISOString()
      })
      test.end_time = new Date().toISOString()
      test.total_duration = new Date(test.end_time).getTime() - new Date(test.start_time).getTime()
    }

    return test
  }

  /**
   * Simula creazione automatica di un lead
   */
  private async simulateLeadCreation(testId: string): Promise<TestResult> {
    try {
      const leadData = this.generateTestLeadData(testId)
      
      // Generate unique ID for lead (required for foreign key constraints)
      const leadId = `LEAD_TEST_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      // Simula inserimento nel database
      const result = await this.db.prepare(`
        INSERT INTO leads (
          id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
          nomeAssistito, cognomeAssistito, dataNascitaAssistito, cfRichiedente, cfAssistito,
          indirizzoRichiedente, indirizzoAssistito, pacchetto, status, 
          vuoleContratto, note, gdprConsent, consensoPrivacy, sistemaVersione
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        leadId,
        leadData.nomeRichiedente, leadData.cognomeRichiedente, leadData.emailRichiedente, leadData.telefonoRichiedente,
        leadData.nomeAssistito, leadData.cognomeAssistito, leadData.dataNascitaAssistito, 
        leadData.cfRichiedente, leadData.cfAssistito, leadData.indirizzoRichiedente, 
        leadData.indirizzoAssistito, leadData.pacchetto, 'NEW', 'Si', 
        `Lead test automatico ${testId}`, 'on', 'on', 'V11.0'
      ).run()

      return {
        success: true,
        phase: 'LEAD_CREATION',
        message: `Lead creato con successo - ID: ${leadId}`,
        data: { leadId, email: leadData.emailRichiedente, ...leadData },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        phase: 'LEAD_CREATION',
        message: 'Errore nella creazione del lead',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Simula invio email automatico
   */
  private async simulateEmailSend(type: string, recipientId: number | string, email: string): Promise<TestResult> {
    try {
      // Simula processo di invio email
      await this.sleep(100) // Simula latenza invio

      // Log email nel database (usa struttura corretta tabella)
      await this.db.prepare(`
        INSERT INTO email_logs (leadId, recipientEmail, emailType, status, sentAt)
        VALUES (?, ?, ?, ?, ?)
      `).bind(String(recipientId || 'TEST'), email, type, 'SENT', new Date().toISOString()).run()

      // Log sistema
      const dataManagement = new DataManagementService(this.db)
      await dataManagement.addSystemLog(
        'EMAIL_SENT',
        'FunctionalTestService',
        `Email ${type} inviata durante test a ${email}`,
        { type, recipientId, testMode: true },
        'INFO'
      )

      return {
        success: true,
        phase: `EMAIL_${type}`,
        message: `Email ${type} inviata con successo a ${email}`,
        data: { type, recipientId, email },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        phase: `EMAIL_${type}`,
        message: `Errore invio email ${type}`,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Simula conversione lead in assistito
   */
  private async simulateLeadConversion(leadId: number | string): Promise<TestResult> {
    try {
      // First, get the actual lead from database using the ID we got from creation
      const leadFromDb = await this.db.prepare(`
        SELECT * FROM leads WHERE id = ?
      `).bind(leadId).first();

      if (!leadFromDb) {
        return {
          success: false,
          phase: 'LEAD_CONVERSION',
          message: `Lead ${leadId} non trovato nel database`,
          error: 'Lead not found for conversion',
          timestamp: new Date().toISOString()
        }
      }

      // Generate unique codice assistito
      const codiceAssistito = `ASS_TEST_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      // Use the actual leadId from the real lead (string format)
      
      const assistitoResult = await this.db.prepare(`
        INSERT INTO assistiti (
          lead_id, codice_assistito, nome, cognome, email, telefono, data_nascita,
          codice_fiscale, indirizzo, citta, cap, provincia, tipo_contratto, 
          numero_contratto, valore_contratto, data_conversione, stato
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        leadId,
        codiceAssistito,
        (leadFromDb as any).nomeRichiedente || 'Test',
        (leadFromDb as any).cognomeRichiedente || 'User',
        (leadFromDb as any).emailRichiedente,
        (leadFromDb as any).telefonoRichiedente,
        (leadFromDb as any).dataNascitaAssistito || '1970-01-01',
        (leadFromDb as any).cfRichiedente || 'TSTusr70A01F205X',
        'Via Test 123',
        'Milano',
        '20100',
        'MI',
        'BASE',
        `CTR_TEST_${Date.now()}`,
        480.00,
        new Date().toISOString(),
        'ATTIVO'
      ).run();

      const assistitoId = assistitoResult.meta.last_row_id as number;

      // Update lead status to converted
      await this.db.prepare(`
        UPDATE leads SET status = 'CONVERTED' WHERE id = ?
      `).bind(leadId).run();

      // Initialize workflow for assistito
      await this.db.prepare(`
        INSERT INTO workflow_tracking (assistito_id, fase, stato, data_inizio, data_completamento, note)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        assistitoId,
        'PROFORMA_INVIATA',
        'COMPLETATO',
        new Date().toISOString(),
        new Date().toISOString(),
        'Test automatico - conversione lead'
      ).run();

      return {
        success: true,
        phase: 'LEAD_CONVERSION',
        message: `Lead ${leadId} convertito in assistito ${assistitoId} (${codiceAssistito})`,
        data: { leadId, assistitoId, codiceAssistito },
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        phase: 'LEAD_CONVERSION',
        message: 'Errore durante conversione lead',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Simula processo di pagamento
   */
  private async simulatePayment(assistitoId: number): Promise<TestResult> {
    try {
      await this.sleep(200) // Simula latenza pagamento
      
      const dataManagement = new DataManagementService(this.db)
      await dataManagement.updateWorkflowPhase(
        assistitoId, 
        'PAGAMENTO_RICEVUTO', 
        'COMPLETATO', 
        'Pagamento test simulato automaticamente'
      )

      return {
        success: true,
        phase: 'PAYMENT_SIMULATION',
        message: `Pagamento simulato per assistito ${assistitoId}`,
        data: { assistitoId, amount: 480.00, method: 'TEST_SIMULATION' },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        phase: 'PAYMENT_SIMULATION',
        message: 'Errore simulazione pagamento',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Simula compilazione form configurazione
   */
  private async simulateFormConfiguration(assistitoId: number): Promise<TestResult> {
    try {
      await this.sleep(150) // Simula tempo compilazione

      const configData = {
        orari_preferiti: "09:00-18:00",
        medico_curante: "Dr. Test Medico",
        contatto_emergenza: "3331234567",
        allergie: "Nessuna allergia nota",
        terapie: "Terapia test simulata",
        note_aggiuntive: "Form compilato durante test automatico"
      }

      await this.db.prepare(`
        INSERT INTO form_configurazioni (assistito_id, tipo_form, dati_form, stato, data_compilazione, note)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        assistitoId,
        'CONFIGURAZIONE_INIZIALE',
        JSON.stringify(configData),
        'COMPILATO',
        new Date().toISOString(),
        'Form test automatico'
      ).run()

      const dataManagement = new DataManagementService(this.db)
      await dataManagement.updateWorkflowPhase(
        assistitoId,
        'CONFIGURAZIONE_RICEVUTA',
        'COMPLETATO',
        'Configurazione ricevuta durante test automatico'
      )

      return {
        success: true,
        phase: 'FORM_CONFIGURATION',
        message: `Form configurazione compilato per assistito ${assistitoId}`,
        data: { assistitoId, configData },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        phase: 'FORM_CONFIGURATION',
        message: 'Errore simulazione form configurazione',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Simula processo di spedizione
   */
  private async simulateShipment(assistitoId: number): Promise<TestResult> {
    try {
      await this.sleep(100) // Simula processo spedizione

      const dataManagement = new DataManagementService(this.db)
      await dataManagement.updateWorkflowPhase(
        assistitoId,
        'SPEDIZIONE_COMPLETATA',
        'COMPLETATO',
        'Spedizione simulata - Corriere: TEST EXPRESS, Tracking: TEST123456789'
      )

      return {
        success: true,
        phase: 'SHIPMENT_SIMULATION',
        message: `Spedizione completata per assistito ${assistitoId}`,
        data: { assistitoId, courier: 'TEST EXPRESS', tracking: 'TEST123456789' },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        phase: 'SHIPMENT_SIMULATION',
        message: 'Errore simulazione spedizione',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Verifica completamento workflow
   */
  private async verifyWorkflowCompletion(assistitoId: number): Promise<TestResult> {
    try {
      const dataManagement = new DataManagementService(this.db)
      const workflow = await dataManagement.getWorkflowByAssistitoId(assistitoId)
      
      const completedPhases = workflow.filter(w => w.stato === 'COMPLETATO').length
      const totalPhases = workflow.length
      const isComplete = completedPhases >= 6 // Almeno 6 fasi completate

      return {
        success: isComplete,
        phase: 'WORKFLOW_VERIFICATION',
        message: `Workflow verificato: ${completedPhases}/${totalPhases} fasi completate`,
        data: { assistitoId, completedPhases, totalPhases, workflow },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        phase: 'WORKFLOW_VERIFICATION',
        message: 'Errore verifica workflow',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Log risultati test nel database
   */
  private async logTestResult(test: FullSystemTest): Promise<void> {
    try {
      const dataManagement = new DataManagementService(this.db)
      await dataManagement.addSystemLog(
        'FUNCTIONAL_TEST',
        'FunctionalTestService',
        `Test funzionale completo - Success: ${test.success}, Fasi: ${test.phases_completed}/${test.phases_total}`,
        {
          testId: test.test_id,
          duration: test.total_duration,
          summary: test.summary,
          results: test.results.map(r => ({ phase: r.phase, success: r.success, message: r.message }))
        },
        test.success ? 'INFO' : 'WARNING'
      )
    } catch (error) {
      console.error('Error logging test result:', error)
    }
  }

  /**
   * Genera dati test per lead
   */
  private generateTestLeadData(testId: string) {
    const timestamp = Date.now()
    const names = ['Mario', 'Luigi', 'Anna', 'Giulia', 'Francesco', 'Francesca']
    const surnames = ['Rossi', 'Verdi', 'Bianchi', 'Neri', 'Gialli', 'Blu']
    
    const firstName = names[Math.floor(Math.random() * names.length)]
    const lastName = surnames[Math.floor(Math.random() * surnames.length)]
    
    return {
      nomeRichiedente: firstName,
      cognomeRichiedente: lastName,
      emailRichiedente: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.test.${timestamp}@email.com`,
      telefonoRichiedente: `333${Math.floor(1000000 + Math.random() * 9000000)}`,
      nomeAssistito: firstName,
      cognomeAssistito: lastName,
      dataNascitaAssistito: `19${50 + Math.floor(Math.random() * 30)}-0${Math.floor(Math.random() * 8) + 1}-${Math.floor(Math.random() * 28) + 1}`,
      cfRichiedente: `${lastName.substring(0,3).toUpperCase()}${firstName.substring(0,3).toUpperCase()}70A01F205X`,
      cfAssistito: `${lastName.substring(0,3).toUpperCase()}${firstName.substring(0,3).toUpperCase()}50C15F205Y`,
      indirizzoRichiedente: `Via Test ${Math.floor(Math.random() * 999) + 1}, 2010${Math.floor(Math.random() * 9)} Milano MI`,
      indirizzoAssistito: `Via Test ${Math.floor(Math.random() * 999) + 1}, 2010${Math.floor(Math.random() * 9)} Milano MI`,
      pacchetto: Math.random() > 0.5 ? 'Base' : 'Avanzato'
    }
  }

  /**
   * Utility per simulare attesa
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}