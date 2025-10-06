/**
 * LEAD_WORKFLOW.TS - Sistema Workflow Automatico Lead
 * TeleMedCare V11.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Workflow automatico post-acquisizione lead
 * - Sequenze email personalizzate per priorità
 * - Automazioni follow-up e reminder
 * - Integrazione con signature-service e payment-service
 * - Escalation automatiche per lead critici
 * - Conversione lead in clienti con workflow completo
 * - Analytics e ottimizzazione workflow performance
 */

import { Lead, LeadInteraction, LeadManager } from './lead-manager'
import { SignatureService } from './signature-service'
import { PaymentService } from './payment-service'
import { EmailService } from './email-service'
import { ConfigurationManager } from './configuration-manager'

export interface WorkflowStep {
  id: string
  name: string
  type: 'EMAIL' | 'SMS' | 'PHONE' | 'TASK' | 'DELAY' | 'CONDITION' | 'SIGNATURE' | 'PAYMENT'
  
  // Timing
  delay?: number // Minuti di delay dal step precedente
  executeAt?: string // Timestamp specifico
  
  // Content
  templateId?: string
  subject?: string
  content?: string
  
  // Conditions
  conditions?: {
    leadScore?: { min?: number; max?: number }
    leadPriority?: Lead['priority'][]
    leadStatus?: Lead['status'][]
    previousStepResult?: 'SUCCESS' | 'FAILED' | 'TIMEOUT'
  }
  
  // Actions
  actions?: {
    updateLeadStatus?: Lead['status']
    assignToAgent?: string
    scheduleFollowUp?: number // Minuti
    createTask?: string
    sendNotification?: string[]
  }
  
