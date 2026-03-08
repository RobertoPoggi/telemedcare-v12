# 📧 Template Email Produzione - TeleMedCare V12

Questo directory contiene **SOLO i template email effettivamente utilizzati** nel flusso E2E di produzione.

## ✅ Template Verificati e Confermati (8 template)

### 🔄 Flusso Completo E2E

```
┌─────────────────────────────────────────────────────────────────┐
│ FASE 1: ACQUISIZIONE LEAD                                       │
└─────────────────────────────────────────────────────────────────┘
1. Lead compila form su landing page
   ↓
2. Sistema invia: email_notifica_info.html
   → A: info@telemedcare.it
   → Contenuto: Notifica nuovo lead con dati richiesta

┌─────────────────────────────────────────────────────────────────┐
│ FASE 2A: INVIO DOCUMENTAZIONE (se richiesta solo info)         │
└─────────────────────────────────────────────────────────────────┘
3. Sistema invia: email_documenti_informativi.html
   → A: lead@email.com
   → Contenuto: Link a brochure e manuali

┌─────────────────────────────────────────────────────────────────┐
│ FASE 2B: INVIO CONTRATTO (se richiesto contratto)              │
└─────────────────────────────────────────────────────────────────┘
4. Sistema invia: email_invio_contratto.html
   → A: lead@email.com
   → Contenuto: Email con contratto allegato (generato in codice)
   → Allegati: Contratto PDF + Brochure device-specific

┌─────────────────────────────────────────────────────────────────┐
│ FASE 3: POST-FIRMA CONTRATTO                                    │
└─────────────────────────────────────────────────────────────────┘
5. Lead firma contratto (DocuSign webhook)
   ↓
6. Sistema invia: email_invio_proforma.html
   → A: lead@email.com
   → Contenuto: Email con proforma allegata (generata in codice)
   → Include: Link pagamento Stripe

┌─────────────────────────────────────────────────────────────────┐
│ FASE 4: POST-PAGAMENTO                                          │
└─────────────────────────────────────────────────────────────────┘
7. Lead paga (Stripe payment_intent.succeeded)
   ↓
8. Sistema invia: email_configurazione.html
   → A: lead@email.com
   → Contenuto: Email configurazione post-pagamento (layout professionale)
   → Include: Link form configurazione dispositivo
   → Subject: "⚙️ Completa la Configurazione del tuo SiDLY Vital Care"

┌─────────────────────────────────────────────────────────────────┐
│ FASE 5: POST-CONFIGURAZIONE                                     │
└─────────────────────────────────────────────────────────────────┘
9. Cliente compila form configurazione
   ↓
10. Sistema invia: email_configurazione_riepilogo.html
    → A: info@telemedcare.it
    → Contenuto: Riepilogo dati configurazione per operatore

┌─────────────────────────────────────────────────────────────────┐
│ FASE 6: ATTIVAZIONE DISPOSITIVO                                 │
└─────────────────────────────────────────────────────────────────┘
11. Operatore associa dispositivo IMEI
    ↓
12. Sistema invia: email_conferma_attivazione.html
    → A: cliente@email.com
    → Contenuto: Conferma attivazione con dati dispositivo

┌─────────────────────────────────────────────────────────────────┐
│ TEMPLATE NON PIÙ USATO (mantenuto per compatibilità)           │
└─────────────────────────────────────────────────────────────────┘
• email_benvenuto.html
  → Prima usato post-pagamento, ora sostituito da email_configurazione.html
  → Mantenuto solo per backward compatibility
```

---

## 📁 Struttura Directory

```
templates/PRODUCTION_TEMPLATES/
├── README.md                                    (questo file)
├── template-mapping.json                        (mappatura completa)
└── email/
    ├── email_notifica_info.html                (6.4 KB) ✅
    ├── email_documenti_informativi.html        (8.0 KB) ✅
    ├── email_invio_contratto.html              (7.6 KB) ✅
    ├── email_invio_proforma.html               (11 KB)  ✅
    ├── email_configurazione.html               (17 KB)  ✅ NUOVO LAYOUT
    ├── email_benvenuto.html                    (7.6 KB) ⚠️ DEPRECATO
    ├── email_configurazione_riepilogo.html     (13 KB)  ✅
    └── email_conferma_attivazione.html         (5.3 KB) ✅
```

---

## 🔍 Dettaglio Template

