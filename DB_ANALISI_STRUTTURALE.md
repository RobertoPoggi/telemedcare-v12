# Analisi Strutturale Database — TeleMedCare V12
**Data analisi:** 2026-07-01  
**Autore:** AI Developer  
**Stato:** BOZZA — da validare prima di qualsiasi intervento

---

## 0. Premessa metodologica

Questo documento NON autorizza alcuna modifica al database.  
Qualsiasi intervento richiede:
1. Validazione e approvazione di questo documento
2. Backup completo del DB D1 di produzione
3. Piano di migrazione testato su DB di preview
4. Finestra di manutenzione concordata
5. Piano di rollback

---

## 1. Inventario tabelle

| # | Tabella | Definita in | Note |
|---|---------|-------------|------|
| 1 | `leads` | `src/dashboard.tsx` (2 volte: righe 1388, 2319) | Schema base + ALTER TABLE sparsi |
| 2 | `contracts` | `src/index.tsx` (righe 5638, 27681) + `src/dashboard.tsx` | **3 definizioni diverse** |
| 3 | `ddts` | `src/index.tsx` (righe 1179, 28951) | **2 definizioni diverse** |
| 4 | `assistiti` | `src/index.tsx` riga 17384 | Schema base incompleto + ALTER TABLE |
| 5 | `configurations` | `src/index.tsx` riga 17577 | Ricreata con DROP/CREATE in passato |
| 6 | `dispositivi` | `src/index.tsx` riga 23100 | Schema semplice |
| 7 | `proforma` | Nessun CREATE TABLE esplicito trovato | Esiste in produzione, creata storicamente |
| 8 | `rate_pagamento` | `src/index.tsx` righe 22069, 22525 | **2 definizioni** |
| 9 | `discount_codes` | `src/index.tsx` riga 21939 | OK |
| 10 | `lead_discounts` | `src/index.tsx` riga 22008 | OK |
| 11 | `lead_interactions` | `src/index.tsx` riga 657 | OK, ha FK corretta |
| 12 | `lead_completion_tokens` | `src/index.tsx` riga 1093 | OK, ha FK corretta |
| 13 | `lead_completion_log` | `src/index.tsx` riga 1133 | OK, ha FK corrette |
| 14 | `contract_otps` | `src/index.tsx` riga 1155 | OK |
| 15 | `users` | `src/index.tsx` righe 1030, 5576 | **2 definizioni** |
| 16 | `settings` | `src/index.tsx` riga 1061 | OK (key-value store) |
| 17 | `system_config` | `src/index.tsx` riga 1112 + `src/modules/lead-config.ts` | **2 definizioni** |
| 18 | `document_templates` | `src/index.tsx` riga 5684 | OK |
| 19 | `document_repository` | `src/index.tsx` riga 6656 | OK |
| 20 | `automation_tasks` | `src/dashboard.tsx` riga 1412 | Solo in dashboard legacy |
| 21 | `stats` | `src/index.tsx` riga 21754 | Singleton (id=1), uso limitato |
| 22 | `documentation_sections` | `src/modules/documentation-manager.ts` | OK |

**Tabelle principali del dominio business: 7**  
(`leads`, `contracts`, `ddts`, `assistiti`, `configurations`, `dispositivi`, `proforma`)

---

## 2. Analisi dettagliata per tabella

---

### 2.1 `leads`

