-- Verifica i 3 contratti corretti (Locatelli, Pepe, Macchi)
SELECT 
  id,
  codice_contratto,
  leadId,
  tipo_contratto,
  servizio,
  piano,
  prezzo_mensile,
  prezzo_totale,
  data_scadenza,
  status,
  pdf_url,
  created_at,
  updated_at
FROM contracts
WHERE 
  (id LIKE 'CONTRACT_CTR-LOCATELLI-%' 
   OR id LIKE 'CONTRACT_CTR-PEPE-%' 
   OR id LIKE 'CONTRACT_CTR-MACCHI-%')
  AND id LIKE '%2026%'
ORDER BY created_at DESC;

-- Verifica che i vecchi contratti sbagliati siano stati cancellati
SELECT COUNT(*) as vecchi_contratti_sbagliati
FROM contracts
WHERE id LIKE 'contract-locatelli-%'
   OR id LIKE 'contract-pepe-%'
   OR id LIKE 'contract-macchi-%';
