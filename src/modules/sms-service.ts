// ============================================
// SERVIZIO SMS - Twilio Integration
// ============================================

/**
 * Invia SMS tramite Twilio
 * 
 * @param phoneNumber - Numero telefono destinatario (formato: +39...)
 * @param message - Testo messaggio SMS (max 160 caratteri)
 * @param env - Environment variables (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
 * @returns Promise<{ success: boolean, sid?: string, error?: string }>
 */
export async function sendSMS(
  phoneNumber: string,
  message: string,
  env: {
    TWILIO_ACCOUNT_SID: string
    TWILIO_AUTH_TOKEN: string
    TWILIO_PHONE_NUMBER: string
  }
): Promise<{ success: boolean; sid?: string; error?: string }> {
  
  try {
    // Valida numero telefono (deve iniziare con +39 per Italia)
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+39' + phoneNumber.replace(/^0+/, '') // Rimuovi 0 iniziale
    }
    
    // Normalizza numero (solo +39...)
    phoneNumber = phoneNumber.replace(/\s+/g, '')
    
    console.log(`📱 [SMS] Invio a ${phoneNumber}: ${message.substring(0, 50)}...`)
    
    // Prepara credenziali Twilio (Basic Auth)
    const credentials = btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)
    
    // Prepara body (application/x-www-form-urlencoded)
    const body = new URLSearchParams({
      To: phoneNumber,
      From: env.TWILIO_PHONE_NUMBER,
      Body: message
    })
    
    // Chiama API Twilio
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }
    )
    
    const result = await response.json()
    
    if (!response.ok) {
      console.error('❌ [SMS] Errore Twilio:', result)
      return {
        success: false,
        error: result.message || 'Errore invio SMS'
      }
    }
    
    console.log(`✅ [SMS] Inviato con successo! SID: ${result.sid}`)
    
    return {
      success: true,
      sid: result.sid // ID messaggio (per tracking)
    }
    
  } catch (error) {
    console.error('❌ [SMS] Errore:', error)
    return {
      success: false,
      error: error.message || 'Errore generico invio SMS'
    }
  }
}

/**
 * Genera codice OTP a 6 cifre
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Verifica formato numero telefono italiano
 */
export function validatePhoneNumber(phone: string): boolean {
  // Rimuovi spazi e caratteri speciali
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Accetta:
  // +39 3xx xxx xxxx
  // 0039 3xx xxx xxxx
  // 3xx xxx xxxx
  const regex = /^(\+39|0039)?3\d{8,9}$/
  
  return regex.test(cleaned)
}

/**
 * Normalizza numero telefono al formato +39...
 */
export function normalizePhoneNumber(phone: string): string {
  // Rimuovi spazi e caratteri speciali
  let cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Rimuovi prefisso 0039 o +39 se presente
  cleaned = cleaned.replace(/^(\+39|0039)/, '')
  
  // Rimuovi 0 iniziale se presente
  cleaned = cleaned.replace(/^0+/, '')
  
  // Aggiungi +39
  return '+39' + cleaned
}

// ============================================
// ESEMPIO USO: Invio OTP prima della firma
// ============================================

/**
 * Invia OTP via SMS e salva nel DB
 * 
 * @param contractId - ID contratto
 * @param phoneNumber - Numero telefono cliente
 * @param db - Database D1
 * @param env - Environment variables
 */
export async function sendContractOTP(
  contractId: string,
  phoneNumber: string,
  db: any,
  env: any
): Promise<{ success: boolean; otp?: string; error?: string }> {
  
  try {
    // Valida numero telefono
    if (!validatePhoneNumber(phoneNumber)) {
      return {
        success: false,
        error: 'Numero telefono non valido'
      }
    }
    
    // Normalizza numero
    const normalizedPhone = normalizePhoneNumber(phoneNumber)
    
    // Genera OTP
    const otp = generateOTP()
    
    // Prepara messaggio
    const message = `TeleMedCare: Il tuo codice per firmare il contratto è: ${otp}. Valido per 10 minuti.`
    
    // Invia SMS
    const smsResult = await sendSMS(normalizedPhone, message, {
      TWILIO_ACCOUNT_SID: env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: env.TWILIO_PHONE_NUMBER
    })
    
    if (!smsResult.success) {
      return {
        success: false,
        error: smsResult.error
      }
    }
    
    // Salva OTP nel DB (con scadenza 10 minuti)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    
    await db.prepare(`
      INSERT INTO contract_otps (contract_id, otp_code, phone_number, expires_at, sms_sid, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(contract_id) DO UPDATE SET
        otp_code = excluded.otp_code,
        expires_at = excluded.expires_at,
        sms_sid = excluded.sms_sid,
        created_at = excluded.created_at,
        verified = 0
    `).bind(
      contractId,
      otp,
      normalizedPhone,
      expiresAt,
      smsResult.sid,
      new Date().toISOString()
    ).run()
    
    console.log(`✅ [OTP] Salvato per contratto ${contractId}`)
    
    return {
      success: true,
      otp: otp // Solo per test, non restituire in produzione!
    }
    
  } catch (error) {
    console.error('❌ [OTP] Errore:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Verifica OTP inserito dall'utente
 */
export async function verifyContractOTP(
  contractId: string,
  userOTP: string,
  db: any
): Promise<{ success: boolean; error?: string }> {
  
  try {
    // Recupera OTP dal DB
    const otpRecord = await db.prepare(`
      SELECT * FROM contract_otps 
      WHERE contract_id = ? 
      AND verified = 0
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(contractId).first()
    
    if (!otpRecord) {
      return {
        success: false,
        error: 'Nessun OTP trovato. Richiedi un nuovo codice.'
      }
    }
    
    // Verifica scadenza
    if (new Date() > new Date(otpRecord.expires_at)) {
      return {
        success: false,
        error: 'Codice OTP scaduto. Richiedi un nuovo codice.'
      }
    }
    
    // Verifica codice
    if (otpRecord.otp_code !== userOTP) {
      // Incrementa tentativi falliti
      await db.prepare(`
        UPDATE contract_otps 
        SET failed_attempts = failed_attempts + 1 
        WHERE contract_id = ?
      `).bind(contractId).run()
      
      return {
        success: false,
        error: 'Codice OTP errato. Riprova.'
      }
    }
    
    // OTP corretto! Marca come verificato
    await db.prepare(`
      UPDATE contract_otps 
      SET verified = 1, 
          verified_at = ?
      WHERE contract_id = ?
    `).bind(new Date().toISOString(), contractId).run()
    
    console.log(`✅ [OTP] Verificato per contratto ${contractId}`)
    
    return {
      success: true
    }
    
  } catch (error) {
    console.error('❌ [OTP] Errore verifica:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
