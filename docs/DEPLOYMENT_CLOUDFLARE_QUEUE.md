# 🚀 DEPLOYMENT CLOUDFLARE QUEUE - Guida Completa

**eCura V11.0 - Multi-Channel Lead Ingestion System**

---

## 📋 Prerequisiti

Prima di iniziare, assicurati di avere:

1. **Account Cloudflare** con Workers abilitato
2. **Wrangler CLI** installato globalmente:
   ```bash
   npm install -g wrangler
   ```
3. **Autenticazione Cloudflare**:
   ```bash
   wrangler login
   ```

---

## ⚙️ STEP 1: Crea Cloudflare Queue (10 minuti)

### 1.1 Crea la Queue Principale

```bash
wrangler queues create ecura-leads-queue
```

**Output atteso:**
```
✅ Created queue ecura-leads-queue
```

### 1.2 Crea la Dead Letter Queue (DLQ)

La DLQ raccoglie messaggi che falliscono dopo tutti i retry:

```bash
wrangler queues create ecura-leads-dlq
```

### 1.3 Verifica le Queue Create

```bash
wrangler queues list
```

**Output atteso:**
```
┌───────────────────────┬──────────────┐
│ Queue Name            │ Created At   │
├───────────────────────┼──────────────┤
│ ecura-leads-queue     │ 2025-01-15   │
│ ecura-leads-dlq       │ 2025-01-15   │
└───────────────────────┴──────────────┘
```

---

## 🗄️ STEP 2: Setup Database D1 (5 minuti)

### 2.1 Ottieni Database ID

Se hai già il database `ecura-db`:

```bash
wrangler d1 list
```

Copia il `database_id` (es: `abc123def456...`).

### 2.2 Crea Tabella `leads` (se non esiste)

```bash
wrangler d1 execute ecura-db --command "
CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  external_lead_id TEXT UNIQUE,
  source TEXT NOT NULL,
  nome TEXT,
  cognome TEXT,
  email TEXT NOT NULL,
  telefono TEXT,
  servizio TEXT,
  pacchetto TEXT,
  vuole_contratto INTEGER DEFAULT 1,
  vuole_brochure INTEGER DEFAULT 1,
  eta INTEGER,
  message TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'new',
  error_message TEXT,
  metadata TEXT,
  created_at TEXT,
  updated_at TEXT
);
"
```

### 2.3 Crea Tabella `lead_tracking`

```bash
wrangler d1 execute ecura-db --command "
CREATE TABLE IF NOT EXISTS lead_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id TEXT NOT NULL,
  source TEXT,
  email TEXT,
  status TEXT,
  created_at TEXT
);
"
```

---

## 🔐 STEP 3: Setup KV Namespace per API Keys (5 minuti)

### 3.1 Crea KV Namespace

```bash
wrangler kv:namespace create API_KEYS
```

**Output:**
```
✅ Created namespace: API_KEYS
ID: abc123...
```

Copia l'ID del namespace.

### 3.2 (Opzionale) Aggiungi una API Key di test

```bash
wrangler kv:key put --namespace-id=abc123... \
  "test-key-12345" \
  '{"partner_id":"partner_001","partner_name":"Test Partner","default_commission":"5%"}'
```

---

## 🚀 STEP 4: Deploy Producer Worker (10 minuti)

### 4.1 Configura `wrangler-producer.toml`

Apri `wrangler-producer.toml` e sostituisci:

```toml
account_id = "TUO_CLOUDFLARE_ACCOUNT_ID"

[[d1_databases]]
binding = "DB"
database_name = "ecura-db"
database_id = "TUO_DATABASE_ID"  # <-- Sostituisci

[[kv_namespaces]]
binding = "API_KEYS"
id = "TUO_KV_NAMESPACE_ID"  # <-- Sostituisci
```

### 4.2 Deploy Producer

```bash
wrangler deploy --config wrangler-producer.toml
```

**Output atteso:**
```
✅ Successfully deployed ecura-producer
   https://ecura-producer.YOUR_SUBDOMAIN.workers.dev
```

### 4.3 Test Producer

```bash
curl -X POST https://ecura-producer.YOUR_SUBDOMAIN.workers.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "mario.rossi@test.it",
    "telefono": "335 123 4567",
    "servizio": "PRO",
    "pacchetto": "AVANZATO",
    "vuoleContratto": true,
    "vuoleBrochure": true,
    "source": "test"
  }'
```

**Response atteso:**
```json
{
  "success": true,
  "leadId": "LEAD_1737024000_abc-123",
  "message": "Lead ricevuto e in elaborazione",
  "estimatedProcessingTime": "1-2 minuti"
}
```

---

## 🔄 STEP 5: Deploy Consumer Worker (10 minuti)

### 5.1 Configura `wrangler-consumer.toml`

Apri `wrangler-consumer.toml` e sostituisci:

```toml
account_id = "TUO_CLOUDFLARE_ACCOUNT_ID"

[[d1_databases]]
binding = "DB"
database_name = "ecura-db"
database_id = "TUO_DATABASE_ID"  # <-- Sostituisci

[vars]
RESEND_API_KEY = "TUA_RESEND_KEY"
HUBSPOT_API_KEY = "TUA_HUBSPOT_KEY"
DOCUSIGN_INTEGRATION_KEY = "TUA_DOCUSIGN_KEY"
# ...
```

### 5.2 Deploy Consumer

```bash
wrangler deploy --config wrangler-consumer.toml
```

**Output atteso:**
```
✅ Successfully deployed ecura-consumer
   Consumer bound to queue: ecura-leads-queue
```

### 5.3 Verifica Consumer attivo

```bash
wrangler queues consumer list ecura-leads-queue
```

**Output:**
```
┌─────────────────┬──────────────┐
│ Consumer        │ Status       │
├─────────────────┼──────────────┤
│ ecura-consumer  │ Active       │
└─────────────────┴──────────────┘
```

---

## ✅ STEP 6: Test End-to-End (10 minuti)

### 6.1 Invia Lead di Test

```bash
curl -X POST https://ecura-producer.YOUR_SUBDOMAIN.workers.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test",
    "cognome": "Workflow",
    "email": "tua-email@example.com",
    "telefono": "335 999 8888",
    "servizio": "PRO",
    "pacchetto": "AVANZATO",
    "vuoleContratto": true,
    "vuoleBrochure": true,
    "eta": 75
  }'
```

### 6.2 Monitora Log Consumer

```bash
wrangler tail ecura-consumer
```

Dovresti vedere:
```
[CONSUMER] Batch ricevuto: 1 messaggi
[CONSUMER] Processo lead: LEAD_...
[DB] Lead salvato in DB con ID: 123
[WORKFLOW] Genero contratto per tua-email@example.com
[WORKFLOW] Contratto generato: 456
[WORKFLOW] Email inviata con DocuSign
✅ [CONSUMER] Workflow completato
```

### 6.3 Verifica Database

```bash
wrangler d1 execute ecura-db --command "SELECT * FROM leads ORDER BY id DESC LIMIT 5"
```

### 6.4 Controlla Email

Dovresti ricevere email con:
- ✅ Contratto DocuSign
- ✅ Brochure allegata
- ✅ Link firma DocuSign

---

## 🎯 STEP 7: Integra HubSpot (10 minuti)

### 7.1 Configura Webhook in HubSpot

1. Vai su **HubSpot** → **Workflows** → **Create Workflow**
2. Trigger: "Form submission" o "Contact created"
3. Azione: **Send webhook**
   - URL: `https://ecura-producer.YOUR_SUBDOMAIN.workers.dev/api/webhook/hubspot`
   - Method: `POST`
   - Body (JSON):
   ```json
   {
     "nome": "{{contact.firstname}}",
     "cognome": "{{contact.lastname}}",
     "email": "{{contact.email}}",
     "telefono": "{{contact.phone}}",
     "servizio": "PRO",
     "pacchetto": "AVANZATO",
     "vuoleContratto": true,
     "source": "hubspot"
   }
   ```

4. Salva e attiva il workflow

### 7.2 Test HubSpot Integration

- Compila un form HubSpot
- Verifica che il lead arrivi nella queue
- Controlla log consumer

---

## 📊 Monitoring & Analytics

### Visualizza Messaggi in Queue

```bash
wrangler queues consumer worker ecura-leads-queue ecura-consumer
```

### Visualizza Dead Letter Queue (errori)

```bash
wrangler queues consumer worker ecura-leads-dlq
```

### Log Real-Time

**Producer:**
```bash
wrangler tail ecura-producer --format pretty
```

**Consumer:**
```bash
wrangler tail ecura-consumer --format pretty
```

### Stats API

```bash
curl https://ecura-consumer.YOUR_SUBDOMAIN.workers.dev/stats
```

---

## 🔧 Troubleshooting

### Producer non riceve lead

```bash
# Verifica che il producer sia deployato
wrangler deployments list --name ecura-producer

# Controlla log
wrangler tail ecura-producer
```

### Consumer non processa

```bash
# Verifica binding queue
wrangler queues consumer list ecura-leads-queue

# Controlla se ci sono messaggi in DLQ
wrangler queues consumer worker ecura-leads-dlq
```

### Errori Database

```bash
# Verifica connessione DB
wrangler d1 execute ecura-db --command "SELECT 1"

# Controlla schema
wrangler d1 execute ecura-db --command "SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 🎉 Setup Completato!

Hai ora:

✅ **Producer Worker** attivo su 6 endpoint multi-canale  
✅ **Consumer Worker** che processa lead automaticamente  
✅ **Cloudflare Queue** con retry automatico e DLQ  
✅ **Database D1** per tracking completo  
✅ **HubSpot Integration** pronta  

**Prossimi Step:**
- 🎨 Implementare Dashboard completa
- 🧪 Test end-to-end con tutti i canali
- 🚀 Deploy in produzione

---

## 📞 Supporto

Per problemi o domande:
- 📧 Email: support@ecura.it
- 📖 Docs: `/docs/INTEGRAZIONE_ASINCRONA.md`
- 🐛 GitHub Issues: apri un ticket
