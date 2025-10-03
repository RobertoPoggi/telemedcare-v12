import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
  // Email service bindings (da configurare in produzione)
  EMAIL_API_KEY?: string
  EMAIL_FROM?: string
  EMAIL_TO_INFO?: string
}

// Configurazione TeleMedCare V10.3.8-Cloudflare
const CONFIG = {
  EMAIL_FROM: 'noreply@medicagb.it',
  EMAIL_TO_INFO: 'info@medicagb.it',
  COMPANY_NAME: 'Medica GB S.r.l.',
  SYSTEM_VERSION: 'V10.3.8-Cloudflare',
  
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
  }
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// Main landing page - REPLICA ESATTA dell'index.html originale
app.get('/', (c) => {
  return c.html(`<!DOCTYPE html>
<html lang="it" data-theme="light" style=""><head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TeleMedCare - La tecnologia che ti salva salute e vita</title>
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

              <div class="grid md:grid-cols-3 gap-6 mt-6">
                <div>
                  <label class="block text-gray-700 font-semibold mb-2">Data di Nascita Assistito</label>
                  <input type="date" name="dataNascitaAssistito" id="data_nascita_assistito" onchange="calcolaEta()" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                </div>
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

// API endpoint per ricevere i lead dal form
app.post('/api/lead', async (c) => {
  try {
    console.log('📨 TeleMedCare V10.3.8-Cloudflare: Nuovo lead ricevuto')
    
    // Inizializza database se disponibile
    if (c.env.DB) {
      await initializeDatabase(c.env.DB)
    }
    
    // Parse form data
    const formData = await c.req.formData()
    const leadData: any = {}
    
    // Converti FormData in oggetto
    for (const [key, value] of formData.entries()) {
      leadData[key] = value
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
      vuoleContratto: leadData.vuoleContratto === 'on' || leadData.vuoleContratto === 'Si',
      intestazioneContratto: String(leadData.intestazioneContratto || '').trim(),
      cfRichiedente: String(leadData.cfRichiedente || '').trim(),
      indirizzoRichiedente: String(leadData.indirizzoRichiedente || '').trim(),
      cfAssistito: String(leadData.cfAssistito || '').trim(),
      indirizzoAssistito: String(leadData.indirizzoAssistito || '').trim(),
      vuoleBrochure: leadData.vuoleBrochure === 'on' || leadData.vuoleBrochure === 'Si',
      vuoleManuale: leadData.vuoleManuale === 'on' || leadData.vuoleManuale === 'Si',

      // Messaggi e Consenso
      note: String(leadData.note || '').trim(),
      gdprConsent: leadData.gdprConsent === 'on',

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
    
    // Elaborazione workflow email
    const workflowResults = await elaboraWorkflowEmail(normalizedLead, leadId)
    
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

// API endpoint di status
app.get('/api/status', (c) => {
  return c.json({
    system: 'TeleMedCare V10.3.8-Cloudflare',
    status: 'active',
    timestamp: new Date().toISOString(),
    version: 'V10.3.8-Cloudflare'
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

// Workflow email principale
async function elaboraWorkflowEmail(leadData: any, leadId: string) {
  console.log('🔄 Avvio workflow email per lead:', leadId);
  
  const results = {
    notificaInfo: false,
    documentiInformativi: false,
    contratto: false,
    timestamp: new Date().toISOString()
  };

  try {
    // 1. Invio notifica a info@medicagb.it (SEMPRE)
    results.notificaInfo = await inviaEmailNotificaInfo(leadData, leadId);
    
    // 2. Invio documenti informativi se richiesti
    if (leadData.vuoleBrochure || leadData.vuoleManuale) {
      results.documentiInformativi = await inviaEmailDocumentiInformativi(leadData, leadId);
    }
    
    // 3. Invio contratto se richiesto
    if (leadData.vuoleContratto) {
      results.contratto = await inviaEmailContratto(leadData, leadId);
    }
    
    console.log('✅ Workflow email completato per lead:', leadId);
    return results;
    
  } catch (error) {
    console.error('❌ Errore nel workflow email:', error);
    return results;
  }
}

// Inizializzazione database D1
async function initializeDatabase(db: D1Database) {
  try {
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
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()
    
    console.log('✅ Database D1 inizializzato correttamente')
  } catch (error) {
    console.error('❌ Errore inizializzazione database:', error)
  }
}

export default app
