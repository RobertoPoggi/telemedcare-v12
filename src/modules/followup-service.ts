/**
 * FOLLOWUP_SERVICE.TS - Sistema Follow-up Call Scheduling and Tracking
 * TeleMedCare V11.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Schedulazione automatica chiamate follow-up basate su preferenze lead
 * - Tracking chiamate effettuate e risultati
 * - Automazione promemoria e riassegnazioni
 * - Integrazione con CRM e pipeline di conversione
 * - Reportistica performance follow-up
 */

export interface FollowUpCall {
  id: string
  leadId: string
  assignedOperator: string
  scheduledDate: string
  scheduledTime: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'RESCHEDULED' | 'CANCELLED'
  attemptNumber: number
  callType: 'INFORMATION' | 'CONSULTATION' | 'CONTRACT_DISCUSSION' | 'FOLLOW_UP' | 'TECHNICAL_SUPPORT'
  notes?: string
  outcome?: 'CONVERTED' | 'INTERESTED' | 'NOT_INTERESTED' | 'CALLBACK_REQUESTED' | 'TECHNICAL_ISSUE' | 'NO_ANSWER'
  nextAction?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  duration?: number // in minutes
  rescheduleReason?: string
}

export interface FollowUpSchedule {
  leadId: string
  customerName: string
  customerPhone: string
  customerEmail: string
  preferredContactMethod: 'Email' | 'Telefono' | 'WhatsApp'
  urgencyLevel: 'Bassa urgenza' | 'Media urgenza' | 'Alta urgenza' | 'Urgente'
  leadSource: string
  serviceInterest: string
  contractRequested: boolean
  bestTimeToCall?: string
  timezone?: string
  languagePreference?: string
}

export interface OperatorSchedule {
  operatorId: string
  operatorName: string
  email: string
  phone: string
  workingHours: {
    start: string // "09:00"
    end: string   // "18:00"
  }
  timezone: string
  availability: {
    [date: string]: {  // "2025-01-15"
      available: boolean
      slots: string[]  // ["09:00", "09:30", "10:00"]
      maxCalls?: number
    }
  }
  specializations: string[]
  performance: {
    totalCalls: number
    successfulCalls: number
    conversionRate: number
    averageCallDuration: number
  }
}

export interface FollowUpRule {
  id: string
  name: string
  description: string
  conditions: {
    urgencyLevel?: string[]
    serviceInterest?: string[]
    contractRequested?: boolean
    leadSource?: string[]
    timeOfDay?: string[]
  }
  actions: {
    scheduleWithinHours: number
    assignToOperator?: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    maxAttempts: number
    rescheduleIntervalHours: number
  }
  active: boolean
}

export class FollowUpService {
  private static instance: FollowUpService | null = null

  static getInstance(): FollowUpService {
    if (!FollowUpService.instance) {
      FollowUpService.instance = new FollowUpService()
    }
    return FollowUpService.instance
  }

  private constructor() {}

  /**
   * Regole di schedulazione automatica predefinite
   */
  private static readonly DEFAULT_RULES: FollowUpRule[] = [
    {
      id: 'urgent_contract_rule',
      name: 'Richieste Contratto Urgenti',
      description: 'Chiamata immediata per richieste contratto con alta urgenza',
      conditions: {
        urgencyLevel: ['Alta urgenza', 'Urgente'],
        contractRequested: true
      },
      actions: {
        scheduleWithinHours: 1,
        priority: 'URGENT',
        maxAttempts: 5,
        rescheduleIntervalHours: 2
      },
      active: true
    },
    {
      id: 'medium_priority_rule',
      name: 'Richieste Media Priorità',
      description: 'Chiamata entro 4 ore per urgenza media',
      conditions: {
        urgencyLevel: ['Media urgenza']
      },
      actions: {
        scheduleWithinHours: 4,
        priority: 'MEDIUM',
        maxAttempts: 3,
        rescheduleIntervalHours: 24
      },
      active: true
    },
    {
      id: 'low_priority_rule',
      name: 'Richieste Informative',
      description: 'Chiamata entro 24 ore per richieste informative',
      conditions: {
        urgencyLevel: ['Bassa urgenza'],
        contractRequested: false
      },
      actions: {
        scheduleWithinHours: 24,
        priority: 'LOW',
        maxAttempts: 2,
        rescheduleIntervalHours: 48
      },
      active: true
    },
    {
      id: 'advanced_service_rule',
      name: 'Servizi Avanzati',
      description: 'Priorità alta per interessati ai servizi avanzati',
      conditions: {
        serviceInterest: ['TeleAssistenza Avanzata']
      },
      actions: {
        scheduleWithinHours: 2,
        priority: 'HIGH',
        maxAttempts: 4,
        rescheduleIntervalHours: 12
      },
      active: true
    }
  ]

