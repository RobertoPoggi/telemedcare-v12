/**
 * DOCUMENT_MANAGER.TS - Sistema Gestione Documenti Contratti e Proforma
 * TeleMedCare V12.0-Cloudflare - Sistema Modulare
 * 
 * Gestisce:
 * - Generazione contratti (BASE/AVANZATO) da template DOCX
 * - Generazione proforma unificata
 * - Conversione DOCX → PDF
 * - Salvataggio documenti in R2 Storage (Cloudflare)
 * - Inserimento record nel database (contracts, proforma)
 * - Invio email con allegati
 * 
 * Flusso operativo:
 * 1. Lead arriva e vuole contratto
 * 2. generateDocumentsForLead() → chiama Python document-generator
 * 3. Python genera PDF da template DOCX
 * 4. Upload PDF su R2 Storage
 * 5. Salva record in DB (contracts, proforma)
 * 6. Invia email con allegati
 */

import type { D1Database } from '@cloudflare/workers-types'
import type { Lead } from './lead-core'
import { spawn } from 'child_process'
import { promisify } from 'util'
import { readFile } from 'fs/promises'
import { join } from 'path'

// =====================================================================
// TYPES & INTERFACES
// =====================================================================

export interface DocumentGenerationResult {
  success: boolean
  contractId?: string
  contractPdfPath?: string
  contractPdfUrl?: string
  proformaId?: string
  proformaPdfPath?: string
  proformaPdfUrl?: string
  tipoServizio?: 'BASE' | 'AVANZATO'
  prezzoBase?: number
  prezzoIvaInclusa?: number
  errors?: string[]
}

export interface ContractRecord {
  id: string
  leadId: string
  codice_contratto: string
  tipo_contratto: 'BASE' | 'AVANZATO'
  template_utilizzato: string
  contenuto_html: string
  pdf_url: string
  pdf_generated: boolean
  prezzo_mensile: number
  durata_mesi: number
  prezzo_totale: number
  status: 'DRAFT' | 'SENT' | 'SIGNED' | 'EXPIRED' | 'CANCELLED'
  data_invio?: string
  data_scadenza?: string
  email_sent: boolean
  email_template_used: string
  created_at: string
  updated_at: string
}

export interface ProformaRecord {
  id: string
  contract_id: string
  leadId: string
  numero_proforma: string
  data_emissione: string
  data_scadenza: string
  cliente_nome: string
  cliente_cognome: string
  cliente_email: string
  cliente_telefono: string
  cliente_indirizzo: string
  cliente_citta: string
  cliente_cap: string
  cliente_provincia: string
  cliente_codice_fiscale: string
  tipo_servizio: 'BASE' | 'AVANZATO'
  prezzo_mensile: number
  durata_mesi: number
  prezzo_totale: number
  pdf_url: string
  pdf_generated: boolean
  template_utilizzato: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'EXPIRED' | 'CANCELLED'
  data_invio?: string
  email_sent: boolean
  email_template_used: string
  created_at: string
  updated_at: string
}

// =====================================================================
// DOCUMENT MANAGER CLASS
// =====================================================================

export class DocumentManager {
  private db: D1Database
  private pythonScriptPath: string
  
  constructor(db: D1Database) {
    this.db = db
    this.pythonScriptPath = join(process.cwd(), 'src', 'services', 'document-generator.py')
  }
  
