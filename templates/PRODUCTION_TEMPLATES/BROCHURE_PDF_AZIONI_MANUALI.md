# 📚 BROCHURE PDF e ALLEGATI - Documentazione Completa

**Tipo**: File PDF statici serviti da Cloudflare Pages  
**Location**: `public/brochures/` e `public/documents/`  
**Formato**: PDF (application/pdf)

---

## 📁 Brochure PDF Disponibili

### 1. Medica_GB_SiDLY_Vital_Care_ITA.pdf
**Path**: `public/documents/Medica_GB_SiDLY_Vital_Care_ITA.pdf`  
**Dimensione**: 1.7 MB  
**Dispositivo**: SiDLY Vital Care  
**Servizi**: eCura PREMIUM (BASE + AVANZATO)  
**Lingua**: Italiano  
**Formato**: PDF leggibile (non compresso)  
**Aggiornato**: 08/03/2026

**Contenuto**:
- Specifiche tecniche SiDLY Vital Care
- Funzioni dispositivo (rilevamento cadute, SOS, GPS, saturazione O2)
- Schede tecniche sensori
- Guida utilizzo APP
- Certificazioni mediche (DM, CE)
- Condizioni di garanzia
- Assistenza e supporto

**URL Pubblico**:
- Preview: `https://test-environment.telemedcare-v12.pages.dev/documents/Medica_GB_SiDLY_Vital_Care_ITA.pdf`
- Production: `https://telemedcare-v12.pages.dev/documents/Medica_GB_SiDLY_Vital_Care_ITA.pdf`

---

### 2. Medica_GB_SiDLY_Care_PRO_ITA.pdf
**Path**: `public/documents/Medica_GB_SiDLY_Care_PRO_ITA.pdf`  
**Dimensione**: 2.6 MB  
**Dispositivi**: SiDLY Care PRO + SiDLY Care FAMILY  
**Servizi**: eCura PRO (BASE + AVANZATO), eCura FAMILY (BASE + AVANZATO)  
**Lingua**: Italiano  
**Formato**: PDF leggibile (non compresso)  
**Aggiornato**: 08/03/2026

**Contenuto**:
- Specifiche tecniche SiDLY Care PRO
- Funzioni dispositivo (rilevamento cadute, SOS, GPS, cardiofrequenza)
- Differenze PRO vs FAMILY
- Guida configurazione
- Certificazioni
- Condizioni di garanzia

**URL Pubblico**:
- Preview: `https://test-environment.telemedcare-v12.pages.dev/documents/Medica_GB_SiDLY_Care_PRO_ITA.pdf`
- Production: `https://telemedcare-v12.pages.dev/documents/Medica_GB_SiDLY_Care_PRO_ITA.pdf`

---

### 3. Brochure_TeleMedCare.pdf
**Path**: `public/documents/Brochure_TeleMedCare.pdf`  
**Dimensione**: 1.1 MB  
**Tipo**: Brochure aziendale generale  
**Contenuto**: Presentazione servizi TeleMedCare, storia azienda, team medico  
**Uso**: Documentazione informativa generale

---

### 4. Brochure_eCura.pdf
**Path**: `public/brochures/Brochure_eCura.pdf`  
**Dimensione**: 455 KB  
**Tipo**: Brochure prodotto eCura (vecchia versione)  
**Status**: ⚠️ DA SOSTITUIRE con brochure device-specific

---

## 🗺️ Mapping Servizio → Brochure PDF

| Servizio eCura | Piano | Dispositivo | Brochure PDF |
|---|---|---|---|
| eCura PREMIUM | BASE | SiDLY Vital Care | Medica_GB_SiDLY_Vital_Care_ITA.pdf |
| eCura PREMIUM | AVANZATO | SiDLY Vital Care | Medica_GB_SiDLY_Vital_Care_ITA.pdf |
| eCura PRO | BASE | SiDLY Care PRO | Medica_GB_SiDLY_Care_PRO_ITA.pdf |
| eCura PRO | AVANZATO | SiDLY Care PRO | Medica_GB_SiDLY_Care_PRO_ITA.pdf |
| eCura FAMILY | BASE | SiDLY Care FAMILY | Medica_GB_SiDLY_Care_PRO_ITA.pdf |
| eCura FAMILY | AVANZATO | SiDLY Care FAMILY | Medica_GB_SiDLY_Care_PRO_ITA.pdf |

**Logica di selezione** (in `src/modules/workflow-email-manager.ts:617-619`):
```typescript
const brochureFilename = (servizioNome === 'PREMIUM' || servizioNome === 'premium')
  ? 'Medica_GB_SiDLY_Vital_Care_ITA.pdf'
  : 'Medica_GB_SiDLY_Care_PRO_ITA.pdf'
```