  /**
   * Operatori predefiniti (esempio)
   */
  private static readonly DEFAULT_OPERATORS: OperatorSchedule[] = [
    {
      operatorId: 'op_001',
      operatorName: 'Sofia Martinelli',
      email: 'sofia.martinelli@medicagb.it',
      phone: '+39 02 123 4567',
      workingHours: { start: '09:00', end: '18:00' },
      timezone: 'Europe/Rome',
      availability: {},
      specializations: ['Contratti', 'Servizi Avanzati', 'Consulenza Medica'],
      performance: { totalCalls: 150, successfulCalls: 135, conversionRate: 0.68, averageCallDuration: 12 }
    },
    {
      operatorId: 'op_002', 
      operatorName: 'Marco Rossi',
      email: 'marco.rossi@medicagb.it',
      phone: '+39 02 234 5678',
      workingHours: { start: '10:00', end: '19:00' },
      timezone: 'Europe/Rome',
      availability: {},
      specializations: ['Informazioni Generali', 'Supporto Tecnico'],
      performance: { totalCalls: 120, successfulCalls: 98, conversionRate: 0.45, averageCallDuration: 8 }
    },
    {
      operatorId: 'op_003',
      operatorName: 'Elena Conti',
      email: 'elena.conti@medicagb.it', 
      phone: '+39 02 345 6789',
      workingHours: { start: '08:00', end: '17:00' },
      timezone: 'Europe/Rome',
      availability: {},
      specializations: ['Contratti', 'Emergenze', 'Clienti Speciali'],
      performance: { totalCalls: 200, successfulCalls: 180, conversionRate: 0.75, averageCallDuration: 15 }
    }
  ]

