# 🏥 eCura - Servizi, Dispositivi e Prezzi Reali

## 📱 DISPOSITIVI (Bracciali Certificati)

### **1. SiDLY CARE FAMILY**
- **Tipo**: Bracciale base
- **Certificazione**: NO (dispositivo consumer)
- **Funzioni**:
  - Pulsante SOS geolocalizzato
  - Rilevamento cadute automatico
  - GPS Localizzazione tempo reale
  - Comunicazione Vocale
  - App per familiari
  - Impermeabile IP67

---

### **2. SiDLY CARE PRO** ⭐ **PIÙ SCELTO**
- **Tipo**: Bracciale professionale
- **Certificazione**: **Dispositivo Medico Classe IIa**
- **Funzioni**:
  - **AI avanzata** (14.000 cadute analizzate)
  - **GPS multi-tech** indoor/outdoor
  - **Monitoraggio frequenza cardiaca**
  - Promemoria farmaci vocali
  - Geofencing avanzato
  - **+ Tutte le funzioni FAMILY**

---

### **3. SiDLY VITAL CARE PREMIUM** 🏆 **TOP DI GAMMA**
- **Tipo**: Bracciale premium con AI predittiva
- **Certificazione**: **Dispositivo Medico Classe IIa + AI predittiva**
- **Funzioni**:
  - **Saturazione ossigeno SpO2**
  - **Analisi completa del sonno**
  - **AI predittiva** prevenzione rischi
  - **Monitoraggio parametri vitali avanzato**
  - **Dashboard clinica professionale**
  - Alert intelligenti personalizzati
  - **Telemedicina integrata**
  - **+ Tutte le funzioni PRO**

---

## 💰 PREZZI E PIANI

### **FAMILY (SiDLY CARE FAMILY)**

| Piano | 1° Anno | Rinnovo (dopo 1° anno) | Risparmio |
|-------|---------|------------------------|-----------|
| **BASE** | **€390** | **€200** | -€190 (49%) |
| **AVANZATO** | **€690** | **€500** | -€190 (28%) |

**Servizi inclusi:**
- Protezione essenziale
- GPS + SOS
- App familiari
- Assistenza base

---

### **PRO (SiDLY CARE PRO)** ⭐ **PIÙ POPOLARE**

| Piano | 1° Anno | Rinnovo (dopo 1° anno) | Risparmio |
|-------|---------|------------------------|-----------|
| **BASE** | **€480** | **€240** | -€240 (50%) |
| **AVANZATO** | **€840** | **€600** | -€240 (29%) |

**Servizi inclusi:**
- Certificazione medica Classe IIa
- AI avanzata cadute
- GPS indoor/outdoor
- Monitoraggio cardiaco
- Promemoria farmaci
- Centrale Operativa H24

---

### **PREMIUM (SiDLY VITAL CARE PREMIUM)** 🏆

| Piano | 1° Anno | Rinnovo (dopo 1° anno) | Risparmio |
|-------|---------|------------------------|-----------|
| **BASE** | **€590** | **€300** | -€290 (49%) |
| **AVANZATO** | **€990** | **€750** | -€240 (24%) |

**Servizi inclusi:**
- Tutto il PRO +
- SpO2 (saturazione ossigeno)
- Analisi sonno completa
- AI predittiva
- Dashboard clinica
- Telemedicina integrata

---

## 🔄 RINNOVI - GESTIONE CONTRATTI

### **Tempistiche Contatto Clienti**
- **30 giorni prima** della scadenza del contratto
- Sistema deve inviare **alert automatico** per contattare assistito
- Proporre rinnovo con prezzo scontato

### **Esempi Rinnovo:**

**Esempio 1: Contratto PRO BASE**
- 1° Anno: €480 (sottoscritto 12/05/2025)
- Scadenza: 12/05/2026
- **Alert sistema**: 12/04/2026 (30 giorni prima)
- Rinnovo: €240/anno

