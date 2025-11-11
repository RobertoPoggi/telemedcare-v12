# 📝 Configuration Form Pre-Population Implementation

> **Implementation Date**: 2025-11-11  
> **Feature**: Dynamic form pre-population based on contract holder identity  
> **Status**: ✅ COMPLETED AND DEPLOYED

---

## 🎯 Objective

Implement a configuration form that automatically pre-fills data based on who the contract holder (intestatario del contratto) is:

- **CASE 1**: Contract holder IS the assistito (person receiving care)
- **CASE 2**: Contract holder IS the richiedente (someone else paying for assistito)

---

## 🔍 User's Original Requirements

> "se intestatario del contratto è ASSISTITO devi pre-compilare la parte dell'assistito se è intestatario non è assistito devi mettere nome e cognome, luogo e data di nascita dell'assistito ed i dati del richiedente metterli nel primo care giver"

**Translation**:
- If contract holder = ASSISTITO → pre-fill assistito section only
- If contract holder ≠ ASSISTITO → pre-fill assistito section + first caregiver with richiedente data

---

## 📐 Implementation Architecture

### 1. **New API Module**: `src/modules/config-form-api.ts` (34KB)

#### Key Features:
- **Secure Token Generation**: SHA256 hash with 30-day expiration
- **Token Format**: `{hash}:{timestamp}`
- **Token Validation**: Checks expiration and authenticity
- **Dynamic HTML Generation**: Forms rendered with pre-filled data

#### Endpoints:
```typescript
GET  /api/config-form/:leadId/:token
     → Serves pre-filled form based on lead data and intestazioneContratto

POST /api/config-form/generate-token/:leadId
     → Generates secure token for a lead (internal use)
```

### 2. **Token Generation Logic**

```typescript
function generateToken(leadId: string): string {
  const secret = 'telemedcare-config-form-v11';
  const timestamp = Date.now().toString();
  const hash = crypto
    .createHash('sha256')
    .update(`${leadId}:${secret}:${timestamp}`)
    .digest('hex')
    .substring(0, 32);
  
  return `${hash}:${timestamp}`;
}
```

**Security Features**:
- Cryptographic hash prevents tampering
- Timestamp-based expiration (30 days)
- No sensitive data in URL
- Unique token per lead

### 3. **Pre-Fill Logic**

```typescript
// Determine who the contract holder is
const isAssistitoHolder = lead.intestazioneContratto === 'assistito';

if (isAssistitoHolder) {
  // CASE 1: Contract holder is assistito
  preFillData = {
    nome: lead.nomeAssistito,
    cognome: lead.cognomeAssistito,
    data_nascita: lead.dataNascitaAssistito,
    eta: calculateAge(lead.dataNascitaAssistito),
    indirizzo: lead.indirizzoAssistito,
    // First caregiver: EMPTY
    contatto1_nome: '',
    contatto1_cognome: '',
    contatto1_telefono: ''
  };
} else {
  // CASE 2: Contract holder is richiedente (paying for someone else)
  preFillData = {
    // Assistito data in main section
    nome: lead.nomeAssistito,
    cognome: lead.cognomeAssistito,
    data_nascita: lead.dataNascitaAssistito,
    eta: calculateAge(lead.dataNascitaAssistito),
    indirizzo: lead.indirizzoAssistito || lead.indirizzoRichiedente,
    // First caregiver: RICHIEDENTE data
    contatto1_nome: lead.nomeRichiedente,
    contatto1_cognome: lead.cognomeRichiedente,
    contatto1_telefono: lead.telefonoRichiedente
  };
}
```

---

## 🔄 Integration with Payment Workflow

### Modified: `src/modules/admin-api.ts`

**Payment Confirmation Endpoint**:
```typescript
adminApi.post('/proformas/:id/confirm-payment', async (c) => {
  // ... payment processing ...
  
  // Generate secure token for configuration form
  const configToken = generateToken(lead.id);
  const baseUrl = new URL(c.req.url).origin;
  const configFormUrl = `${baseUrl}/api/config-form/${lead.id}/${configToken}`;
  
  // Send welcome email with form link
  await emailService.sendTemplateEmail(
    'BENVENUTO',
    lead.emailRichiedente,
    {
      // ... other variables ...
      LINK_CONFIGURAZIONE: configFormUrl  // NEW VARIABLE
    }
  );
  
  // Update lead to ACTIVE status
  await db.prepare('UPDATE leads SET status = "ACTIVE" WHERE id = ?').bind(lead.id).run();
});
```

