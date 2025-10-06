/**
 * AUTOMATION_SERVICE.TS - Sistema Automazione Completa Lead
 * TeleMedCare V11.0-Cloudflare - Sistema Completamente Automatizzato
 * 
 * Gestisce automazione completa SENZA operatori umani:
 * - Email automatiche informative
 * - Invio documenti e brochure  
 * - Promemoria schedulati
 * - Nurturing automatico lead
 * - Conversione automatica a contratto
 */

export interface AutomationTask {
  id: string
  leadId: string
  automationType: 'NOTIFICA_INFO' | 'DOCUMENTI_INFORMATIVI' | 'INVIO_CONTRATTO' | 'INVIO_PROFORMA' | 'EMAIL_BENVENUTO' | 'EMAIL_CONFERMA' | 'PROMEMORIA_3GIORNI' | 'PROMEMORIA_5GIORNI'
  scheduledDate: string
  scheduledTime: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  attemptNumber: number
  executionData: {
    emailTemplate?: string
    documentUrls?: string[]
    personalizedContent?: Record<string, any>
  }
  createdAt: string
  updatedAt: string
  completedAt?: string
  errorMessage?: string
}

export interface AutomationSchedule {
  leadId: string
  customerName: string
  customerEmail: string
  serviceInterest: string
  urgencyLevel: string
  leadSource: string
  contractRequested: boolean
  preferredContactMethod?: string
}

export interface AutomationStats {
  totalTasksScheduled: number
  completed: number
  failed: number
  conversionRate: number // Email → Contratto richiesto
  averageNurtureTime: number // Giorni per conversione
  emailOpenRate: number
  documentDownloadRate: number
  automationPerformance: {
    emailWelcome: { sent: number; opened: number; rate: number }
    brochureSent: { sent: number; downloaded: number; rate: number }
    manualSent: { sent: number; downloaded: number; rate: number }
    reminders: { sent: number; converted: number; rate: number }
  }
}

class AutomationService {
  private static instance: AutomationService
  
  // Mock data per testing
  private automationTasks: AutomationTask[] = []
  private taskIdCounter = 1

