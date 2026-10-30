// AI Marketing & SEO — audit reale dal sitemap, prontezza GEO/AEO, FAQ con OpenAI.
// Sostituisce i moduli simulati "AI Marketing" e "SEO Tecnico".
import { renderShell } from './marketing-ui'

const BODY = String.raw`
<div class="card" style="border-left:5px solid #7c3aed;background:#faf5ff">
  Tutti i dati qui sono <b>reali</b>: le pagine vengono lette dal sito pubblico e i controlli sono quelli che puoi verificare a mano.
  L'AI (OpenAI) scrive solo bozze di FAQ <b>basate sul testo della pagina</b>: le rivedi tu prima di pubblicare.
</div>

<div data-tab="audit">
  <div class="card">
    <h2 class="font-bold text-lg mb-1">Audit tecnico delle pagine</h2>
    <p class="muted mb-3">Title, description, H1, canonical, noindex, dati strutturati, FAQ, immagini senza testo alternativo, link interni. Le pagine sono lette dalla <code>sitemap.xml</code>, a blocchi di 12.</p>
    <button class="btn btn-p" onclick="runAudit(this)">Avvia audit</button> <span id="auProg" class="muted ml-2"></span>
  </div>
  <div id="auSum"></div>
  <div id="auOut"></div>
</div>

<div data-tab="geo" style="display:none">
  <div class="card">
    <h2 class="font-bold text-lg mb-1">Prontezza per i motori di risposta AI (GEO)</h2>
    <p class="muted mb-3">Verifica i file e le regole che leggono i crawler di ChatGPT, Perplexity, Claude e Google.</p>
    <button class="btn btn-p" onclick="runGeo(this)">Controlla</button>
  </div>
  <div id="geoOut"></div>
</div>

<div data-tab="faq" style="display:none">
  <div class="card">
    <h2 class="font-bold text-lg mb-1">Bozze di FAQ per risposte AI e snippet</h2>
    <p class="muted mb-3">Scegli una pagina: OpenAI propone domande e risposte usando <b>solo</b> il testo della pagina (niente dati inventati) e prepara il JSON-LD <code>FAQPage</code> da incollare. Le risposte con marchio del dispositivo, superlativi, rimborsi o INPS vengono scartate.</p>
    <div class="flex gap-3 items-end flex-wrap"><div style="min-width:320px;flex:1"><label class="l">Pagina</label><select id="faqUrl"></select></div><button class="btn btn-p" onclick="runFaq(this)">Genera bozze</button></div>
  </div>
  <div id="faqOut"></div>
</div>

<div data-tab="gsc" style="display:none">
  <div class="card">
    <h2 class="font-bold text-lg mb-1">Opportunità da Search Console</h2>
    <p class="muted mb-3">Query in posizione 4-20 con impressioni: la pagina esiste ma perde clic. Qui lavori sui contenuti; in «Google Ads Studio» vedi quali conviene anche coprire con un annuncio.</p>
    <button class="btn btn-p" onclick="runGsc(this)">Carica dati (28 giorni)</button>
  </div>
  <div id="gscOut"></div>
</div>
`

