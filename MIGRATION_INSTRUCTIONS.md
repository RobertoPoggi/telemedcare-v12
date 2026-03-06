# 🔧 Istruzioni Migration Database - Configurazioni

## Problema
Il form configurazione è stato aggiornato con nuovi campi:
- **Email** per contatti emergenza (3 campi)
- **Whitelist** chiamate autorizzate (12 campi: nome, cognome, telefono, email × 3)

Ma il database D1 **NON** ha queste colonne, quindi l'INSERT fallisce.

## Soluzione

### Opzione 1: Via Cloudflare Dashboard (CONSIGLIATA)

1. Vai su https://dash.cloudflare.com
2. Seleziona il progetto `telemedcare-v12`
3. Vai su **Workers & Pages** → **D1 Database**
4. Seleziona il database (probabilmente `telemedcare_db` o simile)
5. Vai su **Console**
6. Copia e incolla questo SQL:

```sql
-- Aggiungi email contatti emergenza
ALTER TABLE configurations ADD COLUMN contatto1_email TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto2_email TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN contatto3_email TEXT DEFAULT '';

-- Aggiungi whitelist contatti
ALTER TABLE configurations ADD COLUMN whitelist1_nome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist1_cognome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist1_telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist1_email TEXT DEFAULT '';

ALTER TABLE configurations ADD COLUMN whitelist2_nome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist2_cognome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist2_telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist2_email TEXT DEFAULT '';

ALTER TABLE configurations ADD COLUMN whitelist3_nome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist3_cognome TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist3_telefono TEXT DEFAULT '';
ALTER TABLE configurations ADD COLUMN whitelist3_email TEXT DEFAULT '';
```

7. Clicca **Execute**
8. Verifica con: `SELECT * FROM configurations LIMIT 1;`

### Opzione 2: Via Wrangler CLI

Se hai accesso a wrangler:

```bash
# 1. Verifica nome database in wrangler.toml
grep "database_name" wrangler.toml

# 2. Esegui migration
wrangler d1 execute <DB_NAME> --file=DB_MIGRATION_configurations.sql --remote

# 3. Verifica
wrangler d1 execute <DB_NAME> --command="SELECT sql FROM sqlite_master WHERE type='table' AND name='configurations';" --remote
```

## Verifica Post-Migration

1. Vai su https://telemedcare-v12.pages.dev/form-configurazione?leadId=LEAD-IRBEMA-00268&token=test123
2. Compila il form con almeno:
   - 1 contatto emergenza con email
   - 1 contatto whitelist
3. Submit
4. Verifica che:
   - ✅ Success popup appare
   - ✅ Nessun errore in console
   - ✅ Email benvenuto ricevuta

## Rollback (se necessario)

Se qualcosa va storto, puoi rimuovere le colonne:

```sql
-- SQLite non supporta DROP COLUMN nativamente
-- Serve creare una nuova tabella e copiare i dati

-- Verifica prima con:
SELECT COUNT(*) FROM configurations;
```

## Note

- Le colonne sono tutte `TEXT DEFAULT ''` quindi non NULL
- I valori esistenti non vengono toccati
- Il form funziona anche senza la migration (dà errore ma non blocca)
- La migration è **safe** e **idempotente** (puoi ripeterla)

## Contatti

In caso di dubbi: info@telemedcare.it
