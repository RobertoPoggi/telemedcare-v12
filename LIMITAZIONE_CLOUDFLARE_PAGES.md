# ⚠️ LIMITAZIONE CRITICA: Cloudflare Pages e Database D1

## 🚨 PROBLEMA IDENTIFICATO

**Data**: 2026-03-03  
**Severity**: 🔴 ALTA  
**Impatto**: Database condiviso tra Production e Preview

---

## 📋 Situazione Attuale

### Configurazione Desiderata (❌ Non Funziona)

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "telemedcare-leads"
database_id = "e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f"

[[env.preview.d1_databases]]
binding = "DB"
database_name = "telemedcare-leads-test"
database_id = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
```

### Configurazione Reale (⚠️ Problematica)

```
Production:  c.env.DB → telemedcare-leads
Preview:     c.env.DB → telemedcare-leads (STESSO!)
```

**Cloudflare Pages IGNORA** `[[env.preview.d1_databases]]` e usa sempre il primo binding D1 trovato.

---

## 🔍 Conferma del Problema

### Screenshot Cloudflare Dashboard

![Cloudflare Bindings](https://www.genspark.ai/api/files/s/jZnCW3h2)

**Messaggio**:
```
"Bindings for this project are being managed through wrangler.toml"
```

**Binding Attivo**:
```
D1 database: DB → telemedcare-leads
```

### Test Pratico

```bash
# Production
curl https://telemedcare-v12.pages.dev/api/leads
# Risposta: ~250 lead reali

# Preview
curl https://test-environment.telemedcare-v12.pages.dev/api/leads
# Risposta: ~250 lead reali (STESSI!)
```

---

## ⚠️ RISCHI

### 1. Modifiche in Preview Toccano Produzione

```bash
# In preview environment
POST https://test-environment.telemedcare-v12.pages.dev/api/leads
{
  "nomeRichiedente": "Test User",
  "email": "test@example.com"
}

# 😱 Crea lead in DB PRODUZIONE!
# 😱 Lead fittizio appare in dashboard produzione!
```

### 2. Eliminazioni Accidentali

```bash
# In preview environment
DELETE https://test-environment.telemedcare-v12.pages.dev/api/leads/LEAD-REAL-123

# 😱 Elimina lead REALE da produzione!
```

### 3. Test Pagamenti

```bash
# In preview environment
POST https://test-environment.telemedcare-v12.pages.dev/api/payments
{
  "leadId": "LEAD-REAL-123",
  "amount": 1207.80
}

# 😱 Crea record pagamento fittizio per lead reale!
```

---

## 🛠️ SOLUZIONI

### Opzione 1: Cloudflare Workers (✅ Consigliato)

Migrare da **Cloudflare Pages** a **Cloudflare Workers** che supporta binding separati:

**Vantaggi**:
- ✅ Binding D1 diversi per ambiente
- ✅ Isolamento completo dati
- ✅ Configurazione nativa

**Svantaggi**:
- ❌ Richiede refactoring
- ❌ Deploy diverso (wrangler deploy invece di git push)
- ❌ Gestione statica diversa

**Configurazione Workers**:
```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "telemedcare-leads"
database_id = "e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f"

[env.preview]
[[env.preview.d1_databases]]
binding = "DB"
database_name = "telemedcare-leads-test"
database_id = "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
```

---

### Opzione 2: Query Parameter + Auth (⚠️ Meno Sicuro)

Aggiungere parametro `?test=true` con autenticazione:

```typescript
// src/middleware/database-selector.ts
export async function databaseSelector(c: Context, next: Next) {
  const isTest = c.req.query('test') === 'true';
  const authToken = c.req.header('Authorization');
  
  if (isTest) {
    // Verifica auth
    if (!authToken || authToken !== `Bearer ${c.env.TEST_SECRET_TOKEN}`) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Usa DB test
    // ⚠️ Richiede binding separato DB_TEST
  }
  
  await next();
}
```

**Vantaggi**:
- ✅ Facile da implementare
- ✅ Nessun refactoring deployment

**Svantaggi**:
- ❌ Richiede binding separato (stesso problema!)
- ❌ Rischio sicurezza (token leaked)
- ❌ Deve ricordare di passare `?test=true` sempre

---

### Opzione 3: Branch Protection + Workflow Manuale (✅ Soluzione Temporanea)

**Non testare su preview, solo su local!**

```bash
# 1. Sviluppo locale con DB test
cd /home/user/webapp
npx wrangler pages dev ./public --d1=DB:telemedcare-leads-test

# 2. Test completi in locale
# ...

# 3. SOLO dopo test completi, push a main
git checkout main
git merge feature-branch
git push origin main

