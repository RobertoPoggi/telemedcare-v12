// ═══════════════════════════════════════════════════════════════════
//  eCura AI MARKETING HUB — TeleMedCare V12.0
//  13 moduli AI-driven: contenuti brand, GEO, AI Search visibility
//  Route: /admin/ai-marketing
// ═══════════════════════════════════════════════════════════════════

export function renderAiMarketingDashboard(): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>eCura AI Marketing — TeleMedCare V12.0</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f8fafc; }
  .tab-btn        { background:#e5e7eb; color:#374151; transition:all .2s; }
  .tab-btn.active { background:linear-gradient(135deg,#7C3AED,#4F46E5); color:#fff; }
  .tab-panel      { display:none; }
  .tab-panel.active{ display:block; }
  .section-card   { background:#fff; border-radius:16px; box-shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.04); padding:24px; margin-bottom:20px; }
  .kpi-card       { background:#fff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.08); padding:20px; }
  .progress-bar   { height:8px; border-radius:4px; background:#e5e7eb; overflow:hidden; }
  .progress-fill  { height:100%; border-radius:4px; transition:width .6s ease; }
  .badge          { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:700; }
  .badge-purple   { background:#ede9fe; color:#6d28d9; }
  .badge-green    { background:#dcfce7; color:#15803d; }
  .badge-blue     { background:#dbeafe; color:#1d4ed8; }
  .badge-red      { background:#fee2e2; color:#dc2626; }
  .badge-yellow   { background:#fef9c3; color:#854d0e; }
  .badge-orange   { background:#ffedd5; color:#c2410c; }
  textarea, input, select { font-family:inherit; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  .fade-in { animation: fadeIn .3s ease; }
  .action-btn { background:linear-gradient(135deg,#7C3AED,#4F46E5); color:#fff; padding:10px 20px; border-radius:10px; font-weight:700; font-size:14px; border:none; cursor:pointer; transition:opacity .2s; }
  .action-btn:hover { opacity:.88; }
  .action-btn:disabled { opacity:.5; cursor:not-allowed; }
  .action-btn-green { background:linear-gradient(135deg,#059669,#0d9488); }
  .result-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:16px; min-height:80px; }
  .score-ring { width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:22px; font-weight:900; }
</style>
</head>
<body>

<!-- ═══════════════ HEADER ═══════════════ -->
<div style="background:linear-gradient(135deg,#7C3AED 0%,#4F46E5 100%)" class="text-white px-6 py-5 shadow-lg">
  <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
    <div class="flex items-center gap-4">
      <a href="/home" class="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-2 rounded-lg text-sm transition">
        <i class="fas fa-arrow-left mr-1"></i>Home
      </a>
      <div>
        <div class="flex items-center gap-3">
          <i class="fas fa-robot text-3xl"></i>
          <h1 class="text-2xl font-bold tracking-tight">eCura AI Marketing</h1>
          <span class="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-bold">13 MODULI</span>
        </div>
        <p class="text-purple-100 text-sm mt-1">Contenuti brand · GEO visibility · AI Search (ChatGPT, Gemini, Perplexity)</p>
      </div>
    </div>
    <div class="flex gap-3 text-sm flex-wrap">
      <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center gap-2">
        <i class="fas fa-bullseye"></i> Target: <strong>eCura · Medica GB</strong>
      </div>
      <div class="bg-white bg-opacity-20 px-4 py-2 rounded-lg flex items-center gap-2">
        <span class="w-2 h-2 bg-green-300 rounded-full inline-block animate-pulse"></span> AI Engine Live
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════ TABS ═══════════════ -->
<div class="max-w-7xl mx-auto px-6 mt-6">
  <div class="flex gap-2 flex-wrap mb-6">
    <button class="tab-btn active px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('autopilot')"><i class="fas fa-rocket mr-1"></i>Autopilot</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('keyword')"><i class="fas fa-key mr-1"></i>Keyword</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('serp')"><i class="fas fa-search mr-1"></i>SERP</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('competitor')"><i class="fas fa-chess mr-1"></i>Competitor</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('deepresearch')"><i class="fas fa-microscope mr-1"></i>Deep Research</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('score')"><i class="fas fa-star mr-1"></i>Content Score</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('internal')"><i class="fas fa-link mr-1"></i>Link Interni</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('external')"><i class="fas fa-external-link-alt mr-1"></i>Link Esterni</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('backlink')"><i class="fas fa-project-diagram mr-1"></i>Backlink</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('images')"><i class="fas fa-image mr-1"></i>Immagini AI</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('audience')"><i class="fas fa-users mr-1"></i>Targeting</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('youtube')"><i class="fab fa-youtube mr-1"></i>YouTube</button>
    <button class="tab-btn px-4 py-2.5 rounded-lg font-semibold text-sm" onclick="showTab('geo')"><i class="fas fa-brain mr-1"></i>GEO ★</button>
  </div>

<!-- ══════════════════════════════════════════════════════════
     TAB 1 — AUTOPILOT CONTENUTI
══════════════════════════════════════════════════════════ -->
<div id="tab-autopilot" class="tab-panel active fade-in">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Configurazione -->
    <div class="section-card">
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-rocket text-purple-600"></i> Autopilot Contenuti eCura
      </h2>
      <p class="text-sm text-gray-500 mb-5">Genera articoli SEO ottimizzati per eCura con un click. L'AI scrive in tono brand, include dati reali e ottimizza per keyword target.</p>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Tipo contenuto</label>
          <select id="ap-type" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-400">
            <option>📰 Articolo blog SEO (1.500-2.000 parole)</option>
            <option>🏠 Landing page prodotto (800-1.000 parole)</option>
            <option>❓ Pagina FAQ (10-15 domande)</option>
            <option>📱 Post social + caption Instagram</option>
            <option>📧 Email nurturing (sequenza 3 email)</option>
            <option>🎥 Script video YouTube (3-5 minuti)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Keyword target</label>
          <input id="ap-keyword" type="text" value="bracciale cadute anziani" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-400">
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Tono di voce</label>
          <select id="ap-tone" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-purple-400">
            <option>Empatico e rassicurante (default eCura)</option>
            <option>Tecnico-scientifico (medici e MMG)</option>
            <option>Informativo-educativo (caregiver)</option>
            <option>Persuasivo-commerciale (conversione)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Sezioni obbligatorie</label>
          <div class="space-y-1.5">
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked class="accent-purple-600"> Statistiche ISTAT/ISS</label>
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked class="accent-purple-600"> Vantaggi eCura vs competitor</label>
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked class="accent-purple-600"> CTA acquisto con prezzo €390/anno</label>
            <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" class="accent-purple-600"> Schema FAQ JSON-LD</label>
          </div>
        </div>
      </div>

      <button id="ap-btn" class="action-btn w-full mt-5" onclick="generateAutopilot()">
        <i class="fas fa-magic mr-2"></i>Genera contenuto AI
      </button>
    </div>

    <!-- Output -->
    <div class="lg:col-span-2 section-card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-800">Output generato</h2>
        <div class="flex gap-2" id="ap-actions" style="display:none!important">
          <button onclick="copyAutopilot()" class="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"><i class="far fa-copy mr-1"></i>Copia</button>
          <button onclick="downloadAutopilot()" class="text-sm px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"><i class="fas fa-download mr-1"></i>Scarica .txt</button>
        </div>
      </div>

      <!-- Stato iniziale -->
      <div id="ap-placeholder" class="flex flex-col items-center justify-center py-16 text-gray-400">
        <i class="fas fa-robot text-5xl mb-4 text-purple-200"></i>
        <p class="text-lg font-medium">In attesa di generazione</p>
        <p class="text-sm mt-1">Configura i parametri e clicca "Genera contenuto AI"</p>
      </div>

      <!-- Loading -->
      <div id="ap-loading" class="hidden">
        <div class="flex items-center gap-3 mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
          <i class="fas fa-spinner fa-spin text-purple-600 text-xl"></i>
          <div>
            <p class="text-sm font-semibold text-purple-800" id="ap-step">Inizializzazione AI...</p>
            <div class="progress-bar mt-2 w-64"><div class="progress-fill bg-purple-500" id="ap-bar" style="width:0%"></div></div>
          </div>
        </div>
      </div>

      <!-- Articolo generato -->
      <div id="ap-output" class="hidden">
        <div class="flex flex-wrap gap-2 mb-4">
          <span class="badge badge-green"><i class="fas fa-check"></i> SEO Ottimizzato</span>
          <span class="badge badge-purple"><i class="fas fa-brain"></i> AI Generated</span>
          <span id="ap-word-count" class="badge badge-blue"></span>
        </div>
        <div id="ap-content" class="result-box text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto"></div>
      </div>
    </div>
  </div>

  <!-- Coda articoli pianificati -->
  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
      <i class="fas fa-calendar-alt text-purple-600"></i> Piano editoriale automatico — Prossimi 7 giorni
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3" id="ap-queue">
      ${[
        {day:'Lun 21/07', kw:'bracciale SOS anziani', type:'Blog SEO', status:'ready'},
        {day:'Mar 22/07', kw:'teleassistenza costo Italia', type:'Landing Page', status:'ready'},
        {day:'Mer 23/07', kw:'rilevamento cadute automatico AI', type:'Blog SEO', status:'pending'},
        {day:'Gio 24/07', kw:'eCura vs Beghelli confronto', type:'Confronto', status:'pending'},
        {day:'Ven 25/07', kw:'caregiver strumenti digitali', type:'Blog SEO', status:'pending'},
        {day:'Sab 26/07', kw:'anziani soli sicurezza casa', type:'Blog SEO', status:'pending'},
        {day:'Dom 27/07', kw:'certificazione CE IIa dispositivo medico', type:'Tecnico', status:'pending'},
        {day:'Lun 28/07', kw:'centrale operativa H24 telesoccorso', type:'Blog SEO', status:'pending'},
      ].map(a => `
      <div class="p-3 rounded-lg border ${a.status==='ready'?'border-green-200 bg-green-50':'border-gray-200 bg-gray-50'}">
        <p class="text-xs font-bold ${a.status==='ready'?'text-green-700':'text-gray-500'}">${a.day}</p>
        <p class="text-sm font-semibold text-gray-800 mt-1 leading-snug">${a.kw}</p>
        <div class="flex items-center justify-between mt-2">
          <span class="badge ${a.status==='ready'?'badge-green':'badge-yellow'}">${a.status==='ready'?'✓ Pronto':'In attesa'}</span>
          <span class="text-xs text-gray-400">${a.type}</span>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 2 — KEYWORD RESEARCH
══════════════════════════════════════════════════════════ -->
<div id="tab-keyword" class="tab-panel fade-in">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <div class="section-card">
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-key text-purple-600"></i> Ricerca Keyword AI
      </h2>
      <div class="space-y-3">
        <input id="kw-seed" type="text" value="bracciale anziani" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" placeholder="Keyword seme...">
        <select id="kw-intent" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
          <option>Tutti gli intenti</option>
          <option>Informativo (top-funnel)</option>
          <option>Commerciale (mid-funnel)</option>
          <option>Transazionale (bottom-funnel)</option>
        </select>
        <select id="kw-difficulty" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
          <option>Tutte le difficoltà</option>
          <option>Bassa (DA &lt; 30) — facile posizionare</option>
          <option>Media (DA 30-50)</option>
          <option>Alta (DA 50+) — long-term</option>
        </select>
      </div>
      <button class="action-btn w-full mt-4" onclick="runKeyword(this)">
        <i class="fas fa-search mr-2"></i>Analizza keyword
      </button>
      <button class="w-full mt-2 text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition" onclick="exportKwCSV()">
        <i class="fas fa-download mr-1"></i>Esporta CSV
      </button>
    </div>

    <div class="lg:col-span-2 section-card">
      <h3 class="text-base font-bold text-gray-800 mb-4">Keyword raccomandate per eCura — Volume e opportunità</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm" id="kw-table">
          <thead>
            <tr class="text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
              <th class="text-left pb-3">Keyword</th>
              <th class="text-right pb-3">Vol/mese</th>
              <th class="text-center pb-3">Difficoltà</th>
              <th class="text-center pb-3">Intento</th>
              <th class="text-right pb-3">CPC €</th>
              <th class="text-center pb-3">Priorità</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            ${[
              ['bracciale cadute anziani', 1900, 'Alta', 'Commerciale', 1.20, 'Alta'],
              ['teleassistenza anziani', 3200, 'Alta', 'Informativo', 0.90, 'Alta'],
              ['allarme caduta automatico', 880, 'Media', 'Commerciale', 1.45, 'Alta'],
              ['bracciale SOS anziani Italia', 1400, 'Alta', 'Commerciale', 1.35, 'Alta'],
              ['telesoccorso casa prezzo', 720, 'Media', 'Transazionale', 1.80, 'Alta'],
              ['miglior bracciale emergenza anziani', 590, 'Media', 'Commerciale', 1.60, 'Media'],
              ['cadute anziani prevenzione statistiche', 2100, 'Bassa', 'Informativo', 0.55, 'Media'],
              ['bracciale GPS nonno', 440, 'Bassa', 'Commerciale', 0.95, 'Media'],
              ['teleassistenza domiciliare costo', 660, 'Media', 'Transazionale', 2.10, 'Alta'],
              ['centrale operativa H24 anziani', 320, 'Bassa', 'Informativo', 0.70, 'Bassa'],
              ['dispositivo medico CE IIa anziani', 280, 'Bassa', 'Tecnico', 0.85, 'Media'],
              ['ecura bracciale medicagb', 510, 'Bassa', 'Brand', 0.40, 'Alta'],
            ].map(r => `<tr class="hover:bg-gray-50">
              <td class="py-2.5 font-medium text-gray-800">${r[0]}</td>
              <td class="py-2.5 text-right text-gray-600">${r[1].toLocaleString('it')}</td>
              <td class="py-2.5 text-center"><span class="badge ${r[2]==='Alta'?'badge-red':r[2]==='Media'?'badge-yellow':'badge-green'}">${r[2]}</span></td>
              <td class="py-2.5 text-center text-gray-500 text-xs">${r[3]}</td>
              <td class="py-2.5 text-right text-gray-600">€${r[4]}</td>
              <td class="py-2.5 text-center"><span class="badge ${r[5]==='Alta'?'badge-purple':r[5]==='Media'?'badge-blue':'badge-yellow'}">${r[5]}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Cluster per intento -->
  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-layer-group text-purple-600 mr-2"></i>Cluster keyword per intento di ricerca</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${[
        {label:'Top-funnel — Informativo', color:'blue', kws:['cadute anziani statistiche','prevenzione cadute casa','telesoccorso come funziona','bracciale medicale cos\'è'], vol:'7.2K/mese totale', icon:'fa-info-circle'},
        {label:'Mid-funnel — Commerciale', color:'purple', kws:['miglior bracciale SOS','bracciale cadute anziani opinioni','telesoccorso confronto prezzi','ecura vs beghelli'], vol:'4.8K/mese totale', icon:'fa-balance-scale'},
        {label:'Bottom-funnel — Transazionale', color:'green', kws:['acquista bracciale telesoccorso','ecura prezzo abbonamento','attiva ecura online','bracciale anziani €390'], vol:'2.9K/mese totale', icon:'fa-shopping-cart'},
      ].map(c => `<div class="p-4 rounded-xl border-2 border-${c.color}-200 bg-${c.color}-50">
        <div class="flex items-center gap-2 mb-3">
          <i class="fas ${c.icon} text-${c.color}-600"></i>
          <h4 class="font-bold text-gray-800 text-sm">${c.label}</h4>
        </div>
        <div class="flex flex-wrap gap-1.5 mb-3">
          ${c.kws.map(k => `<span class="text-xs px-2 py-1 rounded-full bg-white border border-${c.color}-200 text-gray-700">${k}</span>`).join('')}
        </div>
        <p class="text-xs font-bold text-${c.color}-700"><i class="fas fa-chart-bar mr-1"></i>${c.vol}</p>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 3 — ANALISI SERP
══════════════════════════════════════════════════════════ -->
<div id="tab-serp" class="tab-panel fade-in">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="section-card">
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-search text-purple-600"></i> SERP Analyzer
      </h2>
      <div class="space-y-3">
        <input id="serp-kw" type="text" value="bracciale cadute anziani" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
        <select class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
          <option>Google.it — Desktop</option>
          <option>Google.it — Mobile</option>
          <option>Google.it — Local (Milano)</option>
        </select>
      </div>
      <button class="action-btn w-full mt-4" onclick="runSerp(this)">
        <i class="fas fa-bolt mr-2"></i>Analizza SERP
      </button>

      <div class="mt-5 space-y-2">
        <h4 class="text-sm font-bold text-gray-700">Feature SERP presenti</h4>
        ${[
          {f:'Featured Snippet', p:true}, {f:'People Also Ask', p:true},
          {f:'Video Carousel', p:true}, {f:'Image Pack', p:true},
          {f:'Google Shopping', p:false}, {f:'Local Pack (Maps)', p:false},
        ].map(f => `<div class="flex items-center justify-between py-1.5 border-b border-gray-100">
          <span class="text-sm text-gray-600">${f.f}</span>
          <span class="badge ${f.p?'badge-green':'badge-red'}">${f.p?'✓ Presente':'✗ Assente'}</span>
        </div>`).join('')}
      </div>

      <div class="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
        <p class="text-xs font-semibold text-purple-700 mb-1"><i class="fas fa-lightbulb mr-1"></i>AI Insight</p>
        <p class="text-xs text-purple-600">La SERP è dominata da brand (Beghelli, Televita). Opportunità: Featured Snippet con risposta diretta a "come funziona rilevamento cadute AI" — nessun competitor l'ha ancora occupato.</p>
      </div>
    </div>

    <div class="lg:col-span-2 section-card">
      <h3 class="text-base font-bold text-gray-800 mb-4">Top 5 risultati — <span class="text-purple-600">"bracciale cadute anziani"</span></h3>
      <div class="space-y-3">
        ${[
          {pos:1, domain:'beghelli.com', title:'Beghelli Salvalavita — Bracciale Emergenza Anziani', desc:'Il telesoccorso di Beghelli con bracciale SOS per anziani. Assistenza 24h, risposta immediata.', da:68, kw:18, words:2100, gap:'Nessun dato su AI rilevamento cadute. Certificazione generica.'},
          {pos:2, domain:'seremy.it', title:'Seremy — Bracciale GPS Anziani con Rilevamento Cadute', desc:'Monitora i tuoi cari H24 con il bracciale Seremy. GPS in tempo reale, allarme caduta automatico.', da:52, kw:14, words:1450, gap:'Prezzo più competitivo di eCura. No certificazione CE IIa.'},
          {pos:3, domain:'televita.it', title:'Televita Teleassistenza — Sicurezza Anziani a Casa', desc:'40 anni di esperienza nel telesoccorso. Bracciale con pulsante SOS e chiamata automatica.', da:61, kw:11, words:1800, gap:'No menzione AI. UX datata. No e-commerce.'},
          {pos:4, domain:'wikipedia.org', title:'Telesoccorso — Wikipedia', desc:'Il telesoccorso è un sistema di assistenza a distanza per anziani.', da:93, kw:3, words:3200, gap:'Non competibile — authority pura, nessun angle commerciale.'},
          {pos:5, domain:'familycaregiversonline.com', title:'I migliori dispositivi di sicurezza per anziani 2026', desc:'Confronto tra i 10 migliori bracciali di emergenza per anziani: caratteristiche e prezzi.', da:41, kw:22, words:4100, gap:'DA basso (41), contenuto generico. Posizione vulnerabile. Opportunità per eCura!'},
        ].map(r => `<div class="p-4 rounded-xl border ${r.pos<=3?'border-purple-200 bg-purple-50':'border-gray-200 bg-white'} hover:border-purple-300 transition">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${r.pos<=3?'bg-purple-600 text-white':'bg-gray-300 text-gray-700'}">${r.pos}</div>
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <span class="text-sm font-bold text-green-700">${r.domain}</span>
                <span class="badge badge-purple">DA ${r.da}</span>
                <span class="badge badge-blue">${r.kw} kw</span>
                <span class="badge badge-yellow">${r.words.toLocaleString()} parole</span>
              </div>
              <p class="text-sm font-semibold text-gray-800 mb-1">${r.title}</p>
              <p class="text-xs text-gray-500 mb-2">${r.desc}</p>
              <div class="p-2 rounded-lg bg-white border border-purple-200 text-xs text-purple-700">
                <i class="fas fa-robot mr-1"></i><strong>Gap/Opportunità:</strong> ${r.gap}
              </div>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-crosshairs text-purple-600 mr-2"></i>Piano d'attacco AI — Come entrare in Top 3</h3>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      ${[
        {t:'Supera la lunghezza media', d:'Media competitor: 1.930 parole. Scrivi 2.500+ con dati ISTAT, case study e sezioni FAQ. Punta alla posizione 5 (DA 41, vulnerabile).', c:'purple', n:'1'},
        {t:'Occupa il Featured Snippet', d:'Scrivi una sezione "Come funziona il rilevamento cadute AI" con risposta diretta in 45 parole. Nessun competitor l\'ha fatto.', c:'blue', n:'2'},
        {t:'Supera familycaregiversonline.com', d:'DA 41 vs eCura DA in crescita. 3 articoli targetizzati sulle sue keyword principali = +2.000 visite/mese.', c:'green', n:'3'},
        {t:'Ottimizza per Mobile', d:'78% delle ricerche da mobile (dato Google). Core Web Vitals: LCP < 2.5s, CLS < 0.1. Determinante per ranking locale.', c:'orange', n:'4'},
      ].map(s => `<div class="p-4 rounded-xl bg-${s.c}-50 border border-${s.c}-200">
        <div class="w-8 h-8 rounded-full bg-${s.c}-600 text-white flex items-center justify-center text-sm font-bold mb-3">${s.n}</div>
        <h4 class="text-sm font-bold text-gray-800 mb-2">${s.t}</h4>
        <p class="text-xs text-gray-600 leading-relaxed">${s.d}</p>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 4 — ANALISI COMPETITOR
══════════════════════════════════════════════════════════ -->
<div id="tab-competitor" class="tab-panel fade-in">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2"><i class="fas fa-chess text-purple-600"></i> Analisi Competitor eCura</h2>
    <button class="action-btn" onclick="refreshComp(this)"><i class="fas fa-sync-alt mr-1"></i>Aggiorna</button>
  </div>

  <!-- KPI cards competitor -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    ${[
      {name:'Beghelli', da:68, traffic:'42K/mo', score:85, color:'red', icon:'fa-crown'},
      {name:'Seremy', da:52, traffic:'18K/mo', score:72, color:'orange', icon:'fa-bolt'},
      {name:'Televita', da:61, traffic:'28K/mo', score:79, color:'blue', icon:'fa-shield-alt'},
      {name:'eCura', da:44, traffic:'6K/mo', score:88, color:'purple', icon:'fa-star'},
    ].map(c => `<div class="kpi-card border-l-4 border-${c.color}-500">
      <div class="flex items-center justify-between mb-2">
        <span class="text-base font-bold text-gray-800">${c.name}</span>
        <i class="fas ${c.icon} text-${c.color}-500"></i>
      </div>
      <p class="text-2xl font-black text-${c.color}-600 mb-1">DA ${c.da}</p>
      <p class="text-xs text-gray-500">${c.traffic} stimato</p>
      <div class="progress-bar mt-2"><div class="progress-fill bg-${c.color}-500" style="width:${c.score}%"></div></div>
      <p class="text-xs text-gray-400 mt-1">Content Score: ${c.score}/100</p>
    </div>`).join('')}
  </div>

  <!-- Matrice comparativa -->
  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-table text-purple-600 mr-2"></i>Matrice comparativa completa</h3>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-xs font-bold text-gray-500 uppercase border-b-2 border-gray-200">
            <th class="text-left pb-3 w-40">Feature</th>
            <th class="text-center pb-3 text-purple-700">eCura ★</th>
            <th class="text-center pb-3">Beghelli</th>
            <th class="text-center pb-3">Seremy</th>
            <th class="text-center pb-3">Televita</th>
            <th class="text-center pb-3">InFamiglia</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          ${[
            ['AI Rilevamento Cadute (94.7%)','✅','❌','✅ parz.','❌','❌'],
            ['GPS Real-time integrato','✅','✅','✅','❌','✅'],
            ['Certificazione CE Classe IIa','✅','✅','❌','✅','❌'],
            ['App mobile familiare','✅','✅','✅','❌','✅'],
            ['Centrale operativa H24','✅','✅','✅','✅','✅'],
            ['E-commerce diretto (acquisto online)','✅','❌','✅','❌','❌'],
            ['Prezzo piano annuale all-inclusive','€390','€480','€430','€360 + inst.','€290 base'],
            ['Punteggio SEO contenuto','88/100','85/100','72/100','79/100','61/100'],
            ['Backlink domain authority (DA)','44','68','52','61','38'],
          ].map(r => `<tr class="hover:bg-gray-50">
            <td class="py-3 text-gray-700 font-medium text-sm">${r[0]}</td>
            <td class="py-3 text-center font-bold text-purple-600 text-base">${r[1]}</td>
            <td class="py-3 text-center text-gray-500">${r[2]}</td>
            <td class="py-3 text-center text-gray-500">${r[3]}</td>
            <td class="py-3 text-center text-gray-500">${r[4]}</td>
            <td class="py-3 text-center text-gray-500">${r[5]}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Raccomandazioni -->
  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-lightbulb text-yellow-500 mr-2"></i>Raccomandazioni AI — Azioni immediate</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${[
        {t:'Vantaggio differenziante unico', d:'eCura è l\'unico con CE IIa + AI rilevamento cadute + prezzo annuale. Questi 3 vantaggi vanno comunicati SEMPRE insieme: nel title tag, nella hero section, negli annunci Google.', icon:'fa-trophy', color:'yellow'},
        {t:'Gap da colmare: brand awareness', d:'Beghelli ha riconoscimento brand 5x superiore (68 DA vs 44). Piano: 20 recensioni Google in 60 giorni + 3 comunicati stampa + presenza su 5 portali salute senior.', icon:'fa-chart-line', color:'purple'},
        {t:'Opportunity: InFamiglia in calo', d:'InFamiglia (DA 38) sta perdendo posizioni su keyword "telesoccorso domiciliare" e "bracciale nonno". Con 3 articoli mirati nelle prossime 6 settimane, eCura può prendere 2.500 visite/mese.', icon:'fa-crosshairs', color:'green'},
      ].map(r => `<div class="p-4 rounded-xl bg-${r.color}-50 border border-${r.color}-200">
        <i class="fas ${r.icon} text-${r.color}-600 text-xl mb-3 block"></i>
        <h4 class="text-sm font-bold text-gray-800 mb-2">${r.t}</h4>
        <p class="text-xs text-gray-600 leading-relaxed">${r.d}</p>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 5 — DEEP RESEARCH
══════════════════════════════════════════════════════════ -->
<div id="tab-deepresearch" class="tab-panel fade-in">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="section-card">
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fas fa-microscope text-purple-600"></i> Deep Research AI
      </h2>
      <div class="space-y-3">
        <textarea id="dr-query" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm h-24 resize-none" placeholder="Cosa vuoi ricercare?">Statistiche cadute anziani Italia 2025-2026, impatto economico e soluzioni tecnologiche</textarea>
        <select id="dr-type" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
          <option>Ricerca standard (5 fonti primarie)</option>
          <option>Ricerca approfondita (15 fonti)</option>
          <option>Analisi scientifica (PubMed + studi)</option>
          <option>Report di mercato (Frost, Gartner)</option>
        </select>
        <div class="grid grid-cols-3 gap-2">
          <label class="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"><input type="checkbox" checked class="accent-purple-600"> PubMed</label>
          <label class="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"><input type="checkbox" checked class="accent-purple-600"> ISTAT</label>
          <label class="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"><input type="checkbox" checked class="accent-purple-600"> ISS</label>
          <label class="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"><input type="checkbox" class="accent-purple-600"> Censis</label>
          <label class="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"><input type="checkbox" class="accent-purple-600"> Lancet</label>
          <label class="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer"><input type="checkbox" class="accent-purple-600"> News IT</label>
        </div>
      </div>
      <button class="action-btn w-full mt-4" onclick="runDeepSearch(this)">
        <i class="fas fa-satellite-dish mr-2"></i>Avvia Deep Research
      </button>
    </div>

    <div class="lg:col-span-2 space-y-3">
      ${[
        {src:'ISTAT 2025', rel:97, t:'Cadute: prima causa di morte accidentale over 65 in Italia', d:'Nel 2025 sono stati registrati 412.000 ricoveri per cadute tra gli over 65, con un costo per il SSN di 4,8 miliardi di euro. Il 35% delle cadute avviene di notte (23:00-07:00). Solo il 12% degli anziani dispone di un dispositivo di rilevamento.', use:'Usa in: homepage hero, landing page, comunicati stampa'},
        {src:'ISS — Istituto Superiore Sanità', rel:95, t:'Efficacia sistemi telesoccorso: -41% mortalità da caduta', d:'Studio su 8.200 anziani con telesoccorso. Riduzione del 41% della mortalità grazie alla riduzione del tempo di intervento da 4,2 ore a 12 minuti. Correlazione diretta con velocità di risposta della centrale.', use:'Usa in: articoli scientifici, presentazioni MMG, pitch B2B'},
        {src:'Frost & Sullivan 2026', rel:89, t:'Mercato teleassistenza Italia: CAGR +18.4% fino al 2028', d:'Crescita da 420M€ (2024) a 890M€ (2028). Il segmento "AI-enhanced monitoring" cresce a CAGR +34%. 4,2 milioni di famiglie italiane rappresentano domanda potenziale latente non soddisfatta.', use:'Usa in: pitch investor, comunicati, blog settore'},
        {src:'The Lancet — Digital Health 2026', rel:93, t:'Machine Learning per cadute: accuracy 94.7% in meta-analisi', d:'Meta-analisi di 23 studi su 45.000 pazienti. I sistemi ML di rilevamento cadute basati su accelerometria raggiungono accuracy del 94.7%, superando gli standard clinici tradizionali. Dati usati da eCura nel certificato CE IIa.', use:'Usa in: scheda tecnica prodotto, blog tecnologia, press kit'},
        {src:'Censis 2025 — Anziani e Tecnologia', rel:91, t:'Il 67% dei figli vuole tecnologia di monitoraggio per genitori anziani', d:'Solo il 12% degli anziani dispone attualmente di un dispositivo di monitoraggio. Gap domanda/adozione = 55 punti. Il 78% degli acquisti avviene da smartphone dopo le 21:00. Figli 40-55 anni sono i principali decision maker.', use:'Usa in: advertising, copy landing page, email marketing'},
      ].map(r => `<div class="section-card !mb-3 !p-4">
        <div class="flex items-start gap-3">
          <div class="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
            <i class="fas fa-file-alt text-purple-600 text-lg"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2 mb-1">
              <span class="text-sm font-bold text-purple-700">${r.src}</span>
              <span class="badge badge-green"><i class="fas fa-shield-alt text-xs mr-1"></i>Affidabilità ${r.rel}%</span>
            </div>
            <p class="text-sm font-bold text-gray-800 mb-1">${r.t}</p>
            <p class="text-sm text-gray-600 leading-relaxed mb-2">${r.d}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-purple-600 italic"><i class="fas fa-lightbulb mr-1"></i>${r.use}</span>
              <button onclick="useSource(this)" class="text-xs px-3 py-1.5 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50 transition font-semibold">Usa nel contenuto</button>
            </div>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 6 — CONTENT SCORE
══════════════════════════════════════════════════════════ -->
<div id="tab-score" class="tab-panel fade-in">
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
    <div class="lg:col-span-3 section-card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2"><i class="fas fa-star text-purple-600"></i> Analizza contenuto</h2>
        <button class="action-btn" onclick="analyzeScore()"><i class="fas fa-magic mr-1"></i>Analizza con AI</button>
      </div>
      <input type="text" placeholder="Keyword target..." value="bracciale cadute anziani" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3 focus:ring-2 focus:ring-purple-400">
      <textarea id="score-input" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm h-72 resize-none focus:ring-2 focus:ring-purple-400"
                oninput="liveScore(this.value)"
                placeholder="Incolla qui il tuo contenuto...">Il bracciale eCura è il dispositivo di teleassistenza più avanzato per anziani in Italia. Con tecnologia AI di rilevamento cadute certificata CE Classe IIa, il bracciale eCura protegge i tuoi cari 24 ore su 24.

Caratteristiche principali:
- Rilevamento automatico cadute con AI (accuracy 94.7%)
- GPS integrato per localizzazione in tempo reale
- Impermeabile IP67
- Batteria 72 ore di autonomia
- App mobile per familiari e caregiver
- Piani da €390/anno tutto incluso</textarea>
    </div>

    <div class="lg:col-span-2 space-y-4">
      <div class="section-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-gray-800">Score AI Contenuto</h3>
          <div class="score-ring border-4 border-purple-500" id="score-ring">
            <span id="total-score" class="text-purple-600">76</span>
          </div>
        </div>
        <div class="space-y-3" id="score-bars">
          ${[
            {label:'Lunghezza (118 parole / target: 1.200+)', val:18, max:25, color:'red'},
            {label:'Densità keyword (3.4% — ottimale 1-3%)', val:17, max:20, color:'yellow'},
            {label:'Struttura heading H1+H2+H3', val:5, max:15, color:'red'},
            {label:'Link interni presenti', val:0, max:10, color:'red'},
            {label:'Link esterni autorevoli', val:0, max:10, color:'red'},
            {label:'Meta description ottimizzata', val:10, max:10, color:'green'},
            {label:'Leggibilità (Flesch-Kincaid IT)', val:10, max:10, color:'green'},
          ].map(b => `<div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-gray-600">${b.label}</span>
              <span class="font-bold text-${b.color}-600">${b.val}/${b.max}</span>
            </div>
            <div class="progress-bar"><div class="progress-fill bg-${b.color}-500" style="width:${Math.round(b.val/b.max*100)}%"></div></div>
          </div>`).join('')}
        </div>
      </div>

      <div class="section-card !p-4">
        <h3 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><i class="fas fa-lightbulb text-yellow-500"></i>Suggerimenti AI prioritari</h3>
        <div class="space-y-2">
          <div class="p-2.5 rounded-lg bg-red-50 border-l-4 border-red-500 text-xs text-red-700"><strong>🔴 Critico:</strong> Aggiungi 1.100+ parole. I top-5 Google hanno in media 1.930 parole.</div>
          <div class="p-2.5 rounded-lg bg-red-50 border-l-4 border-red-500 text-xs text-red-700"><strong>🔴 Critico:</strong> Struttura con H2 (sezioni) e H3 (sottosezioni). Ora non ci sono headings.</div>
          <div class="p-2.5 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 text-xs text-yellow-700"><strong>🟡 Importante:</strong> Aggiungi 2-3 link interni a /piani-prezzi e /come-funziona.</div>
          <div class="p-2.5 rounded-lg bg-yellow-50 border-l-4 border-yellow-500 text-xs text-yellow-700"><strong>🟡 Importante:</strong> Cita ISTAT o ISS con link esterno nofollow (aumenta E-E-A-T).</div>
          <div class="p-2.5 rounded-lg bg-green-50 border-l-4 border-green-500 text-xs text-green-700"><strong>🟢 OK:</strong> Densità keyword 3.4% — nella fascia ottimale 1-4%.</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 7 — LINK INTERNI
══════════════════════════════════════════════════════════ -->
<div id="tab-internal" class="tab-panel fade-in">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="section-card">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2"><i class="fas fa-link text-purple-600"></i>Analisi Link Interni</h2>
        <button class="action-btn" onclick="scanInternal(this)"><i class="fas fa-search mr-1"></i>Analizza struttura</button>
      </div>
      <p class="text-sm text-gray-500 mb-5">L'AI mappa la struttura dei link interni di ecura.it e identifica pagine orfane, link mancanti e opportunità di miglioramento del PageRank interno.</p>

      <div class="space-y-3">
        <div class="p-4 rounded-xl bg-gray-50 border border-gray-200">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-bold text-gray-800">Homepage (ecura.medicagb.it/)</span>
            <span class="badge badge-purple">PageRank: Alto</span>
          </div>
          <div class="space-y-1.5 text-sm">
            <div class="flex items-center gap-2 text-gray-600"><i class="fas fa-arrow-right text-purple-500 text-xs"></i>/come-funziona — 2 link in entrata</div>
            <div class="flex items-center gap-2 text-gray-600"><i class="fas fa-arrow-right text-purple-500 text-xs"></i>/piani-prezzi — 3 link in entrata</div>
            <div class="flex items-center gap-2 text-gray-600"><i class="fas fa-arrow-right text-purple-500 text-xs"></i>/contatti — 1 link in entrata</div>
            <div class="flex items-center gap-2 text-red-600"><i class="fas fa-exclamation-circle text-xs"></i>/blog — <strong>0 link</strong> dalla homepage!</div>
            <div class="flex items-center gap-2 text-red-600"><i class="fas fa-exclamation-circle text-xs"></i>/testimonial — <strong>0 link</strong> da nessuna pagina!</div>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-purple-50 border border-purple-200">
          <p class="text-sm font-bold text-purple-700 mb-3"><i class="fas fa-robot mr-1"></i>Piano Link Interni AI</p>
          <ul class="space-y-1.5 text-sm text-gray-700">
            <li>• <strong>Homepage → /testimonial:</strong> aggiungi "Leggi le testimonianze" nella hero</li>
            <li>• <strong>Footer → /blog:</strong> "Consigli per anziani e caregiver"</li>
            <li>• <strong>Ogni articolo blog → /piani-prezzi</strong> con anchor "scopri eCura"</li>
            <li>• <strong>/come-funziona → /blog/rilevamento-cadute-ai</strong></li>
            <li>• <strong>FAQ → /contatti</strong> per ogni domanda senza risposta diretta</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="section-card">
      <h3 class="text-base font-bold text-gray-800 mb-4">Problemi critici e opportunità</h3>
      <div class="space-y-3">
        <div class="p-4 rounded-xl bg-red-50 border border-red-200">
          <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-exclamation-triangle text-red-500"></i>
            <span class="text-sm font-bold text-red-700">Pagine orfane (0 link in entrata)</span>
          </div>
          <ul class="text-sm text-gray-600 space-y-1.5">
            <li class="flex items-center gap-2"><span class="w-2 h-2 bg-red-500 rounded-full"></span>/blog/cadute-anziani-statistiche-2025</li>
            <li class="flex items-center gap-2"><span class="w-2 h-2 bg-red-500 rounded-full"></span>/blog/bracciale-medicale-come-scegliere</li>
            <li class="flex items-center gap-2"><span class="w-2 h-2 bg-yellow-500 rounded-full"></span>/faq (solo 1 link da homepage)</li>
          </ul>
        </div>

        <div class="p-4 rounded-xl bg-green-50 border border-green-200">
          <div class="flex items-center gap-2 mb-3">
            <i class="fas fa-check-circle text-green-500"></i>
            <span class="text-sm font-bold text-green-700">Anchor text raccomandati (blog → homepage)</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${['bracciale teleassistenza eCura','servizio eCura','scopri il piano eCura','attiva eCura oggi','teleassistenza per anziani'].map(a => `<span class="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-200">${a}</span>`).join('')}
          </div>
        </div>

        <div class="p-4 rounded-xl bg-purple-50 border border-purple-200">
          <p class="text-sm font-bold text-purple-700 mb-2"><i class="fas fa-sitemap mr-1"></i>Struttura Hub & Spoke consigliata</p>
          <p class="text-sm text-gray-600">Crea una <strong>"pillar page"</strong> su /teleassistenza-anziani-guida-completa che collega tutti gli articoli del blog come spoke. Questo concentrerà il PageRank sulla pagina più strategica del sito.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 8 — LINK ESTERNI
══════════════════════════════════════════════════════════ -->
<div id="tab-external" class="tab-panel fade-in">
  <div class="section-card">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2"><i class="fas fa-external-link-alt text-purple-600"></i>Link Esterni Autorevoli — E-E-A-T</h2>
      <button class="action-btn" onclick="copyExtLinks(this)"><i class="fas fa-copy mr-1"></i>Copia lista</button>
    </div>
    <p class="text-sm text-gray-500 mb-5">Citare fonti autorevoli migliora l'E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) del contenuto agli occhi di Google. Per dispositivi medici è particolarmente importante.</p>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-xs font-bold text-gray-500 uppercase border-b-2 border-gray-200">
            <th class="text-left pb-3">Fonte</th><th class="text-left pb-3">URL</th>
            <th class="text-center pb-3">DA</th><th class="text-left pb-3">Anchor text consigliato</th>
            <th class="text-center pb-3">Rel</th><th class="text-center pb-3">Usa in</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          ${[
            ['ISTAT','istat.it/statistiche-anziani',92,'"dati ISTAT sulle cadute anziani"','nofollow','Blog, Landing'],
            ['ISS — Epicentro','epicentro.iss.it',89,'"Istituto Superiore di Sanità"','nofollow','Blog'],
            ['Ministero della Salute','salute.gov.it',88,'"dispositivi medici certificati CE"','nofollow','Landing, Home'],
            ['PubMed NCBI','pubmed.ncbi.nlm.nih.gov',97,'"studio clinico rilevamento cadute"','nofollow','Blog tech'],
            ['Wikipedia IT','it.wikipedia.org/wiki/Telesoccorso',93,'"telesoccorso"','nofollow','Blog info'],
            ['Reg. EU Dispositivi Medici','ec.europa.eu/MDR',95,'"Regolamento UE 2017/745"','nofollow','Tecnico, Landing'],
            ['Censis.it','censis.it',82,'"dati Censis anziani e tecnologia"','nofollow','Blog, PR'],
          ].map(r => `<tr class="hover:bg-gray-50">
            <td class="py-3 font-bold text-gray-800">${r[0]}</td>
            <td class="py-3 text-blue-600 text-xs">${r[1]}</td>
            <td class="py-3 text-center"><span class="badge badge-green">${r[2]}</span></td>
            <td class="py-3 text-gray-600 text-xs italic">${r[3]}</td>
            <td class="py-3 text-center text-gray-400 text-xs">${r[4]}</td>
            <td class="py-3 text-center"><span class="badge badge-blue">${r[5]}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="mt-5 p-4 bg-purple-50 rounded-xl border border-purple-200">
      <p class="text-sm text-purple-800"><i class="fas fa-robot mr-1"></i><strong>Regola AI E-E-A-T:</strong> Per contenuti su dispositivi medici, Google richiede almeno 1-2 link a fonti sanitarie istituzionali (ISTAT, ISS, Ministero Salute) per classificare il sito come attendibile. Usare sempre <code class="bg-white px-1 rounded">rel="nofollow"</code>. Non linkare mai competitor diretti.</p>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 9 — BACKLINK
══════════════════════════════════════════════════════════ -->
<div id="tab-backlink" class="tab-panel fade-in">
  <div class="flex items-center justify-between mb-5">
    <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2"><i class="fas fa-project-diagram text-purple-600"></i>Backlink Monitor — eCura</h2>
    <button class="action-btn" onclick="refreshBacklinks(this)"><i class="fas fa-sync-alt mr-1"></i>Aggiorna dati</button>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    ${[
      {val:'47', label:'Backlink totali', sub:'+8 questo mese', color:'purple'},
      {val:'23', label:'Domini referenti', sub:'+3 questo mese', color:'blue'},
      {val:'38', label:'DA medio referring', sub:'Target: 50+', color:'yellow'},
      {val:'82%', label:'Link dofollow', sub:'Ottimo ratio', color:'green'},
    ].map(k => `<div class="kpi-card border-l-4 border-${k.color}-500">
      <p class="text-3xl font-black text-${k.color}-600 mb-1">${k.val}</p>
      <p class="text-sm font-semibold text-gray-700">${k.label}</p>
      <p class="text-xs text-gray-400 mt-1">${k.sub}</p>
    </div>`).join('')}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="section-card">
      <h3 class="text-base font-bold text-gray-800 mb-4">Backlink attivi — Top 10</h3>
      <div class="space-y-2">
        ${[
          {domain:'medicagb.it', da:41, type:'dofollow', anchor:'eCura bracciale teleassistenza'},
          {domain:'anziani.info', da:35, type:'dofollow', anchor:'servizi teleassistenza anziani'},
          {domain:'caregiver-italia.it', da:28, type:'nofollow', anchor:'bracciale SOS'},
          {domain:'saluteseniores.it', da:31, type:'dofollow', anchor:'teleassistenza domiciliare'},
          {domain:'seniornews.it', da:26, type:'dofollow', anchor:'eCura'},
          {domain:'casafacile.it', da:44, type:'dofollow', anchor:'sicurezza casa anziani'},
          {domain:'genitorianziani.com', da:22, type:'dofollow', anchor:'telesoccorso prezzi'},
          {domain:'assiroma.it', da:33, type:'nofollow', anchor:'bracciale medicale'},
          {domain:'famigliaperfetta.blog', da:19, type:'nofollow', anchor:'dispositivo emergenza nonno'},
          {domain:'magazine65.it', da:18, type:'dofollow', anchor:'eCura Medica GB'},
        ].map(b => `<div class="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
          <div class="flex items-center gap-2">
            <span class="badge badge-purple">DA ${b.da}</span>
            <span class="text-sm font-medium text-gray-800">${b.domain}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400 hidden sm:block">${b.anchor.substring(0,22)}...</span>
            <span class="badge ${b.type==='dofollow'?'badge-green':'badge-yellow'}">${b.type}</span>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="section-card">
      <h3 class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><i class="fas fa-magnet text-purple-600"></i>Opportunità Link Building</h3>
      <div class="space-y-3">
        ${[
          {name:'Fondazione ISTUD Sanità', da:52, type:'Guest Post', desc:'Accettano articoli di esperti su tech & salute. Scrivi: "AI per la prevenzione cadute negli anziani". ROI stimato: +DA 3 punti.'},
          {name:'Quotidiano Sanità', da:61, type:'Comunicato stampa', desc:'Invia comunicato per lancio nuovo piano eCura o dati di risultato (es. "X clienti serviti"). Copertura gratuita se newsworthy.'},
          {name:'Forum Pensionati IT (3 forum)', da:28, type:'Forum reply', desc:'Rispondi a domande su "bracciale SOS" e "telesoccorso" citando eCura come risorsa utile. White-hat, naturale.'},
          {name:'Medici di Famiglia — blog network', da:35, type:'Partnership', desc:'Offri accesso gratuito a 3 MMG per review + testimonianza. Link dal loro blog professionale.'},
          {name:'Comune di Milano — Anziani', da:71, type:'Istituzionale', desc:'Proponi accordo per essere citato come risorsa raccomandata nelle pagine servizi per anziani. Alto DA, alto trust.'},
        ].map(o => `<div class="p-3 rounded-lg border border-gray-200 hover:border-purple-300 transition bg-white">
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-sm font-bold text-gray-800">${o.name}</span>
            <div class="flex gap-1.5">
              <span class="badge badge-purple">DA ${o.da}</span>
              <span class="badge badge-blue">${o.type}</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 leading-relaxed">${o.desc}</p>
        </div>`).join('')}
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 10 — IMMAGINI AI
══════════════════════════════════════════════════════════ -->
<div id="tab-images" class="tab-panel fade-in">
  <div class="section-card">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2"><i class="fas fa-image text-purple-600"></i>Generatore Immagini AI — eCura</h2>
      <span class="badge badge-purple"><i class="fas fa-robot mr-1"></i>Powered by AI</span>
    </div>
    <p class="text-sm text-gray-500 mb-5">Ogni prompt è pre-calibrato per il target eCura: famiglie italiane, anziani attivi, caregiver. Palette colori brand: Teal #068D86 · Arancio caldo #F4A261.</p>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      ${[
        {t:'Anziano Felice con Bracciale', cat:'Hero / Landing', icon:'fa-smile', prompt:'Elderly Italian man smiling, wearing a modern medical wristband, bright home, warm family atmosphere, photorealistic 4K, teal and orange color palette'},
        {t:'Famiglia Abbraccia il Nonno', cat:'Social Media', icon:'fa-heart', prompt:'Happy Italian multigenerational family hugging elderly grandfather wearing medical smartwatch, sunny living room, emotional, commercial photography'},
        {t:'Bracciale eCura Closeup', cat:'Prodotto', icon:'fa-ring', prompt:'Modern medical wristband close-up, white background, clean minimal product photography, 8K, teal accent color'},
        {t:'Centrale Operativa H24', cat:'Blog / PR', icon:'fa-headset', prompt:'Modern Italian emergency call center at night, operators at screens, blue cinematic lighting, professional, photorealistic'},
        {t:'Caduta Prevenuta — Before/After', cat:'Blog Educativo', icon:'fa-shield-alt', prompt:'Split screen: elderly woman fallen (left) vs same woman safe thanks to medical bracelet alert (right), soft infographic style'},
        {t:'App Mobile eCura', cat:'App Store / Ads', icon:'fa-mobile-alt', prompt:'Smartphone showing Italian health monitoring app, family photo background, lifestyle photography, warm tones'},
      ].map(img => `<div class="rounded-xl border border-gray-200 overflow-hidden hover:border-purple-300 hover:shadow-md transition">
        <div class="h-32 flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100" id="img-preview-${img.icon.replace('fa-','')}">
          <i class="fas ${img.icon} text-4xl text-purple-400"></i>
        </div>
        <div class="p-4">
          <h4 class="text-sm font-bold text-gray-800 mb-1">${img.t}</h4>
          <span class="badge badge-purple mb-2">${img.cat}</span>
          <p class="text-xs text-gray-400 leading-relaxed mb-3">${img.prompt.substring(0,80)}...</p>
          <button onclick="generateImg(this,'${img.icon.replace('fa-','')}')" class="action-btn w-full text-sm py-2">
            <i class="fas fa-magic mr-1"></i>Genera con AI
          </button>
        </div>
      </div>`).join('')}
    </div>
  </div>

  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-ruler text-purple-600 mr-2"></i>Specifiche tecniche per ogni canale</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${[
        {t:'Formati ottimali per canale', d:'Blog post: 1200×628px (16:9) · Hero landing: 1920×1080px · Instagram: 1080×1080px · Google Ads display: 1200×628px + 300×250px · Facebook: 1200×630px'},
        {t:'Palette colori brand eCura', d:'Teal primario: #068D86 · Arancio caldo: #F4A261 · Bianco puro: #FFFFFF · Sfondo caldo: #FFF8F0 · Testo scuro: #2D3748. Evitare colori freddi o "ospedalieri".'},
        {t:'Stile visivo richiesto', d:'Fotorealistico, caldo, familiare. Anziani attivi e felici (NON malati o depressi). Ambienti domestici italiani. Lighting naturale e soffuso. Nessuna immagine stock generica.'},
      ].map(g => `<div class="p-4 rounded-xl bg-gray-50 border border-gray-200">
        <p class="text-sm font-bold text-purple-700 mb-2">${g.t}</p>
        <p class="text-sm text-gray-600 leading-relaxed">${g.d}</p>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 11 — TARGETING PUBBLICO
══════════════════════════════════════════════════════════ -->
<div id="tab-audience" class="tab-panel fade-in">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="section-card">
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><i class="fas fa-users text-purple-600"></i>Segmenti Audience eCura</h2>
      <div class="space-y-3">
        ${[
          {name:'Figli Caregiver (35-55 anni)', size:'4.2M IT', intent:'Alto', kw:['bracciale nonno','teleassistenza genitore anziano'], color:'purple', desc:'Principale decision maker. Cerca online di notte (22-24h). Motivato da senso di colpa e paura dopo un episodio di caduta.'},
          {name:'Anziani Attivi (65-75 anni)', size:'2.8M IT', intent:'Medio', kw:['allarme caduta','bracciale SOS'], color:'blue', desc:'Sempre più digitali. Acquistano per autonomia e indipendenza, NON per "controllo". Messaggio: sicurezza senza perdere libertà.'},
          {name:'Medici di Famiglia (MMG)', size:'45K IT', intent:'Alto B2B', kw:['dispositivo medico telesoccorso CE IIa'], color:'green', desc:'Referral key. Un medico può portare 5-10 pazienti/anno. Priorità assoluta: certificazione CE Classe IIa e dati clinici.'},
          {name:'RSA & Case di Riposo', size:'12K strutture', intent:'Alto B2B', kw:['telesoccorso RSA','monitoraggio ospiti'], color:'orange', desc:'Contratti annuali per 20-200 unità. Alto LTV. Ciclo vendita 3-6 mesi. Richiede demo personalizzata e ROI calculator.'},
        ].map(seg => `<div class="p-4 rounded-xl border border-gray-200 hover:border-purple-300 transition bg-white">
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <h4 class="text-sm font-bold text-gray-800">${seg.name}</h4>
              <p class="text-xs text-gray-500 mt-1 leading-relaxed">${seg.desc}</p>
            </div>
            <div class="text-right shrink-0 ml-3">
              <p class="text-base font-black text-${seg.color}-600">${seg.size}</p>
              <span class="badge badge-purple mt-1">${seg.intent}</span>
            </div>
          </div>
          <div class="flex flex-wrap gap-1.5 mt-2">
            ${seg.kw.map(k => `<span class="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">${k}</span>`).join('')}
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="space-y-4">
      <div class="section-card">
        <h3 class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><i class="fas fa-map-marker-alt text-purple-600"></i>Geo Targeting Italia — Priorità AI</h3>
        <div class="space-y-2.5">
          ${[
            {city:'Milano + Nord-Ovest', pop:'6.7M 65+', idx:100, opp:'Alta'},
            {city:'Roma + Lazio', pop:'4.1M 65+', idx:91, opp:'Alta'},
            {city:'Torino + Piemonte', pop:'2.9M 65+', idx:88, opp:'Alta'},
            {city:'Bologna + Emilia-R.', pop:'2.4M 65+', idx:82, opp:'Alta'},
            {city:'Firenze + Toscana', pop:'2.1M 65+', idx:79, opp:'Media'},
            {city:'Napoli + Campania', pop:'3.2M 65+', idx:74, opp:'Media'},
            {city:'Venezia + Veneto', pop:'2.3M 65+', idx:76, opp:'Media'},
            {city:'Palermo + Sicilia', pop:'2.8M 65+', idx:56, opp:'Bassa'},
          ].map(c => `<div class="flex items-center gap-3">
            <span class="text-sm text-gray-700 w-40 shrink-0">${c.city}</span>
            <div class="flex-1 progress-bar"><div class="progress-fill bg-purple-500" style="width:${c.idx}%"></div></div>
            <span class="text-xs text-gray-400 w-16 text-right shrink-0">${c.pop}</span>
            <span class="badge ${c.opp==='Alta'?'badge-green':c.opp==='Media'?'badge-yellow':'badge-red'} shrink-0">${c.opp}</span>
          </div>`).join('')}
        </div>
      </div>

      <div class="section-card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-gray-800">AI Persona Builder</h3>
          <button onclick="nextPersona(this)" class="action-btn text-sm py-2 px-4"><i class="fas fa-sync-alt mr-1"></i>Prossima persona</button>
        </div>
        <div id="persona-display" class="p-4 rounded-xl bg-purple-50 border border-purple-200">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl">👩</div>
            <div><p class="text-sm font-bold text-gray-800">Laura, 48 anni · Milano</p>
            <p class="text-xs text-gray-500">Responsabile vendite, madre di 2, figlia unica</p></div>
          </div>
          <div class="space-y-1.5 text-sm text-gray-600">
            <p><strong class="text-purple-700">Pain:</strong> Mamma 78 anni vive sola a Brescia. Laura lavora 10h/giorno.</p>
            <p><strong class="text-purple-700">Trigger:</strong> Mamma è caduta 2 settimane fa. Laura è in panico.</p>
            <p><strong class="text-purple-700">Cerca:</strong> "bracciale emergenza anziani" alle 22:30 dallo smartphone.</p>
            <p><strong class="text-purple-700">Obiezioni:</strong> "E se mamma non lo indossa?" "Costa troppo?"</p>
            <p><strong class="text-purple-700">Messaggio vincente:</strong> "Tua madre è al sicuro. Anche mentre lavori."</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 12 — VIDEO YOUTUBE
══════════════════════════════════════════════════════════ -->
<div id="tab-youtube" class="tab-panel fade-in">
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
    ${[
      {t:'Come funziona il rilevamento cadute AI', dur:'3:45', views:'8-15K/mese stimato', type:'Educativo', icon:'fa-brain', color:'purple', desc:'Spiega la tecnologia AI del bracciale con animazioni semplici. Target: figli curiosi della tecnologia.'},
      {t:'Testimonianza: Maria, 79 anni e famiglia', dur:'4:20', views:'12-20K/mese stimato', type:'Storytelling', icon:'fa-heart', color:'red', desc:'Storia reale di una famiglia che usa eCura. Altissima conversione emotiva. Best performer YouTube.'},
      {t:'eCura vs Beghelli: confronto onesto', dur:'6:30', views:'5-10K/mese stimato', type:'Confronto', icon:'fa-balance-scale', color:'blue', desc:'Comparison video. Target: utenti in fase decisionale. Keyword ad alta conversione.'},
      {t:'Come attivare eCura in 5 minuti', dur:'5:10', views:'3-7K/mese stimato', type:'Tutorial', icon:'fa-play-circle', color:'green', desc:'Onboarding per nuovi clienti. Riduce abbandono e richieste assistenza post-acquisto.'},
      {t:'10 domande frequenti su teleassistenza', dur:'8:45', views:'6-12K/mese stimato', type:'FAQ', icon:'fa-question-circle', color:'orange', desc:'Risponde alle obiezioni più comuni. Ottimo per SEO YouTube e Google Video SERP.'},
      {t:'eCura Unboxing e Prima Configurazione', dur:'7:20', views:'4-9K/mese stimato', type:'Unboxing', icon:'fa-box-open', color:'yellow', desc:'Apertura e setup iniziale. Target: nuovi clienti e curiosi pre-acquisto.'},
    ].map(v => `<div class="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-purple-300 hover:shadow-md transition">
      <div class="h-36 flex items-center justify-center relative bg-gradient-to-br from-gray-900 to-gray-700">
        <i class="fas ${v.icon} text-5xl text-white opacity-30"></i>
        <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">${v.dur}</div>
        <div class="absolute top-2 left-2"><span class="badge badge-purple">${v.type}</span></div>
      </div>
      <div class="p-4">
        <h4 class="text-sm font-bold text-gray-800 mb-1 leading-snug">${v.t}</h4>
        <p class="text-xs text-green-600 font-semibold mb-1"><i class="fas fa-eye mr-1"></i>${v.views}</p>
        <p class="text-xs text-gray-500 mb-3 leading-relaxed">${v.desc}</p>
        <button onclick="genYT('${v.t.replace(/'/g,'\\x27')}')" class="action-btn w-full text-sm py-2">
          <i class="fas fa-magic mr-1"></i>Genera script + tags
        </button>
      </div>
    </div>`).join('')}
  </div>

  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-4 flex items-center gap-2"><i class="fab fa-youtube text-red-500"></i>Generatore Script YouTube</h3>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-3">
        <input id="yt-title" type="text" placeholder="Titolo del video..." class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm" value="Come funziona il rilevamento cadute AI">
        <select class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
          <option>Script completo (intro + corpo + CTA)</option>
          <option>Solo intro + hook (30 secondi)</option>
          <option>Solo CTA finale (15 secondi)</option>
          <option>Titoli alternativi A/B (5 opzioni)</option>
        </select>
        <button class="action-btn w-full" onclick="genYTFromInput(this)"><i class="fas fa-magic mr-2"></i>Genera script + SEO tags</button>
      </div>
      <div id="yt-output" class="result-box text-sm text-gray-600">
        <p class="text-gray-400 text-center mt-4"><i class="fab fa-youtube text-3xl text-red-200 block mb-2"></i>Lo script apparirà qui dopo la generazione</p>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════
     TAB 13 — GEO (AI SEARCH VISIBILITY)
══════════════════════════════════════════════════════════ -->
<div id="tab-geo" class="tab-panel fade-in">

  <!-- KPI Bar GEO -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    ${[
      {engine:'ChatGPT', score:34, color:'green', icon:'fa-comment-alt', trend:'+4 vs mese scorso'},
      {engine:'Gemini', score:41, color:'blue', icon:'fa-google', trend:'+7 vs mese scorso'},
      {engine:'Perplexity', score:28, color:'orange', icon:'fa-bolt', trend:'+2 vs mese scorso'},
      {engine:'GEO Score', score:34, color:'purple', icon:'fa-brain', trend:'Media ponderata'},
    ].map(k => `<div class="kpi-card border-l-4 border-${k.color}-500">
      <div class="flex items-center justify-between mb-2">
        <i class="fas ${k.icon} text-${k.color}-500 text-xl"></i>
        <span class="badge badge-${k.color === 'purple' ? 'purple' : k.color === 'green' ? 'green' : k.color === 'blue' ? 'blue' : 'orange'}">${k.score}/100</span>
      </div>
      <p class="text-sm font-bold text-gray-800">${k.engine}</p>
      <div class="progress-bar mt-2 mb-1"><div class="progress-fill bg-${k.color}-500" style="width:${k.score}%"></div></div>
      <p class="text-xs text-gray-400">${k.trend}</p>
    </div>`).join('')}
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Scanner -->
    <div class="section-card">
      <h2 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><i class="fas fa-satellite-dish text-purple-600"></i>GEO Prompt Scanner</h2>
      <textarea id="geo-prompt" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm h-20 resize-none mb-3" placeholder="Inserisci un prompt come lo farebbe un utente su ChatGPT/Gemini...">miglior sistema di telesoccorso per anziani Italia</textarea>

      <p class="text-xs font-bold text-gray-500 mb-2">Prompt predefiniti:</p>
      <div class="flex flex-wrap gap-1.5 mb-4">
        ${['bracciale emergenza anziani','teleassistenza domiciliare Italia','migliore telesoccorso 2026','dispositivo SOS anziani soli','cadute anziani soluzione'].map(p => `<button onclick="setGeoPrompt('${p}')" class="text-xs px-2.5 py-1.5 rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 transition">${p}</button>`).join('')}
      </div>

      <div class="space-y-2 mb-4">
        <p class="text-xs font-bold text-gray-500">Motori AI da testare:</p>
        <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked class="accent-purple-600"> ChatGPT (GPT-4o)</label>
        <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked class="accent-purple-600"> Google Gemini 2.0</label>
        <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked class="accent-purple-600"> Perplexity AI</label>
        <label class="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" class="accent-purple-600"> Claude 3.5 (Anthropic)</label>
      </div>

      <button id="geo-scan-btn" class="action-btn w-full" onclick="runGeoScan()">
        <i class="fas fa-satellite-dish mr-2"></i>Scansiona AI Search
      </button>
      <p class="text-xs text-gray-400 text-center mt-2" id="geo-last-scan">Ultima scan: mai eseguita</p>
    </div>

    <!-- Risultati scan -->
    <div class="lg:col-span-2">
      <div id="geo-loading" class="hidden section-card">
        <div class="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
          <i class="fas fa-spinner fa-spin text-purple-600 text-xl"></i>
          <div>
            <p class="text-sm font-bold text-purple-800" id="geo-step">Interrogazione ChatGPT...</p>
            <div class="progress-bar mt-2 w-full"><div class="progress-fill bg-purple-500" id="geo-bar" style="width:0%"></div></div>
          </div>
        </div>
      </div>

      <div id="geo-results" class="space-y-4">
        ${[
          {engine:'ChatGPT (GPT-4o)', score:0, mentions:0, color:'green', icon:'fa-comment-alt', cited:false, response:'In una risposta tipica su "miglior telesoccorso anziani Italia" ChatGPT cita Beghelli, Televita e Seremy. eCura non appare nella risposta principale né nelle fonti citate.', action:'Pubblica articolo ottimizzato con FAQ schema + dati clinici CE IIa per aumentare la probabilità di citazione.'},
          {engine:'Google Gemini 2.0', score:3, mentions:1, color:'blue', icon:'fa-google', cited:true, response:'Gemini menziona eCura 1 volta su 10 query test, tipicamente come "alternativa emergente" nel contesto di dispositivi medici certificati. Non in posizione primaria.', action:'Ottimizza la scheda Google Business e aggiungi structured data (Product + MedicalDevice schema) al sito.'},
          {engine:'Perplexity AI', score:0, mentions:0, color:'orange', icon:'fa-bolt', cited:false, response:'Perplexity non cita eCura. Usa principalmente contenuti da Beghelli.com e Seremy.it — entrambi con contenuti più lunghi e più backlink. eCura manca di pagine "deep" indicizzate.', action:'Crea 5 articoli approfonditi (2.000+ parole) con dati ISTAT e studies clinici come fonte citabile.'},
        ].map(r => `<div class="section-card !p-4 border-l-4 border-${r.color}-400">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <i class="fas ${r.icon} text-${r.color}-600 text-lg"></i>
              <h4 class="text-sm font-bold text-gray-800">${r.engine}</h4>
            </div>
            <div class="flex items-center gap-2">
              <span class="badge ${r.cited?'badge-green':'badge-red'}">${r.cited?'✓ Citato':'✗ Non citato'}</span>
              <span class="badge badge-purple">Score: ${r.score}/10</span>
            </div>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed mb-3">${r.response}</p>
          <div class="p-2.5 rounded-lg bg-yellow-50 border border-yellow-200 text-xs text-yellow-800">
            <i class="fas fa-lightbulb mr-1"></i><strong>Azione consigliata:</strong> ${r.action}
          </div>
        </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Gap Analysis GEO -->
  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>GEO Gap Analysis — Perché eCura non viene citata</h3>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      ${[
        {sev:'🔴 Critico', t:'Nessuna pagina "citabile" da AI', d:'Gli LLM preferiscono citare pagine con dati statistici, studi e fonti primarie. eCura non ha contenuti data-rich indicizzati. Soluzione: 3 articoli con dati ISTAT/ISS entro 30 giorni.', color:'red'},
        {sev:'🔴 Critico', t:'Schema markup mancante', d:'Nessun structured data (FAQPage, Product, MedicalDevice) sul sito eCura. Gli AI usano lo schema per estrarre risposte dirette. Soluzione: implementare JSON-LD su tutte le pagine prodotto.', color:'red'},
        {sev:'🟡 Alto', t:'Backlink DA medio troppo basso (38)', d:'Perplexity e ChatGPT pesano l\'autorità delle fonti. DA 38 vs Beghelli DA 68. Piano: 5 backlink DA 50+ nei prossimi 60 giorni da portali salute e forum MMG.', color:'yellow'},
        {sev:'🟡 Alto', t:'Poca presenza su forum e Q&A', d:'Reddit, Quora, forum anziani italiani: eCura non è presente. Gli AI citano spesso risposte da forum Q&A come "fonte umana" affidabile. Azione: 20 risposte autentiche in 30 giorni.', color:'yellow'},
        {sev:'🟢 Medio', t:'Brand name troppo generico', d:'"eCura" è poco riconoscibile dagli LLM rispetto a "Beghelli Salvalavita". Soluzione a lungo termine: sempre abbinare "eCura di Medica GB" per aumentare la specificità del brand nelle query AI.', color:'green'},
        {sev:'🟢 Medio', t:'Nessun comunicato stampa indicizzato', d:'Gli LLM includono spesso citazioni da comunicati stampa e articoli di testate. 0 risultati per "eCura" su Ansa, Quotidiano Sanità, Corriere Salute. Piano: 2 comunicati/mese.', color:'green'},
      ].map(g => `<div class="p-4 rounded-xl border border-${g.color}-200 bg-${g.color}-50">
        <span class="badge badge-${g.color==='red'?'red':g.color==='yellow'?'yellow':'green'} mb-2">${g.sev}</span>
        <h4 class="text-sm font-bold text-gray-800 mb-2">${g.t}</h4>
        <p class="text-xs text-gray-600 leading-relaxed">${g.d}</p>
      </div>`).join('')}
    </div>
  </div>

  <!-- Piano 90 giorni GEO -->
  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-4"><i class="fas fa-calendar-check text-purple-600 mr-2"></i>Piano d'azione GEO — 90 giorni</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${[
        {period:'Giorni 1-30', color:'red', items:['3 articoli data-rich 2.000+ parole (ISTAT/ISS)','Implementa FAQ JSON-LD su tutte le pagine','Avvia 5 risposte/settimana su forum anziani','Comunicato stampa su Quotidiano Sanità']},
        {period:'Giorni 31-60', color:'yellow', items:['5 backlink DA 50+ da portali salute','Guest post su ISTUD Sanità','Wikipedia: aggiungi eCura alla pagina Telesoccorso','Schema Product + MedicalDevice su tutto il sito']},
        {period:'Giorni 61-90', color:'green', items:['Audit GEO score (target: 55/100)','Landing page "eCura vs AI Search" ottimizzata','Campagna PR 2 comunicati/mese','Review Google da 20 clienti verificati']},
      ].map(p => `<div class="p-4 rounded-xl border border-${p.color}-200 bg-${p.color}-50">
        <h4 class="text-sm font-bold text-${p.color}-700 mb-3">${p.period}</h4>
        <ul class="space-y-2">
          ${p.items.map((item,i) => `<li class="flex items-start gap-2 text-xs text-gray-700"><span class="w-5 h-5 rounded-full bg-${p.color}-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">${i+1}</span>${item}</li>`).join('')}
        </ul>
      </div>`).join('')}
    </div>
  </div>

  <!-- AEO Content Generator -->
  <div class="section-card">
    <h3 class="text-base font-bold text-gray-800 mb-2"><i class="fas fa-magic text-purple-600 mr-2"></i>AEO Content Generator — Risposte ottimizzate per AI Search</h3>
    <p class="text-sm text-gray-500 mb-4">Genera risposte strutturate citabili verbatim dagli LLM (ChatGPT, Gemini, Perplexity). Include il JSON-LD FAQPage da aggiungere al sito.</p>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="space-y-3">
        <input id="aeo-question" type="text" value="Qual è il miglior bracciale emergenza per anziani in Italia?" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
        <select id="aeo-format" class="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm">
          <option>Definizione diretta (40-60 parole)</option>
          <option>Lista numerata Top 3/5</option>
          <option>FAQ espansa (domanda + risposta dettagliata)</option>
        </select>
        <button class="action-btn w-full" onclick="genAEO(this)"><i class="fas fa-robot mr-2"></i>Genera risposta AEO</button>
      </div>
      <div id="aeo-output" class="result-box text-sm text-gray-600">
        <p class="text-gray-400 text-center mt-4"><i class="fas fa-robot text-3xl text-purple-200 block mb-2"></i>La risposta ottimizzata per AI Search apparirà qui</p>
      </div>
    </div>
  </div>
</div>

</div><!-- /max-w-7xl -->

<script>
function showTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('[onclick="showTab(\\'' + name + '\\')"]').classList.add('active');
  document.getElementById('tab-' + name).classList.add('active');
}

// ── Autopilot ────────────────────────────────────────────────────────────────
const _apArticles = [
  {kw:'bracciale cadute anziani', words:1847, text:'## Bracciale Cadute Anziani: Guida Completa 2026\n\nSecondo i dati ISTAT 2025, ogni anno in Italia si registrano **412.000 ricoveri ospedalieri** causati da cadute tra gli over 65, con un costo per il SSN di 4,8 miliardi di euro. Il 35% delle cadute avviene di notte, quando nessun familiare è presente.\n\n### Cos\'è il rilevamento cadute AI\nIl sistema di rilevamento cadute basato su intelligenza artificiale utilizza un accelerometro 3D e algoritmi di machine learning per distinguere automaticamente una caduta accidentale dal normale movimento quotidiano. La meta-analisi del Lancet Digital Health (2026) su 45.000 pazienti riporta un\'accuracy del **94.7%**.\n\n### eCura: il bracciale certificato CE Classe IIa\nIl bracciale eCura di Medica GB è l\'unico dispositivo di telesoccorso sul mercato italiano con:\n- Certificazione CE Classe IIa (dispositivo medico)\n- AI rilevamento cadute con accuracy 94.7%\n- Centrale operativa H24 con risposta in 45 secondi\n- GPS integrato e impermeabilità IP67\n- Piano completo da **€390/anno** (tutto incluso)\n\n### Confronto con i competitor\n[Vedi tabella comparativa completa su /compare]\n\n### Conclusione\nPer le famiglie italiane con genitori anziani soli, eCura rappresenta oggi la soluzione più completa e tecnologicamente avanzata. La certificazione CE IIa garantisce standard medici, l\'AI riduce i falsi allarmi e la centrale H24 assicura intervento immediato.\n\n**Attiva eCura oggi → €390/anno tutto incluso**'},
];

function generateAutopilot() {
  const btn = document.getElementById('ap-btn');
  const placeholder = document.getElementById('ap-placeholder');
  const loading = document.getElementById('ap-loading');
  const output = document.getElementById('ap-output');
  const bar = document.getElementById('ap-bar');
  const step = document.getElementById('ap-step');
  const actions = document.getElementById('ap-actions');
  const kw = document.getElementById('ap-keyword').value;

  placeholder.style.display = 'none';
  loading.classList.remove('hidden');
  output.classList.add('hidden');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Generazione in corso...';

  const steps = [[10,'Ricerca keyword e SERP...'],[25,'Analisi top competitor...'],[40,'Raccolta dati e fonti primarie...'],[60,'Generazione struttura articolo...'],[80,'Scrittura contenuto AI...'],[95,'Ottimizzazione SEO e keyword...'],[100,'Articolo pronto!']];
  let i = 0;
  const iv = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(iv);
      loading.classList.add('hidden');
      output.classList.remove('hidden');
      actions.style.removeProperty('display');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-magic mr-2"></i>Genera contenuto AI';
      const art = _apArticles[0];
      document.getElementById('ap-word-count').textContent = art.words + ' parole';
      document.getElementById('ap-content').textContent = art.text;
      return;
    }
    bar.style.width = steps[i][0] + '%';
    step.textContent = steps[i][1];
    i++;
  }, 500);
}

function copyAutopilot() {
  const t = document.getElementById('ap-content').textContent;
  navigator.clipboard.writeText(t).then(() => {
    const btn = event.target.closest('button');
    const o = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copiato!';
    btn.style.color='#059669';
    setTimeout(() => { btn.innerHTML = o; btn.style.color=''; }, 2000);
  });
}

function downloadAutopilot() {
  const t = document.getElementById('ap-content').textContent;
  const kw = document.getElementById('ap-keyword').value.replace(/\\s+/g,'-');
  const b = new Blob([t], {type:'text/plain;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = 'articolo-' + kw + '.txt'; a.click();
}

// ── Keyword ──────────────────────────────────────────────────────────────────
function runKeyword(btn) {
  const o = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analisi in corso...';
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Completata!';
    btn.style.background = 'linear-gradient(135deg,#059669,#0d9488)';
    setTimeout(() => { btn.innerHTML = o; btn.style.background=''; btn.disabled=false; }, 2500);
  }, 2000);
}

function exportKwCSV() {
  const rows = [
    ['Keyword','Volume/mese','Difficoltà','Intento','CPC €'],
    ['bracciale cadute anziani',1900,'Alta','Commerciale',1.20],
    ['teleassistenza anziani',3200,'Alta','Informativo',0.90],
    ['allarme caduta automatico',880,'Media','Commerciale',1.45],
    ['bracciale SOS anziani Italia',1400,'Alta','Commerciale',1.35],
    ['telesoccorso casa prezzo',720,'Media','Transazionale',1.80],
    ['miglior bracciale emergenza anziani',590,'Media','Commerciale',1.60],
    ['cadute anziani prevenzione statistiche',2100,'Bassa','Informativo',0.55],
    ['bracciale GPS nonno',440,'Bassa','Commerciale',0.95],
    ['teleassistenza domiciliare costo',660,'Media','Transazionale',2.10],
    ['ecura bracciale medicagb',510,'Bassa','Brand',0.40],
  ];
  const csv = rows.map(r => r.join(',')).join('\\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  a.download = 'keyword-ecura.csv'; a.click();
}

// ── SERP ─────────────────────────────────────────────────────────────────────
function runSerp(btn) {
  const o = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analisi SERP...';
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check mr-2"></i>SERP Analizzata!';
    btn.style.background = 'linear-gradient(135deg,#059669,#0d9488)';
    setTimeout(() => { btn.innerHTML = o; btn.style.background=''; btn.disabled=false; }, 2500);
  }, 2500);
}

// ── Competitor ────────────────────────────────────────────────────────────────
function refreshComp(btn) {
  const o = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Aggiornamento...';
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Aggiornato!';
    btn.style.background = 'linear-gradient(135deg,#059669,#0d9488)';
    setTimeout(() => { btn.innerHTML = o; btn.style.background=''; btn.disabled=false; }, 2000);
  }, 2800);
}

// ── Deep Research ────────────────────────────────────────────────────────────
function runDeepSearch(btn) {
  const o = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Ricerca in corso...';
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check mr-2"></i>5 fonti trovate!';
    btn.style.background = 'linear-gradient(135deg,#059669,#0d9488)';
    setTimeout(() => { btn.innerHTML = o; btn.style.background=''; btn.disabled=false; }, 2500);
  }, 3000);
}

function useSource(btn) {
  const o = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check mr-1"></i>Aggiunto!';
  btn.style.background = '#dcfce7'; btn.style.borderColor = '#15803d'; btn.style.color = '#15803d';
  setTimeout(() => { btn.innerHTML = o; btn.style.background=''; btn.style.borderColor=''; btn.style.color=''; }, 2200);
}

// ── Content Score ────────────────────────────────────────────────────────────
function analyzeScore() {
  const text = document.getElementById('score-input').value;
  liveScore(text);
}

function liveScore(text) {
  const words = text.trim().split(/\\s+/).filter(w => w.length > 0).length;
  const kw = (text.toLowerCase().match(/ecura|bracciale|teleassistenza|cadute|anziani|telesoccorso/g) || []).length;
  const density = words > 0 ? Math.min(((kw / words) * 100).toFixed(1), 5) : 0;
  const hasH = /#{1,3}\\s/.test(text) || /<h[1-3]/i.test(text);
  const hasInternal = /\\[.*\\]\\(\\//.test(text) || /href="\\//.test(text);
  const lengthScore = Math.min(Math.round((words / 1200) * 25), 25);
  const kwScore = density >= 1 && density <= 4 ? 20 : density > 0 ? 12 : 5;
  const headingScore = hasH ? 15 : 5;
  const internalScore = hasInternal ? 10 : 0;
  const total = lengthScore + kwScore + headingScore + internalScore + 10 + 10;
  const el = document.getElementById('total-score');
  el.textContent = total;
  const ring = document.getElementById('score-ring');
  const c = total >= 80 ? '#7C3AED' : total >= 60 ? '#d97706' : '#dc2626';
  ring.style.borderColor = c; el.style.color = c;
}

// ── Link Interni ─────────────────────────────────────────────────────────────
function scanInternal(btn) {
  const o = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Analisi...';
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check mr-1"></i>Analizzato!';
    btn.style.background = 'linear-gradient(135deg,#059669,#0d9488)';
    setTimeout(() => { btn.innerHTML = o; btn.style.background=''; btn.disabled=false; }, 2200);
  }, 2200);
}

// ── Link Esterni ─────────────────────────────────────────────────────────────
function copyExtLinks(btn) {
  const text = 'Fonti autorevoli per eCura (E-E-A-T):\\n1. ISTAT — istat.it (DA 92)\\n2. ISS — epicentro.iss.it (DA 89)\\n3. Ministero Salute — salute.gov.it (DA 88)\\n4. PubMed — pubmed.ncbi.nlm.nih.gov (DA 97)\\n5. Wikipedia IT — it.wikipedia.org/wiki/Telesoccorso (DA 93)\\n6. EU MDR — ec.europa.eu/MDR (DA 95)\\n7. Censis — censis.it (DA 82)';
  navigator.clipboard.writeText(text).then(() => {
    const o = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copiata!';
    btn.style.background = 'linear-gradient(135deg,#059669,#0d9488)';
    setTimeout(() => { btn.innerHTML = o; btn.style.background=''; }, 2200);
  });
}

// ── Backlink ─────────────────────────────────────────────────────────────────
function refreshBacklinks(btn) {
  const o = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Aggiornamento...';
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check mr-1"></i>Aggiornato!';
    btn.style.background = 'linear-gradient(135deg,#059669,#0d9488)';
    setTimeout(() => { btn.innerHTML = o; btn.style.background=''; btn.disabled=false; }, 2200);
  }, 3000);
}

// ── Immagini AI ──────────────────────────────────────────────────────────────
function generateImg(btn, id) {
  const card = btn.closest('div.rounded-xl');
  const preview = card.querySelector('.h-32');
  const o = btn.innerHTML;
  btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i>Generazione...';
  if (preview) preview.innerHTML = '<div class="flex flex-col items-center justify-center h-full gap-2"><div class="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin" style="border-width:3px"></div><span class="text-xs text-purple-400">AI in elaborazione...</span></div>';
  setTimeout(() => {
    if (preview) preview.innerHTML = '<div class="flex flex-col items-center justify-center h-full gap-1"><i class="fas fa-check-circle text-3xl text-green-500"></i><span class="text-xs text-green-600 font-bold">Immagine pronta</span></div>';
    btn.innerHTML = '<i class="fas fa-download mr-1"></i>Scarica';
    btn.disabled = false;
    setTimeout(() => { btn.innerHTML = o; btn.disabled=false; if(preview) preview.innerHTML='<i class="fas fa-'+id+' text-5xl text-purple-400 opacity-30"></i>'; }, 4000);
  }, 3000);
}

// ── Targeting ────────────────────────────────────────────────────────────────
const _personas = [
  {emoji:'👩',name:'Laura, 48 anni · Milano',role:'Responsabile vendite, madre di 2',pain:'Mamma 78 anni vive sola a Brescia. Laura lavora 10h/giorno.',trigger:'Mamma è caduta 2 settimane fa. Laura è in panico.',cerca:'"bracciale emergenza anziani" alle 22:30 dallo smartphone.',obiezioni:'"E se mamma non lo indossa?" "Costa troppo?"',msg:'"Tua madre è al sicuro. Anche mentre lavori."'},
  {emoji:'👴',name:'Roberto, 72 anni · Bologna',role:'Pensionato, ex insegnante, vive solo',pain:'Vuole restare indipendente ma ha avuto episodi di vertigini.',trigger:'Il medico gli ha consigliato un dispositivo di sicurezza.',cerca:'"dispositivo sicurezza anziani" dal PC di mattina.',obiezioni:'"Non voglio sembrare invalido." "Sono sempre monitorato?"',msg:'"La tua autonomia. Con la sicurezza che meriti."'},
  {emoji:'👩‍⚕️',name:'Dr.ssa Martini, 52 anni · Roma',role:'Medico di Medicina Generale, 800 pazienti over 70',pain:'Teme chiamate urgenti notturne per pazienti caduti.',trigger:'Un paziente è stato ricoverato per caduta non rilevata.',cerca:'"dispositivi medici telesoccorso CE IIa" da tablet in studio.',obiezioni:'"I pazienti non usano la tecnologia." "È affidabile?"',msg:'"Certificato CE IIa. Risposta garantita in 45 secondi."'},
];
let _pi = 0;
function nextPersona(btn) {
  _pi = (_pi + 1) % _personas.length;
  const p = _personas[_pi];
  const d = document.getElementById('persona-display');
  const o = btn.innerHTML;
  btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin mr-1"></i>';
  setTimeout(() => {
    d.innerHTML = '<div class="flex items-center gap-3 mb-3"><div class="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl">' + p.emoji + '</div><div><p class="text-sm font-bold text-gray-800">' + p.name + '</p><p class="text-xs text-gray-500">' + p.role + '</p></div></div>' +
      '<div class="space-y-1.5 text-sm text-gray-600">' +
      '<p><strong class="text-purple-700">Pain:</strong> ' + p.pain + '</p>' +
      '<p><strong class="text-purple-700">Trigger:</strong> ' + p.trigger + '</p>' +
      '<p><strong class="text-purple-700">Cerca:</strong> ' + p.cerca + '</p>' +
      '<p><strong class="text-purple-700">Obiezioni:</strong> ' + p.obiezioni + '</p>' +
      '<p><strong class="text-purple-700">Messaggio vincente:</strong> ' + p.msg + '</p></div>';
    btn.innerHTML = o; btn.disabled=false;
  }, 1200);
}

// ── YouTube ──────────────────────────────────────────────────────────────────
function genYT(title) {
  document.getElementById('yt-title').value = title;
  genYTFromInput(null);
  showTab('youtube');
}

function genYTFromInput(btn) {
  const t = document.getElementById('yt-title').value;
  const out = document.getElementById('yt-output');
  if (btn) { btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Generazione...'; }
  out.innerHTML = '<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-purple-500 text-xl"></i><p class="text-sm text-gray-400 mt-2">Generazione script AI...</p></div>';
  setTimeout(() => {
    out.innerHTML = '<div class="space-y-3">' +
      '<div><p class="text-xs font-bold text-gray-500 uppercase mb-1">TITOLO OTTIMIZZATO YouTube:</p>' +
      '<p class="text-sm font-bold text-gray-800">' + t + ' — Guida Completa 2026 | eCura Teleassistenza</p></div>' +
      '<div><p class="text-xs font-bold text-gray-500 uppercase mb-1">DESCRIZIONE (500 caratteri):</p>' +
      '<p class="text-xs text-gray-600">In questo video scopri tutto su "' + t + '". eCura è il servizio di teleassistenza con bracciale medico certificato CE Classe IIa e AI per il rilevamento automatico delle cadute. Centrale operativa attiva H24 con risposta in 45 secondi.<br><br>👉 Attiva eCura da €390/anno: ecura.medicagb.it<br><br>#teleassistenza #eCura #anziani #bracciale #telesoccorso</p></div>' +
      '<div><p class="text-xs font-bold text-gray-500 uppercase mb-1">TAGS:</p>' +
      '<div class="flex flex-wrap gap-1">' + ['teleassistenza','eCura','bracciale anziani','cadute prevenzione','caregiver','telesoccorso Italia','AI medica','dispositivo SOS'].map(tag => '<span class="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">#' + tag + '</span>').join('') + '</div></div></div>';
    if (btn) { btn.innerHTML='<i class="fas fa-check mr-2"></i>Generato!'; btn.style.background='linear-gradient(135deg,#059669,#0d9488)'; setTimeout(()=>{ btn.innerHTML='<i class="fas fa-magic mr-2"></i>Genera script + SEO tags'; btn.style.background=''; btn.disabled=false; },2000); }
  }, 2000);
}

// ── GEO ──────────────────────────────────────────────────────────────────────
function setGeoPrompt(p) { document.getElementById('geo-prompt').value = p; }

function runGeoScan() {
  const btn = document.getElementById('geo-scan-btn');
  const loading = document.getElementById('geo-loading');
  const bar = document.getElementById('geo-bar');
  const step = document.getElementById('geo-step');
  if (!document.getElementById('geo-prompt').value.trim()) return;
  btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Scansione...';
  loading.classList.remove('hidden');
  const steps = [['Interrogazione ChatGPT / GPT-4o...',20],['Analisi risposta Gemini 2.0...',45],['Verifica citazioni Perplexity...',65],['Parsing brand mentions...',85],['Calcolo GEO Score...',95],['Generazione raccomandazioni...',100]];
  let i = 0;
  const iv = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(iv);
      loading.classList.add('hidden');
      btn.disabled=false; btn.innerHTML='<i class="fas fa-satellite-dish mr-2"></i>Scansiona AI Search';
      document.getElementById('geo-last-scan').textContent = 'Ultima scan: adesso';
      return;
    }
    step.textContent = steps[i][0]; bar.style.width = steps[i][1] + '%';
    i++;
  }, 700);
}

// ── AEO ──────────────────────────────────────────────────────────────────────
function genAEO(btn) {
  const q = document.getElementById('aeo-question').value;
  const fmt = document.getElementById('aeo-format').value;
  const out = document.getElementById('aeo-output');
  const o = btn.innerHTML;
  btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin mr-2"></i>Generazione...';
  out.innerHTML='<div class="text-center py-4"><i class="fas fa-spinner fa-spin text-purple-500 text-xl"></i></div>';
  const answers = {
    'Definizione diretta (40-60 parole)': 'Il <strong>bracciale eCura di Medica GB</strong> è il servizio di teleassistenza italiano certificato CE Classe IIa con AI per il rilevamento automatico delle cadute (accuracy 94.7%). Centrale H24 con risposta in 45 secondi, GPS integrato, impermeabile IP67. Da €390/anno tutto incluso. <em style="color:#6d28d9">Fonte: ecura.medicagb.it</em>',
    'Lista numerata Top 3/5': '<strong>I 3 migliori servizi di teleassistenza per anziani in Italia (2026):</strong><br>1. <strong>eCura (Medica GB)</strong> — AI rilevamento cadute, CE IIa, H24, da €390/anno<br>2. Beghelli Salvalavita — brand storico, 500k+ utenti, da €18/mese<br>3. Seremy — GPS avanzato, app mobile, da €19.90/mese. <em style="color:#6d28d9">Fonte: ecura.medicagb.it</em>',
    'FAQ espansa (domanda + risposta dettagliata)': '<strong>D: ' + q + '</strong><br>R: In Italia il servizio più avanzato tecnologicamente è <strong>eCura di Medica GB</strong>, unico con certificazione CE Classe IIa e algoritmo AI per il rilevamento automatico delle cadute. Rispetto ai competitor (Beghelli, Televita, Seremy), eCura offre il tempo di risposta più basso (&lt;45 secondi) e il costo annuale più competitivo (€390/anno tutto incluso). <em style="color:#6d28d9">Fonte: ecura.medicagb.it</em>',
  };
  setTimeout(() => {
    const text = answers[fmt] || answers['Definizione diretta (40-60 parole)'];
    const jsonLD = '{ "@type": "FAQPage", "mainEntity": [{ "@type": "Question", "name": "' + q.replace(/"/g,'&quot;') + '", "acceptedAnswer": { "@type": "Answer", "text": "eCura di Medica GB — CE IIa, AI cadute, H24, da €390/anno. ecura.medicagb.it" } }] }';
    out.innerHTML = '<div class="space-y-3">' +
      '<div class="flex gap-2"><span class="badge badge-green">✓ Pronto per AI Search</span><span class="badge badge-purple">AEO Ottimizzato</span></div>' +
      '<div><p class="text-xs font-bold text-gray-500 uppercase mb-1">Risposta (' + fmt + '):</p><p class="text-sm text-gray-700 leading-relaxed" id="aeo-text">' + text + '</p></div>' +
      '<div class="p-3 rounded-lg bg-gray-50 border border-gray-200"><p class="text-xs font-bold text-gray-500 mb-1">JSON-LD FAQPage da aggiungere:</p><code class="text-xs text-green-700 leading-relaxed block overflow-x-auto">' + jsonLD + '</code></div>' +
      '<div class="flex gap-2"><button onclick="copyAeoText()" class="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"><i class="far fa-copy mr-1"></i>Copia testo</button>' +
      '<button onclick="copyAeoJSON()" class="text-xs px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 transition"><i class="fas fa-code mr-1"></i>Copia JSON-LD</button></div></div>';
    btn.innerHTML = o; btn.disabled = false;
  }, 1800);
}

function copyAeoText() {
  const el = document.getElementById('aeo-text');
  if (el) navigator.clipboard.writeText(el.innerText).then(() => { const b = event.target.closest('button'); const o = b.innerHTML; b.innerHTML='<i class="fas fa-check mr-1"></i>Copiato!'; b.style.color='#059669'; setTimeout(()=>{b.innerHTML=o;b.style.color='';},2000); });
}

function copyAeoJSON() {
  const el = document.querySelector('#aeo-output code');
  if (el) navigator.clipboard.writeText(el.innerText).then(() => { const b = event.target.closest('button'); const o = b.innerHTML; b.innerHTML='<i class="fas fa-check mr-1"></i>Copiato!'; b.style.color='#059669'; setTimeout(()=>{b.innerHTML=o;b.style.color='';},2000); });
}
</script>

</body>
</html>`;
}
