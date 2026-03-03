# 📋 SCHEMA LEADS - LOGICA INTESTATARIO

> **IMPORTANTE**: Questo documento spiega la logica CORRETTA dello schema leads.
> NON modificare senza aver compreso questa logica!

---

## 🔑 **CONCETTO CHIAVE**

Il database ha **3 entità** ma **2 set completi di campi** (richiedente + assistito):

1. **RICHIEDENTE**: Chi compila il form
2. **ASSISTITO**: Chi riceve il servizio (può coincidere con richiedente)
3. **INTESTATARIO**: Chi firma il contratto e paga (può essere richiedente O assistito)

**L'INTESTATARIO NON HA UN SET COMPLETO DI CAMPI!**

---

## 📊 **SCHEMA DATABASE**

### **Campi RICHIEDENTE (minimi)**
```sql
nomeRichiedente TEXT NOT NULL
cognomeRichiedente TEXT NOT NULL
email TEXT NOT NULL
telefono TEXT
```

**NOTA**: Il richiedente NON ha campi per indirizzo/CF/città/provincia perché:
- Se intestatario = richiedente → usa i campi `*Intestatario`
- Il richiedente può anche essere solo un intermediario

---

### **Campi ASSISTITO (completi)**
```sql
nomeAssistito TEXT
cognomeAssistito TEXT
cfAssistito TEXT
codiceFiscaleAssistito TEXT          -- ⚠️ DUPLICATO! Usa cfAssistito
indirizzoAssistito TEXT
cittaAssistito TEXT
capAssistito TEXT
provinciaAssistito TEXT              -- ⭐ PROVINCIA ASSISTITO
luogoNascitaAssistito TEXT
dataNascitaAssistito TEXT
```

---

### **Campi INTESTATARIO (parziali)**
```sql
-- ❌ NON ESISTONO:
-- nomeIntestatario
-- cognomeIntestatario
-- emailIntestatario
-- telefonoIntestatario

-- ✅ ESISTONO (dati anagrafici extra):
cfIntestatario TEXT
codiceFiscaleIntestatario TEXT       -- ⚠️ DUPLICATO! Usa cfIntestatario
indirizzoIntestatario TEXT
cittaIntestatario TEXT
capIntestatario TEXT
provinciaIntestatario TEXT           -- ⭐ PROVINCIA INTESTATARIO
luogoNascitaIntestatario TEXT
dataNascitaIntestatario TEXT

-- ✅ CAMPO DISCRIMINANTE:
intestatarioContratto TEXT DEFAULT 'richiedente'  -- 'richiedente' | 'assistito'
intestazioneContratto TEXT DEFAULT 'richiedente'  -- ⚠️ DUPLICATO! Usa intestatarioContratto
```

---

## 🔧 **LOGICA DI CALCOLO INTESTATARIO**

### **Quando `intestatarioContratto = 'richiedente'`:**

```javascript
// I campi *Intestatario SONO i dati del richiedente
nomeIntestatario = nomeRichiedente
cognomeIntestatario = cognomeRichiedente
emailIntestatario = email
telefonoIntestatario = telefono
cfIntestatario = cfIntestatario                    // Salvato nel DB
indirizzoIntestatario = indirizzoIntestatario      // Salvato nel DB
cittaIntestatario = cittaIntestatario              // Salvato nel DB
capIntestatario = capIntestatario                  // Salvato nel DB
provinciaIntestatario = provinciaIntestatario      // ⭐ Salvato nel DB
luogoNascitaIntestatario = luogoNascitaIntestatario
dataNascitaIntestatario = dataNascitaIntestatario
```

**IMPORTANTE**: 
- `provinciaIntestatario` è **già nel DB** quando intestatario = richiedente
- Il form salva direttamente in `provinciaIntestatario`
- **NON esiste** `provinciaRichiedente` nel DB

---

### **Quando `intestatarioContratto = 'assistito'`:**

