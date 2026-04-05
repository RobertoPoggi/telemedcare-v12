# 🎯 REGOLE REMINDER AVANZATE - TeleMedCare V12

**Data implementazione**: 2026-03-02  
**Commit**: In corso

---

## 📋 REGOLE IMPLEMENTATE

### 1. 🛡️ Limite Giornaliero
- **Valore**: **30 reminder/giorno** (ridotto da 50)
- **Motivo**: Budget più controllato (30% quota invece di 50%)
- **Impatto**: 233 lead coperti in ~8 giorni invece di 5

### 2. 🎯 Priorità di Invio

**Ordine di priorità:**
1. ✅ **INTERESTED** (Interessati) - Massima priorità
2. ✅ **TO_RECONTACT** (Da ricontattare) - Alta priorità
3. ✅ Altri stati validi - Priorità normale
4. ⏰ **Più vecchi per primi** (created_at ASC) - All'interno di ogni priorità

**Query SQL:**
```sql
ORDER BY 
  CASE l.status
    WHEN 'INTERESTED' THEN 1      -- Priorità 1
    WHEN 'TO_RECONTACT' THEN 2    -- Priorità 2
    ELSE 3                         -- Priorità 3
  END,
  l.created_at ASC                 -- Più vecchi per primi
```

### 3. ❌ Esclusioni Automatiche

#### A. Lead già Convertiti (Status)
**Esclusi:**
- `CONTRACT_SIGNED` - Contratto firmato
- `ACTIVE` - Cliente attivo

**Motivo**: Hanno già completato il processo, non serve reminder

**SQL:**
```sql
AND l.status NOT IN ('CONTRACT_SIGNED', 'ACTIVE')
```

#### B. Lead Non Interessati
**Esclusi:**
- `NOT_INTERESTED` - Non interessati

**Motivo**: Non vogliono ricevere comunicazioni

**SQL:**
```sql
AND l.status != 'NOT_INTERESTED'
```

#### C. Blacklist Manuale (Contratti NON nel DB)
**Esclusi per nome:**
- Margherita Delaude
- Maria Grazia Ronca
- Andrea D'Avella (lead per Maria Grazia Ronca)

**Motivo**: Contratti firmati manualmente, non ancora nel DB

**Codice:**
```typescript
const MANUAL_CONTRACTS_BLACKLIST = [
  'Margherita Delaude',
  'Maria Grazia Ronca', 
  'Andrea D\'Avella'
]

// Confronto case-insensitive su nome completo
const nomeCognome = `${token.nomeRichiedente} ${token.cognomeRichiedente}`.trim()
const isBlacklisted = MANUAL_CONTRACTS_BLACKLIST.some(name => 
  nomeCognome.toLowerCase().includes(name.toLowerCase()) ||
  name.toLowerCase().includes(nomeCognome.toLowerCase())
)
```

---

## 🔄 FLUSSO COMPLETO

### Step 1: Query Database
```
SELECT token FROM lead_completion_tokens + JOIN leads
WHERE:
  - completed = 0 (non completato)
  - expires_at > now (non scaduto)
  - reminder_count < 2 (max 2 reminder)
  - passati 3+ giorni dall'ultimo reminder
  - status NOT IN ('CONTRACT_SIGNED', 'ACTIVE')
  - status != 'NOT_INTERESTED'
ORDER BY:
  - status (INTERESTED > TO_RECONTACT > altri)
  - created_at ASC (più vecchi primi)
```

**Risultato**: Es. 200 token trovati

### Step 2: Filtro Blacklist
```typescript
tokens = 200
↓ Filtro blacklist manuale (3 nomi)
tokensFiltered = 197 (3 saltati)
```

**Log:**
```
🚫 [REMINDER] Skipped (blacklist): Margherita Delaude (lead LEAD-XXX)
🚫 [REMINDER] Skipped (blacklist): Maria Grazia Ronca (lead LEAD-YYY)
🚫 [REMINDER] Skipped (blacklist): Andrea D'Avella (lead LEAD-ZZZ)
📊 [REMINDER] Dopo filtro blacklist: 197 token (3 saltati)
```

