# 🔧 MODIFICHE DASHBOARD - Implementazione Immediata

## 📍 MODIFICHE DA APPLICARE

### **1. DASHBOARD OPERATIVA** (Riga ~450)

#### **A) Nessuna modifica ai conteggi iniziali** ✅
I conteggi (126, 8) sono già corretti perché vengono caricati dinamicamente dall'API.

#### **B) Aggiungere Grafico "Distribuzione per Canale"**

**POSIZIONE**: Dopo il grafico "Distribuzione per Piano" (circa riga 550-600)

**CODICE DA AGGIUNGERE**:
```html
<!-- Distribuzione per Canale -->
<div class="bg-white rounded-xl shadow-lg p-6">
    <h3 class="text-lg font-semibold mb-4 flex items-center">
        <i class="fas fa-chart-bar mr-2 text-green-600"></i>
        Distribuzione per Canale
    </h3>
    <canvas id="channelsChart"></canvas>
    
    <!-- Pulsanti Import API -->
    <div class="mt-4 grid grid-cols-2 gap-2">
        <button onclick="importFromExcel()" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm">
            <i class="fas fa-file-excel mr-2"></i> Import Excel
        </button>
        <button onclick="importFromIrbema()" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm">
            <i class="fas fa-building mr-2"></i> Import Irbema
        </button>
        <button onclick="importFromAON()" class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm">
            <i class="fas fa-shield-alt mr-2"></i> Import AON
        </button>
        <button onclick="importFromDoubleYou()" class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm">
            <i class="fas fa-network-wired mr-2"></i> Import DoubleYou
        </button>
    </div>
</div>
```

**JAVASCRIPT DA AGGIUNGERE** (nello script, dopo updatePlansChart):
```javascript
// Grafico Distribuzione Canali
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
    if (!ctx) return
    
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
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    })
}

// Funzioni Import API (stub)
function importFromExcel() {
    alert('🔄 Import da Excel\n\nFunzionalità in sviluppo.\n\nEndpoint: POST /api/import/excel')
}

function importFromIrbema() {
    alert('🔄 Import da Irbema\n\nFunzionalità in sviluppo.\n\nEndpoint: POST /api/import/irbema')
}

function importFromAON() {
    alert('🔄 Import da AON\n\nFunzionalità in sviluppo.\n\nEndpoint: POST /api/import/aon')
}

function importFromDoubleYou() {
    alert('🔄 Import da DoubleYou\n\nFunzionalità in sviluppo.\n\nEndpoint: POST /api/import/doubleyou')
}
```

**CHIAMATA AL GRAFICO** (aggiungere in loadDashboardData dopo updatePlansChart):
```javascript
updateChannelsChart(allLeads)
```

---

### **2. DASHBOARD LEADS** (Riga ~950)

#### **A) Conteggi già corretti** ✅
I conteggi vengono caricati dall'API, quindi 8 contratti e 5.56% saranno automatici quando l'endpoint setup-real-contracts verrà eseguito.

#### **B) Aggiungere colonna "Azioni CRUD"**

**MODIFICA HEADER TABELLA** (circa riga 1050):
```html
<!-- PRIMA (header esistente) -->
<th class="px-6 py-3">Azioni</th>

<!-- DOPO (aggiungere colonna extra) -->
<th class="px-6 py-3">Invio Documenti</th>
<th class="px-6 py-3">CRUD</th>
```

**MODIFICA BODY TABELLA** (nella funzione renderLeadsTable):
```javascript
// PRIMA (pulsanti esistenti)
<td class="px-6 py-4">
    <button onclick="sendContractToLead('${lead.id}', 'BASE')" ...>
    <button onclick="sendBrochureToLead('${lead.id}')" ...>
</td>

// DOPO (aggiungere nuova colonna)
<td class="px-6 py-4">
    <button onclick="sendContractToLead('${lead.id}', 'BASE')" ...>
    <button onclick="sendBrochureToLead('${lead.id}')" ...>
</td>
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

**MODALI CRUD** (aggiungere prima del </body>):
```html
<!-- View Lead Modal -->
<div id="viewLeadModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">Dettagli Lead</h3>
            <button onclick="closeModal('viewLeadModal')" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times text-2xl"></i>
            </button>
        </div>
        <div id="viewLeadContent" class="space-y-3"></div>
    </div>
</div>

