/**
 * HUBSPOT AUTO-IMPORT - Importazione Incrementale Ottimizzata
 * TeleMedCare V12.0
 * 
 * Logica:
 * - Import automatico incrementale: lead creati nelle ultime 24 ore
 * - Trigger: ogni caricamento dashboard operativa o leads dashboard
 * - Filtro: NESSUN FILTRO (importa tutti i lead, non solo Form eCura)
 * - Efficiente: evita di leggere 4400+ lead ogni volta
 * - Tasto IRBEMA: rimane per sincronizzazione completa manuale
 * 
 * Frequenza Import HubSpot:
 * - Import automatico HubSpot: ogni giorno alle 9:00 AM
 * - Import incrementale TeleMedCare: ogni caricamento dashboard (ultimi 1 giorno)
 */

import type { D1Database } from '@cloudflare/workers-types'

// =====================================================================
// TYPES
// =====================================================================

export interface AutoImportResult {
  success: boolean
  message: string
  imported: number
  skipped: number
  errors: number
  errorDetails: string[]
  timeRange: {
    from: string
    to: string
  }
  performance: {
    hubspotContacts: number
    processingTimeMs: number
  }
}

export interface AutoImportConfig {
  enabled: boolean
  startHour: number // Ora di inizio import automatico HubSpot (default 9)
  onlyEcura: boolean // Filtra solo Form eCura
  dryRun: boolean // Test mode
}

// =====================================================================
// AUTO IMPORT MANAGER
// =====================================================================

/**
 * Calcola il timestamp di inizio per import incrementale
 * ✅ NUOVO: Importa lead delle ultime 24 ore (non più dalle 9:00)
 */
export function getIncrementalStartTime(config: AutoImportConfig): Date {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000)) // 24 ore fa
  return oneDayAgo
}

/**
 * Esegue import incrementale automatico da HubSpot
 * - Importa solo lead creati dalle 9:00 di mattina ad ora
 * - Filtro Form eCura attivo
 * - Ottimizzato: legge solo nuovi lead
 */
