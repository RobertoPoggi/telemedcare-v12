# ✅ FIX WORKFLOW: Trigger Proforma dopo Firma Contratto

**Data**: 9 Febbraio 2026  
**Developer**: GenSpark AI Developer  
**Priorità**: CRITICA  
**Status**: ✅ IMPLEMENTATO

---

## 🎯 Problema Risolto

**PRIMA DEL FIX**:
Il workflow si interrompeva dopo la firma del contratto. L'endpoint `/api/contracts/sign` salvava la firma e inviava email di conferma, ma **NON attivava la generazione della proforma**.

**Risultato**: I clienti firmavano il contratto ma non ricevevano la proforma per il pagamento, bloccando l'intero flusso di attivazione.

---

## 🔧 Soluzione Implementata

### File Modificato
**File**: `src/index.tsx`  
**Endpoint**: `POST /api/contracts/sign`  
**Linee modificate**: 8996-9000 (espanse con nuovo codice)

### Cosa Fa il Fix

Dopo il salvataggio della firma del contratto, il sistema ora:

1. **Recupera i dati del lead** dal database
2. **Genera ID e numero proforma univoci** (formato: `PRF202602-XXXX`)
3. **Calcola i prezzi** in base al piano (BASE o AVANZATO)
   - BASE: €480 + IVA 22% = **€585.60**
   - AVANZATO: €840 + IVA 22% = **€1.024,80**
4. **Salva la proforma nel database** (tabella `proformas`)
5. **Invia email con proforma** al cliente usando `inviaEmailProforma()`
6. **Logga tutti i passaggi** per debugging

### Codice Aggiunto

```typescript
// ✅ CRITICAL FIX: Trigger automatico generazione e invio proforma dopo firma
try {
  console.log(`📊 [FIRMA→PROFORMA] Avvio workflow proforma per contratto ${contractId}`)
  
  // Recupera lead completo
  const lead = await c.env.DB.prepare('SELECT * FROM leads WHERE id = ?')
    .bind(contract.leadId).first() as any
  
  if (lead && c.env.RESEND_API_KEY) {
    // Importa funzione invio proforma
    const { inviaEmailProforma } = await import('./modules/workflow-email-manager')
    
    // Genera ID e numero proforma univoci
    const proformaId = `PRF-${Date.now()}`
    const numeroProforma = `PRF${year}${month}-${random}`
    
    // Determina prezzi in base al piano
    const piano = contract.piano || 'BASE'
    const prezzoBase = contract.prezzo_totale || (piano === 'AVANZATO' ? 840 : 480)
    const prezzoIvaInclusa = piano === 'AVANZATO' ? 1024.80 : 585.60
    
    // Salva proforma nel DB
    await c.env.DB.prepare(`
      INSERT INTO proformas (
        id, leadId, numero_proforma, 
        data_emissione, data_scadenza, 
        importo_base, importo_iva, importo_totale,
        valuta, status, servizio, piano,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(...)
    
    // Invia email proforma
    const proformaResult = await inviaEmailProforma(lead, proformaData, c.env, c.env.DB)
    
    if (proformaResult.success) {
      console.log(`✅ [FIRMA→PROFORMA] Proforma inviata con successo`)
    }
  }
} catch (proformaError) {
  console.error(`⚠️ [FIRMA→PROFORMA] Errore trigger (firma salvata comunque)`, proformaError)
}
```

---

## 📊 Flusso Workflow Completo (DOPO IL FIX)

```
1. Lead compila form su www.ecura.it
   ↓
2. Sistema invia email con link completamento dati
   ↓
3. Lead completa i dati mancanti
   ↓
4. Sistema genera e invia contratto + brochure
   ↓
5. Lead firma il contratto online
   ↓
6. Sistema salva firma nel DB
   ↓
7. Sistema invia email conferma firma
   ↓
8. ✅ [NUOVO] Sistema genera e salva proforma nel DB
   ↓
9. ✅ [NUOVO] Sistema invia email proforma con link pagamento
   ↓
10. [DA IMPLEMENTARE] Cliente paga tramite Stripe
   ↓
11. [DA IMPLEMENTARE] Sistema invia form configurazione
   ↓
12. [DA IMPLEMENTARE] Operatore associa dispositivo
   ↓