### Step 3: Limite Giornaliero
```typescript
tokensFiltered = 197
↓ Applica limite 30/giorno
tokensToProcess = 30 (167 rimangono in coda)
```

**Log:**
```
⚠️ [REMINDER] Budget limit: 30 invii/giorno
📊 [REMINDER] Processando 30/197 token (167 in coda)
```

### Step 4: Invio Email
```
Per ogni token (30 totali):
  1. Carica dati lead dal DB
  2. Verifica email valida
  3. Invia reminder
  4. Aggiorna reminder_count
  5. Pausa 1 secondo (rate limiting)
```

**Risultato finale:**
```json
{
  "success": 28,        // Email inviate
  "failed": 2,          // Email fallite
  "total": 30,          // Token processati
  "queued": 167,        // Lead in coda
  "blacklisted": 3      // Lead saltati (blacklist)
}
```

---

## 📊 IMPATTO MODIFICHE

### Prima (50 reminder/giorno)
| Giorno | Email | Budget | Lead Rimanenti |
|--------|-------|--------|----------------|
| 1 | 50 | 50% | 183 |
| 2 | 50 | 50% | 133 |
| 3 | 50 | 50% | 83 |
| 4 | 50 | 50% | 33 |
| 5 | 33 | 33% | 0 |
| **Totale** | **233** | **~45% medio** | **5 giorni** |

### Adesso (30 reminder/giorno)
| Giorno | Email | Budget | Lead Rimanenti |
|--------|-------|--------|----------------|
| 1 | 30 | 30% | 200 |
| 2 | 30 | 30% | 170 |
| 3 | 30 | 30% | 140 |
| 4 | 30 | 30% | 110 |
| 5 | 30 | 30% | 80 |
| 6 | 30 | 30% | 50 |
| 7 | 30 | 30% | 20 |
| 8 | 20 | 20% | 0 |
| **Totale** | **230** | **~29% medio** | **8 giorni** |

**Nota**: 3 lead saltati (blacklist) = 230 invece di 233

---

## 🎯 VANTAGGI NUOVE REGOLE

### 1. Budget Più Sicuro
- ✅ 30% budget invece di 50%
- ✅ Più spazio per email urgenti (contratti, proforma)
- ✅ Minor rischio esaurimento quota

### 2. Priorità Intelligente
- ✅ Lead "Interessati" ricevono reminder per primi
- ✅ Lead "Da ricontattare" hanno alta priorità
- ✅ Lead più vecchi non vengono dimenticati

### 3. Esclusioni Precise
- ✅ Nessun reminder a clienti già attivi
- ✅ Nessun reminder a lead non interessati
- ✅ Blacklist per contratti manuali non ancora nel DB

### 4. Logging Dettagliato
```
📧 [REMINDER] Trovati 200 token che necessitano reminder
🚫 [REMINDER] Skipped (blacklist): Margherita Delaude
🚫 [REMINDER] Skipped (blacklist): Maria Grazia Ronca
🚫 [REMINDER] Skipped (blacklist): Andrea D'Avella
📊 [REMINDER] Dopo filtro blacklist: 197 token (3 saltati)
⚠️ [REMINDER] Budget limit: 30 invii/giorno
📊 [REMINDER] Processando 30/197 token (167 in coda)
✅ [REMINDER] Processo completato: 28 successo, 2 falliti
```

---

## 🔧 MANUTENZIONE BLACKLIST

### Come Aggiornare la Blacklist

**File**: `src/modules/lead-completion.ts`

**Quando aggiungere un lead:**
- ✅ Contratto firmato manualmente (non nel DB)
- ✅ Cliente attivo (non nel DB con status ACTIVE)
- ✅ Lead che ha richiesto esplicitamente di non essere contattato

