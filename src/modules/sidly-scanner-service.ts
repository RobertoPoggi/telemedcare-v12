/**
 * SIDLY SCANNER SERVICE - Servizio scansione etichette SiDLY Care Pro
 * Implementa parsing etichette con supporto multi-formato e validazione avanzata
 */

export interface SiDLYLabelData {
  device_id: string        // ID dispositivo (SIDLY001, SIDLY002, etc.)
  imei: string            // IMEI (15 cifre con validazione Luhn)
  manufacturer: string    // Produttore (SiDLY Care)
  model: string          // Modello (Pro V2.1)
  lot_number?: string    // Numero lotto
  expiry_date?: string   // Data scadenza (ISO format)
  udi_code?: string      // Codice UDI completo
  ce_marking: boolean    // Presenza marcatura CE
  serial_number?: string // Numero seriale
  production_date?: string // Data produzione
}

export interface ScanResult {
  success: boolean
  data?: SiDLYLabelData
  error?: string
  confidence?: number     // Livello confidenza parsing (0-1)
  format_detected?: string // Formato etichetta riconosciuto
}

class SiDLYScannerService {
  
  /**
   * Scansiona etichetta SiDLY da testo OCR o input manuale
   */
  async scanLabel(input: string): Promise<ScanResult> {
    try {
      // Pulisci input
      const cleanInput = this.cleanInput(input)
      
      // Prova diversi formati di etichetta
      const formats = [
        this.parseStandardFormat,
        this.parseCompactFormat,
        this.parseQRCodeFormat,
        this.parseManualEntryFormat
      ]

      for (const parseFormat of formats) {
        const result = await parseFormat.call(this, cleanInput)
        if (result.success) {
          // Valida dati estratti
          const validation = this.validateLabelData(result.data!)
          if (validation.success) {
            return {
              ...result,
              confidence: result.confidence || 0.9
            }
          }
        }
      }

      return {
        success: false,
        error: 'Formato etichetta non riconosciuto o dati non validi'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Errore durante scansione etichetta'
      }
    }
  }

  /**
   * Pulisce input rimuovendo caratteri non necessari
   */
  private cleanInput(input: string): string {
    return input
      .replace(/[^\w\d\s\-\.\/\(\)\[\]:]/g, '') // Rimuovi caratteri speciali tranne quelli utili
      .replace(/\s+/g, ' ') // Normalizza spazi
      .trim()
      .toUpperCase()
  }

  /**
   * Parse formato standard SiDLY (etichetta principale)
   * Formato: SIDLY001 | IMEI: 860123456789012 | Model: Pro V2.1 | LOT: LOT2024001
   */
  private async parseStandardFormat(input: string): Promise<ScanResult> {
    const patterns = {
      device_id: /(?:SIDLY|SID)(\d{3,4})/i,
      imei: /(?:IMEI[:\s]*|IMEI[:\s]+)(\d{15})/i,
      model: /(?:MODEL[:\s]*|MOD[:\s]*)([\w\s\.]+?)(?:\s*\||$)/i,
      lot: /(?:LOT[:\s]*|LOTTO[:\s]*)([\w\d]+)/i,
      expiry: /(?:EXP[:\s]*|SCAD[:\s]*)([\d\-\/]+)/i,
      udi: /(?:UDI[:\s]*|UDI[:\s]+)\(01\)([\d\(\)]+)/i
    }

    const matches = {
      device_id: input.match(patterns.device_id)?.[0] || '',
      imei: input.match(patterns.imei)?.[1] || '',
      model: input.match(patterns.model)?.[1]?.trim() || 'Pro V2.1',
      lot_number: input.match(patterns.lot)?.[1] || '',
      expiry_date: input.match(patterns.expiry)?.[1] || '',
      udi_code: input.match(patterns.udi)?.[0] || ''
    }

    if (!matches.device_id || !matches.imei) {
      return { success: false, error: 'Device ID o IMEI mancanti nel formato standard' }
    }

    return {
      success: true,
      data: {
        device_id: matches.device_id,
        imei: matches.imei,
        manufacturer: 'SiDLY Care',
        model: matches.model,
        lot_number: matches.lot_number || undefined,
        expiry_date: this.parseDate(matches.expiry_date),
        udi_code: matches.udi_code || undefined,
        ce_marking: input.includes('CE') || true, // Default per SiDLY
      },
      format_detected: 'standard',
      confidence: 0.95
    }
  }

  /**
   * Parse formato compatto (etichetta piccola)
   * Formato: SIDLY001-860123456789012
   */
  private async parseCompactFormat(input: string): Promise<ScanResult> {
    const compactPattern = /(?:SIDLY|SID)(\d{3,4})[:\-\s]*(\d{15})/i
    const match = input.match(compactPattern)

    if (!match) {
      return { success: false, error: 'Formato compatto non riconosciuto' }
    }

    return {
      success: true,
      data: {
        device_id: `SIDLY${match[1].padStart(3, '0')}`,
        imei: match[2],
        manufacturer: 'SiDLY Care',
        model: 'Pro V2.1', // Default
        ce_marking: true
      },
      format_detected: 'compact',
      confidence: 0.85
    }
  }

