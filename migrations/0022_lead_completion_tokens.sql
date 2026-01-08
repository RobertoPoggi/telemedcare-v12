-- Migration 0022: Lead Completion Tokens System
-- Data: 2026-01-08
-- Scopo: Sistema di completamento dati lead incompleti con token sicuri

-- Tabella per gestire i token di completamento lead
CREATE TABLE IF NOT EXISTS lead_completion_tokens (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  completed_at TEXT DEFAULT NULL,
  reminder_sent_at TEXT DEFAULT NULL,
  reminder_count INTEGER DEFAULT 0,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_lead_completion_tokens_lead_id ON lead_completion_tokens(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_completion_tokens_token ON lead_completion_tokens(token);
CREATE INDEX IF NOT EXISTS idx_lead_completion_tokens_completed ON lead_completion_tokens(completed);
CREATE INDEX IF NOT EXISTS idx_lead_completion_tokens_expires_at ON lead_completion_tokens(expires_at);

-- Tabella per configurazione sistema auto-completion
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TEXT NOT NULL
);

-- Configurazione iniziale
INSERT OR IGNORE INTO system_config (key, value, description, updated_at)
VALUES 
  ('auto_completion_enabled', 'false', 'Abilita invio automatico email completamento dati per lead incompleti', datetime('now')),
  ('auto_completion_token_days', '30', 'Giorni validità token completamento (default: 30 giorni)', datetime('now')),
  ('auto_completion_reminder_days', '3', 'Giorni prima invio reminder automatico (default: 3 giorni)', datetime('now')),
  ('auto_completion_max_reminders', '2', 'Numero massimo reminder automatici (default: 2)', datetime('now'));

-- Log delle azioni di completamento
CREATE TABLE IF NOT EXISTS lead_completion_log (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  token_id TEXT NOT NULL,
  action TEXT NOT NULL, -- 'token_created', 'email_sent', 'reminder_sent', 'completed', 'expired'
  details TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
  FOREIGN KEY (token_id) REFERENCES lead_completion_tokens(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lead_completion_log_lead_id ON lead_completion_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_completion_log_action ON lead_completion_log(action);
CREATE INDEX IF NOT EXISTS idx_lead_completion_log_created_at ON lead_completion_log(created_at);