**Come aggiungere:**
```typescript
const MANUAL_CONTRACTS_BLACKLIST = [
  'Margherita Delaude',
  'Maria Grazia Ronca', 
  'Andrea D\'Avella',
  'Nuovo Cliente Manuale'  // ✅ Aggiungi qui
]
```

**Quando rimuovere:**
- ✅ Contratto manuale aggiunto al DB con status CONTRACT_SIGNED
- ✅ Lead riattivato e interessato a ricevere reminder

---

## 📝 STATI LEAD NEL DATABASE

### Stati Validi per Reminder
- ✅ `INTERESTED` - Interessati (Priorità 1)
- ✅ `TO_RECONTACT` - Da ricontattare (Priorità 2)
- ✅ `NEW` - Nuovo lead (Priorità 3)
- ✅ `CONTACTED` - Contattato (Priorità 3)
- ✅ `QUALIFIED` - Qualificato (Priorità 3)

### Stati Esclusi da Reminder
- ❌ `CONTRACT_SIGNED` - Contratto firmato
- ❌ `ACTIVE` - Cliente attivo
- ❌ `NOT_INTERESTED` - Non interessato
- ❌ `CLOSED_LOST` - Perso (opzionale)

---

## 🧪 TEST CONSIGLIATI

### Test 1: Verifica Priorità
```sql
-- Query per vedere ordine invio
SELECT 
  l.id,
  l.nomeRichiedente,
  l.cognomeRichiedente,
  l.status,
  l.created_at,
  t.reminder_count,
  CASE l.status
    WHEN 'INTERESTED' THEN 'Priorità 1'
    WHEN 'TO_RECONTACT' THEN 'Priorità 2'
    ELSE 'Priorità 3'
  END as priority
FROM lead_completion_tokens t
JOIN leads l ON t.lead_id = l.id
WHERE t.completed = 0
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
```

### Test 2: Verifica Blacklist
```sql
-- Query per verificare lead in blacklist
SELECT 
  l.id,
  l.nomeRichiedente,
  l.cognomeRichiedente,
  l.email,
  l.status
FROM leads l
WHERE 
  (l.nomeRichiedente || ' ' || l.cognomeRichiedente) LIKE '%Margherita Delaude%'
  OR (l.nomeRichiedente || ' ' || l.cognomeRichiedente) LIKE '%Maria Grazia Ronca%'
  OR (l.nomeRichiedente || ' ' || l.cognomeRichiedente) LIKE '%Andrea D''Avella%'
```

### Test 3: Simulazione Invio
```bash
# Test manuale endpoint
curl -X POST https://telemedcare-v12.pages.dev/api/cron/send-reminders \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json"

# Verifica response
{
  "success": 28,
  "failed": 2,
  "total": 30,
  "queued": 167,
  "blacklisted": 3
}
```

---

## ✅ CHECKLIST IMPLEMENTAZIONE

- [x] ✅ Ridotto limite da 50 a 30 reminder/giorno
- [x] ✅ Implementata priorità per status (INTERESTED > TO_RECONTACT)
- [x] ✅ Ordinamento più vecchi per primi (created_at ASC)
- [x] ✅ Esclusi lead CONTRACT_SIGNED e ACTIVE
- [x] ✅ Esclusi lead NOT_INTERESTED
- [x] ✅ Blacklist manuale (Margherita Delaude, Maria Grazia Ronca, Andrea D'Avella)
- [x] ✅ Logging dettagliato blacklist
- [x] ✅ Response JSON estesa (queued, blacklisted)
- [ ] ⏳ Build e deploy
- [ ] ⏳ Test in produzione

---

**📝 Note**: 
- La blacklist è **case-insensitive** e cerca match parziali
- Lead già attivi via DB (status ACTIVE) sono esclusi automaticamente dalla query
- La blacklist serve solo per contratti **manuali non ancora nel DB**
