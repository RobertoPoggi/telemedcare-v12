-- Create test assistiti using existing lead IDs
-- First let's create some sample assistiti with dummy lead_id values that we'll manage manually

-- Insert test assistiti (we'll manage lead_id mapping manually in the app)
INSERT OR IGNORE INTO assistiti (
  lead_id, codice_assistito, nome, cognome, email, telefono, data_nascita,
  codice_fiscale, indirizzo, citta, cap, provincia, tipo_contratto, 
  numero_contratto, valore_contratto, data_conversione, stato
) VALUES 
  (1001, 'ASS202410060001', 'Mario', 'Rossi', 'mario.rossi@email.com', '3331234567', '1950-03-15',
   'RSSMRA50C15H501A', 'Via Roma 123', 'Milano', '20100', 'MI', 'BASE', 
   'CTR2024001', 480.00, '2024-10-01 10:00:00', 'ATTIVO'),
  
  (1002, 'ASS202410060002', 'Anna', 'Verdi', 'giulia.verdi@email.com', '3339876543', '1965-07-22',
   'VRDANN65L62F205B', 'Via Napoli 456', 'Roma', '00100', 'RM', 'AVANZATO', 
   'CTR2024002', 840.00, '2024-10-02 14:30:00', 'ATTIVO'),
  
  (1003, 'ASS202410060003', 'Franco', 'Bianchi', 'franco.bianchi@email.com', '3335555666', '1958-12-10',
   'BNCFNC58T10L219C', 'Corso Italia 789', 'Torino', '10100', 'TO', 'BASE', 
   'CTR2024003', 480.00, '2024-10-03 09:15:00', 'ATTIVO');

-- Insert workflow tracking for test assistiti
INSERT OR IGNORE INTO workflow_tracking (assistito_id, fase, stato, data_inizio, data_completamento, note) VALUES
  -- Mario Rossi workflow (assistito_id 1)
  (1, 'PROFORMA_INVIATA', 'COMPLETATO', '2024-10-01 10:00:00', '2024-10-01 10:00:00', 'Conversione automatica da lead'),
  (1, 'PAGAMENTO_RICEVUTO', 'COMPLETATO', '2024-10-01 15:30:00', '2024-10-01 15:30:00', 'Pagamento bonifico bancario'),
  (1, 'EMAIL_BENVENUTO_INVIATA', 'COMPLETATO', '2024-10-01 16:00:00', '2024-10-01 16:00:00', 'Email benvenuto con form configurazione'),
  (1, 'FORM_CONFIGURAZIONE_INVIATO', 'COMPLETATO', '2024-10-01 16:05:00', '2024-10-01 16:05:00', 'Form configurazione dispositivo'),
  (1, 'CONFIGURAZIONE_RICEVUTA', 'COMPLETATO', '2024-10-02 09:20:00', '2024-10-02 09:20:00', 'Cliente ha compilato configurazione'),
  (1, 'CONFERMA_ATTIVAZIONE_INVIATA', 'COMPLETATO', '2024-10-02 10:00:00', '2024-10-02 10:00:00', 'Conferma attivazione servizio'),
  (1, 'SPEDIZIONE_COMPLETATA', 'COMPLETATO', '2024-10-03 14:00:00', '2024-10-03 14:00:00', 'Dispositivo spedito via corriere'),

  -- Anna Verdi workflow (assistito_id 2) - in progress
  (2, 'PROFORMA_INVIATA', 'COMPLETATO', '2024-10-02 14:30:00', '2024-10-02 14:30:00', 'Conversione automatica da lead'),
  (2, 'PAGAMENTO_RICEVUTO', 'COMPLETATO', '2024-10-02 18:45:00', '2024-10-02 18:45:00', 'Pagamento carta di credito'),
  (2, 'EMAIL_BENVENUTO_INVIATA', 'COMPLETATO', '2024-10-03 09:00:00', '2024-10-03 09:00:00', 'Email benvenuto inviata'),
  (2, 'FORM_CONFIGURAZIONE_INVIATO', 'COMPLETATO', '2024-10-03 09:05:00', '2024-10-03 09:05:00', 'Form configurazione inviato'),
  (2, 'CONFIGURAZIONE_RICEVUTA', 'IN_PROGRESS', '2024-10-03 09:05:00', NULL, 'In attesa compilazione del cliente'),

  -- Franco Bianchi workflow (assistito_id 3) - early stage
  (3, 'PROFORMA_INVIATA', 'COMPLETATO', '2024-10-03 09:15:00', '2024-10-03 09:15:00', 'Conversione automatica da lead'),
  (3, 'PAGAMENTO_RICEVUTO', 'IN_PROGRESS', '2024-10-03 09:15:00', NULL, 'In attesa pagamento');

-- Insert configuration forms
INSERT OR IGNORE INTO form_configurazioni (assistito_id, tipo_form, dati_form, stato, data_compilazione, note) VALUES
  (1, 'CONFIGURAZIONE_INIZIALE', 
   '{"orari_preferiti": "09:00-18:00", "medico_curante": "Dr. Rossi Marco", "contatto_emergenza": "3331234568", "allergie": "Nessuna", "terapie": "Cardioaspirina 100mg"}',
   'COMPILATO', '2024-10-02 09:20:00', 'Configurazione completata dal cliente'),
  
  (2, 'CONFIGURAZIONE_INIZIALE',
   '{"orari_preferiti": "08:00-20:00", "medico_curante": "Dr.ssa Verdi Anna", "contatto_emergenza": "3339876544", "allergie": "Penicillina", "terapie": "Ramipril 5mg, Atorvastatina 20mg"}',
   'IN_COMPILAZIONE', '2024-10-06 04:00:00', 'Parzialmente compilato');

-- Insert system logs
INSERT OR IGNORE INTO system_logs (tipo, modulo, messaggio, dettagli, livello, assistito_id, lead_id, timestamp) VALUES
  ('CONVERSIONE_LEAD', 'DataManagementService', 'Lead LEAD_TCM_001 convertito in assistito ASS202410060001', 
   '{"leadId": "LEAD_TCM_001", "assistitoId": 1, "tipoContratto": "BASE"}', 'INFO', 1, 1001, '2024-10-01 10:00:00'),
  
  ('EMAIL_SENT', 'AutomationService', 'Email INVIO_PROFORMA inviata a mario.rossi@email.com', 
   '{"templateId": "INVIO_PROFORMA", "recipient": "mario.rossi@email.com"}', 'INFO', 1, NULL, '2024-10-01 10:01:00'),
  
  ('WORKFLOW_UPDATE', 'DataManagementService', 'Workflow fase PAGAMENTO_RICEVUTO completata per assistito 1', 
   '{"assistitoId": 1, "fase": "PAGAMENTO_RICEVUTO"}', 'INFO', 1, NULL, '2024-10-01 15:30:00'),
  
  ('EMAIL_SENT', 'AutomationService', 'Email EMAIL_BENVENUTO inviata a mario.rossi@email.com', 
   '{"templateId": "EMAIL_BENVENUTO", "recipient": "mario.rossi@email.com"}', 'INFO', 1, NULL, '2024-10-01 16:00:00'),
  
  ('CONVERSIONE_LEAD', 'DataManagementService', 'Lead LEAD_TCM_002 convertito in assistito ASS202410060002', 
   '{"leadId": "LEAD_TCM_002", "assistitoId": 2, "tipoContratto": "AVANZATO"}', 'INFO', 2, 1002, '2024-10-02 14:30:00'),
  
  ('EMAIL_SENT', 'AutomationService', 'Email INVIO_PROFORMA inviata a giulia.verdi@email.com', 
   '{"templateId": "INVIO_PROFORMA", "recipient": "giulia.verdi@email.com"}', 'INFO', 2, NULL, '2024-10-02 14:31:00'),
  
  ('SYSTEM_ERROR', 'EmailService', 'Errore temporaneo invio email a cliente@test.com', 
   '{"error": "SMTP timeout", "recipient": "cliente@test.com"}', 'ERROR', NULL, NULL, '2024-10-05 08:30:00'),
  
  ('EMAIL_SENT', 'AutomationService', 'Email EMAIL_CONFERMA inviata a mario.rossi@email.com', 
   '{"templateId": "EMAIL_CONFERMA", "recipient": "mario.rossi@email.com"}', 'INFO', 1, NULL, '2024-10-02 10:00:00'),
  
  ('WORKFLOW_UPDATE', 'DataManagementService', 'Workflow fase SPEDIZIONE_COMPLETATA completata per assistito 1', 
   '{"assistitoId": 1, "fase": "SPEDIZIONE_COMPLETATA", "corriere": "SDA Express"}', 'INFO', 1, NULL, '2024-10-03 14:00:00'),

  ('LEAD_CREATED', 'LeadCore', 'Nuovo lead registrato da form web', 
   '{"source": "web_form", "pacchetto": "Base"}', 'INFO', NULL, 1004, '2024-10-06 08:00:00'),
  
  ('EMAIL_SENT', 'AutomationService', 'Email NOTIFICA_INFO inviata a laura.gialli@email.com', 
   '{"templateId": "NOTIFICA_INFO", "recipient": "laura.gialli@email.com"}', 'INFO', NULL, 1004, '2024-10-06 08:05:00');