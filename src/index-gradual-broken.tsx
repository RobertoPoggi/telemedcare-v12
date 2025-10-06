import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// CORS per API
app.use('/api/*', cors())

// Serve static files from public directory
app.use('/*', serveStatic({ root: './public' }))

// ========== HOMEPAGE CON MENU COMPLETO ==========
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
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between items-center py-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-heartbeat text-white text-sm"></i>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-gray-900">TeleMedCare</h1>
                            <p class="text-xs text-gray-500">V11.0 Multi-Environment</p>
                        </div>
                    </div>
                    <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        <span class="w-2 h-2 bg-green-400 rounded-full inline-block mr-2"></span>
                        Sistema Attivo
                    </span>
                </div>
                
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

        <main class="max-w-7xl mx-auto py-8 px-4">
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

            <div class="bg-white rounded-lg shadow border p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">
                    <i class="fas fa-rocket mr-2 text-blue-600"></i>
                    Menu Completo TeleMedCare V11.0
                </h2>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    </div>
                    
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
                    </div>
                    
                    <div class="space-y-2">
                        <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Strumenti</h3>
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
                    </div>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`)
})

// ========== SEZIONI SEMPLICI ==========
app.get('/leads', (c) => {
  return c.text('Sezione Gestione Lead - Interface in sviluppo. API backend funzionanti.')
})

app.get('/assistiti', (c) => {
  return c.text('Sezione Gestione Assistiti - Interface in sviluppo. Database strutturato.')
})

app.get('/analytics', (c) => {
  return c.text('Sezione Analytics - Dashboard avanzato in sviluppo.')
})

app.get('/admin/config', (c) => {
  return c.text('Configurazioni Sistema - Pannello admin in sviluppo.')
})

app.get('/admin/logs', (c) => {
  return c.text('Log Sistema - Monitoring avanzato in sviluppo.')
})

// ========== ADMIN REDIRECT ==========
app.get('/admin/environments', (c) => {
  return c.redirect('/admin-environments.html')
})

app.get('/admin/docs', (c) => {
  return c.redirect('/admin-docs.html')
})

// ========== API SEMPLICI FUNZIONANTI ==========
app.get('/api/health', async (c) => {
  return c.json({
    success: true,
    system: 'TeleMedCare V11.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'multi-environment',
    encoding: 'UTF-8 - Problemi di encoding corretti'
  })
})

app.get('/api/version', (c) => {
  return c.json({
    success: true,
    version: 'V11.0-Multi-Environment',
    name: 'TeleMedCare Sistema Modulare',
    build: new Date().toISOString(),
    database_naming: {
      development: 'telemedcare-leads',
      test: 'telemedcare_test_01, telemedcare_test_02, etc.',
      staging: 'telemedcare_staging', 
      production: 'telemedcare_database'
    },
    features: [
      'Sistema Multi-Ambiente Completo',
      'Menu Navigazione Responsive',
      'Template HTML Encoding Pulito',
      'API REST Funzionanti',
      'Documentazione Live Sistema',
      'Deployment Automatico'
    ]
  })
})

app.get('/api/menu', (c) => {
  return c.json({
    success: true,
    menu: {
      main: [
        { path: '/', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
        { path: '/leads', label: 'Lead', icon: 'fas fa-users' },
        { path: '/assistiti', label: 'Assistiti', icon: 'fas fa-user-check' },
        { path: '/analytics', label: 'Analytics', icon: 'fas fa-chart-bar' }
      ],
      admin: [
        { path: '/admin/environments', label: 'Gestione Ambienti', icon: 'fas fa-server' },
        { path: '/admin/docs', label: 'Documentazione', icon: 'fas fa-book' },
        { path: '/admin/config', label: 'Configurazioni', icon: 'fas fa-cogs' },
        { path: '/admin/logs', label: 'Log Sistema', icon: 'fas fa-file-alt' }
      ],
      tools: [
        { path: '/api/health', label: 'Health Check', icon: 'fas fa-heartbeat' },
        { path: '/api/version', label: 'Version Info', icon: 'fas fa-info-circle' }
      ]
    }
  })
})

// Error handler
app.onError((err, c) => {
  console.error('Application error:', err)
  return c.json({
    success: false,
    error: 'Errore interno del server - Encoding corretto',
    timestamp: new Date().toISOString()
  }, 500)
})

// 404 handler  
app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Endpoint non trovato',
    path: c.req.path,
    method: c.req.method,
    available: 'Usa /api/menu per vedere tutti gli endpoint disponibili'
  }, 404)
})

export default app