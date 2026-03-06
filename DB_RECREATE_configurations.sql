-- =====================================================
-- RICREAZIONE TABELLA: configurations
-- Data: 2026-03-06
-- =====================================================
-- ATTENZIONE: Questo script DROPPA e RICREA la tabella
-- Eseguire SOLO se la tabella è vuota!
-- =====================================================

-- STEP 1: Backup (se ci sono dati)
CREATE TABLE IF NOT EXISTS configurations_backup AS 
SELECT * FROM configurations;

-- STEP 2: Drop tabella esistente
DROP TABLE IF EXISTS configurations;

-- STEP 3: Ricrea con schema corretto
CREATE TABLE configurations (
    id TEXT PRIMARY KEY,                      -- CONF-timestamp-random
    leadId TEXT NOT NULL,                     -- FK leads(id)
    
    -- Dati assistito
    nome_assistito TEXT,
    cognome_assistito TEXT,
    data_nascita TEXT,
    eta TEXT,
    peso REAL,
    altezza REAL,
    telefono TEXT,
    email TEXT,
    indirizzo TEXT,
    
    -- Contatti emergenza
    contatto1_nome TEXT,
    contatto1_cognome TEXT,
    contatto1_telefono TEXT,
    contatto1_email TEXT,
    
    contatto2_nome TEXT,
    contatto2_cognome TEXT,
    contatto2_telefono TEXT,
    contatto2_email TEXT,
    
    contatto3_nome TEXT,
    contatto3_cognome TEXT,
    contatto3_telefono TEXT,
    contatto3_email TEXT,
    
    -- Whitelist chiamate autorizzate
    whitelist1_nome TEXT,
    whitelist1_cognome TEXT,
    whitelist1_telefono TEXT,
    whitelist1_email TEXT,
    
    whitelist2_nome TEXT,
    whitelist2_cognome TEXT,
    whitelist2_telefono TEXT,
    whitelist2_email TEXT,
    
    whitelist3_nome TEXT,
    whitelist3_cognome TEXT,
    whitelist3_telefono TEXT,
    whitelist3_email TEXT,
    
    -- Informazioni mediche
    patologie TEXT,                           -- CSV string
    note_mediche TEXT,
    farmaci_data TEXT,                        -- JSON string
    
    -- Status e tracking
    status TEXT DEFAULT 'PENDING',            -- PENDING, SUBMITTED, COMPLETED
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
);

-- STEP 4: Ripristina dati (se c'erano)
-- INSERT INTO configurations SELECT * FROM configurations_backup;

-- STEP 5: Drop backup
-- DROP TABLE IF EXISTS configurations_backup;

-- =====================================================
-- VERIFICA:
-- SELECT sql FROM sqlite_master WHERE type='table' AND name='configurations';
-- =====================================================
