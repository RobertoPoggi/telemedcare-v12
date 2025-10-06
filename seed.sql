-- =============================================
-- TELEMEDCARE V11.0 - DATI DI SEED AGGIORNATI
-- =============================================
-- Data di seed con automation types italiani corretti
-- Data: 2025-10-05
-- =============================================

-- =====================================
-- LEAD DI ESEMPIO CON AUTOMATION ITALIANA
-- =====================================

-- Lead di test per flusso completo contratto
INSERT OR REPLACE INTO leads (
    id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
    nomeAssistito, cognomeAssistito, dataNascitaAssistito, luogoNascitaAssistito, etaAssistito, parentelaAssistito,
    pacchetto, condizioniSalute, priority, preferitoContatto,
    vuoleContratto, vuoleBrochure, vuoleManuale, intestazioneContratto,
    cfRichiedente, indirizzoRichiedente, cfAssistito, indirizzoAssistito,
    codiceSIDLY, sourceUrl, sistemaVersione, status, leadScore, conversion_probability,
    requestType, userAgent, ipAddress
) VALUES (
    'LEAD_TCM_001',
    'Mario', 'Rossi', 'mario.rossi@test.com', '+39 335 1234567',
    'Giuseppe', 'Rossi', '1945-03-15', 'Milano', '79', 'padre',
    'TeleAssistenza Avanzata', 'Diabete, ipertensione', 'Alta urgenza', 'telefono',
    'Si', 'Si', 'Si', 'Mario Rossi',
    'RSSMRA70A01F205X', 'Via Roma 123, 20100 Milano (MI)',
    'RSSGSPP45C15F205Y', 'Via Roma 123, 20100 Milano (MI)',
    'SiDLY-TCM-001', '/landing-page', 'V11.0', 'NEW', 85, 0.78,
    'POST', 'Mozilla/5.0 Chrome/120.0', '192.168.1.100'
);

-- Lead di test per flusso solo documenti
INSERT OR REPLACE INTO leads (
    id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
    nomeAssistito, cognomeAssistito, dataNascitaAssistito, luogoNascitaAssistito, etaAssistito, parentelaAssistito,
    pacchetto, condizioniSalute, priority, preferitoContatto,
    vuoleContratto, vuoleBrochure, vuoleManuale,
    cfRichiedente, indirizzoRichiedente,
    codiceSIDLY, sourceUrl, sistemaVersione, status, leadScore, conversion_probability,
    requestType, userAgent, ipAddress
) VALUES (
    'LEAD_TCM_002',
    'Anna', 'Bianchi', 'anna.bianchi@test.com', '+39 347 9876543',
    'Maria', 'Verdi', '1950-08-22', 'Roma', '74', 'madre',
    'TeleAssistenza Base', 'Controlli periodici', 'Media urgenza', 'email',
    'No', 'Si', 'Si',
    'BNCNNA75H60H501Z', 'Via Nazionale 456, 00100 Roma (RM)',
    'DOC_REQ_002', '/landing-page', 'V11.0', 'NEW', 45, 0.32,
    'POST', 'Mozilla/5.0 Safari/17.0', '192.168.1.200'
);

-- =====================================
-- TASK DI AUTOMAZIONE CON TIPI ITALIANI
-- =====================================

-- Task immediato: Notifica info per lead con contratto
INSERT OR REPLACE INTO automation_tasks (
    id, leadId, automationType, emailTemplate,
    scheduledDate, scheduledTime, priority, status, attemptNumber,
    executionData, createdAt, updatedAt
) VALUES (
    'AUTO_TCM_001',
    'LEAD_TCM_001',
    'NOTIFICA_INFO',
    'email_notifica_info',
    date('now'),
    '09:00',
    'HIGH',
    'COMPLETED',
    1,
    '{"recipientEmail": "info@medicagb.it", "customerName": "Mario Rossi", "serviceType": "TeleAssistenza Avanzata"}',
    datetime('now', '-2 hours'),
    datetime('now', '-2 hours')
);

-- Task invio contratto per lead principale
INSERT OR REPLACE INTO automation_tasks (
    id, leadId, automationType, emailTemplate,
    scheduledDate, scheduledTime, priority, status, attemptNumber,
    executionData, createdAt, updatedAt, completedAt
) VALUES (
    'AUTO_TCM_002',
    'LEAD_TCM_001',
    'INVIO_CONTRATTO',
    'email_invio_contratto',
    date('now'),
    '09:05',
    'HIGH',
    'COMPLETED',
    1,
    '{"recipientEmail": "mario.rossi@test.com", "customerName": "Mario Rossi", "contractType": "avanzato"}',
    datetime('now', '-1 hours 55 minutes'),
    datetime('now', '-1 hours 50 minutes'),
    datetime('now', '-1 hours 50 minutes')
);

