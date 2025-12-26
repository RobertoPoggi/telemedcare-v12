/**
 * LEAD_CHANNELS.TS - Multi-Source Integration
 * TeleMedCare V12.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Plugin architecture per canali acquisizione multi-fonte
 * - Auto-detection formato Excel/CSV con mapping intelligente
 * - Rate limiting e protezione API esterne
 * - Error recovery con exponential backoff
 * - Integrazioni: IRBEMA, AON, Mondadori, Endered, Corporate Email
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { Partner } from './lead-config'
import { getConfigPartner } from './lead-config'
import { creaLead, type Lead } from './lead-core'

// =====================================================================
// TYPES & INTERFACES
// =====================================================================

export interface ChannelConfig {
  id: string
  nome: string
  tipo: 'API' | 'EMAIL' | 'WEBHOOK' | 'FILE' | 'MANUAL'
  attivo: boolean
  configurazione: Record<string, any>
  rateLimiting?: {
    requestsPerMinute: number
    maxBurst: number
  }
  retry?: {
    maxRetries: number
    backoffMs: number
    exponential: boolean
  }
}

export interface LeadSource {
  canale: string
  partnerId?: string
  metadati?: Record<string, any>
  timestampRicezione: string
  ipAddress?: string
  userAgent?: string
}

export interface ImportResult {
  success: boolean
  totalProcessed: number
  imported: number
  duplicates: number
  errors: number
  errorDetails: string[]
  channelId: string
}

export interface APIResponse {
  success: boolean
  data?: any
  error?: string
  rateLimited?: boolean
  retryAfter?: number
}

// =====================================================================
// CHANNEL MANAGER
// =====================================================================

class ChannelManager {
  private _channels?: Map<string, ChannelConfig>
  private _rateLimits?: Map<string, { count: number; resetTime: number }>
  
  private get channels() {
    if (!this._channels) {
      this._channels = new Map<string, ChannelConfig>()
      this.initializeDefaultChannels()
    }
    return this._channels
  }
  
  private get rateLimits() {
    if (!this._rateLimits) {
      this._rateLimits = new Map<string, { count: number; resetTime: number }>()
    }
    return this._rateLimits
  }
  
  constructor() {
    // Lazy initialization - channels getter will call initializeDefaultChannels()
  }
  
  private initializeDefaultChannels() {
    // IRBEMA API Channel
    this.channels.set('IRBEMA_API', {
      id: 'IRBEMA_API',
      nome: 'IRBEMA API Integration',
      tipo: 'API',
      attivo: true,
      configurazione: {
        endpoint: 'https://api.irbema.it/teleassistenza/leads',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': 'v2'
        }
      },
      rateLimiting: {
        requestsPerMinute: 100,
        maxBurst: 10
      },
      retry: {
        maxRetries: 3,
        backoffMs: 1000,
        exponential: true
      }
    })
    
    // AON Voucher Channel
    this.channels.set('AON_VOUCHER', {
      id: 'AON_VOUCHER',
      nome: 'AON Voucher Validation',
      tipo: 'API',
      attivo: true,
      configurazione: {
        endpoint: 'https://voucher.aon.it/validate',
        method: 'GET',
        timeout: 15000
      },
      rateLimiting: {
        requestsPerMinute: 50,
        maxBurst: 5
      }
    })
    
    // Mondadori Email Channel
    this.channels.set('MONDADORI_EMAIL', {
      id: 'MONDADORI_EMAIL',
      nome: 'Mondadori Email Domain',
      tipo: 'EMAIL',
      attivo: true,
      configurazione: {
        allowedDomains: ['mondadori.it', 'mondadori.com'],
        autoTag: 'MONDADORI_CORPORATE'
      }
    })
    
    // Endered Webhook Channel
    this.channels.set('ENDERED_WEBHOOK', {
      id: 'ENDERED_WEBHOOK',
      nome: 'Endered Webhook Integration',
      tipo: 'WEBHOOK',
      attivo: true,
      configurazione: {
        webhookUrl: '/api/channels/endered-webhook',
        secretKey: 'endered_webhook_secret_2025'
      }
    })
    
    // Corporate Email Channel
    this.channels.set('CORPORATE_EMAIL', {
      id: 'CORPORATE_EMAIL',
      nome: 'Corporate Email Domains',
      tipo: 'EMAIL', 
      attivo: true,
      configurazione: {
        allowedDomains: [
          'essilorluxottica.com',
          'luxottica.com',
          'enel.it',
          'eni.com',
          'telecomitalia.it'
        ],
        autoTag: 'CORPORATE'
      }
    })
  }
  
  getChannel(channelId: string): ChannelConfig | null {
    return this.channels.get(channelId) || null
  }
  
  getAllChannels(): ChannelConfig[] {
    return Array.from(this.channels.values())
  }
  
  isChannelActive(channelId: string): boolean {
    const channel = this.channels.get(channelId)
    return channel?.attivo || false
  }
  
  checkRateLimit(channelId: string): { allowed: boolean; retryAfter?: number } {
    const channel = this.channels.get(channelId)
    if (!channel?.rateLimiting) {
      return { allowed: true }
    }
    
    const now = Date.now()
    const limit = this.rateLimits.get(channelId)
    
    if (!limit || now > limit.resetTime) {
      // Reset rate limit
      this.rateLimits.set(channelId, {
        count: 1,
        resetTime: now + 60000 // 1 minuto
      })
      return { allowed: true }
    }
    
    if (limit.count >= channel.rateLimiting.requestsPerMinute) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((limit.resetTime - now) / 1000) 
      }
    }
    
    limit.count++
    return { allowed: true }
  }
}

const channelManager = new ChannelManager()

// =====================================================================
// IRBEMA API INTEGRATION
// =====================================================================

/**
 * Invia lead a IRBEMA API
 */
