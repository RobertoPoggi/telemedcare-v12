-- TeleMedCare V11.0 - Schema Database Iniziale
-- Creazione tabelle per lead management e automazione

-- ====================================
-- TABELLA LEADS (Lead principali)
-- ====================================
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    
    -- Dati Richiedente
    nomeRichiedente TEXT NOT NULL,
    cognomeRichiedente TEXT NOT NULL,
    emailRichiedente TEXT NOT NULL,
    telefonoRichiedente TEXT NOT NULL,
    
    -- Dati Assistito
    nomeAssistito TEXT NOT NULL,
    cognomeAssistito TEXT NOT NULL,
    dataNascitaAssistito DATE,
    luogoNascitaAssistito TEXT,
    etaAssistito TEXT,
    parentelaAssistito TEXT,
    
    -- Servizio e Preferenze
    pacchetto TEXT,
    condizioniSalute TEXT,
    priority TEXT,
    preferitoContatto TEXT,
    
    -- Richieste Aggiuntive
    vuoleContratto TEXT DEFAULT 'No',
    vuoleBrochure TEXT DEFAULT 'Si',
    vuoleManuale TEXT DEFAULT 'Si',
    intestazioneContratto TEXT,
    
    -- Dati Aggiuntivi
    cfRichiedente TEXT,
    indirizzoRichiedente TEXT,
    cfAssistito TEXT,
    indirizzoAssistito TEXT,
    note TEXT,
    
    -- Codici e Referenze
    codiceSIDLY TEXT,
    sourceUrl TEXT,
    sistemaVersione TEXT DEFAULT 'V11.0',
    
    -- Consensi
    gdprConsent TEXT DEFAULT 'on',
    consensoPrivacy TEXT DEFAULT 'on',
    
    -- Metadata e Tracking
    status TEXT DEFAULT 'NEW',
    leadScore INTEGER DEFAULT 0,
    conversion_probability REAL DEFAULT 0.0,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Campi sistema
    requestType TEXT DEFAULT 'POST',
    userAgent TEXT,
    ipAddress TEXT
);

-- ====================================
-- TABELLA AUTOMATION_TASKS (Task Email)
-- ====================================
CREATE TABLE IF NOT EXISTS automation_tasks (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    
    -- Configurazione Automazione
    automationType TEXT NOT NULL, -- NOTIFICA_INFO, DOCUMENTI_INFORMATIVI, INVIO_CONTRATTO, INVIO_PROFORMA, EMAIL_BENVENUTO, EMAIL_CONFERMA, PROMEMORIA_3GIORNI, PROMEMORIA_5GIORNI
    emailTemplate TEXT,
    
    -- Scheduling
    scheduledDate DATE NOT NULL,
    scheduledTime TIME NOT NULL,
    priority TEXT DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    
    -- Execution
    status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, PROCESSING, COMPLETED, FAILED, CANCELLED
    attemptNumber INTEGER DEFAULT 1,
    maxAttempts INTEGER DEFAULT 3,
    
    -- Risultati
    executedAt DATETIME,
    completedAt DATETIME,
    errorMessage TEXT,
    emailSent BOOLEAN DEFAULT FALSE,
    
    -- Dati Execution (JSON)
    executionData TEXT, -- JSON con dettagli personalizzazione
    
    -- Timestamps
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
);

-- ====================================
-- TABELLA CONTRACTS (Contratti Generati)
-- ====================================
CREATE TABLE IF NOT EXISTS contracts (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    
    -- Dettagli Contratto
    contractType TEXT NOT NULL, -- BASE, AVANZATO
    contractTemplate TEXT,
    contractData TEXT, -- JSON con dati personalizzati
    
    -- File e URLs
    pdfUrl TEXT,
    pdfGenerated BOOLEAN DEFAULT FALSE,
    fileSize INTEGER,
    
    -- Status
    status TEXT DEFAULT 'DRAFT', -- DRAFT, GENERATED, SENT, SIGNED, CANCELLED
    
    -- Timestamps
    generatedAt DATETIME,
    sentAt DATETIME,
    signedAt DATETIME,
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
);

-- ====================================
-- TABELLA EMAIL_LOGS (Log Invii Email)
-- ====================================
CREATE TABLE IF NOT EXISTS email_logs (
    id TEXT PRIMARY KEY,
    leadId TEXT NOT NULL,
    automationTaskId TEXT,
    
    -- Email Details
    emailType TEXT NOT NULL,
    recipientEmail TEXT NOT NULL,
    subject TEXT,
    
    -- Attachments
    attachments TEXT, -- JSON array degli allegati
    
    -- Delivery Status
    status TEXT DEFAULT 'PENDING', -- PENDING, SENT, DELIVERED, BOUNCED, FAILED
    sentAt DATETIME,
    deliveredAt DATETIME,
    openedAt DATETIME,
    clickedAt DATETIME,
    
    -- Provider Response
    messageId TEXT,
    providerResponse TEXT,
    errorDetails TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (automationTaskId) REFERENCES automation_tasks(id) ON DELETE SET NULL
);

-- ====================================
-- INDICI PER PERFORMANCE
-- ====================================

-- Indici per leads
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(emailRichiedente);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);

-- Indici per automation_tasks
CREATE INDEX IF NOT EXISTS idx_automation_leadId ON automation_tasks(leadId);
CREATE INDEX IF NOT EXISTS idx_automation_status ON automation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_automation_scheduled ON automation_tasks(scheduledDate, scheduledTime);
CREATE INDEX IF NOT EXISTS idx_automation_type ON automation_tasks(automationType);

-- Indici per contracts
CREATE INDEX IF NOT EXISTS idx_contracts_leadId ON contracts(leadId);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- Indici per email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_leadId ON email_logs(leadId);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(emailType);

-- ====================================
-- TRIGGER PER UPDATED_AT AUTOMATICO
-- ====================================

-- Trigger per leads
CREATE TRIGGER IF NOT EXISTS leads_updated_at 
    AFTER UPDATE ON leads 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per automation_tasks
CREATE TRIGGER IF NOT EXISTS automation_tasks_updated_at 
    AFTER UPDATE ON automation_tasks 
    FOR EACH ROW 
    WHEN NEW.updatedAt = OLD.updatedAt
BEGIN
    UPDATE automation_tasks SET updatedAt = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per contracts
CREATE TRIGGER IF NOT EXISTS contracts_updated_at 
    AFTER UPDATE ON contracts 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE contracts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per email_logs
CREATE TRIGGER IF NOT EXISTS email_logs_updated_at 
    AFTER UPDATE ON email_logs 
    FOR EACH ROW 
    WHEN NEW.updated_at = OLD.updated_at
BEGIN
    UPDATE email_logs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;