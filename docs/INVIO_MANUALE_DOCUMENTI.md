# INVIO MANUALE DOCUMENTI - TeleMedCare V12.0

## 📄 IMPLEMENTAZIONE COMPLETA

### ✅ FUNZIONALITÀ IMPLEMENTATE

#### 1. **Backend API Endpoints** ✅

##### **Invio Contratto da Lead**
- **Endpoint**: `POST /api/leads/:id/send-contract`
- **Parametri**: `{ tipoContratto: 'BASE' | 'AVANZATO' }`
- **Funzionalità**:
  - Genera contratto automatico dal lead
  - Crea codice contratto: `CTR-MANUAL-{timestamp}`
  - Determina prezzo: BASE €480, AVANZATO €840
  - Invia email con **template email_invio_contratto**
  - Aggiorna status lead → `CONTRACT_SENT`
  - Aggiorna status contratto → `SENT`
  - Registra log in `email_logs`
  - Se email fallisce, elimina contratto (rollback)

**Esempio Request**:
```bash
curl -X POST https://telemedcare-v12.pages.dev/api/leads/LEAD-001/send-contract \
  -H "Content-Type: application/json" \
  -d '{"tipoContratto": "BASE"}'
```

**Response Success**:
```json
{
  "success": true,
  "message": "Contratto CTR-MANUAL-1703600000000 generato e inviato a cliente@example.com",
  "contractId": "contract-1703600000000",
  "contractCode": "CTR-MANUAL-1703600000000"
}
```

---

##### **Invio Brochure a Lead**
- **Endpoint**: `POST /api/leads/:id/send-brochure`
- **Parametri**: nessuno
- **Funzionalità**:
  - Recupera dati lead
  - Invia email con **template email_invio_brochure**
  - Aggiorna lead: `vuoleBrochure = 'Si'`
  - Se status = `NEW`, aggiorna a `BROCHURE_SENT`
  - Registra log in `email_logs`

**Esempio Request**:
```bash
curl -X POST https://telemedcare-v12.pages.dev/api/leads/LEAD-001/send-brochure \
  -H "Content-Type: application/json"
```

**Response Success**:
```json
{
  "success": true,
  "message": "Brochure inviata a cliente@example.com",
  "emailStatus": { "success": true, "provider": "RESEND" }
}
```

---

#### 2. **Frontend JavaScript Functions** ✅

File: `/public/crud-functions.js`

##### **sendContractToLead(leadId, tipoContratto)**
```javascript
async function sendContractToLead(leadId, tipoContratto = 'BASE') {
    if (!confirm(`Generare e inviare contratto ${tipoContratto} al lead?`)) {
        return null;
    }
    
    try {
        const response = await fetch(`/api/leads/${leadId}/send-contract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipoContratto })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Contratto inviato con successo!\n\nCodice: ${result.contractCode}\nEmail: ${result.email}\n\nTemplate usato: email_invio_contratto`);
            return result;
        } else {
            alert('❌ Errore: ' + result.error);
            return null;
        }
    } catch (error) {
        alert('❌ Errore di comunicazione: ' + error.message);
        return null;
    }
}
```

##### **sendBrochureToLead(leadId)**
```javascript
async function sendBrochureToLead(leadId) {
    if (!confirm('Inviare brochure al lead?')) {
        return null;
    }
    
    try {
        const response = await fetch(`/api/leads/${leadId}/send-brochure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Brochure inviata con successo!\n\nEmail: ${result.email}\n\nTemplate usato: email_invio_brochure`);
            return result;
        } else {
            alert('❌ Errore: ' + result.error);
            return null;
        }
    } catch (error) {
        alert('❌ Errore di comunicazione: ' + error.message);
        return null;
    }
}
```

---

#### 3. **Dashboard UI Integration** ✅

**Dashboard Leads** (`/admin/leads-dashboard`)

##### **Tabella Lead con Colonna Azioni**

Header tabella aggiornato:
```html
<th>Lead ID</th>
<th>Cliente</th>
<th>Telefono</th>
<th>Servizio</th>
<th>Piano</th>
<th>Prezzo Anno</th>
<th>Contratto</th>
<th>Brochure</th>
<th>Data</th>
<th>Azioni</th> <!-- NUOVA COLONNA -->
```

##### **Pulsanti per ogni Lead**
```html
<td class="py-3">
    <div class="flex space-x-1">
        <!-- Pulsante Contratto -->
        <button 
            onclick="sendContract('${lead.id}', '${piano}')" 
            class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            title="Invia Contratto ${piano}">
            <i class="fas fa-file-contract"></i>
        </button>
        
        <!-- Pulsante Brochure -->
        <button 
            onclick="sendBrochure('${lead.id}')" 
            class="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
            title="Invia Brochure">
            <i class="fas fa-book"></i>
        </button>
    </div>
</td>
```

