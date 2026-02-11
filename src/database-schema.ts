/**
 * TeleMedCare V12 - Database Schema Reference
 * 
 * Questo file contiene la definizione COMPLETA e UFFICIALE di tutte le tabelle del database.
 * DA USARE COME RIFERIMENTO UNICO per tutte le operazioni CRUD.
 * 
 * ⚠️ IMPORTANTE: Questo è il SINGLE SOURCE OF TRUTH per lo schema DB!
 */

// ============================================================================
// TABELLA: leads
// ============================================================================
export interface Lead {
  id: string                      // PRIMARY KEY
  nomeRichiedente: string         // Nome richiedente/caregiver
  cognomeRichiedente: string      // Cognome richiedente/caregiver
  email: string                   // Email richiedente/caregiver
  telefono: string                // Telefono richiedente/caregiver
  nomeAssistito: string | null    // Nome assistito
  cognomeAssistito: string | null // Cognome assistito
  etaAssistito: string | null     // Età assistito
  fonte: string | null            // Fonte del lead (IRBEMA, Excel, AON, etc.)
  tipoServizio: string | null     // Tipo servizio (eCura PRO, eCura FAMILY, etc.)
  vuoleBrochure: string | null    // "Si" / "No"
  vuoleManuale: string | null     // "Si" / "No"
  vuoleContratto: string | null   // "Si" / "No"
  gdprConsent: number         // 0 o 1
  consensoMarketing: number       // 0 o 1
  consensoTerze: number           // 0 o 1
  status: string                  // nuovo, CONTRACT_SENT, CONTRACT_SIGNED, etc.
  note: string | null             // Note libere
  external_source_id: string | null
  external_data: string | null
  created_at: string              // ISO timestamp
  updated_at: string              // ISO timestamp
  timestamp: number               // Unix timestamp
}

/**
 * Campi MODIFICABILI via CRUD (esclude campi read-only)
 */
export const LEAD_EDITABLE_FIELDS = [
  'nomeRichiedente',
  'cognomeRichiedente',
  'email',
  'telefono',
  'nomeAssistito',
  'cognomeAssistito',
  'etaAssistito',
  'fonte',
  'tipoServizio',
  'vuoleBrochure',
  'vuoleManuale',
  'vuoleContratto',
  'gdprConsent',
  'consensoMarketing',
  'consensoTerze',
  'status',
  'note'
] as const

/**
 * Campi READ-ONLY (non modificabili)
 */
export const LEAD_READONLY_FIELDS = [
  'id',
  'created_at',
  'timestamp',
  'external_source_id',
  'external_data'
] as const

// ============================================================================
// TABELLA: contracts
// ============================================================================
export interface Contract {
  id: string
  leadId: string
  codice_contratto: string
  tipo_contratto: string
  template_utilizzato: string
  contenuto_html: string
  pdf_url: string | null
  pdf_generated: boolean
  prezzo_mensile: number
  durata_mesi: number
  prezzo_totale: number
  status: string
  data_invio: string
  data_scadenza: string
  email_sent: boolean
  email_template_used: string | null
  piano: string | null
  servizio: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// TABELLA: assistiti
// ============================================================================
export interface Assistito {
  id: string
  nome_assistito: string
  cognome_assistito: string
  nome_caregiver: string | null
  cognome_caregiver: string | null
  parentela_caregiver: string | null
  email: string
  telefono: string
  imei: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Valida se un campo esiste nella tabella leads
 */
export function isValidLeadField(fieldName: string): boolean {
  return [...LEAD_EDITABLE_FIELDS, ...LEAD_READONLY_FIELDS].includes(fieldName as any)
}

/**
 * Valida se un campo è modificabile
 */
export function isEditableLeadField(fieldName: string): boolean {
  return LEAD_EDITABLE_FIELDS.includes(fieldName as any)
}

/**
 * Filtra un oggetto mantenendo solo i campi validi e modificabili
 */
export function filterEditableLeadFields(data: Record<string, any>): Record<string, any> {
  const filtered: Record<string, any> = {}
  
  for (const [key, value] of Object.entries(data)) {
    if (isEditableLeadField(key) && value !== undefined) {
      filtered[key] = value
    }
  }
  
  return filtered
}

/**
 * Genera query UPDATE dinamica per leads
 */
export function buildLeadUpdateQuery(data: Record<string, any>, leadId: string): {
  query: string
  binds: any[]
} {
  const filtered = filterEditableLeadFields(data)
  const updates: string[] = []
  const binds: any[] = []
  
  for (const [key, value] of Object.entries(filtered)) {
    updates.push(`${key} = ?`)
    binds.push(value)
  }
  
  // Aggiungi updated_at
  updates.push('updated_at = ?')
  binds.push(new Date().toISOString())
  
  // Aggiungi id per WHERE
  binds.push(leadId)
  
  const query = `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`
  
  return { query, binds }
}
