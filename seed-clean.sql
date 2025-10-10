-- SEED DATI PULITI E CONSISTENTI PER TELEMEDCARE V11.0
-- Inserisce dati di esempio realistici ma consistenti per testing

-- ========== DISPOSITIVI SAMPLE ==========
INSERT OR IGNORE INTO dispositivi (
  device_id, imei, model, magazzino, status, ce_marking, 
  created_at, updated_at
) VALUES 
  ('SiDLY_DEVICE_001', '354807041234567', 'SiDLY Care Pro V11.0', 'Milano', 'INVENTORY', 'CE-2024-001', datetime('now'), datetime('now')),
  ('SiDLY_DEVICE_002', '354807041234568', 'SiDLY Care Pro V11.0', 'Milano', 'INVENTORY', 'CE-2024-002', datetime('now'), datetime('now')),
  ('SiDLY_DEVICE_003', '354807041234569', 'SiDLY Care Pro V11.0', 'Roma', 'ASSIGNED', 'CE-2024-003', datetime('now'), datetime('now')),
  ('SiDLY_DEVICE_004', '354807041234570', 'SiDLY Care Pro V11.0', 'Roma', 'ACTIVE', 'CE-2024-004', datetime('now'), datetime('now')),
  ('SiDLY_DEVICE_005', '354807041234571', 'SiDLY Care Pro V11.0', 'Torino', 'MAINTENANCE', 'CE-2024-005', datetime('now'), datetime('now'));

-- ========== LEADS SAMPLE ==========
INSERT OR IGNORE INTO leads (
  id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
  nomeAssistito, cognomeAssistito, etaAssistito, pacchetto, 
  vuoleContratto, status, sistemaVersione, gdprConsent, consensoPrivacy,
  created_at, updated_at
) VALUES 
  ('LEAD-DEMO-001', 'Mario', 'Rossi', 'mario.rossi@demo.it', '+39 335 1234567', 
   'Giuseppe', 'Rossi', '75', 'Avanzato', 'Si', 'ACTIVE', 'V11.0', 'on', 'on',
   datetime('now', '-2 days'), datetime('now', '-2 days')),
  ('LEAD-DEMO-002', 'Anna', 'Bianchi', 'anna.bianchi@demo.it', '+39 347 9876543',
   'Anna', 'Bianchi', '68', 'Base', 'Si', 'CONVERTED', 'V11.0', 'on', 'on', 
   datetime('now', '-1 days'), datetime('now', '-1 days')),
  ('LEAD-DEMO-003', 'Giuseppe', 'Verde', 'giuseppe.verde@demo.it', '+39 328 5555555',
   'Maria', 'Verde', '72', 'Avanzato', 'Si', 'ACTIVE', 'V11.0', 'on', 'on',
   datetime('now'), datetime('now'));

-- ========== ASSISTITI SAMPLE ==========
INSERT OR IGNORE INTO assistiti (
  lead_id, codice_assistito, nome, cognome, email, telefono, data_nascita, 
  codice_fiscale, indirizzo, citta, cap, provincia, tipo_contratto, stato, 
  data_conversione, numero_contratto, valore_contratto, created_at, updated_at
) VALUES 
  ('LEAD-DEMO-002', 'ASS-2024-001', 'Anna', 'Bianchi', 'anna.bianchi@demo.it', '+39 347 9876543', '1956-03-15',
   'BNCNNA68C15H501X', 'Via Roma 123', 'Milano', '20121', 'MI', 'BASE', 'ATTIVO',
   datetime('now', '-1 days'), 'CONTR-2024-001', 480.00, datetime('now', '-1 days'), datetime('now', '-1 days'));

-- ========== CONTRATTI SAMPLE ==========
INSERT OR IGNORE INTO contracts (
  id, leadId, contractType, status, pdfGenerated, 
  created_at, updated_at
) VALUES 
  ('CONTRACT-DEMO-001', 'LEAD-DEMO-002', 'BASE', 'SIGNED', 1,
   datetime('now', '-1 days'), datetime('now', '-1 days'));

-- ========== SYSTEM LOGS SAMPLE ==========
-- Struttura corretta: tipo, modulo, messaggio, dettagli, livello, assistito_id, lead_id, timestamp
INSERT OR IGNORE INTO system_logs (
  tipo, modulo, messaggio, dettagli, livello, timestamp
) VALUES 
  ('LEAD', 'LEAD', 'LEAD_CREATED', '{"action": "demo_lead_created"}', 'INFO', datetime('now')),
  ('CONTRACT', 'CONTRACT', 'CONTRACT_SIGNED', '{"action": "demo_contract_signed"}', 'INFO', datetime('now', '-1 days')),
  ('DEVICE', 'DEVICE', 'DEVICE_REGISTERED', '{"action": "demo_device_registered"}', 'INFO', datetime('now'));

