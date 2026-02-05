# 🔧 FIX WORKFLOW END-TO-END - 4 PROBLEMI CRITICI

**Data:** 2026-02-05  
**Test eseguito:** Lead Roberto Poggi (BASE) da eCura.it → Import IRBEMA  
**Repository:** https://github.com/RobertoPoggi/telemedcare-v12

---

## 🎯 PROBLEMI IDENTIFICATI

### ❌ PROBLEMA 1: Email completamento dati NON inviata
**Sintomo:** Dopo email notifica a info@, il workflow si ferma  
**Atteso:** Email a rpoggi55@gmail.com con link form completamento dati  
**Riscontrato:** Nessuna email inviata al lead

**Causa ROOT:** Il workflow `processNewLead()` NON chiama l'invio della email di completamento dati dopo la notifica a info@.

**File coinvolti:**
- `src/modules/complete-workflow-orchestrator.ts:40-130` (processNewLead)
- `src/modules/workflow-email-manager.ts` (manca chiamata a `inviaEmailCompleamentoDati`)

---

### ❌ PROBLEMA 2: Prezzi NON salvati nel database
**Sintomo:** Colonna "Prezzo Anno" vuota nella tabella leads  
**Atteso:** Prezzi calcolati da `ecura-pricing.ts` e salvati nel DB  
**Riscontrato:** Campo `prezzo_anno` NULL nel database

**Causa ROOT 1:** L'INSERT dei lead NON include il campo `prezzo_anno`

**File coinvolti:**
- `src/index.tsx:3751-3787` (INSERT INTO leads) ← **NON include prezzo_anno**
- `src/modules/ecura-pricing.ts:238-251` (getPricing, calculatePrimoAnno) ← **NON usato**

**Causa ROOT 2:** Il calcolo prezzi NON viene eseguito prima dell'INSERT

**Logica attesa:**
```typescript
import { getPricing, calculatePrimoAnno } from './modules/ecura-pricing'

// Determina servizio e piano
const servizioMap = {
  'eCura BASE': { servizio: 'PRO', piano: 'BASE' },
  'eCura FAMILY': { servizio: 'FAMILY', piano: 'BASE' },
  'eCura PREMIUM': { servizio: 'PREMIUM', piano: 'BASE' },
  'eCura AVANZATO': { servizio: 'PRO', piano: 'AVANZATO' },
  'eCura FAMILY AVANZATO': { servizio: 'FAMILY', piano: 'AVANZATO' },
  'eCura PREMIUM AVANZATO': { servizio: 'PREMIUM', piano: 'AVANZATO' }
}

const { servizio, piano } = servizioMap[normalizedLead.pacchetto] || { servizio: 'PRO', piano: 'BASE' }
const prezzoAnno = calculatePrimoAnno(servizio, piano) // Es: 480 per PRO BASE
```

**Fix richiesto:**
1. Aggiungere `prezzo_anno` al campo INSERT
2. Calcolare prezzo prima dell'INSERT usando `ecura-pricing.ts`
3. Bind del valore calcolato

---

### ❌ PROBLEMA 3: Link dashboard ERRATO nelle email
**Sintomo:** Link "Visualizza nella Dashboard" punta a branch sbagliato  
**Atteso:** `https://telemedcare-v12.pages.dev/admin/leads-dashboard`  
**Riscontrato:** `https://genspark-ai-developer.telemedcare-v12.pages.dev/dashboard`

**Causa ROOT:** Hardcoded URLs con branch `genspark-ai-developer` invece di production

**File coinvolti:**
- `src/index.tsx:3654` → `const baseUrl = c.env?.PUBLIC_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'`
- `src/index.tsx:3656` → `<a href="https://genspark-ai-developer.telemedcare-v12.pages.dev/leads">Visualizza nella Dashboard</a>`
- `src/modules/lead-completion.ts:XX` → `const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'`
- `src/modules/template-loader-clean.ts:XX` (2 occorrenze)
- `src/modules/workflow-email-manager.ts:XX` (3 occorrenze)
- `src/utils/lead-notifications.ts:XX` → `<a href="https://genspark-ai-developer.telemedcare-v12.pages.dev/dashboard">`