```javascript
// I dati intestatario vengono dall'assistito
nomeIntestatario = nomeAssistito || nomeRichiedente
cognomeIntestatario = cognomeAssistito || cognomeRichiedente
emailIntestatario = email
telefonoIntestatario = telefono
cfIntestatario = cfIntestatario || cfAssistito
indirizzoIntestatario = indirizzoIntestatario || indirizzoAssistito
cittaIntestatario = cittaIntestatario || cittaAssistito
capIntestatario = capIntestatario || capAssistito
provinciaIntestatario = provinciaIntestatario || provinciaAssistito  // ⭐ Fallback assistito
luogoNascitaIntestatario = luogoNascitaIntestatario || luogoNascitaAssistito
dataNascitaIntestatario = dataNascitaIntestatario || dataNascitaAssistito
```

---

## 📋 **TABELLA MAPPATURA COMPLETA**

| Campo Calcolato | Se intestatario = 'richiedente' | Se intestatario = 'assistito' |
|---|---|---|
| `nomeIntestatario` | `nomeRichiedente` | `nomeAssistito` |
| `cognomeIntestatario` | `cognomeRichiedente` | `cognomeAssistito` |
| `emailIntestatario` | `email` | `email` |
| `telefonoIntestatario` | `telefono` | `telefono` |
| `cfIntestatario` | `cfIntestatario` (DB) | `cfIntestatario` \|\| `cfAssistito` |
| `indirizzoIntestatario` | `indirizzoIntestatario` (DB) | `indirizzoIntestatario` \|\| `indirizzoAssistito` |
| `cittaIntestatario` | `cittaIntestatario` (DB) | `cittaIntestatario` \|\| `cittaAssistito` |
| `capIntestatario` | `capIntestatario` (DB) | `capIntestatario` \|\| `capAssistito` |
| **`provinciaIntestatario`** | **`provinciaIntestatario` (DB)** ⭐ | **`provinciaIntestatario` \|\| `provinciaAssistito`** |
| `luogoNascitaIntestatario` | `luogoNascitaIntestatario` (DB) | `luogoNascitaIntestatario` \|\| `luogoNascitaAssistito` |
| `dataNascitaIntestatario` | `dataNascitaIntestatario` (DB) | `dataNascitaIntestatario` \|\| `dataNascitaAssistito` |

---

## ⚠️ **CAMPI RIDONDANTI DA IGNORARE**

Questi campi esistono nel DB ma sono duplicati:

```sql
-- Duplicati email/telefono:
emailRichiedente TEXT        -- ⚠️ Usa: email
telefonoRichiedente TEXT     -- ⚠️ Usa: telefono

-- Duplicati CF:
codiceFiscaleAssistito TEXT        -- ⚠️ Usa: cfAssistito
codiceFiscaleIntestatario TEXT     -- ⚠️ Usa: cfIntestatario

-- Duplicato intestazione:
intestazioneContratto TEXT   -- ⚠️ Usa: intestatarioContratto
```

---

## ❌ **CAMPI CHE NON ESISTONO (E NON SERVONO!)**

**NON creare questi campi nel DB:**

```sql
-- ❌ NON ESISTONO E NON SERVONO:
nomeIntestatario TEXT        -- CALCOLATO da nomeRichiedente o nomeAssistito
cognomeIntestatario TEXT     -- CALCOLATO da cognomeRichiedente o cognomeAssistito
emailIntestatario TEXT       -- CALCOLATO da email
telefonoIntestatario TEXT    -- CALCOLATO da telefono

-- ❌ NON ESISTONO E NON SERVONO:
cfRichiedente TEXT           -- Se richiedente = intestatario → usa cfIntestatario
indirizzoRichiedente TEXT    -- Se richiedente = intestatario → usa indirizzoIntestatario
cittaRichiedente TEXT        -- Se richiedente = intestatario → usa cittaIntestatario
capRichiedente TEXT          -- Se richiedente = intestatario → usa capIntestatario
provinciaRichiedente TEXT    -- Se richiedente = intestatario → usa provinciaIntestatario
```

---

## 🎯 **IMPLEMENTAZIONE NEL CODICE**

### **File: `src/modules/document-manager.ts`**

