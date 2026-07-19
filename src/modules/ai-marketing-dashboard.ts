export function renderAiMarketingDashboard(): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Marketing — TeleMedCare Dashboard</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { font-family: 'Inter', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; }
  .tab-btn { transition: all .2s; border-bottom: 3px solid transparent; }
  .tab-btn.active { border-bottom-color: #7C3AED; color: #a78bfa; }
  .tab-panel { display: none; }
  .tab-panel.active { display: block; }
  .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; }
  .card-gradient { background: linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%); border-radius: 12px; }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
  .badge-purple { background: rgba(124,58,237,.2); color: #a78bfa; }
  .badge-green { background: rgba(16,185,129,.2); color: #34d399; }
  .badge-blue { background: rgba(59,130,246,.2); color: #60a5fa; }
  .badge-yellow { background: rgba(245,158,11,.2); color: #fbbf24; }
  .badge-red { background: rgba(239,68,68,.2); color: #f87171; }
  .badge-orange { background: rgba(249,115,22,.2); color: #fb923c; }
  .progress-bar { height: 6px; border-radius: 3px; background: #334155; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width .6s ease; }
  .ai-pulse { animation: aiPulse 2s ease-in-out infinite; }
  @keyframes aiPulse { 0%,100%{opacity:1;} 50%{opacity:.5;} }
  .glow-purple { box-shadow: 0 0 20px rgba(124,58,237,.3); }
  .stat-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; }
  .neuron-bg { background: radial-gradient(ellipse at 30% 20%, rgba(124,58,237,.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(79,70,229,.1) 0%, transparent 60%); }
  .scrollbar-thin::-webkit-scrollbar { width: 4px; }
  .scrollbar-thin::-webkit-scrollbar-thumb { background: #475569; border-radius: 2px; }
  textarea, input, select { background: #0f172a !important; border: 1px solid #334155 !important; color: #e2e8f0 !important; border-radius: 8px !important; }
  textarea:focus, input:focus, select:focus { outline: none !important; border-color: #7C3AED !important; box-shadow: 0 0 0 2px rgba(124,58,237,.2) !important; }
  .toggle-track { transition: background .2s; cursor: pointer; }
  .content-card { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 16px; cursor: pointer; transition: all .2s; }
  .content-card:hover { border-color: #7C3AED; background: #1e1b4b; }
  .typing-cursor::after { content: '|'; animation: blink .7s step-end infinite; }
  @keyframes blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
  .tag { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
</style>
</head>
<body class="min-h-screen neuron-bg">

<!-- TOP NAV -->
<nav class="sticky top-0 z-50 border-b border-slate-700" style="background:rgba(15,23,42,.95);backdrop-filter:blur(12px)">
  <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <a href="/dashboard" class="text-slate-400 hover:text-white transition-colors">
        <i class="fas fa-arrow-left text-sm"></i>
      </a>
      <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
        <i class="fas fa-robot text-white text-sm"></i>
      </div>
      <div>
        <h1 class="font-bold text-white text-sm">AI Marketing Hub</h1>
        <p class="text-xs text-slate-400">eCura · Powered by Artificial Intelligence</p>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <span class="badge badge-purple"><i class="fas fa-brain"></i> AI Engine Active</span>
      <span class="badge badge-green"><i class="fas fa-circle text-xs"></i> Live</span>
    </div>
  </div>
  <!-- TABS -->
  <div class="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-thin">
    <div class="flex gap-1 pb-0 min-w-max">
      <button onclick="showTab('autopilot')" class="tab-btn active px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-autopilot">
        <i class="fas fa-rocket mr-1"></i>Autopilot
      </button>
      <button onclick="showTab('keyword')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-keyword">
        <i class="fas fa-key mr-1"></i>Ricerca Keyword
      </button>
      <button onclick="showTab('serp')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-serp">
        <i class="fas fa-search mr-1"></i>Analisi SERP
      </button>
      <button onclick="showTab('competitor')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-competitor">
        <i class="fas fa-chess mr-1"></i>Analisi Competitor
      </button>
      <button onclick="showTab('deepresearch')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-deepresearch">
        <i class="fas fa-microscope mr-1"></i>Ricerca Profonda
      </button>
      <button onclick="showTab('score')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-score">
        <i class="fas fa-star mr-1"></i>Punteggio Contenuto
      </button>
      <button onclick="showTab('internal')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-internal">
        <i class="fas fa-link mr-1"></i>Link Interni
      </button>
      <button onclick="showTab('external')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-external">
        <i class="fas fa-external-link-alt mr-1"></i>Link Esterni
      </button>
      <button onclick="showTab('backlink')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-backlink">
        <i class="fas fa-project-diagram mr-1"></i>Backlink
      </button>
      <button onclick="showTab('images')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-images">
        <i class="fas fa-image mr-1"></i>Immagini AI
      </button>
      <button onclick="showTab('audience')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-audience">
        <i class="fas fa-users mr-1"></i>Targeting Pubblico
      </button>
      <button onclick="showTab('youtube')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-youtube">
        <i class="fab fa-youtube mr-1"></i>Video YouTube
      </button>
      <button onclick="showTab('geo')" class="tab-btn px-3 py-2 text-xs font-medium text-slate-400 whitespace-nowrap" id="tab-geo">
        <i class="fas fa-globe mr-1"></i>GEO — AI Search
        <span class="ml-1 px-1 py-0.5 rounded text-xs font-bold" style="background:linear-gradient(135deg,#7C3AED,#4F46E5);color:white;font-size:9px">NEW</span>
      </button>
    </div>
  </div>
</nav>

<div class="max-w-7xl mx-auto px-4 py-6">

<!-- ══════════════════════════════════════════════════════════════
     TAB 1: AUTOPILOT AI
══════════════════════════════════════════════════════════════ -->
<div id="panel-autopilot" class="tab-panel active">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- LEFT: Control Panel -->
    <div class="lg:col-span-1 space-y-4">
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-white flex items-center gap-2">
            <i class="fas fa-rocket text-purple-400"></i> Autopilot AI
          </h2>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-400" id="ap-status-label">Attivo</span>
            <div class="toggle-track w-11 h-6 rounded-full relative" id="ap-toggle" onclick="toggleAutopilot()"
                 style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
              <div class="absolute top-1 right-1 w-4 h-4 bg-white rounded-full transition-all" id="ap-knob"></div>
            </div>
          </div>
        </div>
        <p class="text-xs text-slate-400 mb-4">L'AI ricerca, scrive e pubblica automaticamente 1 contenuto al giorno ottimizzato per eCura.</p>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Topic principale</label>
            <select class="w-full px-3 py-2 text-sm">
              <option>Teleassistenza anziani</option>
              <option>Prevenzione cadute</option>
              <option>Salute e tecnologia</option>
              <option>Caregiver e famiglie</option>
              <option>Dispositivi medici IoT</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Tono di voce</label>
            <select class="w-full px-3 py-2 text-sm">
              <option>Professionale e rassicurante</option>
              <option>Empatico e familiare</option>
              <option>Tecnico e autorevole</option>
              <option>Informativo e chiaro</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Frequenza</label>
            <select class="w-full px-3 py-2 text-sm">
              <option>1 articolo/giorno</option>
              <option>2 articoli/giorno</option>
              <option>1 articolo ogni 2 giorni</option>
              <option>1 articolo/settimana</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Lunghezza target</label>
            <select class="w-full px-3 py-2 text-sm">
              <option>800–1200 parole (veloce)</option>
              <option>1200–1800 parole (standard)</option>
              <option>1800–2500 parole (approfondito)</option>
              <option>2500+ parole (pillar page)</option>
            </select>
          </div>
        </div>
        <button onclick="generateAutopilotArticle()" class="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
          <i class="fas fa-magic mr-2"></i>Genera Ora
        </button>
      </div>

      <!-- Stats -->
      <div class="card p-4">
        <h3 class="text-sm font-semibold text-white mb-3">Statistiche Autopilot</h3>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Articoli pubblicati</span>
            <span class="text-purple-400 font-bold">47</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Visite organiche</span>
            <span class="text-green-400 font-bold">+3.240</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Keyword posizionate</span>
            <span class="text-blue-400 font-bold">89</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Lead generati</span>
            <span class="text-yellow-400 font-bold">18</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-slate-400">Prossima generazione</span>
            <span class="text-slate-300 font-bold">oggi 03:00</span>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT: Generated Article + Queue -->
    <div class="lg:col-span-2 space-y-4">
      <div class="card p-5" id="ap-article-panel">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-white flex items-center gap-2">
            <i class="fas fa-file-alt text-purple-400"></i>
            Ultimo Articolo Generato
          </h3>
          <div class="flex gap-2">
            <button onclick="copyAiArticle()" class="px-3 py-1.5 text-xs rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-purple-500 transition-all">
              <i class="far fa-copy mr-1"></i>Copia
            </button>
            <button class="px-3 py-1.5 text-xs rounded-lg text-white" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
              <i class="fas fa-paper-plane mr-1"></i>Pubblica
            </button>
          </div>
        </div>
        <div id="ap-article-output" class="space-y-3">
          <div class="p-3 rounded-lg" style="background:#0f172a">
            <div class="flex items-center gap-2 mb-2">
              <span class="badge badge-green"><i class="fas fa-check-circle"></i> Pubblicato</span>
              <span class="text-xs text-slate-500">19 Lug 2026 · 1.420 parole · Score SEO: 91/100</span>
            </div>
            <h4 class="font-semibold text-white mb-1">Come il Bracciale eCura Salva Vite: Rilevamento Cadute con AI e Risposta in 45 Secondi</h4>
            <p class="text-xs text-slate-400 leading-relaxed">
              Ogni anno in Italia oltre 400.000 anziani vengono ricoverati d'urgenza a causa di cadute domestiche. La tecnologia AI cambia le regole del gioco. Il bracciale eCura integra sensori IMU a 6 assi con algoritmi di deep learning addestrati su 2 milioni di eventi di caduta reali...
            </p>
            <div class="mt-2 flex flex-wrap gap-1">
              <span class="tag" style="background:rgba(124,58,237,.2);color:#a78bfa">#teleassistenza</span>
              <span class="tag" style="background:rgba(124,58,237,.2);color:#a78bfa">#prevenzione-cadute</span>
              <span class="tag" style="background:rgba(124,58,237,.2);color:#a78bfa">#anziani</span>
              <span class="tag" style="background:rgba(124,58,237,.2);color:#a78bfa">#AI-medica</span>
            </div>
          </div>
        </div>
        <div id="ap-generating" class="hidden py-8 text-center">
          <div class="flex flex-col items-center gap-3">
            <div class="w-12 h-12 rounded-full flex items-center justify-center ai-pulse" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
              <i class="fas fa-brain text-white text-lg"></i>
            </div>
            <p class="text-sm text-purple-300 font-medium" id="ap-gen-step">Ricerca web in corso...</p>
            <div class="w-48 progress-bar">
              <div class="progress-fill" style="background:linear-gradient(90deg,#7C3AED,#4F46E5)" id="ap-gen-bar"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Queue -->
      <div class="card p-5">
        <h3 class="font-semibold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-calendar-alt text-purple-400"></i> Coda Articoli Programmati
        </h3>
        <div class="space-y-2">
          ${[
            {d:'20 Lug',t:'Teleassistenza domiciliare: confronto tra i 4 principali servizi in Italia',s:'In pianificazione',c:'badge-blue'},
            {d:'21 Lug',t:'Cosa succede se un anziano cade di notte? La guida per i caregiver',s:'In pianificazione',c:'badge-blue'},
            {d:'22 Lug',t:'GPS per anziani: tecnologia e privacy — tutto quello che devi sapere',s:'In pianificazione',c:'badge-blue'},
            {d:'23 Lug',t:'Bracciale medico vs smartphone: quale scegliere per la sicurezza dei tuoi cari',s:'In pianificazione',c:'badge-blue'},
            {d:'24 Lug',t:'Come funziona la centrale operativa eCura: risposta H24 in meno di 1 minuto',s:'In pianificazione',c:'badge-blue'},
          ].map(a=>`
          <div class="flex items-center gap-3 p-3 rounded-lg" style="background:#0f172a">
            <div class="text-xs text-slate-500 font-mono w-14 shrink-0">${a.d}</div>
            <p class="text-sm text-slate-300 flex-1 leading-snug">${a.t}</p>
            <span class="badge ${a.c} shrink-0">${a.s}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════
     TAB 2: RICERCA KEYWORD AI
══════════════════════════════════════════════════════════════ -->
<div id="panel-keyword" class="tab-panel">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1 space-y-4">
      <div class="card p-5">
        <h2 class="font-bold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-key text-purple-400"></i> AI Keyword Discovery
        </h2>
        <p class="text-xs text-slate-400 mb-4">L'AI analizza il tuo mercato e suggerisce keyword con il migliore equilibrio volume/difficoltà/intento.</p>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Seed keyword</label>
            <input type="text" value="teleassistenza anziani" class="w-full px-3 py-2 text-sm" placeholder="es. bracciale cadute">
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Mercato target</label>
            <select class="w-full px-3 py-2 text-sm">
              <option>Italia 🇮🇹</option>
              <option>Italia + Svizzera IT</option>
              <option>Europa Sud</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Intento di ricerca</label>
            <select class="w-full px-3 py-2 text-sm">
              <option>Tutti</option>
              <option>Informazionale</option>
              <option>Commerciale</option>
              <option>Transazionale</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Difficoltà massima</label>
            <input type="range" min="0" max="100" value="50" class="w-full accent-purple-500" id="kw-diff-range" oninput="document.getElementById('kw-diff-val').textContent=this.value">
            <div class="flex justify-between text-xs text-slate-500 mt-1">
              <span>0</span><span id="kw-diff-val">50</span><span>100</span>
            </div>
          </div>
        </div>
        <button onclick="runKeywordResearch()" class="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
          <i class="fas fa-search mr-2"></i>Analizza con AI
        </button>
      </div>
      <div class="card p-4">
        <h3 class="text-sm font-semibold text-white mb-3">Cluster Tematici AI</h3>
        ${[
          {name:'Sicurezza Anziani',kw:28,opp:'Alta',col:'#7C3AED'},
          {name:'Tecnologia Medica',kw:19,opp:'Media',col:'#4F46E5'},
          {name:'Caregiver & Famiglia',kw:16,opp:'Alta',col:'#7C3AED'},
          {name:'Confronto Servizi',kw:11,opp:'Bassa',col:'#64748b'},
          {name:'Prezzi & Piani',kw:9,opp:'Alta',col:'#7C3AED'},
        ].map(c=>`
        <div class="flex items-center justify-between mb-2 cursor-pointer hover:opacity-80">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full" style="background:${c.col}"></div>
            <span class="text-xs text-slate-300">${c.name}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">${c.kw} kw</span>
            <span class="badge" style="background:${c.opp==='Alta'?'rgba(124,58,237,.2)':c.opp==='Media'?'rgba(59,130,246,.2)':'rgba(100,116,139,.2)'}; color:${c.opp==='Alta'?'#a78bfa':c.opp==='Media'?'#60a5fa':'#94a3b8'}; font-size:10px; padding:1px 6px;">${c.opp}</span>
          </div>
        </div>`).join('')}
      </div>
    </div>
    <div class="lg:col-span-2">
      <div class="card p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-white">Keyword Raccomandate dall'AI</h3>
          <button class="px-3 py-1.5 text-xs rounded-lg text-white" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
            <i class="fas fa-download mr-1"></i>Esporta CSV
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-slate-500 border-b border-slate-700">
                <th class="text-left pb-2 font-medium">Keyword</th>
                <th class="text-right pb-2 font-medium">Volume</th>
                <th class="text-right pb-2 font-medium">Diff.</th>
                <th class="text-right pb-2 font-medium">CPC €</th>
                <th class="text-left pb-2 font-medium pl-3">Intento</th>
                <th class="text-left pb-2 font-medium pl-3">AI Score</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${[
                ['bracciale cadute anziani',2400,28,1.45,'Commerciale',96],
                ['teleassistenza anziani',1900,35,1.20,'Commerciale',94],
                ['allarme anziani soli',1600,22,0.95,'Informazionale',91],
                ['servizio telesoccorso',1200,41,1.80,'Transazionale',88],
                ['migliore bracciale medicale',900,31,2.10,'Commerciale',87],
                ['dispositivo emergenza anziani',720,19,0.75,'Commerciale',85],
                ['centrale operativa h24 anziani',480,15,0.60,'Informazionale',83],
                ['abbonamento teleassistenza prezzo',360,24,1.65,'Transazionale',90],
                ['bracciale GPS nonno',290,12,0.45,'Informazionale',81],
                ['rilevamento cadute AI',210,18,1.10,'Informazionale',86],
                ['telesoccorso anziani costo',180,27,1.35,'Transazionale',84],
                ['bracciale SOS anziani prezzi',150,22,0.90,'Transazionale',82],
                ['chi chiama dopo caduta anziano',120,8,0.30,'Informazionale',79],
              ].map(r=>{
                const diff=Number(r[2]);
                const diffCol=diff<25?'#34d399':diff<40?'#fbbf24':'#f87171';
                const score=Number(r[5]);
                const scoreCol=score>=90?'#a78bfa':score>=80?'#60a5fa':'#94a3b8';
                const intent=String(r[4]);
                const intentBadge=intent==='Transazionale'?'badge-green':intent==='Commerciale'?'badge-purple':'badge-blue';
                return `<tr class="hover:bg-slate-800/30">
                  <td class="py-2 text-slate-200 font-medium">${r[0]}</td>
                  <td class="py-2 text-right text-slate-300">${Number(r[1]).toLocaleString('it')}</td>
                  <td class="py-2 text-right font-bold" style="color:${diffCol}">${r[2]}</td>
                  <td class="py-2 text-right text-slate-300">${r[3]}</td>
                  <td class="py-2 pl-3"><span class="badge ${intentBadge}">${r[4]}</span></td>
                  <td class="py-2 pl-3 font-bold" style="color:${scoreCol}">${r[5]}/100</td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════
     TAB 3: ANALISI SERP AI
══════════════════════════════════════════════════════════════ -->
<div id="panel-serp" class="tab-panel">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1 space-y-4">
      <div class="card p-5">
        <h2 class="font-bold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-search text-purple-400"></i> SERP AI Analyzer
        </h2>
        <p class="text-xs text-slate-400 mb-4">L'AI analizza la SERP in tempo reale e identifica le opportunità di posizionamento.</p>
        <div class="space-y-3">
          <input type="text" value="bracciale cadute anziani" class="w-full px-3 py-2 text-sm" placeholder="Inserisci keyword...">
          <select class="w-full px-3 py-2 text-sm">
            <option>Google.it — Desktop</option>
            <option>Google.it — Mobile</option>
            <option>Google.it — Local (Roma)</option>
          </select>
        </div>
        <button class="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
          <i class="fas fa-bolt mr-2"></i>Analizza SERP
        </button>
      </div>
      <div class="card p-4">
        <h3 class="text-sm font-semibold text-white mb-3">AI SERP Features</h3>
        ${[
          {f:'Featured Snippet',p:true,i:'fa-star'},
          {f:'People Also Ask',p:true,i:'fa-question-circle'},
          {f:'Google Shopping',p:false,i:'fa-shopping-cart'},
          {f:'Local Pack (Maps)',p:false,i:'fa-map-marker-alt'},
          {f:'Video Carousel',p:true,i:'fa-play-circle'},
          {f:'Image Pack',p:true,i:'fa-images'},
        ].map(f=>`
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <i class="fas ${f.i} text-xs text-slate-500"></i>
            <span class="text-xs text-slate-300">${f.f}</span>
          </div>
          <span class="badge ${f.p?'badge-green':'badge-red'}">${f.p?'Presente':'Assente'}</span>
        </div>`).join('')}
      </div>
    </div>
    <div class="lg:col-span-2 space-y-4">
      <div class="card p-5">
        <h3 class="font-semibold text-white mb-4">Top 5 Risultati — <span class="text-purple-400">"bracciale cadute anziani"</span></h3>
        <div class="space-y-3">
          ${[
            {pos:1,domain:'beghelli.com',title:'Beghelli Salvalavita — Bracciale Emergenza Anziani',desc:'Il telesoccorso di Beghelli con bracciale SOS per anziani. Assistenza 24h, risposta immediata in caso di emergenza o caduta.',da:68,kw:18,words:2100,ai:'Gap contenuto: nessun dato su AI rilevamento cadute'},
            {pos:2,domain:'seremy.it',title:'Seremy — Bracciale GPS Anziani con Rilevamento Cadute',desc:'Monitora i tuoi cari H24 con il bracciale Seremy. GPS in tempo reale, allarme caduta automatico, centrale operativa.',da:52,kw:14,words:1450,ai:'Opportunità: prezzo più competitivo di eCura'},
            {pos:3,domain:'televita.it',title:'Televita Teleassistenza — Sicurezza Anziani a Casa',desc:'40 anni di esperienza nel telesoccorso. Bracciale con pulsante SOS e chiamata automatica ai numeri di emergenza.',da:61,kw:11,words:1800,ai:'Gap: no menzione certificazione CE Classe IIa'},
            {pos:4,domain:'wikipedia.org',title:'Telesoccorso — Wikipedia',desc:'Il telesoccorso è un sistema di assistenza a distanza che permette agli anziani di chiamare aiuto in caso di emergenza.',da:93,kw:3,words:3200,ai:'Non competibile — authority informatica pura'},
            {pos:5,domain:'familycaregiversonline.com',title:'I migliori dispositivi di sicurezza per anziani 2026',desc:'Confronto tra i 10 migliori bracciali di emergenza per anziani: caratteristiche, prezzi e opinioni degli esperti.',da:41,kw:22,words:4100,ai:'Alta opportunità: posizione vulnerabile, basso DA'},
          ].map(r=>`
          <div class="p-4 rounded-lg border border-slate-700 hover:border-purple-600 transition-all" style="background:#0f172a">
            <div class="flex items-start gap-3">
              <div class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                   style="background:${r.pos<=3?'linear-gradient(135deg,#7C3AED,#4F46E5)':'#334155'}; color:white">
                ${r.pos}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs text-green-400 font-mono">${r.domain}</span>
                  <span class="badge badge-purple">DA ${r.da}</span>
                  <span class="badge badge-blue">${r.kw} kw</span>
                  <span class="badge badge-yellow">${r.words.toLocaleString()} w</span>
                </div>
                <p class="text-sm text-white font-medium mb-1">${r.title}</p>
                <p class="text-xs text-slate-400 mb-2">${r.desc}</p>
                <div class="p-2 rounded text-xs" style="background:rgba(124,58,237,.1); color:#a78bfa">
                  <i class="fas fa-robot mr-1"></i><strong>AI Insight:</strong> ${r.ai}
                </div>
              </div>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card p-4">
        <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-lightbulb text-yellow-400"></i> Piano d'Attacco AI — Come Entrare in Top 5
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${[
            {t:'Crea contenuto 2500+ parole',d:'Supera la media dei competitor (1.930 w). Includi dati su tecnologia AI e certificazione Classe IIa.',icon:'fa-file-alt',c:'#7C3AED'},
            {t:'Ottieni snippet in evidenza',d:'Struttura una sezione FAQ con risposta diretta a "come funziona il rilevamento cadute" in meno di 50 parole.',icon:'fa-star',c:'#f59e0b'},
            {t:'Punta sulla posizione 5',d:'familycaregiversonline.com ha DA 41 e 4100 parole. Con contenuto più autorevole eCura può superarlo.',icon:'fa-crosshairs',c:'#10b981'},
            {t:'Ottimizza per Mobile SERP',d:'Il 78% delle ricerche su questo tema avviene da mobile. Velocità e UX mobile sono determinanti.',icon:'fa-mobile-alt',c:'#4F46E5'},
          ].map(s=>`
          <div class="p-3 rounded-lg border border-slate-700" style="background:#0f172a">
            <div class="flex items-center gap-2 mb-1">
              <i class="fas ${s.icon} text-xs" style="color:${s.c}"></i>
              <span class="text-xs font-semibold text-white">${s.t}</span>
            </div>
            <p class="text-xs text-slate-400">${s.d}</p>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════
     TAB 4: ANALISI COMPETITOR AI
══════════════════════════════════════════════════════════════ -->
<div id="panel-competitor" class="tab-panel">
  <div class="space-y-5">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      ${[
        {name:'Beghelli',domain:'beghelli.com',da:68,traffic:'42K/mo',content:85,ads:'Alta',weakness:'Prezzo alto, no AI rilevamento'},
        {name:'Seremy',domain:'seremy.it',da:52,traffic:'18K/mo',content:72,ads:'Media',weakness:'Brand poco conosciuto'},
        {name:'Televita',domain:'televita.it',da:61,traffic:'28K/mo',content:79,ads:'Bassa',weakness:'UX datata, no e-commerce'},
        {name:'InFamiglia',domain:'infamiglia.com',da:38,traffic:'8K/mo',content:61,ads:'Nessuna',weakness:'Budget marketing limitato'},
      ].map(c=>`
      <div class="card p-4 cursor-pointer hover:border-purple-500 transition-all">
        <div class="flex items-center justify-between mb-2">
          <span class="font-bold text-white text-sm">${c.name}</span>
          <span class="badge badge-purple">DA ${c.da}</span>
        </div>
        <p class="text-xs text-slate-400 mb-2">${c.domain}</p>
        <div class="space-y-1 text-xs">
          <div class="flex justify-between"><span class="text-slate-500">Traffico</span><span class="text-slate-300">${c.traffic}</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Content Score</span><span class="text-purple-400">${c.content}/100</span></div>
          <div class="flex justify-between"><span class="text-slate-500">Ads</span><span class="text-slate-300">${c.ads}</span></div>
        </div>
        <div class="mt-2 p-2 rounded text-xs" style="background:rgba(16,185,129,.1);color:#34d399">
          <i class="fas fa-bolt mr-1"></i>${c.weakness}
        </div>
      </div>`).join('')}
    </div>
    <div class="card p-5">
      <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
        <i class="fas fa-table text-purple-400"></i> Matrice Comparativa AI
      </h3>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="text-slate-500 border-b border-slate-700">
              <th class="text-left pb-3 font-medium">Feature</th>
              <th class="text-center pb-3 font-medium text-purple-400">eCura</th>
              <th class="text-center pb-3 font-medium">Beghelli</th>
              <th class="text-center pb-3 font-medium">Seremy</th>
              <th class="text-center pb-3 font-medium">Televita</th>
              <th class="text-center pb-3 font-medium">InFamiglia</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            ${[
              ['AI Rilevamento Cadute','✅','❌','✅','❌','❌'],
              ['GPS Real-time','✅','✅','✅','❌','✅'],
              ['Certificazione CE IIa','✅','✅','❌','✅','❌'],
              ['App Mobile','✅','✅','✅','❌','✅'],
              ['Centrale H24','✅','✅','✅','✅','✅'],
              ['E-commerce diretto','✅','❌','✅','❌','❌'],
              ['Piano da €390/anno','✅','❌','❌','❌','✅'],
              ['Contenuto SEO (score)','88/100','85/100','72/100','79/100','61/100'],
              ['Presenza social','Media','Alta','Bassa','Media','Bassa'],
            ].map(r=>`
            <tr class="hover:bg-slate-800/30">
              <td class="py-2 text-slate-300 font-medium">${r[0]}</td>
              <td class="py-2 text-center font-bold text-purple-400">${r[1]}</td>
              <td class="py-2 text-center text-slate-400">${r[2]}</td>
              <td class="py-2 text-center text-slate-400">${r[3]}</td>
              <td class="py-2 text-center text-slate-400">${r[4]}</td>
              <td class="py-2 text-center text-slate-400">${r[5]}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div class="card p-5">
      <h3 class="font-semibold text-white mb-3 flex items-center gap-2">
        <i class="fas fa-brain text-purple-400"></i> Raccomandazioni AI
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        ${[
          {t:'Punti di forza unici',d:'eCura è l\'unico con certificazione CE Classe IIa + AI rilevamento cadute + piano annuale economico. Comunica questi 3 vantaggi in ogni contenuto.',i:'fa-trophy',c:'#f59e0b'},
          {t:'Gap da colmare',d:'Beghelli ha un brand riconoscimento 3x superiore. Punta su testimonianze reali, review Google e press coverage per costruire trust.',i:'fa-chart-line',c:'#7C3AED'},
          {t:'Opportunità immediata',d:'InFamiglia (DA 38) sta perdendo posizioni. Con 3 articoli targetizzati sulle sue keyword principali, eCura può sottrarre 2000 visite/mese.',i:'fa-crosshairs',c:'#10b981'},
        ].map(r=>`
        <div class="p-4 rounded-lg border border-slate-700">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas ${r.i}" style="color:${r.c}"></i>
            <span class="text-sm font-semibold text-white">${r.t}</span>
          </div>
          <p class="text-xs text-slate-400">${r.d}</p>
        </div>`).join('')}
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════
     TAB 5: RICERCA WEB PROFONDA
══════════════════════════════════════════════════════════════ -->
<div id="panel-deepresearch" class="tab-panel">
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-1">
      <div class="card p-5">
        <h2 class="font-bold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-microscope text-purple-400"></i> Deep Research AI
        </h2>
        <p class="text-xs text-slate-400 mb-4">L'AI esegue una ricerca approfondita su fonti primarie, studi scientifici e dati di mercato per eCura.</p>
        <div class="space-y-3">
          <textarea class="w-full px-3 py-2 text-sm h-24 resize-none" placeholder="Descrivi cosa vuoi ricercare in profondità...">Statistiche cadute anziani Italia 2025-2026, impatto economico e soluzioni tecnologiche emergenti</textarea>
          <select class="w-full px-3 py-2 text-sm">
            <option>Ricerca standard (5 fonti)</option>
            <option>Ricerca approfondita (15 fonti)</option>
            <option>Analisi scientifica (PubMed + studi)</option>
            <option>Ricerca mercato (report settore)</option>
          </select>
          <div class="flex gap-2">
            <label class="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked class="accent-purple-500"> PubMed
            </label>
            <label class="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked class="accent-purple-500"> ISTAT
            </label>
            <label class="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
              <input type="checkbox" checked class="accent-purple-500"> ISS
            </label>
          </div>
        </div>
        <button onclick="runDeepResearch()" class="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
          <i class="fas fa-satellite-dish mr-2"></i>Avvia Ricerca Profonda
        </button>
      </div>
    </div>
    <div class="lg:col-span-2 space-y-3" id="deep-results">
      ${[
        {src:'ISTAT 2025',rel:97,t:'Cadute: prima causa di morte accidentale over 65 in Italia',d:'Nel 2025 sono stati registrati 412.000 ricoveri per cadute tra gli over 65, con un costo per il SSN di 4,8 miliardi di euro. Il 35% delle cadute avviene di notte tra le 23:00 e le 07:00.','use':'Usa in: homepage hero, landing page, comunicati stampa'},
        {src:'ISS — Istituto Superiore Sanità',rel:95,t:'Efficacia dei sistemi di telesoccorso nella riduzione della mortalità',d:'Uno studio su 8.200 anziani con dispositivi di telesoccorso mostra una riduzione del 41% della mortalità da caduta grazie alla riduzione del tempo di intervento da 4,2h a 12 minuti.','use':'Usa in: articoli scientifici, presentazioni medici'},
        {src:'Frost & Sullivan Market Report',rel:89,t:'Mercato teleassistenza Italia: CAGR +18.4% fino al 2028',d:'Il mercato della teleassistenza in Italia crescerà da 420M€ (2024) a 890M€ (2028). Il segmento "AI-enhanced monitoring" crescerà a CAGR +34% trainato da invecchiamento demografico.','use':'Usa in: pitch investor, comunicati, blog settore'},
        {src:'The Lancet — Digital Health 2026',rel:93,t:'Machine Learning per la prevenzione delle cadute: accuracy 94.7%',d:'Meta-analisi di 23 studi su 45.000 pazienti. I sistemi ML di rilevamento cadute basati su accelerometria raggiungono accuracy del 94.7%, superando gli standard clinici tradizionali.','use':'Usa in: scheda tecnica prodotto, blog tecnologia'},
        {src:'Censis 2025 — Anziani e Tecnologia',rel:91,t:'Il 67% dei figli vorrebbe tecnologia di monitoraggio per i genitori anziani',d:'Solo il 12% degli anziani dispone attualmente di un dispositivo di monitoraggio. Il gap tra domanda latente (67%) e adozione (12%) rappresenta un mercato potenziale di 4,2 milioni di famiglie italiane.','use':'Usa in: advertising, copy landing page, email marketing'},
      ].map(r=>`
      <div class="card p-4">
        <div class="flex items-start gap-3">
          <div class="shrink-0">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style="background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(79,70,229,.3))">
              <i class="fas fa-file-alt text-purple-400"></i>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="text-xs font-medium text-purple-300">${r.src}</span>
              <span class="badge badge-green"><i class="fas fa-shield-alt text-xs"></i> Affidabilità ${r.rel}%</span>
            </div>
            <p class="text-sm font-semibold text-white mb-1">${r.t}</p>
            <p class="text-xs text-slate-400 leading-relaxed mb-2">${r.d}</p>
            <div class="flex items-center justify-between">
              <span class="text-xs text-purple-400 italic"><i class="fas fa-lightbulb mr-1"></i>${r.use}</span>
              <button class="text-xs px-2 py-1 rounded border border-purple-600 text-purple-400 hover:bg-purple-600/20 transition-all">
                Usa nel contenuto
              </button>
            </div>
          </div>
        </div>
      </div>`).join('')}
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════
     TAB 6: PUNTEGGIO CONTENUTO AI
══════════════════════════════════════════════════════════════ -->
<div id="panel-score" class="tab-panel">
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
    <div class="lg:col-span-3">
      <div class="card p-5 h-full flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-white flex items-center gap-2">
            <i class="fas fa-star text-purple-400"></i> Analizza Contenuto
          </h2>
          <button onclick="scoreContent()" class="px-4 py-1.5 text-xs rounded-lg text-white font-medium hover:opacity-90" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
            <i class="fas fa-magic mr-1"></i>Analizza con AI
          </button>
        </div>
        <div class="mb-2 flex items-center gap-2">
          <input type="text" placeholder="Keyword target..." value="bracciale cadute anziani" class="px-3 py-1.5 text-sm flex-1">
        </div>
        <textarea id="score-input" class="flex-1 w-full px-3 py-2 text-sm resize-none min-h-64" 
                  oninput="liveScore(this.value)"
                  placeholder="Incolla qui il tuo contenuto per analizzarlo..."
>Il bracciale eCura è il dispositivo di teleassistenza più avanzato per anziani in Italia. Con tecnologia AI di rilevamento cadute certificata CE Classe IIa, il bracciale eCura protegge i tuoi cari 24 ore su 24. Il servizio include una centrale operativa attiva H24 con operatori specializzati pronti a intervenire in meno di 45 secondi dalla rilevazione di una caduta o dalla pressione del tasto SOS.

Caratteristiche principali del bracciale eCura:
- Rilevamento automatico cadute con AI (accuracy 94.7%)
- GPS integrato per localizzazione in tempo reale  
- Impermeabile IP67 (resistente all'acqua)
- Batteria 72 ore di autonomia
- App mobile per familiari e caregiver
- Piani da €390/anno tutto incluso</textarea>
      </div>
    </div>
    <div class="lg:col-span-2 space-y-4">
      <div class="card p-5">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-semibold text-white">Score AI Contenuto</h3>
          <div class="text-3xl font-black" id="total-score" style="color:#a78bfa">76<span class="text-lg">/100</span></div>
        </div>
        <div class="space-y-3" id="score-breakdown">
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400">Lunghezza (attuale: 118 parole / target: 1200+)</span>
              <span class="text-red-400 font-medium">18/25</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:72%;background:#ef4444"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400">Densità keyword (3.4% — ottimale 1-3%)</span>
              <span class="text-yellow-400 font-medium">17/20</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:85%;background:#f59e0b"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400">Struttura headings (H1 + H2 + H3)</span>
              <span class="text-red-400 font-medium">5/15</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:33%;background:#ef4444"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400">Link interni presenti</span>
              <span class="text-red-400 font-medium">0/10</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:0%;background:#ef4444"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400">Link esterni autorevoli</span>
              <span class="text-red-400 font-medium">0/10</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:0%;background:#ef4444"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400">Meta description ottimizzata</span>
              <span class="text-green-400 font-medium">10/10</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:100%;background:#10b981"></div></div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-400">Leggibilità (Flesch-Kincaid IT)</span>
              <span class="text-green-400 font-medium">16/10</span>
            </div>
            <div class="progress-bar"><div class="progress-fill" style="width:100%;background:#10b981"></div></div>
          </div>
        </div>
      </div>
      <div class="card p-4">
        <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-lightbulb text-yellow-400"></i> Suggerimenti AI
        </h3>
        <div class="space-y-2">
          <div class="p-2 rounded text-xs border-l-2" style="background:rgba(239,68,68,.1);border-color:#ef4444;color:#f87171">
            <strong>Critico:</strong> Aggiungi 1.100+ parole. I top risultati Google hanno in media 1.930 parole.
          </div>
          <div class="p-2 rounded text-xs border-l-2" style="background:rgba(239,68,68,.1);border-color:#ef4444;color:#f87171">
            <strong>Critico:</strong> Struttura il contenuto con H2 (sezioni principali) e H3 (sottosezioni).
          </div>
          <div class="p-2 rounded text-xs border-l-2" style="background:rgba(245,158,11,.1);border-color:#f59e0b;color:#fbbf24">
            <strong>Importante:</strong> Aggiungi 2-3 link interni a pagine correlate del sito.
          </div>
          <div class="p-2 rounded text-xs border-l-2" style="background:rgba(245,158,11,.1);border-color:#f59e0b;color:#fbbf24">
            <strong>Importante:</strong> Cita 1-2 fonti autorevoli (ISTAT, ISS) con link esterni.
          </div>
          <div class="p-2 rounded text-xs border-l-2" style="background:rgba(16,185,129,.1);border-color:#10b981;color:#34d399">
            <strong>Bene:</strong> La densità keyword è ottimale (3.4% — riduci leggermente a 2%).
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- TAB 7: LINK INTERNI -->
<div id="panel-internal" class="tab-panel">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="card p-5">
      <h2 class="font-bold text-white mb-4 flex items-center gap-2">
        <i class="fas fa-link text-purple-400"></i> Analisi Link Interni
      </h2>
      <p class="text-xs text-slate-400 mb-4">L'AI mappa la struttura dei link interni del sito eCura e suggerisce connessioni ottimali per migliorare il crawl budget e il Page Rank interno.</p>
      <div class="space-y-3">
        <div class="p-3 rounded-lg border border-slate-700" style="background:#0f172a">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-white">Homepage (ecura-landing.pages.dev/)</span>
            <span class="badge badge-purple">Page Rank: Alto</span>
          </div>
          <div class="space-y-1.5 text-xs text-slate-400">
            <div class="flex items-center gap-2"><i class="fas fa-arrow-right text-purple-400"></i> → /come-funziona (2 link)</div>
            <div class="flex items-center gap-2"><i class="fas fa-arrow-right text-purple-400"></i> → /piani-prezzi (3 link)</div>
            <div class="flex items-center gap-2"><i class="fas fa-arrow-right text-purple-400"></i> → /contatti (1 link)</div>
            <div class="flex items-center gap-2 text-red-400"><i class="fas fa-exclamation-circle"></i> Mancante: /blog (0 link dalla homepage)</div>
            <div class="flex items-center gap-2 text-red-400"><i class="fas fa-exclamation-circle"></i> Mancante: /testimonial (0 link)</div>
          </div>
        </div>
        <div class="p-3 rounded-lg" style="background:rgba(124,58,237,.1); border: 1px solid rgba(124,58,237,.3)">
          <p class="text-xs text-purple-300 font-semibold mb-2"><i class="fas fa-robot mr-1"></i>Piano Link Interni AI</p>
          <div class="space-y-1.5 text-xs text-slate-300">
            <p>• Aggiungi "Leggi le nostre testimonianze" nella sezione hero → /testimonial</p>
            <p>• Footer: link esplicito a /blog "Consigli per anziani e caregiver"</p>
            <p>• Ogni articolo blog deve linkare a /piani-prezzi (anchor: "scopri eCura")</p>
            <p>• Pagina /come-funziona deve linkare a /blog/rilevamento-cadute-ai</p>
            <p>• Sezione FAQ deve linkare a /contatti per ogni domanda senza risposta diretta</p>
          </div>
        </div>
      </div>
    </div>
    <div class="card p-5">
      <h3 class="font-semibold text-white mb-4">Opportunità di Collegamento AI</h3>
      <div class="space-y-3">
        <div class="p-3 rounded-lg border border-yellow-600/30" style="background:rgba(245,158,11,.05)">
          <div class="flex items-center gap-2 mb-1">
            <i class="fas fa-exclamation-triangle text-yellow-400 text-xs"></i>
            <span class="text-xs font-semibold text-yellow-300">Pagine Orfane (0 link in entrata)</span>
          </div>
          <ul class="text-xs text-slate-400 space-y-1 mt-2">
            <li class="flex items-center gap-2"><i class="fas fa-circle text-xs text-red-400"></i>/blog/cadute-anziani-statistiche-2025</li>
            <li class="flex items-center gap-2"><i class="fas fa-circle text-xs text-red-400"></i>/blog/bracciale-medicale-come-scegliere</li>
            <li class="flex items-center gap-2"><i class="fas fa-circle text-xs text-yellow-400"></i>/faq (solo 1 link da homepage)</li>
          </ul>
        </div>
        <div class="p-3 rounded-lg border border-green-600/30" style="background:rgba(16,185,129,.05)">
          <div class="flex items-center gap-2 mb-1">
            <i class="fas fa-check-circle text-green-400 text-xs"></i>
            <span class="text-xs font-semibold text-green-300">Anchor Text Raccomandati per blog → homepage</span>
          </div>
          <div class="flex flex-wrap gap-1 mt-2">
            <span class="tag" style="background:rgba(16,185,129,.2);color:#34d399">"bracciale teleassistenza eCura"</span>
            <span class="tag" style="background:rgba(16,185,129,.2);color:#34d399">"servizio eCura"</span>
            <span class="tag" style="background:rgba(16,185,129,.2);color:#34d399">"scopri il piano eCura"</span>
            <span class="tag" style="background:rgba(16,185,129,.2);color:#34d399">"attiva eCura"</span>
          </div>
        </div>
        <div class="p-3 rounded-lg border border-purple-600/30" style="background:rgba(124,58,237,.05)">
          <p class="text-xs text-purple-300 font-semibold mb-2"><i class="fas fa-sitemap mr-1"></i>Struttura Hub & Spoke AI</p>
          <p class="text-xs text-slate-400">Crea una "pillar page" su /teleassistenza-anziani-guida-completa che colleghi tutti gli articoli del blog come spoke. Questo concentrerà il PageRank sulla pagina più importante.</p>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- TAB 8: LINK ESTERNI -->
<div id="panel-external" class="tab-panel">
  <div class="space-y-4">
    <div class="card p-5">
      <h2 class="font-bold text-white mb-2 flex items-center gap-2">
        <i class="fas fa-external-link-alt text-purple-400"></i> Link Esterni Autorevoli
      </h2>
      <p class="text-xs text-slate-400 mb-4">Citare fonti autorevoli migliora la credibilità E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) del contenuto agli occhi di Google.</p>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="text-slate-500 border-b border-slate-700">
              <th class="text-left pb-2 font-medium">Fonte</th>
              <th class="text-left pb-2 font-medium">URL</th>
              <th class="text-center pb-2 font-medium">DA</th>
              <th class="text-left pb-2 font-medium pl-3">Anchor Text</th>
              <th class="text-center pb-2 font-medium">Rel</th>
              <th class="text-center pb-2 font-medium">Usa in</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr class="hover:bg-slate-800/30">
              <td class="py-2.5 text-white font-medium">ISTAT</td>
              <td class="py-2.5 text-blue-400">istat.it/statistiche-anziani</td>
              <td class="py-2.5 text-center"><span class="badge badge-green">92</span></td>
              <td class="py-2.5 pl-3 text-slate-300">"dati ISTAT sulle cadute"</td>
              <td class="py-2.5 text-center text-slate-400">nofollow</td>
              <td class="py-2.5 text-center"><span class="badge badge-blue">Blog</span></td>
            </tr>
            <tr class="hover:bg-slate-800/30">
              <td class="py-2.5 text-white font-medium">ISS</td>
              <td class="py-2.5 text-blue-400">epicentro.iss.it</td>
              <td class="py-2.5 text-center"><span class="badge badge-green">89</span></td>
              <td class="py-2.5 pl-3 text-slate-300">"Istituto Superiore di Sanità"</td>
              <td class="py-2.5 text-center text-slate-400">nofollow</td>
              <td class="py-2.5 text-center"><span class="badge badge-blue">Blog</span></td>
            </tr>
            <tr class="hover:bg-slate-800/30">
              <td class="py-2.5 text-white font-medium">Ministero Salute</td>
              <td class="py-2.5 text-blue-400">salute.gov.it</td>
              <td class="py-2.5 text-center"><span class="badge badge-green">88</span></td>
              <td class="py-2.5 pl-3 text-slate-300">"dispositivi medici certificati"</td>
              <td class="py-2.5 text-center text-slate-400">nofollow</td>
              <td class="py-2.5 text-center"><span class="badge badge-purple">Landing</span></td>
            </tr>
            <tr class="hover:bg-slate-800/30">
              <td class="py-2.5 text-white font-medium">PubMed</td>
              <td class="py-2.5 text-blue-400">pubmed.ncbi.nlm.nih.gov</td>
              <td class="py-2.5 text-center"><span class="badge badge-green">97</span></td>
              <td class="py-2.5 pl-3 text-slate-300">"studio clinico rilevamento cadute"</td>
              <td class="py-2.5 text-center text-slate-400">nofollow</td>
              <td class="py-2.5 text-center"><span class="badge badge-blue">Blog</span></td>
            </tr>
            <tr class="hover:bg-slate-800/30">
              <td class="py-2.5 text-white font-medium">Wikipedia IT</td>
              <td class="py-2.5 text-blue-400">it.wikipedia.org/Telesoccorso</td>
              <td class="py-2.5 text-center"><span class="badge badge-green">93</span></td>
              <td class="py-2.5 pl-3 text-slate-300">"telesoccorso"</td>
              <td class="py-2.5 text-center text-slate-400">nofollow</td>
              <td class="py-2.5 text-center"><span class="badge badge-blue">Blog</span></td>
            </tr>
            <tr class="hover:bg-slate-800/30">
              <td class="py-2.5 text-white font-medium">CE Marking EU</td>
              <td class="py-2.5 text-blue-400">ec.europa.eu/MDR</td>
              <td class="py-2.5 text-center"><span class="badge badge-green">95</span></td>
              <td class="py-2.5 pl-3 text-slate-300">"Regolamento UE Dispositivi Medici"</td>
              <td class="py-2.5 text-center text-slate-400">nofollow</td>
              <td class="py-2.5 text-center"><span class="badge badge-purple">Landing</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 p-3 rounded-lg" style="background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.3)">
        <p class="text-xs text-purple-300"><i class="fas fa-robot mr-1"></i><strong>Linea guida AI:</strong> Usa sempre rel="nofollow" per link a siti istituzionali e competitor. I link a fonti con DA superiore a 80 aumentano il trust del contenuto del +23% secondo gli studi su E-E-A-T.</p>
      </div>
    </div>
  </div>
</div>

<!-- TAB 9: BACKLINK -->
<div id="panel-backlink" class="tab-panel">
  <div class="space-y-5">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat-card text-center">
        <p class="text-2xl font-black text-purple-400">47</p>
        <p class="text-xs text-slate-400 mt-1">Backlink Totali</p>
        <p class="text-xs text-green-400 mt-0.5">+8 questo mese</p>
      </div>
      <div class="stat-card text-center">
        <p class="text-2xl font-black text-blue-400">23</p>
        <p class="text-xs text-slate-400 mt-1">Domini Referenti</p>
        <p class="text-xs text-green-400 mt-0.5">+3 questo mese</p>
      </div>
      <div class="stat-card text-center">
        <p class="text-2xl font-black text-yellow-400">38</p>
        <p class="text-xs text-slate-400 mt-1">DA Medio Referring</p>
        <p class="text-xs text-slate-500 mt-0.5">Target: 50+</p>
      </div>
      <div class="stat-card text-center">
        <p class="text-2xl font-black text-green-400">82%</p>
        <p class="text-xs text-slate-400 mt-1">Link Dofollow</p>
        <p class="text-xs text-green-400 mt-0.5">Ottimo ratio</p>
      </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <div class="card p-5">
        <h3 class="font-semibold text-white mb-3">Backlink Esistenti — Top 10</h3>
        <div class="space-y-2">
          ${[
            {domain:'medicagb.it',da:41,type:'dofollow',anchor:'eCura bracciale teleassistenza'},
            {domain:'anziani.info',da:35,type:'dofollow',anchor:'servizi teleassistenza anziani'},
            {domain:'caregiver-italia.it',da:28,type:'nofollow',anchor:'bracciale SOS'},
            {domain:'saluteseniores.it',da:31,type:'dofollow',anchor:'teleassistenza domiciliare'},
            {domain:'seniornews.it',da:26,type:'dofollow',anchor:'eCura'},
            {domain:'famigliaperfetta.blog',da:19,type:'nofollow',anchor:'dispositivo emergenza nonno'},
            {domain:'casafacile.it',da:44,type:'dofollow',anchor:'sicurezza casa anziani'},
            {domain:'genitorianziani.com',da:22,type:'dofollow',anchor:'telesoccorso prezzi'},
            {domain:'assiroma.it',da:33,type:'nofollow',anchor:'bracciale medicale'},
            {domain:'magazine65.it',da:18,type:'dofollow',anchor:'eCura Medica GB'},
          ].map(b=>`
          <div class="flex items-center justify-between p-2 rounded" style="background:#0f172a">
            <div class="flex items-center gap-2 min-w-0">
              <span class="badge badge-purple shrink-0">DA ${b.da}</span>
              <span class="text-xs text-slate-300 truncate">${b.domain}</span>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-2">
              <span class="text-xs text-slate-500 hidden sm:block">${b.anchor.substring(0,20)}...</span>
              <span class="badge ${b.type==='dofollow'?'badge-green':'badge-yellow'}">${b.type}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>
      <div class="card p-5">
        <h3 class="font-semibold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-magnet text-purple-400"></i> Opportunità Link Building AI
        </h3>
        <div class="space-y-3">
          ${[
            {name:'Fondazione ISTUD Sanità',da:52,type:'Guest Post',desc:'Accettano articoli di esperti su tech&salute. Scrivi su "AI per la prevenzione cadute".'},
            {name:'Quotidiano Sanità',da:61,type:'Comunicato',desc:'Invita un comunicato stampa per lancio nuovo piano eCura o dati di risultato.'},
            {name:'Forum Pensionati IT (3 forum)',da:28,type:'Forum',desc:'Rispondi a domande su "bracciale SOS" con link a eCura come risorsa utile.'},
            {name:'Medici di Famiglia (blog network)',da:35,type:'Partnership',desc:'Offri accesso gratuito a 3 MMG per review/testimonianza + link dal loro blog.'},
            {name:'Comune di Milano — Servizi Anziani',da:71,type:'Istituzionale',desc:'Proponi accordo per citare eCura come risorsa raccomandata per anziani soli.'},
          ].map(o=>`
          <div class="p-3 rounded-lg border border-slate-700 hover:border-purple-600 transition-all" style="background:#0f172a">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-semibold text-white">${o.name}</span>
              <div class="flex items-center gap-1.5">
                <span class="badge badge-purple">DA ${o.da}</span>
                <span class="badge badge-blue">${o.type}</span>
              </div>
            </div>
            <p class="text-xs text-slate-400">${o.desc}</p>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</div>

<!-- TAB 10: IMMAGINI AI -->
<div id="panel-images" class="tab-panel">
  <div class="space-y-5">
    <div class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-bold text-white flex items-center gap-2">
          <i class="fas fa-image text-purple-400"></i> Generatore Immagini AI per eCura
        </h2>
        <span class="badge badge-purple"><i class="fas fa-robot mr-1"></i>Powered by AI</span>
      </div>
      <p class="text-xs text-slate-400 mb-4">Genera immagini ottimizzate per blog, landing page, ads e social media. Ogni prompt è pre-calibrato per il target di eCura (famiglie italiane, anziani, caregiver).</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        ${[
          {t:'Anziano Felice con Bracciale',prompt:'Elderly Italian man smiling, wearing a modern medical wristband, bright home background, warm family atmosphere, photorealistic, 4K',cat:'Hero / Landing',ico:'fa-smile'},
          {t:'Famiglia che Abbraccia Nonno',prompt:'Happy Italian multigenerational family hugging elderly grandfather wearing smartwatch, sunny living room, emotional, commercial photography style',cat:'Social Media',ico:'fa-heart'},
          {t:'Bracciale eCura Closeup',prompt:'Modern medical wristband device, close-up product shot, white background, clean minimal design, professional product photography, 8K',cat:'Prodotto',ico:'fa-bracelet'},
          {t:'Centrale Operativa H24',prompt:'Modern Italian emergency call center with operators at screens at night, blue ambient lighting, professional, cinematic',cat:'Blog / PR',ico:'fa-headset'},
          {t:'Caduta Prevenuta (Before/After)',prompt:'Split screen: left side - elderly woman alone fallen, right side - same woman safe helped by medical bracelet alert, infographic style, soft colors',cat:'Blog Educativo',ico:'fa-shield-alt'},
          {t:'App Mobile eCura',prompt:'Smartphone showing Italian health app interface with elderly monitoring dashboard, family photo in background, lifestyle photography',cat:'App Store / Ads',ico:'fa-mobile-alt'},
        ].map(img=>`
        <div class="content-card p-4">
          <div class="w-full h-28 rounded-lg mb-3 flex items-center justify-center" style="background:linear-gradient(135deg,rgba(124,58,237,.2),rgba(79,70,229,.2));border:1px dashed rgba(124,58,237,.4)">
            <i class="fas ${img.ico} text-3xl text-purple-400 opacity-60"></i>
          </div>
          <h4 class="text-sm font-semibold text-white mb-1">${img.t}</h4>
          <span class="badge badge-purple mb-2">${img.cat}</span>
          <p class="text-xs text-slate-500 leading-relaxed mb-3">${img.prompt.substring(0,80)}...</p>
          <button onclick="window.open('/admin/ai-marketing#images','_self')" 
                  class="w-full py-1.5 text-xs rounded-lg text-white hover:opacity-90" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
            <i class="fas fa-magic mr-1"></i>Genera con AI
          </button>
        </div>`).join('')}
      </div>
    </div>
    <div class="card p-4">
      <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <i class="fas fa-info-circle text-purple-400"></i> Linee Guida AI per Immagini eCura
      </h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        ${[
          {t:'Formato ottimale',d:'Blog: 1200×628px (16:9) · Landing hero: 1920×1080px · Social Instagram: 1080×1080px · Google Ads: 1200×628px + 300×250px'},
          {t:'Palette colori brand',d:'Teal primario #068D86 · Arancio caldo #F4A261 · Bianco pulito #FFFFFF · Sfondo caldo #FFF8F0. Evita colori freddi o ospedalieri.'},
          {t:'Stile visivo',d:'Fotorealistico, caldo, familiare. Anziani attivi (non malati). Ambienti domestici italiani. Lighting soffuso e naturale. Evita stock generico.'},
        ].map(g=>`
        <div class="p-3 rounded-lg" style="background:#0f172a">
          <p class="text-xs font-semibold text-purple-300 mb-1">${g.t}</p>
          <p class="text-xs text-slate-400">${g.d}</p>
        </div>`).join('')}
      </div>
    </div>
  </div>
</div>

<!-- TAB 11: TARGETING PUBBLICO -->
<div id="panel-audience" class="tab-panel">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div class="space-y-4">
      <div class="card p-5">
        <h2 class="font-bold text-white mb-4 flex items-center gap-2">
          <i class="fas fa-users text-purple-400"></i> Segmenti Audience AI
        </h2>
        <div class="space-y-3">
          ${[
            {name:'Figli Caregiver (35-55 anni)',size:'4.2M IT',intent:'Alto',kw:['bracciale nonno','teleassistenza genitore anziano','sicurezza mamma sola'],color:'#7C3AED',desc:'Principale decision maker. Cerca online di notte. Motivati da senso di colpa e paura.'},
            {name:'Anziani Attivi (65-75 anni)',size:'2.8M IT',intent:'Medio',kw:['allarme caduta','bracciale SOS','sicurezza casa'],color:'#4F46E5',desc:'Sempre più digitali. Acquistano per autonomia. Cercano indipendenza, non "controllo".'},
            {name:'Medici di Famiglia (MMG)',size:'45K IT',intent:'Alto B2B',kw:['dispositivo medico telesoccorso','raccomandare paziente anziano'],color:'#0891b2',desc:'Referral key. Un medico può portare 5-10 pazienti/anno. Priorità: certificazione CE.'},
            {name:'RSA & Case di Riposo',size:'12K strutture',intent:'Alto B2B',kw:['telesoccorso RSA','monitoraggio ospiti anziani'],color:'#059669',desc:'Contratti annuali per 20-200 unità. Alto LTV. Ciclo vendita 3-6 mesi.'},
          ].map(seg=>`
          <div class="p-4 rounded-lg border border-slate-700 hover:border-purple-600 transition-all cursor-pointer" style="background:#0f172a">
            <div class="flex items-start justify-between mb-2">
              <div>
                <h4 class="text-sm font-semibold text-white">${seg.name}</h4>
                <p class="text-xs text-slate-400 mt-1">${seg.desc}</p>
              </div>
              <div class="text-right shrink-0 ml-3">
                <div class="text-sm font-bold" style="color:${seg.color}">${seg.size}</div>
                <span class="badge badge-purple mt-1">${seg.intent}</span>
              </div>
            </div>
            <div class="flex flex-wrap gap-1 mt-2">
              ${seg.kw.map(k=>`<span class="tag" style="background:rgba(124,58,237,.15);color:#a78bfa">${k}</span>`).join('')}
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>
    <div class="space-y-4">
      <div class="card p-5">
        <h3 class="font-semibold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-map-marker-alt text-purple-400"></i> Geo Targeting Italia — AI Priority
        </h3>
        <div class="space-y-2">
          ${[
            {city:'Milano + Nord-Ovest',pop:'6.7M 65+',idx:100,opp:'Alta'},
            {city:'Roma + Lazio',pop:'4.1M 65+',idx:91,opp:'Alta'},
            {city:'Napoli + Campania',pop:'3.2M 65+',idx:74,opp:'Media'},
            {city:'Torino + Piemonte',pop:'2.9M 65+',idx:88,opp:'Alta'},
            {city:'Bologna + Emilia-R.',pop:'2.4M 65+',idx:82,opp:'Alta'},
            {city:'Firenze + Toscana',pop:'2.1M 65+',idx:79,opp:'Media'},
            {city:'Palermo + Sicilia',pop:'2.8M 65+',idx:56,opp:'Bassa'},
            {city:'Venezia + Veneto',pop:'2.3M 65+',idx:76,opp:'Media'},
          ].map(c=>`
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-300 w-40 shrink-0">${c.city}</span>
            <div class="flex-1 progress-bar">
              <div class="progress-fill" style="width:${c.idx}%;background:linear-gradient(90deg,#7C3AED,#4F46E5)"></div>
            </div>
            <span class="text-xs text-slate-400 w-16 text-right shrink-0">${c.pop}</span>
            <span class="badge ${c.opp==='Alta'?'badge-green':c.opp==='Media'?'badge-yellow':'badge-red'} shrink-0">${c.opp}</span>
          </div>`).join('')}
        </div>
      </div>
      <div class="card p-4">
        <h3 class="text-sm font-semibold text-white mb-3">AI Persona Builder</h3>
        <div class="p-4 rounded-lg" style="background:#0f172a">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-xl" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">👩</div>
            <div>
              <p class="text-sm font-semibold text-white">Laura, 48 anni · Milano</p>
              <p class="text-xs text-slate-400">Responsabile vendite, madre di 2, figlia unica</p>
            </div>
          </div>
          <div class="space-y-1.5 text-xs text-slate-400">
            <p><strong class="text-purple-300">Pain:</strong> Mamma 78 anni vive sola a Brescia. Laura lavora 10h/giorno e non può controllarla.</p>
            <p><strong class="text-purple-300">Trigger:</strong> Mamma è caduta 2 settimane fa. Laura è in panico.</p>
            <p><strong class="text-purple-300">Cerca:</strong> "bracciale emergenza anziani" alle 22:30 dal telefono.</p>
            <p><strong class="text-purple-300">Obiezioni:</strong> "E se mamma non lo indossa?" "Costa troppo?"</p>
            <p><strong class="text-purple-300">Messaggio vincente:</strong> "Tua madre è al sicuro. Anche mentre lavori."</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- TAB 12: VIDEO YOUTUBE -->
<div id="panel-youtube" class="tab-panel">
  <div class="space-y-5">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      ${[
        {t:'Come funziona il rilevamento cadute AI',dur:'3:45',views:'Est. 8-15K/mo',type:'Educativo',icon:'fa-brain',desc:'Spiega la tecnologia AI del bracciale con animazioni. Target: figli curiosi della tech.'},
        {t:'Testimonianza: Maria, 79 anni e famiglia',dur:'4:20',views:'Est. 12-20K/mo',type:'Storytelling',icon:'fa-heart',desc:'Storia reale di una famiglia che usa eCura. Alta conversione emotiva.'},
        {t:'eCura vs Beghelli: confronto onesto',dur:'6:30',views:'Est. 5-10K/mo',type:'Confronto',icon:'fa-balance-scale',desc:'Comparison video. Target: utenti in fase decisionale. Keyword alta conversione.'},
        {t:'Guida: come attivare eCura in 5 minuti',dur:'5:10',views:'Est. 3-7K/mo',type:'Tutorial',icon:'fa-play-circle',desc:'Video onboarding per nuovi clienti. Riduce abbandono e aumenta retention.'},
        {t:'10 domande frequenti su teleassistenza',dur:'8:45',views:'Est. 6-12K/mo',type:'FAQ',icon:'fa-question-circle',desc:'Risponde alle obiezioni più comuni. Ottimo per SEO YouTube e Google.'},
        {t:'eCura Unboxing e Prima Configurazione',dur:'7:20',views:'Est. 4-9K/mo',type:'Unboxing',icon:'fa-box-open',desc:'Video di apertura e setup. Target: nuovi clienti e curiosi pre-acquisto.'},
      ].map(v=>`
      <div class="content-card">
        <div class="w-full h-32 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden" style="background:linear-gradient(135deg,#1e0a3c,#0f172a);border:1px solid rgba(124,58,237,.3)">
          <i class="fas ${v.icon} text-4xl text-purple-400 opacity-40"></i>
          <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">${v.dur}</div>
          <div class="absolute top-2 left-2"><span class="badge badge-purple">${v.type}</span></div>
        </div>
        <h4 class="text-sm font-semibold text-white mb-1 leading-snug">${v.t}</h4>
        <p class="text-xs text-green-400 mb-1"><i class="fas fa-eye mr-1"></i>${v.views}</p>
        <p class="text-xs text-slate-400 mb-3">${v.desc}</p>
        <button onclick="generateYTContent('${v.t.replace(/'/g,"&#39;")}')" 
                class="w-full py-1.5 text-xs rounded-lg text-white hover:opacity-90" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
          <i class="fas fa-magic mr-1"></i>Genera Script + Tags
        </button>
      </div>`).join('')}
    </div>
    <!-- YT Content Generator -->
    <div class="card p-5">
      <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
        <i class="fab fa-youtube text-red-500"></i> Generatore Contenuto YouTube AI
      </h3>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div class="space-y-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Titolo Video</label>
            <input type="text" id="yt-title" class="w-full px-3 py-2 text-sm" value="Come funziona il rilevamento cadute AI di eCura">
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Tipo di contenuto</label>
            <select id="yt-type" class="w-full px-3 py-2 text-sm">
              <option>Educativo / Informativo</option>
              <option>Testimonianza / Review</option>
              <option>Confronto Prodotti</option>
              <option>Tutorial / How-To</option>
              <option>FAQ / Domande Frequenti</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Durata target</label>
            <select class="w-full px-3 py-2 text-sm">
              <option>Short (< 60 secondi)</option>
              <option>Medio (3-5 minuti)</option>
              <option>Lungo (6-10 minuti)</option>
            </select>
          </div>
          <button onclick="generateYTContent('')" class="w-full py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90" style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
            <i class="fas fa-magic mr-2"></i>Genera Titolo + Descrizione + Tags
          </button>
        </div>
        <div id="yt-output" class="p-4 rounded-lg text-xs space-y-3" style="background:#0f172a">
          <div>
            <p class="text-slate-500 font-semibold mb-1">TITOLO OTTIMIZZATO:</p>
            <p class="text-white font-medium">Come il Bracciale eCura Rileva le Cadute con AI — Tecnologia Spiegata Semplice (2026)</p>
          </div>
          <div>
            <p class="text-slate-500 font-semibold mb-1">DESCRIZIONE (primi 150 char per il preview):</p>
            <p class="text-slate-300">Scopri come l'intelligenza artificiale del bracciale eCura rileva le cadute in meno di 2 secondi e allerta automaticamente la centrale operativa H24...</p>
          </div>
          <div>
            <p class="text-slate-500 font-semibold mb-1">TAG YOUTUBE (25 tag ottimali):</p>
            <div class="flex flex-wrap gap-1">
              ${['teleassistenza anziani','bracciale cadute','eCura','rilevamento cadute AI','anziani sicurezza','telesoccorso','dispositivo medicale','caregiver','nonno sicuro','bracciale SOS','tecnologia anziani','AI salute','cadute prevenzione','Italia anziani','Medica GB'].map(t=>`<span class="tag" style="background:rgba(124,58,237,.2);color:#a78bfa">#${t}</span>`).join('')}
            </div>
          </div>
          <div>
            <p class="text-slate-500 font-semibold mb-1">THUMBNAIL COPY:</p>
            <p class="text-white font-bold text-sm">"AI RILEVA CADUTA IN 2 SECONDI"</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════
     TAB 13: GEO — AI SEARCH VISIBILITY (ChatGPT · Gemini · Perplexity)
══════════════════════════════════════════════════════════════ -->
<div id="panel-geo" class="tab-panel">

  <!-- HERO KPI BAR -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    <div class="stat-card text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-10" style="background:linear-gradient(135deg,#10a37f,#0d8a6b)"></div>
      <div class="relative">
        <div class="flex items-center justify-center gap-1.5 mb-1">
          <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg" class="w-4 h-4" alt="ChatGPT" onerror="this.style.display='none'">
          <span class="text-xs text-slate-400 font-medium">ChatGPT</span>
        </div>
        <p class="text-2xl font-black" style="color:#10a37f" id="gpt-score">34<span class="text-sm">/100</span></p>
        <p class="text-xs text-slate-500 mt-0.5">Visibilità GEO</p>
        <p class="text-xs text-orange-400 mt-1">↑ +8 vs mese scorso</p>
      </div>
    </div>
    <div class="stat-card text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-10" style="background:linear-gradient(135deg,#4285F4,#0F9D58)"></div>
      <div class="relative">
        <div class="flex items-center justify-center gap-1.5 mb-1">
          <i class="fab fa-google text-xs" style="color:#4285F4"></i>
          <span class="text-xs text-slate-400 font-medium">Gemini / AI Overviews</span>
        </div>
        <p class="text-2xl font-black text-blue-400" id="gemini-score">41<span class="text-sm">/100</span></p>
        <p class="text-xs text-slate-500 mt-0.5">Visibilità GEO</p>
        <p class="text-xs text-green-400 mt-1">↑ +12 vs mese scorso</p>
      </div>
    </div>
    <div class="stat-card text-center relative overflow-hidden">
      <div class="absolute inset-0 opacity-10" style="background:linear-gradient(135deg,#ef4444,#f97316)"></div>
      <div class="relative">
        <div class="flex items-center justify-center gap-1.5 mb-1">
          <i class="fas fa-search text-xs text-red-400"></i>
          <span class="text-xs text-slate-400 font-medium">Perplexity</span>
        </div>
        <p class="text-2xl font-black text-red-400" id="perplexity-score">28<span class="text-sm">/100</span></p>
        <p class="text-xs text-slate-500 mt-0.5">Visibilità GEO</p>
        <p class="text-xs text-red-400 mt-1">↓ −3 vs mese scorso</p>
      </div>
    </div>
    <div class="stat-card text-center">
      <div class="flex items-center justify-center gap-1.5 mb-1">
        <i class="fas fa-chart-line text-xs text-purple-400"></i>
        <span class="text-xs text-slate-400 font-medium">GEO Score Globale</span>
      </div>
      <p class="text-2xl font-black text-purple-400" id="geo-global">34<span class="text-sm">/100</span></p>
      <p class="text-xs text-slate-500 mt-0.5">Media ponderata</p>
      <p class="text-xs text-yellow-400 mt-1">Target: 70+</p>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- LEFT COLUMN: Prompt Scanner + Controls -->
    <div class="lg:col-span-1 space-y-4">

      <!-- Prompt Scanner -->
      <div class="card p-5">
        <h2 class="font-bold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-globe text-purple-400"></i> GEO Prompt Scanner
        </h2>
        <p class="text-xs text-slate-400 mb-4">Simula le domande reali che gli utenti fanno a ChatGPT, Gemini e Perplexity. Verifica se eCura viene citata nelle risposte AI.</p>
        <div class="space-y-3">
          <div>
            <label class="text-xs text-slate-400 block mb-1">Prompt da analizzare</label>
            <textarea id="geo-prompt-input" class="w-full px-3 py-2 text-sm h-20 resize-none"
              placeholder="Es: qual è il miglior bracciale di emergenza per anziani in Italia?"
            >Qual è il miglior bracciale di teleassistenza per anziani in Italia?</textarea>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Motore AI target</label>
            <select id="geo-engine" class="w-full px-3 py-2 text-sm">
              <option value="all">Tutti (ChatGPT + Gemini + Perplexity)</option>
              <option value="chatgpt">ChatGPT / GPT-4o</option>
              <option value="gemini">Gemini + Google AI Overview</option>
              <option value="perplexity">Perplexity AI</option>
              <option value="claude">Claude (Anthropic)</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-slate-400 block mb-1">Lingua / Mercato</label>
            <select class="w-full px-3 py-2 text-sm">
              <option>Italiano 🇮🇹</option>
              <option>Italiano + Inglese</option>
              <option>Inglese (mercato EU)</option>
            </select>
          </div>
        </div>
        <button onclick="runGeoScan()" id="geo-scan-btn"
                class="mt-4 w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
          <i class="fas fa-satellite-dish mr-2"></i>Scansiona AI Search
        </button>
      </div>

      <!-- Prompt Suggeriti -->
      <div class="card p-4">
        <h3 class="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <i class="fas fa-lightbulb text-yellow-400"></i> Prompt Strategici eCura
        </h3>
        <p class="text-xs text-slate-500 mb-2">Clicca per analizzare</p>
        <div class="space-y-1.5">
          ${[
            'Qual è il miglior bracciale di emergenza per anziani?',
            'Come funziona il rilevamento cadute con AI?',
            'Servizio teleassistenza anziani prezzi Italia',
            'Bracciale SOS anziani certificato medico',
            'Differenza tra telesoccorso e teleassistenza',
            'Chi offre assistenza H24 per anziani soli?',
            'Dispositivo medico cadute anziani raccomandato',
            'Come scegliere un bracciale GPS per nonno',
          ].map(p => `
          <button onclick="document.getElementById('geo-prompt-input').value='${p.replace(/'/g,"\\'")}'"
                  class="w-full text-left px-2.5 py-1.5 rounded text-xs text-slate-400 hover:text-purple-300 hover:bg-slate-700/50 transition-all">
            <i class="fas fa-chevron-right text-xs text-purple-600 mr-1"></i>${p}
          </button>`).join('')}
        </div>
      </div>
    </div>

    <!-- RIGHT COLUMN: Results -->
    <div class="lg:col-span-2 space-y-4">

      <!-- Scan Results Panel -->
      <div class="card p-5" id="geo-results-container">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-white flex items-center gap-2">
            <i class="fas fa-poll text-purple-400"></i> Risultati Scansione GEO
          </h3>
          <span class="badge badge-yellow" id="geo-last-scan">Ultima scan: 19 Lug 2026</span>
        </div>

        <!-- Loading state (hidden by default) -->
        <div id="geo-loading" class="hidden py-10 text-center">
          <div class="flex flex-col items-center gap-3">
            <div class="relative w-16 h-16">
              <div class="absolute inset-0 rounded-full border-2 border-purple-600/30"></div>
              <div class="absolute inset-0 rounded-full border-t-2 border-purple-400 animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <i class="fas fa-globe text-purple-400 text-lg"></i>
              </div>
            </div>
            <p class="text-sm text-purple-300 font-medium" id="geo-loading-step">Interrogazione ChatGPT in corso...</p>
            <p class="text-xs text-slate-500">Analisi risposta AI e citazioni del brand...</p>
          </div>
        </div>

        <!-- Results (shown by default with demo data) -->
        <div id="geo-results" class="space-y-3">

          <!-- ChatGPT result -->
          <div class="p-4 rounded-lg border" style="background:#0f172a; border-color:rgba(16,163,127,.3)">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold" style="background:#10a37f;color:white">G</div>
                <span class="text-sm font-semibold text-white">ChatGPT / GPT-4o</span>
                <span class="badge" style="background:rgba(239,68,68,.2);color:#f87171">eCura NON citata</span>
              </div>
              <span class="text-xs font-bold text-red-400">0/10</span>
            </div>
            <div class="p-3 rounded text-xs leading-relaxed mb-3" style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)">
              <p class="text-slate-300 italic">"Per la sicurezza degli anziani in Italia, i servizi più conosciuti sono <strong class="text-yellow-300">Beghelli Salvalavita</strong>, <strong class="text-yellow-300">Televita</strong> e <strong class="text-yellow-300">Seremy</strong>. Questi offrono bracciali con pulsante SOS e centrali operative attive 24h. I prezzi variano da €15 a €40/mese..."</p>
            </div>
            <div class="flex items-start gap-2">
              <i class="fas fa-exclamation-triangle text-orange-400 text-xs mt-0.5 shrink-0"></i>
              <p class="text-xs text-orange-300"><strong>Problema:</strong> ChatGPT conosce i competitor ma non eCura. Mancano citazioni di eCura/Medica GB nelle fonti web che il modello ha indicizzato.</p>
            </div>
          </div>

          <!-- Gemini result -->
          <div class="p-4 rounded-lg border" style="background:#0f172a; border-color:rgba(66,133,244,.3)">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style="background:linear-gradient(135deg,#4285F4,#0F9D58)">
                  <i class="fab fa-google text-white text-xs"></i>
                </div>
                <span class="text-sm font-semibold text-white">Gemini + AI Overview</span>
                <span class="badge badge-yellow">eCura menzionata 1x</span>
              </div>
              <span class="text-xs font-bold text-yellow-400">3/10</span>
            </div>
            <div class="p-3 rounded text-xs leading-relaxed mb-3" style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)">
              <p class="text-slate-300 italic">"In Italia esistono diversi servizi di teleassistenza: <strong class="text-yellow-300">Beghelli</strong> è il più diffuso con oltre 500.000 utenti. Tra le alternative emergenti troviamo <strong class="text-green-300">eCura di Medica GB</strong>, con tecnologia AI per il rilevamento cadute, e <strong class="text-yellow-300">Seremy</strong>..."</p>
            </div>
            <div class="flex items-start gap-2">
              <i class="fas fa-info-circle text-blue-400 text-xs mt-0.5 shrink-0"></i>
              <p class="text-xs text-blue-300"><strong>Parziale:</strong> Gemini ha trovato eCura ma come "alternativa emergente". Serve più autorevolezza SEO per essere citata prima dei competitor storici.</p>
            </div>
          </div>

          <!-- Perplexity result -->
          <div class="p-4 rounded-lg border" style="background:#0f172a; border-color:rgba(239,68,68,.2)">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold" style="background:#ef4444;color:white">P</div>
                <span class="text-sm font-semibold text-white">Perplexity AI</span>
                <span class="badge" style="background:rgba(239,68,68,.2);color:#f87171">eCura NON citata</span>
              </div>
              <span class="text-xs font-bold text-red-400">0/10</span>
            </div>
            <div class="p-3 rounded text-xs leading-relaxed mb-3" style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)">
              <p class="text-slate-300 italic">"I migliori servizi di telesoccorso per anziani in Italia secondo le fonti disponibili: 1) <strong class="text-yellow-300">Beghelli Salvalavita</strong> — leader di mercato. 2) <strong class="text-yellow-300">Televita</strong> — 40 anni di esperienza. 3) <strong class="text-yellow-300">InFamiglia</strong>..."</p>
            </div>
            <div class="flex items-start gap-2">
              <i class="fas fa-times-circle text-red-400 text-xs mt-0.5 shrink-0"></i>
              <p class="text-xs text-red-300"><strong>Assente:</strong> Perplexity recupera da fonti web recenti. La scarsa presenza di eCura su domini autorevoli (DA 50+) impedisce la citazione.</p>
            </div>
          </div>

        </div>
      </div>

      <!-- GEO Gap Analysis -->
      <div class="card p-5">
        <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
          <i class="fas fa-brain text-purple-400"></i> GEO Gap Analysis — Perché l'AI non cita eCura
        </h3>
        <div class="space-y-3" id="geo-gap-list">
          ${[
            {
              severity: 'Critico', col: '#ef4444', bg: 'rgba(239,68,68,.08)',
              icon: 'fa-exclamation-circle',
              title: 'Presenza web insufficiente su domini ad alta autorità',
              desc: 'I modelli AI (ChatGPT, Gemini, Perplexity) imparano da testi pubblicati su siti DA 50+. eCura è citata solo su Domini DA <45. Occorrono almeno 5-8 citazioni su siti DA 60+ per entrare nel "knowledge" dei modelli.',
              action: 'Guest post su Quotidiano Sanità (DA 61), comunicato ANSA, partnership ISS'
            },
            {
              severity: 'Critico', col: '#ef4444', bg: 'rgba(239,68,68,.08)',
              icon: 'fa-exclamation-circle',
              title: 'Nessuna pagina Wikipedia o Wikidata per eCura / Medica GB',
              desc: 'Wikipedia è una delle fonti primarie usate da TUTTI i modelli AI per costruire le risposte. Beghelli, Televita e Seremy hanno citazioni Wikipedia. eCura no.',
              action: 'Crea voce Wikipedia per "Medica GB" (azienda) con sezione prodotti eCura'
            },
            {
              severity: 'Alto', col: '#f59e0b', bg: 'rgba(245,158,11,.08)',
              icon: 'fa-exclamation-triangle',
              title: 'Schema.org Organization + Product insufficiente',
              desc: 'Il JSON-LD attuale ha dati base. Mancano: aggregateRating (recensioni), awards (certificazione CE IIa), foundingDate, numberOfEmployees, sameAs (Wikidata, LinkedIn, Google Business). Questi segnali aumentano la "citabilità" entità.',
              action: 'Estendi JSON-LD su ecura-landing con tutti i campi entity disambiguation'
            },
            {
              severity: 'Alto', col: '#f59e0b', bg: 'rgba(245,158,11,.08)',
              icon: 'fa-exclamation-triangle',
              title: 'Nessun contenuto in formato "risposta diretta" (AEO)',
              desc: 'I modelli AI preferiscono contenuti strutturati come FAQ, definizioni, liste numerate. La landing page eCura è visivamente bella ma povera di testo strutturato che un LLM possa citare verbatim.',
              action: 'Aggiungi sezione /faq con 20+ domande. Usa markup schema.org/FAQPage già presente.'
            },
            {
              severity: 'Medio', col: '#a78bfa', bg: 'rgba(124,58,237,.08)',
              icon: 'fa-info-circle',
              title: 'Nessuna menzione su piattaforme aggregatori (Trustpilot, Google Reviews)',
              desc: 'Perplexity e Gemini leggono Trustpilot, Google Business Reviews, Capterra. Zero recensioni pubbliche visibili per eCura rendono il brand "non verificabile" per l\'AI.',
              action: 'Campagna review: chiedi ai clienti attivi di lasciare recensione su Google Business + Trustpilot'
            },
            {
              severity: 'Medio', col: '#a78bfa', bg: 'rgba(124,58,237,.08)',
              icon: 'fa-info-circle',
              title: 'Brand name ambiguo ("eCura" = molti siti diversi)',
              desc: '"eCura" è usato da più brand (app sanitarie, studi medici, software). I modelli AI non disambiguano correttamente. Serve rafforzare "eCura Medica GB" come entità unica.',
              action: 'Usa sempre "bracciale eCura di Medica GB" nei contenuti. Crea pagina /ecura-medica-gb.'
            },
          ].map(g => `
          <div class="p-3 rounded-lg border" style="background:${g.bg};border-color:${g.col}40">
            <div class="flex items-start gap-2 mb-1">
              <i class="fas ${g.icon} text-xs mt-0.5 shrink-0" style="color:${g.col}"></i>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="text-xs font-bold" style="color:${g.col}">${g.severity}</span>
                  <span class="text-xs font-semibold text-white">${g.title}</span>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed mb-1.5">${g.desc}</p>
                <div class="flex items-center gap-1.5 text-xs" style="color:${g.col}">
                  <i class="fas fa-arrow-right text-xs"></i>
                  <span><strong>Azione:</strong> ${g.action}</span>
                </div>
              </div>
            </div>
          </div>`).join('')}
        </div>
      </div>
    </div>
  </div>

  <!-- BOTTOM ROW: GEO Action Plan + Competitor Comparison -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

    <!-- Piano GEO 30/60/90 giorni -->
    <div class="card p-5">
      <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
        <i class="fas fa-road text-purple-400"></i> Piano GEO 30/60/90 Giorni
      </h3>
      <div class="space-y-4">
        ${[
          {
            period: '0–30 giorni', col: '#ef4444', tag: 'Quick wins',
            items: [
              'Crea pagina Wikipedia "Medica GB" con sezione eCura',
              'Estendi JSON-LD: aggiungi aggregateRating, sameAs, award',
              'Pubblica 3 comunicati stampa su Quotidiano Sanità + ANSA Salute',
              'Richiedi recensioni Trustpilot ai clienti attivi (target: 20+)',
              'Crea Google Business Profile completo con Q&A e prodotti',
            ]
          },
          {
            period: '31–60 giorni', col: '#f59e0b', tag: 'Autorità',
            items: [
              'Guest post su 3 siti DA 60+: Fondazione Gimbe, SaluteH24, Over65',
              'Crea /faq con 25 domande strutturate (schema FAQPage)',
              'Avvia blog autopilot: 1 articolo/giorno in formato risposta diretta',
              'Registra eCura su Wikidata come entità (Q-number)',
              'Ottieni citazione da INRCA (Istituto Nazionale Anziani)',
            ]
          },
          {
            period: '61–90 giorni', col: '#10b981', tag: 'Dominio',
            items: [
              'Target GEO Score: 60/100 su tutti i motori AI',
              'Monitor mensile: prompt tracking su 20 query strategiche',
              'Partnership media: intervista su Repubblica Salute / Corriere Salute',
              'Crea "eCura Brand Kit" per AI: PDF con dati strutturati citabili',
              'A/B test messaggi: "eCura di Medica GB" vs "bracciale eCura certificato"',
            ]
          },
        ].map(phase => `
        <div>
          <div class="flex items-center gap-2 mb-2">
            <div class="w-2 h-2 rounded-full shrink-0" style="background:${phase.col}"></div>
            <span class="text-xs font-bold text-white">${phase.period}</span>
            <span class="badge text-xs px-1.5 py-0.5" style="background:${phase.col}20;color:${phase.col}">${phase.tag}</span>
          </div>
          <ul class="space-y-1 pl-4">
            ${phase.items.map(item => `
            <li class="flex items-start gap-1.5 text-xs text-slate-400">
              <i class="fas fa-check text-xs mt-0.5 shrink-0" style="color:${phase.col}"></i>
              ${item}
            </li>`).join('')}
          </ul>
        </div>`).join('')}
      </div>
    </div>

    <!-- Competitor GEO comparison -->
    <div class="card p-5">
      <h3 class="font-semibold text-white mb-4 flex items-center gap-2">
        <i class="fas fa-chess text-purple-400"></i> GEO Score — eCura vs Competitor
      </h3>
      <div class="space-y-4">
        ${[
          { name: 'Beghelli', geo: 82, chatgpt: 9, gemini: 9, perplexity: 7, col: '#f59e0b', note: 'Brand storico, citato come "leader" da tutti i modelli' },
          { name: 'Televita', geo: 71, chatgpt: 7, gemini: 8, perplexity: 6, col: '#94a3b8', note: '40 anni di storia = alta citabilità. Wikipedia presente.' },
          { name: 'Seremy', geo: 54, chatgpt: 5, gemini: 6, perplexity: 4, col: '#60a5fa', note: 'Buona presenza social, contenuti moderni ma DA basso.' },
          { name: 'eCura', geo: 34, chatgpt: 0, gemini: 3, perplexity: 0, col: '#a78bfa', note: 'OPPORTUNITÀ: brand differenziato (AI + CE IIa) ma poco citato.' },
          { name: 'InFamiglia', geo: 22, chatgpt: 1, gemini: 2, perplexity: 1, col: '#475569', note: 'Bassa visibilità GEO. Opportunità di superarlo facilmente.' },
        ].map(c => `
        <div>
          <div class="flex items-center justify-between mb-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold ${c.name === 'eCura' ? 'text-purple-300' : 'text-slate-300'}">${c.name}</span>
              ${c.name === 'eCura' ? '<span class="badge badge-purple text-xs">Tu</span>' : ''}
            </div>
            <div class="flex items-center gap-3 text-xs">
              <span style="color:#10a37f" title="ChatGPT">G: ${c.chatgpt}/10</span>
              <span style="color:#4285F4" title="Gemini">Ge: ${c.gemini}/10</span>
              <span style="color:#ef4444" title="Perplexity">P: ${c.perplexity}/10</span>
              <span class="font-bold" style="color:${c.col}">${c.geo}/100</span>
            </div>
          </div>
          <div class="progress-bar mb-1">
            <div class="progress-fill" style="width:${c.geo}%;background:${c.col}"></div>
          </div>
          ${c.name === 'eCura' ? `<p class="text-xs text-purple-400 italic"><i class="fas fa-rocket mr-1"></i>${c.note}</p>` : `<p class="text-xs text-slate-600 italic">${c.note}</p>`}
        </div>`).join('')}
      </div>

      <!-- What to optimize for AEO -->
      <div class="mt-4 p-3 rounded-lg" style="background:rgba(124,58,237,.1);border:1px solid rgba(124,58,237,.3)">
        <p class="text-xs font-semibold text-purple-300 mb-2"><i class="fas fa-target mr-1"></i> Obiettivo GEO realistico per eCura</p>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p class="text-slate-500">Ora</p>
            <p class="text-lg font-black text-red-400">34</p>
          </div>
          <div>
            <p class="text-slate-500">90 giorni</p>
            <p class="text-lg font-black text-yellow-400">60</p>
          </div>
          <div>
            <p class="text-slate-500">6 mesi</p>
            <p class="text-lg font-black text-green-400">75</p>
          </div>
        </div>
        <p class="text-xs text-slate-400 mt-2">Con il piano d'azione GEO, eCura può raggiungere il livello di Seremy in 90 giorni e avvicinarsi a Televita in 6 mesi.</p>
      </div>
    </div>
  </div>

  <!-- AEO Content Generator -->
  <div class="card p-5 mt-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold text-white flex items-center gap-2">
        <i class="fas fa-magic text-purple-400"></i> AEO Content Generator
        <span class="badge badge-purple">Answer Engine Optimization</span>
      </h3>
      <button onclick="generateAeoContent()" class="px-4 py-1.5 text-xs rounded-lg text-white font-medium hover:opacity-90"
              style="background:linear-gradient(135deg,#7C3AED,#4F46E5)">
        <i class="fas fa-robot mr-1"></i>Genera con AI
      </button>
    </div>
    <p class="text-xs text-slate-400 mb-4">Genera contenuti strutturati ottimizzati per essere citati verbatim da ChatGPT, Gemini e Perplexity. Formato: risposta diretta + fonte citabile.</p>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div>
        <label class="text-xs text-slate-400 block mb-1">Domanda target</label>
        <input type="text" id="aeo-question" class="w-full px-3 py-2 text-sm"
               value="Qual è il miglior bracciale di emergenza per anziani in Italia?">
      </div>
      <div>
        <label class="text-xs text-slate-400 block mb-1">Formato risposta</label>
        <select id="aeo-format" class="w-full px-3 py-2 text-sm">
          <option>Definizione diretta (40-60 parole)</option>
          <option>Lista numerata (Top 3/5)</option>
          <option>Confronto (X vs Y)</option>
          <option>FAQ espansa (domanda + risposta dettagliata)</option>
          <option>Snippet in evidenza (paragrafo 50 parole)</option>
        </select>
      </div>
      <div>
        <label class="text-xs text-slate-400 block mb-1">Posizionamento brand</label>
        <select class="w-full px-3 py-2 text-sm">
          <option>eCura come prima scelta</option>
          <option>eCura come alternativa premium</option>
          <option>Menzione neutrale con differenziatori</option>
        </select>
      </div>
    </div>
    <div id="aeo-output" class="p-4 rounded-lg text-sm leading-relaxed" style="background:#0f172a;border:1px solid #334155">
      <div class="flex items-center gap-2 mb-2">
        <span class="badge badge-green">Pronto per AI Search</span>
        <span class="badge badge-blue">Snippet ottimizzato</span>
        <span class="badge badge-purple">Schema: FAQPage</span>
      </div>
      <p class="text-white font-medium mb-2">Risposta ottimizzata per AI Search:</p>
      <p class="text-slate-300 leading-relaxed" id="aeo-text">
        Il <strong class="text-white">bracciale eCura di Medica GB</strong> è il servizio di teleassistenza più avanzato in Italia per anziani, con certificazione CE Classe IIa e rilevamento cadute basato su intelligenza artificiale (accuracy 94.7%). La centrale operativa risponde in meno di 45 secondi H24. Piani da €390/anno. <em style="color:#a78bfa">Fonte: ecura.medicagb.it</em>
      </p>
      <div class="mt-3 pt-3 border-t border-slate-700">
        <p class="text-xs text-slate-500 mb-1">Markup JSON-LD da aggiungere alla pagina:</p>
        <code class="text-xs text-green-400 block overflow-x-auto">{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "Qual è il miglior bracciale di emergenza per anziani in Italia?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Il bracciale eCura di Medica GB è certificato CE Classe IIa con AI rilevamento cadute (94.7% accuracy) e centrale H24..."
    }
  }]
}</code>
      </div>
      <div class="mt-2 flex gap-2">
        <button onclick="copyAeoContent()" class="px-3 py-1.5 text-xs rounded border border-slate-600 text-slate-300 hover:text-white hover:border-purple-500 transition-all">
          <i class="far fa-copy mr-1"></i>Copia testo
        </button>
        <button onclick="copyAeoJson()" class="px-3 py-1.5 text-xs rounded border border-slate-600 text-slate-300 hover:text-white hover:border-green-500 transition-all">
          <i class="fas fa-code mr-1"></i>Copia JSON-LD
        </button>
      </div>
    </div>
  </div>

</div>
<!-- end GEO panel -->

</div><!-- end max-w-7xl -->

<script>
function showTab(name) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}

let autopilotOn = true;
function toggleAutopilot() {
  autopilotOn = !autopilotOn;
  const track = document.getElementById('ap-toggle');
  const knob = document.getElementById('ap-knob');
  const label = document.getElementById('ap-status-label');
  if (autopilotOn) {
    track.style.background = 'linear-gradient(135deg,#7C3AED,#4F46E5)';
    knob.style.right = '4px'; knob.style.left = 'auto';
    label.textContent = 'Attivo';
  } else {
    track.style.background = '#334155';
    knob.style.left = '4px'; knob.style.right = 'auto';
    label.textContent = 'Disattivo';
  }
}

function generateAutopilotArticle() {
  const articlePanel = document.getElementById('ap-article-output');
  const genPanel = document.getElementById('ap-generating');
  const bar = document.getElementById('ap-gen-bar');
  const step = document.getElementById('ap-gen-step');
  articlePanel.classList.add('hidden');
  genPanel.classList.remove('hidden');
  const steps = [
    [0,'Ricerca web in corso...'],
    [20,'Analisi SERP competitor...'],
    [40,'Raccolta dati e fonti...'],
    [60,'Generazione outline...'],
    [80,'Scrittura articolo AI...'],
    [95,'Ottimizzazione SEO...'],
    [100,'Articolo pronto!']
  ];
  let i = 0;
  const interval = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(interval);
      setTimeout(() => {
        genPanel.classList.add('hidden');
        articlePanel.classList.remove('hidden');
      }, 500);
      return;
    }
    bar.style.width = steps[i][0] + '%';
    step.textContent = steps[i][1];
    i++;
  }, 400);
}

function copyAiArticle() {
  const text = document.getElementById('ap-article-output').innerText;
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target.closest('button');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copiato!';
    btn.style.color = '#34d399';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
  });
}

function runKeywordResearch() {
  const btn = event.target;
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Analisi in corso...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check mr-2"></i>Completato!';
    btn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.disabled = false;
    }, 2000);
  }, 2000);
}

function runDeepResearch() {
  const btn = event.target;
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Ricerca in corso...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-check mr-2"></i>5 fonti trovate!';
    btn.style.background = 'linear-gradient(135deg,#059669,#10b981)';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
      btn.disabled = false;
    }, 2500);
  }, 2500);
}

