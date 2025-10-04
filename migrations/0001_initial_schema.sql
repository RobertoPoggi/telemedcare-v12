-- =============================================
-- TELEMEDCARE V10.3.8 MODULARE DATABASE SCHEMA
-- =============================================
-- Cloudflare D1 SQLite Database Schema Completo
-- Supporta tutti i moduli enterprise implementati
-- Data: 2024-10-03
-- =============================================

-- =====================================
-- TABELLE CONFIGURAZIONE SISTEMA
-- =====================================

-- Configurazione partner dinamica (LEAD_CONFIG.TS)
CREATE TABLE IF NOT EXISTS partner_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codice_partner TEXT NOT NULL UNIQUE,
    nome_partner TEXT NOT NULL,
    configurazione TEXT NOT NULL, -- JSON della configurazione completa
    attivo BOOLEAN DEFAULT 1,
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_modifica DATETIME DEFAULT CURRENT_TIMESTAMP,
    creato_by TEXT,
    modificato_by TEXT
);

-- Configurazione sistema generale
CREATE TABLE IF NOT EXISTS sistema_config (
    chiave TEXT PRIMARY KEY,
    valore TEXT NOT NULL,
    descrizione TEXT,
    tipo TEXT DEFAULT 'string', -- string, number, boolean, json
    categoria TEXT DEFAULT 'general',
    ultima_modifica DATETIME DEFAULT CURRENT_TIMESTAMP,
    modificato_by TEXT
);

-- =====================================
-- TABELLE LEAD E GESTIONE CLIENTI
-- =====================================

-- Lead principale (LEAD_CORE.TS)
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL UNIQUE, -- ID pubblico
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT NOT NULL,
    
    -- Dati demografici
    eta INTEGER,
    genere TEXT CHECK (genere IN ('M', 'F', 'N')),
    provincia TEXT,
    cap TEXT,
    citta TEXT,
    indirizzo TEXT,
    
    -- Dati medici
    patologie_principali TEXT, -- JSON array
    gravita_medica INTEGER DEFAULT 5,
    frequenza_visite INTEGER DEFAULT 2,
    
    -- Dati tecnici
    dispositivo_preferito TEXT DEFAULT 'Smartphone',
    competenza_tech INTEGER DEFAULT 5,
    
    -- Dati economici
    fascia_reddito TEXT DEFAULT 'MEDIA',
    capacita_spesa INTEGER DEFAULT 50,
    
    -- Engagement
    interazioni_totali INTEGER DEFAULT 1,
    tempo_sul_sito INTEGER DEFAULT 60,
    pagine_mostrate INTEGER DEFAULT 3,
    download_brochure BOOLEAN DEFAULT 0,
    
    -- Origine e partner
    canale_acquisizione TEXT NOT NULL,
    partner_id TEXT NOT NULL,
    fonte_dettaglio TEXT,
    
    -- Scoring e segmentazione
    score_qualita INTEGER DEFAULT 0,
    segmento TEXT DEFAULT 'COLD', -- HOT, WARM, COLD
    probabilita_conversione REAL DEFAULT 0.0,
    
    -- Stato e workflow
    stato TEXT DEFAULT 'nuovo', -- nuovo, contattato, interessato, convertito, perso
    priorita INTEGER DEFAULT 3,
    
    -- Compliance GDPR
    consenso_privacy BOOLEAN DEFAULT 0,
    consenso_marketing BOOLEAN DEFAULT 0,
    consenso_profilazione BOOLEAN DEFAULT 0,
    
    -- Audit
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_modifica DATETIME DEFAULT CURRENT_TIMESTAMP,
    creato_by TEXT,
    modificato_by TEXT,
    
    -- Hash per anti-duplicati
    hash_duplicati TEXT,
    
    FOREIGN KEY (partner_id) REFERENCES partner_config(codice_partner)
);

-- Cronologia modifiche lead per audit trail
CREATE TABLE IF NOT EXISTS leads_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL,
    campo_modificato TEXT NOT NULL,
    valore_precedente TEXT,
    valore_nuovo TEXT,
    motivo TEXT,
    data_modifica DATETIME DEFAULT CURRENT_TIMESTAMP,
    modificato_by TEXT,
    
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
);

