# 🎯 Strategia Implementazione Completa TeleMedCare V12

**Data**: 9 Febbraio 2026  
**Developer**: GenSpark AI Developer  
**Campagna attiva**: Facebook, Instagram, Google ADS, META  
**Email Provider**: Resend (API keys già configurate)

---

## 📋 PRIORITÀ RIVISTE (in base alle tue indicazioni)

### 🔴 FASE 1: TEMPLATES & WORKFLOW COMPLETO (Priorità MASSIMA)
**Obiettivo**: Sistema completamente automatizzato dal lead alla fatturazione

#### 1.1 Template Email (via Resend) ✅ ESISTENTI
**Localizzazione**: `/templates/email_*.html`  
**Sistema di caricamento**: `template-loader-clean.ts` + `renderTemplate()`

**Template Email Attivi**:
```
✅ email_notifica_info.html           → Notifica nuovo lead a info@
✅ email_documenti_informativi.html   → Brochure/manuale al lead
✅ email_invio_contratto.html         → Contratto + link firma
✅ email_invio_proforma.html          → Proforma + istruzioni pagamento
✅ email_benvenuto.html               → Welcome dopo pagamento
✅ email_configurazione.html          → Notifica config a info@
✅ email_conferma_attivazione.html    → Attivazione servizio
✅ email_spedizione.html              → Tracking spedizione dispositivo
✅ email_promemoria_pagamento.html    → Reminder scadenza
✅ email_promemoria_rinnovo.html      → Reminder rinnovo annuale
```

**Template Email Avanzati** (nurturing/retention):
```
✅ email_followup_call.html           → Follow-up dopo chiamata
✅ email_checkin_mensile.html         → Check-in mensile cliente
✅ email_survey_soddisfazione.html    → Survey NPS
✅ email_referral_programma.html      → Programma referral
✅ email_upgrade_servizi.html         → Upsell AVANZATO/PREMIUM
✅ email_win_back.html                → Re-engagement clienti inattivi
✅ email_newsletter_normative.html    → Newsletter normative
✅ email_supporto_troubleshooting.html → Supporto tecnico
✅ email_emergenza_servizio.html      → Notifiche emergenza
✅ email_nurturing_educativa.html     → Content marketing
✅ email_familiari_assistiti.html     → Email per familiari
```

**Sistema Placeholder**:
- Sintassi: `{{NOME_PLACEHOLDER}}`
- Esempi: `{{NOME_CLIENTE}}`, `{{PREZZO_PIANO}}`, `{{LINK_FIRMA}}`
- Supporto sezioni array: `{{#items}}...{{/items}}`
- Supporto condizioni: `{{#condizione}}...{{/condizione}}`

#### 1.2 Template Documenti (Contratti & Proforma)
**Localizzazione**: `/templates/contracts/`, `/templates/proforma/`

**Template Contratti Disponibili**:
```
✅ contratto_ecura_base.html           → Contratto BASE
✅ contratto_ecura_avanzato.html       → Contratto AVANZATO
✅ contratto_ecura_base_b2c.html       → B2C BASE
✅ contratto_ecura_avanzato_b2c.html   → B2C AVANZATO
✅ contratto_firma_digitale.html       → Template firma digitale
✅ template_contratto_ecura.html       → Template master
```

**Template Proforma Disponibili**:
```
✅ Template_Proforma_Unificato_TeleMedCare.html  → Proforma unificata
✅ proforma_commerciale.html                      → Proforma commerciale
✅ proforma_base.html                             → Proforma BASE
✅ proforma_avanzato.html                         → Proforma AVANZATO
```

**Sistema di Rendering**:
- `TemplateManager` class per gestione avanzata
- Storicizzazione documenti generati
- Tracking utilizzi template
- Versionamento template

#### 1.3 Workflow End-to-End COMPLETO
**Status Attuale**: ✅ Step 1-9 FUNZIONANTI, ⏳ Step 10-13 DA IMPLEMENTARE

