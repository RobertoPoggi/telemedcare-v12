/**
 * OPERATIONAL-WORKFLOW-MANAGER.TS - Sistema Workflow Operativo Completo
 * TeleMedCare V11.0 - Flusso Operativo Automatizzato
 * 
 * FLUSSO COMPLETO GESTITO:
 * 1. Landing Page → Lead creato
 * 2. Email notifica a info@telemedcare.it  
 * 3. Invio documenti informativi (se richiesti)
 * 4. Generazione e invio contratto pre-compilato
 * 5. Firma elettronica contratto
 * 6. Generazione e invio proforma
 * 7. Pagamento (Bonifico o Stripe)
 * 8. Invio email benvenuto con form configurazione
 * 9. Ricezione configurazione
 * 10. Associazione dispositivo
 * 11. Conferma attivazione
 * 
 * FONTI LEAD SUPPORTATE:
 * - Landing Page diretta
 * - IRBEMA (privati con email/telefono)
 * - Luxottica
 * - Pirelli
 * - Fondo FAS
 */

import { Context } from 'hono'

export interface OperationalWorkflowConfig {
  leadId: string
  fonte: 'LANDING_PAGE' | 'IRBEMA' | 'LUXOTTICA' | 'PIRELLI' | 'FAS'
  
  // Dati lead
  nomeRichiedente: string
  cognomeRichiedente: string
  email: string
  telefono?: string
  
  // Dati assistito (se diverso)
  nomeAssistito?: string
  cognomeAssistito?: string
  etaAssistito?: number
  
  // Richieste
  tipoServizio: 'BASE' | 'AVANZATO'
  servizio?: 'FAMILY' | 'PRO' | 'PREMIUM' // Tipo servizio eCura
  vuoleBrochure?: boolean
  vuoleManuale?: boolean
  vuoleContratto?: boolean
  
  // Consensi
  consensoPrivacy: boolean
  consensoMarketing?: boolean
  consensoTerze?: boolean
  
  // Dati esterni (per fonti esterne)
  external_source_id?: string
  external_data?: any
}

export interface WorkflowState {
  leadId: string
  currentPhase: WorkflowPhase
  completedPhases: WorkflowPhase[]
  
  // Stati documenti
  contractId?: string
  contractStatus?: 'DRAFT' | 'SENT' | 'SIGNED'
  signatureId?: string
  proformaId?: string
  proformaStatus?: 'DRAFT' | 'SENT' | 'PAID'
  paymentId?: string
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED'
  
  // Configurazione e dispositivo
  configurationId?: string
  deviceId?: string
  deviceIMEI?: string
  
  // Timestamps
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export type WorkflowPhase =
  | 'LEAD_CREATED'
  | 'INFO_NOTIFIED'
  | 'DOCUMENTS_SENT'
  | 'CONTRACT_GENERATED'
  | 'CONTRACT_SENT'
  | 'CONTRACT_SIGNED'
  | 'PROFORMA_GENERATED'
  | 'PROFORMA_SENT'
  | 'PAYMENT_RECEIVED'
  | 'WELCOME_SENT'
  | 'CONFIGURATION_SENT'
  | 'CONFIGURATION_RECEIVED'
  | 'DEVICE_ASSIGNED'
  | 'ACTIVATION_CONFIRMED'
  | 'COMPLETED'

export interface WorkflowTrigger {
  phase: WorkflowPhase
  action: () => Promise<void>
  nextPhase: WorkflowPhase
  emailTemplate?: string
  conditions?: () => boolean
}

/**
 * OPERATIONAL WORKFLOW MANAGER
 * Gestisce l'intero ciclo di vita di un lead dalla creazione all'attivazione
 */
export class OperationalWorkflowManager {
  constructor(
    private db: D1Database,
    private env: any
  ) {}

