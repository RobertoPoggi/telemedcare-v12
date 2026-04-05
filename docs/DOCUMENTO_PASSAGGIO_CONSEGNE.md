# 📋 DOCUMENTO PASSAGGIO CONSEGNE - TeleMedCare V12.0

**Data**: 26 Febbraio 2026  
**Progetto**: TeleMedCare V12.0 - Sistema CRM & Workflow  
**Repository**: https://github.com/RobertoPoggi/telemedcare-v12  
**Deploy**: https://telemedcare-v12.pages.dev  
**Cliente**: Roberto Poggi / Medica GB S.r.l.

---

## 🚨 PROBLEMI CRITICI APERTI (PRIORITÀ MASSIMA)

### ❌ PROBLEMA 1: REDIRECT INDESIDERATO DOPO FIRMA CONTRATTO

**Descrizione problema**:
- Utente firma contratto su `/firma-contratto.html?contractId=XXX`
- Dopo click "Conferma Firma" → **redirect automatico a homepage** `https://telemedcare-v12.pages.dev`
- **NON È CACHE** (testato finestra anonima, browser diversi, dispositivi diversi)
- Problema **presente da 1 settimana** senza soluzione

**Comportamento atteso**:
- Utente firma contratto
- Mostra popup "✅ Contratto firmato con successo!"
- **RIMANE sulla pagina** `/firma-contratto.html` (NO redirect)

**Codice coinvolto**:
- **File**: `/home/user/webapp/public/firma-contratto.html`
- **Funzione JS**: `submitSignature()` (righe ~546-606)
- **Backend API**: `/home/user/webapp/src/index.tsx` → `app.post('/api/contracts/sign', ...)` (righe 10323-10632)

**Fix tentati (FALLITI)**:
1. ✅ Rimosso `window.close()` da `firma-contratto.html` (commit `b1fcb92`)
2. ✅ Verificato: NO `window.location.href` nel codice frontend
3. ✅ Verificato: NO `c.redirect()` nel backend
4. ❌ **Il redirect PERSISTE**

**Possibili cause NON verificate**:
1. **HTTP 302/301 redirect** nel backend dopo POST `/api/contracts/sign`
2. **Cloudflare Page Rules** che forzano redirect
3. **Service Worker** che intercetta richieste
4. **Meta tag redirect** in HTML
5. **Hono framework** comportamento default dopo POST
6. **Browser security policy** che blocca popup e forza redirect

**Come replicare**:
1. Vai su https://telemedcare-v12.pages.dev/dashboard
2. Crea nuovo lead
3. Genera contratto per il lead
4. Copia link firma contratto: `/firma-contratto.html?contractId=XXX`
5. Apri link in **finestra anonima**
6. Firma contratto (canvas + consensi)
7. Click "Conferma Firma"
8. **BUG**: redirect a homepage invece di restare su pagina

**Gravità**: 🔴 **CRITICA** - Blocca completamente flusso firma contratto

---

### ❌ PROBLEMA 2: LINK PROFORMA 404 (PARZIALMENTE RISOLTO)

**Descrizione problema**:
- Dopo firma contratto, sistema genera proforma e invia email
- Email contiene link `/pagamento?proformaId=XXX`
- Click link → **404 Pagina non trovata**

**Root cause identificato**:
- Proforma salvata con ID STRING (`"PRF-1709015123456"`) invece di INTEGER
- API `/api/proforma/:id` cerca con `WHERE p.id = ?` (INTEGER)
- Mismatch tipo → record non trovato → 404

**Fix applicato** (commit `0052bc5` - 26 Feb 2026):
- ✅ Rimosso inserimento manuale `proformaId` string
- ✅ Lasciato AUTOINCREMENT SQLite generare ID INTEGER
- ✅ Recuperato ID con `insertResult.meta.last_row_id`
- ✅ Link email ora usa ID numerico: `/pagamento?proformaId=123`

**Stato**: ⚠️ **DA TESTARE** - Fix committato ma NON testato in produzione

**Test necessario**:
1. Firma contratto (dopo deploy fix)
2. Verifica email proforma ricevuta
3. Click link pagamento
4. **DEVE caricare** pagina con dati proforma (NO 404)

**Gravità**: 🔴 **CRITICA** - Blocca flusso pagamenti

---

## 📊 ARCHITETTURA SISTEMA

### Stack Tecnologico

