-- TeleMedCare V11.0 Test Environment Seed Data
-- Dati di test per ambienti test

-- Clear existing data (for clean test environments)
DELETE FROM workflow_tracking;
DELETE FROM form_configurazioni;
DELETE FROM email_logs;
DELETE FROM contracts;
DELETE FROM automation_tasks;
DELETE FROM assistiti;
DELETE FROM leads;
DELETE FROM documentation_sections WHERE author LIKE '%test%';

-- Reset sequences
DELETE FROM sqlite_sequence WHERE name IN ('assistiti', 'workflow_tracking', 'form_configurazioni', 'contracts', 'automation_tasks', 'system_logs');

-- Insert test leads
INSERT INTO leads (
  id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
  nomeAssistito, cognomeAssistito, dataNascitaAssistito, cfRichiedente, cfAssistito,
  indirizzoRichiedente, indirizzoAssistito, pacchetto, status, vuoleContratto,
  note, gdprConsent, consensoPrivacy, sistemaVersione, leadScore, conversion_probability
) VALUES 
(
  'LEAD_TEST_001',
  'Mario', 'Rossi', 'mario.rossi.test@example.com', '3331234567',
  'Maria', 'Rossi', '1945-03-15', 'RSSMRA45C15F205X', 'RSSMRA45C15F205Y',
  'Via Roma 123, 20100 Milano MI', 'Via Roma 123, 20100 Milano MI',
  'Base', 'CONVERTED', 'Si',
  'Lead test per ambiente test', 'on', 'on', 'V11.0', 85, 0.85
),
(
  'LEAD_TEST_002',
  'Giuseppe', 'Verdi', 'giuseppe.verdi.test@example.com', '3337654321',
  'Anna', 'Verdi', '1950-07-22', 'VRDGPP50L22F205X', 'VRDANN50L22F205Y',
  'Via Milano 456, 20121 Milano MI', 'Via Milano 456, 20121 Milano MI',
  'Avanzato', 'QUALIFIED', 'Si',
  'Lead test avanzato', 'on', 'on', 'V11.0', 92, 0.92
),
(
  'LEAD_TEST_003',
  'Francesca', 'Bianchi', 'francesca.bianchi.test@example.com', '3339876543',
  'Franco', 'Bianchi', '1955-11-08', 'BNCFNC55S08F205X', 'BNCFNC55S08F205Y',
  'Via Torino 789, 20135 Milano MI', 'Via Torino 789, 20135 Milano MI',
  'Base', 'NEW', 'No',
  'Lead test nuovo', 'on', 'on', 'V11.0', 67, 0.67
),
(
  'LEAD_TEST_004',
  'Alessandro', 'Neri', 'alessandro.neri.test@example.com', '3335555555',
  'Elena', 'Neri', '1948-12-31', 'NRIALS48T31F205X', 'NRIELN48T31F205Y',
  'Via Venezia 321, 20122 Milano MI', 'Via Venezia 321, 20122 Milano MI',
  'Avanzato', 'CONVERTED', 'Si',
  'Lead test convertito avanzato', 'on', 'on', 'V11.0', 96, 0.96
),
(
  'LEAD_TEST_005',
  'Claudia', 'Ferrari', 'claudia.ferrari.test@example.com', '3338888888',
  'Roberto', 'Ferrari', '1952-05-17', 'FRRCLD52E17F205X', 'FRRRBT52E17F205Y',
  'Via Napoli 654, 20131 Milano MI', 'Via Napoli 654, 20131 Milano MI',
  'Base', 'QUALIFIED', 'Si',
  'Lead test qualificato', 'on', 'on', 'V11.0', 78, 0.78
);