**Fix richiesto:**
```typescript
// PRIMA (ERRATO):
const baseUrl = c.env?.PUBLIC_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'

// DOPO (CORRETTO):
const baseUrl = c.env?.PUBLIC_URL || c.env?.PAGES_URL || 'https://telemedcare-v12.pages.dev'
```

**Inoltre:** Path dashboard corretto = `/admin/leads-dashboard` (NON `/dashboard` o `/leads`)

---

### ❌ PROBLEMA 4: Switch "Email completamento dati" NON usato
**Sintomo:** Switch attivato in dashboard ma email non inviata  
**Atteso:** Rispetto dello switch `email_completamento_dati`  
**Riscontrato:** Switch ignorato nel workflow

**Causa ROOT:** Il workflow `processNewLead()` NON legge le settings dalla dashboard per decidere se inviare l'email di completamento dati.

**Settings attese (da dashboard):**
```typescript
interface DashboardSettings {
  email_notifica_info: boolean      // ✅ Funziona
  email_completamento_dati: boolean // ❌ NON usato
  email_reminder_firma: boolean     // ❌ OFF (da accendere dopo fix)
  email_promemoria_pagamento: boolean // ❌ OFF
}
```

**Fix richiesto:**
1. Leggere settings da DB prima di processare lead
2. Condizionare invio email completamento dati allo switch
3. Log dello stato switch per debug

---

## 🔧 PIANO DI FIX

### FIX 1: Email completamento dati

**File:** `src/modules/complete-workflow-orchestrator.ts`

**Modifica STEP 1 (processNewLead):**
```typescript
// Dopo notifica a info@, leggi settings
const settings = await getWorkflowSettings(ctx.db)

// Se switch attivo, invia email completamento dati
if (settings.email_completamento_dati) {
  console.log(`📧 [ORCHESTRATOR] Invio email completamento dati a ${ctx.leadData.emailRichiedente}`)
  
  const completamentoResult = await WorkflowEmailManager.inviaEmailCompletamentoDati(
    ctx.leadData,
    ctx.env,
    ctx.db
  )
  
  if (!completamentoResult.success) {
    result.errors.push(...completamentoResult.errors)
  }
} else {
  console.log(`⏭️ [ORCHESTRATOR] Email completamento dati disabilitata (switch OFF)`)
}
```

**Inoltre, creare funzione:**
```typescript
/**
 * Legge settings workflow dalla dashboard
 */
async function getWorkflowSettings(db: D1Database): Promise<DashboardSettings> {
  try {
    const result = await db.prepare(`
      SELECT * FROM settings WHERE key = 'workflow_emails'
    `).first()
    
    if (result?.value) {
      return JSON.parse(result.value)
    }
  } catch (error) {
    console.error('Errore lettura settings:', error)
  }
  
  // Default: tutti attivi
  return {
    email_notifica_info: true,
    email_completamento_dati: true,
    email_reminder_firma: true,
    email_promemoria_pagamento: true
  }
}
```

---

### FIX 2: Calcolo e salvataggio prezzi

**File:** `src/index.tsx`

**Prima dell'INSERT (linea 3750):**
```typescript
// Importa funzioni pricing
import { getPricing, calculatePrimoAnno } from './modules/ecura-pricing'

// Determina servizio e piano dal pacchetto
function parseServizioEPiano(pacchetto: string): { servizio: 'FAMILY' | 'PRO' | 'PREMIUM', piano: 'BASE' | 'AVANZATO' } {
  const pacchettoLower = pacchetto.toLowerCase()
  
  // Determina piano
  const piano = pacchettoLower.includes('avanzat') ? 'AVANZATO' : 'BASE'
  
  // Determina servizio
  let servizio: 'FAMILY' | 'PRO' | 'PREMIUM' = 'PRO'
  if (pacchettoLower.includes('family')) servizio = 'FAMILY'
  else if (pacchettoLower.includes('premium')) servizio = 'PREMIUM'
  
  return { servizio, piano }
}

// Calcola prezzo
const { servizio, piano } = parseServizioEPiano(normalizedLead.pacchetto)
const prezzoAnno = calculatePrimoAnno(servizio, piano)
const prezzoDettagli = getPricing(servizio, piano)

console.log(`💰 [PRICING] ${normalizedLead.pacchetto} → ${servizio} ${piano} = €${prezzoAnno}`)
```

