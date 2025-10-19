-- =============================================
-- TELEMEDCARE V11.0 - PROFORMA E TEMPLATES SYSTEM
-- =============================================
-- Migration 0010: Proforma generation and templates management
-- Data: 2025-10-06 
-- =============================================

-- =====================================
-- TABELLA PROFORMA (Proforma generate)
-- =====================================
CREATE TABLE IF NOT EXISTS proforma (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    
    -- Dettagli Proforma
    numero_proforma TEXT UNIQUE NOT NULL,
    data_emissione DATE NOT NULL,
    data_scadenza DATE NOT NULL,
    valuta TEXT DEFAULT 'EUR',
    
    -- Cliente
    cliente_nome TEXT NOT NULL,
    cliente_cognome TEXT NOT NULL, 
    cliente_email TEXT NOT NULL,
    cliente_telefono TEXT,
    cliente_indirizzo TEXT,
    cliente_citta TEXT,
    cliente_cap TEXT,
    cliente_provincia TEXT,
    cliente_codice_fiscale TEXT,
    
    -- Assistito (se diverso dal cliente)
    assistito_nome TEXT,
    assistito_cognome TEXT,
    assistito_data_nascita DATE,
    assistito_codice_fiscale TEXT,
    assistito_parentela TEXT,
    
    -- Servizio
    pacchetto_tipo TEXT NOT NULL, -- BASE, AVANZATO, PREMIUM
    pacchetto_descrizione TEXT,
    prezzo_mensile DECIMAL(10,2) NOT NULL,
    numero_mesi INTEGER DEFAULT 12,
    prezzo_totale DECIMAL(10,2) NOT NULL,
    
    -- Dispositivo
    dispositivo_incluso BOOLEAN DEFAULT TRUE,
    dispositivo_tipo TEXT DEFAULT 'SiDLY Care Pro',
    dispositivo_imei TEXT,
    spedizione_inclusa BOOLEAN DEFAULT TRUE,
    costo_spedizione DECIMAL(10,2) DEFAULT 0.00,
    
    -- Personalizzazione
    note_aggiuntive TEXT,
    condizioni_speciali TEXT,
    sconto_applicato DECIMAL(10,2) DEFAULT 0.00,
    sconto_descrizione TEXT,
    
    -- File e generazione
    pdf_url TEXT,
    pdf_generated BOOLEAN DEFAULT FALSE,
    template_utilizzato TEXT,
    dati_personalizzazione TEXT, -- JSON con tutti i dati usati per personalizzazione
    
    -- Status e workflow
    status TEXT DEFAULT 'DRAFT', -- DRAFT, GENERATED, SENT, ACCEPTED, EXPIRED, CANCELLED
    inviata_il DATETIME,
    accettata_il DATETIME,
    scaduta_il DATETIME,
    
    -- Pagamento
    pagamento_ricevuto BOOLEAN DEFAULT FALSE,
    data_pagamento DATETIME,
    modalita_pagamento TEXT,
    importo_pagato DECIMAL(10,2),
    
    -- Conversion tracking
    convertita_in_contratto BOOLEAN DEFAULT FALSE,
    contratto_id TEXT,
    data_conversione DATETIME,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
);

-- =====================================
-- TABELLA DOCUMENT_TEMPLATES (Templates per documenti)
-- =====================================
CREATE TABLE IF NOT EXISTS document_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_template TEXT UNIQUE NOT NULL,
    tipo_documento TEXT NOT NULL, -- CONTRACT, PROFORMA, EMAIL, BROCHURE
    categoria TEXT, -- BASE, AVANZATO, PREMIUM per i pacchetti
    versione TEXT NOT NULL DEFAULT '1.0',
    
    -- Template content
    html_template TEXT NOT NULL,
    css_styles TEXT,
    variabili_disponibili TEXT, -- JSON array delle variabili utilizzabili
    
    -- Configurazione
    formato_output TEXT DEFAULT 'PDF', -- PDF, HTML, DOCX
    orientamento TEXT DEFAULT 'portrait', -- portrait, landscape
    formato_carta TEXT DEFAULT 'A4',
    margini TEXT DEFAULT '{"top": 20, "bottom": 20, "left": 20, "right": 20}', -- JSON
    
    -- Status e utilizzo
    attivo BOOLEAN DEFAULT TRUE,
    template_predefinito BOOLEAN DEFAULT FALSE,
    utilizzi_totali INTEGER DEFAULT 0,
    ultimo_utilizzo DATETIME,
    
    -- Metadata
    descrizione TEXT,
    autore TEXT,
    note_versione TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- TABELLA CONTRACT_DETAILS (Dettagli aggiuntivi contratti)
