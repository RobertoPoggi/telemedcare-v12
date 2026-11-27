/**
 * claim-dm-admin.ts — pagina admin "Claim DM" (FASE 2, lato CRM).
 * HTML server-side, nessun framework: la pagina parla con /api/claim-dm/* via fetch.
 * Lo stato iniziale e i log sono iniettati come JSON (nessun testo di blocco in pagina).
 */

const BLOCCHI = ['EC-01','EC-02','EC-03','EC-04','EC-05','EC-06','EC-07','EC-08','EC-09','EC-10','EC-11','EC-12']
const STATI = ['ORIGINALE','TRANSITORIA','AUTORIZZATA']

function opzioni(selezionato: string | null, includiEredita: boolean): string {
  const base = includiEredita ? ['<option value="">(eredita lo stato globale)</option>'] : []
  const voci = STATI.map(s => {
    const sel = selezionato === s ? ' selected' : ''
    return '<option value="' + s + '"' + sel + '>' + s + '</option>'
  })
  return base.concat(voci).join('')
}

function righeBlocchi(blocchi: Record<string, string | null>): string {
  return BLOCCHI.map(b => {
    const v = blocchi && blocchi[b] ? blocchi[b] : ''
    const etichetta = v ? '<span class="text-amber-700 font-semibold">' + v + '</span>' : '<span class="text-gray-400">globale</span>'
    return '<tr class="border-b border-gray-100">' +
      '<td class="py-2 px-3 font-mono text-sm">' + b + '</td>' +
      '<td class="py-2 px-3 text-sm">' + etichetta + '</td>' +
      '<td class="py-2 px-3"><select data-block="' + b + '" class="border border-gray-300 rounded px-2 py-1 text-sm w-full">' +
      opzioni(v || null, true) + '</select></td>' +
      '</tr>'
  }).join('')
}