### 1. email_notifica_info.html
**Quando**: Subito dopo compilazione form landing page  
**Da**: sistema@telemedcare.it  
**A**: info@telemedcare.it  
**Scopo**: Notificare team di nuovo lead  
**Placeholder**:
- `{{NOME_RICHIEDENTE}}`, `{{COGNOME_RICHIEDENTE}}`
- `{{EMAIL_RICHIEDENTE}}`, `{{TELEFONO_RICHIEDENTE}}`
- `{{NOME_ASSISTITO}}`, `{{COGNOME_ASSISTITO}}`
- `{{SERVIZIO}}`, `{{PIANO}}`
- `{{VUOLE_CONTRATTO}}`, `{{VUOLE_BROCHURE}}`, `{{VUOLE_MANUALE}}`
- `{{AZIONE_SUGGERITA}}`

**Chiamata**: `inviaEmailNotificaInfo()` in workflow-email-manager.ts

---

### 2. email_documenti_informativi.html
**Quando**: Se lead richiede solo brochure/manuali (no contratto)  
**Da**: info@telemedcare.it  
**A**: lead@email.com  
**Scopo**: Inviare link a documentazione informativa  
**Placeholder**:
- `{{NOME_RICHIEDENTE}}`, `{{COGNOME_RICHIEDENTE}}`
- `{{BROCHURE_URL}}`, `{{MANUALE_URL}}`
- `{{SERVIZIO}}`, `{{DISPOSITIVO}}`

**Chiamata**: `inviaEmailDocumentiInformativi()` in workflow-email-manager.ts

---

### 3. email_invio_contratto.html
**Quando**: Se lead richiede contratto  
**Da**: info@telemedcare.it  
**A**: lead@email.com  
**Scopo**: Inviare contratto pre-compilato da firmare  
**Placeholder**:
- `{{NOME_CLIENTE}}`, `{{COGNOME_CLIENTE}}`
- `{{SERVIZIO}}`, `{{PIANO}}`, `{{DISPOSITIVO}}`
- `{{PREZZO_BASE}}`, `{{PREZZO_IVA_INCLUSA}}`
- `{{CODICE_CONTRATTO}}`
- `{{LINK_FIRMA_CONTRATTO}}` (DocuSign envelope)

**Allegati**: 
- Contratto PDF (generato da `generateContractHtml()`)
- Brochure device-specific

**Chiamata**: `inviaEmailContratto()` in workflow-email-manager.ts

---

### 4. email_invio_proforma.html
**Quando**: Dopo firma contratto (DocuSign webhook)  
**Da**: info@telemedcare.it  
**A**: cliente@email.com  
**Scopo**: Inviare proforma/fattura per pagamento  
**Placeholder**:
- `{{NOME_CLIENTE}}`, `{{COGNOME_CLIENTE}}`
- `{{NUMERO_PROFORMA}}`, `{{DATA_PROFORMA}}`
- `{{SERVIZIO}}`, `{{PIANO}}`, `{{DISPOSITIVO}}`
- `{{IMPORTO_BASE}}`, `{{IVA}}`, `{{TOTALE}}`
- `{{LINK_PAGAMENTO_STRIPE}}`
- `{{DATA_SCADENZA}}`

**Allegati**: 
- Proforma PDF (generata da `ProformaGenerator.getProformaTemplate()`)

**Chiamata**: `inviaEmailProforma()` in workflow-email-manager.ts

---

### 5. email_configurazione.html ⭐ **NUOVO LAYOUT PROFESSIONALE**
**Quando**: Dopo pagamento Stripe (payment_intent.succeeded)  
**Da**: info@telemedcare.it  
**A**: cliente@email.com  
**Scopo**: Inviare link form configurazione dispositivo  
**Subject**: `⚙️ Completa la Configurazione del tuo {{DISPOSITIVO}}`  
**Layout**: Gradient viola/blu, check mark verde, step numerati, CTA button  
**Placeholder**:
- `{{NOME_CLIENTE}}`, `{{COGNOME_CLIENTE}}`
- `{{DISPOSITIVO}}` (SiDLY Vital Care o SiDLY Care PRO/FAMILY)
- `{{SERVIZIO}}` (eCura PREMIUM/PRO/FAMILY)
- `{{LINK_CONFIGURAZIONE}}` (URL con leadId)
- `{{CODICE_CLIENTE}}`

**Path di caricamento**: `public/templates/email/email_configurazione.html`  
**Dimensione**: 17 KB (aggiornato il 08/03/2026)

**Mapping dispositivo**:
- eCura PREMIUM → SiDLY Vital Care
- eCura PRO → SiDLY Care PRO
- eCura FAMILY → SiDLY Care FAMILY

