# 📊 SCHEMA DATABASE COMPLETO - TeleMedCare V12

**Documento di riferimento definitivo** - Tutti gli schemi delle tabelle del database.

Ultimo aggiornamento: **2026-03-06**

---

## ⚠️ REGOLA FONDAMENTALE

**PRIMA DI SCRIVERE UNA QUERY SQL:**
1. Apri questo file (`DB_SCHEMA_COMPLETE.md`)
2. Verifica i nomi ESATTI delle tabelle e colonne
3. **NON INVENTARE** nomi di colonne
4. **NON FARE ASSUNZIONI** sui nomi dei campi

---

## 📋 INDICE TABELLE

1. [assistiti](#1-assistiti) - Assistiti attivi con dispositivi
2. [configurations](#2-configurations) - Configurazioni dispositivi e contatti emergenza
3. [contracts](#3-contracts) - Contratti firmati digitalmente
4. [dispositivi](#4-dispositivi) - Dispositivi SiDLY/CARE
5. [leads](#5-leads) - Contatti/Lead in pipeline
6. [payments](#6-payments) - Pagamenti e transazioni
7. [proforma](#7-proforma) - Proforma/Fatture proforma
8. [lead_interactions](#8-lead_interactions) - Interazioni con lead
9. [lead_completion_tokens](#9-lead_completion_tokens) - Token per form configurazione
10. [email_logs](#10-email_logs) - Log invio email
11. [email_templates](#11-email_templates) - Template email personalizzabili
12. [document_templates](#12-document_templates) - Template documenti (contratti, etc)
13. [signatures](#13-signatures) - Firme digitali
14. [users](#14-users) - Utenti sistema
15. [settings](#15-settings) - Configurazioni sistema
16. [stats](#16-stats) - Statistiche aggregate
17. [system_config](#17-system_config) - Configurazione sistema

---

## 1. `assistiti`

**Descrizione**: Assistiti attivi con dispositivi assegnati.

```sql
CREATE TABLE assistiti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codice TEXT UNIQUE NOT NULL,              -- Codice univoco assistito (es. ASS-001)
    nome TEXT NOT NULL,                       -- Nome assistito (deprecated, usa nome_assistito)
    email TEXT,
    telefono TEXT,
    imei TEXT UNIQUE,                         -- IMEI dispositivo assegnato
    status TEXT DEFAULT 'ATTIVO',             -- ATTIVO, INATTIVO, SOSPESO
    lead_id TEXT,                             -- FK leads(id)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Dati anagrafici assistito
    nome_assistito TEXT,
    cognome_assistito TEXT,
    data_nascita TEXT,
    codice_fiscale TEXT,
    sesso TEXT,                               -- M, F
    peso TEXT,                                -- in kg
    altezza TEXT,                             -- in cm
    indirizzo TEXT,
    comune TEXT,
    
    -- Dati caregiver
    nome_caregiver TEXT,
    cognome_caregiver TEXT,
    parentela_caregiver TEXT,                 -- Relazione con assistito
    caregiver_nome TEXT,                      -- Alias per nome_caregiver
    caregiver_telefono TEXT,
    
    -- Servizio
    piano TEXT DEFAULT 'BASE',                -- BASE, AVANZATO
    servizio TEXT DEFAULT 'eCura PRO'         -- eCura PRO, eCura PREMIUM, eCura FAMILY
)
```

**Note**:
- `codice` deve essere univoco (es. ASS-001, ASS-002)
- `imei` deve essere univoco (collegato a un solo assistito)
- `nome` è deprecated, usare `nome_assistito` e `cognome_assistito`

---

## 2. `configurations`

**Descrizione**: Configurazioni dispositivi, contatti emergenza e informazioni mediche.

```sql
CREATE TABLE configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    leadId TEXT NOT NULL,                     -- FK leads(id)
    device_id INTEGER,                        -- FK dispositivi(id)
    contract_id TEXT,                         -- FK contracts(id)
    
    -- Contatti emergenza
    contatto_emergenza_1_nome TEXT,
    contatto_emergenza_1_telefono TEXT,
    contatto_emergenza_1_relazione TEXT,
    contatto_emergenza_2_nome TEXT,
    contatto_emergenza_2_telefono TEXT,
    contatto_emergenza_2_relazione TEXT,
    
    -- Medico e centro medico
    medico_curante_nome TEXT,
    medico_curante_telefono TEXT,
    centro_medico_riferimento TEXT,
    
    -- Informazioni mediche
    allergie TEXT,
    patologie_croniche TEXT,
    farmaci_assunti TEXT,
    
    -- Configurazione dispositivo
    modalita_utilizzo TEXT,
    orari_attivazione TEXT,
    
    -- Status e tracking
    status TEXT DEFAULT 'PENDING',            -- PENDING, COMPLETED, FAILED
    data_completamento DATETIME,
    form_inviato BOOLEAN DEFAULT FALSE,
    email_benvenuto_inviata BOOLEAN DEFAULT FALSE,
    email_conferma_inviata BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
)
```

**Note**:
- Record creato dopo submit del form configurazione
- `leadId` collega alla tabella `leads`
- `device_id` collega al dispositivo assegnato (se già presente)

---

## 3. `contracts`

**Descrizione**: Contratti firmati digitalmente con firma inline.

```sql
CREATE TABLE contracts (
    id TEXT PRIMARY KEY,                      -- CONTRACT_CTR-XXXX-YYYY_timestamp
    leadId TEXT NOT NULL,                     -- FK leads(id)
    
    -- Dati contratto
    codice_contratto TEXT UNIQUE NOT NULL,    -- Codice univoco per riferimento
    tipo_contratto TEXT NOT NULL,             -- BASE, AVANZATO
    template_utilizzato TEXT NOT NULL,        -- Template_Contratto_Base_TeleMedCare, Template_Contratto_Avanzato_TeleMedCare
    
    -- Contenuto e personalizzazione
    contenuto_html TEXT NOT NULL,             -- HTML del contratto personalizzato
    pdf_url TEXT,                             -- URL del PDF generato
    pdf_generated BOOLEAN DEFAULT FALSE,
    
    -- Dati economici
    prezzo_mensile DECIMAL(10,2) NOT NULL,    -- Prezzo mensile (IVA ESCLUSA)
    durata_mesi INTEGER DEFAULT 12,
    prezzo_totale DECIMAL(10,2) NOT NULL,     -- Totale annuale (IVA ESCLUSA, es. €840)
    
    -- Status e workflow
    status TEXT DEFAULT 'DRAFT',              -- DRAFT, SENT, SIGNED, EXPIRED, CANCELLED
    data_invio DATETIME,
    data_scadenza DATETIME,                   -- Scadenza per firma (es. 30 giorni dall'invio)
    
    -- Email tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_template_used TEXT,                 -- email_invio_contratto
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Dati servizio
    imei_dispositivo TEXT,
    piano TEXT,                               -- BASE, AVANZATO
    servizio TEXT DEFAULT 'eCura PRO',        -- eCura PRO, eCura PREMIUM, eCura FAMILY
    
    -- Firma digitale inline
    signature_data TEXT,                      -- SVG della firma
    signature_ip TEXT,                        -- IP del firmatario
    signature_timestamp TEXT,                 -- Timestamp firma
    signature_user_agent TEXT,                -- Browser del firmatario
    signature_screen_resolution TEXT,         -- Risoluzione schermo
    signed_at TEXT,                           -- Data/ora firma
    signature_method TEXT DEFAULT 'inline',   -- inline, external, paper
    
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
)
```

**Note**:
- `prezzo_totale` contiene prezzo SENZA IVA (es. €840)
- Firma digitale salvata come SVG in `signature_data`
- Status `SIGNED` indica contratto firmato e valido

---

## 4. `dispositivi`

**Descrizione**: Dispositivi SiDLY/CARE assegnabili agli assistiti.

```sql
CREATE TABLE dispositivi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imei TEXT UNIQUE NOT NULL,                -- IMEI univoco dispositivo
    modello TEXT NOT NULL,                    -- SiDLY, CARE, SiDLY_PRO
    stato TEXT DEFAULT 'DISPONIBILE',         -- DISPONIBILE, ASSEGNATO, IN_MANUTENZIONE, DISMESSO
    data_acquisto DATE,
    data_assegnazione DATE,
    assistito_id INTEGER,                     -- FK assistiti(id)
    note TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assistito_id) REFERENCES assistiti(id) ON DELETE SET NULL
)
```

**Note**:
- `imei` deve essere univoco
- `stato` indica disponibilità dispositivo
- `assistito_id` collega al record assistito (se assegnato)

---

## 5. `leads`

**Descrizione**: Contatti/Lead in pipeline di vendita.

```sql
CREATE TABLE leads (
    id TEXT PRIMARY KEY,                      -- LEAD-IRBEMA-00001
    nomeRichiedente TEXT,
    cognomeRichiedente TEXT,
    email TEXT,
    telefono TEXT,
    
    -- Dati assistito
    nomeAssistito TEXT,
    cognomeAssistito TEXT,
    dataNascitaAssistito TEXT,
    luogoNascitaAssistito TEXT,
    codiceFiscaleAssistito TEXT,
    indirizzoAssistito TEXT,
    cittaAssistito TEXT,
    provinciaAssistito TEXT,
    capAssistito TEXT,
    etaAssistito INTEGER,
    etaCalcolata INTEGER,
    
    -- Dati intestatario contratto
    intestatarioContratto TEXT,               -- 'richiedente', 'assistito'
    intestazioneContratto TEXT,               -- Alias per intestatarioContratto
    cfIntestatario TEXT,
    codiceFiscaleIntestatario TEXT,
    indirizzoIntestatario TEXT,
    capIntestatario TEXT,
    cittaIntestatario TEXT,
    provinciaIntestatario TEXT,
    luogoNascitaIntestatario TEXT,
    dataNascitaIntestatario TEXT,
    
    -- Servizio
    servizio TEXT,                            -- eCura PRO, eCura PREMIUM, eCura FAMILY
    piano TEXT,                               -- BASE, AVANZATO
    tipoServizio TEXT,                        -- Legacy field
    prezzo_anno REAL,
    prezzo_rinnovo REAL,
    
    -- Prezzi dettagliati
    setupBase REAL,
    setupIva REAL,
    setupTotale REAL,
    rinnovoBase REAL,
    rinnovoIva REAL,
    rinnovoTotale REAL,
    
    -- Metadata
    fonte TEXT,                               -- 'Form eCura', 'IRBEMA', etc.
    external_source_id TEXT,                  -- ID HubSpot o altro CRM
    external_data TEXT,                       -- JSON con dati esterni
    status TEXT,                              -- NEW, CONTACTED, QUALIFIED, etc.
    stato TEXT,                               -- Alias per status (in italiano)
    note TEXT,
    cm TEXT,                                  -- Iniziali commerciale
    
    -- Flags
    vuoleContratto INTEGER DEFAULT 0,
    vuoleBrochure INTEGER DEFAULT 0,
    vuoleManuale INTEGER DEFAULT 0,
    gdprConsent INTEGER DEFAULT 0,
    consensoMarketing INTEGER DEFAULT 0,
    consensoTerze INTEGER DEFAULT 0,
    consensoPrivacy INTEGER DEFAULT 0,
    
    -- Informazioni mediche
    condizioniSalute TEXT,
    
    -- Dati aggiuntivi (possono essere NULL)
    cfAssistito TEXT,
    emailRichiedente TEXT,
    telefonoRichiedente TEXT,
    
    -- Timestamps
    timestamp TEXT,
    created_at TEXT,
    updated_at TEXT
)
```

**Note**:
- Campo lead è `leadId` in altre tabelle (es. contracts, payments)
- Email può essere `email` o `emailRichiedente`
- `intestatarioContratto` indica chi firma il contratto

---

## 6. `payments`

**Descrizione**: Pagamenti e transazioni (Stripe, bonifici, PayPal).

```sql
CREATE TABLE payments (
    id TEXT PRIMARY KEY,                      -- PAY17728068303460916
    proforma_id TEXT NOT NULL,                -- FK proforma(id) - può essere numero o text
    contract_id TEXT NOT NULL,                -- FK contracts(id)
    leadId TEXT NOT NULL,                     -- FK leads(id)
    
    -- Dati pagamento
    importo DECIMAL(10,2) NOT NULL,
    valuta TEXT DEFAULT 'EUR',
    metodo_pagamento TEXT NOT NULL,           -- BONIFICO, STRIPE_CARD, STRIPE_SEPA, PAYPAL
    
    -- Dettagli transazione
    transaction_id TEXT,                      -- ID della transazione (Stripe, banca, etc.)
    riferimento_bonifico TEXT,                -- Per bonifici
    iban_mittente TEXT,                       -- Per bonifici
    
    -- Status
    status TEXT DEFAULT 'PENDING',            -- PENDING, COMPLETED, FAILED, REFUNDED
    data_pagamento DATETIME,
    data_conferma DATETIME,                   -- Quando abbiamo confermato il pagamento
    
    -- Stripe/PayPal specifici
    stripe_payment_intent_id TEXT,
    stripe_charge_id TEXT,
    paypal_transaction_id TEXT,
    
    -- Note e tracking
    note TEXT,
    verificato_manualmente BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proforma_id) REFERENCES proforma(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
)
```

**Note**:
- **TUTTI i 20 campi devono essere popolati** (evitare NULL)
- `status` cambia da PENDING a COMPLETED dopo pagamento
- `stripe_payment_intent_id` contiene ID Stripe per tracciamento

---

## 7. `proforma`

**Descrizione**: Proforma/Fatture proforma per pagamenti.

```sql
CREATE TABLE proforma (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id TEXT,                         -- FK contracts(id) - opzionale
    leadId TEXT NOT NULL,                     -- FK leads(id)
    numero_proforma TEXT NOT NULL UNIQUE,     -- PRF202603-XXXX
    data_emissione TEXT NOT NULL,
    data_scadenza TEXT NOT NULL,
    
    -- Dati cliente
    cliente_nome TEXT,
    cliente_cognome TEXT,
    cliente_email TEXT,
    cliente_telefono TEXT,
    cliente_indirizzo TEXT,
    cliente_citta TEXT,
    cliente_cap TEXT,
    cliente_provincia TEXT,
    cliente_codice_fiscale TEXT,
    
    -- Servizio e importi
    tipo_servizio TEXT,                       -- es. "eCura PREMIUM"
    prezzo_mensile REAL,                      -- Prezzo mensile (IVA esclusa / 12)
    durata_mesi INTEGER DEFAULT 12,
    prezzo_totale REAL NOT NULL,              -- ⚠️ Totale CON IVA (es. €1207.80)
    
    -- Status
    status TEXT DEFAULT 'GENERATED',          -- GENERATED, SENT, PAID, EXPIRED
    email_sent INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    
    FOREIGN KEY (leadId) REFERENCES leads(id),
    FOREIGN KEY (contract_id) REFERENCES contracts(id)
)
```

**Note**:
- ⚠️ `prezzo_totale` contiene GIÀ l'IVA inclusa (es. €1207.80)
- `contract_id` è opzionale (FK può essere NULL)
- `numero_proforma` deve essere univoco (es. PRF202603-0XGK)

**💡 CALCOLO CORRETTO**:
```javascript
prezzoBase = 990.00          // Base annuale senza IVA
prezzoConIva = 1207.80       // Totale annuale con IVA 22%
prezzo_mensile = 82.50       // prezzoBase / 12 (mensile senza IVA)
prezzo_totale = 1207.80      // ← Questo va in DB (CON IVA)
```

---

## 8. `lead_interactions`

**Descrizione**: Interazioni con lead (chiamate, email, note).

```sql
CREATE TABLE lead_interactions (
    id TEXT PRIMARY KEY,                      -- INT-timestamp-random
    lead_id TEXT NOT NULL,                    -- FK leads(id) ⚠️ snake_case
    data TEXT NOT NULL,
    tipo TEXT NOT NULL,                       -- CHIAMATA, EMAIL, NOTA
    nota TEXT,
    azione TEXT,
    operatore TEXT,
    created_at TEXT NOT NULL,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id)
)
```

**Note**:
- ⚠️ Campo FK è `lead_id` (snake_case), non `leadId`
- Le interazioni manuali sono in questa tabella
- **NON sovrascrivere** il campo `leads.note` con dati automatici

---

## 9. `lead_completion_tokens`

**Descrizione**: Token per form configurazione (link email).

```sql
CREATE TABLE lead_completion_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL,                    -- FK leads(id)
    token TEXT UNIQUE NOT NULL,               -- Token univoco per URL
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,             -- Scadenza token (es. 30 giorni)
    used BOOLEAN DEFAULT FALSE,
    used_at DATETIME,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
)
```

**Note**:
- Token generato per link email configurazione
- URL formato: `/form-configurazione?leadId=...&token=...`
- `expires_at` tipicamente 30 giorni dalla creazione

---

## 10. `email_logs`

**Descrizione**: Log invio email per tracking.

```sql
CREATE TABLE email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT,                             -- FK leads(id) - opzionale
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template_used TEXT,
    status TEXT DEFAULT 'SENT',               -- SENT, FAILED, BOUNCED
    message_id TEXT,                          -- ID messaggio provider email
    error_message TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
)
```

**Note**:
- `lead_id` può essere NULL (email generiche)
- `message_id` utile per tracking con provider email

---

## 11. `email_templates`

**Descrizione**: Template email personalizzabili.

```sql
CREATE TABLE email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,                -- email_benvenuto, email_configurazione, etc.
    subject TEXT NOT NULL,
    content TEXT NOT NULL,                    -- HTML del template
    variables TEXT,                           -- JSON con lista variabili disponibili
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Note**:
- `name` deve essere univoco (es. `email_benvenuto`)
- `content` contiene HTML con placeholder `{{VARIABILE}}`
- `variables` è JSON con lista placeholder disponibili

---

## 12. `document_templates`

**Descrizione**: Template documenti (contratti, etc).

```sql
CREATE TABLE document_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,                -- Template_Contratto_Base_TeleMedCare, etc.
    type TEXT NOT NULL,                       -- CONTRACT, INVOICE, PROFORMA
    content TEXT NOT NULL,                    -- HTML del template
    variables TEXT,                           -- JSON con lista variabili
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Note**:
- `name` deve essere univoco
- `type` indica tipologia documento
- `content` contiene HTML con placeholder

---

## 13. `signatures`

**Descrizione**: Firme digitali (backup/archivio).

```sql
CREATE TABLE signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id TEXT NOT NULL,                -- FK contracts(id)
    lead_id TEXT NOT NULL,                    -- FK leads(id)
    signature_data TEXT NOT NULL,             -- SVG della firma
    signature_ip TEXT,
    signature_timestamp DATETIME NOT NULL,
    signature_user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
)
```

**Note**:
- Backup delle firme digitali
- `signature_data` contiene SVG completo

---

## 14. `users`

**Descrizione**: Utenti sistema (admin, operatori).

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'USER',                 -- ADMIN, MANAGER, USER
    active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Note**:
- `password_hash` contiene hash bcrypt
- `role` determina permessi utente

---

## 15. `settings`

**Descrizione**: Configurazioni sistema key-value.

```sql
CREATE TABLE settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Note**:
- Struttura key-value per configurazioni
- `value` è sempre TEXT (parse se JSON/number)

---

## 16. `stats`

**Descrizione**: Statistiche aggregate.

```sql
CREATE TABLE stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL,
    metric_value REAL,
    period TEXT,                              -- daily, weekly, monthly
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Note**:
- Statistiche pre-calcolate per dashboard
- `period` indica granularità (giornaliero, settimanale, mensile)

---

## 17. `system_config`

**Descrizione**: Configurazione sistema avanzata.

```sql
CREATE TABLE system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT,
    config_type TEXT DEFAULT 'STRING',        -- STRING, NUMBER, BOOLEAN, JSON
    description TEXT,
    is_secret BOOLEAN DEFAULT FALSE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Note**:
- Simile a `settings` ma più strutturata
- `is_secret` indica valori sensibili (API keys, etc)

---

## 🔍 QUERY COMUNI CORRETTE

### ✅ Recuperare proforma con contratto

```sql
-- CORRETTO ✅
SELECT 
  p.*,
  c.id as contract_id,
  c.codice_contratto
FROM proforma p
LEFT JOIN contracts c ON c.leadId = p.leadId
WHERE p.numero_proforma = ?
ORDER BY c.created_at DESC
LIMIT 1
```

### ✅ Recuperare lead con contratto e payment

```sql
-- CORRETTO ✅
SELECT 
  l.*,
  c.codice_contratto,
  c.status as contract_status,
  p.status as payment_status,
  p.importo as payment_amount
FROM leads l
LEFT JOIN contracts c ON c.leadId = l.id
LEFT JOIN payments p ON p.leadId = l.id
WHERE l.email = ?
```

### ✅ Verificare payment completato

```sql
-- CORRETTO ✅
SELECT *
FROM payments
WHERE leadId = ?
  AND status = 'COMPLETED'
ORDER BY created_at DESC
LIMIT 1
```

---

## 📝 CHECKLIST PRE-QUERY

Prima di scrivere una query SQL, verifica:

- [ ] Ho consultato `DB_SCHEMA_COMPLETE.md`?
- [ ] I nomi delle tabelle sono corretti?
- [ ] I nomi delle colonne sono ESATTI (snake_case vs camelCase)?
- [ ] Ho verificato quali colonne esistono realmente?
- [ ] Ho verificato le FOREIGN KEY corrette per i JOIN?
- [ ] Ho testato la query mentalmente con lo schema?

---

## 🚨 ERRORI COMUNI DA EVITARE

| ❌ SBAGLIATO | ✅ CORRETTO | Tabella |
|-------------|-------------|---------|
| `c.lead_id` (dopo LEFT JOIN fallito) | `p.leadId` | proforma |
| `p.importo_totale` | `p.prezzo_totale` | proforma |
| `l.leadId` | `l.id` | leads |
| `p.contract_id IS NULL` | `p.contract_id` (può essere NULL) | proforma |
| Status `PENDING` dopo Stripe | Status `COMPLETED` | payments |

---

## 🔄 AGGIORNAMENTO SCHEMA

Questo documento DEVE essere aggiornato ogni volta che:
- Viene creata una nuova tabella
- Vengono aggiunte colonne
- Vengono rinominate colonne
- Viene modificata la struttura del DB

**Ultimo aggiornamento**: 2026-03-06

---

## 💡 COME USARE QUESTO DOCUMENTO

1. **PRIMA di scrivere codice**: apri questo file
2. **Cerca la tabella** che ti serve
3. **Copia i nomi ESATTI** delle colonne
4. **Verifica i JOIN** con le foreign key indicate
5. **Solo DOPO**: scrivi la query SQL

**Regola d'oro**: Se non sei sicuro del nome → GUARDA QUI PRIMA!

---

_"Il database è la fonte di verità. Non inventare mai nomi di colonne."_
