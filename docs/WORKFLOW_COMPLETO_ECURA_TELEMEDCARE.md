# 🔄 WORKFLOW COMPLETO eCURA / TELEMEDCARE V12
## Mappa Dettagliata: Acquisizione Lead → Attivazione Servizio → Gestione Cliente

**Data creazione:** 2026-02-04  
**Versione:** 1.0  
**Sistema:** TeleMedCare V12 - Cloudflare + D1 Database  

---

## 📋 INDICE

1. [Overview Workflow](#1-overview-workflow)
2. [Canali Acquisizione Lead](#2-canali-acquisizione-lead)
3. [Flusso Operativo Completo](#3-flusso-operativo-completo)
4. [Template e Documenti per Step](#4-template-e-documenti-per-step)
5. [Automazioni e Switch](#5-automazioni-e-switch)
6. [Database e Integrazioni](#6-database-e-integrazioni)
7. [Timeline e SLA](#7-timeline-e-sla)
8. [Checklist Operativa](#8-checklist-operativa)

---

## 1. OVERVIEW WORKFLOW

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                    WORKFLOW COMPLETO eCURA / TELEMEDCARE                       ║
╚════════════════════════════════════════════════════════════════════════════════╝

FASE 1: ACQUISIZIONE                    FASE 2: CONTRATTUALIZZAZIONE
┌─────────────────────────┐             ┌─────────────────────────┐
│ CANALI LEAD             │             │ COMPLETAMENTO DATI       │
│ • LP eCura              │────────────>│ Form dinamico email      │
│ • Partner (IRBEMA)      │             └────────────┬─────────────┘
│ • Partner (AON)         │                          │
│ • Partner (DoubleYou)   │                          v
│ • Welfare aziendale     │             ┌─────────────────────────┐
│ • Vigilanza             │             │ CONTRATTO UNIFICATO      │
│ • Sito web              │             │ Template eCura + PH      │
│ • Networking            │             └────────────┬─────────────┘
│ • Altri canali          │                          │
└─────────────────────────┘                          v
                                        ┌─────────────────────────┐
                                        │ FIRMA ELETTRONICA        │
                                        │ Canvas signature         │
                                        └────────────┬─────────────┘
                                                     │
                                                     v
                                        ┌─────────────────────────┐
                                        │ PROFORMA UNIFICATA       │
                                        │ Template eCura + PH      │
                                        └────────────┬─────────────┘
                                                     │
                                                     v
FASE 3: PAGAMENTO E ATTIVAZIONE         ┌─────────────────────────┐
┌─────────────────────────┐             │ PAGAMENTO STRIPE         │
│ STRIPE CHECKOUT         │<────────────│ Link payment             │
└────────────┬─────────────┘             └─────────────────────────┘
             │
             v
┌─────────────────────────┐
│ CONFIGURAZIONE          │
│ DISPOSITIVO             │
│ Form specifico          │
└────────────┬─────────────┘
             │
             v
┌─────────────────────────┐
│ DDT (Documento          │
│ di Trasporto)           │
└────────────┬─────────────┘
             │
             v
┌─────────────────────────┐
│ CREAZIONE ASSISTITO     │
│ Anagrafica completa     │
└────────────┬─────────────┘
             │
             v
┌─────────────────────────┐
│ AVVIO SERVIZIO          │
│ TeleAssistenza          │
└────────────┬─────────────┘
             │
             v
FASE 4: GESTIONE AMMINISTRATIVA
┌─────────────────────────┐
│ FATTURA                 │
│ Email commercialista    │
│ Proforma → SDI          │
└────────────┬─────────────┘
             │
             v
┌─────────────────────────┐
│ REMINDERS               │
│ Check-in, supporto      │
└────────────┬─────────────┘
             │
             v (dopo 12 mesi)
┌─────────────────────────┐
│ RINNOVO SERVIZIO        │
│ Proforma rinnovo        │
└─────────────────────────┘
```

---

## 2. CANALI ACQUISIZIONE LEAD

### 2.1 Canali Digitali

| **Canale** | **Tipo** | **URL/Entry Point** | **Tracking** | **Endpoint API** | **Codice Fonte** |
|-----------|---------|---------------------|-------------|-----------------|----------------|
| **Landing Page eCura** | Web | `https://www.ecura.it` | UTM tracking | `POST /api/lead` | Lead form HTML |
| **Sito Web TeleMedCare** | Web | `https://telemedcare-v12.pages.dev` | UTM tracking | `POST /api/lead` | `public/index.html` |
| **Form Embedded** | Iframe | Embeddable widget | Partner ID | `POST /api/lead` | Widget JS |

**Codice Fonte:**
- Lead capture form: `/public/index.html`
- Endpoint backend: `src/index.tsx:3648` (`app.post('/api/lead')`)

---

### 2.2 Canali Partner

#### 🏢 Partner IRBEMA (HubSpot)

| **Elemento** | **Dettaglio** |
|-------------|--------------|
| **Tipo integrazione** | HubSpot API v3 |
| **Filtro** | Lead con URL `ecura.it` dal 01/01/2026 |
| **Frequenza import** | Manuale (pulsante dashboard) o Automatico |
| **Switch controllo** | `hubspot_auto_import_enabled` |
| **Endpoint** | `POST /api/import/irbema` |
| **Codice** | `src/index.tsx:10800-11100` |
| **Pattern Lead ID** | `LEAD-IRBEMA-00001` |
| **Dashboard** | Pulsante "IRBEMA" in `/dashboard` |

**Flusso IRBEMA:**
```
HubSpot CRM (IRBEMA)
    ↓ [API v3 Contacts]
Import Script (Manuale/Auto)
    ↓ [Filter: ecura.it + date >= 2026-01-01]
Database D1 (leads table)
    ↓ [fonte = 'IRBEMA']
WorkflowOrchestrator.processNewLead()
    ↓
Email notifica + Contratto
```

**Dati importati:**
- Nome, Cognome, Email, Telefono
- Città, Piano desiderato, Messaggio
- URL prima/ultima visita (tracking)
- Data creazione lead

---

#### 🏢 Partner AON

| **Elemento** | **Dettaglio** |
|-------------|--------------|
| **Tipo integrazione** | API REST (in sviluppo) |
| **Endpoint** | `POST /api/import/aon` |
| **Stato** | 🟡 In sviluppo |
| **Pattern Lead ID** | `LEAD-AON-00001` |

**Status:** Struttura preparata, endpoint da completare.

---

#### 🏢 Partner DoubleYou

| **Elemento** | **Dettaglio** |
|-------------|--------------|
| **Tipo integrazione** | API REST (in sviluppo) |
| **Endpoint** | `POST /api/import/doubleyou` |
| **Stato** | 🟡 In sviluppo |
| **Pattern Lead ID** | `LEAD-DOUBLEYOU-00001` |

---

### 2.3 Canali Offline

| **Canale** | **Modalità Inserimento** | **Fonte Campo DB** | **Pattern Lead ID** |
|-----------|-------------------------|-------------------|---------------------|
| **Vigilanza** | Inserimento manuale dashboard | `fonte = 'VIGILANZA'` | `LEAD-VIGILANZA-00001` |
| **Networking** | Inserimento manuale dashboard | `fonte = 'NETWORKING'` | `LEAD-NETWORKING-00001` |
| **Welfare Aziendale** | Import CSV o manuale | `fonte = 'WELFARE'` | `LEAD-WELFARE-00001` |
| **Eventi/Fiere** | Inserimento manuale dashboard | `fonte = 'EVENTI'` | `LEAD-EVENTI-00001` |
| **Referral** | Form web o manuale | `fonte = 'REFERRAL'` | `LEAD-REFERRAL-00001` |

**Dashboard:** `/dashboard` → Sezione "Aggiungi Lead Manuale"

---

## 3. FLUSSO OPERATIVO COMPLETO

### 📊 STEP-BY-STEP WORKFLOW

---

### **STEP 1: ACQUISIZIONE LEAD**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 1: ACQUISIZIONE LEAD                                           ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Input:**
- Lead compila form su qualsiasi canale (LP, Partner, Sito, Manuale)

**Azioni Sistema:**
1. Lead salvato in DB D1 (tabella `leads`)
2. Assegnazione Lead ID univoco (es: `LEAD-IRBEMA-00001`)
3. Campo `fonte` popolato (IRBEMA, AON, WEB, NETWORKING, etc.)
4. Trigger WorkflowOrchestrator.processNewLead()

**Output:**
- ✅ Lead salvato nel database
- ✅ Lead ID generato
- 📧 Email 1a: **Notifica a info@telemedcare.it**
- 📧 Email 1b (opzionale): **Documenti informativi al Lead**

**Template Email:**
- `EMAIL_TEMPLATES.NOTIFICA_INFO` (embedded `src/index.tsx:15263`)
- `templates/email_documenti_informativi.html`

**Allegati:**
- `Brochure_eCura.pdf`
- `manuale-ecura-base.pdf` o `manuale-ecura-avanzato.pdf`

**Moduli:**
- `src/modules/workflow-email-manager.ts` → `inviaEmailNotificaInfo()`
- `src/modules/workflow-email-manager.ts` → `inviaEmailDocumentiInformativi()`

**Database:**
```sql
INSERT INTO leads (
  leadId, nomeRichiedente, cognomeRichiedente, emailRichiedente,
  telefonoRichiedente, fonte, servizio, piano, stato, createdAt
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'nuovo', datetime('now'));
```

**Switch Controllo:**
- `lead_email_notifications_enabled` (ON = invia email documenti al lead)
- `admin_email_notifications_enabled` (ON = invia notifica a info@)

---

### **STEP 2: COMPLETAMENTO DATI LEAD**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 2: COMPLETAMENTO DATI (Form Dinamico Email)                   ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Lead ha dati incompleti (mancano: indirizzo, CF assistito, data nascita, etc.)
- Sistema rileva campi mancanti con `getMissingFields(leadData)`

**Azioni Sistema:**
1. Sistema invia email con link a form completamento
2. Lead clicca link → Form dinamico personalizzato
3. Lead compila dati mancanti e salva

**Template Email:**
- `templates/email/email_richiesta_completamento_form.html`
- `templates/email/email_reminder_completamento.html` (se non compila)

**Form HTML:**
- `/public/completa-dati.html` (form dinamico)
- URL: `https://telemedcare-v12.pages.dev/completa-dati?leadId=LEAD-XXX-00001`

**Endpoint API:**
- `POST /api/leads/:leadId/complete-data`

**Modulo:**
- `src/modules/lead-completion.ts` → `getMissingFields()`
- `src/modules/workflow-email-manager.ts` → `inviaEmailRichiestaCompletamento()`

**Database Update:**
```sql
UPDATE leads SET
  indirizzoAssistito = ?,
  capAssistito = ?,
  cittaAssistito = ?,
  cfAssistito = ?,
  dataNascitaAssistito = ?,
  luogoNascitaAssistito = ?,
  stato = 'dati_completi',
  updatedAt = datetime('now')
WHERE leadId = ?;
```

**Switch Controllo:**
- `reminder_completion_enabled` (ON = invia reminder automatici se non completa)

**Timeline:**
- Email immediata dopo acquisizione lead
- Reminder dopo 3 giorni (se non completa)
- Reminder dopo 7 giorni (ultimo promemoria)

---

### **STEP 3: GENERAZIONE E INVIO CONTRATTO**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 3: CONTRATTO UNIFICATO eCURA (con Placeholder)                ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Lead ha completato dati (stato = `dati_completi`)
- Operatore avvia generazione contratto (manuale o automatico)

**Azioni Sistema:**
1. Sistema genera contratto HTML da template unificato
2. Sostituisce placeholder con dati lead (nome, CF, indirizzo, piano, prezzo)
3. Converte HTML → PDF (via Puppeteer/Cloudflare PDF API)
4. Salva PDF in Cloudflare R2 bucket `contracts/`
5. Salva record contratto in DB D1 (tabella `contracts`)
6. Invia email al lead con contratto allegato

**Template Contratto:**
- **Generatore HTML:** `src/modules/workflow-email-manager.ts:26-300` (`generateContractHtml()`)
- **Template Riferimento DOCX:** `/templates/contracts/Template_Contratto_eCura.docx`
- **Template HTML:** `/templates/contracts/contratto_ecura_base.html` o `contratto_ecura_avanzato.html`

**Placeholder Contratto:**
```
{{NOME_RICHIEDENTE}}, {{COGNOME_RICHIEDENTE}}
{{NOME_ASSISTITO}}, {{COGNOME_ASSISTITO}}
{{EMAIL_RICHIEDENTE}}, {{TELEFONO_RICHIEDENTE}}
{{INDIRIZZO_ASSISTITO}}, {{CAP_ASSISTITO}}, {{CITTA_ASSISTITO}}
{{CF_ASSISTITO}}, {{DATA_NASCITA_ASSISTITO}}, {{LUOGO_NASCITA_ASSISTITO}}
{{SERVIZIO}} (es: eCura PRO)
{{PIANO}} (es: BASE o AVANZATO)
{{PREZZO_PRIMO_ANNO}} (es: 480€ BASE, 840€ AVANZATO)
{{PREZZO_ANNI_SUCCESSIVI}} (es: 200€ BASE, 600€ AVANZATO)
{{DATA_CONTRATTO}}, {{DATA_INIZIO_SERVIZIO}}, {{DATA_SCADENZA}}
{{CODICE_CONTRATTO}} (es: CONTR-ECURA-00001)
{{DISPOSITIVO}} (es: SiDLY Care PRO, SiDLY Vital Care)
```

**Email Template:**
- `templates/email_invio_contratto.html`

**Allegati:**
- `contratto_<leadId>.pdf` (generato dinamicamente)
- `Brochure_eCura.pdf`

**Endpoint API:**
- `POST /api/contracts/generate`

**Moduli:**
- `src/modules/contract-workflow-manager.ts` → `generateAndSendContract()`
- `src/modules/workflow-email-manager.ts` → `generateContractHtml()`
- `src/modules/pdf-generator.ts` → `convertHtmlToPdf()`

**Storage:**
- Cloudflare R2: `contracts/contratto_<leadId>.pdf`

**Database:**
```sql
INSERT INTO contracts (
  contractId, leadId, codiceContratto, tipoContratto, servizio, piano,
  contenutoHtml, pdfUrl, prezzoMensile, durataMesi, prezzoTotale,
  dataInvio, stato, createdAt
) VALUES (?, ?, ?, 'eCura', ?, ?, ?, ?, ?, 12, ?, datetime('now'), 'inviato', datetime('now'));
```

**Prezzi eCura (secondo www.eCura.it):**
| **Piano** | **Primo Anno** | **Anni Successivi** | **Dispositivo** |
|----------|---------------|---------------------|----------------|
| BASE | 480€ | 200€ | SiDLY Care PRO |
| AVANZATO | 840€ | 600€ | SiDLY Care PRO |
| PREMIUM BASE | Da definire | Da definire | SiDLY Vital Care |
| PREMIUM AVANZATO | Da definire | Da definire | SiDLY Vital Care |

---

### **STEP 4: FIRMA ELETTRONICA CONTRATTO**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 4: FIRMA ELETTRONICA (Canvas Signature)                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Lead clicca link firma nella email contratto
- URL: `https://telemedcare-v12.pages.dev/sign-contract?contractId=CONTR-XXX`

**Azioni Lead:**
1. Lead visualizza contratto PDF
2. Lead firma su canvas HTML5 (firma elettronica)
3. Lead clicca "Invia Firma"

**Azioni Sistema:**
1. Sistema cattura firma (canvas → PNG base64)
2. Salva firma in database (campo `signatureData`)
3. Aggiorna stato contratto: `stato = 'firmato'`
4. Registra metadata firma (timestamp, userAgent, IP, screenResolution)
5. Trigger generazione proforma automatica

**Form HTML:**
- `/public/contract-signature.html`
- `/public/app/sign-contract.html`

**Endpoint API:**
- `POST /api/contracts/sign`
- Codice: `src/index.tsx:8674`

**Database Update:**
```sql
UPDATE contracts SET
  stato = 'firmato',
  dataFirma = datetime('now'),
  signatureData = ?,
  signatureTimestamp = ?,
  signatureUserAgent = ?,
  signatureIp = ?
WHERE contractId = ?;
```

**Modulo:**
- `src/modules/signature-manager.ts` → `saveSignature()`

**Output:**
- ✅ Contratto firmato salvato
- 📧 Email notifica firma a info@telemedcare.it
- 🔄 Trigger automatico: generazione proforma

---

### **STEP 5: GENERAZIONE E INVIO PROFORMA**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 5: PROFORMA UNIFICATA eCURA (con Placeholder)                 ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Contratto firmato (stato = `firmato`)
- WorkflowOrchestrator rileva firma e avvia generazione proforma

**Azioni Sistema:**
1. Sistema genera proforma HTML da template unificato
2. Sostituisce placeholder con dati contratto (nome, servizio, prezzo, IBAN)
3. Converte HTML → PDF
4. Salva PDF in Cloudflare R2 bucket `proformas/`
5. Salva record proforma in DB D1 (tabella `proformas`)
6. Genera link pagamento Stripe
7. Invia email al lead con proforma + link pagamento

**Template Proforma:**
- **Generatore HTML:** `src/modules/workflow-email-manager.ts:400-600` (`generateProformaHtml()`)
- **Template Riferimento:** `/templates/proformas/proforma_base.html` o `proforma_avanzato.html`
- **Template DOCX:** `/templates/Template_Proforma_Unificato_TeleMedCare.docx`

**Placeholder Proforma:**
```
{{NUMERO_PROFORMA}} (es: PRF-2026-00001)
{{DATA_EMISSIONE}}
{{NOME_CLIENTE}}, {{COGNOME_CLIENTE}}
{{INDIRIZZO_COMPLETO}}, {{CAP}}, {{CITTA}}, {{PROVINCIA}}
{{CF_CLIENTE}}, {{EMAIL_CLIENTE}}, {{TELEFONO_CLIENTE}}
{{DESCRIZIONE_SERVIZIO}} (es: eCura PRO - Piano AVANZATO - 12 mesi)
{{QUANTITA}} (default: 1)
{{PREZZO_UNITARIO}} (es: 840,00 €)
{{IMPORTO_TOTALE}} (es: 840,00 €)
{{IVA}} (es: Esente Art. 10)
{{TOTALE_DOCUMENTO}} (es: 840,00 €)
{{IBAN}} (es: IT XX X XXXXX XXXXX XXXXXXXXXXXX)
{{INTESTATARIO}} (es: Medica GB S.r.l.)
{{CODICE_CONTRATTO}} (riferimento contratto firmato)
{{SCADENZA_PAGAMENTO}} (es: 15 giorni dalla data emissione)
```

**Email Template:**
- `EMAIL_TEMPLATES.PROFORMA` (embedded `src/index.tsx:15358`)
- `templates/email_invio_proforma.html`

**Allegati:**
- `proforma_<contractId>.pdf`

**Link Pagamento Stripe:**
- URL: `https://checkout.stripe.com/pay/cs_xxxxx` (generato dinamicamente)

**Endpoint API:**
- `POST /api/proformas/generate`
- `POST /api/payments/create-checkout`

**Moduli:**
- `src/modules/workflow-email-manager.ts` → `generateProformaHtml()`
- `src/modules/workflow-email-manager.ts` → `inviaEmailProforma()`
- `src/modules/payment-manager.ts` → `createStripeCheckout()`

**Storage:**
- Cloudflare R2: `proformas/proforma_<contractId>.pdf`

**Database:**
```sql
INSERT INTO proformas (
  proformaId, contractId, leadId, numeroProforma, importoTotale,
  iva, totaleDocumento, pdfUrl, statoProforma, dataEmissione, scadenzaPagamento
) VALUES (?, ?, ?, ?, ?, 0, ?, ?, 'inviata', datetime('now'), date('now', '+15 days'));
```

---

### **STEP 6: PAGAMENTO STRIPE**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 6: PAGAMENTO CON STRIPE                                        ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Lead clicca link pagamento Stripe nella email proforma

**Azioni Lead:**
1. Reindirizzamento a Stripe Checkout
2. Lead inserisce dati carta o SEPA
3. Pagamento processato da Stripe

**Azioni Sistema (Webhook Stripe):**
1. Stripe invia webhook `checkout.session.completed`
2. Sistema riceve conferma pagamento
3. Aggiorna stato proforma: `statoProforma = 'pagata'`
4. Aggiorna stato contratto: `stato = 'pagato'`
5. Trigger email benvenuto + form configurazione

**Endpoint Webhook:**
- `POST /api/webhooks/stripe`

**Modulo:**
- `src/modules/payment-manager.ts` → `handleStripeWebhook()`

**Database Update:**
```sql
UPDATE proformas SET
  statoProforma = 'pagata',
  dataPagamento = datetime('now'),
  metodoPagamento = 'stripe',
  transactionId = ?
WHERE proformaId = ?;

UPDATE contracts SET
  stato = 'pagato',
  dataPagamento = datetime('now')
WHERE contractId = ?;
```

**Stripe Integration:**
- API: Stripe Checkout Session
- Webhook secret: `STRIPE_WEBHOOK_SECRET` (env variable)
- Metodi supportati: Carta credito, SEPA Direct Debit

---

### **STEP 7: EMAIL BENVENUTO + FORM CONFIGURAZIONE**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 7: BENVENUTO + FORM CONFIGURAZIONE DISPOSITIVO                 ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Pagamento confermato (stato contratto = `pagato`)

**Azioni Sistema:**
1. Invia email benvenuto al cliente
2. Include link a form configurazione dispositivo
3. Cliente compila form con dati specifici dispositivo

**Email Template:**
- `EMAIL_TEMPLATES.BENVENUTO` (embedded `src/index.tsx:15315`)
- `templates/email_benvenuto.html`

**Form Configurazione:**
- `/public/completa-dati.html` (form configurazione esteso)
- `/templates/forms/form_configurazione.html`
- URL: `https://telemedcare-v12.pages.dev/completa-dati?leadId=LEAD-XXX&type=config`

**Campi Form Configurazione:**
```
SEZIONE 1: Dati Dispositivo
- Numero seriale dispositivo
- Codice IMEI (se SIM inclusa)
- Numero SIM (se applicabile)

SEZIONE 2: Dati Installazione
- Indirizzo installazione (se diverso da anagrafica)
- Preferenza fascia oraria contatto
- Note particolari installazione

SEZIONE 3: Contatti Emergenza
- Nome/Cognome contatto emergenza 1
- Telefono contatto emergenza 1
- Nome/Cognome contatto emergenza 2
- Telefono contatto emergenza 2
- Relazione con assistito

SEZIONE 4: Informazioni Mediche (opzionali)
- Medico curante (nome)
- Telefono medico curante
- Patologie note
- Terapie farmacologiche in corso
- Allergie note
```

**Endpoint API:**
- `POST /api/configuration/submit`

**Modulo:**
- `src/modules/client-configuration-manager.ts` → `saveConfiguration()`

**Database:**
```sql
INSERT INTO configurations (
  configId, leadId, contractId, numeroSeriale, codiceImei, numeroSim,
  indirizzoInstallazione, contattoEmergenza1Nome, contattoEmergenza1Tel,
  contattoEmergenza2Nome, contattoEmergenza2Tel, medicoNome, medicoTel,
  patologie, terapie, allergie, note, stato, createdAt
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ricevuta', datetime('now'));
```

**Output:**
- ✅ Configurazione salvata
- 📧 Email notifica configurazione a info@telemedcare.it
- 🔄 Trigger: preparazione DDT

---

### **STEP 8: GENERAZIONE DDT (Documento di Trasporto)**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 8: DDT (Documento di Trasporto)                                ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Configurazione ricevuta e validata
- Operatore conferma preparazione spedizione

**Azioni Sistema:**
1. Sistema genera DDT PDF con dati spedizione
2. Salva DDT in database e storage
3. Invia notifica operatore logistica

**Template DDT:**
- `/templates/documents/ddt_template.html` (da creare)

**Placeholder DDT:**
```
{{NUMERO_DDT}} (es: DDT-2026-00001)
{{DATA_EMISSIONE}}
{{MITTENTE}} (Medica GB S.r.l.)
{{INDIRIZZO_MITTENTE}}
{{DESTINATARIO}} (Nome Cliente)
{{INDIRIZZO_DESTINAZIONE}}
{{DESCRIZIONE_MERCE}} (es: 1x Dispositivo SiDLY Care PRO)
{{NUMERO_COLLI}} (es: 1)
{{PESO}} (es: 0.5 kg)
{{CAUSALE_TRASPORTO}} (es: Vendita)
{{CORRIERE}} (es: GLS, BRT)
{{TRACKING_NUMBER}}
{{CODICE_CONTRATTO}} (riferimento)
{{NUMERO_SERIALE_DISPOSITIVO}}
```

**Endpoint API:**
- `POST /api/ddt/generate`

**Modulo:**
- `src/modules/logistics-manager.ts` → `generateDDT()` (da creare)

**Database:**
```sql
INSERT INTO ddts (
  ddtId, contractId, leadId, numeroDdt, dataEmissione, destinatario,
  indirizzoDestinazione, descrizioneMerce, numeroColli, peso,
  corriere, trackingNumber, pdfUrl, stato, createdAt
) VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, 1, 0.5, ?, ?, ?, 'emesso', datetime('now'));
```

**Output:**
- ✅ DDT generato e salvato
- 📧 Email notifica logistica (corriere + tracking)
- 📧 Email cliente: "Il tuo dispositivo è in spedizione"

---

### **STEP 9: CREAZIONE ASSISTITO (Anagrafica Completa)**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 9: CREAZIONE ASSISTITO (Anagrafica Sistema)                    ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- DDT emesso e spedizione confermata
- Operatore conferma ricezione dispositivo da parte cliente

**Azioni Sistema:**
1. Sistema crea record "Assistito" in tabella dedicata
2. Collega Assistito a Lead/Contratto/Configurazione
3. Genera credenziali accesso portale cliente (se applicabile)
4. Stato: "In attivazione"

**Database:**
```sql
INSERT INTO assistiti (
  assistitoId, leadId, contractId, nome, cognome, codiceFiscale,
  dataNascita, luogoNascita, indirizzo, cap, citta, provincia,
  telefono, email, contattoEmergenza1, contattoEmergenza2,
  numeroSeriale, dispositivo, servizio, piano, dataAttivazione,
  stato, createdAt
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'in_attivazione', datetime('now'));
```

**Output:**
- ✅ Assistito creato nel sistema
- 🔑 Credenziali portale generate (opzionale)
- 🔄 Pronto per avvio servizio

---

### **STEP 10: AVVIO SERVIZIO TELEASSISTENZA**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 10: AVVIO SERVIZIO TELEASSISTENZA                              ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Dispositivo ricevuto e configurato
- Operatore associa dispositivo ad assistito

**Azioni Operatore:**
1. Accede a dashboard `/dashboard` → Workflow Manager
2. Seleziona Assistito
3. Clicca "Associa Dispositivo"
4. Inserisce numero seriale + conferma attivazione

**Azioni Sistema:**
1. Aggiorna stato assistito: `stato = 'attivo'`
2. Registra data attivazione: `dataAttivazione = datetime('now')`
3. Invia email conferma attivazione a cliente
4. Invia email notifica attivazione a info@telemedcare.it
5. Avvia servizio TeleAssistenza H24

**Email Template:**
- `templates/email_conferma_attivazione.html`

**Endpoint API:**
- `POST /api/devices/associate`

**Modulo:**
- `src/modules/workflow-email-manager.ts` → `inviaEmailConfermaAttivazione()`

**Database Update:**
```sql
UPDATE assistiti SET
  stato = 'attivo',
  dataAttivazione = datetime('now'),
  numeroSeriale = ?,
  dispositivoAssociato = TRUE
WHERE assistitoId = ?;
```

**Servizi Attivati:**
- 📞 Centrale operativa H24/7
- 🚨 Pulsante SOS attivo
- 📊 Monitoraggio parametri vitali (se PREMIUM)
- 👨‍⚕️ Supporto medico remoto
- 📱 App familiari (se applicabile)

**Output:**
- ✅ Servizio TeleAssistenza ATTIVO
- 📧 Email conferma a cliente
- 📧 Email notifica a info@
- 🔄 Trigger: richiesta emissione fattura

---

### **STEP 11: FATTURAZIONE (Email Commercialista)**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 11: FATTURA → COMMERCIALISTA → SDI                             ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Servizio attivato (stato assistito = `attivo`)
- Proforma pagata presente

**Azioni Sistema:**
1. Sistema prepara email al commercialista
2. Allega proforma pagata (PDF)
3. Include dati cliente per fatturazione
4. Commercialista riceve email e emette fattura
5. Commercialista trasmette fattura a SDI (Sistema Di Interscambio)
6. Cliente riceve fattura elettronica

**Email Destinatario:**
- `commercialista@medicagb.it` (o email configurata)

**Email Template:**
- `templates/email_richiesta_fattura_commercialista.html` (da creare)

**Contenuto Email:**
```
Oggetto: Richiesta Emissione Fattura - Contratto {{CODICE_CONTRATTO}}

Gentile Commercialista,

Si richiede l'emissione della fattura per il seguente contratto:

DATI CLIENTE:
- Nome: {{NOME}} {{COGNOME}}
- Codice Fiscale: {{CF}}
- Indirizzo: {{INDIRIZZO}}, {{CAP}} {{CITTA}} ({{PROVINCIA}})
- Email: {{EMAIL}}
- PEC (se B2B): {{PEC}}
- Codice SDI (se B2B): {{CODICE_SDI}}

DATI FATTURA:
- Numero Proforma: {{NUMERO_PROFORMA}}
- Data Pagamento: {{DATA_PAGAMENTO}}
- Importo: {{IMPORTO_TOTALE}} €
- Descrizione: {{DESCRIZIONE_SERVIZIO}}
- Contratto Riferimento: {{CODICE_CONTRATTO}}
- IVA: Esente Art. 10

ALLEGATI:
- Proforma pagata (PDF)
- Contratto firmato (PDF)

La fattura elettronica dovrà essere trasmessa allo SDI.

Cordiali saluti,
Sistema TeleMedCare
```

**Allegati:**
- `proforma_<contractId>_PAGATA.pdf`
- `contratto_<leadId>_FIRMATO.pdf`

**Endpoint API:**
- `POST /api/invoices/request-emission`

**Modulo:**
- `src/modules/invoice-manager.ts` → `sendInvoiceRequestToAccountant()` (da creare)

**Database:**
```sql
INSERT INTO invoice_requests (
  requestId, contractId, leadId, proformaId, importoTotale,
  emailInviataA, dataRichiesta, statoRichiesta, note
) VALUES (?, ?, ?, ?, ?, 'commercialista@medicagb.it', datetime('now'), 'richiesta_inviata', NULL);
```

**Processo Fatturazione:**
1. Sistema → Email commercialista (automatica)
2. Commercialista → Emissione fattura (manuale)
3. Commercialista → Trasmissione SDI (manuale)
4. SDI → Invio fattura a cliente (automatico)
5. Cliente → Ricezione fattura elettronica

**Output:**
- ✅ Richiesta fattura inviata
- ⏳ Attesa emissione fattura (1-2 giorni lavorativi)
- 📧 Fattura elettronica ricevuta da cliente via SDI

---

### **STEP 12: REMINDERS E SUPPORTO CONTINUATIVO**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 12: REMINDERS E GESTIONE CLIENTE ATTIVO                        ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Tipologie Reminders:**

#### 📧 Check-in Mensile
- **Frequenza:** Ogni 30 giorni dall'attivazione
- **Contenuto:** Verifica soddisfazione, supporto tecnico
- **Template:** `templates/email_checkin_mensile.html`
- **Switch:** `reminder_completion_enabled`

#### 📧 Survey Soddisfazione
- **Frequenza:** 3 mesi dopo attivazione
- **Contenuto:** Questionario NPS, feedback servizio
- **Template:** `templates/email_survey_soddisfazione.html`

#### 📧 Supporto Tecnico
- **Trigger:** Evento (es: batteria scarica, offline)
- **Contenuto:** Istruzioni troubleshooting
- **Template:** `templates/email_supporto_troubleshooting.html`

#### 📧 Aggiornamenti Normativi
- **Frequenza:** Trimestrale
- **Contenuto:** Newsletter normative GDPR, privacy
- **Template:** `templates/email_newsletter_normative.html`

**Modulo:**
- `src/modules/reminder-scheduler.ts` (da creare)

**Database:**
```sql
CREATE TABLE reminders (
  reminderId TEXT PRIMARY KEY,
  assistitoId TEXT,
  tipo TEXT, -- 'checkin', 'survey', 'supporto', 'newsletter'
  dataInvio DATETIME,
  stato TEXT, -- 'programmato', 'inviato', 'annullato'
  templateUsato TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### **STEP 13: RINNOVO SERVIZIO (dopo 12 mesi)**

```
╔══════════════════════════════════════════════════════════════════════╗
║  STEP 13: RINNOVO SERVIZIO (dopo 12 mesi)                            ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Trigger:**
- Data scadenza contratto: `dataScadenza = dataAttivazione + 12 mesi`
- Sistema invia reminder rinnovo a -60 giorni, -30 giorni, -15 giorni

**Azioni Sistema:**
1. Sistema rileva contratto in scadenza
2. Invia email proposta rinnovo (60 giorni prima)
3. Genera proforma rinnovo con prezzo "Anni Successivi"
4. Cliente paga proforma rinnovo
5. Sistema estende contratto per altri 12 mesi

**Email Template:**
- `templates/email_promemoria_rinnovo.html`
- `templates/email_proposta_rinnovo.html`

**Proforma Rinnovo:**
- **Importo:** 200€ (BASE) o 600€ (AVANZATO)
- **Template:** Stesso template proforma standard
- **Differenza:** Campo `tipoProforma = 'rinnovo'`

**Endpoint API:**
- `POST /api/renewals/generate-proforma`
- `POST /api/renewals/confirm`

**Modulo:**
- `src/modules/renewal-manager.ts` (da creare)

**Database:**
```sql
UPDATE contracts SET
  dataScadenza = date(dataScadenza, '+12 months'),
  annoRinnovo = annoRinnovo + 1,
  ultimoRinnovo = datetime('now')
WHERE contractId = ?;

INSERT INTO proformas (
  proformaId, contractId, leadId, numeroProforma, importoTotale,
  tipoProforma, descrizione, ...
) VALUES (?, ?, ?, ?, ?, 'rinnovo', 'Rinnovo servizio eCura - Anno 2', ...);
```

**Timeline Rinnovo:**
- **-60 giorni:** Email promemoria rinnovo (opzionale)
- **-30 giorni:** Email proposta rinnovo + proforma
- **-15 giorni:** Reminder pagamento proforma
- **Giorno scadenza:** Servizio sospeso se non pagato
- **+7 giorni:** Ultimo reminder + possibile cancellazione

**Gestione Mancato Rinnovo:**
- Se cliente non paga → Servizio sospeso
- Email win-back: `templates/email_win_back.html`
- Campagna riattivazione (sconto, offerta speciale)
- Se no risposta dopo 30 giorni → Chiusura pratica

---

## 4. TEMPLATE E DOCUMENTI PER STEP

### Tabella Master Template/Documento per Workflow Step

| **Step** | **Template Email** | **Documento Generato** | **Form HTML** | **Modulo TS** |
|---------|-------------------|------------------------|--------------|--------------|
| **1. Acquisizione Lead** | `email_notifica_info.html`<br>`email_documenti_informativi.html` | - | `/public/index.html` | `workflow-email-manager.ts` |
| **2. Completamento Dati** | `email_richiesta_completamento_form.html`<br>`email_reminder_completamento.html` | - | `/public/completa-dati.html` | `lead-completion.ts` |
| **3. Contratto** | `email_invio_contratto.html` | `contratto_<leadId>.pdf` | - | `contract-workflow-manager.ts`<br>`workflow-email-manager.ts` |
| **4. Firma** | - | Firma PNG (embedded in DB) | `/public/contract-signature.html` | `signature-manager.ts` |
| **5. Proforma** | `EMAIL_TEMPLATES.PROFORMA` | `proforma_<contractId>.pdf` | - | `workflow-email-manager.ts` |
| **6. Pagamento** | `email_conferma_pagamento.html` | Ricevuta Stripe | Stripe Checkout | `payment-manager.ts` |
| **7. Benvenuto + Config** | `EMAIL_TEMPLATES.BENVENUTO`<br>`email_configurazione.html` | - | `/public/completa-dati.html` (config mode) | `client-configuration-manager.ts` |
| **8. DDT** | `email_spedizione.html` | `ddt_<contractId>.pdf` | - | `logistics-manager.ts` (da creare) |
| **9. Creazione Assistito** | - | - | - | - (inserimento DB) |
| **10. Avvio Servizio** | `email_conferma_attivazione.html` | - | - | `workflow-email-manager.ts` |
| **11. Fatturazione** | `email_richiesta_fattura.html` | Email al commercialista | - | `invoice-manager.ts` (da creare) |
| **12. Reminders** | `email_checkin_mensile.html`<br>`email_survey_soddisfazione.html`<br>`email_supporto_troubleshooting.html` | - | - | `reminder-scheduler.ts` (da creare) |
| **13. Rinnovo** | `email_promemoria_rinnovo.html`<br>`email_proposta_rinnovo.html` | `proforma_rinnovo_<contractId>.pdf` | - | `renewal-manager.ts` (da creare) |

---

## 5. AUTOMAZIONI E SWITCH

### Settings Switches (Controllo Processi)

| **Switch** | **Nome** | **Funzione** | **Impatto Workflow** |
|-----------|---------|-------------|---------------------|
| **Switch 1** | `hubspot_auto_import_enabled` | Abilita import automatico lead da HubSpot (IRBEMA) | Se ON: import automatico ogni X ore<br>Se OFF: import manuale solo |
| **Switch 2** | `lead_email_notifications_enabled` | Abilita invio email documenti informativi al lead | Se ON: email automatica con brochure/manuali<br>Se OFF: no email al lead |
| **Switch 3** | `admin_email_notifications_enabled` | Abilita notifiche email a info@telemedcare.it | Se ON: email notifica ogni nuovo lead<br>Se OFF: no notifiche admin |
| **Switch 4** | `reminder_completion_enabled` | Abilita reminder automatici completamento dati | Se ON: reminder a 3, 7 giorni<br>Se OFF: no reminder automatici |

**Dashboard:** `https://telemedcare-v12.pages.dev/dashboard` → Sezione "Impostazioni Sistema"

**Endpoint API:**
- `GET /api/settings` (legge tutti gli switch)
- `PUT /api/settings/:key` (aggiorna singolo switch)

**Modulo:**
- `src/modules/settings-api.ts`

---

### Automazioni WorkflowOrchestrator

Il modulo `complete-workflow-orchestrator.ts` gestisce le automazioni:

```typescript
// Flusso automatico completo
async function processNewLead(ctx: WorkflowContext) {
  // 1. Invia notifica a info@
  if (settings.admin_email_notifications_enabled) {
    await inviaEmailNotificaInfo(ctx.leadData, ctx.env)
  }
  
  // 2a. Se solo brochure → Email documenti
  if (leadData.richiedeSoloBrochure) {
    await inviaEmailDocumentiInformativi(ctx.leadData, ctx.env)
  }
  
  // 2b. Se chiede contratto → Genera contratto
  if (leadData.richiedeContratto) {
    await generateAndSendContract(ctx.leadData, ctx.env, ctx.db)
  }
}

// Trigger automatico dopo firma contratto
async function onContractSigned(contractId: string, ctx: WorkflowContext) {
  // Genera e invia proforma
  await generateAndSendProforma(contractId, ctx.env, ctx.db)
}

// Trigger automatico dopo pagamento
async function onPaymentConfirmed(contractId: string, ctx: WorkflowContext) {
  // Invia email benvenuto + form config
  await inviaEmailBenvenuto(contractId, ctx.env, ctx.db)
}

// Trigger automatico dopo config ricevuta
async function onConfigurationReceived(configId: string, ctx: WorkflowContext) {
  // Notifica operatore: pronto per DDT
  await notificaOperatoreConfig(configId, ctx.env)
}

// Trigger automatico dopo associazione dispositivo
async function onDeviceAssociated(assistitoId: string, ctx: WorkflowContext) {
  // Email conferma attivazione
  await inviaEmailConfermaAttivazione(assistitoId, ctx.env, ctx.db)
  
  // Richiesta fattura a commercialista
  await sendInvoiceRequestToAccountant(assistitoId, ctx.env)
}
```

**Modulo:**
- `src/modules/complete-workflow-orchestrator.ts`

---

## 6. DATABASE E INTEGRAZIONI

### Schema Database D1 (Cloudflare)

#### Tabella: `leads`

```sql
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  leadId TEXT UNIQUE NOT NULL,
  
  -- Richiedente
  nomeRichiedente TEXT,
  cognomeRichiedente TEXT,
  emailRichiedente TEXT,
  telefonoRichiedente TEXT,
  
  -- Assistito
  nomeAssistito TEXT,
  cognomeAssistito TEXT,
  emailAssistito TEXT,
  telefonoAssistito TEXT,
  dataNascitaAssistito TEXT,
  luogoNascitaAssistito TEXT,
  cfAssistito TEXT,
  indirizzoAssistito TEXT,
  capAssistito TEXT,
  cittaAssistito TEXT,
  provinciaAssistito TEXT,
  
  -- Servizio
  fonte TEXT, -- 'WEB', 'IRBEMA', 'AON', 'DOUBLEYOU', 'VIGILANZA', 'NETWORKING', etc.
  servizio TEXT, -- 'eCura PRO', 'TeleMedCare', 'SiDLY Care'
  piano TEXT, -- 'BASE', 'AVANZATO', 'PREMIUM'
  note TEXT,
  
  -- Workflow
  stato TEXT DEFAULT 'nuovo', -- 'nuovo', 'dati_completi', 'contratto_inviato', 'firmato', 'pagato', 'attivo'
  richiedeSoloBrochure BOOLEAN DEFAULT FALSE,
  richiedeContratto BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabella: `contracts`

```sql
CREATE TABLE contracts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  contractId TEXT UNIQUE NOT NULL,
  leadId TEXT NOT NULL,
  
  -- Dati Contratto
  codiceContratto TEXT UNIQUE,
  tipoContratto TEXT DEFAULT 'eCura',
  servizio TEXT,
  piano TEXT,
  dispositivo TEXT,
  
  -- Contenuto
  templateUtilizzato TEXT,
  contenutoHtml TEXT,
  pdfUrl TEXT,
  pdfGenerated BOOLEAN DEFAULT FALSE,
  
  -- Prezzi
  prezzoMensile REAL,
  durataMesi INTEGER DEFAULT 12,
  prezzoTotale REAL,
  
  -- Date
  dataInvio DATETIME,
  dataScadenza DATE,
  dataFirma DATETIME,
  dataPagamento DATETIME,
  
  -- Firma
  signatureData TEXT,
  signatureTimestamp DATETIME,
  signatureUserAgent TEXT,
  signatureIp TEXT,
  
  -- Stato
  stato TEXT DEFAULT 'bozza', -- 'bozza', 'inviato', 'firmato', 'pagato', 'attivo'
  
  -- Email
  emailSent BOOLEAN DEFAULT FALSE,
  emailTemplateUsed TEXT,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (leadId) REFERENCES leads(leadId)
);
```

#### Tabella: `proformas`

```sql
CREATE TABLE proformas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  proformaId TEXT UNIQUE NOT NULL,
  contractId TEXT NOT NULL,
  leadId TEXT NOT NULL,
  
  -- Dati Proforma
  numeroProforma TEXT UNIQUE,
  tipoProforma TEXT DEFAULT 'prima_emissione', -- 'prima_emissione', 'rinnovo'
  descrizione TEXT,
  
  -- Importi
  importoUnitario REAL,
  quantita INTEGER DEFAULT 1,
  importoTotale REAL,
  iva REAL DEFAULT 0,
  totaleDocumento REAL,
  
  -- Pagamento
  iban TEXT,
  intestatario TEXT DEFAULT 'Medica GB S.r.l.',
  scadenzaPagamento DATE,
  metodoPagamento TEXT, -- 'bonifico', 'stripe'
  transactionId TEXT,
  
  -- Date
  dataEmissione DATETIME DEFAULT CURRENT_TIMESTAMP,
  dataPagamento DATETIME,
  
  -- File
  pdfUrl TEXT,
  
  -- Stato
  statoProforma TEXT DEFAULT 'bozza', -- 'bozza', 'inviata', 'pagata', 'scaduta'
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contractId) REFERENCES contracts(contractId),
  FOREIGN KEY (leadId) REFERENCES leads(leadId)
);
```

#### Tabella: `configurations`

```sql
CREATE TABLE configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  configId TEXT UNIQUE NOT NULL,
  leadId TEXT NOT NULL,
  contractId TEXT NOT NULL,
  
  -- Dispositivo
  numeroSeriale TEXT,
  codiceImei TEXT,
  numeroSim TEXT,
  
  -- Installazione
  indirizzoInstallazione TEXT,
  preferenzaFasciaOraria TEXT,
  noteInstallazione TEXT,
  
  -- Contatti Emergenza
  contattoEmergenza1Nome TEXT,
  contattoEmergenza1Tel TEXT,
  contattoEmergenza1Relazione TEXT,
  contattoEmergenza2Nome TEXT,
  contattoEmergenza2Tel TEXT,
  contattoEmergenza2Relazione TEXT,
  
  -- Info Mediche
  medicoNome TEXT,
  medicoTel TEXT,
  patologie TEXT,
  terapie TEXT,
  allergie TEXT,
  
  -- Stato
  stato TEXT DEFAULT 'ricevuta', -- 'ricevuta', 'validata', 'in_lavorazione', 'completata'
  note TEXT,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (leadId) REFERENCES leads(leadId),
  FOREIGN KEY (contractId) REFERENCES contracts(contractId)
);
```

#### Tabella: `ddts`

```sql
CREATE TABLE ddts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ddtId TEXT UNIQUE NOT NULL,
  contractId TEXT NOT NULL,
  leadId TEXT NOT NULL,
  
  -- Dati DDT
  numeroDdt TEXT UNIQUE,
  dataEmissione DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Mittente (default: Medica GB)
  mittente TEXT DEFAULT 'Medica GB S.r.l.',
  indirizzoMittente TEXT,
  
  -- Destinatario
  destinatario TEXT,
  indirizzoDestinazione TEXT,
  capDestinazione TEXT,
  cittaDestinazione TEXT,
  provinciaDestinazione TEXT,
  
  -- Merce
  descrizioneMerce TEXT,
  numeroColli INTEGER DEFAULT 1,
  peso REAL,
  causaleTrasporto TEXT DEFAULT 'Vendita',
  
  -- Corriere
  corriere TEXT, -- 'GLS', 'BRT', 'DHL', etc.
  trackingNumber TEXT,
  dataSpedizione DATETIME,
  dataConsegna DATETIME,
  
  -- File
  pdfUrl TEXT,
  
  -- Stato
  stato TEXT DEFAULT 'emesso', -- 'emesso', 'spedito', 'in_transito', 'consegnato'
  note TEXT,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contractId) REFERENCES contracts(contractId),
  FOREIGN KEY (leadId) REFERENCES leads(leadId)
);
```

#### Tabella: `assistiti`

```sql
CREATE TABLE assistiti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assistitoId TEXT UNIQUE NOT NULL,
  leadId TEXT NOT NULL,
  contractId TEXT NOT NULL,
  
  -- Anagrafica
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  codiceFiscale TEXT UNIQUE,
  dataNascita DATE,
  luogoNascita TEXT,
  
  -- Indirizzo
  indirizzo TEXT,
  cap TEXT,
  citta TEXT,
  provincia TEXT,
  
  -- Contatti
  telefono TEXT,
  email TEXT,
  contattoEmergenza1 TEXT,
  contattoEmergenza2 TEXT,
  
  -- Dispositivo
  numeroSeriale TEXT UNIQUE,
  dispositivo TEXT, -- 'SiDLY Care PRO', 'SiDLY Vital Care'
  dispositivoAssociato BOOLEAN DEFAULT FALSE,
  
  -- Servizio
  servizio TEXT, -- 'eCura PRO', 'TeleMedCare'
  piano TEXT, -- 'BASE', 'AVANZATO', 'PREMIUM'
  dataAttivazione DATETIME,
  dataScadenza DATE,
  
  -- Stato
  stato TEXT DEFAULT 'in_attivazione', -- 'in_attivazione', 'attivo', 'sospeso', 'cessato'
  note TEXT,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (leadId) REFERENCES leads(leadId),
  FOREIGN KEY (contractId) REFERENCES contracts(contractId)
);
```

#### Tabella: `invoice_requests`

```sql
CREATE TABLE invoice_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requestId TEXT UNIQUE NOT NULL,
  contractId TEXT NOT NULL,
  leadId TEXT NOT NULL,
  proformaId TEXT NOT NULL,
  
  -- Dati Fattura
  importoTotale REAL,
  descrizione TEXT,
  
  -- Email
  emailInviataA TEXT DEFAULT 'commercialista@medicagb.it',
  dataRichiesta DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Stato
  statoRichiesta TEXT DEFAULT 'richiesta_inviata', -- 'richiesta_inviata', 'in_lavorazione', 'fattura_emessa', 'trasmessa_sdi'
  note TEXT,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contractId) REFERENCES contracts(contractId),
  FOREIGN KEY (leadId) REFERENCES leads(leadId),
  FOREIGN KEY (proformaId) REFERENCES proformas(proformaId)
);
```

#### Tabella: `reminders`

```sql
CREATE TABLE reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reminderId TEXT UNIQUE NOT NULL,
  assistitoId TEXT NOT NULL,
  
  -- Tipo Reminder
  tipo TEXT NOT NULL, -- 'checkin', 'survey', 'supporto', 'newsletter', 'rinnovo'
  descrizione TEXT,
  
  -- Programmazione
  dataProgrammata DATETIME,
  dataInvio DATETIME,
  
  -- Template
  templateUsato TEXT,
  
  -- Stato
  stato TEXT DEFAULT 'programmato', -- 'programmato', 'inviato', 'fallito', 'annullato'
  errore TEXT,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (assistitoId) REFERENCES assistiti(assistitoId)
);
```

---

### Integrazioni Esterne

| **Servizio** | **Funzione** | **API** | **Variabile ENV** |
|-------------|-------------|---------|-------------------|
| **HubSpot** | Import lead IRBEMA | HubSpot API v3 Contacts | `HUBSPOT_ACCESS_TOKEN` |
| **Resend** | Invio email (principale) | Resend API | `RESEND_API_KEY` |
| **SendGrid** | Invio email (fallback) | SendGrid API v3 | `SENDGRID_API_KEY` |
| **Stripe** | Pagamenti online | Stripe Checkout + Webhooks | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| **Cloudflare R2** | Storage PDF (contratti, proforma, DDT) | S3-compatible API | `R2_BUCKET_NAME`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` |
| **Cloudflare D1** | Database SQL | D1 API | `DB` (binding automatico) |

