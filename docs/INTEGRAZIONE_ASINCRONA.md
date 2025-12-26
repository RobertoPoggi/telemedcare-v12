# INTEGRAZIONE ASINCRONA: LANDING PAGE eCURA.IT ↔ SISTEMA BACKEND

## 🎯 OBIETTIVO: DISACCOPPIAMENTO COMPLETO

Vuoi che **Landing Page ecura.it** e **Sistema Backend eCura** siano **totalmente indipendenti** e comunicano in modo **asincrono**.

---

## ✅ ARCHITETTURA PROPOSTA: COMUNICAZIONE ASINCRONA

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Landing Page   │         │   Message    │         │  Sistema eCura  │
│   ecura.it      │────────▶│    Queue     │◀────────│    Backend      │
│  (Esterno)      │         │  (Asincrono) │         │  (Cloudflare)   │
└─────────────────┘         └──────────────┘         └─────────────────┘
       │                            │                         │
       │                            │                         │
   User compila              Lead in coda              Processa lead
      form                   (buffering)               quando disponibile
```

---

## 🎯 OPZIONE A: WEBHOOK + RETRY LOGIC (SIMPLE & ROBUST)

### Caratteristiche:
- ✅ **LP indipendente**: ecura.it invia e "dimentica"
- ✅ **Retry automatico**: Se backend down, retry con backoff
- ✅ **Idempotente**: Stessa richiesta = stesso risultato
- ✅ **No infrastruttura aggiuntiva**: Solo HTTP + localStorage

---

### IMPLEMENTAZIONE DETTAGLIATA

#### **1. LANDING PAGE ecura.it - Client Side**

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <title>eCura - Form Richiesta</title>
</head>
<body>
  <h1>Richiedi Informazioni eCura</h1>
  
  <form id="ecura-form">
    <input type="text" name="nome" placeholder="Nome" required>
    <input type="text" name="cognome" placeholder="Cognome" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="tel" name="telefono" placeholder="Telefono" required>
    
    <select name="servizio" required>
      <option value="">Seleziona Servizio</option>
      <option value="FAMILY">FAMILY</option>
      <option value="PRO">PRO</option>
      <option value="PREMIUM">PREMIUM</option>
    </select>
    
    <select name="pacchetto" required>
      <option value="BASE">BASE</option>
      <option value="AVANZATO">AVANZATO</option>
    </select>
    
    <label>
      <input type="checkbox" name="vuoleContratto" value="on">
      Voglio ricevere il contratto
    </label>
    
    <label>
      <input type="checkbox" name="vuoleBrochure" value="on">
      Voglio ricevere la brochure
    </label>
    
    <input type="number" name="eta" placeholder="Età" min="0" max="120">
    
    <button type="submit">Invia Richiesta</button>
  </form>
  
  <div id="status"></div>

  <script>
    // ========================================
    // ASYNC LEAD SENDER CON RETRY LOGIC
    // ========================================
    
    const BACKEND_URL = 'https://telemedcare-v11.tuodominio.workers.dev/api/lead';
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 2000; // 2 secondi
    
    // Queue management con localStorage
    class LeadQueue {
      constructor() {
        this.queueKey = 'ecura_lead_queue';
      }
      
      // Aggiungi lead alla coda
      enqueue(leadData) {
        const queue = this.getQueue();
        const leadId = 'LEAD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        queue.push({
          id: leadId,
          data: leadData,
          attempts: 0,
          createdAt: new Date().toISOString(),
          status: 'pending'
        });
        
        localStorage.setItem(this.queueKey, JSON.stringify(queue));
        return leadId;
      }
      
      // Recupera coda
      getQueue() {
        const stored = localStorage.getItem(this.queueKey);
        return stored ? JSON.parse(stored) : [];
      }
      
      // Rimuovi lead dalla coda
      dequeue(leadId) {
        let queue = this.getQueue();
        queue = queue.filter(item => item.id !== leadId);
        localStorage.setItem(this.queueKey, JSON.stringify(queue));
      }
      
      // Aggiorna stato lead
      updateStatus(leadId, status, error = null) {
        const queue = this.getQueue();
        const lead = queue.find(item => item.id === leadId);
        if (lead) {
          lead.status = status;
          lead.lastAttempt = new Date().toISOString();
          if (error) lead.lastError = error;
          localStorage.setItem(this.queueKey, JSON.stringify(queue));
        }
      }
      
      // Incrementa tentativi
      incrementAttempts(leadId) {
        const queue = this.getQueue();
        const lead = queue.find(item => item.id === leadId);
        if (lead) {
          lead.attempts++;
          localStorage.setItem(this.queueKey, JSON.stringify(queue));
        }
      }
      
      // Recupera lead pendenti
      getPending() {
        return this.getQueue().filter(item => 
          item.status === 'pending' && item.attempts < MAX_RETRIES
        );
      }
    }
    
    const queue = new LeadQueue();
    
    // ========================================
    // INVIO ASINCRONO CON RETRY
    // ========================================
    
    async function sendLeadAsync(leadId, leadData, retryCount = 0) {
      try {
        console.log(`📤 [LEAD ${leadId}] Tentativo ${retryCount + 1}/${MAX_RETRIES}`);
        
        const response = await fetch(BACKEND_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': leadId // Idempotency key
          },
          body: JSON.stringify(leadData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          // ✅ SUCCESS
          console.log(`✅ [LEAD ${leadId}] Inviato con successo!`);
          queue.updateStatus(leadId, 'sent');
          queue.dequeue(leadId); // Rimuovi dalla coda
          return { success: true, result };
        } else {
          // ⚠️ ERROR dal backend
          throw new Error(result.error || 'Errore backend');
        }
        
      } catch (error) {
        console.error(`❌ [LEAD ${leadId}] Errore tentativo ${retryCount + 1}:`, error.message);
        queue.incrementAttempts(leadId);
        
        // RETRY LOGIC
        if (retryCount < MAX_RETRIES - 1) {
          const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
          console.log(`🔄 [LEAD ${leadId}] Retry tra ${delay}ms...`);
          queue.updateStatus(leadId, 'retrying', error.message);
          
          // Schedula retry
          setTimeout(() => {
            sendLeadAsync(leadId, leadData, retryCount + 1);
          }, delay);
          
          return { success: false, retrying: true };
        } else {
          // MAX RETRIES raggiunto
          console.error(`💀 [LEAD ${leadId}] MAX RETRIES raggiunto. Lead salvato per invio manuale.`);
          queue.updateStatus(leadId, 'failed', error.message);
          return { success: false, error: error.message };
        }
      }
    }
    
    // ========================================
    // FORM HANDLER
    // ========================================
    
    document.getElementById('ecura-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const leadData = {
        nome: formData.get('nome'),
        cognome: formData.get('cognome'),
        email: formData.get('email'),
        telefono: formData.get('telefono'),
        servizio: formData.get('servizio'),
        pacchetto: formData.get('pacchetto'),
        vuoleContratto: formData.get('vuoleContratto') === 'on',
        vuoleBrochure: formData.get('vuoleBrochure') === 'on',
        eta: parseInt(formData.get('eta')) || null,
        source: 'ecura.it',
        timestamp: new Date().toISOString()
      };
      
      // Aggiungi a coda
      const leadId = queue.enqueue(leadData);
      
      // Mostra feedback immediato (UI non bloccata)
      document.getElementById('status').innerHTML = `
        <div style="padding: 15px; background: #e0f2fe; border-left: 4px solid #0284c7; margin-top: 20px;">
          <strong>✅ Richiesta ricevuta!</strong><br>
          Codice: <code>${leadId}</code><br>
          <small>Stiamo inviando i tuoi dati al sistema. Riceverai conferma via email.</small>
        </div>
      `;
      
      this.reset();
      
      // INVIO ASINCRONO (non blocca UI)
      sendLeadAsync(leadId, leadData);
    });
    
    // ========================================
    // BACKGROUND RETRY PROCESSOR
    // ========================================
    
    // Al caricamento pagina, riprova invii falliti
    window.addEventListener('load', () => {
      const pending = queue.getPending();
      
      if (pending.length > 0) {
        console.log(`🔄 Trovati ${pending.length} lead pendenti. Riprovo invio...`);
        
        pending.forEach(item => {
          setTimeout(() => {
            sendLeadAsync(item.id, item.data, item.attempts);
          }, 1000); // Riprova dopo 1 secondo
        });
      }
    });
    
    // RETRY periodico ogni 30 secondi (opzionale)
    setInterval(() => {
      const pending = queue.getPending();
      if (pending.length > 0) {
        console.log(`🔄 [Background] Riprovo ${pending.length} lead pendenti...`);
        pending.forEach(item => {
          sendLeadAsync(item.id, item.data, item.attempts);
        });
      }
    }, 30000); // 30 secondi
  </script>
</body>
</html>
```

