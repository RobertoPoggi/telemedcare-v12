# 🎯 TeleMedCare V11.0 - Clean Email System

## 📋 Overview

Sistema email **pulito, testato e funzionante** creato il 30 Ottobre 2025.

### ✅ Cosa È Stato Fatto

1. **Schema Database Pulito** (`migrations/0001_clean_schema.sql`)
   - Tabella `leads` con tutti i campi necessari
   - Tabella `document_templates` semplificata e funzionante
   - Tabella `contracts` per workflow completo
   - Indici ottimizzati

2. **Template Loader Pulito** (`src/modules/template-loader-clean.ts`)
   - Caricamento affidabile da database D1
   - Sostituzione placeholder garantita
   - Gestione errori robusta
   - Query SQL semplice: `WHERE name = ?`

3. **Template Email Professionale**
   - Template `email_notifica_info` (12.6KB)
   - HTML responsive con PicoCSS
   - Placeholder: `{{NOME_RICHIEDENTE}}`, `{{EMAIL_RICHIEDENTE}}`, ecc.
   - Subject dinamico con dati lead

4. **Workflow Email Aggiornato**
   - Usa template loader pulito
   - Dati placeholder corretti
   - Email a `info@telemedcare.it`
   - Supporto SendGrid + Resend

---

## 🗄️ Schema Database

### Tabella `document_templates`

```sql
CREATE TABLE document_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,          -- Nome template (es: 'email_notifica_info')
  category TEXT NOT NULL,             -- Categoria (es: 'EMAIL')
  subject TEXT,                       -- Subject email con placeholder
  html_content TEXT NOT NULL,         -- HTML template completo
  variables TEXT,                     -- JSON array variabili richieste
  active INTEGER DEFAULT 1,           -- Template attivo/disattivo
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

### Template Inserito

- **Name**: `email_notifica_info`
- **Category**: `EMAIL`
- **Size**: 12,611 bytes
- **Subject**: `🆕 Nuovo Lead: {{NOME_RICHIEDENTE}} {{COGNOME_RICHIEDENTE}} - {{PIANO_SERVIZIO}}`
- **Placeholder**: 12 variabili disponibili

---

## 🔧 Setup Locale

### 1. Applica Migration

```bash
cd /home/user/webapp
npx wrangler d1 execute telemedcare-leads --local --file=migrations/0001_clean_schema.sql
```

### 2. Inserisci Template

```bash
# Script già creato in /tmp/insert_template.sql
npx wrangler d1 execute telemedcare-leads --local --file=/tmp/insert_template.sql
```

### 3. Verifica Template

```bash
npx wrangler d1 execute telemedcare-leads --local --command="
SELECT name, category, length(html_content) as size, active 
FROM document_templates;
"
```

### 4. Build & Run

```bash
npm run build
npm run dev
```

---

## 📧 Test Email

### Endpoint Test

```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Roberto",
    "cognome": "Poggi",
    "email": "roberto.poggi@medicagb.com",
    "telefono": "+39 335 1234567",
    "servizio": "BASE",
    "note": "Test sistema email pulito"
  }'