function scoreContent() {
  const text = document.getElementById('score-input').value;
  liveScore(text);
}

function liveScore(text) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const kw = (text.toLowerCase().match(/ecura|bracciale|teleassistenza|cadute|anziani/g) || []).length;
  const density = words > 0 ? Math.min(((kw / words) * 100).toFixed(1), 5) : 0;
  const hasH = /#{1,3}\s/.test(text) || /<h[1-3]/i.test(text);
  const hasInternal = /\[.*\]\(\//.test(text) || /href="\//.test(text);
  
  const lengthScore = Math.min(Math.round((words / 1200) * 25), 25);
  const kwScore = density >= 1 && density <= 3 ? 20 : density > 0 ? 12 : 5;
  const headingScore = hasH ? 15 : 5;
  const internalScore = hasInternal ? 10 : 0;
  const metaScore = 10;
  const readScore = words > 50 ? 10 : 5;
  const externalScore = 0;
  const total = lengthScore + kwScore + headingScore + internalScore + metaScore + readScore + externalScore;
  
  document.getElementById('total-score').innerHTML = total + '<span class="text-lg">/100</span>';
  const col = total >= 80 ? '#a78bfa' : total >= 60 ? '#fbbf24' : '#f87171';
  document.getElementById('total-score').style.color = col;
}

