# 📋 TODO PER DOMANI SERA - Test Flusso Completo

## ✅ COMPLETATO OGGI (23 Feb 2026)

### 1. Backup Completo
- ✅ Creato backup: `/home/user/telemedcare-v12-backup-20260223-000908.tar.gz` (36MB)
- ✅ Esclusi: node_modules, .git
- ❌ Copia su AI Drive fallita (permessi), ma backup salvato in /home/user/

### 2. Fix Proforma Email
- ✅ Template HTML completo con tabella proforma
- ✅ Rimossa scritta "attivato entro 24 ore"
- ✅ Due opzioni visuali (Stripe + Bonifico)
- ✅ Causale evidenziata in box giallo
- ✅ Pagina `/pagamento.html` creata (Stripe temporaneo)

### 3. Fix Sicurezza Firma Contratto
- ✅ Bottone "✓ Chiudi" aggiunto
- ✅ Messaggio proforma nel success
- ⚠️ **DA TESTARE**: Verifica NO redirect home page

---

## 🔧 DA IMPLEMENTARE DOMANI

### 1. Trigger Email Form Configurazione (DOPO PAGAMENTO)
**Funzione esistente**: `inviaEmailBenvenuto()` in `src/modules/workflow-email-manager.ts` (linea 1194)

**Include già**:
- Link form configurazione: `/configurazione?clientId=XXX`
- Template `email_benvenuto` dal DB
- Subject: "🎉 Benvenuto/a in TeleMedCare"

**DA FARE**:
- Creare endpoint webhook Stripe per catturare `payment_intent.succeeded`
- Chiamare `inviaEmailBenvenuto()` dopo pagamento confermato
- Aggiornare status lead: `PAYMENT_RECEIVED` → `CONFIGURATION_SENT`

**Codice da aggiungere**:
```typescript
// In src/index.tsx - webhook Stripe
app.post('/api/webhooks/stripe', async (c) => {
  const sig = c.req.header('stripe-signature')
  const body = await c.req.text()
  
  // Verifica signature
  // ...
  
  if (event.type === 'payment_intent.succeeded') {
    const proformaId = event.data.object.metadata.proformaId
    
    // Recupera lead da proforma
    const proforma = await c.env.DB.prepare('SELECT * FROM proformas WHERE id = ?').bind(proformaId).first()
    const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?').bind(proforma.leadId).first()
    
    // Genera codice cliente
    const codiceCliente = `CLI-${Date.now()}`
    
    // Invia email benvenuto con form configurazione
    const { inviaEmailBenvenuto } = await import('./modules/workflow-email-manager')
    await inviaEmailBenvenuto(
      { ...lead, codiceCliente },
      c.env,
      c.env.DB
    )
    
    // Aggiorna lead status
    await c.env.DB.prepare('UPDATE leads SET status = ?, codice_cliente = ? WHERE id = ?')
      .bind('CONFIGURATION_SENT', codiceCliente, lead.id).run()
  }
})
```

---

### 2. Aggiungere 4 Bottoni Azioni nella Dashboard Leads

**POSIZIONE**: Tabella leads → Colonna "Azioni" (dopo "Invio Completamento")

**BOTTONI DA AGGIUNGERE**:

#### 1️⃣ Firma Manuale Contratto
- **Icona**: 🖊️ (fas fa-pen)
- **Label**: "Firma Manuale"
- **Endpoint**: `POST /api/leads/:id/manual-sign`
- **Azione**: 
  - Crea contratto
  - Salta firma digitale
  - Firma pre-compilata: "Firma Manuale Staff"
  - Status → `CONTRACT_SIGNED`
  - Trigger proforma

#### 2️⃣ Invio Proforma
- **Icona**: 💰 (fas fa-file-invoice-dollar)
- **Label**: "Invia Proforma"
- **Endpoint**: `POST /api/leads/:id/send-proforma`
- **Azione**:
  - Genera numero proforma
  - Crea record proforma DB
  - Invia email `inviaEmailProforma()`
  - Status → `PROFORMA_SENT`

#### 3️⃣ Pagamento Manuale
- **Icona**: ✅ (fas fa-check-circle)
- **Label**: "Pagamento OK"
- **Endpoint**: `POST /api/leads/:id/manual-payment`
- **Azione**:
  - Conferma pagamento ricevuto
  - Aggiorna proforma status → `PAID`
  - Status lead → `PAYMENT_RECEIVED`
  - **Trigger email form configurazione** 🔥
  - Genera codice cliente

#### 4️⃣ Invio Form Configurazione
- **Icona**: ⚙️ (fas fa-cog)
- **Label**: "Form Config"
- **Endpoint**: `POST /api/leads/:id/send-configuration`
- **Azione**:
  - Genera codice cliente (se manca)
  - Invia `inviaEmailBenvenuto()` con link
  - Status → `CONFIGURATION_SENT`

