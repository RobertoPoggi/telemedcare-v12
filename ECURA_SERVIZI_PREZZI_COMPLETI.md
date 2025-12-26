# 📋 eCURA - Servizi, Dispositivi, Piani e Prezzi

## 🎯 SERVIZI ECURA

### **1. eCura FAMILY** - Protezione essenziale
**Dispositivo**: Non specificato (standard)  
**Target**: Tutta la famiglia  
**Certificazione**: NO (non è dispositivo medico)

**Funzionalità:**
- ✅ Pulsante SOS geolocalizzato
- ✅ Rilevamento cadute automatico
- ✅ GPS Localizzazione tempo reale
- ✅ Comunicazione Vocale
- ✅ App per familiari
- ✅ Impermeabile IP67

**Prezzi FAMILY:**
- **Piano BASE**: €390/anno (1° anno) → **€200/anno** (rinnovo)
- **Piano AVANZATO**: €690/anno (1° anno) → **€500/anno** (rinnovo)

---

### **2. eCura PRO** 🏆 - Il più scelto
**Dispositivo**: SiDLY CARE PRO  
**Certificazione**: **Classe IIa** (Dispositivo Medico Certificato)  
**Target**: Anziani, persone con patologie

**Funzionalità PRO (include tutte le Family +):**
- ✅ **AI avanzata** (14.000 cadute analizzate)
- ✅ **GPS multi-tech** indoor/outdoor
- ✅ Monitoraggio **frequenza cardiaca**
- ✅ **Promemoria farmaci** vocali
- ✅ **Geofencing** avanzato
- ✅ Accuratezza **clinica** misurazioni

**Prezzi PRO:**
- **Piano BASE**: €480/anno (1° anno) → **€240/anno** (rinnovo)
- **Piano AVANZATO**: €840/anno (1° anno) → **€600/anno** (rinnovo)

---

### **3. eCura PREMIUM** 💎 - Top di gamma
**Dispositivo**: SiDLY VITAL CARE  
**Certificazione**: **Classe IIa + AI predittiva**  
**Target**: Anziani con patologie complesse, telemedicina

**Funzionalità PREMIUM (include tutte le PRO +):**
- ✅ **Saturazione ossigeno** SpO2
- ✅ **Analisi completa del sonno**
- ✅ **AI predittiva** prevenzione rischi
- ✅ Monitoraggio **parametri vitali avanzato**
- ✅ **Dashboard clinica** professionale
- ✅ **Alert intelligenti** personalizzati
- ✅ **Telemedicina integrata**

**Prezzi PREMIUM:**
- **Piano BASE**: €590/anno (1° anno) → **€300/anno** (rinnovo)
- **Piano AVANZATO**: €990/anno (1° anno) → **€750/anno** (rinnovo)

---

## 📊 TABELLA PREZZI COMPLETA

| Servizio | Piano | 1° Anno | Rinnovo | Risparmio | Differenza |
|----------|-------|---------|---------|-----------|------------|
| **FAMILY** | BASE | €390 | €200 | €190 | 48.7% |
| **FAMILY** | AVANZATO | €690 | €500 | €190 | 27.5% |
| **PRO** 🏆 | BASE | €480 | €240 | €240 | 50.0% |
| **PRO** 🏆 | AVANZATO | €840 | €600 | €240 | 28.6% |
| **PREMIUM** 💎 | BASE | €590 | €300 | €290 | 49.2% |
| **PREMIUM** 💎 | AVANZATO | €990 | €750 | €240 | 24.2% |

---

## 🔄 LOGICA RINNOVI

### **Quando contattare per rinnovo:**
**30 giorni prima della scadenza** del contratto annuale

### **Esempio Timeline:**
- **Contratto firmato**: 15 Maggio 2025
- **Scadenza 1° anno**: 14 Maggio 2026
- **Data contatto rinnovo**: 15 Aprile 2026 (30 giorni prima)
- **Prezzo rinnovo**: Prezzo ridotto (vedi tabella sopra)

