# 🚀 Setup Sandbox Ad Alte Prestazioni - TeleMedCare V11.0

## ⚡ **ISTRUZIONI POST-MIGRAZIONE**

Dopo aver importato il progetto nella **Sandbox ad Alte Prestazioni**:

### **1. 🔧 Setup Iniziale**
```bash
# Verifica che il progetto sia importato correttamente
cd /home/user/webapp
ls -la

# Installa dipendenze (dovrebbero essere più veloci!)
npm install

# Verifica git status
git status
```

### **2. 🔐 Configurazione Environment Variables**
```bash
# Crea file environment locali dai template
cp .env.example .env
cp .dev.vars.example .dev.vars

# IMPORTANTE: Modifica con le API keys reali
nano .dev.vars
```

**Aggiungi le API keys reali:**
```bash
SENDGRID_API_KEY=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
RESEND_API_KEY=re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
EMAIL_FROM=noreply@telemedcare.it
EMAIL_TO_INFO=info@telemedcare.it
```

### **3. 🏗️ Build e Test**
```bash
# Build del progetto (dovrebbe essere più veloce!)
npm run build

# Avvia con PM2
pm2 start ecosystem.config.cjs

# Test API
curl http://localhost:3000/api/data/dashboard
```

### **4. 📧 Test Email Service**
```bash
# Test invio email reale
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Test Sandbox Performance",
    "email": "test@performance.it", 
    "telefono": "+39 123 456 7890",
    "servizio": "AVANZATO",
    "privacy": true,
    "source": "SANDBOX_PERFORMANCE_TEST"
  }'
```

### **5. 🌐 Accesso Pubblico**
```bash
# Ottieni URL pubblico per test
# (Usa GetServiceUrl tool se disponibile)
```

## ⚡ **VANTAGGI ATTESI NELLE PERFORMANCE**

### **Build Times** 📈
- **Prima:** ~3-4 secondi
- **Dopo:** ~1-2 secondi ⚡

### **npm install** 📈  
- **Prima:** ~30-60 secondi
- **Dopo:** ~10-20 secondi ⚡

### **Hot Reload** 📈
- **Prima:** 500-1000ms
- **Dopo:** 100-300ms ⚡

### **Database Operations** 📈
- **Prima:** Query D1 standard
- **Dopo:** Connessioni più veloci ⚡

## 🧪 **TEST PERFORMANCE CONSIGLIATI**

### **Test 1: Build Speed**
```bash
time npm run build
```

### **Test 2: Server Startup**
```bash
time (pm2 delete all; pm2 start ecosystem.config.cjs)
```

### **Test 3: API Response**
```bash
# Test 10 richieste consecutive
for i in {1..10}; do
  time curl -s http://localhost:3000/api/data/dashboard > /dev/null
done
```

## 🚀 **WORKFLOW OTTIMIZZATO**

Con la sandbox potenziata, il workflow diventa:
1. **Modifica codice** ⚡ Hot reload ultra-veloce
2. **Test immediato** ⚡ Response time ridotti
3. **Build rapido** ⚡ Compilazione accelerata
4. **Deploy veloce** ⚡ Upload ottimizzato

## 📊 **MONITORAGGIO PERFORMANCE**

```bash
# CPU Usage
top -p $(pgrep node)

# Memory Usage  
free -h

# Disk I/O
iostat -x 1 5

# Network
ss -tuln | grep 3000
```

## 🔧 **TROUBLESHOOTING COMUNE**

### **Problema: Environment variables non funzionano**
```bash
# Verifica file .dev.vars
cat .dev.vars

# Test con Wrangler
npx wrangler pages dev dist --local
```

### **Problema: Database non risponde**
```bash
# Reset database locale
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply webapp-production --local
```

### **Problema: Port occupato**
```bash
# Kill port 3000
fuser -k 3000/tcp
pm2 delete all
```

---
**Data creazione:** $(date '+%Y-%m-%d %H:%M')  
**Versione:** TeleMedCare V11.0 Performance Enhanced  
**Tipo:** Sandbox ad Alte Prestazioni BETA PLUS