```
✅ STEP 1:  Lead da campagna digital → Form www.ecura.it
✅ STEP 2:  Email completamento dati (template: email_completamento_dati)
✅ STEP 3:  Lead completa dati → /completa-dati?token=XXX
✅ STEP 4:  Sistema genera contratto (template contratto_ecura_[base|avanzato])
✅ STEP 5:  Email invio contratto + brochure (template: email_invio_contratto)
✅ STEP 6:  Lead firma contratto online → /contract-signature.html
✅ STEP 7:  Sistema salva firma + metadata
✅ STEP 8:  Email conferma firma al cliente
✅ STEP 9:  [FIX OGGI] Sistema genera e invia proforma (template: email_invio_proforma)

⏳ STEP 10: Cliente paga via Stripe → Webhook conferma pagamento
⏳ STEP 11: Email benvenuto + link form configurazione (template: email_benvenuto)
⏳ STEP 12: Cliente compila form configurazione → /configurazione?clientId=XXX
⏳ STEP 13: Email notifica config a info@ (template: email_configurazione)
⏳ STEP 14: Operatore associa IMEI dispositivo → Dashboard admin
⏳ STEP 15: Sistema genera DDT automatico
⏳ STEP 16: Email conferma spedizione (template: email_spedizione)
⏳ STEP 17: Email attivazione servizio (template: email_conferma_attivazione)
```

---

### 🔴 FASE 2: DASHBOARD SUPERVISIONE (Priorità ALTA)
**Obiettivo**: Monitoraggio real-time del flusso e interventi manuali

#### 2.1 Dashboard Leads
**URL**: `/dashboard` o `/admin/leads-dashboard`  
**Status**: ✅ ESISTENTE (da verificare funzionalità)

**Widget necessari**:
- KPI overview (lead oggi, conversioni, revenue)
- Tabella leads con filtri (status, fonte, servizio, data)
- Funnel visualization (Lead → Firma → Pagamento → Attivo)
- Azioni rapide per lead (invia reminder, cambia status, note)

#### 2.2 Dashboard Workflow Monitor
**URL**: `/admin/workflow-manager`  
**Status**: ✅ ESISTENTE (da verificare)

**Funzionalità necessarie**:
- Timeline workflow per ogni lead
- Status step (pending, in_progress, completed, error)
- Log email inviate (template, timestamp, deliverability)
- Log documenti generati (contratti, proforma)
- Alert su blocchi workflow (firma non ricevuta, pagamento scaduto)

#### 2.3 Dashboard Dispositivi IMEI
**URL**: `/admin/devices`  
**Status**: ✅ ESISTENTE (da verificare)

**Funzionalità necessarie**:
- Inventario dispositivi (IMEI, modello, status)
- Associazione IMEI → Cliente
- Tracking spedizione
- Status dispositivo (INVENTORY → ASSIGNED → SHIPPED → DELIVERED → ACTIVE)

#### 2.4 Dashboard Interventi Manuali
**Necessità**: Gestire casi speciali

**Azioni manuali richieste**:
- Rigenerare e reinviare email/documenti
- Cambiare status lead manualmente
- Aggiungere note interne
- Inviare comunicazioni custom
- Override prezzi (sconti, promozioni)

---

### 🟡 FASE 3: CRM & CONTACT MANAGEMENT (Priorità MEDIA - dopo workflow completo)
**Obiettivo**: Gestione completa ciclo vita cliente + campagne marketing

#### 3.1 Contact Database
**Tabelle DB necessarie**:
```sql
-- Contatti (lead + clienti + prospect)
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  tipo TEXT, -- 'LEAD', 'CLIENT', 'PROSPECT'
  nome TEXT,
  cognome TEXT,
  email TEXT,
  telefono TEXT,
  azienda TEXT,
  ruolo TEXT,
  fonte TEXT, -- 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'META', 'REFERRAL', 'DIRECT'
  campagna_id TEXT,
  tags TEXT, -- JSON array
  note TEXT,
  valore_lifetime REAL,
  probabilita_conversione INTEGER, -- 0-100%
  status TEXT, -- 'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'
  assegnato_a TEXT, -- user_id operatore
  data_ultimo_contatto TEXT,
  prossimo_followup TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Interazioni (log contatti)
CREATE TABLE interactions (
  id TEXT PRIMARY KEY,
  contact_id TEXT,
  tipo TEXT, -- 'EMAIL', 'CALL', 'MEETING', 'NOTE', 'SOCIAL'
  direzione TEXT, -- 'INBOUND', 'OUTBOUND'
  oggetto TEXT,
  contenuto TEXT,
  esito TEXT,
  durata_minuti INTEGER,
  prossima_azione TEXT,
  user_id TEXT, -- operatore
  timestamp TEXT,
  created_at TEXT
);

-- Campagne Marketing
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  nome TEXT,
  tipo TEXT, -- 'EMAIL', 'FACEBOOK', 'INSTAGRAM', 'GOOGLE_ADS', 'META'
  status TEXT, -- 'DRAFT', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'COMPLETED'
  obiettivo TEXT,
  budget REAL,
  budget_speso REAL,
  data_inizio TEXT,
  data_fine TEXT,
  target_audience TEXT, -- JSON
  metriche TEXT, -- JSON (impressions, clicks, conversions, cost_per_lead)
  created_at TEXT,
  updated_at TEXT
);

-- Lead associati a campagne
CREATE TABLE campaign_leads (
  id TEXT PRIMARY KEY,
  campaign_id TEXT,
  lead_id TEXT,
  source TEXT, -- URL/post specifico
  costo_acquisizione REAL,
  timestamp TEXT
);
```

