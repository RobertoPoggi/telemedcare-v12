# 🧪 TEST FLUSSO COMPLETO FIRMA CONTRATTO

**Data**: 2026-02-12  
**Versione Production**: V11 (contract-signature.html - funzionante)  
**Versione Local**: V12 (firma-contratto.html - non deployata)

---

## ✅ OPZIONE RACCOMANDATA: Test con V11 Production

### Step 1: Crea contratto test nel DB

Devi avere un contratto nel database con:
- `id`: Es. "CONTRACT_TEST_123"
- `leadId`: ID di un lead esistente
- `status`: "SENT"
- `contract_html`: HTML del contratto

### Step 2: Apri URL firma contratto

```
https://telemedcare-v12.pages.dev/contract-signature.html?contractId=CONTRACT_TEST_123
```

**Sostituisci** `CONTRACT_TEST_123` con un ID contratto reale dal tuo DB.

### Step 3: Verifica pagina caricata

Dovresti vedere:
- ✅ Titolo: "📄 Firma Digitale Contratto"
- ✅ Contenuto contratto caricato via API
- ✅ Canvas per firma digitale
- ✅ Pulsante "Firma Contratto"

### Step 4: Firma il contratto

1. Disegna firma nel canvas con mouse/touch
2. Click "Firma Contratto"
3. Attendi conferma

### Step 5: Verifica successo

**Frontend:**
- ✅ Messaggio: "Contratto firmato con successo!"
- ✅ Redirect o conferma visuale

**Backend (DB):**
```sql
SELECT * FROM contracts WHERE id = 'CONTRACT_TEST_123';
```

Verifica campi:
- `status` = 'SIGNED' ✅
- `signature_data` = [Base64 firma] ✅
- `signature_timestamp` = [Data/ora] ✅
- `signature_ip` = [Tuo IP] ✅
- `data_firma` = [Data] ✅

**Email:**
- ✅ Email inviata al cliente con PDF contratto firmato
- ✅ Subject: "TeleMedCare - Contratto firmato..."

---

## 🔧 Come ottenere un contractId test

### Metodo 1: Dashboard

1. Vai a: https://telemedcare-v12.pages.dev/dashboard.html
2. Cerca tab "Contratti" o "Contracts"
3. Copia ID di un contratto esistente

### Metodo 2: API diretta

```bash
# Lista contratti
curl https://telemedcare-v12.pages.dev/api/contracts

# Crea contratto test (se API disponibile)
curl -X POST https://telemedcare-v12.pages.dev/api/contracts \
  -H "Content-Type: application/json" \
  -d '{"leadId": "LEAD-123", "tipoContratto": "BASE"}'
```

### Metodo 3: Database diretto

Se hai accesso al DB Cloudflare D1:

```sql
-- Lista contratti recenti
SELECT id, leadId, status, data_invio 
FROM contracts 
WHERE status = 'SENT' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🎯 FLUSSO COMPLETO END-TO-END

```
1. Lead inserito → DB
         ↓
2. Sistema genera contratto → contracts table
         ↓
3. Email inviata con link firma
   LINK: /contract-signature.html?contractId=XXX
         ↓
4. Cliente clicca link → Pagina firma aperta
         ↓
5. Cliente legge contratto → UI
         ↓
6. Cliente firma nel canvas → JavaScript
         ↓
7. POST /api/contracts/sign
   - contractId
   - signatureData (Base64)
   - timestamp
   - IP, userAgent, screenRes
         ↓
8. Backend aggiorna DB
   - status = 'SIGNED'
   - signature_data = [Base64]
   - signature_ip, timestamp, etc.
         ↓
9. Email conferma inviata
   - Al cliente
   - Con PDF contratto firmato
         ↓
10. ✅ COMPLETATO
```

---

## 📊 CHECKLIST TESTING

### Pre-test
- [ ] Verifica DB accessible
- [ ] Verifica almeno 1 contratto con status='SENT'
- [ ] Verifica Resend API key configurata (per email)

### Test Firma
- [ ] Apri URL con contractId valido
- [ ] Vedi contenuto contratto caricato
- [ ] Canvas firma funzionante (touch/mouse)
- [ ] Pulsante "Firma" abilitato dopo disegno
- [ ] Click firma → Loading indicator
- [ ] Successo → Conferma visuale

### Post-test
- [ ] Verifica DB: status = 'SIGNED'
- [ ] Verifica DB: signature_data presente
- [ ] Verifica DB: signature_ip = tuo IP
- [ ] Verifica email ricevuta (check inbox)
- [ ] Verifica email contiene firma visibile

---

## 🐛 TROUBLESHOOTING

### Errore: "Contratto non trovato"
- ✅ Verifica contractId nell'URL
- ✅ Verifica contratto esiste nel DB
- ✅ Verifica API `/api/contracts/:id` funzionante

### Errore: "Contratto già firmato"
- ✅ Contratto ha status='SIGNED'
- ✅ Usa un altro contractId con status='SENT'

### Errore: "Firma non salvata"
- ✅ Verifica canvas ha contenuto (non vuoto)
- ✅ Verifica network request a `/api/contracts/sign`
- ✅ Check console browser per errori JavaScript

### Pagina bianca / 404
- ✅ Verifica URL corretto: `contract-signature.html` (con trattino)
- ✅ Verifica contractId presente: `?contractId=XXX`
- ✅ Prova in finestra incognito (bypass cache)

---

## 🎯 URL TEST RAPIDO (DEMO)

**Con contractId fittizio** (mostrerà errore "non trovato" ma testa loading):
```
https://telemedcare-v12.pages.dev/contract-signature.html?contractId=TEST_DEMO_123
```

**Risultato atteso**:
- ✅ Pagina carica (200 OK)
- ✅ Loading indicator appare
- ❌ Errore: "Contratto non trovato" (normale, ID fittizio)

Questo conferma che pagina e JavaScript funzionano.

---

## ✅ DOPO IL TEST

Una volta verificato che il flusso funziona con V11, possiamo:

1. **Fix deploy Cloudflare** per V12 (firma-contratto.html)
2. **Update email template** per usare nuovo URL
3. **Monitoring** per verificare conversione firma

---

**Ready to test?** 🚀

Dammi un contractId reale e posso guidarti passo-passo!
