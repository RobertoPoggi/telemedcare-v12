-- Fix proforma amounts to correct prices
-- BASE: €480 + IVA 22% = €585.60
-- AVANZATO: €840 + IVA 22% = €1,024.80

-- Fix PFM_2025/0001 (AVANZATO - Roberto Poggi)
UPDATE proforma 
SET 
  prezzo_totale = 1024.80,
  prezzo_mensile = 0,
  durata_mesi = 1
WHERE numero_proforma = 'PFM_2025/0001';

-- Fix PFM_2025/0002 (BASE - Test PortaAutomatica)
UPDATE proforma 
SET 
  prezzo_totale = 585.60,
  prezzo_mensile = 0,
  durata_mesi = 1
WHERE numero_proforma = 'PFM_2025/0002';

-- Verifica
SELECT 
  numero_proforma,
  tipo_servizio,
  prezzo_totale,
  prezzo_mensile,
  durata_mesi
FROM proforma
ORDER BY created_at DESC;
