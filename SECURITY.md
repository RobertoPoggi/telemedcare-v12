# 🔐 TeleMedCare V11.0 - Sicurezza e Environment Variables

## 🚨 **IMPORTANTE: API Keys Security**

Questo progetto **NON deve MAI** avere API keys hardcoded nel codice per sicurezza.

### ✅ **CONFIGURAZIONE CORRETTA**

#### **1. Sviluppo Locale**
```bash
# Copia i file template
cp .env.example .env
cp .dev.vars.example .dev.vars

# Modifica con le tue API keys reali
nano .env        # Per sviluppo generale
nano .dev.vars   # Per Wrangler/Cloudflare Workers
```

#### **2. Cloudflare Pages Produzione**
1. Vai su **Cloudflare Dashboard**
2. Seleziona il tuo progetto Pages
3. **Settings > Environment Variables**
4. Aggiungi tutte le variabili:

```
SENDGRID_API_KEY = SG.your-real-sendgrid-key
RESEND_API_KEY = re_your-real-resend-key
EMAIL_FROM = noreply@telemedcare.it
EMAIL_TO_INFO = info@telemedcare.it
```

#### **3. GitHub Repository Secrets**
1. Vai su **GitHub Repository > Settings > Secrets and variables > Actions**
2. Aggiungi i secrets per GitHub Actions:

```
CLOUDFLARE_API_TOKEN = your-cloudflare-token
SENDGRID_API_KEY = SG.your-real-sendgrid-key
RESEND_API_KEY = re_your-real-resend-key
```

### 🔍 **VERIFICA SICUREZZA**

#### **✅ File Protetti (in .gitignore)**
- `.env` - Environment variables locali
- `.dev.vars` - Cloudflare Workers variables
- `wrangler.toml` - Potrebbe contenere secrets

#### **✅ File Sicuri (committabili)**
- `.env.example` - Template senza keys reali
- `.dev.vars.example` - Template per Cloudflare
- `SECURITY.md` - Questa documentazione

### 🚫 **COSA NON FARE**

```typescript
// ❌ MAI FARE COSÌ
const apiKey = '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'

// ✅ SEMPRE COSÌ
const apiKey = env?.SENDGRID_API_KEY || 'fallback-for-development'
```

### 🔄 **ROTAZIONE API KEYS**

Se le API keys sono compromesse:

1. **Rigenera immediatamente** le keys sui servizi (SendGrid, Resend)
2. **Aggiorna .env** e `.dev.vars` locali
3. **Aggiorna Cloudflare Environment Variables**
4. **Aggiorna GitHub Secrets**
5. **Redeploy** l'applicazione

### 📋 **CHECKLIST SICUREZZA**

- [ ] ✅ API keys non hardcoded nel codice
- [ ] ✅ `.env` e `.dev.vars` in .gitignore  
- [ ] ✅ Environment variables configurate in Cloudflare Pages
- [ ] ✅ GitHub Secrets configurati per CI/CD
- [ ] ✅ Template files (`.example`) committati per riferimento
- [ ] ✅ Documentazione sicurezza aggiornata

### 🏥 **CONFORMITÀ SANITARIA**

Per sistemi sanitari come TeleMedCare:
- **🔐 Crittografia end-to-end** per tutti i dati sensibili
- **🔒 HTTPS obbligatorio** per tutte le comunicazioni  
- **📝 Audit logs** per tutte le operazioni critiche
- **🚫 Zero dati sensibili** nei logs o repository
- **🔑 Rotazione keys** ogni 90 giorni

### 📞 **SUPPORTO SICUREZZA**

Per emergenze sicurezza:
1. **Disabilita keys** immediatamente sui provider
2. **Contatta amministratore sistema**
3. **Documenta l'incidente** 
4. **Aggiorna tutte le credenziali**

---
**Aggiornato:** $(date '+%Y-%m-%d')  
**Responsabile Sicurezza:** Sistema TeleMedCare V11.0