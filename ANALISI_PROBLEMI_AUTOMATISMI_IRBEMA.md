# 🔴 ANALISI PROBLEMI AUTOMATISMI - Flusso IRBEMA/HubSpot

**Data**: 2026-02-08
**Versione**: TeleMedCare V12.0
**Ambiente**: Produzione
**Lead Test**: Ressa Rosaria, Roberto Poggi

---

## 📋 FLUSSO ATTUALE (Come Funziona Ora)

```
1. Lead compila form su www.ecura.it (partner IRBEMA)
   ↓
2. Lead salvato in HubSpot CRM
   ↓
3. Sistema importa lead via POST /api/import/irbema
   ↓
4. Lead salvato nel database con fonte='IRBEMA'
   ↓
5. ✅ Invia notifica a info@telemedcare.it (se switch ON)
   ↓
6. ❌ STOP - Nessun'altra email automatica
```

---

## 🔴 PROBLEMI INDIVIDUATI

### **PROBLEMA #1: Email Completamento Dati NON Inviata** ❌

**Dove**: Endpoint `/api/import/irbema` (linea 11423)

**Cosa Succede**:
- Dopo l'import, viene chiamato solo `sendNewLeadNotification()`
- Questa funzione invia SOLO la notifica a info@telemedcare.it
- **NON viene inviata email al lead** per completare i dati

**Cosa Dovrebbe Succedere**:
- Il lead dovrebbe ricevere email con link per completare:
  - CF Richiedente
  - Indirizzo Richiedente
  - CF Assistito
  - Indirizzo Assistito
  - Condizioni di salute
  - Altri dati mancanti

**Switch Coinvolto**:
- `lead_email_notifications_enabled` - Se OFF, non inviare email al lead
- `auto_completion_enabled` - Se ON, invia automaticamente email completamento

---

### **PROBLEMA #2: Email Contratto NON Inviata Automaticamente** ❌

**Dove**: Non esiste questo automatismo

**Cosa Dovrebbe Succedere**:
- Dopo che il lead completa i dati tramite il form `/completa-dati`
- Sistema dovrebbe automaticamente:
  1. Verificare che tutti i dati necessari sono presenti
  2. Generare il contratto (BASE o AVANZATO)
  3. Inviare email al lead con:
     - Contratto allegato (PDF)
     - Brochure appropriata (PRO/FAMILY/PREMIUM)
     - Link per firma elettronica

**Switch Coinvolto**:
- `auto_contract_workflow_enabled` - Se ON, invia contratto automaticamente

---

### **PROBLEMA #3: Link Firma Contratto Errato** ⚠️

**Dove**: Email invio contratto manuale (da dashboard)

**Sintomo Riportato**:
- L'invio manuale del contratto dalla dashboard funziona
- La mail arriva
- Ma il link per firmare il contratto da errore

**Da Verificare**:
- Generazione URL firma: `${baseUrl}/sign-contract?contractId=...`
- Endpoint `/sign-contract` esiste e funziona?
- contractId salvato correttamente nel database?

---

## ✅ COSA FUNZIONA CORRETTAMENTE

### ✅ Import HubSpot con Filtro eCura
- Endpoint: `POST /api/import/irbema`
- Filtro URL: solo lead con `ecura.it` in `hs_analytics_first_url` o `hs_analytics_last_url`
- Switch: `hubspot_auto_import_enabled` controlla se import è abilitato ✅

### ✅ Email Notifica a info@telemedcare.it
- Funzione: `sendNewLeadNotification()`
- Switch: `admin_email_notifications_enabled` controlla invio ✅
- Template: Email HTML inline in `lead-notifications.ts`

---

## 🔧 SOLUZIONI PROPOSTE

### **FIX #1: Aggiungere Email Completamento Dati dopo Import**

**File da modificare**: `src/index.tsx` - Endpoint `/api/import/irbema`

**Dopo la linea 11434** (dopo `sendNewLeadNotification`), aggiungere:

```typescript
// 🆕 Invia email completamento dati al lead (se abilitata)
const autoCompletionEnabled = await getSetting(c.env.DB, 'auto_completion_enabled')
const leadEmailsEnabled = await getSetting(c.env.DB, 'lead_email_notifications_enabled')

if (autoCompletionEnabled && leadEmailsEnabled && props.email) {
  try {
    // Importa moduli necessari
    const { createCompletionToken, getMissingFields } = await import('./modules/lead-completion')
    const { loadEmailTemplate, renderTemplate } = await import('./modules/template-loader-clean')
    
    // Crea token completamento (valido 30 giorni)
    const config = { auto_completion_token_days: 30 }
    const token = await createCompletionToken(c.env.DB, leadId, config.auto_completion_token_days)
    
    // Genera URL completamento
    const baseUrl = c.env?.PUBLIC_URL || 'https://telemedcare-v12.pages.dev'
    const completionUrl = `${baseUrl}/completa-dati?token=${token.token}`
    
    // Prepara dati lead completi
    const leadDataComplete = {
      id: leadId,
      nomeRichiedente: props.firstname || 'N/A',
      cognomeRichiedente: props.lastname || '',
      emailRichiedente: props.email,
      telefonoRichiedente: props.mobilephone || '',
      servizio: servizio,
      pacchetto: piano,
      cittaAssistito: props.city
    }
    
    // Carica template email
    const emailService = new EmailService(c.env)
    const template = await loadEmailTemplate('email_richiesta_completamento_form', c.env.DB, c.env)
    
    const templateData = {
      NOME_CLIENTE: props.firstname || 'Cliente',
      COGNOME_CLIENTE: props.lastname || '',
      LEAD_ID: leadId,
      SERVIZIO: servizio,
      COMPLETION_LINK: completionUrl,
      TOKEN_EXPIRY: new Date(token.expires_at).toLocaleDateString('it-IT'),
      MISSING_FIELDS_COUNT: 5 // CF, indirizzo, condizioni salute, etc.
    }
    
    const emailHtml = renderTemplate(template, templateData)
    
    // Invia email
    await emailService.sendEmail({
      to: props.email,
      subject: 'eCura - Completa la tua richiesta',
      html: emailHtml
    })
    
    console.log(`✅ [IRBEMA] Email completamento dati inviata a ${props.email}`)
    console.log(`   Link form: ${completionUrl}`)
  } catch (emailError) {
    console.error(`⚠️ [IRBEMA] Errore invio email completamento:`, emailError)
    // Non bloccare l'import se email fallisce
  }
}
```

