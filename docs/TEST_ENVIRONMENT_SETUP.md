# 🧪 Guida Completa: Ambiente di Test Isolato

**Obiettivo**: Creare un ambiente di test completamente separato dalla produzione per testare modifiche al codice, integrazioni (Stripe, email) e workflow senza rischi.

---

## 📋 Checklist Rapida

- [ ] Creare database D1 di test su Cloudflare
- [ ] Importare schema nel database test
- [ ] Creare branch `test-environment` su GitHub
- [ ] Configurare variabili d'ambiente Preview su Cloudflare Pages
- [ ] Aggiornare `wrangler.toml` e `.pages.yaml` con database ID test
- [ ] Configurare Stripe in Test Mode
- [ ] (Opzionale) Configurare Mailtrap per email di test
- [ ] Verificare deploy automatico su URL preview
- [ ] Eseguire test E2E completo

---

## 🗄️ Step 1: Creare Database D1 di Test

### 1.1 Accedi a Cloudflare Dashboard

1. Vai su **https://dash.cloudflare.com/**
2. Seleziona il tuo account Medica GB

### 1.2 Crea Nuovo Database D1

1. Menu laterale → **Workers & Pages** → **D1 SQL Database**
2. Click **"Create database"**
3. **Nome**: `telemedcare-leads-test`
4. Click **"Create"**

### 1.3 Copia Database ID