# 4. Disabilitare preview deploy
# Cloudflare Dashboard → Settings → Builds & deployments
# Preview deployments: ❌ Disabled
```

**Vantaggi**:
- ✅ Nessun refactoring
- ✅ Zero rischio produzione (preview disabilitata)
- ✅ Test locale con DB test

**Svantaggi**:
- ❌ No preview URL per share
- ❌ Richiede setup locale (wrangler)
- ❌ Workflow più lento

---

### Opzione 4: Prefisso Tabelle (⚠️ Workaround)

Usare **stesso database** ma **tabelle diverse** per test:

```sql
-- Production
leads
contracts
proforma
payments

-- Test (stesso DB)
test_leads
test_contracts
test_proforma
test_payments
```

**Codice**:
```typescript
const tablePrefix = c.env.ENVIRONMENT === 'preview' ? 'test_' : '';
const query = `SELECT * FROM ${tablePrefix}leads`;
```

**Vantaggi**:
- ✅ Nessun binding aggiuntivo necessario
- ✅ Isolamento dati (stesso DB fisico)
- ✅ Preview URL funzionante

**Svantaggi**:
- ❌ Doppio schema da mantenere
- ❌ Query SQL più complesse
- ❌ Rischio query errate (dimenticare prefisso)

---

## 🎯 RACCOMANDAZIONE

### Soluzione Immediata (Oggi)

**Opzione 3**: Disabilitare preview deploy su Cloudflare Pages.

1. Dashboard → Workers & Pages → telemedcare-v12 → Settings
2. Builds & deployments → **Preview deployments: OFF**
3. Test SOLO in locale con `wrangler pages dev`

### Soluzione a Lungo Termine (Prossima Settimana)

**Opzione 1**: Migrare a Cloudflare Workers.

**Pianificazione**:
1. Creare nuovo Worker `telemedcare-v12-worker`
2. Configurare binding D1 separati
3. Migrare codice (minime modifiche)
4. Testare deploy
5. Switch DNS da Pages a Workers

**Tempo stimato**: 2-4 ore

---

## 📊 Confronto Soluzioni

| Opzione | Isolamento | Complessità | Rischio | Costo | Consigliata |
|---------|------------|-------------|---------|-------|-------------|
| **Workers** | ✅ Totale | 🟡 Media | 🟢 Basso | € Uguale | ✅ Sì (long-term) |
| **Query Param** | ⚠️ Parziale | 🟡 Media | 🔴 Alto | € Uguale | ❌ No |
| **Branch Protection** | ✅ Totale | 🟢 Bassa | 🟢 Basso | € Uguale | ✅ Sì (short-term) |
| **Prefisso Tabelle** | ✅ Buono | 🔴 Alta | 🟡 Medio | € Uguale | ⚠️ Forse |

---

## ✅ AZIONI IMMEDIATE

### 1. Disabilita Preview Deploy (5 min)

```
Cloudflare Dashboard
→ Workers & Pages
→ telemedcare-v12
→ Settings
→ Builds & deployments
→ Preview deployments: OFF
→ Save
```

### 2. Aggiorna Documentazione (Fatto)

- [x] Creato `LIMITAZIONE_CLOUDFLARE_PAGES.md`
- [x] Aggiornato README per warning
- [ ] Notificare team

### 3. Setup Locale Test (10 min)

```bash
# Install wrangler
npm install -g wrangler

# Login
wrangler login

# Crea DB test locale
wrangler d1 create telemedcare-leads-test

# Test locale con DB test
wrangler pages dev ./public --d1=DB:telemedcare-leads-test
```

### 4. Pianificare Migrazione Workers

- [ ] Studiare documentazione Cloudflare Workers
- [ ] Creare branch `migration-workers`
- [ ] Testare setup basico
- [ ] Documentare processo migrazione

---

## 📚 Risorse

- [Cloudflare Pages Limitations](https://developers.cloudflare.com/pages/platform/limits/)
- [Cloudflare Workers D1 Bindings](https://developers.cloudflare.com/d1/platform/bindings/)
- [Wrangler Configuration](https://developers.cloudflare.com/workers/wrangler/configuration/)

---

## 🎯 Stato

- ❌ **Preview deploy ATTIVO** (RISCHIO!)
- ⚠️ **Database condiviso** (CRITICO!)
- ✅ **Documentazione creata**
- ⏳ **Soluzione in pianificazione**

---

**Creato**: 2026-03-03  
**Ultimo aggiornamento**: 2026-03-03  
**Priority**: 🔴 **CRITICA**  
**Azione richiesta**: Disabilitare preview deploy SUBITO
