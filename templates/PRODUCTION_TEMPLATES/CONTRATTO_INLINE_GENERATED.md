# 📄 CONTRATTO eCura - Documento Inline Generato

**Tipo**: Documento HTML generato programmaticamente (NON template file)  
**Generatore**: `generateContractHtml()` in `src/modules/workflow-email-manager.ts` (linee 53-427)  
**Formato output**: HTML string → convertito in PDF da DocuSign  
**Dimensione stimata**: ~30 KB HTML

---

## 🔧 Funzione Generatrice

```typescript
async function generateContractHtml(leadData: any, contractData: any): Promise<string>
```

**Location**: `src/modules/workflow-email-manager.ts:53-427`  
**Chiamata da**: `inviaEmailContratto()` (linea 894)

---

## 📋 Dati Input

### leadData (informazioni cliente)
```typescript
{
  id: string                           // Lead ID
  nomeRichiedente: string              // Nome care giver
  cognomeRichiedente: string           // Cognome care giver
  email: string                        // Email contatto
  telefono: string                     // Telefono contatto
  nomeAssistito: string                // Nome paziente
  cognomeAssistito: string             // Cognome paziente
  dataNascitaAssistito: string        // Data nascita (es. "15/03/1950")
  luogoNascitaAssistito: string       // Luogo nascita
  indirizzoAssistito: string          // Via, numero civico
  capAssistito: string                 // CAP spedizione
  cittaAssistito: string              // Città spedizione
  provinciaAssistito: string          // Provincia (es. "MI")
  cfAssistito: string                  // Codice fiscale assistito
  intestatarioContratto: string        // 'richiedente' | 'assistito'
  nomeIntestatario: string            // Nome intestatario (calcolato)
  cognomeIntestatario: string         // Cognome intestatario (calcolato)
  cfIntestatario: string              // CF intestatario
  indirizzoIntestatario: string       // Indirizzo intestatario
  capIntestatario: string             // CAP intestatario
  cittaIntestatario: string           // Città intestatario
  provinciaIntestatario: string       // Provincia intestatario
  luogoNascitaIntestatario: string    // Luogo nascita (solo se assistito)
  dataNascitaIntestatario: string     // Data nascita (solo se assistito)
}
```

### contractData (informazioni contratto)
```typescript
{
  contractId: string                   // ID univoco (CONTRACT_CTR-COGNOME-2026_timestamp)
  contractCode: string                 // Codice breve (CTR-COGNOME-2026)
  tipoServizio: 'BASE' | 'AVANZATO'   // Piano servizio
  servizio: string                     // 'eCura PREMIUM' | 'eCura PRO' | 'eCura FAMILY'
  prezzoBase: number                   // Prezzo IVA esclusa (es. 990.00)
  prezzoIvaInclusa: number            // Prezzo IVA inclusa (es. 1207.80)
}
```

---

## 🎨 Struttura HTML Generato

### 1. Header - Carta Intestata Medica GB
```html
<div class="letterhead">
  <div class="letterhead-logo">
    <img src="[MEDICAGB_LOGO_BASE64]" alt="Medica GB Logo">
  </div>
  <div class="letterhead-info">
    <h3>Medica GB S.r.l.</h3>
    <p>Corso Garibaldi 34 – 20121 Milano</p>
    <p>PEC: medicagbsrl@pecimprese.it</p>
    <p>Codice Fiscale e P.IVA: 12435130963</p>
  </div>
</div>
```

### 2. Titolo
```html
<h1>SCRITTURA PRIVATA</h1>
```

### 3. Parti Contraenti

#### Parte A: Medica GB S.r.l.
```html
<div class="party">
  <p><strong>Medica GB S.r.l.</strong>, con sede in Corso Garibaldi 34 
  a Milano 20121 e con Partita IVA e registro imprese 12435130963, 
  in persona dell'Amministratore Stefania Rocca</p>
  <p class="breviter">(breviter Medica GB)</p>
</div>
```