<!-- Edit Lead Modal -->
<div id="editLeadModal" class="fixed inset-0 bg-black bg-opacity-50 hidden flex items-center justify-center z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-6">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">Modifica Lead</h3>
            <button onclick="closeModal('editLeadModal')" class="text-gray-500 hover:text-gray-700">
                <i class="fas fa-times text-2xl"></i>
            </button>
        </div>
        <form id="editLeadForm" class="space-y-4">
            <input type="hidden" id="editLeadId">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Nome</label>
                    <input type="text" id="editNome" required class="w-full border rounded px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Cognome</label>
                    <input type="text" id="editCognome" required class="w-full border rounded px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input type="email" id="editEmail" required class="w-full border rounded px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Telefono</label>
                    <input type="tel" id="editTelefono" required class="w-full border rounded px-3 py-2">
                </div>
            </div>
            <div class="flex justify-end gap-2 mt-6">
                <button type="button" onclick="closeModal('editLeadModal')" 
                        class="px-4 py-2 border rounded hover:bg-gray-50">
                    Annulla
                </button>
                <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Salva Modifiche
                </button>
            </div>
        </form>
    </div>
</div>
```

**JAVASCRIPT CRUD** (aggiungere nello script):
```javascript
async function viewLead(leadId) {
    const lead = await fetch(`/api/leads/${leadId}`).then(r => r.json())
    if (lead.success && lead.lead) {
        const l = lead.lead
        document.getElementById('viewLeadContent').innerHTML = `
            <div class="grid grid-cols-2 gap-3 text-sm">
                <div><strong>ID:</strong> ${l.id}</div>
                <div><strong>Nome:</strong> ${l.nomeRichiedente} ${l.cognomeRichiedente}</div>
                <div><strong>Email:</strong> ${l.email}</div>
                <div><strong>Telefono:</strong> ${l.telefono}</div>
                <div><strong>Servizio:</strong> ${l.tipoServizio || 'N/A'}</div>
                <div><strong>Dispositivo:</strong> ${l.dispositivo || 'N/A'}</div>
                <div><strong>Piano:</strong> ${l.note?.includes('AVANZATO') ? 'AVANZATO' : 'BASE'}</div>
                <div><strong>Canale:</strong> ${l.canaleAcquisizione || 'N/A'}</div>
                <div><strong>Status:</strong> ${l.status}</div>
                <div><strong>Data:</strong> ${new Date(l.created_at).toLocaleDateString('it-IT')}</div>
            </div>
        `
        openModal('viewLeadModal')
    } else {
        alert('❌ Errore: lead non trovato')
    }
}

async function editLead(leadId) {
    const lead = await fetch(`/api/leads/${leadId}`).then(r => r.json())
    if (lead.success && lead.lead) {
        const l = lead.lead
        document.getElementById('editLeadId').value = l.id
        document.getElementById('editNome').value = l.nomeRichiedente
        document.getElementById('editCognome').value = l.cognomeRichiedente
        document.getElementById('editEmail').value = l.email
        document.getElementById('editTelefono').value = l.telefono
        openModal('editLeadModal')
    }
}

document.getElementById('editLeadForm')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const leadId = document.getElementById('editLeadId').value
    const data = {
        nomeRichiedente: document.getElementById('editNome').value,
        cognomeRichiedente: document.getElementById('editCognome').value,
        email: document.getElementById('editEmail').value,
        telefono: document.getElementById('editTelefono').value
    }
    
    const result = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json())
    
    if (result.success) {
        alert('✅ Lead aggiornato!')
        closeModal('editLeadModal')
        location.reload()
    } else {
        alert('❌ Errore: ' + result.error)
    }
})

async function deleteLead(leadId) {
    if (!confirm('Sei sicuro di voler eliminare questo lead?')) return
    
    const result = await fetch(`/api/leads/${leadId}`, { method: 'DELETE' }).then(r => r.json())
    
    if (result.success) {
        alert('✅ Lead eliminato!')
        location.reload()
    } else {
        alert('❌ ' + (result.hasContracts ? 'Impossibile eliminare: lead ha contratti associati' : 'Errore: ' + result.error))
    }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden')
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden')
}
```

---

### **3. DATA DASHBOARD** (Riga ~1400)

#### **A) Revenue già corretta** ✅
La revenue viene calcolata dall'API sommando i contratti.

#### **B) Aggiungere sezione "Gestione Contratti"**

**HTML** (aggiungere dopo la tabella lead esistente):
```html
<!-- Gestione Contratti -->
<div class="bg-white rounded-xl shadow-lg p-6 mt-6">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold flex items-center">
            <i class="fas fa-file-contract text-blue-600 mr-2"></i>
            Gestione Contratti
        </h3>
    </div>
    
    <div class="overflow-x-auto">
        <table class="w-full">
            <thead>
                <tr class="border-b-2 border-gray-200">
                    <th class="text-left pb-3 text-sm font-semibold">Codice</th>
                    <th class="text-left pb-3 text-sm font-semibold">Cliente</th>
                    <th class="text-left pb-3 text-sm font-semibold">Piano</th>
                    <th class="text-left pb-3 text-sm font-semibold">Prezzo</th>
                    <th class="text-left pb-3 text-sm font-semibold">Stato</th>
                    <th class="text-left pb-3 text-sm font-semibold">Data</th>
                    <th class="text-left pb-3 text-sm font-semibold">PDF</th>
                    <th class="text-left pb-3 text-sm font-semibold">Azioni</th>
                </tr>
            </thead>
            <tbody id="contractsTableBody">
                <tr>
                    <td colspan="8" class="py-4 text-center text-gray-400">
                        Caricamento contratti...
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

