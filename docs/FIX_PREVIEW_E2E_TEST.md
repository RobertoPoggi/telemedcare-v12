# 🔧 FIX CRITICI - Preview Environment E2E Test

**Data**: 08/03/2026  
**Commit**: `636334b`  
**Branch**: `test-environment`  
**Preview URL**: https://test-environment.telemedcare-v12.pages.dev

---

## ❌ PROBLEMI RISCONTRATI IN PREVIEW

### 1️⃣ Brochure PDF Rotta (4.9 KB invece 1.7-2.6 MB)

**Sintomo**:
- Email "Invio Contratto" riceve PDF allegato di 4.9 KB
- Il PDF non si apre/è corrotto
- Dovrebbe essere 1.7 MB (PREMIUM) o 2.6 MB (PRO/FAMILY)

**Causa Root**:
1. **Normalizzazione servizio senza .toUpperCase()**:
   - Codice: `servizio.replace(/^eCura\s+/i, '').trim()` → output `'pro'` (minuscolo)
   - Check: `servizio === 'PRO'` → FALLISCE ❌
   - Risultato: `loadBrochurePDF()` non viene chiamato

2. **Fallback su path sbagliato**:
   - Codice: `${baseUrl}/brochures/Brochure_eCura.pdf`
   - Corretto: `${baseUrl}/documents/Brochure_eCura.pdf`

**Fix Applicati**:

```typescript
// workflow-email-manager.ts linea 715
// PRIMA:
const servizio = servizioRaw.replace(/^eCura\s+/i, '').trim()

// DOPO:
const servizio = servizioRaw.replace(/^eCura\s+/i, '').trim().toUpperCase()

// workflow-email-manager.ts linea 737
// PRIMA:
const brochureUrl = `${baseUrl}/brochures/Brochure_eCura.pdf`

// DOPO:
const brochureUrl = `${baseUrl}/documents/Brochure_eCura.pdf`
```

**File Aggiunti**:
- `public/documents/Brochure_eCura.pdf` (455 KB) - brochure generica

---

### 2️⃣ Stripe Rifiuta Test Card 4242 4242 4242 4242

**Sintomo**:
- Preview usa carta test Stripe: `4242 4242 4242 4242`
- Pagamento rifiutato
- Errore: "Your card was declined"

**Causa Root**:
1. **Codice cercava VA sbagliata**:
   - Codice: `env.STRIPE_TEST_SECRET_KEY || env.STRIPE_SECRET_KEY`
   - Preview NON ha `STRIPE_TEST_SECRET_KEY` definita
   - Fallback su `STRIPE_SECRET_KEY` che contiene chiave **LIVE** (`sk_live_`)
   
2. **Stripe API in modalità LIVE rifiuta carte test**

**Fix Applicati**:

```typescript
// payment-manager.ts linea 210-213
// PRIMA:
const stripeApiKey = env.STRIPE_TEST_SECRET_KEY || env.STRIPE_SECRET_KEY

// DOPO:
// ✅ PRIORITY: Usa STRIPE_SECRET_KEY (deve essere sk_test_ in Preview, sk_live_ in Produzione)
const stripeApiKey = env.STRIPE_SECRET_KEY

// Aggiunto logging diagnostico:
const isTestMode = stripeApiKey.startsWith('sk_test')
console.log(`🔑 [STRIPE] Using ${isTestMode ? 'TEST' : 'LIVE'} mode`)
console.log(`🔑 [STRIPE] Key prefix: ${stripeApiKey.substring(0, 15)}...`)

// Verifica che in produzione non si usi test key
if (env.ENVIRONMENT === 'production' && isTestMode) {
  console.error(`🚨 [STRIPE] ERRORE: Stai usando TEST key in ambiente PRODUCTION!`)
}
if (env.ENVIRONMENT !== 'production' && !isTestMode) {
  console.warn(`⚠️ [STRIPE] ATTENZIONE: Stai usando LIVE key in ambiente NON-production!`)
}
```

---

## ✅ VERIFICA NECESSARIA

### Cloudflare Dashboard → Environment Variables

**Location**: Cloudflare Dashboard → Pages → `telemedcare-v12` → Settings → Environment Variables

| Environment | Variable | Valore Richiesto |
|------------|----------|------------------|
| **Preview** | `STRIPE_SECRET_KEY` | `sk_test_51QRb5pBhLZjOCuWK...` (TEST key) |
| **Preview** | `STRIPE_PUBLIC_KEY` | `pk_test_51QRb5pBhLZjOCuWK...` (TEST key) |
| **Production** | `STRIPE_SECRET_KEY` | `sk_live_...` (LIVE key) |
| **Production** | `STRIPE_PUBLIC_KEY` | `pk_live_...` (LIVE key) |

⚠️ **IMPORTANTE**: 
- Verifica che `STRIPE_SECRET_KEY` in **Preview** inizi con `sk_test_`
- Se inizia con `sk_live_`, CAMBIA il valore con la test key

---

## 🧪 TEST E2E IN PREVIEW (dopo deploy)

### Attendere Deploy Cloudflare
1. Cloudflare Pages deploy automatico da commit `636334b`
2. Tempo stimato: **2-3 minuti**
3. Verifica deploy completato: https://dash.cloudflare.com → Pages → telemedcare-v12 → Deployments

