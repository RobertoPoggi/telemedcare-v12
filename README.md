# TeleMedCare V10.3.8-Cloudflare

## Project Overview
- **Name**: TeleMedCare Email Workflow System
- **Goal**: Sistema completo di gestione lead e workflow email automatizzato per TeleMedCare - migrato da Google Apps Script a Cloudflare Pages + Hono
- **Features**: Landing page, elaborazione lead, workflow email automatico, template sistema integrato, architettura zero-cost

## URLs
- **Development**: https://3000-idwqoqugv4veuz7fzj90r-6532622b.e2b.dev
- **Landing Page**: https://3000-idwqoqugv4veuz7fzj90r-6532622b.e2b.dev
- **API Status**: https://3000-idwqoqugv4veuz7fzj90r-6532622b.e2b.dev/api/status
- **GitHub**: (Da configurare)

## Data Architecture
- **Data Models**: 
  - Lead (richiedente, assistito, servizio, richieste aggiuntive)
  - Email Templates (embedded per zero-cost deployment)
  - Workflow State (notifiche, documenti, contratti)
- **Storage Services**: 
  - Cloudflare D1 SQLite (per produzione)
  - Memory/Log storage (per development)
- **Data Flow**: 
  1. Form submission → Lead validation & normalization
  2. Lead storage (D1 database)
  3. Automated email workflow execution
  4. Template processing with placeholder substitution

## User Guide
### Per gli utenti finali:
1. Visita la landing page TeleMedCare
2. Compila il form di richiesta informazioni con tutti i dati richiesti
3. Seleziona il piano di interesse (Base o Avanzato)
4. Scegli se ricevere contratto, brochure e/o manuale
5. Invia la richiesta - riceverai conferma via email

### Per gli amministratori:
1. Le notifiche arrivano automaticamente a info@medicagb.it
2. I documenti richiesti sono inviati automaticamente al cliente
3. Il sistema traccia tutti i lead con ID univoci
4. Accesso API per monitoraggio: `/api/status` e `/api/leads`

## Functional Entry URIs
### Frontend
- **GET /** - Landing page TeleMedCare completa (replica esatta dell'originale)

### API Endpoints
- **POST /api/lead** - Riceve lead dal form e attiva workflow email
  - Content-Type: multipart/form-data
  - Campi richiesti: nomeRichiedente, cognomeRichiedente, emailRichiedente, nomeAssistito, cognomeAssistito
  - Campi opzionali: tutti gli altri campi del form
  - Response: {success, leadId, message, timestamp, workflow}

- **GET /api/status** - Status del sistema TeleMedCare
  - Response: {system, status, timestamp, version}

- **GET /api/leads** - Lista lead (admin - richiede D1 configurato)
  - Response: {success, count, leads} o {success: false, error}

### Static Assets
- **GET /static/*** - File statici (CSS, JS, immagini)

## Features Completed
✅ **Landing Page Completa**: Replica esatta del www.telemedcare.it originale  
✅ **Form Processing**: Elaborazione completa FormData con validazione  
✅ **Lead Management**: Generazione ID univoci, normalizzazione dati  
✅ **Email Workflow**: Sistema automatico per notifiche, documenti, contratti  
✅ **Template System**: Template HTML embedded per zero-cost deployment  
✅ **Placeholder Engine**: Sistema di sostituzione variabili nei template  
✅ **API Complete**: Endpoint funzionali per status e lead processing  
✅ **Error Handling**: Gestione robusta errori e validazione dati  
✅ **Development Mode**: Funzionamento senza D1 per development  
✅ **PM2 Integration**: Gestione servizio con PM2 per stabilità  

## Features Not Yet Implemented
❌ **Database D1 Production**: Configurazione D1 database per persistenza produzione  
❌ **Email Service Integration**: Integrazione servizio email reale (SendGrid/Mailgun)  
❌ **PDF Generation**: Generazione contratti e proforma personalizzati  
❌ **Document Storage**: Storage documenti (brochure, manuale) con Cloudflare R2  
❌ **Admin Dashboard**: Interfaccia admin per gestione lead  
❌ **GitHub Integration**: Setup repository e deployment automatico  
❌ **Cloudflare Deployment**: Deploy produzione su Cloudflare Pages  

## Recommended Next Steps
1. **Database Setup**: Configurare D1 database produzione
   ```bash
   npx wrangler d1 create telemedcare-production
   # Aggiornare wrangler.jsonc con database_id
   npx wrangler d1 migrations apply telemedcare-production --local
   ```

2. **Email Service**: Integrare servizio email reale
   - Configurare API keys per SendGrid/Mailgun  
   - Sostituire console.log con chiamate email API
   - Configurare secrets Cloudflare per API keys

3. **PDF Generation**: Implementare generazione documenti
   - Integrare libreria PDF (puppeteer/jsPDF)
   - Creare template contratti Base/Avanzato
   - Sistema proforma automatica con prezzi

4. **Production Deployment**: Deploy su Cloudflare Pages
   - Setup GitHub repository
   - Configurare Cloudflare API keys
   - Deploy automatico con wrangler

## Deployment
- **Platform**: Cloudflare Pages + Workers
- **Status**: ✅ Development Active - ❌ Production Not Deployed
- **Tech Stack**: Hono + TypeScript + TailwindCSS + Cloudflare D1
- **Last Updated**: 2025-10-03

## System Version
**TeleMedCare V10.3.8-Cloudflare** - Sistema completo migrato da Google Apps Script con architettura zero-cost per Cloudflare Pages.

## Development Commands
```bash
# Build del progetto
npm run build

# Avvio development server
pm2 start ecosystem.config.cjs

# Test API
curl http://localhost:3000/api/status

# Test form submission
curl -X POST http://localhost:3000/api/lead -F "nomeRichiedente=Test" -F "cognomeRichiedente=User" -F "emailRichiedente=test@test.com" -F "nomeAssistito=Test" -F "cognomeAssistito=Assistito" -F "gdprConsent=on"

# Logs
pm2 logs --nostream

# Database migrations (quando D1 configurato)
npx wrangler d1 migrations apply telemedcare-production --local
```