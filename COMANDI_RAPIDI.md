# ⚡ COMANDI RAPIDI - TeleMedCare V11.0

## 🚀 DEPLOYMENT RAPIDO (3 comandi)

```bash
# 1. Login Cloudflare
npx wrangler login

# 2. Applica Migration 0007
npx wrangler d1 migrations apply telemedcare-leads --remote

# 3. Deploy
npm run deploy
```

---

## 🧪 TEST RAPIDO

### Test Automatizzato
```bash
# Modifica URL
nano test_comprehensive_roberto.py
# Cambia linea 32: BASE_URL = "https://tuo-url.pages.dev"

# Esegui
python3 test_comprehensive_roberto.py
```

### Test Manuale Landing Page
```bash
# Apri browser
xdg-open https://tuo-url.pages.dev

# Compila form con:
# - Nome: Roberto, Cognome: Poggi
# - Email: rpoggi55@gmail.com
# - Assistito: Rosaria Ressa, 65 anni
# - Pacchetto: BASE o AVANZATO
# - Intestazione: richiedente o assistito
```

---

## 🔍 VERIFICA RAPIDA

### Migration Applicata?
```bash
npx wrangler d1 execute telemedcare-leads --remote \
  --command="PRAGMA table_info(proforma);"
# Deve mostrare 19 colonne
```

### Database Funziona?
```bash
# Conta leads
npx wrangler d1 execute telemedcare-leads --remote \
  --command="SELECT COUNT(*) FROM leads;"

# Ultimi 5 leads
npx wrangler d1 execute telemedcare-leads --remote \
  --command="SELECT nomeRichiedente, cognomeRichiedente, pacchetto FROM leads ORDER BY created_at DESC LIMIT 5;"
```

### Logs Real-Time
```bash
# Tutti i logs
npx wrangler pages deployment tail

# Solo errori
npx wrangler pages deployment tail --format pretty | grep ERROR

# Solo email
npx wrangler pages deployment tail --format pretty | grep "📧"
```

---

## 🐛 FIX RAPIDI

### Migration Non Applicata?
```bash
npx wrangler d1 migrations apply telemedcare-leads --remote --force
```

### Email Non Arrivano?
```bash
# Verifica API keys in Dashboard:
# https://dash.cloudflare.com → Pages → telemedcare-v11 → Settings → Environment Variables
# Devono esserci: SENDGRID_API_KEY, RESEND_API_KEY
```

### Contract "DA FORNIRE"?
```bash
# Rebuild e redeploy
npm run build
npm run deploy
# Poi refresh browser con Ctrl+Shift+R
```

### Proforma Non Creata?
```bash
# Verifica migration
npx wrangler d1 execute telemedcare-leads --remote \
  --command="SELECT name FROM sqlite_master WHERE type='table' AND name='proforma';"
# Deve mostrare: proforma

# Se manca, applica migration
npx wrangler d1 migrations apply telemedcare-leads --remote
```

---

## 📊 QUERY DATABASE UTILI

### Conta Tutto
```bash
npx wrangler d1 execute telemedcare-leads --remote --command="
SELECT 
  (SELECT COUNT(*) FROM leads) as leads,
  (SELECT COUNT(*) FROM contracts) as contracts,
  (SELECT COUNT(*) FROM proforma) as proforma,
  (SELECT COUNT(*) FROM email_logs) as emails;
"
```

### Ultimi 5 Lead Completi
```bash
npx wrangler d1 execute telemedcare-leads --remote --command="
SELECT 
  nomeRichiedente || ' ' || cognomeRichiedente as richiedente,
  nomeAssistito || ' ' || cognomeAssistito as assistito,
  pacchetto,
  intestazioneContratto,
  fonte,
  created_at
FROM leads 
ORDER BY created_at DESC 
LIMIT 5;
"
```

### Email Fallite
```bash
npx wrangler d1 execute telemedcare-leads --remote --command="
SELECT 
  template_name,
  recipient_email,
  error_message,
  sent_at
FROM email_logs 
WHERE status='FAILED'
ORDER BY sent_at DESC 
LIMIT 10;
"
```

### Proforma Generate
```bash
npx wrangler d1 execute telemedcare-leads --remote --command="
SELECT 
  numero_proforma,
  cliente_nome || ' ' || cliente_cognome as cliente,
  tipo_servizio,
  prezzo_totale,
  status,
  created_at
FROM proforma 
ORDER BY created_at DESC 
LIMIT 5;
"
```

---

## 🔐 SETUP ENVIRONMENT VARIABLES (Se necessario)

### Via CLI
```bash
# SendGrid
npx wrangler pages secret put SENDGRID_API_KEY

# Resend
npx wrangler pages secret put RESEND_API_KEY
```

### Via Dashboard
1. https://dash.cloudflare.com
2. Workers & Pages → telemedcare-v11
3. Settings → Environment Variables
4. Add variable:
   - `SENDGRID_API_KEY` = `SG.your-key`
   - `RESEND_API_KEY` = `re_your-key`
5. Redeploy

---

## 🎯 CHECKLIST RAPIDA

Prima del test:
- [ ] `npx wrangler login` ✅
- [ ] Migration 0007 applicata ✅
- [ ] `npm run deploy` completato ✅
- [ ] URL accessibile ✅

Durante test:
- [ ] Form si carica ✅
- [ ] Invio form funziona ✅
- [ ] Email arriva a richiedente ✅
- [ ] Email arriva a info@ ✅
- [ ] Database popolato ✅

Dopo test:
- [ ] Nessun errore nei logs ✅
- [ ] Contract corretto ✅
- [ ] Proforma generata ✅
- [ ] Tutti i 6 template email testati ✅

---

## 📚 DOCUMENTAZIONE COMPLETA

- **GUIDA_DEPLOYMENT_ROBERTO.md** - Guida step-by-step dettagliata
- **FINAL_STATUS_ROBERTO.md** - Status completo tutti i fix
- **RIEPILOGO_FINALE.txt** - Riepilogo visuale finale

---

**Tempo totale deployment + test: ~20 minuti**

🚀 Vai subito a **GUIDA_DEPLOYMENT_ROBERTO.md** per iniziare!
