# 📊 DATABASE MASTER REFERENCE - TeleMedCare V11.0

> **DOCUMENTO DI RIFERIMENTO PERMANENTE**  
> Da consultare SEMPRE per nomi database, tabelle, campi e configurazioni

---

## 🗄️ DATABASE CONFIGURATION

### Database Names
- **Local Development**: `DB` binding (any name works, data is in .wrangler/state)
- **Remote Cloudflare D1**: `telemedcare-leads`
- **Database ID**: `e6fd921d-06df-4b65-98f9-fce81ef78825`

### Wrangler Configuration
```jsonc
// File: wrangler.jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "telemedcare-leads",
      "database_id": "e6fd921d-06df-4b65-98f9-fce81ef78825"
    }
  ]
}
```

### Server Commands
```bash
# Development server (PORTA CORRENTE: 3001)
npm exec -- wrangler pages dev dist --port 3001 --ip 0.0.0.0

# Apply migrations (remote)
npx wrangler d1 execute DB --remote --file="migrations/XXX.sql"

# Apply migrations (local)
npx wrangler d1 execute DB --local --file="migrations/XXX.sql"
```

### ⚠️ CRITICAL: Allegati Email (Brochure/Manuale) - ✅ RISOLTO

**Problema era**: Gli allegati (brochure/manuale) non venivano inviati perché il file loader usava porta sbagliata (4000 invece di 3001).

**Posizioni File**:
- `./documents/brochures/brochure_telemedcare.pdf` (1117.58 KB)
- `./documents/manuals/manuale_sidly.pdf` (716.40 KB)
- `./public/documents/brochures/brochure_telemedcare.pdf`
- `./public/documents/manuals/manuale_sidly.pdf`
- `./dist/documents/brochures/brochure_telemedcare.pdf` (copiato da build)
- `./dist/documents/manuals/manuale_sidly.pdf` (copiato da build)

**✅ Soluzione Implementata**:
1. **File Loader** (`src/modules/email-service.ts`):
   - Prova prima filesystem locale con `fs.readFileSync()` (sviluppo)
   - **RILEVAMENTO AUTOMATICO PORTA**: Funzione `detectServerPort()` prova porte comuni (3001, 4005, 8080, 3000, 8787)
   - Fallback a HTTP `http://127.0.0.1:${serverPort}${filePath}` (porta rilevata automaticamente)
   - Cache della porta rilevata per evitare rilevamenti multipli
   - Supporta sia Node.js che Cloudflare Workers

2. **Route Documenti** (`src/index.tsx`):
   - Aggiunta route `app.get('/documents/*')` per servire file statici
   - In sviluppo: carica da filesystem
   - In produzione: serve da `public/documents/`

3. **Verifica Funzionamento**:
   ```bash
   # Test route documenti
   curl http://localhost:3001/documents/brochures/brochure_telemedcare.pdf | head -c 20
   # Output atteso: %PDF-1.4
   ```

**Log Successo**:
```
✅ [FILE-LOADER] File caricato via HTTP: 1117.58 KB  (brochure)
✅ [FILE-LOADER] File caricato via HTTP: 716.40 KB   (manuale)
✅ 3 allegati pronti per invio (contratto + brochure + manuale)
```

---

## 📧 EMAIL SERVICE CONFIGURATION

### ⚠️ IMPORTANTE: API Keys Obbligatorie per Invio Email

**Problema**: Email proforma (e altre) non vengono inviate se non sono configurate le API keys dei servizi email.

**Servizi Supportati**:
1. **SendGrid** (primario) - Configura `SENDGRID_API_KEY`
2. **Resend** (fallback) - Configura `RESEND_API_KEY`

**Come Configurare**:

1. **Crea file `.dev.vars`** nella root del progetto:
   ```bash
   # .dev.vars (NON committare su git!)
   
   # SendGrid (PRIMARIO - usare questo)
   SENDGRID_API_KEY=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
   
   # Resend (FALLBACK - opzionale)
   RESEND_API_KEY=re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2
   # Resend alternativa: re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt
   ```

2. **DNS Records SendGrid** (già configurati):
   ```
   CNAME  em6551.telemedcare.it           → u56677468.wl219.sendgrid.net
   CNAME  s1._domainkey.telemedcare.it    → s1.domainkey.u56677468.wl219.sendgrid.net
   CNAME  s2._domainkey.telemedcare.it    → s2.domainkey.u56677468.wl219.sendgrid.net
   TXT    _dmarc.telemedcare.it           → v=DMARC1; p=none;
   ```

