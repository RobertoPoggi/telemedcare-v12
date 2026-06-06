# 📄 SISTEMA GENERAZIONE DOCUMENTI - TeleMedCare V11.0

## 🎯 Obiettivo
Generare automaticamente contratti e proforma PDF da template DOCX, sostituendo i placeholder con i dati reali del lead.

---

## 📋 Componenti del Sistema

### 1. **Template DOCX** (`/templates/`)
File DOCX con placeholder che vengono sostituiti con dati reali:

#### **Contratti**
- `Template_Contratto_Base_TeleMedCare.docx` (€480 + IVA = €585.60)
- `Template_Contratto_Avanzato_TeleMedCare.docx` (€840 + IVA = €1.024,80)

**Placeholder Contratti (15):**
```
{{NOME_ASSISTITO}}
{{COGNOME_ASSISTITO}}
{{DATA_NASCITA}}
{{LUOGO_NASCITA}}
{{CODICE_FISCALE_ASSISTITO}}
{{INDIRIZZO_ASSISTITO}}
{{CAP_ASSISTITO}}
{{CITTA_ASSISTITO}}
{{PROVINCIA_ASSISTITO}}
{{EMAIL_ASSISTITO}}
{{TELEFONO_ASSISTITO}}
{{DATA_CONTRATTO}}
{{DATA_INIZIO_SERVIZIO}}
{{DATA_SCADENZA}}
{{IMPORTO_PRIMO_ANNO}}
```

#### **Proforma**
- `Template_Proforma_Unificato_TeleMedCare.docx`

**Placeholder Proforma (12):**
```
{{NOME_ASSISTITO}}
{{COGNOME_ASSISTITO}}
{{CODICE_FISCALE}}
{{INDIRIZZO_COMPLETO}}
{{CITTA}}
{{EMAIL_RICHIEDENTE}}
{{DATA_RICHIESTA}}
{{DATA_ATTIVAZIONE}}
{{PREZZO_PACCHETTO}}
{{SERIAL_NUMBER}}
{{TELEFONO_SIDLY}}
{{COMUNICAZIONE_TIPO}}
```

---

### 2. **Python Document Generator** (`/src/services/document-generator.py`)

**Funzionalità:**
- Legge template DOCX
- Sostituisce placeholder con dati lead
- Converte DOCX → PDF
- Salva PDF in cartelle organizzate

**Metodi principali:**
```python
generate_contract_from_lead(lead_data)
  ├─ _validate_lead_data()           # Valida dati obbligatori
  ├─ _determine_service_type()       # BASE o AVANZATO
  ├─ _generate_contract_pdf()        # Genera contratto
  │   ├─ _prepare_contract_placeholders()
  │   ├─ _replace_placeholders_in_docx()
  │   └─ _convert_docx_to_pdf()
  └─ _generate_proforma_pdf()        # Genera proforma
      ├─ _prepare_proforma_placeholders()
      ├─ _replace_placeholders_in_docx()
      └─ _convert_docx_to_pdf()
```

**Output:**
```
/documents/
  ├─ contratti/
  │   └─ 20251017_Rossi_CTR20251017120000.pdf
  └─ proforma/
      └─ 20251017_Rossi_PRF20251017120001.pdf
```

---

### 3. **TypeScript Document Manager** (`/src/modules/document-manager.ts`)

**Funzionalità:**
- Interfaccia TypeScript → Python
- Gestione database (salvataggio records)
- Upload PDF su R2 Storage (TODO)
- Invio email con allegati

**Workflow:**
```typescript
generateDocumentsForLead(leadId)
  ├─ getLeadFromDatabase()          // Recupera dati lead
  ├─ callPythonGenerator()          // Chiama script Python
  ├─ saveContractToDatabase()       // Salva in table 'contracts'
  └─ saveProformaToDatabase()       // Salva in table 'proforma'
```

**Database Tables:**
- `contracts` - Record contratti generati
- `proforma` - Record proforma generate

---

### 4. **API Endpoint** (`/src/index.tsx`)

**Nuovo Endpoint:**
```
POST /api/documents/generate
Body: { "leadId": "000123" }
```

**Response Success:**
```json
{
  "success": true,
  "message": "Documenti generati con successo",
  "data": {
    "contractId": "CTR20251017120000",
    "contractPdfUrl": "/documents/contratti/...",
    "proformaId": "PRF20251017120001",
    "proformaPdfUrl": "/documents/proforma/...",
    "tipoServizio": "BASE",
    "prezzoBase": 480.00,
    "prezzoIvaInclusa": 585.60
  }
}
```

**Response Error:**
```json
{
  "success": false,
  "errors": [
    "Campo obbligatorio mancante: cfAssistito",
    "Indirizzo Assistito mancante"
  ]
}
```

---

## 🔄 Flusso Operativo Completo

### **1. Lead Arriva dalla Landing Page**
```
Form compilato → POST /api/lead
  ├─ Salva in table 'leads'
  ├─ Status: 'NEW'
  └─ vuoleContratto: true/false
```

