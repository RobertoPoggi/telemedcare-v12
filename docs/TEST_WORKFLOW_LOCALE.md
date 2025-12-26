# 🧪 Test Workflow Locale - Guida Completa

**eCura V11.0** - Test del flusso completo SENZA deploy in produzione

---

## 📋 Prerequisiti

- ✅ Node.js installato
- ✅ Dependencies installate (`npm install`)
- ✅ Build completata (`npm run build`)
- ✅ Wrangler CLI installato (`npm install -g wrangler`)

---

## 🚀 METODO 1: Test Automatico con Script

### Step 1: Esegui test setup database

```bash
./scripts/test-workflow-local.sh
```

**Output atteso:**
```
✅ Database trovato
✅ Lead inserito con ID: 123
📊 Statistiche Attuali:
  - Lead: 45
  - Contratti: 12
  - Proformas: 8
```

### Step 2: Avvia server locale

In un terminale separato:

```bash
npm run dev
```

**Output atteso:**
```
⎔ Starting local server...
[mf:inf] Ready on http://localhost:8788
```

### Step 3: Test API Endpoints

In un altro terminale:

```bash
./scripts/test-api-endpoints.sh
```

Inserisci la tua **email reale** per ricevere:
- ✅ Email con contratto DocuSign
- ✅ Brochure PDF allegata
- ✅ Link firma elettronica

**Output atteso:**
```
✅ Health check OK
✅ Lead submission OK
📄 Contratto generato: ID 456
✅ GET contratto OK
💰 PRO AVANZATO: €840
```

---

## 🚀 METODO 2: Test Manuale Step-by-Step

### Step 1: Avvia Dev Server

```bash
npm run dev
```

Attendi:
```
[mf:inf] Ready on http://localhost:8788
```

### Step 2: Test Health Check

```bash
curl http://localhost:8788/health
```

**Risposta attesa:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Step 3: Test Lead Submission (Workflow Completo)

**⚠️ IMPORTANTE: Usa la TUA email reale per ricevere i documenti!**

```bash
curl -X POST http://localhost:8788/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "tua-email@example.com",
    "telefono": "335 123 4567",
    "servizio": "PRO",
    "piano": "AVANZATO",
    "vuoleContratto": true,
    "vuoleBrochure": true,
    "eta": 75
  }'
```

**Risposta attesa:**
```json
{
  "success": true,
  "contractId": 123,
  "message": "Contratto generato e inviato via email",
  "docusignEnvelopeId": "abc-123-def"
}
```

### Step 4: Verifica Email Ricevuta

Controlla la tua casella email:

1. ✅ **Email da DocuSign**
   - Oggetto: "Please sign: Contratto TeleAssistenza..."
   - Link firma elettronica
   - Scadenza: 30 giorni

2. ✅ **Email di benvenuto** (se configurata)
   - Allegato: Brochure PDF
   - Dettagli servizio

### Step 5: Firma Contratto DocuSign

1. Apri email DocuSign
2. Clicca "Review Document"
3. Firma elettronicamente
4. Conferma

**Il sistema automaticamente:**
- ✅ Genera Proforma
- ✅ Invia email con Stripe payment link
- ✅ Salva tutto in database

### Step 6: Verifica Database

```bash
# Path database locale
DB_PATH=".wrangler/state/v3/d1/miniflare-D1DatabaseObject/97505df135f15360373d775555b661a51027c29c114a5dec16c15f12103da7d6.sqlite"

# Query lead appena creato
sqlite3 "$DB_PATH" "SELECT * FROM leads WHERE email = 'tua-email@example.com';"

# Query contratto generato
sqlite3 "$DB_PATH" "SELECT id, nome_cliente, docusign_status FROM contratti WHERE email_cliente = 'tua-email@example.com';"

# Query proforma (dopo firma)
sqlite3 "$DB_PATH" "SELECT numero_proforma, stripe_payment_status FROM proformas WHERE contract_id = (SELECT id FROM contratti WHERE email_cliente = 'tua-email@example.com');"
```

---

## 🧪 Test Specifici per Componente

### Test 1: Pricing Configuration

```bash
curl "http://localhost:8788/api/pricing?servizio=PRO&piano=AVANZATO"
```

**Risposta attesa:**
```json
{
  "success": true,
  "pricing": {
    "primoAnno": 840,
    "rinnovo": 600,
    "iva": 22,
    "totale": 1024.80
  }
}
```

**Test tutte le combinazioni:**

| Servizio | Piano | Prezzo Primo Anno |
|----------|-------|-------------------|
| FAMILY | BASE | €360 |
| FAMILY | AVANZATO | €600 |
| PRO | BASE | €480 |
| PRO | AVANZATO | €840 |
| PREMIUM | BASE | €720 |
| PREMIUM | AVANZATO | €1200 |