-- Note e comunicazioni lead
CREATE TABLE IF NOT EXISTS leads_note (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL,
    tipo_nota TEXT DEFAULT 'generale', -- generale, chiamata, email, incontro
    contenuto TEXT NOT NULL,
    visibilita TEXT DEFAULT 'interna', -- interna, partner, cliente
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    creato_by TEXT,
    
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
);

-- =====================================
-- TABELLE ASSISTITI E CONVERSIONI
-- =====================================

-- Assistiti (lead convertiti) (LEAD_CONVERSION.TS)
CREATE TABLE IF NOT EXISTS assistiti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assistito_id TEXT NOT NULL UNIQUE,
    lead_id TEXT NOT NULL, -- Riferimento al lead originale
    
    -- Dati assistito
    nome TEXT NOT NULL,
    cognome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT NOT NULL,
    codice_fiscale TEXT,
    
    -- Indirizzo completo
    via TEXT,
    civico TEXT,
    cap TEXT NOT NULL,
    citta TEXT NOT NULL,
    provincia TEXT NOT NULL,
    
    -- Dati medici dettagliati
    patologie TEXT, -- JSON dettagliato
    allergie TEXT,
    farmaci TEXT,
    medico_curante TEXT,
    
    -- Contratto e servizio
    numero_contratto TEXT UNIQUE,
    data_contratto DATE,
    tipo_servizio TEXT DEFAULT 'SiDLY Care Pro',
    stato_servizio TEXT DEFAULT 'attivo', -- attivo, sospeso, terminato
    
    -- Dispositivo assegnato
    dispositivo_id TEXT,
    data_consegna DATE,
    data_attivazione DATE,
    
    -- Dati economici
    prezzo_concordato REAL,
    modalita_pagamento TEXT,
    scadenza_contratto DATE,
    
    -- Partner e commissioni
    partner_id TEXT NOT NULL,
    commissione_partner REAL,
    
    -- Audit
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_modifica DATETIME DEFAULT CURRENT_TIMESTAMP,
    creato_by TEXT,
    
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id),
    FOREIGN KEY (partner_id) REFERENCES partner_config(codice_partner)
);

-- Workflow conversioni step-by-step
CREATE TABLE IF NOT EXISTS conversioni_workflow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL,
    step_numero INTEGER NOT NULL,
    step_nome TEXT NOT NULL,
    stato TEXT DEFAULT 'pending', -- pending, in_progress, completed, failed, skipped
    
    -- Dati step
    data_inizio DATETIME,
    data_completamento DATETIME,
    durata_minuti INTEGER,
    risultato TEXT, -- SUCCESS, FAILURE, PARTIAL
    
    -- Dettagli
    dettagli TEXT, -- JSON con dati specifici del step
    note TEXT,
    operatore TEXT,
    
    -- Audit
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
);

-- =====================================
-- TABELLE DISPOSITIVI E INVENTARIO  
-- =====================================

-- Dispositivi SiDLY Care Pro (DISPOSITIVI.TS)
CREATE TABLE IF NOT EXISTS dispositivi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dispositivo_id TEXT NOT NULL UNIQUE,
    imei TEXT NOT NULL UNIQUE,
    serial_number TEXT NOT NULL UNIQUE,
    mac_address TEXT,
    
    -- Dati prodotto
    modello TEXT NOT NULL DEFAULT 'SiDLY Care Pro V10.3.8',
    codice_articolo TEXT NOT NULL,
    versione TEXT NOT NULL,
    revisione_hw TEXT,
    
    -- Certificazioni (JSON)
    certificazione_ce TEXT, -- JSON con dettagli CE
    certificazione_fcc TEXT,
    certificazione_iso TEXT,
    dispositivo_medico TEXT, -- JSON classe e certificazione
    
    -- Stato e localizzazione
    stato TEXT DEFAULT 'in_magazzino', -- nuovo, in_magazzino, spedito, consegnato, attivo, sostituito, rma, dismesso
    magazzino_sede TEXT,
    magazzino_settore TEXT,
    magazzino_posizione TEXT,
    qr_code TEXT,
    
    -- Date importanti
    data_produzione DATE,
    data_spedizione DATE,
    data_attivazione DATE,
    ultimo_utilizzo DATETIME,
    
    -- Firmware e configurazione
    firmware_versione TEXT,
    firmware_data_aggiornamento DATETIME,
    configurazione TEXT, -- JSON con config WiFi, BT, GPS, SIM
    
    -- Assegnazione cliente
    assegnato_lead_id TEXT,
    assegnato_assistito_id TEXT,
    partner_id TEXT,
    data_assegnazione DATETIME,
    
    -- Garanzia
    garanzia_inizio DATE,
    garanzia_scadenza DATE,
    garanzia_mesi INTEGER DEFAULT 24,
    
    -- RMA e manutenzione
    rma_numero TEXT,
    rma_motivo TEXT,
    rma_stato TEXT,
    rma_data_richiesta DATE,
    
    -- Audit
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_modifica DATETIME DEFAULT CURRENT_TIMESTAMP,
    creato_by TEXT,
    
    FOREIGN KEY (assegnato_lead_id) REFERENCES leads(lead_id),
    FOREIGN KEY (assegnato_assistito_id) REFERENCES assistiti(assistito_id),
    FOREIGN KEY (partner_id) REFERENCES partner_config(codice_partner)
);

