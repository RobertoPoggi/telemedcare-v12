# 🧾 PROFORMA / FATTURA PROFORMA eCura - Documento Inline Generato

**Tipo**: Documento HTML generato programmaticamente (NON template file)  
**Generatore**: `ProformaGenerator.getProformaTemplate()` in `src/modules/proforma-generator.ts` (linee 216-452)  
**Formato output**: HTML string → convertito in PDF (base64)  
**Dimensione stimata**: ~18 KB HTML

---

## 🔧 Classe Generatrice

```typescript
export class ProformaGenerator {
  static async generateProforma(data: ProformaData, db: any): Promise<ProformaGenerated>
  private static getProformaTemplate(piano: 'BASE' | 'AVANZATO'): string
  private static generateProformaNumber(): string
  private static calculateScadenza(giorni: number): string
}
```

**Location**: `src/modules/proforma-generator.ts:62-453`  
**Entry point**: `generateProforma()` (linea 67)  
**Template**: `getProformaTemplate()` (linea 216)

---

## 📋 Dati Input

### ProformaData Interface
```typescript
{
  // Dati proforma
  numeroProforma: string              // "PF-202603-ABC123" (auto-generato)
  dataEmissione: string              // "08/03/2026"
  dataScadenza: string               // "15/03/2026" (7 giorni)
  
  // Cliente
  nomeCliente: string                // "Mario"
  cognomeCliente: string             // "Rossi"
  emailCliente: string               // "mario.rossi@example.com"
  telefonoCliente: string            // "+39 335 1234567"
  indirizzoCliente: string           // "Via Roma 123, 20100 Milano"
  codiceFiscaleCliente: string       // "RSSMRA70A01F205X"
  
  // Servizio eCura
  servizio: 'FAMILY' | 'PRO' | 'PREMIUM'
  piano: 'BASE' | 'AVANZATO'
  descrizioneServizio: string        // "Servizio di TeleAssistenza avanzato 12 mesi"
  dispositivo: string                // "SiDLY Vital Care" | "SiDLY Care PRO"
  
  // Prezzi
  importoBase: number                // 990.00 (IVA esclusa)
  iva: number                        // 217.80 (22%)
  totale: number                     // 1207.80 (IVA inclusa)
  
  // Contratto collegato
  codiceContratto: string            // "CTR-ROSSI-2026"
  
  // Pagamento
  linkPagamentoStripe: string        // URL Stripe Payment Link
  scadenzaPagamento: string          // "15/03/2026"
}
```

---

## 🎨 Struttura HTML Generato

### 1. Header - Logo eCura
```html
<div class="header">
  <div class="logo">🏥 eCura - Medica GB S.r.l.</div>
  <div style="font-size: 14px; color: #666;">
    Startup Innovativa a Vocazione Sociale<br>
    P.IVA: 12435130963 | Reg. Imprese Milano<br>
    Corso Garibaldi 34, 20121 Milano
  </div>
</div>
```

### 2. Titolo
```html
<h1 class="proforma-title">📄 PROFORMA / FATTURA PROFORMA</h1>
```

### 3. Info Proforma
```html
<div class="info-box">
  <table style="width: 100%;">
    <tr>
      <td><strong>Numero Proforma:</strong></td>
      <td>PF-202603-ABC123</td>
    </tr>
    <tr>
      <td><strong>Data Emissione:</strong></td>
      <td>08/03/2026</td>
    </tr>
    <tr>
      <td><strong>Scadenza Pagamento:</strong></td>
      <td>15/03/2026</td>
    </tr>
    <tr>
      <td><strong>Contratto Collegato:</strong></td>
      <td>CTR-ROSSI-2026</td>
    </tr>
  </table>
</div>
```

### 4. Dati Cliente
```html
<div class="info-box">
  <h3 style="margin-top: 0; color: #3b82f6;">👤 CLIENTE</h3>
  <p>
    <strong>Nome e Cognome:</strong> Mario Rossi<br>
    <strong>Email:</strong> mario.rossi@example.com<br>
    <strong>Telefono:</strong> +39 335 1234567<br>
    <strong>Indirizzo:</strong> Via Roma 123, 20100 Milano<br>
    <strong>Codice Fiscale:</strong> RSSMRA70A01F205X
  </p>
</div>
```

