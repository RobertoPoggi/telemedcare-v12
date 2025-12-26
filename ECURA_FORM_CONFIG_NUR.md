# Configurazione Form eCura per Agenzia NUR
## TeleMedCare V11.0 / eCura - Integrazione HubSpot

---

## 📋 **CAMPI FORM DA IMPLEMENTARE**

### 1. **DATI RICHIEDENTE** (Obbligatori)
| Campo Form | Nome HubSpot | Tipo | Obbligatorio | Note |
|------------|--------------|------|--------------|------|
| Nome | `firstname` | Text | ✅ Sì | Campo standard HubSpot |
| Cognome | `lastname` | Text | ✅ Sì | Campo standard HubSpot |
| Email | `email` | Email | ✅ Sì | Campo standard HubSpot |
| Telefono | `phone` | Phone | ⚪ No | Campo standard HubSpot |

---

### 2. **DATI ASSISTITO** (Opzionali)
| Campo Form | Nome HubSpot | Tipo | Obbligatorio | Note |
|------------|--------------|------|--------------|------|
| Nome Assistito | `nome_assistito` | Text | ⚪ No | Custom property |
| Cognome Assistito | `cognome_assistito` | Text | ⚪ No | Custom property |
| Età Assistito | `eta_assistito` | Number | ⚪ No | Custom property |

---

### 3. **SCELTA SERVIZIO** (Obbligatori)
| Campo Form | Nome HubSpot | Tipo | Obbligatorio | Opzioni | Note |
|------------|--------------|------|--------------|---------|------|
| Servizio eCura | `servizio_ecura` | Dropdown | ✅ Sì | `FAMILY`<br>`PRO`<br>`PREMIUM` | Custom property |
| Piano Assistenza | `piano_ecura` | Dropdown | ✅ Sì | `BASE`<br>`AVANZATO` | Custom property |

**🔹 Logica UI Suggerita:**
```
1. Utente sceglie "Servizio eCura" (FAMILY/PRO/PREMIUM)
2. Si apre automaticamente "Piano Assistenza" (BASE/AVANZATO)
3. Mostra descrizione e prezzo del piano selezionato
```

---

### 4. **RICHIESTE DOCUMENTI** (Opzionali)
| Campo Form | Nome HubSpot | Tipo | Default | Note |
|------------|--------------|------|---------|------|
| Richiedi Brochure | `richiedi_brochure` | Checkbox | ✅ Checked | Custom property |
| Richiedi Contratto | `richiedi_contratto` | Checkbox | ⚪ Unchecked | Custom property |

**🔹 Testi Suggeriti:**
- ✅ **Richiedi Brochure**: "Inviami la brochure del dispositivo selezionato"
- ✅ **Richiedi Contratto**: "Inviami il contratto pre-compilato per procedere subito"

---

### 5. **CONSENSI E NOTE** (Opzionali)
| Campo Form | Nome HubSpot | Tipo | Obbligatorio | Note |
|------------|--------------|------|--------------|------|
| Note | `note` | Textarea | ⚪ No | Condizioni salute, esigenze speciali, etc. |
| Privacy Consent | `privacy_consent` | Checkbox | ✅ Sì | Obbligatorio per GDPR |
| Marketing Consent | `marketing_consent` | Checkbox | ⚪ No | Opzionale |

---

## 🔗 **CONFIGURAZIONE WEBHOOK HUBSPOT**

### Endpoint TeleMedCare
```
POST https://telemedcare-v11.pages.dev/api/webhooks/hubspot
```
*(URL finale da confermare dopo deploy)*

### Tipo di Webhook
- **Trigger**: `Contact Created` o `Form Submission`
- **Event**: Quando un nuovo contatto viene creato nel CRM Irbema tramite form eCura

### Header Richiesti (Opzionali per Security)
```json
{
  "Content-Type": "application/json",
  "X-HubSpot-Signature": "[firma webhook HubSpot]"
}
```

### Payload Esempio
```json
{
  "objectId": 12345,
  "portalId": 987654,
  "subscriptionType": "contact.creation",
  "properties": {
    "firstname": "Roberto",
    "lastname": "Poggi",
    "email": "rpoggi55@gmail.com",
    "phone": "+39 335 1234567",
    "nome_assistito": "Maria",
    "cognome_assistito": "Poggi",
    "eta_assistito": "78",
    "servizio_ecura": "PRO",
    "piano_ecura": "AVANZATO",
    "richiedi_brochure": "true",
    "richiedi_contratto": "false",
    "note": "Paziente con cardiopatia",
    "privacy_consent": "true",
    "marketing_consent": "true"
  }
}
```

