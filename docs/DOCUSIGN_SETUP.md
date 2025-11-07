# DocuSign Developer Setup Guide

## Step 1: Crea Account Developer

1. Vai su: https://go.docusign.com/o/sandbox/
2. Clicca su **"Get a Developer Account"**
3. Compila il form con:
   - Nome e Cognome
   - Email (usa rpoggi55@gmail.com)
   - Company: TeleMedCare / Medica GB
   - Country: Italy
4. Conferma email e completa registrazione

## Step 2: Accedi alla Developer Console

1. Login su: https://admindemo.docusign.com/
2. Vai su **Settings** → **Integrations** → **Apps and Keys**

## Step 3: Crea Integration Key

1. Clicca su **"Add App and Integration Key"**
2. Nome app: **TeleMedCare Contract Signature**
3. Annotati:
   - ✅ **Integration Key** (API Key / Client ID)
   - ✅ **Secret Key** (da generare)

## Step 4: Configura App Settings

### Authentication Method
- Seleziona: **Authorization Code Grant**

### Redirect URIs
Aggiungi questi URL:
```
https://telemedcare.it/api/docusign/callback
http://localhost:3001/api/docusign/callback
```

### Additional Settings
- **Signature Type**: Electronic
- **Allow impersonation**: ✅ Enabled
- **CORS enabled**: ✅ Yes

## Step 5: Ottieni User ID e Account ID

1. Vai su **Settings** → **Account**
2. Annotati:
   - ✅ **Account ID** (es: 12345678-abcd-1234-abcd-123456789abc)
   - ✅ **User ID** (es: 98765432-dcba-4321-dcba-987654321fed)
   - ✅ **Base URL**: `https://demo.docusign.net/restapi`

## Step 6: Genera Secret Key

1. Nella pagina **Apps and Keys**
2. Clicca su **"Add Secret Key"**
3. ⚠️ **IMPORTANTE**: Copia subito il Secret Key (non sarà più visibile!)

---

## 📋 Checklist Credenziali Necessarie

Una volta completato, avrai bisogno di:

```
✅ Integration Key (Client ID)
✅ Secret Key (Client Secret)  
✅ Account ID
✅ User ID
✅ Base URL: https://demo.docusign.net/restapi
```

---

## 🔐 Dove Inserire le Credenziali

Le credenziali vanno inserite in:

### 1. File `.dev.vars` (per sviluppo locale)
```env
DOCUSIGN_INTEGRATION_KEY="your_integration_key"
DOCUSIGN_SECRET_KEY="your_secret_key"
DOCUSIGN_ACCOUNT_ID="your_account_id"
DOCUSIGN_USER_ID="your_user_id"
DOCUSIGN_BASE_URL="https://demo.docusign.net/restapi"
```

### 2. Cloudflare Dashboard (per produzione)
- Workers & Pages → Settings → Environment Variables

---

## 🧪 Testing

Una volta configurato, testeremo:

1. ✅ Autenticazione OAuth
2. ✅ Creazione envelope
3. ✅ Invio documento per firma
4. ✅ Ricezione webhook
5. ✅ Download documento firmato

---

## 📞 Supporto

- DocuSign Developer Center: https://developers.docusign.com/
- API Reference: https://developers.docusign.com/docs/esign-rest-api/
- Support: https://support.docusign.com/