**Modifica INSERT (linea 3751-3758):**
```typescript
INSERT INTO leads (
  id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
  nomeAssistito, cognomeAssistito, dataNascitaAssistito, etaAssistito, parentelaAssistito,
  pacchetto, condizioniSalute, preferenzaContatto,
  vuoleContratto, intestazioneContratto, cfRichiedente, indirizzoRichiedente,
  cfAssistito, indirizzoAssistito, vuoleBrochure, vuoleManuale,
  note, gdprConsent, timestamp, fonte, versione, status,
  prezzo_anno, prezzo_rinnovo  -- ← AGGIUNTI
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                                                                  -- ↑ 2 placeholder aggiunti
```

**Modifica BIND (linea 3759-3787):**
```typescript
).bind(
  normalizedLead.id,
  normalizedLead.nomeRichiedente,
  // ... (tutti i campi esistenti) ...
  normalizedLead.status,
  prezzoAnno,                    // ← AGGIUNTO
  prezzoDettagli?.rinnovoTotale || 0  // ← AGGIUNTO
).run()
```

---

### FIX 3: URL dashboard corretti

**File da modificare (9 occorrenze):**

1. **src/index.tsx** (linea ~3654):
```typescript
// PRIMA:
const baseUrl = c.env?.PUBLIC_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'

// DOPO:
const baseUrl = c.env?.PUBLIC_URL || c.env?.PAGES_URL || 'https://telemedcare-v12.pages.dev'
```

2. **src/index.tsx** (linea ~3656):
```typescript
// PRIMA:
<a href="https://genspark-ai-developer.telemedcare-v12.pages.dev/leads">Visualizza nella Dashboard</a>

// DOPO:
<a href="${baseUrl}/admin/leads-dashboard">Visualizza nella Dashboard</a>
```

3. **src/utils/lead-notifications.ts**:
```typescript
// PRIMA:
<a href="https://genspark-ai-developer.telemedcare-v12.pages.dev/dashboard" ...>

// DOPO:
<a href="${env.PUBLIC_URL || env.PAGES_URL || 'https://telemedcare-v12.pages.dev'}/admin/leads-dashboard" ...>
```

4. **src/modules/lead-completion.ts**:
```typescript
// PRIMA:
const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'

// DOPO:
const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://telemedcare-v12.pages.dev'
```

5. **src/modules/template-loader-clean.ts** (2 occorrenze):
```typescript
// PRIMA:
const baseUrl = env?.PUBLIC_URL || env?.PAGES_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'

// DOPO:
const baseUrl = env?.PUBLIC_URL || env?.PAGES_URL || 'https://telemedcare-v12.pages.dev'
```

6. **src/modules/workflow-email-manager.ts** (3 occorrenze):
```typescript
// PRIMA:
const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://genspark-ai-developer.telemedcare-v12.pages.dev'

// DOPO:
const baseUrl = env.PUBLIC_URL || env.PAGES_URL || 'https://telemedcare-v12.pages.dev'
```

**Comando di ricerca/sostituzione batch:**
```bash
cd /home/user/webapp
find src/ -name "*.ts" -o -name "*.tsx" | xargs sed -i 's|genspark-ai-developer\.telemedcare-v12\.pages\.dev|telemedcare-v12.pages.dev|g'
```

---

### FIX 4: Rispetto switch dashboard

**File:** `src/modules/complete-workflow-orchestrator.ts`

**Aggiungere check switch prima di ogni invio email:**
```typescript
// Nel processNewLead(), dopo notifica info@
const settings = await getWorkflowSettings(ctx.db)

// Email completamento dati (condizionata)
if (settings.email_completamento_dati) {
  await WorkflowEmailManager.inviaEmailCompletamentoDati(...)
}

// Nel processContractSignature(), prima di reminder
if (settings.email_reminder_firma) {
  await WorkflowEmailManager.inviaEmailReminderFirma(...)
}

// Nel processProforma(), prima di promemoria
if (settings.email_promemoria_pagamento) {
  await WorkflowEmailManager.inviaEmailPromemoriaPagamento(...)
}
```

