# 🔧 Workflow API Integration Guide
## TeleMedCare V11.0 - Complete Workflow System

---

## 📋 Overview

I nuovi moduli workflow devono essere integrati negli endpoint API esistenti in `src/index.tsx`.

---

## ✅ Moduli Creati

1. **workflow-email-manager.ts** - Gestione completa email workflow
2. **signature-manager.ts** - Firma elettronica contratti
3. **payment-manager.ts** - Pagamenti (Stripe + Bonifici)
4. **client-configuration-manager.ts** - Configurazioni cliente
5. **complete-workflow-orchestrator.ts** - Orchestrazione completa

---

## 🔌 Integrazioni Necessarie

### 1. Endpoint `/api/lead` (POST) - ESISTENTE DA AGGIORNARE

**Posizione:** `src/index.tsx` linea ~3701

**Modifiche necessarie:**
```typescript
import CompleteWorkflowOrchestrator from './modules/complete-workflow-orchestrator'

app.post('/api/lead', async (c) => {
  try {
    // ... codice esistente per salvare lead nel DB ...
    
    // NUOVO: Usa orchestrator invece di funzioni separate
    const workflowResult = await CompleteWorkflowOrchestrator.processNewLead({
      db: c.env.DB,
      env: c.env,
      leadData: normalizedLead
    })
    
    return c.json({
      success: true,
      leadId: leadId,
      workflow: workflowResult
    })
  } catch (error) {
    // ... error handling ...
  }
})
```

---

### 2. Endpoint `/api/contracts/sign` (POST) - ESISTENTE DA AGGIORNARE

**Posizione:** `src/index.tsx` linea ~4369

**Modifiche necessarie:**
```typescript
import CompleteWorkflowOrchestrator from './modules/complete-workflow-orchestrator'

app.post('/api/contracts/sign', async (c) => {
  try {
    const { contractId, signatureData } = await c.req.json()
    
    // Recupera dati lead dal contratto
    const contract = await c.env.DB.prepare(`
      SELECT c.*, l.* 
      FROM contracts c
      JOIN leads l ON c.leadId = l.id
      WHERE c.id = ?
    `).bind(contractId).first()
    
    if (!contract) {
      return c.json({ success: false, error: 'Contratto non trovato' }, 404)
    }
    
    // NUOVO: Usa orchestrator per gestire firma e proforma
    const result = await CompleteWorkflowOrchestrator.processContractSignature({
      db: c.env.DB,
      env: c.env,
      leadData: contract,
      contractId,
      signatureData
    })
    
    return c.json(result)
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})
```

---

### 3. Endpoint `/api/payments/confirm` (POST) - NUOVO DA CREARE

**Posizione:** Aggiungere in `src/index.tsx` dopo gli endpoint pagamenti esistenti

```typescript
import CompleteWorkflowOrchestrator from './modules/complete-workflow-orchestrator'

// Conferma pagamento (manuale per bonifici, webhook per Stripe)
app.post('/api/payments/confirm', async (c) => {
  try {
    const { paymentId, proformaId, contractId, leadId, importo, metodo, autoConfirm } = await c.req.json()
    
    // Recupera dati lead
    const lead = await c.env.DB.prepare(`
      SELECT * FROM leads WHERE id = ?
    `).bind(leadId).first()
    
    if (!lead) {
      return c.json({ success: false, error: 'Lead non trovato' }, 404)
    }
    
    // NUOVO: Usa orchestrator per processare pagamento
    const result = await CompleteWorkflowOrchestrator.processPayment({
      db: c.env.DB,
      env: c.env,
      leadData: lead,
      proformaId,
      contractId,
      paymentData: {
        importo,
        metodo,
        autoConfirm: autoConfirm || false,
        transactionId: paymentId
      }
    })
    
    return c.json(result)
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})
```

---

### 4. Endpoint `/api/stripe/webhook` (POST) - NUOVO DA CREARE

**Posizione:** Aggiungere in `src/index.tsx` per gestire webhook Stripe

```typescript
import PaymentManager from './modules/payment-manager'

// Webhook Stripe per conferma automatica pagamenti
app.post('/api/stripe/webhook', async (c) => {
  try {
    const signature = c.req.header('stripe-signature')
    const body = await c.req.text()
    
    // Verifica firma Stripe (in produzione)
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    
    // Per ora, parse JSON
    const event = JSON.parse(body)
    
    // Gestisci evento con PaymentManager
    const result = await PaymentManager.handleStripeWebhook(c.env.DB, event)
    
    return c.json(result)
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})
```

---

### 5. Endpoint `/api/configurations/submit` (POST) - NUOVO DA CREARE

**Posizione:** Aggiungere in `src/index.tsx`

```typescript
import CompleteWorkflowOrchestrator from './modules/complete-workflow-orchestrator'

// Submit configurazione cliente
app.post('/api/configurations/submit', async (c) => {
  try {
    const configData = await c.req.json()
    
    // Recupera dati lead/cliente
    const lead = await c.env.DB.prepare(`
      SELECT * FROM leads WHERE id = ?
    `).bind(configData.leadId).first()
    
    if (!lead) {
      return c.json({ success: false, error: 'Cliente non trovato' }, 404)
    }
    
    // NUOVO: Usa orchestrator per processare configurazione
    const result = await CompleteWorkflowOrchestrator.processConfiguration({
      db: c.env.DB,
      env: c.env,
      leadData: lead,
      configData
    })
    
    return c.json(result)
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})
```

