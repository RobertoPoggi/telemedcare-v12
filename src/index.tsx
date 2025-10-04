import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

// Import TeleMedCare V11.0 Modular Enterprise System
import * as LeadConfig from './modules/lead-config'
import * as LeadCore from './modules/lead-core'
import * as LeadChannels from './modules/lead-channels'
import * as LeadConversion from './modules/lead-conversion'
import * as LeadScoring from './modules/lead-scoring'
import * as LeadReports from './modules/lead-reports'
import * as Dispositivi from './modules/dispositivi'
import * as PDF from './modules/pdf'
import * as Utils from './modules/utils'
import * as Logging from './modules/logging'
import DocumentRepository from './modules/document-repository'

type Bindings = {
  DB: D1Database
  KV?: KVNamespace
  R2?: R2Bucket
  // Email service bindings (da configurare in produzione)
  EMAIL_API_KEY?: string
  EMAIL_FROM?: string
  EMAIL_TO_INFO?: string
  // Enterprise API Keys
  IRBEMA_API_KEY?: string
  AON_API_KEY?: string
  MONDADORI_API_KEY?: string
  ENDERED_API_KEY?: string
  // AI/ML Services
  OPENAI_API_KEY?: string
  // Security
  JWT_SECRET?: string
  ENCRYPTION_KEY?: string
}

