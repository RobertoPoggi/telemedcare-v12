# DOCUMENTAZIONE FUNZIONALE - SISTEMA TELEMEDCARE V12.0
## CRM, Dashboard e Workflow Management

---

## INDICE

1. [Panoramica Sistema](#1-panoramica-sistema)
2. [Architettura Funzionale](#2-architettura-funzionale)
3. [Gestione Lead (CRM Core)](#3-gestione-lead-crm-core)
4. [Workflow Automatizzato](#4-workflow-automatizzato)
5. [Dashboard Operativa](#5-dashboard-operativa)
6. [Gestione Contratti](#6-gestione-contratti)
7. [Gestione Pagamenti](#7-gestione-pagamenti)
8. [Configurazione Cliente](#8-configurazione-cliente)
9. [Gestione Dispositivi](#9-gestione-dispositivi)
10. [Sistema Email](#10-sistema-email)
11. [Sistema Template](#11-sistema-template)
12. [Database e Persistenza](#12-database-e-persistenza)
13. [Integrazioni Esterne](#13-integrazioni-esterne)
14. [Sicurezza e Privacy](#14-sicurezza-e-privacy)
15. [Stati e Transizioni](#15-stati-e-transizioni)

---

## 1. PANORAMICA SISTEMA

### 1.1 Descrizione Generale

**TeleMedCare V12.0** è una piattaforma integrata per la gestione completa del ciclo di vita del cliente nel settore della teleassistenza domiciliare. Il sistema gestisce l'intero processo dall'acquisizione del lead fino all'attivazione del servizio.

### 1.2 Obiettivi Funzionali

- **Automazione completa** del processo commerciale e operativo
- **Tracciabilità** di ogni interazione con il cliente
- **Gestione documentale** integrata (contratti, proforma, configurazioni)
- **Workflow guidato** per ridurre errori operativi
- **Reportistica** in tempo reale sullo stato delle pratiche

### 1.3 Componenti Principali

| Componente | Descrizione | Funzione Primaria |
|-----------|-------------|-------------------|
| **CRM Core** | Gestione anagrafica lead | Acquisizione e qualificazione contatti |
| **Workflow Engine** | Orchestrazione processi | Automazione flusso vendita-attivazione |
| **Dashboard Operativa** | Interfaccia operatore | Gestione pratiche e monitoraggio |
| **Contract Manager** | Gestione contratti | Generazione e firma digitale |
| **Payment Manager** | Gestione pagamenti | Proforma e integrazione Stripe |
| **Configuration Manager** | Configurazione servizi | Raccolta dati attivazione |
| **Device Manager** | Gestione dispositivi | Associazione e tracking dispositivi |
| **Email Service** | Comunicazioni automatiche | Invio email transazionali |
| **Template Manager** | Gestione template | Template email e documenti |

### 1.4 Numeri del Sistema

- **24.107 linee di codice** core (escluse librerie)
- **50+ moduli funzionali** TypeScript
- **15 stati workflow** per ogni lead
- **12+ template email** transazionali
- **6 tipologie documento** gestite
- **4 livelli utente** (pubblico, lead, operatore, admin)

---

## 2. ARCHITETTURA FUNZIONALE

### 2.1 Modello a Strati

```
┌─────────────────────────────────────────────┐
│         INTERFACCIA UTENTE (UI)             │
│  Landing Page │ Dashboard │ Form Pubblici   │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│       BUSINESS LOGIC LAYER (BLL)            │
│  Workflow │ Lead Manager │ Document Manager │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│       DATA ACCESS LAYER (DAL)               │
│  D1 Database │ API Gateway │ Cache Layer    │
└─────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────┐
│       INTEGRATION LAYER (IL)                │
│  Email │ Payment │ Storage │ External APIs  │
└─────────────────────────────────────────────┘
```

### 2.2 Flusso Dati Principale

1. **Acquisizione Lead** (Landing Page → Database)
2. **Qualificazione** (Operatore → Dashboard → CRM)
3. **Invio Documentazione** (Sistema → Email Service → Cliente)
4. **Firma Contratto** (Cliente → Contract Manager → Database)
5. **Pagamento** (Cliente → Payment Gateway → Database)
6. **Configurazione** (Cliente → Configuration Manager → Database)
7. **Attivazione** (Operatore → Device Manager → Database)

### 2.3 Tecnologie Core

| Layer | Tecnologia | Scopo |
|-------|------------|-------|
| **Backend** | Hono Framework (TypeScript) | API REST e routing |
| **Database** | Cloudflare D1 (SQLite) | Persistenza dati |
| **Frontend** | HTML5 + Tailwind CSS | Interfacce utente |
| **Hosting** | Cloudflare Pages | Deploy e CDN |
| **Email** | Resend API | Invio email transazionali |
| **Pagamenti** | Stripe API | Gestione pagamenti |
| **Storage** | R2 Bucket | Archiviazione documenti |

---

## 3. GESTIONE LEAD (CRM CORE)

### 3.1 Acquisizione Lead

#### 3.1.1 Canali di Ingresso

1. **Landing Page Pubblica** (`/`)
   - Form principale acquisizione
   - Campi: nome, cognome, email, telefono, provincia
   - Opzioni: richiesta brochure, manuale, contratto
   - Tracking: fonte acquisizione (organic, paid, referral)

2. **API Esterna** (`POST /api/leads/external`)
   - Integrazione con sistemi terzi
   - Autenticazione via API key
   - Mappatura automatica campi

3. **Inserimento Manuale** (Dashboard)
   - Creazione diretta operatore
   - Tutti i campi disponibili
   - Validazione form-side

#### 3.1.2 Dati Lead

**Anagrafica Base:**
- Nome e Cognome
- Email (validata, unique)
- Telefono
- Indirizzo completo (via, civico, città, provincia, CAP)
- Codice fiscale
- Data di nascita

**Dati Assistito (se diverso dall'intestatario):**
- Nome e Cognome assistito
- Data di nascita assistito
- Relazione con intestatario (genitore, coniuge, altro)

**Dati Commerciali:**
- Servizio richiesto (Base / Avanzato)
- Piano scelto (mensile / annuale)
- Fonte acquisizione
- Note commerciali
- Operatore assegnato

**Preferenze:**
- Vuole brochure (Si/No)
- Vuole manuale (Si/No)
- Vuole contratto (Si/No)
- Privacy accettata
- Marketing accettato

**Dati Sistema:**
- ID univoco (formato: `LEAD-YYYY-MM-DD-UUID`)
- Data creazione
- Data ultimo aggiornamento
- Stato corrente
- Storia transizioni di stato

### 3.2 Operazioni CRUD

#### 3.2.1 Create (Creazione)

**Endpoint:** `POST /api/leads`

**Payload Minimo:**
```json
{
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com",
  "telefono": "3331234567",
  "provincia": "RM"
}
```

**Validazioni:**
- Email valida e univoca
- Telefono formato italiano
- Provincia codice valido (2 caratteri)
- Nome e cognome non vuoti

**Azioni Automatiche:**
- Generazione ID univoco
- Assegnazione stato iniziale (`NEW`)
- Timestamp creazione
- Score iniziale (0)
- Invio email notifica interna

#### 3.2.2 Read (Lettura)

**Endpoint:** `GET /api/leads/:id`

**Risposta:**
```json
{
  "success": true,
  "lead": {
    "id": "LEAD-2026-02-24-abc123",
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "mario.rossi@example.com",
    "telefono": "3331234567",
    "status": "NEW",
    "created_at": "2026-02-24T10:00:00Z",
    "score": 0,
    ...
  }
}
```

**Filtri Dashboard:**
- Per stato (`?status=NEW`)
- Per data (`?from=2026-02-01&to=2026-02-28`)
- Per operatore (`?operator=user123`)
- Per servizio (`?service=BASE`)
- Ricerca testuale (`?search=mario+rossi`)

#### 3.2.3 Update (Aggiornamento)

**Endpoint:** `PUT /api/leads/:id`

**Payload Parziale Consentito:**
```json
{
  "telefono": "3339876543",
  "via": "Via Roma 123",
  "note": "Cliente interessato"
}
```

**Campi Protetti (non modificabili):**
- `id` (immutabile)
- `created_at` (timestamp originale)
- `email` (richiede verifica separata)

**Audit Trail:**
- Ogni modifica tracciata
- Timestamp aggiornamento
- Operatore modificante
- Valori precedenti salvati (per rollback)

#### 3.2.4 Delete (Eliminazione)

**Endpoint:** `DELETE /api/leads/:id`

**Modalità:**
- **Soft Delete** (default): `deleted = 1`, dati conservati
- **Hard Delete** (admin): rimozione fisica record

**Vincoli:**
- Solo lead senza contratti attivi
- Solo lead senza pagamenti effettuati
- Conferma richiesta per operatori

### 3.3 Lead Scoring

#### 3.3.1 Criteri di Punteggio

| Criterio | Punti | Motivazione |
|----------|-------|-------------|
| Email valida | +10 | Contattabilità garantita |
| Telefono fornito | +10 | Canale alternativo |
| Indirizzo completo | +15 | Pronto per contratto |
| Codice fiscale | +15 | Identificazione certa |
| Ha aperto email | +20 | Interesse dimostrato |
| Ha cliccato link | +25 | Engagement alto |
| Ha compilato form config | +30 | Intent molto alto |
| Ha firmato contratto | +50 | Lead qualificato |
| Ha pagato | +100 | Cliente acquisito |

#### 3.3.2 Categorie Lead

- **0-30 punti:** Lead freddo (scarso interesse)
- **31-60 punti:** Lead tibido (potenziale medio)
- **61-100 punti:** Lead caldo (interesse confermato)
- **101+ punti:** Lead qualificato (pronto chiusura)

### 3.4 Gestione Duplicati

#### 3.4.1 Rilevamento

**Criteri di Match:**
1. Email identica (100% match)
2. Telefono + Cognome (90% match)
3. Codice Fiscale (100% match)
4. Nome + Cognome + Data nascita (85% match)

#### 3.4.2 Azioni

- **Alert operatore** se duplicato rilevato
- **Merge manuale** via dashboard
- **Blocco automatico** per email duplicate
- **Suggerimenti** lead simili

---

## 4. WORKFLOW AUTOMATIZZATO

### 4.1 Architettura Workflow

Il sistema utilizza un **Workflow Orchestrator** (`complete-workflow-orchestrator.ts`) che coordina tutte le fasi del processo commerciale e operativo.

#### 4.1.1 Componenti Orchestrator

```typescript
WorkflowOrchestrator
├── Step 1: validateLead()
├── Step 2: sendDocumentation()
├── Step 3: sendContract()
├── Step 4: waitSignature()
├── Step 5: sendProforma()
├── Step 6: waitPayment()
├── Step 7: sendConfiguration()
├── Step 8: waitConfiguration()
└── Step 9: activateService()
```

### 4.2 Flusso Completo

#### FASE 1: ACQUISIZIONE E QUALIFICAZIONE

**Step 1.1 - Arrivo Lead**
- Lead compila form landing page
- Sistema salva dati in database
- Stato: `NEW`
- Email automatica a `info@medicagb.it` con notifica nuovo lead

**Step 1.2 - Validazione Dati**
- Operatore verifica completezza dati
- Se mancano campi essenziali → invio email "completa dati"
- Se dati completi → prosegue workflow
- Stato: `VALIDATED`

**Step 1.3 - Qualificazione Commerciale**
- Operatore valuta interesse lead (scoring)
- Assegnazione priorità (alta/media/bassa)
- Aggiunta note commerciali
- Stato: `QUALIFIED`

#### FASE 2: INVIO DOCUMENTAZIONE

**Step 2.1 - Invio Brochure**
- Se lead ha richiesto brochure → email con PDF allegato
- Template: `email_invio_brochure.html`
- Allegato: `Brochure_eCura_2024.pdf`
- Tracking apertura email
- Stato: `BROCHURE_SENT`

**Step 2.2 - Invio Manuale**
- Se lead ha richiesto manuale → email con PDF allegato
- Template: `email_invio_manuale.html`
- Allegato: `Manuale_Dispositivo_SiDLY.pdf`
- Stato: `MANUAL_SENT`

**Step 2.3 - Invio Contratto**
- Se lead ha richiesto contratto → genera contratto personalizzato
- Creazione record in tabella `contracts`
- Generazione HTML contratto con dati lead
- Invio email con link firma digitale
- Template: `email_invio_contratto.html`
- Link: `https://telemedcare-v12.pages.dev/firma-contratto?contractId=XXX`
- Stato: `CONTRACT_SENT`

#### FASE 3: FIRMA CONTRATTO

**Step 3.1 - Apertura Pagina Firma**
- Cliente clicca link da email
- Sistema carica dati contratto da database (`GET /api/contracts/:id`)
- Visualizza contratto in HTML responsive
- Mostra checkbox consensi GDPR
- Mostra canvas firma digitale

**Step 3.2 - Firma Digitale**
- Cliente legge clausole
- Spunta checkbox obbligatori
- Disegna firma su canvas touch
- Click "Firma Contratto"
- Sistema valida presenza firma
- Salva firma come base64 in database

**Step 3.3 - Conferma Firma**
- Popup di conferma: "✓ Contratto firmato con successo!"
- Aggiornamento stato contratto: `SIGNED`
- Aggiornamento stato lead: `CONTRACT_SIGNED`
- Timestamp firma salvato

**Step 3.4 - Generazione Proforma**
- Workflow automatico crea proforma
- Calcolo importo: €480 (BASE) o €840 (AVANZATO)
- IVA 22% inclusa
- Scadenza: 30 giorni
- Inserimento in tabella `proforma`
- Invio email con link pagamento
- Template: `email_invio_proforma.html`
- Link: `https://telemedcare-v12.pages.dev/pagamento?proformaId=XXX`
- Stato: `PROFORMA_SENT`

#### FASE 4: PAGAMENTO

**Step 4.1 - Apertura Pagina Pagamento**
- Cliente clicca link da email
- Sistema carica dati proforma (`GET /api/proforma/:id`)
- Visualizza riepilogo importo
- Mostra form Stripe per carta

**Step 4.2 - Pagamento Online**
- Cliente inserisce dati carta
- Stripe processa pagamento
- Webhook Stripe notifica esito
- Se successo: aggiornamento proforma a `PAID`
- Se fallito: email di retry
- Stato: `PAYMENT_RECEIVED`

**Step 4.3 - Conferma Pagamento Manuale**
- Operatore può confermare pagamento offline (bonifico)
- Button dashboard: "Pagamento OK"
- Aggiornamento manuale stato proforma
- Trigger stesso workflow pagamento online

**Step 4.4 - Invio Email Configurazione**
- Email automatica con form configurazione
- Template: `email_configurazione.html`
- Link: `https://telemedcare-v12.pages.dev/configurazione?leadId=XXX`
- Stato: `CONFIGURATION_SENT`

#### FASE 5: CONFIGURAZIONE

**Step 5.1 - Compilazione Form**
- Cliente accede a form configurazione
- Sezioni:
  - **Dati Anagrafici**: conferma intestatario
  - **Dati Medici**: medico curante, patologie, terapie
  - **Contatti Emergenza**: fino a 3 contatti con nome, telefono, relazione
- Validazione campi obbligatori
- Submit via EmailJS

**Step 5.2 - Ricezione Configurazione**
- Email inviata a `info@medicagb.it`
- Operatore riceve dati completi
- Salvataggio manuale in sistema (o auto-parse)
- Stato: `CONFIGURATION_RECEIVED`

**Step 5.3 - Validazione Configurazione**
- Operatore verifica correttezza dati
- Se mancanti → richiesta integrazione
- Se completi → autorizzazione attivazione
- Stato: `CONFIGURATION_VALIDATED`

#### FASE 6: ATTIVAZIONE SERVIZIO

**Step 6.1 - Associazione Dispositivo**
- Operatore seleziona dispositivo da magazzino
- Inserimento seriale dispositivo
- Associazione dispositivo a cliente
- Configurazione parametri dispositivo
- Stato: `DEVICE_ASSOCIATED`

**Step 6.2 - Attivazione Servizio**
- Attivazione linea telefonica dispositivo
- Configurazione centrale operativa
- Inserimento contatti emergenza
- Test funzionale dispositivo
- Stato: `ACTIVE`

**Step 6.3 - Comunicazione Attivazione**
- Email conferma attivazione a cliente
- Template: `email_attivazione_servizio.html`
- Dettagli: seriale dispositivo, numero emergenza, istruzioni
- Call di benvenuto operatore (opzionale)
- Stato: `SERVICE_ACTIVE`

### 4.3 Gestione Eccezioni

#### 4.3.1 Timeout Step

| Step | Timeout | Azione Automatica |
|------|---------|-------------------|
| Firma contratto | 7 giorni | Email reminder |
| Pagamento proforma | 30 giorni | Email sollecito |
| Form configurazione | 14 giorni | Email reminder |
| Attivazione dispositivo | 3 giorni | Alert operatore |

#### 4.3.2 Fallimenti

**Firma Non Completata:**
- Reminder automatico dopo 3 giorni
- Secondo reminder dopo 7 giorni
- Se 10 giorni: stato `CONTRACT_EXPIRED`, notifica operatore

**Pagamento Fallito:**
- Email automatica con nuovo link
- Possibilità pagamento alternativo (bonifico)
- Operatore contatta cliente telefonicamente

**Configurazione Non Ricevuta:**
- Reminder dopo 7 giorni
- Chiamata operatore dopo 14 giorni
- Se 30 giorni: richiesta riattivazione processo

### 4.4 Workflow Manager (UI)

#### 4.4.1 Funzionalità

La pagina **Workflow Manager** (`/workflow-manager`) fornisce:

- **Vista Timeline** di tutte le pratiche
- **Stato corrente** ogni lead
- **Prossima azione** suggerita
- **Alert** su ritardi
- **Bottoni azione rapida** per ogni step
- **Storia completa** transizioni

#### 4.4.2 Azioni Rapide

- **Invia Brochure** → trigger step 2.1
- **Invia Contratto** → trigger step 2.3
- **Sollecita Firma** → invio reminder
- **Conferma Pagamento** → trigger manuale step 4.3
- **Invia Form Config** → trigger step 4.4
- **Associa Dispositivo** → apri modal step 6.1

---

## 5. DASHBOARD OPERATIVA

### 5.1 Dashboard Lead (`/admin/leads-dashboard`)

#### 5.1.1 Struttura

```
┌─────────────────────────────────────────────┐
│  🏠 TeleMedCare Dashboard                   │
│  ────────────────────────────────────────   │
│  📊 KPI Cards                               │
│   • Totale Lead  • In Lavorazione          │
│   • Convertiti   • Fatturato Mese          │
│  ────────────────────────────────────────   │
│  🔍 Filtri e Ricerca                        │
│   [Status ▼] [Operatore ▼] [Data Range ▼]  │
│   [Cerca: nome, email, tel]                 │
│  ────────────────────────────────────────   │
│  📋 Tabella Lead                            │
│   Nome │ Email │ Tel │ Status │ Azioni     │
│   ─────────────────────────────────────    │
│   Mario│m@...  │333..│NEW    │[Dettagli]  │
│   ...                                       │
│  ────────────────────────────────────────   │
│  📄 Paginazione                             │
│   ◀ Prec │ 1 2 3 ... 10 │ Succ ▶          │
└─────────────────────────────────────────────┘
```

#### 5.1.2 KPI (Key Performance Indicators)

**Card 1: Totale Lead**
- Conteggio lead totali (esclusi deleted)
- Trend vs. mese precedente (%)
- Breakdown per stato (grafico a torta)

**Card 2: Lead in Lavorazione**
- Lead con stato tra `VALIDATED` e `CONFIGURATION_SENT`
- Percentuale su totale
- Alertse >50% in stallo da >7 giorni

**Card 3: Lead Convertiti**
- Lead con stato `ACTIVE` o `SERVICE_ACTIVE`
- Conversion rate (%)
- Tempo medio di conversione (giorni)

**Card 4: Fatturato Mese Corrente**
- Somma proforma pagate nel mese
- Confronto con mese precedente
- Proiezione fine mese

**Card 5: Nuovi Lead Oggi**
- Lead creati nelle ultime 24h
- Badge rosso se >10 non assegnati

**Card 6: Alert Operativi**
- Contratti da firmare scaduti
- Pagamenti in ritardo
- Configurazioni mancanti

#### 5.1.3 Filtri

**Per Stato:**
- Dropdown multi-selezione
- Stati disponibili: NEW, VALIDATED, QUALIFIED, CONTRACT_SENT, CONTRACT_SIGNED, PAYMENT_RECEIVED, ecc.
- Quick filters: "Solo nuovi", "In attesa firma", "In attesa pagamento"

**Per Data:**
- Date picker range
- Preset: Oggi, Ultimi 7gg, Questo mese, Mese scorso, Custom

**Per Operatore:**
- Dropdown operatori attivi
- Filtro "Non assegnati"
- Filtro "Miei lead" (per operatore loggato)

**Ricerca Testuale:**
- Campo ricerca real-time
- Cerca in: nome, cognome, email, telefono, note
- Highlight risultati

#### 5.1.4 Tabella Lead

**Colonne Visualizzate:**
1. **Checkbox** (selezione multipla)
2. **ID Lead** (abbreviato, tooltip full)
3. **Nome Completo** (nome + cognome)
4. **Email** (con icona mailto)
5. **Telefono** (con icona call)
6. **Provincia**
7. **Status Badge** (colorato per stato)
8. **Score** (barra progresso 0-100)
9. **Data Creazione**
10. **Ultimo Aggiornamento**
11. **Azioni**

**Azioni per Riga:**
- **👁️ Dettagli** → modal con tutte info
- **✏️ Modifica** → form inline editing
- **📧 Email** → quick send email
- **📞 Call Log** → registra chiamata
- **🗑️ Elimina** → soft delete con conferma

**Azioni Bulk (su selezione multipla):**
- Assegna a operatore
- Cambia stato
- Esporta CSV
- Invia email massiva
- Elimina multipli

#### 5.1.5 Dettaglio Lead (Modal)

Apertura modal con tab:

**Tab 1: Anagrafica**
- Tutti i dati personali
- Dati assistito
- Indirizzo completo
- Contatti

**Tab 2: Commerciale**
- Servizio e piano scelti
- Fonte acquisizione
- Score e categoria
- Note commerciali

**Tab 3: Workflow**
- Stato corrente (grande badge)
- Timeline verticale con tutti gli step
- Date e timestamp di ogni transizione
- Documenti generati (link download)
- Email inviate (con status apertura/click)

**Tab 4: Azioni**
- Pulsanti per ogni step workflow
- Storico azioni effettuate
- Log modifiche
- Audit trail

**Tab 5: Comunicazioni**
- Storico email inviate/ricevute
- Log chiamate
- Note operatore
- Attachments

### 5.2 Dashboard Dati (`/admin/data-dashboard`)

#### 5.2.1 Metriche Avanzate

**Sezione: Conversione Funnel**
```
  Lead Acquisiti (100%)
        ↓ 85%
  Lead Validati
        ↓ 70%
  Contratti Inviati
        ↓ 45%
  Contratti Firmati
        ↓ 80%
  Pagamenti Ricevuti
        ↓ 90%
  Servizi Attivati
```

**Sezione: Performance Temporali**
- Grafico lineare: nuovi lead per giorno (ultimi 30gg)
- Grafico a barre: conversioni per settimana
- Heatmap: attività per ora del giorno

**Sezione: Analisi Geografica**
- Mappa Italia con cluster per provincia
- Top 10 province per numero lead
- Conversion rate per regione

**Sezione: Analisi Commerciale**
- Split BASE vs. AVANZATO (% e fatturato)
- Canale acquisizione più performante
- Tempo medio di conversione per fonte

#### 5.2.2 Report Esportabili

**Report Giornaliero:**
- Nuovi lead del giorno
- Contratti firmati
- Pagamenti ricevuti
- Servizi attivati
- Formato: PDF + CSV

**Report Settimanale:**
- Riepilogo attività settimana
- Confronto con settimana precedente
- Alert e anomalie
- Performance operatori
- Formato: PDF con grafici

**Report Mensile:**
- Chiusura mese commerciale
- Fatturato e forecast
- Analisi trend
- Raccomandazioni
- Formato: PDF executive summary

### 5.3 Dashboard Workflow (`/workflow-manager`)

#### 5.3.1 Vista Kanban

```
┌──────────┬──────────┬──────────┬──────────┐
│  NEW     │ CONTRACT │ PAYMENT  │ ACTIVE   │
│  ─────── │ SENT     │ RECEIVED │ ────────  │
│ [Lead 1] │ [Lead 5] │ [Lead 9] │ [Lead 12]│
│ [Lead 2] │ [Lead 6] │ [Lead10] │ [Lead 13]│
│ [Lead 3] │ [Lead 7] │          │          │
│ [Lead 4] │ [Lead 8] │          │          │
│          │          │          │          │
│ + Nuovo  │          │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

**Funzionalità Drag & Drop:**
- Sposta lead tra colonne = cambio stato automatico
- Validazione transizioni (solo stati consecutivi)
- Conferma azioni critiche (es. da NEW a ACTIVE non consentito)

**Card Lead:**
- Nome cliente
- Badge priorità
- Icone azioni rapide
- Giorni in stato corrente
- Operatore assegnato

#### 5.3.2 Vista Timeline

```
📅 Oggi
  • 09:30 - Lead "Mario Rossi" → CONTRACT_SENT
  • 14:15 - Lead "Laura Bianchi" → PAYMENT_RECEIVED

📅 Ieri
  • 10:00 - Lead "Giovanni Verdi" → CONTRACT_SIGNED
  • 16:45 - Lead "Anna Neri" → ACTIVE

📅 Ultimi 7 giorni
  ...
```

#### 5.3.3 Vista Priorità

**Urgenti (rosso):**
- Contratti scaduti senza firma
- Pagamenti in ritardo >30gg
- Configurazioni mancanti da >14gg

**Alta Priorità (arancione):**
- Lead caldi non ancora contattati
- Pagamenti in scadenza entro 7gg
- Dispositivi da associare

**Media Priorità (giallo):**
- Reminder firma da inviare
- Follow-up commerciali
- Report settimanali

**Bassa Priorità (verde):**
- Aggiornamenti dati lead
- Ottimizzazioni processo
- Documentazione

---

## 6. GESTIONE CONTRATTI

### 6.1 Contract Manager

#### 6.1.1 Generazione Contratto

**Modulo:** `contract-generator.ts`

**Input:**
- Dati lead (anagrafica completa)
- Tipo servizio (BASE / AVANZATO)
- Piano (mensile / annuale)
- Prezzo concordato

**Processo:**
1. Caricamento template contratto HTML
2. Sostituzione placeholders con dati lead
3. Inserimento clausole specifiche per servizio
4. Generazione ID contratto univoco (formato: `CTR-{COGNOME}-{ANNO}`)
5. Salvataggio in database tabella `contracts`
6. Generazione PDF (opzionale, via Puppeteer)

**Output:**
- ID contratto
- HTML contratto personalizzato
- PDF contratto (se richiesto)
- Record database contratto

**Campi Tabella `contracts`:**
```sql
id                    TEXT PRIMARY KEY
leadId                TEXT (FK → leads.id)
codice_contratto      TEXT UNIQUE
tipo_contratto        TEXT (BASE/AVANZATO)
template_utilizzato   TEXT
contenuto_html        TEXT (contratto completo)
firma_base64          TEXT (immagine firma)
firma_timestamp       TEXT
pdf_generated         INTEGER (0/1)
pdf_url               TEXT
email_sent            INTEGER (0/1)
email_template_used   TEXT
status                TEXT (PENDING/SIGNED/EXPIRED)
servizio              TEXT
piano                 TEXT
prezzo_mensile        REAL
durata_mesi           INTEGER
prezzo_totale         REAL
data_invio            TEXT
data_scadenza         TEXT (data_invio + 30gg)
created_at            TEXT
updated_at            TEXT
```

#### 6.1.2 Template Contratto

**Placeholders:**
- `{{NOME_COMPLETO}}` → Nome e cognome intestatario
- `{{CODICE_FISCALE}}` → CF intestatario
- `{{INDIRIZZO}}` → Via, civico, città, provincia, CAP
- `{{EMAIL}}` → Email contatto
- `{{TELEFONO}}` → Numero telefono
- `{{NOME_ASSISTITO}}` → Nome assistito (se diverso)
- `{{SERVIZIO}}` → Nome servizio (es. "eCura PRO")
- `{{PIANO}}` → BASE / AVANZATO
- `{{PREZZO_PRIMO_ANNO}}` → €480 o €840
- `{{PREZZO_ANNI_SUCCESSIVI}}` → €200 o €600
- `{{DISPOSITIVO}}` → "SiDLY Care PRO" o "SiDLY Vital Care"
- `{{DATA_CONTRATTO}}` → Data odierna formattata
- `{{CODICE_CONTRATTO}}` → ID univoco
- `{{DURATA_CONTRATTO}}` → 12 mesi (standard)

**Sezioni Contratto:**
1. **Intestazione** (logo, dati società)
2. **Dati Contraenti** (fornitore e cliente)
3. **Oggetto del Contratto** (descrizione servizio)
4. **Condizioni Economiche** (prezzi, modalità pagamento)
5. **Durata e Rinnovo** (12 mesi, rinnovo tacito)
6. **Servizi Inclusi** (dettaglio per piano)
7. **Obblighi delle Parti** (cliente e fornitore)
8. **Recesso** (modalità e tempistiche)
9. **Privacy e GDPR** (clausole conformità)
10. **Foro Competente** (giurisdizione)
11. **Firma Digitale** (area firma cliente)

#### 6.1.3 Firma Digitale

**Pagina:** `/firma-contratto?contractId=XXX`

**Componenti:**
1. **Visualizzazione Contratto**
   - Iframe o div con HTML contratto
   - Scroll completo documento
   - Highlight sezioni principali

2. **Checkbox Consensi**
   - [ ] Ho letto e accetto le Condizioni Generali
   - [ ] Ho letto e accetto le Clausole Economiche
   - [ ] Ho letto e accetto l'Informativa Privacy
   - [ ] Autorizzo il trattamento dati per finalità contrattuali
   - (Tutti obbligatori per procedere)

3. **Canvas Firma**
   - Area touch/mouse drawing
   - Pulsanti: "Cancella firma", "Conferma firma"
   - Validazione presenza tratti firma
   - Conversione a base64

4. **Pulsante Submit**
   - "Firma Contratto"
   - Disabilitato se mancano consensi o firma
   - Loading state durante invio

**Flusso Firma:**
1. Utente accede a URL da email
2. Sistema carica contratto da DB (`GET /api/contracts/:id`)
3. Mostra documento + form firma
4. Utente legge, spunta checkbox, disegna firma
5. Click "Firma Contratto"
6. POST `/api/contracts/:id/sign` con firma base64
7. Sistema valida firma
8. Aggiorna DB: `status=SIGNED`, salva `firma_base64`, `firma_timestamp`
9. Trigger workflow: genera proforma
10. Mostra popup conferma: "✓ Contratto firmato con successo!"
11. (No redirect - utente resta su pagina o chiude finestra)

#### 6.1.4 Gestione Stati Contratto

**PENDING:**
- Contratto generato e inviato
- In attesa di firma
- Email reminder dopo 3, 7, 10 giorni
- Scade dopo 30 giorni

**SIGNED:**
- Contratto firmato digitalmente
- Firma salvata in DB
- Timestamp firma registrato
- Trigger generazione proforma automatica

**EXPIRED:**
- Scaduto il termine (30gg) senza firma
- Alert operatore per follow-up
- Possibilità rigenerazione con nuovo ID

**CANCELLED:**
- Annullato da operatore o cliente
- Motivo cancellazione richiesto
- Lead torna a stato precedente

### 6.2 Endpoint API Contratti

**GET `/api/contracts/:id`**
- Recupera dati contratto per visualizzazione
- Include dati lead associato
- Usato da pagina firma-contratto

**POST `/api/contracts`**
- Crea nuovo contratto
- Richiede leadId
- Genera ID univoco
- Salva in database

**PUT `/api/contracts/:id`**
- Aggiorna contratto esistente
- Solo campi modificabili (note, prezzi)
- Non consente modifica post-firma

**POST `/api/contracts/:id/sign`**
- Registra firma digitale
- Payload: `{ firma_base64: string }`
- Valida presenza firma
- Aggiorna stato a SIGNED

**DELETE `/api/contracts/:id`**
- Elimina contratto (solo se PENDING)
- Soft delete con flag
- Richiede conferma admin

**GET `/api/contracts`**
- Lista tutti i contratti
- Filtri: status, leadId, data range
- Paginazione
- Usato da dashboard

---

## 7. GESTIONE PAGAMENTI

### 7.1 Payment Manager

#### 7.1.1 Proforma (Fattura Proforma)

**Definizione:**
Documento commerciale non fiscale che anticipa l'importo da pagare prima dell'emissione della fattura definitiva.

**Generazione Automatica:**
Trigger: firma contratto completata

**Dati Proforma:**
```sql
id                 TEXT PRIMARY KEY
leadId             TEXT (FK → leads.id)
numero_proforma    TEXT UNIQUE (formato: PRO-2026-00001)
importo            REAL (480 o 840, IVA esclusa)
iva                REAL (22%)
importo_totale     REAL (importo + iva)
status             TEXT (PENDING/PAID/EXPIRED/CANCELLED)
data_emissione     TEXT
data_scadenza      TEXT (data_emissione + 30gg)
metodo_pagamento   TEXT (stripe/bonifico/altro)
stripe_session_id  TEXT (se pagamento Stripe)
note               TEXT
created_at         TEXT
updated_at         TEXT
```

**Calcolo Importi:**
- BASE: €480 + IVA 22% = €585,60
- AVANZATO: €840 + IVA 22% = €1.024,80

**Numero Proforma:**
- Formato: `PRO-{ANNO}-{SEQUENZA}`
- Esempio: `PRO-2026-00001`
- Sequenza auto-incrementale per anno

#### 7.1.2 Pagina Pagamento

**URL:** `/pagamento?proformaId=XXX`

**Componenti:**
1. **Riepilogo Proforma**
   - Numero proforma
   - Data emissione
   - Data scadenza
   - Importo (ex IVA)
   - IVA 22%
   - Totale da pagare

2. **Dati Cliente**
   - Nome e cognome
   - Email
   - Indirizzo fatturazione

3. **Form Stripe**
   - Campo carta credito (integrato Stripe Elements)
   - Campi: numero carta, scadenza, CVV
   - Validazione real-time
   - Sicurezza PCI-compliant

4. **Pulsanti Azione**
   - "Paga con Carta" (verde, primario)
   - "Paga con Bonifico" (link istruzioni)
   - "Scarica Proforma PDF" (opzionale)

**Flusso Pagamento Carta:**
1. Utente accede a URL da email
2. Sistema carica proforma (`GET /api/proforma/:id`)
3. Mostra riepilogo + form Stripe
4. Utente inserisce dati carta
5. Click "Paga con Carta"
6. Chiamata Stripe API per creare sessione pagamento
7. Redirect a Stripe Checkout (hosted page)
8. Cliente completa pagamento su Stripe
9. Stripe invia webhook a `/api/webhooks/stripe`
10. Sistema aggiorna proforma: `status=PAID`, `metodo_pagamento=stripe`
11. Aggiorna lead: `status=PAYMENT_RECEIVED`
12. Trigger workflow: invia email configurazione
13. Redirect cliente a pagina conferma

**Flusso Pagamento Bonifico:**
1. Cliente clicca "Paga con Bonifico"
2. Mostra modal con istruzioni:
   - IBAN: IT00X0000000000000000000000
   - Beneficiario: Medica GB S.r.l.
   - Causale: `Proforma {NUMERO_PROFORMA}`
   - Importo: {IMPORTO_TOTALE} €
3. Cliente effettua bonifico autonomamente
4. Operatore verifica accredito su conto bancario
5. Operatore conferma pagamento manualmente da dashboard
6. Sistema aggiorna proforma e continua workflow

#### 7.1.3 Integrazione Stripe

**Setup:**
- Account Stripe configurato
- API Keys: `STRIPE_SECRET_KEY` (server), `STRIPE_PUBLISHABLE_KEY` (client)
- Webhook endpoint: `https://telemedcare-v12.pages.dev/api/webhooks/stripe`
- Eventi ascoltati: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

**Stripe Checkout Session:**
```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: 'TeleAssistenza eCura PRO',
        description: `Proforma ${numero_proforma}`
      },
      unit_amount: importo_totale * 100 // centesimi
    },
    quantity: 1
  }],
  mode: 'payment',
  success_url: `${base_url}/pagamento-success?proformaId=${proformaId}`,
  cancel_url: `${base_url}/pagamento?proformaId=${proformaId}`,
  metadata: {
    proformaId: proformaId,
    leadId: leadId
  }
})
```

**Webhook Handler:**
```typescript
app.post('/api/webhooks/stripe', async (c) => {
  const sig = c.req.header('stripe-signature')
  const body = await c.req.text()
  
  // Verifica firma webhook
  const event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET)
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const proformaId = session.metadata.proformaId
    
    // Aggiorna proforma
    await db.prepare(`
      UPDATE proforma 
      SET status = 'PAID', 
          metodo_pagamento = 'stripe',
          stripe_session_id = ?
      WHERE id = ?
    `).bind(session.id, proformaId).run()
    
    // Trigger workflow
    await inviaEmailFormConfigurazione(leadId, env, db)
  }
  
  return c.json({ received: true })
})
```

#### 7.1.4 Gestione Stati Proforma

**PENDING:**
- Proforma generata
- In attesa di pagamento
- Email reminder dopo 15 giorni
- Scade dopo 30 giorni

**PAID:**
- Pagamento ricevuto e verificato
- Timestamp pagamento salvato
- Trigger email configurazione automatica
- Fattura definitiva da emettere (esterno al sistema)

**EXPIRED:**
- Scaduto termine (30gg) senza pagamento
- Alert operatore
- Possibilità rinnovo proforma con nuova scadenza

**CANCELLED:**
- Annullata da operatore
- Motivo richiesto
- Lead torna a stato CONTRACT_SIGNED
- Eventuale rimborso (se pagata)

### 7.2 Endpoint API Pagamenti

**GET `/api/proforma/:id`**
- Recupera dati proforma per visualizzazione
- Include dati lead associato
- Usato da pagina pagamento

**POST `/api/proforma`**
- Crea nuova proforma
- Richiede leadId e importo
- Genera numero progressivo
- Salva in database

**PUT `/api/proforma/:id`**
- Aggiorna proforma esistente
- Solo campi modificabili (note, scadenza)
- Non consente modifica importo post-pagamento

**POST `/api/leads/:id/manual-payment`**
- Conferma pagamento manuale (bonifico)
- Richiede nota operatore
- Aggiorna stato proforma a PAID
- Trigger workflow configurazione

**DELETE `/api/proforma/:id`**
- Elimina proforma (solo se PENDING)
- Soft delete con flag
- Richiede conferma admin

**GET `/api/proforma`**
- Lista tutte le proforma
- Filtri: status, leadId, data range, metodo
- Paginazione
- Usato da dashboard

**POST `/api/create-stripe-session`**
- Crea sessione Stripe Checkout
- Payload: `{ proformaId: string }`
- Ritorna: `{ sessionId: string, url: string }`
- Redirect cliente a Stripe

---

## 8. CONFIGURAZIONE CLIENTE

### 8.1 Configuration Manager

#### 8.1.1 Form Configurazione

**URL:** `/configurazione?leadId=XXX`

**Sezioni Form:**

**1. Dati Anagrafici (Conferma)**
- Nome e Cognome (readonly, da lead)
- Codice Fiscale (readonly)
- Data di Nascita (readonly)
- Indirizzo Completo (readonly)
- Email (readonly)
- Telefono (readonly)
- (Tasto "Modifica" se necessario aggiornamento)

**2. Dati Medici**
- Nome Medico Curante *
- Telefono Medico Curante *
- Patologie Principali (textarea)
- Allergie Note (textarea)
- Terapie Farmacologiche in Corso (textarea)
- Limitazioni Motorie (checkbox)
- Problemi Cognitivi (checkbox)
- Note Particolari (textarea)

**3. Contatti Emergenza**
Ripetitore 1-3 volte:
- Nome Contatto *
- Relazione (genitore/figlio/coniuge/badante/altro) *
- Telefono Principale *
- Telefono Secondario
- Orari Preferenziali Contatto
- Note

**4. Preferenze Servizio**
- Lingua Preferita (italiano/altro)
- Orari Attività Cliente (mattina/pomeriggio/sera/notte)
- Note Particolari Gestione Chiamate

**5. Consensi Finali**
- [ ] Confermo la correttezza dei dati inseriti *
- [ ] Autorizzo il trattamento dati sanitari (GDPR Art.9) *
- [ ] Autorizzo la condivisione dati con centrale operativa *

**Validazioni:**
- Campi obbligatori (*) controllati
- Almeno 1 contatto emergenza obbligatorio
- Telefoni formato italiano validato
- Checkbox consensi tutti obbligatori

**Submit:**
- Pulsante "Invia Configurazione"
- Loading state durante invio
- Invio via EmailJS a `info@medicagb.it`
- Conferma visiva su successo

#### 8.1.2 Invio Configurazione

**Metodo:** EmailJS (servizio terzo)

**Email Ricevuta da Operatore:**
```
A: info@medicagb.it
Oggetto: 📋 Nuova Configurazione Cliente - {Nome Cognome}

Gentile Staff,

un cliente ha completato il form di configurazione:

═══════════════════════════════════════
DATI CLIENTE
═══════════════════════════════════════
Nome: Mario Rossi
Email: mario.rossi@example.com
Telefono: 333-1234567

═══════════════════════════════════════
DATI MEDICI
═══════════════════════════════════════
Medico Curante: Dr. Verdi Giovanni
Tel. Medico: 333-9876543
Patologie: Ipertensione, Diabete tipo 2
...

═══════════════════════════════════════
CONTATTI EMERGENZA
═══════════════════════════════════════
1. Laura Rossi (Figlia)
   Tel: 333-1111111
   Orari: Sempre disponibile

2. ...

═══════════════════════════════════════
CONSENSI
═══════════════════════════════════════
☑ Dati corretti confermati
☑ Trattamento dati sanitari autorizzato
☑ Condivisione centrale operativa autorizzata

Prossimo step: Associare dispositivo e attivare servizio.

Link Dashboard: https://telemedcare-v12.pages.dev/admin/leads-dashboard

---
TeleMedCare V12.0 - Sistema Automatico
```

#### 8.1.3 Gestione Configurazione

**Salvataggio:**
- Attualmente: email operatore + salvataggio manuale
- Futuro: parsing automatico email → database

**Tabella `configurations` (da implementare):**
```sql
id                          TEXT PRIMARY KEY
leadId                      TEXT (FK)
medico_nome                 TEXT
medico_telefono             TEXT
patologie                   TEXT
allergie                    TEXT
terapie                     TEXT
limitazioni_motorie         INTEGER
problemi_cognitivi          INTEGER
note_mediche                TEXT
contatto1_nome              TEXT
contatto1_relazione         TEXT
contatto1_telefono          TEXT
contatto2_nome              TEXT
contatto2_relazione         TEXT
contatto2_telefono          TEXT
contatto3_nome              TEXT
contatto3_relazione         TEXT
contatto3_telefono          TEXT
lingua_preferita            TEXT
orari_attivita              TEXT
note_servizio               TEXT
consensi_timestamp          TEXT
created_at                  TEXT
updated_at                  TEXT
```

**Verifica Operatore:**
1. Riceve email configurazione
2. Controlla completezza dati
3. Se OK: aggiorna stato lead `CONFIGURATION_VALIDATED`
4. Se mancano info: email al cliente per integrazione

### 8.2 Endpoint API Configurazione

**GET `/api/configurations/:leadId`**
- Recupera configurazione esistente per lead
- Usato per pre-compilazione form se già presente

**POST `/api/configurations`**
- Salva configurazione ricevuta
- Payload: tutti i campi form
- Aggiorna stato lead a `CONFIGURATION_RECEIVED`

**PUT `/api/configurations/:id`**
- Aggiorna configurazione esistente
- Usato da operatore per correzioni

---

## 9. GESTIONE DISPOSITIVI

### 9.1 Device Manager

#### 9.1.1 Tipologie Dispositivi

**SiDLY Care PRO** (Piano BASE)
- Telecomando salvavita con GPS
- Connessione GSM
- Batteria: 48h autonomia
- Impermeabile: IP67
- Pulsante SOS grande
- Speaker vivavoce integrato

**SiDLY Vital Care** (Piano AVANZATO)
- Tutto del modello PRO, più:
- Sensori biomedici (ECG, pressione, saturazione O2)
- Monitoraggio h24 parametri vitali
- Alert automatici anomalie
- Display LCD touchscreen

#### 9.1.2 Stati Dispositivo

**IN_STOCK:**
- Dispositivo in magazzino
- Non assegnato
- Pronto per associazione

**ASSIGNED:**
- Associato a lead/cliente
- Non ancora attivato
- In preparazione spedizione

**ACTIVE:**
- Attivo e funzionante
- SIM attiva
- Cliente lo sta usando

**MAINTENANCE:**
- In manutenzione/riparazione
- Temporaneamente non disponibile
- Sostituzione eventuale

**DEACTIVATED:**
- Servizio terminato
- SIM disattivata
- Dispositivo da recuperare

**RETIRED:**
- Fuori uso definitivo
- Non riutilizzabile

#### 9.1.3 Associazione Dispositivo

**Processo da Dashboard:**

**Step 1: Selezione Lead**
- Operatore apre dettaglio lead con stato `CONFIGURATION_VALIDATED`
- Click pulsante "Associa Dispositivo"

**Step 2: Selezione Dispositivo**
- Modal mostra lista dispositivi disponibili (`IN_STOCK`)
- Filtri: modello, seriale
- Selezione dispositivo da assegnare

**Step 3: Configurazione**
- Inserimento dati configurazione:
  - Numero SIM dispositivo
  - Numero telefonico SIM
  - ICCID SIM
  - Data attivazione prevista
  - Note installazione

**Step 4: Conferma Associazione**
- Sistema salva in tabella `device_assignments`
- Aggiorna stato dispositivo: `IN_STOCK` → `ASSIGNED`
- Aggiorna stato lead: `CONFIGURATION_VALIDATED` → `DEVICE_ASSOCIATED`

**Step 5: Attivazione Servizio**
- Operatore configura centrale operativa
- Inserisce contatti emergenza in sistema centrale
- Testa funzionalità dispositivo
- Conferma attivazione
- Aggiorna stato lead: `DEVICE_ASSOCIATED` → `ACTIVE`
- Aggiorna stato dispositivo: `ASSIGNED` → `ACTIVE`
- Invio email conferma attivazione a cliente

#### 9.1.4 Tracking Dispositivi

**Tabella `devices`:**
```sql
id                  TEXT PRIMARY KEY
seriale             TEXT UNIQUE
modello             TEXT (SiDLY Care PRO / SiDLY Vital Care)
status              TEXT (IN_STOCK/ASSIGNED/ACTIVE/MAINTENANCE/...)
data_acquisto       TEXT
fornitore           TEXT
prezzo_acquisto     REAL
note                TEXT
created_at          TEXT
updated_at          TEXT
```

**Tabella `device_assignments`:**
```sql
id                  TEXT PRIMARY KEY
device_id           TEXT (FK → devices.id)
lead_id             TEXT (FK → leads.id)
sim_number          TEXT
phone_number        TEXT
iccid               TEXT
data_associazione   TEXT
data_attivazione    TEXT
data_disattivazione TEXT
note                TEXT
created_at          TEXT
updated_at          TEXT
```

**Dashboard Dispositivi:**
- Lista tutti i dispositivi
- Filtri per stato, modello
- Ricerca per seriale
- Info assegnazione corrente
- Storico assegnazioni precedenti
- Alert manutenzione

### 9.2 Endpoint API Dispositivi

**GET `/api/devices`**
- Lista tutti i dispositivi
- Filtri: status, modello
- Paginazione

**GET `/api/devices/:id`**
- Dettaglio dispositivo singolo
- Include lead assegnato (se presente)
- Storico assegnazioni

**POST `/api/devices`**
- Aggiunge nuovo dispositivo a magazzino
- Richiede: seriale, modello
- Stato iniziale: `IN_STOCK`

**PUT `/api/devices/:id`**
- Aggiorna dispositivo
- Cambia stato
- Modifica note

**POST `/api/devices/:id/assign`**
- Associa dispositivo a lead
- Payload: `{ leadId, sim_number, phone_number, ... }`
- Crea record in `device_assignments`
- Aggiorna stati

**POST `/api/devices/:id/activate`**
- Attiva servizio dispositivo
- Aggiorna stati
- Trigger email conferma

**POST `/api/devices/:id/deactivate`**
- Disattiva dispositivo
- Motivo richiesto
- Aggiorna stati

**DELETE `/api/devices/:id`**
- Elimina dispositivo (solo se `IN_STOCK` o `RETIRED`)
- Soft delete

---

## 10. SISTEMA EMAIL

### 10.1 Email Service

#### 10.1.1 Provider

**Resend API:**
- Provider principale per email transazionali
- API Key configurata in env
- Domain verificato: `medicagb.it`
- Rate limit: 100 email/ora (tier gratuito)

**SendGrid (fallback):**
- Provider backup
- Usato se Resend fallisce
- API Key configurata

#### 10.1.2 Email Inviate dal Sistema

**1. Email Notifica Nuovo Lead**
- **A:** `info@medicagb.it`
- **Oggetto:** `🔔 Nuovo Lead da Landing Page - {Nome Cognome}`
- **Quando:** Subito dopo compilazione form pubblico
- **Template:** `email_notifica_interno.html`
- **Contenuto:** Riepilogo dati lead, link dashboard

**2. Email Richiesta Completamento Dati**
- **A:** Lead (email fornita)
- **Oggetto:** `Completa la tua richiesta per {Servizio} {Piano}`
- **Quando:** Operatore clicca "Richiedi Dati" se lead incompleto
- **Template:** `email_richiesta_completamento_form.html`
- **Contenuto:** Link form completa-dati, brochure allegata

**3. Email Invio Brochure**
- **A:** Lead
- **Oggetto:** `📄 La tua Brochure eCura - Servizi di Teleassistenza`
- **Quando:** Lead richiede brochure o operatore invia
- **Template:** `email_invio_brochure.html`
- **Allegato:** `Brochure_eCura_2024.pdf` (2 MB)

**4. Email Invio Manuale**
- **A:** Lead
- **Oggetto:** `📘 Manuale Dispositivo SiDLY Care`
- **Quando:** Lead richiede manuale o operatore invia
- **Template:** `email_invio_manuale.html`
- **Allegato:** `Manuale_Dispositivo_SiDLY.pdf` (1.5 MB)

**5. Email Invio Contratto**
- **A:** Lead
- **Oggetto:** `📝 Il tuo Contratto eCura - Firma Digitale`
- **Quando:** Contratto generato (automatico o manuale)
- **Template:** `email_invio_contratto.html`
- **Link:** `/firma-contratto?contractId=XXX`
- **Contenuto:** Istruzioni firma digitale, riepilogo servizio

**6. Email Reminder Firma Contratto**
- **A:** Lead
- **Oggetto:** `⏰ Reminder: Firma il tuo contratto eCura`
- **Quando:** 3, 7, 10 giorni dopo invio se non firmato
- **Template:** `email_reminder_firma.html`
- **Link:** Stesso link contratto

**7. Email Invio Proforma**
- **A:** Lead
- **Oggetto:** `💳 Proforma di Pagamento eCura {Numero}`
- **Quando:** Dopo firma contratto (automatico)
- **Template:** `email_invio_proforma.html`
- **Link:** `/pagamento?proformaId=XXX`
- **Contenuto:** Riepilogo importo, scadenza, istruzioni

**8. Email Reminder Pagamento**
- **A:** Lead
- **Oggetto:** `⏰ Sollecito Pagamento - Proforma {Numero}`
- **Quando:** 15 giorni dopo invio proforma se non pagata
- **Template:** `email_reminder_pagamento.html`
- **Link:** Stesso link pagamento

**9. Email Form Configurazione**
- **A:** Lead
- **Oggetto:** `⚙️ Completa la Configurazione del tuo {Dispositivo}`
- **Quando:** Dopo conferma pagamento (automatico)
- **Template:** `email_configurazione.html`
- **Link:** `/configurazione.html?leadId=XXX`
- **Contenuto:** Istruzioni compilazione, servizi inclusi

**10. Email Reminder Configurazione**
- **A:** Lead
- **Oggetto:** `⏰ Completa la configurazione del servizio eCura`
- **Quando:** 7 giorni dopo invio se non compilata
- **Template:** `email_reminder_configurazione.html`

**11. Email Conferma Attivazione**
- **A:** Cliente (lead diventato cliente)
- **Oggetto:** `✅ Servizio eCura Attivato - Benvenuto!`
- **Quando:** Dopo associazione dispositivo e attivazione
- **Template:** `email_attivazione_servizio.html`
- **Contenuto:**
  - Numero seriale dispositivo
  - Numero telefonico SIM
  - Numero emergenza centrale operativa
  - Istruzioni primo utilizzo
  - Contatti supporto

**12. Email Test Sistema**
- **A:** Configurabile
- **Oggetto:** `✅ Test Invio Email - TeleMedCare System`
- **Quando:** Operatore testa configurazione email
- **Template:** Semplice HTML inline

#### 10.1.3 Tracking Email

**Metriche Tracciate:**
- Data/ora invio
- Stato consegna (delivered / bounced / failed)
- Apertura email (via pixel tracking)
- Click link (via redirect tracking)
- Errori invio

**Salvataggio:**
- Tabella `email_logs`
- Record per ogni email inviata
- Consultabile da dashboard

**Tabella `email_logs`:**
```sql
id              TEXT PRIMARY KEY
lead_id         TEXT (FK)
to_email        TEXT
from_email      TEXT
subject         TEXT
template_used   TEXT
status          TEXT (sent/delivered/opened/clicked/bounced/failed)
resend_id       TEXT (ID Resend per tracking)
sent_at         TEXT
opened_at       TEXT
clicked_at      TEXT
error_message   TEXT
created_at      TEXT
```

### 10.2 Template System

#### 10.2.1 Template Manager

**Posizione:** `/public/templates/email/`

**Struttura Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Stili inline per compatibilità email */
  </style>
</head>
<body>
  <div style="max-width: 600px; margin: 0 auto;">
    
    <!-- Header -->
    <div style="background: #2563EB; padding: 20px; text-align: center;">
      <img src="{{LOGO_URL}}" alt="Medica GB" style="max-width: 200px;">
    </div>
    
    <!-- Corpo -->
    <div style="padding: 30px; background: #fff;">
      <h1 style="color: #1e40af;">{{TITOLO}}</h1>
      <p>Gentile {{NOME_COMPLETO}},</p>
      <p>{{MESSAGGIO_PRINCIPALE}}</p>
      
      <!-- Call to Action -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="{{LINK_AZIONE}}" 
           style="background: #10b981; color: white; padding: 15px 30px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;">
          {{TESTO_BOTTONE}}
        </a>
      </div>
      
      <p>{{TESTO_AGGIUNTIVO}}</p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px;">
      <p>Medica GB S.r.l. | Via Example 123, Roma | info@medicagb.it</p>
      <p><a href="{{LINK_PRIVACY}}">Privacy Policy</a> | <a href="{{LINK_UNSUB}}">Disiscriviti</a></p>
    </div>
    
  </div>
</body>
</html>
```

**Placeholders Comuni:**
- `{{NOME_COMPLETO}}` → Nome e cognome lead
- `{{NOME}}` → Solo nome
- `{{EMAIL}}` → Email lead
- `{{SERVIZIO}}` → Nome servizio (eCura PRO, ecc.)
- `{{PIANO}}` → Piano scelto (BASE/AVANZATO)
- `{{DISPOSITIVO}}` → Modello dispositivo
- `{{PREZZO}}` → Prezzo formattato (€480/anno)
- `{{LINK_AZIONE}}` → URL primario (firma, pagamento, config)
- `{{DATA}}` → Data corrente formattata
- `{{CODICE_CONTRATTO}}` → ID contratto
- `{{NUMERO_PROFORMA}}` → Numero proforma
- `{{IMPORTO_TOTALE}}` → Importo da pagare
- `{{SCADENZA}}` → Data scadenza
- `{{LOGO_URL}}` → URL logo Medica GB (base64 o CDN)

#### 10.2.2 Rendering Template

**Processo:**
1. Caricamento file template da filesystem
2. Parsing HTML
3. Sostituzione placeholders con dati reali
4. Validazione HTML
5. Return HTML pronto per invio

**Modulo:** `template-loader-clean.ts`

```typescript
export async function loadEmailTemplate(
  templateName: string, 
  env: any
): Promise<string> {
  const path = `/public/templates/email/${templateName}.html`
  const html = await readFile(path)
  return html
}

export function renderTemplate(
  html: string, 
  data: Record<string, any>
): string {
  let rendered = html
  for (const [key, value] of Object.entries(data)) {
    const placeholder = `{{${key}}}`
    rendered = rendered.replaceAll(placeholder, value)
  }
  return rendered
}
```

**Esempio Uso:**
```typescript
const template = await loadEmailTemplate('email_invio_contratto', env)
const rendered = renderTemplate(template, {
  NOME_COMPLETO: 'Mario Rossi',
  SERVIZIO: 'eCura PRO',
  PIANO: 'BASE',
  LINK_AZIONE: 'https://telemedcare-v12.pages.dev/firma-contratto?contractId=123',
  PREZZO: '€480/anno',
  DATA: '24 febbraio 2026'
})
```

---

## 11. SISTEMA TEMPLATE

### 11.1 Template Documenti

#### 11.1.1 Template Contratto

**File:** `/public/templates/contratti/template_contratto_firma_digitale.html`

**Sezioni:**
1. Intestazione (logo, ragione sociale, dati fiscali)
2. Dati contraenti (fornitore + cliente)
3. Oggetto contratto (descrizione servizio)
4. Condizioni economiche (tabella prezzi)
5. Durata e rinnovo
6. Servizi inclusi (lista per piano)
7. Obblighi parti
8. Recesso e penali
9. Trattamento dati (GDPR)
10. Foro competente
11. Area firma digitale

**Stile:**
- Font: Arial, sans-serif
- Dimensioni A4: 210mm x 297mm
- Margini: 20mm
- Header/Footer fissi
- Numerazione pagine
- Watermark "Copia non firmata" se PENDING

#### 11.1.2 Template Proforma

**File:** `/public/templates/documenti/template_proforma.html`

**Contenuto:**
- Logo e dati società
- Numero proforma
- Data emissione
- Data scadenza
- Destinatario (dati lead)
- Tabella importi:
  - Descrizione servizio
  - Importo base (es. €840)
  - IVA 22% (es. €184,80)
  - Totale (es. €1.024,80)
- Modalità pagamento
- Coordinate bancarie (IBAN)
- Note e condizioni

**Formato:**
- HTML per visualizzazione web
- Convertibile in PDF (Puppeteer)
- Stampabile

#### 11.1.3 Template Email

Vedi sezione 10.2 Sistema Email

### 11.2 Gestione Template

#### 11.2.1 Versionamento

**Convenzione Naming:**
- `template_contratto_v1.html` (prima versione)
- `template_contratto_v2.html` (aggiornamento clausole)
- `template_attivo.html` → symlink a versione corrente

**Tracking Modifiche:**
- Tabella `template_versions`
- Changelog modifiche
- Data attivazione
- Template usato per ogni documento generato

**Tabella `template_versions`:**
```sql
id              TEXT PRIMARY KEY
template_name   TEXT
version         INTEGER
file_path       TEXT
changelog       TEXT
is_active       INTEGER (0/1)
created_at      TEXT
activated_at    TEXT
```

#### 11.2.2 Editor Template (Futuro)

**Funzionalità pianificate:**
- WYSIWYG editor per template email
- Preview real-time con dati di test
- Gestione placeholders
- Salvataggio versioni
- A/B testing template email

---

## 12. DATABASE E PERSISTENZA

### 12.1 Cloudflare D1 Database

#### 12.1.1 Caratteristiche

- **Tipo:** SQLite distribuito
- **Hosting:** Edge network Cloudflare
- **Latenza:** <10ms (geo-distributed)
- **Limits:** 100k read/day, 1k write/day (free tier)
- **Backup:** Automatico quotidiano
- **Migrazione:** Via Wrangler CLI

#### 12.1.2 Schema Database

**Tabella `leads`** (core):
```sql
CREATE TABLE leads (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefono TEXT,
  via TEXT,
  civico TEXT,
  citta TEXT,
  provincia TEXT,
  cap TEXT,
  codice_fiscale TEXT,
  data_nascita TEXT,
  nomeAssistito TEXT,
  cognomeAssistito TEXT,
  dataNascitaAssistito TEXT,
  relazioneAssistito TEXT,
  vuoleBrochure TEXT DEFAULT 'No',
  vuoleManuale TEXT DEFAULT 'No',
  vuoleContratto TEXT DEFAULT 'No',
  servizioScelto TEXT,
  pianoScelto TEXT,
  fonteLead TEXT,
  operatoreAssegnato TEXT,
  status TEXT DEFAULT 'NEW',
  score INTEGER DEFAULT 0,
  note TEXT,
  privacyAccettata INTEGER DEFAULT 0,
  marketingAccettato INTEGER DEFAULT 0,
  deleted INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created ON leads(created_at);
```

**Tabella `contracts`:**
```sql
CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  leadId TEXT NOT NULL,
  codice_contratto TEXT UNIQUE NOT NULL,
  tipo_contratto TEXT,
  template_utilizzato TEXT,
  contenuto_html TEXT,
  firma_base64 TEXT,
  firma_timestamp TEXT,
  pdf_generated INTEGER DEFAULT 0,
  pdf_url TEXT,
  email_sent INTEGER DEFAULT 0,
  email_template_used TEXT,
  status TEXT DEFAULT 'PENDING',
  servizio TEXT,
  piano TEXT,
  prezzo_mensile REAL,
  durata_mesi INTEGER DEFAULT 12,
  prezzo_totale REAL,
  data_invio TEXT,
  data_scadenza TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (leadId) REFERENCES leads(id)
);

CREATE INDEX idx_contracts_lead ON contracts(leadId);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE UNIQUE INDEX idx_contracts_codice ON contracts(codice_contratto);
```

**Tabella `proforma`:**
```sql
CREATE TABLE proforma (
  id TEXT PRIMARY KEY,
  leadId TEXT NOT NULL,
  numero_proforma TEXT UNIQUE NOT NULL,
  importo REAL NOT NULL,
  iva REAL NOT NULL,
  importo_totale REAL NOT NULL,
  status TEXT DEFAULT 'PENDING',
  data_emissione TEXT NOT NULL,
  data_scadenza TEXT NOT NULL,
  metodo_pagamento TEXT,
  stripe_session_id TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (leadId) REFERENCES leads(id)
);

CREATE INDEX idx_proforma_lead ON proforma(leadId);
CREATE INDEX idx_proforma_status ON proforma(status);
CREATE UNIQUE INDEX idx_proforma_numero ON proforma(numero_proforma);
```

**Tabella `devices`:**
```sql
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  seriale TEXT UNIQUE NOT NULL,
  modello TEXT NOT NULL,
  status TEXT DEFAULT 'IN_STOCK',
  data_acquisto TEXT,
  fornitore TEXT,
  prezzo_acquisto REAL,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX idx_devices_seriale ON devices(seriale);
CREATE INDEX idx_devices_status ON devices(status);
```

**Tabella `device_assignments`:**
```sql
CREATE TABLE device_assignments (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  lead_id TEXT NOT NULL,
  sim_number TEXT,
  phone_number TEXT,
  iccid TEXT,
  data_associazione TEXT NOT NULL,
  data_attivazione TEXT,
  data_disattivazione TEXT,
  note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (device_id) REFERENCES devices(id),
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE INDEX idx_assignments_device ON device_assignments(device_id);
CREATE INDEX idx_assignments_lead ON device_assignments(lead_id);
```

**Tabella `email_logs`:**
```sql
CREATE TABLE email_logs (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  to_email TEXT NOT NULL,
  from_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template_used TEXT,
  status TEXT DEFAULT 'sent',
  resend_id TEXT,
  sent_at TEXT NOT NULL,
  opened_at TEXT,
  clicked_at TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE INDEX idx_email_lead ON email_logs(lead_id);
CREATE INDEX idx_email_status ON email_logs(status);
CREATE INDEX idx_email_sent ON email_logs(sent_at);
```

**Tabella `settings`:**
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL
);
```

**Tabella `audit_log`:**
```sql
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  user_id TEXT,
  timestamp TEXT NOT NULL
);

CREATE INDEX idx_audit_table ON audit_log(table_name);
CREATE INDEX idx_audit_record ON audit_log(record_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
```

### 12.2 Query Patterns

#### 12.2.1 Lead Operations

**Create Lead:**
```typescript
await db.prepare(`
  INSERT INTO leads (
    id, nome, cognome, email, telefono, provincia,
    status, score, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).bind(
  leadId, nome, cognome, email, telefono, provincia,
  'NEW', 0, now, now
).run()
```

**Update Lead:**
```typescript
await db.prepare(`
  UPDATE leads 
  SET telefono = ?, via = ?, note = ?, updated_at = ?
  WHERE id = ?
`).bind(newPhone, newAddress, newNotes, now, leadId).run()
```

**Get Lead with Contract:**
```typescript
const result = await db.prepare(`
  SELECT 
    l.*,
    c.id as contract_id,
    c.codice_contratto,
    c.status as contract_status,
    c.firma_timestamp
  FROM leads l
  LEFT JOIN contracts c ON c.leadId = l.id
  WHERE l.id = ?
`).bind(leadId).first()
```

**Search Leads:**
```typescript
const results = await db.prepare(`
  SELECT * FROM leads
  WHERE (
    nome LIKE ? OR
    cognome LIKE ? OR
    email LIKE ? OR
    telefono LIKE ?
  )
  AND deleted = 0
  ORDER BY created_at DESC
  LIMIT 50
`).bind(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`).all()
```

#### 12.2.2 Workflow Queries

**Lead con Contratto Scaduto:**
```typescript
const expired = await db.prepare(`
  SELECT l.*, c.data_scadenza
  FROM leads l
  JOIN contracts c ON c.leadId = l.id
  WHERE c.status = 'PENDING'
    AND c.data_scadenza < ?
`).bind(today).all()
```

**Proforma da Sollecitare:**
```typescript
const pending = await db.prepare(`
  SELECT l.*, p.numero_proforma, p.importo_totale, p.data_scadenza
  FROM leads l
  JOIN proforma p ON p.leadId = l.id
  WHERE p.status = 'PENDING'
    AND p.data_emissione < ?
    AND (p.ultimo_sollecito IS NULL OR p.ultimo_sollecito < ?)
`).bind(fifteenDaysAgo, sevenDaysAgo).all()
```

**Lead da Configurare:**
```typescript
const toConfig = await db.prepare(`
  SELECT * FROM leads
  WHERE status = 'PAYMENT_RECEIVED'
  ORDER BY updated_at ASC
  LIMIT 20
`).all()
```

#### 12.2.3 Reporting Queries

**Conversions Funnel:**
```typescript
const funnel = await db.prepare(`
  SELECT 
    COUNT(*) FILTER (WHERE status = 'NEW') as new_leads,
    COUNT(*) FILTER (WHERE status = 'VALIDATED') as validated,
    COUNT(*) FILTER (WHERE status = 'CONTRACT_SENT') as contracts_sent,
    COUNT(*) FILTER (WHERE status = 'CONTRACT_SIGNED') as contracts_signed,
    COUNT(*) FILTER (WHERE status = 'PAYMENT_RECEIVED') as paid,
    COUNT(*) FILTER (WHERE status = 'ACTIVE') as active
  FROM leads
  WHERE created_at >= ? AND created_at <= ?
`).bind(startDate, endDate).first()
```

**Revenue per Mese:**
```typescript
const revenue = await db.prepare(`
  SELECT 
    strftime('%Y-%m', data_emissione) as month,
    SUM(importo_totale) as total_revenue,
    COUNT(*) as paid_count
  FROM proforma
  WHERE status = 'PAID'
  GROUP BY month
  ORDER BY month DESC
  LIMIT 12
`).all()
```

---

## 13. INTEGRAZIONI ESTERNE

### 13.1 Email (Resend)

**Endpoint:** `https://api.resend.com/emails`

**Autenticazione:** Bearer token (API Key)

**Invio Email:**
```typescript
const response = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${RESEND_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    from: 'noreply@medicagb.it',
    to: 'cliente@example.com',
    subject: 'Il tuo contratto eCura',
    html: '<html>...</html>',
    attachments: [{
      filename: 'brochure.pdf',
      content: base64Content
    }]
  })
})
```

### 13.2 Pagamenti (Stripe)

**Endpoint:** `https://api.stripe.com/v1/`

**Autenticazione:** Bearer token (Secret Key)

**Creazione Sessione:**
```typescript
const session = await fetch('https://api.stripe.com/v1/checkout/sessions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({
    'payment_method_types[]': 'card',
    'line_items[0][price_data][currency]': 'eur',
    'line_items[0][price_data][product_data][name]': 'eCura PRO',
    'line_items[0][price_data][unit_amount]': '48000',
    'line_items[0][quantity]': '1',
    'mode': 'payment',
    'success_url': successUrl,
    'cancel_url': cancelUrl
  })
})
```

**Webhook:**
- URL: `/api/webhooks/stripe`
- Eventi: `checkout.session.completed`, `payment_intent.succeeded`
- Verifica firma webhook per sicurezza

### 13.3 Storage (Cloudflare R2)

**Uso:** Archiviazione PDF contratti firmati, brochure, documenti

**Operazioni:**
```typescript
// Upload
await env.R2.put(`contracts/${contractId}.pdf`, pdfBuffer, {
  httpMetadata: {
    contentType: 'application/pdf'
  }
})

// Download
const object = await env.R2.get(`contracts/${contractId}.pdf`)
const pdfBuffer = await object.arrayBuffer()

// Delete
await env.R2.delete(`contracts/${contractId}.pdf`)
```

### 13.4 HubSpot CRM (Futuro)

**Sync Leads:**
- Invio lead a HubSpot via API
- Bidirectional sync
- Mapping stati

### 13.5 Centrale Operativa (Futuro)

**API Proprietaria:**
- Invio configurazione cliente
- Attivazione dispositivo
- Gestione chiamate emergenza

---

## 14. SICUREZZA E PRIVACY

### 14.1 GDPR Compliance

#### 14.1.1 Consensi

**Raccolta Consensi:**
- **Privacy (obbligatorio):** Trattamento dati personali
- **Marketing (opzionale):** Comunicazioni commerciali
- **Profilazione (opzionale):** Analisi preferenze
- **Terze parti (opzionale):** Condivisione con partner

**Tracciamento:**
- Timestamp consenso
- Versione informativa accettata
- IP address raccolta consenso
- Log modifiche consensi

#### 14.1.2 Diritti GDPR

**Accesso Dati (Art. 15):**
- Endpoint: `GET /api/gdpr/data-access?email=xxx`
- Esporta tutti i dati lead in JSON
- Include: anagrafica, contratti, pagamenti, email

**Rettifica Dati (Art. 16):**
- Modifica dati via dashboard o API
- Log tutte le modifiche (audit trail)

**Cancellazione (Art. 17 - Right to be Forgotten):**
- Endpoint: `DELETE /api/gdpr/delete-data?email=xxx`
- Soft delete: flag `deleted=1`, dati conservati 10 anni (obbligo fiscale)
- Hard delete: dopo 10 anni, se richiesto

**Portabilità (Art. 20):**
- Esporta dati in CSV o JSON
- Include tutti i record associati

**Opposizione (Art. 21):**
- Disattivazione email marketing
- Blocco profilazione
- Conservazione solo dati contrattuali

#### 14.1.3 Data Retention

- **Lead non convertiti:** 2 anni, poi soft delete
- **Clienti attivi:** Conservazione illimitata
- **Clienti cessati:** 10 anni (obbligo fiscale), poi hard delete
- **Email logs:** 1 anno
- **Audit logs:** 5 anni

### 14.2 Sicurezza Dati

#### 14.2.1 Autenticazione

**Operatori:**
- Login con email + password
- JWT token (scadenza 8h)
- Refresh token (scadenza 30gg)
- 2FA opzionale (TOTP)

**Clienti:**
- Link temporanei con token univoco
- Validità token: 7gg firma, 30gg pagamento
- No password richiesta (magic link)

#### 14.2.2 Autorizzazione

**Livelli Accesso:**
1. **Pubblico:** Solo lettura landing page
2. **Lead:** Accesso propri dati (firma, pagamento, config)
3. **Operatore:** Gestione lead assegnati, workflow
4. **Admin:** Accesso completo, settings, dispositivi

**Matrice Permessi:**
| Risorsa | Pubblico | Lead | Operatore | Admin |
|---------|----------|------|-----------|-------|
| Landing Page | R | R | R | R |
| Form Pubblici | W | W | R | R |
| Propri Dati | - | RW | - | - |
| Dashboard Lead | - | - | R | RW |
| Contratti | - | R (propri) | RW | RWD |
| Pagamenti | - | W (propri) | R | RW |
| Dispositivi | - | - | R | RWD |
| Settings | - | - | - | RW |

#### 14.2.3 Crittografia

**In Transit:**
- HTTPS obbligatorio (TLS 1.3)
- HSTS header attivo
- No mixed content

**At Rest:**
- D1 database cifrato nativamente
- R2 bucket cifrato (AES-256)
- Firma digitale in base64 (reversibile per verifica)

**Dati Sensibili:**
- Password: bcrypt hash + salt
- Codice Fiscale: opzionalmente cifrato (AES-256)
- Dati Sanitari: accesso ristretto, log accessi

### 14.3 Audit e Compliance

#### 14.3.1 Logging

**Eventi Loggati:**
- Accessi dashboard (user, timestamp, IP)
- Modifiche dati lead (campo, old value, new value)
- Invio email (destinatario, template, esito)
- Firma contratti (IP, timestamp)
- Pagamenti (importo, esito)
- Accessi dati sensibili

**Tabella `audit_log`:**
- Azioni modificanti (INSERT, UPDATE, DELETE)
- User ID operatore
- Timestamp preciso
- Valori prima/dopo modifica

#### 14.3.2 Backup

**Frequenza:**
- Database: backup automatico quotidiano (Cloudflare)
- Documenti R2: replica multi-region
- Codice: Git repository (GitHub)

**Retention:**
- Backup giornalieri: 30 giorni
- Backup mensili: 12 mesi
- Backup annuali: 10 anni

**Restore:**
- Procedure documentate
- Test restore trimestrali
- RTO (Recovery Time Objective): 4 ore
- RPO (Recovery Point Objective): 24 ore

---

## 15. STATI E TRANSIZIONI

### 15.1 Diagramma Stati Lead

```
      ┌─────┐
      │ NEW │ (Lead appena creato)
      └──┬──┘
         │
         ↓
   ┌──────────┐
   │VALIDATED │ (Dati verificati)
   └────┬─────┘
        │
        ↓
   ┌─────────┐
   │QUALIFIED│ (Commercialmente valido)
   └────┬────┘
        │
        ├─→ ┌──────────────┐
        │   │BROCHURE_SENT │
        │   └──────────────┘
        │
        ├─→ ┌─────────────┐
        │   │MANUAL_SENT  │
        │   └─────────────┘
        │
        ↓
   ┌──────────────┐
   │CONTRACT_SENT │ (Contratto inviato)
   └──────┬───────┘
          │
          ↓
   ┌───────────────┐
   │CONTRACT_SIGNED│ (Contratto firmato)
   └───────┬───────┘
           │
           ↓
   ┌──────────────┐
   │PROFORMA_SENT │ (Proforma inviata)
   └──────┬───────┘
          │
          ↓
   ┌─────────────────┐
   │PAYMENT_RECEIVED │ (Pagamento OK)
   └────────┬────────┘
            │
            ↓
   ┌───────────────────┐
   │CONFIGURATION_SENT │ (Form config inviato)
   └─────────┬─────────┘
             │
             ↓
   ┌──────────────────────┐
   │CONFIGURATION_RECEIVED│ (Form compilato)
   └──────────┬───────────┘
              │
              ↓
   ┌─────────────────────┐
   │CONFIGURATION_VALIDATED│ (Config verificata)
   └──────────┬──────────┘
              │
              ↓
   ┌─────────────────┐
   │DEVICE_ASSOCIATED│ (Dispositivo assegnato)
   └────────┬────────┘
            │
            ↓
   ┌────────┐
   │ ACTIVE │ (Servizio attivo)
   └────────┘
```

### 15.2 Transizioni Consentite

| Da | A | Trigger | Automatico | Manuale |
|----|---|---------|------------|---------|
| NEW | VALIDATED | Verifica dati | No | Sì |
| VALIDATED | QUALIFIED | Qualificazione commerciale | No | Sì |
| QUALIFIED | CONTRACT_SENT | Invio contratto | Sì | Sì |
| CONTRACT_SENT | CONTRACT_SIGNED | Firma contratto | Sì | No |
| CONTRACT_SIGNED | PROFORMA_SENT | Generazione proforma | Sì | No |
| PROFORMA_SENT | PAYMENT_RECEIVED | Pagamento Stripe o manuale | Sì | Sì |
| PAYMENT_RECEIVED | CONFIGURATION_SENT | Invio form config | Sì | Sì |
| CONFIGURATION_SENT | CONFIGURATION_RECEIVED | Compilazione form | Sì | No |
| CONFIGURATION_RECEIVED | CONFIGURATION_VALIDATED | Verifica operatore | No | Sì |
| CONFIGURATION_VALIDATED | DEVICE_ASSOCIATED | Associazione dispositivo | No | Sì |
| DEVICE_ASSOCIATED | ACTIVE | Attivazione servizio | No | Sì |

### 15.3 Stati Terminali/Speciali

**CANCELLED:**
- Lead rinuncia durante processo
- No conversione
- Può essere riattivato

**ON_HOLD:**
- Processo sospeso temporaneamente
- Richiesta cliente o blocco amministrativo
- Riprendibile in futuro

**LOST:**
- Opportunità persa definitivamente
- Motivo perdita richiesto
- Report per analisi

**ARCHIVED:**
- Cliente cessato dopo periodo attivo
- Dati conservati ma non visibili in dashboard
- Solo per consultazione storica

---

## 16. ROADMAP TECNICO 2026-2027

### 16.1 Q1 2026 (Gennaio - Marzo) ✅ COMPLETATO

#### Obiettivi Raggiunti

**Refactoring Architettura Modulare**
- ✅ Migrazione da monolite a 50+ moduli TypeScript
- ✅ Separazione responsabilità (SOC) completa
- ✅ Riduzione accoppiamento componenti
- ✅ Miglioramento testabilità e manutenibilità
- ✅ Documentazione tecnica completa

**Implementazione Workflow Orchestrator**
- ✅ Engine orchestrazione 9 fasi
- ✅ Gestione transizioni stati automatiche
- ✅ Sistema reminder multi-step
- ✅ Gestione eccezioni e timeout
- ✅ Workflow Manager UI (Kanban + Timeline)

**Integrazione Stripe Pagamenti**
- ✅ Stripe Checkout Session API
- ✅ Webhook handler sicuro (signature verification)
- ✅ Gestione stati proforma (PENDING/PAID/EXPIRED)
- ✅ Supporto pagamenti alternativi (bonifico)
- ✅ Dashboard transazioni

**Sistema Template Email**
- ✅ 12 template email transazionali
- ✅ Template loader dinamico
- ✅ Placeholder rendering engine
- ✅ Tracking apertura/click email
- ✅ Log completo email inviate

**Dashboard Operativa Completa**
- ✅ Dashboard Lead (KPI, filtri, tabella)
- ✅ Dashboard Dati (funnel, grafici, mappe)
- ✅ Workflow Manager (Kanban, Timeline, Priorità)
- ✅ Dettaglio lead (5 tab, azioni rapide)
- ✅ Export CSV e report

**Fix Produzione Critici**
- ✅ Fix 404 configurazione/pagamento (routing CloudFlare)
- ✅ Fix redirect home post-firma (window.close rimosso)
- ✅ Fix UPSERT contratti (no duplicati)
- ✅ Fix UNIQUE constraint codice_contratto
- ✅ Provincia vuota invece N/A

### 16.2 Q2 2026 (Aprile - Giugno)

#### Integrazioni CRM Enterprise

**Integrazione HubSpot CRM**
- [ ] Sync bidirezionale lead TeleMedCare ↔ HubSpot
- [ ] Mappatura stati workflow → pipeline HubSpot
- [ ] Sync contatti, deal, note
- [ ] Webhook HubSpot per aggiornamenti real-time
- [ ] Dashboard unificato HubSpot + TeleMedCare
- **Beneficio:** Unificazione dati commerciali, reporting avanzato
- **Complessità:** Media | **Tempo:** 4 settimane | **Priorità:** Alta

**API Gateway Pubblico**
- [ ] Documentazione API OpenAPI 3.0
- [ ] Rate limiting per cliente (1000 req/ora)
- [ ] API key management per partner
- [ ] Sandbox ambiente test
- [ ] SDK JavaScript/Python
- **Beneficio:** Integrazioni terze facilitate
- **Complessità:** Alta | **Tempo:** 6 settimane | **Priorità:** Media

#### Self-Service Cliente

**Portal Clienti Web**
- [ ] Area riservata cliente (login magic link)
- [ ] Visualizzazione stato pratica in tempo reale
- [ ] Download documenti (contratto, proforma, fatture)
- [ ] Modifica dati anagrafici (con approvazione operatore)
- [ ] Storico comunicazioni
- [ ] FAQ e knowledge base
- **Beneficio:** Riduzione chiamate supporto -40%
- **Complessità:** Alta | **Tempo:** 8 settimane | **Priorità:** Alta

**App Mobile Operatori (iOS/Android)**
- [ ] React Native cross-platform
- [ ] Dashboard lead mobile-optimized
- [ ] Notifiche push real-time (Firebase)
- [ ] Azioni rapide (chiamata, email, cambio stato)
- [ ] Scansione QR code dispositivi
- [ ] Modalità offline (sync automatico)
- **Beneficio:** Operatori sempre connessi, +30% produttività
- **Complessità:** Alta | **Tempo:** 10 settimane | **Priorità:** Media

#### Analytics & Intelligence

**Miglioramento Lead Scoring (ML)**
- [ ] Modello predittivo conversione (TensorFlow.js)
- [ ] Training su storico lead (222+ record)
- [ ] Features: tempo risposta, aperture email, click, dati demo
- [ ] Score dinamico aggiornato real-time
- [ ] Suggerimenti azioni per operatore
- **Beneficio:** +15% conversion rate previsto
- **Complessità:** Alta | **Tempo:** 6 settimane | **Priorità:** Media

**Dashboard Analytics Avanzato**
- [ ] Integrazione Power BI o Metabase
- [ ] Report personalizzabili drag-drop
- [ ] Drill-down multi-livello
- [ ] Export automatico report (PDF, Excel)
- [ ] Condivisione report stakeholder
- **Beneficio:** Decision-making data-driven
- **Complessità:** Media | **Tempo:** 4 settimane | **Priorità:** Bassa

### 16.3 Q3 2026 (Luglio - Settembre)

#### AI & Automation

**Chatbot AI Assistenza Lead**
- [ ] Integrazione Gemini Pro o GPT-4
- [ ] Chat widget landing page
- [ ] Qualificazione automatica lead 24/7
- [ ] Risposte FAQ automatiche
- [ ] Escalation a operatore se necessario
- [ ] Training su knowledge base eCura
- **Beneficio:** Lead capture +25%, disponibilità H24
- **Complessità:** Alta | **Tempo:** 8 settimane | **Priorità:** Alta

**Voice AI per Chiamate Outbound**
- [ ] Integrazione Twilio + speech-to-text
- [ ] Chiamate automatiche reminder firma/pagamento
- [ ] Riconoscimento intento (conferma, posticipa, rinuncia)
- [ ] Trascrizione chiamate automatica
- [ ] Sentiment analysis conversazioni
- **Beneficio:** Automazione follow-up, liberazione operatori
- **Complessità:** Molto Alta | **Tempo:** 10 settimane | **Priorità:** Bassa

#### Support & Ticketing

**Sistema Ticketing Integrato**
- [ ] Creazione ticket da email, chat, telefono
- [ ] Assegnazione automatica per competenza
- [ ] SLA tracking (tempo risposta, risoluzione)
- [ ] Knowledge base interna operatori
- [ ] Integrazione con CRM (ticket collegato a lead/cliente)
- [ ] Dashboard supporto (ticket aperti, tempo medio)
- **Beneficio:** Gestione supporto post-vendita professionale
- **Complessità:** Media | **Tempo:** 6 settimane | **Priorità:** Media

**Live Chat Operatori**
- [ ] Widget live chat sito web
- [ ] Multi-operatore con routing intelligente
- [ ] Trasferimento chat tra operatori
- [ ] Chat history salvata in CRM
- [ ] Messaggi pre-definiti per risposte rapide
- **Beneficio:** Conversione lead real-time +18%
- **Complessità:** Media | **Tempo:** 4 settimane | **Priorità:** Alta

#### Compliance & Finance

**Fatturazione Elettronica**
- [ ] Generazione XML formato SDI (Sistema di Interscambio)
- [ ] Invio automatico SDI tramite intermediario
- [ ] Ricezione notifiche consegna/scarto
- [ ] Archivio fatture digitale (conservazione 10 anni)
- [ ] Integrazione con software contabilità (Danea, TeamSystem)
- **Beneficio:** Obbligo legale, automazione contabilità
- **Complessità:** Alta | **Tempo:** 6 settimane | **Priorità:** Alta

**CRM Telefonia (VoIP Integration)**
- [ ] Integrazione Twilio o 3CX
- [ ] Click-to-call da dashboard
- [ ] Call recording automatico
- [ ] IVR (Interactive Voice Response) per incoming
- [ ] Call analytics (durata, esito, trascrizione)
- **Beneficio:** Tracciamento completo interazioni telefoniche
- **Complessità:** Alta | **Tempo:** 6 settimane | **Priorità:** Media

### 16.4 Q4 2026 (Ottobre - Dicembre)

#### Advanced Features

**Analisi Predittiva Churn**
- [ ] Modello ML predizione abbandono cliente
- [ ] Early warning system clienti a rischio
- [ ] Suggerimenti azioni retention automatiche
- [ ] Dashboard churn rate e LTV (Lifetime Value)
- [ ] Campagne re-engagement automatiche
- **Beneficio:** Riduzione churn -30%
- **Complessità:** Molto Alta | **Tempo:** 8 settimane | **Priorità:** Media

**Automazione Marketing**
- [ ] Email drip campaigns multi-step
- [ ] Segmentazione avanzata lead (RFM, comportamentale)
- [ ] A/B testing email automatico
- [ ] Landing page builder integrato
- [ ] Lead magnet automation (ebook, webinar)
- **Beneficio:** Nurturing lead automatizzato, +20% engagement
- **Complessità:** Alta | **Tempo:** 8 settimane | **Priorità:** Media

**Sistema Loyalty & Referral**
- [ ] Programma punti fedeltà clienti
- [ ] Sconti rinnovi per clienti storici
- [ ] Referral program (porta un amico)
- [ ] Dashboard gamification operatori
- [ ] Marketplace benefit (sconti partner)
- **Beneficio:** Fidelizzazione clienti, acquisizione organica
- **Complessità:** Media | **Tempo:** 6 settimane | **Priorità:** Bassa

#### Integrations & Scalability

**Integrazione Centrale Operativa**
- [ ] API proprietaria centrale operativa
- [ ] Sync real-time dispositivi attivi
- [ ] Notifiche emergenze push operatori
- [ ] Storico chiamate emergenza in CRM
- [ ] Dashboard operativa unificata
- **Beneficio:** Visione completa servizio cliente
- **Complessità:** Molto Alta | **Tempo:** 10 settimane | **Priorità:** Alta

**Multi-Tenant White-Label**
- [ ] Architettura multi-tenant (DB separation)
- [ ] Personalizzazione brand per partner
- [ ] Gestione permessi multi-livello
- [ ] Fatturazione SaaS automatica
- [ ] Admin panel super-admin
- **Beneficio:** Business model SaaS, scaling revenue
- **Complessità:** Molto Alta | **Tempo:** 12 settimane | **Priorità:** Bassa

**Compliance Automation**
- [ ] Monitoring automatico scadenze GDPR
- [ ] Alert consensi da rinnovare
- [ ] Audit log advanced search
- [ ] Report compliance automatici (mensili)
- [ ] Dashboard conformità normativa
- **Beneficio:** Riduzione rischio sanzioni, audit facilitato
- **Complessità:** Media | **Tempo:** 4 settimane | **Priorità:** Media

### 16.5 Q1 2027 e Oltre

#### Strategic Initiatives

**Intelligenza Artificiale Generativa**
- [ ] Generazione automatica contenuti marketing (Gemini/GPT)
- [ ] Email personalizzate AI-generated per ogni lead
- [ ] Chatbot conversazionale avanzato
- [ ] Analisi sentiment social media
- [ ] Previsione trend mercato

**Blockchain per Contratti**
- [ ] Smart contract su blockchain per contratti digitali
- [ ] Immutabilità firma digitale certificata
- [ ] Timestamp blockchain per validità legale
- [ ] NFT per certificati servizio

**IoT Integration**
- [ ] Telemetria dispositivi real-time
- [ ] Manutenzione predittiva (AI su dati sensori)
- [ ] Geolocalizzazione dispositivi
- [ ] Alert anomalie uso dispositivo

**Expansion Internazionale**
- [ ] Multi-language support (EN, FR, DE, ES)
- [ ] Multi-currency pagamenti
- [ ] Compliance GDPR paesi EU
- [ ] Localizzazione fuso orario

### 16.6 Prioritizzazione Roadmap

#### Matrice Impatto vs. Sforzo

**Quick Wins (Alto Impatto, Basso Sforzo):**
1. Sistema Notifiche Push (Q2)
2. Dashboard Analytics Avanzato (Q2)
3. Live Chat Operatori (Q3)
4. Compliance Automation (Q4)

**Progetti Strategici (Alto Impatto, Alto Sforzo):**
1. Portal Clienti Self-Service (Q2)
2. Chatbot AI (Q3)
3. Fatturazione Elettronica (Q3)
4. Integrazione Centrale Operativa (Q4)

**Fill-Ins (Basso Impatto, Basso Sforzo):**
1. Export report automatico (Q2)
2. Messaggi pre-definiti live chat (Q3)
3. Dashboard gamification (Q4)

**Progetti Long-Term (Basso Impatto, Alto Sforzo):**
1. Multi-Tenant White-Label (Q4)
2. Blockchain contratti (2027)
3. Expansion internazionale (2027)

### 16.7 Risorse Necessarie

#### Team Tecnico

**Q2 2026:**
- 2 Backend Developer (TypeScript, Hono, D1)
- 1 Frontend Developer (React Native)
- 1 DevOps Engineer (CloudFlare, CI/CD)
- 1 QA Engineer (testing automatico)

**Q3 2026:**
- +1 AI/ML Engineer (TensorFlow, NLP)
- +1 Mobile Developer (iOS/Android)
- +1 UX/UI Designer (portal clienti, app mobile)

**Q4 2026:**
- +1 Data Engineer (BI, analytics)
- +1 Security Engineer (audit, compliance)

#### Budget Tecnologia (Annuale)

| Servizio | Costo Mensile | Costo Annuale |
|----------|---------------|---------------|
| Cloudflare Pages/Workers | €50 | €600 |
| Cloudflare D1 Database | €25 | €300 |
| Cloudflare R2 Storage | €10 | €120 |
| Resend Email API | €30 | €360 |
| Stripe (commissioni 1,4%+€0,25) | Variabile | ~€800 |
| HubSpot CRM (Starter) | €45 | €540 |
| Twilio (SMS/Voice) | €100 | €1.200 |
| Firebase (Push Notifications) | €20 | €240 |
| GitHub (Team) | €4 | €48 |
| Monitoring (Sentry, Datadog) | €50 | €600 |
| **TOTALE** | **€334** | **€4.808** |

---

## CONCLUSIONI

**TeleMedCare V12.0** è un sistema CRM completo e automatizzato per la gestione end-to-end del processo commerciale e operativo nel settore della teleassistenza domiciliare.

### Punti di Forza

✅ **Automazione Completa:** Dal lead all'attivazione con minimo intervento manuale

✅ **Tracciabilità Totale:** Ogni step loggato e monitorabile

✅ **Scalabilità:** Architettura modulare pronta per crescita

✅ **Compliance:** GDPR-ready, audit trail completo

✅ **User Experience:** Dashboard intuitive, workflow guidati

✅ **Integrazione:** Email, pagamenti, storage unificati

✅ **Sicurezza:** Crittografia, autenticazione, backup automatici

### Roadmap Evolutivo

Con la roadmap tecnico 2026-2027, il sistema evolverà da piattaforma CRM a **ecosistema completo** che integra AI, automazione avanzata, self-service clienti, e analytics predittivo, consolidando la leadership nel mercato della teleassistenza domiciliare digitale

---

**Fine Documentazione Funzionale Sistema TeleMedCare V12.0**

*Documento redatto: 24 Febbraio 2026*
*Versione Sistema: V12.0 (Commit aee3a78)*
*Ultimo aggiornamento: Fix 404 configurazione/pagamento*
