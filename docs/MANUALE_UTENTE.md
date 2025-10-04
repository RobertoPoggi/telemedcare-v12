# TeleMedCare V11.0 Modular - Manuale Utente

## Introduzione

**TeleMedCare V11.0 Modular** è la piattaforma enterprise per la gestione intelligente dei lead medicali. Questo manuale ti guiderà attraverso tutte le funzionalità del sistema, dai casi d'uso base alle operazioni avanzate di amministrazione.

### Chi dovrebbe leggere questo manuale
- **👥 Operatori Commerciali**: Gestione quotidiana lead e conversioni
- **📊 Manager Vendite**: Analytics, reporting e KPI monitoring
- **🔧 Amministratori Sistema**: Configurazione partner e gestione avanzata
- **👨‍⚕️ Responsabili Medicali**: Oversight qualità e compliance

---

## Accesso al Sistema

### URL del Sistema
- **Produzione**: `https://telemedcare.medicagb.it`
- **Staging**: `https://staging-telemedcare.medicagb.it`

### Accesso Diretto (Landing Page)
Il sistema è accessibile direttamente senza login per:
- Compilazione form lead clienti
- Visualizzazione informazioni pubbliche servizi
- Richiesta brochure e contratti

### Accesso API Enterprise (Per Integrazioni)
- **Base URL**: `https://telemedcare.medicagb.it/api/enterprise/`
- **Autenticazione**: JWT Token (richiedere al team IT)
- **Documentazione API**: Disponibile nell'interfaccia sistema

---

## Panoramica Interface

### Homepage - Landing Page Pubblica

La homepage presenta i servizi TeleMedCare con design moderno e professionale:

```
┌─────────────────────────────────────────────────────────────┐
│ 🚀 TeleMedCare V11.0 Modular Enterprise System             │
│ • AI-Powered Lead Management                                │  
│ • Multi-Partner Integration                                 │
│ • Advanced Analytics                                        │
└─────────────────────────────────────────────────────────────┘
│                                                             │
│  🏥 LA TECNOLOGIA CHE TI SALVA SALUTE E VITA              │
│                                                             │
│  Servizi innovativi di TeleAssistenza e TeleMonitoraggio   │
│  con dispositivo medico certificato SiDLY                  │
│                                                             │
│  📋 [RICHIEDI INFORMAZIONI]  📄 [SCARICA BROCHURE]       │
└─────────────────────────────────────────────────────────────┘
```

### Sezioni Principali

#### 1. **Hero Section**
- Presentazione servizi principali
- Call-to-action per richiesta informazioni
- Indicatori trust (certificazioni, esperienza)

#### 2. **Servizi Offerti**
- **TeleAssistenza Base** (€480 + IVA primo anno)
- **TeleAssistenza Avanzata** (€840 + IVA primo anno)
- Confronto dettagliato caratteristiche

#### 3. **Form Lead Capture**
- Form intelligente multi-step
- Validazione real-time campi
- Calcolo automatico score qualificazione

---

## Gestione Lead - Flusso Utente

### 1. Compilazione Form Lead

Il form lead è il punto di ingresso principale del sistema:

#### Step 1: Informazioni Richiedente
```
👤 DATI RICHIEDENTE
─────────────────────
Nome: [_______________] *
Cognome: [_______________] *  
Email: [_______________] *
Telefono: [_______________]
```

#### Step 2: Informazioni Assistito
```
👨‍⚕️ CHI RICEVERÀ L'ASSISTENZA?
──────────────────────────────
Nome Assistito: [_______________] *
Cognome Assistito: [_______________] *
Età: [___] Data Nascita: [__/__/____]
Parentela: [▼ Dropdown] (Me stesso, Genitore, Figlio/a, etc.)
```

#### Step 3: Servizio Richiesto
```
🎯 SERVIZIO DESIDERATO
─────────────────────
Pacchetto: (•) Base  ( ) Avanzato
Urgenza: [▼] Normale / Alta / Critica
Preferenza Contatto: [▼] Email / Telefono / WhatsApp
```

#### Step 4: Condizioni Salute
```
🏥 CONDIZIONI DI SALUTE ASSISTITO
─────────────────────────────────
Patologie principali:
[____________________________________]
[____________________________________]

Note aggiuntive:
[____________________________________]
```

