# 🎨 DIAGRAMMA SCHEMA LEADS

## 📊 **STRUTTURA ENTITÀ**

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE LEADS                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
         ┌──────────────┐ ┌─────────────┐ ┌─────────────┐
         │ RICHIEDENTE  │ │  ASSISTITO  │ │ INTESTATARIO│
         │ (chi compila)│ │ (chi riceve)│ │ (chi paga)  │
         └──────────────┘ └─────────────┘ └─────────────┘
              │                  │               │
              │                  │               ├─ NON È UN'ENTITÀ
              │                  │               │  SEPARATA!
              │                  │               │
              ▼                  ▼               ▼
    ┌──────────────────┐ ┌────────────────┐ ┌──────────────────┐
    │ Campi MINIMI     │ │ Campi COMPLETI │ │ Campi PARZIALI   │
    ├──────────────────┤ ├────────────────┤ ├──────────────────┤
    │ • nome           │ │ • nome         │ │ • CF             │
    │ • cognome        │ │ • cognome      │ │ • indirizzo      │
    │ • email          │ │ • CF           │ │ • città          │
    │ • telefono       │ │ • indirizzo    │ │ • CAP            │
    │                  │ │ • città        │ │ • provincia ⭐   │
    │                  │ │ • CAP          │ │ • luogo nascita  │
    │                  │ │ • provincia ⭐ │ │ • data nascita   │
    │                  │ │ • luogo nascita│ │                  │
    │                  │ │ • data nascita │ │                  │
    └──────────────────┘ └────────────────┘ └──────────────────┘
```

---

## 🔄 **FLUSSO CALCOLO INTESTATARIO**

```
┌───────────────────────────────────────────────────────────────┐
│                  LEAD NEL DATABASE                            │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ intestatarioContratto = ???                              │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────┬───────────────────────────────┘
                                │
                ┌───────────────┴───────────────┐
                ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │ = 'richiedente'     │         │ = 'assistito'       │
    └─────────────────────┘         └─────────────────────┘
                │                               │
                ▼                               ▼
    ┌─────────────────────┐         ┌─────────────────────┐
    │ DATI INTESTATARIO   │         │ DATI INTESTATARIO   │
    │ ↓                   │         │ ↓                   │
    │ nomeRichiedente     │         │ nomeAssistito       │
    │ cognomeRichiedente  │         │ cognomeAssistito    │
    │ cfIntestatario ⭐   │         │ cfAssistito         │
    │ indirizzoIntest. ⭐ │         │ indirizzoAssistito  │
    │ cittaIntest. ⭐     │         │ cittaAssistito      │
    │ capIntest. ⭐       │         │ capAssistito        │
    │ provinciaIntest. ⭐ │         │ provinciaAssistito  │
    └─────────────────────┘         └─────────────────────┘
                │                               │
                └───────────────┬───────────────┘
                                ▼
                    ┌───────────────────────┐
                    │ CONTRATTO GENERATO    │
                    │ con dati corretti     │
                    └───────────────────────┘
```

---

## 🎯 **ESEMPIO PRATICO**

### **Scenario 1: Figlio compila per genitore**

```
RICHIEDENTE (figlio):          ASSISTITO (genitore):
├─ Mario Rossi                 ├─ Giuseppe Rossi
├─ mario@email.com             ├─ CF: RSSGPP45...
└─ 333-1234567                 ├─ Via Roma 10
                               ├─ Milano
                               ├─ 20100
                               └─ MI

intestatarioContratto = 'assistito'  ⬅️ Il genitore paga

CONTRATTO INTESTATO A:
└─ Giuseppe Rossi (assistito)
   CF: RSSGPP45...
   Via Roma 10 - 20100 Milano (MI)  ⭐
```

---

### **Scenario 2: Persona compila per sé stessa**

```
RICHIEDENTE = ASSISTITO:
├─ Maria Bianchi
├─ maria@email.com
└─ 333-7654321

