/**
 * TeleMedCare V12.0 / eCura - Brochure Manager
 * Gestisce la mappatura Servizio → Brochure e il caricamento dinamico dei PDF
 * 
 * MAPPATURA SERVIZI → DISPOSITIVI → BROCHURE:
 * - FAMILY → SiDLY Care FAMILY → Medica_GB_SiDLY_Care_PRO_ITA.pdf (2.6 MB)
 * - PRO → SiDLY Care PRO → Medica_GB_SiDLY_Care_PRO_ITA.pdf (2.6 MB)
 * - PREMIUM → SiDLY Vital Care → Medica_GB_SiDLY_Vital_Care_ITA.pdf (1.7 MB)
 * 
 * PATH: /documents/ (non più /brochures/)
 * FORMAT: PDF leggibili (non più compressi)
 * 
 * ✅ FIX 08/03/2026: Sostituiti file compressi rotti con versioni leggibili
 */

export interface BrochureInfo {
  servizio: 'FAMILY' | 'PRO' | 'PREMIUM'
  nomeDispositivo: string
  filename: string
  descrizione: string
}

/**
 * Mappa i servizi eCura alle rispettive brochure dispositivi
 */
export const BROCHURE_MAP: Record<string, BrochureInfo> = {
  'FAMILY': {
    servizio: 'FAMILY',
    nomeDispositivo: 'SiDLY Care FAMILY',
    filename: 'Medica_GB_SiDLY_Care_PRO_ITA.pdf', // ✅ FAMILY usa stessa brochure di PRO
    descrizione: 'Dispositivo per monitoraggio familiare (SiDLY Care FAMILY)'
  },
  'PRO': {
    servizio: 'PRO',
    nomeDispositivo: 'SiDLY Care PRO',
    filename: 'Medica_GB_SiDLY_Care_PRO_ITA.pdf', // ✅ File leggibile (2.6 MB)
    descrizione: 'Dispositivo professionale per assistenza avanzata (SiDLY Care PRO)'
  },
  'PREMIUM': {
    servizio: 'PREMIUM',
    nomeDispositivo: 'SiDLY Vital Care',
    filename: 'Medica_GB_SiDLY_Vital_Care_ITA.pdf', // ✅ File leggibile (1.7 MB)
    descrizione: 'Dispositivo premium per monitoraggio completo (SiDLY Vital Care)'
  }
}

/**
 * Ottiene le informazioni della brochure per un servizio specifico
 */
export function getBrochureForService(servizio: string): BrochureInfo | null {
  const normalized = servizio.toUpperCase()
  return BROCHURE_MAP[normalized] || null
}

/**
 * Carica la brochure PDF dal percorso pubblico
 * @param servizio - Servizio eCura (FAMILY/PRO/PREMIUM)
 * @param baseUrl - URL base del server (es. https://app.ecura.it o http://localhost:8788)
 * @returns Base64 del PDF o null se errore
 * 
 * 🛡️ SAFETY CHECK: Verifica dimensione PDF prima di restituirlo
 * Se il PDF è < 10 KB, tenta automaticamente percorsi alternativi
 */
export async function loadBrochurePDF(
  servizio: string, 
  baseUrl: string
): Promise<{ filename: string; content: string; size: number } | null> {
  try {
    const brochureInfo = getBrochureForService(servizio)
    
    if (!brochureInfo) {
      console.error(`❌ Servizio "${servizio}" non trovato nella mappa brochure`)
      return null
    }

    // 🔍 TENTATIVO 1: Path standard /documents/
    const pdfUrl = `${baseUrl}/documents/${brochureInfo.filename}`
    console.log(`📥 [BROCHURE] Servizio: ${servizio} → Dispositivo: ${brochureInfo.nomeDispositivo}`)
    console.log(`📥 [BROCHURE] Caricamento da: ${pdfUrl}`)

    let response = await fetch(pdfUrl)
    
    if (!response.ok) {
      console.error(`❌ Errore HTTP ${response.status} per ${pdfUrl}`)
      return null
    }

    let arrayBuffer = await response.arrayBuffer()
    const sizeBytes = arrayBuffer.byteLength
    const sizeKB = (sizeBytes / 1024).toFixed(2)
    
    console.log(`✅ [BROCHURE] ${brochureInfo.nomeDispositivo}: ${brochureInfo.filename} (${sizeKB} KB)`)

    // 🛡️ SAFETY CHECK: Se il PDF è < 10 KB, è ROTTO o COMPRESSO
    const MIN_VALID_SIZE = 10 * 1024 // 10 KB
    const MIN_EXPECTED_SIZE = 1024 * 1024 // 1 MB
    
    if (sizeBytes < MIN_VALID_SIZE) {
      console.error(`🔴 [BROCHURE] ERRORE CRITICO: PDF troppo piccolo (${sizeKB} KB < 10 KB)`)
      console.error(`🔴 [BROCHURE] File probabilmente ROTTO o COMPRESSO`)
      
      // 🔄 TENTATIVO 2: Prova path alternativo /brochures/
      const fallbackUrl = `${baseUrl}/brochures/${brochureInfo.filename}`
      console.log(`🔄 [BROCHURE] Tentativo fallback: ${fallbackUrl}`)
      
      const fallbackResponse = await fetch(fallbackUrl)
      if (fallbackResponse.ok) {
        const fallbackBuffer = await fallbackResponse.arrayBuffer()
        const fallbackSizeKB = (fallbackBuffer.byteLength / 1024).toFixed(2)
        
        if (fallbackBuffer.byteLength >= MIN_EXPECTED_SIZE) {
          console.log(`✅ [BROCHURE] Fallback OK: ${fallbackSizeKB} KB da ${fallbackUrl}`)
          arrayBuffer = fallbackBuffer
        } else {
          console.error(`🔴 [BROCHURE] Anche fallback ROTTO: ${fallbackSizeKB} KB`)
          return null
        }
      } else {
        console.error(`🔴 [BROCHURE] Fallback non disponibile (HTTP ${fallbackResponse.status})`)
        return null
      }
    } else if (sizeBytes < MIN_EXPECTED_SIZE) {
      console.warn(`⚠️ [BROCHURE] PDF valido ma sospetto: ${sizeKB} KB (atteso > 1 MB)`)
    }

    // Conversione ArrayBuffer → Base64 (chunked per evitare stack overflow)
    const uint8Array = new Uint8Array(arrayBuffer)
    const chunkSize = 32768 // 32KB chunks
    let binary = ''
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize)
      binary += String.fromCharCode.apply(null, Array.from(chunk))
    }

    const base64 = btoa(binary)
    
    return {
      filename: brochureInfo.filename,
      content: base64,
      size: arrayBuffer.byteLength
    }
  } catch (error) {
    console.error(`❌ Errore caricamento brochure per servizio "${servizio}":`, error)
    return null
  }
}

/**
 * Ottiene tutti i servizi disponibili
 */
export function getAvailableServices(): string[] {
  return Object.keys(BROCHURE_MAP)
}

/**
 * Verifica se un servizio è valido
 */
export function isValidService(servizio: string): boolean {
  return servizio.toUpperCase() in BROCHURE_MAP
}