  /**
   * Crea un nuovo lead e avvia il workflow operativo
   */
  async createLeadAndStartWorkflow(config: OperationalWorkflowConfig): Promise<WorkflowState> {
    const leadId = `LEAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // 1. Crea lead nel database
    await this.db
      .prepare(`
        INSERT INTO leads (
          id, nomeRichiedente, cognomeRichiedente, email, telefono,
          nomeAssistito, cognomeAssistito, etaAssistito,
          fonte, tipoServizio, vuoleBrochure, vuoleManuale, vuoleContratto,
          consensoPrivacy, consensoMarketing, consensoTerze,
          external_source_id, external_data,
          status, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?,
          'NEW', datetime('now'), datetime('now')
        )
      `)
      .bind(
        leadId,
        config.nomeRichiedente,
        config.cognomeRichiedente,
        config.email,
        config.telefono || null,
        config.nomeAssistito || null,
        config.cognomeAssistito || null,
        config.etaAssistito || null,
        config.fonte,
        config.tipoServizio,
        config.vuoleBrochure ? 'Si' : 'No',
        config.vuoleManuale ? 'Si' : 'No',
        config.vuoleContratto ? 'Si' : 'No',
        config.consensoPrivacy ? 1 : 0,
        config.consensoMarketing ? 1 : 0,
        config.consensoTerze ? 1 : 0,
        config.external_source_id || null,
        config.external_data ? JSON.stringify(config.external_data) : null
      )
      .run()

    // 2. Inizializza workflow state
    const workflowState: WorkflowState = {
      leadId,
      currentPhase: 'LEAD_CREATED',
      completedPhases: ['LEAD_CREATED'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // 3. Avvia la fase successiva automaticamente
    await this.progressWorkflow(workflowState, config)

    return workflowState
  }

  /**
   * Fa progredire il workflow alla fase successiva
   */
  async progressWorkflow(
    state: WorkflowState,
    config: OperationalWorkflowConfig
  ): Promise<WorkflowState> {
    const currentPhase = state.currentPhase

    switch (currentPhase) {
      case 'LEAD_CREATED':
        return await this.executeInfoNotification(state, config)
      
      case 'INFO_NOTIFIED':
        if (config.vuoleBrochure || config.vuoleManuale) {
          return await this.executeSendDocuments(state, config)
        } else if (config.vuoleContratto) {
          return await this.executeGenerateContract(state, config)
        }
        return state
      
      case 'DOCUMENTS_SENT':
        if (config.vuoleContratto) {
          return await this.executeGenerateContract(state, config)
        }
        return state
      
      case 'CONTRACT_GENERATED':
        return await this.executeSendContract(state, config)
      
      // Gli altri stati vengono gestiti da trigger esterni (firma, pagamento, etc.)
      default:
        return state
    }
  }

  /**
   * FASE 1: Invia notifica a info@telemedcare.it
   */
  private async executeInfoNotification(
    state: WorkflowState,
    config: OperationalWorkflowConfig
  ): Promise<WorkflowState> {
    try {
      // Carica template email_notifica_info
      const templatePath = '/home/user/webapp/templates/email/email_notifica_info.html'
      const fs = require('fs')
      let emailTemplate = fs.readFileSync(templatePath, 'utf-8')

      // Compila template con dati lead
      emailTemplate = this.compileEmailTemplate(emailTemplate, {
        NOME_RICHIEDENTE: config.nomeRichiedente,
        COGNOME_RICHIEDENTE: config.cognomeRichiedente,
        EMAIL_RICHIEDENTE: config.email,
        TELEFONO_RICHIEDENTE: config.telefono || 'Non fornito',
        TIPO_SERVIZIO: config.tipoServizio,
        FONTE: config.fonte,
        BROCHURE: config.vuoleBrochure ? 'Sì' : 'No',
        MANUALE: config.vuoleManuale ? 'Sì' : 'No',
        CONTRATTO: config.vuoleContratto ? 'Sì' : 'No',
        DATA_RICHIESTA: new Date().toLocaleDateString('it-IT')
      })

      // Invia email tramite EmailService (usando RESEND o SENDGRID)
      await this.sendEmail({
        to: 'info@telemedcare.it',
        subject: `Nuovo Lead: ${config.nomeRichiedente} ${config.cognomeRichiedente} - ${config.tipoServizio}`,
        html: emailTemplate,
        leadId: state.leadId,
        templateUsed: 'email_notifica_info'
      })

      // Log email inviata
      await this.logEmail(state.leadId, null, null, 'email_notifica_info', 'info@telemedcare.it', 'SENT')

      // Aggiorna stato
      state.currentPhase = 'INFO_NOTIFIED'
      state.completedPhases.push('INFO_NOTIFIED')
      state.updatedAt = new Date().toISOString()

      // Aggiorna database
      await this.updateLeadStatus(state.leadId, 'CONTACTED')

      return state
    } catch (error) {
      console.error('Errore in executeInfoNotification:', error)
      throw error
    }
  }

  /**
   * FASE 2: Invia documenti informativi (brochure/manuale)
   */
  private async executeSendDocuments(
    state: WorkflowState,
    config: OperationalWorkflowConfig
  ): Promise<WorkflowState> {
    try {
      const fs = require('fs')
      const templatePath = '/home/user/webapp/templates/email/email_documenti_informativi.html'
      let emailTemplate = fs.readFileSync(templatePath, 'utf-8')

      emailTemplate = this.compileEmailTemplate(emailTemplate, {
        NOME_RICHIEDENTE: config.nomeRichiedente,
        COGNOME_RICHIEDENTE: config.cognomeRichiedente
      })

      await this.sendEmail({
        to: config.email,
        subject: 'TeleMedCare - Documentazione Informativa',
        html: emailTemplate,
        leadId: state.leadId,
        templateUsed: 'email_documenti_informativi'
      })

      await this.logEmail(state.leadId, null, null, 'email_documenti_informativi', config.email, 'SENT')

      state.currentPhase = 'DOCUMENTS_SENT'
      state.completedPhases.push('DOCUMENTS_SENT')
      state.updatedAt = new Date().toISOString()

      await this.updateLeadStatus(state.leadId, 'DOCUMENTS_SENT')

      return state
    } catch (error) {
      console.error('Errore in executeSendDocuments:', error)
      throw error
    }
  }

  /**
   * FASE 3: Genera contratto pre-compilato
   */
  private async executeGenerateContract(
    state: WorkflowState,
    config: OperationalWorkflowConfig
  ): Promise<WorkflowState> {
    try {
      const contractId = `CONTRACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const codiceContratto = `MC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`

      // Determina template e prezzi
      const tipoContratto = config.tipoServizio
      const templateFile = tipoContratto === 'BASE' 
        ? 'Template_Contratto_Base_TeleMedCare.docx'
        : 'Template_Contratto_Avanzato_TeleMedCare.docx'

      const prezzoMensile = tipoContratto === 'BASE' ? 29.90 : 49.90
      const durataMesi = 12
      const prezzoTotale = prezzoMensile * durataMesi

      // TODO: Implementare generazione PDF da DOCX con compilazione campi
      // Per ora creiamo record nel database
      await this.db
        .prepare(`
          INSERT INTO contracts (
            id, leadId, codice_contratto, tipo_contratto, template_utilizzato,
            contenuto_html, prezzo_mensile, durata_mesi, prezzo_totale,
            status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT', datetime('now'), datetime('now'))
        `)
        .bind(
          contractId,
          state.leadId,
          codiceContratto,
          tipoContratto,
          templateFile,
          `Contratto ${tipoContratto} generato per ${config.nomeRichiedente} ${config.cognomeRichiedente}`,
          prezzoMensile,
          durataMesi,
          prezzoTotale
        )
        .run()

      state.contractId = contractId
      state.contractStatus = 'DRAFT'
      state.currentPhase = 'CONTRACT_GENERATED'
      state.completedPhases.push('CONTRACT_GENERATED')
      state.updatedAt = new Date().toISOString()

      await this.updateLeadStatus(state.leadId, 'CONTRACT_SENT')

      return state
    } catch (error) {
      console.error('Errore in executeGenerateContract:', error)
      throw error
    }
  }