##### **Funzioni JavaScript Integrate**
```javascript
async function sendContract(leadId, piano) {
    if (!confirm(`Generare e inviare contratto ${piano} al lead?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/leads/${leadId}/send-contract`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipoContratto: piano })
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Contratto inviato con successo!\n\nCodice: ${result.contractCode}\nTemplate: email_invio_contratto`);
            loadLeadsData(); // Ricarica i dati
        } else {
            alert('❌ Errore: ' + result.error);
        }
    } catch (error) {
        alert('❌ Errore di comunicazione: ' + error.message);
    }
}

async function sendBrochure(leadId) {
    if (!confirm('Inviare brochure al lead?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/leads/${leadId}/send-brochure`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Brochure inviata con successo!\nTemplate: email_invio_brochure`);
            loadLeadsData(); // Ricarica i dati
        } else {
            alert('❌ Errore: ' + result.error);
        }
    } catch (error) {
        alert('❌ Errore di comunicazione: ' + error.message);
    }
}
```

---

## 🎯 COME USARE

### **Dalla Dashboard Web**
1. Vai su: `https://telemedcare-v12.pages.dev/admin/leads-dashboard`
2. Nella tabella "Tutti i Lead", vedrai una colonna **Azioni**
3. Clicca su:
   - **📄 Icona blu** → Invia contratto BASE o AVANZATO
   - **📚 Icona verde** → Invia brochure

### **Via API Diretta**
```bash
# Invia contratto BASE
curl -X POST https://telemedcare-v12.pages.dev/api/leads/LEAD-EXCEL-001/send-contract \
  -H "Content-Type: application/json" \
  -d '{"tipoContratto": "BASE"}'

# Invia contratto AVANZATO
curl -X POST https://telemedcare-v12.pages.dev/api/leads/LEAD-EXCEL-001/send-contract \
  -H "Content-Type: application/json" \
  -d '{"tipoContratto": "AVANZATO"}'

# Invia brochure
curl -X POST https://telemedcare-v12.pages.dev/api/leads/LEAD-EXCEL-001/send-brochure \
  -H "Content-Type: application/json"
```

---

## 🔐 SICUREZZA

### **Validazioni**
- ✅ Lead deve esistere (404 se non trovato)
- ✅ Database deve essere configurato
- ✅ Email deve essere valida
- ✅ Rollback automatico se email fallisce

### **Template Email Usati**
- **Contratto**: `email_invio_contratto`
- **Brochure**: `email_invio_brochure`

### **Log Tracciamento**
Ogni invio viene registrato in:
- **Tabella**: `email_logs`
- **Campi**: leadId, contract_id, recipient_email, template_used, status, provider_used, sent_at

---

## 📊 STATISTICHE

### **Backend**
- **2 nuovi endpoint API** (send-contract, send-brochure)
- **Template email integrati** (email_invio_contratto, email_invio_brochure)
- **Gestione transazionale** (rollback se email fallisce)
- **Log completi** in email_logs

### **Frontend**
- **2 funzioni JS** in crud-functions.js
- **2 funzioni inline** in dashboard-templates.ts
- **Pulsanti UI** per ogni lead
- **Conferme utente** prima dell'invio
- **Alert informativi** con feedback dettagliato

---

## ✅ STATO IMPLEMENTAZIONE

| Componente | Stato | Note |
|-----------|--------|------|
| **Backend API** | ✅ 100% | Endpoint completi e testati |
| **Frontend JS** | ✅ 100% | Funzioni pronte all'uso |
| **Dashboard UI** | ✅ 100% | Pulsanti integrati |
| **Template Email** | ✅ 100% | Template esistenti utilizzati |
| **Validazione** | ✅ 100% | Controlli completi |
| **Log/Tracking** | ✅ 100% | Registrazione in DB |
| **Documentazione** | ✅ 100% | Questo file |

---

## 🎉 RISULTATO FINALE

**TeleMedCare V12.0** ora supporta **invio manuale forzato** di:
1. ✅ **Contratti** (BASE o AVANZATO)
2. ✅ **Brochure**

Con:
- ✅ **Template email** già usati per l'invio automatico
- ✅ **Pulsanti UI** nella dashboard leads
- ✅ **API dirette** per integrazioni esterne
- ✅ **Tracciamento completo** in database
- ✅ **Rollback automatico** in caso di errore

---

**Aggiornato**: 2024-12-26  
**Versione**: TeleMedCare V12.0  
**URL**: https://telemedcare-v12.pages.dev/
