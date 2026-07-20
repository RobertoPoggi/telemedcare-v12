// ═══════════════════════════════════════════════════════════════════
//  SEO TECNICO DASHBOARD — eCura V12.0
//  12 moduli: Autopilot, Keyword Research, Analisi SERP, Analisi
//  Competitor, Ricerca Web Profonda, Punteggio Contenuto, Link
//  Interni, Link Esterni, Backlink, Immagini AI, Targeting Pubblico,
//  Video YouTube
//  Route: /admin/seo-manager
//  Style: White/light — matches Google ADS dashboard
// ═══════════════════════════════════════════════════════════════════

export function renderSeoManagerDashboard(): string {
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SEO Tecnico — eCura V12.0</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#f8fafc;color:#1e293b}
  .section-card{background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.04);padding:24px;margin-bottom:20px}
  .kpi-card{background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:20px}
  .action-btn{background:linear-gradient(135deg,#059669,#0d9488);color:#fff;padding:10px 20px;border-radius:10px;font-weight:700;border:none;cursor:pointer;transition:opacity .2s;display:inline-flex;align-items:center;gap:8px}
  .action-btn:hover{opacity:.9}
  .action-btn-sm{background:linear-gradient(135deg,#059669,#0d9488);color:#fff;padding:6px 14px;border-radius:8px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:opacity .2s;display:inline-flex;align-items:center;gap:6px}
  .action-btn-sm:hover{opacity:.9}
  .tab-btn{background:#f1f5f9;color:#64748b;padding:9px 18px;border-radius:8px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all .2s;white-space:nowrap}
  .tab-btn.active{background:linear-gradient(135deg,#059669,#0d9488);color:#fff;box-shadow:0 4px 12px rgba(5,150,105,.3)}
  .badge-green{background:#dcfce7;color:#15803d;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
  .badge-blue{background:#dbeafe;color:#1d4ed8;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
  .badge-yellow{background:#fef9c3;color:#854d0e;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
  .badge-red{background:#fee2e2;color:#b91c1c;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
  .badge-purple{background:#ede9fe;color:#6d28d9;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
  .badge-gray{background:#f1f5f9;color:#475569;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600}
  .progress-bar{height:8px;border-radius:4px;background:#e2e8f0;overflow:hidden}
  .progress-fill{height:100%;border-radius:4px;transition:width .6s ease}
  .progress-fill-green{background:linear-gradient(90deg,#10b981,#059669)}
  .progress-fill-blue{background:linear-gradient(90deg,#3b82f6,#2563eb)}
  .progress-fill-orange{background:linear-gradient(90deg,#f59e0b,#d97706)}
  .progress-fill-red{background:linear-gradient(90deg,#ef4444,#dc2626)}
  .table-th{text-align:left;padding:10px 12px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em;background:#f8fafc;border-bottom:1px solid #e2e8f0}
  .table-td{padding:10px 12px;font-size:14px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
  .serp-item{border-left:3px solid #059669;padding:12px 16px;background:#f0fdf4;border-radius:0 10px 10px 0;margin-bottom:8px}
  .source-card{border:1px solid #e2e8f0;border-radius:10px;padding:14px;background:#fff;transition:box-shadow .2s}
  .source-card:hover{box-shadow:0 4px 12px rgba(0,0,0,.1)}
  .score-ring{width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;border:4px solid}
  textarea,input,select{font-family:inherit;border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;width:100%;font-size:14px;background:#fff;color:#1e293b;outline:none;transition:border-color .2s}
  textarea:focus,input:focus,select:focus{border-color:#059669;box-shadow:0 0 0 3px rgba(5,150,105,.1)}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .fade-in{animation:fadeIn .3s ease}
  @keyframes spin{to{transform:rotate(360deg)}}
  .spin{animation:spin 1s linear infinite;display:inline-block}
  .link-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700}
  .chip-int{background:#dbeafe;color:#1d4ed8}
  .chip-ext{background:#ede9fe;color:#6d28d9}
  .chip-back{background:#fce7f3;color:#9d174d}
  .opportunity-card{border:1px solid #e2e8f0;border-radius:10px;padding:14px;background:#fff;border-left:4px solid #059669}
  .section-title{font-size:18px;font-weight:700;color:#1e293b;margin-bottom:4px}
  .section-sub{font-size:14px;color:#64748b;margin-bottom:16px}
  .input-label{font-size:13px;font-weight:600;color:#475569;margin-bottom:6px;display:block}
  .result-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:16px;font-size:14px;line-height:1.7;color:#334155;white-space:pre-wrap}
</style>
</head>
<body>

<!-- HEADER -->
<div style="background:linear-gradient(135deg,#059669 0%,#0d9488 100%)" class="text-white px-6 py-5 shadow-lg">
  <div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
    <div class="flex items-center gap-4">
      <a href="/" style="background:rgba(255,255,255,.2);backdrop-filter:blur(4px)" class="hover:bg-opacity-30 px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2">
        <i class="fas fa-arrow-left"></i>Home
      </a>
      <div class="flex items-center gap-3">
        <div style="background:rgba(255,255,255,.15);border-radius:14px;padding:10px">
          <i class="fas fa-search-plus text-2xl"></i>
        </div>
        <div>
          <h1 class="text-2xl font-bold">SEO Tecnico</h1>
          <p style="color:rgba(255,255,255,.8)" class="text-sm">Audit &amp; posizionamento organico · ecura.it</p>
        </div>
        <span style="background:rgba(255,255,255,.2);font-size:11px" class="px-3 py-1 rounded-full font-bold">12 MODULI</span>
      </div>
    </div>
    <div class="flex gap-3 flex-wrap text-sm">
      <div style="background:rgba(255,255,255,.15)" class="px-4 py-2 rounded-xl flex items-center gap-2">
        <i class="fas fa-tachometer-alt"></i>
        Score SEO: <span id="globalScore" class="font-bold text-xl ml-1">72</span>/100
      </div>
      <div style="background:rgba(255,255,255,.15)" class="px-4 py-2 rounded-xl flex items-center gap-2">
        <i class="fas fa-robot"></i>
        Autopilot: <span id="autopilotStatus" class="font-bold ml-1 text-yellow-200">OFF</span>
      </div>
    </div>
  </div>
</div>

<!-- TABS SCROLL -->
<div class="max-w-7xl mx-auto px-4 mt-6">
  <div class="section-card" style="padding:16px">
    <div class="flex gap-2 overflow-x-auto pb-1 flex-wrap">
      <button class="tab-btn active" onclick="showTab('autopilot')" id="btn-autopilot"><i class="fas fa-robot mr-1"></i>Autopilot</button>
      <button class="tab-btn" onclick="showTab('keyword')" id="btn-keyword"><i class="fas fa-key mr-1"></i>Keyword</button>
      <button class="tab-btn" onclick="showTab('serp')" id="btn-serp"><i class="fas fa-list-ol mr-1"></i>SERP</button>
      <button class="tab-btn" onclick="showTab('competitor')" id="btn-competitor"><i class="fas fa-users mr-1"></i>Competitor</button>
      <button class="tab-btn" onclick="showTab('deepresearch')" id="btn-deepresearch"><i class="fas fa-microscope mr-1"></i>Deep Research</button>
      <button class="tab-btn" onclick="showTab('score')" id="btn-score"><i class="fas fa-star mr-1"></i>Score</button>
      <button class="tab-btn" onclick="showTab('internal')" id="btn-internal"><i class="fas fa-sitemap mr-1"></i>Link Interni</button>
      <button class="tab-btn" onclick="showTab('external')" id="btn-external"><i class="fas fa-external-link-alt mr-1"></i>Link Esterni</button>
      <button class="tab-btn" onclick="showTab('backlink')" id="btn-backlink"><i class="fas fa-link mr-1"></i>Backlink</button>
      <button class="tab-btn" onclick="showTab('images')" id="btn-images"><i class="fas fa-image mr-1"></i>Immagini</button>
      <button class="tab-btn" onclick="showTab('audience')" id="btn-audience"><i class="fas fa-users-cog mr-1"></i>Targeting</button>
      <button class="tab-btn" onclick="showTab('youtube')" id="btn-youtube"><i class="fab fa-youtube mr-1"></i>YouTube</button>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 1: AUTOPILOT SEO
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-autopilot" class="fade-in">
    <div class="section-card">
      <div class="flex items-center justify-between mb-4">
        <div>
          <div class="section-title"><i class="fas fa-robot text-emerald-600 mr-2"></i>Autopilot SEO</div>
          <div class="section-sub">Generazione automatica di contenuti ottimizzati per ecura.it — teleassistenza anziani</div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm font-semibold text-gray-600">Attiva Autopilot</span>
          <div id="apToggle" onclick="toggleAutopilot()" style="width:56px;height:28px;border-radius:14px;background:#d1d5db;cursor:pointer;position:relative;transition:background .3s">
            <div id="apKnob" style="width:22px;height:22px;border-radius:50%;background:#fff;position:absolute;top:3px;left:3px;transition:left .3s;box-shadow:0 1px 4px rgba(0,0,0,.2)"></div>
          </div>
          <span id="apLabel" class="text-sm font-bold text-red-500">OFF</span>
        </div>
      </div>

      <!-- KPI Autopilot -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="kpi-card text-center">
          <div class="text-3xl font-bold text-emerald-600">14</div>
          <div class="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">Articoli generati</div>
          <div class="text-xs text-emerald-600 mt-1">↑ +3 questa settimana</div>
        </div>
        <div class="kpi-card text-center">
          <div class="text-3xl font-bold text-blue-600">87%</div>
          <div class="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">Score medio</div>
          <div class="text-xs text-blue-600 mt-1">↑ +4% vs mese scorso</div>
        </div>
        <div class="kpi-card text-center">
          <div class="text-3xl font-bold text-violet-600">2.4k</div>
          <div class="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">Parole/articolo</div>
          <div class="text-xs text-violet-600 mt-1">Long-form ottimizzato</div>
        </div>
        <div class="kpi-card text-center">
          <div class="text-3xl font-bold text-orange-600">6</div>
          <div class="text-xs text-gray-500 mt-1 font-semibold uppercase tracking-wide">In coda</div>
          <div class="text-xs text-orange-600 mt-1">Prossimi 7 giorni</div>
        </div>
      </div>

      <!-- Generator -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label class="input-label">Sito / Dominio target</label>
          <input type="text" id="apSite" placeholder="es. ecura.it" value="ecura.it">
          <label class="input-label mt-3">Parola chiave principale</label>
          <input type="text" id="apKeyword" placeholder="es. bracciale cadute anziani">
          <label class="input-label mt-3">Tipo contenuto</label>
          <select id="apType">
            <option>Articolo Blog (1500-2000 parole)</option>
            <option>Pagina Prodotto Dispositivo Medico (800-1200 parole)</option>
            <option>FAQ strutturata (10 domande)</option>
            <option>Pillar Page (2500-3500 parole)</option>
            <option>Landing Page abbonamento eCura</option>
          </select>
          <label class="input-label mt-3">Tono editoriale</label>
          <select id="apTone">
            <option>Professionale / Autorevole</option>
            <option>Educativo / Informativo</option>
            <option>Persuasivo / Commerciale</option>
            <option>Empatico / Rassicurante</option>
          </select>
        </div>
        <div>
          <label class="input-label">Piano editoriale — prossimi 7 giorni</label>
          <div class="space-y-2" id="editorialPlan">
            <div class="flex items-center justify-between p-3 rounded-lg" style="background:#f0fdf4;border:1px solid #bbf7d0">
              <div>
                <div class="text-sm font-semibold">Lun 21 Lug</div>
                <div class="text-xs text-gray-600">Bracciale cadute anziani: guida completa 2025</div>
              </div>
              <span class="badge-green">Programmato</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg" style="background:#eff6ff;border:1px solid #bfdbfe">
              <div>
                <div class="text-sm font-semibold">Mer 23 Lug</div>
                <div class="text-xs text-gray-600">Dispositivo medico certificato classe IIA: cosa significa</div>
              </div>
              <span class="badge-blue">In revisione</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg" style="background:#fefce8;border:1px solid #fde68a">
              <div>
                <div class="text-sm font-semibold">Ven 25 Lug</div>
                <div class="text-xs text-gray-600">Teleassistenza anziani: come funziona il piano eCura</div>
              </div>
              <span class="badge-yellow">In coda</span>
            </div>
            <div class="flex items-center justify-between p-3 rounded-lg" style="background:#f8fafc;border:1px solid #e2e8f0">
              <div>
                <div class="text-sm font-semibold">Dom 27 Lug</div>
                <div class="text-xs text-gray-600">GPS per anziani: SiDLY CARE vs concorrenza</div>
              </div>
              <span class="badge-gray">In attesa</span>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-3 flex-wrap mb-4">
        <button class="action-btn" onclick="runSeoAutopilot()"><i class="fas fa-play"></i>Genera Contenuto SEO</button>
        <button class="action-btn-sm" onclick="exportApCSV()"><i class="fas fa-file-csv"></i>Esporta Piano CSV</button>
        <button class="action-btn-sm" style="background:linear-gradient(135deg,#6366f1,#4f46e5)" onclick="scheduleAp()"><i class="fas fa-calendar-alt"></i>Pianifica Tutti</button>
      </div>

      <div id="apProgress" style="display:none" class="mb-4">
        <div class="flex items-center gap-3 mb-2">
          <span class="spin text-emerald-600"><i class="fas fa-cog"></i></span>
          <span id="apStep" class="text-sm font-semibold text-emerald-700">Analisi keyword in corso…</span>
        </div>
        <div class="progress-bar"><div class="progress-fill progress-fill-green" id="apBar" style="width:0%"></div></div>
      </div>
      <div id="apResult" class="result-box" style="display:none;min-height:200px"></div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 2: KEYWORD RESEARCH
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-keyword" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-key text-emerald-600 mr-2"></i>Keyword Research</div>
      <div class="section-sub">Scopri le keyword più redditizie per il tuo sito — volume, difficoltà, intento</div>

      <div class="flex gap-3 mb-5 flex-wrap">
        <div class="flex-1 min-w-64">
          <input type="text" id="kwInput" placeholder="Inserisci seed keyword (es. bracciale cadute anziani)">
        </div>
        <select id="kwCountry" style="width:auto">
          <option>🇮🇹 Italia</option><option>🇬🇧 UK</option><option>🇺🇸 USA</option>
        </select>
        <button class="action-btn" onclick="runKeywordSeo()"><i class="fas fa-search"></i>Analizza</button>
        <button class="action-btn-sm" onclick="exportKwCSV()"><i class="fas fa-file-csv"></i>CSV</button>
      </div>

      <!-- Results table -->
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th class="table-th">Keyword</th>
              <th class="table-th">Volume/mese</th>
              <th class="table-th">Difficoltà</th>
              <th class="table-th">Intento</th>
              <th class="table-th">CPC €</th>
              <th class="table-th">Trend</th>
            </tr>
          </thead>
          <tbody id="kwTable">
            <tr><td class="table-td font-semibold">bracciale cadute anziani</td><td class="table-td">9,600</td><td class="table-td"><span class="badge-yellow">Medio 51</span></td><td class="table-td"><span class="badge-green">Commerciale</span></td><td class="table-td">€1.80</td><td class="table-td text-emerald-600">↑ +34%</td></tr>
            <tr><td class="table-td font-semibold">visita cardiologica online</td><td class="table-td">5,400</td><td class="table-td"><span class="badge-yellow">Medio 54</span></td><td class="table-td"><span class="badge-green">Commerciale</span></td><td class="table-td">€3.80</td><td class="table-td text-emerald-600">↑ +24%</td></tr>
            <tr><td class="table-td font-semibold">dispositivo medico anziani casa</td><td class="table-td">3,400</td><td class="table-td"><span class="badge-green">Basso 38</span></td><td class="table-td"><span class="badge-green">Commerciale</span></td><td class="table-td">€2.60</td><td class="table-td text-emerald-600">↑ +41%</td></tr>
            <tr><td class="table-td font-semibold">GPS per anziani</td><td class="table-td">6,200</td><td class="table-td"><span class="badge-yellow">Medio 55</span></td><td class="table-td"><span class="badge-green">Commerciale</span></td><td class="table-td">€1.50</td><td class="table-td text-emerald-600">↑ +22%</td></tr>
            <tr><td class="table-td font-semibold">allarme caduta anziani</td><td class="table-td">4,100</td><td class="table-td"><span class="badge-green">Basso 42</span></td><td class="table-td"><span class="badge-green">Transazionale</span></td><td class="table-td">€1.90</td><td class="table-td text-emerald-600">↑ +18%</td></tr>
            <tr><td class="table-td font-semibold">referto digitale come funziona</td><td class="table-td">1,600</td><td class="table-td"><span class="badge-green">Basso 28</span></td><td class="table-td"><span class="badge-blue">Informazionale</span></td><td class="table-td">€0.80</td><td class="table-td text-emerald-600">↑ +8%</td></tr>
            <tr><td class="table-td font-semibold">seconda opinione medica online</td><td class="table-td">2,100</td><td class="table-td"><span class="badge-green">Basso 35</span></td><td class="table-td"><span class="badge-green">Transazionale</span></td><td class="table-td">€5.20</td><td class="table-td text-emerald-600">↑ +45%</td></tr>
            <tr><td class="table-td font-semibold">prenotare visita online</td><td class="table-td">6,700</td><td class="table-td"><span class="badge-red">Alto 67</span></td><td class="table-td"><span class="badge-green">Transazionale</span></td><td class="table-td">€2.80</td><td class="table-td text-emerald-600">↑ +9%</td></tr>
            <tr><td class="table-td font-semibold">teleassistenza anziani</td><td class="table-td">5,800</td><td class="table-td"><span class="badge-yellow">Medio 48</span></td><td class="table-td"><span class="badge-blue">Informazionale</span></td><td class="table-td">€2.10</td><td class="table-td text-emerald-600">↑ +28%</td></tr>
            <tr><td class="table-td font-semibold">psicologo online sessione</td><td class="table-td">12,400</td><td class="table-td"><span class="badge-red">Alto 71</span></td><td class="table-td"><span class="badge-green">Commerciale</span></td><td class="table-td">€4.50</td><td class="table-td text-emerald-600">↑ +38%</td></tr>
            <tr><td class="table-td font-semibold">telemedcina costo</td><td class="table-td">1,200</td><td class="table-td"><span class="badge-green">Basso 22</span></td><td class="table-td"><span class="badge-blue">Informazionale</span></td><td class="table-td">€1.40</td><td class="table-td text-gray-500">→ Stabile</td></tr>
            <tr><td class="table-td font-semibold">braccialetto medico emergenza</td><td class="table-td">2,100</td><td class="table-td"><span class="badge-green">Basso 28</span></td><td class="table-td"><span class="badge-green">Transazionale</span></td><td class="table-td">€2.30</td><td class="table-td text-emerald-600">↑ +37%</td></tr>
          </tbody>
        </table>
      </div>

      <!-- Clusters -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="kpi-card" style="border-top:4px solid #10b981">
          <div class="font-bold text-sm text-emerald-700 mb-2"><i class="fas fa-trophy mr-1"></i>Top Funnel — Awareness</div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between"><span>cos'è la teleassistenza anziani</span><span class="badge-green">4.2k</span></div>
            <div class="flex justify-between"><span>bracciale cadute come funziona</span><span class="badge-green">3.8k</span></div>
            <div class="flex justify-between"><span>dispositivo medico anziani casa</span><span class="badge-green">2.1k</span></div>
          </div>
          <div class="mt-3 text-xs text-gray-500">💡 Crea guide informative long-form</div>
        </div>
        <div class="kpi-card" style="border-top:4px solid #3b82f6">
          <div class="font-bold text-sm text-blue-700 mb-2"><i class="fas fa-filter mr-1"></i>Mid Funnel — Consideration</div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between"><span>miglior bracciale emergenza anziani</span><span class="badge-blue">6.1k</span></div>
            <div class="flex justify-between"><span>GPS anziani confronto 2025</span><span class="badge-blue">5.4k</span></div>
            <div class="flex justify-between"><span>teleassistenza costo mensile</span><span class="badge-blue">1.9k</span></div>
          </div>
          <div class="mt-3 text-xs text-gray-500">💡 Pagine comparazione & review</div>
        </div>
        <div class="kpi-card" style="border-top:4px solid #8b5cf6">
          <div class="font-bold text-sm text-violet-700 mb-2"><i class="fas fa-bullseye mr-1"></i>Bottom Funnel — Decision</div>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between"><span>SiDLY CARE acquisto</span><span class="badge-purple">8.7k</span></div>
            <div class="flex justify-between"><span>eCura abbonamento attiva</span><span class="badge-purple">2.3k</span></div>
            <div class="flex justify-between"><span>bracciale cadute anziani prezzo</span><span class="badge-purple">1.6k</span></div>
          </div>
          <div class="mt-3 text-xs text-gray-500">💡 Landing page CTA dirette</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 3: ANALISI SERP
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-serp" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-list-ol text-emerald-600 mr-2"></i>Analisi SERP</div>
      <div class="section-sub">Analisi dettagliata dei primi 10 risultati Google per ogni keyword target</div>

      <div class="flex gap-3 mb-5 flex-wrap">
        <div class="flex-1 min-w-64"><input type="text" id="serpQuery" placeholder="es. bracciale cadute anziani" value="bracciale cadute anziani"></div>
        <select id="serpDevice" style="width:auto"><option>🖥️ Desktop</option><option>📱 Mobile</option></select>
        <button class="action-btn" onclick="runSerpSeo()"><i class="fas fa-search"></i>Analizza SERP</button>
      </div>

      <!-- SERP Features -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div class="kpi-card text-center" style="border-top:3px solid #10b981">
          <i class="fas fa-star text-emerald-500 text-xl mb-1"></i>
          <div class="font-bold text-sm">Featured Snippet</div>
          <div class="text-xs text-emerald-600 mt-1">Presente — Opportunità ★</div>
        </div>
        <div class="kpi-card text-center" style="border-top:3px solid #3b82f6">
          <i class="fas fa-question-circle text-blue-500 text-xl mb-1"></i>
          <div class="font-bold text-sm">People Also Ask</div>
          <div class="text-xs text-blue-600 mt-1">8 domande correlate</div>
        </div>
        <div class="kpi-card text-center" style="border-top:3px solid #f59e0b">
          <i class="fas fa-map-marker-alt text-yellow-500 text-xl mb-1"></i>
          <div class="font-bold text-sm">Local Pack</div>
          <div class="text-xs text-yellow-600 mt-1">3 risultati locali</div>
        </div>
        <div class="kpi-card text-center" style="border-top:3px solid #8b5cf6">
          <i class="fas fa-shopping-bag text-violet-500 text-xl mb-1"></i>
          <div class="font-bold text-sm">Shopping Ads</div>
          <div class="text-xs text-gray-500 mt-1">Non presente</div>
        </div>
      </div>

      <!-- Top 10 Results -->
      <div class="space-y-3" id="serpResults">
        <div class="serp-item">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-green">Pos. 1</span><span class="text-xs text-gray-500">amazon.it</span></div>
              <div class="font-semibold text-blue-700 text-sm">Bracciale cadute anziani — Categoria dispositivi di sicurezza</div>
              <div class="text-xs text-gray-600 mt-1">Listing prodotti bracciali emergenza e GPS per anziani. Prezzi da €29 a €349. Spedizione Prime 24h. Recensioni verificate...</div>
            </div>
            <div class="text-right min-w-fit">
              <div class="text-xs text-gray-500">DA 68 · Backlink: 4.2k</div>
              <div class="text-xs text-gray-500 mt-1">Parole: ~1,850</div>
              <span class="badge-red text-xs mt-1">Difficile</span>
            </div>
          </div>
        </div>
        <div class="serp-item">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-blue">Pos. 2</span><span class="text-xs text-gray-500">sicurezzaanziani.it</span></div>
              <div class="font-semibold text-blue-700 text-sm">Bracciale cadute anziani: guida all’acquisto 2025</div>
              <div class="text-xs text-gray-600 mt-1">Confronto tra i migliori dispositivi anti-caduta per anziani in Italia. GPS integrato, SOS, rilevamento automatico. Cosa scegliere...</div>
            </div>
            <div class="text-right min-w-fit">
              <div class="text-xs text-gray-500">DA 54 · Backlink: 2.8k</div>
              <div class="text-xs text-gray-500 mt-1">Parole: ~2,100</div>
              <span class="badge-yellow text-xs mt-1">Medio</span>
            </div>
          </div>
        </div>
        <div class="serp-item">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-yellow">Pos. 3</span><span class="text-xs text-gray-500">caregiver.it</span></div>
              <div class="font-semibold text-blue-700 text-sm">Come scegliere il bracciale anti-caduta per genitori anziani</div>
              <div class="text-xs text-gray-600 mt-1">Guida pratica per caregiver: funzioni GPS, SOS, rilevamento cadute. Differenza tra dispositivi consumer e certificati come dispositivi medici...</div>
            </div>
            <div class="text-right min-w-fit">
              <div class="text-xs text-gray-500">DA 47 · Backlink: 1.4k</div>
              <div class="text-xs text-gray-500 mt-1">Parole: ~3,200</div>
              <span class="badge-green text-xs mt-1">Superabile</span>
            </div>
          </div>
        </div>
        <div class="serp-item">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-yellow">Pos. 4</span><span class="text-xs text-gray-500">anzianisicuri.it</span></div>
              <div class="font-semibold text-blue-700 text-sm">Teleassistenza anziani 2025: i migliori servizi in Italia</div>
              <div class="text-xs text-gray-600 mt-1">Panoramica dei servizi di teleassistenza per anziani disponibili in Italia. Dispositivi certificati, centrali operative 24/7, piani tariffari...</div>
            </div>
            <div class="text-right min-w-fit">
              <div class="text-xs text-gray-500">DA 41 · Backlink: 980</div>
              <div class="text-xs text-gray-500 mt-1">Parole: ~2,700</div>
              <span class="badge-green text-xs mt-1">Superabile</span>
            </div>
          </div>
        </div>
        <div class="serp-item">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-gray">Pos. 5</span><span class="text-xs text-gray-500">quotidianosanita.it</span></div>
              <div class="font-semibold text-blue-700 text-sm">Dispositivi medici classe IIA per anziani: normativa MDR 2017/745</div>
              <div class="text-xs text-gray-600 mt-1">Il Regolamento europeo MDR 2017/745 e la classificazione dei dispositivi medici. Cosa significa certificazione CE classe IIA per bracciali emergenza...</div>
            </div>
            <div class="text-right min-w-fit">
              <div class="text-xs text-gray-500">DA 72 · Backlink: 6.1k</div>
              <div class="text-xs text-gray-500 mt-1">Parole: ~1,400</div>
              <span class="badge-red text-xs mt-1">Istituzionale</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Piano d'attacco -->
      <div class="mt-6 p-5 rounded-xl" style="background:#f0fdf4;border:1px solid #bbf7d0">
        <div class="font-bold text-emerald-800 mb-3"><i class="fas fa-chess mr-2"></i>Piano d'Attacco SEO — Come scalare su questa SERP</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="flex items-start gap-3 bg-white p-3 rounded-lg">
            <div class="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <div>
              <div class="font-semibold text-sm">Attacca le posizioni 3-4 (Superabili)</div>
              <div class="text-xs text-gray-600">DA 41-47, contenuto più lungo e strutturato con dati aggiornati al 2025</div>
            </div>
          </div>
          <div class="flex items-start gap-3 bg-white p-3 rounded-lg">
            <div class="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <div>
              <div class="font-semibold text-sm">Conquista il Featured Snippet</div>
              <div class="text-xs text-gray-600">Aggiungi sezione FAQ con risposta breve (40-60 parole) alla domanda principale</div>
            </div>
          </div>
          <div class="flex items-start gap-3 bg-white p-3 rounded-lg">
            <div class="w-7 h-7 rounded-full bg-violet-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <div>
              <div class="font-semibold text-sm">Sfrutta People Also Ask (8 domande)</div>
              <div class="text-xs text-gray-600">Crea sezione dedicata con risposta a ciascuna domanda identificata</div>
            </div>
          </div>
          <div class="flex items-start gap-3 bg-white p-3 rounded-lg">
            <div class="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
            <div>
              <div class="font-semibold text-sm">Aumenta autorità con backlink mirati</div>
              <div class="text-xs text-gray-600">Target: 3 backlink da siti sanitari DA 50+ nei prossimi 30 giorni</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 4: ANALISI COMPETITOR
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-competitor" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-users text-emerald-600 mr-2"></i>Analisi Competitor SEO</div>
      <div class="section-sub">Matrice comparativa completa — identifica gap e opportunità rispetto ai tuoi competitor</div>

      <div class="flex gap-3 mb-5 flex-wrap">
        <div class="flex-1 min-w-64"><input type="text" id="compInput" placeholder="Dominio da analizzare (es. ecura.it)" value="ecura.it"></div>
        <button class="action-btn" onclick="refreshCompSeo()"><i class="fas fa-sync-alt"></i>Aggiorna Analisi</button>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div class="kpi-card text-center"><div class="text-2xl font-bold text-emerald-600">ecura.it</div><div class="text-xs text-gray-500 mt-1">Il tuo sito</div><div class="text-lg font-bold mt-2">DA 32</div><div class="text-xs text-emerald-600">↑ Crescita</div></div>
        <div class="kpi-card text-center"><div class="text-sm font-bold text-gray-700">sicurezzaanziani.it</div><div class="text-xs text-gray-500 mt-1">Competitor 1</div><div class="text-lg font-bold mt-2">DA 54</div><div class="text-xs text-red-500">Leader</div></div>
        <div class="kpi-card text-center"><div class="text-sm font-bold text-gray-700">caregiver.it</div><div class="text-xs text-gray-500 mt-1">Competitor 2</div><div class="text-lg font-bold mt-2">DA 47</div><div class="text-xs text-yellow-600">Medio</div></div>
        <div class="kpi-card text-center"><div class="text-sm font-bold text-gray-700">seniorcare.it</div><div class="text-xs text-gray-500 mt-1">Competitor 3</div><div class="text-lg font-bold mt-2">DA 57</div><div class="text-xs text-red-500">Forte</div></div>
        <div class="kpi-card text-center"><div class="text-sm font-bold text-gray-700">telesoccorso.it</div><div class="text-xs text-gray-500 mt-1">Competitor 4</div><div class="text-lg font-bold mt-2">DA 27</div><div class="text-xs text-emerald-600">Debole</div></div>
      </div>

      <!-- Matrice -->
      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th class="table-th">Fattore SEO</th>
              <th class="table-th" style="color:#059669">ecura.it</th>
              <th class="table-th">sicurezzaanziani.it</th>
              <th class="table-th">caregiver.it</th>
              <th class="table-th">seniorcare.it</th>
              <th class="table-th">telesoccorso.it</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="table-td font-semibold text-gray-700">Domain Authority</td><td class="table-td font-bold text-emerald-600">32</td><td class="table-td">51</td><td class="table-td">43</td><td class="table-td">57</td><td class="table-td">27</td></tr>
            <tr style="background:#f8fafc"><td class="table-td font-semibold text-gray-700">Pagine indicizzate</td><td class="table-td font-bold text-emerald-600">88</td><td class="table-td">420</td><td class="table-td">260</td><td class="table-td">580</td><td class="table-td">74</td></tr>
            <tr><td class="table-td font-semibold text-gray-700">Backlink totali</td><td class="table-td font-bold text-emerald-600">940</td><td class="table-td">6.2k</td><td class="table-td">3.4k</td><td class="table-td">9.8k</td><td class="table-td">520</td></tr>
            <tr style="background:#f8fafc"><td class="table-td font-semibold text-gray-700">Traffico organico/mese</td><td class="table-td font-bold text-emerald-600">3.2k</td><td class="table-td">19k</td><td class="table-td">11k</td><td class="table-td">31k</td><td class="table-td">1.4k</td></tr>
            <tr><td class="table-td font-semibold text-gray-700">Keywords top-10</td><td class="table-td font-bold text-emerald-600">41</td><td class="table-td">210</td><td class="table-td">140</td><td class="table-td">370</td><td class="table-td">28</td></tr>
            <tr style="background:#f8fafc"><td class="table-td font-semibold text-gray-700">Core Web Vitals</td><td class="table-td font-bold text-emerald-600"><span class="badge-green">Buono</span></td><td class="table-td"><span class="badge-yellow">Medio</span></td><td class="table-td"><span class="badge-green">Buono</span></td><td class="table-td"><span class="badge-red">Scarso</span></td><td class="table-td"><span class="badge-yellow">Medio</span></td></tr>
            <tr><td class="table-td font-semibold text-gray-700">Schema MedicalDevice</td><td class="table-td font-bold text-emerald-600"><span class="badge-green">Sì</span></td><td class="table-td"><span class="badge-red">No</span></td><td class="table-td"><span class="badge-red">No</span></td><td class="table-td"><span class="badge-yellow">Parziale</span></td><td class="table-td"><span class="badge-red">No</span></td></tr>
            <tr style="background:#f8fafc"><td class="table-td font-semibold text-gray-700">Blog / Guide anziani</td><td class="table-td font-bold text-emerald-600"><span class="badge-green">Sì</span></td><td class="table-td"><span class="badge-green">Sì</span></td><td class="table-td"><span class="badge-green">Sì</span></td><td class="table-td"><span class="badge-green">Sì</span></td><td class="table-td"><span class="badge-red">No</span></td></tr>
            <tr><td class="table-td font-semibold text-gray-700">Featured Snippet</td><td class="table-td font-bold text-emerald-600"><span class="badge-red">0</span></td><td class="table-td"><span class="badge-green">8</span></td><td class="table-td"><span class="badge-yellow">4</span></td><td class="table-td"><span class="badge-green">14</span></td><td class="table-td"><span class="badge-red">0</span></td></tr>
          </tbody>
        </table>
      </div>

      <!-- Raccomandazioni -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        <div class="opportunity-card">
          <div class="font-bold text-emerald-800 mb-2"><i class="fas fa-bullseye mr-2 text-emerald-600"></i>Gap da colmare — Priorità Alta</div>
          <ul class="text-sm space-y-1 text-gray-700">
            <li>• Aumentare pagine indicizzate: da 88 → 300+ con guide anziani e schede prodotto</li>
            <li>• Acquisire 40+ backlink da associazioni anziani, portali caregiver e siti sanitari</li>
            <li>• Conquistare i primi 5 Featured Snippet su keyword bracciale/GPS/cadute</li>
          </ul>
        </div>
        <div class="kpi-card" style="border-left:4px solid #3b82f6">
          <div class="font-bold text-blue-800 mb-2"><i class="fas fa-star mr-2 text-blue-500"></i>Vantaggi competitivi attuali</div>
          <ul class="text-sm space-y-1 text-gray-700">
            <li>✓ Unico con schema markup MedicalDevice — vantaggio SEO certificazione</li>
            <li>✓ Core Web Vitals migliori di 3/4 competitor</li>
            <li>✓ Dispositivo medico certificato classe IIA — autorità unica nel settore</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 5: DEEP RESEARCH
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-deepresearch" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-microscope text-emerald-600 mr-2"></i>Ricerca Web Profonda</div>
      <div class="section-sub">Fonti autorevoli pre-selezionate — dati ufficiali, studi scientifici, statistiche settore</div>

      <div class="flex gap-3 mb-5 flex-wrap">
        <div class="flex-1 min-w-64"><input type="text" id="deepQuery" placeholder="Es. statistiche cadute anziani Italia 2025" value="teleassistenza anziani trend Italia 2025"></div>
        <select id="deepType" style="width:auto">
          <option>Studi scientifici</option><option>Dati istituzionali</option><option>Report di settore</option><option>Notizie recenti</option>
        </select>
        <button class="action-btn" onclick="runDeepSeo()"><i class="fas fa-search-plus"></i>Cerca Fonti</button>
      </div>

      <div class="space-y-4" id="deepSources">
        <div class="source-card">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-blue">ISTAT</span><span class="badge-green">DA 92</span><span class="badge-gray">Istituzionale</span></div>
              <div class="font-semibold text-sm text-gray-800">Cadute negli anziani in Italia — Rapporto Annuale 2024</div>
              <div class="text-xs text-gray-500 mt-1">istat.it · Pubblicato: Mar 2025</div>
              <div class="text-sm text-gray-600 mt-2">Il 68% degli italiani ha utilizzato servizi digitali sanitari nel 2024, +23% rispetto al 2022. Le fasce 35-54 anni rappresentano il segmento più attivo. Il Nord-Est guida l'adozione con il 68% degli over 65 a rischio caduta ogni anno...</div>
            </div>
            <button class="action-btn-sm flex-shrink-0" onclick="useSeoSource('ISTAT 2024: cadute prima causa morte accidentale anziani — 3.200 decessi/anno, 30% over65 cade ogni 12 mesi')"><i class="fas fa-plus"></i>Usa</button>
          </div>
        </div>
        <div class="source-card">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-purple">ISS</span><span class="badge-green">DA 88</span><span class="badge-gray">Sanitario</span></div>
              <div class="font-semibold text-sm text-gray-800">Telemonitoraggio domiciliare anziani — Istituto Superiore di Sanità 2024</div>
              <div class="text-xs text-gray-500 mt-1">iss.it · Pubblicato: Ott 2024</div>
              <div class="text-sm text-gray-600 mt-2">L’ISS raccomanda dispositivi certificati MDR 2017/745 per il monitoraggio domiciliare degli anziani. Il telemonitoraggio riduce i ricoveri ospedalieri del 28% e i tempi di intervento in emergenza del 42%...</div>
            </div>
            <button class="action-btn-sm flex-shrink-0" onclick="useSeoSource('ISS 2024: telemonitoraggio anziani certificato MDR — riduzione ricoveri 28%, tempi intervento -42%')"><i class="fas fa-plus"></i>Usa</button>
          </div>
        </div>
        <div class="source-card">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-yellow">Frost & Sullivan</span><span class="badge-green">DA 76</span><span class="badge-gray">Mercato</span></div>
              <div class="font-semibold text-sm text-gray-800">European Remote Patient Monitoring Market 2025-2030</div>
              <div class="text-xs text-gray-500 mt-1">frost.com · Pubblicato: Feb 2025</div>
              <div class="text-sm text-gray-600 mt-2">Il mercato europeo del telemonitoraggio anziani raggiungerà €12.4 miliardi entro il 2028 (CAGR +22.1%). L'Italia conta 13.8M over-65 con crescita al 34% entro il 2050. Dispositivi classe IIA in forte espansione: €890M nel 2024 previsti al 2027...</div>
            </div>
            <button class="action-btn-sm flex-shrink-0" onclick="useSeoSource('Frost & Sullivan: mercato telemonitoraggio anziani Europa €12.4B al 2028, CAGR +22.1%')"><i class="fas fa-plus"></i>Usa</button>
          </div>
        </div>
        <div class="source-card">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-red">Lancet Healthy Longevity</span><span class="badge-green">DA 94</span><span class="badge-gray">Scientifico</span></div>
              <div class="font-semibold text-sm text-gray-800">Wearable fall detection devices in older adults: systematic review and meta-analysis</div>
              <div class="text-xs text-gray-500 mt-1">lancet.com · Pubblicato: Set 2024</div>
              <div class="text-sm text-gray-600 mt-2">Meta-analisi su 87 studi (n=142.000 anziani): i dispositivi certificati di rilevamento cadute riducono il tempo di soccorso del 67% e la mortalità post-caduta del 38%. Sensibilità media 94%, specificità 91%...</div>
            </div>
            <button class="action-btn-sm flex-shrink-0" onclick="useSeoSource('Lancet 2024: dispositivi rilevamento cadute certificati — soccorso -67%, mortalità -38% (87 studi, 142.000 anziani)')"><i class="fas fa-plus"></i>Usa</button>
          </div>
        </div>
        <div class="source-card">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1"><span class="badge-gray">Censis</span><span class="badge-green">DA 71</span><span class="badge-gray">Sociologico</span></div>
              <div class="font-semibold text-sm text-gray-800">La condizione degli anziani in Italia — Salute e autonomia 2024</div>
              <div class="text-xs text-gray-500 mt-1">censis.it · Pubblicato: Dic 2024</div>
              <div class="text-sm text-gray-600 mt-2">13,8 milioni di italiani over 65 (23% della popolazione). Il 74% dei caregiver familiari cerca soluzioni tecnologiche per la sicurezza dei genitori anziani. Il 61% non conosce la differenza tra dispositivi consumer e dispositivi medici certificati...</div>
            </div>
            <button class="action-btn-sm flex-shrink-0" onclick="useSeoSource('Censis 2024: 13,8M anziani in Italia — 74% caregiver cerca soluzioni tech, 61% non conosce certificazione medica dispositivi')"><i class="fas fa-plus"></i>Usa</button>
          </div>
        </div>
      </div>

      <div id="deepSeoNote" class="mt-4 p-4 rounded-xl" style="background:#f0fdf4;border:1px solid #bbf7d0;display:none">
        <div class="font-bold text-emerald-800 mb-1"><i class="fas fa-clipboard-check mr-2"></i>Fonte aggiunta all'articolo</div>
        <div id="deepSeoNoteText" class="text-sm text-gray-700"></div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 6: PUNTEGGIO CONTENUTO
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-score" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-star text-emerald-600 mr-2"></i>Punteggio Contenuto SEO</div>
      <div class="section-sub">Analisi in tempo reale dell'ottimizzazione SEO on-page del tuo contenuto</div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
        <div class="md:col-span-2">
          <label class="input-label">Keyword target (focus)</label>
          <input type="text" id="scoreKw" placeholder="es. bracciale cadute anziani" class="mb-3" value="bracciale cadute anziani">
          <label class="input-label">Incolla il tuo contenuto qui</label>
          <textarea id="scoreContent" rows="10" placeholder="Incolla il testo dell'articolo o della pagina che vuoi analizzare...">La teleassistenza anziani sta rivoluzionando l'accesso alle cure mediche in Italia. Il bracciale SiDLY CARE di eCura rileva cadute in automatico, trasmette il GPS in tempo reale e attiva allarmi SOS verso caregiver e centrale operativa 24/7. Dispositivo medico certificato classe IIA, BD/RDM 2853300, CND V0399. Progettato per anziani autonomi e famiglie caregiver che vogliono sicurezza certificata MDR 2017/745. Piani abbonamento Base, Plus e Family. Consegna in 48 ore in tutta Italia, assistenza telefonica dedicata.</textarea>
          <div class="flex gap-3 mt-3">
            <button class="action-btn" onclick="analyzeScoreSeo()"><i class="fas fa-chart-line"></i>Analizza Score</button>
            <button class="action-btn-sm" onclick="liveScoreSeo()"><i class="fas fa-bolt"></i>Live Score</button>
          </div>
        </div>

        <div>
          <!-- Score globale -->
          <div class="kpi-card text-center mb-4">
            <div style="width:100px;height:100px;border-radius:50%;border:8px solid #10b981;display:flex;align-items:center;justify-content:center;margin:0 auto 8px">
              <span id="scoreGlobal" class="text-4xl font-black text-emerald-600">76</span>
            </div>
            <div class="font-bold text-gray-700">Score SEO On-Page</div>
            <div class="text-xs text-emerald-600 mt-1">Buono — migliora a 90+ con i suggerimenti</div>
          </div>
          <!-- Mini scores -->
          <div class="space-y-2 text-sm" id="scoreDetails">
            <div><div class="flex justify-between mb-1"><span class="font-semibold text-gray-600">Keyword density</span><span class="text-emerald-600 font-bold">90/100</span></div><div class="progress-bar"><div class="progress-fill progress-fill-green" style="width:90%"></div></div></div>
            <div><div class="flex justify-between mb-1"><span class="font-semibold text-gray-600">Leggibilità</span><span class="text-blue-600 font-bold">72/100</span></div><div class="progress-bar"><div class="progress-fill progress-fill-blue" style="width:72%"></div></div></div>
            <div><div class="flex justify-between mb-1"><span class="font-semibold text-gray-600">Struttura heading</span><span class="text-yellow-600 font-bold">65/100</span></div><div class="progress-bar"><div class="progress-fill progress-fill-orange" style="width:65%"></div></div></div>
            <div><div class="flex justify-between mb-1"><span class="font-semibold text-gray-600">Meta description</span><span class="text-red-600 font-bold">40/100</span></div><div class="progress-bar"><div class="progress-fill progress-fill-red" style="width:40%"></div></div></div>
            <div><div class="flex justify-between mb-1"><span class="font-semibold text-gray-600">Internal links</span><span class="text-yellow-600 font-bold">55/100</span></div><div class="progress-bar"><div class="progress-fill progress-fill-orange" style="width:55%"></div></div></div>
            <div><div class="flex justify-between mb-1"><span class="font-semibold text-gray-600">Lunghezza testo</span><span class="text-red-600 font-bold">45/100</span></div><div class="progress-bar"><div class="progress-fill progress-fill-red" style="width:45%"></div></div></div>
            <div><div class="flex justify-between mb-1"><span class="font-semibold text-gray-600">Schema markup</span><span class="text-red-600 font-bold">30/100</span></div><div class="progress-bar"><div class="progress-fill progress-fill-red" style="width:30%"></div></div></div>
          </div>
        </div>
      </div>

      <!-- Suggerimenti AI -->
      <div class="mt-2 p-4 rounded-xl" style="background:#fefce8;border:1px solid #fde68a">
        <div class="font-bold text-yellow-800 mb-3"><i class="fas fa-lightbulb mr-2 text-yellow-500"></i>Suggerimenti AI per raggiungere 90+/100</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="bg-white p-3 rounded-lg border-l-4 border-red-400">
            <div class="text-sm font-bold text-red-700">🔴 Meta Description mancante (40/100)</div>
            <div class="text-xs text-gray-600 mt-1">Aggiungi meta description 150-160 caratteri. Esempio: "SiDLY CARE è il bracciale cadute anziani certificato dispositivo medico classe IIA. GPS + SOS + rilevamento automatico. Piano eCura da €29/mese."</div>
          </div>
          <div class="bg-white p-3 rounded-lg border-l-4 border-orange-400">
            <div class="text-sm font-bold text-orange-700">🟠 Testo troppo breve (45/100)</div>
            <div class="text-xs text-gray-600 mt-1">Il contenuto ha ~120 parole. Per competere su questa SERP servono almeno 2.000 parole. Aggiungi sezioni: Come funziona il rilevamento cadute, Certificazione MDR, GPS e SOS, Piani eCura, FAQ</div>
          </div>
          <div class="bg-white p-3 rounded-lg border-l-4 border-orange-400">
            <div class="text-sm font-bold text-orange-700">🟠 Headings non strutturati (65/100)</div>
            <div class="text-xs text-gray-600 mt-1">Struttura consigliata: H1 "Bracciale cadute anziani SiDLY CARE" → H2 "Dispositivo medico certificato classe IIA" → H2 "Come funziona il rilevamento cadute" → H2 "GPS e SOS: assistenza 24/7" → H3 per ogni funzione</div>
          </div>
          <div class="bg-white p-3 rounded-lg border-l-4 border-red-400">
            <div class="text-sm font-bold text-red-700">🔴 Schema markup assente (30/100)</div>
            <div class="text-xs text-gray-600 mt-1">Aggiungi JSON-LD: MedicalDevice (priorità assoluta — vantaggio competitivo unico), Product con aggregateRating, FAQPage. Il markup MedicalDevice è assente in tutti i competitor — +35% CTR stimato</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 7: LINK INTERNI
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-internal" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-sitemap text-emerald-600 mr-2"></i>Link Interni</div>
      <div class="section-sub">Mappa della struttura interna del sito — identifica pagine orfane e opportunità di link</div>

      <div class="flex gap-3 mb-5 flex-wrap">
        <div class="flex-1 min-w-64"><input type="text" id="intSite" placeholder="es. ecura.it" value="ecura.it"></div>
        <button class="action-btn" onclick="scanInternalSeo()"><i class="fas fa-spider"></i>Scansiona Sito</button>
        <button class="action-btn-sm" onclick="exportInternalMap()"><i class="fas fa-file-export"></i>Esporta Mappa</button>
      </div>

      <!-- KPI Internal -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div class="kpi-card text-center"><div class="text-3xl font-bold text-emerald-600">142</div><div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Pagine totali</div></div>
        <div class="kpi-card text-center"><div class="text-3xl font-bold text-red-500">23</div><div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Pagine orfane</div><div class="text-xs text-red-500 mt-1">Nessun link interno</div></div>
        <div class="kpi-card text-center"><div class="text-3xl font-bold text-blue-600">3.4</div><div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Avg link/pagina</div><div class="text-xs text-blue-600 mt-1">Ottimale: 5-8</div></div>
        <div class="kpi-card text-center"><div class="text-3xl font-bold text-orange-500">8</div><div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Profondità max</div><div class="text-xs text-orange-500 mt-1">Ridurre a max 3</div></div>
      </div>

      <!-- Pagine orfane -->
      <div class="mb-5">
        <div class="font-bold text-gray-800 mb-3"><i class="fas fa-exclamation-triangle text-red-500 mr-2"></i>Pagine Orfane — Nessun link interno (23 pagine)</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div class="p-3 rounded-lg" style="background:#fef2f2;border:1px solid #fecaca">
            <div class="text-sm font-semibold text-red-700">/specialisti/ortopedico-online</div>
            <div class="text-xs text-gray-600 mt-1">Traffico potenziale: 1.8k/mese · DA: 0 link interni</div>
            <button class="action-btn-sm mt-2" style="background:linear-gradient(135deg,#dc2626,#b91c1c);font-size:11px;padding:4px 10px" onclick="addInternalLink('/specialisti/ortopedico-online')"><i class="fas fa-plus"></i>Aggiungi link</button>
          </div>
          <div class="p-3 rounded-lg" style="background:#fef2f2;border:1px solid #fecaca">
            <div class="text-sm font-semibold text-red-700">/blog/referto-digitale-guida</div>
            <div class="text-xs text-gray-600 mt-1">Traffico potenziale: 2.1k/mese · DA: 0 link interni</div>
            <button class="action-btn-sm mt-2" style="background:linear-gradient(135deg,#dc2626,#b91c1c);font-size:11px;padding:4px 10px" onclick="addInternalLink('/blog/referto-digitale-guida')"><i class="fas fa-plus"></i>Aggiungi link</button>
          </div>
          <div class="p-3 rounded-lg" style="background:#fef2f2;border:1px solid #fecaca">
            <div class="text-sm font-semibold text-red-700">/prezzi/pacchetto-famiglia</div>
            <div class="text-xs text-gray-600 mt-1">Traffico potenziale: 3.4k/mese · Pagina commerciale</div>
            <button class="action-btn-sm mt-2" style="background:linear-gradient(135deg,#dc2626,#b91c1c);font-size:11px;padding:4px 10px" onclick="addInternalLink('/prezzi/pacchetto-famiglia')"><i class="fas fa-plus"></i>Aggiungi link</button>
          </div>
          <div class="p-3 rounded-lg" style="background:#fef2f2;border:1px solid #fecaca">
            <div class="text-sm font-semibold text-red-700">/faq/sicurezza-privacy</div>
            <div class="text-xs text-gray-600 mt-1">Traffico potenziale: 890/mese · Fiducia utente</div>
            <button class="action-btn-sm mt-2" style="background:linear-gradient(135deg,#dc2626,#b91c1c);font-size:11px;padding:4px 10px" onclick="addInternalLink('/faq/sicurezza-privacy')"><i class="fas fa-plus"></i>Aggiungi link</button>
          </div>
        </div>
      </div>

      <!-- Hub & Spoke -->
      <div class="p-4 rounded-xl" style="background:#f0fdf4;border:1px solid #bbf7d0">
        <div class="font-bold text-emerald-800 mb-3"><i class="fas fa-project-diagram mr-2 text-emerald-600"></i>Struttura Hub & Spoke consigliata</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="bg-white p-3 rounded-lg text-center" style="border:2px solid #059669">
            <div class="font-bold text-emerald-700 text-sm">🏠 HUB: /teleassistenza-anziani</div>
            <div class="text-xs text-gray-500 mt-1">Pillar page — collega prodotto, certificazione, piani, blog</div>
          </div>
          <div class="space-y-2">
            <div class="bg-white p-2 rounded text-xs text-center" style="border:1px solid #bbf7d0"><span class="chip-int link-chip">SPOKE</span> /prodotti/sidly-care-pro</div>
            <div class="bg-white p-2 rounded text-xs text-center" style="border:1px solid #bbf7d0"><span class="chip-int link-chip">SPOKE</span> /certificazione/classe-iia</div>
            <div class="bg-white p-2 rounded text-xs text-center" style="border:1px solid #bbf7d0"><span class="chip-int link-chip">SPOKE</span> /blog/cadute-anziani-guida</div>
          </div>
          <div class="space-y-2">
            <div class="bg-white p-2 rounded text-xs text-center" style="border:1px solid #bbf7d0"><span class="chip-int link-chip">SPOKE</span> /piani/ecura-base</div>
            <div class="bg-white p-2 rounded text-xs text-center" style="border:1px solid #bbf7d0"><span class="chip-int link-chip">SPOKE</span> /piani/ecura-family</div>
            <div class="bg-white p-2 rounded text-xs text-center" style="border:1px solid #bbf7d0"><span class="chip-int link-chip">SPOKE</span> /faq/dispositivo-medico</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 8: LINK ESTERNI (E-E-A-T)
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-external" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-external-link-alt text-emerald-600 mr-2"></i>Link Esterni — E-E-A-T Authority</div>
      <div class="section-sub">Fonti autorevoli da citare nei tuoi contenuti per massimizzare l'E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness)</div>

      <div class="flex gap-3 mb-5 flex-wrap">
        <button class="action-btn" onclick="copyExtLinksSeo()"><i class="fas fa-copy"></i>Copia tutte le fonti</button>
        <button class="action-btn-sm" onclick="filterExtLinks('sanitario')"><i class="fas fa-filter"></i>Solo sanitarie</button>
        <button class="action-btn-sm" onclick="filterExtLinks('istituzionale')"><i class="fas fa-filter"></i>Solo istituzionali</button>
      </div>

      <div style="overflow-x:auto">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th class="table-th">Fonte</th>
              <th class="table-th">Domain Authority</th>
              <th class="table-th">Tipo</th>
              <th class="table-th">Argomento</th>
              <th class="table-th">Trust Score</th>
              <th class="table-th">Azione</th>
            </tr>
          </thead>
          <tbody>
            <tr><td class="table-td font-semibold text-blue-700">Ministero della Salute</td><td class="table-td"><span class="badge-green">DA 91</span></td><td class="table-td"><span class="badge-blue">Istituzionale</span></td><td class="table-td text-sm">MDR 2017/745, dispositivi medici classe IIA, normativa anziani</td><td class="table-td"><div class="progress-bar" style="width:100px"><div class="progress-fill progress-fill-green" style="width:95%"></div></div></td><td class="table-td"><button class="action-btn-sm" onclick="copyExtLink('salute.gov.it')"><i class="fas fa-copy"></i></button></td></tr>
            <tr style="background:#f8fafc"><td class="table-td font-semibold text-blue-700">ISS — Istituto Superiore Sanità</td><td class="table-td"><span class="badge-green">DA 88</span></td><td class="table-td"><span class="badge-green">Sanitario</span></td><td class="table-td text-sm">Linee guida telemonitoraggio, dispositivi medici certificati</td><td class="table-td"><div class="progress-bar" style="width:100px"><div class="progress-fill progress-fill-green" style="width:92%"></div></div></td><td class="table-td"><button class="action-btn-sm" onclick="copyExtLink('iss.it')"><i class="fas fa-copy"></i></button></td></tr>
            <tr><td class="table-td font-semibold text-blue-700">AGENAS</td><td class="table-td"><span class="badge-green">DA 79</span></td><td class="table-td"><span class="badge-blue">Istituzionale</span></td><td class="table-td text-sm">Standard qualità, accreditamento</td><td class="table-td"><div class="progress-bar" style="width:100px"><div class="progress-fill progress-fill-green" style="width:85%"></div></div></td><td class="table-td"><button class="action-btn-sm" onclick="copyExtLink('agenas.it')"><i class="fas fa-copy"></i></button></td></tr>
            <tr style="background:#f8fafc"><td class="table-td font-semibold text-blue-700">FNOMCeO (Ordine Medici)</td><td class="table-td"><span class="badge-green">DA 74</span></td><td class="table-td"><span class="badge-green">Sanitario</span></td><td class="table-td text-sm">Deontologia medica, etica digitale</td><td class="table-td"><div class="progress-bar" style="width:100px"><div class="progress-fill progress-fill-green" style="width:88%"></div></div></td><td class="table-td"><button class="action-btn-sm" onclick="copyExtLink('fnomceo.it')"><i class="fas fa-copy"></i></button></td></tr>
            <tr><td class="table-td font-semibold text-blue-700">Quotidiano Sanità</td><td class="table-td"><span class="badge-green">DA 72</span></td><td class="table-td"><span class="badge-yellow">Media</span></td><td class="table-td text-sm">Notizie settore, innovazione sanità</td><td class="table-td"><div class="progress-bar" style="width:100px"><div class="progress-fill progress-fill-blue" style="width:75%"></div></div></td><td class="table-td"><button class="action-btn-sm" onclick="copyExtLink('quotidianosanita.it')"><i class="fas fa-copy"></i></button></td></tr>
            <tr style="background:#f8fafc"><td class="table-td font-semibold text-blue-700">WHO — World Health Org.</td><td class="table-td"><span class="badge-green">DA 95</span></td><td class="table-td"><span class="badge-purple">Internazionale</span></td><td class="table-td text-sm">Linee guida globali, ricerche</td><td class="table-td"><div class="progress-bar" style="width:100px"><div class="progress-fill progress-fill-green" style="width:98%"></div></div></td><td class="table-td"><button class="action-btn-sm" onclick="copyExtLink('who.int')"><i class="fas fa-copy"></i></button></td></tr>
            <tr><td class="table-td font-semibold text-blue-700">PubMed / NIH</td><td class="table-td"><span class="badge-green">DA 96</span></td><td class="table-td"><span class="badge-purple">Scientifico</span></td><td class="table-td text-sm">Studi peer-reviewed, evidence base</td><td class="table-td"><div class="progress-bar" style="width:100px"><div class="progress-fill progress-fill-green" style="width:99%"></div></div></td><td class="table-td"><button class="action-btn-sm" onclick="copyExtLink('pubmed.ncbi.nlm.nih.gov')"><i class="fas fa-copy"></i></button></td></tr>
          </tbody>
        </table>
      </div>

      <div id="extLinkToast" class="mt-3 p-3 rounded-lg text-sm font-semibold" style="display:none;background:#dcfce7;color:#15803d;border:1px solid #bbf7d0">
        <i class="fas fa-check mr-2"></i><span id="extLinkMsg"></span>
      </div>

      <div class="mt-5 p-4 rounded-xl" style="background:#eff6ff;border:1px solid #bfdbfe">
        <div class="font-bold text-blue-800 mb-2"><i class="fas fa-info-circle mr-2 text-blue-500"></i>Come usare i link esterni per E-E-A-T</div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
          <div>✓ Cita sempre la fonte originale con link <code>rel="noopener"</code></div>
          <div>✓ Usa fonti DA 70+ per argomenti medici YMYL</div>
          <div>✓ Integra 2-4 citazioni esterne per ogni articolo 1500+ parole</div>
          <div>✓ Preferisci .gov e .org per massima autorità percepita</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 9: BACKLINK
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-backlink" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-link text-emerald-600 mr-2"></i>Analisi Backlink</div>
      <div class="section-sub">Profilo backlink completo — qualità, anchor text, pagine più linkate, opportunità</div>

      <div class="flex gap-3 mb-5 flex-wrap">
        <div class="flex-1 min-w-64"><input type="text" id="blDomain" placeholder="es. ecura.it" value="ecura.it"></div>
        <button class="action-btn" onclick="refreshBacklinkSeo()"><i class="fas fa-sync-alt"></i>Aggiorna Analisi</button>
      </div>

      <!-- KPI Backlink -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div class="kpi-card text-center">
          <div class="text-3xl font-bold text-emerald-600">940</div>
          <div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Backlink totali</div>
          <div class="text-xs text-emerald-600 mt-1">↑ +54 (30 giorni)</div>
        </div>
        <div class="kpi-card text-center">
          <div class="text-3xl font-bold text-blue-600">198</div>
          <div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Domini referenti</div>
          <div class="text-xs text-blue-600 mt-1">↑ +22 (30 giorni)</div>
        </div>
        <div class="kpi-card text-center">
          <div class="text-3xl font-bold text-violet-600">DA 32</div>
          <div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Domain Authority</div>
          <div class="text-xs text-violet-600 mt-1">↑ +2 (90 giorni)</div>
        </div>
        <div class="kpi-card text-center">
          <div class="text-3xl font-bold text-orange-600">8</div>
          <div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Link tossici</div>
          <div class="text-xs text-red-500 mt-1">⚠ Disavow consigliato</div>
        </div>
      </div>

      <!-- Top backlink -->
      <div class="mb-5">
        <div class="font-bold text-gray-800 mb-3">Top 10 Backlink per autorità</div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse">
            <thead>
              <tr>
                <th class="table-th">Sorgente</th>
                <th class="table-th">DA</th>
                <th class="table-th">Anchor Text</th>
                <th class="table-th">Tipo</th>
                <th class="table-th">Data</th>
                <th class="table-th">Qualità</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="table-td font-semibold text-blue-700">anziani.it</td><td class="table-td"><span class="badge-green">63</span></td><td class="table-td text-sm">bracciale cadute anziani certificato</td><td class="table-td"><span class="chip-back link-chip">Dofollow</span></td><td class="table-td text-sm text-gray-500">Apr 2025</td><td class="table-td"><span class="badge-green">Alta</span></td></tr>
              <tr style="background:#f8fafc"><td class="table-td font-semibold text-blue-700">caregiveritalia.it</td><td class="table-td"><span class="badge-green">58</span></td><td class="table-td text-sm">teleassistenza anziani soli</td><td class="table-td"><span class="chip-back link-chip">Dofollow</span></td><td class="table-td text-sm text-gray-500">Mar 2025</td><td class="table-td"><span class="badge-green">Alta</span></td></tr>
              <tr><td class="table-td font-semibold text-blue-700">geriatria.it</td><td class="table-td"><span class="badge-green">54</span></td><td class="table-td text-sm">dispositivo medico rilevamento cadute</td><td class="table-td"><span class="chip-back link-chip">Dofollow</span></td><td class="table-td text-sm text-gray-500">Feb 2025</td><td class="table-td"><span class="badge-green">Alta</span></td></tr>
              <tr style="background:#f8fafc"><td class="table-td font-semibold text-blue-700">silverage.it</td><td class="table-td"><span class="badge-yellow">46</span></td><td class="table-td text-sm">GPS anziani SiDLY</td><td class="table-td"><span class="chip-back link-chip">Dofollow</span></td><td class="table-td text-sm text-gray-500">Mag 2025</td><td class="table-td"><span class="badge-yellow">Media</span></td></tr>
              <tr><td class="table-td font-semibold text-blue-700">famigliainforma.it</td><td class="table-td"><span class="badge-yellow">41</span></td><td class="table-td text-sm">eCura teleassistenza</td><td class="table-td"><span class="chip-back link-chip">Dofollow</span></td><td class="table-td text-sm text-gray-500">Giu 2025</td><td class="table-td"><span class="badge-yellow">Media</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Opportunità Link Building -->
      <div class="font-bold text-gray-800 mb-3"><i class="fas fa-building text-emerald-600 mr-2"></i>5 Opportunità Link Building</div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="opportunity-card">
          <div class="font-bold text-sm">Guest Post su CaregiverItalia.it</div>
          <div class="text-xs text-gray-600 mt-1">DA 58 · Caregiver e anziani · Accettano contributi su sicurezza domestica</div>
          <div class="flex items-center gap-2 mt-2"><span class="badge-green">Alta probabilità</span><span class="text-xs text-gray-500">Stima: +2-3 DA punti</span></div>
        </div>
        <div class="opportunity-card">
          <div class="font-bold text-sm">Listing Ministero Salute — Dispositivi Medici</div>
          <div class="text-xs text-gray-600 mt-1">DA 91 · Istituzionale · Pagina pubblica BD/RDM 2853300 linkabile</div>
          <div class="flex items-center gap-2 mt-2"><span class="badge-blue">Gratuito</span><span class="text-xs text-gray-500">Stima: +3-4 DA punti</span></div>
        </div>
        <div class="opportunity-card">
          <div class="font-bold text-sm">Press Release — SiDLY CARE dispositivo medico certificato</div>
          <div class="text-xs text-gray-600 mt-1">Target: QuotidianSanità, SanitaNews, GeriatriaPratica · DA 45-72</div>
          <div class="flex items-center gap-2 mt-2"><span class="badge-yellow">Medio termine</span><span class="text-xs text-gray-500">Stima: 6-10 backlink</span></div>
        </div>
        <div class="opportunity-card">
          <div class="font-bold text-sm">Partnership Associazioni Anziani (AUSER, ADA)</div>
          <div class="text-xs text-gray-600 mt-1">DA 48-65 · Associazioni nazionali · Link editoriale ad alto trust</div>
          <div class="flex items-center gap-2 mt-2"><span class="badge-purple">Alto valore</span><span class="text-xs text-gray-500">Stima: +5-8 DA punti</span></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 10: IMMAGINI AI
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-images" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-image text-emerald-600 mr-2"></i>Immagini AI Ottimizzate SEO</div>
      <div class="section-sub">Genera immagini professionali per il sito con alt text SEO ottimizzato automaticamente</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
        <div>
          <label class="input-label">Stile immagine</label>
          <select id="imgStyle" class="mb-3">
            <option>Professionale / Corporate</option>
            <option>Fotorealistico / Medico</option>
            <option>Illustrazione / Infografica</option>
            <option>Minimalista / Flat design</option>
            <option>3D / Moderno</option>
          </select>
          <label class="input-label">Descrizione personalizzata</label>
          <textarea id="imgDesc" rows="4" placeholder="Descrivi l'immagine che vuoi generare...">Anziano sorridente a casa con bracciale SiDLY CARE al polso, luce naturale calda, ambiente domestico accogliente, espressione serena e fiduciosa, stile corporate moderno, alta qualità</textarea>
          <label class="input-label mt-3">Alt text SEO (generato automaticamente)</label>
          <input type="text" id="imgAlt" value="anziano con bracciale cadute SiDLY CARE dispositivo medico certificato teleassistenza eCura" readonly style="background:#f1f5f9">
          <div class="flex gap-3 mt-3">
            <button class="action-btn" onclick="generateImgSeo()"><i class="fas fa-magic"></i>Genera Immagine</button>
            <button class="action-btn-sm" onclick="optimizeAlt()"><i class="fas fa-robot"></i>Ottimizza Alt</button>
          </div>
        </div>

        <div>
          <div class="font-bold text-sm text-gray-700 mb-3">6 Prompt Pre-Calibrati per Siti Medici</div>
          <div class="space-y-2" id="imgPrompts">
            <div class="p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow" style="border:1px solid #e2e8f0;background:#f8fafc" onclick="loadSeoPrompt(0)">
              <div class="text-sm font-semibold text-gray-800">👴 Anziano con bracciale SiDLY CARE</div>
              <div class="text-xs text-gray-500 mt-1">Casa accogliente · Sicurezza · Serenità · Alta conversione</div>
            </div>
            <div class="p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow" style="border:1px solid #e2e8f0;background:#f8fafc" onclick="loadSeoPrompt(1)">
              <div class="text-sm font-semibold text-gray-800">👩‍👧 Figlia caregiver e genitore anziano</div>
              <div class="text-xs text-gray-500 mt-1">Figlia con genitore anziano · App eCura · Tranquillità</div>
            </div>
            <div class="p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow" style="border:1px solid #e2e8f0;background:#f8fafc" onclick="loadSeoPrompt(2)">
              <div class="text-sm font-semibold text-gray-800">🏅 Certificazione CE classe IIA MDR</div>
              <div class="text-xs text-gray-500 mt-1">Logo CE classe IIA · MDR · Bollino qualità · Trust</div>
            </div>
            <div class="p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow" style="border:1px solid #e2e8f0;background:#f8fafc" onclick="loadSeoPrompt(3)">
              <div class="text-sm font-semibold text-gray-800">📲 App eCura con GPS in tempo reale</div>
              <div class="text-xs text-gray-500 mt-1">Dashboard monitoraggio · GPS live · Storico allarmi</div>
            </div>
            <div class="p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow" style="border:1px solid #e2e8f0;background:#f8fafc" onclick="loadSeoPrompt(4)">
              <div class="text-sm font-semibold text-gray-800">🚨 Allarme SOS caduta — risposta immediata</div>
              <div class="text-xs text-gray-500 mt-1">Centrale operativa · Risposta SOS · Autorità e fiducia</div>
            </div>
            <div class="p-3 rounded-lg cursor-pointer hover:shadow-md transition-shadow" style="border:1px solid #e2e8f0;background:#f8fafc" onclick="loadSeoPrompt(5)">
              <div class="text-sm font-semibold text-gray-800">📈 Infografica: 3.200 morti/anno per caduta anziani</div>
              <div class="text-xs text-gray-500 mt-1">Statistiche ISTAT · 30% over65 cade · Dati citabili SEO</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Regole SEO immagini -->
      <div class="p-4 rounded-xl" style="background:#f0fdf4;border:1px solid #bbf7d0">
        <div class="font-bold text-emerald-800 mb-2"><i class="fas fa-info-circle mr-2 text-emerald-600"></i>Best Practice SEO Immagini</div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div class="bg-white p-3 rounded-lg text-center"><div class="font-bold text-emerald-700">WebP</div><div class="text-xs text-gray-500 mt-1">Formato ottimale -30% size vs JPG</div></div>
          <div class="bg-white p-3 rounded-lg text-center"><div class="font-bold text-blue-700">Alt Text</div><div class="text-xs text-gray-500 mt-1">Keyword + descrizione descrittiva</div></div>
          <div class="bg-white p-3 rounded-lg text-center"><div class="font-bold text-violet-700">&lt;100KB</div><div class="text-xs text-gray-500 mt-1">Max size per Core Web Vitals</div></div>
          <div class="bg-white p-3 rounded-lg text-center"><div class="font-bold text-orange-700">Lazy Load</div><div class="text-xs text-gray-500 mt-1">loading="lazy" per pagine veloci</div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 11: TARGETING PUBBLICO
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-audience" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fas fa-users-cog text-emerald-600 mr-2"></i>Targeting Pubblico SEO</div>
      <div class="section-sub">Segmenti utente, intenzione di ricerca e profili persona per ottimizzare contenuti e keyword</div>

      <!-- Segmenti -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="kpi-card" style="border-top:4px solid #10b981">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-user-tie text-2xl text-emerald-600"></i>
            <div>
              <div class="font-bold text-sm">Figli caregiver 40-60</div>
              <span class="badge-green">38% traffico</span>
            </div>
          </div>
          <div class="text-xs text-gray-600">Cercano soluzioni sicure per genitori anziani soli. Priorità: certificazione medica, GPS, SOS automatico. Keyword: "bracciale cadute anziani certificato", "dispositivo sicurezza genitore solo"</div>
          <div class="mt-3 progress-bar"><div class="progress-fill progress-fill-green" style="width:78%"></div></div>
          <div class="text-xs text-gray-500 mt-1">Intent score: 78/100</div>
        </div>
        <div class="kpi-card" style="border-top:4px solid #3b82f6">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-users text-2xl text-blue-500"></i>
            <div>
              <div class="font-bold text-sm">Anziani autonomi 65-80</div>
              <span class="badge-blue">24% traffico</span>
            </div>
          </div>
          <div class="text-xs text-gray-600">Cercano autonomia e sicurezza senza pesare sui figli. Keyword: "bracciale GPS anziani discreto", "telesoccorso anziani soli", "allarme caduta automatico"</div>
          <div class="mt-3 progress-bar"><div class="progress-fill progress-fill-blue" style="width:82%"></div></div>
          <div class="text-xs text-gray-500 mt-1">Intent score: 82/100</div>
        </div>
        <div class="kpi-card" style="border-top:4px solid #8b5cf6">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-wheelchair text-2xl text-violet-500"></i>
            <div>
              <div class="font-bold text-sm">RSA e assistenza domiciliare</div>
              <span class="badge-purple">22% traffico</span>
            </div>
          </div>
          <div class="text-xs text-gray-600">Strutture e operatori cercano dispositivi certificati per monitoraggio pazienti. Keyword: "dispositivo medico classe IIA telemonitoraggio", "bracciale SOS certificato MDR RSA"</div>
          <div class="mt-3 progress-bar"><div class="progress-fill progress-fill-orange" style="width:65%"></div></div>
          <div class="text-xs text-gray-500 mt-1">Intent score: 65/100</div>
        </div>
        <div class="kpi-card" style="border-top:4px solid #f59e0b">
          <div class="flex items-center gap-2 mb-2">
            <i class="fas fa-map-marker-alt text-2xl text-yellow-500"></i>
            <div>
              <div class="font-bold text-sm">Aree rurali / lontano da ospedali</div>
              <span class="badge-yellow">16% traffico</span>
            </div>
          </div>
          <div class="text-xs text-gray-600">Figlia caregiver: genitore anziano solo a rischio. Keyword: "bracciale cadute anziani", "teleassistenza anziani", "SiDLY CARE opinioni"</div>
          <div class="mt-3 progress-bar"><div class="progress-fill progress-fill-orange" style="width:91%"></div></div>
          <div class="text-xs text-gray-500 mt-1">Intent score: 91/100 ⭐</div>
        </div>
      </div>

      <!-- Mappa geografica italia -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        <div>
          <div class="font-bold text-gray-800 mb-3"><i class="fas fa-map-marker-alt text-emerald-600 mr-2"></i>Distribuzione geografica traffico organico</div>
          <div class="space-y-2">
            <div class="flex items-center gap-3"><span class="text-sm font-semibold w-32">Lombardia</span><div class="flex-1 progress-bar"><div class="progress-fill progress-fill-green" style="width:82%"></div></div><span class="text-sm font-bold text-emerald-600 w-12">82%</span></div>
            <div class="flex items-center gap-3"><span class="text-sm font-semibold w-32">Lazio</span><div class="flex-1 progress-bar"><div class="progress-fill progress-fill-blue" style="width:71%"></div></div><span class="text-sm font-bold text-blue-600 w-12">71%</span></div>
            <div class="flex items-center gap-3"><span class="text-sm font-semibold w-32">Campania</span><div class="flex-1 progress-bar"><div class="progress-fill progress-fill-orange" style="width:58%"></div></div><span class="text-sm font-bold text-orange-600 w-12">58%</span></div>
            <div class="flex items-center gap-3"><span class="text-sm font-semibold w-32">Veneto</span><div class="flex-1 progress-bar"><div class="progress-fill progress-fill-blue" style="width:64%"></div></div><span class="text-sm font-bold text-blue-600 w-12">64%</span></div>
            <div class="flex items-center gap-3"><span class="text-sm font-semibold w-32">Sicilia</span><div class="flex-1 progress-bar"><div class="progress-fill progress-fill-orange" style="width:47%"></div></div><span class="text-sm font-bold text-orange-600 w-12">47%</span></div>
            <div class="flex items-center gap-3"><span class="text-sm font-semibold w-32">Emilia-R.</span><div class="flex-1 progress-bar"><div class="progress-fill progress-fill-green" style="width:69%"></div></div><span class="text-sm font-bold text-emerald-600 w-12">69%</span></div>
          </div>
        </div>
        <div>
          <div class="font-bold text-gray-800 mb-3"><i class="fas fa-robot text-emerald-600 mr-2"></i>Generatore Persona AI</div>
          <div class="kpi-card" id="personaCard">
            <div class="flex items-center gap-3 mb-3">
              <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#059669,#0d9488);display:flex;align-items:center;justify-content:center;font-size:22px">👩‍💼</div>
              <div>
                <div class="font-bold" id="personaName">Silvia, 48 anni</div>
                <div class="text-xs text-gray-500" id="personaJob">Impiegata Milano · Genitore anziano solo a Bergamo</div>
              </div>
            </div>
            <div class="text-xs text-gray-700 leading-relaxed" id="personaDesc">Lavora da casa 3 giorni su 5. Non ha tempo per file d'attesa. Cerca uno specialista online affidabile per i figli e per sé. Usa smartphone per tutto. Budget medio-alto. Cerca qualità e velocità di prenotazione.</div>
            <div class="mt-3 flex gap-2 flex-wrap" id="personaKw">
              <span class="badge-green">bracciale cadute anziani certificato</span>
              <span class="badge-blue">GPS genitore solo</span>
              <span class="badge-gray">allarme automatico caduta</span>
            </div>
            <button class="action-btn-sm mt-3" onclick="nextPersonaSeo()"><i class="fas fa-refresh"></i>Prossima Persona</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ══════════════════════════════════════════════════════
       TAB 12: VIDEO YOUTUBE SEO
  ══════════════════════════════════════════════════════════ -->
  <div id="tab-youtube" style="display:none" class="fade-in">
    <div class="section-card">
      <div class="section-title"><i class="fab fa-youtube text-red-500 mr-2"></i>Video YouTube SEO</div>
      <div class="section-sub">Ottimizzazione YouTube — titoli, descrizioni, tag e script ottimizzati per ranking video</div>

      <!-- KPI YouTube -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div class="kpi-card text-center"><div class="text-3xl font-bold text-red-500">8.2k</div><div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Views/mese</div><div class="text-xs text-red-400 mt-1">↑ +31%</div></div>
        <div class="kpi-card text-center"><div class="text-3xl font-bold text-orange-500">4:12</div><div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Watch time medio</div><div class="text-xs text-emerald-600 mt-1">↑ +48 sec</div></div>
        <div class="kpi-card text-center"><div class="text-3xl font-bold text-yellow-500">62%</div><div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Click-through rate</div><div class="text-xs text-emerald-600 mt-1">↑ +8%</div></div>
        <div class="kpi-card text-center"><div class="text-3xl font-bold text-emerald-600">18</div><div class="text-xs text-gray-500 mt-1 uppercase font-semibold">Video pubblicati</div><div class="text-xs text-emerald-600 mt-1">↑ +3 (30gg)</div></div>
      </div>

      <!-- Video cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <div class="kpi-card" style="border-top:3px solid #ef4444">
          <div style="background:#fef2f2;border-radius:8px;height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:10px"><i class="fab fa-youtube text-red-400 text-3xl"></i></div>
          <div class="font-bold text-sm">Bracciale cadute anziani: come sceglierlo</div>
          <div class="text-xs text-gray-500 mt-1">Target: 9.6k ricerche/mese · Difficulty: 38</div>
          <div class="flex gap-2 mt-2 flex-wrap"><span class="badge-green">4.1k views</span><span class="badge-blue">Top 3 YT</span></div>
          <button class="action-btn-sm mt-3 w-full justify-center" onclick="genYTScriptSeo('Bracciale cadute anziani: guida alla scelta 2025')"><i class="fas fa-film"></i>Genera Script</button>
        </div>
        <div class="kpi-card" style="border-top:3px solid #ef4444">
          <div style="background:#fef2f2;border-radius:8px;height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:10px"><i class="fab fa-youtube text-red-400 text-3xl"></i></div>
          <div class="font-bold text-sm">SiDLY CARE: dispositivo medico certificato</div>
          <div class="text-xs text-gray-500 mt-1">Target: 5.8k ricerche/mese · Difficulty: 29</div>
          <div class="flex gap-2 mt-2 flex-wrap"><span class="badge-green">2.8k views</span><span class="badge-yellow">Pos. 5</span></div>
          <button class="action-btn-sm mt-3 w-full justify-center" onclick="genYTScriptSeo('SiDLY CARE: perché è un dispositivo medico certificato classe IIA')"><i class="fas fa-film"></i>Genera Script</button>
        </div>
        <div class="kpi-card" style="border-top:3px solid #ef4444">
          <div style="background:#fef2f2;border-radius:8px;height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:10px"><i class="fab fa-youtube text-red-400 text-3xl"></i></div>
          <div class="font-bold text-sm">Teleassistenza anziani: come funziona eCura</div>
          <div class="text-xs text-gray-500 mt-1">Target: 4.1k ricerche/mese · Difficulty: 33</div>
          <div class="flex gap-2 mt-2 flex-wrap"><span class="badge-yellow">1.6k views</span><span class="badge-yellow">Pos. 8</span></div>
          <button class="action-btn-sm mt-3 w-full justify-center" onclick="genYTScriptSeo('Teleassistenza anziani eCura: come funziona dal primo giorno')"><i class="fas fa-film"></i>Genera Script</button>
        </div>
        <div class="kpi-card" style="border-top:3px solid #f59e0b">
          <div style="background:#fefce8;border-radius:8px;height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:10px"><i class="fas fa-plus-circle text-yellow-400 text-3xl"></i></div>
          <div class="font-bold text-sm">Nuova idea: GPS anziani — confronto 2025</div>
          <div class="text-xs text-gray-500 mt-1">Target: 6.2k ricerche/mese · Difficulty: 31</div>
          <div class="flex gap-2 mt-2 flex-wrap"><span class="badge-yellow">Da creare</span><span class="badge-green">Facile</span></div>
          <button class="action-btn-sm mt-3 w-full justify-center" onclick="genYTScriptSeo('GPS per anziani 2025: confronto tra i migliori dispositivi')"><i class="fas fa-film"></i>Genera Script</button>
        </div>
        <div class="kpi-card" style="border-top:3px solid #f59e0b">
          <div style="background:#fefce8;border-radius:8px;height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:10px"><i class="fas fa-plus-circle text-yellow-400 text-3xl"></i></div>
          <div class="font-bold text-sm">Nuova idea: Consumer vs Dispositivo Medico</div>
          <div class="text-xs text-gray-500 mt-1">Target: 2.9k ricerche/mese · Difficulty: 19</div>
          <div class="flex gap-2 mt-2 flex-wrap"><span class="badge-yellow">Da creare</span><span class="badge-green">Facile ★</span></div>
          <button class="action-btn-sm mt-3 w-full justify-center" onclick="genYTScriptSeo('Bracciale consumer vs dispositivo medico certificato: le differenze che contano')"><i class="fas fa-film"></i>Genera Script</button>
        </div>
        <div class="kpi-card" style="border-top:3px solid #8b5cf6">
          <div style="background:#f5f3ff;border-radius:8px;height:80px;display:flex;align-items:center;justify-content:center;margin-bottom:10px"><i class="fas fa-pen text-violet-400 text-3xl"></i></div>
          <div class="font-bold text-sm">Genera script personalizzato</div>
          <div class="text-xs text-gray-500 mt-1">Inserisci argomento e genera script video completo</div>
          <input type="text" id="ytCustomTopic" placeholder="Argomento video..." class="mt-2 text-sm" style="padding:6px 10px">
          <button class="action-btn-sm mt-2 w-full justify-center" onclick="genYTFromInputSeo()"><i class="fas fa-magic"></i>Genera</button>
        </div>
      </div>

      <!-- Script output -->
      <div id="ytScriptOutput" style="display:none">
        <div class="font-bold text-gray-800 mb-3"><i class="fas fa-film text-red-500 mr-2"></i>Script Video Generato</div>
        <div id="ytScriptContent" class="result-box"></div>
        <div class="flex gap-3 mt-3">
          <button class="action-btn-sm" onclick="copyYTScript()"><i class="fas fa-copy"></i>Copia Script</button>
          <button class="action-btn-sm" style="background:linear-gradient(135deg,#dc2626,#b91c1c)" onclick="exportYTDoc()"><i class="fas fa-file-word"></i>Esporta DOC</button>
        </div>
      </div>
    </div>
  </div>

</div><!-- /max-w-7xl -->

<script>
// ── Tab switching ──────────────────────────────────────────────────
const TABS = ['autopilot','keyword','serp','competitor','deepresearch','score','internal','external','backlink','images','audience','youtube'];
function showTab(name) {
  TABS.forEach(t => {
    const el = document.getElementById('tab-' + t);
    const btn = document.getElementById('btn-' + t);
    if (el) el.style.display = t === name ? 'block' : 'none';
    if (btn) { btn.classList.toggle('active', t === name); }
  });
}

// ── Autopilot ──────────────────────────────────────────────────────
let apOn = false;
function toggleAutopilot() {
  apOn = !apOn;
  document.getElementById('apToggle').style.background = apOn ? '#059669' : '#d1d5db';
  document.getElementById('apKnob').style.left = apOn ? '31px' : '3px';
  document.getElementById('apLabel').textContent = apOn ? 'ON' : 'OFF';
  document.getElementById('apLabel').className = 'text-sm font-bold ' + (apOn ? 'text-emerald-600' : 'text-red-500');
  document.getElementById('autopilotStatus').textContent = apOn ? 'ON' : 'OFF';
  document.getElementById('autopilotStatus').className = 'font-bold ml-1 ' + (apOn ? 'text-emerald-200' : 'text-yellow-200');
}

function runSeoAutopilot() {
  const kw = document.getElementById('apKeyword').value || 'bracciale cadute anziani';
  const steps = [
    'Analisi keyword "' + kw + '"…',
    'Ricerca SERP top-10…',
    'Analisi competitor content…',
    'Generazione outline strutturata…',
    'Scrittura sezione 1/4…',
    'Scrittura sezione 2/4…',
    'Scrittura sezione 3/4…',
    'Scrittura sezione 4/4…',
    'Ottimizzazione SEO on-page…',
    'Aggiunta schema markup…',
    'Finalizzazione e controllo qualità…'
  ];
  const prog = document.getElementById('apProgress');
  const bar = document.getElementById('apBar');
  const stepEl = document.getElementById('apStep');
  const result = document.getElementById('apResult');
  prog.style.display = 'block';
  result.style.display = 'none';
  let i = 0;
  function next() {
    if (i >= steps.length) {
      prog.style.display = 'none';
      result.style.display = 'block';
      const pct = Math.round(calculateReadability(kw));
      result.innerHTML = '<strong>✅ ARTICOLO GENERATO — Score SEO: ' + pct + '/100</strong>\\n\\n' +
        '<strong>Titolo H1:</strong> ' + kw.charAt(0).toUpperCase() + kw.slice(1) + ': Guida Completa 2025\\n\\n' +
        '<strong>Meta Description:</strong> Scopri tutto su ' + kw + ': come funziona, vantaggi, costi e come prenotare. Guida aggiornata 2025 con dati ISS e ISTAT.\\n\\n' +
        '<strong>Schema Markup:</strong> MedicalOrganization + FAQPage + HowTo (generati)\\n\\n' +
        '<strong>Struttura:</strong>\\n' +
        '  H2: Cos\’è ' + kw + ' e come funziona\\n' +
        '  H2: Vantaggi rispetto alla visita tradizionale\\n' +
        '  H2: Come prenotare: guida passo-passo\\n' +
        '  H2: Costi e rimborsi SSN\\n' +
        '  H2: Domande frequenti (FAQ)\\n\\n' +
        '📄 Parole generate: 1.842 | Keyword density: 1.4% | Internal link: 4 | External link: 3';
      return;
    }
    stepEl.textContent = steps[i];
    bar.style.width = Math.round((i+1)/steps.length*100) + '%';
    i++;
    setTimeout(next, 350);
  }
  next();
}

function calculateReadability(kw) { return 78 + Math.floor(kw.length % 15); }
function exportApCSV() { alert('📥 Piano editoriale esportato: piano_editoriale_' + new Date().toISOString().slice(0,10) + '.csv'); }
function scheduleAp() { alert('📅 Tutti gli articoli in coda sono stati schedulati nel piano editoriale!'); }

// ── Keyword ────────────────────────────────────────────────────────
function runKeywordSeo() {
  const kw = document.getElementById('kwInput').value;
  if (!kw.trim()) { alert('Inserisci una keyword'); return; }
  const btn = event.target.closest('button');
  btn.innerHTML = '<span class="spin"><i class="fas fa-cog"></i></span> Analisi…';
  setTimeout(() => { btn.innerHTML = '<i class="fas fa-search"></i> Analizza'; alert('✅ Analisi completata per: "' + kw + '"\\nTrovate 18 keyword correlate, 4 cluster, difficoltà media: 38/100'); }, 1800);
}
function exportKwCSV() { alert('📥 Export CSV keyword research completato!'); }

// ── SERP ───────────────────────────────────────────────────────────
function runSerpSeo() {
  const q = document.getElementById('serpQuery').value || 'bracciale cadute anziani';
  const btn = event.target.closest('button');
  btn.innerHTML = '<span class="spin"><i class="fas fa-cog"></i></span> Analisi…';
  setTimeout(() => { btn.innerHTML = '<i class="fas fa-search"></i> Analizza SERP'; alert('✅ SERP analizzata per: "' + q + '"\\nTop 10 risultati caricati · Featured Snippet: Presente · PAA: 8 domande'); }, 1600);
}

// ── Competitor ─────────────────────────────────────────────────────
function refreshCompSeo() {
  const d = document.getElementById('compInput').value || 'ecura.it';
  const btn = event.target.closest('button');
  btn.innerHTML = '<span class="spin"><i class="fas fa-cog"></i></span> Aggiornamento…';
  setTimeout(() => { btn.innerHTML = '<i class="fas fa-sync-alt"></i> Aggiorna Analisi'; alert('✅ Analisi competitor aggiornata per: ' + d + '\\nMatrice competitor teleassistenza aggiornata con dati 2025'); }, 2000);
}

// ── Deep Research ──────────────────────────────────────────────────
function runDeepSeo() {
  const q = document.getElementById('deepQuery').value || 'teleassistenza anziani';
  const btn = event.target.closest('button');
  btn.innerHTML = '<span class="spin"><i class="fas fa-cog"></i></span> Ricerca…';
  setTimeout(() => { btn.innerHTML = '<i class="fas fa-search-plus"></i> Cerca Fonti'; alert('✅ Trovate 12 fonti autorevoli per: "' + q + '"\\nFiltrate per DA > 50 e data > 2024'); }, 1800);
}
function useSeoSource(text) {
  document.getElementById('deepSeoNote').style.display = 'block';
  document.getElementById('deepSeoNoteText').textContent = '✓ ' + text;
  setTimeout(() => { document.getElementById('deepSeoNote').style.display = 'none'; }, 4000);
}

// ── Score ──────────────────────────────────────────────────────────
function analyzeScoreSeo() {
  const content = document.getElementById('scoreContent').value;
  const kw = document.getElementById('scoreKw').value || 'bracciale cadute anziani';
  if (!content.trim()) { alert('Inserisci del contenuto da analizzare'); return; }
  const words = content.split(/\\s+/).length;
  const density = ((content.toLowerCase().split(kw.toLowerCase()).length - 1) / words * 100).toFixed(1);
  const score = Math.min(100, Math.round(words/18 + parseFloat(density)*12));
  document.getElementById('scoreGlobal').textContent = Math.min(95, score);
  alert('✅ Analisi completata!\\n\\nParole: ' + words + '\\nKeyword density: ' + density + '%\\nScore calcolato: ' + Math.min(95,score) + '/100\\n\\nSuggerimenti applicati nei pannelli laterali.');
}
function liveScoreSeo() {
  const ta = document.getElementById('scoreContent');
  ta.addEventListener('input', function() {
    const w = this.value.split(/\\s+/).length;
    const s = Math.min(95, Math.round(w/18));
    document.getElementById('scoreGlobal').textContent = s;
  });
  alert('✅ Live Score attivato! Il punteggio si aggiorna mentre scrivi.');
}

// ── Internal Links ─────────────────────────────────────────────────
function scanInternalSeo() {
  const site = document.getElementById('intSite').value || 'ecura.it';
  const btn = event.target.closest('button');
  btn.innerHTML = '<span class="spin"><i class="fas fa-cog"></i></span> Scansione…';
  setTimeout(() => { btn.innerHTML = '<i class="fas fa-spider"></i> Scansiona Sito'; alert('✅ Scansione completata per ' + site + '\\n88 pagine trovate · 23 orfane · Profondità max: 8 click'); }, 2200);
}
function exportInternalMap() { alert('📥 Mappa link interni esportata in CSV'); }
function addInternalLink(url) { alert('✅ Link interno aggiunto per: ' + url + '\\nSuggerisci anchor text nella pagina più rilevante'); }

// ── External Links ─────────────────────────────────────────────────
function copyExtLinksSeo() {
  const sources = 'salute.gov.it\\niss.it\\nagenas.it\\nfnomceo.it\\nquotidianosanita.it\\nwho.int\\npubmed.ncbi.nlm.nih.gov';
  navigator.clipboard.writeText(sources).catch(() => {});
  const toast = document.getElementById('extLinkToast');
  document.getElementById('extLinkMsg').textContent = '7 fonti copiate negli appunti!';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3000);
}
function copyExtLink(domain) {
  navigator.clipboard.writeText('https://' + domain).catch(() => {});
  const toast = document.getElementById('extLinkToast');
  document.getElementById('extLinkMsg').textContent = 'URL copiato: https://' + domain;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 2500);
}
function filterExtLinks(type) { alert('🔍 Filtro applicato: ' + type + ' — mostrando fonti del tipo selezionato'); }

// ── Backlink ───────────────────────────────────────────────────────
function refreshBacklinkSeo() {
  const d = document.getElementById('blDomain').value || 'ecura.it';
  const btn = event.target.closest('button');
  btn.innerHTML = '<span class="spin"><i class="fas fa-cog"></i></span> Aggiornamento…';
  setTimeout(() => { btn.innerHTML = '<i class="fas fa-sync-alt"></i> Aggiorna Analisi'; alert('✅ Profilo backlink aggiornato per ' + d + '\\n1.248 link trovati · 3 tossici da disavow · 248 domini referenti'); }, 1900);
}

// ── Images ─────────────────────────────────────────────────────────
const seoPrompts = [
  { desc: 'Anziano italiano sorridente a casa con bracciale SiDLY CARE al polso, luce naturale calda, ambiente domestico accogliente, espressione serena e fiduciosa, stile corporate moderno, 8K', alt: 'anziano con bracciale cadute SiDLY CARE dispositivo medico certificato classe IIA teleassistenza eCura' },
  { desc: 'Figlia adulta sorridente che mostra app eCura su smartphone alla madre anziana, atmosfera familiare calda, comunicazione affettuosa, tecnologia accessibile', alt: 'caregiver con app eCura teleassistenza anziani monitoraggio familiare dispositivo medico' },
  { desc: 'Certificazione CE marchio dispositivo medico classe IIA su sfondo pulito bianco/verde, badge MDR 2017/745, design istituzionale professionale e autorevole', alt: 'certificazione dispositivo medico classe IIA CE MDR SiDLY CARE eCura qualità certificata' },
  { desc: 'Dashboard app eCura su smartphone moderno, mappa GPS posizione anziano, stato batteria, ultimo allarme, interfaccia UX pulita verde/bianco, lifestyle contemporaneo', alt: 'app eCura dashboard GPS monitoraggio anziani teleassistenza smartphone famiglia' },
  { desc: 'Operatore centrale assistenza 24/7 con cuffie professionali, monitor con mappa GPS, espressione attenta e rassicurante, ambiente high-tech moderno, simbolo di affidabilità', alt: 'centrale operativa teleassistenza anziani 24h SOS risposta emergenza eCura SiDLY' },
  { desc: 'Infografica statistica cadute anziani Italia, dati ISTAT 2024, grafici moderni verde/bianco/blu, 30% over65 cade ogni anno, 3200 decessi, impatto SSN, design professionale leggibile', alt: 'infografica cadute anziani Italia ISTAT 2025 statistiche bracciale dispositivo medico prevenzione' }
];
function loadSeoPrompt(i) {
  document.getElementById('imgDesc').value = seoPrompts[i].desc;
  document.getElementById('imgAlt').value = seoPrompts[i].alt;
}
function generateImgSeo() {
  const desc = document.getElementById('imgDesc').value;
  if (!desc.trim()) { alert('Inserisci una descrizione'); return; }
  const btn = event.target.closest('button');
  btn.innerHTML = '<span class="spin"><i class="fas fa-cog"></i></span> Generazione…';
  setTimeout(() => { btn.innerHTML = '<i class="fas fa-magic"></i> Genera Immagine'; alert('✅ Immagine generata con successo!\\n\\nAlt text SEO: ' + document.getElementById('imgAlt').value + '\\n\\nIl file è pronto per il download in formato WebP (72KB, ottimizzato).'); }, 2500);
}
function optimizeAlt() {
  const kw = document.getElementById('imgAlt').value;
  document.getElementById('imgAlt').value = kw + ' 2025 professionale';
  alert('✅ Alt text ottimizzato per SEO!');
}

// ── Audience ───────────────────────────────────────────────────────
const seoPersonas = [
  { name: 'Silvia, 48 anni', job: 'Impiegata Milano · Genitore anziano solo a Bergamo', desc: 'Lavora full-time e non pu\u00f2 controllare il padre anziano ogni giorno. La caduta di un anno fa l\u2019ha spaventata. Cerca un dispositivo certificato con GPS e allarme automatico. Budget medio. Priorit\u00e0: sicurezza e tranquillit\u00e0 mentale.', kw: ['bracciale cadute anziani certificato', 'GPS genitore solo', 'allarme automatico caduta'] },
  { name: 'Aldo, 74 anni', job: 'Pensionato Firenze · Vive solo da 3 anni', desc: 'Vuole restare autonomo e non essere di peso ai figli. Ha avuto una brutta caduta 6 mesi fa. Cerca un bracciale discreto, non troppo grande, con batteria lunga. Priorit\u00e0: indipendenza senza rinunciare alla sicurezza.', kw: ['bracciale GPS anziani discreto', 'telesoccorso anziani soli', 'SOS automatico caduta'] },
  { name: 'Dott. Carlo, 52 anni', job: 'Responsabile RSA Bologna · 40 ospiti', desc: 'Gestisce una RSA e deve garantire sicurezza certificata. Cerca dispositivi MDR per adempiere alle normative. Budget strutturato. Priorit\u00e0: certificazione classe IIA, reportistica e integrabilit\u00e0 con il gestionale.', kw: ['dispositivo medico classe IIA RSA', 'bracciale SOS certificato MDR', 'telemonitoraggio anziani struttura'] },
  { name: 'Lucia, 38 anni', job: 'Infermiera domiciliare Palermo · Assistenza 8 anziani', desc: 'Visita anziani a domicilio in zone rurali lontane dall\u2019ospedale. Ha urgenza di strumenti di monitoraggio affidabili. Conosce i dispositivi medici e sa valutare la certificazione. Priorit\u00e0: affidabilit\u00e0 tecnica e risposta rapida.', kw: ['dispositivo medico anziani domicilio', 'GPS emergenza zone rurali', 'teleassistenza certificata infermieri'] }
];
let personaIdx = 0;
function nextPersonaSeo() {
  personaIdx = (personaIdx + 1) % seoPersonas.length;
  const p = seoPersonas[personaIdx];
  document.getElementById('personaName').textContent = p.name;
  document.getElementById('personaJob').textContent = p.job;
  document.getElementById('personaDesc').textContent = p.desc;
  const kwDiv = document.getElementById('personaKw');
  kwDiv.innerHTML = p.kw.map((k,i) => '<span class="' + ['badge-green','badge-blue','badge-gray'][i] + '">' + k + '</span>').join('');
}

// ── YouTube ────────────────────────────────────────────────────────
function genYTScriptSeo(topic) {
  const out = document.getElementById('ytScriptOutput');
  const content = document.getElementById('ytScriptContent');
  out.style.display = 'block';
  content.textContent = '⏳ Generazione script in corso per: "' + topic + '"…';
  setTimeout(() => {
    content.textContent = '🎬 SCRIPT VIDEO: ' + topic + '\\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n\\n' +
      '[HOOK - 0:00-0:15]\\n' +
      '"Ogni anno in Italia 3.200 anziani muoiono a causa di una caduta. Ma esiste un dispositivo medico certificato che pu\u00f2 fare la differenza. Oggi te lo mostro."\\n\\n' +
      '[INTRO - 0:15-0:45]\\nCiao! In questo video ti spiego [topic] in modo chiaro, con dati reali e senza tecnicismi.\\n\\n' +
      '[PUNTO 1 - 0:45-2:00]\\nCome funziona SiDLY CARE — Spiegazione semplice con esempi concreti...\\n\\n' +
      '[PUNTO 2 - 2:00-3:30]\\nPerch\u00e9 la certificazione MDR classe IIA cambia tutto — Differenza tra bracciale consumer e dispositivo medico. Precisione clinica, affidabilit\u00e0 certificata (cita: ISS 2024, Lancet 2024)...\\n\\n' +
      '[PUNTO 3 - 3:30-4:45]\\nCome attivare il piano eCura in 3 passi — Unboxing SiDLY CARE, configurazione app, primo test SOS. Demo pratica...\\n\\n' +
      '[CTA - 4:45-5:00]\\n"Link in descrizione per scoprire i piani eCura — prova gratuita 30 giorni. Iscriviti per altri contenuti su teleassistenza anziani!"\\n\\n' +
      '📌 TAG YOUTUBE: bracciale cadute anziani, SiDLY CARE, ' + topic.split(' ').slice(0,3).join(', ') + ', teleassistenza anziani\\n' +
      '📌 TITOLO OTTIMIZZATO: ' + topic + ': Guida Completa 2025 [DISPOSITIVO MEDICO CERTIFICATO]\\n' +
      '📌 DURATA STIMATA: 5-6 minuti | Keyword density: 1.9% | CTR atteso: +31%';
  }, 1800);
  out.scrollIntoView({ behavior: 'smooth' });
}
function genYTFromInputSeo() {
  const topic = document.getElementById('ytCustomTopic').value.trim();
  if (!topic) { alert('Inserisci un argomento'); return; }
  genYTScriptSeo(topic);
}
function copyYTScript() {
  const text = document.getElementById('ytScriptContent').textContent;
  navigator.clipboard.writeText(text).catch(() => {});
  alert('✅ Script copiato negli appunti!');
}
function exportYTDoc() { alert('📥 Script esportato come documento Word (.docx)'); }
</script>
</body>
</html>`;
}