| Componente | Tecnologia | Versione |
|------------|------------|----------|
| **Backend** | Hono (TypeScript) | Latest |
| **Runtime** | Cloudflare Workers | -- |
| **Database** | Cloudflare D1 (SQLite) | -- |
| **Frontend** | HTML5 + Tailwind CSS | 3.x |
| **Hosting** | Cloudflare Pages | -- |
| **Email** | Resend API + SendGrid | -- |
| **Pagamenti** | Stripe API | Latest |
| **Storage** | Cloudflare R2 | -- |
| **Build** | esbuild | Latest |

### File Principali

```
/home/user/webapp/
├── src/
│   ├── index.tsx                          # Backend principale (20,000+ righe)
│   ├── dashboard.tsx                      # Dashboard operativa (10,000+ righe)
│   └── modules/
│       ├── workflow-email-manager.ts      # Gestione email workflow
│       ├── complete-workflow-orchestrator.ts  # Orchestratore stati (1,519 righe)
│       ├── lead-service.ts                # CRUD lead
│       ├── contract-service.ts            # CRUD contratti
│       ├── proforma-manager.ts            # Gestione proforma
│       └── ... (50+ moduli)
│
├── public/
│   ├── index.html                         # Landing page pubblica
│   ├── firma-contratto.html               # ⚠️ PROBLEMA 1 - Pagina firma
│   ├── pagamento.html                     # ⚠️ PROBLEMA 2 - Pagina pagamento
│   ├── configurazione.html                # Form configurazione cliente
│   └── templates/
│       ├── email/                         # 12 template email
│       └── documents/                     # Template contratti/proforma
│
├── migrations/                            # SQL migrations DB
├── wrangler.toml                          # Config Cloudflare Workers
├── package.json                           # Dipendenze npm
└── tsconfig.json                          # Config TypeScript
```

### Endpoints API Critici

**Contratti**:
- `GET /api/contracts/:id` - Recupera contratto
- `POST /api/contracts` - Crea contratto
- `POST /api/contracts/sign` - ⚠️ **PROBLEMA 1** - Firma contratto
- `GET /api/contracts/:id/pdf` - Download PDF contratto

**Proforma**:
- `GET /api/proforma/:id` - ⚠️ **PROBLEMA 2** - Recupera proforma
- `POST /api/proforma` - Crea proforma
- `PUT /api/proforma/:id` - Aggiorna proforma

**Lead**:
- `GET /api/leads` - Lista lead
- `GET /api/leads/:id` - Dettaglio lead
- `POST /api/leads` - Crea lead
- `PUT /api/leads/:id` - Aggiorna lead

### Database Schema (Cloudflare D1)

**Tabelle principali**:

```sql
-- Lead (clienti potenziali)
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomeRichiedente TEXT NOT NULL,
  cognomeRichiedente TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  indirizzoRichiedente TEXT,
  cittaRichiedente TEXT,
  capRichiedente TEXT,
  provinciaRichiedente TEXT,
  cfRichiedente TEXT,
  stato TEXT DEFAULT 'NUOVO',  -- 15 stati possibili
  tipo_piano TEXT,  -- BASE, AVANZATO, PREMIUM
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Contratti
CREATE TABLE contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leadId INTEGER NOT NULL,
  codice_contratto TEXT UNIQUE NOT NULL,
  servizio TEXT,
  piano TEXT,
  prezzo_totale REAL,
  contenuto_html TEXT,
  status TEXT DEFAULT 'PENDING',  -- PENDING, SIGNED
  signature_data TEXT,  -- Base64 firma canvas
  signature_ip TEXT,
  signature_timestamp TEXT,
  signed_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leadId) REFERENCES leads(id)
);

-- Proforma ⚠️ ATTENZIONE: id deve essere INTEGER AUTOINCREMENT
CREATE TABLE proforma (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ⚠️ CRITICO: NO STRING!
  contract_id TEXT,
  leadId INTEGER NOT NULL,
  numero_proforma TEXT UNIQUE NOT NULL,  -- PRF202602-ABCD
  data_emissione TEXT NOT NULL,
  data_scadenza TEXT NOT NULL,
  cliente_nome TEXT,
  cliente_cognome TEXT,
  cliente_email TEXT,
  cliente_telefono TEXT,
  tipo_servizio TEXT,
  prezzo_mensile REAL,
  durata_mesi INTEGER,
  prezzo_totale REAL,
  status TEXT DEFAULT 'SENT',  -- SENT, PAID, EXPIRED
  email_sent BOOLEAN DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leadId) REFERENCES leads(id)
);
```

