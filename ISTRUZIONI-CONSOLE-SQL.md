# 🎯 ISTRUZIONI CONSOLE SQL - 4 PASSI SEMPLICI

## 📍 TROVA LA CONSOLE SQL

Prova questi URL fino a trovare quello giusto:

1. **https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/workers-and-pages**
2. **https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/workers/d1**  
3. **https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/d1**

Una volta trovata la pagina, dovresti vedere **`telemedcare-leads`**.

Click su **`telemedcare-leads`** → Click tab **"Console"**

---

## ✅ APPLICA LE 4 MIGRAZIONI

### 📋 BATCH 1 - Core Schema (tabelle principali)

**File da aprire:** `migrations/BATCH_01_core_schema.sql`

**Cosa fare:**
1. Apri il file nel tuo editor di testo o su GitHub
2. Seleziona TUTTO il contenuto (Ctrl+A o Cmd+A)
3. Copia (Ctrl+C o Cmd+C)
4. Incolla nella Console SQL di Cloudflare
5. Click **"Execute"** o **"Run"**
6. ✅ Aspetta il messaggio "Success"

**Dimensione:** 299 righe  
**Crea:** leads, email_logs, contratti, proforma, pagamenti, dispositivi, configurazioni, document_templates, contracts

---

### 📧 BATCH 2 - Templates (email templates)

**File da aprire:** `migrations/BATCH_02_templates.sql`

**Cosa fare:**
1. Apri il file
2. Seleziona TUTTO (Ctrl+A)
3. Copia (Ctrl+C)
4. Incolla nella Console SQL
5. Click **"Execute"**
6. ✅ Aspetta "Success"

**Dimensione:** 2732 righe (è grande perché contiene tutti i template HTML delle email)  
**Aggiunge:** Template email documenti, configurazione, benvenuto, proforma, etc.

---

### 💼 BATCH 3 - Partners & Proforma

**File da aprire:** `migrations/BATCH_03_partners_proforma.sql`

**Cosa fare:**
1. Apri il file
2. Seleziona TUTTO
3. Copia
4. Incolla nella Console SQL
5. Click **"Execute"**
6. ✅ Aspetta "Success"

**Dimensione:** 192 righe  
**Crea:** partners, medical_providers, aggiorna proforma schema

---

### 🔧 BATCH 4 - Admin Features (IMPORTANTE!)

**File da aprire:** `migrations/BATCH_04_admin_features.sql`

**Cosa fare:**
1. Apri il file
2. Seleziona TUTTO
3. Copia
4. Incolla nella Console SQL
5. Click **"Execute"**
6. ✅ Aspetta "Success"

**Dimensione:** 236 righe  
**Crea:** docusign_envelopes, docusign_tokens, proformas (nuova tabella), devices, device_history  
**Aggiorna:** contracts con campi per firma manuale

**⚠️ QUESTO BATCH È CRITICO per l'Admin Dashboard!**

---

## 🎉 VERIFICA FINALE

Dopo aver applicato tutti e 4 i batch, esegui questo nella Console SQL:

```sql
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
```

Dovresti vedere almeno queste tabelle:
- ✅ leads
- ✅ email_logs
- ✅ contratti
- ✅ contracts
- ✅ proforma
- ✅ proformas
- ✅ pagamenti
- ✅ dispositivi
- ✅ devices
- ✅ device_history
- ✅ configurazioni
- ✅ document_templates
- ✅ partners
- ✅ medical_providers
- ✅ docusign_envelopes
- ✅ docusign_tokens

---

## 🆘 ERRORI COMUNI

### "table already exists"
✅ **NON È UN PROBLEMA!** Significa che quella tabella era già presente.  
→ Continua con il batch successivo

### "syntax error near..."
❌ **Problema:** Non hai copiato tutto il file  
→ Assicurati di selezionare TUTTO il contenuto (dalla prima all'ultima riga)

### "Console SQL non risponde"
⏳ Il batch 2 è grande (2732 righe), può impiegare 10-20 secondi  
→ Aspetta senza cliccare niente

### "database locked"
🔒 Il database è in uso da un'altra operazione  
→ Aspetta 30 secondi e riprova

---

## ✨ DOPO IL COMPLETAMENTO

Una volta applicati tutti e 4 i batch:

1. ✅ **Database pronto!**
2. ⏳ **GitHub Actions** sta deployando (controlla: https://github.com/RobertoPoggi/telemedcare-v11/actions)
3. 🎉 **Tra 2-3 minuti, vai su:**
   - 🌐 **Admin Dashboard**: https://telemedcare-v11.pages.dev/admin-dashboard
   - 🌐 **Form Lead**: https://telemedcare-v11.pages.dev/

---

## 💡 TIPS

- **Puoi aprire i file batch direttamente su GitHub:**  
  https://github.com/RobertoPoggi/telemedcare-v11/tree/main/migrations

- **Non chiudere la Console SQL** tra un batch e l'altro

- **Se un batch fallisce completamente**, prova con il file consolidato alternativo:  
  `migrations/ALL_MIGRATIONS_CONSOLIDATED.sql`

---

**🚀 Buon lavoro! In 5 minuti il sistema sarà LIVE!**