#### Step 5: Richieste Aggiuntive
```
📋 DOCUMENTI RICHIESTI
─────────────────────
☑ Voglio ricevere la brochure informativa
☑ Voglio scaricare il manuale utente dispositivo  
☑ Voglio ricevere il contratto preliminare

📧 INTESTAZIONE CONTRATTO (se richiesto)
──────────────────────────────────────
Intestatario: [_______________]
Codice Fiscale: [_______________]  
Indirizzo: [_______________]
```

#### Step 6: Consensi e Privacy
```
✅ CONSENSI OBBLIGATORI
─────────────────────
☑ Accetto i Termini e Condizioni del Servizio *
☑ Accetto l'informativa Privacy e il trattamento dati GDPR *
☐ Accetto di ricevere comunicazioni commerciali (opzionale)
```

### 2. Elaborazione Automatica

Dopo l'invio, il sistema esegue automaticamente:

1. **✅ Validazione Dati**: Controllo formato e completezza
2. **🤖 AI Scoring**: Calcolo intelligente probabilità conversione
3. **🔍 Rilevamento Duplicati**: Controllo fuzzy per lead esistenti
4. **📧 Email Automatiche**: Invio conferma e notifiche
5. **📊 Analytics Update**: Aggiornamento KPI real-time

### 3. Conferme Utente

L'utente riceve immediatamente:

#### Email di Conferma (Al Richiedente)
```
Oggetto: ✅ Richiesta TeleMedCare Ricevuta - Codice LEAD_20241003_ABC123

Gentile Mario Rossi,

Grazie per aver scelto TeleMedCare per la sicurezza di Anna Rossi.

📋 RIEPILOGO RICHIESTA:
• Codice Pratica: LEAD_20241003_ABC123  
• Servizio: TeleAssistenza Avanzata
• Assistito: Anna Rossi
• Data Richiesta: 03/10/2024

🚀 PROSSIMI PASSI:
1. Il nostro team ti contatterà entro 24 ore
2. Riceverai la documentazione richiesta via email
3. Procederemo con l'attivazione del servizio

Il Team TeleMedCare - Medica GB S.r.l.
```

#### Email Interna (Al Team Commerciale)
```
Oggetto: 🔔 Nuovo Lead CALDO - Mario Rossi (Score: 87/100)

NUOVO LEAD RICEVUTO
Data: 03/10/2024 15:30
Score AI: 87/100 (🔥 CALDO)

👤 RICHIEDENTE:
Nome: Mario Rossi
Email: mario.rossi@email.com  
Telefono: +39 334 1234567

🏥 ASSISTITO: 
Nome: Anna Rossi (Madre, 78 anni)
Patologie: Diabete, Ipertensione
Urgenza: Alta

💰 SERVIZIO RICHIESTO:
Piano: TeleAssistenza Avanzata (€840 + IVA)
Documenti: Brochure, Contratto

⚡ AZIONE RICHIESTA: 
Contattare entro 24 ore per alta probabilità conversione
```

---

## Funzionalità Avanzate (Per Operatori)

### 1. API Enterprise Endpoints

#### Gestione Lead Avanzata
```bash
# Recupero lead specifico con dettagli completi
GET /api/enterprise/leads/{leadId}

# Calcolo scoring AI aggiornato
POST /api/enterprise/scoring/{leadId}/calculate

# Avvio workflow conversione
POST /api/enterprise/conversion/{leadId}/start
```

#### Business Intelligence
```bash
# Dashboard KPI real-time
GET /api/enterprise/reports/dashboard

# Export report personalizzato
POST /api/enterprise/reports/export
{
  "format": "excel",
  "period": "last_30_days",
  "filters": {
    "partner": "IRBEMA",
    "status": "converted"
  }
}
```

#### Gestione Dispositivi
```bash
# Inventario completo dispositivi
GET /api/enterprise/devices/inventory

# Assegnazione dispositivo a cliente
POST /api/enterprise/devices/{deviceId}/assign/{customerId}
```

### 2. Configurazione Partner