#### Parte B: Il Cliente (intestatario)
**CASO 1: Intestatario ≠ Assistito** (intestatarioContratto = 'richiedente')
```html
<div class="party">
  <p>Sig. <span class="highlight">[Nome] [Cognome]</span>, 
  residente e domiciliato/a in <span class="highlight">[Indirizzo]</span> 
  e con codice fiscale <span class="highlight">[CF]</span>.</p>
  
  <p><strong>Contatti:</strong> telefono [telefono] – e-mail [email]</p>
  
  <p><strong>Indirizzo di spedizione:</strong> 
  [Nome Assistito] [Cognome Assistito] - [Indirizzo Assistito]</p>
  
  <p class="breviter">(breviter Il Cliente)</p>
</div>
```

**CASO 2: Intestatario = Assistito** (intestatarioContratto = 'assistito')
```html
<div class="party">
  <p>Sig. <span class="highlight">[Nome] [Cognome]</span> 
  nato/a a <span class="highlight">[Luogo Nascita]</span> 
  il <span class="highlight">[Data Nascita]</span>, 
  residente e domiciliato/a in <span class="highlight">[Indirizzo]</span> 
  e con codice fiscale <span class="highlight">[CF]</span>.</p>
  
  <p><strong>Riferimenti:</strong><br>
  Signor [Nome Care Giver] [Cognome Care Giver] – 
  telefono [telefono] – e-mail [email]</p>
  
  <p><strong>Indirizzo di spedizione:</strong> [Indirizzo Assistito]</p>
  
  <p class="breviter">(breviter Il Cliente)</p>
</div>
```

### 4. Premessa
```html
<div class="premises">
  <p><strong>premesso che</strong></p>
  <ul>
    <li>Medica GB eroga servizi di assistenza domiciliare con 
    tecnologie innovative...</li>
    <li>Medica GB si avvale della consulenza di Medici, Terapisti, 
    Infermieri e Operatori Socio Sanitari...</li>
  </ul>
  <p><strong>Tanto premesso,</strong></p>
  <p>si conviene e stabilisce quanto segue</p>
</div>
```

### 5. Oggetto del Contratto
```html
<h2>Oggetto del Contratto</h2>
<p>L'oggetto del presente Contratto è l'erogazione del 
"Servizio di TeleAssistenza [base/avanzato]" mediante 
l'utilizzo del Dispositivo [SiDLY Vital Care / SiDLY Care PRO].</p>

<div class="feature-list">
  <p><strong>Rilevatore automatico di caduta:</strong> ...</p>
  <p><strong>Pulsante SOS:</strong> ...</p>
  <p><strong>Comunicazione vocale bidirezionale:</strong> ...</p>
  <p><strong>Posizione gps e gps-assistito:</strong> ...</p>
  <p><strong>Misurazioni della frequenza cardiaca e saturazione:</strong> ...</p>
  <p><strong>Assistenza vocale:</strong> ...</p>
  <p><strong>Promemoria per l'assunzione dei farmaci:</strong> ...</p>
  <p><strong>Registrazione dei passi:</strong> ...</p>
</div>
```

### 6. Durata del Servizio
```html
<h2>Durata del Servizio</h2>
<p>Il Servizio di TeleAssistenza [base/avanzato] ha una durata 
di 12 mesi a partire da <span class="highlight">[dataInizio]</span> 
fino al <span class="highlight">[dataScadenza]</span>.</p>
```

### 7. Tariffa del Servizio

**Piano BASE:**
```html
<h2>Tariffa del Servizio</h2>
<p>La tariffa annuale per il primo anno è pari a 
<span class="highlight">[prezzoBase] €</span> (47€/mese) 
+ IVA 22% (totale <span class="highlight">[totale] € inclusa iva</span>) 
e include:</p>
<ul>
  <li>Dispositivo [dispositivo] (hardware)</li>
  <li>Configurazione e Piattaforma Web/APP per 12 mesi</li>
  <li>SIM per trasmissione dati e comunicazione vocale per 12 mesi</li>
</ul>
<p>Per i successivi anni la tariffa sarà 
<span class="highlight">[rinnovoBase] €</span> (25€/mese) + IVA 22%</p>
```

**Piano AVANZATO:**
```html
<p>La tariffa annuale per il primo anno è pari a 
<span class="highlight">[prezzoBase] €</span> (70€/mese) 
+ IVA 22% (totale <span class="highlight">[totale] € inclusa iva</span>)</p>
<p>Per i successivi anni la tariffa sarà 
<span class="highlight">[rinnovoBase] €</span> (62.50€/mese) + IVA 22%</p>
```

