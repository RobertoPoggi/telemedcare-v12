# 🔧 FIX URGENTE - Migrations Database Mancanti

## ❌ PROBLEMA IDENTIFICATO:

Il sistema del 25 dicembre **funzionava** perché aveva la tabella `document_templates` popolata con i template email nel database D1.

**Attualmente su Cloudflare D1 MANCA**:
- ❌ Tabella `document_templates`
- ❌ Template `email_notifica_info`
- ❌ Template `email_documenti_informativi`
- ❌ Template `email_invio_contratto`

## 📋 MIGRATIONS DA ESEGUIRE:

Le seguenti migrations **DEVONO essere eseguite** su Cloudflare D1:

1. `migrations/0001_clean_schema.sql` o `0001_initial_schema.sql`
2. `migrations/0002_add_missing_tables.sql` ✅ **CREA document_templates**
3. `migrations/0003_add_proformas_table.sql`
4. `migrations/0004_create_assistiti_table.sql`
5. `migrations/0005_fix_contracts_schema.sql`
6. `migrations/0006_add_piano_and_servizio_to_leads.sql` ✅ Già applicata
7. `migrations/0007_add_email_documenti_template.sql` ✅ **NUOVO - Template brochure**

## 🚀 COME APPLICARE LE MIGRATIONS:

### Opzione 1: Via Cloudflare Dashboard (CONSIGLIATO)

1. Vai su: https://dash.cloudflare.com/
2. Workers & Pages → D1
3. Seleziona database: `telemedcare-v12-db`
4. Console → Execute SQL

Esegui **UNO PER UNO** questi comandi:

```sql
-- 1. Verifica tabelle esistenti
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- 2. Se document_templates NON esiste, esegui migrations/0002_add_missing_tables.sql
-- Copia-incolla TUTTO il contenuto del file 0002

-- 3. Verifica template creati
SELECT id, name FROM document_templates;

-- 4. Se manca email_documenti_informativi, esegui migration 0007
-- Copia-incolla il contenuto di 0007_add_email_documenti_template.sql
```

### Opzione 2: Via Wrangler CLI (richiede setup)

Se hai Wrangler configurato:

```bash
# Lista databases
npx wrangler d1 list

# Esegui migration singola
npx wrangler d1 execute telemedcare-v12-db --file=migrations/0002_add_missing_tables.sql --remote

# Esegui migration 0007
npx wrangler d1 execute telemedcare-v12-db --file=migrations/0007_add_email_documenti_template.sql --remote

# Verifica
npx wrangler d1 execute telemedcare-v12-db --command="SELECT id, name FROM document_templates;" --remote
```

## ✅ VERIFICA POST-MIGRATION:

Dopo aver applicato le migrations, verifica che esistano questi 3 template:

```sql
SELECT id, name, active FROM document_templates WHERE id IN (
  'email_notifica_info',
  'email_documenti_informativi', 
  'email_invio_contratto'
);
```

Dovrebbe tornare **3 righe**.

## 🧪 TEST FUNZIONAMENTO:

Dopo le migrations, testa con:

```bash
node test-single-lead.js
```

Dovresti vedere:
```
✅ Lead creato: LEAD-MANUAL-...

📧 EMAIL:
   Notifica interno: ✅ INVIATA
   Brochure cliente: ✅ INVIATA
   Contratto cliente: ✅ INVIATA  (o ❌ se Puppeteer non configurato)
```

## 📝 NOTE IMPORTANTI:

1. **Browser Puppeteer**: Il contratto PDF richiede Browser Rendering configurato in Cloudflare
   - Se NON configurato → contratto fallisce
   - Notifica e brochure **funzionano comunque**

2. **Brochure PDF**: Ora usa file compressi senza spazi
   - `Medica-GB-SiDLY_Care_PRO_ITA_compresso.pdf` (2.6 MB)
   - `Medica-GB-SiDLY_Vital_Care_ITA-compresso.pdf` (1.7 MB)

3. **Template hardcoded**: ❌ **MAI usare**! Sistema usa DB come il 25 dicembre

---

**Creato**: 02 Gennaio 2026 - 09:30
**Priorità**: 🔴 CRITICA - Sistema bloccato senza migrations