-- Insert test assistiti (converted leads)
INSERT INTO assistiti (
  lead_id, codice_assistito, nome, cognome, email, telefono, data_nascita,
  codice_fiscale, indirizzo, citta, cap, provincia, tipo_contratto,
  numero_contratto, valore_contratto, data_conversione, stato
) VALUES 
(
  1, -- This will match the first lead's auto-increment ID
  'ASS_TEST_001',
  'Maria', 'Rossi', 'mario.rossi.test@example.com', '3331234567', '1945-03-15',
  'RSSMRA45C15F205X', 'Via Roma 123', 'Milano', '20100', 'MI', 'BASE',
  'CTR_TEST_001', 480.00, '2024-10-01 10:00:00', 'ATTIVO'
),
(
  4, -- This will match the fourth lead's auto-increment ID  
  'ASS_TEST_004',
  'Elena', 'Neri', 'alessandro.neri.test@example.com', '3335555555', '1948-12-31',
  'NRIELN48T31F205X', 'Via Venezia 321', 'Milano', '20122', 'MI', 'AVANZATO',
  'CTR_TEST_004', 840.00, '2024-10-02 14:30:00', 'ATTIVO'
);

-- Insert test workflow tracking
INSERT INTO workflow_tracking (
  assistito_id, fase, stato, data_inizio, data_completamento, note
) VALUES
-- Workflow per assistito 1 (completo)
(1, 'PROFORMA_INVIATA', 'COMPLETATO', '2024-10-01 10:00:00', '2024-10-01 10:05:00', 'Proforma inviata automaticamente'),
(1, 'PAGAMENTO_RICEVUTO', 'COMPLETATO', '2024-10-01 15:00:00', '2024-10-01 15:00:00', 'Pagamento ricevuto via bonifico'),
(1, 'EMAIL_BENVENUTO_INVIATA', 'COMPLETATO', '2024-10-01 15:30:00', '2024-10-01 15:30:00', 'Email benvenuto inviata'),
(1, 'FORM_CONFIGURAZIONE_INVIATO', 'COMPLETATO', '2024-10-01 16:00:00', '2024-10-01 16:00:00', 'Form configurazione inviato'),
(1, 'CONFIGURAZIONE_RICEVUTA', 'COMPLETATO', '2024-10-02 09:00:00', '2024-10-02 09:00:00', 'Configurazione ricevuta dal cliente'),
(1, 'CONFERMA_ATTIVAZIONE_INVIATA', 'COMPLETATO', '2024-10-02 10:00:00', '2024-10-02 10:00:00', 'Conferma attivazione inviata'),
(1, 'SPEDIZIONE_COMPLETATA', 'COMPLETATO', '2024-10-02 16:00:00', '2024-10-02 16:00:00', 'Dispositivo spedito via corriere'),

-- Workflow per assistito 2 (in corso)
(2, 'PROFORMA_INVIATA', 'COMPLETATO', '2024-10-02 14:30:00', '2024-10-02 14:35:00', 'Proforma inviata automaticamente'),
(2, 'PAGAMENTO_RICEVUTO', 'COMPLETATO', '2024-10-03 09:00:00', '2024-10-03 09:00:00', 'Pagamento ricevuto via carta'),
(2, 'EMAIL_BENVENUTO_INVIATA', 'COMPLETATO', '2024-10-03 09:30:00', '2024-10-03 09:30:00', 'Email benvenuto inviata'),
(2, 'FORM_CONFIGURAZIONE_INVIATO', 'IN_PROGRESS', '2024-10-03 10:00:00', NULL, 'In attesa compilazione form'),
(2, 'CONFIGURAZIONE_RICEVUTA', 'PENDING', NULL, NULL, 'In attesa configurazione'),
(2, 'CONFERMA_ATTIVAZIONE_INVIATA', 'PENDING', NULL, NULL, 'In attesa attivazione'),
(2, 'SPEDIZIONE_COMPLETATA', 'PENDING', NULL, NULL, 'In attesa spedizione');