### **2. Generazione Documenti (se richiesto)**
```
POST /api/documents/generate { leadId }
  ├─ Recupera dati lead dal DB
  ├─ Valida campi obbligatori
  ├─ Determina tipo servizio (BASE/AVANZATO)
  ├─ Genera contratto PDF da template DOCX
  ├─ Genera proforma PDF da template DOCX
  ├─ Salva PDF in filesystem
  ├─ Inserisce record in DB (contracts, proforma)
  └─ Ritorna IDs e URLs
```

### **3. Invio Email con Allegati**
```
POST /api/contracts/send { contractId }
  ├─ Recupera PDF dal filesystem/R2
  ├─ Seleziona template email corretto
  │   ├─ email_invio_contratto_base.html
  │   └─ email_invio_contratto_avanzato.html
  ├─ Allega PDF contratto + proforma
  ├─ Invia via EmailService (RESEND/SENDGRID)
  └─ Aggiorna status → 'SENT'
```

### **4. Firma Elettronica**
```
POST /api/contracts/sign { contractId, firmaData }
  ├─ Salva firma in table 'signatures'
  ├─ Aggiorna status contratto → 'SIGNED'
  └─ Aggiorna status lead → 'CONTRACT_SIGNED'
```

### **5. Pagamento**
```
POST /api/payments { proformaId, ... }
  ├─ Registra pagamento in table 'payments'
  ├─ Aggiorna status proforma → 'PAID'
  └─ Trigger workflow attivazione servizio
```

---

## 📊 Logica Selezione Template

### **Contratto**
```typescript
if (pacchetto.includes('avanzat')) {
  template = 'Template_Contratto_Avanzato_TeleMedCare.docx'
  prezzo = 840€ + IVA (22%) = 1024.80€
} else {
  template = 'Template_Contratto_Base_TeleMedCare.docx'
  prezzo = 480€ + IVA (22%) = 585.60€
}
```

### **Email**
```typescript
if (tipo_servizio === 'AVANZATO') {
  emailTemplate = 'email_invio_contratto_avanzato.html'
} else {
  emailTemplate = 'email_invio_contratto_base.html'
}
```

### **Proforma**
```typescript
template = 'Template_Proforma_Unificato_TeleMedCare.docx'
// Unico template per entrambi i servizi
// Prezzo adattato automaticamente in base al servizio
```

---

## 🔧 Configurazione

### **Prezzi Servizi**
```typescript
// Primo anno
PREZZI = {
  BASE: 480.00,      // € netto + IVA (22%) = 585.60€
  AVANZATO: 840.00   // € netto + IVA (22%) = 1.024,80€
}

// Rinnovi (dal secondo anno)
PREZZI_RINNOVO = {
  BASE: 240.00,      // € netto + IVA (22%) = 292.80€
  AVANZATO: 600.00   // € netto + IVA (22%) = 732.00€
}

IVA_RATE = 0.22      // 22%
```

### **Directory Output**
```typescript
/documents/
  ├─ contratti/        // PDF contratti generati
  ├─ proforma/         // PDF proforma generate
  └─ contratti_firmati/ // PDF contratti firmati
```

### **Database Schema**
```sql
-- Table: contracts
CREATE TABLE contracts (
  id TEXT PRIMARY KEY,
  leadId TEXT NOT NULL,
  codice_contratto TEXT UNIQUE,
  tipo_contratto TEXT,           -- BASE, AVANZATO
  template_utilizzato TEXT,
  contenuto_html TEXT,
  pdf_url TEXT,
  pdf_generated BOOLEAN,
  prezzo_mensile DECIMAL(10,2),
  durata_mesi INTEGER,
  prezzo_totale DECIMAL(10,2),
  status TEXT,                   -- DRAFT, SENT, SIGNED, EXPIRED
  data_invio DATETIME,
  data_scadenza DATETIME,
  email_sent BOOLEAN,
  email_template_used TEXT,
  created_at DATETIME,
  updated_at DATETIME
)

-- Table: proforma
CREATE TABLE proforma (
  id TEXT PRIMARY KEY,
  contract_id TEXT NOT NULL,
  leadId TEXT NOT NULL,
  numero_proforma TEXT UNIQUE,
  data_emissione DATE,
  data_scadenza DATE,
  cliente_nome TEXT,
  cliente_cognome TEXT,
  cliente_email TEXT,
  cliente_telefono TEXT,
  cliente_indirizzo TEXT,
  cliente_citta TEXT,
  cliente_cap TEXT,
  cliente_provincia TEXT,
  cliente_codice_fiscale TEXT,
  tipo_servizio TEXT,            -- BASE, AVANZATO
  prezzo_mensile DECIMAL(10,2),
  durata_mesi INTEGER,
  prezzo_totale DECIMAL(10,2),
  pdf_url TEXT,
  pdf_generated BOOLEAN,
  template_utilizzato TEXT,
  status TEXT,                   -- DRAFT, SENT, PAID, EXPIRED
  data_invio DATETIME,
  email_sent BOOLEAN,
  email_template_used TEXT,
  created_at DATETIME,
  updated_at DATETIME
)
```

