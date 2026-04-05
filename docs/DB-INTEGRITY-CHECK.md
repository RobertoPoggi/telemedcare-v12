# 🔍 DATABASE INTEGRITY CHECK - TeleMedCare V12

## Obiettivo Finale
**Eliminare la blacklist manuale** sostituendola con logica automatica basata su:
- `leads.status` → `ACTIVE`, `CONTRACT_SIGNED`, `NOT_INTERESTED`
- `contracts.status` → `ACTIVE`, `SIGNED`
- `assistiti.stato` → `ACTIVE`

---

## 🎯 STATO ATTUALE

### ⚠️ **Problema**
La blacklist manuale (`MANUAL_CONTRACTS_BLACKLIST`) è una **soluzione temporanea** perché:
- Il database **non è completo** (contratti/assistiti manuali non registrati)
- Alcuni lead **non hanno status aggiornato** (`ACTIVE`/`CONTRACT_SIGNED`)
- Foreign keys **non sempre popolate** (`lead_id` in contracts/assistiti)

### ✅ **Soluzione Target**
Quando il DB sarà completo, la query automatica escluderà i lead senza blacklist:

```typescript
// ✅ LOGICA FINALE (senza blacklist manuale)
const tokens = await db.prepare(`
  SELECT * FROM lead_completion_tokens t
  JOIN leads l ON t.lead_id = l.id
  WHERE 
    t.completed = 0
    AND t.expires_at > datetime('now')
    AND l.status NOT IN ('CONTRACT_SIGNED', 'ACTIVE', 'NOT_INTERESTED')
  ORDER BY 
    CASE l.status
      WHEN 'INTERESTED' THEN 1
      WHEN 'TO_RECONTACT' THEN 2
      ELSE 3
    END,
    l.created_at ASC
  LIMIT 30
`).all();
```

---

## 🔧 ENDPOINT API DIAGNOSTICO

### **GET** `/api/diagnostic/db-integrity`

**Descrizione**: Verifica l'integrità del database e identifica dati mancanti.

**Response**:
```json
{
  "success": true,
  "timestamp": "2026-03-02T00:42:00.000Z",
  "health": "HEALTHY" | "WARNING" | "CRITICAL",
  "integrity_score": {
    "orphan_contracts": 0,      // Contratti senza lead_id
    "orphan_assistiti": 0,      // Assistiti senza lead_id/contract_id
    "blacklist_missing": 0,     // Lead blacklist non trovati nel DB
    "total_issues": 0
  },
  "statistics": {
    "total_leads": 233,
    "leads_active": 13,
    "leads_contract_signed": 45,
    "total_contracts": 58,
    "contracts_active": 13,
    "contracts_signed": 45,
    "total_assistiti": 13,
    "assistiti_active": 13
  },
  "details": {
    "active_leads": [...],         // Lead con status ACTIVE/CONTRACT_SIGNED
    "orphan_contracts": [...],     // Contratti senza lead collegato
    "orphan_assistiti": [...],     // Assistiti senza lead/contratto
    "blacklist_leads": [...]       // I 13 lead blacklist nel DB
  },
  "recommendations": [
    "🔧 Collegare X contratti orfani ai rispettivi lead",
    "📝 Una volta completato il DB, rimuovere MANUAL_CONTRACTS_BLACKLIST"
  ]
}
```

---

## 📊 QUERY SQL PER CLOUDFLARE D1

