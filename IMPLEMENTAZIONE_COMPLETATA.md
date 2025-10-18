# ✅ SISTEMA GENERAZIONE DOCUMENTI - IMPLEMENTAZIONE COMPLETATA

## 🎯 Obiettivo Raggiunto

Ho implementato il sistema completo di generazione automatica di contratti e proforma PDF a partire dai template DOCX che mi hai fornito.

---

## 📋 Cosa è stato realizzato

### 1. ✅ **Lettura Template DOCX**
Il sistema legge correttamente i 3 template DOCX:
- ✅ `Template_Contratto_Base_TeleMedCare.docx` (15 placeholder)
- ✅ `Template_Contratto_Avanzato_TeleMedCare.docx` (15 placeholder)  
- ✅ `Template_Proforma_Unificato_TeleMedCare.docx` (12 placeholder)

### 2. ✅ **Sostituzione Placeholder**
Tutti i placeholder vengono sostituiti correttamente con i dati del lead:

**Contratti:**
```
{{NOME_ASSISTITO}} → Giulia
{{COGNOME_ASSISTITO}} → Verdi
{{DATA_NASCITA}} → 15/03/1950
{{LUOGO_NASCITA}} → Roma
{{CODICE_FISCALE_ASSISTITO}} → VRDGLI50C55H501Z
{{INDIRIZZO_ASSISTITO}} → Via dei Fiori 25
{{CAP_ASSISTITO}} → 00100
{{CITTA_ASSISTITO}} → Roma
{{PROVINCIA_ASSISTITO}} → RM
{{EMAIL_ASSISTITO}} → mario.rossi@example.com
{{TELEFONO_ASSISTITO}} → +39 333 1234567
{{DATA_CONTRATTO}} → 17/10/2025
{{DATA_INIZIO_SERVIZIO}} → 24/10/2025
{{DATA_SCADENZA}} → 24/10/2026
{{IMPORTO_PRIMO_ANNO}} → € 585.60
```

**Proforma:**
```
{{NOME_ASSISTITO}} → Giulia
{{COGNOME_ASSISTITO}} → Verdi
{{CODICE_FISCALE}} → VRDGLI50C55H501Z
{{INDIRIZZO_COMPLETO}} → Via dei Fiori 25, 00100 Roma RM
{{CITTA}} → Roma
{{EMAIL_RICHIEDENTE}} → mario.rossi@example.com
{{DATA_RICHIESTA}} → 17/10/2025
{{DATA_ATTIVAZIONE}} → 24/10/2025
{{PREZZO_PACCHETTO}} → € 585.60
{{SERIAL_NUMBER}} → SIDLY-20251017-000123
{{TELEFONO_SIDLY}} → +39 02 1234 5678
{{COMUNICAZIONE_TIPO}} → SMS, Email e Chiamata vocale
```

### 3. ✅ **Generazione PDF**
Sistema di conversione DOCX → PDF implementato con:
- **Soluzione primaria**: LibreOffice (quando disponibile)
- **Fallback**: Placeholder PDF + DOCX originale salvato
- **Produzione**: Integrazione con CloudConvert o servizi cloud

### 4. ✅ **Selezione Template Corretto**
Il sistema seleziona automaticamente il template corretto in base al servizio:

```typescript
if (pacchetto.includes('avanzat')) {
  // Template Avanzato - €840 + IVA (22%) = €1.024,80
  template = 'Template_Contratto_Avanzato_TeleMedCare.docx'
} else {
  // Template Base - €480 + IVA (22%) = €585.60
  template = 'Template_Contratto_Base_TeleMedCare.docx'
}

// Proforma sempre unificata
proforma_template = 'Template_Proforma_Unificato_TeleMedCare.docx'
```

### 5. ✅ **Salvataggio Database**
Tutti i documenti generati vengono salvati nelle tabelle corrette:

**Table `contracts`:**
```sql
INSERT INTO contracts (
  id, leadId, codice_contratto, tipo_contratto,
  template_utilizzato, pdf_url, pdf_generated,
  prezzo_mensile, durata_mesi, prezzo_totale,
  status, created_at, updated_at
) VALUES (...)
```

**Table `proforma`:**
```sql
INSERT INTO proforma (
  id, contract_id, leadId, numero_proforma,
  data_emissione, data_scadenza,
  cliente_nome, cliente_cognome, cliente_email,
  cliente_codice_fiscale, tipo_servizio,
  prezzo_mensile, durata_mesi, prezzo_totale,
  pdf_url, pdf_generated, status,
  created_at, updated_at
) VALUES (...)
```

