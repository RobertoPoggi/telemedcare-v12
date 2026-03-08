# 📧 PRODUCTION EMAIL TEMPLATES - DOCUMENTAZIONE COMPLETA

**Data ultima modifica**: 8 Marzo 2026  
**Versione**: 1.0 - Stabile e Testata  
**Status**: ✅ TUTTI I TEMPLATE FUNZIONANTI E VALIDATI

---

## 📋 INDICE

1. [Template Disponibili](#template-disponibili)
2. [Workflow Email Completo](#workflow-email-completo)
3. [Mapping Servizi → Template](#mapping-servizi--template)
4. [Placeholder Supportati](#placeholder-supportati)
5. [Path e Directory](#path-e-directory)
6. [Come Aggiornare un Template](#come-aggiornare-un-template)
7. [Troubleshooting](#troubleshooting)

---

## 📧 TEMPLATE DISPONIBILI

### 1. **email_configurazione.html** (17KB)
**Quando viene inviata**: Dopo il pagamento con carta/bonifico  
**Subject**: `⚙️ Completa la Configurazione del tuo {DISPOSITIVO}`  
**Destinatario**: Cliente  

**Contenuto**:
- ✅ Checkmark verde grande (4rem)
- 📦 Box "Cosa succede ora?" con gradient azzurro
- 🔧 Step 1-2-3 con cerchi blu numerati
- 🔵 Bottone CTA "Inizia Configurazione →" con gradient blu
- 🔒 Box sicurezza SSL 256-bit
- 🎨 Background gradient viola/blu

**Placeholder**:
- `{{NOME_CLIENTE}}` - Nome del cliente
- `{{COGNOME_CLIENTE}}` - Cognome del cliente
- `{{DISPOSITIVO}}` - Es. "SiDLY Vital Care", "SiDLY Care PRO"
- `{{SERVIZIO}}` - Es. "eCura PREMIUM", "eCura PRO"
- `{{LINK_CONFIGURAZIONE}}` - Link al form configurazione
- `{{CODICE_CLIENTE}}` - Codice cliente univoco

**Path produzione**: `public/templates/email/email_configurazione.html`

---

### 2. **email_benvenuto.html** (7.6KB)
**Quando viene inviata**: Dopo compilazione form configurazione  
**Subject**: `🎉 Benvenuto/a in TeleMedCare, {NOME_CLIENTE}!`  
**Destinatario**: Cliente  

**Contenuto**:
- Benvenuto personalizzato
- Riepilogo servizio e piano acquistato
- Informazioni su attivazione
- Link alla documentazione

**Placeholder**:
- `{{NOME_CLIENTE}}` - Nome del cliente
- `{{COGNOME_CLIENTE}}` - Cognome del cliente
- `{{SERVIZIO}}` - Servizio acquistato
- `{{PIANO}}` - Piano (BASE/AVANZATO)
- `{{DISPOSITIVO}}` - Nome dispositivo

**Path produzione**: `public/templates/email/email_benvenuto.html`

---

### 3. **email_configurazione_riepilogo.html** (13KB)
**Quando viene inviata**: Dopo compilazione form configurazione  
**Subject**: `📋 Nuova Configurazione Ricevuta - {NOME_CLIENTE} {COGNOME_CLIENTE}`  
**Destinatario**: TeleMedCare (info@telemedcare.it)  

**Contenuto**:
- Riepilogo completo dati cliente
- Informazioni dispositivo e configurazione
- Dati per attivazione servizio
- Informazioni mediche (se presenti)

**Placeholder**:
- Tutti i campi del form configurazione
- Dati cliente completi
- Informazioni contatto emergenza

**Path produzione**: `public/templates/email/email_configurazione_riepilogo.html`

---

## 🔄 WORKFLOW EMAIL COMPLETO

```
STEP 1: Lead creato
   ↓
STEP 2: Contratto firmato
   ↓
STEP 3: Pagamento ricevuto
   ↓
   📧 EMAIL #1: email_configurazione.html
      → Destinatario: Cliente
      → Subject: "⚙️ Completa la Configurazione del tuo SiDLY Vital Care"
      → CTA: Link al form configurazione
   ↓
STEP 4: Form configurazione compilato
   ↓
   📧 EMAIL #2: email_configurazione_riepilogo.html
      → Destinatario: info@telemedcare.it
      → Subject: "📋 Nuova Configurazione Ricevuta - Roberto Poggi"
      → Contenuto: Tutti i dati del cliente
   
   📧 EMAIL #3: email_benvenuto.html
      → Destinatario: Cliente
      → Subject: "🎉 Benvenuto/a in TeleMedCare, Roberto!"
      → Contenuto: Conferma attivazione servizio
```

---

## 🗺️ MAPPING SERVIZI → TEMPLATE

### Dispositivi

| Servizio eCura | Piano | Dispositivo | Brochure PDF |
|---|---|---|---|
| **eCura PREMIUM** | BASE/AVANZATO | **SiDLY Vital Care** | `Medica_GB_SiDLY_Vital_Care_ITA.pdf` (1.7 MB) |
| **eCura PRO** | BASE/AVANZATO | **SiDLY Care PRO** | `Medica_GB_SiDLY_Care_PRO_ITA.pdf` (2.6 MB) |
| **eCura FAMILY** | BASE/AVANZATO | **SiDLY Care PRO** | `Medica_GB_SiDLY_Care_PRO_ITA.pdf` (2.6 MB) |

### Prezzi (IVA esclusa)

| Servizio | Piano | Prezzo Base (€) | IVA 22% (€) | Totale (€) | Mensile (€) |
|---|---|---|---|---|---|
| eCura PREMIUM | AVANZATO | 990.00 | 217.80 | 1,207.80 | 82.50 |
| eCura PREMIUM | BASE | 480.00 | 105.60 | 585.60 | 40.00 |
| eCura PRO | AVANZATO | 730.00 | 160.60 | 890.60 | 60.83 |
| eCura PRO | BASE | 380.00 | 83.60 | 463.60 | 31.67 |

**IMPORTANTE**: 
- ⚠️ Nel database si salvano **SEMPRE i prezzi SENZA IVA** (prezzo_totale = 990.00 per PREMIUM AVANZATO)
- ✅ L'IVA 22% viene calcolata solo per visualizzazione/email/PDF
- ✅ Prezzo mensile = prezzo_base / 12 (SENZA IVA)

---

## 🏷️ PLACEHOLDER SUPPORTATI

### Placeholder Cliente
```
{{NOME_CLIENTE}}          - Nome del cliente
{{COGNOME_CLIENTE}}       - Cognome del cliente
{{EMAIL_CLIENTE}}         - Email del cliente
{{TELEFONO_CLIENTE}}      - Telefono del cliente
{{CODICE_CLIENTE}}        - Codice cliente univoco (es. CLI-1234567890)
```

### Placeholder Servizio
```
{{SERVIZIO}}              - Nome servizio completo (es. "eCura PREMIUM")
{{PIANO}}                 - Piano servizio (BASE/AVANZATO)
{{DISPOSITIVO}}           - Nome dispositivo (es. "SiDLY Vital Care", "SiDLY Care PRO")
```

### Placeholder Prezzi
```
{{PREZZO_BASE}}           - Prezzo IVA esclusa (es. "€990,00")
{{IMPORTO_IVA}}           - IVA 22% (es. "€217,80")
{{IMPORTO_TOTALE}}        - Totale IVA inclusa (es. "€1.207,80")
{{PREZZO_MENSILE}}        - Rata mensile (es. "€82,50")
```

### Placeholder Link
```
{{LINK_CONFIGURAZIONE}}   - Link al form configurazione con token
{{LINK_CONTRATTO}}        - Link al PDF del contratto
{{LINK_PROFORMA}}         - Link al PDF della proforma
```

---

## 📂 PATH E DIRECTORY

### Directory Principale Templates
```
/home/user/webapp/
├── templates/                              # ❌ NON USARE (solo backup)
│   └── email_configurazione.html
│
├── public/templates/email/                 # ✅ DIRECTORY CORRETTA (usata dal sistema)
│   ├── email_configurazione.html          # 17KB - Layout professionale
│   ├── email_benvenuto.html               # 7.6KB
│   └── email_configurazione_riepilogo.html # 13KB
│
└── templates/PRODUCTION_TEMPLATES/         # 📦 BACKUP SICURO (questa directory)
    ├── email_configurazione.html
    ├── email_benvenuto.html
    ├── email_configurazione_riepilogo.html
    └── README.md (questo file)
```

### Path Pubblici (Cloudflare Pages)
```
https://telemedcare-v12.pages.dev/templates/email/email_configurazione.html
https://telemedcare-v12.pages.dev/templates/email/email_benvenuto.html
https://telemedcare-v12.pages.dev/templates/email/email_configurazione_riepilogo.html
```

### Path Brochure
```
https://telemedcare-v12.pages.dev/brochures/Medica_GB_SiDLY_Vital_Care_ITA.pdf
https://telemedcare-v12.pages.dev/brochures/Medica_GB_SiDLY_Care_PRO_ITA.pdf
```

---

## 🔧 COME AGGIORNARE UN TEMPLATE

### Procedura Corretta

1. **Backup del template attuale**:
   ```bash
   cd /home/user/webapp
   cp public/templates/email/email_configurazione.html \
      templates/PRODUCTION_TEMPLATES/email_configurazione_BACKUP_$(date +%Y%m%d).html
   ```

2. **Modifica il template**:
   ```bash
   # Apri con editor
   nano public/templates/email/email_configurazione.html
   
   # OPPURE sostituisci con nuovo file
   cp /path/to/nuovo_template.html public/templates/email/email_configurazione.html
   ```

3. **Verifica dimensione e contenuto**:
   ```bash
   # Verifica dimensione (deve essere ~17KB per email_configurazione)
   ls -lh public/templates/email/email_configurazione.html
   
   # Verifica placeholder
   grep -o "{{[A-Z_]*}}" public/templates/email/email_configurazione.html | sort -u
   ```

4. **Test locale** (opzionale):
   ```bash
   # Apri in browser per vedere layout
   open public/templates/email/email_configurazione.html
   ```

5. **Commit e deploy**:
   ```bash
   cd /home/user/webapp
   git add public/templates/email/email_configurazione.html
   git commit -m "fix: aggiornato template email_configurazione"
   git push origin test-environment
   
   # Attendi 2-3 minuti per deploy Cloudflare
   ```

6. **Aggiorna backup in PRODUCTION_TEMPLATES**:
   ```bash
   cp public/templates/email/email_configurazione.html \
      templates/PRODUCTION_TEMPLATES/email_configurazione.html
   ```

---

## 🚨 TROUBLESHOOTING

### Problema: Email arriva con layout vecchio

**Causa**: Template nel database ha precedenza sul file

**Soluzione 1** - Rimuovi template dal DB:
```bash
# Chiamare endpoint (dopo deploy)
curl -X DELETE \
  "https://test-environment.telemedcare-v12.pages.dev/api/email/template/email_configurazione/reset"
```

**Soluzione 2** - Verifica path corretto:
```bash
# Il file DEVE essere in public/templates/email/
ls -lh public/templates/email/email_configurazione.html

# NON in templates/ (directory root)
```

---

### Problema: Placeholder non sostituiti (es. {{NOME_CLIENTE}} visibile)

**Causa**: Sintassi placeholder errata o dati mancanti

**Verifica**:
1. Placeholder devono essere `{{NOME_PLACEHOLDER}}` (doppia graffa, uppercase, underscore)
2. Controlla log backend per vedere se i dati vengono passati:
   ```
   📧 [WORKFLOW] Invio email configurazione a: email@esempio.com
   📧 [WORKFLOW] Dati cliente: { nomeRichiedente: "Roberto", ... }
   ```

**Fix**:
- Assicurati che il codice passi tutti i dati necessari alla funzione di invio email
- Verifica in `src/modules/workflow-email-manager.ts` riga ~1826-1835

---

### Problema: Dimensione file troppo piccola

**Causa**: File compresso o vecchio template

**Verifica**:
```bash
ls -lh public/templates/email/email_configurazione.html
# Deve essere ~17KB (layout professionale)
# Se è ~7.6KB = vecchio template
```

**Fix**:
```bash
# Ripristina da backup
cp templates/PRODUCTION_TEMPLATES/email_configurazione.html \
   public/templates/email/email_configurazione.html
```

---

### Problema: Email non arriva affatto

**Causa**: Errore nel codice di invio o configurazione AWS SES

**Debug**:
1. Controlla log Cloudflare Pages
2. Verifica configurazione AWS SES in environment variables
3. Controlla che `EmailService` sia configurato correttamente

**Verifica environment variables**:
- `AWS_SES_REGION` (es. eu-west-1)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `EMAIL_FROM` (es. info@telemedcare.it)

---

## 📚 FILE DI RIFERIMENTO IMPORTANTI

### Codice Backend Email
```
src/modules/workflow-email-manager.ts
  ├── inviaEmailConfigurazionePostPagamento() - Riga 1766
  ├── inviaEmailBenvenuto() - Riga 1383
  └── inviaEmailConfigurazione() - Riga 558

src/modules/template-loader-clean.ts
  └── loadEmailTemplate() - Riga 12 (caricamento template)

src/modules/email-service.ts
  └── EmailService.sendEmail() - Invio email via AWS SES
```

### Orchestrator Workflow
```
src/modules/complete-workflow-orchestrator.ts
  ├── processPayment() - STEP 3: Pagamento → Email configurazione
  └── processConfiguration() - STEP 4: Configurazione → Email benvenuto + riepilogo
```

### Endpoint API
```
src/index.tsx
  ├── POST /api/payments - Registra pagamento e invia email configurazione
  ├── POST /api/configuration/submit - Salva configurazione e invia email
  └── DELETE /api/email/template/:name/reset - Reset template dal DB
```

---

## ✅ CHECKLIST PRE-DEPLOY

Prima di fare deploy di modifiche ai template:

- [ ] Backup template attuale salvato in `PRODUCTION_TEMPLATES/`
- [ ] Template aggiornato in `public/templates/email/`
- [ ] Dimensione file verificata (17KB per email_configurazione)
- [ ] Placeholder verificati con grep
- [ ] Test visivo in browser locale
- [ ] Commit con messaggio descrittivo
- [ ] Push su branch test-environment
- [ ] Attesa 2-3 minuti per deploy Cloudflare
- [ ] Test completo E2E (pagamento → email ricevuta)
- [ ] Verifica layout in client email (Gmail, Outlook, etc.)

---

## 📞 CONTATTI E SUPPORTO

**Sviluppatore**: Claude (Genspark AI)  
**Data Fix Completo**: 8 Marzo 2026  
**Repository**: https://github.com/RobertoPoggi/telemedcare-v12  
**Branch Test**: test-environment  
**Branch Produzione**: main  

**Per problemi**:
1. Controllare questo README
2. Verificare log Cloudflare Pages
3. Controllare file in `templates/PRODUCTION_TEMPLATES/`
4. Ripristinare da backup se necessario

---

## 📝 CHANGELOG

### [1.0] - 2026-03-08 - ✅ STABLE
**Fix Completati**:
- ✅ IVA doppia corretta (990€ → 1,473€ risolto)
- ✅ Prezzo mensile con IVA esclusa (82.50€)
- ✅ Email configurazione con layout professionale (gradient viola/blu, 17KB)
- ✅ Subject email corretto ("⚙️ Completa la Configurazione...")
- ✅ Mapping dispositivo corretto (PREMIUM → SiDLY Vital Care)
- ✅ Brochure PDF leggibili (non compressi, 1.7MB e 2.6MB)
- ✅ Template nella directory corretta (public/templates/email/)
- ✅ Placeholder tutti compilati correttamente

**Commit Principali**:
- `de7e060` - Template posizionato correttamente
- `d78ebb3` - Brochure PDF leggibili
- `d4ba646` - Layout email professionale
- `8da9a5a` - Subject e dispositivo corretti
- `4fa2cb7` - Prezzo mensile IVA esclusa
- `5242178` - Calcolo IVA corretto

---

**🎉 TUTTI I TEMPLATE SONO ORA STABILI E TESTATI! 🎉**