---

## 📦 **BROCHURE DISPONIBILI**

Le brochure vengono inviate automaticamente in base al servizio scelto:

| Servizio | Dispositivo | Filename PDF | Status |
|----------|-------------|--------------|--------|
| **FAMILY** | Senium | `Brochure_Senium.pdf` | ⚠️ DA FORNIRE |
| **PRO** | SiDLY Care PRO | `Medica_GB_SiDLY_Care_PRO_ITA.pdf` | ✅ PRONTA |
| **PREMIUM** | SiDLY Vital Care | `Medica_GB_SiDLY_Vital_Care_ITA.pdf` | ✅ PRONTA |

---

## 🎨 **DESIGN FORM - SUGGERIMENTI**

### Struttura Consigliata (Progressive Disclosure)
```
STEP 1: Chi sei?
├─ Nome *
├─ Cognome *
├─ Email *
└─ Telefono

STEP 2: Per chi è il servizio?
├─ È per te o per qualcun altro? (Radio: Me / Altra persona)
├─ [Se "Altra persona"]
│   ├─ Nome Assistito
│   ├─ Cognome Assistito
│   └─ Età Assistito

STEP 3: Quale servizio ti interessa? *
├─ Servizio (FAMILY / PRO / PREMIUM)
│   └─ [Mostra card con descrizione dispositivo e prezzi]
└─ Piano (BASE / AVANZATO)
    └─ [Mostra prezzo finale]

STEP 4: Cosa vuoi ricevere?
├─ ✅ Inviami la brochure del dispositivo (checked by default)
├─ ⚪ Inviami il contratto pre-compilato per procedere subito
└─ Note / Esigenze particolari (textarea)

STEP 5: Consensi
├─ ✅ Accetto privacy policy * (obbligatorio)
└─ ⚪ Accetto di ricevere comunicazioni marketing

[PULSANTE SUBMIT: "RICHIEDI INFORMAZIONI"]
```

### Prezzi da Mostrare
```
BASE:
- Canone: €450/anno
- IVA 22%: €99,00
- TOTALE: €549,00/anno

AVANZATO:
- Canone: €840/anno
- IVA 22%: €184,80
- TOTALE: €1.024,80/anno
```

---

## 🔐 **SICUREZZA**

### API Key HubSpot (da fornire)
- **Private App Access Token** o **OAuth Token**
- Permessi richiesti: `contacts.read`, `webhooks.read`

### Webhook Authentication (opzionale)
HubSpot può firmare i webhook con `X-HubSpot-Signature` header.
TeleMedCare può validare questa firma se richiesto.

---

## ✅ **CHECKLIST IMPLEMENTAZIONE**

### Per NUR (Agenzia Marketing)
- [ ] Creare custom properties in HubSpot:
  - [ ] `servizio_ecura` (Dropdown: FAMILY/PRO/PREMIUM)
  - [ ] `piano_ecura` (Dropdown: BASE/AVANZATO)
  - [ ] `richiedi_brochure` (Checkbox)
  - [ ] `richiedi_contratto` (Checkbox)
  - [ ] `nome_assistito`, `cognome_assistito`, `eta_assistito` (Text/Number)
- [ ] Implementare form su www.ecura.it con campi sopra
- [ ] Configurare webhook HubSpot verso endpoint TeleMedCare
- [ ] Test invio dati form → HubSpot → TeleMedCare

### Per Irbema (Partner CRM)
- [ ] Fornire API Key HubSpot a TeleMedCare
- [ ] Fornire Portal ID HubSpot
- [ ] Autorizzare webhook endpoint di TeleMedCare
- [ ] Test ricezione lead nel CRM

### Per TeleMedCare (Backend)
- [x] Creare modulo `brochure-manager.ts`
- [x] Creare handler `hubspot-webhook-handler.ts`
- [x] Registrare endpoint `/api/webhooks/hubspot`
- [x] Aggiornare `workflow-email-manager` per brochure dinamiche
- [ ] Caricare 3 brochure PDF in `public/documents/`
- [ ] Deploy e test end-to-end
- [ ] Configurare variabile `HUBSPOT_API_KEY` in Cloudflare

---

## 📞 **CONTATTI**

Per domande tecniche sull'integrazione:
- **TeleMedCare**: info@telemedcare.it
- **eCura**: info@ecura.it

---

*Documento generato il 3 Novembre 2025*
*TeleMedCare V11.0 / eCura Integration*
