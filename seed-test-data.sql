-- Seed data for testing TeleMedCare V11.0

-- Lead 1: Nuovo lead
INSERT INTO leads (
    id, nomeRichiedente, cognomeRichiedente, emailRichiedente, 
    telefonoRichiedente, indirizzoRichiedente, pacchetto, status, timestamp
) VALUES (
    'LEAD_TEST_001',
    'Mario',
    'Rossi',
    'mario.rossi@example.com',
    '+39 333 1234567',
    'Via Roma 123, 00100 Roma',
    'BASE',
    'NUOVO',
    datetime('now', '-5 days')
);

-- Lead 2: Lead con contratto firmato
INSERT INTO leads (
    id, nomeRichiedente, cognomeRichiedente, emailRichiedente,
    telefonoRichiedente, indirizzoRichiedente, pacchetto, status, timestamp
) VALUES (
    'LEAD_TEST_002',
    'Giuseppe',
    'Verdi',
    'giuseppe.verdi@example.com',
    '+39 345 9876543',
    'Via Verdi 45, 20100 Milano',
    'AVANZATO',
    'CONTRATTO_FIRMATO',
    datetime('now', '-3 days')
);

-- Lead 3: Lead contattato
INSERT INTO leads (
    id, nomeRichiedente, cognomeRichiedente, emailRichiedente,
    telefonoRichiedente, indirizzoRichiedente, pacchetto, status, timestamp
) VALUES (
    'LEAD_TEST_003',
    'Anna',
    'Bianchi',
    'anna.bianchi@example.com',
    '+39 338 5551234',
    'Corso Italia 78, 10100 Torino',
    'BASE',
    'CONTATTATO',
    datetime('now', '-1 day')
);

-- Lead 4: Documenti inviati
INSERT INTO leads (
    id, nomeRichiedente, cognomeRichiedente, emailRichiedente,
    telefonoRichiedente, indirizzoRichiedente, pacchetto, status, timestamp
) VALUES (
    'LEAD_TEST_004',
    'Laura',
    'Ferrara',
    'laura.ferrara@example.com',
    '+39 340 7778899',
    'Via Dante 92, 50100 Firenze',
    'AVANZATO',
    'DOCUMENTI_INVIATI',
    datetime('now', '-2 hours')
);

-- Contract 1: Firmato (genera proforma automatica)
INSERT INTO contracts (
    id, lead_id, codice_contratto, piano_servizio, signature_status, contract_type,
    signature_date, created_at, updated_at
) VALUES (
    'CTR_TEST_001',
    'LEAD_TEST_002',
    'CTR_2025/0001',
    'AVANZATO',
    'FIRMATO',
    'AVANZATO',
    datetime('now', '-2 days'),
    datetime('now', '-3 days'),
    datetime('now', '-2 days')
);

-- Contract 2: In attesa firma
INSERT INTO contracts (
    id, lead_id, codice_contratto, piano_servizio, signature_status, contract_type,
    created_at, updated_at
) VALUES (
    'CTR_TEST_002',
    'LEAD_TEST_001',
    'CTR_2025/0002',
    'BASE',
    'INVIATO',
    'BASE',
    datetime('now', '-1 day'),
    datetime('now', '-1 day')
);

-- Proforma 1: In attesa pagamento (da contract 1)
INSERT INTO proforma (
    id, contract_id, lead_id, numero_proforma,
    data_emissione, data_scadenza,
    cliente_nome, cliente_cognome, cliente_email,
    tipo_servizio, prezzo_mensile, durata_mesi, prezzo_totale,
    status, created_at, updated_at
) VALUES (
    'PRF_TEST_001',
    'CTR_TEST_001',
    'LEAD_TEST_002',
    'PFM_2025/0001',
    date('now', '-2 days'),
    date('now', '+28 days'),
    'Giuseppe',
    'Verdi',
    'giuseppe.verdi@example.com',
    'AVANZATO',
    0,
    1,
    1024.80,
    'PENDING',
    datetime('now', '-2 days'),
    datetime('now', '-2 days')
);

-- Proforma 2: In attesa (esempio BASE)
INSERT INTO proforma (
    id, contract_id, lead_id, numero_proforma,
    data_emissione, data_scadenza,
    cliente_nome, cliente_cognome, cliente_email,
    tipo_servizio, prezzo_mensile, durata_mesi, prezzo_totale,
    status, created_at, updated_at
) VALUES (
    'PRF_TEST_002',
    'CTR_TEST_002',
    'LEAD_TEST_001',
    'PFM_2025/0002',
    date('now', '-1 day'),
    date('now', '+29 days'),
    'Mario',
    'Rossi',
    'mario.rossi@example.com',
    'BASE',
    0,
    1,
    585.60,
    'PENDING',
    datetime('now', '-1 day'),
    datetime('now', '-1 day')
);
