-- =============================================
-- TELEMEDCARE V11.0 DISPOSITIVI E FOLLOW-UP SCHEMA
-- =============================================
-- Aggiunge tabelle per dispositivi e sistema follow-up
-- Data: 2025-10-04
-- =============================================

-- =====================================
-- TABELLE DISPOSITIVI MEDICALI
-- =====================================

-- Dispositivi registrati (DISPOSITIVI.TS)
CREATE TABLE IF NOT EXISTS dispositivi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL UNIQUE, -- ID pubblico del dispositivo
    imei TEXT NOT NULL UNIQUE, -- IMEI del dispositivo SiDLY
    serial_number TEXT UNIQUE,
    
    -- Modello e specifiche
    brand TEXT NOT NULL DEFAULT 'SiDLY',
    model TEXT NOT NULL DEFAULT 'SiDLY Care Pro',
    version TEXT,
    firmware_version TEXT,
    
    -- Status e localizzazione
    status TEXT NOT NULL DEFAULT 'INVENTORY', 
    -- INVENTORY, ASSIGNED, ACTIVE, INACTIVE, MAINTENANCE, REPLACED, DISPOSED
    magazzino TEXT NOT NULL DEFAULT 'Milano',
    posizione_magazzino TEXT,
    
    -- Dati etichetta
    label_data TEXT, -- JSON con dati OCR dell'etichetta
    udi_numbers TEXT, -- JSON con UDI numbers
    ce_marking TEXT,
    manufacturer_data TEXT, -- JSON con dati produttore
    
    -- Assignment e cliente
    assigned_to_lead TEXT, -- lead_id se assegnato
    assigned_to_customer TEXT, -- customer_id se attivo
    assignment_date DATETIME,
    activation_date DATETIME,
    
    -- Configurazione e monitoraggio
    configuration TEXT, -- JSON configurazione dispositivo
    last_heartbeat DATETIME,
    last_gps_location TEXT, -- JSON con lat,lng,timestamp
    battery_level INTEGER,
    signal_strength INTEGER,
    
    -- Manutenzione e garanzia
    warranty_expires DATETIME,
    last_maintenance DATETIME,
    next_maintenance DATETIME,
    maintenance_notes TEXT,
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT
);

-- Storico assignment dispositivi
CREATE TABLE IF NOT EXISTS dispositivi_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id TEXT NOT NULL,
    lead_id TEXT,
    customer_id TEXT,
    assignment_type TEXT NOT NULL, -- LEAD_ASSIGNMENT, CUSTOMER_ACTIVATION, UNASSIGNMENT
    assignment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    unassignment_date DATETIME,
    notes TEXT,
    assigned_by TEXT,
    
    FOREIGN KEY (device_id) REFERENCES dispositivi(device_id)
);

-- Richieste RMA (Return Merchandise Authorization)
CREATE TABLE IF NOT EXISTS dispositivi_rma (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rma_id TEXT NOT NULL UNIQUE,
    device_id TEXT NOT NULL,
    customer_id TEXT,
    
    -- Richiesta
    request_type TEXT NOT NULL, -- REPAIR, REPLACE, REFUND
    reason TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    
    -- Status e processo
    status TEXT NOT NULL DEFAULT 'PENDING',
    -- PENDING, APPROVED, IN_TRANSIT, RECEIVED, ANALYZING, REPAIRING, TESTING, COMPLETED, REJECTED
    
    -- Date importanti
    requested_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_date DATETIME,
    shipped_date DATETIME,
    received_date DATETIME,
    completed_date DATETIME,
    
    -- Logistica
    tracking_number TEXT,
    shipping_carrier TEXT,
    return_address TEXT, -- JSON
    
    -- Risoluzione
    resolution TEXT,
    replacement_device_id TEXT,
    refund_amount DECIMAL(10,2),
    
    -- Audit
    requested_by TEXT,
    handled_by TEXT,
    notes TEXT,
    
    FOREIGN KEY (device_id) REFERENCES dispositivi(device_id)
);

-- =====================================
-- TABELLE FOLLOW-UP SYSTEM
-- =====================================

-- Follow-up calls schedulati (FOLLOWUP-SERVICE.TS)
CREATE TABLE IF NOT EXISTS followup_calls (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    call_id TEXT NOT NULL UNIQUE, -- ID pubblico
    lead_id TEXT NOT NULL,
    
    -- Schedulazione
    assigned_operator TEXT NOT NULL,
    scheduled_date TEXT NOT NULL, -- YYYY-MM-DD
    scheduled_time TEXT NOT NULL, -- HH:MM
    
    -- Classificazione
    priority TEXT NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, URGENT
    call_type TEXT NOT NULL DEFAULT 'FOLLOW_UP',
    -- INFORMATION, CONSULTATION, CONTRACT_DISCUSSION, FOLLOW_UP, TECHNICAL_SUPPORT
    
    -- Status e tentativi
    status TEXT NOT NULL DEFAULT 'SCHEDULED',
    -- SCHEDULED, IN_PROGRESS, COMPLETED, MISSED, RESCHEDULED, CANCELLED
    attempt_number INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    
    -- Risultato chiamata
    outcome TEXT, -- CONVERTED, INTERESTED, NOT_INTERESTED, CALLBACK_REQUESTED, TECHNICAL_ISSUE, NO_ANSWER
    notes TEXT,
    next_action TEXT,
    
    -- Timing
    started_at DATETIME,
    completed_at DATETIME,
    duration_minutes INTEGER,
    
    -- Rescheduling
    reschedule_reason TEXT,
    rescheduled_from TEXT, -- call_id della chiamata originale
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
);

