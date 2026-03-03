# ⚡ AZIONI IMMEDIATE - Cosa Fare Ora

## 🎯 Obiettivo

Completare la configurazione dell'ambiente di test e testare i fix applicati sul lead LEAD-IRBEMA-00258.

---

## ✅ Fix Già Applicati (Deploy Completato)

Tutti i seguenti fix sono stati deployati su **produzione** (branch `main`):

1. ✅ **Mix intestatario/assistito** - Risolto
2. ✅ **Provincia non salvata** - Risolto  
3. ✅ **Nome "N/A"** - Risolto
4. ✅ **Indirizzo spedizione** - Risolto
5. ✅ **Email proforma importi** - Risolto
6. ✅ **Template nascita richiedente** - Risolto

**URL produzione**: https://telemedcare-v12.pages.dev  
**Ultimo commit**: `4a684dc`

---

## 🚀 STEP 1: Correggi DB Produzione (2 minuti)

### Problema

Il lead `LEAD-IRBEMA-00258` ha `provinciaIntestatario = NULL` nel database.

### Soluzione

1. **Accedi a Cloudflare Dashboard**:
   - https://dash.cloudflare.com/

2. **Vai al database produzione**:
   - Menu → **Workers & Pages** → **D1 SQL Database**
   - Click su **`telemedcare-leads`** (database produzione)
   - Tab **"Console"**

3. **Esegui SQL**:

```sql
-- Verifica problema
SELECT 
    id, 
    nomeRichiedente, 
    cognomeRichiedente, 
    provinciaIntestatario,
    nomeAssistito,
    cognomeAssistito
FROM leads 
WHERE id = 'LEAD-IRBEMA-00258';

-- Correggi provincia
UPDATE leads 
SET provinciaIntestatario = 'MI' 
WHERE id = 'LEAD-IRBEMA-00258';

-- Verifica correzione
SELECT 
    id,
    provinciaIntestatario,
    cittaIntestatario
FROM leads 
WHERE id = 'LEAD-IRBEMA-00258';
```

**Output atteso**:
```
id: LEAD-IRBEMA-00258
provinciaIntestatario: MI
cittaIntestatario: MILANO
```

✅ **Fatto!** Provincia corretta.

---

## 🧪 STEP 2: Test Lead su Produzione (5 minuti)

### 2.1 Rigenera Contratto

1. **Accedi alla Dashboard**:
   - https://telemedcare-v12.pages.dev/dashboard.html

2. **Trova il lead**:
   - Sezione **Leads**
   - Cerca `LEAD-IRBEMA-00258`

3. **Rigenera contratto**:
   - Click sul lead
   - Click **"Rigenera Contratto"**
   - Attendi conferma

### 2.2 Verifica Email Contratto

1. **Controlla email**: `rpoggi55@gmail.com`
2. **Verifica oggetto**: "Contratto TeleMedCare..."
3. **Scarica PDF contratto**

### 2.3 Checklist PDF Contratto

Apri il PDF e verifica:

- [ ] **Nome intestatario**: `Sig. Roberto Poggi` (NO "N/A")
- [ ] **Residenza**: `VIA DEGLI ALERAMI 25 - 20148 MILANO (MI)`
- [ ] **Provincia**: `MI` (NO "GE")
- [ ] **Data/Luogo nascita**: **NON PRESENTE** ✅ (intestatario = richiedente)
- [ ] **Indirizzo spedizione**: `ROSARIA RESSA - VIA TAGGIA 7/28 - 16157 GENOVA (GE)`
- [ ] **Email**: `rpoggi55@gmail.com`
- [ ] **Telefono**: `3316432390`

✅ **Se tutti i check sono OK**: Bug risolto! 🎉

❌ **Se ci sono problemi**: Contattami con screenshot del PDF.

---

## 🧪 STEP 3 (Opzionale): Configura Ambiente Test

**Perché?** Per testare modifiche future senza toccare la produzione.

### Quick Start (10 minuti)

Segui la guida: **`docs/QUICK_START_TEST_ENV.md`**

**Passi rapidi**:

1. **Crea database test** su Cloudflare:
   - Nome: `telemedcare-leads-test`
   - Importa schema da `/scripts/init-test-db.sql`

2. **Copia Database ID** e sostituisci in:
   - `wrangler.toml` (riga 61)
   - `.pages.yaml` (riga 33)

