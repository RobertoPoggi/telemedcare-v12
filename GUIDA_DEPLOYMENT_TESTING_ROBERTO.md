# 🚀 GUIDA COMPLETA: Deployment e Testing TeleMedCare V11.0

**Data:** 2025-11-07  
**Status:** ✅ TUTTO IL CODICE È PRONTO - Serve solo deployment  
**Tempo Stimato:** 15-20 minuti

---

## 📋 SOMMARIO ESECUTIVO

**Cosa è stato fatto:**
- ✅ Tutti i 10 fix applicati e committati su GitHub
- ✅ Migration 0007 creata per fixare schema proforma
- ✅ Build completato con successo (dist/_worker.js pronto)
- ✅ Tutti i file committati su branch `main`

**Cosa devi fare tu:**
1. ⏳ Autenticarti con Cloudflare
2. ⏳ Applicare migration 0007 al database remoto
3. ⏳ Deploy su Cloudflare Pages
4. ⏳ Testare il workflow completo

---

## 🔧 PREREQUISITI

### 1. Credenziali Cloudflare

Avrai bisogno di:
- **Account Cloudflare** con accesso al progetto TeleMedCare
- **API Token** oppure **Email + Global API Key**

### 2. Verifica Configurazione Locale

```bash
cd /home/user/webapp

# Verifica che tutto sia committato
git status
# Output atteso: "Your branch is up to date with 'origin/main'"

# Verifica che il build sia presente
ls -lh dist/_worker.js
# Output atteso: File da ~1.2MB
```

---

## 📊 STEP 1: Autenticazione Cloudflare

### Opzione A: Autenticazione Interattiva (Raccomandato)

```bash
cd /home/user/webapp
npx wrangler login
```

Questo comando:
1. Aprirà il browser
2. Ti chiederà di fare login su Cloudflare
3. Autorizzerà wrangler ad accedere al tuo account

### Opzione B: Autenticazione con API Token

Se preferisci usare un API token:

1. **Genera API Token:**
   - Vai su: https://dash.cloudflare.com/profile/api-tokens
   - Click: **"Create Token"**
   - Seleziona: **"Edit Cloudflare Workers"** template
   - Permissions:
     - Account → Cloudflare Pages → Edit
     - Account → D1 → Edit
   - Click: **"Continue to Summary"** → **"Create Token"**
   - **COPIA IL TOKEN** (lo vedrai una sola volta!)

2. **Configura Token:**
   ```bash
   export CLOUDFLARE_API_TOKEN="your-token-here"
   
   # Oppure aggiungi al file .bashrc per permanenza
   echo 'export CLOUDFLARE_API_TOKEN="your-token-here"' >> ~/.bashrc
   source ~/.bashrc
   ```

### Verifica Autenticazione

```bash
cd /home/user/webapp
npx wrangler whoami
```

Output atteso:
```
 ⛅️ wrangler 4.46.0
───────────────────
Getting User settings...
👋 You are logged in with an OAuth Token, associated with the email 'rpoggi55@gmail.com'!
┌──────────────────────────┬──────────────────────────────────┐
│ Account Name             │ Account ID                       │
├──────────────────────────┼──────────────────────────────────┤
│ Roberto Poggi            │ xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 🗄️ STEP 2: Applicare Migration 0007 al Database Remoto

### Verifica Database Esistenti

```bash
cd /home/user/webapp
npx wrangler d1 list
```

Output atteso (esempio):
```
┌──────────────────────────────┬──────────────────────────────────┬─────────────────────┐
│ Name                         │ ID                               │ Created             │
├──────────────────────────────┼──────────────────────────────────┼─────────────────────┤
│ telemedcare-leads            │ e49ad96c-a4c7-4d3e-b2b9-4f3e8... │ 2024-10-15 10:23:45 │
│ telemedcare_staging          │ a12bc345-d678-9012-e345-6f78a... │ 2024-11-01 14:12:33 │
└──────────────────────────────┴──────────────────────────────────┴─────────────────────┘
```

### Identifica il Database di Produzione

**IMPORTANTE:** Devi sapere quale database usare. Probabilmente è:
- `telemedcare-leads` (produzione)
- oppure `telemedcare_staging` (staging)

### Applica Migration

#### Metodo 1: Usando wrangler migrations (Raccomandato)

```bash
cd /home/user/webapp

# Per produzione
npx wrangler d1 migrations apply telemedcare-leads --remote

