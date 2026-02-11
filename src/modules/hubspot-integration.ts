/**
 * HubSpot CRM Integration Module
 * 
 * Funzionalità:
 * - Lettura contatti/leads da HubSpot
 * - Sincronizzazione bidirezionale HubSpot ↔ TeleMedCare
 * - Mappatura campi personalizzati
 * - Gestione aggiornamenti stato
 * 
 * @module hubspot-integration
 */

// ============================================
// TYPES & INTERFACES
// ============================================

export interface HubSpotContact {
  id: string
  properties: {
    firstname?: string
    lastname?: string
    email?: string
    phone?: string
    mobilephone?: string
    company?: string
    address?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    hs_lead_status?: string
    lifecyclestage?: string
    createdate?: string
    lastmodifieddate?: string
    // Custom properties (se configurate in HubSpot)
    servizio_richiesto?: string
    piano_selezionato?: string
    note_assistito?: string
    vuole_contratto?: string
    vuole_brochure?: string
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
  archived: boolean
}

export interface HubSpotSearchResponse {
  total: number
  results: HubSpotContact[]
  paging?: {
    next?: {
      after: string
      link: string
    }
  }
}

export interface HubSpotError {
  status: string
  message: string
  correlationId: string
  category: string
}

export interface LeadMappingResult {
  success: boolean
  leadId?: string
  hubspotContactId: string
  errors?: string[]
}

// ============================================
// HUBSPOT API CLIENT
// ============================================

export class HubSpotClient {
  private accessToken: string
  private portalId: string
  private baseUrl = 'https://api.hubapi.com'
  
  constructor(accessToken: string, portalId: string) {
    this.accessToken = accessToken
    this.portalId = portalId
  }
  
  /**
   * Esegue una richiesta all'API HubSpot
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      const error = await response.json() as HubSpotError
      throw new Error(`HubSpot API Error: ${error.message} (${error.status})`)
    }
    
    return response.json()
  }
  
  /**
   * Ottiene tutti i contatti con filtri opzionali
   */
  async getContacts(params?: {
    limit?: number
    after?: string
    properties?: string[]
    archived?: boolean
  }): Promise<HubSpotSearchResponse> {
    const queryParams = new URLSearchParams()
    
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.after) queryParams.append('after', params.after)
    if (params?.archived !== undefined) queryParams.append('archived', params.archived.toString())
    if (params?.properties) {
      params.properties.forEach(prop => queryParams.append('properties', prop))
    } else {
      // Default properties
      const defaultProps = [
        'firstname', 'lastname', 'email', 'phone', 'mobilephone',
        'company', 'address', 'city', 'state', 'zip', 'country',
        'hs_lead_status', 'lifecyclestage', 'createdate', 'lastmodifieddate',
        'servizio_ecura', 'piano_ecura', 'hs_object_source_detail_1',
        'servizio_di_interesse', 'piano_desiderato' // ✅ Campi alternativi da form ecura.it
      ]
      defaultProps.forEach(prop => queryParams.append('properties', prop))
    }
    
    return this.request<HubSpotSearchResponse>(
      `/crm/v3/objects/contacts?${queryParams.toString()}`
    )
  }
  