---

### VANTAGGI OPZIONE A:

✅ **Zero dipendenze esterne** (no server aggiuntivi)
✅ **Retry automatico** con exponential backoff
✅ **Persistenza locale** (localStorage) in caso di chiusura browser
✅ **Background retry** al ricaricamento pagina
✅ **Idempotenza** con X-Request-ID header
✅ **UI non bloccante** (utente riceve feedback immediato)

---

## 🎯 OPZIONE B: MESSAGE QUEUE (REDIS/KAFKA/RabbitMQ)

### Architettura avanzata con queue persistente

```
┌─────────────────┐         ┌──────────────┐         ┌─────────────────┐
│  Landing Page   │         │    Redis     │         │  Sistema eCura  │
│   ecura.it      │────────▶│    Queue     │◀────────│   Worker        │
│                 │  LPUSH  │              │  RPOP   │   (Consumer)    │
└─────────────────┘         └──────────────┘         └─────────────────┘
```

### Componenti:

#### **1. API Proxy su ecura.it (Node.js/Express)**

```javascript
// server.js - API Proxy con Redis Queue
const express = require('express');
const Redis = require('ioredis');
const { v4: uuidv4 } = require('uuid');

const app = express();
const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());
app.use(express.static('public'));

// Endpoint per ricevere lead
app.post('/api/submit-lead', async (req, res) => {
  try {
    const leadData = req.body;
    
    // Validazione base
    if (!leadData.email || !leadData.nome) {
      return res.status(400).json({ 
        success: false, 
        error: 'Dati mancanti' 
      });
    }
    
    // Genera ID unico
    const leadId = `LEAD_${Date.now()}_${uuidv4()}`;
    
    // Aggiungi a Redis queue
    const queueData = {
      id: leadId,
      data: leadData,
      timestamp: new Date().toISOString(),
      attempts: 0
    };
    
    await redis.lpush('ecura:leads:queue', JSON.stringify(queueData));
    
    console.log(`✅ Lead ${leadId} aggiunto alla coda`);
    
    // Risposta immediata (asincrona)
    res.json({
      success: true,
      leadId: leadId,
      message: 'Lead ricevuto e in elaborazione',
      estimatedProcessingTime: '1-2 minuti'
    });
    
  } catch (error) {
    console.error('Errore API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Errore server' 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', queue: 'redis' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 API Proxy listening on port ${PORT}`);
});
```

#### **2. Worker Consumer (Cloudflare Worker con Durable Objects)**

```typescript
// worker-consumer.ts - Consuma dalla coda Redis
import { Redis } from '@upstash/redis';