# OPPURE per staging
npx wrangler d1 migrations apply telemedcare_staging --remote
```

**Cosa succede:**
- wrangler legge tutte le migration in `migrations/`
- Applica solo quelle non ancora eseguite
- Migration 0007 sarà applicata automaticamente

**Output atteso:**
```
 ⛅️ wrangler 4.46.0
───────────────────
🚣 Executing on remote database telemedcare-leads (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx) from .wrangler/state/d1:
🌀 Mapping SQL input into an array of statements
🌀 Parsing 1 statements
🌀 Executing on remote database telemedcare-leads:
├ [#7] 0007_fix_proforma_schema.sql
│ ✅ 9 commands executed successfully
└ Done!
```

#### Metodo 2: Esecuzione Manuale SQL (Se il primo non funziona)

Se wrangler non trova il database nel wrangler.jsonc:

```bash
cd /home/user/webapp

# Esegui migration manualmente
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0007_fix_proforma_schema.sql
```

#### Metodo 3: Via Dashboard Cloudflare (Fallback)

Se i comandi CLI non funzionano:

1. **Vai alla Dashboard:**
   - https://dash.cloudflare.com
   - Click: **Workers & Pages** → **D1**
   - Seleziona: **telemedcare-leads** (o il tuo database)

2. **Apri Console:**
   - Click tab: **Console**

3. **Copia e Incolla SQL:**
   - Apri: `migrations/0007_fix_proforma_schema.sql`
   - Copia tutto il contenuto
   - Incolla nella console D1
   - Click: **Execute**

### Verifica Migration Applicata

```bash
cd /home/user/webapp

# Query la tabella proforma per verificare schema
npx wrangler d1 execute telemedcare-leads --remote --command="SELECT sql FROM sqlite_master WHERE type='table' AND name='proforma';"
```

Output atteso: Dovresti vedere tutte le 19 colonne della tabella proforma.

---

## 🚀 STEP 3: Deploy su Cloudflare Pages

### Deploy Produzione

```bash
cd /home/user/webapp

# Assicurati che il build sia aggiornato
npm run build

# Deploy su Cloudflare Pages
npx wrangler pages deploy dist --project-name telemedcare-v11
```

**Cosa succede:**
1. wrangler comprime i file in `dist/`
2. Carica su Cloudflare Pages
3. Cloudflare compila e pubblica automaticamente
4. Riceverai l'URL di produzione

**Output atteso:**
```
 ⛅️ wrangler 4.46.0
───────────────────
✨ Compiled Worker successfully
✨ Uploading...
✨ Deployment complete!
✨ https://telemedcare-v11.pages.dev
✨ https://www.telemedcare.it (custom domain)
```

### Deploy Staging (Opzionale)

Per testare prima su staging:

```bash
cd /home/user/webapp
npx wrangler pages deploy dist --project-name telemedcare-staging --branch staging
```

---

## 🧪 STEP 4: TEST COMPLETO DEL WORKFLOW

Ora che il deployment è completato, testiamo il workflow end-to-end.

### Test 1: Lead Intake (Form → Email)

1. **Apri la Landing Page:**
   ```
   https://telemedcare-v11.pages.dev
   ```

2. **Compila il Form con questi dati:**
   ```
   RICHIEDENTE (chi paga):
   - Nome: Roberto
   - Cognome: Poggi
   - Email: rpoggi55@gmail.com
   - Telefono: +39 123 456 7890
   - Codice Fiscale: PGGRRT70A01H501Z
   - Indirizzo: Via Roma 123
   - CAP: 20100
   - Città: Milano
   - Provincia: MI
   - Data di Nascita: 01/01/1970
   - Luogo di Nascita: Milano

   ASSISTITO (chi riceve il servizio):
   - Nome: Rosaria
   - Cognome: Ressa
   - Email: rosaria.ressa@test.com
   - Telefono: +39 098 765 4321
   - Età: 75
   - Codice Fiscale: RSSRSR50A41H501Z
   - Indirizzo: Via Verdi 456
   - CAP: 20100
   - Città: Milano
   - Provincia: MI
   - Data di Nascita: 01/01/1950
   - Luogo di Nascita: Milano

   SERVIZIO:
   - Pacchetto: TeleMedCare BASE
   - Vuole Contratto: Sì
   - Intestazione Contratto: Richiedente (Roberto Poggi)
   - Condizioni di Salute: Diabete, ipertensione
   - Preferenza Contatto: Email
   - Urgenza Risposta: Alta
   - Giorni Risposta: 1-2 giorni
   - Note: Test completo workflow
   ```

3. **Click:** "Richiedi Informazioni"

4. **Verifica Email Ricevute:**

   **A) Email a rpoggi55@gmail.com (conferma cliente):**
   - ✅ Subject: "Conferma richiesta TeleMedCare - Roberto Poggi"
   - ✅ Contenuto con tutti i dati richiedente e assistito
   - ✅ Dettagli servizio BASE
   - ✅ Nessun placeholder {{VARIABILE}} visibile

   **B) Email a info@telemedcare.it (notifica interna):**
   - ✅ Subject: "Nuova richiesta TeleMedCare - Roberto Poggi"
   - ✅ Dati completi richiedente (con CF, indirizzo, CAP, città)
   - ✅ Dati completi assistito (con CF, indirizzo, CAP, città)
   - ✅ Condizioni di salute: Diabete, ipertensione
   - ✅ Urgenza risposta: Alta
   - ✅ Giorni risposta: 1-2 giorni
   - ✅ Nessun campo mostra "DA FORNIRE"

### Test 2: Contratto - Intestazione RICHIEDENTE

Continua dal Test 1:

5. **Verifica Database:**
   ```bash
   cd /home/user/webapp
   npx wrangler d1 execute telemedcare-leads --remote --command="SELECT id, nomeRichiedente, cognomeRichiedente, nomeAssistito, cognomeAssistito, intestazioneContratto FROM leads ORDER BY created_at DESC LIMIT 1;"
   ```

   Verifica che:
   - ✅ `intestazioneContratto` = `richiedente`
   - ✅ Dati richiedente e assistito correttamente separati

6. **Simula Firma Contratto:**
   
   Metodo A - Via API diretta:
   ```bash
   # Sostituisci LEAD_ID con l'ID del lead creato
   curl -X POST https://telemedcare-v11.pages.dev/api/contract/sign \
     -H "Content-Type: application/json" \
     -d '{
       "leadId": "LEAD_ID_QUI",
       "firmaDigitale": "Roberto Poggi - Firma digitale test"
     }'
   ```

   Metodo B - Via interfaccia (se disponibile):
   - Accedi a dashboard contratti
   - Trova il contratto di Roberto Poggi
   - Click "Firma Contratto"

7. **Verifica Email Contratto:**

   **A) Email a rpoggi55@gmail.com (contratto firmato):**
   - ✅ Subject: "Contratto TeleMedCare firmato - Roberto Poggi"
   - ✅ Intestatario: Roberto Poggi (NON Rosaria Ressa)
   - ✅ Indirizzo: Via Roma 123, 20100 Milano
   - ✅ CF: PGGRRT70A01H501Z
   - ✅ Servizio: TeleMedCare BASE
   - ✅ Allegato PDF contratto presente

### Test 3: Proforma dopo Firma

8. **Verifica Email Proforma:**

   Dopo la firma del contratto, dovresti ricevere:

   **Email a rpoggi55@gmail.com (proforma):**
   - ✅ Subject: "Proforma TeleMedCare - Roberto Poggi"
   - ✅ Numero proforma: PRF-XXXXXXXXXX
   - ✅ Intestatario: Roberto Poggi
   - ✅ Servizio: TeleMedCare BASE
   - ✅ Importo: €598,80 (IVA inclusa)
   - ✅ Durata: 12 mesi
   - ✅ Allegato PDF proforma presente

9. **Verifica Database Proforma:**
   ```bash
   npx wrangler d1 execute telemedcare-leads --remote --command="SELECT * FROM proforma ORDER BY created_at DESC LIMIT 1;"
   ```

   Verifica che:
   - ✅ Tutti i campi sono popolati (nessun NULL)
   - ✅ `cliente_nome` = Roberto
   - ✅ `cliente_cognome` = Poggi
   - ✅ `tipo_servizio` = BASE
   - ✅ `prezzo_totale` = 598.80

### Test 4: Contratto - Intestazione ASSISTITO

Ripeti i test 1-3 ma con questi cambiamenti:

**Form Step 2 - Cambia:**
- ✅ Intestazione Contratto: **Assistito** (Rosaria Ressa)
- ✅ Pacchetto: **TeleMedCare AVANZATO**

**Verifiche attese:**
- ✅ Contratto intestato a: **Rosaria Ressa**
- ✅ Indirizzo contratto: Via Verdi 456, 20100 Milano
- ✅ CF contratto: RSSRSR50A41H501Z
- ✅ Servizio: TeleMedCare AVANZATO
- ✅ Importo proforma: €1.024,80

### Test 5: Partner Lead Sources

Testa tutte le 4 fonti partner:

**5.1) IRBEMA:**
```bash
curl -X POST https://telemedcare-v11.pages.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Mario",
    "cognomeRichiedente": "Rossi",
    "emailRichiedente": "mario.rossi@test.com",
    "telefonoRichiedente": "+39 111 222 3333",
    "fonte": "IRBEMA",
    "pacchetto": "BASE"
  }'