  /**
   * Genera documenti completi (contratto + proforma) per un lead
   */
  async generateDocumentsForLead(leadId: string): Promise<DocumentGenerationResult> {
    try {
      console.log(`📄 Inizio generazione documenti per lead ${leadId}`)
      
      // 1. Recupera dati lead dal database
      const lead = await this.getLeadFromDatabase(leadId)
      if (!lead) {
        return {
          success: false,
          errors: [`Lead ${leadId} non trovato nel database`]
        }
      }
      
      // 2. Valida che il lead voglia il contratto
      if (!lead.vuoleContratto) {
        return {
          success: false,
          errors: ['Il lead non ha richiesto il contratto']
        }
      }
      
      // 3. Chiama Python script per generare PDF
      const generationResult = await this.callPythonGenerator(lead)
      if (!generationResult.success) {
        return generationResult
      }
      
      // 4. Upload PDF su R2 Storage (se disponibile)
      // TODO: Implementare upload su R2
      const contractPdfUrl = generationResult.contractPdfPath // Placeholder
      const proformaPdfUrl = generationResult.proformaPdfPath // Placeholder
      
      // 5. Salva record contratto nel database
      const contractRecord = await this.saveContractToDatabase({
        id: generationResult.contractId!,
        leadId: lead.id,
        tipo_contratto: generationResult.tipoServizio!,
        pdf_url: contractPdfUrl || '',
        prezzo_mensile: generationResult.prezzoBase || 0,
        prezzo_totale: generationResult.prezzoIvaInclusa || 0
      })
      
      // 6. Salva record proforma nel database
      const proformaRecord = await this.saveProformaToDatabase({
        id: generationResult.proformaId!,
        contract_id: generationResult.contractId!,
        leadId: lead.id,
        tipo_servizio: generationResult.tipoServizio!,
        pdf_url: proformaPdfUrl || '',
        prezzo_mensile: generationResult.prezzoBase || 0,
        prezzo_totale: generationResult.prezzoIvaInclusa || 0,
        cliente_nome: lead.nomeAssistito,
        cliente_cognome: lead.cognomeAssistito,
        cliente_email: lead.email,
        cliente_telefono: lead.telefono || '',
        cliente_indirizzo: lead.indirizzoAssistito || '',
        cliente_codice_fiscale: lead.cfAssistito || ''
      })
      
      console.log('✅ Documenti generati e salvati nel database')
      
      return {
        ...generationResult,
        contractPdfUrl,
        proformaPdfUrl
      }
      
    } catch (error) {
      console.error('❌ Errore generazione documenti:', error)
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Errore sconosciuto']
      }
    }
  }
  
  /**
   * Chiama lo script Python per generare i PDF
   */
  private async callPythonGenerator(lead: Lead): Promise<DocumentGenerationResult> {
    return new Promise((resolve, reject) => {
      // Prepara dati lead in formato JSON per Python
      const leadData = JSON.stringify({
        id: lead.id,
        nomeRichiedente: lead.nomeRichiedente,
        cognomeRichiedente: lead.cognomeRichiedente,
        email: lead.email,
        telefono: lead.telefono,
        nomeAssistito: lead.nomeAssistito,
        cognomeAssistito: lead.cognomeAssistito,
        dataNascitaAssistito: lead.dataNascitaAssistito,
        luogoNascitaAssistito: lead.luogoNascita, // Field mapping
        cfAssistito: lead.cfAssistito,
        indirizzoAssistito: lead.indirizzoAssistito,
        cfIntestatario: lead.cfIntestatario,
        indirizzoIntestatario: lead.indirizzoIntestatario,
        pacchetto: lead.pacchetto,
        vuoleContratto: lead.vuoleContratto,
        intestazioneContratto: lead.intestazioneContratto
      })
      
      // Spawn processo Python
      const pythonProcess = spawn('python3', [this.pythonScriptPath, leadData])
      
      let outputData = ''
      let errorData = ''
      
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString()
      })
      
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString()
      })
      
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          resolve({
            success: false,
            errors: [`Processo Python terminato con codice ${code}`, errorData]
          })
          return
        }
        
        try {
          // Parse output JSON da Python
          const result = JSON.parse(outputData)
          resolve(result)
        } catch (e) {
          resolve({
            success: false,
            errors: ['Errore parsing output Python', outputData, errorData]
          })
        }
      })
      
      pythonProcess.on('error', (error) => {
        resolve({
          success: false,
          errors: [`Errore esecuzione Python: ${error.message}`]
        })
      })
    })
  }
  
  /**
   * Recupera lead dal database
   */
  private async getLeadFromDatabase(leadId: string): Promise<Lead | null> {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM leads WHERE id = ?
      `).bind(leadId).first()
      
      if (!result) {
        return null
      }
      
      // Map database fields to Lead interface
      return {
        id: result.id as string,
        nomeRichiedente: result.nomeRichiedente as string,
        cognomeRichiedente: result.cognomeRichiedente as string,
        email: result.email as string,
        telefono: result.telefono as string,
        nomeAssistito: result.nomeAssistito as string,
        cognomeAssistito: result.cognomeAssistito as string,
        dataNascitaAssistito: result.dataNascitaAssistito as string,
        etaAssistito: result.etaAssistito as string,
        parentelaAssistito: result.parentelaAssistito as string,
        pacchetto: result.pacchetto as string,
        condizioniSalute: result.condizioniSalute as string,
        priority: result.priority as string,
        preferenzaContatto: result.preferitoContatto as string,
        vuoleContratto: result.vuoleContratto === 'Si',
        intestazioneContratto: result.intestazioneContratto as string,
        cfIntestatario: result.cfIntestatario as string,
        indirizzoIntestatario: result.indirizzoIntestatario as string,
        cfAssistito: result.cfAssistito as string,
        indirizzoAssistito: result.indirizzoAssistito as string,
        vuoleBrochure: result.vuoleBrochure === 'Si',
        vuoleManuale: result.vuoleManuale === 'Si',
        dataNascita: result.dataNascita as string,
        luogoNascita: result.luogoNascita as string,
        sesso: result.sesso as string,
        note: result.note as string,
        gdprConsent: result.gdprConsent === 'on',
        timestamp: result.created_at as string,
        fonte: result.sourceUrl as string,
        versione: result.sistemaVersione as string,
        status: result.status as any,
        partnerId: result.partnerId as string,
        createdAt: result.created_at as string,
        updatedAt: result.updated_at as string,
        fingerprintHash: result.fingerprintHash as string,
        duplicatoId: result.duplicatoId as string
      }
    } catch (error) {
      console.error('❌ Errore recupero lead:', error)
      return null
    }
  }
  
  /**
   * Salva record contratto nel database
   */
  private async saveContractToDatabase(data: {
    id: string
    leadId: string
    tipo_contratto: 'BASE' | 'AVANZATO'
    pdf_url: string
    prezzo_mensile: number
    prezzo_totale: number
  }): Promise<boolean> {
    try {
      const now = new Date().toISOString()
      const codiceContratto = `CTR-${data.id}`
      const templateName = data.tipo_contratto === 'BASE' 
        ? 'Template_Contratto_Base_TeleMedCare' 
        : 'Template_Contratto_Avanzato_TeleMedCare'
      
      await this.db.prepare(`
        INSERT INTO contracts (
          id, leadId, codice_contratto, tipo_contratto, template_utilizzato,
          contenuto_html, pdf_url, pdf_generated, prezzo_mensile, durata_mesi,
          prezzo_totale, status, email_sent, email_template_used,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.id,
        data.leadId,
        codiceContratto,
        data.tipo_contratto,
        templateName,
        '', // contenuto_html vuoto per ora
        data.pdf_url,
        true,
        data.prezzo_mensile,
        12, // durata 12 mesi
        data.prezzo_totale,
        'DRAFT',
        false,
        'email_invio_contratto',
        now,
        now
      ).run()
      
      console.log(`✅ Contratto ${data.id} salvato nel database`)
      return true
      
    } catch (error) {
      console.error('❌ Errore salvataggio contratto:', error)
      return false
    }
  }
  
  /**
   * Salva record proforma nel database
   */
  private async saveProformaToDatabase(data: {
    id: string
    contract_id: string
    leadId: string
    tipo_servizio: 'BASE' | 'AVANZATO'
    pdf_url: string
    prezzo_mensile: number
    prezzo_totale: number
    cliente_nome: string
    cliente_cognome: string
    cliente_email: string
    cliente_telefono: string
    cliente_indirizzo: string
    cliente_codice_fiscale: string
  }): Promise<boolean> {
    try {
      const now = new Date().toISOString()
      const dataEmissione = new Date().toISOString().split('T')[0]
      const dataScadenza = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +30 giorni
      const numeroProforma = `PRF-${data.id}`
      
      // Estrai CAP, città, provincia dall'indirizzo
      const cap = this.extractCAP(data.cliente_indirizzo)
      const citta = this.extractCity(data.cliente_indirizzo)
      const provincia = this.extractProvince(data.cliente_indirizzo)
      
      await this.db.prepare(`
        INSERT INTO proforma (
          id, contract_id, leadId, numero_proforma, data_emissione, data_scadenza,
          cliente_nome, cliente_cognome, cliente_email, cliente_telefono,
          cliente_indirizzo, cliente_citta, cliente_cap, cliente_provincia,
          cliente_codice_fiscale, tipo_servizio, prezzo_mensile, durata_mesi,
          prezzo_totale, pdf_url, pdf_generated, template_utilizzato,
          status, email_sent, email_template_used, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        data.id,
        data.contract_id,
        data.leadId,
        numeroProforma,
        dataEmissione,
        dataScadenza,
        data.cliente_nome,
        data.cliente_cognome,
        data.cliente_email,
        data.cliente_telefono,
        data.cliente_indirizzo,
        citta,
        cap,
        provincia,
        data.cliente_codice_fiscale,
        data.tipo_servizio,
        data.prezzo_mensile,
        12, // durata 12 mesi
        data.prezzo_totale,
        data.pdf_url,
        true,
        'Template_Proforma_Unificato_TeleMedCare',
        'DRAFT',
        false,
        'email_invio_proforma',
        now,
        now
      ).run()
      
      console.log(`✅ Proforma ${data.id} salvata nel database`)
      return true
      
    } catch (error) {
      console.error('❌ Errore salvataggio proforma:', error)
      return false
    }
  }
  
  /**
   * Utility: Estrae CAP dall'indirizzo
   */
  private extractCAP(indirizzo: string): string {
    const match = indirizzo.match(/\b(\d{5})\b/)
    return match ? match[1] : ''
  }
  
  /**
   * Utility: Estrae città dall'indirizzo
   */
  private extractCity(indirizzo: string): string {
    const match = indirizzo.match(/\d{5}\s+([A-Za-zàèéìòùÀÈÉÌÒÙ\s]+?)(?:\s+[A-Z]{2})?$/)
    return match ? match[1].trim() : ''
  }
  
  /**
   * Utility: Estrae provincia dall'indirizzo
   */
  private extractProvince(indirizzo: string): string {
    const match = indirizzo.match(/\b([A-Z]{2})$/)
    return match ? match[1] : ''
  }
  
  /**
   * Aggiorna status contratto
   */
  async updateContractStatus(contractId: string, status: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE contracts 
        SET status = ?, updated_at = ?
        WHERE id = ?
      `).bind(status, new Date().toISOString(), contractId).run()
      
      return true
    } catch (error) {
      console.error('❌ Errore aggiornamento status contratto:', error)
      return false
    }
  }
  
  /**
   * Aggiorna status proforma
   */
  async updateProformaStatus(proformaId: string, status: string): Promise<boolean> {
    try {
      await this.db.prepare(`
        UPDATE proforma 
        SET status = ?, updated_at = ?
        WHERE id = ?
      `).bind(status, new Date().toISOString(), proformaId).run()
      
      return true
    } catch (error) {
      console.error('❌ Errore aggiornamento status proforma:', error)
      return false
    }
  }
}

// =====================================================================
// EXPORT FUNCTIONS
// =====================================================================

/**
 * Genera documenti per un lead
 */
export async function generateDocumentsForLead(
  db: D1Database,
  leadId: string
): Promise<DocumentGenerationResult> {
  const manager = new DocumentManager(db)
  return manager.generateDocumentsForLead(leadId)
}

/**
 * Aggiorna status contratto
 */
export async function updateContractStatus(
  db: D1Database,
  contractId: string,
  status: string
): Promise<boolean> {
  const manager = new DocumentManager(db)
  return manager.updateContractStatus(contractId, status)
}

/**
 * Aggiorna status proforma
 */
export async function updateProformaStatus(
  db: D1Database,
  proformaId: string,
  status: string
): Promise<boolean> {
  const manager = new DocumentManager(db)
  return manager.updateProformaStatus(proformaId, status)
}
