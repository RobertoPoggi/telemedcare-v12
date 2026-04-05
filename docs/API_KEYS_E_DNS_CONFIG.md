# 🔐 API KEYS E CONFIGURAZIONE DNS - TeleMedCare V12.0

**Data**: 2024-12-26  
**Status**: ✅ KEYS RECEIVED - READY FOR CONFIGURATION

---

## 🔑 API KEYS RICEVUTE

### **SendGrid**
```
API Key: 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
Token: aLaQtlW5sxgfAGow9u7zt5asZ0PedDiK0aOjDSgw
Status: ✅ READY
```

### **Resend**
```
API Key 1: re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
API Key 2: re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt
Status: ✅ READY (usare API Key 1)
```

---

## 📋 DNS RECORDS - SendGrid Domain Authentication

### **Records da aggiungere al DNS di telemedcare.it**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SENDGRID AUTHENTICATION RECORDS                                         │
├──────┬───────────────────────────────┬────────────────────────────────┤
│ Type │ Host                          │ Value                          │
├──────┼───────────────────────────────┼────────────────────────────────┤
│ CNAME│ em6551.telemedcare.it         │ u56677468.wl219.sendgrid.net   │
│ CNAME│ s1._domainkey.telemedcare.it  │ s1.domainkey.u56677468...      │
│ CNAME│ s2._domainkey.telemedcare.it  │ s2.domainkey.u56677468...      │
│ TXT  │ _dmarc.telemedcare.it         │ v=DMARC1; p=none;              │
└──────┴───────────────────────────────┴────────────────────────────────┘
```

**Dettagli completi**:
```
Record 1:
Type: CNAME
Host: em6551.telemedcare.it
Value: u56677468.wl219.sendgrid.net
TTL: Auto/3600

Record 2:
Type: CNAME
Host: s1._domainkey.telemedcare.it
Value: s1.domainkey.u56677468.wl219.sendgrid.net
TTL: Auto/3600

Record 3:
Type: CNAME
Host: s2._domainkey.telemedcare.it
Value: s2.domainkey.u56677468.wl219.sendgrid.net
TTL: Auto/3600

Record 4:
Type: TXT
Host: _dmarc.telemedcare.it
Value: v=DMARC1; p=none;
TTL: Auto/3600
```

---

## 📋 DNS RECORDS - Resend Domain Authentication

### **Records da aggiungere al DNS di telemedcare.it**

```
┌─────────────────────────────────────────────────────────────────────────┐
│ RESEND AUTHENTICATION RECORDS                                           │
├──────┬───────────────────────────────┬────────────────────────────────┤
│ Type │ Host / Name                   │ Value                          │
├──────┼───────────────────────────────┼────────────────────────────────┤
│ MX   │ send                          │ feedback-smtp.eu-west-1...     │
│ TXT  │ send                          │ v=spf1 include:amazonses...    │
│ TXT  │ resend._domainkey             │ p=MIGfMA0GCSqGSIb3DQEBA...    │
│ TXT  │ _dmarc                        │ v=DMARC1; p=none;              │
└──────┴───────────────────────────────┴────────────────────────────────┘
```

**Dettagli completi**:
```
Record 1 - MX:
Type: MX
Host: send
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: Auto/3600

Record 2 - SPF:
Type: TXT
Host: send
Value: v=spf1 include:amazonses.com ~all
TTL: Auto/3600

Record 3 - DKIM:
Type: TXT
Host: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB
TTL: Auto/3600

Record 4 - DMARC:
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none;
TTL: Auto/3600
```

---

## 🎯 CLOUDFLARE PAGES - ENVIRONMENT VARIABLES

### **Variabili da configurare**

```bash
# Email Service Keys
SENDGRID_API_KEY=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
RESEND_API_KEY=re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2

# Email Configuration
EMAIL_FROM=info@telemedcare.it
EMAIL_TO_INFO=info@telemedcare.it

