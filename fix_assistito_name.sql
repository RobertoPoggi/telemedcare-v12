-- Correggi nome assistito per LEAD-IRBEMA-00258
-- L'assistito si chiama ROSARIA RESSA, non ANTONELLA MARIA RESSA

-- Prima verifica i dati attuali
SELECT 
  id,
  nomeRichiedente,
  cognomeRichiedente,
  nomeAssistito,        -- Attualmente: ANTONELLA MARIA (SBAGLIATO)
  cognomeAssistito,     -- Attualmente: RESSA (CORRETTO)
  intestatarioContratto
FROM leads 
WHERE id = 'LEAD-IRBEMA-00258';

-- Correggi il nome assistito
UPDATE leads 
SET nomeAssistito = 'ROSARIA',
    cognomeAssistito = 'RESSA',
    provinciaIntestatario = 'MI'  -- Approfitta per correggere anche la provincia
WHERE id = 'LEAD-IRBEMA-00258';

-- Verifica la correzione
SELECT 
  nomeRichiedente,      -- Deve essere: Roberto
  cognomeRichiedente,   -- Deve essere: Poggi
  nomeAssistito,        -- Deve essere: ROSARIA ✅
  cognomeAssistito,     -- Deve essere: RESSA ✅
  provinciaIntestatario -- Deve essere: MI ✅
FROM leads 
WHERE id = 'LEAD-IRBEMA-00258';