---

### **FIX #2: Aggiungere Trigger Invio Contratto dopo Completamento Dati**

**File da creare/modificare**: `src/modules/lead-completion.ts`

**Aggiungere funzione** che viene chiamata quando lead completa i dati:

```typescript
/**
 * Chiamata automatica dopo che lead completa tutti i dati necessari
 */
export async function onLeadCompletionComplete(
  leadId: string,
  db: D1Database,
  env: any
): Promise<void> {
  try {
    // Verifica switch
    const autoContractEnabled = await getSetting(db, 'auto_contract_workflow_enabled')
    if (!autoContractEnabled) {
      console.log(`⏭️ [COMPLETION] Workflow contratto automatico disabilitato`)
      return
    }
    
    // Recupera dati lead completi
    const lead = await db.prepare('SELECT * FROM leads WHERE id = ?').bind(leadId).first()
    if (!lead) {
      console.error(`❌ [COMPLETION] Lead ${leadId} non trovato`)
      return
    }
    
    // Verifica che sia completo
    const { missing } = getMissingFields(lead)
    if (missing.length > 0) {
      console.log(`⏭️ [COMPLETION] Lead ${leadId} ancora incompleto (${missing.length} campi)`)
      return
    }
    
    console.log(`✅ [COMPLETION] Lead ${leadId} completo → Invio contratto automatico`)
    
    // Importa e chiama workflow contratto
    const { generateAndSendContract } = await import('./contract-workflow-manager')
    await generateAndSendContract(lead, env, db)
    
  } catch (error) {
    console.error(`❌ [COMPLETION] Errore workflow post-completamento:`, error)
  }
}
```

**Poi modificare** endpoint `POST /api/leads/:id/complete` per chiamare questa funzione.

---

### **FIX #3: Verificare e Correggere Link Firma Contratto**

**File da verificare**: 
- `src/modules/workflow-email-manager.ts` - Funzione `inviaEmailContratto()`
- Endpoint `GET /sign-contract` o `/app/sign-contract.html`

**Passi**:
1. Verificare che URL firma sia corretto: `${baseUrl}/sign-contract?contractId=${contractId}`
2. Verificare che endpoint `/sign-contract` esista e funzioni
3. Verificare che `contractId` sia salvato correttamente nel database

---

## 📊 SWITCH DA VERIFICARE NEL DATABASE

```sql
-- Verifica stato switch
SELECT key, value, description FROM settings 
WHERE key IN (
  'hubspot_auto_import_enabled',
  'admin_email_notifications_enabled',
  'lead_email_notifications_enabled',
  'auto_completion_enabled',
  'auto_contract_workflow_enabled'
);
```

**Valori Attesi per Produzione**:
- `hubspot_auto_import_enabled` = 'true' (per permettere import)
- `admin_email_notifications_enabled` = 'true' (per notifiche a info@)
- `lead_email_notifications_enabled` = 'true' (per email al lead)
- `auto_completion_enabled` = 'true' (per email completamento automatica)
- `auto_contract_workflow_enabled` = 'true' (per contratto automatico)

---

## 🧪 TEST DA ESEGUIRE

### Test #1: Import Lead da HubSpot
1. Attivare switch `hubspot_auto_import_enabled` = true
2. Chiamare `POST /api/import/irbema`
3. Verificare che:
   - Lead viene importato ✅
   - Email a info@ viene inviata ✅
   - **Email completamento dati viene inviata al lead** (dopo fix)

### Test #2: Completamento Dati
1. Lead clicca link email completamento
2. Compila form con tutti i dati
3. Verifica che:
   - Dati vengono salvati ✅
   - **Email contratto viene inviata automaticamente** (dopo fix)

### Test #3: Link Firma Contratto
1. Lead riceve email contratto
2. Clicca link "Firma il contratto"
3. Verifica che:
   - Pagina firma si apre correttamente
   - Contratto viene visualizzato
   - Firma funziona

---

## 📁 FILE DA MODIFICARE

1. **src/index.tsx** (linea ~11434)
   - Aggiungere invio email completamento dati dopo import HubSpot
   
2. **src/modules/lead-completion.ts**
   - Aggiungere funzione `onLeadCompletionComplete()`
   
3. **src/index.tsx** (endpoint POST /api/leads/:id/complete)
   - Chiamare `onLeadCompletionComplete()` dopo salvataggio dati

4. **src/modules/workflow-email-manager.ts**
   - Verificare funzione `inviaEmailContratto()` e link firma

---

## ⏱️ PRIORITÀ

1. 🔴 **ALTA** - Fix #1: Email completamento dati dopo import
2. 🔴 **ALTA** - Fix #2: Contratto automatico dopo completamento
3. 🟡 **MEDIA** - Fix #3: Verifica link firma contratto

---

**Fine Documento**
