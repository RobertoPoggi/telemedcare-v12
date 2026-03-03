-- ============================================================================
-- SCRIPT DI INIZIALIZZAZIONE DATABASE TEST
-- Database: telemedcare-leads-test
-- Uso: Da eseguire su Cloudflare Dashboard → D1 → telemedcare-leads-test → Console
-- ============================================================================

-- IMPORTANTE: Questo script crea lo schema completo per l'ambiente di test
-- NON include dati di produzione per mantenere l'isolamento

-- ============================================================================
-- TABELLA LEADS
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    
    -- Dati Richiedente (chi compila il form)
    nomeRichiedente TEXT,
    cognomeRichiedente TEXT,
    email TEXT,
    telefono TEXT,
    
    -- Dati Assistito (chi riceve il servizio)
    nomeAssistito TEXT,
    cognomeAssistito TEXT,
    cfAssistito TEXT,
    indirizzoAssistito TEXT,
    cittaAssistito TEXT,
    capAssistito TEXT,
    provinciaAssistito TEXT,
    luogoNascitaAssistito TEXT,
    dataNascitaAssistito TEXT,
    
    -- Dati Intestatario (chi firma/paga) - SOLO campi non derivati
    intestatarioContratto TEXT DEFAULT 'richiedente',
    intestazioneContratto TEXT,
    cfIntestatario TEXT,
    indirizzoIntestatario TEXT,
    cittaIntestatario TEXT,
    capIntestatario TEXT,
    provinciaIntestatario TEXT,
    luogoNascitaIntestatario TEXT,
    dataNascitaIntestatario TEXT,
    
    -- Dati Servizio
    tipoServizio TEXT,
    pacchetto TEXT,
    prezzo_anno REAL,
    prezzo_rinnovo REAL,
    
    -- Condizioni Salute
    condizioniSalute TEXT,
    
    -- Preferenze
    vuoleBrochure TEXT,
    vuoleManualeUtente TEXT,
    vuoleContratto TEXT,
    
    -- Consensi Privacy
    consensoPrivacy TEXT,
    consensoMarketing TEXT,
    consensoNewsletter TEXT,
    
    -- Contact Manager
    cm_assegnato_a TEXT,
    cm_priorita TEXT DEFAULT 'media',
    cm_note TEXT,
    cm_ultimo_contatto DATETIME,
    cm_prossimo_followup DATETIME,
    cm_stato_chiamata TEXT,
    cm_esito_chiamata TEXT,
    
    -- Stato Lead
    status TEXT DEFAULT 'NEW',
    
    -- HubSpot Integration
    hubspot_vid TEXT,
    hubspot_contact_id TEXT,
    hubspot_sync_status TEXT,
    hubspot_last_sync DATETIME,
    
    -- Timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Altri campi
    source TEXT,
    campaign TEXT,
    medium TEXT,
    referrer TEXT,
    landing_page TEXT,
    user_agent TEXT,
    ip_address TEXT
);

-- ============================================================================
-- TABELLA CONTRACTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    codice_contratto TEXT UNIQUE,
    tipo_contratto TEXT DEFAULT 'BASE',
    template_utilizzato TEXT,
    contenuto_html TEXT,
    pdf_url TEXT,
    
    -- Dati Cliente (snapshot al momento della firma)
    cliente_nome TEXT,
    cliente_cognome TEXT,
    cliente_email TEXT,
    cliente_telefono TEXT,
    cliente_indirizzo TEXT,
    cliente_citta TEXT,
    cliente_cap TEXT,
    cliente_provincia TEXT,
    cliente_cf TEXT,
    
    -- Prezzi
    prezzo_mensile REAL,
    durata_mesi INTEGER DEFAULT 12,
    prezzo_totale REAL,
    
    -- Firma
    status TEXT DEFAULT 'DRAFT',
    firmato_il DATETIME,
    firma_digitale TEXT,
    firma_ip TEXT,
    firma_user_agent TEXT,
    firma_device_info TEXT,
    signed_at DATETIME,
    signature_method TEXT,
    
    -- Date
    data_scadenza DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id)
);

