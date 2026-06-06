# 🔍 DIAGNOSI WORKFLOW END-TO-END TeleMedCare V12

**Data**: 9 Febbraio 2026  
**Analista**: GenSpark AI Developer  
**Stato**: CRITICO - Workflow si interrompe dopo firma contratto

---

## ✅ STEP FUNZIONANTI

### STEP 1: Acquisizione Lead + Email Completamento Dati
**File**: `src/index.tsx` linee 7923-8140  
**Endpoint**: `POST /api/leads/:id/complete`  
**Stato**: ✅ FUNZIONANTE

**Flusso**:
1. Lead compila form su www.ecura.it
2. Sistema salva lead in DB (tabella `leads`)
3. Sistema invia email con link di completamento dati
4. Lead clicca link e compila form `/completa-dati?token=XXX`
5. Sistema aggiorna lead con dati completi
6. Sistema chiama `inviaEmailContratto()` (linee 8042-8123)

**Problemi**: NESSUNO - Funziona correttamente

---

### STEP 2: Generazione e Invio Contratto
**File**: `src/modules/workflow-email-manager.ts` linee 721-958  
**Funzione**: `inviaEmailContratto()`  
**Stato**: ✅ FUNZIONANTE

**Flusso**:
1. Genera HTML contratto con tutti i dati cliente
2. Salva contratto in DB (tabella `contracts`)
3. Prepara email con link firma: `/contract-signature.html?contractId=XXX`
4. Invia email al cliente con contratto e brochure

**Problemi**: NESSUNO - Funziona correttamente

---

### STEP 3A: Firma Contratto
**File**: `src/index.tsx` linee 8821-9014  
**Endpoint**: `POST /api/contracts/sign`  
**Stato**: ✅ PARZIALMENTE FUNZIONANTE

**Flusso**:
1. Cliente apre link firma e visualizza contratto
2. Cliente firma su canvas digitale
3. JavaScript invia POST a `/api/contracts/sign` con firma base64
4. Sistema salva firma nel DB (campi `signature_data`, `signature_ip`, ecc.)
5. Sistema aggiorna status contratto a `SIGNED`
6. Sistema invia email di conferma firma al cliente

**Problemi**: ⚠️ **MANCA TRIGGER PROFORMA** - Non chiama la generazione della proforma

---

## ❌ STEP MANCANTI

### STEP 3B: Generazione e Invio Proforma (MANCANTE)
**File atteso**: Dovrebbe essere in `workflow-email-manager.ts` o chiamato da endpoint firma  
**Funzione**: `inviaEmailProforma()`  
**Stato**: ❌ **NON IMPLEMENTATO NEL TRIGGER**

**Dovrebbe fare**:
1. Dopo firma contratto, recuperare dati lead e contratto
2. Chiamare `ProformaManager.createProforma()`
3. Generare HTML proforma con prezzi IVA inclusa
4. Inviare email con proforma PDF e link pagamento Stripe
5. Salvare proforma in DB (tabella `proformas`)

**File disponibile**: `src/modules/proforma-manager.ts` (ESISTE ma NON USATO)  
**Fix necessario**: Aggiungere trigger in `/api/contracts/sign` dopo salvataggio firma

---

### STEP 4: Pagamento Stripe (MANCANTE)
**File atteso**: Dovrebbe essere endpoint `/api/payments/stripe`  
**Stato**: ❌ **NON IMPLEMENTATO**

**Dovrebbe fare**:
1. Cliente clicca link pagamento in email proforma
2. Sistema crea sessione Stripe Checkout
3. Cliente paga con carta
4. Stripe webhook notifica pagamento confermato
5. Sistema aggiorna proforma con `pagamento_ricevuto = 1`
6. Sistema invia email di benvenuto + form configurazione

---

### STEP 5: Form Configurazione Dispositivo (MANCANTE)
**File atteso**: `/public/configurazione.html` o endpoint API  
**Stato**: ❌ **NON IMPLEMENTATO**

**Dovrebbe fare**:
1. Cliente riceve email con link form configurazione
2. Cliente compila: telefoni familiari, orari assistenza, ecc.
3. Sistema salva in tabella `configurations`
4. Sistema invia email a info@ con dati configurazione
5. Operatore associa dispositivo IMEI

---

### STEP 6: Associazione Dispositivo + DDT (MANCANTE)
**File atteso**: Dashboard admin + email automation  
**Stato**: ❌ **NON IMPLEMENTATO**

**Dovrebbe fare**:
1. Operatore associa dispositivo IMEI al cliente
2. Sistema genera DDT (documento di trasporto)
3. Sistema invia email al cliente con conferma spedizione
4. Sistema invia email attivazione con istruzioni

---

## 🔧 FIX PRIORITARI

### Fix #1: Trigger Proforma dopo Firma (ALTA PRIORITÀ)
**File da modificare**: `src/index.tsx` endpoint `/api/contracts/sign`  
**Linee**: Dopo linea 8996 (dopo invio email conferma firma)