  /**
   * Parse formato QR Code (JSON o delimitato)
   */
  private async parseQRCodeFormat(input: string): Promise<ScanResult> {
    // Prova parsing JSON
    try {
      const jsonData = JSON.parse(input)
      if (jsonData.device_id && jsonData.imei) {
        return {
          success: true,
          data: {
            device_id: jsonData.device_id,
            imei: jsonData.imei,
            manufacturer: jsonData.manufacturer || 'SiDLY Care',
            model: jsonData.model || 'Pro V2.1',
            lot_number: jsonData.lot_number,
            expiry_date: jsonData.expiry_date,
            udi_code: jsonData.udi_code,
            ce_marking: jsonData.ce_marking !== false
          },
          format_detected: 'qr_json',
          confidence: 0.98
        }
      }
    } catch {
      // Non è JSON, prova formato delimitato
    }

    // Formato delimitato: SIDLY001|860123456789012|Pro V2.1|LOT2024001
    const parts = input.split('|').map(p => p.trim())
    if (parts.length >= 2) {
      return {
        success: true,
        data: {
          device_id: parts[0],
          imei: parts[1],
          manufacturer: 'SiDLY Care',
          model: parts[2] || 'Pro V2.1',
          lot_number: parts[3] || undefined,
          ce_marking: true
        },
        format_detected: 'qr_delimited',
        confidence: 0.9
      }
    }

    return { success: false, error: 'Formato QR non riconosciuto' }
  }

  /**
   * Parse input manuale (forma libera)
   */
  private async parseManualEntryFormat(input: string): Promise<ScanResult> {
    // Estrai qualsiasi numero a 15 cifre (potenziale IMEI)
    const imeiMatch = input.match(/\b(\d{15})\b/)
    // Estrai ID dispositivo SiDLY
    const deviceMatch = input.match(/(?:SIDLY|SID)(\d{3,4})/i)

    if (!imeiMatch || !deviceMatch) {
      return { success: false, error: 'Dati insufficienti per input manuale' }
    }

    return {
      success: true,
      data: {
        device_id: `SIDLY${deviceMatch[1].padStart(3, '0')}`,
        imei: imeiMatch[1],
        manufacturer: 'SiDLY Care',
        model: 'Pro V2.1',
        ce_marking: true
      },
      format_detected: 'manual',
      confidence: 0.7
    }
  }

  /**
   * Valida dati etichetta estratti
   */
  private validateLabelData(data: SiDLYLabelData): { success: boolean; error?: string } {
    // Valida Device ID
    if (!data.device_id.match(/^SIDLY\d{3,4}$/)) {
      return { success: false, error: 'Device ID non valido (formato: SIDLYXXX)' }
    }

    // Valida IMEI con algoritmo Luhn
    if (!this.validateImeiLuhn(data.imei)) {
      return { success: false, error: 'IMEI non valido (controllo Luhn fallito)' }
    }

    // Valida lunghezza IMEI
    if (data.imei.length !== 15) {
      return { success: false, error: 'IMEI deve essere 15 cifre' }
    }

    return { success: true }
  }

  /**
   * Validazione IMEI con algoritmo Luhn
   */
  private validateImeiLuhn(imei: string): boolean {
    if (!/^\d{15}$/.test(imei)) return false

    let sum = 0
    let alternate = false

    // Processa da destra a sinistra
    for (let i = imei.length - 1; i >= 0; i--) {
      let digit = parseInt(imei.charAt(i), 10)

      if (alternate) {
        digit *= 2
        if (digit > 9) {
          digit = digit % 10 + 1
        }
      }

      sum += digit
      alternate = !alternate
    }

    return sum % 10 === 0
  }

  /**
   * Parse data in formato ISO
   */
  private parseDate(dateStr: string): string | undefined {
    if (!dateStr) return undefined

    // Formati supportati: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
    const formats = [
      /^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/, // DD/MM/YYYY o DD-MM-YYYY
      /^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/, // YYYY-MM-DD
    ]

    for (const format of formats) {
      const match = dateStr.match(format)
      if (match) {
        if (format === formats[0]) {
          // DD/MM/YYYY -> YYYY-MM-DD
          return `${match[3]}-${match[2]}-${match[1]}`
        } else {
          // YYYY-MM-DD (già corretto)
          return dateStr
        }
      }
    }

    return undefined
  }

  /**
   * Genera dati di test per sviluppo
   */
  async generateTestLabel(deviceNumber: number = 1): Promise<SiDLYLabelData> {
    const deviceId = `SIDLY${deviceNumber.toString().padStart(3, '0')}`
    const imei = this.generateValidImei()
    
    return {
      device_id: deviceId,
      imei: imei,
      manufacturer: 'SiDLY Care',
      model: 'Pro V2.1',
      lot_number: `LOT2024${deviceNumber.toString().padStart(3, '0')}`,
      expiry_date: '2026-12-31',
      udi_code: `(01)12345678901234(17)261231(10)LOT2024${deviceNumber.toString().padStart(3, '0')}`,
      ce_marking: true,
      serial_number: `SN${Date.now()}${deviceNumber}`,
      production_date: new Date().toISOString().split('T')[0]
    }
  }

  /**
   * Genera IMEI valido per testing
   */
  private generateValidImei(): string {
    // Genera primi 14 digit
    let imei = '86012345678901'
    
    // Calcola check digit con Luhn
    let sum = 0
    let alternate = true

    for (let i = imei.length - 1; i >= 0; i--) {
      let digit = parseInt(imei.charAt(i), 10)

      if (alternate) {
        digit *= 2
        if (digit > 9) {
          digit = digit % 10 + 1
        }
      }

      sum += digit
      alternate = !alternate
    }

    const checkDigit = (10 - (sum % 10)) % 10
    return imei + checkDigit.toString()
  }
}

// Export singleton instance
export const sidlyScannerService = new SiDLYScannerService()
export default SiDLYScannerService