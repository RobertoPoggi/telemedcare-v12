-- Aggiungi switch per reminder completamento dati
INSERT OR IGNORE INTO settings (key, value, description, updated_at) VALUES 
  ('reminder_completion_enabled', 'false', 'Abilita reminder automatici completamento dati lead', datetime('now'));