export async function inviaLeadIRBEMA(db: D1Database, leadData: Partial<Lead>): Promise<APIResponse> {
  try {
    console.log('🔗 Invio lead a IRBEMA API')
    
    const partner = await getConfigPartner(db, 'IRBEMA_001')
    if (!partner?.apiConfig) {
      return {
        success: false,
        error: 'Configurazione IRBEMA non trovata'
      }
    }
    
    // Check rate limit
    const rateLimitCheck = channelManager.checkRateLimit('IRBEMA_API')
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        rateLimited: true,
        retryAfter: rateLimitCheck.retryAfter,
        error: `Rate limit exceeded. Retry after ${rateLimitCheck.retryAfter} seconds`
      }
    }
    
    // Prepara payload IRBEMA
    const payload = {
      cliente: {
        nome: leadData.nomeRichiedente,
        cognome: leadData.cognomeRichiedente,
        email: leadData.emailRichiedente,
        telefono: leadData.telefonoRichiedente
      },
      assistito: {
        nome: leadData.nomeAssistito,
        cognome: leadData.cognomeAssistito,
        eta: leadData.etaAssistito,
        condizioni: leadData.condizioniSalute
      },
      servizio: {
        tipo: leadData.pacchetto,
        urgenza: leadData.priority
      },
      fonte: 'TeleMedCare_V12.0',
      timestamp: new Date().toISOString()
    }
    
    // Chiamata API con retry
    const response = await fetchWithRetry(partner.apiConfig.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${partner.apiConfig.apiKey}`,
        'X-Partner-ID': 'TELEMEDCARE',
        ...partner.apiConfig.headers
      },
      body: JSON.stringify(payload)
    }, 3)
    
    if (!response.ok) {
      throw new Error(`IRBEMA API error: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    console.log('✅ Lead inviato a IRBEMA con successo', {
      irbemalLeadId: result.leadId,
      status: result.status
    })
    
    return {
      success: true,
      data: result
    }
    
  } catch (error) {
    console.error('❌ Errore invio IRBEMA:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }
  }
}

// =====================================================================
// AON VOUCHER VALIDATION
// =====================================================================

/**
 * Valida voucher AON
 */
