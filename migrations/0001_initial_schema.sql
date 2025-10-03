-- TeleMedCare V10.3.8-Cloudflare - Schema Database Iniziale
-- Tabella principale per i leads ricevuti dal form

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  nome_richiedente TEXT NOT NULL,
  cognome_richiedente TEXT NOT NULL,
  email_richiedente TEXT NOT NULL,
  telefono_richiedente TEXT,
  nome_assistito TEXT NOT NULL,
  cognome_assistito TEXT NOT NULL,
  data_nascita_assistito TEXT,
  eta_assistito TEXT,
  parentela_assistito TEXT,
  pacchetto TEXT,
  condizioni_salute TEXT,
  priority TEXT,
  preferenza_contatto TEXT,
  vuole_contratto INTEGER DEFAULT 0,
  intestazione_contratto TEXT,
  cf_richiedente TEXT,
  indirizzo_richiedente TEXT,
  cf_assistito TEXT,
  indirizzo_assistito TEXT,
  vuole_brochure INTEGER DEFAULT 0,
  vuole_manuale INTEGER DEFAULT 0,
  note TEXT,
  gdpr_consent INTEGER DEFAULT 0,
  timestamp TEXT NOT NULL,
  fonte TEXT,
  versione TEXT,
  status TEXT DEFAULT 'nuovo',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indici per ottimizzare le query
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email_richiedente);
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_pacchetto ON leads(pacchetto);

-- Tabella per tracking email inviate (opzionale, per future implementazioni)
CREATE TABLE IF NOT EXISTS email_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  email_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'pending',
  sent_at DATETIME,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);

CREATE INDEX IF NOT EXISTS idx_email_log_lead_id ON email_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_log_status ON email_log(status);