#### 3.2 Funzionalità CRM Core
1. **Contact Management**
   - Vista 360° del contatto (dati, interazioni, documenti)
   - Timeline attività
   - Gestione tag/segmentazione
   - Import/export contatti (CSV)

2. **Pipeline Sales**
   - Kanban board per status lead
   - Drag & drop per cambio status
   - Previsioni revenue
   - Report conversioni

3. **Activity Tracking**
   - Log automatico email inviate
   - Log chiamate (integrazione telefonia?)
   - Log meeting
   - Reminder follow-up automatici

4. **Campagne Marketing**
   - Dashboard campagne attive (Facebook, Instagram, Google, META)
   - Tracking ROI per campagna
   - Cost per lead
   - Lead quality score
   - A/B testing landing page

5. **Reporting & Analytics**
   - Fonte lead più performante
   - Conversion rate per canale
   - Customer lifetime value
   - Churn rate
   - Forecast revenue

---

## 🛠️ AZIONI IMMEDIATE (Questa Settimana)

### Giorno 1-2: Completare Workflow (Step 10-13)
**Priorità**: 🔴 CRITICA

#### Task 1.1: Integrazione Stripe Payment
**File da creare/modificare**:
- `src/index.tsx` - Endpoint `/api/payments/stripe/create-session`
- `src/index.tsx` - Webhook `/api/payments/stripe/webhook`
- `src/modules/payment-service.ts` - Wrapper Stripe API

**Flusso**:
1. Cliente riceve email proforma con link pagamento
2. Link apre pagina Stripe Checkout
3. Cliente paga con carta
4. Stripe webhook notifica successo → Sistema marca proforma come pagata
5. Sistema invia email benvenuto + link configurazione

**Template email**: `email_benvenuto.html`

#### Task 1.2: Form Configurazione Dispositivo
**File da creare**:
- `/public/configurazione.html` - Form HTML/JS standalone
- `src/index.tsx` - Endpoint `POST /api/configurations`

**Campi form**:
- Telefono familiare 1, 2, 3 (con nome/parentela)
- Orari preferiti assistenza (mattina/pomeriggio/sera)
- Medico curante (nome, telefono)
- Allergie/patologie rilevanti
- Note aggiuntive

**Flusso**:
1. Cliente clicca link in email benvenuto
2. Compila form configurazione
3. Sistema salva in tabella `configurations`
4. Sistema invia email a info@ con dati config (template: `email_configurazione.html`)

#### Task 1.3: Dashboard Operatore IMEI
**File da verificare/modificare**:
- Verificare se dashboard `/admin/devices` è funzionante
- Implementare funzione "Associa IMEI a Cliente"
- Implementare cambio status dispositivo

**Flusso**:
1. Operatore riceve notifica email configurazione
2. Operatore apre dashboard dispositivi
3. Operatore seleziona IMEI da inventario
4. Operatore associa IMEI al cliente (seleziona da dropdown)
5. Sistema cambia status dispositivo → ASSIGNED
6. Sistema genera DDT automatico
7. Sistema invia email spedizione (template: `email_spedizione.html`)

#### Task 1.4: Email Attivazione Finale
**Trigger**: Dopo associazione IMEI e generazione DDT

