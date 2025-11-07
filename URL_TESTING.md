# 🌐 URL Testing - TeleMedCare V11

## ✅ **LANDING PAGE ATTIVA E FUNZIONANTE**

---

## 🚀 **URL PRINCIPALE**

### **Landing Page Pubblica**
```
https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/
```

**Status:** ✅ ONLINE (HTTP 200)  
**Response Time:** ~200ms  
**Server:** Cloudflare Workerd + Wrangler Dev

---

## 📍 **ENDPOINTS DISPONIBILI**

### **🏠 Homepage / Landing Page**
```
https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/
```
- Form acquisizione lead
- Informazioni servizi TeleMedCare
- Sezioni: Hero, Servizi, Prezzi, Contact

### **📧 API Lead Submission**
```bash
# Test invio lead
curl -X POST https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mario Rossi",
    "email": "mario.rossi@test.it",
    "telefono": "+39 333 1234567",
    "servizio": "AVANZATO",
    "privacy": true,
    "source": "TEST_LANDING_PAGE"
  }'
```

**Response attesa:**
```json
{
  "success": true,
  "message": "Lead acquisito con successo",
  "leadId": "uuid",
  "emailSent": true
}
```

### **📊 API Dashboard Data**
```bash
# Test dati dashboard
curl https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/api/data/dashboard
```

**Response attesa:**
```json
{
  "leads": [...],
  "stats": {...},
  "recentActivity": [...]
}
```

### **🔍 API Health Check**
```bash
# Verifica stato sistema
curl https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/api/health
```

---

## 🧪 **TEST SCENARIOS**

### **Test 1: Visualizza Landing Page**
**Azione:** Apri nel browser:
```
https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/
```

**Verifica:**
- ✅ Pagina si carica correttamente
- ✅ Form contatto visibile
- ✅ Sezioni servizi presenti
- ✅ Layout responsive

### **Test 2: Submit Form Lead**
**Azione:** Compila il form sulla landing page con:
- Nome: Test User
- Email: test@example.com
- Telefono: +39 333 1234567
- Servizio: AVANZATO
- ✅ Privacy accettata

**Verifica:**
- ✅ Form inviato con successo
- ✅ Messaggio di conferma visualizzato
- ✅ Email ricevuta (controlla inbox)
- ✅ Lead salvato in database

### **Test 3: API Direct Call**
**Azione:** Esegui da terminale:
```bash
curl -X POST https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test API",
    "email": "testapi@telemedcare.it",
    "telefono": "+39 333 9999999",
    "servizio": "BASE",
    "privacy": true,
    "source": "API_TEST"
  }'
```

**Verifica:**
- ✅ Response JSON con `success: true`
- ✅ Lead ID generato
- ✅ Email inviata

### **Test 4: Dashboard Data**
**Azione:** 
```bash
curl https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/api/data/dashboard
```

**Verifica:**
- ✅ Response JSON con array leads
- ✅ Statistiche presenti
- ✅ Dati recenti visibili

### **Test 5: Performance Test**
**Azione:**
```bash
# Test 10 richieste consecutive
for i in {1..10}; do
  time curl -s https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/ > /dev/null
done
```

**Verifica:**
- ✅ Tutte le richieste completate
- ✅ Tempo medio < 500ms
- ✅ Nessun errore 5xx

---

## 📧 **TEST EMAIL WORKFLOW**

### **Prerequisiti Email**
⚠️ **IMPORTANTE:** Per testare l'invio email reale, assicurati di avere configurato:

```bash
# File: .dev.vars
SENDGRID_API_KEY=SG.your-real-key
RESEND_API_KEY=re_your-real-key
EMAIL_FROM=noreply@telemedcare.it
EMAIL_TO_INFO=info@telemedcare.it
```

### **Test Email Completo**
```bash
cd /home/user/webapp

# Test con script dedicato
./test_email_simple.sh

# Oppure test workflow completo
./test_complete_workflow.py
```

---

## 🔍 **DEBUGGING**

### **Verifica Server Status**
```bash
# Check se server è attivo
ps aux | grep wrangler

# Check porta 3000
lsof -i :3000

# Log in tempo reale
cd /home/user/webapp
tail -f ~/.config/.wrangler/logs/*.log
```

### **Riavvio Server**
```bash
# Se il server non risponde
cd /home/user/webapp

# Kill processi esistenti
pkill -f wrangler
pkill -f workerd

# Riavvia
npm run dev
```

### **Check Database D1**
```bash
cd /home/user/webapp

# Lista tabelle
npx wrangler d1 execute telemedcare-leads --local --command "SELECT name FROM sqlite_master WHERE type='table'"

# Vedi ultimi lead
npx wrangler d1 execute telemedcare-leads --local --command "SELECT * FROM leads ORDER BY created_at DESC LIMIT 5"
```

---

## 📱 **TEST DA DISPOSITIVI MOBILE**