3. **Configura Stripe test keys** (Preview):
   - `STRIPE_PUBLIC_KEY` = `pk_test_51...`
   - `STRIPE_SECRET_KEY` = `sk_test_51...`

4. **Attendi deploy**:
   - URL: https://test-environment.telemedcare-v12.pages.dev

**Guida completa**: `docs/TEST_ENVIRONMENT_SETUP.md`

---

## 💳 STEP 4 (Richiesto): Configura Stripe Produzione

### Problema

Stripe non è ancora configurato in produzione. I pagamenti NON funzionano.

### Soluzione (5 minuti)

Segui la guida: **`docs/STRIPE_SETUP_GUIDE.md`**

**Passi rapidi**:

1. **Accedi a Stripe**: https://dashboard.stripe.com/
2. **Ottieni Live Keys** (toggle su "Live mode"):
   - **Publishable key**: `pk_live_51...`
   - **Secret key**: `sk_live_51...`
3. **Configura su Cloudflare**:
   - Dashboard → **Workers & Pages** → **telemedcare-v12**
   - Tab **"Settings"** → **"Environment variables"**
   - Sezione **"Production"** → Add variable:
     - `STRIPE_PUBLIC_KEY` = `pk_live_51...`
     - `STRIPE_SECRET_KEY` = `sk_live_51...`
4. **Redeploy** (opzionale):
   - Tab **"Deployments"** → ultimo deploy → "Retry deployment"

✅ **Fatto!** Pagamenti Stripe attivi.

---

## 📊 Riepilogo Status

| Componente | Status | Azione |
|------------|--------|--------|
| **Fix bug** | ✅ Deployati | Nessuna |
| **DB produzione** | ⚠️ Da correggere | **STEP 1** (SQL UPDATE) |
| **Test E2E** | ⏳ Da fare | **STEP 2** (rigenera contratto) |
| **Ambiente test** | 🟡 Opzionale | **STEP 3** (config DB test) |
| **Stripe prod** | ❌ Mancante | **STEP 4** (config keys) |

---

## 🔗 Link Utili

| Risorsa | URL |
|---------|-----|
| **Dashboard Produzione** | https://telemedcare-v12.pages.dev/dashboard.html |
| **Cloudflare Dashboard** | https://dash.cloudflare.com/ |
| **Stripe Dashboard** | https://dashboard.stripe.com/ |
| **GitHub Repo** | https://github.com/RobertoPoggi/telemedcare-v12 |
| **D1 Database Prod** | Cloudflare → D1 → `telemedcare-leads` |

---

## 📚 Documentazione

| Documento | Descrizione |
|-----------|-------------|
| **RIEPILOGO_FINALE_COMPLETO.md** | ⭐ Tutti i fix e storia completa |
| **QUICK_START_TEST_ENV.md** | Setup ambiente test (5 min) |
| **TEST_ENVIRONMENT_SETUP.md** | Guida completa ambiente test |
| **STRIPE_SETUP_GUIDE.md** | Setup Stripe dettagliato |
| **SCHEMA_LEADS_LOGICA.md** | Logica database intestatario/assistito |
| **FIX_HISTORY_INTESTATARIO.md** | Storia bug e fix |

---

## ⏱️ Timeline

### Urgente (Oggi)

1. **STEP 1**: Correggi DB (2 min) ⚠️
2. **STEP 2**: Test lead (5 min) ⚠️
3. **STEP 4**: Configura Stripe (5 min) 🔴

**Totale**: ~12 minuti

### Opzionale (Questa Settimana)

4. **STEP 3**: Ambiente test (10 min)

---

## 🆘 Supporto

**Problemi?**

1. Controlla `docs/RIEPILOGO_FINALE_COMPLETO.md`
2. Consulta `docs/TEST_ENVIRONMENT_SETUP.md` (FAQ)
3. Verifica commit history su GitHub

**Contatto**: Genspark AI Developer

---

## ✅ Checklist Finale

**Prima di chiudere il ticket, verifica**:

- [ ] SQL UPDATE eseguito (`provinciaIntestatario = 'MI'`)
- [ ] Contratto rigenerato su LEAD-IRBEMA-00258
- [ ] PDF contratto verificato (7 check)
- [ ] Stripe produzione configurato (live keys)
- [ ] Test pagamento Stripe funzionante

**Se tutti i check sono ✅**: **Ticket chiuso!** 🎉

---

**Creato**: 2026-03-03  
**Versione**: 1.0  
**Priorità**: 🔴 Alta (fix già deployati, serve solo config)
