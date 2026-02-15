# 🔧 Istruzioni Migrazione Database - Aggiungi Date Contratti

## ⚠️ Problema Attuale

Il database live **NON ha** i campi `data_firma` e `data_scadenza` nella tabella `contracts`.  
Questo impedisce:
- ❌ Inserimento contratti con date specifiche
- ❌ Aggiornamento date contratti esistenti
- ❌ Gestione corretta rinnovi
- ❌ Query per contratti in scadenza

## ✅ Soluzione: Migration 0003

La migration `migrations/0003_add_contract_dates.sql` aggiunge i campi mancanti.

---

## 📋 Step by Step

### **1. Verifica Database Cloudflare D1**

```bash
# Lista databases
wrangler d1 list

# Output atteso:
# ┌───────────────────┬──────────────────────────────────────┐
# │ Name              │ UUID                                 │
# ├───────────────────┼──────────────────────────────────────┤
# │ telemedcare-db    │ xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx │
# └───────────────────┴──────────────────────────────────────┘
```

### **2. Backup Database (Consigliato)**

```bash
# Export schema corrente
wrangler d1 execute telemedcare-db --remote --command="SELECT sql FROM sqlite_master WHERE type='table' AND name='contracts';" > backup_contracts_schema.sql

# Export dati contratti esistenti
wrangler d1 execute telemedcare-db --remote --command="SELECT * FROM contracts LIMIT 10;" > backup_contracts_sample.txt
```

### **3. Esegui Migration**

```bash
cd /path/to/telemedcare-v12

# Esegui migration su DATABASE REMOTO (produzione)
wrangler d1 execute telemedcare-db --remote --file=./migrations/0003_add_contract_dates.sql
```

**Output atteso:**
```
🌀 Executing on remote database telemedcare-db (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🚣 Executed 6 commands in 1.234s
```

### **4. Verifica Migration**

```bash
# Verifica che le colonne siano state aggiunte
wrangler d1 execute telemedcare-db --remote --command="PRAGMA table_info(contracts);" | grep data_

# Output atteso:
# | ... | data_firma    | TEXT | ... |
# | ... | data_scadenza | TEXT | ... |
```

```bash
# Verifica che i contratti esistenti abbiano le date
wrangler d1 execute telemedcare-db --remote --command="SELECT id, codice_contratto, data_firma, data_scadenza FROM contracts LIMIT 5;"
```

### **5. Re-deploy Applicazione**

Dopo la migration, ri-abilita i campi nel codice:

```bash
# L'applicazione è già aggiornata su GitHub
# Il prossimo deploy includerà i campi data_firma/data_scadenza
```

---

## 🧪 Test Post-Migration

### **Test 1: Inserimento Contratti**
1. Vai a: https://telemedcare-v12.pages.dev/test-insert-manual-contracts
2. Clicca "🚀 Inserisci Contratti nel Database"
3. Verifica: **"✅ Inseriti 3/3 contratti"** (nessun errore SQL)

### **Test 2: Aggiornamento Date**
1. Vai a: https://telemedcare-v12.pages.dev/test-update-contracts-dates
2. Clicca "🔄 Aggiorna Date Contratti"
3. Verifica: **"✅ Aggiornati 6/6 contratti"**

### **Test 3: Dashboard**
1. Vai a: https://telemedcare-v12.pages.dev/admin/leads-dashboard
2. Tab "Contratti" → verifica colonne `data_firma` e `data_scadenza` popolate

---

## 🔄 Rollback (Se Necessario)

Se la migration causa problemi:

```bash
# Rimuovi le colonne aggiunte
wrangler d1 execute telemedcare-db --remote --command="ALTER TABLE contracts DROP COLUMN data_firma;"
wrangler d1 execute telemedcare-db --remote --command="ALTER TABLE contracts DROP COLUMN data_scadenza;"

# Rimuovi indici
wrangler d1 execute telemedcare-db --remote --command="DROP INDEX IF EXISTS idx_contracts_data_firma;"
wrangler d1 execute telemedcare-db --remote --command="DROP INDEX IF EXISTS idx_contracts_data_scadenza;"
```

---

## 📊 Cosa Fa la Migration

1. **Aggiunge colonne**:
   - `data_firma TEXT` - Data firma contratto (formato: 2025-05-12)
   - `data_scadenza TEXT` - Data scadenza per rinnovo (formato: 2026-05-11)

2. **Crea indici** per query performanti su scadenze

3. **Popola date esistenti** da `created_at` + `durata_mesi`:
   ```sql
   data_firma = created_at
   data_scadenza = created_at + durata_mesi - 1 giorno
   ```

4. **Verifica** contratti in scadenza prossimi 90 giorni

---

## ✅ Checklist Completa

- [ ] Backup database eseguito
- [ ] Migration `0003_add_contract_dates.sql` eseguita su produzione
- [ ] Verifica colonne `data_firma` e `data_scadenza` esistono
- [ ] Verifica contratti esistenti hanno date popolate
- [ ] Test inserimento 3 nuovi contratti (Locatelli, Pepe, Macchi)
- [ ] Test aggiornamento 6 contratti esistenti (Capone, Pennacchio, Cozzi, King, Pizzutto, Balzarotti)
- [ ] Verifica dashboard mostra date corrette
- [ ] Sistema rinnovi abilitato

---

## 🆘 Supporto

Se riscontri errori durante la migration:
1. Controlla output comando `wrangler d1 execute`
2. Verifica nome database: `telemedcare-db`
3. Verifica permessi Cloudflare (deve essere owner o admin)
4. Esegui rollback e contatta supporto

---

## 📝 Note Tecniche

- **SQLite**: Cloudflare D1 usa SQLite, che supporta `ALTER TABLE ADD COLUMN`
- **Tipo TEXT**: Date salvate come stringa ISO 8601 (YYYY-MM-DD)
- **Indici**: Migliorano performance query per scadenze imminenti
- **Backward compatible**: Contratti senza date non causano errori

---

**Data creazione**: 2026-02-15  
**Versione**: 1.0  
**Autore**: TeleMedCare System
