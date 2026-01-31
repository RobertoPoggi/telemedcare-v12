-- Tabella per configurazioni globali
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Inserisci configurazioni di default
INSERT OR IGNORE INTO settings (key, value, description) VALUES 
  ('hubspot_auto_import_enabled', 'false', 'Abilita import automatico da HubSpot'),
  ('lead_email_notifications_enabled', 'false', 'Abilita invio email automatiche ai lead'),
  ('admin_email_notifications_enabled', 'true', 'Abilita notifiche email a info@telemedcare.it');

-- Indice per lookup veloce
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