  // Metadata
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WorkflowInstance {
  id: string
  leadId: string
  workflowName: string
  
  // Execution
  currentStep: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  executedSteps: WorkflowStepExecution[]
  
  // Timing
  startedAt: string
  nextExecutionAt?: string
  completedAt?: string
  
  // Context
  context: Record<string, any>
  
  // Metadata
  createdAt: string
  updatedAt: string
}

export interface WorkflowStepExecution {
  stepId: string
  executedAt: string
  result: 'SUCCESS' | 'FAILED' | 'TIMEOUT' | 'SKIPPED'
  duration?: number // millisecondi
  error?: string
  metadata?: Record<string, any>
}

export interface WorkflowTemplate {
  name: string
  description: string
  triggerConditions: {
    leadSource?: Lead['source'][]
    leadPriority?: Lead['priority'][]
    leadScore?: { min?: number; max?: number }
  }
  steps: WorkflowStep[]
  isActive: boolean
}

// =====================================================================
// WORKFLOW TEMPLATES PREDEFINITI
// =====================================================================

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  
  // === WORKFLOW LEAD CRITICI ===
  CRITICAL_LEAD_WORKFLOW: {
    name: 'Workflow Lead Critici',
    description: 'Gestione immediata lead con priorità CRITICAL',
    triggerConditions: {
      leadPriority: ['CRITICAL']
    },
    steps: [
      {
        id: 'critical_immediate_notification',
        name: 'Notifica Immediata Team',
        type: 'TASK',
        delay: 0,
        actions: {
          sendNotification: ['team_lead', 'manager', 'on_call_doctor'],
          createTask: 'Contatto immediato lead CRITICAL entro 5 minuti'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'critical_welcome_email',
        name: 'Email Benvenuto Urgente',
        type: 'EMAIL',
        delay: 1, // 1 minuto
        templateId: 'email_benvenuto_urgente',
        subject: 'TeleMedCare - La contattiamo IMMEDIATAMENTE',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'critical_phone_task',
        name: 'Chiamata Immediata',
        type: 'PHONE',
        delay: 2, // 2 minuti dall\'email
        actions: {
          assignToAgent: 'next_available_senior',
          createTask: 'Chiamata immediata - Situazione urgente'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'critical_sms_backup',
        name: 'SMS Backup se no risposta',
        type: 'SMS',
        delay: 10, // 10 minuti se no risposta
        conditions: {
          previousStepResult: 'FAILED'
        },
        content: 'TeleMedCare: La stiamo cercando per la sua richiesta urgente. Richiami il +39 02 1234567',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    isActive: true
  },

  // === WORKFLOW HIGH PRIORITY ===
  HIGH_PRIORITY_WORKFLOW: {
    name: 'Workflow High Priority',
    description: 'Contatto rapido per lead priorità HIGH',
    triggerConditions: {
      leadPriority: ['HIGH']
    },
    steps: [
      {
        id: 'high_welcome_email',
        name: 'Email Benvenuto Prioritario',
        type: 'EMAIL',
        delay: 0,
        templateId: 'email_benvenuto_high',
        subject: 'TeleMedCare - La contattiamo entro 30 minuti',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'high_phone_assignment',
        name: 'Assegnazione Chiamata',
        type: 'TASK',
        delay: 5, // 5 minuti
        actions: {
          assignToAgent: 'next_available',
          createTask: 'Chiamata entro 30 minuti - Lead HIGH priority',
          scheduleFollowUp: 30
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'high_follow_up_email',
        name: 'Email Follow-up se no contatto',
        type: 'EMAIL',
        delay: 60, // 1 ora
        templateId: 'email_follow_up_high',
        conditions: {
          leadStatus: ['NEW', 'CONTACTED']
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    isActive: true
  },

  // === WORKFLOW NURTURING AUTOMATICO ===
  NURTURING_WORKFLOW: {
    name: 'Workflow Nurturing Automatico',
    description: 'Sequenza nurturing per lead MEDIUM e LOW',
    triggerConditions: {
      leadPriority: ['MEDIUM', 'LOW']
    },
    steps: [
      {
        id: 'nurturing_welcome',
        name: 'Email Benvenuto',
        type: 'EMAIL',
        delay: 0,
        templateId: 'email_benvenuto',
        subject: 'Benvenuto in TeleMedCare - La sua salute è importante',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'nurturing_info_services',
        name: 'Informazioni Servizi',
        type: 'EMAIL',
        delay: 1440, // 24 ore
        templateId: 'email_informazioni_servizi',
        subject: 'I nostri servizi di telemedicina per lei',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'nurturing_testimonials',
        name: 'Testimonianze Clienti',
        type: 'EMAIL',
        delay: 2880, // 48 ore dalla precedente
        templateId: 'email_testimonianze',
        subject: 'Cosa dicono i nostri pazienti',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'nurturing_consultation_offer',
        name: 'Offerta Consulenza Gratuita',
        type: 'EMAIL',
        delay: 4320, // 72 ore
        templateId: 'email_consulenza_gratuita',
        subject: 'Consulenza gratuita di 15 minuti - Solo per lei',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'nurturing_phone_follow_up',
        name: 'Follow-up Telefonico',
        type: 'PHONE',
        delay: 10080, // 7 giorni
        actions: {
          assignToAgent: 'nurturing_specialist',
          createTask: 'Follow-up telefonico nurturing - Verifica interesse'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    isActive: true
  },

  // === WORKFLOW POST-QUALIFICAZIONE ===
  POST_QUALIFICATION_WORKFLOW: {
    name: 'Workflow Post-Qualificazione',
    description: 'Gestione lead qualificati verso conversione',
    triggerConditions: {
      leadStatus: ['QUALIFIED']
    },
    steps: [
      {
        id: 'qualified_proposal_email',
        name: 'Invio Proposta Personalizzata',
        type: 'EMAIL',
        delay: 0,
        templateId: 'email_proposta_personalizzata',
        subject: 'La sua proposta personalizzata TeleMedCare',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'qualified_proforma_generation',
        name: 'Generazione Proforma',
        type: 'TASK',
        delay: 30, // 30 minuti
        actions: {
          createTask: 'Genera proforma personalizzata per lead qualificato',
          updateLeadStatus: 'PROPOSAL'
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'qualified_signature_request',
        name: 'Richiesta Firma Contratto',
        type: 'SIGNATURE',
        delay: 60, // 1 ora
        templateId: 'contract_standard',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'qualified_payment_setup',
        name: 'Setup Pagamento',
        type: 'PAYMENT',
        delay: 120, // 2 ore
        conditions: {
          previousStepResult: 'SUCCESS' // Firma completata
        },
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    isActive: true
  },

  // === WORKFLOW RE-ENGAGEMENT ===
  REENGAGEMENT_WORKFLOW: {
    name: 'Workflow Re-engagement',
    description: 'Riattivazione lead dormienti',
    triggerConditions: {
      leadStatus: ['NURTURING']
    },
    steps: [
      {
        id: 'reengagement_survey',
        name: 'Survey Feedback',
        type: 'EMAIL',
        delay: 0,
        templateId: 'email_survey_feedback',
        subject: 'La sua opinione è importante - 2 minuti di survey',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'reengagement_special_offer',
        name: 'Offerta Speciale',
        type: 'EMAIL',
        delay: 2880, // 48 ore
        templateId: 'email_offerta_speciale',
        subject: 'Offerta esclusiva: 50% di sconto per lei',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'reengagement_last_chance',
        name: 'Ultima Possibilità',
        type: 'EMAIL',
        delay: 10080, // 7 giorni
        templateId: 'email_ultima_possibilita',
        subject: 'Ultima possibilità - Non perdere questa opportunità',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    isActive: true
  }
}

// =====================================================================
// LEAD WORKFLOW ENGINE
// =====================================================================

export class LeadWorkflowEngine {
  private static instance: LeadWorkflowEngine | null = null
  private activeWorkflows: Map<string, WorkflowInstance> = new Map()

  // Lazy loading per Cloudflare Workers
  static getInstance(): LeadWorkflowEngine {
    if (!LeadWorkflowEngine.instance) {
      LeadWorkflowEngine.instance = new LeadWorkflowEngine()
    }
    return LeadWorkflowEngine.instance
  }

  /**
   * Avvia workflow per lead
   */
  async startWorkflow(
    leadId: string, 
    workflowName: string,
    context?: Record<string, any>
  ): Promise<{ success: boolean; workflowInstanceId?: string; error?: string }> {
    try {
      console.log(`🚀 Avvio workflow "${workflowName}" per lead ${leadId}`)
      
      const template = WORKFLOW_TEMPLATES[workflowName]
      if (!template || !template.isActive) {
        return {
          success: false,
          error: `Workflow template "${workflowName}" non trovato o non attivo`
        }
      }

      // Verifica condizioni trigger
      const lead = await this.getLeadData(leadId)
      if (!this.checkTriggerConditions(lead, template.triggerConditions)) {
        return {
          success: false,
          error: 'Lead non soddisfa le condizioni trigger del workflow'
        }
      }

      // Crea istanza workflow
      const workflowInstanceId = `WF_${Date.now()}_${Math.random().toString(36).substring(2)}`
      const workflowInstance: WorkflowInstance = {
        id: workflowInstanceId,
        leadId: leadId,
        workflowName: workflowName,
        currentStep: 0,
        status: 'ACTIVE',
        executedSteps: [],
        startedAt: new Date().toISOString(),
        context: context || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      this.activeWorkflows.set(workflowInstanceId, workflowInstance)
      
      // Salva in database
      await this.saveWorkflowInstance(workflowInstance)
      
      // Avvia esecuzione primo step
      await this.executeNextStep(workflowInstance, template)

      console.log(`✅ Workflow avviato: ${workflowInstanceId}`)
      
      return {
        success: true,
        workflowInstanceId: workflowInstanceId
      }

    } catch (error) {
      console.error('❌ Errore avvio workflow:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore avvio workflow'
      }
    }
  }

  /**
   * Esegue step successivo workflow
   */
  private async executeNextStep(
    workflowInstance: WorkflowInstance, 
    template: WorkflowTemplate
  ): Promise<void> {
    try {
      if (workflowInstance.currentStep >= template.steps.length) {
        // Workflow completato
        workflowInstance.status = 'COMPLETED'
        workflowInstance.completedAt = new Date().toISOString()
        workflowInstance.updatedAt = new Date().toISOString()
        
        await this.saveWorkflowInstance(workflowInstance)
        console.log(`✅ Workflow completato: ${workflowInstance.id}`)
        return
      }

      const step = template.steps[workflowInstance.currentStep]
      
      // Verifica condizioni step
      if (step.conditions && !this.checkStepConditions(workflowInstance, step)) {
        // Skip step
        const execution: WorkflowStepExecution = {
          stepId: step.id,
          executedAt: new Date().toISOString(),
          result: 'SKIPPED'
        }
        workflowInstance.executedSteps.push(execution)
        workflowInstance.currentStep++
        
        await this.executeNextStep(workflowInstance, template) // Prossimo step
        return
      }

      // Calcola quando eseguire step
      const executeAt = step.executeAt || new Date(Date.now() + (step.delay || 0) * 60000).toISOString()
      
      if (new Date(executeAt) > new Date()) {
        // Schedule per esecuzione futura
        workflowInstance.nextExecutionAt = executeAt
        workflowInstance.updatedAt = new Date().toISOString()
        await this.saveWorkflowInstance(workflowInstance)
        
        console.log(`⏰ Step "${step.name}" schedulato per: ${executeAt}`)
        return
      }

      // Esegui step ora
      const startTime = Date.now()
      console.log(`▶️ Esecuzione step: ${step.name} (${step.type})`)
      
      let result: WorkflowStepExecution['result'] = 'SUCCESS'
      let error: string | undefined
      let metadata: Record<string, any> = {}

      try {
        switch (step.type) {
          case 'EMAIL':
            await this.executeEmailStep(workflowInstance, step)
            break
          case 'SMS':
            await this.executeSMSStep(workflowInstance, step)
            break
          case 'PHONE':
            await this.executePhoneStep(workflowInstance, step)
            break
          case 'TASK':
            await this.executeTaskStep(workflowInstance, step)
            break
          case 'SIGNATURE':
            metadata = await this.executeSignatureStep(workflowInstance, step)
            break
          case 'PAYMENT':
            metadata = await this.executePaymentStep(workflowInstance, step)
            break
          case 'DELAY':
            await this.executeDelayStep(workflowInstance, step)
            break
          default:
            throw new Error(`Tipo step non supportato: ${step.type}`)
        }

        // Esegui actions se presenti
        if (step.actions) {
          await this.executeStepActions(workflowInstance, step.actions)
        }

      } catch (stepError) {
        result = 'FAILED'
        error = stepError instanceof Error ? stepError.message : 'Errore esecuzione step'
        console.error(`❌ Errore step "${step.name}":`, stepError)
      }

      // Registra esecuzione
      const execution: WorkflowStepExecution = {
        stepId: step.id,
        executedAt: new Date().toISOString(),
        result: result,
        duration: Date.now() - startTime,
        error: error,
        metadata: metadata
      }
      
      workflowInstance.executedSteps.push(execution)
      workflowInstance.currentStep++
      workflowInstance.updatedAt = new Date().toISOString()
      
      if (result === 'FAILED' && step.type !== 'CONDITION') {
        workflowInstance.status = 'FAILED'
      }

      await this.saveWorkflowInstance(workflowInstance)

      // Continua con prossimo step se workflow ancora attivo
      if (workflowInstance.status === 'ACTIVE') {
        await this.executeNextStep(workflowInstance, template)
      }

    } catch (error) {
      console.error('❌ Errore esecuzione step workflow:', error)
      workflowInstance.status = 'FAILED'
      workflowInstance.updatedAt = new Date().toISOString()
      await this.saveWorkflowInstance(workflowInstance)
    }
  }

  /**
   * Processa workflow schedulati
   */
  async processScheduledWorkflows(): Promise<void> {
    try {
      console.log('⏰ Processamento workflow schedulati...')
      
      // In produzione: query D1 per workflow con nextExecutionAt <= now
      const now = new Date().toISOString()
      
      for (const [instanceId, instance] of this.activeWorkflows) {
        if (instance.status === 'ACTIVE' && 
            instance.nextExecutionAt && 
            instance.nextExecutionAt <= now) {
          
          console.log(`▶️ Ripresa workflow: ${instanceId}`)
          
          const template = WORKFLOW_TEMPLATES[instance.workflowName]
          if (template) {
            await this.executeNextStep(instance, template)
          }
        }
      }

    } catch (error) {
      console.error('❌ Errore processamento workflow schedulati:', error)
    }
  }

  /**
   * Statistiche workflow
   */
  async getWorkflowStatistics(): Promise<{
    activeWorkflows: number
    completedWorkflows: number
    failedWorkflows: number
    totalExecutions: number
    averageCompletionTime: number
    successRate: number
    workflowsByType: Record<string, number>
  }> {
    // In produzione: query aggregate D1 database
    return {
      activeWorkflows: this.activeWorkflows.size,
      completedWorkflows: 156,
      failedWorkflows: 12,
      totalExecutions: 1247,
      averageCompletionTime: 4.2, // ore
      successRate: 0.93, // 93%
      workflowsByType: {
        'CRITICAL_LEAD_WORKFLOW': 23,
        'HIGH_PRIORITY_WORKFLOW': 89,
        'NURTURING_WORKFLOW': 245,
        'POST_QUALIFICATION_WORKFLOW': 67,
        'REENGAGEMENT_WORKFLOW': 34
      }
    }
  }

  // =====================================================================
  // STEP EXECUTION METHODS
  // =====================================================================

  private async executeEmailStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    const emailService = EmailService.getInstance()
    const leadId = instance.leadId
    
    const emailResult = await emailService.sendLeadEmail(
      leadId,
      step.templateId || 'default',
      {
        subject: step.subject,
        content: step.content,
        workflowContext: instance.context
      }
    )

    if (!emailResult.success) {
      throw new Error(`Invio email fallito: ${emailResult.error}`)
    }

    console.log(`📧 Email inviata - Step: ${step.name}`)
  }

  private async executeSMSStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    // In produzione: integrazione Twilio o altro provider SMS
    console.log(`📱 SMS inviato - Step: ${step.name}, Content: ${step.content}`)
  }

  private async executePhoneStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    // Crea task per operatore
    console.log(`📞 Task chiamata creato - Step: ${step.name}`)
  }

  private async executeTaskStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    // Crea task generico per team
    console.log(`📋 Task creato - Step: ${step.name}`)
  }

  private async executeSignatureStep(instance: WorkflowInstance, step: WorkflowStep): Promise<Record<string, any>> {
    const signatureService = SignatureService.getInstance()
    const lead = await this.getLeadData(instance.leadId)
    
    const signatureResult = await signatureService.createSignatureRequest(
      'CONTRACT',
      {
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        phone: lead.phone
      },
      `/contracts/lead_${instance.leadId}_contract.pdf`,
      'ELECTRONIC'
    )

    if (!signatureResult.success) {
      throw new Error(`Richiesta firma fallita: ${signatureResult.error}`)
    }

    console.log(`✍️ Richiesta firma creata - Step: ${step.name}`)
    return { signatureId: signatureResult.signatureId }
  }

  private async executePaymentStep(instance: WorkflowInstance, step: WorkflowStep): Promise<Record<string, any>> {
    const paymentService = PaymentService.getInstance()
    const lead = await this.getLeadData(instance.leadId)
    
    const paymentResult = await paymentService.createPaymentRequest(
      'PROFORMA',
      299.00, // Prezzo di default - in produzione da configurazioni
      {
        name: `${lead.firstName} ${lead.lastName}`,
        email: lead.email,
        phone: lead.phone
      },
      'STRIPE',
      'EUR',
      'Proforma TeleMedCare - Servizi Base'
    )

    if (!paymentResult.success) {
      throw new Error(`Setup pagamento fallito: ${paymentResult.error}`)
    }

    console.log(`💳 Pagamento setup - Step: ${step.name}`)
    return { paymentId: paymentResult.paymentId }
  }

  private async executeDelayStep(instance: WorkflowInstance, step: WorkflowStep): Promise<void> {
    // Delay gestito dalla schedule logic
    console.log(`⏳ Delay - Step: ${step.name}`)
  }

  private async executeStepActions(instance: WorkflowInstance, actions: WorkflowStep['actions']): Promise<void> {
    if (!actions) return

    try {
      if (actions.updateLeadStatus) {
        const leadManager = LeadManager.getInstance()
        await leadManager.updateLeadStatus(
          instance.leadId,
          actions.updateLeadStatus,
          'Status aggiornato da workflow automatico',
          'workflow_engine'
        )
      }

      if (actions.createTask) {
        console.log(`📋 Task creato: ${actions.createTask}`)
      }

      if (actions.sendNotification) {
        console.log(`🔔 Notifiche inviate a: ${actions.sendNotification.join(', ')}`)
      }

      if (actions.scheduleFollowUp) {
        const followUpDate = new Date(Date.now() + actions.scheduleFollowUp * 60000)
        console.log(`📅 Follow-up schedulato per: ${followUpDate.toISOString()}`)
      }

    } catch (error) {
      console.error('❌ Errore esecuzione actions:', error)
    }
  }

  // =====================================================================
  // PRIVATE HELPER METHODS
  // =====================================================================

  private async getLeadData(leadId: string): Promise<Lead> {
    const leadManager = LeadManager.getInstance()
    const result = await leadManager.getLeadById(leadId)
    
    if (!result.success || !result.data) {
      throw new Error('Lead non trovato')
    }
    
    return result.data as Lead
  }

  private checkTriggerConditions(lead: Lead, conditions: WorkflowTemplate['triggerConditions']): boolean {
    if (conditions.leadPriority && !conditions.leadPriority.includes(lead.priority)) {
      return false
    }
    
    if (conditions.leadSource && !conditions.leadSource.includes(lead.source)) {
      return false
    }
    
    if (conditions.leadScore) {
      if (conditions.leadScore.min && lead.score < conditions.leadScore.min) return false
      if (conditions.leadScore.max && lead.score > conditions.leadScore.max) return false
    }
    
    return true
  }

  private checkStepConditions(instance: WorkflowInstance, step: WorkflowStep): boolean {
    if (!step.conditions) return true

    // Controlla risultato step precedente
    if (step.conditions.previousStepResult && instance.executedSteps.length > 0) {
      const lastExecution = instance.executedSteps[instance.executedSteps.length - 1]
      if (lastExecution.result !== step.conditions.previousStepResult) {
        return false
      }
    }

    return true
  }

  private async saveWorkflowInstance(instance: WorkflowInstance): Promise<void> {
    // In produzione: salva in D1 database
    console.log(`💾 Salvataggio workflow instance: ${instance.id}`)
    
    this.activeWorkflows.set(instance.id, instance)
    
    // await env.DB.prepare(`
    //   INSERT OR REPLACE INTO workflow_instances 
    //   (id, leadId, workflowName, currentStep, status, executedSteps, startedAt, 
    //    nextExecutionAt, completedAt, context, createdAt, updatedAt)
    //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `).bind(
    //   instance.id, instance.leadId, instance.workflowName, instance.currentStep,
    //   instance.status, JSON.stringify(instance.executedSteps), instance.startedAt,
    //   instance.nextExecutionAt, instance.completedAt, JSON.stringify(instance.context),
    //   instance.createdAt, instance.updatedAt
    // ).run()
  }
}

// =====================================================================
// WORKFLOW UTILITIES
// =====================================================================

export class WorkflowUtils {
  /**
   * Crea template workflow personalizzato
   */
  static createCustomWorkflow(
    name: string,
    description: string,
    triggerConditions: WorkflowTemplate['triggerConditions'],
    steps: WorkflowStep[]
  ): WorkflowTemplate {
    return {
      name,
      description,
      triggerConditions,
      steps: steps.map(step => ({
        ...step,
        isActive: step.isActive ?? true,
        createdAt: step.createdAt || new Date().toISOString(),
        updatedAt: step.updatedAt || new Date().toISOString()
      })),
      isActive: true
    }
  }

  /**
   * Valida template workflow
   */
  static validateWorkflowTemplate(template: WorkflowTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!template.name || template.name.trim().length === 0) {
      errors.push('Nome workflow richiesto')
    }

    if (!template.steps || template.steps.length === 0) {
      errors.push('Almeno uno step richiesto')
    }

    // Valida steps
    template.steps.forEach((step, index) => {
      if (!step.id || step.id.trim().length === 0) {
        errors.push(`Step ${index + 1}: ID richiesto`)
      }
      
      if (!step.name || step.name.trim().length === 0) {
        errors.push(`Step ${index + 1}: Nome richiesto`)
      }
      
      if (!step.type) {
        errors.push(`Step ${index + 1}: Tipo richiesto`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// =====================================================================
// EXPORT DEFAULTS
// =====================================================================

export default LeadWorkflowEngine