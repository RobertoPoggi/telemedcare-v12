# 🚀 DEPLOY AUTOMATICO IN 1 CLICK

## ⚠️ IMPORTANTE: Il token non ha permessi per creare database

Ho tentato di fare tutto automaticamente, ma il token API non ha i permessi necessari per creare il database D1.

---

## ✅ SOLUZIONE: 3 CLICK E SEI ONLINE (2 MINUTI)

### CLICK 1: Vai su Cloudflare e collega GitHub

**Apri questo link diretto:**
https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/pages/new/provider/github

Questo link ti porta **DIRETTAMENTE** alla pagina per collegare GitHub!

1. Clicca "Connect GitHub"
2. Autorizza Cloudflare
3. Seleziona repository: `telemedcare-v11`
4. Clicca "Begin setup"

---

### CLICK 2: Configura il build

Nella pagina di configurazione, inserisci:

**Project name:** `telemedcare-v11`
**Production branch:** `main`
**Build command:** `npm run build`
**Build output directory:** `dist`

**Environment variables (clicca Add variable):**
```
RESEND_API_KEY = re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt
EMAIL_FROM = noreply@telemedcare.it
EMAIL_TO_INFO = info@telemedcare.it
ENVIRONMENT = production
DEBUG_MODE = false
```

Poi clicca: **"Save and Deploy"**

---

### CLICK 3: Crea database D1 e collega

**Mentre il primo deploy sta girando**, apri in un'altra tab:

1. **Vai su:** https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/workers-and-pages/d1
2. **Clicca:** "Create database"
3. **Nome:** `telemedcare-leads`
4. **Clicca:** "Create"
5. **Copia il database ID** che ti mostra (formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

Poi:

6. **Torna su Pages:** https://dash.cloudflare.com/73e144e1ddc4f4af162d17c313e00c06/pages
7. **Clicca** sul progetto `telemedcare-v11`
8. **Vai su:** Settings → Functions → D1 database bindings
9. **Clicca:** "Add binding"
   - Variable name: `DB`
   - D1 database: seleziona `telemedcare-leads`
10. **Salva**

---

### ULTIMO STEP: Applica le migrations

Nel terminale, esegui questi 2 comandi (copia-incolla):

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN="zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3"
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0001_create_leads_table.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0002_create_informazioni_paziente_table.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0003_update_leads_add_status.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0004_update_leads_add_email_fields.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0005_create_document_metadata_table.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0006_fix_data_types_and_foreign_keys.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0007_add_missing_tables.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0008_add_notification_timestamps.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0009_update_document_metadata.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0010_add_referral_tracking.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0011_add_tracking_to_leads.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0012_add_document_sent_at.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0013_create_contracts_table.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0019_create_docusign_envelopes_table.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0020_create_docusign_tokens_table.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0021_create_proformas_table.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0022_create_devices_table.sql
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0023_update_contracts_status.sql
```

**OPPURE usa questo comando unico (più veloce):**

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN="zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3"
for file in migrations/*.sql; do echo "Applying $file..."; npx wrangler d1 execute telemedcare-leads --remote --file="$file"; done
```

---

## 🎉 FATTO!

Il tuo sito sarà live su: **https://telemedcare-v11.pages.dev**

Admin dashboard: **https://telemedcare-v11.pages.dev/admin-dashboard**

---

## 🔄 DA ORA IN POI:

Ogni `git push` farà deploy automatico!

Zero configurazione, zero problemi, tutto automatico! 🚀

---

## ⏱️ TEMPO TOTALE: 5 MINUTI

- Click 1: 1 minuto
- Click 2: 2 minuti  
- Click 3: 1 minuto
- Migrations: 1 minuto

**TOTALE: 5 minuti e sei online con deploy automatico!**