**Schema base attuale** (da `src/dashboard.tsx`):
```sql
id TEXT PRIMARY KEY,
nomeRichiedente TEXT NOT NULL,      -- ⚠️ camelCase
cognomeRichiedente TEXT NOT NULL,   -- ⚠️ camelCase
email TEXT NOT NULL,
telefono TEXT NOT NULL,
nomeAssistito TEXT NOT NULL,        -- ⚠️ camelCase
cognomeAssistito TEXT NOT NULL,     -- ⚠️ camelCase
dataNascitaAssistito DATE,          -- ⚠️ camelCase
luogoNascitaAssistito TEXT,         -- ⚠️ camelCase
etaAssistito TEXT,                  -- ⚠️ camelCase + età come TEXT
pacchetto TEXT,
priority TEXT,
preferitoContatto TEXT,
vuoleContratto TEXT DEFAULT 'No',
sistemaVersione TEXT DEFAULT 'V12.0',
status TEXT DEFAULT 'NEW',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Colonne aggiunte via ALTER TABLE** (ordine cronologico approssimato):
```
prezzo_anno, prezzo_rinnovo, cm, stato, canale, external_source_id,
hs_object_source, hs_object_source_detail_1, dettaglio_fonte, canale_acquisizione,
hs_analytics_source, nomeAssistito(*), cognomeAssistito(*), external_data,
reminder_firma_sent_at, reminder_firma_count, reminder_proforma_sent_at,
reminder_proforma_count, iva_agevolata, piano, servizio,
cfIntestatario, codiceFiscaleIntestatario, indirizzoIntestatario, capIntestatario,
cittaIntestatario, provinciaIntestatario, luogoNascitaIntestatario,
dataNascitaIntestatario, etaCalcolata, rateizzazione_attiva, rateizzazione_note,
rateizzazione_saldo, riserva_dominio, intestatarioContratto (?)
```
(*) probabilmente duplicate con le colonne originali dello schema base

**Problemi rilevati:**
1. **camelCase** — tutti i nomi colonna violano la convenzione snake_case
2. **Dati assistito in tabella lead** — `nomeAssistito`, `cognomeAssistito`, `dataNascitaAssistito` ecc. sono dati di un'entità distinta (`assistiti`). Violazione 1NF/2NF
3. **Dati intestatario duplicati** — `cfIntestatario`/`codiceFiscaleIntestatario` sono la stessa cosa (doppio campo per CF)
4. **età come TEXT** — `etaAssistito TEXT` e `etaCalcolata INTEGER` in parallelo: uno è calcolato, l'altro libero. Il calcolato non dovrebbe stare nel DB
5. **`stato` e `status`** — due colonne per lo stesso concetto (status lead)
6. **`cm`** — nome criptico, non documentato
7. **`pacchetto`** e **`servizio`/`piano`** — tre colonne che esprimono lo stesso concetto con nomi diversi
8. **`vuoleContratto TEXT`** — dovrebbe essere BOOLEAN (0/1)
9. **Schema definito 2 volte** in dashboard.tsx (righe 1388 e 2319) con schemi leggermente diversi
10. **Nessuna FK** verso altre tabelle

---

### 2.2 `contracts`

**Schema versione A** (`src/index.tsx` riga 5638 — quella attiva):
```sql
id TEXT PRIMARY KEY,
lead_id TEXT NOT NULL,              -- ⚠️ snake_case (diverso da leads.leadId!)
contract_code TEXT UNIQUE NOT NULL,
contract_type TEXT,
nome_cliente TEXT,
cognome_cliente TEXT,
email_cliente TEXT,
servizio TEXT,
piano TEXT,
dispositivo TEXT,
prezzo_base REAL,
prezzo_iva_inclusa REAL,
contract_html TEXT,                 -- ⚠️ HTML grezzo in DB
status TEXT DEFAULT 'PENDING',
signature_data TEXT,                -- firma digitale in JSON
signature_ip TEXT,
signature_timestamp TEXT,
signature_user_agent TEXT,
signature_screen_resolution TEXT,
signature_method TEXT DEFAULT 'inline',
signed_at TEXT,                     -- data firma
created_at TEXT DEFAULT CURRENT_TIMESTAMP
```

**Schema versione B** (`src/index.tsx` riga 27681):
```sql
-- Schema DIVERSO: usa leadId (camelCase), ha data_firma (non signed_at),
-- ha data_invio, data_scadenza, firma_digitale, ip_address, user_agent, assistito_id
-- MANCA: contract_code, nome_cliente, cognome_cliente, email_cliente, ecc.
```

**Colonne aggiunte via ALTER TABLE:**
```
signature_data, signature_ip, signature_timestamp, signature_user_agent,
signature_screen_resolution, signed_at, signature_method,
servizio, piano, imei_dispositivo, rateizzazione_attiva, riserva_dominio
```

**Problemi rilevati:**
1. **3 definizioni diverse** dello stesso schema — deriva incontrollata
2. **`lead_id` vs `leadId`** — inconsistenza naming tra versioni
3. **`data_firma` esiste solo nello schema B** (riga 27681), non nello schema A attivo → causa il D1_ERROR di oggi
4. **`signed_at` aggiunto con ALTER TABLE** — campo fondamentale non nel CREATE originale
5. **Manca `data_contratto`** — quando è stato emesso/inviato il contratto (distinta da `created_at`)
6. **Manca `data_scadenza`** nello schema A (presente solo nello schema B)
7. **`contract_html TEXT`** — l'HTML del contratto (potenzialmente MB) salvato in una colonna. Meglio un riferimento a storage esterno
8. **`signature_data TEXT`** — JSON della firma digitale misto a dati anagrafici
9. **`nome_cliente`/`cognome_cliente`** — dati già in `leads`, duplicazione
10. **`imei_dispositivo`** in contracts — l'IMEI appartiene a `dispositivi`, non al contratto
11. **Nessuna FK dichiarata** verso `leads`

---

### 2.3 `ddts`

**Schema attivo** (`src/index.tsx` riga 1179):
```sql
id TEXT PRIMARY KEY,
numero_ddt TEXT UNIQUE NOT NULL,
contract_code TEXT,                 -- ⚠️ riferimento a contracts, ma no FK
proforma_number TEXT,               -- ⚠️ riferimento a proforma, ma no FK
dispositivo TEXT NOT NULL,
serial_number TEXT,                 -- IMEI/SN del dispositivo
sim_number TEXT,                    -- aggiunto ieri con ALTER TABLE
quantita INTEGER DEFAULT 1,
destinatario_nome TEXT NOT NULL,    -- ⚠️ dati anagrafici duplicati da leads
destinatario_indirizzo TEXT NOT NULL,
destinatario_cap TEXT,
destinatario_citta TEXT,
destinatario_provincia TEXT,
destinatario_telefono TEXT,
destinatario_email TEXT,
corriere TEXT,
tracking_number TEXT,
peso_kg DECIMAL(5,2),
numero_colli INTEGER DEFAULT 1,
status TEXT DEFAULT 'preparazione',
data_spedizione DATETIME,
data_consegna DATETIME,
pdf_url TEXT,
pdf_generated BOOLEAN DEFAULT FALSE,
note TEXT,                          -- ⚠️ conteneva LeadID:LEAD-XXX (FK nascosta)
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Schema alternativo** (`src/index.tsx` riga 28951):
```sql
-- Stesso schema ma SENZA sim_number (aggiunto solo nel primo)
-- Usato per insert dati storici mock
```