-- ============================================================================
-- TABELLA PROFORMA
-- ============================================================================
CREATE TABLE IF NOT EXISTS proforma (
    id TEXT PRIMARY KEY,
    leadId TEXT,
    contractId TEXT,
    numero_proforma TEXT UNIQUE,
    pdf_url TEXT,
    
    -- Dati Cliente (snapshot)
    cliente_nome TEXT,
    cliente_cognome TEXT,
    cliente_email TEXT,
    cliente_telefono TEXT,
    cliente_indirizzo TEXT,
    cliente_citta TEXT,
    cliente_cap TEXT,
    cliente_provincia TEXT,
    cliente_cf TEXT,
    
    -- Servizio
    tipo_servizio TEXT,
    
    -- Prezzi (IVA ESCLUSA nel DB, calcolata in runtime)
    prezzo_mensile REAL,
    durata_mesi INTEGER DEFAULT 12,
    prezzo_totale REAL,
    
    -- Date
    data_emissione DATETIME,
    data_scadenza DATETIME,
    
    -- Stato
    status TEXT DEFAULT 'DRAFT',
    
    -- Timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id),
    FOREIGN KEY (contractId) REFERENCES contracts(id)
);

-- ============================================================================
-- TABELLA PAYMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    proformaId TEXT NOT NULL,
    leadId TEXT,
    
    -- Dati Stripe
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,
    
    -- Importi
    importo REAL NOT NULL,
    importo_netto REAL,
    importo_iva REAL,
    valuta TEXT DEFAULT 'EUR',
    
    -- Metodo Pagamento
    metodo_pagamento TEXT,
    ultimi_4_cifre_carta TEXT,
    brand_carta TEXT,
    
    -- Stato
    status TEXT DEFAULT 'pending',
    
    -- Date
    data_pagamento DATETIME,
    
    -- Timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (proformaId) REFERENCES proforma(id),
    FOREIGN KEY (leadId) REFERENCES leads(id)
);

-- ============================================================================
-- TABELLA DEVICES
-- ============================================================================
CREATE TABLE IF NOT EXISTS devices (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    
    -- Informazioni Dispositivo
    serial_number TEXT UNIQUE,
    tipo_dispositivo TEXT,
    modello TEXT,
    
    -- Stato
    status TEXT DEFAULT 'in_magazzino',
    
    -- Assegnazione
    data_assegnazione DATETIME,
    data_attivazione DATETIME,
    data_disattivazione DATETIME,
    
    -- Note
    note TEXT,
    
    -- Timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id)
);

-- ============================================================================
-- INDICI PER PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_hubspot_contact_id ON leads(hubspot_contact_id);

CREATE INDEX IF NOT EXISTS idx_contracts_leadId ON contracts(leadId);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_codice_contratto ON contracts(codice_contratto);

CREATE INDEX IF NOT EXISTS idx_proforma_leadId ON proforma(leadId);
CREATE INDEX IF NOT EXISTS idx_proforma_contractId ON proforma(contractId);
CREATE INDEX IF NOT EXISTS idx_proforma_numero_proforma ON proforma(numero_proforma);
CREATE INDEX IF NOT EXISTS idx_proforma_status ON proforma(status);

CREATE INDEX IF NOT EXISTS idx_payments_proformaId ON payments(proformaId);
CREATE INDEX IF NOT EXISTS idx_payments_leadId ON payments(leadId);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

CREATE INDEX IF NOT EXISTS idx_devices_leadId ON devices(leadId);
CREATE INDEX IF NOT EXISTS idx_devices_serial_number ON devices(serial_number);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);

-- ============================================================================
-- INSERIMENTO LEAD DI TEST
-- ============================================================================
INSERT INTO leads (
    id,
    nomeRichiedente, cognomeRichiedente, email, telefono,
    nomeAssistito, cognomeAssistito, cfAssistito,
    indirizzoAssistito, cittaAssistito, capAssistito, provinciaAssistito,
    luogoNascitaAssistito, dataNascitaAssistito,
    intestatarioContratto,
    cfIntestatario, indirizzoIntestatario, cittaIntestatario, capIntestatario, provinciaIntestatario,
    tipoServizio, pacchetto, prezzo_anno, prezzo_rinnovo,
    status, created_at
) VALUES (
    'LEAD-TEST-00001',
    'Mario', 'Rossi', 'mario.rossi@test.com', '3331234567',
    'Anna', 'Bianchi', 'BNCNNA50M01H501X',
    'Via Roma 123', 'Milano', '20100', 'MI',
    'Milano', '1950-01-01',
    'richiedente',
    'RSSMRA80A01H501Z', 'Via Verdi 456', 'Milano', '20121', 'MI',
    'eCura PRO', 'BASE', 480.00, 480.00,
    'NEW', datetime('now')
);

-- ============================================================================
-- CONFERMA CREAZIONE
-- ============================================================================
SELECT 'Database test inizializzato con successo!' AS message;
SELECT COUNT(*) AS total_leads FROM leads;