-- Movimenti inventario
CREATE TABLE IF NOT EXISTS inventario_movimenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    movimento_id TEXT NOT NULL UNIQUE,
    dispositivo_id TEXT NOT NULL,
    
    -- Tipo movimento
    tipo TEXT NOT NULL, -- carico, scarico, trasferimento, reso, perdita, ritrovamento
    quantita INTEGER DEFAULT 1,
    
    -- Origine e destinazione
    origine_tipo TEXT, -- fornitore, magazzino, cliente, partner, riparazione
    origine_id TEXT,
    origine_descrizione TEXT,
    
    destinazione_tipo TEXT,
    destinazione_id TEXT,  
    destinazione_descrizione TEXT,
    
    -- Documento riferimento
    documento_tipo TEXT, -- ddt, fattura, bolla, contratto, rma
    documento_numero TEXT,
    documento_data DATE,
    
    -- Valore economico
    valore_unitario REAL,
    valore_totale REAL,
    valuta TEXT DEFAULT 'EUR',
    
    -- Approvazione
    approvato BOOLEAN DEFAULT 0,
    approvato_by TEXT,
    data_approvazione DATETIME,
    
    -- Audit
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    operatore TEXT,
    note TEXT,
    
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivi(dispositivo_id)
);

-- Manutenzioni dispositivi
CREATE TABLE IF NOT EXISTS dispositivi_manutenzione (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    manutenzione_id TEXT NOT NULL UNIQUE,
    dispositivo_id TEXT NOT NULL,
    
    tipo TEXT NOT NULL, -- preventiva, correttiva, firmware, calibrazione
    data_manutenzione DATE NOT NULL,
    tecnico TEXT,
    
    -- Dettagli intervento
    descrizione TEXT,
    parti_sostituite TEXT, -- JSON
    firmware_aggiornato TEXT,
    
    -- Costi
    costo_manodopera REAL,
    costo_parti REAL,
    costo_totale REAL,
    
    -- Risultato
    esito TEXT DEFAULT 'completato', -- completato, parziale, fallito
    note TEXT,
    
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivi(dispositivo_id)
);

-- =====================================
-- TABELLE DOCUMENTI E PDF
-- =====================================

-- Documenti generati (PDF.TS)
CREATE TABLE IF NOT EXISTS documenti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    documento_id TEXT NOT NULL UNIQUE,
    
    -- Tipo e metadati
    tipo TEXT NOT NULL, -- contratto, proforma, informativa, consenso, fattura
    titolo TEXT NOT NULL,
    versione TEXT DEFAULT '1.0',
    lingua TEXT DEFAULT 'it',
    
    -- Riferimenti
    lead_id TEXT,
    assistito_id TEXT,
    dispositivo_id TEXT,
    partner_id TEXT,
    
    -- Contenuto
    template_utilizzato TEXT,
    dati_documento TEXT, -- JSON con tutti i dati utilizzati
    
    -- File generato
    url_file TEXT NOT NULL,
    nome_file TEXT,
    dimensione_bytes INTEGER,
    formato TEXT DEFAULT 'PDF',
    
    -- Sicurezza
    password_protetto BOOLEAN DEFAULT 0,
    crittografato BOOLEAN DEFAULT 0,
    
    -- Stato documento
    stato TEXT DEFAULT 'generato', -- bozza, generato, inviato, firmato, archiviato
    data_invio DATETIME,
    data_firma DATETIME,
    
    -- Compliance
    gdpr_categoria TEXT, -- PERSONAL_DATA, SENSITIVE_DATA, ANONYMOUS
    retention_anni INTEGER DEFAULT 7,
    
    -- Audit
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    creato_by TEXT,
    
    FOREIGN KEY (lead_id) REFERENCES leads(lead_id),
    FOREIGN KEY (assistito_id) REFERENCES assistiti(assistito_id),
    FOREIGN KEY (dispositivo_id) REFERENCES dispositivi(dispositivo_id),
    FOREIGN KEY (partner_id) REFERENCES partner_config(codice_partner)
);

