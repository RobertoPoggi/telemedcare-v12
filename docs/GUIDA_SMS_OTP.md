# 📱 GUIDA COMPLETA: Invio SMS per OTP Firma Contratto

## 🎯 PROVIDER SMS CONSIGLIATI

### 1️⃣ TWILIO (Consigliato)

**Perché sceglierlo**:
- ✅ Più affidabile (99.95% uptime)
- ✅ API semplice e ben documentata
- ✅ €15 gratis per test
- ✅ Supporto eccellente
- ✅ Dashboard completa con analytics

**Costi Italia**:
- **€0,075** per SMS (7,5 centesimi)
- Nessun canone mensile
- Pay-as-you-go

**Setup Rapido**:

1. **Registrati**: https://www.twilio.com/try-twilio
2. **Verifica email + numero**
3. **Ottieni credenziali**:
   - Console: https://console.twilio.com/
   - Account SID: `ACxxxxxxxxxxxxxxxxxxxx`
   - Auth Token: `xxxxxxxxxxxxxxxxxxxxxx`
   - Phone Number: Acquista un numero (+12...) o usa trial

4. **Configura in Cloudflare Workers**:
   ```bash
   # Dashboard Cloudflare
   Workers & Pages → telemedcare-v12 → Settings → Variables

   # Aggiungi:
   TWILIO_ACCOUNT_SID = ACxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN = xxxxxxxxxxxxxxxxxxxxxx (encrypted)
   TWILIO_PHONE_NUMBER = +12345678900
   ```

5. **Test**:
   ```javascript
   import { sendSMS } from './modules/sms-service'
   
   const result = await sendSMS(
     '+393401234567',
     'Test SMS da TeleMedCare',
     env
   )
   
   console.log(result) // { success: true, sid: 'SMxxxxx' }
   ```

**Documentazione**: https://www.twilio.com/docs/sms

---

### 2️⃣ VONAGE (ex Nexmo)

**Vantaggi**:
- ✅ Prezzi competitivi
- ✅ €2 gratis per test
- ✅ Buona copertura europea

**Costi Italia**:
- **€0,064** per SMS (6,4 centesimi)
- Nessun canone

**Setup**:
1. Registrati: https://dashboard.nexmo.com/sign-up
2. API Key + API Secret dalla dashboard
3. Codice:
```javascript
async function sendSMSVonage(to, message, env) {
  const response = await fetch('https://rest.nexmo.com/sms/json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'TeleMedCare',
      to: to.replace('+', ''),
      text: message,
      api_key: env.VONAGE_API_KEY,
      api_secret: env.VONAGE_API_SECRET
    })
  })
  return response.json()
}
```

---

### 3️⃣ MESSAGEBIRD

**Vantaggi**:
- ✅ Prezzi bassi
- ✅ €10 gratis per test
- ✅ Sede UE (Amsterdam) - GDPR friendly

**Costi Italia**:
- **€0,065** per SMS
- Nessun canone