### 8. Metodo di Pagamento
```html
<h2>Metodo di pagamento</h2>
<p>Medica GB emetterà fattura anticipata di 12 mesi all'attivazione 
del Servizio e il Cliente procederà al pagamento tramite bonifico bancario</p>

<div class="payment-details">
  <p><strong>Intestato a:</strong> Medica GB Srl</p>
  <p><strong>Causale:</strong> [Cognome] [Nome] - SERVIZI PER [DISPOSITIVO]</p>
  <p><strong>Banca Popolare di Milano - Iban:</strong> IT97L0503401727000000003519</p>
</div>
```

### 9. Clausole Legali
```html
<h2>Riservatezza ed esclusiva</h2>
<p>Il Cliente e Medica GB si impegnano reciprocamente a non divulgare...</p>

<h2>Foro competente</h2>
<p>Ogni eventuale contestazione sarà definita alla cognizione 
esclusiva del Foro di Milano.</p>
```

### 10. Firme
```html
<div class="signature-section">
  <div><p>Milano, lì <span class="highlight">[data]</span></p></div>
</div>

<div class="signature-section">
  <div class="signature-block">
    <p><strong>Medica GB S.r.l.</strong></p>
  </div>
  <div class="signature-block">
    <p><strong>Il Cliente</strong></p>
  </div>
</div>
```

### 11. Footer
```html
<div class="footer">
  <p><strong>Medica GB S.r.l.</strong></p>
  <p>Corso Garibaldi 34 – 20121 Milano</p>
  <p>PEC: medicagbsrl@pecimprese.it</p>
  <p>Codice Fiscale e P.IVA: 12435130963 - REA: MI-2661409</p>
  <p>www.medicagb.it</p>
</div>
```

---

## 💰 Prezzi per Servizio/Piano

| Servizio | Piano | Prezzo Base | IVA 22% | Totale | Mensile | Rinnovo Base |
|---|---|---|---|---|---|---|
| eCura FAMILY | BASE | €564.00 | €124.08 | €688.08 | €47.00 | €300.00 |
| eCura FAMILY | AVANZATO | €792.00 | €174.24 | €966.24 | €66.00 | €300.00 |
| eCura PRO | BASE | €564.00 | €124.08 | €688.08 | €47.00 | €300.00 |
| eCura PRO | AVANZATO | €840.00 | €184.80 | €1,024.80 | €70.00 | €750.00 |
| eCura PREMIUM | BASE | €720.00 | €158.40 | €878.40 | €60.00 | €300.00 |
| eCura PREMIUM | AVANZATO | €990.00 | €217.80 | €1,207.80 | €82.50 | €750.00 |

**Fonte**: `src/modules/ecura-pricing.ts` → `getPricing()` function

---

## 📐 Mapping Dispositivi

| Servizio | Dispositivo Contratto |
|---|---|
| eCura PREMIUM | SiDLY Vital Care |
| eCura PRO | SiDLY Care PRO |
| eCura FAMILY | SiDLY Care PRO |

**Logica**: Linea 56 in `generateContractHtml()`
```typescript
const dispositivo = servizioNome.includes('PREMIUM') 
  ? 'SiDLY Vital Care' 
  : 'SiDLY Care PRO'
```

---

## 🎯 Logica Intestatario Contratto

### CASO 1: intestatarioContratto = 'richiedente'
- **Intestatario**: Care giver (richiedente)
- **NON mostra**: luogo e data di nascita
- **Mostra**: solo CF, indirizzo, contatti
- **Spedizione**: a casa dell'assistito (diverso dall'intestatario)

### CASO 2: intestatarioContratto = 'assistito'
- **Intestatario**: Paziente (assistito)
- **Mostra**: luogo e data di nascita, CF, indirizzo
- **Riferimenti**: care giver come contatto secondario
- **Spedizione**: stesso indirizzo dell'intestatario

---

## 🎨 Stili CSS Applicati

