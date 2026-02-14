/**
 * LEAD_MANAGER.TS - Sistema Gestione Lead TeleMedCare
 * TeleMedCare V12.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Acquisizione lead da landing page e form contatti
 * - Classificazione automatica lead (scoring e priorità)
 * - Assignment automatico lead agli operatori
 * - Workflow di follow-up automatico
 * - Tracking conversazioni e interazioni
 * - Conversione lead in clienti
 * - Analytics e reporting lead pipeline
 */

export interface Lead {
  id: string
  
  // Dati identificativi
  firstName: string
  lastName: string
  email: string
  phone?: string
  
  // Dati demografici
  age?: number
  gender?: 'M' | 'F' | 'OTHER'
  city?: string
  region?: string
  country?: string
  
  // Dati medici interesse
  medicalConditions?: string[]
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  serviceInterest: string[]
  preferredContactMethod: 'EMAIL' | 'PHONE' | 'WHATSAPP' | 'SMS'
  
  // Lead scoring
  score: number // 0-100
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  quality: 'HOT' | 'WARM' | 'COLD'
  
  // Status workflow
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST' | 'NURTURING'
  stage: string // Fase specifica workflow
  
  // Assignment
  assignedTo?: string
  assignedAt?: string
  
  // Source tracking
  source: 'LANDING_PAGE' | 'GOOGLE_ADS' | 'FACEBOOK' | 'REFERRAL' | 'ORGANIC' | 'DIRECT' | 'PHONE' | 'EMAIL'
  campaign?: string
  referrer?: string
  
  // Interaction tracking
  interactions: LeadInteraction[]
  lastInteractionAt?: string
  nextFollowUpAt?: string
  
  // Conversion tracking
  convertedAt?: string
  conversionValue?: number
  lostReason?: string
  
  // Metadata
  createdAt: string
  updatedAt: string
  notes?: string
  tags?: string[]
}

export interface LeadInteraction {
  id: string
  leadId: string
  type: 'EMAIL' | 'PHONE' | 'WHATSAPP' | 'SMS' | 'MEETING' | 'DOCUMENT' | 'PAYMENT' | 'SIGNATURE'
  direction: 'INBOUND' | 'OUTBOUND'
  
  // Content
  subject?: string
  content?: string
  attachments?: string[]
  
  // Metadata
  performedBy: string
  performedAt: string
  duration?: number // minuti per chiamate/meeting
  
  // Outcome
  outcome?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  nextAction?: string
  scheduledFollowUp?: string
  
  // Integration data
  externalId?: string // ID da sistemi esterni (email, CRM, etc)
  metadata?: Record<string, any>
}

export interface LeadScoringCriteria {
  demographicScore: number
  behaviorScore: number
  engagementScore: number
  urgencyScore: number
  serviceInterestScore: number
  sourceScore: number
}

export interface LeadResult {
  success: boolean
  data?: Lead | Lead[]
  error?: string
  timestamp: string
}

// =====================================================================
// LEAD SCORING CONFIGURATION
// =====================================================================

export const LEAD_SCORING_RULES = {
  // Punteggi demografici
  DEMOGRAPHIC: {
    AGE_18_35: 10,
    AGE_36_55: 15,
    AGE_56_70: 20,
    AGE_70_PLUS: 25,
    CITY_MAJOR: 10,
    CITY_MINOR: 5,
    REGION_NORTH: 15,
    REGION_CENTER: 10,
    REGION_SOUTH: 5
  },
  
  // Punteggi comportamentali
  BEHAVIOR: {
    FORM_COMPLETE: 25,
    PHONE_PROVIDED: 15,
    MEDICAL_DETAILS: 20,
    URGENT_REQUEST: 30,
    RETURN_VISITOR: 10,
    MULTIPLE_PAGES: 5
  },
  
  // Punteggi engagement
  ENGAGEMENT: {
    EMAIL_RESPONSE: 20,
    PHONE_ANSWERED: 25,
    APPOINTMENT_SCHEDULED: 30,
    DOCUMENT_VIEWED: 10,
    WEBSITE_TIME_5MIN_PLUS: 15
  },
  
  // Punteggi urgenza
  URGENCY: {
    CRITICAL: 40,
    HIGH: 30,
    MEDIUM: 15,
    LOW: 5
  },
  
  // Punteggi servizi interesse
  SERVICE_INTEREST: {
    TELEMEDICINE: 20,
    DEVICE_MONITORING: 15,
    CONSULTATION: 10,
    SUBSCRIPTION: 25,
    EMERGENCY_CARE: 35
  },
  
  // Punteggi source
  SOURCE: {
    GOOGLE_ADS: 20,
    FACEBOOK_ADS: 15,
    REFERRAL: 25,
    ORGANIC: 10,
    DIRECT: 15,
    PHONE: 20,
    EMAIL: 5
  }
}