**JAVASCRIPT** (aggiungere nello script):
```javascript
async function loadContracts() {
    try {
        const response = await fetch('/api/contratti')
        const data = await response.json()
        const contracts = data.contracts || []
        
        renderContractsTable(contracts)
    } catch (error) {
        console.error('Errore caricamento contratti:', error)
    }
}

function renderContractsTable(contracts) {
    const tbody = document.getElementById('contractsTableBody')
    if (!tbody) return
    
    if (contracts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="py-4 text-center text-gray-400">Nessun contratto trovato</td></tr>'
        return
    }
    
    tbody.innerHTML = contracts.map(c => `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
            <td class="py-3 text-sm">
                <code class="bg-gray-100 px-2 py-1 rounded text-xs">${c.codice_contratto}</code>
            </td>
            <td class="py-3 text-sm">
                ${c.nomeRichiedente || ''} ${c.cognomeRichiedente || ''}
            </td>
            <td class="py-3">
                <span class="px-2 py-1 ${c.tipo_contratto === 'AVANZATO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'} rounded text-xs font-medium">
                    ${c.tipo_contratto}
                </span>
            </td>
            <td class="py-3 text-sm font-semibold">
                \u20AC${c.prezzo_totale}
            </td>
            <td class="py-3">
                <span class="px-2 py-1 ${
                    c.status === 'SIGNED' ? 'bg-green-100 text-green-700' :
                    c.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                } rounded text-xs font-medium">
                    ${c.status}
                </span>
            </td>
            <td class="py-3 text-xs text-gray-600">
                ${c.data_invio ? new Date(c.data_invio).toLocaleDateString('it-IT') : '-'}
            </td>
            <td class="py-3">
                ${c.pdf_url ? `
                    <button onclick="viewContractPDF('${c.pdf_url}')" 
                            class="text-red-600 hover:text-red-800"
                            title="Visualizza PDF">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                ` : '-'}
            </td>
            <td class="py-3">
                <div class="flex gap-2">
                    <button onclick="viewContract('${c.id}')" 
                            class="text-blue-600 hover:text-blue-800" 
                            title="Visualizza">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editContract('${c.id}')" 
                            class="text-green-600 hover:text-green-800" 
                            title="Modifica">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${c.status !== 'SIGNED' ? `
                        <button onclick="deleteContract('${c.id}')" 
                                class="text-red-600 hover:text-red-800" 
                                title="Elimina">
                            <i class="fas fa-trash"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('')
}

function viewContractPDF(pdfUrl) {
    if (!pdfUrl) {
        alert('❌ PDF non disponibile')
        return
    }
    window.open(pdfUrl, '_blank')
}

async function viewContract(contractId) {
    alert('🔄 Visualizza contratto: ' + contractId + '\n\nFunzionalità completa in sviluppo.')
}

async function editContract(contractId) {
    alert('🔄 Modifica contratto: ' + contractId + '\n\nFunzionalità completa in sviluppo.')
}

async function deleteContract(contractId) {
    if (!confirm('Sei sicuro di voler eliminare questo contratto?')) return
    
    const result = await fetch(`/api/contratti/${contractId}`, { method: 'DELETE' }).then(r => r.json())
    
    if (result.success) {
        alert('✅ Contratto eliminato!')
        loadContracts()
    } else {
        alert('❌ ' + (result.isSigned ? 'Impossibile eliminare contratto firmato' : 'Errore: ' + result.error))
    }
}

// Chiamare loadContracts() all'avvio
loadContracts()
```

---

## ✅ RIEPILOGO MODIFICHE

### **Dashboard Operativa**
- ✅ Grafico "Distribuzione per Canale"
- ✅ 4 pulsanti Import API (stub)
- ✅ Funzione updateChannelsChart()

### **Dashboard Leads**
- ✅ Colonna "CRUD" con 3 pulsanti (view, edit, delete)
- ✅ 2 modali (View Lead, Edit Lead)
- ✅ JavaScript CRUD completo

### **Data Dashboard**
- ✅ Sezione "Gestione Contratti" con tabella
- ✅ Colonna "PDF" con visualizzatore
- ✅ Colonna "Azioni CRUD" (view, edit, delete)
- ✅ JavaScript load e render contratti

---

**File**: MODIFICHE_DASHBOARD_IMPLEMENTAZIONE.md  
**Prossimo step**: Applicare queste modifiche al file `src/modules/dashboard-templates.ts`
