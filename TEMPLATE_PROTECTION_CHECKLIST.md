# ✅ TEMPLATE PROTECTION CHECKLIST - LEGGERE SEMPRE!

> **DOCUMENTO OBBLIGATORIO DA CONSULTARE PRIMA DI OGNI MODIFICA A EMAIL SERVICE**

---

## 🚨 PROBLEMA RICORRENTE

I template email **CONTINUAVANO A TORNARE HARDCODED** invece di essere caricati dal database, causando:
- Perdita di modifiche ai template
- Impossibilità di aggiornare template senza rebuild
- Sprechi enormi di tempo e crediti
- Necessità di ri-testare tutto ogni volta

---

## ✅ SOLUZIONE IMPLEMENTATA (Commit: 3677418)

### 1. Template nel Database
I template email **DEVONO SEMPRE** essere nella tabella `document_templates`:
```sql
SELECT id, name, type, active, 
       length(html_content) as html_length
FROM document_templates
WHERE active = 1;
```

**10 template attivi** verificati:
- `email_invio_contratto` (5538 char)
- `email_invio_proforma` (6137 char)
- `email_benvenuto` (6461 char)
- `email_conferma_attivazione` (5345 char)
- `email_notifica_info` (7599 char)
- `email_documenti_informativi` (7882 char)
- `email_configurazione` (12611 char)
- `email_conferma` (7103 char)
- `email_promemoria` (7395 char)
- `email_promemoria_pagamento` (3529 char)

### 2. Email Service DEVE Caricare da Database

**File**: `src/modules/email-service.ts`

**Funzione Critica**: `sendTemplateEmail()`

**COMPORTAMENTO CORRETTO**:
```typescript
async sendTemplateEmail(..., env?: any) {
  // 1. PRIMA: Carica dal database
  if (env && env.DB) {
    const template = await env.DB.prepare(`
      SELECT html_content, subject FROM document_templates 
      WHERE id = ? AND active = 1
    `).bind(dbTemplateId).first();
    
    if (template) {
      console.log(`✅ Template caricato dal database: ${dbTemplateId}`);
      htmlContent = template.html_content;
      subject = template.subject;
    }
  }
  
  // 2. SOLO SE FALLISCE: Usa fallback hardcoded
  if (!htmlContent) {
    const fallbackTemplate = EMAIL_TEMPLATES[templateId];
    htmlContent = await this.loadTemplate(fallbackTemplate.htmlPath);
  }
}
```

**LOG DA VERIFICARE**:
```
✅ Template caricato dal database: email_invio_contratto
✅ Template caricato dal database: email_invio_proforma
```

**❌ LOG ERRATO** (significa che sta usando fallback):
```
⚠️ Template email_xxx non trovato in DB, uso fallback
```

---

## 🔍 VERIFICA PRIMA DI OGNI DEPLOY

### Checklist Obbligatoria:

#### 1. Verifica Template in Database
```bash
curl http://localhost:3000/api/admin/debug/check-templates | jq '.'
```

**Output Atteso**:
```json
{
  "success": true,
  "count": 10,
  "templates": [...]
}
```

**❌ Se count < 10**: Eseguire ripristino!

#### 2. Verifica Email Service Carica da DB
```bash
# Cerca nel codice
grep -n "env.DB.prepare" src/modules/email-service.ts
```

**DEVE TROVARE**: Riga con query `SELECT html_content, subject FROM document_templates`

**❌ Se NON trova**: Email service è SBAGLIATO!

#### 3. Test Invio Email con Log
```bash
# Avvia server e verifica log
npm run dev

# Invia test email e cerca nei log:
grep "Template caricato dal database" <server_logs>
```

**DEVE MOSTRARE**: `✅ Template caricato dal database: email_invio_contratto`

---

## 🔄 RIPRISTINO TEMPLATE (Se Persi)

### Step 1: Applica SQL Master
```bash
cd /home/user/webapp
npx wrangler d1 execute DB --local --file=RESTORE_WORKING_TEMPLATES.sql
```

### Step 2: Verifica Ripristino
```bash
curl http://localhost:3000/api/admin/debug/check-templates | jq '.count'
# Output: 10
```

### Step 3: Rebuild e Restart
```bash
npm run build
npm run dev
```