13. [DA IMPLEMENTARE] Sistema invia email attivazione
```

---

## 🗄️ Impatto sul Database

### Tabella `proformas` - Ora Popolata

Campi salvati per ogni proforma:
- `id`: PRF-{timestamp}
- `leadId`: ID del lead associato
- `numero_proforma`: PRF{YYYYMM}-{XXXX}
- `data_emissione`: Data odierna
- `data_scadenza`: +30 giorni
- `importo_base`: Prezzo senza IVA (€480 o €840)
- `importo_iva`: IVA 22% (calcolata)
- `importo_totale`: Prezzo con IVA (€585.60 o €1.024,80)
- `valuta`: EUR
- `status`: GENERATED
- `servizio`: eCura PRO / FAMILY / PREMIUM
- `piano`: BASE / AVANZATO

### Query di Verifica

```sql
-- Verifica proforma generate oggi
SELECT id, numero_proforma, leadId, importo_totale, status, created_at
FROM proformas
WHERE DATE(created_at) = DATE('now')
ORDER BY created_at DESC;

-- Verifica contratti firmati con proforma associata
SELECT 
  c.id as contract_id,
  c.codice_contratto,
  c.status as contract_status,
  p.numero_proforma,
  p.importo_totale,
  p.status as proforma_status
FROM contracts c
INNER JOIN proformas p ON p.leadId = c.leadId
WHERE c.status = 'SIGNED'
ORDER BY c.signed_at DESC;
```

---

## 📧 Email Proforma

### Template Utilizzato
**File**: `templates/email_invio_proforma.html` (caricato da DB o fallback)

### Contenuto Email
- Conferma ricezione firma contratto
- Dettagli servizio e piano scelto
- Importo totale da pagare (IVA inclusa)
- **Link pagamento Stripe** (da implementare)
- Istruzioni pagamento bonifico bancario
  - IBAN: IT02X0306909606100000061231
  - Causale: Proforma {numero} - TeleMedCare
- Scadenza pagamento (+30 giorni)

### Destinatari
- **TO**: Cliente (lead.emailRichiedente)
- **CC**: info@ecura.it (copia conoscenza)

---

## 🧪 Test Necessari

### Test Manuale
1. Creare un lead di test
2. Completare i dati
3. Firmare il contratto
4. Verificare ricezione email proforma
5. Verificare salvataggio in DB

### Comandi Test
```bash
# Verifica ultima proforma generata
cd /home/user/webapp && npx wrangler d1 execute telemedcare_production --command="SELECT * FROM proformas ORDER BY created_at DESC LIMIT 1"

# Verifica logs deploy
cd /home/user/webapp && npx wrangler pages deployment tail
```

---

## 🚀 Prossimi Passi

### Priorità Alta (Questa Settimana)
1. ✅ **Fix implementato** - Trigger proforma dopo firma
2. 🔄 **Test end-to-end** - Verificare flusso completo
3. ⏳ **Integrazione Stripe** - Implementare pagamento online
   - Endpoint: `POST /api/payments/stripe/create-session`
   - Webhook: `POST /api/payments/stripe/webhook`
4. ⏳ **Email benvenuto** - Dopo pagamento confermato

### Priorità Media (Prossime 2 Settimane)
5. Form configurazione dispositivo
6. Dashboard operatore per associazione IMEI
7. Generazione DDT automatica
8. Email attivazione finale

---

## 📝 Note Tecniche

### Gestione Errori
- Se la generazione della proforma fallisce, la firma del contratto **rimane salvata**
- Tutti gli errori sono loggati con prefisso `[FIRMA→PROFORMA]`
- Il cliente riceve comunque email di conferma firma

### Dipendenze
- Richiede `RESEND_API_KEY` in env per invio email
- Richiede tabella `proformas` con schema corretto in D1
- Richiede modulo `workflow-email-manager.ts` con funzione `inviaEmailProforma()`

### Logging
Tutti i log includono:
- Prefisso `📊 [FIRMA→PROFORMA]` per facile filtering
- Timestamp ISO 8601
- ID contratto e lead
- Numero proforma generato
- Result success/failure

---

## 🎉 Risultato Atteso

**Dopo questo fix**, quando un cliente firma un contratto:
1. ✅ La firma viene salvata correttamente
2. ✅ Il cliente riceve email di conferma firma
3. ✅ **NUOVO**: La proforma viene generata automaticamente
4. ✅ **NUOVO**: Il cliente riceve email con proforma e istruzioni pagamento
5. ✅ **NUOVO**: La proforma viene salvata nel database per tracking

**Workflow sbloccato**: Il flusso ora può procedere fino al pagamento Stripe (da implementare successivamente).

---

**Status**: ✅ FIX COMPLETATO E PRONTO PER TEST