**Setup**:
1. Registrati: https://dashboard.messagebird.com/en/sign-up
2. API Key dalla dashboard
3. Codice:
```javascript
async function sendSMSMessageBird(to, message, env) {
  const response = await fetch('https://rest.messagebird.com/messages', {
    method: 'POST',
    headers: {
      'Authorization': `AccessKey ${env.MESSAGEBIRD_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipients: [to],
      originator: 'TeleMedCare',
      body: message
    })
  })
  return response.json()
}
```

---

### 4️⃣ SKEBBY (Italiano)

**Vantaggi**:
- ✅ Provider italiano
- ✅ Supporto in italiano
- ✅ Sender ID personalizzato gratuito
- ✅ GDPR compliant

**Costi Italia**:
- **€0,05** per SMS (5 centesimi) - PIÙ ECONOMICO
- Pacchetti prepagati disponibili
- Nessun canone

**Setup**:
1. Registrati: https://www.skebby.it/
2. Acquista crediti (min €10)
3. Ottieni username + password API
4. Codice:
```javascript
async function sendSMSSkebby(to, message, env) {
  const credentials = btoa(`${env.SKEBBY_USERNAME}:${env.SKEBBY_PASSWORD}`)
  
  const response = await fetch('https://api.skebby.it/API/v1.0/REST/sms', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipient: [to.replace('+39', '')],
      message: message,
      sender: 'TeleMedCare',
      message_type: 'SI' // SMS Italia
    })
  })
  return response.json()
}
```

**Documentazione**: https://developers.skebby.it/

---

### 5️⃣ AWS SNS (Per chi già usa AWS)

**Vantaggi**:
- ✅ Integrato con altri servizi AWS
- ✅ Scalabilità enterprise
- ✅ Prezzi bassi su volumi alti

**Costi Italia**:
- **$0,00645** per SMS (~€0,006)
- Più economico ma setup complesso

**Setup**: Richiede AWS account + IAM user + SDK

---

## 📊 CONFRONTO PROVIDER

| Provider | Costo SMS | Credito Gratis | Difficoltà | GDPR | Consigliato |
|----------|-----------|----------------|------------|------|-------------|
| **Twilio** | €0,075 | €15 | 🟢 Facile | ✅ | ⭐⭐⭐⭐⭐ |
| **Skebby** | €0,05 | - | 🟢 Facile | ✅✅ | ⭐⭐⭐⭐ |
| **Vonage** | €0,064 | €2 | 🟢 Facile | ✅ | ⭐⭐⭐⭐ |
| **MessageBird** | €0,065 | €10 | 🟢 Facile | ✅✅ | ⭐⭐⭐⭐ |
| **AWS SNS** | €0,006 | $300* | 🔴 Difficile | ✅ | ⭐⭐⭐ |

*$300 di crediti AWS per nuovi account (validi 12 mesi)

---

## 🚀 SETUP CONSIGLIATO: TWILIO

### STEP 1: Registrazione Twilio

1. Vai su: https://www.twilio.com/try-twilio
2. Compila form:
   - First Name: Roberto
   - Last Name: Poggi
   - Email: tua@email.it
   - Password: (crea password sicura)
3. Verifica email
4. Verifica numero telefono (ricevi SMS con codice)
5. ✅ Ottieni **€15 gratis** sul tuo account

### STEP 2: Ottieni Credenziali

1. Vai alla Console: https://console.twilio.com/
2. Dashboard → Account Info:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxxxxx` (copialo)
   - **Auth Token**: Clicca "Show" (copialo)
3. Phone Numbers → Get a Number:
   - Clicca "Get your first Twilio phone number"
   - Twilio ti assegna un numero USA gratis (es. +1 234 567 8900)
   - ⚠️ Con trial puoi inviare SMS solo a numeri verificati

### STEP 3: Verifica Numeri Test (Solo Trial)

Durante il trial, puoi inviare SMS SOLO a numeri verificati:

1. Console → Phone Numbers → Verified Caller IDs
2. Clicca "+" per aggiungere numero
3. Inserisci: +39 340 123 4567 (tuo numero)
4. Ricevi SMS con codice
5. Inserisci codice per verificare
6. ✅ Ora puoi inviare SMS a questo numero

### STEP 4: Configura Environment Variables Cloudflare

1. Vai su: https://dash.cloudflare.com/
2. Workers & Pages → telemedcare-v12
3. Settings → Variables
4. Aggiungi 3 variabili:

```
TWILIO_ACCOUNT_SID
  Tipo: Plain text
  Valore: ACxxxxxxxxxxxxxxxxxxxx

TWILIO_AUTH_TOKEN
  Tipo: Secret (encrypted)
  Valore: xxxxxxxxxxxxxxxxxxxxxx

TWILIO_PHONE_NUMBER
  Tipo: Plain text
  Valore: +12345678900
```

5. Clicca "Save and Deploy"

### STEP 5: Test Invio SMS

Crea endpoint di test:

```typescript
// src/index.tsx
import { sendSMS } from './modules/sms-service'

app.get('/api/test-sms', async (c) => {
  const result = await sendSMS(
    '+393401234567', // TUO numero verificato
    'Test SMS da TeleMedCare! 🚀',
    {
      TWILIO_ACCOUNT_SID: c.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: c.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: c.env.TWILIO_PHONE_NUMBER
    }
  )
  
  return c.json(result)
})
```

Testa: https://telemedcare-v12.pages.dev/api/test-sms

**Risultato atteso**:
```json
{
  "success": true,
  "sid": "SM12345678901234567890123456789012"
}
```

---

## 💰 UPGRADE DA TRIAL A PRODUZIONE

### Quando fare l'upgrade:
- Vuoi inviare SMS a numeri non verificati
- Hai finito i €15 gratis
- Vuoi un numero italiano (+39) invece che USA

### Come fare:
1. Console Twilio → Billing
2. Add Payment Method (carta credito)
3. Ricarica account (min €20)
4. ✅ Ora puoi:
   - Inviare SMS a TUTTI i numeri italiani
   - Acquistare numero italiano (+39) - €1-5/mese
   - Usare Sender ID personalizzato

