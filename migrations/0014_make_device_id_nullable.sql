-- Migration 0014: Make device_id and contract_id nullable in configurations table
-- Configuration happens before device association, so these should be optional initially

-- SQLite doesn't support ALTER COLUMN, so we need to:
-- 1. Create new table with nullable columns
-- 2. Copy data
-- 3. Drop old table
-- 4. Rename new table

-- Create new table with nullable device_id and contract_id
CREATE TABLE IF NOT EXISTS configurations_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    leadId TEXT NOT NULL,
    device_id INTEGER,  -- Now nullable
    contract_id TEXT,   -- Now nullable
    
    -- Dati configurazione (da form_configurazione)
    contatto_emergenza_1_nome TEXT,
    contatto_emergenza_1_telefono TEXT,
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
    modalita_utilizzo TEXT,
    orari_attivazione TEXT,
    
    -- NEW: JSON configuration data field
    configuration_data TEXT,
    
    -- Status
    status TEXT DEFAULT 'PENDING',
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

-- Copy existing data
INSERT INTO configurations_new 
SELECT * FROM configurations;

-- Drop old table
DROP TABLE configurations;

-- Rename new table
ALTER TABLE configurations_new RENAME TO configurations;