  private constructor() {
    // Inizializza con task esistenti di esempio
    this.initializeMockTasks()
  }

  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService()
    }
    return AutomationService.instance
  }

  /**
   * Schedula automazione per lead TeleMedCare - FLUSSO CORRETTO
   */
  async scheduleLeadAutomation(schedule: AutomationSchedule): Promise<{
    success: boolean
    automationTasks?: AutomationTask[]
    error?: string
  }> {
    try {
      const now = new Date()
      const tasks: AutomationTask[] = []

      // 1. NOTIFICA IMMEDIATA: Invia email_notifica_info a info@medicagb.it
      tasks.push({
        id: `automation_${this.taskIdCounter++}`,
        leadId: schedule.leadId,
        automationType: 'NOTIFICA_INFO',
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: this.addMinutes(now, 1).toTimeString().substring(0, 5), // 1 minuto dopo
        priority: 'HIGH',
        status: 'SCHEDULED',
        attemptNumber: 1,
        executionData: {
          emailTemplate: 'email_notifica_info',
          recipientEmail: 'info@medicagb.it',
          personalizedContent: {
            nomeRichiedente: schedule.customerName.split(' ')[0] || '',
            cognomeRichiedente: schedule.customerName.split(' ')[1] || '',
            emailRichiedente: schedule.customerEmail,
            pianoServizio: schedule.serviceInterest,
            dataRichiesta: now.toLocaleDateString('it-IT'),
            oraRichiesta: now.toLocaleTimeString('it-IT')
          }
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      })

      // 2. BIFORCAZIONE BASATA SU RICHIESTA CONTRATTO
      if (schedule.contractRequested) {
        // FLUSSO PRINCIPALE: Con contratto
        
        // 2a. Invio contratto pre-compilato
        tasks.push({
          id: `automation_${this.taskIdCounter++}`,
          leadId: schedule.leadId,
          automationType: 'INVIO_CONTRATTO',
          scheduledDate: now.toISOString().split('T')[0],
          scheduledTime: this.addMinutes(now, 5).toTimeString().substring(0, 5), // 5 minuti dopo
          priority: 'HIGH',
          status: 'SCHEDULED',
          attemptNumber: 1,
          executionData: {
            emailTemplate: 'email_invio_contratto',
            recipientEmail: schedule.customerEmail,
            documentUrls: [
              schedule.serviceInterest.toLowerCase().includes('avanzato') 
                ? '/templates/contracts/contratto_avanzato.pdf'
                : '/templates/contracts/contratto_base.pdf'
            ],
            personalizedContent: {
              nomeCliente: schedule.customerName,
              pianoServizio: schedule.serviceInterest,
              emailCliente: schedule.customerEmail
            }
          },
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        })
        
      } else {
        // FLUSSO SECONDARIO: Solo documenti informativi
        
        // 2b. Invio documenti informativi
        tasks.push({
          id: `automation_${this.taskIdCounter++}`,
          leadId: schedule.leadId,
          automationType: 'DOCUMENTI_INFORMATIVI',
          scheduledDate: now.toISOString().split('T')[0],
          scheduledTime: this.addMinutes(now, 5).toTimeString().substring(0, 5),
          priority: 'MEDIUM',
          status: 'SCHEDULED',
          attemptNumber: 1,
          executionData: {
            emailTemplate: 'email_documenti_informativi',
            recipientEmail: 'info@medicagb.it',
            personalizedContent: {
              nomeCliente: schedule.customerName,
              emailCliente: schedule.customerEmail
            }
          },
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        })

        // 3. PROMEMORIA 3 GIORNI: Vuoi il contratto?
        const threeDaysLater = this.addDays(now, 3)
        tasks.push({
          id: `automation_${this.taskIdCounter++}`,
          leadId: schedule.leadId,
          automationType: 'PROMEMORIA_3GIORNI',
          scheduledDate: threeDaysLater.toISOString().split('T')[0],
          scheduledTime: '10:00',
          priority: 'MEDIUM',
          status: 'SCHEDULED',
          attemptNumber: 1,
          executionData: {
            emailTemplate: 'email_promemoria',
            recipientEmail: schedule.customerEmail,
            personalizedContent: {
              nomeCliente: schedule.customerName,
              tipoPromemoria: 'PRIMO_CONTRATTO',
              contractLink: `/contract-request?lead=${schedule.leadId}`
            }
          },
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        })

        // 4. PROMEMORIA 5 GIORNI: Seconda richiesta contratto
        const fiveDaysLater = this.addDays(threeDaysLater, 2) // 3+2=5 giorni totali
        tasks.push({
          id: `automation_${this.taskIdCounter++}`,
          leadId: schedule.leadId,
          automationType: 'PROMEMORIA_5GIORNI',
          scheduledDate: fiveDaysLater.toISOString().split('T')[0],
          scheduledTime: '15:00',
          priority: 'HIGH',
          status: 'SCHEDULED',
          attemptNumber: 1,
          executionData: {
            emailTemplate: 'email_promemoria',
            recipientEmail: schedule.customerEmail,
            personalizedContent: {
              nomeCliente: schedule.customerName,
              tipoPromemoria: 'SECONDO_CONTRATTO',
              contractLink: `/contract-request?lead=${schedule.leadId}`,
              offertaScadenza: this.addDays(fiveDaysLater, 3).toISOString().split('T')[0]
            }
          },
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        })
      }

      // Salva tasks
      this.automationTasks.push(...tasks)

      console.log(`✅ Automazione schedulata per lead ${schedule.leadId}: ${tasks.length} task programmati`)

      // Salva tasks
      this.automationTasks.push(...tasks)

      console.log(`✅ Automazione schedulata per lead ${schedule.leadId}: ${tasks.length} task programmati`)

      return {
        success: true,
        automationTasks: tasks
      }
    } catch (error) {
      console.error('❌ Errore schedulazione automazione:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore schedulazione automazione'
      }
    }
  }

  /**
   * Schedula email dopo firma contratto (invio proforma)
   */
  async schedulePostContractSigning(leadId: string, customerName: string, customerEmail: string, serviceType: string): Promise<{
    success: boolean
    automationTask?: AutomationTask
    error?: string
  }> {
    try {
      const now = new Date()
      
      const task: AutomationTask = {
        id: `automation_${this.taskIdCounter++}`,
        leadId: leadId,
        automationType: 'INVIO_PROFORMA',
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: this.addMinutes(now, 2).toTimeString().substring(0, 5),
        priority: 'HIGH',
        status: 'SCHEDULED',
        attemptNumber: 1,
        executionData: {
          emailTemplate: 'email_invio_proforma',
          recipientEmail: customerEmail,
          documentUrls: ['/templates/contracts/proforma_unificata.pdf'],
          personalizedContent: {
            nomeCliente: customerName,
            pianoServizio: serviceType,
            emailCliente: customerEmail
          }
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }

      this.automationTasks.push(task)
      
      return {
        success: true,
        automationTask: task
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore schedulazione post firma'
      }
    }
  }

  /**
   * Schedula email di benvenuto dopo pagamento
   */
  async schedulePostPayment(leadId: string, customerName: string, customerEmail: string, serviceType: string): Promise<{
    success: boolean
    automationTask?: AutomationTask
    error?: string
  }> {
    try {
      const now = new Date()
      
      const task: AutomationTask = {
        id: `automation_${this.taskIdCounter++}`,
        leadId: leadId,
        automationType: 'EMAIL_BENVENUTO',
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: this.addMinutes(now, 5).toTimeString().substring(0, 5),
        priority: 'HIGH',
        status: 'SCHEDULED',
        attemptNumber: 1,
        executionData: {
          emailTemplate: 'email_benvenuto',
          recipientEmail: customerEmail,
          personalizedContent: {
            nomeCliente: customerName,
            pianoServizio: serviceType,
            dataAttivazione: now.toLocaleDateString('it-IT'),
            codiceCliente: `TCM-${leadId.substring(-6)}`
          }
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }

      this.automationTasks.push(task)
      
      return {
        success: true,
        automationTask: task
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore schedulazione post pagamento'
      }
    }
  }

  /**
   * Schedula email di conferma dopo form configurazione
   */
  async schedulePostConfiguration(leadId: string, customerName: string, customerEmail: string, deviceId?: string): Promise<{
    success: boolean
    automationTask?: AutomationTask
    error?: string
  }> {
    try {
      const now = new Date()
      
      const task: AutomationTask = {
        id: `automation_${this.taskIdCounter++}`,
        leadId: leadId,
        automationType: 'EMAIL_CONFERMA',
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: this.addMinutes(now, 1).toTimeString().substring(0, 5),
        priority: 'HIGH',
        status: 'SCHEDULED',
        attemptNumber: 1,
        executionData: {
          emailTemplate: 'email_conferma',
          recipientEmail: customerEmail,
          personalizedContent: {
            nomeCliente: customerName,
            dispositivoId: deviceId || 'SiDLY-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
            dataAssociazione: now.toLocaleDateString('it-IT')
          }
        },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }

      this.automationTasks.push(task)
      
      return {
        success: true,
        automationTask: task
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore schedulazione conferma'
      }
    }
  }

  /**
   * Ottieni task automazione di oggi
   */
  async getTodayAutomationTasks(): Promise<AutomationTask[]> {
    const today = new Date().toISOString().split('T')[0]
    return this.automationTasks.filter(task => 
      task.scheduledDate === today && 
      task.status !== 'CANCELLED'
    ).sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))
  }

  /**
   * Ottieni task per lead specifico
   */
  async getAutomationTasksByLead(leadId: string): Promise<AutomationTask[]> {
    return this.automationTasks.filter(task => task.leadId === leadId)
  }

  /**
   * Completa task automazione
   */
  async completeAutomationTask(taskId: string, result: {
    success: boolean
    errorMessage?: string
    executionData?: any
  }): Promise<{
    success: boolean
    task?: AutomationTask
    error?: string
  }> {
    try {
      const task = this.automationTasks.find(t => t.id === taskId)
      if (!task) {
        return { success: false, error: 'Task non trovato' }
      }

      task.status = result.success ? 'COMPLETED' : 'FAILED'
      task.completedAt = new Date().toISOString()
      task.updatedAt = new Date().toISOString()
      if (result.errorMessage) {
        task.errorMessage = result.errorMessage
      }

      return {
        success: true,
        task
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore completamento task'
      }
    }
  }

  /**
   * Ottieni statistiche automazione
   */
  async getAutomationStats(period: 'today' | 'week' | 'month' = 'today'): Promise<AutomationStats> {
    // Mock statistics per testing
    return {
      totalTasksScheduled: this.automationTasks.length,
      completed: this.automationTasks.filter(t => t.status === 'COMPLETED').length,
      failed: this.automationTasks.filter(t => t.status === 'FAILED').length,
      conversionRate: 0.23, // 23% dei lead informativi richiedono contratto dopo automazione
      averageNurtureTime: 4.2, // 4.2 giorni media per conversione
      emailOpenRate: 0.78, // 78% aperture email
      documentDownloadRate: 0.45, // 45% scarica documenti
      automationPerformance: {
        emailWelcome: { sent: 156, opened: 134, rate: 0.86 },
        brochureSent: { sent: 156, downloaded: 89, rate: 0.57 },
        manualSent: { sent: 156, downloaded: 67, rate: 0.43 },
        reminders: { sent: 89, converted: 23, rate: 0.26 }
      }
    }
  }

  /**
   * Verifica task pronti per esecuzione
   */
  async getTasksReadyForExecution(): Promise<AutomationTask[]> {
    const now = new Date()
    const currentDate = now.toISOString().split('T')[0]
    const currentTime = now.toTimeString().substring(0, 5)

    return this.automationTasks.filter(task => 
      task.status === 'SCHEDULED' &&
      (task.scheduledDate < currentDate || 
       (task.scheduledDate === currentDate && task.scheduledTime <= currentTime))
    )
  }

  // Helper methods
  private addMinutes(date: Date, minutes: number): Date {
    return new Date(date.getTime() + minutes * 60000)
  }

  private addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
  }

  private initializeMockTasks(): void {
    // Task di esempio con automation types italiani corretti
    const now = new Date()
    this.automationTasks = [
      {
        id: 'automation_001',
        leadId: 'LEAD_TCM_001', 
        automationType: 'NOTIFICA_INFO',
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: '09:00',
        priority: 'HIGH',
        status: 'COMPLETED',
        attemptNumber: 1,
        executionData: {
          emailTemplate: 'email_notifica_info',
          recipientEmail: 'info@medicagb.it'
        },
        createdAt: new Date(now.getTime() - 3600000).toISOString(),
        updatedAt: new Date(now.getTime() - 3000000).toISOString(),
        completedAt: new Date(now.getTime() - 3000000).toISOString()
      },
      {
        id: 'automation_002',
        leadId: 'LEAD_TCM_002',
        automationType: 'DOCUMENTI_INFORMATIVI',
        scheduledDate: now.toISOString().split('T')[0],
        scheduledTime: '14:30',
        priority: 'MEDIUM',
        status: 'SCHEDULED',
        attemptNumber: 1,
        executionData: {
          emailTemplate: 'email_documenti_informativi',
          documentUrls: ['/templates/brochures/brochure_telemedcare.pdf']
        },
        createdAt: new Date(now.getTime() - 1800000).toISOString(),
        updatedAt: new Date(now.getTime() - 1800000).toISOString()
      }
    ]

    this.taskIdCounter = 3
  }
}

export { AutomationService }
export default AutomationService