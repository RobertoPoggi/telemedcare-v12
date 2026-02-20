-- Migration: Rinomina tabella devices in dispositivi
-- Data: 2026-02-20
-- Descrizione: Fix DELETE lead che falliva per FK constraint su devices (tabella non esiste, si chiama dispositivi)

-- Step 1: Rinomina tabella devices → dispositivi
ALTER TABLE devices RENAME TO dispositivi;

-- Step 2: Ricrea indici con nuovo nome
DROP INDEX IF EXISTS idx_devices_imei;
DROP INDEX IF EXISTS idx_devices_leadId;
DROP INDEX IF EXISTS idx_devices_status;

CREATE INDEX IF NOT EXISTS idx_dispositivi_imei ON dispositivi(imei);
CREATE INDEX IF NOT EXISTS idx_dispositivi_leadId ON dispositivi(leadId);
CREATE INDEX IF NOT EXISTS idx_dispositivi_status ON dispositivi(status);

-- Step 3: Ricrea trigger con nuovo nome
DROP TRIGGER IF EXISTS devices_updated_at;

CREATE TRIGGER IF NOT EXISTS dispositivi_updated_at 
    AFTER UPDATE ON dispositivi 
    FOR EACH ROW 
    WHEN OLD.updated_at = NEW.updated_at OR NEW.updated_at IS NULL
BEGIN
    UPDATE dispositivi SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Note: I FOREIGN KEY non possono essere modificati in SQLite.
-- La tabella configurations ha FK device_id → devices(id) che ora punta a dispositivi(id) automaticamente dopo il RENAME.
