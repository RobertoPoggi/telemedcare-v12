# TeleMedCare V11.0 - Sistema Admin Dashboard con Workflow Automation

## 🏥 Panoramica
Sistema enterprise per la gestione della telemedicina con **Admin Dashboard** per conferma manuale di firme e pagamenti, integrando workflow automatizzati.

## 🚀 **DEPLOY RAPIDO - 2 MINUTI**

### Quick Start per Produzione:
📋 **LEGGI**: `QUICKSTART.md` - Guida in 2 minuti per andare in produzione
📖 **DETTAGLI**: `MIGRATION_INSTRUCTIONS.md` - Istruzioni complete per migrazioni
📊 **STATUS**: `DEPLOYMENT_STATUS.md` - Status completo deployment

### URLs Produzione:
- 🌐 **Admin Dashboard**: https://telemedcare-v11.pages.dev/admin-dashboard
- 🌐 **API Admin**: https://telemedcare-v11.pages.dev/api/admin/dashboard/stats
- 🌐 **Form Lead Pubblico**: https://telemedcare-v11.pages.dev/

## 📂 **ARCHITETTURA SISTEMA**

### **🚀 Frontend Pubblico**
- **Landing Page** con form acquisizione lead
- **Form Lead**: Acquisizione dati paziente con validazione
- **Email Automation**: Notifiche automatiche a info@telemedcare.it
- **Workflow**: Gestione automatizzata status lead

### **📊 Admin Dashboard**
- **1-Click Confirmations**: Firma manuale contratti + pagamenti bonifico
- **Gestione Leads**: Visualizzazione e filtri per status
- **Gestione Contratti**: Conferma firma manuale (olografo)
- **Gestione Proforma**: Conferma pagamenti bonifico bancario
- **Gestione Devices**: Inventario SIDLY con associazione e configurazione
- **Statistiche Real-time**: Dashboard KPI aggiornate

### **🤖 Workflow Automation**
```
Lead → Contratto (1-click conferma) → Proforma (auto-generata) → 
Pagamento (1-click conferma) → Welcome Email (auto) → 
Form Configurazione → Device Association → ATTIVO
```

## 🌐 **URLs e Endpoints**

### **Pubblico**
- **🏠 Homepage:** `/` - Landing page con form lead
- **📧 API Lead:** `/api/lead` - Submit nuovo lead

### **Admin Dashboard**
- **📊 Dashboard:** `/admin-dashboard` - Dashboard amministrativa completa
- **🔐 Login:** Form di autenticazione amministratore

### **Admin API Endpoints**

#### **Dashboard Stats**
```
GET /api/admin/dashboard/stats
→ Statistiche real-time (leads, contratti, pagamenti, devices)
```

#### **Gestione Leads**
```
GET /api/admin/leads?status=NEW&limit=50
GET /api/admin/leads/:id
```

#### **Gestione Contratti**
```
GET /api/admin/contracts?signature_status=PENDING
POST /api/admin/contracts/:id/confirm-signature
  Body: { "admin_email": "...", "notes": "..." }
```

#### **Gestione Proforma**
```
GET /api/admin/proformas?status=PENDING
POST /api/admin/proformas/:id/confirm-payment
  Body: { "admin_email": "...", "payment_reference": "...", "notes": "..." }
```

#### **Gestione Devices**
```
GET /api/admin/devices?status=AVAILABLE
POST /api/admin/devices/:id/associate
POST /api/admin/devices/:id/configure
GET /api/admin/devices/:id/history
```

## ⚙️ **Setup Iniziale Database**

### **Prerequisiti**
1. Database D1 Cloudflare creato: `telemedcare-leads`
2. ID Database: `e6fd921d-06df-4b65-98f9-fce81ef78825`
3. Configurazione `wrangler.jsonc` aggiornata

### **Applica Migrazioni Database (PRIMA VOLTA)**

**Dashboard Cloudflare D1:**
👉 https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/workers-and-pages/d1

