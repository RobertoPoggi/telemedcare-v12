# 🚀 ISTRUZIONI PER APPLICARE LE MIGRAZIONI AL DATABASE

## Panoramica
Le migrazioni del database sono state preparate in **4 batch files** per facilitare l'applicazione tramite la Dashboard Cloudflare.

## ⚠️ IMPORTANTE
Il tuo API token non ha i permessi necessari per applicare le migrazioni da riga di comando.  
**SOLUZIONE**: Applicherai le migrazioni manualmente tramite la Dashboard Cloudflare (richiede 2-3 minuti).

---

## 📋 PROCEDURA STEP-BY-STEP

### 1️⃣ Apri la Dashboard Cloudflare

Vai su: https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/workers-and-pages/d1

### 2️⃣ Seleziona il Database

Clicca su: **telemedcare-leads**

### 3️⃣ Apri la Console SQL

Nella pagina del database, clicca sulla tab **"Console"**

### 4️⃣ Applica i Batch Files (IN ORDINE!)

Devi applicare **4 batch files** uno alla volta, **nell'ordine indicato**:

#### **BATCH 1 - Core Schema** (Tabelle fondamentali)
📄 File: `migrations/BATCH_01_core_schema.sql`

1. Apri il file `migrations/BATCH_01_core_schema.sql`
2. Copia **tutto il contenuto** del file
3. Incolla nella Console SQL della Dashboard
4. Clicca **"Execute"**
5. ✅ Verifica che appaia "Success"

---

#### **BATCH 2 - Templates** (Template email e documenti)
📄 File: `migrations/BATCH_02_templates.sql`

1. Apri il file `migrations/BATCH_02_templates.sql`
2. Copia **tutto il contenuto** del file
3. Incolla nella Console SQL della Dashboard
4. Clicca **"Execute"**
5. ✅ Verifica che appaia "Success"

---

#### **BATCH 3 - Partners & Proforma** (Partner, fornitori, proforma)
📄 File: `migrations/BATCH_03_partners_proforma.sql`

1. Apri il file `migrations/BATCH_03_partners_proforma.sql`
2. Copia **tutto il contenuto** del file
3. Incolla nella Console SQL della Dashboard
4. Clicca **"Execute"**
5. ✅ Verifica che appaia "Success"

---

#### **BATCH 4 - Admin Features** (DocuSign, Proformas, Devices, Admin Dashboard)
📄 File: `migrations/BATCH_04_admin_features.sql`

1. Apri il file `migrations/BATCH_04_admin_features.sql`
2. Copia **tutto il contenuto** del file
3. Incolla nella Console SQL della Dashboard
4. Clicca **"Execute"**
5. ✅ Verifica che appaia "Success"

---

## ✅ VERIFICA FINALE

Dopo aver applicato tutti i 4 batch, verifica che le tabelle siano state create:

Nella Console SQL, esegui questo comando:

```sql
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
```

Dovresti vedere queste tabelle (almeno):
- ✅ leads
- ✅ contracts
- ✅ contracts_documenti
- ✅ email_templates
- ✅ partners
- ✅ medical_providers
- ✅ proformas
- ✅ devices
- ✅ device_history
- ✅ docusign_envelopes
- ✅ docusign_tokens

---

## 🎉 COMPLETAMENTO

Una volta applicate **tutte le 4 batch migrations**:

1. **Il database è pronto!** ✅
2. **GitHub Actions** rileverà automaticamente il push e **deployerà l'applicazione** su Cloudflare Pages
3. Dopo 2-3 minuti, l'applicazione sarà **LIVE** su:
   - 🌐 **Admin Dashboard**: https://telemedcare-v11.pages.dev/admin-dashboard
   - 🌐 **API**: https://telemedcare-v11.pages.dev/api/admin/dashboard/stats

---

## 🆘 TROUBLESHOOTING

### Errore "table already exists"
**Non è un problema!** Significa che quella tabella era già presente. Continua con il batch successivo.

### Errore "syntax error"
Assicurati di:
1. Copiare **TUTTO il contenuto** del file (incluse le prime e ultime righe)
2. Non modificare il file prima di copiarlo
3. Incollare nella Console SQL senza modifiche

### La Console SQL non risponde
1. Ricarica la pagina della Dashboard
2. Riprova con lo stesso batch file

---

## 📌 FILE DI BACKUP

Se preferisci applicare TUTTE le migrazioni in un colpo solo (file più grande):

📄 **File alternativo**: `migrations/ALL_MIGRATIONS_CONSOLIDATED.sql`  
⚠️ Questo file è più grande (129KB) e potrebbe richiedere più tempo per l'elaborazione.

---

## 🚀 PROSSIMI PASSI

Dopo aver completato le migrazioni:

1. ✅ Le migrazioni sono applicate
2. ⏳ GitHub Actions sta deployando (controlla: https://github.com/YOUR_REPO/actions)
3. 🎉 Tra 2-3 minuti, vai su https://telemedcare-v11.pages.dev/admin-dashboard
4. 🔐 Login con le tue credenziali admin
5. 🎯 Inizia a gestire leads, contratti, proformas e devices!

---

**📝 Note**: Le migrazioni sono **idempotenti** (puoi applicarle più volte senza problemi).  
Se vedi errori tipo "table already exists", è normale - significa che quella parte era già applicata.

---

**✨ Buon lavoro! Una volta completate le migrazioni, avrai l'intera applicazione TelemedCare in produzione!**
