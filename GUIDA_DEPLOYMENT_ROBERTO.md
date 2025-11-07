# 🚀 GUIDA DEPLOYMENT E TEST 360° - TeleMedCare V11.0

**Data:** 2025-11-07  
**Versione:** V11.0 Post-Fix  
**Target:** Roberto Poggi

---

## 📋 PREREQUISITI

Prima di iniziare, verifica di avere:

- ✅ **Accesso Cloudflare Dashboard**: https://dash.cloudflare.com
- ✅ **Wrangler CLI installato**: già presente nel progetto
- ✅ **Autenticazione Cloudflare**: `wrangler login` (se non già fatto)

---

## 🎯 OBIETTIVO

Completare il "TEST a 360° su tutto il flusso" richiesto da Roberto:
- ✅ Testare TUTTI i 6 template email
- ✅ Testare workflow BASE e AVANZATO completi
- ✅ Testare entrambi gli scenari intestazioneContratto (richiedente/assistito)
- ✅ Verificare tutti i partner lead sources (IRBEMA, Luxottica, Pirelli, FAS)
- ✅ Verificare email notifica con TUTTI i campi
- ✅ Verificare generazione proforma dopo firma contratto

---

## 📝 STEP 1: AUTENTICAZIONE CLOUDFLARE

### Opzione A - Login Interattivo (Raccomandato)
```bash
cd /home/user/webapp
npx wrangler login
```
Questo aprirà il browser per l'autenticazione.

### Opzione B - API Token
Se sei in ambiente non-interattivo:
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
# Ottieni il token da: https://dash.cloudflare.com/profile/api-tokens
```

---

## 🗄️ STEP 2: APPLICARE MIGRATION 0007 AL DATABASE REMOTO

**⚠️ CRITICO**: Questa migration risolve il D1_TYPE_ERROR che impediva la creazione delle proforma.

### Metodo 1 - Via CLI (Raccomandato)

```bash
cd /home/user/webapp

# Verifica quale database remoto usare
npx wrangler d1 list

# Applica migration al database production (o staging)
npx wrangler d1 migrations apply telemedcare-leads --remote

# Se il database ha un altro nome, usa quello mostrato da 'wrangler d1 list'
```

### Metodo 2 - Via Cloudflare Dashboard

1. Vai su: https://dash.cloudflare.com
2. Naviga: **Workers & Pages** → **D1**
3. Seleziona il database: **telemedcare-leads** (o il nome del tuo DB)
4. Click tab: **Console**
5. Copia e incolla TUTTO il contenuto da `migrations/0007_fix_proforma_schema.sql`
6. Click: **Execute**

### Verifica Migration Applicata

```bash
# Query per verificare la struttura della tabella proforma
npx wrangler d1 execute telemedcare-leads --remote --command="PRAGMA table_info(proforma);"

# Dovresti vedere 19 colonne, incluse:
# - numero_proforma
# - cliente_nome
# - cliente_cognome
# - tipo_servizio
# - prezzo_mensile
# - durata_mesi
# - prezzo_totale
# - file_path
# - content
# - status
```

**✅ Output Atteso**: 19 righe che mostrano tutte le colonne della tabella proforma.

---

## 🚀 STEP 3: DEPLOY SU CLOUDFLARE PAGES

### Build Già Completato ✅
Il build è già stato fatto. Se vuoi ricostruire:
```bash
cd /home/user/webapp
npm run build
# Output: dist/_worker.js  1,168.12 kB ✓ built
```

### Deploy Production

```bash
cd /home/user/webapp

# Deploy su production
npm run deploy

# Oppure specificando il project name
npx wrangler pages deploy dist --project-name telemedcare-v11 --branch production
```

### Deploy Staging (Per Test)

```bash
cd /home/user/webapp

# Deploy su staging per test
npm run deploy:staging

# Oppure manualmente
npx wrangler pages deploy dist --project-name telemedcare-staging --branch staging
```

### Verifica Deploy

Dopo il deploy, Wrangler ti fornirà:
- ✅ **URL Production**: `https://telemedcare-v11.pages.dev`
- ✅ **URL Staging**: `https://staging.telemedcare-v11.pages.dev`
- ✅ **Deployment ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

**Salva questi URL!** Li userai per i test.

---

## 🧪 STEP 4: TEST A 360° COMPLETO

Ora che il sistema è deployato, esegui i test completi.

### Opzione A - Test Automatizzato (Raccomandato)

Ho preparato uno script Python che testa TUTTO automaticamente:

```bash
cd /home/user/webapp

# Modifica l'URL nel file di test
nano test_comprehensive_roberto.py
# Cambia la riga 32:
# BASE_URL = "https://telemedcare-v11.pages.dev"  # <-- Metti il tuo URL

# Esegui i test
python3 test_comprehensive_roberto.py

# Output: circa 10-15 minuti per completare tutti i 4 test suite
```

