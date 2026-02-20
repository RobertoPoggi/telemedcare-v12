-- Migration: Drop vecchia tabella devices (ormai sostituita da dispositivi)
-- Data: 2026-02-20
-- IMPORTANTE: Questa migration va eseguita SOLO se la tabella dispositivi esiste e contiene tutti i dati

-- Drop tabella devices (vuota o obsoleta)
DROP TABLE IF EXISTS devices;

-- Drop indici obsoleti
DROP INDEX IF EXISTS idx_devices_imei;
DROP INDEX IF EXISTS idx_devices_leadId;
DROP INDEX IF EXISTS idx_devices_status;

-- Drop trigger obsoleto
DROP TRIGGER IF EXISTS devices_updated_at;

-- Note: La tabella dispositivi è la tabella attiva con tutti i dati.
-- devices è solo un residuo dello schema vecchio.