### **Sistema Alert Rinnovi:**
```javascript
// Calcolo 30 giorni prima scadenza
const dataScadenza = new Date(contratto.data_firma)
dataScadenza.setFullYear(dataScadenza.getFullYear() + 1) // +1 anno

const dataAlertRinnovo = new Date(dataScadenza)
dataAlertRinnovo.setDate(dataAlertRinnovo.getDate() - 30) // -30 giorni

if (oggi >= dataAlertRinnovo && oggi < dataScadenza) {
  // Mostra alert "RINNOVO IN SCADENZA"
  // Proponi prezzo rinnovo ridotto
}
```

---

## 🎯 DISPOSITIVI

### **1. Bracciale Standard** (FAMILY)
- Certificazione: NO
- GPS: Standard
- Parametri vitali: NO
- Detraibile: NO

### **2. SiDLY CARE PRO** (PRO) 🏆
- Certificazione: **Classe IIa**
- GPS: Multi-tech (indoor + outdoor)
- Parametri vitali: Frequenza cardiaca
- Detraibile: **SÌ** (19% come spesa sanitaria)
- AI: 14.000 cadute analizzate

### **3. SiDLY VITAL CARE** (PREMIUM) 💎
- Certificazione: **Classe IIa + AI predittiva**
- GPS: Multi-tech avanzato
- Parametri vitali: **Completi** (SpO2, sonno, FC, PA)
- Detraibile: **SÌ** (19% come spesa sanitaria)
- AI: Predittiva + Alert intelligenti
- Telemedicina: Integrata

---

## 💰 CONFRONTO COSTI

### **eCura vs Alternative:**
- **Badante tradizionale**: €1,200-2,000/mese = €14,400-24,000/anno
- **Casa di riposo**: €1,500-3,000/mese = €18,000-36,000/anno
- **RSA**: €2,000-4,000/mese = €24,000-48,000/anno
- **eCura PRO BASE**: €480/anno (1° anno), poi €240/anno

**eCura costa 10-40 volte in meno!**

---

## 🏢 CENTRALE OPERATIVA H24

### **Servizio Incluso:**
- ✅ Professionisti sanitari H24/7
- ✅ Coordinamento con 118
- ✅ Notifica automatica familiari
- ✅ Gestione emergenze
- ✅ Tempistica risposta: **3-5 secondi**

### **Flusso Emergenza:**
1. Caduta rilevata automaticamente (AI)
2. Allarme inviato in 3-5 secondi
3. Centrale operativa contatta assistito
4. Se non risponde → Chiama 118
5. Notifica familiari via app
6. Invio coordinate GPS precise

---

## 📱 APP FAMILIARI

### **Funzionalità App:**
- 📍 Localizzazione tempo reale
- 📊 Dashboard parametri vitali
- 🔔 Notifiche emergenze
- 📅 Storico eventi
- 🗺️ Geofencing (zone sicure)
- 💊 Promemoria farmaci

---

## ✅ DETRAIBILITÀ FISCALE

### **Solo per dispositivi certificati (PRO e PREMIUM):**
- Detraibile al **19%** come spesa sanitaria
- Valido per: PRO e PREMIUM (Classe IIa)
- NON valido per: FAMILY (non certificato)

### **Esempio detrazione PRO BASE:**
- Costo 1° anno: €480
- Detrazione 19%: €91.20
- **Costo effettivo**: €388.80

---

## 🎯 DATI CORRETTI TELEMEDCARE V12

### **Contratti Esistenti (8 totali):**
Basandoci sui PDF caricati, tutti i contratti sono per:
- **Servizio**: eCura PRO (SiDLY CARE PRO)
- **Piano BASE**: 7 contratti × €480 = €3,360
- **Piano AVANZATO**: 1 contratto × €840 = €840
- **TOTALE 1° anno**: €4,200
- **TOTALE rinnovo**: (7 × €240) + (1 × €600) = €1,680 + €600 = **€2,280/anno**

