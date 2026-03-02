# 📅 PERIODICITÀ REMINDER - TeleMedCare V12

## 🔔 SISTEMI DI REMINDER ATTIVI

### 1. **REMINDER COMPLETAMENTO DATI** ✅ Implementato

#### **Trigger**: Lead con dati incompleti (senza telefono, dati assistito, ecc.)

#### **Periodicità**:
- **Primo invio**: Immediatamente dopo creazione lead (quando riceve il link)
- **Reminder automatici**: Ogni **3 giorni** (configurabile: `auto_completion_reminder_days`)
- **Numero massimo reminder**: **2 reminder** (configurabile: `auto_completion_max_reminders`)
- **Validità link**: **30 giorni** (configurabile: `auto_completion_token_days`)

#### **Protezione anti-duplicati**:
- **23 ore** tra un reminder e l'altro (protezione minima)
- **GitHub Action**: Esegue alle **09:50 UTC** (10:50 Italia) ogni giorno
- **Limite giornaliero**: **30 email/giorno** (protezione budget)

#### **Configurazione Sistema**:
```typescript
// src/modules/lead-completion.ts (linea 165-166)
{
  auto_completion_reminder_days: 3,      // Ogni 3 giorni
  auto_completion_max_reminders: 2,      // Max 2 reminder
  auto_completion_token_days: 30,        // Link valido 30 giorni
  cron_enabled: true                     // ON/OFF dalla dashboard
}
```

#### **Esempio Timeline**:
```
Giorno 0:  Lead creato → Email iniziale con link
Giorno 3:  Reminder #1 (se dati non completati)
Giorno 6:  Reminder #2 (se dati non completati)
Giorno 30: Link scaduto (lead non riceve più reminder)
```

---

### 2. **REMINDER FIRMA CONTRATTO** ❌ Non Implementato

#### **Stato**: ⚠️ **NON ESISTE UN SISTEMA AUTOMATICO**

#### **Situazione Attuale**:
- ✅ **Email contratto inviata**: Quando il lead completa i dati e genera il contratto
- ❌ **Nessun reminder automatico**: Se il lead non firma, NON riceve solleciti automatici
- 📞 **Follow-up manuale**: L'operatore deve ricontattare manualmente il lead

#### **Necessità Implementazione**:
```typescript
// 🔧 DA IMPLEMENTARE
{
  contract_reminder_days: 5,          // Ogni 5 giorni
  contract_max_reminders: 3,          // Max 3 reminder
  contract_validity_days: 30          // Contratto valido 30 giorni
}
```

#### **Timeline Proposta** (da implementare):
```
Giorno 0:  Contratto inviato via email
Giorno 5:  Reminder #1 firma contratto
Giorno 10: Reminder #2 firma contratto
Giorno 15: Reminder #3 firma contratto (ultimo)
Giorno 30: Contratto scaduto → Lead passa a "NON INTERESSATO"?
```

---

### 3. **REMINDER PAGAMENTO PROFORMA** ❌ Non Implementato

#### **Stato**: ⚠️ **NON ESISTE UN SISTEMA AUTOMATICO**

#### **Situazione Attuale**:
- ✅ **Email proforma inviata**: Quando il contratto è firmato
- ❌ **Nessun reminder automatico**: Se il lead non paga, NON riceve solleciti automatici
- 📞 **Follow-up manuale**: L'operatore deve contattare manualmente per sollecitare pagamento

#### **Necessità Implementazione**:
```typescript
// 🔧 DA IMPLEMENTARE
{
  proforma_reminder_days: 3,          // Ogni 3 giorni (scadenza 3 giorni)
  proforma_max_reminders: 4,          // Max 4 reminder (più urgente)
  proforma_validity_days: 3           // Proforma valida 3 giorni
}
```

