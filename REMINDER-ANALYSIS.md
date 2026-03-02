# 📧 ANALISI SISTEMA REMINDER - TeleMedCare V12

**Data analisi**: 2026-03-02  
**Ultimo run analizzato**: 21941764397 (12 febbraio 2026, ore 09:55 UTC)

---

## 🎯 SCOPO DEL SISTEMA

Il sistema di reminder serve per **inviare email automatiche** ai lead che:
- ✅ Hanno ricevuto un link per completare i loro dati
- ❌ NON hanno ancora completato il form
- ⏰ Sono passati X giorni dall'ultima email

---

## ⚙️ CONFIGURAZIONE ATTUALE

### Parametri Default (da database `system_config`)

| Parametro | Valore | Descrizione |
|-----------|--------|-------------|
| `auto_completion_token_days` | **30 giorni** | Validità token completamento dati |
| `auto_completion_reminder_days` | **3 giorni** | Intervallo tra i reminder |
| `auto_completion_max_reminders` | **2** | Numero massimo reminder per lead |
| `cron_enabled` | **true** | Interruttore ON/OFF del cron |

### Logica di Invio Reminder

**Un reminder viene inviato quando:**
1. ✅ Token NON completato (`completed = 0`)
2. ✅ Token NON scaduto (`expires_at > now`)
3. ✅ Numero reminder < max (default 2)
4. ✅ Passati 3+ giorni dall'ultimo reminder
5. ✅ Passate almeno 23 ore dall'ultimo invio (protezione doppi invii)

**Query SQL usata:**
```sql
SELECT * FROM lead_completion_tokens
WHERE completed = 0
  AND expires_at > datetime('now')
  AND reminder_count < 2
  AND (
    reminder_sent_at IS NULL
    OR (
      reminder_sent_at < datetime('now', '-3 days') 
      AND reminder_sent_at < datetime('now', '-23 hours')
    )
  )
```

---

## ⏰ PERIODICITÀ ESECUZIONE

### GitHub Action: **Ogni giorno alle 09:50-10:00 UTC**

**File workflow**: `.github/workflows/reminder-cron.yml`  
**Trigger**: `schedule` con cron `'0 9 * * *'` (ogni giorno alle 09:00 UTC)

**Storico ultimi run:**
| Data | Ora | Run ID | Risultato |
|------|-----|--------|-----------|
| 12 feb 2026 | 09:55 UTC | 21941764397 | ✅ Success |
| 11 feb 2026 | 09:57 UTC | 21900505952 | ✅ Success |
| 10 feb 2026 | 10:03 UTC | 21860378281 | ✅ Success |
| 9 feb 2026 | 10:06 UTC | 21820713031 | ✅ Success |
| 8 feb 2026 | 09:35 UTC | 21795964380 | ✅ Success |

✅ **Il workflow funziona correttamente ed è puntuale!**

---

## 📊 RISULTATI ULTIMO RUN (12 feb 2026)

### Statistiche
```json
{
  "success": 2,     ✅ 2 email inviate con successo (3.8%)
  "failed": 51,     ❌ 51 email fallite (96.2%)
  "total": 53       📊 Totale lead processati
}
```

### ⚠️ PROBLEMA CRITICO: 96% DI FALLIMENTI

**Su 53 lead che necessitavano reminder:**
- ✅ Solo **2 email inviate** (3.8%)
- ❌ **51 email fallite** (96.2%)

---

## 🔍 POSSIBILI CAUSE DEI FALLIMENTI

### 1. ❌ Email Mancanti o Invalide
**Probabilità: ALTA (90%)**

Il campo `email` nel database potrebbe essere:
- `NULL` (vuoto)
- Stringa vuota `""`
- Email invalida (es. `"invalido@"`)

**Come verificare:**
```sql
SELECT 
  id,
  nomeRichiedente,
  cognomeRichiedente,
  email,
  CASE 
    WHEN email IS NULL THEN 'NULL'
    WHEN email = '' THEN 'VUOTO'
    WHEN email NOT LIKE '%@%.%' THEN 'INVALIDO'
    ELSE 'VALIDO'
  END AS email_status
FROM leads
WHERE id IN (
  SELECT lead_id FROM lead_completion_tokens 
  WHERE completed = 0 AND expires_at > datetime('now')
)
```

