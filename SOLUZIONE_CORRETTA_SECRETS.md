# ✅ SOLUZIONE CORRETTA: Secrets via Wrangler

**Problema risolto**: Cloudflare Pages gestisce variabili e secrets in modo diverso!

---

## 🎯 COME FUNZIONA

Cloudflare Pages ha 2 tipi di configurazioni:

### **1. Variabili Normali** (wrangler.toml)
✅ Già configurate in `wrangler.toml`:
- `EMAIL_FROM = "info@telemedcare.it"`
- `EMAIL_TO_INFO = "info@telemedcare.it"`

### **2. Secrets (chiavi API)** (via CLI)
⚠️ Devono essere configurati via `wrangler pages secret`:
- `SENDGRID_API_KEY`
- `RESEND_API_KEY`
- `JWT_SECRET`
- `ENCRYPTION_KEY`

---

## 🚀 SCRIPT AGGIORNATO

Ho creato `setup-secrets.sh` che:
1. ✅ Configura i 4 secrets via `wrangler pages secret put`
2. ✅ Aggiunge gli 8 DNS records
3. ✅ Trova automaticamente il Zone ID
4. ✅ Fa il build e deploy

---

## 📋 COME USARLO

### **Metodo Automatico** ⭐ (1 minuto)

```bash
# Clona il repository
git clone https://github.com/RobertoPoggi/telemedcare-v12.git
cd telemedcare-v12

# Esegui lo script corretto
./setup-secrets.sh
```

Ti chiederà solo:
1. **API Token Cloudflare** (quello di prima va bene)
2. **Zone ID** (lascia vuoto, lo trova automaticamente!)

**FATTO!** Lo script configura tutto.

---

### **Metodo Manuale** (5 minuti)

Se lo script non funziona, configura manualmente:

#### **Step 1: Configura Secrets**

```bash
cd /path/to/telemedcare-v12

# Imposta il token
export CLOUDFLARE_API_TOKEN="il-tuo-token"

# Configura i 4 secrets (uno per uno)
echo "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" | npx wrangler pages secret put SENDGRID_API_KEY --project-name=telemedcare-v12

echo "re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2" | npx wrangler pages secret put RESEND_API_KEY --project-name=telemedcare-v12

echo "f8adfd1d3ab5f1bcacdb0c09e9eca0904146790112eb3f375516380e75adc534" | npx wrangler pages secret put JWT_SECRET --project-name=telemedcare-v12

echo "492109618a5df3abe44c7086e4983cd776393457381a776bd3c51de67b7573cd" | npx wrangler pages secret put ENCRYPTION_KEY --project-name=telemedcare-v12
```

#### **Step 2: Verifica Secrets**

```bash
npx wrangler pages secret list --project-name=telemedcare-v12
```

Dovresti vedere:
```
SENDGRID_API_KEY
RESEND_API_KEY
JWT_SECRET
ENCRYPTION_KEY
```

#### **Step 3: Deploy**

```bash
npm run build
npx wrangler pages deploy dist --project-name=telemedcare-v12
```

#### **Step 4: DNS Records**

Aggiungi manualmente dalla dashboard Cloudflare o usa `CONFIGURAZIONE_RAPIDA_COPY_PASTE.md`

---

## ✅ VERIFICA CONFIGURAZIONE

### **1. Verifica Secrets**

```bash
npx wrangler pages secret list --project-name=telemedcare-v12
```

Dovresti vedere 4 secrets.

### **2. Verifica Variabili in wrangler.toml**

Apri `wrangler.toml`, dovresti vedere:

```toml
[vars]
EMAIL_FROM = "info@telemedcare.it"
EMAIL_TO_INFO = "info@telemedcare.it"
```

### **3. Verifica DNS**

Dopo 15-30 minuti:

```bash
dig em6551.telemedcare.it CNAME
dig s1._domainkey.telemedcare.it CNAME
```

---

## 🎯 DIFFERENZA DAGLI SCRIPT PRECEDENTI

| Script | Cosa fa | Quando usarlo |
|--------|---------|---------------|
| `setup-telemedcare.sh` | ❌ **Obsoleto** - provava Environment Variables | Non usare |
| `setup-secrets.sh` | ✅ **CORRETTO** - usa `wrangler pages secret` | Usa questo! |

---

## 📊 RIEPILOGO

### **Cosa è già configurato:**
- ✅ `wrangler.toml` con EMAIL_FROM e EMAIL_TO_INFO
- ✅ Codice completo e funzionante
- ✅ Build senza errori

### **Cosa devi fare:**
- ⏳ Configurare i 4 secrets (API keys)
- ⏳ Aggiungere DNS records
- ⏳ Fare deploy

### **Tempo richiesto:**
- Script automatico: 1 minuto
- Manuale: 5 minuti
- DNS propagazione: 2 ore

---

## 🚀 PROSSIMI PASSI

1. **Esegui lo script:**
   ```bash
   ./setup-secrets.sh
   ```

2. **Aspetta DNS propagazione** (2 ore)

3. **Verifica domini**:
   - SendGrid: https://app.sendgrid.com/
   - Resend: https://resend.com/

4. **Testa email**:
   - https://telemedcare-v12.pages.dev/admin/leads-dashboard

---

## 💡 PERCHÉ QUESTO METODO

**Dashboard Cloudflare dice:**
> "Environment variables for this project are being managed through wrangler.toml. Only Secrets (encrypted variables) can be managed via the Dashboard."

Quindi:
- ✅ Variabili normali → `wrangler.toml` (già fatto)
- ✅ Secrets (API keys) → `wrangler pages secret` (script fa questo)
- ✅ DNS → Cloudflare API (script fa questo)

---

**Usa `setup-secrets.sh` - è lo script corretto!** 🎯

**File**: `/home/user/webapp/setup-secrets.sh`  
**Repository**: https://github.com/RobertoPoggi/telemedcare-v12  
**Commit**: In arrivo...