3. **DNS Records Resend** (già configurati):
   ```
   MX     send                            → feedback-smtp.eu-west-1.amazonses.com (priority 10)
   TXT    send                            → v=spf1 include:amazonses.com ~all
   TXT    resend._domainkey               → p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB
   TXT    _dmarc                          → v=DMARC1; p=none;
   ```

4. **Link Gestione API Keys**:
   - **SendGrid**: https://app.sendgrid.com/settings/api_keys
   - **Resend**: https://resend.com/api-keys

3. **Verifica Configurazione**:
   - L'endpoint `/proformas/:id/resend-email` restituirà errore 503 se le API keys non sono configurate
   - Il messaggio di errore guiderà l'utente alla configurazione corretta

**Funzionalità Dipendenti da Email Service**:
- ✉️ Invio contratto via email (con brochure/manuale allegati)
- 💰 Invio proforma dopo firma contratto
- 🎉 Email di benvenuto dopo pagamento
- 📧 Reinvio manuale proforma dalla dashboard

**Reinvio Manuale Email Proforma**:
- Dashboard Admin → Tab "Proforma" → Pulsante "📧 Reinvia Email"
- Endpoint API: `POST /api/admin/proformas/:id/resend-email`
- Recupera PDF da database o lo rigenera se necessario
- Verifica configurazione API keys prima dell'invio

**Template Email Disponibili**:
- `INVIO_CONTRATTO` - Invio contratto firmabile con allegati (brochure + manuale)
- `INVIO_PROFORMA` - Fattura proforma per pagamento
- `BENVENUTO` - Email di benvenuto post-pagamento
- `CONFIGURAZIONE` - Istruzioni configurazione dispositivo
- `CONFERMA` - Conferma attivazione servizio

**Log di Debug**:
```bash
# Cerca nei log server
grep -E "EMAIL|📧" server.log
```

**Esempio Output Successo**:
```
📧 Tentativo invio email proforma a: cliente@example.com
📧 Dati ambiente: { hasSendGrid: true, hasResend: false }
✅ Email proforma inviata con successo: msg_abc123xyz
```

**Esempio Output Errore (API Key Mancante)**:
```
❌ Errore invio email proforma: Email service not configured
```

---

## 🔑 API KEYS - MEMORIZZATE PERMANENTEMENTE

### SendGrid (PRIMARIO)
```bash
SENDGRID_API_KEY=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
```

**DNS Records SendGrid** (già configurati):
```
CNAME  em6551.telemedcare.it           → u56677468.wl219.sendgrid.net
CNAME  s1._domainkey.telemedcare.it    → s1.domainkey.u56677468.wl219.sendgrid.net
CNAME  s2._domainkey.telemedcare.it    → s2.domainkey.u56677468.wl219.sendgrid.net
TXT    _dmarc.telemedcare.it           → v=DMARC1; p=none;
```

### Resend (FALLBACK)
```bash
# Principale
RESEND_API_KEY=re_QeeK2km4_94B4bM3sGq2KhDBf2gi624d2

# Alternativa
RESEND_API_KEY=re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt
```

**DNS Records Resend** (già configurati):
```
MX     send                 → feedback-smtp.eu-west-1.amazonses.com (priority 10)
TXT    send                 → v=spf1 include:amazonses.com ~all
TXT    resend._domainkey    → p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCt/RRcWFvf3HRar5ft42c+/EXmzIBm9ITUQ/6huXfQcNYmXuwa4+r6VhcUCIHIoiR36JVPi22T7O+2bjc57NyY/ULfrZML4DPEymE1B1ETNdLZhJPIDswjfci8fgxeyyNMdw2v8t6ZOQEWk+smIp0SKRLbI7H9QbauF+z9Dn7mpQIDAQAB
TXT    _dmarc               → v=DMARC1; p=none;
```

---

## 💰 POLITICA PREZZI TELEMEDCARE - ⚠️ SEMPRE CONSULTARE QUESTO!

### Listino Ufficiale TeleMedCare

**IMPORTANTE**: I prezzi sono sempre calcolati come importo base + IVA 22%