```

### Risposta Attesa

```json
{
  "success": true,
  "leadId": "LEAD_2025-10-30T...",
  "message": "Lead ricevuto e processato con successo",
  "workflow": {
    "success": true,
    "step": "process_new_lead",
    "message": "...",
    "errors": []
  }
}
```

---

## ✅ Placeholder Supportati

Il template `email_notifica_info` supporta questi placeholder:

- `{{NOME_RICHIEDENTE}}` - Nome del richiedente
- `{{COGNOME_RICHIEDENTE}}` - Cognome del richiedente
- `{{EMAIL_RICHIEDENTE}}` - Email del richiedente
- `{{TELEFONO_RICHIEDENTE}}` - Telefono del richiedente
- `{{NOME_ASSISTITO}}` - Nome dell'assistito
- `{{COGNOME_ASSISTITO}}` - Cognome dell'assistito
- `{{CONDIZIONI_SALUTE}}` - Condizioni di salute / note
- `{{PIANO_SERVIZIO}}` - Piano servizio (Base/Avanzato)
- `{{PREZZO_PIANO}}` - Prezzo del piano
- `{{DATA_RICHIESTA}}` - Data richiesta (formato IT)
- `{{ORA_RICHIESTA}}` - Ora richiesta (formato IT)
- `{{VERSIONE_SISTEMA}}` - Versione sistema

---

## 🚀 Deploy Production

### 1. Applica Migration Remota

```bash
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0001_clean_schema.sql
```

### 2. Inserisci Template Remoto

```bash
npx wrangler d1 execute telemedcare-leads --remote --file=/tmp/insert_template.sql
```

### 3. Deploy Cloudflare Pages

```bash
npm run deploy
# oppure
npx wrangler pages deploy dist
```

---

## 📝 File Modificati

### Nuovi File

- `migrations/0001_clean_schema.sql` - Schema database pulito
- `src/modules/template-loader-clean.ts` - Template loader affidabile

### File Aggiornati

- `src/modules/workflow-email-manager.ts` - Usa template loader pulito

### File di Backup

- `src/modules/workflow-email-manager.ts.backup` - Backup originale

---

## 🐛 Troubleshooting

### Template Non Trovato

```bash
# Verifica template nel database
npx wrangler d1 execute telemedcare-leads --local --command="
SELECT * FROM document_templates WHERE name = 'email_notifica_info';
"
```

### Placeholder Non Sostituiti

Verifica che:
1. Template loader usa `template-loader-clean.ts`
2. Nome placeholder corrisponde esattamente (case-sensitive)
3. Dati passati a `renderTemplate()` contengono tutti i campi

### Email Non Inviata

Verifica:
1. API Keys in `.dev.vars`:
   - `RESEND_API_KEY`
   - `SENDGRID_API_KEY`
2. Email destinatario: `info@telemedcare.it`
3. Log server per errori SMTP

---

## 📊 Differenze vs Backup 21 Ottobre

### ✅ Miglioramenti

1. **Schema semplificato** - Solo campi necessari
2. **Template loader robusto** - Query SQL pulita
3. **Nessuna dipendenza complessa** - No pdfmake, no docusign
4. **Testato e verificato** - Template inserito e verificato

### ❌ Problemi Risolti

1. ✅ Template loader cercava `template_id` invece di `name`
2. ✅ Migration 0012 aveva conflitti con schema
3. ✅ Colonne extra non necessarie rimosse
4. ✅ Query database ottimizzate

---

## 🎯 Next Steps

1. **Test in Production** - Deploy su Cloudflare Pages
2. **Aggiungi Altri Template** - email_invio_contratto, email_benvenuto, ecc.
3. **DNS Configuration** - SPF, DKIM, DMARC per deliverability
4. **Monitoring** - Log invii email e tracking aperture

---

## 📞 Support

Per problemi o domande:
- Verifica questo documento prima
- Controlla log server: `tail -f /tmp/clean_server.log`
- Verifica database: `npx wrangler d1 execute telemedcare-leads --local`

---

**Creato il**: 30 Ottobre 2025  
**Branch**: `fix/email-working-clean`  
**Status**: ✅ Testato e funzionante in locale

---

## 🧪 Test Completati

### Test Lead Capture + Email (30 Ottobre 2025)

**Lead ID**: `LEAD_2025-10-30T222823731Z_S6N9WO`  
**Email inviata**: ✅ `qZmwKTtPTEy1c_bEaH9F4A` (SendGrid)  
**Destinatario**: info@telemedcare.it  
**Subject**: 🆕 Nuovo Lead: Roberto Poggi - BASE  
**Placeholder**: ✅ Tutti sostituiti correttamente  
**Email corrette**: ✅ info@telemedcare.it, info@medicagb.it

### Fix Applicati
- ✅ Rimossi "email protected" dal template (linee 345, 354)
- ✅ Aggiunte email reali: info@telemedcare.it, info@medicagb.it
- ✅ Template aggiornato nel database
- ✅ Test manuale confermato da utente: email ricevuta correttamente

### Template Disponibili
1. **email_notifica_info** - Notifica nuovo lead a info@telemedcare.it ✅
2. **email_documenti_informativi** - Invio brochure/manuale al lead ✅