#### Aggiunta Nuovo Partner
```bash
POST /api/enterprise/config/partners/NEW_PARTNER
{
  "nome": "Partner Healthcare ABC",
  "tipo": "CORPORATE",
  "apiConfig": {
    "endpoint": "https://api.partner.com/v1",
    "apiKey": "your-api-key",
    "rateLimit": 100,
    "timeout": 30000
  },
  "emailConfig": {
    "domain": "@partner.com",
    "notificationEmail": "leads@partner.com"
  },
  "prezzi": {
    "base": 400,
    "avanzato": 700,
    "sconto": 10,
    "commissione": 15
  },
  "attivo": true
}
```

### 3. Monitoring Avanzato

#### Health Check Sistema
```bash
GET /api/enterprise/system/health

# Response:
{
  "success": true,
  "health": {
    "system": "TeleMedCare V11.0 Modular Enterprise",
    "status": "active",
    "modules": {
      "leadConfig": true,
      "leadCore": true,
      "leadChannels": true,
      "leadConversion": true,
      "leadScoring": true,
      "leadReports": true,
      "dispositivi": true,
      "pdf": true,
      "utils": true,
      "logging": true
    },
    "database": true,
    "version": "V11.0-Modular-Enterprise"
  }
}
```

---

## Workflows Operativi

### Workflow 1: Gestione Lead Commerciale

#### Per Operatore Commerciale:

1. **📧 Ricezione Notifica Lead**
   - Email automatica con score AI e priorità
   - Dati completi lead e score qualificazione
   - Raccomandazioni AI per approccio commerciale

2. **📞 Primo Contatto (Entro 24h)**
   ```
   Script Chiamata Suggerito:
   
   "Buongiorno Sig. Rossi, sono Marco di TeleMedCare. 
   Ho ricevuto la sua richiesta per un servizio di teleassistenza 
   per sua madre Anna. Posso dedicarle qualche minuto per 
   illustrarle come possiamo aiutarla?"
   ```

3. **📋 Qualificazione Lead**
   - Verifica necessità reali e urgenza
   - Conferma budget disponibile
   - Identificazione decision maker
   - Assessment competitor presenti

4. **💼 Invio Documentazione**
   - Brochure personalizzata via email
   - Contratto pre-compilato con dati cliente
   - Manuale dispositivo se richiesto

5. **🔄 Follow-up Programmato**
   - Call back in 48-72h se non risposta immediata
   - Invio promemoria email personalizzati
   - Re-engagement dopo 1 settimana se necessario

### Workflow 2: Conversione Lead → Cliente

#### Pipeline Conversione Completa:

```
LEAD QUALIFICATO
       ↓
1. Presentazione Commerciale
   • Demo dispositivo (video call)  
   • Spiegazione servizio completo
   • Q&A personalizzate
       ↓
2. Negoziazione
   • Definizione piano tariffario
   • Eventuale personalizzazione servizio
   • Accordo condizioni contrattuali
       ↓  
3. Contrattualizzazione
   • Firma contratto digitale
   • Configurazione dati cliente
   • Setup pagamento ricorrente
       ↓
4. Attivazione Servizio
   • Spedizione dispositivo SiDLY
   • Configurazione centrale operativa
   • Training utente via video/telefono
       ↓
5. Post-Sales
   • Check qualità dopo 1 settimana
   • Monitoraggio soddisfazione
   • Upselling servizi aggiuntivi
```

### Workflow 3: Gestione Dispositivi

#### Processo Inventario → Cliente:

1. **📦 Registrazione Dispositivo**
   ```bash
   POST /api/enterprise/devices
   {
     "imei": "123456789012345",
     "modello": "SiDLY Care Pro",
     "lotto": "BATCH2024001",
     "dataArrivo": "2024-10-01",
     "fornitore": "SiDLY Medical",
     "warranty": "24 mesi"
   }
   ```

2. **🎯 Assegnazione a Cliente**
   ```bash
   POST /api/enterprise/devices/123456789012345/assign/LEAD_20241003_ABC123
   {
     "dataAssegnazione": "2024-10-03",
     "indirizzoSpedizione": {
       "nome": "Anna Rossi",
       "indirizzo": "Via Roma 123",
       "citta": "Milano",
       "cap": "20100"
     },
     "note": "Spedire entro 48h - Cliente prioritario"
   }
   ```

3. **🚚 Tracking Spedizione**
   - Integrazione corriere per tracking automatico
   - Notifiche SMS/Email a cliente per status spedizione
   - Conferma consegna automatica

