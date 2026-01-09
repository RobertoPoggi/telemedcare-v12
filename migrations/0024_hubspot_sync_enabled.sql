-- Migration: Aggiunta configurazione hubspot_sync_enabled
-- Descrizione: Aggiunge interruttore ON/OFF per sincronizzazione automatica HubSpot
-- Data: 2026-01-09

-- Aggiungi configurazione hubspot_sync_enabled (default: false - disabilitato)
INSERT OR IGNORE INTO system_config (key, value) 
VALUES ('hubspot_sync_enabled', 'false');
