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

// ========== HOMEPAGE SEMPLICE ==========
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
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
        <!-- Header -->
        <header class="bg-white shadow-sm border-b">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <div class="flex justify-between items-center">
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
            </div>
        </header>

        <!-- Menu Navigazione -->
        <nav class="bg-white border-b">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex space-x-8 py-3">
                    <a href="/" class="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
                        <i class="fas fa-tachometer-alt mr-1"></i> Dashboard
                    </a>
                    <a href="/leads" class="text-gray-600 hover:text-blue-600 pb-2">
                        <i class="fas fa-users mr-1"></i> Lead
                    </a>
                    <a href="/assistiti" class="text-gray-600 hover:text-blue-600 pb-2">
                        <i class="fas fa-user-check mr-1"></i> Assistiti
                    </a>
                    <a href="/analytics" class="text-gray-600 hover:text-blue-600 pb-2">
                        <i class="fas fa-chart-bar mr-1"></i> Analytics
                    </a>
                    <a href="/admin/environments" class="text-gray-600 hover:text-blue-600 pb-2">
                        <i class="fas fa-cogs mr-1"></i> Ambienti
                    </a>
                    <a href="/admin/docs" class="text-gray-600 hover:text-blue-600 pb-2">
                        <i class="fas fa-book mr-1"></i> Docs
                    </a>
                </div>
            </div>
        </nav>

        <!-- Contenuto -->
        <main class="max-w-7xl mx-auto py-8 px-4">
            <!-- Statistiche -->
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
                            <p class="text-sm text-gray-600">Conversion</p>
                            <p class="text-2xl font-bold text-gray-900">--%</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Accesso Rapido -->
            <div class="bg-white rounded-lg shadow border p-6">
                <h2 class="text-lg font-medium text-gray-900 mb-4">Accesso Rapido</h2>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <a href="/admin/environments" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-server text-blue-600 mr-3"></i>
                        <span class="text-sm font-medium">Gestione Ambienti</span>
                    </a>
                    <a href="/admin/docs" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-book text-green-600 mr-3"></i>
                        <span class="text-sm font-medium">Documentazione</span>
                    </a>
                    <a href="/admin/config" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-sliders-h text-purple-600 mr-3"></i>
                        <span class="text-sm font-medium">Configurazioni</span>
                    </a>
                    <a href="/admin/users" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-users-cog text-indigo-600 mr-3"></i>
                        <span class="text-sm font-medium">Gestione Utenti</span>
                    </a>
                    <a href="/admin/logs" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-file-alt text-orange-600 mr-3"></i>
                        <span class="text-sm font-medium">Log Sistema</span>
                    </a>
                    <a href="/api/health" class="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <i class="fas fa-heartbeat text-red-600 mr-3"></i>
                        <span class="text-sm font-medium">Health Check</span>
                    </a>
                </div>
            </div>
        </main>
    </div>
</body>
</html>
  `)
})

// ========== SEZIONI PRINCIPALI SEMPLICI ==========
app.get('/leads', (c) => {
  return c.text('Sezione Gestione Lead - In sviluppo')
})

app.get('/assistiti', (c) => {
  return c.text('Sezione Gestione Assistiti - In sviluppo') 
})

app.get('/analytics', (c) => {
  return c.text('Sezione Analytics - In sviluppo')
})

// ========== ADMIN ROUTES ==========
app.get('/admin/environments', (c) => {
  return c.redirect('/admin-environments.html')
})

app.get('/admin/docs', (c) => {
  return c.redirect('/admin-docs.html')
})

app.get('/admin/config', (c) => {
  return c.text('Pannello Configurazioni - In sviluppo')
})

app.get('/admin/users', (c) => {
  return c.text('Gestione Utenti - In sviluppo')
})

app.get('/admin/logs', (c) => {
  return c.text('Log Sistema - In sviluppo')
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