-- Job batch generazione PDF
CREATE TABLE IF NOT EXISTS pdf_batch_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    descrizione TEXT,
    
    -- Configurazione
    template_id TEXT NOT NULL,
    opzioni TEXT, -- JSON con PDFGenerationOptions
    
    -- Stato elaborazione  
    stato TEXT DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
    processati INTEGER DEFAULT 0,
    totali INTEGER NOT NULL,
    percentuale INTEGER DEFAULT 0,
    
    -- Timing
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_inizio DATETIME,
    data_fine DATETIME,
    tempo_stimato INTEGER, -- secondi rimanenti
    
    -- Risultati
    successi INTEGER DEFAULT 0,
    errori INTEGER DEFAULT 0,
    
    creato_by TEXT
);

-- =====================================
-- TABELLE LOGGING E AUDIT TRAIL
-- =====================================

-- Log eventi sistema (LOGGING.TS)
CREATE TABLE IF NOT EXISTS log_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL UNIQUE,
    
    -- Classificazione
    level TEXT NOT NULL, -- DEBUG, INFO, WARN, ERROR, CRITICAL
    category TEXT NOT NULL, -- AUDIT, SECURITY, PERFORMANCE, BUSINESS, SYSTEM, API  
    source TEXT NOT NULL,
    
    -- Contenuto
    message TEXT NOT NULL,
    details TEXT, -- JSON con dettagli aggiuntivi
    
    -- Contesto
    user_id TEXT,
    user_email TEXT,
    user_role TEXT,
    user_ip TEXT,
    
    -- Operazione
    operation_name TEXT,
    operation_resource TEXT,
    operation_action TEXT, -- CREATE, READ, UPDATE, DELETE
    operation_result TEXT, -- SUCCESS, FAILURE, PARTIAL
    operation_duration INTEGER, -- millisecondi
    
    -- Correlazione
    correlation_id TEXT,
    session_id TEXT,
    
    -- Ambiente
    environment TEXT DEFAULT 'production',
    version TEXT DEFAULT '10.3.8',
    
    -- Compliance
    gdpr_category TEXT, -- PERSONAL_DATA, SENSITIVE_DATA, ANONYMOUS, PSEUDONYMOUS
    retention_years INTEGER,
    encrypted BOOLEAN DEFAULT 0,
    
    -- Metadata
    tags TEXT, -- JSON array di tag
    priority INTEGER DEFAULT 5,
    
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Log eventi sicurezza (sottoclasse di log_events)
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    
    -- Tipo sicurezza
    security_type TEXT NOT NULL, -- LOGIN_ATTEMPT, UNAUTHORIZED_ACCESS, DATA_BREACH, etc.
    
    -- Threat assessment
    threat_level TEXT NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    threat_indicators TEXT, -- JSON array
    affected_resources TEXT, -- JSON array
    mitigation_actions TEXT, -- JSON array
    
    -- Autenticazione
    auth_method TEXT,
    auth_success BOOLEAN,
    auth_failure_reason TEXT,
    auth_attempts INTEGER,
    
    -- Network info
    source_ip TEXT,
    user_agent TEXT,
    geolocation TEXT,
    vpn_detected BOOLEAN,
    reputation TEXT, -- GOOD, SUSPICIOUS, MALICIOUS
    
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES log_events(event_id)
);