---

### Test 1: Brochure PDF Corretta

**Procedura**:
1. Vai su: https://test-environment.telemedcare-v12.pages.dev
2. Compila form lead (servizio: **eCura PRO**)
3. Dashboard: clicca "Invia Contratto"
4. Controlla email ricevuta

**Risultato Atteso**:
- ✅ Email ricevuta con PDF allegato
- ✅ Nome file: `Medica_GB_SiDLY_Care_PRO_ITA.pdf`
- ✅ Dimensione: **2.6 MB** (non 4.9 KB!)
- ✅ PDF si apre correttamente
- ✅ Console log: `✅ [WORKFLOW] Brochure PRO caricata: 2600.00 KB`

**Se servizio PREMIUM**:
- ✅ Nome file: `Medica_GB_SiDLY_Vital_Care_ITA.pdf`
- ✅ Dimensione: **1.7 MB**

---

### Test 2: Pagamento Stripe Test

**Procedura**:
1. Continua flusso E2E: firma contratto DocuSign
2. Ricevi email con proforma
3. Clicca "PAGA ORA €1.207,80" (o importo corretto)
4. Inserisci dati carta test:
   - **Numero**: `4242 4242 4242 4242`
   - **Scadenza**: qualsiasi data futura (es. `12/28`)
   - **CVC**: qualsiasi 3 cifre (es. `123`)
   - **Nome**: qualsiasi testo

**Risultato Atteso**:
- ✅ Console log: `🔑 [STRIPE] Using TEST mode`
- ✅ Console log: `🔑 [STRIPE] Key prefix: sk_test_51QRb5p...`
- ✅ Pagamento accettato: "Pagamento completato con successo!"
- ✅ Ricevi email "Configurazione Post Pagamento"
- ✅ Ricevi email "Benvenuto"

**Se fallisce**:
- ❌ Console log: `⚠️ [STRIPE] ATTENZIONE: Stai usando LIVE key in ambiente NON-production!`
- ❌ → Vai su Cloudflare Dashboard e correggi `STRIPE_SECRET_KEY` in Preview

---

## 📊 CHECKLIST COMPLETA

| Check | Descrizione | Status |
|-------|-------------|--------|
| ✅ | Fix brochure normalizzazione toUpperCase() | Commit `636334b` |
| ✅ | Fix brochure fallback path → /documents/ | Commit `636334b` |
| ✅ | Copiata brochure generica in /documents/ | Commit `636334b` |
| ✅ | Fix Stripe usa STRIPE_SECRET_KEY diretto | Commit `636334b` |
| ✅ | Aggiunto logging Stripe test/live mode | Commit `636334b` |
| ✅ | Aggiunto warning Stripe key mismatch | Commit `636334b` |
| ✅ | Push test-environment | Completato |
| ⏳ | Deploy Cloudflare Pages | In corso (2-3 min) |
| ⏳ | Test E2E brochure PDF corretta | Da fare |
| ⏳ | Test E2E pagamento Stripe test | Da fare |
| ⏳ | Verifica console log Stripe mode | Da fare |

---

## 🎯 RISULTATO ATTESO FINALE

**Flusso E2E Completo in Preview**:
1. ✅ Lead form → email notifica info@telemedcare.it
2. ✅ Invio contratto → email con PDF **2.6 MB** corretto (non 4.9 KB)
3. ✅ Firma DocuSign → email proforma
4. ✅ Pagamento Stripe **TEST mode** → carta 4242 accettata
5. ✅ Email configurazione post-pagamento
6. ✅ Email benvenuto

**Console Log Attesi**:
```
📄 [WORKFLOW] Servizio normalizzato: "eCura PRO" → "PRO"
📥 [WORKFLOW] Caricamento brochure specifica per PRO
✅ [WORKFLOW] Brochure PRO caricata: 2600.00 KB
💳 [STRIPE] Creazione Payment Intent per €1207.80
🔑 [STRIPE] Using TEST mode
🔑 [STRIPE] Key prefix: sk_test_51QRb5p...
✅ [STRIPE] Payment Intent creato: pi_...
```

---

## 📝 NOTE PER IL TEAM

1. **Preview DEVE usare test Stripe keys**:
   - Ogni test in Preview consuma **€1.20** se usi chiavi LIVE
   - Con test keys: **GRATIS**, nessun addebito

2. **Brochure corrette per dispositivo**:
   - FAMILY/PRO → `Medica_GB_SiDLY_Care_PRO_ITA.pdf` (2.6 MB)
   - PREMIUM → `Medica_GB_SiDLY_Vital_Care_ITA.pdf` (1.7 MB)
   - Fallback generico → `Brochure_eCura.pdf` (455 KB)

3. **Documentazione completa**:
   - `templates/PRODUCTION_TEMPLATES/README.md` - workflow completo
   - `templates/PRODUCTION_TEMPLATES/BROCHURE_PDF_AZIONI_MANUALI.md` - gestione brochure

---

**Deploy ETA**: 2-3 minuti  
**Test ETA**: 5-10 minuti  
**Total ETA**: ~10 minuti

🚀 **Preview URL**: https://test-environment.telemedcare-v12.pages.dev
