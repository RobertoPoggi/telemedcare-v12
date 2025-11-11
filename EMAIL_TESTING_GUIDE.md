# 📧 Guida Testing Email - TeleMedCare

## Problema: Non Vedo le Email Inviate

### Perché non vedo le email nella posta inviata di `info@telemedcare.it`?

Le email vengono inviate tramite **SendGrid** o **Resend** (servizi terzi), NON direttamente dalla casella `info@telemedcare.it`. 

Quindi:
- ❌ **Non appaiono** nella cartella "Posta Inviata" della tua casella
- ✅ **Vengono consegnate** agli indirizzi destinatari
- ✅ **Sono tracciabili** nelle dashboard di SendGrid/Resend

---

## ✅ Soluzioni per Verificare le Email

### **Soluzione 1: Usa la TUA Email per i Test** ⭐ (Implementata)

Ho aggiornato tutti i lead di test con `rpoggi55@gmail.com`:

```sql
-- Email ora puntano a rpoggi55@gmail.com
LEAD_TEST_001 - Mario Rossi
LEAD_TEST_002 - Giuseppe Verdi  
LEAD_TEST_003 - Anna Bianchi
LEAD_TEST_004 - Laura Ferrara
```

**Ora riceverai le email di test direttamente!**

---

### **Soluzione 2: Dashboard SendGrid** (Raccomandato per Production)

Accedi alla dashboard SendGrid per vedere tutte le email inviate:

1. **Login**: https://app.sendgrid.com/login
2. **Email Activity**: Activity → Email Activity
3. **Filtra per**:
   - From: `noreply@telemedcare.it`
   - Date: Today
   - Status: Delivered/Bounced/etc.

**Vantaggi**:
- ✅ Vedi TUTTE le email inviate
- ✅ Status di consegna (delivered, opened, clicked)
- ✅ Dettagli completi (timestamp, IP, user agent)
- ✅ Export CSV per report

---

### **Soluzione 3: Test Mode con Email Catch-All**

Per development, puoi usare servizi che catturano tutte le email:

#### **Opzione A: Mailtrap.io** (Consigliato per Dev)

```bash
# Installa Mailtrap per dev
npm install --save-dev nodemailer

# Configura in .dev.vars
MAILTRAP_HOST=smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_username
MAILTRAP_PASSWORD=your_password
```

**Vantaggi**:
- ✅ Cattura TUTTE le email (nessuna esce realmente)
- ✅ Inbox virtuale per ogni progetto
- ✅ Preview email con rendering HTML
- ✅ Gratuito fino a 500 email/mese

#### **Opzione B: MailHog** (Self-hosted)

```bash
# Installa localmente
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Poi configura EmailService per usare localhost:1025
```

---

### **Soluzione 4: Log nel Server** (Quick Debug)

Aggiungi logging dettagliato nel codice:

```typescript
// In EmailService
console.log('📧 EMAIL SENT:');
console.log('  To:', to);
console.log('  Template:', templateId);
console.log('  Subject:', subject);
console.log('  MessageId:', result.messageId);
```

Poi vedi i log:
```bash
tail -f /tmp/server.log | grep "📧"
```

---

## 🧪 Come Testare Email Ora

### **Test 1: Reinvia Email Proforma**

1. Vai alla dashboard: `/admin-dashboard`
2. Tab "Proforma"
3. Click icona viola 📧 "Reinvia Email" su `PFM_2025/0001`
4. Controlla `rpoggi55@gmail.com` → Dovresti ricevere l'email!

### **Test 2: Conferma Firma Contratto** (genera proforma automatica)

1. Tab "Contratti"
2. Click su contratto `CTR_2025/0002` (stato: INVIATO)
3. Click icona verde ✅ "Conferma Firma"
4. Inserisci tua email come admin
5. Click "Conferma Firma"
6. **Viene generata proforma automaticamente**
7. **Email inviata a** `rpoggi55@gmail.com`

### **Test 3: Crea Nuovo Lead dal Form Pubblico**