// =====================================================================
// LEAD MANAGER SERVICE
// =====================================================================

export class LeadManager {
  private static instance: LeadManager | null = null

  // Lazy loading per Cloudflare Workers
  static getInstance(): LeadManager {
    if (!LeadManager.instance) {
      LeadManager.instance = new LeadManager()
    }
    return LeadManager.instance
  }

  /**
   * Crea nuovo lead da form contatti
   */
  async createLead(leadData: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    medicalConditions?: string[]
    serviceInterest: string[]
    urgencyLevel?: Lead['urgencyLevel']
    preferredContactMethod?: Lead['preferredContactMethod']
    source: Lead['source']
    campaign?: string
    referrer?: string
    notes?: string
  }): Promise<LeadResult> {
    try {
      const leadId = `LEAD_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      console.log('🆕 Creazione nuovo lead:', {
        name: `${leadData.firstName} ${leadData.lastName}`,
        email: leadData.email,
        source: leadData.source
      })

      // Calcola lead scoring
      const scoring = await this.calculateLeadScore({
        ...leadData,
        id: leadId
      })

      const newLead: Lead = {
        id: leadId,
        firstName: leadData.firstName,
        lastName: leadData.lastName,
        email: leadData.email,
        phone: leadData.phone,
        medicalConditions: leadData.medicalConditions || [],
        urgencyLevel: leadData.urgencyLevel || 'MEDIUM',
        serviceInterest: leadData.serviceInterest,
        preferredContactMethod: leadData.preferredContactMethod || 'EMAIL',
        
        // Lead scoring automatico
        score: scoring.totalScore,
        priority: this.determinePriority(scoring.totalScore),
        quality: this.determineQuality(scoring),
        
        // Status iniziale
        status: 'NEW',
        stage: 'LEAD_ACQUISITION',
        
        // Source tracking
        source: leadData.source,
        campaign: leadData.campaign,
        referrer: leadData.referrer,
        
        // Interactions vuoto inizialmente
        interactions: [],
        
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: leadData.notes,
        tags: []
      }

      // Salva lead in database
      await this.saveLead(newLead)
      
      // Assegna automaticamente lead
      await this.autoAssignLead(newLead)
      
      // Avvia workflow automatico
      await this.startLeadWorkflow(newLead)

      console.log('✅ Lead creato e workflow avviato:', leadId)

      return {
        success: true,
        data: newLead,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Errore creazione lead:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore creazione lead',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Aggiorna status lead
   */
  async updateLeadStatus(
    leadId: string, 
    newStatus: Lead['status'],
    notes?: string,
    performedBy?: string
  ): Promise<LeadResult> {
    try {
      console.log(`🔄 Aggiornamento status lead ${leadId}: ${newStatus}`)
      
      const lead = await this.getLeadById(leadId)
      if (!lead.success || !lead.data) {
        return {
          success: false,
          error: 'Lead non trovato',
          timestamp: new Date().toISOString()
        }
      }

      const updatedLead = lead.data as Lead
      updatedLead.status = newStatus
      updatedLead.updatedAt = new Date().toISOString()
      
      if (notes) {
        updatedLead.notes = `${updatedLead.notes || ''}\n[${new Date().toISOString()}] ${notes}`
      }

      // Registra interazione
      await this.addInteraction(leadId, {
        type: 'DOCUMENT',
        direction: 'OUTBOUND',
        subject: `Status aggiornato a ${newStatus}`,
        content: notes,
        performedBy: performedBy || 'sistema',
        outcome: 'NEUTRAL'
      })

      // Workflow specifici per status
      switch (newStatus) {
        case 'QUALIFIED':
          await this.onLeadQualified(updatedLead)
          break
        case 'PROPOSAL':
          await this.onLeadProposal(updatedLead)
          break
        case 'WON':
          await this.onLeadConverted(updatedLead)
          break
        case 'LOST':
          await this.onLeadLost(updatedLead)
          break
      }

      await this.saveLead(updatedLead)

      return {
        success: true,
        data: updatedLead,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Errore aggiornamento status lead:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore aggiornamento status',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Aggiungi interazione a lead
   */
  async addInteraction(
    leadId: string,
    interactionData: {
      type: LeadInteraction['type']
      direction: LeadInteraction['direction']
      subject?: string
      content?: string
      attachments?: string[]
      performedBy: string
      duration?: number
      outcome?: LeadInteraction['outcome']
      nextAction?: string
      scheduledFollowUp?: string
    }
  ): Promise<LeadResult> {
    try {
      const interactionId = `INT_${Date.now()}_${Math.random().toString(36).substring(2)}`
      
      console.log(`💬 Aggiunta interazione a lead ${leadId}:`, interactionData.type)

      const interaction: LeadInteraction = {
        id: interactionId,
        leadId: leadId,
        ...interactionData,
        performedAt: new Date().toISOString()
      }

      // Ottieni lead esistente
      const leadResult = await this.getLeadById(leadId)
      if (!leadResult.success || !leadResult.data) {
        return {
          success: false,
          error: 'Lead non trovato',
          timestamp: new Date().toISOString()
        }
      }

      const lead = leadResult.data as Lead
      lead.interactions.push(interaction)
      lead.lastInteractionAt = interaction.performedAt
      lead.updatedAt = new Date().toISOString()
      
      // Imposta prossimo follow-up se specificato
      if (interactionData.scheduledFollowUp) {
        lead.nextFollowUpAt = interactionData.scheduledFollowUp
      }

      await this.saveLead(lead)

      // 🔄 Auto-aggiornamento stato: "Non Risponde" se nelle note c'è "non risponde"
      const content = (interactionData.content || '').toLowerCase()
      const subject = (interactionData.subject || '').toLowerCase()
      
      if (content.includes('non risponde') || subject.includes('non risponde')) {
        console.log(`📵 Auto-aggiornamento stato: impostato "non_risponde" per lead ${leadId}`)
        lead.stato = 'non_risponde'
        await this.saveLead(lead)
      }

      // Ricalcola score se interazione positiva
      if (interactionData.outcome === 'POSITIVE') {
        await this.recalculateLeadScore(leadId)
      }

      return {
        success: true,
        data: interaction,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Errore aggiunta interazione:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore aggiunta interazione',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Ottieni lead per ID
   */
  async getLeadById(leadId: string): Promise<LeadResult> {
    try {
      console.log(`🔍 Ricerca lead: ${leadId}`)
      
      // In produzione: query D1 database
      // const result = await env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(leadId).first()
      
      // Simula lead mock per testing
      const mockLead: Lead = {
        id: leadId,
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        phone: '+39 339 1234567',
        medicalConditions: ['ipertensione', 'diabete'],
        urgencyLevel: 'MEDIUM',
        serviceInterest: ['telemedicine', 'device_monitoring'],
        preferredContactMethod: 'EMAIL',
        score: 75,
        priority: 'HIGH',
        quality: 'HOT',
        status: 'NEW',
        stage: 'LEAD_ACQUISITION',
        source: 'GOOGLE_ADS',
        campaign: 'telemedcare_autumn_2024',
        interactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['high-value', 'chronic-condition']
      }

      return {
        success: true,
        data: mockLead,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Errore ricerca lead:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore ricerca lead',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Lista lead con filtri
   */
  async getLeads(filters?: {
    status?: Lead['status'][]
    priority?: Lead['priority'][]
    assignedTo?: string
    source?: Lead['source'][]
    dateFrom?: string
    dateTo?: string
    limit?: number
    offset?: number
  }): Promise<LeadResult> {
    try {
      console.log('📋 Lista lead con filtri:', filters)
      
      // In produzione: query complessa D1 database con filtri
      // Simula per ora
      const mockLeads: Lead[] = [
        {
          id: 'LEAD_001',
          firstName: 'Mario',
          lastName: 'Rossi',
          email: 'mario.rossi@example.com',
          phone: '+39 339 1234567',
          medicalConditions: ['ipertensione'],
          urgencyLevel: 'MEDIUM',
          serviceInterest: ['telemedicine'],
          preferredContactMethod: 'EMAIL',
          score: 85,
          priority: 'HIGH',
          quality: 'HOT',
          status: 'NEW',
          stage: 'LEAD_ACQUISITION',
          source: 'GOOGLE_ADS',
          interactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'LEAD_002',
          firstName: 'Anna',
          lastName: 'Bianchi',
          email: 'anna.bianchi@example.com',
          phone: '+39 347 9876543',
          medicalConditions: ['diabete'],
          urgencyLevel: 'HIGH',
          serviceInterest: ['device_monitoring', 'consultation'],
          preferredContactMethod: 'PHONE',
          score: 92,
          priority: 'CRITICAL',
          quality: 'HOT',
          status: 'CONTACTED',
          stage: 'QUALIFICATION',
          source: 'REFERRAL',
          interactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      // Applica filtri mock
      let filteredLeads = mockLeads
      if (filters?.status) {
        filteredLeads = filteredLeads.filter(lead => filters.status!.includes(lead.status))
      }
      if (filters?.priority) {
        filteredLeads = filteredLeads.filter(lead => filters.priority!.includes(lead.priority))
      }

      return {
        success: true,
        data: filteredLeads,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      console.error('❌ Errore lista lead:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore lista lead',
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Statistiche lead pipeline
   */
  async getLeadStatistics(dateFrom?: string, dateTo?: string): Promise<{
    totalLeads: number
    newLeads: number
    convertedLeads: number
    conversionRate: number
    averageScore: number
    leadsByStatus: Record<Lead['status'], number>
    leadsBySource: Record<Lead['source'], number>
    leadsByPriority: Record<Lead['priority'], number>
  }> {
    try {
      console.log('📊 Calcolo statistiche lead pipeline')
      
      // In produzione: query aggregate D1 database
      // Simula per ora
      return {
        totalLeads: 247,
        newLeads: 23,
        convertedLeads: 18,
        conversionRate: 0.127, // 12.7%
        averageScore: 67.3,
        leadsByStatus: {
          'NEW': 23,
          'CONTACTED': 45,
          'QUALIFIED': 67,
          'PROPOSAL': 34,
          'NEGOTIATION': 12,
          'WON': 18,
          'LOST': 32,
          'NURTURING': 16
        },
        leadsBySource: {
          'LANDING_PAGE': 89,
          'GOOGLE_ADS': 67,
          'FACEBOOK': 34,
          'REFERRAL': 23,
          'ORGANIC': 18,
          'DIRECT': 12,
          'PHONE': 3,
          'EMAIL': 1
        },
        leadsByPriority: {
          'LOW': 45,
          'MEDIUM': 123,
          'HIGH': 67,
          'CRITICAL': 12
        }
      }

    } catch (error) {
      console.error('❌ Errore calcolo statistiche lead:', error)
      throw error
    }
  }

  // =====================================================================
  // PRIVATE METHODS
  // =====================================================================

  private async calculateLeadScore(leadData: Partial<Lead>): Promise<LeadScoringCriteria & { totalScore: number }> {
    const scoring: LeadScoringCriteria = {
      demographicScore: 0,
      behaviorScore: 0,
      engagementScore: 0,
      urgencyScore: 0,
      serviceInterestScore: 0,
      sourceScore: 0
    }

    // Calcola punteggi demografici
    if (leadData.age) {
      if (leadData.age >= 18 && leadData.age <= 35) scoring.demographicScore += LEAD_SCORING_RULES.DEMOGRAPHIC.AGE_18_35
      else if (leadData.age >= 36 && leadData.age <= 55) scoring.demographicScore += LEAD_SCORING_RULES.DEMOGRAPHIC.AGE_36_55
      else if (leadData.age >= 56 && leadData.age <= 70) scoring.demographicScore += LEAD_SCORING_RULES.DEMOGRAPHIC.AGE_56_70
      else if (leadData.age > 70) scoring.demographicScore += LEAD_SCORING_RULES.DEMOGRAPHIC.AGE_70_PLUS
    }

    // Calcola punteggi comportamentali
    scoring.behaviorScore += LEAD_SCORING_RULES.BEHAVIOR.FORM_COMPLETE
    if (leadData.phone) scoring.behaviorScore += LEAD_SCORING_RULES.BEHAVIOR.PHONE_PROVIDED
    if (leadData.medicalConditions && leadData.medicalConditions.length > 0) {
      scoring.behaviorScore += LEAD_SCORING_RULES.BEHAVIOR.MEDICAL_DETAILS
    }

    // Calcola punteggi urgenza
    if (leadData.urgencyLevel) {
      scoring.urgencyScore = LEAD_SCORING_RULES.URGENCY[leadData.urgencyLevel]
    }

    // Calcola punteggi servizi interesse
    if (leadData.serviceInterest) {
      leadData.serviceInterest.forEach(service => {
        switch (service.toLowerCase()) {
          case 'telemedicine': scoring.serviceInterestScore += LEAD_SCORING_RULES.SERVICE_INTEREST.TELEMEDICINE; break
          case 'device_monitoring': scoring.serviceInterestScore += LEAD_SCORING_RULES.SERVICE_INTEREST.DEVICE_MONITORING; break
          case 'consultation': scoring.serviceInterestScore += LEAD_SCORING_RULES.SERVICE_INTEREST.CONSULTATION; break
          case 'subscription': scoring.serviceInterestScore += LEAD_SCORING_RULES.SERVICE_INTEREST.SUBSCRIPTION; break
          case 'emergency_care': scoring.serviceInterestScore += LEAD_SCORING_RULES.SERVICE_INTEREST.EMERGENCY_CARE; break
        }
      })
    }

    // Calcola punteggi source
    if (leadData.source) {
      scoring.sourceScore = LEAD_SCORING_RULES.SOURCE[leadData.source] || 0
    }

    const totalScore = Math.min(100, 
      scoring.demographicScore + 
      scoring.behaviorScore + 
      scoring.engagementScore + 
      scoring.urgencyScore + 
      scoring.serviceInterestScore + 
      scoring.sourceScore
    )

    return { ...scoring, totalScore }
  }

  private determinePriority(score: number): Lead['priority'] {
    if (score >= 80) return 'CRITICAL'
    if (score >= 60) return 'HIGH'
    if (score >= 40) return 'MEDIUM'
    return 'LOW'
  }

  private determineQuality(scoring: LeadScoringCriteria): Lead['quality'] {
    const totalScore = scoring.demographicScore + scoring.behaviorScore + scoring.engagementScore + 
                      scoring.urgencyScore + scoring.serviceInterestScore + scoring.sourceScore
    
    if (totalScore >= 70) return 'HOT'
    if (totalScore >= 40) return 'WARM'
    return 'COLD'
  }

  private async saveLead(lead: Lead): Promise<void> {
    // In produzione: salva in D1 database
    console.log(`💾 Salvataggio lead: ${lead.id}`)
    
    // await env.DB.prepare(`
    //   INSERT OR REPLACE INTO leads 
    //   (id, firstName, lastName, email, phone, medicalConditions, urgencyLevel, serviceInterest, 
    //    preferredContactMethod, score, priority, quality, status, stage, assignedTo, assignedAt,
    //    source, campaign, referrer, interactions, lastInteractionAt, nextFollowUpAt, 
    //    convertedAt, conversionValue, lostReason, createdAt, updatedAt, notes, tags)
    //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `).bind(
    //   lead.id, lead.firstName, lead.lastName, lead.email, lead.phone,
    //   JSON.stringify(lead.medicalConditions), lead.urgencyLevel, JSON.stringify(lead.serviceInterest),
    //   lead.preferredContactMethod, lead.score, lead.priority, lead.quality, lead.status, lead.stage,
    //   lead.assignedTo, lead.assignedAt, lead.source, lead.campaign, lead.referrer,
    //   JSON.stringify(lead.interactions), lead.lastInteractionAt, lead.nextFollowUpAt,
    //   lead.convertedAt, lead.conversionValue, lead.lostReason, lead.createdAt, lead.updatedAt,
    //   lead.notes, JSON.stringify(lead.tags)
    // ).run()
  }

  private async autoAssignLead(lead: Lead): Promise<void> {
    try {
      // Logica assignment automatico basata su priorità e workload
      console.log(`👥 Auto-assignment lead ${lead.id} (priorità: ${lead.priority})`)
      
      // In produzione: logica complessa assignment
      const assignedAgent = this.getNextAvailableAgent(lead.priority)
      
      if (assignedAgent) {
        lead.assignedTo = assignedAgent
        lead.assignedAt = new Date().toISOString()
        await this.saveLead(lead)
        
        console.log(`✅ Lead ${lead.id} assegnato a ${assignedAgent}`)
      }

    } catch (error) {
      console.error('❌ Errore auto-assignment:', error)
    }
  }

  private getNextAvailableAgent(priority: Lead['priority']): string | undefined {
    // Simula sistema assignment - in produzione logica complessa
    const agents = {
      'CRITICAL': ['dr_rossi', 'dr_bianchi'],
      'HIGH': ['agent_1', 'agent_2', 'dr_rossi'],
      'MEDIUM': ['agent_1', 'agent_2', 'agent_3'],
      'LOW': ['agent_3', 'agent_4']
    }
    
    const availableAgents = agents[priority] || agents.LOW
    return availableAgents[Math.floor(Math.random() * availableAgents.length)]
  }

  private async startLeadWorkflow(lead: Lead): Promise<void> {
    try {
      console.log(`🔄 Avvio workflow automatico per lead ${lead.id}`)
      
      // Workflow personalizzato per priorità e qualità
      switch (lead.priority) {
        case 'CRITICAL':
          await this.startCriticalLeadWorkflow(lead)
          break
        case 'HIGH':
          await this.startHighPriorityWorkflow(lead)
          break
        case 'MEDIUM':
          await this.startMediumPriorityWorkflow(lead)
          break
        case 'LOW':
          await this.startLowPriorityWorkflow(lead)
          break
      }

    } catch (error) {
      console.error('❌ Errore avvio workflow lead:', error)
    }
  }

  private async startCriticalLeadWorkflow(lead: Lead): Promise<void> {
    console.log(`🚨 Workflow CRITICAL per ${lead.id}: contatto immediato`)
    // TODO: Notifica immediata team, chiamata entro 5 minuti, SMS backup
  }

  private async startHighPriorityWorkflow(lead: Lead): Promise<void> {
    console.log(`⚡ Workflow HIGH per ${lead.id}: contatto rapido`)
    // TODO: Email immediata + chiamata entro 30 minuti
  }

  private async startMediumPriorityWorkflow(lead: Lead): Promise<void> {
    console.log(`📧 Workflow MEDIUM per ${lead.id}: email + follow-up`)
    // TODO: Email benvenuto + chiamata entro 24h
  }

  private async startLowPriorityWorkflow(lead: Lead): Promise<void> {
    console.log(`📬 Workflow LOW per ${lead.id}: nurturing automatico`)
    // TODO: Sequenza email nurturing automatica
  }

  private async recalculateLeadScore(leadId: string): Promise<void> {
    console.log(`🔄 Ricalcolo score lead: ${leadId}`)
    // TODO: Ricalcola score considerando nuove interazioni
  }

  private async onLeadQualified(lead: Lead): Promise<void> {
    console.log(`✅ Lead qualificato: ${lead.id}`)
    // TODO: Prepara proposta, prenota consulenza
  }

  private async onLeadProposal(lead: Lead): Promise<void> {
    console.log(`📋 Proposta inviata: ${lead.id}`)
    // TODO: Genera proforma, avvia workflow firma
  }

  private async onLeadConverted(lead: Lead): Promise<void> {
    console.log(`🎉 Lead convertito: ${lead.id}`)
    lead.convertedAt = new Date().toISOString()
    // TODO: Attiva servizi, welcome customer workflow
  }

  private async onLeadLost(lead: Lead): Promise<void> {
    console.log(`😞 Lead perso: ${lead.id}`)
    // TODO: Analizza motivo perdita, nurturing future
  }
}

// =====================================================================
// EXPORT DEFAULTS
// =====================================================================

export default LeadManager