#### 1️⃣ Servizio BASE
- **Primo Anno (12 mesi)**: €480 + IVA 22% = **€585.60**
- **Rinnovo Annuale**: €240 + IVA 22% = **€292.80**

#### 2️⃣ Servizio AVANZATO
- **Primo Anno (12 mesi)**: €840 + IVA 22% = **€1,024.80**
- **Rinnovo Annuale**: €600 + IVA 22% = **€732.00**

### Tabella Riepilogo Prezzi

| Piano | Primo Anno (base) | Primo Anno (IVA incl.) | Rinnovo (base) | Rinnovo (IVA incl.) |
|-------|-------------------|------------------------|----------------|---------------------|
| **BASE** | €480 | **€585.60** | €240 | **€292.80** |
| **AVANZATO** | €840 | **€1,024.80** | €600 | **€732.00** |

### Calcolo IVA - Formula Corretta
```javascript
// Formula corretta per calcolo IVA 22%
const prezzoBase = 480; // o 840 per AVANZATO
const iva = 0.22;
const prezzoFinale = prezzoBase * (1 + iva); // prezzoBase × 1.22

// Esempi:
// BASE primo anno:     480 × 1.22 = 585.60
// AVANZATO primo anno: 840 × 1.22 = 1024.80
// BASE rinnovo:        240 × 1.22 = 292.80
// AVANZATO rinnovo:    600 × 1.22 = 732.00
```

### Note Importanti Pricing
- ✅ Il prezzo è **una tantum annuale**, NON mensile
- ✅ Il primo anno costa di più per copertura costi iniziali
- ✅ Dal secondo anno il rinnovo costa meno (50% BASE, ~71% AVANZATO)
- ✅ L'IVA 22% è SEMPRE applicata al prezzo base
- ⚠️ **NON moltiplicare mai per 12 mesi** - è già un canone annuale!
- ⚠️ **NON usare prezzi mensili** - il servizio si paga una volta all'anno

---

## 📋 TABELLE DATABASE

### ℹ️ Storage e Backup Database

**Dove sono salvati i dati**:
- ✅ **leads**: Sì, salvati in tabella `leads` su D1 database
- ✅ **contracts**: Sì, salvati in tabella `contracts` su D1 database (con PDF in campo `content` base64)
- ✅ **proforma**: Sì, salvati in tabella `proforma` su D1 database (con PDF in campo `content` base64)
- ✅ **document_templates**: Sì, template email dinamici in tabella `document_templates`
- ✅ **devices**: Sì, dispositivi in tabella `devices`

**Posizione Database Locale**:
```
.wrangler/state/v3/d1/miniflare-D1DatabaseObject/
```

**Backup e Migrazione**:
```bash
# Export dati da locale
sqlite3 .wrangler/state/v3/d1/miniflare-D1DatabaseObject/xxxxx.sqlite ".dump" > backup.sql

# Import dati su remoto
npx wrangler d1 execute DB --remote --file=backup.sql
```

**Verifica Integrità Dati**:
```bash
# Conta record in ogni tabella
curl http://localhost:3001/api/admin/leads | jq '.leads | length'
curl http://localhost:3001/api/admin/contracts | jq '.contracts | length'
curl http://localhost:3001/api/admin/proformas | jq '.proformas | length'
```

---

### 1. **leads** - Anagrafica Richiedenti
| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `id` | INTEGER PRIMARY KEY | ID univoco autoincrement | ✅ |
| `nomeRichiedente` | TEXT | Nome richiedente | ✅ |
| `cognomeRichiedente` | TEXT | Cognome richiedente | ✅ |
| `emailRichiedente` | TEXT | Email richiedente | ✅ |
| `telefonoRichiedente` | TEXT | Telefono richiedente | ✅ |
| `cfRichiedente` | TEXT | Codice fiscale richiedente | ❌ |
| `indirizzoRichiedente` | TEXT | Indirizzo completo | ❌ |
| `capRichiedente` | TEXT | CAP | ❌ |
| `cittaRichiedente` | TEXT | Città | ❌ |
| `provinciaRichiedente` | TEXT | Provincia | ❌ |
| `dataNascitaRichiedente` | TEXT | Data di nascita (ISO) | ❌ |
| `luogoNascitaRichiedente` | TEXT | Luogo di nascita | ❌ |
| `nomeAssistito` | TEXT | Nome assistito | ❌ |
| `cognomeAssistito` | TEXT | Cognome assistito | ❌ |
| `etaAssistito` | INTEGER | Età assistito | ❌ |
| `dataNascitaAssistito` | TEXT | Data nascita assistito | ❌ |
| `luogoNascitaAssistito` | TEXT | Luogo nascita assistito | ❌ |
| `cfAssistito` | TEXT | CF assistito | ❌ |
| `pacchetto` | TEXT | Piano: BASE/AVANZATO | ✅ |
| `status` | TEXT | Stato workflow | ✅ |
| `created_at` | TEXT | Data creazione | ✅ |
| `updated_at` | TEXT | Data aggiornamento | ✅ |