### **Accesso da Smartphone/Tablet**
L'URL �� accessibile pubblicamente:
```
https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/
```

**Test:**
- ✅ Layout responsive
- ✅ Form utilizzabile su mobile
- ✅ Touch interactions funzionanti
- ✅ Performance accettabile

---

## 🌐 **CONDIVISIONE URL**

### **Per Colleghi/Stakeholder**
Condividi questo URL per test:
```
🔗 Landing Page TeleMedCare V11 (TEST)
https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/

⚠️ Ambiente di sviluppo - Non usare per produzione
```

### **Per Test A/B o Demo**
Crea varianti URL con parametri:
```bash
# Tracking source
https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/?utm_source=test&utm_medium=demo

# Pre-fill form (se implementato)
https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/?servizio=PREMIUM
```

---

## 📊 **MONITORING**

### **Check Performance**
```bash
# Response time test
curl -w "@-" -o /dev/null -s https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/ <<'EOF'
    time_namelookup:  %{time_namelookup}s\n
       time_connect:  %{time_connect}s\n
    time_appconnect:  %{time_appconnect}s\n
   time_pretransfer:  %{time_pretransfer}s\n
      time_redirect:  %{time_redirect}s\n
 time_starttransfer:  %{time_starttransfer}s\n
                    ----------\n
         time_total:  %{time_total}s\n
EOF
```

### **Uptime Check**
```bash
# Script uptime monitoring
while true; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/)
  echo "$(date '+%Y-%m-%d %H:%M:%S') - Status: $STATUS"
  sleep 60
done
```

---

## 🚨 **TROUBLESHOOTING**

### **Problema: URL non risponde**
```bash
# 1. Verifica server
ps aux | grep wrangler

# 2. Riavvia server
cd /home/user/webapp
pkill -f wrangler
npm run dev

# 3. Attendi 10 secondi
sleep 10

# 4. Test
curl https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/
```

### **Problema: Form non invia**
```bash
# Check browser console per errori CORS
# Check network tab per request failure

# Test API direttamente
curl -X POST https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/api/lead \
  -H "Content-Type: application/json" \
  -d '{"nome":"Test","email":"test@test.it","telefono":"+39 333 1111111","servizio":"BASE","privacy":true}'
```

### **Problema: Email non arriva**
```bash
# 1. Verifica API keys
cat .dev.vars | grep API_KEY

# 2. Test email service
./test_email_simple.sh

# 3. Check logs email
tail -100 ~/.config/.wrangler/logs/*.log | grep -i email
```

---

## 📋 **CHECKLIST TEST COMPLETO**

### **Pre-Launch Testing**
- [ ] Landing page carica correttamente
- [ ] Form visibile e usabile
- [ ] Tutti i campi form funzionanti
- [ ] Validazione form corretta
- [ ] Submit form funziona
- [ ] API lead creation OK
- [ ] Email notifica inviata
- [ ] Email ricevuta in inbox
- [ ] Lead salvato in database
- [ ] Dashboard mostra nuovo lead
- [ ] Performance < 500ms
- [ ] Responsive su mobile
- [ ] Nessun errore console
- [ ] HTTPS funzionante
- [ ] API keys configurate

---

## 🎯 **QUICK TEST COMMAND**

### **Test All-in-One**
```bash
#!/bin/bash
echo "=== TeleMedCare V11 - Quick Test ==="
echo ""

echo "1️⃣ Homepage Test..."
curl -s -o /dev/null -w "Status: %{http_code} - Time: %{time_total}s\n" \
  https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/

echo ""
echo "2️⃣ API Health Test..."
curl -s https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/api/health | head -20

echo ""
echo "3️⃣ Lead Submission Test..."
curl -X POST https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Quick Test",
    "email": "quicktest@telemedcare.it",
    "telefono": "+39 333 0000000",
    "servizio": "BASE",
    "privacy": true,
    "source": "QUICK_TEST_SCRIPT"
  }' | jq

echo ""
echo "✅ Test completati!"
```

---

## 📞 **SUPPORTO**

### **In caso di problemi:**

1. **Check documentazione:** 
   - `AMBIENTE_SVILUPPO_GITHUB.md`
   - `QUICK_START_DEVELOPER.md`

2. **Usa helper script:**
   ```bash
   cd /home/user/webapp
   ./git-helper.sh
   ```

3. **Riavvia ambiente:**
   ```bash
   cd /home/user/webapp
   pkill -f wrangler
   npm run dev
   ```

---

## 🎉 **INIZIA I TEST!**

### **URL Principale:**
```
🔗 https://3000-is9eg9jt4pg5xa9c7p8v0-c81df28e.sandbox.novita.ai/
```

**Status:** ✅ ONLINE e PRONTO per i test!

---

**Creato:** 2025-11-07  
**Progetto:** TeleMedCare V11.0  
**Ambiente:** Sandbox High Performance  
**Server:** Cloudflare Workerd (Local Dev)
