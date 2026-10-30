// Guscio comune delle pagine Marketing Hub (stile + funzioni client condivise).
// Il codice client usa solo concatenazione di stringhe: niente backtick né ${...}.

export const COMMON_CSS = String.raw`
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#f1f5f9;color:#0f172a}
  .card{background:#fff;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:20px;margin-bottom:18px}
  .tab{padding:9px 16px;border-radius:9px;font-weight:600;font-size:14px;background:#e2e8f0;color:#334155;white-space:nowrap}
  .tab.on{background:var(--accent);color:#fff}
  .btn{padding:8px 14px;border-radius:9px;font-weight:600;font-size:13px;border:1px solid transparent;cursor:pointer}
  .btn:disabled{opacity:.5;cursor:not-allowed}
  .btn-p{background:var(--accent);color:#fff}.btn-s{background:#fff;border-color:#cbd5e1;color:#334155}
  .btn-g{background:#16a34a;color:#fff}.btn-r{background:#fff;border-color:#fca5a5;color:#b91c1c}
  input[type=text],input[type=number],textarea,select{width:100%;border:1px solid #cbd5e1;border-radius:8px;padding:7px 10px;font-size:13px;font-family:inherit;background:#fff}
  textarea{font-family:ui-monospace,Menlo,Consolas,monospace;line-height:1.5}
  label.l{display:block;font-size:12px;font-weight:700;color:#475569;margin-bottom:4px}
  .chip{display:inline-block;padding:1px 7px;border-radius:999px;font-size:11px;font-weight:700;margin:1px}
  .ok{background:#dcfce7;color:#15803d}.warn{background:#fef3c7;color:#92400e}.bad{background:#fee2e2;color:#b91c1c}.info{background:#e0f2fe;color:#075985}.mut{background:#e2e8f0;color:#475569}
  table.t{width:100%;border-collapse:collapse;font-size:13px}
  table.t th{text-align:left;background:#f8fafc;padding:7px 9px;font-size:11px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0}
  table.t td{padding:7px 9px;border-bottom:1px solid #f1f5f9;vertical-align:top}
  .lint{display:flex;gap:8px;padding:7px 10px;border-radius:8px;margin-bottom:5px;font-size:13px}
  .lint.error{background:#fef2f2;border-left:4px solid #dc2626}.lint.warn{background:#fffbeb;border-left:4px solid #f59e0b}.lint.info{background:#f0f9ff;border-left:4px solid #0ea5e9}
  .muted{color:#64748b;font-size:12px}
  .toast{position:fixed;right:18px;bottom:18px;background:#0f172a;color:#fff;padding:10px 16px;border-radius:10px;font-size:13px;z-index:50;max-width:420px;display:none}
  .spin{display:inline-block;width:14px;height:14px;border:2px solid #cbd5e1;border-top-color:var(--accent);border-radius:50%;animation:sp .7s linear infinite;vertical-align:-2px}
  @keyframes sp{to{transform:rotate(360deg)}}
`

export const COMMON_JS = String.raw`
function $(id){return document.getElementById(id)}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(m,ms){var t=$('toast');t.textContent=m;t.style.display='block';clearTimeout(window.__tt);window.__tt=setTimeout(function(){t.style.display='none'},ms||3500)}
async function api(path,opts){
  var o=Object.assign({credentials:'same-origin',headers:{'Content-Type':'application/json'}},opts||{});
  if(o.body&&typeof o.body!=='string')o.body=JSON.stringify(o.body);
  var r=await fetch('/api/marketing'+path,o);
  if(r.status===401){location.href='/login';throw new Error('Sessione scaduta')}
  var ct=r.headers.get('content-type')||'';var d=ct.indexOf('json')>=0?await r.json():await r.text();
  if(typeof d==='object'&&d)d.__status=r.status;
  return d;
}
function lintHtml(issues){
  if(!issues||!issues.length)return '<div class="lint info">Nessun problema rilevato.</div>';
  var order={error:0,warn:1,info:2};
  return issues.slice().sort(function(a,b){return order[a.level]-order[b.level]}).map(function(i){
    var ic=i.level==='error'?'⛔':i.level==='warn'?'⚠️':'ℹ️';
    return '<div class="lint '+i.level+'"><span>'+ic+'</span><span><b>'+esc(i.where)+'</b> — '+esc(i.msg)+'</span></div>';
  }).join('');
}
function showTab(id){
  document.querySelectorAll('[data-tab]').forEach(function(e){e.style.display=e.getAttribute('data-tab')===id?'block':'none'});
  document.querySelectorAll('.tab').forEach(function(b){b.classList.toggle('on',b.getAttribute('data-go')===id)});
  if(window.onTab)window.onTab(id);
}
function busy(btn,on,label){if(!btn)return;if(on){btn.dataset.l=btn.innerHTML;btn.disabled=true;btn.innerHTML='<span class="spin"></span> '+(label||'')}else{btn.disabled=false;btn.innerHTML=btn.dataset.l||btn.innerHTML}}
function eur(n){return Number(n).toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
async function loadHealth(){
  try{var h=await api('/health');
    $('health').innerHTML=
      '<span class="chip '+(h.openai.configured?'ok':'warn')+'" title="'+(h.openai.configured?'Modello '+esc(h.openai.model):'Manca OPENAI_API_KEY: si usa il modello base')+'">OpenAI '+(h.openai.configured?'collegato':'non configurato')+'</span>'+
      '<span class="chip '+(h.searchConsole.configured?'ok':'warn')+'">Search Console '+(h.searchConsole.configured?'collegata':'non collegata')+'</span>';
    return h;
  }catch(e){}
}
`

export function renderShell(o: { title: string; sub: string; accent: string; icon: string; tabs: Array<[string, string]>; body: string; js: string }): string {
  const tabs = o.tabs.map((t, i) => '<button class="tab' + (i === 0 ? ' on' : '') + '" data-go="' + t[0] + '" onclick="showTab(\'' + t[0] + '\')">' + t[1] + '</button>').join('')
  return '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + o.title + ' — TeleMedCare</title><meta name="robots" content="noindex,nofollow">' +
    '<script src="https://cdn.tailwindcss.com"></script>' +
    '<style>:root{--accent:' + o.accent + '}' + COMMON_CSS + '</style></head><body>' +
    '<div style="background:var(--accent)" class="text-white px-6 py-4 shadow"><div class="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">' +
    '<div class="flex items-center gap-3"><a href="/" class="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg text-sm">← Home / Marketing Hub</a>' +
    '<div><h1 class="text-xl font-bold">' + o.icon + ' ' + o.title + '</h1><p class="text-white/80 text-sm">' + o.sub + '</p></div></div>' +
    '<div id="health" class="text-sm"></div></div></div>' +
    '<div class="max-w-7xl mx-auto px-4 md:px-6 mt-5"><div class="flex gap-2 overflow-x-auto pb-3">' + tabs + '</div>' + o.body + '</div>' +
    '<div id="toast" class="toast"></div><script>' + COMMON_JS + o.js + '</script></body></html>'
}
