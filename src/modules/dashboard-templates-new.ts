// Auto-generated dashboard templates
// Generated from public/*.html files

// Import auto-import script for HubSpot incremental sync
import { autoImportScript } from './auto-import-script'

export const home = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <!-- Version: 2025-12-29-teal-fix -->
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
        .icon-bounce:hover {
            animation: bounce 0.5s;
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
        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <!-- Lead Oggi -->
            <div class="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-green-100 text-sm mb-1">Lead Oggi</p>
                        <p class="text-3xl font-bold" id="leadsToday">-</p>
                        <p class="text-xs text-green-100 mt-1">Ultime 24h</p>
                    </div>
                    <i class="fas fa-users text-4xl text-green-200"></i>
                </div>
            </div>

            <!-- Contratti Oggi -->
            <div class="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-purple-100 text-sm mb-1">Contratti Oggi</p>
                        <p class="text-3xl font-bold" id="contractsToday">-</p>
                        <p class="text-xs text-purple-100 mt-1">Ultime 24h</p>
                    </div>
                    <i class="fas fa-file-contract text-4xl text-purple-200"></i>
                </div>
            </div>

            <!-- Proforma Oggi -->
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-blue-100 text-sm mb-1">Proforma Oggi</p>
                        <p class="text-3xl font-bold" id="proformaToday">-</p>
                        <p class="text-xs text-blue-100 mt-1">Ultime 24h</p>
                    </div>
                    <i class="fas fa-file-invoice text-4xl text-blue-200"></i>
                </div>
            </div>

            <!-- Pagamenti Oggi -->
            <div class="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-white text-sm mb-1">Pagamenti Oggi</p>
                        <p class="text-3xl font-bold" id="paymentsToday">-</p>
                        <p class="text-xs text-white mt-1">Ultime 24h</p>
                    </div>
                    <i class="fas fa-euro-sign text-4xl text-white opacity-80"></i>
                </div>
            </div>

            <!-- Configurazioni Oggi -->
            <div id="boxConfigurazioni" style="background: linear-gradient(135deg, #ea580c 0%, #dc2626 100%) !important;" class="text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p style="color: white !important; white-space: nowrap;" class="text-xs mb-1 font-semibold">Configurazioni Oggi</p>
                        <p style="color: white !important;" class="text-3xl font-bold" id="configurationsToday">0</p>
                        <p style="color: white !important;" class="text-xs mt-1 font-medium">Ultime 24h</p>
                    </div>
                    <i style="color: white !important;" class="fas fa-cog text-4xl"></i>
                </div>
            </div>

            <!-- Attivazioni Oggi -->
            <div class="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-pink-100 text-sm mb-1">Attivazioni Oggi</p>
                        <p class="text-3xl font-bold" id="activationsToday">-</p>
                        <p class="text-xs text-pink-100 mt-1">Ultime 24h</p>
                    </div>
                    <i class="fas fa-power-off text-4xl text-pink-200"></i>
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
                        <h3 class="text-xl font-bold mb-2">Dashboard Operativa</h3>
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
                    <p class="text-sm text-gray-600 mb-4">Monitoraggio base per la famiglia</p>
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
                        <i class="fas fa-check mr-1"></i>Dispositivo SiDLY CARE<br>
                        <i class="fas fa-check mr-1"></i>incluso SIM e APP per 12 mesi
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

    <!-- Archivi e Documentazione -->
    <div class="container mx-auto px-6 mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
            <i class="fas fa-archive mr-2 text-amber-600"></i>
            Archivi e Documentazione
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            <!-- Contratti e Proforma Personalizzati -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-4xl text-amber-500 mb-3 icon-bounce">
                        <i class="fas fa-file-contract"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-2">Contratti & Proforma</h3>
                    <p class="text-gray-600 text-sm mb-4">Archivio contratti personalizzati e proforma</p>
                    <a href="/admin/contracts" class="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded text-sm transition-colors">
                        <i class="fas fa-folder-open mr-1"></i>Gestisci
                    </a>
                </div>
            </div>

            <!-- Contratti Firmati -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-4xl text-emerald-500 mb-3 icon-bounce">
                        <i class="fas fa-file-signature"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-2">Contratti Firmati</h3>
                    <p class="text-gray-600 text-sm mb-4">Archivio contratti definitivi firmati</p>
                    <a href="/admin/signed-contracts" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm transition-colors">
                        <i class="fas fa-certificate mr-1"></i>Visualizza
                    </a>
                </div>
            </div>

            <!-- Documentazione -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-4xl text-indigo-500 mb-3 icon-bounce">
                        <i class="fas fa-book"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-2">Documentazione</h3>
                    <p class="text-gray-600 text-sm mb-4">Lettura e modifica documentazione sistema</p>
                    <a href="/admin/docs" class="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded text-sm transition-colors">
                        <i class="fas fa-edit mr-1"></i>Modifica
                    </a>
                </div>
            </div>

            <!-- Template Manager -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-4xl text-pink-500 mb-3 icon-bounce">
                        <i class="fas fa-layer-group"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-2">Template Manager</h3>
                    <p class="text-gray-600 text-sm mb-4">Gestione template email e documenti</p>
                    <a href="/template-system" class="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded text-sm transition-colors">
                        <i class="fas fa-palette mr-1"></i>Gestisci
                    </a>
                </div>
            </div>

            <!-- Magazzino DM -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-4xl text-teal-500 mb-3 icon-bounce">
                        <i class="fas fa-warehouse"></i>
                    </div>
                    <h3 class="text-lg font-bold text-gray-800 mb-2">Magazzino DM</h3>
                    <p class="text-gray-600 text-sm mb-4">Gestione completa dispositivi medici e inventario</p>
                    <a href="/admin/warehouse" class="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm transition-colors">
                        <i class="fas fa-boxes mr-1"></i>Gestisci
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Testing e Sviluppo -->
    <div class="container mx-auto px-6 mb-12">
        <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
            <i class="fas fa-flask mr-2 text-red-600"></i>
            Testing e Sviluppo
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Testing Dashboard -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-5xl text-red-500 mb-4 icon-bounce">
                        <i class="fas fa-bug"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Testing Dashboard</h3>
                    <p class="text-gray-600 mb-4">Test funzionali e stress test automatizzati</p>
                    <a href="/admin/testing-dashboard" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-play mr-2"></i>Avvia Test
                    </a>
                </div>
            </div>

            <!-- Email Testing -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-5xl text-orange-500 mb-4 icon-bounce">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Email Testing</h3>
                    <p class="text-gray-600 mb-4">Test template email e invio messaggi</p>
                    <a href="/email-test" class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-paper-plane mr-2"></i>Test Email
                    </a>
                </div>
            </div>

            <!-- Contract Testing -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-5xl text-teal-500 mb-4 icon-bounce">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Contract Testing</h3>
                    <p class="text-gray-600 mb-4">Test generazione contratti PDF</p>
                    <a href="/contract-test" class="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-file-alt mr-2"></i>Test PDF
                    </a>
                </div>
            </div>
        </div>
    </div>

            <!-- Sezione Dispositivi e Sistema -->
            <div class="mb-12">
                <h2 class="text-3xl font-bold text-gray-800 mb-8 text-center">
                    <i class="fas fa-microchip mr-2 text-cyan-600"></i>
                    Dispositivi e Sistema
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Device Management -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-5xl text-cyan-500 mb-4 icon-bounce">
                        <i class="fas fa-mobile-alt"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Gestione Dispositivi</h3>
                    <p class="text-gray-600 mb-4">Registrazione e monitoring dispositivi SiDLY</p>
                    <a href="/admin/devices" class="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-cogs mr-2"></i>Gestisci
                    </a>
                </div>
            </div>

            <!-- System Status -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-5xl text-gray-500 mb-4 icon-bounce">
                        <i class="fas fa-server"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">System Status</h3>
                    <p class="text-gray-600 mb-4">Monitoraggio stato sistema e API</p>
                    <a href="/admin/system-status" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-heartbeat mr-2"></i>System Status
                    </a>
                </div>
            </div>

            <!-- Sistema Backup -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-5xl text-green-500 mb-4 icon-bounce">
                        <i class="fas fa-cloud-download-alt"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Sistema Backup</h3>
                    <p class="text-gray-600 mb-4">Backup automatico TEST/STAGING/PRODUZIONE</p>
                    <a href="/admin/backup-system" class="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-save mr-2"></i>Gestisci
                    </a>
                </div>
                </div>
            </div>

        </div>

        <!-- Footer -->
        <div class="bg-gray-800 text-white py-6 mt-16">
            <div class="container mx-auto px-6 text-center">
                <p class="text-lg">
                    <i class="fas fa-shield-alt mr-2 text-blue-400"></i>
                    TeleMedCare V12.0 Enterprise - Sistema Completo di TeleAssistenza
                </p>
                <p class="text-gray-400 mt-2">
                    Ambiente: <span class="text-green-400 font-semibold">Development</span> | 
                    Versione: <span class="text-blue-400 font-semibold">V12.0-Modular-Enterprise</span> |
                    Status: <span class="text-green-400 font-semibold">🟢 Online</span>
                </p>
            </div>
        </div>

        <script>
            // Helper function to escape single quotes in strings to prevent syntax errors
            function escapeQuotes(str) {
                if (!str) return '';
                return String(str).replace(/'/g, "\\'");
            }
            
            // Effetto hover animato per le cards
            document.querySelectorAll('.card-hover').forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-8px) scale(1.02)';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0) scale(1)';
                });
            });

            // Controllo status in tempo reale
            async function checkSystemStatus() {
                try {
                    const response = await fetch('/api/system/status');
                    const status = await response.json();
                    console.log('System Status:', status);
                } catch (error) {
                    console.log('Status check failed:', error);
                }
            }
            
            // Check status ogni 30 secondi
            checkSystemStatus();
            setInterval(checkSystemStatus, 30000);
            
            // Load stats on page load (manteniamo per compatibilità)
            async function loadStats() {
            try {
                const response = await fetch('/api/data/stats');
                const stats = await response.json();
                
                // Lead Oggi
                if (stats.leadsToday !== undefined) {
                    document.getElementById('leadsToday').textContent = stats.leadsToday;
                }
                
                // Contratti Oggi
                if (stats.contractsToday !== undefined) {
                    document.getElementById('contractsToday').textContent = stats.contractsToday;
                } else if (stats.totalContracts !== undefined) {
                    // Fallback per compatibilità
                    document.getElementById('contractsToday').textContent = stats.totalContracts;
                }
                
                // Proforma Oggi
                if (stats.proformaToday !== undefined) {
                    document.getElementById('proformaToday').textContent = stats.proformaToday;
                }
                
                // Pagamenti Oggi
                if (stats.paymentsToday !== undefined) {
                    document.getElementById('paymentsToday').textContent = stats.paymentsToday;
                }
                
                // Configurazioni Oggi
                if (stats.configurationsToday !== undefined) {
                    document.getElementById('configurationsToday').textContent = stats.configurationsToday;
                }
                
                // Attivazioni Oggi
                if (stats.activationsToday !== undefined) {
                    document.getElementById('activationsToday').textContent = stats.activationsToday;
                }
            } catch (error) {
                console.log('Stats not yet available');
                // Set tutti a 0 in caso di errore
                document.getElementById('leadsToday').textContent = '0';
                document.getElementById('contractsToday').textContent = '0';
                document.getElementById('proformaToday').textContent = '0';
                document.getElementById('paymentsToday').textContent = '0';
                document.getElementById('configurationsToday').textContent = '0';
                document.getElementById('activationsToday').textContent = '0';
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
                        <p class="text-xs text-gray-500 mt-1">Ultimi 30 giorni</p>
                    </div>
                    <i class="fas fa-file-contract text-3xl text-green-500"></i>
                </div>
            </div>

            <div class="bg-white p-6 rounded-xl shadow-sm card-hover border-l-4 border-purple-500">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm mb-1">Email Inviate</p>
                        <p class="text-3xl font-bold text-purple-600" id="emailsSent">-</p>
                        <p class="text-xs text-gray-500 mt-1">Ultimi 30 giorni</p>
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

        <!-- Import API Buttons per Canale -->
        <div class="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4">
                <i class="fas fa-download mr-2 text-blue-600"></i>Import Lead da Canali
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button onclick="importFromExcel()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
                    <i class="fas fa-file-excel mr-2"></i>Excel
                </button>
                <button onclick="importFromIrbema()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
                    <i class="fas fa-building mr-2"></i>Irbema
                </button>
                <button onclick="importFromAON()" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md">
                    <i class="fas fa-handshake mr-2"></i>AON
                </button>
                <button onclick="importFromDoubleYou()" class="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md" style="color: white !important; background-color: #db2777 !important;">
                    <i class="fas fa-chart-line mr-2"></i>DoubleYou
                </button>
            </div>
        </div>

        <!-- Settings: Switch ON/OFF - TUTTI E 4 GLI SWITCH SEMPRE VISIBILI -->
        <div class="bg-white p-6 rounded-xl shadow-sm mb-8">
            <h3 class="text-lg font-bold text-gray-800 mb-4">
                <i class="fas fa-cog mr-2 text-purple-600"></i>Impostazioni Sistema
                <span class="ml-3 text-sm text-gray-500">(4 configurazioni attive)</span>
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <!-- 1. Import Automatico HubSpot -->
                <div class="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-all">
                    <div class="flex items-center mb-2">
                        <span class="text-2xl mr-2">🔄</span>
                        <h4 class="font-semibold text-gray-800">Import Auto HubSpot</h4>
                    </div>
                    <p class="text-xs text-gray-600 mb-3">Import automatico giornaliero da HubSpot</p>
                    <select id="selectHubspotAuto" class="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium" onchange="updateSetting('hubspot_auto_import_enabled', this.value)">
                        <option value="false">❌ OFF - Disattivato</option>
                        <option value="true">✅ ON - Attivo</option>
                    </select>
                </div>
                
                <!-- 2. Email Automatiche Lead -->
                <div class="p-4 bg-green-50 rounded-lg border-2 border-green-200 hover:border-green-400 transition-all">
                    <div class="flex items-center mb-2">
                        <span class="text-2xl mr-2">📧</span>
                        <h4 class="font-semibold text-gray-800">Email Automatiche Lead</h4>
                    </div>
                    <p class="text-xs text-gray-600 mb-3">Email brochure, contratto, reminder ai lead</p>
                    <select id="selectLeadEmails" class="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 font-medium" onchange="updateSetting('lead_email_notifications_enabled', this.value)">
                        <option value="false">❌ OFF - Disattivato</option>
                        <option value="true">✅ ON - Attivo</option>
                    </select>
                </div>

                <!-- 3. Notifiche Email Admin -->
                <div class="p-4 bg-purple-50 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all">
                    <div class="flex items-center mb-2">
                        <span class="text-2xl mr-2">🔔</span>
                        <h4 class="font-semibold text-gray-800">Notifiche Email Admin</h4>
                    </div>
                    <p class="text-xs text-gray-600 mb-3">Abilita notifiche email a info@telemedcare.it</p>
                    <select id="selectAdminEmails" class="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-medium" onchange="updateSetting('admin_email_notifications_enabled', this.value)">
                        <option value="false">❌ OFF - Disattivato</option>
                        <option value="true">✅ ON - Attivo</option>
                    </select>
                </div>

                <!-- 4. Reminder Automatici Completamento -->
                <div class="p-4 bg-orange-50 rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-all">
                    <div class="flex items-center mb-2">
                        <span class="text-2xl mr-2">⏰</span>
                        <h4 class="font-semibold text-gray-800">Reminder Completamento</h4>
                    </div>
                    <p class="text-xs text-gray-600 mb-3">Reminder automatici per dati mancanti</p>
                    <select id="selectReminderCompletion" class="w-full px-3 py-2 border border-orange-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-medium" onchange="updateSetting('reminder_completion_enabled', this.value)">
                        <option value="false">❌ OFF - Disattivato</option>
                        <option value="true">✅ ON - Attivo</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Script Settings: Definito QUI per essere disponibile agli handler inline -->
        <script>
            // ⚙️ FUNZIONE UPDATE SETTING - Definita prima degli handler
            window.updateSetting = async function(key, value) {
                try {
                    console.log('🔄 [SETTINGS] Aggiornamento setting:', key, '=', value);
                    
                    const response = await fetch('/api/settings/' + key, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ value: value })
                    });
                    
                    const result = await response.json();
                    
                    console.log('🔄 [SETTINGS] Response:', result);
                    
                    if (result.success) {
                        alert('✅ Impostazione aggiornata con successo!\\n\\n' + key + ' = ' + value);
                        console.log('✅ [SETTINGS] Setting aggiornato:', key, '=', value);
                    } else {
                        alert('❌ Errore: ' + result.error);
                        console.error('❌ [SETTINGS] Errore:', result.error);
                    }
                } catch (error) {
                    console.error('❌ [SETTINGS] Errore aggiornamento setting:', error);
                    alert('❌ Errore di comunicazione: ' + error.message);
                }
            };
            
            console.log('✅ [SETTINGS] Funzione window.updateSetting definita');
            
            // ⚙️ FUNZIONE LOAD SETTINGS - Carica i valori dal DB
            window.loadSettings = async function() {
                try {
                    console.log('📥 [SETTINGS] Caricamento settings dal database...');
                    const response = await fetch('/api/settings');
                    const data = await response.json();
                    
                    console.log('📥 [SETTINGS] Response:', data);
                    
                    if (data.success && data.settings) {
                        const settings = data.settings;
                        
                        // Update select states - tutti e 4 i settings
                        if (settings.hubspot_auto_import_enabled) {
                            const value = settings.hubspot_auto_import_enabled.value;
                            console.log('✅ [SETTINGS] HubSpot:', value);
                            const el = document.getElementById('selectHubspotAuto');
                            if (el) el.value = value;
                        }
                        if (settings.lead_email_notifications_enabled) {
                            const value = settings.lead_email_notifications_enabled.value;
                            console.log('✅ [SETTINGS] Lead Emails:', value);
                            const el = document.getElementById('selectLeadEmails');
                            if (el) el.value = value;
                        }
                        if (settings.admin_email_notifications_enabled) {
                            const value = settings.admin_email_notifications_enabled.value;
                            console.log('✅ [SETTINGS] Admin Emails:', value);
                            const el = document.getElementById('selectAdminEmails');
                            if (el) el.value = value;
                        }
                        if (settings.reminder_completion_enabled) {
                            const value = settings.reminder_completion_enabled.value;
                            console.log('✅ [SETTINGS] Reminder:', value);
                            const el = document.getElementById('selectReminderCompletion');
                            if (el) el.value = value;
                        }
                        
                        console.log('✅ [SETTINGS] Tutti e 4 gli switch caricati correttamente');
                    } else {
                        console.error('❌ [SETTINGS] Risposta API non valida:', data);
                    }
                } catch (error) {
                    console.error('❌ [SETTINGS] Errore caricamento settings:', error);
                }
            };
            
            console.log('✅ [SETTINGS] Funzione window.loadSettings definita');
            
            // Carica settings al caricamento pagina
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', window.loadSettings);
            } else {
                window.loadSettings();
            }
        </script>

        <!-- Elenco Assistiti -->
        <div class="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-users text-green-500 mr-2"></i>
                    Assistiti Attivi
                    <span id="assistitiCount" class="ml-3 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">0</span>
                </h3>
                <div class="flex space-x-2">
                    <input 
                        type="text" 
                        id="searchAssistitoCognome" 
                        class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56" 
                        placeholder="🔍 Cerca assistito..."
                        onkeyup="filterAssistiti()"
                    />
                    <button onclick="nuovoAssistito()" class="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        <i class="fas fa-user-plus mr-2"></i>
                        Nuovo Assistito
                    </button>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 text-sm font-semibold text-gray-600">Assistito</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">IMEI Dispositivo</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Email</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Telefono</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Servizio</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Piano</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Prezzo</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Status</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="assistitiTable">
                        <tr>
                            <td colspan="9" class="py-8 text-center text-gray-400">
                                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                <p>Caricamento assistiti...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Analisi Lead: Servizi, Piani e Canali (Compattati su 1 riga) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

            <!-- Distribuzione per Canale -->\n            <div class=\"bg-white p-6 rounded-xl shadow-sm\">\n                <h3 class=\"text-lg font-bold text-gray-800 mb-4 flex items-center\">\n                    <i class=\"fas fa-network-wired text-orange-500 mr-2\"></i>\n                    Distribuzione per Canale\n                </h3>\n                <div id=\"channelsDistribution\" class=\"space-y-3\">\n                    <!-- Distribuzione canali verrà popolata dinamicamente -->\n                </div>\n            </div>
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
                            <th class="pb-3 text-sm font-semibold text-gray-600">Telefono</th>
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
                            <td colspan="9" class="py-8 text-center text-gray-400">
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
        // Helper function to escape HTML special characters
        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }

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
                // MIGRAZIONE AUTOMATICA SCHEMA (eseguita una sola volta)
                try {
                    const migrateResponse = await fetch('/api/migrate-schema', { method: 'POST' });
                    const migrateData = await migrateResponse.json();
                    if (migrateData.success) {
                        console.log('✅ Migrazione schema:', migrateData.migrations);
                    }
                } catch (migrateError) {
                    console.warn('⚠️ Migrazione schema saltata:', migrateError);
                }
                
                // Carica TUTTI i lead (limite massimo 999999)
                const allLeadsResponse = await fetch('/api/leads?limit=999999');
                const allLeadsData = await allLeadsResponse.json();
                const allLeads = allLeadsData.leads || [];
                
                // Carica CONTRATTI reali per conteggio accurato
                const contractsResponse = await fetch('/api/contratti?limit=100');
                const contractsData = await contractsResponse.json();
                const contracts = contractsData.contracts || contractsData.contratti || contractsData.data || [];
                
                // Carica ASSISTITI reali con IMEI
                const assistitiResponse = await fetch('/api/assistiti');
                const assistitiData = await assistitiResponse.json();
                const assistiti = assistitiData.assistiti || [];
                
                // Calcola statistiche reali
                const totalLeads = allLeads.length;
                const contratti = contracts.length; // Conta contratti reali, non lead convertiti
                const topService = 'eCura PRO';
                
                // Aggiorna KPI
                document.getElementById('totalLeads').textContent = totalLeads;
                document.getElementById('contractsSent').textContent = contratti;
                document.getElementById('emailsSent').textContent = '0'; // TODO
                document.getElementById('topService').textContent = topService;

                // Filtra ultimi 3 mesi (90 giorni) e NON convertiti
                const threeMonthsAgo = new Date();
                threeMonthsAgo.setDate(threeMonthsAgo.getDate() - 90);
                
                // REGOLA: Mostra solo lead NON convertiti (senza hardcoding)
                // Un lead è DAVVERO convertito SOLO se ha:
                // 1. Status: CONVERTED, CONTRACT_SIGNED, ACTIVE
                // 2. Note con parole chiave FORTE: "firmato", "pagato", "consegnato", "attivo"
                // 
                // IMPORTANTE: "inviato contratto" NON significa convertito!
                // Solo quando c'è conferma di firma/pagamento/consegna
                
                const recentLeads = allLeads.filter(lead => {
                    const leadDate = new Date(lead.created_at || lead.timestamp);
                    const status = (lead.status || '').toUpperCase();
                    const isRecent = leadDate >= threeMonthsAgo;
                    
                    // Controlla se lo status indica conversione REALE
                    const statusConverted = ['CONVERTED', 'CONTRACT_SIGNED', 'ACTIVE'].includes(status);
                    
                    // Controlla se le note indicano conversione REALE (non solo "inviato")
                    const note = (lead.note || lead.notes || '').toLowerCase();
                    const noteConverted = 
                        note.includes('firmato') ||           // Contratto firmato
                        note.includes('pagato') ||            // Pagamento ricevuto
                        note.includes('consegnato') ||        // Dispositivo consegnato
                        note.includes('attivo') ||            // Servizio attivo
                        note.includes('installato') ||        // Dispositivo installato
                        (note.includes('contratto') && note.includes('firmato')) ||  // "contratto firmato"
                        (note.includes('contratto') && note.includes('pagato'));     // "contratto pagato"
                    
                    // Lead è convertito SOLO se status O note indicano conversione REALE
                    const notConverted = !statusConverted && !noteConverted;
                    
                    return isRecent && notConverted;
                });
                
                // Ultimi 10 lead recenti non convertiti per la tabella
                const leads = recentLeads.slice(0, 10);

                // Popola tabella lead
                const tbody = document.getElementById('leadsTable');
                if (leads.length === 0) {
                    tbody.innerHTML = \`
                        <tr>
                            <td colspan="9" class="py-8 text-center text-gray-400">
                                Nessun lead trovato
                            </td>
                        </tr>
                    \`;
                } else {
                    tbody.innerHTML = leads.map(lead => {
                        // ✅ USA SERVIZIO E PREZZO DAL DATABASE
                        const servizio = lead.servizio || lead.tipoServizio || 'eCura PRO';
                        const piano = lead.piano || ((lead.note && lead.note.includes('Piano: AVANZATO')) ? 'AVANZATO' : 'BASE');
                        // Determina dispositivo in base al servizio
                        const servizioType = servizio ? servizio.replace('eCura ', '') : 'PRO';
                        const dispositivo = servizioType.includes('PREMIUM') ? 'SiDLY VITAL CARE' : 'SiDLY CARE PRO';
                        
                        // ✅ CALCOLO PREZZO CORRETTO: considera servizio + piano
                        let prezzoFallback = 480; // Default: PRO BASE
                        if (servizioType.includes('FAMILY')) {
                          prezzoFallback = piano === 'AVANZATO' ? 690 : 390;
                        } else if (servizioType.includes('PREMIUM')) {
                          prezzoFallback = piano === 'AVANZATO' ? 990 : 590;
                        } else {
                          prezzoFallback = piano === 'AVANZATO' ? 840 : 480;
                        }
                        const prezzo = lead.prezzo_anno || prezzoFallback;
                        
                        const statusClass = (lead.vuoleBrochure === 'Si') ? 'status-sent' : 'status-pending';
                        const statusText = (lead.vuoleBrochure === 'Si') ? 'Inviata brochure' : 'Da contattare';
                        const telefono = lead.telefono || 'N/A';
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
                                    <code class="bg-gray-100 px-2 py-1 rounded text-xs" title="\${escapeHtml(lead.id)}">\${formatLeadId(lead.id)}</code>
                                </td>
                                <td class="py-3 text-sm">
                                    <div class="font-medium">\${escapeHtml(lead.nomeRichiedente)} \${escapeHtml(lead.cognomeRichiedente)}</div>
                                    <div class="text-xs text-gray-500">\${escapeHtml(lead.email)}</div>
                                </td>
                                <td class="py-3 text-sm text-gray-600">\${telefono}</td>
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
                
                // Aggiorna grafici: servizi basati su ASSISTITI, piani basati su ASSISTITI
                updateServicesChart(assistiti);  // ⚠️ FIX: usa assistiti non lead
                updatePlansChart(allLeads);
                updateChannelsDistribution(assistiti);  // Analizza solo assistiti attivi
                
                // Renderizza assistiti da API dedicata
                allAssistiti = assistiti;  // Salva per filtri
                renderAssistitiTable(assistiti);

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
                            <button id="retryLoadDashboard" class="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                                <i class="fas fa-redo mr-2"></i>Riprova
                            </button>
                        </td>
                    </tr>
                \`;
                setTimeout(() => {
                    const retryBtn = document.getElementById('retryLoadDashboard');
                    if (retryBtn) retryBtn.addEventListener('click', loadDashboardData);
                }, 0);
            } finally {
                isLoading = false;
            }
        }

        
        function importFromChannel(channel) {
            if (confirm(\`📥 Vuoi importare i lead dal canale \${channel}?\\n\\nQuesta operazione:\n- Scaricherà i nuovi lead da \${channel}\n- Aggiornerà il database\n- Sincronizzerà i dati\\n\\nProcedi?\`)) {
                // Mostra loading
                const btn = event.target.closest('button');
                const originalHTML = btn.innerHTML;
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Importazione...';
                
                fetch(\`/api/leads/import/\${channel.toLowerCase()}\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(res => res.json())
                .then(data => {
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                    
                    if (data.success) {
                        alert('✅ Import completato!\\n\\nCanale: ' + channel + '\\nLead importati: ' + (data.count || 0) + '\\nTotale lead: ' + (data.total || 0));
                        loadDashboardData(); // Ricarica dashboard
                    } else {
                        alert('❌ Errore import:\\n\\n' + (data.error || 'Errore sconosciuto'));
                    }
                })
                .catch(error => {
                    btn.disabled = false;
                    btn.innerHTML = originalHTML;
                    alert('❌ Errore di comunicazione:\\n\\n' + error.message);
                });
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
                'FAMILY': 'SiDLY CARE PRO',
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

        function updateServicesChart(assistiti) {
            // FIX: Usa assistiti attivi, non lead
            const total = assistiti.length || 1;
            
            // Conta servizi basandosi sui piani degli assistiti
            // eCura PRO BASE e AVANZATO (tutti gli assistiti attuali)
            const serviceCounts = {
                'eCura PRO': total  // Tutti gli assistiti attivi sono eCura PRO
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
            // USA SOLO ASSISTITI per conteggio piani (non tutti i lead)
            const assistitiResponse = fetch('/api/assistiti').then(r => r.json()).then(data => {
                const assistiti = data.assistiti || [];
                const planCounts = { 'BASE': 0, 'AVANZATO': 0 };
                
                // Conta i piani reali basati sui contratti degli assistiti
                assistiti.forEach(assistito => {
                    const piano = assistito.piano || 'BASE';
                    if (piano === 'AVANZATO') {
                        planCounts.AVANZATO++;
                    } else {
                        planCounts.BASE++;
                    }
                });

                const total = assistiti.length || 1;
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
            });
        }
        
        // Funzione per formattare ID lead - mostra ID completo in formato LEAD-CANALE-NUMERO
        function formatLeadId(leadId) {
            if (!leadId) return 'N/A';
            const id = leadId.toString();
            
            // Mostra l'ID completo (formato LEAD-IRBEMA-xxxxx)
            return id;
        }
        
        function updateChannelsDistribution(assistiti) {
            // Analizza SOLO gli ASSISTITI ATTIVI per identificare il canale di provenienza
            const channelCounts = {};
            const channelColors = {
                'Irbema': 'bg-blue-500',
                'Excel': 'bg-green-500',
                'Web': 'bg-indigo-600',
                'Networking': 'bg-purple-500',
                'AON': 'bg-orange-500',
                'DoubleYou': 'bg-pink-500'
            };
            
            assistiti.forEach(assistito => {
                let canale = 'Web'; // Default
                
                // Estrai info assistito - prova vari nomi campo
                const leadId = (assistito.id || '').toString().toUpperCase();
                const email = (
                    assistito.email || 
                    assistito.email || 
                    assistito.email_richiedente ||
                    assistito.emailrichiedente ||
                    ''
                ).toLowerCase().trim();
                const nomeCompleto = \`\${escapeHtml(assistito.nomeRichiedente || assistito.nome_richiedente || assistito.nome || '')} \${escapeHtml(assistito.cognomeRichiedente || assistito.cognome_richiedente || assistito.cognome || '')}\`.trim().toLowerCase();
                const canaleField = (assistito.canale || assistito.origine || '').toLowerCase();
                
                // ⚡ MAPPATURA BASATA SU DATI REALI: Identifica canale da nome assistito
                // PRIORITÀ 1: Laura Calvi = Networking (unico caso da stefania.rocca@medicagb.it)
                if (nomeCompleto.includes('laura calvi') || 
                    email.includes('stefania.rocca@medicagb.it')) {
                    canale = 'Networking';
                    console.log('✅ Networking:', nomeCompleto);
                }
                // PRIORITÀ 2: Tutti gli altri assistiti attivi = Irbema (da Excel colonna F: info@irbema.com)
                // Lista verificata dall'Excel: Elena Saglia, Paolo Magri, Caterina D'Alterio, 
                // Simona Pizzutto, Elisabetta Cattini, e gli assistiti attuali nel DB
                else if (
                    nomeCompleto.includes('elena') || nomeCompleto.includes('saglia') ||
                    nomeCompleto.includes('paolo') || nomeCompleto.includes('magri') ||
                    nomeCompleto.includes('caterina') || nomeCompleto.includes('alterio') ||
                    nomeCompleto.includes('simona') || nomeCompleto.includes('pizzutto') ||
                    nomeCompleto.includes('elisabetta') || nomeCompleto.includes('cattini') ||
                    nomeCompleto.includes('giuliana') || nomeCompleto.includes('balzarotti') ||
                    nomeCompleto.includes('rita') || nomeCompleto.includes('pennacchio') ||
                    nomeCompleto.includes('maria') || nomeCompleto.includes('capone') ||
                    nomeCompleto.includes('giuseppina') || nomeCompleto.includes('cozzi') ||
                    nomeCompleto.includes('eileen') || nomeCompleto.includes('king')
                ) {
                    canale = 'Irbema';
                    console.log('✅ Irbema:', nomeCompleto, '(da mappatura Excel)');
                }
                // PRIORITÀ 3: Altri canali (Excel, AON, DoubleYou) - solo se campo canale popolato
                else if (canaleField.includes('excel') || leadId.includes('LEAD-EXCEL')) {
                    canale = 'Excel';
                } else if (canaleField.includes('aon')) {
                    canale = 'AON';
                } else if (canaleField.includes('doubleyou') || canaleField.includes('double')) {
                    canale = 'DoubleYou';
                } else if (canaleField.includes('network')) {
                    canale = 'Networking';
                } else {
                    // Se non riconosciuto, rimane Web (default)
                    console.log('⚠️  Web (default):', nomeCompleto);
                }
                
                channelCounts[canale] = (channelCounts[canale] || 0) + 1;
            });
            
            // DEBUG: Mostra distribuzione finale
            console.log('📊 Distribuzione Canali:', channelCounts);
            
            const total = assistiti.length || 1;
            let html = '';
            
            // Ordina per count discendente
            const sortedChannels = Object.entries(channelCounts).sort((a, b) => b[1] - a[1]);
            
            if (sortedChannels.length === 0) {
                html = '<p class="text-gray-400 text-sm text-center py-4">Nessun dato disponibile</p>';
            } else {
                sortedChannels.forEach(([canale, count]) => {
                    const percentage = Math.round((count / total) * 100);
                    const color = channelColors[canale] || 'bg-gray-500';
                    
                    html += \`
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium text-gray-700">\${canale}</span>
                                <span class="text-sm font-bold text-gray-900">\${count} (\${percentage}%)</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="\${color} h-2 rounded-full" style="width: \${percentage}%"></div>
                            </div>
                        </div>
                    \`;
                });
            }
            
            document.getElementById('channelsDistribution').innerHTML = html;
        }

        // ========== CRUD ASSISTITI (DEFINITE PRIMA DI renderAssistitiTable) ==========
        
        async function viewAssistito(id) {
            try {
                const response = await fetch('/api/assistiti?id=' + id);
                const data = await response.json();
                
                if (data.success && data.assistiti && data.assistiti.length > 0) {
                    const assistito = data.assistiti[0];
                    
                    // Mostra modal dettagli assistito
                    alert('📋 Dettagli Assistito\\n\\n' +
                        'Nome: ' + (assistito.nome_assistito || '') + ' ' + (assistito.cognome_assistito || '') + '\\n' +
                        'Caregiver: ' + (assistito.nome_caregiver || 'N/A') + ' ' + (assistito.cognome_caregiver || '') + '\\n' +
                        'Parentela: ' + (assistito.parentela_caregiver || 'N/A') + '\\n' +
                        'IMEI: ' + (assistito.imei || 'N/A') + '\\n' +
                        'Email: ' + (assistito.email || 'N/A') + '\\n' +
                        'Telefono: ' + (assistito.telefono || 'N/A') + '\\n' +
                        'Piano: ' + (assistito.piano || 'BASE') + '\\n' +
                        'Contratto: ' + (assistito.codice_contratto || 'Nessuno') + '\\n' +
                        'Status: ' + (assistito.contratto_status || assistito.status || 'N/A')
                    );
                } else {
                    alert('❌ Assistito non trovato');
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
            }
        }
        window.viewAssistito = viewAssistito;  // Esponi globalmente
        
        async function editAssistito(id) {
            try {
                const response = await fetch('/api/assistiti?id=' + id);
                const data = await response.json();
                
                if (data.success && data.assistiti && data.assistiti.length > 0) {
                    const assistito = data.assistiti[0];
                    
                    // Richiedi nuovi dati
                    const nuovoNome = prompt('Nome Assistito:', assistito.nome_assistito || '');
                    if (!nuovoNome) return;
                    
                    const nuovoCognome = prompt('Cognome Assistito:', assistito.cognome_assistito || '');
                    if (!nuovoCognome) return;
                    
                    const nuovaEmail = prompt('Email:', assistito.email || '');
                    const nuovoTelefono = prompt('Telefono:', assistito.telefono || '');
                    const nuovoIMEI = prompt('IMEI Dispositivo:', assistito.imei || '');
                    
                    const caregiverNome = prompt('Nome Caregiver:', assistito.nome_caregiver || '');
                    const caregiverCognome = prompt('Cognome Caregiver:', assistito.cognome_caregiver || '');
                    const parentela = prompt('Parentela Caregiver:', assistito.parentela_caregiver || '');
                    
                    // Aggiorna
                    const updateResponse = await fetch(\`/api/assistiti/\${id}\`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nome_assistito: nuovoNome,
                            cognome_assistito: nuovoCognome,
                            nome_caregiver: caregiverNome,
                            cognome_caregiver: caregiverCognome,
                            parentela_caregiver: parentela,
                            email: nuovaEmail,
                            telefono: nuovoTelefono,
                            imei: nuovoIMEI
                        })
                    });
                    
                    const result = await updateResponse.json();
                    
                    if (result.success) {
                        alert('✅ Assistito aggiornato con successo!');
                        loadDashboardData(); // Ricarica dashboard
                    } else {
                        alert('❌ Errore: ' + result.error);
                    }
                } else {
                    alert('❌ Assistito non trovato');
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
            }
        }
        window.editAssistito = editAssistito;  // Esponi globalmente
        
        async function deleteAssistito(id) {
            // Trova l'assistito nell'array globale per ottenere il nome
            const assistito = allAssistiti.find(a => a.id === id);
            const nome = assistito ? 
                (assistito.nome || ((assistito.nome_assistito || '') + ' ' + (assistito.cognome_assistito || '')).trim() || 'questo assistito') 
                : 'questo assistito';
            
            if (!confirm('⚠️ Sei sicuro di voler eliminare l\\'assistito ' + nome + '?\\n\\nQuesta azione non può essere annullata!')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/assistiti/\${id}\`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Assistito ' + nome + ' eliminato con successo!');
                    loadDashboardData(); // Ricarica dashboard
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
            }
        }
        window.deleteAssistito = deleteAssistito;  // Esponi globalmente
        
        async function editAssistito(id) {
            try {
                const response = await fetch('/api/assistiti?id=' + id);
                const data = await response.json();
                
                if (data.success && data.assistiti && data.assistiti.length > 0) {
                    const assistito = data.assistiti[0];
                    
                    // Verifica che il modal esista
                    const modal = document.getElementById('editAssistitoModal');
                    if (!modal) {
                        console.error('Modal editAssistitoModal non trovato');
                        alert('❌ Errore: Modal non trovato. Ricaricare la pagina.');
                        return;
                    }
                    
                    // Popola form modal con controlli
                    const setValueSafe = (id, value) => {
                        const el = document.getElementById(id);
                        if (el) el.value = value || '';
                        else console.warn(\`Elemento \${id} non trovato\`);
                    };
                    
                    setValueSafe('editAssistitoId', id);
                    setValueSafe('editNomeAssistito', assistito.nome_assistito);
                    setValueSafe('editCognomeAssistito', assistito.cognome_assistito);
                    setValueSafe('editEmailAssistito', assistito.email);
                    setValueSafe('editTelefonoAssistito', assistito.telefono);
                    setValueSafe('editIMEI', assistito.imei);
                    setValueSafe('editServizioAssistito', assistito.servizio || 'eCura PRO');
                    setValueSafe('editNomeCaregiver', assistito.nome_caregiver);
                    setValueSafe('editCognomeCaregiver', assistito.cognome_caregiver);
                    setValueSafe('editParentela', assistito.parentela_caregiver);
                    setValueSafe('editPianoAssistito', assistito.piano || 'BASE');
                    
                    // Aggiorna prezzi dinamicamente
                    setTimeout(() => updatePrezziServizio(), 100);
                    
                    // Mostra modal
                    modal.classList.remove('hidden');
                } else {
                    alert('❌ Assistito non trovato');
                }
            } catch (error) {
                console.error('Errore editAssistito:', error);
                alert('❌ Errore: ' + error.message);
            }
        }
        window.editAssistito = editAssistito;  // Esponi globalmente
        
        async function saveEditAssistito() {
            const id = document.getElementById('editAssistitoId').value;
            const nomeAssistito = document.getElementById('editNomeAssistito').value;
            const cognomeAssistito = document.getElementById('editCognomeAssistito').value;
            const email = document.getElementById('editEmailAssistito').value;
            const telefono = document.getElementById('editTelefonoAssistito').value;
            const imei = document.getElementById('editIMEI').value;
            const servizio = document.getElementById('editServizioAssistito').value;
            const nomeCaregiver = document.getElementById('editNomeCaregiver').value;
            const cognomeCaregiver = document.getElementById('editCognomeCaregiver').value;
            const parentela = document.getElementById('editParentela').value;
            const piano = document.getElementById('editPianoAssistito').value;
            
            // DEBUG: Log dei dati raccolti
            console.log('📝 SAVE EDIT ASSISTITO:', {
                id,
                nomeAssistito,
                cognomeAssistito,
                servizio,
                piano,
                email,
                telefono,
                imei
            });
            
            if (!nomeAssistito || !cognomeAssistito || !imei) {
                alert('⚠️ Campi obbligatori: Nome, Cognome e IMEI');
                return;
            }
            
            const payload = {
                nome_assistito: nomeAssistito,
                cognome_assistito: cognomeAssistito,
                email: email,
                telefono: telefono,
                imei: imei,
                servizio: servizio,
                nome_caregiver: nomeCaregiver,
                cognome_caregiver: cognomeCaregiver,
                parentela_caregiver: parentela,
                piano: piano
            };
            
            console.log('📤 PAYLOAD INVIATO:', payload);
            
            try {
                const response = await fetch(\`/api/assistiti/\${id}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                console.log('📥 RISPOSTA SERVER:', result);
                
                if (result.success) {
                    alert('✅ Assistito aggiornato con successo!');
                    closeModal('editAssistitoModal');
                    loadDashboardData();
                } else {
                    alert('❌ Errore: ' + result.error);
                    console.error('❌ Dettagli errore:', result);
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
                console.error('❌ Errore catch:', error);
            }
        }
        window.saveEditAssistito = saveEditAssistito;
        
        // Tabella prezzi eCura (1° anno)
        const PREZZI_ECURA = {
            'eCura FAMILY': { BASE: 390, AVANZATO: 690, rinnovo_BASE: 200, rinnovo_AVANZATO: 500 },
            'eCura PRO': { BASE: 480, AVANZATO: 840, rinnovo_BASE: 240, rinnovo_AVANZATO: 600 },
            'eCura PREMIUM': { BASE: 590, AVANZATO: 990, rinnovo_BASE: 300, rinnovo_AVANZATO: 750 }
        };
        
        function updatePrezziServizio() {
            const servizio = document.getElementById('editServizioAssistito')?.value || 'eCura PRO';
            const piano = document.getElementById('editPianoAssistito')?.value || 'BASE';
            const prezzoInfo = document.getElementById('prezzoInfo');
            
            if (!prezzoInfo) return;
            
            const prezzi = PREZZI_ECURA[servizio];
            if (!prezzi) return;
            
            const prezzoAnno1 = prezzi[piano];
            const prezzoRinnovo = prezzi['rinnovo_' + piano];
            
            prezzoInfo.innerHTML = 
                '<div class="bg-blue-50 border border-blue-200 rounded-lg p-3">' +
                    '<div class="flex justify-between items-center">' +
                        '<span class="font-semibold text-blue-900">1° Anno:</span>' +
                        '<span class="text-xl font-bold text-blue-600">€' + prezzoAnno1 + '</span>' +
                    '</div>' +
                    '<div class="flex justify-between items-center mt-1">' +
                        '<span class="text-sm text-gray-600">Rinnovo (dal 2° anno):</span>' +
                        '<span class="font-semibold text-gray-700">€' + prezzoRinnovo + '/anno</span>' +
                    '</div>' +
                '</div>';
            
            // Aggiorna anche il testo delle opzioni
            const pianoSelect = document.getElementById('editPianoAssistito');
            if (pianoSelect) {
                pianoSelect.innerHTML = 
                    '<option value="BASE" data-prezzo="' + prezzi.BASE + '">BASE - €' + prezzi.BASE + '/anno</option>' +
                    '<option value="AVANZATO" data-prezzo="' + prezzi.AVANZATO + '">AVANZATO - €' + prezzi.AVANZATO + '/anno</option>';
                pianoSelect.value = piano; // Ripristina selezione
            }
        }
        window.updatePrezziServizio = updatePrezziServizio;
        
        function closeModal(modalId) {
            document.getElementById(modalId).classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
        window.closeModal = closeModal;

        function renderAssistitiTable(assistiti) {
            const tbody = document.getElementById('assistitiTable');
            
            // Aggiorna contatore
            document.getElementById('assistitiCount').textContent = assistiti.length;
            
            if (assistiti.length === 0) {
                tbody.innerHTML = '<tr>' +
                    '<td colspan="9" class="py-8 text-center text-gray-400">' +
                        '<i class="fas fa-users text-3xl mb-2"></i><br>' +
                        'Nessun assistito attivo trovato' +
                    '</td>' +
                '</tr>';
                return;
            }
            
            tbody.innerHTML = assistiti.map(assistito => {
                // Dati assistito reali con nuovi campi
                const nomeAssistito = assistito.nome_assistito || '';
                const cognomeAssistito = assistito.cognome_assistito || '';
                const nomeCompleto = assistito.nome || (nomeAssistito + ' ' + cognomeAssistito).trim() || 'N/A';
                const caregiverNome = assistito.nome_caregiver || '';
                const caregiverCognome = assistito.cognome_caregiver || '';
                const caregiver = (caregiverNome + ' ' + caregiverCognome).trim() || 'N/A';
                const parentela = assistito.parentela_caregiver || 'N/A';
                const imei = assistito.imei || 'N/A';
                const email = assistito.email || 'N/A';
                const telefono = assistito.telefono || 'N/A';
                const servizio = assistito.servizio || 'eCura PRO';
                const piano = assistito.piano || 'BASE';
                
                // Calcola prezzo dinamico
                const PREZZI_ECURA_TABLE = {
                    'eCura FAMILY': { BASE: 390, AVANZATO: 690 },
                    'eCura PRO': { BASE: 480, AVANZATO: 840 },
                    'eCura PREMIUM': { BASE: 590, AVANZATO: 990 }
                };
                const prezzoAnno = PREZZI_ECURA_TABLE[servizio]?.[piano] || 480;
                
                const status = assistito.status || 'ATTIVO';
                const codice = assistito.codice_contratto || assistito.codice || 'N/A';
                const assistitoId = assistito.id;
                
                // Status badge colors
                const statusColors = {
                    'ATTIVO': 'bg-green-100 text-green-700',
                    'FIRMATO': 'bg-green-100 text-green-700',
                    'INVIATO': 'bg-blue-100 text-blue-700',
                    'CONVERTITO': 'bg-purple-100 text-purple-700'
                };
                const statusColor = statusColors[status] || 'bg-gray-100 text-gray-700';
                
                // Piano badge colors
                const pianoColor = piano === 'AVANZATO' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700';
                
                return '<tr class="border-b border-gray-100 hover:bg-gray-50">' +
                    '<td class="py-3 px-2">' +
                        '<div class="font-semibold text-sm text-gray-800">' + nomeCompleto + '</div>' +
                        '<div class="text-xs text-gray-500 mt-1">' +
                            '<i class="fas fa-user-friends mr-1"></i>' + caregiver + ' (' + parentela + ')' +
                        '</div>' +
                    '</td>' +
                    '<td class="py-3 px-2 text-center">' +
                        '<code class="bg-gray-100 px-2 py-1 rounded font-mono text-xs">' + imei + '</code>' +
                    '</td>' +
                    '<td class="py-3 px-2 text-sm text-gray-700">' +
                        '<div><i class="fas fa-envelope text-gray-400 mr-1"></i>' + email + '</div>' +
                    '</td>' +
                    '<td class="py-3 px-2 text-sm text-gray-700">' +
                        '<div><i class="fas fa-phone text-gray-400 mr-1"></i>' + telefono + '</div>' +
                    '</td>' +
                    '<td class="py-3 px-2 text-center">' +
                        '<span class="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">' + servizio + '</span>' +
                    '</td>' +
                    '<td class="py-3 px-2 text-center">' +
                        '<span class="px-3 py-1 ' + pianoColor + ' text-xs font-medium rounded-full">' + piano + '</span>' +
                    '</td>' +
                    '<td class="py-3 px-2 text-center">' +
                        '<div class="font-bold text-green-600 text-base">€' + prezzoAnno + '</div>' +
                        '<div class="text-xs text-gray-500">/anno</div>' +
                    '</td>' +
                    '<td class="py-3 px-2 text-center">' +
                        '<span class="px-3 py-1 ' + statusColor + ' text-xs font-medium rounded-full">' + status + '</span>' +
                    '</td>' +
                    '<td class="py-3 px-2 text-center">' +
                        '<div class="flex justify-center gap-1">' +
                            '<button onclick="window.viewAssistito(' + assistitoId + ')" class="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition text-sm" title="Visualizza">' +
                                '<i class="fas fa-eye"></i>' +
                            '</button>' +
                            '<button onclick="window.editAssistito(' + assistitoId + ')" class="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 p-1 rounded transition text-sm" title="Modifica">' +
                                '<i class="fas fa-edit"></i>' +
                            '</button>' +
                            '<button onclick="window.deleteAssistito(' + assistitoId + ')" class="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition text-sm" title="Elimina">' +
                                '<i class="fas fa-trash"></i>' +
                            '</button>' +
                        '</div>' +
                    '</td>' +
                '</tr>';
            }).join('');
        }

        // Variabile globale per tenere tutti gli assistiti
        let allAssistiti = [];

        function filterAssistiti() {
            const searchTerm = document.getElementById('searchAssistitoCognome').value.toLowerCase().trim();
            
            if (!searchTerm) {
                renderAssistitiTable(allAssistiti);
                return;
            }

            const filtered = allAssistiti.filter(assistito => {
                const nomeAssistito = (assistito.nome_assistito || '').toLowerCase();
                const cognomeAssistito = (assistito.cognome_assistito || '').toLowerCase();
                const nomeCompleto = (assistito.nome || '').toLowerCase();
                const caregiverNome = (assistito.nome_caregiver || '').toLowerCase();
                const caregiverCognome = (assistito.cognome_caregiver || '').toLowerCase();
                
                return nomeAssistito.includes(searchTerm) || 
                       cognomeAssistito.includes(searchTerm) ||
                       nomeCompleto.includes(searchTerm) ||
                       caregiverNome.includes(searchTerm) ||
                       caregiverCognome.includes(searchTerm);
            });

            renderAssistitiTable(filtered);
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

        // Funzioni Import API
        function importFromExcel() {
            alert('📋 IMPORT DA EXCEL\\n\\n' +
                  '📁 Preparazione file Excel richiesta:\\n\\n' +
                  '1️⃣ Usa il template Excel già popolato\\n' +
                  '2️⃣ Compila i campi richiesti:\\n' +
                  '   • Colonna B: DATA DI ARRIVO RICHIESTA\\n' +
                  '   • Colonna F: CANALE (info@irbema.com, diretto, ecc.)\\n' +
                  '   • Colonna G: NOME E COGNOME\\n' +
                  '   • Colonna I: E-MAIL\\n' +
                  '   • Colonna J: CONTATTO TELEFONICO\\n\\n' +
                  '3️⃣ Il sistema assegnerà automaticamente:\\n' +
                  '   • ID progressivi (LEAD-CANALE-00130, 00131...)\\n' +
                  '   • Status: NEW o CONVERTED\\n' +
                  '   • Canale: IRBEMA, WEB, NETWORKING, ecc.\\n\\n' +
                  '✅ I nuovi lead saranno AGGIUNTI senza cancellare gli esistenti.\\n\\n' +
                  '🚧 Funzionalità in sviluppo - contatta l\\'amministratore.');
        }
        window.importFromExcel = importFromExcel;  // Esponi globalmente

        async function importFromIrbema() {
            if (!confirm('Vuoi importare i lead da Irbema (HubSpot)?\\n\\nQuesta operazione:\\n- Scaricherà i nuovi lead da HubSpot\\n- Filtrerà solo i lead da ecura.it\\n- Aggiornerà il database\\n\\nProcedi?')) {
                return;
            }
            
            try {
                const response = await fetch('/api/import/irbema', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Import Irbema completato!\\n\\n' +
                          'Lead importati: ' + result.imported + '\\n' +
                          'Lead skippati: ' + result.skipped + '\\n' +
                          'Totale contatti: ' + result.total + '\\n' +
                          'Pagine processate: ' + result.pages);
                    
                    // Ricarica la tabella assistiti
                    if (typeof window.loadAssistitiData === 'function') {
                        window.loadAssistitiData();
                    } else {
                        // Fallback: reload pagina
                        location.reload();
                    }
                } else {
                    alert('Errore import: ' + result.error);
                }
            } catch (error) {
                alert('Errore di comunicazione: ' + error.message);
            }
        }

        function importFromAON() {
            alert('🔄 Import da AON\\n\\nFunzionalità in sviluppo.\\n\\nEndpoint: POST /api/import/aon\\n\\nQuesta funzionalità permetterà di importare lead dal partner AON.');
        }

        function importFromDoubleYou() {
            alert('🔄 Import da DoubleYou\\n\\nFunzionalità in sviluppo.\\n\\nEndpoint: POST /api/import/doubleyou\\n\\nQuesta funzionalità permetterà di importare lead dal partner DoubleYou.');
        }

        // 🗑️ CLEAN IMPORT: Cancella e reimporta i 129 lead dall'Excel
    </script>

    <!-- MODAL: EDIT ASSISTITO -->
    <div id="editAssistitoModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="gradient-bg text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h3 class="text-xl font-bold">✏️ Modifica Assistito</h3>
                <button onclick="closeModal('editAssistitoModal')" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div class="p-6">
                <input type="hidden" id="editAssistitoId">
                
                <h4 class="font-bold text-gray-700 mb-3 border-b pb-2">👤 Dati Assistito</h4>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input type="text" id="editNomeAssistito" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                        <input type="text" id="editCognomeAssistito" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="editEmailAssistito" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                        <input type="tel" id="editTelefonoAssistito" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">IMEI Dispositivo *</label>
                        <input type="text" id="editIMEI" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Servizio</label>
                        <select id="editServizioAssistito" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onchange="updatePrezziServizio()">
                            <option value="eCura FAMILY">eCura FAMILY (SiDLY CARE PRO)</option>
                            <option value="eCura PRO">eCura PRO (SiDLY CARE PRO)</option>
                            <option value="eCura PREMIUM">eCura PREMIUM (SiDLY VITAL CARE)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Piano</label>
                        <select id="editPianoAssistito" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" onchange="updatePrezziServizio()">
                            <option value="BASE" data-prezzo="480">BASE - €480/anno</option>
                            <option value="AVANZATO" data-prezzo="840">AVANZATO - €840/anno</option>
                        </select>
                        <div id="prezzoInfo" class="mt-2 text-sm text-gray-600"></div>
                    </div>
                </div>
                
                <h4 class="font-bold text-gray-700 mb-3 border-b pb-2">👨‍👩‍👦 Dati Caregiver</h4>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome Caregiver</label>
                        <input type="text" id="editNomeCaregiver" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cognome Caregiver</label>
                        <input type="text" id="editCognomeCaregiver" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Parentela</label>
                        <input type="text" id="editParentela" placeholder="es. Figlio, Figlia, Coniuge..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                </div>
                
                <div class="flex justify-end gap-3">
                    <button onclick="closeModal('editAssistitoModal')" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                        Annulla
                    </button>
                    <button onclick="saveEditAssistito()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                        💾 Salva Modifiche
                    </button>
                </div>
            </div>
        </div>
    </div>

    ${autoImportScript}
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
                        <p class="text-xs text-gray-500 mt-1">Ultime 24h</p>
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

            <!-- Fonti -->
            <div class="bg-white p-6 rounded-xl shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-source text-purple-500 mr-2"></i>
                    Per Fonte
                </h3>
                <div id="channelsBreakdown">
                    <div class="space-y-2">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Privati IRBEMA</span>
                            <span class="font-bold" id="sourcePrivatiIRBEMA">-</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Form eCura</span>
                            <span class="font-bold" id="sourceFormECura">-</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Form eCura x Test</span>
                            <span class="font-bold" id="sourceFormECuraTest">-</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">B2B IRBEMA</span>
                            <span class="font-bold" id="sourceB2BIRBEMA">-</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">Sito web Medica GB</span>
                            <span class="font-bold" id="sourceSitoWebMedicaGB">-</span>
                        </div>
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-gray-600">NETWORKING</span>
                            <span class="font-bold" id="sourceNetworking">-</span>
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
                    <input 
                        type="text" 
                        id="searchCognome" 
                        class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64" 
                        placeholder="🔍 Cerca per cognome..."
                        onkeyup="applyFilters()"
                    />
                    <select id="filterFonte" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="applyFilters()">
                        <option value="">Tutte le Fonti</option>
                        <option value="Privati IRBEMA">Privati IRBEMA</option>
                        <option value="Form eCura">Form eCura</option>
                        <option value="Form eCura x Test">Form eCura x Test</option>
                        <option value="B2B IRBEMA">B2B IRBEMA</option>
                        <option value="Sito web Medica GB">Sito web Medica GB</option>
                        <option value="NETWORKING">NETWORKING</option>
                    </select>
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
                    <select id="filterCM" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="applyFilters()">
                        <option value="">Tutti i CM</option>
                        <option value="nessuno">Nessuno</option>
                        <option value="SR">SR - Stefania Rocca</option>
                        <option value="OB">OB - Ottavia Belfa</option>
                        <option value="RP">RP - Roberto Poggi</option>
                    </select>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 text-sm font-semibold text-gray-600 w-12">#</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Cliente</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Contatti</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Servizio</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Piano</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Prezzo</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600 text-center">Contratto</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600 text-center">Brochure</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Data</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">CM</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Stato</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Azioni</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">CRUD</th>
                        </tr>
                    </thead>
                    <tbody id="leadsTableBody">
                        <tr>
                            <td colspan="13" class="py-8 text-center text-gray-400">
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
        // Helper function to escape HTML special characters
        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }

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
                
                // ✅ USA IL TOTALE REALE DAL SERVER (non allLeads.length)
                const totalLeads = leadsData.total || allLeads.length;
                
                // Calcola revenue totale SOLO dai contratti FIRMATI
                const contrattiResponse = await fetch('/api/contratti');
                const contrattiData = await contrattiResponse.json();
                const contratti = contrattiData.contracts || contrattiData.contratti || contrattiData.data || [];
                
                // TASK #1-2 FIX: Filtra solo contratti SIGNED o ACTIVE
                const contrattiFirmati = contratti.filter(c => 
                    c.status === 'SIGNED' || 
                    c.status === 'ACTIVE' || 
                    c.status === 'signed' || 
                    c.status === 'active'
                );
                
                // Calcola il tasso di conversione: contratti firmati / total leads
                const converted = contrattiFirmati.length;
                const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) + '%' : '0%';
                
                // Calcola revenue totale SOLO dai contratti firmati
                let totalValue = 0;
                contrattiFirmati.forEach(c => {
                    if (c.prezzo_totale) totalValue += parseFloat(c.prezzo_totale);
                });
                const today = new Date().toISOString().split('T')[0];
                const leadsToday = allLeads.filter(l => l.created_at && l.created_at.startsWith(today)).length;
                
                // Update KPIs
                document.getElementById('totalLeads').textContent = totalLeads;
                document.getElementById('conversionRate').textContent = conversionRate;
                document.getElementById('leadsToday').textContent = leadsToday;
                document.getElementById('totalValue').textContent = '\u20AC' + totalValue;
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
            const services = {};
            
            // Conta i servizi effettivi dai lead
            leads.forEach(l => {
                // PRIORITY: servizio > tipoServizio > default
                let service = l.servizio || l.tipoServizio || 'eCura PRO';
                
                // Normalizza i nomi dei servizi per consistenza
                service = service.trim();
                
                // Normalizza varianti del nome
                // IMPORTANTE: L'ordine è importante! Controlla "premium" prima di "pro"
                if (service.toLowerCase().includes('family')) {
                    service = 'eCura FAMILY';
                } else if (service.toLowerCase().includes('premium')) {
                    service = 'eCura PREMIUM';
                } else if (service.toLowerCase().includes('pro')) {
                    service = 'eCura PRO';
                }
                
                services[service] = (services[service] || 0) + 1;
            });
            
            // Debug: mostra servizi rilevati
            console.log('📊 Servizi rilevati:', services);
            
            const total = leads.length || 1;
            const colors = {
                'eCura FAMILY': 'bg-green-500',
                'eCura PRO': 'bg-purple-500',
                'eCura PREMIUM': 'bg-blue-500'
            };

            const html = Object.entries(services)
                .sort(([,a], [,b]) => b - a) // Ordina per count decrescente
                .map(([service, count]) => {
                    const percentage = Math.round((count / total) * 100);
                    const color = colors[service] || 'bg-gray-500';
                    return \`
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium">\${service}</span>
                                <span class="text-sm font-bold">\${count} (\${percentage}%)</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="\${color} h-2 rounded-full" style="width: \${percentage}%"></div>
                            </div>
                        </div>
                    \`;
                }).join('');

            document.getElementById('servicesBreakdown').innerHTML = html || '<p class="text-gray-400 text-sm">Nessun servizio disponibile</p>';
        }

        function updatePlansBreakdown(leads) {
            const counts = { 'BASE': 0, 'AVANZATO': 0 };
            leads.forEach(l => {
                // PRIORITY: piano > note > default BASE
                // NOTA: tipoServizio contiene il SERVIZIO (es. "eCura PRO"), NON il piano!
                let plan = 'BASE'; // default
                
                if (l.piano) {
                    // Nuovo campo piano (dopo migration 0006)
                    plan = l.piano.toUpperCase() === 'AVANZATO' ? 'AVANZATO' : 'BASE';
                } else if (l.note) {
                    // Fallback: cerca nelle note
                    plan = l.note.includes('Piano: AVANZATO') || l.note.includes('AVANZATO') ? 'AVANZATO' : 'BASE';
                }
                
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
            const sources = {};
            leads.forEach(l => {
                // PRIORITÀ: fonte è il campo principale
                const fonte = l.fonte || 'Non specificato';
                sources[fonte] = (sources[fonte] || 0) + 1;
            });
            
            // Debug: mostra tutte le fonti trovate
            console.log('📊 Fonti rilevate:', sources);
            console.log('📊 Total leads:', leads.length);
            
            // Conta per le 6 fonti principali
            let privatiIRBEMACount = 0;
            let formECuraCount = 0;
            let formECuraTestCount = 0;
            let b2bIRBEMACount = 0;
            let sitoWebMedicaGBCount = 0;
            let networkingCount = 0;
            let altroCount = 0;
            
            // Itera su tutte le fonti e classifica
            Object.keys(sources).forEach(source => {
                const count = sources[source];
                
                // Match esatto con le fonti definite
                if (source === 'Privati IRBEMA') {
                    privatiIRBEMACount += count;
                }
                else if (source === 'Form eCura') {
                    formECuraCount += count;
                }
                else if (source === 'Form eCura x Test') {
                    formECuraTestCount += count;
                }
                else if (source === 'B2B IRBEMA') {
                    b2bIRBEMACount += count;
                }
                else if (source === 'Sito web Medica GB') {
                    sitoWebMedicaGBCount += count;
                }
                else if (source === 'NETWORKING') {
                    networkingCount += count;
                }
                else {
                    // Altre fonti non categorizzate
                    altroCount += count;
                }
            });
            
            // Aggiorna i contatori nella dashboard
            document.getElementById('sourcePrivatiIRBEMA').textContent = privatiIRBEMACount;
            document.getElementById('sourceFormECura').textContent = formECuraCount;
            document.getElementById('sourceFormECuraTest').textContent = formECuraTestCount;
            document.getElementById('sourceB2BIRBEMA').textContent = b2bIRBEMACount;
            document.getElementById('sourceSitoWebMedicaGB').textContent = sitoWebMedicaGBCount;
            document.getElementById('sourceNetworking').textContent = networkingCount;
            
            // Log debug se ci sono fonti non categorizzate
            if (altroCount > 0) {
                console.warn('⚠️ ATTENZIONE: Ci sono ' + altroCount + ' lead con fonti non categorizzate.');
                console.warn('📊 Fonti non categorizzate:', Object.keys(sources).filter(s => 
                    s !== 'Privati IRBEMA' && 
                    s !== 'Form eCura' && 
                    s !== 'Form eCura x Test' && 
                    s !== 'B2B IRBEMA' && 
                    s !== 'Sito web Medica GB' && 
                    s !== 'NETWORKING'
                ));
            }
        }

        function renderLeadsTable(leads) {
            console.log('🔧 renderLeadsTable v2026-02-13-00:05 - escapeHtml FULLY APPLIED');
            const tbody = document.getElementById('leadsTableBody');
            
            if (leads.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="13" class="py-8 text-center text-gray-400">Nessun lead trovato</td>
                    </tr>
                \`;
                return;
            }

            tbody.innerHTML = leads.map((lead, index) => {
                // PRIORITY: piano > note > default BASE
                // NOTA: tipoServizio contiene il SERVIZIO, NON il piano!
                let piano = 'BASE';
                if (lead.piano) {
                    piano = lead.piano.toUpperCase() === 'AVANZATO' ? 'AVANZATO' : 'BASE';
                } else if (lead.note && lead.note.includes('Piano: AVANZATO')) {
                    piano = 'AVANZATO';
                }
                
                // ✅ USA PREZZO DAL DATABASE (IVA esclusa)
                const prezzo = lead.prezzo_anno || 0;
                const date = new Date(lead.created_at).toLocaleDateString('it-IT');
                // Usa il campo vuoleContratto dal lead
                const hasContract = lead.vuoleContratto === 'Si' || lead.vuoleContratto === true;
                
                // Mostra servizio così com'è dal DB (già con "eCura" se presente)
                const servizio = lead.servizio || lead.tipoServizio || 'eCura PRO';
                
                return \`
                    <tr class="border-b border-gray-100 hover:bg-gray-50" title="ID: \${escapeHtml(lead.id)}">
                        <td class="py-3 text-sm text-gray-600 font-medium">\${leads.length - index}</td>
                        <td class="py-3 text-sm">
                            <div class="font-medium">\${(lead.nomeRichiedente && lead.cognomeRichiedente) ? escapeHtml(lead.nomeRichiedente + ' ' + lead.cognomeRichiedente) : escapeHtml(lead.email || 'N/A')}</div>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="text-sm text-gray-600">
                                <i class="fas fa-envelope text-gray-400 mr-1"></i>\${escapeHtml(lead.email || '') || '-'}
                            </div>
                            <div class="text-sm text-gray-600 mt-1">
                                <i class="fas fa-phone text-gray-400 mr-1"></i>\${escapeHtml(lead.telefono || '') || '-'}
                            </div>
                        </td>
                        <td class="py-3 text-sm">
                            <span class="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded font-medium">
                                \${servizio}
                            </span>
                        </td>
                        <td class="py-3 text-sm">
                            <span class="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded font-medium">
                                \${piano}
                            </span>
                        </td>
                        <td class="py-3 text-sm font-bold text-green-600">€\${prezzo}</td>
                        <td class="py-3 text-center text-sm">
                            <i class="fas fa-\${hasContract ? 'check-circle text-green-500' : 'times-circle text-gray-300'}"></i>
                        </td>
                        <td class="py-3 text-center text-sm">
                            <i class="fas fa-\${lead.vuoleBrochure === 'Si' ? 'check-circle text-green-500' : 'times-circle text-gray-300'}"></i>
                        </td>
                        <td class="py-3 text-sm text-gray-500">\${date}</td>
                        <td class="py-3 text-sm">
                            <select 
                                data-lead-id="\${lead.id}"
                                class="cm-select text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 \${lead.cm ? 'bg-blue-50 font-medium' : 'bg-white'}"
                                style="min-width: 80px;">
                                <option value="" \${!lead.cm ? 'selected' : ''}>nessuno</option>
                                <option value="OB" \${lead.cm === 'OB' ? 'selected' : ''}>OB</option>
                                <option value="SR" \${lead.cm === 'SR' ? 'selected' : ''}>SR</option>
                                <option value="RP" \${lead.cm === 'RP' ? 'selected' : ''}>RP</option>
                            </select>
                        </td>
                        <td class="py-3 text-sm">
                            <select 
                                data-lead-id="\${lead.id}"
                                class="status-select text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 font-medium"
                                style="min-width: 110px;">
                                <option value="" \${!lead.stato ? 'selected' : ''}>Nessuno</option>
                                <option value="nuovo" \${lead.stato === 'nuovo' ? 'selected' : ''} class="bg-blue-50">🆕 Nuovo</option>
                                <option value="contattato" \${lead.stato === 'contattato' ? 'selected' : ''} class="bg-yellow-50">📞 Contattato</option>
                                <option value="interessato" \${lead.stato === 'interessato' ? 'selected' : ''} class="bg-green-50">✨ Interessato</option>
                                <option value="in_trattativa" \${lead.stato === 'in_trattativa' ? 'selected' : ''} class="bg-indigo-50">💼 In Trattativa</option>
                                <option value="convertito" \${lead.stato === 'convertito' ? 'selected' : ''} class="bg-green-100">✅ Convertito</option>
                                <option value="perso" \${lead.stato === 'perso' ? 'selected' : ''} class="bg-red-50">❌ Perso</option>
                                <option value="non_interessato" \${lead.stato === 'non_interessato' ? 'selected' : ''} class="bg-gray-100">⛔ Non Interessato</option>
                                <option value="da_ricontattare" \${lead.stato === 'da_ricontattare' ? 'selected' : ''} class="bg-yellow-100">🔄 Da Ricontattare</option>
                            </select>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="flex space-x-1">
                                <button 
                                    data-action="interactions"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors relative action-btn"
                                    title="Gestisci Interazioni">
                                    💬
                                    <span class="interactions-count-\${lead.id} hidden absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold" style="font-size: 9px;"></span>
                                </button>
                                <button 
                                    data-action="contract"
                                    data-lead-id="\${lead.id}"
                                    data-piano="\${piano}"
                                    class="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors action-btn"
                                    title="Invia Contratto \${piano}">
                                    <i class="fas fa-file-contract"></i>
                                </button>
                                <button 
                                    data-action="brochure"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors action-btn"
                                    title="Invia Brochure">
                                    <i class="fas fa-book"></i>
                                </button>
                                <button 
                                    data-action="completion"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors action-btn"
                                    title="Richiedi Completamento">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                            </div>
                        </td>
                        <td class="py-3">
                            <div class="flex space-x-1">
                                <button data-action="view" data-lead-id="\${lead.id}" 
                                        class="text-blue-600 hover:text-blue-800 px-1 crud-btn" 
                                        title="Visualizza">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button data-action="edit" data-lead-id="\${lead.id}" 
                                        class="text-green-600 hover:text-green-800 px-1 crud-btn" 
                                        title="Modifica">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button data-action="delete" data-lead-id="\${lead.id}" 
                                        class="text-red-600 hover:text-red-800 px-1 crud-btn" 
                                        title="Elimina">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                \`;
            }).join('');
            
            // Attach event listeners to dynamically created buttons
            setTimeout(() => {
                // Action buttons (contract, brochure, completion, interactions)
                document.querySelectorAll('.action-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const action = this.getAttribute('data-action');
                        const leadId = this.getAttribute('data-lead-id');
                        const piano = this.getAttribute('data-piano');
                        
                        if (action === 'interactions') openInteractionsModal(leadId);
                        else if (action === 'contract') sendContract(leadId, piano);
                        else if (action === 'brochure') sendBrochure(leadId);
                        else if (action === 'completion') requestCompletion(leadId);
                    });
                });
                
                // CRUD buttons (view, edit, delete)
                document.querySelectorAll('.crud-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const action = this.getAttribute('data-action');
                        const leadId = this.getAttribute('data-lead-id');
                        
                        if (action === 'view') viewLead(leadId);
                        else if (action === 'edit') editLead(leadId);
                        else if (action === 'delete') deleteLead(leadId);
                    });
                });
                
                // CM select dropdowns
                document.querySelectorAll('.cm-select').forEach(select => {
                    select.addEventListener('change', function() {
                        const leadId = this.getAttribute('data-lead-id');
                        const value = this.value;
                        updateContactManager(leadId, value);
                    });
                });
                
                // Status select dropdowns
                document.querySelectorAll('.status-select').forEach(select => {
                    select.addEventListener('change', function() {
                        const leadId = this.getAttribute('data-lead-id');
                        const value = this.value;
                        updateLeadStatus(leadId, value);
                    });
                });
            }, 0);
        }

        function applyFilters() {
            const fonteFilter = document.getElementById('filterFonte').value;
            const servizioFilter = document.getElementById('filterServizio').value;
            const pianoFilter = document.getElementById('filterPiano').value;
            const cmFilter = document.getElementById('filterCM').value;
            const searchCognome = document.getElementById('searchCognome').value.toLowerCase().trim();

            const filtered = allLeads.filter(lead => {
                // Filtro Fonte: match esatto con il campo fonte
                const leadFonte = lead.fonte || '';
                const matchFonte = !fonteFilter || leadFonte === fonteFilter;
                
                // Filtro Servizio: cerca nel campo servizio o tipoServizio del DB
                // Normalizza: "eCura PRO" -> "PRO", "eCura FAMILY" -> "FAMILY"
                let leadServizio = lead.servizio || lead.tipoServizio || '';
                
                // Rimuovi "eCura " se presente per normalizzare
                if (leadServizio.includes('eCura')) {
                    leadServizio = leadServizio.replace(/eCura\s*/i, '').trim();
                }
                
                const matchServizio = !servizioFilter || leadServizio.toUpperCase() === servizioFilter.toUpperCase();
                
                // Filtro Piano: cerca nel campo piano o nelle note come fallback
                let leadPiano = 'BASE'; // default
                if (lead.piano) {
                    leadPiano = lead.piano.toUpperCase() === 'AVANZATO' ? 'AVANZATO' : 'BASE';
                } else if (lead.note) {
                    leadPiano = (lead.note.includes('Piano: AVANZATO') || lead.note.includes('AVANZATO')) ? 'AVANZATO' : 'BASE';
                }
                const matchPiano = !pianoFilter || leadPiano === pianoFilter;
                
                // Filtro CM: confronta con il campo cm del lead
                const leadCM = lead.cm || '';
                const matchCM = !cmFilter || 
                    (cmFilter === 'nessuno' && !leadCM) || 
                    (cmFilter !== 'nessuno' && leadCM === cmFilter);
                
                // Filtro cognome: cerca in cognomeRichiedente o cognomeAssistito
                const cognomeRichiedente = (lead.cognomeRichiedente || '').toLowerCase();
                const cognomeAssistito = (lead.cognomeAssistito || '').toLowerCase();
                const matchCognome = !searchCognome || 
                    cognomeRichiedente.includes(searchCognome) || 
                    cognomeAssistito.includes(searchCognome);
                
                return matchFonte && matchServizio && matchPiano && matchCM && matchCognome;
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
                    alert('✅ Contratto inviato con successo!\\n\\nCodice: ' + (result.contractCode || 'N/A') + '\\nTemplate: email_invio_contratto');
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
                    alert('✅ Brochure inviata con successo!\\nTemplate: email_invio_brochure');
                    loadLeadsData(); // Ricarica i dati
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }

        async function requestCompletion(leadId) {
            if (!confirm('Inviare email di richiesta completamento dati al lead?')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/request-completion?sendEmail=true\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Email di completamento inviata con successo!\\nLink: ' + (result.token?.completionUrl || result.completionUrl) + '\\nScadenza: ' + (result.token?.expiresAt || result.expiresAt));
                    loadLeadsData(); // Ricarica i dati
                } else {
                    // Gestisci caso lead già completo
                    if (result.error && result.error.includes('già completo')) {
                        alert('ℹ️ Tutti i dati del lead sono già completi.\\n\\nNon è necessario inviare l\\'email di richiesta completamento.');
                    } else {
                        alert('❌ Errore: ' + result.error);
                    }
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
            
            // Mostra servizio e piano dal DB (se esistono i campi)
            // NOTA: tipoServizio contiene il SERVIZIO, non il piano!
            const servizio = lead.servizio || lead.tipoServizio || 'eCura PRO';
            const piano = lead.piano || 'BASE';  // Piano estratto dalle note durante migration
            
            document.getElementById('viewLeadId').textContent = lead.id;
            document.getElementById('viewNome').textContent = lead.nomeRichiedente || '-';
            document.getElementById('viewCognome').textContent = lead.cognomeRichiedente || '-';
            document.getElementById('viewEmail').textContent = lead.email || lead.email || '-';
            document.getElementById('viewTelefono').textContent = lead.telefono || lead.telefono || '-';
            document.getElementById('viewServizio').textContent = servizio;
            document.getElementById('viewPiano').textContent = piano;
            document.getElementById('viewNote').textContent = lead.note || '-';
            document.getElementById('viewData').textContent = new Date(lead.created_at).toLocaleDateString('it-IT');
            document.getElementById('viewCM').textContent = lead.cm || 'Nessuno';
            
            // Carica lo storico interazioni
            loadInteractions(leadId);
            
            openModal('viewLeadModal');
        }
        
        async function loadInteractions(leadId) {
            try {
                const response = await fetch(\`/api/leads/\${leadId}/interactions\`);
                const data = await response.json();
                
                const container = document.getElementById('interactionsList');
                
                if (!data.success || data.interactions.length === 0) {
                    container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">Nessuna interazione registrata</p>';
                    return;
                }
                
                // Ordina per data decrescente (più recenti prima)
                const interactions = data.interactions.sort((a, b) => 
                    new Date(b.data).getTime() - new Date(a.data).getTime()
                );
                
                container.innerHTML = interactions.map(int => {
                    const date = new Date(int.data).toLocaleString('it-IT');
                    const tipoIcon = {
                        'telefono': 'fa-phone',
                        'email': 'fa-envelope',
                        'whatsapp': 'fa-whatsapp',
                        'sms': 'fa-sms',
                        'meeting': 'fa-handshake',
                        'videocall': 'fa-video',
                        'nota': 'fa-sticky-note',
                        'follow-up': 'fa-clock'
                    }[int.tipo] || 'fa-comment';
                    
                    const tipoColor = {
                        'telefono': 'bg-blue-100 text-blue-700',
                        'email': 'bg-green-100 text-green-700',
                        'whatsapp': 'bg-green-100 text-green-700',
                        'sms': 'bg-purple-100 text-purple-700',
                        'meeting': 'bg-yellow-100 text-yellow-700',
                        'videocall': 'bg-indigo-100 text-indigo-700',
                        'nota': 'bg-gray-100 text-gray-700',
                        'follow-up': 'bg-orange-100 text-orange-700'
                    }[int.tipo] || 'bg-gray-100 text-gray-700';
                    
                    return \`
                        <div class="border-l-4 border-blue-500 bg-gray-50 p-3 rounded-r mb-3">
                            <div class="flex items-start justify-between mb-2">
                                <div class="flex items-center space-x-2">
                                    <span class="px-2 py-1 \${tipoColor} text-xs rounded font-medium">
                                        <i class="fas \${tipoIcon} mr-1"></i>\${int.tipo}
                                    </span>
                                    <span class="text-xs text-gray-500">\${date}</span>
                                </div>
                                <span class="text-xs font-medium text-gray-600">\${int.operatore || 'N/A'}</span>
                            </div>
                            <p class="text-sm text-gray-700 mb-1"><strong>Nota:</strong> \${int.nota || '-'}</p>
                            \${int.azione ? \`<p class="text-sm text-gray-700"><strong>Azione:</strong> \${int.azione}</p>\` : ''}
                        </div>
                    \`;
                }).join('');
            } catch (error) {
                console.error('Errore caricamento interazioni:', error);
                document.getElementById('interactionsList').innerHTML = 
                    '<p class="text-red-500 text-sm text-center py-4">Errore caricamento interazioni</p>';
            }
        }
        
        async function addInteraction() {
            const leadId = document.getElementById('viewLeadId').textContent;
            const tipo = document.getElementById('interactionTipo').value;
            const nota = document.getElementById('interactionNota').value.trim();
            const azione = document.getElementById('interactionAzione').value.trim();
            const operatore = document.getElementById('interactionOperatore').value;
            
            if (!nota) {
                alert('⚠️ Inserisci una nota per l\\'interazione');
                return;
            }
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/interactions\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipo, nota, azione, operatore })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Reset form
                    document.getElementById('interactionNota').value = '';
                    document.getElementById('interactionAzione').value = '';
                    
                    // Ricarica interazioni
                    await loadInteractions(leadId);
                    
                    alert('✅ Interazione aggiunta con successo');
                } else {
                    alert('❌ Errore: ' + (data.error || 'Impossibile aggiungere interazione'));
                }
            } catch (error) {
                console.error('Errore aggiunta interazione:', error);
                alert('❌ Errore di rete');
            }
        }
        
        function editLead(leadId) {
            const lead = allLeads.find(l => l.id === leadId);
            if (!lead) {
                alert('❌ Lead non trovato');
                return;
            }
            
            // Usa lo stesso modal del nuovo lead, ma con dati pre-compilati
            // Imposta flag edit mode
            window.editingLeadId = leadId;
            
            // Pre-compila TUTTI i campi
            document.getElementById('newNome').value = lead.nomeRichiedente || '';
            document.getElementById('newCognome').value = lead.cognomeRichiedente || '';
            document.getElementById('newEmail').value = lead.email || lead.email || '';
            document.getElementById('newTelefono').value = lead.telefono || lead.telefono || '';
            
            document.getElementById('newNomeAssistito').value = lead.nomeAssistito || '';
            document.getElementById('newCognomeAssistito').value = lead.cognomeAssistito || '';
            document.getElementById('newLuogoNascita').value = lead.luogoNascitaAssistito || '';
            document.getElementById('newDataNascita').value = lead.dataNascitaAssistito || '';
            document.getElementById('newIndirizzoAssistito').value = lead.indirizzoAssistito || '';
            document.getElementById('newCapAssistito').value = lead.capAssistito || '';
            document.getElementById('newCittaAssistito').value = lead.cittaAssistito || '';
            document.getElementById('newProvinciaAssistito').value = lead.provinciaAssistito || '';
            document.getElementById('newCodiceFiscale').value = lead.cfAssistito || lead.cfAssistito || '';
            document.getElementById('newCondizioniSalute').value = lead.condizioniSalute || '';
            
            // Intestatario contratto
            const intestatario = lead.intestatarioContratto || 'richiedente';
            if (intestatario === 'richiedente') {
                document.getElementById('newIntestatarioRichiedente').checked = true;
            } else {
                document.getElementById('newIntestatarioAssistito').checked = true;
            }
            
            document.getElementById('newServizio').value = lead.servizio || 'eCura PRO';
            updatePrices(); // Aggiorna prezzi in base al servizio
            document.getElementById('newPiano').value = lead.piano || 'BASE';
            document.getElementById('newCanale').value = lead.fonte || 'Website';
            
            document.getElementById('newVuoleBrochure').checked = (lead.vuoleBrochure === 'Si');
            document.getElementById('newVuoleContratto').checked = (lead.vuoleContratto === 'Si');
            document.getElementById('newVuoleManuale').checked = (lead.vuoleManuale === 'Si');
            
            document.getElementById('newConsensoPrivacy').checked = (lead.gdprConsent === 1);
            document.getElementById('newConsensoMarketing').checked = (lead.consensoMarketing === 'Si');
            document.getElementById('newConsensoTerze').checked = (lead.consensoTerze === 'Si');
            
            document.getElementById('newNote').value = lead.note || '';
            
            // Cambia titolo e sottotitolo modal per edit mode
            const modalTitle = document.querySelector('#newLeadModal h2');
            const modalSubtitle = document.querySelector('#newLeadModal .text-blue-100');
            const submitButton = document.getElementById('submitLeadButton');
            
            if (modalTitle) {
                modalTitle.textContent = '✏️ Modifica Lead';
            }
            if (modalSubtitle) {
                modalSubtitle.textContent = 'Modifica i dati del lead esistente';
            }
            if (submitButton) {
                submitButton.innerHTML = '💾 Aggiorna Lead';
            }
            
            // Rimuovi required dai campi in edit mode (puoi modificare solo alcuni campi)
            document.querySelectorAll('#newLeadForm [required]').forEach(field => {
                field.removeAttribute('required');
            });
            
            // Mostra sezione interazioni e carica lo storico
            const interactionsSection = document.getElementById('editInteractionsSection');
            if (interactionsSection) {
                interactionsSection.classList.remove('hidden');
                loadEditInteractions(leadId);
            }
            
            openModal('newLeadModal');
        }
        
        async function loadEditInteractions(leadId) {
            try {
                const response = await fetch(\`/api/leads/\${leadId}/interactions\`);
                const data = await response.json();
                
                const container = document.getElementById('editInteractionsList');
                
                if (!data.success || data.interactions.length === 0) {
                    container.innerHTML = '<p class="text-gray-500 text-xs text-center py-4">Nessuna interazione registrata</p>';
                    return;
                }
                
                // Ordina per data decrescente (più recenti prima)
                const interactions = data.interactions.sort((a, b) => 
                    new Date(b.data).getTime() - new Date(a.data).getTime()
                );
                
                container.innerHTML = interactions.map(int => {
                    const date = new Date(int.data).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' });
                    const tipoIcon = {
                        'telefono': 'fa-phone',
                        'email': 'fa-envelope',
                        'whatsapp': 'fa-whatsapp',
                        'sms': 'fa-sms',
                        'meeting': 'fa-handshake',
                        'videocall': 'fa-video',
                        'nota': 'fa-sticky-note',
                        'follow-up': 'fa-clock'
                    }[int.tipo] || 'fa-comment';
                    
                    const tipoColor = {
                        'telefono': 'bg-blue-100 text-blue-700',
                        'email': 'bg-green-100 text-green-700',
                        'whatsapp': 'bg-green-100 text-green-700',
                        'sms': 'bg-purple-100 text-purple-700',
                        'meeting': 'bg-yellow-100 text-yellow-700',
                        'videocall': 'bg-indigo-100 text-indigo-700',
                        'nota': 'bg-gray-100 text-gray-700',
                        'follow-up': 'bg-orange-100 text-orange-700'
                    }[int.tipo] || 'bg-gray-100 text-gray-700';
                    
                    return \`
                        <div class="border-l-4 border-blue-500 bg-white p-2 rounded-r mb-2 text-xs">
                            <div class="flex items-start justify-between mb-1">
                                <div class="flex items-center space-x-2">
                                    <span class="px-2 py-0.5 \${tipoColor} text-xs rounded font-medium">
                                        <i class="fas \${tipoIcon} mr-1"></i>\${int.tipo}
                                    </span>
                                    <span class="text-xs text-gray-500">\${date}</span>
                                </div>
                                <span class="text-xs font-medium text-gray-600">\${int.operatore || 'N/A'}</span>
                            </div>
                            <p class="text-xs text-gray-700 mb-1"><strong>Nota:</strong> \${int.nota || '-'}</p>
                            \${int.azione ? \`<p class="text-xs text-gray-700"><strong>Azione:</strong> \${int.azione}</p>\` : ''}
                        </div>
                    \`;
                }).join('');
            } catch (error) {
                console.error('Errore caricamento interazioni:', error);
                document.getElementById('editInteractionsList').innerHTML = 
                    '<p class="text-red-500 text-xs text-center py-4">Errore caricamento</p>';
            }
        }
        
        async function addEditInteraction() {
            const leadId = window.editingLeadId;
            if (!leadId) {
                alert('❌ Lead ID non trovato');
                return;
            }
            
            const tipo = document.getElementById('editInteractionTipo').value;
            const nota = document.getElementById('editInteractionNota').value.trim();
            const azione = document.getElementById('editInteractionAzione').value.trim();
            const operatore = document.getElementById('editInteractionOperatore').value;
            
            if (!nota) {
                alert('⚠️ Inserisci una nota per l\\'interazione');
                return;
            }
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/interactions\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipo, nota, azione, operatore })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Reset form
                    document.getElementById('editInteractionNota').value = '';
                    document.getElementById('editInteractionAzione').value = '';
                    
                    // Ricarica interazioni
                    await loadEditInteractions(leadId);
                    
                    alert('✅ Interazione aggiunta con successo');
                } else {
                    alert('❌ Errore: ' + (data.error || 'Impossibile aggiungere interazione'));
                }
            } catch (error) {
                console.error('Errore aggiunta interazione:', error);
                alert('❌ Errore di rete');
            }
        }
        
        // saveEditLead() rimossa - ora usa saveNewLead() con modalità edit
        
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
                    loadLeadsData();
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }
        
        async function updateContactManager(leadId, cm) {
            try {
                const response = await fetch(\`/api/leads/\${leadId}/cm\`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ cm: cm || null })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Aggiorna il valore in allLeads
                    const lead = allLeads.find(l => l.id === leadId);
                    if (lead) {
                        lead.cm = cm || null;
                    }
                    console.log(\`✅ Contact Manager aggiornato: \${leadId} → \${cm || 'nessuno'}\`);
                } else {
                    alert('❌ Errore aggiornamento CM: ' + result.error);
                    loadLeadsData(); // Ricarica per ripristinare il valore precedente
                }
            } catch (error) {
                console.error('❌ Errore aggiornamento CM:', error);
                alert('❌ Errore di comunicazione: ' + error.message);
                loadLeadsData(); // Ricarica per ripristinare il valore precedente
            }
        }
        
        async function updateLeadStatus(leadId, stato) {
            try {
                const response = await fetch(\`/api/leads/\${leadId}\`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ stato: stato || null })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Aggiorna il valore in allLeads
                    const lead = allLeads.find(l => l.id === leadId);
                    if (lead) {
                        lead.stato = stato || null;
                    }
                    
                    // Aggiorna il colore dello sfondo del select
                    const select = document.getElementById(\`statusSelect-\${leadId}\`);
                    if (select) {
                        const colors = {
                            'nuovo': '#dbeafe',
                            'contattato': '#fef3c7',
                            'interessato': '#d1fae5',
                            'in_trattativa': '#e0e7ff',
                            'convertito': '#d1fae5',
                            'perso': '#fee2e2',
                            'non_interessato': '#f3f4f6',
                            'da_ricontattare': '#fef3c7'
                        };
                        select.style.background = colors[stato] || '#fff';
                    }
                    
                    console.log(\`✅ Stato aggiornato: \${leadId} → \${stato || 'nessuno'}\`);
                } else {
                    alert('❌ Errore aggiornamento stato: ' + result.error);
                    loadLeadsData();
                }
            } catch (error) {
                console.error('❌ Errore aggiornamento stato:', error);
                alert('❌ Errore di comunicazione: ' + error.message);
                loadLeadsData();
            }
        }
        
        function openInteractionsModal(leadId) {
            window.currentInteractionLeadId = leadId;
            const lead = allLeads.find(l => l.id === leadId);
            if (!lead) {
                alert('❌ Lead non trovato');
                return;
            }
            
            // Popola info lead nel modale
            document.getElementById('intModalLeadName').textContent = 
                (lead.nomeRichiedente || '') + ' ' + (lead.cognomeRichiedente || '').trim() || lead.email;
            document.getElementById('intModalLeadContact').textContent = 
                (lead.email || '') + ' • ' + (lead.telefono || '');
            document.getElementById('intModalLeadId').textContent = leadId;
            
            // Carica lo storico interazioni
            loadInteractionsModal(leadId);
            
            // Reset form nuova interazione
            document.getElementById('intModalTipo').value = 'telefono';
            document.getElementById('intModalOperatore').value = 'Ottavia Belfa';
            document.getElementById('intModalNota').value = '';
            document.getElementById('intModalAzione').value = '';
            
            // Attach event listeners to modal buttons
            setTimeout(() => {
                const saveBtn = document.getElementById('saveInteractionBtn');
                const closeBtn = document.getElementById('closeInteractionsModalBtn');
                
                if (saveBtn) {
                    saveBtn.replaceWith(saveBtn.cloneNode(true)); // Remove old listeners
                    document.getElementById('saveInteractionBtn').addEventListener('click', addInteractionFromModal);
                }
                
                if (closeBtn) {
                    closeBtn.replaceWith(closeBtn.cloneNode(true)); // Remove old listeners
                    document.getElementById('closeInteractionsModalBtn').addEventListener('click', () => closeModal('interactionsModal'));
                }
            }, 0);
            
            // Apri il modale
            openModal('interactionsModal');
        }
        
        async function loadInteractionsModal(leadId) {
            try {
                const response = await fetch('/api/leads/' + leadId + '/interactions');
                const data = await response.json();
                
                const container = document.getElementById('intModalInteractionsList');
                
                if (!data.success || data.interactions.length === 0) {
                    container.innerHTML = '<p class="text-gray-500 text-xs text-center py-4">📭 Nessuna interazione registrata per questo lead</p>';
                    return;
                }
                
                // Ordina per data decrescente (più recenti prima)
                const interactions = data.interactions.sort((a, b) => 
                    new Date(b.data).getTime() - new Date(a.data).getTime()
                );
                
                container.innerHTML = interactions.map(int => {
                    const date = new Date(int.data).toLocaleString('it-IT', { 
                        dateStyle: 'short', 
                        timeStyle: 'short' 
                    });
                    const tipoIcon = {
                        'telefono': 'fa-phone',
                        'email': 'fa-envelope',
                        'whatsapp': 'fa-whatsapp',
                        'sms': 'fa-sms',
                        'meeting': 'fa-handshake',
                        'videocall': 'fa-video',
                        'nota': 'fa-sticky-note',
                        'follow-up': 'fa-clock'
                    }[int.tipo] || 'fa-comment';
                    
                    const tipoColor = {
                        'telefono': 'bg-blue-100 text-blue-700 border-blue-300',
                        'email': 'bg-green-100 text-green-700 border-green-300',
                        'whatsapp': 'bg-green-100 text-green-700 border-green-300',
                        'sms': 'bg-purple-100 text-purple-700 border-purple-300',
                        'meeting': 'bg-yellow-100 text-yellow-700 border-yellow-300',
                        'videocall': 'bg-indigo-100 text-indigo-700 border-indigo-300',
                        'nota': 'bg-gray-100 text-gray-700 border-gray-300',
                        'follow-up': 'bg-orange-100 text-orange-700 border-orange-300'
                    }[int.tipo] || 'bg-gray-100 text-gray-700 border-gray-300';
                    
                    let html = '<div class="mb-3 p-3 bg-white border-l-4 ' + tipoColor + ' rounded-lg shadow-sm">';
                    html += '<div class="flex justify-between items-start mb-2">';
                    html += '<span class="inline-flex items-center px-2 py-1 text-xs font-medium ' + tipoColor + ' rounded">';
                    html += '<i class="fas ' + tipoIcon + ' mr-1"></i> ' + int.tipo.toUpperCase();
                    html += '</span>';
                    html += '<span class="text-xs text-gray-500">' + date + '</span>';
                    html += '</div>';
                    html += '<p class="text-sm text-gray-800 mb-1"><strong>Nota:</strong> ' + (int.nota || '-') + '</p>';
                    if (int.azione) {
                        html += '<p class="text-sm text-blue-700"><strong>Azione:</strong> ' + int.azione + '</p>';
                    }
                    if (int.operatore) {
                        html += '<p class="text-xs text-gray-600 mt-2"><i class="fas fa-user-circle"></i> <strong>' + int.operatore + '</strong></p>';
                    }
                    html += '</div>';
                    return html;
                }).join('');
            } catch (error) {
                console.error('Errore caricamento interazioni:', error);
                document.getElementById('intModalInteractionsList').innerHTML = 
                    '<p class="text-red-500 text-xs text-center py-4">❌ Errore nel caricamento delle interazioni</p>';
            }
        }
        
        async function addInteractionFromModal() {
            const leadId = window.currentInteractionLeadId;
            if (!leadId) {
                alert('❌ Errore: ID lead non trovato');
                return;
            }
            
            const tipo = document.getElementById('intModalTipo').value;
            const operatore = document.getElementById('intModalOperatore').value;
            const nota = document.getElementById('intModalNota').value.trim();
            const azione = document.getElementById('intModalAzione').value.trim();
            
            if (!nota) {
                alert('⚠️ Inserisci una nota per l\'interazione');
                return;
            }
            
            try {
                const response = await fetch('/api/leads/' + leadId + '/interactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        data: new Date().toISOString(),
                        tipo,
                        nota,
                        azione: azione || null,
                        operatore
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('✅ Interazione salvata con successo!');
                    // Ricarica lo storico
                    loadInteractionsModal(leadId);
                    // Reset form
                    document.getElementById('intModalNota').value = '';
                    document.getElementById('intModalAzione').value = '';
                } else {
                    alert('❌ Errore: ' + (data.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                console.error('Errore salvataggio interazione:', error);
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
            
            // Reset edit mode quando si chiude il modal newLeadModal
            if (modalId === 'newLeadModal') {
                window.editingLeadId = null;
                const modalTitle = document.querySelector('#newLeadModal h2');
                const modalSubtitle = document.querySelector('#newLeadModal .text-blue-100');
                const submitButton = document.getElementById('submitLeadButton');
                
                if (modalTitle) {
                    modalTitle.textContent = '🆕 Richiedi il tuo servizio eCura';
                }
                if (modalSubtitle) {
                    modalSubtitle.textContent = 'Compila il form per ricevere brochure e contratto personalizzato';
                }
                if (submitButton) {
                    submitButton.innerHTML = '✉️ Invia Richiesta';
                }
                
                // Ripristina i required
                const requiredFields = ['newNome', 'newCognome', 'newEmail', 'newTelefono', 
                    'newNomeAssistito', 'newCognomeAssistito', 'newLuogoNascita', 'newDataNascita'];
                requiredFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) field.setAttribute('required', 'required');
                });
            }
        }
        
        function openNewLeadModal() {
            // Reset edit mode
            window.editingLeadId = null;
            
            // Reset form
            document.getElementById('newLeadForm').reset();
            
            // Reset titolo, sottotitolo, pulsante e modalità
            document.getElementById('isEditMode').value = '';
            const modalTitle = document.querySelector('#newLeadModal h2');
            const modalSubtitle = document.querySelector('#newLeadModal .text-blue-100');
            const submitButton = document.getElementById('submitLeadButton');
            
            if (modalTitle) {
                modalTitle.textContent = '🆕 Richiedi il tuo servizio eCura';
            }
            if (modalSubtitle) {
                modalSubtitle.textContent = 'Compila il form per ricevere brochure e contratto personalizzato';
            }
            if (submitButton) {
                submitButton.innerHTML = '✉️ Invia Richiesta';
            }
            
            // Ripristina i required sui campi obbligatori
            const requiredFields = ['newNome', 'newCognome', 'newEmail', 'newTelefono', 
                'newNomeAssistito', 'newCognomeAssistito', 'newLuogoNascita', 'newDataNascita'];
            requiredFields.forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field) field.setAttribute('required', 'required');
            });
            
            // Nascondi sezione interazioni (solo per Edit)
            const interactionsSection = document.getElementById('editInteractionsSection');
            if (interactionsSection) {
                interactionsSection.classList.add('hidden');
            }
            
            openModal('newLeadModal');
            // Aggiorna prezzi iniziali
            updatePrices();
            
            // Aggiungi event listener per calcolo età automatico
            const dataNascitaInput = document.getElementById('newDataNascita');
            if (dataNascitaInput) {
                dataNascitaInput.addEventListener('blur', calculateAge);
                dataNascitaInput.addEventListener('change', calculateAge);
            }
        }
        
        function calculateAge() {
            const dataNascitaInput = document.getElementById('newDataNascita');
            const etaDisplay = document.getElementById('etaCalcolata');
            
            if (!dataNascitaInput || !dataNascitaInput.value) {
                if (etaDisplay) etaDisplay.textContent = '';
                return;
            }
            
            // Parse data in formato DD/MM/YYYY
            const dataNascitaValue = dataNascitaInput.value.trim();
            const parts = dataNascitaValue.split('/');
            
            if (parts.length !== 3) {
                if (etaDisplay) etaDisplay.textContent = 'Formato non valido (usa DD/MM/YYYY)';
                return;
            }
            
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // I mesi in JS partono da 0
            const year = parseInt(parts[2], 10);
            
            if (isNaN(day) || isNaN(month) || isNaN(year)) {
                if (etaDisplay) etaDisplay.textContent = 'Data non valida';
                return;
            }
            
            const dataNascita = new Date(year, month, day);
            const oggi = new Date();
            
            let eta = oggi.getFullYear() - dataNascita.getFullYear();
            const meseOggi = oggi.getMonth();
            const giornoOggi = oggi.getDate();
            
            // Aggiusta età se il compleanno non è ancora passato quest'anno
            if (meseOggi < dataNascita.getMonth() || 
                (meseOggi === dataNascita.getMonth() && giornoOggi < dataNascita.getDate())) {
                eta--;
            }
            
            if (eta < 0 || eta > 120) {
                if (etaDisplay) etaDisplay.textContent = 'Et\u00E0 non valida';
                return;
            }
            
            if (etaDisplay) {
                etaDisplay.textContent = 'Et\u00E0: ' + eta + ' anni';
                etaDisplay.className = 'text-sm font-semibold text-green-600 mt-1';
            }
        }
        
        function updatePrices() {
            const servizio = document.getElementById('newServizio').value;
            const pianoSelect = document.getElementById('newPiano');
            const priceNote = document.getElementById('priceNote');
            
            // Prezzi per servizio (primo anno / rinnovo) - AGGIORNATI da ecura.it
            const prices = {
                'eCura Family': {
                    BASE: { primo: 390, rinnovo: 200 },
                    AVANZATO: { primo: 690, rinnovo: 500 }
                },
                'eCura PRO': {
                    BASE: { primo: 480, rinnovo: 240 },
                    AVANZATO: { primo: 840, rinnovo: 600 }
                },
                'eCura PREMIUM': {
                    BASE: { primo: 590, rinnovo: 300 },
                    AVANZATO: { primo: 990, rinnovo: 750 }
                }
            };
            
            if (!servizio || !prices[servizio]) {
                pianoSelect.innerHTML = '<option value="">Seleziona prima un servizio</option>';
                priceNote.textContent = 'Seleziona un servizio per vedere i prezzi';
                return;
            }
            
            const servicePrices = prices[servizio];
            const dispositivo = servizio.includes('PREMIUM') ? 'SiDLY Vital Care' : 'SiDLY Care PRO';
            
            pianoSelect.innerHTML = \`
                <option value="BASE">Piano BASE - €\${servicePrices.BASE.primo}/anno (rinnovo €\${servicePrices.BASE.rinnovo}/anno)</option>
                <option value="AVANZATO">Piano AVANZATO - €\${servicePrices.AVANZATO.primo}/anno (rinnovo €\${servicePrices.AVANZATO.rinnovo}/anno)</option>
            \`;
            
            priceNote.textContent = \`I prezzi mostrati sono per il servizio \${servizio}. Include dispositivo \${dispositivo}.\`;
        }
        
        async function saveNewLead() {
            const isEditMode = !!window.editingLeadId;
            const leadId = window.editingLeadId;
            
            const formData = {
                // Dati richiedente
                nomeRichiedente: document.getElementById('newNome').value,
                cognomeRichiedente: document.getElementById('newCognome').value,
                email: document.getElementById('newEmail').value,
                telefono: document.getElementById('newTelefono').value,
                
                // Dati assistito
                nomeAssistito: document.getElementById('newNomeAssistito').value,
                cognomeAssistito: document.getElementById('newCognomeAssistito').value,
                luogoNascitaAssistito: document.getElementById('newLuogoNascita').value,
                dataNascitaAssistito: document.getElementById('newDataNascita').value,
                indirizzoAssistito: document.getElementById('newIndirizzoAssistito').value,
                capAssistito: document.getElementById('newCapAssistito').value,
                cittaAssistito: document.getElementById('newCittaAssistito').value,
                provinciaAssistito: document.getElementById('newProvinciaAssistito').value.toUpperCase(),
                cfAssistito: document.getElementById('newCodiceFiscale').value.toUpperCase(),
                
                // Intestatario contratto
                intestatarioContratto: document.querySelector('input[name="intestatario"]:checked').value,
                
                // Condizioni di salute
                condizioniSalute: document.getElementById('newCondizioniSalute').value,
                
                // Servizio e Piano
                servizio: document.getElementById('newServizio').value,
                piano: document.getElementById('newPiano').value,
                canale: document.getElementById('newCanale').value,
                fonte: document.getElementById('newCanale').value,
                
                // Preferenze
                vuoleBrochure: document.getElementById('newVuoleBrochure').checked ? 'Si' : 'No',
                vuoleContratto: document.getElementById('newVuoleContratto').checked ? 'Si' : 'No',
                vuoleManuale: document.getElementById('newVuoleManuale').checked ? 'Si' : 'No',
                
                // Consensi
                gdprConsent: document.getElementById('newConsensoPrivacy').checked,
                consensoMarketing: document.getElementById('newConsensoMarketing').checked ? 'Si' : 'No',
                consensoTerze: document.getElementById('newConsensoTerze').checked ? 'Si' : 'No',
                
                // Note
                note: document.getElementById('newNote').value
            };
            
            // Validation campi obbligatori SOLO in modalità nuovo lead
            if (!isEditMode) {
                if (!formData.nomeRichiedente || !formData.cognomeRichiedente || !formData.email || !formData.telefono) {
                    alert("⚠️ Compila tutti i campi obbligatori del Richiedente");
                    return;
                }
                
                if (!formData.nomeAssistito || !formData.cognomeAssistito) {
                    alert("⚠️ Compila tutti i campi obbligatori dell'Assistito");
                    return;
                }
                
                if (!formData.gdprConsent) {
                    alert("⚠️ Il consenso Privacy è obbligatorio");
                    return;
                }
            }
            // In modalità edit: nessuna validazione, puoi modificare quello che vuoi
            
            console.log(isEditMode ? '📝 Aggiornamento lead:' : '📤 Invio dati lead:', formData);
            
            try {
                const url = isEditMode ? '/api/leads/' + leadId : '/api/leads';
                const method = isEditMode ? 'PUT' : 'POST';
                
                console.log('[REQUEST] ' + method + ' ' + url);
                console.log('[PAYLOAD]', JSON.stringify(formData, null, 2));
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                console.log('[RESPONSE] Status: ' + response.status + ' ' + response.statusText);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('[ERROR] Response:', errorText);
                    throw new Error('HTTP ' + response.status + ': ' + errorText.substring(0, 200));
                }
                
                const result = await response.json();
                console.log('[RESULT]', result);
                
                if (result.success) {
                    let message = isEditMode 
                        ? "✅ Lead aggiornato con successo!" 
                        : "✅ Lead creato con successo!\\n\\nID: " + (result.id || result.leadId);
                    
                    // Mostra email inviate solo per nuovo lead
                    if (!isEditMode && result.emails) {
                        message += "\\n\\n📧 Email inviate:";
                        if (result.emails.notifica && result.emails.notifica.sent) message += "\\n  ✓ Notifica nuovo lead";
                        if (result.emails.brochure && result.emails.brochure.sent) message += "\\n  ✓ Brochure al cliente";
                        if (result.emails.contratto && result.emails.contratto.sent) message += "\\n  ✓ Contratto al cliente";
                    }
                    
                    alert(message);
                    closeModal('newLeadModal');
                    document.getElementById('newLeadForm').reset();
                    
                    // Reset edit mode
                    window.editingLeadId = null;
                    const modalTitle = document.querySelector('#newLeadModal h2');
                    if (modalTitle) {
                        modalTitle.textContent = 'Richiedi il tuo servizio eCura';
                    }
                    
                    // Ricarica la pagina per aggiornare i dati
                    window.location.reload();
                } else {
                    alert("❌ Errore: " + (result.error || "Errore sconosciuto"));
                }
            } catch (error) {
                console.error(isEditMode ? "❌ Errore aggiornamento lead:" : "❌ Errore creazione lead:", error);
                alert("❌ Errore di comunicazione: " + error.message);
            }
        }
        
        // ========== CRUD ASSISTITI ==========
        
        async function viewAssistito(id) {
            try {
                const response = await fetch('/api/assistiti?id=' + id);
                const data = await response.json();
                
                if (data.success && data.assistiti && data.assistiti.length > 0) {
                    const assistito = data.assistiti[0];
                    
                    // Mostra modal dettagli assistito
                    alert('📋 Dettagli Assistito\\n\\n' +
                        'Nome: ' + (assistito.nome_assistito || '') + ' ' + (assistito.cognome_assistito || '') + '\\n' +
                        'Caregiver: ' + (assistito.nome_caregiver || 'N/A') + ' ' + (assistito.cognome_caregiver || '') + '\\n' +
                        'Parentela: ' + (assistito.parentela_caregiver || 'N/A') + '\\n' +
                        'IMEI: ' + (assistito.imei || 'N/A') + '\\n' +
                        'Email: ' + (assistito.email || 'N/A') + '\\n' +
                        'Telefono: ' + (assistito.telefono || 'N/A') + '\\n' +
                        'Piano: ' + (assistito.piano || 'BASE') + '\\n' +
                        'Contratto: ' + (assistito.codice_contratto || 'Nessuno') + '\\n' +
                        'Status: ' + (assistito.contratto_status || assistito.status || 'N/A')
                    );
                } else {
                    alert('❌ Assistito non trovato');
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
            }
        }
        window.viewAssistito = viewAssistito;  // Esponi globalmente
        
        async function editAssistito(id) {
            try {
                const response = await fetch('/api/assistiti?id=' + id);
                const data = await response.json();
                
                if (data.success && data.assistiti && data.assistiti.length > 0) {
                    const assistito = data.assistiti[0];
                    
                    // Richiedi nuovi dati
                    const nuovoNome = prompt('Nome Assistito:', assistito.nome_assistito || '');
                    if (!nuovoNome) return;
                    
                    const nuovoCognome = prompt('Cognome Assistito:', assistito.cognome_assistito || '');
                    if (!nuovoCognome) return;
                    
                    const nuovaEmail = prompt('Email:', assistito.email || '');
                    const nuovoTelefono = prompt('Telefono:', assistito.telefono || '');
                    const nuovoIMEI = prompt('IMEI Dispositivo:', assistito.imei || '');
                    
                    const caregiverNome = prompt('Nome Caregiver:', assistito.nome_caregiver || '');
                    const caregiverCognome = prompt('Cognome Caregiver:', assistito.cognome_caregiver || '');
                    const parentela = prompt('Parentela Caregiver:', assistito.parentela_caregiver || '');
                    
                    // Aggiorna
                    const updateResponse = await fetch(\`/api/assistiti/\${id}\`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nome_assistito: nuovoNome,
                            cognome_assistito: nuovoCognome,
                            nome_caregiver: caregiverNome,
                            cognome_caregiver: caregiverCognome,
                            parentela_caregiver: parentela,
                            email: nuovaEmail,
                            telefono: nuovoTelefono,
                            imei: nuovoIMEI
                        })
                    });
                    
                    const result = await updateResponse.json();
                    
                    if (result.success) {
                        alert('✅ Assistito aggiornato con successo!');
                        loadDashboardData(); // Ricarica dashboard
                    } else {
                        alert('❌ Errore: ' + result.error);
                    }
                } else {
                    alert('❌ Assistito non trovato');
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
            }
        }
        window.editAssistito = editAssistito;  // Esponi globalmente
        
        async function deleteAssistito(id, nome) {
            if (!confirm(\`⚠️ Sei sicuro di voler eliminare l'assistito \${nome}?\\n\\nQuesta azione non può essere annullata!\`)) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/assistiti/\${id}\`, {
                    method: 'DELETE'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Assistito ' + nome + ' eliminato con successo!');
                    loadDashboardData(); // Ricarica dashboard
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
            }
        }
        window.deleteAssistito = deleteAssistito;  // Esponi globalmente
    </script>

    <!-- MODAL: NEW LEAD - Form Stile eCura.it -->
    <div id="newLeadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-hidden">
            
            <!-- HEADER -->
            <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)" class="text-white px-8 py-6 rounded-t-xl">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-2xl font-bold mb-1">Richiedi il tuo servizio eCura</h2>
                        <p class="text-blue-100 text-sm">Compila il form per ricevere brochure e contratto personalizzato</p>
                    </div>
                    <button onclick="closeModal('newLeadModal')" class="text-white hover:text-gray-200 text-3xl leading-none">&times;</button>
                </div>
            </div>
            
            <!-- FORM CONTENT -->
            <div class="p-8 overflow-y-auto" style="max-height: calc(95vh - 180px)">
                <form id="newLeadForm" class="space-y-8">
                    <!-- Hidden field per gestire edit mode -->
                    <input type="hidden" id="isEditMode" value="">
                    
                    <!-- STEP 1: CHI SEI -->
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
                        <h3 class="text-xl font-bold text-gray-800 mb-1 flex items-center">
                            <span class="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">1</span>
                            Chi sei?
                        </h3>
                        <p class="text-gray-600 text-sm mb-4 ml-11">I tuoi dati di contatto</p>
                        
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nome *</label>
                                <input type="text" id="newNome" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="Mario">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Cognome *</label>
                                <input type="text" id="newCognome" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="Rossi">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                <input type="email" id="newEmail" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="mario.rossi@example.com">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Telefono *</label>
                                <input type="tel" id="newTelefono" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    placeholder="+39 333 1234567">
                            </div>
                        </div>
                    </div>

                    <!-- STEP 2: PER CHI È IL SERVIZIO -->
                    <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-l-4 border-green-500">
                        <h3 class="text-xl font-bold text-gray-800 mb-1 flex items-center">
                            <span class="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">2</span>
                            Per chi è il servizio?
                        </h3>
                        <p class="text-gray-600 text-sm mb-4 ml-11">Dati anagrafici completi dell'assistito</p>
                        
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nome Assistito *</label>
                                <input type="text" id="newNomeAssistito" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Giuseppe">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Cognome Assistito *</label>
                                <input type="text" id="newCognomeAssistito" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Rossi">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Luogo di Nascita *</label>
                                <input type="text" id="newLuogoNascita" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Milano">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Data di Nascita *</label>
                                <input type="text" id="newDataNascita" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="15/03/1950"
                                    onblur="calculateAge()" onchange="calculateAge()">
                                <div id="etaCalcolata" class="text-sm text-gray-500 mt-1"></div>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Indirizzo Completo *</label>
                                <input type="text" id="newIndirizzoAssistito" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Via Roma 123">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">CAP *</label>
                                <input type="text" id="newCapAssistito" required maxlength="5"
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="20121">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Città *</label>
                                <input type="text" id="newCittaAssistito" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Milano">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Provincia *</label>
                                <input type="text" id="newProvinciaAssistito" required maxlength="2"
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition uppercase"
                                    placeholder="MI">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Codice Fiscale *</label>
                                <input type="text" id="newCodiceFiscale" required maxlength="16"
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition uppercase"
                                    placeholder="RSSGPP50C15F205X">
                            </div>
                        </div>
                        
                        <!-- CONDIZIONI DI SALUTE -->
                        <div class="mt-6">
                            <label class="block text-sm font-semibold text-gray-700 mb-2">
                                <i class="fas fa-notes-medical text-green-600 mr-2"></i>
                                Condizioni di salute
                            </label>
                            <textarea id="newCondizioniSalute" rows="3"
                                class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                placeholder="Descrivere eventuali patologie, allergie, limitazioni motorie o altre informazioni mediche rilevanti per il servizio..."></textarea>
                            <p class="text-xs text-gray-500 mt-1">
                                Queste informazioni aiutano a personalizzare il servizio e garantire un'assistenza adeguata
                            </p>
                        </div>
                        
                        <!-- INTESTATARIO CONTRATTO -->
                        <div class="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                            <label class="block text-sm font-semibold text-gray-700 mb-3">
                                <i class="fas fa-file-signature text-yellow-600 mr-2"></i>
                                Intestatario Contratto *
                            </label>
                            <div class="flex gap-4">
                                <label class="flex items-center cursor-pointer">
                                    <input type="radio" id="newIntestatarioRichiedente" name="intestatario" value="richiedente" checked
                                        class="w-5 h-5 text-yellow-600 focus:ring-yellow-500 focus:ring-2">
                                    <span class="ml-3 text-gray-700 font-medium">
                                        📝 Richiedente
                                        <span class="block text-xs text-gray-500">Il contratto sarà intestato a te</span>
                                    </span>
                                </label>
                                <label class="flex items-center cursor-pointer">
                                    <input type="radio" id="newIntestatarioAssistito" name="intestatario" value="assistito"
                                        class="w-5 h-5 text-yellow-600 focus:ring-yellow-500 focus:ring-2">
                                    <span class="ml-3 text-gray-700 font-medium">
                                        👴 Assistito
                                        <span class="block text-xs text-gray-500">Il contratto sarà intestato all'assistito</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 3: QUALE SERVIZIO VUOI -->
                    <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-500">
                        <h3 class="text-xl font-bold text-gray-800 mb-1 flex items-center">
                            <span class="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">3</span>
                            Quale servizio vuoi?
                        </h3>
                        <p class="text-gray-600 text-sm mb-4 ml-11">Scegli il servizio e il piano più adatto</p>
                        
                        <div class="grid md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Servizio eCura *</label>
                                <select id="newServizio" required onchange="updatePrices()"
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white">
                                    <option value="">Seleziona servizio...</option>
                                    <option value="eCura FAMILY">eCura FAMILY</option>
                                    <option value="eCura PRO" selected>eCura PRO</option>
                                    <option value="eCura PREMIUM">eCura PREMIUM</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Piano *</label>
                                <select id="newPiano" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white">
                                    <option value="BASE">Piano BASE - €480/anno (rinnovo €200/anno)</option>
                                    <option value="AVANZATO">Piano AVANZATO - €840/anno (rinnovo €600/anno)</option>
                                </select>
                                <p class="text-xs text-gray-500 mt-1" id="priceNote">
                                    I prezzi mostrati sono per il servizio eCura PRO. Il prezzo include dispositivo SiDLY Care PRO.
                                </p>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Come ci hai conosciuto? *</label>
                                <select id="newCanale" required 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white">
                                    <option value="">Seleziona fonte...</option>
                                    <option value="Privati IRBEMA">Privati IRBEMA</option>
                                    <option value="Form eCura">Form eCura</option>
                                    <option value="Form eCura x Test">Form eCura x Test</option>
                                    <option value="B2B IRBEMA">B2B IRBEMA</option>
                                    <option value="Sito web Medica GB">Sito web Medica GB</option>
                                    <option value="NETWORKING">NETWORKING</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- STEP 4: PREFERENZE -->
                    <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border-l-4 border-amber-500">
                        <h3 class="text-xl font-bold text-gray-800 mb-1 flex items-center">
                            <span class="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">4</span>
                            Cosa vuoi ricevere?
                        </h3>
                        <p class="text-gray-600 text-sm mb-4 ml-11">Documenti e informazioni</p>
                        
                        <div class="space-y-3">
                            <label class="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-amber-400 cursor-pointer transition">
                                <input type="checkbox" id="newVuoleBrochure" checked 
                                    class="mr-4 w-6 h-6 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500">
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">📚 Brochure Informativa</div>
                                    <div class="text-sm text-gray-600">Ricevi via email la brochure con tutte le caratteristiche del dispositivo associato al servizio scelto</div>
                                </div>
                            </label>
                            
                            <label class="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-amber-400 cursor-pointer transition">
                                <input type="checkbox" id="newVuoleContratto" checked 
                                    class="mr-4 w-6 h-6 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500">
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">📋 Contratto Personalizzato</div>
                                    <div class="text-sm text-gray-600">Ricevi il contratto precompilato con i tuoi dati</div>
                                </div>
                            </label>
                            
                            <label class="flex items-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-amber-400 cursor-pointer transition">
                                <input type="checkbox" id="newVuoleManuale" 
                                    class="mr-4 w-6 h-6 text-amber-600 border-2 border-gray-300 rounded focus:ring-amber-500">
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">📖 Manuale Utente</div>
                                    <div class="text-sm text-gray-600">Guida all'utilizzo del dispositivo e dei servizi</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- STEP 5: CONSENSI -->
                    <div class="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-6 border-l-4 border-gray-400">
                        <h3 class="text-xl font-bold text-gray-800 mb-1 flex items-center">
                            <span class="bg-gray-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm">5</span>
                            Privacy e Consensi
                        </h3>
                        <p class="text-gray-600 text-sm mb-4 ml-11">Informativa sul trattamento dei dati personali</p>
                        
                        <div class="space-y-3">
                            <label class="flex items-start p-4 bg-white rounded-lg border-2 border-green-200 cursor-pointer">
                                <input type="checkbox" id="newConsensoPrivacy" checked required 
                                    class="mr-4 mt-1 w-6 h-6 text-green-600 border-2 border-gray-300 rounded focus:ring-green-500">
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">✅ Consenso Privacy *</div>
                                    <div class="text-sm text-gray-600">Acconsento al trattamento dei miei dati personali secondo la <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a> (obbligatorio)</div>
                                </div>
                            </label>
                            
                            <label class="flex items-start p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition">
                                <input type="checkbox" id="newConsensoMarketing" 
                                    class="mr-4 mt-1 w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500">
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">📬 Comunicazioni Marketing</div>
                                    <div class="text-sm text-gray-600">Acconsento alla ricezione di comunicazioni commerciali e promozionali (facoltativo)</div>
                                </div>
                            </label>
                            
                            <label class="flex items-start p-4 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-gray-400 transition">
                                <input type="checkbox" id="newConsensoTerze" 
                                    class="mr-4 mt-1 w-6 h-6 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500">
                                <div class="flex-1">
                                    <div class="font-semibold text-gray-800">🤝 Comunicazione a Terze Parti</div>
                                    <div class="text-sm text-gray-600">Acconsento alla comunicazione dei miei dati a partner selezionati (facoltativo)</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <!-- NOTE OPZIONALI -->
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">💬 Note Aggiuntive (opzionale)</label>
                        <textarea id="newNote" rows="3" 
                            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            placeholder="Eventuali note o richieste particolari..."></textarea>
                    </div>

                </form>
                
                <!-- SEZIONE INTERAZIONI (solo in modalità EDIT) -->
                <div id="editInteractionsSection" class="hidden mt-6 border-t pt-6">
                    <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        💬 <span class="ml-2">Storico & Nuova Interazione</span>
                    </h4>
                    
                    <!-- Storico Interazioni -->
                    <div class="mb-4">
                        <h5 class="text-sm font-semibold text-gray-700 mb-2">📋 Storico Interazioni</h5>
                        <div id="editInteractionsList" class="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-3">
                            <p class="text-gray-500 text-xs text-center py-4">Caricamento...</p>
                        </div>
                    </div>
                    
                    <!-- Form Aggiungi Interazione -->
                    <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h5 class="text-sm font-semibold text-gray-700 mb-3">➕ Aggiungi Nuova Interazione</h5>
                        <div class="grid grid-cols-2 gap-3 mb-2">
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                                <select id="editInteractionTipo" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="telefono">📞 Telefono</option>
                                    <option value="email">📧 Email</option>
                                    <option value="whatsapp">💬 WhatsApp</option>
                                    <option value="sms">📱 SMS</option>
                                    <option value="meeting">🤝 Meeting</option>
                                    <option value="videocall">📹 Videocall</option>
                                    <option value="nota">📝 Nota</option>
                                    <option value="follow-up">🔔 Follow-up</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700 mb-1">Operatore</label>
                                <select id="editInteractionOperatore" class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500">
                                    <option value="Stefania Rocca">Stefania Rocca (SR)</option>
                                    <option value="Ottavia Belfa">Ottavia Belfa (OB)</option>
                                    <option value="Roberto Poggi">Roberto Poggi (RP)</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-2">
                            <label class="block text-xs font-medium text-gray-700 mb-1">Nota <span class="text-red-500">*</span></label>
                            <textarea id="editInteractionNota" rows="2" 
                                      class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      placeholder="Descrivi cosa è successo..."></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="block text-xs font-medium text-gray-700 mb-1">Azione</label>
                            <textarea id="editInteractionAzione" rows="2" 
                                      class="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                      placeholder="Cosa fare successivamente? (opzionale)"></textarea>
                        </div>
                        <button onclick="addEditInteraction()" 
                                class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                            💾 Salva Interazione
                        </button>
                    </div>
                </div>
                
            </div>
            
            <!-- FOOTER BUTTONS -->
            <div class="bg-gray-50 px-8 py-6 rounded-b-xl border-t flex justify-between items-center">
                <div class="text-sm text-gray-600">
                    <span class="text-red-600">*</span> Campi obbligatori
                </div>
                <div class="flex gap-3">
                    <button type="button" onclick="closeModal('newLeadModal')" 
                        class="px-8 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition font-semibold">
                        ❌ Annulla
                    </button>
                    <button type="button" id="submitLeadButton" onclick="saveNewLead()" 
                        class="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-semibold shadow-lg">
                        ✉️ Invia Richiesta
                    </button>
                </div>
            </div>
            
        </div>
    </div>

    <!-- MODAL: VIEW LEAD -->
    <div id="viewLeadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-2xl max-w-6xl w-full my-8">
            <div class="gradient-bg text-white px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
                <h3 class="text-xl font-bold">👁️ Visualizza Lead & Storico Interazioni</h3>
                <button onclick="closeModal('viewLeadModal')" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div class="p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <!-- Informazioni Lead -->
                <h4 class="text-base font-semibold text-gray-800 mb-3 border-b pb-2">📋 Informazioni Lead</h4>
                <div class="grid grid-cols-3 gap-3 mb-5">
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Lead ID</label>
                        <p id="viewLeadId" class="text-gray-900 font-mono text-xs bg-gray-50 p-2 rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Data Creazione</label>
                        <p id="viewData" class="text-gray-900 bg-gray-50 p-2 text-xs rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Contact Manager</label>
                        <p id="viewCM" class="text-gray-900 bg-blue-50 p-2 rounded font-semibold text-xs">-</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Nome</label>
                        <p id="viewNome" class="text-gray-900 bg-gray-50 p-2 text-xs rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Cognome</label>
                        <p id="viewCognome" class="text-gray-900 bg-gray-50 p-2 text-xs rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Email</label>
                        <p id="viewEmail" class="text-gray-900 bg-gray-50 p-2 text-xs rounded truncate">-</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Telefono</label>
                        <p id="viewTelefono" class="text-gray-900 bg-gray-50 p-2 text-xs rounded">-</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Servizio</label>
                        <p id="viewServizio" class="text-gray-900 bg-blue-50 p-2 rounded font-semibold text-xs">-</p>
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-700 mb-1">Piano</label>
                        <p id="viewPiano" class="text-gray-900 bg-purple-50 p-2 rounded font-semibold text-xs">-</p>
                    </div>
                    <div class="col-span-3">
                        <label class="block text-xs font-medium text-gray-700 mb-1">Note</label>
                        <p id="viewNote" class="text-gray-900 bg-gray-50 p-2 rounded min-h-[50px] text-xs">-</p>
                    </div>
                </div>

                <!-- Storico Interazioni (SOLO LETTURA) -->
                <h4 class="text-base font-semibold text-gray-800 mb-3 border-b pb-2 mt-4">💬 Storico Interazioni</h4>
                <div id="interactionsList" class="mb-4 max-h-96 overflow-y-auto">
                    <p class="text-gray-500 text-xs text-center py-4">Caricamento...</p>
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4">
                    <p class="text-sm text-blue-800">
                        💡 <strong>Per aggiungere una nuova interazione</strong>, clicca sul bottone <strong>✏️ Modifica</strong> nella tabella.
                    </p>
                </div>

                <div class="flex justify-end pt-2 border-t">
                    <button onclick="closeModal('viewLeadModal')" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm">
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL: INTERACTIONS (Dedicated) -->
    <div id="interactionsModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8">
            <div class="gradient-bg text-white px-6 py-4 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
                <h3 class="text-xl font-bold">💬 Gestione Interazioni Lead</h3>
                <button onclick="closeModal('interactionsModal')" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div class="p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <!-- Info Lead (compatta) -->
                <div class="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 flex items-center justify-between">
                    <div>
                        <p class="font-semibold text-gray-800" id="intModalLeadName">-</p>
                        <p class="text-sm text-gray-600" id="intModalLeadContact">-</p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs text-gray-500">Lead ID</p>
                        <p class="font-mono text-xs font-semibold text-gray-700" id="intModalLeadId">-</p>
                    </div>
                </div>

                <!-- Storico Interazioni -->
                <h4 class="text-base font-semibold text-gray-800 mb-3 border-b pb-2">📋 Storico Interazioni</h4>
                <div id="intModalInteractionsList" class="mb-6 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-3">
                    <p class="text-gray-500 text-xs text-center py-4">Caricamento...</p>
                </div>

                <!-- Form Nuova Interazione -->
                <h4 class="text-base font-semibold text-gray-800 mb-3 border-b pb-2">➕ Aggiungi Nuova Interazione</h4>
                <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo Interazione</label>
                            <select id="intModalTipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="telefono">📞 Telefono</option>
                                <option value="email">📧 Email</option>
                                <option value="whatsapp">💬 WhatsApp</option>
                                <option value="sms">📱 SMS</option>
                                <option value="meeting">🤝 Meeting</option>
                                <option value="videocall">📹 Videocall</option>
                                <option value="nota">📝 Nota</option>
                                <option value="follow-up">🔔 Follow-up</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Operatore</label>
                            <select id="intModalOperatore" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                <option value="Stefania Rocca">Stefania Rocca (SR)</option>
                                <option value="Ottavia Belfa">Ottavia Belfa (OB)</option>
                                <option value="Roberto Poggi">Roberto Poggi (RP)</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nota <span class="text-red-500">*</span></label>
                        <textarea id="intModalNota" rows="3" 
                                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="Descrivi cosa è successo durante il contatto..."></textarea>
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Azione da Intraprendere</label>
                        <textarea id="intModalAzione" rows="2" 
                                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                  placeholder="Cosa fare successivamente? (opzionale)"></textarea>
                    </div>
                    <button id="saveInteractionBtn" 
                            class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                        💾 Salva Interazione
                    </button>
                </div>

                <div class="flex justify-end pt-4 border-t mt-4">
                    <button id="closeInteractionsModalBtn" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">
                        Chiudi
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL: EDIT LEAD -->
    <!-- editLeadModal rimosso - ora usa newLeadModal anche per edit -->

    ${autoImportScript}
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
                        <span class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">SiDLY CARE PRO</span>
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
        // Helper function to escape HTML special characters
        function escapeHtml(text) {
            if (!text) return '';
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return String(text).replace(/[&<>"']/g, m => map[m]);
        }

        let allContracts = [];

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
                console.log('📊 Contratti ricevuti dall API:', contractsData);
                const keys = Object.keys(contractsData);
                console.log('🔑 Chiavi oggetto risposta:', keys);
                console.log('📝 CHIAVI ESATTE:', keys.join(', '));
                console.log('📦 Tipo di contractsData:', typeof contractsData, Array.isArray(contractsData) ? 'È un array' : 'Non è un array');
                
                // Prova a stampare il valore di ogni chiave
                keys.forEach(key => {
                    console.log(\`   🔸 \${key}:\`, Array.isArray(contractsData[key]) ? \`Array(\${contractsData[key].length})\` : typeof contractsData[key]);
                });
                
                const contracts = contractsData.contracts || contractsData.contratti || contractsData.data || [];
                console.log('📋 Array contratti dopo parsing:', contracts, 'Lunghezza:', contracts.length);
                allContracts = contracts; // Salva per uso nelle funzioni CRUD
                
                // Calcola statistiche REALI dai contratti
                const totalLeads = leads.length;
                const totalContracts = contracts.length;
                
                // Calcola revenue dai contratti reali (SOLO FIRMATI!)
                let totalRevenue = 0;
                contracts.forEach(c => {
                    // Solo contratti SIGNED contano per il revenue
                    if (c.status === 'SIGNED' && c.prezzo_totale) {
                        totalRevenue += parseFloat(c.prezzo_totale);
                    }
                });
                
                // Conta contratti firmati
                const signedContracts = contracts.filter(c => c.status === 'SIGNED').length;
                const conversionRate = totalLeads > 0 ? ((signedContracts / totalLeads) * 100).toFixed(2) + '%' : '0%';
                const averageOrderValue = signedContracts > 0 ? Math.round(totalRevenue / signedContracts) : 0;

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
            // TASK #5-6 FIX: Calcola dinamicamente da dati reali (non hardcode)
            const data = {
                FAMILY: { leads: 0, base: 0, avanzato: 0, contracts: 0, revenue: 0 },
                PRO: { leads: 0, base: 0, avanzato: 0, contracts: 0, revenue: 0 },
                PREMIUM: { leads: 0, base: 0, avanzato: 0, contracts: 0, revenue: 0 }
            };

            // Conta lead PER SERVIZIO
            // Ora la tabella leads HA il campo 'servizio' (dopo migration 0006)
            leads.forEach(lead => {
                // Normalizza servizio: rimuovi "eCura " prefix per matching
                const servizio = (lead.servizio || 'eCura PRO').toUpperCase().replace(/^ECURA\s+/i, '');
                
                if (data[servizio]) {
                    data[servizio].leads++;
                } else {
                    // Default a PRO se servizio sconosciuto
                    data.PRO.leads++;
                }
            });

            // Calcola revenue e conta BASE vs AVANZATO dai CONTRATTI reali (SOLO FIRMATI)
            contracts.forEach(contract => {
                // Determina servizio dal contratto o fallback a PRO
                const servizio = (contract.servizio || 'PRO').toUpperCase().replace(/^ECURA\\s+/i, '');
                
                // TASK 6 FIX: Piano dal DB
                const piano = (contract.piano || 'BASE').toUpperCase();
                const isAvanzato = piano === 'AVANZATO';
                
                // Debug log contratti con piano
                console.log('Contratto ' + contract.codice_contratto + ': piano=' + contract.piano + ', isAvanzato=' + isAvanzato);
                
                if (data[servizio]) {
                    data[servizio].contracts++;
                    if (isAvanzato) {
                        data[servizio].avanzato++;
                    } else {
                        data[servizio].base++;
                    }
                    
                    // Somma revenue SOLO se contratto FIRMATO
                    if (contract.status === 'SIGNED' && contract.prezzo_totale) {
                        data[servizio].revenue += parseFloat(contract.prezzo_totale);
                    }
                }
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
            console.log('🎨 renderContractsTable chiamata con:', contracts.length, 'contratti e', leads.length, 'leads');
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
                // TASK 6 FIX: Piano dal DB
                const piano = (contract.piano || 'BASE').toUpperCase();
                const prezzo = contract.prezzo_totale || (piano === 'AVANZATO' ? '840' : '480');
                
                // Mostra servizio così com'è dal DB
                const servizio = contract.servizio || 'eCura PRO';
                
                const date = new Date(contract.created_at).toLocaleDateString('it-IT');
                
                return \`
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 text-xs">
                            <code class="bg-gray-100 px-2 py-1 rounded">\${contract.codice_contratto || contract.id}</code>
                        </td>
                        <td class="py-3 text-sm font-medium">
                            \${escapeHtml(contract.cliente_nome)} \${escapeHtml(contract.cliente_cognome)}
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                \${servizio}
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
                                \${contract.status_italiano || contract.status || 'SENT'}
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
                                <button onclick="signContract('\${contract.id}')" class="text-purple-600 hover:text-purple-800" title="Firma Contratto">
                                    <i class="fas fa-signature"></i>
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
                'FAMILY': 'SiDLY CARE PRO',
                'PRO': 'SiDLY CARE PRO',
                'PREMIUM': 'SiDLY VITAL CARE'
            };
            return dispositivi[servizio] || 'N/A';
        }

        // ============================================
        // CRUD CONTRATTI + PDF VIEWER
        // ============================================
        
        async function viewContract(contractId) {
            const contract = allContracts.find(c => c.id === contractId);
            if (!contract) {
                alert('❌ Contratto non trovato');
                return;
            }
            
            alert(\`📄 CONTRATTO: \${contract.codice_contratto || contract.id}

👤 Cliente: \${contract.cliente_nome || ''} \${contract.cliente_cognome || ''}
💰 Importo: €\${contract.prezzo_totale || 'N/A'}
📅 Data: \${new Date(contract.created_at).toLocaleDateString('it-IT')}
📊 Status: \${contract.status_italiano || contract.status || 'N/A'}\`);
        }
        
        async function editContract(contractId) {
            alert(\`⚠️ Funzione Edit Contratto in sviluppo.

Per ora puoi modificare i contratti tramite API:
PUT /api/contratti/\${contractId}\`);
        }
        
        async function deleteContract(contractId) {
            if (!confirm(\`⚠️ Sei sicuro di voler eliminare questo contratto?\\n\\nQuesta operazione è irreversibile.\`)) {
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
        
        // ============================================
        // FIRMA CONTRATTO
        // ============================================
        
        function signContract(contractId) {
            const contract = allContracts.find(c => c.id === contractId);
            if (!contract) {
                alert('❌ Contratto non trovato');
                return;
            }
            
            // Pre-compila la modale con i dati del contratto
            document.getElementById('signContractId').value = contract.id;
            document.getElementById('signContractCode').textContent = contract.codice_contratto || contract.id;
            document.getElementById('signClienteName').textContent = \`\${escapeHtml(contract.cliente_nome)} \${escapeHtml(contract.cliente_cognome)}\`.trim() || 'N/A';
            document.getElementById('signDigitalName').value = \`\${escapeHtml(contract.cliente_nome)} \${escapeHtml(contract.cliente_cognome)}\`.trim();
            
            // Imposta data odierna
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('signDate').value = today;
            
            // Apri modale
            document.getElementById('signContractModal').classList.remove('hidden');
            document.getElementById('signContractModal').style.display = 'flex';
        }
        
        function closeSignContractModal() {
            document.getElementById('signContractModal').classList.add('hidden');
            document.getElementById('signContractModal').style.display = 'none';
            document.getElementById('signContractForm').reset();
        }
        
        // Submit handler firma contratto
        const signForm = document.getElementById('signContractForm');
        if (signForm) {
            signForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const contractId = document.getElementById('signContractId').value;
                const firmaDigitale = document.getElementById('signDigitalName').value;
                const dataFirma = document.getElementById('signDate').value;
                const note = document.getElementById('signNotes').value;
                
                try {
                    const response = await fetch('/api/contracts/sign', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            contractId,
                            firmaDigitale,
                            dataFirma,
                            notes: note,
                            ipAddress: 'MANUAL_SIGNATURE',
                            userAgent: 'Data Dashboard'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Contratto firmato con successo!\\n\\n📄 Proforma generata e inviata al cliente.');
                    closeSignContractModal();
                    loadDataDashboard(); // Ricarica i dati
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        });
        } else {
            console.warn('⚠️ Elemento signContractForm non trovato - firma contratto non disponibile');
        }
        
        async function viewContractPDF(contractId) {
            const contract = allContracts.find(c => c.id === contractId);
            if (!contract) {
                alert('❌ Contratto non trovato');
                return;
            }
            
            // Usa l'endpoint API per generare/scaricare il PDF
            const pdfUrl = \`/api/contratti/\${contractId}/download\`;
            window.open(pdfUrl, '_blank');
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
                    option.textContent = \`\${escapeHtml(lead.nome)} \${escapeHtml(lead.cognome)} - \${escapeHtml(lead.email)}\`;
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
                    alert('✅ Contratto creato con successo!\\n\\nCodice: ' + (result.contract.codice_contratto || result.contract.id) + '\\nImporto: €' + importo + '/anno\\nPiano: ' + piano);
                    closeNewContractModal();
                    loadDataDashboard(); // Ricarica la pagina
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }

        // Load data on page load (chiamata dopo tutte le definizioni)
        window.addEventListener('DOMContentLoaded', () => {
            loadDataDashboard();
        });
        
        
        async function nuovoAssistito() {
            try {
                // Richiedi dati nuovo assistito
                const nomeAssistito = prompt('Nome Assistito:');
                if (!nomeAssistito) return;
                
                const cognomeAssistito = prompt('Cognome Assistito:');
                if (!cognomeAssistito) return;
                
                const email = prompt('Email (opzionale):') || '';
                const telefono = prompt('Telefono (opzionale):') || '';
                const imei = prompt('IMEI Dispositivo (richiesto):');
                if (!imei) {
                    alert('⚠️ IMEI è obbligatorio!');
                    return;
                }
                
                const caregiverNome = prompt('Nome Caregiver (opzionale):') || '';
                const caregiverCognome = prompt('Cognome Caregiver (opzionale):') || '';
                const parentela = prompt('Parentela Caregiver (opzionale, es: figlia, figlio):') || '';
                
                // Crea assistito
                const response = await fetch('/api/assistiti', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome_assistito: nomeAssistito,
                        cognome_assistito: cognomeAssistito,
                        nome_caregiver: caregiverNome,
                        cognome_caregiver: caregiverCognome,
                        parentela_caregiver: parentela,
                        email,
                        telefono,
                        imei,
                        status: 'ATTIVO'
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Assistito ' + nomeAssistito + ' ' + cognomeAssistito + ' creato con successo!');
                    loadDashboardData(); // Ricarica dashboard
                } else {
                    alert('❌ Errore: ' + result.error);
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
            }
        }
        
        // ========== FINE CRUD ASSISTITI ==========
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

    <!-- Modal Firma Contratto -->
    <div id="signContractModal" class="modal fixed inset-0 bg-black bg-opacity-50 items-center justify-center z-50 hidden">
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div class="bg-purple-600 text-white p-6 rounded-t-xl">
                <h3 class="text-xl font-bold flex items-center">
                    <i class="fas fa-signature mr-3"></i>
                    Registra Firma Contratto
                </h3>
            </div>
            <form id="signContractForm" class="p-6">
                <input type="hidden" id="signContractId">
                <div class="space-y-4">
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p class="text-sm text-gray-700">
                            <strong>Contratto:</strong> <span id="signContractCode"></span><br>
                            <strong>Cliente:</strong> <span id="signClienteName"></span>
                        </p>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Firma Digitale *</label>
                        <input type="text" id="signDigitalName" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            placeholder="Nome Cognome del firmatario">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Data Firma</label>
                        <input type="date" id="signDate" required
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Note</label>
                        <textarea id="signNotes" rows="3"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            placeholder="Es: Contratto firmato in sede"></textarea>
                    </div>
                </div>
                <div class="mt-6 flex space-x-3">
                    <button type="button" onclick="closeSignContractModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 rounded-lg transition-colors">
                        Annulla
                    </button>
                    <button type="submit" class="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors">
                        <i class="fas fa-check mr-2"></i>Conferma Firma
                    </button>
                </div>
            </form>
        </div>
    </div>

    ${autoImportScript}
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
                            <th class="pb-3 text-sm font-semibold text-gray-600">Email</th>
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
                            <td colspan="9" class="py-8 text-center text-gray-400">
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
        
        // Helper: escape HTML
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Helper: escape quotes for strings in JS
        function escapeQuotes(str) {
            return String(str || '').replace(/"/g, '\\"').replace(/'/g, "\\'");
        }

        window.loadWorkflows = async function() {
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
                        <td colspan="8" class="py-8 text-center text-red-500">
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
                
                // Mostra servizio così com'è dal DB
                const servizio = lead.servizio || lead.tipoServizio || 'eCura PRO';
                
                return \`
                    <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 text-xs">
                            <code class="bg-gray-100 px-2 py-1 rounded">\${(lead.id || '').substring(0, 25)}</code>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="font-medium">\${escapeHtml(lead.nomeRichiedente)} \${escapeHtml(lead.cognomeRichiedente)}</div>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="text-xs text-gray-600">
                                <i class="fas fa-envelope text-gray-400 mr-1"></i>\${lead.email || lead.email || '-'}
                            </div>
                        </td>
                        <td class="py-3 text-sm">
                            <div class="flex items-center text-gray-700">
                                <i class="fas fa-phone text-xs mr-1 text-gray-400"></i>
                                <span class="text-xs">\${lead.telefono || '-'}</span>
                            </div>
                        </td>
                        <td class="py-3 text-sm">
                            <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                \${servizio}
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
                                <button onclick="quickAction('\${escapeHtml(lead.id)}', 'view')" 
                                    class="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded" 
                                    title="Visualizza Dettagli">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button onclick="quickAction('\${escapeHtml(lead.id)}', 'payment')" 
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
            // Determina stato workflow con tutti gli stati
            const status = lead.status?.toUpperCase();
            
            if (status === 'CONVERTED') {
                return { class: 'bg-green-100 text-green-700', text: 'CONVERTITO' };
            } else if (status === 'CONTRACT_SIGNED') {
                return { class: 'bg-green-100 text-green-700', text: 'CONTRATTO FIRMATO' };
            } else if (status === 'CONTRACT_SENT') {
                return { class: 'bg-blue-100 text-blue-700', text: 'CONTRATTO INVIATO' };
            } else if (status === 'ACTIVE') {
                return { class: 'bg-green-100 text-green-700', text: 'ATTIVO' };
            } else if (lead.contratto_inviato) {
                return { class: 'bg-blue-100 text-blue-700', text: 'CONTRATTO INVIATO' };
            } else if (status === 'NEW' || status === 'NUOVO') {
                return { class: 'bg-yellow-100 text-yellow-700', text: 'NUOVO' };
            } else {
                return { class: 'bg-gray-100 text-gray-700', text: status || 'NUOVO' };
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
            window.loadWorkflows();
        }

        function viewWorkflowDetails(leadId) {
            alert('Dettagli workflow per Lead: ' + leadId + '\\n\\nFunzionalità in sviluppo...');
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
                            message += \`\${idx+1}. \${escapeHtml(item.nomeRichiedente)} \${escapeHtml(item.cognomeRichiedente)} - \${item.email || 'N/A'}\\n\`;
                        } else if (type === 'contratti') {
                            message += \`\${idx+1}. \${item.codice_contratto || item.id} - \${escapeHtml(item.cliente_nome)} \${escapeHtml(item.cliente_cognome)}\\n\`;
                        } else if (type === 'firme') {
                            message += \`\${idx+1}. Firma \${item.id} - Contratto: \${item.contract_id}\\n\`;
                        } else if (type === 'proforma') {
                            message += \`\${idx+1}. Proforma \${item.numero || item.id} - €\${item.importo || '0'}\\n\`;
                        } else if (type === 'pagamenti') {
                            message += \`\${idx+1}. Pagamento \${item.id} - €\${item.importo || '0'} - \${item.metodo_pagamento || 'N/A'}\\n\`;
                        } else {
                            message += \`\${idx+1}. \${escapeHtml(item.nomeRichiedente)} \${escapeHtml(item.cognomeRichiedente)} - ATTIVO\\n\`;
                        }
                    });
                } else {
                    // Mostra solo primi 10 + conteggio
                    message += 'Primi 10 record:\\n\\n';
                    items.slice(0, 10).forEach((item, idx) => {
                        if (type === 'leads' || type === 'attivi') {
                            const status = item.status || 'NUOVO';
                            const statusText = status === 'ACTIVE' ? '✅ ATTIVO' : 
                                             status === 'CONVERTED' ? '✓ CONVERTITO' :
                                             status === 'CONTRACT_SIGNED' ? '✍️ FIRMATO' : '🆕 NUOVO';
                            message += \`\${idx+1}. \${escapeHtml(item.nomeRichiedente)} \${escapeHtml(item.cognomeRichiedente)} - \${statusText}\\n\`;
                        } else if (type === 'contratti') {
                            message += \`\${idx+1}. \${escapeHtml(item.cliente_nome)} \${escapeHtml(item.cliente_cognome)}\\n\`;
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
        window.openArchive = openArchive;  // Esponi globalmente

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
                    const piano = lead.piano || ((lead.note && lead.note.includes('Piano: AVANZATO')) ? 'AVANZATO' : 'BASE');
                    const prezzo = lead.prezzo_anno ? String(lead.prezzo_anno) : '0';
                    
                    // Mostra servizio cosi come dal DB
                    const servizio = lead.servizio || lead.tipoServizio || 'eCura PRO';
                    
                    alert('👤 LEAD: ' + (lead.nomeRichiedente || '') + ' ' + (lead.cognomeRichiedente || '') + '\\n\\n' +
                    '📧 Email: ' + (lead.email || 'N/A') + '\\n' +
                    '📞 Telefono: ' + (lead.telefono || 'N/A') + '\\n' +
                    '🏥 Servizio: ' + servizio + '\\n' +
                    '📋 Piano: ' + piano + ' (' + prezzo + '/anno)' + '\\n' +
                    '📅 Creato: ' + new Date(lead.created_at).toLocaleDateString('it-IT') + '\\n' +
                    '📍 Stato: ' + getWorkflowStatus(lead).text + '\\n' +
                    '🔄 Step: ' + getWorkflowStep(lead).text + '\\n\\n' +
                    '📝 Note: ' + (lead.note || 'Nessuna nota'));
                    break;
                    
                case 'contract':
                    // Pre-compila modale firma contratto
                    const nomeCompleto = escapeQuotes((lead.nomeRichiedente || '') + ' ' + (lead.cognomeRichiedente || ''));
                    const emailSafe = escapeQuotes(lead.email || '');
                    if (confirm(\`📝 Vuoi registrare la firma del contratto per:\\n\\n👤 \${nomeCompleto}\\n📧 \${emailSafe}\\n\\n✅ Procedi?\`)) {
                        document.getElementById('signContractId').value = lead.id;
                        document.getElementById('signDigital').value = nomeCompleto;
                        openSignModal();
                    }
                    break;
                    
                case 'payment':
                    // Pre-compila modale pagamento
                    const nomeCompletoPayment = escapeQuotes((lead.nomeRichiedente || '') + ' ' + (lead.cognomeRichiedente || ''));
                    const emailSafePayment = escapeQuotes(lead.email || '');
                    if (confirm(\`💰 Vuoi registrare il pagamento per:\\n\\n👤 \${nomeCompletoPayment}\\n📧 \${emailSafePayment}\\n\\n✅ Procedi?\`)) {
                        // Cerca proforma associata al lead
                        fetch('/api/proforma?lead_id=' + lead.id)
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
                        alert('✅ Firma registrata con successo!\\n\\nProforma generata e inviata.');
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
                    alert('✅ Pagamento registrato con successo!\\n\\nProcedura di attivazione avviata.');
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

        // ============================================
        // SETTINGS: SWITCH ON/OFF - LOAD SETTINGS
        // ============================================
        
        window.loadSettings = async function() {
            try {
                console.log('📥 [SETTINGS] Caricamento settings dal database...');
                const response = await fetch('/api/settings');
                const data = await response.json();
                
                console.log('📥 [SETTINGS] Response:', data);
                
                if (data.success && data.settings) {
                    const settings = data.settings;
                    
                    // Update select states - tutti e 4 i settings
                    if (settings.hubspot_auto_import_enabled) {
                        const value = settings.hubspot_auto_import_enabled.value;
                        console.log('✅ [SETTINGS] HubSpot:', value);
                        document.getElementById('selectHubspotAuto').value = value;
                    }
                    if (settings.lead_email_notifications_enabled) {
                        const value = settings.lead_email_notifications_enabled.value;
                        console.log('✅ [SETTINGS] Lead Emails:', value);
                        document.getElementById('selectLeadEmails').value = value;
                    }
                    if (settings.admin_email_notifications_enabled) {
                        const value = settings.admin_email_notifications_enabled.value;
                        console.log('✅ [SETTINGS] Admin Emails:', value);
                        document.getElementById('selectAdminEmails').value = value;
                    }
                    if (settings.reminder_completion_enabled) {
                        const value = settings.reminder_completion_enabled.value;
                        console.log('✅ [SETTINGS] Reminder:', value);
                        document.getElementById('selectReminderCompletion').value = value;
                    }
                    
                    console.log('✅ [SETTINGS] Tutti e 4 gli switch caricati correttamente');
                } else {
                    console.error('❌ [SETTINGS] Risposta API non valida:', data);
                }
            } catch (error) {
                console.error('❌ [SETTINGS] Errore caricamento settings:', error);
            }
        }
        
        // Nota: window.updateSetting è già definita inline dopo gli switch HTML

        // Load workflows on page load (chiamata dopo tutte le definizioni)
        window.addEventListener('DOMContentLoaded', () => {
            console.log('🚀 [DASHBOARD] DOM Loaded - Inizializzazione...');
            window.loadWorkflows();
            window.loadSettings(); // Carica gli switch dal DB
            console.log('✅ [DASHBOARD] Inizializzazione completata');
        });
    </script>
</body>
</html>
`