**Lo script testa automaticamente:**

✅ **TEST SUITE 1: Workflow BASE con intestazione RICHIEDENTE**
- Lead intake con dati completi (30+ campi)
- Contract generato e indirizzato a Roberto Poggi (richiedente)
- Firma contratto
- Generazione proforma

✅ **TEST SUITE 2: Workflow AVANZATO con intestazione ASSISTITO**
- Lead intake con dati completi
- Contract generato e indirizzato a Anna Verdi (assistito)
- Firma contratto
- Generazione proforma

✅ **TEST SUITE 3: Partner Lead Sources**
- Test lead da IRBEMA
- Test lead da Luxottica
- Test lead da Pirelli
- Test lead da FAS

✅ **TEST SUITE 4: Tutti i 6 Template Email**
1. email_benvenuto_lead
2. email_notifica_info
3. email_invio_contratto
4. email_conferma_firma
5. email_invio_proforma
6. email_conferma_pagamento

### Opzione B - Test Manuale via Landing Page

```bash
# 1. Apri il browser
xdg-open https://telemedcare-v11.pages.dev

# 2. Compila il form con questi dati di test:

## DATI RICHIEDENTE (chi firma il contratto)
Nome: Roberto
Cognome: Poggi
Email: roberto.poggi@test.com
Telefono: +39 339 1234567
CF: PGGRRT70A01H501Z
Indirizzo: Via Roma 123
CAP: 20100
Città: Milano
Provincia: MI
Data Nascita: 1970-01-01
Luogo Nascita: Milano

## DATI ASSISTITO (chi riceve il servizio)
Nome: Rosaria
Cognome: Ressa
Età: 65
CF: RSSRSR58A41F839X
Email: rosaria.ressa@test.com
Telefono: +39 339 7654321
Indirizzo: Via Verdi 456
CAP: 00100
Città: Roma
Provincia: RM
Data Nascita: 1958-01-01
Luogo Nascita: Roma

## SERVIZIO
Pacchetto: BASE (oppure AVANZATO per testare entrambi)
Intestazione Contratto: richiedente (oppure assistito per testare entrambi)

## SALUTE E URGENZA
Condizioni Salute: "Pressione alta, diabete tipo 2"
Urgenza Risposta: urgente
Giorni Risposta: 1-2 giorni
Preferenza Contatto: email
Fonte: LANDING_PAGE (oppure IRBEMA, Luxottica, Pirelli, FAS)

Note: "Test workflow completo 360°"

# 3. Invia il form
# 4. Verifica che ricevi email su roberto.poggi@test.com
# 5. Verifica che info@telemedcare.it riceve notifica con TUTTI i campi
```

### Verifica Email Ricevute

Controlla le email su:
- ✅ **rpoggi55@gmail.com** (se usi email reale)
- ✅ **info@telemedcare.it**

**Email 1 - Benvenuto Lead** (a roberto.poggi@test.com):
```
Subject: Benvenuto in TeleMedCare - Roberto Poggi

Gentile Roberto Poggi,

Grazie per il tuo interesse nel servizio TeleMedCare BASE.

Abbiamo ricevuto la tua richiesta e ti contatteremo presto.

Dati ricevuti:
- Nome: Roberto Poggi
- Email: roberto.poggi@test.com
- Telefono: +39 339 1234567
- Pacchetto: BASE
- Assistito: Rosaria Ressa (65 anni)

TeleMedCare Team
```

**Email 2 - Notifica Info** (a info@telemedcare.it):
```
Subject: 📋 NUOVA RICHIESTA TELEMEDCARE - Roberto Poggi

═══════════════════════════════════════
📋 NUOVA RICHIESTA TELEMEDCARE
═══════════════════════════════════════

🔹 DATI RICHIEDENTE (Intestatario Contratto):
Nome: Roberto Poggi
Email: roberto.poggi@test.com
Telefono: +39 339 1234567
Codice Fiscale: PGGRRT70A01H501Z
Indirizzo: Via Roma 123, 20100 Milano (MI)
Data Nascita: 1970-01-01
Luogo Nascita: Milano

🔹 DATI ASSISTITO (Chi riceve il servizio):
Nome: Rosaria Ressa
Età: 65 anni
Email: rosaria.ressa@test.com
Telefono: +39 339 7654321
Codice Fiscale: RSSRSR58A41F839X
Indirizzo: Via Verdi 456, 00100 Roma (RM)
Data Nascita: 1958-01-01
Luogo Nascita: Roma

🔹 SERVIZIO RICHIESTO:
Pacchetto: BASE
Intestazione Contratto: richiedente
Prezzo: €512,40 IVA inclusa

🔹 CONDIZIONI SALUTE:
Condizioni: Pressione alta, diabete tipo 2
Urgenza: urgente
Giorni Risposta: 1-2 giorni
Preferenza Contatto: email

🔹 FONTE:
LANDING_PAGE

🔹 NOTE:
Test workflow completo 360°

Timestamp: 2025-11-07 15:30:45 (Europe/Rome)
Lead ID: lead_xxx
```