### Numero Italiano vs USA:
```
Con numero USA (+1):
- Cliente riceve SMS da: +1 234 567 8900
- Costo: Incluso in €15 trial
- Limite: Solo numeri verificati (trial)

Con numero Italiano (+39):
- Cliente riceve SMS da: +39 06 1234567
- Costo: €1/mese + €0,075/SMS
- Vantaggio: Cliente riconosce numero IT
```

**Consiglio**: Inizia con numero USA (trial), poi passa a italiano in produzione.

---

## 🔧 IMPLEMENTAZIONE COMPLETA OTP FIRMA

### Flusso Completo:

```
1. Cliente apre pagina firma contratto
   URL: /contract-signature?contractId=xxx

2. Sistema carica dati contratto
   GET /api/contracts/xxx

3. Sistema invia OTP automaticamente
   POST /api/contracts/send-otp
   Body: { contractId: 'xxx' }
   
4. Backend:
   - Genera OTP 6 cifre
   - Invia SMS via Twilio
   - Salva OTP in DB (scadenza 10 min)
   
5. Cliente riceve SMS:
   "TeleMedCare: Il tuo codice per firmare il contratto è: 123456. Valido per 10 minuti."
   
6. Cliente inserisce OTP in form

7. Sistema verifica OTP
   POST /api/contracts/verify-otp
   Body: { contractId: 'xxx', otp: '123456' }
   
8. Se OK:
   - Sblocca canvas firma
   - Cliente firma col dito
   - Invia firma + OTP verificato
```

### Codice Frontend (contract-signature.html):

```javascript
// Al caricamento pagina, invia OTP automaticamente
async function loadContract() {
  // ... carica dati contratto ...
  
  // Invia OTP
  await sendOTP()
}

async function sendOTP() {
  const response = await fetch(`/api/contracts/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contractId: contractId })
  })
  
  const result = await response.json()
  
  if (result.success) {
    // Mostra form inserimento OTP
    document.getElementById('otpSection').style.display = 'block'
  }
}

async function verifyOTP() {
  const userOTP = document.getElementById('otpInput').value
  
  const response = await fetch(`/api/contracts/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contractId: contractId,
      otp: userOTP
    })
  })
  
  const result = await response.json()
  
  if (result.success) {
    // Sblocca canvas firma
    document.getElementById('signatureSection').style.display = 'block'
    document.getElementById('otpSection').style.display = 'none'
  } else {
    alert('❌ Codice errato: ' + result.error)
  }
}
```

---

## 📊 STIMA COSTI MENSILI

### Scenario: 100 contratti/mese

| Provider | Costo/SMS | Totale Mese | Note |
|----------|-----------|-------------|------|
| **Twilio** | €0,075 | **€7,50** | + €0 canone |
| **Skebby** | €0,05 | **€5,00** | + €0 canone |
| **Vonage** | €0,064 | **€6,40** | + €0 canone |

### Scenario: 1.000 contratti/mese

| Provider | Costo/SMS | Totale Mese |
|----------|-----------|-------------|
| **Twilio** | €0,075 | **€75** |
| **Skebby** | €0,05 | **€50** |
| **Vonage** | €0,064 | **€64** |

**Consiglio**: Inizia con Twilio (€15 gratis = 200 SMS), poi valuta Skebby se volumi alti.

---

## ✅ CHECKLIST IMPLEMENTAZIONE

- [ ] Registrato su Twilio
- [ ] Ottenute credenziali (SID, Token, Phone)
- [ ] Verificato numero test (trial)
- [ ] Aggiunte env vars su Cloudflare
- [ ] Testato endpoint `/api/test-sms`
- [ ] Deploy migration 0051 (tabella contract_otps)
- [ ] Implementato flusso OTP in pagina firma
- [ ] Testato end-to-end (SMS → OTP → Firma)
- [ ] Upgrade a account produzione (quando pronto)

---

## 🆘 TROUBLESHOOTING

### Errore: "Authentication failed"
- Verifica TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN
- Controlla che siano configurati su Cloudflare

### Errore: "Unverified number" (Trial)
- Devi verificare il numero destinatario nella Console Twilio
- Oppure upgrade a account produzione

### SMS non arriva
- Controlla spam/junk
- Verifica numero sia formato corretto (+39...)
- Controlla dashboard Twilio → Logs

### Costi troppo alti
- Passa a Skebby (€0,05 vs €0,075)
- Oppure AWS SNS (volumi molto alti)

---

**🚀 PRONTO PER INIZIARE!**

1. Registrati su Twilio (5 minuti)
2. Configura env vars Cloudflare (2 minuti)
3. Testa endpoint `/api/test-sms`
4. Implementa flusso OTP nella pagina firma

**Hai bisogno di aiuto con l'implementazione?** 📱