DATI INTESTATARIO (salvati nel DB):
├─ CF: BNCMRA80...           → cfIntestatario
├─ Via Verdi 5               → indirizzoIntestatario
├─ Roma                      → cittaIntestatario
├─ 00100                     → capIntestatario
└─ RM                        → provinciaIntestatario ⭐

intestatarioContratto = 'richiedente'  ⬅️ Default

CONTRATTO INTESTATO A:
└─ Maria Bianchi (richiedente)
   CF: BNCMRA80...
   Via Verdi 5 - 00100 Roma (RM)  ⭐
```

---

## 🔍 **DOVE SONO I DATI?**

### **Nel DATABASE:**

```sql
-- Quando intestatario = 'richiedente':
SELECT 
  nomeRichiedente,           -- Nome
  cognomeRichiedente,        -- Cognome
  cfIntestatario,            -- CF
  indirizzoIntestatario,     -- Indirizzo
  cittaIntestatario,         -- Città
  capIntestatario,           -- CAP
  provinciaIntestatario      -- Provincia ⭐
FROM leads 
WHERE id = 'LEAD-XXX';

-- Quando intestatario = 'assistito':
SELECT 
  nomeAssistito,             -- Nome
  cognomeAssistito,          -- Cognome
  cfAssistito,               -- CF
  indirizzoAssistito,        -- Indirizzo
  cittaAssistito,            -- Città
  capAssistito,              -- CAP
  provinciaAssistito         -- Provincia ⭐
FROM leads 
WHERE id = 'LEAD-XXX';
```

---

## ⚠️ **ERRORI DA EVITARE**

### **❌ ERRORE: Cercare campi che non esistono**

```
SBAGLIATO:                    CORRETTO:
┌─────────────────┐          ┌─────────────────┐
│ provinciaRichied│   ❌     │ provinciaIntesta│  ✅
│ (NON ESISTE!)   │    →     │ (quando rich.)  │
└─────────────────┘          └─────────────────┘
         ▼                            ▼
    SELECT NULL              SELECT "MI"
```

---

### **❌ ERRORE: Creare campi duplicati**

```
Database SBAGLIATO:          Database CORRETTO:
┌─────────────────────┐     ┌─────────────────────┐
│ provinciaRichiedente│ ❌  │ provinciaIntestatario│ ✅
│ provinciaIntestatario│     │ (usato per richied.)│
│ provinciaAssistito   │     │                      │
└─────────────────────┘     │ provinciaAssistito   │
     (3 campi)              └─────────────────────┘
                                  (2 campi)
```

---

## 📋 **QUICK REFERENCE**

### **Voglio il nome dell'intestatario:**

```javascript
if (intestatarioContratto === 'richiedente') {
  nome = nomeRichiedente
} else {
  nome = nomeAssistito
}
```

### **Voglio la provincia dell'intestatario:**

```javascript
if (intestatarioContratto === 'richiedente') {
  provincia = provinciaIntestatario  // ⭐ GIÀ nel DB
} else {
  provincia = provinciaAssistito
}
```

### **Voglio il CF dell'intestatario:**

```javascript
if (intestatarioContratto === 'richiedente') {
  cf = cfIntestatario  // Salvato nel DB
} else {
  cf = cfAssistito
}
```

---

## 🎯 **MEMORIZZA QUESTO!**

```
╔═══════════════════════════════════════════════════════════╗
║  provinciaIntestatario = provincia del RICHIEDENTE       ║
║  quando intestatarioContratto = 'richiedente'            ║
║                                                           ║
║  provinciaAssistito = provincia dell'ASSISTITO           ║
║  quando intestatarioContratto = 'assistito'              ║
║                                                           ║
║  provinciaRichiedente = NON ESISTE! ❌                   ║
╚═══════════════════════════════════════════════════════════╝
```

---

**📝 Leggi `SCHEMA_LEADS_LOGICA.md` per dettagli completi!**
