# 📊 SCHEMA DATABASE DEFINITIVO - TeleMedCare V12

**Documento di riferimento OBBLIGATORIO** da consultare prima di scrivere qualsiasi query SQL.

---

## ⚠️ REGOLA FONDAMENTALE

**PRIMA DI SCRIVERE UNA QUERY SQL:**
1. Apri questo file (`DB_SCHEMA.md`)
2. Verifica i nomi ESATTI delle tabelle e colonne
3. **NON INVENTARE** nomi di colonne
4. **NON FARE ASSUNZIONI** sui nomi dei campi

---

## 📋 TABELLE PRINCIPALI

### 1. `leads` - Contatti/Lead

```sql
CREATE TABLE leads (
  id TEXT PRIMARY KEY,                    -- LEAD-IRBEMA-00001
  nomeRichiedente TEXT,
  cognomeRichiedente TEXT,
  email TEXT,
  telefono TEXT,
  
  -- Dati assistito
  nomeAssistito TEXT,
  cognomeAssistito TEXT,
  dataNascitaAssistito TEXT,
  luogoNascitaAssistito TEXT,
  codiceFiscaleAssistito TEXT,
  indirizzoAssistito TEXT,
  cittaAssistito TEXT,
  provinciaAssistito TEXT,
  capAssistito TEXT,
  
  -- Servizio
  servizio TEXT,                          -- eCura PRO, eCura PREMIUM, eCura FAMILY
  piano TEXT,                             -- BASE, AVANZATO
  tipoServizio TEXT,                      -- Legacy field
  prezzo_anno REAL,
  prezzo_rinnovo REAL,
  
  -- Metadata
  fonte TEXT,                             -- 'Form eCura', 'IRBEMA', etc.
  external_source_id TEXT,                -- ID HubSpot
  status TEXT,                            -- NEW, CONTACTED, etc.
  note TEXT,
  
  -- Flags
  vuoleContratto INTEGER DEFAULT 0,
  vuoleBrochure INTEGER DEFAULT 0,
  vuoleManuale INTEGER DEFAULT 0,
  gdprConsent INTEGER DEFAULT 0,
  consensoMarketing INTEGER DEFAULT 0,
  consensoTerze INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT,
  updated_at TEXT
);
```

**⚠️ ATTENZIONE**: 
- Campo lead è `leadId` in alcune tabelle, `lead_id` in altre
- Email può essere `email` o `emailRichiedente`

---

### 2. `contracts` - Contratti

```sql
CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,                  -- ⚠️ NON leadId!
  contract_code TEXT UNIQUE NOT NULL,     -- ⚠️ NON codice_contratto!
  tipo_servizio TEXT NOT NULL,
  prezzo_base REAL NOT NULL,
  prezzo_iva_inclusa REAL NOT NULL,
  status TEXT DEFAULT 'draft',
  pdf_url TEXT,
  docusign_envelope_id TEXT,
  created_at TEXT,
  updated_at TEXT,
  
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);
```

**⚠️ ATTENZIONE**:
- Il campo contratto è `contract_code` NON `codice_contratto`
- Il riferimento lead è `lead_id` NON `leadId`

---

### 3. `proforma` - Proforma/Fatture Proforma

```sql
CREATE TABLE proforma (
  id TEXT PRIMARY KEY,
  leadId TEXT NOT NULL,                   -- ⚠️ leadId (camelCase)!
  numero_proforma TEXT NOT NULL UNIQUE,
  data_emissione TEXT NOT NULL,
  data_scadenza TEXT NOT NULL,
  
  -- Importi (⚠️ NOMI ESATTI)
  importo_base REAL NOT NULL,             -- Base senza IVA (es. €990)
  importo_iva REAL NOT NULL,              -- IVA 22% (es. €217.80)
  importo_totale REAL NOT NULL,           -- Totale CON IVA (es. €1207.80)
  
  valuta TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'GENERATED',        -- GENERATED, PAID, EXPIRED
  servizio TEXT,
  piano TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  
  FOREIGN KEY (leadId) REFERENCES leads(id)
);
```

**⚠️ ATTENZIONE**:
- Campo lead è `leadId` (camelCase) NON `lead_id`
- NON esiste campo `contract_id` in questa tabella
- NON esiste campo `prezzo_totale` (è `importo_totale`)
- Per JOIN con contracts: `contracts.lead_id = proforma.leadId`