-- Insert test email logs
INSERT INTO email_logs (
  id, leadId, emailType, recipientEmail, subject, status, sentAt, deliveredAt
) VALUES
('EMAIL_TEST_001', 'LEAD_TEST_001', 'NOTIFICA_INFO', 'mario.rossi.test@example.com', 'TeleMedCare - Informazioni richieste', 'DELIVERED', '2024-10-01 09:00:00', '2024-10-01 09:01:00'),
('EMAIL_TEST_002', 'LEAD_TEST_001', 'DOCUMENTI_INFORMATIVI', 'mario.rossi.test@example.com', 'TeleMedCare - Documentazione informativa', 'DELIVERED', '2024-10-01 09:30:00', '2024-10-01 09:31:00'),
('EMAIL_TEST_003', 'LEAD_TEST_001', 'INVIO_CONTRATTO', 'mario.rossi.test@example.com', 'TeleMedCare - Contratto per sottoscrizione', 'DELIVERED', '2024-10-01 10:00:00', '2024-10-01 10:01:00'),
('EMAIL_TEST_004', 'LEAD_TEST_001', 'INVIO_PROFORMA', 'mario.rossi.test@example.com', 'TeleMedCare - Proforma per pagamento', 'DELIVERED', '2024-10-01 10:05:00', '2024-10-01 10:06:00'),
('EMAIL_TEST_005', 'LEAD_TEST_001', 'EMAIL_BENVENUTO', 'mario.rossi.test@example.com', 'TeleMedCare - Benvenuto! La tua assistenza è attiva', 'DELIVERED', '2024-10-01 15:30:00', '2024-10-01 15:31:00'),
('EMAIL_TEST_006', 'LEAD_TEST_004', 'NOTIFICA_INFO', 'alessandro.neri.test@example.com', 'TeleMedCare - Informazioni richieste', 'DELIVERED', '2024-10-02 14:00:00', '2024-10-02 14:01:00'),
('EMAIL_TEST_007', 'LEAD_TEST_004', 'INVIO_PROFORMA', 'alessandro.neri.test@example.com', 'TeleMedCare - Proforma per pagamento Avanzato', 'DELIVERED', '2024-10-02 14:35:00', '2024-10-02 14:36:00');

-- Insert test form configurations
INSERT INTO form_configurazioni (
  assistito_id, tipo_form, dati_form, stato, data_compilazione, note
) VALUES
(1, 'CONFIGURAZIONE_INIZIALE', '{"orari_preferiti":"09:00-18:00","medico_curante":"Dr. Mario Bianchi","contatto_emergenza":"3331234568","allergie":"Nessuna","terapie":"Cardioaspirina","note":"Cliente molto collaborativo"}', 'ELABORATO', '2024-10-02 09:00:00', 'Configurazione completa ricevuta'),
(2, 'CONFIGURAZIONE_INIZIALE', '{"orari_preferiti":"08:00-20:00","medico_curante":"Dr.ssa Elena Verdi","contatto_emergenza":"3335555556","allergie":"Penicillina","terapie":"Enalapril, Metformina","note":"Cliente ha esperienza con dispositivi tecnologici"}', 'PENDING', '2024-10-03 10:00:00', 'Form inviato, in attesa compilazione');

-- Insert test contracts
INSERT INTO contracts (
  assistito_id, tipo_contratto, numero_contratto, stato, data_generazione, valore_totale, note_contrattuali
) VALUES
(1, 'BASE', 'CTR_TEST_001', 'ATTIVO', '2024-10-01 10:00:00', 480.00, 'Contratto test per ambiente test - pacchetto base'),
(2, 'AVANZATO', 'CTR_TEST_004', 'ATTIVO', '2024-10-02 14:30:00', 840.00, 'Contratto test per ambiente test - pacchetto avanzato');