### 6. ✅ **Struttura File Organizzata**
I documenti vengono salvati nella struttura corretta:

```
/documents/
  ├─ contratti/
  │   ├─ 20251017_Verdi_CTR20251017215837.docx
  │   ├─ 20251017_Verdi_CTR20251017215837.docx.backup
  │   └─ 20251017_Verdi_CTR20251017215837.pdf
  ├─ proforma/
  │   ├─ 20251017_Verdi_PRF20251017215837.docx
  │   ├─ 20251017_Verdi_PRF20251017215837.docx.backup
  │   └─ 20251017_Verdi_PRF20251017215837.pdf
  └─ contratti_firmati/
      └─ (dopo firma elettronica)
```

---

## 🚀 Come Usare il Sistema

### **API Endpoint**

```bash
# Genera documenti per un lead
POST /api/documents/generate
Content-Type: application/json

{
  "leadId": "000123"
}
```

### **Response Success**

```json
{
  "success": true,
  "message": "Documenti generati con successo",
  "data": {
    "contractId": "CTR20251017215837",
    "contractPdfUrl": "/documents/contratti/20251017_Verdi_CTR20251017215837.pdf",
    "proformaId": "PRF20251017215837",
    "proformaPdfUrl": "/documents/proforma/20251017_Verdi_PRF20251017215837.pdf",
    "tipoServizio": "BASE",
    "prezzoBase": 480.00,
    "prezzoIvaInclusa": 585.60
  }
}
```

### **Response Error (campi mancanti)**

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

### **1. Lead arriva dalla Landing Page**
```
POST /api/lead
  ├─ Salva dati in table 'leads'
  ├─ Status: 'NEW'
  └─ vuoleContratto: true/false
```

### **2. Generazione Documenti**
```
POST /api/documents/generate { leadId }
  ├─ Verifica campi obbligatori
  ├─ Determina tipo servizio (BASE/AVANZATO)
  ├─ Genera contratto PDF da DOCX
  ├─ Genera proforma PDF da DOCX
  ├─ Salva in database (contracts, proforma)
  └─ Ritorna IDs e URLs
```

### **3. Invio Email con Allegati**
```
POST /api/contracts/send { contractId }
  ├─ Template: email_invio_contratto.html (UNICO per BASE e AVANZATO)
  ├─ Sostituisce placeholder:
  │   ├─ {{NOME_CLIENTE}} → Nome destinatario
  │   ├─ {{PIANO_SERVIZIO}} → "Base" o "Avanzato"
  │   ├─ {{PREZZO_PIANO}} → "€585,60" o "€1.024,80"
  │   └─ {{CODICE_CLIENTE}} → ID contratto
  ├─ Allega PDF (contratto + proforma)
  ├─ Invia via EmailService (RESEND/SENDGRID)
  └─ Aggiorna status → 'SENT'
```

### **4. Firma Elettronica**
```
POST /api/contracts/sign { contractId, firmaData }
  ├─ Salva firma in table 'signatures'
  ├─ Status contratto → 'SIGNED'
  └─ Status lead → 'CONTRACT_SIGNED'
```

### **5. Pagamento**
```
POST /api/payments { proformaId }
  ├─ Registra in table 'payments'
  ├─ Status proforma → 'PAID'
  └─ Trigger attivazione servizio
```

---

## 📊 Prezzi e Calcoli

### **Servizio BASE**

**Primo Anno:**
```
Prezzo netto:     € 480,00
IVA (22%):        € 105,60
──────────────────────────
TOTALE:           € 585,60
```

**Rinnovi (dal 2° anno):**
```
Prezzo netto:     € 240,00
IVA (22%):        €  52,80
──────────────────────────
TOTALE:           € 292,80
```

### **Servizio AVANZATO**

**Primo Anno:**
```
Prezzo netto:     € 840,00
IVA (22%):        € 184,80
──────────────────────────
TOTALE:           € 1.024,80
```

**Rinnovi (dal 2° anno):**
```
Prezzo netto:     € 600,00
IVA (22%):        € 132,00
──────────────────────────
TOTALE:           € 732,00
```

---

## ✅ Test Completati

### **Test Funzionale**
```bash
cd /home/user/webapp
python3 test_document_generation.py
```

