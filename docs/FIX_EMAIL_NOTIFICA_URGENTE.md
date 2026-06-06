# 🔴 FIX URGENTE - Email Notifica Non Arriva

**Data**: 2026-02-08
**Ambiente**: Produzione (telemedcare-v12.pages.dev)
**Problema**: Email notifica a info@ecura.it NON arriva dopo import lead da HubSpot

---

## 🔍 DIAGNOSI PROBLEMA

### Causa Root: **API Keys Email NON Configurate in Cloudflare Pages**

**Cosa Succede Ora**:
1. Lead viene importato da HubSpot ✅
2. Sistema chiama `sendNewLeadNotification()` ✅
3. Funzione controlla switch `admin_email_notifications_enabled` ✅
4. Sistema tenta di inviare email tramite `EmailService` ✅
5. **EmailService NON trova le API keys** ❌
6. Sistema va in **"Demo Mode"** e ritorna `success: true` ma NON invia email ❌

**Codice Email Service** (`src/modules/email-service.ts`, righe ~423-458):

```typescript
// Tentativo 1: SendGrid
const sendGridKey = env.SENDGRID_API_KEY
if (sendGridKey) {  // ❌ Currently FALSE in production
  // Invia con SendGrid
}

// Tentativo 2: Resend
const resendKey = env.RESEND_API_KEY
if (resendKey) {  // ❌ Currently FALSE in production
  // Invia con Resend
}

// Fallback: Demo Mode
console.log('📧 Tutti i provider falliti, modalità demo')
return {
  success: true,  // ❌ PROBLEMA! Dice success ma non invia
  messageId: `DEMO_${Date.now()}`,
  timestamp: new Date().toISOString()
}
```

---

## ✅ SOLUZIONE IMMEDIATA

### **STEP 1: Configurare API Keys su Cloudflare Pages**

#### 1.1 Accedi a Cloudflare Dashboard
```
URL: https://dash.cloudflare.com/
```

#### 1.2 Vai al Progetto
```
Workers & Pages → telemedcare-v12 → Settings → Environment Variables
```

#### 1.3 Aggiungi le Variabili (Production Environment)

**Variabili OBBLIGATORIE per Email**:

| Variable Name | Value | Type | Environment |
|---------------|-------|------|-------------|
| `SENDGRID_API_KEY` | `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` | Encrypted | Production |
| `RESEND_API_KEY` | `re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2` | Encrypted | Production |
| `EMAIL_FROM` | `info@ecura.it` | Plain text | Production |
| `EMAIL_TO_INFO` | `info@ecura.it` | Plain text | Production |

**Note**:
- Le chiavi sopra sono **PLACEHOLDER** - usa le tue chiavi reali
- Segna come "Encrypted" per sicurezza
- Applica a "Production" environment

#### 1.4 Salva e Redeploy
- Dopo aver salvato le variabili, Cloudflare farà automaticamente un redeploy
- Attendi 2-3 minuti per il completamento

---

## 🔐 COME OTTENERE LE API KEYS (se non le hai)

### SendGrid API Key

1. Vai su https://app.sendgrid.com/
2. Login con il tuo account
3. **Settings** → **API Keys**
4. Click **Create API Key**
5. Nome: `TeleMedCare V12 Production`
6. Permessi: Seleziona **Full Access** o almeno **Mail Send**
7. Click **Create & View**
8. **COPIA LA CHIAVE** (la vedrai solo una volta!)
   ```
   SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Resend API Key

1. Vai su https://resend.com/
2. Login con il tuo account
3. **Settings** → **API Keys**
4. Click **Create API Key**
5. Nome: `TeleMedCare V12 Production`
6. **COPIA LA CHIAVE**:
   ```
   re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

---

## 📧 VERIFICA DOMINI EMAIL

**IMPORTANTE**: Per usare `info@ecura.it`, devi verificare il dominio:

### Su SendGrid
1. **Settings** → **Sender Authentication**
2. Click **Verify a Domain**
3. Inserisci: `telemedcare.it`
4. Aggiungi i DNS records richiesti al tuo provider DNS
5. Attendi verifica (fino a 48 ore)

### Su Resend
1. **Settings** → **Domains**
2. Click **Add Domain**
3. Inserisci: `telemedcare.it`
4. Aggiungi i DNS records richiesti
5. Attendi verifica

**Nota**: Senza verifica dominio, le email potrebbero:
- Finire in spam
- Non essere inviate
- Usare indirizzo mittente generico

---

