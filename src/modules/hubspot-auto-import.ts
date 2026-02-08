/**
 * HUBSPOT AUTO-IMPORT - Importazione Incrementale Ottimizzata
 * TeleMedCare V12.0
 * 
 * Logica:
 * - Import automatico incrementale: lead creati nelle ultime 24 ore
 * - Trigger: ogni caricamento dashboard operativa o leads dashboard
 * - Filtro: SOLO FORM ECURA (hs_object_source_detail_1 = 'Form eCura')
 * - Efficiente: evita di leggere 4400+ lead ogni volta
 * - Tasto IRBEMA: rimane per sincronizzazione completa manuale
 * 
 * Frequenza Import HubSpot:
 * - Import automatico HubSpot: ogni giorno alle 9:00 AM
 * - Import incrementale TeleMedCare: ogni caricamento dashboard (ultimi 1 giorno, SOLO Form eCura)
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
 * - Importa solo lead creati nelle ultime 24 ore
 * - Filtro: NESSUN FILTRO (importa tutti i lead)
 * - Ottimizzato: legge solo nuovi lead
 */
export async function executeAutoImport(
  db: D1Database,
  env: any,
  baseUrl?: string,
  config: AutoImportConfig = {
    enabled: true,
    startHour: 9,
    onlyEcura: true, // ✅ RIPRISTINATO: solo lead da Form eCura
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
        
        console.log(`🔍 [AUTO-IMPORT] Lead data mapped:`, {
          nomeRichiedente: leadData.nomeRichiedente,
          email: leadData.email,
          hasEmail: !!leadData.email,
          emailLength: leadData.email?.length || 0
        })
        
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
        console.log(`🔔 [AUTO-IMPORT] >>> INIZIO BLOCCO EMAIL <<<`)
        result.imported++
        
        // 📧 INVIA EMAIL DI NOTIFICA ADMIN usando la funzione ufficiale
        try {
          console.log(`📧 [AUTO-IMPORT] Invio email notifica tramite sendNewLeadNotification per ${leadId}...`)
          
          // Import della funzione ufficiale di notifica
          const { sendNewLeadNotification } = await import('../utils/lead-notifications')
          
          // Chiama la funzione ufficiale che usa il template NOTIFICA_INFO
          await sendNewLeadNotification(
            leadId,
            {
              nomeRichiedente: leadData.nomeRichiedente || 'N/A',
              cognomeRichiedente: leadData.cognomeRichiedente || '',
              email: leadData.email || undefined,
              telefono: leadData.telefono || undefined,
              citta: undefined, // Non disponibile in leadData
              servizio: leadData.servizio,
              piano: leadData.piano,
              fonte: 'IRBEMA',
              note: leadData.note || '',
              created_at: new Date().toISOString()
            },
            env
          )
          
          console.log(`✅ [AUTO-IMPORT] Email notifica admin inviata con successo per ${leadId}`)
        } catch (emailError) {
          console.error(`⚠️ [AUTO-IMPORT] Errore invio email notifica admin:`, emailError)
          console.error(`⚠️ [AUTO-IMPORT] Error details:`, {
            message: (emailError as Error).message,
            stack: (emailError as Error).stack,
            leadId
          })
          // Non bloccare l'import se l'email fallisce
        }
        
        // 📧 INVIA EMAIL COMPLETAMENTO DATI AL LEAD usando WorkflowOrchestrator
        try {
          // Verifica se le email ai lead sono abilitate
          const leadEmailSetting = await db.prepare(
            "SELECT value FROM settings WHERE key = 'lead_email_notifications_enabled' LIMIT 1"
          ).first()
          
          const leadEmailEnabled = leadEmailSetting?.value === 'true'
          
          console.log(`🔍 [AUTO-IMPORT] Check email conditions:`, {
            leadEmailEnabled,
            hasEmail: !!leadData.email,
            email: leadData.email,
            leadId
          })
          
          if (leadEmailEnabled && leadData.email) {
            console.log(`🚨🚨🚨 [AUTO-IMPORT] INIZIO INVIO EMAIL AL LEAD 🚨🚨🚨`)
            console.log(`📧 [AUTO-IMPORT] Email destinatario: ${leadData.email}`)
            console.log(`📧 Switch abilitato: ${leadEmailEnabled}`)
            
            // ✅ SOLUZIONE SEMPLICE: Usa lo stesso codice del pulsante manuale che FUNZIONA!
            try {
              const { createCompletionToken, getMissingFields, getSystemConfig } = await import('./lead-completion')
              const EmailService = (await import('./email-service')).default
              
              // Ottieni lead appena inserito dal database
              const insertedLead = await db.prepare('SELECT * FROM leads WHERE id = ?')
                .bind(leadId).first()
              
              if (!insertedLead) {
                console.error(`❌ [AUTO-IMPORT] Lead ${leadId} non trovato in DB dopo inserimento`)
                throw new Error('Lead not found after insert')
              }
              
              // Ottieni configurazione
              const config = await getSystemConfig(db)
              
              // Crea token
              const token = await createCompletionToken(db, leadId, config.auto_completion_token_days)
              console.log(`✅ [AUTO-IMPORT] Token creato: ${token.token}`)
              
              // Genera URL completamento
              const baseUrl = env?.PUBLIC_URL || env?.PAGES_URL || 'https://telemedcare-v12.pages.dev'
              const completionUrl = `${baseUrl}/completa-dati?token=${token.token}`
              
              // Prepara dati per email
              const { missing, available } = getMissingFields(insertedLead)
              
              // Template HTML inline (stesso dell'orchestrator)
              const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Completa i tuoi dati - eCura</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">📝 Completa i tuoi dati</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Siamo quasi pronti per attivare il tuo servizio eCura</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Gentile <strong>${leadData.nomeRichiedente || 'Cliente'} ${leadData.cognomeRichiedente || ''}</strong>,
              </p>
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Grazie per il tuo interesse verso <strong>${leadData.piano || leadData.servizio || 'eCura'}</strong>. 
                Abbiamo ricevuto la tua richiesta e per inviarti una proposta abbiamo bisogno di alcune <strong>informazioni aggiuntive</strong>.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${completionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 6px; font-size: 16px; font-weight: bold;">
                      Completa i tuoi dati
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0; text-align: center;">
                Se il pulsante non funziona, copia questo link:<br>
                <a href="${completionUrl}" style="color: #667eea;">${completionUrl}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
              
              // Invia email con EmailService (stesso codice del pulsante manuale)
              const emailService = new EmailService(env)
              const emailResult = await emailService.sendEmail({
                to: leadData.email,
                from: env?.EMAIL_FROM || 'info@telemedcare.it',
                subject: '📝 Completa la tua richiesta eCura - Ultimi dettagli necessari',
                html: emailHtml
              })
              
              if (emailResult.success) {
                console.log(`✅✅✅ [AUTO-IMPORT] Email completamento inviata a ${leadData.email} ✅✅✅`)
              } else {
                console.error(`❌❌❌ [AUTO-IMPORT] Errore invio email: ${emailResult.error} ❌❌❌`)
              }
              
            } catch (emailError) {
              console.error(`⚠️ [AUTO-IMPORT] Errore email completamento:`, emailError)
              console.error(`⚠️ [AUTO-IMPORT] Error details:`, {
                message: (emailError as Error).message,
                stack: (emailError as Error).stack,
                leadId
              })
            }
          } else {
            console.log(`⏭️⏭️⏭️ [AUTO-IMPORT] Email completamento dati NON inviata ⏭️⏭️⏭️`)
            console.log(`   leadEmailEnabled: ${leadEmailEnabled}`)
            console.log(`   leadData.email: ${leadData.email || 'MISSING'}`)
            console.log(`   Motivo: ${!leadEmailEnabled ? 'Switch OFF' : 'Email mancante'}`)
          }
        } catch (emailError) {
          console.error(`⚠️ [AUTO-IMPORT] Errore workflow completamento dati:`, emailError)
          console.error(`⚠️ [AUTO-IMPORT] Error details:`, {
            message: (emailError as Error).message,
            stack: (emailError as Error).stack,
            leadId
          })
          // Non bloccare l'import se l'email fallisce
        }
        
        console.log(`🔔 [AUTO-IMPORT] >>> FINE BLOCCO EMAIL <<<`)
        
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
    
    // 💰 NOTA: Fix prezzi viene eseguito tramite endpoint /api/leads/fix-prices
    // Non lo eseguiamo qui per evitare dipendenze circolari
    
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
  // Log function disabled - use console.log instead
  // The 'logs' table doesn't exist, and we don't need it for now
  console.log('📝 [AUTO-IMPORT LOG]', JSON.stringify({
    imported: result.imported,
    skipped: result.skipped,
    errors: result.errors,
    timeRange: result.timeRange
  }))
}
