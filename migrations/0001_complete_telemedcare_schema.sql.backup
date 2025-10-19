-- =============================================
-- TELEMEDCARE V11.0 - SCHEMA COMPLETO OPERATIVO
-- =============================================
-- Migration 0001: Schema completo per flusso operativo completo
-- Flusso: Landing → Lead → Email → Contratto → Firma → Proforma → Pagamento → Configurazione → Attivazione
-- Data: 2025-10-17
-- =============================================

-- =====================================
-- TABELLA LEADS (Acquisizione da landing e moduli esterni)
-- =====================================
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    
    -- Dati anagrafici base (sempre presenti)
    nomeRichiedente TEXT NOT NULL,
    cognomeRichiedente TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    
    -- Dati assistito (se diverso dal richiedente)
    nomeAssistito TEXT,
    cognomeAssistito TEXT,
    etaAssistito INTEGER,
    
    -- Provenienza e tipologia richiesta
    fonte TEXT NOT NULL DEFAULT 'LANDING_PAGE', -- LANDING_PAGE, IRBEMA, LUXOTTICA, PIRELLI, FAS
    tipoServizio TEXT NOT NULL, -- BASE, AVANZATO
    vuoleBrochure TEXT DEFAULT 'No', -- Si, No
    vuoleManuale TEXT DEFAULT 'No', -- Si, No  
    vuoleContratto TEXT DEFAULT 'No', -- Si, No
    
    -- Consensi
    consensoPrivacy BOOLEAN DEFAULT FALSE,
    consensoMarketing BOOLEAN DEFAULT FALSE,
    consensoTerze BOOLEAN DEFAULT FALSE,
    
    -- Status e workflow
    status TEXT DEFAULT 'NEW', -- NEW, CONTACTED, DOCUMENTS_SENT, CONTRACT_SENT, CONTRACT_SIGNED, CONVERTED, LOST
    note TEXT,
    
    -- Dati di provenienza esterni (per IRBEMA, Luxottica, etc.)
    external_source_id TEXT,
    external_data TEXT, -- JSON con dati aggiuntivi da fonte esterna
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- TABELLA CONTRACTS (Contratti generati e inviati)
-- =====================================
CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    
    -- Dati contratto
    codice_contratto TEXT UNIQUE NOT NULL,
    tipo_contratto TEXT NOT NULL, -- BASE, AVANZATO
    template_utilizzato TEXT NOT NULL, -- Template_Contratto_Base_TeleMedCare, Template_Contratto_Avanzato_TeleMedCare
    
    -- Contenuto e personalizzazione
    contenuto_html TEXT NOT NULL, -- HTML del contratto personalizzato
    pdf_url TEXT, -- URL del PDF generato
    pdf_generated BOOLEAN DEFAULT FALSE,
    
    -- Dati economici
    prezzo_mensile DECIMAL(10,2) NOT NULL,
    durata_mesi INTEGER DEFAULT 12,
    prezzo_totale DECIMAL(10,2) NOT NULL,
    
    -- Status e workflow
    status TEXT DEFAULT 'DRAFT', -- DRAFT, SENT, SIGNED, EXPIRED, CANCELLED
    data_invio DATETIME,
    data_scadenza DATETIME, -- Scadenza per firma (es. 30 giorni dall'invio)
    
    -- Email tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_template_used TEXT, -- email_invio_contratto
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
);

-- =====================================
-- TABELLA SIGNATURES (Firme elettroniche)
-- =====================================
CREATE TABLE IF NOT EXISTS signatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id TEXT NOT NULL,
    
    -- Dati firma
    firma_digitale TEXT NOT NULL, -- Base64 della firma o hash di validazione
    tipo_firma TEXT NOT NULL, -- ELECTRONIC, DIGITAL, HANDWRITTEN
    
    -- Metadati firma
    ip_address TEXT,
    user_agent TEXT,
    timestamp_firma DATETIME NOT NULL,
    
    -- Validazione
    hash_documento TEXT, -- Hash del documento firmato per validità
    certificato_firma TEXT, -- Certificato di validità firma
    
    -- Status
    valida BOOLEAN DEFAULT TRUE,
    motivo_invalidazione TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- =====================================