**Template**: `email_conferma_attivazione.html`

**Contenuto**:
- Conferma attivazione servizio
- Istruzioni configurazione dispositivo
- Link manuale utente
- Contatti supporto
- Orari assistenza

---

### Giorno 3-4: Dashboard Supervisione
**Priorità**: 🔴 ALTA

#### Task 2.1: Verificare Dashboard Esistenti
```bash
cd /home/user/webapp
# Test accesso dashboard
curl https://telemedcare-v12.pages.dev/dashboard
curl https://telemedcare-v12.pages.dev/admin/leads-dashboard
curl https://telemedcare-v12.pages.dev/admin/workflow-manager
curl https://telemedcare-v12.pages.dev/admin/devices
```

#### Task 2.2: Implementare/Fixare Widget Mancanti
- Workflow timeline per lead
- Log email con status deliverability
- Funnel visualization
- Alert automatici (firma non ricevuta in 3 giorni, pagamento scaduto, etc.)

---

### Giorno 5: Test End-to-End Completo
**Priorità**: 🔴 CRITICA

#### Scenario Test:
1. ✅ Creare lead da form (nome: "Test Lead", email: test@example.com)
2. ✅ Verificare email completamento dati ricevuta
3. ✅ Completare dati lead
4. ✅ Verificare contratto generato e email inviata
5. ✅ Firmare contratto online
6. ✅ Verificare proforma generata e email inviata
7. ⏳ Pagare con Stripe (test mode)
8. ⏳ Verificare email benvenuto ricevuta
9. ⏳ Compilare form configurazione
10. ⏳ Verificare email config a info@
11. ⏳ Associare IMEI da dashboard
12. ⏳ Verificare email spedizione
13. ⏳ Verificare email attivazione finale

**Success Criteria**:
- ✅ Tutte le email ricevute correttamente
- ✅ Tutti i documenti storicizzati nel DB
- ✅ Dashboard mostra stato corretto
- ✅ Nessun intervento manuale necessario

---

## 📧 INTEGRAZIONE CAMPAGNE DIGITAL MARKETING

### Campagne Attive
- Facebook Ads
- Instagram Ads
- Google Ads
- META (Facebook + Instagram)

### Tracking Necessario
**URL parametri UTM** (da implementare se non presenti):
```
https://www.ecura.it/?utm_source=facebook&utm_medium=cpc&utm_campaign=inverno2026&utm_content=video_anziani
```

**Database tracking**:
```sql
-- Aggiungere campi a tabella leads
ALTER TABLE leads ADD COLUMN utm_source TEXT;
ALTER TABLE leads ADD COLUMN utm_medium TEXT;
ALTER TABLE leads ADD COLUMN utm_campaign TEXT;
ALTER TABLE leads ADD COLUMN utm_content TEXT;
ALTER TABLE leads ADD COLUMN utm_term TEXT;
```

**Analytics Dashboard**:
- Leads per fonte (Facebook vs Instagram vs Google)
- Cost per lead per campagna
- Conversion rate per canale
- ROI per campagna

---

## 🗄️ STORICIZZAZIONE DOCUMENTI

### Requisiti
Tutti i documenti generati devono essere storicizzati per:
- Audit trail
- Conformità GDPR
- Consultazione futura
- Risoluzione dispute

### Tabella Documents (se non esiste)
```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  tipo_documento TEXT, -- 'CONTRACT', 'PROFORMA', 'DDT', 'INVOICE'
  numero_documento TEXT,
  template_utilizzato TEXT,
  contenuto_html TEXT, -- HTML completo
  contenuto_pdf_url TEXT, -- URL file PDF su R2/storage
  dati_rendering TEXT, -- JSON con dati usati per rendering
  hash_documento TEXT, -- SHA-256 del contenuto per integrità
  versione_template TEXT,
  generato_da TEXT, -- 'SYSTEM' o user_id operatore
  firmato BOOLEAN,
  firma_timestamp TEXT,
  firma_ip TEXT,
  status TEXT, -- 'DRAFT', 'GENERATED', 'SENT', 'SIGNED', 'ARCHIVED'
  created_at TEXT,
  updated_at TEXT
);
```