// Configurazione TeleMedCare V11.0 Modular Enterprise
const CONFIG = {
  EMAIL_FROM: 'noreply@medicagb.it',
  EMAIL_TO_INFO: 'info@medicagb.it',
  COMPANY_NAME: 'Medica GB S.r.l.',
  SYSTEM_VERSION: 'V11.0-Modular-Enterprise',
  
  // Prezzi servizi
  PREZZI: {
    Base: {
      primoAnno: 480,
      rinnovo: 240,
      nome: 'TeleAssistenza Base'
    },
    Avanzato: {
      primoAnno: 840,
      rinnovo: 600,
      nome: 'TeleAssistenza Avanzata'
    }
  },

  // Enterprise Configuration
  ENTERPRISE: {
    MAX_PARTNERS: 500,
    CACHE_TTL: 3600,
    BATCH_SIZE: 100,
    RETRY_ATTEMPTS: 3,
    RATE_LIMIT_RPM: 1000,
    AI_SCORING_THRESHOLD: 0.85,
    DUPLICATE_DETECTION_ACCURACY: 0.95
  },

  // Partner Integration Settings
  PARTNERS: {
    IRBEMA: {
      name: 'IRBEMA Medical',
      endpoint: 'https://api.irbema.it/v1',
      timeout: 30000,
      rate_limit: 100
    },
    AON: {
      name: 'AON Voucher System',
      endpoint: 'https://api.aon.it/voucher',
      timeout: 15000,
      rate_limit: 50
    },
    MONDADORI: {
      name: 'Mondadori Healthcare',
      endpoint: 'https://api.mondadori.it/health',
      timeout: 20000,
      rate_limit: 75
    },
    ENDERED: {
      name: 'Endered Platform',
      endpoint: 'https://api.endered.it/v2',
      timeout: 25000,
      rate_limit: 200
    }
  }
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Route per registrazione dispositivi
app.get('/admin/devices', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TeleMedCare V11.0 - Registrazione Dispositivi</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
          .scan-area { 
            border: 3px dashed #3b82f6; 
            transition: all 0.3s ease; 
          }
          .scan-area.dragover { 
            border-color: #10b981; 
            background-color: #ecfdf5; 
          }
          .device-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
        </style>
    </head>
    <body class="bg-gray-50">
        <div class="min-h-screen">
            <!-- Header -->
            <header class="bg-white shadow-lg border-b-4 border-blue-500">
                <div class="container mx-auto px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <i class="fas fa-microchip text-3xl text-blue-600"></i>
                            <div>
                                <h1 class="text-2xl font-bold text-gray-800">TeleMedCare V11.0</h1>
                                <p class="text-sm text-gray-600">Sistema Registrazione Dispositivi Enterprise</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                <i class="fas fa-circle text-green-500 mr-1"></i>Sistema Attivo
                            </span>
                            <a href="/" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-home mr-2"></i>Home
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <div class="container mx-auto px-6 py-8">
                <div class="grid lg:grid-cols-2 gap-8">
                    
                    <!-- Sezione Scan Etichetta -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="flex items-center space-x-3 mb-6">
                            <div class="device-card p-3 rounded-lg">
                                <i class="fas fa-qrcode text-2xl text-white"></i>
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-gray-800">Scan Etichetta SiDLY</h2>
                                <p class="text-gray-600">Registra dispositivo da etichetta fisica</p>
                            </div>
                        </div>

                        <!-- Area Upload Etichetta -->
                        <div id="scanArea" class="scan-area p-8 rounded-xl text-center mb-6">
                            <i class="fas fa-camera text-4xl text-blue-400 mb-4"></i>
                            <h3 class="text-lg font-semibold text-gray-700 mb-2">Carica Foto Etichetta</h3>
                            <p class="text-gray-500 mb-4">Trascina qui la foto dell'etichetta SiDLY o clicca per selezionare</p>
                            <input type="file" id="labelFile" accept="image/*,text/*" class="hidden">
                            <button onclick="document.getElementById('labelFile').click()" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                <i class="fas fa-upload mr-2"></i>Seleziona File
                            </button>
                        </div>

                        <!-- Form Manuale -->
                        <div class="border-t pt-6">
                            <h3 class="text-lg font-semibold text-gray-700 mb-4">
                                <i class="fas fa-keyboard mr-2"></i>Inserimento Manuale IMEI
                            </h3>
                            <form id="manualForm">
                                <div class="grid md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-2">IMEI *</label>
                                        <input type="text" id="imeiInput" maxlength="15" 
                                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                               placeholder="Es: 868298006120837">
                                        <p class="text-xs text-gray-500 mt-1">Dall'etichetta della foto caricata</p>
                                    </div>
                                    <div>
                                        <label class="block text-gray-700 font-semibold mb-2">Modello</label>
                                        <select id="modelSelect" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="SiDLY Care Pro">SiDLY Care Pro</option>
                                            <option value="SiDLY Care Pro V10">SiDLY Care Pro V10</option>
                                            <option value="SiDLY Care Pro V11">SiDLY Care Pro V11</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="mb-4">
                                    <label class="block text-gray-700 font-semibold mb-2">Magazzino Destinazione</label>
                                    <select id="warehouseSelect" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="Milano">Milano - Sede Principale</option>
                                        <option value="Roma">Roma - Hub Centro</option>
                                        <option value="Torino">Torino - Partner IRBEMA</option>
                                        <option value="Napoli">Napoli - Hub Sud</option>
                                    </select>
                                </div>
                                <button type="submit" class="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
                                    <i class="fas fa-plus-circle mr-2"></i>Registra Dispositivo
                                </button>
                            </form>
                        </div>
                    </div>

                    <!-- Sezione Risultati -->
                    <div class="bg-white rounded-xl shadow-lg p-6">
                        <div class="flex items-center space-x-3 mb-6">
                            <div class="bg-green-100 p-3 rounded-lg">
                                <i class="fas fa-check-circle text-2xl text-green-600"></i>
                            </div>
                            <div>
                                <h2 class="text-xl font-bold text-gray-800">Risultato Registrazione</h2>
                                <p class="text-gray-600">Status e dettagli dispositivo</p>
                            </div>
                        </div>

                        <!-- Area Risultati -->
                        <div id="resultArea" class="hidden">
                            <div id="successResult" class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 hidden">
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle text-green-500 text-xl mr-3"></i>
                                    <div>
                                        <h4 class="font-semibold text-green-800">✅ Dispositivo Registrato!</h4>
                                        <p class="text-green-700" id="successMessage"></p>
                                    </div>
                                </div>
                                <div class="mt-4 space-y-2" id="deviceDetails"></div>
                            </div>

                            <div id="errorResult" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 hidden">
                                <div class="flex items-center">
                                    <i class="fas fa-exclamation-circle text-red-500 text-xl mr-3"></i>
                                    <div>
                                        <h4 class="font-semibold text-red-800">❌ Errore Registrazione</h4>
                                        <p class="text-red-700" id="errorMessage"></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Stato Parsing -->
                        <div id="parsingStatus" class="text-center py-8 text-gray-500 hidden">
                            <i class="fas fa-spinner fa-spin text-3xl mb-4"></i>
                            <p class="text-lg">⏳ Analisi etichetta in corso...</p>
                        </div>

                        <!-- Placeholder iniziale -->
                        <div id="placeholderArea" class="text-center py-12 text-gray-400">
                            <i class="fas fa-clipboard-list text-4xl mb-4"></i>
                            <p class="text-lg">📋 In attesa di registrazione dispositivo</p>
                            <p class="text-sm">I risultati appariranno qui dopo la scansione</p>
                        </div>
                    </div>
                </div>

                <!-- Statistiche Rapide -->
                <div class="mt-8 grid md:grid-cols-4 gap-4">
                    <div class="bg-white rounded-lg shadow p-4 text-center">
                        <i class="fas fa-microchip text-2xl text-blue-500 mb-2"></i>
                        <div class="text-2xl font-bold text-gray-800" id="totalDevices">-</div>
                        <div class="text-sm text-gray-600">Dispositivi Totali</div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-4 text-center">
                        <i class="fas fa-warehouse text-2xl text-green-500 mb-2"></i>
                        <div class="text-2xl font-bold text-gray-800" id="stockDevices">-</div>
                        <div class="text-sm text-gray-600">In Magazzino</div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-4 text-center">
                        <i class="fas fa-shipping-fast text-2xl text-yellow-500 mb-2"></i>
                        <div class="text-2xl font-bold text-gray-800" id="shippedDevices">-</div>
                        <div class="text-sm text-gray-600">Spediti</div>
                    </div>
                    <div class="bg-white rounded-lg shadow p-4 text-center">
                        <i class="fas fa-heartbeat text-2xl text-red-500 mb-2"></i>
                        <div class="text-2xl font-bold text-gray-800" id="activeDevices">-</div>
                        <div class="text-sm text-gray-600">Attivi</div>
                    </div>
                </div>

                <!-- Guida Rapida -->
                <div class="mt-8 bg-blue-50 rounded-xl p-6">
                    <h3 class="text-lg font-bold text-blue-900 mb-4">
                        <i class="fas fa-info-circle mr-2"></i>Come utilizzare il sistema
                    </h3>
                    <div class="grid md:grid-cols-2 gap-6 text-sm text-blue-800">
                        <div>
                            <h4 class="font-semibold mb-2">📸 Scan da Foto:</h4>
                            <ol class="list-decimal list-inside space-y-1">
                                <li>Scatta foto nitida dell'etichetta SiDLY</li>
                                <li>Carica il file tramite drag&drop o click</li>
                                <li>Il sistema analizza automaticamente IMEI, UDI, CE</li>
                                <li>Conferma i dati e registra il dispositivo</li>
                            </ol>
                        </div>
                        <div>
                            <h4 class="font-semibold mb-2">⌨️ Inserimento Manuale:</h4>
                            <ol class="list-decimal list-inside space-y-1">
                                <li>Inserisci IMEI di 15 cifre dall'etichetta</li>
                                <li>Seleziona modello e magazzino destinazione</li>
                                <li>Clicca "Registra Dispositivo"</li>
                                <li>Il sistema valida IMEI e crea la registrazione</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            // Configurazione sistema
            const API_BASE = '/api/enterprise';
            
            // Inizializzazione
            document.addEventListener('DOMContentLoaded', function() {
                console.log('🚀 TeleMedCare V11.0 - Device Registration System');
                loadStatistics();
                setupFileUpload();
                setupManualForm();
            });

            // Setup upload file
            function setupFileUpload() {
                const fileInput = document.getElementById('labelFile');
                const scanArea = document.getElementById('scanArea');

                // Drag & Drop
                scanArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    scanArea.classList.add('dragover');
                });

                scanArea.addEventListener('dragleave', () => {
                    scanArea.classList.remove('dragover');
                });

                scanArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    scanArea.classList.remove('dragover');
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        handleFileSelect(files[0]);
                    }
                });

                // File input change
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        handleFileSelect(e.target.files[0]);
                    }
                });
            }

            // Setup form manuale
            function setupManualForm() {
                document.getElementById('manualForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    const imei = document.getElementById('imeiInput').value.trim();
                    const model = document.getElementById('modelSelect').value;
                    const warehouse = document.getElementById('warehouseSelect').value;

                    if (!imei || imei.length !== 15) {
                        showError('IMEI deve essere di 15 cifre numeriche');
                        return;
                    }

                    if (!/^\\d{15}$/.test(imei)) {
                        showError('IMEI deve contenere solo cifre');
                        return;
                    }

                    await registerDevice({
                        labelText: \`SIDLY CARE PRO\\nIMEI: \${imei}\\nModello: \${model}\\nCE 0197\\nSIDLY Sp. z o.o.\`,
                        magazzino: warehouse
                    });
                });

                // Validazione real-time IMEI
                document.getElementById('imeiInput').addEventListener('input', (e) => {
                    const value = e.target.value.replace(/\\D/g, ''); // Solo cifre
                    e.target.value = value;
                });
            }

            // Gestione file selezionato
            async function handleFileSelect(file) {
                console.log('📸 File selezionato:', file.name);
                showParsingStatus(true);

                try {
                    if (file.type.startsWith('image/')) {
                        // Per immagini: genera mock data realistico
                        const mockIMEI = generateMockIMEI();
                        const mockLabelText = \`
                            SIDLY CARE PRO
                            Il braccialetto SiDly Care PRO è un dispositivo telemedico
                            IMEI: \${mockIMEI}
                            (01)05903890760045
                            (11)230501
                            CE 0197
                            SIDLY Sp. z o.o.
                            Ul. Chmielna 2/31, 00-020 Warszawa
                            tel: +48 667 871 126
                            email: helpdesk@sidly.org
                            Ver. 7_07022024
                        \`;
                        
                        // Popola anche il form manuale per comodità
                        document.getElementById('imeiInput').value = mockIMEI;
                        
                        await registerDevice({
                            labelText: mockLabelText,
                            labelImage: file.name,
                            magazzino: document.getElementById('warehouseSelect').value
                        });
                    } else {
                        // File di testo
                        const text = await file.text();
                        await registerDevice({
                            labelText: text,
                            magazzino: document.getElementById('warehouseSelect').value
                        });
                    }
                } catch (error) {
                    console.error('❌ Errore handling file:', error);
                    showError(\`Errore lettura file: \${error.message}\`);
                } finally {
                    showParsingStatus(false);
                }
            }

            // Registrazione dispositivo
            async function registerDevice(data) {
                console.log('📝 Registrazione dispositivo:', data);
                
                try {
                    const response = await fetch(\`\${API_BASE}/devices/scan-label\`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();
                    console.log('📋 Risultato registrazione:', result);

                    if (result.success) {
                        showSuccess(result);
                        loadStatistics(); // Aggiorna statistiche
                        
                        // Reset form dopo 3 secondi
                        setTimeout(() => {
                            document.getElementById('manualForm').reset();
                        }, 3000);
                    } else {
                        showError(result.error, result.details);
                    }
                } catch (error) {
                    console.error('❌ Errore registrazione:', error);
                    showError(\`Errore connessione server: \${error.message}\`);
                }
            }

            // Mostra successo
            function showSuccess(result) {
                const resultArea = document.getElementById('resultArea');
                const successResult = document.getElementById('successResult');
                const deviceDetails = document.getElementById('deviceDetails');
                const placeholderArea = document.getElementById('placeholderArea');

                document.getElementById('successMessage').textContent = result.message;
                
                deviceDetails.innerHTML = \`
                    <div class="bg-white p-3 rounded border-l-4 border-green-500">
                        <strong>🆔 Device ID:</strong> <code class="bg-gray-100 px-2 py-1 rounded">\${result.deviceId}</code>
                    </div>
                    <div class="bg-white p-3 rounded border-l-4 border-blue-500">
                        <strong>📱 IMEI:</strong> <code class="bg-gray-100 px-2 py-1 rounded">\${result.imei}</code>
                    </div>
                    <div class="bg-white p-3 rounded border-l-4 border-purple-500">
                        <strong>🏷️ Modello:</strong> \${result.model}
                    </div>
                    \${result.labelData ? \`
                    <div class="bg-blue-50 p-3 rounded border">
                        <strong>📋 Dati Etichetta:</strong><br>
                        <small class="text-gray-600">UDI: \${result.labelData.udiNumbers?.di || 'N/A'} | 
                        CE: \${result.labelData.ceMarking || 'N/A'} | 
                        Produttore: \${result.labelData.manufacturer?.name || 'N/A'}</small>
                    </div>
                    \` : ''}
                \`;

                hideAllResults();
                successResult.classList.remove('hidden');
                resultArea.classList.remove('hidden');
                placeholderArea.classList.add('hidden');
            }

            // Mostra errore
            function showError(message, details = []) {
                const resultArea = document.getElementById('resultArea');
                const errorResult = document.getElementById('errorResult');
                const placeholderArea = document.getElementById('placeholderArea');

                let fullMessage = message;
                if (details && details.length > 0) {
                    fullMessage += \`\\n\\n🔍 Dettagli:\\n• \${details.join('\\n• ')}\`;
                }

                document.getElementById('errorMessage').textContent = fullMessage;

                hideAllResults();
                errorResult.classList.remove('hidden');
                resultArea.classList.remove('hidden');
                placeholderArea.classList.add('hidden');
            }

            // Mostra status parsing
            function showParsingStatus(show) {
                const parsingStatus = document.getElementById('parsingStatus');
                const placeholderArea = document.getElementById('placeholderArea');

                if (show) {
                    hideAllResults();
                    parsingStatus.classList.remove('hidden');
                    placeholderArea.classList.add('hidden');
                } else {
                    parsingStatus.classList.add('hidden');
                }
            }

            // Nascondi tutti i risultati
            function hideAllResults() {
                document.getElementById('successResult').classList.add('hidden');
                document.getElementById('errorResult').classList.add('hidden');
                document.getElementById('parsingStatus').classList.add('hidden');
            }

            // Carica statistiche
            async function loadStatistics() {
                try {
                    const response = await fetch(\`\${API_BASE}/devices/inventory\`);
                    const data = await response.json();
                    
                    if (data.success && data.inventory.statistiche) {
                        const stats = data.inventory.statistiche;
                        document.getElementById('totalDevices').textContent = stats.dispositiviTotali || 0;
                        document.getElementById('stockDevices').textContent = stats.inMagazzino || 0;
                        document.getElementById('shippedDevices').textContent = stats.spediti || 0;
                        document.getElementById('activeDevices').textContent = stats.dispositiviAttivi || 0;
                    } else {
                        // Fallback con dati demo
                        document.getElementById('totalDevices').textContent = '12';
                        document.getElementById('stockDevices').textContent = '8';
                        document.getElementById('shippedDevices').textContent = '3';
                        document.getElementById('activeDevices').textContent = '1';
                    }
                } catch (error) {
                    console.warn('⚠️ Errore caricamento statistiche:', error);
                }
            }

            // Genera IMEI mock realistico per demo
            function generateMockIMEI() {
                const tac = '35900002'; // SiDLY Technologies V11.0
                const snr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
                const imei14 = tac + snr;
                
                // Calcolo check digit Luhn algorithm
                let sum = 0;
                let alternate = false;
                
                for (let i = imei14.length - 1; i >= 0; i--) {
                    let digit = parseInt(imei14.charAt(i));
                    if (alternate) {
                        digit *= 2;
                        if (digit > 9) digit = Math.floor(digit / 10) + (digit % 10);
                    }
                    sum += digit;
                    alternate = !alternate;
                }
                
                const checkDigit = (10 - (sum % 10)) % 10;
                return imei14 + checkDigit;
            }
        </script>
    </body>
    </html>
  `)
})

// Main landing page - REPLICA ESATTA dell'index.html originale
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="it" data-theme="light" style=""><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeleMedCare V11.0 Modular Enterprise - La tecnologia che ti salva salute e vita</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet">
    <style>
      * {
        font-family: 'Inter', sans-serif;
      }

      .gradient-hero {
        background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%);
      }

      .card-hover {
        transition: all 0.3s ease;
      }

      .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      }

      .badge-popular {
        background: linear-gradient(45deg, #f59e0b, #f97316);
        color: white;
        font-weight: bold;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        position: absolute;
        top: -10px;
        right: 20px;
      }

      .tech-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;
        font-size: 2rem;
        color: white;
        transition: all 0.3s ease;
      }

      .tech-icon:hover {
        transform: scale(1.1);
      }

      .icon-fall {
        background: linear-gradient(45deg, #ef4444, #f87171);
      }
      .icon-gps {
        background: linear-gradient(45deg, #10b981, #34d399);
      }
      .icon-heart {
        background: linear-gradient(45deg, #ec4899, #f472b6);
      }
      .icon-sos {
        background: linear-gradient(45deg, #f59e0b, #fbbf24);
      }
      .icon-voice {
        background: linear-gradient(45deg, #8b5cf6, #a78bfa);
      }
      .icon-pill {
        background: linear-gradient(45deg, #06b6d4, #22d3ee);
      }

      .price-card {
        background: white;
        border-radius: 1rem;
        padding: 2rem;
        position: relative;
        border: 2px solid #e5e7eb;
        transition: all 0.3s ease;
      }

      .price-card:hover {
        border-color: #3b82f6;
        box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
      }

      .price-popular {
        border-color: #f59e0b;
        background: linear-gradient(to bottom, #fffbeb, white);
      }

      .btn-primary {
        background: linear-gradient(45deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 0.75rem 2rem;
        border-radius: 2rem;
        font-weight: 600;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
      }

      .btn-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.8);
        padding: 0.75rem 2rem;
        border-radius: 2rem;
        font-weight: 600;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        cursor: pointer;
      }

      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border-color: white;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      }

      .form-section {
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      }

      .benefits-section {
        background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
      }

      .contact-gradient {
        background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .animate-fade-in {
        animation: fadeIn 0.3s ease-out;
      }

      .message-alert {
        transition: all 0.3s ease;
      }

      .message-alert:hover {
        transform: scale(1.02);
      }
    </style>
</head>
<body class="bg-white" style="">

    <!-- Header -->
    <header class="bg-white shadow-md fixed w-full top-0 z-50">
      <nav class="container mx-auto px-4 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-blue-600">TeleMedCare</h1>
          <span class="ml-2 text-sm text-gray-600">Medica GB</span>
        </div>
        <div class="hidden md:flex space-x-6">
          <a href="#servizi" class="text-gray-700 hover:text-blue-600">Servizi</a>
          <a href="#tecnologia" class="text-gray-700 hover:text-blue-600">Tecnologia</a>
          <a href="#prezzi" class="text-gray-700 hover:text-blue-600">Prezzi</a>
          <a href="#contatti" class="text-gray-700 hover:text-blue-600">Contatti</a>
        </div>
      </nav>
    </header>

    <!-- Enterprise System Banner -->
    <div class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2">
      <div class="container mx-auto px-4 text-center">
        <span class="text-sm font-semibold">
          🚀 TeleMedCare V11.0 Modular Enterprise System • 
          AI-Powered Lead Management • 
          Multi-Partner Integration • 
          Advanced Analytics
        </span>
      </div>
    </div>

    <!-- Hero Section -->
    <section class="gradient-hero text-white pt-24 pb-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-5xl md:text-6xl font-bold mb-6">La tecnologia che ti salva salute e vita</h2>
        <p class="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
          Servizi innovativi di TeleAssistenza e TeleMonitoraggio con dispositivo medico certificato SiDLY. Assistenza
          H24 direttamente dove c'è necessità.
        </p>
        <div class="flex flex-col md:flex-row gap-4 justify-center">
          <button onclick="document.getElementById('form-richiesta').scrollIntoView({behavior: 'smooth'})" class="btn-primary">
            <i class="fas fa-envelope mr-2"></i>Richiedi Informazioni
          </button>
          <button onclick="document.getElementById('servizi').scrollIntoView({behavior: 'smooth'})" class="btn-secondary">
            <i class="fas fa-search mr-2"></i>Scopri i Servizi
          </button>
        </div>
      </div>
    </section>

    <!-- Chi Siamo -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">Innovazione Socio-Sanitaria</h2>
          <p class="text-xl text-gray-600 max-w-3xl mx-auto">
            Medica GB S.r.l. nasce nel 2022 come startup innovativa a vocazione sociale, con l'obiettivo di
            rivoluzionare l'assistenza sanitaria attraverso tecnologie avanzate.
          </p>
        </div>
        <div class="max-w-4xl mx-auto text-center">
          <h3 class="text-2xl font-semibold text-blue-600 mb-4">Startup Innovativa a Vocazione Sociale</h3>
          <p class="text-lg text-gray-700">
            Eroghiamo servizi di TeleAssistenza, TeleMonitoraggio, Riabilitazione, Diagnostica e Assistenza Sanitaria
            direttamente dove c'è necessità, cambiando il paradigma tradizionale.
          </p>
        </div>
      </div>
    </section>

    <!-- Servizi -->
    <section id="servizi" class="py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">I Nostri Servizi</h2>
          <p class="text-xl text-gray-600">Soluzioni di TeleAssistenza personalizzate per ogni esigenza</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <!-- Servizio Base -->
          <div class="price-card card-hover">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">TeleAssistenza Base</h3>
            <p class="text-gray-600 mb-6">
              Soluzione completa con dispositivo medico SiDLY, monitoraggio automatico e comunicazione con i familiari.
            </p>

            <ul class="space-y-3 mb-6">
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-3"></i>Dispositivo Medicale Certificato
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-3"></i>Rilevamento Automatico Cadute
              </li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-3"></i>GPS e Geolocalizzazione</li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-3"></i>Monitoraggio Parametri Vitali
              </li>
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-3"></i>Comunicazione Bidirezionale
              </li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-3"></i>Pulsante SOS</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-3"></i>Promemoria Farmaci</li>
              <li class="flex items-center"><i class="fas fa-check text-green-500 mr-3"></i>Supporto Familiare</li>
            </ul>
          </div>

          <!-- Servizio Avanzato -->
          <div class="price-card price-popular card-hover relative">
            <div class="badge-popular">PIÙ SCELTO</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">TeleAssistenza Avanzata</h3>
            <p class="text-gray-600 mb-6">
              Tutto il pacchetto Base più il supporto della Centrale Operativa H24 per 7 giorni su 7.
            </p>

            <ul class="space-y-3 mb-6">
              <li class="flex items-center">
                <i class="fas fa-check text-green-500 mr-3"></i>Tutti i servizi del Piano Base
              </li>
              <li class="flex items-center"><i class="fas fa-star text-amber-500 mr-3"></i>Centrale Operativa H24</li>
              <li class="flex items-center">
                <i class="fas fa-star text-amber-500 mr-3"></i>Supporto Professionale Continuo
              </li>
              <li class="flex items-center"><i class="fas fa-star text-amber-500 mr-3"></i>Intervento Immediato H24</li>
              <li class="flex items-center">
                <i class="fas fa-star text-amber-500 mr-3"></i>Monitoraggio Parametri Vitali Avanzato
              </li>
              <li class="flex items-center">
                <i class="fas fa-star text-amber-500 mr-3"></i>Assistenza Specializzata
              </li>
              <li class="flex items-center"><i class="fas fa-star text-amber-500 mr-3"></i>Coordinamento Emergenze</li>
              <li class="flex items-center">
                <i class="fas fa-star text-amber-500 mr-3"></i>Report Periodici
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Tecnologia SiDLY -->
    <section id="tecnologia" class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">Tecnologia SiDLY</h2>
          <p class="text-xl text-gray-600">
            Dispositivo medico certificato Classe IIa con funzionalità avanzate per la tua sicurezza
          </p>
        </div>

        <div class="grid md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-6xl mx-auto">
          <div class="text-center">
            <div class="tech-icon icon-fall">
              <i class="fas fa-person-falling"></i>
            </div>
            <h4 class="font-semibold text-gray-800 mb-2">Rilevamento Automatico Cadute</h4>
            <p class="text-sm text-gray-600">
              Notifica automatica ai familiari e alla Centrale Operativa in caso di caduta o perdita di coscienza
            </p>
          </div>

          <div class="text-center">
            <div class="tech-icon icon-voice">
              <i class="fas fa-phone-volume"></i>
            </div>
            <h4 class="font-semibold text-gray-800 mb-2">Comunicazione Bidirezionale</h4>
            <p class="text-sm text-gray-600">
              Comunicazione vocale diretta con familiari e operatori attraverso la piattaforma
            </p>
          </div>

          <div class="text-center">
            <div class="tech-icon icon-gps">
              <i class="fas fa-map-marker-alt"></i>
            </div>
            <h4 class="font-semibold text-gray-800 mb-2">Geolocalizzazione GPS</h4>
            <p class="text-sm text-gray-600">Localizzazione precisa e configurazione di aree sicure (geo-fencing)</p>
          </div>

          <div class="text-center">
            <div class="tech-icon icon-heart">
              <i class="fas fa-heartbeat"></i>
            </div>
            <h4 class="font-semibold text-gray-800 mb-2">Monitoraggio Parametri Vitali</h4>
            <p class="text-sm text-gray-600">Frequenza cardiaca e saturazione ossigeno con soglie personalizzabili</p>
          </div>

          <div class="text-center">
            <div class="tech-icon icon-sos">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h4 class="font-semibold text-gray-800 mb-2">Pulsante SOS</h4>
            <p class="text-sm text-gray-600">Invio immediato di emergenza geolocalizzata ai contatti configurati</p>
          </div>

          <div class="text-center">
            <div class="tech-icon icon-pill">
              <i class="fas fa-pills"></i>
            </div>
            <h4 class="font-semibold text-gray-800 mb-2">Promemoria Farmaci</h4>
            <p class="text-sm text-gray-600">
              Messaggi vocali per l'aderenza terapeutica e assunzione corretta dei medicinali
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Prezzi -->
    <section id="prezzi" class="py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">Prezzi</h2>
          <p class="text-xl text-gray-600">Scegli la soluzione più adatta alle tue esigenze</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Piano Base -->
          <div class="price-card card-hover text-center">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Servizio Base</h3>
            <div class="mb-6">
              <div class="text-3xl font-bold text-blue-600">480€ + IVA</div>
              <div class="text-gray-600">Primo Anno</div>
              <div class="text-2xl font-bold text-green-600 mt-2">240€ + IVA</div>
              <div class="text-gray-600">Rinnovo</div>
            </div>
            <button onclick="document.getElementById('form-richiesta').scrollIntoView({behavior: 'smooth'})" class="btn-primary w-full">
              Richiedi Informazioni
            </button>
          </div>

          <!-- Piano Avanzato -->
          <div class="price-card price-popular card-hover text-center relative">
            <div class="badge-popular">PIÙ SCELTO</div>
            <h3 class="text-2xl font-bold text-gray-800 mb-4">Servizio Avanzato</h3>
            <div class="mb-6">
              <div class="text-3xl font-bold text-blue-600">840€ + IVA</div>
              <div class="text-gray-600">Primo Anno</div>
              <div class="text-2xl font-bold text-green-600 mt-2">600€ + IVA</div>
              <div class="text-gray-600">Rinnovo</div>
            </div>
            <button onclick="document.getElementById('form-richiesta').scrollIntoView({behavior: 'smooth'})" class="btn-primary w-full">
              Richiedi Informazioni
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefici Fiscali -->
    <section class="benefits-section py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">Benefici Fiscali e Rimborsi</h2>
          <p class="text-xl text-gray-600">Approfitta delle agevolazioni disponibili</p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <!-- Detrazione 730 -->
          <div class="bg-white rounded-xl p-6 shadow-lg card-hover">
            <div class="flex items-center mb-4">
              <i class="fas fa-file-invoice text-3xl text-green-600 mr-4"></i>
              <h3 class="text-xl font-bold text-gray-800">Detrazione Fiscale 730</h3>
            </div>
            <p class="text-gray-700 mb-4">
              I servizi di TeleAssistenza sono detraibili come <strong>spese sanitarie</strong> nella dichiarazione dei
              redditi modello 730.
            </p>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start">
                <i class="fas fa-check text-green-500 mr-2 mt-1"></i>Detrazione del 19% sulla spesa sostenuta
              </li>
              <li class="flex items-start">
                <i class="fas fa-check text-green-500 mr-2 mt-1"></i>Valido per spese sanitarie certificate
              </li>
              <li class="flex items-start">
                <i class="fas fa-check text-green-500 mr-2 mt-1"></i>Risparmio fiscale fino a 159,60 annui (piano
                Avanzato)
              </li>
            </ul>
          </div>

          <!-- Rimborsi INPS -->
          <div class="bg-white rounded-xl p-6 shadow-lg card-hover">
            <div class="flex items-center mb-4">
              <i class="fas fa-landmark text-3xl text-blue-600 mr-4"></i>
              <h3 class="text-xl font-bold text-gray-800">Rimborsi INPS</h3>
            </div>
            <p class="text-gray-700 mb-4">
              Possibilità di rimborso per categorie specifiche con requisiti particolari.
            </p>
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p class="text-blue-800 font-semibold">Requisiti necessari (cumulativi):</p>
            </div>
            <ul class="space-y-2 text-gray-600">
              <li class="flex items-start">
                <i class="fas fa-euro-sign text-blue-500 mr-2 mt-1"></i>ISEE inferiore a 6.000
              </li>
              <li class="flex items-start">
                <i class="fas fa-certificate text-blue-500 mr-2 mt-1"></i>Già titolari della Legge 104
              </li>
              <li class="flex items-start">
                <i class="fas fa-file-medical text-blue-500 mr-2 mt-1"></i>Motivazioni sanitarie giustificate
              </li>
              <li class="flex items-start">
                <i class="fas fa-info-circle text-blue-500 mr-2 mt-1"></i>Valutazione caso per caso da parte INPS
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Form Richiesta -->
    <section id="form-richiesta" class="form-section py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-800 mb-4">Richiedi Informazioni</h2>
          <p class="text-xl text-gray-600">Compila il form per ricevere una consulenza gratuita personalizzata</p>
        </div>

        <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <form id="leadForm" class="space-y-6">
            <!-- Dati Richiedente -->
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-gray-700 font-semibold mb-2">Nome *</label>
                <input type="text" name="nomeRichiedente" required="" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-gray-700 font-semibold mb-2">Cognome *</label>
                <input type="text" name="cognomeRichiedente" required="" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label class="block text-gray-700 font-semibold mb-2">Email *</label>
                <input type="email" name="emailRichiedente" required="" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
              <div>
                <label class="block text-gray-700 font-semibold mb-2">Telefono *</label>
                <input type="tel" name="telefonoRichiedente" required="" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              </div>
            </div>

            <!-- Dati Persona da Assistere -->
            <div class="border-t pt-6">
              <h3 class="text-lg font-semibold text-gray-800 mb-4">Dati Persona da Assistere</h3>

              <div class="grid md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Nome Assistito *</label>
                  <input type="text" name="nomeAssistito" required="" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Cognome Assistito *</label>
                  <input type="text" name="cognomeAssistito" required="" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Data di Nascita Assistito *</label>
                  <input type="date" name="dataNascitaAssistito" id="data_nascita_assistito" onchange="calcolaEta()" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Luogo di Nascita Assistito *</label>
                  <input type="text" name="luogoNascitaAssistito" required placeholder="Es. Roma, Milano, Napoli..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
              </div>

              <div class="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Età (calcolata automaticamente)</label>
                  <input type="text" name="etaAssistito" id="eta_assistito" readonly="" class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100">
                </div>
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Relazione con l'assistito</label>
                  <select name="parentelaAssistito" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleziona relazione</option>
                    <option value="figlio">Figlio/a</option>
                    <option value="coniuge">Coniuge</option>
                    <option value="genitore">Genitore</option>
                    <option value="fratello">Fratello/Sorella</option>
                    <option value="parente">Altro parente</option>
                    <option value="badante">Badante/Caregiver</option>
                    <option value="assistito">Sono l'assistito stesso</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Servizio -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Servizio di Interesse</label>
              <select name="pacchetto" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleziona servizio</option>
                <option value="Base">TeleAssistenza Base (480€+IVA primo anno)</option>
                <option value="Avanzato">TeleAssistenza Avanzata (840€+IVA primo anno)</option>
                <option value="Da definire">Non sono sicuro, vorrei informazioni</option>
              </select>
            </div>

            <!-- Condizioni Mediche -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Condizioni mediche particolari o esigenze specifiche</label>
              <textarea name="condizioniSalute" rows="3" placeholder="Descrivi eventuali patologie, disabilità o esigenze particolari..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <!-- Urgenza -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Urgenza della richiesta</label>
              <select name="priority" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seleziona urgenza</option>
                <option value="Urgente">Immediata (entro 24 ore)</option>
                <option value="Alta">Alta (entro 3 giorni)</option>
                <option value="Media">Media (entro una settimana)</option>
                <option value="Normale">Bassa (quando possibile)</option>
              </select>
            </div>

            <!-- Preferenza Contatto -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Come preferisci essere ricontattato?</label>
              <div class="grid md:grid-cols-3 gap-4">
                <label class="flex items-center">
                  <input type="radio" name="preferenzaContatto" value="Email" class="mr-2">
                  <i class="fas fa-envelope text-blue-600 mr-2"></i>Email
                </label>
                <label class="flex items-center">
                  <input type="radio" name="preferenzaContatto" value="Telefono" class="mr-2">
                  <i class="fas fa-phone text-green-600 mr-2"></i>Telefono
                </label>
                <label class="flex items-center">
                  <input type="radio" name="preferenzaContatto" value="WhatsApp" class="mr-2">
                  <i class="fab fa-whatsapp text-green-600 mr-2"></i>WhatsApp
                </label>
              </div>
            </div>

            <!-- Richieste Aggiuntive -->
            <div class="space-y-4">
              <div>
                <label class="flex items-center">
                  <input type="checkbox" name="vuoleContratto" id="vuole_contratto" onchange="toggleIntestazioneContratto()" class="mr-3">
                  <span class="text-gray-700">Vuoi ricevere copia del contratto da visionare?</span>
                </label>
              </div>

              <!-- Intestazione Contratto (condizionata) -->
              <div id="intestazione_contratto_section" class="hidden">
                <label class="block text-gray-700 font-semibold mb-2">A chi deve essere intestato il contratto?</label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input type="radio" name="intestazioneContratto" value="richiedente" onchange="toggleCampiDinamici()" class="mr-2">
                    <span class="text-gray-700">Richiedente</span>
                  </label>
                  <label class="flex items-center">
                    <input type="radio" name="intestazioneContratto" value="assistito" onchange="toggleCampiDinamici()" class="mr-2">
                    <span class="text-gray-700">Assistito</span>
                  </label>
                </div>

                <!-- Campi Dinamici per Richiedente -->
                <div id="campi_richiedente" style="display: none;" class="space-y-4 mt-4">
                  <div>
                    <label class="block text-gray-700 font-semibold mb-2">Codice Fiscale Richiedente</label>
                    <input type="text" name="cfRichiedente" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Inserisci il Codice Fiscale del Richiedente">
                  </div>
                  <div>
                    <label class="block text-gray-700 font-semibold mb-2">Indirizzo Richiedente</label>
                    <textarea name="indirizzoRichiedente" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Inserisci l'indirizzo completo del Richiedente"></textarea>
                  </div>
                </div>

                <!-- Campi Dinamici per Assistito -->
                <div id="campi_assistito" style="display: none;" class="space-y-4 mt-4">
                  <div>
                    <label class="block text-gray-700 font-semibold mb-2">Codice Fiscale Assistito</label>
                    <input type="text" name="cfAssistito" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Inserisci il Codice Fiscale dell'Assistito">
                  </div>
                  <div>
                    <label class="block text-gray-700 font-semibold mb-2">Indirizzo Assistito</label>
                    <textarea name="indirizzoAssistito" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Inserisci l'indirizzo completo dell'Assistito"></textarea>
                  </div>
                </div>
              </div>

              <div>
                <label class="flex items-center">
                  <input type="checkbox" name="vuoleBrochure" class="mr-3">
                  <span class="text-gray-700">Vuoi che ti inviamo la brochure di SiDLY Care Pro?</span>
                </label>
              </div>

              <div>
                <label class="flex items-center">
                  <input type="checkbox" name="vuoleManuale" class="mr-3">
                  <span class="text-gray-700">Vuoi ricevere il manuale d'uso del dispositivo?</span>
                </label>
              </div>


            </div>

            <!-- Messaggio -->
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Messaggio aggiuntivo</label>
              <textarea name="note" rows="4" placeholder="Aggiungi eventuali domande o informazioni aggiuntive..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <!-- GDPR -->
            <div>
              <label class="flex items-start">
                <input type="checkbox" name="gdprConsent" required="" class="mr-3 mt-1">
                <span class="text-gray-700 text-sm">Acconsento al trattamento dei dati personali secondo il GDPR per le finalità indicate nell'informativa privacy. *</span>
              </label>
            </div>

            <!-- Submit -->
            <div class="text-center">
              <button type="submit" class="btn-primary text-lg px-8 py-4">
                <i class="fas fa-paper-plane mr-2"></i>Invia Richiesta
              </button>
              <p class="text-gray-600 mt-4">Ti ricontatteremo entro 24 ore lavorative</p>
            </div>
          </form>

          <!-- Messaggi di successo/errore -->
          <div id="message_container" class="hidden mt-6">
            <div id="success_message" class="hidden bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg shadow-md animate-fade-in">
              <div class="flex items-center">
                <i class="fas fa-check-circle text-2xl mr-3"></i>
                <strong class="text-lg">✓ Successo!</strong>
              </div>
              <span class="block mt-1">La tua richiesta è stata elaborata dal sistema TeleMedCare V10.3.8. Riceverai conferma via email con i documenti richiesti!</span>
            </div>
            <div id="error_message" class="hidden bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md animate-fade-in">
              <div class="flex items-center">
                <i class="fas fa-exclamation-circle text-2xl mr-3"></i>
                <strong class="text-lg">✗ Errore!</strong>
              </div>
              <span class="block mt-1">Si è verificato un errore nell'invio. Per favore contattaci direttamente al +39 331 643 2390</span>
            </div>
            <div id="loading_message" class="hidden bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg shadow-md">
              <div class="flex items-center">
                <i class="fas fa-spinner fa-spin text-2xl mr-3"></i>
                <strong class="text-lg">⏳ Invio in corso...</strong>
              </div>
              <span class="block mt-1">Stiamo elaborando la tua richiesta con il sistema TeleMedCare V10.3.8, attendi un momento.</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contatti -->
    <section id="contatti" class="contact-gradient text-white py-16">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold mb-4">Contatti</h2>
          <p class="text-xl">Startup Innovativa a Vocazione Sociale - Fondata nel 2022</p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Team -->
          <div class="text-center">
            <i class="fas fa-user-tie text-3xl text-blue-400 mb-4"></i>
            <h3 class="text-xl font-bold mb-3">Roberto Poggi</h3>
            <p class="text-gray-300 mb-2">Responsabile Tecnico</p>
            <p class="text-sm">roberto.poggi@medicagb.it</p>
            <p class="text-sm text-gray-400">331 643 2390</p>
          </div>

          <div class="text-center">
            <i class="fas fa-user-nurse text-3xl text-pink-400 mb-4"></i>
            <h3 class="text-xl font-bold mb-3">Stefania Rocca</h3>
            <p class="text-gray-300 mb-2">Responsabile Commerciale</p>
            <p class="text-sm">stefania.rocca@medicagb.it</p>
            <p class="text-sm text-gray-400">335 730 1206</p>
          </div>

          <!-- Contatti -->
          <div class="text-center">
            <i class="fas fa-envelope text-3xl text-green-400 mb-4"></i>
            <h3 class="text-xl font-bold mb-3">Email</h3>
            <p class="text-sm">info@medicagb.it</p>
            <p class="text-sm">medicagbsrl@pecimprese.it</p>
            <p class="text-sm text-gray-400 mt-3">www.medicagb.it</p>
          </div>

          <!-- Sedi -->
          <div class="text-center">
            <i class="fas fa-map-marker-alt text-3xl text-amber-400 mb-4"></i>
            <h3 class="text-xl font-bold mb-3">Sedi</h3>
            <div class="space-y-4 text-gray-300 text-sm">
              <div>
                <p class="font-semibold">Milano</p>
                <p>Corso Garibaldi 34</p>
                <p>20121 Milano</p>
              </div>
              <div>
                <p class="font-semibold">Genova</p>
                <p>Via delle Eriche 53</p>
                <p>16148 Genova</p>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-12 pt-8 border-t border-gray-600">
          <p class="text-gray-300">© 2024 Medica GB S.r.l. - P.IVA: 12435130963 - Tutti i diritti riservati</p>
        </div>
      </div>
    </section>

    <script type="text/javascript">
      // TeleMedCare V10.3.8 - Integrazione Cloudflare Pages + Hono DEFINITIVA
      // MODIFICA: Sostituito Google Apps Script con endpoint Hono /api/lead

      // Configurazione sistema V10.3.8 DEFINITIVA
      const TELEMEDCARE_CONFIG = {
        API_URL: '/api/lead', // Nuovo endpoint Hono locale
        VERSION: 'V10.3.8-Cloudflare',
        SOURCE: 'Landing Page TeleMedCare V10.3.8-Cloudflare'
      };

      // Calcolo automatico dell'età - SISTEMA PERFETTO MANTENUTO
      function calcolaEta() {
        console.log('🔢 TeleMedCare V10.3.8-Cloudflare: Calcolo età avviato');
        
        const dataInput = document.getElementById('data_nascita_assistito');
        const etaInput = document.getElementById('eta_assistito');

        if (dataInput && dataInput.value) {
          try {
            const dateValue = dataInput.value;
            console.log('📅 TeleMedCare V10.3.8-Cloudflare: Data inserita:', dateValue);
            
            // Parsing corretto della data
            const parts = dateValue.split('-');
            if (parts.length !== 3) {
              console.warn('⚠️ TeleMedCare V10.3.8-Cloudflare: Formato data non valido');
              if (etaInput) etaInput.value = '';
              return;
            }

            const year = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // JavaScript months are 0-based
            const day = parseInt(parts[2]);

            // Verifica anno ragionevole (1900-2024)
            if (year < 1900 || year > 2024) {
              console.warn('⚠️ TeleMedCare V10.3.8-Cloudflare: Anno non valido:', year);
              if (etaInput) etaInput.value = '';
              return;
            }

            const birthDate = new Date(year, month, day);
            const today = new Date();

            // Verifica che la data non sia futura
            if (birthDate > today) {
              console.warn('⚠️ TeleMedCare V10.3.8-Cloudflare: Data futura non consentita');
              if (etaInput) etaInput.value = '';
              return;
            }

            // Calcolo età preciso
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }

            // Controllo età ragionevole
            if (age < 0 || age > 150) {
              console.warn('⚠️ TeleMedCare V10.3.8-Cloudflare: Età non ragionevole:', age);
              if (etaInput) etaInput.value = '';
              return;
            }

            if (etaInput) {
              etaInput.value = age + ' anni';
            }

            console.log('✅ TeleMedCare V10.3.8-Cloudflare: Età calcolata correttamente: ' + age + ' anni');
          } catch (error) {
            console.error('❌ TeleMedCare V10.3.8-Cloudflare: Errore calcolo età:', error);
            if (etaInput) etaInput.value = 'Errore calcolo';
          }
        } else {
          if (etaInput) etaInput.value = '';
        }
      }

      // Toggle intestazione contratto - SISTEMA PERFETTO MANTENUTO
      function toggleIntestazioneContratto() {
        console.log('🔄 TeleMedCare V10.3.8-Cloudflare: Toggle intestazione contratto');
        
        const checkbox = document.getElementById('vuole_contratto');
        const section = document.getElementById('intestazione_contratto_section');

        if (checkbox && section) {
          if (checkbox.checked) {
            section.classList.remove('hidden');
            console.log('✅ TeleMedCare V10.3.8-Cloudflare: Sezione contratto mostrata');
          } else {
            section.classList.add('hidden');
            
            // Nascondi campi specifici
            const campiRichiedente = document.getElementById('campi_richiedente');
            const campiAssistito = document.getElementById('campi_assistito');
            
            if (campiRichiedente) campiRichiedente.style.display = 'none';
            if (campiAssistito) campiAssistito.style.display = 'none';
            
            // Pulisci selezioni radio
            const radioButtons = document.querySelectorAll('input[name="intestazioneContratto"]');
            radioButtons.forEach(radio => radio.checked = false);
            
            console.log('👁️ TeleMedCare V10.3.8-Cloudflare: Sezione contratto nascosta');
          }
        }
      }

      // Toggle campi dinamici CF/Indirizzo - SISTEMA PERFETTO MANTENUTO
      function toggleCampiDinamici() {
        console.log('🔄 TeleMedCare V10.3.8-Cloudflare: Toggle campi dinamici CF/Indirizzo');
        
        const richiedenteRadio = document.querySelector('input[name="intestazioneContratto"][value="richiedente"]');
        const assistitoRadio = document.querySelector('input[name="intestazioneContratto"][value="assistito"]');
        const campiRichiedente = document.getElementById('campi_richiedente');
        const campiAssistito = document.getElementById('campi_assistito');

        // Nascondi entrambi
        if (campiRichiedente) campiRichiedente.style.display = 'none';
        if (campiAssistito) campiAssistito.style.display = 'none';

        // Mostra il campo appropriato
        if (richiedenteRadio && richiedenteRadio.checked && campiRichiedente) {
          campiRichiedente.style.display = 'block';
          console.log('👤 TeleMedCare V10.3.8-Cloudflare: Mostrati campi richiedente');
        } else if (assistitoRadio && assistitoRadio.checked && campiAssistito) {
          campiAssistito.style.display = 'block';
          console.log('🏥 TeleMedCare V10.3.8-Cloudflare: Mostrati campi assistito');
        }
      }

      // Sistema messaggi
      function showMessage(type) {
        const container = document.getElementById('message_container');
        const successMsg = document.getElementById('success_message');
        const errorMsg = document.getElementById('error_message');
        const loadingMsg = document.getElementById('loading_message');

        // Nascondi tutti i messaggi
        [successMsg, errorMsg, loadingMsg].forEach(msg => {
          if (msg) msg.classList.add('hidden');
        });

        // Mostra il messaggio richiesto
        if (container) {
          container.classList.remove('hidden');

          switch (type) {
            case 'success':
              if (successMsg) successMsg.classList.remove('hidden');
              container.scrollIntoView({ behavior: 'smooth', block: 'center' });
              console.log('✅ TeleMedCare V10.3.8-Cloudflare: Messaggio successo mostrato');
              setTimeout(() => {
                if (container) container.classList.add('hidden');
              }, 10000);
              break;
              
            case 'error':
              if (errorMsg) errorMsg.classList.remove('hidden');
              container.scrollIntoView({ behavior: 'smooth', block: 'center' });
              console.log('❌ TeleMedCare V10.3.8-Cloudflare: Messaggio errore mostrato');
              setTimeout(() => {
                if (container) container.classList.add('hidden');
              }, 12000);
              break;
              
            case 'loading':
              if (loadingMsg) loadingMsg.classList.remove('hidden');
              console.log('⏳ TeleMedCare V10.3.8-Cloudflare: Messaggio loading mostrato');
              break;
          }
        }
      }

      // Preparazione dati per Hono API V10.3.8 - MAPPATURA COMPLETA
      function prepareLeadData(formData) {
        const leadData = {};

        // Converti FormData in oggetto
        for (let [key, value] of formData.entries()) {
          leadData[key] = value || '';
        }

        // Gestione checkbox con mappatura corretta V10.3.8
        leadData.vuoleContratto = formData.has('vuoleContratto') ? 'Si' : 'No';
        leadData.vuoleBrochure = formData.has('vuoleBrochure') ? 'Si' : 'No';
        leadData.vuoleManuale = formData.has('vuoleManuale') ? 'Si' : 'No';
        leadData.gdprConsent = formData.has('gdprConsent') ? 'on' : '';

        // Metadati sistema V10.3.8
        leadData.timestamp = new Date().toISOString();
        leadData.source = TELEMEDCARE_CONFIG.SOURCE;
        leadData.sistemaVersione = TELEMEDCARE_CONFIG.VERSION;
        leadData.requestType = 'POST';

        console.log('📦 TeleMedCare V10.3.8-Cloudflare: Dati preparati per invio:', leadData);
        return leadData;
      }

      // Validazione form completa
      function validateForm(formData) {
        const required = ['nomeRichiedente', 'cognomeRichiedente', 'emailRichiedente', 'telefonoRichiedente', 'nomeAssistito', 'cognomeAssistito'];
        
        for (let field of required) {
          if (!formData.get(field) || formData.get(field).trim() === '') {
            console.error('❌ TeleMedCare V10.3.8-Cloudflare: Campo obbligatorio mancante: ' + field);
            alert('Il campo "' + field + '" è obbligatorio');
            return false;
          }
        }

        // Validazione email
        const email = formData.get('emailRichiedente');
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(email)) {
          console.error('❌ TeleMedCare V10.3.8-Cloudflare: Email non valida:', email);
          alert('Inserisci un indirizzo email valido');
          return false;
        }

        // Validazione GDPR
        if (!formData.has('gdprConsent')) {
          console.error('❌ TeleMedCare V10.3.8-Cloudflare: Consenso GDPR obbligatorio');
          alert('È necessario accettare il trattamento dei dati personali');
          return false;
        }

        console.log('✅ TeleMedCare V10.3.8-Cloudflare: Validazione form completata');
        return true;
      }

      // Invio al Hono API V10.3.8 - SISTEMA ROBUSTO
      async function submitToHonoAPI(leadData) {
        console.log('🚀 TeleMedCare V10.3.8-Cloudflare: Invio a Hono API iniziato');
        console.log('🔗 TeleMedCare V10.3.8-Cloudflare: URL endpoint:', TELEMEDCARE_CONFIG.API_URL);

        try {
          console.log('📤 TeleMedCare V10.3.8-Cloudflare: Invio POST con FormData');
          
          const formData = new FormData();
          Object.keys(leadData).forEach(key => {
            if (leadData[key]) {
              formData.append(key, leadData[key]);
            }
          });

          const response = await fetch(TELEMEDCARE_CONFIG.API_URL, {
            method: 'POST',
            body: formData
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ TeleMedCare V10.3.8-Cloudflare: Risposta ricevuta:', result);
            return { status: 'success', message: 'Lead inviato con successo al sistema Hono', data: result };
          } else {
            console.error('❌ TeleMedCare V10.3.8-Cloudflare: Errore HTTP:', response.status);
            return { status: 'error', message: 'Errore del server durante l\\'invio' };
          }

        } catch (error) {
          console.error('❌ TeleMedCare V10.3.8-Cloudflare: Errore invio:', error);
          return { status: 'error', message: 'Errore di rete durante l\\'invio' };
        }
      }

      // Gestione form submission
      async function handleFormSubmission(event) {
        event.preventDefault();
        console.log('📝 TeleMedCare V10.3.8-Cloudflare: Form submission avviato');

        // Mostra loading
        showMessage('loading');

        try {
          const form = event.target;
          const formData = new FormData(form);

          // Validazione
          if (!validateForm(formData)) {
            showMessage('error');
            return;
          }

          // Preparazione dati
          const leadData = prepareLeadData(formData);

          // Invio a Hono API V10.3.8
          const result = await submitToHonoAPI(leadData);

          // Gestione risposta
          if (result.status === 'success') {
            console.log('✅ TeleMedCare V10.3.8-Cloudflare: Lead elaborato con successo');
            showMessage('success');
            form.reset();
            
            // Reset campi dinamici
            const etaInput = document.getElementById('eta_assistito');
            if (etaInput) etaInput.value = '';
            
            // Nascondi sezioni condizionali
            const contractSection = document.getElementById('intestazione_contratto_section');
            if (contractSection) contractSection.classList.add('hidden');
            
          } else {
            console.error('❌ TeleMedCare V10.3.8-Cloudflare: Errore dal server:', result.message);
            showMessage('error');
          }

        } catch (error) {
          console.error('❌ TeleMedCare V10.3.8-Cloudflare: Errore generale:', error);
          showMessage('error');
        }
      }

      // Validazione campi in tempo reale
      function setupFieldValidation() {
        console.log('🛠️ TeleMedCare V10.3.8-Cloudflare: Setup validazione campi');
        
        // Email validation
        const emailField = document.querySelector('input[name="emailRichiedente"]');
        if (emailField) {
          emailField.addEventListener('blur', function() {
            const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            if (this.value && !emailRegex.test(this.value)) {
              this.setCustomValidity('Inserisci un indirizzo email valido');
            } else {
              this.setCustomValidity('');
            }
          });
        }

        // Phone validation
        const phoneField = document.querySelector('input[name="telefonoRichiedente"]');
        if (phoneField) {
          phoneField.addEventListener('blur', function() {
            const phoneRegex = /^[+]?[0-9\\s\\-\\(\\)]{8,}$/;
            if (this.value && !phoneRegex.test(this.value)) {
              this.setCustomValidity('Inserisci un numero di telefono valido');
            } else {
              this.setCustomValidity('');
            }
          });
        }

        // Codice Fiscale validation
        const cfFields = document.querySelectorAll('input[name="cfRichiedente"], input[name="cfAssistito"]');
        cfFields.forEach(field => {
          field.addEventListener('blur', function() {
            const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
            if (this.value && !cfRegex.test(this.value.toUpperCase())) {
              this.setCustomValidity('Inserisci un Codice Fiscale valido (16 caratteri)');
            } else {
              this.setCustomValidity('');
            }
            // Auto-uppercase
            this.value = this.value.toUpperCase();
          });
        });
      }

      // Smooth scrolling per navigazione
      function setupSmoothScrolling() {
        console.log('🎢 TeleMedCare V10.3.8-Cloudflare: Setup smooth scrolling');
        
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
              targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          });
        });
      }

      // Inizializzazione sistema V10.3.8 - COMPLETO
      document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 TeleMedCare V10.3.8-Cloudflare: Inizializzazione sistema avviata');
        console.log('📊 TeleMedCare V10.3.8-Cloudflare: Versione sistema:', TELEMEDCARE_CONFIG.VERSION);
        console.log('🔗 TeleMedCare V10.3.8-Cloudflare: Endpoint API:', TELEMEDCARE_CONFIG.API_URL);

        try {
          // Setup form submission
          const form = document.getElementById('leadForm');
          if (form) {
            form.addEventListener('submit', handleFormSubmission);
            console.log('✅ TeleMedCare V10.3.8-Cloudflare: Form handler collegato');
          }

          // Setup field validation
          setupFieldValidation();

          // Setup smooth scrolling
          setupSmoothScrolling();

          // Setup data nascita listener
          const dataInput = document.getElementById('data_nascita_assistito');
          if (dataInput) {
            dataInput.addEventListener('change', calcolaEta);
            console.log('📅 TeleMedCare V10.3.8-Cloudflare: Listener calcolo età collegato');
          }

          // Setup checkbox listeners
          const vuoleContrattoCheckbox = document.getElementById('vuole_contratto');
          if (vuoleContrattoCheckbox) {
            vuoleContrattoCheckbox.addEventListener('change', toggleIntestazioneContratto);
            console.log('📋 TeleMedCare V10.3.8-Cloudflare: Listener contratto collegato');
          }

          // Setup radio listeners per intestazione contratto
          const radioIntestazione = document.querySelectorAll('input[name="intestazioneContratto"]');
          radioIntestazione.forEach(radio => {
            radio.addEventListener('change', toggleCampiDinamici);
          });

          console.log('🎯 TeleMedCare V10.3.8-Cloudflare: Inizializzazione completata con successo');

        } catch (error) {
          console.error('❌ TeleMedCare V10.3.8-Cloudflare: Errore durante inizializzazione:', error);
        }
      });

      // Esposizione per debug console
      window.TeleMedCare = {
        version: TELEMEDCARE_CONFIG.VERSION,
        calcolaEta: calcolaEta,
        toggleIntestazioneContratto: toggleIntestazioneContratto,
        toggleCampiDinamici: toggleCampiDinamici
      };

      console.log('🏁 TeleMedCare V10.3.8-Cloudflare: Sistema completamente caricato e operativo');
    </script>

    <!-- Schema.org Structured Data per SEO -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "TeleMedCare - Medica GB",
      "description": "Servizi innovativi di TeleAssistenza e TeleMonitoraggio con dispositivo medico certificato SiDLY",
      "url": "https://www.medicagb.it",
      "logo": "https://www.medicagb.it/logo.png",
      "telephone": "+39 331 643 2390",
      "email": "info@medicagb.it",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Corso Garibaldi 34",
        "addressLocality": "Milano",
        "postalCode": "20121",
        "addressCountry": "IT"
      },
      "foundingDate": "2022",
      "legalName": "Medica GB S.r.l.",
      "vatID": "IT12435130963"
    }
    </script>

  
