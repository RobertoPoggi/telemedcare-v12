# 🧪 TEST EMAIL COMPLETAMENTO DATI - GUIDA

**Data**: 2026-02-08  
**Commit**: c82b940  
**Status**: ✅ **PRONTO PER TEST**

---

## 📋 PREPARAZIONE TEST

### 1. Accendi lo Switch "Email Automatiche Lead"

Vai su Dashboard Operativa → Impostazioni Sistema → **Email Automatiche Lead** → **Imposta su ON**

Oppure via API:
```bash
curl -X PUT https://telemedcare-v12.pages.dev/api/settings/lead_email_notifications_enabled \
  -H "Content-Type: application/json" \
  -d '{"value": "true"}'
```

### 2. Verifica Switch Attivi

Controlla che entrambi gli switch siano ON:
- ✅ **Notifiche Email Admin** = ON (per email a info@)
- ✅ **Email Automatiche Lead** = ON (per email al lead)

---

## 🎯 COSA TESTEREMO

Quando elimini e re-importi un lead (es: Ressa Rosaria), il sistema dovrebbe inviare **DUE EMAIL**:

### Email 1: Notifica Admin
- **A**: info@ecura.it
- **Template**: NOTIFICA_INFO (blu professionale)
- **Contenuto**: Dati lead completi
- **Scopo**: Avvisare operatore

### Email 2: Completamento Dati Lead
- **A**: Email del lead (es: ressa.rosaria@email.com)
- **Template**: EMAIL_DOCUMENTI_INFORMATIVI
- **Contenuto**: 
  - Benvenuto
  - Link completamento dati mancanti
  - Brochure e manuale eCura
- **Scopo**: Chiedere al lead di completare i dati mancanti

---

## 🔄 PROCEDURA TEST

### Step 1: Elimina Lead di Test
```sql
DELETE FROM leads WHERE id = 'LEAD-IRBEMA-00159';
-- (Usa l'ID di Ressa Rosaria)
```

### Step 2: Aspetta Auto-Import
- L'auto-import avviene ad ogni refresh della dashboard
- Oppure aspetta qualche minuto

### Step 3: Controlla Email
1. **Controlla info@ecura.it**:
   - Dovresti ricevere email con template blu (NOTIFICA_INFO)
   
2. **Controlla email del lead** (es: ressa.rosaria@...):
   - Dovresti ricevere email con link completamento dati
   - Email include brochure e manuale

---

## 📊 LOG ATTESI

### Log Auto-Import (Cloudflare Dashboard)

```
🔄 [AUTO-IMPORT] Inizio import incrementale ultimi 1 giorno...
✅ [AUTO-IMPORT] Lead creato: LEAD-IRBEMA-00169 from HubSpot xxx
🔔 [AUTO-IMPORT] >>> INIZIO BLOCCO EMAIL <<<

📧 [AUTO-IMPORT] Invio email notifica tramite sendNewLeadNotification...
🔔 [NOTIFICATION] Inizio invio notifica per lead LEAD-IRBEMA-00169
🔔 [NOTIFICATION] Switch value: true
✅ [NOTIFICATION] Switch attivo, procedo con invio email
📧 [NOTIFICATION] Invio email a info@ecura.it...
✅ [NOTIFICATION] Email result: { success: true, messageId: "..." }
✅ [AUTO-IMPORT] Email notifica admin inviata con successo

📧 [AUTO-IMPORT] Invio email completamento dati al lead ressa.rosaria@...
✅ [AUTO-IMPORT] Email completamento dati inviata con successo

🔔 [AUTO-IMPORT] >>> FINE BLOCCO EMAIL <<<
```

---

## ✅ CRITERI SUCCESSO TEST

### Test PASSATO se:
1. ✅ Email admin arriva a info@ecura.it
2. ✅ Email admin usa template ufficiale (blu)
3. ✅ Email lead arriva all'indirizzo del lead
4. ✅ Email lead contiene link completamento dati
5. ✅ Email lead include brochure e manuale
6. ✅ Nessun errore nei log

### Test FALLITO se:
1. ❌ Non arriva nessuna email
2. ❌ Arriva solo email admin (manca email lead)
3. ❌ Email lead non ha link completamento
4. ❌ Errori nei log Cloudflare

---

## 🔍 TROUBLESHOOTING

### Email Admin Non Arriva
- Verifica switch: `admin_email_notifications_enabled = true`
- Controlla spam
- Verifica log: cercare "Email notifica admin inviata"

### Email Lead Non Arriva
- **Verifica switch**: `lead_email_notifications_enabled = true` ⚠️
- Verifica che lead abbia email valida
- Controlla log: cercare "Email completamento dati inviata"
- Verifica spam

### Entrambe Non Arrivano
- Problema API keys Resend
- Verifica log per errori "DEMO MODE"

---

## 📝 COSA ANNOTARE

Durante il test, annota:

1. **Ora test**: ___________
2. **Lead ID**: LEAD-IRBEMA-_____
3. **Email admin**: ☐ Arrivata  ☐ Non arrivata
4. **Template admin**: ☐ Blu ufficiale  ☐ Altro
5. **Email lead**: ☐ Arrivata  ☐ Non arrivata
6. **Link completamento**: ☐ Presente  ☐ Assente
7. **Brochure/Manuale**: ☐ Inclusi  ☐ Assenti
8. **Errori log**: ☐ Nessuno  ☐ Presenti (specificare)

---

## 🎯 DOPO IL TEST

Se tutto funziona:
- ✅ Email admin: OK
- ✅ Email lead: OK
- ✅ Prossimo step: Implementare email contratto automatico dopo completamento dati

Se ci sono problemi:
- Condividi log Cloudflare
- Indica quale email non arriva
- Verifica configurazione switch

---

## 🚀 FLUSSO COMPLETO (DOPO IL TEST)

Se il test ha successo, ecco il flusso completo che avremo:

```
1. Lead compila form su ecura.it
   ↓
2. Lead salvato in HubSpot
   ↓
3. Auto-import TeleMedCare
   ↓
4. 📧 Email notifica a info@ (se switch ON)
   ↓
5. 📧 Email completamento dati al lead (se switch ON)
   ↓
6. Lead completa dati mancanti
   ↓
7. 📧 Email contratto automatico (TODO)
   ↓
8. Lead firma contratto
   ↓
9. Workflow pagamento, configurazione, dispositivo...
```

---

**Status**: ✅ **CODICE DEPLOYATO - PRONTO PER TEST**

**Quando sei pronto**: Accendi lo switch e elimina un lead per testare! 🎯