-- TABELLA PROFORMA (Fatture proforma post-firma)
-- =====================================
CREATE TABLE IF NOT EXISTS proforma (
    id TEXT PRIMARY KEY,
    contract_id TEXT NOT NULL,
    leadId TEXT NOT NULL,
    
    -- Dati proforma
    numero_proforma TEXT UNIQUE NOT NULL,
    data_emissione DATE NOT NULL,
    data_scadenza DATE NOT NULL,
    
    -- Cliente (da contratto/lead)
    cliente_nome TEXT NOT NULL,
    cliente_cognome TEXT NOT NULL,
    cliente_email TEXT NOT NULL,
    cliente_telefono TEXT,
    cliente_indirizzo TEXT,
    cliente_citta TEXT,
    cliente_cap TEXT,
    cliente_provincia TEXT,
    cliente_codice_fiscale TEXT,
    
    -- Servizio (da contratto)
    tipo_servizio TEXT NOT NULL, -- BASE, AVANZATO
    prezzo_mensile DECIMAL(10,2) NOT NULL,
    durata_mesi INTEGER NOT NULL,
    prezzo_totale DECIMAL(10,2) NOT NULL,
    
    -- Generazione documento
    pdf_url TEXT,
    pdf_generated BOOLEAN DEFAULT FALSE,
    template_utilizzato TEXT DEFAULT 'template_proforma_unificato',
    
    -- Status e workflow
    status TEXT DEFAULT 'DRAFT', -- DRAFT, SENT, PAID, EXPIRED, CANCELLED
    data_invio DATETIME,
    
    -- Email tracking
    email_sent BOOLEAN DEFAULT FALSE,
    email_template_used TEXT DEFAULT 'email_invio_proforma',
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
);

-- =====================================
-- TABELLA PAYMENTS (Pagamenti ricevuti)
-- =====================================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    proforma_id TEXT NOT NULL,
    contract_id TEXT NOT NULL,
    leadId TEXT NOT NULL,
    
    -- Dati pagamento
    importo DECIMAL(10,2) NOT NULL,
    valuta TEXT DEFAULT 'EUR',
    metodo_pagamento TEXT NOT NULL, -- BONIFICO, STRIPE_CARD, STRIPE_SEPA, PAYPAL
    
    -- Dettagli transazione
    transaction_id TEXT, -- ID della transazione (Stripe, banca, etc.)
    riferimento_bonifico TEXT, -- Per bonifici
    iban_mittente TEXT, -- Per bonifici
    
    -- Status
    status TEXT DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED, REFUNDED
    data_pagamento DATETIME,
    data_conferma DATETIME, -- Quando abbiamo confermato il pagamento
    
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
);

-- =====================================
-- TABELLA DEVICES (Dispositivi TeleMedCare)
-- =====================================
CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Identificazione dispositivo
    imei TEXT UNIQUE NOT NULL,
    serial_number TEXT UNIQUE,
    modello TEXT NOT NULL DEFAULT 'SiDLY Care Pro',
    versione_firmware TEXT,
    
    -- Status e assegnazione
    status TEXT DEFAULT 'INVENTORY', -- INVENTORY, RESERVED, ASSIGNED, SHIPPED, DELIVERED, ACTIVE, MAINTENANCE, RETIRED
    leadId TEXT, -- A chi è assegnato (se assegnato)
    contract_id TEXT, -- Contratto di riferimento
    
    -- Dati spedizione
    data_assegnazione DATETIME,
    data_spedizione DATETIME,
    data_consegna DATETIME,
    tracking_number TEXT,
    corriere TEXT,
    indirizzo_spedizione TEXT,
    
    -- Configurazione e attivazione
    configurato BOOLEAN DEFAULT FALSE,
    attivato BOOLEAN DEFAULT FALSE,
    data_attivazione DATETIME,
    
    -- Note e manutenzione
    note TEXT,
    ultimo_controllo DATETIME,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE SET NULL,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL
);