  /**
   * Cerca contatti con filtri avanzati
   */
  async searchContacts(filters: {
    createdAfter?: string // ISO date
    createdBefore?: string
    email?: string
    hs_lead_status?: string
    hs_object_source_detail_1?: string // Filtro fonte (es. "Form eCura")
    limit?: number
    properties?: string[]
  }): Promise<HubSpotSearchResponse> {
    const filterGroups = []
    const filtersArray = []
    
    if (filters.createdAfter) {
      filtersArray.push({
        propertyName: 'createdate',
        operator: 'GTE',
        value: new Date(filters.createdAfter).getTime().toString()
      })
    }
    
    if (filters.createdBefore) {
      filtersArray.push({
        propertyName: 'createdate',
        operator: 'LTE',
        value: new Date(filters.createdBefore).getTime().toString()
      })
    }
    
    if (filters.email) {
      filtersArray.push({
        propertyName: 'email',
        operator: 'EQ',
        value: filters.email
      })
    }
    
    if (filters.hs_lead_status) {
      filtersArray.push({
        propertyName: 'hs_lead_status',
        operator: 'EQ',
        value: filters.hs_lead_status
      })
    }
    
    // ✅ FILTRO FORM ECURA
    if (filters.hs_object_source_detail_1) {
      filtersArray.push({
        propertyName: 'hs_object_source_detail_1',
        operator: 'EQ',
        value: filters.hs_object_source_detail_1
      })
    }
    
    if (filtersArray.length > 0) {
      filterGroups.push({ filters: filtersArray })
    }
    
    const properties = filters.properties || [
      'firstname', 'lastname', 'email', 'phone', 'mobilephone',
      'hs_lead_status', 'lifecyclestage', 'createdate', 'lastmodifieddate',
      'hs_object_source_detail_1', // Form source
      'servizio_ecura', // ✅ Custom property: FAMILY/PRO/PREMIUM
      'piano_ecura', // ✅ Custom property: BASE/AVANZATO
      'servizio_di_interesse', // ✅ Campo alternativo da form ecura.it
      'piano_desiderato' // ✅ Campo alternativo da form ecura.it
    ]
    
    const body = {
      filterGroups,
      properties,
      limit: filters.limit || 100,
      sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }]
    }
    
    return this.request<HubSpotSearchResponse>(
      '/crm/v3/objects/contacts/search',
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    )
  }
  
  /**
   * Ottiene un contatto specifico per ID
   */
  async getContact(contactId: string, properties?: string[]): Promise<HubSpotContact> {
    const queryParams = new URLSearchParams()
    const props = properties || [
      'firstname', 'lastname', 'email', 'phone', 'mobilephone',
      'hs_lead_status', 'lifecyclestage', 'createdate'
    ]
    props.forEach(prop => queryParams.append('properties', prop))
    
    return this.request<HubSpotContact>(
      `/crm/v3/objects/contacts/${contactId}?${queryParams.toString()}`
    )
  }
  
  /**
   * Crea un nuovo contatto in HubSpot
   */
  async createContact(properties: Record<string, any>): Promise<HubSpotContact> {
    return this.request<HubSpotContact>(
      '/crm/v3/objects/contacts',
      {
        method: 'POST',
        body: JSON.stringify({ properties })
      }
    )
  }
  
  /**
   * Aggiorna un contatto esistente
   */
  async updateContact(contactId: string, properties: Record<string, any>): Promise<HubSpotContact> {
    return this.request<HubSpotContact>(
      `/crm/v3/objects/contacts/${contactId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ properties })
      }
    )
  }
  
  /**
   * Test connessione HubSpot
   */
  async testConnection(): Promise<{ success: boolean; portalId: string; message: string }> {
    try {
      const response = await this.getContacts({ limit: 1 })
      return {
        success: true,
        portalId: this.portalId,
        message: `✅ Connessione HubSpot riuscita! Trovati ${response.total} contatti totali.`
      }
    } catch (error) {
      return {
        success: false,
        portalId: this.portalId,
        message: `❌ Errore connessione HubSpot: ${(error as Error).message}`
      }
    }
  }
}

// ============================================
// FIELD MAPPING
// ============================================

/**
 * Mappa un contatto HubSpot in un lead TeleMedCare
 */
export async function mapHubSpotContactToLead(contact: HubSpotContact): Promise<any> {
  const props = contact.properties
  
  // Estrai nome e cognome
  const nomeRichiedente = props.firstname || ''
  const cognomeRichiedente = props.lastname || ''
  
  // Email principale
  const email = props.email || ''
  
  // Telefono (prova prima phone poi mobilephone)
  const telefono = props.phone || props.mobilephone || ''
  
  // Indirizzo completo
  const indirizzo = [props.address, props.city, props.state, props.zip, props.country]
    .filter(Boolean)
    .join(', ')
  
  // Servizio e piano (da custom properties eCura)
  // ⚠️ FALLBACK: Prima servizio_ecura/piano_ecura, poi servizio_di_interesse/piano_desiderato
  console.log(`🔍 [HUBSPOT MAPPING] Contact ${props.firstname} ${props.lastname}:`)
  console.log(`🔍 [HUBSPOT MAPPING] - servizio_ecura (raw): ${props.servizio_ecura || 'NULL/EMPTY'}`)
  console.log(`🔍 [HUBSPOT MAPPING] - piano_ecura (raw): ${props.piano_ecura || 'NULL/EMPTY'}`)
  console.log(`🔍 [HUBSPOT MAPPING] - servizio_di_interesse (raw): ${(props as any).servizio_di_interesse || 'NULL/EMPTY'}`)
  console.log(`🔍 [HUBSPOT MAPPING] - piano_desiderato (raw): ${(props as any).piano_desiderato || 'NULL/EMPTY'}`)
  
  // Determina servizio con fallback
  let servizioEcura = 'PRO' // Default finale
  if (props.servizio_ecura) {
    servizioEcura = props.servizio_ecura.toUpperCase()
    console.log(`🔍 [HUBSPOT MAPPING] - Servizio da servizio_ecura: ${servizioEcura}`)
  } else if ((props as any).servizio_di_interesse) {
    // Fallback: usa servizio_di_interesse (da form ecura.it)
    const serviceLower = (props as any).servizio_di_interesse.toLowerCase()
    if (serviceLower.includes('family')) {
      servizioEcura = 'FAMILY'
    } else if (serviceLower.includes('premium') || serviceLower.includes('vital')) {
      servizioEcura = 'PREMIUM'
    } else if (serviceLower.includes('pro')) {
      servizioEcura = 'PRO'
    }
    console.log(`🔍 [HUBSPOT MAPPING] - Servizio da servizio_di_interesse: ${servizioEcura}`)
  } else {
    console.log(`🔍 [HUBSPOT MAPPING] - Servizio default: ${servizioEcura}`)
  }
  
  // Determina piano con fallback
  let pianoEcura = 'BASE' // Default finale
  if (props.piano_ecura) {
    pianoEcura = props.piano_ecura.toUpperCase()
    console.log(`🔍 [HUBSPOT MAPPING] - Piano da piano_ecura: ${pianoEcura}`)
  } else if ((props as any).piano_desiderato) {
    // Fallback: usa piano_desiderato (da form ecura.it)
    const planLower = (props as any).piano_desiderato.toLowerCase()
    if (planLower.includes('avanzato') || planLower.includes('advanced')) {
      pianoEcura = 'AVANZATO'
    }
    console.log(`🔍 [HUBSPOT MAPPING] - Piano da piano_desiderato: ${pianoEcura}`)
  } else {
    console.log(`🔍 [HUBSPOT MAPPING] - Piano default: ${pianoEcura}`)
  }
  
  console.log(`✅ [HUBSPOT MAPPING] - Servizio finale: ${servizioEcura}, Piano finale: ${pianoEcura}`)
  
  // Normalizza formato servizio per TeleMedCare
  const servizio = `eCura ${servizioEcura}`
  const piano = pianoEcura
  
  // ✅ CALCOLO AUTOMATICO PREZZI (sempre, usa defaults se necessario)
  let pricing = {
    setupBase: null as number | null,
    setupIva: null as number | null,
    setupTotale: null as number | null,
    rinnovoBase: null as number | null,
    rinnovoIva: null as number | null,
    rinnovoTotale: null as number | null
  }
  
  try {
    console.log(`💰 [HUBSPOT MAPPING] Calcolo prezzi per: servizio=${servizioEcura}, piano=${pianoEcura}`)
    // Import dinamico per Cloudflare Workers
    const pricingModule = await import('./pricing-calculator')
    const calculated = pricingModule.calculatePrice(servizioEcura, pianoEcura)
    
    console.log(`💰 [HUBSPOT MAPPING] Prezzi calcolati:`, JSON.stringify(calculated, null, 2))
    
    pricing = {
      setupBase: calculated.setupBase,
      setupIva: calculated.setupIva,
      setupTotale: calculated.setupTotale,
      rinnovoBase: calculated.rinnovoBase,
      rinnovoIva: calculated.rinnovoIva,
      rinnovoTotale: calculated.rinnovoTotale
    }
    
    console.log(`✅ [HUBSPOT MAPPING] Prezzi assegnati: setupBase=${pricing.setupBase}, rinnovoBase=${pricing.rinnovoBase}`)
  } catch (error) {
    console.error(`❌ [HUBSPOT MAPPING] ERRORE calcolo prezzi:`, error)
    console.error(`❌ [HUBSPOT MAPPING] Servizio: ${servizioEcura}, Piano: ${pianoEcura}`)
    // Prezzi restano NULL
  }
  
  // Status mapping
  const statusMap: Record<string, string> = {
    'new': 'NEW',
    'open': 'CONTACTED',
    'in_progress': 'QUALIFIED',
    'qualified': 'QUALIFIED',
    'unqualified': 'LOST',
    'contacted': 'CONTACTED'
  }
  const status = statusMap[props.hs_lead_status || 'new'] || 'NEW'
  
  const leadData = {
    // Dati richiedente
    nomeRichiedente,
    cognomeRichiedente,
    email,
    telefono,
    indirizzoRichiedente: indirizzo,
    
    // Dati assistito (SOLO se forniti da HubSpot, altrimenti NULL)
    nomeAssistito: props.nome_assistito || null,
    cognomeAssistito: props.cognome_assistito || null,
    
    // Servizio (può essere NULL se HubSpot non lo manda)
    servizio,
    piano,
    pacchetto: piano,
    tipoServizio: 'eCura', // ✅ FIX: Valore fisso, non duplicare servizio
    servizio_ecura: servizioEcura,
    piano_ecura: pianoEcura,
    
    // ✅ PREZZI (USA CAMPI ESISTENTI - IVA ESCLUSA)
    prezzo_anno: pricing.setupBase,      // Setup IVA esclusa
    prezzo_rinnovo: pricing.rinnovoBase, // Rinnovo IVA esclusa
    
    // Status
    status,
    
    // Source tracking
    fonte: 'IRBEMA',
    external_source_id: contact.id,
    
    // Metadata
    note: props.note_assistito || `Importato da HubSpot - ID: ${contact.id}`,
    
    // Richieste documentazione
    // ✅ SEMPRE SI per lead da Form eCura (import automatico)
    // Usa 1/0 per compatibilità con INTEGER nel DB
    vuoleContratto: 1,
    vuoleBrochure: 1,
    vuoleManuale: 0,
    
    // Privacy (default true per import da CRM)
    consensoPrivacy: true,
    consensoMarketing: false,
    consensoTerze: false,
    
    // Timestamp
    created_at: props.createdate || new Date().toISOString(),
    updated_at: props.lastmodifieddate || new Date().toISOString()
  }
  
  console.log(`📋 [HUBSPOT MAPPING] Lead finale da ritornare:`)
  console.log(`   - Nome: ${leadData.nomeRichiedente} ${leadData.cognomeRichiedente}`)
  console.log(`   - Servizio: ${leadData.servizio} (${leadData.servizio_ecura})`)
  console.log(`   - Piano: ${leadData.piano} (${leadData.piano_ecura})`)
  console.log(`   - Prezzo anno: ${leadData.prezzo_anno}`)
  console.log(`   - Prezzo rinnovo: ${leadData.prezzo_rinnovo}`)
  
  return leadData
}

/**
 * Mappa un lead TeleMedCare in un contatto HubSpot
 */
export function mapLeadToHubSpotContact(lead: any): Record<string, any> {
  return {
    firstname: lead.nomeRichiedente,
    lastname: lead.cognomeRichiedente,
    email: lead.email,
    phone: lead.telefono,
    company: 'TeleMedCare Client',
    
    // Custom properties (se configurate in HubSpot)
    servizio_richiesto: lead.servizio || lead.tipoServizio,
    piano_selezionato: lead.piano || lead.pacchetto,
    note_assistito: lead.note,
    vuole_contratto: lead.vuoleContratto,
    vuole_brochure: lead.vuoleBrochure,
    
    // Lead status
    hs_lead_status: lead.status === 'NEW' ? 'new' : 
                     lead.status === 'CONTACTED' ? 'contacted' :
                     lead.status === 'QUALIFIED' ? 'qualified' : 'open',
    
    // Lifecycle stage
    lifecyclestage: 'lead'
  }
}

// ============================================
// EXPORT
// ============================================

export default HubSpotClient
