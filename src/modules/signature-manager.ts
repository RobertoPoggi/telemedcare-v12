/**
 * TeleMedCare V12.0 - Signature Manager
 * Gestisce le firme elettroniche dei contratti
 */

import { createHash } from 'crypto'

export interface SignatureData {
  contractId: string
  signatureData: string // Base64 della firma o hash di validazione
  signatureType: 'ELECTRONIC' | 'DIGITAL' | 'HANDWRITTEN'
  ipAddress?: string
  userAgent?: string
  timestamp: string
}

export interface SignatureResult {
  success: boolean
  signatureId?: number
  error?: string
}

/**
 * Salva una firma nel database
 */
export async function saveSignature(
  db: D1Database,
  signatureData: SignatureData
): Promise<SignatureResult> {
  try {
    console.log(`✍️ [SIGNATURE] Salvataggio firma per contratto ${signatureData.contractId}`)

    // Genera hash del documento per validità
    const documentHash = createHash('sha256')
      .update(`${signatureData.contractId}-${signatureData.timestamp}`)
      .digest('hex')

    // Genera certificato di firma (simulato)
    const certificate = createHash('sha256')
      .update(`${signatureData.signatureData}-${signatureData.timestamp}-${documentHash}`)
      .digest('hex')

    // Inserisci firma nel database
    const result = await db.prepare(`
      INSERT INTO signatures (
        contract_id,
        firma_digitale,
        tipo_firma,
        ip_address,
        user_agent,
        timestamp_firma,
        hash_documento,
        certificato_firma,
        valida
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      signatureData.contractId,
      signatureData.signatureData,
      signatureData.signatureType,
      signatureData.ipAddress || null,
      signatureData.userAgent || null,
      signatureData.timestamp,
      documentHash,
      certificate,
      true
    ).run()

    // Aggiorna status contratto a SIGNED
    await db.prepare(`
      UPDATE contracts 
      SET status = 'SIGNED', updated_at = datetime('now')
      WHERE id = ?
    `).bind(signatureData.contractId).run()

    console.log(`✅ [SIGNATURE] Firma salvata con successo per contratto ${signatureData.contractId}`)

    return {
      success: true,
      signatureId: result.meta.last_row_id
    }

  } catch (error) {
    console.error(`❌ [SIGNATURE] Errore salvataggio firma:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Verifica se un contratto è stato firmato
 */
export async function isContractSigned(
  db: D1Database,
  contractId: string
): Promise<boolean> {
  try {
    const result = await db.prepare(`
      SELECT COUNT(*) as count 
      FROM signatures 
      WHERE contract_id = ? AND valida = 1
    `).bind(contractId).first()

    return result?.count > 0

  } catch (error) {
    console.error(`❌ [SIGNATURE] Errore verifica firma:`, error)
    return false
  }
}

/**
 * Ottieni dettagli firma
 */
export async function getSignatureDetails(
  db: D1Database,
  contractId: string
): Promise<any> {
  try {
    const signature = await db.prepare(`
      SELECT * FROM signatures 
      WHERE contract_id = ? AND valida = 1
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(contractId).first()

    return signature

  } catch (error) {
    console.error(`❌ [SIGNATURE] Errore recupero dettagli firma:`, error)
    return null
  }
}

/**
 * Invalida una firma
 */
export async function invalidateSignature(
  db: D1Database,
  signatureId: number,
  reason: string
): Promise<SignatureResult> {
  try {
    await db.prepare(`
      UPDATE signatures 
      SET valida = 0, motivo_invalidazione = ?
      WHERE id = ?
    `).bind(reason, signatureId).run()

    console.log(`⚠️ [SIGNATURE] Firma ${signatureId} invalidata: ${reason}`)

    return { success: true }

  } catch (error) {
    console.error(`❌ [SIGNATURE] Errore invalidazione firma:`, error)
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  saveSignature,
  isContractSigned,
  getSignatureDetails,
  invalidateSignature
}
