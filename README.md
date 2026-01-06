# TeleMedCare V11.0 - Sistema Modulare Enterprise

## 🏥 Panoramica
Sistema enterprise modulare per la gestione della telemedicina con architettura separata tra frontend pubblico e dashboard amministrative.

## 📂 **ARCHITETTURA MODULARE**

### **🚀 Landing Page + API Core (`src/index.tsx`)**
- **Bundle:** 336KB
- **Funzioni:** Landing page + lead capture + email automation
- **Target:** Utenti pubblici e acquisizione lead
- **API:** Endpoints essenziali per workflow base

### **📊 Dashboard Enterprise Complete (`src/dashboard.tsx`)** 
- **Bundle:** 595KB  
- **Funzioni:** 40+ dashboard amministrative complete
- **Target:** Staff interno e amministrazione
- **API:** Sistema completo enterprise con tutte le funzionalità

## 🌐 **URLs e Funzionalità**

### **Sistema Landing Page (Attuale - `index.tsx`)**
- **🏠 Homepage:** `/` - Landing page completa con form
- **📧 API Lead:** `/api/lead` - Acquisizione lead
- **📊 API Dashboard:** `/api/data/dashboard` - Dati base
- **🔧 Build Size:** 336KB

### **Sistema Dashboard Enterprise (`dashboard.tsx`)**
Quando attivo, include tutte le dashboard:

#### **📊 Dashboard Amministrative**
- **📈 Dashboard Operativa:** `/dashboard`
- **📊 Data Analytics:** `/admin/data-dashboard`  
- **📱 Magazzino Dispositivi:** `/admin/devices`
- **🧪 Testing Dashboard:** `/admin/testing-dashboard`
- **📚 Admin Docs:** `/admin/docs`

#### **🧪 Testing e Management**
- **📧 Email Test:** `/email-test`
- **📄 Contract Test:** `/contract-test`
- **🔧 Environment Management:** `/admin/environments`

#### **🔧 API Enterprise Complete**
- **📊 KPI Reports:** `/api/enterprise/reports/kpi`
- **📱 Device Inventory:** `/api/enterprise/devices/inventory`
- **🔒 Security Alerts:** `/api/enterprise/security/alerts`
- **📧 Email Templates:** `/api/email/templates`
- **💰 Payment Methods:** `/api/payments/methods`
- **📄 Contract Templates:** `/api/contracts/templates`

## ⚙️ **Come Utilizzare le Due Versioni**

### **🔄 Switch to Dashboard Enterprise**
Per testare tutte le dashboard e funzionalità:

```bash
# 1. Backup landing page
cd /home/user/webapp/src
cp index.tsx index-landing-backup.tsx

# 2. Attiva dashboard enterprise
cp dashboard.tsx index.tsx

# 3. Build e restart
cd /home/user/webapp
npm run build
pm2 restart telemedcare

# Ora hai accesso a tutte le 40+ dashboard!
```

### **🔄 Restore Landing Page**
Per tornare alla landing page:

```bash
# 1. Ripristina landing page
cd /home/user/webapp/src
cp index-landing-backup.tsx index.tsx

# 2. Build e restart  
cd /home/user/webapp
npm run build
pm2 restart telemedcare
```

### **📋 Script di Switch Automatico**

```bash
# Switch to Dashboard
alias switch-to-dashboard='cd /home/user/webapp/src && cp index.tsx index-landing-backup.tsx && cp dashboard.tsx index.tsx && cd .. && npm run build && pm2 restart telemedcare'

# Switch to Landing  
alias switch-to-landing='cd /home/user/webapp/src && cp index-landing-backup.tsx index.tsx && cd .. && npm run build && pm2 restart telemedcare'
```

## 🚀 Funzionalità Principali

### 📧 **Sistema Email Multi-Provider**
- **RESEND** e **SENDGRID** con failover automatico
- **🔐 API Keys sicure** via environment variables  
- Template email professionali
- Workflow automatizzato completo