### 5. Tabella Servizi
```html
<h3 style="color: #3b82f6;">📦 SERVIZI</h3>
<table class="table">
  <thead>
    <tr>
      <th>Descrizione</th>
      <th>Quantità</th>
      <th style="text-align: right;">Importo</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>eCura PREMIUM AVANZATO</strong><br>
        <small>Servizio di TeleAssistenza avanzato 12 mesi</small><br>
        <small>Dispositivo: SiDLY Vital Care</small><br>
        <small>Durata: 12 mesi (primo anno)</small>
      </td>
      <td>1</td>
      <td style="text-align: right;">€990,00</td>
    </tr>
  </tbody>
</table>
```

### 6. Box Totale
```html
<div class="total-box">
  <table style="width: 100%;">
    <tr>
      <td><strong>Imponibile:</strong></td>
      <td style="text-align: right;">€990,00</td>
    </tr>
    <tr>
      <td><strong>IVA 22%:</strong></td>
      <td style="text-align: right;">€217,80</td>
    </tr>
    <tr style="border-top: 2px solid #3b82f6;">
      <td><strong style="font-size: 18px;">TOTALE DA PAGARE:</strong></td>
      <td style="text-align: right;">
        <div class="amount">€1.207,80</div>
      </td>
    </tr>
  </table>
</div>
```

### 7. Pulsante Pagamento
```html
<div style="text-align: center; margin: 40px 0;">
  <h3 style="color: #3b82f6;">💳 PROCEDI AL PAGAMENTO</h3>
  <p>Paga in modo sicuro con carta di credito/debito o bonifico bancario</p>
  
  <a href="https://checkout.stripe.com/..." class="payment-button">
    💳 PAGA ORA €1.207,80
  </a>
  
  <p style="font-size: 14px; color: #666;">
    🔒 Pagamento sicuro tramite Stripe<br>
    ⏰ Scadenza: 15/03/2026
  </p>
</div>
```

### 8. Modalità di Pagamento
```html
<div class="info-box">
  <h4 style="margin-top: 0; color: #3b82f6;">📋 MODALITÀ DI PAGAMENTO</h4>
  
  <p><strong>1. Pagamento Online (Consigliato):</strong><br>
  Clicca sul pulsante "PAGA ORA" e completa il pagamento con carta 
  di credito/debito in modo sicuro tramite Stripe.</p>
  
  <p><strong>2. Bonifico Bancario:</strong><br>
  IBAN: <strong>IT97L0503401727000000003519</strong><br>
  Intestato a: <strong>Medica GB S.r.l.</strong><br>
  Causale: <strong>Proforma PF-202603-ABC123</strong></p>
  
  <p style="font-size: 12px; color: #666;">
  ⚠️ In caso di bonifico, inviare ricevuta a info@telemedcare.it
  </p>
</div>
```

### 9. Box Detrazione Fiscale
```html
<div class="info-box" style="background: #fef3c7; border-left: 4px solid #f59e0b;">
  <h4 style="margin-top: 0; color: #92400e;">💰 DETRAZIONE FISCALE 19%</h4>
  <p>Il servizio eCura è detraibile come spesa sanitaria nella 
  dichiarazione dei redditi (730/Unico).</p>
  <p><strong>Risparmio fiscale stimato:</strong> Fino a €217,80 
  di detrazione annuale</p>
  <p style="font-size: 12px;">Riceverai tutta la documentazione 
  necessaria per il 730</p>
</div>
```

### 10. Footer
```html
<div class="footer">
  <p><strong style="color: #3b82f6; font-size: 14px;">
  Contatti Medica GB S.r.l. - eCura</strong></p>
  <p>
    📧 Email: info@telemedcare.it | 
    📞 Telefono: 02 8715 6826 | 
    📱 Assistenza: 335 730 1206
  </p>
  <p>
    🏢 Milano: Corso Garibaldi 34, 20121 | 
    🏢 Genova: Via delle Eriche 53, 16148
  </p>
  <p>🌐 Web: www.ecura.it</p>
  <p style="margin-top: 15px; font-size: 11px; font-style: italic;">
    Medica GB S.r.l. - P.IVA 12435130963 | Reg. Imprese Milano<br>
    Questa è una proforma. Dopo il pagamento riceverai la fattura definitiva.
  </p>
</div>
```

---

## 💰 Esempi Prezzi per Servizio/Piano