**Status possibili**: `nuovo`, `CONTRACT_SENT`, `CONTRACT_SIGNED`, `PAYMENT_PENDING`, `PAYMENT_CONFIRMED`, `ACTIVE`, `DOCUMENTI_INVIATI`

---

### 2. **contracts** - Contratti
| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `id` | TEXT PRIMARY KEY | ID univoco (UUID) | ✅ |
| `lead_id` | INTEGER | FK → leads.id | ✅ |
| `codice_contratto` | TEXT UNIQUE | Formato: CTR_YYYY/NNNN | ✅ |
| `contract_type` | TEXT | Tipo contratto/Piano (BASE/ADVANCED/PREMIUM) | ✅ |
| `file_path` | TEXT | Path PDF nel database | ❌ |
| `content` | TEXT | Contenuto HTML/PDF base64 | ❌ |
| `status` | TEXT | Stato contratto | ✅ |
| `signature_method` | TEXT | MANUAL/DOCUSIGN | ❌ |
| `signature_date` | TEXT | Data firma (ISO) | ❌ |
| `docusign_envelope_id` | TEXT | ID busta DocuSign | ❌ |
| `created_at` | TEXT | Data emissione | ✅ |
| `updated_at` | TEXT | Data aggiornamento | ✅ |

**Status possibili**: `generated`, `SENT`, `SIGNED_MANUAL`, `SIGNED_DOCUSIGN`

**Formato codice**: `CTR_2025/0001`, `CTR_2025/0002`, ecc. (sequenziale per anno)

**Traduzioni Italiane Piano**:
- `BASE` → "Base"
- `ADVANCED` → "Avanzato"
- `PREMIUM` → "Premium"

---

### 3. **proforma** - Fatture Proforma
| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `id` | TEXT PRIMARY KEY | ID univoco | ✅ |
| `contract_id` | TEXT | FK → contracts.id | ✅ |
| `lead_id` | TEXT | FK → leads.id | ✅ |
| `numero_proforma` | TEXT UNIQUE | Formato: PFM_YYYY/NNNN | ✅ |
| `data_emissione` | TEXT | Data emissione (ISO) | ✅ |
| `data_scadenza` | TEXT | Data scadenza (ISO) | ✅ |
| `cliente_nome` | TEXT | Nome cliente | ✅ |
| `cliente_cognome` | TEXT | Cognome cliente | ✅ |
| `cliente_email` | TEXT | Email cliente | ✅ |
| `tipo_servizio` | TEXT | BASE/AVANZATO | ✅ |
| `prezzo_mensile` | REAL | Prezzo mensile | ✅ |
| `durata_mesi` | INTEGER | Durata (default 12) | ✅ |
| `prezzo_totale` | REAL | Importo totale | ✅ |
| `file_path` | TEXT | Path PDF nel database | ❌ |
| `content` | TEXT | Contenuto PDF base64 | ❌ |
| `status` | TEXT | Stato pagamento | ✅ |
| `data_pagamento` | TEXT | Data pagamento (ISO) | ❌ |
| `email_template_used` | TEXT | Template usato | ❌ |
| `inviata_il` | TEXT | Data invio email | ❌ |
| `created_at` | TEXT | Data creazione | ✅ |
| `updated_at` | TEXT | Data aggiornamento | ✅ |

**Status possibili**: `PENDING`, `PAID`, `PAID_BANK_TRANSFER`, `PAID_STRIPE`

**Formato codice**: `PFM_2025/0001`, `PFM_2025/0002`, ecc. (sequenziale per anno)

