# 🔍 VERIFICA CONTRATTI MANUALI (Locatelli, Pepe, Macchi)

## ✅ Checklist di Verifica

### 1. Contratti Vecchi CANCELLATI
Esegui questa query nel D1 Database Studio:
```sql
SELECT id, codice_contratto, status
FROM contracts
WHERE id LIKE 'contract-locatelli-%'
   OR id LIKE 'contract-pepe-%'
   OR id LIKE 'contract-macchi-%';
```
**Risultato atteso**: **0 righe** (devono essere stati cancellati)

---

### 2. Contratti Nuovi INSERITI CORRETTAMENTE
Esegui questa query:
```sql
SELECT 
  id,
  codice_contratto,
  leadId,
  tipo_contratto,
  piano,
  prezzo_mensile,
  prezzo_totale,
  data_scadenza,
  status,
  pdf_url,
  created_at
FROM contracts
WHERE id LIKE 'CONTRACT_CTR-LOCATELLI-2026_%'
   OR id LIKE 'CONTRACT_CTR-PEPE-2026_%'
   OR id LIKE 'CONTRACT_CTR-MACCHI-2026_%'
ORDER BY id;
```

**Risultato atteso**: **3 righe** con questi dati:

#### Contratto 1: Alberto Locatelli
- ✅ `id` = `CONTRACT_CTR-LOCATELLI-2026_[timestamp]`
- ✅ `codice_contratto` = `CONTRACT_CTR-LOCATELLI-2026_[timestamp]` (**DEVE ESSERE UGUALE A id**)
- ✅ `leadId` = `LEAD-1RBE9A-00162` (Alberto Locatelli)
- ✅ `tipo_contratto` = `BASE`
- ✅ `piano` = `BASE`
- ✅ `prezzo_mensile` = `48.80` (585.60 / 12)
- ✅ `prezzo_totale` = `585.60`
- ✅ `data_scadenza` = `2027-02-02` (03/02/2026 + 12 mesi - 1 giorno)
- ✅ `status` = `SIGNED`
- ✅ `pdf_url` = `/uploaded_files/03.02.2026_signor Locatelli_BASE_SIDLY VITAL CARE.pdf`

#### Contratto 2: Francesco Pepe
- ✅ `id` = `CONTRACT_CTR-PEPE-2026_[timestamp]`
- ✅ `codice_contratto` = `CONTRACT_CTR-PEPE-2026_[timestamp]` (**UGUALE**)
- ✅ `leadId` = `LEAD-1RBE9A-00097` (Francesco Pepe)
- ✅ `tipo_contratto` = `BASE`
- ✅ `data_scadenza` = `2027-01-26` (27/01/2026 + 12 mesi - 1 giorno)
- ✅ `status` = `SIGNED`
- ✅ `pdf_url` = `/uploaded_files/27.01.2026_Pepe Francesco Contratto.pdf`

#### Contratto 3: Claudio Macchi
- ✅ `id` = `CONTRACT_CTR-MACCHI-2026_[timestamp]`
- ✅ `codice_contratto` = `CONTRACT_CTR-MACCHI-2026_[timestamp]` (**UGUALE**)
- ✅ `leadId` = `LEAD-1RBE9A-00001` (Claudio Macchi)
- ✅ `tipo_contratto` = `BASE`
- ✅ `data_scadenza` = `2027-01-31` (01/02/2026 + 12 mesi - 1 giorno)
- ✅ `status` = `SIGNED`
- ✅ `pdf_url` = `/uploaded_files/Documento x Claudio Macchi.pdf`

---

### 3. Verifica DASHBOARD
Vai su: https://telemedcare-v12.pages.dev/admin/leads-dashboard

**Tab**: Contratti

**Filtra per cliente**: Locatelli, Pepe, Macchi

**Verifica che ci siano**:
- ✅ 3 contratti totali (NO duplicati!)
- ✅ Tutti con status "Firmato"
- ✅ Date di scadenza nel 2027
- ✅ Codice contratto formato `CONTRACT_CTR-COGNOME-2026_...`

---

### 4. Verifica PDF
Clicca sull'icona PDF di ogni contratto e verifica che si apra il PDF corretto:
- ✅ Locatelli → `03.02.2026_signor Locatelli_BASE_SIDLY VITAL CARE.pdf`
- ✅ Pepe → `27.01.2026_Pepe Francesco Contratto.pdf`
- ✅ Macchi → `Documento x Claudio Macchi.pdf`

---

## 🚨 PROBLEMI COMUNI

### Problema: ID ≠ codice_contratto
**Sintomo**: `id` = `contract-locatelli-123` ma `codice_contratto` = `CONTRACT_CTR-LOCATELLI-2026_123`

**Soluzione**: Ri-esegui il fix:
1. Vai su https://telemedcare-v12.pages.dev/test-fix-3-contracts
2. Clicca "🔧 Correggi i 3 Contratti"

### Problema: Date sbagliate
**Sintomo**: `data_scadenza` = `2026-02-03` (anziché `2027-02-02`)

**Causa**: Calcolo scadenza errato (manca +1 anno)

### Problema: PDF non visibili
**Sintomo**: `pdf_url` = NULL o vuoto

**Causa**: Campo `pdf_url` non popolato nell'INSERT

---

## 📸 Screenshot Richiesti

Per verificare completamente, invia screenshot di:
1. **Dashboard Contratti** (filtrata per i 3 lead)
2. **D1 Studio** con il risultato della query di verifica
3. **Apertura di 1 PDF** per confermare il collegamento

