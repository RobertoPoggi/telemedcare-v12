-- TeleMedCare V11.0 - Schema Iniziale Semplificato
-- Creazione tabelle essenziali per il workflow

-- Tabella leads (principale)
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  nomeRichiedente TEXT NOT NULL,
  cognomeRichiedente TEXT,
  emailRichiedente TEXT NOT NULL,
  telefonoRichiedente TEXT,
  nomeAssistito TEXT,
  cognomeAssistito TEXT,
  dataNascitaAssistito TEXT,
  etaAssistito TEXT,
  parentelaAssistito TEXT,
  pacchetto TEXT,
  condizioniSalute TEXT,
  preferenzaContatto TEXT,
  vuoleContratto BOOLEAN DEFAULT 0,
  intestazioneContratto TEXT,
  cfRichiedente TEXT,
  indirizzoRichiedente TEXT,
  cfAssistito TEXT,
  indirizzoAssistito TEXT,
  vuoleBrochure BOOLEAN DEFAULT 0,
  vuoleManuale BOOLEAN DEFAULT 0,
  note TEXT,
  gdprConsent BOOLEAN DEFAULT 0,
  timestamp TEXT NOT NULL,
  fonte TEXT,
  versione TEXT,
  status TEXT DEFAULT 'nuovo'
);

-- Tabella email_logs
CREATE TABLE IF NOT EXISTS email_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT,
  recipient TEXT NOT NULL,
  template TEXT NOT NULL,
  subject TEXT,
  status TEXT NOT NULL,
  message_id TEXT,
  error_message TEXT,
  sent_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Tabella contratti
CREATE TABLE IF NOT EXISTS contratti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  tipo_contratto TEXT NOT NULL,
  file_path TEXT,
  status TEXT DEFAULT 'generato',
  firma_data TEXT,
  firma_ip TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Tabella proforma
CREATE TABLE IF NOT EXISTS proforma (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  importo REAL NOT NULL,
  file_path TEXT,
  status TEXT DEFAULT 'generato',
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Tabella pagamenti
CREATE TABLE IF NOT EXISTS pagamenti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  proforma_id INTEGER,
  importo REAL NOT NULL,
  metodo TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  paid_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (proforma_id) REFERENCES proforma(id)
);

-- Tabella dispositivi
CREATE TABLE IF NOT EXISTS dispositivi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  serial_number TEXT UNIQUE NOT NULL,
  modello TEXT NOT NULL,
  status TEXT DEFAULT 'inventory',
  lead_id TEXT,
  assigned_at TEXT,
  activated_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Tabella configurazioni
CREATE TABLE IF NOT EXISTS configurazioni (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  device_id INTEGER,
  configuration_data TEXT,
  status TEXT DEFAULT 'pending',
  completed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (device_id) REFERENCES dispositivi(id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(emailRichiedente);
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_contratti_lead_id ON contratti(lead_id);
CREATE INDEX IF NOT EXISTS idx_proforma_lead_id ON proforma(lead_id);
CREATE INDEX IF NOT EXISTS idx_pagamenti_lead_id ON pagamenti(lead_id);
CREATE INDEX IF NOT EXISTS idx_dispositivi_serial ON dispositivi(serial_number);
CREATE INDEX IF NOT EXISTS idx_configurazioni_lead_id ON configurazioni(lead_id);