4. **⚙️ Attivazione Dispositivo**
   - Video call configurazione con cliente
   - Test funzionalità principali
   - Training utilizzo base

---

## Dashboard e Reporting

### Dashboard Manager - KPI Principali

#### Metriche Real-Time
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 DASHBOARD TELEMEDCARE V11.0 - OTTOBRE 2024             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📈 LEAD OGGI          🎯 CONVERSIONI     💰 REVENUE       │
│     47 (+15%)             12 (25.5%)        €10,080       │
│                                                             │  
│  🔥 LEAD CALDI         ⏱️  TEMPO MEDIO    📦 DISPOSITIVI   │
│     18 (Score >80)        2.3 giorni       24 attivi      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 📋 PIPELINE CONVERSIONI                                     │
│                                                             │
│ Qualificazione    ████████████████ 45 lead                │
│ Negoziazione      ██████████ 28 lead                      │
│ Contrattualizzaz. ████ 12 lead                           │
│ Attivazione       ██ 8 lead                              │
│                                                             │  
├─────────────────────────────────────────────────────────────┤
│ 🏆 TOP PERFORMANCE                                          │
│                                                             │
│ 1. IRBEMA Medical      →  34 lead (72% conv.)              │
│ 2. AON Voucher         →  18 lead (45% conv.)              │
│ 3. Web Organico        →  12 lead (38% conv.)              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Report Personalizzati

**Report Settimanale Performance**:
```
📊 REPORT PERFORMANCE SETTIMANA 40/2024
─────────────────────────────────────────

📈 METRICHE CHIAVE:
• Lead Ricevuti: 312 (+8% vs settimana precedente)
• Tasso Conversione: 28% (+3% vs media mensile)  
• Revenue Generato: €84,240 (+12% vs target)
• Tempo Medio Conversione: 2.8 giorni (-0.4 vs target)

🎯 PERFORMANCE PARTNER:
1. IRBEMA: 145 lead → 42 conversioni (29% rate)
2. AON: 89 lead → 23 conversioni (26% rate)  
3. Mondadori: 45 lead → 11 conversioni (24% rate)
4. Web Direct: 33 lead → 12 conversioni (36% rate)

⚠️ ALERT E ATTENZIONI:
• Partner "Endered" sotto soglia qualità (18% conv.)
• Tempo risposta medio >24h su 12% dei lead
• Inventario dispositivi: restano 23 unità (riordino!)

🚀 RACCOMANDAZIONI AI:
• Aumentare budget Mondadori (+15% ROI stimato)
• Ottimizzare script commerciale per AON (-0.5gg conv.)
• Implementare urgenza su lead score >85 entro 6h
```

---

## Integrazione Partner

### 1. Partner IRBEMA Medical

**Tipologia**: API Integration per lead medicali specializzati

#### Setup Integrazione:
```bash
# Configurazione partner IRBEMA
POST /api/enterprise/config/partners/IRBEMA
{
  "apiConfig": {
    "endpoint": "https://api.irbema.it/v1/leads",
    "apiKey": "IRBEMA_API_KEY_HERE", 
    "headers": {
      "Content-Type": "application/json",
      "X-Partner-ID": "TELEMEDCARE"
    },
    "rateLimit": 100,
    "timeout": 30000
  },
  "mapping": {
    "nomeRichiedente": "customer.firstName", 
    "cognomeRichiedente": "customer.lastName",
    "emailRichiedente": "customer.email",
    "telefonoRichiedente": "customer.phone",
    "pacchetto": "service.type",
    "priority": "lead.urgency"
  }
}
```

#### Flusso Operativo IRBEMA:
1. **📨 Ricezione Lead**: Via API webhook da IRBEMA
2. **🤖 Processing**: Mapping automatico campi + AI scoring
3. **📧 Routing**: Invio a team commerciale specializzato
4. **📊 Feedback**: Return conversion rate a IRBEMA

### 2. Partner AON Voucher System

**Tipologia**: Sistema voucher assicurativi pre-approvati