| Servizio | Piano | Importo Base | IVA 22% | Totale | Numero Proforma | Contratto |
|---|---|---|---|---|---|---|
| eCura FAMILY | BASE | €564,00 | €124,08 | €688,08 | PF-202603-XXX | CTR-ROSSI-2026 |
| eCura FAMILY | AVANZATO | €792,00 | €174,24 | €966,24 | PF-202603-YYY | CTR-ROSSI-2026 |
| eCura PRO | BASE | €564,00 | €124,08 | €688,08 | PF-202603-ZZZ | CTR-BIANCHI-2026 |
| eCura PRO | AVANZATO | €840,00 | €184,80 | €1.024,80 | PF-202603-AAA | CTR-BIANCHI-2026 |
| eCura PREMIUM | BASE | €720,00 | €158,40 | €878,40 | PF-202603-BBB | CTR-VERDI-2026 |
| eCura PREMIUM | AVANZATO | €990,00 | €217,80 | €1.207,80 | PF-202603-CCC | CTR-VERDI-2026 |

---

## 🎨 Stili CSS Applicati

```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  border-bottom: 3px solid #3b82f6;
  padding-bottom: 20px;
  margin-bottom: 30px;
}

.logo {
  color: #3b82f6;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.proforma-title {
  font-size: 24px;
  color: #3b82f6;
  margin: 20px 0;
  text-align: center;
}

.info-box {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
}

.table th {
  background: #f3f4f6;
  font-weight: bold;
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.total-box {
  background: linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%);
  border: 2px solid #3b82f6;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  text-align: right;
}

.total-box .amount {
  font-size: 32px;
  font-weight: bold;
  color: #3b82f6;
}

.payment-button {
  display: inline-block;
  background: #22c55e;
  color: white;
  padding: 15px 40px;
  text-decoration: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  margin: 20px 0;
}

.payment-button:hover {
  background: #16a34a;
}

.footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 2px solid #e5e7eb;
  font-size: 12px;
  color: #666;
  text-align: center;
}
```

---

## 📤 Flusso Generazione e Invio

### 1. Trigger
- **Webhook DocuSign**: `envelope.completed` (contratto firmato)
- **Handler**: `src/modules/docusign-webhook-handler.ts:214`
- **Chiamata**: `ProformaGenerator.generateProforma()`

### 2. Generazione Numero Proforma
```typescript
// Linea 141-147 in proforma-generator.ts
private static generateProformaNumber(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  return `PF-${year}${month}-${random}`
}
// Esempio output: "PF-202603-ABC123"
```

### 3. Calcolo Scadenza
```typescript
// Linea 153-157 in proforma-generator.ts
private static calculateScadenza(giorni: number): string {
  const scadenza = new Date()
  scadenza.setDate(scadenza.getDate() + giorni)
  return scadenza.toLocaleDateString('it-IT')
}
// Default: 7 giorni
```

### 4. Render Template
```typescript
// Linea 163-209 in proforma-generator.ts
const template = this.getProformaTemplate(data.piano)

const variables = {
  NUMERO_PROFORMA: data.numeroProforma,
  DATA_PROFORMA: data.dataEmissione,
  DATA_SCADENZA: data.dataScadenza,
  NOME_CLIENTE: data.nomeCliente,
  COGNOME_CLIENTE: data.cognomeCliente,
  IMPORTO_BASE: data.importoBase.toFixed(2).replace('.', ','),
  IVA: data.iva.toFixed(2).replace('.', ','),
  TOTALE: data.totale.toFixed(2).replace('.', ','),
  LINK_PAGAMENTO: data.linkPagamentoStripe,
  // ... altri placeholder
}

return TemplateEngine.render(template, variables)
```

### 5. Salvataggio Database
```sql
INSERT INTO proformas (
  id, numero_proforma, contract_code, servizio, piano,
  importo_base, iva, totale, status,
  pdf_url, stripe_payment_link, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?)
```

### 6. Invio Email + Allegato
```typescript
// Chiamata a inviaEmailProforma() in workflow-email-manager.ts:1178
await emailService.sendEmail({
  to: clienteEmail,
  from: 'info@telemedcare.it',
  subject: `eCura - Proforma ${numeroProforma}`,
  html: emailHtml,  // Template email_invio_proforma.html
  attachments: [
    {
      filename: `Proforma_${numeroProforma}.pdf`,
      content: proformaPdfBase64,
      contentType: 'application/pdf'
    }
  ]
})
```

