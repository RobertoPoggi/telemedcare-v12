-- =============================================
-- DATI DI TEST REALISTICI - TeleMedCare V11.0
-- =============================================
-- Test completo con lead, proforma, contratti e dispositivi
-- Data: 2025-10-06
-- =============================================

-- =====================================
-- LEAD REALISTICI
-- =====================================

-- Lead 1: Signora Maria Rossi per suo padre Giovanni
INSERT OR REPLACE INTO leads (
    id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
    nomeAssistito, cognomeAssistito, dataNascitaAssistito, luogoNascitaAssistito, etaAssistito, parentelaAssistito,
    pacchetto, condizioniSalute, priority, preferitoContatto,
    vuoleContratto, vuoleBrochure, vuoleManuale, intestazioneContratto,
    cfRichiedente, indirizzoRichiedente, cfAssistito, indirizzoAssistito,
    codiceSIDLY, sourceUrl, sistemaVersione,
    status, leadScore, conversion_probability,
    created_at, updated_at, requestType, userAgent, ipAddress
) VALUES (
    'lead_001_maria_rossi',
    'Maria', 'Rossi', 'maria.rossi@email.it', '+39 339 1234567',
    'Giovanni', 'Rossi', '1942-03-15', 'Milano', '81', 'Padre',
    'BASE', 'Ipertensione, diabete controllato, episodi di vertigini', 'HIGH', 'Telefono',
    'Si', 'Si', 'Si', 'Giovanni Rossi',
    'RSSMAR70A41F205X', 'Via Giuseppe Verdi 25, 20121 Milano', 'RSSGVN42C15F205Y', 'Via Giuseppe Verdi 25, 20121 Milano',
    'SIDLY001', 'https://telemedcare.it/landing-base', 'V11.0',
    'QUALIFIED', 85, 0.75,
    '2025-10-01 09:30:00', '2025-10-01 09:30:00', 'POST', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', '192.168.1.100'
);

-- Lead 2: Sig. Marco Bianchi per sua madre Anna
INSERT OR REPLACE INTO leads (
    id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
    nomeAssistito, cognomeAssistito, dataNascitaAssistito, luogoNascitaAssistito, etaAssistito, parentelaAssistito,
    pacchetto, condizioniSalute, priority, preferitoContatto,
    vuoleContratto, vuoleBrochure, vuoleManuale, intestazioneContratto,
    cfRichiedente, indirizzoRichiedente, cfAssistito, indirizzoAssistito,
    codiceSIDLY, sourceUrl, sistemaVersione,
    status, leadScore, conversion_probability,
    created_at, updated_at, requestType, userAgent, ipAddress
) VALUES (
    'lead_002_marco_bianchi',
    'Marco', 'Bianchi', 'marco.bianchi@gmail.com', '+39 347 9876543',
    'Anna', 'Bianchi', '1938-07-22', 'Roma', '86', 'Madre',
    'AVANZATO', 'Cardiopatia, artrite, problemi di mobilità', 'HIGH', 'Email',
    'Si', 'Si', 'Si', 'Anna Bianchi',
    'BNCMRC75L12H501Z', 'Via Nazionale 156, 00184 Roma', 'BNCANN38L62H501W', 'Via Nazionale 156, 00184 Roma',
    'SIDLY002', 'https://telemedcare.it/landing-avanzato', 'V11.0',
    'QUALIFIED', 92, 0.85,
    '2025-10-02 14:15:00', '2025-10-02 14:15:00', 'POST', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36', '192.168.1.101'
);

