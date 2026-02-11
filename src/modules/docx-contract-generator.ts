/**
 * DOCX Contract Generator - TeleMedCare V12.0
 * Genera contratti PDF partendo dal template DOCX professionale
 * con tutti i placeholder compilati
 */

import { Document, Packer } from 'docx'
import * as fs from 'fs'
import * as path from 'path'
import { getServizioConfig, getPianoConfig, type ServizioeCura, type PianoeCura } from './ecura-services'
import { getPricing } from './ecura-pricing'

/**
 * Dati completi per generazione contratto DOCX
 */
export interface DocxContractData {
  // Dati assistito (obbligatori per template DOCX)
  nomeAssistito: string
  cognomeAssistito: string
  luogoNascita: string
  dataNascita: string  // formato: DD/MM/YYYY
  indirizzoAssistito: string
  capAssistito: string
  cittaAssistito: string
  provinciaAssistito: string
  codiceFiscaleAssistito: string
  telefonoAssistito: string
  emailAssistito: string
  
  // Servizio e Piano
  servizio: ServizioeCura  // FAMILY, PRO, PREMIUM
  piano: PianoeCura  // BASE, AVANZATO
  
  // Date servizio
  dataInizioServizio: string  // formato: DD/MM/YYYY
  dataScadenza: string  // formato: DD/MM/YYYY
  dataContratto: string  // formato: DD/MM/YYYY
  
  // Prezzi
  importoPrimoAnno: number
  importoAnniSuccessivi: number
  
  // Codice contratto
  codiceContratto: string
}

/**
 * Sostituisce i placeholder nel template DOCX
 */
export async function generateContractFromDocx(
  data: DocxContractData,
  templatePath: string = '/home/user/webapp/templates/contracts/Template_Contratto_eCura.docx'
): Promise<Buffer> {
  
  console.log('📄 [DOCX_CONTRACT] Caricamento template:', templatePath)
  
  // Leggi il template DOCX come buffer
  const templateBuffer = fs.readFileSync(templatePath)
  
  // Ottieni configurazioni servizio e piano
  const servizioConfig = getServizioConfig(data.servizio)
  const pianoConfig = getPianoConfig(data.piano)
  
  // Mappa placeholder → valori
  const placeholders: Record<string, string> = {
    // Dati assistito
    NOME_ASSISTITO: data.nomeAssistito,
    COGNOME_ASSISTITO: data.cognomeAssistito,
    LUOGO_NASCITA: data.luogoNascita,
    DATA_NASCITA: data.dataNascita,
    INDIRIZZO_ASSISTITO: data.indirizzoAssistito,
    CAP_ASSISTITO: data.capAssistito,
    CITTA_ASSISTITO: data.cittaAssistito,
    PROVINCIA_ASSISTITO: data.provinciaAssistito,
    CODICE_FISCALE_ASSISTITO: data.codiceFiscaleAssistito,
    TELEFONO_ASSISTITO: data.telefonoAssistito,
    EMAIL_ASSISTITO: data.emailAssistito,
    
    // Servizio, Dispositivo, Piano (con case corretto per template)
    Servizio: servizioConfig.nomeCompleto,  // es: "eCura PRO"
    Dispositivo: servizioConfig.dispositivo,  // es: "SiDLY CARE PRO"
    Piano: pianoConfig.nomeCompleto,  // es: "Avanzato con Servizi di Centrale Operativa h24..."
    
    // Date
    DATA_INIZIO_SERVIZIO: data.dataInizioServizio,
    DATA_SCADENZA: data.dataScadenza,
    DATA_CONTRATTO: data.dataContratto,
    
    // Prezzi
    IMPORTO_PRIMO_ANNO: data.importoPrimoAnno.toFixed(2),
    IMPORTO_ANNI_SUCCESSIVI: data.importoAnniSuccessivi.toFixed(2)
  }
  
  console.log('🔄 [DOCX_CONTRACT] Sostituzione placeholder...')
  
  // Converti template buffer in string (per semplice sostituzione)
  // Nota: questo è un approccio semplificato. Per DOCX complessi serve docx library
  let docxContent = templateBuffer.toString('binary')
  
  // Sostituisci ogni placeholder
  Object.entries(placeholders).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    // Sostituisci tutte le occorrenze
    docxContent = docxContent.split(placeholder).join(value)
  })
  
  console.log('✅ [DOCX_CONTRACT] Placeholder sostituiti')
  
  // Converti back to buffer
  const outputBuffer = Buffer.from(docxContent, 'binary')
  
  return outputBuffer
}

