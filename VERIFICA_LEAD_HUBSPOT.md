# 🔍 Verifica Lead su HubSpot - API Endpoint
**TeleMedCare V12.0.3 - 10 Febbraio 2026**

---

## 🎯 Endpoint Creato

```
GET /api/hubspot/verify-leads?names=Rita,Giovanna,Tina
```

**URL Completo:**
```
https://telemedcare-v12.pages.dev/api/hubspot/verify-leads?names=Rita,Giovanna,Tina
```

---

## 📋 Cosa Fa

1. **Cerca i lead su HubSpot** per nome (firstname)
2. **Legge i campi:**
   - `servizio_ecura` (FAMILY/PRO/PREMIUM)
   - `piano_ecura` (BASE/AVANZATO)
   - `hs_object_source_detail_1` (Form eCura)
   - Email, telefono, data creazione
3. **Calcola il prezzo atteso** usando il pricing-calculator
4. **Confronta con TeleMedCare:**
   - Verifica se il lead esiste già
   - Controlla se il prezzo è 0 o NULL
   - Identifica lead che necessitano fix
5. **Restituisce report completo** con tutti i dati

---

## 🚀 Come Usarlo

### Opzione 1: Browser (Modo più semplice)

1. **Attendi 2-3 minuti** per il deploy Cloudflare
2. **Apri questo URL nel browser:**
   ```
   https://telemedcare-v12.pages.dev/api/hubspot/verify-leads?names=Rita,Giovanna,Tina
   ```
3. **Vedrai un JSON** con tutti i dati!

### Opzione 2: Console Browser

1. Vai su: https://telemedcare-v12.pages.dev/dashboard
2. Apri Console (F12)
3. Esegui:
   ```javascript
   fetch('/api/hubspot/verify-leads?names=Rita,Giovanna,Tina')
     .then(r => r.json())
     .then(data => console.log(JSON.stringify(data, null, 2)))
   ```

### Opzione 3: curl (da terminale)

```bash
curl "https://telemedcare-v12.pages.dev/api/hubspot/verify-leads?names=Rita,Giovanna,Tina" | jq
```

---

## 📊 Response Attesa

```json
{
  "success": true,
  "results": [
    {
      "searchName": "Rita",
      "found": true,
      "hubspot": {
        "id": "123456789",
        "firstname": "Rita",
        "lastname": "Galletto",
        "email": "rita.galletto@example.com",
        "servizio_ecura": "PRO",
        "piano_ecura": "BASE",
        "form_source": "Form eCura",
        "created": "2026-02-05T10:30:00Z"
      },
      "expectedPrice": {
        "servizio": "PRO",
        "piano": "BASE",
        "setupBase": 480,
        "rinnovoBase": 240,
        "setupTotale": 585.6,
        "rinnovoTotale": 292.8
      },
      "pricingError": null,
      "telemedcare": {
        "id": "LEAD-IRBEMA-00146",
        "nome": "Rita Galletto",
        "servizio": "eCura PRO",
        "piano": "BASE",
        "prezzo_anno": 0,
        "prezzo_rinnovo": 0,
        "needsFix": true
      }
    },
    {
      "searchName": "Giovanna",
      "found": true,
      "hubspot": {
        "id": "987654321",
        "firstname": "Giovanna",
        "lastname": "Santamaria",
        "email": "giovanna.santamaria@example.com",
        "servizio_ecura": "FAMILY",
        "piano_ecura": "AVANZATO",
        "form_source": "Form eCura",
        "created": "2026-02-06T14:20:00Z"
      },
      "expectedPrice": {
        "servizio": "FAMILY",
        "piano": "AVANZATO",
        "setupBase": 690,
        "rinnovoBase": 500,
        "setupTotale": 841.8,
        "rinnovoTotale": 610
      },
      "pricingError": null,
      "telemedcare": {
        "id": "LEAD-IRBEMA-00147",
        "nome": "Giovanna Santamaria",
        "servizio": "eCura FAMILY",
        "piano": "AVANZATO",
        "prezzo_anno": 0,
        "prezzo_rinnovo": 0,
        "needsFix": true
      }
    },
    {
      "searchName": "Tina",
      "found": true,
      "hubspot": {
        "id": "555666777",
        "firstname": "Tina",
        "lastname": "Zingale",
        "email": "tina.zingale@example.com",
        "servizio_ecura": null,
        "piano_ecura": null,
        "form_source": "Form eCura",
        "created": "2026-02-07T09:15:00Z"
      },
      "expectedPrice": null,
      "pricingError": null,
      "telemedcare": {
        "id": "LEAD-IRBEMA-00148",
        "nome": "Tina Zingale",
        "servizio": "eCura PRO",
        "piano": "BASE",
        "prezzo_anno": 0,
        "prezzo_rinnovo": 0,
        "needsFix": true
      }
    }
  ],
  "summary": {
    "total": 3,
    "found": 3,
    "notFound": 0,
    "needsPriceFix": 3
  }
}
```

---

## 🔍 Interpretazione Risultati

### ✅ Caso 1: Rita Galletto
```json
"hubspot": {
  "servizio_ecura": "PRO",
  "piano_ecura": "BASE"
}
"expectedPrice": {
  "setupBase": 480,
  "rinnovoBase": 240
}
"telemedcare": {
  "prezzo_anno": 0,
  "needsFix": true
}
```

**Interpretazione:**
- ✅ Su HubSpot ha servizio/piano **compilati correttamente**
- ✅ Prezzo atteso: **€480/anno**, **€240 rinnovo**
- ❌ Su TeleMedCare ha prezzo **0** → **NECESSITA FIX**

