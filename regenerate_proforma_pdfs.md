# Script per Rigenerare PDF Proforma

## Problema
Le proforma nel database hanno il campo `content` (PDF) a NULL perché:
1. Il PDF viene generato dopo l'INSERT
2. Se l'email fallisce, l'UPDATE del PDF non viene eseguito

## Soluzione Temporanea
Per le proforma esistenti, bisogna rigenerare manualmente i PDF.

## Verifica Proforma senza PDF
```sql
SELECT id, numero_proforma, cliente_nome, cliente_cognome, 
       LENGTH(content) as pdf_size, prezzo_totale
FROM proforma
WHERE content IS NULL OR content = '';
```

## Come Rigenerare (Manuale via Dashboard)
1. Aprire la dashboard admin
2. Andare alla tab "Proforma"
3. Per ogni proforma, cliccare su "Reinvia Email"
4. Questo farà:
   - Rigenerare il PDF
   - Salvare nel database (campo `content`)
   - Reinviare l'email al cliente

## Fix Permanente Applicato
Il codice è già corretto in `src/modules/admin-api.ts`:
- Linea 450-462: UPDATE proforma SET content = ? dopo la generazione PDF
- Il problema era che se l'email falliva, l'UPDATE non veniva eseguito

## Note
- Le API keys SendGrid e Resend sono configurate in `.dev.vars`
- Il reinvio email dovrebbe funzionare correttamente ora
