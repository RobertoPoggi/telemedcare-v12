-- TeleMedCare V11.0 - Assistiti and Complete Workflow Schema
-- Migration 0003: Assistiti conversion and workflow tracking

-- Assistiti table (converted leads)
CREATE TABLE IF NOT EXISTS assistiti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER UNIQUE NOT NULL,
  codice_assistito TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  data_nascita TEXT NOT NULL,
  codice_fiscale TEXT NOT NULL,
  indirizzo TEXT NOT NULL,
  citta TEXT NOT NULL,
  cap TEXT NOT NULL,
  provincia TEXT NOT NULL,
  tipo_contratto TEXT NOT NULL DEFAULT 'BASE',
  stato TEXT NOT NULL DEFAULT 'ATTIVO',
  data_conversione DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_attivazione DATETIME,
  imei_dispositivo TEXT,
  numero_contratto TEXT UNIQUE,
  valore_contratto DECIMAL(10,2),
  note_mediche TEXT,
  contatto_emergenza TEXT,
  medico_curante TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Workflow tracking table
CREATE TABLE IF NOT EXISTS workflow_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assistito_id INTEGER NOT NULL,
  fase TEXT NOT NULL,
  stato TEXT NOT NULL DEFAULT 'IN_ATTESA',
  data_inizio DATETIME DEFAULT CURRENT_TIMESTAMP,
  data_completamento DATETIME,
  dettagli JSON,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assistito_id) REFERENCES assistiti(id)
);

-- Configuration forms table
CREATE TABLE IF NOT EXISTS form_configurazioni (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assistito_id INTEGER NOT NULL,
  tipo_form TEXT NOT NULL DEFAULT 'CONFIGURAZIONE_INIZIALE',
  dati_form JSON NOT NULL,
  stato TEXT NOT NULL DEFAULT 'COMPILATO',
  data_compilazione DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_compilazione TEXT,
  user_agent TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assistito_id) REFERENCES assistiti(id)
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL,
  modulo TEXT NOT NULL,
  messaggio TEXT NOT NULL,
  dettagli JSON,
  livello TEXT NOT NULL DEFAULT 'INFO',
  assistito_id INTEGER,
  lead_id INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assistito_id) REFERENCES assistiti(id),
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assistiti_codice ON assistiti(codice_assistito);
CREATE INDEX IF NOT EXISTS idx_assistiti_email ON assistiti(email);
CREATE INDEX IF NOT EXISTS idx_assistiti_lead ON assistiti(lead_id);
CREATE INDEX IF NOT EXISTS idx_workflow_assistito ON workflow_tracking(assistito_id);
CREATE INDEX IF NOT EXISTS idx_workflow_fase ON workflow_tracking(fase);
CREATE INDEX IF NOT EXISTS idx_form_assistito ON form_configurazioni(assistito_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_tipo ON system_logs(tipo);

-- Add workflow phases as reference data
INSERT OR IGNORE INTO workflow_tracking (assistito_id, fase, stato) 
SELECT 1, 'PROFORMA_INVIATA', 'COMPLETATO' WHERE 1=0;

INSERT OR IGNORE INTO workflow_tracking (assistito_id, fase, stato) 
SELECT 1, 'PAGAMENTO_RICEVUTO', 'IN_ATTESA' WHERE 1=0;

INSERT OR IGNORE INTO workflow_tracking (assistito_id, fase, stato) 
SELECT 1, 'EMAIL_BENVENUTO_INVIATA', 'IN_ATTESA' WHERE 1=0;

INSERT OR IGNORE INTO workflow_tracking (assistito_id, fase, stato) 
SELECT 1, 'FORM_CONFIGURAZIONE_INVIATO', 'IN_ATTESA' WHERE 1=0;

INSERT OR IGNORE INTO workflow_tracking (assistito_id, fase, stato) 
SELECT 1, 'CONFIGURAZIONE_RICEVUTA', 'IN_ATTESA' WHERE 1=0;

INSERT OR IGNORE INTO workflow_tracking (assistito_id, fase, stato) 
SELECT 1, 'CONFERMA_ATTIVAZIONE_INVIATA', 'IN_ATTESA' WHERE 1=0;

INSERT OR IGNORE INTO workflow_tracking (assistito_id, fase, stato) 
SELECT 1, 'SPEDIZIONE_COMPLETATA', 'IN_ATTESA' WHERE 1=0;