**Codice da aggiungere**:
```typescript
// ✅ FIX: Trigger automatico proforma dopo firma
try {
  console.log(`📊 [FIRMA] Generazione proforma per lead ${contract.leadId}`)
  
  // Importa funzione invio proforma
  const { inviaEmailProforma } = await import('./modules/workflow-email-manager')
  
  // Recupera lead completo
  const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?')
    .bind(contract.leadId).first()
  
  if (lead) {
    // Genera numero proforma
    const proformaId = `PRF-${Date.now()}`
    const numeroProforma = `PRF${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    
    // Prepara dati proforma
    const proformaData = {
      proformaId,
      numeroProforma,
      proformaPdfUrl: '', // PDF generato separatamente
      tipoServizio: contract.piano || 'BASE',
      servizio: contract.servizio || 'eCura PRO',
      prezzoBase: contract.prezzo_totale || (contract.piano === 'AVANZATO' ? 840 : 480),
      prezzoIvaInclusa: contract.piano === 'AVANZATO' ? 1024.80 : 585.60,
      dataScadenza: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
    
    // Invia email proforma
    const proformaResult = await inviaEmailProforma(
      lead,
      proformaData,
      c.env,
      c.env.DB
    )
    
    if (proformaResult.success) {
      console.log(`✅ [FIRMA] Proforma ${numeroProforma} inviata con successo`)
    } else {
      console.error(`❌ [FIRMA] Errore invio proforma:`, proformaResult.errors)
    }
  }
} catch (proformaError) {
  console.error(`⚠️ [FIRMA] Errore trigger proforma (firma salvata comunque):`, proformaError)
}
```

**Impatto**: CRITICO - Sblocca il workflow verso il pagamento

---

### Fix #2: Integrazione Stripe (MEDIA PRIORITÀ)
**File da creare**: `src/index.tsx` endpoint `POST /api/payments/stripe/create-session`

**Endpoint necessari**:
1. `POST /api/payments/stripe/create-session` - Crea sessione checkout
2. `POST /api/payments/stripe/webhook` - Riceve conferma pagamento
3. `GET /api/payments/stripe/success` - Redirect dopo pagamento
4. `GET /api/payments/stripe/cancel` - Redirect se annullato

---

### Fix #3: Form Configurazione (BASSA PRIORITÀ)
**File da creare**: `/public/configurazione.html`

**Campi necessari**:
- Telefoni familiari (max 3)
- Orari preferiti assistenza
- Allergie/patologie
- Note aggiuntive

---

## 📊 STATO TABELLE DATABASE

### Tabelle esistenti
- ✅ `leads` - OK, in uso
- ✅ `contracts` - OK, in uso
- ⚠️ `proformas` - ESISTE ma NON POPOLATA
- ⚠️ `configurations` - ESISTE ma NON POPOLATA
- ⚠️ `devices` - ESISTE ma NON POPOLATA
- ⚠️ `ddts` - ESISTE ma NON POPOLATA

### Query di verifica
```sql
-- Verifica contratti firmati senza proforma
SELECT c.id, c.codice_contratto, c.status, c.leadId
FROM contracts c
LEFT JOIN proformas p ON p.leadId = c.leadId
WHERE c.status = 'SIGNED' AND p.id IS NULL;

-- Verifica lead con contratto ma senza configurazione
SELECT l.id, l.nomeRichiedente, l.cognomeRichiedente, l.status
FROM leads l
INNER JOIN contracts c ON c.leadId = l.id
LEFT JOIN configurations cfg ON cfg.leadId = l.id
WHERE c.status = 'SIGNED' AND cfg.id IS NULL;
```

---

## 🎯 PROSSIMI PASSI

### Immediati (oggi)
1. ✅ Completare questa diagnosi
2. 🔄 Implementare Fix #1 (trigger proforma dopo firma)
3. 🔄 Testare flusso end-to-end da lead a proforma

### Brevi (domani)
4. Implementare Fix #2 (integrazione Stripe)
5. Testare pagamento test con Stripe sandbox
6. Implementare email benvenuto post-pagamento

### Medi (questa settimana)
7. Creare form configurazione dispositivo
8. Implementare dashboard operatore per associazione IMEI
9. Implementare generazione DDT automatica
10. Implementare email attivazione finale

---

## 📝 NOTE TECNICHE

### Prezzi IVA (www.ecura.it)
- BASE: €480/anno + IVA 22% = **€585.60**
- AVANZATO: €840/anno + IVA 22% = **€1.024,80**

### Email Service
- Provider primario: Resend (API key in env)
- Provider fallback: SendGrid (API key in env)
- From address: info@ecura.it

### Template Email Esistenti
- ✅ `email_notifica_info` - Notifica nuovo lead
- ✅ `email_documenti_informativi` - Brochure/manuale
- ✅ `email_invio_contratto` - Contratto + firma
- ⚠️ `email_invio_proforma` - ESISTE ma MAI USATO
- ⚠️ `email_benvenuto` - ESISTE ma MAI USATO
- ⚠️ `email_configurazione` - ESISTE ma MAI USATO
- ⚠️ `email_conferma_attivazione` - ESISTE ma MAI USATO

---

## 🚨 PROBLEMA CRITICO IDENTIFICATO

**Il workflow si interrompe dopo la firma del contratto perché l'endpoint `/api/contracts/sign` NON chiama la generazione della proforma.**

**Soluzione**: Aggiungere trigger automatico che chiama `inviaEmailProforma()` dopo il salvataggio della firma.

**Impatto**: Una volta fixato, il flusso procederà fino al pagamento Stripe (che andrà implementato successivamente).

---

**Fine Diagnosi**