-- Lead 3: Dott.ssa Laura Verdi per il paziente Carlo Neri  
INSERT OR REPLACE INTO leads (
    id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
    nomeAssistito, cognomeAssistito, dataNascitaAssistito, luogoNascitaAssistito, etaAssistito, parentelaAssistito,
    pacchetto, condizioniSalute, priority, preferitoContatto,
    vuoleContratto, vuoleBrochure, vuoleManuale, intestazioneContratto,
    cfRichiedente, indirizzoRichiedente, cfAssistito, indirizzoAssistito,
    codiceSIDLY, sourceUrl, sistemaVersione,
    status, leadScore, conversion_probability,
    created_at, updated_at, requestType, userAgent, ipAddress
) VALUES (
    'lead_003_laura_verdi',
    'Laura', 'Verdi', 'l.verdi@clinicasanmatteo.it', '+39 02 5551234',
    'Carlo', 'Neri', '1945-11-08', 'Napoli', '79', 'Paziente',
    'PREMIUM', 'Post-operatorio cardiochirurgico, necessità monitoraggio intensivo', 'URGENT', 'Telefono',
    'Si', 'No', 'Si', 'Carlo Neri',
    'VRDLRA80A41F205K', 'Via San Raffaele 20, 20132 Milano', 'NRICRL45S08F839L', 'Via Toledo 234, 80134 Napoli',
    'SIDLY003', 'https://telemedcare.it/referral-medico', 'V11.0',
    'HOT_LEAD', 98, 0.95,
    '2025-10-03 11:45:00', '2025-10-03 11:45:00', 'POST', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36', '192.168.1.102'
);

-- =====================================
-- DISPOSITIVI DISPONIBILI
-- =====================================

-- Dispositivi in magazzino per i test
INSERT OR REPLACE INTO dispositivi (
    device_id, imei, serial_number, brand, model, version, firmware_version,
    status, magazzino, posizione_magazzino,
    label_data, udi_numbers, ce_marking, manufacturer_data,
    configuration, warranty_expires, created_at, updated_at
) VALUES 
    ('DEV001', '351234567890123', 'SLY2025001', 'SiDLY', 'SiDLY Care Pro', 'v2.1', 'FW_2.1.5',
     'INVENTORY', 'Milano', 'Scaffale A-12',
     '{"qr_code": "SLY001", "batch": "2025A001"}', '["UDI001", "UDI002"]', 'CE 2023', '{"manufacturer": "SiDLY Healthcare", "country": "Italy"}',
     '{"preset": "elderly_monitoring", "alerts": true}', '2027-10-01', '2025-09-15 08:00:00', '2025-09-15 08:00:00'),
     
    ('DEV002', '351234567890124', 'SLY2025002', 'SiDLY', 'SiDLY Care Pro', 'v2.1', 'FW_2.1.5',
     'INVENTORY', 'Milano', 'Scaffale A-13', 
     '{"qr_code": "SLY002", "batch": "2025A001"}', '["UDI003", "UDI004"]', 'CE 2023', '{"manufacturer": "SiDLY Healthcare", "country": "Italy"}',
     '{"preset": "cardiac_monitoring", "alerts": true}', '2027-10-01', '2025-09-15 08:15:00', '2025-09-15 08:15:00'),
     
    ('DEV003', '351234567890125', 'SLY2025003', 'SiDLY', 'SiDLY Care Pro Plus', 'v2.2', 'FW_2.2.1',
     'INVENTORY', 'Roma', 'Scaffale B-05',
     '{"qr_code": "SLY003", "batch": "2025A002"}', '["UDI005", "UDI006"]', 'CE 2023', '{"manufacturer": "SiDLY Healthcare", "country": "Italy"}',
     '{"preset": "premium_monitoring", "alerts": true, "advanced": true}', '2027-10-01', '2025-09-15 08:30:00', '2025-09-15 08:30:00');

-- =====================================
-- CONFIGURAZIONI SISTEMA
-- =====================================

INSERT OR REPLACE INTO sistema_config (chiave, valore, descrizione, categoria) VALUES 
    ('test_environment', 'true', 'Ambiente di test attivo', 'testing'),
    ('proforma_template_base', 'proforma_base_v1', 'Template predefinito proforma BASE', 'templates'),
    ('contract_template_base', 'contratto_base_v1', 'Template predefinito contratto BASE', 'templates'),
    ('automatic_device_assignment', 'false', 'Assegnazione automatica dispositivi disabilitata per test', 'automation'),
    ('email_notifications', 'false', 'Notifiche email disabilitate per test', 'notifications'),
    ('pricing_base_monthly', '89.90', 'Prezzo mensile pacchetto BASE', 'pricing'),
    ('pricing_avanzato_monthly', '149.90', 'Prezzo mensile pacchetto AVANZATO', 'pricing'),
    ('pricing_premium_monthly', '249.90', 'Prezzo mensile pacchetto PREMIUM', 'pricing');

