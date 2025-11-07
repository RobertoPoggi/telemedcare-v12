/**
 * FILE LOADER per Cloudflare Workers
 * 
 * Cloudflare Workers non ha accesso al filesystem (no fs.readFile).
 * Dobbiamo usare fetch per caricare file statici.
 */

/**
 * Carica un file PDF come base64 da un path
 * In Cloudflare Workers, i file devono essere in public/ e accessibili via HTTP
 */
export async function loadPDFAsBase64(filePath: string): Promise<string | null> {
  try {
    // Se il path inizia con /, lo consideriamo relativo al public/
    // In produzione, i file in public/ sono serviti come asset statici
    
    // Per ora, in locale, proviamo a fare fetch al server stesso
    const url = filePath.startsWith('http') 
      ? filePath 
      : `http://localhost:8787${filePath}`
    
    console.log(`📄 [FILE-LOADER] Caricamento file: ${url}`)
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`❌ [FILE-LOADER] File non trovato: ${url} (${response.status})`)
      return null
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)
    
    // Converti in base64
    const base64 = btoa(
      uint8Array.reduce((data, byte) => data + String.fromCharCode(byte), '')
    )
    
    console.log(`✅ [FILE-LOADER] File caricato: ${(arrayBuffer.byteLength / 1024).toFixed(2)} KB`)
    
    return base64
    
  } catch (error) {
    console.error(`❌ [FILE-LOADER] Errore caricamento file ${filePath}:`, error)
    return null
  }
}

/**
 * Prepara allegati per email convertendo path in content base64
 */
export async function prepareAttachments(
  attachments: Array<{ filename: string; path?: string; content?: string; contentType?: string }>
): Promise<Array<{ filename: string; content: string; contentType: string }>> {
  
  const prepared = []
  
  for (const att of attachments) {
    // Se ha già content, usa quello
    if (att.content) {
      prepared.push({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType || 'application/pdf'
      })
      continue
    }
    
    // Altrimenti carica dal path
    if (att.path) {
      const content = await loadPDFAsBase64(att.path)
      if (content) {
        prepared.push({
          filename: att.filename,
          content: content,
          contentType: att.contentType || 'application/pdf'
        })
      } else {
        console.warn(`⚠️ [FILE-LOADER] Allegato saltato (non caricato): ${att.filename}`)
      }
    }
  }
  
  console.log(`📎 [FILE-LOADER] Allegati preparati: ${prepared.length}/${attachments.length}`)
  
  return prepared
}
