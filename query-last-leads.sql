-- Query ultimi 50 lead caricati nel sistema
SELECT 
    id,
    nomeRichiedente,
    cognomeRichiedente,
    email,
    telefono,
    servizio,
    piano,
    status,
    source,
    created_at,
    updated_at
FROM leads 
ORDER BY created_at DESC 
LIMIT 50;