**💡 CALCOLO IVA CORRETTO**:
```javascript
importo_base = 990.00        // Base senza IVA
importo_iva = 217.80         // IVA 22%
importo_totale = 1207.80     // Totale = base + IVA
```

---

### 4. `lead_interactions` - Interazioni con Lead

```sql
CREATE TABLE lead_interactions (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,                  -- ⚠️ lead_id (snake_case)
  data TEXT NOT NULL,
  tipo TEXT NOT NULL,                     -- CHIAMATA, EMAIL, NOTA
  nota TEXT,
  azione TEXT,
  operatore TEXT,
  created_at TEXT NOT NULL,
  
  FOREIGN KEY (lead_id) REFERENCES leads(id)
);
```

**⚠️ NOTA IMPORTANTE**:
- Le interazioni manuali sono in questa tabella
- NON sovrascrivere il campo `leads.note` con dati automatici
- `leads.note` può contenere note HubSpot o placeholder

---

## 🔍 QUERY COMUNI CORRETTE

### ✅ Recuperare proforma con contratto

```sql
-- SBAGLIATO ❌
SELECT p.*, c.lead_id, c.codice_contratto
FROM proforma p
LEFT JOIN contracts c ON p.contract_id = c.id  -- contract_id NON ESISTE!

-- CORRETTO ✅
SELECT 
  p.*,
  c.id as contract_id,
  c.contract_code
FROM proforma p
LEFT JOIN contracts c ON c.lead_id = p.leadId  -- JOIN corretto
WHERE p.numero_proforma = ?
ORDER BY c.created_at DESC
LIMIT 1
```

### ✅ Recuperare lead con contratto

```sql
-- CORRETTO ✅
SELECT 
  l.*,
  c.contract_code,
  c.status as contract_status
FROM leads l
LEFT JOIN contracts c ON c.lead_id = l.id
WHERE l.email = ?
```

### ✅ Calcolare totale proforma

```javascript
// SBAGLIATO ❌
const total = parseFloat(proforma.prezzo_totale)  // Campo NON esiste!

// CORRETTO ✅
const total = parseFloat(proforma.importo_totale)  // Campo corretto
```

---

## 📝 CHECKLIST PRE-QUERY

Prima di scrivere una query SQL, verifica:

- [ ] Ho consultato `DB_SCHEMA.md`?
- [ ] I nomi delle tabelle sono corretti?
- [ ] I nomi delle colonne sono ESATTI (snake_case vs camelCase)?
- [ ] Ho verificato quali colonne esistono realmente?
- [ ] Ho verificato le FOREIGN KEY corrette per i JOIN?
- [ ] Ho testato la query mentalmente con lo schema?

---

## 🚨 ERRORI COMUNI DA EVITARE

| ❌ SBAGLIATO | ✅ CORRETTO | Tabella |
|-------------|-------------|---------|
| `c.lead_id` (dopo LEFT JOIN fallito) | `p.leadId` | proforma |
| `p.contract_id` | NON ESISTE | proforma |
| `c.codice_contratto` | `c.contract_code` | contracts |
| `p.prezzo_totale` | `p.importo_totale` | proforma |
| `l.leadId` | `l.id` | leads |
| `JOIN ON p.contract_id = c.id` | `JOIN ON c.lead_id = p.leadId` | JOIN proforma-contracts |

---

## 🔄 AGGIORNAMENTO SCHEMA

Questo documento DEVE essere aggiornato ogni volta che:
- Viene creata una nuova tabella
- Vengono aggiunte colonne
- Vengono rinominate colonne
- Viene modificata la struttura del DB

**Ultimo aggiornamento**: 2026-03-04

---

## 💡 COME USARE QUESTO DOCUMENTO

1. **PRIMA di scrivere codice**: apri questo file
2. **Cerca la tabella** che ti serve
3. **Copia i nomi ESATTI** delle colonne
4. **Verifica i JOIN** con le foreign key indicate
5. **Solo DOPO**: scrivi la query SQL

**Regola d'oro**: Se non sei sicuro del nome → GUARDA QUI PRIMA!

---

_"Quel qualcuno sei tu..." - User, 2026-03-04_
_(Memo: non inventare MAI più nomi di colonne!)_