**Problemi rilevati:**
1. **`lead_id` mancante** — la relazione con il lead è nascosta nel campo `note` come stringa `LeadID:LEAD-XXX`. **Questo è il problema più grave**: una FK fondamentale serializzata come testo in un campo note
2. **2 definizioni** dello stesso schema (uno con `sim_number`, uno senza)
3. **Dati anagrafici destinatario duplicati** da `leads` — in caso di modifica del lead, il DDT rimane desincronizzato
4. **`serial_number`** usato per IMEI del dispositivo — nome fuorviante (IMEI ≠ serial number in senso stretto)
5. **`dispositivo TEXT`** — stringa libera, nessun riferimento a `dispositivi`
6. **`proforma_number`** — reference a proforma senza FK
7. **`pdf_url`** — URL generato runtime, inutile salvarlo (è sempre `/api/ddts/:id/pdf-print`)
8. **`pdf_generated BOOLEAN`** — sempre 1, non ha valore informativo reale

---

### 2.4 `assistiti`

**Schema base** (`src/index.tsx` riga 17384):
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT,  -- ⚠️ INTEGER vs TEXT nelle altre tabelle
codice TEXT UNIQUE NOT NULL,
nome TEXT NOT NULL,                    -- ⚠️ nome+cognome concatenati originalmente
email TEXT,
telefono TEXT,
imei TEXT UNIQUE,                      -- ⚠️ IMEI in assistiti E in dispositivi
status TEXT DEFAULT 'ATTIVO',
lead_id TEXT,                          -- FK verso leads, ma no REFERENCES
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
```

**Colonne aggiunte via ALTER TABLE:**
```
nome_assistito, cognome_assistito, nome_caregiver, cognome_caregiver,
parentela_caregiver, servizio, piano, fonte_override, imei (già in schema base?)
```

**Problemi rilevati:**
1. **`nome` originale** conteneva nome+cognome concatenati — migrazione a posteriori a `nome_assistito`/`cognome_assistito`
2. **`imei` in assistiti** — duplicato con `dispositivi.serial_number` e `ddts.serial_number`. Un dispositivo dovrebbe essere un'entità separata, non un campo dell'assistito
3. **`id INTEGER AUTOINCREMENT`** — inconsistente con tutte le altre tabelle che usano `TEXT PRIMARY KEY`
4. **`lead_id`** senza `REFERENCES leads(id)` esplicito
5. **Caregiver in `assistiti`** — `nome_caregiver`/`cognome_caregiver`/`parentela_caregiver` sono dati di un'altra persona, andrebbero in tabella separata (`caregivers`) con FK verso `assistiti`
6. **`servizio` e `piano`** duplicati da `contracts`

---

### 2.5 `configurations`

**Schema attuale** (ricreato con DROP/CREATE):
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT,
leadId TEXT NOT NULL,               -- ⚠️ camelCase
device_id INTEGER,
contract_id TEXT,
nome_assistito TEXT,                -- ⚠️ duplicato da assistiti/leads
cognome_assistito TEXT,             -- ⚠️ duplicato
data_nascita TEXT, eta TEXT, peso REAL, altezza REAL,
telefono TEXT, email TEXT, indirizzo TEXT,
-- 3 contatti (contatto1_*, contatto2_*, contatto3_*)
-- 3 whitelist (whitelist1_*, whitelist2_*, whitelist3_*)
-- dati medici: patologie, note_mediche, farmaci_data,
--              contatto_emergenza_1_*, contatto_emergenza_2_*
--              medico_curante_*, centro_medico_riferimento
--              allergie, patologie_croniche, farmaci_assunti
-- configurazione: modalita_utilizzo, orari_attivazione
status TEXT DEFAULT 'PENDING',
data_completamento DATETIME,
form_inviato BOOLEAN DEFAULT FALSE,
email_benvenuto_inviata BOOLEAN DEFAULT FALSE,
email_conferma_inviata BOOLEAN DEFAULT FALSE,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE,
FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
```

