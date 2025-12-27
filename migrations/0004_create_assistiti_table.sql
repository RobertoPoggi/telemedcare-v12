-- =============================================
-- Migration 0004: Tabella Assistiti con IMEI
-- =============================================
-- Crea tabella assistiti per tracciamento dispositivi
-- Data: 2025-12-27
-- =============================================

-- Tabella assistiti (persone con contratto firmato)
CREATE TABLE IF NOT EXISTS assistiti (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codice TEXT UNIQUE NOT NULL,
    nome TEXT NOT NULL,
    email TEXT,
    telefono TEXT,
    imei TEXT UNIQUE,
    status TEXT DEFAULT 'ATTIVO',
    lead_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
);

-- Aggiungi colonna imei_dispositivo alla tabella contracts se non esiste
-- (SQLite non supporta ALTER TABLE IF NOT EXISTS, quindi usiamo un approccio diverso)