---

## ✅ CHECKLIST APPLICAZIONE FIX

- [ ] **FIX 1:** Email completamento dati
  - [ ] Aggiungere chiamata `inviaEmailCompletamentoDati()` in `processNewLead()`
  - [ ] Creare funzione `getWorkflowSettings()` per leggere switch
  - [ ] Testare con switch ON e OFF

- [ ] **FIX 2:** Calcolo e salvataggio prezzi
  - [ ] Aggiungere import `ecura-pricing.ts`
  - [ ] Creare funzione `parseServizioEPiano()`
  - [ ] Calcolare prezzi prima dell'INSERT
  - [ ] Aggiungere campi `prezzo_anno`, `prezzo_rinnovo` all'INSERT
  - [ ] Bind valori calcolati
  - [ ] Verificare prezzi salvati nel DB

- [ ] **FIX 3:** URL dashboard corretti
  - [ ] Replace batch `genspark-ai-developer` → `` (9 occorrenze)
  - [ ] Verificare path `/admin/leads-dashboard` nei link
  - [ ] Testare link email in produzione

- [ ] **FIX 4:** Rispetto switch dashboard
  - [ ] Condizionare tutti gli invii email agli switch
  - [ ] Aggiungere log stato switch per debug
  - [ ] Testare workflow con switch ON/OFF

---

## 🧪 TEST POST-FIX

### Test Case 1: Lead BASE con switch ON
1. Attivare tutti gli switch in dashboard
2. Inserire nuovo lead Roberto Poggi (BASE) da eCura.it
3. Importare via IRBEMA
4. **Verificare:**
   - ✅ Email notifica a info@telemedcare.it ricevuta
   - ✅ Email completamento dati a rpoggi55@gmail.com ricevuta
   - ✅ Colonna "Prezzo Anno" = €480 nel DB
   - ✅ Link dashboard corretti (`https://telemedcare-v12.pages.dev/admin/leads-dashboard`)

### Test Case 2: Lead AVANZATO con switch OFF
1. Disattivare switch "Email completamento dati"
2. Inserire nuovo lead (AVANZATO)
3. **Verificare:**
   - ✅ Email notifica a info@ ricevuta
   - ❌ Email completamento dati NON inviata
   - ✅ Prezzo Anno = €840 nel DB
   - ✅ Log console: "Email completamento dati disabilitata (switch OFF)"

### Test Case 3: Tutti i servizi (pricing)
Verificare prezzi corretti per ogni combinazione:
- eCura FAMILY BASE → €390
- eCura FAMILY AVANZATO → €690
- eCura PRO BASE → €480
- eCura PRO AVANZATO → €840
- eCura PREMIUM BASE → €590
- eCura PREMIUM AVANZATO → €990

---

## 📊 RIEPILOGO MODIFICHE

| Fix | File | Linee | Complessità | Priorità |
|-----|------|-------|-------------|----------|
| **1. Email completamento** | `complete-workflow-orchestrator.ts` | +30 | Media | 🔴 Alta |
| **2. Prezzi** | `index.tsx` | +40 | Media | 🔴 Alta |
| **3. URL dashboard** | 6 file | +9 | Bassa | 🟡 Media |
| **4. Switch rispetto** | `complete-workflow-orchestrator.ts` | +20 | Bassa | 🟡 Media |

**Totale modifiche:** ~99 righe di codice

---

## 🚀 ORDINE DI APPLICAZIONE

1. **FIX 3 (URL)** → Facile, batch replace, no side-effects
2. **FIX 2 (Prezzi)** → Critico per completezza dati
3. **FIX 1 (Email completamento)** → Critico per workflow
4. **FIX 4 (Switch)** → Finale, per rispettare configurazione

---

**Status:** 🟠 PROBLEMI IDENTIFICATI, FIX PRONTI  
**Prossimo passo:** Applicare fix in ordine e testare

---

**Fine documento**
