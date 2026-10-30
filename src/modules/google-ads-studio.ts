// Google Ads Studio — bozze, controlli e CSV per Google Ads Editor.
// Nessuna chiamata verso Google Ads: le campagne escono sempre in pausa e le attivi tu.
import { renderShell } from './marketing-ui'

const BODY = String.raw`
<div class="card" style="border-left:5px solid #16a34a;background:#f0fdf4">
  <b>Come funziona:</b> prepari o generi una <b>bozza</b>, la controlli, la <b>approvi tu</b> e scarichi il CSV per Google Ads Editor.
  Il file imposta sempre <b>Campaign Status = Paused</b>: nulla va online e nulla spende finché non lo accendi tu in Google Ads.
</div>

<div data-tab="campagna">
  <div class="card">
    <div class="flex flex-wrap gap-3 items-end">
      <div style="min-width:260px;flex:1"><label class="l">Bozze salvate</label><select id="planSel" onchange="loadPlan(this.value)"><option value="">— scegli una bozza —</option></select></div>
      <button class="btn btn-s" onclick="newFromPreset()">Nuova dal piano &laquo;Primo lancio&raquo;</button>
      <span id="stChip"></span>
    </div>
  </div>
  <div id="planBox"><div class="card muted">Caricamento…</div></div>
  <datalist id="smlist"></datalist>
</div>

<div data-tab="pagine" style="display:none">
  <div class="card">
    <h2 class="font-bold text-lg mb-1">Da blog e pagine del sito a bozza di campagna</h2>
    <p class="muted mb-3">L'elenco arriva da <code>sitemap.xml</code>. Legge titolo, H1, sezioni e FAQ della pagina e propone un gruppo di annunci. Con OpenAI collegato scrive i testi; altrimenti usa un modello base. In entrambi i casi i testi passano dai controlli (30/90 caratteri, prezzi, claim vietati, nome del dispositivo) e viene salvata una <b>bozza</b>.</p>
    <div id="pgList" class="muted">Caricamento…</div>
  </div>
  <div id="genOut"></div>
</div>

<div data-tab="termini" style="display:none">
  <div class="card">
    <h2 class="font-bold text-lg mb-1">Termini di ricerca → negative</h2>
    <p class="muted mb-3">In Google Ads: Campagne → Parole chiave → <b>Termini di ricerca</b> → Scarica CSV. Caricalo qui: ti propongo le negative in base ai clic senza conversioni. Se Google non ha ancora conversioni registrate, la regola non è affidabile: in quel caso trovi solo una lista da rivedere a mano.</p>
    <div class="grid md:grid-cols-3 gap-3 mb-3">
      <div class="md:col-span-2"><label class="l">File CSV</label><input type="file" id="stFile" accept=".csv,.txt,.tsv"></div>
      <div><label class="l">Soglia clic senza conversioni</label><input type="number" id="stMin" value="15" min="1" max="100"></div>
    </div>
    <button class="btn btn-p" onclick="analyzeTerms(this)">Analizza</button>
  </div>
  <div id="stOut"></div>
</div>

<div data-tab="gsc" style="display:none">
  <div class="card">
    <h2 class="font-bold text-lg mb-1">Mappa delle opportunità (Search Console)</h2>
    <p class="muted mb-3">Dove conviene pagare e dove no: <b>Annuncio</b> = sei in pos. 4-20 e perdi clic; <b>Non pagare</b> = sei già nei primi posti sul brand; <b>SEO</b> = oltre pos. 20, meglio lavorare sui contenuti.</p>
    <button class="btn btn-p" onclick="loadGsc(this)">Carica dati (ultimi 28 giorni)</button>
  </div>
  <div id="gscOut"></div>
</div>

<div data-tab="risultati" style="display:none">
  <div class="card">
    <h2 class="font-bold text-lg mb-2">Risultati dal CRM</h2>
    <div id="perfOut" class="muted">Caricamento…</div>
  </div>
  <div class="card">
    <h3 class="font-bold mb-2">Spesa del mese (la inserisci tu, dal conto Google Ads)</h3>
    <div class="flex gap-3 items-end flex-wrap">
      <div><label class="l">Mese</label><input type="text" id="spMonth" style="width:120px"></div>
      <div><label class="l">Spesa € (IVA esclusa)</label><input type="number" id="spAmount" step="0.01" style="width:140px"></div>
      <button class="btn btn-p" onclick="saveSpend()">Salva</button>
    </div>
    <p class="muted mt-2">Il costo per contatto si calcola solo con una spesa inserita. Fino ad allora non viene mostrato nessun valore stimato.</p>
  </div>
</div>

<div data-tab="lancio" style="display:none">
  <div class="card">
    <h2 class="font-bold text-lg mb-2">Calendario di lancio</h2>
    <p class="muted mb-2">Un gruppo alla volta, per leggere dati puliti (dal piano campagna). Nel CSV G2 e G3 sono già <b>in pausa</b>: li attivi tu nei giorni indicati.</p>
    <table class="t"><tr><th>Quando</th><th>Cosa fare</th></tr>
      <tr><td><b>Giorno 0</b></td><td>Fix del redirect <code>generate_lead</code> (fatto sul sito) e verifica in GA4 DebugView. Importa il CSV in Google Ads Editor e controlla tutto prima di pubblicare.</td></tr>
      <tr><td><b>Giorni 1-3</b></td><td>Attiva solo <b>G1 Confronto</b>. Budget unico a livello di campagna.</td></tr>
      <tr><td><b>Giorno 3</b></td><td>Prima lettura dei termini di ricerca: carica il CSV nella scheda «Termini di ricerca».</td></tr>
      <tr><td><b>Giorno 4</b></td><td>Attiva <b>G2 Costi</b>.</td></tr>
      <tr><td><b>Giorno 7</b></td><td>Controllo settimanale: CTR, CPC, costo per contatto, quota impressioni. Se le impressioni sono sotto 2.000 valuta di alzare il CPC massimo. Attiva <b>G3 Prodotto</b> (assorbe più budget: per ultimo).</td></tr>
      <tr><td><b>Giorno 14</b></td><td>Metti in pausa la regione con meno di 15 clic e zero contatti.</td></tr>
      <tr><td><b>Giorno 30</b></td><td>Confronta i due annunci per gruppo, tieni il migliore, scrivi una variante.</td></tr>
      <tr><td><b>Giorno 45-60</b></td><td>Verifica lead → cliente della campagna: sotto il 5% il budget va tagliato, qualunque sia il costo per contatto.</td></tr>
    </table>
  </div>
  <div class="card">
    <h2 class="font-bold text-lg mb-2">Checklist di attivazione</h2>
    <div id="chk"></div>
  </div>
  <div class="card">
    <h2 class="font-bold text-lg mb-2">Tracciamento (solo tramite Google Tag Manager)</h2>
    <ul class="list-disc ml-5 text-sm space-y-1">
      <li>Account Google Ads <b>AW-18350012797</b> · contenitore GTM <b>GTM-THW7H9NB</b>.</li>
      <li>L'evento <code>generate_lead</code> parte dal sito; la conversione Google Ads si crea in GTM con il trigger su quell'evento. <b>Non aggiungere uno snippet gtag diretto</b>: conteggerebbe due volte.</li>
      <li>L'etichetta di conversione non serve per ora: quando creerai l'azione di conversione in Google Ads la inserirai nel tag GTM.</li>
      <li>Il sito salva gclid/gbraid/wbraid con il consenso marketing e il CRM li memorizza nel lead: serviranno per caricare le conversioni offline (<code>/api/admin/ads-offline-conversions</code>).</li>
    </ul>
  </div>
  <div class="card">
    <h2 class="font-bold text-lg mb-2">Import in Google Ads Editor</h2>
    <ol class="list-decimal ml-5 text-sm space-y-1">
      <li>Apri Google Ads Editor, scarica l'account e scegli <b>Account → Importa → Da file</b>.</li>
      <li>Seleziona il CSV scaricato da qui e controlla l'anteprima delle modifiche.</li>
      <li>Verifica che campagna e gruppi siano «In pausa» e che le zone e le offerte per regione siano corrette.</li>
      <li>Pubblica con <b>Pubblica modifiche</b>. Poi attiva la campagna dall'interfaccia web quando sei pronto.</li>
    </ol>
  </div>
</div>
`

