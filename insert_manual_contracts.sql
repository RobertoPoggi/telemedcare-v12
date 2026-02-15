-- Script per inserire i 3 contratti manuali nel database

-- 1. GIOVANNI LOCATELLI - BASE - SIDLY VITAL CARE
-- Prima verifico/creo il lead
INSERT OR IGNORE INTO leads (
  id,
  nomeRichiedente,
  cognomeRichiedente,
  email,
  telefono,
  servizio,
  piano,
  dispositivo,
  vuoleContratto,
  statoLead,
  dataCreazione
) VALUES (
  'LEAD-MANUAL-LOCATELLI-' || strftime('%s', 'now') || '000',
  'Giovanni',
  'LOCATELLI',
  'giovanni.locatelli@example.com',
  '+39 333 0000001',
  'eCura PRO',
  'BASE',
  'SIDLY VITAL CARE',
  1,
  'COMPLETO',
  '2026-02-03'
);

-- Inserisco il contratto per Locatelli
INSERT INTO contracts (
  id,
  leadId,
  codice_contratto,
  servizio,
  piano,
  dispositivo,
  prezzo_base,
  prezzo_totale,
  status,
  data_creazione,
  data_firma,
  data_inizio_validita,
  data_scadenza_validita
) VALUES (
  'contract-locatelli-' || strftime('%s', 'now') || '001',
  (SELECT id FROM leads WHERE cognomeRichiedente = 'LOCATELLI' AND nomeRichiedente = 'Giovanni' LIMIT 1),
  'CONTRACT_CTR-LOCATELLI-2026_' || strftime('%s', 'now') || '001',
  'eCura PRO',
  'BASE',
  'SIDLY VITAL CARE',
  480.00,
  585.60,
  'SIGNED',
  '2026-02-03',
  '2026-02-03',
  '2026-02-03',
  '2027-02-02'
);

-- 2. FRANCESCO PEPE
INSERT OR IGNORE INTO leads (
  id,
  nomeRichiedente,
  cognomeRichiedente,
  email,
  telefono,
  servizio,
  piano,
  vuoleContratto,
  statoLead,
  dataCreazione
) VALUES (
  'LEAD-MANUAL-PEPE-' || strftime('%s', 'now') || '002',
  'Francesco',
  'PEPE',
  'francesco.pepe@example.com',
  '+39 333 0000002',
  'eCura PRO',
  'BASE',
  1,
  'COMPLETO',
  '2026-01-27'
);

INSERT INTO contracts (
  id,
  leadId,
  codice_contratto,
  servizio,
  piano,
  prezzo_base,
  prezzo_totale,
  status,
  data_creazione,
  data_firma,
  data_inizio_validita,
  data_scadenza_validita
) VALUES (
  'contract-pepe-' || strftime('%s', 'now') || '002',
  (SELECT id FROM leads WHERE cognomeRichiedente = 'PEPE' AND nomeRichiedente = 'Francesco' LIMIT 1),
  'CONTRACT_CTR-PEPE-2026_' || strftime('%s', 'now') || '002',
  'eCura PRO',
  'BASE',
  480.00,
  585.60,
  'SIGNED',
  '2026-01-27',
  '2026-01-27',
  '2026-01-27',
  '2027-01-26'
);

-- 3. CLAUDIO MACCHI
INSERT OR IGNORE INTO leads (
  id,
  nomeRichiedente,
  cognomeRichiedente,
  email,
  telefono,
  servizio,
  piano,
  vuoleContratto,
  statoLead,
  dataCreazione
) VALUES (
  'LEAD-MANUAL-MACCHI-' || strftime('%s', 'now') || '003',
  'Claudio',
  'MACCHI',
  'claudio.macchi@example.com',
  '+39 333 0000003',
  'eCura PRO',
  'BASE',
  1,
  'COMPLETO',
  '2026-02-01'
);

INSERT INTO contracts (
  id,
  leadId,
  codice_contratto,
  servizio,
  piano,
  prezzo_base,
  prezzo_totale,
  status,
  data_creazione,
  data_firma,
  data_inizio_validita,
  data_scadenza_validita
) VALUES (
  'contract-macchi-' || strftime('%s', 'now') || '003',
  (SELECT id FROM leads WHERE cognomeRichiedente = 'MACCHI' AND nomeRichiedente = 'Claudio' LIMIT 1),
  'CONTRACT_CTR-MACCHI-2026_' || strftime('%s', 'now') || '003',
  'eCura PRO',
  'BASE',
  480.00,
  585.60,
  'SIGNED',
  '2026-02-01',
  '2026-02-01',
  '2026-02-01',
  '2027-01-31'
);

-- Query di verifica
SELECT 'LEADS INSERITI:' as info;
SELECT id, nomeRichiedente, cognomeRichiedente, email, servizio, piano, statoLead, dataCreazione 
FROM leads 
WHERE cognomeRichiedente IN ('LOCATELLI', 'PEPE', 'MACCHI')
ORDER BY dataCreazione DESC;

SELECT 'CONTRATTI INSERITI:' as info;
SELECT id, leadId, codice_contratto, servizio, piano, prezzo_totale, status, data_firma 
FROM contracts 
WHERE codice_contratto LIKE '%LOCATELLI%' 
   OR codice_contratto LIKE '%PEPE%' 
   OR codice_contratto LIKE '%MACCHI%'
ORDER BY data_creazione DESC;
