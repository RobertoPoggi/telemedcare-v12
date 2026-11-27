/**
 * STRIPE-CARTA.TS
 * Unico punto che decide se il pagamento con carta e' disponibile. Lo usano sia la pagina
 * (GET /api/stripe-public-key) sia il server (creazione del Payment Intent), cosi' la pagina
 * non puo' mostrare un form che il server poi rifiuta, e viceversa.
 *
 * Regole:
 *  - serve STRIPE_SECRET_KEY e la chiave pubblica (STRIPE_PUBLISHABLE_KEY oppure STRIPE_PUBLIC_KEY);
 *  - chiave segreta e pubblica devono essere della stessa modalita' (test/live);
 *  - modalita' TEST: la carta parte da sola (non muove denaro vero);
 *  - modalita' LIVE: serve in piu' STRIPE_CARTA_LIVE_ATTIVA=1. E' l'interruttore con cui il titolare
 *    apre la carta ai clienti DOPO il pagamento reale a importo pieno con rimborso.
 *
 * Il motivo del rifiuto serve ai log del server: alla pagina pubblica non si espongono nomi di variabili.
 */
export interface StatoCarta {
  abilitata: boolean
  modalita?: 'test' | 'live'
  publishableKey?: string
  motivo?: string
}

const RE_SEGRETA = /^(sk|rk)_(test|live)_/
const RE_PUBBLICA = /^pk_(test|live)_/

function flagAttivo(v: unknown): boolean {
  return ['1', 'true', 'si', 'sì', 'yes', 'on'].includes(String(v ?? '').trim().toLowerCase())
}

export function statoCartaStripe(env: any, hostname = ''): StatoCarta {
  const segreta = String(env?.STRIPE_SECRET_KEY || '').trim()
  if (!segreta) return { abilitata: false, motivo: 'STRIPE_SECRET_KEY mancante' }
  const ms = RE_SEGRETA.exec(segreta)
  if (!ms) return { abilitata: false, motivo: 'STRIPE_SECRET_KEY non riconosciuta (atteso sk_/rk_ test o live)' }
  const modalita = ms[2] as 'test' | 'live'

  let pubblica = String(env?.STRIPE_PUBLISHABLE_KEY || env?.STRIPE_PUBLIC_KEY || '').trim()
  // Anteprime (preview): se per errore c'e' la pubblica live ma esiste la pubblica di test, si usa quella di test.
  const isPreview = hostname.includes('test-environment') || hostname.includes('preview')
  if (isPreview && pubblica.startsWith('pk_live') && env?.STRIPE_TEST_PUBLIC_KEY) {
    pubblica = String(env.STRIPE_TEST_PUBLIC_KEY).trim()
  }
  if (!pubblica) return { abilitata: false, modalita, motivo: 'chiave pubblica mancante (STRIPE_PUBLISHABLE_KEY o STRIPE_PUBLIC_KEY)' }
  const mp = RE_PUBBLICA.exec(pubblica)
  if (!mp) return { abilitata: false, modalita, motivo: 'chiave pubblica non riconosciuta (atteso pk_test_ o pk_live_)' }
  if (mp[1] !== modalita) {
    return { abilitata: false, modalita, motivo: `chiavi incoerenti: segreta ${modalita}, pubblica ${mp[1]}` }
  }

  if (modalita === 'live' && !flagAttivo(env?.STRIPE_CARTA_LIVE_ATTIVA)) {
    return { abilitata: false, modalita, motivo: 'modalita live non ancora attivata (STRIPE_CARTA_LIVE_ATTIVA)' }
  }
  return { abilitata: true, modalita, publishableKey: pubblica }
}

/**
 * Totale della proforma IVA INCLUSA, calcolato come lo mostra GET /api/proforma/:id (e quindi la pagina):
 * `proforma.prezzo_totale` e' IVA ESCLUSA; aliquota 0% se esente, 4% se agevolata, altrimenti 22%.
 * I flag della proforma hanno la precedenza, poi quelli del lead. Il Payment Intent deve addebitare
 * ESATTAMENTE questo importo, altrimenti il cliente paga una cifra diversa da quella che vede.
 */
export function totaleProformaIvaInclusa(proforma: any, lead?: any): number {
  const base = parseFloat(String(proforma?.prezzo_totale ?? '0')) || 0
  const esente = proforma?.iva_esente || lead?.iva_esente || 0
  const agevolata = proforma?.iva_agevolata || lead?.iva_agevolata || 0
  const aliquota = esente ? 0 : agevolata ? 0.04 : 0.22
  const iva = Math.round(base * aliquota * 100) / 100
  return Math.round((base + iva) * 100) / 100
}