### **Revenue Corretta:**
- **Anno 1**: €4,200 (8 contratti nuovi)
- **Anno 2**: €2,280 (8 rinnovi)
- **Risparmio clienti anno 2**: €1,920 (45.7%)

---

## 📋 DASHBOARD CORRECTIONS

### **1. Servizio (CORRETTA):**
- ✅ Tutti i 126 lead: **eCura PRO** (non FAMILY, non PREMIUM)
- ✅ Dispositivo: **SiDLY CARE PRO**

### **2. Piano:**
- ✅ 125 lead: **BASE** (€480/anno)
- ✅ 1 lead: **AVANZATO** (€840/anno)
- *(da verificare con i nuovi 8 contratti)*

### **3. Prezzi (CORRETTI):**
- ✅ BASE: €480 (1° anno) → €240 (rinnovo)
- ✅ AVANZATO: €840 (1° anno) → €600 (rinnovo)

### **4. Revenue (CORRETTA con 8 contratti):**
- Se 7 BASE + 1 AVANZATO:
  - 1° anno: (7 × €480) + (1 × €840) = €3,360 + €840 = **€4,200**
  - Rinnovo: (7 × €240) + (1 × €600) = €1,680 + €600 = **€2,280**

---

## 🔄 FEATURE DA IMPLEMENTARE: GESTIONE RINNOVI

### **Database Schema:**
```sql
ALTER TABLE contracts ADD COLUMN data_scadenza DATE;
ALTER TABLE contracts ADD COLUMN alert_rinnovo_inviato BOOLEAN DEFAULT FALSE;
ALTER TABLE contracts ADD COLUMN prezzo_rinnovo DECIMAL(10,2);
```

### **Alert Rinnovi Dashboard:**
```javascript
// Contratti in scadenza (prossimi 30 giorni)
const contrattiDaRinnovare = contracts.filter(c => {
  const scadenza = new Date(c.data_scadenza)
  const oggi = new Date()
  const diff = (scadenza - oggi) / (1000 * 60 * 60 * 24)
  return diff <= 30 && diff >= 0 && !c.alert_rinnovo_inviato
})

// KPI: "Rinnovi in Scadenza"
<div class="kpi-card warning">
  <h4>Rinnovi in Scadenza</h4>
  <p class="kpi-value">{contrattiDaRinnovare.length}</p>
  <p class="kpi-label">Prossimi 30 giorni</p>
</div>
```

### **Email Template Rinnovo:**
```
Oggetto: Rinnovo eCura PRO - Offerta Speciale per Te

Gentile [Nome Cliente],

Il tuo servizio eCura PRO scade tra 30 giorni ([Data Scadenza]).

🎁 OFFERTA RINNOVO SPECIALE:
- Piano BASE: €240/anno (invece di €480)
- Piano AVANZATO: €600/anno (invece di €840)

✅ Rinnova ora e continua a proteggere i tuoi cari!

[Pulsante: Rinnova Ora]
```

---

## 📊 RIEPILOGO CORREZIONI DASHBOARD

### **Valori da Aggiornare:**
| Dashboard | Campo | Vecchio | Nuovo | Nota |
|-----------|-------|---------|-------|------|
| Operativa | Servizio | "eCura PRO" | "eCura PRO" | ✅ OK |
| Operativa | Dispositivo | "SiDLY CARE PRO" | "SiDLY CARE PRO" | ✅ OK |
| Operativa | Contratti | 4 | 8 | ⚠️ Da aggiornare |
| Leads | Prezzo BASE | €480 | €480 (1° anno) | ✅ OK |
| Leads | Prezzo AVANZATO | €840 | €840 (1° anno) | ✅ OK |
| Data | Revenue | €1,920 | €4,200 | ⚠️ Da aggiornare |
| Data | Rinnovo | N/A | €2,280 | 🆕 Da aggiungere |

---

**Fonte**: https://www.ecura.it  
**Data**: 26 Dicembre 2025  
**File**: ECURA_SERVIZI_PREZZI_COMPLETI.md