#### **Timeline Proposta** (da implementare):
```
Giorno 0:  Proforma inviata (scadenza 3 giorni)
Giorno 1:  Reminder #1 pagamento (urgente)
Giorno 2:  Reminder #2 pagamento (scade domani)
Giorno 3:  Reminder #3 pagamento (ULTIMO GIORNO)
Giorno 4+: Proforma scaduta → Generare nuova proforma?
```

---

## 📊 RIEPILOGO TABELLA

| **Tipo Reminder** | **Periodicità** | **Max Reminder** | **Validità** | **Stato** |
|------------------|----------------|-----------------|-------------|----------|
| **Completamento Dati** | Ogni **3 giorni** | **2 reminder** | **30 giorni** | ✅ Attivo |
| **Firma Contratto** | ⚠️ Non definita | ⚠️ Non definito | ⚠️ Non definita | ❌ Da implementare |
| **Pagamento Proforma** | ⚠️ Non definita | ⚠️ Non definito | **3 giorni** | ❌ Da implementare |

---

## 🔧 DETTAGLI TECNICI

### **Database Schema** (già esistente)

#### **Tabella: `lead_completion_tokens`**
```sql
CREATE TABLE lead_completion_tokens (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  token TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  completed_at TEXT,
  reminder_sent_at TEXT,            -- Data ultimo reminder inviato
  reminder_count INTEGER DEFAULT 0  -- Numero reminder inviati
);
```

#### **Tabella: `system_config`** (configurazione)
```sql
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Valori attuali:
-- auto_completion_enabled = true/false
-- auto_completion_token_days = 30
-- auto_completion_reminder_days = 3
-- auto_completion_max_reminders = 2
-- cron_enabled = true/false
```

---

### **GitHub Action** (reminder completamento dati)

**Workflow**: `Lead Completion Reminders`  
**Schedule**: `0 9 50 * * *` (09:50 UTC = 10:50 Italia)  
**Endpoint**: `POST /api/cron/send-reminders`

**Log Run** (esempio):
```json
{
  "success": true,
  "message": "Processo reminder completato",
  "stats": {
    "success": 28,
    "failed": 2,
    "total": 30,
    "queued": 167,
    "blacklisted": 13
  }
}
```

---

## 🚀 IMPLEMENTAZIONE REMINDER MANCANTI

### **Step 1: Estendi Database Schema**

```sql
-- Aggiungi campi per reminder contratto
ALTER TABLE contracts ADD COLUMN reminder_sent_at TEXT;
ALTER TABLE contracts ADD COLUMN reminder_count INTEGER DEFAULT 0;

-- Aggiungi campi per reminder proforma
ALTER TABLE proforma ADD COLUMN reminder_sent_at TEXT;
ALTER TABLE proforma ADD COLUMN reminder_count INTEGER DEFAULT 0;

-- Aggiungi configurazione sistema
INSERT INTO system_config (key, value) VALUES
  ('contract_reminder_days', '5'),
  ('contract_max_reminders', '3'),
  ('contract_validity_days', '30'),
  ('proforma_reminder_days', '3'),
  ('proforma_max_reminders', '4'),
  ('proforma_validity_days', '3');
```

### **Step 2: Crea Funzioni Reminder**

```typescript
// src/modules/contract-reminders.ts (nuovo file)

export async function getContractsNeedingReminder(
  db: D1Database,
  reminderDays: number,
  maxReminders: number
): Promise<Contract[]> {
  const reminderDate = new Date()
  reminderDate.setDate(reminderDate.getDate() - reminderDays)
  
  const result = await db.prepare(`
    SELECT c.*, l.email, l.nome, l.cognome
    FROM contracts c
    JOIN leads l ON c.lead_id = l.id
    WHERE c.signed = 0
      AND c.sent_at IS NOT NULL
      AND c.reminder_count < ?
      AND (
        c.reminder_sent_at IS NULL
        OR c.reminder_sent_at < ?
      )
      AND datetime(c.sent_at, '+30 days') > datetime('now')
    ORDER BY c.sent_at ASC
    LIMIT 30
  `).bind(maxReminders, reminderDate.toISOString()).all()
  
  return result.results as Contract[]
}

export async function sendContractReminder(
  db: D1Database,
  env: any,
  contract: Contract
): Promise<boolean> {
  // Invia email reminder firma contratto
  // Usa template 'email_reminder_firma_contratto'
  // ...
  
  // Aggiorna reminder_count
  await db.prepare(`
    UPDATE contracts
    SET reminder_sent_at = datetime('now'),
        reminder_count = reminder_count + 1
    WHERE id = ?
  `).bind(contract.id).run()
  
  return true
}
```