---

### 4. **devices** - Dispositivi
| Campo | Tipo | Descrizione | Obbligatorio |
|-------|------|-------------|--------------|
| `id` | TEXT PRIMARY KEY | ID univoco | ✅ |
| `device_code` | TEXT UNIQUE | Codice dispositivo | ✅ |
| `serial_number` | TEXT UNIQUE | Seriale | ✅ |
| `device_type` | TEXT | Tipo dispositivo | ✅ |
| `model` | TEXT | Modello | ✅ |
| `status` | TEXT | Stato dispositivo | ✅ |
| `lead_id` | INTEGER | FK → leads.id | ❌ |
| `associated_at` | TEXT | Data associazione | ❌ |
| `associated_by` | TEXT | Associato da (admin) | ❌ |
| `configured_at` | TEXT | Data configurazione | ❌ |
| `admin_notes` | TEXT | Note admin | ❌ |
| `created_at` | TEXT | Data creazione | ✅ |
| `updated_at` | TEXT | Data aggiornamento | ✅ |

**Status possibili**: `AVAILABLE`, `ASSOCIATED`, `CONFIGURED`, `ACTIVE`, `MAINTENANCE`

---

### 5. **document_templates** - Template Email e Documenti
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | TEXT PRIMARY KEY | ID template (es: email_invio_contratto) |
| `name` | TEXT | Nome descrittivo |
| `type` | TEXT | Tipo: email/document/pdf |
| `subject` | TEXT | Oggetto email |
| `html_content` | TEXT | Contenuto HTML |
| `variables` | TEXT | JSON variabili disponibili |
| `category` | TEXT | Categoria template |
| `active` | INTEGER | 1=attivo, 0=disattivato |
| `created_at` | TEXT | Data creazione |
| `updated_at` | TEXT | Data aggiornamento |

**Template Email Principali** (stored in `document_templates` table):
- **email_notifica_info**: Email notifica nuovo lead a info@telemedcare.it (40 campi completi)
- **email_invio_contratto**: Email invio contratto al cliente (DINAMICO con `{{TESTO_DOCUMENTI_AGGIUNTIVI}}` e `{{ALLEGATI_LISTA}}`)
- **email_documenti_informativi**: Email invio documenti informativi (DINAMICO con `{{BROCHURE_HTML}}` e `{{MANUALE_HTML}}`)
- **email_invio_proforma**: Email invio proforma per pagamento
- **email_conferma_attivazione**: Email conferma attivazione servizio (fine workflow)

**⚠️ NOTA IMPORTANTE SUI TEMPLATE**:
Se i template email sono sbagliati o vecchi, recuperarli da:
1. File: `RESTORE_WORKING_TEMPLATES.sql` (template funzionanti completi)
2. Template corretti con placeholder dinamici (NON ricreare da zero!)
3. Applicare con: `npx wrangler d1 execute DB --local --file=RESTORE_WORKING_TEMPLATES.sql`

---

### 6. **docusign_envelopes** - Buste DocuSign
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | INTEGER PRIMARY KEY | ID autoincrement |
| `envelope_id` | TEXT UNIQUE | ID busta DocuSign |
| `lead_id` | INTEGER | FK → leads.id |
| `contract_id` | TEXT | FK → contracts.id |
| `status` | TEXT | Stato busta |
| `recipient_email` | TEXT | Email destinatario |
| `recipient_name` | TEXT | Nome destinatario |
| `created_at` | TEXT | Data creazione |
| `updated_at` | TEXT | Data aggiornamento |

---

### 7. **docusign_tokens** - Token DocuSign
| Campo | Tipo | Descrizione |
|-------|------|-------------|
| `id` | INTEGER PRIMARY KEY | ID autoincrement |
| `access_token` | TEXT | Token accesso |
| `refresh_token` | TEXT | Token refresh |
| `expires_at` | TEXT | Scadenza token |
| `created_at` | TEXT | Data creazione |
| `updated_at` | TEXT | Data aggiornamento |

---

## 🔗 RELAZIONI CHIAVE

```
leads (1) ──→ (N) contracts
leads (1) ──→ (N) proforma
leads (1) ──→ (1) devices
contracts (1) ──→ (1) proforma
```

---

## 📁 ARCHIVIAZIONE PDF