-- Operatori del call center
CREATE TABLE IF NOT EXISTS followup_operators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operator_id TEXT NOT NULL UNIQUE,
    
    -- Dati operatore
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    
    -- Orari e disponibilità
    working_hours_start TEXT DEFAULT '09:00', -- HH:MM
    working_hours_end TEXT DEFAULT '18:00',   -- HH:MM
    timezone TEXT DEFAULT 'Europe/Rome',
    
    -- Specializzazioni
    specializations TEXT, -- JSON array ["Contratti", "Emergenze", "Supporto Tecnico"]
    languages TEXT, -- JSON array ["IT", "EN"]
    
    -- Performance metrics
    total_calls INTEGER DEFAULT 0,
    successful_calls INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,4) DEFAULT 0,
    average_call_duration DECIMAL(8,2) DEFAULT 0,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE, ON_LEAVE
    max_daily_calls INTEGER DEFAULT 20,
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME
);

-- Disponibilità giornaliera operatori
CREATE TABLE IF NOT EXISTS followup_operator_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operator_id TEXT NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    
    -- Disponibilità
    available BOOLEAN DEFAULT 1,
    available_from TEXT, -- HH:MM override
    available_to TEXT,   -- HH:MM override
    
    -- Carico di lavoro
    scheduled_calls INTEGER DEFAULT 0,
    max_calls INTEGER, -- Override per questo giorno
    
    -- Note
    notes TEXT,
    updated_by TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (operator_id) REFERENCES followup_operators(operator_id),
    UNIQUE(operator_id, date)
);

-- Regole di schedulazione automatica
CREATE TABLE IF NOT EXISTS followup_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rule_id TEXT NOT NULL UNIQUE,
    
    -- Identificazione regola
    name TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 100, -- Priorità applicazione regola (più basso = più alta priorità)
    
    -- Condizioni (JSON)
    conditions TEXT NOT NULL, 
    -- {
    --   "urgencyLevel": ["Alta urgenza", "Urgente"],
    --   "contractRequested": true,
    --   "serviceInterest": ["TeleAssistenza Avanzata"],
    --   "leadSource": ["landing_page"]
    -- }
    
    -- Azioni (JSON)
    actions TEXT NOT NULL,
    -- {
    --   "scheduleWithinHours": 1,
    --   "priority": "URGENT",
    --   "assignToOperator": "op_003",
    --   "maxAttempts": 5,
    --   "rescheduleIntervalHours": 2
    -- }
    
    -- Status e statistiche
    active BOOLEAN DEFAULT 1,
    times_applied INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4) DEFAULT 0,
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT
);

-- =====================================
-- TABELLE CONTRATTI E DOCUMENTI
-- =====================================

-- Contratti generati (CONTRACT-SERVICE.TS)
CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id TEXT NOT NULL UNIQUE,
    lead_id TEXT NOT NULL,
    
    -- Tipo e template
    contract_type TEXT NOT NULL, -- BASE, AVANZATO, PROFORMA
    template_id TEXT NOT NULL,
    
    -- Dati cliente
    customer_data TEXT NOT NULL, -- JSON con tutti i dati cliente
    
    -- Contenuto e generazione
    compiled_content TEXT NOT NULL, -- Contratto pre-compilato
    variables TEXT, -- JSON con variabili sostituite
    
    -- Status e workflow
    status TEXT NOT NULL DEFAULT 'DRAFT',
    -- DRAFT, GENERATED, SENT, VIEWED, SIGNED, COMPLETED, CANCELLED
    
    -- File e documenti
    document_url TEXT,
    signed_document_url TEXT,
    folder_path TEXT, -- Percorso nella cartella organizzata
    
    -- Firma
    signature_method TEXT, -- MANUAL, ELECTRONIC, DOCUSIGN, ADOBE_SIGN
    signature_id TEXT,
    signed_at DATETIME,
    signed_by TEXT,
    
    -- Pricing
    first_year_amount DECIMAL(10,2),
    renewal_amount DECIMAL(10,2),
    
    -- Date importanti
    expires_at DATETIME,
    activated_at DATETIME,
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT,
    updated_by TEXT,
    
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
);

-- Storico stati contratti
CREATE TABLE IF NOT EXISTS contracts_status_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contract_id TEXT NOT NULL,
    
    -- Cambio status
    from_status TEXT,
    to_status TEXT NOT NULL,
    
    -- Dettagli
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by TEXT,
    notes TEXT,
    
    FOREIGN KEY (contract_id) REFERENCES contracts(contract_id)
);