**Problemi rilevati:**
1. **Tabella monolitica** — mescola: dati anagrafici assistito, dati medici, contatti di emergenza, whitelist, configurazione dispositivo, flag operativi email. Almeno 4 entità distinte
2. **Contatti come colonne ripetute** — `contatto1_nome`, `contatto2_nome`, `contatto3_nome` invece di una tabella `contatti_emergenza(id, config_id, posizione, nome, ...)`
3. **Whitelist come colonne ripetute** — stessa violazione della 1NF
4. **`email_benvenuto_inviata`** — flag operativo misto a dati di configurazione
5. **`leadId` camelCase** — inconsistente
6. **Dati anagrafici duplicati** da `leads` e `assistiti`
7. **`device_id INTEGER`** — FK verso dispositivi ma tipo diverso (dispositivi.id è INTEGER AUTOINCREMENT)
8. **Dati medici** (`allergie`, `patologie_croniche`, `farmaci_assunti`) meriterebbero una tabella `cartella_clinica` separata per privacy e estensibilità

---

### 2.6 `dispositivi`

**Schema attuale** (`src/index.tsx` riga 23100):
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT,
serial_number TEXT UNIQUE NOT NULL,
modello TEXT NOT NULL,
status TEXT DEFAULT 'inventory',
lead_id TEXT,
assigned_at TEXT,
activated_at TEXT,
created_at TEXT NOT NULL,
FOREIGN KEY (lead_id) REFERENCES leads(id)
```

**Problemi rilevati:**
1. **Schema minimo** — manca `sim_number` (il numero SIM è sparso in `ddts` e `note`)
2. **`lead_id`** — un dispositivo può essere riassegnato: serve storico assegnazioni, non un singolo campo
3. **`modello TEXT`** — stringa libera, nessuna tabella `modelli_dispositivo`
4. **IMEI duplicato** — `serial_number` qui, `imei` in `assistiti`, `serial_number` in `ddts` — tre posti per lo stesso dato

---

### 2.7 `proforma`

**Nessun CREATE TABLE esplicito trovato nel codice attuale.**  
La tabella esiste in produzione, creata storicamente. Lo schema è deducibile dagli INSERT:

```sql
-- Deducto da INSERT a riga 294:
id, contract_id, leadId, numero_proforma, data_emissione, data_scadenza,
cliente_nome, cliente_cognome, cliente_email, cliente_telefono,
tipo_servizio, prezzo_mensile, durata_mesi, prezzo_totale, status
-- Aggiunte via ALTER TABLE:
iva_agevolata INTEGER, is_rinnovo INTEGER,
rata_numero INTEGER, rate_totali INTEGER, riserva_dominio INTEGER
```

**Problemi rilevati:**
1. **Schema non versionato** — nessun CREATE TABLE nel codice corrente, solo ALTER TABLE successivi
2. **`leadId` camelCase**
3. **Dati cliente duplicati** da `leads`
4. **`tipo_servizio`** vs `servizio`/`piano` in `contracts` — naming incoerente

---

### 2.8 `rate_pagamento`

**Schema** (definito 2 volte, righe 22069 e 22525 — identici):
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT,
lead_id TEXT NOT NULL,
contract_id TEXT DEFAULT NULL,
numero_rata INTEGER NOT NULL,
importo REAL NOT NULL,
importo_iva REAL DEFAULT 0,
aliquota_iva REAL DEFAULT 0,
data_scadenza TEXT NOT NULL,
status TEXT NOT NULL DEFAULT 'ATTESA',
data_pagamento TEXT DEFAULT NULL,
metodo_pagamento TEXT DEFAULT NULL,
riferimento TEXT DEFAULT NULL,
note TEXT DEFAULT NULL,
creato_da TEXT DEFAULT NULL,
created_at TEXT NOT NULL DEFAULT (datetime('now')),
updated_at TEXT NOT NULL DEFAULT (datetime('now'))
```