---

## 7. TIMELINE E SLA

### Timeline Ideale Workflow (Scenario Ottimale)

| **Step** | **Durata** | **SLA** | **Note** |
|---------|-----------|---------|----------|
| 1. Acquisizione Lead | Istantaneo | <1 min | Automatico |
| 2. Completamento Dati | 1-3 giorni | 7 giorni max | Dipende da lead |
| 3. Generazione Contratto | Istantaneo | <5 min | Automatico |
| 4. Firma Contratto | 1-5 giorni | 15 giorni max | Dipende da lead |
| 5. Generazione Proforma | Istantaneo | <5 min | Automatico dopo firma |
| 6. Pagamento Stripe | Istantaneo | - | Dipende da lead |
| 7. Email Benvenuto + Config | Istantaneo | <5 min | Automatico dopo pagamento |
| 8. Compilazione Config | 1-3 giorni | 7 giorni max | Dipende da cliente |
| 9. Generazione DDT | 1 giorno | 2 giorni | Manuale operatore |
| 10. Spedizione Dispositivo | 2-3 giorni | 5 giorni | Corriere |
| 11. Associazione Dispositivo | 1 giorno | 2 giorni | Manuale operatore |
| 12. Avvio Servizio | Istantaneo | <5 min | Automatico dopo associazione |
| 13. Richiesta Fattura | Istantaneo | <5 min | Automatico |
| 14. Emissione Fattura | 1-2 giorni | 5 giorni | Manuale commercialista |
| **TOTALE** | **~10-20 giorni** | **~30 giorni max** | Da lead ad attivazione completa |