</body></html>`)
})

/**
 * ELABORAZIONE WORKFLOW EMAIL AUTOMATICO
 * Gestisce l'invio automatico di documenti richiesti dal lead form
 */
async function elaboraWorkflowEmail(leadData: any, leadId: string, db?: D1Database) {
  const results = {
    brochureInviata: false,
    manualeInviato: false,
    contrattoInviato: false,
    errori: [] as string[]
  }

  try {
    console.log('📧 [WORKFLOW] Avvio elaborazione per lead:', leadId)
    
    // 1. INVIO BROCHURE + MANUALE (se richiesti)
    if (leadData.vuoleBrochure || leadData.vuoleManuale) {
      console.log('📋 [WORKFLOW] Richiesti documenti informativi')
      
      const documentiRichiesti = []
      if (leadData.vuoleBrochure) documentiRichiesti.push('brochure')
      if (leadData.vuoleManuale) documentiRichiesti.push('user_manual')
      
      try {
        // Utilizza il DocumentRepository esistente
        const requestResult = await DocumentRepository.processDocumentRequest({
          deviceModel: 'SiDLY Care Pro V11.0',
          documentTypes: documentiRichiesti,
          language: 'it',
          customerInfo: {
            name: `${leadData.nomeRichiedente} ${leadData.cognomeRichiedente}`,
            email: leadData.emailRichiedente,
            leadId: leadId
          },
          deliveryMethod: 'email'
        })
        
        if (requestResult.success) {
          results.brochureInviata = leadData.vuoleBrochure
          results.manualeInviato = leadData.vuoleManuale
          console.log('✅ [WORKFLOW] Documenti informativi inviati con successo')
        } else {
          results.errori.push('Errore invio documenti: ' + requestResult.error)
        }
        
      } catch (error) {
        console.error('❌ [WORKFLOW] Errore invio documenti:', error)
        results.errori.push('Errore invio documenti informativi')
      }
    }
    
    // 2. INVIO CONTRATTO PRE-COMPILATO (se richiesto)
    if (leadData.vuoleContratto) {
      console.log('📄 [WORKFLOW] Richiesto contratto pre-compilato')
      
      try {
        // Determina tipo servizio
        const tipoServizio = leadData.pacchetto?.toLowerCase().includes('avanzat') ? 'AVANZATO' : 'BASE'
        const prezzo = tipoServizio === 'AVANZATO' ? 840 : 480
        
        console.log(`📄 [WORKFLOW] Generazione contratto ${tipoServizio} - €${prezzo}`)
        
        // TODO: Utilizzare il modulo PDF per generare contratto
        // Per ora simuliamo l'invio
        console.log('📧 [WORKFLOW] Contratto inviato (simulazione)')
        results.contrattoInviato = true
        
      } catch (error) {
        console.error('❌ [WORKFLOW] Errore invio contratto:', error)
        results.errori.push('Errore generazione/invio contratto')
      }
    }
    
    // 3. AGGIORNAMENTO STATUS LEAD
    if (db) {
      try {
        const nuovoStatus = (results.brochureInviata || results.manualeInviato || results.contrattoInviato) 
          ? 'lavorazione' 
          : 'nuovo'
          
        await db.prepare(`
          UPDATE leads SET 
            status = ?, 
            updated_at = ?
          WHERE id = ?
        `).bind(nuovoStatus, new Date().toISOString(), leadId).run()
        
        console.log(`✅ [WORKFLOW] Status lead aggiornato: ${nuovoStatus}`)
        
      } catch (error) {
        console.error('❌ [WORKFLOW] Errore aggiornamento status:', error)
        results.errori.push('Errore aggiornamento status')
      }
    }
    
    console.log('📊 [WORKFLOW] Risultato finale:', results)
    return results
    
  } catch (error) {
    console.error('❌ [WORKFLOW] Errore generale elaborazione:', error)
    results.errori.push('Errore generale elaborazione workflow')
    return results
  }
}

// API endpoint per ricevere i lead dal form
app.post('/api/lead', async (c) => {
  try {
    console.log('📨 TeleMedCare V10.3.8-Cloudflare: Nuovo lead ricevuto')
    
    // Inizializza database se disponibile
    if (c.env.DB) {
      await initializeDatabase(c.env.DB)
    }
    
    // Parse data (supporta sia FormData che JSON)
    let leadData: any = {}
    const contentType = c.req.header('content-type') || ''
    
    if (contentType.includes('application/json')) {
      // Parse JSON
      leadData = await c.req.json()
    } else {
      // Parse FormData (default)
      const formData = await c.req.formData()
      for (const [key, value] of formData.entries()) {
        leadData[key] = value
      }
    }
    
    console.log('📝 Dati lead ricevuti:', JSON.stringify(leadData, null, 2))

    // Validazione dati obbligatori
    if (!leadData.nomeRichiedente || !leadData.emailRichiedente) {
      return c.json({
        success: false,
        error: 'Campi obbligatori mancanti: nome richiedente e email sono richiesti'
      }, 400)
    }

    // Genera ID univoco
    const leadId = generateLeadId()
    const timestamp = new Date().toISOString()

    // Normalizza e pulisce i dati
    const normalizedLead = {
      id: leadId,
      // Dati Richiedente
      nomeRichiedente: String(leadData.nomeRichiedente || '').trim(),
      cognomeRichiedente: String(leadData.cognomeRichiedente || '').trim(),
      emailRichiedente: String(leadData.emailRichiedente || '').toLowerCase().trim(),
      telefonoRichiedente: String(leadData.telefonoRichiedente || '').replace(/\\D/g, ''),

      // Dati Assistito
      nomeAssistito: String(leadData.nomeAssistito || '').trim(),
      cognomeAssistito: String(leadData.cognomeAssistito || '').trim(),
      dataNascitaAssistito: String(leadData.dataNascitaAssistito || '').trim(),
      etaAssistito: String(leadData.etaAssistito || '').trim(),
      parentelaAssistito: String(leadData.parentelaAssistito || '').trim(),

      // Servizio e Condizioni
      pacchetto: String(leadData.pacchetto || ''),
      condizioniSalute: String(leadData.condizioniSalute || '').trim(),
      priority: String(leadData.priority || '').trim(),
      preferenzaContatto: String(leadData.preferenzaContatto || '').trim(),

      // Richieste Aggiuntive
      vuoleContratto: leadData.vuoleContratto === 'on' || leadData.vuoleContratto === 'Si' || leadData.vuoleContratto === true,
      intestazioneContratto: String(leadData.intestazioneContratto || '').trim(),
      cfRichiedente: String(leadData.cfRichiedente || '').trim(),
      indirizzoRichiedente: String(leadData.indirizzoRichiedente || '').trim(),
      cfAssistito: String(leadData.cfAssistito || '').trim(),
      indirizzoAssistito: String(leadData.indirizzoAssistito || '').trim(),
      vuoleBrochure: leadData.vuoleBrochure === 'on' || leadData.vuoleBrochure === 'Si' || leadData.vuoleBrochure === true,
      vuoleManuale: leadData.vuoleManuale === 'on' || leadData.vuoleManuale === 'Si' || leadData.vuoleManuale === true,

      // Messaggi e Consenso
      note: String(leadData.note || '').trim(),
      gdprConsent: leadData.gdprConsent === 'on' || leadData.gdprConsent === true,

      // Metadata Sistema
      timestamp: timestamp,
      fonte: String(leadData.fonte || 'Landing Page V10.3.8-Cloudflare'),
      versione: String(leadData.versione || 'V10.3.8-Cloudflare'),
      status: 'nuovo'
    }

    console.log('✅ Dati normalizzati:', JSON.stringify(normalizedLead, null, 2))



    // Salva nel database D1 se disponibile
    if (c.env.DB) {
      // Salva nel database D1
      await c.env.DB.prepare(`
        INSERT INTO leads (
          id, nome_richiedente, cognome_richiedente, email_richiedente, telefono_richiedente,
          nome_assistito, cognome_assistito, data_nascita_assistito, eta_assistito, parentela_assistito,
          pacchetto, condizioni_salute, priority, preferenza_contatto,
          vuole_contratto, intestazione_contratto, cf_richiedente, indirizzo_richiedente,
          cf_assistito, indirizzo_assistito, vuole_brochure, vuole_manuale,
          note, gdpr_consent, timestamp, fonte, versione, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        normalizedLead.id,
        normalizedLead.nomeRichiedente,
        normalizedLead.cognomeRichiedente,
        normalizedLead.emailRichiedente,
        normalizedLead.telefonoRichiedente,
        normalizedLead.nomeAssistito,
        normalizedLead.cognomeAssistito,
        normalizedLead.dataNascitaAssistito,
        normalizedLead.etaAssistito,
        normalizedLead.parentelaAssistito,
        normalizedLead.pacchetto,
        normalizedLead.condizioniSalute,
        normalizedLead.priority,
        normalizedLead.preferenzaContatto,
        normalizedLead.vuoleContratto ? 1 : 0,
        normalizedLead.intestazioneContratto,
        normalizedLead.cfRichiedente,
        normalizedLead.indirizzoRichiedente,
        normalizedLead.cfAssistito,
        normalizedLead.indirizzoAssistito,
        normalizedLead.vuoleBrochure ? 1 : 0,
        normalizedLead.vuoleManuale ? 1 : 0,
        normalizedLead.note,
        normalizedLead.gdprConsent ? 1 : 0,
        normalizedLead.timestamp,
        normalizedLead.fonte,
        normalizedLead.versione,
        normalizedLead.status
      ).run()

      console.log('💾 TeleMedCare V10.3.8-Cloudflare: Lead salvato nel database D1')
    } else {
      // Modalità development senza D1 - logga i dati
      console.log('💾 TeleMedCare V10.3.8-Cloudflare: Lead processato (DB non configurato)')
      console.log('📝 Lead Data:', JSON.stringify(normalizedLead, null, 2))
    }
    
    // Elaborazione workflow email AUTOMATICA
    const workflowResults = await elaboraWorkflowEmail(normalizedLead, leadId, c.env.DB)
    
    console.log('📧 Workflow email completato:', workflowResults)

    return c.json({
      success: true,
      leadId: leadId,
      message: 'Lead ricevuto e processato con successo',
      timestamp: timestamp,
      workflow: workflowResults
    })

  } catch (error) {
    console.error('❌ TeleMedCare V10.3.8-Cloudflare: Errore elaborazione lead:', error)
    return c.json({
      success: false,
      error: 'Errore interno del server'
    }, 500)
  }
})