**Problemi rilevati:**
1. **Definita 2 volte** — identica, ma ridondante nel codice
2. **`lead_id` e `contract_id`** — la rata si riferisce al contratto, non direttamente al lead. `lead_id` è ridondante (si raggiunge via `contract_id → contracts.lead_id`)

---

## 3. Mappa anomalie critiche per priorità

### PRIORITÀ ALTA — Integrità dati a rischio

| ID | Anomalia | Tabelle coinvolte | Impatto |
|----|----------|-------------------|---------|
| A1 | `ddts.note` contiene `LeadID:XXX` come FK | `ddts`, `leads` | Join impossibili, dati orfani non rilevabili |
| A2 | Schema `contracts` definito 3 volte con strutture diverse | `contracts` | Deriva schema, colonne mancanti in produzione (causa D1_ERROR odierno) |
| A3 | `signed_at` (data firma contratto) aggiunto con ALTER TABLE post-deploy | `contracts` | Potrebbe mancare in DB vecchi |
| A4 | Schema `ddts` definito 2 volte (uno senza `sim_number`) | `ddts` | Inconsistenza dati nuovi/vecchi |
| A5 | IMEI del dispositivo in 3 tabelle diverse | `assistiti`, `ddts`, `dispositivi` | Dato replicato, nessuna fonte di verità unica |

### PRIORITÀ MEDIA — Qualità struttura

| ID | Anomalia | Tabelle coinvolte | Impatto |
|----|----------|-------------------|---------|
| B1 | Nomi colonne camelCase in tabelle principali | `leads`, `configurations`, `proforma` | Incoerenza, bug nascosti |
| B2 | Dati anagrafici replicati in leads/assistiti/configurations/ddts/proforma | Multiple | Disallineamento dati, aggiornamenti parziali |
| B3 | Contatti emergenza/whitelist come colonne ripetute | `configurations` | Violazione 1NF, max 3 contatti hardcoded |
| B4 | Caregiver in `assistiti` invece di tabella separata | `assistiti` | Un assistito = un caregiver: struttura rigida |
| B5 | `proforma` senza CREATE TABLE nel codice | `proforma` | Schema non versionato, ricostruibile solo da ALTER TABLE |
| B6 | Schema `users` definito 2 volte | `users` | Deriva |
| B7 | Schema `rate_pagamento` definito 2 volte | `rate_pagamento` | Ridondanza |
| B8 | Schemi `leads` definiti 2 volte in dashboard.tsx | `leads` | Deriva |

### PRIORITÀ BASSA — Miglioramenti futuri

| ID | Anomalia | Note |
|----|----------|------|
| C1 | `contracts.contract_html TEXT` — HTML in colonna DB | Meglio Cloudflare R2 |
| C2 | `ddts.pdf_url` salvata ma sempre calcolabile | Ridondante |
| C3 | `età` calcolata salvata nel DB | Non dovrebbe stare nel DB |
| C4 | `dispositivi` senza storico assegnazioni | Serve tabella `assegnazioni_dispositivi` |
| C5 | `system_config` e `settings` — due key-value store paralleli | Unificare |
| C6 | `automation_tasks` solo in dashboard legacy | Inutilizzata o da integrare |

