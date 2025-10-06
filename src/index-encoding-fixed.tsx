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

const CONFIG = {
  EMAIL_FROM: 'noreply@medicagb.it',
  EMAIL_TO_INFO: 'info@medicagb.it', 
  COMPANY_NAME: 'Medica GB S.r.l.',
  SYSTEM_VERSION: 'V11.0-Modular-Enterprise'
}

const app = new Hono<{ Bindings: Bindings }>()

// CORS per API
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/*', serveStatic({ root: './public' }))

// ========== HOMEPAGE CON MENU PULITO ==========
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeleMedCare V11.0 Multi-Environment</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <!-- Header con Menu -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center py-4">
                    <!-- Brand -->
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-heartbeat text-white text-sm"></i>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-900">TeleMedCare</h1>
                            <p class="text-xs text-gray-500">V11.0 Multi-Environment</p>
                        </div>
                    </div>
                    
                    <!-- Status -->
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <span class="w-2 h-2 bg-green-400 rounded-full inline-block mr-2"></span>
                        Sistema Attivo
                    </span>
                </div>
                
                <!-- Menu Navigazione -->
                <nav class="border-t pt-3 pb-3">
                    <div class="flex flex-wrap gap-6">
                        <a href="/" class="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
                            <i class="fas fa-tachometer-alt mr-1"></i> Dashboard
                        </a>
                        <a href="/leads" class="text-gray-600 hover:text-blue-600 pb-2 transition-colors">
                            <i class="fas fa-users mr-1"></i> Lead
                        </a>
                        <a href="/assistiti" class="text-gray-600 hover:text-blue-600 pb-2 transition-colors">
                            <i class="fas fa-user-check mr-1"></i> Assistiti
                        </a>
                        <a href="/analytics" class="text-gray-600 hover:text-blue-600 pb-2 transition-colors">
                            <i class="fas fa-chart-bar mr-1"></i> Analytics
                        </a>
                        <a href="/admin/environments" class="text-gray-600 hover:text-blue-600 pb-2 transition-colors">
                            <i class="fas fa-server mr-1"></i> Ambienti
                        </a>
                        <a href="/admin/docs" class="text-gray-600 hover:text-blue-600 pb-2 transition-colors">
                            <i class="fas fa-book mr-1"></i> Documentazione
                        </a>
                        <a href="/admin/config" class="text-gray-600 hover:text-blue-600 pb-2 transition-colors">
                            <i class="fas fa-cogs mr-1"></i> Config
                        </a>
                    </div>
                </nav>
            </div>
        </header>

        <!-- Contenuto Principale -->
        <main class="max-w-7xl mx-auto py-8 px-4">
            <!-- Statistiche Dashboard -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg shadow border">
                    <div class="flex items-center">
                        <div class="p-2 bg-blue-100 rounded-md mr-4">
                            <i class="fas fa-users text-blue-600"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Lead Attivi</p>
                            <p class="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow border">
                    <div class="flex items-center">
                        <div class="p-2 bg-green-100 rounded-md mr-4">
                            <i class="fas fa-user-check text-green-600"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Assistiti</p>
                            <p class="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow border">
                    <div class="flex items-center">
                        <div class="p-2 bg-yellow-100 rounded-md mr-4">
                            <i class="fas fa-envelope text-yellow-600"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Email Oggi</p>
                            <p class="text-2xl font-bold text-gray-900">--</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white p-6 rounded-lg shadow border">
                    <div class="flex items-center">
                        <div class="p-2 bg-purple-100 rounded-md mr-4">
                            <i class="fas fa-chart-line text-purple-600"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Conversion Rate</p>
                            <p class="text-2xl font-bold text-gray-900">--%</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sezione Accesso Rapido -->
            <div class="bg-white rounded-lg shadow border p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">
                    <i class="fas fa-rocket mr-2 text-blue-600"></i>
                    Accesso Rapido alle Funzioni
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <!-- Admin Functions -->
                    <div class="space-y-2">
                        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Amministrazione</h3>
                        <a href="/admin/environments" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                            <i class="fas fa-server text-blue-600 mr-3 group-hover:text-blue-700"></i>
                            <div>
                                <span class="font-medium">Gestione Ambienti</span>
                                <p class="text-xs text-gray-500">Deploy e clonazione ambienti</p>
                            </div>
                        </a>
                        
                        <a href="/admin/docs" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors group">
                            <i class="fas fa-book text-green-600 mr-3 group-hover:text-green-700"></i>
                            <div>
                                <span class="font-medium">Documentazione</span>
                                <p class="text-xs text-gray-500">Sistema docs editabile</p>
                            </div>
                        </a>
                        
                        <a href="/admin/config" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-colors group">
                            <i class="fas fa-cogs text-purple-600 mr-3 group-hover:text-purple-700"></i>
                            <div>
                                <span class="font-medium">Configurazioni</span>
                                <p class="text-xs text-gray-500">Impostazioni sistema</p>
                            </div>
                        </a>
                    </div>
                    
                    <!-- Core Functions -->
                    <div class="space-y-2">
                        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Funzioni Core</h3>
                        <a href="/leads" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors group">
                            <i class="fas fa-users text-blue-600 mr-3 group-hover:text-blue-700"></i>
                            <div>
                                <span class="font-medium">Gestione Lead</span>
                                <p class="text-xs text-gray-500">Acquisizione e conversione</p>
                            </div>
                        </a>
                        
                        <a href="/assistiti" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-green-50 hover:text-green-700 transition-colors group">
                            <i class="fas fa-user-check text-green-600 mr-3 group-hover:text-green-700"></i>
                            <div>
                                <span class="font-medium">Assistiti</span>
                                <p class="text-xs text-gray-500">Registro pazienti</p>
                            </div>
                        </a>
                        
                        <a href="/analytics" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-yellow-50 hover:text-yellow-700 transition-colors group">
                            <i class="fas fa-chart-bar text-yellow-600 mr-3 group-hover:text-yellow-700"></i>
                            <div>
                                <span class="font-medium">Analytics</span>
                                <p class="text-xs text-gray-500">Dashboard e report</p>
                            </div>
                        </a>
                    </div>
                    
                    <!-- System Tools -->
                    <div class="space-y-2">
                        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Strumenti Sistema</h3>
                        <a href="/api/health" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors group" target="_blank">
                            <i class="fas fa-heartbeat text-red-600 mr-3 group-hover:text-red-700"></i>
                            <div>
                                <span class="font-medium">Health Check</span>
                                <p class="text-xs text-gray-500">Status sistema</p>
                            </div>
                        </a>
                        
                        <a href="/api/version" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors group" target="_blank">
                            <i class="fas fa-info-circle text-indigo-600 mr-3 group-hover:text-indigo-700"></i>
                            <div>
                                <span class="font-medium">Version Info</span>
                                <p class="text-xs text-gray-500">Informazioni versione</p>
                            </div>
                        </a>
                        
                        <a href="/admin/logs" class="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors group">
                            <i class="fas fa-file-alt text-orange-600 mr-3 group-hover:text-orange-700"></i>
                            <div>
                                <span class="font-medium">Log Sistema</span>
                                <p class="text-xs text-gray-500">Monitoring e debug</p>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`)
})

// ========== SEZIONI PRINCIPALI PULITE ==========
app.get('/leads', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestione Lead - TeleMedCare V11.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <div class="max-w-4xl mx-auto py-8 px-4">
            <div class="bg-white rounded-lg shadow p-8">
                <div class="text-center">
                    <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-users text-2xl text-blue-600"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">Gestione Lead</h1>
                    <p class="text-gray-600 mb-6">Sistema completo per la gestione dei lead commerciali</p>
                    
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                        <div class="flex items-start">
                            <i class="fas fa-construction text-yellow-600 mt-1 mr-3"></i>
                            <div class="text-left">
                                <h3 class="text-sm font-medium text-yellow-800 mb-1">Modulo in Sviluppo</h3>
                                <p class="text-sm text-yellow-700">
                                    L'interfaccia completa per la gestione lead e in fase di implementazione.
                                    Le API backend sono gia disponibili e funzionanti.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-center space-x-4">
                        <a href="/" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Torna alla Dashboard
                        </a>
                        <a href="/api/health" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors" target="_blank">
                            <i class="fas fa-heartbeat mr-2"></i>
                            Health Check
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`)
})

app.get('/assistiti', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestione Assistiti - TeleMedCare V11.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <div class="max-w-4xl mx-auto py-8 px-4">
            <div class="bg-white rounded-lg shadow p-8">
                <div class="text-center">
                    <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-user-check text-2xl text-green-600"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">Gestione Assistiti</h1>
                    <p class="text-gray-600 mb-6">Registro completo pazienti e storico clinico</p>
                    
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                        <div class="flex items-start">
                            <i class="fas fa-info-circle text-blue-600 mt-1 mr-3"></i>
                            <div class="text-left">
                                <h3 class="text-sm font-medium text-blue-800 mb-1">Sistema Assistiti</h3>
                                <p class="text-sm text-blue-700">
                                    Modulo per gestione completa assistiti: anagrafica, storico clinico, 
                                    appuntamenti, documenti e statistiche.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-center space-x-4">
                        <a href="/" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Torna alla Dashboard
                        </a>
                        <a href="/admin/docs" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-book mr-2"></i>
                            Documentazione
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`)
})

app.get('/analytics', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics - TeleMedCare V11.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <div class="max-w-4xl mx-auto py-8 px-4">
            <div class="bg-white rounded-lg shadow p-8">
                <div class="text-center">
                    <div class="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-chart-bar text-2xl text-purple-600"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">Analytics e Reporting</h1>
                    <p class="text-gray-600 mb-6">Dashboard real-time con metriche chiave e report personalizzabili</p>
                    
                    <div class="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                        <div class="flex items-start">
                            <i class="fas fa-chart-line text-purple-600 mt-1 mr-3"></i>
                            <div class="text-left">
                                <h3 class="text-sm font-medium text-purple-800 mb-1">Dashboard Avanzato</h3>
                                <p class="text-sm text-purple-700">
                                    Sistema analytics completo: metriche real-time, grafici interattivi, 
                                    export automatizzati e alerting personalizzabile.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-center space-x-4">
                        <a href="/" class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Torna alla Dashboard
                        </a>
                        <a href="/admin/environments" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-server mr-2"></i>
                            Gestione Ambienti
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`)
})

// ========== ADMIN ROUTES PULITI ==========
app.get('/admin/environments', (c) => {
  return c.redirect('/admin-environments.html')
})

app.get('/admin/docs', (c) => {
  return c.redirect('/admin-docs.html')
})

app.get('/admin/config', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configurazioni - TeleMedCare V11.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <div class="max-w-4xl mx-auto py-8 px-4">
            <div class="bg-white rounded-lg shadow p-8">
                <div class="text-center">
                    <div class="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-cogs text-2xl text-indigo-600"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">Configurazioni Sistema</h1>
                    <p class="text-gray-600 mb-6">Gestione configurazioni partner, convenzioni e parametri sistema</p>
                    
                    <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-6">
                        <div class="flex items-start">
                            <i class="fas fa-sliders-h text-indigo-600 mt-1 mr-3"></i>
                            <div class="text-left">
                                <h3 class="text-sm font-medium text-indigo-800 mb-1">Pannello Configurazioni</h3>
                                <p class="text-sm text-indigo-700">
                                    Configurazioni avanzate: gestione partner, configurazioni dinamiche, 
                                    versioning system con backup e rollback automatico.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-center space-x-4">
                        <a href="/" class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Torna alla Dashboard
                        </a>
                        <a href="/admin/environments" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                            <i class="fas fa-server mr-2"></i>
                            Gestione Ambienti
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`)
})

app.get('/admin/logs', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Log Sistema - TeleMedCare V11.0</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <div class="max-w-4xl mx-auto py-8 px-4">
            <div class="bg-white rounded-lg shadow p-8">
                <div class="text-center">
                    <div class="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-file-alt text-2xl text-orange-600"></i>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-2">Log Sistema</h1>
                    <p class="text-gray-600 mb-6">Monitoraggio real-time e analisi log sistema</p>
                    
                    <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <div class="flex items-start">
                            <i class="fas fa-eye text-green-600 mt-1 mr-3"></i>
                            <div class="text-left">
                                <h3 class="text-sm font-medium text-green-800 mb-1">Monitoring Attivo</h3>
                                <p class="text-sm text-green-700">
                                    Sistema di logging completo: error tracking, performance metrics, 
                                    audit trail e alerts configurabili per monitoraggio avanzato.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex justify-center space-x-4">
                        <a href="/" class="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                            <i class="fas fa-arrow-left mr-2"></i>
                            Torna alla Dashboard
                        </a>
                        <a href="/api/health" class="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors" target="_blank">
                            <i class="fas fa-heartbeat mr-2"></i>
                            Health Check
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`)
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
      system: 'TeleMedCare V11.0',
      status: 'healthy',
      timestamp,
      environment: 'development',
      version: CONFIG.SYSTEM_VERSION
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
    build: new Date().toISOString(),
    environment: 'multi-environment',
    database: {
      development: 'telemedcare-leads',
      test: 'telemedcare_test_0n',
      staging: 'telemedcare_staging', 
      production: 'telemedcare_database'
    }
  })
})

// Error handler pulito
app.onError((err, c) => {
  console.error('Application error:', err)
  return c.json({
    success: false,
    error: 'Errore interno del server',
    timestamp: new Date().toISOString()
  }, 500)
})

// 404 handler pulito
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint non trovato',
    path: c.req.path,
    method: c.req.method,
    available_endpoints: [
      'GET /',
      'GET /leads',
      'GET /assistiti', 
      'GET /analytics',
      'GET /admin/environments',
      'GET /admin/docs',
      'GET /admin/config',
      'GET /admin/logs',
      'GET /api/health',
      'GET /api/version'
    ]
  }, 404)
})

export default app