---

### 6. Endpoint `/api/devices/associate` (POST) - NUOVO DA CREARE O AGGIORNARE

**Posizione:** Aggiungere o aggiornare in `src/index.tsx`

```typescript
import CompleteWorkflowOrchestrator from './modules/complete-workflow-orchestrator'

// Associa dispositivo e invia email conferma attivazione
app.post('/api/devices/associate', async (c) => {
  try {
    const { leadId, imei, modello } = await c.req.json()
    
    // Recupera dati cliente
    const lead = await c.env.DB.prepare(`
      SELECT * FROM leads WHERE id = ?
    `).bind(leadId).first()
    
    if (!lead) {
      return c.json({ success: false, error: 'Cliente non trovato' }, 404)
    }
    
    // NUOVO: Usa orchestrator per associare dispositivo e inviare conferma
    const result = await CompleteWorkflowOrchestrator.processDeviceAssociation({
      db: c.env.DB,
      env: c.env,
      leadData: lead,
      deviceData: { imei, modello }
    })
    
    return c.json(result)
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500)
  }
})
```

---

## 🎯 Flusso Completo Integrato

```
1. POST /api/lead
   └─> CompleteWorkflowOrchestrator.processNewLead()
       ├─> WorkflowEmailManager.inviaEmailNotificaInfo()
       ├─> (Se solo brochure) WorkflowEmailManager.inviaEmailDocumentiInformativi()
       └─> (Se contratto) WorkflowEmailManager.inviaEmailContratto()

2. POST /api/contracts/sign
   └─> CompleteWorkflowOrchestrator.processContractSignature()
       ├─> SignatureManager.saveSignature()
       └─> WorkflowEmailManager.inviaEmailProforma()

3. POST /api/payments/confirm (o webhook Stripe)
   └─> CompleteWorkflowOrchestrator.processPayment()
       ├─> PaymentManager.registerPayment()
       ├─> PaymentManager.confirmPayment()
       └─> WorkflowEmailManager.inviaEmailBenvenuto()

4. POST /api/configurations/submit
   └─> CompleteWorkflowOrchestrator.processConfiguration()
       ├─> ClientConfigurationManager.saveConfiguration()
       └─> WorkflowEmailManager.inviaEmailConfigurazione()

5. POST /api/devices/associate
   └─> CompleteWorkflowOrchestrator.processDeviceAssociation()
       └─> WorkflowEmailManager.inviaEmailConfermaAttivazione()
```

---

## ⚙️ Import Necessari

Aggiungere in cima a `src/index.tsx`:

```typescript
import CompleteWorkflowOrchestrator from './modules/complete-workflow-orchestrator'
import PaymentManager from './modules/payment-manager'
import SignatureManager from './modules/signature-manager'
import ClientConfigurationManager from './modules/client-configuration-manager'
import WorkflowEmailManager from './modules/workflow-email-manager'
```

---

## ✅ Verifiche Post-Integrazione

- [ ] Endpoint `/api/lead` usa `processNewLead()`
- [ ] Endpoint `/api/contracts/sign` usa `processContractSignature()`
- [ ] Endpoint `/api/payments/confirm` creato e funzionante
- [ ] Endpoint `/api/stripe/webhook` creato per webhook
- [ ] Endpoint `/api/configurations/submit` creato
- [ ] Endpoint `/api/devices/associate` creato/aggiornato
- [ ] Import moduli aggiunti
- [ ] Test di tutti i flussi completati

---

## 🧪 Testing

Dopo le integrazioni, testare con:

1. **Flusso Solo Brochure:**
   - POST /api/lead con `vuoleContratto: false, vuoleBrochure: true`
   - Verificare email a info@ e email documenti al lead

2. **Flusso Contratto BASE Completo:**
   - POST /api/lead con `vuoleContratto: true, pacchetto: 'BASE'`
   - POST /api/contracts/sign con signature
   - POST /api/payments/confirm con dati pagamento
   - POST /api/configurations/submit con config
   - POST /api/devices/associate con IMEI

3. **Flusso Contratto AVANZATO Completo:**
   - Come BASE ma con `pacchetto: 'AVANZATO'`
   - Verificare prezzi corretti (€1,024.80)

---

## 📝 Note

- Il codice esistente in `index.tsx` ha già funzioni `inviaEmailNotificaInfo()`, `inviaEmailDocumentiInformativi()`, `generaEInviaContratto()` che possono essere SOSTITUITE con i nuovi moduli
- Gli endpoint esistenti `/api/contracts`, `/api/proforma`, `/api/payments` possono rimanere per compatibilità
- I nuovi endpoint offrono workflow orchestrato più robusto
- Per i test, usare database locale D1 o mock

---

**Creato:** 2025-10-18  
**Sistema:** TeleMedCare V11.0  
**Moduli:** Workflow Orchestration System
