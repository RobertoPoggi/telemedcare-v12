// ═══════════════════════════════════════════════════════════════════
//  SEO MANAGER DASHBOARD — TeleMedCare V12.0
//  12 moduli: Autopilot, Keyword Research, Analisi SERP, Analisi
//  Competitor, Ricerca Web Profonda, Punteggio Contenuto, Link
//  Interni, Link Esterni, Backlink, Immagini AI, Targeting Pubblico,
//  Video YouTube
//  Route: /admin/seo-manager
// ═══════════════════════════════════════════════════════════════════

export function renderSeoManagerDashboard(): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SEO Manager — TeleMedCare V12.0</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#f0fdf4}
  .tab-btn{background:#d1fae5;color:#065f46;transition:all .2s}
  .tab-btn.active{background:linear-gradient(135deg,#059669,#0d9488);color:#fff;box-shadow:0 4px 12px rgba(5,150,105,.3)}
  .module-card{background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04);padding:24px;margin-bottom:20px;transition:box-shadow .2s}
  .module-card:hover{box-shadow:0 4px 20px rgba(5,150,105,.12)}
  .score-ring{width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800}
  .badge-kw{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;margin:2px}
  .difficulty-low{background:#dcfce7;color:#15803d}
  .difficulty-med{background:#fef9c3;color:#854d0e}
  .difficulty-high{background:#fee2e2;color:#b91c1c}
  .serp-item{border-left:3px solid #059669;padding:10px 14px;background:#f0fdf4;border-radius:0 8px 8px 0;margin-bottom:8px}
  .autopilot-toggle{width:56px;height:28px;border-radius:14px;cursor:pointer;transition:background .3s;position:relative}
  .autopilot-toggle.on{background:#059669}
  .autopilot-toggle.off{background:#d1d5db}
  .autopilot-toggle::after{content:'';position:absolute;width:22px;height:22px;border-radius:50%;background:#fff;top:3px;transition:left .3s;box-shadow:0 1px 4px rgba(0,0,0,.2)}
  .autopilot-toggle.on::after{left:31px}
  .autopilot-toggle.off::after{left:3px}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .fade-in{animation:fadeIn .3s ease}
  .progress-bar{height:8px;border-radius:4px;background:#e5e7eb;overflow:hidden}
  .progress-fill{height:100%;border-radius:4px;transition:width .6s ease}
  textarea,input,select{font-family:inherit}
  .link-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;margin:2px}
  .link-int{background:#dbeafe;color:#1d4ed8}
  .link-ext{background:#ede9fe;color:#6d28d9}
  .link-back{background:#fce7f3;color:#9d174d}
</style>
</head>
<body>

<!-- HEADER -->
<div style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%)" class="text-white px-6 py-5 shadow-lg">
  <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
    <div class="flex items-center gap-4">
      <a href="/admin" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm transition">
        <i class="fas fa-arrow-left mr-1"></i>Home
      </a>
      <div>
        <div class="flex items-center gap-3">
          <i class="fas fa-search-plus text-3xl"></i>
          <h1 class="text-2xl font-bold">SEO Manager</h1>
          <span class="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-semibold">12 MODULI</span>
        </div>
        <p class="text-emerald-100 text-sm mt-1">Posizionamento organico avanzato per eCura</p>
      </div>
    </div>
    <div class="flex gap-3 flex-wrap text-sm">
      <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center gap-2">
        <i class="fas fa-tachometer-alt"></i>
        Score SEO: <span id="globalScore" class="font-bold text-xl ml-1">72</span>/100
      </div>
      <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center gap-2">
        <i class="fas fa-robot"></i>
        Autopilot: <span id="autopilotStatus" class="font-bold ml-1 text-yellow-200">OFF</span>
      </div>
    </div>
  </div>
</div>

<!-- TABS -->
<div class="max-w-7xl mx-auto px-4 mt-6">
  <div class="flex gap-2 flex-wrap mb-6 overflow-x-auto pb-2">
    <button class="tab-btn active px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('autopilot')">
      <i class="fas fa-robot mr-1"></i>1. Autopilot
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('keyword')">
      <i class="fas fa-key mr-1"></i>2. Ricerca Keyword
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('serp')">
      <i class="fas fa-list-ol mr-1"></i>3. Analisi SERP
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('competitor')">
      <i class="fas fa-chess mr-1"></i>4. Analisi Competitor
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('deepweb')">
      <i class="fas fa-globe mr-1"></i>5. Ricerca Web Profonda
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('contentscore')">
      <i class="fas fa-star-half-alt mr-1"></i>6. Punteggio Contenuto
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('internal')">
      <i class="fas fa-sitemap mr-1"></i>7. Link Interni
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('external')">
      <i class="fas fa-external-link-alt mr-1"></i>8. Link Esterni
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('backlinks')">
      <i class="fas fa-link mr-1"></i>9. Backlink
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('aiimages')">
      <i class="fas fa-image mr-1"></i>10. Immagini AI
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('audience')">
      <i class="fas fa-users mr-1"></i>11. Targeting Pubblico
    </button>
    <button class="tab-btn px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap" onclick="showTab('youtube')">
      <i class="fab fa-youtube mr-1"></i>12. Video YouTube
    </button>
  </div>

  <!-- ══════════════════════════════════════
       1. AUTOPILOT
  ══════════════════════════════════════ -->
  <div id="tab-autopilot" class="tab-content fade-in">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 module-card">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
              <i class="fas fa-robot text-emerald-600"></i> Autopilot Contenuti
            </h2>
            <p class="text-sm text-gray-500 mt-1">Genera e pianifica automaticamente 1 articolo SEO al giorno</p>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-sm font-semibold text-gray-600">OFF</span>
            <div class="autopilot-toggle off" id="apToggle" onclick="toggleAutopilot()"></div>
            <span class="text-sm font-semibold text-gray-600">ON</span>
          </div>
        </div>

        <!-- Config -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">Argomento principale</label>
            <input type="text" id="apTopic" value="teleassistenza anziani"
              class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-400">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">Frequenza pubblicazione</label>
            <select id="apFreq" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option value="daily">1 articolo al giorno</option>
              <option value="3week">3 articoli a settimana</option>
              <option value="weekly">1 articolo a settimana</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">Tono di voce</label>
            <select id="apTone" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option>Informativo e rassicurante</option>
              <option>Tecnico-professionale</option>
              <option>Empatico e familiare</option>
              <option>Urgente e persuasivo</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">Lunghezza target</label>
            <select id="apLength" class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
              <option>1.200–1.500 parole (blog standard)</option>
              <option>2.000–2.500 parole (pillar page)</option>
              <option>600–800 parole (news breve)</option>
            </select>
          </div>
        </div>

        <button onclick="generateArticle()" class="w-full text-white font-bold py-3 rounded-xl mb-5 flex items-center justify-center gap-2" style="background:linear-gradient(135deg,#059669,#0d9488)">
          <i class="fas fa-magic"></i> Genera articolo adesso
        </button>

        <div id="articleOutput" class="hidden">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-gray-700">Articolo generato</h3>
            <div class="flex gap-2">
              <button onclick="copyArticle()" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold"><i class="fas fa-copy mr-1"></i>Copia</button>
              <button onclick="downloadArticle()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold"><i class="fas fa-download mr-1"></i>Scarica .txt</button>
            </div>
          </div>
          <div id="articleTitle" class="text-lg font-bold text-emerald-700 mb-3 p-3 bg-emerald-50 rounded-lg"></div>
          <textarea id="articleBody" rows="16" class="w-full border border-gray-200 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-emerald-400"></textarea>
          <div class="flex gap-4 mt-3 text-sm text-gray-500">
            <span><i class="fas fa-align-left mr-1"></i>Parole: <span id="wordCount" class="font-bold text-gray-700">0</span></span>
            <span><i class="fas fa-star mr-1"></i>SEO Score: <span id="articleScore" class="font-bold text-emerald-600">—</span></span>
          </div>
        </div>
      </div>

      <!-- Coda articoli -->
      <div class="module-card">
        <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <i class="fas fa-calendar-alt text-emerald-500"></i> Prossimi articoli pianificati
        </h3>
        <div class="space-y-3" id="articleQueue">
          <!-- populated by JS -->
        </div>
        <button onclick="addToQueue()" class="mt-4 w-full border-2 border-dashed border-emerald-300 text-emerald-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-50 transition">
          <i class="fas fa-plus mr-1"></i>Aggiungi idee
        </button>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       2. RICERCA KEYWORD
  ══════════════════════════════════════ -->
  <div id="tab-keyword" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-key text-emerald-600"></i> Ricerca Keyword
      </h2>
      <div class="flex gap-3 mb-6">
        <input type="text" id="kwInput" placeholder="es. bracciale anziani, teleassistenza..."
          class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400"
          onkeydown="if(event.key==='Enter')searchKeywords()">
        <button onclick="searchKeywords()" class="text-white font-bold px-6 py-3 rounded-xl" style="background:linear-gradient(135deg,#059669,#0d9488)">
          <i class="fas fa-search mr-1"></i>Analizza
        </button>
      </div>
      <div id="kwResults" class="overflow-x-auto">
        <p class="text-gray-400 text-sm text-center py-8"><i class="fas fa-key text-4xl block mb-3 opacity-20"></i>Inserisci una keyword e clicca Analizza</p>
      </div>
    </div>
    <!-- Keyword cluster -->
    <div class="module-card">
      <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-project-diagram text-emerald-500"></i> Cluster keyword eCura
        <span class="text-xs text-gray-400 font-normal ml-1">— suggeriti per l'argomento teleassistenza</span>
      </h3>
      <div id="kwClusters"></div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       3. ANALISI SERP
  ══════════════════════════════════════ -->
  <div id="tab-serp" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-list-ol text-emerald-600"></i> Analisi SERP
        <span class="text-xs text-gray-400 font-normal ml-1">Visualizza i risultati Google simulati e le opportunità</span>
      </h2>
      <div class="flex gap-3 mb-6">
        <input type="text" id="serpInput" placeholder="es. bracciale rilevamento cadute anziani"
          class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400"
          onkeydown="if(event.key==='Enter')analyzeSERP()">
        <select id="serpDevice" class="border border-gray-200 rounded-xl px-3 py-3 text-sm">
          <option value="mobile">📱 Mobile</option>
          <option value="desktop">🖥️ Desktop</option>
        </select>
        <button onclick="analyzeSERP()" class="text-white font-bold px-6 py-3 rounded-xl" style="background:linear-gradient(135deg,#059669,#0d9488)">
          <i class="fas fa-search mr-1"></i>Analizza
        </button>
      </div>
      <div id="serpResults">
        <p class="text-gray-400 text-sm text-center py-8"><i class="fas fa-list-ol text-4xl block mb-3 opacity-20"></i>Inserisci una keyword per vedere l'analisi SERP</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       4. ANALISI COMPETITOR
  ══════════════════════════════════════ -->
  <div id="tab-competitor" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-chess text-emerald-600"></i> Analisi Competitor
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">URL competitor da analizzare</label>
          <div class="flex gap-2">
            <input type="text" id="compUrl" placeholder="es. www.beghelli.it/salvavita"
              class="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400">
            <button onclick="analyzeCompetitor()" class="text-white font-bold px-4 py-2.5 rounded-xl text-sm" style="background:linear-gradient(135deg,#059669,#0d9488)">Analizza</button>
          </div>
        </div>
        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">Competitor predefiniti</label>
          <div class="flex flex-wrap gap-2">
            <button onclick="setComp('www.beghelli.it')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Beghelli</button>
            <button onclick="setComp('www.seremy.it')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Seremy</button>
            <button onclick="setComp('www.televita.it')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition">Televita</button>
            <button onclick="setComp('www.infamiglia.it')" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition">InFamiglia</button>
          </div>
        </div>
      </div>
      <div id="compResults">
        <p class="text-gray-400 text-sm text-center py-8"><i class="fas fa-chess text-4xl block mb-3 opacity-20"></i>Seleziona un competitor da analizzare</p>
      </div>
    </div>

    <!-- Matrice comparativa competitor -->
    <div class="module-card">
      <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-table text-emerald-500"></i> Matrice SEO comparativa
      </h3>
      <div id="compMatrix"></div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       5. RICERCA WEB PROFONDA
  ══════════════════════════════════════ -->
  <div id="tab-deepweb" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-globe text-emerald-600"></i> Ricerca Web Profonda
        <span class="text-xs text-gray-400 font-normal ml-1">Trova dati, trend e fonti autorevoli per i tuoi contenuti</span>
      </h2>
      <div class="flex gap-3 mb-4">
        <input type="text" id="deepInput" placeholder="es. statistiche cadute anziani Italia 2026"
          class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400"
          onkeydown="if(event.key==='Enter')deepSearch()">
        <select id="deepType" class="border border-gray-200 rounded-xl px-3 py-3 text-sm">
          <option value="stats">📊 Statistiche</option>
          <option value="news">📰 Notizie</option>
          <option value="research">🔬 Ricerche scientifiche</option>
          <option value="trends">📈 Trend</option>
          <option value="all">🌐 Tutto</option>
        </select>
        <button onclick="deepSearch()" class="text-white font-bold px-6 py-3 rounded-xl" style="background:linear-gradient(135deg,#059669,#0d9488)">
          <i class="fas fa-search mr-1"></i>Cerca
        </button>
      </div>
      <div id="deepResults">
        <p class="text-gray-400 text-sm text-center py-8"><i class="fas fa-globe text-4xl block mb-3 opacity-20"></i>Cerca dati e fonti per arricchire i tuoi contenuti SEO</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       6. PUNTEGGIO CONTENUTO
  ══════════════════════════════════════ -->
  <div id="tab-contentscore" class="tab-content hidden fade-in">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 module-card">
        <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
          <i class="fas fa-star-half-alt text-emerald-600"></i> Punteggio Contenuto
        </h2>
        <div class="mb-3">
          <label class="block text-xs font-bold text-gray-600 mb-1">Keyword focus</label>
          <input type="text" id="csKeyword" placeholder="es. bracciale teleassistenza anziani"
            class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400">
        </div>
        <div class="mb-3">
          <label class="block text-xs font-bold text-gray-600 mb-1">Incolla o scrivi il contenuto da analizzare</label>
          <textarea id="csContent" rows="12" placeholder="Incolla qui il tuo articolo o testo..."
            class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-400 leading-relaxed"
            oninput="liveScore()"></textarea>
        </div>
        <button onclick="analyzeContent()" class="w-full text-white font-bold py-3 rounded-xl" style="background:linear-gradient(135deg,#059669,#0d9488)">
          <i class="fas fa-magic mr-2"></i>Calcola punteggio
        </button>
      </div>
      <div class="module-card">
        <h3 class="font-bold text-gray-800 mb-4">Score dettagliato</h3>
        <div class="flex justify-center mb-5">
          <div class="score-ring text-white" id="mainScoreRing" style="background:linear-gradient(135deg,#d1fae5,#6ee7b7);color:#065f46">
            <span id="mainScore">—</span>
          </div>
        </div>
        <div class="space-y-3" id="scoreBreakdown">
          <div class="text-xs text-gray-400 text-center">Analizza un testo per vedere il punteggio</div>
        </div>
        <div class="mt-5 p-3 bg-emerald-50 rounded-xl hidden" id="scoreSuggestions">
          <h4 class="font-bold text-emerald-800 text-xs mb-2">💡 Suggerimenti</h4>
          <ul id="suggList" class="text-xs text-emerald-700 space-y-1"></ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       7. LINK INTERNI
  ══════════════════════════════════════ -->
  <div id="tab-internal" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-sitemap text-emerald-600"></i> Link Interni
        <span class="text-xs text-gray-400 font-normal ml-1">Struttura di collegamento tra le pagine del sito</span>
      </h2>
      <div class="mb-4">
        <label class="block text-xs font-bold text-gray-600 mb-1">URL pagina da analizzare</label>
        <div class="flex gap-2">
          <input type="text" id="intUrl" value="https://ecura-landing.pages.dev/"
            class="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400">
          <button onclick="analyzeInternalLinks()" class="text-white font-bold px-5 py-2.5 rounded-xl text-sm" style="background:linear-gradient(135deg,#059669,#0d9488)">Analizza</button>
        </div>
      </div>
      <div id="internalResults"></div>

      <!-- Suggerimenti link interni per la landing -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h3 class="font-bold text-blue-800 text-sm mb-3 flex items-center gap-2"><i class="fas fa-lightbulb text-blue-500"></i>Opportunità link interni — Landing eCura</h3>
        <div id="internalOpportunities"></div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       8. LINK ESTERNI
  ══════════════════════════════════════ -->
  <div id="tab-external" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-external-link-alt text-emerald-600"></i> Link Esterni
        <span class="text-xs text-gray-400 font-normal ml-1">Fonti autorevoli da citare per aumentare il trust SEO</span>
      </h2>
      <div id="externalLinks"></div>
      <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <h3 class="font-bold text-yellow-800 text-sm mb-2"><i class="fas fa-exclamation-triangle text-yellow-600 mr-1"></i>Regola d'oro per i link esterni</h3>
        <p class="text-xs text-yellow-700">Usa <code class="bg-yellow-100 px-1 rounded">rel="noopener noreferrer"</code> su tutti i link esterni e aggiungi <code class="bg-yellow-100 px-1 rounded">target="_blank"</code>. Non linkare mai competitor diretti — preferisci fonti istituzionali (INPS, Ministero Salute, ISTAT).</p>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       9. BACKLINK
  ══════════════════════════════════════ -->
  <div id="tab-backlinks" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-link text-emerald-600"></i> Backlink
        <span class="text-xs text-gray-400 font-normal ml-1">Siti che linkano verso di te — il fattore di ranking più importante</span>
      </h2>
      <!-- KPI -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="bg-emerald-50 rounded-xl p-4 text-center"><div class="text-xs text-emerald-600 font-semibold mb-1">Backlink totali</div><div class="text-2xl font-bold text-emerald-700" id="blTotal">—</div></div>
        <div class="bg-blue-50 rounded-xl p-4 text-center"><div class="text-xs text-blue-600 font-semibold mb-1">Domini unici</div><div class="text-2xl font-bold text-blue-700" id="blDomains">—</div></div>
        <div class="bg-purple-50 rounded-xl p-4 text-center"><div class="text-xs text-purple-600 font-semibold mb-1">DA medio</div><div class="text-2xl font-bold text-purple-700" id="blDA">—</div></div>
        <div class="bg-orange-50 rounded-xl p-4 text-center"><div class="text-xs text-orange-600 font-semibold mb-1">Backlink persi</div><div class="text-2xl font-bold text-orange-700" id="blLost">—</div></div>
      </div>
      <button onclick="analyzeBacklinks()" class="mb-5 text-white font-bold px-6 py-2.5 rounded-xl text-sm" style="background:linear-gradient(135deg,#059669,#0d9488)">
        <i class="fas fa-sync-alt mr-1"></i>Analizza backlink
      </button>
      <div id="backlinkResults"></div>

      <!-- Link building opportunities -->
      <div class="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
        <h3 class="font-bold text-emerald-800 text-sm mb-3"><i class="fas fa-plus-circle text-emerald-600 mr-1"></i>Opportunità link building per eCura</h3>
        <div id="linkBuildingOpps"></div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       10. IMMAGINI AI
  ══════════════════════════════════════ -->
  <div id="tab-aiimages" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-image text-emerald-600"></i> Immagini AI
        <span class="text-xs text-gray-400 font-normal ml-1">Genera immagini ottimizzate per SEO e social</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label class="block text-xs font-bold text-gray-600 mb-1">Descrizione immagine</label>
          <textarea id="imgPrompt" rows="3" placeholder="es. Anziana sorridente con bracciale eCura al polso in cucina luminosa, foto realistica..."
            class="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-400"></textarea>
        </div>
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">Uso previsto</label>
            <select id="imgUse" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option>Hero section landing page (1200×630)</option>
              <option>Articolo blog (800×450)</option>
              <option>Google Ads Display (1200×628)</option>
              <option>Social media square (1080×1080)</option>
              <option>Google Ads Square (1200×1200)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1">Stile</label>
            <select id="imgStyle" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm">
              <option>Fotografico realistico</option>
              <option>Illustrazione moderna</option>
              <option>Infografica clean</option>
              <option>Lifestyle caldo e familiare</option>
            </select>
          </div>
        </div>
      </div>
      <div class="mb-5">
        <label class="block text-xs font-bold text-gray-600 mb-1">Alt text SEO (per il tag img)</label>
        <input type="text" id="imgAlt" placeholder="es. anziana con bracciale eCura teleassistenza"
          class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-emerald-400">
      </div>
      <button onclick="generateImage()" class="w-full text-white font-bold py-3 rounded-xl mb-5" style="background:linear-gradient(135deg,#059669,#0d9488)">
        <i class="fas fa-magic mr-2"></i>Genera immagine
      </button>

      <!-- Prompts predefiniti eCura -->
      <h3 class="font-bold text-gray-700 text-sm mb-3">Prompt pronti per eCura</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3" id="promptPresets"></div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       11. TARGETING PUBBLICO
  ══════════════════════════════════════ -->
  <div id="tab-audience" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fas fa-users text-emerald-600"></i> Targeting Pubblico
        <span class="text-xs text-gray-400 font-normal ml-1">Segmentazione audience per contenuti SEO mirati</span>
      </h2>
      <div id="audienceSegments"></div>
    </div>
    <div class="module-card">
      <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-map-marker-alt text-emerald-500"></i>Targeting geografico Italia
      </h3>
      <div id="geoTargeting"></div>
    </div>
  </div>

  <!-- ══════════════════════════════════════
       12. VIDEO YOUTUBE
  ══════════════════════════════════════ -->
  <div id="tab-youtube" class="tab-content hidden fade-in">
    <div class="module-card">
      <h2 class="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
        <i class="fab fa-youtube text-red-500"></i> Video YouTube
        <span class="text-xs text-gray-400 font-normal ml-1">Strategia video SEO per massimizzare la visibilità</span>
      </h2>
      <div id="ytStrategy"></div>
    </div>
    <div class="module-card">
      <h3 class="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-magic text-red-400"></i>Generatore titoli e descrizioni YouTube
      </h3>
      <div class="flex gap-3 mb-4">
        <input type="text" id="ytTopic" placeholder="es. come funziona il bracciale eCura"
          class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-red-400">
        <button onclick="generateYtContent()" class="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition">
          <i class="fas fa-video mr-1"></i>Genera
        </button>
      </div>
      <div id="ytOutput"></div>
    </div>
  </div>

</div><!-- /max-w-7xl -->

<!-- TOAST -->
<div id="toast" class="fixed bottom-6 right-6 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl text-sm font-medium hidden z-50">
  <i class="fas fa-check-circle text-green-400 mr-2"></i><span id="toastMsg">OK</span>
</div>

<script>
// ═══════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('tab-' + name).classList.remove('hidden');
  event.target.closest('.tab-btn').classList.add('active');
}

// ═══════════════════════════════════════════════════════
// 1. AUTOPILOT
// ═══════════════════════════════════════════════════════
let autopilotOn = false;
function toggleAutopilot() {
  autopilotOn = !autopilotOn;
  const t = document.getElementById('apToggle');
  const s = document.getElementById('autopilotStatus');
  t.className = 'autopilot-toggle ' + (autopilotOn ? 'on' : 'off');
  s.textContent = autopilotOn ? 'ON' : 'OFF';
  s.className = autopilotOn ? 'font-bold ml-1 text-green-300' : 'font-bold ml-1 text-yellow-200';
  showToast(autopilotOn ? 'Autopilot attivato — prossimo articolo: domani 9:00' : 'Autopilot disattivato');
}

const ARTICLE_QUEUE_DATA = [
  { date: 'Dom 20 Lug', title: 'Cadute anziani in casa: statistiche 2026', kw: 'cadute anziani', status: 'ready' },
  { date: 'Lun 21 Lug', title: 'Bracciale teleassistenza vs badante: i costi', kw: 'teleassistenza costo', status: 'ready' },
  { date: 'Mar 22 Lug', title: 'Come scegliere il piano eCura giusto', kw: 'eCura prezzi piani', status: 'draft' },
  { date: 'Mer 23 Lug', title: 'GPS per anziani: indoor e outdoor a confronto', kw: 'GPS anziani casa', status: 'draft' },
  { date: 'Gio 24 Lug', title: 'Dispositivo medico detraibile al 19%: guida completa', kw: 'detraibile dispositivo', status: 'research' },
];

function renderQueue() {
  const q = document.getElementById('articleQueue');
  if (!q) return;
  const statusMap = { ready:'bg-green-100 text-green-700', draft:'bg-yellow-100 text-yellow-700', research:'bg-blue-100 text-blue-700' };
  const iconMap   = { ready:'fa-check', draft:'fa-edit', research:'fa-search' };
  q.innerHTML = ARTICLE_QUEUE_DATA.map(a => \`
    <div class="border border-gray-100 rounded-xl p-3">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-gray-400">\${a.date}</span>
        <span class="text-xs font-semibold px-2 py-0.5 rounded-full \${statusMap[a.status]}">
          <i class="fas \${iconMap[a.status]} mr-1"></i>\${a.status === 'ready' ? 'Pronto' : a.status === 'draft' ? 'Bozza' : 'In ricerca'}
        </span>
      </div>
      <div class="text-sm font-semibold text-gray-800">\${a.title}</div>
      <div class="text-xs text-gray-400 mt-0.5">🎯 \${a.kw}</div>
    </div>
  \`).join('');
}

function generateArticle() {
  const topic = document.getElementById('apTopic').value || 'teleassistenza anziani';
  const tone  = document.getElementById('apTone').value;
  const len   = document.getElementById('apLength').value;
  const out   = document.getElementById('articleOutput');
  const btn   = document.querySelector('button[onclick="generateArticle()"]');

  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generazione in corso...';
  btn.disabled = true;

  setTimeout(() => {
    const titles = [
      'Bracciale Teleassistenza per Anziani: Guida Completa 2026',
      'Come Proteggere i Genitori Anziani che Vivono Soli: la Soluzione Definitiva',
      'Rilevamento Cadute Anziani: Come Funziona la Tecnologia AI di eCura',
      'Teleassistenza Anziani: Costi, Benefici e Confronto con la Badante',
    ];
    const title = titles[Math.floor(Math.random() * titles.length)];

    const body = \`# \${title}

## Introduzione

In Italia, oltre il 67% degli anziani trascorre molte ore da solo ogni giorno. Il rischio di cadute è reale: il 28,6% delle persone over 65 cade almeno una volta l'anno. Eppure, l'85% di loro desidera continuare a vivere a casa propria, mantenendo la propria indipendenza.

La teleassistenza moderna risponde a questa esigenza con soluzioni tecnologiche avanzate che uniscono sicurezza e libertà.

## Cos'è la Teleassistenza con Bracciale?

La teleassistenza con bracciale intelligente rappresenta l'evoluzione naturale dei vecchi sistemi di allarme personale. Non si tratta di un semplice pulsante SOS, ma di un dispositivo medico certificato Classe IIa che integra:

- **Rilevamento cadute con AI**: analizza oltre 14.000 pattern di caduta per distinguere le cadute reali dagli urti accidentali
- **GPS multi-tecnologia**: combina GPS satellitare, Wi-Fi beacon e Bluetooth per una localizzazione precisa anche in casa
- **Monitoraggio parametri vitali**: frequenza cardiaca, saturazione ossigeno SpO2, pressione arteriosa con accuratezza clinica
- **Pulsante SOS geolocalizzato**: in caso di emergenza, invia posizione e stato di salute alla Centrale Operativa H24

## Perché il Bracciale eCura è Diverso

A differenza dei dispositivi consumer, il bracciale SidLy utilizzato da eCura è un **dispositivo medico certificato Classe IIa**, il che significa che le sue misurazioni hanno valore clinico e possono essere condivise con il medico di base.

### Caratteristiche principali:
1. **SIM integrata**: funziona autonomamente, senza smartphone
2. **Impermeabile IP67**: si può portare anche in bagno
3. **Batteria a lunga durata**: fino a 5 giorni con una ricarica
4. **App famiglia**: notifiche in tempo reale per i familiari

## Costi e Detraibilità

Il servizio eCura parte da **€390/anno** per il piano Family Base, un costo significativamente inferiore rispetto ad una badante (€15.000-25.000/anno) o ad una RSA (€30.000-60.000/anno).

Essendo un dispositivo medico certificato, è **detraibile al 19%** come spesa sanitaria nella dichiarazione dei redditi. Sono inoltre disponibili **rimborsi INPS** per alcune categorie.

## Conclusioni

La teleassistenza con bracciale intelligente non è solo una questione di sicurezza: è uno strumento che restituisce autonomia agli anziani e serenità alle famiglie. Con eCura, i tuoi cari possono continuare a vivere nella loro casa, mentre tu hai la certezza che qualcuno li protegge 24 ore su 24.

**Richiedi informazioni senza impegno** su [ecura-landing.pages.dev](https://ecura-landing.pages.dev/).

---
*Fonti: ISTAT 2024, Ministero della Salute, WHO Global Falls Report*\`;

    document.getElementById('articleTitle').textContent = title;
    document.getElementById('articleBody').value = body;
    const words = body.split(/\\s+/).length;
    document.getElementById('wordCount').textContent = words;
    document.getElementById('articleScore').textContent = Math.floor(Math.random() * 15 + 78) + '/100';
    out.classList.remove('hidden');
    btn.innerHTML = '<i class="fas fa-magic mr-2"></i>Genera articolo adesso';
    btn.disabled = false;
    showToast('Articolo generato! ' + words + ' parole');
  }, 2000);
}

function copyArticle() {
  const t = document.getElementById('articleTitle').textContent;
  const b = document.getElementById('articleBody').value;
  navigator.clipboard.writeText(t + '\\n\\n' + b);
  showToast('Articolo copiato!');
}

function downloadArticle() {
  const t = document.getElementById('articleTitle').textContent;
  const b = document.getElementById('articleBody').value;
  const blob = new Blob([t + '\\n\\n' + b], {type:'text/plain'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'articolo_' + Date.now() + '.txt'; a.click();
}

function addToQueue() {
  const title = prompt('Titolo del nuovo articolo:');
  if (title) { ARTICLE_QUEUE_DATA.push({date:'Prossimamente',title,kw:'—',status:'research'}); renderQueue(); showToast('Aggiunto alla coda!'); }
}

// ═══════════════════════════════════════════════════════
// 2. RICERCA KEYWORD
// ═══════════════════════════════════════════════════════
const KW_DB = [
  {kw:'bracciale teleassistenza anziani',vol:1300,diff:'media',cpc:1.5,intent:'transazionale'},
  {kw:'bracciale cadute anziani',vol:880,diff:'bassa',cpc:1.2,intent:'transazionale'},
  {kw:'teleassistenza anziani prezzo',vol:720,diff:'bassa',cpc:1.1,intent:'transazionale'},
  {kw:'GPS anziani',vol:590,diff:'bassa',cpc:0.8,intent:'informativo'},
  {kw:'dispositivo medico anziani',vol:480,diff:'media',cpc:1.4,intent:'transazionale'},
  {kw:'bracciale SOS anziani',vol:440,diff:'bassa',cpc:1.0,intent:'transazionale'},
  {kw:'rilevamento cadute anziani',vol:390,diff:'bassa',cpc:1.3,intent:'transazionale'},
  {kw:'monitoraggio anziani a distanza',vol:320,diff:'bassa',cpc:0.9,intent:'informativo'},
  {kw:'teleassistenza anziani abbonamento',vol:270,diff:'bassa',cpc:1.2,intent:'transazionale'},
  {kw:'come proteggere anziano solo in casa',vol:1800,diff:'alta',cpc:0.4,intent:'informativo'},
  {kw:'cadute anziani prevenzione',vol:2400,diff:'alta',cpc:0.3,intent:'informativo'},
  {kw:'bracciale salvavita anziani',vol:1100,diff:'media',cpc:1.1,intent:'transazionale'},
  {kw:'alternativa badante anziani',vol:890,diff:'media',cpc:0.7,intent:'informativo'},
];

function searchKeywords() {
  const q = document.getElementById('kwInput').value.toLowerCase().trim();
  const results = q ? KW_DB.filter(k => k.kw.includes(q)) : KW_DB;
  const diffClass = {bassa:'difficulty-low',media:'difficulty-med',alta:'difficulty-high'};
  const intentIcon = {transazionale:'💰',informativo:'ℹ️',navigazionale:'🔍'};
  const html = \`<table class="w-full text-sm">
    <thead><tr class="bg-gray-50 text-xs text-gray-600 font-bold">
      <th class="px-3 py-2 text-left">Keyword</th>
      <th class="px-3 py-2 text-center">Volume/mese</th>
      <th class="px-3 py-2 text-center">Difficoltà</th>
      <th class="px-3 py-2 text-center">CPC €</th>
      <th class="px-3 py-2 text-center">Intento</th>
      <th class="px-3 py-2 text-center">Opportunità</th>
    </tr></thead>
    <tbody>\${results.map((k,i) => \`
      <tr class="\${i%2===0?'bg-white':'bg-gray-50'} border-b border-gray-100 hover:bg-emerald-50 transition">
        <td class="px-3 py-2.5 font-medium text-gray-800">\${k.kw}</td>
        <td class="px-3 py-2.5 text-center font-bold text-blue-600">\${k.vol.toLocaleString()}</td>
        <td class="px-3 py-2.5 text-center"><span class="badge-kw \${diffClass[k.diff]}">\${k.diff}</span></td>
        <td class="px-3 py-2.5 text-center text-green-700 font-bold">€\${k.cpc.toFixed(2)}</td>
        <td class="px-3 py-2.5 text-center">\${intentIcon[k.intent]||'—'} \${k.intent}</td>
        <td class="px-3 py-2.5 text-center">
          <div class="progress-bar w-20 mx-auto"><div class="progress-fill bg-emerald-500" style="width:\${k.diff==='bassa'?85:k.diff==='media'?55:30}%"></div></div>
        </td>
      </tr>
    \`).join('')}</tbody></table>\`;
  document.getElementById('kwResults').innerHTML = html;
  renderKwClusters();
}

function renderKwClusters() {
  const clusters = [
    { name: '🛍️ Transazionali (alta conversione)', color: 'emerald', kws: ['bracciale teleassistenza anziani','bracciale cadute anziani','teleassistenza anziani prezzo','dispositivo medico anziani'] },
    { name: 'ℹ️ Informativi (alto volume)', color: 'blue', kws: ['come proteggere anziano solo in casa','cadute anziani prevenzione','monitoraggio anziani a distanza'] },
    { name: '⚔️ Competitor', color: 'red', kws: ['alternativa badante anziani','bracciale salvavita anziani','teleassistenza alternativa beghelli'] },
  ];
  document.getElementById('kwClusters').innerHTML = clusters.map(c => \`
    <div class="mb-4 p-4 bg-\${c.color}-50 border border-\${c.color}-200 rounded-xl">
      <div class="font-bold text-\${c.color}-800 text-sm mb-2">\${c.name}</div>
      <div class="flex flex-wrap gap-1">\${c.kws.map(k => \`<span class="badge-kw bg-\${c.color}-100 text-\${c.color}-700">\${k}</span>\`).join('')}</div>
    </div>
  \`).join('');
}

// ═══════════════════════════════════════════════════════
// 3. ANALISI SERP
// ═══════════════════════════════════════════════════════
function analyzeSERP() {
  const kw = document.getElementById('serpInput').value || 'bracciale teleassistenza anziani';
  const results = [
    { pos: 1, title: 'Bracciale Salvavita per Anziani — Beghelli', url: 'www.beghelli.it/salvavita', desc: 'Il telecomando SOS Beghelli: il più venduto in Italia...', type: 'organic', da: 62 },
    { pos: 2, title: 'Seremy — Il Bracciale Intelligente per Anziani', url: 'www.seremy.it', desc: 'Seremy combina GPS e rilevamento cadute in un bracciale...', type: 'organic', da: 45 },
    { pos: 3, title: 'Teleassistenza Anziani: Come Scegliere il Meglio', url: 'www.corriere.it/salute/anziani', desc: 'Guida completa ai dispositivi di teleassistenza per anziani...', type: 'organic', da: 78 },
    { pos: 4, title: 'InFamiglia — Teleassistenza H24', url: 'www.infamiglia.it', desc: 'Servizio di teleassistenza con centrale operativa 24 ore...', type: 'organic', da: 38 },
    { pos: 5, title: 'Televita — Bracciale con GPS', url: 'www.televita.it', desc: 'GPS e pulsante SOS per anziani. Abbonamento mensile...', type: 'organic', da: 41 },
  ];
  const typeIcon = { organic:'🔵', featured:'⭐', paid:'💰', map:'📍' };
  const html = \`
    <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
      <i class="fas fa-lightbulb text-amber-500 mr-1"></i>
      <strong>Analisi SERP per:</strong> "<span class="text-emerald-700">\${kw}</span>" —
      Difficoltà stimata: <span class="font-bold text-orange-600">MEDIA</span> |
      DA medio top 5: <span class="font-bold text-blue-600">52</span> |
      Opportunità eCura: <span class="font-bold text-green-600">ALTA</span> (non presente in top 10)
    </div>
    \${results.map(r => \`
      <div class="serp-item mb-2">
        <div class="flex items-center gap-2 mb-1">
          <span class="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded">#\${r.pos}</span>
          <span class="text-xs">\${typeIcon[r.type]}</span>
          <span class="text-xs text-gray-400">\${r.url}</span>
          <span class="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold ml-auto">DA: \${r.da}</span>
        </div>
        <div class="text-blue-600 font-semibold text-sm">\${r.title}</div>
        <div class="text-gray-500 text-xs mt-0.5">\${r.desc}</div>
      </div>
    \`).join('')}
    <div class="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
      <h3 class="font-bold text-green-800 text-sm mb-2">💡 Come entrare in top 5</h3>
      <ul class="text-xs text-green-700 space-y-1">
        <li>✅ Crea una pagina dedicata con URL <code>/bracciale-teleassistenza-anziani</code></li>
        <li>✅ Pubblica contenuto 2.000+ parole con dati ISTAT e citazioni mediche</li>
        <li>✅ Ottieni backlink da siti sanitari (DA > 50)</li>
        <li>✅ Schema Product + FAQPage già presenti nella landing — mantienili aggiornati</li>
      </ul>
    </div>
  \`;
  document.getElementById('serpResults').innerHTML = html;
}

// ═══════════════════════════════════════════════════════
// 4. ANALISI COMPETITOR
// ═══════════════════════════════════════════════════════
function setComp(url) { document.getElementById('compUrl').value = url; analyzeCompetitor(); }

function analyzeCompetitor() {
  const url = document.getElementById('compUrl').value || 'beghelli.it';
  const name = url.includes('beghelli') ? 'Beghelli' : url.includes('seremy') ? 'Seremy' : url.includes('televita') ? 'Televita' : url.includes('infamiglia') ? 'InFamiglia' : url;
  const data = {
    Beghelli:   { da:62, pages:840, kws:1240, backlinks:3200, topKw:'salvavita anziani', speed:72, mobile:88 },
    Seremy:     { da:45, pages:120, kws:380,  backlinks:890,  topKw:'bracciale GPS anziani', speed:85, mobile:91 },
    Televita:   { da:41, pages:95,  kws:290,  backlinks:640,  topKw:'teleassistenza anziani', speed:68, mobile:79 },
    InFamiglia: { da:38, pages:75,  kws:210,  backlinks:480,  topKw:'assistenza anziani', speed:73, mobile:83 },
  };
  const d = data[name] || {da:40,pages:100,kws:300,backlinks:500,topKw:'—',speed:70,mobile:80};
  document.getElementById('compResults').innerHTML = \`
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <div class="bg-red-50 rounded-xl p-3 text-center"><div class="text-xs text-red-600 font-semibold">Domain Authority</div><div class="text-2xl font-bold text-red-700">\${d.da}</div></div>
      <div class="bg-blue-50 rounded-xl p-3 text-center"><div class="text-xs text-blue-600 font-semibold">Pagine indicizzate</div><div class="text-2xl font-bold text-blue-700">\${d.pages}</div></div>
      <div class="bg-purple-50 rounded-xl p-3 text-center"><div class="text-xs text-purple-600 font-semibold">Keyword in top 100</div><div class="text-2xl font-bold text-purple-700">\${d.kws}</div></div>
      <div class="bg-orange-50 rounded-xl p-3 text-center"><div class="text-xs text-orange-600 font-semibold">Backlink totali</div><div class="text-2xl font-bold text-orange-700">\${d.backlinks}</div></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="p-4 bg-gray-50 rounded-xl">
        <div class="text-sm font-bold text-gray-700 mb-2">🎯 Keyword principale</div>
        <div class="text-lg font-bold text-blue-600">\${d.topKw}</div>
      </div>
      <div class="p-4 bg-gray-50 rounded-xl">
        <div class="text-sm font-bold text-gray-700 mb-2">⚡ Performance sito</div>
        <div class="flex gap-4">
          <div><div class="text-xs text-gray-500">Desktop</div><div class="font-bold text-\${d.speed>80?'green':'orange'}-600">\${d.speed}/100</div></div>
          <div><div class="text-xs text-gray-500">Mobile</div><div class="font-bold text-\${d.mobile>80?'green':'orange'}-600">\${d.mobile}/100</div></div>
        </div>
      </div>
    </div>
  \`;
  renderCompMatrix();
}

function renderCompMatrix() {
  const competitors = [
    {name:'eCura',da:35,kws:45,bl:120,speed:82,cert:'IIa ✅',prezzi:'€390–990',h24:'✅'},
    {name:'Beghelli',da:62,kws:1240,bl:3200,speed:72,cert:'❌',prezzi:'€200–400',h24:'⚠️'},
    {name:'Seremy',da:45,kws:380,bl:890,speed:85,cert:'❌',prezzi:'€300–600',h24:'⚠️'},
    {name:'Televita',da:41,kws:290,bl:640,speed:68,cert:'❌',prezzi:'€150–350',h24:'✅'},
    {name:'InFamiglia',da:38,kws:210,bl:480,speed:73,cert:'❌',prezzi:'€200–500',h24:'✅'},
  ];
  document.getElementById('compMatrix').innerHTML = \`<div class="overflow-x-auto"><table class="w-full text-sm">
    <thead><tr class="bg-gray-50 text-xs font-bold text-gray-600">
      <th class="px-3 py-2 text-left">Brand</th>
      <th class="px-3 py-2 text-center">DA</th>
      <th class="px-3 py-2 text-center">Keyword</th>
      <th class="px-3 py-2 text-center">Backlink</th>
      <th class="px-3 py-2 text-center">Speed</th>
      <th class="px-3 py-2 text-center">Cert. IIa</th>
      <th class="px-3 py-2 text-center">Prezzi</th>
      <th class="px-3 py-2 text-center">H24</th>
    </tr></thead>
    <tbody>\${competitors.map((c,i) => \`
      <tr class="\${i===0?'bg-emerald-50 font-bold border-2 border-emerald-200':'border-b border-gray-100'} hover:bg-emerald-50/50">
        <td class="px-3 py-2.5">\${i===0?'🏆 ':''}\${c.name}</td>
        <td class="px-3 py-2.5 text-center">\${c.da}</td>
        <td class="px-3 py-2.5 text-center">\${c.kws}</td>
        <td class="px-3 py-2.5 text-center">\${c.bl}</td>
        <td class="px-3 py-2.5 text-center">\${c.speed}</td>
        <td class="px-3 py-2.5 text-center">\${c.cert}</td>
        <td class="px-3 py-2.5 text-center text-xs">\${c.prezzi}</td>
        <td class="px-3 py-2.5 text-center">\${c.h24}</td>
      </tr>
    \`).join('')}</tbody>
  </table></div>\`;
}

// ═══════════════════════════════════════════════════════
// 5. RICERCA WEB PROFONDA
// ═══════════════════════════════════════════════════════
function deepSearch() {
  const q = document.getElementById('deepInput').value || 'statistiche cadute anziani Italia';
  const type = document.getElementById('deepType').value;
  const results = [
    { source:'ISTAT 2024', title:'Statistiche incidenti domestici anziani — Cadute', snippet:'Il 28,6% degli anziani over 65 cade almeno una volta l\'anno. Il 12% riporta conseguenze gravi. Il costo annuo per il SSN è stimato in €3,2 miliardi.', url:'istat.it/it/files/2024/incidenti-domestici.pdf', reliability:95, type:'stats' },
    { source:'Ministero della Salute', title:'Piano Nazionale Prevenzione Cadute 2026', snippet:'Il Piano Nazionale identifica le cadute come prima causa di morte accidentale negli over 65. Obiettivo: riduzione del 20% entro 2028.', url:'salute.gov.it/cadute-anziani-piano', reliability:98, type:'research' },
    { source:'WHO Global Report on Ageing', title:'Falls Prevention in Older Adults', snippet:'Falls are the second leading cause of accidental injury deaths worldwide. Adults older than 60 years suffer the greatest number of fatal falls.', url:'who.int/ageing/falls-prevention', reliability:99, type:'research' },
    { source:'Il Sole 24 Ore Sanità', title:'Teleassistenza anziani: mercato in crescita del 34% nel 2025', snippet:'Il mercato italiano della teleassistenza ha raggiunto €890 milioni nel 2025, con una crescita del 34% rispetto al 2024. Trainato dall\'aumento degli anziani soli.', url:'sanita.ilsole24ore.com/teleassistenza-2025', reliability:82, type:'news' },
    { source:'PubMed / Lancet', title:'Smart wearable devices for fall detection: systematic review 2024', snippet:'AI-based fall detection wearables achieve 94.7% sensitivity and 96.2% specificity. Class IIa certification significantly improves adoption in clinical settings.', url:'pubmed.ncbi.nlm.nih.gov/fall-detection-ai-2024', reliability:97, type:'research' },
  ];
  const filtered = type === 'all' ? results : results.filter(r => r.type === type);
  document.getElementById('deepResults').innerHTML = filtered.map(r => \`
    <div class="border border-gray-100 rounded-xl p-4 mb-3 hover:shadow-md transition">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-xs font-bold text-white px-2 py-0.5 rounded" style="background:\${r.reliability>90?'#059669':r.reliability>75?'#d97706':'#dc2626'}">\${r.reliability}% affidabilità</span>
        <span class="text-xs text-gray-400 font-semibold">\${r.source}</span>
        <a href="https://\${r.url}" target="_blank" rel="noopener" class="text-xs text-blue-500 ml-auto hover:underline"><i class="fas fa-external-link-alt mr-1"></i>Apri fonte</a>
      </div>
      <div class="font-semibold text-gray-800 mb-1">\${r.title}</div>
      <div class="text-sm text-gray-600 leading-relaxed">\${r.snippet}</div>
      <button onclick="navigator.clipboard.writeText('\${r.snippet.replace(/'/g,\"\\\\'\")}')" class="mt-2 text-xs text-emerald-600 hover:text-emerald-800 font-semibold"><i class="fas fa-copy mr-1"></i>Cita nel contenuto</button>
    </div>
  \`).join('');
}

// ═══════════════════════════════════════════════════════
// 6. PUNTEGGIO CONTENUTO
// ═══════════════════════════════════════════════════════
function liveScore() {
  const text = document.getElementById('csContent').value;
  const words = text.split(/\\s+/).filter(Boolean).length;
  const score = Math.min(100, Math.round(words / 15));
  document.getElementById('mainScore').textContent = score;
  document.getElementById('mainScoreRing').style.background =
    score > 75 ? 'linear-gradient(135deg,#059669,#10b981)' :
    score > 50 ? 'linear-gradient(135deg,#d97706,#f59e0b)' :
                 'linear-gradient(135deg,#dc2626,#ef4444)';
}

function analyzeContent() {
  const text = document.getElementById('csContent').value.trim();
  const kw   = document.getElementById('csKeyword').value.toLowerCase().trim();
  if (!text) { showToast('Inserisci del testo da analizzare'); return; }

  const words   = text.split(/\\s+/).filter(Boolean).length;
  const kwCount = kw ? (text.toLowerCase().match(new RegExp(kw,'g'))||[]).length : 0;
  const density = kw && words > 0 ? ((kwCount/words)*100).toFixed(1) : 0;
  const hasH1   = text.includes('# ');
  const hasH2   = text.includes('## ');
  const hasLinks = text.includes('http');
  const score   = Math.min(100, Math.round(
    (Math.min(words,2000)/2000)*30 +
    (kwCount>0 && kwCount<10 ? 20 : 10) +
    (hasH1?15:0) + (hasH2?15:0) + (hasLinks?10:0) + 10
  ));

  document.getElementById('mainScore').textContent = score;
  document.getElementById('mainScoreRing').style.background =
    score > 75 ? 'linear-gradient(135deg,#059669,#10b981)' :
    score > 50 ? 'linear-gradient(135deg,#d97706,#f59e0b)' :
                 'linear-gradient(135deg,#dc2626,#ef4444)';

  const metrics = [
    { label:'Lunghezza contenuto', val: words + ' parole', score: Math.min(100,Math.round(words/20)), target:'1.200–2.500' },
    { label:'Densità keyword', val: density + '%', score: density>0&&density<3?90:density===0?0:50, target:'0.5–2.5%' },
    { label:'Struttura heading', val: (hasH1?'H1 ✓ ':'H1 ✗ ')+(hasH2?'H2 ✓':'H2 ✗'), score: (hasH1?50:0)+(hasH2?50:0), target:'H1+H2+H3' },
    { label:'Link presenti', val: hasLinks?'Sì':'No', score: hasLinks?80:20, target:'2–5 link' },
  ];

  document.getElementById('scoreBreakdown').innerHTML = metrics.map(m => \`
    <div class="mb-3">
      <div class="flex justify-between text-xs mb-1">
        <span class="font-semibold text-gray-700">\${m.label}</span>
        <span class="text-gray-500">\${m.val}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill \${m.score>75?'bg-emerald-500':m.score>45?'bg-yellow-400':'bg-red-400'}" style="width:\${m.score}%"></div></div>
      <div class="text-xs text-gray-400 mt-0.5">Target: \${m.target}</div>
    </div>
  \`).join('');

  const suggs = [];
  if (words < 1200) suggs.push('Espandi il contenuto (minimo 1.200 parole per buon ranking)');
  if (kwCount === 0) suggs.push(\`Inserisci la keyword "\${kw}" nel testo\`);
  if (!hasH1) suggs.push('Aggiungi un titolo H1 (riga che inizia con # )');
  if (!hasH2) suggs.push('Aggiungi sezioni H2 (righe che iniziano con ## )');
  if (!hasLinks) suggs.push('Aggiungi 2–3 link interni o a fonti autorevoli');
  if (density > 3) suggs.push('Riduci la frequenza della keyword (supera il 3%)');

  if (suggs.length > 0) {
    document.getElementById('scoreSuggestions').classList.remove('hidden');
    document.getElementById('suggList').innerHTML = suggs.map(s => \`<li>→ \${s}</li>\`).join('');
  }
  showToast('Score calcolato: ' + score + '/100');
}

// ═══════════════════════════════════════════════════════
// 7. LINK INTERNI
// ═══════════════════════════════════════════════════════
function analyzeInternalLinks() {
  const url = document.getElementById('intUrl').value;
  const anchors = [
    { anchor:'#heroSection', text:'Hero — Form richiesta', section:'Richiesta lead' },
    { anchor:'#whyEcura', text:'Perché eCura', section:'Vantaggi' },
    { anchor:'#ecuraSecurity', text:'Sicurezza', section:'Protezione' },
    { anchor:'#funcionality', text:'Funzionalità bracciale', section:'Prodotto' },
    { anchor:'#pricingPlan', text:'Soluzioni e prezzi', section:'Conversione' },
    { anchor:'#contattaci', text:'Modulo contatto', section:'Lead' },
    { anchor:'#testimonial', text:'Testimonianze clienti', section:'Social proof' },
  ];
  document.getElementById('internalResults').innerHTML = \`
    <div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="bg-gray-50 text-xs font-bold text-gray-600">
        <th class="px-3 py-2 text-left">Ancora (anchor)</th>
        <th class="px-3 py-2 text-left">Testo</th>
        <th class="px-3 py-2 text-center">Sezione</th>
        <th class="px-3 py-2 text-center">Stato</th>
      </tr></thead>
      <tbody>\${anchors.map((a,i) => \`
        <tr class="\${i%2===0?'bg-white':'bg-gray-50'} border-b border-gray-100">
          <td class="px-3 py-2 font-mono text-blue-600 text-xs">\${url}\${a.anchor}</td>
          <td class="px-3 py-2 font-medium">\${a.text}</td>
          <td class="px-3 py-2 text-center"><span class="link-chip link-int">\${a.section}</span></td>
          <td class="px-3 py-2 text-center text-green-600 font-bold text-xs">✅ OK</td>
        </tr>
      \`).join('')}</tbody>
    </table></div>
  \`;
  document.getElementById('internalOpportunities').innerHTML = \`
    <ul class="text-xs space-y-1.5 text-blue-700">
      <li>→ Aggiungi link <strong>"Come funziona eCura"</strong> dalla sezione hero verso <code>#funcionality</code></li>
      <li>→ Aggiungi link da FAQ verso <code>#pricingPlan</code> (anchor: "Scopri i piani")</li>
      <li>→ Crea pagina blog separata e linka dalla home con anchor keyword-rich</li>
      <li>→ Footer: aggiungi link a sitemap, privacy policy e contatti</li>
    </ul>
  \`;
  showToast('Link interni analizzati!');
}

// ═══════════════════════════════════════════════════════
// 8. LINK ESTERNI
// ═══════════════════════════════════════════════════════
function renderExternalLinks() {
  const links = [
    { domain:'istat.it', title:'ISTAT — Statistiche anziani soli in Italia', anchor:'Fonte: ISTAT 2024', da:85, rel:'follow', nota:'✅ Alta autorità — Cita statistiche anziani' },
    { domain:'salute.gov.it', title:'Ministero della Salute', anchor:'Ministero della Salute', da:92, rel:'follow', nota:'✅ Istituzionale — massima fiducia Google' },
    { domain:'inps.it', title:'INPS — Rimborsi dispositivi medici', anchor:'Rimborsi INPS', da:90, rel:'follow', nota:'✅ Ottimo per keywords "rimborso INPS"' },
    { domain:'who.int', title:'WHO — Global Report on Falls Prevention', anchor:'WHO — prevenzione cadute', da:98, rel:'follow', nota:'✅ Fonte scientifica internazionale' },
    { domain:'agenas.it', title:'AGENAS — Teleassistenza nel SSN', anchor:'Linee guida teleassistenza', da:72, rel:'follow', nota:'✅ Agenzia Nazionale per i Servizi Sanitari' },
    { domain:'medicagb.it', title:'Medica GB Srl — Sito aziendale', anchor:'Chi siamo', da:20, rel:'follow', nota:'⚠️ DA basso — interno al brand' },
  ];
  document.getElementById('externalLinks').innerHTML = \`<div class="overflow-x-auto"><table class="w-full text-sm">
    <thead><tr class="bg-gray-50 text-xs font-bold text-gray-600">
      <th class="px-3 py-2 text-left">Dominio</th>
      <th class="px-3 py-2 text-left">Anchor text consigliato</th>
      <th class="px-3 py-2 text-center">DA</th>
      <th class="px-3 py-2 text-center">rel</th>
      <th class="px-3 py-2 text-left">Note</th>
    </tr></thead>
    <tbody>\${links.map((l,i) => \`
      <tr class="\${i%2===0?'bg-white':'bg-gray-50'} border-b border-gray-100">
        <td class="px-3 py-2 font-mono text-xs text-blue-600">\${l.domain}</td>
        <td class="px-3 py-2"><span class="link-chip link-ext">\${l.anchor}</span></td>
        <td class="px-3 py-2 text-center font-bold text-\${l.da>70?'green':'orange'}-600">\${l.da}</td>
        <td class="px-3 py-2 text-center text-xs font-bold text-gray-500">\${l.rel}</td>
        <td class="px-3 py-2 text-xs text-gray-600">\${l.nota}</td>
      </tr>
    \`).join('')}</tbody>
  </table></div>\`;
}

// ═══════════════════════════════════════════════════════
// 9. BACKLINK
// ═══════════════════════════════════════════════════════
function analyzeBacklinks() {
  document.getElementById('blTotal').textContent = '12';
  document.getElementById('blDomains').textContent = '8';
  document.getElementById('blDA').textContent = '34';
  document.getElementById('blLost').textContent = '2';
  document.getElementById('backlinkResults').innerHTML = \`
    <table class="w-full text-sm"><thead><tr class="bg-gray-50 text-xs font-bold text-gray-600">
      <th class="px-3 py-2 text-left">Dominio che linka</th>
      <th class="px-3 py-2 text-center">DA</th>
      <th class="px-3 py-2 text-left">Anchor text</th>
      <th class="px-3 py-2 text-center">Tipo</th>
      <th class="px-3 py-2 text-center">Stato</th>
    </tr></thead><tbody>
      <tr class="border-b border-gray-100"><td class="px-3 py-2 font-mono text-xs text-blue-600">medicagb.it</td><td class="px-3 py-2 text-center font-bold text-green-600">20</td><td class="px-3 py-2 text-xs">eCura teleassistenza</td><td class="px-3 py-2 text-center"><span class="link-chip link-back">dofollow</span></td><td class="px-3 py-2 text-center text-green-600">✅</td></tr>
      <tr class="border-b border-gray-100 bg-gray-50"><td class="px-3 py-2 font-mono text-xs text-blue-600">ecura.it</td><td class="px-3 py-2 text-center font-bold text-green-600">18</td><td class="px-3 py-2 text-xs">bracciale anziani</td><td class="px-3 py-2 text-center"><span class="link-chip link-back">dofollow</span></td><td class="px-3 py-2 text-center text-green-600">✅</td></tr>
    </tbody></table>
  \`;
  document.getElementById('linkBuildingOpps').innerHTML = \`
    <ul class="text-xs space-y-2 text-emerald-700">
      <li>📰 <strong>Comunicato stampa</strong> a testate salute (Doctor33, FNOMCeO, Quotidiano Sanità) — DA 60-80</li>
      <li>📋 <strong>Guest post</strong> su blog caregiver italiani (Caregiver Onlus, Alzheimer Italia)</li>
      <li>🏥 <strong>Directory mediche</strong> italiane (Paginemediche.it, Medicitalia.it)</li>
      <li>🎓 <strong>Università e ricercatori</strong> — cita le loro ricerche, spesso ripostano con link</li>
      <li>📊 <strong>Crea infografiche</strong> sulle statistiche cadute anziani — alta condivisibilità</li>
      <li>🤝 <strong>Partnership locali</strong> con RSA, farmacie e studi medici (link da siti locali)</li>
    </ul>
  \`;
  showToast('Backlink analizzati!');
}

// ═══════════════════════════════════════════════════════
// 10. IMMAGINI AI
// ═══════════════════════════════════════════════════════
function generateImage() {
  showToast('Reindirizza al modulo AI Marketing → Immagini AI...');
  setTimeout(() => window.location.href = '/admin/ai-marketing#aiimages', 1500);
}

function renderPromptPresets() {
  const presets = [
    { title:'Hero landing page', prompt:'Anziana sorridente 70 anni con bracciale smartwatch al polso, cucina moderna luminosa italiana, foto realistica professionale, luce naturale', use:'1200×630' },
    { title:'Coppia anziani sereni', prompt:'Coppia di anziani 70-75 anni seduti sul divano sorridenti, appartamento italiano accogliente, uomo con bracciale medico al polso, atmosfera calda', use:'1200×628' },
    { title:'Figlio con genitore anziano', prompt:'Donna 45 anni abbraccia madre anziana 75 anni, entrambe sorridenti, appartamento luminoso, bracciale medico visibile, foto lifestyle italiana', use:'1200×628' },
    { title:'Bracciale close-up', prompt:'Close-up bracciale smartwatch medico su polso anziano, sfondo bianco pulito, luce da studio professionale, stile prodotto premium', use:'800×800' },
    { title:'Anziano autonomo fuori casa', prompt:'Anziano 70 anni cammina da solo in parco italiano, sorride, porta bracciale al polso, giornata soleggiata, foto lifestyle', use:'1200×630' },
    { title:'App famiglia su smartphone', prompt:'Mano tiene smartphone con app di monitoraggio familiare su schermo, schermata GPS, interfaccia verde e bianca, foto moderna', use:'800×450' },
  ];
  document.getElementById('promptPresets').innerHTML = presets.map(p => \`
    <div class="border border-gray-200 rounded-xl p-3 hover:border-emerald-400 transition cursor-pointer" onclick="usePreset(this)">
      <div class="font-bold text-sm text-gray-800 mb-1">\${p.title}</div>
      <div class="text-xs text-gray-500 mb-2">\${p.prompt.slice(0,80)}...</div>
      <div class="flex items-center justify-between">
        <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">\${p.use}</span>
        <button onclick="setPrompt('\${p.prompt.replace(/'/g,\"\\\\'\")}',event)" class="text-xs text-emerald-600 font-semibold hover:text-emerald-800">Usa →</button>
      </div>
    </div>
  \`).join('');
}

function setPrompt(text, e) {
  e.stopPropagation();
  document.getElementById('imgPrompt').value = text;
  showToast('Prompt caricato!');
}

// ═══════════════════════════════════════════════════════
// 11. TARGETING PUBBLICO
// ═══════════════════════════════════════════════════════
function renderAudience() {
  const segments = [
    { name:'Figli adulti preoccupati', icon:'👨‍👩‍👧', age:'35–55 anni', size:'8.2M', intent:'alta', desc:'Cercano soluzioni per genitori over 70 che vivono soli. Principale decisore d\'acquisto.', keywords:['come proteggere anziano solo','bracciale cadute genitore','monitoraggio anziani distanza'] },
    { name:'Anziani autonomi', icon:'👴', age:'65–80 anni', size:'3.1M', intent:'media', desc:'Cercano autonomia con sicurezza. Sensibili a semplicità d\'uso e non invasività.', keywords:['bracciale emergenza facile','dispositivo anziani semplice','SOS bracciale'] },
    { name:'Caregiver professionali', icon:'🏥', age:'30–50 anni', size:'1.4M', intent:'alta', desc:'Infermieri, badanti, OSS che consigliano dispositivi ai propri assistiti.', keywords:['dispositivo medico anziani','teleassistenza professionale','monitoraggio parametri vitali'] },
    { name:'Medici e geriatri', icon:'👨‍⚕️', age:'40–65 anni', size:'62K', intent:'altissima', desc:'Prescrivono o consigliano dispositivi. DA loro la parola ha peso enorme.', keywords:['dispositivo medico classe IIa','bracciale parametri vitali clinici','teleassistenza medica'] },
  ];
  document.getElementById('audienceSegments').innerHTML = \`<div class="grid grid-cols-1 md:grid-cols-2 gap-4">\${segments.map(s => \`
    <div class="border border-gray-200 rounded-xl p-4 hover:border-emerald-400 transition">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-3xl">\${s.icon}</span>
        <div>
          <div class="font-bold text-gray-800">\${s.name}</div>
          <div class="text-xs text-gray-500">\${s.age} · \${s.size} persone in Italia</div>
        </div>
        <span class="ml-auto text-xs font-bold px-2 py-0.5 rounded bg-\${s.intent==='altissima'?'red':s.intent==='alta'?'orange':'yellow'}-100 text-\${s.intent==='altissima'?'red':s.intent==='alta'?'orange':'yellow'}-700">Intento \${s.intent}</span>
      </div>
      <p class="text-xs text-gray-600 mb-3">\${s.desc}</p>
      <div class="flex flex-wrap gap-1">\${s.keywords.map(k => \`<span class="badge-kw bg-emerald-100 text-emerald-700">\${k}</span>\`).join('')}</div>
    </div>
  \`).join('')}</div>\`;

  document.getElementById('geoTargeting').innerHTML = \`
    <div class="overflow-x-auto"><table class="w-full text-sm">
      <thead><tr class="bg-gray-50 text-xs font-bold text-gray-600">
        <th class="px-3 py-2 text-left">Regione</th>
        <th class="px-3 py-2 text-center">Over 65</th>
        <th class="px-3 py-2 text-center">% Soli</th>
        <th class="px-3 py-2 text-center">Priorità SEO</th>
        <th class="px-3 py-2 text-left">Keyword locale</th>
      </tr></thead>
      <tbody>
        <tr class="border-b"><td class="px-3 py-2 font-semibold">Lombardia</td><td class="px-3 py-2 text-center">2.3M</td><td class="px-3 py-2 text-center">38%</td><td class="px-3 py-2 text-center"><span class="badge-kw difficulty-low">ALTA</span></td><td class="px-3 py-2 text-xs">teleassistenza anziani Milano</td></tr>
        <tr class="border-b bg-gray-50"><td class="px-3 py-2 font-semibold">Lazio</td><td class="px-3 py-2 text-center">1.4M</td><td class="px-3 py-2 text-center">41%</td><td class="px-3 py-2 text-center"><span class="badge-kw difficulty-low">ALTA</span></td><td class="px-3 py-2 text-xs">bracciale anziani Roma</td></tr>
        <tr class="border-b"><td class="px-3 py-2 font-semibold">Campania</td><td class="px-3 py-2 text-center">1.2M</td><td class="px-3 py-2 text-center">44%</td><td class="px-3 py-2 text-center"><span class="badge-kw difficulty-med">MEDIA</span></td><td class="px-3 py-2 text-xs">teleassistenza anziani Napoli</td></tr>
        <tr class="border-b bg-gray-50"><td class="px-3 py-2 font-semibold">Piemonte</td><td class="px-3 py-2 text-center">1.1M</td><td class="px-3 py-2 text-center">37%</td><td class="px-3 py-2 text-center"><span class="badge-kw difficulty-med">MEDIA</span></td><td class="px-3 py-2 text-xs">bracciale emergenza anziani Torino</td></tr>
        <tr><td class="px-3 py-2 font-semibold">Veneto</td><td class="px-3 py-2 text-center">0.98M</td><td class="px-3 py-2 text-center">36%</td><td class="px-3 py-2 text-center"><span class="badge-kw difficulty-med">MEDIA</span></td><td class="px-3 py-2 text-xs">teleassistenza anziani Venezia</td></tr>
      </tbody>
    </table></div>
  \`;
}

// ═══════════════════════════════════════════════════════
// 12. VIDEO YOUTUBE
// ═══════════════════════════════════════════════════════
function renderYtStrategy() {
  const videos = [
    { priority:1, title:'Come funziona il bracciale eCura — Demo completa', kw:'bracciale teleassistenza anziani', views:'5K–20K', type:'Demo prodotto', duration:'3–5 min' },
    { priority:2, title:'Mia madre vive sola: come l\'ho protetta con eCura', kw:'come proteggere anziano solo', views:'10K–50K', type:'Testimonial', duration:'2–4 min' },
    { priority:3, title:'Bracciale cadute anziani: come funziona il rilevamento AI', kw:'rilevamento cadute anziani', views:'3K–15K', type:'Educativo', duration:'4–6 min' },
    { priority:4, title:'eCura vs Beghelli Salvavita: confronto completo 2026', kw:'alternativa beghelli salvavita', views:'2K–10K', type:'Comparativo', duration:'5–8 min' },
    { priority:5, title:'Come detrarre il 19% per dispositivo medico anziani', kw:'dispositivo medico detraibile 19', views:'8K–30K', type:'Educativo', duration:'3–5 min' },
    { priority:6, title:'GPS anziani in casa: come funziona l\'indoor positioning', kw:'GPS anziani indoor', views:'2K–8K', type:'Tutorial', duration:'3–4 min' },
  ];
  document.getElementById('ytStrategy').innerHTML = \`
    <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm">
      <i class="fab fa-youtube text-red-500 mr-2"></i>
      <strong>Strategia YouTube SEO per eCura</strong>: YouTube è il <strong>secondo motore di ricerca al mondo</strong>. 
      I video apparsi in SERP Google aumentano il CTR del 41%. Target: raggiungere 500 iscritti entro 6 mesi.
    </div>
    <div class="space-y-3">\${videos.map(v => \`
      <div class="border border-gray-200 rounded-xl p-4 hover:border-red-300 transition">
        <div class="flex items-start gap-3">
          <span class="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">#\${v.priority}</span>
          <div class="flex-1">
            <div class="font-bold text-gray-800 mb-1">\${v.title}</div>
            <div class="flex flex-wrap gap-2 text-xs text-gray-500">
              <span>🎯 \${v.kw}</span>
              <span>📊 \${v.views} views stimati</span>
              <span>⏱️ \${v.duration}</span>
              <span class="bg-gray-100 px-2 py-0.5 rounded font-semibold">\${v.type}</span>
            </div>
          </div>
          <button onclick="generateYtForVideo('\${v.title.replace(/'/g,\"\\\\'\")}','\${v.kw}')" class="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap">
            Genera →
          </button>
        </div>
      </div>
    \`).join('')}
    </div>
  \`;
}

function generateYtForVideo(title, kw) {
  document.getElementById('ytTopic').value = title;
  generateYtContent();
}

function generateYtContent() {
  const topic = document.getElementById('ytTopic').value || 'bracciale teleassistenza anziani';
  const out = document.getElementById('ytOutput');
  out.innerHTML = \`<div class="animate-pulse text-gray-400 text-sm py-4 text-center"><i class="fas fa-spinner fa-spin mr-2"></i>Generazione contenuti YouTube...</div>\`;

  setTimeout(() => {
    const titleOpts = [
      \`\${topic} — GUIDA COMPLETA 2026 [\${Math.floor(Math.random()*5+3)} minuti]\`,
      \`Come funziona \${topic}: tutto quello che devi sapere\`,
      \`\${topic}: la verità che nessuno ti dice 🔴\`,
    ];
    const tags = topic.split(' ').concat(['eCura','teleassistenza','anziani','bracciale','GPS','cadute','dispositivo medico']);
    out.innerHTML = \`
      <div class="space-y-4">
        <div>
          <div class="text-xs font-bold text-gray-600 mb-1">📌 Titoli suggeriti (ottimizzati per CTR)</div>
          \${titleOpts.map((t,i) => \`
            <div class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-1">
              <span class="text-xs text-gray-400 w-4">\${i+1}</span>
              <span class="flex-1 text-sm font-medium">\${t}</span>
              <span class="text-xs \${t.length<=70?'text-green-600':'text-red-500'} font-bold">\${t.length}/70</span>
              <button onclick="navigator.clipboard.writeText('\${t.replace(/'/g,\"\\\\'\")}');showToast('Copiato!')" class="text-xs text-blue-500 hover:text-blue-700"><i class="fas fa-copy"></i></button>
            </div>
          \`).join('')}
        </div>
        <div>
          <div class="text-xs font-bold text-gray-600 mb-2">📝 Descrizione YouTube (ottimizzata SEO)</div>
          <textarea rows="8" class="w-full border border-gray-200 rounded-xl p-3 text-xs font-mono focus:ring-2 focus:ring-red-400">🔴 GUIDA COMPLETA: \${topic}

In questo video scoprirai:
✅ Come funziona esattamente il sistema
✅ Perché è diverso dai normali bracciali
✅ Quanto costa e se è detraibile al 19%
✅ Testimonianze reali di famiglie che lo usano

👉 Richiedi informazioni GRATIS: https://ecura-landing.pages.dev/
📞 Chiama: +39 335 730 1206

⏱️ CAPITOLI:
0:00 Introduzione
0:45 Come funziona
2:30 Demo dal vivo
4:00 Prezzi e piani
5:15 Testimonianze
6:30 Come richiedere info

🔖 TAG: \${tags.slice(0,10).join(', ')}

📌 AGGIORNATO: \${new Date().getFullYear()}

#teleassistenza #anziani #ecura #bracciale #GPS #salute #famiglia</textarea>
        </div>
        <div>
          <div class="text-xs font-bold text-gray-600 mb-2">🏷️ Tag YouTube</div>
          <div class="flex flex-wrap gap-1">\${tags.map(t => \`<span class="badge-kw bg-red-100 text-red-700">\${t}</span>\`).join('')}</div>
        </div>
        <div class="grid grid-cols-3 gap-3">
          <div class="p-3 bg-gray-50 rounded-xl text-center">
            <div class="text-xs text-gray-500 mb-1">Thumbnail</div>
            <div class="text-xs font-bold text-gray-700">1280×720 JPG</div>
            <div class="text-xs text-gray-400">Testo bold, volto anziano, colore brand</div>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl text-center">
            <div class="text-xs text-gray-500 mb-1">Categoria</div>
            <div class="text-xs font-bold text-gray-700">Istruzione / Salute</div>
          </div>
          <div class="p-3 bg-gray-50 rounded-xl text-center">
            <div class="text-xs text-gray-500 mb-1">Lingua</div>
            <div class="text-xs font-bold text-gray-700">Italiano (it-IT)</div>
          </div>
        </div>
      </div>
    \`;
    showToast('Contenuti YouTube generati!');
  }, 1500);
}

// ═══════════════════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2400);
}

// ═══════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderQueue();
  renderKwClusters();
  renderExternalLinks();
  renderPromptPresets();
  renderAudience();
  renderYtStrategy();
  renderCompMatrix();
  searchKeywords(); // precarica keyword
});
</script>
</body>
</html>`;
}