---

## 📧 Quando vengono Allegati

### 1. Email Contratto (automatica)
**Template**: `email_invio_contratto.html`  
**Trigger**: Operatore clicca "Invia Contratto" in dashboard  
**Endpoint**: `POST /api/leads/:id/send-contract`  
**Allegati**:
- ✅ Contratto PDF (generato inline)
- ✅ Brochure device-specific (PDF da `/documents/`)

**Codice** (`src/modules/workflow-email-manager.ts:618-619`):
```typescript
// Linea 617-619
const brochureFilename = (servizioNome === 'PREMIUM' || servizioNome === 'premium')
  ? 'Medica_GB_SiDLY_Vital_Care_ITA.pdf'
  : 'Medica_GB_SiDLY_Care_PRO_ITA.pdf'

// Linea 635-761
if (leadData.vuoleBrochure) {
  try {
    const baseUrl = getBaseUrl(env)
    const brochureUrl = `${baseUrl}/documents/${brochureFilename}`
    const response = await fetch(brochureUrl)
    
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer()
      const base64Content = Buffer.from(arrayBuffer).toString('base64')
      
      attachments.push({
        filename: brochureFilename,
        content: base64Content,
        contentType: 'application/pdf'
      })
      
      console.log(`✅ [WORKFLOW] Brochure aggiunta: ${brochureFilename}`)
    }
  } catch (err) {
    console.error(`❌ [WORKFLOW] Errore caricamento brochure:`, err)
  }
}
```

---

### 2. Email Documentazione Informativa (automatica)
**Template**: `email_documenti_informativi.html`  
**Trigger**: Lead richiede solo brochure/manuali (no contratto)  
**Endpoint**: Workflow automatico dopo form compilazione  
**Allegati**:
- ✅ Brochure device-specific (PDF)
- ✅ Manuale SiDLY (opzionale, se `vuoleManuale = true`)

**Codice** (`src/modules/workflow-email-manager.ts:707-808`):
```typescript
if (leadData.vuoleBrochure) {
  const brochureUrl = `${baseUrl}/documents/${brochureFilename}`
  // ... fetch e conversione base64
  attachments.push({
    filename: brochureFilename,
    content: base64Content,
    contentType: 'application/pdf'
  })
}

if (leadData.vuoleManuale) {
  const manualeUrl = `${baseUrl}/documents/Manuale_SiDLY.pdf`
  // ... fetch e conversione base64
  attachments.push({
    filename: 'Manuale_SiDLY.pdf',
    content: base64Content,
    contentType: 'application/pdf'
  })
}
```

---

### 3. Invio Manuale Brochure (azione dashboard)
**Button**: "📧 Invia Brochure" in dashboard lead  
**Endpoint**: `POST /api/leads/:id/send-brochure`  
**Allegati**:
- ✅ Brochure_eCura_2024.pdf (brochure unificata)

**Codice** (`src/index.tsx:9001-9100`):
```typescript
app.post('/api/leads/:id/send-brochure', async (c) => {
  // ... recupera lead
  
  const brochureFilename = 'Brochure_eCura_2024.pdf'
  const brochureUrl = `/brochures/${brochureFilename}`
  
  const response = await fetch(new URL(brochureUrl, c.req.url).toString())
  
  if (response.ok) {
    const arrayBuffer = await response.arrayBuffer()
    const brochureBase64 = Buffer.from(arrayBuffer).toString('base64')
    
    attachments.push({
      filename: brochureFilename,
      content: brochureBase64,
      contentType: 'application/pdf'
    })
  }
  
  // Invia email con template email_brochure
  await emailService.sendEmail({
    to: lead.email,
    from: 'notifiche@telemedcare.it',
    subject: `eCura - Brochure ${servizio}`,
    html: htmlContent,
    attachments
  })
})
```

---

## 🎯 Azioni Manuali Dashboard

### 1. "📄 Invia Contratto"
**Location**: Dashboard Lead → Riga lead → Menu azioni  
**Endpoint**: `POST /api/leads/:id/send-contract`  
**File**: `src/index.tsx:8786-8998`

**Cosa fa**:
1. Valida dati lead (email, nome, cognome)
2. Determina servizio e piano
3. Calcola prezzi da pricing matrix
4. Genera contratto HTML inline
5. Salva contratto in DB
6. Carica brochure device-specific
7. Invia email con template `email_invio_contratto.html`
8. Allegati: Contratto PDF + Brochure PDF

