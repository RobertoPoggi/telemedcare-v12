# 🔧 Guida: Clonare Environment Variables da Production a Preview

## 🎯 Problema

Cloudflare Pages NON permette di selezionare entrambi gli environment (Production + Preview) quando si modifica una variabile esistente. Bisogna inserire tutto da zero.

## ✅ Soluzione: Script Automatico

Ho creato uno script Bash che usa l'**API di Cloudflare** per clonare automaticamente tutte le variabili da Production a Preview.

---

## 📋 Prerequisiti

### 1️⃣ **Cloudflare API Token**

Devi creare un API Token con permessi su Cloudflare Pages:

#### Passaggi:

1. Vai su: https://dash.cloudflare.com/profile/api-tokens
2. Clicca **"Create Token"**
3. Usa il template **"Edit Cloudflare Workers"** OPPURE crea un custom token con:
   - **Permissions**:
     - Account → Cloudflare Pages → **Edit**
   - **Account Resources**:
     - Include → Specific account → **[Il tuo account]**
4. Clicca **"Continue to summary"** → **"Create Token"**
5. **COPIA IL TOKEN** (non lo vedrai più!)

#### Esempio token:
```
v8RjT3K_9mH2nP4xL7sQ6wF5yD1bG8cA3hJ0eN
```

---

### 2️⃣ **Cloudflare Account ID**

#### Opzione A: Dall'URL del dashboard

Quando sei su Cloudflare Pages, l'URL è:
```
https://dash.cloudflare.com/[ACCOUNT_ID]/pages/view/telemedcare-v12
```

L'**Account ID** è il numero/codice tra `/` dopo `dash.cloudflare.com/`

#### Opzione B: Da Pages Settings

1. Vai su **Workers & Pages** → **telemedcare-v12** → **Settings**
2. Scorri in basso, troverai **"Account ID"**

#### Esempio Account ID:
```
3bb064814aa60b770a979332a914
```

---

## 🚀 Uso dello Script

### Step 1: Esporta le credenziali

```bash
export CLOUDFLARE_API_TOKEN='v8RjT3K_9mH2nP4xL7sQ6wF5yD1bG8cA3hJ0eN'
export CLOUDFLARE_ACCOUNT_ID='3bb064814aa60b770a979332a914'
```

### Step 2: Esegui lo script

```bash
cd /home/user/webapp
./clone-env-to-preview.sh
```

### Output atteso:

```
🔄 Script per clonare Environment Variables da Production a Preview
==================================================================

✅ API Token trovato
✅ Account ID: 3bb064814aa60b770a979332a914

📥 Step 1: Recupero variabili da Production...

✅ Variabili Production recuperate
[
  "DEBUG_MODE",
  "EMAIL_FROM",
  "EMAIL_TO_INFO",
  "ENCRYPTION_KEY",
  "JWT_SECRET",
  "RESEND_API_KEY",
  "SENDGRID_API_KEY"
]

📤 Step 2: Clonazione su Preview...

✅ Variabili clonate con successo su Preview!

Variabili configurate:
  - DEBUG_MODE
  - EMAIL_FROM
  - EMAIL_TO_INFO
  - ENCRYPTION_KEY
  - JWT_SECRET
  - RESEND_API_KEY
  - SENDGRID_API_KEY

🎉 Clonazione completata!

Cloudflare Pages farà un redeploy automatico tra pochi minuti.
```

---

## 🔐 Sicurezza

### ⚠️ NON committare le credenziali!

Lo script usa **variabili d'ambiente** (`export`), quindi le credenziali NON vengono salvate nel codice.

### Dopo l'uso:

```bash
# Rimuovi le variabili dalla sessione
unset CLOUDFLARE_API_TOKEN
unset CLOUDFLARE_ACCOUNT_ID
```

---

## 🛠️ Cosa fa lo script?

1. **Recupera** tutte le variabili da Production via API Cloudflare
2. **Estrae** i valori (inclusi i secrets cifrati)
3. **Clona** le variabili su Preview con gli stessi valori
4. **Triggera** un redeploy automatico di Preview

---

## 📝 Note Importanti

### Variabili Secrets

Le variabili di tipo **"secret"** (come API keys) vengono clonate correttamente perché Cloudflare permette di leggerle via API quando hai i permessi giusti.

### D1 Bindings

Lo script clona **solo Environment Variables**. Per i **D1 Bindings** devi ancora configurarli manualmente:

```
Settings → Bindings → + Add → D1 database
Variable name: DB
D1 database: telemedcare-leads
Environment: Preview
```

---

## 🐛 Troubleshooting

### Errore: "Invalid API Token"
- Verifica che il token sia valido
- Controlla i permessi (deve avere "Cloudflare Pages: Edit")

### Errore: "Account ID not found"
- Verifica che l'Account ID sia corretto
- Controlla che il progetto `telemedcare-v12` esista

### Errore: "jq: command not found"
```bash
# Su Ubuntu/Debian
apt-get install jq

# Su Mac
brew install jq
```

---

## 🔄 Alternative: Manuale

Se preferisci non usare lo script, puoi clonare manualmente:

1. Vai su **Settings** → **Environment variables**
2. Clicca **"+ Add variable"**
3. Per ogni variabile da clonare:
   - **Name**: (copia da Production)
   - **Value**: (copia da Production)
   - **Environment**: Seleziona **Preview**
   - Salva

Ripeti per tutte le variabili (RESEND_API_KEY, EMAIL_FROM, ecc.)

---

## ✅ Checklist Post-Clonazione

Dopo aver eseguito lo script, verifica:

- [ ] Preview ha le stesse variabili di Production
- [ ] D1 Binding configurato per Preview (manuale)
- [ ] Redeploy di Preview completato (2-3 min)
- [ ] Dashboard funzionante su Preview URL

---

**File**: `clone-env-to-preview.sh`  
**Documentazione**: `CLONE_ENV_GUIDE.md`  
**Data**: 2026-01-06
