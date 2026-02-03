/**
 * TeleMedCare V12.0 / eCura - HubSpot Webhook Handler
 * Gestisce i webhook da HubSpot CRM (Irbema) per i lead provenienti da www.ecura.it
 * 
 * FLUSSO:
 * 1. HubSpot invia webhook quando un nuovo lead compila il form su ecura.it
 * 2. Questo handler riceve i dati, li valida e li mappa
 * 3. Salva il lead nel database TeleMedCare
 * 4. Triggera il workflow email automatico
 * 
 * ENDPOINT: POST /api/webhooks/hubspot
 */

import { D1Database } from '@cloudflare/workers-types'
import { LeadData } from './workflow-email-manager'

/**
 * Struttura dati webhook HubSpot
 * Documentazione: https://developers.hubspot.com/docs/api-reference/overview
 */
export interface HubSpotWebhookPayload {
  // Standard HubSpot webhook fields
  objectId: number
  propertyName?: string
  propertyValue?: string
  changeSource?: string
  eventId?: number
  subscriptionId?: number
  portalId?: number
  appId?: number
  occurredAt?: number
  subscriptionType?: string
  attemptNumber?: number
  
  // Custom properties (da sincronizzare con NUR)
  properties?: {
    // Dati Richiedente
    firstname?: string // Nome richiedente
    lastname?: string // Cognome richiedente
    email?: string // Email richiedente
    phone?: string // Telefono richiedente
    
    // Dati Assistito
    nome_assistito?: string
    cognome_assistito?: string
    eta_assistito?: string
    
    // Scelte Servizio
    servizio_ecura?: 'FAMILY' | 'PRO' | 'PREMIUM'
    piano_ecura?: 'BASE' | 'AVANZATO'
    
    // Richieste
    richiedi_brochure?: 'true' | 'false' | boolean
    richiedi_contratto?: 'true' | 'false' | boolean
    
    // Filtro fonte (campo NUR)
    hs_object_source_detail_1?: string // "Form eCura" per lead da www.ecura.it
    
    // Altro
    note?: string
    privacy_consent?: 'true' | 'false' | boolean
    marketing_consent?: 'true' | 'false' | boolean
  }
}

/**
 * Valida il payload del webhook HubSpot
 */
export function validateHubSpotPayload(payload: any): boolean {
  if (!payload) {
    console.error('❌ Payload HubSpot vuoto')
    return false
  }

  // Verifica campi obbligatori HubSpot
  if (!payload.portalId && !payload.properties) {
    console.error('❌ Payload HubSpot invalido: mancano portalId o properties')
    return false
  }

  const props = payload.properties || {}

  // ✅ FILTRO: Accetta SOLO lead da "Form eCura" (www.ecura.it)
  if (props.hs_object_source_detail_1 !== 'Form eCura') {
    console.log(`⚠️ Lead ignorato: fonte "${props.hs_object_source_detail_1}" diversa da "Form eCura"`)
    return false
  }

  // Verifica campi obbligatori form
  if (!props.email) {
    console.error('❌ Email richiedente mancante')
    return false
  }

  if (!props.firstname || !props.lastname) {
    console.error('❌ Nome o cognome richiedente mancante')
    return false
  }

  if (!props.servizio_ecura) {
    console.error('❌ Servizio eCura non specificato')
    return false
  }

  return true
}

/**
 * Converte il payload HubSpot in LeadData TeleMedCare
 */
