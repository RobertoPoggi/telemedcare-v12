-- Aggiorna gli indirizzi email di test con email reale per testing

-- Qual è la tua email? Sostituisci con il tuo indirizzo:
-- UPDATE leads SET emailRichiedente = 'TUA_EMAIL@example.com' WHERE id IN ('LEAD_TEST_001', 'LEAD_TEST_002', 'LEAD_TEST_003', 'LEAD_TEST_004');

-- Per ora uso rpoggi55@gmail.com (visto nel database precedente)
UPDATE leads 
SET emailRichiedente = 'rpoggi55@gmail.com' 
WHERE id IN ('LEAD_TEST_001', 'LEAD_TEST_002', 'LEAD_TEST_003', 'LEAD_TEST_004');

-- Aggiorna anche i contratti
UPDATE contracts 
SET intestatario = 'Roberto Poggi'
WHERE lead_id IN (SELECT id FROM leads WHERE emailRichiedente = 'rpoggi55@gmail.com');

-- Aggiorna le proforma
UPDATE proforma 
SET cliente_email = 'rpoggi55@gmail.com'
WHERE lead_id IN (SELECT id FROM leads WHERE emailRichiedente = 'rpoggi55@gmail.com');

-- Verifica
SELECT 
    l.id,
    l.nomeRichiedente,
    l.cognomeRichiedente,
    l.emailRichiedente,
    l.status
FROM leads l
ORDER BY l.timestamp DESC;