  /**
   * FASE 4: Invia contratto via email
   */
  private async executeSendContract(
    state: WorkflowState,
    config: OperationalWorkflowConfig
  ): Promise<WorkflowState> {
    try {
      const fs = require('fs')
      const templatePath = '/home/user/webapp/templates/email/email_invio_contratto.html'
      let emailTemplate = fs.readFileSync(templatePath, 'utf-8')

      emailTemplate = this.compileEmailTemplate(emailTemplate, {
        NOME_RICHIEDENTE: config.nomeRichiedente,
        COGNOME_RICHIEDENTE: config.cognomeRichiedente,
        CODICE_CONTRATTO: state.contractId || 'N/A',
        LINK_FIRMA: `https://your-domain.com/firma/${state.contractId}`
      })

      await this.sendEmail({
        to: config.email,
        subject: 'TeleMedCare - Contratto da Firmare',
        html: emailTemplate,
        leadId: state.leadId,
        templateUsed: 'email_invio_contratto'
      })

      await this.logEmail(state.leadId, state.contractId, null, 'email_invio_contratto', config.email, 'SENT')

      // Aggiorna contratto
      await this.db
        .prepare(`UPDATE contracts SET status = 'SENT', data_invio = datetime('now'), email_sent = 1, email_template_used = 'email_invio_contratto', updated_at = datetime('now') WHERE id = ?`)
        .bind(state.contractId)
        .run()

      state.contractStatus = 'SENT'
      state.currentPhase = 'CONTRACT_SENT'
      state.completedPhases.push('CONTRACT_SENT')
      state.updatedAt = new Date().toISOString()

      return state
    } catch (error) {
      console.error('Errore in executeSendContract:', error)
      throw error
    }
  }