### Storage Documenti PDF
**Opzioni**:
1. Cloudflare R2 (storage S3-compatible)
2. Database D1 (se PDF piccoli, come blob)
3. File system + CDN

**Naming convention**:
```
/documents/contracts/{YYYY}/{MM}/CONTRACT-{leadId}-{timestamp}.pdf
/documents/proformas/{YYYY}/{MM}/PROFORMA-{numero}-{timestamp}.pdf
/documents/ddts/{YYYY}/{MM}/DDT-{numero}-{timestamp}.pdf
```

---

## 🔄 SISTEMA EMAIL RESEND

### Configurazione Attuale
**Provider**: Resend  
**API Keys**: ✅ Già configurate in env  
**From address**: info@ecura.it  

### Best Practices Resend
1. **Domain Verification**
   - Verificare dominio telemedcare.it su Resend
   - Configurare DKIM/SPF/DMARC records

2. **Tracking**
   - Abilitare tracking aperture email
   - Abilitare tracking click link
   - Webhook per bounce/spam

3. **Templates**
   - Template caricati da `/templates/email_*.html`
   - Rendering via `renderTemplate()` con placeholder

4. **Deliverability**
   - Monitorare bounce rate (<5%)
   - Monitorare spam complaints (<0.1%)
   - Lista suppression per hard bounce

5. **Testing**
   - Usare Resend test mode per dev
   - Verificare rendering su tutti i client email
   - Test A/B subject lines

---

## 📊 KPI DA MONITORARE

### Workflow Performance
- **Lead → Completamento Dati**: <24h (target)
- **Completamento → Contratto Inviato**: <2h (automatico)
- **Contratto Inviato → Firmato**: <7 giorni (target)
- **Firmato → Pagato**: <7 giorni (target)
- **Pagato → Attivato**: <14 giorni (target)

### Conversion Funnel
- **Lead → Completamento Dati**: >60% (target)
- **Completamento → Firma Contratto**: >70% (target)
- **Firma → Pagamento**: >80% (target)
- **Pagamento → Attivazione**: >95% (target)

### Email Performance
- **Open rate**: >40% (target)
- **Click rate**: >15% (target)
- **Bounce rate**: <5% (target)
- **Unsubscribe rate**: <0.5% (target)

### Campagne Marketing
- **Cost per lead**: <€50 (target dipende da LTV)
- **Lead quality score**: >70/100 (target)
- **Conversion rate lead→cliente**: >25% (target)

---

## 🚀 ROADMAP TIMELINE

### Settimana 1 (Questa settimana)
- ✅ Fix workflow proforma (FATTO)
- ⏳ Integrazione Stripe payment
- ⏳ Form configurazione dispositivo
- ⏳ Dashboard IMEI operatore
- ⏳ Test end-to-end completo

### Settimana 2
- Dashboard supervisione workflow
- Monitoring email deliverability
- Tracking campagne digital (UTM params)
- Report performance workflow

### Settimana 3-4
- CRM base (contact management)
- Pipeline sales visualization
- Activity tracking
- Campaign dashboard

### Mese 2
- CRM avanzato (segmentazione, automazioni)
- A/B testing landing page
- Forecast revenue
- Advanced analytics

---

## 📝 NOTE TECNICHE

### Resend API Usage
```typescript
// Invio email con Resend
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'TeleMedCare <info@ecura.it>',
    to: ['cliente@example.com'],
    cc: ['info@ecura.it'],
    subject: 'Oggetto email',
    html: emailHtmlRendered,
    attachments: [
      {
        filename: 'contratto.pdf',
        content: base64PdfContent,
        contentType: 'application/pdf'
      }
    ]
  })
})
```

### Template Rendering
```typescript
import { loadEmailTemplate, renderTemplate } from './modules/template-loader-clean'

// Carica template
const template = await loadEmailTemplate('email_invio_contratto', db, env)

// Prepara dati
const data = {
  NOME_CLIENTE: 'Mario',
  COGNOME_CLIENTE: 'Rossi',
  PREZZO_PIANO: '€585,60',
  LINK_FIRMA: 'https://telemedcare-v12.pages.dev/contract-signature.html?contractId=...'
}

// Renderizza
const emailHtml = renderTemplate(template, data)
```

---

**Fine Strategia - Ready to Execute** 🚀