---

## 🔍 DEBUGGING INFORMAZIONI

### Cloudflare Dashboard

**URL**: https://dash.cloudflare.com

**Account**: RobertoPoggi (usa credenziali GitHub)

**Dove verificare**:
1. **Workers & Pages** → `telemedcare-v12` → **Deployments** (stato deploy)
2. **Workers & Pages** → `telemedcare-v12` → **Logs** (errori runtime)
3. **D1** → `telemedcare_v12_production` → **Console** (query DB manuale)
4. **Analytics** → **Web Analytics** (traffico)

### Log Backend (Cloudflare Workers)

Per vedere log real-time:

```bash
cd /home/user/webapp
npx wrangler tail
```

**Cosa cercare**:
- `❌ [FIRMA→PROFORMA]` → Errori generazione proforma
- `✅ [FIRMA→PROFORMA] Proforma XXX salvata con ID YYY` → Conferma salvataggio
- Qualsiasi `redirect` o `location` nel log

### Test Locale (Dev Environment)

```bash
cd /home/user/webapp

# Installa dipendenze
npm install

# Crea DB locale
npx wrangler d1 execute telemedcare_v12_production --local --file=./migrations/0001_initial_schema.sql

# Avvia dev server
npm run dev
# oppure
npx wrangler pages dev

# Server disponibile su http://localhost:8788
```

**⚠️ NOTA**: Dev server usa DB SQLite locale, NON Cloudflare D1 produzione

### Debug Problema Redirect

**Step consigliati nuovo sviluppatore**:

1. **Ispeziona Network Tab** (Chrome DevTools):
   - Apri `/firma-contratto.html?contractId=XXX`
   - Apri DevTools → Network
   - Firma contratto
   - Verifica richiesta `POST /api/contracts/sign`
   - **Status Code**: 200? 302? 301?
   - **Response Headers**: c'è `Location:`?
   - **Response Body**: cosa ritorna?

2. **Verifica Cloudflare Page Rules**:
   - Dashboard Cloudflare → Rules → Page Rules
   - Cerca redirect automatici configurati

3. **Verifica Meta Tag HTML**:
   ```bash
   cd /home/user/webapp
   grep -n "meta.*http-equiv.*refresh" public/firma-contratto.html
   grep -n "window.location" public/firma-contratto.html
   ```

4. **Test API diretto** (curl):
   ```bash
   # Test POST firma (mock)
   curl -X POST https://telemedcare-v12.pages.dev/api/contracts/sign \
     -H "Content-Type: application/json" \
     -d '{"contractId": "123", "signatureData": "test", "timestamp": "2026-02-26T10:00:00Z"}' \
     -v
   
   # Verifica header risposta (Location?)
   ```

5. **Aggiungi log espliciti** in `src/index.tsx` riga 10618:
   ```typescript
   console.log('🔍 DEBUG: Sto per ritornare JSON response (NO redirect)')
   console.log('🔍 DEBUG: Response headers:', Object.fromEntries(c.res.headers.entries()))
   
   return c.json({ 
     success: true,
     message: 'Contratto firmato con successo',
     contractId: contractId
   })
   ```

6. **Verifica comportamento Hono**:
   - Documentazione: https://hono.dev/api/response
   - Cerca se `c.json()` dopo `c.req.json()` causa side effects

---

## 🔑 CREDENZIALI & ACCESSI

### GitHub

**Repository**: https://github.com/RobertoPoggi/telemedcare-v12  
**Branch principale**: `main`  
**Ultimo commit**: `0052bc5` (26 Feb 2026)

**Setup credenziali** (già configurato in sandbox):
```bash
cd /home/user/webapp
git remote -v
# origin  https://github.com/RobertoPoggi/telemedcare-v12.git
```

**Clone per nuovo sviluppatore**:
```bash
git clone https://github.com/RobertoPoggi/telemedcare-v12.git
cd telemedcare-v12
git checkout main
npm install
```

### Cloudflare

**Account**: Collegato a GitHub RobertoPoggi

**Variabili Ambiente** (Cloudflare Dashboard → Workers & Pages → Settings → Environment Variables):