  // =====================================================================
  // UTILITY FUNCTIONS
  // =====================================================================

  private compileEmailTemplate(template: string, data: Record<string, string>): string {
    let compiled = template
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      compiled = compiled.replace(regex, data[key])
    })
    return compiled
  }

  private async sendEmail(params: {
    to: string
    subject: string
    html: string
    leadId: string
    templateUsed: string
    attachments?: any[]
  }): Promise<void> {
    // Implementazione invio email tramite RESEND o SENDGRID
    // TODO: Integrare con EmailService esistente
    console.log(`📧 Invio email a ${params.to}: ${params.subject}`)
  }

  private async logEmail(
    leadId: string,
    contractId: string | null,
    proformaId: string | null,
    templateUsed: string,
    recipientEmail: string,
    status: string
  ): Promise<void> {
    await this.db
      .prepare(`
        INSERT INTO email_logs (
          leadId, contract_id, proforma_id, recipient_email, template_used,
          subject, status, sent_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `)
      .bind(
        leadId,
        contractId,
        proformaId,
        recipientEmail,
        templateUsed,
        `Email ${templateUsed}`,
        status
      )
      .run()
  }

  private async updateLeadStatus(leadId: string, status: string): Promise<void> {
    await this.db
      .prepare(`UPDATE leads SET status = ?, updated_at = datetime('now') WHERE id = ?`)
      .bind(status, leadId)
      .run()
  }

  /**
   * Recupera lo stato corrente del workflow per un lead
   */
  async getWorkflowState(leadId: string): Promise<WorkflowState | null> {
    const lead = await this.db
      .prepare(`SELECT * FROM leads WHERE id = ?`)
      .bind(leadId)
      .first()

    if (!lead) return null

    const contract = await this.db
      .prepare(`SELECT * FROM contracts WHERE leadId = ? ORDER BY created_at DESC LIMIT 1`)
      .bind(leadId)
      .first()

    const proforma = await this.db
      .prepare(`SELECT * FROM proforma WHERE leadId = ? ORDER BY created_at DESC LIMIT 1`)
      .bind(leadId)
      .first()

    const payment = await this.db
      .prepare(`SELECT * FROM payments WHERE leadId = ? ORDER BY created_at DESC LIMIT 1`)
      .bind(leadId)
      .first()

    // Determina fase corrente basandosi sullo stato
    let currentPhase: WorkflowPhase = 'LEAD_CREATED'
    const completedPhases: WorkflowPhase[] = ['LEAD_CREATED']

    if (lead.status === 'CONTACTED') {
      currentPhase = 'INFO_NOTIFIED'
      completedPhases.push('INFO_NOTIFIED')
    }
    if (lead.status === 'DOCUMENTS_SENT') {
      currentPhase = 'DOCUMENTS_SENT'
      completedPhases.push('DOCUMENTS_SENT')
    }
    if (contract) {
      currentPhase = 'CONTRACT_GENERATED'
      completedPhases.push('CONTRACT_GENERATED')
      if (contract.status === 'SENT') {
        currentPhase = 'CONTRACT_SENT'
        completedPhases.push('CONTRACT_SENT')
      }
      if (contract.status === 'SIGNED') {
        currentPhase = 'CONTRACT_SIGNED'
        completedPhases.push('CONTRACT_SIGNED')
      }
    }
    if (proforma) {
      currentPhase = 'PROFORMA_GENERATED'
      completedPhases.push('PROFORMA_GENERATED')
      if (proforma.status === 'SENT') {
        currentPhase = 'PROFORMA_SENT'
        completedPhases.push('PROFORMA_SENT')
      }
      if (proforma.status === 'PAID') {
        currentPhase = 'PAYMENT_RECEIVED'
        completedPhases.push('PAYMENT_RECEIVED')
      }
    }

    return {
      leadId,
      currentPhase,
      completedPhases,
      contractId: contract?.id,
      contractStatus: contract?.status,
      proformaId: proforma?.id,
      proformaStatus: proforma?.status,
      paymentId: payment?.id,
      paymentStatus: payment?.status,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at
    }
  }
}
