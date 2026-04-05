# 🔍 ANALISI COMPLETA E METODICA - TUTTI I PROBLEMI

**Data**: 10 Febbraio 2026
**Versione**: V12.0.3
**Commit corrente**: 176335b

---

## 📋 **LISTA PROBLEMI CONFERMATI**

### ✅ **1. AUTO-IMPORT AL REFRESH - RISOLTO**
- **Status**: ✅ FUNZIONA (confermato dall'utente)
- **Commit fix**: 12970ae
- **Test**: Rosaria Ressa reimportata con successo

---

### 🔴 **2. FORM COMPLETAMENTO DATI - HTTP 500**

#### **PROBLEMA**
- Form completamento dati restituisce HTTP 500
- URL chiamato: `/api/lead/:id/complete` (SINGOLARE)
- Endpoint definito: `/api/leads/:id/complete` (PLURALE)

#### **ROOT CAUSE**
- Form HTML generato nelle email VECCHIE usa `/api/lead/` (singolare)
- Form HTML corrente in `src/form-html.ts` usa `/api/leads/` (plurale) ✅
- L'alias creato nel commit 176335b usa `fetch()` interno che NON funziona in Cloudflare Workers

#### **SOLUZIONE CORRETTA**
1. **Opzione A**: Refactorare logica endpoint in funzione condivisa
   - Creare `async function handleLeadCompletion(c, id)` in modulo separato
   - Chiamare da entrambi gli endpoint (`/api/lead/` e `/api/leads/`)
   - Pro: DRY, manutenibile
   - Contro: Richiede refactoring (30-40 min)

2. **Opzione B**: Duplicare l'endpoint per l'alias ⭐ **RACCOMANDATO**
   - Copiare tutta la logica dell'endpoint `/api/leads/:id/complete`
   - Incollare in `/api/lead/:id/complete` (singolare)
   - Pro: Veloce (5 min), funziona subito
   - Contro: Codice duplicato (250 righe)

3. **Opzione C**: Correggere il form HTML nelle email già inviate
   - Impossibile: le email sono già state inviate
   - Il link contiene `/api/lead/` hard-coded

**DECISIONE**: Opzione B (duplicare endpoint) → Soluzione immediata

#### **CAMPI NOT NULL DA POPOLARE**
- `email` (legacy NOT NULL)
- `emailRichiedente` (nuovo)
- `telefono` (legacy)
- `telefonoRichiedente` (nuovo)

**FIX GIÀ APPLICATO**: Commit 400af91 popola entrambi i campi

---

### 🔴 **3. CRON GIORNALIERO 8:00 NON FUNZIONA**

#### **PROBLEMA**
- Workflow GitHub Actions non esegue l'import automatico alle 8:00
- File: `.github/workflows/hubspot-sync-cron.yml`

#### **ROOT CAUSE DA VERIFICARE**
1. Endpoint chiamato potrebbe essere sbagliato
2. Secrets GitHub potrebbero essere mancanti
3. Workflow potrebbe essere disabilitato
4. Errore di autenticazione

#### **ANALISI NECESSARIA**
1. Leggere file `.github/workflows/hubspot-sync-cron.yml`
2. Verificare endpoint chiamato (deve essere `/api/hubspot/auto-import`)
3. Verificare secrets richiesti
4. Controllare log GitHub Actions

#### **SOLUZIONE**
Dopo analisi del file workflow

---

### 🟠 **4. SERVIZIO/PIANO IGNORATO - SEMPRE "eCura PRO BASE"**

#### **PROBLEMA**
- Da ieri (9-10 Feb) i lead indicano "eCura FAMILY BASE" su ecura.it
- Ma viene salvato "eCura PRO BASE" in TeleMedCare
- Problema: mapping da HubSpot ignora i campi custom

#### **ROOT CAUSE**
- I campi `servizio_ecura` e `piano_ecura` su HubSpot sono NULL
- Il mapping usa default: `servizioEcura = props.servizio_ecura || 'PRO'`
- Ma il form ecura.it dovrebbe popolare questi campi!

#### **POSSIBILI CAUSE**
1. **Form ecura.it non invia i campi a HubSpot**
   - Il form su ecura.it potrebbe non essere configurato correttamente
   - I campi `servizio_ecura` / `piano_ecura` potrebbero non essere mappati

2. **HubSpot non salva i campi custom**
   - I campi custom potrebbero non esistere su HubSpot
   - O potrebbero avere nomi diversi (es. `servizio_di_interesse` invece di `servizio_ecura`)

3. **Import usa campi sbagliati**
   - Auto-import usa: `servizio_ecura` / `piano_ecura`
   - Pulsante IRBEMA usa: `servizio_di_interesse` / `piano_desiderato`
   - **POTREBBE ESSERE QUESTO IL PROBLEMA!**

#### **VERIFICA NECESSARIA**
1. Controllare quali campi usa l'auto-import vs IRBEMA
2. Verificare quali campi vengono popolati dal form ecura.it su HubSpot
3. Unificare il mapping per usare gli stessi campi

#### **SOLUZIONE**
Dopo verifica campi, modificare mapping per controllare ENTRAMBI i set di campi:
```typescript
const servizioEcura = props.servizio_ecura || props.servizio_di_interesse || 'PRO'
const pianoEcura = props.piano_ecura || props.piano_desiderato || 'BASE'
```

---

### 🟡 **5. CAMPI "vuoleBrochure" e "vuoleContratto" = 1.0 INVECE DI "Si"**

#### **PROBLEMA**
- Da ieri i campi vengono inseriti come `1.0` invece di "Si"
- Tipo dati: dovrebbe essere TEXT ma viene salvato come FLOAT

#### **ROOT CAUSE**
- Il DB probabilmente ha campi INTEGER (0/1)
- Ma il codice si aspetta TEXT ("Si"/"No")
- Oppure c'è una conversione sbagliata durante l'INSERT

#### **VERIFICA NECESSARIA**
1. Controllare schema DB: tipo di `vuoleBrochure` e `vuoleContratto`
2. Controllare codice INSERT: cosa viene inviato al DB
3. Verificare se c'è una conversione automatica

#### **SOLUZIONE**
- Se DB è INTEGER: OK, lasciare 0/1 e modificare frontend per visualizzare "Si"/"No"
- Se DB è TEXT: Correggere INSERT per salvare "Si"/"No" invece di 1/0

---

### 🟡 **6. CAMPO "tipoServizio" DUPLICA "servizio"**

#### **PROBLEMA**
- `tipoServizio` dovrebbe essere "eCura"
- Invece viene replicato il servizio completo (es. "eCura PRO")

#### **ROOT CAUSE**
- Il mapping assegna `tipoServizio = servizio` invece di un valore fisso

#### **VERIFICA NECESSARIA**
1. Trovare dove viene assegnato `tipoServizio` nel codice
2. Verificare la logica di assegnazione

#### **SOLUZIONE**
```typescript
// SBAGLIATO:
tipoServizio: leadData.servizio

// CORRETTO:
tipoServizio: 'eCura'  // Valore fisso
```

---

## 🎯 **PIANO D'AZIONE PRIORITARIO**

### **FASE 1: FIX CRITICI (Ora)**
1. ✅ Form completamento dati (duplicare endpoint)
2. ⏳ CRON giornaliero (analizzare workflow)
3. ⏳ Servizio/Piano ignorato (unificare mapping campi)

### **FASE 2: FIX MEDI (Dopo)**
4. ⏳ Campi vuoleBrochure/vuoleContratto (verificare schema DB)
5. ⏳ Campo tipoServizio (correggere assegnazione)

### **FASE 3: EMAIL IRBEMA**
6. ⏳ Aggiungere email completamento al pulsante IRBEMA

---

## 📝 **NOTE METODOLOGICHE**

### **COSA HO SBAGLIATO PRIMA**
1. Procedevo per ipotesi invece di verificare i fatti
2. Fixavo un problema alla volta senza analisi complessiva
3. Non testavo i fix abbastanza a fondo
4. Non consideravo tutti i casi d'uso (form vecchi vs nuovi)

### **APPROCCIO CORRETTO ORA**
1. ✅ Analisi completa di TUTTI i problemi
2. ✅ Identificazione ROOT CAUSE prima di fixare
3. ✅ Verifica FATTI nel codice, non ipotesi
4. ✅ Test completi prima di committare
5. ✅ Documentazione dettagliata

---

## ⏱️ **STIME TEMPO**

| Fix | Tempo stimato | Priorità |
|-----|--------------|----------|
| 1. Form completamento | 10 min | 🔴 CRITICO |
| 2. CRON 8:00 | 20 min | 🔴 CRITICO |
| 3. Servizio/Piano | 15 min | 🟠 ALTO |
| 4. vuoleBrochure/Contratto | 10 min | 🟡 MEDIO |
| 5. tipoServizio | 5 min | 🟡 MEDIO |
| 6. Email IRBEMA | 15 min | ⏳ DOPO |

**TOTALE**: ~75 minuti (1h 15min) per tutti i fix

---

## 🚀 **PROSSIMI PASSI**

1. **Conferma dall'utente**: Quali fix fare per primi?
2. **Esecuzione metodica**: Un fix alla volta, testato
3. **Commit atomici**: Un commit per fix, non tutti insieme
4. **Test completi**: Verificare ogni fix prima del successivo
5. **Documentazione**: Aggiornare questo file con risultati

---

**Fine analisi - Pronto per implementazione**