-- Insert test devices
INSERT INTO dispositivi (
  imei, modello, versione_firmware, stato, data_registrazione, assistito_id, note_tecniche
) VALUES
('123456789012345', 'SiDLY Care Pro', 'v2.1.0', 'ASSEGNATO', '2024-10-01 10:00:00', 1, 'Dispositivo test assegnato'),
('123456789012346', 'SiDLY Care Pro', 'v2.1.0', 'ASSEGNATO', '2024-10-02 14:30:00', 2, 'Dispositivo test assegnato avanzato'),
('123456789012347', 'SiDLY Care Pro', 'v2.1.0', 'DISPONIBILE', '2024-10-01 08:00:00', NULL, 'Dispositivo test disponibile'),
('123456789012348', 'SiDLY Care Pro', 'v2.0.9', 'MANUTENZIONE', '2024-09-30 16:00:00', NULL, 'Dispositivo in manutenzione test'),
('123456789012349', 'SiDLY Care Pro', 'v2.1.0', 'DISPONIBILE', '2024-10-02 12:00:00', NULL, 'Dispositivo test disponibile');

-- Insert test automation tasks
INSERT INTO automation_tasks (
  id, type, leadId, scheduledFor, status, completedAt, payload
) VALUES
('TASK_TEST_001', 'EMAIL_FOLLOWUP', 'LEAD_TEST_002', '2024-10-06 10:00:00', 'PENDING', NULL, '{"template":"FOLLOWUP_3_GIORNI","delay_hours":72}'),
('TASK_TEST_002', 'EMAIL_FOLLOWUP', 'LEAD_TEST_003', '2024-10-06 15:00:00', 'PENDING', NULL, '{"template":"FOLLOWUP_5_GIORNI","delay_hours":120}'),
('TASK_TEST_003', 'CONTRACT_GENERATION', 'LEAD_TEST_005', '2024-10-06 09:00:00', 'COMPLETED', '2024-10-06 09:05:00', '{"contract_type":"BASE","generated_pdf":"test_contract_005.pdf"}');

-- Insert test documentation sections
INSERT INTO documentation_sections (
  id, title, content, category, author, tags, version
) VALUES
(
  'test_environment_guide',
  'Guida Ambiente Test',
  '# Guida Ambiente Test TeleMedCare V11.0

Questo è un ambiente di test con dati simulati per verificare il funzionamento del sistema.

## Dati Test Disponibili
- 5 lead di test con stati diversi
- 2 assistiti convertiti con workflow completi  
- Log email di test
- Dispositivi di test
- Configurazioni di test

## Come Testare
1. Accedi alla dashboard: /admin/data-dashboard
2. Verifica i lead: visualizzazione e filtri
3. Testa conversione lead→assistito
4. Controlla workflow tracking
5. Verifica sistema email (simulato)

## Reset Dati Test
Per ripristinare i dati test originali, eseguire il seed SQL di test.',
  'user',
  'test_system',
  '["test", "guide", "environment", "data"]',
  '1.0.0'
);

-- Insert test system logs
INSERT INTO system_logs (
  component, action, success, details, environment
) VALUES
('TestDataSeeder', 'SEED_TEST_DATA', 1, 'Test environment seeded with sample data', 'test'),
('TestEnvironment', 'ENVIRONMENT_CREATED', 1, 'Test environment setup completed', 'test'),
('DatabaseManager', 'MIGRATIONS_APPLIED', 1, 'Database migrations applied to test environment', 'test'),
('HealthCheck', 'SYSTEM_STATUS', 1, 'Test environment health check passed', 'test');

-- Create some test statistics for dashboard
-- This will be automatically calculated by the system, but we add some base data

COMMIT;

-- Success message
SELECT 'Test environment seeded successfully!' as message,
       COUNT(*) as leads_created FROM leads WHERE id LIKE 'LEAD_TEST_%';

SELECT 'Assistiti test created' as message, 
       COUNT(*) as assistiti_created FROM assistiti WHERE codice_assistito LIKE 'ASS_TEST_%';

SELECT 'Workflow entries created' as message,
       COUNT(*) as workflow_entries FROM workflow_tracking;