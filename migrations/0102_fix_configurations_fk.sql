-- Migration: Fix configurations table FK da devices a dispositivi
-- Data: 2026-02-20
-- IMPORTANTE: Ricrea tabella configurations senza FK a devices (che non esiste)

-- Backup dati
CREATE TABLE IF NOT EXISTS configurations_backup AS SELECT * FROM configurations;

-- Drop tabella configurations vecchia (con FK a devices)
DROP TABLE IF EXISTS configurations;

-- Ricrea configurations senza FK a devices
CREATE TABLE configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    leadId TEXT NOT NULL,
    device_id INTEGER,  -- Rimosso NOT NULL e FK
    contract_id TEXT,
    
    -- Dati configurazione
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
    
    -- Preferenze
    modalita_utilizzo TEXT,
    orari_attivazione TEXT,
    
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
    
    -- Solo FK funzionanti (senza devices)
    FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

-- Ripristina dati dal backup
INSERT INTO configurations SELECT * FROM configurations_backup;

-- Cleanup backup
DROP TABLE configurations_backup;