-- Log eventi audit (sottoclasse di log_events)  
CREATE TABLE IF NOT EXISTS audit_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    
    -- Tipo audit
    audit_type TEXT NOT NULL, -- DATA_ACCESS, CONFIGURATION_CHANGE, USER_ACTION, etc.
    
    -- Dati audit
    before_state TEXT, -- JSON stato precedente
    after_state TEXT,  -- JSON stato successivo
    changes TEXT,      -- JSON array delle modifiche
    
    -- Compliance
    compliance_framework TEXT, -- JSON array: GDPR, ISO27001, HIPAA
    legal_basis TEXT,
    data_subject_id TEXT,
    data_subject_type TEXT, -- CUSTOMER, EMPLOYEE, PARTNER, VISITOR
    
    -- Approvazione
    approval_required BOOLEAN DEFAULT 0,
    approval_status TEXT, -- PENDING, APPROVED, REJECTED
    approved_by TEXT,
    approval_date DATETIME,
    approval_comments TEXT,
    
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES log_events(event_id)
);

-- Log eventi performance
CREATE TABLE IF NOT EXISTS performance_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT NOT NULL,
    
    -- Metriche
    response_time INTEGER NOT NULL, -- millisecondi
    throughput REAL,                -- operazioni/secondo
    error_rate REAL,               -- percentuale errori
    cpu_usage REAL,               -- percentuale CPU
    memory_usage INTEGER,         -- MB memoria
    
    -- Soglie e alert
    response_threshold INTEGER,
    error_threshold REAL,
    thresholds_exceeded TEXT, -- JSON array soglie superate
    
    -- Contesto
    endpoint TEXT,
    query_count INTEGER,
    cache_hit_rate REAL,
    
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (event_id) REFERENCES log_events(event_id)
);

-- =====================================
-- TABELLE REPORTS E ANALYTICS
-- =====================================

-- Snapshot KPI per reports storici (LEAD_REPORTS.TS)
CREATE TABLE IF NOT EXISTS kpi_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_id TEXT NOT NULL UNIQUE,
    
    -- Periodo di riferimento
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    
    -- KPI core business
    leads_totali INTEGER,
    leads_oggi INTEGER,  
    conversion_rate REAL,
    revenue_totale REAL,
    revenue_proiettato REAL,
    
    -- Performance operativa
    tempo_risposta_media INTEGER,
    tasso_contatto REAL,
    tasso_chiusura REAL,
    score_medio REAL,
    
    -- Analisi partner
    partner_attivi INTEGER,
    lead_per_partner TEXT, -- JSON
    roi_per_partner TEXT,  -- JSON
    qualita_per_partner TEXT, -- JSON
    
    -- Trend
    crescita_settimanale REAL,
    crescita_mensile REAL,
    stagionalita TEXT, -- JSON
    
    -- Segmentazioni
    distribuzione_score TEXT, -- JSON
    distribuzione_demografica TEXT, -- JSON
    distribuzione_geografica TEXT, -- JSON
    
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP,
    creato_by TEXT
);

-- Dashboard widgets cache
CREATE TABLE IF NOT EXISTS dashboard_cache (
    widget_id TEXT PRIMARY KEY,
    dati TEXT NOT NULL, -- JSON con dati widget
    data_aggiornamento DATETIME DEFAULT CURRENT_TIMESTAMP,
    ttl_secondi INTEGER DEFAULT 300, -- 5 minuti default
    parametri TEXT -- JSON con parametri utilizzati
);

-- Alert inventario e sistema
CREATE TABLE IF NOT EXISTS system_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id TEXT NOT NULL UNIQUE,
    
    -- Tipo e severità
    tipo TEXT NOT NULL, -- scorta_minima, certificazione_scadenza, garanzia_scadenza, etc.
    severita TEXT NOT NULL, -- info, warning, critical
    
    -- Condizioni trigger
    condizione_campo TEXT,
    condizione_operatore TEXT,
    condizione_valore TEXT,
    condizione_soglia REAL,
    
    -- Contenuto alert
    titolo TEXT NOT NULL,
    messaggio TEXT NOT NULL,
    dispositivi_coinvolti TEXT, -- JSON array
    
    -- Azioni automatiche
    azioni_automatiche TEXT, -- JSON array
    
    -- Stato
    stato TEXT DEFAULT 'attivo', -- attivo, risolto, ignorato
    data_risoluzione DATETIME,
    risolto_by TEXT,
    note_risoluzione TEXT,
    
    data_creazione DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- INDICI PER PERFORMANCE  
-- =====================================