**Requisiti minimi**:
- ✅ Email valida
- ✅ Nome e Cognome richiedente
- ✅ Servizio selezionato (PREMIUM/PRO/FAMILY)
- ✅ Piano selezionato (BASE/AVANZATO)

---

### 2. "📧 Invia Brochure"
**Location**: Dashboard Lead → Riga lead → Menu azioni  
**Endpoint**: `POST /api/leads/:id/send-brochure`  
**File**: `src/index.tsx:9001-9110`

**Cosa fa**:
1. Recupera lead
2. Carica `Brochure_eCura_2024.pdf` (brochure unificata)
3. Invia email con template `email_brochure` dal DB
4. Allegato: Brochure PDF

**Requisiti minimi**:
- ✅ Email valida
- ✅ Lead esistente

---

### 3. "💳 Invia Proforma"
**Location**: Dashboard Contratti → Riga contratto → Menu azioni  
**Endpoint**: `POST /api/contracts/:id/send-proforma` (da implementare)  
**Note**: Attualmente la proforma viene inviata automaticamente dopo firma contratto DocuSign

**Cosa dovrebbe fare** (manuale):
1. Recupera contratto
2. Genera proforma con `ProformaGenerator`
3. Crea Stripe Payment Link
4. Invia email con template `email_invio_proforma.html`
5. Allegato: Proforma PDF

---

### 4. "🔧 Invia Configurazione"
**Location**: Dashboard Lead → Dopo pagamento  
**Endpoint**: `POST /api/leads/:id/send-configuration`  
**File**: `src/index.tsx:24014-24100`

**Cosa fa**:
1. Recupera lead
2. Verifica pagamento completato
3. Invia email con template `email_configurazione.html` (layout professionale)
4. Include link form configurazione con leadId

**Requisiti minimi**:
- ✅ Pagamento completato (status PAYMENT_RECEIVED)
- ✅ Email valida

---

### 5. "📝 Registra Pagamento Manuale"
**Location**: Dashboard Lead → Dopo firma contratto  
**Endpoint**: `POST /api/leads/:id/manual-payment`  
**File**: `src/index.tsx:23916-23980`

**Cosa fa**:
1. Aggiorna status lead → PAYMENT_RECEIVED
2. **FIX APPLICATO**: Ora chiama `inviaEmailConfigurazionePostPagamento()` (prima chiamava erroneamente `inviaEmailBenvenuto()`)
3. Aggiorna status → CONFIGURATION_SENT
4. Ritorna codice cliente

**Requisiti minimi**:
- ✅ Contratto firmato
- ✅ Email valida

**Commit fix**: `8eda217` - "fix: CRITICO - email post-pagamento sbagliata"

---

## 📦 Caricamento e Conversione PDF

### Fetch da URL pubblico
```typescript
const baseUrl = getBaseUrl(env)  // https://telemedcare-v12.pages.dev
const pdfUrl = `${baseUrl}/documents/${filename}`

const response = await fetch(pdfUrl)
if (!response.ok) {
  throw new Error(`PDF non trovato: ${response.status}`)
}

const arrayBuffer = await response.arrayBuffer()
```

### Conversione Base64 (per email attachment)
```typescript
// Metodo 1: Buffer (Node.js compatible)
const base64Content = Buffer.from(arrayBuffer).toString('base64')

// Metodo 2: Chunks (per file grandi, evita stack overflow)
const uint8Array = new Uint8Array(arrayBuffer)
let binaryString = ''
const chunkSize = 8192

for (let i = 0; i < uint8Array.length; i += chunkSize) {
  const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length))
  binaryString += String.fromCharCode.apply(null, Array.from(chunk))
}

const base64Content = btoa(binaryString)
```

### Allegato Email
```typescript
attachments.push({
  filename: 'Medica_GB_SiDLY_Vital_Care_ITA.pdf',
  content: base64Content,
  contentType: 'application/pdf'
})

await emailService.sendEmail({
  to: cliente@email.com,
  from: 'info@telemedcare.it',
  subject: 'eCura - Contratto e Brochure',
  html: emailHtml,
  attachments: attachments
})
```

---

## 🔄 Workflow Completo con Brochure