**Chiamata**: `inviaEmailConfigurazionePostPagamento()` in workflow-email-manager.ts (linea 1806)

---

### 6. email_benvenuto.html ⚠️ **DEPRECATO**
**Stato**: NON PIÙ USATO post-pagamento (sostituito da email_configurazione.html)  
**Mantenuto**: Solo per backward compatibility e test legacy  
**Subject**: `🎉 Benvenuto – {{NOME_CLIENTE}} {{COGNOME_CLIENTE}}`  
**Layout**: Layout vecchio senza gradient

**⚠️ ATTENZIONE**: NON usare questo template per nuovi flussi!

---

### 7. email_configurazione_riepilogo.html
**Quando**: Dopo compilazione form configurazione da parte del cliente  
**Da**: sistema@telemedcare.it  
**A**: info@telemedcare.it  
**Scopo**: Notificare team con dati configurazione per preparare spedizione  
**Placeholder**:
- `{{NOME_CLIENTE}}`, `{{COGNOME_CLIENTE}}`
- `{{CODICE_CLIENTE}}`
- `{{SERVIZIO}}`, `{{DISPOSITIVO}}`
- `{{INDIRIZZO_SPEDIZIONE}}`
- `{{CONTATTI_EMERGENZA}}` (array)
- `{{MEDICO_BASE}}` (nome, telefono)
- `{{CONFIGURAZIONE_ALLARMI}}`

**Chiamata**: `inviaEmailConfigurazione()` in workflow-email-manager.ts

---

### 8. email_conferma_attivazione.html
**Quando**: Dopo associazione dispositivo IMEI da dashboard operativa  
**Da**: info@telemedcare.it  
**A**: cliente@email.com  
**Scopo**: Confermare attivazione dispositivo e fornire istruzioni finali  
**Placeholder**:
- `{{NOME_CLIENTE}}`, `{{COGNOME_CLIENTE}}`
- `{{DISPOSITIVO}}`, `{{IMEI}}`
- `{{DATA_ATTIVAZIONE}}`
- `{{NUMERO_ASSISTENZA}}` (800-XXX-XXX)
- `{{LINK_APP_DOWNLOAD}}`

**Chiamata**: `inviaEmailConfermaAttivazione()` in workflow-email-manager.ts

---

## 🚫 Cosa NON è incluso (e perché)

### ❌ Documenti generati in codice (NON template file)

1. **CONTRATTO PDF**
   - Generato da: `generateContractHtml()` in `src/modules/workflow-email-manager.ts` (linee 53-427)
   - Motivo: Template inline nel codice TypeScript, non file HTML separato
   - Include: Carta intestata Medica GB, dati cliente, prezzi dinamici, clausole legali

2. **PROFORMA PDF**
   - Generata da: `ProformaGenerator.getProformaTemplate()` in `src/modules/proforma-generator.ts`
   - Motivo: Template inline nel codice TypeScript, non file HTML separato
   - Include: Numero proforma, dati cliente, dettagli servizio, prezzi, link Stripe

### ❌ Template HTML non utilizzati

- `public/templates/documents/contratto_vendita.html` → Template alternativo mai usato
- `public/templates/documents/proforma_commerciale.html` → Template alternativo mai usato
- `public/templates/documents/proforma_template_unificato.html` → Template alternativo mai usato

---

## 🔧 Come Aggiornare un Template

### ✅ Procedura Corretta

1. **Modifica il file sorgente**:
   ```bash
   cd /home/user/webapp
   nano public/templates/email/email_configurazione.html
   ```

2. **Copia il backup qui**:
   ```bash
   cp public/templates/email/email_configurazione.html \
      templates/PRODUCTION_TEMPLATES/email/
   ```

3. **Commit e push**:
   ```bash
   git add public/templates/email/email_configurazione.html
   git add templates/PRODUCTION_TEMPLATES/email/email_configurazione.html
   git commit -m "fix: aggiornato template email_configurazione"
   git push origin test-environment
   ```

4. **Deploy automatico Cloudflare Pages**: il template aggiornato sarà live in 2-3 minuti

### ⚠️ Path di Caricamento Template

I template vengono caricati da `src/modules/template-loader-clean.ts`:

```typescript
// Percorso di caricamento
const baseUrl = 'https://your-deployment.pages.dev'
const templateUrl = `${baseUrl}/templates/email/${templateName}.html`
```

**Quindi il file DEVE essere in**: `public/templates/email/nome_template.html`

---

## 🐛 Troubleshooting

