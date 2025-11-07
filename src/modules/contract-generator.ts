/**
 * CONTRACT GENERATOR per TeleMedCare V11.0
 * Genera contratti PDF Base e Advanced usando jsPDF (compatibile con Cloudflare Workers)
 * 
 * IMPORTANTE: Questo generatore replica ESATTAMENTE il contenuto dei template DOCX:
 * - Template_Contratto_Base.docx
 * - Template_Contratto_Avanzato.docx
 * 
 * Tutti i testi, clausole e struttura provengono dai documenti originali di Roberto.
 */

import { jsPDF } from 'jspdf'
import { SERVICE_PRICES, IVA_RATES, calculatePriceWithVAT } from '../config/pricing-config'

export interface ContractData {
  codiceContratto: string
  tipoContratto: 'BASE' | 'ADVANCED'
  nomeIntestatario: string
  cognomeIntestatario: string
  cfIntestatario: string
  indirizzoIntestatario: string
  capIntestatario?: string
  cittaIntestatario?: string
  provinciaIntestatario?: string
  telefonoIntestatario?: string
  emailIntestatario?: string
  nomeAssistito?: string
  cognomeAssistito?: string
  luogoNascitaAssistito?: string
  dataNascitaAssistito?: string
  cfAssistito?: string
  indirizzoAssistito?: string
  capAssistito?: string
  cittaAssistito?: string
  provinciaAssistito?: string
  telefonoAssistito?: string
  emailAssistito?: string
  dataContratto: string
  dataInizioServizio?: string
  dataScadenza?: string
  prezzo: number
}

/**
 * Helper per aggiungere testo con auto-wrapping e gestione pagine
 */
function addTextWithWrap(doc: jsPDF, text: string, x: number, y: number, maxWidth: number, fontSize: number = 10): number {
  doc.setFontSize(fontSize)
  const lines = doc.splitTextToSize(text, maxWidth)
  doc.text(lines, x, y)
  return y + (lines.length * (fontSize * 0.4))
}

/**
 * Helper per controllare se serve nuova pagina
 */
function checkPageBreak(doc: jsPDF, currentY: number, requiredSpace: number = 30): number {
  const pageHeight = doc.internal.pageSize.getHeight()
  if (currentY + requiredSpace > pageHeight - 20) {
    doc.addPage()
    return 20 // margin top
  }
  return currentY
}

