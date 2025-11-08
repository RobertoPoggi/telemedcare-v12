import { Hono } from 'hono'

const adminDashboardRoute = new Hono()

adminDashboardRoute.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeleMedCare - Dashboard Amministratore</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .status-badge {
            @apply px-3 py-1 rounded-full text-xs font-semibold;
        }
        .status-pending { @apply bg-yellow-100 text-yellow-800; }
        .status-signed { @apply bg-green-100 text-green-800; }
        .status-paid { @apply bg-blue-100 text-blue-800; }
        .status-available { @apply bg-gray-100 text-gray-800; }
        .status-associated { @apply bg-purple-100 text-purple-800; }
        
        .card {
            @apply bg-white rounded-lg shadow-md p-6;
        }
        
        .btn-primary {
            @apply bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200;
        }
        
        .btn-success {
            @apply bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200;
        }
        
        .tab-active {
            @apply border-b-2 border-blue-600 text-blue-600 font-semibold;
        }
        
        .tab {
            @apply px-4 py-2 cursor-pointer hover:text-blue-600 transition;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900">Dashboard Amministratore</h1>
                    <p class="text-sm text-gray-500">TeleMedCare V11.0 - Gestione Completa</p>
                </div>
                <div class="flex items-center space-x-4">
                    <button onclick="refreshAll()" class="btn-primary">
                        <span>🔄</span> Aggiorna Tutto
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div id="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- Stats will be loaded here -->
        </div>

        <!-- Tabs -->
        <div class="bg-white rounded-lg shadow-md mb-6">
            <div class="border-b border-gray-200">
                <nav class="flex space-x-8 px-6" aria-label="Tabs">
                    <button class="tab tab-active" data-tab="leads" onclick="switchTab('leads')">
                        📊 Leads
                    </button>
                    <button class="tab" data-tab="contracts" onclick="switchTab('contracts')">
                        📄 Contratti
                    </button>
                    <button class="tab" data-tab="proformas" onclick="switchTab('proformas')">
                        💰 Proforma
                    </button>
                    <button class="tab" data-tab="devices" onclick="switchTab('devices')">
                        📱 Dispositivi
                    </button>
                </nav>
            </div>

            <!-- Tab Content -->
            <div class="p-6">
                <!-- Leads Tab -->
                <div id="tab-leads" class="tab-content">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Gestione Leads</h2>
                        <select id="filter-leads-status" onchange="loadLeads()" class="border rounded px-3 py-2">
                            <option value="">Tutti gli stati</option>
                            <option value="nuovo">Nuovo</option>
                            <option value="CONTRACT_SENT">Contratto Inviato</option>
                            <option value="CONTRACT_SIGNED">Contratto Firmato</option>
                            <option value="PAYMENT_PENDING">Pagamento Pendente</option>
                            <option value="ACTIVE">Attivo</option>
                        </select>
                    </div>
                    <div id="leads-list" class="overflow-x-auto">
                        <!-- Leads table will be loaded here -->
                    </div>
                </div>

                <!-- Contracts Tab -->
                <div id="tab-contracts" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Gestione Contratti</h2>
                        <select id="filter-contracts-status" onchange="loadContracts()" class="border rounded px-3 py-2">
                            <option value="">Tutti gli stati</option>
                            <option value="PENDING">In Attesa di Firma</option>
                            <option value="SIGNED_MANUAL">Firmato Manualmente</option>
                            <option value="SIGNED_DOCUSIGN">Firmato DocuSign</option>
                        </select>
                    </div>
                    <div id="contracts-list" class="overflow-x-auto">
                        <!-- Contracts table will be loaded here -->
                    </div>
                </div>

                <!-- Proformas Tab -->
                <div id="tab-proformas" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Gestione Proforma</h2>
                        <select id="filter-proformas-status" onchange="loadProformas()" class="border rounded px-3 py-2">
                            <option value="">Tutti gli stati</option>
                            <option value="PENDING">In Attesa Pagamento</option>
                            <option value="PAID_BANK_TRANSFER">Pagata con Bonifico</option>
                            <option value="PAID_STRIPE">Pagata con Stripe</option>
                        </select>
                    </div>
                    <div id="proformas-list" class="overflow-x-auto">
                        <!-- Proformas table will be loaded here -->
                    </div>
                </div>

                <!-- Devices Tab -->
                <div id="tab-devices" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Gestione Dispositivi</h2>
                        <div class="flex space-x-2">
                            <select id="filter-devices-status" onchange="loadDevices()" class="border rounded px-3 py-2">
                                <option value="">Tutti gli stati</option>
                                <option value="AVAILABLE">Disponibili</option>
                                <option value="TO_CONFIGURE">Da Configurare</option>
                                <option value="ASSOCIATED">Associati</option>
                                <option value="MAINTENANCE">In Manutenzione</option>
                            </select>
                            <button onclick="showCreateDeviceModal()" class="btn-primary">
                                ➕ Nuovo Dispositivo
                            </button>
                        </div>
                    </div>
                    <div id="devices-list" class="overflow-x-auto">
                        <!-- Devices table will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <div id="modal-confirm-signature" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Conferma Firma Manuale</h3>
                <p class="text-sm text-gray-500 mb-4">Confermi di aver ricevuto il contratto firmato in modo olografo?</p>
                <input type="hidden" id="signature-contract-id">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">La tua email</label>
                    <input type="email" id="signature-admin-email" class="w-full border rounded px-3 py-2" placeholder="admin@telemedcare.it">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Note (opzionale)</label>
                    <textarea id="signature-notes" class="w-full border rounded px-3 py-2" rows="3"></textarea>
                </div>
                <div class="flex justify-end space-x-2">
                    <button onclick="closeModal('modal-confirm-signature')" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Annulla</button>
                    <button onclick="confirmSignature()" class="btn-success">✅ Conferma Firma</button>
                </div>
            </div>
        </div>
    </div>

    <div id="modal-confirm-payment" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Conferma Pagamento Bonifico</h3>
                <p class="text-sm text-gray-500 mb-4">Confermi di aver ricevuto il bonifico sul conto aziendale?</p>
                <input type="hidden" id="payment-proforma-id">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">La tua email</label>
                    <input type="email" id="payment-admin-email" class="w-full border rounded px-3 py-2" placeholder="admin@telemedcare.it">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Riferimento Bonifico *</label>
                    <input type="text" id="payment-reference" class="w-full border rounded px-3 py-2" placeholder="TRN123456789" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Note (opzionale)</label>
                    <textarea id="payment-notes" class="w-full border rounded px-3 py-2" rows="3"></textarea>
                </div>
                <div class="flex justify-end space-x-2">
                    <button onclick="closeModal('modal-confirm-payment')" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Annulla</button>
                    <button onclick="confirmPayment()" class="btn-success">✅ Conferma Pagamento</button>
                </div>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = '/api/admin';
        
        // State
        let currentTab = 'leads';
        
        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            loadStats();
            loadLeads();
        });
        
        // Refresh all data
        function refreshAll() {
            loadStats();
            switch(currentTab) {
                case 'leads': loadLeads(); break;
                case 'contracts': loadContracts(); break;
                case 'proformas': loadProformas(); break;
                case 'devices': loadDevices(); break;
            }
        }
        
        // Switch tab
        function switchTab(tab) {
            currentTab = tab;
            
            // Update tab styles
            document.querySelectorAll('.tab').forEach(el => {
                el.classList.remove('tab-active');
            });
            document.querySelector(\`[data-tab="\${tab}"]\`).classList.add('tab-active');
            
            // Show/hide content
            document.querySelectorAll('.tab-content').forEach(el => {
                el.classList.add('hidden');
            });
            document.getElementById(\`tab-\${tab}\`).classList.remove('hidden');
            
            // Load data
            switch(tab) {
                case 'leads': loadLeads(); break;
                case 'contracts': loadContracts(); break;
                case 'proformas': loadProformas(); break;
                case 'devices': loadDevices(); break;
            }
        }
        
        // Load Stats
        async function loadStats() {
            try {
                const res = await fetch(\`\${API_BASE}/dashboard/stats\`);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const stats = data.stats;
                const html = \`
                    <div class="card">
                        <div class="text-sm font-medium text-gray-500 mb-2">Leads Totali</div>
                        <div class="text-3xl font-bold text-gray-900">\${stats.leads.total || 0}</div>
                        <div class="mt-2 text-sm text-gray-600">
                            \${stats.leads.nuovi || 0} nuovi
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="text-sm font-medium text-gray-500 mb-2">Contratti</div>
                        <div class="text-3xl font-bold text-gray-900">\${stats.contracts.total || 0}</div>
                        <div class="mt-2 text-sm text-gray-600">
                            \${stats.contracts.in_attesa_firma || 0} in attesa firma
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="text-sm font-medium text-gray-500 mb-2">Proforma</div>
                        <div class="text-3xl font-bold text-gray-900">\${stats.proformas.total || 0}</div>
                        <div class="mt-2 text-sm text-gray-600">
                            €\${(stats.proformas.totale_importi || 0).toFixed(2)}
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="text-sm font-medium text-gray-500 mb-2">Dispositivi</div>
                        <div class="text-3xl font-bold text-gray-900">\${stats.devices.total || 0}</div>
                        <div class="mt-2 text-sm text-gray-600">
                            \${stats.devices.disponibili || 0} disponibili
                        </div>
                    </div>
                \`;
                
                document.getElementById('stats').innerHTML = html;
            } catch (error) {
                console.error('Error loading stats:', error);
                showNotification('Errore caricamento statistiche', 'error');
            }
        }
        
        // Load Leads
        async function loadLeads() {
            const status = document.getElementById('filter-leads-status').value;
            const url = status ? \`\${API_BASE}/leads?status=\${status}\` : \`\${API_BASE}/leads\`;
            
            try {
                const res = await fetch(url);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const leads = data.leads;
                const html = \`
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pacchetto</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${leads.map(lead => \`
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium text-gray-900">\${lead.nomeRichiedente} \${lead.cognomeRichiedente}</div>
                                        <div class="text-sm text-gray-500">\${lead.telefonoRichiedente}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${lead.emailRichiedente}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                            \${lead.pacchetto}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="status-badge \${getStatusClass(lead.status)}">\${lead.status}</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${formatDate(lead.timestamp)}</td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                \`;
                
                document.getElementById('leads-list').innerHTML = html;
            } catch (error) {
                console.error('Error loading leads:', error);
                showNotification('Errore caricamento leads', 'error');
            }
        }
        
        // Load Contracts
        async function loadContracts() {
            const status = document.getElementById('filter-contracts-status').value;
            const url = status ? \`\${API_BASE}/contracts?signature_status=\${status}\` : \`\${API_BASE}/contracts\`;
            
            try {
                const res = await fetch(url);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const contracts = data.contracts;
                const html = \`
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codice</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato Firma</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${contracts.map(contract => \`
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">\${contract.contract_code}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium text-gray-900">\${contract.nomeRichiedente || ''} \${contract.cognomeRichiedente || ''}</div>
                                        <div class="text-sm text-gray-500">\${contract.emailRichiedente || ''}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">\${contract.contract_type}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="status-badge \${getSignatureStatusClass(contract.signature_status)}">\${contract.signature_status}</span>
                                        \${contract.signature_type ? \`<div class="text-xs text-gray-500 mt-1">\${contract.signature_type}</div>\` : ''}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${formatDate(contract.created_at)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        \${contract.signature_status === 'PENDING' ? \`
                                            <button onclick="showConfirmSignatureModal(\${contract.id})" class="text-green-600 hover:text-green-900 font-medium">
                                                ✅ Conferma Firma
                                            </button>
                                        \` : contract.signed_at ? \`
                                            <span class="text-gray-500">Firmato \${formatDate(contract.signed_at)}</span>
                                        \` : ''}
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                \`;
                
                document.getElementById('contracts-list').innerHTML = html;
            } catch (error) {
                console.error('Error loading contracts:', error);
                showNotification('Errore caricamento contratti', 'error');
            }
        }
        
        // Load Proformas
        async function loadProformas() {
            const status = document.getElementById('filter-proformas-status').value;
            const url = status ? \`\${API_BASE}/proformas?status=\${status}\` : \`\${API_BASE}/proformas\`;
            
            try {
                const res = await fetch(url);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const proformas = data.proformas;
                const html = \`
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codice</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importo</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scadenza</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${proformas.map(proforma => \`
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">\${proforma.proforma_code}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="font-medium text-gray-900">\${proforma.nomeRichiedente || ''} \${proforma.cognomeRichiedente || ''}</div>
                                        <div class="text-sm text-gray-500">\${proforma.emailRichiedente || ''}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold">€\${proforma.amount.toFixed(2)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="status-badge \${getPaymentStatusClass(proforma.status)}">\${proforma.status}</span>
                                        \${proforma.payment_method ? \`<div class="text-xs text-gray-500 mt-1">\${proforma.payment_method}</div>\` : ''}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">\${formatDate(proforma.due_date)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        \${proforma.status === 'PENDING' ? \`
                                            <button onclick="showConfirmPaymentModal(\${proforma.id})" class="text-green-600 hover:text-green-900 font-medium">
                                                ✅ Conferma Bonifico
                                            </button>
                                        \` : proforma.payment_date ? \`
                                            <span class="text-gray-500">Pagato \${formatDate(proforma.payment_date)}</span>
                                        \` : ''}
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                \`;
                
                document.getElementById('proformas-list').innerHTML = html;
            } catch (error) {
                console.error('Error loading proformas:', error);
                showNotification('Errore caricamento proforma', 'error');
            }
        }
        
        // Load Devices
        async function loadDevices() {
            const status = document.getElementById('filter-devices-status').value;
            const url = status ? \`\${API_BASE}/devices?status=\${status}\` : \`\${API_BASE}/devices\`;
            
            try {
                const res = await fetch(url);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const devices = data.devices;
                const html = \`
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Codice</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modello</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assistito</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${devices.map(device => \`
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">\${device.device_code}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">\${device.serial_number || '-'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">\${device.model || device.device_type}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="status-badge \${getDeviceStatusClass(device.status)}">\${device.status}</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        \${device.nomeRichiedente ? \`\${device.nomeRichiedente} \${device.cognomeRichiedente}\` : '-'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        \${device.status === 'AVAILABLE' || device.status === 'TO_CONFIGURE' ? \`
                                            <button onclick="showAssociateDeviceModal(\${device.id})" class="text-blue-600 hover:text-blue-900 font-medium">
                                                🔗 Associa
                                            </button>
                                        \` : ''}
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                \`;
                
                document.getElementById('devices-list').innerHTML = html;
            } catch (error) {
                console.error('Error loading devices:', error);
                showNotification('Errore caricamento dispositivi', 'error');
            }
        }
        
        // Show Confirm Signature Modal
        function showConfirmSignatureModal(contractId) {
            document.getElementById('signature-contract-id').value = contractId;
            document.getElementById('modal-confirm-signature').classList.remove('hidden');
        }
        
        // Confirm Signature
        async function confirmSignature() {
            const contractId = document.getElementById('signature-contract-id').value;
            const adminEmail = document.getElementById('signature-admin-email').value;
            const notes = document.getElementById('signature-notes').value;
            
            if (!adminEmail) {
                alert('Inserisci la tua email');
                return;
            }
            
            try {
                const res = await fetch(\`\${API_BASE}/contracts/\${contractId}/confirm-signature\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ admin_email: adminEmail, notes })
                });
                
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                showNotification('Firma confermata con successo! La proforma verrà generata automaticamente.', 'success');
                closeModal('modal-confirm-signature');
                loadContracts();
                loadStats();
            } catch (error) {
                console.error('Error confirming signature:', error);
                showNotification('Errore conferma firma: ' + error.message, 'error');
            }
        }
        
        // Show Confirm Payment Modal
        function showConfirmPaymentModal(proformaId) {
            document.getElementById('payment-proforma-id').value = proformaId;
            document.getElementById('modal-confirm-payment').classList.remove('hidden');
        }
        
        // Confirm Payment
        async function confirmPayment() {
            const proformaId = document.getElementById('payment-proforma-id').value;
            const adminEmail = document.getElementById('payment-admin-email').value;
            const paymentReference = document.getElementById('payment-reference').value;
            const notes = document.getElementById('payment-notes').value;
            
            if (!adminEmail) {
                alert('Inserisci la tua email');
                return;
            }
            
            if (!paymentReference) {
                alert('Inserisci il riferimento del bonifico');
                return;
            }
            
            try {
                const res = await fetch(\`\${API_BASE}/proformas/\${proformaId}/confirm-payment\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ admin_email: adminEmail, payment_reference: paymentReference, notes })
                });
                
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                showNotification('Pagamento confermato con successo! L\\'email di benvenuto verrà inviata automaticamente.', 'success');
                closeModal('modal-confirm-payment');
                loadProformas();
                loadStats();
            } catch (error) {
                console.error('Error confirming payment:', error);
                showNotification('Errore conferma pagamento: ' + error.message, 'error');
            }
        }
        
        // Close Modal
        function closeModal(modalId) {
            document.getElementById(modalId).classList.add('hidden');
        }
        
        // Utility Functions
        function getStatusClass(status) {
            const classes = {
                'nuovo': 'status-pending',
                'CONTRACT_SENT': 'bg-blue-100 text-blue-800',
                'CONTRACT_SIGNED': 'status-signed',
                'PAYMENT_PENDING': 'status-pending',
                'ACTIVE': 'status-signed'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
        
        function getSignatureStatusClass(status) {
            const classes = {
                'PENDING': 'status-pending',
                'SIGNED_MANUAL': 'status-signed',
                'SIGNED_DOCUSIGN': 'status-signed'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
        
        function getPaymentStatusClass(status) {
            const classes = {
                'PENDING': 'status-pending',
                'PAID_BANK_TRANSFER': 'status-paid',
                'PAID_STRIPE': 'status-paid'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
        
        function getDeviceStatusClass(status) {
            const classes = {
                'AVAILABLE': 'status-available',
                'TO_CONFIGURE': 'status-pending',
                'ASSOCIATED': 'status-associated',
                'MAINTENANCE': 'bg-orange-100 text-orange-800'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
        
        function formatDate(dateStr) {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleString('it-IT', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        function showNotification(message, type = 'info') {
            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                info: 'bg-blue-500'
            };
            
            const notification = document.createElement('div');
            notification.className = \`fixed top-4 right-4 \${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50\`;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 5000);
        }
    </script>
</body>
</html>`)
})

export default adminDashboardRoute