---

## ✅ Validazione Dati Lead

### **Campi Obbligatori (sempre)**
```
- nomeRichiedente
- cognomeRichiedente
- emailRichiedente
- telefonoRichiedente
- nomeAssistito
- cognomeAssistito
- dataNascitaAssistito
- luogoNascitaAssistito
- consensoPrivacy
```

### **Campi Condizionali (se vuole contratto)**

**Se intestazione = "Assistito":**
```
- cfAssistito
- indirizzoAssistito (con CAP, città, provincia)
```

**Se intestazione = "Richiedente":**
```
- cfRichiedente
- indirizzoRichiedente (con CAP, città, provincia)
- luogoNascitaRichiedente
```

---

## 🚀 Test del Sistema

### **Test Manuale:**
```bash
# 1. Crea lead di test
curl -X POST http://localhost:8787/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "nomeRichiedente": "Mario",
    "cognomeRichiedente": "Rossi",
    "emailRichiedente": "mario.rossi@test.it",
    "telefonoRichiedente": "+39 333 1234567",
    "nomeAssistito": "Giulia",
    "cognomeAssistito": "Verdi",
    "dataNascitaAssistito": "1950-03-15",
    "luogoNascitaAssistito": "Roma",
    "cfAssistito": "VRDGLI50C55H501Z",
    "indirizzoAssistito": "Via dei Fiori 25, 00100 Roma RM",
    "pacchetto": "Servizio Base",
    "vuoleContratto": true,
    "intestazioneContratto": "Assistito",
    "consensoPrivacy": true
  }'

# 2. Genera documenti
curl -X POST http://localhost:8787/api/documents/generate \
  -H "Content-Type: application/json" \
  -d '{ "leadId": "000123" }'

# 3. Verifica output
ls -la documents/contratti/
ls -la documents/proforma/
```

---

## 📝 TODO / Miglioramenti Futuri

- [ ] **Upload R2 Storage**: Salvare PDF su Cloudflare R2 invece che filesystem locale
- [ ] **LibreOffice**: Installare LibreOffice per conversione DOCX→PDF production-ready
- [ ] **CloudConvert API**: Usare servizio cloud per conversione se LibreOffice non disponibile
- [ ] **Template Email**: Creare template HTML email per invio contratti/proforma
- [ ] **Firma Digitale**: Integrare sistema firma elettronica certificata
- [ ] **Notifiche**: Sistema notifiche real-time (email, SMS, WhatsApp)
- [ ] **Dashboard**: Pannello amministrativo per monitorare documenti generati
- [ ] **Watermark**: Aggiungere watermark "BOZZA" ai contratti non firmati
- [ ] **Versioning**: Sistema versioning documenti (v1, v2, v3...)
- [ ] **Audit Trail**: Log completo di tutte le operazioni sui documenti

---

## 🔒 Sicurezza

- **Validazione Input**: Tutti i dati lead vengono validati prima della generazione
- **SQL Injection**: Uso prepared statements per tutte le query
- **XSS Protection**: Sanitizzazione placeholder prima dell'inserimento
- **Access Control**: API protette con autenticazione (TODO)
- **GDPR Compliance**: Dati personali trattati secondo normativa

---

## 📚 Documentazione Tecnica

### **Librerie Python Utilizzate**
```python
python-docx==1.1.2   # Manipolazione DOCX
reportlab==4.4.4     # Generazione PDF (se necessario)
pypdf==6.1.1         # Manipolazione PDF
```

### **Librerie TypeScript Utilizzate**
```typescript
hono                  # Framework web
@cloudflare/workers-types  # Types Cloudflare Workers
```

---

## 🎓 Come Funziona

### **1. Lettura Template DOCX**
```python
doc = Document('template.docx')
for para in doc.paragraphs:
    if '{{PLACEHOLDER}}' in para.text:
        para.text = para.text.replace('{{PLACEHOLDER}}', 'Valore Reale')
```

### **2. Conversione DOCX → PDF**
```python
# Opzione 1: LibreOffice (preferito)
subprocess.run([
    'libreoffice', '--headless', '--convert-to', 'pdf',
    '--outdir', output_dir, docx_file
])

# Opzione 2: Servizio Cloud (fallback)
# CloudConvert API, DocRaptor, etc.
```

### **3. Salvataggio Database**
```typescript
await db.prepare(`
  INSERT INTO contracts (
    id, leadId, tipo_contratto, pdf_url, ...
  ) VALUES (?, ?, ?, ?, ...)
`).bind(contractId, leadId, tipo, url, ...).run()
```

---

## 📞 Supporto

Per domande o problemi:
- **Email**: info@ecura.it
- **Sistema**: TeleMedCare V11.0
- **Versione**: Modular Enterprise

---

**Ultimo Aggiornamento**: 2025-10-17  
**Autore**: TeleMedCare Development Team