Dopo la creazione:
- Click sul database `telemedcare-leads-test`
- Copia il **Database ID** (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- **Salva questo ID** – servirà per configurare wrangler.toml

### 1.4 Importa Schema

1. Nel database `telemedcare-leads-test` → Tab **"Console"**
2. Apri il file `/home/user/webapp/scripts/init-test-db.sql`
3. Copia tutto il contenuto e incollalo nella Console
4. Click **"Execute"**

**Output atteso**:
```
Database test inizializzato con successo!
total_leads: 1
```

✅ **Database test creato e inizializzato con un lead di test**

---

## 🌿 Step 2: Configurare Branch di Test

### 2.1 Branch Già Creato

Il branch `test-environment` è già stato creato e pushato a GitHub.

**Verifiche**:
```bash
cd /home/user/webapp
git branch  # Dovresti vedere test-environment
```

### 2.2 Cloudflare Pages Auto-Deploy

Cloudflare Pages rileverà automaticamente il nuovo branch in **2-3 minuti**.

**URL Preview atteso**:
```
https://test-environment.telemedcare-v12.pages.dev
```

Puoi verificare lo stato su:
- Dashboard Cloudflare → **Workers & Pages** → **telemedcare-v12** → Tab **"Deployments"**

---

## ⚙️ Step 3: Configurare Database ID nei File di Config

### 3.1 Aggiorna wrangler.toml

**Azione richiesta**: Sostituisci `INSERISCI_QUI_DATABASE_ID_TEST` con il Database ID copiato al Step 1.3

```toml
# File: wrangler.toml
[[env.preview.d1_databases]]
binding = "DB"
database_name = "telemedcare-leads-test"
database_id = "INSERISCI_QUI_DATABASE_ID_TEST"  # ⬅️ Sostituisci con l'ID reale
```

### 3.2 Aggiorna .pages.yaml

**Azione richiesta**: Sostituisci `INSERISCI_QUI_DATABASE_ID_TEST` con il Database ID.

```yaml
# File: .pages.yaml
preview:
  d1_databases:
    - binding: DB
      database_name: telemedcare-leads-test
      database_id: INSERISCI_QUI_DATABASE_ID_TEST  # ⬅️ Sostituisci con l'ID reale
```

### 3.3 Commit e Push

```bash
cd /home/user/webapp
git add wrangler.toml .pages.yaml scripts/init-test-db.sql docs/TEST_ENVIRONMENT_SETUP.md
git commit -m "🧪 CONFIG: Database test per ambiente preview"
git push origin test-environment
```

---

## 🔐 Step 4: Configurare Variabili d'Ambiente Preview

### 4.1 Stripe Test Keys

1. **Accedi a Stripe Dashboard**: https://dashboard.stripe.com/
2. **Ottieni Test Keys**:
   - Menu → **Developers** → **API keys**
   - Toggle su **"Test mode"** (in alto a destra)
   - Copia:
     - **Publishable key**: `pk_test_51...`
     - **Secret key**: `sk_test_51...`

### 4.2 Aggiungi Variabili su Cloudflare Pages

1. Dashboard Cloudflare → **Workers & Pages** → **telemedcare-v12**
2. Tab **"Settings"** → **"Environment variables"**
3. Sezione **"Preview"** (NON Production!)
4. Click **"Add variable"** e aggiungi:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `STRIPE_PUBLIC_KEY` | `pk_test_51...` | **Preview** |
| `STRIPE_SECRET_KEY` | `sk_test_51...` | **Preview** |
| `RESEND_API_KEY` | (chiave esistente o Mailtrap) | **Preview** |
| `EMAIL_FROM` | `test@medicagb.it` | **Preview** |

5. Click **"Save"** per ogni variabile

### 4.3 (Opzionale) Mailtrap per Email di Test

Se vuoi usare Mailtrap invece di Resend per le email di test:

1. Crea account su **https://mailtrap.io/**
2. Crea un inbox di test
3. Ottieni SMTP credentials
4. Aggiungi variabili Preview:
   - `MAILTRAP_TOKEN` = (API token)
   - `EMAIL_SERVICE` = `mailtrap`

---

## 🚀 Step 5: Verifica Deploy Preview

### 5.1 Attendi Deploy

Dopo il commit e push, Cloudflare Pages:
1. Rileva il nuovo commit su `test-environment`
2. Esegue il build automatico
3. Deploy su URL preview (~2-3 minuti)

**Verifica**:
- Dashboard → **Deployments** → cerca il deploy del branch `test-environment`
- Stato deve essere **"Success"** (verde)

### 5.2 Accedi all'URL Preview

```
https://test-environment.telemedcare-v12.pages.dev
```

**Test rapido**:
```bash
curl https://test-environment.telemedcare-v12.pages.dev/api/stripe-public-key
```

**Output atteso**:
```json
{
  "success": true,
  "publicKey": "pk_test_51..."
}
```

✅ **Ambiente preview configurato correttamente!**

---

## 🧪 Step 6: Test End-to-End

### 6.1 Test Lead di Test

Il database test contiene già un lead: `LEAD-TEST-00001`

**Test 1 - Visualizza Lead**:
```
https://test-environment.telemedcare-v12.pages.dev/api/leads/LEAD-TEST-00001
```

### 6.2 Test Form Completamento Dati

```
https://test-environment.telemedcare-v12.pages.dev/completa-dati-minimal.html?leadId=LEAD-TEST-00001
```

**Azioni**:
1. Compila i campi mancanti
2. Verifica che i dati vengano salvati nel database test (non produzione!)

### 6.3 Test Generazione Contratto

```
POST https://test-environment.telemedcare-v12.pages.dev/api/leads/LEAD-TEST-00001/send-contract
```

**Verifica**:
- Email inviata (controlla Mailtrap o Resend sandbox)
- Contratto creato nel database test

### 6.4 Test Firma Contratto

1. Ottieni contractId dal response precedente
2. Apri:
```
https://test-environment.telemedcare-v12.pages.dev/firma-contratto.html?contractId={contractId}
```
3. Firma il contratto
4. Verifica generazione proforma

### 6.5 Test Pagamento Stripe (Test Mode)

```
https://test-environment.telemedcare-v12.pages.dev/pagamento.html?proformaId={proformaId}
```

**Carte di test Stripe**:
- **Successo**: `4242 4242 4242 4242`
- **Rifiutata**: `4000 0000 0000 0002`
- **Autenticazione 3D Secure**: `4000 0025 0000 3155`

**Dati carta test**:
- Scadenza: `12/30`
- CVC: `123`
- Nome: `Test User`

**Verifica**:
- Pagamento registrato in Stripe Dashboard (Test mode)
- Pagamento salvato nel database test
- Email di conferma inviata

---

## 📊 Confronto Ambiente Test vs Produzione

| Componente | **Produzione** | **Test** |
|------------|---------------|----------|
| **URL** | telemedcare-v12.pages.dev | test-environment.telemedcare-v12.pages.dev |
| **Branch Git** | `main` | `test-environment` |
| **Database D1** | `telemedcare-leads` (reale) | `telemedcare-leads-test` (isolato) |
| **Stripe** | Live keys (`pk_live_...`) | Test keys (`pk_test_...`) |
| **Email** | Resend produzione | Mailtrap o Resend sandbox |
| **Lead reali** | ✅ Sì | ❌ No (solo test) |
| **Pagamenti reali** | ✅ Sì | ❌ No (simulati) |

---

## 🔄 Workflow: Test → Produzione

### 1. Sviluppo e Test

```bash
# Lavora sul branch test-environment
git checkout test-environment
# ... fai modifiche ...
git add .
git commit -m "✨ FEATURE: nuova funzionalità"
git push origin test-environment
```

### 2. Test su URL Preview

- Cloudflare deploy automatico su `https://test-environment.telemedcare-v12.pages.dev`
- Esegui test E2E completi
- Verifica che tutto funzioni

### 3. Merge a Produzione

```bash
# Se tutto ok, merge su main
git checkout main
git merge test-environment
git push origin main
```

### 4. Deploy Produzione

- Cloudflare deploy automatico su `https://telemedcare-v12.pages.dev`
- Monitora i log per errori

---

## 🛠️ Comandi Utili

### Verificare Branch Attuale

```bash
cd /home/user/webapp
git branch
```

### Switchare tra Branch

```bash
# Vai su test
git checkout test-environment

# Torna a produzione
git checkout main
```

### Vedere Differenze

```bash
# Cosa è diverso tra test e main?
git diff main test-environment
```

### Pulire Database Test

Se vuoi resettare il database test:

1. Cloudflare Dashboard → D1 → `telemedcare-leads-test` → Console
2. Esegui:
```sql
-- Elimina tutti i dati
DELETE FROM payments;
DELETE FROM devices;
DELETE FROM proforma;
DELETE FROM contracts;
DELETE FROM leads;

-- Re-importa lead di test
-- (copia INSERT da init-test-db.sql)
```

---

## ❓ FAQ

### Q: Il database test condivide dati con produzione?

**A**: ❌ **NO**. Sono due database D1 completamente separati:
- `telemedcare-leads` (ID: `e49ad96c-...`) → Produzione
- `telemedcare-leads-test` (ID: `XXXXXXXX-...`) → Test

### Q: Posso testare Stripe senza pagare?

**A**: ✅ **SÌ**. Usando `pk_test_...` / `sk_test_...` puoi simulare pagamenti gratis. Stripe non addebita nulla in test mode.

### Q: Le email di test arrivano ai clienti reali?

**A**: ❌ **NO** (se usi Mailtrap). Tutte le email vanno a Mailtrap inbox, non a destinatari reali.

**Se usi Resend**: configura un indirizzo email di test (es. `test@medicagb.it`) solo per Preview.

### Q: Cosa succede se faccio errori in test?

**A**: 💚 **Nessun problema**. L'ambiente test è isolato:
- Database separato
- URL separato
- Stripe in test mode
- Email non inviate a clienti reali

### Q: Come elimino l'ambiente test?

1. **Elimina branch**:
```bash
git branch -d test-environment
git push origin --delete test-environment
```

2. **Elimina database test**:
   - Cloudflare Dashboard → D1 → `telemedcare-leads-test` → Settings → **Delete database**

3. **Rimuovi variabili Preview**:
   - Pages → Settings → Environment variables → Elimina tutte le variabili Preview

---

## ✅ Checklist Finale

Prima di considerare l'ambiente test completo, verifica:

- [ ] Database test creato e schema importato
- [ ] Branch `test-environment` pushato a GitHub
- [ ] `wrangler.toml` e `.pages.yaml` aggiornati con Database ID test
- [ ] Variabili Preview configurate (Stripe test keys, email)
- [ ] Deploy preview completato con successo
- [ ] URL `https://test-environment.telemedcare-v12.pages.dev` accessibile
- [ ] Lead di test (`LEAD-TEST-00001`) visibile nell'API
- [ ] Test E2E completato:
  - [ ] Form completamento dati
  - [ ] Generazione contratto
  - [ ] Firma contratto
  - [ ] Generazione proforma
  - [ ] Pagamento Stripe test
- [ ] Nessun dato di test finito in produzione
- [ ] Nessuna email inviata a clienti reali durante i test

---

## 📚 Riferimenti

- **Cloudflare D1 Docs**: https://developers.cloudflare.com/d1/
- **Cloudflare Pages Environments**: https://developers.cloudflare.com/pages/platform/environments/
- **Stripe Test Mode**: https://stripe.com/docs/testing
- **Mailtrap**: https://mailtrap.io/

---

## 🚨 Avvertenze

⚠️ **Mai fare queste cose**:
1. ❌ NON usare Stripe live keys in Preview
2. ❌ NON condividere l'URL preview pubblicamente
3. ❌ NON fare test con email di clienti reali
4. ❌ NON copiare dati di produzione in test (privacy!)
5. ❌ NON eseguire query distruttive sul database produzione

✅ **Regola d'oro**: Test su test, produzione su produzione. Mai mescolare!

---

**Ultimo aggiornamento**: 2026-03-03  
**Versione**: 1.0  
**Autore**: Genspark AI Developer