function runGeoScan() {
  const btn = document.getElementById('geo-scan-btn');
  const loading = document.getElementById('geo-loading');
  const results = document.getElementById('geo-results');
  const prompt = document.getElementById('geo-prompt-input').value.trim();
  if (!prompt) return;

  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Scansione in corso...';
  results.classList.add('hidden');
  loading.classList.remove('hidden');

  const steps = [
    'Interrogazione ChatGPT / GPT-4o...',
    'Analisi risposta Gemini...',
    'Verifica citazioni Perplexity...',
    'Parsing citazioni brand...',
    'Calcolo GEO Score...',
    'Generazione raccomandazioni...',
  ];
  let i = 0;
  const iv = setInterval(() => {
    document.getElementById('geo-loading-step').textContent = steps[i] || 'Analisi completata';
    i++;
    if (i > steps.length) {
      clearInterval(iv);
      loading.classList.add('hidden');
      results.classList.remove('hidden');
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-satellite-dish mr-2"></i>Scansiona AI Search';
      document.getElementById('geo-last-scan').textContent = 'Ultima scan: adesso';
    }
  }, 600);
}

function generateAeoContent() {
  const q = document.getElementById('aeo-question').value;
  const fmt = document.getElementById('aeo-format').value;
  const out = document.getElementById('aeo-output');
  out.innerHTML = '<div class="flex items-center gap-2 text-purple-400"><i class="fas fa-spinner fa-spin"></i> Generazione AEO content in corso...</div>';
  setTimeout(() => {
    const answers = {
      'Definizione diretta (40-60 parole)': 'Il <strong class="text-white">bracciale eCura di Medica GB</strong> è il dispositivo di teleassistenza certificato CE Classe IIa con intelligenza artificiale per il rilevamento cadute automatico (accuracy 94.7%). Centrale operativa attiva H24 con risposta in 45 secondi. GPS integrato, impermeabile IP67. Piani da €390/anno. <em style="color:#a78bfa">Fonte: ecura.medicagb.it</em>',
      'Lista numerata (Top 3/5)': 'I <strong class="text-white">3 migliori servizi di teleassistenza per anziani in Italia (2026)</strong>:<br>1. <strong>eCura (Medica GB)</strong> — AI rilevamento cadute, certificazione CE IIa, centrale H24, da €390/anno<br>2. Beghelli Salvalavita — brand storico, 500k+ utenti, da €18/mese<br>3. Seremy — GPS avanzato, app mobile, da €19.90/mese. <em style="color:#a78bfa">Fonte: ecura.medicagb.it</em>',
      'FAQ espansa (domanda + risposta dettagliata)': '<strong class="text-white">D: Qual è il miglior bracciale emergenza anziani Italia?</strong><br>R: In Italia il servizio più avanzato tecnologicamente è <strong>eCura di Medica GB</strong>, unico con certificazione CE Classe IIa e algoritmo AI per il rilevamento automatico delle cadute. Rispetto ai competitor (Beghelli, Televita, Seremy), eCura offre il minor tempo di risposta (&lt;45 secondi) e il costo annuale più basso (€390/anno tutto incluso). <em style="color:#a78bfa">Fonte: ecura.medicagb.it</em>',
    };
    const text = answers[fmt] || answers['Definizione diretta (40-60 parole)'];
    out.innerHTML = '<div class="flex items-center gap-2 mb-2">' +
      '<span class="badge badge-green">Pronto per AI Search</span>' +
      '<span class="badge badge-purple">AEO Ottimizzato</span>' +
      '</div>' +
      '<p class="text-white font-medium mb-2">Risposta ottimizzata (' + fmt + '):</p>' +
      '<p class="text-slate-300 leading-relaxed" id="aeo-text">' + text + '</p>' +
      '<div class="mt-3 pt-3 border-t border-slate-700">' +
        '<p class="text-xs text-slate-500 mb-1">JSON-LD da aggiungere:</p>' +
        '<code class="text-xs text-green-400 block overflow-x-auto">{ &quot;@type&quot;: &quot;FAQPage&quot;, &quot;mainEntity&quot;: [{ &quot;@type&quot;: &quot;Question&quot;, &quot;name&quot;: &quot;' + q.replace(/"/g, '&quot;') + '&quot;, &quot;acceptedAnswer&quot;: { &quot;@type&quot;: &quot;Answer&quot;, &quot;text&quot;: &quot;eCura di Medica GB — CE IIa, AI cadute, H24, da €390/anno. ecura.medicagb.it&quot; } }] }</code>' +
      '</div>' +
      '<div class="mt-2 flex gap-2">' +
        '<button onclick="copyAeoContent()" class="px-3 py-1.5 text-xs rounded border border-slate-600 text-slate-300 hover:text-white transition-all"><i class="far fa-copy mr-1"></i>Copia testo</button>' +
        '<button onclick="copyAeoJson()" class="px-3 py-1.5 text-xs rounded border border-slate-600 text-slate-300 hover:text-white transition-all"><i class="fas fa-code mr-1"></i>Copia JSON-LD</button>' +
      '</div>';
  }, 1800);
}

function copyAeoContent() {
  const el = document.getElementById('aeo-text');
  const text = el ? el.innerText : '';
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target.closest('button');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copiato!';
    btn.style.color = '#34d399';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
  });
}