-- Task per lead solo documenti
INSERT OR REPLACE INTO automation_tasks (
    id, leadId, automationType, emailTemplate,
    scheduledDate, scheduledTime, priority, status, attemptNumber,
    executionData, createdAt, updatedAt
) VALUES (
    'AUTO_TCM_003',
    'LEAD_TCM_002',
    'NOTIFICA_INFO',
    'email_notifica_info',
    date('now'),
    '10:00',
    'HIGH',
    'COMPLETED',
    1,
    '{"recipientEmail": "info@medicagb.it", "customerName": "Anna Bianchi", "serviceType": "TeleAssistenza Base"}',
    datetime('now', '-1 hours'),
    datetime('now', '-1 hours')
);

-- Task documenti informativi per lead secondario
INSERT OR REPLACE INTO automation_tasks (
    id, leadId, automationType, emailTemplate,
    scheduledDate, scheduledTime, priority, status, attemptNumber,
    executionData, createdAt, updatedAt
) VALUES (
    'AUTO_TCM_004',
    'LEAD_TCM_002',
    'DOCUMENTI_INFORMATIVI',
    'email_documenti_informativi',
    date('now'),
    '10:05',
    'MEDIUM',
    'COMPLETED',
    1,
    '{"recipientEmail": "anna.bianchi@test.com", "customerName": "Anna Bianchi"}',
    datetime('now', '-55 minutes'),
    datetime('now', '-50 minutes')
);

-- Task promemoria 3 giorni schedulato
INSERT OR REPLACE INTO automation_tasks (
    id, leadId, automationType, emailTemplate,
    scheduledDate, scheduledTime, priority, status, attemptNumber,
    executionData, createdAt, updatedAt
) VALUES (
    'AUTO_TCM_005',
    'LEAD_TCM_002',
    'PROMEMORIA_3GIORNI',
    'email_promemoria',
    date('now', '+3 days'),
    '10:00',
    'MEDIUM',
    'SCHEDULED',
    1,
    '{"recipientEmail": "anna.bianchi@test.com", "customerName": "Anna Bianchi", "tipoPromemoria": "PRIMO_CONTRATTO"}',
    datetime('now', '-45 minutes'),
    datetime('now', '-45 minutes')
);

-- Task promemoria 5 giorni schedulato
INSERT OR REPLACE INTO automation_tasks (
    id, leadId, automationType, emailTemplate,
    scheduledDate, scheduledTime, priority, status, attemptNumber,
    executionData, createdAt, updatedAt
) VALUES (
    'AUTO_TCM_006',
    'LEAD_TCM_002',
    'PROMEMORIA_5GIORNI',
    'email_promemoria',
    date('now', '+5 days'),
    '15:00',
    'HIGH',
    'SCHEDULED',
    1,
    '{"recipientEmail": "anna.bianchi@test.com", "customerName": "Anna Bianchi", "tipoPromemoria": "SECONDO_CONTRATTO"}',
    datetime('now', '-45 minutes'),
    datetime('now', '-45 minutes')
);

-- =====================================
-- LOG EMAIL DI ESEMPIO
-- =====================================

-- Log email notifica info
INSERT OR REPLACE INTO email_logs (
    id, leadId, automationTaskId, emailType, recipientEmail, subject,
    status, sentAt, deliveredAt, openedAt, messageId,
    providerResponse, created_at, updated_at
) VALUES (
    'EMAIL_LOG_001',
    'LEAD_TCM_001',
    'AUTO_TCM_001',
    'NOTIFICA_INFO',
    'info@medicagb.it',
    '🚨 Nuova Richiesta TeleMedCare - Mario Rossi [TeleAssistenza Avanzata]',
    'DELIVERED',
    datetime('now', '-2 hours'),
    datetime('now', '-1 hours 58 minutes'),
    datetime('now', '-1 hours 55 minutes'),
    'msg_tcm_001_notification',
    '{"status": "delivered", "opens": 1, "clicks": 0}',
    datetime('now', '-2 hours'),
    datetime('now', '-1 hours 55 minutes')
);

-- Log email contratto
INSERT OR REPLACE INTO email_logs (
    id, leadId, automationTaskId, emailType, recipientEmail, subject,
    status, sentAt, deliveredAt, openedAt, clickedAt, messageId,
    providerResponse, created_at, updated_at
) VALUES (
    'EMAIL_LOG_002',
    'LEAD_TCM_001',
    'AUTO_TCM_002',
    'INVIO_CONTRATTO',
    'mario.rossi@test.com',
    '📋 Il Tuo Contratto TeleMedCare è Pronto - Firma Elettronica',
    'DELIVERED',
    datetime('now', '-1 hours 50 minutes'),
    datetime('now', '-1 hours 48 minutes'),
    datetime('now', '-1 hours 45 minutes'),
    datetime('now', '-1 hours 40 minutes'),
    'msg_tcm_002_contratto',
    '{"status": "delivered", "opens": 2, "clicks": 1, "attachment_views": 1}',
    datetime('now', '-1 hours 50 minutes'),
    datetime('now', '-1 hours 40 minutes')
);