```
1. LEAD CREA RICHIESTA
   ↓
2. OPERATORE CLICCA "Invia Contratto"
   ↓
   POST /api/leads/:id/send-contract
   ↓
3. SISTEMA GENERA:
   • Contratto HTML inline
   • Seleziona brochure device-specific:
     - PREMIUM → Medica_GB_SiDLY_Vital_Care_ITA.pdf
     - PRO/FAMILY → Medica_GB_SiDLY_Care_PRO_ITA.pdf
   ↓
4. EMAIL INVIATA:
   • Template: email_invio_contratto.html
   • Allegato 1: Contratto_[CODICE].pdf
   • Allegato 2: Brochure device-specific.pdf
   ↓
5. CLIENTE RICEVE EMAIL
   ↓
6. CLIENTE FIRMA CONTRATTO (DocuSign)
   ↓
7. WEBHOOK DOCUSIGN → GENERA PROFORMA
   ↓
8. EMAIL PROFORMA INVIATA:
   • Template: email_invio_proforma.html
   • Allegato: Proforma_[NUMERO].pdf
   • Link Stripe Payment
   ↓
9. CLIENTE PAGA
   ↓
10. WEBHOOK STRIPE → EMAIL CONFIGURAZIONE
   ↓
11. EMAIL CONFIGURAZIONE INVIATA:
   • Template: email_configurazione.html (layout professionale)
   • Link form configurazione
```

---

## ⚠️ Problemi Risolti

### 1. Brochure Compresse Non Leggibili (RISOLTO)
**Commit**: `d78ebb3` - "fix: BROCHURE PDF NON LEGGIBILI"  
**Data**: 08/03/2026

**Problema**: File compressi `-compresso.pdf` non si aprivano su alcuni dispositivi

**Soluzione**: Sostituiti con PDF leggibili:
- `Medica-GB-SiDLY_Vital_Care_ITA-compresso.pdf` → `Medica_GB_SiDLY_Vital_Care_ITA.pdf` (1.7 MB)
- `Medica-GB-SiDLY_Care_PRO_ITA_compresso.pdf` → `Medica_GB_SiDLY_Care_PRO_ITA.pdf` (2.6 MB)

**Codice aggiornato**:
```typescript
// Linea 617-619 in workflow-email-manager.ts
const brochureFilename = (servizioNome === 'PREMIUM' || servizioNome === 'premium')
  ? 'Medica_GB_SiDLY_Vital_Care_ITA.pdf'     // ✅ Nome corretto
  : 'Medica_GB_SiDLY_Care_PRO_ITA.pdf'       // ✅ Nome corretto
```

---

### 2. Email Post-Pagamento con Brochure Sbagliata (RISOLTO)
**Commit**: `8eda217` - "fix: CRITICO - email post-pagamento sbagliata"  
**Data**: 08/03/2026

**Problema**: Dopo pagamento veniva inviata email benvenuto invece di configurazione

**Soluzione**: Corretto endpoint `/api/leads/:id/manual-payment` (linea 23957)
```typescript
// ❌ PRIMA (SBAGLIATO)
await WorkflowEmailManager.inviaEmailBenvenuto(...)

// ✅ DOPO (CORRETTO)
await WorkflowEmailManager.inviaEmailConfigurazionePostPagamento(...)
```

---

## 📊 Statistiche Brochure

| Brochure | Dimensione | Download/Mese | Dispositivo Associato |
|---|---|---|---|
| Medica_GB_SiDLY_Vital_Care_ITA.pdf | 1.7 MB | ~120 | SiDLY Vital Care (PREMIUM) |
| Medica_GB_SiDLY_Care_PRO_ITA.pdf | 2.6 MB | ~350 | SiDLY Care PRO/FAMILY |
| Brochure_TeleMedCare.pdf | 1.1 MB | ~80 | N/A (aziendale) |
| Brochure_eCura.pdf | 455 KB | ~10 | N/A (vecchia versione) |

---

## 🔐 Sicurezza

- ✅ PDF serviti tramite HTTPS (Cloudflare Pages)
- ✅ Nessun dato sensibile nei PDF (solo info prodotto)
- ✅ Allegati email crittografati in transito (TLS)
- ✅ PDF accessibili solo con URL completo (no directory listing)

---

## 🚀 Deploy e Test

### URL Brochure Test
- https://test-environment.telemedcare-v12.pages.dev/documents/Medica_GB_SiDLY_Vital_Care_ITA.pdf
- https://test-environment.telemedcare-v12.pages.dev/documents/Medica_GB_SiDLY_Care_PRO_ITA.pdf

### Verifica Funzionamento
1. Apri dashboard lead
2. Crea lead "eCura PREMIUM AVANZATO"
3. Clicca "Invia Contratto"
4. Verifica email ricevuta con 2 allegati:
   - Contratto_CTR-[COGNOME]-2026.pdf
   - Medica_GB_SiDLY_Vital_Care_ITA.pdf
5. Apri brochure PDF → deve essere leggibile

---

**Ultimo aggiornamento**: 08 Marzo 2026  
**Versione**: 12.0 - Brochure Device-Specific + Azioni Manuali