# Security Keys (generate random 32+ character strings)
JWT_SECRET=TeleMedCare_V12_JWT_Secret_2024_$(openssl rand -hex 16)
ENCRYPTION_KEY=TeleMedCare_V12_Encryption_Key_2024_$(openssl rand -hex 16)
```

---

## 🔧 CONFIGURAZIONE CLOUDFLARE PAGES

### **Procedura Step-by-Step**

1. **Vai su Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com/
   - Login con il tuo account

2. **Seleziona Workers & Pages**
   - Nel menu laterale: **Workers & Pages**
   - Cerca: **telemedcare-v12**
   - Clicca sul progetto

3. **Vai su Settings**
   - Tab: **Settings**
   - Scroll: **Environment Variables**

4. **Aggiungi le variabili** (clicca "Add variable" per ognuna)

```
Variable 1:
Name: SENDGRID_API_KEY
Value: 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
Environment: Production
[Save]

Variable 2:
Name: RESEND_API_KEY
Value: re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
Environment: Production
[Save]

Variable 3:
Name: EMAIL_FROM
Value: info@telemedcare.it
Environment: Production
[Save]

Variable 4:
Name: EMAIL_TO_INFO
Value: info@telemedcare.it
Environment: Production
[Save]

Variable 5:
Name: JWT_SECRET
Value: TeleMedCare_V12_JWT_Secret_2024_RANDOM_STRING_HERE
Environment: Production
[Save]

Variable 6:
Name: ENCRYPTION_KEY
Value: TeleMedCare_V12_Encryption_Key_2024_RANDOM_STRING_HERE
Environment: Production
[Save]
```

---

## 🌐 CONFIGURAZIONE DNS

### **Dove aggiungere i DNS records**

**Opzione A: DNS gestito da Cloudflare**
1. Dashboard Cloudflare > **telemedcare.it**
2. Tab: **DNS** > **Records**
3. Clicca: **Add record**
4. Aggiungi tutti i record SendGrid e Resend sopra
5. Clicca: **Save**

**Opzione B: DNS gestito da altro provider**
1. Accedi al pannello del tuo provider DNS
2. Vai su: DNS Management per telemedcare.it
3. Aggiungi i record uno per uno
4. Salva le modifiche

---

## ✅ VERIFICA CONFIGURAZIONE

### **1. Verifica Environment Variables**
```
Dashboard Cloudflare Pages > telemedcare-v12 > Settings > Environment Variables

Dovresti vedere:
✅ SENDGRID_API_KEY (Production)
✅ RESEND_API_KEY (Production)
✅ EMAIL_FROM (Production)
✅ EMAIL_TO_INFO (Production)
✅ JWT_SECRET (Production)
✅ ENCRYPTION_KEY (Production)
```

### **2. Verifica DNS Records (dopo propagazione)**

**SendGrid**:
```bash
# Verifica CNAME
dig em6551.telemedcare.it CNAME
dig s1._domainkey.telemedcare.it CNAME
dig s2._domainkey.telemedcare.it CNAME

# Verifica DMARC
dig _dmarc.telemedcare.it TXT
```

**Resend**:
```bash
# Verifica MX
dig send.telemedcare.it MX

# Verifica SPF
dig send.telemedcare.it TXT

# Verifica DKIM
dig resend._domainkey.telemedcare.it TXT
```

### **3. Verifica Authentication su SendGrid**
1. Vai su: https://app.sendgrid.com/
2. Settings > Sender Authentication
3. Verifica che telemedcare.it sia **Verified** ✅

### **4. Verifica Authentication su Resend**
1. Vai su: https://resend.com/
2. Settings > Domains
3. Verifica che telemedcare.it sia **Verified** ✅

---

## 🧪 TEST INVIO EMAIL

### **Test 1: Da Dashboard**
```
1. Vai su: https://telemedcare-v12.pages.dev/admin/leads-dashboard
2. Clicca pulsante BLU (contratto) su un lead
3. Conferma invio
4. Verifica email ricevuta su info@telemedcare.it
```

### **Test 2: API diretta**
```bash
# Test invio contratto
curl -X POST https://telemedcare-v12.pages.dev/api/leads/LEAD-EXCEL-001/send-contract \
  -H "Content-Type: application/json" \
  -d '{"tipoContratto": "BASE"}'