const JS = String.raw`
var AU=[];
function lv(i){return i.level==='error'?'bad':i.level==='warn'?'warn':'info'}
async function runAudit(btn){
  busy(btn,true,'Audit in corso…');AU=[];$('auOut').innerHTML='';
  try{var off=0;
    while(off!==null){
      var r=await api('/seo/audit?offset='+off+'&limit=12');
      if(!r.success){toast(r.error||'Errore');break}
      AU=AU.concat(r.pages);$('auProg').textContent=AU.length+' / '+r.total+' pagine';off=r.next;renderAudit();
    }
  }finally{busy(btn,false)}
}
function renderAudit(){
  var e=0,w=0,i=0;AU.forEach(function(p){p.issues.forEach(function(x){if(x.level==='error')e++;else if(x.level==='warn')w++;else i++})});
  $('auSum').innerHTML='<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"><div class="card" style="margin:0"><div class="muted">Pagine</div><div class="text-2xl font-bold">'+AU.length+'</div></div><div class="card" style="margin:0"><div class="muted">Errori</div><div class="text-2xl font-bold" style="color:#b91c1c">'+e+'</div></div><div class="card" style="margin:0"><div class="muted">Avvisi</div><div class="text-2xl font-bold" style="color:#b45309">'+w+'</div></div><div class="card" style="margin:0"><div class="muted">Suggerimenti</div><div class="text-2xl font-bold" style="color:#0369a1">'+i+'</div></div></div>';
  var rows=AU.slice().sort(function(a,b){var s=function(p){return p.issues.filter(function(x){return x.level==='error'}).length*100+p.issues.filter(function(x){return x.level==='warn'}).length};return s(b)-s(a)}).map(function(p){
    var path=p.url.replace('https://www.ecura.it','')||'/';
    return '<tr><td><a class="text-blue-600" target="_blank" href="'+esc(p.url)+'">'+esc(path)+'</a>'+(p.info?'<div class="muted">'+esc(p.info.title||'')+'</div>':'')+'</td><td>'+(p.info?p.info.words:'—')+'</td><td>'+(p.info?esc((p.info.types||[]).join(', ')||'—'):'—')+'</td><td>'+(p.info?p.info.faq:'—')+'</td><td>'+(p.issues.length?p.issues.map(function(x){return '<span class="chip '+lv(x)+'" title="'+esc(x.msg)+'">'+esc(x.msg)+'</span>'}).join('<br>'):'<span class="chip ok">ok</span>')+'</td></tr>'}).join('');
  $('auOut').innerHTML='<div class="card" style="overflow-x:auto"><table class="t"><tr><th>Pagina</th><th>Parole</th><th>Dati strutturati</th><th>FAQ</th><th>Problemi</th></tr>'+rows+'</table></div>';
}
async function runGeo(btn){
  busy(btn,true,'Controllo…');
  try{var r=await api('/seo/geo');if(!r.success){toast('Errore');return}
    var h='<div class="card"><h3 class="font-bold mb-2">File per i crawler</h3>'+r.checks.map(function(c){return '<div class="lint '+(c.ok?'info':'error')+'"><span>'+(c.ok?'✅':'⛔')+'</span><span><b>'+esc(c.label)+'</b> — '+esc(c.detail)+'</span></div>'}).join('')+'</div>';
    h+='<div class="card"><h3 class="font-bold mb-2">Accesso dei crawler AI (robots.txt)</h3><table class="t"><tr><th>Crawler</th><th>Stato</th></tr>'+r.crawlers.map(function(c){return '<tr><td>'+esc(c.bot)+'</td><td><span class="chip '+(c.ok?'ok':'bad')+'">'+esc(c.state)+'</span></td></tr>'}).join('')+'</table><p class="muted mt-2">«Non indicato» significa consentito. Se un crawler risulta bloccato, quel motore non può citare il sito.</p></div>';
    if(r.priceMentions)h+='<div class="card"><div class="lint warn"><span>⚠️</span><span><code>llms-full.txt</code> contiene '+r.priceMentions+' importi in euro: ricordati di aggiornarli a ogni cambio di listino, altrimenti i motori AI citano prezzi vecchi.</span></div></div>';
    h+='<div class="card"><h3 class="font-bold mb-2">Anteprima llms.txt</h3><pre style="white-space:pre-wrap;font-size:12px;background:#f8fafc;padding:10px;border-radius:8px">'+esc(r.llmsPreview||'(vuoto)')+'</pre></div>';
    $('geoOut').innerHTML=h;
  }finally{busy(btn,false)}
}
async function runFaq(btn){
  var url=$('faqUrl').value;if(!url)return;busy(btn,true,'Genero…');
  try{var r=await api('/seo/answers',{method:'POST',body:{url:url}});
    if(!r.success){$('faqOut').innerHTML='<div class="card"><div class="lint warn">'+(r.notConfigured?'OpenAI non è collegato: aggiungi il segreto <code>OPENAI_API_KEY</code> in Cloudflare Pages. ':'')+esc(r.error)+'</div></div>';return}
    var h='<div class="card"><div class="muted mb-2">Modello '+esc(r.model)+' · la pagina ha già '+r.existing+' FAQ strutturate</div><div class="lint warn mb-3"><span>✍️</span><span>'+esc(r.warning)+'</span></div>';
    h+=(r.faqs.length?r.faqs.map(function(f){return '<div class="mb-3"><b>'+esc(f.q)+'</b><div class="text-sm">'+esc(f.a)+'</div></div>'}).join(''):'<div class="muted">Nessuna bozza valida.</div>');
    h+='</div>';
    if(r.faqs.length)h+='<div class="card"><h3 class="font-bold mb-2">JSON-LD FAQPage</h3><textarea id="jl" rows="12" readonly>'+esc(r.jsonld)+'</textarea><button class="btn btn-s mt-2" onclick="navigator.clipboard.writeText($(\'jl\').value);toast(\'Copiato\')">Copia</button></div>';
    $('faqOut').innerHTML=h;
  }finally{busy(btn,false)}
}
function gscTable(title,rows,hint){return '<div class="card"><h3 class="font-bold mb-1">'+title+' ('+rows.length+')</h3><div class="muted mb-2">'+hint+'</div>'+(rows.length?'<table class="t"><tr><th>Query</th><th>Impr.</th><th>Clic</th><th>Pos.</th></tr>'+rows.map(function(r){return '<tr><td>'+esc(r.key)+'</td><td>'+r.impressions+'</td><td>'+r.clicks+'</td><td>'+r.position+'</td></tr>'}).join('')+'</table>':'<div class="muted">Nessuna.</div>')+'</div>'}
async function runGsc(btn){
  busy(btn,true,'Carico…');
  try{var r=await api('/gsc');
    if(!r.success){$('gscOut').innerHTML='<div class="card"><div class="lint warn">'+(r.notConfigured?'Search Console non è ancora collegata al CRM. ':'')+esc(r.error)+'</div></div>';return}
    $('gscOut').innerHTML='<div class="card muted">Periodo '+r.range.start+' → '+r.range.end+' · '+r.total+' query</div>'+gscTable('Perdi clic (pos. 4-20)',r.ads,'Migliora title, description e contenuto della pagina che già si posiziona.')+gscTable('Oltre pos. 20',r.seo,'Serve un contenuto nuovo o molto più completo.');
  }finally{busy(btn,false)}
}
(async function(){
  loadHealth();
  try{var r=await api('/sitemap');if(r.success)$('faqUrl').innerHTML=r.urls.map(function(u){return '<option value="'+esc(u.url)+'">'+esc(u.url.replace('https://www.ecura.it','')||'/')+'</option>'}).join('')}catch(e){}
})();
`

export function renderSeoGeoStudio(): string {
  return renderShell({
    title: 'AI Marketing & SEO',
    sub: 'Audit reale del sito, prontezza GEO e bozze FAQ con OpenAI',
    accent: '#7c3aed', icon: '🔎',
    tabs: [['audit', 'Audit tecnico'], ['geo', 'Prontezza GEO'], ['faq', 'FAQ con AI'], ['gsc', 'Search Console']],
    body: BODY, js: JS,
  })
}
