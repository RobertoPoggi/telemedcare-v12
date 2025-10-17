# 📂 TeleMedCare V11.0 - Struttura File Progetto

## 🎯 **ARCHITETTURA MODULARE**

Il progetto TeleMedCare V11.0 è ora organizzato con **architettura modulare** per massima flessibilità e manutenibilità.

## 📁 **STRUTTURA FILE PRINCIPALE**

### **🚀 File di Entry Point**

#### **`src/index.tsx` - LANDING PAGE + API CORE**
- **Funzione:** Landing page principale + API endpoints essenziali
- **Dimensioni:** ~320KB
- **Contenuto:**
  - ✅ Landing page completa con form funzionante
  - ✅ EmailService con RESEND/SENDGRID sicuro
  - ✅ API endpoints core per lead management
  - ✅ Database D1 integration
  - ✅ Workflow email automatico

#### **`src/dashboard.tsx` - DASHBOARD ENTERPRISE COMPLETE**
- **Funzione:** Tutte le dashboard operative e admin
- **Dimensioni:** ~400KB  
- **Contenuto:**
  - ✅ Dashboard operativa (`/dashboard`)
  - ✅ Data dashboard (`/admin/data-dashboard`)
  - ✅ Magazzino dispositivi (`/admin/devices`)
  - ✅ Testing dashboard (`/admin/testing-dashboard`)
  - ✅ Admin docs (`/admin/docs`)
  - ✅ Sistema contratti e pagamenti
  - ✅ Analytics e KPI enterprise
  - ✅ 40+ funzioni amministrative

## 🔧 **MODALITÀ DI UTILIZZO**

### **Opzione 1: Solo Landing Page (Produzione Leggera)**
```bash
# Usa index.tsx come main entry point
# Build size: ~320KB
# Funzioni: Landing + lead capture + email automation
```

### **Opzione 2: Sistema Enterprise Completo**
```bash
# Usa dashboard.tsx come main entry point  
# Build size: ~400KB
# Funzioni: Tutte le dashboard + admin + analytics
```

### **Opzione 3: Sistema Ibrido (RACCOMANDATO)**
```bash
# index.tsx per public-facing (landing)
# dashboard.tsx per admin/internal (dashboard)
# Deploy due applicazioni separate
```

## ⚙️ **CONFIGURAZIONE DEPLOYMENT**

### **Landing Page Only (wrangler.jsonc)**
```jsonc
{
  "name": "telemedcare-landing",
  "main": "src/index.tsx",
  "compatibility_date": "2024-01-01"
}
```

### **Dashboard Enterprise (wrangler-dashboard.jsonc)**
```jsonc
{
  "name": "telemedcare-dashboard", 
  "main": "src/dashboard.tsx",
  "compatibility_date": "2024-01-01"
}
```

## 🌐 **URL STRUCTURE PIANIFICATA**

### **Dominio Landing (Pubblico)**
- `https://telemedcare.it/` - Landing page + lead capture
- `https://telemedcare.it/api/lead` - API pubblica lead

### **Dominio Dashboard (Admin/Interno)**
- `https://admin.telemedcare.it/dashboard` - Dashboard operativa
- `https://admin.telemedcare.it/admin/data-dashboard` - Analytics
- `https://admin.telemedcare.it/admin/devices` - Gestione dispositivi

## 📋 **VANTAGGI ARCHITETTURA MODULARE**

### ✅ **Separazione Responsabilità**
- **Frontend pubblico** separato da **admin interno**
- **Performance ottimizzate** per ogni use case
- **Security enhanced** (admin su dominio separato)

### ✅ **Deployment Flessibile**
- **Scala indipendentemente** landing vs dashboard
- **Update separati** senza impatti cross-system
- **Costi ottimizzati** per traffico differenziato

### ✅ **Manutenibilità**
- **Codebase modulare** più facile da mantenere
- **Team separation** (frontend team vs backend team)
- **Testing isolato** per ogni componente

## 🔄 **WORKFLOW SVILUPPO**

### **Sviluppo Landing Page**
```bash
# Lavora su src/index.tsx
npm run dev
# Test: http://localhost:3000
```

### **Sviluppo Dashboard**
```bash
# Temporaneamente rinomina dashboard.tsx -> index.tsx
mv src/index.tsx src/index-landing.tsx
mv src/dashboard.tsx src/index.tsx
npm run build && pm2 restart telemedcare
# Test dashboard: http://localhost:3000/dashboard
```

### **Ripristino per Production**
```bash
# Ripristina struttura originale
mv src/index.tsx src/dashboard.tsx  
mv src/index-landing.tsx src/index.tsx
```

## 📚 **FILE BACKUP E VERSIONI**

- `src/index-landing-only.tsx` - Backup landing page originale
- `src/index-full.tsx` - Sistema completo (per reference)
- `src/index-dashboard-operativa.tsx` - Dashboard operativa specializzata
- `src/dashboard.tsx` - **Dashboard enterprise complete (NUOVO)**

## 🎯 **RACCOMANDAZIONI**

### **Per Sviluppo Rapido:**
Usa `src/dashboard.tsx` rinominato come `src/index.tsx` temporaneamente per testare tutte le funzionalità.

### **Per Produzione:**
Mantieni `src/index.tsx` (landing) e `src/dashboard.tsx` (admin) separati, deploy su domini diversi.

### **Per Testing Completo:**
Usa `src/index-full.tsx` che contiene tutto in un file unico.

---
**Struttura Modulare TeleMedCare V11.0**  
*Aggiornato: $(date '+%Y-%m-%d %H:%M')*