---

### SLA per Operatori

| **Attività** | **SLA** | **Responsabile** |
|-------------|---------|-----------------|
| Risposta email lead | 24 ore | Operatore commerciale |
| Validazione dati lead | 48 ore | Operatore commerciale |
| Emissione DDT | 48 ore da pagamento | Operatore logistica |
| Associazione dispositivo | 24 ore da ricezione dispositivo | Operatore tecnico |
| Risposta supporto tecnico | 4 ore (lun-ven 9-18) | Supporto tecnico |
| Emissione fattura | 5 giorni lavorativi | Commercialista |

---

## 8. CHECKLIST OPERATIVA

### Checklist Operatore: Nuovo Lead → Attivazione

```
□ STEP 1: ACQUISIZIONE LEAD
  □ Lead salvato nel database
  □ Lead ID assegnato
  □ Fonte identificata (WEB, IRBEMA, etc.)
  □ Email notifica ricevuta a info@
  
□ STEP 2: VALIDAZIONE DATI
  □ Verifica completezza dati richiedente
  □ Verifica completezza dati assistito
  □ Se incompleto: invia email completamento
  □ Attendi compilazione form (max 7 giorni)
  
□ STEP 3: GENERAZIONE CONTRATTO
  □ Dati lead completi e validati
  □ Piano servizio confermato (BASE/AVANZATO)
  □ Contratto generato e salvato
  □ Email contratto inviata a lead
  □ Verifica ricezione email (check inbox)
  
□ STEP 4: FIRMA CONTRATTO
  □ Lead ha aperto email contratto
  □ Lead ha firmato contratto online
  □ Firma salvata nel database
  □ Stato contratto = 'firmato'
  □ Notifica firma ricevuta a info@
  
□ STEP 5: PROFORMA E PAGAMENTO
  □ Proforma generata automaticamente
  □ Link pagamento Stripe creato
  □ Email proforma inviata a lead
  □ Attendi pagamento Stripe
  □ Verifica pagamento confermato (webhook)
  □ Stato contratto = 'pagato'
  
□ STEP 6: CONFIGURAZIONE DISPOSITIVO
  □ Email benvenuto inviata
  □ Cliente ha compilato form configurazione
  □ Dati configurazione validati
  □ Contatti emergenza verificati
  □ Indirizzo spedizione confermato
  
□ STEP 7: SPEDIZIONE
  □ DDT generato
  □ Dispositivo preparato e imballato
  □ Spedizione affidata a corriere
  □ Tracking number salvato
  □ Email spedizione inviata a cliente
  
□ STEP 8: RICEZIONE E ASSOCIAZIONE
  □ Cliente conferma ricezione dispositivo
  □ Accedi a dashboard → Workflow Manager
  □ Seleziona cliente
  □ Clicca "Associa Dispositivo"
  □ Inserisci numero seriale
  □ Conferma associazione
  □ Stato assistito = 'attivo'
  □ Data attivazione registrata
  
□ STEP 9: ATTIVAZIONE SERVIZIO
  □ Email conferma attivazione inviata
  □ Servizio TeleAssistenza H24 attivo
  □ Centrale operativa notificata
  □ Pulsante SOS funzionante
  □ Test chiamata OK
  
□ STEP 10: FATTURAZIONE
  □ Email richiesta fattura inviata a commercialista
  □ Proforma allegata
  □ Contratto allegato
  □ Attendi emissione fattura (5 giorni)
  □ Fattura trasmessa a SDI
  □ Cliente riceve fattura elettronica
  
□ STEP 11: FOLLOW-UP
  □ Check-in dopo 7 giorni attivazione
  □ Check-in dopo 30 giorni
  □ Survey soddisfazione dopo 90 giorni
  □ Programmazione reminders rinnovo (11 mesi)
```

