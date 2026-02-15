-- Analizza i contratti corretti esistenti per capire il pattern
SELECT 
  id,
  codice_contratto,
  leadId,
  tipo_contratto,
  servizio,
  piano,
  prezzo_mensile,
  durata_mesi,
  prezzo_totale,
  data_scadenza,
  status,
  created_at,
  pdf_url,
  template_utilizzato
FROM contracts
WHERE codice_contratto LIKE 'CONTRACT_CTR-%'
ORDER BY created_at DESC
LIMIT 5;