```bash
# Email (Resend)
RESEND_API_KEY=[chiedi a Roberto]

# Email Fallback (SendGrid)
SENDGRID_API_KEY=[chiedi a Roberto]

# Pagamenti (Stripe)
STRIPE_SECRET_KEY=[chiedi a Roberto]
STRIPE_WEBHOOK_SECRET=[chiedi a Roberto]

# Database
DB=telemedcare_v12_production  # Binding Cloudflare D1

# Storage
R2_BUCKET=telemedcare-documents  # Binding Cloudflare R2

# URL pubblico
PUBLIC_URL=https://telemedcare-v12.pages.dev
```

**⚠️ IMPORTANTE**: Tutte le chiavi API devono essere richieste a Roberto Poggi. NON committare chiavi reali nel repository.

### Database D1

**Nome**: `telemedcare_v12_production`

**Access** via CLI:
```bash
# Lista tabelle
npx wrangler d1 execute telemedcare_v12_production --command="SELECT name FROM sqlite_master WHERE type='table';"

# Query lead
npx wrangler d1 execute telemedcare_v12_production --command="SELECT * FROM leads ORDER BY id DESC LIMIT 10;"

# Query proforma
npx wrangler d1 execute telemedcare_v12_production --command="SELECT id, numero_proforma, leadId, status FROM proforma ORDER BY id DESC LIMIT 10;"

# Verifica tipo colonna id proforma (deve essere INTEGER)
npx wrangler d1 execute telemedcare_v12_production --command="PRAGMA table_info(proforma);"
```

### Email (Resend)

**Dashboard**: https://resend.com/dashboard  
**Account**: Collegato email Roberto Poggi

**Verifica invii**:
- Dashboard → Emails → Recent
- Log email con stato (Delivered, Bounced, Failed)

---

## 📈 WORKFLOW SISTEMA (15 STATI)

```
1. NUOVO                 → Lead acquisito
2. CONTATTATO            → Primo contatto effettuato
3. QUALIFICATO           → Lead interessato
4. BROCHURE_INVIATA      → Brochure inviata via email
5. CONTRATTO_INVIATO     → Contratto generato e inviato
6. CONTRATTO_FIRMATO     → ⚠️ PROBLEMA 1 - Firma ricevuta
7. PROFORMA_INVIATA      → ⚠️ PROBLEMA 2 - Proforma generata e inviata
8. PAGAMENTO_RICEVUTO    → Pagamento confermato
9. CONFIGURAZIONE_INVIATA → Form configurazione inviato
10. CONFIGURATO          → Dati configurazione ricevuti
11. DISPOSITIVO_ASSEGNATO → Device SiDLY assegnato
12. DISPOSITIVO_SPEDITO   → Device spedito con tracking
13. DISPOSITIVO_CONSEGNATO → Device consegnato
14. ATTIVO               → Servizio attivato
15. CHIUSO/ANNULLATO     → Pratica chiusa
```

**Transizioni automatiche**:
- `CONTRATTO_FIRMATO` → `PROFORMA_INVIATA` (automatico, codice righe 10511-10616 `src/index.tsx`)
- `PAGAMENTO_RICEVUTO` → `CONFIGURAZIONE_INVIATA` (automatico, webhook Stripe)

---

## 🐛 ALTRI PROBLEMI NOTI (MINORI)

### 1. Dashboard lenta con >1000 lead
- **Causa**: Query SQL senza LIMIT/paginazione
- **Fix**: Aggiungere paginazione lato server

### 2. Template email hardcoded
- **Causa**: Template in HTML inline invece di DB
- **Fix**: Migrare template su tabella `email_templates` in D1

### 3. PDF contratti non generati
- **Causa**: Puppeteer non disponibile su Cloudflare Workers
- **Workaround**: Link download PDF punta a HTML renderizzato
- **Fix definitivo**: Usare servizio esterno (PDF.co, DocRaptor)

### 4. Upload logo cliente mancante
- **Funzionalità**: Form lead non permette upload logo
- **Fix**: Aggiungere campo upload su R2 Bucket

---

## 📚 DOCUMENTAZIONE DISPONIBILE

Nel repository `/home/user/webapp/`:

1. **DOCUMENTAZIONE_FUNZIONALE_TELEMEDCARE_V12_FINALE.html** (79 KB)
   - Documento funzionale completo (NON tecnico)
   - 100 pagine, tutti i flussi operativi, GDPR, ROI
   - Convertibile PDF/DOCX