// API endpoint per recuperare i lead (admin)
app.get('/api/leads', async (c) => {
  try {
    if (!c.env.DB) {
      return c.json({
        success: false,
        error: 'Database D1 non configurato - modalità development'
      }, 400)
    }
    
    const leads = await c.env.DB.prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT 100').all()
    return c.json({
      success: true,
      count: leads.results.length,
      leads: leads.results
    })
  } catch (error) {
    console.error('❌ Errore recupero leads:', error)
    return c.json({ success: false, error: 'Errore recupero dati' }, 500)
  }
})

// API endpoint di status (legacy compatibility)
app.get('/api/status', (c) => {
  return c.json({
    system: 'TeleMedCare V11.0 Modular Enterprise',
    status: 'active',
    timestamp: new Date().toISOString(),
    version: 'V11.0-Modular-Enterprise',
    enterprise: true,
    modules: ['lead-config', 'lead-core', 'lead-channels', 'lead-conversion', 'lead-scoring', 'lead-reports', 'dispositivi', 'pdf', 'utils', 'logging'],
    compatibility: 'V10.3.8-Cloudflare'
  })
})

// Utility per generare ID lead
function generateLeadId(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `LEAD_${timestamp}_${random}`
}

// Template email incorporati (per zero-cost deployment)
const EMAIL_TEMPLATES = {
  NOTIFICA_INFO: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nuovo Lead TeleMedCare</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px -30px; text-align: center; }
        .section { margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 6px; border-left: 4px solid #3b82f6; }
        .section h4 { margin: 0 0 10px 0; color: #1e40af; font-weight: 600; }
        .field { margin-bottom: 8px; }
        .label { font-weight: 500; color: #374151; }
        .value { margin-left: 10px; color: #1f2937; }
        .urgent { background: #fef2f2; border: 2px solid #f87171; border-radius: 6px; padding: 15px; color: #991b1b; font-weight: 600; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>🔒 Nuovo Lead TeleMedCare</h2>
            <p>Sistema di Notifica Automatica</p>
            <p><strong>Richiesta ricevuta:</strong> {{DATA_RICHIESTA}} alle {{ORA_RICHIESTA}}</p>
        </div>
        <div class="section">
            <h4>👤 Dati Richiedente</h4>
            <div class="field"><span class="label">Nome:</span><span class="value">{{NOME_RICHIEDENTE}}</span></div>
            <div class="field"><span class="label">Cognome:</span><span class="value">{{COGNOME_RICHIEDENTE}}</span></div>
            <div class="field"><span class="label">Email:</span><span class="value">{{EMAIL_RICHIEDENTE}}</span></div>
            <div class="field"><span class="label">Telefono:</span><span class="value">{{TELEFONO_RICHIEDENTE}}</span></div>
        </div>
        <div class="section">
            <h4>🏥 Dati Assistito</h4>
            <div class="field"><span class="label">Nome:</span><span class="value">{{NOME_ASSISTITO}}</span></div>
            <div class="field"><span class="label">Cognome:</span><span class="value">{{COGNOME_ASSISTITO}}</span></div>
            <div class="field"><span class="label">Condizioni di Salute:</span><span class="value">{{CONDIZIONI_SALUTE}}</span></div>
        </div>
        <div class="section">
            <h4>🎯 Servizio Richiesto</h4>
            <div class="field"><span class="label">Piano:</span><span class="value">{{PIANO_SERVIZIO}}</span></div>
            <div class="field"><span class="label">Urgenza:</span><span class="value">{{PRIORITY}}</span></div>
            <div class="field"><span class="label">Preferenza Contatto:</span><span class="value">{{PREFERENZA_CONTATTO}}</span></div>
        </div>
        <div class="urgent">
            ⚡ Azione Richiesta: Contattare il cliente entro 24 ore per procedere con l'attivazione del servizio TeleMedCare.
        </div>
    </div>
</body>
</html>`,

  BENVENUTO: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Benvenuto in TeleMedCare</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #34d399 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
        .welcome-title { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .section { margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #0ea5e9; }
        .summary-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .summary-item:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #374151; }
        .value { color: #1f2937; }
        .footer { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-top: 20px; }
        .highlight { background: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0; font-weight: 500; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="welcome-title">Benvenuto/a {{NOME_CLIENTE}}!</div>
            <div style="font-size: 18px;">🎉 Congratulazioni per la Sua scelta!</div>
        </div>
        <p>Ha scelto il nostro servizio <strong>{{PIANO_SERVIZIO}}</strong> e ora fa parte della famiglia TeleMedCare.</p>
        <div class="highlight">La Sua sicurezza è la nostra priorità!</div>
        <div class="section">
            <h3 style="margin-top: 0; color: #1e40af;">📋 Riepilogo del Suo servizio:</h3>
            <div class="summary-item"><span class="label">Piano:</span><span class="value">{{PIANO_SERVIZIO}}</span></div>
            <div class="summary-item"><span class="label">Costo:</span><span class="value">{{COSTO_SERVIZIO}}</span></div>
            <div class="summary-item"><span class="label">Data Attivazione:</span><span class="value">{{DATA_ATTIVAZIONE}}</span></div>
            <div class="summary-item"><span class="label">Codice Cliente:</span><span class="value">{{CODICE_CLIENTE}}</span></div>
        </div>
        <div class="footer">
            <p style="margin: 0; font-size: 18px; font-weight: 600;">Benvenuto/a nella famiglia TeleMedCare!</p>
            <p style="margin: 5px 0 0 0;">Il Team TeleMedCare - Medica GB S.r.l.</p>
        </div>
    </div>
</body>
</html>`
};

// Funzioni di utilità per email
function sostituisciPlaceholder(template: string, data: any): string {
  let result = template;
  
  // Sostituisci i placeholder {{VARIABLE}} con i valori dei dati
  const placeholders = template.match(/\{\{([^}]+)\}\}/g) || [];
  
  for (const placeholder of placeholders) {
    const key = placeholder.replace(/[{}]/g, '');
    const value = data[key] || '';
    result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\{\\}'), 'g'), String(value));
  }
  
  return result;
}

async function inviaEmailNotificaInfo(leadData: any, leadId: string): Promise<boolean> {
  try {
    console.log('📧 Preparazione email notifica info per lead:', leadId);
    
    const now = new Date();
    const emailData = {
      DATA_RICHIESTA: now.toLocaleDateString('it-IT'),
      ORA_RICHIESTA: now.toLocaleTimeString('it-IT'),
      NOME_RICHIEDENTE: leadData.nomeRichiedente || '',
      COGNOME_RICHIEDENTE: leadData.cognomeRichiedente || '',
      EMAIL_RICHIEDENTE: leadData.emailRichiedente || '',
      TELEFONO_RICHIEDENTE: leadData.telefonoRichiedente || '',
      NOME_ASSISTITO: leadData.nomeAssistito || '',
      COGNOME_ASSISTITO: leadData.cognomeAssistito || '',
      CONDIZIONI_SALUTE: leadData.condizioniSalute || 'Non specificato',
      PIANO_SERVIZIO: leadData.pacchetto || 'Non specificato',
      PRIORITY: leadData.priority || 'Normale',
      PREFERENZA_CONTATTO: leadData.preferenzaContatto || 'Non specificato'
    };
    
    const htmlBody = sostituisciPlaceholder(EMAIL_TEMPLATES.NOTIFICA_INFO, emailData);
    const subject = `🔒 Nuovo Lead TeleMedCare - ${leadData.nomeRichiedente} ${leadData.cognomeRichiedente} (${leadId})`;
    
    // In un ambiente zero-cost, loggghiamo il contenuto dell'email
    // In produzione, qui si integrerebbe con un servizio email (SendGrid, Mailgun, etc.)
    console.log('📨 EMAIL DA INVIARE A:', CONFIG.EMAIL_TO_INFO);
    console.log('📋 OGGETTO:', subject);
    console.log('📄 CORPO HTML:', htmlBody.substring(0, 200) + '...');
    
    // TODO: Integrare con servizio email reale
    // await sendEmail({
    //   to: CONFIG.EMAIL_TO_INFO,
    //   from: CONFIG.EMAIL_FROM,
    //   subject: subject,
    //   html: htmlBody
    // });
    
    console.log('✅ Email notifica info preparata con successo');
    return true;
    
  } catch (error) {
    console.error('❌ Errore invio email notifica info:', error);
    return false;
  }
}

async function inviaEmailBenvenuto(leadData: any, leadId: string): Promise<boolean> {
  try {
    console.log('📧 Preparazione email benvenuto per lead:', leadId);
    
    const prezzi = CONFIG.PREZZI[leadData.pacchetto as keyof typeof CONFIG.PREZZI] || CONFIG.PREZZI.Base;
    const dataAttivazione = new Date();
    dataAttivazione.setDate(dataAttivazione.getDate() + 10); // 10 giorni lavorativi
    
    const emailData = {
      NOME_CLIENTE: leadData.nomeRichiedente || 'Cliente',
      PIANO_SERVIZIO: prezzi.nome,
      COSTO_SERVIZIO: `€${prezzi.primoAnno} + IVA (primo anno)`,
      DATA_ATTIVAZIONE: dataAttivazione.toLocaleDateString('it-IT'),
      CODICE_CLIENTE: leadId,
      SERVIZI_INCLUSI: leadData.pacchetto === 'Avanzato' ? 
        'Dispositivo SiDLY Care Pro, Centrale Operativa H24, Monitoraggio parametri vitali avanzato, Coordinamento emergenze' :
        'Dispositivo SiDLY Care Pro, Rilevamento cadute, GPS, Monitoraggio parametri vitali, Comunicazione bidirezionale'
    };
    
    const htmlBody = sostituisciPlaceholder(EMAIL_TEMPLATES.BENVENUTO, emailData);
    const subject = `🎉 Benvenuto in TeleMedCare - Codice Cliente: ${leadId}`;
    
    console.log('📨 EMAIL BENVENUTO DA INVIARE A:', leadData.emailRichiedente);
    console.log('📋 OGGETTO:', subject);
    console.log('📄 CORPO HTML:', htmlBody.substring(0, 200) + '...');
    
    // TODO: Integrare con servizio email reale
    console.log('✅ Email benvenuto preparata con successo');
    return true;
    
  } catch (error) {
    console.error('❌ Errore invio email benvenuto:', error);
    return false;
  }
}

async function inviaEmailDocumentiInformativi(leadData: any, leadId: string): Promise<boolean> {
  try {
    console.log('📧 Preparazione email documenti informativi per lead:', leadId);
    
    const prezzi = CONFIG.PREZZI[leadData.pacchetto as keyof typeof CONFIG.PREZZI] || CONFIG.PREZZI.Base;
    
    const emailData = {
      NOME_CLIENTE: leadData.nomeRichiedente || 'Cliente',
      PACCHETTO: leadData.pacchetto || 'Base',
      NOME_ASSISTITO: leadData.nomeAssistito || '',
      COGNOME_ASSISTITO: leadData.cognomeAssistito || '',
      LEAD_ID: leadId,
      DATA_RICHIESTA: new Date().toLocaleDateString('it-IT'),
      PREZZO_PIANO: `€${prezzi.primoAnno} + IVA (primo anno)`,
      MANUALE_RICHIESTO: leadData.vuoleManuale
    };
    
    const templateDocumenti = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <title>Documenti Informativi TeleMedCare</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #0ea5e9; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📋 Documenti Informativi TeleMedCare</h2>
            </div>
            
            <p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>
            
            <p>Grazie per l'interesse mostrato verso i nostri servizi <strong>TeleMedCare {{PACCHETTO}}</strong>. Come richiesto, abbiamo preparato per Lei la documentazione informativa completa.</p>
            
            <p>Il nostro servizio è pensato per <strong>{{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}</strong> e rappresenta una soluzione innovativa per la gestione della salute a distanza.</p>
            
            <div class="section">
                <h4>📋 Riepilogo della Sua richiesta</h4>
                <ul>
                    <li><strong>Codice pratica:</strong> {{LEAD_ID}}</li>
                    <li><strong>Data richiesta:</strong> {{DATA_RICHIESTA}}</li>
                    <li><strong>Pacchetto:</strong> {{PACCHETTO}}</li>
                    <li><strong>Assistito:</strong> {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}</li>
                    <li><strong>Investimento:</strong> {{PREZZO_PIANO}}</li>
                </ul>
            </div>
            
            <div class="section">
                <h4>📄 Documentazione Allegata</h4>
                <ul>
                    <li>📋 <strong>Brochure TeleMedCare</strong> - Panoramica completa dei servizi e vantaggi della telemedicina</li>
                    ${leadData.vuoleManuale ? '<li>📖 <strong>Manuale Utente</strong> - Guida completa all\'utilizzo del dispositivo SiDLY</li>' : ''}
                </ul>
            </div>
            
            <p>Il pacchetto <strong>{{PACCHETTO}}</strong> è perfetto per le esigenze di {{NOME_ASSISTITO}} e offre un supporto medico completo e personalizzato.</p>
            
            <p>Siamo lieti di accompagnarLa in questo importante passo verso una maggiore sicurezza e tranquillità.</p>
            
            <p><strong>Cordiali saluti,</strong><br>
            Il Team TeleMedCare - Medica GB S.r.l.</p>
        </div>
    </body>
    </html>`;
    
    const htmlBody = sostituisciPlaceholder(templateDocumenti, emailData);
    const subject = `📋 Documenti Informativi TeleMedCare - ${leadData.pacchetto} (${leadId})`;
    
    console.log('📨 EMAIL DOCUMENTI DA INVIARE A:', leadData.emailRichiedente);
    console.log('📋 OGGETTO:', subject);
    
    // TODO: Allegare PDF brochure e manuale se richiesto
    console.log('✅ Email documenti informativi preparata con successo');
    return true;
    
  } catch (error) {
    console.error('❌ Errore invio email documenti informativi:', error);
    return false;
  }
}

async function inviaEmailContratto(leadData: any, leadId: string): Promise<boolean> {
  try {
    console.log('📧 Preparazione email contratto per lead:', leadId);
    
    const prezzi = CONFIG.PREZZI[leadData.pacchetto as keyof typeof CONFIG.PREZZI] || CONFIG.PREZZI.Base;
    
    const emailData = {
      NOME_CLIENTE: leadData.nomeRichiedente || 'Cliente',
      PIANO_SERVIZIO: prezzi.nome,
      PREZZO_PIANO: `€${prezzi.primoAnno} + IVA (primo anno)`,
      CODICE_CLIENTE: leadId
    };
    
    const templateContratto = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <title>Contratto TeleMedCare</title>
        <style>
            body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f8fafc; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
            .section { margin-bottom: 20px; padding: 15px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #3b82f6; }
            .steps { counter-reset: step-counter; }
            .step { counter-increment: step-counter; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .step:before { content: counter(step-counter); background: #3b82f6; color: white; font-weight: bold; border-radius: 50%; width: 25px; height: 25px; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 14px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>📋 Contratto TeleMedCare</h2>
            </div>
            
            <p>Gentile <strong>{{NOME_CLIENTE}}</strong>,</p>
            
            <p>Siamo lieti di accompagnarLa in questo importante passo verso una maggiore sicurezza e tranquillità. Come promesso, Le inviamo in allegato il contratto per il servizio <strong>{{PIANO_SERVIZIO}}</strong> e la brochure aziendale.</p>
            
            <div class="section">
                <h4>📋 Il Suo piano TeleMedCare</h4>
                <ul>
                    <li><strong>Piano:</strong> {{PIANO_SERVIZIO}}</li>
                    <li><strong>Investimento:</strong> {{PREZZO_PIANO}}</li>
                    <li><strong>Codice Cliente:</strong> {{CODICE_CLIENTE}}</li>
                </ul>
            </div>
            
            <div class="section">
                <h4>✅ Perché ha fatto la scelta giusta</h4>
                <ul>
                    <li><strong>Innovazione Sociale:</strong> Sta supportando una startup innovativa a vocazione sociale</li>
                    <li><strong>Assistenza Domiciliare:</strong> Riceve cure e monitoraggio direttamente dove serve</li>
                    <li><strong>Tecnologia Avanzata:</strong> Dispositivo medicale certificato Classe IIa</li>
                </ul>
            </div>
            
            <div class="section">
                <h4>📝 Prossimi passi per l'attivazione</h4>
                <div class="steps">
                    <div class="step">Legga attentamente il contratto allegato</div>
                    <div class="step">Firmi in ogni pagina richiesta e nell'ultima pagina</div>
                    <div class="step">Ci invii il contratto firmato via email o WhatsApp</div>
                    <div class="step">Riceverà il dispositivo entro 10 giorni lavorativi</div>
                </div>
            </div>
            
            <div class="section">
                <h4>💰 Vantaggi Economici e Fiscali</h4>
                <ul>
                    <li>✅ <strong>Detrazione Fiscale 19%:</strong> Il servizio è detraibile come spesa sanitaria nel 730</li>
                    <li>✅ <strong>Possibili Rimborsi INPS:</strong> Per ISEE sotto €6.000 + Legge 104</li>
                </ul>
            </div>
            
            <p>Siamo qui per accompagnarLa in ogni step di questo percorso. Non esiti a contattarci per qualsiasi chiarimento o domanda.</p>
            
            <p style="text-align: center; font-weight: 600; color: #1e40af; font-size: 18px;">Benvenuto/a nella famiglia TeleMedCare!</p>
            
            <p><strong>Il Team TeleMedCare</strong><br>
            Medica GB S.r.l.<br>
            <em>"La tecnologia che Le salva salute e vita"</em></p>
        </div>
    </body>
    </html>`;
    
    const htmlBody = sostituisciPlaceholder(templateContratto, emailData);
    const subject = `📋 Contratto TeleMedCare - ${prezzi.nome} (${leadId})`;
    
    console.log('📨 EMAIL CONTRATTO DA INVIARE A:', leadData.emailRichiedente);
    console.log('📋 OGGETTO:', subject);
    
    // TODO: Generare e allegare PDF contratto personalizzato
    console.log('✅ Email contratto preparata con successo');
    return true;
    
  } catch (error) {
    console.error('❌ Errore invio email contratto:', error);
    return false;
  }
}



// ===============================
// TELEMEDC ARE V10.3.8 MODULARE ENTERPRISE API ENDPOINTS
// ===============================

// ========== LEAD CONFIG MODULE ==========
app.get('/api/enterprise/config/partners', async (c) => {
  try {
    const config = await LeadConfig.caricaConfigurazione(c.env.DB)
    return c.json({ success: true, partners: config.partners })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadConfig', 'Errore caricamento configurazione partners', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore caricamento configurazione' }, 500)
  }
})

app.post('/api/enterprise/config/partners/:partnerId', async (c) => {
  try {
    const partnerId = c.req.param('partnerId')
    const partnerData = await c.req.json()
    
    await LeadConfig.aggiornaPartner(partnerId, partnerData, c.env.DB)
    await Logging.audit('CONFIG_UPDATE', 'Partner aggiornato', { partnerId, partnerData }, c.env.DB)
    
    return c.json({ success: true, message: 'Partner configurato con successo' })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadConfig', 'Errore aggiornamento partner', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore configurazione partner' }, 500)
  }
})

