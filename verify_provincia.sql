-- Verifica dati lead LEAD-IRBEMA-00258
-- Controllare che provinciaIntestatario sia MI (non GE!)

SELECT 
  id,
  nomeRichiedente,
  cognomeRichiedente,
  cittaIntestatario,
  provinciaIntestatario,
  indirizzoIntestatario,
  capIntestatario,
  
  nomeAssistito,
  cognomeAssistito,
  cittaAssistito,
  provinciaAssistito,
  
  intestatarioContratto
FROM leads 
WHERE id = 'LEAD-IRBEMA-00258';

-- Se provinciaIntestatario = 'GE' invece di 'MI', eseguire:
-- UPDATE leads SET provinciaIntestatario = 'MI' WHERE id = 'LEAD-IRBEMA-00258';