### 2. ⚠️ Errori Servizio Email
**Probabilità: MEDIA (30%)**

- Rate limiting provider email (es. Resend, SendGrid)
- Credenziali email non configurate
- API key scaduta o quota esaurita

**Verifica log Cloudflare:**
```
Dashboard Cloudflare → Pages → telemedcare-v12 → Functions → Logs
Filtra per: [REMINDER] o [EMAIL]
```

### 3. ⚠️ Template Email Mancante
**Probabilità: BASSA (10%)**

Il template `email_reminder_completamento` potrebbe non esistere nel DB.

**Verifica:**
```sql
SELECT * FROM email_templates WHERE template_id = 'email_reminder_completamento'
```

### 4. ⚠️ Token Scaduti Durante Processo
**Probabilità: MOLTO BASSA (5%)**

Token scadono mentre il processo è in esecuzione (53 lead × 1s pausa = 53 secondi).

---

## 🛠️ COME RISOLVERE

### Step 1: Verifica Email nel Database

```bash
# Connetti al DB Cloudflare D1
wrangler d1 execute telemedcare-leads --command "
SELECT 
  COUNT(*) as total_leads,
  SUM(CASE WHEN email IS NULL OR email = '' THEN 1 ELSE 0 END) as email_missing,
  SUM(CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) as email_present
FROM leads
WHERE id IN (
  SELECT lead_id FROM lead_completion_tokens 
  WHERE completed = 0 AND expires_at > datetime('now')
)
"
```

### Step 2: Aggiungi Logging Dettagliato

**Modifica**: `src/modules/lead-completion.ts` → funzione `sendReminderEmail`

```typescript
export async function sendReminderEmail(...): Promise<boolean> {
  try {
    // ✅ AGGIUNGI QUESTO LOG
    if (!leadData.email || leadData.email === '') {
      console.warn(`⚠️ [REMINDER] Lead ${leadData.id}: email mancante o vuota`)
      return false
    }
    
    console.log(`📧 [REMINDER] Invio reminder a ${leadData.email} (lead ${leadData.id})`)
    
    // ... resto del codice
```

### Step 3: Gestisci Lead Senza Email

**Opzione A**: Skip automatico con log
```typescript
if (!leadData.email || leadData.email === '') {
  await logCompletionAction(
    db,
    leadData.id,
    tokenData.id,
    'REMINDER_SKIPPED',
    'Email mancante o vuota'
  )
  return false
}
```

**Opzione B**: Invia reminder via SMS (se telefono disponibile)
```typescript
if (!leadData.email && leadData.telefono) {
  // Usa servizio SMS per inviare reminder
  return await sendReminderSMS(...)
}
```

### Step 4: Configura Alert su Fallimenti

**Modifica**: `src/index.tsx` → endpoint `/api/cron/send-reminders`

```typescript
const result = await processReminders(db, env)

// ✅ AGGIUNGI ALERT SE TROPPI FALLIMENTI
if (result.total > 0 && result.failed / result.total > 0.5) {
  console.error(`🚨 [CRON] ALERT: ${result.failed}/${result.total} reminder falliti (${Math.round(result.failed/result.total*100)}%)`)
  
  // Opzionale: invia email di alert
  await sendAlertEmail(env, {
    subject: 'ALERT: Reminder fallimenti elevati',
    message: `${result.failed}/${result.total} reminder falliti`
  })
}
```

---

## 📋 FLUSSO COMPLETO REMINDER

### 1. Lead Incompleto Creato
```
Lead inserito manualmente o da HubSpot
→ email_workflow invia link completamento dati
→ crea token in lead_completion_tokens
→ reminder_count = 0
→ reminder_sent_at = NULL
```

### 2. Primo Reminder (dopo 3 giorni)
```
CRON ore 09:50 UTC
→ trova token con reminder_sent_at < now-3days
→ invia email reminder
→ UPDATE lead_completion_tokens SET 
    reminder_count = 1,
    reminder_sent_at = now
```

### 3. Secondo Reminder (dopo altri 3 giorni)
```
CRON ore 09:50 UTC
→ trova token con reminder_count < 2
→ invia secondo reminder
→ UPDATE reminder_count = 2
```