### Struttura nel Database
I PDF vengono salvati nel campo `content` come **Base64** e nel campo `file_path` come riferimento:

#### Contratti
- Campo: `contracts.content` (Base64)
- Campo: `contracts.file_path` (es: `/contracts/CTR_2025_0001.pdf`)
- Generazione: `src/modules/contract-generator.ts`

#### Proforma
- Campo: `proforma.content` (Base64)
- Campo: `proforma.file_path` (es: `/proforma/PFM_2025_0001.pdf`)
- Generazione: `src/modules/proforma-generator.ts`

---

## 🎯 API ENDPOINTS

### Admin Dashboard
- `GET /api/admin/dashboard/stats` - Statistiche dashboard
- `GET /api/admin/leads` - Lista lead
- `GET /api/admin/contracts` - Lista contratti
- `GET /api/admin/proforma` - Lista proforma
- `GET /api/admin/devices` - Lista dispositivi

### Contract Operations
- `POST /api/admin/contracts/:id/confirm-signature` - Conferma firma contratto
- `POST /api/admin/contracts/:id/confirm-olografa` - Conferma firma olografa
- `GET /api/contratti/:id/view` - Visualizza PDF contratto

### Proforma Operations
- `POST /api/admin/proforma/:id/confirm-payment` - Conferma pagamento

### Device Operations
- `POST /api/admin/devices` - Crea dispositivo
- `POST /api/admin/devices/:id/associate` - Associa a lead

---

## ⚙️ VARIABILI AMBIENTE

### Development (wrangler.jsonc)
```jsonc
"vars": {
  "RESEND_API_KEY": "re_Pnq97oxZ_Mc2X78wVvsaxDHZhpvpA8JGt",
  "EMAIL_FROM": "noreply@telemedcare.it",
  "EMAIL_TO_INFO": "info@telemedcare.it"
}
```

### Production (da configurare su Cloudflare)
- `SENDGRID_API_KEY` - API key SendGrid
- `RESEND_API_KEY` - API key Resend (fallback)
- `EMAIL_FROM` - Email mittente
- `EMAIL_TO_INFO` - Email destinatario info@

---

## 📝 TRADUZIONI ITALIANE

### Stati Contratti
```typescript
'generated' → 'Generato'
'SENT' → 'Inviato'
'SIGNED_MANUAL' → 'Firmato'
'SIGNED_DOCUSIGN' → 'Firmato'
```

### Stati Proforma
```typescript
'PENDING' → 'In Attesa di Pagamento'
'PAID' → 'Pagato'
'PAID_BANK_TRANSFER' → 'Pagato (Bonifico)'
'PAID_STRIPE' → 'Pagato (Stripe)'
```

### Piani
```typescript
'BASE' → 'Base'
'AVANZATO' → 'Avanzato'
'ADVANCED' → 'Avanzato'
'PREMIUM' → 'Premium'
```

---

## 🚀 WORKFLOW COMPLETO

```
1. LEAD CREATED → status: 'nuovo'
2. CONTRACT GENERATED → codice: CTR_YYYY/NNNN, status: 'generated'
3. CONTRACT SENT → contract.status: 'SENT', lead.status: 'CONTRACT_SENT'
4. SIGNATURE CONFIRMED → contract.status: 'SIGNED_MANUAL', signature_date: NOW
5. PROFORMA GENERATED → numero: PFM_YYYY/NNNN, status: 'PENDING'
6. PROFORMA EMAIL SENT → inviata_il: NOW
7. PAYMENT CONFIRMED → proforma.status: 'PAID_BANK_TRANSFER', payment_date: NOW
8. LEAD ACTIVATED → lead.status: 'ACTIVE'
```

---

## 🔧 MIGRATION FILES (in ordine)

1. `0001_initial_schema.sql` - Schema base
2. `0002_add_missing_tables.sql` - Tabelle aggiuntive
3. `0003_fix_schema.sql` - Fix schema
4. `0004_add_missing_templates.sql` - Template email
5. `0007_fix_proforma_schema.sql` - Fix proforma
6. `0019_create_docusign_envelopes_table.sql` - DocuSign
7. `0020_create_docusign_tokens_table.sql` - Token DocuSign
8. `0021_create_proformas_table.sql` - Proforma table
9. `0022_create_devices_table.sql` - Devices table
10. `0023_update_contracts_status.sql` - Update status
11. `0024_simplify_contract_codes.sql` - Codici semplificati
12. `0025_add_inviata_il_to_proforma.sql` - Add inviata_il column for email resend tracking
13. `0026_update_benvenuto_template_with_form_link.sql` - Add configuration form link to welcome email
14. `0027_add_payment_date_to_proforma.sql` - Add data_pagamento column for payment confirmation