-- =====================================
-- DISPOSITIVI DI ESEMPIO
-- =====================================

-- Dispositivi in magazzino disponibili
INSERT OR REPLACE INTO dispositivi (
    device_id, imei, serial_number, brand, model, version, firmware_version,
    status, magazzino, posizione_magazzino,
    label_data, udi_numbers, ce_marking, manufacturer_data,
    warranty_expires, created_at, updated_at, created_by
) VALUES 
(
    'SiDLY_TCM_DEVICE_001',
    '354807041234567',
    'SN_TCM_2024_001',
    'SiDLY',
    'SiDLY Care Pro',
    'V3.2',
    'FW_3.2.15',
    'INVENTORY',
    'Milano',
    'Scaffale A3-R2',
    '{"qr_code": "SiDLY_TCM_001", "batch": "BATCH_2024_Q1", "production_date": "2024-01-15"}',
    '["UDI-001-2024-Q1-SiDLY", "CE-0197-SiDLY-2024"]',
    'CE 0197',
    '{"manufacturer": "SiDLY Healthcare", "address": "Milano, Italy", "contact": "+39 02 123456"}',
    date('now', '+2 years'),
    datetime('now', '-30 days'),
    datetime('now', '-30 days'),
    'sistema_automatico'
),
(
    'SiDLY_TCM_DEVICE_002', 
    '354807041234568',
    'SN_TCM_2024_002',
    'SiDLY',
    'SiDLY Care Pro',
    'V3.2',
    'FW_3.2.15',
    'INVENTORY',
    'Milano', 
    'Scaffale A3-R3',
    '{"qr_code": "SiDLY_TCM_002", "batch": "BATCH_2024_Q1", "production_date": "2024-01-16"}',
    '["UDI-002-2024-Q1-SiDLY", "CE-0197-SiDLY-2024"]',
    'CE 0197',
    '{"manufacturer": "SiDLY Healthcare", "address": "Milano, Italy", "contact": "+39 02 123456"}',
    date('now', '+2 years'),
    datetime('now', '-30 days'),
    datetime('now', '-30 days'),
    'sistema_automatico'
);

-- =====================================
-- CONFIGURAZIONI SISTEMA
-- =====================================

-- Configurazioni aggiuntive
INSERT OR REPLACE INTO sistema_config (chiave, valore, descrizione, categoria) VALUES 
('email_templates_path', '/templates/email/', 'Percorso template email', 'email'),
('contract_templates_path', '/templates/contracts/', 'Percorso template contratti', 'contracts'),
('automation_enabled', 'true', 'Sistema automazione attivo', 'automation'),
('lead_scoring_enabled', 'true', 'Calcolo lead score attivo', 'leads'),
('device_tracking_enabled', 'true', 'Tracking dispositivi attivo', 'dispositivi'),
('notification_email', 'info@medicagb.it', 'Email notifiche sistema', 'email'),
('system_timezone', 'Europe/Rome', 'Fuso orario sistema', 'general'),
('max_automation_attempts', '3', 'Tentativi massimi automazione', 'automation'),
('automation_retry_interval_hours', '24', 'Intervallo retry automazione (ore)', 'automation'),
('lead_conversion_threshold', '0.7', 'Soglia conversione lead', 'leads'),
('device_warranty_months', '24', 'Garanzia dispositivi (mesi)', 'dispositivi'),
('contract_expiry_days', '30', 'Giorni scadenza contratto non firmato', 'contracts'),
('email_rate_limit_per_hour', '100', 'Limite email per ora', 'email'),
('database_backup_enabled', 'true', 'Backup database automatico', 'backup'),
('audit_log_retention_days', '90', 'Giorni retention log audit', 'audit');

-- =====================================
-- AUDIT E STATISTICS
-- =====================================

-- Statistiche di sistema (verranno aggiornate automaticamente)
INSERT OR REPLACE INTO sistema_config (chiave, valore, descrizione, categoria) VALUES 
('total_leads_processed', '2', 'Totale lead processati', 'statistics'),
('total_emails_sent', '4', 'Totale email inviate', 'statistics'),
('total_contracts_generated', '1', 'Totale contratti generati', 'statistics'),
('total_devices_in_inventory', '2', 'Totale dispositivi in magazzino', 'statistics'),
('automation_success_rate', '0.95', 'Tasso successo automazioni', 'statistics'),
('last_stats_update', datetime('now'), 'Ultimo aggiornamento statistiche', 'statistics');

-- TeleMedCare V11.0 database seed completed successfully