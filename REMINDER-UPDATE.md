# 🔔 AGGIORNAMENTO PERIODICITÀ REMINDER - TeleMedCare V12

**Data**: 2026-03-02  
**Commit**: Implementazione nuove periodicità

---

## 📊 NUOVE PERIODICITÀ IMPLEMENTATE

| **Tipo Reminder** | **Periodicità Vecchia** | **Periodicità NUOVA** | **Max Reminder** | **Validità** | **Stato** |
|------------------|------------------------|----------------------|-----------------|-------------|----------|
| **Completamento Dati** | Ogni 3 giorni | **Ogni 7 giorni** ✅ | 2 reminder | 30 giorni | ✅ **MODIFICATO** |
| **Firma Contratto** | ❌ Non implementato | **Ogni 4 giorni** ✅ | 3 reminder | 30 giorni | ✅ **NUOVO** |
| **Pagamento Proforma** | ❌ Non implementato | **Ogni 2 giorni** ✅ | 4 reminder | 3 giorni | ✅ **NUOVO** |
| **Form Configurazione** | ❌ Non implementato | **Ogni 1 giorno** ✅ | 5 reminder | 14 giorni | ✅ **NUOVO** |

---

## 🚀 FILE CREATI/MODIFICATI

### **Moduli Creati**:
1. ✅ `src/modules/contract-reminders.ts` (reminder firma contratto)
2. ✅ `src/modules/proforma-reminders.ts` (reminder pagamento proforma)
3. ✅ `src/modules/configuration-reminders.ts` (reminder form configurazione)

### **File Modificati**:
1. ✅ `src/modules/lead-completion.ts` (periodicità 3→7 giorni)

---

## 📅 TIMELINE DETTAGLIATE

### 1. **Reminder Completamento Dati** (Ogni 7 giorni)
```
Giorno 0:  Lead creato → Email iniziale con link
Giorno 7:  Reminder #1 📧
Giorno 14: Reminder #2 📧 (ultimo)
Giorno 30: Link scaduto ❌
```
**Configurazione**:
- Periodicità: 7 giorni
- Max reminder: 2
- Validità link: 30 giorni
- Limite giornaliero: 30 email

---

### 2. **Reminder Firma Contratto** (Ogni 4 giorni) - NUOVO ✨
```
Giorno 0:  Contratto inviato 📧
Giorno 4:  Reminder #1 📧
Giorno 8:  Reminder #2 📧
Giorno 12: Reminder #3 📧 (ultimo)
Giorno 30: Contratto scaduto ❌
```
**Configurazione**:
- Periodicità: 4 giorni
- Max reminder: 3
- Validità contratto: 30 giorni
- Limite giornaliero: 30 email

**Modulo**: `src/modules/contract-reminders.ts`

---

### 3. **Reminder Pagamento Proforma** (Ogni 2 giorni) - NUOVO ✨
```
Giorno 0: Proforma inviata (scadenza 3 giorni) 📧
Giorno 1: Reminder #1 📧 URGENTE
Giorno 2: Reminder #2 📧 SCADE DOMANI
Giorno 3: Reminder #3 📧 ULTIMO GIORNO
Giorno 3+: Proforma scaduta ❌
```
**Configurazione**:
- Periodicità: 2 giorni
- Max reminder: 4
- Validità proforma: 3 giorni
- Limite giornaliero: 30 email

**Subject dinamico**: 
- Se scade oggi/domani: `URGENTE: Scade OGGI/DOMANI - Proforma XXX`
- Altrimenti: `Reminder: Pagamento Proforma XXX`

**Modulo**: `src/modules/proforma-reminders.ts`

---

### 4. **Reminder Form Configurazione** (Ogni 1 giorno - GIORNALIERO) - NUOVO ✨
```
Giorno 0:  Contratto firmato → Form configurazione inviato 📧
Giorno 1:  Reminder #1 📧 GIORNALIERO
Giorno 2:  Reminder #2 📧 GIORNALIERO
Giorno 3:  Reminder #3 📧 GIORNALIERO
...
Giorno 14: Form configurazione scaduto ❌
```
**Configurazione**:
- Periodicità: 1 giorno (GIORNALIERO)
- Max reminder: 5
- Validità form: 14 giorni
- Limite giornaliero: 30 email

**Subject**: `Reminder Giornaliero: Completa Configurazione per [Nome Assistito]`

**Modulo**: `src/modules/configuration-reminders.ts`

---

## 🔧 IMPLEMENTAZIONE TECNICA

### **Protezioni Comuni**:
- ✅ **Anti-duplicati**: 23 ore minime tra un reminder e l'altro
- ✅ **Limite giornaliero**: 30 email/giorno per ogni tipo di reminder
- ✅ **Esclusioni automatiche**: Lead con status `NOT_INTERESTED` o `ACTIVE`
- ✅ **Pausa tra invii**: 1 secondo tra un'email e l'altra