---

## 9. MODULI DA CREARE/COMPLETARE

### Moduli Mancanti

| **Modulo** | **Path** | **Funzione** | **Priorità** |
|-----------|---------|-------------|-------------|
| `logistics-manager.ts` | `src/modules/` | Gestione DDT, spedizioni, tracking | 🔴 Alta |
| `invoice-manager.ts` | `src/modules/` | Richiesta fattura, invio commercialista | 🔴 Alta |
| `reminder-scheduler.ts` | `src/modules/` | Scheduler reminders (check-in, survey, rinnovo) | 🟡 Media |
| `renewal-manager.ts` | `src/modules/` | Gestione rinnovi dopo 12 mesi | 🟡 Media |
| `import-aon.ts` | `src/modules/` | Import lead da partner AON | 🟢 Bassa |
| `import-doubleyou.ts` | `src/modules/` | Import lead da partner DoubleYou | 🟢 Bassa |

---

## 10. DASHBOARD OPERATIVA

### Sezioni Dashboard

#### 📊 Dashboard Principale (`/dashboard`)

**Widgets:**
- **Lead in Tempo Reale:** Ultimi 10 lead acquisiti
- **Contratti in Attesa Firma:** Count + lista
- **Pagamenti in Attesa:** Count + lista
- **Configurazioni Ricevute:** Count + lista
- **Dispositivi da Associare:** Count + lista
- **Assistiti Attivi:** Count totale

