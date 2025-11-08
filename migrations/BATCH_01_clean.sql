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
CREATE TABLE IF NOT EXISTS proforma (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  importo REAL NOT NULL,
  file_path TEXT,
  status TEXT DEFAULT 'generato',
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);
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
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(emailRichiedente);
CREATE INDEX IF NOT EXISTS idx_leads_timestamp ON leads(timestamp);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_lead_id ON email_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_contratti_lead_id ON contratti(lead_id);
CREATE INDEX IF NOT EXISTS idx_proforma_lead_id ON proforma(lead_id);
CREATE INDEX IF NOT EXISTS idx_pagamenti_lead_id ON pagamenti(lead_id);
CREATE INDEX IF NOT EXISTS idx_dispositivi_serial ON dispositivi(serial_number);
CREATE INDEX IF NOT EXISTS idx_configurazioni_lead_id ON configurazioni(lead_id);
ALTER TABLE leads ADD COLUMN updated_at TEXT;
CREATE TABLE IF NOT EXISTS document_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'email', 'contract', 'document', 'proforma'
  subject TEXT,
  html_content TEXT NOT NULL,
  variables TEXT, -- JSON array di variabili disponibili
  category TEXT, -- 'workflow', 'notification', 'marketing', 'system'
  active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  file_path TEXT,
  content TEXT,
  status TEXT DEFAULT 'generated',
  signature_date TEXT,
  signature_ip TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);
INSERT INTO document_templates (id, name, type, subject, html_content, variables, category, active) VALUES
('email_notifica_info', 'Notifica Nuovo Lead', 'email', 
 '🚨 TeleMedCare - Nuovo Lead: {{NOME_CLIENTE}} {{COGNOME_CLIENTE}}',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background: white; padding: 15px; margin: 10px 0; border-left: 4px solid #3b82f6; }
    .label { font-weight: bold; color: #1e40af; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Nuovo Lead Ricevuto</h1>
      <p>TeleMedCare V11.0</p>
    </div>
    <div class="content">
      <h2>Dettagli Lead</h2>
      
      <div class="info-box">
        <p><span class="label">Nome:</span> {{NOME_CLIENTE}} {{COGNOME_CLIENTE}}</p>
        <p><span class="label">Email:</span> {{EMAIL_CLIENTE}}</p>
        <p><span class="label">Telefono:</span> {{TELEFONO_CLIENTE}}</p>
      </div>
      
      <div class="info-box">
        <p><span class="label">Servizio Richiesto:</span> {{SERVIZIO_RICHIESTO}}</p>
        <p><span class="label">Lead ID:</span> {{LEAD_ID}}</p>
        <p><span class="label">Timestamp:</span> {{TIMESTAMP_LEAD}}</p>
      </div>
      
      <div class="info-box">
        <p><span class="label">Note:</span> {{NOTE}}</p>
      </div>
      
      <p style="margin-top: 20px;">
        <strong>Azione richiesta:</strong> Contattare il lead entro 24 ore.
      </p>
    </div>
    <div class="footer">
      <p>TeleMedCare V11.0 - Sistema Automatico di Notifica</p>
      <p>Questo è un messaggio automatico, non rispondere a questa email</p>
    </div>
  </div>
</body>
</html>',
 '["NOME_CLIENTE", "COGNOME_CLIENTE", "EMAIL_CLIENTE", "TELEFONO_CLIENTE", "SERVIZIO_RICHIESTO", "LEAD_ID", "TIMESTAMP_LEAD", "NOTE"]',
 'notification', 1),
('email_invio_contratto', 'Invio Contratto', 'email',
 '📋 TeleMedCare - Il tuo contratto è pronto!',
 '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Il tuo contratto è pronto!</h1>
      <p>TeleMedCare V11.0</p>
    </div>
    <div class="content">
      <p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>
      
      <p>Il contratto per il servizio <strong>{{PIANO_SERVIZIO}}</strong> è stato generato e allegato a questa email.</p>
      
      <p><strong>Dettagli del servizio:</strong></p>
      <ul>
        <li>Piano: {{PIANO_SERVIZIO}}</li>
        <li>Prezzo: €{{PREZZO_PIANO}}</li>
        <li>Codice Cliente: {{CODICE_CLIENTE}}</li>
      </ul>
      
      <p>Per procedere:</p>
      <ol>
        <li>Scarica e leggi il contratto allegato</li>
        <li>Firmalo digitalmente o stampalo e firmalo</li>
        <li>Inviaci il contratto firmato</li>
      </ol>
      
      <p style="margin-top: 30px;">Per qualsiasi domanda, non esitare a contattarci.</p>
      
      <p>Cordiali saluti,<br>
      <strong>Il Team TeleMedCare</strong></p>
    </div>
    <div class="footer">
      <p>TeleMedCare V11.0 - Sistema di Telemedicina</p>
      <p>📧 info@telemedcare.it | 📞 +39 080 123 4567</p>
    </div>
  </div>
</body>
</html>',
 '["NOME_CLIENTE", "PIANO_SERVIZIO", "PREZZO_PIANO", "CODICE_CLIENTE"]',
 'workflow', 1);
CREATE INDEX IF NOT EXISTS idx_document_templates_type ON document_templates(type);
CREATE INDEX IF NOT EXISTS idx_document_templates_category ON document_templates(category);
CREATE INDEX IF NOT EXISTS idx_document_templates_active ON document_templates(active);
CREATE INDEX IF NOT EXISTS idx_contracts_lead_id ON contracts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
ALTER TABLE contracts ADD COLUMN codice_contratto TEXT;
ALTER TABLE contracts ADD COLUMN piano_servizio TEXT;
ALTER TABLE contracts ADD COLUMN prezzo REAL;
ALTER TABLE contracts ADD COLUMN intestatario TEXT;
ALTER TABLE contracts ADD COLUMN cf_intestatario TEXT;
ALTER TABLE contracts ADD COLUMN indirizzo_intestatario TEXT;
ALTER TABLE document_templates ADD COLUMN usage_count INTEGER DEFAULT 0;
ALTER TABLE document_templates ADD COLUMN last_used TEXT;
CREATE INDEX IF NOT EXISTS idx_contracts_codice ON contracts(codice_contratto);
CREATE INDEX IF NOT EXISTS idx_templates_usage ON document_templates(usage_count);