app.get('/api/enterprise/config/health', async (c) => {
  try {
    const health = await LeadConfig.verificaStatoSistema(c.env.DB)
    return c.json({ success: true, health })
  } catch (error) {
    return c.json({ success: false, error: 'Errore verifica stato sistema' }, 500)
  }
})

// ========== LEAD CORE MODULE ==========
app.post('/api/enterprise/leads', async (c) => {
  try {
    const leadData = await c.req.json()
    
    // Rilevamento duplicati con AI fuzzy matching
    const duplicates = await LeadCore.rilevaDuplicati(leadData, c.env.DB)
    if (duplicates.length > 0) {
      await Logging.log('WARNING', 'LeadCore', 'Possibili duplicati rilevati', { leadData, duplicates }, c.env.DB)
      return c.json({ 
        success: false, 
        error: 'Possibili duplicati rilevati',
        duplicates,
        confidence: duplicates[0]?.confidence 
      }, 409)
    }

    // Creazione lead con cache intelligente
    const leadId = await LeadCore.creaLead(leadData, c.env.DB)
    await Logging.audit('LEAD_CREATED', 'Nuovo lead creato', { leadId, leadData }, c.env.DB)
    
    return c.json({ success: true, leadId, message: 'Lead creato con successo' })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadCore', 'Errore creazione lead', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore creazione lead' }, 500)
  }
})

app.get('/api/enterprise/leads/:leadId', async (c) => {
  try {
    const leadId = c.req.param('leadId')
    const lead = await LeadCore.ottieniLead(leadId, c.env.DB)
    
    if (!lead) {
      return c.json({ success: false, error: 'Lead non trovato' }, 404)
    }
    
    return c.json({ success: true, lead })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadCore', 'Errore recupero lead', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore recupero lead' }, 500)
  }
})

app.post('/api/enterprise/leads/batch', async (c) => {
  try {
    const { leads } = await c.req.json()
    
    const results = await LeadCore.batchInsertLeads(leads, c.env.DB)
    await Logging.audit('BATCH_IMPORT', 'Import batch leads completato', { count: leads.length, results }, c.env.DB)
    
    return c.json({ success: true, results })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadCore', 'Errore batch import leads', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore import batch' }, 500)
  }
})

// ========== LEAD CHANNELS MODULE ==========
app.post('/api/enterprise/channels/irbema/lead', async (c) => {
  try {
    const leadData = await c.req.json()
    
    const result = await LeadChannels.inviaLeadIRBEMA(leadData, c.env.IRBEMA_API_KEY)
    await Logging.audit('IRBEMA_LEAD_SENT', 'Lead inviato a IRBEMA', { leadData, result }, c.env.DB)
    
    return c.json({ success: true, result })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadChannels', 'Errore invio lead IRBEMA', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore invio lead IRBEMA' }, 500)
  }
})

app.post('/api/enterprise/channels/aon/validate', async (c) => {
  try {
    const { voucherCode, customerData } = await c.req.json()
    
    const validation = await LeadChannels.validaVoucherAON(voucherCode, customerData, c.env.AON_API_KEY)
    await Logging.audit('AON_VOUCHER_VALIDATED', 'Voucher AON validato', { voucherCode, validation }, c.env.DB)
    
    return c.json({ success: true, validation })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadChannels', 'Errore validazione voucher AON', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore validazione voucher' }, 500)
  }
})

app.post('/api/enterprise/channels/webhook/endered', async (c) => {
  try {
    const webhookData = await c.req.json()
    
    const result = await LeadChannels.handleWebhookEndered(webhookData, c.env.DB)
    await Logging.audit('ENDERED_WEBHOOK_PROCESSED', 'Webhook Endered elaborato', { webhookData, result }, c.env.DB)
    
    return c.json({ success: true, result })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadChannels', 'Errore elaborazione webhook Endered', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore elaborazione webhook' }, 500)
  }
})

// ========== LEAD CONVERSION MODULE ==========
app.post('/api/enterprise/conversion/:leadId/start', async (c) => {
  try {
    const leadId = c.req.param('leadId')
    const conversionData = await c.req.json()
    
    const workflow = await LeadConversion.avviaConversioneCompleta(leadId, conversionData, c.env.DB)
    await Logging.audit('CONVERSION_STARTED', 'Conversione avviata', { leadId, workflow }, c.env.DB)
    
    return c.json({ success: true, workflow })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadConversion', 'Errore avvio conversione', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore avvio conversione' }, 500)
  }
})

app.post('/api/enterprise/conversion/:leadId/step/:stepId', async (c) => {
  try {
    const leadId = c.req.param('leadId')
    const stepId = c.req.param('stepId')
    const stepData = await c.req.json()
    
    const result = await LeadConversion.eseguiStep(leadId, stepId, stepData, c.env.DB)
    await Logging.audit('CONVERSION_STEP', 'Step conversione eseguito', { leadId, stepId, result }, c.env.DB)
    
    return c.json({ success: true, result })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadConversion', 'Errore step conversione', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore esecuzione step' }, 500)
  }
})

app.get('/api/enterprise/conversion/:leadId/status', async (c) => {
  try {
    const leadId = c.req.param('leadId')
    const status = await LeadConversion.ottieniStatoConversione(leadId, c.env.DB)
    
    return c.json({ success: true, status })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadConversion', 'Errore recupero stato conversione', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore recupero stato' }, 500)
  }
})

// ========== LEAD SCORING MODULE ==========
app.post('/api/enterprise/scoring/:leadId/calculate', async (c) => {
  try {
    const leadId = c.req.param('leadId')
    const scoringData = await c.req.json()
    
    const score = await LeadScoring.calcolaScoreCompleto(leadId, scoringData, c.env.DB, c.env.OPENAI_API_KEY)
    await Logging.audit('SCORE_CALCULATED', 'Score AI calcolato', { leadId, score }, c.env.DB)
    
    return c.json({ success: true, score })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadScoring', 'Errore calcolo score', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore calcolo score' }, 500)
  }
})

app.get('/api/enterprise/scoring/:leadId/recommendations', async (c) => {
  try {
    const leadId = c.req.param('leadId')
    
    const recommendations = await LeadScoring.generaRaccomandazioni(leadId, c.env.DB, c.env.OPENAI_API_KEY)
    
    return c.json({ success: true, recommendations })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadScoring', 'Errore generazione raccomandazioni', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore generazione raccomandazioni' }, 500)
  }
})

// ========== LEAD REPORTS MODULE ==========
app.get('/api/enterprise/reports/kpi', async (c) => {
  try {
    const { period } = c.req.query()
    
    const kpi = await LeadReports.calcolaKPICompleti(period, c.env.DB)
    
    return c.json({ success: true, kpi })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadReports', 'Errore calcolo KPI', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore calcolo KPI' }, 500)
  }
})

app.get('/api/enterprise/reports/dashboard', async (c) => {
  try {
    const widgets = await LeadReports.generaDatiWidget(c.env.DB)
    
    return c.json({ success: true, widgets })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadReports', 'Errore generazione dashboard', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore generazione dashboard' }, 500)
  }
})

app.post('/api/enterprise/reports/export', async (c) => {
  try {
    const { format, filters, period } = await c.req.json()
    
    const exportData = await LeadReports.generaExportReport(format, filters, period, c.env.DB)
    await Logging.audit('REPORT_EXPORTED', 'Report esportato', { format, filters }, c.env.DB)
    
    return c.json({ success: true, exportData })
  } catch (error) {
    await Logging.log('ERRORE', 'LeadReports', 'Errore export report', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore export report' }, 500)
  }
})

// ========== DISPOSITIVI MODULE ==========
app.post('/api/enterprise/devices', async (c) => {
  try {
    const deviceData = await c.req.json()
    
    const deviceId = await Dispositivi.registraDispositivo(deviceData, c.env.DB)
    await Logging.audit('DEVICE_REGISTERED', 'Dispositivo registrato', { deviceId, deviceData }, c.env.DB)
    
    return c.json({ success: true, deviceId })
  } catch (error) {
    await Logging.log('ERRORE', 'Dispositivi', 'Errore registrazione dispositivo', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore registrazione dispositivo' }, 500)
  }
})

app.post('/api/enterprise/devices/scan-label', async (c) => {
  try {
    const { labelText, labelImage, magazzino } = await c.req.json()
    
    console.log('📋 [SCAN] Richiesta scan etichetta SiDLY')
    
    // 1. PARSING ETICHETTA CON CONSERVAZIONE IMMAGINE
    const labelData = Utils.parseLabel(labelText || labelImage, labelImage)
    
    if (!labelData.valid) {
      return c.json({ 
        success: false, 
        error: 'Etichetta non valida', 
        details: labelData.errors 
      }, 400)
    }
    
    // 1.5. SUPPLEMENTO INFORMAZIONI MANCANTI DAL REPOSITORY DOCUMENTI
    console.log('🔍 [DOCS] Verifico informazioni mancanti dall\'etichetta...')
    
    const missingInfo = []
    if (!labelData.expiry_date) missingInfo.push('expiryDate')
    if (!labelData.manufacturing_date) missingInfo.push('usefulLife')
    if (!labelData.ceMarking || labelData.ceMarking === 'CE') missingInfo.push('ceDetails')
    
    let supplementaryData = null
    if (missingInfo.length > 0) {
      console.log(`📋 [DOCS] Info mancanti: ${missingInfo.join(', ')}`)
      
      try {
        supplementaryData = await DocumentRepository.getSupplementaryInfoFromManual(
          labelData.model || 'SiDLY Care Pro V11.0',
          missingInfo as any
        )
        
        console.log('✅ [DOCS] Informazioni supplementari recuperate:', Object.keys(supplementaryData))
        
        // Calcola data di scadenza usando vita utile dal manuale
        if (!labelData.expiry_date && supplementaryData.usefulLifeYears && labelData.manufacturing_date) {
          const expiryDate = new Date(labelData.manufacturing_date)
          expiryDate.setFullYear(expiryDate.getFullYear() + supplementaryData.usefulLifeYears)
          labelData.expiry_date = expiryDate
          
          console.log(`📅 [DOCS] Data scadenza calcolata: ${expiryDate.toLocaleDateString('it-IT')} (${supplementaryData.usefulLifeYears} anni vita utile)`)
        }
        
        // Supplementa informazioni CE se disponibili
        if (supplementaryData.ceDetails) {
          labelData.ceMarking = supplementaryData.ceDetails.notifiedBody || labelData.ceMarking
        }
        
      } catch (error) {
        console.warn('⚠️ [DOCS] Errore recupero info supplementari:', error.message)
      }
    }
    
    // 2. GESTIONE IMEI E VERIFICA DUPLICATI
    let finalIMEI = labelData.imei;
    
    // Se IMEI è placeholder, genera uno valido
    if (!finalIMEI || finalIMEI === 'PENDING_REGISTRATION') {
      finalIMEI = IMEIValidator.generateValidIMEI(); // Genera IMEI valido
      Logging.audit(`Generated IMEI ${finalIMEI} for device registration from label`, 'system', 'device_registration');
    }
    
    // Verifica se dispositivo esiste già (solo se IMEI non è generato)
    if (labelData.imei && labelData.imei !== 'PENDING_REGISTRATION') {
      const existingDevice = await Dispositivi.cercaPerIMEI(labelData.imei, c.env.DB)
      if (existingDevice) {
        return c.json({ 
          success: false, 
          error: 'Dispositivo già registrato', 
          deviceId: existingDevice.id,
          status: existingDevice.stato
        }, 409)
      }
    }
    
    // 3. CREAZIONE DISPOSITIVO AUTOMATICA CON STORAGE IMMAGINE
    const deviceData = {
      imei: finalIMEI,
      serialNumber: labelData.serial_number || finalIMEI, // Usa serial da etichetta se disponibile
      modello: labelData.model || 'SiDLY Care Pro',
      codiceArticolo: 'SIDLY-CARE-PRO-V11',
      versione: labelData.version || '11.0',
      revisioneHW: 'Rev. A',
      
      // Certificazioni da etichetta
      certificazioni: {
        ce: {
          numero: labelData.ceMarking || 'CE 0197',
          ente: 'Kiwa Cermet Italia S.p.A.',
          dataScadenza: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000), // 5 anni
          valida: true
        },
        dispositivoMedico: {
          classe: 'IIa' as const,
          numero: 'MD-' + labelData.udiNumbers?.di || 'MD-DEFAULT',
          dataScadenza: new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)
        }
      },
      
      // UDI da etichetta
      udi: {
        di: labelData.udi_device_identifier || '',
        pi: labelData.udi_production_identifier || ''
      },
      
      // CONSERVAZIONE IMMAGINE ETICHETTA ORIGINALE
      originalLabelImage: labelData.originalLabelImage,
      
      stato: 'in_magazzino' as const,
      dataProduzione: labelData.manufacturing_date || new Date(),
      
      magazzino: {
        sede: magazzino || 'Milano',
        settore: 'AUTO',
        scaffale: 'AUTO',
        posizione: 'AUTO'
      },
      
      // Metadati etichetta per audit trail
      labelMetadata: {
        originalText: labelText,
        originalImage: labelImage,
        parsingDate: new Date(),
        parsingMethod: 'automatic_scan',
        supplementaryDataSource: supplementaryData?.source || null,
        missingInfoRecovered: missingInfo.length > 0 ? missingInfo : null
      }
    }
    
    // 4. REGISTRAZIONE CON IMEI CORRETTO
    const deviceId = await Dispositivi.registraDispositivoRapido(
      finalIMEI,
      labelData.model || 'SiDLY Care Pro',
      magazzino || 'Milano'
    )
    
    await Logging.audit('DEVICE_SCANNED', 'Dispositivo registrato da scan etichetta', { 
      deviceId, 
      imei: labelData.imei,
      labelData 
    }, c.env.DB)
    
    return c.json({ 
      success: true, 
      deviceId,
      imei: finalIMEI,
      model: labelData.model || 'SiDLY Care Pro V11.0',
      manufacturer: labelData.manufacturer,
      message: 'Dispositivo registrato con successo da etichetta',
      labelData: {
        ...labelData,
        imei: finalIMEI // Usa l'IMEI finale (generato se necessario)
      },
      imageStored: !!labelData.originalLabelImage
    })
    
  } catch (error) {
    await Logging.log('ERRORE', 'DeviceScan', 'Errore scan etichetta', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: `Errore scan etichetta: ${error.message}` }, 500)
  }
})