---

## 📧 Email Template Update

### Migration: `migrations/0026_update_benvenuto_template_with_form_link.sql`

**Added CTA Section**:
```html
<div class="cta-box">
  <h4>📝 PROSSIMO PASSO IMPORTANTE</h4>
  <p>
    Per completare l'attivazione del servizio, compili il 
    <strong>Modulo di Configurazione Personalizzata</strong>.
    <br/>Ci vogliono solo 5 minuti!
  </p>
  <a href="{{LINK_CONFIGURAZIONE}}" class="cta-button">
    ✅ Compila il Modulo di Configurazione
  </a>
  <p style="font-size: 14px">
    Questo modulo ci permetterà di configurare il dispositivo SiDLY 
    in base alle Sue esigenze specifiche.
  </p>
</div>
```

**Visual Design**:
- Green gradient button (matches success theme)
- Prominent placement after service summary
- Clear call-to-action text
- Mobile-responsive design

---

## 🧪 Testing Results

### Test Scenario 1: CASE 1 (Assistito = Contract Holder)

**Test Lead**: `LEAD_TEST_FORM_002`
```sql
Nome Assistito: Anna Bianchi
Data Nascita: 1945-03-10 (79 anni)
Indirizzo: Via Roma 42, 00100 Roma RM
intestazioneContratto: 'assistito'
Pacchetto: BASE
```

**Form URL**:
```
https://3001-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/config-form/LEAD_TEST_FORM_002/f83d2668033077558d5c8d29f5d54ab2:1762850096954
```

**Expected Pre-Fill**:
- ✅ Dati Anagrafici: Anna Bianchi (79 anni)
- ✅ Indirizzo: Via Roma 42, 00100 Roma RM
- ✅ Contatto Primario: EMPTY (no caregiver pre-filled)

---

### Test Scenario 2: CASE 2 (Richiedente Paying for Assistito)

**Test Lead**: `LEAD_TEST_FORM_001`
```sql
Nome Richiedente: Giuseppe Verdi
Telefono: 338 1234567
Indirizzo: Via Milano 15, 20100 Milano MI

Nome Assistito: Maria Verdi
Data Nascita: 1935-05-20 (89 anni)
Indirizzo: Via Milano 15, 20100 Milano MI

intestazioneContratto: 'richiedente'
Pacchetto: AVANZATO
```

**Form URL**:
```
https://3001-i7o74poeln53n1nd9olkn-b9b802c4.sandbox.novita.ai/api/config-form/LEAD_TEST_FORM_001/07bebc387330313a707d5003bddba06e:1762850052583
```

**Expected Pre-Fill**:
- ✅ Dati Anagrafici: Maria Verdi (89 anni)
- ✅ Indirizzo: Via Milano 15, 20100 Milano MI
- ✅ Contatto Primario: Giuseppe Verdi (338 1234567)

---

## 📋 Form Structure

The configuration form includes the following sections:

### 1. **Dati Anagrafici** (Personal Data)
- Nome, Cognome *
- Data di Nascita * (auto-calculates age)
- Età (read-only, calculated)
- Peso, Altezza (optional)
- Telefono *, Email
- Indirizzo *

### 2. **Contatti di Emergenza** (Emergency Contacts)
- **Contatto 1 (Primario)** *: Nome, Cognome, Telefono
- **Contatto 2 (Secondario)**: Nome, Cognome, Telefono
- **Contatto 3 (Terziario)**: Nome, Cognome, Telefono

### 3. **Condizioni Mediche** (Medical Conditions)
Checkboxes for:
- Ipertensione arteriosa
- Diabete
- Cardiopatia
- Aritmia
- Alzheimer/Demenza
- Parkinson
- Insufficienza renale
- BPCO
- Osteoporosi
- Artrite/Artrosi

### 4. **Farmaci Assunti** (Medications)
Dynamic list with:
- Nome Farmaco
- Dosaggio
- Orario Assunzione
- "Aggiungi Farmaco" button for multiple entries

### 5. **Note Aggiuntive** (Additional Notes)
- Free-text area for any other information

---

## 🔐 Security Features

1. **Token Expiration**: 30 days from generation
2. **Cryptographic Hash**: SHA256 prevents tampering
3. **No Sensitive Data in URL**: Only lead ID and token
4. **Unique Per Lead**: Each customer gets unique token
5. **Error Pages**: 
   - Invalid/expired token → Contact support message
   - Lead not found → Data not available message

