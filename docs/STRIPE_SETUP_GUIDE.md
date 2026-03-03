# 🔐 GUIDA CONFIGURAZIONE STRIPE PER MEDICA GB

## 📋 PREREQUISITI

1. **Account Stripe Medica GB**
   - Registrati su: https://dashboard.stripe.com/register
   - Completa la verifica dell'azienda (Medica GB S.r.l.)
   - P.IVA: 12435130963

## 🔑 STEP 1: RECUPERA LE API KEYS

### **1.1 Accedi alla Dashboard Stripe**
- Vai su: https://dashboard.stripe.com/
- Login con account Medica GB

### **1.2 Ottieni le chiavi API**
- Dashboard → **Developers** → **API keys**
- Troverai due chiavi:
  - **Publishable key** (pk_test_... o pk_live_...)
  - **Secret key** (sk_test_... o sk_live_...)

**⚠️ IMPORTANTE**:
- **Test mode**: Usa `pk_test_...` e `sk_test_...` per testing
- **Live mode**: Usa `pk_live_...` e `sk_live_...` per produzione

## ⚙️ STEP 2: CONFIGURA CLOUDFLARE PAGES

### **2.1 Vai su Cloudflare Dashboard**
- URL: https://dash.cloudflare.com/
- Account: RobertoPoggi
- Pages → **telemedcare-v12**

### **2.2 Aggiungi Environment Variables**

**Vai in**: Settings → Environment variables

**Aggiungi queste variabili**:

#### **Per Production (main branch)**:
```
STRIPE_PUBLIC_KEY = pk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY = sk_live_xxxxxxxxxxxxxxxxxxxxx
```

#### **Per Preview (tutti i branch tranne main)**:
```
STRIPE_PUBLIC_KEY = pk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY = sk_test_xxxxxxxxxxxxxxxxxxxxx
```

**Come aggiungere**:
1. Click "Add variable"
2. Nome variabile: `STRIPE_PUBLIC_KEY`
3. Valore: incolla la chiave pubblica
4. Environment: **Production** (o **Preview**)
5. Click "Save"
6. Ripeti per `STRIPE_SECRET_KEY`

### **2.3 Redeploy dopo aver aggiunto le variabili**
- Vai in **Deployments**
- Click sui 3 puntini dell'ultimo deploy
- Click "Retry deployment"

## 🧪 STEP 3: TEST STRIPE IN TEST MODE

### **3.1 Usa carte di test Stripe**

**Carta di successo**:
```
Numero: 4242 4242 4242 4242
Data: qualsiasi data futura (es: 12/30)
CVC: qualsiasi 3 cifre (es: 123)
```

**Carta che fallisce**:
```
Numero: 4000 0000 0000 0002
```

### **3.2 Test payment flow**

1. Vai su: `https://telemedcare-v12.pages.dev/pagamento.html?proformaId=PRF202603-ESAM`
2. Compila i dati della carta (usa carta test sopra)
3. Click "Paga €1.207,80"
4. Verifica che il pagamento vada a buon fine
5. Controlla su Stripe Dashboard → Payments

## 📊 STEP 4: IBAN E BONIFICO BANCARIO

Nel sistema attuale, la proforma include anche l'opzione di pagamento tramite bonifico:

**IBAN Medica GB**: `IT97L0503401727000000003519`

**Causale**: `Proforma [NUMERO] - [NOME CLIENTE]`

## 🔔 STEP 5: WEBHOOK STRIPE (Opzionale ma consigliato)

### **5.1 Configura webhook su Stripe**

1. Stripe Dashboard → **Developers** → **Webhooks**
2. Click "Add endpoint"
3. URL endpoint: `https://telemedcare-v12.pages.dev/api/webhooks/stripe`
4. Seleziona eventi:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"

### **5.2 Copia Signing Secret**

Dopo aver creato il webhook:
1. Click sul webhook creato
2. Copia il **Signing secret** (whsec_...)
3. Aggiungi su Cloudflare Pages:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

## ✅ STEP 6: VERIFICA CONFIGURAZIONE

### **6.1 Check API keys**

Testa che le chiavi funzionino:
```bash
curl https://telemedcare-v12.pages.dev/api/stripe-public-key
```

Risposta attesa:
```json
{
  "publicKey": "pk_test_..." 
}
```

### **6.2 Test payment intent**

```bash
curl -X POST https://telemedcare-v12.pages.dev/api/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "proformaId": "PRF202603-ESAM",
    "amount": 120780
  }'
```

Risposta attesa:
```json
{
  "success": true,
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxxxxxxxxxxxx"
}
```

## 🎯 ENDPOINT STRIPE NEL SISTEMA

Il sistema usa questi endpoint:

1. **GET /api/stripe-public-key**
   - Recupera chiave pubblica Stripe
   - Usato da: `pagamento.html`

2. **POST /api/create-payment-intent**
   - Crea Payment Intent per importo specifico
   - Usato da: `pagamento.html`

3. **POST /api/payments**
   - Salva pagamento completato nel DB
   - Aggiorna stato proforma a "PAID"

4. **POST /api/webhooks/stripe**
   - Riceve notifiche Stripe su pagamenti completati
   - Aggiorna automaticamente lo stato

## 💰 FLUSSO PAGAMENTO COMPLETO

```mermaid
1. Cliente riceve email proforma
   ↓
2. Click su link pagamento
   ↓
3. Apre pagamento.html?proformaId=XXX
   ↓
4. Carica chiave pubblica Stripe (GET /api/stripe-public-key)
   ↓
5. Mostra form Stripe Elements
   ↓
6. Cliente inserisce dati carta
   ↓
7. Click "Paga" → Crea Payment Intent (POST /api/create-payment-intent)
   ↓
8. Stripe processa pagamento
   ↓
9. Se successo → Salva nel DB (POST /api/payments)
   ↓
10. Webhook Stripe conferma (POST /api/webhooks/stripe)
   ↓
11. Email conferma pagamento al cliente
```

## 📝 CHECKLIST FINALE

- [ ] Account Stripe Medica GB creato e verificato
- [ ] Chiavi API recuperate (pk_test/live e sk_test/live)
- [ ] Variabili ambiente configurate su Cloudflare Pages
- [ ] Deploy eseguito dopo configurazione
- [ ] Test pagamento con carta test (4242...)
- [ ] Pagamento visibile su Stripe Dashboard
- [ ] Webhook configurato (opzionale)
- [ ] Test E2E completo (contratto → proforma → pagamento)

## 🆘 TROUBLESHOOTING

### **Errore: "No API key provided"**
- Verifica che `STRIPE_SECRET_KEY` sia configurata su Cloudflare
- Redeploy dopo aver aggiunto la variabile

### **Errore: "Invalid API Key"**
- Controlla che la chiave sia corretta (sk_test... o sk_live...)
- Verifica che sia per il mode corretto (test vs live)

### **Pagamento non appare su Stripe**
- Controlla che stai usando il mode corretto (test vs live)
- Verifica su Stripe Dashboard → Payments

### **Webhook non funziona**
- Verifica URL webhook: deve essere HTTPS
- Controlla che `STRIPE_WEBHOOK_SECRET` sia configurato
- Testa webhook su Stripe Dashboard → Webhooks → "Send test webhook"

## 📚 RISORSE

- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Stripe API Docs**: https://stripe.com/docs/api
- **Cloudflare Pages Env Vars**: https://developers.cloudflare.com/pages/configuration/env-vars/

---

**Data creazione**: 2026-03-03  
**Ultima modifica**: 2026-03-03  
**Versione sistema**: telemedcare-v12