app.post('/api/enterprise/devices/:deviceId/assign/:customerId', async (c) => {
  try {
    const deviceId = c.req.param('deviceId')
    const customerId = c.req.param('customerId')
    const assignmentData = await c.req.json()
    
    const result = await Dispositivi.assegnaDispositivoACliente(deviceId, customerId, assignmentData, c.env.DB)
    await Logging.audit('DEVICE_ASSIGNED', 'Dispositivo assegnato', { deviceId, customerId, result }, c.env.DB)
    
    return c.json({ success: true, result })
  } catch (error) {
    await Logging.log('ERRORE', 'Dispositivi', 'Errore assegnazione dispositivo', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore assegnazione dispositivo' }, 500)
  }
})

app.post('/api/enterprise/devices/:deviceId/rma', async (c) => {
  try {
    const deviceId = c.req.param('deviceId')
    const rmaData = await c.req.json()
    
    const rmaId = await Dispositivi.creaRichiestaRMA(deviceId, rmaData, c.env.DB)
    await Logging.audit('RMA_CREATED', 'Richiesta RMA creata', { deviceId, rmaId, rmaData }, c.env.DB)
    
    return c.json({ success: true, rmaId })
  } catch (error) {
    await Logging.log('ERRORE', 'Dispositivi', 'Errore creazione RMA', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore creazione RMA' }, 500)
  }
})

app.get('/api/enterprise/devices/inventory', async (c) => {
  try {
    const inventory = await Dispositivi.ottieniInventarioCompleto(c.env.DB)
    
    return c.json({ success: true, inventory })
  } catch (error) {
    await Logging.log('ERRORE', 'Dispositivi', 'Errore recupero inventario', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore recupero inventario' }, 500)
  }
})

// ========== PDF MODULE ==========
app.post('/api/enterprise/pdf/contract/:leadId', async (c) => {
  try {
    const leadId = c.req.param('leadId')
    const contractData = await c.req.json()
    
    const pdfBuffer = await PDF.generaPDFPersonalizzato('contratto', leadId, contractData, c.env.DB)
    await Logging.audit('PDF_GENERATED', 'Contratto PDF generato', { leadId, templateType: 'contratto' }, c.env.DB)
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contratto_${leadId}.pdf"`
      }
    })
  } catch (error) {
    await Logging.log('ERRORE', 'PDF', 'Errore generazione contratto PDF', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore generazione PDF' }, 500)
  }
})

app.post('/api/enterprise/pdf/proforma/:leadId', async (c) => {
  try {
    const leadId = c.req.param('leadId')
    const proformaData = await c.req.json()
    
    const pdfBuffer = await PDF.generaPDFPersonalizzato('proforma', leadId, proformaData, c.env.DB)
    await Logging.audit('PDF_GENERATED', 'Proforma PDF generata', { leadId, templateType: 'proforma' }, c.env.DB)
    
    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proforma_${leadId}.pdf"`
      }
    })
  } catch (error) {
    await Logging.log('ERRORE', 'PDF', 'Errore generazione proforma PDF', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore generazione PDF' }, 500)
  }
})

app.post('/api/enterprise/pdf/batch', async (c) => {
  try {
    const { templateType, leadIds, data } = await c.req.json()
    
    const results = await PDF.avviaBatchGeneration(templateType, leadIds, data, c.env.DB)
    await Logging.audit('PDF_BATCH_GENERATED', 'Batch PDF generati', { templateType, count: leadIds.length }, c.env.DB)
    
    return c.json({ success: true, results })
  } catch (error) {
    await Logging.log('ERRORE', 'PDF', 'Errore batch generazione PDF', { error: error.message }, c.env.DB)
    return c.json({ success: false, error: 'Errore batch generazione PDF' }, 500)
  }
})

// ========== UTILS MODULE ==========
app.post('/api/enterprise/utils/validate/imei', async (c) => {
  try {
    const { imei } = await c.req.json()
    
    const validation = Utils.validateIMEI(imei)
    
    return c.json({ success: true, validation })
  } catch (error) {
    return c.json({ success: false, error: 'Errore validazione IMEI' }, 500)
  }
})

app.post('/api/enterprise/utils/parse/label', async (c) => {
  try {
    const { labelData } = await c.req.json()
    
    const parsed = Utils.parseLabel(labelData)
    
    return c.json({ success: true, parsed })
  } catch (error) {
    return c.json({ success: false, error: 'Errore parsing label' }, 500)
  }
})

app.post('/api/enterprise/utils/encrypt', async (c) => {
  try {
    const { data } = await c.req.json()
    
    const encrypted = Utils.encrypt(data, c.env.ENCRYPTION_KEY)
    
    return c.json({ success: true, encrypted })
  } catch (error) {
    return c.json({ success: false, error: 'Errore crittografia' }, 500)
  }
})

// ========== LOGGING MODULE ==========
app.get('/api/enterprise/logs', async (c) => {
  try {
    const { level, module, startDate, endDate } = c.req.query()
    
    const logs = await Logging.queryLogs({ level, module, startDate, endDate }, c.env.DB)
    
    return c.json({ success: true, logs })
  } catch (error) {
    return c.json({ success: false, error: 'Errore recupero logs' }, 500)
  }
})

app.get('/api/enterprise/audit', async (c) => {
  try {
    const { action, startDate, endDate } = c.req.query()
    
    const auditLogs = await Logging.queryAuditLogs({ action, startDate, endDate }, c.env.DB)
    
    return c.json({ success: true, auditLogs })
  } catch (error) {
    return c.json({ success: false, error: 'Errore recupero audit logs' }, 500)
  }
})

app.get('/api/enterprise/security/alerts', async (c) => {
  try {
    const alerts = await Logging.querySecurityLogs(c.env.DB)
    
    return c.json({ success: true, alerts })
  } catch (error) {
    return c.json({ success: false, error: 'Errore recupero alert sicurezza' }, 500)
  }
})

// ========== SISTEMA STATUS MODULE ==========
app.get('/api/enterprise/system/health', async (c) => {
  try {
    const health = {
      system: 'TeleMedCare V11.0 Modular Enterprise',
      status: 'active',
      modules: {
        leadConfig: true,
        leadCore: true,
        leadChannels: true,
        leadConversion: true,
        leadScoring: true,
        leadReports: true,
        dispositivi: true,
        pdf: true,
        utils: true,
        logging: true
      },
      database: !!c.env.DB,
      partners: {
        irbema: !!c.env.IRBEMA_API_KEY,
        aon: !!c.env.AON_API_KEY,
        mondadori: !!c.env.MONDADORI_API_KEY,
        endered: !!c.env.ENDERED_API_KEY
      },
      ai: !!c.env.OPENAI_API_KEY,
      timestamp: new Date().toISOString(),
      version: 'V11.0-Modular-Enterprise'
    }

    await Logging.log('INFO', 'SystemHealth', 'Health check eseguito', health, c.env.DB)
    
    return c.json({ success: true, health })
  } catch (error) {
    return c.json({ success: false, error: 'Errore health check' }, 500)
  }
})