**Procedura (2-3 minuti):**
1. Vai su Dashboard → **telemedcare-leads** → Tab **Console**
2. Applica i 4 batch files (copia-incolla nella Console SQL):
   - ✅ `migrations/BATCH_01_core_schema.sql`
   - ✅ `migrations/BATCH_02_templates.sql`
   - ✅ `migrations/BATCH_03_partners_proforma.sql`
   - ✅ `migrations/BATCH_04_admin_features.sql`

**📋 Istruzioni Complete:** Vedi `MIGRATION_INSTRUCTIONS.md`

### **Deploy Automatico**

Ogni push su `main` branch triggera automaticamente:
1. GitHub Actions workflow
2. Build applicazione
3. Deploy su Cloudflare Pages
4. Applicazione LIVE in 2-3 minuti

**Monitoraggio Deploy:**
👉 https://github.com/RobertoPoggi/telemedcare-v11/actions

## 🚀 Funzionalità Principali

### 📧 **Sistema Email Automation**
- **Provider**: Resend API
- **Email automatiche**: Notifiche, benvenuto, documenti
- **Template professionali**: HTML responsive con branding TelemedCare
- **Workflow automatizzato**: Trigger su eventi (firma, pagamento, etc.)

### 📊 **Database D1 Cloudflare**
- Schema completo con 15+ tabelle relazionali
- **Leads**: Acquisizione e tracking
- **Contracts**: Gestione firme manuali
- **Proformas**: Gestione pagamenti bonifico
- **Devices**: Inventario SIDLY con tracking
- **DocuSign**: Token e envelope tracking
- **Email Templates**: Sistema template dinamico

### 📱 **Gestione Dispositivi SIDLY**
- **Inventory Management**: Codice dispositivo + seriale
- **Stati Disponibili**:
  - `AVAILABLE` - Disponibile in magazzino
  - `TO_CONFIGURE` - Da configurare
  - `ASSOCIATED` - Associato a paziente
  - `CONFIGURED` - Configurato e pronto
  - `IN_USE` - In uso dal paziente
  - `RETURNED` - Restituito
  - `MAINTENANCE` - In manutenzione
- **Device History**: Tracking completo modifiche
- **Dashboard dedicata**: Visualizzazione e gestione

### 💰 **Gestione Pagamenti**
- **Bonifico Bancario**: Conferma manuale da admin dashboard
- **Tracking Pagamenti**: Reference code + data + note
- **Proforma Generation**: Automatica dopo firma contratto
- **Status Tracking**: PENDING → PAID_BANK_TRANSFER

## 📁 Struttura Progetto

```
webapp/
├── src/
│   ├── index.tsx                  # 🌟 MAIN APPLICATION
│   └── modules/
│       ├── admin-api.ts           # Admin API endpoints
│       ├── email-service.ts       # Email automation
│       ├── docusign-service.ts    # DocuSign integration
│       └── [altri moduli...]
├── public/
│   └── admin-dashboard.html       # Admin dashboard UI (36KB)
├── migrations/
│   ├── BATCH_01_core_schema.sql   # 📋 Schema base
│   ├── BATCH_02_templates.sql     # 📧 Email templates
│   ├── BATCH_03_partners_proforma.sql  # 💼 Partner e proforma
│   ├── BATCH_04_admin_features.sql     # 🔧 Admin features
│   └── ALL_MIGRATIONS_CONSOLIDATED.sql # Alternativa: tutto in uno
├── .github/
│   └── workflows/
│       └── deploy.yml             # CI/CD automatico
├── wrangler.jsonc                 # ⚙️ Cloudflare config
├── QUICKSTART.md                  # ⚡ Guida rapida 2 minuti
├── MIGRATION_INSTRUCTIONS.md      # 📖 Istruzioni migrazioni
├── DEPLOYMENT_STATUS.md           # 📊 Status deployment
└── README.md                      # 📋 Questo file
```