export async function generateContractPDF(contractData: ContractData): Promise<Buffer> {
  try {
    // 📄 Crea documento PDF A4 (ESATTAMENTE come template DOCX)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    let yPos = margin

    // Colore nero per tutto il documento (come DOCX)
    const colorBlack = '#000000'
    doc.setTextColor(colorBlack)

    // ======================
    // TITOLO: SCRITTURA PRIVATA (centrato, bold)
    // ======================
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('SCRITTURA PRIVATA', pageWidth / 2, yPos, { align: 'center' })
    yPos += 10

    // ======================
    // PARTI CONTRAENTI
    // ======================
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    yPos = addTextWithWrap(doc, 'Con la presente scrittura privata da valere a tutti gli effetti e conseguenze di legge tra:', margin, yPos, contentWidth, 10)
    yPos += 5

    // MEDICA GB
    yPos = addTextWithWrap(doc, 'Medica GB S.r.l., con sede in Corso Giuseppe Garibaldi, 34 – 20121 Milano e con Partita IVA e registro imprese 12435130963, in persona dell\'Amministratore Stefania Rocca', margin, yPos, contentWidth, 10)
    yPos += 5

    doc.setFont('helvetica', 'italic')
    yPos = addTextWithWrap(doc, '(breviter Medica GB)', margin, yPos, contentWidth, 10)
    yPos += 5

    doc.setFont('helvetica', 'normal')
    yPos = addTextWithWrap(doc, 'e', margin, yPos, contentWidth, 10)
    yPos += 5

    // IL CLIENTE (dati assistito)
    const nomeAssistito = contractData.nomeAssistito || contractData.nomeIntestatario
    const cognomeAssistito = contractData.cognomeAssistito || contractData.cognomeIntestatario
    const luogoNascita = contractData.luogoNascitaAssistito || ''
    const dataNascita = contractData.dataNascitaAssistito || ''
    const indirizzoCompleto = [
      contractData.indirizzoAssistito || contractData.indirizzoIntestatario,
      contractData.capAssistito || contractData.capIntestatario,
      contractData.cittaAssistito || contractData.cittaIntestatario,
      contractData.provinciaAssistito ? `(${contractData.provinciaAssistito})` : (contractData.provinciaIntestatario ? `(${contractData.provinciaIntestatario})` : '')
    ].filter(Boolean).join(' ')
    const cfAssistito = contractData.cfAssistito || contractData.cfIntestatario
    const telefonoAssistito = contractData.telefonoAssistito || contractData.telefonoIntestatario || ''
    const emailAssistito = contractData.emailAssistito || contractData.emailIntestatario || ''

    let clienteText = `Sig./Sig.ra ${nomeAssistito} ${cognomeAssistito}`
    if (luogoNascita || dataNascita) {
      clienteText += ` nato/a`
      if (luogoNascita) clienteText += ` a ${luogoNascita}`
      if (dataNascita) clienteText += ` il ${dataNascita}`
      clienteText += ','
    }
    clienteText += ` residente e domiciliato/a in ${indirizzoCompleto} e con codice fiscale ${cfAssistito}.`

    yPos = addTextWithWrap(doc, clienteText, margin, yPos, contentWidth, 10)
    yPos += 5

    // Riferimenti
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'Riferimenti:', margin, yPos, contentWidth, 10)
    doc.setFont('helvetica', 'normal')
    yPos = addTextWithWrap(doc, `telefono ${telefonoAssistito} – e-mail ${emailAssistito}`, margin, yPos, contentWidth, 10)
    yPos += 5

    doc.setFont('helvetica', 'italic')
    yPos = addTextWithWrap(doc, '(breviter Il Cliente)', margin, yPos, contentWidth, 10)
    yPos += 5

    // ======================
    // PREMESSO CHE
    // ======================
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'premesso che', margin, yPos, contentWidth, 10)
    yPos += 3

    doc.setFont('helvetica', 'normal')
    yPos = addTextWithWrap(doc, '• Medica GB eroga servizi di assistenza domiciliare con tecnologie innovative, servizi di diagnostica a domicilio, esami strumentali, telemedicina, teleassistenza, telemonitoraggio e riabilitazione a domicilio.', margin, yPos, contentWidth, 10)
    yPos += 2
    yPos = addTextWithWrap(doc, '• Medica GB si avvale della consulenza di Medici, Terapisti, Infermieri e Operatori Socio Sanitari per erogare i servizi sopra descritti;', margin, yPos, contentWidth, 10)
    yPos += 2
    yPos = addTextWithWrap(doc, '• Tanto premesso,', margin, yPos, contentWidth, 10)
    yPos += 5

    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'si conviene e stabilisce quanto segue', margin, yPos, contentWidth, 10)
    yPos += 7

    // Check page break
    yPos = checkPageBreak(doc, yPos)

    // ======================
    // PREMESSA
    // ======================
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'Premessa', margin, yPos, contentWidth, 10)
    doc.setFont('helvetica', 'normal')
    yPos += 2
    yPos = addTextWithWrap(doc, 'La premessa che precede costituisce parte integrante del presente Contratto.', margin, yPos, contentWidth, 10)
    yPos += 7

    // ======================
    // OGGETTO DEL CONTRATTO
    // ======================
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'Oggetto del Contratto', margin, yPos, contentWidth, 10)
    doc.setFont('helvetica', 'normal')
    yPos += 2

    const tipoServizio = contractData.tipoContratto === 'BASE' ? 'Servizio di TeleAssistenza base' : 'Servizio di TeleAssistenza Avanzata'
    yPos = addTextWithWrap(doc, `L'oggetto del presente Contratto è l'erogazione del "${tipoServizio}" mediante l'utilizzo del Dispositivo SiDLY CARE PRO.`, margin, yPos, contentWidth, 10)
    yPos += 5

    yPos = addTextWithWrap(doc, 'Le funzioni del Dispositivo SiDLY CARE PRO sono le seguenti:', margin, yPos, contentWidth, 10)
    yPos += 5

    // Funzioni del dispositivo (IDENTICHE per BASE e ADVANCED come da DOCX)
    const funzioni = [
      {
        title: 'Comunicazione vocale bidirezionale:',
        text: 'è possibile configurare sulla Piattaforma SiDLY Care i contatti dei familiari; dopo l\'invio dell\'allarme i familiari (configurati in Piattaforma) ricevono una chiamata dal dispositivo e possono parlare con l\'assistito; in qualsiasi momento i familiari possono contattare l\'assistito tramite il dispositivo.'
      },
      {
        title: 'Rilevatore automatico di caduta:',
        text: 'effettua una chiamata vocale di allarme, in caso di caduta, e invia una notifica tramite sms ai familiari. Nell\'sms arriverà sia il link da cliccare per individuare la posizione dell\'assistito (geolocalizzazione) che i valori dei parametri fisiologici che è stato possibile rilevare.'
      },
      {
        title: 'Posizione GPS e GPS-assistito:',
        text: 'consente di localizzare l\'assistito quando viene inviato l\'allarme. È inoltre possibile impostare una cosiddetta area sicura per l\'assistito (geo-fencing).'
      },
      {
        title: 'Misurazioni della frequenza cardiaca e della saturazione di ossigeno:',
        text: contractData.tipoContratto === 'ADVANCED' 
          ? 'è possibile impostare una notifica che arrivi ai familiari/Centrale Operativa tramite APP quando i valori rilevati vanno oltre le soglie programmate (comunicate dal proprio Medico di Base).'
          : 'è possibile impostare una notifica che arrivi ai familiari tramite APP quando i valori rilevati vanno oltre le soglie programmate (comunicate dal proprio Medico di Base).'
      },
      {
        title: 'Pulsante SOS:',
        text: 'premendo il pulsante SOS per circa 3 secondi è possibile effettuare una chiamata vocale e inviare una notifica di emergenza (geolocalizzata) ai familiari.'
      },
      {
        title: 'Assistenza vocale:',
        text: 'informa l\'assistito in relazione ai seguenti eventi: pressione pulsante SOS, attivazione dispositivo, messa in carica del dispositivo, segnalazione di batteria scarica, ecc.'
      },
      {
        title: 'Promemoria per l\'assunzione dei farmaci:',
        text: 'un messaggio ricorda l\'orario in cui assumere i farmaci (aderenza terapeutica).'
      }
    ]

    for (const funzione of funzioni) {
      yPos = checkPageBreak(doc, yPos)
      doc.setFont('helvetica', 'bold')
      yPos = addTextWithWrap(doc, funzione.title, margin, yPos, contentWidth, 10)
      doc.setFont('helvetica', 'normal')
      yPos = addTextWithWrap(doc, funzione.text, margin, yPos, contentWidth, 10)
      yPos += 5
    }

    // ======================
    // DURATA DEL SERVIZIO
    // ======================
    yPos = checkPageBreak(doc, yPos)
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'Durata del Servizio', margin, yPos, contentWidth, 10)
    doc.setFont('helvetica', 'normal')
    yPos += 2

    const dataInizio = contractData.dataInizioServizio || 'data di attivazione'
    const dataScadenza = contractData.dataScadenza || '12 mesi dalla data di attivazione'
    yPos = addTextWithWrap(doc, `Il Servizio di ${tipoServizio} ha una durata di 12 mesi a partire da ${dataInizio} fino al ${dataScadenza}.`, margin, yPos, contentWidth, 10)
    yPos += 3
    yPos = addTextWithWrap(doc, 'Il Contratto sarà prorogabile su richiesta scritta del Cliente e su accettazione di Medica GB.', margin, yPos, contentWidth, 10)
    yPos += 7

    // ======================
    // TARIFFA DEL SERVIZIO
    // ======================
    yPos = checkPageBreak(doc, yPos)
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'Tariffa del Servizio', margin, yPos, contentWidth, 10)
    doc.setFont('helvetica', 'normal')
    yPos += 2

    const prezzoBase = contractData.tipoContratto === 'BASE' 
      ? SERVICE_PRICES.BASE.FIRST_YEAR 
      : SERVICE_PRICES.ADVANCED.FIRST_YEAR
    
    const prezzoRinnovo = contractData.tipoContratto === 'BASE'
      ? SERVICE_PRICES.BASE.RENEWAL
      : SERVICE_PRICES.ADVANCED.RENEWAL

    yPos = addTextWithWrap(doc, `La tariffa annuale per il primo anno di attivazione del "${tipoServizio}" è pari a Euro ${prezzoBase.toFixed(2)} + IVA 22% e include:`, margin, yPos, contentWidth, 10)
    yPos += 3
    yPos = addTextWithWrap(doc, '- Dispositivo SiDLY CARE PRO (hardware)', margin, yPos, contentWidth, 10)
    yPos += 3
    yPos = addTextWithWrap(doc, '- Configurazione del Dispositivo e del Processo di Comunicazione con uno o più familiari e Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi', margin, yPos, contentWidth, 10)
    yPos += 3
    yPos = addTextWithWrap(doc, '- SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi', margin, yPos, contentWidth, 10)
    yPos += 5

    const tipoServizioRinnovo = contractData.tipoContratto === 'BASE' ? 'Servizio di Continuità di TeleAssistenza base' : 'Servizio di Continuità di TeleAssistenza avanzata'
    yPos = addTextWithWrap(doc, `Per i successivi anni (rinnovabili di anno in anno) la tariffa annuale per il "${tipoServizioRinnovo}" sarà pari a Euro ${prezzoRinnovo.toFixed(2)} + IVA 22% con inclusi:`, margin, yPos, contentWidth, 10)
    yPos += 3
    yPos = addTextWithWrap(doc, '- Piattaforma Web e APP di TeleAssistenza per la durata di 12 mesi', margin, yPos, contentWidth, 10)
    yPos += 3
    yPos = addTextWithWrap(doc, '- SIM per trasmissione dati e comunicazione vocale per la durata di 12 mesi', margin, yPos, contentWidth, 10)
    yPos += 7

    // ======================
    // METODO DI PAGAMENTO
    // ======================
    yPos = checkPageBreak(doc, yPos)
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'Metodo di pagamento', margin, yPos, contentWidth, 10)
    doc.setFont('helvetica', 'normal')
    yPos += 2

    yPos = addTextWithWrap(doc, 'Medica GB emetterà fattura anticipata di 12 mesi all\'attivazione del Servizio e il Cliente procederà al pagamento a ricevimento della fattura stessa tramite bonifico bancario', margin, yPos, contentWidth, 10)
    yPos += 5

    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, `Intestato a: Medica GB S.r.l.`, margin, yPos, contentWidth, 10)
    yPos = addTextWithWrap(doc, `Causale: ${tipoServizio} annuo con Dispositivo SiDLY CARE PRO`, margin, yPos, contentWidth, 10)
    yPos = addTextWithWrap(doc, 'Banca Popolare di Milano - Iban: IT97L0503401727000000003519', margin, yPos, contentWidth, 10)
    yPos += 7

    // ======================
    // RISERVATEZZA ED ESCLUSIVA
    // ======================
    yPos = checkPageBreak(doc, yPos)
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'Riservatezza ed esclusiva', margin, yPos, contentWidth, 10)
    doc.setFont('helvetica', 'normal')
    yPos += 2

    yPos = addTextWithWrap(doc, 'Il Cliente e Medica GB si impegnano reciprocamente a non divulgare o, comunque, non utilizzare, se non per motivi attinenti all\'esercizio del presente contratto, tutte le informazioni di cui venissero a conoscenza nello svolgimento del Servizio.', margin, yPos, contentWidth, 10)
    yPos += 5
    yPos = addTextWithWrap(doc, 'Il Cliente si impegna a contattare Medica GB per tutte le modifiche e proroghe del presente contratto.', margin, yPos, contentWidth, 10)
    yPos += 7

    // ======================
    // FORO COMPETENTE
    // ======================
    yPos = checkPageBreak(doc, yPos)
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'Foro competente', margin, yPos, contentWidth, 10)
    doc.setFont('helvetica', 'normal')
    yPos += 2

    yPos = addTextWithWrap(doc, 'Ogni eventuale contestazione o controversia che dovesse insorgere tra le parti in relazione all\'interpretazione, alla validità ed esecuzione del presente contratto, sarà definita alla cognizione esclusiva del Foro di Milano.', margin, yPos, contentWidth, 10)
    yPos += 10

    // ======================
    // FIRMA
    // ======================
    yPos = checkPageBreak(doc, yPos, 40)
    doc.setFont('helvetica', 'normal')
    yPos = addTextWithWrap(doc, `Milano, lì ${contractData.dataContratto}`, margin, yPos, contentWidth, 10)
    yPos += 10

    const leftX = margin
    const rightX = pageWidth - margin - 80

    doc.text('Medica GB S.r.l.', leftX, yPos)
    doc.text('Il Cliente', rightX, yPos)
    yPos += 20

    // ======================
    // FOOTER MEDICA GB (come da DOCX)
    // ======================
    const pageHeight = doc.internal.pageSize.getHeight()
    let footerY = pageHeight - 30

    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    yPos = addTextWithWrap(doc, 'Medica GB S.r.l.', margin, footerY, contentWidth, 8)
    doc.setFont('helvetica', 'normal')
    yPos = addTextWithWrap(doc, 'Corso Giuseppe Garibaldi, 34 – 20121 Milano', margin, footerY + 3, contentWidth, 8)
    yPos = addTextWithWrap(doc, 'PEC: medicagbsrl@pecimprese.it', margin, footerY + 6, contentWidth, 8)
    yPos = addTextWithWrap(doc, 'E.mail: info@medicagb.it', margin, footerY + 9, contentWidth, 8)
    yPos = addTextWithWrap(doc, 'Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409', margin, footerY + 12, contentWidth, 8)
    yPos = addTextWithWrap(doc, 'www.medicagb.it', margin, footerY + 15, contentWidth, 8)
    yPos = addTextWithWrap(doc, 'www.telemedcare.it', margin, footerY + 18, contentWidth, 8)

    // 💾 Converti in Buffer
    const pdfArrayBuffer = doc.output('arraybuffer')
    const pdfBuffer = Buffer.from(pdfArrayBuffer)

    console.log(`✅ [CONTRACT-GEN] PDF generato (da template DOCX): ${pdfBuffer.length} bytes, tipo: ${contractData.tipoContratto}`)
    
    return pdfBuffer

  } catch (error) {
    console.error(`❌ [CONTRACT-GEN] Errore generazione PDF:`, error)
    throw error
  }
}