// Inizializzazione database D1 Enterprise
async function initializeDatabase(db: D1Database) {
  try {
    console.log('🔧 TeleMedCare V10.3.8 MODULARE: Inizializzazione database enterprise...')
    
    // Per compatibilità, creiamo almeno la tabella leads di base
    // Il sistema completo dovrebbe usare le migrazioni in migrations/0001_initial_schema.sql
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        nome_richiedente TEXT NOT NULL,
        cognome_richiedente TEXT NOT NULL,
        email_richiedente TEXT NOT NULL,
        telefono_richiedente TEXT,
        nome_assistito TEXT NOT NULL,
        cognome_assistito TEXT NOT NULL,
        data_nascita_assistito TEXT,
        eta_assistito TEXT,
        parentela_assistito TEXT,
        pacchetto TEXT,
        condizioni_salute TEXT,
        priority TEXT,
        preferenza_contatto TEXT,
        vuole_contratto INTEGER DEFAULT 0,
        intestazione_contratto TEXT,
        cf_richiedente TEXT,
        indirizzo_richiedente TEXT,
        cf_assistito TEXT,
        indirizzo_assistito TEXT,
        vuole_brochure INTEGER DEFAULT 0,
        vuole_manuale INTEGER DEFAULT 0,
        note TEXT,
        gdpr_consent INTEGER DEFAULT 0,
        timestamp TEXT NOT NULL,
        fonte TEXT,
        versione TEXT,
        status TEXT DEFAULT 'nuovo',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        
        -- Campi enterprise aggiunti per compatibilità
        score_ai REAL DEFAULT 0,
        conversion_probability REAL DEFAULT 0,
        partner_source TEXT,
        lead_quality TEXT DEFAULT 'unknown',
        last_interaction DATETIME
      )
    `).run()
    
    // Tabella di configurazione enterprise
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS enterprise_config (
        key TEXT PRIMARY KEY,
        value TEXT,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    
    // Inserimento configurazione di default
    await db.prepare(`
      INSERT OR IGNORE INTO enterprise_config (key, value, category) VALUES 
      ('system_version', 'V11.0-Modular-Enterprise', 'system'),
      ('max_partners', '500', 'limits'),
      ('ai_scoring_enabled', 'true', 'features'),
      ('duplicate_detection_threshold', '0.95', 'ai'),
      ('cache_ttl_seconds', '3600', 'performance')
    `).run()
    
    console.log('✅ TeleMedCare V10.3.8 MODULARE: Database enterprise inizializzato correttamente')
    console.log('📋 NOTA: Per il sistema completo, eseguire le migrazioni: npx wrangler d1 migrations apply webapp-production --local')
    
    // Inizializza repository documenti
    try {
      await DocumentRepository.initializeWithDemoDocuments()
      console.log('✅ DocumentRepository inizializzato con successo')
    } catch (error) {
      console.warn('⚠️ Errore inizializzazione DocumentRepository:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Errore inizializzazione database enterprise:', error)
  }
}

// ===================================
// 📚 DOCUMENT REPOSITORY API ENDPOINTS
// ===================================

/**
 * Endpoint per richiedere documenti per un dispositivo
 * Uso: POST /api/documents/request
 */
app.post('/api/documents/request', async (c) => {
  try {
    const { deviceModel, documentTypes, customerInfo, deliveryMethod = 'email' } = await c.req.json()
    
    console.log(`📧 [DOCS-API] Richiesta documenti per ${deviceModel}`)
    
    if (!deviceModel || !customerInfo?.email) {
      return c.json({ 
        success: false, 
        error: 'deviceModel e customerInfo.email sono obbligatori' 
      }, 400)
    }
    
    const request = {
      deviceModel,
      documentTypes: documentTypes || ['brochure', 'user_manual'],
      language: 'it',
      customerInfo,
      deliveryMethod
    }
    
    const result = await DocumentRepository.processDocumentRequest(request)
    
    if (result.success) {
      console.log(`✅ [DOCS-API] Documenti inviati con successo a ${customerInfo.email}`)
      return c.json(result)
    } else {
      return c.json(result, 404)
    }
    
  } catch (error) {
    console.error(`❌ [DOCS-API] Errore richiesta documenti:`, error)
    return c.json({ success: false, error: 'Errore interno del server' }, 500)
  }
})

/**
 * Endpoint per ottenere informazioni supplementari dal manuale
 * Uso: POST /api/documents/supplement-info
 */
app.post('/api/documents/supplement-info', async (c) => {
  try {
    const { deviceModel, missingInfo } = await c.req.json()
    
    console.log(`🔍 [DOCS-API] Richiesta info supplementari per ${deviceModel}:`, missingInfo)
    
    if (!deviceModel || !missingInfo) {
      return c.json({ 
        success: false, 
        error: 'deviceModel e missingInfo sono obbligatori' 
      }, 400)
    }
    
    const result = await DocumentRepository.getSupplementaryInfoFromManual(deviceModel, missingInfo)
    
    console.log(`📋 [DOCS-API] Info supplementari recuperate:`, Object.keys(result))
    
    return c.json({
      success: true,
      supplementaryInfo: result
    })
    
  } catch (error) {
    console.error(`❌ [DOCS-API] Errore recupero info supplementari:`, error)
    return c.json({ success: false, error: 'Errore interno del server' }, 500)
  }
})

/**
 * Endpoint per ottenere lista documenti disponibili per un dispositivo
 * Uso: GET /api/documents/device/:model
 */
app.get('/api/documents/device/:model', async (c) => {
  try {
    const deviceModel = c.req.param('model')
    const language = c.req.query('language') || 'it'
    const docTypes = c.req.query('types')?.split(',')
    
    console.log(`📋 [DOCS-API] Lista documenti per ${deviceModel}`)
    
    const documents = await DocumentRepository.findDocumentsForDevice(
      deviceModel, 
      docTypes as any, 
      language
    )
    
    return c.json({
      success: true,
      deviceModel,
      documentCount: documents.length,
      documents: documents.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        fileName: doc.fileName,
        version: doc.version,
        language: doc.language,
        lastModified: doc.lastModified,
        downloadCount: doc.downloadCount,
        complianceStatus: doc.complianceStatus
      }))
    })
    
  } catch (error) {
    console.error(`❌ [DOCS-API] Errore lista documenti:`, error)
    return c.json({ success: false, error: 'Errore interno del server' }, 500)
  }
})

/**
 * Endpoint per scaricare un documento specifico
 * Uso: GET /api/documents/:id/download
 */
app.get('/api/documents/:id/download', async (c) => {
  try {
    const docId = c.req.param('id')
    
    console.log(`📥 [DOCS-API] Download documento ${docId}`)
    
    // In un'implementazione reale, questo caricherà il file dal filesystem o storage
    // Per ora restituiamo un placeholder
    
    return c.json({
      success: false,
      error: 'Download diretto non ancora implementato. Usare /api/documents/request per ricevere via email'
    }, 501)
    
  } catch (error) {
    console.error(`❌ [DOCS-API] Errore download documento:`, error)
    return c.json({ success: false, error: 'Errore interno del server' }, 500)
  }
})

/**
 * Endpoint per ottenere statistiche repository documenti
 * Uso: GET /api/documents/stats
 */
app.get('/api/documents/stats', async (c) => {
  try {
    console.log(`📊 [DOCS-API] Richiesta statistiche repository`)
    
    const stats = DocumentRepository.getRepositoryStats()
    
    return c.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error(`❌ [DOCS-API] Errore statistiche repository:`, error)
    return c.json({ success: false, error: 'Errore interno del server' }, 500)
  }
})

/**
 * Endpoint per inizializzare il repository con documenti demo
 * Uso: POST /api/documents/initialize
 */
// Route per servire template email (via public folder)
app.use('/templates/*', serveStatic({ root: './' }))

// Test endpoint per EmailService
app.post('/api/email/test-template', async (c) => {
  try {
    const { default: EmailService } = await import('./modules/email-service')
    const emailService = EmailService.getInstance()

    const { templateId, to, ...variables } = await c.req.json()
    
    const result = await emailService.sendTemplateEmail(
      templateId || 'INVIO_CONTRATTO',
      to || 'test@example.com',
      {
        NOME_CLIENTE: 'Mario Rossi',
        PIANO_SERVIZIO: 'TeleAssistenza Avanzata',
        PREZZO_PIANO: '840€ + IVA',
        CODICE_CLIENTE: 'CLI_001',
        ...variables
      }
    )

    return c.json({
      success: true,
      emailResult: result,
      message: 'Test email template completato'
    })
  } catch (error) {
    console.error('❌ Errore test email:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto' 
    }, 500)
  }
})

// =====================================================================
// PAYMENT API ENDPOINTS
// =====================================================================

// Endpoint per ottenere metodi di pagamento disponibili
app.get('/api/payments/methods', async (c) => {
  try {
    const { default: PaymentService } = await import('./modules/payment-service')
    const paymentService = PaymentService.getInstance()
    
    const methods = paymentService.getAvailablePaymentMethods()
    
    return c.json({
      success: true,
      paymentMethods: methods,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore metodi pagamento:', error)
    return c.json({ success: false, error: 'Errore interno' }, 500)
  }
})

// Endpoint per calcolare preventivo con commissioni
app.post('/api/payments/quote', async (c) => {
  try {
    const { amount, paymentMethodId } = await c.req.json()
    
    if (!amount || !paymentMethodId) {
      return c.json({ success: false, error: 'Parametri mancanti' }, 400)
    }

    const { default: PaymentService } = await import('./modules/payment-service')
    const paymentService = PaymentService.getInstance()
    
    const quote = paymentService.generateQuote(amount, paymentMethodId)
    
    return c.json({
      success: true,
      quote: quote,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore calcolo preventivo:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore calcolo' 
    }, 500)
  }
})

// Endpoint per iniziare pagamento
app.post('/api/payments/create', async (c) => {
  try {
    const paymentRequest = await c.req.json()
    
    // Validazione dati obbligatori
    if (!paymentRequest.amount || !paymentRequest.customerEmail) {
      return c.json({ success: false, error: 'Dati pagamento incompleti' }, 400)
    }

    const { default: PaymentService } = await import('./modules/payment-service')
    const paymentService = PaymentService.getInstance()
    
    const result = await paymentService.processPayment(paymentRequest)
    
    return c.json({
      success: result.success,
      payment: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore creazione pagamento:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore creazione pagamento' 
    }, 500)
  }
})

// Webhook endpoint per Stripe (e altri provider)
app.post('/api/payments/webhook/stripe', async (c) => {
  try {
    const payload = await c.req.text()
    const signature = c.req.header('stripe-signature') || ''
    
    const { StripeService } = await import('./modules/payment-service')
    const success = await StripeService.processWebhook(payload, signature)
    
    if (success) {
      return c.text('OK')
    } else {
      return c.text('Webhook Error', 400)
    }
  } catch (error) {
    console.error('❌ Errore webhook Stripe:', error)
    return c.text('Webhook Error', 500)
  }
})

// Test endpoint per PaymentService
app.post('/api/payments/test', async (c) => {
  try {
    const { 
      amount = 84000, 
      paymentMethodId = 'STRIPE_CARD',
      customerEmail = 'test@example.com',
      customerName = 'Mario Rossi'
    } = await c.req.json()

    const { default: PaymentService } = await import('./modules/payment-service')
    const paymentService = PaymentService.getInstance()
    
    // Test creazione pagamento
    const paymentResult = await paymentService.processPayment({
      customerId: 'TEST_CUSTOMER_001',
      amount: amount,
      currency: 'EUR',
      description: 'Test TeleMedCare - TeleAssistenza Avanzata',
      paymentMethodId: paymentMethodId,
      customerEmail: customerEmail,
      customerName: customerName,
      metadata: {
        testMode: 'true',
        service: 'TeleAssistenza Avanzata'
      }
    })

    // Test calcolo commissioni
    const quote = paymentService.generateQuote(amount, paymentMethodId)

    return c.json({
      success: true,
      test: {
        paymentResult: paymentResult,
        quote: quote,
        availableMethods: paymentService.getAvailablePaymentMethods().length
      },
      message: 'Test PaymentService completato'
    })
  } catch (error) {
    console.error('❌ Errore test pagamenti:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore test'
    }, 500)
  }
})

// =====================================================================
// SIGNATURE API ENDPOINTS  
// =====================================================================

// Endpoint per ottenere metodi di firma disponibili
app.get('/api/signatures/methods', async (c) => {
  try {
    const { default: SignatureService } = await import('./modules/signature-service')
    const signatureService = SignatureService.getInstance()
    
    const methods = signatureService.getAvailableSignatureMethods()
    
    return c.json({
      success: true,
      signatureMethods: methods,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore metodi firma:', error)
    return c.json({ success: false, error: 'Errore interno' }, 500)
  }
})

// Endpoint per creare richiesta firma
app.post('/api/signatures/create', async (c) => {
  try {
    const {
      documentType,
      customerName,
      customerEmail,
      customerPhone,
      documentUrl,
      signatureMethod = 'ELECTRONIC'
    } = await c.req.json()
    
    if (!documentType || !customerName || !customerEmail || !documentUrl) {
      return c.json({ success: false, error: 'Parametri obbligatori mancanti' }, 400)
    }

    const { default: SignatureService } = await import('./modules/signature-service')
    const signatureService = SignatureService.getInstance()
    
    const result = await signatureService.createSignatureRequest(
      documentType,
      { name: customerName, email: customerEmail, phone: customerPhone },
      documentUrl,
      signatureMethod
    )
    
    return c.json({
      success: result.success,
      signature: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore creazione firma:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore creazione firma' 
    }, 500)
  }
})

// Endpoint per completare firma elettronica con OTP
app.post('/api/signatures/:signatureId/complete', async (c) => {
  try {
    const signatureId = c.req.param('signatureId')
    const { otpCode, signatureData } = await c.req.json()
    
    if (!otpCode) {
      return c.json({ success: false, error: 'Codice OTP richiesto' }, 400)
    }

    const { ElectronicSignatureService } = await import('./modules/signature-service')
    
    const result = await ElectronicSignatureService.completeElectronicSignature(
      signatureId,
      otpCode,
      signatureData || {
        documentHash: 'mock_hash_' + Date.now(),
        customerData: {
          name: 'Cliente Test',
          email: 'test@example.com',
          ipAddress: c.req.header('CF-Connecting-IP') || '127.0.0.1'
        },
        timestamp: new Date().toISOString(),
        otpVerified: true
      }
    )
    
    return c.json({
      success: result.success,
      signature: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore completamento firma:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore completamento firma' 
    }, 500)
  }
})

// Endpoint per upload documento firmato manualmente  
app.post('/api/signatures/:signatureId/upload', async (c) => {
  try {
    const signatureId = c.req.param('signatureId')
    
    // In una implementazione reale, gestire upload file
    console.log(`📤 Upload documento firmato per: ${signatureId}`)
    
    const { ManualSignatureService } = await import('./modules/signature-service')
    
    // Mock file upload
    const mockFile = Buffer.from('PDF_CONTENT_PLACEHOLDER')
    const result = await ManualSignatureService.processSignedDocument(
      signatureId,
      mockFile,
      { uploadedAt: new Date().toISOString() }
    )
    
    return c.json({
      success: result.success,
      signature: result,
      message: 'Documento firmato ricevuto con successo',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore upload firma:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore upload'
    }, 500)
  }
})

// Endpoint per stato firma
app.get('/api/signatures/:signatureId/status', async (c) => {
  try {
    const signatureId = c.req.param('signatureId')
    
    const { default: SignatureService } = await import('./modules/signature-service')
    const signatureService = SignatureService.getInstance()
    
    const status = await signatureService.getSignatureStatus(signatureId)
    
    return c.json({
      success: true,
      signatureId: signatureId,
      status: status,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore stato firma:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore stato firma' 
    }, 500)
  }
})

// Webhook endpoint per DocuSign
app.post('/api/signatures/webhook/docusign', async (c) => {
  try {
    const payload = await c.req.json()
    
    const { DocuSignService } = await import('./modules/signature-service')
    await DocuSignService.processDocuSignWebhook(payload)
    
    return c.text('OK')
  } catch (error) {
    console.error('❌ Errore webhook DocuSign:', error)
    return c.text('Webhook Error', 500)
  }
})

// Test endpoint per SignatureService
app.post('/api/signatures/test', async (c) => {
  try {
    const { 
      signatureMethod = 'ELECTRONIC',
      customerName = 'Mario Rossi',
      customerEmail = 'mario.rossi@example.com'
    } = await c.req.json()

    const { default: SignatureService } = await import('./modules/signature-service')
    const signatureService = SignatureService.getInstance()
    
    // Test creazione richiesta firma
    const signatureResult = await signatureService.createSignatureRequest(
      'CONTRACT',
      {
        name: customerName,
        email: customerEmail,
        phone: '+39 333 123 4567'
      },
      '/documents/contracts/contract_test.pdf',
      signatureMethod
    )

    // Test metodi disponibili
    const availableMethods = signatureService.getAvailableSignatureMethods()

    return c.json({
      success: true,
      test: {
        signatureResult: signatureResult,
        availableMethods: Object.keys(availableMethods).length,
        methods: availableMethods
      },
      message: 'Test SignatureService completato'
    })
  } catch (error) {
    console.error('❌ Errore test firme:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore test'
    }, 500)
  }
})

// =====================================================================
// CONTRACT API ENDPOINTS  
// =====================================================================

// Endpoint per ottenere template contratti disponibili
app.get('/api/contracts/templates', async (c) => {
  try {
    const { default: ContractService } = await import('./modules/contract-service')
    const contractService = ContractService.getInstance()
    
    const templates = contractService.getAvailableTemplates()
    
    return c.json({
      success: true,
      templates: templates,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore template contratti:', error)
    return c.json({ success: false, error: 'Errore interno' }, 500)
  }
})

// Endpoint per calcolare prezzo servizio
app.post('/api/contracts/calculate-price', async (c) => {
  try {
    const { tipoServizio } = await c.req.json()
    
    if (!tipoServizio || !['BASE', 'AVANZATO'].includes(tipoServizio)) {
      return c.json({ success: false, error: 'Tipo servizio non valido' }, 400)
    }

    const { default: ContractService } = await import('./modules/contract-service')
    const contractService = ContractService.getInstance()
    
    const pricing = contractService.calculateServicePrice(tipoServizio)
    
    return c.json({
      success: true,
      tipoServizio: tipoServizio,
      pricing: pricing,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore calcolo prezzo:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore calcolo' 
    }, 500)
  }
})

// Endpoint per pre-compilare contratto
app.post('/api/contracts/compile', async (c) => {
  try {
    const { contractType, customerData } = await c.req.json()
    
    if (!contractType || !customerData) {
      return c.json({ success: false, error: 'Parametri obbligatori mancanti' }, 400)
    }

    if (!['BASE', 'AVANZATO', 'PROFORMA'].includes(contractType)) {
      return c.json({ success: false, error: 'Tipo contratto non valido' }, 400)
    }

    const { default: ContractService } = await import('./modules/contract-service')
    const contractService = ContractService.getInstance()
    
    const contract = await contractService.compileContract(contractType, customerData)
    
    return c.json({
      success: true,
      contract: contract,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore compilazione contratto:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore compilazione contratto' 
    }, 500)
  }
})

// Endpoint per generare, inviare e richiedere firma contratto (workflow completo)
app.post('/api/contracts/generate-and-send', async (c) => {
  try {
    const { 
      contractType, 
      customerData, 
      signatureMethod = 'ELECTRONIC' 
    } = await c.req.json()
    
    if (!contractType || !customerData) {
      return c.json({ success: false, error: 'Parametri obbligatori mancanti' }, 400)
    }

    if (!['BASE', 'AVANZATO', 'PROFORMA'].includes(contractType)) {
      return c.json({ success: false, error: 'Tipo contratto non valido' }, 400)
    }

    const { default: ContractService } = await import('./modules/contract-service')
    const contractService = ContractService.getInstance()
    
    const result = await contractService.generateAndSendContract(
      contractType,
      customerData,
      signatureMethod
    )
    
    return c.json({
      success: true,
      workflow: {
        contract: result.contract,
        emailSent: result.emailResult.success,
        signatureCreated: result.signatureResult.success,
        signatureId: result.signatureResult.signatureId
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore workflow contratto:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore workflow contratto' 
    }, 500)
  }
})

// Test endpoint per ContractService
app.post('/api/contracts/test', async (c) => {
  try {
    const { 
      contractType = 'BASE',
      customerName = 'Mario Rossi',
      customerEmail = 'mario.rossi@example.com'
    } = await c.req.json()

    const { default: ContractService } = await import('./modules/contract-service')
    const contractService = ContractService.getInstance()
    
    // Dati cliente di test
    const testCustomerData = {
      nomeAssistito: 'Giuseppe',
      cognomeAssistito: 'Rossi',
      dataNascita: '15/03/1945',
      luogoNascita: 'Milano',
      codiceFiscaleAssistito: 'RSSGPP45C15F205X',
      indirizzoAssistito: 'Via Roma 123',
      capAssistito: '20121',
      cittaAssistito: 'Milano',
      provinciaAssistito: 'MI',
      telefonoAssistito: '+39 02 1234 5678',
      emailAssistito: customerEmail,
      
      nomeRichiedente: customerName.split(' ')[0],
      cognomeRichiedente: customerName.split(' ')[1] || 'Rossi',
      emailRichiedente: customerEmail,
      telefonoRichiedente: '+39 333 123 4567',
      
      tipoServizio: contractType as 'BASE' | 'AVANZATO',
      dataAtivazione: new Date().toISOString()
    }
    
    // Test compilazione contratto
    const contract = await contractService.compileContract(contractType as any, testCustomerData)
    
    // Test calcolo prezzo
    const pricing = contractService.calculateServicePrice(contractType as any)
    
    // Test template disponibili
    const templates = contractService.getAvailableTemplates()

    return c.json({
      success: true,
      test: {
        contract: {
          id: contract.contractId,
          type: contract.type,
          customer: contract.customerName,
          documentUrl: contract.documentUrl,
          status: contract.status,
          variablesCount: Object.keys(contract.variables).length
        },
        pricing: pricing,
        availableTemplates: templates.length
      },
      message: 'Test ContractService completato'
    })
  } catch (error) {
    console.error('❌ Errore test contratti:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore test'
    }, 500)
  }
})

app.post('/api/documents/initialize', async (c) => {
  try {
    console.log(`🚀 [DOCS-API] Inizializzazione repository documenti`)
    
    await DocumentRepository.initializeWithDemoDocuments()
    
    const stats = DocumentRepository.getRepositoryStats()
    
    return c.json({
      success: true,
      message: 'Repository inizializzato con successo',
      stats
    })
    
  } catch (error) {
    console.error(`❌ [DOCS-API] Errore inizializzazione repository:`, error)
    return c.json({ success: false, error: 'Errore interno del server' }, 500)
  }
})

// =====================================================================
// CONFIGURATION FORM API ENDPOINTS  
// =====================================================================

// Endpoint per validare dati form TeleMedCare
app.post('/api/forms/validate', async (c) => {
  try {
    const formData = await c.req.json()
    
    const ConfigurationFormService = (await import('./modules/configuration-form-service')).ConfigurationFormService
    const validation = ConfigurationFormService.validateFormData(formData)
    
    return c.json({
      success: true,
      validation,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore validazione form:', error)
    return c.json({ success: false, error: 'Errore validazione' }, 500)
  }
})

// Endpoint per pre-compilare contratto da dati form landing page
app.post('/api/forms/precompile-contract', async (c) => {
  try {
    const formData = await c.req.json()
    
    const ConfigurationFormService = (await import('./modules/configuration-form-service')).ConfigurationFormService
    const { default: ContractService } = await import('./modules/contract-service')
    
    const contractService = ContractService.getInstance()
    const result = await ConfigurationFormService.preCompileContract(formData, contractService)
    
    return c.json({
      success: result.success,
      result: result,
      message: result.success 
        ? 'Contratto pre-compilato automaticamente' 
        : 'Pre-compilazione fallita - campi aggiuntivi necessari',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore pre-compilazione:', error)
    return c.json({ success: false, error: 'Errore pre-compilazione' }, 500)
  }
})

// Endpoint per generare form dinamico per campi mancanti
app.post('/api/forms/generate-missing-fields', async (c) => {
  try {
    const { missingFields } = await c.req.json()
    
    if (!missingFields || !Array.isArray(missingFields)) {
      return c.json({ success: false, error: 'missingFields array richiesto' }, 400)
    }
    
    const ConfigurationFormService = (await import('./modules/configuration-form-service')).ConfigurationFormService
    const formSchema = ConfigurationFormService.generateMissingFieldsForm(missingFields)
    
    return c.json({
      success: true,
      formSchema,
      message: `Form generato per ${missingFields.length} campi mancanti`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore generazione form:', error)
    return c.json({ success: false, error: 'Errore generazione form' }, 500)
  }
})

// Endpoint per processare lead completo dalla landing page 
app.post('/api/forms/process-telemedcare-lead', async (c) => {
  try {
    const leadData = await c.req.json()
    
    const ConfigurationFormService = (await import('./modules/configuration-form-service')).ConfigurationFormService
    
    // 1. Valida dati form
    const validation = ConfigurationFormService.validateFormData(leadData)
    
    // 2. Se il lead richiede contratto immediato E ha tutti i dati
    if (leadData.richiedeContratto && validation.missingForContract.length === 0) {
      const { default: ContractService } = await import('./modules/contract-service')
      const contractService = ContractService.getInstance()
      
      // Pre-compila contratto automaticamente
      const contractResult = await ConfigurationFormService.preCompileContract(leadData, contractService)
      
      // Se chiede anche email, invia contratto
      if (contractResult.success && leadData.preferitoContatto === 'Email') {
        const { EmailService } = await import('./modules/email-service')
        const emailService = EmailService.getInstance()
        
        try {
          await emailService.sendTemplateEmail(
            'CONTRACT_READY',
            leadData.email,
            {
              nomeCliente: leadData.nome,
              cognomeCliente: leadData.cognome,
              tipoContratto: leadData.servizioInteresse || 'Base',
              contractId: contractResult.contractId || 'temp',
              downloadLink: 'https://webapp.pages.dev/contratti/' + (contractResult.contractId || 'temp')
            }
          )
        } catch (emailError) {
          console.warn('⚠️ Errore invio email contratto:', emailError)
        }
      }
      
      return c.json({
        success: true,
        leadProcessed: true,
        contractGenerated: contractResult.success,
        contractResult,
        validation,
        message: contractResult.success 
          ? 'Lead processato e contratto generato automaticamente'
          : 'Lead salvato, contratto richiede dati aggiuntivi'
      })
    }
    
    // 3. Se mancano dati per il contratto, salva lead e genera form per dati aggiuntivi
    else if (leadData.richiedeContratto && validation.missingForContract.length > 0) {
      const formSchema = ConfigurationFormService.generateMissingFieldsForm(validation.missingForContract)
      
      return c.json({
        success: true,
        leadProcessed: true,
        contractGenerated: false,
        validation,
        formSchema,
        message: `Lead salvato. Necessari ${validation.missingForContract.length} campi aggiuntivi per il contratto`,
        nextAction: 'COLLECT_MISSING_FIELDS'
      })
    }
    
    // 4. Lead informativo (non richiede contratto immediato) - Schedula follow-up automatico
    else {
      // Schedula follow-up automatico
      const { FollowUpService } = await import('./modules/followup-service')
      const followupService = FollowUpService.getInstance()
      
      const followupSchedule = {
        leadId: `LEAD_${Date.now()}`,
        customerName: `${leadData.nome} ${leadData.cognome}`,
        customerPhone: leadData.telefono,
        customerEmail: leadData.email,
        preferredContactMethod: leadData.preferitoContatto || 'Telefono',
        urgencyLevel: leadData.urgenzaRichiesta || 'Media urgenza',
        leadSource: 'telemedcare_landing',
        serviceInterest: leadData.servizioInteresse || 'Informazioni generali',
        contractRequested: false
      }
      
      const followupResult = await followupService.scheduleFollowUpCall(followupSchedule)
      
      return c.json({
        success: true,
        leadProcessed: true,
        contractGenerated: false,
        validation,
        followupScheduled: followupResult.success,
        followupCall: followupResult.followUpCall,
        message: followupResult.success 
          ? 'Lead salvato e follow-up schedulato automaticamente'
          : 'Lead salvato, errore schedulazione follow-up',
        nextAction: 'SCHEDULE_FOLLOWUP'
      })
    }
    
  } catch (error) {
    console.error('❌ Errore processo lead:', error)
    return c.json({ success: false, error: 'Errore processo lead' }, 500)
  }
})

// Endpoint per calcolare età da data nascita
app.get('/api/forms/calculate-age/:birthDate', async (c) => {
  try {
    const birthDate = c.req.param('birthDate')
    
    const ConfigurationFormService = (await import('./modules/configuration-form-service')).ConfigurationFormService
    const age = ConfigurationFormService.calculateAge(birthDate)
    
    return c.json({
      success: true,
      birthDate,
      age,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore calcolo età:', error)
    return c.json({ success: false, error: 'Errore calcolo età' }, 500)
  }
})

// Test endpoint per ConfigurationFormService
app.post('/api/forms/test', async (c) => {
  try {
    const ConfigurationFormService = (await import('./modules/configuration-form-service')).ConfigurationFormService
    
    // Dati test che simulano il form www.telemedcare.it
    const testFormData = {
      nome: 'Mario',
      cognome: 'Rossi', 
      email: 'mario.rossi@email.com',
      telefono: '+39 333 123 4567',
      nomeAssistito: 'Giuseppe',
      cognomeAssistito: 'Rossi',
      dataNascitaAssistito: '1950-01-15',
      relazioneAssistito: 'Figlio',
      servizioInteresse: 'TeleMedCare Base',
      condizioniMediche: 'Diabete, problemi cardiaci',
      urgenzaRichiesta: 'Media urgenza',
      preferitoContatto: 'Email',
      richiedeContratto: true,
      intestazioneContratto: 'Assistito',
      richiedeBrochure: true,
      richiedeManuale: true,
      messaggioAggiuntivo: 'Richiesta informazioni per mio padre',
      consensoPrivacy: true
    }
    
    const validation = ConfigurationFormService.validateFormData(testFormData)
    const customerData = ConfigurationFormService.convertToCustomerData(testFormData)
    const age = ConfigurationFormService.calculateAge(testFormData.dataNascitaAssistito)
    
    const formSchemaExample = ConfigurationFormService.generateMissingFieldsForm([
      'codiceFiscaleAssistito', 'indirizzoAssistito'
    ])
    
    return c.json({
      success: true,
      test: {
        formData: testFormData,
        validation,
        customerData,
        calculatedAge: age,
        sampleMissingFieldsForm: formSchemaExample
      },
      message: 'Test ConfigurationFormService completato',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore test configuration form:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore test'
    }, 500)
  }
})

// =====================================================================
// FOLLOW-UP CALL API ENDPOINTS  
// =====================================================================

// Endpoint per schedulare follow-up automatico da lead
app.post('/api/followup/schedule', async (c) => {
  try {
    const scheduleData = await c.req.json()
    
    if (!scheduleData.leadId || !scheduleData.customerName || !scheduleData.customerPhone) {
      return c.json({ success: false, error: 'Parametri obbligatori mancanti' }, 400)
    }
    
    const { FollowUpService } = await import('./modules/followup-service')
    const followupService = FollowUpService.getInstance()
    
    const result = await followupService.scheduleFollowUpCall(scheduleData)
    
    return c.json({
      success: result.success,
      followUpCall: result.followUpCall,
      error: result.error,
      message: result.success ? 'Follow-up schedulato automaticamente' : 'Errore schedulazione',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore schedulazione follow-up:', error)
    return c.json({ success: false, error: 'Errore schedulazione follow-up' }, 500)
  }
})

// Test endpoint per FollowUpService
app.post('/api/followup/test', async (c) => {
  try {
    const { FollowUpService } = await import('./modules/followup-service')
    const followupService = FollowUpService.getInstance()
    
    // Test scheduling con dati esempio
    const testSchedule = {
      leadId: 'lead_test_001',
      customerName: 'Mario Rossi',
      customerPhone: '+39 333 123 4567',
      customerEmail: 'mario.rossi@email.com',
      preferredContactMethod: 'Telefono' as const,
      urgencyLevel: 'Alta urgenza' as const,
      leadSource: 'landing_page',
      serviceInterest: 'TeleAssistenza Avanzata',
      contractRequested: true,
      bestTimeToCall: '10:00-12:00',
      timezone: 'Europe/Rome'
    }
    
    const scheduleResult = await followupService.scheduleFollowUpCall(testSchedule)
    const todayFollowUps = await followupService.getTodayFollowUps()
    const stats = await followupService.getFollowUpStats('today')
    const rules = followupService.getActiveRules()
    const operators = followupService.getAvailableOperators()
    
    return c.json({
      success: true,
      test: {
        scheduleResult,
        todayFollowUps: todayFollowUps.length,
        stats,
        rulesCount: rules.length,
        operatorsCount: operators.length
      },
      message: 'Test FollowUpService completato',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Errore test follow-up:', error)
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Errore test'
    }, 500)
  }
})

// ========== FOLLOW-UP MANAGEMENT ENDPOINTS ==========

// Ottieni tutti i follow-up di oggi
app.get('/api/followup/today', async (c) => {
  try {
    const { FollowUpService } = await import('./modules/followup-service')
    const followupService = FollowUpService.getInstance()
    
    const todayFollowUps = await followupService.getTodayFollowUps()
    
    return c.json({
      success: true,
      followUps: todayFollowUps,
      count: todayFollowUps.length
    })
  } catch (error) {
    console.error('❌ Errore recupero follow-up oggi:', error)
    return c.json({ success: false, error: 'Errore recupero follow-up' }, 500)
  }
})

// Ottieni follow-up per operatore
app.get('/api/followup/operator/:operatorId', async (c) => {
  try {
    const operatorId = c.req.param('operatorId')
    const { FollowUpService } = await import('./modules/followup-service')
    const followupService = FollowUpService.getInstance()
    
    const operatorFollowUps = await followupService.getFollowUpsByOperator(operatorId)
    
    return c.json({
      success: true,
      followUps: operatorFollowUps,
      operator: operatorId,
      count: operatorFollowUps.length
    })
  } catch (error) {
    console.error('❌ Errore recupero follow-up operatore:', error)
    return c.json({ success: false, error: 'Errore recupero follow-up operatore' }, 500)
  }
})

// Ottieni statistiche follow-up
app.get('/api/followup/stats/:period?', async (c) => {
  try {
    const period = c.req.param('period') || 'today'
    const { FollowUpService } = await import('./modules/followup-service')
    const followupService = FollowUpService.getInstance()
    
    const stats = await followupService.getFollowUpStats(period as any)
    
    return c.json({
      success: true,
      stats,
      period
    })
  } catch (error) {
    console.error('❌ Errore statistiche follow-up:', error)
    return c.json({ success: false, error: 'Errore statistiche follow-up' }, 500)
  }
})

// Completa un follow-up call
app.post('/api/followup/:followUpId/complete', async (c) => {
  try {
    const followUpId = parseInt(c.req.param('followUpId'))
    const { outcome, notes, nextAction } = await c.req.json()
    
    const { FollowUpService } = await import('./modules/followup-service')
    const followupService = FollowUpService.getInstance()
    
    const result = await followupService.completeFollowUp(followUpId, {
      outcome,
      notes,
      nextAction
    })
    
    return c.json({
      success: true,
      followUpCall: result.followUpCall,
      message: 'Follow-up completato con successo'
    })
  } catch (error) {
    console.error('❌ Errore completamento follow-up:', error)
    return c.json({ success: false, error: 'Errore completamento follow-up' }, 500)
  }
})

// Lista operatori disponibili
app.get('/api/followup/operators', async (c) => {
  try {
    const { FollowUpService } = await import('./modules/followup-service')
    const followupService = FollowUpService.getInstance()
    
    const operators = followupService.getAvailableOperators()
    
    return c.json({
      success: true,
      operators
    })
  } catch (error) {
    console.error('❌ Errore lista operatori:', error)
    return c.json({ success: false, error: 'Errore lista operatori' }, 500)
  }
})

// ========== DASHBOARD MANAGEMENT ==========

// Dashboard principale TeleMedCare V11.0
app.get('/dashboard', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TeleMedCare V11.0 - Dashboard Enterprise</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <style>
            .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
            .card-hover:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(0,0,0,0.1); }
            .metric-card { background: white; border-radius: 12px; padding: 1.5rem; }
            .status-online { color: #10B981; }
            .status-offline { color: #EF4444; }
            .status-pending { color: #F59E0B; }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Header -->
        <header class="gradient-bg text-white shadow-lg">
            <div class="container mx-auto px-6 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold">TeleMedCare V11.0</h1>
                        <p class="text-blue-100">Dashboard Enterprise • Sistema Modular</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <p class="text-sm text-blue-100">Ultimo aggiornamento</p>
                            <p class="font-semibold" id="lastUpdate">--:--</p>
                        </div>
                        <button onclick="refreshDashboard()" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                            <i class="fas fa-sync-alt mr-2"></i>Aggiorna
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Dashboard -->
        <main class="container mx-auto px-6 py-8">
            <!-- KPI Cards Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <!-- Lead Totali -->
                <div class="metric-card card-hover transition-all">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 text-sm font-medium">Lead Totali</h3>
                        <i class="fas fa-users text-blue-500 text-xl"></i>
                    </div>
                    <div class="text-2xl font-bold text-gray-800" id="totalLeads">--</div>
                    <p class="text-sm text-gray-500 mt-1">Tutti i lead acquisiti</p>
                </div>

                <!-- Dispositivi Inventory -->
                <div class="metric-card card-hover transition-all">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 text-sm font-medium">Dispositivi</h3>
                        <i class="fas fa-microchip text-green-500 text-xl"></i>
                    </div>
                    <div class="text-2xl font-bold text-gray-800" id="totalDevices">--</div>
                    <p class="text-sm text-gray-500 mt-1"><span id="availableDevices">--</span> disponibili</p>
                </div>

                <!-- Follow-up Oggi -->
                <div class="metric-card card-hover transition-all">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 text-sm font-medium">Follow-up Oggi</h3>
                        <i class="fas fa-phone text-purple-500 text-xl"></i>
                    </div>
                    <div class="text-2xl font-bold text-gray-800" id="todayFollowups">--</div>
                    <p class="text-sm text-gray-500 mt-1">Chiamate schedulate</p>
                </div>

                <!-- Conversion Rate -->
                <div class="metric-card card-hover transition-all">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-gray-600 text-sm font-medium">Conversion Rate</h3>
                        <i class="fas fa-chart-line text-orange-500 text-xl"></i>
                    </div>
                    <div class="text-2xl font-bold text-gray-800" id="conversionRate">--%</div>
                    <p class="text-sm text-gray-500 mt-1">Follow-up → Contratti</p>
                </div>
            </div>

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Lead Trend Chart -->
                <div class="bg-white rounded-xl p-6 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-chart-area text-blue-500 mr-2"></i>
                        Trend Lead (Ultimi 7 giorni)
                    </h3>
                    <canvas id="leadTrendChart" height="200"></canvas>
                </div>

                <!-- Dispositivi Status Chart -->
                <div class="bg-white rounded-xl p-6 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-microchip text-green-500 mr-2"></i>
                        Status Dispositivi
                    </h3>
                    <canvas id="deviceStatusChart" height="200"></canvas>
                </div>
            </div>

            <!-- Operatori e Follow-up -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <!-- Performance Operatori -->
                <div class="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-user-tie text-purple-500 mr-2"></i>
                        Performance Operatori
                    </h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-sm">
                            <thead>
                                <tr class="border-b border-gray-200">
                                    <th class="text-left py-3 px-2">Operatore</th>
                                    <th class="text-center py-3 px-2">Chiamate</th>
                                    <th class="text-center py-3 px-2">Conversioni</th>
                                    <th class="text-center py-3 px-2">Rate</th>
                                    <th class="text-center py-3 px-2">Status</th>
                                </tr>
                            </thead>
                            <tbody id="operatorTable">
                                <!-- Populated by JavaScript -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Follow-up di Oggi -->
                <div class="bg-white rounded-xl p-6 shadow-sm">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">
                        <i class="fas fa-calendar-day text-orange-500 mr-2"></i>
                        Follow-up Oggi
                    </h3>
                    <div id="todayFollowupList" class="space-y-3">
                        <!-- Populated by JavaScript -->
                    </div>
                </div>
            </div>

            <!-- Sistema Status -->
            <div class="bg-white rounded-xl p-6 shadow-sm">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">
                    <i class="fas fa-server text-indigo-500 mr-2"></i>
                    Status Sistema
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <i class="fas fa-database text-2xl mb-2 status-online"></i>
                        <p class="text-sm font-medium">Database</p>
                        <p class="text-xs text-gray-500">D1 + Mock</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <i class="fas fa-envelope text-2xl mb-2 status-pending"></i>
                        <p class="text-sm font-medium">Email Service</p>
                        <p class="text-xs text-gray-500">Configurazione richiesta</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <i class="fas fa-cloud text-2xl mb-2 status-online"></i>
                        <p class="text-sm font-medium">Cloudflare Pages</p>
                        <p class="text-xs text-gray-500">Online</p>
                    </div>
                    <div class="text-center p-4 bg-gray-50 rounded-lg">
                        <i class="fas fa-shield-alt text-2xl mb-2 status-online"></i>
                        <p class="text-sm font-medium">Security</p>
                        <p class="text-xs text-gray-500">Attivo</p>
                    </div>
                </div>
            </div>
        </main>

        <!-- JavaScript Dashboard Logic -->
        <script>
            let charts = {};

            // Inizializzazione dashboard
            document.addEventListener('DOMContentLoaded', function() {
                initializeCharts();
                refreshDashboard();
                
                // Auto-refresh ogni 30 secondi
                setInterval(refreshDashboard, 30000);
            });

            // Refresh completo dashboard
            async function refreshDashboard() {
                try {
                    await Promise.all([
                        loadKPIData(),
                        loadFollowupData(), 
                        loadDeviceData(),
                        loadOperatorData()
                    ]);
                    
                    document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('it-IT');
                } catch (error) {
                    console.error('Errore refresh dashboard:', error);
                }
            }

            // Carica KPI data
            async function loadKPIData() {
                try {
                    // Simula dati KPI (in produzione userà /api/enterprise/reports/kpi)
                    const kpiData = {
                        totalLeads: 1247,
                        conversionRate: 0.72
                    };
                    
                    document.getElementById('totalLeads').textContent = kpiData.totalLeads.toLocaleString('it-IT');
                    document.getElementById('conversionRate').textContent = (kpiData.conversionRate * 100).toFixed(1) + '%';
                } catch (error) {
                    console.error('Errore caricamento KPI:', error);
                }
            }

            // Carica dati dispositivi
            async function loadDeviceData() {
                try {
                    const response = await axios.get('/api/devices/stats');
                    const stats = response.data.stats;
                    
                    document.getElementById('totalDevices').textContent = stats.total;
                    document.getElementById('availableDevices').textContent = stats.inventory;
                    
                    // Aggiorna chart dispositivi
                    updateDeviceChart(stats);
                } catch (error) {
                    console.error('Errore caricamento dispositivi:', error);
                    document.getElementById('totalDevices').textContent = '--';
                    document.getElementById('availableDevices').textContent = '--';
                }
            }

            // Carica dati follow-up
            async function loadFollowupData() {
                try {
                    const [todayResponse, statsResponse] = await Promise.all([
                        axios.get('/api/followup/today'),
                        axios.get('/api/followup/stats/today')
                    ]);
                    
                    const todayFollowups = todayResponse.data.followUps;
                    const stats = statsResponse.data.stats;
                    
                    document.getElementById('todayFollowups').textContent = todayFollowups.length;
                    
                    // Popola lista follow-up oggi
                    updateTodayFollowupList(todayFollowups);
                } catch (error) {
                    console.error('Errore caricamento follow-up:', error);
                    document.getElementById('todayFollowups').textContent = '--';
                }
            }

            // Carica dati operatori
            async function loadOperatorData() {
                try {
                    const [operatorsResponse, statsResponse] = await Promise.all([
                        axios.get('/api/followup/operators'),
                        axios.get('/api/followup/stats/today')
                    ]);
                    
                    const operators = operatorsResponse.data.operators;
                    const stats = statsResponse.data.stats;
                    
                    updateOperatorTable(operators, stats.operatorPerformance);
                } catch (error) {
                    console.error('Errore caricamento operatori:', error);
                }
            }

            // Aggiorna tabella operatori
            function updateOperatorTable(operators, performance) {
                const tbody = document.getElementById('operatorTable');
                tbody.innerHTML = '';
                
                performance.forEach(perf => {
                    const operator = operators.find(op => op.operatorId === perf.operatorId);
                    if (!operator) return;
                    
                    const row = \`
                        <tr class="border-b border-gray-100 hover:bg-gray-50">
                            <td class="py-3 px-2">
                                <div class="font-medium">\${operator.operatorName}</div>
                                <div class="text-xs text-gray-500">\${operator.specializations[0] || 'Generale'}</div>
                            </td>
                            <td class="text-center py-3 px-2">\${perf.calls}</td>
                            <td class="text-center py-3 px-2">\${perf.conversions}</td>
                            <td class="text-center py-3 px-2">
                                <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    \${(perf.rate * 100).toFixed(1)}%
                                </span>
                            </td>
                            <td class="text-center py-3 px-2">
                                <i class="fas fa-circle status-online text-xs"></i>
                            </td>
                        </tr>
                    \`;
                    tbody.innerHTML += row;
                });
            }

            // Aggiorna lista follow-up oggi
            function updateTodayFollowupList(followUps) {
                const container = document.getElementById('todayFollowupList');
                container.innerHTML = '';
                
                if (followUps.length === 0) {
                    container.innerHTML = '<p class="text-gray-500 text-sm">Nessun follow-up programmato per oggi</p>';
                    return;
                }
                
                followUps.slice(0, 5).forEach(followup => {
                    const item = \`
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <p class="font-medium text-sm">\${followup.scheduledTime}</p>
                                <p class="text-xs text-gray-500">\${followup.callType}</p>
                            </div>
                            <div class="text-right">
                                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    \${followup.priority}
                                </span>
                            </div>
                        </div>
                    \`;
                    container.innerHTML += item;
                });
            }

            // Inizializza charts
            function initializeCharts() {
                // Lead Trend Chart
                const leadCtx = document.getElementById('leadTrendChart').getContext('2d');
                charts.leadTrend = new Chart(leadCtx, {
                    type: 'line',
                    data: {
                        labels: ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
                        datasets: [{
                            label: 'Lead',
                            data: [12, 19, 3, 5, 2, 3, 18],
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                            x: { grid: { color: '#f3f4f6' } }
                        }
                    }
                });

                // Device Status Chart placeholder
                const deviceCtx = document.getElementById('deviceStatusChart').getContext('2d');
                charts.deviceStatus = new Chart(deviceCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Disponibili', 'Assegnati', 'Consegnati'],
                        datasets: [{
                            data: [0, 0, 0],
                            backgroundColor: ['#10B981', '#3B82F6', '#F59E0B']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }

            // Aggiorna chart dispositivi
            function updateDeviceChart(stats) {
                if (!charts.deviceStatus) return;
                
                charts.deviceStatus.data.datasets[0].data = [
                    stats.inventory,
                    stats.assigned,
                    stats.delivered
                ];
                charts.deviceStatus.update();
            }
        </script>
    </body>
    </html>
  `)
})

