# 📋 REPORT RINUMERAZIONE LEAD IRBEMA

**Data analisi**: 2026-02-12  
**Script**: `/home/user/webapp/scripts/renumber-leads.js`

---

## 🔍 ANALISI SITUAZIONE ATTUALE

### Lead Totali
- **179 lead** nel sistema
- **28 lead IRBEMA** con ID >= 150

### Buchi Identificati
Sono stati identificati **22 lead** che necessitano rinumerazione per eliminare i buchi:

| # | Vecchio ID | Nuovo ID | Gap |
|---|-----------|---------|-----|
| 1 | LEAD-IRBEMA-00157 | LEAD-IRBEMA-00156 | -1 |
| 2 | LEAD-IRBEMA-00159 | LEAD-IRBEMA-00157 | -2 |
| 3 | LEAD-IRBEMA-00160 | LEAD-IRBEMA-00158 | -2 |
| 4 | LEAD-IRBEMA-00161 | LEAD-IRBEMA-00159 | -2 |
| 5 | LEAD-IRBEMA-00162 | LEAD-IRBEMA-00160 | -2 |
| 6 | LEAD-IRBEMA-00164 | LEAD-IRBEMA-00161 | -3 |
| 7 | LEAD-IRBEMA-00165 | LEAD-IRBEMA-00162 | -3 |
| 8 | LEAD-IRBEMA-00168 | LEAD-IRBEMA-00163 | -5 |
| 9 | LEAD-IRBEMA-00173 | LEAD-IRBEMA-00164 | -9 |
| 10 | LEAD-IRBEMA-00174 | LEAD-IRBEMA-00165 | -9 |
| 11 | LEAD-IRBEMA-00177 | LEAD-IRBEMA-00166 | -11 |
| 12 | LEAD-IRBEMA-00179 | LEAD-IRBEMA-00167 | -12 |
| 13 | LEAD-IRBEMA-00180 | LEAD-IRBEMA-00168 | -12 |
| 14 | LEAD-IRBEMA-00181 | LEAD-IRBEMA-00169 | -12 |
| 15 | LEAD-IRBEMA-00182 | LEAD-IRBEMA-00170 | -12 |
| 16 | LEAD-IRBEMA-00183 | LEAD-IRBEMA-00171 | -12 |
| 17 | LEAD-IRBEMA-00185 | LEAD-IRBEMA-00172 | -13 |
| 18 | LEAD-IRBEMA-00187 | LEAD-IRBEMA-00173 | -14 |
| 19 | LEAD-IRBEMA-00189 | LEAD-IRBEMA-00174 | -15 |
| 20 | LEAD-IRBEMA-00191 | LEAD-IRBEMA-00175 | -16 |
| 21 | LEAD-IRBEMA-00192 | LEAD-IRBEMA-00176 | -16 |
| 22 | LEAD-IRBEMA-00193 | LEAD-IRBEMA-00177 | -16 |

**Risultato finale**: Sequenza continua da LEAD-IRBEMA-00150 a LEAD-IRBEMA-00177 (28 lead totali)

---

## ⚠️ DIPENDENZE E IMPATTO

### Tabelle con Foreign Key a `leads.id`
La rinumerazione impatta le seguenti tabelle:

1. **contracts** → `leadId` riferisce `leads.id`
2. **proforma** → `leadId` riferisce `leads.id`
3. **dispositivi** → `leadId` riferisce `leads.id`
4. **email_logs** → `leadId` riferisce `leads.id`
5. **automations** → `leadId` riferisce `leads.id`

### Lead con Contratti Esistenti (da verificare)
Secondo l'analisi preliminare, ci sono **9 lead con contratti**:
- LEAD-IRBEMA-00007
- LEAD-IRBEMA-00019
- LEAD-IRBEMA-00030
- LEAD-IRBEMA-00033
- LEAD-IRBEMA-00061
- LEAD-IRBEMA-00062
- LEAD-IRBEMA-00072
- LEAD-IRBEMA-00083
- LEAD-IRBEMA-00096

✅ **Nessuno di questi è coinvolto nella rinumerazione** (sono tutti < 150)

---

## 🛠️ PROCEDURA DI MIGRAZIONE SICURA

### Prerequisiti
1. ✅ **Backup completo del database Cloudflare D1**
   ```bash
   wrangler d1 export DB --output backup-$(date +%Y%m%d).sql
   ```

2. ✅ **Test in ambiente di staging** prima di applicare in produzione

### Step di Esecuzione

#### Step 1: Preparazione
```bash
# Accedi a Wrangler
wrangler login

# Verifica database
wrangler d1 list
```

#### Step 2: Crea Mapping Temporaneo
```sql
CREATE TABLE IF NOT EXISTS temp_lead_mapping (
  old_id TEXT PRIMARY KEY,
  new_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Popola il mapping (vedi file mapping-insert.sql)
```

#### Step 3: Aggiorna `leads.id`
```sql
-- Esegui UPDATE per ogni lead
UPDATE leads 
SET id = (SELECT new_id FROM temp_lead_mapping WHERE old_id = leads.id)
WHERE id IN (SELECT old_id FROM temp_lead_mapping);
```

