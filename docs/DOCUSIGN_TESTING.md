# DocuSign Integration - Testing Guide

## 📋 Cosa È Stato Implementato

### ✅ Moduli Creati

1. **`docusign-integration.ts`** - Client API DocuSign
   - Autenticazione JWT
   - Creazione envelope
   - Download documenti firmati
   - Gestione webhook

2. **`docusign-workflow.ts`** - Workflow firma contratto
   - Invio contratto per firma
   - Gestione eventi webhook
   - Aggiornamento database
   - Storage documenti firmati

3. **`docusign_envelopes` table** - Tracking firma
   - envelope_id, lead_id, contract_id
   - status, recipient_email
   - signing_url, signed_document_url

---

## 🚀 Setup Completo

### Step 1: Crea Account DocuSign Developer

Segui la guida in `docs/DOCUSIGN_SETUP.md`

### Step 2: Ottieni Credenziali

Dopo aver completato la registrazione, avrai:

```
✅ Integration Key (Client ID)
✅ Secret Key  
✅ Account ID
✅ User ID
✅ Base URL: https://demo.docusign.net/restapi
```

### Step 3: Configura Ambiente Locale

Crea file `.dev.vars` nella root del progetto:

```bash
cd /home/user/webapp
cp .dev.vars.example .dev.vars
```

Modifica `.dev.vars` con le tue credenziali:

```env
DOCUSIGN_INTEGRATION_KEY="abc123..."
DOCUSIGN_SECRET_KEY="xyz789..."
DOCUSIGN_ACCOUNT_ID="12345678-abcd-..."
DOCUSIGN_USER_ID="98765432-dcba-..."
DOCUSIGN_BASE_URL="https://demo.docusign.net/restapi"
```

---

## 🧪 Test Manuale

### Test 1: Invio Contratto per Firma

```typescript
// Nel workflow di invio contratto, dopo la generazione PDF:

import { sendContractForSignature } from './modules/docusign-workflow'

const signatureResult = await sendContractForSignature({
  leadId: leadData.id,
  contractId: contractData.contractId,
  contractCode: contractData.contractCode,
  contractPdfBuffer: contractPdfBuffer, // Buffer del PDF
  customerName: leadData.nomeRichiedente,
  customerEmail: leadData.emailRichiedente,
  serviceType: contractData.tipoServizio,
  price: contractData.prezzoIvaInclusa
}, env, db)

if (signatureResult.success) {
  console.log('✅ Contratto inviato per firma:', signatureResult.envelopeId)
  console.log('🔗 URL firma:', signatureResult.signingUrl)
}
```

### Test 2: Verifica Email DocuSign

Dopo l'invio, il cliente riceverà:
- ✉️ Email da DocuSign
- 🔗 Link "Rivedi Documento"  
- 📄 PDF contratto da firmare

### Test 3: Firma Documento

1. Cliente clicca su "Rivedi Documento"
2. Si apre interfaccia DocuSign
3. Cliente firma elettronicamente
4. DocuSign invia webhook a TeleMedCare

### Test 4: Verifica Webhook

Controlla i log del server per:

```
🔔 [DocuSign Webhook] Evento ricevuto: envelope-completed
✅ [DocuSign] Envelope completato - download documento firmato
💾 [Storage] Documento firmato salvato
🎯 [DocuSign] Contratto firmato - attivazione servizio
```

---

## 🔍 Debug e Troubleshooting

### Verifica Credenziali

```bash
# Test connessione DocuSign
curl -X POST "https://account-d.docusign.com/oauth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=YOUR_JWT"
```

### Check Database

```bash
# Verifica envelopes inviati
./scripts/check-database.sh local all

# Query diretta
wrangler d1 execute telemedcare-leads --local --command \
  "SELECT * FROM docusign_envelopes ORDER BY created_at DESC LIMIT 5"
```

### Log DocuSign

Tutti i log hanno prefisso `[DocuSign]`:

```
📋 [DocuSign] Creazione envelope
✅ [DocuSign] Envelope creato: ENV123...
🔔 [DocuSign Webhook] Evento ricevuto
✅ [DocuSign] Envelope completato
```

---

## 🎯 Integrazione nel Workflow Esistente

### Modifica `complete-workflow-orchestrator.ts`

```typescript
// Dopo creazione contratto, invece di inviare solo email:

if (leadData.vuoleContratto) {
  // Genera contratto PDF
  const contractResult = await generateContract(...)
  
  // OPZIONE 1: Invio per firma DocuSign
  const signatureResult = await sendContractForSignature({
    ...contractData,
    contractPdfBuffer: contractResult.pdfBuffer
  }, env, db)
  
  if (signatureResult.success) {
    // Email con link firma già inviata da DocuSign
    result.message = 'Contratto inviato per firma elettronica'
  }
  
  // OPZIONE 2: Invio email classico (fallback)
  // ...existing email logic
}
```

---

## 📊 Stati Envelope DocuSign

| Stato | Significato | Azione TeleMedCare |
|-------|-------------|-------------------|
| `sent` | Envelope inviato | Email inviata al cliente |
| `delivered` | Cliente ha ricevuto | Tracking consegna |
| `completed` | Documento firmato | ✅ Scarica PDF firmato<br>✅ Attiva servizio |
| `declined` | Cliente ha rifiutato | ⚠️ Notifica follow-up |
| `voided` | Annullato | ℹ️ Log evento |

---

## ⚠️ Note Importanti

### JWT Authentication (TODO)

L'attuale implementazione usa un JWT placeholder. Per produzione:

1. Genera RSA key pair in DocuSign dashboard
2. Salva private key in `DOCUSIGN_PRIVATE_KEY` environment variable
3. Usa libreria `jsonwebtoken` per firmare JWT correttamente

```typescript
import jwt from 'jsonwebtoken'

const token = jwt.sign(payload, privateKey, {
  algorithm: 'RS256',
  header: { typ: 'JWT' }
})
```

### Webhook Endpoint

Configura in DocuSign dashboard:

```
Webhook URL: https://telemedcare.it/api/docusign/webhook
```

Deve essere:
- ✅ Pubblicamente accessibile (no localhost)
- ✅ HTTPS (required by DocuSign)
- ✅ Rispondere con 200 OK entro 100ms

### Costi DocuSign

- **Developer Account**: Gratuito (sandbox)
- **Production**: ~€0.50 per firma
- **Alternative**: Considera firma elettronica zero-cost per development

---

## 🚀 Next Steps

1. ✅ Registrati su DocuSign Developer
2. ✅ Ottieni credenziali
3. ✅ Configura `.dev.vars`
4. ✅ Testa invio contratto
5. ✅ Verifica ricezione email
6. ✅ Testa firma documento
7. ✅ Verifica webhook
8. ✅ Conferma download documento firmato

---

## 📞 Supporto

- **DocuSign Docs**: https://developers.docusign.com/docs/esign-rest-api/
- **API Explorer**: https://developers.docusign.com/docs/esign-rest-api/reference/
- **Support**: https://support.docusign.com/