/**
 * Genera contratto PDF da template DOCX
 * Usa LibreOffice per conversione DOCX → PDF
 */
export async function generatePDFFromDocx(
  docxBuffer: Buffer,
  outputPath: string = '/tmp'
): Promise<Buffer> {
  
  console.log('📄 [DOCX_TO_PDF] Conversione DOCX → PDF...')
  
  // Salva temporaneamente il DOCX
  const tempDocxPath = path.join(outputPath, `contract_${Date.now()}.docx`)
  fs.writeFileSync(tempDocxPath, docxBuffer)
  
  // Converti DOCX → PDF usando LibreOffice
  const { exec } = require('child_process')
  const { promisify } = require('util')
  const execAsync = promisify(exec)
  
  try {
    // Comando LibreOffice per conversione headless
    const command = `libreoffice --headless --convert-to pdf --outdir ${outputPath} ${tempDocxPath}`
    
    console.log('🔄 [DOCX_TO_PDF] Esecuzione:', command)
    
    await execAsync(command, { timeout: 30000 })
    
    // Percorso del PDF generato
    const pdfPath = tempDocxPath.replace('.docx', '.pdf')
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error('PDF non generato da LibreOffice')
    }
    
    // Leggi il PDF generato
    const pdfBuffer = fs.readFileSync(pdfPath)
    
    // Cleanup file temporanei
    fs.unlinkSync(tempDocxPath)
    fs.unlinkSync(pdfPath)
    
    console.log('✅ [DOCX_TO_PDF] PDF generato con successo')
    
    return pdfBuffer
    
  } catch (error) {
    console.error('❌ [DOCX_TO_PDF] Errore conversione:', error)
    
    // Cleanup in caso di errore
    if (fs.existsSync(tempDocxPath)) {
      fs.unlinkSync(tempDocxPath)
    }
    
    throw error
  }
}

/**
 * Prepara dati contratto da LeadData per template DOCX
 */
export function prepareDocxContractData(
  leadData: any,
  codiceContratto: string
): DocxContractData {
  
  const servizio = (leadData.servizio || 'PRO') as ServizioeCura
  const piano = leadData.pacchetto as PianoeCura
  
  // Calcola prezzi usando il modulo pricing
  const pricing = getPricing(servizio, piano)
  
  // Calcola date (oggi + 12 mesi)
  const oggi = new Date()
  const dataInizio = new Date(oggi)
  const dataScadenza = new Date(oggi)
  dataScadenza.setMonth(dataScadenza.getMonth() + 12)
  
  // Formato date italiane
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  
  return {
    // Dati assistito (usa richiedente se assistito non specificato)
    nomeAssistito: leadData.nomeAssistito || leadData.nomeRichiedente,
    cognomeAssistito: leadData.cognomeAssistito || leadData.cognomeRichiedente,
    luogoNascita: leadData.luogoNascitaAssistito || 'DA COMPLETARE',
    dataNascita: leadData.dataNascitaAssistito || 'DA COMPLETARE',
    indirizzoAssistito: leadData.indirizzoAssistito || 'DA COMPLETARE',
    capAssistito: leadData.capAssistito || 'DA COMPLETARE',
    cittaAssistito: leadData.cittaAssistito || 'DA COMPLETARE',
    provinciaAssistito: leadData.provinciaAssistito || 'DA COMPLETARE',
    codiceFiscaleAssistito: leadData.cfAssistito || 'DA COMPLETARE',
    telefonoAssistito: leadData.telefono || leadData.telefono || 'DA COMPLETARE',
    emailAssistito: leadData.email || leadData.email,
    
    // Servizio e Piano
    servizio,
    piano,
    
    // Date
    dataInizioServizio: formatDate(dataInizio),
    dataScadenza: formatDate(dataScadenza),
    dataContratto: formatDate(oggi),
    
    // Prezzi
    importoPrimoAnno: pricing.setupTotale,
    importoAnniSuccessivi: pricing.rinnovo,
    
    // Codice contratto
    codiceContratto
  }
}

export default {
  generateContractFromDocx,
  generatePDFFromDocx,
  prepareDocxContractData
}