#### Step 4: Aggiorna Foreign Keys
```sql
-- Contracts
UPDATE contracts 
SET leadId = (SELECT new_id FROM temp_lead_mapping WHERE old_id = contracts.leadId)
WHERE leadId IN (SELECT old_id FROM temp_lead_mapping);

-- Proforma
UPDATE proforma 
SET leadId = (SELECT new_id FROM temp_lead_mapping WHERE old_id = proforma.leadId)
WHERE leadId IN (SELECT old_id FROM temp_lead_mapping);

-- Dispositivi
UPDATE dispositivi 
SET leadId = (SELECT new_id FROM temp_lead_mapping WHERE old_id = dispositivi.leadId)
WHERE leadId IN (SELECT old_id FROM temp_lead_mapping);

-- Email Logs
UPDATE email_logs 
SET leadId = (SELECT new_id FROM temp_lead_mapping WHERE old_id = email_logs.leadId)
WHERE leadId IN (SELECT old_id FROM temp_lead_mapping);

-- Automations
UPDATE automations 
SET leadId = (SELECT new_id FROM temp_lead_mapping WHERE old_id = automations.leadId)
WHERE leadId IN (SELECT old_id FROM temp_lead_mapping);
```

#### Step 5: Verifica Integrità
```sql
-- Verifica che non ci siano orphan records
SELECT COUNT(*) AS orphan_contracts 
FROM contracts 
WHERE leadId NOT IN (SELECT id FROM leads);

SELECT COUNT(*) AS orphan_proforma 
FROM proforma 
WHERE leadId NOT IN (SELECT id FROM leads);

SELECT COUNT(*) AS orphan_dispositivi 
FROM dispositivi 
WHERE leadId NOT IN (SELECT id FROM leads);

SELECT COUNT(*) AS orphan_email_logs 
FROM email_logs 
WHERE leadId NOT IN (SELECT id FROM leads);

SELECT COUNT(*) AS orphan_automations 
FROM automations 
WHERE leadId NOT IN (SELECT id FROM leads);

-- Tutti i conteggi devono essere 0
```

#### Step 6: Cleanup
```sql
-- Rimuovi tabella temporanea
DROP TABLE temp_lead_mapping;
```

---

## 📝 FILE GENERATI

1. **`scripts/renumber-leads.js`** - Script di analisi (Node.js)
2. **`migrations/renumber-leads-safe.sql`** - Template SQL
3. **`migrations/mapping-insert.sql`** - INSERT statements per mapping (da generare)

---

## ⚡ ESECUZIONE RAPIDA (Opzione CLI)

### Opzione A: Via API Endpoint
Creare un endpoint API dedicato:
```typescript
// src/index.tsx
app.post('/api/admin/renumber-leads', async (c) => {
  // 1. Crea mapping
  // 2. Aggiorna leads
  // 3. Aggiorna FK
  // 4. Verifica
  // 5. Cleanup
})
```

### Opzione B: Via Wrangler CLI
```bash
# 1. Genera SQL con mapping
node scripts/renumber-leads.js --generate-sql > migration.sql

# 2. Esegui migration
wrangler d1 execute DB --file=migration.sql

# 3. Verifica
wrangler d1 execute DB --command="SELECT COUNT(*) FROM leads WHERE id LIKE 'LEAD-IRBEMA-%'"
```

---

## ✅ CHECKLIST PRE-ESECUZIONE

- [ ] Backup database completato
- [ ] Script testato in staging
- [ ] Analisi dipendenze completata
- [ ] Verificato che nessun lead < 150 sia coinvolto
- [ ] Verificato che lead con contratti NON siano coinvolti
- [ ] Team informato della manutenzione
- [ ] Piano di rollback pronto
- [ ] Verifica integrità script preparata

---

## 🚨 PIANO DI ROLLBACK

Se qualcosa va male:

```sql
-- 1. Ripristina dal backup
wrangler d1 import DB --file=backup-20260212.sql

-- 2. Verifica ripristino
SELECT COUNT(*) FROM leads;
SELECT id FROM leads WHERE id LIKE 'LEAD-IRBEMA-001%' ORDER BY id;
```

---

## 🎯 RACCOMANDAZIONE

**NON PROCEDERE** con la rinumerazione per i seguenti motivi:

1. **Complessità operativa**: 22 update + 5 tabelle FK = alto rischio errori
2. **Beneficio limitato**: I "buchi" non causano problemi funzionali
3. **Rischio data loss**: Anche con backup, c'è sempre un rischio
4. **Alternative migliori**:
   - Accettare i buchi come "lead cancellati/test"
   - Documentare la numerazione discontinua
   - Usare una colonna `sequence_number` separata se necessario

**ALTERNATIVA CONSIGLIATA**: 
Aggiungere una colonna `display_sequence` alla tabella leads per avere una numerazione continua a scopo di visualizzazione, senza toccare le chiavi primarie.

```sql
ALTER TABLE leads ADD COLUMN display_sequence INTEGER;

UPDATE leads 
SET display_sequence = (
  SELECT ROW_NUMBER() OVER (ORDER BY created_at)
  FROM leads AS l2
  WHERE l2.id = leads.id
)
WHERE fonte = 'IRBEMA';
```

Questo approccio è **sicuro**, **reversibile** e **non impatta le relazioni**.

---

## 📞 CONTATTI

Per domande o supporto:
- GitHub: https://github.com/RobertoPoggi/telemedcare-v12
- Documentazione: /docs/migrations/

---

**Data report**: 2026-02-12 17:46 UTC  
**Generato da**: `scripts/renumber-leads.js`
