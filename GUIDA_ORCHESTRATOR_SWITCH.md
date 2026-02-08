# 🔧 GUIDA: Gestione Orchestrator Switch

## Come controllare lo switch orchestrator

### 1. Via Wrangler CLI (se configurato)

```bash
# Leggi il valore corrente
npx wrangler d1 execute telemedcare-leads --remote \
  --command "SELECT key, value FROM settings WHERE key = 'workflow_emails'"

# Output atteso:
# key             | value
# workflow_emails | {"email_notifica_info":true,"email_completamento_dati":false,...}
```

### 2. Via API (da browser o Postman)

```bash
# Leggi tutti i settings
curl https://telemedcare-v12.pages.dev/api/settings

# Cerca la chiave 'workflow_emails' nel JSON response
```

### 3. Via SQL diretta (Cloudflare Dashboard)

1. Vai su Cloudflare Dashboard
2. D1 Databases → telemedcare-leads
3. Console SQL
4. Esegui query:

```sql
SELECT key, value, updated_at 
FROM settings 
WHERE key = 'workflow_emails';
```

---

## 🔄 COME MODIFICARE L'ORCHESTRATOR SWITCH

### Opzione A: Via SQL (Consigliato per test)

```sql
-- Abilita tutti gli switch workflow
UPDATE settings 
SET value = '{"email_notifica_info":true,"email_completamento_dati":true,"email_reminder_firma":true,"email_promemoria_pagamento":true}',
    updated_at = datetime('now')
WHERE key = 'workflow_emails';

-- Verifica
SELECT value FROM settings WHERE key = 'workflow_emails';
```

### Opzione B: Via Codice (Creare endpoint API)

Posso creare un endpoint `/api/settings/workflow-emails` per gestirlo via dashboard.

---

## ⚠️ STATO ATTUALE

**Dopo l'ultimo fix (commit a8e4d02)**:

Il sistema ora usa **logica OR**:
```typescript
if (workflow_switch.email_completamento_dati || dashboard_switch.lead_email_notifications_enabled) {
  // Invia email
}
```

**Significa**:
- Se **almeno uno** dei due switch è ON → email viene inviata ✅
- Se **entrambi** sono OFF → email NON viene inviata ❌

---

## 🎯 RACCOMANDAZIONE

### Soluzione A: Usa solo Dashboard Switch (Semplice)

**Cosa fare**: Niente! Il fix già fatto fa sì che il tuo switch dashboard funzioni.

**Pro**:
- Usi solo l'interfaccia dashboard che conosci
- Tutto gestito visivamente
- Nessuna query SQL necessaria

**Contro**:
- Ci sono due sistemi paralleli (può confondere)

---

### Soluzione B: Allinea Orchestrator Switch (Pulizia)

**Cosa fare**: Imposta orchestrator switch a ON via SQL:

```sql
UPDATE settings 
SET value = '{"email_notifica_info":true,"email_completamento_dati":true,"email_reminder_firma":true,"email_promemoria_pagamento":true}'
WHERE key = 'workflow_emails';
```

**Pro**:
- Entrambi i sistemi dicono ON
- Più chiaro e consistente

**Contro**:
- Richiede query SQL manuale

---

### Soluzione C: Creo Dashboard per Orchestrator (Completo)

**Cosa fare**: Posso creare una sezione dashboard "Impostazioni Workflow Avanzate" con toggle per:
- ✅ Email notifica info@
- ✅ Email completamento dati
- ✅ Email reminder firma
- ✅ Email promemoria pagamento

**Pro**:
- Tutto gestibile da dashboard
- Interfaccia grafica completa
- Nessuna confusione

**Contro**:
- Richiede sviluppo aggiuntivo
- Più complessità nell'UI

---

## 💡 COSA TI CONSIGLIO

**Per ora**: **Usa la Soluzione A** (quella già attiva).

Il fix che ho fatto garantisce che il tuo switch dashboard funzioni correttamente.

**Se vuoi pulizia completa**: Esegui questa query SQL in Cloudflare:

```sql
UPDATE settings 
SET value = '{"email_notifica_info":true,"email_completamento_dati":true,"email_reminder_firma":false,"email_promemoria_pagamento":false}'
WHERE key = 'workflow_emails';
```

Questo allinea l'orchestrator switch con i tuoi settings dashboard.

---

## 🔍 VERIFICA STATO CORRENTE

Per vedere lo stato attuale del tuo orchestrator switch:

```bash
curl -s https://telemedcare-v12.pages.dev/api/settings | jq '.settings.workflow_emails'
```

Oppure vai su Cloudflare D1 Console e esegui:
```sql
SELECT value FROM settings WHERE key = 'workflow_emails';
```

---

**Vuoi che esegua la query per allineare i due sistemi oppure preferisci lasciare così?**