### **Step 3: Aggiungi Endpoint API**

```typescript
// src/index.tsx

app.post('/api/cron/send-contract-reminders', async (c) => {
  const db = c.env.DB
  const config = await getSystemConfig(db)
  
  const contracts = await getContractsNeedingReminder(
    db,
    config.contract_reminder_days,
    config.contract_max_reminders
  )
  
  let success = 0, failed = 0
  
  for (const contract of contracts) {
    try {
      await sendContractReminder(db, c.env, contract)
      success++
    } catch (error) {
      failed++
    }
  }
  
  return c.json({ success, failed, total: success + failed })
})
```

### **Step 4: Aggiungi GitHub Action**

```yaml
# .github/workflows/contract-reminders.yml

name: Contract Reminders
on:
  schedule:
    - cron: '0 10 * * *'  # 10:00 UTC = 11:00 Italia
  workflow_dispatch:

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - name: Send Contract Reminders
        run: |
          curl -X POST https://telemedcare-v12.pages.dev/api/cron/send-contract-reminders \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## ✅ CHECKLIST IMPLEMENTAZIONE

### **Reminder Firma Contratto**:
- [ ] Estendi schema DB (`contracts` table)
- [ ] Crea modulo `contract-reminders.ts`
- [ ] Aggiungi template email `email_reminder_firma_contratto`
- [ ] Aggiungi endpoint `/api/cron/send-contract-reminders`
- [ ] Crea GitHub Action workflow
- [ ] Aggiungi switch ON/OFF in dashboard operativa
- [ ] Test completo E2E

### **Reminder Pagamento Proforma**:
- [ ] Estendi schema DB (`proforma` table)
- [ ] Crea modulo `proforma-reminders.ts`
- [ ] Aggiungi template email `email_reminder_pagamento_proforma`
- [ ] Aggiungi endpoint `/api/cron/send-proforma-reminders`
- [ ] Crea GitHub Action workflow
- [ ] Aggiungi switch ON/OFF in dashboard operativa
- [ ] Test completo E2E

---

## 🎯 PRIORITÀ IMPLEMENTAZIONE

### **Alta Priorità** 🔴:
1. **Reminder Pagamento Proforma** (urgente, proforma scade in 3 giorni)
   - Timeline breve (3 giorni)
   - Critico per flusso di cassa

### **Media Priorità** 🟡:
2. **Reminder Firma Contratto** (importante)
   - Timeline più lunga (30 giorni)
   - Importante per conversione lead

### **Bassa Priorità** 🟢:
3. **Ottimizzazione Reminder Completamento Dati** (già funzionante)
   - Sistema già attivo
   - Eventualmente aumentare `max_reminders` da 2 a 3

---

## 📞 CONTATTI & SUPPORTO

- **Documentazione**: `REMINDER-PERIODICITA.md` (questo file)
- **GitHub Issue**: https://github.com/RobertoPoggi/telemedcare-v12/issues/13
- **Repository**: https://github.com/RobertoPoggi/telemedcare-v12

---

**Conclusione**: Attualmente solo il **reminder completamento dati** è implementato (ogni 3 giorni, max 2 reminder). I **reminder firma contratto** e **pagamento proforma** sono **da implementare**.