# Test invio brochure
curl -X POST https://telemedcare-v12.pages.dev/api/leads/LEAD-EXCEL-001/send-brochure \
  -H "Content-Type: application/json"
```

### **Test 3: Verifica Log**
```
Dashboard Cloudflare Pages > telemedcare-v12 > Logs

Cerca:
✅ "Email inviata con successo"
✅ "Template: email_invio_contratto"
❌ "Errore invio email" (non dovrebbe esserci)
```

---

## ⏱️ TIMELINE VERIFICA DOMINIO

```
Immediato (0-5 min):
- Environment Variables attive ✅
- Applicazione può usare le API keys ✅

DNS Propagazione (15 min - 48 ore):
- 15 minuti: Alcuni DNS vedono i record
- 2-4 ore: Maggior parte dei DNS aggiornati
- 24-48 ore: Propagazione globale completa

Verifica SendGrid/Resend (dopo DNS):
- SendGrid: Auto-check ogni ora
- Resend: Auto-check ogni 30 minuti
- Manuale: Puoi forzare verifica dal dashboard
```

---

## 🚨 TROUBLESHOOTING

### **Email non inviate**
```
Problema: Email fallisce
Soluzione:
1. Verifica API keys su Cloudflare Pages
2. Verifica dominio verificato su SendGrid/Resend
3. Guarda logs Cloudflare per errori
4. Prova entrambi i provider (SendGrid e Resend)
```

### **Dominio non verificato**
```
Problema: SendGrid/Resend dice "Not Verified"
Soluzione:
1. Controlla DNS records aggiunti correttamente
2. Attendi 15-30 minuti per propagazione
3. Forza refresh verifica dal dashboard
4. Usa tool online: whatsmydns.net
```

### **Environment Variables non attive**
```
Problema: Variabili non visibili all'app
Soluzione:
1. Ricontrolla Environment: Production (non Preview)
2. Fai un nuovo deploy (trigger automatico)
3. Attendi 2-3 minuti per reload
```

---

## 📊 CHECKLIST FINALE

### **Configurazione Cloudflare Pages**
- [ ] SENDGRID_API_KEY configurata
- [ ] RESEND_API_KEY configurata
- [ ] EMAIL_FROM configurata
- [ ] EMAIL_TO_INFO configurata
- [ ] JWT_SECRET generata e configurata
- [ ] ENCRYPTION_KEY generata e configurata

### **DNS Records SendGrid**
- [ ] CNAME em6551.telemedcare.it
- [ ] CNAME s1._domainkey.telemedcare.it
- [ ] CNAME s2._domainkey.telemedcare.it
- [ ] TXT _dmarc.telemedcare.it

### **DNS Records Resend**
- [ ] MX send
- [ ] TXT send (SPF)
- [ ] TXT resend._domainkey (DKIM)
- [ ] TXT _dmarc

### **Verifica**
- [ ] DNS propagati (15+ min)
- [ ] SendGrid dominio verificato
- [ ] Resend dominio verificato
- [ ] Test invio email OK

---

## 🎉 CONFIGURAZIONE COMPLETA

Dopo aver completato tutti gli step sopra:

✅ **API Keys**: Configurate su Cloudflare Pages  
✅ **DNS Records**: Aggiunti al provider DNS  
✅ **Domini**: Verificati su SendGrid e Resend  
✅ **Sistema**: Pronto per invio email da info@telemedcare.it  

**Il sistema TeleMedCare V12.0 sarà 100% operativo!**

---

**IMPORTANTE**: Conserva questo file in un luogo sicuro. Contiene tutte le API keys e configurazioni necessarie per il sistema email.

---

**Data creazione**: 2024-12-26  
**Ultimo aggiornamento**: 2024-12-26 20:20  
**Status**: ✅ KEYS RECEIVED - READY FOR CONFIGURATION
