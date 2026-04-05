# 🚀 TeleMedCare V12 - Piano Correzioni Dashboard

## 📊 DATI CORRETTI (Aggiornati con 8 contratti reali)

### **Lead Totali**
- 126 lead esistenti
- \+ 8 nuovi lead dai contratti
- **= 134 lead totali**

### **Contratti**
- ❌ PRIMA: 4 contratti
- ✅ ORA: 8 contratti
- 3 SIGNED (firmati): Gianni Paolo Pizzutto, Pennacchio Rita, Eileen King
- 1 SENT (inviato): Manuela Poggi
- 4 DRAFT (bozza): Paolo Magri, Elena Saglia, Simona Pizzutto, Caterina D'Alterio

### **Revenue**
- ❌ PRIMA: €1,920
- ✅ ORA (totale): €4,560/anno
- ✅ ORA (solo firmati): €1,800/anno

### **Conversione**
- ❌ PRIMA: 3.17% (4/126)
- ✅ ORA: 5.97% (8/134)

### **Distribuzione Piano**
- BASE: 131 lead (6 nuovi) = €480/anno
- AVANZATO: 3 lead (2 nuovi) = €840/anno

### **Distribuzione Canale** 🆕
- Excel: 2 contratti (Paolo Magri, Gianni Paolo Pizzutto)
- Irbema: 2 contratti (Elena Saglia, Manuela Poggi)
- AON: 2 contratti (Simona Pizzutto, Pennacchio Rita)
- DoubleYou: 2 contratti (Caterina D'Alterio, Eileen King)
- Altri canali: 126 lead rimanenti

---

## 🎯 CORREZIONI PER DASHBOARD

### **1. DASHBOARD OPERATIVA** (`/dashboard`)

#### **Correzioni Necessarie:**
- ✅ Total Lead: 126 → **134**
- ✅ Contratti inviati: 4 → **8** (o 7 se escludiamo DRAFT)
- ✅ Email inviate: mantenere valore attuale
- ✅ Servizio top: mantenere "eCura PRO"

#### **Nuovo Grafico: Distribuzione per Canale** 🆕
```javascript
// Aggiungere dopo il grafico "Distribuzione per Piano"
<div class="bg-white rounded-xl shadow-lg p-6">
  <h3 class="text-lg font-semibold mb-4 flex items-center">
    <i class="fas fa-chart-bar mr-2 text-blue-600"></i>
    Distribuzione per Canale
  </h3>
  <canvas id="channelsChart"></canvas>
  
  <!-- Pulsanti Import API -->
  <div class="mt-4 grid grid-cols-2 gap-2">
    <button onclick="importFromExcel()" class="btn-excel">
      <i class="fas fa-file-excel mr-2"></i> Import Excel
    </button>
    <button onclick="importFromIrbema()" class="btn-irbema">
      <i class="fas fa-building mr-2"></i> Import Irbema
    </button>
    <button onclick="importFromAON()" class="btn-aon">
      <i class="fas fa-shield-alt mr-2"></i> Import AON
    </button>
    <button onclick="importFromDoubleYou()" class="btn-doubleyou">
      <i class="fas fa-network-wired mr-2"></i> Import DoubleYou
    </button>
  </div>
</div>
```

#### **JavaScript per Grafico Canali:**
```javascript
function updateChannelsChart(leads) {
  const channelCounts = {
    'Excel': 0,
    'Irbema': 0,
    'AON': 0,
    'DoubleYou': 0,
    'Altri': 0
  }
  
  leads.forEach(lead => {
    const channel = lead.canaleAcquisizione || 'Altri'
    if (channelCounts[channel] !== undefined) {
      channelCounts[channel]++
    } else {
      channelCounts['Altri']++
    }
  })
  
  const ctx = document.getElementById('channelsChart')
  if (window.channelsChartInstance) {
    window.channelsChartInstance.destroy()
  }
  
  window.channelsChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(channelCounts),
      datasets: [{
        label: 'Lead per Canale',
        data: Object.values(channelCounts),
        backgroundColor: [
          '#10b981', // Excel - green
          '#3b82f6', // Irbema - blue
          '#f59e0b', // AON - orange
          '#8b5cf6', // DoubleYou - purple
          '#6b7280'  // Altri - gray
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  })
}

// API Import Functions
async function importFromExcel() {
  alert('🔄 Import da Excel - Coming soon!')
  // TODO: Implementare POST /api/import/excel
}

async function importFromIrbema() {
  alert('🔄 Import da Irbema - Coming soon!')
  // TODO: Implementare POST /api/import/irbema
}

async function importFromAON() {
  alert('🔄 Import da AON - Coming soon!')
  // TODO: Implementare POST /api/import/aon
}

async function importFromDoubleYou() {
  alert('🔄 Import da DoubleYou - Coming soon!')
  // TODO: Implementare POST /api/import/doubleyou
}
```

---

### **2. DASHBOARD LEADS** (`/admin/leads-dashboard`)

#### **Correzioni Necessarie:**
- ✅ Total Contracts: 4 → **8**
- ✅ Conversion Rate: ricalcolare con 8/134
- ✅ Tabella: mostrare 134 lead totali

#### **Aggiungere CRUD per ogni riga** 🆕
```html
<!-- Colonna Azioni nella tabella -->
<th class="px-6 py-3">Azioni CRUD</th>

<!-- Per ogni riga -->
<td class="px-6 py-4">
  <div class="flex gap-2">
    <button onclick="viewLead('${lead.id}')" 
            class="text-blue-600 hover:text-blue-800" 
            title="Visualizza">
      <i class="fas fa-eye"></i>
    </button>
    <button onclick="editLead('${lead.id}')" 
            class="text-green-600 hover:text-green-800" 
            title="Modifica">
      <i class="fas fa-edit"></i>
    </button>
    <button onclick="deleteLead('${lead.id}')" 
            class="text-red-600 hover:text-red-800" 
            title="Elimina">
      <i class="fas fa-trash"></i>
    </button>
  </div>
</td>
```

#### **Modale CRUD Lead:**
```html
<!-- View Lead Modal -->
<div id="viewLeadModal" class="modal hidden">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Dettagli Lead</h3>
      <button onclick="closeModal('viewLeadModal')">×</button>
    </div>
    <div class="modal-body" id="viewLeadContent"></div>
  </div>
</div>

<!-- Edit Lead Modal -->
<div id="editLeadModal" class="modal hidden">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Modifica Lead</h3>
      <button onclick="closeModal('editLeadModal')">×</button>
    </div>
    <div class="modal-body">
      <form id="editLeadForm">
        <input type="hidden" id="editLeadId">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Nome</label>
            <input type="text" id="editNome" required>
          </div>
          <div>
            <label>Cognome</label>
            <input type="text" id="editCognome" required>
          </div>
          <div>
            <label>Email</label>
            <input type="email" id="editEmail" required>
          </div>
          <div>
            <label>Telefono</label>
            <input type="tel" id="editTelefono" required>
          </div>
          <div>
            <label>Piano</label>
            <select id="editPiano">
              <option value="BASE">BASE (€480)</option>
              <option value="AVANZATO">AVANZATO (€840)</option>
            </select>
          </div>
          <div>
            <label>Canale</label>
            <select id="editCanale">
              <option value="Excel">Excel</option>
              <option value="Irbema">Irbema</option>
              <option value="AON">AON</option>
              <option value="DoubleYou">DoubleYou</option>
              <option value="Altri">Altri</option>
            </select>
          </div>
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" onclick="closeModal('editLeadModal')" class="btn-secondary">Annulla</button>
          <button type="submit" class="btn-primary">Salva Modifiche</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- Insert Lead Modal -->
<div id="insertLeadModal" class="modal hidden">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Nuovo Lead</h3>
      <button onclick="closeModal('insertLeadModal')">×</button>
    </div>
    <div class="modal-body">
      <form id="insertLeadForm">
        <!-- Same fields as edit -->
      </form>
    </div>
  </div>
</div>
```

---

### **3. DATA DASHBOARD** (`/admin/data-dashboard`)

#### **Correzioni Necessarie:**
- ✅ Revenue: €1,920 → **€4,560** (o €1,800 solo firmati)
- ✅ Contracts Count: 4 → **8**
- ✅ Average Order Value: ricalcolare
- ✅ Tabella Lead: correggere stato brochure (solo 8 lead hanno ricevuto brochure)

#### **Aggiungere CRUD Contratti** 🆕
```html
<!-- Nuova sezione Contratti -->
<div class="bg-white rounded-xl shadow-lg p-6 mt-6">
  <h3 class="text-xl font-bold mb-4">Gestione Contratti</h3>
  <button onclick="openModal('insertContractModal')" class="btn-primary mb-4">
    <i class="fas fa-plus mr-2"></i> Nuovo Contratto
  </button>
  
  <table class="w-full">
    <thead>
      <tr>
        <th>Codice</th>
        <th>Cliente</th>
        <th>Piano</th>
        <th>Prezzo</th>
        <th>Stato</th>
        <th>Data</th>
        <th>PDF</th>
        <th>Azioni</th>
      </tr>
    </thead>
    <tbody id="contractsTableBody"></tbody>
  </table>
</div>
```

#### **Visualizzazione PDF Contratto:**
```javascript
function viewContractPDF(contractId) {
  const contract = contracts.find(c => c.id === contractId)
  if (!contract || !contract.pdf_url) {
    alert('❌ PDF non disponibile')
    return
  }
  
  // Apri PDF in nuova finestra
  window.open(contract.pdf_url, '_blank')
}
```

---

### **4. WORKFLOW MANAGER** (`/admin/workflow-manager`)

#### **Fix Loop Costante** ⚠️
**PROBLEMA**: Il loop è causato da `setInterval(loadWorkflowData, 30000)` che chiama l'API continuamente.

**SOLUZIONE**: Aggiungere mutex come fatto nella Dashboard Operativa
```javascript
let isLoadingWorkflow = false

async function loadWorkflowData() {
  if (isLoadingWorkflow) {
    console.log('⏸️ Caricamento workflow già in corso, skip')
    return
  }
  
  isLoadingWorkflow = true
  
  try {
    const response = await fetch('/api/leads?limit=200')
    const data = await response.json()
    // ... rest of logic
  } catch (error) {
    console.error('Errore:', error)
  } finally {
    isLoadingWorkflow = false
  }
}
```

#### **Aggiungere Azioni per Riga** 🆕
```html
<!-- Per ogni lead nella tabella -->
<td>
  <div class="flex gap-2">
    <button onclick="registerNewLead('${lead.id}')" class="btn-sm btn-green">
      <i class="fas fa-user-plus"></i> Registra
    </button>
    <button onclick="registerSignature('${lead.id}')" class="btn-sm btn-blue">
      <i class="fas fa-signature"></i> Firma
    </button>
    <button onclick="registerPayment('${lead.id}')" class="btn-sm btn-purple">
      <i class="fas fa-credit-card"></i> Pagamento
    </button>
  </div>
</td>
```

#### **Rendere Box Cliccabili** 🆕
```html
<!-- Box KPI cliccabili -->
<div onclick="openArchive('leads')" class="cursor-pointer hover:shadow-xl transition-shadow">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-gray-500 text-sm">Total Leads</p>
      <p id="wf-total-leads" class="text-3xl font-bold">134</p>
    </div>
    <i class="fas fa-users text-blue-600 text-3xl"></i>
  </div>
  <p class="text-xs text-gray-400 mt-2">Clicca per vedere l'archivio completo</p>
</div>

<!-- Repeat for other boxes: contracts, proforma, payments, etc. -->
```

```javascript
function openArchive(type) {
  const urls = {
    'leads': '/admin/leads-dashboard',
    'contracts': '/admin/data-dashboard#contratti',
    'proforma': '/admin/data-dashboard#proforma',
    'payments': '/admin/data-dashboard#pagamenti'
  }
  
  window.location.href = urls[type] || '/'
}
```

---

## 🔧 PRIORITÀ DI IMPLEMENTAZIONE

### **Fase 1: Correzioni Critiche** (30 min)
1. ✅ Fix conteggi (134 lead, 8 contratti, €4,560)
2. ✅ Fix Workflow Manager loop
3. ✅ Aggiungere distribuzione per canale

### **Fase 2: CRUD UI** (45 min)
4. ✅ Dashboard Leads: CRUD completo
5. ✅ Data Dashboard: CRUD contratti + visualizza PDF
6. ✅ Workflow Manager: Azioni per riga + box cliccabili

### **Fase 3: API Import** (15 min)
7. ✅ Stub per API import per canale (Excel, Irbema, AON, DoubleYou)

---

## 📝 FILE DA MODIFICARE

1. `src/modules/dashboard-templates.ts` - Tutte le dashboard
2. `public/crud-functions.js` - Funzioni CRUD già esistenti (da estendere)
3. `src/index.tsx` - Eventuali nuovi endpoint API

---

## ✅ CHECKLIST FINALE

- [ ] Dashboard Operativa: 134 lead, distribuzione canali, pulsanti import
- [ ] Dashboard Leads: 8 contratti, CRUD modals (view, edit, insert, delete)
- [ ] Data Dashboard: €4,560 revenue, CRUD contratti, visualizza PDF
- [ ] Workflow Manager: fix loop, azioni per riga, box cliccabili
- [ ] Build e test
- [ ] Commit e push
- [ ] Deploy su Cloudflare Pages

---

**File**: `PIANO_CORREZIONI_DASHBOARD.md`
**Versione**: TeleMedCare V12.0 Modular Enterprise
**Data**: 26/12/2025