```

**5.2) Luxottica:**
```bash
curl -X POST https://telemedcare-v11.pages.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Luigi",
    "cognomeRichiedente": "Bianchi",
    "emailRichiedente": "luigi.bianchi@test.com",
    "telefonoRichiedente": "+39 222 333 4444",
    "fonte": "LUXOTTICA",
    "pacchetto": "AVANZATO"
  }'
```

**5.3) Pirelli:**
```bash
curl -X POST https://telemedcare-v11.pages.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Anna",
    "cognomeRichiedente": "Verdi",
    "emailRichiedente": "anna.verdi@test.com",
    "telefonoRichiedente": "+39 333 444 5555",
    "fonte": "PIRELLI",
    "pacchetto": "BASE"
  }'
```

**5.4) FAS:**
```bash
curl -X POST https://telemedcare-v11.pages.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Paolo",
    "cognomeRichiedente": "Neri",
    "emailRichiedente": "paolo.neri@test.com",
    "telefonoRichiedente": "+39 444 555 6666",
    "fonte": "FAS",
    "pacchetto": "AVANZATO"
  }'
```

**Verifica per ogni partner:**
- ✅ Lead creato con fonte corretta
- ✅ Email notifica a info@telemedcare.it include fonte
- ✅ Dashboard mostra fonte partner

### Test 6: Tutti i 6 Template Email

Verifica che tutti i template email siano stati inviati correttamente:

1. ✅ **email_conferma_richiesta** - Conferma a cliente dopo form
2. ✅ **email_notifica_interna** - Notifica a info@ dopo form
3. ✅ **email_invio_contratto** - Contratto a cliente dopo generazione
4. ✅ **email_contratto_firmato** - Conferma firma a cliente
5. ✅ **email_invio_proforma** - Proforma a cliente dopo firma
6. ✅ **email_pagamento_ricevuto** - Conferma pagamento (test dopo integrazione Stripe)

---

## ✅ CHECKLIST COMPLETA

### Pre-Deployment
- [x] ✅ Build completato (`npm run build`)
- [x] ✅ Migration 0007 creata
- [x] ✅ Tutti i file committati su Git
- [x] ✅ Repository GitHub aggiornato

### Deployment
- [ ] ⏳ Autenticazione Cloudflare completata
- [ ] ⏳ Migration 0007 applicata al database remoto
- [ ] ⏳ Deploy su Cloudflare Pages completato
- [ ] ⏳ URL produzione ottenuto

### Testing
- [ ] ⏳ Test 1: Lead intake BASE + intestazione RICHIEDENTE
- [ ] ⏳ Test 2: Lead intake AVANZATO + intestazione ASSISTITO
- [ ] ⏳ Test 3: Contratto firmato + proforma (RICHIEDENTE)
- [ ] ⏳ Test 4: Contratto firmato + proforma (ASSISTITO)
- [ ] ⏳ Test 5: Partner lead sources (IRBEMA, Luxottica, Pirelli, FAS)
- [ ] ⏳ Test 6: Verifica tutti i 6 template email

### Verifica Email
- [ ] ⏳ Nessun placeholder {{VARIABILE}} visibile
- [ ] ⏳ Nessun campo mostra "DA FORNIRE"
- [ ] ⏳ Sender email è info@telemedcare.it (non noreply@)
- [ ] ⏳ Email notifica info@ contiene TUTTI i campi richiesti
- [ ] ⏳ Contratti intestati correttamente (richiedente o assistito)

---

## 🐛 TROUBLESHOOTING

### Problema: wrangler non trova il database

**Errore:**
```
Couldn't find a D1 DB with the name or binding 'telemedcare_staging'
```

**Soluzione:**
1. Verifica nome esatto con: `npx wrangler d1 list`
2. Usa il nome esatto dal command output
3. Oppure usa il database ID direttamente:
   ```bash
   npx wrangler d1 execute e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f --remote --file=migrations/0007_fix_proforma_schema.sql
   ```

### Problema: Email non arrivano

**Check 1 - Verifica sender domain:**
```bash
# Controlla che sia configurato info@telemedcare.it
npx wrangler pages deployment list --project-name telemedcare-v11
```

**Check 2 - Verifica API keys SendGrid/Resend:**
- Dashboard Cloudflare → Workers & Pages → telemedcare-v11
- Tab: Settings → Environment Variables
- Verifica presenza:
  - `SENDGRID_API_KEY`
  - `RESEND_API_KEY`
  - `EMAIL_FROM = info@telemedcare.it`

**Check 3 - Verifica domain verification:**
- SendGrid: https://app.sendgrid.com/settings/sender_auth/senders
- Resend: https://resend.com/domains
- Verifica che `telemedcare.it` sia verificato

### Problema: Contratto intestato a persona sbagliata

**Check 1 - Verifica leadData mapping:**
```bash
cd /home/user/webapp
grep -A 50 "const workflowContext" src/index.tsx | grep intestazioneContratto
```

Deve esserci:
```typescript
intestazioneContratto: leadData.intestazioneContratto,
```

**Check 2 - Verifica database:**
```bash
npx wrangler d1 execute telemedcare-leads --remote --command="SELECT id, intestazioneContratto FROM leads ORDER BY created_at DESC LIMIT 5;"
```

### Problema: Proforma fallisce con D1_TYPE_ERROR

**Causa:** Migration 0007 non applicata al database remoto

**Soluzione:**
```bash
cd /home/user/webapp
npx wrangler d1 execute telemedcare-leads --remote --file=migrations/0007_fix_proforma_schema.sql
```

### Problema: Build fallisce

**Check versioni:**
```bash
cd /home/user/webapp
node --version  # Deve essere >= 18
npm --version   # Deve essere >= 9
```

**Reinstalla dipendenze:**
```bash
cd /home/user/webapp
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 RIFERIMENTI TECNICI