  /**
   * Schedula automaticamente una chiamata follow-up basata sui dati del lead
   */
  async scheduleFollowUpCall(schedule: FollowUpSchedule): Promise<{
    success: boolean
    followUpCall?: FollowUpCall
    error?: string
  }> {
    try {
      // 1. Determina regola applicabile
      const applicableRule = this.findApplicableRule(schedule)
      if (!applicableRule) {
        return { success: false, error: 'Nessuna regola applicabile trovata' }
      }

      // 2. Calcola orario schedulazione
      const scheduledDateTime = this.calculateScheduledTime(
        applicableRule.actions.scheduleWithinHours,
        schedule.preferredContactMethod
      )

      // 3. Assegna operatore
      const assignedOperator = await this.assignOptimalOperator(schedule, applicableRule)
      if (!assignedOperator) {
        return { success: false, error: 'Nessun operatore disponibile' }
      }

      // 4. Crea follow-up call
      const followUpCall: FollowUpCall = {
        id: this.generateFollowUpId(),
        leadId: schedule.leadId,
        assignedOperator: assignedOperator.operatorId,
        scheduledDate: scheduledDateTime.date,
        scheduledTime: scheduledDateTime.time,
        priority: applicableRule.actions.priority,
        status: 'SCHEDULED',
        attemptNumber: 1,
        callType: this.determineCallType(schedule),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // 5. Salva nel sistema (in produzione salvare su D1)
      console.log(`📞 Follow-up schedulato: ${followUpCall.id}`)
      
      return { success: true, followUpCall }

    } catch (error) {
      return { success: false, error: `Errore schedulazione: ${error}` }
    }
  }

  /**
   * Trova la regola più specifica applicabile al lead
   */
  private findApplicableRule(schedule: FollowUpSchedule): FollowUpRule | null {
    const rules = FollowUpService.DEFAULT_RULES.filter(rule => rule.active)
    
    let bestRule: FollowUpRule | null = null
    let maxScore = 0

    for (const rule of rules) {
      let score = 0

      // Verifica condizioni e assegna punteggio
      if (rule.conditions.urgencyLevel?.includes(schedule.urgencyLevel)) score += 10
      if (rule.conditions.contractRequested === schedule.contractRequested) score += 5
      if (rule.conditions.serviceInterest?.includes(schedule.serviceInterest)) score += 8
      if (rule.conditions.leadSource?.includes(schedule.leadSource)) score += 3

      if (score > maxScore) {
        maxScore = score
        bestRule = rule
      }
    }

    return bestRule
  }

  /**
   * Calcola l'orario ottimale per la chiamata
   */
  private calculateScheduledTime(
    scheduleWithinHours: number,
    preferredContactMethod: string
  ): { date: string, time: string } {
    const now = new Date()
    const targetTime = new Date(now.getTime() + (scheduleWithinHours * 60 * 60 * 1000))

    // Adjust per orari lavorativi (9:00-18:00)
    let scheduledHour = targetTime.getHours()
    if (scheduledHour < 9) scheduledHour = 9
    if (scheduledHour > 18) {
      targetTime.setDate(targetTime.getDate() + 1)
      scheduledHour = 9
    }

    // Weekend -> Lunedì
    const dayOfWeek = targetTime.getDay()
    if (dayOfWeek === 0) targetTime.setDate(targetTime.getDate() + 1) // Domenica -> Lunedì
    if (dayOfWeek === 6) targetTime.setDate(targetTime.getDate() + 2) // Sabato -> Lunedì

    targetTime.setHours(scheduledHour, 0, 0, 0)

    return {
      date: targetTime.toISOString().split('T')[0],
      time: `${scheduledHour.toString().padStart(2, '0')}:00`
    }
  }

  /**
   * Assegna l'operatore più adatto
   */
  private async assignOptimalOperator(
    schedule: FollowUpSchedule,
    rule: FollowUpRule
  ): Promise<OperatorSchedule | null> {
    const operators = FollowUpService.DEFAULT_OPERATORS

    // Filtra per specializzazioni
    let eligibleOperators = operators.filter(op => {
      if (schedule.contractRequested && op.specializations.includes('Contratti')) return true
      if (schedule.serviceInterest.includes('Avanzata') && op.specializations.includes('Servizi Avanzati')) return true
      if (schedule.urgencyLevel === 'Alta urgenza' && op.specializations.includes('Emergenze')) return true
      return op.specializations.includes('Informazioni Generali')
    })

    if (eligibleOperators.length === 0) {
      eligibleOperators = operators
    }

    // Ordina per performance e disponibilità
    eligibleOperators.sort((a, b) => {
      const scoreA = a.performance.conversionRate * 0.7 + (a.performance.successfulCalls / a.performance.totalCalls) * 0.3
      const scoreB = b.performance.conversionRate * 0.7 + (b.performance.successfulCalls / b.performance.totalCalls) * 0.3
      return scoreB - scoreA
    })

    return eligibleOperators[0] || null
  }

  /**
   * Determina il tipo di chiamata basato sui dati lead
   */
  private determineCallType(schedule: FollowUpSchedule): FollowUpCall['callType'] {
    if (schedule.contractRequested) return 'CONTRACT_DISCUSSION'
    if (schedule.urgencyLevel === 'Alta urgenza') return 'CONSULTATION'
    if (schedule.serviceInterest.includes('Avanzata')) return 'INFORMATION'
    return 'FOLLOW_UP'
  }

  /**
   * Aggiorna stato chiamata
   */
  async updateCallStatus(
    callId: string, 
    status: FollowUpCall['status'],
    notes?: string,
    outcome?: FollowUpCall['outcome'],
    duration?: number
  ): Promise<{ success: boolean, error?: string }> {
    try {
      // In produzione: aggiornare record su D1
      const updateData = {
        status,
        notes,
        outcome,
        duration,
        updatedAt: new Date().toISOString(),
        ...(status === 'COMPLETED' && { completedAt: new Date().toISOString() })
      }

      console.log(`📞 Call ${callId} aggiornata:`, updateData)
      return { success: true }
    } catch (error) {
      return { success: false, error: `Errore aggiornamento: ${error}` }
    }
  }

  /**
   * Riprogramma chiamata mancata
   */
  async rescheduleCall(
    callId: string,
    reason: string,
    newDateTime?: { date: string, time: string }
  ): Promise<{ success: boolean, newCall?: FollowUpCall, error?: string }> {
    try {
      // Calcola nuovo orario se non specificato
      const scheduledDateTime = newDateTime || this.calculateScheduledTime(2, 'Telefono')

      const rescheduledCall: FollowUpCall = {
        id: this.generateFollowUpId(),
        leadId: 'existing_lead', // In produzione: ottenere da DB
        assignedOperator: 'op_001', // In produzione: riassegnare se necessario
        scheduledDate: scheduledDateTime.date,
        scheduledTime: scheduledDateTime.time,
        priority: 'MEDIUM',
        status: 'SCHEDULED',
        attemptNumber: 2, // In produzione: incrementare dal record esistente
        callType: 'FOLLOW_UP',
        rescheduleReason: reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      return { success: true, newCall: rescheduledCall }
    } catch (error) {
      return { success: false, error: `Errore riprogrammazione: ${error}` }
    }
  }

  /**
   * Ottieni chiamate programmate per operatore
   */
  async getOperatorSchedule(
    operatorId: string, 
    startDate: string, 
    endDate: string
  ): Promise<FollowUpCall[]> {
    // In produzione: query D1 database
    return []
  }

  /**
   * Ottieni statistiche follow-up
   */
  async getFollowUpStats(period: 'today' | 'week' | 'month'): Promise<{
    totalScheduled: number
    completed: number
    missed: number
    conversionRate: number
    averageDuration: number
    operatorPerformance: Array<{
      operatorId: string
      operatorName: string
      calls: number
      conversions: number
      rate: number
    }>
  }> {
    // Mock data - in produzione query da D1
    return {
      totalScheduled: 45,
      completed: 38,
      missed: 7,
      conversionRate: 0.72,
      averageDuration: 11.5,
      operatorPerformance: [
        { operatorId: 'op_001', operatorName: 'Sofia Martinelli', calls: 15, conversions: 12, rate: 0.80 },
        { operatorId: 'op_002', operatorName: 'Marco Rossi', calls: 12, conversions: 8, rate: 0.67 },
        { operatorId: 'op_003', operatorName: 'Elena Conti', calls: 18, conversions: 15, rate: 0.83 }
      ]
    }
  }

  /**
   * Ottieni chiamate da completare oggi
   */
  async getTodayFollowUps(): Promise<FollowUpCall[]> {
    const today = new Date().toISOString().split('T')[0]
    
    // Mock data - in produzione query da D1
    const mockCalls: FollowUpCall[] = [
      {
        id: 'call_001',
        leadId: 'lead_123',
        assignedOperator: 'op_001',
        scheduledDate: today,
        scheduledTime: '10:00',
        priority: 'HIGH',
        status: 'SCHEDULED',
        attemptNumber: 1,
        callType: 'CONTRACT_DISCUSSION',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'call_002',
        leadId: 'lead_124',
        assignedOperator: 'op_002',
        scheduledDate: today,
        scheduledTime: '14:30',
        priority: 'MEDIUM',
        status: 'SCHEDULED',
        attemptNumber: 1,
        callType: 'INFORMATION',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    return mockCalls
  }

  /**
   * Genera ID univoco per follow-up
   */
  private generateFollowUpId(): string {
    return `FUP_${new Date().getFullYear()}_${String(Date.now()).slice(-8)}`
  }

  /**
   * Ottieni regole di schedulazione attive
   */
  getActiveRules(): FollowUpRule[] {
    return FollowUpService.DEFAULT_RULES.filter(rule => rule.active)
  }

  /**
   * Ottieni operatori disponibili
   */
  getAvailableOperators(): OperatorSchedule[] {
    return FollowUpService.DEFAULT_OPERATORS
  }
}