-- Indici per ricerche frequenti sui lead
CREATE INDEX IF NOT EXISTS idx_leads_partner_stato ON leads(partner_id, stato);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_telefono ON leads(telefono);  
CREATE INDEX IF NOT EXISTS idx_leads_hash_duplicati ON leads(hash_duplicati);
CREATE INDEX IF NOT EXISTS idx_leads_data_creazione ON leads(data_creazione);
CREATE INDEX IF NOT EXISTS idx_leads_score_segmento ON leads(score_qualita, segmento);

-- Indici per dispositivi  
CREATE INDEX IF NOT EXISTS idx_dispositivi_imei ON dispositivi(imei);
CREATE INDEX IF NOT EXISTS idx_dispositivi_stato ON dispositivi(stato);
CREATE INDEX IF NOT EXISTS idx_dispositivi_partner ON dispositivi(partner_id);
CREATE INDEX IF NOT EXISTS idx_dispositivi_assegnato_lead ON dispositivi(assegnato_lead_id);

-- Indici per logging e audit
CREATE INDEX IF NOT EXISTS idx_log_events_timestamp ON log_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_log_events_level_category ON log_events(level, category);
CREATE INDEX IF NOT EXISTS idx_log_events_user_id ON log_events(user_id);
CREATE INDEX IF NOT EXISTS idx_log_events_correlation ON log_events(correlation_id);
CREATE INDEX IF NOT EXISTS idx_log_events_operation ON log_events(operation_name, operation_result);

