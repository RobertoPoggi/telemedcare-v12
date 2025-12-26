# INTEGRAZIONE HUBSPOT FORM → SISTEMA ECURA

## 🎯 OPZIONE 1: HubSpot Form (CONSIGLIATA)

### STEP 1: Configurare Form su Landing Page ecura.it

Inserisci questo codice nella tua Landing Page ecura.it:

```html
<!-- HubSpot Form Embed -->
<div id="hubspot-form-ecura"></div>
<script charset="utf-8" type="text/javascript" src="//js.hsforms.net/forms/embed/v2.js"></script>
<script>
  hbspt.forms.create({
    region: "eu1", // o "na1" se account USA
    portalId: "TUO_PORTAL_ID", // Sostituire con Portal ID HubSpot
    formId: "TUO_FORM_ID", // Sostituire con Form ID creato su HubSpot
    target: "#hubspot-form-ecura",
    onFormSubmit: function($form) {
      console.log('Lead inviato a HubSpot');
    }
  });
</script>
```

### STEP 2: Creare Workflow HubSpot

1. **HubSpot → Automations → Workflows → Create workflow**
2. **Trigger**: "Form submission" → Seleziona il form eCura
3. **Action**: "Send webhook" → Configura così:

**Webhook URL:**
```
https://telemedcare-v11.TUODOMINIO.workers.dev/api/webhooks/hubspot
```

**Method:** POST

**Webhook payload (JSON):**
```json
{
  "nome": "{{contact.firstname}}",
  "cognome": "{{contact.lastname}}",
  "email": "{{contact.email}}",
  "telefono": "{{contact.phone}}",
  "servizio": "{{contact.servizio_ecura}}",
  "pacchetto": "{{contact.pacchetto_ecura}}",
  "vuoleContratto": "{{contact.vuole_contratto}}",
  "vuoleBrochure": "{{contact.vuole_brochure}}",
  "eta": "{{contact.eta_assistito}}",
  "message": "{{contact.message}}"
}
```

### STEP 3: Mappare Campi Custom HubSpot

Crea questi campi custom in HubSpot → Settings → Properties:

| Campo HubSpot | Tipo | Valori |
|---------------|------|--------|
| `servizio_ecura` | Dropdown | FAMILY, PRO, PREMIUM |
| `pacchetto_ecura` | Dropdown | BASE, AVANZATO |
| `vuole_contratto` | Checkbox | true/false |
| `vuole_brochure` | Checkbox | true/false |
| `eta_assistito` | Number | 0-120 |

### STEP 4: Test Integration

Vai su HubSpot → Forms → Testa il form → Verifica su:
- HubSpot Contacts: Lead creato ✅
- HubSpot Workflow History: Webhook inviato ✅
- Sistema eCura Logs: Lead processato ✅

---

## 🎯 OPZIONE 2: Direct API Call (SEMPLICE E VELOCE)

Se vuoi evitare HubSpot, puoi inviare direttamente al backend eCura.

### STEP 1: Form HTML su Landing Page ecura.it

```html
<!-- Form diretto eCura -->
<form id="ecura-form" onsubmit="return inviaLead(event)">
  <input type="text" name="nome" placeholder="Nome" required>
  <input type="text" name="cognome" placeholder="Cognome" required>
  <input type="email" name="email" placeholder="Email" required>
  <input type="tel" name="telefono" placeholder="Telefono" required>
  
  <select name="servizio" required>
    <option value="">Seleziona Servizio</option>
    <option value="FAMILY">FAMILY - Protezione Base</option>
    <option value="PRO">PRO - Assistenza Professionale</option>
    <option value="PREMIUM">PREMIUM - Monitoraggio Avanzato</option>
  </select>
  
  <select name="pacchetto" required>
    <option value="">Seleziona Piano</option>
    <option value="BASE">BASE</option>
    <option value="AVANZATO">AVANZATO</option>
  </select>
  
  <label>
    <input type="checkbox" name="vuoleContratto" value="on">
    Voglio ricevere il contratto via email
  </label>
  
  <label>
    <input type="checkbox" name="vuoleBrochure" value="on">
    Voglio ricevere la brochure informativa
  </label>
  
  <input type="number" name="eta" placeholder="Età assistito" min="0" max="120">
  
  <button type="submit">Richiedi Informazioni</button>
</form>

<script>
async function inviaLead(event) {
  event.preventDefault();
  
  const form = document.getElementById('ecura-form');
  const formData = new FormData(form);
  
  // Converti FormData a JSON
  const data = {
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
  
  try {
    const response = await fetch('https://telemedcare-v11.TUODOMINIO.workers.dev/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      alert('✅ Richiesta inviata con successo! Controlla la tua email.');
      form.reset();
    } else {
      alert('❌ Errore: ' + result.error);
    }
  } catch (error) {
    console.error('Errore invio:', error);
    alert('❌ Errore di connessione. Riprova.');
  }
}
</script>
```

