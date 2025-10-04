# TeleMedCare V11.0 Modular - Manuale Deployment

## Panoramica

Questo manuale fornisce le istruzioni complete per il deployment di TeleMedCare V11.0 Modular su Cloudflare Pages/Workers. Il sistema è progettato per deployment zero-cost con performance globali edge-computing.

---

## Prerequisiti

### Requisiti Software
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0  
- **Git**: >= 2.30.0
- **Account Cloudflare**: Con piano Free o superiore

### Competenze Richieste
- Conoscenza base terminale/command line
- Familiarità con Git e GitHub
- Comprensione base servizi cloud Cloudflare

---

## Fase 1: Setup Ambiente Locale

### 1.1 Clone Repository

```bash
# Clone del repository del progetto
git clone https://github.com/your-org/telemedcare-v11-modular.git
cd telemedcare-v11-modular

# Verifica contenuto
ls -la
# Dovresti vedere: src/, docs/, package.json, wrangler.toml, etc.
```

### 1.2 Installazione Dipendenze

```bash
# Installazione dipendenze npm
npm install

# Verifica installazione
npm list --depth=0
```

**Dipendenze Principali Installate**:
- `hono`: Framework web per Cloudflare Workers
- `wrangler`: CLI per Cloudflare development e deployment
- `vite`: Build tool per bundling TypeScript
- `@cloudflare/workers-types`: TypeScript types

### 1.3 Verifica Build Locale

```bash
# Build del progetto
npm run build

# Verifica output
ls -la dist/
# Dovresti vedere: _worker.js, _routes.json, static assets
```

---

## Fase 2: Configurazione Cloudflare

### 2.1 Account Cloudflare Setup