---

## 📌 NOTE IMPORTANTI

1. **I database locali di wrangler sono identificati da hash** nella cartella `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/`
2. **Ogni binding DB crea un database separato** - usare sempre lo stesso binding
3. **I PDF vanno salvati come Base64** nei campi `content` delle tabelle
4. **Le email usano EmailService.getInstance()** con template da `email_templates`
5. **I codici sono sequenziali per anno**: CTR_2025/0001, PFM_2025/0001, ecc.

---

## 🔧 TROUBLESHOOTING - Problemi Comuni

### Allegati Email Non Inviati
**Sintomo**: Log mostra `⚠️ [FILE-LOADER] Allegato saltato (non caricato)`
**Causa**: File loader usa porta sbagliata o file non trovati
**Fix Automatico**: 
- Sistema ora rileva automaticamente la porta del server con `detectServerPort()`
- Prova porte comuni: 3001, 4005, 8080, 3000, 8787
- Log mostra: `🔍 [PORT-DETECT] Server rilevato su porta XXXX`

**Fix Manuale** (se auto-detect fallisce):
1. Verifica server attivo: `curl http://localhost:3001/documents/brochures/brochure_telemedcare.pdf | head -c 20`
2. Controlla route `/documents/*` in `src/index.tsx`
3. Verifica log per `[PORT-DETECT]` e `[FILE-LOADER]`

### Template Email Sbagliati o Vecchi
**Sintomo**: Email inviate con contenuto errato o placeholder non sostituiti
**Causa**: Template nel database non aggiornati
**Fix**:
1. Usa `RESTORE_WORKING_TEMPLATES.sql` (contiene template corretti)
2. Applica: `npx wrangler d1 execute DB --local --file=RESTORE_WORKING_TEMPLATES.sql`
3. Template devono avere placeholder dinamici (es: `{{ALLEGATI_LISTA}}`, `{{BROCHURE_HTML}}`)

### Dashboard Non Mostra Colonna PIANO
**Sintomo**: Colonna "Piano" mostra "-" nei contratti
**Causa**: Campo `piano` o `piano_servizio` mancante nella query
**Fix**: Verificare query API in `src/modules/admin-api.ts` include il campo piano

### Server Non Si Avvia (Address Already in Use)
**Sintomo**: `Address already in use (0.0.0.0:3001)`
**Fix**: 
```bash
lsof -ti:3001 | xargs kill -9
cd /home/user/webapp && npm exec -- wrangler pages dev dist --port 3001 --ip 0.0.0.0
```

### Test Script per Verificare Tutto
```bash
# Esegui test completo con tutte le 7 combinazioni
cd /home/user/webapp && ./test-all-combinations.sh

# Verifica allegati nei log
# Dovresti vedere: 🔍 [PORT-DETECT] Server rilevato su porta 3001
#                  ✅ [FILE-LOADER] File caricato via HTTP (porta 3001): 1117.58 KB
```

### Test Invio Proforma
**Workflow Completo**:
1. Lead creato → Contratto generato e inviato
2. **Conferma firma contratto** in dashboard (click "✅ Conferma Firma")
3. Sistema genera automaticamente proforma PFM_YYYY/NNNN
4. Sistema invia email con proforma al cliente
5. Verifica email con PDF proforma allegato

**API per Test Manuale**:
```bash
# Conferma firma contratto (genera e invia proforma)
curl -X POST http://localhost:3001/api/admin/contracts/CTR_2025_XXXX/confirm-signature \
  -H "Content-Type: application/json" \
  -d '{"signatureDate": "2025-11-10"}'

# Verifica proforma generata
curl http://localhost:3001/api/proformas

# Download PDF proforma
curl http://localhost:3001/api/proforma/ID_PROFORMA/download > proforma.pdf
```

---

**Ultimo aggiornamento**: 2025-11-10 08:30 UTC
**Versione**: 1.1 (con troubleshooting allegati email)