## 🧪 TEST DOPO CONFIGURAZIONE

### Test #1: Verifica API Keys Configurate

Controlla i logs su Cloudflare dopo import lead:

**Logs Attesi (PRIMA - Demo Mode)**:
```
📧 Tutti i provider falliti, modalità demo
success: true, messageId: DEMO_1234...
```

**Logs Attesi (DOPO - Con API Keys)**:
```
🔄 Tentativo invio con SendGrid...
✅ Email inviata con successo tramite SendGrid
messageId: SG.abc123...
```

### Test #2: Import Lead di Test

1. Vai su Dashboard: `https://telemedcare-v12.pages.dev/dashboard`
2. Click pulsante **"Import da IRBEMA"**
3. Verifica che:
   - Import completa con successo ✅
   - Log mostra "Email inviata con successo" ✅
   - **Email arriva a info@ecura.it** ✅

### Test #3: Verifica Switch Database

```sql
-- Query per verificare switch
SELECT key, value FROM settings 
WHERE key = 'admin_email_notifications_enabled';

-- Valore atteso: 'true'
```

Se switch è su 'false', attivalo:
```sql
UPDATE settings 
SET value = 'true' 
WHERE key = 'admin_email_notifications_enabled';
```

---

## 🔧 WORKAROUND TEMPORANEO (se API keys richiedono tempo)

Se le API keys richiedono approvazione o tempo, puoi temporaneamente:

**Opzione A**: Modificare `email-service.ts` per loggare invece di inviare
- Utile solo per debug, NON per produzione

**Opzione B**: Usare email di test (Gmail/Outlook)
- Configura SendGrid/Resend con email personale verificata
- Cambia `EMAIL_TO_INFO` temporaneamente

⚠️ **NON CONSIGLIATO** per produzione - meglio aspettare configurazione corretta

---

## 📊 CHECKLIST COMPLETAMENTO

- [ ] **API Keys configurate** su Cloudflare Pages
  - [ ] SENDGRID_API_KEY aggiunta
  - [ ] RESEND_API_KEY aggiunta
  - [ ] EMAIL_FROM configurato
  - [ ] EMAIL_TO_INFO configurato
  
- [ ] **Domini verificati**
  - [ ] telemedcare.it verificato su SendGrid
  - [ ] telemedcare.it verificato su Resend
  - [ ] DNS records aggiunti
  
- [ ] **Switch database attivi**
  - [ ] admin_email_notifications_enabled = 'true'
  - [ ] hubspot_auto_import_enabled = 'true'
  
- [ ] **Test completati**
  - [ ] Import lead da HubSpot funziona
  - [ ] Email notifica arriva a info@
  - [ ] Logs mostrano invio SendGrid/Resend

---

## 🚨 SE ANCORA NON FUNZIONA

### Debug Avanzato

1. **Verifica Logs Cloudflare**:
   - Dashboard → telemedcare-v12 → Logs
   - Cerca errori con "email" o "SendGrid"

2. **Verifica Email Service**:
   ```typescript
   // In src/modules/email-service.ts, aggiungi debug log:
   console.log('🔑 [EMAIL] SENDGRID_API_KEY:', env.SENDGRID_API_KEY ? 'PRESENT' : 'MISSING')
   console.log('🔑 [EMAIL] RESEND_API_KEY:', env.RESEND_API_KEY ? 'PRESENT' : 'MISSING')
   ```

3. **Test Diretto API Keys**:
   ```bash
   # Test SendGrid
   curl -X POST https://api.sendgrid.com/v3/mail/send \
     -H "Authorization: Bearer YOUR_SENDGRID_KEY" \
     -H "Content-Type: application/json" \
     -d '{"personalizations":[{"to":[{"email":"info@ecura.it"}]}],"from":{"email":"test@yourdomain.com"},"subject":"Test","content":[{"type":"text/plain","value":"Test"}]}'
   ```

---

## 💡 SUMMARY

**Problema**: Email notifica NON arriva perché sistema è in Demo Mode (API keys mancanti)

**Soluzione**: Configurare `SENDGRID_API_KEY` e `RESEND_API_KEY` su Cloudflare Pages

**Tempo Stimato**: 10-15 minuti (se hai già le API keys)

**Priorità**: 🔴 CRITICA - Sistema non funzionale senza email

---

**Prossimo Step Dopo Fix**: 
Una volta che le email di notifica funzionano, possiamo implementare:
1. Email completamento dati al lead
2. Email contratto automatico
3. Fix link firma contratto

---

**Fine Documento**
