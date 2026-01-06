# 🚀 Cloudflare Pages Setup - TeleMedCare V12

## 📋 Quick Reference per Configurazione Environment

### 🔗 Dashboard URLs

- **Project Settings**: https://dash.cloudflare.com/pages/view/telemedcare-v12/settings
- **Environment Variables**: https://dash.cloudflare.com/pages/view/telemedcare-v12/settings/environment-variables
- **Bindings**: https://dash.cloudflare.com/pages/view/telemedcare-v12/settings/bindings

---

## 🗄️ **D1 Database Binding (GIÀ CONFIGURATO)**

### Production
```
Variable name: DB
D1 database: telemedcare-leads
Database ID: e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f
```

### Preview
```
Variable name: DB
D1 database: telemedcare-leads
Database ID: e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f
```

⚠️ **IMPORTANTE**: Production e Preview condividono lo STESSO database!

---

## 🔐 **Environment Variables da Configurare**

### Per **PRODUCTION** e **PREVIEW** (identici):

#### Email Service (RESEND)
```
RESEND_API_KEY = re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
```

#### Email Configuration
```
EMAIL_FROM = info@telemedcare.it
EMAIL_TO_INFO = info@telemedcare.it
```

#### Security
```
JWT_SECRET = telemedcare-jwt-secret-2025-production
ENCRYPTION_KEY = telemedcare-encryption-key-2025-prod
```

#### SendGrid (Backup Provider - Opzionale)
```
SENDGRID_API_KEY = SG.your-key-if-needed
```

---

## 🛠️ **Come Clonare Configurazione da Production a Preview**

### Metodo 1: Dashboard Manuale (CONSIGLIATO)

1. Vai su **Settings** → **Environment variables**
2. Per ogni variabile:
   - Clicca **Edit**
   - Spunta **ENTRAMBE** le checkbox: `Production` + `Preview`
   - Salva

### Metodo 2: Wrangler CLI (per sviluppo locale)

Il file `wrangler.toml` è già configurato con:
- `[env.production]` 
- `[env.preview]`

Entrambi puntano allo stesso database D1.

---

## ✅ **Checklist Configurazione Completa**

### Database D1
- [x] Production: DB binding configurato
- [ ] Preview: DB binding configurato ← **DA FARE**

### Environment Variables
- [x] Production: RESEND_API_KEY
- [ ] Preview: RESEND_API_KEY ← **DA FARE**
- [x] Production: EMAIL_FROM
- [ ] Preview: EMAIL_FROM ← **DA FARE**
- [x] Production: EMAIL_TO_INFO
- [ ] Preview: EMAIL_TO_INFO ← **DA FARE**

---

## 🔍 **Verifica Configurazione**

### Test API Production
```bash
curl "https://telemedcare-v12.pages.dev/api/leads?limit=1"
```

### Test API Preview
```bash
curl "https://genspark-ai-developer.telemedcare-v12.pages.dev/api/leads?limit=1"
```

Entrambi dovrebbero restituire dati dal database D1.

---

## 🚨 **Troubleshooting**

### Errore: "Database D1 non configurato"
**Causa**: Binding `DB` mancante  
**Soluzione**: Aggiungi binding nel dashboard (Settings → Bindings)

### Errore: "Cannot read property 'DB' of undefined"
**Causa**: Nome binding errato  
**Soluzione**: Verifica che sia esattamente `DB` (maiuscolo)

### Preview non ha dati
**Causa**: Binding configurato solo su Production  
**Soluzione**: Aggiungi binding anche per Preview

---

## 📝 **Note Importanti**

1. **Database Condiviso**: Production e Preview usano LO STESSO database D1
2. **No Rollback**: Modifiche al DB in Preview impattano anche Production
3. **Testing**: Per test isolati, considera di creare un database D1 separato per Preview

---

## 🔄 **Aggiornamento Configurazione**

Dopo ogni modifica su Cloudflare Pages Dashboard:
- Cloudflare farà un **redeploy automatico** (2-3 minuti)
- Verifica che le modifiche siano applicate visitando l'URL

---

**Ultimo aggiornamento**: 2026-01-06  
**Versione**: TeleMedCare V12.0