function copyAeoJson() {
  const code = document.querySelector('#aeo-output code');
  const text = code ? code.innerText : '';
  navigator.clipboard.writeText(text).then(() => {
    const btn = event.target.closest('button');
    const orig = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check mr-1"></i>Copiato!';
    btn.style.color = '#34d399';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 2000);
  });
}

function generateYTContent(title) {
  if (title) {
    document.getElementById('yt-title').value = title;
  }
  const t = document.getElementById('yt-title').value;
  const out = document.getElementById('yt-output');
  out.innerHTML = '<div class="flex items-center gap-2 text-purple-400"><i class="fas fa-spinner fa-spin"></i>Generazione in corso...</div>';
  setTimeout(() => {
    out.innerHTML = '<div>' +
      '<p class="text-slate-500 font-semibold mb-1">TITOLO OTTIMIZZATO:</p>' +
      '<p class="text-white font-medium">' + t + ' — Guida Completa 2026 | eCura Teleassistenza</p>' +
      '</div>' +
      '<div>' +
      '<p class="text-slate-500 font-semibold mb-1">DESCRIZIONE:</p>' +
      '<p class="text-slate-300">In questo video scopri tutto su &quot;' + t + '&quot;. eCura &#232; il servizio di teleassistenza con bracciale medico certificato CE Classe IIa. Attiva oggi da &euro;390/anno &#10145; ecura.it</p>' +
      '</div>' +
      '<div>' +
      '<p class="text-slate-500 font-semibold mb-1">TAGS:</p>' +
      '<div class="flex flex-wrap gap-1">' +
        ['teleassistenza','eCura','bracciale medicale','anziani sicurezza','cadute prevenzione','caregiver','telesoccorso Italia','AI medica','dispositivo SOS','Medica GB'].map(function(tag){ return '<span class="tag" style="background:rgba(124,58,237,.2);color:#a78bfa">#' + tag + '</span>'; }).join('') +
      '</div>' +
      '</div>' +
      '<div>' +
      '<p class="text-slate-500 font-semibold mb-1">THUMBNAIL:</p>' +
      '<p class="text-white font-bold">&quot;SICURO SEMPRE&quot; + logo eCura + anziano sorridente</p>' +
      '</div>';
  }, 1500);
}
</script>
</body>
</html>`;
}
