-- =============================================
-- TELEMEDCARE V11.0 DISPOSITIVI SCHEMA SEMPLIFICATO
-- =============================================
-- Aggiunge solo tabelle essenziali senza foreign key
-- Data: 2025-10-05
-- =============================================

-- =====================================
-- TABELLA DISPOSITIVI MEDICALI
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
    assigned_by TEXT
);

-- =====================================
-- TABELLA SISTEMA CONFIG
-- =====================================

-- Configurazioni sistema
CREATE TABLE IF NOT EXISTS sistema_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chiave TEXT NOT NULL UNIQUE,
    valore TEXT NOT NULL,
    descrizione TEXT,
    categoria TEXT DEFAULT 'general',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- =====================================
-- DATI INIZIALI
-- =====================================

-- Configurazione sistema per D1
INSERT OR REPLACE INTO sistema_config (chiave, valore, descrizione, categoria) VALUES 
('d1_version', '11.0', 'Versione schema database D1', 'database'),
('dispositivi_enabled', 'true', 'Modulo dispositivi abilitato', 'features'),
('automation_enabled', 'true', 'Modulo automazione abilitato', 'features'),
('default_magazzino', 'Milano', 'Magazzino predefinito dispositivi', 'dispositivi'),
('automation_types', 'NOTIFICA_INFO,DOCUMENTI_INFORMATIVI,INVIO_CONTRATTO,INVIO_PROFORMA,EMAIL_BENVENUTO,EMAIL_CONFERMA,PROMEMORIA_3GIORNI,PROMEMORIA_5GIORNI', 'Tipi automazione supportati', 'automation');