### File Modificati (Ultimi 10 Commit)

1. **migrations/0007_fix_proforma_schema.sql** - Fix database schema
2. **src/modules/email-service.ts** - Sender email info@
3. **src/modules/workflow-email-manager.ts** - Sender email info@
4. **src/modules/configuration-manager.ts** - Sender email info@
5. **src/index.tsx** - Complete leadData mapping
6. **src/modules/complete-workflow-orchestrator.ts** - Null-safe proforma INSERT

### Database Schema (Post Migration 0007)

**Tabella: proforma (19 colonne)**
```sql
id, contract_id, lead_id, numero_proforma,
data_emissione, data_scadenza,
cliente_nome, cliente_cognome, cliente_email,
tipo_servizio, prezzo_mensile, durata_mesi, prezzo_totale,
file_path, content, status, email_template_used,
created_at, updated_at
```

### Email Templates

1. **email_conferma_richiesta** - Cliente confirmation
2. **email_notifica_interna** - Internal notification (info@)
3. **email_invio_contratto** - Contract delivery
4. **email_contratto_firmato** - Contract signed confirmation
5. **email_invio_proforma** - Proforma delivery
6. **email_pagamento_ricevuto** - Payment confirmation

### URLs Importanti

- **GitHub Repo:** https://github.com/RobertoPoggi/telemedcare-v11
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **SendGrid Dashboard:** https://app.sendgrid.com
- **Resend Dashboard:** https://resend.com

---

## 📞 SUPPORTO

Se incontri problemi durante il deployment o testing:

1. **Verifica logs Cloudflare:**
   ```bash
   npx wrangler pages deployment tail --project-name telemedcare-v11
   ```

2. **Verifica database:**
   ```bash
   npx wrangler d1 execute telemedcare-leads --remote --command="SELECT * FROM sqlite_master WHERE type='table';"
   ```

3. **Controlla ultimi commit:**
   ```bash
   cd /home/user/webapp
   git log --oneline -10
   ```

---

## 🎉 CONCLUSIONE

Seguendo questa guida step-by-step, completerai:

✅ Deployment su Cloudflare Pages  
✅ Migration database schema  
✅ Testing workflow completo 360°  
✅ Verifica tutti i 6 template email  
✅ Verifica tutti i partner lead sources  
✅ Verifica intestazione contratti (entrambi scenari)  

**Tempo totale stimato:** 15-20 minuti

**Prossimi passi dopo testing:**
- Implementazione DocuSign integration
- Implementazione Stripe payment gateway
- Dashboard operativa completa
- Monitoring e analytics

---

**Buon deployment e testing! 🚀**