1. Vai a: `/richiesta-accesso`
2. Compila form con:
   - Nome/Cognome: Test Utente
   - **Email: rpoggi55@gmail.com** ← TUA EMAIL
   - Telefono: +39 333 1234567
   - Pacchetto: AVANZATO
3. Submit
4. Verifica email di conferma ricevuta

---

## 📊 Verifica Email nel Database

```bash
# Vedi tutte le email configurate
npx wrangler d1 execute telemedcare-leads --local --command="
SELECT 
    l.nomeRichiedente,
    l.cognomeRichiedente,
    l.emailRichiedente,
    l.status,
    (SELECT COUNT(*) FROM contracts WHERE lead_id = l.id) as num_contracts
FROM leads l
ORDER BY l.timestamp DESC
"
```

---

## 🔍 Troubleshooting Email

### Email non arriva?

**Check 1: Verifica API Keys**
```bash
# In .dev.vars
cat .dev.vars | grep -E "SENDGRID|RESEND"

# Dovrebbero esserci:
SENDGRID_API_KEY=SG.eRuQRryZRjiir_B6HkDmEg...
RESEND_API_KEY=re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
```

**Check 2: Verifica Logs Server**
```bash
tail -f /tmp/server.log | grep -E "📧|email|Email"
```

**Check 3: Verifica Stato SendGrid**
```bash
# Test API key
curl -X GET "https://api.sendgrid.com/v3/scopes" \
  -H "Authorization: Bearer $SENDGRID_API_KEY"
```

**Check 4: Spam/Junk Folder**
- Controlla cartella Spam in Gmail
- SendGrid potrebbe non avere dominio verificato
- Aggiungi `noreply@telemedcare.it` ai contatti

### Email arriva ma senza PDF?

**Problema**: PDF non salvato nel DB durante generazione proforma

**Soluzione**:
```bash
# Rigenera PDF per proforma esistente
# Click su "Reinvia Email" → rigenera e salva PDF
```

---

## 💡 Best Practices Production

### 1. **Verifica Dominio in SendGrid**

Per evitare email in Spam:
1. Vai su SendGrid → Settings → Sender Authentication
2. Verifica dominio `telemedcare.it`
3. Aggiungi record DNS (SPF, DKIM, DMARC)

### 2. **Email Template Testing**

Prima di inviare ai clienti, testa con:
- ✅ Tua email
- ✅ Email collega
- ✅ Gmail, Outlook, Apple Mail (rendering diverso)

### 3. **Monitoring**

Monitora giornalmente:
- Bounce rate (< 5%)
- Spam complaints (< 0.1%)
- Open rate (> 20%)
- Click rate (> 2%)

---

## 📝 Comandi Rapidi

```bash
# Aggiorna email di test con la tua
npx wrangler d1 execute telemedcare-leads --local --file=./update-test-emails.sql

# Backup dopo modifica
npm run db:backup

# Vedi log email in tempo reale
tail -f /tmp/server.log | grep "📧"

# Test API SendGrid
curl -X POST "https://api.sendgrid.com/v3/mail/send" \
  -H "Authorization: Bearer $SENDGRID_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "rpoggi55@gmail.com"}]}],
    "from": {"email": "noreply@telemedcare.it"},
    "subject": "Test Email",
    "content": [{"type": "text/plain", "value": "Test message"}]
  }'
```

---

## 🎯 Summary

**Problema**: Email inviate tramite SendGrid/Resend non appaiono in "Posta Inviata"

**Soluzione Implementata**:
- ✅ Tutti i lead di test ora usano `rpoggi55@gmail.com`
- ✅ Riceverai tutte le email di test direttamente
- ✅ Backup aggiornato salvato

**Per Verificare Email**:
1. Check inbox: `rpoggi55@gmail.com`
2. Check spam folder
3. Dashboard SendGrid: https://app.sendgrid.com/
4. Server logs: `tail -f /tmp/server.log`

---

**Ora puoi testare completamente il flusso email!** 📧✨