### 4. Nessun Altro Reminder
```
CRON ore 09:50 UTC
→ reminder_count = 2 (max raggiunto)
→ lead NON processato
→ token scade dopo 30 giorni
```

---

## 📊 METRICHE SISTEMA

### Cosa Viene Tracciato

1. **lead_completion_tokens** (tabella)
   - `reminder_count`: Numero reminder inviati
   - `reminder_sent_at`: Data ultimo reminder
   - `completed`: 0 = incompleto, 1 = completato
   - `expires_at`: Data scadenza token

2. **lead_completion_log** (tabella)
   - Tutte le azioni (CREATED, REMINDER_SENT, COMPLETED)
   - Dettagli e timestamp

3. **CRON Response** (JSON)
   ```json
   {
     "success": 2,  // Email inviate
     "failed": 51,  // Email fallite
     "total": 53    // Lead processati
   }
   ```

### Dashboard Metriche (da implementare)

**Query utili:**
```sql
-- Lead con reminder inviati ma non completati
SELECT l.id, l.nomeRichiedente, l.cognomeRichiedente, l.email,
       t.reminder_count, t.reminder_sent_at, t.expires_at
FROM leads l
JOIN lead_completion_tokens t ON l.id = t.lead_id
WHERE t.completed = 0
  AND t.reminder_count > 0
ORDER BY t.reminder_sent_at DESC

-- Tasso di completamento dopo reminder
SELECT 
  COUNT(*) as total_reminders,
  SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed,
  ROUND(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) as completion_rate
FROM lead_completion_tokens
WHERE reminder_count > 0
```

---

## ✅ CHECKLIST VERIFICA SISTEMA

- [x] ✅ CRON funziona (esegue ogni giorno alle 09:50 UTC)
- [x] ✅ Endpoint `/api/cron/send-reminders` risponde (HTTP 200)
- [x] ✅ Trova lead da processare (53 lead trovati)
- [ ] ❌ **Invio email fallisce nel 96% dei casi**
- [ ] ⏳ Da verificare: campo `email` nei lead
- [ ] ⏳ Da verificare: configurazione provider email
- [ ] ⏳ Da verificare: log dettagliati fallimenti

---

## 🚀 PROSSIMI STEP

### Priorità ALTA
1. **Verifica campo email nel database** (query SQL sopra)
2. **Aggiungi logging dettagliato** fallimenti email
3. **Configura alert** se fallimenti > 50%

### Priorità MEDIA
4. Implementa fallback SMS per lead senza email
5. Dashboard metriche reminder (tasso completamento)
6. Test manuale endpoint reminder con lead reale

### Priorità BASSA
7. Ottimizza template email reminder
8. A/B test subject email per aumentare aperture
9. Report settimanale reminder inviati/completati

---

## 📝 NOTE TECNICHE

### Endpoint
- **POST** `/api/cron/send-reminders` (usato da GitHub Action)
- **GET** `/api/cron/send-reminders` (test manuale)

### File Coinvolti
- `src/index.tsx` (endpoint CRON)
- `src/modules/lead-completion.ts` (logica reminder)
- `src/modules/email-service.ts` (invio email)
- `src/modules/template-loader-clean.ts` (caricamento template)
- `.github/workflows/reminder-cron.yml` (GitHub Action)

### Database
- **Tabella**: `lead_completion_tokens`
- **Tabella**: `lead_completion_log`
- **Tabella**: `system_config`
- **Tabella**: `email_templates`

---

## 🔗 LINK UTILI

- **Repository**: https://github.com/RobertoPoggi/telemedcare-v12
- **Live App**: https://telemedcare-v12.pages.dev
- **Ultimo Run**: https://github.com/RobertoPoggi/telemedcare-v12/actions/runs/21941764397
- **Cloudflare Logs**: Dashboard → Pages → telemedcare-v12 → Functions → Logs

---

**📌 CONCLUSIONE**

Il sistema di reminder **funziona tecnicamente** (CRON esegue, endpoint risponde, lead vengono trovati), ma **fallisce nell'invio email nel 96% dei casi**.

**Causa più probabile**: Lead nel database **senza email valida**.

**Azione immediata**: Eseguire query SQL per verificare campo `email` nei 53 lead che necessitano reminder.
