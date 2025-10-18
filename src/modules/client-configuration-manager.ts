/**
 * TeleMedCare V11.0 - Client Configuration Manager
 * Gestisce le configurazioni compilate dai clienti dopo il pagamento
 */

export interface ConfigurationData {
  leadId: string
  codiceCliente: string
  
  // Dati assistito dettagliati
  nomeCompletoAssistito: string
  dataNascitaAssistito: string
  luogoNascitaAssistito?: string
  codiceFiscaleAssistito?: string
  indirizzoCompletoAssistito: string
  cittaAssistito: string
  capAssistito: string
  provinciaAssistito: string
  telefonoAssistito?: string
  emailAssistito?: string
  
  // Contatti emergenza
  contattoEmergenzaNome?: string
  contattoEmergenzaTelefono?: string
  contattoEmergenzaParentela?: string
  
  // Medico curante
  medicoCuranteNome?: string
  medicoCuranteTelefono?: string
  medicoCuranteIndirizzo?: string
  
  // Condizioni sanitarie
  patologieCroniche?: string
  allergie?: string
  farmaciAssunti?: string
  noteClinice?: string
  
  // Preferenze servizio
  orarioPreferitoChiamata?: string
  linguaPreferita?: string
  noteAggiuntive?: string
  
  // Metadata
  compilazioneTimestamp: string
  ipAddress?: string
  userAgent?: string
}

export interface ConfigurationResult {
  success: boolean
  configurationId?: string
  error?: string
}

/**
 * Genera ID configurazione
 */
function generateConfigId(): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `CFG${timestamp}${random}`
}

/**
 * Salva configurazione nel database
 */
export async function saveConfiguration(
  db: D1Database,
  configData: ConfigurationData
): Promise<ConfigurationResult> {
  try {
    console.log(`📋 [CONFIG] Salvataggio configurazione per cliente ${configData.codiceCliente}`)

    // Converti oggetto in JSON per salvare in campo TEXT
    const configJson = JSON.stringify(configData)

    // DEBUG: Test each field individually - Note: id is AUTOINCREMENT, don't insert it
    const field1 = configData.leadId
    const field2 = configJson  // configuration_data includes codiceCliente
    const field3 = 'SUBMITTED'
    
    console.log(`📋 [CONFIG DEBUG] Field 1 (leadId):`, field1, typeof field1)
    console.log(`📋 [CONFIG DEBUG] Field 2 (config_data):`, field2?.substring(0, 50), typeof field2)
    console.log(`📋 [CONFIG DEBUG] Field 3 (status):`, field3, typeof field3)

    // Check for undefined values
    if (field1 === undefined) throw new Error('Field 1 (leadId) is undefined')
    if (field2 === undefined) throw new Error('Field 2 (configuration_data) is undefined')
    if (field3 === undefined) throw new Error('Field 3 (status) is undefined')

    // Inserisci configurazione nel database - id is AUTOINCREMENT, don't provide it
    const insertResult = await db.prepare(`
      INSERT INTO configurations (
        leadId,
        configuration_data,
        status,
        created_at
      ) VALUES (?, ?, ?, datetime('now'))
    `).bind(
      field1,
      field2,
      field3
    ).run()
    
    // Get the auto-generated ID
    const configId = String(insertResult.meta.last_row_id)

    // Aggiorna status lead
    await db.prepare(`
      UPDATE leads 
      SET status = 'CONFIGURED', updated_at = datetime('now')
      WHERE id = ?
    `).bind(configData.leadId).run()

    console.log(`✅ [CONFIG] Configurazione salvata con successo`)

    return {
      success: true,
      configurationId: configId
    }

  } catch (error) {
    console.error(`❌ [CONFIG] Errore salvataggio configurazione:`, error)
    
    // Return debug info in error response
    const field1 = configData.leadId
    const field2 = JSON.stringify(configData)
    const field3 = 'SUBMITTED'
    
    const debugInfo = {
      field1_leadId: { value: field1, type: typeof field1, isUndefined: field1 === undefined },
      field2_config_data: { value: field2?.substring(0, 50), type: typeof field2, isUndefined: field2 === undefined },
      field3_status: { value: field3, type: typeof field3, isUndefined: field3 === undefined },
      originalError: error.message
    }
    
    return {
      success: false,
      error: error.message,
      debug: debugInfo
    } as any
  }
}

/**
 * Ottieni configurazione cliente
 */
export async function getConfiguration(
  db: D1Database,
  leadId: string
): Promise<ConfigurationData | null> {
  try {
    const result = await db.prepare(`
      SELECT configuration_data 
      FROM configurations 
      WHERE leadId = ?
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(leadId).first<any>()

    if (result && result.configuration_data) {
      return JSON.parse(result.configuration_data)
    }

    return null

  } catch (error) {
    console.error(`❌ [CONFIG] Errore recupero configurazione:`, error)
    return null
  }
}

/**
 * Verifica se cliente ha completato configurazione
 */
export async function hasCompletedConfiguration(
  db: D1Database,
  leadId: string
): Promise<boolean> {
  try {
    const result = await db.prepare(`
      SELECT COUNT(*) as count 
      FROM configurations 
      WHERE leadId = ? AND status = 'SUBMITTED'
    `).bind(leadId).first<any>()

    return result?.count > 0

  } catch (error) {
    console.error(`❌ [CONFIG] Errore verifica configurazione:`, error)
    return false
  }
}

/**
 * Aggiorna status configurazione
 */
export async function updateConfigurationStatus(
  db: D1Database,
  configId: string,
  status: 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED'
): Promise<ConfigurationResult> {
  try {
    await db.prepare(`
      UPDATE configurations 
      SET status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(status, configId).run()

    console.log(`✅ [CONFIG] Status configurazione ${configId} aggiornato a ${status}`)

    return { success: true }

  } catch (error) {
    console.error(`❌ [CONFIG] Errore aggiornamento status:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  saveConfiguration,
  getConfiguration,
  hasCompletedConfiguration,
  updateConfigurationStatus
}
