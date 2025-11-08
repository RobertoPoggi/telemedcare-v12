# ⚡ SOLUZIONE SEMPLICE - 2 PASSI

## Hai ragione! È molto più semplice così:

---

## 🔧 PASSO 1: Aggiorna Permessi Token (1 minuto)

### Vai qui:
👉 **https://dash.cloudflare.com/profile/api-tokens**

### Trova il tuo token o creane uno nuovo

### Aggiungi questi permessi:
- ✅ **Account → D1 → Edit**
- ✅ **Account → Cloudflare Pages → Edit**

### Save!

---

## 🚀 PASSO 2: Applica Migrazioni (30 secondi)

### Apri terminale ed esegui:

```bash
cd /home/user/webapp
./apply-migrations.sh
```

### Oppure manualmente:

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN="zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3"

for file in migrations/0001_initial_schema.sql \
            migrations/0002_add_missing_tables.sql \
            migrations/0003_fix_schema.sql \
            migrations/0004_add_missing_templates.sql \
            migrations/0005_create_partners_providers.sql \
            migrations/0006_fix_email_templates.sql \
            migrations/0007_fix_proforma_schema.sql \
            migrations/0008_add_missing_lead_fields.sql \
            migrations/0009_update_email_documenti_template.sql \
            migrations/0012_populate_templates.sql \
            migrations/0018_update_email_contratto_dynamic.sql \
            migrations/0019_create_docusign_envelopes_table.sql \
            migrations/0020_create_docusign_tokens_table.sql \
            migrations/0021_create_proformas_table.sql \
            migrations/0022_create_devices_table.sql \
            migrations/0023_update_contracts_status.sql; do
  echo "Applying $file..."
  npx wrangler d1 execute telemedcare-leads --remote --file="$file"
done
```

---

## 🎉 FATTO!

### Il sistema sarà live su:
- 🌐 **Admin Dashboard**: https://telemedcare-v11.pages.dev/admin-dashboard
- 🌐 **Form Lead**: https://telemedcare-v11.pages.dev/

---

## 💡 Se Vuoi Evitare Anche Questo:

### Opzione 3: Token Nuovo con Permessi Corretti

**Crea un nuovo token qui:**
👉 https://dash.cloudflare.com/profile/api-tokens

**Seleziona template:** "Edit Cloudflare Workers"

**Aggiungi anche:** D1 → Edit

**Copia il nuovo token e sostituiscilo in `wrangler.jsonc`**

Poi commit, push, e le migrazioni si applicheranno automaticamente!

---

**Scusa per aver complicato inutilmente. Hai ragione al 100%!** 😅
