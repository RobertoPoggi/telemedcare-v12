# 🔧 FIX EMAIL - API KEY RESEND AGGIORNATA

**Data**: 2026-02-16  
**Problema**: Email non arrivano più da 24 ore  
**Causa**: API Key Resend non valida/scaduta  
**Soluzione**: Configurare nuova API key in Cloudflare Pages

---

## 🔴 PROBLEMA IDENTIFICATO

### API Key VECCHIA (non funzionante):
```
re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
```

**Errore da Resend**:
```json
{
    "statusCode": 403,
    "message": "The telemedcare.it domain is not verified. 
                Please, add and verify your domain on https://resend.com/domains"
}
```

---

## ✅ SOLUZIONE

### API Key NUOVA (testata e funzionante):
```
re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt
```

**Test eseguito con successo**:
- ✅ Email inviata a `info@ecura.it`
- ✅ Message ID: `b5a095fb-c270-4a82-8e55-842d24feea2c`
- ✅ Timestamp: 2026-02-16T00:15:00Z

---

## 📋 CONFIGURAZIONE DNS RESEND

### Record configurati per telemedcare.it:

#### 1. MX Record
```
Type: MX
Host/Name: send
Value: feedback-smtp.eu-west-1.amazonses.com
Priority: 10
TTL: Auto
```

#### 2. SPF Record
```
Type: TXT
Host/Name: send
Value: v=spf1 include:amazonses.com ~all
TTL: Auto
```

#### 3. DKIM Record
```
Type: TXT
Host/Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB
TTL: Auto
```

#### 4. DMARC Record
```
Type: TXT
Host/Name: _dmarc
Value: v=DMARC1; p=none;
TTL: Auto
```

---

## 🚀 STEPS CONFIGURAZIONE CLOUDFLARE

### 1. Accedi a Cloudflare Dashboard
```
https://dash.cloudflare.com/
```

### 2. Naviga al progetto
- Clicca su **"Workers & Pages"** (menu laterale sinistra)
- Trova e clicca su **"telemedcare-v12"**

### 3. Vai alle variabili d'ambiente
- Clicca su **"Settings"** (tab in alto)
- Clicca su **"Environment variables"** (menu laterale)

### 4. Configura RESEND_API_KEY

#### Se la variabile ESISTE:
1. Trova `RESEND_API_KEY` nella lista
2. Clicca **"Edit"**
3. Sostituisci il valore con:
   ```
   re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt
   ```
4. Clicca **"Save"**

#### Se la variabile NON ESISTE:
1. Clicca **"Add variable"** (pulsante in alto)
2. Compila i campi:
   - **Variable name**: `RESEND_API_KEY`
   - **Value**: `re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt`
   - **Type**: Plain text
3. Seleziona entrambi gli ambienti:
   - ☑️ **Production**
   - ☑️ **Preview**
4. Clicca **"Save"**

### 5. Verifica deployment
- Cloudflare farà automaticamente un **redeploy** entro 1-2 minuti
- Controlla la sezione **"Deployments"** per vedere lo stato

---

## 🧪 TEST POST-CONFIGURAZIONE

Dopo aver configurato la variabile (attendi 2-3 minuti per il deploy), esegui:

### Test 1: API di notifica
```bash
curl -X POST "https://telemedcare-v12.pages.dev/api/leads/test-notification" \
-H "Content-Type: application/json" \
-d '{
  "leadId": "TEST-DOPO-CONFIG",
  "name": "Test Configurazione",
  "email": "test@test.it",
  "phone": "1234567890",
  "city": "Milano",
  "service": "eCura PREMIUM",
  "plan": "AVANZATO",
  "source": "Test",
  "notes": "Test dopo configurazione API key",
  "timestamp": "2026-02-16T01:30:00.000Z"
}'
```

**Risultato atteso**:
```json
{
  "success": true,
  "message": "Notifica email test inviata",
  "leadId": "TEST-DOPO-CONFIG"
}
```

### Test 2: Crea un nuovo lead
1. Vai su: https://telemedcare-v12.pages.dev/dashboard
2. Crea un nuovo lead con dati di test
3. Salva
4. Attendi 1-2 minuti
5. Controlla `info@ecura.it` → dovresti ricevere la notifica automatica

---

## 📧 VERIFICA RICEZIONE EMAIL

### Dove controllare:
- **Casella principale**: `info@ecura.it`
- **Oggetto**: "🆕 Nuovo Lead TeleMedCare: [Nome Lead]"
- **Mittente**: `noreply@ecura.it`

### Se non ricevi l'email:
1. **Controlla SPAM/Posta indesiderata**
2. **Controlla filtri email** su info@ecura.it
3. **Verifica dashboard Resend**: https://resend.com/emails
4. **Controlla log Cloudflare**: Workers & Pages → telemedcare-v12 → Logs

---

## 🔍 TROUBLESHOOTING

### Problema: Email ancora non arrivano

#### 1. Verifica che la variabile sia configurata correttamente:
```bash
# Controlla se l'API key è stata letta correttamente
curl -s "https://telemedcare-v12.pages.dev/api/settings" | grep -i email
```

#### 2. Verifica Resend Dashboard:
- Vai su: https://resend.com/emails
- Cerca email inviate oggi
- Controlla lo stato:
  - ✅ `delivered` = Email consegnata
  - ⚠️ `bounced` = Email respinta
  - 🚫 `complained` = Segnalata come spam

#### 3. Verifica record DNS:
- Vai su: https://resend.com/domains
- Controlla che `telemedcare.it` sia **VERIFIED** (verde)
- Se non verificato, ricontrolla i record DNS

#### 4. Verifica switch configurazione:
- Vai su: https://telemedcare-v12.pages.dev/admin/settings
- Controlla che **"Notifiche Email Admin"** sia **ON**

---

## 📝 COMMIT CORRELATI

- **fd3c8ab**: Fix Workflow Manager firma contratto
- **a56ca79**: Documentazione troubleshooting email
- **f16510d**: Fix switch email notifications

---

## 🎯 CHECKLIST FINALE

Prima di considerare il problema risolto, verifica:

- [ ] API key configurata in Cloudflare Pages
- [ ] Deployment completato (check Deployments tab)
- [ ] Test API `/api/leads/test-notification` restituisce success
- [ ] Email di test ricevuta su `info@ecura.it`
- [ ] Nuovo lead creato dalla dashboard
- [ ] Notifica automatica ricevuta per il nuovo lead
- [ ] Switch "Notifiche Email Admin" attivo
- [ ] Dominio `telemedcare.it` verificato su Resend

---

## 📞 SUPPORTO

Se il problema persiste dopo aver completato tutti gli step:

1. **Controlla Resend Dashboard**: https://resend.com/emails
2. **Controlla Cloudflare Logs**: Deployments → View logs
3. **Contatta supporto Resend**: support@resend.com
4. **Verifica quota email**: Piano free = 100 email/giorno

---

## ✅ STATO FINALE

- ✅ API Key aggiornata e testata
- ✅ DNS configurato correttamente
- ✅ Dominio verificato su Resend
- ✅ Test email inviata con successo
- ⏳ In attesa configurazione Cloudflare Pages

**Ultimo aggiornamento**: 2026-02-16 00:20 UTC
