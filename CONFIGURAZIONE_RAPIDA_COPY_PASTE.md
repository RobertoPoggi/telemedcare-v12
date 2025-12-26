# ⚡ CONFIGURAZIONE RAPIDA - COPY-PASTE

**TeleMedCare V12.0 - Environment Variables per Cloudflare Pages**

---

## 🎯 ISTRUZIONI

1. Vai su: https://dash.cloudflare.com/
2. Workers & Pages > **telemedcare-v12** > **Settings**
3. Scroll: **Environment Variables**
4. Clicca: **Add variable**
5. Copia-incolla le variabili sotto **UNA PER UNA**
6. Seleziona: **Production**
7. Clicca: **Save**

---

## 📋 VARIABILI (Copy-Paste Ready)

### Variable 1/6: SENDGRID_API_KEY
```
Name: SENDGRID_API_KEY
Value: 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
Environment: Production
```

### Variable 2/6: RESEND_API_KEY
```
Name: RESEND_API_KEY
Value: re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
Environment: Production
```

### Variable 3/6: EMAIL_FROM
```
Name: EMAIL_FROM
Value: info@telemedcare.it
Environment: Production
```

### Variable 4/6: EMAIL_TO_INFO
```
Name: EMAIL_TO_INFO
Value: info@telemedcare.it
Environment: Production
```

### Variable 5/6: JWT_SECRET
```
Name: JWT_SECRET
Value: f8adfd1d3ab5f1bcacdb0c09e9eca0904146790112eb3f375516380e75adc534
Environment: Production
```

### Variable 6/6: ENCRYPTION_KEY
```
Name: ENCRYPTION_KEY
Value: 492109618a5df3abe44c7086e4983cd776393457381a776bd3c51de67b7573cd
Environment: Production
```

---

## 🌐 DNS RECORDS - SendGrid (Copy-Paste Ready)

**Vai su tuo DNS Manager (Cloudflare/altro) per telemedcare.it**

### Record 1/4: CNAME em6551
```
Type: CNAME
Name: em6551
Value: u56677468.wl219.sendgrid.net
TTL: Auto (o 3600)
```

### Record 2/4: CNAME s1._domainkey
```
Type: CNAME
Name: s1._domainkey
Value: s1.domainkey.u56677468.wl219.sendgrid.net
TTL: Auto (o 3600)
```

### Record 3/4: CNAME s2._domainkey
```
Type: CNAME
Name: s2._domainkey
Value: s2.domainkey.u56677468.wl219.sendgrid.net
TTL: Auto (o 3600)
```

### Record 4/4: TXT _dmarc
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
TTL: Auto (o 3600)
```

---

## 🌐 DNS RECORDS - Resend (Copy-Paste Ready)

### Record 1/4: MX send
```
Type: MX
Name: send
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: Auto (o 3600)
```

### Record 2/4: TXT send (SPF)
```
Type: TXT
Name: send
Value: v=spf1 include:amazonses.com ~all
TTL: Auto (o 3600)
```

### Record 3/4: TXT resend._domainkey (DKIM)
```
Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB
TTL: Auto (o 3600)
```

### Record 4/4: TXT _dmarc
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none;
TTL: Auto (o 3600)
```

---

## ✅ CHECKLIST

### Cloudflare Pages Environment Variables
- [ ] SENDGRID_API_KEY ✓
- [ ] RESEND_API_KEY ✓
- [ ] EMAIL_FROM ✓
- [ ] EMAIL_TO_INFO ✓
- [ ] JWT_SECRET ✓
- [ ] ENCRYPTION_KEY ✓

### DNS Records SendGrid (4 records)
- [ ] CNAME em6551
- [ ] CNAME s1._domainkey
- [ ] CNAME s2._domainkey
- [ ] TXT _dmarc

### DNS Records Resend (4 records)
- [ ] MX send
- [ ] TXT send (SPF)
- [ ] TXT resend._domainkey (DKIM)
- [ ] TXT _dmarc

### Verifica
- [ ] Environment Variables salvate su Cloudflare
- [ ] DNS records aggiunti
- [ ] Attesi 15-30 min per DNS propagazione
- [ ] Verificato dominio su SendGrid
- [ ] Verificato dominio su Resend
- [ ] Testato invio email

---

## 🧪 TEST RAPIDO

Dopo aver configurato tutto, testa con:

```bash
# Test API
curl -X POST https://telemedcare-v12.pages.dev/api/leads/LEAD-EXCEL-001/send-contract \
  -H "Content-Type: application/json" \
  -d '{"tipoContratto": "BASE"}'
```

Oppure:
1. Vai su: https://telemedcare-v12.pages.dev/admin/leads-dashboard
2. Clicca pulsante BLU su un lead
3. Conferma invio contratto
4. Controlla email su info@telemedcare.it

---

## ⏱️ TIMELINE

```
✅ ORA:      Configura Environment Variables (5 min)
✅ ORA:      Aggiungi DNS records (10 min)
⏳ +15 min:  DNS propagazione iniziata
⏳ +2 ore:   DNS propagati globalmente
✅ +2 ore:   Verifica domini su SendGrid/Resend
✅ +2 ore:   Test invio email
```

---

**TUTTO PRONTO! Basta copiare e incollare le configurazioni sopra.**

**Data**: 2024-12-26 20:22  
**Status**: ✅ READY FOR CONFIGURATION
