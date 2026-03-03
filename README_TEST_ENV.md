# 🧪 TeleMedCare Test Environment

**Branch**: `test-environment`  
**URL** (dopo config): https://test-environment.telemedcare-v12.pages.dev  
**Database**: `telemedcare-leads-test` (isolato da produzione)  
**Stripe**: Test mode (`pk_test_...` / `sk_test_...`)

---

## ⚠️ IMPORTANTE: Questo è un ambiente di TEST

- ✅ **Database separato** - Nessun dato reale di produzione
- ✅ **Stripe test mode** - Nessun pagamento reale
- ✅ **Email sandbox** - Nessuna email a clienti reali
- ✅ **URL separato** - Isolato da produzione

**Regola d'oro**: Test su test, produzione su produzione. Mai mescolare!

---

## 🚀 Quick Start

### Step 1: Crea Database Test

1. **Cloudflare Dashboard**: https://dash.cloudflare.com/
2. Menu → **Workers & Pages** → **D1 SQL Database**
3. Click **"Create database"**
4. Nome: `telemedcare-leads-test`
5. **Copia il Database ID**

### Step 2: Importa Schema

1. Click sul database → tab **"Console"**
2. Apri `/scripts/init-test-db.sql`
3. Copia tutto e incolla nella Console
4. Click **"Execute"**

### Step 3: Aggiorna Config Files

**Sostituisci** `INSERISCI_QUI_DATABASE_ID_TEST` con il Database ID copiato:

- `wrangler.toml` (riga 61)
- `.pages.yaml` (riga 33)

### Step 4: Configura Stripe Test

1. **Stripe Dashboard**: https://dashboard.stripe.com/
2. Toggle su **"Test mode"**
3. Menu → **Developers** → **API keys**
4. Copia:
   - `pk_test_51...`
   - `sk_test_51...`

### Step 5: Aggiungi Variabili Preview

**Cloudflare Dashboard** → Workers & Pages → telemedcare-v12 → Settings → Environment variables → **Preview**:

```
STRIPE_PUBLIC_KEY = pk_test_51...
STRIPE_SECRET_KEY = sk_test_51...
```

### Step 6: Commit e Deploy

```bash
git add wrangler.toml .pages.yaml
git commit -m "CONFIG: Database test ID aggiornato"
git push origin test-environment
```

Cloudflare Pages deploya automaticamente in ~2-3 minuti.

---

## 🧪 Test E2E

### Lead di Test Incluso

Il database test include già un lead: `LEAD-TEST-00001`

**Dati**:
- Richiedente: Mario Rossi
- Assistito: Anna Bianchi
- Intestatario: Mario Rossi (richiedente)
- Servizio: eCura PRO (BASE)

### Test 1: Form Completamento

```
https://test-environment.telemedcare-v12.pages.dev/completa-dati-minimal.html?leadId=LEAD-TEST-00001
```

### Test 2: Generazione Contratto

```bash
curl -X POST https://test-environment.telemedcare-v12.pages.dev/api/leads/LEAD-TEST-00001/send-contract \
  -H "Content-Type: application/json"
```

### Test 3: Pagamento Stripe (Test Card)

**Carte di test**:
- Successo: `4242 4242 4242 4242`
- Rifiutata: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

**Dati**:
- Scadenza: `12/30`
- CVC: `123`
- Nome: `Test User`

---

## 📂 File Importanti

| File | Descrizione |
|------|-------------|
| `scripts/init-test-db.sql` | Schema SQL database test |
| `wrangler.toml` | Config database binding (preview) |
| `.pages.yaml` | Config Cloudflare Pages (preview) |
| `docs/QUICK_START_TEST_ENV.md` | Guida setup rapido (5 min) |
| `docs/TEST_ENVIRONMENT_SETUP.md` | Guida completa ambiente test |

---

## 🔗 Link Utili

| Risorsa | URL |
|---------|-----|
| **Produzione** | https://telemedcare-v12.pages.dev |
| **Test** | https://test-environment.telemedcare-v12.pages.dev |
| **Cloudflare** | https://dash.cloudflare.com/ |
| **Stripe Test** | https://dashboard.stripe.com/test |
| **GitHub** | https://github.com/RobertoPoggi/telemedcare-v12 |

---

## 🛠️ Workflow Development

### Sviluppo su Test

```bash
# Lavora su test-environment
git checkout test-environment

# Fai modifiche
# ... edit files ...

# Commit
git add .
git commit -m "FEATURE: nuova funzionalità"
git push origin test-environment

# Cloudflare deploy automatico su URL test
```

### Merge a Produzione

```bash
# Dopo test completi
git checkout main
git merge test-environment
git push origin main

# Cloudflare deploy automatico su URL produzione
```

---

## ⚠️ Troubleshooting

### Deploy fallisce

**Verifica**:
1. Database ID corretto in `wrangler.toml` e `.pages.yaml`
2. Variabili Preview configurate
3. Build logs su Cloudflare Dashboard → Deployments

### Stripe non funziona

**Verifica**:
1. Variabili `STRIPE_PUBLIC_KEY` e `STRIPE_SECRET_KEY` impostate su **Preview** (non Production)
2. Chiavi test (`pk_test_...` / `sk_test_...`)
3. Stripe Dashboard in **Test mode**

### Database errori

**Verifica**:
1. Database `telemedcare-leads-test` esiste
2. Schema importato da `scripts/init-test-db.sql`
3. Database ID corretto nei file config

---

## 📚 Documentazione Completa

Per dettagli completi, consulta:

- **`docs/QUICK_START_TEST_ENV.md`** - Setup rapido (5 min)
- **`docs/TEST_ENVIRONMENT_SETUP.md`** - Guida completa con FAQ
- **`docs/AZIONI_IMMEDIATE.md`** - Cosa fare ora
- **`docs/RIEPILOGO_FINALE_COMPLETO.md`** - Storia completa fix

---

## 🎯 Obiettivi Test Environment

1. ✅ **Testare modifiche** senza toccare produzione
2. ✅ **Testare Stripe** senza pagamenti reali
3. ✅ **Testare email** senza invii a clienti
4. ✅ **Testare database** con dati di test
5. ✅ **Deploy sicuro** prima di produzione

---

## ✅ Checklist Setup

- [ ] Database test creato (`telemedcare-leads-test`)
- [ ] Schema importato (`scripts/init-test-db.sql`)
- [ ] Database ID aggiornato in `wrangler.toml`
- [ ] Database ID aggiornato in `.pages.yaml`
- [ ] Stripe test keys configurate (Preview)
- [ ] Commit e push modifiche
- [ ] Deploy completato
- [ ] URL `https://test-environment.telemedcare-v12.pages.dev` accessibile
- [ ] Test E2E completati

---

**Stato**: ⏳ **Attende configurazione**  
**Ultimo aggiornamento**: 2026-03-03  
**Versione**: 1.0
