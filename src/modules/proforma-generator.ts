/**
 * PROFORMA GENERATOR per TeleMedCare V11.0
 * Genera pro forma PDF usando jsPDF (compatibile con Cloudflare Workers)
 * 
 * IMPORTANTE: Questo generatore replica ESATTAMENTE il contenuto del template DOCX:
 * - Template_Proforma_Unificato_TeleMedCare.docx
 * 
 * Tutti i testi e struttura provengono dal documento originale di Roberto.
 */

import { jsPDF } from 'jspdf'
import { SERVICE_PRICES, IVA_RATES } from '../config/pricing-config'

export interface ProformaData {
  numeroProforma: string
  dataRichiesta: string
  nomeAssistito: string
  cognomeAssistito: string
  codiceFiscale: string
  indirizzoCompleto: string
  citta: string
  cap?: string
  provincia?: string
  emailRichiedente: string
  telefonoRichiedente?: string
  dataAttivazione: string
  tipoPrestazione: 'BASE' | 'ADVANCED'
  serialNumber: string
  telefonoSidly?: string
  prezzoPacchetto: number
  comunicazioneTipo?: string // 'familiari' per BASE, 'familiari/Centrale Operativa' per ADVANCED
}

// NEW: Interface for database format (snake_case)
export interface ProformaDataDB {
  numero_proforma: string
  data_emissione: string
  data_scadenza: string
  nomeRichiedente: string
  cognomeRichiedente: string
  emailRichiedente: string
  telefonoRichiedente?: string
  indirizzoRichiedente?: string
  nomeAssistito?: string
  cognomeAssistito?: string
  pacchetto: string
  prezzo_mensile: number
  durata_mesi: number
  prezzo_totale: number
}

/**
 * Helper per aggiungere testo con auto-wrapping
 */
function addTextWithWrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number {
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(text, maxWidth)
  doc.text(lines, x, y)
  return y + (lines.length * (fontSize * 0.4))
}

/**
 * Genera PDF Pro Forma ESATTAMENTE come template DOCX
 * Accepts both old ProformaData format and new DB format
 */
