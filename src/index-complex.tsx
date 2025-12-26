import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// Import moduli funzionanti
import * as Utils from './modules/utils'
import * as Logging from './modules/logging'
import EnvironmentManager from './modules/environment-manager'
import DocumentationManager from './modules/documentation-manager'

type Bindings = {
  DB: D1Database
  KV?: KVNamespace
  R2?: R2Bucket
  EMAIL_API_KEY?: string
  CLOUDFLARE_API_TOKEN?: string
  JWT_SECRET?: string
}

// Configurazione TeleMedCare V12.0 
const CONFIG = {
  EMAIL_FROM: 'noreply@medicagb.it',
  EMAIL_TO_INFO: 'info@medicagb.it', 
  COMPANY_NAME: 'Medica GB S.r.l.',
  SYSTEM_VERSION: 'V12.0-Modular-Enterprise'
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS per API
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/*', serveStatic({ root: './public' }))

// ========== HOMEPAGE E ROUTING BASE ==========
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TeleMedCare V12.0 - Sistema di Gestione Lead e Assistiti</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <!-- Header con Menu Navigazione -->
            <header class="bg-white shadow-sm border-b">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-4">
                        <!-- Logo e Brand -->
                        <div class="flex items-center space-x-3">
                            <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <i class="fas fa-heartbeat text-white text-sm"></i>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold text-gray-900">TeleMedCare</h1>
                                <p class="text-xs text-gray-500">V12.0 Multi-Environment</p>
                            </div>
                        </div>

                        <!-- Menu di Navigazione -->
                        <nav class="hidden md:flex items-center space-x-6">
                            <a href="/" class="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                <i class="fas fa-tachometer-alt mr-1"></i> Dashboard
                            </a>
                            <a href="/leads" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                <i class="fas fa-users mr-1"></i> Lead
                            </a>
                            <a href="/assistiti" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                <i class="fas fa-user-check mr-1"></i> Assistiti
                            </a>
                            <a href="/analytics" class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                <i class="fas fa-chart-bar mr-1"></i> Analytics
                            </a>
                            
                            <!-- Dropdown Admin -->
                            <div class="relative group">
                                <button class="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center">
                                    <i class="fas fa-cogs mr-1"></i> Admin
                                    <i class="fas fa-chevron-down ml-1 text-xs"></i>
                                </button>
                                <div class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div class="py-1">
                                        <a href="/admin/environments" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <i class="fas fa-server w-4 mr-3 text-gray-400"></i>
                                            Gestione Ambienti
                                        </a>
                                        <a href="/admin/docs" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <i class="fas fa-book w-4 mr-3 text-gray-400"></i>
                                            Documentazione
                                        </a>
                                        <div class="border-t border-gray-100"></div>
                                        <a href="/admin/config" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <i class="fas fa-sliders-h w-4 mr-3 text-gray-400"></i>
                                            Configurazioni
                                        </a>
                                        <a href="/admin/users" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <i class="fas fa-users-cog w-4 mr-3 text-gray-400"></i>
                                            Gestione Utenti
                                        </a>
                                        <a href="/admin/logs" class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            <i class="fas fa-file-alt w-4 mr-3 text-gray-400"></i>
                                            Log Sistema
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </nav>

                        <!-- Status e Mobile Menu -->
                        <div class="flex items-center space-x-4">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span class="w-2 h-2 bg-green-400 rounded-full mr-1.5"></span>
                                Sistema Attivo
                            </span>
                            
                            <!-- Mobile menu button -->
                            <button class="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900" onclick="toggleMobileMenu()">
                                <i class="fas fa-bars"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Mobile Menu -->
                    <div id="mobile-menu" class="md:hidden hidden border-t border-gray-200 pt-4 pb-3 space-y-1">
                        <a href="/" class="bg-blue-50 text-blue-600 block px-3 py-2 rounded-md text-base font-medium">
                            <i class="fas fa-tachometer-alt mr-2"></i> Dashboard
                        </a>
                        <a href="/leads" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                            <i class="fas fa-users mr-2"></i> Lead
                        </a>
                        <a href="/assistiti" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                            <i class="fas fa-user-check mr-2"></i> Assistiti
                        </a>
                        <a href="/analytics" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                            <i class="fas fa-chart-bar mr-2"></i> Analytics
                        </a>
                        
                        <div class="border-t border-gray-200 pt-2">
                            <p class="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
                            <a href="/admin/environments" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                                <i class="fas fa-server mr-2"></i> Gestione Ambienti
                            </a>
                            <a href="/admin/docs" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                                <i class="fas fa-book mr-2"></i> Documentazione
                            </a>
                            <a href="/admin/config" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                                <i class="fas fa-sliders-h mr-2"></i> Configurazioni
                            </a>
                            <a href="/admin/users" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                                <i class="fas fa-users-cog mr-2"></i> Gestione Utenti
                            </a>
                            <a href="/admin/logs" class="text-gray-600 hover:bg-gray-50 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium">
                                <i class="fas fa-file-alt mr-2"></i> Log Sistema
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Main Content -->
            <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <!-- Dashboard Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <div class="flex items-center">
                            <div class="p-2 bg-blue-100 rounded-md">
                                <i class="fas fa-users text-blue-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Lead Attivi</p>
                                <p class="text-2xl font-bold text-gray-900">--</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <div class="flex items-center">
                            <div class="p-2 bg-green-100 rounded-md">
                                <i class="fas fa-user-check text-green-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Assistiti</p>
                                <p class="text-2xl font-bold text-gray-900">--</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <div class="flex items-center">
                            <div class="p-2 bg-yellow-100 rounded-md">
                                <i class="fas fa-envelope text-yellow-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Email Oggi</p>
                                <p class="text-2xl font-bold text-gray-900">--</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <div class="flex items-center">
                            <div class="p-2 bg-purple-100 rounded-md">
                                <i class="fas fa-chart-line text-purple-600"></i>
                            </div>
                            <div class="ml-4">
                                <p class="text-sm font-medium text-gray-600">Conversion Rate</p>
                                <p class="text-2xl font-bold text-gray-900">--%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Links -->
                <div class="bg-white rounded-lg shadow-sm border p-6">
                    <h2 class="text-lg font-medium text-gray-900 mb-4">Accesso Rapido</h2>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <a href="/leads" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <i class="fas fa-user-plus text-blue-600 mr-3"></i>
                            <span class="text-sm font-medium">Gestione Lead</span>
                        </a>
                        <a href="/assistiti" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <i class="fas fa-users text-green-600 mr-3"></i>
                            <span class="text-sm font-medium">Assistiti</span>
                        </a>
                        <a href="/admin/environments" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <i class="fas fa-cogs text-purple-600 mr-3"></i>
                            <span class="text-sm font-medium">Ambienti</span>
                        </a>
                        <a href="/admin/docs" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <i class="fas fa-book text-orange-600 mr-3"></i>
                            <span class="text-sm font-medium">Documentazione</span>
                        </a>
                    </div>
                </div>
            </main>
        </div>

        <script>
        function toggleMobileMenu() {
            const mobileMenu = document.getElementById("mobile-menu");
            if (mobileMenu.classList.contains("hidden")) {
                mobileMenu.classList.remove("hidden");
            } else {
                mobileMenu.classList.add("hidden");
            }
        }

        document.querySelectorAll("#mobile-menu a").forEach(link => {
            link.addEventListener("click", () => {
                document.getElementById("mobile-menu").classList.add("hidden");
            });
        });
        </script>
    </body>
    </html>
  `)
})

// ========== SEZIONI PRINCIPALI ==========
app.get('/leads', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestione Lead - TeleMedCare V12.0</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-users text-blue-600 mr-2"></i>
                        Gestione Lead
                    </h1>
                    <p class="text-gray-600 mb-6">Sistema completo per la gestione dei lead aziendali</p>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-construction text-yellow-600 mt-0.5 mr-2"></i>
                            <div>
                                <h3 class="text-sm font-medium text-yellow-800">Modulo in Sviluppo</h3>
                                <p class="text-sm text-yellow-700 mt-1">
                                    L'interfaccia completa per la gestione lead è in fase di implementazione. 
                                    Le API sono già disponibili e funzionanti.
                                </p>
                                <div class="mt-3">
                                    <a href="/" class="text-sm text-yellow-800 hover:text-yellow-600 font-medium">
                                        ← Torna alla Dashboard
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

app.get('/assistiti', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestione Assistiti - TeleMedCare V12.0</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-user-check text-green-600 mr-2"></i>
                        Gestione Assistiti
                    </h1>
                    <p class="text-gray-600 mb-6">Registro completo pazienti e storico clinico</p>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-construction text-yellow-600 mt-0.5 mr-2"></i>
                            <div>
                                <h3 class="text-sm font-medium text-yellow-800">Modulo in Sviluppo</h3>
                                <p class="text-sm text-yellow-700 mt-1">
                                    L'interfaccia per la gestione assistiti è in fase di implementazione.
                                    Include: anagrafica, storico clinico, appuntamenti e documenti.
                                </p>
                                <div class="mt-3">
                                    <a href="/" class="text-sm text-yellow-800 hover:text-yellow-600 font-medium">
                                        ← Torna alla Dashboard
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

app.get('/analytics', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Analytics - TeleMedCare V12.0</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-chart-bar text-purple-600 mr-2"></i>
                        Analytics e Reporting
                    </h1>
                    <p class="text-gray-600 mb-6">Dashboard real-time con metriche chiave e report personalizzabili</p>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-construction text-yellow-600 mt-0.5 mr-2"></i>
                            <div>
                                <h3 class="text-sm font-medium text-yellow-800">Modulo in Sviluppo</h3>
                                <p class="text-sm text-yellow-700 mt-1">
                                    Dashboard analytics avanzato in implementazione.
                                    Includerà: metriche real-time, grafici interattivi, export automatizzati.
                                </p>
                                <div class="mt-3">
                                    <a href="/" class="text-sm text-yellow-800 hover:text-yellow-600 font-medium">
                                        ← Torna alla Dashboard
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

// ========== ADMIN ENVIRONMENTS ==========
app.get('/admin/environments', (c) => {
  return c.redirect('/admin-environments.html')
})

app.get('/admin/docs', (c) => {
  return c.redirect('/admin-docs.html')
})

app.get('/admin/config', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Configurazioni - TeleMedCare V12.0</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-sliders-h text-gray-600 mr-2"></i>
                        Configurazioni Sistema
                    </h1>
                    <p class="text-gray-600 mb-6">Gestione configurazioni partner, convenzioni e parametri sistema</p>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-info-circle text-blue-600 mt-0.5 mr-2"></i>
                            <div>
                                <h3 class="text-sm font-medium text-blue-800">Sezione Admin</h3>
                                <p class="text-sm text-blue-700 mt-1">
                                    Pannello configurazioni avanzate. Include gestione partner, 
                                    configurazioni dinamiche, versioning system.
                                </p>
                                <div class="mt-3 space-x-4">
                                    <a href="/admin/environments" class="text-sm text-blue-800 hover:text-blue-600 font-medium">
                                        Gestione Ambienti →
                                    </a>
                                    <a href="/admin/docs" class="text-sm text-blue-800 hover:text-blue-600 font-medium">
                                        Documentazione →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

app.get('/admin/users', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestione Utenti - TeleMedCare V12.0</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-users-cog text-indigo-600 mr-2"></i>
                        Gestione Utenti
                    </h1>
                    <p class="text-gray-600 mb-6">Amministrazione utenti, ruoli e permessi</p>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-shield-alt text-blue-600 mt-0.5 mr-2"></i>
                            <div>
                                <h3 class="text-sm font-medium text-blue-800">Sicurezza e Accessi</h3>
                                <p class="text-sm text-blue-700 mt-1">
                                    Pannello sicurezza: gestione utenti, ruoli RBAC, audit trail, 
                                    autenticazione JWT, autorizzazioni granulari.
                                </p>
                                <div class="mt-3">
                                    <a href="/admin/environments" class="text-sm text-blue-800 hover:text-blue-600 font-medium">
                                        ← Torna alle Configurazioni Admin
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

app.get('/admin/logs', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Log Sistema - TeleMedCare V12.0</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">
                        <i class="fas fa-file-alt text-orange-600 mr-2"></i>
                        Log Sistema
                    </h1>
                    <p class="text-gray-600 mb-6">Monitoraggio real-time e analisi log sistema</p>
                    
                    <div class="bg-green-50 border border-green-200 rounded-md p-4">
                        <div class="flex">
                            <i class="fas fa-eye text-green-600 mt-0.5 mr-2"></i>
                            <div>
                                <h3 class="text-sm font-medium text-green-800">Monitoring Attivo</h3>
                                <p class="text-sm text-green-700 mt-1">
                                    Sistema di logging completo: error tracking, performance metrics, 
                                    audit trail, alerts configurabili.
                                </p>
                                <div class="mt-3 space-x-4">
                                    <a href="/api/health" class="text-sm text-green-800 hover:text-green-600 font-medium">
                                        Health Check API →
                                    </a>
                                    <a href="/api/version" class="text-sm text-green-800 hover:text-green-600 font-medium">
                                        Version Info →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
  `)
})

// ========== API ENVIRONMENT MANAGER ==========
app.get('/api/environment/status', async (c) => {
  try {
    const envManager = new EnvironmentManager(c.env.DB, c.env.CLOUDFLARE_API_TOKEN || '')
    const status = await envManager.getEnvironmentStatus()
    return c.json({ success: true, status })
  } catch (error) {
    return c.json({ success: false, error: 'Errore recupero status ambienti' }, 500)
  }
})

app.post('/api/environment/create-production', async (c) => {
  try {
    const envManager = new EnvironmentManager(c.env.DB, c.env.CLOUDFLARE_API_TOKEN || '')
    const result = await envManager.createProductionEnvironment()
    return c.json({ success: true, result })
  } catch (error) {
    return c.json({ success: false, error: 'Errore creazione ambiente produzione' }, 500)
  }
})

app.post('/api/environment/create-test', async (c) => {
  try {
    const { version } = await c.req.json()
    const envManager = new EnvironmentManager(c.env.DB, c.env.CLOUDFLARE_API_TOKEN || '')
    const result = await envManager.createTestEnvironment(version)
    return c.json({ success: true, result })
  } catch (error) {
    return c.json({ success: false, error: 'Errore creazione ambiente test' }, 500)
  }
})

app.post('/api/environment/clone', async (c) => {
  try {
    const options = await c.req.json()
    const envManager = new EnvironmentManager(c.env.DB, c.env.CLOUDFLARE_API_TOKEN || '')
    const result = await envManager.cloneEnvironment(options)
    return c.json({ success: true, result })
  } catch (error) {
    return c.json({ success: false, error: 'Errore clonazione ambiente' }, 500)
  }
})

app.post('/api/environment/deploy-production', async (c) => {
  try {
    const envManager = new EnvironmentManager(c.env.DB, c.env.CLOUDFLARE_API_TOKEN || '')
    const result = await envManager.deployToProduction()
    return c.json({ success: true, result })
  } catch (error) {
    return c.json({ success: false, error: 'Errore deploy produzione' }, 500)
  }
})

// ========== API DOCUMENTATION MANAGER ==========
app.get('/api/docs/categories', async (c) => {
  try {
    const docsManager = new DocumentationManager(c.env.DB)
    const categories = await docsManager.getDocumentationCategories()
    return c.json({ success: true, categories })
  } catch (error) {
    return c.json({ success: false, error: 'Errore recupero categorie documentazione' }, 500)
  }
})

app.get('/api/docs/index', async (c) => {
  try {
    const docsManager = new DocumentationManager(c.env.DB)
    const index = await docsManager.getDocumentationIndex()
    return c.json({ success: true, index })
  } catch (error) {
    return c.json({ success: false, error: 'Errore recupero indice documentazione' }, 500)
  }
})

app.get('/api/docs/section/:category', async (c) => {
  try {
    const category = c.req.param('category')
    const docsManager = new DocumentationManager(c.env.DB)
    const section = await docsManager.getDocumentationSection(category)
    return c.json({ success: true, section })
  } catch (error) {
    return c.json({ success: false, error: 'Errore recupero sezione documentazione' }, 500)
  }
})

app.put('/api/docs/section/:category', async (c) => {
  try {
    const category = c.req.param('category')
    const sectionData = await c.req.json()
    const docsManager = new DocumentationManager(c.env.DB)
    const result = await docsManager.saveDocumentationSection({
      category,
      ...sectionData
    })
    return c.json({ success: result })
  } catch (error) {
    return c.json({ success: false, error: 'Errore salvataggio sezione documentazione' }, 500)
  }
})

app.post('/api/docs/generate-system', async (c) => {
  try {
    const docsManager = new DocumentationManager(c.env.DB)
    const result = await docsManager.generateSystemDocumentation()
    return c.json({ success: true, generated: result })
  } catch (error) {
    return c.json({ success: false, error: 'Errore generazione documentazione sistema' }, 500)
  }
})

// ========== API UTILITIES ==========
app.get('/api/health', async (c) => {
  try {
    const timestamp = new Date().toISOString()
    return c.json({
      success: true,
      system: 'TeleMedCare V12.0',
      status: 'healthy',
      timestamp,
      environment: 'development'
    })
  } catch (error) {
    return c.json({ success: false, error: 'Health check failed' }, 500)
  }
})

app.get('/api/version', (c) => {
  return c.json({
    success: true,
    version: CONFIG.SYSTEM_VERSION,
    name: CONFIG.COMPANY_NAME,
    build: new Date().toISOString()
  })
})

// Error handler
app.onError((err, c) => {
  console.error('Application error:', err)
  return c.json({
    success: false,
    error: 'Errore interno del server',
    timestamp: new Date().toISOString()
  }, 500)
})

// 404 handler  
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint non trovato',
    path: c.req.path,
    method: c.req.method
  }, 404)
})

export default app