```typescript
// ⭐ CALCOLA dati intestatario in base a intestatarioContratto
const intestatario = lead.intestatarioContratto || lead.intestazioneContratto || 'richiedente'

if (intestatario === 'assistito') {
  // Intestatario = Assistito
  nomeIntestatario = lead.nomeAssistito || lead.nomeRichiedente
  cognomeIntestatario = lead.cognomeAssistito || lead.cognomeRichiedente
  provinciaIntestatarioCalc = lead.provinciaIntestatario || lead.provinciaAssistito || ''
} else {
  // Intestatario = Richiedente (default)
  // I campi *Intestatario SONO GIÀ i campi del richiedente
  nomeIntestatario = lead.nomeRichiedente
  cognomeIntestatario = lead.cognomeRichiedente
  provinciaIntestatarioCalc = lead.provinciaIntestatario || ''  // ⭐ GIÀ nel DB
}
```

---

## 📝 **FORM COMPLETAMENTO DATI**

### **File: `public/completa-dati-minimal.html`**

Il form deve salvare:

**Quando intestatario = 'richiedente':**
```html
<!-- Questi campi vanno in *Intestatario -->
<input name="cfIntestatario">
<input name="indirizzoIntestatario">
<input name="cittaIntestatario">
<input name="capIntestatario">
<input name="provinciaIntestatario">  ⭐
```

**Quando intestatario = 'assistito':**
```html
<!-- Questi campi vanno in *Assistito -->
<input name="cfAssistito">
<input name="indirizzoAssistito">
<input name="cittaAssistito">
<input name="capAssistito">
<input name="provinciaAssistito">  ⭐
```

---

## ✅ **CHECKLIST VERIFICA**

Quando modifichi il codice, verifica:

- [ ] NON creare campi `*Richiedente` per indirizzo/CF/provincia
- [ ] NON creare campi `nomeIntestatario` / `cognomeIntestatario` nel DB
- [ ] CALCOLA i dati intestatario in base a `intestatarioContratto`
- [ ] USA `provinciaIntestatario` dal DB quando intestatario = richiedente
- [ ] USA `provinciaAssistito` dal DB quando intestatario = assistito
- [ ] NON fare fallback a `provinciaRichiedente` (non esiste!)

---

## 🚨 **ERRORI COMUNI DA EVITARE**

### **❌ ERRORE 1: Cercare campi che non esistono**
```typescript
// ❌ SBAGLIATO:
provincia = lead.provinciaRichiedente  // NON ESISTE!

// ✅ CORRETTO:
provincia = lead.provinciaIntestatario  // Esiste quando intestatario = richiedente
```

### **❌ ERRORE 2: Creare migration inutili**
```sql
-- ❌ SBAGLIATO:
ALTER TABLE leads ADD COLUMN provinciaRichiedente TEXT;

-- ✅ CORRETTO:
-- Non serve! Usa provinciaIntestatario
```

### **❌ ERRORE 3: Fallback sbagliati**
```typescript
// ❌ SBAGLIATO:
if (intestatario === 'richiedente') {
  provincia = lead.provinciaIntestatario || lead.provinciaRichiedente  // provinciaRichiedente non esiste!
}

// ✅ CORRETTO:
if (intestatario === 'richiedente') {
  provincia = lead.provinciaIntestatario  // È già il campo corretto
}
```

---

## 📚 **RIFERIMENTI**

- **Codice principale**: `src/modules/document-manager.ts`
- **Mapping API**: `src/index.tsx` → `PUT /api/leads/:id`
- **Form completamento**: `public/completa-dati-minimal.html`
- **Generatore contratti**: `src/modules/contract-generator.ts`

---

## 🔄 **STORIA MODIFICHE**

- **2025-03-03**: Documento creato dopo bug di 2 giorni
- **Problema risolto**: Confusione tra campi esistenti e calcolati
- **Commit finale**: 7a73116 - FIX DEFINITIVO SCHEMA

---

**🎯 MEMORIZZA QUESTA LOGICA! È FONDAMENTALE! 🎯**