---

## 🔍 STEP 5: VERIFICA DATABASE

Verifica che i dati siano stati salvati correttamente:

```bash
cd /home/user/webapp

# Query leads
npx wrangler d1 execute telemedcare-leads --remote --command="SELECT id, nomeRichiedente, cognomeRichiedente, nomeAssistito, cognomeAssistito, pacchetto, intestazioneContratto FROM leads ORDER BY created_at DESC LIMIT 5;"

# Query contracts
npx wrangler d1 execute telemedcare-leads --remote --command="SELECT id, lead_id, numero_contratto, intestatario_nome, intestatario_cognome, tipo_servizio, status FROM contracts ORDER BY created_at DESC LIMIT 5;"

# Query proforma
npx wrangler d1 execute telemedcare-leads --remote --command="SELECT id, numero_proforma, cliente_nome, cliente_cognome, tipo_servizio, prezzo_totale, status FROM proforma ORDER BY created_at DESC LIMIT 5;"

# Query email_logs
npx wrangler d1 execute telemedcare-leads --remote --command="SELECT id, lead_id, template_name, recipient_email, status, sent_at FROM email_logs ORDER BY sent_at DESC LIMIT 10;"
```

**✅ Verifica che:**
- Lead ha tutti i 30+ campi popolati (no "DA FORNIRE")
- Contract intestatario_nome corrisponde a intestazioneContratto
- Proforma è stata creata con status 'SENT'
- Email_logs ha 2 entry (benvenuto + notifica) con status 'SENT'

---

## 📊 STEP 6: MONITORING E DEBUG

### Visualizza Logs in Real-Time

```bash
# Logs deployment
npx wrangler pages deployment tail

# Filtra per errori
npx wrangler pages deployment tail --format pretty | grep ERROR

# Filtra per email
npx wrangler pages deployment tail --format pretty | grep "📧"
```

### Dashboard Cloudflare

1. Vai su: https://dash.cloudflare.com
2. **Workers & Pages** → Seleziona **telemedcare-v11**
3. Tab **Logs**: Vedi logs real-time
4. Tab **Analytics**: Vedi metriche traffico

### Check Database Cloudflare Dashboard

1. **Workers & Pages** → **D1**
2. Seleziona **telemedcare-leads**
3. Tab **Metrics**: Vedi queries eseguite
4. Tab **Console**: Esegui query SQL manuali

---

## ✅ CHECKLIST COMPLETAMENTO TEST 360°

### Database Migration ✅
- [ ] Migration 0007 applicata al database remoto
- [ ] Verifica 19 colonne in tabella proforma
- [ ] Test query SELECT su proforma funziona

### Deployment ✅
- [ ] Build completato senza errori
- [ ] Deploy su Cloudflare Pages completato
- [ ] URL staging/production accessibile
- [ ] Landing page si carica correttamente

### Email Testing ✅
- [ ] Email benvenuto arriva a richiedente
- [ ] Email notifica arriva a info@telemedcare.it
- [ ] Email notifica contiene TUTTI i campi (30+)
- [ ] Nessun placeholder {{VARIABILE}} non sostituito
- [ ] Sender email è info@telemedcare.it (non noreply@)

### Workflow BASE ✅
- [ ] Lead creato con intestazioneContratto: richiedente
- [ ] Contract indirizzato a Roberto Poggi (richiedente)
- [ ] Contract NON mostra "DA FORNIRE"
- [ ] Firma contratto funziona
- [ ] Proforma generata dopo firma

### Workflow AVANZATO ✅
- [ ] Lead creato con intestazioneContratto: assistito
- [ ] Contract indirizzato a Anna Verdi (assistito)
- [ ] Contract NON mostra "DA FORNIRE"
- [ ] Firma contratto funziona
- [ ] Proforma generata dopo firma

### Partner Lead Sources ✅
- [ ] Lead IRBEMA creato correttamente
- [ ] Lead Luxottica creato correttamente
- [ ] Lead Pirelli creato correttamente
- [ ] Lead FAS creato correttamente

### 6 Email Templates ✅
- [ ] email_benvenuto_lead inviata
- [ ] email_notifica_info inviata
- [ ] email_invio_contratto inviata
- [ ] email_conferma_firma inviata
- [ ] email_invio_proforma inviata
- [ ] email_conferma_pagamento inviata

---

## 🐛 TROUBLESHOOTING

### Problema: Migration 0007 fallisce

**Errore:** `D1_TYPE_ERROR` o `column not found`