**CODICE TEMPLATE BOTTONI**:
```html
<!-- In tabella leads, colonna Azioni -->
<td class="px-4 py-3">
  <div class="flex gap-2">
    <!-- Bottone esistente Invio Completamento -->
    <button onclick="sendCompletion('${lead.id}')" 
            class="btn-action" title="Invio Completamento">
      📧
    </button>
    
    <!-- 1. Firma Manuale -->
    <button onclick="manualSign('${lead.id}')" 
            class="btn-action" title="Firma Manuale Contratto">
      🖊️
    </button>
    
    <!-- 2. Invio Proforma -->
    <button onclick="sendProforma('${lead.id}')" 
            class="btn-action" title="Invia Proforma">
      💰
    </button>
    
    <!-- 3. Pagamento Manuale -->
    <button onclick="manualPayment('${lead.id}')" 
            class="btn-action" title="Conferma Pagamento">
      ✅
    </button>
    
    <!-- 4. Invio Form Configurazione -->
    <button onclick="sendConfiguration('${lead.id}')" 
            class="btn-action" title="Invia Form Configurazione">
      ⚙️
    </button>
  </div>
</td>

<style>
.btn-action {
  font-size: 1.2rem;
  cursor: pointer;
  border: none;
  background: transparent;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}
.btn-action:hover {
  background: #f3f4f6;
}
</style>

<script>
async function manualSign(leadId) {
  if (!confirm('Confermi firma manuale contratto per questo lead?')) return;
  const res = await fetch(`/api/leads/${leadId}/manual-sign`, { method: 'POST' });
  const data = await res.json();
  alert(data.message);
  location.reload();
}

async function sendProforma(leadId) {
  if (!confirm('Inviare proforma a questo lead?')) return;
  const res = await fetch(`/api/leads/${leadId}/send-proforma`, { method: 'POST' });
  const data = await res.json();
  alert(data.message);
  location.reload();
}

async function manualPayment(leadId) {
  if (!confirm('Confermi pagamento manuale ricevuto?')) return;
  const res = await fetch(`/api/leads/${leadId}/manual-payment`, { method: 'POST' });
  const data = await res.json();
  alert(data.message);
  location.reload();
}

async function sendConfiguration(leadId) {
  if (!confirm('Inviare form configurazione a questo lead?')) return;
  const res = await fetch(`/api/leads/${leadId}/send-configuration`, { method: 'POST' });
  const data = await res.json();
  alert(data.message);
  location.reload();
}
</script>
```

---

## 📝 ENDPOINTS DA CREARE

### 1. POST /api/leads/:id/manual-sign
### 2. POST /api/leads/:id/send-proforma
### 3. POST /api/leads/:id/manual-payment (🔥 **CHIAMA inviaEmailBenvenuto**)
### 4. POST /api/leads/:id/send-configuration
### 5. POST /api/webhooks/stripe (pagamento automatico)

---

## 🧪 TEST FLUSSO COMPLETO DOMANI SERA

### Scenario 1: Flusso Automatico
1. ✅ Lead importato IRBEMA
2. ✅ Email "Completa dati" ricevuta
3. ✅ Lead compila form
4. ✅ Email contratto automatica
5. ✅ Lead firma contratto
6. ✅ Email conferma firma + Email proforma
7. 🔄 Lead paga con Stripe
8. 🆕 **Email form configurazione automatica** (DA IMPLEMENTARE)
9. 🔄 Lead compila form configurazione
10. ✅ Attivazione servizio

### Scenario 2: Flusso Manuale (con 4 bottoni)
1. ✅ Lead esistente in dashboard
2. 🆕 Click "🖊️ Firma Manuale" → Contratto firmato staff
3. 🆕 Click "💰 Invia Proforma" → Email proforma inviata
4. 🆕 Click "✅ Pagamento OK" → **Email form config automatica**
5. 🆕 Click "⚙️ Form Config" → Reinvia email (se necessario)

---

## ⚠️ NOTE IMPORTANTI

### 🚫 NON FARE PIÙ:
- ❌ **MAI inviare email autonomamente ai lead reali**
- ❌ Solo l'utente decide quando inviare email
- ✅ Tutti gli invii devono essere espliciti (bottone o trigger dopo azione utente)

### ✅ REGOLE:
1. Email automatiche **solo** dopo azioni del lead (firma, pagamento)
2. Email manuali **solo** con bottoni dashboard
3. **Nessuna email** inviata da codice senza autorizzazione

---

## 📂 FILE MODIFICATI OGGI

- ✅ `public/firma-contratto.html` - Bottone chiudi
- ✅ `src/modules/workflow-email-manager.ts` - Template proforma + no tempi attivazione
- ✅ `public/pagamento.html` - Nuova pagina pagamento Stripe
- ✅ `public/assets/brochures/brochure-ecura.pdf` - Brochure aggiornata
- ✅ `public/brochures/Brochure_eCura.pdf` - Brochure aggiornata

---

## 🎯 PRIORITÀ DOMANI

1. 🔥 **ALTA**: Implementare 4 bottoni dashboard (2-3 ore)
2. 🔥 **ALTA**: Trigger email form configurazione dopo pagamento (1 ora)
3. 🔥 **ALTA**: Test flusso completo end-to-end (1 ora)
4. 📝 **MEDIA**: Webhook Stripe per pagamento automatico (opzionale)

---

## 🚀 DEPLOY

**Repository**: https://github.com/RobertoPoggi/telemedcare-v12  
**Live**: https://telemedcare-v12.pages.dev  
**Ultimo commit**: `97f80b1` - fix: Rimossa riga 'attivato entro 24 ore'

---

**Buona notte! 🌙**