### 📊 **Database D1 Cloudflare**
- Schema completo con 8 tabelle relazionali
- Gestione leads, contratti, pagamenti, dispositivi
- Logging email e tracking firme elettroniche

### 📱 **Gestione Dispositivi SiDLY Care Pro**
- Inventory management completo
- Scanner IMEI automatico
- Stati: INVENTORY → ASSIGNED → SHIPPED → DELIVERED → ACTIVE
- Dashboard dedicata con analytics

### 💰 **Sistema Pagamenti Enterprise**
- Stripe + Bonifico bancario
- Tracking pagamenti real-time  
- Fatturazione automatica
- Dashboard finanziaria

## 📁 Struttura File

```
webapp/
├── src/
│   ├── index.tsx              # 🌟 LANDING PAGE + API CORE (336KB)
│   ├── dashboard.tsx          # 🌟 DASHBOARD ENTERPRISE (595KB)  
│   ├── index-landing-only.tsx # Backup landing page
│   ├── index-full.tsx         # Sistema completo (reference)
│   └── modules/               # 25+ moduli enterprise
│       ├── email-service.ts   # Multi-provider email
│       ├── device-manager.ts  # Gestione dispositivi  
│       ├── contract-service.ts # Sistema contratti
│       ├── payment-service.ts # Gateway pagamenti
│       └── [20+ altri moduli...]
├── migrations/
│   └── 0001_complete_telemedcare_schema.sql
├── STRUCTURE.md              # 📚 Guida architettura modulare
├── SECURITY.md               # 🔐 Documentazione sicurezza
├── SETUP-NEW-SANDBOX.md      # 🚀 Guida migrazione sandbox
└── README.md                 # 📋 Questo file
```

## 🔐 Configurazione Sicurezza

### **Environment Variables (OBBLIGATORIO)**
```bash
# Multi-Provider Email
SENDGRID_API_KEY=SG.your-real-sendgrid-key
RESEND_API_KEY=re_your-real-resend-key

# Enterprise APIs  
IRBEMA_API_KEY=your-irbema-key
STRIPE_SECRET_KEY=sk_live_your-stripe-key

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

**📖 Documentazione:** [SECURITY.md](./SECURITY.md)

## 🎯 **Raccomandazioni d'Uso**

### **Per Sviluppo Landing Page:**
Usa `src/index.tsx` (attuale) - Leggero e veloce per testing form e lead capture.

### **Per Testing Dashboard Complete:**
Switch a `src/dashboard.tsx` - Accesso a tutte le 40+ funzionalità amministrative.

### **Per Produzione Enterprise:**
Deploy entrambi su domini separati:
- `telemedcare.it` → Landing page (pubblico)
- `admin.telemedcare.it` → Dashboard (interno)

## 📊 Performance

- **Landing Page:** 336KB bundle, <100ms response  
- **Dashboard Enterprise:** 595KB bundle, sistema completo
- **Database:** Auto-scaling D1 globale
- **Email:** 100,000+ email/mese per provider
- **Uptime:** 99.9% SLA Cloudflare

## 🚀 Deployment

### **GitHub Repository**
🔗 https://github.com/RobertoPoggi/telemedcare-v11

### **Sandbox ad Alte Prestazioni**
Pronto per migrazione con:
- Build 2-3x più veloce
- Hot reload istantaneo  
- CPU e memoria potenziati

### **Cloudflare Pages**
```bash
npm run build
npx wrangler pages deploy dist --project-name telemedcare-v11
```

## 📞 Supporto

**Medica GB S.r.l.**  
📧 info@telemedcare.it  
🌐 TeleMedCare V11.0 Modular Enterprise  

---
**Sistema Modulare - Landing + Dashboard Separate**  
*Aggiornato: $(date '+%Y-%m-%d %H:%M')*# Rebuild trigger Tue Jan  6 17:39:03 UTC 2026
