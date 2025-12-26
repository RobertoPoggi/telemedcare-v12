-- TeleMedCare V11.0 - Clean Schema for Email Workflow
-- Migration 0001: Initial clean schema

-- Table: leads
CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  nomeRichiedente TEXT NOT NULL,
  cognomeRichiedente TEXT,
  emailRichiedente TEXT NOT NULL,
  telefonoRichiedente TEXT,
  nomeAssistito TEXT,
  cognomeAssistito TEXT,
  dataNascitaAssistito TEXT,
  luogoNascitaAssistito TEXT,
  etaAssistito TEXT,
  parentelaAssistito TEXT,
  pacchetto TEXT DEFAULT 'NESSUNO',
  condizioniSalute TEXT,
  priority TEXT,
  preferenzaContatto TEXT,
  vuoleContratto INTEGER DEFAULT 0,
  intestazioneContratto TEXT,
  cfRichiedente TEXT,
  indirizzoRichiedente TEXT,
  capRichiedente TEXT,
  cittaRichiedente TEXT,
  provinciaRichiedente TEXT,
  cfAssistito TEXT,
  indirizzoAssistito TEXT,
  capAssistito TEXT,
  cittaAssistito TEXT,
  provinciaAssistito TEXT,
  vuoleBrochure INTEGER DEFAULT 0,
  vuoleManuale INTEGER DEFAULT 0,
  note TEXT,
  gdprConsent INTEGER DEFAULT 0,
  timestamp TEXT DEFAULT (datetime('now')),
  fonte TEXT,
  versione TEXT,
  status TEXT DEFAULT 'nuovo',
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Table: document_templates (CLEAN VERSION)
CREATE TABLE IF NOT EXISTS document_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subject TEXT,
  html_content TEXT NOT NULL,
  variables TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Table: contracts
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  contract_code TEXT UNIQUE NOT NULL,
  tipo_servizio TEXT NOT NULL,
  prezzo_base REAL NOT NULL,
  prezzo_iva_inclusa REAL NOT NULL,
  status TEXT DEFAULT 'draft',
  pdf_url TEXT,
  docusign_envelope_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(emailRichiedente);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp);
CREATE INDEX IF NOT EXISTS idx_templates_name ON document_templates(name);
CREATE INDEX IF NOT EXISTS idx_templates_category ON document_templates(category);
CREATE INDEX IF NOT EXISTS idx_contracts_lead ON contracts(lead_id);