export async function executeAutoImport(
  db: D1Database,
  env: any,
  config: AutoImportConfig = {
    enabled: true,
    startHour: 9,
    onlyEcura: true,
    dryRun: false
  }
): Promise<AutoImportResult> {
  const startTime = Date.now()
  
  const result: AutoImportResult = {
    success: false,
    message: '',
    imported: 0,
    skipped: 0,
    errors: 0,
    errorDetails: [],
    timeRange: {
      from: '',
      to: new Date().toISOString()
    },
    performance: {
      hubspotContacts: 0,
      processingTimeMs: 0
    }
  }
  
  try {
    // Verifica configurazione
    if (!config.enabled) {
      result.message = 'Auto-import disabilitato'
      return result
    }
    
    const accessToken = env?.HUBSPOT_ACCESS_TOKEN
    const portalId = env?.HUBSPOT_PORTAL_ID
    
    if (!accessToken || !portalId) {
      result.message = 'Credenziali HubSpot non configurate'
      result.errorDetails.push('Mancano HUBSPOT_ACCESS_TOKEN o HUBSPOT_PORTAL_ID')
      return result
    }
    
    // Import modulo HubSpot
    const { HubSpotClient, mapHubSpotContactToLead } = await import('./hubspot-integration')
    
    // Calcola intervallo temporale (dalle 9:00 ad ora)
    const createdAfter = getIncrementalStartTime(config)
    result.timeRange.from = createdAfter.toISOString()
    
    console.log(`🔄 [AUTO-IMPORT] Inizio import incrementale ultimi 1 giorno (da ${createdAfter.toLocaleString('it-IT')})`)
    console.log(`📊 [AUTO-IMPORT] Config: onlyEcura=${config.onlyEcura}, dryRun=${config.dryRun}`)
    
    // Client HubSpot
    const client = new HubSpotClient(accessToken, portalId)
    
    // Filtri ricerca ottimizzati
    const searchFilters: any = {
      createdAfter: createdAfter.toISOString(),
      limit: 100 // Max 100 contatti per chiamata
    }
    
    if (config.onlyEcura) {
      searchFilters.hs_object_source_detail_1 = 'Form eCura'
      console.log('🔍 [AUTO-IMPORT] Filtro attivo: solo lead da Form eCura')
    }
    
    // Ricerca contatti HubSpot
    const response = await client.searchContacts(searchFilters)
    result.performance.hubspotContacts = response.results.length
    
    console.log(`📊 [AUTO-IMPORT] Trovati ${response.results.length} contatti HubSpot da processare`)
    
    if (response.results.length === 0) {
      result.success = true
      result.message = `Nessun nuovo lead da importare (periodo: ${createdAfter.toLocaleTimeString('it-IT')} - ${new Date().toLocaleTimeString('it-IT')})`
      result.performance.processingTimeMs = Date.now() - startTime
      return result
    }
    
    // Processa ogni contatto
    for (const contact of response.results) {
      try {
        // Verifica se esiste già (by email o external_source_id)
        const existing = await db.prepare(`
          SELECT id FROM leads 
          WHERE email = ? OR external_source_id = ?
          LIMIT 1
        `).bind(contact.properties.email, contact.id).first()
        
        if (existing) {
          console.log(`⏭️  [AUTO-IMPORT] Contact ${contact.id} (${contact.properties.email}) già esistente, skip`)
          result.skipped++
          continue
        }
        
        if (config.dryRun) {
          console.log(`🔍 [AUTO-IMPORT DRY-RUN] Contatto ${contact.id} sarebbe stato importato`)
          result.imported++
          continue
        }
        
        // Mappa contatto HubSpot → Lead TeleMedCare
        const leadData = mapHubSpotContactToLead(contact)
        
        // Genera ID lead sequenziale LEAD-IRBEMA-xxxxx
        const lastIrbemaLead = await db.prepare(`
          SELECT id FROM leads 
          WHERE id LIKE 'LEAD-IRBEMA-%' 
          ORDER BY id DESC 
          LIMIT 1
        `).first()
        
        let nextNumber = 146 // Default se non ci sono lead IRBEMA
        if (lastIrbemaLead?.id) {
          const match = (lastIrbemaLead.id as string).match(/LEAD-IRBEMA-(\d+)/)
          if (match) {
            nextNumber = parseInt(match[1]) + 1
          }
        }
        
        const leadId = `LEAD-IRBEMA-${nextNumber.toString().padStart(5, '0')}`
        console.log(`🆔 [AUTO-IMPORT] Generato ID: ${leadId} per ${contact.properties.email}`)
        
        // Inserisci nel database con PREZZI (usa campi esistenti)
        await db.prepare(`
          INSERT INTO leads (
            id, nomeRichiedente, cognomeRichiedente, email, telefono,
            nomeAssistito, cognomeAssistito,
            servizio, piano, tipoServizio,
            prezzo_anno, prezzo_rinnovo,
            fonte, external_source_id, status, note,
            vuoleContratto, vuoleBrochure, vuoleManuale,
            consensoPrivacy, consensoMarketing, consensoTerze,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          leadId,
          leadData.nomeRichiedente,
          leadData.cognomeRichiedente,
          leadData.email,
          leadData.telefono,
          leadData.nomeAssistito,
          leadData.cognomeAssistito,
          leadData.servizio,
          leadData.piano,
          leadData.tipoServizio,
          leadData.prezzo_anno || null,
          leadData.prezzo_rinnovo || null,
          leadData.fonte,
          leadData.external_source_id,
          leadData.status,
          leadData.note,
          leadData.vuoleContratto,
          leadData.vuoleBrochure,
          leadData.vuoleManuale,
          leadData.consensoPrivacy ? 1 : 0,
          leadData.consensoMarketing ? 1 : 0,
          leadData.consensoTerze ? 1 : 0,
          new Date().toISOString(),
          new Date().toISOString()
        ).run()
        
        console.log(`✅ [AUTO-IMPORT] Lead creato: ${leadId} from HubSpot ${contact.id}`)
        result.imported++
        
      } catch (error) {
        console.error(`❌ [AUTO-IMPORT] Errore import contact ${contact.id}:`, error)
        result.errors++
        result.errorDetails.push({
          contactId: contact.id,
          email: contact.properties.email,
          error: (error as Error).message
        } as any)
      }
    }
    
    // Risultato finale
    result.success = true
    result.message = config.dryRun 
      ? `Dry run: ${result.imported} lead sarebbero stati importati` 
      : `Import completato: ${result.imported} nuovi lead importati, ${result.skipped} già esistenti`
    result.performance.processingTimeMs = Date.now() - startTime
    
    console.log(`✅ [AUTO-IMPORT] Completato in ${result.performance.processingTimeMs}ms`)
    console.log(`📊 [AUTO-IMPORT] Risultati: ${result.imported} importati, ${result.skipped} skipped, ${result.errors} errori`)
    
    return result
    
  } catch (error) {
    console.error('❌ [AUTO-IMPORT] Errore generale:', error)
    result.success = false
    result.message = `Errore import: ${(error as Error).message}`
    result.errorDetails.push((error as Error).message)
    result.performance.processingTimeMs = Date.now() - startTime
    return result
  }
}

/**
 * Verifica se l'auto-import è necessario
 * - Controlla ultimo import
 * - Ritorna true se passato abbastanza tempo
 */
export async function shouldRunAutoImport(
  db: D1Database,
  minIntervalMinutes: number = 5
): Promise<boolean> {
  try {
    // Controlla ultimo import dal log
    const lastImport = await db.prepare(`
      SELECT timestamp 
      FROM logs 
      WHERE action = 'AUTO_IMPORT' 
      ORDER BY timestamp DESC 
      LIMIT 1
    `).first()
    
    if (!lastImport) {
      return true // Primo import
    }
    
    const lastTime = new Date(lastImport.timestamp as string)
    const now = new Date()
    const diffMinutes = (now.getTime() - lastTime.getTime()) / 1000 / 60
    
    return diffMinutes >= minIntervalMinutes
    
  } catch (error) {
    console.error('Errore verifica auto-import:', error)
    return false
  }
}

/**
 * Salva log auto-import
 */
export async function logAutoImport(
  db: D1Database,
  result: AutoImportResult
): Promise<void> {
  try {
    await db.prepare(`
      INSERT INTO logs (action, details, timestamp)
      VALUES (?, ?, ?)
    `).bind(
      'AUTO_IMPORT',
      JSON.stringify({
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
        timeRange: result.timeRange,
        performance: result.performance
      }),
      new Date().toISOString()
    ).run()
  } catch (error) {
    console.error('Errore salvataggio log auto-import:', error)
  }
}