**Soluzione:**
```bash
# Verifica che migration esista
ls -la migrations/0007_fix_proforma_schema.sql

# Verifica contenuto migration
cat migrations/0007_fix_proforma_schema.sql

# Applica migration forzata
npx wrangler d1 migrations apply telemedcare-leads --remote --force
```

### Problema: Email non arrivano

**Sintomo:** Form inviato ma nessuna email ricevuta

**Soluzioni:**
1. **Verifica sender email è configurato**:
   ```bash
   # Cerca nei logs
   npx wrangler pages deployment tail | grep "info@telemedcare.it"
   ```

2. **Verifica API keys SendGrid/Resend**:
   - Dashboard Cloudflare → Pages → Settings → Environment Variables
   - Devono essere presenti: `SENDGRID_API_KEY`, `RESEND_API_KEY`

3. **Controlla spam folder**

4. **Verifica email_logs database**:
   ```bash
   npx wrangler d1 execute telemedcare-leads --remote --command="SELECT * FROM email_logs WHERE status='FAILED' ORDER BY sent_at DESC LIMIT 5;"
   ```

### Problema: Contract mostra "DA FORNIRE"

**Sintomo:** Contract PDF contiene "DA FORNIRE" invece dei dati

**Soluzione:** Verifica mapping leadData in `src/index.tsx` linee 4406-4447. Tutti i fix sono già applicati nel codice committato.

### Problema: Proforma non viene creata

**Sintomo:** Dopo firma contratto, nessuna proforma generata

**Soluzioni:**
1. **Verifica migration 0007 applicata**:
   ```bash
   npx wrangler d1 execute telemedcare-leads --remote --command="PRAGMA table_info(proforma);"
   # Deve mostrare 19 colonne
   ```

2. **Verifica logs**:
   ```bash
   npx wrangler pages deployment tail | grep "proforma"
   ```

### Problema: intestazioneContratto non funziona

**Sintomo:** Contract sempre indirizzato a richiedente anche quando assistito è selezionato

**Soluzione:** Il fix è già applicato in `src/modules/complete-workflow-orchestrator.ts`. Verifica che il deploy sia andato a buon fine.

---

## 📚 RIFERIMENTI

### File Modificati (Committati)
- `migrations/0007_fix_proforma_schema.sql` - Migration database
- `src/index.tsx` - LeadData mapping completo (linee 4406-4447)
- `src/modules/email-service.ts` - Sender email fix
- `src/modules/workflow-email-manager.ts` - Sender email fix (7 occorrenze)
- `src/modules/configuration-manager.ts` - Sender email fix (3 occorrenze)
- `src/modules/complete-workflow-orchestrator.ts` - Null-safety proforma INSERT

### Commit History (Ultimi 9 Commit)
```
4192133 feat: Add migration 0007 to fix proforma table schema
df67a6c fix: Change email sender from noreply@ to info@telemedcare.it
01ddb16 docs: Add final comprehensive test results for Roberto
592be09 docs: Add comprehensive test execution summary for Roberto
c9daca9 fix: Complete LeadData mapping for contract signature workflow
37eaf7a docs: Add comprehensive test suite completion summary
6a423e8 docs: Add quick start testing guide for Roberto
3b89d4a feat: Add comprehensive test suite per feedback Roberto
f3b51c9 fix: Critical fixes per feedback Roberto - intestazione contratto e campi completi
```

### Script di Test
- `test_comprehensive_roberto.py` - Test automatizzato completo 360°
- Esegue tutti i 4 test suite richiesti da Roberto
- Genera report JSON con risultati

---

## 🎯 RIEPILOGO VELOCE

**Cosa ho fatto io:**
✅ Tutti i 10 fix applicati e committati
✅ Migration 0007 creata e applicata localmente
✅ Build completato con successo
✅ Codice pushato su GitHub (main branch)
✅ Test suite automatizzato creato

**Cosa devi fare tu:**
1. ⏳ Login Cloudflare: `npx wrangler login`
2. ⏳ Applica migration: `npx wrangler d1 migrations apply telemedcare-leads --remote`
3. ⏳ Deploy: `npm run deploy`
4. ⏳ Test: Usa `test_comprehensive_roberto.py` o test manuali
5. ⏳ Verifica: Controlla email e database

**Tempo stimato:** 15-20 minuti

---

## 📞 SUPPORTO

Se incontri problemi durante il deployment:

1. **Verifica logs**: `npx wrangler pages deployment tail`
2. **Controlla dashboard Cloudflare**: https://dash.cloudflare.com
3. **Verifica database**: Query via `wrangler d1 execute`

**Tutti i fix sono già nel codice committato e pushato su GitHub!**

---

**TUTTO IL SISTEMA È PRONTO PER IL DEPLOYMENT! 🚀**

Buon test a 360°! 🎉
