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
  temperatura: string | null      // 'caldo' | 'tiepido' | 'freddo' — calcolata o manuale
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
  'note',
  'temperatura'
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

// ============================================================================
// TABELLA: partners
// Dataset PARTNER - Professionisti che promuovono eCura tramite referral
// Migration: 0106_create_partners_table.sql
// ============================================================================
export interface Partner {
  id: string                          // PRIMARY KEY — formato PART-XXXX-XXXXX
  nome: string                        // Nome
  cognome: string                     // Cognome
  email: string                       // Email (UNIQUE)
  telefono: string                    // Telefono

  // Ruolo professionale
  ruolo: string                       // Fisioterapista, Badante, Medico, Infermiere, Caregiver, Farmacista, Altro
  specializzazione: string | null     // Specializzazione opzionale
  citta: string | null                // Città
  provincia: string | null            // Provincia (2 lettere)
  cap: string | null                  // CAP

  // Referral
  referral_code: string | null        // ECU-XXXX (generato all'approvazione o alla registrazione)
  referral_url: string | null         // https://www.ecura.it/?ref=ECU-XXXX

  // Stato e workflow
  status: string                      // pending | active | suspended | rejected
  approvato_da: string | null         // Username operatore
  note_interne: string | null         // Note operative interne
  motivo_rifiuto: string | null       // Compilato se status = rejected

  // Performance e commissioni
  commission_pct: number              // % commissione (default 5.0)
  referrals_count: number             // Totale lead portati
  referrals_attivi: number            // Lead convertiti in contratto attivo
  commissioni_maturate: number        // EUR totali maturati
  commissioni_pagate: number          // EUR totali pagati

  // Dal form
  messaggio: string | null            // Messaggio iniziale del partner

  // Consensi
  privacy_consent: number             // 0 | 1

  // UTM / tracciamento
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  page_url: string | null
  referrer: string | null

  // Metadata tecnico
  ip_address: string | null
  user_agent: string | null

  // Timestamps
  created_at: string
  updated_at: string
  approvato_at: string | null
  sospeso_at: string | null
}

/**
 * Campi MODIFICABILI del partner via CRUD admin
 */
export const PARTNER_EDITABLE_FIELDS = [
  'nome',
  'cognome',
  'email',
  'telefono',
  'ruolo',
  'specializzazione',
  'citta',
  'provincia',
  'cap',
  'referral_code',
  'referral_url',
  'status',
  'approvato_da',
  'note_interne',
  'motivo_rifiuto',
  'commission_pct',
  'referrals_count',
  'referrals_attivi',
  'commissioni_maturate',
  'commissioni_pagate',
  'messaggio',
  'approvato_at',
  'sospeso_at',
] as const

/**
 * Campi READ-ONLY del partner
 */
export const PARTNER_READONLY_FIELDS = [
  'id',
  'created_at',
  'privacy_consent',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'page_url',
  'referrer',
  'ip_address',
  'user_agent',
] as const

// ============================================================================
// TABELLA: partner_referrals
// Traccia ogni lead portato da un partner
// ============================================================================
export interface PartnerReferral {
  id: number                          // AUTOINCREMENT
  partner_id: string                  // FK → partners.id
  lead_id: string                     // FK → leads.id
  referral_code: string               // Codice usato (snapshot storico)
  status: string                      // nuovo | contattato | convertito | perso
  commissione_pct: number | null      // % al momento della referral
  commissione_eur: number | null      // EUR maturati (calcolato alla conversione)
  commissione_pagata: number          // 0 | 1
  note: string | null
  created_at: string
  updated_at: string
}

/**
 * Ruoli partner validi
 */
export const PARTNER_RUOLI = [
  'Fisioterapista',
  'Badante',
  'Medico',
  'Infermiere',
  'Caregiver',
  'Farmacista',
  'Assistente sociale',
  'Psicologo',
  'Nutrizionista',
  'Personal trainer',
  'Operatore sociosanitario (OSS)',
  'Altro',
] as const

export type PartnerRuolo = typeof PARTNER_RUOLI[number]

/**
 * Status validi del partner
 */
export const PARTNER_STATUSES = ['pending', 'active', 'suspended', 'rejected'] as const
export type PartnerStatus = typeof PARTNER_STATUSES[number]