### 7. Conversione PDF
```typescript
// Linea 92-93 in proforma-generator.ts
const pdfBase64 = Buffer.from(proformaHtml).toString('base64')
// TODO: In produzione usare Puppeteer/Chromium per PDF rendering
```

---

## 🔗 Integrazione Stripe Payment Link

### Generazione Link
```typescript
// In fase di generazione proforma
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const paymentLink = await stripe.paymentLinks.create({
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: {
        name: `eCura ${servizio} ${piano}`,
        description: `Servizio TeleAssistenza 12 mesi - Dispositivo ${dispositivo}`
      },
      unit_amount: Math.round(data.totale * 100)  // In centesimi
    },
    quantity: 1
  }],
  metadata: {
    proforma_id: proformaId,
    contract_code: data.codiceContratto,
    lead_id: leadId
  },
  after_completion: {
    type: 'redirect',
    redirect: {
      url: 'https://telemedcare-v12.pages.dev/payment-success'
    }
  }
})

data.linkPagamentoStripe = paymentLink.url
```

### Webhook Pagamento
```typescript
// POST /api/webhooks/stripe
// Evento: payment_intent.succeeded
const paymentIntent = event.data.object
const metadata = paymentIntent.metadata

// Aggiorna proforma status
await db.prepare(`
  UPDATE proformas 
  SET status = 'PAID', payment_date = ?
  WHERE id = ?
`).bind(new Date().toISOString(), metadata.proforma_id).run()

// Trigger email configurazione
await WorkflowEmailManager.inviaEmailConfigurazionePostPagamento(...)
```

---

## 💳 Modalità di Pagamento Supportate

### 1. Stripe Online (Consigliato)
- **Carte supportate**: Visa, Mastercard, American Express, Maestro
- **Altri metodi**: Apple Pay, Google Pay
- **Sicurezza**: PCI-DSS Level 1, 3D Secure 2.0
- **Commissioni**: 1.4% + €0.25 per transazione EU
- **Tempi**: Immediato (conferma in 2-5 secondi)

### 2. Bonifico Bancario
- **IBAN**: IT97L0503401727000000003519
- **Intestatario**: Medica GB S.r.l.
- **Banca**: Banca Popolare di Milano
- **Causale**: "Proforma [NUMERO_PROFORMA]"
- **Tempi**: 1-3 giorni lavorativi
- **Note**: Inviare ricevuta a info@telemedcare.it

---

## 🧾 Dopo il Pagamento

### 1. Conferma Pagamento (automatica)
- Email conferma pagamento a cliente
- Notifica a info@telemedcare.it
- Aggiornamento status proforma → "PAID"

### 2. Generazione Fattura Definitiva
- Sistema genera fattura definitiva con numero progressivo
- Fattura inviata via email entro 24h
- Copia conservata in fatturazione elettronica

### 3. Email Configurazione Dispositivo
- Template: `email_configurazione.html` (layout professionale)
- Link form configurazione con leadId
- Istruzioni passo-passo

---

## 📊 Stati Proforma

| Status | Descrizione | Email Trigger |
|---|---|---|
| PENDING | In attesa pagamento | email_invio_proforma |
| PAID | Pagamento completato | email_configurazione |
| EXPIRED | Scaduta (>7 giorni) | email_promemoria_pagamento |
| CANCELLED | Annullata | email_cancellazione |

---

## 🧪 Test

### Test Card Stripe
```
Card Number: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

### Test Steps
1. Crea lead "eCura PREMIUM AVANZATO"
2. Invia e firma contratto
3. Ricevi email proforma
4. Clicca "PAGA ORA €1.207,80"
5. Completa pagamento con test card
6. Verifica email configurazione post-pagamento

---

## 🔐 Sicurezza e Compliance

### GDPR
- Dati cliente crittografati in DB
- Email TLS encrypted
- Retention policy: 10 anni (obbligatorio fiscale)

### PCI-DSS
- Nessun dato carta salvato nel sistema
- Pagamenti tramite Stripe (PCI Level 1)
- Token sicuri per transazioni

### Fatturazione Elettronica
- Formato: FatturaPA XML
- Invio tramite SDI (Sistema Di Interscambio)
- Conservazione digitale a norma

---

**Ultimo aggiornamento**: 08 Marzo 2026  
**Versione**: 12.0 - Generazione Proforma Dinamica