### Step 4: Test Email
```bash
# Invia una email di test e verifica il log
# DEVE mostrare: "✅ Template caricato dal database"
```

---

## 📋 FILE IMPORTANTI

| File | Scopo | Cosa Verificare |
|------|-------|-----------------|
| `DATABASE_MASTER_REFERENCE.md` | Documentazione master | Template section (linea 392+) |
| `RESTORE_WORKING_TEMPLATES.sql` | Backup template | 10 INSERT statements |
| `src/modules/email-service.ts` | Email service | `sendTemplateEmail()` carica da DB |
| `src/modules/admin-api.ts` | Diagnostic endpoint | `/debug/check-templates` |

---

## ⚠️ REGOLE D'ORO

### ✅ DA FARE SEMPRE:
1. **Consultare DATABASE_MASTER_REFERENCE.md** prima di modifiche
2. **Verificare template nel database** con endpoint diagnostico
3. **Testare invio email** dopo ogni modifica a email-service.ts
4. **Cercare nei log** la conferma "Template caricato dal database"
5. **Committare immediatamente** dopo fix dei template

### ❌ DA NON FARE MAI:
1. ❌ Modificare `sendTemplateEmail()` per usare solo `EMAIL_TEMPLATES`
2. ❌ Rimuovere la query al database da `sendTemplateEmail()`
3. ❌ Ignorare l'errore "Template non trovato in DB"
4. ❌ Usare template hardcoded come soluzione primaria
5. ❌ Skippare la verifica con `/debug/check-templates`

---

## 🆘 COSA FARE SE TEMPLATE PERSI

### Sintomi:
- Email inviate hanno contenuto sbagliato
- Modifiche ai template non hanno effetto
- Log mostra "uso fallback" invece di "caricato dal database"

### Fix Immediato:
```bash
# 1. Ripristina template
cd /home/user/webapp
npx wrangler d1 execute DB --local --file=RESTORE_WORKING_TEMPLATES.sql

# 2. Verifica email-service.ts carica da DB
grep "env.DB.prepare" src/modules/email-service.ts

# 3. Se NON trova: QUESTO FILE È SBAGLIATO!
# Recupera da git commit 3677418:
git show 3677418:src/modules/email-service.ts > src/modules/email-service.ts

# 4. Rebuild
npm run build

# 5. Restart
npm run dev

# 6. Test
curl http://localhost:3000/api/admin/debug/check-templates
```

---

## 📊 MONITORING CONTINUO

### Script di Verifica Automatica
```bash
#!/bin/bash
# check-templates.sh

echo "🔍 Verifica Template..."

# Check database
COUNT=$(curl -s http://localhost:3000/api/admin/debug/check-templates | jq -r '.count')
if [ "$COUNT" != "10" ]; then
  echo "❌ ERRORE: Solo $COUNT template in database (attesi 10)"
  exit 1
fi

# Check email service
if ! grep -q "env.DB.prepare" src/modules/email-service.ts; then
  echo "❌ ERRORE: Email service NON carica da database!"
  exit 1
fi

echo "✅ Tutto OK: 10 template in DB + email service corretto"
```

---

## 🎯 SUMMARY

**IMPORTANTE**: I template email **DEVONO SEMPRE** essere:
1. ✅ Nel database `document_templates` (10 template)
2. ✅ Caricati da `email-service.ts` tramite query SQL
3. ✅ Verificabili con `/api/admin/debug/check-templates`
4. ✅ Ripristinabili da `RESTORE_WORKING_TEMPLATES.sql`

**SE TUTTO È OK**:
- `/debug/check-templates` mostra count: 10
- Log email mostra "✅ Template caricato dal database"
- Email hanno contenuto corretto e dinamico

**SE QUALCOSA È SBAGLIATO**:
- Segui "RIPRISTINO TEMPLATE" sopra
- Verifica commit 3677418 per codice corretto
- Non procedere finché tutto non è corretto

---

**Ultimo Aggiornamento**: 2025-11-10 (Commit: 3677418)  
**Commit Critico**: `fix(CRITICAL): RESTORE DYNAMIC EMAIL TEMPLATES - NEVER LOSE AGAIN!`  
**PR**: #6 - https://github.com/RobertoPoggi/telemedcare-v11/pull/6