### 1. **Verifica Leads Attivi con Contratti/Assistiti**
```sql
SELECT 
  l.id AS lead_id,
  l.nome || ' ' || l.cognome AS richiedente,
  l.nomeAssistito || ' ' || l.cognomeAssistito AS assistito,
  l.status AS lead_status,
  c.id AS contract_id,
  c.status AS contract_status,
  a.id AS assistito_id,
  a.stato AS assistito_stato
FROM leads l
LEFT JOIN contracts c ON c.lead_id = l.id
LEFT JOIN assistiti a ON a.lead_id = l.id
WHERE 
  (l.nome || ' ' || l.cognome) IN (
    'Francesco Pepe', 'Alberto Locatelli', 'Paolo Macrì',
    'Elisabetta Cattini', 'Giorgio Riela', 'Caterina D''Alterio',
    'Elena Saglia', 'Stefania Rocca', 'Simona Pizzutto',
    'Andrea D''Avella', 'Claudio Macchi', 'Margherita Delaude',
    'Maria Grazia Ronca'
  )
ORDER BY l.id;
```

### 2. **Contratti Orfani** (senza lead_id)
```sql
SELECT 
  c.id,
  c.nomeIntestatario || ' ' || c.cognomeIntestatario AS intestatario,
  c.nomeAssistito || ' ' || c.cognomeAssistito AS assistito,
  c.status,
  c.lead_id
FROM contracts c
LEFT JOIN leads l ON c.lead_id = l.id
WHERE c.status IN ('ACTIVE', 'SIGNED')
  AND l.id IS NULL
ORDER BY c.created_at DESC;
```

### 3. **Assistiti Orfani** (senza lead_id o contract_id)
```sql
SELECT 
  a.id,
  a.nome || ' ' || a.cognome AS assistito,
  a.stato,
  a.lead_id,
  a.contract_id
FROM assistiti a
LEFT JOIN leads l ON a.lead_id = l.id
LEFT JOIN contracts c ON a.contract_id = c.id
WHERE a.stato = 'ACTIVE'
  AND (l.id IS NULL OR c.id IS NULL)
ORDER BY a.created_at DESC;
```

---

## 🔧 QUERY DI FIX

### 1. **Aggiorna Status Lead per Clienti Attivi**
```sql
UPDATE leads
SET status = 'ACTIVE'
WHERE (nome || ' ' || cognome) IN (
  'Francesco Pepe',
  'Alberto Locatelli',
  'Paolo Macrì',
  'Elisabetta Cattini',
  'Giorgio Riela',
  'Caterina D''Alterio',
  'Elena Saglia',
  'Stefania Rocca',
  'Simona Pizzutto',
  'Andrea D''Avella',
  'Claudio Macchi',
  'Margherita Delaude',
  'Maria Grazia Ronca'
);
```

### 2. **Collega Contratti Orfani ai Lead**
```sql
-- Esempio: Margherita Delaude
UPDATE contracts
SET lead_id = (
  SELECT id FROM leads 
  WHERE nome = 'Margherita' AND cognome = 'Delaude'
  LIMIT 1
)
WHERE 
  nomeIntestatario = 'Margherita' 
  AND cognomeIntestatario = 'Delaude'
  AND lead_id IS NULL;
```

### 3. **Inserisci Contratto Mancante**
```sql
-- Esempio: Se un contratto non esiste affatto
INSERT INTO contracts (
  id, 
  lead_id, 
  nomeIntestatario, 
  cognomeIntestatario,
  nomeAssistito,
  cognomeAssistito,
  servizio,
  status,
  created_at,
  updated_at
) VALUES (
  'CONTRACT-' || substr(hex(randomblob(4)), 1, 8),
  (SELECT id FROM leads WHERE nome = 'Margherita' AND cognome = 'Delaude' LIMIT 1),
  'Margherita',
  'Delaude',
  'Margherita',
  'Delaude',
  'eCura PREMIUM AVANZATO',
  'ACTIVE',
  datetime('now'),
  datetime('now')
);
```

---

## 📝 PROCEDURA DI SINCRONIZZAZIONE

### Step 1: **Diagnostica Iniziale**
```bash
# Chiamata API
curl https://telemedcare-v12.pages.dev/api/diagnostic/db-integrity

# Oppure apri nel browser:
https://telemedcare-v12.pages.dev/api/diagnostic/db-integrity
```

