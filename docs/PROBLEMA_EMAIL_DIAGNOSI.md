# 🚨 DIAGNOSI PROBLEMA EMAIL - Non arriva nulla

**Data**: 02 Gennaio 2026 - 20:10  
**Stato**: ❌ Email NON vengono inviate (modalità DEMO attiva)

---

## 🔍 **PROBLEMA IDENTIFICATO**

Il sistema TeleMedCare ha un meccanismo di fallback:

1. **Prova SendGrid** → FALLISCE ⚠️
2. **Prova Resend** → FALLISCE ⚠️  
3. **Attiva modalità DEMO** → Ritorna `success: true` MA **non invia email** ❌

**Risultato**: Le email sembrano inviate (success=true) ma **NON vengono recapitate**.

---

## 🔧 **SOLUZIONE**

### **URGENTE: Configurare API Keys valide su Cloudflare Pages**

#### **Passo 1: Vai su Cloudflare Dashboard**

1. Apri: https://dash.cloudflare.com/
2. Workers & Pages → **telemedcare-v12**
3. **Settings** → **Environment variables**

#### **Passo 2: Verifica quali provider email hai**

**Opzione A: Resend (Raccomandato - più facile)**
- Se hai account Resend: https://resend.com/
- Crea una API key su Resend Dashboard
- Aggiungi environment variable:
  ```
  RESEND_API_KEY = re_YOUR_REAL_API_KEY_HERE
  ```
- **IMPORTANTE**: Verifica che il dominio `telemedcare.it` sia verificato su Resend

**Opzione B: SendGrid**
- Se hai account SendGrid: https://sendgrid.com/
- Crea una API key su SendGrid Dashboard  
- Aggiungi environment variable:
  ```
  SENDGRID_API_KEY = SG.YOUR_REAL_API_KEY_HERE
  ```
- **IMPORTANTE**: Verifica che il dominio `telemedcare.it` sia verificato su SendGrid

#### **Passo 3: Verifica dominio email**

**CRITICO**: Sia Resend che SendGrid richiedono che verifichi il dominio `telemedcare.it`:

1. Aggiungi record DNS:
   - **SPF**: `v=spf1 include:_spf.resend.com ~all`
   - **DKIM**: Record fornito dal provider
   - **DMARC**: `v=DMARC1; p=none;`

2. Verifica dominio sul provider (Resend/SendGrid dashboard)

---

## 🧪 **COME TESTARE**

Dopo aver configurato le API keys:

### **Test 1: Endpoint di test diretto**
```bash
curl -X POST https://telemedcare-v12.pages.dev/api/admin/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"rpoggi55@gmail.com"}'
```

**Risultato atteso:**
```json
{
  "success": true,
  "messageId": "resend-abc123" // o "sendgrid-xyz789"
}
```

⚠️ Se vedi `"messageId": "DEMO_..."` → API key ancora non funziona!

### **Test 2: Inserimento lead completo**
```bash
curl -X POST https://telemedcare-v12.pages.dev/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Test",
    "cognomeRichiedente": "Email",
    "email": "rpoggi55@gmail.com",
    "telefono": "+39 320 1234567",
    "nomeAssistito": "Assistito",
    "cognomeAssistito": "Test",
    "servizio": "eCura PRO",
    "piano": "BASE",
    "vuoleBrochure": "Si",
    "vuoleContratto": "No",
    "canale": "Test"
  }'
```

**Dovresti ricevere:**
- ✅ 1 email con brochure a `rpoggi55@gmail.com`
- ✅ 1 email di notifica a `info@telemedcare.it`

---

## 📊 **STATO ATTUALE SISTEMA**

| Componente | Stato | Note |
|---|---|---|
| ✅ Database | FUNZIONA | Template email creati |
| ✅ Workflow | FUNZIONA | Logica invio corretta |
| ✅ Template | FUNZIONA | HTML email OK |
| ⚠️ SendGrid | **API KEY NON VALIDA** | Fallisce sempre |
| ⚠️ Resend | **API KEY NON VALIDA** | Fallisce sempre |
| ❌ Email | **MODALITÀ DEMO** | Nessuna email inviata |

---

## 🔐 **API KEYS ATTUALI**

### **Nel codice (email-service.ts):**

```typescript
// SendGrid
const apiKey = env?.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY

// Resend (HARDCODED FALLBACK)
const apiKey = env?.RESEND_API_KEY || 're_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2'
```

**Problema**: La key Resend hardcoded (`re_QeeK2km4...`) è probabilmente:
- ❌ Scaduta
- ❌ Non autorizzata per `telemedcare.it`
- ❌ Key di test non valida per produzione

---

## ✅ **SOLUZIONE IMMEDIATA**

### **Opzione 1: Usa Resend (più facile)**

1. Crea account su https://resend.com/ (gratis fino a 3000 email/mese)
2. Verifica dominio `telemedcare.it`
3. Crea API key
4. Aggiungi su Cloudflare:
   - Variable name: `RESEND_API_KEY`
   - Value: `re_XXXXXXXXXXXX`
5. Test: chiama endpoint test-email

### **Opzione 2: Usa SendGrid**

1. Crea account su https://sendgrid.com/ (gratis fino a 100 email/giorno)
2. Verifica dominio `telemedcare.it`  
3. Crea API key con permessi "Mail Send"
4. Aggiungi su Cloudflare:
   - Variable name: `SENDGRID_API_KEY`
   - Value: `SG.XXXXXXXXXXXX`
5. Test: chiama endpoint test-email

---

## 📝 **CHECKLIST COMPLETA**

- [ ] Crea account Resend o SendGrid
- [ ] Verifica dominio `telemedcare.it` sul provider
- [ ] Crea API key
- [ ] Aggiungi API key su Cloudflare Pages → Environment variables
- [ ] Redeploy automatico (Cloudflare lo fa quando modifichi env vars)
- [ ] Test con `/api/admin/test-email`
- [ ] Verifica email arrivata a `rpoggi55@gmail.com`
- [ ] Test completo con inserimento lead
- [ ] Verifica 2 email (notifica + brochure)

---

## ⏰ **TEMPO STIMATO**

- **Configurazione Resend**: 10-15 minuti
- **Configurazione SendGrid**: 15-20 minuti
- **Verifica dominio DNS**: 5-30 minuti (propagazione)
- **Test completo**: 5 minuti

**Totale**: ~30-60 minuti

---

## 🆘 **SE SERVE AIUTO**

1. Crea account Resend: https://resend.com/signup
2. Dashboard → Domains → Add Domain → `telemedcare.it`
3. Aggiungi record DNS forniti da Resend
4. Dashboard → API Keys → Create API Key → Copia
5. Cloudflare → telemedcare-v12 → Settings → Environment variables → Add variable
6. Name: `RESEND_API_KEY`, Value: incolla chiave
7. Save
8. Attendi 30 secondi (redeploy automatico)
9. Test: `/api/admin/test-email`

---

## 📧 **ENDPOINT UTILI**

- **Test email**: `POST /api/admin/test-email`
- **Migrations**: `POST /api/admin/run-migrations`
- **Nuovo lead**: `POST /api/leads`

---

**Ultimo aggiornamento**: 02 Gennaio 2026 - 20:15  
**Commit**: c4531d3