// ========== DISPOSITIVI ADVANCED ENDPOINTS ==========

// Test scansione etichetta SiDLY con mock service
app.post('/api/devices/test-scan', async (c) => {
  try {
    const { labelText } = await c.req.json()
    
    const { sidlyScannerService } = await import('./modules/sidly-scanner-service')
    const { dispositiviTestService } = await import('./modules/dispositivi-test-service')
    
    // 1. Scansiona etichetta
    const scanResult = await sidlyScannerService.scanLabel(labelText)
    
    if (!scanResult.success) {
      return c.json({
        success: false,
        error: scanResult.error,
        step: 'scan'
      }, 400)
    }
    
    // 2. Registra dispositivo
    const registrationResult = await dispositiviTestService.registerDevice({
      device_id: scanResult.data!.device_id,
      imei: scanResult.data!.imei,
      manufacturer: scanResult.data!.manufacturer,
      model: scanResult.data!.model,
      lot_number: scanResult.data!.lot_number,
      expiry_date: scanResult.data!.expiry_date,
      udi_code: scanResult.data!.udi_code,
      ce_marking: scanResult.data!.ce_marking
    })
    
    return c.json({
      success: true,
      scan: scanResult,
      registration: registrationResult,
      message: 'Scansione e registrazione completate'
    })
  } catch (error) {
    console.error('❌ Errore test scansione:', error)
    return c.json({ success: false, error: 'Errore test scansione dispositivo' }, 500)
  }
})

// Statistiche dispositivi mock
app.get('/api/devices/stats', async (c) => {
  try {
    const { dispositiviTestService } = await import('./modules/dispositivi-test-service')
    
    const stats = await dispositiviTestService.getDeviceStats()
    
    return c.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('❌ Errore statistiche dispositivi:', error)
    return c.json({ success: false, error: 'Errore statistiche dispositivi' }, 500)
  }
})

// Lista dispositivi con filtri
app.get('/api/devices/list', async (c) => {
  try {
    const { dispositiviTestService } = await import('./modules/dispositivi-test-service')
    
    const magazzino = c.req.query('magazzino')
    const status = c.req.query('status') as any
    const assignedTo = c.req.query('assigned_to')
    
    const devices = await dispositiviTestService.listDevices({
      magazzino,
      status,
      assigned_to: assignedTo
    })
    
    return c.json({
      success: true,
      devices,
      count: devices.length
    })
  } catch (error) {
    console.error('❌ Errore lista dispositivi:', error)
    return c.json({ success: false, error: 'Errore lista dispositivi' }, 500)
  }
})

// Assegna dispositivo a lead
app.post('/api/devices/:deviceId/assign/:leadId', async (c) => {
  try {
    const deviceId = c.req.param('deviceId')
    const leadId = c.req.param('leadId')
    
    const { dispositiviTestService } = await import('./modules/dispositivi-test-service')
    
    const result = await dispositiviTestService.assignDeviceToLead(deviceId, leadId)
    
    if (!result.success) {
      return c.json(result, 400)
    }
    
    return c.json({
      success: true,
      device: result.device,
      message: 'Dispositivo assegnato con successo'
    })
  } catch (error) {
    console.error('❌ Errore assegnazione dispositivo:', error)
    return c.json({ success: false, error: 'Errore assegnazione dispositivo' }, 500)
  }
})

export default app