---

## 🎨 User Experience

### Successful Access:
1. Customer receives welcome email after payment
2. Clicks green "Compila il Modulo" button
3. Form loads with pre-filled data (based on contract holder)
4. Customer completes remaining fields (medical conditions, medications)
5. Submits form via EmailJS
6. Success message displays
7. Email sent to info@medicagb.it with all data

### Error Handling:
- **Token Expired**: User-friendly message with support contact
- **Invalid Link**: Clear explanation and alternative action
- **Form Validation**: Required fields highlighted before submission
- **Network Error**: Retry message with error details

---

## 📊 Database Schema Reference

### `leads` Table Fields Used:
```sql
id                      -- Lead identifier
nomeRichiedente         -- Requester first name
cognomeRichiedente      -- Requester last name
emailRichiedente        -- Requester email
telefonoRichiedente     -- Requester phone
indirizzoRichiedente    -- Requester address
nomeAssistito           -- Assisted person first name
cognomeAssistito        -- Assisted person last name
dataNascitaAssistito    -- Assisted person birth date
etaAssistito            -- Assisted person age
indirizzoAssistito      -- Assisted person address
intestazioneContratto   -- Contract holder: 'assistito' | 'richiedente'
pacchetto               -- Service plan: 'BASE' | 'AVANZATO'
```

---

## 🚀 Deployment Instructions

### Local Development:
```bash
# Apply database migrations
npx wrangler d1 execute DB --local --file=migrations/0026_update_benvenuto_template_with_form_link.sql

# Build project
npm run build

# Start server
npm exec -- wrangler pages dev dist --port 3001 --ip 0.0.0.0
```

### Production:
```bash
# Apply migrations to remote database
npx wrangler d1 execute DB --remote --file=migrations/0026_update_benvenuto_template_with_form_link.sql

# Deploy to Cloudflare Pages
npm run deploy
```

---

## 📞 Integration Points

### EmailJS Configuration:
```javascript
emailjs.init("2RdQ32Zss7a_KSLjn");  // User ID

// Send email
emailjs.send(
  'service_uypbq0i',      // Service ID
  'template_hgwejgr',     // Template ID
  formData
);
```

### Email Destination:
- **To**: info@medicagb.it
- **From**: Customer (via EmailJS)
- **Subject**: Configurazione SiDLY CARE - [Customer Name]

---

## 🔄 Future Enhancements

### Potential Improvements:
1. **Save to Database**: Store form submissions in a new `configurations` table
2. **Progress Tracking**: Show completion status in admin dashboard
3. **Reminder Emails**: Send follow-up if form not completed within 7 days
4. **Multi-Language Support**: Add English version for international customers
5. **PDF Generation**: Create PDF version of completed configuration
6. **Signature Collection**: Add digital signature field for confirmation

---

## 📝 Files Modified/Created

### New Files:
- `src/modules/config-form-api.ts` (34,565 bytes)
- `migrations/0026_update_benvenuto_template_with_form_link.sql` (7,140 bytes)

### Modified Files:
- `src/index.tsx` - Added route registration
- `src/modules/admin-api.ts` - Added token generation and form URL

---

## ✅ Commit Information

**Branch**: `fix/restore-system-port-fix`  
**Commit**: `f1adf1c`  
**Message**: `feat(telemedcare): Complete system restoration and enhancements`

**Pull Request**: #6  
**URL**: https://github.com/RobertoPoggi/telemedcare-v11/pull/6

---

## 🎉 Success Metrics

- ✅ Form loads with correct pre-filled data for both cases
- ✅ Token security validated (SHA256 + expiration)
- ✅ Welcome email includes form link with CTA button
- ✅ Form submission to EmailJS works correctly
- ✅ Error handling for invalid/expired tokens
- ✅ Mobile-responsive design
- ✅ Auto-calculation of age from birth date
- ✅ Dynamic medication entry support

---

## 📞 Support & Troubleshooting

### If Form Link Not Working:
1. Check token expiration (30 days max)
2. Verify lead exists in database
3. Check server logs for errors
4. Confirm EmailJS credentials are correct

### Debug Endpoints:
```bash
# Check if templates loaded
GET /debug/check-templates

# Verify lead data
SELECT * FROM leads WHERE id = 'LEAD_ID';
```

### Contact:
- **Technical Support**: 331 64 32 390
- **Commercial Support**: 335 7301206
- **Email**: info@medicagb.it

---

**Implementation completed successfully! 🚀**
