-- TeleMedCare Lead Management Schema V10.3.8
-- Tabella principale per i lead dalla landing page

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  
  -- Dati Richiedente
  nome_richiedente TEXT NOT NULL,
  cognome_richiedente TEXT NOT NULL,
  email_richiedente TEXT NOT NULL,
  telefono_richiedente TEXT,
  
  -- Dati Assistito  
  nome_assistito TEXT NOT NULL,
  cognome_assistito TEXT NOT NULL,
  data_nascita_assistito TEXT,
  eta_assistito TEXT,
  parentela_assistito TEXT,
  
  -- Servizio e Condizioni
  pacchetto TEXT,
  condizioni_salute TEXT,
  priority TEXT,
  preferenza_contatto TEXT,
  
  -- Richieste Aggiuntive
  vuole_contratto INTEGER DEFAULT 0,
  intestazione_contratto TEXT,
  cf_richiedente TEXT,
  indirizzo_richiedente TEXT,
  cf_assistito TEXT,
  indirizzo_assistito TEXT,
  vuole_brochure INTEGER DEFAULT 0,
  vuole_manuale INTEGER DEFAULT 0,
  
  -- Messaggi e Consenso
  note TEXT,
  gdpr_consent INTEGER DEFAULT 0,
  
  -- Metadata Sistema
  timestamp TEXT NOT NULL,
  fonte TEXT DEFAULT 'Landing Page V10.3.8-Cloudflare',
  versione TEXT DEFAULT 'V10.3.8-Cloudflare',
  status TEXT DEFAULT 'nuovo',
  
  -- Timestamp automatici
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabella per tracciare le email inviate
CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  tipo_email TEXT NOT NULL, -- benvenuto, notifica_info, follow_up
  destinatario TEXT NOT NULL,
  oggetto TEXT NOT NULL,
  status TEXT DEFAULT 'inviata', -- inviata, fallita, bounce
  error_message TEXT,
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Tabella per i documenti generati (contratti, proforma)
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER NOT NULL,
  tipo_documento TEXT NOT NULL, -- contratto, proforma
  file_path TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'generato', -- generato, inviato, firmato
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_leads_email_richiedente ON leads(email_richiedente);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp);
CREATE INDEX IF NOT EXISTS idx_leads_pacchetto ON leads(pacchetto);
CREATE INDEX IF NOT EXISTS idx_email_log_lead_id ON email_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_log_tipo ON email_log(tipo_email);
CREATE INDEX IF NOT EXISTS idx_documents_lead_id ON documents(lead_id);