export async function validaVoucherAON(db: D1Database, codiceVoucher: string, emailCliente: string): Promise<APIResponse> {
  try {
    console.log('🎫 Validazione voucher AON', { codiceVoucher, emailCliente })
    
    const partner = await getConfigPartner(db, 'AON_001')
    if (!partner?.apiConfig) {
      return {
        success: false,
        error: 'Configurazione AON non trovata'
      }
    }
    
    // Check rate limit
    const rateLimitCheck = channelManager.checkRateLimit('AON_VOUCHER')
    if (!rateLimitCheck.allowed) {
      return {
        success: false,
        rateLimited: true,
        retryAfter: rateLimitCheck.retryAfter,
        error: `AON rate limit exceeded. Retry after ${rateLimitCheck.retryAfter} seconds`
      }
    }
    
    // Costruisci URL validazione
    const validationUrl = new URL(partner.apiConfig.endpoint)
    validationUrl.searchParams.set('voucher', codiceVoucher)
    validationUrl.searchParams.set('email', emailCliente)
    validationUrl.searchParams.set('service', 'teleassistenza')
    
    // Chiamata API AON
    const response = await fetch(validationUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${partner.apiConfig.apiKey}`,
        'X-Client': 'TeleMedCare'
      }
    })
    
    if (!response.ok) {
      throw new Error(`AON API error: ${response.status}`)
    }
    
    const result = await response.json()
    
    console.log('✅ Voucher AON validato', {
      valido: result.valid,
      valore: result.amount,
      scadenza: result.expiry
    })
    
    return {
      success: true,
      data: {
        valido: result.valid,
        valore: result.amount || 0,
        scadenza: result.expiry,
        note: result.notes
      }
    }
    
  } catch (error) {
    console.error('❌ Errore validazione voucher AON:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Errore validazione voucher'
    }
  }
}

// =====================================================================
// EMAIL DOMAIN DETECTION
// =====================================================================

/**
 * Rileva partner da dominio email
 */
export async function rilevPartnerDaEmail(email: string): Promise<{ partnerId?: string; tipo?: string; corporate?: boolean }> {
  try {
    const domain = email.toLowerCase().split('@')[1]
    
    if (!domain) {
      return {}
    }
    
    console.log('📧 Rilevamento partner da dominio email:', domain)
    
    // Mondadori domains
    if (domain.includes('mondadori')) {
      return {
        partnerId: 'MONDADORI_001',
        tipo: 'MONDADORI',
        corporate: true
      }
    }
    
    // Corporate domains
    const corporateDomains = [
      'essilorluxottica.com',
      'luxottica.com', 
      'enel.it',
      'eni.com',
      'telecomitalia.it',
      'tim.it',
      'poste.it',
      'posteittaliane.it'
    ]
    
    for (const corpDomain of corporateDomains) {
      if (domain === corpDomain || domain.endsWith('.' + corpDomain)) {
        return {
          partnerId: `CORPORATE_${corpDomain.replace('.', '_').toUpperCase()}`,
          tipo: 'CORPORATE',
          corporate: true
        }
      }
    }
    
    return {}
    
  } catch (error) {
    console.error('❌ Errore rilevamento partner da email:', error)
    return {}
  }
}

// =====================================================================
// WEBHOOK HANDLERS
// =====================================================================

/**
 * Gestisce webhook Endered
 */
export async function handleWebhookEndered(db: D1Database, payload: any, signature?: string): Promise<ImportResult> {
  try {
    console.log('📥 Gestione webhook Endered')
    
    // Verifica signature
    if (signature) {
      const expectedSignature = await generateWebhookSignature(JSON.stringify(payload), 'endered_webhook_secret_2025')
      if (signature !== expectedSignature) {
        throw new Error('Invalid webhook signature')
      }
    }
    
    let processati = 0
    let importati = 0
    let duplicati = 0
    let errori = 0
    const erroriDettagli: string[] = []
    
    // Processa payload
    const leads = Array.isArray(payload.leads) ? payload.leads : [payload]
    
    for (const leadData of leads) {
      try {
        processati++
        
        // Mappa dati Endered a formato TeleMedCare
        const mappedLead: Partial<Lead> = {
          nomeRichiedente: leadData.firstName || '',
          cognomeRichiedente: leadData.lastName || '',
          emailRichiedente: leadData.email || '',
          telefonoRichiedente: leadData.phone || '',
          nomeAssistito: leadData.patientName || leadData.firstName || '',
          cognomeAssistito: leadData.patientLastName || leadData.lastName || '',
          pacchetto: mapEnderedPackageType(leadData.serviceType),
          condizioniSalute: leadData.healthNotes || '',
          note: leadData.notes || '',
          gdprConsent: Boolean(leadData.gdprConsent),
          fonte: 'ENDERED_WEBHOOK',
          partnerId: 'ENDERED_001'
        }
        
        // Crea lead
        const createResult = await creaLead(db, mappedLead)
        
        if (createResult.success) {
          importati++
        } else if (createResult.duplicate?.isDuplicate) {
          duplicati++
        } else {
          errori++
          erroriDettagli.push(createResult.error || 'Errore sconosciuto')
        }
        
      } catch (error) {
        errori++
        erroriDettagli.push(error instanceof Error ? error.message : 'Errore processing lead')
      }
    }
    
    const result: ImportResult = {
      success: true,
      totalProcessed: processati,
      imported: importati,
      duplicates: duplicati,
      errors: errori,
      errorDetails: erroriDettagli,
      channelId: 'ENDERED_WEBHOOK'
    }
    
    console.log('✅ Webhook Endered processato', result)
    return result
    
  } catch (error) {
    console.error('❌ Errore gestione webhook Endered:', error)
    return {
      success: false,
      totalProcessed: 0,
      imported: 0,
      duplicates: 0,
      errors: 1,
      errorDetails: [error instanceof Error ? error.message : 'Errore webhook'],
      channelId: 'ENDERED_WEBHOOK'
    }
  }
}

// =====================================================================
// EXCEL/CSV AUTO-DETECTION & IMPORT
// =====================================================================

/**
 * Auto-rileva formato Excel/CSV e importa leads
 */
export async function importaFileLeads(db: D1Database, fileContent: string, fileName: string, channelId: string): Promise<ImportResult> {
  try {
    console.log('📊 Import file leads', { fileName, channelId })
    
    // Rileva formato file
    const formato = rilevFormatoFile(fileContent, fileName)
    console.log('📋 Formato rilevato:', formato)
    
    // Parse contenuto
    let righe: string[][] = []
    
    if (formato === 'CSV') {
      righe = parseCSV(fileContent)
    } else if (formato === 'TSV') {
      righe = parseTSV(fileContent)
    } else {
      throw new Error(`Formato file non supportato: ${formato}`)
    }
    
    if (righe.length === 0) {
      throw new Error('File vuoto o non valido')
    }
    
    // Mappa header colonne
    const header = righe[0].map(col => col.toLowerCase().trim())
    const mapping = mappaColonneHeader(header)
    
    console.log('🗂️ Mapping colonne:', mapping)
    
    // Processa righe dati
    let processati = 0
    let importati = 0
    let duplicati = 0
    let errori = 0
    const erroriDettagli: string[] = []
    
    for (let i = 1; i < righe.length; i++) {
      try {
        processati++
        const riga = righe[i]
        
        // Mappa riga a lead
        const leadData: Partial<Lead> = {}
        
        for (const [campo, indiceColonna] of Object.entries(mapping)) {
          if (indiceColonna >= 0 && indiceColonna < riga.length) {
            const valore = riga[indiceColonna]?.trim()
            if (valore) {
              (leadData as any)[campo] = valore
            }
          }
        }
        
        // Aggiungi metadati
        leadData.fonte = `FILE_IMPORT_${channelId}`
        leadData.gdprConsent = true // Assume consenso per import file
        
        // Valida campi obbligatori
        if (!leadData.nomeRichiedente || !leadData.emailRichiedente || !leadData.nomeAssistito) {
          errori++
          erroriDettagli.push(`Riga ${i + 1}: Campi obbligatori mancanti`)
          continue
        }
        
        // Crea lead
        const createResult = await creaLead(db, leadData)
        
        if (createResult.success) {
          importati++
        } else if (createResult.duplicate?.isDuplicate) {
          duplicati++
        } else {
          errori++
          erroriDettagli.push(`Riga ${i + 1}: ${createResult.error}`)
        }
        
      } catch (error) {
        errori++
        erroriDettagli.push(`Riga ${i + 1}: ${error instanceof Error ? error.message : 'Errore processing'}`)
      }
    }
    
    const result: ImportResult = {
      success: true,
      totalProcessed: processati,
      imported: importati,
      duplicates: duplicati,
      errors: errori,
      errorDetails: erroriDettagli,
      channelId
    }
    
    console.log('✅ Import file completato', result)
    return result
    
  } catch (error) {
    console.error('❌ Errore import file:', error)
    return {
      success: false,
      totalProcessed: 0,
      imported: 0,
      duplicates: 0,
      errors: 1,
      errorDetails: [error instanceof Error ? error.message : 'Errore import'],
      channelId
    }
  }
}

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================

/**
 * Fetch con retry automatico
 */
async function fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 3): Promise<Response> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(30000) // 30s timeout
      })
      
      // Se successo o errore non retry-able, ritorna
      if (response.ok || response.status < 500) {
        return response
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Fetch error')
      
      if (i < maxRetries - 1) {
        // Exponential backoff
        const delay = 1000 * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
        console.log(`⏳ Retry ${i + 1}/${maxRetries} dopo ${delay}ms`)
      }
    }
  }
  
  throw lastError
}

/**
 * Rileva formato file da contenuto e nome
 */
function rilevFormatoFile(content: string, fileName: string): string {
  const extension = fileName.toLowerCase().split('.').pop()
  
  if (extension === 'csv') return 'CSV'
  if (extension === 'tsv' || extension === 'txt') return 'TSV'
  
  // Auto-rileva da contenuto
  if (content.includes('\t')) return 'TSV'
  if (content.includes(',')) return 'CSV'
  
  return 'CSV' // Default
}

/**
 * Parse CSV
 */
function parseCSV(content: string): string[][] {
  const righe: string[][] = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    if (line.trim()) {
      // Parsing CSV semplificato (non gestisce virgole dentro campi quotati)
      const campi = line.split(',').map(campo => campo.trim().replace(/^["']|["']$/g, ''))
      righe.push(campi)
    }
  }
  
  return righe
}

/**
 * Parse TSV
 */
function parseTSV(content: string): string[][] {
  const righe: string[][] = []
  const lines = content.split('\n')
  
  for (const line of lines) {
    if (line.trim()) {
      const campi = line.split('\t').map(campo => campo.trim())
      righe.push(campi)
    }
  }
  
  return righe
}

/**
 * Mappa header colonne ai campi lead
 */
function mappaColonneHeader(header: string[]): Record<string, number> {
  const mapping: Record<string, number> = {}
  
  for (let i = 0; i < header.length; i++) {
    const colonna = header[i].toLowerCase()
    
    // Nome richiedente
    if (colonna.includes('nome') && (colonna.includes('rich') || colonna.includes('client'))) {
      mapping.nomeRichiedente = i
    } else if (colonna === 'nome' || colonna === 'first_name' || colonna === 'firstname') {
      mapping.nomeRichiedente = i
    }
    
    // Cognome richiedente  
    if (colonna.includes('cognome') && (colonna.includes('rich') || colonna.includes('client'))) {
      mapping.cognomeRichiedente = i
    } else if (colonna === 'cognome' || colonna === 'last_name' || colonna === 'lastname') {
      mapping.cognomeRichiedente = i
    }
    
    // Email
    if (colonna.includes('email') || colonna.includes('mail')) {
      mapping.emailRichiedente = i
    }
    
    // Telefono
    if (colonna.includes('telefon') || colonna.includes('phone') || colonna.includes('cell')) {
      mapping.telefonoRichiedente = i
    }
    
    // Nome assistito
    if (colonna.includes('assistito') && colonna.includes('nome')) {
      mapping.nomeAssistito = i
    } else if (colonna.includes('patient') && colonna.includes('name')) {
      mapping.nomeAssistito = i
    }
    
    // Cognome assistito
    if (colonna.includes('assistito') && colonna.includes('cognome')) {
      mapping.cognomeAssistito = i
    } else if (colonna.includes('patient') && colonna.includes('surname')) {
      mapping.cognomeAssistito = i
    }
    
    // Pacchetto
    if (colonna.includes('pacch') || colonna.includes('servizio') || colonna.includes('piano')) {
      mapping.pacchetto = i
    }
    
    // Note
    if (colonna.includes('note') || colonna.includes('messaggio') || colonna.includes('comment')) {
      mapping.note = i
    }
  }
  
  return mapping
}

/**
 * Mappa tipo servizio Endered
 */
function mapEnderedPackageType(serviceType: string): string {
  if (!serviceType) return ''
  
  const type = serviceType.toLowerCase()
  
  if (type.includes('basic') || type.includes('base')) return 'Base'
  if (type.includes('premium') || type.includes('advanced') || type.includes('avanzat')) return 'Avanzato'
  
  return serviceType
}

/**
 * Genera signature webhook
 */
async function generateWebhookSignature(payload: string, secret: string): Promise<string> {
  // Implementazione semplificata per signature webhook
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(payload)
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}