### Step 2: **Analisi Risultati**
- **health: "HEALTHY"** → DB completo, rimuovi blacklist
- **health: "WARNING"** → 1-5 problemi, fix manuale
- **health: "CRITICAL"** → >5 problemi, fix automatico necessario

### Step 3: **Fix Database**
1. Accedi a **Cloudflare D1 Dashboard**
2. Seleziona database `genspark_ai_developer_telemedcare_v12`
3. Esegui query di verifica (sezione sopra)
4. Esegui query di fix (sezione sopra)

### Step 4: **Verifica Fix**
```bash
# Richiama diagnostica
curl https://telemedcare-v12.pages.dev/api/diagnostic/db-integrity

# Verifica: total_issues dovrebbe essere 0
```

### Step 5: **Rimuovi Blacklist Manuale**
```typescript
// ❌ RIMUOVI QUESTO BLOCCO da src/modules/lead-completion.ts

const MANUAL_CONTRACTS_BLACKLIST = [
  'Francesco Pepe',
  // ... tutti i nomi
];

// E rimuovi questo filtro:
const tokensFiltered = tokens.filter((token: any) => {
  const nomeCognome = `${token.nomeRichiedente || ''} ${token.cognomeRichiedente || ''}`.trim()
  const isBlacklisted = MANUAL_CONTRACTS_BLACKLIST.some(name => 
    nomeCognome.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(nomeCognome.toLowerCase())
  )
  return !isBlacklisted
})
```

### Step 6: **Deploy e Test**
```bash
# Build
npm run build

# Commit
git add -A
git commit -m "🎯 Rimossa blacklist manuale - DB completo e sincronizzato"

# Push
git push origin main

# Attendi deploy Cloudflare (~3-5 min)

# Test prossimo run cron (domani 09:50 UTC)
# Verifica log GitHub Actions per conferma
```

---

## ✅ CHECKLIST COMPLETAMENTO

- [ ] Eseguita diagnostica API `/api/diagnostic/db-integrity`
- [ ] Identificati contratti/assistiti orfani
- [ ] Aggiornati status lead (`ACTIVE`, `CONTRACT_SIGNED`)
- [ ] Collegati contratti orfani ai rispettivi lead (foreign key `lead_id`)
- [ ] Collegati assistiti orfani ai rispettivi lead/contratti
- [ ] Verificato che tutti i 13 clienti attivi abbiano:
  - [ ] Lead con `status = 'ACTIVE'` o `'CONTRACT_SIGNED'`
  - [ ] Contratto con `status = 'ACTIVE'` o `'SIGNED'` e `lead_id` popolato
  - [ ] Assistito con `stato = 'ACTIVE'` e `lead_id` + `contract_id` popolati
- [ ] Richiamata diagnostica → `health: "HEALTHY"` ✅
- [ ] Rimossa `MANUAL_CONTRACTS_BLACKLIST` dal codice
- [ ] Build, commit, push, deploy
- [ ] Verificato run cron successivo (log GitHub Actions)

---

## 🎯 OBIETTIVO RAGGIUNTO

Quando **tutte le checkbox sono spuntate**, il sistema funzionerà **automaticamente** senza blacklist manuale:

✅ **Lead con contratti attivi** → automaticamente esclusi via `status NOT IN ('ACTIVE', 'CONTRACT_SIGNED')`  
✅ **Lead "NON INTERESSATI"** → automaticamente esclusi via `status != 'NOT_INTERESTED'`  
✅ **Priorità INTERESTED/TO_RECONTACT** → automatica via `ORDER BY CASE`  
✅ **Limite 30 reminder/giorno** → protezione budget rispettata  

**Blacklist manuale**: ❌ **NON PIÙ NECESSARIA**

---

## 📞 Supporto

- **API Diagnostica**: `/api/diagnostic/db-integrity`
- **Documentazione**: `DB-INTEGRITY-CHECK.md` (questo file)
- **GitHub Issue**: https://github.com/RobertoPoggi/telemedcare-v12/issues/13