export function mapHubSpotToLead(payload: HubSpotWebhookPayload): LeadData {
  const props = payload.properties || {}
  
  // Normalizza valori booleani (HubSpot può inviarli come stringhe)
  const vuoleBrochure = props.richiedi_brochure === true || props.richiedi_brochure === 'true'
  const vuoleContratto = props.richiedi_contratto === true || props.richiedi_contratto === 'true'
  
  // Genera ID lead
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 8).toUpperCase()
  const leadId = `LEAD_${new Date().toISOString().replace(/[:.]/g, '').slice(0, -1)}Z_${randomId}`

  // Mappa piano (default BASE se non specificato)
  const pacchetto = (props.piano_ecura || 'BASE').toUpperCase()

  return {
    id: leadId,
    
    // Dati Richiedente (obbligatori)
    nomeRichiedente: props.firstname || '',
    cognomeRichiedente: props.lastname || '',
    emailRichiedente: props.email || '',
    telefonoRichiedente: props.phone || undefined,
    
    // Dati Assistito (opzionali)
    nomeAssistito: props.nome_assistito || undefined,
    cognomeAssistito: props.cognome_assistito || undefined,
    etaAssistito: props.eta_assistito ? parseInt(props.eta_assistito) : undefined,
    
    // Servizio e Piano
    pacchetto: pacchetto as 'BASE' | 'AVANZATO',
    
    // Richieste
    vuoleBrochure: vuoleBrochure,
    vuoleManuale: false, // Non presente nel form eCura
    vuoleContratto: vuoleContratto,
    
    // Note
    note: props.note || undefined
  }
}

/**
 * Salva il lead nel database D1
 */
export async function saveLeadToDB(lead: LeadData, db: D1Database): Promise<boolean> {
  try {
    const insertQuery = `
      INSERT INTO leads (
        id, 
        nome_richiedente, 
        cognome_richiedente, 
        email_richiedente, 
        telefono_richiedente,
        nome_assistito, 
        cognome_assistito, 
        eta_assistito,
        pacchetto,
        vuole_brochure,
        vuole_manuale,
        vuole_contratto,
        note,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    await db
      .prepare(insertQuery)
      .bind(
        lead.id,
        lead.nomeRichiedente,
        lead.cognomeRichiedente,
        lead.emailRichiedente,
        lead.telefonoRichiedente || null,
        lead.nomeAssistito || null,
        lead.cognomeAssistito || null,
        lead.etaAssistito || null,
        lead.pacchetto,
        lead.vuoleBrochure ? 1 : 0,
        lead.vuoleManuale ? 1 : 0,
        lead.vuoleContratto ? 1 : 0,
        lead.note || null,
        'NEW',
        new Date().toISOString()
      )
      .run()

    console.log(`✅ Lead ${lead.id} salvato nel database`)
    return true
  } catch (error) {
    console.error(`❌ Errore salvataggio lead nel DB:`, error)
    return false
  }
}

/**
 * Handler principale per webhook HubSpot
 * @returns Response con status e messaggio
 */
export async function handleHubSpotWebhook(
  request: Request,
  env: any
): Promise<Response> {
  try {
    // 1. Parse payload
    const payload: HubSpotWebhookPayload = await request.json()
    
    console.log('📥 Webhook HubSpot ricevuto:', {
      portalId: payload.portalId,
      objectId: payload.objectId,
      subscriptionType: payload.subscriptionType
    })

    // 2. Validazione
    if (!validateHubSpotPayload(payload)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Payload invalido' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 3. Mappatura dati
    const leadData = mapHubSpotToLead(payload)
    
    console.log('🔄 Lead mappato:', {
      id: leadData.id,
      email: leadData.emailRichiedente,
      servizio: leadData.pacchetto,
      vuoleBrochure: leadData.vuoleBrochure,
      vuoleContratto: leadData.vuoleContratto
    })

    // 4. Salvataggio nel database
    const db: D1Database = env.DB || env.telemedcare_v12_db
    const saved = await saveLeadToDB(leadData, db)
    
    if (!saved) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Errore salvataggio database' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 5. TODO: Triggera workflow email (implementato successivamente)
    // await triggerEmailWorkflow(leadData, env)

    // 6. Risposta successo
    return new Response(
      JSON.stringify({
        success: true,
        leadId: leadData.id,
        message: 'Lead ricevuto e processato con successo'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Errore handler webhook HubSpot:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