-- =====================================
-- AUTOMATION TASKS SIMULATI
-- =====================================

-- Task per il lead di Maria Rossi
INSERT OR REPLACE INTO automation_tasks (
    id, leadId, automationType, emailTemplate,
    scheduledDate, scheduledTime, priority, status,
    attemptNumber, maxAttempts, executionData,
    createdAt, updatedAt
) VALUES 
    ('task_001_info', 'lead_001_maria_rossi', 'NOTIFICA_INFO', 'email_info_base',
     '2025-10-01', '15:00:00', 'MEDIUM', 'COMPLETED',
     1, 3, '{"email_sent": true, "sent_at": "2025-10-01T15:00:00Z"}',
     '2025-10-01 09:30:00', '2025-10-01 15:00:00'),
     
    ('task_002_docs', 'lead_001_maria_rossi', 'DOCUMENTI_INFORMATIVI', 'email_documenti',
     '2025-10-02', '10:00:00', 'MEDIUM', 'COMPLETED',
     1, 3, '{"email_sent": true, "attachments": ["brochure_base.pdf", "manuale_utente.pdf"]}',
     '2025-10-01 09:30:00', '2025-10-02 10:00:00'),
     
    ('task_003_proforma', 'lead_001_maria_rossi', 'INVIO_PROFORMA', 'email_proforma',
     '2025-10-04', '14:00:00', 'HIGH', 'SCHEDULED',
     0, 3, '{"proforma_generated": true, "proforma_id": "prf_001"}',
     '2025-10-01 09:30:00', '2025-10-01 09:30:00');

-- Task per il lead di Marco Bianchi
INSERT OR REPLACE INTO automation_tasks (
    id, leadId, automationType, emailTemplate,
    scheduledDate, scheduledTime, priority, status,
    attemptNumber, maxAttempts, executionData,
    createdAt, updatedAt
) VALUES 
    ('task_004_welcome', 'lead_002_marco_bianchi', 'EMAIL_BENVENUTO', 'email_welcome_avanzato',
     '2025-10-02', '16:00:00', 'HIGH', 'COMPLETED',
     1, 3, '{"email_sent": true, "opened": true, "clicked": true}',
     '2025-10-02 14:15:00', '2025-10-02 16:00:00'),
     
    ('task_005_contract', 'lead_002_marco_bianchi', 'INVIO_CONTRATTO', 'email_contratto',
     '2025-10-05', '09:00:00', 'HIGH', 'PROCESSING',
     1, 3, '{"contract_generated": true, "contract_id": "ctr_001"}',
     '2025-10-02 14:15:00', '2025-10-05 09:00:00');

-- =====================================
-- EMAIL LOGS REALISTICI
-- =====================================

INSERT OR REPLACE INTO email_logs (
    id, leadId, automationTaskId, emailType, recipientEmail, subject,
    attachments, status, sentAt, deliveredAt, openedAt,
    messageId, providerResponse,
    created_at, updated_at
) VALUES 
    ('email_001', 'lead_001_maria_rossi', 'task_001_info', 'NOTIFICA_INFO', 'maria.rossi@email.it', 'TeleMedCare - Informazioni sul servizio richiesto',
     '[]', 'DELIVERED', '2025-10-01 15:00:00', '2025-10-01 15:01:30', '2025-10-01 17:22:15',
     'msg_abc123', '{"status": "delivered", "provider": "sendgrid"}',
     '2025-10-01 15:00:00', '2025-10-01 17:22:15'),
     
    ('email_002', 'lead_001_maria_rossi', 'task_002_docs', 'DOCUMENTI_INFORMATIVI', 'maria.rossi@email.it', 'TeleMedCare - Documentazione informativa',
     '[{"name": "brochure_base.pdf", "size": 245760}, {"name": "manuale_utente.pdf", "size": 1048576}]', 'DELIVERED', 
     '2025-10-02 10:00:00', '2025-10-02 10:01:45', '2025-10-02 11:15:30',
     'msg_def456', '{"status": "delivered", "provider": "sendgrid"}',
     '2025-10-02 10:00:00', '2025-10-02 11:15:30'),
     
    ('email_003', 'lead_002_marco_bianchi', 'task_004_welcome', 'EMAIL_BENVENUTO', 'marco.bianchi@gmail.com', 'Benvenuto in TeleMedCare - Pacchetto Avanzato',
     '[]', 'DELIVERED', '2025-10-02 16:00:00', '2025-10-02 16:00:22', '2025-10-02 16:45:10',
     'msg_ghi789', '{"status": "delivered", "provider": "sendgrid", "clicked_links": ["info", "contacts"]}',
     '2025-10-02 16:00:00', '2025-10-02 16:45:10');