function righeLog(log: any[]): string {
  if (!log || !log.length) return '<tr><td colspan="6" class="py-3 px-3 text-sm text-gray-500">Nessuna chiamata registrata.</td></tr>'
  return log.map(r => {
    const esito = r.esito === 'ok'
      ? '<span class="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">ok</span>'
      : '<span class="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">errore</span>'
    const dettaglio = r.dettaglio ? String(r.dettaglio).replace(/[<>&]/g, '') : ''
    return '<tr class="border-b border-gray-100">' +
      '<td class="py-2 px-3 text-xs text-gray-500">' + (r.created_at || '') + '</td>' +
      '<td class="py-2 px-3 text-sm font-mono">' + (r.chiamata || '') + '</td>' +
      '<td class="py-2 px-3">' + esito + '</td>' +
      '<td class="py-2 px-3 text-sm text-right">' + (r.http_status === null || r.http_status === undefined ? '-' : r.http_status) + '</td>' +
      '<td class="py-2 px-3 text-sm text-right">' + (r.durata_ms === null || r.durata_ms === undefined ? '-' : r.durata_ms + ' ms') + '</td>' +
      '<td class="py-2 px-3 text-xs text-gray-500 truncate max-w-xs" title="' + dettaglio.replace(/"/g, '') + '">' + dettaglio.slice(0, 120) + '</td>' +
      '</tr>'
  }).join('')
}

export function renderClaimDmPage(stato: any, log: any[]): string {
  const g = stato && stato.stato_globale ? stato.stato_globale : 'ORIGINALE'
  const blocchi = (stato && stato.blocchi) || {}
  const updated = stato && stato.updated_at ? stato.updated_at : 'mai'
  const updatedBy = stato && stato.updated_by ? stato.updated_by : '-'
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TeleMedCare V12 — Claim DM</title>
<script src="https://cdn.tailwindcss.com"></script>
<link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50">
<div class="min-h-screen">
  <header class="bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-lg">
    <div class="container mx-auto px-6 py-4 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <i class="fas fa-scale-balanced text-3xl"></i>
        <div>
          <h1 class="text-2xl font-bold">Claim DM</h1>
          <p class="text-sm text-slate-300">Stato del meccanismo claim pubblicitari — art. 26 D.Lgs. 137/2022</p>
        </div>
      </div>
      <div class="space-x-2">
        <a href="/dashboard" class="px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors text-sm"><i class="fas fa-home mr-2"></i>Dashboard</a>
      </div>
    </div>
  </header>

  <div class="container mx-auto px-6 py-8 space-y-6">

    <div class="bg-white rounded-xl shadow p-6">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-lg font-bold text-gray-800">Stato globale del meccanismo</h2>
          <p class="text-sm text-gray-500 mt-1">ORIGINALE pubblica i contenuti statici dei template (comportamento attuale). TRANSITORIA e AUTORIZZATA attivano i testi gestiti in D1 sulla landing.</p>
          <p class="text-sm text-gray-500 mt-2">ORIGINALE: al primo giro (o se i template cambiano) la sincronizzazione porta in D1 il contenuto reale del sito ('vince il sito'); da lì in poi il sito pubblicato segue D1: se D1 non cambia, il sito non cambia.</p>
        </div>
        <div class="text-right text-xs text-gray-500">
          <div>ultimo salvataggio: <span class="font-mono">${updated}</span></div>
          <div>da: <span class="font-mono">${updatedBy}</span></div>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-4 mt-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Stato globale</label>
          <select id="stato-globale" class="border border-gray-300 rounded-lg px-3 py-2 w-full">
            ${STATI.map(s => '<option value="' + s + '"' + (g === s ? ' selected' : '') + '>' + s + '</option>').join('')}
          </select>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Motivo della modifica (opzionale)</label>
          <input id="motivo" type="text" maxlength="500" placeholder="es. autorizzazione ricevuta, provv. n. ..." class="border border-gray-300 rounded-lg px-3 py-2 w-full">
        </div>
      </div>

      <div class="mt-5 flex flex-wrap gap-3">
        <button id="salva" class="px-5 py-2.5 bg-slate-800 text-white rounded-lg hover:bg-slate-900 font-semibold"><i class="fas fa-floppy-disk mr-2"></i>Salva e sincronizza la landing</button>
        <button id="purga" class="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-semibold"><i class="fas fa-broom mr-2"></i>Invalida cache landing</button>
        <span id="esito" class="self-center text-sm text-gray-600"></span>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow p-6">
      <h2 class="text-lg font-bold text-gray-800">Scostamenti per blocco</h2>
      <p class="text-sm text-gray-500 mt-1 mb-4">Vuoto = il blocco segue lo stato globale. Un valore esplicito lo sovrascrive solo per quel blocco.</p>
      <table class="w-full">
        <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr><th class="py-2 px-3">Blocco</th><th class="py-2 px-3">Stato attuale</th><th class="py-2 px-3">Scostamento</th></tr>
        </thead>
        <tbody id="corpo-blocchi">${righeBlocchi(blocchi)}</tbody>
      </table>
    </div>

    <div class="bg-white rounded-xl shadow p-6">
      <h2 class="text-lg font-bold text-gray-800 mb-1">Ultime sincronizzazioni</h2>
      <p class="text-sm text-gray-500 mb-4">Chiamate CRM → landing (sync, purge) e job di riconciliazione.</p>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr><th class="py-2 px-3">Quando</th><th class="py-2 px-3">Chiamata</th><th class="py-2 px-3">Esito</th><th class="py-2 px-3 text-right">HTTP</th><th class="py-2 px-3 text-right">Durata</th><th class="py-2 px-3">Dettaglio</th></tr>
          </thead>
          <tbody id="corpo-log">${righeLog(log)}</tbody>
        </table>
      </div>
    </div>

    <p class="text-xs text-gray-400">I testi dei blocchi non sono visibili in questa pagina: vivono solo in D1 sulla landing e si modificano da /admin/dashboard della landing.</p>
  </div>
</div>

<script>
const STATO_INIZIALE = ${JSON.stringify({ stato_globale: g, blocchi })};
const esitoEl = document.getElementById('esito');
function mostra(msg, errore) {
  esitoEl.textContent = msg;
  esitoEl.className = 'self-center text-sm ' + (errore ? 'text-red-600' : 'text-green-700');
}
function raccogliPayload() {
  const blocchi = {};
  document.querySelectorAll('select[data-block]').forEach(function (sel) {
    const v = sel.value;
    blocchi[sel.getAttribute('data-block')] = v === '' ? null : v;
  });
  return {
    stato_globale: document.getElementById('stato-globale').value,
    blocchi: blocchi,
    motivo: document.getElementById('motivo').value || null
  };
}
document.getElementById('salva').addEventListener('click', async function () {
  const btn = this; btn.disabled = true; mostra('Salvataggio e sincronizzazione in corso...', false);
  try {
    const r = await fetch('/api/claim-dm/stato', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(raccogliPayload()) });
    const d = await r.json();
    if (!r.ok || !d.success) { mostra('Errore: ' + (d.error || r.status), true); }
    else {
      const syncOk = d.sync && d.sync.risultati ? d.sync.risultati.filter(function (x) { return x.ok; }).length : 0;
      const tot = d.sync && d.sync.risultati ? d.sync.risultati.length : 0;
      const purgeOk = d.sync && d.sync.purge && d.sync.purge.ok ? 'ok' : 'errore';
      const stato = d.sync && d.sync.ok ? 'sincronizzata' : 'CON ERRORI';
      const c = d.sync && d.sync.cattura;
      let cat = '';
      if (c && c.eseguita) {
        cat = c.blocchi && c.blocchi.length
          ? ' Cattura ORIGINALE: ' + c.blocchi.map(function (b) { return b.block_id + ' ' + b.esito + (b.esito === 'aggiornato' ? ' (' + b.byte_prima + '→' + b.byte_dopo + ' byte)' : ''); }).join(', ') + '.'
          : ' Cattura ORIGINALE NON riuscita' + (c.errore ? ' (' + c.errore + ')' : '') + '.';
      }
      const salt = d.sync && d.sync.saltati && d.sync.saltati.length ? ' Non pubblicati come ORIGINALE (cattura fallita): ' + d.sync.saltati.join(', ') + '.' : '';
      mostra('Salvato. Landing ' + stato + ' — blocchi sincronizzati ' + syncOk + '/' + tot + ', purge ' + purgeOk + '.' + cat + salt, !(d.sync && d.sync.ok));
      setTimeout(function () { location.reload(); }, c && c.eseguita ? 12000 : 2500);
    }
  } catch (e) { mostra('Errore di rete: ' + e.message, true); }
  btn.disabled = false;
});
document.getElementById('purga').addEventListener('click', async function () {
  const btn = this; btn.disabled = true; mostra('Invalidazione cache in corso...', false);
  try {
    const r = await fetch('/api/claim-dm/purge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const d = await r.json();
    mostra(d.success && d.purge && d.purge.ok ? 'Cache landing invalidata.' : 'Purge non riuscito: ' + JSON.stringify(d.purge || d.error), !(d.success && d.purge && d.purge.ok));
  } catch (e) { mostra('Errore di rete: ' + e.message, true); }
  btn.disabled = false;
});
</script>
</body>
</html>`
}

export const CLAIM_DM_BLOCCHI = BLOCCHI
export const CLAIM_DM_STATI = STATI
