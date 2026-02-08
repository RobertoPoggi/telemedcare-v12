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
        'servizio_ecura', 'piano_ecura', 'hs_object_source_detail_1'
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
      'hs_object_source_detail_1' // Aggiungi questo campo alle properties
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
export function mapHubSpotContactToLead(contact: HubSpotContact): any {
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
  // ⚠️ SE HubSpot non manda il campo, usa default per evitare NOT NULL constraint
  const servizioEcura = props.servizio_ecura ? props.servizio_ecura.toUpperCase() : 'PRO'
  const pianoEcura = props.piano_ecura ? props.piano_ecura.toUpperCase() : 'BASE'
  
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
    // Import dinamico del pricing calculator
    const { calculatePrice } = require('./pricing-calculator')
    const calculated = calculatePrice(servizioEcura, pianoEcura)
    pricing = {
      setupBase: calculated.setupBase,
      setupIva: calculated.setupIva,
      setupTotale: calculated.setupTotale,
      rinnovoBase: calculated.rinnovoBase,
      rinnovoIva: calculated.rinnovoIva,
      rinnovoTotale: calculated.rinnovoTotale
    }
    console.log(`✅ Prezzi calcolati per ${servizioEcura} ${pianoEcura}: €${calculated.setupBase}`)
  } catch (error) {
    console.error('⚠️ Errore calcolo prezzi:', error)
    // Prezzi restano NULL → saranno fixati con fix-prices
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
  
  return {
    // Dati richiedente
    nomeRichiedente,
    cognomeRichiedente,
    email,
    telefono,
    indirizzoRichiedente: indirizzo,
    
    // Dati assistito (se non specificato, usa richiedente)
    nomeAssistito: nomeRichiedente,
    cognomeAssistito: cognomeRichiedente,
    
    // Servizio (può essere NULL se HubSpot non lo manda)
    servizio,
    piano,
    pacchetto: piano,
    tipoServizio: servizio,
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
    vuoleContratto: props.vuole_contratto === 'Si' || props.vuole_contratto === 'true' ? 'Si' : 'No',
    vuoleBrochure: props.vuole_brochure === 'Si' || props.vuole_brochure === 'true' ? 'Si' : 'No',
    vuoleManuale: 'No',
    
    // Privacy (default true per import da CRM)
    consensoPrivacy: true,
    consensoMarketing: false,
    consensoTerze: false,
    
    // Timestamp
    created_at: props.createdate || new Date().toISOString(),
    updated_at: props.lastmodifieddate || new Date().toISOString()
  }
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
