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
    note_aggiuntive?: string  // ✅ FIX: Campo note aggiuntive
    notes?: string            // ✅ FIX: Note generiche
    message?: string          // ✅ FIX: Messaggio/Note dal form
    condizioni_salute?: string // ✅ FIX: Condizioni salute
    note?: string             // ✅ FIX: Note standard HubSpot
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
    after?: string // Cursore paginazione HubSpot (da response.paging.next.after)
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
    
    // ✅ FILTRO FORM ECURA — usa CONTAINS (substring) invece di CONTAINS_TOKEN
    // perché hs_object_source_detail_1 è un campo STRINGA, non enumeration.
    // CONTAINS_TOKEN tokenizza per spazi → 'Form eCura' non è un token in 'Form eCura_ GOOGLE'
    // CONTAINS invece cerca la sottostringa → cattura 'Form eCura', 'Form eCura_ GOOGLE', 'Form eCura_ META', ecc.
    // Il filtro rimane STRETTO: solo lead il cui campo CONTIENE 'Form eCura'
    if (filters.hs_object_source_detail_1) {
      filtersArray.push({
        propertyName: 'hs_object_source_detail_1',
        operator: 'CONTAINS',
        value: filters.hs_object_source_detail_1
      })
    }
    
    if (filtersArray.length > 0) {
      filterGroups.push({ filters: filtersArray })
    }
    
    const properties = filters.properties || [
      'firstname', 'lastname', 'email', 'phone', 'mobilephone',
      'hs_lead_status', 'lifecyclestage', 'createdate', 'lastmodifieddate',
      'hs_object_source_detail_1', // Form source (nuovo: 'Form eCura_ META' ecc.)
      // ✅ CAMPI ANALYTICS per risalire al canale sui lead storici (pre-12/05/2026)
      // hs_analytics_source: 'PAID_SOCIAL' → Meta, 'PAID_SEARCH' → Google
      // hs_analytics_source_data_1: nome campagna/rete (es. 'facebook', 'google')
      // hs_analytics_source_data_2: dettaglio ulteriore (es. nome campagna)
      'hs_analytics_source',        // 'PAID_SOCIAL' / 'PAID_SEARCH' / 'DIRECT_TRAFFIC' ecc.
      'hs_analytics_source_data_1', // nome rete/campagna (facebook, google, instagram...)
      'hs_analytics_source_data_2', // dettaglio campagna
      'hs_latest_source',           // fonte più recente (stessa logica ma last touch)
      'hs_latest_source_data_1',    // dettaglio last touch
      'servizio_ecura', // ✅ Custom property: FAMILY/PRO/PREMIUM
      'piano_ecura', // ✅ Custom property: BASE/AVANZATO
      'servizio_di_interesse', // ✅ Campo alternativo da form ecura.it
      'piano_desiderato', // ✅ Campo alternativo da form ecura.it
      // ✅ FIX: Aggiunti campi note/messaggio per importazione
      'note_assistito', // Note aggiuntive assistito
      'note_aggiuntive', // Note aggiuntive (nome alternativo)
      'notes', // Note generiche
      'message', // Messaggio/Note dal form
      'condizioni_salute', // Condizioni salute assistito
      'note' // Note standard HubSpot
    ]
    
    const body: any = {
      filterGroups,
      properties,
      limit: filters.limit || 100,
      sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }]
    }
    // ✅ Paginazione: se c'è un cursore 'after', lo passiamo nel body
    if (filters.after) {
      body.after = filters.after
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
/**
 * Deriva il canale dettagliato del lead eCura.
 *
 * Priorità:
 * 1. hs_object_source_detail_1 con suffisso specifico (post-12/05/2026):
 *    'Form eCura_ META' / 'Form eCura_ GOOGLE' / 'Form eCura_ ALTRO' → usa direttamente
 *
 * 2. Fallback su hs_analytics_source (campo standard HubSpot, presente anche sui lead storici):
 *
 *    PAID_SOCIAL    → Facebook/Instagram Ads        → 'Form eCura_ META'
 *    PAID_SEARCH    → Google Ads                    → 'Form eCura_ GOOGLE'
 *    ORGANIC_SEARCH → Google organico               → 'Form eCura_ GOOGLE'
 *    SOCIAL_MEDIA   → Social organico (fb/ig/altri) → 'Form eCura_ META'
 *    DIRECT_TRAFFIC → traffico diretto              → 'Form eCura_ DIRETTO'
 *    (altri: EMAIL_MARKETING, REFERRALS, ecc.)      → 'Form eCura_ ALTRO'
 *    source vuoto/null                              → lascia 'Form eCura' invariato
 *
 * Nota: usa first-touch (hs_analytics_source); se assente, last-touch (hs_latest_source).
 */
function deriveChannelDetail(props: Record<string, any>): string | null {
  // Priorità 1: valore già specifico post-12/05/2026 → usa così com'è
  const detail = props.hs_object_source_detail_1 || ''
  if (detail && detail !== 'Form eCura' && detail.startsWith('Form eCura')) {
    return detail
  }

  // Priorità 2: deriva da hs_analytics_source (first-touch, poi last-touch come fallback)
  const source = (props.hs_analytics_source || props.hs_latest_source || '').toUpperCase().trim()

  if (!source) {
    // Nessun dato analytics disponibile → lascia il valore esistente invariato
    return detail || null
  }

  switch (source) {
    case 'PAID_SOCIAL':
    case 'SOCIAL_MEDIA':
      return 'Form eCura_ META'
    case 'PAID_SEARCH':
    case 'ORGANIC_SEARCH':
      return 'Form eCura_ GOOGLE'
    case 'DIRECT_TRAFFIC':
      return 'Form eCura_ DIRETTO'
    default:
      // EMAIL_MARKETING, REFERRALS, OTHER_CAMPAIGNS, OFFLINE, ecc.
      return 'Form eCura_ ALTRO'
  }
}

/**
 * Estrae il nome corto del canale acquisizione dal valore derivato o da analytics source.
 * Ritorna: 'META' | 'GOOGLE' | 'DIRETTO' | 'ALTRO' | null
 */
export function deriveCanaleName(props: Record<string, any>): string | null {
  // Prima controlla il detail già presente (post-12/05 o appena derivato)
  const detail = (props.hs_object_source_detail_1 || '').toUpperCase()
  if (detail.includes('META'))    return 'META'
  if (detail.includes('GOOGLE'))  return 'GOOGLE'
  if (detail.includes('DIRETTO')) return 'DIRETTO'
  if (detail.includes('ALTRO'))   return 'ALTRO'

  // Poi da hs_analytics_source
  const source = (props.hs_analytics_source || props.hs_latest_source || '').toUpperCase().trim()
  if (!source) return null

  switch (source) {
    case 'PAID_SOCIAL':
    case 'SOCIAL_MEDIA':    return 'META'
    case 'PAID_SEARCH':
    case 'ORGANIC_SEARCH':  return 'GOOGLE'
    case 'DIRECT_TRAFFIC':  return 'DIRETTO'
    default:                return 'ALTRO'
  }
}

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
  
  // ✅ DEBUG: Log campi note disponibili da HubSpot
  const noteFinale = props.note_assistito 
    || props.note_aggiuntive 
    || props.notes 
    || props.message 
    || props.condizioni_salute 
    || props.note 
    || null
  
  console.log(`📝 [HUBSPOT MAPPING] Campi note disponibili per contact ${contact.id}:`, {
    note_assistito: props.note_assistito ? `"${props.note_assistito.substring(0, 50)}..."` : '(vuoto)',
    note_aggiuntive: props.note_aggiuntive ? `"${props.note_aggiuntive.substring(0, 50)}..."` : '(vuoto)',
    notes: props.notes ? `"${props.notes.substring(0, 50)}..."` : '(vuoto)',
    message: props.message ? `"${props.message.substring(0, 50)}..."` : '(vuoto)',
    condizioni_salute: props.condizioni_salute ? `"${props.condizioni_salute.substring(0, 50)}..."` : '(vuoto)',
    note: props.note ? `"${props.note.substring(0, 50)}..."` : '(vuoto)',
    '→ VALORE_IMPORTATO': noteFinale ? `"${noteFinale.substring(0, 100)}..."` : 'NULL'
  })
  
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
    indirizzoIntestatario: indirizzo,
    
    // Dati assistito (SOLO se forniti da HubSpot, altrimenti NULL)
    nomeAssistito: props.nome_assistito || null,
    cognomeAssistito: props.cognome_assistito || null,
    dataNascitaAssistito: props.data_nascita_assistito || null,
    luogoNascitaAssistito: props.luogo_nascita_assistito || null,
    indirizzoAssistito: props.indirizzo_assistito || null,
    capAssistito: props.cap_assistito || null,
    cittaAssistito: props.citta_assistito || null,  // ✅ FIX: Campo città assistito separato
    provinciaAssistito: props.provincia_assistito || null,
    cfAssistito: props.cf_assistito || null,
    condizioniSalute: props.condizioni_salute || null,
    
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
    fonte: 'Form eCura',
    external_source_id: contact.id,
    
    // ✅ HubSpot Source Fields — con fallback da analytics source per lead storici
    hs_object_source: props.hs_object_source || null,
    hs_object_source_detail_1: (() => {
      const ch = deriveChannelDetail(props)
      console.log(`📡 [HUBSPOT MAPPING] Canale derivato per ${props.email || contact.id}: ` +
        `hs_object_source_detail_1="${props.hs_object_source_detail_1 || ''}" ` +
        `hs_analytics_source="${props.hs_analytics_source || ''}" ` +
        `hs_analytics_source_data_1="${props.hs_analytics_source_data_1 || ''}" ` +
        `→ "${ch}"`)
      return ch
    })(),
    dettaglio_fonte: deriveChannelDetail(props),
    // ✅ NUOVI CAMPI DB
    hs_analytics_source: props.hs_analytics_source || props.hs_latest_source || null,
    canale_acquisizione: deriveCanaleName(props),
    
    // Metadata
    // ✅ FIX CRITICO: Importa note VERE da HubSpot (NO fallback che sovrascrive!)
    // external_source_id contiene già l'ID HubSpot, quindi non serve duplicarlo in note
    note: noteFinale,
    
    // Richieste documentazione
    // ✅ SEMPRE SI per lead da Form eCura (import automatico)
    // Usa 1/0 per compatibilità con INTEGER nel DB
    vuoleContratto: 1,
    vuoleBrochure: 1,
    vuoleManuale: 0,
    
    // Privacy (default true per import da CRM)
    gdprConsent: true,
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