### ❌ Problema: Email arriva con placeholder {{NON_SOSTITUITI}}

**Causa**: Template non trovato o path errato  
**Soluzione**:
1. Verifica che il file esista in `public/templates/email/`
2. Controlla il nome del file (no typo!)
3. Verifica che `loadEmailTemplate()` cerchi il nome corretto
4. Controlla i log: `[WORKFLOW] Template caricato: X chars`

### ❌ Problema: Email ha layout vecchio invece di quello nuovo

**Causa**: Template obsoleto in cache o DB  
**Soluzione**:
1. Verifica dimensione file: `ls -lh public/templates/email/email_configurazione.html` → deve essere 17 KB
2. Se DB ha template vecchio, cancellalo: `DELETE FROM email_templates WHERE name = 'email_configurazione'`
3. Il sistema ricaricherà automaticamente il file da `public/templates/email/`

### ❌ Problema: Email non parte dopo pagamento

**Causa**: Funzione sbagliata chiamata  
**Soluzione**:
- Verifica che venga chiamata `inviaEmailConfigurazionePostPagamento()` (non `inviaEmailBenvenuto()`)
- Controlla in `src/index.tsx` linea ~23957:
  ```typescript
  // ✅ CORRETTO
  await WorkflowEmailManager.inviaEmailConfigurazionePostPagamento(...)
  
  // ❌ SBAGLIATO
  await WorkflowEmailManager.inviaEmailBenvenuto(...)
  ```

---

## 📊 Mapping Servizi → Dispositivi

| Servizio eCura | Piano | Dispositivo | Prezzo Base | Prezzo Totale (IVA) |
|---|---|---|---|---|
| eCura FAMILY | BASE | SiDLY Care FAMILY | €564.00 | €688.08 |
| eCura FAMILY | AVANZATO | SiDLY Care FAMILY | €792.00 | €966.24 |
| eCura PRO | BASE | SiDLY Care PRO | €564.00 | €688.08 |
| eCura PRO | AVANZATO | SiDLY Care PRO | €840.00 | ��1,024.80 |
| eCura PREMIUM | BASE | SiDLY Vital Care | €720.00 | €878.40 |
| eCura PREMIUM | AVANZATO | SiDLY Vital Care | €990.00 | €1,207.80 |

---

## 🔐 Variabili d'Ambiente Richieste

```env
# Email Service (Mailgun)
MAILGUN_API_KEY=key-xxxxx
MAILGUN_DOMAIN=mg.telemedcare.it

# Stripe Payment
STRIPE_PUBLIC_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx

# DocuSign
DOCUSIGN_INTEGRATION_KEY=xxxxx
DOCUSIGN_USER_ID=xxxxx
DOCUSIGN_ACCOUNT_ID=xxxxx

# Base URL
CLOUDFLARE_PAGES_URL=https://telemedcare-v12.pages.dev
```

---

## 📅 Changelog

### [2026-03-08] - Fix Definitivo Email Post-Pagamento
- ✅ Sostituito `email_benvenuto.html` con `email_configurazione.html` (nuovo layout)
- ✅ Aggiunto mapping dispositivi (PREMIUM → Vital Care, PRO/FAMILY → Care PRO/FAMILY)
- ✅ Corretto subject: `⚙️ Completa la Configurazione del tuo {{DISPOSITIVO}}`
- ✅ Template spostato da `templates/email_configurazione.html` a `public/templates/email/email_configurazione.html`
- ✅ Layout professionale: gradient viola/blu, step numerati, CTA button

### [2026-03-08] - Fix Brochure PDF
- ✅ Sostituite brochure compresse con versioni leggibili
- ✅ SiDLY Vital Care: `Medica_GB_SiDLY_Vital_Care_ITA.pdf` (1.7 MB)
- ✅ SiDLY Care PRO: `Medica_GB_SiDLY_Care_PRO_ITA.pdf` (2.6 MB)

### [2026-03-08] - Fix Calcolo IVA Proforma
- ✅ Corretto doppio calcolo IVA in generazione proforma
- ✅ Prezzo PREMIUM AVANZATO: €990.00 + IVA 22% = €1,207.80 (era €1,473.52)

---

## 📞 Supporto

Per modifiche ai template o problemi nel flusso email, contattare:
- **Email**: roberto.poggi@example.com
- **Repository**: https://github.com/RobertoPoggi/telemedcare-v12

---

**Ultimo aggiornamento**: 08 Marzo 2026  
**Versione**: 12.0 (E2E Workflow Completo)