## 🔐 Configurazione Environment

### **Variables (in wrangler.jsonc)**
```jsonc
{
  "vars": {
    "RESEND_API_KEY": "re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt",
    "EMAIL_FROM": "noreply@telemedcare.it",
    "EMAIL_TO_INFO": "info@telemedcare.it"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "telemedcare-leads",
      "database_id": "e6fd921d-06df-4b65-98f9-fce81ef78825"
    }
  ]
}
```

### **Cloudflare Configuration**
- **Account ID**: 73e144e1ddc4f4af162d17c313e00c06
- **Project Name**: telemedcare-v11
- **Database**: telemedcare-leads (D1)
- **GitHub Actions**: Auto-deploy on push to main

## 🎯 **Workflow Automation**

### **1. Lead Acquisition**
```
Utente compila form → Lead creato (status: NEW) → 
Email notifica a info@telemedcare.it
```

### **2. Contract Management**
```
Lead (CONTRACT_SENT) → Cliente firma contratto olografo → 
Admin conferma firma (1-click) → Contract (SIGNED_MANUAL) → 
Lead (CONTRACT_SIGNED)
```

### **3. Proforma & Payment**
```
Contratto firmato → Sistema genera proforma automatica →
Lead (PROFORMA_SENT) → Cliente paga bonifico → 
Admin conferma pagamento (1-click) → Proforma (PAID_BANK_TRANSFER) →
Lead (PAYMENT_CONFIRMED)
```

### **4. Device Configuration**
```
Pagamento confermato → Email benvenuto + link form → 
Cliente compila configurazione → Lead (CONFIGURATION_RECEIVED) →
Admin configura SIDLY → Admin associa device → 
Lead (DEVICE_ASSOCIATED) → Lead (ACTIVE)
```

## 📊 Performance & Scalability

- **Frontend**: Cloudflare Pages (CDN globale)
- **Database**: D1 auto-scaling SQLite (Cloudflare)
- **Email**: Resend API (50k email/mese free tier)
- **Build Time**: ~4 secondi
- **Deploy Time**: ~2-3 minuti (GitHub Actions)
- **Uptime**: 99.9% SLA Cloudflare

## 🚀 Deployment & CI/CD

### **GitHub Repository**
🔗 https://github.com/RobertoPoggi/telemedcare-v11

### **Automatic Deployment**
- **Trigger**: Push to `main` branch
- **CI/CD**: GitHub Actions
- **Build**: Automatic (Vite + TypeScript)
- **Deploy**: Cloudflare Pages
- **Time**: 2-3 minuti per deployment completo

### **Manual Deploy (Optional)**
```bash
npm run build
npx wrangler pages deploy dist --project-name telemedcare-v11
```

### **Database Migrations**
First time only (via Cloudflare Dashboard):
```bash
# Apply 4 batch files in Console SQL:
BATCH_01_core_schema.sql
BATCH_02_templates.sql
BATCH_03_partners_proforma.sql
BATCH_04_admin_features.sql
```

## 📞 Supporto & Links

### **Production URLs**
- 🌐 **Admin Dashboard**: https://telemedcare-v11.pages.dev/admin-dashboard
- 🌐 **Lead Form**: https://telemedcare-v11.pages.dev/
- 🌐 **Admin API**: https://telemedcare-v11.pages.dev/api/admin/

### **Development & Monitoring**
- 📊 **GitHub Actions**: https://github.com/RobertoPoggi/telemedcare-v11/actions
- ⚙️ **Cloudflare D1**: https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/workers-and-pages/d1
- 🚀 **Cloudflare Pages**: https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/pages

### **Contact**
**Medica GB S.r.l.**  
📧 info@telemedcare.it  
🌐 TeleMedCare V11.0 - Admin Dashboard System

---
**✨ Sistema Admin Dashboard con Workflow Automation**  
*Ultimo aggiornamento: 2025-11-08*