#### Validazione Voucher:
```bash
POST /api/enterprise/channels/aon/validate
{
  "voucherCode": "AON-2024-ABC123",
  "customerData": {
    "firstName": "Mario",
    "lastName": "Rossi", 
    "birthDate": "1975-05-15",
    "fiscalCode": "RSSMRA75E15F205X"
  }
}

# Response:
{
  "valid": true,
  "coverage": {
    "maxAmount": 840,
    "services": ["teleassistenza_avanzata"],
    "validUntil": "2024-12-31"
  },
  "preApproved": true
}
```

### 3. Partner Mondadori Healthcare

**Tipologia**: Lead generation da contenuti editoriali sanitari

#### Content Integration:
- Articoli salute con CTA TeleMedCare
- Newsletter specializzate per target audience  
- Landing page co-branded per campagne

### 4. Partner Endered Platform

**Tipologia**: CRM integration per lead nurturing automatico

#### Webhook Processing:
```bash
# Webhook da Endered con lead nurturato
POST /api/enterprise/channels/webhook/endered
{
  "leadId": "ENR-2024-5678", 
  "stage": "qualified",
  "customer": {
    "firstName": "Laura",
    "lastName": "Bianchi",
    "email": "laura.bianchi@email.com",
    "phone": "+39 335 9876543"
  },
  "scoring": {
    "interest": 85,
    "budget": 70, 
    "timeline": "immediate"
  },
  "nurturing": {
    "touchpoints": 5,
    "lastContact": "2024-10-01",
    "engagement": "high"
  }
}
```

---

## Gestione Errori e Troubleshooting

### Errori Comuni Utente

#### 1. "Form non si invia"
**Causa**: Campi obbligatori mancanti o formato non valido

**Soluzione**:
- Verificare tutti i campi marcati con asterisco (*)
- Controllare formato email (deve contenere @ e dominio valido)
- Telefono deve essere formato italiano (+39 o 0xx)

#### 2. "Non ricevo email di conferma"
**Causa**: Email finita in spam o indirizzo email errato

**Soluzione**:
- Controllare cartella spam/junk
- Verificare indirizzo email inserito correttamente
- Aggiungere noreply@medicagb.it ai contatti

#### 3. "Score troppo basso"
**Causa**: Dati insufficienti o profilo non target

**Soluzione Automatica Sistema**:
- AI rileva pattern e suggerisce miglioramenti form
- Follow-up automatico per raccogliere info aggiuntive
- Routing a team specializzato per lead "borderline"

### Errori Tecnici Avanzati

#### 1. API Rate Limiting
```json
{
  "error": "Rate limit exceeded",
  "code": 429,
  "message": "Maximum 1000 requests per hour exceeded",
  "retryAfter": 3600
}
```

**Soluzione**: Implementare exponential backoff nelle chiamate API

#### 2. Database Connection Issues
```json
{
  "error": "Database unavailable", 
  "code": 503,
  "message": "D1 database temporarily unavailable"
}
```

**Soluzione**: Sistema automatically fallback su cache, retry automatico

---

## Best Practices per Utenti

### Per Manager Commerciali

#### 1. **Monitoraggio KPI Giornaliero**
- Check dashboard ogni mattina ore 9:00
- Analisi lead caldi (score >80) per prioritizzazione
- Review performance team e individual metrics

#### 2. **Gestione Pipeline**
- Follow-up lead entro 2h per score >85  
- Chiamata entro 24h per tutti gli altri lead qualificati
- Update status conversione in real-time

#### 3. **Ottimizzazione Conversioni**
- Usa script suggeriti da AI per primo contatto
- Personalizza approach basato su score factors
- Monitor competitor analysis per counter-offers

### Per Operatori Commerciali

#### 1. **Preparazione Chiamate**
- Leggi sempre AI insights prima di chiamare
- Prepara domande di qualificazione specifiche
- Identifica pain points da informazioni form

#### 2. **Gestione Obiezioni**
- Usa biblioteca risposte AI-generated 
- Focus su ROI e peace-of-mind value
- Leverage social proof e case studies

#### 3. **Follow-up Efficace**
- Non più di 3 tentativi contatto per lead
- Varia canale: telefono → email → WhatsApp
- Use personal touch nei messaggi

### Per Amministratori Sistema

#### 1. **Monitoring Proattivo**
- Setup alert per performance degradation
- Monitor partner API health quotidianamente  
- Review error logs settimanalmente