export async function generateProformaPDF(input: ProformaData | ProformaDataDB): Promise<Buffer> {
  // Convert DB format to ProformaData format if needed
  let proformaData: ProformaData;
  
  if ('numero_proforma' in input) {
    // DB format - convert to ProformaData format
    const dbData = input as ProformaDataDB;
    const prezzoBase = dbData.prezzo_totale / 1.22; // Remove IVA to get base price
    
    // IMPORTANT: Proforma MUST be intestata al RICHIEDENTE (not assistito)
    proformaData = {
      numeroProforma: dbData.numero_proforma || 'N/A',
      dataRichiesta: dbData.data_emissione || new Date().toISOString().split('T')[0],
      // USE RICHIEDENTE DATA - the person paying/contracting
      nomeAssistito: dbData.nomeRichiedente || '',
      cognomeAssistito: dbData.cognomeRichiedente || '',
      codiceFiscale: 'N/A',
      indirizzoCompleto: dbData.indirizzoRichiedente || 'N/A',
      citta: 'N/A',
      cap: undefined,
      provincia: undefined,
      emailRichiedente: dbData.emailRichiedente || '',
      telefonoRichiedente: dbData.telefonoRichiedente,
      dataAttivazione: dbData.data_emissione || new Date().toISOString().split('T')[0],
      tipoPrestazione: (dbData.pacchetto === 'AVANZATO' ? 'ADVANCED' : 'BASE') as 'BASE' | 'ADVANCED',
      serialNumber: 'N/A',
      telefonoSidly: 'N/A',
      prezzoPacchetto: prezzoBase,
      comunicazioneTipo: dbData.pacchetto === 'AVANZATO' ? 'familiari/Centrale Operativa' : 'familiari'
    };
  } else {
    // Already in ProformaData format
    proformaData = input as ProformaData;
  }
  try {
    // 📄 Crea documento PDF A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPos = margin

    const colorBlack = '#000000'
    doc.setTextColor(colorBlack)

    // ======================
    // TITOLO
    // ======================
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('PRO FORMA MEDICA GB SRL', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    // ======================
    // DATA
    // ======================
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    yPos = addTextWithWrap(doc, `Milano, ${proformaData.dataRichiesta}`, margin, yPos, contentWidth, 10)
    yPos += 5

    // ======================
    // ANAGRAFICA PAZIENTE
    // ======================
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'ANAGRAFICA PAZIENTE', margin, yPos, contentWidth, 11)
    yPos += 4

    doc.setFont('helvetica', 'normal')
    yPos = addTextWithWrap(doc, `NOME: ${proformaData.nomeAssistito}`, margin, yPos, contentWidth, 10)
    yPos += 3
    yPos = addTextWithWrap(doc, `COGNOME: ${proformaData.cognomeAssistito}`, margin, yPos, contentWidth, 10)
    yPos += 3
    yPos = addTextWithWrap(doc, `C.F.: ${proformaData.codiceFiscale}`, margin, yPos, contentWidth, 10)
    yPos += 3
    yPos = addTextWithWrap(doc, `RESIDENTE IN: ${proformaData.indirizzoCompleto}`, margin, yPos, contentWidth, 10)
    yPos += 3
    
    const cittaCompleta = [
      proformaData.cap,
      proformaData.citta,
      proformaData.provincia ? `(${proformaData.provincia})` : ''
    ].filter(Boolean).join(' ')
    yPos = addTextWithWrap(doc, `CITTA': ${cittaCompleta}`, margin, yPos, contentWidth, 10)
    yPos += 5

    // ======================
    // NOTE
    // ======================
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'NOTE', margin, yPos, contentWidth, 11)
    doc.setFont('helvetica', 'normal')
    yPos += 3
    yPos = addTextWithWrap(doc, `E.MAIL X INVIO FATTURAZIONE: ${proformaData.emailRichiedente}`, margin, yPos, contentWidth, 10)
    yPos += 5

    // ======================
    // TIPOLOGIA PRESTAZIONE EROGATA
    // ======================
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'TIPOLOGIA PRESTAZIONE EROGATA', margin, yPos, contentWidth, 11)
    yPos += 4

    doc.setFont('helvetica', 'normal')
    yPos = addTextWithWrap(doc, `DATA ATTIVAZIONE: ${proformaData.dataAttivazione}`, margin, yPos, contentWidth, 10)
    yPos += 3
    
    const tipoPrestazioneText = proformaData.tipoPrestazione === 'BASE' 
      ? 'Servizio di TeleAssistenza base'
      : 'Servizio di TeleAssistenza Avanzata'
    yPos = addTextWithWrap(doc, `TIPO DI PRESTAZIONE: ${tipoPrestazioneText}`, margin, yPos, contentWidth, 10)
    yPos += 5

    // ======================
    // DESCRIZIONE DISPOSITIVO (testo completo da DOCX)
    // ======================
    const comunicazioneTipo = proformaData.comunicazioneTipo || 
      (proformaData.tipoPrestazione === 'ADVANCED' ? 'familiari/Centrale Operativa' : 'familiari')

    const descrizioneDispositivo = `SiDLY Care PRO numero seriale: ${proformaData.serialNumber} Sistema di allarme mobile di piccole dimensioni ed indossabile. È progettato per monitorare e proteggere le persone. In caso di emergenza, la persona può attivarlo premendo un pulsante SOS sull'unità e la funzione di comunicazione vocale bidirezionale consente di parlare con ${comunicazioneTipo} le persone individuate come care givers. È integrato con sensori che consentono la geolocalizzazione, il geo-fencing, il rilevamento cadute, il reminder dei farmaci e la gestione dell'alimentazione. È un Dispositivo Medico certificato in classe IIA (codice CDN Z12040199) e, come tale, consente la rilevazione della Frequenza Cardiaca (FC) e della Saturazione (SpO2). È inclusa basetta per la ricarica, alimentatore e cavo. Installazione e collaudo inclusi. SIM SiDLY per SiDLY Care PRO, per comunicazione e trasmissione dati. Tel: ${proformaData.telefonoSidly || 'N/A'} Piattaforma/APP SiDLY per SiDLY Care PRO (Dispositivo medicale in classe I)`

    yPos = addTextWithWrap(doc, descrizioneDispositivo, margin, yPos, contentWidth, 9)
    yPos += 5

    // ======================
    // TOTALE (fix Euro symbol)
    // ======================
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    const iva = Math.round(proformaData.prezzoPacchetto * IVA_RATES.STANDARD * 100) / 100
    const totaleConIva = proformaData.prezzoPacchetto + iva
    // Use 'EUR' instead of '€' to avoid rendering issues
    yPos = addTextWithWrap(doc, `TOTALE DA FATTURARE: EUR ${proformaData.prezzoPacchetto.toFixed(2)} + IVA 22% = EUR ${totaleConIva.toFixed(2)}`, margin, yPos, contentWidth, 11)
    yPos += 6

    // ======================
    // PAGAMENTO CON BONIFICO (compact spacing)
    // ======================
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    yPos = addTextWithWrap(doc, 'PAGAMENTO CON BONIFICO', margin, yPos, contentWidth, 11)
    yPos += 4

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    yPos = addTextWithWrap(doc, 'Medica GB S.r.l.', margin, yPos, contentWidth, 10)
    yPos += 2.5
    yPos = addTextWithWrap(doc, 'Corso Giuseppe Garibaldi, 34', margin, yPos, contentWidth, 10)
    yPos += 2.5
    yPos = addTextWithWrap(doc, '20121 Milano', margin, yPos, contentWidth, 10)
    yPos += 4

    yPos = addTextWithWrap(doc, 'BANCA BPM S.P.A.', margin, yPos, contentWidth, 10)
    yPos += 2.5
    yPos = addTextWithWrap(doc, 'FILIALE MILANO-GARIBALDI', margin, yPos, contentWidth, 10)
    yPos += 2.5
    yPos = addTextWithWrap(doc, 'C/C 03519', margin, yPos, contentWidth, 10)
    yPos += 2.5
    yPos = addTextWithWrap(doc, 'ABI 05034', margin, yPos, contentWidth, 10)
    yPos += 2.5
    yPos = addTextWithWrap(doc, 'CAB 01727', margin, yPos, contentWidth, 10)
    yPos += 2.5
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'IBAN: IT97L0503401727000000003519', margin, yPos, contentWidth, 10)
    yPos += 6

    // ======================
    // NOTA LEGALE (with spacing check)
    // ======================
    const pageHeight = doc.internal.pageSize.getHeight()
    const footerY = pageHeight - 50 // Footer starts here (increased from 30 to 50 for more space)
    
    // Ensure legal text doesn't overlap footer
    if (yPos > footerY - 30) {
      // Add new page if not enough space
      doc.addPage()
      yPos = margin
    }
    
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    yPos = addTextWithWrap(doc, 'Il presente documento non costituisce fattura che verrà emessa all\'atto del pagamento ai sensi dell\'art.6 DPR 26.10.1972 n. 633.', margin, yPos, contentWidth, 9)
    yPos += 10

    // ======================
    // FIRMA MEDICA GB
    // ======================
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    yPos = addTextWithWrap(doc, 'Medica GB S.r.l.', margin, yPos, contentWidth, 10)

    // ======================
    // FOOTER (fixed position at bottom)
    // ======================
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    addTextWithWrap(doc, 'Medica GB S.r.l.', margin, footerY, contentWidth, 8)
    doc.setFont('helvetica', 'normal')
    addTextWithWrap(doc, 'Corso Giuseppe Garibaldi, 34 – 20121 Milano', margin, footerY + 3, contentWidth, 8)
    addTextWithWrap(doc, 'PEC: medicagbsrl@pecimprese.it', margin, footerY + 6, contentWidth, 8)
    addTextWithWrap(doc, 'E.mail: info@medicagb.it', margin, footerY + 9, contentWidth, 8)
    addTextWithWrap(doc, 'Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409', margin, footerY + 12, contentWidth, 8)
    addTextWithWrap(doc, 'www.medicagb.it', margin, footerY + 15, contentWidth, 8)
    addTextWithWrap(doc, 'www.telemedcare.it', margin, footerY + 18, contentWidth, 8)

    // 💾 Converti in Buffer
    const pdfArrayBuffer = doc.output('arraybuffer')
    const pdfBuffer = Buffer.from(pdfArrayBuffer)

    console.log(`✅ [PROFORMA-GEN] PDF generato (da template DOCX): ${pdfBuffer.length} bytes`)
    
    return pdfBuffer

  } catch (error) {
    console.error(`❌ [PROFORMA-GEN] Errore generazione proforma PDF:`, error)
    throw error
  }
}
