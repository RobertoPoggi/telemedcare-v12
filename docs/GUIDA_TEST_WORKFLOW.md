# GUIDA RAPIDA: TEST WORKFLOW eCURA

## 🚀 COME TESTARE IL WORKFLOW COMPLETO

### ⚡ TEST VELOCE (2 minuti)

#### OPZIONE 1: cURL (da terminale)

```bash
curl -X POST https://telemedcare-v11.TUODOMINIO.workers.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "tua-email-test@example.com",
    "telefono": "335 123 4567",
    "servizio": "PRO",
    "pacchetto": "AVANZATO",
    "vuoleContratto": true,
    "vuoleBrochure": true,
    "eta": 75
  }'
```

**✅ Risposta attesa:**
```json
{
  "success": true,
  "leadId": "LEAD_2025-12-21T...",
  "message": "Lead processato: contratto generato e inviato",
  "email_sent": true
}
```

**📧 Email che riceverai:**
1. Email con documenti informativi
2. Email con contratto PDF allegato
3. Email con brochure PDF (Medica_GB_SiDLY_Care_PRO_ITA.pdf)

---

#### OPZIONE 2: Postman/Insomnia

1. **New Request → POST**
2. **URL:** `https://telemedcare-v11.TUODOMINIO.workers.dev/api/lead`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body (raw JSON):**
   ```json
   {
     "nome": "Test",
     "cognome": "Cliente",
     "email": "tua-email@example.com",
     "telefono": "335 111 2222",
     "servizio": "FAMILY",
     "pacchetto": "BASE",
     "vuoleContratto": true,
     "vuoleBrochure": false,
     "eta": 70
   }
   ```
5. **Send** ✅

---

#### OPZIONE 3: Browser (JavaScript Console)

Apri Developer Console (F12) su qualsiasi pagina e incolla:

```javascript
fetch('https://telemedcare-v11.TUODOMINIO.workers.dev/api/lead', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    nome: 'Test',
    cognome: 'Browser',
    email: 'tua-email@example.com',
    telefono: '335 999 8888',
    servizio: 'PREMIUM',
    pacchetto: 'AVANZATO',
    vuoleContratto: true,
    vuoleBrochure: true,
    eta: 80
  })
})
.then(res => res.json())
.then(data => console.log('✅ Risultato:', data))
.catch(err => console.error('❌ Errore:', err));
```

---

## 🧪 TEST WORKFLOW COMPLETO (Step-by-Step)

### PASSO 1: Invia Lead

```bash
LEAD_RESPONSE=$(curl -s -X POST https://telemedcare-v11.TUODOMINIO.workers.dev/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "TestWorkflow",
    "cognome": "Completo",
    "email": "tua-email@example.com",
    "telefono": "335 123 4567",
    "servizio": "PRO",
    "pacchetto": "AVANZATO",
    "vuoleContratto": true,
    "vuoleBrochure": true,
    "eta": 72
  }')

echo $LEAD_RESPONSE
# Output: {"success":true,"leadId":"LEAD_2025...","message":"Lead processato..."}

LEAD_ID=$(echo $LEAD_RESPONSE | jq -r '.leadId')
echo "Lead ID: $LEAD_ID"
```

**✅ Verifica Email 1:** Documenti informativi

**✅ Verifica Email 2:** Contratto PDF + Brochure

---

### PASSO 2: (MANUALE) Firma Contratto DocuSign

> **NOTA:** In ambiente test, simula la firma manualmente aggiornando il DB:

```sql
-- Simula firma contratto
UPDATE contracts 
SET status = 'signed', 
    signed_at = datetime('now')
WHERE lead_id = 'LEAD_ID_QUI';

UPDATE leads
SET status = 'CONTRACT_SIGNED'
WHERE id = 'LEAD_ID_QUI';
```

Oppure usa il webhook DocuSign test endpoint.

---

### PASSO 3: Ricevi Proforma

**Dopo firma contratto**, il sistema automaticamente:
1. ✅ Genera proforma (PF-202512-XXXXXX)
2. ✅ Crea Stripe Payment Link
3. ✅ Invia email con proforma PDF + link pagamento

**✅ Verifica Email 3:** Proforma con link Stripe

---

### PASSO 4: (MANUALE) Simula Pagamento Stripe

Per testare senza pagamento reale:

