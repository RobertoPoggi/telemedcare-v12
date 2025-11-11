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
                    <button class="tab" data-tab="configurations" onclick="switchTab('configurations')">
                        ⚙️ Configurazioni
                    </button>
                    <button class="tab" data-tab="devices" onclick="switchTab('devices')">
                        📱 Dispositivi
                    </button>
                    <button class="tab" data-tab="assistiti" onclick="switchTab('assistiti')">
                        👨‍⚕️ Assistiti
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

                <!-- Configurations Tab -->
                <div id="tab-configurations" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Gestione Configurazioni</h2>
                        <div class="flex space-x-2">
                            <button onclick="exportAllConfigurations()" class="btn-secondary">
                                📊 Esporta Tutte
                            </button>
                            <button onclick="showCreateConfigurationModal()" class="btn-success">
                                ➕ Nuova Configurazione
                            </button>
                        </div>
                    </div>
                    <div id="configurations-list" class="overflow-x-auto">
                        <!-- Configurations table will be loaded here -->
                    </div>
                </div>

                <!-- Devices Tab -->
                <div id="tab-devices" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Gestione Dispositivi</h2>
                        <div class="flex space-x-2">
                            <select id="filter-devices-status" onchange="loadDevices()" class="border rounded px-3 py-2">
                                <option value="">Tutti gli stati</option>
                                <option value="AVAILABLE">Disponibile</option>
                                <option value="TO_CONFIGURE">Da Configurare</option>
                                <option value="ASSOCIATED">Associato</option>
                                <option value="MAINTENANCE">In Manutenzione</option>
                            </select>
                            <button onclick="exportDevices()" class="btn-secondary">
                                📊 Esporta
                            </button>
                            <button onclick="showCreateDeviceModal()" class="btn-primary">
                                ➕ Nuovo Dispositivo
                            </button>
                        </div>
                    </div>
                    <div id="devices-list" class="overflow-x-auto">
                        <!-- Devices table will be loaded here -->
                    </div>
                </div>

                <!-- Assistiti Tab (NEW) -->
                <div id="tab-assistiti" class="tab-content hidden">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-semibold">Gestione Assistiti</h2>
                        <div class="flex space-x-2">
                            <select id="filter-assistiti-status" onchange="loadAssistiti()" class="border rounded px-3 py-2">
                                <option value="">Tutti gli stati</option>
                                <option value="ATTIVO">Attivo</option>
                                <option value="SOSPESO">Sospeso</option>
                                <option value="CESSATO">Cessato</option>
                            </select>
                            <button onclick="showCreateAssistitoModal()" class="btn-success">
                                ➕ Nuovo Assistito
                            </button>
                        </div>
                    </div>
                    <div id="assistiti-list" class="overflow-x-auto">
                        <!-- Assistiti table will be loaded here -->
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

    <!-- Modal View Configuration -->
    <div id="modal-view-configuration" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">👁️ Dettagli Configurazione</h3>
                    <button onclick="closeModal('modal-view-configuration')" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <div id="view-configuration-content" class="space-y-4 max-h-96 overflow-y-auto">
                    <!-- Content will be loaded dynamically -->
                </div>
                <div class="flex justify-end space-x-2 mt-4">
                    <button onclick="closeModal('modal-view-configuration')" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Chiudi</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Edit Configuration -->
    <div id="modal-edit-configuration" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div class="mt-3">
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">✏️ Modifica Configurazione</h3>
                <input type="hidden" id="edit-config-id">
                <input type="hidden" id="edit-config-lead-id">
                <div class="space-y-4 max-h-96 overflow-y-auto">
                    <!-- Dati Assistito -->
                    <div class="border-b pb-3">
                        <h4 class="font-semibold mb-2">👤 Dati Assistito</h4>
                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                <input type="text" id="edit-config-nome" class="w-full border rounded px-3 py-2" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                                <input type="text" id="edit-config-cognome" class="w-full border rounded px-3 py-2" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Data Nascita *</label>
                                <input type="date" id="edit-config-data-nascita" class="w-full border rounded px-3 py-2" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Età</label>
                                <input type="text" id="edit-config-eta" class="w-full border rounded px-3 py-2">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                                <input type="tel" id="edit-config-telefono" class="w-full border rounded px-3 py-2" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" id="edit-config-email" class="w-full border rounded px-3 py-2">
                            </div>
                            <div class="col-span-2">
                                <label class="block text-sm font-medium text-gray-700 mb-1">Indirizzo *</label>
                                <input type="text" id="edit-config-indirizzo" class="w-full border rounded px-3 py-2" required>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Contatti Emergenza -->
                    <div class="border-b pb-3">
                        <h4 class="font-semibold mb-2">📞 Contatti Emergenza</h4>
                        <div class="space-y-2">
                            <div class="grid grid-cols-4 gap-2">
                                <input type="text" id="edit-config-contatto1-nome" placeholder="Nome contatto 1" class="border rounded px-2 py-1">
                                <input type="text" id="edit-config-contatto1-cognome" placeholder="Cognome" class="border rounded px-2 py-1">
                                <input type="tel" id="edit-config-contatto1-telefono" placeholder="Telefono" class="border rounded px-2 py-1">
                                <input type="email" id="edit-config-contatto1-email" placeholder="Email" class="border rounded px-2 py-1">
                            </div>
                            <div class="grid grid-cols-4 gap-2">
                                <input type="text" id="edit-config-contatto2-nome" placeholder="Nome contatto 2" class="border rounded px-2 py-1">
                                <input type="text" id="edit-config-contatto2-cognome" placeholder="Cognome" class="border rounded px-2 py-1">
                                <input type="tel" id="edit-config-contatto2-telefono" placeholder="Telefono" class="border rounded px-2 py-1">
                                <input type="email" id="edit-config-contatto2-email" placeholder="Email" class="border rounded px-2 py-1">
                            </div>
                            <div class="grid grid-cols-4 gap-2">
                                <input type="text" id="edit-config-contatto3-nome" placeholder="Nome contatto 3" class="border rounded px-2 py-1">
                                <input type="text" id="edit-config-contatto3-cognome" placeholder="Cognome" class="border rounded px-2 py-1">
                                <input type="tel" id="edit-config-contatto3-telefono" placeholder="Telefono" class="border rounded px-2 py-1">
                                <input type="email" id="edit-config-contatto3-email" placeholder="Email" class="border rounded px-2 py-1">
                            </div>
                        </div>
                    </div>
                    
                    <!-- Info Mediche -->
                    <div>
                        <h4 class="font-semibold mb-2">⚕️ Informazioni Mediche</h4>
                        <div class="space-y-2">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Patologie</label>
                                <textarea id="edit-config-patologie" class="w-full border rounded px-3 py-2" rows="2"></textarea>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Farmaci</label>
                                    <input type="text" id="edit-config-farmaci-nome" class="w-full border rounded px-2 py-1">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Dosaggio</label>
                                    <input type="text" id="edit-config-farmaci-dosaggio" class="w-full border rounded px-2 py-1">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 mb-1">Orario</label>
                                    <input type="text" id="edit-config-farmaci-orario" class="w-full border rounded px-2 py-1">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                                <textarea id="edit-config-note" class="w-full border rounded px-3 py-2" rows="2"></textarea>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end space-x-2 mt-4">
                    <button onclick="closeModal('modal-edit-configuration')" class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">Annulla</button>
                    <button onclick="saveConfigurationChanges()" class="btn-success">💾 Salva Modifiche</button>
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
                case 'configurations': loadConfigurations(); break;
                case 'devices': loadDevices(); break;
                case 'assistiti': loadAssistiti(); break;
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
                case 'configurations': loadConfigurations(); break;
                case 'devices': loadDevices(); break;
                case 'assistiti': loadAssistiti(); break;
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
                                            <button onclick="resendProformaEmail('\${proforma.id}', '\${proforma.proforma_code}')" class="action-icon text-purple-600 hover:text-purple-900" data-tooltip="Reinvia Email Proforma">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                                </svg>
                                            </button>
                                            \${proforma.status === 'PAID_BANK_TRANSFER' || proforma.status === 'PAID_STRIPE' ? \`
                                                <button onclick="resendWelcomeEmail('\${proforma.id}', '\${proforma.proforma_code}')" class="action-icon text-teal-600 hover:text-teal-900" data-tooltip="Reinvia Email Benvenuto + Form">
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                                    </svg>
                                                </button>
                                            \` : ''}
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
                                        <span class="status-badge \${getDeviceStatusClass(device.status)}">\${translateStatus(device.status, 'device')}</span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        \${device.nomeRichiedente ? \`\${device.nomeRichiedente} \${device.cognomeRichiedente}\` : '-'}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                                        <div class="flex items-center space-x-1">
                                            <button onclick="viewDevice(\${device.id})" class="action-icon text-blue-600 hover:text-blue-900" title="Visualizza">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                </svg>
                                            </button>
                                            <button onclick="editDevice(\${device.id})" class="action-icon text-amber-600 hover:text-amber-900" title="Modifica">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                </svg>
                                            </button>
                                            <button onclick="printDevice(\${device.id})" class="action-icon text-green-600 hover:text-green-900" title="Stampa">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                                </svg>
                                            </button>
                                            <button onclick="deleteDevice(\${device.id}, '\${device.device_code}')" class="action-icon text-red-600 hover:text-red-900" title="Elimina">
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
                
                document.getElementById('devices-list').innerHTML = html;
            } catch (error) {
                console.error('Error loading devices:', error);
                showNotification('Errore caricamento dispositivi', 'error');
            }
        }
        
        async function viewDevice(deviceId) {
            try {
                const res = await fetch(\`\${API_BASE}/devices/\${deviceId}\`);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const device = data.device;
                const html = \`
                    <div class="space-y-4">
                        <div class="border-b pb-3">
                            <h4 class="font-semibold mb-2 text-blue-700">📱 Informazioni Dispositivo</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>Codice:</strong> \${device.device_code || '-'}</div>
                                <div><strong>Serial Number:</strong> \${device.serial_number || '-'}</div>
                                <div><strong>IMEI:</strong> \${device.imei || '-'}</div>
                                <div><strong>Modello:</strong> \${device.model || device.device_type || '-'}</div>
                                <div><strong>Stato:</strong> <span class="status-badge \${getDeviceStatusClass(device.status)}">\${translateStatus(device.status, 'device')}</span></div>
                                <div><strong>Tipo:</strong> \${device.device_type || '-'}</div>
                            </div>
                        </div>
                        
                        <div class="border-b pb-3">
                            <h4 class="font-semibold mb-2 text-green-700">🔧 Informazioni Tecniche</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>Firmware:</strong> \${device.firmware_version || '-'}</div>
                                <div><strong>Hardware:</strong> \${device.hardware_version || '-'}</div>
                                <div><strong>Produttore:</strong> \${device.manufacturer || '-'}</div>
                                <div><strong>Data Produzione:</strong> \${device.manufacturing_date || '-'}</div>
                                <div><strong>UDI Primario:</strong> \${device.udi_primary || '-'}</div>
                                <div><strong>UDI Secondario:</strong> \${device.udi_secondary || '-'}</div>
                            </div>
                        </div>
                        
                        \${device.lead_id ? \`
                        <div class="border-b pb-3">
                            <h4 class="font-semibold mb-2 text-purple-700">👤 Associazione</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>Lead ID:</strong> \${device.lead_id}</div>
                                <div><strong>Associato il:</strong> \${formatDate(device.associated_at) || '-'}</div>
                                <div><strong>Associato da:</strong> \${device.associated_by || '-'}</div>
                            </div>
                        </div>
                        \` : ''}
                        
                        <div>
                            <h4 class="font-semibold mb-2 text-gray-700">📝 Note</h4>
                            <p class="text-sm text-gray-600">\${device.admin_notes || device.device_notes || 'Nessuna nota'}</p>
                        </div>
                        
                        <div class="text-xs text-gray-400 border-t pt-2">
                            <div>Creato: \${formatDate(device.created_at)}</div>
                            <div>Aggiornato: \${formatDate(device.updated_at)}</div>
                        </div>
                    </div>
                \`;
                
                alert('VISUALIZZA DISPOSITIVO (sostituire con modal):\\n\\n' + device.device_code + ' - ' + device.serial_number);
            } catch (error) {
                showNotification('Errore visualizzazione dispositivo: ' + error.message, 'error');
            }
        }
        
        async function editDevice(deviceId) {
            showNotification('Funzione modifica dispositivo in sviluppo', 'info');
            // TODO: Modal di modifica con form
        }
        
        async function deleteDevice(deviceId, deviceCode) {
            if (!confirm(\`Sei sicuro di voler eliminare il dispositivo \${deviceCode}?\\n\\nQuesta azione è irreversibile!\`)) {
                return;
            }
            
            try {
                const res = await fetch(\`\${API_BASE}/devices/\${deviceId}\`, {
                    method: 'DELETE'
                });
                
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                showNotification(\`Dispositivo \${deviceCode} eliminato con successo\`, 'success');
                loadDevices();
                loadStats();
            } catch (error) {
                showNotification('Errore eliminazione dispositivo: ' + error.message, 'error');
            }
        }
        
        function showCreateDeviceModal() {
            showNotification('Per caricare dispositivi, usa la funzione OCR da etichetta CE', 'info');
            // TODO: Modal con form oppure redirect a pagina OCR
        }
        
        async function exportDevices() {
            try {
                const status = document.getElementById('filter-devices-status').value;
                const url = status ? \`\${API_BASE}/devices?status=\${status}\` : \`\${API_BASE}/devices\`;
                
                const res = await fetch(url);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const jsonStr = JSON.stringify(data.devices, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url2 = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url2;
                a.download = \`dispositivi_\${new Date().toISOString().split('T')[0]}.json\`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url2);
                
                showNotification('Export dispositivi completato', 'success');
            } catch (error) {
                showNotification('Errore export: ' + error.message, 'error');
            }
        }
        
        async function printDevice(deviceId) {
            try {
                const res = await fetch(\`\${API_BASE}/devices/\${deviceId}\`);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const device = data.device;
                const printWindow = window.open('', '_blank');
                printWindow.document.write(\`
                    <html>
                    <head>
                        <title>Scheda Dispositivo - \${device.device_code}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h1 { color: #333; border-bottom: 2px solid #4A90E2; padding-bottom: 10px; }
                            .section { margin: 20px 0; }
                            .section h2 { color: #4A90E2; font-size: 18px; margin-bottom: 10px; }
                            .info-grid { display: grid; grid-template-columns: 150px 1fr; gap: 8px; }
                            .label { font-weight: bold; }
                            @media print { button { display: none; } }
                        </style>
                    </head>
                    <body>
                        <h1>📱 Scheda Dispositivo</h1>
                        
                        <div class="section">
                            <h2>Informazioni Generali</h2>
                            <div class="info-grid">
                                <div class="label">Codice:</div><div>\${device.device_code || '-'}</div>
                                <div class="label">Serial Number:</div><div>\${device.serial_number || '-'}</div>
                                <div class="label">IMEI:</div><div>\${device.imei || '-'}</div>
                                <div class="label">Modello:</div><div>\${device.model || device.device_type || '-'}</div>
                                <div class="label">Stato:</div><div>\${translateStatus(device.status, 'device')}</div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2>Specifiche Tecniche</h2>
                            <div class="info-grid">
                                <div class="label">Firmware:</div><div>\${device.firmware_version || '-'}</div>
                                <div class="label">Hardware:</div><div>\${device.hardware_version || '-'}</div>
                                <div class="label">Produttore:</div><div>\${device.manufacturer || '-'}</div>
                                <div class="label">Data Produzione:</div><div>\${device.manufacturing_date || '-'}</div>
                                <div class="label">UDI Primario:</div><div>\${device.udi_primary || '-'}</div>
                                <div class="label">UDI Secondario:</div><div>\${device.udi_secondary || '-'}</div>
                            </div>
                        </div>
                        
                        \${device.lead_id ? \`
                        <div class="section">
                            <h2>Associazione</h2>
                            <div class="info-grid">
                                <div class="label">Lead ID:</div><div>\${device.lead_id}</div>
                                <div class="label">Associato il:</div><div>\${formatDate(device.associated_at) || '-'}</div>
                            </div>
                        </div>
                        \` : ''}
                        
                        <div class="section">
                            <h2>Note</h2>
                            <p>\${device.admin_notes || device.device_notes || 'Nessuna nota'}</p>
                        </div>
                        
                        <div style="margin-top: 30px; font-size: 12px; color: #666;">
                            Stampato il: \${new Date().toLocaleString('it-IT')}
                        </div>
                        
                        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #4A90E2; color: white; border: none; cursor: pointer;">
                            🖨️ Stampa
                        </button>
                    </body>
                    </html>
                \`);
                printWindow.document.close();
            } catch (error) {
                showNotification('Errore stampa: ' + error.message, 'error');
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
        
        // Resend Welcome Email with Configuration Form
        async function resendWelcomeEmail(proformaId, proformaCode) {
            if (!confirm('Vuoi reinviare l\\'email di benvenuto con il link al form di configurazione?\\n\\nProforma: ' + proformaCode + '\\n\\nATTENZIONE: Se esiste già una configurazione, il form sarà pre-compilato con i dati esistenti.')) {
                return;
            }
            
            try {
                showNotification('Invio email di benvenuto in corso...', 'info');
                
                const res = await fetch(\`\${API_BASE}/proformas/\${proformaId}/resend-welcome-email\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await res.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Errore sconosciuto');
                }
                
                showNotification('Email di benvenuto reinviata con successo!', 'success');
                
                // Show config form URL in notification
                if (data.config_form_url) {
                    setTimeout(() => {
                        showNotification('Link form: ' + data.config_form_url, 'info');
                    }, 2000);
                }
            } catch (error) {
                console.error('Error resending welcome email:', error);
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
        
        // ========================================
        // CONFIGURATIONS MANAGEMENT FUNCTIONS
        // ========================================
        
        async function loadConfigurations() {
            try {
                const res = await fetch('/api/configurations');
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const configurations = data.configurations || [];
                
                if (configurations.length === 0) {
                    document.getElementById('configurations-list').innerHTML = \`
                        <div class="text-center py-12 text-gray-500">
                            <div class="text-6xl mb-4">📋</div>
                            <p class="text-lg">Nessuna configurazione presente</p>
                            <p class="text-sm mt-2">Clicca su "Nuova Configurazione" per iniziare</p>
                        </div>
                    \`;
                    return;
                }
                
                const html = \`
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assistito</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Piano</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Richiedente</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contatti Emergenza</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${configurations.map(config => \`
                                <tr>
                                    <td class="px-3 py-2">
                                        <div class="text-sm font-medium text-gray-900">\${config.nome || '-'} \${config.cognome || '-'}</div>
                                        <div class="text-xs text-gray-500">\${config.telefono || '-'}</div>
                                    </td>
                                    <td class="px-3 py-2">
                                        <span class="px-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            \${config.piano_servizio || 'N/A'}
                                        </span>
                                    </td>
                                    <td class="px-3 py-2">
                                        <div class="text-sm text-gray-900">\${config.nomeRichiedente || '-'} \${config.cognomeRichiedente || '-'}</div>
                                        <div class="text-xs text-gray-500">\${config.emailRichiedente || '-'}</div>
                                    </td>
                                    <td class="px-3 py-2 text-xs text-gray-600">
                                        \${config.contatto1_nome ? \`1: \${config.contatto1_nome} \${config.contatto1_cognome}<br>\` : ''}
                                        \${config.contatto2_nome ? \`2: \${config.contatto2_nome} \${config.contatto2_cognome}<br>\` : ''}
                                        \${config.contatto3_nome ? \`3: \${config.contatto3_nome} \${config.contatto3_cognome}\` : ''}
                                    </td>
                                    <td class="px-3 py-2 text-xs text-gray-500">\${formatDate(config.created_at)}</td>
                                    <td class="px-2 py-2">
                                        <div class="flex items-center space-x-1">
                                            <button onclick="viewConfiguration('\${config.id}')" class="action-icon text-blue-600 hover:text-blue-900" data-tooltip="Visualizza">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                </svg>
                                            </button>
                                            <button onclick="editConfiguration('\${config.id}')" class="action-icon text-amber-600 hover:text-amber-900" data-tooltip="Modifica">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                                </svg>
                                            </button>
                                            <button onclick="printConfiguration('\${config.id}')" class="action-icon text-green-600 hover:text-green-900" data-tooltip="Stampa PDF">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                                                </svg>
                                            </button>
                                            <button onclick="exportConfiguration('\${config.id}')" class="action-icon text-purple-600 hover:text-purple-900" data-tooltip="Esporta JSON">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                                                </svg>
                                            </button>
                                            <button onclick="deleteConfiguration('\${config.id}', '\${config.nome} \${config.cognome}')" class="action-icon text-red-600 hover:text-red-900" data-tooltip="Elimina">
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
                
                document.getElementById('configurations-list').innerHTML = html;
            } catch (error) {
                console.error('Error loading configurations:', error);
                showNotification('Errore caricamento configurazioni', 'error');
            }
        }
        
        async function viewConfiguration(configId) {
            try {
                const res = await fetch(\`/api/configurations/\${configId}\`);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const config = data.configuration;
                
                const html = \`
                    <div class="space-y-4">
                        <!-- Dati Assistito -->
                        <div class="border-b pb-3">
                            <h4 class="font-semibold mb-2 text-blue-700">👤 Dati Assistito</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div><strong>Nome:</strong> \${config.nome || '-'}</div>
                                <div><strong>Cognome:</strong> \${config.cognome || '-'}</div>
                                <div><strong>Data Nascita:</strong> \${config.data_nascita || '-'}</div>
                                <div><strong>Età:</strong> \${config.eta || '-'}</div>
                                <div><strong>Peso:</strong> \${config.peso || '-'} kg</div>
                                <div><strong>Altezza:</strong> \${config.altezza || '-'} cm</div>
                                <div><strong>Telefono:</strong> \${config.telefono || '-'}</div>
                                <div><strong>Email:</strong> \${config.email || '-'}</div>
                                <div class="col-span-2"><strong>Indirizzo:</strong> \${config.indirizzo || '-'}</div>
                            </div>
                        </div>
                        
                        <!-- Contatti Emergenza -->
                        <div class="border-b pb-3">
                            <h4 class="font-semibold mb-2 text-green-700">📞 Contatti di Emergenza</h4>
                            \${config.contatto1_nome ? \`
                                <div class="mb-2 p-2 bg-green-50 rounded">
                                    <strong>Contatto 1:</strong> \${config.contatto1_nome} \${config.contatto1_cognome}<br>
                                    <span class="text-sm">Tel: \${config.contatto1_telefono || '-'} | Email: \${config.contatto1_email || '-'}</span>
                                </div>
                            \` : ''}
                            \${config.contatto2_nome ? \`
                                <div class="mb-2 p-2 bg-green-50 rounded">
                                    <strong>Contatto 2:</strong> \${config.contatto2_nome} \${config.contatto2_cognome}<br>
                                    <span class="text-sm">Tel: \${config.contatto2_telefono || '-'} | Email: \${config.contatto2_email || '-'}</span>
                                </div>
                            \` : ''}
                            \${config.contatto3_nome ? \`
                                <div class="mb-2 p-2 bg-green-50 rounded">
                                    <strong>Contatto 3:</strong> \${config.contatto3_nome} \${config.contatto3_cognome}<br>
                                    <span class="text-sm">Tel: \${config.contatto3_telefono || '-'} | Email: \${config.contatto3_email || '-'}</span>
                                </div>
                            \` : ''}
                        </div>
                        
                        <!-- Info Mediche -->
                        <div class="border-b pb-3">
                            <h4 class="font-semibold mb-2 text-red-700">⚕️ Informazioni Mediche</h4>
                            <div class="text-sm space-y-2">
                                <div><strong>Patologie:</strong> \${config.patologie || 'Nessuna'}</div>
                                \${config.farmaci_nome ? \`
                                    <div>
                                        <strong>Farmaci:</strong> \${config.farmaci_nome}<br>
                                        <strong>Dosaggio:</strong> \${config.farmaci_dosaggio || '-'}<br>
                                        <strong>Orario:</strong> \${config.farmaci_orario || '-'}
                                    </div>
                                \` : ''}
                            </div>
                        </div>
                        
                        <!-- Note -->
                        \${config.note ? \`
                            <div>
                                <h4 class="font-semibold mb-2">📝 Note</h4>
                                <div class="text-sm bg-gray-50 p-2 rounded">\${config.note}</div>
                            </div>
                        \` : ''}
                        
                        <!-- Richiedente -->
                        <div class="bg-blue-50 p-3 rounded">
                            <h4 class="font-semibold mb-2">👨‍💼 Richiedente</h4>
                            <div class="text-sm">
                                <strong>\${config.nomeRichiedente} \${config.cognomeRichiedente}</strong><br>
                                Email: \${config.emailRichiedente || '-'} | Tel: \${config.telefonoRichiedente || '-'}
                            </div>
                        </div>
                    </div>
                \`;
                
                document.getElementById('view-configuration-content').innerHTML = html;
                document.getElementById('modal-view-configuration').classList.remove('hidden');
            } catch (error) {
                console.error('Error viewing configuration:', error);
                showNotification('Errore caricamento configurazione: ' + error.message, 'error');
            }
        }
        
        async function editConfiguration(configId) {
            try {
                const res = await fetch(\`/api/configurations/\${configId}\`);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const config = data.configuration;
                
                // Populate edit form
                document.getElementById('edit-config-id').value = config.id;
                document.getElementById('edit-config-lead-id').value = config.lead_id;
                document.getElementById('edit-config-nome').value = config.nome || '';
                document.getElementById('edit-config-cognome').value = config.cognome || '';
                document.getElementById('edit-config-data-nascita').value = config.data_nascita || '';
                document.getElementById('edit-config-eta').value = config.eta || '';
                document.getElementById('edit-config-telefono').value = config.telefono || '';
                document.getElementById('edit-config-email').value = config.email || '';
                document.getElementById('edit-config-indirizzo').value = config.indirizzo || '';
                document.getElementById('edit-config-contatto1-nome').value = config.contatto1_nome || '';
                document.getElementById('edit-config-contatto1-cognome').value = config.contatto1_cognome || '';
                document.getElementById('edit-config-contatto1-telefono').value = config.contatto1_telefono || '';
                document.getElementById('edit-config-contatto1-email').value = config.contatto1_email || '';
                document.getElementById('edit-config-contatto2-nome').value = config.contatto2_nome || '';
                document.getElementById('edit-config-contatto2-cognome').value = config.contatto2_cognome || '';
                document.getElementById('edit-config-contatto2-telefono').value = config.contatto2_telefono || '';
                document.getElementById('edit-config-contatto2-email').value = config.contatto2_email || '';
                document.getElementById('edit-config-contatto3-nome').value = config.contatto3_nome || '';
                document.getElementById('edit-config-contatto3-cognome').value = config.contatto3_cognome || '';
                document.getElementById('edit-config-contatto3-telefono').value = config.contatto3_telefono || '';
                document.getElementById('edit-config-contatto3-email').value = config.contatto3_email || '';
                document.getElementById('edit-config-patologie').value = config.patologie || '';
                document.getElementById('edit-config-farmaci-nome').value = config.farmaci_nome || '';
                document.getElementById('edit-config-farmaci-dosaggio').value = config.farmaci_dosaggio || '';
                document.getElementById('edit-config-farmaci-orario').value = config.farmaci_orario || '';
                document.getElementById('edit-config-note').value = config.note || '';
                
                document.getElementById('modal-edit-configuration').classList.remove('hidden');
            } catch (error) {
                console.error('Error loading configuration for edit:', error);
                showNotification('Errore caricamento configurazione: ' + error.message, 'error');
            }
        }
        
        async function saveConfigurationChanges() {
            const configId = document.getElementById('edit-config-id').value;
            const leadId = document.getElementById('edit-config-lead-id').value;
            
            const updatedData = {
                lead_id: leadId,
                piano_servizio: '', // Will be fetched from lead
                nome: document.getElementById('edit-config-nome').value,
                cognome: document.getElementById('edit-config-cognome').value,
                data_nascita: document.getElementById('edit-config-data-nascita').value,
                eta: document.getElementById('edit-config-eta').value,
                peso: '',
                altezza: '',
                telefono: document.getElementById('edit-config-telefono').value,
                email: document.getElementById('edit-config-email').value,
                indirizzo: document.getElementById('edit-config-indirizzo').value,
                contatto1_nome: document.getElementById('edit-config-contatto1-nome').value,
                contatto1_cognome: document.getElementById('edit-config-contatto1-cognome').value,
                contatto1_telefono: document.getElementById('edit-config-contatto1-telefono').value,
                contatto1_email: document.getElementById('edit-config-contatto1-email').value,
                contatto2_nome: document.getElementById('edit-config-contatto2-nome').value,
                contatto2_cognome: document.getElementById('edit-config-contatto2-cognome').value,
                contatto2_telefono: document.getElementById('edit-config-contatto2-telefono').value,
                contatto2_email: document.getElementById('edit-config-contatto2-email').value,
                contatto3_nome: document.getElementById('edit-config-contatto3-nome').value,
                contatto3_cognome: document.getElementById('edit-config-contatto3-cognome').value,
                contatto3_telefono: document.getElementById('edit-config-contatto3-telefono').value,
                contatto3_email: document.getElementById('edit-config-contatto3-email').value,
                patologie: document.getElementById('edit-config-patologie').value,
                farmaci_nome: document.getElementById('edit-config-farmaci-nome').value,
                farmaci_dosaggio: document.getElementById('edit-config-farmaci-dosaggio').value,
                farmaci_orario: document.getElementById('edit-config-farmaci-orario').value,
                note: document.getElementById('edit-config-note').value
            };
            
            try {
                const res = await fetch(\`/api/configurations/\${configId}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });
                
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                showNotification('Configurazione aggiornata con successo', 'success');
                closeModal('modal-edit-configuration');
                loadConfigurations();
            } catch (error) {
                console.error('Error saving configuration:', error);
                showNotification('Errore salvataggio configurazione: ' + error.message, 'error');
            }
        }
        
        async function deleteConfiguration(configId, name) {
            if (!confirm(\`Sei sicuro di voler eliminare la configurazione di \${name}?\\n\\nQuesta azione non può essere annullata.\`)) {
                return;
            }
            
            try {
                const res = await fetch(\`/api/configurations/\${configId}\`, {
                    method: 'DELETE'
                });
                
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                showNotification('Configurazione eliminata con successo', 'success');
                loadConfigurations();
            } catch (error) {
                console.error('Error deleting configuration:', error);
                showNotification('Errore eliminazione configurazione: ' + error.message, 'error');
            }
        }
        
        function printConfiguration(configId) {
            // Open PDF in new tab
            window.open(\`/api/configurations/\${configId}/pdf\`, '_blank');
        }
        
        async function exportConfiguration(configId) {
            try {
                const res = await fetch(\`/api/configurations/\${configId}\`);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                // Create JSON file and download
                const config = data.configuration;
                const jsonStr = JSON.stringify(config, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`configuration_\${config.nome}_\${config.cognome}_\${new Date().toISOString().split('T')[0]}.json\`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('Configurazione esportata con successo', 'success');
            } catch (error) {
                console.error('Error exporting configuration:', error);
                showNotification('Errore esportazione configurazione: ' + error.message, 'error');
            }
        }
        
        async function exportAllConfigurations() {
            try {
                const res = await fetch('/api/configurations');
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const jsonStr = JSON.stringify(data.configurations, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`configurazioni_export_\${new Date().toISOString().split('T')[0]}.json\`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification(\`Esportate \${data.configurations.length} configurazioni\`, 'success');
            } catch (error) {
                showNotification('Errore esportazione: ' + error.message, 'error');
            }
        }
        
        function showCreateConfigurationModal() {
            alert('Funzione creazione manuale configurazione non ancora implementata.\\nUsa il form di configurazione inviato via email.');
        }
        
        // ========================================
        // ASSISTITI MANAGEMENT FUNCTIONS
        // ========================================
        
        async function loadAssistiti() {
            const status = document.getElementById('filter-assistiti-status')?.value || '';
            const url = status ? \`/api/assistiti?status=\${status}\` : '/api/assistiti';
            
            try {
                const res = await fetch(url);
                const data = await res.json();
                
                if (!data.success) throw new Error(data.error);
                
                const assistiti = data.assistiti || [];
                
                if (assistiti.length === 0) {
                    document.getElementById('assistiti-list').innerHTML = '<div class="text-center py-12 text-gray-500"><div class="text-6xl mb-4">👨‍⚕️</div><p class="text-lg">Nessun assistito presente</p></div>';
                    return;
                }
                
                const html = \`
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Assistito</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Piano</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Dispositivo</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stato</th>
                                <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Attivazione</th>
                                <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            \${assistiti.map(ass => \`
                                <tr>
                                    <td class="px-3 py-2">
                                        <div class="text-sm font-medium text-gray-900">\${ass.nome} \${ass.cognome}</div>
                                        <div class="text-xs text-gray-500">ID: \${ass.id}</div>
                                    </td>
                                    <td class="px-3 py-2"><span class="px-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">\${ass.piano_servizio || 'N/A'}</span></td>
                                    <td class="px-3 py-2 text-xs">
                                        \${ass.dispositivo_imei ? \`<div>IMEI: \${ass.dispositivo_imei}</div><div class="text-gray-500">\${ass.dispositivo_seriale || ''}</div>\` : '<span class="text-gray-400">Non assegnato</span>'}
                                    </td>
                                    <td class="px-3 py-2"><span class="px-2 text-xs rounded-full \${ass.stato_servizio === 'ATTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">\${ass.stato_servizio}</span></td>
                                    <td class="px-3 py-2 text-xs">\${formatDate(ass.data_attivazione)}</td>
                                    <td class="px-2 py-2">
                                        <div class="flex items-center space-x-1">
                                            <button onclick="viewAssistito('\${ass.id}')" class="action-icon text-blue-600" data-tooltip="Visualizza">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </button>
                                            \${!ass.dispositivo_id ? \`<button onclick="showAssignDeviceModal('\${ass.id}')" class="action-icon text-green-600" data-tooltip="Assegna Dispositivo"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg></button>\` : ''}
                                            <button onclick="deleteAssistito('\${ass.id}', '\${ass.nome} \${ass.cognome}')" class="action-icon text-red-600" data-tooltip="Elimina">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            \`).join('')}
                        </tbody>
                    </table>
                \`;
                
                document.getElementById('assistiti-list').innerHTML = html;
            } catch (error) {
                console.error('Error loading assistiti:', error);
                showNotification('Errore caricamento assistiti', 'error');
            }
        }
        
        async function viewAssistito(assistitoId) {
            try {
                const res = await fetch(\`/api/assistiti/\${assistitoId}\`);
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
                const a = data.assistito;
                alert(\`ASSISTITO: \${a.nome} \${a.cognome}\\nPiano: \${a.piano_servizio}\\nStato: \${a.stato_servizio}\\nDispositivo: \${a.dispositivo_imei || 'Non assegnato'}\\nAttivazione: \${a.data_attivazione}\`);
            } catch (error) {
                showNotification('Errore: ' + error.message, 'error');
            }
        }
        
        async function showAssignDeviceModal(assistitoId) {
            try {
                const res = await fetch('/api/admin/devices?status=AVAILABLE');
                const data = await res.json();
                if (!data.success || !data.devices || data.devices.length === 0) {
                    alert('Nessun dispositivo disponibile. Carica prima i dispositivi.');
                    return;
                }
                const deviceId = prompt(\`Dispositivi disponibili:\\n\${data.devices.map((d, i) => \`\${i+1}. \${d.serial_number} (IMEI: \${d.imei})\`).join('\\n')}\\n\\nInserisci numero dispositivo:\`);
                if (!deviceId) return;
                const device = data.devices[parseInt(deviceId) - 1];
                if (!device) { alert('Dispositivo non valido'); return; }
                
                const assignRes = await fetch(\`/api/assistiti/\${assistitoId}/assign-device\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ device_id: device.id })
                });
                const assignData = await assignRes.json();
                if (!assignData.success) throw new Error(assignData.error);
                showNotification('Dispositivo assegnato con successo!', 'success');
                loadAssistiti();
            } catch (error) {
                showNotification('Errore: ' + error.message, 'error');
            }
        }
        
        async function deleteAssistito(id, name) {
            if (!confirm(\`Eliminare assistito \${name}?\`)) return;
            try {
                const res = await fetch(\`/api/assistiti/\${id}\`, { method: 'DELETE' });
                const data = await res.json();
                if (!data.success) throw new Error(data.error);
                showNotification('Assistito eliminato', 'success');
                loadAssistiti();
            } catch (error) {
                showNotification('Errore: ' + error.message, 'error');
            }
        }
        
        function showCreateAssistitoModal() {
            alert('Assistiti vengono creati automaticamente dalla compilazione del form configurazione.');
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
        
        function translateStatus(status, type = 'device') {
            const translations = {
                device: {
                    'AVAILABLE': 'Disponibile',
                    'TO_CONFIGURE': 'Da Configurare',
                    'ASSOCIATED': 'Associato',
                    'MAINTENANCE': 'In Manutenzione',
                    'RETIRED': 'Dismesso'
                },
                lead: {
                    'nuovo': 'Nuovo',
                    'CONTRACT_SENT': 'Contratto Inviato',
                    'CONTRACT_SIGNED': 'Contratto Firmato',
                    'PAYMENT_PENDING': 'Pagamento Attesa',
                    'ACTIVE': 'Attivo',
                    'CONFIGURED': 'Configurato',
                    'CONVERTITO': 'Convertito',
                    'DOCUMENTI_INVIATI': 'Documenti Inviati'
                },
                assistito: {
                    'ATTIVO': 'Attivo',
                    'SOSPESO': 'Sospeso',
                    'CESSATO': 'Cessato'
                }
            };
            return translations[type]?.[status] || status;
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
