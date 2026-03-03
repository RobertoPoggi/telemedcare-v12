# 🎯 AZIONI IMMEDIATE: Setup Ambiente Test

## ⚡ Quick Start (5 minuti)

### 1️⃣ Crea Database Test (Cloudflare Dashboard)

1. Vai su **https://dash.cloudflare.com/**
2. Menu → **Workers & Pages** → **D1 SQL Database**
3. Click **"Create database"**
4. Nome: `telemedcare-leads-test`
5. **Copia il Database ID** (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

### 2️⃣ Importa Schema nel Database

1. Click sul database `telemedcare-leads-test` → tab **"Console"**
2. Apri `/home/user/webapp/scripts/init-test-db.sql`
3. Copia tutto e incolla nella Console
4. Click **"Execute"**
5. Verifica output: `Database test inizializzato con successo!`

### 3️⃣ Aggiorna File di Configurazione

**Sostituisci** `INSERISCI_QUI_DATABASE_ID_TEST` con il Database ID nei file:
- `wrangler.toml` (riga 61)
- `.pages.yaml` (riga 33)

### 4️⃣ Ottieni Stripe Test Keys

1. Vai su **https://dashboard.stripe.com/**
2. Menu → **Developers** → **API keys**
3. Toggle su **"Test mode"**
4. Copia:
   - **Publishable key**: `pk_test_51...`
   - **Secret key**: `sk_test_51...`

### 5️⃣ Configura Variabili Preview (Cloudflare)

1. Dashboard → **Workers & Pages** → **telemedcare-v12**
2. Tab **"Settings"** → **"Environment variables"**
3. Sezione **"Preview"** → Click **"Add variable"**
4. Aggiungi:

```
STRIPE_PUBLIC_KEY = pk_test_51... (Environment: Preview)
STRIPE_SECRET_KEY = sk_test_51... (Environment: Preview)
```

### 6️⃣ Deploy e Test

Il branch `test-environment` è già stato pushato. Cloudflare Pages:
- Rileva il branch automaticamente (~2 min)
- Esegue build e deploy
- URL preview: `https://test-environment.telemedcare-v12.pages.dev`

**Verifica deploy**:
- Dashboard → **Deployments** → cerca `test-environment`
- Stato deve essere **"Success"** (verde)

### 7️⃣ Test Rapido

```bash
# Test 1: API key Stripe
curl https://test-environment.telemedcare-v12.pages.dev/api/stripe-public-key

# Test 2: Lead di test
curl https://test-environment.telemedcare-v12.pages.dev/api/leads/LEAD-TEST-00001

# Test 3: Form completamento
# Apri browser: https://test-environment.telemedcare-v12.pages.dev/completa-dati-minimal.html?leadId=LEAD-TEST-00001
```

---

## ✅ Checklist

- [ ] Database test creato e ID copiato
- [ ] Schema importato nel database test
- [ ] `wrangler.toml` e `.pages.yaml` aggiornati con Database ID
- [ ] Stripe test keys ottenute
- [ ] Variabili Preview configurate su Cloudflare
- [ ] Deploy preview completato (verifica Deployments)
- [ ] Test rapidi superati

---

## 🔗 URL Importanti

- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **Cloudflare D1**: https://dash.cloudflare.com/ → Workers & Pages → D1 SQL Database
- **Stripe Dashboard**: https://dashboard.stripe.com/
- **GitHub Repo**: https://github.com/RobertoPoggi/telemedcare-v12
- **URL Preview** (dopo deploy): https://test-environment.telemedcare-v12.pages.dev

---

## 📚 Documentazione Completa

Vedi: `/home/user/webapp/docs/TEST_ENVIRONMENT_SETUP.md`

---

## 🆘 Supporto

Se hai dubbi, consulta:
1. **TEST_ENVIRONMENT_SETUP.md** - Guida completa con FAQ
2. **STRIPE_SETUP_GUIDE.md** - Setup Stripe dettagliato
3. **SCHEMA_LEADS_LOGICA.md** - Logica database e campi

---

**Tempo stimato**: ⏱️ 5-10 minuti  
**Difficoltà**: 🟢 Facile (solo configurazione UI)  
**Rischio**: 🟢 Zero (ambiente isolato)
