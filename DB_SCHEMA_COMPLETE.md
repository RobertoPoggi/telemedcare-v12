# 📊 SCHEMA DATABASE COMPLETO - TeleMedCare V12

**Documento di riferimento definitivo** - Tutti gli schemi delle tabelle del database.

Ultimo aggiornamento: **2026-03-06 18:00**

---

## ⚠️ REGOLA FONDAMENTALE

**PRIMA DI SCRIVERE UNA QUERY SQL O MODIFICARE IL CODICE:**
1. ✅ Apri questo file (`DB_SCHEMA_COMPLETE.md`)
2. ✅ Verifica i nomi ESATTI delle tabelle e colonne
3. ❌ **NON INVENTARE** nomi di colonne
4. ❌ **NON FARE ASSUNZIONI** sui nomi dei campi
5. ✅ **AGGIORNA QUESTO DOCUMENTO** dopo ogni modifica schema

---

## 📋 INDICE TABELLE (18 totali)

1. [assistiti](#1-assistiti) - Assistiti attivi con dispositivi
2. [configurations](#2-configurations) - Configurazioni dispositivi e contatti emergenza
3. [contracts](#3-contracts) - Contratti firmati digitalmente
4. [dispositivi](#4-dispositivi) - Dispositivi SiDLY/CARE (inventory)
5. [document_templates](#5-document_templates) - Template documenti
6. [email_logs](#6-email_logs) - Log invio email
7. [lead_completion_log](#7-lead_completion_log) - Log azioni completamento lead
8. [lead_completion_tokens](#8-lead_completion_tokens) - Token per form configurazione
9. [lead_interactions](#9-lead_interactions) - Interazioni con lead
10. [leads](#10-leads) - Contatti/Lead in pipeline
11. [payments](#11-payments) - Pagamenti e transazioni
12. [proforma](#12-proforma) - Proforma/Fatture proforma
13. [settings](#13-settings) - Configurazioni key-value
14. [signatures](#14-signatures) - Firme digitali
15. [sqlite_sequence](#15-sqlite_sequence) - Sequenze autoincrement (SQLite interno)
16. [stats](#16-stats) - Statistiche email
17. [system_config](#17-system_config) - Configurazione sistema
18. [users](#18-users) - Utenti sistema

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

---

## 3. `contracts`

**Descrizione**: Contratti firmati digitalmente con firma inline.

```sql
CREATE TABLE contracts (
    id TEXT PRIMARY KEY,                      -- CONTRACT_CTR-XXXX-YYYY_timestamp
    leadId TEXT NOT NULL,                     -- FK leads(id)
    
    -- Dati contratto
    codice_contratto TEXT UNIQUE NOT NULL,
    tipo_contratto TEXT NOT NULL,             -- BASE, AVANZATO
    template_utilizzato TEXT NOT NULL,
    
    -- Contenuto
    contenuto_html TEXT NOT NULL,
    pdf_url TEXT,
    pdf_generated BOOLEAN DEFAULT FALSE,
    
    -- Dati economici
    prezzo_mensile DECIMAL(10,2) NOT NULL,    -- Prezzo mensile (IVA ESCLUSA)
    durata_mesi INTEGER DEFAULT 12,
    prezzo_totale DECIMAL(10,2) NOT NULL,     -- ⚠️ Totale annuale SENZA IVA (es. €840)
    
    -- Status
    status TEXT DEFAULT 'DRAFT',              -- DRAFT, SENT, SIGNED, EXPIRED, CANCELLED
    data_invio DATETIME,
    data_scadenza DATETIME,
    
    -- Email tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_template_used TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Servizio
    imei_dispositivo TEXT,
    piano TEXT,
    servizio TEXT DEFAULT 'eCura PRO',
    
    -- Firma digitale inline
    signature_data TEXT,                      -- SVG della firma
    signature_ip TEXT,
    signature_timestamp TEXT,
    signature_user_agent TEXT,
    signature_screen_resolution TEXT,
    signed_at TEXT,
    signature_method TEXT DEFAULT 'inline',
    
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
)
```

**Note**:
- ⚠️ `prezzo_totale` contiene prezzo **SENZA IVA** (es. €840)
- Firma salvata come SVG in `signature_data`

---

## 4. `dispositivi`

**Descrizione**: Dispositivi SiDLY/CARE in inventario.

```sql
CREATE TABLE dispositivi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serial_number TEXT UNIQUE NOT NULL,       -- Serial number dispositivo
    modello TEXT NOT NULL,                    -- SiDLY, CARE, SiDLY_PRO
    status TEXT DEFAULT 'inventory',          -- inventory, assigned, active, maintenance, retired
    lead_id TEXT,                             -- FK leads(id)
    assigned_at TEXT,                         -- Data assegnazione
    activated_at TEXT,                        -- Data attivazione
    created_at TEXT NOT NULL,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id)
)
```

**Note**:
- `serial_number` è univoco
- `status` = 'inventory' indica dispositivo disponibile

---

## 5. `document_templates`

**Descrizione**: Template documenti (contratti, proforma, etc).

```sql
CREATE TABLE document_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,                       -- CONTRACT, INVOICE, PROFORMA, EMAIL
    subject TEXT,
    html_content TEXT NOT NULL,
    variables TEXT,                           -- JSON con lista placeholder
    category TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

---

## 6. `email_logs`

**Descrizione**: Log invio email per tracking completo.

```sql
CREATE TABLE email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Riferimenti
    leadId TEXT NOT NULL,                     -- FK leads(id)
    contract_id TEXT,                         -- FK contracts(id) - opzionale
    proforma_id TEXT,                         -- FK proforma(id) - opzionale
    
    -- Dati email
    recipient_email TEXT NOT NULL,
    template_used TEXT NOT NULL,              -- email_notifica_info, email_invio_contratto, etc.
    subject TEXT NOT NULL,
    
    -- Status invio
    status TEXT DEFAULT 'PENDING',            -- PENDING, SENT, DELIVERED, FAILED, BOUNCED
    provider_used TEXT,                       -- RESEND, SENDGRID, GMAIL
    provider_message_id TEXT,
    error_message TEXT,
    
    -- Tracking
    sent_at DATETIME,
    delivered_at DATETIME,
    opened_at DATETIME,
    clicked_at DATETIME,
    
    -- Allegati
    attachments TEXT,                         -- JSON array degli allegati
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (proforma_id) REFERENCES proforma(id) ON DELETE SET NULL
)
```

---

## 7. `lead_completion_log`

**Descrizione**: Log azioni completamento lead.

```sql
CREATE TABLE lead_completion_log (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,                    -- FK leads(id)
    token_id TEXT,                            -- FK lead_completion_tokens(id)
    action TEXT NOT NULL,                     -- FORM_OPENED, FORM_SUBMITTED, EMAIL_SENT, etc.
    details TEXT,                             -- JSON con dettagli azione
    created_at TEXT NOT NULL
)
```

---

## 8. `lead_completion_tokens`

**Descrizione**: Token per form configurazione (link email).

```sql
CREATE TABLE lead_completion_tokens (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,                    -- FK leads(id)
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    completed_at TEXT,
    reminder_sent_at TEXT,
    reminder_count INTEGER DEFAULT 0
)
```

**Note**:
- Token per URL: `/form-configurazione?leadId=...&token=...`
- `expires_at` tipicamente 30 giorni dalla creazione
- `completed` = 1 quando form è stato inviato

---

## 9. `lead_interactions`

**Descrizione**: Interazioni con lead (chiamate, email, note).

```sql
CREATE TABLE lead_interactions (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,                    -- FK leads(id) ⚠️ snake_case
    data TEXT NOT NULL,
    tipo TEXT NOT NULL,                       -- CHIAMATA, EMAIL, NOTA
    nota TEXT,
    azione TEXT,
    operatore TEXT,
    created_at TEXT NOT NULL,
    
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
)
```

**Note**:
- ⚠️ Campo FK è `lead_id` (snake_case), non `leadId`

---

## 10. `leads`

**Descrizione**: Contatti/Lead in pipeline di vendita.

```sql
CREATE TABLE leads (
    id TEXT PRIMARY KEY,                      -- LEAD-IRBEMA-00001
    
    -- Dati anagrafici base (sempre presenti)
    nomeRichiedente TEXT NOT NULL,
    cognomeRichiedente TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    
    -- Dati assistito (se diverso dal richiedente)
    nomeAssistito TEXT,
    cognomeAssistito TEXT,
    etaAssistito INTEGER,
    luogoNascitaAssistito TEXT,
    dataNascitaAssistito TEXT,
    indirizzoAssistito TEXT,
    capAssistito TEXT,
    cittaAssistito TEXT,
    provinciaAssistito TEXT,
    codiceFiscaleAssistito TEXT,
    cfAssistito TEXT,                         -- Alias per codiceFiscaleAssistito
    condizioniSalute TEXT,
    
    -- Dati intestatario contratto
    intestatarioContratto TEXT DEFAULT 'richiedente',  -- 'richiedente', 'assistito'
    intestazioneContratto TEXT DEFAULT 'richiedente',  -- Alias
    cfIntestatario TEXT,
    codiceFiscaleIntestatario TEXT,
    indirizzoIntestatario TEXT,
    capIntestatario TEXT,
    cittaIntestatario TEXT,
    provinciaIntestatario TEXT,
    luogoNascitaIntestatario TEXT,
    dataNascitaIntestatario TEXT,
    etaCalcolata INTEGER,
    
    -- Provenienza e tipologia richiesta
    fonte TEXT NOT NULL DEFAULT 'LANDING_PAGE',  -- LANDING_PAGE, IRBEMA, LUXOTTICA, PIRELLI, FAS
    tipoServizio TEXT NOT NULL,               -- BASE, AVANZATO (deprecato, usa 'piano')
    piano TEXT DEFAULT 'BASE',                -- BASE, AVANZATO
    servizio TEXT DEFAULT 'PRO',              -- PRO, PREMIUM, FAMILY (senza 'eCura')
    
    -- Richieste documenti
    vuoleBrochure TEXT DEFAULT 'No',          -- Si, No
    vuoleManuale TEXT DEFAULT 'No',           -- Si, No  
    vuoleContratto TEXT DEFAULT 'No',         -- Si, No
    
    -- Consensi
    consensoPrivacy BOOLEAN DEFAULT FALSE,
    consensoMarketing BOOLEAN DEFAULT FALSE,
    consensoTerze BOOLEAN DEFAULT FALSE,
    gdprConsent INTEGER DEFAULT 0,
    
    -- Prezzi
    prezzo_anno REAL DEFAULT 0,
    prezzo_rinnovo REAL DEFAULT 0,
    setupBase REAL,
    setupIva REAL,
    setupTotale REAL,
    rinnovoBase REAL,
    rinnovoIva REAL,
    rinnovoTotale REAL,
    
    -- Status e workflow
    status TEXT DEFAULT 'NEW',                -- NEW, CONTACTED, DOCUMENTS_SENT, CONTRACT_SENT, CONTRACT_SIGNED, CONVERTED, LOST
    stato TEXT DEFAULT NULL,                  -- Alias italiano per status
    note TEXT,
    cm TEXT DEFAULT NULL,                     -- Iniziali commerciale
    
    -- Dati di provenienza esterni
    external_source_id TEXT,
    external_data TEXT,                       -- JSON con dati aggiuntivi
    
    -- Dati aggiuntivi (legacy)
    emailRichiedente TEXT,
    telefonoRichiedente TEXT,
    
    -- Timestamps
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

**Note**:
- `servizio` può essere 'PRO', 'PREMIUM', 'FAMILY' (senza prefisso 'eCura')
- `piano` è 'BASE' o 'AVANZATO'
- `intestatarioContratto` indica chi firma

---

## 11. `payments`

**Descrizione**: Pagamenti e transazioni (Stripe, bonifici, PayPal).

```sql
CREATE TABLE payments (
    id TEXT PRIMARY KEY,                      -- PAY17728068303460916
    proforma_id TEXT NOT NULL,                -- FK proforma(id)
    contract_id TEXT NOT NULL,                -- FK contracts(id)
    leadId TEXT NOT NULL,                     -- FK leads(id)
    
    -- Dati pagamento
    importo DECIMAL(10,2) NOT NULL,
    valuta TEXT DEFAULT 'EUR',
    metodo_pagamento TEXT NOT NULL,           -- BONIFICO, STRIPE_CARD, STRIPE_SEPA, PAYPAL
    
    -- Dettagli transazione
    transaction_id TEXT,
    riferimento_bonifico TEXT,
    iban_mittente TEXT,
    
    -- Status
    status TEXT DEFAULT 'PENDING',            -- PENDING, COMPLETED, FAILED, REFUNDED
    data_pagamento DATETIME,
    data_conferma DATETIME,
    
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
- ✅ **TUTTI i 20 campi devono essere popolati** per evitare NULL
- Status cambia da PENDING → COMPLETED dopo pagamento riuscito

---

## 12. `proforma`

**Descrizione**: Proforma/Fatture proforma.

```sql
CREATE TABLE proforma (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id TEXT,                         -- FK contracts(id) - opzionale
    leadId TEXT,                              -- FK leads(id)
    numero_proforma TEXT UNIQUE,              -- PRF202603-XXXX
    data_emissione TEXT,
    data_scadenza TEXT,
    
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
    tipo_servizio TEXT,
    prezzo_mensile REAL,
    durata_mesi INTEGER,
    prezzo_totale REAL,                       -- ⚠️ Totale CON IVA (es. €1207.80)
    
    -- Status
    status TEXT DEFAULT 'DRAFT',              -- DRAFT, GENERATED, SENT, PAID, EXPIRED
    email_sent INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TEXT,
    updated_at TEXT
)
```

**Note**:
- ⚠️ `prezzo_totale` contiene **CON IVA** (es. €1207.80)
- Differenza importante: contracts.prezzo_totale = SENZA IVA, proforma.prezzo_totale = CON IVA

---

## 13. `settings`

**Descrizione**: Configurazioni sistema key-value.

```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
```

---

## 14. `signatures`

**Descrizione**: Firme digitali (backup/archivio).

```sql
CREATE TABLE signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id TEXT NOT NULL,                -- FK contracts(id)
    
    -- Dati firma
    firma_digitale TEXT NOT NULL,             -- Base64 o SVG della firma
    tipo_firma TEXT NOT NULL,                 -- ELECTRONIC, DIGITAL, HANDWRITTEN
    
    -- Metadati
    ip_address TEXT,
    user_agent TEXT,
    timestamp_firma DATETIME NOT NULL,
    
    -- Validazione
    hash_documento TEXT,
    certificato_firma TEXT,
    
    -- Status
    valida BOOLEAN DEFAULT TRUE,
    motivo_invalidazione TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
)
```

---

## 15. `sqlite_sequence`

**Descrizione**: Tabella interna SQLite per gestione AUTOINCREMENT.

```sql
CREATE TABLE sqlite_sequence (
    name TEXT,                                -- Nome tabella
    seq INTEGER                               -- Ultimo valore sequenza
)
```

**Note**:
- ⚠️ Tabella interna SQLite, **NON modificare manualmente**

---

## 16. `stats`

**Descrizione**: Statistiche email inviate (30 giorni).

```sql
CREATE TABLE stats (
    id INTEGER PRIMARY KEY DEFAULT 1,
    emails_sent_30days INTEGER DEFAULT 0,
    last_reset_date TEXT DEFAULT (date('now')),
    updated_at TEXT DEFAULT (datetime('now'))
)
```

**Note**:
- Singolo record (id=1) per conteggio email
- Reset automatico ogni 30 giorni

---

## 17. `system_config`

**Descrizione**: Configurazione sistema key-value.

```sql
CREATE TABLE system_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
)
```

---

## 18. `users`

**Descrizione**: Utenti sistema (admin, operatori).

```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('ADMIN', 'OPERATOR')),
    full_name TEXT,
    email TEXT,
    last_login TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
```

**Note**:
- `role` può essere solo 'ADMIN' o 'OPERATOR'
- `password_hash` contiene hash bcrypt

---

## 🔍 QUERY COMUNI CORRETTE

### ✅ Recuperare lead con contratto e payment

```sql
SELECT 
  l.*,
  c.codice_contratto,
  c.status as contract_status,
  p.status as payment_status,
  p.importo
FROM leads l
LEFT JOIN contracts c ON c.leadId = l.id
LEFT JOIN payments p ON p.leadId = l.id
WHERE l.email = ?
```

### ✅ Verificare payment completato

```sql
SELECT *
FROM payments
WHERE leadId = ?
  AND status = 'COMPLETED'
ORDER BY created_at DESC
LIMIT 1
```

### ✅ Recuperare proforma con contratto

```sql
SELECT 
  p.*,
  c.codice_contratto
FROM proforma p
LEFT JOIN contracts c ON c.leadId = p.leadId
WHERE p.numero_proforma = ?
LIMIT 1
```

---

## 📝 CHECKLIST PRE-QUERY

- [ ] Ho consultato `DB_SCHEMA_COMPLETE.md`?
- [ ] I nomi delle tabelle sono corretti?
- [ ] I nomi delle colonne sono ESATTI (snake_case vs camelCase)?
- [ ] Ho verificato le FOREIGN KEY per i JOIN?
- [ ] Ho aggiornato questo documento dopo modifiche schema?

---

## 🚨 ERRORI COMUNI DA EVITARE

| ❌ SBAGLIATO | ✅ CORRETTO | Nota |
|-------------|-------------|------|
| `contracts.prezzo_totale` (con IVA) | `contracts.prezzo_totale` (SENZA IVA) | €840 vs €1207.80 |
| `proforma.prezzo_totale` (senza IVA) | `proforma.prezzo_totale` (CON IVA) | €1207.80 |
| `lead_interactions.leadId` | `lead_interactions.lead_id` | snake_case |
| `dispositivi.imei` | `dispositivi.serial_number` | Campo corretto |
| `leads.servizio` = 'eCura PRO' | `leads.servizio` = 'PRO' | Senza prefisso |

---

## 💡 COME USARE QUESTO DOCUMENTO

1. ✅ **PRIMA di scrivere codice**: apri questo file
2. ✅ **Cerca la tabella** nell'indice
3. ✅ **Copia i nomi ESATTI** delle colonne
4. ✅ **Verifica i JOIN** con le foreign key
5. ✅ **AGGIORNA questo documento** dopo ogni modifica schema

**Regola d'oro**: Se non sei sicuro del nome → GUARDA QUI PRIMA!

---

**Ultimo aggiornamento**: 2026-03-06 18:00  
**Versione**: 2.0 (Schema completo con tutti i campi reali)
