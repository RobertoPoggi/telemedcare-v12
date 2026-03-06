# 🔧 Istruzioni Database - Configurazioni

## ⚠️ IMPORTANTE: Se tabella è vuota, USA DB_RECREATE_configurations.sql

Se la tabella `configurations` è **vuota** (nessun dato), è più semplice **ricrearla** invece di fare ALTER TABLE.

## Problema
Il form configurazione usa nomi di colonne:
- `contatto1_nome`, `contatto1_cognome`, `contatto1_telefono`, `contatto1_email`
- `whitelist1_nome`, `whitelist1_cognome`, `whitelist1_telefono`, `whitelist1_email` (×3)

Ma lo schema DB originale usa:
- `contatto_emergenza_1_nome`, `contatto_emergenza_1_telefono`, `contatto_emergenza_1_relazione`

## Soluzione - RICREAZIONE (tabella vuota)

### ⭐ METODO RACCOMANDATO: Ricreazione Tabella (se vuota)

1. Vai su https://dash.cloudflare.com
2. Seleziona il progetto `telemedcare-v12`
3. Vai su **Workers & Pages** → **D1 Database**
4. Seleziona il database
5. Vai su **Console**
6. **Copia e incolla TUTTO il contenuto di** `DB_RECREATE_configurations.sql`
7. Clicca **Execute**
8. Verifica: `SELECT COUNT(*) FROM configurations;` (dovrebbe essere 0)

**Vantaggi:**
- ✅ Schema pulito e corretto
- ✅ Nomi colonne consistenti con il codice
- ✅ Nessun problema di compatibilità

---

### Opzione Alternativa: Via Cloudflare Dashboard (ALTER TABLE)

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