```bash
# Simula webhook Stripe payment_intent.succeeded
curl -X POST https://telemedcare-v11.TUODOMINIO.workers.dev/api/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{
    "id": "evt_test_123456",
    "type": "payment_intent.succeeded",
    "created": 1703174400,
    "data": {
      "object": {
        "id": "pi_test_123456",
        "amount": 102480,
        "currency": "eur",
        "status": "succeeded",
        "metadata": {
          "proforma_number": "PF-202512-ABC123",
          "contract_code": "TMC-202512-XYZ789",
          "lead_id": "LEAD_...",
          "servizio": "PRO",
          "piano": "AVANZATO"
        }
      }
    }
  }'
```

**✅ Verifica Email 4:** Email configurazione con link form

---

### PASSO 5: Compila Form Configurazione

Il cliente riceve email con link al form per inserire:
- Dati anagrafici completi
- Contatti emergenza (3)
- Condizioni mediche
- Farmaci e terapie
- Note aggiuntive

---

### PASSO 6: DDT e Attivazione (TODO)

Dopo compilazione form:
1. ✅ Sistema genera DDT automatico
2. ✅ Email conferma con tracking spedizione
3. ✅ Lead status → `ACTIVE`
4. ✅ Servizio attivato

---

## 📊 VERIFICA COMPLETA DB

```bash
# Accedi al DB locale
cd /home/user/webapp
python3 -c "
import sqlite3
conn = sqlite3.connect('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/97505df135f15360373d775555b661a51027c29c114a5dec16c15f12103da7d6.sqlite')
cursor = conn.cursor()

print('\\n📋 LEADS:')
cursor.execute('SELECT id, nome, cognome, email, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5')
for row in cursor.fetchall():
    print(f'  {row}')

print('\\n📄 CONTRACTS:')
cursor.execute('SELECT id, codice_contratto, lead_id, status, signed_at FROM contracts ORDER BY created_at DESC LIMIT 5')
for row in cursor.fetchall():
    print(f'  {row}')

print('\\n💰 PROFORMAS:')
cursor.execute('SELECT id, numero_proforma, contract_code, status, totale FROM proformas ORDER BY created_at DESC LIMIT 5')
for row in cursor.fetchall():
    print(f'  {row}')

conn.close()
"
```

---

## 🎯 RIEPILOGO STATI WORKFLOW

```
1. LEAD_CREATED           → Email documenti info
2. CONTRACT_SENT          → Email contratto + brochure
3. CONTRACT_SIGNED        → Genera proforma + Stripe link
4. PAYMENT_COMPLETED      → Email configurazione
5. CONFIGURATION_RECEIVED → Genera DDT
6. ACTIVE                 → Servizio attivo ✅
```

---

## 🚨 TROUBLESHOOTING

### Problema: Email non arrivano

**Verifica 1:** Check logs Cloudflare Worker
```bash
wrangler tail --format pretty
```

**Verifica 2:** Check configurazione Resend
- API Key valida?
- Dominio verificato?
- Rate limits?

**Verifica 3:** Check spam folder

---

### Problema: Contratto non generato

**Verifica 1:** Check pricing
```bash
# Verifica pricing esiste per servizio/piano
SELECT * FROM ecura_pricing WHERE servizio='PRO' AND piano='AVANZATO';
```

**Verifica 2:** Check template contratto
```bash
ls -la templates/contracts/contratto_ecura_*
```

---

### Problema: Brochure non allegata

**Verifica 1:** Check file brochure
```bash
ls -la public/brochures/
# Deve esserci: Medica_GB_SiDLY_Care_PRO_ITA.pdf
```

**Verifica 2:** Check brochure manager
```javascript
// In brochure-manager.ts, verifica mapping servizi
```

---

## 📞 SUPPORT

Per problemi tecnici:
- **GitHub Issues**: https://github.com/RobertoPoggi/telemedcare-v11/issues
- **Email**: roberto.poggi@medicagb.it

---

## ✅ CHECKLIST LANCIO

Prima del lancio in produzione:

- [ ] Endpoint `/api/lead` funzionante
- [ ] Email documenti informativi arrivano
- [ ] Email contratto con PDF allegato arriva
- [ ] Email brochure corretta allegata
- [ ] DocuSign integration testata
- [ ] Email proforma con Stripe link arriva
- [ ] Stripe webhook configurato
- [ ] Email configurazione arriva dopo pagamento
- [ ] Form configurazione funzionante
- [ ] DDT generation implementato
- [ ] Dominio custom configurato
- [ ] SSL certificato attivo
- [ ] Backup database configurato
- [ ] Monitoring attivo (Cloudflare Analytics)

---

**Ready per il test?** Dimmi quando vuoi provare il workflow completo! 🚀