-- =====================================
-- SYSTEM LOGS
-- =====================================

INSERT OR REPLACE INTO system_logs (
    tipo, modulo, messaggio, dettagli, livello, assistito_id, lead_id, timestamp
) VALUES 
    ('LEAD_CREATED', 'lead-manager', 'Nuovo lead ricevuto da Maria Rossi per Giovanni Rossi', 
     '{"source": "landing_page", "package": "BASE", "score": 85}', 'INFO', NULL, 'lead_001_maria_rossi', '2025-10-01 09:30:00'),
     
    ('EMAIL_SENT', 'automation', 'Email informativa inviata con successo', 
     '{"email_type": "NOTIFICA_INFO", "recipient": "maria.rossi@email.it", "status": "delivered"}', 'INFO', NULL, 'lead_001_maria_rossi', '2025-10-01 15:00:00'),
     
    ('LEAD_QUALIFIED', 'lead-manager', 'Lead qualificato per Marco Bianchi', 
     '{"score": 92, "package": "AVANZATO", "priority": "HIGH"}', 'INFO', NULL, 'lead_002_marco_bianchi', '2025-10-02 14:15:00'),
     
    ('URGENT_LEAD', 'lead-manager', 'Lead urgente ricevuto da medico referente', 
     '{"referrer": "Dott.ssa Laura Verdi", "package": "PREMIUM", "priority": "URGENT"}', 'WARNING', NULL, 'lead_003_laura_verdi', '2025-10-03 11:45:00'),
     
    ('SYSTEM_HEALTH', 'monitoring', 'Sistema operativo - tutti i moduli funzionanti', 
     '{"cpu_usage": "12%", "memory": "45%", "database": "online", "email_service": "active"}', 'INFO', NULL, NULL, '2025-10-06 08:00:00');

-- =====================================
-- DATI OPZIONALI PER TEST AVANZATI
-- =====================================

-- Form configurazioni di esempio
INSERT OR REPLACE INTO form_configurazioni (
    assistito_id, tipo_form, dati_form, stato, data_compilazione, 
    ip_compilazione, user_agent, note, created_at
) VALUES 
    (1, 'CONFIGURAZIONE_INIZIALE', 
     '{"emergenza_primaria": "+39 339 1234567", "emergenza_secondaria": "+39 02 1234567", "medico_curante": "Dott. Giuseppe Bianchi", "allergie": "Nessuna nota", "farmaci": "Enalapril 10mg, Metformina 500mg", "preferenze_contatto": "Telefono mattina 9-12"}',
     'COMPILATO', '2025-10-01 20:30:00', '192.168.1.100', 
     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Compilazione completa', '2025-10-01 20:30:00');

-- Documentazione di esempio
INSERT OR REPLACE INTO documentation_sections (
    category, title, content, tags, author, version, is_active, created_at, updated_at
) VALUES 
    ('TEST_DATA', 'Dati di Test Realistici', 
     'Questa sezione contiene dati di test realistici per verificare il funzionamento completo del sistema TeleMedCare V11.0. Include lead qualificati, automation tasks, email logs e configurazioni complete.',
     'test,data,realistic,validation', 'System', '1.0', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
     
    ('API_USAGE', 'Test API Proforma e Contratti',
     'Guida per testare le API di creazione proforma e contratti utilizzando i dati di test. Verificare tutti i percorsi: creazione, invio, accettazione, conversione e firma.',
     'api,testing,proforma,contracts,guide', 'System', '1.0', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);