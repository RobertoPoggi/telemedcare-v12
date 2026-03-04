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
  leadId TEXT NOT NULL,                   -- ⚠️ leadId (camelCase), NON lead_id!
  codice_contratto TEXT UNIQUE NOT NULL,  -- ⚠️ codice_contratto, NON contract_code!
  tipo_contratto TEXT NOT NULL,           -- BASE, AVANZATO
  template_utilizzato TEXT,
  contenuto_html TEXT,
  pdf_url TEXT,
  pdf_generated INTEGER DEFAULT 0,
  prezzo_mensile REAL,
  durata_mesi INTEGER DEFAULT 12,
  prezzo_totale REAL NOT NULL,            -- ⚠️ Prezzo SENZA IVA (es. €840)
  status TEXT DEFAULT 'draft',            -- draft, SENT, SIGNED, ACTIVE
  data_invio TEXT,
  data_scadenza TEXT,
  email_sent INTEGER DEFAULT 0,
  email_template_used TEXT,
  created_at TEXT,
  updated_at TEXT,
  imei_dispositivo TEXT,
  piano TEXT,                             -- BASE, AVANZATO
  servizio TEXT,                          -- eCura PRO, eCura PREMIUM, eCura FAMILY
  signature_data TEXT,
  signature_ip TEXT,
  signature_timestamp TEXT,
  signature_user_agent TEXT,
  signature_screen_resolution TEXT,
  signed_at TEXT,
  signature_method TEXT,
  
  FOREIGN KEY (leadId) REFERENCES leads(id)
);
```

**⚠️ ATTENZIONE**:
- Il campo lead è `leadId` (camelCase) NON `lead_id`
- Il campo contratto è `codice_contratto` NON `contract_code`
- `prezzo_totale` qui contiene il prezzo SENZA IVA (es. €840)
- Nelle proforma invece `prezzo_totale` contiene CON IVA (es. €1207.80)

---

### 3. `proforma` - Proforma/Fatture Proforma

```sql
CREATE TABLE proforma (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contract_id TEXT,                       -- ID contratto associato
  leadId TEXT NOT NULL,                   -- ⚠️ leadId (camelCase)!
  numero_proforma TEXT NOT NULL UNIQUE,
  data_emissione TEXT NOT NULL,
  data_scadenza TEXT NOT NULL,
  
  -- Dati cliente
  cliente_nome TEXT,
  cliente_cognome TEXT,
  cliente_email TEXT,
  cliente_telefono TEXT,
  cliente_indirizzo TEXT,
  cliente_citta TEXT,
  cliente_cap TEXT,
  cliente_provincia TEXT,
  cliente_codice_fiscale TEXT,
  
  -- Servizio e importi
  tipo_servizio TEXT,                     -- es. "eCura PREMIUM"
  prezzo_mensile REAL,                    -- Prezzo mensile (IVA esclusa / 12)
  durata_mesi INTEGER DEFAULT 12,
  prezzo_totale REAL NOT NULL,            -- ⚠️ Totale CON IVA (es. €1207.80)
  
  -- Status
  status TEXT DEFAULT 'GENERATED',        -- GENERATED, SENT, PAID, EXPIRED
  email_sent INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  
  FOREIGN KEY (leadId) REFERENCES leads(id),
  FOREIGN KEY (contract_id) REFERENCES contracts(id)
);
```

**⚠️ ATTENZIONE**:
- Campo lead è `leadId` (camelCase) NON `lead_id`
- ✅ Esiste campo `contract_id` (FK opzionale verso contracts)
- ✅ Usa `prezzo_totale` NON `importo_totale`
- ⚠️ `prezzo_totale` contiene GIÀ l'IVA inclusa (es. €1207.80)
- Per JOIN con contracts: `contracts.leadId = proforma.leadId` o `contracts.id = proforma.contract_id`

**💡 CALCOLO CORRETTO**:
```javascript
prezzoBase = 990.00          // Base annuale senza IVA
prezzoConIva = 1207.80       // Totale annuale con IVA 22%
prezzo_mensile = 82.50       // prezzoBase / 12 (mensile senza IVA)
prezzo_totale = 1207.80      // ← Questo va in DB (CON IVA)
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
const total = parseFloat(proforma.importo_totale)  // Campo NON esiste!

// CORRETTO ✅
const total = parseFloat(proforma.prezzo_totale)  // prezzo_totale contiene GIÀ IVA
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
| `p.contract_id` | ✅ ESISTE (FK opzionale) | proforma |
| `c.codice_contratto` | `c.contract_code` o `c.codice_contratto` | contracts (varia!) |
| `p.importo_totale` | `p.prezzo_totale` | proforma |
| `l.leadId` | `l.id` | leads |
| `JOIN ON p.contract_id = c.id` | ✅ CORRETTO | JOIN proforma-contracts |
| `JOIN ON c.lead_id = p.leadId` | ✅ CORRETTO (alternativa) | JOIN contracts-proforma |

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