-- =====================================
CREATE TABLE IF NOT EXISTS contract_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id TEXT UNIQUE NOT NULL,
    
    -- Dati cliente completi (da proforma o lead)
    cliente_nome TEXT NOT NULL,
    cliente_cognome TEXT NOT NULL,
    cliente_email TEXT NOT NULL,
    cliente_telefono TEXT,
    cliente_indirizzo TEXT NOT NULL,
    cliente_citta TEXT NOT NULL,
    cliente_cap TEXT NOT NULL,
    cliente_provincia TEXT NOT NULL,
    cliente_codice_fiscale TEXT NOT NULL,
    
    -- Dati assistito
    assistito_nome TEXT NOT NULL,
    assistito_cognome TEXT NOT NULL,
    assistito_data_nascita DATE NOT NULL,
    assistito_codice_fiscale TEXT,
    assistito_parentela TEXT,
    assistito_condizioni_salute TEXT,
    
    -- Dettagli servizio
    tipo_contratto TEXT NOT NULL, -- BASE, AVANZATO, PREMIUM
    durata_mesi INTEGER NOT NULL DEFAULT 12,
    prezzo_mensile DECIMAL(10,2) NOT NULL,
    prezzo_totale DECIMAL(10,2) NOT NULL,
    data_inizio_servizio DATE,
    data_scadenza_contratto DATE,
    
    -- Dispositivo assegnato
    dispositivo_imei TEXT,
    dispositivo_modello TEXT DEFAULT 'SiDLY Care Pro',
    data_consegna_dispositivo DATE,
    indirizzo_spedizione TEXT,
    
    -- Configurazione servizio
    contatto_emergenza_1 TEXT,
    contatto_emergenza_2 TEXT,
    medico_curante TEXT,
    centro_medico_riferimento TEXT,
    note_mediche TEXT,
    
    -- Clausole aggiuntive
    clausole_personalizzate TEXT,
    condizioni_speciali TEXT,
    sconti_applicati TEXT,
    
    -- Firma e accettazione
    firmato_digitalmente BOOLEAN DEFAULT FALSE,
    data_firma DATETIME,
    ip_firma TEXT,
    user_agent_firma TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- =====================================
-- INDICI PER PERFORMANCE
-- =====================================

-- Indici proforma
CREATE INDEX IF NOT EXISTS idx_proforma_leadId ON proforma(leadId);
CREATE INDEX IF NOT EXISTS idx_proforma_numero ON proforma(numero_proforma);
CREATE INDEX IF NOT EXISTS idx_proforma_status ON proforma(status);
CREATE INDEX IF NOT EXISTS idx_proforma_data_emissione ON proforma(data_emissione);
CREATE INDEX IF NOT EXISTS idx_proforma_cliente_email ON proforma(cliente_email);

-- Indici document_templates
CREATE INDEX IF NOT EXISTS idx_templates_tipo ON document_templates(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_templates_categoria ON document_templates(categoria);
CREATE INDEX IF NOT EXISTS idx_templates_attivo ON document_templates(attivo);

-- Indici contract_details
CREATE INDEX IF NOT EXISTS idx_contract_details_contract_id ON contract_details(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_details_cliente_email ON contract_details(cliente_email);

-- =====================================
-- TRIGGER PER UPDATED_AT AUTOMATICO
-- =====================================

-- Trigger per proforma
CREATE TRIGGER IF NOT EXISTS proforma_updated_at 
    AFTER UPDATE ON proforma 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE proforma SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per document_templates
CREATE TRIGGER IF NOT EXISTS templates_updated_at 
    AFTER UPDATE ON document_templates 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE document_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per contract_details
CREATE TRIGGER IF NOT EXISTS contract_details_updated_at 
    AFTER UPDATE ON contract_details 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE contract_details SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- =====================================
-- DATI INIZIALI - TEMPLATES PREDEFINITI
-- =====================================

-- NOTA: I template reali vengono caricati dai file esistenti in /templates/
-- Qui creiamo solo i record di riferimento

-- I template reali verranno caricati dal sistema di template management
-- che legge i file esistenti dalla cartella /templates/