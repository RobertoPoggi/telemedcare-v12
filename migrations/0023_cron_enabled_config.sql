-- Migration: Aggiunta configurazione cron_enabled
-- Descrizione: Aggiunge interruttore ON/OFF per il cron reminder nella dashboard
-- Data: 2026-01-08

-- Aggiungi configurazione cron_enabled (default: true - abilitato)
INSERT OR IGNORE INTO system_config (key, value) 
VALUES ('cron_enabled', 'true');
