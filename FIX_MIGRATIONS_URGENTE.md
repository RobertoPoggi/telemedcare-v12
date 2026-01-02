# 🔧 FIX URGENTE - Verificare e Applicare Migrations Database

```
=====================================================
DOCUMENTO: Istruzioni Migrations Database
=====================================================
Data Creazione: 02 Gennaio 2026 - 09:35
Ultima Modifica: 02 Gennaio 2026 - 09:35
Database: telemedcare-leads
Priorità: 🔴 CRITICA
=====================================================
```

## ⚠️ ATTENZIONE - NOME DATABASE CORRETTO:

**Database**: `telemedcare-leads` ✅  
~~NON `telemedcare-v12-db`~~ ❌

## 🔍 PASSO 1: VERIFICA STATO ATTUALE (SENZA MODIFICARE NULLA)

Prima di fare QUALSIASI modifica, **verifica cosa c'è già**:

### Via Cloudflare Dashboard:

1. Vai su: https://dash.cloudflare.com/
2. Workers & Pages → D1
3. Seleziona: **`telemedcare-leads`**
4. Console → Execute SQL

**Esegui questi comandi di VERIFICA (READ-ONLY)**:

```sql
-- 1. Lista TUTTE le tabelle
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- 2. Conta i lead esistenti
SELECT COUNT(*) as total_leads FROM leads;

-- 3. Verifica se esiste document_templates
SELECT COUNT(*) as exists 
FROM sqlite_master 
WHERE type='table' AND name='document_templates';

-- 4. Se document_templates esiste, lista i template
SELECT id, name, type, active FROM document_templates ORDER BY id;
```

## 📊 RISULTATI ATTESI:

### Scenario A: document_templates NON ESISTE
```
Risultato query 3: exists = 0
```
→ **DEVI applicare migration 0002**

### Scenario B: document_templates ESISTE ma mancano template
```
Risultato query 4: 
- email_notifica_info ✅
- email_invio_contratto ✅
- email_documenti_informativi ❌ MANCA
```
→ **DEVI applicare solo migration 0007**

### Scenario C: Tutti i template ci sono
```
Risultato query 4:
- email_notifica_info ✅
- email_invio_contratto ✅
- email_documenti_informativi ✅
```
→ **NON serve fare nulla!** Il problema è altrove.

## 🚀 PASSO 2: APPLICARE MIGRATIONS (SOLO SE NECESSARIO)

### Se Scenario A (tabella non esiste):

Esegui **SOLO questa migration**:
- Copia il contenuto di `migrations/0002_add_missing_tables.sql`
- Incollalo nella console D1
- Execute

### Se Scenario B (manca template documenti):

Esegui **SOLO questa migration**:
- Copia il contenuto di `migrations/0007_add_email_documenti_template.sql`  
- Incollalo nella console D1
- Execute

## ✅ PASSO 3: VERIFICA POST-MIGRATION

```sql
-- Verifica che i 3 template siano presenti
SELECT id, name, active FROM document_templates WHERE id IN (
  'email_notifica_info',
  'email_documenti_informativi', 
  'email_invio_contratto'
);
```

Dovrebbe tornare **3 righe** tutte con `active = 1`.

## 🧪 PASSO 4: TEST FUNZIONAMENTO

Dopo le migrations (se necessarie), testa:

```bash
node test-single-lead.js
```

Output atteso:
```
✅ Lead creato: LEAD-MANUAL-...

📧 EMAIL:
   Notifica interno: ✅ INVIATA
   Brochure cliente: ✅ INVIATA
   Contratto cliente: ⚠️ FALLITA (Browser Puppeteer non configurato)
```

## 🎯 RIEPILOGO FIX APPLICATI:

1. ✅ Brochure PDF rinominate senza spazi
   - `Medica-GB-SiDLY_Care_PRO_ITA_compresso.pdf` (2.6 MB)
   - `Medica-GB-SiDLY_Vital_Care_ITA-compresso.pdf` (1.7 MB)

2. ✅ Corretti import workflow-email-manager
   - `inviaEmailNotificaInfo()` → notifica
   - `inviaEmailDocumentiInformativi()` → brochure
   - `inviaEmailContratto()` → contratto

3. ✅ Creata migration 0007 per template mancante

## ⚠️ IMPORTANTE:

- **NON eseguire migrations se non necessarie**
- **VERIFICA SEMPRE prima** cosa c'è nel database
- **Database**: `telemedcare-leads` (NON altri nomi)
- **Approccio**: CHIRURGICO - modifica solo ciò che serve

---

**Aggiornato**: 02 Gennaio 2026 - 09:30  
**Database**: `telemedcare-leads`  
**Priorità**: 🔴 CRITICA
