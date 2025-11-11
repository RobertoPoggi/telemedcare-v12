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
        
        /* Icon Action Buttons with Tooltips - NO TEXT IN DOM */
        .action-icon {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 2rem;
            height: 2rem;
            border-radius: 0.25rem;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        
        .action-icon:hover {
            background-color: #f3f4f6;
        }
        
        /* Tooltip shown with ::before pseudo-element - NO DOM TEXT */
        .action-icon::before {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 0.5rem;
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
            color: white;
            background-color: #111827;
            border-radius: 0.25rem;
            white-space: nowrap;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s, visibility 0.2s;
            pointer-events: none;
            z-index: 50;
        }
        
        .action-icon:hover::before {
            opacity: 1;
            visibility: visible;
        }
        
        /* Tooltip arrow */
        .action-icon::after {
            content: '';
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            margin-bottom: 0.125rem;
            border: 4px solid transparent;
            border-top-color: #111827;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s, visibility 0.2s;
            pointer-events: none;
        }
        
        .action-icon:hover::after {
            opacity: 1;
            visibility: visible;
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
                    <button onclick="showCreateLeadModal()" class="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition">
                        <span>➕</span> Crea Lead
                    </button>
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
                            <option value="SENT">Inviato</option>
                            <option value="generated">Generato</option>
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
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">✅ Conferma Firma Contratto</h3>
                <p class="text-sm text-gray-700 mb-4">
                    Conferma che il contratto è stato firmato. Lo stato cambierà da "Inviato" a "Firmato" e verrà generata automaticamente la proforma.
                </p>
                <input type="hidden" id="signature-contract-id">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">La tua email</label>
                    <input type="email" id="signature-admin-email" class="w-full border rounded px-3 py-2" placeholder="admin@telemedcare.it">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Note (opzionale)</label>
                    <textarea id="signature-notes" class="w-full border rounded px-3 py-2" rows="3" placeholder="Note sulla firma..."></textarea>
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

    <!-- Modal View Lead -->
    <div id="modal-view-lead" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">👤 Dettagli Lead</h3>
                <div class="space-y-3">
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Nome</label>
                        <p id="view-lead-nome" class="text-sm text-gray-900"></p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Cognome</label>
                        <p id="view-lead-cognome" class="text-sm text-gray-900"></p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Email</label>
                        <p id="view-lead-email" class="text-sm text-gray-900"></p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Telefono</label>
                        <p id="view-lead-telefono" class="text-sm text-gray-900"></p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Indirizzo</label>
                        <p id="view-lead-indirizzo" class="text-sm text-gray-900"></p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Pacchetto</label>
                        <p id="view-lead-pacchetto" class="text-sm text-gray-900"></p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Status</label>
                        <p id="view-lead-status" class="text-sm text-gray-900"></p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500">Data</label>
                        <p id="view-lead-data" class="text-sm text-gray-900"></p>
                    </div>
                </div>
                <div class="flex justify-end mt-4">
                    <button onclick="closeModal('modal-view-lead')" class="btn-primary">Chiudi</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Edit Lead -->
    <div id="modal-edit-lead" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">✏️ Modifica Lead</h3>
                <input type="hidden" id="edit-lead-id">
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input type="text" id="edit-lead-nome" class="w-full border rounded px-3 py-2" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                        <input type="text" id="edit-lead-cognome" class="w-full border rounded px-3 py-2" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" id="edit-lead-email" class="w-full border rounded px-3 py-2" required>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                        <input type="tel" id="edit-lead-telefono" class="w-full border rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
                        <input type="text" id="edit-lead-indirizzo" class="w-full border rounded px-3 py-2">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Pacchetto *</label>
                        <select id="edit-lead-pacchetto" class="w-full border rounded px-3 py-2">
                            <option value="BASE">BASE</option>
                            <option value="AVANZATO">AVANZATO</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="edit-lead-status" class="w-full border rounded px-3 py-2">
                            <option value="NUOVO">Nuovo</option>
                            <option value="CONTATTATO">Contattato</option>
                            <option value="CONTRATTO_FIRMATO">Contratto Firmato</option>
                            <option value="DOCUMENTI_INVIATI">Documenti Inviati</option>
                            <option value="ARCHIVIATO">Archiviato</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end space-x-2 mt-4">
                    <button onclick="closeModal('modal-edit-lead')" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Annulla</button>
                    <button onclick="saveLeadChanges()" class="btn-success">💾 Salva Modifiche</button>
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
                            €\${parseFloat(stats.proformas.totale_importi || 0).toFixed(2)}
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
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pacchetto</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${leads.map(lead => \`
                                <tr>
                                    <td class="px-3 py-2">
                                        <div class="text-sm font-medium text-gray-900">\${lead.nomeRichiedente} \${lead.cognomeRichiedente}</div>
                                        <div class="text-xs text-gray-500">\${lead.telefonoRichiedente}</div>
                                    </td>
                                    <td class="px-3 py-2 text-sm text-gray-500">\${lead.emailRichiedente}</td>
                                    <td class="px-3 py-2">
                                        <span class="px-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            \${formatPiano(lead.pacchetto)}
                                        </span>
                                    </td>
                                    <td class="px-3 py-2">
                                        <span class="status-badge text-xs \${getStatusClass(lead.status)}">\${formatStatus(lead.status)}</span>
                                    </td>
                                    <td class="px-3 py-2 text-xs text-gray-500">\${formatDate(lead.timestamp)}</td>
                                    <td class="px-2 py-2">
                                        <div class="flex items-center space-x-1">
                                            <button onclick="viewLead('\${lead.id}')" class="action-icon text-blue-600 hover:text-blue-900" data-tooltip="Visualizza">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                </svg>
                                            </button>
                                            <button onclick="editLead('\${lead.id}')" class="action-icon text-amber-600 hover:text-amber-900" data-tooltip="Modifica">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                </svg>
                                            </button>
                                            <button onclick="deleteLead('\${lead.id}', '\${lead.nomeRichiedente} \${lead.cognomeRichiedente}')" class="action-icon text-red-600 hover:text-red-900" data-tooltip="Elimina">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
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
        
        // View Lead Details
        async function viewLead(leadId) {
            try {
                const res = await fetch(\`\${API_BASE}/leads/\${leadId}\`);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const lead = data.lead;
                
                // Populate modal with lead data
                document.getElementById('view-lead-nome').textContent = lead.nomeRichiedente || '-';
                document.getElementById('view-lead-cognome').textContent = lead.cognomeRichiedente || '-';
                document.getElementById('view-lead-email').textContent = lead.emailRichiedente || '-';
                document.getElementById('view-lead-telefono').textContent = lead.telefonoRichiedente || '-';
                document.getElementById('view-lead-indirizzo').textContent = lead.indirizzoRichiedente || '-';
                document.getElementById('view-lead-pacchetto').textContent = formatPiano(lead.pacchetto);
                document.getElementById('view-lead-status').textContent = formatStatus(lead.status);
                document.getElementById('view-lead-data').textContent = formatDate(lead.timestamp);
                
                // Show modal
                document.getElementById('modal-view-lead').classList.remove('hidden');
            } catch (error) {
                console.error('Error viewing lead:', error);
                showNotification('Errore caricamento lead: ' + error.message, 'error');
            }
        }
        
        // Edit Lead
        async function editLead(leadId) {
            try {
                const res = await fetch(\`\${API_BASE}/leads/\${leadId}\`);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const lead = data.lead;
                
                // Populate edit form
                document.getElementById('edit-lead-id').value = lead.id;
                document.getElementById('edit-lead-nome').value = lead.nomeRichiedente || '';
                document.getElementById('edit-lead-cognome').value = lead.cognomeRichiedente || '';
                document.getElementById('edit-lead-email').value = lead.emailRichiedente || '';
                document.getElementById('edit-lead-telefono').value = lead.telefonoRichiedente || '';
                document.getElementById('edit-lead-indirizzo').value = lead.indirizzoRichiedente || '';
                document.getElementById('edit-lead-pacchetto').value = lead.pacchetto || 'BASE';
                document.getElementById('edit-lead-status').value = lead.status || 'NUOVO';
                
                // Show modal
                document.getElementById('modal-edit-lead').classList.remove('hidden');
            } catch (error) {
                console.error('Error loading lead for edit:', error);
                showNotification('Errore caricamento lead: ' + error.message, 'error');
            }
        }
        
        // Save Lead Changes
        async function saveLeadChanges() {
            const leadId = document.getElementById('edit-lead-id').value;
            const updatedData = {
                nomeRichiedente: document.getElementById('edit-lead-nome').value,
                cognomeRichiedente: document.getElementById('edit-lead-cognome').value,
                emailRichiedente: document.getElementById('edit-lead-email').value,
                telefonoRichiedente: document.getElementById('edit-lead-telefono').value,
                indirizzoRichiedente: document.getElementById('edit-lead-indirizzo').value,
                pacchetto: document.getElementById('edit-lead-pacchetto').value,
                status: document.getElementById('edit-lead-status').value
            };
            
            try {
                const res = await fetch(\`\${API_BASE}/leads/\${leadId}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                showNotification('Lead aggiornato con successo', 'success');
                closeModal('modal-edit-lead');
                loadLeads();
                loadStats();
            } catch (error) {
                console.error('Error saving lead:', error);
                showNotification('Errore salvataggio lead: ' + error.message, 'error');
            }
        }
        
        // Create Contract from Lead
        async function createContractFromLead(leadId) {
            if (!confirm('Vuoi creare un contratto per questo lead?')) {
                return;
            }
            
            try {
                showNotification('Creazione contratto in corso...', 'info');
                
                const res = await fetch(\`\${API_BASE}/contracts/create-from-lead\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lead_id: leadId })
                });
                
                const data = await res.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Errore creazione contratto');
                }
                
                showNotification('Contratto creato con successo: ' + data.contract_code, 'success');
                loadLeads();
                loadContracts();
                loadStats();
            } catch (error) {
                console.error('Error creating contract:', error);
                showNotification('Errore creazione contratto: ' + error.message, 'error');
            }
        }
        
        // Delete Lead
        async function deleteLead(leadId, leadName) {
            if (!confirm('Sei sicuro di voler eliminare il lead ' + leadName + '?\\n\\nQuesta azione è irreversibile!')) {
                return;
            }
            
            try {
                const res = await fetch(\`\${API_BASE}/leads/\${leadId}\`, {
                    method: 'DELETE'
                });
                
                const data = await res.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Errore eliminazione');
                }
                
                showNotification('Lead ' + leadName + ' eliminato con successo', 'success');
                loadLeads();
                loadStats();
            } catch (error) {
                console.error('Error deleting lead:', error);
                showNotification('Errore eliminazione lead: ' + error.message, 'error');
            }
        }
        
        // Show Create Lead Modal
        function showCreateLeadModal() {
            showNotification('Funzione Crea Lead in sviluppo - Usa il form pubblico /richiesta-accesso', 'info');
            console.log('Create Lead modal requested');
            // TODO: Implementare modal di creazione lead manuale
            // Per ora si usa il form pubblico /richiesta-accesso
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
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Codice</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Piano</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Emissione</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Firma</th>
                                <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${contracts.map(contract => \`
                                <tr>
                                    <td class="px-3 py-2 text-sm font-mono">\${contract.codice_contratto || contract.id}</td>
                                    <td class="px-3 py-2">
                                        <div class="text-sm font-medium text-gray-900">\${contract.nomeRichiedente || ''} \${contract.cognomeRichiedente || ''}</div>
                                        <div class="text-xs text-gray-500">\${contract.emailRichiedente || ''}</div>
                                    </td>
                                    <td class="px-3 py-2 text-sm">\${formatPiano(contract.piano || contract.pacchetto || '-')}</td>
                                    <td class="px-3 py-2">
                                        <span class="status-badge text-xs \${getSignatureStatusClass(contract.status)}">\${formatStatus(contract.status)}</span>
                                    </td>
                                    <td class="px-3 py-2 text-xs text-gray-500">\${formatDate(contract.created_at)}</td>
                                    <td class="px-3 py-2 text-xs text-gray-500">
                                        \${contract.signature_date ? formatDate(contract.signature_date) : '-'}
                                    </td>
                                    <td class="px-2 py-2 text-sm">
                                        <div class="flex items-center space-x-1">
                                            <a href="/api/contratti/\${contract.id}/view" target="_blank" class="action-icon text-blue-600 hover:text-blue-900" data-tooltip="Visualizza PDF">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                </svg>
                                            </a>
                                            <button onclick="editContract('\${contract.id}')" class="action-icon text-amber-600 hover:text-amber-900" data-tooltip="Modifica">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                </svg>
                                            </button>
                                            \${!contract.signature_date ? \`
                                                <button onclick="showConfirmSignatureModal('\${contract.id}')" class="action-icon text-green-600 hover:text-green-900" data-tooltip="Conferma Firma">
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                </button>
                                            \` : ''}
                                            <button onclick="deleteContract('\${contract.id}', '\${contract.codice_contratto}')" class="action-icon text-red-600 hover:text-red-900" data-tooltip="Elimina">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </div>
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
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Codice</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Importo</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Emissione</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Scadenza</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                                <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${proformas.map(proforma => \`
                                <tr>
                                    <td class="px-3 py-2 text-sm font-mono">\${proforma.proforma_code}</td>
                                    <td class="px-3 py-2">
                                        <div class="text-sm font-medium text-gray-900">\${proforma.nomeRichiedente || ''} \${proforma.cognomeRichiedente || ''}</div>
                                        <div class="text-xs text-gray-500">\${proforma.emailRichiedente || ''}</div>
                                    </td>
                                    <td class="px-3 py-2 text-sm font-semibold">€\${proforma.amount.toFixed(2)}</td>
                                    <td class="px-3 py-2">
                                        <span class="status-badge text-xs \${getPaymentStatusClass(proforma.status)}">\${formatStatus(proforma.status)}</span>
                                    </td>
                                    <td class="px-3 py-2 text-xs text-gray-500">\${formatDate(proforma.issue_date)}</td>
                                    <td class="px-3 py-2 text-xs text-gray-500">\${formatDate(proforma.due_date)}</td>
                                    <td class="px-3 py-2 text-xs text-gray-500">\${proforma.payment_date ? formatDate(proforma.payment_date) : '-'}</td>
                                    <td class="px-2 py-2 text-sm">
                                        <div class="flex items-center space-x-1">
                                            <a href="/api/proforma/\${proforma.id}/view" target="_blank" class="action-icon text-blue-600 hover:text-blue-900" data-tooltip="Visualizza PDF">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                </svg>
                                            </a>
                                            <button onclick="editProforma('\${proforma.id}')" class="action-icon text-amber-600 hover:text-amber-900" data-tooltip="Modifica">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                </svg>
                                            </button>
                                            <button onclick="resendProformaEmail('\${proforma.id}', '\${proforma.proforma_code}')" class="action-icon text-purple-600 hover:text-purple-900" data-tooltip="Reinvia Email">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                </svg>
                                            </button>
                                            \${proforma.status === 'PENDING' ? \`
                                                <button onclick="showConfirmPaymentModal('\${proforma.id}')" class="action-icon text-green-600 hover:text-green-900" data-tooltip="Conferma Pagamento">
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                                                    </svg>
                                                </button>
                                            \` : ''}
                                            <button onclick="deleteProforma('\${proforma.id}', '\${proforma.proforma_code}')" class="action-icon text-red-600 hover:text-red-900" data-tooltip="Elimina">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                                </svg>
                                            </button>
                                        </div>
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
                
                showNotification('Firma confermata! Proforma generata automaticamente.', 'success');
                closeModal('modal-confirm-signature');
                loadContracts();
                loadStats();
            } catch (error) {
                console.error('Error confirming signature:', error);
                showNotification('Errore conferma firma: ' + error.message, 'error');
            }
        }
        
        // Edit Contract
        async function editContract(contractId) {
            showNotification('Funzione modifica contratto in sviluppo', 'info');
            // TODO: Implementare modal di modifica contratto
            console.log('Edit contract:', contractId);
        }
        
        // Delete Contract
        async function deleteContract(contractId, contractCode) {
            if (!confirm('Sei sicuro di voler eliminare il contratto ' + contractCode + '?\\n\\nQuesta azione è irreversibile!')) {
                return;
            }
            
            try {
                const res = await fetch(\`\${API_BASE}/contracts/\${contractId}\`, {
                    method: 'DELETE'
                });
                
                const data = await res.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Errore eliminazione');
                }
                
                showNotification('Contratto ' + contractCode + ' eliminato con successo', 'success');
                loadContracts();
                loadStats();
            } catch (error) {
                console.error('Error deleting contract:', error);
                showNotification('Errore eliminazione contratto: ' + error.message, 'error');
            }
        }
        
        // Show Confirm Payment Modal
        function showConfirmPaymentModal(proformaId) {
            document.getElementById('payment-proforma-id').value = proformaId;
            document.getElementById('modal-confirm-payment').classList.remove('hidden');
        }
        
        // Resend Proforma Email
        async function resendProformaEmail(proformaId, proformaCode) {
            if (!confirm('Vuoi reinviare l\\'email della proforma ' + proformaCode + '?\\n\\nNOTA: Assicurati che SENDGRID_API_KEY o RESEND_API_KEY siano configurati in .dev.vars')) {
                return;
            }
            
            try {
                showNotification('Invio email in corso...', 'info');
                
                const res = await fetch(\`\${API_BASE}/proformas/\${proformaId}/resend-email\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await res.json();
                
                if (!data.success) {
                    if (res.status === 503) {
                        throw new Error('Servizio email non configurato. Configura SENDGRID_API_KEY o RESEND_API_KEY in .dev.vars');
                    }
                    throw new Error(data.error || 'Errore sconosciuto');
                }
                
                showNotification('Email proforma ' + proformaCode + ' reinviata con successo a ' + data.sentTo, 'success');
            } catch (error) {
                console.error('Error resending proforma email:', error);
                showNotification('Errore reinvio email: ' + error.message, 'error');
            }
        }
        
        // Edit Proforma
        async function editProforma(proformaId) {
            showNotification('Funzione modifica proforma in sviluppo', 'info');
            // TODO: Implementare modal di modifica proforma
            console.log('Edit proforma:', proformaId);
        }
        
        // Delete Proforma
        async function deleteProforma(proformaId, proformaCode) {
            if (!confirm('Sei sicuro di voler eliminare la proforma ' + proformaCode + '?\\n\\nQuesta azione è irreversibile!')) {
                return;
            }
            
            try {
                const res = await fetch(\`\${API_BASE}/proformas/\${proformaId}\`, {
                    method: 'DELETE'
                });
                
                const data = await res.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Errore eliminazione');
                }
                
                showNotification('Proforma ' + proformaCode + ' eliminata con successo', 'success');
                loadProformas();
                loadStats();
            } catch (error) {
                console.error('Error deleting proforma:', error);
                showNotification('Errore eliminazione proforma: ' + error.message, 'error');
            }
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
                'generated': 'status-pending',
                'PENDING': 'status-pending',
                'SENT': 'bg-blue-100 text-blue-800',
                'SIGNED_MANUAL': 'status-signed',
                'SIGNED_DOCUSIGN': 'status-signed',
                'signed': 'status-signed',
                'CONTRACT_SENT': 'bg-blue-100 text-blue-800',
                'CONTRACT_SIGNED': 'status-signed'
            };
            return classes[status] || 'bg-gray-100 text-gray-800';
        }
        
        function formatStatus(status) {
            const translations = {
                'generated': 'Generato',
                'PENDING': 'In Attesa di Pagamento',
                'SENT': 'Inviato',
                'SIGNED_MANUAL': 'Firmato',
                'SIGNED_DOCUSIGN': 'Firmato',
                'signed': 'Firmato',
                'nuovo': 'Nuovo',
                'CONTRACT_SENT': 'Contratto Inviato',
                'CONTRACT_SIGNED': 'Contratto Firmato',
                'PAYMENT_PENDING': 'Pagamento Pendente',
                'ACTIVE': 'Attivo',
                'DOCUMENTI_INVIATI': 'Documenti Inviati',
                'DOCUMENTS_SENT': 'Documenti Inviati',
                'PAID': 'Pagato',
                'PAID_BANK_TRANSFER': 'Pagato (Bonifico)',
                'PAID_STRIPE': 'Pagato (Stripe)'
            };
            return translations[status] || status;
        }
        
        function formatPiano(piano) {
            const translations = {
                'ADVANCED': 'Avanzato',
                'AVANZATO': 'Avanzato',
                'BASE': 'Base',
                'PREMIUM': 'Premium'
            };
            return translations[piano] || piano;
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
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return \`\${day}/\${month}/\${year}, \${hours}:\${minutes}\`;
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