### STEP 2: Verifica Endpoint API

Il tuo sistema eCura ha già l'endpoint `/api/lead` configurato:

**URL:** `POST https://telemedcare-v11.TUODOMINIO.workers.dev/api/lead`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nome": "Mario",
  "cognome": "Rossi",
  "email": "mario.rossi@example.com",
  "telefono": "335 123 4567",
  "servizio": "PRO",
  "pacchetto": "AVANZATO",
  "vuoleContratto": true,
  "vuoleBrochure": true,
  "eta": 75
}
```

**Response:**
```json
{
  "success": true,
  "leadId": "LEAD_2025-12-21T...",
  "message": "Lead processato: contratto generato e inviato",
  "email_sent": true
}
```

---

## 🎯 OPZIONE 3: Webhook Proxy (AVANZATA)

Se vuoi più controllo, crea un webhook proxy sulla tua infrastruttura.

### STEP 1: API Proxy su ecura.it

Crea un endpoint sul tuo server ecura.it:

```javascript
// api/lead-proxy.js (Node.js/Express example)
app.post('/api/lead-proxy', async (req, res) => {
  try {
    // Valida dati
    const { nome, cognome, email, telefono, servizio, pacchetto } = req.body;
    
    // Invia a sistema eCura
    const response = await fetch('https://telemedcare-v11.TUODOMINIO.workers.dev/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.ECURA_API_KEY // Opzionale per sicurezza
      },
      body: JSON.stringify(req.body)
    });
    
    const result = await response.json();
    res.json(result);
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### STEP 2: Form chiama Proxy

```javascript
fetch('https://ecura.it/api/lead-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData)
});
```

---

## 🧪 TEST WORKFLOW COMPLETO

### Test Manuale con cURL

```bash
# Test endpoint /api/lead
curl -X POST https://telemedcare-v11.TUODOMINIO.workers.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test",
    "cognome": "Cliente",
    "email": "test@example.com",
    "telefono": "335 123 4567",
    "servizio": "PRO",
    "pacchetto": "AVANZATO",
    "vuoleContratto": true,
    "vuoleBrochure": true,
    "eta": 70
  }'
```

### Test con Postman

1. **Method:** POST
2. **URL:** `https://telemedcare-v11.TUODOMINIO.workers.dev/api/lead`
3. **Headers:** `Content-Type: application/json`
4. **Body (raw JSON):** Copia il JSON sopra
5. **Send** → Verifica response con `leadId`

### Verifica Email

Dopo il test, dovresti ricevere:
1. ✅ Email con documenti informativi
2. ✅ Email con contratto PDF allegato
3. ✅ Email con brochure PDF allegata (se richiesta)

---

## 📊 RIEPILOGO INTEGRAZIONE

| Metodo | Difficoltà | Vantaggi | Svantaggi |
|--------|-----------|----------|-----------|
| **HubSpot Form** | Media | CRM integrato, analytics | Dipendenza HubSpot |
| **Direct API** | Bassa | Semplice, veloce | No CRM automatico |
| **Webhook Proxy** | Alta | Massimo controllo | Più complessità |

---

## 🚀 RACCOMANDAZIONE

**Per lancio rapido:** Usa **OPZIONE 2 (Direct API)**
**Per integrazione NUR professionale:** Usa **OPZIONE 1 (HubSpot)**

---

## ✅ PROSSIMI STEP

1. Scegli metodo di integrazione
2. Configura form su ecura.it
3. Testa con dati reali
4. Verifica workflow completo (email, contratto, brochure)
5. Deploy in produzione

---

**Hai bisogno di aiuto per configurare uno di questi metodi?** Dimmi quale opzione preferisci e ti guido passo-passo! 🚀