**Esempio 2: Contratto PREMIUM AVANZATO**
- 1° Anno: €990 (sottoscritto 08/05/2025)
- Scadenza: 08/05/2026
- **Alert sistema**: 08/04/2026
- Rinnovo: €750/anno

---

## 📊 CONFRONTO COMPLETO

| Servizio | Dispositivo | Piano BASE | Piano AVANZATO |
|----------|------------|------------|----------------|
| **FAMILY** | SiDLY CARE FAMILY | €390 → €200 | €690 → €500 |
| **PRO** ⭐ | SiDLY CARE PRO | €480 → €240 | €840 → €600 |
| **PREMIUM** 🏆 | SiDLY VITAL CARE PREMIUM | €590 → €300 | €990 → €750 |

---

## 🎯 CARATTERISTICHE DISTINTIVE eCura

### **Vantaggi Competitivi**
1. ✅ **Dispositivo Medico Certificato** (Classe IIa - solo PRO e PREMIUM)
2. ✅ **Misurazioni Parametri Vitali Cliniche** (accuratezza clinica)
3. ✅ **Centrale Operativa H24** (professionisti sanitari)
4. ✅ **GPS Preciso Indoor** (multi-tecnologia)
5. ✅ **Detraibile Fiscalmente** (19% come spesa sanitaria)
6. ✅ **Assistenza Emergenze** (coordinamento 118)

### **Confronto con Competitor**
- **Altri bracciali**: NO certificazione medica, NO centrale H24, NO detraibilità fiscale
- **Badante tradizionale**: Costa 10-40x in più (€1,500-€2,500/mese)
- **Casa di riposo/RSA**: Costa 50-100x in più (€2,000-€4,000/mese)

---

## 🚨 ALERT RINNOVI - LOGICA SISTEMA

### **Sistema Automatico Rinnovi**

```javascript
// Calcolo data alert rinnovo (30 giorni prima scadenza)
function calcolaDataAlertRinnovo(dataInizioContratto) {
  const scadenza = new Date(dataInizioContratto)
  scadenza.setFullYear(scadenza.getFullYear() + 1) // +1 anno
  
  const alertDate = new Date(scadenza)
  alertDate.setDate(alertDate.getDate() - 30) // -30 giorni
  
  return {
    scadenza: scadenza.toISOString().split('T')[0],
    alertDate: alertDate.toISOString().split('T')[0]
  }
}

// Esempio
const contratto = {
  dataInizio: '2025-05-12',
  servizio: 'PRO',
  piano: 'BASE',
  prezzoAnno1: 480
}

const rinnovo = calcolaDataAlertRinnovo(contratto.dataInizio)
// rinnovo.scadenza = '2026-05-12'
// rinnovo.alertDate = '2026-04-12'

const prezzoRinnovo = getPrezzoRinnovo(contratto.servizio, contratto.piano)
// prezzoRinnovo = 240
```

### **Tabella Prezzi Rinnovo**

```javascript
const PREZZI_RINNOVI = {
  'FAMILY': {
    'BASE': 200,
    'AVANZATO': 500
  },
  'PRO': {
    'BASE': 240,
    'AVANZATO': 600
  },
  'PREMIUM': {
    'BASE': 300,
    'AVANZATO': 750
  }
}
```

---

## 📋 CORREZIONI SISTEMA TELEMEDCARE

### **1. Servizi Corretti**
- ❌ PRIMA: "eCura FAMILY", "eCura PRO", "eCura PREMIUM"
- ✅ ORA: **FAMILY**, **PRO** ⭐, **PREMIUM** 🏆

### **2. Dispositivi Corretti**
- ❌ PRIMA: "SiDLY CARE PRO" (generico)
- ✅ ORA:
  - **SiDLY CARE FAMILY** (per servizio FAMILY)
  - **SiDLY CARE PRO** (per servizio PRO) ⭐
  - **SiDLY VITAL CARE PREMIUM** (per servizio PREMIUM) 🏆

