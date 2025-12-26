/**
 * PDF Generator Module - TeleMedCare V12.0
 * Converte HTML in PDF usando Cloudflare Browser Rendering
 */

import puppeteer from '@cloudflare/puppeteer'

export interface PDFGenerationOptions {
  printBackground?: boolean
  format?: 'A4' | 'Letter'
  margin?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
}

/**
 * Genera PDF da HTML usando Cloudflare Browser Rendering
 */
export async function generatePDFFromHTML(
  htmlContent: string,
  browser: any, // Browser binding from env.BROWSER
  options: PDFGenerationOptions = {}
): Promise<Uint8Array> {
  console.log('🎨 [PDF_GENERATOR] Inizio generazione PDF da HTML...')
  
  try {
    // Launch browser
    const browserInstance = await puppeteer.launch(browser)
    const page = await browserInstance.newPage()
    
    console.log('📄 [PDF_GENERATOR] Caricamento HTML nel browser...')
    
    // Set HTML content
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    })
    
    console.log('🖨️ [PDF_GENERATOR] Generazione PDF...')
    
    // Generate PDF with options
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      printBackground: options.printBackground !== false, // default true
      margin: options.margin || {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    })
    
    // Close browser
    await browserInstance.close()
    
    console.log('✅ [PDF_GENERATOR] PDF generato con successo!')
    
    return pdfBuffer
  } catch (error) {
    console.error('❌ [PDF_GENERATOR] Errore generazione PDF:', error)
    throw new Error(`Errore generazione PDF: ${error.message}`)
  }
}

/**
 * Fallback: genera PDF semplice se Browser Rendering non è disponibile
 */
export function generateSimplePDFContent(data: {
  title: string
  content: string[]
}): string {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
/F2 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length ${data.content.join('\n').length}
>>
stream
BT
/F2 16 Tf
50 750 Td
(${data.title}) Tj
0 -30 Td
/F1 11 Tf
${data.content.map(line => `(${line}) Tj\n0 -18 Td`).join('\n')}
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000320 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
${420 + data.content.join('\n').length}
%%EOF`
  
  return pdfContent
}
