// Auto-generated dashboard templates
// Generated from public/*.html files

export const home = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeleMedCare V12.0 - Dashboard Principale</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        .gradient-hero { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); }
        .card-hover { 
            transition: all 0.3s ease;
            cursor: pointer;
        }
        .card-hover:hover { 
            transform: translateY(-8px) scale(1.02); 
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .pulse-dot {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: .5; }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="gradient-hero text-white shadow-2xl">
        <div class="container mx-auto px-6 py-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="bg-white bg-opacity-20 backdrop-blur p-3 rounded-xl">
                        <i class="fas fa-heartbeat text-4xl"></i>
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold">TeleMedCare V12.0</h1>
                        <p class="text-blue-100">Sistema Modulare Multi-Dashboard</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="flex items-center bg-green-500 bg-opacity-30 px-4 py-2 rounded-full">
                        <span class="w-2 h-2 bg-green-400 rounded-full mr-2 pulse-dot"></span>
                        <span class="text-sm font-semibold">Sistema Online</span>
                    </span>
                    <div class="text-right">
                        <p class="text-sm font-medium">Medica GB S.r.l.</p>
                        <p class="text-xs text-blue-100">Milano - ISO 27001</p>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Stats -->
    <section class="container mx-auto px-6 py-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-blue-100 text-sm mb-1">Sistema</p>
                        <p class="text-3xl font-bold" id="systemVersion">V12.0</p>
                        <p class="text-xs text-blue-100 mt-1">Modular Enterprise</p>
                    </div>
                    <i class="fas fa-server text-4xl text-blue-200"></i>
                </div>
            </div>

            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-green-100 text-sm mb-1">Lead Oggi</p>
                        <p class="text-3xl font-bold" id="leadsToday">-</p>
                        <p class="text-xs text-green-100 mt-1">Ultimi 24h</p>
                    </div>
                    <i class="fas fa-users text-4xl text-green-200"></i>
                </div>
            </div>

            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-purple-100 text-sm mb-1">Contratti</p>
                        <p class="text-3xl font-bold" id="contractsTotal">-</p>
                        <p class="text-xs text-purple-100 mt-1">Totali generati</p>
                    </div>
                    <i class="fas fa-file-contract text-4xl text-purple-200"></i>
                </div>
            </div>

            <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-orange-100 text-sm mb-1">Uptime</p>
                        <p class="text-3xl font-bold">99.9%</p>
                        <p class="text-xs text-orange-100 mt-1">Disponibilità</p>
                    </div>
                    <i class="fas fa-chart-line text-4xl text-orange-200"></i>
                </div>
            </div>
        </div>

        <!-- Main Dashboard Cards -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-th-large text-blue-500 mr-3"></i>
                Dashboard Sistema
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Dashboard Operativa -->
                <a href="/dashboard" class="bg-white rounded-xl shadow-md card-hover overflow-hidden border-2 border-transparent hover:border-purple-400">
                    <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                        <div class="flex items-center justify-between mb-4">
                            <i class="fas fa-chart-line text-5xl"></i>
                            <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                                PRINCIPALE
                            </span>
                        </div>
                        <h3 class="text-2xl font-bold mb-2">Dashboard Operativa</h3>
                        <p class="text-purple-100 text-sm">Centro di controllo staff</p>
                    </div>
                    <div class="p-6">
                        <div class="space-y-3">
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                KPI e Metriche Real-time
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Grafici Servizi e Piani
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Ultimi Lead Ricevuti
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Auto-refresh 30s
                            </div>
                        </div>
                        <div class="mt-6">
                            <button class="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 rounded-lg transition-colors">
                                Accedi <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </a>

                <!-- Dashboard Leads -->
                <a href="/admin/leads-dashboard" class="bg-white rounded-xl shadow-md card-hover overflow-hidden border-2 border-transparent hover:border-green-400">
                    <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                        <div class="flex items-center justify-between mb-4">
                            <i class="fas fa-users text-5xl"></i>
                            <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                                LEADS
                            </span>
                        </div>
                        <h3 class="text-2xl font-bold mb-2">Dashboard Leads</h3>
                        <p class="text-green-100 text-sm">Analytics e conversioni</p>
                    </div>
                    <div class="p-6">
                        <div class="space-y-3">
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Tasso Conversione Lead
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Breakdown Servizi/Piani
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Statistiche per Canale
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Filtri Avanzati
                            </div>
                        </div>
                        <div class="mt-6">
                            <button class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors">
                                Accedi <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </a>

                <!-- Data Dashboard -->
                <a href="/admin/data-dashboard" class="bg-white rounded-xl shadow-md card-hover overflow-hidden border-2 border-transparent hover:border-blue-400">
                    <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
                        <div class="flex items-center justify-between mb-4">
                            <i class="fas fa-database text-5xl"></i>
                            <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                                ANALYTICS
                            </span>
                        </div>
                        <h3 class="text-2xl font-bold mb-2">Data Dashboard</h3>
                        <p class="text-blue-100 text-sm">KPI e Revenue aziendali</p>
                    </div>
                    <div class="p-6">
                        <div class="space-y-3">
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                5 KPI Principali
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Performance per Servizio
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Revenue Tracking
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Contratti Generati
                            </div>
                        </div>
                        <div class="mt-6">
                            <button class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors">
                                Accedi <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </a>

                <!-- Workflow Manager -->
                <a href="/admin/workflow-manager" class="bg-white rounded-xl shadow-md card-hover overflow-hidden border-2 border-transparent hover:border-red-400">
                    <div class="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                        <div class="flex items-center justify-between mb-4">
                            <i class="fas fa-diagram-project text-5xl"></i>
                            <span class="bg-white bg-opacity-20 px-3 py-1 rounded-full text-xs font-semibold">
                                WORKFLOW
                            </span>
                        </div>
                        <h3 class="text-2xl font-bold mb-2">Workflow Manager</h3>
                        <p class="text-red-100 text-sm">Gestione eventi manuali</p>
                    </div>
                    <div class="p-6">
                        <div class="space-y-3">
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Workflow Completo 6 Step
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Firma Contratto Manuale
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Pagamento Bonifico
                            </div>
                            <div class="flex items-center text-sm text-gray-600">
                                <i class="fas fa-check-circle text-green-500 mr-2"></i>
                                Monitoraggio Stato Lead
                            </div>
                        </div>
                        <div class="mt-6">
                            <button class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors">
                                Accedi <i class="fas fa-arrow-right ml-2"></i>
                            </button>
                        </div>
                    </div>
                </a>
            </div>
        </div>

        <!-- Servizi eCura -->
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-heartbeat text-red-500 mr-3"></i>
                Servizi eCura Disponibili
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- FAMILY -->
                <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-blue-600">eCura FAMILY</h3>
                        <i class="fas fa-home text-2xl text-blue-500"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">Senium CARE - Monitoraggio base per la famiglia</p>
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">BASE:</span>
                            <span class="font-bold text-green-600">€390/anno</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">AVANZATO:</span>
                            <span class="font-bold text-green-600">€690/anno</span>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">
                        <i class="fas fa-check mr-1"></i>Dispositivo Senium CARE<br>
                        <i class="fas fa-check mr-1"></i>Monitoraggio parametri vitali<br>
                        <i class="fas fa-check mr-1"></i>SIM e Piattaforma Web
                    </div>
                </div>

                <!-- PRO -->
                <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-purple-600">eCura PRO</h3>
                        <i class="fas fa-star text-2xl text-purple-500"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">SiDLY CARE PRO - Protezione avanzata con GPS</p>
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">BASE:</span>
                            <span class="font-bold text-green-600">€480/anno</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">AVANZATO:</span>
                            <span class="font-bold text-green-600">€840/anno</span>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">
                        <i class="fas fa-check mr-1"></i>SiDLY CARE PRO Classe IIa<br>
                        <i class="fas fa-check mr-1"></i>Rilevamento cadute + GPS<br>
                        <i class="fas fa-check mr-1"></i>Pulsante SOS geolocalizzato
                    </div>
                </div>

                <!-- PREMIUM -->
                <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-green-600">eCura PREMIUM</h3>
                        <i class="fas fa-crown text-2xl text-green-500"></i>
                    </div>
                    <p class="text-sm text-gray-600 mb-4">SiDLY VITAL CARE - Monitoraggio completo</p>
                    <div class="space-y-2 mb-4">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">BASE:</span>
                            <span class="font-bold text-green-600">€590/anno</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">AVANZATO:</span>
                            <span class="font-bold text-green-600">€990/anno</span>
                        </div>
                    </div>
                    <div class="text-xs text-gray-500">
                        <i class="fas fa-check mr-1"></i>SiDLY VITAL CARE Classe IIa<br>
                        <i class="fas fa-check mr-1"></i>Monitoraggio parametri completo<br>
                        <i class="fas fa-check mr-1"></i>Dashboard famiglia premium
                    </div>
                </div>
            </div>
        </div>

        <!-- System Info -->
        <div class="bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl shadow-lg p-8">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-2xl font-bold mb-4">Sistema Integrato</h3>
                    <div class="space-y-2">
                        <p class="flex items-center text-gray-300">
                            <i class="fas fa-check-circle text-green-400 mr-3"></i>
                            Template contratti con 19 placeholder
                        </p>
                        <p class="flex items-center text-gray-300">
                            <i class="fas fa-check-circle text-green-400 mr-3"></i>
                            Prezzi aggiornati da www.ecura.it
                        </p>
                        <p class="flex items-center text-gray-300">
                            <i class="fas fa-check-circle text-green-400 mr-3"></i>
                            Generazione PDF automatica
                        </p>
                        <p class="flex items-center text-gray-300">
                            <i class="fas fa-check-circle text-green-400 mr-3"></i>
                            Invio email con brochure
                        </p>
                        <p class="flex items-center text-gray-300">
                            <i class="fas fa-check-circle text-green-400 mr-3"></i>
                            Dashboard real-time integrate
                        </p>
                    </div>
                </div>
                <div>
                    <h3 class="text-2xl font-bold mb-4">Informazioni Sistema</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between border-b border-gray-700 pb-2">
                            <span class="text-gray-400">Versione:</span>
                            <span class="font-mono text-green-400">V12.0 Modular Enterprise</span>
                        </div>
                        <div class="flex justify-between border-b border-gray-700 pb-2">
                            <span class="text-gray-400">Ambiente:</span>
                            <span class="font-mono text-blue-400">Production Ready</span>
                        </div>
                        <div class="flex justify-between border-b border-gray-700 pb-2">
                            <span class="text-gray-400">Database:</span>
                            <span class="font-mono text-purple-400">Cloudflare D1</span>
                        </div>
                        <div class="flex justify-between border-b border-gray-700 pb-2">
                            <span class="text-gray-400">Email Service:</span>
                            <span class="font-mono text-yellow-400">Resend API</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-400">Deployment:</span>
                            <span class="font-mono text-red-400">Cloudflare Workers</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white py-8 mt-12">
        <div class="container mx-auto px-6 text-center">
            <p class="text-gray-400 mb-2">© 2025 Medica GB S.r.l. - Tutti i diritti riservati</p>
            <p class="text-sm text-gray-500">
                Corso Giuseppe Garibaldi, 34 – 20121 Milano | 
                <a href="mailto:info@medicagb.it" class="text-blue-400 hover:text-blue-300">info@medicagb.it</a> | 
                <a href="https://www.ecura.it" target="_blank" class="text-blue-400 hover:text-blue-300">www.ecura.it</a>
            </p>
        </div>
    </footer>

    <script>
        // Load stats on page load
        async function loadStats() {
            try {
                const response = await fetch('/api/data/stats');
                const stats = await response.json();
                
                if (stats.leadsToday !== undefined) {
                    document.getElementById('leadsToday').textContent = stats.leadsToday;
                }
                if (stats.totalContracts !== undefined) {
                    document.getElementById('contractsTotal').textContent = stats.totalContracts;
                }
            } catch (error) {
                console.log('Stats not yet available');
                document.getElementById('leadsToday').textContent = '0';
                document.getElementById('contractsTotal').textContent = '0';
            }
        }

        loadStats();
    </script>
</body>
</html>
`

export const dashboard = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Operativa - TeleMedCare V12.0</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .status-sent { background: #dcfce7; color: #16a34a; }
        .status-pending { background: #fef3c7; color: #ca8a04; }
        .status-error { background: #fee2e2; color: #dc2626; }
        .refresh-btn {
            animation: rotate 1s linear infinite;
            animation-play-state: paused;
        }
        .refresh-btn.rotating {
            animation-play-state: running;
        }
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="gradient-bg text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-chart-line text-3xl"></i>
                    <div>
                        <h1 class="text-2xl font-bold">Dashboard Operativa</h1>
                        <p class="text-purple-100">Centro di controllo staff - TeleMedCare V12.0</p>
                    </div>
                </div>
                <div class="flex space-x-4">
                    <a href="/" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-home mr-2"></i>Home
                    </a>
                    <a href="/admin/leads-dashboard" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-users mr-2"></i>Leads
                    </a>
                    <button onclick="refreshData()" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-sync-alt mr-2 refresh-btn" id="refreshIcon"></i>Aggiorna
                    </button>
                </div>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-6 py-8">
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-blue-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Lead Totali</p>
                        <p class="text-3xl font-bold text-blue-600" id="totalLeads">-</p>
                        <p class="text-xs text-gray-500 mt-1">Ultimi 30 giorni</p>
                    </div>
                    <i class="fas fa-users text-3xl text-blue-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-green-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Contratti Inviati</p>
                        <p class="text-3xl font-bold text-green-600" id="contractsSent">-</p>
                        <p class="text-xs text-gray-500 mt-1">Oggi</p>
                    </div>
                    <i class="fas fa-file-contract text-3xl text-green-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-purple-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Email Inviate</p>
                        <p class="text-3xl font-bold text-purple-600" id="emailsSent">-</p>
                        <p class="text-xs text-gray-500 mt-1">Ultimi 7 giorni</p>
                    </div>
                    <i class="fas fa-envelope text-3xl text-purple-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-orange-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Servizio Più Richiesto</p>
                        <p class="text-xl font-bold text-orange-600" id="topService">-</p>
                        <p class="text-xs text-gray-500 mt-1">Questo mese</p>
                    </div>
                    <i class="fas fa-star text-3xl text-orange-500"></i>
                </div>
            </div>
        </div>

        <!-- Servizi e Dispositivi -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Distribuzione Servizi -->
            <div class="bg-white p-6 rounded-xl shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-pie text-purple-500 mr-2"></i>
                    Distribuzione Servizi
                </h3>
                <div id="servicesChart" class="space-y-3">
                    <!-- Populated by JS -->
                </div>
            </div>

            <!-- Piano BASE vs AVANZATO -->
            <div class="bg-white p-6 rounded-xl shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-bar text-blue-500 mr-2"></i>
                    Piano BASE vs AVANZATO
                </h3>
                <div id="plansChart" class="space-y-3">
                    <!-- Populated by JS -->
                </div>
            </div>
        </div>

        <!-- Distribuzione per Canale -->
        <div class="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-network-wired text-orange-500 mr-2"></i>
                Distribuzione per Canale
            </h3>
            <div class="mb-4">
                <canvas id="channelsChartCanvas" style="max-height: 300px;"></canvas>
            </div>
            
            <!-- Pulsanti Import API -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                <button onclick="importFromExcel()" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-sm transition-colors">
                    <i class="fas fa-file-excel mr-2"></i> Import Excel
                </button>
                <button onclick="importFromIrbema()" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition-colors">
                    <i class="fas fa-building mr-2"></i> Import Irbema
                </button>
                <button onclick="importFromAON()" class="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm transition-colors">
                    <i class="fas fa-shield-alt mr-2"></i> Import AON
                </button>
                <button onclick="importFromDoubleYou()" class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded text-sm transition-colors">
                    <i class="fas fa-network-wired mr-2"></i> Import DoubleYou
                </button>
            </div>
        </div>

        <!-- Ultimi Lead Ricevuti -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-clock text-green-500 mr-2"></i>
                    Ultimi Lead Ricevuti
                </h3>
                <span class="text-sm text-gray-500" id="lastUpdate">Aggiornato ora</span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 text-sm font-semibold text-gray-600">Lead ID</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Cliente</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Servizio</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Piano</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Dispositivo</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Prezzo</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Contratto</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Data</th>
                        </tr>
                    </thead>
                    <tbody id="leadsTable">
                        <tr>
                            <td colspan="8" class="py-8 text-center text-gray-400">
                                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                <p>Caricamento dati...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        let refreshInterval;
        let isLoading = false;

        // Carica dati iniziali
        loadDashboardData();

        // Auto-refresh ogni 30 secondi (solo se non sta già caricando)
        refreshInterval = setInterval(() => {
            if (!isLoading) {
                loadDashboardData();
            }
        }, 30000);

        async function loadDashboardData() {
            // Previeni chiamate sovrapposte
            if (isLoading) return;
            
            isLoading = true;
            try {
                // Carica TUTTI i lead per statistiche accurate
                const allLeadsResponse = await fetch('/api/leads?limit=200');
                const allLeadsData = await allLeadsResponse.json();
                const allLeads = allLeadsData.leads || [];
                
                // Carica CONTRATTI reali per conteggio accurato
                const contractsResponse = await fetch('/api/contratti?limit=100');
                const contractsData = await contractsResponse.json();
                const contracts = contractsData.contratti || [];
                
                // Calcola statistiche reali
                const totalLeads = allLeads.length;
                const contratti = contracts.length; // Conta contratti reali, non lead convertiti
                const topService = 'eCura PRO';
                
                // Aggiorna KPI
                document.getElementById('totalLeads').textContent = totalLeads;
                document.getElementById('contractsSent').textContent = contratti;
                document.getElementById('emailsSent').textContent = '0'; // TODO
                document.getElementById('topService').textContent = topService;

                // Ultimi 10 lead per la tabella
                const leads = allLeads.slice(0, 10);

                // Popola tabella lead
                const tbody = document.getElementById('leadsTable');
                if (leads.length === 0) {
                    tbody.innerHTML = \`
                        <tr>
                            <td colspan="8" class="py-8 text-center text-gray-400">
                                Nessun lead trovato
                            </td>
                        </tr>
                    \`;
                } else {
                    tbody.innerHTML = leads.map(lead => {
                        const servizio = 'eCura PRO';
                        const piano = (lead.note && lead.note.includes('Piano: AVANZATO')) ? 'AVANZATO' : 'BASE';
                        const dispositivo = 'SiDLY CARE PRO';
                        const prezzo = piano === 'AVANZATO' ? '840' : '480';
                        const statusClass = (lead.vuoleBrochure === 'Si') ? 'status-sent' : 'status-pending';
                        const statusText = (lead.vuoleBrochure === 'Si') ? 'Inviata brochure' : 'Da contattare';
                        const date = new Date(lead.created_at).toLocaleString('it-IT', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return \`
                            <tr class="border-b border-gray-100 hover:bg-gray-50">
                                <td class="py-3 text-sm">
                                    <code class="bg-gray-100 px-2 py-1 rounded text-xs">\${lead.id}</code>
                                </td>
                                <td class="py-3 text-sm">
                                    <div class="font-medium">\${lead.nomeRichiedente || ''} \${lead.cognomeRichiedente || ''}</div>
                                    <div class="text-xs text-gray-500">\${lead.email || ''}</div>
                                </td>
                                <td class="py-3 text-sm font-medium text-purple-600">\${servizio}</td>
                                <td class="py-3 text-sm">\${piano}</td>
                                <td class="py-3 text-sm text-gray-600">\${dispositivo}</td>
                                <td class="py-3 text-sm font-bold text-green-600">€\${prezzo}</td>
                                <td class="py-3">
                                    <span class="status-badge \${statusClass}">\${statusText}</span>
                                </td>
                                <td class="py-3 text-xs text-gray-500">\${date}</td>
                            </tr>
                        \`;
                    }).join('');
                }

                // Salva tutti i lead per i grafici
                window.allLeadsData = allLeads;
                
                // Aggiorna grafici con tutti i lead
                updateServicesChart(allLeads);
                updatePlansChart(allLeads);
                updateChannelsChart(allLeads);

                // Aggiorna timestamp
                document.getElementById('lastUpdate').textContent = \`Aggiornato: \${new Date().toLocaleTimeString('it-IT')}\`;

            } catch (error) {
                console.error('Errore caricamento dashboard:', error);
                // Mostra dettagli errore per debugging
                const errorMsg = error.message || 'Errore sconosciuto';
                document.getElementById('leadsTable').innerHTML = \`
                    <tr>
                        <td colspan="8" class="py-8 text-center text-red-500">
                            <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                            <p class="font-bold">Errore nel caricamento dei dati</p>
                            <p class="text-xs mt-2">\${errorMsg}</p>
                            <button onclick="loadDashboardData()" class="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                <i class="fas fa-redo mr-2"></i>Riprova
                            </button>
                        </td>
                    </tr>
                \`;
            } finally {
                isLoading = false;
            }
        }

        function refreshData() {
            const icon = document.getElementById('refreshIcon');
            icon.classList.add('rotating');
            loadDashboardData().finally(() => {
                setTimeout(() => icon.classList.remove('rotating'), 1000);
            });
        }

        function getDispositivoForService(servizio) {
            const dispositivi = {
                'FAMILY': 'Senium CARE',
                'PRO': 'SiDLY CARE PRO',
                'PREMIUM': 'SiDLY VITAL CARE'
            };
            return dispositivi[servizio] || 'N/A';
        }

        function getPrezzoForService(servizio, piano) {
            const prezzi = {
                'FAMILY': { 'BASE': '390.00', 'AVANZATO': '690.00' },
                'PRO': { 'BASE': '480.00', 'AVANZATO': '840.00' },
                'PREMIUM': { 'BASE': '590.00', 'AVANZATO': '990.00' }
            };
            return prezzi[servizio]?.[piano] || '0.00';
        }

        function updateServicesChart(leads) {
            // Usa allLeads se disponibile, altrimenti leads
            const leadsToUse = window.allLeadsData || leads;
            const total = leadsToUse.length || 1;
            
            // TUTTI i 126 lead sono "eCura PRO"
            const serviceCounts = {
                'eCura PRO': total
            };

            const colors = {
                'eCura PRO': 'bg-purple-500',
                'eCura FAMILY': 'bg-blue-500',
                'eCura PREMIUM': 'bg-green-500'
            };

            const html = Object.entries(serviceCounts).map(([service, count]) => {
                const percentage = 100; // Sempre 100% per eCura PRO
                const color = colors[service] || 'bg-gray-500';
                return \`
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-sm font-medium text-gray-700">\${service}</span>
                            <span class="text-sm font-bold text-gray-900">\${count} (\${percentage}%)</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="\${color} h-2 rounded-full" style="width: \${percentage}%"></div>
                        </div>
                    </div>
                \`;
            }).join('');

            document.getElementById('servicesChart').innerHTML = html || '<p class="text-gray-400 text-sm">Nessun dato disponibile</p>';
        }

        function updatePlansChart(leads) {
            const leadsToUse = window.allLeadsData || leads;
            const planCounts = { 'BASE': 0, 'AVANZATO': 0 };
            
            // Conta i piani reali basati sul campo note
            leadsToUse.forEach(lead => {
                const isAvanzato = lead.note && lead.note.includes('Piano: AVANZATO');
                if (isAvanzato) {
                    planCounts.AVANZATO++;
                } else {
                    planCounts.BASE++;
                }
            });

            const total = leadsToUse.length || 1;
            const basePercentage = Math.round((planCounts.BASE / total) * 100);
            const avanzatoPercentage = Math.round((planCounts.AVANZATO / total) * 100);

            document.getElementById('plansChart').innerHTML = \`
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-medium text-gray-700">BASE</span>
                        <span class="text-sm font-bold text-gray-900">\${planCounts.BASE} (\${basePercentage}%)</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-500 h-2 rounded-full" style="width: \${basePercentage}%"></div>
                    </div>
                </div>
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-medium text-gray-700">AVANZATO</span>
                        <span class="text-sm font-bold text-gray-900">\${planCounts.AVANZATO} (\${avanzatoPercentage}%)</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-purple-500 h-2 rounded-full" style="width: \${avanzatoPercentage}%"></div>
                    </div>
                </div>
            \`;
        }

        function updateChannelsChart(leads) {
            const leadsToUse = window.allLeadsData || leads;
            const channelCounts = {};
            
            // Conta i lead per canale
            leadsToUse.forEach(lead => {
                let channel = 'Non specificato';
                
                // Cerca il canale nel campo canale o nelle note
                if (lead.canale && lead.canale.trim() !== '') {
                    channel = lead.canale;
                } else if (lead.note) {
                    // Cerca pattern comuni nelle note
                    if (lead.note.includes('Irbema') || lead.note.includes('IRBEMA')) {
                        channel = 'Irbema';
                    } else if (lead.note.includes('AON')) {
                        channel = 'AON';
                    } else if (lead.note.includes('Double You')) {
                        channel = 'Double You';
                    } else if (lead.note.includes('Excel')) {
                        channel = 'Excel Import';
                    }
                }
                
                channelCounts[channel] = (channelCounts[channel] || 0) + 1;
            });

            const total = leadsToUse.length || 1;
            const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500'];
            
            const html = Object.entries(channelCounts)
                .sort(([,a], [,b]) => b - a) // Ordina per count decrescente
                .map(([channel, count], index) => {
                    const percentage = Math.round((count / total) * 100);
                    const color = colors[index % colors.length];
                    return \`
                        <div class="p-4 border-2 border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-bold text-gray-800">\${channel}</span>
                                <i class="fas fa-chart-pie text-gray-400"></i>
                            </div>
                            <div class="text-2xl font-bold text-gray-900 mb-1">\${count}</div>
                            <div class="text-xs text-gray-500 mb-2">\${percentage}% del totale</div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="\${color} h-2 rounded-full" style="width: \${percentage}%"></div>
                            </div>
                        </div>
                    \`;
                }).join('');

            document.getElementById('channelsChart').innerHTML = html || '<p class="text-gray-400 text-sm col-span-3 text-center">Nessun dato disponibile</p>';
        }

        // Funzioni Import API (stub)
        function importFromExcel() {
            alert('🔄 Import da Excel\\n\\nFunzionalità in sviluppo.\\n\\nEndpoint: POST /api/import/excel\\n\\nQuesta funzionalità permetterà di importare lead da file Excel.');
        }

        function importFromIrbema() {
            alert('🔄 Import da Irbema\\n\\nFunzionalità in sviluppo.\\n\\nEndpoint: POST /api/import/irbema\\n\\nQuesta funzionalità permetterà di importare lead dal partner Irbema.');
        }

        function importFromAON() {
            alert('🔄 Import da AON\\n\\nFunzionalità in sviluppo.\\n\\nEndpoint: POST /api/import/aon\\n\\nQuesta funzionalità permetterà di importare lead dal partner AON.');
        }

        function importFromDoubleYou() {
            alert('🔄 Import da DoubleYou\\n\\nFunzionalità in sviluppo.\\n\\nEndpoint: POST /api/import/doubleyou\\n\\nQuesta funzionalità permetterà di importare lead dal partner DoubleYou.');
        }
    </script>
</body>
</html>
`

export const leads_dashboard = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Leads - TeleMedCare V12.0</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="gradient-bg text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-users text-3xl"></i>
                    <div>
                        <h1 class="text-2xl font-bold">Dashboard Leads Modulare</h1>
                        <p class="text-green-100">Aggregazione dati dai 6 moduli Leads specializzati</p>
                    </div>
                </div>
                <div class="flex space-x-4">
                    <button onclick="openNewLeadModal()" class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-plus mr-2"></i>Nuovo Lead
                    </button>
                    <a href="/" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-home mr-2"></i>Home
                    </a>
                    <a href="/dashboard" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-chart-line mr-2"></i>Dashboard
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-6 py-8">
        <!-- Statistiche Lead -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-blue-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Lead Totali</p>
                        <p class="text-3xl font-bold text-blue-600" id="totalLeads">-</p>
                        <p class="text-xs text-green-600 mt-1">
                            <i class="fas fa-arrow-up mr-1"></i>
                            <span id="leadsGrowth">+0%</span> vs mese scorso
                        </p>
                    </div>
                    <i class="fas fa-users text-3xl text-blue-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-green-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Tasso Conversione</p>
                        <p class="text-3xl font-bold text-green-600" id="conversionRate">-</p>
                        <p class="text-xs text-gray-500 mt-1">Lead → Contratto</p>
                    </div>
                    <i class="fas fa-percentage text-3xl text-green-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-purple-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Lead Oggi</p>
                        <p class="text-3xl font-bold text-purple-600" id="leadsToday">-</p>
                        <p class="text-xs text-gray-500 mt-1">Ultimi 24h</p>
                    </div>
                    <i class="fas fa-calendar-day text-3xl text-purple-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-orange-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Valore Totale</p>
                        <p class="text-3xl font-bold text-orange-600" id="totalValue">-</p>
                        <p class="text-xs text-gray-500 mt-1">Contratti attivi</p>
                    </div>
                    <i class="fas fa-euro-sign text-3xl text-orange-500"></i>
                </div>
            </div>
        </div>

        <!-- Grafici Distribuzione -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <!-- Servizi -->
            <div class="bg-white p-6 rounded-xl shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-pie text-blue-500 mr-2"></i>
                    Per Servizio
                </h3>
                <div id="servicesBreakdown" class="space-y-3">
                    <!-- Populated by JS -->
                </div>
            </div>

            <!-- Piani -->
            <div class="bg-white p-6 rounded-xl shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-layer-group text-green-500 mr-2"></i>
                    Per Piano
                </h3>
                <div id="plansBreakdown" class="space-y-3">
                    <!-- Populated by JS -->
                </div>
            </div>

            <!-- Canali -->
            <div class="bg-white p-6 rounded-xl shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-bullhorn text-purple-500 mr-2"></i>
                    Per Canale
                </h3>
                <div id="channelsBreakdown">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Website</span>
                            <span class="font-bold" id="channelWeb">-</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Email</span>
                            <span class="font-bold" id="channelEmail">-</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Telefono</span>
                            <span class="font-bold" id="channelPhone">-</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Partner</span>
                            <span class="font-bold" id="channelPartner">-</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Tabella Lead Dettagliata -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-table text-blue-500 mr-2"></i>
                    Tutti i Lead
                </h3>
                <div class="flex space-x-2">
                    <select id="filterServizio" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="applyFilters()">
                        <option value="">Tutti i Servizi</option>
                        <option value="FAMILY">FAMILY</option>
                        <option value="PRO">PRO</option>
                        <option value="PREMIUM">PREMIUM</option>
                    </select>
                    <select id="filterPiano" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="applyFilters()">
                        <option value="">Tutti i Piani</option>
                        <option value="BASE">BASE</option>
                        <option value="AVANZATO">AVANZATO</option>
                    </select>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 text-sm font-semibold text-gray-600">Lead ID</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Cliente</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Contatti</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Servizio</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Piano</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Prezzo Anno</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Contratto</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Brochure</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Data</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Azioni</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">CRUD</th>
                        </tr>
                    </thead>
                    <tbody id="leadsTableBody">
                        <tr>
                            <td colspan="11" class="py-8 text-center text-gray-400">
                                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                <p>Caricamento lead...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        let allLeads = [];

        // Carica dati
        loadLeadsData();

        async function loadLeadsData() {
            try {
                // Carica statistiche
                const statsResponse = await fetch('/api/data/stats');
                const stats = await statsResponse.json();

                document.getElementById('totalLeads').textContent = stats.totalLeads || '0';
                document.getElementById('conversionRate').textContent = stats.conversionRate || '0%';
                document.getElementById('leadsToday').textContent = stats.leadsToday || '0';
                document.getElementById('totalValue').textContent = stats.totalValue ? ('\u20AC' + stats.totalValue) : '\u20AC0';
                document.getElementById('leadsGrowth').textContent = stats.leadsGrowth || '+0%';

                // Carica lead
                const leadsResponse = await fetch('/api/leads?limit=200');
                const leadsData = await leadsResponse.json();
                allLeads = leadsData.leads || [];
                
                // Calcola statistiche reali
                const totalLeads = allLeads.length;
                const converted = allLeads.filter(l => l.status === 'CONTRACT_SIGNED' || l.status === 'CONVERTED').length;
                const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) + '%' : '0%';
                const totalValue = converted * 480; // BASE price assumption
                const today = new Date().toISOString().split('T')[0];
                const leadsToday = allLeads.filter(l => l.created_at && l.created_at.startsWith(today)).length;
                
                // Update KPIs
                document.getElementById('totalLeads').textContent = totalLeads;
                document.getElementById('conversionRate').textContent = conversionRate;
                document.getElementById('leadsToday').textContent = leadsToday;
                document.getElementById('totalValue').textContent = '\\u20AC' + totalValue;
                document.getElementById('leadsGrowth').textContent = '+0%'; // TODO

                // Aggiorna grafici
                updateServicesBreakdown(allLeads);
                updatePlansBreakdown(allLeads);
                updateChannelsBreakdown(allLeads);

                // Popola tabella
                renderLeadsTable(allLeads);

            } catch (error) {
                console.error('Errore caricamento leads:', error);
                document.getElementById('leadsTableBody').innerHTML = \`
                    <tr>
                        <td colspan="9" class="py-8 text-center text-red-500">
                            <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                            <p>Errore nel caricamento dei lead</p>
                        </td>
                    </tr>
                \`;
            }
        }

        function updateServicesBreakdown(leads) {
            const total = leads.length || 1;
            
            // TUTTI i lead sono eCura PRO
            const html = \`
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-medium">eCura PRO</span>
                        <span class="text-sm font-bold">\${total} (100%)</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-purple-500 h-2 rounded-full" style="width: 100%"></div>
                    </div>
                </div>
            \`;

            document.getElementById('servicesBreakdown').innerHTML = html;
        }

        function updatePlansBreakdown(leads) {
            const counts = { 'BASE': 0, 'AVANZATO': 0 };
            leads.forEach(l => {
                const note = l.note || '';
                const plan = note.includes('Piano: AVANZATO') ? 'AVANZATO' : 'BASE';
                counts[plan]++;
            });

            const total = leads.length || 1;
            const colors = { 'BASE': 'bg-blue-500', 'AVANZATO': 'bg-purple-500' };

            const html = Object.entries(counts).map(([plan, count]) => {
                const percentage = Math.round((count / total) * 100);
                return \`
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-sm font-medium">\${plan}</span>
                            <span class="text-sm font-bold">\${count} (\${percentage}%)</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="\${colors[plan]} h-2 rounded-full" style="width: \${percentage}%"></div>
                        </div>
                    </div>
                \`;
            }).join('');

            document.getElementById('plansBreakdown').innerHTML = html;
        }

        function updateChannelsBreakdown(leads) {
            const channels = {};
            leads.forEach(l => {
                const ch = l.fonte || l.canale || 'Non specificato';
                channels[ch] = (channels[ch] || 0) + 1;
            });
            
            // Mostra i canali reali
            document.getElementById('channelWeb').textContent = channels['EXCEL_IMPORT'] || 0;
            document.getElementById('channelEmail').textContent = channels['EMAIL'] || 0;
            document.getElementById('channelPhone').textContent = channels['TELEFONO'] || 0;
            document.getElementById('channelPartner').textContent = channels['CONTRATTO_PDF'] || 0;
        }

        function renderLeadsTable(leads) {
            const tbody = document.getElementById('leadsTableBody');
            
            if (leads.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="11" class="py-8 text-center text-gray-400">Nessun lead trovato</td>
                    </tr>
                \`;
                return;
            }

            tbody.innerHTML = leads.map(lead => {
                const piano = (lead.note && lead.note.includes('Piano: AVANZATO')) ? 'AVANZATO' : 'BASE';
                const prezzo = (piano === 'AVANZATO') ? '840' : '480';
                const date = new Date(lead.created_at).toLocaleDateString('it-IT');
                const hasContract = ['LEAD-CONTRATTO-001', 'LEAD-CONTRATTO-002', 'LEAD-CONTRATTO-003', 'LEAD-EXCEL-065'].includes(lead.id);
                
                return \`
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 text-xs">
                            <code class="bg-gray-100 px-2 py-1 rounded">\${(lead.id || '').substring(0, 20)}</code>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="font-medium">\${lead.nome || ''} \${lead.cognome || ''}</div>
                            <div class="text-xs text-gray-500">\${lead.email || ''}</div>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="text-xs text-gray-600">
                                <i class="fas fa-envelope text-gray-400 mr-1"></i>\${lead.email || '-'}
                            </div>
                            <div class="text-xs text-gray-600 mt-1">
                                <i class="fas fa-phone text-gray-400 mr-1"></i>\${lead.telefono || '-'}
                            </div>
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                eCura PRO
                            </span>
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                \${piano}
                            </span>
                        </td>
                        <td class="py-3 text-sm font-bold text-green-600">€\${prezzo}</td>
                        <td class="py-3">
                            <i class="fas fa-\${hasContract ? 'check-circle text-green-500' : 'times-circle text-gray-300'}"></i>
                        </td>
                        <td class="py-3">
                            <i class="fas fa-\${lead.vuoleBrochure === 'Si' ? 'check-circle text-green-500' : 'times-circle text-gray-300'}"></i>
                        </td>
                        <td class="py-3 text-xs text-gray-500">\${date}</td>
                        <td class="py-3">
                            <div class="flex space-x-1">
                                <button 
                                    onclick="sendContract('\${lead.id}', '\${piano}')" 
                                    class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                    title="Invia Contratto \${piano}">
                                    <i class="fas fa-file-contract"></i>
                                </button>
                                <button 
                                    onclick="sendBrochure('\${lead.id}')" 
                                    class="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                                    title="Invia Brochure">
                                    <i class="fas fa-book"></i>
                                </button>
                            </div>
                        </td>
                        <td class="py-3">
                            <div class="flex space-x-1">
                                <button onclick="viewLead('\${lead.id}')" 
                                        class="text-blue-600 hover:text-blue-800 px-1" 
                                        title="Visualizza">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="editLead('\${lead.id}')" 
                                        class="text-green-600 hover:text-green-800 px-1" 
                                        title="Modifica">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteLead('\${lead.id}')" 
                                        class="text-red-600 hover:text-red-800 px-1" 
                                        title="Elimina">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        function applyFilters() {
            const servizioFilter = document.getElementById('filterServizio').value;
            const pianoFilter = document.getElementById('filterPiano').value;

            const filtered = allLeads.filter(lead => {
                const matchServizio = !servizioFilter || lead.tipoServizio === servizioFilter;
                const matchPiano = !pianoFilter || '' === pianoFilter;
                return matchServizio && matchPiano;
            });

            renderLeadsTable(filtered);
        }

        function getPrezzoForService(servizio, piano) {
            const prezzi = {
                'FAMILY': { 'BASE': '390.00', 'AVANZATO': '690.00' },
                'PRO': { 'BASE': '480.00', 'AVANZATO': '840.00' },
                'PREMIUM': { 'BASE': '590.00', 'AVANZATO': '990.00' }
            };
            return prezzi[servizio]?.[piano] || '0.00';
        }

        // Funzioni per invio manuale documenti
        async function sendContract(leadId, piano) {
            if (!confirm(\`Generare e inviare contratto \${piano} al lead?\`)) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/send-contract\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipoContratto: piano })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(\`✅ Contratto inviato con successo!\\n\\nCodice: \${result.contractCode}\\nTemplate: email_invio_contratto\`);
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
                const response = await fetch(\`/api/leads/\${leadId}/send-brochure\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(\`✅ Brochure inviata con successo!\\nTemplate: email_invio_brochure\`);
                    loadLeadsData(); // Ricarica i dati
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }

        // ============================================
        // CRUD FUNCTIONS - VIEW, EDIT, DELETE LEAD
        // ============================================
        
        function viewLead(leadId) {
            const lead = allLeads.find(l => l.id === leadId);
            if (!lead) {
                alert('❌ Lead non trovato');
                return;
            }
            
            document.getElementById('viewLeadId').textContent = lead.id;
            document.getElementById('viewNome').textContent = lead.nome || '-';
            document.getElementById('viewCognome').textContent = lead.cognome || '-';
            document.getElementById('viewEmail').textContent = lead.email || '-';
            document.getElementById('viewTelefono').textContent = lead.telefono || '-';
            document.getElementById('viewServizio').textContent = lead.servizio || 'eCura PRO';
            document.getElementById('viewPiano').textContent = (lead.note && lead.note.includes('Piano: AVANZATO')) ? 'AVANZATO' : 'BASE';
            document.getElementById('viewNote').textContent = lead.note || '-';
            document.getElementById('viewData').textContent = new Date(lead.created_at).toLocaleDateString('it-IT');
            
            openModal('viewLeadModal');
        }
        
        function editLead(leadId) {
            const lead = allLeads.find(l => l.id === leadId);
            if (!lead) {
                alert('❌ Lead non trovato');
                return;
            }
            
            document.getElementById('editLeadId').value = lead.id;
            document.getElementById('editNome').value = lead.nome || '';
            document.getElementById('editCognome').value = lead.cognome || '';
            document.getElementById('editEmail').value = lead.email || '';
            document.getElementById('editTelefono').value = lead.telefono || '';
            
            const currentPiano = (lead.note && lead.note.includes('Piano: AVANZATO')) ? 'AVANZATO' : 'BASE';
            document.getElementById('editPiano').value = currentPiano;
            document.getElementById('editNote').value = lead.note || '';
            
            openModal('editLeadModal');
        }
        
        async function saveEditLead() {
            const leadId = document.getElementById('editLeadId').value;
            const formData = {
                nome: document.getElementById('editNome').value,
                cognome: document.getElementById('editCognome').value,
                email: document.getElementById('editEmail').value,
                telefono: document.getElementById('editTelefono').value,
                note: document.getElementById('editNote').value
            };
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Lead aggiornato con successo!');
                    closeModal('editLeadModal');
                    loadLeads();
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }
        
        async function deleteLead(leadId) {
            if (!confirm('⚠️ Sei sicuro di voler eliminare questo lead?\\n\\nQuesta operazione è irreversibile.')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}\`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Lead eliminato con successo!');
                    loadLeads();
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }
        
        function openModal(modalId) {
            document.getElementById(modalId).classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        
        function closeModal(modalId) {
            document.getElementById(modalId).classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        
        function openNewLeadModal() {
            // Reset form
            document.getElementById('newLeadForm').reset();
            openModal('newLeadModal');
        }
        
        async function saveNewLead() {
            const formData = {
                nome: document.getElementById('newNome').value,
                cognome: document.getElementById('newCognome').value,
                email: document.getElementById('newEmail').value,
                telefono: document.getElementById('newTelefono').value,
                servizio: 'eCura PRO',
                canaleAcquisizione: document.getElementById('newCanale').value,
                note: 'Piano: ' + document.getElementById('newPiano').value + '\\n' + document.getElementById('newNote').value
            };
            
            // Validation
            if (!formData.nome || !formData.cognome || !formData.email || !formData.telefono) {
                alert('⚠️ Compila tutti i campi obbligatori');
                return;
            }
            
            try {
                const response = await fetch('/api/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Lead creato con successo!\\n\\nID: ' + result.lead.id);
                    closeModal('newLeadModal');
                    loadLeads();
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }
    </script>

    <!-- MODAL: NEW LEAD -->
    <div id="newLeadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="gradient-bg text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h3 class="text-xl font-bold">➕ Nuovo Lead</h3>
                <button onclick="closeModal('newLeadModal')" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div class="p-6">
                <form id="newLeadForm">
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                            <input type="text" id="newNome" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                            <input type="text" id="newCognome" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input type="email" id="newEmail" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                            <input type="tel" id="newTelefono" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Canale Acquisizione *</label>
                            <select id="newCanale" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Seleziona canale...</option>
                                <option value="Excel">Excel Import</option>
                                <option value="Irbema">Irbema</option>
                                <option value="AON">AON</option>
                                <option value="DoubleYou">Double You</option>
                                <option value="Website">Website Diretto</option>
                                <option value="Partner">Partner Esterno</option>
                                <option value="Phone">Telefonico</option>
                                <option value="Email">Email Diretto</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Piano *</label>
                            <select id="newPiano" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="BASE">BASE - €480/anno</option>
                                <option value="AVANZATO">AVANZATO - €840/anno</option>
                            </select>
                        </div>
                        <div class="col-span-2">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                            <textarea id="newNote" rows="4" placeholder="Note aggiuntive sul lead..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                        </div>
                    </div>
                    <div class="mt-6 flex justify-end gap-3">
                        <button type="button" onclick="closeModal('newLeadModal')" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                            Annulla
                        </button>
                        <button type="button" onclick="saveNewLead()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                            ➕ Crea Lead
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL: VIEW LEAD -->
    <div id="viewLeadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="gradient-bg text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h3 class="text-xl font-bold">👤 Dettagli Lead</h3>
                <button onclick="closeModal('viewLeadModal')" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div class="p-6">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Lead ID</label>
                        <p id="viewLeadId" class="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Data Creazione</label>
                        <p id="viewData" class="text-gray-900 bg-gray-50 p-2 rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                        <p id="viewNome" class="text-gray-900 bg-gray-50 p-2 rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cognome</label>
                        <p id="viewCognome" class="text-gray-900 bg-gray-50 p-2 rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p id="viewEmail" class="text-gray-900 bg-gray-50 p-2 rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                        <p id="viewTelefono" class="text-gray-900 bg-gray-50 p-2 rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Servizio</label>
                        <p id="viewServizio" class="text-gray-900 bg-blue-50 p-2 rounded font-semibold">-</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Piano</label>
                        <p id="viewPiano" class="text-gray-900 bg-purple-50 p-2 rounded font-semibold">-</p>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                        <p id="viewNote" class="text-gray-900 bg-gray-50 p-3 rounded min-h-[80px]">-</p>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button onclick="closeModal('viewLeadModal')" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL: EDIT LEAD -->
    <div id="editLeadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="gradient-bg text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h3 class="text-xl font-bold">✏️ Modifica Lead</h3>
                <button onclick="closeModal('editLeadModal')" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div class="p-6">
                <input type="hidden" id="editLeadId">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input type="text" id="editNome" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                        <input type="text" id="editCognome" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" id="editEmail" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
                        <input type="tel" id="editTelefono" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Piano</label>
                        <select id="editPiano" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                            <option value="BASE">BASE - €480/anno</option>
                            <option value="AVANZATO">AVANZATO - €840/anno</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                        <textarea id="editNote" rows="4" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end gap-3">
                    <button onclick="closeModal('editLeadModal')" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                        Annulla
                    </button>
                    <button onclick="saveEditLead()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        💾 Salva Modifiche
                    </button>
                </div>
            </div>
        </div>
    </div>

</body>
</html>
`

export const data_dashboard = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Dashboard - TeleMedCare V12.0</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="gradient-bg text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-database text-3xl"></i>
                    <div>
                        <h1 class="text-2xl font-bold">Data Dashboard</h1>
                        <p class="text-blue-100">Centro dati completo con analytics e KPI aziendali</p>
                    </div>
                </div>
                <div class="flex space-x-4">
                    <button onclick="openNewContractModal()" class="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-plus mr-2"></i>Nuovo Contratto
                    </button>
                    <a href="/" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-home mr-2"></i>Home
                    </a>
                    <a href="/dashboard" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-chart-line mr-2"></i>Dashboard
                    </a>
                    <a href="/admin/leads-dashboard" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-users mr-2"></i>Leads
                    </a>
                </div>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-6 py-8">
        <!-- KPI Principali -->
        <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-blue-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Lead Totali</p>
                        <p class="text-3xl font-bold text-blue-600" id="kpiLeads">-</p>
                    </div>
                    <i class="fas fa-users text-3xl text-blue-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-green-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Contratti</p>
                        <p class="text-3xl font-bold text-green-600" id="kpiContracts">-</p>
                    </div>
                    <i class="fas fa-file-contract text-3xl text-green-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-purple-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Revenue YTD</p>
                        <p class="text-2xl font-bold text-purple-600" id="kpiRevenue">-</p>
                    </div>
                    <i class="fas fa-euro-sign text-3xl text-purple-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-orange-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Conv. Rate</p>
                        <p class="text-3xl font-bold text-orange-600" id="kpiConversion">-</p>
                    </div>
                    <i class="fas fa-percentage text-3xl text-orange-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-red-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">AOV</p>
                        <p class="text-2xl font-bold text-red-600" id="kpiAov">-</p>
                    </div>
                    <i class="fas fa-chart-line text-3xl text-red-500"></i>
                </div>
            </div>
        </div>

        <!-- Metriche Servizi -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-chart-bar text-blue-500 mr-2"></i>
                Performance per Servizio
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- FAMILY -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-blue-600">eCura FAMILY</h4>
                        <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Senium CARE</span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Lead:</span>
                            <span class="font-bold" id="familyLeads">-</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Contratti:</span>
                            <span class="font-bold" id="familyContracts">-</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Revenue:</span>
                            <span class="font-bold text-green-600" id="familyRevenue">-</span>
                        </div>
                        <div class="pt-2 border-t">
                            <div class="text-xs text-gray-500 mb-1">BASE vs AVANZATO</div>
                            <div class="flex gap-2">
                                <div class="flex-1 bg-blue-100 rounded px-2 py-1 text-center">
                                    <div class="text-xs text-gray-600">BASE</div>
                                    <div class="font-bold text-sm" id="familyBase">-</div>
                                </div>
                                <div class="flex-1 bg-purple-100 rounded px-2 py-1 text-center">
                                    <div class="text-xs text-gray-600">AVANZ.</div>
                                    <div class="font-bold text-sm" id="familyAvanzato">-</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PRO -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-purple-600">eCura PRO</h4>
                        <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">SiDLY CARE PRO</span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Lead:</span>
                            <span class="font-bold" id="proLeads">-</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Contratti:</span>
                            <span class="font-bold" id="proContracts">-</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Revenue:</span>
                            <span class="font-bold text-green-600" id="proRevenue">-</span>
                        </div>
                        <div class="pt-2 border-t">
                            <div class="text-xs text-gray-500 mb-1">BASE vs AVANZATO</div>
                            <div class="flex gap-2">
                                <div class="flex-1 bg-blue-100 rounded px-2 py-1 text-center">
                                    <div class="text-xs text-gray-600">BASE</div>
                                    <div class="font-bold text-sm" id="proBase">-</div>
                                </div>
                                <div class="flex-1 bg-purple-100 rounded px-2 py-1 text-center">
                                    <div class="text-xs text-gray-600">AVANZ.</div>
                                    <div class="font-bold text-sm" id="proAvanzato">-</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PREMIUM -->
                <div class="border border-gray-200 rounded-lg p-4">
                    <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-green-600">eCura PREMIUM</h4>
                        <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">SiDLY VITAL CARE</span>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Lead:</span>
                            <span class="font-bold" id="premiumLeads">-</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Contratti:</span>
                            <span class="font-bold" id="premiumContracts">-</span>
                        </div>
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Revenue:</span>
                            <span class="font-bold text-green-600" id="premiumRevenue">-</span>
                        </div>
                        <div class="pt-2 border-t">
                            <div class="text-xs text-gray-500 mb-1">BASE vs AVANZATO</div>
                            <div class="flex gap-2">
                                <div class="flex-1 bg-blue-100 rounded px-2 py-1 text-center">
                                    <div class="text-xs text-gray-600">BASE</div>
                                    <div class="font-bold text-sm" id="premiumBase">-</div>
                                </div>
                                <div class="flex-1 bg-purple-100 rounded px-2 py-1 text-center">
                                    <div class="text-xs text-gray-600">AVANZ.</div>
                                    <div class="font-bold text-sm" id="premiumAvanzato">-</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contratti Recenti -->
        <div class="bg-white rounded-xl shadow-sm p-6">
            <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-file-contract text-green-500 mr-2"></i>
                Ultimi Contratti Generati
            </h3>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 text-sm font-semibold text-gray-600">Codice</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Cliente</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Servizio</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Piano</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Dispositivo</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Valore</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Status</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Data</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">PDF</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="contractsTable">
                        <tr>
                            <td colspan="10" class="py-8 text-center text-gray-400">
                                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                <p>Caricamento contratti...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        let allContracts = [];
        loadDataDashboard();

        async function loadDataDashboard() {
            try {
                // Carica lead per calcolare statistiche reali
                const leadsResponse = await fetch('/api/leads?limit=200');
                if (!leadsResponse.ok) throw new Error('Errore caricamento leads');
                const leadsData = await leadsResponse.json();
                const leads = leadsData.leads || [];
                
                // Carica contratti REALI
                const contractsResponse = await fetch('/api/contratti?limit=100');
                if (!contractsResponse.ok) throw new Error('Errore caricamento contratti');
                const contractsData = await contractsResponse.json();
                const contracts = contractsData.contratti || [];
                allContracts = contracts; // Salva per uso nelle funzioni CRUD
                
                // Calcola statistiche REALI dai contratti
                const totalLeads = leads.length;
                const totalContracts = contracts.length;
                
                // Calcola revenue dai contratti reali
                let totalRevenue = 0;
                contracts.forEach(c => {
                    if (c.importo_annuo) totalRevenue += parseFloat(c.importo_annuo);
                });
                
                // Conta contratti firmati
                const signedContracts = contracts.filter(c => c.status === 'SIGNED').length;
                const conversionRate = totalLeads > 0 ? ((signedContracts / totalLeads) * 100).toFixed(2) + '%' : '0%';
                const averageOrderValue = totalContracts > 0 ? Math.round(totalRevenue / totalContracts) : 0;

                // Aggiorna KPI con dati reali
                document.getElementById('kpiLeads').textContent = totalLeads;
                document.getElementById('kpiContracts').textContent = totalContracts;
                document.getElementById('kpiRevenue').textContent = '\u20AC' + totalRevenue.toFixed(0);
                document.getElementById('kpiConversion').textContent = conversionRate;
                document.getElementById('kpiAov').textContent = '\u20AC' + averageOrderValue;

                // Analizza per servizio (TUTTI sono eCura PRO)
                const serviceData = analyzeByService(leads, contracts);
                updateServiceMetrics(serviceData);

                // Renderizza tabella contratti
                renderContractsTable(contracts, leads);

            } catch (error) {
                console.error('Errore caricamento data dashboard:', error);
                alert('⚠️ Errore caricamento Data Dashboard:\\n\\n' + error.message + '\\n\\nRicarica la pagina.');
            }
        }

        function analyzeByService(leads, contracts) {
            // Tutti i 126 lead sono eCura PRO
            const data = {
                FAMILY: { leads: 0, base: 0, avanzato: 0, contracts: 0, revenue: 0 },
                PRO: { leads: leads.length, base: 0, avanzato: 0, contracts: contracts.length, revenue: 0 },
                PREMIUM: { leads: 0, base: 0, avanzato: 0, contracts: 0, revenue: 0 }
            };

            // Calcola revenue e conta BASE vs AVANZATO dai CONTRATTI reali
            contracts.forEach(contract => {
                const isAvanzato = contract.piano === 'AVANZATO' || (contract.note && contract.note.includes('AVANZATO'));
                if (isAvanzato) {
                    data.PRO.avanzato++;
                } else {
                    data.PRO.base++;
                }
                
                // Somma revenue
                if (contract.importo_annuo) {
                    data.PRO.revenue += parseFloat(contract.importo_annuo);
                }
            });
            });

            return data;
        }

        function updateServiceMetrics(data) {
            // FAMILY
            document.getElementById('familyLeads').textContent = data.FAMILY.leads;
            document.getElementById('familyContracts').textContent = data.FAMILY.contracts;
            document.getElementById('familyRevenue').textContent = '\u20AC' + data.FAMILY.revenue;
            document.getElementById('familyBase').textContent = data.FAMILY.base;
            document.getElementById('familyAvanzato').textContent = data.FAMILY.avanzato;

            // PRO (TUTTI i 126 lead)
            document.getElementById('proLeads').textContent = data.PRO.leads;
            document.getElementById('proContracts').textContent = data.PRO.contracts;
            document.getElementById('proRevenue').textContent = '\u20AC' + data.PRO.revenue;
            document.getElementById('proBase').textContent = data.PRO.base;
            document.getElementById('proAvanzato').textContent = data.PRO.avanzato;

            // PREMIUM
            document.getElementById('premiumLeads').textContent = data.PREMIUM.leads;
            document.getElementById('premiumContracts').textContent = data.PREMIUM.contracts;
            document.getElementById('premiumRevenue').textContent = '\u20AC' + data.PREMIUM.revenue;
            document.getElementById('premiumBase').textContent = data.PREMIUM.base;
            document.getElementById('premiumAvanzato').textContent = data.PREMIUM.avanzato;
        }

        function renderContractsTable(contracts, leads) {
            const tbody = document.getElementById('contractsTable');
            
            if (contracts.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="10" class="py-8 text-center text-gray-400">Nessun contratto trovato</td>
                    </tr>
                \`;
                return;
            }

            tbody.innerHTML = contracts.map(contract => {
                // Determina il piano dal lead associato
                const lead = leads.find(l => l.id === contract.lead_id);
                const piano = (lead && lead.note && lead.note.includes('Piano: AVANZATO')) ? 'AVANZATO' : 'BASE';
                const prezzo = piano === 'AVANZATO' ? '840' : '480';
                const date = new Date(contract.created_at).toLocaleDateString('it-IT');
                
                return \`
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 text-xs">
                            <code class="bg-gray-100 px-2 py-1 rounded">\${contract.codice_contratto || contract.id}</code>
                        </td>
                        <td class="py-3 text-sm font-medium">
                            \${contract.cliente_nome || ''} \${contract.cliente_cognome || ''}
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                eCura PRO
                            </span>
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                \${piano}
                            </span>
                        </td>
                        <td class="py-3 text-sm text-gray-600">SiDLY CARE PRO</td>
                        <td class="py-3 text-sm font-bold text-green-600">
                            €\${prezzo} + IVA
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                                \${contract.status || 'SENT'}
                            </span>
                        </td>
                        <td class="py-3 text-xs text-gray-500">\${date}</td>
                        <td class="py-3">
                            <button onclick="viewContractPDF('\${contract.id}')" class="text-blue-600 hover:text-blue-800" title="Visualizza PDF">
                                <i class="fas fa-file-pdf text-lg"></i>
                            </button>
                        </td>
                        <td class="py-3">
                            <div class="flex space-x-2">
                                <button onclick="viewContract('\${contract.id}')" class="text-blue-600 hover:text-blue-800" title="Visualizza">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="editContract('\${contract.id}')" class="text-green-600 hover:text-green-800" title="Modifica">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="deleteContract('\${contract.id}')" class="text-red-600 hover:text-red-800" title="Elimina">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        function getDispositivoForService(servizio) {
            const dispositivi = {
                'FAMILY': 'Senium CARE',
                'PRO': 'SiDLY CARE PRO',
                'PREMIUM': 'SiDLY VITAL CARE'
            };
            return dispositivi[servizio] || 'N/A';
        }

        // ============================================
        // CRUD CONTRATTI + PDF VIEWER
        // ============================================
        
        let allContracts = [];
        
        async function viewContract(contractId) {
            const contract = allContracts.find(c => c.id === contractId);
            if (!contract) {
                alert('❌ Contratto non trovato');
                return;
            }
            
            alert(\`📄 CONTRATTO: \${contract.codice_contratto || contract.id}\\n\\n👤 Cliente: \${contract.cliente_nome || ''} \${contract.cliente_cognome || ''}\\n💰 Importo: €\${contract.importo_annuo || 'N/A'}\\n📅 Data: \${new Date(contract.created_at).toLocaleDateString('it-IT')}\\n📊 Status: \${contract.status || 'N/A'}\\n\`);
        }
        
        async function editContract(contractId) {
            alert('⚠️ Funzione Edit Contratto in sviluppo.\\n\\nPer ora puoi modificare i contratti tramite API:\nPUT /api/contratti/' + contractId);
        }
        
        async function deleteContract(contractId) {
            if (!confirm('⚠️ Sei sicuro di voler eliminare questo contratto?\\n\\nQuesta operazione è irreversibile.')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/contratti/\${contractId}\`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Contratto eliminato con successo!');
                    loadData();
                } else {
                    if (result.isSigned) {
                        alert('❌ Impossibile eliminare un contratto FIRMATO.\\n\\nPer motivi legali, i contratti firmati non possono essere eliminati.');
                    } else {
                        alert('❌ Errore: ' + result.error);
                    }
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }
        
        async function viewContractPDF(contractId) {
            const contract = allContracts.find(c => c.id === contractId);
            if (!contract) {
                alert('❌ Contratto non trovato');
                return;
            }
            
            // Cerca il PDF nella cartella public/contratti basandosi sul nome cliente
            const nomeCliente = (contract.cliente_nome + ' ' + contract.cliente_cognome).trim();
            
            // Elenca i PDF disponibili (questa lista dovrebbe essere dinamica)
            const pdfsDisponibili = [
                'Paolo Magri',
                'Elena Saglia',
                'Simona Pizzutto',
                'Caterina D\\'Alterio',
                'Gianni Paolo Pizzutto',
                'Manuela Poggi',
                'Rita Pennacchio',
                'Eileen King'
            ];
            
            const pdfMatch = pdfsDisponibili.find(pdf => 
                nomeCliente.toLowerCase().includes(pdf.toLowerCase()) || 
                pdf.toLowerCase().includes(nomeCliente.toLowerCase())
            );
            
            if (pdfMatch) {
                // Apri in nuova finestra
                window.open('/contratti/' + encodeURIComponent(pdfMatch) + '.pdf', '_blank');
            } else {
                alert('❌ PDF non trovato per: ' + nomeCliente + '\\n\\nPDF disponibili:\\n' + pdfsDisponibili.join('\\n'));
            }
        }

        // ============================================
        // CREATE CONTRATTO
        // ============================================
        
        function openNewContractModal() {
            document.getElementById('newContractForm').reset();
            document.getElementById('newContractModal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            // Carica lista lead per dropdown
            loadLeadsForContract();
        }
        
        function closeNewContractModal() {
            document.getElementById('newContractModal').classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        
        async function loadLeadsForContract() {
            try {
                const response = await fetch('/api/leads?limit=200');
                const data = await response.json();
                const leads = data.leads || [];
                
                const select = document.getElementById('newContractLeadId');
                select.innerHTML = '<option value="">Seleziona lead...</option>';
                
                leads.forEach(lead => {
                    const option = document.createElement('option');
                    option.value = lead.id;
                    option.textContent = \`\${lead.nome || ''} \${lead.cognome || ''} - \${lead.email || ''}\`;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Errore caricamento leads:', error);
            }
        }
        
        async function saveNewContract() {
            const leadId = document.getElementById('newContractLeadId').value;
            const piano = document.getElementById('newContractPiano').value;
            const note = document.getElementById('newContractNote').value;
            
            if (!leadId) {
                alert('⚠️ Seleziona un lead');
                return;
            }
            
            if (!piano) {
                alert('⚠️ Seleziona un piano');
                return;
            }
            
            // Calcola importo in base al piano
            const importo = piano === 'AVANZATO' ? 840 : 480;
            
            const contractData = {
                lead_id: leadId,
                piano: piano,
                importo_annuo: importo,
                status: 'DRAFT',
                note: note || 'Piano: ' + piano
            };
            
            try {
                const response = await fetch('/api/contratti', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(contractData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert(\`✅ Contratto creato con successo!\\n\\nCodice: \${result.contract.codice_contratto || result.contract.id}\\nImporto: €\${importo}/anno\\nPiano: \${piano}\`);
                    closeNewContractModal();
                    loadData(); // Ricarica la pagina
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }
    </script>

    <!-- MODAL: NEW CONTRACT -->
    <div id="newContractModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="gradient-bg text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h3 class="text-xl font-bold">➕ Nuovo Contratto</h3>
                <button onclick="closeNewContractModal()" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div class="p-6">
                <form id="newContractForm">
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Lead *</label>
                            <select id="newContractLeadId" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Caricamento...</option>
                            </select>
                            <p class="text-xs text-gray-500 mt-1">Seleziona il lead per cui creare il contratto</p>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Piano *</label>
                            <select id="newContractPiano" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                <option value="">Seleziona piano...</option>
                                <option value="BASE">BASE - €480/anno (€240 rinnovo)</option>
                                <option value="AVANZATO">AVANZATO - €840/anno (€600 rinnovo)</option>
                            </select>
                        </div>
                        
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 class="font-bold text-sm text-blue-800 mb-2">📋 Dettagli Piano</h4>
                            <div class="text-xs text-gray-700 space-y-1">
                                <p><strong>Servizio:</strong> eCura PRO</p>
                                <p><strong>Dispositivo:</strong> SiDLY CARE PRO (Classe IIa)</p>
                                <p><strong>Funzioni:</strong> Telemedicina avanzata + SOS</p>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Note</label>
                            <textarea id="newContractNote" rows="3" placeholder="Note aggiuntive sul contratto..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
                        </div>
                        
                        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p class="text-xs text-gray-700">
                                <i class="fas fa-info-circle text-yellow-600 mr-1"></i>
                                Il contratto sarà creato con status <strong>DRAFT</strong>. 
                                Dopo la creazione potrai inviarlo al cliente via email dalla Dashboard Leads.
                            </p>
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end gap-3">
                        <button type="button" onclick="closeNewContractModal()" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                            Annulla
                        </button>
                        <button type="button" onclick="saveNewContract()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                            ➕ Crea Contratto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

</body>
</html>
`

export const workflow_manager = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Manager - TeleMedCare V12.0</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .step-active { border-color: #10b981; background: #d1fae5; }
        .step-pending { border-color: #fbbf24; background: #fef3c7; }
        .step-completed { border-color: #3b82f6; background: #dbeafe; }
        .modal { display: none; }
        .modal.active { display: flex; }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="gradient-bg text-white shadow-lg">
        <div class="container mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <i class="fas fa-diagram-project text-3xl"></i>
                    <div>
                        <h1 class="text-2xl font-bold">Workflow Manager</h1>
                        <p class="text-red-100">Gestione completa ciclo Lead → Attivazione</p>
                    </div>
                </div>
                <div class="flex space-x-4">
                    <a href="/" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-home mr-2"></i>Home
                    </a>
                    <button onclick="refreshWorkflows()" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                        <i class="fas fa-sync-alt mr-2"></i>Aggiorna
                    </button>
                </div>
            </div>
        </div>
    </header>

    <div class="container mx-auto px-6 py-8">
        <!-- Workflow Steps Overview -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
                <i class="fas fa-sitemap text-red-500 mr-2"></i>
                Stati Workflow TeleMedCare
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div onclick="openArchive('leads')" class="border-2 border-blue-200 bg-blue-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-all">
                    <i class="fas fa-user-plus text-3xl text-blue-600 mb-2"></i>
                    <h4 class="font-bold text-sm text-gray-800">1. Lead</h4>
                    <p class="text-xs text-gray-600 mt-1">Acquisizione contatto</p>
                </div>
                <div onclick="openArchive('contratti')" class="border-2 border-green-200 bg-green-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-all">
                    <i class="fas fa-file-contract text-3xl text-green-600 mb-2"></i>
                    <h4 class="font-bold text-sm text-gray-800">2. Contratto</h4>
                    <p class="text-xs text-gray-600 mt-1">Generazione PDF</p>
                </div>
                <div onclick="openArchive('firme')" class="border-2 border-purple-200 bg-purple-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-all">
                    <i class="fas fa-signature text-3xl text-purple-600 mb-2"></i>
                    <h4 class="font-bold text-sm text-gray-800">3. Firma</h4>
                    <p class="text-xs text-gray-600 mt-1">Firma elettronica</p>
                </div>
                <div onclick="openArchive('proforma')" class="border-2 border-yellow-200 bg-yellow-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-all">
                    <i class="fas fa-file-invoice text-3xl text-yellow-600 mb-2"></i>
                    <h4 class="font-bold text-sm text-gray-800">4. Proforma</h4>
                    <p class="text-xs text-gray-600 mt-1">Generazione fattura</p>
                </div>
                <div onclick="openArchive('pagamenti')" class="border-2 border-orange-200 bg-orange-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-all">
                    <i class="fas fa-credit-card text-3xl text-orange-600 mb-2"></i>
                    <h4 class="font-bold text-sm text-gray-800">5. Pagamento</h4>
                    <p class="text-xs text-gray-600 mt-1">Conferma bonifico</p>
                </div>
                <div onclick="openArchive('attivi')" class="border-2 border-indigo-200 bg-indigo-50 p-4 rounded-lg text-center cursor-pointer hover:shadow-lg transition-all">
                    <i class="fas fa-check-circle text-3xl text-indigo-600 mb-2"></i>
                    <h4 class="font-bold text-sm text-gray-800">6. Attivazione</h4>
                    <p class="text-xs text-gray-600 mt-1">Servizio attivo</p>
                </div>
            </div>
        </div>

        <!-- Lead in Progress -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-tasks text-orange-500 mr-2"></i>
                    Lead in Lavorazione
                </h3>
                <div class="flex space-x-2">
                    <select id="filterStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="applyFilters()">
                        <option value="">Tutti gli stati</option>
                        <option value="NEW">Nuovo</option>
                        <option value="CONTRACT_SENT">Contratto Inviato</option>
                        <option value="CONTRACT_SIGNED">Contratto Firmato</option>
                        <option value="PROFORMA_SENT">Proforma Inviata</option>
                        <option value="PAID">Pagato</option>
                        <option value="ACTIVE">Attivo</option>
                    </select>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 text-sm font-semibold text-gray-600">Lead ID</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Cliente</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Telefono</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Servizio</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Stato</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Step Corrente</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Data</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="workflowTable">
                        <tr>
                            <td colspan="8" class="py-8 text-center text-gray-400">
                                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                <p>Caricamento workflow...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Manual Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Firma Manuale -->
            <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md p-6 border-2 border-purple-200">
                <h4 class="text-lg font-bold text-purple-800 mb-4 flex items-center">
                    <i class="fas fa-signature text-2xl mr-3"></i>
                    Firma Manuale Contratto
                </h4>
                <p class="text-sm text-gray-700 mb-4">
                    Usa questa funzione quando il contratto viene firmato manualmente (cartaceo) e vuoi registrarlo nel sistema.
                </p>
                <button onclick="openSignModal()" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors">
                    <i class="fas fa-pen mr-2"></i>Registra Firma Manuale
                </button>
            </div>

            <!-- Pagamento Manuale -->
            <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-md p-6 border-2 border-orange-200">
                <h4 class="text-lg font-bold text-orange-800 mb-4 flex items-center">
                    <i class="fas fa-money-check text-2xl mr-3"></i>
                    Pagamento Manuale Bonifico
                </h4>
                <p class="text-sm text-gray-700 mb-4">
                    Registra un pagamento ricevuto tramite bonifico bancario per procedere con l'attivazione del servizio.
                </p>
                <button onclick="openPaymentModal()" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors">
                    <i class="fas fa-university mr-2"></i>Registra Pagamento Bonifico
                </button>
            </div>
        </div>
    </div>

    <!-- Modal Firma Manuale -->
    <div id="signModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div class="bg-purple-600 text-white p-6 rounded-t-xl">
                <h3 class="text-xl font-bold flex items-center">
                    <i class="fas fa-signature mr-3"></i>
                    Registra Firma Manuale
                </h3>
            </div>
            <form id="signForm" class="p-6">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Lead/Contratto ID *</label>
                        <input type="text" id="signContractId" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            placeholder="LEAD_xxx o CTR_xxx">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Firma Digitale</label>
                        <input type="text" id="signDigital"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            placeholder="Nome Cognome (manuale)">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                        <textarea id="signNotes" rows="3"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            placeholder="Es: Contratto firmato in sede il gg/mm/aaaa"></textarea>
                    </div>
                </div>
                <div class="mt-6 flex space-x-3">
                    <button type="button" onclick="closeSignModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors">
                        Annulla
                    </button>
                    <button type="submit" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors">
                        <i class="fas fa-check mr-2"></i>Conferma
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Modal Pagamento Manuale -->
    <div id="paymentModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div class="bg-orange-600 text-white p-6 rounded-t-xl">
                <h3 class="text-xl font-bold flex items-center">
                    <i class="fas fa-money-check mr-3"></i>
                    Registra Pagamento Bonifico
                </h3>
            </div>
            <form id="paymentForm" class="p-6">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Proforma ID *</label>
                        <input type="text" id="paymentProformaId" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            placeholder="PRF_xxx">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Importo (€) *</label>
                        <input type="number" id="paymentAmount" required step="0.01"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            placeholder="480.00">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Transaction ID / CRO</label>
                        <input type="text" id="paymentTransactionId"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            placeholder="TRN123456 o CRO">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                        <textarea id="paymentNotes" rows="3"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                            placeholder="Es: Bonifico ricevuto il gg/mm/aaaa"></textarea>
                    </div>
                </div>
                <div class="mt-6 flex space-x-3">
                    <button type="button" onclick="closePaymentModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors">
                        Annulla
                    </button>
                    <button type="submit" class="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-colors">
                        <i class="fas fa-check mr-2"></i>Conferma
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let allLeads = [];
        let isLoading = false; // Previene chiamate multiple simultanee

        // Load workflows on page load
        loadWorkflows();

        async function loadWorkflows() {
            // Previeni chiamate multiple simultanee
            if (isLoading) {
                console.log('Caricamento già in corso, skip...');
                return;
            }
            
            isLoading = true;
            
            try {
                const response = await fetch('/api/leads?limit=100');
                const data = await response.json();
                allLeads = data.leads || [];
                renderWorkflowTable(allLeads);
            } catch (error) {
                console.error('Errore caricamento workflow:', error);
                document.getElementById('workflowTable').innerHTML = \`
                    <tr>
                        <td colspan="7" class="py-8 text-center text-red-500">
                            <i class="fas fa-exclamation-triangle text-3xl mb-2"></i>
                            <p>Errore nel caricamento dei workflow</p>
                        </td>
                    </tr>
                \`;
            } finally {
                isLoading = false;
            }
        }

        function renderWorkflowTable(leads) {
            const tbody = document.getElementById('workflowTable');
            
            if (leads.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="8" class="py-8 text-center text-gray-400">Nessun workflow in corso</td>
                    </tr>
                \`;
                return;
            }

            tbody.innerHTML = leads.map(lead => {
                const status = getWorkflowStatus(lead);
                const step = getWorkflowStep(lead);
                const date = new Date(lead.created_at).toLocaleString('it-IT');
                
                return \`
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 text-xs">
                            <code class="bg-gray-100 px-2 py-1 rounded">\${(lead.id || '').substring(0, 25)}</code>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="font-medium">\${lead.nome || ''} \${lead.cognome || ''}</div>
                            <div class="text-xs text-gray-500">\${lead.email || ''}</div>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="flex items-center text-gray-700">
                                <i class="fas fa-phone text-xs mr-1 text-gray-400"></i>
                                <span class="text-xs">\${lead.telefono || '-'}</span>
                            </div>
                        </td>
                        <td class="py-3 text-sm">
                            <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                \${lead.servizio || lead.tipoServizio || 'eCura PRO'}
                            </span>
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 \${status.class} text-xs rounded font-medium">
                                \${status.text}
                            </span>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="flex items-center">
                                <i class="\${step.icon} \${step.color} mr-2"></i>
                                <span class="text-xs">\${step.text}</span>
                            </div>
                        </td>
                        <td class="py-3 text-xs text-gray-500">\${date}</td>
                        <td class="py-3">
                            <div class="flex space-x-1">
                                <button onclick="quickAction('\${lead.id}', 'view')" 
                                    class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded" 
                                    title="Visualizza Dettagli">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="quickAction('\${lead.id}', 'contract')" 
                                    class="px-2 py-1 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded" 
                                    title="Registra Firma Contratto">
                                    <i class="fas fa-signature"></i>
                                </button>
                                <button onclick="quickAction('\${lead.id}', 'payment')" 
                                    class="px-2 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded" 
                                    title="Registra Pagamento">
                                    <i class="fas fa-euro-sign"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        function getWorkflowStatus(lead) {
            // Determina stato workflow
            if (lead.status === 'ACTIVE') {
                return { class: 'bg-green-100 text-green-700', text: 'ATTIVO' };
            } else if (lead.contratto_inviato) {
                return { class: 'bg-blue-100 text-blue-700', text: 'CONTRATTO INVIATO' };
            } else {
                return { class: 'bg-yellow-100 text-yellow-700', text: 'NUOVO' };
            }
        }

        function getWorkflowStep(lead) {
            // Determina step corrente
            if (lead.status === 'ACTIVE') {
                return { icon: 'fas fa-check-circle', color: 'text-green-600', text: '6. Attivato' };
            } else if (lead.payment_confirmed) {
                return { icon: 'fas fa-credit-card', color: 'text-orange-600', text: '5. Pagamento OK' };
            } else if (lead.proforma_sent) {
                return { icon: 'fas fa-file-invoice', color: 'text-yellow-600', text: '4. Proforma Inviata' };
            } else if (lead.contract_signed) {
                return { icon: 'fas fa-signature', color: 'text-purple-600', text: '3. Contratto Firmato' };
            } else if (lead.contratto_inviato) {
                return { icon: 'fas fa-file-contract', color: 'text-blue-600', text: '2. Contratto Inviato' };
            } else {
                return { icon: 'fas fa-user-plus', color: 'text-gray-600', text: '1. Lead Nuovo' };
            }
        }

        function applyFilters() {
            const statusFilter = document.getElementById('filterStatus').value;
            const filtered = allLeads.filter(lead => {
                if (!statusFilter) return true;
                return getWorkflowStatus(lead).text === statusFilter;
            });
            renderWorkflowTable(filtered);
        }

        function refreshWorkflows() {
            loadWorkflows();
        }

        function viewWorkflowDetails(leadId) {
            alert(\`Dettagli workflow per Lead: \${leadId}\n\nFunzionalità in sviluppo...\`);
        }

        // Open Archive - Click sui box workflow per aprire archivi completi
        async function openArchive(type) {
            try {
                let url = '';
                let title = '';
                
                switch(type) {
                    case 'leads':
                        url = '/api/leads?limit=1000';
                        title = '📋 ARCHIVIO COMPLETO LEADS';
                        break;
                    case 'contratti':
                        url = '/api/contratti?limit=1000';
                        title = '📄 ARCHIVIO COMPLETO CONTRATTI';
                        break;
                    case 'firme':
                        url = '/api/signatures?limit=1000';
                        title = '✍️ ARCHIVIO FIRME ELETTRONICHE';
                        break;
                    case 'proforma':
                        url = '/api/proforma?limit=1000';
                        title = '📋 ARCHIVIO PROFORMA/FATTURE';
                        break;
                    case 'pagamenti':
                        url = '/api/payments?limit=1000';
                        title = '💰 ARCHIVIO PAGAMENTI';
                        break;
                    case 'attivi':
                        url = '/api/leads?status=ACTIVE&limit=1000';
                        title = '✅ SERVIZI ATTIVI';
                        break;
                    default:
                        alert('⚠️ Archivio non riconosciuto');
                        return;
                }
                
                // Mostra loading
                const loadingMsg = alert(\`⏳ Caricamento \${title}...\\n\\nAttendi...\`);
                
                const response = await fetch(url);
                const data = await response.json();
                
                // Estrai l'array corretto in base al tipo
                let items = [];
                if (type === 'leads') items = data.leads || [];
                else if (type === 'contratti') items = data.contratti || [];
                else if (type === 'firme') items = data.signatures || [];
                else if (type === 'proforma') items = data.proforma || [];
                else if (type === 'pagamenti') items = data.payments || [];
                else if (type === 'attivi') items = data.leads || [];
                
                // Crea messaggio riepilogo
                let message = \`\${title}\\n\\nTotale: \${items.length} record\\n\\n\`;
                
                if (items.length === 0) {
                    message += 'Nessun record trovato.';
                } else if (items.length <= 10) {
                    // Mostra tutti i record se <= 10
                    items.forEach((item, idx) => {
                        if (type === 'leads') {
                            message += \`\${idx+1}. \${item.nome || ''} \${item.cognome || ''} - \${item.email || 'N/A'}\\n\`;
                        } else if (type === 'contratti') {
                            message += \`\${idx+1}. \${item.codice_contratto || item.id} - \${item.cliente_nome || ''} \${item.cliente_cognome || ''}\\n\`;
                        } else if (type === 'firme') {
                            message += \`\${idx+1}. Firma \${item.id} - Contratto: \${item.contract_id}\\n\`;
                        } else if (type === 'proforma') {
                            message += \`\${idx+1}. Proforma \${item.numero || item.id} - €\${item.importo || '0'}\\n\`;
                        } else if (type === 'pagamenti') {
                            message += \`\${idx+1}. Pagamento \${item.id} - €\${item.importo || '0'} - \${item.metodo_pagamento || 'N/A'}\\n\`;
                        } else {
                            message += \`\${idx+1}. \${item.nome || ''} \${item.cognome || ''} - ATTIVO\\n\`;
                        }
                    });
                } else {
                    // Mostra solo primi 10 + conteggio
                    message += 'Primi 10 record:\\n\\n';
                    items.slice(0, 10).forEach((item, idx) => {
                        if (type === 'leads' || type === 'attivi') {
                            message += \`\${idx+1}. \${item.nome || ''} \${item.cognome || ''}\\n\`;
                        } else if (type === 'contratti') {
                            message += \`\${idx+1}. \${item.cliente_nome || ''} \${item.cliente_cognome || ''}\\n\`;
                        } else {
                            message += \`\${idx+1}. ID: \${item.id}\\n\`;
                        }
                    });
                    message += \`\\n... e altri \${items.length - 10} record.\\n\`;
                    message += \`\\n💡 Per visualizzare tutti i dati, vai alla dashboard specifica o usa l'API.\`;
                }
                
                alert(message);
                
            } catch (error) {
                console.error('Errore apertura archivio:', error);
                alert('❌ Errore nel caricamento dell\\'archivio.\\n\\n' + error.message);
            }
        }

        // Quick Actions per ogni riga della tabella
        function quickAction(leadId, action) {
            const lead = allLeads.find(l => l.id === leadId);
            if (!lead) {
                alert('❌ Lead non trovato');
                return;
            }
            
            switch(action) {
                case 'view':
                    // Mostra dettagli completi del lead
                    const piano = (lead.note && lead.note.includes('Piano: AVANZATO')) ? 'AVANZATO' : 'BASE';
                    const prezzo = piano === 'AVANZATO' ? '€840' : '€480';
                    alert(\`👤 LEAD: \${lead.nome || ''} \${lead.cognome || ''}
                    
📧 Email: \${lead.email || 'N/A'}
📞 Telefono: \${lead.telefono || 'N/A'}
🏥 Servizio: \${lead.servizio || 'eCura PRO'}
📋 Piano: \${piano} (\${prezzo}/anno)
📅 Creato: \${new Date(lead.created_at).toLocaleDateString('it-IT')}
📍 Stato: \${getWorkflowStatus(lead).text}
🔄 Step: \${getWorkflowStep(lead).text}
                    
📝 Note: \${lead.note || 'Nessuna nota'}\`);
                    break;
                    
                case 'contract':
                    // Pre-compila modale firma contratto
                    if (confirm(\`📝 Vuoi registrare la firma del contratto per:\\n\\n👤 \${lead.nome || ''} \${lead.cognome || ''}\\n📧 \${lead.email || ''}\\n\\n✅ Procedi?\`)) {
                        document.getElementById('signContractId').value = lead.id;
                        document.getElementById('signDigital').value = \`\${lead.nome || ''} \${lead.cognome || ''}\`;
                        openSignModal();
                    }
                    break;
                    
                case 'payment':
                    // Pre-compila modale pagamento
                    if (confirm(\`💰 Vuoi registrare il pagamento per:\\n\\n👤 \${lead.nome || ''} \${lead.cognome || ''}\\n📧 \${lead.email || ''}\\n\\n✅ Procedi?\`)) {
                        // Cerca proforma associata al lead
                        fetch(\`/api/proforma?lead_id=\${lead.id}\`)
                            .then(res => res.json())
                            .then(data => {
                                if (data.proforma && data.proforma.length > 0) {
                                    const proforma = data.proforma[0];
                                    document.getElementById('paymentProformaId').value = proforma.id;
                                    document.getElementById('paymentAmount').value = proforma.importo;
                                    openPaymentModal();
                                } else {
                                    alert('⚠️ Nessuna proforma trovata per questo lead.\\n\\nCrea prima una proforma tramite la dashboard contratti.');
                                }
                            })
                            .catch(err => {
                                console.error('Errore caricamento proforma:', err);
                                alert('❌ Errore nel caricamento della proforma.\\n\\nInserisci manualmente i dati.');
                                openPaymentModal();
                            });
                    }
                    break;
                    
                default:
                    alert('⚠️ Azione non riconosciuta');
            }
        }

        // Modal functions
        function openSignModal() {
            document.getElementById('signModal').classList.add('active');
        }

        function closeSignModal() {
            document.getElementById('signModal').classList.remove('active');
            document.getElementById('signForm').reset();
        }

        function openPaymentModal() {
            document.getElementById('paymentModal').classList.add('active');
        }

        function closePaymentModal() {
            document.getElementById('paymentModal').classList.remove('active');
            document.getElementById('paymentForm').reset();
        }

        // Form submissions (usa once: true per evitare listener multipli)
        const signForm = document.getElementById('signForm');
        if (signForm && !signForm.dataset.listenerAdded) {
            signForm.dataset.listenerAdded = 'true';
            signForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const contractId = document.getElementById('signContractId').value;
                const firmaDigitale = document.getElementById('signDigital').value || 'Firma Manuale';
                const notes = document.getElementById('signNotes').value;
                
                try {
                    const response = await fetch('/api/contracts/sign', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contractId,
                            firmaDigitale: firmaDigitale + (notes ? \` - \${notes}\` : ''),
                            ipAddress: 'MANUAL_SIGNATURE',
                            userAgent: 'Workflow Manager Dashboard'
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        alert('✅ Firma registrata con successo!\n\nProforma generata e inviata.');
                        closeSignModal();
                        refreshWorkflows();
                    } else {
                        alert('❌ Errore: ' + result.error);
                    }
                } catch (error) {
                    alert('❌ Errore di comunicazione: ' + error.message);
                }
            });
        }

        const paymentForm = document.getElementById('paymentForm');
        if (paymentForm && !paymentForm.dataset.listenerAdded) {
            paymentForm.dataset.listenerAdded = 'true';
            paymentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const proformaId = document.getElementById('paymentProformaId').value;
            const importo = parseFloat(document.getElementById('paymentAmount').value);
            const transactionId = document.getElementById('paymentTransactionId').value || 'MANUAL_PAYMENT';
            const notes = document.getElementById('paymentNotes').value;
            
            try {
                const response = await fetch('/api/payments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        proformaId,
                        importo,
                        metodoPagamento: 'bonifico_bancario',
                        transactionId: transactionId + (notes ? \` - \${notes}\` : ''),
                        manual: true
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Pagamento registrato con successo!\n\nProcedura di attivazione avviata.');
                    closePaymentModal();
                    refreshWorkflows();
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        });
        }
    </script>
</body>
</html>
`