-- Indici per movimenti inventario
CREATE INDEX IF NOT EXISTS idx_inventario_dispositivo_timestamp ON inventario_movimenti(dispositivo_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_inventario_tipo_timestamp ON inventario_movimenti(tipo, timestamp);

-- =====================================
-- VISTE PER QUERY COMPLESSE
-- =====================================

-- Vista lead con dati partner e dispositivo
CREATE VIEW IF NOT EXISTS v_leads_completi AS
SELECT 
    l.*,
    pc.nome_partner,
    d.dispositivo_id,
    d.imei,
    d.stato as dispositivo_stato,
    a.assistito_id,
    a.numero_contratto
FROM leads l
LEFT JOIN partner_config pc ON l.partner_id = pc.codice_partner
LEFT JOIN dispositivi d ON l.lead_id = d.assegnato_lead_id
LEFT JOIN assistiti a ON l.lead_id = a.lead_id;

-- Vista dispositivi con assegnazioni
CREATE VIEW IF NOT EXISTS v_dispositivi_assegnazioni AS
SELECT 
    d.*,
    l.nome as lead_nome,
    l.cognome as lead_cognome,
    l.email as lead_email,
    a.nome as assistito_nome,
    a.cognome as assistito_cognome,
    pc.nome_partner
FROM dispositivi d
LEFT JOIN leads l ON d.assegnato_lead_id = l.lead_id
LEFT JOIN assistiti a ON d.assegnato_assistito_id = a.assistito_id  
LEFT JOIN partner_config pc ON d.partner_id = pc.codice_partner;

-- Vista summary KPI real-time
CREATE VIEW IF NOT EXISTS v_kpi_summary AS
SELECT 
    COUNT(*) as leads_totali,
    COUNT(CASE WHEN DATE(data_creazione) = DATE('now') THEN 1 END) as leads_oggi,
    COUNT(CASE WHEN stato = 'convertito' THEN 1 END) as conversioni,
    ROUND(AVG(score_qualita), 2) as score_medio,
    COUNT(CASE WHEN segmento = 'HOT' THEN 1 END) as hot_leads,
    COUNT(CASE WHEN segmento = 'WARM' THEN 1 END) as warm_leads,
    COUNT(CASE WHEN segmento = 'COLD' THEN 1 END) as cold_leads,
    COUNT(DISTINCT partner_id) as partner_attivi
FROM leads
WHERE data_creazione >= datetime('now', '-30 days');

-- =====================================
-- TRIGGER PER AUDIT AUTOMATICO
-- =====================================

-- Trigger per aggiornare ultima_modifica
CREATE TRIGGER IF NOT EXISTS trg_leads_updated 
    AFTER UPDATE ON leads
BEGIN
    UPDATE leads SET ultima_modifica = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_dispositivi_updated
    AFTER UPDATE ON dispositivi  
BEGIN
    UPDATE dispositivi SET ultima_modifica = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Trigger per audit trail lead changes
CREATE TRIGGER IF NOT EXISTS trg_leads_audit
    AFTER UPDATE ON leads
    WHEN OLD.stato != NEW.stato OR OLD.score_qualita != NEW.score_qualita
BEGIN
    INSERT INTO leads_history (lead_id, campo_modificato, valore_precedente, valore_nuovo, data_modifica, modificato_by)
    VALUES (NEW.lead_id, 'stato_e_score', 
            json_object('stato', OLD.stato, 'score', OLD.score_qualita),
            json_object('stato', NEW.stato, 'score', NEW.score_qualita),
            CURRENT_TIMESTAMP, NEW.modificato_by);
END;

-- =====================================
-- DATI INIZIALI DEFAULT
-- =====================================

-- Configurazione sistema di base
INSERT OR IGNORE INTO sistema_config (chiave, valore, descrizione, categoria) VALUES
('versione_sistema', '10.3.8', 'Versione TeleMedCare attuale', 'system'),
('max_lead_per_batch', '1000', 'Massimo numero lead per operazione batch', 'performance'), 
('retention_logs_giorni', '365', 'Giorni retention log operativi', 'compliance'),
('retention_audit_anni', '7', 'Anni retention audit trail', 'compliance'),
('scoring_algoritmo', 'fuzzy_ml_v2', 'Algoritmo scoring AI utilizzato', 'business'),
('alert_email_admin', 'admin@telemedcare.it', 'Email per alert critici', 'alerts'),
('gdpr_dpo_email', 'dpo@telemedcare.it', 'Email Data Protection Officer', 'compliance');

-- Partner di esempio per testing
INSERT OR IGNORE INTO partner_config (codice_partner, nome_partner, configurazione, attivo, creato_by) VALUES
('IRBEMA', 'IRBEMA S.r.l.', '{"api_endpoint": "https://api.irbema.it", "commissione_percentuale": 15, "max_lead_mensili": 500}', 1, 'system_init'),
('AON', 'AON Hewitt', '{"voucher_system": true, "commissione_fissa": 50, "max_lead_mensili": 200}', 1, 'system_init'),
('MONDADORI', 'Mondadori Media', '{"content_partnership": true, "commissione_percentuale": 12, "max_lead_mensili": 300}', 1, 'system_init'),
('ENDERED', 'Endered S.p.A.', '{"webhook_url": "https://webhook.endered.com", "commissione_percentuale": 18, "max_lead_mensili": 400}', 1, 'system_init'),
('CORPORATE', 'Vendita Diretta Corporate', '{"canale_interno": true, "commissione_percentuale": 0, "max_lead_mensili": 1000}', 1, 'system_init'),
('WEB_DIRECT', 'Acquisizione Web Diretta', '{"fonte_web": true, "costi_marketing": 25, "max_lead_mensili": 800}', 1, 'system_init');

-- Alert configurazioni di default
INSERT OR IGNORE INTO system_alerts (alert_id, tipo, severita, titolo, messaggio, stato, data_creazione) VALUES
('ALERT_001', 'scorta_minima', 'warning', 'Scorte dispositivi sotto soglia', 'Verificare riordino dispositivi SiDLY Care Pro', 'attivo', datetime('now')),
('ALERT_002', 'conversion_rate', 'critical', 'Conversion rate critico', 'Tasso conversione sotto 10% - intervento richiesto', 'attivo', datetime('now')),
('ALERT_003', 'response_time', 'warning', 'Tempi risposta elevati', 'SLA tempo risposta superato (>90min)', 'attivo', datetime('now'));

-- Log evento inizializzazione sistema  
INSERT INTO log_events (
    event_id, level, category, source, message, 
    operation_name, operation_result, environment, version, timestamp
) VALUES (
    'LOG_INIT_' || strftime('%s', 'now') || '_' || abs(random() % 1000000),
    'INFO', 'SYSTEM', 'database_migration', 
    'TeleMedCare V10.3.8 Database Schema inizializzato con successo',
    'database_initialization', 'SUCCESS', 'production', '10.3.8', 
    datetime('now')
);

-- =====================================
-- STATISTICHE E VACUUM
-- =====================================

-- Analizza tabelle per ottimizzare query planner
ANALYZE;

-- Vacuum per ottimizzare storage (opzionale in D1)
-- VACUUM;

-- =====================================  
-- FINE SCHEMA DATABASE
-- =====================================