**Actions:**
- Pulsante "IRBEMA" (import lead da HubSpot)
- Pulsante "Aggiungi Lead Manuale"
- Sezione "Impostazioni Sistema" (4 switch)

#### 📋 Workflow Manager (`/workflow-manager`)

**Funzioni:**
- Visualizza workflow completo per lead
- Timeline eventi (acquisizione → attivazione)
- Azioni rapide:
  - Invia contratto
  - Genera DDT
  - Associa dispositivo
  - Invia reminder

#### 📈 Leads Dashboard (`/admin/leads-dashboard`)

**Funzioni:**
- Lista completa lead con filtri
- Filtri: fonte, stato, piano, data
- Export CSV
- Bulk actions

---

## 11. METRICHE E KPI

### KPI Operativi

| **Metrica** | **Formula** | **Target** |
|------------|-----------|-----------|
| **Conversion Rate Lead → Contratto** | (Contratti inviati / Lead totali) × 100 | >60% |
| **Conversion Rate Contratto → Firma** | (Contratti firmati / Contratti inviati) × 100 | >80% |
| **Conversion Rate Firma → Pagamento** | (Pagamenti / Contratti firmati) × 100 | >90% |
| **Time to Activation** | Media giorni da lead ad attivazione | <20 giorni |
| **Tasso Abbandono** | Lead non completano dati / Lead totali | <20% |
| **Tasso Rinnovo (12 mesi)** | Rinnovi / Contratti scadenza | >85% |
| **Customer Satisfaction (NPS)** | Survey soddisfazione | >8/10 |

---

## 12. CONCLUSIONI

Questo workflow completo copre **l'intero ciclo di vita** del cliente eCura/TeleMedCare:

✅ **13 Step operativi** mappati  
✅ **8 Canali acquisizione** documentati  
✅ **20+ Template email** identificati  
✅ **7 Documenti generati** (contratto, proforma, DDT, fattura)  
✅ **9 Tabelle database** strutturate  
✅ **5 Integrazioni esterne** (HubSpot, Stripe, Resend, SendGrid, R2)  
✅ **4 Switch controllo** processi automatici  
✅ **Timeline SLA** definita (10-20 giorni lead → attivo)  

**Repository:** https://github.com/RobertoPoggi/telemedcare-v12  
**Dashboard:** https://telemedcare-v12.pages.dev/dashboard  

---

**Fine Documento**