### Test 2: Brochures

```bash
curl http://localhost:8788/api/brochures
```

**Risposta attesa:**
```json
{
  "success": true,
  "brochures": [
    {
      "id": 1,
      "name": "Brochure_Family_SiDLY.pdf",
      "size": 2547123
    },
    {
      "id": 2,
      "name": "Brochure_Tele-Assistenza_Anziani.pdf",
      "size": 3821045
    },
    ...
  ]
}
```

### Test 3: Templates

```bash
curl http://localhost:8788/api/templates
```

**Risposta attesa:**
```json
{
  "success": true,
  "templates": [
    {
      "id": 1,
      "name": "contratto_base_b2c",
      "category": "contract"
    },
    ...
  ]
}
```

### Test 4: Webhook Simulation (DocuSign)

**Simula firma completata:**

```bash
curl -X POST http://localhost:8788/api/webhooks/docusign \
  -H "Content-Type: application/json" \
  -d '{
    "event": "envelope-completed",
    "data": {
      "envelopeId": "abc-123-def",
      "status": "completed"
    }
  }'
```

**Verifica:**
- ✅ Proforma generata
- ✅ Email inviata con Stripe link
- ✅ Database aggiornato

---

## 📊 Monitoring Locale

### Log Real-Time

```bash
wrangler tail --local
```

**Output esempio:**
```
[CONTRACT-WORKFLOW] Lead ricevuto: mario.rossi@example.com
[CONTRACT-GENERATOR] Generazione contratto PRO AVANZATO
[DOCUSIGN] Envelope creato: abc-123-def
[EMAIL] Email inviata con successo
✅ [WORKFLOW] Contratto inviato: ID 123
```

### Database Inspection

```bash
# Apri database interattivo
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite

# Query utili
.tables                                    # Lista tabelle
SELECT COUNT(*) FROM leads;                # Count lead
SELECT * FROM leads ORDER BY id DESC LIMIT 5;  # Ultimi 5 lead
SELECT * FROM contratti WHERE docusign_status = 'completed';  # Contratti firmati
```

---

## 🔍 Troubleshooting

### Errore: "Database not found"

**Soluzione:**
```bash
# Avvia dev server per creare database
npm run dev

# In altro terminale, forza creazione tabelle
wrangler d1 execute DB --local --file=schema.sql
```

### Errore: "Pricing non trovato per PRO AVANZATO"

**Causa:** Bug nel contract-workflow-manager (parametro duplicato)

**Fix già applicato:**
- Commit `237dc6d` ha fixato il bug
- Verifica ultima versione: `git pull`

### Email non ricevute

**Verifica:**
1. API Key Resend corretta in `.dev.vars`
2. Email mittente verificata su Resend
3. Controlla spam/junk folder
4. Log server per errori email

**Debug:**
```bash
# Verifica configurazione email
curl http://localhost:8788/api/config/email
```

### DocuSign non invia email

**Verifica:**
1. Credenziali DocuSign corrette
2. Account DocuSign attivo (non demo scaduto)
3. Controlla DocuSign Dashboard per envelope status
4. Log per envelope ID

---

## ✅ Checklist Test Completo

Prima del deploy in produzione, verifica:

- [ ] ✅ Health check risponde correttamente
- [ ] ✅ POST /api/lead genera contratto
- [ ] ✅ Email DocuSign ricevuta
- [ ] ✅ Brochure PDF allegata
- [ ] ✅ Firma DocuSign funziona
- [ ] ✅ Proforma generata dopo firma
- [ ] ✅ Email Proforma + Stripe ricevuta
- [ ] ✅ Database salva tutti i dati
- [ ] ✅ Pricing corretto per ogni servizio/piano
- [ ] ✅ No errori in console/log

---

## 🚀 Se tutto funziona: Deploy Produzione

### Step 1: Deploy Main App

```bash
npm run deploy
```

### Step 2: Deploy Cloudflare Queue

```bash
# Setup automatico
./scripts/setup-cloudflare-queue.sh

# Oppure manuale
wrangler queues create ecura-leads-queue
wrangler deploy --config wrangler-producer.toml
wrangler deploy --config wrangler-consumer.toml
```

### Step 3: Test Produzione

```bash
curl -X POST https://ecura-producer.YOUR.workers.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{ ... }'
```

---

## 📞 Supporto

- 📖 **Docs**: `/docs/GUIDA_TEST_WORKFLOW.md`
- 🔧 **Script**: `./scripts/test-workflow-local.sh`
- 🧪 **Test API**: `./scripts/test-api-endpoints.sh`
- 🐛 **Issues**: GitHub Issues

---

## 🎉 Happy Testing!

Buon test! Se tutto funziona localmente, funzionerà anche in produzione! 🚀
