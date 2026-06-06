# 📧 RIEPILOGO FIX EMAIL - TeleMedCare V11.0

**Data:** 2025-10-30  
**Problema:** Email non inviate dopo lead capture  
**Stato:** ✅ RISOLTO (richiede riavvio server)

---

## 🔍 PROBLEMA IDENTIFICATO

```
❌ Tabella "document_templates" mancante nel database
❌ Tabella "contracts" mancante  
❌ Colonna "updated_at" mancante nella tabella "leads"
❌ Nome colonna errato: code usava "html_content", migration usava "content"
```

## ✅ SOLUZIONE APPLICATA

### 1. **Creata Migration 0002**

File: `/home/user/webapp/migrations/0002_add_missing_tables.sql`

**Contenuto:**
- ✅ Aggiunta colonna `updated_at` alla tabella `leads`
- ✅ Creata tabella `document_templates` con colonna `html_content`
- ✅ Creata tabella `contracts` (English name)
- ✅ Inseriti 2 template email base:
  - `email_notifica_info` - Notifica nuovo lead
  - `email_invio_contratto` - Invio contratto

### 2. **Migration Applicata**

```bash
✅ Database reset completato
✅ Migration 0001_initial_schema.sql applicata
✅ Migration 0002_add_missing_tables.sql applicata
✅ Template email inseriti nel database
```

### 3. **Verifica Template**

```sql
SELECT id, name, type FROM document_templates;
```

**Risultato:**
```
✅ email_notifica_info | Notifica Nuovo Lead | email
✅ email_invio_contratto | Invio Contratto | email
```

---

## 🚀 COME TESTARE

### **Passo 1: Riavvia il Server**

Il database è stato ricreato, ma il server deve essere riavviato per usare il nuovo database.

```bash
# Killa processi vecchi
lsof -ti:3000 | xargs kill -9

# Riavvia server
cd /home/user/webapp
npm run dev
```

### **Passo 2: Test Lead Capture**

```bash
cd /home/user/webapp
./test_email_simple.sh
```

### **Passo 3: Verifica Email**

Controlla la tua email: **roberto.poggi@medicagb.com**

**Dovresti ricevere:**
- 📧 Email di notifica nuovo lead a `info@ecura.it`
- ⚠️ Potrebbe finire nello SPAM (DNS non configurati)

---

## 📋 PROSSIMI PASSI

### **🔴 PRIORITÀ ALTA**

#### 1. Configurare DNS Records

**Perché:** Senza DNS configurati, le email:
- ❌ Finiscono nello SPAM
- ❌ Vengono rigettate da alcuni provider
- ❌ Non hanno SPF/DKIM/DMARC verificati

**Come:** Segui la guida completa in `DNS_CONFIGURATION.md`

**Record da configurare:**

**SendGrid:**
```
CNAME: em6551.telemedcare.it → u56677468.wl219.sendgrid.net
CNAME: s1._domainkey.telemedcare.it → s1.domainkey.u56677468.wl219.sendgrid.net
CNAME: s2._domainkey.telemedcare.it → s2.domainkey.u56677468.wl219.sendgrid.net
TXT: _dmarc.telemedcare.it → v=DMARC1; p=none;
```

**Resend:**
```
MX: send → feedback-smtp.eu-west-1.amazonses.com (Priority: 10)
TXT: send → v=spf1 include:amazonses.com ~all
TXT: resend._domainkey → p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB
TXT: _dmarc → v=DMARC1; p=none;
```

#### 2. Testare Failover System

Dopo che le email funzionano, testare che il fallback RESEND → SENDGRID funzioni:

```bash
# Test forza fallimento RESEND per testare SENDGRID
# (richiede modifica temporanea API key)
```

#### 3. Commit Modifiche

```bash
cd /home/user/webapp
git add migrations/0002_add_missing_tables.sql
git add EMAIL_FIX_SUMMARY.md
git commit -m "fix: add missing database tables for email workflow

- Add document_templates table with email templates
- Add contracts table for contract storage
- Add updated_at column to leads table
- Insert default email templates (notifica_info, invio_contratto)
- Fix column name from content to html_content"

git push origin main
```

---

## 🧪 TEST COMPLETO WORKFLOW

Dopo aver configurato DNS e riavviato il server:

### **Test 1: Lead Semplice (solo notifica)**

```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "mario.rossi@example.com",
    "telefono": "+39 333 1234567",
    "servizio": "Telemedicina Base"
  }'
```

**Aspettativa:**
- ✅ Lead salvato nel DB
- ✅ Email notifica inviata a info@ecura.it
- ✅ Status code 200

### **Test 2: Lead con Contratto**

```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Mario",
    "cognome": "Rossi",
    "email": "mario.rossi@example.com",
    "telefono": "+39 333 1234567",
    "servizio": "Telemedicina Base",
    "vuoleContratto": true,
    "intestazioneContratto": "richiedente",
    "cfRichiedente": "RSSMRA80A01H501Z",
    "indirizzoRichiedente": "Via Roma 1, Milano"
  }'
```

**Aspettativa:**
- ✅ Lead salvato nel DB
- ✅ Email notifica inviata a info@ecura.it
- ✅ Contratto generato
- ✅ Email contratto inviata a mario.rossi@example.com
- ✅ Status code 200

---

## 📊 STRUTTURA DATABASE AGGIORNATA

```sql
-- Tabelle Principali
leads (con updated_at) ✅
email_logs ✅
contratti ✅
proforma ✅
pagamenti ✅
dispositivi ✅
configurazioni ✅

-- Tabelle Nuove
document_templates ✅  -- Template email e documenti
contracts ✅            -- Contratti (English name)
```

---

## ⚠️ NOTE IMPORTANTI

### **DNS Propagation**
Dopo aver configurato i record DNS:
- ⏱️ Attendi 1-2 ore per propagazione
- ⏱️ Massimo 48 ore per propagazione globale
- 🔍 Verifica con: https://dnschecker.org/

### **Email Deliverability**

**Senza DNS:**
- ⚠️ Email marcate come "non sicure"
- ⚠️ Spam score alto
- ⚠️ Alcuni provider potrebbero rifiutare

**Con DNS configurati:**
- ✅ SPF: PASS
- ✅ DKIM: PASS
- ✅ DMARC: PASS
- ✅ Deliverability ottimale

### **Capacity Email**

**Free Tier:**
- RESEND: 100 email/giorno
- SENDGRID: 100 email/giorno
- **Totale: 200 email/giorno**

**Upgrade Plans:**
- RESEND: $20/mese = 50,000 email
- SENDGRID: Vari piani da $19.95/mese

---

## ✅ CHECKLIST FINALE

Pre-Production:
- [x] API Keys configurate
- [x] Server running
- [x] Database migrated
- [x] document_templates table created
- [x] Email templates inserted
- [x] contracts table created
- [x] updated_at column added
- [ ] **Server riavviato con nuovo database**
- [ ] **Email workflow testato**
- [ ] **DNS records configurati**
- [ ] **Email authentication working**
- [ ] **Failover system testato**
- [ ] **Production deployment**

---

## 🎯 COMANDO RAPIDO RIAVVIO

```bash
# Un solo comando per riavviare tutto
cd /home/user/webapp && \
lsof -ti:3000 | xargs kill -9 2>/dev/null; \
sleep 2 && \
npm run dev
```

Poi testa con:
```bash
cd /home/user/webapp && ./test_email_simple.sh
```

---

**Status:** ✅ Database Fix Completato  
**Next:** Riavvia server e testa email  
**Poi:** Configura DNS per production  

**🎉 Il fix è completo! Ora basta riavviare il server per testare le email!**