### **3. Prezzi Corretti**
| Servizio | Piano BASE | Piano AVANZATO |
|----------|-----------|----------------|
| FAMILY | €390 (rinn. €200) | €690 (rinn. €500) |
| **PRO** ⭐ | **€480 (rinn. €240)** | **€840 (rinn. €600)** |
| PREMIUM 🏆 | €590 (rinn. €300) | €990 (rinn. €750) |

### **4. Dashboard Corretta**
I 126 lead hanno il servizio **PRO** (non generico "eCura PRO")

---

## 🎯 TASK AGGIUNTIVI DA IMPLEMENTARE

### **NUOVO: Gestione Rinnovi**
1. ✅ Aggiungere campo `data_scadenza` alla tabella `contracts`
2. ✅ Aggiungere campo `prezzo_rinnovo` alla tabella `contracts`
3. ✅ Creare API endpoint `GET /api/contracts/expiring-soon` (contratti in scadenza entro 30 giorni)
4. ✅ Creare sezione dashboard "⚠️ Rinnovi in Scadenza"
5. ✅ Alert automatico 30 giorni prima scadenza
6. ✅ Email automatica al cliente con proposta rinnovo
7. ✅ Tracking stato rinnovo (da contattare, contattato, rinnovato, perso)

### **NUOVO: Tabella Prezzi Completa**
```sql
CREATE TABLE IF NOT EXISTS pricing (
  id TEXT PRIMARY KEY,
  servizio TEXT NOT NULL, -- FAMILY, PRO, PREMIUM
  piano TEXT NOT NULL, -- BASE, AVANZATO
  prezzo_anno1 REAL NOT NULL,
  prezzo_rinnovo REAL NOT NULL,
  dispositivo TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO pricing VALUES
  ('FAMILY-BASE', 'FAMILY', 'BASE', 390.00, 200.00, 'SiDLY CARE FAMILY'),
  ('FAMILY-AVZ', 'FAMILY', 'AVANZATO', 690.00, 500.00, 'SiDLY CARE FAMILY'),
  ('PRO-BASE', 'PRO', 'BASE', 480.00, 240.00, 'SiDLY CARE PRO'),
  ('PRO-AVZ', 'PRO', 'AVANZATO', 840.00, 600.00, 'SiDLY CARE PRO'),
  ('PREMIUM-BASE', 'PREMIUM', 'BASE', 590.00, 300.00, 'SiDLY VITAL CARE PREMIUM'),
  ('PREMIUM-AVZ', 'PREMIUM', 'AVANZATO', 990.00, 750.00, 'SiDLY VITAL CARE PREMIUM');
```

---

## ✅ CHECKLIST AGGIORNATA

### **Fase 1: Correzioni Dati e Prezzi** (PRIORITÀ ALTA)
- [ ] Aggiornare prezzi: FAMILY (€390/€690), PRO (€480/€840), PREMIUM (€590/€990)
- [ ] Aggiungere prezzi rinnovo nella tabella contracts
- [ ] Correggere nomi dispositivi (FAMILY, PRO, PREMIUM con nomi completi)
- [ ] Aggiungere campo `data_scadenza` ai contratti
- [ ] Calcolare data_scadenza = data_inizio + 1 anno

### **Fase 2: Sistema Rinnovi** (PRIORITÀ ALTA)
- [ ] API endpoint GET /api/contracts/expiring-soon (30 giorni)
- [ ] Dashboard widget "⚠️ Rinnovi in Scadenza"
- [ ] Email automatica 30 giorni prima
- [ ] Tracking stato rinnovo

### **Fase 3: Correzioni Dashboard** (PRIORITÀ MEDIA)
- [ ] Dashboard Operativa: 126 lead, 7 assistiti, distribuzione canali
- [ ] Dashboard Leads: CRUD completo
- [ ] Data Dashboard: CRUD contratti + PDF viewer
- [ ] Workflow Manager: Fix loop + azioni

---

**File**: `ECURA_SERVIZI_PREZZI_RINNOVI.md`  
**Fonte**: https://www.ecura.it  
**Data**: 26/12/2025
