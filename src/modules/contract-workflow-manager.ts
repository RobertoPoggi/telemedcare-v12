/**
 * eCura V12.0 - Contract Workflow Manager
 * Gestisce il workflow completo di generazione e invio contratto
 * 
 * WORKFLOW:
 * 1. Lead richiede contratto → genera contratto PDF
 * 2. Carica brochure specifica in base al servizio
 * 3. Invia email con contratto + brochure
 * 4. Aggiorna status lead e contratto
 */

import { D1Database } from '@cloudflare/workers-types'
import ContractGenerator, { ContractData, ContractGenerated } from './contract-generator'
import { loadBrochurePDF, getBrochureForService } from './brochure-manager'
import { LeadData, WorkflowEmailResult, inviaEmailContratto } from './workflow-email-manager'
import EmailService from './email-service'
import { loadEmailTemplate, renderTemplate } from './template-loader-clean'
import { getPricing, formatServiceName, getDispositivoForService } from './ecura-pricing'

/**
 * Genera contratto e invia email con brochure specifica
 */
export async function generateAndSendContract(
  leadData: LeadData,
  env: any,
  db: D1Database
): Promise<WorkflowEmailResult> {
  
  const result: WorkflowEmailResult = {
    success: false,
    step: 'generate_and_send_contract',
    emailsSent: [],
    errors: [],
    messageIds: []
  }

  try {
    console.log(`📄 [CONTRACT_WORKFLOW] Generazione contratto per lead: ${leadData.id}`)
    console.log(`📄 [CONTRACT_WORKFLOW] Servizio: ${leadData.servizio || 'PRO'}, Piano: ${leadData.pacchetto}`)

    // 1. Ottieni prezzi dalla matrice eCura
    const servizio = (leadData.servizio || 'PRO') as 'FAMILY' | 'PRO' | 'PREMIUM'
    const piano = leadData.pacchetto as 'BASE' | 'AVANZATO'
    const pricing = getPricing(servizio, piano)
    
    if (!pricing) {
      result.errors.push(`Pricing non trovato per ${servizio} ${piano}`)
      console.error(`❌ [CONTRACT_WORKFLOW] Pricing non trovato`)
      return result
    }
    
    console.log(`💰 [CONTRACT_WORKFLOW] Pricing: ${pricing.setupTotale}€ (1° anno), Dispositivo: ${pricing.dispositivo}`)
    
    // 2. Prepara dati contratto con campi anagrafici completi
    const contractData: ContractData = {
      leadId: leadData.id,
      nomeRichiedente: leadData.nomeRichiedente,
      cognomeRichiedente: leadData.cognomeRichiedente,
      email: leadData.email,
      telefono: leadData.telefono || '',
      tipoServizio: piano,
      servizio: servizio, // NUOVO: passa anche il servizio
      nomeAssistito: leadData.nomeAssistito,
      cognomeAssistito: leadData.cognomeAssistito,
      etaAssistito: leadData.etaAssistito,
      
      // Dati anagrafici completi (mapping corretto dai campi DB)
      luogoNascita: (leadData as any).luogoNascitaAssistito || (leadData as any).luogoNascita,
      dataNascita: (leadData as any).dataNascitaAssistito || (leadData as any).dataNascita,
      indirizzoAssistito: (leadData as any).indirizzoAssistito,
      capAssistito: (leadData as any).capAssistito,
      cittaAssistito: (leadData as any).cittaAssistito,
      provinciaAssistito: (leadData as any).provinciaAssistito,
      codiceFiscaleAssistito: (leadData as any).cfAssistito || (leadData as any).codiceFiscaleAssistito,
      
      prezzoMensile: pricing.setupBase / 12,
      durataContratto: 12,
      prezzoTotale: pricing.setupTotale
    }

    // 3. Genera contratto PDF
    console.log(`📄 [CONTRACT_WORKFLOW] Generazione PDF contratto...`)
    const contractResult = await ContractGenerator.generateContract(contractData, db, env.BROWSER)
    
    if (!contractResult.success || !contractResult.contract) {
      result.errors.push(`Errore generazione contratto: ${contractResult.error}`)
      console.error(`❌ [CONTRACT_WORKFLOW] Errore generazione contratto:`, contractResult.error)
      return result
    }

    const contract = contractResult.contract
    console.log(`✅ [CONTRACT_WORKFLOW] Contratto generato: ${contract.codiceContratto}`)

    // 4. Carica brochure specifica in base al servizio
    const baseUrl = env.PUBLIC_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
    const attachments: Array<{ filename: string; content: string; contentType: string }> = []
    
    // Aggiungi contratto PDF (già generato come base64)
    if (contract.pdfBase64) {
      attachments.push({
        filename: `Contratto_TeleMedCare_${contract.codiceContratto}.pdf`,
        content: contract.pdfBase64,
        contentType: 'application/pdf'
      })
      console.log(`✅ [CONTRACT_WORKFLOW] Contratto PDF aggiunto agli allegati`)
    }

    // Aggiungi brochure specifica
    if (leadData.vuoleBrochure) {
      const servizio = leadData.servizio || 'DEFAULT'
      console.log(`📥 [CONTRACT_WORKFLOW] Caricamento brochure per servizio: ${servizio}`)
      
      let brochurePdf = null
      
      if (servizio !== 'DEFAULT' && (servizio === 'FAMILY' || servizio === 'PRO' || servizio === 'PREMIUM')) {
        brochurePdf = await loadBrochurePDF(servizio, baseUrl)
      }
      
      // Fallback su brochure generica se necessario
      if (!brochurePdf) {
        console.log(`📄 [CONTRACT_WORKFLOW] Caricamento brochure generica TeleMedCare`)
        try {
          const brochureUrl = `${baseUrl}/brochures/Brochure_eCura.pdf`
          const response = await fetch(brochureUrl)
          
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)
            let binaryString = ''
            const chunkSize = 8192
            for (let i = 0; i < uint8Array.length; i += chunkSize) {
              const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
              binaryString += String.fromCharCode.apply(null, Array.from(chunk))
            }
            const base64Content = btoa(binaryString)
            
            brochurePdf = {
              filename: 'Brochure_eCura.pdf',
              content: base64Content,
              size: arrayBuffer.byteLength
            }
          }
        } catch (err) {
          console.error(`❌ [CONTRACT_WORKFLOW] Errore caricamento brochure:`, err)
        }
      }
      
      if (brochurePdf) {
        attachments.push({
          filename: brochurePdf.filename,
          content: brochurePdf.content,
          contentType: 'application/pdf'
        })
        console.log(`✅ [CONTRACT_WORKFLOW] Brochure aggiunta: ${brochurePdf.filename}`)
      }
    }

    // 5. Invia email con template
    console.log(`📧 [CONTRACT_WORKFLOW] Invio email contratto a ${leadData.email}`)
    const emailService = new EmailService(env)
    const template = await loadEmailTemplate('email_invio_contratto', db)
    
    const templateData = {
      NOME_CLIENTE: leadData.nomeRichiedente,
      COGNOME_CLIENTE: leadData.cognomeRichiedente,
      PIANO_SERVIZIO: formatServiceName(servizio, piano), // Es: "eCura PRO Avanzato"
      PREZZO_PIANO: `€${pricing.setupTotale.toFixed(2)}`,
      CODICE_CLIENTE: leadData.id,
      CODICE_CONTRATTO: contract.codiceContratto,
      LINK_FIRMA: `${baseUrl}/firma-contratto?contractId=${contract.contractId}`,
      DATA_INVIO: new Date().toLocaleDateString('it-IT'),
      DISPOSITIVO: pricing.dispositivo, // Es: "SiDLY Care PRO"
      SERVIZIO: servizio // FAMILY/PRO/PREMIUM
    }

    const emailHtml = renderTemplate(template, templateData)
    
    console.log(`📧 [CONTRACT_WORKFLOW] Allegati preparati: ${attachments.length}`)
    for (const att of attachments) {
      console.log(`  📎 ${att.filename} (${(att.content.length * 0.75 / 1024).toFixed(2)} KB)`)
    }

    const sendResult = await emailService.sendEmail({
      to: leadData.email,
      from: 'info@telemedcare.it',
      subject: `📄 eCura - Il Tuo Contratto ${formatServiceName(servizio, piano)}`,
      html: emailHtml,
      attachments: attachments
    })

    if (sendResult.success) {
      result.success = true
      result.emailsSent.push(`email_invio_contratto -> ${leadData.email}`)
      result.messageIds = [sendResult.messageId]
      
      // Aggiorna status lead
      await db.prepare(`
        UPDATE leads 
        SET status = 'CONTRACT_SENT', updated_at = datetime('now')
        WHERE id = ?
      `).bind(leadData.id).run()
      
      // Aggiorna status contratto
      await db.prepare(`
        UPDATE contracts 
        SET status = 'SENT', data_invio = datetime('now'), updated_at = datetime('now')
        WHERE id = ?
      `).bind(contract.contractId).run()
      
      console.log(`✅ [CONTRACT_WORKFLOW] Email contratto inviata con successo: ${sendResult.messageId}`)
    } else {
      result.errors.push(`Errore invio email: ${sendResult.error}`)
      console.error(`❌ [CONTRACT_WORKFLOW] Errore invio email:`, sendResult.error)
    }

  } catch (error) {
    result.errors.push(`Eccezione workflow contratto: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    console.error(`❌ [CONTRACT_WORKFLOW] Eccezione:`, error)
  }

  return result
}