1. **Crea Account Cloudflare** (se non presente):
   - Vai su [cloudflare.com](https://cloudflare.com)
   - Registra account gratuito
   - Verifica email

2. **Ottieni API Token**:
   - Vai su "My Profile" → "API Tokens"
   - Click "Create Token"
   - Seleziona template "Custom token"
   - **Permissions**:
     ```
     Account - Cloudflare Pages:Edit
     Zone - Zone Settings:Read
     Zone - Zone:Read
     ```
   - **Account Resources**: Include all accounts
   - **Zone Resources**: Include all zones
   - Click "Continue to summary" → "Create Token"
   - **⚠️ IMPORTANTE**: Salva il token in un posto sicuro!

### 2.2 Configurazione Wrangler

```bash
# Login con Wrangler (metodo raccomandato)
npx wrangler auth login

# OPPURE configurazione manuale con token
# npx wrangler auth token <YOUR_API_TOKEN>

# Verifica autenticazione
npx wrangler whoami
```

### 2.3 Verifica wrangler.toml

Controlla il file `wrangler.toml` nella root del progetto:

```toml
# wrangler.toml
name = "telemedcare-v11-modular"
main = "src/index.tsx"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Per Pages deployment
pages_build_output_dir = "./dist"

# Database D1 (opzionale per sviluppo locale)
[[d1_databases]]
binding = "DB"
database_name = "telemedcare-production"
database_id = "" # Verrà popolato dopo creazione DB
```

---

## Fase 3: Setup Database D1

### 3.1 Creazione Database Production

```bash
# Creazione database D1 per production
npx wrangler d1 create telemedcare-production

# Output simile a:
# ✅ Successfully created DB 'telemedcare-production' in region EEUR
# Created your database using D1's new storage backend.
# 
# [[d1_databases]]
# binding = "DB"
# database_name = "telemedcare-production"
# database_id = "12345678-1234-1234-1234-123456789012"
```

### 3.2 Aggiorna wrangler.toml

Copia il `database_id` dall'output precedente nel file `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "telemedcare-production"
database_id = "12345678-1234-1234-1234-123456789012"  # ← Inserisci qui il tuo ID
```

### 3.3 Migrazioni Database

```bash
# Applica migrazioni al database production
npx wrangler d1 migrations apply telemedcare-production

# Verifica tabelle create
npx wrangler d1 execute telemedcare-production --command="SELECT name FROM sqlite_master WHERE type='table';"
```

**Tabelle Create**:
- `leads` - Gestione lead principali
- `lead_scoring_history` - Storico scoring AI  
- `audit_logs` - Audit trail sistema
- `system_config` - Configurazioni globali
- `partner_config` - Config partner specifiche
- `dispositivi` - Inventario dispositivi
- `rma_requests` - Richieste RMA
- E altre tabelle enterprise...

---

## Fase 4: Deployment su Cloudflare Pages

### 4.1 Build Production

```bash
# Build ottimizzato per production
npm run build

# Verifica dimensione bundle
ls -lah dist/_worker.js
# Deve essere < 10MB (limite Cloudflare Workers)
```

### 4.2 Creazione Progetto Cloudflare Pages

```bash
# Crea nuovo progetto Pages
npx wrangler pages project create telemedcare-v11-modular \
  --production-branch main \
  --compatibility-date 2024-01-01

# Output conferma creazione progetto
```

### 4.3 Deploy Iniziale

```bash
# Deploy su Cloudflare Pages
npx wrangler pages deploy dist --project-name telemedcare-v11-modular

# Output simile a:
# ✨ Success! Uploaded 15 files (2.34 sec)
# 
# ✨ Deployment complete! Take a look at your site at:
# https://12345678.telemedcare-v11-modular.pages.dev
# 
# ✨ View logs at:
# https://dash.cloudflare.com/...
```

### 4.4 Configurazione Custom Domain (Opzionale)

```bash
# Aggiungi dominio personalizzato (solo se hai dominio)
npx wrangler pages domain add telemedcare.yourdomain.com \
  --project-name telemedcare-v11-modular
```

---

## Fase 5: Configurazione Variabili Environment

### 5.1 Development Variables

Crea file `.dev.vars` per sviluppo locale:

```bash
# .dev.vars (non committare in Git!)
# Variabili per sviluppo locale

# API Keys partner (opzionali)
IRBEMA_API_KEY=your_irbema_test_key
AON_API_KEY=your_aon_test_key
MONDADORI_API_KEY=your_mondadori_test_key
ENDERED_API_KEY=your_endered_test_key

# AI Services (opzionali)
OPENAI_API_KEY=your_openai_key

# Security
JWT_SECRET=your_jwt_secret_min_32_chars
ENCRYPTION_KEY=your_encryption_key_32_chars

# Email Service (opzionali)
EMAIL_API_KEY=your_email_service_key
EMAIL_FROM=noreply@yourdomain.com
EMAIL_TO_INFO=info@yourdomain.com
```

### 5.2 Production Secrets

```bash
# Configura secrets per production
npx wrangler pages secret put IRBEMA_API_KEY \
  --project-name telemedcare-v11-modular
# Inserisci il valore quando richiesto

npx wrangler pages secret put AON_API_KEY \
  --project-name telemedcare-v11-modular

npx wrangler pages secret put JWT_SECRET \
  --project-name telemedcare-v11-modular

npx wrangler pages secret put ENCRYPTION_KEY \
  --project-name telemedcare-v11-modular

# Lista secrets configurati
npx wrangler pages secret list \
  --project-name telemedcare-v11-modular
```

---

## Fase 6: Test e Verifica

### 6.1 Test Locale

```bash
# Avvia server locale con D1 local
npx wrangler pages dev dist --d1=telemedcare-production --local

# Verifica endpoints
curl http://localhost:8788
curl http://localhost:8788/api/status
curl http://localhost:8788/api/enterprise/system/health
```

### 6.2 Test Production

```bash
# Test deployment production
curl https://your-project.pages.dev
curl https://your-project.pages.dev/api/status

# Verifica sistema enterprise
curl https://your-project.pages.dev/api/enterprise/system/health
```

**Response Attesa**:
```json
{
  "success": true,
  "health": {
    "system": "TeleMedCare V11.0 Modular Enterprise",
    "status": "active",
    "modules": {
      "leadConfig": true,
      "leadCore": true,
      "leadChannels": true,
      "leadConversion": true,
      "leadScoring": true,
      "leadReports": true,
      "dispositivi": true,
      "pdf": true,
      "utils": true,
      "logging": true
    },
    "database": true,
    "version": "V11.0-Modular-Enterprise"
  }
}
```

---

## Fase 7: Monitoring e Maintenance

### 7.1 Monitoring Cloudflare

1. **Dashboard Cloudflare**:
   - Vai su Cloudflare Dashboard
   - Sezione "Workers & Pages"
   - Seleziona il tuo progetto
   - Tab "Analytics" per metriche

2. **Metriche Importanti**:
   - Request per second
   - Latenza media
   - Error rate
   - CPU time utilizzato

### 7.2 Log Analysis

```bash
# Visualizza logs real-time
npx wrangler pages deployment tail \
  --project-name telemedcare-v11-modular

# Logs di una specifica deployment
npx wrangler pages deployment list \
  --project-name telemedcare-v11-modular

npx wrangler pages deployment tail <deployment-id> \
  --project-name telemedcare-v11-modular
```

### 7.3 Database Maintenance

```bash
# Backup database (export SQL)
npx wrangler d1 execute telemedcare-production \
  --command="SELECT * FROM leads" \
  --output backup_leads_$(date +%Y%m%d).json

# Statistiche database
npx wrangler d1 execute telemedcare-production \
  --command="SELECT 
    (SELECT COUNT(*) FROM leads) as total_leads,
    (SELECT COUNT(*) FROM audit_logs) as total_audit_logs,
    (SELECT COUNT(*) FROM dispositivi) as total_devices;"
```

---

## Fase 8: Aggiornamenti e Redeploy

### 8.1 Workflow Aggiornamento

```bash
# 1. Pull modifiche da Git
git pull origin main

# 2. Installa nuove dipendenze (se presenti)
npm install

# 3. Build aggiornato
npm run build

# 4. Test locale
npx wrangler pages dev dist --d1=telemedcare-production --local
# Testa su http://localhost:8788

# 5. Deploy production
npx wrangler pages deploy dist --project-name telemedcare-v11-modular
```

### 8.2 Rollback (se necessario)

```bash
# Lista deployments
npx wrangler pages deployment list \
  --project-name telemedcare-v11-modular

# Rollback a deployment precedente
npx wrangler pages deployment promote <previous-deployment-id> \
  --project-name telemedcare-v11-modular
```

---

## Fase 9: Configurazione CI/CD (Opzionale)

### 9.1 GitHub Actions Setup

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: telemedcare-v11-modular
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 9.2 GitHub Secrets

Nel repository GitHub, vai su Settings → Secrets → Actions:

- `CLOUDFLARE_API_TOKEN`: Il tuo token Cloudflare
- `CLOUDFLARE_ACCOUNT_ID`: ID account Cloudflare

---

## Troubleshooting

### Problemi Comuni

#### 1. "Build failed" - Bundle troppo grande
```bash
# Verifica dimensioni bundle
npx wrangler pages deploy dist --compatibility-date=2024-01-01

# Se > 10MB, ottimizza il bundle:
# - Rimuovi dipendenze non utilizzate
# - Usa dynamic imports per moduli opzionali
# - Minimizza asset statici
```

#### 2. "Database not found"
```bash
# Verifica configurazione D1
npx wrangler d1 list

# Verifica wrangler.toml ha database_id corretto
grep -A5 "d1_databases" wrangler.toml

# Ricrea database se necessario
npx wrangler d1 create telemedcare-production-new
```

#### 3. "Runtime error: Disallowed operation"
```bash
# Errore global scope - verifica moduli
# NON fare operazioni async nel global scope
# Usa lazy initialization

# Fix tipico:
# ❌ const cache = new Map()
# ✅ let cache: Map | undefined
#     const getCache = () => cache ??= new Map()
```

#### 4. "Environment variables not available"
```bash
# Verifica secrets production
npx wrangler pages secret list \
  --project-name telemedcare-v11-modular

# Aggiungi secrets mancanti
npx wrangler pages secret put SECRET_NAME \
  --project-name telemedcare-v11-modular
```

#### 5. Performance Issues
```bash
# Monitoring performance
npx wrangler pages deployment tail \
  --project-name telemedcare-v11-modular

# Analizza metriche Cloudflare Dashboard:
# - CPU time per request
# - Memory usage
# - Request latency

# Ottimizzazioni:
# - Implementa caching appropriato
# - Usa async/await correttamente
# - Minimizza query database
```

---

## Checklist Deployment

### Pre-Deployment
- [ ] Account Cloudflare configurato
- [ ] Wrangler CLI installato e autenticato  
- [ ] Database D1 creato e migrato
- [ ] Variables/secrets configurate
- [ ] Build locale funzionante
- [ ] Test endpoint critici

### Deployment
- [ ] Build production completato
- [ ] Deploy su Cloudflare Pages eseguito
- [ ] URL production accessibile
- [ ] Health check endpoints rispondono
- [ ] Database production collegato

### Post-Deployment  
- [ ] Test funzionalità critiche
- [ ] Monitoring configurato
- [ ] Backup database schedulato
- [ ] Documentazione aggiornata
- [ ] Team notificato del deploy

---

## Limiti Cloudflare Free Plan

### Limiti da Considerare
- **Requests**: 100,000/giorno
- **Workers CPU Time**: 10ms per request
- **D1 Database**: 5GB storage, 25M row reads/giorno
- **KV Storage**: 1GB storage
- **Pages Build**: 500 build/mese

### Upgrade Raccomandati
Per utilizzo enterprise, considera:
- **Workers Paid Plan** ($5/mese): CPU time illimitato
- **Pages Pro** ($20/mese): Build illimitati  
- **D1 Scale** ($0.001 per 1K reads): Per database intensivi

---

## Supporto e Risorse

### Documentazione Ufficiale
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [D1 Database Docs](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

### Community
- [Cloudflare Discord](https://discord.cloudflare.com)
- [Cloudflare Forum](https://community.cloudflare.com)
- [GitHub Issues](https://github.com/cloudflare/workers-sdk/issues)

### Contatti Tecnici
Per supporto TeleMedCare V11.0 Modular:
- **Email**: tech-support@medicagb.it
- **Documentazione**: `/docs/` in repository
- **Issues**: GitHub repository issues

---

## Conclusione

Seguendo questo manuale, avrai deployato con successo TeleMedCare V11.0 Modular su Cloudflare Pages con:

- ✅ **Zero-Cost Deployment**: Completamente gratuito per iniziare
- ✅ **Global Performance**: Edge computing in 200+ città
- ✅ **Scalabilità Automatica**: Handle automatico picchi traffico
- ✅ **Database Globale**: D1 SQLite distribuito
- ✅ **Security Built-in**: HTTPS, DDoS protection automatici
- ✅ **Monitoring Integrato**: Analytics e logging inclusi

Il sistema è ora pronto per gestire lead medicali enterprise con performance e affidabilità di livello mondiale.

**Medica GB S.r.l. - "La tecnologia che ti salva salute e vita"**

---

*Manuale Deployment v1.0 - TeleMedCare V11.0 Modular - Ottobre 2025*