-- =====================================
-- INDICI PER PERFORMANCE
-- =====================================

-- Indici dispositivi
CREATE INDEX IF NOT EXISTS idx_dispositivi_imei ON dispositivi(imei);
CREATE INDEX IF NOT EXISTS idx_dispositivi_status ON dispositivi(status);
CREATE INDEX IF NOT EXISTS idx_dispositivi_magazzino ON dispositivi(magazzino);
CREATE INDEX IF NOT EXISTS idx_dispositivi_assigned_lead ON dispositivi(assigned_to_lead);
CREATE INDEX IF NOT EXISTS idx_dispositivi_assigned_customer ON dispositivi(assigned_to_customer);

-- Indici follow-up
CREATE INDEX IF NOT EXISTS idx_followup_lead ON followup_calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_followup_operator ON followup_calls(assigned_operator);
CREATE INDEX IF NOT EXISTS idx_followup_date ON followup_calls(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_followup_status ON followup_calls(status);
CREATE INDEX IF NOT EXISTS idx_followup_priority ON followup_calls(priority);

-- Indici operatori
CREATE INDEX IF NOT EXISTS idx_operators_status ON followup_operators(status);
CREATE INDEX IF NOT EXISTS idx_availability_date ON followup_operator_availability(date);
CREATE INDEX IF NOT EXISTS idx_availability_operator ON followup_operator_availability(operator_id);

-- Indici contratti
CREATE INDEX IF NOT EXISTS idx_contracts_lead ON contracts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts(contract_type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_created ON contracts(created_at);

-- =====================================
-- DATI INIZIALI
-- =====================================

-- Inserimento operatori predefiniti
INSERT OR REPLACE INTO followup_operators (
    operator_id, name, email, phone, specializations, total_calls, 
    successful_calls, conversion_rate, average_call_duration, status
) VALUES 
('op_001', 'Sofia Martinelli', 'sofia.martinelli@medicagb.it', '+39 02 123 4567', 
 '["Contratti", "Servizi Avanzati", "Consulenza Medica"]', 150, 135, 0.68, 12.0, 'ACTIVE'),
('op_002', 'Marco Rossi', 'marco.rossi@medicagb.it', '+39 02 234 5678', 
 '["Informazioni Generali", "Supporto Tecnico"]', 120, 98, 0.45, 8.0, 'ACTIVE'),
('op_003', 'Elena Conti', 'elena.conti@medicagb.it', '+39 02 345 6789', 
 '["Contratti", "Emergenze", "Clienti Speciali"]', 200, 180, 0.75, 15.0, 'ACTIVE');

-- Inserimento regole di follow-up predefinite
INSERT OR REPLACE INTO followup_rules (
    rule_id, name, description, priority, conditions, actions, active
) VALUES 
('urgent_contract_rule', 'Richieste Contratto Urgenti', 
 'Chiamata immediata per richieste contratto con alta urgenza', 10,
 '{"urgencyLevel": ["Alta urgenza", "Urgente"], "contractRequested": true}',
 '{"scheduleWithinHours": 1, "priority": "URGENT", "maxAttempts": 5, "rescheduleIntervalHours": 2}', 1),

('medium_priority_rule', 'Richieste Media Priorità', 
 'Chiamata entro 4 ore per urgenza media', 20,
 '{"urgencyLevel": ["Media urgenza"]}',
 '{"scheduleWithinHours": 4, "priority": "MEDIUM", "maxAttempts": 3, "rescheduleIntervalHours": 24}', 1),

('low_priority_rule', 'Richieste Informative', 
 'Chiamata entro 24 ore per richieste informative', 30,
 '{"urgencyLevel": ["Bassa urgenza"], "contractRequested": false}',
 '{"scheduleWithinHours": 24, "priority": "LOW", "maxAttempts": 2, "rescheduleIntervalHours": 48}', 1),

('advanced_service_rule', 'Servizi Avanzati', 
 'Priorità alta per interessati ai servizi avanzati', 15,
 '{"serviceInterest": ["TeleAssistenza Avanzata"]}',
 '{"scheduleWithinHours": 2, "priority": "HIGH", "maxAttempts": 4, "rescheduleIntervalHours": 12}', 1);

-- Configurazione sistema per D1
INSERT OR REPLACE INTO sistema_config (chiave, valore, descrizione, categoria) VALUES 
('d1_version', '11.0', 'Versione schema database D1', 'database'),
('dispositivi_enabled', 'true', 'Modulo dispositivi abilitato', 'features'),
('followup_enabled', 'true', 'Modulo follow-up abilitato', 'features'),
('contracts_enabled', 'true', 'Modulo contratti abilitato', 'features'),
('auto_followup_scheduling', 'true', 'Schedulazione automatica follow-up', 'automation'),
('default_magazzino', 'Milano', 'Magazzino predefinito dispositivi', 'dispositivi');