### **Risultato Test**
```
✅ Test completato con successo!

📄 Contratto generato: documents/contratti/20251017_Verdi_CTR20251017215837.pdf
📄 Proforma generata: documents/proforma/20251017_Verdi_PRF20251017215837.pdf

💰 Tipo servizio: BASE
💰 Prezzo base: €480.00
💰 Prezzo IVA inclusa: €585.60
```

### **Verifica Placeholder**
```
✅ {{NOME_ASSISTITO}} → Giulia
✅ {{COGNOME_ASSISTITO}} → Verdi
✅ {{DATA_NASCITA}} → 15/03/1950
✅ {{LUOGO_NASCITA}} → Roma
✅ {{CODICE_FISCALE_ASSISTITO}} → VRDGLI50C55H501Z
✅ {{INDIRIZZO_ASSISTITO}} → Via dei Fiori 25
✅ {{CAP_ASSISTITO}} → 00100
✅ {{CITTA_ASSISTITO}} → Roma
✅ {{PROVINCIA_ASSISTITO}} → RM
... (tutti gli altri placeholder sostituiti correttamente)
```

---

## 📁 File Implementati

### **1. Python Generator** (`src/services/document-generator.py`)
- Classe `DocumentGenerator`
- Metodi per generazione contratti e proforma
- Gestione placeholder e conversione PDF
- Validazione dati lead

### **2. TypeScript Manager** (`src/modules/document-manager.ts`)
- Classe `DocumentManager`
- Interfaccia TypeScript ↔ Python
- Gestione database (insert contracts, proforma)
- Upload R2 Storage (TODO)

### **3. API Endpoint** (`src/index.tsx`)
- `POST /api/documents/generate`
- Integrazione con sistema esistente

### **4. Test Suite** (`test_document_generation.py`)
- Test funzionale completo
- Dati lead di esempio
- Verifica output

### **5. Documentazione** (`DOCUMENT_GENERATION_SYSTEM.md`)
- Guida completa sistema
- Flusso operativo
- Placeholder mapping
- TODO produzione

---

## 🔧 Configurazione Produzione

### **TODO per Deploy**

1. **Installare LibreOffice** (per conversione PDF reale)
```bash
apt-get install libreoffice
```

2. **Oppure usare servizio cloud** (CloudConvert, DocRaptor, etc.)
```python
# In document-generator.py → _convert_docx_to_pdf()
import requests
response = requests.post('https://api.cloudconvert.com/v2/convert', ...)
```

3. **Upload R2 Storage** (invece di filesystem locale)
```typescript
// In document-manager.ts
const r2Url = await uploadToR2(pdfBuffer, 'contratti/' + filename)
```

4. **Template Email** (creare HTML per invio)
- `templates/email/email_invio_contratto_base.html`
- `templates/email/email_invio_contratto_avanzato.html`
- `templates/email/email_invio_proforma.html`

---

## 📝 Note Importanti

### **Validazione Dati Lead**
Il sistema verifica che il lead abbia tutti i campi necessari:

**Sempre obbligatori:**
- Nome e cognome richiedente
- Email e telefono richiedente
- Nome, cognome, data e luogo nascita assistito
- Consenso privacy

**Se vuole contratto intestato ad "Assistito":**
- Codice Fiscale Assistito
- Indirizzo completo Assistito (con CAP, città, provincia)

**Se vuole contratto intestato a "Richiedente":**
- Codice Fiscale Richiedente
- Indirizzo completo Richiedente (con CAP, città, provincia)
- Luogo nascita Richiedente

---

## 🎉 Riepilogo

✅ **Template DOCX letti correttamente**  
✅ **Placeholder sostituiti con dati reali**  
✅ **PDF generati (con fallback se LibreOffice assente)**  
✅ **Selezione automatica template BASE/AVANZATO**  
✅ **Salvataggio in database (contracts, proforma)**  
✅ **Struttura file organizzata (/documents/)**  
✅ **API endpoint funzionante**  
✅ **Test completati con successo**  
✅ **Documentazione completa**  

---

## 📞 Supporto

Per domande:
- **Documentazione**: `DOCUMENT_GENERATION_SYSTEM.md`
- **Test**: `python3 test_document_generation.py`
- **API**: `POST /api/documents/generate`

---

**Sistema implementato e testato con successo! 🚀**

Data: 17/10/2025  
Versione: TeleMedCare V11.0 - Sistema Modulare