const JS = String.raw`
var S={plan:null,id:null,meta:null,preset:null,dirty:false,regionsAll:[]};
var CHECK=['Applicare il fix del redirect generate_lead e verificarlo in GA4 DebugView','Eliminare la campagna Performance Max da 1 €/giorno (se ancora presente)','Importare il CSV in Google Ads Editor e controllare l\'anteprima','Zone: 7 regioni con i correttivi, opzione «Presenza»','Budget e CPC massimo come da bozza (campagna unica)','Verificare che «salvavita» NON sia tra le negative e che «seremy» non sia a livello campagna','Attivare la campagna con il solo G1 (G2 e G3 restano in pausa)','Giorno 4: attivare G2 · Giorno 7: attivare G3','Aggiungere sitelink, callout ed estratto strutturato (già nel CSV)','Giorni 7 · 14 · 30: controlli del calendario'];

function kwToText(ks){return (ks||[]).map(function(k){return k.match==='Exact'?'['+k.text+']':k.match==='Phrase'?'"'+k.text+'"':k.text}).join('\n')}
function textToKw(t){return String(t||'').split('\n').map(function(l){l=l.trim();if(!l)return null;var m='Broad';if(/^\[.*\]$/.test(l)){m='Exact';l=l.slice(1,-1)}else if(/^".*"$/.test(l)){m='Phrase';l=l.slice(1,-1)}l=l.trim();return l?{text:l,match:m}:null}).filter(Boolean)}
function lines(t){return String(t||'').split('\n').map(function(x){return x.trim()}).filter(Boolean)}
function chips(arr,max){return arr.map(function(s,i){var n=s.length;return '<span class="chip '+(n>max?'bad':n>max-3?'warn':'ok')+'" title="'+esc(s)+'">'+(i+1)+': '+n+'/'+max+'</span>'}).join('')}

function renderPlan(){
  var p=S.plan;if(!p){$('planBox').innerHTML='<div class="card muted">Scegli una bozza o creane una nuova.</div>';return}
  var h='<div class="card"><h2 class="font-bold text-lg mb-3">Campagna</h2><div class="grid md:grid-cols-4 gap-3">'+
   '<div class="md:col-span-2"><label class="l">Nome campagna</label><input type="text" id="p_name" value="'+esc(p.campaignName)+'"></div>'+
   '<div><label class="l">Budget €/giorno</label><input type="number" step="0.5" id="p_budget" value="'+p.dailyBudget+'"></div>'+
   '<div><label class="l">CPC massimo €</label><input type="number" step="0.05" id="p_cpc" value="'+p.maxCpc+'"></div>'+
   '<div class="md:col-span-4"><label class="l">Parametro UTM campagna</label><input type="text" id="p_utm" value="'+esc(p.utmCampaign)+'"></div></div>'+
   '<div class="muted mt-2">Strategia: Massimizza clic con CPC massimo · Rete: solo ricerca Google (Display e partner esclusi) · Stato: <b>In pausa</b>.</div>'+
   '<div id="fc" class="mt-3"></div></div>';
  h+='<div class="card"><h2 class="font-bold text-lg mb-1">Zone e offerte</h2><p class="muted mb-2">Segna le regioni da coprire e il correttivo sull\'offerta (es. +50 o -40).</p><table class="t"><tr><th></th><th>Regione</th><th>Correttivo %</th></tr>';
  S.regionsAll.forEach(function(r,i){var cur=p.regions.filter(function(x){return x.id===r.id})[0];
    h+='<tr><td><input type="checkbox" id="r_on_'+i+'"'+(cur?' checked':'')+'></td><td>'+esc(r.name)+'</td><td><input type="number" id="r_bid_'+i+'" value="'+(cur?cur.bid:r.bid)+'" style="width:90px"></td></tr>'});
  h+='</table></div>';
  h+='<div class="card"><h2 class="font-bold text-lg mb-1">Negative a livello campagna</h2><p class="muted mb-2">Una per riga. Sono tutte a corrispondenza a frase.</p><textarea id="p_neg" rows="6">'+esc(p.campaignNegatives.join('\n'))+'</textarea></div>';
  p.adGroups.forEach(function(g,i){
    h+='<div class="card" data-g="'+i+'"><div class="flex justify-between items-center mb-2"><h2 class="font-bold text-lg">Gruppo di annunci '+(i+1)+'</h2><button class="btn btn-r" onclick="delGroup('+i+')">Rimuovi</button></div>'+
    '<div class="grid md:grid-cols-3 gap-3 mb-3"><div><label class="l">Nome</label><input type="text" id="g_name_'+i+'" value="'+esc(g.name)+'"></div>'+
    '<div class="md:col-span-2"><label class="l">Pagina di destinazione (dal sito)</label><input type="text" list="smlist" id="g_url_'+i+'" value="'+esc(g.finalUrl)+'"></div>'+
    '<div><label class="l">Path 1 (max 15)</label><input type="text" id="g_p1_'+i+'" value="'+esc(g.path1||'')+'"></div>'+
    '<div><label class="l">Path 2 (max 15)</label><input type="text" id="g_p2_'+i+'" value="'+esc(g.path2||'')+'"></div>'+
    '<div><label class="l">Titolo da fissare in pos. 1 (facoltativo)</label><input type="text" id="g_pin_'+i+'" value="'+esc(g.pin1||'')+'"></div>'+
    '<div class="md:col-span-3"><label><input type="checkbox" id="g_sp_'+i+'"'+(g.startPaused?' checked':'')+'> Gruppo in pausa all\'importazione (lo accendi nel giorno previsto dal calendario'+(g.launchDay?': giorno '+g.launchDay:'')+')</label></div></div>'+
    '<div class="grid md:grid-cols-2 gap-3"><div><label class="l">Keyword (una per riga: <code>"frase"</code> · <code>[esatta]</code> · senza simboli = generica)</label><textarea id="g_kw_'+i+'" rows="7">'+esc(kwToText(g.keywords))+'</textarea></div>'+
    '<div><label class="l">Negative del gruppo</label><textarea id="g_neg_'+i+'" rows="7">'+esc((g.negatives||[]).join('\n'))+'</textarea></div>'+
    '<div><label class="l">Titoli (3-15, max 30 caratteri)</label><textarea id="g_h_'+i+'" rows="9">'+esc(g.headlines.join('\n'))+'</textarea><div id="g_hc_'+i+'" class="mt-1"></div></div>'+
    '<div><label class="l">Descrizioni (2-4, max 90 caratteri)</label><textarea id="g_d_'+i+'" rows="9">'+esc(g.descriptions.join('\n'))+'</textarea><div id="g_dc_'+i+'" class="mt-1"></div></div></div></div>';
  });
  h+='<div class="card"><button class="btn btn-s" onclick="addGroup()">+ Aggiungi gruppo</button></div>';
  h+='<div class="card"><h2 class="font-bold text-lg mb-2">Controlli</h2><div id="lintOut" class="muted">Premi «Controlla» o salva la bozza.</div></div>';
  h+='<div class="card flex flex-wrap gap-2 items-center"><button class="btn btn-s" onclick="doLint(this)">Controlla</button><button class="btn btn-p" onclick="savePlan(this)">Salva bozza</button><button class="btn btn-g" id="btnApprove" onclick="approve(this)">Approva</button><button class="btn btn-s" id="btnRevoke" onclick="revoke(this)">Rimuovi approvazione</button><button class="btn btn-s" id="btnCsv" onclick="downloadCsv(this)">Scarica CSV per Google Ads Editor</button><span class="muted" id="stHint"></span></div>';
  $('planBox').innerHTML=h;
  p.adGroups.forEach(function(g,i){counters(i)});
  updStatus();doForecast();
}
function counters(i){var h=$('g_h_'+i),d=$('g_d_'+i);if(h)$('g_hc_'+i).innerHTML='<div class="muted mb-1">'+lines(h.value).length+' titoli</div>'+chips(lines(h.value),30);if(d)$('g_dc_'+i).innerHTML='<div class="muted mb-1">'+lines(d.value).length+' descrizioni</div>'+chips(lines(d.value),90)}
function collect(){
  var p=S.plan;if(!p)return null;
  var q=function(id){var e=$(id);return e?e.value:''};
  p.campaignName=q('p_name').trim();p.utmCampaign=q('p_utm').trim();p.dailyBudget=Number(q('p_budget'));p.maxCpc=Number(q('p_cpc'));
  p.campaignNegatives=lines(q('p_neg'));
  p.regions=[];S.regionsAll.forEach(function(r,i){if($('r_on_'+i)&&$('r_on_'+i).checked)p.regions.push({key:r.key,name:r.name,id:r.id,bid:Number(q('r_bid_'+i))||0})});
  p.adGroups=p.adGroups.map(function(g,i){return {name:q('g_name_'+i).trim(),finalUrl:q('g_url_'+i).trim(),path1:q('g_p1_'+i).trim(),path2:q('g_p2_'+i).trim(),pin1:q('g_pin_'+i).trim(),startPaused:$('g_sp_'+i).checked,launchDay:g.launchDay,keywords:textToKw(q('g_kw_'+i)),negatives:lines(q('g_neg_'+i)),headlines:lines(q('g_h_'+i)),descriptions:lines(q('g_d_'+i))}});
  return p;
}
document.addEventListener('input',function(e){
  var id=e.target&&e.target.id||'';if(!S.plan||!$('planBox').contains(e.target))return;
  S.dirty=true;var m=id.match(/^g_([hd])_(\d+)$/);if(m)counters(Number(m[2]));
  if(/^p_(budget|cpc)$/.test(id))doForecast();updStatus();
});
function addGroup(){collect();S.plan.adGroups.push({name:'Nuovo gruppo',finalUrl:'https://www.ecura.it/',keywords:[],negatives:[],headlines:[],descriptions:[],path1:'',path2:''});S.dirty=true;renderPlan()}
function delGroup(i){if(!confirm('Rimuovere questo gruppo dalla bozza?'))return;collect();S.plan.adGroups.splice(i,1);S.dirty=true;renderPlan()}
function updStatus(){
  var st=S.meta?S.meta.status:'nuova';var lab={draft:'Bozza',approved:'Approvata',exported:'Esportata',nuova:'Non salvata'}[st]||st;
  $('stChip').innerHTML='<span class="chip '+(st==='draft'||st==='nuova'?'warn':'ok')+'">'+lab+(S.dirty?' · modifiche non salvate':'')+'</span>';
  var ap=$('btnApprove'),rv=$('btnRevoke'),cv=$('btnCsv');if(!ap)return;
  ap.style.display=(st==='approved'||st==='exported')&&!S.dirty?'none':'';ap.disabled=!S.id||S.dirty;
  rv.style.display=(st==='approved'||st==='exported')?'':'none';cv.disabled=!(S.id&&!S.dirty&&(st==='approved'||st==='exported'));
  $('stHint').textContent=!S.id?'Salva la bozza per poterla approvare.':S.dirty?'Salva le modifiche: dopo ogni modifica serve una nuova approvazione.':st==='draft'?'Controlla e approva: solo allora il CSV è scaricabile.':'';
}
async function doLint(btn){collect();busy(btn,true,'Controllo…');try{var r=await api('/lint',{method:'POST',body:{plan:S.plan}});$('lintOut').innerHTML=r.success?lintHtml(r.issues):'<div class="lint error">'+esc(r.error)+'</div>'}finally{busy(btn,false)}}
async function savePlan(btn){
  collect();busy(btn,true,'Salvo…');
  try{var r=await api('/plans',{method:'POST',body:{id:S.id,name:S.plan.campaignName,plan:S.plan}});
    if(!r.success){toast(r.error||'Errore');return}
    S.id=r.id;S.meta={id:r.id,status:'draft'};S.dirty=false;$('lintOut').innerHTML=lintHtml(r.issues);toast('Bozza salvata');await listPlans(true);updStatus();
  }finally{busy(btn,false)}
}
async function approve(btn){
  busy(btn,true,'');
  try{var r=await api('/plans/'+S.id+'/approve',{method:'POST'});
    if(!r.success){toast(r.error||'Errore');if(r.issues)$('lintOut').innerHTML=lintHtml(r.issues);return}
    S.meta.status='approved';toast('Approvata. Il CSV è pronto: resta in pausa fino a quando lo attivi tu.');$('lintOut').innerHTML=lintHtml(r.issues);updStatus();listPlans(true);
  }finally{busy(btn,false)}
}
async function revoke(btn){var r=await api('/plans/'+S.id+'/revoke',{method:'POST'});if(r.success){S.meta.status='draft';updStatus();listPlans(true)}}
async function downloadCsv(btn){
  busy(btn,true,'');
  try{var res=await fetch('/api/marketing/plans/'+S.id+'/csv',{credentials:'same-origin'});
    if(!res.ok){var j=await res.json().catch(function(){return {}});toast(j.error||'Errore');return}
    var cd=res.headers.get('content-disposition')||'';var m=cd.match(/filename="([^"]+)"/);
    var blob=await res.blob();var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=m?m[1]:'google-ads-editor.csv';document.body.appendChild(a);a.click();a.remove();
    S.meta.status='exported';updStatus();listPlans(true);toast('CSV scaricato. Campaign Status = Paused.');
  }finally{busy(btn,false)}
}
async function doForecast(){
  if(!S.plan)return;var b=Number($('p_budget')&&$('p_budget').value)||S.plan.dailyBudget;
  var r=await api('/forecast',{method:'POST',body:{budget:b,cpcMin:0.55,cpcMax:Number($('p_cpc')&&$('p_cpc').value)||S.plan.maxCpc,crMin:0.03,crMax:0.05}});
  if(!r.success)return;var f=r.forecast;
  var need=function(l,c){return Math.round(l*c/30.4*10)/10};
  $('fc').innerHTML='<div class="lint info"><span>📈</span><span><b>Previsione mensile (indicativa)</b>: spesa ~'+f.spendMonth+' € · '+f.clicks[0]+'-'+f.clicks[1]+' clic · '+f.leads[0]+'-'+f.leads[1]+' contatti · costo per contatto '+f.cpl[0]+'-'+f.cpl[1]+' € (ipotesi: CPC 0,55-0,70 €, conversione 3-5%).<br>Obiettivo 30-40 contatti a 12-15 € l\'uno: servono circa <b>'+need(30,12)+'-'+need(40,15)+' €/giorno</b> (centrale ~'+need(35,13.5)+' €). Con '+b+' €/giorno il risultato realistico è più basso: valuta il budget dopo le prime due settimane di dati.</span></div>';
}
async function listPlans(keep){
  var r=await api('/plans');var sel=$('planSel');var cur=S.id;
  sel.innerHTML='<option value="">— scegli una bozza —</option>'+(r.plans||[]).map(function(p){return '<option value="'+p.id+'"'+(String(p.id)===String(cur)?' selected':'')+'>#'+p.id+' · '+esc(p.name)+' ['+p.status+']</option>'}).join('');
}
async function loadPlan(id){
  if(!id)return;if(S.dirty&&!confirm('Hai modifiche non salvate. Continuare?')){listPlans();return}
  var r=await api('/plans/'+id);if(!r.success){toast(r.error);return}
  S.plan=r.plan;S.id=r.meta.id;S.meta=r.meta;S.dirty=false;renderPlan();$('lintOut').innerHTML=lintHtml(r.issues);
}
async function newFromPreset(){
  if(S.dirty&&!confirm('Hai modifiche non salvate. Continuare?'))return;
  var r=await api('/preset');S.preset=r.plan;S.plan=JSON.parse(JSON.stringify(r.plan));S.id=null;S.meta=null;S.dirty=true;renderPlan();$('lintOut').innerHTML=lintHtml(r.issues);
}
async function loadSitemap(){
  var r=await api('/sitemap');if(!r.success)return;
  $('smlist').innerHTML=r.urls.map(function(u){return '<option value="'+esc(u.url)+'">'}).join('');
  var rows=r.urls.filter(function(u){return u.kind!=='home'||true}).map(function(u){return '<tr><td><a class="text-blue-600" target="_blank" href="'+esc(u.url)+'">'+esc(u.url.replace('https://www.ecura.it',''))+'</a></td><td><span class="chip mut">'+u.kind+'</span></td><td style="white-space:nowrap"><button class="btn btn-p" onclick="gen(\''+esc(u.url)+'\',\'ai\',this)">Genera con OpenAI</button> <button class="btn btn-s" onclick="gen(\''+esc(u.url)+'\',\'template\',this)">Modello base</button></td></tr>'}).join('');
  $('pgList').innerHTML='<table class="t"><tr><th>Pagina</th><th>Tipo</th><th></th></tr>'+rows+'</table><p class="muted mt-2">'+r.count+' pagine in sitemap</p>';
}
async function gen(url,mode,btn){
  busy(btn,true,'Genero…');
  try{var r=await api('/generate',{method:'POST',body:{url:url,mode:mode}});
    if(!r.success){toast(r.error||'Errore');return}
    S.plan=r.plan;S.id=r.id;S.meta={id:r.id,status:'draft'};S.dirty=false;
    $('genOut').innerHTML='<div class="card"><b>Bozza #'+r.id+' creata</b> da '+esc(r.page.url)+' · origine: <span class="chip '+(r.used==='ai'?'ok':'warn')+'">'+(r.used==='ai'?'OpenAI '+esc(r.model):'modello base')+'</span>'+(r.note?'<div class="lint warn mt-2">'+esc(r.note)+'</div>':'')+(r.dropped&&r.dropped.length?'<div class="muted mt-2">Testi scartati dai controlli: '+r.dropped.map(esc).join(' · ')+'</div>':'')+'<div class="mt-2">'+lintHtml(r.issues)+'</div><button class="btn btn-p mt-2" onclick="showTab(\'campagna\')">Apri nell\'editor</button></div>';
    await listPlans(true);renderPlan();$('lintOut').innerHTML=lintHtml(r.issues);toast('Bozza creata (non attiva)');
  }finally{busy(btn,false)}
}
function readFile(inp){return new Promise(function(res){var f=inp.files&&inp.files[0];if(!f)return res('');var fr=new FileReader();fr.onload=function(){res(String(fr.result||''))};fr.readAsText(f)})}
async function analyzeTerms(btn){
  var csv=await readFile($('stFile'));if(!csv){toast('Scegli un file CSV');return}
  busy(btn,true,'Analizzo…');
  try{var r=await api('/search-terms',{method:'POST',body:{csv:csv,minClicks:Number($('stMin').value)||15}});
    if(!r.success){$('stOut').innerHTML='<div class="card"><div class="lint error">'+esc(r.error)+'</div></div>';return}
    var t=r.totals,h='<div class="card"><b>'+t.terms+'</b> termini · <b>'+t.clicks+'</b> clic · <b>'+eur(t.cost)+'</b> spesi · <b>'+t.conv+'</b> conversioni</div>';
    if(r.noConvData)h+='<div class="card"><div class="lint warn"><span>⚠️</span><span>In questo file <b>nessun termine ha conversioni</b>: non posso dire quali siano «sprecati». Qui sotto trovi i termini con molti clic da rivedere a mano. Quando Google avrà dati di conversione, la proposta diventerà automatica.</span></div></div>';
    var list=r.noConvData?r.review:r.negatives;
    h+='<div class="card"><h3 class="font-bold mb-2">'+(r.noConvData?'Da rivedere a mano':'Negative proposte')+' ('+list.length+')</h3>'+(list.length?'<table class="t"><tr><th></th><th>Termine</th><th>Clic</th><th>Costo</th><th>Motivo</th></tr>'+list.map(function(n,i){return '<tr><td><input type="checkbox" class="ngsel" data-t="'+esc(n.term)+'"'+(r.noConvData?'':' checked')+'></td><td>'+esc(n.term)+'</td><td>'+n.clicks+'</td><td>'+eur(n.cost)+'</td><td class="muted">'+esc(n.reason)+'</td></tr>'}).join('')+'</table><button class="btn btn-p mt-3" onclick="copyNeg()">Copia le selezionate</button><textarea id="negOut" rows="4" class="mt-2" placeholder="Qui compaiono le negative selezionate, una per riga"></textarea>':'<div class="muted">Nessun termine sopra soglia.</div>')+'</div>';
    if(r.conflicts&&r.conflicts.length)h+='<div class="card"><div class="lint error"><span>⛔</span><span>Attenzione: queste negative bloccherebbero keyword attive: <b>'+r.conflicts.map(esc).join(', ')+'</b>. Non aggiungerle.</span></div></div>';
    if(r.watch&&r.watch.length)h+='<div class="card"><h3 class="font-bold mb-2">Contengono temi già esclusi</h3><div class="muted mb-1">Verifica che la negativa sia attiva.</div>'+r.watch.map(function(w){return '<span class="chip warn">'+esc(w.term)+' ('+w.clicks+')</span>'}).join('')+'</div>';
    h+='<div class="card"><h3 class="font-bold mb-2">Termini più costosi</h3><table class="t"><tr><th>Termine</th><th>Clic</th><th>Costo</th><th>Conv.</th></tr>'+r.topTerms.map(function(x){return '<tr><td>'+esc(x.term)+'</td><td>'+x.clicks+'</td><td>'+eur(x.cost)+'</td><td>'+x.conv+'</td></tr>'}).join('')+'</table></div>';
    $('stOut').innerHTML=h;
  }finally{busy(btn,false)}
}
function copyNeg(){var v=[].slice.call(document.querySelectorAll('.ngsel')).filter(function(c){return c.checked}).map(function(c){return c.getAttribute('data-t')});$('negOut').value=v.join('\n');try{navigator.clipboard.writeText(v.join('\n'));toast(v.length+' negative copiate')}catch(e){}}
function gscTable(title,rows,hint){return '<div class="card"><h3 class="font-bold mb-1">'+title+' ('+rows.length+')</h3><div class="muted mb-2">'+hint+'</div>'+(rows.length?'<table class="t"><tr><th>Query</th><th>Impr.</th><th>Clic</th><th>Pos.</th><th>Clic persi (stima)</th></tr>'+rows.map(function(r){return '<tr><td>'+esc(r.key)+'</td><td>'+r.impressions+'</td><td>'+r.clicks+'</td><td>'+r.position+'</td><td>'+(r.lostClicks||'')+'</td></tr>'}).join('')+'</table>':'<div class="muted">Nessuna.</div>')+'</div>'}
async function loadGsc(btn){
  busy(btn,true,'Carico…');
  try{var r=await api('/gsc');
    if(!r.success){$('gscOut').innerHTML='<div class="card"><div class="lint warn">'+(r.notConfigured?'Search Console non è ancora collegata al CRM (manca la chiave Google nei segreti di Cloudflare). ':'')+esc(r.error)+'</div></div>';return}
    $('gscOut').innerHTML='<div class="card muted">Periodo '+r.range.start+' → '+r.range.end+' · '+r.total+' query</div>'+gscTable('Qui conviene un annuncio',r.ads,'Posizione 4-20 con molte impressioni: stai perdendo clic.')+gscTable('Non pagare',r.noAds,'Brand già in prima posizione: il clic è gratuito.')+gscTable('Meglio lavorare sulla SEO',r.seo,'Oltre la posizione 20: un annuncio costerebbe più di quanto rende.');
  }finally{busy(btn,false)}
}
async function loadPerf(){
  var r=await api('/performance');if(!r.success){$('perfOut').textContent='Errore';return}
  $('spMonth').value=r.month;$('spAmount').value=r.spend[r.month]||'';
  $('perfOut').innerHTML='<div class="grid md:grid-cols-4 gap-3 mb-3"><div class="card" style="margin:0"><div class="muted">Lead ultimi '+r.days+' gg</div><div class="text-2xl font-bold">'+r.leads+'</div></div><div class="card" style="margin:0"><div class="muted">Con click ID Google</div><div class="text-2xl font-bold">'+r.leadsGoogle+'</div></div><div class="card" style="margin:0"><div class="muted">Spesa '+r.month+'</div><div class="text-2xl font-bold">'+(r.spendMonth?eur(r.spendMonth):'—')+'</div></div><div class="card" style="margin:0"><div class="muted">Costo per contatto</div><div class="text-2xl font-bold">'+(r.cpl?eur(r.cpl):'—')+'</div></div></div>'+
   '<div class="muted mb-2">Obiettivo: '+r.target.leadsMonth[0]+'-'+r.target.leadsMonth[1]+' contatti/mese a '+r.target.cpl[0]+'-'+r.target.cpl[1]+' € l\'uno. «Con click ID Google» conta solo i lead arrivati da un clic sugli annunci con consenso marketing: è una stima per difetto.</div>'+
   '<h3 class="font-bold mt-3 mb-1">Per canale</h3>'+r.byChannel.map(function(c){return '<span class="chip info">'+esc(c.canale)+': '+c.n+'</span>'}).join('')+
   '<h3 class="font-bold mt-3 mb-1">Stato dei lead con click ID Google</h3>'+(r.byStatus.length?r.byStatus.map(function(c){return '<span class="chip mut">'+esc(c.status)+': '+c.n+'</span>'}).join(''):'<span class="muted">Nessuno nel periodo.</span>');
}
async function saveSpend(){var r=await api('/spend',{method:'POST',body:{month:$('spMonth').value.trim(),amount:Number($('spAmount').value)}});toast(r.success?'Spesa salvata':r.error);if(r.success)loadPerf()}
function renderChk(){var st={};try{st=JSON.parse(localStorage.getItem('adsChk')||'{}')}catch(e){}
  $('chk').innerHTML=CHECK.map(function(t,i){return '<label class="block py-1 text-sm"><input type="checkbox" '+(st[i]?'checked':'')+' onchange="chkSet('+i+',this.checked)"> '+esc(t)+'</label>'}).join('')}
function chkSet(i,v){var st={};try{st=JSON.parse(localStorage.getItem('adsChk')||'{}')}catch(e){}st[i]=v;localStorage.setItem('adsChk',JSON.stringify(st))}
window.onTab=function(id){if(id==='pagine'&&!$('pgList').dataset.ok){$('pgList').dataset.ok=1;loadSitemap()}if(id==='risultati')loadPerf();if(id==='lancio')renderChk()};
(async function init(){
  loadHealth();
  try{var r=await api('/preset');S.regionsAll=r.plan.regions;S.preset=r.plan}catch(e){}
  loadSitemap().then(function(){$('pgList').dataset.ok=1});
  await listPlans();renderPlan();
  if(!S.plan){var s=$('planSel');if(s.options.length>1){s.selectedIndex=1;loadPlan(s.value)}else newFromPreset()}
})();
window.addEventListener('beforeunload',function(e){if(S.dirty){e.preventDefault();e.returnValue=''}});
`

export function renderGoogleAdsStudio(): string {
  return renderShell({
    title: 'Google Ads Studio',
    sub: 'Bozze, controlli e CSV per Google Ads Editor · campagne sempre in pausa',
    accent: '#2563eb', icon: '🎯',
    tabs: [['campagna', 'Campagna'], ['pagine', 'Da blog e pagine'], ['termini', 'Termini di ricerca'], ['gsc', 'Opportunità SEO/Ads'], ['risultati', 'Risultati'], ['lancio', 'Lancio e tracciamento']],
    body: BODY, js: JS,
  })
}