2. **RIEPILOGO_COMPLETO_PROGETTO_TELEMEDCARE.md** (62 KB)
   - Riepilogo tecnico completo
   - Architettura, componenti, API, DB schema

3. **README.md** (9 KB)
   - Quick start, setup, deploy

4. **INDICE_DOCUMENTAZIONE.md** (10 KB)
   - Indice tutti i documenti disponibili

---

## ✅ CHECKLIST NUOVO SVILUPPATORE

### Setup Iniziale
- [ ] Clone repository: `git clone https://github.com/RobertoPoggi/telemedcare-v12.git`
- [ ] Installa dipendenze: `npm install`
- [ ] Verifica credenziali Cloudflare (chiedi a Roberto)
- [ ] Setup wrangler: `npx wrangler login`
- [ ] Test dev locale: `npm run dev`

### Debug Problema 1 (Redirect)
- [ ] Apri `/firma-contratto.html` in browser con DevTools Network aperto
- [ ] Firma contratto e cattura richiesta `POST /api/contracts/sign`
- [ ] Verifica Status Code (200 OK? 302 Redirect?)
- [ ] Verifica Response Headers (c'è `Location:`?)
- [ ] Verifica Response Body (JSON corretto?)
- [ ] Cerca `window.location` in tutto il codice frontend
- [ ] Cerca `c.redirect()` in tutto il codice backend
- [ ] Testa API con curl diretto (bypass frontend)
- [ ] Verifica Cloudflare Page Rules (dashboard)
- [ ] Aggiungi log espliciti pre-response backend

### Test Problema 2 (Proforma 404)
- [ ] Firma contratto (dopo deploy fix commit `0052bc5`)
- [ ] Verifica email proforma ricevuta
- [ ] Copia link `/pagamento?proformaId=XXX`
- [ ] Verifica che `XXX` sia un numero INTEGER (es: `123` NON `PRF-123456`)
- [ ] Apri link → **DEVE caricare** pagina con dati proforma
- [ ] Verifica query DB: `SELECT * FROM proforma WHERE id = XXX` ritorna record

### Deploy & Test E2E
- [ ] Commit fix: `git add -A && git commit -m "Fix problema redirect"`
- [ ] Push: `git push origin main`
- [ ] Verifica deploy Cloudflare (2-5 min)
- [ ] Test completo: Lead → Contratto → Firma → Email → Pagamento → Attivazione
- [ ] Verifica ogni transizione stato automatica

---

## 📞 CONTATTI

**Cliente**: Roberto Poggi  
**Azienda**: Medica GB S.r.l.  
**Email**: (chiedi a Roberto)  
**Telefono**: (chiedi a Roberto)

**Repository Issues**: https://github.com/RobertoPoggi/telemedcare-v12/issues

---

## 🎯 PRIORITÀ INTERVENTI

### 🔴 PRIORITÀ 1 (CRITICA - IMMEDIATA)
1. **Risolvere redirect dopo firma contratto** (Problema 1)
2. **Testare fix proforma 404** (Problema 2)

### 🟡 PRIORITÀ 2 (ALTA - ENTRO 1 SETTIMANA)
3. Ottimizzare performance dashboard con >1000 lead
4. Implementare generazione PDF contratti (servizio esterno)

### 🟢 PRIORITÀ 3 (MEDIA - ENTRO 1 MESE)
5. Migrare template email su DB
6. Implementare upload logo cliente
7. Migliorare UX form firma contratto (preview scroll)

---

## 📝 NOTE FINALI

**Ultimo aggiornamento**: 26 Febbraio 2026 ore 01:45  
**Ultimo commit**: `0052bc5` - Fix proforma ID (TESTARE)  
**Branch attivo**: `main`  
**Deploy attivo**: https://telemedcare-v12.pages.dev

**Stato sistema**:
- ✅ Backend funzionante (API, DB, Email)
- ✅ Dashboard operativa funzionante
- ✅ Workflow 15 stati implementato
- ❌ **Firma contratto bloccata da redirect** (1 settimana)
- ⚠️ **Pagamento proforma** (fix committato, DA TESTARE)

**Il problema redirect è CRITICO e BLOCCA tutto il flusso commerciale.**

Il nuovo sviluppatore deve concentrarsi **esclusivamente** su questo problema prima di qualsiasi altra attività.

---

**Buona fortuna al nuovo sviluppatore.**

**Se hai bisogno chiarimenti su questo documento, contatta Roberto Poggi.**
