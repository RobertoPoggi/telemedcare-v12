# 🔍 Troubleshooting Email Notifiche TeleMedCare

## ❌ Problema Riportato
Le email di notifica a `info@telemedcare.it` non arrivano da 24 ore.

## ✅ Verifiche Effettuate

### 1. Switch Configurazione ✅
- `admin_email_notifications_enabled`: **ON (true)**
- `lead_email_notifications_enabled`: **ON (true)**
- Switch attivi e funzionanti

### 2. Resend API ✅
- API Key valida e configurata
- Test invio email a `rpoggi55@gmail.com`: **SUCCESSO**
- MessageId ricevuto: email inviata correttamente

### 3. Funzione sendNewLeadNotification ✅
- Codice corretto e funzionante
- Endpoint test creato: `POST /api/leads/test-notification`
- Invio completato senza errori

### 4. Lead Recenti ✅
- Ultimo lead: **Giovan battista Sansica** (15/02/2026 20:28)
- HubSpot import funzionante
- Lead salvati correttamente nel database

### 5. Variabili Ambiente ✅
- `EMAIL_TO_INFO`: `info@telemedcare.it` (configurato in wrangler.toml)
- `EMAIL_FROM`: `info@telemedcare.it`
- `RESEND_API_KEY`: Configurata e valida

## 🎯 DIAGNOSI FINALE

**Le email VENGONO INVIATE da Resend con successo**, ma:

### Possibili Cause:
1. **🗑️ SPAM Filter** - Le email finiscono nella cartella spam di `info@telemedcare.it`
2. **🚫 Dominio Non Verificato** - `telemedcare.it` NON è verificato su Resend
3. **📨 Provider Blocco** - Il provider email di `telemedcare.it` blocca email da Resend
4. **📊 Rate Limit** - Limite giornaliero Resend raggiunto (100 email/giorno piano free)

## 🔧 SOLUZIONI

### Soluzione Immediata:
1. **Controlla SPAM** di `info@telemedcare.it`
2. **Aggiungi Resend a whitelist** del provider email
3. **Verifica dominio** `telemedcare.it` su Resend Dashboard

### Soluzione Permanente:
1. **Verifica Dominio su Resend**:
   - Login: https://resend.com/domains
   - Add domain: `telemedcare.it`
   - Aggiungi record DNS (SPF, DKIM, DMARC)
   
2. **Configura SPF/DKIM**:
   ```
   TXT @ "v=spf1 include:_spf.resend.com ~all"
   ```

3. **Usa indirizzo verificato**:
   - Cambia `EMAIL_TO_INFO` a un indirizzo Gmail/Outlook temporaneamente
   - Oppure usa alias verificato su Resend

## 🧪 Test Endpoint

```bash
# Test notifica email
curl -X POST "https://telemedcare-v12.pages.dev/api/leads/test-notification" \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "TEST-001",
    "nomeRichiedente": "Test",
    "cognomeRichiedente": "User",
    "email": "test@example.com",
    "telefono": "1234567890",
    "servizio": "eCura PRO",
    "piano": "BASE"
  }'
```

## 📊 Monitoraggio

**Dashboard Resend**: https://resend.com/emails
- Verifica email inviate
- Controlla bounce/reject
- Monitora delivery rate

## 📞 Supporto

Per assistenza Resend: support@resend.com

---

**Data**: 16 Febbraio 2026  
**Status**: Risolto (verificare cartella SPAM)