**Causa:** Errore durante import o calcolo prezzi fallito

**Soluzione:**
- Modifica manuale da dashboard: seleziona "eCura PRO" + "BASE" → salva
- Oppure: DELETE lead + re-import con pulsante IRBEMA

---

### ❌ Caso 2: Tina Zingale
```json
"hubspot": {
  "servizio_ecura": null,
  "piano_ecura": null
}
"expectedPrice": null
"telemedcare": {
  "servizio": "eCura PRO",
  "piano": "BASE",
  "prezzo_anno": 0,
  "needsFix": true
}
```

**Interpretazione:**
- ❌ Su HubSpot **NON ha** servizio/piano compilati
- ❌ Sistema ha usato default (PRO/BASE) ma calcolo prezzi fallito
- ❌ Su TeleMedCare ha prezzo **0** → **NECESSITA FIX**

**Causa:** Campi custom HubSpot mancanti

**Soluzione:**
1. **Su HubSpot:** aggiungi `servizio_ecura` e `piano_ecura`
2. **Su TeleMedCare:** DELETE lead + re-import
3. Oppure: modifica manuale da dashboard

---

## 🛠️ Come Correggere i Prezzi

### Metodo 1: Modifica Manuale (Consigliato)

1. **Dashboard Operativa:** https://telemedcare-v12.pages.dev/dashboard
2. **Trova il lead** (es. Rita Galletto)
3. Click **✏️ Modifica**
4. **Seleziona Servizio:** eCura PRO
5. **Seleziona Piano:** BASE
6. Click **💾 Salva**
7. Il sistema ricalcola automaticamente i prezzi!

### Metodo 2: Cancella e Re-Import

1. **Dashboard Operativa**
2. **Trova il lead**
3. Click **🗑️ Elimina**
4. Click pulsante **IRBEMA** (blu)
5. Il lead viene reimportato con prezzi corretti

### Metodo 3: API Fix Automatico

```bash
POST https://telemedcare-v12.pages.dev/api/leads/fix-prices
```

Questo endpoint:
- Trova tutti i lead con prezzo 0 o NULL
- Legge servizio/piano dal lead
- Ricalcola il prezzo usando pricing-calculator
- Aggiorna il database

---

## 📋 Parametri Aggiuntivi

### Cerca Lead Diversi

Puoi cercare altri lead modificando il parametro `names`:

```
/api/hubspot/verify-leads?names=Mario,Luigi,Peach
```

I nomi vengono cercati nel campo `firstname` di HubSpot.

### Default

Se non specifichi `names`, cerca automaticamente:
```
names=Rita,Giovanna,Tina
```

---

## 🐛 Possibili Errori

### Errore 500: "Credenziali HubSpot non configurate"

**Causa:** Mancano `HUBSPOT_ACCESS_TOKEN` o `HUBSPOT_PORTAL_ID`

**Soluzione:**
1. Vai su Cloudflare Pages Dashboard
2. Progetto: telemedcare-v12
3. Settings → Environment variables
4. Verifica che ci siano:
   - `HUBSPOT_ACCESS_TOKEN`
   - `HUBSPOT_PORTAL_ID`

### Errore 404: "Lead non trovato"

**Causa:** Il nome cercato non esiste su HubSpot

**Risposta:**
```json
{
  "searchName": "Mario",
  "found": false,
  "message": "Nessun contatto trovato su HubSpot"
}
```

Normale se il contatto non esiste.

### pricingError nel risultato

**Esempio:**
```json
"pricingError": "Servizio non valido: PROO"
```

**Causa:** Il campo `servizio_ecura` su HubSpot ha un valore non valido

**Valori validi:**
- FAMILY
- PRO
- PREMIUM

**Soluzione:** Correggi su HubSpot

---

## 📊 Summary Spiegato

```json
"summary": {
  "total": 3,           // Totale lead cercati
  "found": 3,           // Lead trovati su HubSpot
  "notFound": 0,        // Lead non trovati
  "needsPriceFix": 3    // Lead con prezzo 0 che necessitano fix
}
```

**Se needsPriceFix > 0:**
Ci sono lead con prezzi da correggere!

---

## 🚀 Prossimi Passi

1. **ORA:** Attendi 2-3 minuti deploy Cloudflare
2. **ORA:** Apri l'URL nel browser:
   ```
   https://telemedcare-v12.pages.dev/api/hubspot/verify-leads?names=Rita,Giovanna,Tina
   ```
3. **Leggi il JSON** e identifica:
   - Quali lead hanno `servizio_ecura` su HubSpot
   - Quali lead hanno `expectedPrice` calcolato
   - Quali lead hanno `needsFix: true`
4. **Correggi i prezzi** usando uno dei 3 metodi sopra
5. **Testa di nuovo** per verificare che `needsFix: false`

---

## 💡 Tip Utile

Puoi usare **jq** per filtrare solo i lead che necessitano fix:

```bash
curl "https://telemedcare-v12.pages.dev/api/hubspot/verify-leads?names=Rita,Giovanna,Tina" \
  | jq '.results[] | select(.telemedcare.needsFix == true)'
```

Oppure mostrare solo il summary:

```bash
curl "https://telemedcare-v12.pages.dev/api/hubspot/verify-leads?names=Rita,Giovanna,Tina" \
  | jq '.summary'
```

---

**Versione:** V12.0.3  
**Data:** 10 Febbraio 2026  
**Commit:** 4b1672a