### **Database Schema** (da aggiungere):
```sql
-- Aggiungi campi reminder a tabella contracts
ALTER TABLE contracts ADD COLUMN reminder_sent_at TEXT;
ALTER TABLE contracts ADD COLUMN reminder_count INTEGER DEFAULT 0;
ALTER TABLE contracts ADD COLUMN configuration_completed INTEGER DEFAULT 0;
ALTER TABLE contracts ADD COLUMN configuration_reminder_sent_at TEXT;
ALTER TABLE contracts ADD COLUMN configuration_reminder_count INTEGER DEFAULT 0;

-- Aggiungi campi reminder a tabella proforma
ALTER TABLE proforma ADD COLUMN reminder_sent_at TEXT;
ALTER TABLE proforma ADD COLUMN reminder_count INTEGER DEFAULT 0;
```

### **Template Email (da creare in DB)**:
1. `email_reminder_firma_contratto` (reminder contratto)
2. `email_reminder_pagamento_proforma` (reminder proforma)
3. `email_reminder_compilazione_configurazione` (reminder form)

---

## 📊 IMPATTO BUDGET EMAIL

### **⚠️ LIMITE CORRETTO: 30 EMAIL TOTALI/GIORNO**

**Budget disponibile**: 30 email/giorno (TOTALI, non per tipo!)

### **Allocazione Budget per Priorità**:

| **Tipo Reminder** | **Priorità** | **Email/Giorno** | **% Budget** |
|------------------|-------------|-----------------|--------------|
| **Pagamento Proforma** | 🔴 ALTA | 5 email | 16.7% |
| **Completamento Dati** | 🟡 MEDIA | 10 email | 33.3% |
| **Firma Contratto** | 🟡 MEDIA | 10 email | 33.3% |
| **Form Configurazione** | 🟢 BASSA | 5 email | 16.7% |
| **TOTALE** | | **30 email** | **100%** |

### **Logica di Priorità**:
1. **Proforma** (5 email): ALTA priorità - pagamenti urgenti (scadenza 3 giorni)
2. **Completamento Dati** (10 email): MEDIA priorità - acquisizione lead
3. **Firma Contratto** (10 email): MEDIA priorità - conversione lead
4. **Form Configurazione** (5 email): BASSA priorità - onboarding assistito

### **Tempo di Copertura**:
- Se 100 lead in coda per tipo:
  - Proforma: 100 / 5 = **20 giorni**
  - Completamento Dati: 100 / 10 = **10 giorni**
  - Firma Contratto: 100 / 10 = **10 giorni**
  - Form Configurazione: 100 / 5 = **20 giorni**

---

## 🔜 NEXT STEPS

### **Step 1: Aggiorna Database Schema** ⚠️ MANUALE
Esegui query SQL su Cloudflare D1:
```sql
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS reminder_sent_at TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS configuration_completed INTEGER DEFAULT 0;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS configuration_reminder_sent_at TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS configuration_reminder_count INTEGER DEFAULT 0;

ALTER TABLE proforma ADD COLUMN IF NOT EXISTS reminder_sent_at TEXT;
ALTER TABLE proforma ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;
```

### **Step 2: Crea Template Email** ⚠️ MANUALE
Inserisci i 3 template nel database tramite dashboard operativa.

### **Step 3: Aggiungi Endpoint API** (da fare)
```typescript
// src/index.tsx

app.post('/api/cron/send-contract-reminders', async (c) => {
  const { processContractReminders } = await import('./modules/contract-reminders')
  const result = await processContractReminders(c.env.DB, c.env)
  return c.json(result)
})

app.post('/api/cron/send-proforma-reminders', async (c) => {
  const { processProformaReminders } = await import('./modules/proforma-reminders')
  const result = await processProformaReminders(c.env.DB, c.env)
  return c.json(result)
})

app.post('/api/cron/send-configuration-reminders', async (c) => {
  const { processConfigurationReminders } = await import('./modules/configuration-reminders')
  const result = await processConfigurationReminders(c.env.DB, c.env)
  return c.json(result)
})
```

### **Step 4: Crea GitHub Actions** (da fare)
File da creare in `.github/workflows/`:
- `contract-reminders.yml` (schedule: 11:00 UTC)
- `proforma-reminders.yml` (schedule: 12:00 UTC)
- `configuration-reminders.yml` (schedule: 13:00 UTC)

### **Step 5: Aggiungi Switch in Dashboard** (da fare)
Aggiungere toggle ON/OFF per ogni tipo di reminder.

---

## ✅ CHECKLIST COMPLETAMENTO

- [x] Modulo `contract-reminders.ts` creato
- [x] Modulo `proforma-reminders.ts` creato
- [x] Modulo `configuration-reminders.ts` creato
- [x] Periodicità reminder completamento dati modificata (3→7 giorni)
- [x] Build completato con successo
- [ ] ⏳ Database schema aggiornato (manuale)
- [ ] ⏳ Template email creati (manuale)
- [ ] ⏳ Endpoint API aggiunti in `src/index.tsx`
- [ ] ⏳ GitHub Actions creati
- [ ] ⏳ Switch dashboard operativa aggiunti
- [ ] ⏳ Test E2E completo

---

## 📞 SUPPORTO

- **Documentazione**: `REMINDER-UPDATE.md` (questo file)
- **GitHub Issue**: https://github.com/RobertoPoggi/telemedcare-v12/issues/13
- **Repository**: https://github.com/RobertoPoggi/telemedcare-v12

