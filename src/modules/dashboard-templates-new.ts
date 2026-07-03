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
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="eCura">
  <meta name="theme-color" content="#1d6ab9">
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
        
        /* 📐 Responsiveness migliorata */
        @media (max-width: 640px) {
            .container { padding-left: 1rem; padding-right: 1rem; }
        }
        @media (min-width: 1536px) {
            .container { max-width: 1400px; }
        }
        
        /* 📊 Layout tabelle migliorato */
        table { border-collapse: separate; border-spacing: 0; }
        .overflow-x-auto { 
            -webkit-overflow-scrolling: touch; 
            scrollbar-width: thin;
        }
        .overflow-x-auto::-webkit-scrollbar {
            height: 6px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
        }
    </style>
</head>
<body class="bg-gray-50">
    <!-- Header -->
    <header class="gradient-hero text-white shadow-2xl">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
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
    <section class="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 mb-8">
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
                    <a href="/admin/ddt" class="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded text-sm transition-colors">
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

            <!-- Gestione DDT -->
            <div class="card-hover bg-white rounded-xl p-6 shadow-lg">
                <div class="text-center">
                    <div class="text-5xl text-teal-500 mb-4 icon-bounce">
                        <i class="fas fa-truck"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800 mb-2">Gestione DDT</h3>
                    <p class="text-gray-600 mb-4">Lista spedizioni e documenti di trasporto</p>
                    <a href="/admin/ddt" class="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors">
                        <i class="fas fa-list mr-2"></i>Visualizza
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
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="eCura">
  <meta name="theme-color" content="#1d6ab9">
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

    <div class="container mx-auto px-2 sm:px-3 lg:px-4 xl:px-6 py-8" style="max-width: 98%;">
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
                <button onclick="importFromExcel()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md" title="Import da Google Sheets eCura (backup HubSpot)">
                    <i class="fab fa-google mr-2"></i>GSheet eCura
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
                    <p class="text-xs text-gray-600 mb-3">Abilita notifiche email a info@ecura.it</p>
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

        <!-- ═══════════════════════════════════════════════════════════════
             GESTIONE CODICI SCONTO
        ═══════════════════════════════════════════════════════════════ -->
        <div class="bg-white p-6 rounded-xl shadow-sm mb-8">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800">
                    <i class="fas fa-tag mr-2 text-orange-500"></i>Codici Sconto
                </h3>
                <button onclick="apriFormNuovoCodice()" 
                        style="background:#f97316;color:#ffffff;padding:8px 16px;font-size:14px;font-weight:600;border-radius:8px;border:none;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.15);"
                        onmouseover="this.style.background='#ea6c0a'" onmouseout="this.style.background='#f97316'">
                    + Nuovo Codice
                </button>
            </div>

            <!-- Tabella codici -->
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="bg-gray-50 text-gray-600 text-xs uppercase">
                            <th class="px-3 py-2 text-left">Codice</th>
                            <th class="px-3 py-2 text-left">Descrizione</th>
                            <th class="px-3 py-2 text-left">Tipo</th>
                            <th class="px-3 py-2 text-left">Valore</th>
                            <th class="px-3 py-2 text-left">Sorgente</th>
                            <th class="px-3 py-2 text-left">Scadenza</th>
                            <th class="px-3 py-2 text-left">Utilizzi</th>
                            <th class="px-3 py-2 text-left">Stato</th>
                            <th class="px-3 py-2 text-left">Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="discountCodesTableBody">
                        <tr>
                            <td colspan="9" class="px-3 py-6 text-center text-gray-400">
                                <i class="fas fa-spinner fa-spin mr-2"></i>Caricamento...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Modal nuovo/modifica codice sconto -->
        <div id="discountModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div class="flex items-center justify-between p-5 border-b">
                    <h3 class="text-lg font-bold text-gray-800" id="discountModalTitle">Nuovo Codice Sconto</h3>
                    <button onclick="chiudiDiscountModal()" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <div class="p-5 space-y-4">
                    <input type="hidden" id="discountModalMode" value="create">
                    <input type="hidden" id="discountModalCodiceOriginal" value="">

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-1">Codice *</label>
                            <input id="dcCodice" type="text" placeholder="es. ESTATE2026"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 uppercase"
                                   oninput="this.value=this.value.toUpperCase()" autocorrect="off" spellcheck="false">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-1">Tipo *</label>
                            <select id="dcTipo" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400">
                                <option value="PERCENTUALE">% Percentuale</option>
                                <option value="FISSO">€ Fisso</option>
                            </select>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-1">Valore *</label>
                            <input id="dcValore" type="number" min="0" step="0.01" placeholder="es. 10"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-1">Sorgente</label>
                            <select id="dcSorgente" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400">
                                <option value="MANUALE">MANUALE</option>
                                <option value="PROMOZIONE">PROMOZIONE</option>
                                <option value="CANALE">CANALE</option>
                                <option value="FORM">FORM</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Descrizione</label>
                        <input id="dcDescrizione" type="text" placeholder="es. Promo estate 2026"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400">
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-1">Scadenza (opzionale)</label>
                            <input id="dcScadenza" type="date"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-600 mb-1">Max utilizzi (vuoto = ∞)</label>
                            <input id="dcUtilizziMax" type="number" min="1" placeholder="illimitato"
                                   class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400">
                        </div>
                    </div>

                    <div id="dcErrorMsg" class="text-red-600 text-sm hidden"></div>
                </div>
                <div style="display:flex;gap:12px;padding:20px;border-top:1px solid #e5e7eb;justify-content:flex-end;">
                    <button onclick="chiudiDiscountModal()" 
                            style="padding:8px 16px;background:#f3f4f6;color:#374151;font-size:14px;font-weight:500;border-radius:8px;border:1px solid #d1d5db;cursor:pointer;"
                            onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                        Annulla
                    </button>
                    <button onclick="salvaDiscountCode()" 
                            style="padding:8px 16px;background:#f97316;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;border:none;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.15);"
                            onmouseover="this.style.background='#ea6c0a'" onmouseout="this.style.background='#f97316'">
                        Salva
                    </button>
                </div>
            </div>
        </div>

        <!-- Script Gestione Sconti -->
        <script>
            // ─── Carica tabella codici sconto ─────────────────────────────
            async function loadDiscountCodes() {
                try {
                    const r = await fetch('/api/discount-codes');
                    const d = await r.json();
                    const tbody = document.getElementById('discountCodesTableBody');
                    if (!d.success || !d.codes || d.codes.length === 0) {
                        tbody.innerHTML = '<tr><td colspan="9" class="px-3 py-6 text-center text-gray-400">Nessun codice sconto</td></tr>';
                        return;
                    }
                    tbody.innerHTML = d.codes.map(c => {
                        const attivo = c.attivo == 1;
                        const scaduto = c.data_scadenza && new Date(c.data_scadenza) < new Date();
                        const esaurito = c.utilizzi_max && c.utilizzi_count >= c.utilizzi_max;
                        let stato = attivo && !scaduto && !esaurito
                            ? '<span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">✅ Attivo</span>'
                            : scaduto
                                ? '<span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">⏰ Scaduto</span>'
                                : esaurito
                                    ? '<span class="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">🚫 Esaurito</span>'
                                    : '<span class="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">⛔ Disattivo</span>';
                        const valore = c.tipo === 'PERCENTUALE' ? c.valore + '%' : '€' + c.valore;
                        const scadenza = c.data_scadenza ? c.data_scadenza : '∞';
                        const utilizzi = c.utilizzi_max ? c.utilizzi_count + ' / ' + c.utilizzi_max : c.utilizzi_count + ' / ∞';
                        const sorgenteColor = {
                            CANALE: 'bg-blue-100 text-blue-700',
                            PROMOZIONE: 'bg-purple-100 text-purple-700',
                            MANUALE: 'bg-yellow-100 text-yellow-700',
                            FORM: 'bg-teal-100 text-teal-700'
                        }[c.sorgente] || 'bg-gray-100 text-gray-700';
                        return \`<tr class="border-b border-gray-100 hover:bg-gray-50">
                            <td class="px-3 py-2 font-mono font-bold text-gray-800">\${c.codice}</td>
                            <td class="px-3 py-2 text-gray-600 max-w-xs truncate">\${c.descrizione || '-'}</td>
                            <td class="px-3 py-2 text-gray-600">\${c.tipo}</td>
                            <td class="px-3 py-2 font-bold text-orange-600">\${valore}</td>
                            <td class="px-3 py-2"><span class="px-2 py-0.5 text-xs rounded-full font-medium \${sorgenteColor}">\${c.sorgente}</span></td>
                            <td class="px-3 py-2 text-gray-500 text-xs">\${scadenza}</td>
                            <td class="px-3 py-2 text-gray-500 text-xs">\${utilizzi}</td>
                            <td class="px-3 py-2">\${stato}</td>
                            <td class="px-3 py-2">
                                <div class="flex gap-1">
                                    <button onclick="modificaCodice('\${c.codice}')" 
                                            class="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs rounded transition" title="Modifica">✏️</button>
                                    <button onclick="toggleCodice('\${c.codice}', \${attivo ? 0 : 1})"
                                            class="px-2 py-1 \${attivo ? 'bg-red-100 hover:bg-red-200 text-red-700' : 'bg-green-100 hover:bg-green-200 text-green-700'} text-xs rounded transition"
                                            title="\${attivo ? 'Disattiva' : 'Attiva'}">\${attivo ? '⛔' : '✅'}</button>
                                </div>
                            </td>
                        </tr>\`;
                    }).join('');
                } catch(e) {
                    document.getElementById('discountCodesTableBody').innerHTML =
                        '<tr><td colspan="9" class="px-3 py-4 text-center text-red-500">Errore caricamento: ' + e.message + '</td></tr>';
                }
            }

            // ─── Apri modal nuovo codice ──────────────────────────────────
            function apriFormNuovoCodice() {
                document.getElementById('discountModalTitle').textContent = 'Nuovo Codice Sconto';
                document.getElementById('discountModalMode').value = 'create';
                document.getElementById('discountModalCodiceOriginal').value = '';
                document.getElementById('dcCodice').value = '';
                document.getElementById('dcCodice').disabled = false;
                document.getElementById('dcTipo').value = 'PERCENTUALE';
                document.getElementById('dcValore').value = '';
                document.getElementById('dcSorgente').value = 'MANUALE';
                document.getElementById('dcDescrizione').value = '';
                document.getElementById('dcScadenza').value = '';
                document.getElementById('dcUtilizziMax').value = '';
                document.getElementById('dcErrorMsg').classList.add('hidden');
                document.getElementById('discountModal').classList.remove('hidden');
            }

            // ─── Apri modal modifica codice ───────────────────────────────
            function modificaCodice(codice) {
                // Trova il codice nei dati già caricati
                fetch('/api/discount-codes')
                    .then(r => r.json())
                    .then(d => {
                        const c = d.codes.find(x => x.codice === codice);
                        if (!c) return alert('Codice non trovato');
                        document.getElementById('discountModalTitle').textContent = 'Modifica: ' + c.codice;
                        document.getElementById('discountModalMode').value = 'edit';
                        document.getElementById('discountModalCodiceOriginal').value = c.codice;
                        document.getElementById('dcCodice').value = c.codice;
                        document.getElementById('dcCodice').disabled = true;
                        document.getElementById('dcTipo').value = c.tipo;
                        document.getElementById('dcValore').value = c.valore;
                        document.getElementById('dcSorgente').value = c.sorgente;
                        document.getElementById('dcDescrizione').value = c.descrizione || '';
                        document.getElementById('dcScadenza').value = c.data_scadenza || '';
                        document.getElementById('dcUtilizziMax').value = c.utilizzi_max || '';
                        document.getElementById('dcErrorMsg').classList.add('hidden');
                        document.getElementById('discountModal').classList.remove('hidden');
                    });
            }

            // ─── Salva (crea o modifica) ──────────────────────────────────
            async function salvaDiscountCode() {
                const mode   = document.getElementById('discountModalMode').value;
                const codice = document.getElementById('dcCodice').value.trim().toUpperCase();
                const tipo   = document.getElementById('dcTipo').value;
                const valore = parseFloat(document.getElementById('dcValore').value);
                const sorgente  = document.getElementById('dcSorgente').value;
                const descrizione  = document.getElementById('dcDescrizione').value.trim();
                const scadenza     = document.getElementById('dcScadenza').value;
                const utilizziMax  = document.getElementById('dcUtilizziMax').value;
                const errEl = document.getElementById('dcErrorMsg');

                if (!codice) { errEl.textContent = 'Il codice è obbligatorio'; errEl.classList.remove('hidden'); return; }
                if (isNaN(valore) || valore <= 0) { errEl.textContent = 'Inserisci un valore valido maggiore di 0'; errEl.classList.remove('hidden'); return; }
                errEl.classList.add('hidden');

                const payload = {
                    codice, tipo, valore, sorgente,
                    descrizione: descrizione || null,
                    data_scadenza: scadenza || null,
                    utilizzi_max: utilizziMax ? parseInt(utilizziMax) : null
                };

                try {
                    let r;
                    if (mode === 'create') {
                        r = await fetch('/api/discount-codes', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                    } else {
                        const codiceOrig = document.getElementById('discountModalCodiceOriginal').value;
                        r = await fetch('/api/discount-codes/' + codiceOrig, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                    }
                    const res = await r.json();
                    if (res.success) {
                        chiudiDiscountModal();
                        loadDiscountCodes();
                    } else {
                        errEl.textContent = res.error || 'Errore salvataggio';
                        errEl.classList.remove('hidden');
                    }
                } catch(e) {
                    errEl.textContent = 'Errore di rete: ' + e.message;
                    errEl.classList.remove('hidden');
                }
            }

            // ─── Attiva / Disattiva codice ────────────────────────────────
            async function toggleCodice(codice, nuovoAttivo) {
                const azione = nuovoAttivo ? 'attivare' : 'disattivare';
                if (!confirm('Vuoi ' + azione + ' il codice ' + codice + '?')) return;
                try {
                    const r = await fetch('/api/discount-codes/' + codice, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ attivo: nuovoAttivo })
                    });
                    const res = await r.json();
                    if (res.success) loadDiscountCodes();
                    else alert('Errore: ' + res.error);
                } catch(e) {
                    alert('Errore di rete: ' + e.message);
                }
            }

            // ─── Chiudi modal ─────────────────────────────────────────────
            function chiudiDiscountModal() {
                document.getElementById('discountModal').classList.add('hidden');
            }

            // Chiudi modal cliccando fuori
            document.getElementById('discountModal').addEventListener('click', function(e) {
                if (e.target === this) chiudiDiscountModal();
            });

            // Carica all'avvio
            document.addEventListener('DOMContentLoaded', loadDiscountCodes);
            if (document.readyState !== 'loading') loadDiscountCodes();
        </script>

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
                            <th class="pb-3 text-sm font-semibold text-gray-600">IVA</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Status</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600">Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="assistitiTable">
                        <tr>
                            <td colspan="10" class="py-8 text-center text-gray-400">
                                <i class="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                <p>Caricamento assistiti...</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Analisi Lead: Servizi, Piani e Fonti (Compattati su 1 riga) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 mb-8">
            <!-- Distribuzione Servizi -->
            <div class="bg-white p-5 sm:p-6 lg:p-7 rounded-xl shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-pie text-purple-500 mr-2"></i>
                    Distribuzione Servizi
                </h3>
                <div id="servicesChart" class="space-y-3">
                    <!-- Populated by JS -->
                </div>
            </div>

            <!-- Piano BASE vs AVANZATO -->
            <div class="bg-white p-5 sm:p-6 lg:p-7 rounded-xl shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-chart-bar text-blue-500 mr-2"></i>
                    Piano BASE vs AVANZATO
                </h3>
                <div id="plansChart" class="space-y-3">
                    <!-- Populated by JS -->
                </div>
            </div>


            <!-- Distribuzione per Fonte -->
            <div class="bg-white p-5 sm:p-6 lg:p-7 rounded-xl shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <i class="fas fa-source text-teal-500 mr-2"></i>
                    Distribuzione per Fonte
                </h3>
                <div id="fontesDistribution" class="space-y-3">
                    <!-- Distribuzione fonti verrà popolata dinamicamente -->
                </div>
            </div>
        </div>

        <!-- Ultimi Lead Ricevuti -->
        <div class="bg-white rounded-xl shadow-sm p-5 sm:p-6 lg:p-8">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-clock text-green-500 mr-2"></i>
                    Ultimi Lead Ricevuti
                </h3>
                <span class="text-sm text-gray-500" id="lastUpdate">Aggiornato ora</span>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full table-auto">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 px-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Lead ID</th>
                            <th class="pb-3 px-2 text-sm font-semibold text-gray-600 min-w-[180px]">Cliente</th>
                            <th class="pb-3 px-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Telefono</th>
                            <th class="pb-3 px-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Servizio</th>
                            <th class="pb-3 px-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Piano</th>
                            <th class="pb-3 px-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Dispositivo</th>
                            <th class="pb-3 px-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Prezzo</th>
                            <th class="pb-3 px-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Contratto</th>
                            <th class="pb-3 px-2 text-sm font-semibold text-gray-600 whitespace-nowrap">Data</th>
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

    <!-- ============================================================ -->
    <!-- TABELLA DDT (inline nel dashboard operativo)                -->
    <!-- ============================================================ -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-truck text-teal-500 mr-2"></i>
                    DDT – Documenti di Trasporto
                    <span id="ddtCount" class="ml-3 text-sm bg-teal-100 text-teal-700 px-3 py-1 rounded-full font-bold">0</span>
                </h3>
                <div class="flex gap-2 flex-wrap">
                    <input type="text" id="searchDDT" class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48" placeholder="🔍 Cerca DDT..." oninput="filterDDTTable()">
                    <select id="filterDDTStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="filterDDTTable()">
                        <option value="">Tutti gli stati</option>
                        <option value="consegnato">Consegnato</option>
                        <option value="spedito">Spedito</option>
                        <option value="preparazione">In preparazione</option>
                    </select>
                    <button onclick="openDDTCreate()" class="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm">
                        <i class="fas fa-plus mr-2"></i>Nuovo DDT
                    </button>
                    <a href="/admin/ddt" class="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        <i class="fas fa-external-link-alt mr-1"></i>Vista completa
                    </a>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">N° DDT</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Data</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase">Destinatario</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase">Dispositivo</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">IMEI / S/N</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Contratto</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">PDF</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase">Stato</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase">Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="ddtTable">
                        <tr><td colspan="9" class="py-8 text-center text-gray-400">
                            <i class="fas fa-spinner fa-spin text-3xl mb-2"></i><p>Caricamento DDT...</p>
                        </td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- ============================================================ -->
    <!-- TABELLA DISPOSITIVI (inline nel dashboard operativo)         -->
    <!-- ============================================================ -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div class="bg-white p-6 rounded-xl shadow-sm">
            <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-mobile-alt text-cyan-500 mr-2"></i>
                    Magazzino Dispositivi SiDLY
                    <span id="devCount" class="ml-3 text-sm bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-bold">0</span>
                </h3>
                <div class="flex gap-2 flex-wrap">
                    <input type="text" id="searchDev" class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48" placeholder="🔍 Cerca IMEI / nome..." oninput="filterDevTable()">
                    <select id="filterDevStatus" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="filterDevTable()">
                        <option value="">Tutti gli stati</option>
                        <option value="inventory">Magazzino</option>
                        <option value="assigned">Assegnato</option>
                        <option value="active">Attivo</option>
                        <option value="returned">Reso</option>
                    </select>
                    <select id="filterDevModello" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="filterDevTable()">
                        <option value="">Tutti i modelli</option>
                        <option value="SiDLY CARE PRO">SiDLY CARE PRO</option>
                        <option value="SiDLY VITAL CARE">SiDLY VITAL CARE</option>
                    </select>
                    <a href="/admin/devices" class="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                        <i class="fas fa-external-link-alt mr-1"></i>Gestione completa
                    </a>
                </div>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">IMEI / S/N</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase">Modello</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase">Stato</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase">Assegnato a</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Data ass.</th>
                            <th class="pb-3 px-2 text-xs font-semibold text-gray-500 uppercase text-center">Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="devTable">
                        <tr><td colspan="5" class="py-8 text-center text-gray-400">
                            <i class="fas fa-spinner fa-spin text-3xl mb-2"></i><p>Caricamento dispositivi...</p>
                        </td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- DEVICE CRUD MODAL -->
    <div id="devModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-screen overflow-y-auto">
            <div class="flex items-center justify-between p-6 border-b">
                <h3 class="text-lg font-bold text-gray-800" id="devModalTitle">Dispositivo</h3>
                <button onclick="closeDevModal()" class="text-gray-400 hover:text-gray-600 text-xl"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6" id="devModalBody"></div>
            <div class="px-6 pb-6 flex justify-end gap-2" id="devModalFooter">
                <button onclick="closeDevModal()" class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Chiudi</button>
            </div>
        </div>
    </div>

    <!-- DDT CRUD MODAL -->
    <div id="ddtModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div class="flex items-center justify-between p-6 border-b">
                <h3 class="text-lg font-bold text-gray-800" id="ddtModalTitle">Dettaglio DDT</h3>
                <button onclick="closeDDTModal()" class="text-gray-400 hover:text-gray-600 text-xl"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6" id="ddtModalBody"></div>
            <div class="px-6 pb-6 flex justify-end gap-2" id="ddtModalFooter">
                <button onclick="closeDDTModal()" class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Chiudi</button>
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

        // ── DDT TABLE ────────────────────────────────────────────────
        let allDDTs = [];
        let allDevices = [];

        async function loadDDTTable() {
            try {
                const res = await fetch('/api/ddts');
                const data = await res.json();
                allDDTs = data.ddts || [];
                document.getElementById('ddtCount').textContent = allDDTs.length;
                filterDDTTable();
            } catch(e) {
                console.error('DDT load error:', e);
                const tb = document.getElementById('ddtTable');
                if (tb) tb.innerHTML = '<tr><td colspan="9" class="py-4 text-center text-red-400">Errore caricamento DDT</td></tr>';
            }
        }

        // Aggiorna tutti i DDT senza status corretto a CONSEGNATO + genera pdf_url
        async function fixDDTStatus() {
            if (!confirm('Aggiornare tutti i DDT senza pdf_url o con status vuoto/preparazione a CONSEGNATO?')) return;
            try {
                const response = await fetch('/api/ddts/fix-status', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const result = await response.json();
                if (result.success) {
                    alert('COMPLETATO: ' + result.message + (result.updated === 0 ? ' (tutti i DDT avevano gia status corretto)' : ''));
                    loadDDTTable();
                } else {
                    alert('ERRORE: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                alert('ERRORE di comunicazione: ' + error.message);
            }
        }

        function filterDDTTable() {
            const q = (document.getElementById('searchDDT')?.value || '').toLowerCase();
            const st = (document.getElementById('filterDDTStatus')?.value || '').toLowerCase();
            let filtered = allDDTs.filter(d => {
                const matchQ = !q || (d.numero_ddt||'').toLowerCase().includes(q) || (d.destinatario_nome||'').toLowerCase().includes(q) || (d.serial_number||'').toLowerCase().includes(q);
                const matchSt = !st || (d.status||'').toLowerCase() === st;
                return matchQ && matchSt;
            });
            renderDDTTable(filtered);
        }

        function renderDDTTable(list) {
            const tb = document.getElementById('ddtTable');
            if (!tb) return;
            if (!list.length) {
                tb.innerHTML = '<tr><td colspan="9" class="py-6 text-center text-gray-400">Nessun DDT trovato</td></tr>';
                return;
            }
            const statusMap = {
                consegnato: ['bg-green-100 text-green-700','fa-check-circle','Consegnato'],
                spedito:    ['bg-yellow-100 text-yellow-700','fa-shipping-fast','Spedito'],
                preparazione:['bg-blue-100 text-blue-700','fa-box-open','Preparazione'],
                annullato:  ['bg-red-100 text-red-700','fa-times-circle','Annullato']
            };
            tb.innerHTML = list.map((d, idx) => {
                const s = statusMap[(d.status||'').toLowerCase()] || ['bg-gray-100 text-gray-600','fa-question','—'];
                const dtStr = d.created_at ? new Date(d.created_at).toLocaleDateString('it-IT') : '—';
                // Usa sempre /api/ddts/:id/pdf-print — il pdf_url nel DB può essere obsoleto
                // (le DDT vecchie avevano pdf_url=/ddt/DDT_xxx.pdf che non esiste)
                const pdfHref = '/api/ddts/' + encodeURIComponent(d.id || d.numero_ddt) + '/pdf-print';
                const pdfBtn = '<a href="' + pdfHref + '" target="_blank" class="text-red-500 hover:text-red-700" title="Apri PDF DDT"><i class="fas fa-file-pdf"></i></a>';
                const contractLink = d.note
                    ? '<span class="text-xs text-gray-500 max-w-xs truncate block" title="' + escapeHtml(d.note) + '">' + escapeHtml(d.note).substring(0,30) + (d.note.length>30?'…':'') + '</span>'
                    : '—';
                const snDisplay = d.serial_number ? '<span class="font-mono text-xs">' + escapeHtml(d.serial_number) + '</span>' : '<span class="text-gray-300">—</span>';
                return '<tr class="border-b border-gray-100 hover:bg-gray-50">' +
                    '<td class="px-2 py-3 font-mono text-xs font-semibold text-teal-700 whitespace-nowrap">' + escapeHtml(d.numero_ddt||'—') + '</td>' +
                    '<td class="px-2 py-3 text-xs text-gray-500 whitespace-nowrap">' + dtStr + '</td>' +
                    '<td class="px-2 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">' + escapeHtml(d.destinatario_nome||'—') + '</td>' +
                    '<td class="px-2 py-3 text-xs text-gray-600">' + escapeHtml(d.dispositivo||'—') + '</td>' +
                    '<td class="px-2 py-3">' + snDisplay + '</td>' +
                    '<td class="px-2 py-3">' + contractLink + '</td>' +
                    '<td class="px-2 py-3 text-center">' + pdfBtn + '</td>' +
                    '<td class="px-2 py-3"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ' + s[0] + '"><i class="fas ' + s[1] + '"></i>' + s[2] + '</span></td>' +
                    '<td class="px-2 py-3 whitespace-nowrap">' +
                        '<button onclick="openDDTDetail(' + idx + ')" class="text-blue-500 hover:text-blue-700 mr-2" title="Dettaglio"><i class="fas fa-eye"></i></button>' +
                        '<button onclick="openDDTEdit(' + idx + ')" class="text-green-500 hover:text-green-700 mr-2" title="Modifica"><i class="fas fa-edit"></i></button>' +
                        '<button onclick="deleteDDT(' + idx + ')" class="text-red-400 hover:text-red-600" title="Elimina"><i class="fas fa-trash"></i></button>' +
                    '</td></tr>';
            }).join('');
        }

        function openDDTDetail(idx) {
            const d = typeof idx === 'number' ? allDDTs[idx] : allDDTs.find(x => x.id === idx || x.numero_ddt === idx);
            if (!d) return;
            document.getElementById('ddtModalTitle').textContent = 'DDT ' + (d.numero_ddt||d.id);
            // Usa sempre /api/ddts/:id/pdf-print (il pdf_url nel DB può essere obsoleto)
            const pdfDetailHref = '/api/ddts/' + encodeURIComponent(d.id || d.numero_ddt) + '/pdf-print';
            const pdfLink = '<a href="' + pdfDetailHref + '" target="_blank" class="text-red-600 hover:underline"><i class="fas fa-file-pdf mr-1"></i>Apri PDF</a>';
            document.getElementById('ddtModalBody').innerHTML =
                '<div class="grid grid-cols-2 gap-3 text-sm">' +
                '<div><span class="font-semibold text-gray-500">N° DDT:</span><p class="font-mono">' + escapeHtml(d.numero_ddt) + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Data:</span><p>' + (d.created_at ? new Date(d.created_at).toLocaleDateString('it-IT') : '—') + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Destinatario:</span><p>' + escapeHtml(d.destinatario_nome||'—') + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Città:</span><p>' + escapeHtml((d.destinatario_citta||'') + (d.destinatario_provincia ? ' (' + d.destinatario_provincia + ')' : '')) + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Indirizzo:</span><p>' + escapeHtml(d.destinatario_indirizzo||'—') + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">CAP:</span><p>' + escapeHtml(d.destinatario_cap||'—') + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Dispositivo:</span><p>' + escapeHtml(d.dispositivo||'—') + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">IMEI / S/N:</span><p class="font-mono">' + escapeHtml(d.serial_number||'—') + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Stato:</span><p>' + escapeHtml(d.status||'—') + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">PDF:</span><p>' + pdfLink + '</p></div>' +
                (d.note ? '<div class="col-span-2"><span class="font-semibold text-gray-500">Note / Contratto:</span><p class="text-gray-600 text-xs">' + escapeHtml(d.note) + '</p></div>' : '') +
                '</div>';
            const dIdx = allDDTs.indexOf(d);
            document.getElementById('ddtModalFooter').innerHTML =
                '<button onclick="closeDDTModal()" class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Chiudi</button>' +
                '<button onclick="openDDTEdit(' + dIdx + ')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-2">Modifica</button>';
            document.getElementById('ddtModal').classList.remove('hidden');
        }

        function openDDTEdit(idx) {
            const d = typeof idx === 'number' ? allDDTs[idx] : allDDTs.find(x => x.id === idx || x.numero_ddt === idx);
            if (!d) return;
            document.getElementById('ddtModalTitle').textContent = 'Modifica DDT ' + (d.numero_ddt||d.id);
            document.getElementById('ddtModalBody').innerHTML =
                '<form id="ddtEditForm" class="grid grid-cols-2 gap-3 text-sm">' +
                '<div class="col-span-2 sm:col-span-1"><label class="font-semibold text-gray-600">Destinatario</label>' +
                '<input name="destinatario_nome" value="' + escapeHtml(d.destinatario_nome||'') + '" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></div>' +
                '<div><label class="font-semibold text-gray-600">Indirizzo</label>' +
                '<input name="destinatario_indirizzo" value="' + escapeHtml(d.destinatario_indirizzo||'') + '" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></div>' +
                '<div><label class="font-semibold text-gray-600">CAP</label>' +
                '<input name="destinatario_cap" value="' + escapeHtml(d.destinatario_cap||'') + '" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></div>' +
                '<div><label class="font-semibold text-gray-600">Città</label>' +
                '<input name="destinatario_citta" value="' + escapeHtml(d.destinatario_citta||'') + '" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></div>' +
                '<div><label class="font-semibold text-gray-600">Provincia</label>' +
                '<input name="destinatario_provincia" value="' + escapeHtml(d.destinatario_provincia||'') + '" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm" maxlength="2"></div>' +
                '<div><label class="font-semibold text-gray-600">Dispositivo</label>' +
                '<select name="dispositivo" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm">' +
                '<option value="SiDLY CARE PRO"' + (d.dispositivo==='SiDLY CARE PRO'?' selected':'') + '>SiDLY CARE PRO</option>' +
                '<option value="SiDLY VITAL CARE"' + (d.dispositivo==='SiDLY VITAL CARE'?' selected':'') + '>SiDLY VITAL CARE</option>' +
                '</select></div>' +
                '<div><label class="font-semibold text-gray-600">IMEI / S/N</label>' +
                '<input name="serial_number" value="' + escapeHtml(d.serial_number||'') + '" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"></div>' +
                '<div><label class="font-semibold text-gray-600">Stato</label>' +
                '<select name="status" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm">' +
                '<option value="consegnato"' + (d.status==='consegnato'?' selected':'') + '>Consegnato</option>' +
                '<option value="spedito"' + (d.status==='spedito'?' selected':'') + '>Spedito</option>' +
                '<option value="preparazione"' + (d.status==='preparazione'?' selected':'') + '>In preparazione</option>' +
                '<option value="annullato"' + (d.status==='annullato'?' selected':'') + '>Annullato</option>' +
                '</select></div>' +
                '<div class="col-span-2"><label class="font-semibold text-gray-600">URL PDF</label>' +
                '<input name="pdf_url" value="' + escapeHtml(d.pdf_url||'') + '" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="/contratti/file.pdf"></div>' +
                '<div class="col-span-2"><label class="font-semibold text-gray-600">Note / Rif. Contratto</label>' +
                '<textarea name="note" rows="2" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm">' + escapeHtml(d.note||'') + '</textarea></div>' +
                '</form>';
            const editIdx = allDDTs.indexOf(d);
            document.getElementById('ddtModalFooter').innerHTML =
                '<button onclick="closeDDTModal()" class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Annulla</button>' +
                '<button onclick="saveDDTEdit(' + editIdx + ')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ml-2"><i class="fas fa-save mr-1"></i>Salva</button>';
            document.getElementById('ddtModal').classList.remove('hidden');
        }

        async function saveDDTEdit(idx) {
            const dObj = typeof idx === 'number' ? allDDTs[idx] : allDDTs.find(x => x.id === idx || x.numero_ddt === idx);
            const id = dObj ? (dObj.id || dObj.numero_ddt) : idx;
            const form = document.getElementById('ddtEditForm');
            if (!form) return;
            const fd = new FormData(form);
            const payload = {};
            fd.forEach((v, k) => { payload[k] = v; });
            try {
                const res = await fetch('/api/ddts/' + id, { method: 'PUT', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                const data = await res.json();
                if (data.success) {
                    closeDDTModal();
                    await loadDDTTable();
                    showToast('DDT aggiornato con successo', 'success');
                } else {
                    showToast('Errore: ' + (data.error||'Sconosciuto'), 'error');
                }
            } catch(e) { showToast('Errore di rete', 'error'); }
        }

        function openDDTCreate() {
            document.getElementById('ddtModalTitle').textContent = 'Nuovo DDT';
            document.getElementById('ddtModalBody').innerHTML =
                '<form id="ddtCreateForm" class="grid grid-cols-2 gap-3 text-sm">' +
                '<div class="col-span-2 sm:col-span-1"><label class="font-semibold text-gray-600">Destinatario *</label>' +
                '<input name="destinatario_nome" required class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></div>' +
                '<div><label class="font-semibold text-gray-600">Indirizzo</label>' +
                '<input name="destinatario_indirizzo" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></div>' +
                '<div><label class="font-semibold text-gray-600">CAP</label>' +
                '<input name="destinatario_cap" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></div>' +
                '<div><label class="font-semibold text-gray-600">Città</label>' +
                '<input name="destinatario_citta" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></div>' +
                '<div><label class="font-semibold text-gray-600">Provincia</label>' +
                '<input name="destinatario_provincia" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm" maxlength="2"></div>' +
                '<div><label class="font-semibold text-gray-600">Dispositivo *</label>' +
                '<select name="dispositivo" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm">' +
                '<option value="SiDLY CARE PRO">SiDLY CARE PRO</option>' +
                '<option value="SiDLY VITAL CARE">SiDLY VITAL CARE</option>' +
                '</select></div>' +
                '<div><label class="font-semibold text-gray-600">IMEI / S/N</label>' +
                '<input name="serial_number" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono" placeholder="868298..."></div>' +
                '<div><label class="font-semibold text-gray-600">Stato</label>' +
                '<select name="status" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm">' +
                '<option value="preparazione">In preparazione</option>' +
                '<option value="spedito">Spedito</option>' +
                '<option value="consegnato">Consegnato</option>' +
                '</select></div>' +
                '<div class="col-span-2"><label class="font-semibold text-gray-600">URL PDF</label>' +
                '<input name="pdf_url" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm" placeholder="/contratti/file.pdf"></div>' +
                '<div class="col-span-2"><label class="font-semibold text-gray-600">Note / Rif. Contratto</label>' +
                '<textarea name="note" rows="2" class="mt-1 w-full border rounded-lg px-3 py-2 text-sm"></textarea></div>' +
                '</form>';
            document.getElementById('ddtModalFooter').innerHTML =
                '<button onclick="closeDDTModal()" class="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Annulla</button>' +
                '<button onclick="createDDT()" class="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 ml-2"><i class="fas fa-plus mr-1"></i>Crea DDT</button>';
            document.getElementById('ddtModal').classList.remove('hidden');
        }

        async function createDDT() {
            const form = document.getElementById('ddtCreateForm');
            if (!form) return;
            if (!form.checkValidity()) { form.reportValidity(); return; }
            const fd = new FormData(form);
            const payload = {};
            fd.forEach((v, k) => { payload[k] = v; });
            payload.quantita = 1;
            try {
                const res = await fetch('/api/ddts', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
                const data = await res.json();
                if (data.success) {
                    closeDDTModal();
                    await loadDDTTable();
                    showToast('DDT creato con successo', 'success');
                } else {
                    showToast('Errore: ' + (data.error||'Sconosciuto'), 'error');
                }
            } catch(e) { showToast('Errore di rete', 'error'); }
        }

        async function deleteDDT(idx) {
            const dObj = typeof idx === 'number' ? allDDTs[idx] : allDDTs.find(x => x.id === idx || x.numero_ddt === idx);
            const id = dObj ? (dObj.id || dObj.numero_ddt) : idx;
            if (!confirm('Eliminare il DDT ' + (dObj ? (dObj.numero_ddt || id) : id) + '?')) return;
            try {
                const res = await fetch('/api/ddts/' + encodeURIComponent(id), { method: 'DELETE' });
                const data = await res.json();
                if (data.success) {
                    await loadDDTTable();
                    showToast('DDT eliminato', 'success');
                } else {
                    showToast('Errore: ' + (data.error||'Sconosciuto'), 'error');
                }
            } catch(e) { showToast('Errore di rete', 'error'); }
        }

        function closeDDTModal() {
            document.getElementById('ddtModal').classList.add('hidden');
        }

        // ── DEVICES TABLE ─────────────────────────────────────────────
        async function loadDevTable() {
            try {
                const res = await fetch('/api/devices/inventory');
                const data = await res.json();
                allDevices = (data.data?.devices || data.devices || []);
                document.getElementById('devCount').textContent = allDevices.length;
                filterDevTable();
            } catch(e) {
                console.error('Devices load error:', e);
                const tb = document.getElementById('devTable');
                if (tb) tb.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-red-400">Errore caricamento dispositivi</td></tr>';
            }
        }

        function filterDevTable() {
            const q = (document.getElementById('searchDev')?.value || '').toLowerCase();
            const st = (document.getElementById('filterDevStatus')?.value || '').toLowerCase();
            const md = (document.getElementById('filterDevModello')?.value || '').toLowerCase();
            let filtered = allDevices.filter(d => {
                const matchQ = !q || (d.imei||'').toLowerCase().includes(q) || (d.assegnato_a||'').toLowerCase().includes(q) || (d.model||d.modello||'').toLowerCase().includes(q);
                const matchSt = !st || (d.status||'').toLowerCase() === st;
                const matchMd = !md || (d.model||d.modello||'').toLowerCase().includes(md);
                return matchQ && matchSt && matchMd;
            });
            renderDevTable(filtered);
        }

        function renderDevTable(list) {
            const tb = document.getElementById('devTable');
            if (!tb) return;
            if (!list.length) {
                tb.innerHTML = '<tr><td colspan="6" class="py-6 text-center text-gray-400">Nessun dispositivo trovato</td></tr>';
                return;
            }
            const statusMap = {
                active:    ['bg-green-100 text-green-700','fa-check-circle','Attivo'],
                assigned:  ['bg-blue-100 text-blue-700','fa-user-check','Assegnato'],
                inventory: ['bg-gray-100 text-gray-600','fa-warehouse','Magazzino'],
                shipped:   ['bg-yellow-100 text-yellow-700','fa-shipping-fast','Spedito'],
                returned:  ['bg-red-100 text-red-700','fa-undo','Reso'],
                unassigned:['bg-orange-100 text-orange-700','fa-box-open','Non assegnato']
            };
            tb.innerHTML = list.map(d => {
                const modello = d.model || d.modello || '—';
                const imei = d.imei || d.serial_number || '—';
                const assigned = d.assegnato_a || d.assegnato_assistito || '';
                const effectiveStatus = assigned ? 'assigned' : 'unassigned';
                const s = statusMap[effectiveStatus];
                const ddtDate = d.ddt_date || d.assigned_at;
                const dtStr = ddtDate ? new Date(ddtDate).toLocaleDateString('it-IT') : '—';
                const assignedDisplay = assigned || '<span class="text-orange-400 italic">Non assegnato</span>';
                return '<tr class="border-b border-gray-100 hover:bg-gray-50" data-imei="' + escapeHtml(imei) + '">' +
                    '<td class="px-2 py-3 font-mono text-xs font-medium text-gray-800">' + escapeHtml(imei) + '</td>' +
                    '<td class="px-2 py-3 text-sm text-gray-700">' + escapeHtml(modello) + '</td>' +
                    '<td class="px-2 py-3"><span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ' + s[0] + '"><i class="fas ' + s[1] + '"></i>' + s[2] + '</span></td>' +
                    '<td class="px-2 py-3 text-sm text-gray-700">' + assignedDisplay + '</td>' +
                    '<td class="px-2 py-3 text-xs text-gray-400">' + dtStr + '</td>' +
                    '<td class="px-2 py-3 text-center whitespace-nowrap">' +
                        '<button data-action="detail" class="text-blue-500 hover:text-blue-700 mr-2" title="Dettaglio"><i class="fas fa-eye"></i></button>' +
                        '<button data-action="edit"   class="text-green-500 hover:text-green-700 mr-2" title="Modifica"><i class="fas fa-edit"></i></button>' +
                        '<button data-action="delete" class="text-red-400 hover:text-red-600" title="Elimina"><i class="fas fa-trash"></i></button>' +
                    '</td>' +
                    '</tr>';
            }).join('');
        }

        function openDevModal() { document.getElementById('devModal').classList.remove('hidden'); }
        function closeDevModal() { document.getElementById('devModal').classList.add('hidden'); }

        // Event delegation per i pulsanti CRUD dispositivi
        document.getElementById('devTable').addEventListener('click', function(e) {
            const btn = e.target.closest('button[data-action]');
            if (!btn) return;
            const row = btn.closest('tr[data-imei]');
            if (!row) return;
            const imei = row.getAttribute('data-imei');
            const action = btn.getAttribute('data-action');
            if (action === 'detail') openDevDetail(imei);
            else if (action === 'edit') openDevEdit(imei);
            else if (action === 'delete') deleteDevice(imei);
        });

        function openDevDetail(imei) {
            const d = allDevices.find(x => (x.imei || x.serial_number) === imei);
            if (!d) return;
            const modello = d.model || d.modello || '—';
            const assigned = d.assegnato_a || '—';
            const ddtDate = d.ddt_date || d.assigned_at;
            const dtStr = ddtDate ? new Date(ddtDate).toLocaleDateString('it-IT') : '—';
            const ddt = d.ddt_numero || '—';
            document.getElementById('devModalTitle').textContent = 'Dispositivo ' + imei;
            document.getElementById('devModalBody').innerHTML =
                '<div class="grid grid-cols-2 gap-4 text-sm">' +
                '<div><span class="font-semibold text-gray-500">IMEI / S/N</span><p class="font-mono mt-1">' + escapeHtml(imei) + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Modello</span><p class="mt-1">' + escapeHtml(modello) + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Assegnato a</span><p class="mt-1">' + escapeHtml(assigned) + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Data assegnazione</span><p class="mt-1">' + dtStr + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">N° DDT</span><p class="font-mono mt-1">' + escapeHtml(ddt) + '</p></div>' +
                '<div><span class="font-semibold text-gray-500">Stato DB</span><p class="mt-1 capitalize">' + escapeHtml(d.status || '—') + '</p></div>' +
                '</div>';
            const footerEditBtn = document.createElement('button');
            footerEditBtn.className = 'px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700';
            footerEditBtn.innerHTML = '<i class="fas fa-edit mr-1"></i>Modifica';
            footerEditBtn.onclick = function() { openDevEdit(imei); };
            const footerCloseBtn = document.createElement('button');
            footerCloseBtn.className = 'px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50';
            footerCloseBtn.textContent = 'Chiudi';
            footerCloseBtn.onclick = closeDevModal;
            const footer = document.getElementById('devModalFooter');
            footer.innerHTML = '';
            footer.appendChild(footerCloseBtn);
            footer.appendChild(footerEditBtn);
            openDevModal();
        }

        function openDevEdit(imei) {
            const d = allDevices.find(x => (x.imei || x.serial_number) === imei);
            if (!d) return;
            const modello = d.model || d.modello || '';
            const status = d.status || 'assigned';
            document.getElementById('devModalTitle').textContent = 'Modifica dispositivo';
            document.getElementById('devModalBody').innerHTML =
                '<div class="space-y-4 text-sm">' +
                '<div>' +
                '  <label class="block font-semibold text-gray-600 mb-1">IMEI / S/N</label>' +
                '  <input id="editDevImei" type="text" value="' + escapeHtml(imei) + '" readonly class="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 font-mono text-xs text-gray-500">' +
                '</div>' +
                '<div>' +
                '  <label class="block font-semibold text-gray-600 mb-1">Modello</label>' +
                '  <select id="editDevModello" class="w-full border border-gray-300 rounded-lg px-3 py-2">' +
                '    <option value="SiDLY CARE PRO"' + (modello === 'SiDLY CARE PRO' ? ' selected' : '') + '>SiDLY CARE PRO</option>' +
                '    <option value="SiDLY VITAL CARE"' + (modello === 'SiDLY VITAL CARE' ? ' selected' : '') + '>SiDLY VITAL CARE</option>' +
                '  </select>' +
                '</div>' +
                '<div>' +
                '  <label class="block font-semibold text-gray-600 mb-1">Stato</label>' +
                '  <select id="editDevStatus" class="w-full border border-gray-300 rounded-lg px-3 py-2">' +
                '    <option value="inventory"'  + (status === 'inventory'  ? ' selected' : '') + '>Magazzino</option>' +
                '    <option value="assigned"'   + (status === 'assigned'   ? ' selected' : '') + '>Assegnato</option>' +
                '    <option value="active"'     + (status === 'active'     ? ' selected' : '') + '>Attivo</option>' +
                '    <option value="shipped"'    + (status === 'shipped'    ? ' selected' : '') + '>Spedito</option>' +
                '    <option value="returned"'   + (status === 'returned'   ? ' selected' : '') + '>Reso</option>' +
                '  </select>' +
                '</div>' +
                '<p id="editDevError" class="text-red-600 text-xs hidden"></p>' +
                '</div>';
            const footer2 = document.getElementById('devModalFooter');
            footer2.innerHTML = '';
            const cancelBtn2 = document.createElement('button');
            cancelBtn2.className = 'px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50';
            cancelBtn2.textContent = 'Annulla';
            cancelBtn2.onclick = closeDevModal;
            const saveBtn = document.createElement('button');
            saveBtn.className = 'px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700';
            saveBtn.innerHTML = '<i class="fas fa-save mr-1"></i>Salva';
            saveBtn.onclick = saveDevEdit;
            footer2.appendChild(cancelBtn2);
            footer2.appendChild(saveBtn);
            openDevModal();
        }

        async function saveDevEdit() {
            const imei = document.getElementById('editDevImei').value;
            const modello = document.getElementById('editDevModello').value;
            const status = document.getElementById('editDevStatus').value;
            const errEl = document.getElementById('editDevError');
            try {
                const res = await fetch('/api/devices/update/' + encodeURIComponent(imei), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ modello, status })
                });
                const j = await res.json();
                if (!j.success) throw new Error(j.error || 'Errore sconosciuto');
                closeDevModal();
                showToast('Dispositivo aggiornato ✓', 'success');
                loadDevTable();
            } catch(e) {
                errEl.textContent = e.message;
                errEl.classList.remove('hidden');
            }
        }

        function deleteDevice(imei) {
            const d = allDevices.find(x => (x.imei || x.serial_number) === imei);
            if (!d) return;
            const nome = d.assegnato_a ? d.assegnato_a : 'nessun assistito';
            document.getElementById('devModalTitle').innerHTML = '<span class="text-red-600"><i class="fas fa-exclamation-triangle mr-2"></i>Elimina dispositivo</span>';
            document.getElementById('devModalBody').innerHTML =
                '<div class="text-sm space-y-3">' +
                '<p class="text-gray-700">Sei sicuro di voler eliminare il dispositivo:</p>' +
                '<div class="bg-red-50 border border-red-200 rounded-lg p-3">' +
                '<p class="font-mono font-semibold text-gray-800">' + escapeHtml(imei) + '</p>' +
                '<p class="text-gray-600">' + escapeHtml(d.model || d.modello || '') + ' — ' + escapeHtml(nome) + '</p>' +
                '</div>' +
                '<p class="text-red-600 font-semibold">⚠️ Questa operazione è irreversibile.</p>' +
                '</div>';
            const footer3 = document.getElementById('devModalFooter');
            footer3.innerHTML = '';
            const cancelBtn3 = document.createElement('button');
            cancelBtn3.className = 'px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50';
            cancelBtn3.textContent = 'Annulla';
            cancelBtn3.onclick = closeDevModal;
            const delBtn = document.createElement('button');
            delBtn.className = 'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700';
            delBtn.innerHTML = '<i class="fas fa-trash mr-1"></i>Elimina';
            delBtn.onclick = function() { confirmDeleteDevice(imei); };
            footer3.appendChild(cancelBtn3);
            footer3.appendChild(delBtn);
            openDevModal();
        }

        async function confirmDeleteDevice(imei) {
            try {
                const res = await fetch('/api/devices/' + encodeURIComponent(imei), { method: 'DELETE' });
                const j = await res.json();
                if (!j.success) throw new Error(j.error || 'Errore');
                closeDevModal();
                showToast('Dispositivo eliminato ✓', 'success');
                loadDevTable();
            } catch(e) {
                showToast('Errore: ' + e.message, 'error');
            }
        }

        function showToast(msg, type) {
            const existing = document.getElementById('toastMsg');
            if (existing) existing.remove();
            const toast = document.createElement('div');
            toast.id = 'toastMsg';
            toast.className = 'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold ' +
                (type === 'success' ? 'bg-green-500' : 'bg-red-500');
            toast.textContent = msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }

        // Carica dati iniziali
        loadDashboardData();
        loadDDTTable();
        loadDevTable();

        // ✅ Esponi refreshDashboardData per auto-import script e altri trigger esterni
        window.refreshDashboardData = function() {
            loadDashboardData();
        };

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
                // Carica TUTTI i lead (limite massimo 999999)
                // ✅ Aggiungi timestamp per evitare cache del browser
                const cacheBuster = Date.now();
                const allLeadsResponse = await fetch(\`/api/leads?limit=999999&_=\${cacheBuster}\`);
                const allLeadsData = await allLeadsResponse.json();
                const allLeads = allLeadsData.leads || [];
                
                // Carica CONTRATTI reali per conteggio accurato
                const contractsResponse = await fetch('/api/contratti?limit=100');
                const contractsData = await contractsResponse.json();
                const contracts = contractsData.contracts || contractsData.contratti || contractsData.data || [];
                
                // Carica ASSISTITI reali con IMEI
                const assistitiResponse = await fetch('/api/assistiti', { credentials: 'include' });
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
                
                // Ultimi 10 lead recenti non convertiti per la tabella (ordinati dal più recente)
                const leads = recentLeads
                    .sort((a, b) => {
                        const dateA = new Date(a.created_at || a.timestamp);
                        const dateB = new Date(b.created_at || b.timestamp);
                        return dateB - dateA; // DESC: più recenti prima
                    })
                    .slice(0, 10);

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
                                <td class="py-3 px-2 text-sm whitespace-nowrap">
                                    <code class="bg-gray-100 px-2 py-1 rounded text-xs" title="\${escapeHtml(lead.id)}">\${formatLeadId(lead.id)}</code>
                                </td>
                                <td class="py-3 px-2 text-sm min-w-[180px]">
                                    <div class="font-medium">\${escapeHtml(lead.nomeRichiedente)} \${escapeHtml(lead.cognomeRichiedente)}</div>
                                    <div class="text-xs text-gray-500">\${escapeHtml(lead.email)}</div>
                                </td>
                                <td class="py-3 px-2 text-sm text-gray-600" whitespace-nowrap><a href="tel:\${telefono}" class="hover:text-blue-600 hover:underline">\${telefono}</a></td>
                                <td class="py-3 px-2 text-sm font-medium text-purple-600" whitespace-nowrap>\${servizio}</td>
                                <td class="py-3 px-2 text-sm" whitespace-nowrap>\${piano}</td>
                                <td class="py-3 px-2 text-sm text-gray-600" whitespace-nowrap>\${dispositivo}</td>
                                <td class="py-3 px-2 text-sm font-bold text-green-600" whitespace-nowrap>€\${prezzo}</td>
                                <td class="py-3 px-2" whitespace-nowrap>
                                    <span class="status-badge \${statusClass}" whitespace-nowrap>\${statusText}</span>
                                </td>
                                <td class="py-3 px-2 text-xs text-gray-500" whitespace-nowrap>\${date}</td>
                            </tr>
                        \`;
                    }).join('');
                }

                // Salva tutti i lead per i grafici
                window.allLeadsData = allLeads;
                
                // Aggiorna grafici: servizi basati su ASSISTITI, piani basati su ASSISTITI
                updateServicesChart(assistiti);  // ⚠️ FIX: usa assistiti non lead
                updatePlansChart(allLeads);
                //                 updateChannelsDistribution(assistiti);  // Analizza solo assistiti attivi

                // Popola widget barre "Distribuzione per Fonte" (fonte/canale reali degli assistiti)
                updateFontesDistribution(assistiti);
                
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
            // Forza reset flag isLoading (equivalente a Cmd+Shift+R)
            isLoading = false;
            const icon = document.getElementById('refreshIcon');
            if (icon) icon.classList.add('rotating');
            loadDashboardData().finally(() => {
                setTimeout(() => { if (icon) icon.classList.remove('rotating'); }, 1000);
            });
        }
        window.refreshData = refreshData;

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
            // Conta i servizi reali dal campo assistito.servizio
            const serviceCounts = {};
            assistiti.forEach(function(assistito) {
                var svc = assistito.servizio || 'eCura PRO';
                serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
            });

            const total = assistiti.length || 1;
            const colors = {
                'eCura PRO':     'bg-purple-500',
                'eCura PREMIUM': 'bg-green-500',
                'eCura FAMILY':  'bg-blue-500'
            };

            const sorted = Object.entries(serviceCounts).sort(function(a, b) { return b[1] - a[1]; });
            const html = sorted.map(function([service, count]) {
                const percentage = Math.round((count / total) * 100);
                const color = colors[service] || 'bg-gray-500';
                return '<div>' +
                    '<div class="flex items-center justify-between mb-1">' +
                        '<span class="text-sm font-medium text-gray-700">' + service + '</span>' +
                        '<span class="text-sm font-bold text-gray-900">' + count + ' (' + percentage + '%)</span>' +
                    '</div>' +
                    '<div class="w-full bg-gray-200 rounded-full h-2">' +
                        '<div class="' + color + ' h-2 rounded-full" style="width: ' + percentage + '%"></div>' +
                    '</div>' +
                    '</div>';
            }).join('');

            document.getElementById('servicesChart').innerHTML = html || '<p class="text-gray-400 text-sm">Nessun dato disponibile</p>';
        }

        function updatePlansChart(leads) {
            // USA SOLO ASSISTITI per conteggio piani (non tutti i lead)
            const assistitiResponse = fetch('/api/assistiti', { credentials: 'include' }).then(r => r.json()).then(data => {
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
                // PRIORITÀ 1: Laura Calvi = Networking (unico caso da stefania.rocca@ecura.it)
                if (nomeCompleto.includes('laura calvi') || 
                    email.includes('stefania.rocca@ecura.it')) {
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

        // ⚠️ DEPRECATA — non usare allLeads per i contatori eCura (possono essere incompleti)
        // Usa renderFontesDistributionFromApi() che legge direttamente dall'API channel-stats
        function updateFontesDistribution(assistiti) {
            // Distribuzione per fonte basata SOLO sugli assistiti attivi (totale = n. assistiti)
            renderFontesDistributionFromAssistiti(assistiti);
        }

        // Renderizza "Distribuzione per Fonte" basata SOLO sugli assistiti attivi.
        // Usa i campi reali fonte/canale_acquisizione dal DB (via API assistiti con JOIN leads).
        // Totale = numero assistiti (non tutti i lead).
        function renderFontesDistributionFromAssistiti(assistiti) {
            const fonteColors = {
                'Privati Irbema':       'bg-blue-500',
                'Networking':           'bg-purple-500',
                'eCura — Google':       'bg-red-500',
                'eCura — Meta (FB/IG)': 'bg-indigo-500',
                'eCura — Diretto':      'bg-green-500',
                'eCura — Altro':        'bg-yellow-500',
                'Altro':                'bg-gray-400'
            };

            var fonteCounts = {};
            (assistiti || []).forEach(function(assistito) {
                var fonte           = (assistito.fonte || '').trim();
                var canale          = (assistito.canale_acquisizione || '').trim().toUpperCase();
                var leadId          = (assistito.lead_id || assistito.id || '').toString().toUpperCase();
                var etichetta       = 'Altro';

                // Priorità 1: canale_acquisizione (META/GOOGLE/DIRETTO/ALTRO) — lead da Form eCura
                if (canale === 'GOOGLE') {
                    etichetta = 'eCura — Google';
                } else if (canale === 'META') {
                    etichetta = 'eCura — Meta (FB/IG)';
                } else if (canale === 'DIRETTO') {
                    etichetta = 'eCura — Diretto';
                } else if (canale === 'ALTRO') {
                    etichetta = 'eCura — Altro';
                }
                // Priorità 2: campo fonte dal lead (o fonte_override da assistiti)
                else if (fonte === 'Privati IRBEMA' || fonte === 'B2B IRBEMA' || fonte === 'Privati Irbema' || leadId.includes('IRBEMA')) {
                    etichetta = 'Privati Irbema';
                } else if (fonte === 'NETWORKING' || fonte === 'Networking' || fonte.toLowerCase().includes('network')) {
                    etichetta = 'Networking';
                } else if (fonte === 'Sito www.eCura.it') {
                    etichetta = 'eCura — Diretto';
                } else if (fonte === 'eCura — Google') {
                    etichetta = 'eCura — Google';
                } else if (fonte === 'eCura — Diretto') {
                    etichetta = 'eCura — Diretto';
                } else if (fonte === 'eCura — Meta (FB/IG)') {
                    etichetta = 'eCura — Meta (FB/IG)';
                } else if (fonte.includes('eCura') || fonte.includes('Form')) {
                    etichetta = 'eCura — Altro';
                } else if (fonte !== '') {
                    etichetta = fonte; // Mostra la fonte così come è nel DB
                }

                fonteCounts[etichetta] = (fonteCounts[etichetta] || 0) + 1;
            });

            console.log('📊 Distribuzione Fonti (assistiti, campi DB):', fonteCounts);

            var total = (assistiti || []).length || 1;
            var sortedFontes = Object.entries(fonteCounts).sort(function(a, b) { return b[1] - a[1]; });

            var html = '';
            if (sortedFontes.length === 0) {
                html = '<p class="text-gray-400 text-sm text-center py-4">Nessun dato disponibile</p>';
            } else {
                sortedFontes.forEach(function([fonte, count]) {
                    var percentage = Math.round((count / total) * 100);
                    var color = fonteColors[fonte] || 'bg-gray-500';
                    html += '<div>' +
                        '<div class="flex items-center justify-between mb-1">' +
                            '<span class="text-sm font-medium text-gray-700">' + fonte + '</span>' +
                            '<span class="text-sm font-bold text-gray-900">' + count + ' (' + percentage + '%)</span>' +
                        '</div>' +
                        '<div class="w-full bg-gray-200 rounded-full h-2">' +
                            '<div class="' + color + ' h-2 rounded-full" style="width: ' + percentage + '%"></div>' +
                        '</div>' +
                        '</div>';
                });
            }

            var el = document.getElementById('fontesDistribution');
            if (el) el.innerHTML = html;
        }

        // ========== eCURA CHANNEL STATS ==========
        async function loadEcuraChannelStats() {
            try {
                const res = await fetch('/api/leads/channel-stats');
                const data = await res.json();
                if (!data.success) return;

                const { totalEcura, meta, google, diretto, altro, nonTracciato } = data;

                // 6 box: Totale | Meta | Google | Diretto | Altro | Non tracciato
                const boxes = [
                    { label: 'Totale Form eCura',    value: totalEcura,    color: 'bg-blue-100 text-blue-700',     border: 'border-blue-300',   icon: 'fa-file-alt' },
                    { label: 'Meta (FB/IG Ads)',     value: meta,          color: 'bg-indigo-100 text-indigo-700', border: 'border-indigo-300', icon: 'fa-hashtag' },
                    { label: 'Google',               value: google,        color: 'bg-red-100 text-red-700',       border: 'border-red-300',    icon: 'fa-search' },
                    { label: 'Diretto',              value: diretto,       color: 'bg-green-100 text-green-700',   border: 'border-green-300',  icon: 'fa-mouse-pointer' },
                    { label: 'Altro',                value: altro,         color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-300', icon: 'fa-share-alt' },
                    { label: 'Non tracciato',        value: nonTracciato,  color: 'bg-gray-100 text-gray-500',     border: 'border-gray-300',   icon: 'fa-minus-circle' },
                ];

                const html = boxes.map(b => \`
                    <div class="flex flex-col items-center justify-center rounded-lg p-4 border-2 \${b.border} \${b.color}">
                        <i class="fas \${b.icon} text-2xl mb-2 opacity-70"></i>
                        <span class="text-3xl font-extrabold">\${b.value}</span>
                        <span class="text-xs font-semibold mt-1 text-center">\${b.label}</span>
                    </div>
                \`).join('');

                // Aggiorna griglia (6 colonne)
                const grid = document.getElementById('ecuraChannelGrid');
                if (grid) {
                    grid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4';
                    grid.innerHTML = html;
                }

                const upd = document.getElementById('ecuraChannelUpdated');
                if (upd) upd.textContent = 'Aggiornato: ' + new Date().toLocaleTimeString('it-IT');
            } catch (err) {
                console.warn('⚠️ loadEcuraChannelStats error:', err);
            }
        }

        // ✅ Esponi globalmente per auto-import script e trigger esterni
        window.loadEcuraChannelStats = loadEcuraChannelStats;

        async function syncEcuraChannels() {
            const btn = document.getElementById('btnSyncChannels');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizzazione...';
            }
            try {
                const res = await fetch('/api/leads/sync-ecura-channels', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}) // server calcola giorni da inizio campagna 30/01/2026
                });
                const data = await res.json();
                if (data.success) {
                    await loadEcuraChannelStats();
                    const fromDate = data.from ? new Date(data.from).toLocaleDateString('it-IT') : '30/01/2026';
                    const msg = \`✅ Sincronizzazione completata!\\n\\nFinestra: dal \${fromDate} ad oggi (\${data.days} giorni)\\nContatti HubSpot trovati: \${data.hubspotContacts}\\nNuovi importati: \${data.imported}\\nAggiornati con canale: \${data.updated}\\nGià aggiornati / skip: \${data.skipped}\`;
                    alert(msg);
                } else {
                    alert('❌ Errore: ' + (data.error || 'Errore sconosciuto'));
                }
            } catch (err) {
                alert('❌ Errore di comunicazione: ' + err.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizza canali';
                }
            }
        }
        window.syncEcuraChannels = syncEcuraChannels;

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
            
            if (!nomeAssistito || !cognomeAssistito) {
                alert('⚠️ Campi obbligatori: Nome e Cognome');
                return;
            }

            // IMEI: invia null se vuoto (colonna UNIQUE - stringa vuota causa conflitto)
            const imeiPulito = imei && imei.trim() !== '' ? imei.trim() : null;
            
            const payload = {
                nome_assistito: nomeAssistito,
                cognome_assistito: cognomeAssistito,
                email: email,
                telefono: telefono,
                imei: imeiPulito,
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
                    '<td colspan="10" class="py-8 text-center text-gray-400">' +
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
                
                // IVA agevolata flag (from leads JOIN)
                const ivaAgevolataAssistito = assistito.iva_agevolata == 1 || assistito.iva_agevolata === true;
                const rowBg = ivaAgevolataAssistito ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50';
                const ivaBadgeCell = ivaAgevolataAssistito
                    ? '<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full" title="IVA agevolata 4% — Legge 104, disabilità 100%">⚕️ 4%</span>'
                    : '<span class="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">22%</span>';
                const prezzoCellClass = ivaAgevolataAssistito ? 'text-blue-600' : 'text-green-600';
                
                return '<tr class="border-b border-gray-100 ' + rowBg + '">' +
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
                        '<div class="font-bold ' + prezzoCellClass + ' text-base">€' + prezzoAnno + '</div>' +
                        '<div class="text-xs text-gray-500">/anno</div>' +
                    '</td>' +
                    '<td class="py-3 px-2 text-center">' +
                        ivaBadgeCell +
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

        // ── IMPORT DA GOOGLE SHEETS (backup eCura) ──────────────────────────
        async function importFromExcel() {
            // Inietta modal di progresso
            var modalHtml = '<div id="gsheet-modal" style="position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;">' +
                '<div style="background:#fff;border-radius:16px;padding:32px 36px;max-width:480px;width:90%;box-shadow:0 8px 40px rgba(0,0,0,0.18);">' +
                  '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">' +
                    '<div style="width:40px;height:40px;background:#16a34a;border-radius:10px;display:flex;align-items:center;justify-content:center;">' +
                      '<i class="fas fa-file-excel" style="color:#fff;font-size:18px;"></i></div>' +
                    '<div><h3 style="margin:0;font-size:18px;font-weight:700;color:#111827;">Import Google Sheets</h3>' +
                    '<p style="margin:0;font-size:13px;color:#6b7280;">Backup eCura — leads form</p></div></div>' +
                  '<div id="gsheet-status" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px;margin-bottom:20px;min-height:80px;">' +
                    '<p style="margin:0;color:#374151;font-size:14px;">🔄 Connessione al foglio Google Sheets...</p></div>' +
                  '<div style="display:flex;gap:10px;justify-content:flex-end;">' +
                    '<button id="gsheet-dry-btn" onclick="gsheetRunDry()" style="padding:10px 18px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:14px;font-weight:600;color:#374151;">🔍 Test (Dry Run)</button>' +
                    '<button id="gsheet-import-btn" onclick="gsheetRunImport()" style="padding:10px 18px;border:none;border-radius:8px;background:#16a34a;color:#fff;cursor:pointer;font-size:14px;font-weight:600;">✅ Importa</button>' +
                    '<button onclick="document.getElementById(&quot;gsheet-modal&quot;).remove()" style="padding:10px 18px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:14px;color:#6b7280;">✕ Chiudi</button>' +
                  '</div></div></div>';
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Verifica connessione al foglio (dry run silenzioso)
            try {
                var checkRes = await fetch('/api/import/gsheet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dryRun: true })
                });
                var checkData = await checkRes.json();
                var statusEl = document.getElementById('gsheet-status');
                if (statusEl) {
                    if (checkData.success) {
                        statusEl.innerHTML =
                            '<p style="margin:0 0 8px;color:#16a34a;font-weight:600;font-size:14px;">✅ Foglio accessibile</p>' +
                            '<p style="margin:0;font-size:13px;color:#374151;">📊 Righe lette: <strong>' + checkData.rowsRead + '</strong></p>' +
                            '<p style="margin:4px 0 0;font-size:13px;color:#374151;">🆕 Nuovi lead (anteprima): <strong>' + checkData.imported + '</strong> &nbsp;|&nbsp; 🔄 Da aggiornare: <strong>' + checkData.updated + '</strong></p>' +
                            (checkData.skipped > 0 ? '<p style="margin:4px 0 0;font-size:12px;color:#6b7280;">⏭️ Già presenti / senza email: ' + checkData.skipped + '</p>' : '') +
                            '<p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Clicca <strong>Importa</strong> per salvare nel database, oppure <strong>Test</strong> per un dry run dettagliato.</p>';
                    } else {
                        statusEl.innerHTML =
                            '<p style="margin:0 0 6px;color:#dc2626;font-weight:600;font-size:14px;">❌ Errore accesso foglio</p>' +
                            '<p style="margin:0;font-size:13px;color:#374151;">' + (checkData.error || 'Errore sconosciuto') + '</p>' +
                            '<p style="margin:8px 0 0;font-size:12px;color:#6b7280;">Assicurati che il foglio sia condiviso come "Chiunque con il link può visualizzare".</p>';
                        document.getElementById('gsheet-import-btn').disabled = true;
                    }
                }
            } catch (e) {
                var statusEl2 = document.getElementById('gsheet-status');
                if (statusEl2) statusEl2.innerHTML = '<p style="color:#dc2626;font-size:14px;">❌ Errore di rete: ' + e.message + '</p>';
            }
        }
        window.importFromExcel = importFromExcel;

        async function gsheetRunDry() {
            var statusEl = document.getElementById('gsheet-status');
            if (statusEl) statusEl.innerHTML = '<p style="color:#374151;font-size:14px;">🔍 Esecuzione dry run...</p>';
            document.getElementById('gsheet-dry-btn').disabled = true;
            try {
                var res = await fetch('/api/import/gsheet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dryRun: true })
                });
                var data = await res.json();
                if (statusEl) {
                    statusEl.innerHTML =
                        '<p style="margin:0 0 8px;font-weight:600;font-size:14px;color:#1d4ed8;">🔍 Dry Run completato</p>' +
                        '<p style="margin:0;font-size:13px;color:#374151;">📊 Righe lette: <strong>' + data.rowsRead + '</strong></p>' +
                        '<p style="margin:4px 0;font-size:13px;">🆕 Nuovi: <strong>' + data.imported + '</strong> &nbsp;|&nbsp; 🔄 Aggiornamenti: <strong>' + data.updated + '</strong> &nbsp;|&nbsp; ⏭️ Skip: <strong>' + data.skipped + '</strong></p>' +
                        (data.errors > 0 ? '<p style="margin:4px 0;font-size:13px;color:#dc2626;">❌ Errori: ' + data.errors + ' — ' + (data.errorDetails || []).slice(0, 3).join('; ') + '</p>' : '') +
                        '<p style="margin:8px 0 0;font-size:12px;color:#6b7280;font-style:italic;">Nessun dato è stato salvato. Clicca <strong>Importa</strong> per procedere.</p>';
                }
            } catch (e) {
                if (statusEl) statusEl.innerHTML = '<p style="color:#dc2626;font-size:14px;">❌ ' + e.message + '</p>';
            }
            document.getElementById('gsheet-dry-btn').disabled = false;
        }
        window.gsheetRunDry = gsheetRunDry;

        async function gsheetRunImport() {
            if (!confirm('Importare i lead dal foglio Google Sheets eCura?\\n\\nI lead già presenti nel DB saranno aggiornati solo nei campi vuoti.\\nNessun lead esistente sarà cancellato.')) return;
            var statusEl = document.getElementById('gsheet-status');
            if (statusEl) statusEl.innerHTML = '<p style="color:#374151;font-size:14px;">⏳ Import in corso...</p>';
            document.getElementById('gsheet-import-btn').disabled = true;
            document.getElementById('gsheet-dry-btn').disabled = true;
            try {
                var res = await fetch('/api/import/gsheet', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dryRun: false })
                });
                var data = await res.json();
                if (statusEl) {
                    if (data.success) {
                        statusEl.innerHTML =
                            '<p style="margin:0 0 8px;font-weight:700;font-size:15px;color:#16a34a;">✅ Import completato!</p>' +
                            '<p style="margin:0;font-size:13px;">🆕 Nuovi lead importati: <strong>' + data.imported + '</strong></p>' +
                            '<p style="margin:4px 0;font-size:13px;">🔄 Lead aggiornati: <strong>' + data.updated + '</strong></p>' +
                            '<p style="margin:4px 0;font-size:13px;">⏭️ Già presenti / skip: <strong>' + data.skipped + '</strong></p>' +
                            (data.errors > 0 ? '<p style="margin:4px 0;font-size:13px;color:#dc2626;">❌ Errori: ' + data.errors + '</p>' : '');
                        // Ricarica dati dashboard
                        setTimeout(function() {
                            if (typeof window.loadLeadsData === 'function') window.loadLeadsData();
                            else if (typeof window.loadAssistitiData === 'function') window.loadAssistitiData();
                        }, 800);
                    } else {
                        statusEl.innerHTML = '<p style="color:#dc2626;font-weight:600;">❌ Import fallito: ' + (data.error || 'Errore sconosciuto') + '</p>';
                    }
                }
            } catch (e) {
                if (statusEl) statusEl.innerHTML = '<p style="color:#dc2626;font-size:14px;">❌ ' + e.message + '</p>';
            }
            document.getElementById('gsheet-import-btn').disabled = false;
            document.getElementById('gsheet-dry-btn').disabled = false;
        }
        window.gsheetRunImport = gsheetRunImport;

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
                    
                    // ✅ Aggiorna statistiche canale eCura dopo import
                    if (typeof loadEcuraChannelStats === 'function') {
                        setTimeout(() => loadEcuraChannelStats(), 1500);
                    }
                } else {
                    const errMsg = result.error + (result.details ? '\\n\\nDettagli: ' + result.details : '');
                    alert('Errore import: ' + errMsg);
                }
            } catch (error) {
                alert('Errore di comunicazione: ' + error.message);
            }
        }
        window.importFromIrbema = importFromIrbema;

        function importFromAON() {
            alert('🔄 Import da AON\\n\\nFunzionalità in sviluppo.\\n\\nEndpoint: POST /api/import/aon\\n\\nQuesta funzionalità permetterà di importare lead dal partner AON.');
        }
        window.importFromAON = importFromAON;

        function importFromDoubleYou() {
            alert('🔄 Import da DoubleYou\\n\\nFunzionalità in sviluppo.\\n\\nEndpoint: POST /api/import/doubleyou\\n\\nQuesta funzionalità permetterà di importare lead dal partner DoubleYou.');
        }
        window.importFromDoubleYou = importFromDoubleYou;

        // 🗑️ CLEAN IMPORT: Cancella e reimporta i 129 lead dall'Excel

        // ========== NUOVO ASSISTITO ==========
        const NEW_PREZZI_ECURA = {
            'eCura FAMILY': { BASE: 390, AVANZATO: 690, rinnovo_BASE: 200, rinnovo_AVANZATO: 500 },
            'eCura PRO':    { BASE: 480, AVANZATO: 840, rinnovo_BASE: 240, rinnovo_AVANZATO: 600 },
            'eCura PREMIUM':{ BASE: 590, AVANZATO: 990, rinnovo_BASE: 300, rinnovo_AVANZATO: 750 }
        };
        function updateNewPrezzi() {
            const servizio = document.getElementById('newAssistitoServizio')?.value || 'eCura PRO';
            const piano    = document.getElementById('newAssistitoPiano')?.value    || 'AVANZATO';
            const prezzi   = NEW_PREZZI_ECURA[servizio] || NEW_PREZZI_ECURA['eCura PRO'];
            const prezzo   = prezzi[piano];
            const rinnovo  = prezzi['rinnovo_' + piano];
            const sel = document.getElementById('newAssistitoPiano');
            if (sel) {
                sel.options[0].text = 'BASE - \u20ac' + prezzi.BASE + '/anno';
                sel.options[1].text = 'AVANZATO - \u20ac' + prezzi.AVANZATO + '/anno';
            }
            const box = document.getElementById('newAssistitoPrezzoLabel');
            if (box) box.textContent = servizio + ' - ' + piano + ': EUR ' + prezzo + '/anno (rinnovo EUR ' + rinnovo + ')';
        }
        window.updateNewPrezzi = updateNewPrezzi;

        async function nuovoAssistito() {
            // Reset form
            const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
            setVal('newAssistitoNome', '');
            setVal('newAssistitoCognome', '');
            setVal('newAssistitoEmail', '');
            setVal('newAssistitoTelefono', '');
            setVal('newAssistitoIMEI', '');
            setVal('newAssistitoServizio', 'eCura PRO');
            setVal('newAssistitoPiano', 'AVANZATO');
            setTimeout(() => updateNewPrezzi(), 50);
            setVal('newAssistitoNomeCaregiver', '');
            setVal('newAssistitoCognomeCaregiver', '');
            setVal('newAssistitoParentela', '');
            setVal('newAssistitoLeadId', '');
            // Apri modal
            const modal = document.getElementById('newAssistitoModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        }
        window.nuovoAssistito = nuovoAssistito;

        async function saveNewAssistito() {
            const nome = document.getElementById('newAssistitoNome')?.value?.trim();
            const cognome = document.getElementById('newAssistitoCognome')?.value?.trim();
            const email = document.getElementById('newAssistitoEmail')?.value?.trim() || '';
            const telefono = document.getElementById('newAssistitoTelefono')?.value?.trim() || '';
            const imei = document.getElementById('newAssistitoIMEI')?.value?.trim() || '';
            const servizio = document.getElementById('newAssistitoServizio')?.value || 'eCura PRO';
            const piano = document.getElementById('newAssistitoPiano')?.value || 'AVANZATO';
            const nomeCaregiver = document.getElementById('newAssistitoNomeCaregiver')?.value?.trim() || '';
            const cognomeCaregiver = document.getElementById('newAssistitoCognomeCaregiver')?.value?.trim() || '';
            const parentela = document.getElementById('newAssistitoParentela')?.value?.trim() || '';
            const leadId = document.getElementById('newAssistitoLeadId')?.value?.trim() || '';

            if (!nome || !cognome) {
                alert('⚠️ Nome e Cognome sono obbligatori!');
                return;
            }

            try {
                const response = await fetch('/api/assistiti', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome, cognome,
                        nome_assistito: nome,
                        cognome_assistito: cognome,
                        email, telefono,
                        imei: imei || undefined,
                        servizio, piano,
                        nome_caregiver: nomeCaregiver,
                        cognome_caregiver: cognomeCaregiver,
                        parentela_caregiver: parentela,
                        lead_id: leadId || undefined,
                        status: 'ATTIVO'
                    })
                });
                const result = await response.json();
                if (result.success) {
                    alert('✅ Assistito ' + nome + ' ' + cognome + ' creato con successo!');
                    closeModal('newAssistitoModal');
                    loadDashboardData();
                } else {
                    alert('❌ Errore: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
            }
        }
        window.saveNewAssistito = saveNewAssistito;
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

    <!-- MODAL: NUOVO ASSISTITO -->
    <div id="newAssistitoModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-2xl max-w-3xl w-full mx-4 max-h-screen overflow-y-auto">
            <div class="gradient-bg text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                <h3 class="text-xl font-bold">👤 Nuovo Assistito</h3>
                <button onclick="closeModal('newAssistitoModal')" class="text-white hover:text-gray-200 text-2xl">&times;</button>
            </div>
            <div class="p-6">
                <h4 class="font-bold text-gray-700 mb-3 border-b pb-2">👤 Dati Assistito</h4>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input type="text" id="newAssistitoNome" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                        <input type="text" id="newAssistitoCognome" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" id="newAssistitoEmail" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                        <input type="tel" id="newAssistitoTelefono" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">IMEI Dispositivo</label>
                        <input type="text" id="newAssistitoIMEI" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="es. 868298060656916">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Servizio</label>
                        <select id="newAssistitoServizio" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" onchange="updateNewPrezzi()">
                            <option value="eCura FAMILY">eCura FAMILY (SiDLY CARE PRO)</option>
                            <option value="eCura PRO" selected>eCura PRO (SiDLY CARE PRO)</option>
                            <option value="eCura PREMIUM">eCura PREMIUM (SiDLY VITAL CARE)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Piano</label>
                        <select id="newAssistitoPiano" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" onchange="updateNewPrezzi()">
                            <option value="BASE">BASE - €480/anno</option>
                            <option value="AVANZATO" selected>AVANZATO - €840/anno</option>
                        </select>
                    </div>
                    <div class="col-span-2">
                        <div id="newAssistitoPrezzoBox" class="bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                            <span class="font-semibold text-green-800 text-sm" id="newAssistitoPrezzoLabel">💶 eCura PRO – AVANZATO: €840/anno (rinnovo €600)</span>
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Collega Lead (opzionale)</label>
                        <input type="text" id="newAssistitoLeadId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="es. LEAD-IRBEMA-00001">
                    </div>
                </div>
                <h4 class="font-bold text-gray-700 mb-3 border-b pb-2">👨‍👩‍👦 Dati Caregiver</h4>
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nome Caregiver</label>
                        <input type="text" id="newAssistitoNomeCaregiver" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cognome Caregiver</label>
                        <input type="text" id="newAssistitoCognomeCaregiver" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div class="col-span-2">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Parentela</label>
                        <input type="text" id="newAssistitoParentela" placeholder="es. Figlio, Figlia, Coniuge..." class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                </div>
                <div class="flex justify-end gap-3">
                    <button onclick="closeModal('newAssistitoModal')" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">Annulla</button>
                    <button onclick="saveNewAssistito()" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">✅ Crea Assistito</button>
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
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="eCura">
  <meta name="theme-color" content="#1d6ab9">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { font-family: 'Inter', sans-serif; }
        .gradient-bg { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .overflow-x-auto { overflow-x: auto; }
        table { min-width: 1400px; } /* Permette scroll orizzontale se necessario */
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

    <div class="container mx-auto px-2 sm:px-3 lg:px-4 xl:px-6 py-8" style="max-width: 98%;">
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
                <div id="channelsBreakdown" class="space-y-3">
                    <!-- Populated by JS -->
                </div>
            </div>
        </div>

        <!-- eCura Form: Fonti di Provenienza (Meta / Google / Altro) -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-bullhorn text-blue-500 mr-2"></i>
                    Form eCura — Fonti di Provenienza
                </h3>
                <div class="flex items-center gap-3">
                    <button id="btnLeadsSyncChannels" onclick="leadssSyncEcuraChannels()" class="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1">
                        <i class="fas fa-sync-alt"></i> Sincronizza canali
                    </button>
                    <span class="text-xs text-gray-400" id="leadsEcuraChannelUpdated">Caricamento...</span>
                </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4" id="leadsEcuraChannelGrid">
                <div class="text-center text-gray-400 text-sm col-span-4 py-4">
                    <i class="fas fa-spinner fa-spin mr-2"></i>Caricamento statistiche canale...
                </div>
            </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════
             STATISTICHE CODICI SCONTO PER CANALE / CODICE
        ═══════════════════════════════════════════════════════════════ -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div class="flex items-center justify-between mb-5">
                <h3 class="text-lg font-bold text-gray-800 flex items-center">
                    <i class="fas fa-tag text-orange-500 mr-2"></i>
                    Sconti Applicati — Riepilogo per Canale / Codice Sconto
                </h3>
                <span class="text-xs text-gray-400" id="discountStatsUpdated">Caricamento...</span>
            </div>

            <!-- KPI globali -->
            <div class="grid grid-cols-3 gap-4 mb-6" id="discountKpiGrid">
                <div class="text-center text-gray-400 text-sm col-span-3 py-2">
                    <i class="fas fa-spinner fa-spin mr-2"></i>Caricamento...
                </div>
            </div>

            <!-- Ripartizione per codice sconto -->
            <div id="discountByCodeTable" class="overflow-x-auto">
                <!-- Populated by JS -->
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
                    <!-- Filtro unificato Fonte/Canale: canali eCura + altre fonti, popolato dinamicamente -->
                    <select id="filterFonte" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="applyFilters()">
                        <option value="">Tutte le Fonti</option>
                        <!-- Popolato dinamicamente da loadLeadsData() -->
                    </select>
                    <!-- filterSorgente nascosto: mantenuto per compatibilità ma non più mostrato -->
                    <select id="filterSorgente" class="hidden" onchange="applyFilters()"><option value=""></option></select>
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
                        <option value="OC">OC - Operatore Commerciale</option>
                        <option value="RP">RP - Roberto Poggi</option>
                    </select>
                    <select id="filterStato" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" onchange="applyFilters()">
                        <option value="">Tutti gli Stati</option>
                        <option value="nuovo">🆕 Nuovo</option>
                        <option value="contattato">📞 Contattato</option>
                        <option value="interessato">✨ Interessato</option>
                        <option value="in_trattativa">💼 In Trattativa</option>
                        <option value="convertito">✅ Convertito</option>
                        <option value="perso">❌ Perso</option>
                        <option value="non_interessato">⛔ Non Interessato</option>
                        <option value="da_ricontattare">🔄 Da Ricontattare</option>
                        <option value="non_risponde">📵 Non Risponde</option>
                        <option value="numero_non_attivo">🚫 Numero Non Attivo</option>
                        <option value="inps">🏛️ INPS</option>
                        <option value="problemi_economici">💰 Problemi Economici</option>
                    </select>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full table-fixed">
                    <thead>
                        <tr class="border-b-2 border-gray-200 text-left">
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 2%;">#</th>
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 12%;">Cliente</th>
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 13%;">Contatti</th>
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 8%;">Servizio</th>
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 6%;">Piano</th>
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 5%;">Prezzo</th>
                            <!-- Nascoste: Brochure e Manuale non servono per ora -->
                            <!-- <th class="pb-3 text-xs font-semibold text-gray-600 text-center" style="width: 4%;">📄</th> -->
                            <!-- <th class="pb-3 text-xs font-semibold text-gray-600 text-center" style="width: 4%;">📖</th> -->
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 7%;">Data</th>
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 5%;">CM</th>
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 11%;">Stato</th>
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 23%;">Azioni</th>
                            <th class="pb-3 text-xs font-semibold text-gray-600" style="width: 8%;">CRUD</th>
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

        // ─── Persistenza filtri via localStorage ─────────────────────────────
        // Salva i filtri attivi ogni volta che cambiano
        function saveFilters() {
            const filters = {
                fonte:    document.getElementById('filterFonte')?.value || '',
                servizio: document.getElementById('filterServizio')?.value || '',
                piano:    document.getElementById('filterPiano')?.value || '',
                cm:       document.getElementById('filterCM')?.value || '',
                stato:    document.getElementById('filterStato')?.value || '',
                cognome:  document.getElementById('searchCognome')?.value || ''
            };
            localStorage.setItem('leadsFilters', JSON.stringify(filters));
        }

        // Ripristina i filtri salvati all'avvio / dopo loadLeadsData
        function restoreFilters() {
            try {
                const saved = JSON.parse(localStorage.getItem('leadsFilters') || '{}');
                if (saved.fonte    !== undefined) { const el = document.getElementById('filterFonte');    if (el) el.value = saved.fonte; }
                if (saved.servizio !== undefined) { const el = document.getElementById('filterServizio'); if (el) el.value = saved.servizio; }
                if (saved.piano    !== undefined) { const el = document.getElementById('filterPiano');    if (el) el.value = saved.piano; }
                if (saved.cm       !== undefined) { const el = document.getElementById('filterCM');       if (el) el.value = saved.cm; }
                if (saved.stato    !== undefined) { const el = document.getElementById('filterStato');    if (el) el.value = saved.stato; }
                if (saved.cognome  !== undefined) { const el = document.getElementById('searchCognome');  if (el) el.value = saved.cognome; }
            } catch(e) { /* ignora JSON malformato */ }
        }

        // Aggancia saveFilters a ogni cambiamento dei filtri
        document.addEventListener('DOMContentLoaded', () => {
            ['filterFonte','filterServizio','filterPiano','filterCM','filterStato'].forEach(id => {
                document.getElementById(id)?.addEventListener('change', saveFilters);
            });
            document.getElementById('searchCognome')?.addEventListener('input', saveFilters);
        });
        // ─────────────────────────────────────────────────────────────────────

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
                // ✅ Aggiungi timestamp per evitare cache del browser
                const cacheBuster = Date.now();
                const leadsResponse = await fetch(\`/api/leads?limit=99999&_=\${cacheBuster}\`);
                const leadsData = await leadsResponse.json();
                allLeads = leadsData.leads || [];
                
                // ✅ Popola filtro Fonte unificato: canali eCura + altre fonti dal DB
                try {
                    const fonteSelect = document.getElementById('filterFonte');
                    // Sezione 1: canali eCura (META/GOOGLE/DIRETTO/ALTRO) da canale_acquisizione
                    const canaleIcons = {
                        'META':    '📘 eCura — Meta (FB/IG)',
                        'GOOGLE':  '🔍 eCura — Google',
                        'DIRETTO': '🔗 eCura — Diretto',
                        'ALTRO':   '📎 eCura — Altro'
                    };
                    const canaliOrdinati = ['META', 'GOOGLE', 'DIRETTO', 'ALTRO'];
                    fonteSelect.innerHTML = '<option value="">Tutte le Fonti</option>';
                    // Aggiungi opzione "tutti i lead eCura" come gruppo
                    fonteSelect.innerHTML += '<option value="__ECURA_ALL__">— Form eCura (tutti i canali) —</option>';
                    canaliOrdinati.forEach(canale => {
                        const option = document.createElement('option');
                        option.value = '__CANALE__' + canale;  // prefisso per distinguere da fonte raw
                        option.textContent = canaleIcons[canale] || canale;
                        fonteSelect.appendChild(option);
                    });
                    // Sezione 2: altre fonti raw dal DB (non-eCura)
                    const fontiRaw = [...new Set(allLeads
                        .map(l => l.fonte || '')
                        .filter(f => f && f !== 'Form eCura' && !f.startsWith('Form eCura_'))
                    )].sort();
                    if (fontiRaw.length > 0) {
                        fonteSelect.innerHTML += '<option disabled>──────────────</option>';
                        fontiRaw.forEach(fonte => {
                            const option = document.createElement('option');
                            option.value = '__FONTE__' + fonte;  // prefisso per fonte raw
                            option.textContent = fonte;
                            fonteSelect.appendChild(option);
                        });
                    }
                    console.log('✅ Filtro Fonte unificato popolato:', canaliOrdinati.length, 'canali +', fontiRaw.length, 'fonti');
                } catch (error) {
                    console.error('⚠️ Errore popolamento filtro fonte:', error);
                }
                
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

                // Carica statistiche canale eCura Form (Meta / Google / Altro) — box numerici
                loadLeadsEcuraChannelStats();
                // Aggiorna barre canali (stessa API channel-stats → numeri identici ai box)
                updateChannelsBreakdown(allLeads);

                // Popola tabella — ripristina filtri salvati e riapplica
                // Fix: dopo ogni azione (email/WhatsApp/cambio stato) i filtri CM/Stato vengono mantenuti
                restoreFilters();
                applyFilters();

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

        async function updateChannelsBreakdown(leads) {
            console.log('🔍 updateChannelsBreakdown — usa API channel-stats per i canali eCura');

            const fonteColors = {
                'Sito www.eCura.it':    'bg-cyan-500',
                'Privati IRBEMA':       'bg-blue-500',
                'eCura — Meta (FB/IG)': 'bg-indigo-500',
                'eCura — Google':       'bg-red-500',
                'eCura — Diretto':      'bg-green-500',
                'eCura — Altro':        'bg-yellow-500',
                'eCura — Non tracciato':'bg-gray-400',
                'Form eCura x Test':    'bg-yellow-300',
                'B2B IRBEMA':           'bg-purple-500',
                'Sito web Medica GB':   'bg-pink-500',
                'NETWORKING':           'bg-teal-500',
                'Form Contattaci':      'bg-orange-400'
            };

            // Passo 1: canali eCura dall'API (stessa sorgente dei box → numeri identici)
            const sources = {};
            let discountByCanale = {};
            try {
                const res = await fetch('/api/leads/channel-stats');
                const data = await res.json();
                if (data.success) {
                    if (data.meta    > 0) sources['eCura — Meta (FB/IG)'] = data.meta;
                    if (data.google  > 0) sources['eCura — Google']       = data.google;
                    if (data.diretto > 0) sources['eCura — Diretto']      = data.diretto;
                    if (data.altro   > 0) sources['eCura — Altro']        = data.altro;
                    if (data.nonTracciato > 0) sources['eCura — Non tracciato'] = data.nonTracciato;
                    discountByCanale = data.discountByCanale || {};
                }
            } catch (e) {
                console.warn('⚠️ updateChannelsBreakdown: impossibile caricare channel-stats', e);
            }

            // Passo 2: fonti non-eCura da allLeads (IRBEMA, B2B, Test, ecc.)
            (leads || []).forEach(l => {
                const fonteDB = l.fonte || '';
                if (fonteDB === 'Form eCura' || fonteDB.startsWith('Form eCura_')) return;
                const etichetta = fonteDB || 'Non specificato';
                sources[etichetta] = (sources[etichetta] || 0) + 1;
            });

            console.log('📊 Canali rilevati (API + allLeads):', sources);

            const total = Object.values(sources).reduce((a, b) => a + b, 0) || 1;

            const html = Object.entries(sources)
                .sort(([,a], [,b]) => b - a)
                .map(([fonte, count]) => {
                    const percentage = Math.round((count / total) * 100);
                    const color = fonteColors[fonte] || 'bg-gray-500';
                    return \`
                        <div>
                            <div class="flex items-center justify-between mb-1">
                                <span class="text-sm font-medium">\${fonte}</span>
                                <span class="text-sm font-bold">\${count} (\${percentage}%)</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="\${color} h-2 rounded-full" style="width: \${percentage}%"></div>
                            </div>
                        </div>
                    \`;
                }).join('');

            const el = document.getElementById('channelsBreakdown');
            if (el) el.innerHTML = html || '<p class="text-gray-400 text-sm">Nessuna fonte disponibile</p>';
        }

        async function loadLeadsEcuraChannelStats() {
            try {
                const res = await fetch('/api/leads/channel-stats');
                const data = await res.json();
                if (!data.success) return;

                const { totalEcura, meta, google, diretto, altro, nonTracciato,
                        discountByCanale = {}, discountGlobal = {}, discountByCode = [] } = data;

                // ── 6 box canale con badge sconto ──────────────────────────
                const canaleMap = [
                    { label: 'Totale Form eCura',  value: totalEcura,   colorBg: '#EFF6FF', colorBorder: '#93C5FD', colorText: '#1D4ED8', icon: 'fa-file-alt' },
                    { label: 'Meta (FB/IG Ads)',   value: meta,         colorBg: '#EEF2FF', colorBorder: '#A5B4FC', colorText: '#4338CA', icon: 'fa-hashtag' },
                    { label: 'Google',             value: google,       colorBg: '#FEF2F2', colorBorder: '#FCA5A5', colorText: '#B91C1C', icon: 'fa-search' },
                    { label: 'Diretto',            value: diretto,      colorBg: '#F0FDF4', colorBorder: '#86EFAC', colorText: '#15803D', icon: 'fa-mouse-pointer' },
                    { label: 'Altro',              value: altro,        colorBg: '#FEFCE8', colorBorder: '#FDE68A', colorText: '#92400E', icon: 'fa-share-alt' },
                    { label: 'Non tracciato',      value: nonTracciato, colorBg: '#F9FAFB', colorBorder: '#D1D5DB', colorText: '#6B7280', icon: 'fa-minus-circle' },
                ];

                const html = canaleMap.map(b => \`
                    <div style="background:\${b.colorBg};border:2px solid \${b.colorBorder};color:\${b.colorText}"
                         class="flex flex-col items-center justify-center rounded-lg p-4 text-center">
                        <i class="fas \${b.icon} text-2xl mb-2 opacity-70"></i>
                        <span class="text-3xl font-extrabold">\${b.value}</span>
                        <span class="text-xs font-semibold mt-1">\${b.label}</span>
                    </div>
                \`).join('');

                const grid = document.getElementById('leadsEcuraChannelGrid');
                if (grid) {
                    grid.className = 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4';
                    grid.innerHTML = html;
                }

                // ── KPI globali sconto ─────────────────────────────────────
                const kpiGrid = document.getElementById('discountKpiGrid');
                if (kpiGrid) {
                    const totScontati = discountGlobal.leads || 0;
                    const totRisp     = (discountGlobal.risparmio || 0).toFixed(2);
                    const pctMedia    = (discountGlobal.pct_media || 0).toFixed(1);
                    kpiGrid.className = 'grid grid-cols-3 gap-4 mb-6';
                    kpiGrid.innerHTML = \`
                        <div style="background:#FFF7ED;border:2px solid #FED7AA;border-radius:12px;padding:16px;text-align:center;">
                            <div style="font-size:28px;font-weight:800;color:#c2410c;">\${totScontati}</div>
                            <div style="font-size:12px;font-weight:600;color:#9a3412;margin-top:4px;">Lead con sconto applicato</div>
                        </div>
                        <div style="background:#ECFDF5;border:2px solid #6EE7B7;border-radius:12px;padding:16px;text-align:center;">
                            <div style="font-size:28px;font-weight:800;color:#065f46;">€\${totRisp}</div>
                            <div style="font-size:12px;font-weight:600;color:#064e3b;margin-top:4px;">Totale risparmio concesso</div>
                        </div>
                        <div style="background:#EFF6FF;border:2px solid #93C5FD;border-radius:12px;padding:16px;text-align:center;">
                            <div style="font-size:28px;font-weight:800;color:#1d4ed8;">\${pctMedia}%</div>
                            <div style="font-size:12px;font-weight:600;color:#1e40af;margin-top:4px;">Sconto % medio applicato</div>
                        </div>
                    \`;
                }

                // ── Tabella per codice ─────────────────────────────────────
                const codeTableEl = document.getElementById('discountByCodeTable');
                if (codeTableEl) {
                    if (!discountByCode.length) {
                        codeTableEl.innerHTML = \`
                            <div style="padding:20px;text-align:center;color:#9ca3af;font-size:13px;">
                                <i class="fas fa-tag mr-2"></i>
                                Nessun codice sconto nel sistema — aggiungili dalla Dashboard principale → sezione "Codici Sconto"
                            </div>\`;
                    } else {
                        // Colori badge sorgente codice
                        const sorgenteBadge = (s) => ({
                            'CANALE':    '<span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">📡 CANALE</span>',
                            'FORM':      '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">📋 FORM</span>',
                            'MANUALE':   '<span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">✏️ MANUALE</span>',
                            'PROMOZIONE':'<span style="background:#fce7f3;color:#9d174d;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:600;">🎁 PROMO</span>',
                        }[s] || \`<span style="background:#f3f4f6;color:#374151;padding:2px 8px;border-radius:9999px;font-size:11px;">\${s||'—'}</span>\`);

                        // Calcola totali per riga totale
                        const totLeads    = discountByCode.reduce((s, r) => s + (Number(r.leads)||0), 0);
                        const totRisp     = discountByCode.reduce((s, r) => s + (Number(r.risparmio)||0), 0);
                        const codiciUsati = discountByCode.filter(r => (Number(r.leads)||0) > 0).length;

                        const righe = discountByCode.map(dc => {
                            const nLeads    = Number(dc.leads)    || 0;
                            const nRisp     = Number(dc.risparmio)|| 0;
                            const nPct      = Number(dc.pct_media)|| 0;
                            const valNom    = dc.tipo === 'PERCENTUALE'
                                ? \`\${dc.valore_nominale}%\`
                                : \`€\${Number(dc.valore_nominale||0).toFixed(2)}\`;
                            const attivoTag = dc.attivo
                                ? '<span style="background:#dcfce7;color:#166534;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:700;">✓ attivo</span>'
                                : '<span style="background:#fee2e2;color:#991b1b;padding:1px 6px;border-radius:9999px;font-size:10px;font-weight:700;">✗ inattivo</span>';
                            const rowBg = nLeads > 0 ? '' : 'background:#fafafa;';
                            return \`<tr style="\${rowBg}border-bottom:1px solid #f3f4f6;" onmouseover="this.style.background='#fff7ed'" onmouseout="this.style.background='\${nLeads>0?'':'#fafafa'}'">
                                <td style="padding:10px 12px;font-weight:700;color:#c2410c;font-family:monospace;font-size:13px;">\${dc.codice}</td>
                                <td style="padding:10px 12px;font-size:12px;color:#6b7280;">\${dc.descrizione||'—'}</td>
                                <td style="padding:10px 12px;text-align:center;">\${sorgenteBadge(dc.sorgente_codice)}</td>
                                <td style="padding:10px 12px;text-align:center;font-size:12px;color:#374151;">\${dc.tipo||'—'} &nbsp;<strong>\${valNom}</strong></td>
                                <td style="padding:10px 12px;text-align:center;">
                                    \${nLeads > 0
                                        ? \`<span style="background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;padding:3px 10px;border-radius:9999px;font-weight:700;font-size:13px;">\${nLeads}</span>\`
                                        : \`<span style="color:#d1d5db;font-size:12px;">0</span>\`
                                    }
                                </td>
                                <td style="padding:10px 12px;text-align:center;font-weight:600;color:\${nRisp>0?'#065f46':'#9ca3af'};font-size:13px;">
                                    \${nRisp > 0 ? \`€\${nRisp.toFixed(2)}\` : '<span style="color:#d1d5db;">—</span>'}
                                </td>
                                <td style="padding:10px 12px;text-align:center;font-size:13px;color:\${nPct>0?'#1d4ed8':'#9ca3af'};">
                                    \${nPct > 0 ? nPct.toFixed(1)+'%' : '<span style="color:#d1d5db;">—</span>'}
                                </td>
                                <td style="padding:10px 12px;text-align:center;">\${attivoTag}</td>
                            </tr>\`;
                        }).join('');

                        // Riga totale
                        const rigaTotale = \`
                            <tr style="background:#f8fafc;border-top:2px solid #e2e8f0;">
                                <td colspan="4" style="padding:10px 12px;font-weight:700;color:#374151;font-size:13px;">
                                    📊 TOTALE — \${discountByCode.length} codici (\${codiciUsati} con utilizzi)
                                </td>
                                <td style="padding:10px 12px;text-align:center;">
                                    <span style="background:#fff7ed;border:1px solid #fed7aa;color:#c2410c;padding:3px 10px;border-radius:9999px;font-weight:800;font-size:14px;">\${totLeads}</span>
                                </td>
                                <td style="padding:10px 12px;text-align:center;font-weight:800;color:#065f46;font-size:14px;">€\${totRisp.toFixed(2)}</td>
                                <td style="padding:10px 12px;text-align:center;color:#6b7280;font-size:12px;">
                                    \${totLeads > 0 ? (totRisp / totLeads).toFixed(2) + ' €/lead medio' : '—'}
                                </td>
                                <td></td>
                            </tr>\`;

                        codeTableEl.innerHTML = \`
                            <table style="width:100%;border-collapse:collapse;font-size:13px;">
                                <thead>
                                    <tr style="background:#f9fafb;border-bottom:2px solid #e5e7eb;">
                                        <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Codice</th>
                                        <th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Descrizione</th>
                                        <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Sorgente</th>
                                        <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Tipo · Valore</th>
                                        <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Lead scontati</th>
                                        <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Risparmio €</th>
                                        <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">% media</th>
                                        <th style="padding:8px 12px;text-align:center;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Stato</th>
                                    </tr>
                                </thead>
                                <tbody>\${righe}</tbody>
                                <tfoot>\${rigaTotale}</tfoot>
                            </table>
                        \`;
                    }
                }

                const upd = document.getElementById('leadsEcuraChannelUpdated');
                if (upd) upd.textContent = 'Aggiornato: ' + new Date().toLocaleTimeString('it-IT');
                const updDisc = document.getElementById('discountStatsUpdated');
                if (updDisc) updDisc.textContent = 'Aggiornato: ' + new Date().toLocaleTimeString('it-IT');
            } catch (err) {
                console.warn('⚠️ loadLeadsEcuraChannelStats error:', err);
            }
        }

        // ✅ Esponi globalmente per auto-import script e trigger esterni
        window.loadLeadsEcuraChannelStats = loadLeadsEcuraChannelStats;

        async function leadssSyncEcuraChannels() {
            const btn = document.getElementById('btnLeadsSyncChannels');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizzazione...';
            }
            try {
                const res = await fetch('/api/leads/sync-ecura-channels', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}) // server calcola giorni da inizio campagna 30/01/2026
                });
                const data = await res.json();
                if (data.success) {
                    await loadLeadsEcuraChannelStats();
                    const fromDate = data.from ? new Date(data.from).toLocaleDateString('it-IT') : '30/01/2026';
                    const msg = \`✅ Sincronizzazione completata!\\n\\nFinestra: dal \${fromDate} ad oggi (\${data.days} giorni)\\nContatti HubSpot trovati: \${data.hubspotContacts}\\nNuovi importati: \${data.imported}\\nAggiornati con canale: \${data.updated}\\nGià aggiornati / skip: \${data.skipped}\`;
                    alert(msg);
                } else {
                    alert('❌ Errore: ' + (data.error || 'Errore sconosciuto'));
                }
            } catch (err) {
                alert('❌ Errore di comunicazione: ' + err.message);
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizza canali';
                }
            }
        }
        window.leadssSyncEcuraChannels = leadssSyncEcuraChannels;

        function renderLeadsTable(leads) {
            console.log('🔧 renderLeadsTable v2026-02-14-01:30 - SORT DESC + cache-buster');
            const tbody = document.getElementById('leadsTableBody');
            
            if (leads.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="13" class="py-8 text-center text-gray-400">Nessun lead trovato</td>
                    </tr>
                \`;
                return;
            }

            // ✅ ORDINA PER DATA CREAZIONE DESC (più recenti prima)
            const sortedLeads = [...leads].sort((a, b) => {
                const dateA = new Date(a.created_at || a.timestamp || 0);
                const dateB = new Date(b.created_at || b.timestamp || 0);
                return dateB - dateA; // DESC
            });

            tbody.innerHTML = sortedLeads.map((lead, index) => {
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

                // ─── SCONTO ────────────────────────────────────────────────
                const hasSconto = lead.codice_sconto && (lead.sconto_percentuale > 0 || lead.sconto_fisso > 0);
                const prezzoScontato = lead.prezzo_scontato;
                const scontoPerc = lead.sconto_percentuale || 0;
                const scontoFisso = lead.sconto_fisso || 0;
                const scontoLabel = scontoPerc > 0
                    ? \`-\${scontoPerc}%\`
                    : (scontoFisso > 0 ? \`-€\${scontoFisso}\` : '');

                // ─── RATEIZZAZIONE ─────────────────────────────────────────
                const isRateizzato  = Boolean(lead.rateizzazione_attiva);
                const isSaldato     = Boolean(lead.rateizzazione_saldo);
                const hasRiserva    = Boolean(lead.riserva_dominio);
                const rateBadge     = isRateizzato
                    ? (isSaldato
                        ? \`<span style="display:inline-block;margin-top:3px;font-size:10px;background:#dcfce7;color:#166534;padding:1px 5px;border-radius:9999px;font-weight:600;">✅ Saldato</span>\`
                        : \`<span style="display:inline-block;margin-top:3px;font-size:10px;background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:9999px;font-weight:600;">📅 Rateizzato\${hasRiserva ? ' 🔒' : ''}</span>\`)
                    : '';

                const prezzoCellHtml = hasSconto
                    ? \`<div class="line-through text-gray-400 text-xs">€\${prezzo}</div>
                       <div class="font-bold text-orange-600">€\${prezzoScontato}</div>
                       <span class="px-1 py-0.5 bg-orange-100 text-orange-700 text-xs rounded font-semibold">\${scontoLabel} \${escapeHtml(lead.codice_sconto || '')}</span>\${rateBadge}\`
                    : \`<span class="font-bold text-green-600">€\${prezzo}</span>\${rateBadge}\`;
                
                return \`
                    <tr class="border-b border-gray-100 hover:bg-gray-50" title="ID: \${escapeHtml(lead.id)}">
                        <td class="py-2 text-xs text-gray-600 font-medium">\${leads.length - index}</td>
                        <td class="py-2 text-xs truncate" title="\${(lead.nomeRichiedente && lead.cognomeRichiedente) ? escapeHtml(lead.nomeRichiedente + ' ' + lead.cognomeRichiedente) : escapeHtml(lead.email || '')}">
                            <div class="font-medium truncate">\${(lead.nomeRichiedente && lead.cognomeRichiedente) ? escapeHtml(lead.nomeRichiedente + ' ' + lead.cognomeRichiedente) : escapeHtml(lead.email || 'N/A')}</div>
                        </td>
                        <td class="py-2 text-xs overflow-hidden">
                            <div class="text-xs text-gray-600 truncate" title="\${escapeHtml(lead.email || '')}">
                                <i class="fas fa-envelope text-gray-400 mr-1"></i>\${escapeHtml(lead.email || '') || '-'}
                            </div>
                            <div class="text-xs text-gray-600 mt-1 truncate">
                                <i class="fas fa-phone text-gray-400 mr-1"></i><a href="tel:\${escapeHtml(lead.telefono || '')}" class="hover:text-blue-600 hover:underline">\${escapeHtml(lead.telefono || '') || '-'}</a>
                            </div>
                        </td>
                        <td class="py-2 text-xs">
                            <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                \${servizio}
                            </span>
                        </td>
                        <td class="py-2 text-xs">
                            <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                \${piano}
                            </span>
                        </td>
                        <td class="py-2 text-xs">\${prezzoCellHtml}</td>
                        <!-- Nascoste: celle Contratto e Brochure -->
                        <!-- <td class="py-2 text-center text-xs">
                            <i class="fas fa-\${hasContract ? 'check-circle text-green-500' : 'times-circle text-gray-300'}"></i>
                        </td>
                        <td class="py-2 text-center text-xs">
                            <i class="fas fa-\${lead.vuoleBrochure === 'Si' ? 'check-circle text-green-500' : 'times-circle text-gray-300'}"></i>
                        </td> -->
                        <td class="py-2 text-xs text-gray-500">\${date}</td>
                        <td class="py-2 text-xs">
                            <select 
                                data-lead-id="\${lead.id}"
                                class="cm-select text-xs px-1 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500 \${lead.cm ? 'bg-blue-50 font-medium' : 'bg-white'}"
                                style="min-width: 80px;">
                                <option value="" \${!lead.cm ? 'selected' : ''}>nessuno</option>
                                <option value="SR" \${lead.cm === 'SR' ? 'selected' : ''}>SR</option>
                                <option value="OC" \${lead.cm === 'OC' ? 'selected' : ''}>OC</option>
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
                                <option value="non_risponde" \${lead.stato === 'non_risponde' ? 'selected' : ''} class="bg-orange-50">📵 Non Risponde</option>
                                <option value="numero_non_attivo" \${lead.stato === 'numero_non_attivo' ? 'selected' : ''} class="bg-red-100">🚫 Numero Non Attivo</option>
                                <option value="inps" \${lead.stato === 'inps' ? 'selected' : ''} class="bg-purple-50">🏛️ INPS</option>
                                <option value="problemi_economici" \${lead.stato === 'problemi_economici' ? 'selected' : ''} class="bg-pink-50">💰 Problemi Economici</option>
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
                                    title="Invia Brochure via Email">
                                    <i class="fas fa-book"></i>
                                </button>
                                <button 
                                    data-action="whatsapp"
                                    data-lead-id="\${lead.id}"
                                    data-telefono="\${lead.telefono || ''}"
                                    data-nome="\${(lead.nomeRichiedente || '').replace(/"/g, '')}"
                                    data-servizio="\${(lead.servizio || 'eCura').replace(/"/g, '')}"
                                    data-piano="\${(lead.piano || '').replace(/"/g, '')}"
                                    class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors action-btn"
                                    title="Invia WhatsApp con Brochure">
                                    <i class="fab fa-whatsapp"></i>
                                </button>
                                <button 
                                    data-action="completion"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600 transition-colors action-btn"
                                    title="Richiedi Completamento">
                                    <i class="fas fa-paper-plane"></i>
                                </button>
                                <button 
                                    data-action="manual-sign"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors action-btn"
                                    title="Firma Manuale">
                                    🖊️
                                </button>
                                <button 
                                    data-action="send-proforma"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition-colors action-btn"
                                    title="Invia Proforma">
                                    💰
                                </button>
                                <button 
                                    data-action="manual-payment"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors action-btn"
                                    title="Pagamento OK">
                                    ✅
                                </button>
                                <button 
                                    data-action="send-configuration"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition-colors action-btn"
                                    title="Form Configurazione">
                                    ⚙️
                                </button>
                                <button 
                                    data-action="send-benvenuto"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 transition-colors action-btn"
                                    title="Invia Email Benvenuto">
                                    🎉
                                </button>
                                <button 
                                    data-action="genera-ddt"
                                    data-lead-id="\${lead.id}"
                                    class="px-2 py-1 bg-gray-700 text-white text-xs rounded hover:bg-gray-800 transition-colors action-btn"
                                    title="Genera DDT + Dispositivo + Assistito">
                                    📦
                                </button>
                                <button 
                                    data-action="apply-discount"
                                    data-lead-id="\${lead.id}"
                                    data-codice-sconto="\${escapeHtml(lead.codice_sconto || '')}"
                                    class="px-2 py-1 \${hasSconto ? 'bg-orange-500 hover:bg-orange-600' : 'bg-yellow-400 hover:bg-yellow-500'} text-white text-xs rounded transition-colors action-btn"
                                    title="\${hasSconto ? 'Sconto: ' + escapeHtml(lead.codice_sconto || '') + ' — clicca per rimuovere o cambiare' : 'Applica Sconto'}">
                                    🏷️
                                </button>
                                <button
                                    data-action="rateizzazione"
                                    data-lead-id="\${lead.id}"
                                    data-nome="\${escapeHtml((lead.nomeRichiedente||'') + ' ' + (lead.cognomeRichiedente||''))}"
                                    data-prezzo="\${lead.prezzo_scontato || lead.prezzo_anno || 0}"
                                    data-rateizzato="\${isRateizzato ? '1' : '0'}"
                                    class="px-2 py-1 \${isRateizzato ? (isSaldato ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700') : 'bg-indigo-500 hover:bg-indigo-600'} text-white text-xs rounded transition-colors action-btn"
                                    title="\${isRateizzato ? (isSaldato ? 'Saldato — clicca per gestire' : 'Rateizzato — clicca per gestire') : 'Imposta Rateizzazione'}">
                                    📅
                                </button>

                            </div>
                        </td>
                        <td class="py-3 pl-3">
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
                        else if (action === 'whatsapp') sendWhatsApp(this);
                        else if (action === 'completion') requestCompletion(leadId);
                        else if (action === 'manual-sign') manualSign(leadId);
                        else if (action === 'send-proforma') sendProforma(leadId);
                        else if (action === 'manual-payment') manualPayment(leadId);
                        else if (action === 'send-configuration') sendConfiguration(leadId);
                        else if (action === 'send-benvenuto') sendBenvenuto(leadId);
                        else if (action === 'genera-ddt') generaDDT(leadId);
                        else if (action === 'apply-discount') applyDiscount(leadId, this.getAttribute('data-codice-sconto'));
                        else if (action === 'rateizzazione') openRateizzazioneModal(leadId, this.getAttribute('data-nome'), parseFloat(this.getAttribute('data-prezzo') || '0'), this.getAttribute('data-rateizzato') === '1');
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
            saveFilters(); // persiste i filtri correnti in localStorage
            const fonteFilter = document.getElementById('filterFonte').value; // es. '__CANALE__META' | '__ECURA_ALL__' | '__FONTE__Privati IRBEMA' | ''
            const sorgenteFilter = ''; // dismesso: non più usato
            const servizioFilter = document.getElementById('filterServizio').value;
            const pianoFilter = document.getElementById('filterPiano').value;
            const cmFilter = document.getElementById('filterCM').value;
            const statoFilter = document.getElementById('filterStato').value;
            const searchCognome = document.getElementById('searchCognome').value.toLowerCase().trim();

            const filtered = allLeads.filter(lead => {
                // ═══════════════════════════════════════════════════════════
                // FILTRO UNIFICATO FONTE/CANALE
                // Usa canale_acquisizione come fonte di verità per i lead eCura.
                // Per le altre fonti usa lead.fonte.
                //
                // Valori possibili di fonteFilter:
                //   ''                  → tutti i lead (nessun filtro)
                //   '__ECURA_ALL__'     → tutti i lead Form eCura (qualunque canale)
                //   '__CANALE__META'    → lead eCura con canale_acquisizione = 'META'
                //   '__CANALE__GOOGLE'  → lead eCura con canale_acquisizione = 'GOOGLE'
                //   '__CANALE__DIRETTO' → lead eCura con canale_acquisizione = 'DIRETTO'
                //   '__CANALE__ALTRO'   → lead eCura con canale_acquisizione = 'ALTRO'
                //   '__FONTE__Privati IRBEMA' → lead con fonte = 'Privati IRBEMA'
                //   '__FONTE__Form eCura x Test' → lead di test
                // ═══════════════════════════════════════════════════════════
                const leadFonte = lead.fonte || '';
                const leadCanale = lead.canale_acquisizione || ''; // META/GOOGLE/DIRETTO/ALTRO
                const isEcura = leadFonte === 'Form eCura' || leadFonte.startsWith('Form eCura_');

                let matchFonte = true;
                if (!fonteFilter) {
                    matchFonte = true; // nessun filtro
                } else if (fonteFilter === '__ECURA_ALL__') {
                    // Tutti i lead Form eCura (qualunque canale, esclusi i test)
                    matchFonte = isEcura;
                } else if (fonteFilter.startsWith('__CANALE__')) {
                    // Filtra per canale_acquisizione (META/GOOGLE/DIRETTO/ALTRO)
                    // VINCOLO: solo lead Form eCura (fonte = 'Form eCura')
                    // Senza questo vincolo i lead IRBEMA con canale popolato verrebbero contati
                    const canaleTarget = fonteFilter.replace('__CANALE__', '');
                    matchFonte = isEcura && leadCanale === canaleTarget;
                } else if (fonteFilter.startsWith('__FONTE__')) {
                    // Filtra per fonte raw (IRBEMA, B2B, Test, ecc.)
                    const fonteTarget = fonteFilter.replace('__FONTE__', '');
                    matchFonte = leadFonte === fonteTarget;
                }

                const matchSorgente = true; // dismesso, sempre true
                
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
                
                // Filtro Stato: confronta con il campo stato del lead
                const leadStato = (lead.stato || '').toLowerCase();
                const matchStato = !statoFilter || leadStato === statoFilter.toLowerCase();
                
                // Filtro cognome: cerca in cognomeRichiedente o cognomeAssistito
                const cognomeRichiedente = (lead.cognomeRichiedente || '').toLowerCase();
                const cognomeAssistito = (lead.cognomeAssistito || '').toLowerCase();
                const matchCognome = !searchCognome || 
                    cognomeRichiedente.includes(searchCognome) || 
                    cognomeAssistito.includes(searchCognome);
                
                return matchFonte && matchServizio && matchPiano && matchCM && matchStato && matchCognome;
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
            if (!confirm('Generare e inviare contratto ' + (piano || 'BASE') + ' al lead?')) {
                return;
            }
            
            console.log('📄 Invio contratto - leadId:', leadId, 'piano:', piano);
            
            try {
                const response = await fetch('/api/leads/' + leadId + '/send-contract', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipoContratto: piano || 'BASE' })
                });
                
                const result = await response.json();
                
                console.log('📄 Risposta invio contratto:', result);
                
                if (result.success) {
                    alert('✅ Contratto inviato con successo!\\n\\nCodice: ' + (result.contractCode || 'N/A') + '\\nTemplate: email_invio_contratto');
                    loadLeadsData(); // Ricarica i dati
                } else {
                    alert('❌ Errore: ' + (result.error || 'Errore sconosciuto') + (result.details ? '\\n\\nDettagli: ' + result.details : ''));
                }
            } catch (error) {
                console.error('❌ Errore invio contratto:', error);
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }

        function sendWhatsApp(btn) {
            var telefono = btn.getAttribute('data-telefono') || '';
            var nome = btn.getAttribute('data-nome') || 'Cliente';
            var servizio = btn.getAttribute('data-servizio') || 'eCura';
            var piano = btn.getAttribute('data-piano') || '';
            if (!telefono) {
                alert('Numero di telefono non disponibile per questo lead.');
                return;
            }
            var numero = telefono.split(' ').join('').split('-').join('').split('(').join('').split(')').join('').split('.').join('');
            if (numero.charAt(0) !== '+') { numero = '39' + numero; }
            else { numero = numero.substring(1); }
            var brochureUrl = 'https://telemedcare-v12.pages.dev/assets/brochures/brochure-ecura.pdf';
            var pianoStr = piano ? ' - ' + piano : '';
            var nl = String.fromCharCode(10);
            var testo = 'Gentile ' + nome + ',' + nl + nl + 'Grazie per il suo interesse in ' + servizio + pianoStr + '.' + nl + nl + 'In allegato la brochure eCura:' + nl + brochureUrl + nl + nl + 'Siamo a sua disposizione per una consulenza gratuita, ci mandi le sue disponibilità' + nl + nl + 'Cordiali saluti,' + nl + 'Team eCura';
            window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(testo), '_blank');
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
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Email di completamento inviata con successo!\\nLink: ' + (result.token?.completionUrl || result.completionUrl) + '\\nScadenza: ' + (result.token?.expiresAt || result.expiresAt));
                    loadLeadsData(); // Ricarica i dati
                } else {
                    // Gestisci caso lead già completo
                    if (result.error && result.error.includes('già completo')) {
                        alert('ℹ️ Tutti i dati del lead sono già completi.\\n\\nNon è necessario inviare una email di richiesta completamento.');
                    } else {
                        alert('❌ Errore: ' + result.error);
                    }
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }

        // ============================================
        // NUOVE FUNZIONI AZIONI MANUALI
        // ============================================

        async function manualSign(leadId) {
            if (!confirm('🖊️ Firmare manualmente il contratto per questo lead?\\n\\nVerrà generata una proforma automaticamente.')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/manual-sign\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Contratto firmato manualmente!\\n\\nCodice: ' + (result.contractId || 'N/A') + '\\nProforma: ' + (result.proformaId || 'N/A'));
                    loadLeadsData();
                } else {
                    alert('❌ Errore: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }

        async function sendProforma(leadId) {
            if (!confirm('💰 Inviare proforma al lead?')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/send-proforma\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Proforma inviata con successo!\\n\\nServizio: ' + (result.servizio || 'N/A') + '\\nPiano: ' + (result.piano || 'N/A') + '\\nNumero: ' + (result.proformaId || 'N/A') + '\\nImporto: €' + (result.importo || 'N/A'));
                    loadLeadsData();
                } else {
                    alert('❌ Errore: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }

        async function manualPayment(leadId) {
            if (!confirm('✅ Confermare pagamento per questo lead?\\n\\nVerrà inviata la email con il form di configurazione.')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/manual-payment\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Pagamento confermato!\\n\\nEmail di configurazione inviata al cliente: ' + (result.email || 'N/A'));
                    loadLeadsData();
                } else {
                    alert('❌ Errore: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }

        async function sendConfiguration(leadId) {
            if (!confirm('⚙️ Inviare email con form di configurazione al lead?')) {
                return;
            }
            
            try {
                const response = await fetch(\`/api/leads/\${leadId}/send-configuration\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Email configurazione inviata!\\n\\nLink configurazione: ' + (result.configUrl || 'N/A'));
                    loadLeadsData();
                } else {
                    alert('❌ Errore: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                alert('❌ Errore di comunicazione: ' + error.message);
            }
        }

        async function sendBenvenuto(leadId) {
            if (!confirm('Inviare email di BENVENUTO al cliente? Verra inviata con importo IVA corretto e dispositivo aggiornato.')) return;
            try {
                const response = await fetch('/api/leads/' + leadId + '/send-benvenuto', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const result = await response.json();
                if (result.success) {
                    alert('OK - Email benvenuto inviata!');
                    loadLeadsData();
                } else {
                    alert('ERRORE: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                alert('ERRORE di comunicazione: ' + error.message);
            }
        }

        async function generaDDT(leadId) {
            // Prima prova senza IMEI: se DDT esiste già il backend lo prende dal DB
            // e crea solo l'assistito mancante senza chiedere nulla
            try {
                const r1 = await fetch('/api/leads/' + leadId + '/genera-ddt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({})
                });
                const res1 = await r1.json();

                // Caso normale: DDT esistente, assistito creato senza domande
                if (res1.success) {
                    alert('OK - ' + res1.message +
                        ' | DDT: ' + (res1.ddt&&res1.ddt.numero) +
                        ' | IMEI: ' + (res1.ddt&&res1.ddt.imei) +
                        ' | Assistito: ' + (res1.assistito&&res1.assistito.nome) +
                        ' | Vai su /dashboard e premi Ricarica per vedere il nuovo assistito nella tabella.');
                    loadLeadsData();
                    return;
                }

                // DDT non esiste ancora: serve IMEI per crearlo
                if (res1.needsImei) {
                    const imei = prompt('Nessun DDT trovato per questo lead.\\nInserisci IMEI del dispositivo:');
                    if (!imei || !imei.trim()) return;
                    const telefonoSim = prompt('Numero SIM (Invio per saltare):') || '';
                    const numeroDdt = prompt('Numero DDT (vuoto = auto-incremento):') || '';
                    const dataConsegna = prompt('Data consegna (YYYY-MM-DD, vuoto = oggi):') || '';
                    const note = prompt('Note (opzionale):') || '';
                    if (!confirm('Confermi creazione DDT + Dispositivo + Assistito?' +
                        '\\nIMEI: ' + imei.trim() +
                        '\\nSIM: ' + (telefonoSim||'-') +
                        '\\nN.DDT: ' + (numeroDdt||'auto') +
                        '\\nData: ' + (dataConsegna||'oggi'))) return;

                    const r2 = await fetch('/api/leads/' + leadId + '/genera-ddt', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ imei: imei.trim(), telefonoSim, numeroDdt, dataConsegna, note })
                    });
                    const res2 = await r2.json();
                    if (res2.success) {
                        alert('OK - ' + res2.message +
                            ' | DDT: ' + (res2.ddt&&res2.ddt.numero) +
                            ' | IMEI: ' + (res2.ddt&&res2.ddt.imei) +
                            ' | Assistito: ' + (res2.assistito&&res2.assistito.nome) +
                            ' | Vai su /dashboard e premi Ricarica per vedere il nuovo assistito nella tabella.');
                        loadLeadsData();
                    } else {
                        alert('ERRORE: ' + (res2.error || 'Errore sconosciuto'));
                    }
                    return;
                }

                // Altro errore
                alert('ERRORE: ' + (res1.error || 'Errore sconosciuto'));
            } catch (error) {
                alert('ERRORE di comunicazione: ' + error.message);
            }
        }

        // ============================================
        // DISCOUNT FUNCTIONS
        // ============================================

        async function applyDiscount(leadId, currentCodice) {
            // Se ha già uno sconto, chiedi se rimuovere o cambiare
            if (currentCodice && currentCodice.trim() !== '') {
                const choice = prompt(
                    '🏷️ Sconto attivo: ' + currentCodice + '\\n\\n' +
                    'Opzioni:\\n' +
                    '• Premi OK con campo vuoto per RIMUOVERE lo sconto\\n' +
                    '• Inserisci un nuovo codice per SOSTITUIRE lo sconto\\n' +
                    '• Annulla per non fare nulla',
                    currentCodice
                );
                if (choice === null) return; // Annullato
                if (choice.trim() === '') {
                    // Rimuovi sconto
                    if (!confirm('Confermi rimozione sconto ' + currentCodice + ' dal lead ' + leadId + '?')) return;
                    try {
                        const r = await fetch('/api/leads/' + leadId + '/apply-discount', {
                            method: 'DELETE',
                            credentials: 'include'
                        });
                        const res = await r.json();
                        if (res.success) {
                            alert('✅ Sconto rimosso.');
                            loadLeadsData();
                        } else {
                            alert('❌ Errore: ' + (res.error || 'Errore sconosciuto'));
                        }
                    } catch (err) {
                        alert('❌ Errore di comunicazione: ' + err.message);
                    }
                    return;
                }
                // Applica nuovo codice (sostituisce il vecchio)
                await _doApplyDiscount(leadId, choice.trim().toUpperCase());
            } else {
                // Nessuno sconto attivo: chiedi codice
                const codice = prompt(
                    '🏷️ Inserisci codice sconto da applicare al lead:\\n' + leadId + '\\n\\n' +
                    'Esempi: AON2026, DOUBLEYOU2026\\n' +
                    '(oppure qualsiasi codice attivo nel sistema)'
                );
                if (!codice || !codice.trim()) return;
                await _doApplyDiscount(leadId, codice.trim().toUpperCase());
            }
        }

        async function _doApplyDiscount(leadId, codice) {
            try {
                const r = await fetch('/api/leads/' + leadId + '/apply-discount', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ codice, applicato_da: 'operatore' })
                });
                const res = await r.json();
                if (res.success) {
                    alert('✅ ' + res.message);
                    loadLeadsData();
                } else {
                    alert('❌ Errore sconto: ' + (res.error || res.message || 'Codice non valido o non trovato'));
                }
            } catch (err) {
                alert('❌ Errore di comunicazione: ' + err.message);
            }
        }

        // ════════════════════════════════════════════════════════════════════
        // RATEIZZAZIONE — Modal + JS
        // ════════════════════════════════════════════════════════════════════

        // Inietta il modal nel DOM (una volta sola)
        (function injectRateizzazioneModal() {
            if (document.getElementById('rateizzazioneModal')) return;
            const html = \`
            <div id="rateizzazioneModal" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9999;align-items:center;justify-content:center;">
              <div style="background:#fff;border-radius:16px;padding:28px 32px;max-width:640px;width:94%;max-height:90vh;overflow-y:auto;box-shadow:0 8px 40px rgba(0,0,0,.18);">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                  <h2 style="font-size:18px;font-weight:700;color:#1f2937;margin:0;">📅 Rateizzazione pagamento</h2>
                  <button onclick="closeRateizzazioneModal()" style="background:none;border:none;font-size:22px;cursor:pointer;color:#6b7280;">×</button>
                </div>
                <div id="rateizzazioneLeadInfo" style="font-size:13px;color:#4b5563;margin-bottom:16px;"></div>

                <!-- Sezione esistente (visualizzazione rate) -->
                <div id="rateizzazioneExisting" style="display:none;margin-bottom:16px;"></div>

                <!-- Sezione configurazione nuove rate -->
                <div id="rateizzazioneForm">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                    <div>
                      <label style="font-size:12px;font-weight:600;color:#374151;">Numero di rate *</label>
                      <input type="number" id="rateNum" min="2" max="12" value="2"
                             oninput="generaRigheRate()"
                             style="width:100%;margin-top:4px;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;">
                    </div>
                    <div>
                      <label style="font-size:12px;font-weight:600;color:#374151;">Intervallo tra rate (mesi)</label>
                      <input type="number" id="rateIntervallo" min="1" max="12" value="1"
                             oninput="generaRigheRate()"
                             style="width:100%;margin-top:4px;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;">
                    </div>
                  </div>

                  <!-- Tabella rate generata dinamicamente -->
                  <div style="overflow-x:auto;margin-bottom:16px;">
                    <table style="width:100%;border-collapse:collapse;font-size:13px;" id="rateTable">
                      <thead>
                        <tr style="background:#f9fafb;color:#6b7280;font-size:11px;text-transform:uppercase;">
                          <th style="padding:8px 10px;text-align:left;">Rata</th>
                          <th style="padding:8px 10px;text-align:left;">Importo (€)</th>
                          <th style="padding:8px 10px;text-align:left;">Scadenza</th>
                          <th style="padding:8px 10px;text-align:left;">Note</th>
                        </tr>
                      </thead>
                      <tbody id="rateTableBody"></tbody>
                    </table>
                  </div>
                  <div id="rateTotaleInfo" style="font-size:12px;color:#6b7280;margin-bottom:16px;"></div>

                  <!-- Clausola Riserva di Dominio -->
                  <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:10px;padding:14px;margin-bottom:16px;">
                    <div style="display:flex;align-items:flex-start;gap:10px;">
                      <input type="checkbox" id="riservaCheckbox" checked style="margin-top:2px;width:16px;height:16px;accent-color:#f97316;">
                      <div>
                        <div style="font-size:13px;font-weight:700;color:#c2410c;">🔒 Clausola Riserva di Dominio</div>
                        <div style="font-size:11px;color:#92400e;margin-top:4px;line-height:1.5;">
                          La proprietà del dispositivo resterà di Medica GB S.r.l. fino al completo pagamento dell'ultima rata.
                          La clausola verrà inserita automaticamente nel contratto e nella fattura proforma.
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Note rateizzazione -->
                  <div style="margin-bottom:20px;">
                    <label style="font-size:12px;font-weight:600;color:#374151;">Note interne (opzionale)</label>
                    <textarea id="rateizzazioneNoteInput" rows="2" placeholder="Motivazione della rateizzazione..."
                              style="width:100%;margin-top:4px;padding:8px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;resize:vertical;"></textarea>
                  </div>
                </div>

                <!-- Footer pulsanti -->
                <div style="display:flex;gap:10px;justify-content:flex-end;border-top:1px solid #e5e7eb;padding-top:16px;">
                  <button onclick="closeRateizzazioneModal()"
                          style="padding:8px 16px;background:#f3f4f6;color:#374151;font-size:14px;font-weight:500;border-radius:8px;border:1px solid #d1d5db;cursor:pointer;"
                          onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                    Annulla
                  </button>
                  <button id="rateizzazioneDelBtn" onclick="deleteRateizzazione()"
                          style="display:none;padding:8px 16px;background:#ef4444;color:#fff;font-size:14px;font-weight:600;border-radius:8px;border:none;cursor:pointer;"
                          onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
                    🗑 Rimuovi Piano
                  </button>
                  <button onclick="salvaRateizzazione()"
                          style="padding:8px 18px;background:#6366f1;color:#ffffff;font-size:14px;font-weight:600;border-radius:8px;border:none;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.15);"
                          onmouseover="this.style.background='#4f46e5'" onmouseout="this.style.background='#6366f1'">
                    💾 Salva Piano Rate
                  </button>
                </div>
              </div>
            </div>\`;
            document.body.insertAdjacentHTML('beforeend', html);
        })();

        let _rateizzazioneLeadId  = null;
        let _rateizzazionePrezzo  = 0;

        async function openRateizzazioneModal(leadId, nome, prezzo, isRateizzato) {
            _rateizzazioneLeadId = leadId;
            _rateizzazionePrezzo = prezzo || 0;

            // Info lead
            document.getElementById('rateizzazioneLeadInfo').innerHTML =
                \`<strong>Lead:</strong> \${escapeHtml(nome || leadId)} &nbsp;|&nbsp; <strong>Importo totale:</strong> <span style="color:#6366f1;font-weight:700;">€\${_rateizzazionePrezzo}</span>\`;

            const modal = document.getElementById('rateizzazioneModal');
            modal.style.display = 'flex';

            // Se già rateizzato: carica piano esistente
            const existingEl  = document.getElementById('rateizzazioneExisting');
            const formEl      = document.getElementById('rateizzazioneForm');
            const delBtn      = document.getElementById('rateizzazioneDelBtn');

            existingEl.style.display = 'none';
            existingEl.innerHTML     = '';

            if (isRateizzato) {
                delBtn.style.display = 'inline-block';
                try {
                    const res = await fetch('/api/leads/' + leadId + '/rateizzazione', { credentials: 'include' });
                    const data = await res.json();
                    if (data.success && data.rate && data.rate.length > 0) {
                        const statusColors = { PAGATA:'#16a34a', ATTESA:'#d97706', SCADUTA:'#dc2626', ANNULLATA:'#6b7280' };
                        const righe = data.rate.map(r => {
                            const sc  = statusColors[r.status] || '#6b7280';
                            const sel = ['ATTESA','PAGATA','SCADUTA','ANNULLATA'].map(s =>
                                \`<option value="\${s}" \${r.status===s?'selected':''}> \${s}</option>\`).join('');
                            return \`<tr style="border-bottom:1px solid #f3f4f6;">
                                <td style="padding:6px 10px;font-weight:600;">Rata \${r.numero_rata}</td>
                                <td style="padding:6px 10px;">€\${Number(r.importo).toFixed(2)}</td>
                                <td style="padding:6px 10px;">\${r.data_scadenza ? r.data_scadenza.substring(0,10) : '—'}</td>
                                <td style="padding:6px 10px;">
                                    <select onchange="aggiornaStato(\${r.id},'\${leadId}',this.value)"
                                            style="font-size:12px;padding:3px 6px;border:1px solid #d1d5db;border-radius:6px;color:\${sc};font-weight:600;">
                                        \${sel}
                                    </select>
                                </td>
                                <td style="padding:6px 10px;font-size:11px;color:#6b7280;">\${r.riferimento||r.note||''}</td>
                            </tr>\`;
                        }).join('');
                        existingEl.innerHTML = \`
                            <div style="background:#eef2ff;border:1px solid #a5b4fc;border-radius:10px;padding:12px;margin-bottom:12px;">
                              <div style="font-size:13px;font-weight:700;color:#4338ca;margin-bottom:8px;">
                                📋 Piano attuale &nbsp;·&nbsp; Pagate: \${data.rate_pagate}/\${data.rate_totali} &nbsp;·&nbsp; Saldo: €\${data.totale_pagato.toFixed(2)}/€\${data.totale_rate.toFixed(2)}
                                \${data.riserva_dominio ? '<span style="margin-left:8px;font-size:11px;background:#fed7aa;color:#92400e;padding:2px 7px;border-radius:9999px;">🔒 Riserva di Dominio</span>' : ''}
                                \${data.rateizzazione_saldo ? '<span style="margin-left:8px;font-size:11px;background:#dcfce7;color:#166534;padding:2px 7px;border-radius:9999px;">✅ SALDATO</span>' : ''}
                              </div>
                              <table style="width:100%;font-size:12px;border-collapse:collapse;">
                                <thead><tr style="background:#e0e7ff;font-size:10px;text-transform:uppercase;color:#4338ca;">
                                  <th style="padding:5px 10px;text-align:left;">Rata</th>
                                  <th style="padding:5px 10px;text-align:left;">Importo</th>
                                  <th style="padding:5px 10px;text-align:left;">Scadenza</th>
                                  <th style="padding:5px 10px;text-align:left;">Stato</th>
                                  <th style="padding:5px 10px;text-align:left;">Rif.</th>
                                </tr></thead>
                                <tbody>\${righe}</tbody>
                              </table>
                            </div>
                            <p style="font-size:12px;color:#6b7280;margin:0 0 4px;">Modifica il piano qui sotto per sostituirlo:</p>\`;
                        existingEl.style.display = 'block';
                    }
                } catch(e) { /* ignora */ }
            } else {
                delBtn.style.display = 'none';
            }

            // Pre-popola le rate con importo equo
            generaRigheRate();
        }

        function generaRigheRate() {
            const n          = parseInt(document.getElementById('rateNum').value) || 2;
            const intervallo = parseInt(document.getElementById('rateIntervallo').value) || 1;
            const totale     = _rateizzazionePrezzo || 0;
            const base       = totale > 0 ? Math.floor((totale / n) * 100) / 100 : 0;
            const resto      = totale > 0 ? Math.round((totale - base * n) * 100) / 100 : 0;
            const oggi       = new Date();
            const tbody      = document.getElementById('rateTableBody');
            let html = '';
            for (let i = 1; i <= n; i++) {
                const importo = i === n ? (base + resto).toFixed(2) : base.toFixed(2);
                const scad    = new Date(oggi);
                scad.setMonth(scad.getMonth() + (i - 1) * intervallo);
                const scadStr = scad.toISOString().substring(0, 10);
                html += \`<tr style="border-bottom:1px solid #f3f4f6;">
                    <td style="padding:6px 8px;font-weight:600;color:#4338ca;">Rata \${i}</td>
                    <td style="padding:6px 8px;">
                        <input type="number" step="0.01" min="0" id="rataImporto_\${i}" value="\${importo}"
                               style="width:90px;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">
                    </td>
                    <td style="padding:6px 8px;">
                        <input type="date" id="rataScadenza_\${i}" value="\${scadStr}"
                               style="padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:13px;">
                    </td>
                    <td style="padding:6px 8px;">
                        <input type="text" id="rataNote_\${i}" placeholder="facoltativo"
                               style="width:120px;padding:4px 8px;border:1px solid #d1d5db;border-radius:6px;font-size:12px;">
                    </td>
                </tr>\`;
            }
            tbody.innerHTML = html;
            const somma = totale > 0 ? \`— totale: €\${totale}\` : '';
            document.getElementById('rateTotaleInfo').textContent =
                \`\${n} rate da €\${base.toFixed(2)} (ultima €\${(base+resto).toFixed(2)}) \${somma}\`;
        }

        async function aggiornaStato(rataId, leadId, newStatus) {
            const metodo = newStatus === 'PAGATA' ? prompt('Metodo pagamento (BONIFICO / STRIPE / CONTANTI):') : null;
            const rif    = newStatus === 'PAGATA' ? prompt('Riferimento (CRO/causale, facoltativo):') : null;
            try {
                const res = await fetch('/api/leads/' + leadId + '/rate/' + rataId, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ status: newStatus, metodo_pagamento: metodo, riferimento: rif })
                });
                const data = await res.json();
                if (data.success) {
                    if (data.saldato) alert('✅ Piano SALDATO completamente!');
                    else alert('✅ Stata aggiornata a ' + newStatus);
                    closeRateizzazioneModal();
                    loadLeadsData();
                } else {
                    alert('❌ Errore: ' + (data.error || 'sconosciuto'));
                }
            } catch(e) { alert('❌ ' + e.message); }
        }

        async function salvaRateizzazione() {
            const n   = parseInt(document.getElementById('rateNum').value) || 2;
            const rate = [];
            for (let i = 1; i <= n; i++) {
                const importo = parseFloat(document.getElementById('rataImporto_' + i)?.value);
                const scad    = document.getElementById('rataScadenza_' + i)?.value;
                const note    = document.getElementById('rataNote_' + i)?.value || '';
                if (!importo || !scad) { alert('Compila importo e scadenza per tutte le rate.'); return; }
                rate.push({ numero_rata: i, importo, data_scadenza: scad, note });
            }
            const riserva = document.getElementById('riservaCheckbox').checked;
            const noteRat = document.getElementById('rateizzazioneNoteInput').value;
            try {
                const res = await fetch('/api/leads/' + _rateizzazioneLeadId + '/rateizzazione', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ rate, riserva_dominio: riserva, note_rateizzazione: noteRat })
                });
                const data = await res.json();
                if (data.success) {
                    alert('\u2705 ' + data.message + (riserva ? '\\n\uD83D\uDD12 Clausola Riserva di Dominio attiva' : ''));
                    closeRateizzazioneModal();
                    loadLeadsData();
                } else {
                    alert('\u274C Errore: ' + (data.error || 'sconosciuto'));
                }
            } catch(e) { alert('\u274C ' + e.message); }
        }

        async function deleteRateizzazione() {
            if (!confirm('Rimuovere il piano rateizzazione (le rate già pagate non vengono cancellate)?')) return;
            try {
                const res = await fetch('/api/leads/' + _rateizzazioneLeadId + '/rateizzazione', {
                    method: 'DELETE', credentials: 'include'
                });
                const data = await res.json();
                if (data.success) {
                    alert('✅ Piano rateizzazione rimosso');
                    closeRateizzazioneModal();
                    loadLeadsData();
                } else {
                    alert('❌ ' + (data.error || 'Errore'));
                }
            } catch(e) { alert('❌ ' + e.message); }
        }

        function closeRateizzazioneModal() {
            const m = document.getElementById('rateizzazioneModal');
            if (m) m.style.display = 'none';
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

            // ── IVA agevolata: mostra stato e configura toggle ────────────────
            const ivaAgevolata = lead.iva_agevolata == 1 || lead.iva_agevolata === true;
            const ivaEl = document.getElementById('viewIvaAgevolata');
            const ivaBtn = document.getElementById('toggleIvaBtn');
            if (ivaEl) {
                ivaEl.innerHTML = ivaAgevolata
                    ? '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">⚕️ IVA 4% — Legge 104 (disabilità 100%) ATTIVA</span>'
                    : '<span class="inline-flex items-center px-3 py-1 rounded-full text-xs bg-gray-100 text-gray-600 border border-gray-200">IVA 22% standard</span>';
            }
            if (ivaBtn) {
                ivaBtn.textContent = ivaAgevolata ? '🔄 Ripristina IVA 22%' : '⚕️ Attiva IVA 4% Legge 104';
                ivaBtn.className = ivaAgevolata
                    ? 'px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition font-medium'
                    : 'px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium';
                ivaBtn.onclick = () => toggleIvaAgevolata(lead.id, !ivaAgevolata);
            }

            // Carica lo storico interazioni
            loadInteractions(leadId);
            
            openModal('viewLeadModal');
        }

        async function toggleIvaAgevolata(leadId, attiva) {
            try {
                const response = await fetch(\`/api/leads/\${leadId}/iva-agevolata\`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ iva_agevolata: attiva ? 1 : 0 })
                });
                const data = await response.json();
                if (data.success) {
                    // Aggiorna il lead in memoria
                    const lead = allLeads.find(l => l.id === leadId);
                    if (lead) lead.iva_agevolata = attiva ? 1 : 0;
                    // Riapri il modal aggiornato
                    viewLead(leadId);
                    showToast(attiva ? '✅ IVA 4% Legge 104 attivata' : '✅ IVA ripristinata al 22%', 'success');
                } else {
                    showToast('❌ Errore aggiornamento IVA: ' + (data.error || 'Errore sconosciuto'), 'error');
                }
            } catch (e) {
                showToast('❌ Errore di rete: ' + e.message, 'error');
            }
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
                alert('⚠️ Inserisci una nota per questa interazione');
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
                alert('⚠️ Inserisci una nota per questa interazione');
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
            document.getElementById('intModalOperatore').value = 'Stefania Rocca';
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
                alert('⚠️ Inserisci una nota per questa interazione');
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
                
                // Ripristina i required solo sui campi principali
                const requiredFields = ['newNome', 'newCognome', 'newEmail', 'newTelefono'];
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
            
            // Ripristina i required solo sui campi principali
            const requiredFields = ['newNome', 'newCognome', 'newEmail', 'newTelefono'];
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
            
            // ✅ FIX CRITICO: Salva il valore selezionato PRIMA di ricostruire innerHTML
            // Senza questo salvataggio, quando l'utente sceglie AVANZATO e updatePrices()
            // ricostruisce le <option>, il browser torna alla prima option (BASE), 
            // impedendo di cambiare il piano tramite CRUD.
            const pianoCorrente = pianoSelect.value;
            
            // Prezzi per servizio (primo anno / rinnovo) - AGGIORNATI da ecura.it
            const prices = {
                'eCura FAMILY': {
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
            
            // ✅ FIX CRITICO: Ripristina il valore selezionato dall'utente dopo la ricostruzione HTML
            // Questo permette di cambiare BASE→AVANZATO (e viceversa) tramite CRUD penna
            if (pianoCorrente && (pianoCorrente === 'BASE' || pianoCorrente === 'AVANZATO')) {
                pianoSelect.value = pianoCorrente;
            }
            
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
                    alert("⚠️ Compila tutti i campi obbligatori contrassegnati con * (Nome, Cognome, Email, Telefono)");
                    return;
                }
                
                // ✅ RIMOSSO: I campi assistito NON sono obbligatori
                // Il lead può essere creato senza dati assistito (verranno richiesti dopo via email)
                
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
        
        async function nuovoAssistito() {
            // Reset form
            const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
            setVal('newAssistitoNome', '');
            setVal('newAssistitoCognome', '');
            setVal('newAssistitoEmail', '');
            setVal('newAssistitoTelefono', '');
            setVal('newAssistitoIMEI', '');
            setVal('newAssistitoServizio', 'eCura PRO');
            setVal('newAssistitoPiano', 'AVANZATO');
            setVal('newAssistitoNomeCaregiver', '');
            setVal('newAssistitoCognomeCaregiver', '');
            setVal('newAssistitoParentela', '');
            setVal('newAssistitoLeadId', '');
            // Apri modal
            const modal = document.getElementById('newAssistitoModal');
            if (modal) {
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        }
        window.nuovoAssistito = nuovoAssistito;
        
        async function saveNewAssistito() {
            const nome = document.getElementById('newAssistitoNome')?.value?.trim();
            const cognome = document.getElementById('newAssistitoCognome')?.value?.trim();
            const email = document.getElementById('newAssistitoEmail')?.value?.trim() || '';
            const telefono = document.getElementById('newAssistitoTelefono')?.value?.trim() || '';
            const imei = document.getElementById('newAssistitoIMEI')?.value?.trim() || '';
            const servizio = document.getElementById('newAssistitoServizio')?.value || 'eCura PRO';
            const piano = document.getElementById('newAssistitoPiano')?.value || 'AVANZATO';
            const nomeCaregiver = document.getElementById('newAssistitoNomeCaregiver')?.value?.trim() || '';
            const cognomeCaregiver = document.getElementById('newAssistitoCognomeCaregiver')?.value?.trim() || '';
            const parentela = document.getElementById('newAssistitoParentela')?.value?.trim() || '';
            const leadId = document.getElementById('newAssistitoLeadId')?.value?.trim() || '';
            
            if (!nome || !cognome) {
                alert('⚠️ Nome e Cognome sono obbligatori!');
                return;
            }
            
            try {
                const response = await fetch('/api/assistiti', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nome, cognome,
                        nome_assistito: nome,
                        cognome_assistito: cognome,
                        email, telefono,
                        imei: imei || undefined,
                        servizio, piano,
                        nome_caregiver: nomeCaregiver,
                        cognome_caregiver: cognomeCaregiver,
                        parentela_caregiver: parentela,
                        lead_id: leadId || undefined,
                        status: 'ATTIVO'
                    })
                });
                const result = await response.json();
                if (result.success) {
                    alert('✅ Assistito ' + nome + ' ' + cognome + ' creato con successo!');
                    closeModal('newAssistitoModal');
                    loadDashboardData();
                } else {
                    alert('❌ Errore: ' + (result.error || 'Errore sconosciuto'));
                }
            } catch (error) {
                alert('❌ Errore: ' + error.message);
            }
        }
        window.saveNewAssistito = saveNewAssistito;
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
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Nome Assistito</label>
                                <input type="text" id="newNomeAssistito" 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Giuseppe">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Cognome Assistito</label>
                                <input type="text" id="newCognomeAssistito" 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Rossi">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Luogo di Nascita</label>
                                <input type="text" id="newLuogoNascita" 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Milano">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Data di Nascita</label>
                                <input type="text" id="newDataNascita" 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="15/03/1950"
                                    onblur="calculateAge()" onchange="calculateAge()">
                                <div id="etaCalcolata" class="text-sm text-gray-500 mt-1"></div>
                            </div>
                            <div class="md:col-span-2">
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Indirizzo Completo</label>
                                <input type="text" id="newIndirizzoAssistito" 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Via Roma 123">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">CAP</label>
                                <input type="text" id="newCapAssistito" maxlength="5"
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="20121">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Città</label>
                                <input type="text" id="newCittaAssistito" 
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                    placeholder="Milano">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Provincia</label>
                                <input type="text" id="newProvinciaAssistito" maxlength="2"
                                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition uppercase"
                                    placeholder="MI">
                            </div>
                            <div>
                                <label class="block text-sm font-semibold text-gray-700 mb-2">Codice Fiscale</label>
                                <input type="text" id="newCodiceFiscale" maxlength="16"
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
                                <select id="newPiano" required onchange="updatePrices()"
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
                                    <option value="Sito www.eCura.it">Sito www.eCura.it</option>
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
                                    <option value="Operatore Commerciale">Operatore Commerciale (OC)</option>
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
                    <div class="col-span-2">
                        <label class="block text-xs font-medium text-gray-700 mb-1">IVA Applicabile</label>
                        <div id="viewIvaAgevolata" class="p-2 rounded">
                            <span class="text-xs text-gray-500">—</span>
                        </div>
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

                <div class="flex justify-between items-center pt-2 border-t">
                    <button id="toggleIvaBtn" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition font-medium">
                        ⚕️ Attiva IVA 4% Legge 104
                    </button>
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
                                <option value="Stefania Rocca" selected>Stefania Rocca (SR)</option>
                                <option value="Operatore Commerciale">Operatore Commerciale (OC)</option>
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
    <meta name="build-id" content="20260215-1012">
    <title>Data Dashboard - TeleMedCare V12.0</title>
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="eCura">
  <meta name="theme-color" content="#1d6ab9">
    <!-- Build: 2026-02-15 10:12 - Filtri + Fix Conteggi Servizi -->
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
                Contratti
            </h3>
            
            <!-- Filtri Contratti -->
            <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        <i class="fas fa-calendar mr-1"></i> Data Scadenza
                    </label>
                    <select id="filterScadenza" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Tutte</option>
                        <option value="expired">Scaduti</option>
                        <option value="30">Prossimi 30 giorni</option>
                        <option value="60">Prossimi 60 giorni</option>
                        <option value="90">Prossimi 90 giorni</option>
                        <option value="180">Prossimi 6 mesi</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        <i class="fas fa-user mr-1"></i> Cognome Cliente
                    </label>
                    <input 
                        type="text" 
                        id="filterCognome" 
                        placeholder="Cerca per cognome..."
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        <i class="fas fa-check-circle mr-1"></i> Stato
                    </label>
                    <select id="filterStato" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Tutti</option>
                        <option value="SIGNED">Firmato</option>
                        <option value="SENT">Inviato</option>
                        <option value="DRAFT">Bozza</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-700 mb-1">
                        <i class="fas fa-mobile-alt mr-1"></i> Dispositivo
                    </label>
                    <select id="filterDispositivo" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                        <option value="">Tutti</option>
                        <option value="SIDLY VITAL CARE">SiDLY VITAL CARE</option>
                        <option value="SIDLY CARE PRO">SiDLY CARE PRO</option>
                    </select>
                </div>
            </div>

            <!-- Contatore risultati e reset filtri -->
            <div class="mb-4 flex items-center justify-between">
                <div class="text-sm text-gray-600">
                    <span id="contractsCount">0</span> contratti trovati
                </div>
                <button 
                    id="resetFilters" 
                    class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    onclick="resetContractFilters()"
                >
                    <i class="fas fa-redo mr-1"></i> Reset Filtri
                </button>
            </div>

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
                            <th class="pb-3 text-sm font-semibold text-gray-600" title="Scadenza entro cui il contratto deve essere firmato (30 giorni dall'invio). Non è la durata del servizio.">Scad. firma ⓘ</th>
                            <th class="pb-3 text-sm font-semibold text-gray-600 text-center">Azioni</th>
                        </tr>
                    </thead>
                    <tbody id="contractsTable">
                        <tr>
                            <td colspan="9" class="py-8 text-center text-gray-400">
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

        loadDataDashboard();
        // Alias usato dai pulsanti rinnovo dopo aggiornamento
        function loadContractsData() { loadDataDashboard(); }

        async function loadDataDashboard() {
            try {
                // Carica lead per servizio
                const leadsResponse = await fetch('/api/leads?limit=99999');
                const leadsData = await leadsResponse.json();
                const leads = leadsData.leads || [];

                // Carica contratti
                const contractsResponse = await fetch('/api/contratti?limit=99999');
                const contractsData = await contractsResponse.json();
                const allContracts = contractsData.contratti || [];
                
                // Salva TUTTI i contratti globalmente per i filtri (inclusi SENT)
                window.allContracts = allContracts;
                
                // Filtra SOLO contratti SIGNED per KPI e revenue
                const signedContracts = allContracts.filter(c => c.status === 'SIGNED');
                
                // Calcola KPI dai contratti FIRMATI
                const totalLeads = leads.length;
                const totalContracts = signedContracts.length;
                const totalRevenue = signedContracts.reduce((sum, c) => sum + (parseFloat(c.prezzo_totale) || 0), 0);
                const conversionRate = totalLeads > 0 ? ((totalContracts / totalLeads) * 100).toFixed(1) + '%' : '0%';
                const averageOrderValue = totalContracts > 0 ? (totalRevenue / totalContracts).toFixed(2) : '0';

                // Aggiorna KPI
                document.getElementById('kpiLeads').textContent = totalLeads;
                document.getElementById('kpiContracts').textContent = totalContracts;
                document.getElementById('kpiRevenue').textContent = \`€\${totalRevenue.toFixed(0)}\`;
                document.getElementById('kpiConversion').textContent = conversionRate;
                document.getElementById('kpiAov').textContent = \`€\${averageOrderValue}\`;

                // Analizza per servizio (LEADS + CONTRATTI SIGNED)
                const serviceData = analyzeByServiceWithContracts(leads, signedContracts);
                updateServiceMetrics(serviceData);

                // Mostra TUTTI i contratti nella tabella (inclusi SENT)
                renderContractsTable(allContracts);
                
                // Aggiungi event listeners per i filtri
                document.getElementById('filterScadenza').addEventListener('change', applyContractFilters);
                document.getElementById('filterCognome').addEventListener('input', applyContractFilters);
                document.getElementById('filterStato').addEventListener('change', applyContractFilters);
                document.getElementById('filterDispositivo').addEventListener('change', applyContractFilters);

            } catch (error) {
                console.error('Errore caricamento data dashboard:', error);
            }
        }

        function applyContractFilters() {
            console.log('🔍 [FILTER] applyContractFilters chiamata');
            
            const filters = {
                scadenza: document.getElementById('filterScadenza').value,
                cognome: document.getElementById('filterCognome').value.toLowerCase().trim(),
                stato: document.getElementById('filterStato').value,
                dispositivo: document.getElementById('filterDispositivo').value
            };

            console.log('🔍 [FILTER] Filtri attivi:', filters);

            let filtered = window.allContracts || [];
            console.log('🔍 [FILTER] Contratti totali:', filtered.length);

            // Filtro cognome - supporta multiple field names
            if (filters.cognome) {
                console.log('🔍 [FILTER] Applicando filtro cognome:', filters.cognome);
                filtered = filtered.filter(c => {
                    const cognome = (c.cliente_cognome || c.cognomeRichiedente || c.cognome_richiedente || '').toLowerCase();
                    const nome = (c.cliente_nome || c.nomeRichiedente || c.nome_richiedente || '').toLowerCase();
                    const fullName = \`\${nome} \${cognome}\`.toLowerCase();
                    return cognome.includes(filters.cognome) || nome.includes(filters.cognome) || fullName.includes(filters.cognome);
                });
                console.log('🔍 [FILTER] Dopo filtro cognome:', filtered.length);
            }

            // Filtro stato
            if (filters.stato) {
                console.log('🔍 [FILTER] Applicando filtro stato:', filters.stato);
                filtered = filtered.filter(c => c.status === filters.stato);
                console.log('🔍 [FILTER] Dopo filtro stato:', filtered.length);
            }

            // Filtro dispositivo - normalizza servizio
            if (filters.dispositivo) {
                console.log('🔍 [FILTER] Applicando filtro dispositivo:', filters.dispositivo);
                filtered = filtered.filter(c => {
                    const servizioNormalized = normalizeServizio(c.servizio || c.tipo_servizio);
                    const dispositivo = servizioNormalized === 'PREMIUM' ? 'SIDLY VITAL CARE' : 'SIDLY CARE PRO';
                    return dispositivo.includes(filters.dispositivo) || filters.dispositivo.includes(dispositivo);
                });
                console.log('🔍 [FILTER] Dopo filtro dispositivo:', filtered.length);
            }

            // Filtro data scadenza
            if (filters.scadenza) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                console.log('📅 [FILTER SCADENZA] ==========================================');
                console.log('📅 [FILTER SCADENZA] Filtro attivo:', filters.scadenza);
                console.log('📅 [FILTER SCADENZA] Oggi:', today.toISOString().split('T')[0]);
                console.log('📅 [FILTER SCADENZA] Contratti prima del filtro:', filtered.length);
                
                // Log TUTTE le date prima di filtrare
                console.log('📅 [FILTER SCADENZA] Date disponibili:');
                filtered.forEach((c, idx) => {
                    console.log(\`  [\${idx}] \${c.codice_contratto || c.id}: data_scadenza = "\${c.data_scadenza}" (tipo: \${typeof c.data_scadenza})\`);
                });
                
                filtered = filtered.filter(c => {
                    if (!c.data_scadenza) {
                        console.log('❌ [FILTER SCADENZA] Contratto senza data_scadenza:', c.codice_contratto);
                        return false;
                    }
                    
                    // Supporta diversi formati data
                    let scadenza;
                    if (typeof c.data_scadenza === 'string') {
                        // Prova parsing diretto ISO
                        scadenza = new Date(c.data_scadenza);
                        
                        // Se fallisce, prova a parsare manualmente DD/MM/YYYY o DD-MM-YYYY
                        if (isNaN(scadenza.getTime())) {
                            const parts = c.data_scadenza.split(/[\\/\\-]/);
                            if (parts.length === 3) {
                                // Assume DD/MM/YYYY o DD-MM-YYYY
                                const day = parseInt(parts[0]);
                                const month = parseInt(parts[1]) - 1;  // Month is 0-indexed
                                const year = parseInt(parts[2]);
                                scadenza = new Date(year, month, day);
                                console.log(\`🔄 [FILTER SCADENZA] Parsed manualmente: "\${c.data_scadenza}" → \${scadenza.toISOString().split('T')[0]}\`);
                            }
                        }
                    } else if (c.data_scadenza instanceof Date) {
                        scadenza = c.data_scadenza;
                    } else {
                        console.warn('⚠️ [FILTER SCADENZA] Formato data non riconosciuto:', c.data_scadenza, 'contratto:', c.codice_contratto);
                        return false;
                    }
                    
                    if (isNaN(scadenza.getTime())) {
                        console.warn('⚠️ [FILTER SCADENZA] Data invalida:', c.data_scadenza, 'contratto:', c.codice_contratto);
                        return false;
                    }
                    
                    scadenza.setHours(0, 0, 0, 0);
                    const diffTime = scadenza - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    let match = false;
                    if (filters.scadenza === 'expired') {
                        match = diffDays < 0;
                    } else {
                        const days = parseInt(filters.scadenza);
                        match = diffDays >= 0 && diffDays <= days;
                    }

                    console.log(\`\${match ? '✅' : '❌'} [FILTER SCADENZA] \${c.codice_contratto}: scadenza=\${scadenza.toISOString().split('T')[0]}, giorni=\${diffDays}, match=\${match}\`);
                    return match;
                });
                
                console.log('📅 [FILTER SCADENZA] Contratti dopo filtro:', filtered.length);
                console.log('📅 [FILTER SCADENZA] ==========================================');
            }

            console.log('🎯 [FILTER] RENDERING', filtered.length, 'contratti');
            renderContractsTable(filtered);
        }

        function resetContractFilters() {
            document.getElementById('filterScadenza').value = '';
            document.getElementById('filterCognome').value = '';
            document.getElementById('filterStato').value = '';
            document.getElementById('filterDispositivo').value = '';
            renderContractsTable(window.allContracts || []);
        }

        function normalizeServizio(servizio) {
            if (!servizio) return null;
            const s = servizio.toUpperCase();
            if (s.includes('FAMILY')) return 'FAMILY';
            if (s.includes('PRO') && !s.includes('PREMIUM')) return 'PRO';
            if (s.includes('PREMIUM')) return 'PREMIUM';
            return null;
        }

        function analyzeByServiceWithContracts(leads, contracts) {
            const data = {
                FAMILY: { leads: 0, contracts: 0, base: 0, avanzato: 0, revenue: 0 },
                PRO: { leads: 0, contracts: 0, base: 0, avanzato: 0, revenue: 0 },
                PREMIUM: { leads: 0, contracts: 0, base: 0, avanzato: 0, revenue: 0 }
            };

            // Conta i lead per servizio
            leads.forEach(lead => {
                const servizioNormalized = normalizeServizio(lead.servizio);
                if (servizioNormalized && data[servizioNormalized]) {
                    data[servizioNormalized].leads++;
                }
            });

            // Conta i contratti per servizio
            contracts.forEach(contract => {
                const servizioNormalized = normalizeServizio(contract.servizio || contract.tipo_servizio);
                const piano = (contract.piano || contract.tipo_contratto || 'BASE').toUpperCase();
                const prezzo = parseFloat(contract.prezzo_totale) || 0;
                
                if (servizioNormalized && data[servizioNormalized]) {
                    data[servizioNormalized].contracts++;
                    data[servizioNormalized].revenue += prezzo;
                    
                    if (piano.includes('BASE')) {
                        data[servizioNormalized].base++;
                    } else if (piano.includes('AVANZATO')) {
                        data[servizioNormalized].avanzato++;
                    } else {
                        // Default to BASE if unknown
                        data[servizioNormalized].base++;
                    }
                }
            });

            return data;
        }

        function analyzeByService(leads) {
            const data = {
                FAMILY: { leads: 0, base: 0, avanzato: 0, revenue: 0 },
                PRO: { leads: 0, base: 0, avanzato: 0, revenue: 0 },
                PREMIUM: { leads: 0, base: 0, avanzato: 0, revenue: 0 }
            };

            const prezzi = {
                'FAMILY': { 'BASE': 390, 'AVANZATO': 690 },
                'PRO': { 'BASE': 480, 'AVANZATO': 840 },
                'PREMIUM': { 'BASE': 590, 'AVANZATO': 990 }
            };

            leads.forEach(lead => {
                const servizioNormalized = normalizeServizio(lead.servizio);
                const piano = lead.pacchetto || 'BASE';
                
                if (servizioNormalized && data[servizioNormalized]) {
                    data[servizioNormalized].leads++;
                    
                    if (piano === 'BASE') {
                        data[servizioNormalized].base++;
                    } else {
                        data[servizioNormalized].avanzato++;
                    }

                    if (lead.contratto_inviato && prezzi[servizioNormalized]?.[piano]) {
                        data[servizioNormalized].revenue += prezzi[servizioNormalized][piano];
                    }
                }
            });

            return data;
        }

        function updateServiceMetrics(data) {
            // FAMILY
            document.getElementById('familyLeads').textContent = data.FAMILY.leads;
            document.getElementById('familyContracts').textContent = data.FAMILY.contracts || (data.FAMILY.base + data.FAMILY.avanzato);
            document.getElementById('familyRevenue').textContent = \`€\${data.FAMILY.revenue.toFixed(0)}\`;
            document.getElementById('familyBase').textContent = data.FAMILY.base;
            document.getElementById('familyAvanzato').textContent = data.FAMILY.avanzato;

            // PRO
            document.getElementById('proLeads').textContent = data.PRO.leads;
            document.getElementById('proContracts').textContent = data.PRO.contracts || (data.PRO.base + data.PRO.avanzato);
            document.getElementById('proRevenue').textContent = \`€\${data.PRO.revenue.toFixed(0)}\`;
            document.getElementById('proBase').textContent = data.PRO.base;
            document.getElementById('proAvanzato').textContent = data.PRO.avanzato;

            // PREMIUM
            document.getElementById('premiumLeads').textContent = data.PREMIUM.leads;
            document.getElementById('premiumContracts').textContent = data.PREMIUM.contracts || (data.PREMIUM.base + data.PREMIUM.avanzato);
            document.getElementById('premiumRevenue').textContent = \`€\${data.PREMIUM.revenue.toFixed(0)}\`;
            document.getElementById('premiumBase').textContent = data.PREMIUM.base;
            document.getElementById('premiumAvanzato').textContent = data.PREMIUM.avanzato;
        }

        // ── Funzioni Rinnovo ────────────────────────────────────────────────────

        async function inviaRinnovo(leadId, codiceContrattoOriginale, clienteNome, ivaAgevolata, annoRinnovo) {
            if (!leadId) { alert('❌ Lead ID mancante — impossibile inviare il rinnovo.'); return; }
            const ivaInfo = ivaAgevolata ? 'IVA 4% (Legge 104)' : 'IVA 22%';
            if (!confirm(\`🔄 Generare contratto RINNOVO per:\\n\\n📋 \${codiceContrattoOriginale}\\n👤 \${clienteNome}\\n📅 Anno \${annoRinnovo}\\n\\nIl contratto verrà creato ma l'email NON sarà ancora inviata.\\nPotrai verificare il link e poi inviare l'email manualmente.\\nAliquota IVA applicata: \${ivaInfo}.\`)) return;
            try {
                const resp = await fetch(\`/api/leads/\${leadId}/send-contract\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        isRinnovo: true,
                        annoRinnovo: annoRinnovo,
                        codiceOriginale: codiceContrattoOriginale
                    })
                });
                const result = await resp.json();
                if (result.success && result.dryRun) {
                    // dryRun: mostra link per verifica prima di inviare email
                    const apri = confirm(
                        \`✅ Contratto creato: \${result.codiceRinnovo}\\n\\n\` +
                        \`🔗 Link firma:\\n\${result.firmaUrl}\\n\\n\` +
                        \`Premi OK per APRIRE il link e verificarlo.\\n\` +
                        \`Poi usa il pulsante "📧 Invia Email" in dashboard per inviarlo al cliente.\`
                    );
                    if (apri) window.open(result.firmaUrl, '_blank');
                    if (typeof loadContractsData === 'function') loadContractsData();
                } else if (result.success) {
                    alert(\`✅ Contratto di rinnovo inviato!\\n\\nCodice: \${result.codiceRinnovo}\\n\\n📧 Email con link di firma inviata al cliente.\`);
                    if (typeof loadContractsData === 'function') loadContractsData();
                } else {
                    alert('❌ Errore: ' + (result.error || result.details || 'Riprovare'));
                }
            } catch (err) {
                alert('❌ Errore di rete: ' + err.message);
            }
        }

        async function inviaEmailRinnovo(rinnovoId, codiceRinnovo, emailCliente) {
            if (!confirm(\`📧 Inviare l'email di rinnovo a \${emailCliente}?\\n\\nContratto: \${codiceRinnovo}\\n\\nL'email con il link di firma sarà inviata al cliente.\`)) return;
            try {
                const resp = await fetch(\`/api/contracts/\${rinnovoId}/send-rinnovo-email\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                });
                const result = await resp.json();
                if (result.success) {
                    alert(\`✅ Email inviata a \${result.emailInviataA}!\`);
                    if (typeof loadContractsData === 'function') loadContractsData();
                } else {
                    alert('❌ Errore: ' + (result.error || result.details || 'Riprovare'));
                }
            } catch (err) {
                alert('❌ Errore di rete: ' + err.message);
            }
        }

        async function segnaRinnovoCompletato(contractId, codiceContratto) {
            if (!confirm(\`✅ Segnare il rinnovo \${codiceContratto} come COMPLETATO?\\n\\nQuesta azione conferma che il contratto di rinnovo è stato firmato e la proforma pagata.\`)) return;
            try {
                const resp = await fetch(\`/api/contracts/\${contractId}/rinnovo-completato\`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ completato: true })
                });
                const result = await resp.json();
                if (result.success) {
                    alert('✅ ' + result.message);
                    if (typeof loadContractsData === 'function') loadContractsData();
                } else {
                    alert('❌ Errore: ' + (result.error || 'Riprovare'));
                }
            } catch (err) {
                alert('❌ Errore di rete: ' + err.message);
            }
        }

        async function segnaRinnovoFirmato(rinnovoId, codiceRinnovo) {
            if (!confirm(\`✅ Segnare il rinnovo \${codiceRinnovo} come FIRMATO manualmente?\\n\\nUsa questa opzione se il cliente ha firmato fuori dal portale digitale.\`)) return;
            try {
                const resp = await fetch(\`/api/contracts/\${rinnovoId}/segna-firmato\`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ status: 'SIGNED' })
                });
                const result = await resp.json();
                if (result.success) {
                    alert('✅ Rinnovo segnato come firmato!');
                    if (typeof loadContractsData === 'function') loadContractsData();
                } else {
                    alert('❌ Errore: ' + (result.error || 'Riprovare'));
                }
            } catch (err) {
                alert('❌ Errore di rete: ' + err.message);
            }
        }

        async function creaProformaRinnovo(rinnovoId, codiceRinnovo) {
            if (!confirm(\`📋 Creare la PROFORMA per il rinnovo \${codiceRinnovo}?\\n\\nLa proforma verrà creata ma l'email NON sarà ancora inviata.\\nPotrai inviarla nel passo successivo.\`)) return;
            try {
                const resp = await fetch(\`/api/contracts/\${rinnovoId}/crea-proforma-rinnovo\`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include'
                });
                const result = await resp.json();
                if (result.success) {
                    alert(\`✅ Proforma creata: \${result.numeroProforma}\\nImporto: €\${result.prezzoTotale}\\n\\nOra usa il pulsante "📤 INVIA PROFORMA" per inviarla al cliente.\`);
                    if (typeof loadContractsData === 'function') loadContractsData();
                } else {
                    alert('❌ Errore: ' + (result.error || 'Riprovare'));
                }
            } catch (err) { alert('❌ Errore di rete: ' + err.message); }
        }

        async function inviaProformaRinnovo(rinnovoId, codiceRinnovo) {
            if (!confirm(\`📤 Inviare l'email con la PROFORMA per il rinnovo \${codiceRinnovo}?\`)) return;
            try {
                const resp = await fetch(\`/api/contracts/\${rinnovoId}/invia-proforma-rinnovo\`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include'
                });
                const result = await resp.json();
                if (result.success) {
                    alert(\`✅ Proforma inviata a \${result.emailInviataA}!\`);
                    if (typeof loadContractsData === 'function') loadContractsData();
                } else {
                    alert('❌ Errore: ' + (result.error || result.message || 'Riprovare'));
                }
            } catch (err) { alert('❌ Errore di rete: ' + err.message); }
        }

        // ────────────────────────────────────────────────────────────────────────

        function renderContractsTable(contracts) {
            const tbody = document.getElementById('contractsTable');
            const countElement = document.getElementById('contractsCount');
            
            // Aggiorna contatore
            countElement.textContent = contracts.length;
            
            if (contracts.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="9" class="py-8 text-center text-gray-400">Nessun contratto trovato</td>
                    </tr>
                \`;
                return;
            }

            tbody.innerHTML = contracts.map(contract => {
                // Fix: usa normalizeServizio per mappare dispositivo corretto
                const servizioNormalized = normalizeServizio(contract.servizio || contract.tipo_servizio);
                const dispositivo = servizioNormalized === 'PREMIUM' ? 'SiDLY VITAL CARE' : 
                                   servizioNormalized ? 'SiDLY CARE PRO' : 'N/A';
                
                const date = new Date(contract.created_at).toLocaleDateString('it-IT');
                const isRinnovo = contract.is_rinnovo == 1 || contract.is_rinnovo === true;
                const rinnovoCompletato = contract.rinnovo_completato == 1 || contract.rinnovo_completato === true;
                const isSigned = contract.status === 'SIGNED';
                const ivaAg = contract.iva_agevolata == 1 || contract.iva_agevolata === true;
                const tooltipIva = ivaAg ? 'IVA 4% (Legge 104)' : 'IVA 22%';
                const ivaAgSafe = ivaAg ? 'true' : 'false';

                // Badge rinnovo
                const rinnovo_badge = isRinnovo
                    ? \`<span class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full ml-1" title="Contratto di rinnovo anno \${contract.anno_rinnovo || 2}">🔄 R\${contract.anno_rinnovo || 2}</span>\`
                    : '';
                const completato_badge = rinnovoCompletato
                    ? \`<span class="inline-flex items-center px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full ml-1" title="Rinnovo completato">✅</span>\`
                    : '';

                // Row highlight
                const rowBg = rinnovoCompletato ? 'bg-emerald-50 hover:bg-emerald-100'
                            : isRinnovo ? 'bg-green-50 hover:bg-green-100'
                            : 'hover:bg-gray-50';

                // Data scadenza con evidenziazione
                let scadenzaHtml = '<span class="text-gray-400 text-xs">N/A</span>';
                if (contract.codice_contratto) {
                    console.log(\`📅 [RENDER] \${contract.codice_contratto}: data_scadenza = "\${contract.data_scadenza}" (tipo: \${typeof contract.data_scadenza})\`);
                }
                if (contract.data_scadenza) {
                    try {
                        const scadenza = new Date(contract.data_scadenza);
                        if (!isNaN(scadenza.getTime())) {
                            const today = new Date();
                            const diffTime = scadenza - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            let colorClass = 'text-gray-600';
                            let icon = '';
                            if (diffDays < 0) {
                                colorClass = 'text-red-600 font-bold';
                                icon = '<i class="fas fa-exclamation-triangle mr-1"></i>';
                            } else if (diffDays <= 30) {
                                colorClass = 'text-orange-600 font-semibold';
                                icon = '<i class="fas fa-clock mr-1"></i>';
                            } else if (diffDays <= 90) {
                                colorClass = 'text-yellow-600';
                                icon = '<i class="fas fa-calendar-check mr-1"></i>';
                            }
                            scadenzaHtml = \`<span class="\${colorClass} text-xs">\${icon}\${scadenza.toLocaleDateString('it-IT')}</span>\`;
                        } else {
                            console.warn(\`⚠️ [RENDER] Data scadenza invalida per \${contract.codice_contratto}: \${contract.data_scadenza}\`);
                        }
                    } catch (e) {
                        console.error(\`❌ [RENDER] Errore parsing data per \${contract.codice_contratto}:\`, e);
                    }
                }

                // Azioni colonna destra
                const clienteNome = (contract.cliente_nome || '') + ' ' + (contract.cliente_cognome || '');
                const idSafe = JSON.stringify(contract.id);
                const annoRinnovoSafe = (contract.anno_rinnovo || 1) + 1;

                // ✅ FIX: uso apostrofi singoli per le stringhe negli onclick inline,
                // così i doppi apici dell'attributo HTML non vengono rotti.
                // JSON.stringify produce "valore" con " che rompe onclick="fn("valore")"
                const codiceSafeQ  = (contract.codice_contratto || String(contract.id)).replace(/'/g, "\\'");
                const clienteNomeQ = clienteNome.trim().replace(/'/g, "\\'");
                const leadIdQ      = (contract.leadId || '').replace(/'/g, "\\'");

                let azioniHtml = '';
                // ─ Dati comuni per azioni rinnovo ────────────────────────────
                const idRinnovoSafe    = JSON.stringify(contract.id);
                const codiceSafeR      = (contract.codice_contratto || '').replace(/'/g, "\'");
                const emailClienteSafe = (contract.email_cliente || '').replace(/'/g, "\'");
                const firmaUrlRinnovo  = \`/firma-contratto.html?contractId=\${encodeURIComponent(contract.id)}\`;
                const emailSent        = contract.email_sent == 1 || contract.email_sent === true;
                const proformaCreata   = !!(contract.proforma_rinnovo_id);
                const proformaInviata  = contract.proforma_rinnovo_sent == 1 || contract.proforma_rinnovo_sent === true;
                const proformaPagata   = contract.proforma_rinnovo_paid == 1 || contract.proforma_rinnovo_paid === true;

                // Helper: icona-button per ogni step
                // stato: 'done'=grigio check, 'active'=colore pieno, 'future'=grigio trasparente
                const sBtn = (emoji, tipoDone, tipoActive, tipoFuture, onclick, stato, color) => {
                    const BASE = 'w-7 h-7 flex items-center justify-center rounded text-sm transition-colors';
                    if (stato === 'done')
                        return \`<span class="\${BASE} bg-gray-100 text-gray-400 cursor-default" title="\${tipoDone}">\${emoji}</span>\`;
                    if (stato === 'future')
                        return \`<span class="\${BASE} bg-gray-50 text-gray-300 cursor-not-allowed" title="\${tipoFuture}">\${emoji}</span>\`;
                    const C = { blue:'bg-blue-600 hover:bg-blue-700', orange:'bg-orange-500 hover:bg-orange-600',
                                indigo:'bg-indigo-600 hover:bg-indigo-700', emerald:'bg-emerald-500 hover:bg-emerald-600',
                                violet:'bg-violet-600 hover:bg-violet-700', green:'bg-green-500 hover:bg-green-600' };
                    return \`<button onclick="\${onclick}" class="\${BASE} \${C[color]||C.blue} text-white" title="\${tipoActive}">\${emoji}</button>\`;
                };
                // Helper: icona-link
                const sLink = (emoji, href, tipoDone, tipoActive, stato, color) => {
                    const BASE = 'w-7 h-7 flex items-center justify-center rounded text-sm transition-colors';
                    if (stato === 'done')
                        return \`<span class="\${BASE} bg-gray-100 text-gray-400 cursor-default" title="\${tipoDone}">\${emoji}</span>\`;
                    if (stato === 'future')
                        return \`<span class="\${BASE} bg-gray-50 text-gray-300 cursor-not-allowed" title="—">\${emoji}</span>\`;
                    const C = { blue:'bg-blue-600 hover:bg-blue-700', orange:'bg-orange-500 hover:bg-orange-600',
                                indigo:'bg-indigo-600 hover:bg-indigo-700', emerald:'bg-emerald-500 hover:bg-emerald-600',
                                violet:'bg-violet-600 hover:bg-violet-700', green:'bg-green-500 hover:bg-green-600' };
                    return \`<a href="\${href}" target="_blank" class="\${BASE} \${C[color]||C.blue} text-white" title="\${tipoActive}">\${emoji}</a>\`;
                };

                // Calcolo step corrente
                let step = 0; // 0=niente, 1..6
                if (!isRinnovo && isSigned)                                             step = 1;
                else if (isRinnovo && !emailSent)                                       step = 2;
                else if (isRinnovo && emailSent && !isSigned)                           step = 3;
                else if (isRinnovo && isSigned && !proformaCreata)                      step = 4;
                else if (isRinnovo && isSigned && proformaCreata && !proformaInviata)   step = 5;
                else if (isRinnovo && isSigned && proformaInviata && !proformaPagata && !rinnovoCompletato) step = 6;

                const st = (n) => step > n ? 'done' : step === n ? 'active' : 'future';

                if (step === 0 && !rinnovoCompletato) {
                    azioniHtml = '<span class="text-gray-300 text-xs">—</span>';
                } else {
                    const proformaUrl = contract.proforma_rinnovo_id
                        ? \`/api/proforma/\${encodeURIComponent(contract.proforma_rinnovo_id)}/pay\`
                        : '#';
                    const dataComp = contract.rinnovo_data_completamento
                        ? new Date(contract.rinnovo_data_completamento).toLocaleDateString('it-IT') : '';

                    azioniHtml = \`<div class="flex items-center gap-1 whitespace-nowrap">
                        \${sBtn('🔄', 'Rinnovo creato', 'Crea contratto rinnovo', '—',
                            \`inviaRinnovo('\${leadIdQ}','\${codiceSafeQ}','\${clienteNomeQ}',\${ivaAgSafe},\${annoRinnovoSafe})\`,
                            rinnovoCompletato ? 'done' : st(1), 'blue')}
                        \${sBtn('📧', 'Email rinnovo inviata', 'Invia email rinnovo al cliente', '—',
                            \`inviaEmailRinnovo(\${idRinnovoSafe},'\${codiceSafeR}','\${emailClienteSafe}')\`,
                            rinnovoCompletato ? 'done' : st(2), 'orange')}
                        \${sLink('✍️', firmaUrlRinnovo, 'Rinnovo firmato', 'Apri link firma rinnovo',
                            rinnovoCompletato ? 'done' : st(3), 'indigo')}
                        \${step === 3 ? \`<button onclick="segnaRinnovoFirmato(\${idRinnovoSafe},'\${codiceSafeR}')" class="w-7 h-7 flex items-center justify-center rounded text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors" title="Segna firmato manualmente">✅</button>\` : ''}
                        \${sBtn('📋', 'Proforma creata', 'Crea proforma rinnovo', '—',
                            \`creaProformaRinnovo(\${idRinnovoSafe},'\${codiceSafeR}')\`,
                            rinnovoCompletato ? 'done' : st(4), 'violet')}
                        \${sBtn('📤', 'Proforma inviata', 'Invia proforma al cliente', '—',
                            \`inviaProformaRinnovo(\${idRinnovoSafe},'\${codiceSafeR}')\`,
                            rinnovoCompletato ? 'done' : st(5), 'violet')}
                        \${sLink('💰', proformaUrl, 'Proforma pagata', 'Paga proforma online',
                            rinnovoCompletato ? 'done' : st(6), 'green')}
                        \${rinnovoCompletato
                            ? \`<span class="ml-1 text-emerald-600 text-xs font-semibold" title="Completato \${dataComp}">✅</span>\`
                            : step === 6 ? \`<button onclick="segnaRinnovoCompletato(\${idSafe},'\${codiceSafeQ}')" class="w-7 h-7 flex items-center justify-center rounded text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors" title="Segna completato manualmente">✅</button>\` : ''}
                    </div>\`;
                }
                
                return \`
                    <tr class="border-b border-gray-100 \${rowBg}">
                        <td class="py-3 text-xs">
                            <code class="bg-gray-100 px-2 py-1 rounded">\${contract.codice_contratto || contract.id}</code>
                            \${rinnovo_badge}\${completato_badge}
                            \${isRinnovo && contract.rinnovo_di ? \`<div class="text-xs text-gray-400 mt-1">↳ \${contract.rinnovo_di}</div>\` : ''}
                        </td>
                        <td class="py-3 text-sm font-medium">
                            \${escapeHtml(contract.cliente_nome)} \${escapeHtml(contract.cliente_cognome)}
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded font-medium">
                                \${contract.servizio || contract.tipo_servizio || 'N/A'}
                            </span>
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                \${contract.piano || 'N/A'}
                            </span>
                        </td>
                        <td class="py-3 text-sm text-gray-600">\${dispositivo}</td>
                        <td class="py-3 text-sm font-bold \${isRinnovo ? 'text-green-700' : 'text-green-600'}">
                            €\${parseFloat(contract.prezzo_totale || 0).toFixed(2)}
                            \${isRinnovo ? '<div class="text-xs font-normal text-green-600">rinnovo</div>' : ''}
                        </td>
                        <td class="py-3">
                            <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                                \${contract.status || 'SENT'}
                            </span>
                        </td>
                        <td class="py-3 text-xs text-gray-500">\${date}</td>
                        <td class="py-3" title="Scadenza contratto">\${scadenzaHtml}</td>
                        <td class="py-3 text-center">
                            \${azioniHtml}
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
    </script>
</body>
</html>
`
export const workflow_manager = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Manager - TeleMedCare V12.0</title>
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="eCura">
  <meta name="theme-color" content="#1d6ab9">
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

    <div class="container mx-auto px-2 sm:px-3 lg:px-4 xl:px-6 py-8" style="max-width: 98%;">
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
                alert('❌ Errore nel caricamento archivio.\\n\\n' + error.message);
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


export const admin_setup = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Setup - TeleMedCare V12</title>
  <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180.png">
  <link rel="manifest" href="/manifest.json">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="eCura">
  <meta name="theme-color" content="#1d6ab9">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
  <style>
    .gradient-bg { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); }
    .card-hover { transition: all 0.2s ease; }
    .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    #response-box { white-space: pre-wrap; font-family: monospace; font-size: 0.8rem; }
    .danger-btn { background: #dc2626 !important; }
    .danger-btn:hover { background: #b91c1c !important; }
    .toast { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999; transition: opacity 0.4s; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">

  <!-- Header -->
  <header class="gradient-bg text-white shadow-lg">
    <div class="container mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <i class="fas fa-tools text-3xl"></i>
        <div>
          <h1 class="text-2xl font-bold">Admin Setup</h1>
          <p class="text-sm text-indigo-200">Gestione avanzata endpoint amministrativi</p>
        </div>
      </div>
      <div class="flex space-x-3">
        <a href="/admin/data-dashboard" class="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition text-sm font-medium">
          <i class="fas fa-tachometer-alt mr-1"></i>Dashboard
        </a>
        <a href="/home" class="px-4 py-2 bg-white text-indigo-700 rounded-lg hover:bg-indigo-50 transition text-sm font-medium">
          <i class="fas fa-home mr-1"></i>Home
        </a>
      </div>
    </div>
  </header>

  <main class="container mx-auto px-6 py-8 max-w-5xl">

    <!-- Token Input -->
    <div class="bg-white rounded-xl shadow-sm border-l-4 border-indigo-500 p-6 mb-8 card-hover">
      <div class="flex items-center mb-4">
        <i class="fas fa-key text-indigo-500 text-xl mr-3"></i>
        <h2 class="text-lg font-bold text-gray-800">Admin Secret Token</h2>
      </div>
      <div class="flex gap-3">
        <input
          id="admin-token"
          type="password"
          placeholder="Inserisci ADMIN_SECRET_TOKEN..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm"
        />
        <button onclick="toggleTokenVisibility()" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition">
          <i id="token-eye" class="fas fa-eye text-gray-600"></i>
        </button>
      </div>
      <p class="mt-2 text-xs text-gray-500"><i class="fas fa-shield-alt mr-1"></i>Il token non viene mai inviato al di fuori delle richieste API. Ogni richiesta usa <code>Authorization: Bearer &lt;token&gt;</code>.</p>
    </div>

    <div class="grid md:grid-cols-2 gap-6">

      <!-- ═══ SEZIONE: Diagnostica ═══ -->
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
        <h3 class="font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-stethoscope text-blue-500 mr-2"></i>Diagnostica
        </h3>
        <div class="space-y-2">
          <button onclick="apiCall('GET','/api/admin/debug-env')" class="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-800 transition font-medium">
            <i class="fas fa-eye mr-2"></i>Debug variabili ambiente
          </button>
          <button onclick="apiCall('GET','/api/admin/debug-resend')" class="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-800 transition font-medium">
            <i class="fas fa-envelope-open-text mr-2"></i>Debug servizio email Resend
          </button>
          <button onclick="apiCall('GET','/api/admin/leads-dashboard')" class="w-full text-left px-4 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-sm text-blue-800 transition font-medium">
            <i class="fas fa-chart-bar mr-2"></i>Dati leads dashboard (JSON)
          </button>
        </div>
      </div>

      <!-- ═══ SEZIONE: Inizializzazione DB ═══ -->
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
        <h3 class="font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-database text-green-500 mr-2"></i>Inizializzazione Database
        </h3>
        <div class="space-y-2">
          <button onclick="apiCall('POST','/api/admin/init-users')" class="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm text-green-800 transition font-medium">
            <i class="fas fa-users mr-2"></i>Inizializza tabella utenti
          </button>
          <button onclick="apiCall('POST','/api/admin/run-migrations')" class="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm text-green-800 transition font-medium">
            <i class="fas fa-code-branch mr-2"></i>Esegui migrazioni DB
          </button>
          <button onclick="apiCall('POST','/api/admin/init-settings')" class="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm text-green-800 transition font-medium">
            <i class="fas fa-cog mr-2"></i>Inizializza tabella settings
          </button>
          <button onclick="apiCall('POST','/api/admin/add-signature-columns')" class="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm text-green-800 transition font-medium">
            <i class="fas fa-pen-fancy mr-2"></i>Aggiungi colonne firma contratti
          </button>
          <button onclick="apiCall('POST','/api/admin/normalize-settings-values')" class="w-full text-left px-4 py-2 bg-green-50 hover:bg-green-100 rounded-lg text-sm text-green-800 transition font-medium">
            <i class="fas fa-sliders-h mr-2"></i>Normalizza valori settings
          </button>
        </div>
      </div>

      <!-- ═══ SEZIONE: Manutenzione Lead ═══ -->
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
        <h3 class="font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-user-tag text-orange-500 mr-2"></i>Manutenzione Lead
        </h3>
        <div class="space-y-2">
          <button onclick="apiCall('POST','/api/admin/fix-fonte-irbema')" class="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm text-orange-800 transition font-medium">
            <i class="fas fa-wrench mr-2"></i>Fix campo fonte IRBEMA
          </button>
          <button onclick="apiCall('POST','/api/admin/update-fonte-batch')" class="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm text-orange-800 transition font-medium">
            <i class="fas fa-layer-group mr-2"></i>Aggiornamento batch campo fonte
          </button>
          <button onclick="apiCall('POST','/api/admin/sync-form-ecura')" class="w-full text-left px-4 py-2 bg-orange-50 hover:bg-orange-100 rounded-lg text-sm text-orange-800 transition font-medium">
            <i class="fas fa-sync mr-2"></i>Sincronizza form eCura
          </button>
        </div>
      </div>

      <!-- ═══ SEZIONE: Email & Test ═══ -->
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
        <h3 class="font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-paper-plane text-purple-500 mr-2"></i>Email & Test
        </h3>
        <div class="space-y-2">
          <button onclick="apiCall('POST','/api/admin/test-email')" class="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-800 transition font-medium">
            <i class="fas fa-envelope mr-2"></i>Invia email di test
          </button>
          <button onclick="apiCallWithInput('POST','/api/admin/test-trigger/:leadId','leadId','ID del lead da testare')" class="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-800 transition font-medium">
            <i class="fas fa-bolt mr-2"></i>Test trigger per lead (richiede ID)
          </button>
          <button onclick="apiCallWithInput('POST','/api/admin/resend-completion/:leadId','leadId','ID del lead per reinvio email')" class="w-full text-left px-4 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm text-purple-800 transition font-medium">
            <i class="fas fa-redo mr-2"></i>Reinvia email completamento (richiede ID)
          </button>
        </div>
      </div>

      <!-- ═══ SEZIONE: Importazione ═══ -->
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
        <h3 class="font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-file-import text-teal-500 mr-2"></i>Importazione Dati
        </h3>
        <div class="space-y-2">
          <button onclick="apiCall('POST','/api/admin/import-interactions-json')" class="w-full text-left px-4 py-2 bg-teal-50 hover:bg-teal-100 rounded-lg text-sm text-teal-800 transition font-medium">
            <i class="fas fa-file-code mr-2"></i>Importa interazioni da JSON
          </button>
          <p class="text-xs text-gray-400 pl-2"><i class="fas fa-info-circle mr-1"></i>Import Excel richiede body multipart — usa Hoppscotch per file upload</p>
        </div>
      </div>

      <!-- ═══ SEZIONE: Cleanup ═══ -->
      <div class="bg-white rounded-xl shadow-sm p-6 card-hover">
        <h3 class="font-bold text-gray-700 mb-4 flex items-center">
          <i class="fas fa-broom text-yellow-600 mr-2"></i>Cleanup Dati di Test
        </h3>
        <div class="space-y-2">
          <button onclick="apiCall('POST','/api/admin/cleanup-test-leads')" class="w-full text-left px-4 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-sm text-yellow-800 transition font-medium">
            <i class="fas fa-trash-alt mr-2"></i>Rimuovi lead di test
          </button>
          <button onclick="apiCall('POST','/api/admin/fix-test-leads')" class="w-full text-left px-4 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-sm text-yellow-800 transition font-medium">
            <i class="fas fa-tools mr-2"></i>Ripara lead di test
          </button>
          <button onclick="apiCall('POST','/api/admin/restore-real-leads')" class="w-full text-left px-4 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-sm text-yellow-800 transition font-medium">
            <i class="fas fa-history mr-2"></i>Ripristina lead reali
          </button>
          <button onclick="apiCall('POST','/api/admin/cleanup-test-data')" class="w-full text-left px-4 py-2 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-sm text-yellow-800 transition font-medium">
            <i class="fas fa-eraser mr-2"></i>Rimuovi tutti dati di test
          </button>
        </div>
      </div>

      <!-- ═══ SEZIONE: Azioni Distruttive ═══ -->
      <div class="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500 card-hover md:col-span-2">
        <h3 class="font-bold text-red-700 mb-2 flex items-center">
          <i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>Azioni Distruttive — Irreversibili
        </h3>
        <p class="text-xs text-red-600 mb-4">Queste operazioni cancellano dati in modo permanente. Usare con estrema cautela.</p>
        <div class="flex flex-wrap gap-3">
          <button onclick="confirmAndCall('POST','/api/admin/reset-and-regenerate','Conferma RESET COMPLETO e rigenerazione del sistema?')"
            class="danger-btn px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition">
            <i class="fas fa-sync-alt mr-2"></i>Reset &amp; Rigenera
          </button>
          <button onclick="confirmAndCall('POST','/api/admin/clear-database','Conferma SVUOTAMENTO del database? Tutti i dati saranno eliminati.')"
            class="danger-btn px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold transition">
            <i class="fas fa-bomb mr-2"></i>Svuota Database
          </button>
        </div>
      </div>

    </div>

    <!-- Response Box -->
    <div class="mt-8 bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold text-gray-700 flex items-center">
          <i class="fas fa-terminal text-gray-500 mr-2"></i>Risposta API
        </h3>
        <div class="flex items-center gap-3">
          <span id="response-status" class="text-xs font-bold px-2 py-1 rounded hidden"></span>
          <button onclick="clearResponse()" class="text-xs text-gray-400 hover:text-gray-600 transition">
            <i class="fas fa-times mr-1"></i>Pulisci
          </button>
        </div>
      </div>
      <div id="response-box" class="bg-gray-900 text-green-400 rounded-lg p-4 min-h-24 text-xs overflow-auto max-h-96">
        <span class="text-gray-500">// In attesa di una richiesta...</span>
      </div>
    </div>

  </main>

  <!-- Toast -->
  <div id="toast" class="toast hidden">
    <div id="toast-inner" class="px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium"></div>
  </div>

  <script>
    function getToken() {
      return document.getElementById('admin-token').value.trim();
    }

    function toggleTokenVisibility() {
      const input = document.getElementById('admin-token');
      const eye = document.getElementById('token-eye');
      if (input.type === 'password') {
        input.type = 'text';
        eye.classList.replace('fa-eye', 'fa-eye-slash');
      } else {
        input.type = 'password';
        eye.classList.replace('fa-eye-slash', 'fa-eye');
      }
    }

    function showToast(msg, isError) {
      const toast = document.getElementById('toast');
      const inner = document.getElementById('toast-inner');
      inner.textContent = msg;
      inner.className = 'px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium ' + (isError ? 'bg-red-600' : 'bg-green-600');
      toast.classList.remove('hidden');
      toast.style.opacity = '1';
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.classList.add('hidden'), 400);
      }, 3000);
    }

    function setResponseBox(text, status) {
      const box = document.getElementById('response-box');
      const badge = document.getElementById('response-status');
      box.textContent = text;
      badge.classList.remove('hidden', 'bg-green-100', 'text-green-700', 'bg-red-100', 'text-red-700');
      if (status >= 200 && status < 300) {
        badge.className = 'text-xs font-bold px-2 py-1 rounded bg-green-100 text-green-700';
        badge.textContent = status + ' OK';
        box.className = 'bg-gray-900 text-green-400 rounded-lg p-4 min-h-24 text-xs overflow-auto max-h-96';
      } else {
        badge.className = 'text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-700';
        badge.textContent = status + ' ERR';
        box.className = 'bg-gray-900 text-red-400 rounded-lg p-4 min-h-24 text-xs overflow-auto max-h-96';
      }
    }

    function clearResponse() {
      const box = document.getElementById('response-box');
      const badge = document.getElementById('response-status');
      box.textContent = '// In attesa di una richiesta...';
      box.className = 'bg-gray-900 text-green-400 rounded-lg p-4 min-h-24 text-xs overflow-auto max-h-96';
      badge.classList.add('hidden');
    }

    async function apiCall(method, path, body) {
      const token = getToken();
      if (!token) {
        showToast('⚠️ Inserisci prima il token admin', true);
        document.getElementById('admin-token').focus();
        return;
      }
      setResponseBox('// Richiesta in corso...', 200);
      try {
        const opts = {
          method,
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(path, opts);
        const text = await res.text();
        let pretty = text;
        try { pretty = JSON.stringify(JSON.parse(text), null, 2); } catch(_) {}
        setResponseBox(pretty, res.status);
        showToast(res.ok ? '✅ Richiesta completata (' + res.status + ')' : '❌ Errore ' + res.status, !res.ok);
      } catch(e) {
        setResponseBox('// Errore di rete: ' + e.message, 500);
        showToast('❌ Errore di rete', true);
      }
    }

    async function apiCallWithInput(method, pathTemplate, paramName, promptText) {
      const value = window.prompt(promptText);
      if (!value) return;
      const path = pathTemplate.replace(':' + paramName, encodeURIComponent(value));
      await apiCall(method, path);
    }

    async function confirmAndCall(method, path, confirmMsg) {
      if (!window.confirm(confirmMsg)) return;
      await apiCall(method, path);
    }
  </script>
</body>
</html>
`