```css
body {
  font-family: 'Arial', 'Helvetica', sans-serif;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #333;
  background-color: #fff;
}

.letterhead {
  border-top: 3px solid #0066cc;
  border-bottom: 3px solid #0066cc;
  padding: 20px;
  margin-bottom: 30px;
}

.party {
  margin: 20px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-left: 4px solid #0066cc;
}

.highlight {
  font-weight: bold;
}

.payment-details {
  background-color: #f5f5f5;
  padding: 15px;
  margin: 15px 0;
  border: 1px solid #ddd;
}

.signature-section {
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
}

.footer {
  margin-top: 50px;
  padding-top: 20px;
  border-top: 2px solid #0066cc;
  text-align: center;
  font-size: 12px;
  color: #666;
}
```

---

## 📤 Flusso Generazione e Invio

### 1. Trigger
- **Endpoint**: `POST /api/leads/:id/send-contract`
- **Utente**: Operatore clicca "Invia Contratto" in dashboard
- **Location**: `src/index.tsx:8786-8998`

### 2. Generazione HTML
```typescript
// Linea 894 in workflow-email-manager.ts
const contractHtml = await generateContractHtml(leadData, contractData)
console.log(`📋 [CONTRATTO] HTML generato (${contractHtml.length} chars)`)
```

### 3. Salvataggio Database
```sql
INSERT INTO contracts (
  id, leadId, codice_contratto, tipo_contratto,
  contenuto_html, email_sent, email_template_used,
  servizio, piano, prezzo_mensile, durata_mesi,
  prezzo_totale, created_at
) VALUES (?, ?, ?, ?, ?, 1, 'email_invio_contratto', ?, ?, ?, 12, ?, ?)
```

### 4. Invio Email + Allegati
```typescript
// Linea 1064-1149 in workflow-email-manager.ts
await emailService.sendEmail({
  to: leadData.email,
  from: 'info@telemedcare.it',
  subject: `eCura - Contratto ${servizioNome}`,
  html: emailHtml,  // Template email_invio_contratto.html
  attachments: [
    {
      filename: `Contratto_${contractData.contractCode}.pdf`,
      content: contractPdfBase64,
      contentType: 'application/pdf'
    },
    {
      filename: brochureFilename,  // Brochure device-specific
      content: brochurePdfBase64,
      contentType: 'application/pdf'
    }
  ]
})
```

### 5. Conversione PDF (DocuSign)
- HTML contratto → inviato a DocuSign Envelope
- DocuSign genera PDF firmabile
- Link firma → inviato al cliente via email

---

## 🔐 Dati Sensibili

**Attenzione**: Il contratto contiene:
- ✅ Nome e Cognome (intestatario + assistito)
- ✅ Codice Fiscale
- ✅ Indirizzo completo
- ✅ Email e telefono
- ✅ Data e luogo di nascita (se intestatario = assistito)
- ✅ Dati sanitari (tipo servizio richiesto)

**GDPR Compliance**:
- Contratto salvato in DB crittografato
- Email inviata tramite TLS
- Firma digitale DocuSign certificata
- Log accessi tracciati

---

## 📝 Note Tecniche

1. **Logo Medica GB**: Embedded come base64 da `src/modules/medicagb-logo.ts`
2. **Formato Date**: `toLocaleDateString('it-IT')` → "8 marzo 2026"
3. **Calcolo Prezzi**: Import dinamico da `ecura-pricing.ts` → no hardcoded prices
4. **Template String**: Usa backticks (`) per multi-line HTML
5. **Variabili Dinamiche**: Interpolate con `${variabile}`
6. **Conditional Rendering**: Usa ternary `${condizione ? 'A' : 'B'}`

---

## 🚀 Deploy e Test

**Test URL**:
- Preview: https://test-environment.telemedcare-v12.pages.dev
- Production: https://telemedcare-v12.pages.dev

**Test Steps**:
1. Crea lead "eCura PREMIUM AVANZATO"
2. Completa tutti i campi obbligatori
3. Clicca "Invia Contratto" in dashboard
4. Verifica email con contratto PDF allegato
5. Controlla prezzi: €990.00 + IVA = €1,207.80
6. Verifica dispositivo: "SiDLY Vital Care"
7. Controlla intestatario corretto (richiedente/assistito)

---

**Ultimo aggiornamento**: 08 Marzo 2026  
**Versione**: 12.0 - Generazione Contratto Dinamico