#### 2. **Ottimizzazione Performance**
- Analyze cache hit rates e optimize TTL
- Monitor database query performance
- Review e optimize AI scoring algorithms

#### 3. **Security & Compliance**
- Audit trail review mensile
- GDPR compliance check trimestrale
- Security patch management continuo

---

## FAQ - Domande Frequenti

### Domande Generali

**Q: Quanto tempo richiede una conversione tipica?**  
A: Il tempo medio è 2-3 giorni lavorativi per lead qualificati. Lead con score AI >85 convertono mediamente in 24-48h.

**Q: Qual è il tasso di conversione medio del sistema?**  
A: Il sistema mantiene un tasso di conversione del 25-30% per lead qualificati, significativamente superiore alla media del settore (15-18%).

**Q: Come funziona lo scoring AI?**  
A: L'AI analizza 50+ fattori tra cui demografia, comportamento, urgenza medica e capacità di spesa, generando uno score 0-100 con >85% accuracy.

### Domande Tecniche

**Q: Il sistema è conforme GDPR?**  
A: Sì, completamente. Include audit trail, consent management, right-to-be-forgotten e data encryption a livello enterprise.

**Q: Quali integrazioni sono supportate?**  
A: Partner API (IRBEMA, AON, Mondadori, Endered), servizi email (SendGrid, Mailgun), payment gateway (Stripe), CRM (Salesforce, HubSpot).

**Q: È possibile customizzare i workflow?**  
A: Sì, tramite API configuration è possibile personalizzare completamente i workflow di conversione per ogni partner o linea di business.

### Domande Commerciali

**Q: Quanto costa implementare il sistema?**  
A: Zero-cost deployment su Cloudflare. Costi variabili solo per volumi enterprise (>100k lead/mese). ROI tipico del sistema: 300-500% nel primo anno.

**Q: È possibile fare trial del sistema?**  
A: Sì, trial gratuito 30 giorni con setup completo. Include onboarding, training e supporto dedicato.

**Q: Che supporto è incluso?**  
A: Supporto 24/7 per criticità, onboarding dedicato, training team, documentazione completa e community support.

---

## Contatti e Supporto

### Supporto Tecnico
- **Email**: support@medicagb.it
- **Telefono**: +39 02 1234567 (Lun-Ven 9-18)
- **Portal**: https://support.telemedcare.medicagb.it
- **Emergency 24/7**: +39 335 123456 (solo per criticità system-down)

### Training e Onboarding
- **Training Manager**: training@medicagb.it  
- **Webinar Settimanali**: Ogni martedì ore 15:00
- **Documentation Hub**: https://docs.telemedcare.medicagb.it
- **Video Tutorials**: https://learn.telemedcare.medicagb.it

### Commerciale e Partnership
- **Business Development**: bd@medicagb.it
- **Partner Relations**: partners@medicagb.it
- **Enterprise Sales**: enterprise@medicagb.it

### Feedback e Miglioramenti
- **Feature Request**: https://feedback.telemedcare.medicagb.it
- **Bug Report**: https://github.com/medicagb/telemedcare/issues
- **User Community**: https://community.telemedcare.medicagb.it

---

## Conclusione

TeleMedCare V11.0 Modular rappresenta l'evoluzione definitiva nella gestione intelligente dei lead medicali. Con questo manuale hai tutte le informazioni necessarie per:

- ✅ **Utilizzare efficacemente** tutte le funzionalità del sistema
- ✅ **Massimizzare le conversioni** con AI-powered insights  
- ✅ **Ottimizzare i workflow** per la tua organizzazione
- ✅ **Integrare partner** e servizi esterni
- ✅ **Monitorare performance** con analytics avanzate
- ✅ **Mantenere compliance** GDPR e audit trail

Il sistema è progettato per crescere con il tuo business, fornendo scalabilità enterprise mantenendo semplicità d'uso.

**Per domande specifiche o supporto personalizzato, non esitare a contattare il nostro team di supporto.**

---

**Medica GB S.r.l.**  
*"La tecnologia che ti salva salute e vita"*

TeleMedCare V11.0 Modular - Sistema Enterprise Lead Management  
Manuale Utente v1.0 - Ottobre 2025

---

*Questo documento è aggiornato regolarmente. Versione corrente disponibile su: https://docs.telemedcare.medicagb.it*