-- =============================================
-- TELEMEDCARE V11.0 - DATI DI TEST OPERATIVI
-- =============================================
-- Popolazione database con dati realistici per test end-to-end
-- Data: 2025-10-17
-- =============================================

-- Inserimento dispositivi TeleMedCare
INSERT INTO devices (imei, serial_number, modello, versione_firmware, status, note) VALUES
('356938035643809', 'TMC001', 'SiDLY Care Pro', 'v2.1.3', 'INVENTORY', 'Dispositivo nuovo in magazzino'),
('356938035643810', 'TMC002', 'SiDLY Care Pro', 'v2.1.3', 'INVENTORY', 'Dispositivo nuovo in magazzino'),
('356938035643811', 'TMC003', 'SiDLY Care Pro', 'v2.1.3', 'INVENTORY', 'Dispositivo nuovo in magazzino'),
('356938035643812', 'TMC004', 'SiDLY Care Pro', 'v2.1.3', 'INVENTORY', 'Dispositivo nuovo in magazzino'),
('356938035643813', 'TMC005', 'SiDLY Care Pro', 'v2.1.3', 'INVENTORY', 'Dispositivo nuovo in magazzino'),
('356938035643814', 'TMC006', 'SiDLY Care Pro', 'v2.1.2', 'MAINTENANCE', 'In manutenzione - aggiornamento firmware'),
('356938035643815', 'TMC007', 'SiDLY Care Pro', 'v2.1.3', 'INVENTORY', 'Dispositivo nuovo in magazzino'),
('356938035643816', 'TMC008', 'SiDLY Care Pro', 'v2.1.3', 'INVENTORY', 'Dispositivo nuovo in magazzino'),
('356938035643817', 'TMC009', 'SiDLY Care Pro', 'v2.1.3', 'INVENTORY', 'Dispositivo nuovo in magazzino'),
('356938035643818', 'TMC010', 'SiDLY Care Pro', 'v2.1.3', 'INVENTORY', 'Dispositivo nuovo in magazzino');

-- Test Lead da Landing Page (acquisizione organica)
INSERT INTO leads (id, nomeRichiedente, cognomeRichiedente, email, telefono, nomeAssistito, cognomeAssistito, etaAssistito, fonte, tipoServizio, vuoleBrochure, vuoleManuale, vuoleContratto, consensoPrivacy, consensoMarketing, status) VALUES
('LEAD_LANDING_001', 'Mario', 'Rossi', 'mario.rossi@email.it', '+39 339 1234567', 'Anna', 'Rossi', 78, 'LANDING_PAGE', 'BASE', 'Si', 'Si', 'Si', true, true, 'NEW'),
('LEAD_LANDING_002', 'Giulia', 'Verdi', 'giulia.verdi@gmail.com', '+39 347 2345678', 'Giuseppe', 'Verdi', 82, 'LANDING_PAGE', 'AVANZATO', 'Si', 'No', 'Si', true, false, 'NEW'),
('LEAD_LANDING_003', 'Francesco', 'Bianchi', 'f.bianchi@yahoo.it', '+39 335 3456789', 'Maria', 'Bianchi', 75, 'LANDING_PAGE', 'BASE', 'No', 'No', 'Si', true, true, 'NEW');

-- Test Leads da IRBEMA (fonte esterna)
INSERT INTO leads (id, nomeRichiedente, cognomeRichiedente, email, telefono, fonte, tipoServizio, vuoleContratto, consensoPrivacy, status, external_source_id, external_data) VALUES
('LEAD_IRBEMA_001', 'Alessandro', 'Neri', 'a.neri@libero.it', '+39 328 4567890', 'IRBEMA', 'BASE', 'Si', true, 'NEW', 'IRB_2024_001', '{"fonte_campagna": "Email Marketing Q4", "score": 85, "interesse": "alto"}'),
('LEAD_IRBEMA_002', 'Lucia', 'Ferrari', 'lucia.ferrari@outlook.com', '+39 342 5678901', 'IRBEMA', 'AVANZATO', 'Si', true, 'NEW', 'IRB_2024_002', '{"fonte_campagna": "Webinar Telemedicina", "score": 92, "interesse": "molto_alto"}');

-- Test Leads da Luxottica (fonte esterna)  
INSERT INTO leads (id, nomeRichiedente, cognomeRichiedente, email, telefono, fonte, tipoServizio, vuoleContratto, consensoPrivacy, status, external_source_id, external_data) VALUES
('LEAD_LUXOTTICA_001', 'Roberto', 'Romano', 'r.romano@email.com', '+39 333 6789012', 'LUXOTTICA', 'BASE', 'Si', true, 'NEW', 'LUX_EMP_001', '{"dipendente_id": "LUX001234", "reparto": "Produzione", "anni_servizio": 15}'),
('LEAD_LUXOTTICA_002', 'Paola', 'Russo', 'paola.russo@luxottica.com', '+39 349 7890123', 'LUXOTTICA', 'AVANZATO', 'Si', true, 'NEW', 'LUX_EMP_002', '{"dipendente_id": "LUX005678", "reparto": "Amministrazione", "anni_servizio": 8}');

-- Test Leads da Pirelli (fonte esterna)
INSERT INTO leads (id, nomeRichiedente, cognomeRichiedente, email, telefono, fonte, tipoServizio, vuoleContratto, consensoPrivacy, status, external_source_id, external_data) VALUES
('LEAD_PIRELLI_001', 'Marco', 'Colombo', 'm.colombo@pirelli.com', '+39 338 8901234', 'PIRELLI', 'BASE', 'Si', true, 'NEW', 'PIR_EMP_001', '{"employee_code": "PIR789012", "location": "Milano", "department": "R&D"}'),
('LEAD_PIRELLI_002', 'Elena', 'Conti', 'e.conti@email.it', '+39 345 9012345', 'PIRELLI', 'AVANZATO', 'Si', true, 'NEW', 'PIR_EMP_002', '{"employee_code": "PIR345678", "location": "Roma", "department": "Sales"}');

-- Test Leads da FAS (fonte esterna)
INSERT INTO leads (id, nomeRichiedente, cognomeRichiedente, email, telefono, fonte, tipoServizio, vuoleContratto, consensoPrivacy, status, external_source_id, external_data) VALUES
('LEAD_FAS_001', 'Stefano', 'Marino', 'stefano.marino@fas.it', '+39 331 0123456', 'FAS', 'BASE', 'Si', true, 'NEW', 'FAS_BEN_001', '{"beneficiario_id": "FAS2024001", "categoria": "Pensionato", "anni_contributi": 40}'),
('LEAD_FAS_002', 'Carla', 'Ricci', 'c.ricci@gmail.com', '+39 346 1234567', 'FAS', 'AVANZATO', 'Si', true, 'NEW', 'FAS_BEN_002', '{"beneficiario_id": "FAS2024002", "categoria": "Disabile", "percentuale_invalidita": 75}');