-- ========== DOCUMENTATION SAMPLE ==========
-- Struttura corretta: id (auto), category, title, content, tags, author, version, is_active, created_at, updated_at
INSERT OR IGNORE INTO documentation_sections (
  category, title, content, tags, author, version, is_active
) VALUES 
  ('generale', 'Introduzione TeleMedCare V11.0', 
   'TeleMedCare V11.0 è una piattaforma completa per la gestione di servizi di telemedicina avanzata con dispositivi SiDLY Care Pro certificati CE.', 
   'introduzione,piattaforma,telemedicina', 'Sistema TeleMedCare', '11.0', 1),
  ('funzionalita', 'Gestione Leads', 
   'Il sistema di gestione leads permette di acquisire, processare e convertire potenziali clienti attraverso un workflow automatizzato.', 
   'leads,workflow,conversione', 'Sistema TeleMedCare', '11.0', 1),
  ('funzionalita', 'Gestione Dispositivi', 
   'Sistema completo per la registrazione, monitoraggio e assegnazione dei dispositivi SiDLY Care Pro con tracciamento CE.', 
   'dispositivi,monitoraggio,ce', 'Sistema TeleMedCare', '11.0', 1),
  ('dashboard', 'Dashboard Operativo', 
   'Dashboard in tempo reale per il monitoraggio delle attività operative, leads attivi e statistiche dispositivi.', 
   'dashboard,operativo,monitoraggio', 'Sistema TeleMedCare', '11.0', 1);

-- ========== DOCUMENT TEMPLATES SAMPLE ==========
-- Struttura corretta: nome_template, tipo_documento, categoria, versione, html_template, etc.
INSERT OR IGNORE INTO document_templates (
  nome_template, tipo_documento, categoria, versione, html_template, 
  variabili_disponibili, descrizione, autore, attivo, template_predefinito
) VALUES 
  ('Contratto Base TeleMedCare V11.0', 'contratto', 'contratti_base', '11.0', 
   '<html><head><title>Contratto TeleMedCare Base</title></head><body><h1>CONTRATTO DI SERVIZIO TELEMEDCARE BASE</h1><p>Cliente: {{NOME_CLIENTE}}</p><p>Email: {{EMAIL_CLIENTE}}</p><p>Data: {{DATA_CONTRATTO}}</p></body></html>', 
   '["NOME_CLIENTE", "EMAIL_CLIENTE", "DATA_CONTRATTO", "SERVIZI_INCLUSI"]',
   'Template standard per contratti base TeleMedCare con servizi essenziali', 'Sistema TeleMedCare', 1, 1),
  ('Contratto Avanzato TeleMedCare V11.0', 'contratto', 'contratti_avanzati', '11.0',
   '<html><head><title>Contratto TeleMedCare Avanzato</title></head><body><h1>CONTRATTO DI SERVIZIO TELEMEDCARE AVANZATO</h1><p>Cliente: {{NOME_CLIENTE}}</p><p>Email: {{EMAIL_CLIENTE}}</p><p>Data: {{DATA_CONTRATTO}}</p><p>Servizi: {{SERVIZI_INCLUSI}}</p><p>Centrale Operativa: Inclusa</p></body></html>', 
   '["NOME_CLIENTE", "EMAIL_CLIENTE", "DATA_CONTRATTO", "SERVIZI_INCLUSI", "CENTRALE_OPERATIVA"]',
   'Template per contratti avanzati con centrale operativa 24/7', 'Sistema TeleMedCare', 1, 1),
  ('Proforma TeleMedCare', 'proforma', 'proforma', '11.0',
   '<html><head><title>Proforma TeleMedCare</title></head><body><h1>PROFORMA TELEMEDCARE</h1><p>Cliente: {{NOME_CLIENTE}}</p><p>Servizio: {{TIPO_SERVIZIO}}</p><p>Importo: {{IMPORTO_TOTALE}}</p></body></html>',
   '["NOME_CLIENTE", "TIPO_SERVIZIO", "IMPORTO_TOTALE", "SCADENZA"]',
   'Template per documenti proforma e preventivi', 'Sistema TeleMedCare', 1, 0);

-- Verifica inserimento dati
SELECT 'DISPOSITIVI:', COUNT(*) FROM dispositivi;
SELECT 'LEADS:', COUNT(*) FROM leads;
SELECT 'ASSISTITI:', COUNT(*) FROM assistiti;
SELECT 'CONTRATTI:', COUNT(*) FROM contracts;
SELECT 'SYSTEM LOGS:', COUNT(*) FROM system_logs;
SELECT 'DOCUMENTAZIONE:', COUNT(*) FROM documentation_sections;
SELECT 'TEMPLATES:', COUNT(*) FROM document_templates;