-- =====================================
-- TABELLA CONFIGURATIONS (Configurazioni dispositivi)
-- =====================================
CREATE TABLE IF NOT EXISTS configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    leadId TEXT NOT NULL,
    device_id INTEGER NOT NULL,
    contract_id TEXT NOT NULL,
    
    -- Dati configurazione (da form_configurazione)
    contatto_emergenza_1_nome TEXT NOT NULL,
    contatto_emergenza_1_telefono TEXT NOT NULL,
    contatto_emergenza_1_relazione TEXT,
    
    contatto_emergenza_2_nome TEXT,
    contatto_emergenza_2_telefono TEXT,
    contatto_emergenza_2_relazione TEXT,
    
    -- Dati medici
    medico_curante_nome TEXT,
    medico_curante_telefono TEXT,
    centro_medico_riferimento TEXT,
    allergie TEXT,
    patologie_croniche TEXT,
    farmaci_assunti TEXT,
    
    -- Preferenze utilizzo
    modalita_utilizzo TEXT, -- STANDARD, INTENSIVA, NOTTURNA
    orari_attivazione TEXT, -- JSON con orari preferiti
    
    -- Status
    status TEXT DEFAULT 'PENDING', -- PENDING, COMPLETED, DEVICE_ASSOCIATED
    data_completamento DATETIME,
    
    -- Email tracking
    form_inviato BOOLEAN DEFAULT FALSE,
    email_benvenuto_inviata BOOLEAN DEFAULT FALSE,
    email_conferma_inviata BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- =====================================
-- TABELLA EMAIL_LOGS (Tracking email inviate)
-- =====================================
CREATE TABLE IF NOT EXISTS email_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Riferimenti
    leadId TEXT NOT NULL,
    contract_id TEXT,
    proforma_id TEXT,
    
    -- Dati email
    recipient_email TEXT NOT NULL,
    template_used TEXT NOT NULL, -- email_notifica_info, email_invio_contratto, etc.
    subject TEXT NOT NULL,
    
    -- Status invio
    status TEXT DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, FAILED, BOUNCED
    provider_used TEXT, -- RESEND, SENDGRID, GMAIL
    provider_message_id TEXT,
    error_message TEXT,
    
    -- Tracking
    sent_at DATETIME,
    delivered_at DATETIME,
    opened_at DATETIME,
    clicked_at DATETIME,
    
    -- Allegati
    attachments TEXT, -- JSON array degli allegati inviati
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE SET NULL,
    FOREIGN KEY (proforma_id) REFERENCES proforma(id) ON DELETE SET NULL
);

-- =====================================
-- INDICI PER PERFORMANCE
-- =====================================

-- Indici leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_fonte ON leads(fonte);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_external_source ON leads(external_source_id);

-- Indici contracts
CREATE INDEX IF NOT EXISTS idx_contracts_leadId ON contracts(leadId);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_codice ON contracts(codice_contratto);

-- Indici signatures
CREATE INDEX IF NOT EXISTS idx_signatures_contract_id ON signatures(contract_id);
CREATE INDEX IF NOT EXISTS idx_signatures_timestamp ON signatures(timestamp_firma);

-- Indici proforma
CREATE INDEX IF NOT EXISTS idx_proforma_contract_id ON proforma(contract_id);
CREATE INDEX IF NOT EXISTS idx_proforma_leadId ON proforma(leadId);
CREATE INDEX IF NOT EXISTS idx_proforma_numero ON proforma(numero_proforma);
CREATE INDEX IF NOT EXISTS idx_proforma_status ON proforma(status);

-- Indici payments
CREATE INDEX IF NOT EXISTS idx_payments_proforma_id ON payments(proforma_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Indici devices
CREATE INDEX IF NOT EXISTS idx_devices_imei ON devices(imei);
CREATE INDEX IF NOT EXISTS idx_devices_leadId ON devices(leadId);
CREATE INDEX IF NOT EXISTS idx_devices_status ON devices(status);

-- Indici configurations
CREATE INDEX IF NOT EXISTS idx_configurations_leadId ON configurations(leadId);
CREATE INDEX IF NOT EXISTS idx_configurations_device_id ON configurations(device_id);

-- Indici email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_leadId ON email_logs(leadId);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_used);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);

-- =====================================
-- TRIGGER PER UPDATED_AT AUTOMATICO
-- =====================================

-- Trigger per leads
CREATE TRIGGER IF NOT EXISTS leads_updated_at 
    AFTER UPDATE ON leads 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per contracts
CREATE TRIGGER IF NOT EXISTS contracts_updated_at 
    AFTER UPDATE ON contracts 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE contracts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per proforma
CREATE TRIGGER IF NOT EXISTS proforma_updated_at 
    AFTER UPDATE ON proforma 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE proforma SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per payments
CREATE TRIGGER IF NOT EXISTS payments_updated_at 
    AFTER UPDATE ON payments 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE payments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per devices
CREATE TRIGGER IF NOT EXISTS devices_updated_at 
    AFTER UPDATE ON devices 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE devices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per configurations
CREATE TRIGGER IF NOT EXISTS configurations_updated_at 
    AFTER UPDATE ON configurations 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE configurations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;