---

## 4. Relazioni reali vs relazioni dichiarate

```
DICHIARATE (FOREIGN KEY esplicite):
  lead_interactions.lead_id → leads.id ✅
  lead_completion_tokens.lead_id → leads.id ✅
  lead_completion_log.lead_id → leads.id ✅
  configurations.leadId → leads.id ✅
  configurations.contract_id → contracts.id ✅
  dispositivi.lead_id → leads.id ✅

IMPLICITE (nessuna FK dichiarata):
  contracts.lead_id → leads.id ❌
  ddts.contract_code → contracts.contract_code ❌
  ddts.proforma_number → proforma.numero_proforma ❌
  ddts.lead_id → leads.id ❌ (campo nemmeno esiste: è in note!)
  assistiti.lead_id → leads.id ❌
  proforma.contract_id → contracts.id ❌
  proforma.leadId → leads.id ❌
  rate_pagamento.lead_id → leads.id ❌
  rate_pagamento.contract_id → contracts.id ❌
  lead_discounts.lead_id → leads.id ❌
```

---

## 5. Schema target proposto (da validare)

> ⚠️ Questo è solo un punto di partenza per la discussione.  
> Non autorizza nessuna modifica.

### Interventi ordinati per rischio/impatto:

**FASE 1 — Solo ADD COLUMN (zero rischio rollback):**
- Aggiungere `lead_id TEXT` a `ddts` (popolare con i LeadID estratti da `note`)
- Aggiungere `data_contratto TEXT` a `contracts` (data emissione, distinta da `created_at` e `signed_at`)
- Aggiungere `data_scadenza TEXT` a `contracts` (già presente nello schema B ma non in A)
- Unificare `cfIntestatario`/`codiceFiscaleIntestatario` in `leads` (uno dei due è ridondante)

**FASE 2 — Pulizia dati (rischio medio, reversibile):**
- Popolare `ddts.lead_id` dai pattern in `note`
- Pulire `note` dai LeadID dopo verifica
- Allineare `status` nomenclatura tra tabelle (`PENDING`/`DRAFT`/`NEW` usati con significati sovrapposti)

**FASE 3 — Ristrutturazione (rischio alto, richiede finestra manutenzione):**
- Normalizzare contatti in `configurations` → tabella `configurazione_contatti`
- Separare caregiver → tabella `caregivers`
- Unificare schema `contracts` in un'unica definizione canonica
- Pulire naming camelCase → snake_case (richiede aggiornamento di TUTTO il codice applicativo)

---

## 6. Prerequisiti per qualsiasi intervento

### Backup
- [ ] Export completo D1 produzione via `wrangler d1 export`
- [ ] Verifica integrità backup (count record per tabella)
- [ ] Test restore su DB locale/preview

### Testing
- [ ] Eseguire FASE 1 su DB di preview (branch non-main)
- [ ] Verificare tutti gli endpoint critici dopo ogni ALTER TABLE
- [ ] Test regressione: DDT pdf-print, firma contratto, form configurazione, proforma

### Rollback
- [ ] Script di rollback predisposto per ogni fase
- [ ] Finestra di manutenzione < 30 min per FASE 1

---

## 7. Domande aperte da chiarire prima di procedere

1. **`leads.stato` vs `leads.status`** — quali valori ha ciascuno? Uno è obsoleto?
2. **`leads.pacchetto` vs `leads.servizio` vs `leads.piano`** — tre campi, stesso concetto. Quale è la fonte di verità?
3. **`leads.cm`** — cosa significa questo campo?
4. **`proforma`** — esiste un CREATE TABLE originale da qualche parte? O è stata creata manualmente su D1?
5. **`assistiti.id` INTEGER vs tutte le altre tabelle TEXT** — è intenzionale?
6. **`configurations.device_id`** — è usato? A cosa punta realmente?
7. **`automation_tasks`** — è ancora attiva? O è un residuo della dashboard legacy?
8. **`contracts.imei_dispositivo`** — perché l'IMEI sta nel contratto e non solo in `dispositivi`?

---

*Fine documento — versione 1.0 — in attesa di validazione*