export interface Env {
  DB: D1Database;
  REDIS_URL: string;
  REDIS_TOKEN: string;
}

export default {
  // Scheduled trigger ogni 30 secondi
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log('🔄 Worker consumer started');
    
    const redis = new Redis({
      url: env.REDIS_URL,
      token: env.REDIS_TOKEN
    });
    
    try {
      // Consuma lead dalla coda (batch di 10)
      for (let i = 0; i < 10; i++) {
        const leadJson = await redis.rpop('ecura:leads:queue');
        
        if (!leadJson) {
          console.log('📭 Coda vuota');
          break;
        }
        
        const leadItem = JSON.parse(leadJson as string);
        
        console.log(`📥 Processo lead ${leadItem.id}`);
        
        // Importa lead processor
        const { processLead } = await import('./modules/lead-processor');
        
        // Processa lead
        const result = await processLead(leadItem.data, env.DB);
        
        if (result.success) {
          console.log(`✅ Lead ${leadItem.id} processato con successo`);
        } else {
          console.error(`❌ Errore lead ${leadItem.id}:`, result.error);
          
          // Retry logic: rimetti in coda se < 3 tentativi
          if (leadItem.attempts < 3) {
            leadItem.attempts++;
            await redis.lpush('ecura:leads:queue', JSON.stringify(leadItem));
            console.log(`🔄 Lead ${leadItem.id} rimesso in coda (tentativo ${leadItem.attempts})`);
          } else {
            // Salva in DLQ (Dead Letter Queue)
            await redis.lpush('ecura:leads:dlq', JSON.stringify(leadItem));
            console.log(`💀 Lead ${leadItem.id} spostato in DLQ`);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Errore worker consumer:', error);
    }
  }
};
```

#### **3. Configurazione wrangler.toml**

```toml
name = "ecura-worker-consumer"
main = "src/worker-consumer.ts"
compatibility_date = "2024-01-01"

# Trigger schedulato ogni 30 secondi
[triggers]
crons = ["*/30 * * * *"]

# Binding Redis (Upstash)
[[unsafe.bindings]]
name = "REDIS_URL"
type = "plain_text"

[[unsafe.bindings]]
name = "REDIS_TOKEN"
type = "plain_text"

# Binding D1
[[d1_databases]]
binding = "DB"
database_name = "telemedcare_db"
database_id = "YOUR_D1_ID"
```

---

### VANTAGGI OPZIONE B:

✅ **Coda persistente** (dati non si perdono mai)
✅ **Scalabilità** (gestisce migliaia di lead/sec)
✅ **Monitoring** (Redis dashboard per vedere coda in tempo reale)
✅ **Dead Letter Queue** (lead falliti salvati per debug)
✅ **Retry automatico** con controllo tentativi
✅ **Disaccoppiamento totale** (LP e backend totalmente separati)

### SVANTAGGI:

⚠️ Richiede infrastruttura aggiuntiva (Redis/Upstash)
⚠️ Più complessità setup iniziale
⚠️ Costo aggiuntivo per Redis cloud

---

## 🎯 OPZIONE C: WEBHOOK + CLOUDFLARE QUEUE (SERVERLESS NATIVE)

### Architettura 100% Cloudflare

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Landing Page   │         │  Cloudflare      │         │  Consumer       │
│   ecura.it      │────────▶│    Queue         │◀────────│   Worker        │
│                 │  POST   │  (Serverless)    │  PULL   │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Setup:

#### **1. Creare Cloudflare Queue**

```bash
# Crea queue
wrangler queues create ecura-leads-queue

# Output:
# Queue created: ecura-leads-queue
# Queue ID: XXXX-XXXX-XXXX-XXXX
```

#### **2. Producer Worker (riceve lead da LP)**

```typescript
// producer-worker.ts
export interface Env {
  ECURA_QUEUE: Queue;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    try {
      const leadData = await request.json();
      
      // Validazione
      if (!leadData.email || !leadData.nome) {
        return Response.json({ 
          success: false, 
          error: 'Dati mancanti' 
        }, { status: 400 });
      }
      
      // Genera ID
      const leadId = `LEAD_${Date.now()}_${crypto.randomUUID()}`;
      
      // Invia a queue
      await env.ECURA_QUEUE.send({
        id: leadId,
        data: leadData,
        timestamp: new Date().toISOString()
      });
      
      console.log(`✅ Lead ${leadId} inviato alla queue`);
      
      // Risposta immediata
      return Response.json({
        success: true,
        leadId: leadId,
        message: 'Lead ricevuto e in elaborazione'
      });
      
    } catch (error) {
      console.error('Errore producer:', error);
      return Response.json({ 
        success: false, 
        error: 'Errore server' 
      }, { status: 500 });
    }
  }
};
```

#### **3. Consumer Worker (processa lead)**

```typescript
// consumer-worker.ts
import { processLead } from './modules/lead-processor';

export interface Env {
  DB: D1Database;
}

export default {
  async queue(batch: MessageBatch, env: Env): Promise<void> {
    
    console.log(`📥 Ricevuti ${batch.messages.length} messaggi dalla queue`);
    
    for (const message of batch.messages) {
      try {
        const leadItem = message.body;
        
        console.log(`🔄 Processo lead ${leadItem.id}`);
        
        // Processa lead
        const result = await processLead(leadItem.data, env.DB);
        
        if (result.success) {
          console.log(`✅ Lead ${leadItem.id} processato`);
          message.ack(); // Conferma elaborazione
        } else {
          console.error(`❌ Errore lead ${leadItem.id}:`, result.error);
          message.retry(); // Riprova automaticamente
        }
        
      } catch (error) {
        console.error('❌ Errore elaborazione:', error);
        message.retry({ delaySeconds: 60 }); // Retry tra 60 sec
      }
    }
  }
};
```

#### **4. wrangler.toml configurazione**

```toml
# Producer
name = "ecura-producer"
main = "src/producer-worker.ts"

[[queues.producers]]
queue = "ecura-leads-queue"
binding = "ECURA_QUEUE"

# Consumer
name = "ecura-consumer"
main = "src/consumer-worker.ts"

[[queues.consumers]]
queue = "ecura-leads-queue"
max_batch_size = 10
max_batch_timeout = 30

[[d1_databases]]
binding = "DB"
database_name = "telemedcare_db"
database_id = "YOUR_D1_ID"
```

---

### VANTAGGI OPZIONE C:

✅ **100% Serverless** (no infrastruttura da gestire)
✅ **Retry automatico** nativo Cloudflare
✅ **Scalabilità infinita** (gestisce qualsiasi carico)
✅ **Costo ottimizzato** (pay-per-use)
✅ **Monitoring integrato** (Cloudflare dashboard)
✅ **Dead Letter Queue** nativo
✅ **Massima affidabilità** (SLA 99.99%)

---

## 📊 CONFRONTO FINALE

| Caratteristica | Opzione A (Retry Client) | Opzione B (Redis Queue) | Opzione C (CF Queue) |
|----------------|--------------------------|-------------------------|----------------------|
| **Setup** | ⭐⭐⭐⭐⭐ Semplice | ⭐⭐ Medio | ⭐⭐⭐⭐ Facile |
| **Costo** | ⭐⭐⭐⭐⭐ Gratis | ⭐⭐ Redis €$ | ⭐⭐⭐⭐ Low |
| **Affidabilità** | ⭐⭐⭐ Browser-dependent | ⭐⭐⭐⭐⭐ Alta | ⭐⭐⭐⭐⭐ Altissima |
| **Scalabilità** | ⭐⭐ Limitata | ⭐⭐⭐⭐⭐ Eccellente | ⭐⭐⭐⭐⭐ Illimitata |
| **Monitoring** | ⭐ Manuale | ⭐⭐⭐⭐⭐ Dashboard | ⭐⭐⭐⭐⭐ Dashboard |
| **Indipendenza** | ⭐⭐⭐ Parziale | ⭐⭐⭐⭐⭐ Totale | ⭐⭐⭐⭐⭐ Totale |

---

## 🎯 RACCOMANDAZIONE FINALE

### **Per produzione seria: OPZIONE C (Cloudflare Queue)** 🏆

**Perché:**
- ✅ Disaccoppiamento totale garantito
- ✅ Zero infrastruttura da gestire
- ✅ Retry e DLQ nativi
- ✅ Scalabilità automatica
- ✅ Costo contenuto
- ✅ Già su Cloudflare (stessa piattaforma)

---

**Quale opzione preferisci implementare?** Posso aiutarti con il setup completo! 🚀

