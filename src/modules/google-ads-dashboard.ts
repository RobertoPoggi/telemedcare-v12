// ═══════════════════════════════════════════════════════════════════
//  GOOGLE ADS DASHBOARD — TeleMedCare V12.0
//  Generatore annunci, keyword planner, export CSV Google Ads Editor
//  Route: /admin/google-ads
// ═══════════════════════════════════════════════════════════════════

export function renderGoogleAdsDashboard(): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Google ADS Manager — TeleMedCare V12.0</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root { --google-blue:#4285F4; --google-red:#EA4335; --google-yellow:#FBBC05; --google-green:#34A853; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background:#f8fafc; }
    .char-ok  { color:#16a34a; font-weight:700; }
    .char-warn{ color:#d97706; font-weight:700; }
    .char-bad { color:#dc2626; font-weight:700; }
    .tab-btn.active { background:#4285F4; color:#fff; }
    .tab-btn        { background:#e5e7eb; color:#374151; }
    .copy-btn:hover { background:#e0f2fe; }
    .preview-ad { border-left:4px solid #4285F4; }
    textarea, input, select { font-family: inherit; }
    .kw-chip { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:20px; font-size:12px; font-weight:600; margin:3px; }
    .kw-exact   { background:#dbeafe; color:#1d4ed8; }
    .kw-phrase  { background:#dcfce7; color:#15803d; }
    .kw-broad   { background:#fef9c3; color:#854d0e; }
    .kw-neg     { background:#fee2e2; color:#b91c1c; }
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    .fade-in { animation: fadeIn .3s ease; }
    .google-logo span:nth-child(1){color:#4285F4}
    .google-logo span:nth-child(2){color:#EA4335}
    .google-logo span:nth-child(3){color:#FBBC05}
    .google-logo span:nth-child(4){color:#4285F4}
    .google-logo span:nth-child(5){color:#34A853}
    .google-logo span:nth-child(6){color:#EA4335}
    .utm-badge { font-size:11px; padding:2px 8px; border-radius:12px; font-weight:600; }
    .section-card { background:#fff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.04); padding:28px; margin-bottom:24px; }
  </style>
</head>
<body>

<!-- HEADER -->
<div style="background:linear-gradient(135deg,#4285F4 0%,#34A853 50%,#FBBC05 100%)" class="text-white px-6 py-5 shadow-lg">
  <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
    <div class="flex items-center gap-4">
      <a href="/" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm transition">
        <i class="fas fa-arrow-left mr-1"></i>Home
      </a>
      <div>
        <div class="flex items-center gap-2">
          <i class="fab fa-google text-3xl"></i>
          <h1 class="text-2xl font-bold tracking-tight">Google ADS Manager</h1>
          <span class="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-semibold">BETA</span>
        </div>
        <p class="text-white text-opacity-80 text-sm mt-1">Genera annunci ottimizzati pronti per Google Ads Editor</p>
      </div>
    </div>
    <div class="flex items-center gap-3 text-sm">
      <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
        <i class="fas fa-database mr-1"></i>
        Lead DB: <span id="headerLeadCount" class="font-bold">—</span>
      </div>
      <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
        <i class="fab fa-google mr-1"></i>
        Lead Google: <span id="headerGoogleCount" class="font-bold">—</span>
      </div>
    </div>
  </div>
</div>

<!-- TABS -->
<div class="max-w-7xl mx-auto px-6 mt-6">
  <div class="flex gap-2 flex-wrap mb-6">
    <button class="tab-btn active px-5 py-2.5 rounded-lg font-semibold text-sm transition" onclick="showTab('generator')">
      <i class="fas fa-magic mr-2"></i>Generatore Annunci
    </button>
    <button class="tab-btn px-5 py-2.5 rounded-lg font-semibold text-sm transition" onclick="showTab('keywords')">
      <i class="fas fa-key mr-2"></i>Keyword Planner
    </button>
    <button class="tab-btn px-5 py-2.5 rounded-lg font-semibold text-sm transition" onclick="showTab('utm')">
      <i class="fas fa-chart-bar mr-2"></i>Performance UTM
    </button>
    <button class="tab-btn px-5 py-2.5 rounded-lg font-semibold text-sm transition" onclick="showTab('tracking')">
      <i class="fas fa-code mr-2"></i>Conversion Tracking
    </button>
    <button class="tab-btn px-5 py-2.5 rounded-lg font-semibold text-sm transition" onclick="showTab('export')">
      <i class="fas fa-file-csv mr-2"></i>Export CSV
    </button>
  </div>

  <!-- ══════════════════════════════════════════════════
       TAB 1 — GENERATORE ANNUNCI
  ══════════════════════════════════════════════════ -->
  <div id="tab-generator" class="tab-content fade-in">

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- INPUT PANEL -->
      <div class="section-card">
        <h2 class="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <i class="fas fa-sliders-h text-blue-500"></i>
          Parametri campagna
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Tipo campagna</label>
            <select id="campaignType" onchange="updateGenerator()" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
              <option value="intent">🎯 Intento diretto (chi cerca il prodotto)</option>
              <option value="competitor">⚔️ Competitor (chi cerca brand rivali)</option>
              <option value="problem">💭 Problema/Bisogno (chi descrive la situazione)</option>
              <option value="local">📍 Locale (chi cerca in una città)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Piano focus</label>
            <select id="planFocus" onchange="updateGenerator()" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
              <option value="all">Tutti i piani</option>
              <option value="family">eCura Family (da €390/anno)</option>
              <option value="pro">eCura PRO (da €480/anno)</option>
              <option value="premium">eCura PREMIUM (da €590/anno)</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Keyword target principale</label>
            <input type="text" id="mainKeyword" placeholder="es. bracciale cadute anziani"
              oninput="updateGenerator()"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
            <p class="text-xs text-gray-400 mt-1">Lascia vuoto per usare quelle suggerite dal tipo campagna</p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Città (per campagne locali)</label>
            <input type="text" id="cityFocus" placeholder="es. Milano, Roma, Torino"
              oninput="updateGenerator()"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Budget giornaliero (€)</label>
            <input type="number" id="dailyBudget" value="10" min="1" max="500"
              oninput="updateROI()"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent">
          </div>
        </div>

        <!-- ROI ESTIMATOR -->
        <div class="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <h3 class="font-bold text-green-800 text-sm mb-3 flex items-center gap-2">
            <i class="fas fa-calculator text-green-600"></i>
            Stima ROI mensile
          </h3>
          <div class="grid grid-cols-2 gap-2 text-sm" id="roiGrid">
            <div class="bg-white rounded-lg p-2 text-center">
              <div class="text-xs text-gray-500">Budget/mese</div>
              <div class="font-bold text-gray-800" id="roiBudget">€300</div>
            </div>
            <div class="bg-white rounded-lg p-2 text-center">
              <div class="text-xs text-gray-500">Click stimati</div>
              <div class="font-bold text-blue-600" id="roiClicks">~250</div>
            </div>
            <div class="bg-white rounded-lg p-2 text-center">
              <div class="text-xs text-gray-500">Lead stimati</div>
              <div class="font-bold text-orange-500" id="roiLeads">~12</div>
            </div>
            <div class="bg-white rounded-lg p-2 text-center">
              <div class="text-xs text-gray-500">ROI stimato</div>
              <div class="font-bold text-green-600" id="roiReturn">5-7x</div>
            </div>
          </div>
        </div>

        <button onclick="generateAds()"
          class="mt-5 w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2">
          <i class="fas fa-magic"></i>
          Genera Annunci
        </button>
      </div>

      <!-- OUTPUT PANEL — PREVIEW ANNUNCIO -->
      <div class="section-card">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i class="fab fa-google text-blue-500"></i>
            Preview annuncio Google
          </h2>
          <button onclick="copyAllAds()" class="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1">
            <i class="fas fa-copy"></i>Copia tutto
          </button>
        </div>

        <!-- SERP preview -->
        <div class="preview-ad bg-gray-50 rounded-xl p-4 mb-5 font-sans" id="serpPreview">
          <div class="text-xs text-gray-400 mb-1">Annuncio · ecura-landing.pages.dev</div>
          <div class="text-blue-700 text-lg font-medium leading-tight" id="prevTitle">
            Bracciale Teleassistenza Anziani · GPS + AI H24 · Da €390/anno
          </div>
          <div class="text-gray-600 text-sm mt-2 leading-relaxed" id="prevDesc">
            Dispositivo medico certificato Classe IIa. Rileva cadute in 3 secondi, avvisa i soccorsi automaticamente. Scelto da 60.000 famiglie.
          </div>
        </div>

        <!-- HEADLINES -->
        <div id="headlinesSection">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-700 text-sm flex items-center gap-2">
              <i class="fas fa-heading text-purple-500"></i>
              Headline (15 disponibili, max 30 car.)
            </h3>
            <button onclick="copySection('headlinesCopy')" class="copy-btn text-xs text-gray-500 px-2 py-1 rounded transition">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div id="headlinesList" class="space-y-2"></div>
          <textarea id="headlinesCopy" class="hidden"></textarea>
        </div>

        <!-- DESCRIPTIONS -->
        <div class="mt-5" id="descriptionsSection">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-700 text-sm flex items-center gap-2">
              <i class="fas fa-align-left text-green-500"></i>
              Description (4 disponibili, max 90 car.)
            </h3>
            <button onclick="copySection('descriptionsCopy')" class="copy-btn text-xs text-gray-500 px-2 py-1 rounded transition">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <div id="descriptionsList" class="space-y-2"></div>
          <textarea id="descriptionsCopy" class="hidden"></textarea>
        </div>

        <!-- SITELINK EXTENSIONS -->
        <div class="mt-5" id="sitelinkSection">
          <h3 class="font-bold text-gray-700 text-sm mb-3 flex items-center gap-2">
            <i class="fas fa-link text-orange-500"></i>
            Sitelink Extensions
          </h3>
          <div id="sitelinkList" class="space-y-2"></div>
        </div>
      </div>
    </div>

    <!-- ALL HEADLINES MATRIX -->
    <div class="section-card mt-2">
      <h2 class="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-table text-indigo-500"></i>
        Matrice completa headline (15) + description (4)
        <span class="text-xs bg-indigo-100 text-indigo-600 px-2 py-1 rounded-full">Responsive Search Ad</span>
      </h2>
      <div id="fullMatrix" class="overflow-x-auto">
        <p class="text-gray-400 text-sm">Clicca "Genera Annunci" per visualizzare la matrice completa.</p>
      </div>
    </div>

  </div><!-- /tab-generator -->


  <!-- ══════════════════════════════════════════════════
       TAB 2 — KEYWORD PLANNER
  ══════════════════════════════════════════════════ -->
  <div id="tab-keywords" class="tab-content hidden fade-in">

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- KEYWORD SUGGERITE -->
      <div class="section-card">
        <h2 class="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <i class="fas fa-search text-blue-500"></i>
          Keyword suggerite per eCura
        </h2>

        <div class="space-y-5" id="kwGroups">

          <!-- Intento diretto -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-blue-500 text-white text-xs px-2 py-0.5 rounded font-bold">🎯 INTENTO DIRETTO</span>
              <span class="text-xs text-gray-400">CPC stimato €1.00–2.00</span>
            </div>
            <div id="kwIntent" class="flex flex-wrap gap-1"></div>
          </div>

          <!-- Competitor -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-red-500 text-white text-xs px-2 py-0.5 rounded font-bold">⚔️ COMPETITOR</span>
              <span class="text-xs text-gray-400">CPC stimato €0.60–1.40</span>
            </div>
            <div id="kwCompetitor" class="flex flex-wrap gap-1"></div>
          </div>

          <!-- Problema/Bisogno -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-bold">💭 PROBLEMA</span>
              <span class="text-xs text-gray-400">CPC stimato €0.30–0.80</span>
            </div>
            <div id="kwProblem" class="flex flex-wrap gap-1"></div>
          </div>

          <!-- Negative -->
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="bg-gray-600 text-white text-xs px-2 py-0.5 rounded font-bold">🚫 NEGATIVE KW</span>
              <span class="text-xs text-gray-400">Aggiungi subito per non sprecare budget</span>
            </div>
            <div id="kwNegative" class="flex flex-wrap gap-1"></div>
          </div>

        </div>

        <div class="mt-4 flex gap-2 flex-wrap text-xs text-gray-500">
          <span class="flex items-center gap-1"><span class="kw-chip kw-exact">kw</span> [Exact Match]</span>
          <span class="flex items-center gap-1"><span class="kw-chip kw-phrase">kw</span> "Phrase Match"</span>
          <span class="flex items-center gap-1"><span class="kw-chip kw-broad">kw</span> +Broad Modified</span>
          <span class="flex items-center gap-1"><span class="kw-chip kw-neg">kw</span> -Negative</span>
        </div>
      </div>

      <!-- EXPORT KEYWORD LIST -->
      <div class="section-card">
        <h2 class="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <i class="fas fa-download text-green-500"></i>
          Esporta lista keyword
        </h2>

        <div class="space-y-3 mb-5">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="expIntent" checked class="rounded text-blue-500">
            <span class="text-sm">Keyword intento diretto</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="expCompetitor" checked class="rounded text-blue-500">
            <span class="text-sm">Keyword competitor</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="expProblem" class="rounded text-blue-500">
            <span class="text-sm">Keyword problema/bisogno</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" id="expNegative" checked class="rounded text-blue-500">
            <span class="text-sm">Negative keyword (come lista separata)</span>
          </label>
        </div>

        <textarea id="kwExportBox" rows="12"
          class="w-full border border-gray-200 rounded-xl p-3 text-xs font-mono bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          placeholder="Clicca 'Genera lista' per vedere le keyword pronte..."></textarea>

        <div class="flex gap-2 mt-3">
          <button onclick="generateKwList()" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold py-2.5 rounded-lg transition">
            <i class="fas fa-list mr-1"></i>Genera lista
          </button>
          <button onclick="copyKwList()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-lg transition">
            <i class="fas fa-copy mr-1"></i>Copia
          </button>
        </div>

        <!-- Orario suggerito -->
        <div class="mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 class="font-bold text-amber-800 text-sm mb-3 flex items-center gap-2">
            <i class="fas fa-clock text-amber-600"></i>
            Pianificazione annunci consigliata
          </h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between text-amber-700">
              <span>Lunedì–Venerdì</span><span class="font-bold">08:00–20:00</span>
            </div>
            <div class="flex justify-between text-amber-700">
              <span>Sabato</span><span class="font-bold">09:00–18:00</span>
            </div>
            <div class="flex justify-between text-amber-700">
              <span>Domenica</span><span class="font-bold">Ridotto –50% bid</span>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div><!-- /tab-keywords -->


  <!-- ══════════════════════════════════════════════════
       TAB 3 — PERFORMANCE UTM
  ══════════════════════════════════════════════════ -->
  <div id="tab-utm" class="tab-content hidden fade-in">

    <div class="section-card mb-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <i class="fas fa-chart-line text-blue-500"></i>
          Performance campagne Google (da lead DB)
        </h2>
        <button onclick="loadUtmData()" class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2">
          <i class="fas fa-sync-alt"></i>Aggiorna
        </button>
      </div>

      <!-- KPI CARDS -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-blue-50 rounded-xl p-4 text-center">
          <div class="text-xs text-blue-500 font-semibold mb-1">Lead totali Google</div>
          <div class="text-3xl font-bold text-blue-700" id="utmTotalGoogle">—</div>
        </div>
        <div class="bg-green-50 rounded-xl p-4 text-center">
          <div class="text-xs text-green-500 font-semibold mb-1">Campagne attive</div>
          <div class="text-3xl font-bold text-green-700" id="utmCampaigns">—</div>
        </div>
        <div class="bg-orange-50 rounded-xl p-4 text-center">
          <div class="text-xs text-orange-500 font-semibold mb-1">Ultima campagna</div>
          <div class="text-sm font-bold text-orange-700 break-all" id="utmLastCampaign">—</div>
        </div>
        <div class="bg-purple-50 rounded-xl p-4 text-center">
          <div class="text-xs text-purple-500 font-semibold mb-1">Valore stimato lead</div>
          <div class="text-3xl font-bold text-purple-700" id="utmEstValue">—</div>
        </div>
      </div>

      <!-- TABELLA CAMPAGNE -->
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-50 text-gray-600 text-xs font-semibold">
              <th class="px-4 py-3 text-left rounded-l-lg">Campagna</th>
              <th class="px-4 py-3 text-left">Medium</th>
              <th class="px-4 py-3 text-center">Lead</th>
              <th class="px-4 py-3 text-center">Piano più scelto</th>
              <th class="px-4 py-3 text-right rounded-r-lg">Valore stimato</th>
            </tr>
          </thead>
          <tbody id="utmTableBody">
            <tr>
              <td colspan="5" class="text-center py-8 text-gray-400">
                <i class="fas fa-spinner fa-spin text-2xl mb-2 block"></i>
                Caricamento dati...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- COSTRUTTORE UTM -->
    <div class="section-card">
      <h2 class="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-link text-orange-500"></i>
        Costruttore URL UTM
        <span class="text-xs text-gray-400 font-normal ml-1">Genera link tracciati per le tue campagne</span>
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">URL base</label>
          <input type="text" id="utmBase" value="https://ecura-landing.pages.dev/"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" oninput="buildUtmUrl()">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">utm_source</label>
          <select id="utmSource" onchange="buildUtmUrl()" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="google">google</option>
            <option value="google_ads">google_ads</option>
            <option value="bing">bing</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">utm_medium</label>
          <select id="utmMedium" onchange="buildUtmUrl()" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="cpc">cpc</option>
            <option value="display">display</option>
            <option value="pmax">pmax</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">utm_campaign</label>
          <input type="text" id="utmCampaign" placeholder="es. bracciale-cadute-anziani"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" oninput="buildUtmUrl()">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">utm_content</label>
          <input type="text" id="utmContent" placeholder="es. headline-1"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" oninput="buildUtmUrl()">
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-600 mb-1">utm_term (keyword)</label>
          <input type="text" id="utmTerm" placeholder="es. bracciale teleassistenza"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" oninput="buildUtmUrl()">
        </div>
      </div>

      <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center gap-3">
        <code class="flex-1 text-xs text-blue-700 break-all font-mono" id="utmOutput">
          https://ecura-landing.pages.dev/
        </code>
        <button onclick="copyUtmUrl()" class="flex-shrink-0 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    </div>

  </div><!-- /tab-utm -->


  <!-- ══════════════════════════════════════════════════
       TAB 4 — CONVERSION TRACKING
  ══════════════════════════════════════════════════ -->
  <div id="tab-tracking" class="tab-content hidden fade-in">

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- CONFIG -->
      <div class="section-card">
        <h2 class="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
          <i class="fas fa-cog text-gray-500"></i>
          Configurazione Conversion Tag
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Google Ads Conversion ID
              <span class="text-xs text-gray-400 font-normal ml-1">Formato: AW-XXXXXXXXX</span>
            </label>
            <input type="text" id="gadsConvId" placeholder="AW-1234567890"
              oninput="generateTrackingCode()"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-400">
            <p class="text-xs text-gray-400 mt-1">
              Trovalo in Google Ads → Strumenti → Misurazioni → Conversioni → Dettagli tag
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              Conversion Label
              <span class="text-xs text-gray-400 font-normal ml-1">Formato: XXXXXXXXXXX</span>
            </label>
            <input type="text" id="gadsConvLabel" placeholder="AbCdEfGhIjK"
              oninput="generateTrackingCode()"
              class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:ring-2 focus:ring-blue-400">
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Valore conversione (€)</label>
            <select id="gadsConvValue" onchange="generateTrackingCode()" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
              <option value="dynamic">Dinamico (usa prezzo piano selezionato)</option>
              <option value="390">Fisso €390 (Family Base)</option>
              <option value="480">Fisso €480 (PRO Base)</option>
              <option value="1">Lead (€1 — ottimizza per volume)</option>
            </select>
          </div>
        </div>

        <div class="mt-5 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <h3 class="font-bold text-yellow-800 text-sm mb-2 flex items-center gap-1">
            <i class="fas fa-info-circle text-yellow-600"></i>
            Come ottenere Conversion ID e Label
          </h3>
          <ol class="text-xs text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Vai su <strong>ads.google.com</strong></li>
            <li>Clicca <strong>Strumenti → Misurazioni → Conversioni</strong></li>
            <li>Crea nuova conversione → tipo <strong>"Sito web"</strong></li>
            <li>Azione: <strong>"Invio modulo"</strong></li>
            <li>Copia l'<strong>ID conversione</strong> e il <strong>Label</strong></li>
          </ol>
        </div>
      </div>

      <!-- CODICE GENERATO -->
      <div class="section-card">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i class="fas fa-code text-purple-500"></i>
            Codice da inserire nella landing
          </h2>
          <button onclick="copyTrackingCode()" class="bg-purple-50 hover:bg-purple-100 text-purple-600 text-xs px-3 py-1.5 rounded-lg font-semibold transition">
            <i class="fas fa-copy mr-1"></i>Copia codice
          </button>
        </div>

        <pre id="trackingCodeOutput" class="bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap"><!-- Inserisci Conversion ID e Label per generare il codice --></pre>

        <div class="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 class="font-bold text-blue-800 text-sm mb-2">Dove incollare il codice</h3>
          <p class="text-xs text-blue-700">
            Incolla questo snippet nel file <code class="bg-blue-100 px-1 rounded">ecura-landing/public/index.html</code>
            subito prima del tag <code class="bg-blue-100 px-1 rounded">&lt;/body&gt;</code>.
            Il tag si attiverà automaticamente ogni volta che un form viene inviato con successo.
          </p>
        </div>

        <!-- GTAG SNIPPET globale -->
        <div class="mt-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold text-gray-700 text-sm">Global Site Tag (gtag.js)</h3>
            <button onclick="copyGtag()" class="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition">
              <i class="fas fa-copy"></i>
            </button>
          </div>
          <pre id="gtagSnippet" class="bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap"><!-- Inserisci Conversion ID per generare il Global Site Tag --></pre>
        </div>
      </div>

    </div>
  </div><!-- /tab-tracking -->


  <!-- ══════════════════════════════════════════════════
       TAB 5 — EXPORT CSV
  ══════════════════════════════════════════════════ -->
  <div id="tab-export" class="tab-content hidden fade-in">

    <div class="section-card">
      <h2 class="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
        <i class="fas fa-file-csv text-green-500"></i>
        Export CSV compatibile con Google Ads Editor
      </h2>
      <p class="text-sm text-gray-500 mb-6">
        Importa questo file direttamente in <strong>Google Ads Editor</strong> (File → Import → From file)
        per creare campagne, gruppi e annunci in pochi secondi — senza copiare nulla manualmente.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Nome campagna</label>
          <input type="text" id="csvCampaignName" value="eCura - Teleassistenza Anziani"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Budget giornaliero (€)</label>
          <input type="number" id="csvBudget" value="10"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">URL finale</label>
          <input type="text" id="csvFinalUrl" value="https://ecura-landing.pages.dev/"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
        </div>
      </div>

      <div class="flex gap-3 mb-5 flex-wrap">
        <button onclick="generateCsv('full')"
          class="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-lg transition flex items-center gap-2">
          <i class="fas fa-file-csv"></i>
          Genera CSV completo
        </button>
        <button onclick="generateCsv('keywords')"
          class="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg transition flex items-center gap-2">
          <i class="fas fa-key"></i>
          Solo keyword
        </button>
        <button onclick="generateCsv('ads')"
          class="bg-purple-500 hover:bg-purple-600 text-white font-semibold px-5 py-2.5 rounded-lg transition flex items-center gap-2">
          <i class="fas fa-ad"></i>
          Solo annunci
        </button>
        <button onclick="downloadCsv()"
          class="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg transition flex items-center gap-2">
          <i class="fas fa-download"></i>
          Scarica .csv
        </button>
      </div>

      <textarea id="csvOutput" rows="20"
        class="w-full border border-gray-200 rounded-xl p-4 text-xs font-mono bg-gray-50 focus:ring-2 focus:ring-green-400"
        placeholder="Clicca 'Genera CSV completo' per generare il file..."></textarea>

      <div class="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
        <h3 class="font-bold text-green-800 text-sm mb-2 flex items-center gap-1">
          <i class="fas fa-info-circle text-green-600"></i>
          Come usare il CSV con Google Ads Editor
        </h3>
        <ol class="text-xs text-green-700 space-y-1 list-decimal list-inside">
          <li>Scarica <strong>Google Ads Editor</strong> da ads.google.com/intl/it/home/tools/ads-editor/</li>
          <li>Apri il tuo account Google Ads in Editor</li>
          <li>Vai su <strong>File → Importa → Da file CSV/TSV</strong></li>
          <li>Seleziona il file scaricato e clicca <strong>Importa</strong></li>
          <li>Verifica l'anteprima e clicca <strong>Carica modifiche</strong></li>
        </ol>
      </div>
    </div>

  </div><!-- /tab-export -->

</div><!-- /max-w-7xl -->

<!-- TOAST NOTIFICATION -->
<div id="toast" class="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium hidden transition-all z-50">
  <i class="fas fa-check-circle text-green-400 mr-2"></i>
  <span id="toastMsg">Copiato!</span>
</div>

<script>
// ═══════════════════════════════════════════════════════════
//  DATA — Keyword database
// ═══════════════════════════════════════════════════════════
const KW_DATA = {
  intent: [
    { kw: 'bracciale teleassistenza anziani', match: 'exact', cpc: 1.50 },
    { kw: 'bracciale rilevamento cadute anziani', match: 'exact', cpc: 1.80 },
    { kw: 'dispositivo medico anziani GPS', match: 'exact', cpc: 1.60 },
    { kw: 'bracciale SOS anziani prezzo', match: 'phrase', cpc: 1.20 },
    { kw: 'teleassistenza anziani abbonamento', match: 'exact', cpc: 1.40 },
    { kw: 'bracciale emergenza anziani', match: 'phrase', cpc: 1.30 },
    { kw: 'monitoraggio anziani a distanza', match: 'phrase', cpc: 1.10 },
    { kw: 'bracciale medico certificato anziani', match: 'exact', cpc: 1.70 },
    { kw: 'dispositivo cadute anziani casa', match: 'phrase', cpc: 1.20 },
    { kw: 'GPS localizzazione anziani bracciale', match: 'phrase', cpc: 1.40 },
  ],
  competitor: [
    { kw: 'beghelli salvavita alternativa', match: 'phrase', cpc: 0.80 },
    { kw: 'seremy bracciale prezzo', match: 'phrase', cpc: 0.70 },
    { kw: 'televita teleassistenza', match: 'phrase', cpc: 0.90 },
    { kw: 'sidly bracciale', match: 'phrase', cpc: 0.65 },
    { kw: 'infamiglia teleassistenza alternativa', match: 'phrase', cpc: 0.75 },
    { kw: 'salvavita anziani migliore', match: 'phrase', cpc: 1.00 },
    { kw: 'alternativa beghelli professionale', match: 'phrase', cpc: 0.85 },
    { kw: 'bracciale salvavita classe IIa', match: 'exact', cpc: 1.20 },
  ],
  problem: [
    { kw: 'anziano solo in casa sicurezza', match: 'broad', cpc: 0.45 },
    { kw: 'come proteggere anziano che vive solo', match: 'broad', cpc: 0.40 },
    { kw: 'cadute anziani in casa prevenzione', match: 'broad', cpc: 0.55 },
    { kw: 'mia madre vive sola cosa fare', match: 'broad', cpc: 0.35 },
    { kw: 'genitore anziano solo come monitorare', match: 'broad', cpc: 0.50 },
    { kw: 'anziano cade spesso cosa fare', match: 'broad', cpc: 0.60 },
    { kw: 'monitorare anziano senza disturbare', match: 'broad', cpc: 0.45 },
    { kw: 'nonno solo in casa sicuro', match: 'broad', cpc: 0.40 },
  ],
  negative: [
    'gratis', 'gratuito', 'lavoro', 'offerta di lavoro', 'fai da te',
    'smartwatch sport', 'fitness', 'bambini', 'neonato', 'cane', 'gatto',
    'riparazione', 'come costruire', 'youtube', 'usato', 'seconda mano',
    'veterinario', 'tutorial', 'corso', 'formazione'
  ]
};

// ═══════════════════════════════════════════════════════════
//  DATA — Annunci per tipo campagna
// ═══════════════════════════════════════════════════════════
const ADS_DATA = {
  intent: {
    headlines: [
      'Bracciale Teleassistenza Anziani',
      'GPS + Rilevamento Cadute AI',
      'Da €390/anno · Detraibile 19%',
      'Dispositivo Medico Classe IIa',
      'Centrale Operativa H24',
      'Cadute Rilevate in 3 Secondi',
      'SIM Integrata · No Smartphone',
      '60.000 Famiglie in Europa',
      'Configurazione da Remoto',
      'Certificato · Rimborsabile INPS',
      'GPS Indoor e Outdoor Preciso',
      'Richiedi Info Senza Impegno',
      'Protezione Anziani 24/7',
      'Bracciale Medico Impermeabile',
      'App Famiglia in Tempo Reale',
    ],
    descriptions: [
      'Tua madre vive sola? Il bracciale eCura rileva cadute in 3 sec e avvisa i soccorsi automaticamente. Richiedi info gratis.',
      'Dispositivo medico certificato Classe IIa. GPS multi-tech indoor/outdoor. Centrale H24. Da €390/anno, detraibile al 19%.',
      'Scelto da 60.000 famiglie europee. Configurazione da remoto in 20 minuti. App mobile per tutta la famiglia inclusa.',
      'Il bracciale SidLy monitora parametri vitali, rileva cadute con AI e contatta i soccorsi. Rimborsi INPS disponibili.',
    ],
    sitelinks: [
      { text: 'Vedi i prezzi', url: '#pricingPlan', desc: 'Piani da €390/anno IVA esclusa' },
      { text: 'Come funziona', url: '#funcionality', desc: 'Tutte le funzionalità del bracciale' },
      { text: 'Perché eCura', url: '#whyEcura', desc: 'Confronto con altri bracciali' },
      { text: 'Contattaci', url: '#contattaci', desc: 'Risposta entro 24 ore' },
    ]
  },
  competitor: {
    headlines: [
      'Alternativa Certificata Classe IIa',
      'Più di un Semplice Salvavita',
      'GPS + Vitali + IA Predittiva',
      'Da €390/anno Tutto Incluso',
      'Dispositivo Medico Certificato',
      'Centrale H24 · Non Solo SOS',
      'Rileva Cadute Automaticamente',
      'Detraibile 19% · Rimborso INPS',
      '60.000 Famiglie Europee',
      'SIM Integrata · Autonomo',
      'Confronta con il Tuo Attuale',
      'Parametri Vitali in Tempo Reale',
      'App Famiglia Inclusa Gratis',
      'Switch Senza Attivazione',
      'Info Gratis Senza Impegno',
    ],
    descriptions: [
      'A differenza dei semplici salvavita, eCura monitora cadute con AI, GPS preciso e parametri vitali H24. Classe IIa.',
      "Stai cercando un'alternativa più completa? eCura ha Centrale Operativa H24, GPS indoor/outdoor e AI predittiva.",
      'Dispositivo medico certificato Classe IIa: non solo SOS, ma monitoraggio completo. Da €390/anno detraibile al 19%.',
      'Confronta eCura: GPS multi-tech indoor/outdoor, rileva cadute in 3 sec, app famiglia, centrale H24. Richiedi info.',
    ],
    sitelinks: [
      { text: 'Confronto bracciali', url: '#whyEcura', desc: 'Tabella comparativa completa' },
      { text: 'Certificazione IIa', url: '#whyEcura', desc: 'Cosa significa Classe IIa' },
      { text: 'Vedi i piani', url: '#pricingPlan', desc: 'Family, PRO e PREMIUM' },
      { text: 'Chiedi una demo', url: '#contattaci', desc: 'Configurazione in 20 minuti' },
    ]
  },
  problem: {
    headlines: [
      'Anziano Solo in Casa? eCura',
      'Se Cade Ti Avvisiamo Subito',
      'Serenità Anche a Distanza',
      'GPS Sempre Attivo in Casa',
      'Nessuno Smartphone Necessario',
      'Bracciale Discreto e Impermeabile',
      'Rilevamento Cadute Automatico',
      'App Famiglia · Notifiche Live',
      'Da €390/anno · Tutto Incluso',
      'Dispositivo Medico Certificato',
      'Centrale Operativa 24/7',
      'Promemoria Farmaci Integrato',
      'Autonomia con Sicurezza',
      'Configurato in 20 Minuti',
      'Richiedi Info Gratis Ora',
    ],
    descriptions: [
      'Sai sempre dove si trovano i tuoi cari e ricevi notifica immediata se cadono. eCura ti dà serenità anche a distanza.',
      'Il bracciale eCura rileva cadute automaticamente e allerta la centrale H24 e la tua famiglia in 3 secondi. Da €390.',
      'Tuo padre vive solo? eCura monitora i parametri vitali, localizza in casa e fuori, e avvisa i soccorsi se necessario.',
      'Senza smartphone, senza complicazioni: il bracciale funziona autonomamente. GPS, cadute, SOS. Detraibile al 19%.',
    ],
    sitelinks: [
      { text: 'Come ci pensa eCura', url: '#ecuraSecurity', desc: 'Protezione completa 24/7' },
      { text: 'Funzionalità', url: '#funcionality', desc: 'Tutto quello che fa il bracciale' },
      { text: 'Testimonianze', url: '#testimonial', desc: 'Chi usa già eCura' },
      { text: 'Richiedi info', url: '#contattaci', desc: 'Risposta entro 24 ore' },
    ]
  },
  local: {
    headlines: [
      'Teleassistenza Anziani',
      'GPS + Cadute AI · H24',
      'Da €390/anno · Classe IIa',
      'Dispositivo Medico Certificato',
      'Centrale Operativa 24/7',
      'Configurazione da Remoto',
      'SIM Integrata · Autonomo',
      'Detraibile al 19%',
      '60.000 Famiglie in Europa',
      'Rilevamento Cadute 3 Secondi',
      'App Famiglia Inclusa',
      'Rimborsi INPS Disponibili',
      'Impermeabile IP67',
      'GPS Indoor + Outdoor',
      'Richiedi Info Senza Impegno',
    ],
    descriptions: [
      'Protezione per i tuoi anziani 24/7. Bracciale medico certificato Classe IIa con GPS, rilevamento cadute AI e centrale H24.',
      'Dispositivo medico detraibile al 19%. Configurazione da remoto in 20 minuti. Da €390/anno tutto incluso.',
      'Il bracciale eCura rileva cadute automaticamente, localizza con GPS e avvisa famiglia e soccorsi in 3 secondi.',
      'Scelto da 60.000 famiglie europee. SIM integrata, app famiglia, promemoria farmaci. Richiedi informazioni gratis.',
    ],
    sitelinks: [
      { text: 'Vedi i prezzi', url: '#pricingPlan', desc: 'Piani da €390/anno IVA esclusa' },
      { text: 'Come funziona', url: '#funcionality', desc: 'Tutte le funzionalità' },
      { text: 'Testimonianze', url: '#testimonial', desc: 'Cosa dicono i clienti' },
      { text: 'Contattaci', url: '#contattaci', desc: 'Risposta entro 24 ore' },
    ]
  }
};

// ═══════════════════════════════════════════════════════════
//  PLAN PRICES
// ═══════════════════════════════════════════════════════════
const PLAN_PRICES = { family: 390, pro: 480, premium: 590, all: 480 };

// ═══════════════════════════════════════════════════════════
//  TABS
// ═══════════════════════════════════════════════════════════
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.remove('hidden');
  event.target.closest('.tab-btn').classList.add('active');

  if (name === 'utm')      loadUtmData();
  if (name === 'keywords') renderKeywords();
}

// ═══════════════════════════════════════════════════════════
//  GENERATOR
// ═══════════════════════════════════════════════════════════
function updateGenerator() { /* live preview while typing */ }

function charClass(len, max) {
  if (len === 0)    return '';
  if (len <= max * 0.75) return 'char-ok';
  if (len <= max)        return 'char-warn';
  return 'char-bad';
}

function generateAds() {
  const type    = document.getElementById('campaignType').value;
  const plan    = document.getElementById('planFocus').value;
  const kw      = document.getElementById('mainKeyword').value.trim();
  const city    = document.getElementById('cityFocus').value.trim();
  const ads     = ADS_DATA[type];
  const price   = PLAN_PRICES[plan];

  // Personalizza headline con città se presente
  let headlines = [...ads.headlines];
  if (city && type === 'local') {
    headlines[0] = 'Teleassistenza Anziani ' + city;
    headlines[1] = 'eCura ' + city + ' · GPS H24';
  }
  if (kw) {
    headlines[0] = capitalize(kw);
  }

  // Personalizza con prezzo piano
  if (plan !== 'all') {
    headlines = headlines.map(h => h.replace('€390', '€' + price).replace('€480', '€' + price));
  }

  // Render preview SERP
  document.getElementById('prevTitle').textContent =
    headlines.slice(0, 3).join(' · ');
  document.getElementById('prevDesc').textContent = ads.descriptions[0];

  // Render headlines list
  const hl = document.getElementById('headlinesList');
  hl.innerHTML = '';
  let hlCopyText = '';
  headlines.forEach((h, i) => {
    const len = h.length;
    const cls = charClass(len, 30);
    hl.innerHTML += \`
      <div class="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
        <span class="text-xs text-gray-400 w-4 text-right">\${i+1}</span>
        <span class="flex-1 text-sm">\${h}</span>
        <span class="\${cls} text-xs w-8 text-right">\${len}/30</span>
        <button onclick="copyText(this.dataset.v,this)" data-v="${h}" class="copy-btn px-2 py-1 rounded text-xs text-gray-400 hover:text-blue-500 transition">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    \`;
    hlCopyText += h + '\\n';
  });
  document.getElementById('headlinesCopy').value = hlCopyText;

  // Render descriptions list
  const dl = document.getElementById('descriptionsList');
  dl.innerHTML = '';
  let dlCopyText = '';
  ads.descriptions.forEach((d, i) => {
    const len = d.length;
    const cls = charClass(len, 90);
    dl.innerHTML += \`
      <div class="flex items-start gap-2 bg-gray-50 rounded-lg px-3 py-2">
        <span class="text-xs text-gray-400 w-4 text-right mt-0.5">\${i+1}</span>
        <span class="flex-1 text-sm leading-relaxed">\${d}</span>
        <span class="\${cls} text-xs w-10 text-right mt-0.5">\${len}/90</span>
        <button onclick="copyText(this.dataset.txt,this)" data-txt="" class="copy-btn px-2 py-1 rounded text-xs text-gray-400 hover:text-blue-500 transition flex-shrink-0 desc-copy-btn">
          <i class="fas fa-copy"></i>
        </button>
      </div>
    \`;
    dlCopyText += d + '\\n';
  });
  document.getElementById('descriptionsCopy').value = dlCopyText;

  // Set data-txt on description copy buttons (avoids backtick/quote escaping issues)
  requestAnimationFrame(() => {
    document.querySelectorAll('#descriptionsList .desc-copy-btn').forEach((btn, i) => {
      if (ads.descriptions[i]) btn.dataset.txt = ads.descriptions[i];
    });
  });

  // Render sitelinks
  const sl = document.getElementById('sitelinkList');
  sl.innerHTML = '';
  ads.sitelinks.forEach(s => {
    sl.innerHTML += \`
      <div class="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
        <i class="fas fa-link text-blue-400 text-xs"></i>
        <div class="flex-1">
          <div class="text-sm font-semibold text-blue-700">\${s.text}</div>
          <div class="text-xs text-blue-500">ecura-landing.pages.dev/\${s.url} · \${s.desc}</div>
        </div>
      </div>
    \`;
  });

  // Render full matrix
  renderFullMatrix(headlines, ads.descriptions);

  showToast('Annunci generati! ✓');
}

function renderFullMatrix(headlines, descriptions) {
  const m = document.getElementById('fullMatrix');
  let html = \`<div class="overflow-x-auto"><table class="w-full text-xs border-collapse">
    <thead><tr class="bg-gray-100">
      <th class="px-3 py-2 text-left font-bold text-gray-600 w-8">#</th>
      <th class="px-3 py-2 text-left font-bold text-gray-600">Testo</th>
      <th class="px-3 py-2 text-center font-bold text-gray-600 w-16">Car.</th>
      <th class="px-3 py-2 text-center font-bold text-gray-600 w-16">Tipo</th>
      <th class="px-3 py-2 text-center font-bold text-gray-600 w-10">Copia</th>
    </tr></thead>
    <tbody>\`;

  headlines.forEach((h, i) => {
    const len = h.length;
    const cls = len > 30 ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    const charCls = charClass(len, 30);
    html += \`<tr class="\${cls} border-b border-gray-100">
      <td class="px-3 py-2 text-gray-400">\${i+1}</td>
      <td class="px-3 py-2 font-medium text-gray-800">\${h}</td>
      <td class="px-3 py-2 text-center \${charCls}">\${len}/30</td>
      <td class="px-3 py-2 text-center"><span class="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-bold">H</span></td>
      <td class="px-3 py-2 text-center"><button onclick="copyText(this.dataset.v,this)" data-v="${h}" class="copy-btn px-1.5 py-1 rounded text-gray-400 hover:text-blue-500"><i class="fas fa-copy"></i></button></td>
    </tr>\`;
  });

  descriptions.forEach((d, i) => {
    const len = d.length;
    const cls = len > 90 ? 'bg-red-50' : i % 2 === 0 ? 'bg-blue-50' : 'bg-white';
    const charCls = charClass(len, 90);
    html += \`<tr class="\${cls} border-b border-gray-100">
      <td class="px-3 py-2 text-gray-400">D\${i+1}</td>
      <td class="px-3 py-2 text-gray-700">\${d}</td>
      <td class="px-3 py-2 text-center \${charCls}">\${len}/90</td>
      <td class="px-3 py-2 text-center"><span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">D</span></td>
      <td class="px-3 py-2 text-center"><button onclick="copyText(this.dataset.txt,this)" data-txt="" class="copy-btn desc-copy-btn px-1.5 py-1 rounded text-gray-400 hover:text-blue-500"><i class="fas fa-copy"></i></button></td>
    </tr>\`;
  });

  html += '</tbody></table></div>';
  m.innerHTML = html;

  // Populate data-txt for matrix description copy buttons
  requestAnimationFrame(() => {
    document.querySelectorAll('#fullMatrix .desc-copy-btn').forEach((btn, i) => {
      if (descriptions[i]) btn.dataset.txt = descriptions[i];
    });
  });
}

// ═══════════════════════════════════════════════════════════
//  ROI
// ═══════════════════════════════════════════════════════════
function updateROI() {
  const daily  = parseFloat(document.getElementById('dailyBudget').value) || 10;
  const monthly = daily * 30;
  const cpc     = 1.20;
  const clicks  = Math.round(monthly / cpc);
  const leads   = Math.round(clicks * 0.05);
  const plan    = document.getElementById('planFocus')?.value || 'all';
  const price   = PLAN_PRICES[plan] || 480;
  const roi     = leads > 0 ? Math.round((leads * 0.3 * price) / monthly) : 0;

  document.getElementById('roiBudget').textContent   = '€' + monthly;
  document.getElementById('roiClicks').textContent   = '~' + clicks;
  document.getElementById('roiLeads').textContent    = '~' + leads;
  document.getElementById('roiReturn').textContent   = roi > 0 ? roi + 'x' : '—';
}

// ═══════════════════════════════════════════════════════════
//  KEYWORDS RENDER
// ═══════════════════════════════════════════════════════════
function renderKeywords() {
  const matchClass = { exact: 'kw-exact', phrase: 'kw-phrase', broad: 'kw-broad' };
  const matchLabel = { exact: '[…]', phrase: '"…"', broad: '+…' };

  ['intent','competitor','problem'].forEach(type => {
    const el = document.getElementById('kw' + type.charAt(0).toUpperCase() + type.slice(1));
    if (!el) return;
    el.innerHTML = KW_DATA[type].map(k =>
      \`<span class="kw-chip \${matchClass[k.match]}" title="CPC ~€\${k.cpc}">
        \${matchLabel[k.match]} \${k.kw}
        <span class="opacity-60 text-xs">€\${k.cpc}</span>
       </span>\`
    ).join('');
  });

  const negEl = document.getElementById('kwNegative');
  if (negEl) {
    negEl.innerHTML = KW_DATA.negative.map(k =>
      \`<span class="kw-chip kw-neg">-\${k}</span>\`
    ).join('');
  }
}

function generateKwList() {
  const inc = {
    intent:     document.getElementById('expIntent').checked,
    competitor: document.getElementById('expCompetitor').checked,
    problem:    document.getElementById('expProblem').checked,
    negative:   document.getElementById('expNegative').checked,
  };
  const matchFmt = { exact: '[{kw}]', phrase: '"{kw}"', broad: '+{kw}' };
  let out = '';

  if (inc.intent) {
    out += '# === KEYWORD INTENTO DIRETTO ===\\n';
    KW_DATA.intent.forEach(k => out += matchFmt[k.match].replace('{kw}', k.kw) + '\\n');
    out += '\\n';
  }
  if (inc.competitor) {
    out += '# === KEYWORD COMPETITOR ===\\n';
    KW_DATA.competitor.forEach(k => out += matchFmt[k.match].replace('{kw}', k.kw) + '\\n');
    out += '\\n';
  }
  if (inc.problem) {
    out += '# === KEYWORD PROBLEMA/BISOGNO ===\\n';
    KW_DATA.problem.forEach(k => out += matchFmt[k.match].replace('{kw}', k.kw) + '\\n');
    out += '\\n';
  }
  if (inc.negative) {
    out += '# === NEGATIVE KEYWORD ===\\n';
    KW_DATA.negative.forEach(k => out += '-' + k + '\\n');
  }

  document.getElementById('kwExportBox').value = out;
  showToast('Lista keyword generata!');
}

function copyKwList() {
  const box = document.getElementById('kwExportBox');
  box.select();
  navigator.clipboard.writeText(box.value);
  showToast('Keyword copiate!');
}

// ═══════════════════════════════════════════════════════════
//  UTM PERFORMANCE
// ═══════════════════════════════════════════════════════════
async function loadUtmData() {
  const tbody = document.getElementById('utmTableBody');
  tbody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-gray-400"><i class="fas fa-spinner fa-spin text-xl"></i></td></tr>';

  try {
    const res  = await fetch('/api/leads/channel-stats', { headers: { 'Authorization': 'Bearer ' + getToken() }});
    const data = await res.json();

    // Header counts
    const leadsRes = await fetch('/api/leads?limit=1', { headers: { 'Authorization': 'Bearer ' + getToken() }});
    const leadsData = await leadsRes.json();
    document.getElementById('headerLeadCount').textContent = leadsData.total || '—';

    const googleTotal = (data.google || 0) + (data.landing?.meta || 0);
    document.getElementById('headerGoogleCount').textContent = data.google || 0;
    document.getElementById('utmTotalGoogle').textContent    = data.google || 0;

    // UTM campaign details
    const utmRes  = await fetch('/api/leads/utm-stats', { headers: { 'Authorization': 'Bearer ' + getToken() }});
    if (utmRes.ok) {
      const utmData = await utmRes.json();
      renderUtmTable(utmData);
      document.getElementById('utmCampaigns').textContent   = utmData.campaigns?.length || 0;
      document.getElementById('utmLastCampaign').textContent = utmData.campaigns?.[0]?.campaign || '—';
      const estVal = (utmData.campaigns || []).reduce((s, c) => s + (c.count * 480), 0);
      document.getElementById('utmEstValue').textContent = estVal > 0 ? '€' + estVal : '—';
    } else {
      renderUtmTableFallback(data);
    }
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-red-400 text-sm"><i class="fas fa-exclamation-triangle mr-2"></i>Errore caricamento dati UTM</td></tr>';
  }
}

function renderUtmTableFallback(data) {
  const tbody = document.getElementById('utmTableBody');
  const rows = [
    { campaign: 'google / cpc', medium: 'cpc', count: data.google || 0, plan: 'PRO Base', value: (data.google || 0) * 480 },
    { campaign: 'eCura Landing (diretto)', medium: 'organico', count: data.landing?.diretto || 0, plan: 'PRO Base', value: (data.landing?.diretto || 0) * 480 },
    { campaign: 'eCura Landing (META)', medium: 'cpc', count: data.landing?.meta || 0, plan: 'PRO Base', value: (data.landing?.meta || 0) * 480 },
  ].filter(r => r.count > 0);

  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-gray-400 text-sm"><i class="fas fa-chart-bar text-3xl mb-2 block opacity-30"></i>Nessun lead Google ancora registrato<br><span class="text-xs">I dati appariranno qui non appena arriveranno lead da campagne Google Ads</span></td></tr>';
    return;
  }

  tbody.innerHTML = rows.map(r => \`
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="px-4 py-3 font-medium text-gray-800">\${r.campaign}</td>
      <td class="px-4 py-3"><span class="utm-badge bg-blue-100 text-blue-700">\${r.medium}</span></td>
      <td class="px-4 py-3 text-center font-bold text-blue-600">\${r.count}</td>
      <td class="px-4 py-3 text-center text-xs text-gray-500">\${r.plan}</td>
      <td class="px-4 py-3 text-right font-bold text-green-600">€\${r.value}</td>
    </tr>
  \`).join('');
}

function renderUtmTable(data) {
  const tbody = document.getElementById('utmTableBody');
  const campaigns = data.campaigns || [];
  if (!campaigns.length) { renderUtmTableFallback({}); return; }
  tbody.innerHTML = campaigns.map(c => \`
    <tr class="border-b border-gray-100 hover:bg-gray-50">
      <td class="px-4 py-3 font-medium text-gray-800">\${c.campaign || '(non tracciato)'}</td>
      <td class="px-4 py-3"><span class="utm-badge bg-blue-100 text-blue-700">\${c.medium || '—'}</span></td>
      <td class="px-4 py-3 text-center font-bold text-blue-600">\${c.count}</td>
      <td class="px-4 py-3 text-center text-xs text-gray-500">\${c.top_plan || '—'}</td>
      <td class="px-4 py-3 text-right font-bold text-green-600">€\${c.count * 480}</td>
    </tr>
  \`).join('');
}

// ═══════════════════════════════════════════════════════════
//  UTM BUILDER
// ═══════════════════════════════════════════════════════════
function buildUtmUrl() {
  const base     = document.getElementById('utmBase').value.replace(/\\?.*$/, '');
  const source   = document.getElementById('utmSource').value;
  const medium   = document.getElementById('utmMedium').value;
  const campaign = document.getElementById('utmCampaign').value.trim();
  const content  = document.getElementById('utmContent').value.trim();
  const term     = document.getElementById('utmTerm').value.trim();

  let params = \`utm_source=\${encodeURIComponent(source)}&utm_medium=\${encodeURIComponent(medium)}\`;
  if (campaign) params += \`&utm_campaign=\${encodeURIComponent(campaign)}\`;
  if (content)  params += \`&utm_content=\${encodeURIComponent(content)}\`;
  if (term)     params += \`&utm_term=\${encodeURIComponent(term)}\`;

  document.getElementById('utmOutput').textContent = base + '?' + params;
}

function copyUtmUrl() {
  navigator.clipboard.writeText(document.getElementById('utmOutput').textContent);
  showToast('URL UTM copiato!');
}

// ═══════════════════════════════════════════════════════════
//  CONVERSION TRACKING
// ═══════════════════════════════════════════════════════════
function generateTrackingCode() {
  const id    = document.getElementById('gadsConvId').value.trim();
  const label = document.getElementById('gadsConvLabel').value.trim();
  const valEl = document.getElementById('gadsConvValue').value;

  if (!id || !label) {
    document.getElementById('trackingCodeOutput').textContent = '<!-- Inserisci Conversion ID e Label per generare il codice -->';
    document.getElementById('gtagSnippet').textContent        = '<!-- Inserisci Conversion ID per generare il Global Site Tag -->';
    return;
  }

  const valCode = valEl === 'dynamic'
    ? "value: selectedPlanPrice || 480,"
    : \`value: \${valEl},\`;

  const convCode = \`<!-- Google Ads Conversion Tracking — eCura Landing -->
<script>
// Attiva la conversione quando il form viene inviato con successo
(function() {
  function fireConversion(planPrice) {
    if (typeof gtag === 'undefined') return;
    gtag('event', 'conversion', {
      'send_to': '\${id}/\${label}',
      \${valCode}
      'currency': 'EUR',
      'transaction_id': Date.now().toString()
    });
  }

  // Osserva i messaggi di successo del form
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(n) {
        if (n.id === 'hero-form-success' || n.id === 'main-form-success') {
          const planEl = n.closest('form')?.querySelector('[name="plan"]');
          const planMap = {
            FAMILY_BASE: 390, FAMILY_AVANZATO: 690,
            PRO_BASE: 480,    PRO_AVANZATO: 840,
            PREMIUM_BASE: 590, PREMIUM_AVANZATO: 990
          };
          const price = planMap[planEl?.value] || 480;
          fireConversion(price);
        }
      });
    });
  });

  // Monitora i form success
  ['hero-form-success', 'main-form-success'].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      const orig = el.style.display;
      Object.defineProperty(el.style, 'display', {
        set: function(val) {
          if (val === 'block' && orig !== 'block') {
            const form   = el.closest('form');
            const planEl = form?.querySelector('[name="plan"]');
            const planMap = { FAMILY_BASE:390, FAMILY_AVANZATO:690, PRO_BASE:480, PRO_AVANZATO:840, PREMIUM_BASE:590, PREMIUM_AVANZATO:990 };
            fireConversion(planMap[planEl?.value] || 480);
          }
          this._display = val;
        },
        get: function() { return this._display || ''; }
      });
    }
  });
})();
<\\/script>\`;

  const gtagCode = \`<!-- Google tag (gtag.js) — metti in <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=\${id}"><\\/script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '\${id}', {
    'linker': { 'domains': ['ecura-landing.pages.dev'] }
  });
<\\/script>\`;

  document.getElementById('trackingCodeOutput').textContent = convCode;
  document.getElementById('gtagSnippet').textContent        = gtagCode;
}

function copyTrackingCode() {
  navigator.clipboard.writeText(document.getElementById('trackingCodeOutput').textContent);
  showToast('Codice conversion copiato!');
}
function copyGtag() {
  navigator.clipboard.writeText(document.getElementById('gtagSnippet').textContent);
  showToast('Global Site Tag copiato!');
}

// ═══════════════════════════════════════════════════════════
//  CSV EXPORT
// ═══════════════════════════════════════════════════════════
function generateCsv(mode) {
  const campName  = document.getElementById('csvCampaignName').value;
  const budget    = document.getElementById('csvBudget').value;
  const finalUrl  = document.getElementById('csvFinalUrl').value;
  const allTypes  = ['intent', 'competitor', 'problem'];
  let csv = '';

  if (mode === 'full' || mode === 'keywords') {
    csv += 'Campaign,Ad Group,Keyword,Match Type,Bid,Status\\n';
    allTypes.forEach(type => {
      const groupName = { intent: 'Intento Diretto', competitor: 'Competitor', problem: 'Problema Bisogno' }[type];
      KW_DATA[type].forEach(k => {
        const matchLabel = { exact: 'Exact', phrase: 'Phrase', broad: 'Broad' }[k.match];
        csv += \`"\${campName}","\${groupName}","\${k.kw}","\${matchLabel}","",Enabled\\n\`;
      });
    });
    // Negative keywords
    csv += '\\n# Negative Keywords\\nCampaign,Ad Group,Keyword,Match Type\\n';
    KW_DATA.negative.forEach(k => {
      csv += \`"\${campName}","","- \${k}","Exact"\\n\`;
    });
    csv += '\\n';
  }

  if (mode === 'full' || mode === 'ads') {
    csv += 'Campaign,Ad Group,Headline 1,Headline 2,Headline 3,Headline 4,Headline 5,Description 1,Description 2,Final URL,Ad Type\\n';
    allTypes.forEach(type => {
      const ads = ADS_DATA[type];
      const groupName = { intent: 'Intento Diretto', competitor: 'Competitor', problem: 'Problema Bisogno' }[type];
      const h = ads.headlines;
      const d = ads.descriptions;
      csv += \`"\${campName}","\${groupName}","\${h[0]}","\${h[1]}","\${h[2]}","\${h[3]}","\${h[4]}","\${d[0]}","\${d[1]}","\${finalUrl}","Responsive Search Ad"\\n\`;
    });
  }

  if (mode === 'full') {
    csv += '\\n# Campaign Settings\\nCampaign,Daily Budget,Bidding Strategy,Network,Status\\n';
    csv += \`"\${campName}","\${budget}","Maximize Clicks","Search","Enabled"\\n\`;
  }

  document.getElementById('csvOutput').value = csv;
  showToast('CSV generato!');
}

function downloadCsv() {
  const csv  = document.getElementById('csvOutput').value;
  if (!csv.trim()) { showToast('Genera prima il CSV'); return; }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'ecura_google_ads_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  showToast('CSV scaricato!');
}

// ═══════════════════════════════════════════════════════════
//  UTILS
// ═══════════════════════════════════════════════════════════
function getToken() {
  return document.cookie.split(';').find(c => c.trim().startsWith('auth_token='))?.split('=')[1] || '';
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function copyText(text, btn) {
  navigator.clipboard.writeText(text);
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check text-green-500"></i>';
    setTimeout(() => btn.innerHTML = orig, 1200);
  }
  showToast('Copiato!');
}

function copySection(hiddenId) {
  const val = document.getElementById(hiddenId)?.value || '';
  navigator.clipboard.writeText(val);
  showToast('Sezione copiata!');
}

function copyAllAds() {
  const hl = document.getElementById('headlinesCopy')?.value || '';
  const dl = document.getElementById('descriptionsCopy')?.value || '';
  navigator.clipboard.writeText('=== HEADLINES ===\\n' + hl + '\\n=== DESCRIPTIONS ===\\n' + dl);
  showToast('Tutti gli annunci copiati!');
}

let toastTimer;
function showToast(msg) {
  const t  = document.getElementById('toast');
  const tm = document.getElementById('toastMsg');
  tm.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}

// ═══════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderKeywords();
  updateROI();
  buildUtmUrl();
  // Auto-genera annunci al caricamento con tipo default
  generateAds();
});
</script>
</body>
</html>`;
}
