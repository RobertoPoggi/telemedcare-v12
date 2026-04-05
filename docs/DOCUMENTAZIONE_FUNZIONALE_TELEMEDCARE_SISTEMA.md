# TeleMedCare V12.0
## Documentazione Funzionale del Sistema
### Piattaforma Integrata di Gestione Lead e Workflow Automatizzati

**Data:** 24 Febbraio 2026  
**Versione Sistema:** V12.0  
**Tipo Documento:** Documentazione Funzionale  

---

## INDICE

1. [Introduzione e Scopo del Sistema](#1-introduzione-e-scopo-del-sistema)
2. [Architettura Funzionale](#2-architettura-funzionale)
3. [Modulo Acquisizione Lead](#3-modulo-acquisizione-lead)
4. [Dashboard CRM Operativa](#4-dashboard-crm-operativa)
5. [Sistema di Gestione Contratti](#5-sistema-di-gestione-contratti)
6. [Sistema Pro-Forma e Pagamenti](#6-sistema-pro-forma-e-pagamenti)
7. [Sistema Configurazione Dispositivi](#7-sistema-configurazione-dispositivi)
8. [Workflow Email Automatizzato](#8-workflow-email-automatizzato)
9. [Stati e Transizioni dei Lead](#9-stati-e-transizioni-dei-lead)
10. [Funzionalità Avanzate della Dashboard](#10-funzionalità-avanzate-della-dashboard)
11. [Sistema di Notifiche e Alert](#11-sistema-di-notifiche-e-alert)
12. [Reportistica e Analytics](#12-reportistica-e-analytics)
13. [Gestione Utenti e Permessi](#13-gestione-utenti-e-permessi)
14. [Integrazioni e API](#14-integrazioni-e-api)
15. [Configurazione e Impostazioni](#15-configurazione-e-impostazioni)

---

## 1. INTRODUZIONE E SCOPO DEL SISTEMA

### 1.1 Overview del Sistema

TeleMedCare V12.0 è una piattaforma web-based completa per la gestione del ciclo di vita dei clienti nel settore della teleassistenza domiciliare. Il sistema automatizza l'intero processo dalla prima interazione con il potenziale cliente (lead) fino all'attivazione del servizio, passando per generazione contratti, gestione pagamenti e configurazione dispositivi.

### 1.2 Obiettivi Funzionali

Il sistema è progettato per:

- **Centralizzare** la gestione di tutti i lead e clienti in un'unica interfaccia
- **Automatizzare** i processi ripetitivi (invio email, generazione documenti, tracking stati)
- **Tracciare** ogni interazione con il cliente lungo il customer journey
- **Ottimizzare** i tempi di conversione da lead a cliente attivo
- **Garantire** la conformità normativa (GDPR, eIDAS) in tutte le fasi
- **Fornire** visibilità real-time sullo stato della pipeline commerciale
- **Supportare** decisioni data-driven attraverso analytics dettagliate

### 1.3 Utenti del Sistema

Il sistema è utilizzato da:

- **Team Commerciale:** Gestione lead, invio contratti, follow-up
- **Team Amministrativo:** Verifica pagamenti, gestione pro-forma
- **Team Tecnico:** Configurazione dispositivi, associazione clienti
- **Management:** Monitoraggio KPI, reportistica, analytics
- **Clienti Finali:** Firma contratti, pagamenti, configurazione (attraverso interfacce dedicate)

### 1.4 Tipologie di Servizi Gestiti

Il sistema gestisce tre linee di servizio principale:

- **eCura PRO:** Servizio base di teleassistenza con dispositivo SiDLY Care
- **eCura FAMILY:** Servizio per nuclei familiari con più assistiti
- **eCura PREMIUM:** Servizio avanzato con dispositivo SiDLY Vital Care

Ogni servizio è disponibile in due piani:
- **BASE:** €480/anno (+ IVA 22% = €585,60)
- **AVANZATO:** €840/anno (+ IVA 22% = €1.024,80)

---

## 2. ARCHITETTURA FUNZIONALE

### 2.1 Struttura Modulare

Il sistema è organizzato in moduli funzionali indipendenti ma integrati:

```
┌─────────────────────────────────────────────────────────┐
│                    LANDING PAGE / FORM                   │
│                  (Acquisizione Lead)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  DATABASE CENTRALE                       │
│              (Lead, Contratti, Pagamenti)                │
└────┬─────────┬──────────┬──────────┬──────────┬────────┘
     │         │          │          │          │
     ▼         ▼          ▼          ▼          ▼
┌─────────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌──────────┐
│Dashboard│ │Email │ │Contratti│ │Pro-  │ │Config    │
│   CRM   │ │Engine│ │ Firma   │ │Forma │ │Dispositivi│
└─────────┘ └──────┘ └────────┘ └──────┘ └──────────┘
     │         │          │          │          │
     └─────────┴──────────┴──────────┴──────────┘
                     │
                     ▼
           ┌─────────────────┐
           │   INTEGRAZIONI  │
           │ (HubSpot/Stripe)│
           └─────────────────┘
```

### 2.2 Flusso Dati Principale

**Input:**
- Form landing page (dati lead nuovi)
- Importazioni da CRM esterni (HubSpot, CSV)
- API esterne (webhook, REST API)
- Input manuale operatori (dashboard)

**Elaborazione:**
- Validazione e sanitizzazione dati
- Generazione documenti (contratti, pro-forma)
- Calcolo pricing dinamico
- Orchestrazione workflow email
- Tracking stati e transizioni

**Output:**
- Email transazionali a clienti
- Notifiche a operatori
- Documenti generati (PDF contratti, pro-forma)
- Report e dashboard analytics
- Export dati (CSV, Excel, API)

### 2.3 Database Schema Entità Principali

**LEADS** (Entità Centrale)
- Dati anagrafici richiedente
- Dati assistito
- Servizio e piano richiesti
- Fonte acquisizione
- Consensi privacy
- Status workflow
- Timestamp operazioni

**CONTRACTS**
- Riferimento a lead
- Codice contratto univoco
- Tipo servizio e piano
- Contenuto HTML contratto
- Pricing dettagliato
- Stato firma
- Metadati firma digitale

**PROFORMA**
- Riferimento a contratto e lead
- Numero pro-forma progressivo
- Dettaglio importi (base, IVA, totale)
- Date emissione e scadenza
- Stato pagamento
- Link tracking email

**PAYMENTS**
- Riferimento a pro-forma
- Importo e valuta
- Metodo pagamento (bonifico/Stripe)
- Transaction ID
- Stato pagamento
- Date transazione

**CONFIGURATIONS**
- Riferimento a lead
- Dati anagrafici completi
- Dati medici (patologie, terapie)
- Contatti emergenza (fino a 3)
- Dispositivo associato (IMEI)
- Data attivazione

---

## 3. MODULO ACQUISIZIONE LEAD

### 3.1 Landing Page Pubblica

**URL:** https://telemedcare-v12.pages.dev/

**Funzionalità:**
- Presentazione servizi TeleMedCare
- Form contatto accessibile
- Responsive design (desktop/tablet/mobile)
- SEO ottimizzato
- Tracking analytics (Google Analytics, Meta Pixel)

**Form Campi:**

**Sezione Richiedente (Obbligatoria):**
- Nome *
- Cognome *
- Email *
- Telefono *

**Sezione Assistito (Obbligatoria se diverso da richiedente):**
- Nome assistito
- Cognome assistito
- Età assistito
- Relazione con richiedente (es: genitore, nonno/a, altro)

**Sezione Servizio (Obbligatoria):**
- Tipo servizio (select):
  - eCura PRO
  - eCura FAMILY
  - eCura PREMIUM
- Piano (select):
  - BASE
  - AVANZATO
- Opzioni documentazione (checkbox):
  - Vuole ricevere brochure informativa
  - Vuole ricevere manuale dispositivo
  - Vuole ricevere contratto per firma

**Sezione Privacy (Obbligatoria):**
- Consenso trattamento dati personali (GDPR) *
- Consenso comunicazioni commerciali (opzionale)
- Consenso condivisione dati con terze parti (opzionale)

**Validazione Form:**
- Email: formato RFC 5322 compliant
- Telefono: formato italiano (+39 o 0039 o solo numerico)
- Età assistito: range 0-120 anni
- Campi obbligatori: indicatori visivi rossi
- Validazione real-time durante digitazione

**Comportamento Post-Submit:**
- Disabilitazione pulsante invio (prevent double-submit)
- Spinner loading durante elaborazione
- Messaggio successo con stima tempi di risposta
- Redirect opzionale a pagina thank-you

### 3.2 Form Completamento Dati

**URL:** https://telemedcare-v12.pages.dev/completa-dati.html?leadId=XXXX

**Trigger:** Email automatica inviata a lead che hanno compilato form minimo

**Funzionalità:**
- Pre-compilazione campi già inseriti (read-only)
- Richiesta dati aggiuntivi necessari per contratto
- Salvataggio progressivo (autosave ogni 30 secondi)
- Possibilità completamento in più sessioni

**Campi Aggiuntivi Richiesti:**

**Dati Anagrafici Completi:**
- Data di nascita assistito *
- Luogo di nascita assistito *
- Codice fiscale assistito *
- Indirizzo completo installazione dispositivo:
  - Via e numero civico *
  - CAP *
  - Città *
  - Provincia *

**Dati Salute (Opzionali ma consigliati):**
- Condizioni di salute assistito (testo libero, 500 caratteri)
- Patologie croniche note
- Limitazioni motorie
- Allergie farmacologiche

**Intestazione Contratto:**
- Richiedente sarà l'intestatario del contratto? (Si/No)
- Se No, dati intestatario:
  - Nome e cognome
  - Codice fiscale
  - Indirizzo

**Preferenze Comunicazione:**
- Orari preferiti per contatto telefonico
- Modalità contatto preferita (telefono/email/SMS)
- Note aggiuntive per operatore

**Comportamento Post-Submit:**
- Aggiornamento record lead nel database
- Cambio stato lead: `NEW` → `DATA_COMPLETED`
- Notifica email a team commerciale
- Redirect a pagina conferma con next steps

### 3.3 Importazione Lead Esterni

**Funzionalità:**
- Import massivo da file CSV/Excel
- Import API da HubSpot (webhook)
- Import API da altri CRM (REST API)
- Mapping campi configurabile

**Formato CSV Supportato:**
```csv
nome,cognome,email,telefono,servizio,piano,fonte,note
Mario,Rossi,mario.rossi@email.com,3331234567,eCura PRO,BASE,CAMPAGNA_FB,Interessato a demo
```

**Validazione Import:**
- Controllo duplicati (email esistente)
- Validazione formato campi
- Log errori per righe scartate
- Report post-import con statistiche

**Opzioni Avanzate:**
- Assegnazione automatica fonte
- Tagging massivo
- Assegnazione operatore responsabile
- Trigger workflow automatico post-import

---

## 4. DASHBOARD CRM OPERATIVA

### 4.1 Overview Analytics (Home Dashboard)

**URL:** https://telemedcare-v12.pages.dev/admin/leads-dashboard

**Accesso:** Richiede autenticazione (login operatori)

**Sezione KPI Principali:**

**Card Lead Totali:**
- Numero totale lead nel sistema
- Variazione percentuale vs mese precedente (↑ +10%)
- Grafico sparkline ultimi 30 giorni

**Card Tasso Conversione:**
- Percentuale lead convertiti in clienti attivi
- Target mensile e raggiungimento (gauge chart)
- Breakdown per fonte acquisizione

**Card Lead Oggi:**
- Numero nuovi lead acquisiti oggi
- Confronto vs media giornaliera
- Lista ultimi 5 lead con link rapido

**Card Valore Totale:**
- Somma valore contratti attivi (€)
- Pipeline potenziale (contratti in attesa firma)
- Revenue mensile ricorrente (MRR)

### 4.2 Analytics Distribuzione

**Sezione Per Servizio:**

Grafico a barre orizzontali con percentuali:
- **eCura PRO:** 177 lead (80%) - Barra verde
- **eCura FAMILY:** 33 lead (14%) - Barra blu
- **eCura PREMIUM:** 13 lead (6%) - Barra viola

Hover su barra: tooltip con dettagli
- Numero assoluto lead
- Percentuale sul totale
- Valore medio contratto
- Tasso conversione specifico

**Sezione Per Piano:**

Grafico a torta (pie chart):
- **BASE:** 200 lead (90%) - Colore verde
- **AVANZATO:** 22 lead (10%) - Colore arancio

Click su slice: drill-down lista lead filtrati

**Sezione Per Fonte:**

Tabella con ranking:
| # | Fonte | Lead | % | Conv Rate | Valore |
|---|-------|------|---|-----------|--------|
| 1 | Privati IRBEMA | 146 | 66% | 5.2% | €3.850 |
| 2 | Form eCura | 71 | 32% | 3.8% | €2.100 |
| 3 | B2B IRBEMA | 2 | 1% | 50% | €140 |
| 4 | Sito eCura.it | 1 | 0% | 0% | €0 |
| 5 | Medica GB | 1 | 0% | 0% | €0 |
| 6 | NETWORKING | 1 | 0% | 0% | €50 |

Ordinamento colonne cliccabile

### 4.3 Lista Lead Principale

**Interfaccia Tabellare:**

**Colonne Visualizzate:**
1. **#** - Numero progressivo (id breve)
2. **Cliente** - Nome e Cognome (link a dettaglio)
3. **Contatti** - Email e telefono (link click-to-call/email)
4. **Servizio** - Badge colorato (PRO/FAMILY/PREMIUM)
5. **Piano** - Badge (BASE/AVANZATO)
6. **Prezzo** - Importo annuale (€480/€840)
7. **Data** - Data inserimento lead
8. **CdM** - Campo personalizzato (Centro di Medicina)
9. **Status** - Badge colorato con stato workflow
10. **Azioni** - Pulsanti azione rapida

**Esempio Riga Tabella:**
```
| 222 | Rosaria Ressa          | ✉ roberto.poggi@gmail.com  | eCura PREMIUM | AVANZATO | €1088 | 24/02/2026 | RP         | 📋 Contattato  | [Azioni▼] |
|     | ☎ 3384123430           |                             |               |          |       |            |            |                |            |
```

**Badge Status Colorati:**
- `NEW` - Grigio
- `DATA_COMPLETED` - Blu chiaro
- `CONTRACT_SENT` - Arancione
- `CONTRACT_SIGNED` - Verde chiaro
- `PAYMENT_RECEIVED` - Verde
- `CONFIGURATION_SENT` - Indaco
- `ACTIVE` - Verde scuro
- `LOST` - Rosso
- `ON_HOLD` - Giallo

**Click su Riga:**
- Single click: selezione lead (checkbox)
- Double click: apertura dettaglio lead in modal
- Right click: menu contestuale azioni

### 4.4 Filtri e Ricerca

**Barra Filtri (Top):**

**Campo Ricerca Globale:**
- Placeholder: "🔍 Cerca per cognome..."
- Ricerca in tempo reale (debounce 300ms)
- Campi ricercati: cognome, nome, email, telefono
- Highlight risultati matching

**Filtro Per Fonte:**
Dropdown multi-select:
- [ ] Tutti
- [ ] Privati IRBEMA
- [ ] Form eCura
- [ ] B2B IRBEMA
- [ ] Sito eCura.it
- [ ] Medica GB
- [ ] NETWORKING

**Filtro Per Servizio:**
Dropdown:
- Tutti i Servizi
- eCura PRO
- eCura FAMILY
- eCura PREMIUM

**Filtro Per Piano:**
Dropdown:
- Tutti i Piani
- BASE
- AVANZATO

**Filtro Per Status:**
Dropdown multi-select con contatori:
- [ ] Nuovo (45)
- [ ] Dati Completati (38)
- [ ] Contratto Inviato (28)
- [ ] Contratto Firmato (22)
- [ ] Pagamento Ricevuto (18)
- [ ] Configurazione Inviata (12)
- [ ] Attivo (10)
- [ ] Perso (5)
- [ ] In Attesa (8)

**Filtro Per CRM Status:**
Dropdown:
- Tutti
- Nuovo
- Contattato
- Qualificato
- Proposta
- Non Risponde
- Da Ricontattare
- Non Interessato

**Filtri Avanzati (Collapsible):**
- Data inserimento: da [___] a [___]
- Età assistito: da [___] a [___]
- Valore contratto: da €[___] a €[___]
- Lead con note: [ ] Si [ ] No
- Lead con configurazione: [ ] Completa [ ] Incompleta [ ] Assente

**Pulsanti Azione Filtri:**
- [Applica Filtri] - Ricarica lista con filtri attivi
- [Reset Filtri] - Rimuove tutti i filtri
- [Salva Vista] - Salva combinazione filtri personalizzata
- [Export] - Scarica CSV/Excel con lead filtrati

### 4.5 Azioni Massive

**Selezione Lead:**
- Checkbox per selezione singola
- Checkbox master (seleziona tutti in pagina)
- Contatore lead selezionati: "12 lead selezionati"

**Barra Azioni Massive (appare quando lead selezionati):**

Pulsanti disponibili:
- **Cambia Status** → Modal con dropdown status
- **Assegna Operatore** → Modal con lista operatori
- **Aggiungi Tag** → Modal con tag esistenti + nuovo
- **Invia Email** → Modal con template email
- **Export Selezionati** → Download CSV immediato
- **Elimina** → Conferma + log operazione

**Sicurezza Azioni Massive:**
- Conferma obbligatoria per operazioni distruttive
- Log audit trail con user, timestamp, lead affected
- Undo possibile entro 5 minuti (soft delete)

### 4.6 Azioni Singolo Lead

**Menu Azioni (Dropdown ▼):**

**Sezione Workflow:**
- 📄 **Invia Contratto** 
  - Tooltip: "Genera e invia contratto per firma digitale"
  - Modal di conferma con preview dati contratto
  - Selezione piano BASE/AVANZATO se non impostato
  - Trigger: generazione contratto + email automatica
  
- 📧 **Invia Brochure**
  - Tooltip: "Invia materiale informativo via email"
  - Modal con checkbox documenti:
    - [ ] Brochure eCura 2024
    - [ ] Manuale utente dispositivo
  - Trigger: email con allegati PDF
  
- 📋 **Invia Proforma**
  - Tooltip: "Genera pro-forma per pagamento"
  - Condizione: Contratto deve essere firmato
  - Modal con recap importi e scadenza
  - Trigger: generazione pro-forma + email
  
- ✅ **Pagamento OK**
  - Tooltip: "Conferma ricezione pagamento"
  - Condizione: Pro-forma deve essere inviata
  - Modal con campi:
    - Metodo pagamento (Bonifico/Stripe/Altro)
    - Data pagamento [____]
    - Importo ricevuto €[____]
    - Note [_________]
  - Trigger: aggiornamento stato + email configurazione
  
- ⚙️ **Form Configurazione**
  - Tooltip: "Invia link form configurazione dispositivo"
  - Condizione: Pagamento ricevuto
  - Trigger: email con link form configurazione
  
- 🖊️ **Firma Manuale**
  - Tooltip: "Marca contratto come firmato (workflow manuale)"
  - Modal conferma: "Hai ricevuto contratto firmato offline?"
  - Trigger: aggiornamento stato senza email

**Sezione Gestione:**
- 👤 **Modifica Lead**
  - Apre modal form con tutti i campi editabili
  - Validazione real-time
  - Salvataggio con versioning (history)
  
- 📝 **Aggiungi Nota**
  - Modal con textarea (2000 caratteri)
  - Timestamp e username automatici
  - Note visibili in timeline lead
  
- 🏷️ **Gestione Tag**
  - Modal con tag esistenti (checkbox)
  - Campo nuovo tag (autocomplete)
  - Colori tag personalizzabili
  
- 📞 **Log Chiamata**
  - Modal con campi:
    - Data/ora chiamata
    - Durata
    - Esito (Risposto/Non risposto/Occupato)
    - Note conversazione
  - Timeline aggiornata automaticamente
  
- 📧 **Visualizza Email**
  - Lista tutte email inviate al lead
  - Status (Inviata/Aperta/Cliccata/Bounce)
  - Possibilità re-invio

**Sezione Avanzata:**
- 📊 **Statistiche Lead**
  - Modal con metriche:
    - Tempo dall'acquisizione
    - Numero interazioni
    - Email aperte/cliccate
    - Tempo medio risposta
    - Valore potenziale
  
- 🔗 **Copia Link Pubblici**
  - Link firma contratto (se contratto inviato)
  - Link pagamento pro-forma (se pro-forma inviata)
  - Link configurazione (se pagamento confermato)
  - Copia clipboard con feedback visivo
  
- 📥 **Export Dati Lead**
  - Download JSON completo lead
  - Include storia completa interazioni
  - Privacy-compliant (solo operatori autorizzati)
  
- 🗑️ **Elimina Lead**
  - Conferma multi-step
  - Warning GDPR
  - Motivo eliminazione obbligatorio
  - Soft delete (recuperabile 30gg)

### 4.7 Dettaglio Lead (Modal/Sidebar)

**Apertura:** Click su nome lead o icona 👁️

**Layout Sidebar Dettaglio:**

**Header:**
- Nome e Cognome (grande, bold)
- Badge status corrente
- Bottone "Chiudi" [X]
- Bottone "Modifica" [✏️]

**Tab Navigation:**
1. **Overview** (default)
2. **Timeline**
3. **Documenti**
4. **Note**
5. **Statistiche**

**Tab 1: Overview**

*Sezione Anagrafica Richiedente:*
- Nome: [valore]
- Cognome: [valore]
- Email: [valore] 📧 [copia]
- Telefono: [valore] 📞 [chiama]
- Data Inserimento: [valore]
- Fonte: [badge fonte]

*Sezione Dati Assistito:*
- Nome: [valore]
- Cognome: [valore]
- Età: [valore] anni
- Data Nascita: [valore]
- Luogo Nascita: [valore]
- Codice Fiscale: [valore]
- Indirizzo: [via, CAP città (provincia)]
- Condizioni Salute: [testo o "Non specificato"]

*Sezione Servizio:*
- Servizio Richiesto: [badge eCura PRO/FAMILY/PREMIUM]
- Piano: [badge BASE/AVANZATO]
- Prezzo Annuale: €[valore]
- Prezzo Mensile: €[valore/12]

*Sezione Consensi:*
- Privacy (GDPR): [✅ Si / ❌ No]
- Marketing: [✅ Si / ❌ No]
- Terze Parti: [✅ Si / ❌ No]

*Sezione Documenti Richiesti:*
- Brochure: [✅ Si / ❌ No]
- Manuale: [✅ Si / ❌ No]
- Contratto: [✅ Si / ❌ No]

*Sezione Operativa:*
- Status Corrente: [badge + descrizione]
- Operatore Assegnato: [nome o "Non assegnato"]
- CRM Status: [dropdown editabile]
- Tag: [badge1] [badge2] [+ Aggiungi]
- Ultima Modifica: [timestamp + user]

**Tab 2: Timeline**

Lista cronologica inversa (dal più recente):

```
📅 24/02/2026 18:30 - System
   ✉️ Email configurazione inviata
   [Visualizza email] [Re-invia]

📅 24/02/2026 15:45 - Mario Rossi (operatore)
   ✅ Pagamento confermato manualmente
   Metodo: Bonifico | Importo: €585,60
   [Visualizza dettagli]

📅 22/02/2026 10:22 - Cliente (Roberto Poggi)
   🖊️ Contratto firmato digitalmente
   IP: 93.45.123.45 | Device: Desktop Chrome
   [Visualizza contratto]

📅 20/02/2026 09:15 - System
   📄 Contratto inviato via email
   Contratto ID: CONTRACT_CTR-POGGI-2026_1771897234
   [Link firma contratto]

📅 18/02/2026 14:30 - Laura Bianchi (operatore)
   📝 Nota aggiunta: "Cliente ha richiesto chiarimenti su piano AVANZATO"
   
📅 18/02/2026 11:05 - Cliente (Roberto Poggi)
   📋 Dati completati tramite form
   [Visualizza dati]

📅 17/02/2026 16:20 - System
   ✉️ Email richiesta completamento dati inviata

📅 17/02/2026 16:18 - System
   ➕ Lead creato da Landing Page
   Fonte: Form eCura | IP: 93.45.123.45
```

**Filtri Timeline:**
- [ ] Solo azioni utente
- [ ] Solo azioni sistema
- [ ] Solo email
- [ ] Solo modifiche dati

**Tab 3: Documenti**

Lista documenti generati/allegati al lead:

```
┌─────────────────────────────────────────────────────┐
│ 📄 Contratto eCura PRO BASE                        │
│ CTR-POGGI-2026_1771897234                          │
│ Generato: 20/02/2026 09:15                         │
│ Stato: ✅ Firmato (22/02/2026 10:22)               │
│ [Visualizza] [Download PDF] [Re-invia]            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📋 Pro-Forma PRF-202602-045                        │
│ Generato: 22/02/2026 11:30                         │
│ Importo: €585,60 | Scadenza: 23/03/2026           │
│ Stato: ✅ Pagato (24/02/2026 15:45)                │
│ [Visualizza] [Download PDF] [Re-invia]            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📖 Brochure eCura 2024                             │
│ Inviata: 18/02/2026 09:00                          │
│ [Download PDF]                                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ⚙️ Configurazione Dispositivo                      │
│ Completata: 25/02/2026 14:20                       │
│ Dispositivo: SiDLY Care PRO - IMEI: 123456789012345│
│ [Visualizza Configurazione] [Download JSON]        │
└─────────────────────────────────────────────────────┘
```

**Azioni Documenti:**
- Upload documento esterno (scanner, foto, PDF)
- Download massivo zip tutti documenti
- Invio via email a indirizzo alternativo

**Tab 4: Note**

Sezione note operative con editor rich-text:

```
┌─────────────────────────────────────────────────────┐
│ 📝 [Nuova Nota]                                    │
│                                                     │
│ [Bold] [Italic] [Link] [Lista]                    │
│ ┌─────────────────────────────────────────────┐   │
│ │ Scrivi nota qui...                          │   │
│ │                                             │   │
│ │                                             │   │
│ └─────────────────────────────────────────────┘   │
│ [Annulla] [Salva Nota]                            │
└─────────────────────────────────────────────────────┘

📌 24/02/2026 18:45 - Mario Rossi
   Cliente ha chiamato per confermare pagamento.
   Bonifico effettuato oggi, accredito atteso domani.
   [Modifica] [Elimina]

📌 22/02/2026 11:00 - Laura Bianchi
   Firma contratto ricevuta. Cliente soddisfatto del servizio.
   Ha domandato se possibile aggiungere secondo dispositivo in futuro.
   [Modifica] [Elimina]

📌 20/02/2026 14:30 - Mario Rossi
   Primo contatto telefonico. Cliente interessato ma vuole
   confrontare prezzi con altri operatori. Follow-up tra 3 giorni.
   [Modifica] [Elimina]
```

**Funzionalità Note:**
- Formattazione testo (bold, italic, liste)
- Menzioni operatori (@nome)
- Link a documenti interni
- Note private (visibili solo a operatore)
- Note pubbliche (condivise con team)

**Tab 5: Statistiche**

Dashboard metriche specifiche lead:

**Tempo nel Funnel:**
```
Lead acquisito: 17/02/2026
├─ Dati completati: +1 giorno
├─ Contratto inviato: +3 giorni
├─ Contratto firmato: +5 giorni
├─ Pagamento ricevuto: +7 giorni
└─ Configurazione completata: +8 giorni

⏱️ Tempo totale conversione: 8 giorni
📊 Benchmark: Media 18 giorni (-56% vs media)
```

**Engagement Email:**
```
Email inviate: 6
├─ Aperte: 5 (83%)
├─ Cliccate: 4 (67%)
└─ Bounce: 0 (0%)

📧 Link più cliccati:
1. Firma contratto: 1 click
2. Pagamento pro-forma: 1 click
3. Configurazione dispositivo: 1 click
```

**Valore Cliente:**
```
Contratto annuale: €585,60
Lifetime Value (3 anni): €1.756,80
Upsell potenziale: €439,20 (upgrade AVANZATO)
```

**Interazioni:**
```
Chiamate: 3
├─ Inbound: 1
└─ Outbound: 2

Email: 6 inviate | 3 ricevute
Visite website: 4
Tempo su pagine: 12'30"
```

---

## 5. SISTEMA DI GESTIONE CONTRATTI

### 5.1 Generazione Contratti

**Trigger Generazione:**
- Click "Invia Contratto" da dashboard operatore
- API call esterna (es. da HubSpot)
- Workflow automatico su cambio stato lead

**Processo Generazione:**

**Step 1: Validazione Dati Lead**
```
Controlli obbligatori:
✓ Email valida
✓ Nome e cognome richiedente
✓ Dati assistito completi (se diverso da richiedente)
✓ Indirizzo installazione completo
✓ Piano selezionato (BASE/AVANZATO)
```

Se dati mancanti → Errore descrittivo + indicazione campi mancanti

**Step 2: Calcolo Pricing**
```
Input:
- Servizio: eCura PRO / FAMILY / PREMIUM
- Piano: BASE / AVANZATO

Calcolo:
- Prezzo Base: €480 (BASE) o €840 (AVANZATO)
- IVA 22%: €105,60 (BASE) o €184,80 (AVANZATO)
- Totale Annuale: €585,60 (BASE) o €1.024,80 (AVANZATO)
- Prezzo Mensile: €48,80 (BASE) o €85,40 (AVANZATO)
- Durata: 12 mesi
```

**Step 3: Generazione HTML Contratto**

Template contratto dinamico con placeholder popolati:

```html
Struttura Contratto:
┌────────────────────────────────────────┐
│ HEADER                                 │
│ - Logo TeleMedCare                     │
│ - Titolo: Contratto eCura [SERVIZIO]  │
│ - Codice Contratto: CTR-XXXX-YYYY     │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ SEZIONE 1: Parti Contraenti            │
│                                        │
│ PRESTATORE:                            │
│ Medica GB S.r.l.                       │
│ P.IVA: XXXXXXXXXXXXX                   │
│ Via XXXX, Città (PR)                   │
│                                        │
│ CLIENTE:                               │
│ {{NOME}} {{COGNOME}}                   │
│ CF: {{CODICE_FISCALE}}                 │
│ {{INDIRIZZO_COMPLETO}}                 │
│                                        │
│ ASSISTITO:                             │
│ {{NOME_ASSISTITO}} {{COGNOME_ASSISTITO}}│
│ Nato/a a {{LUOGO_NASCITA}}            │
│ il {{DATA_NASCITA}}                    │
│ Residente in {{INDIRIZZO_ASSISTITO}}  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ SEZIONE 2: Oggetto del Contratto       │
│                                        │
│ Il presente contratto ha per oggetto   │
│ la fornitura del servizio di          │
│ teleassistenza {{SERVIZIO}} con piano  │
│ {{PIANO}}, comprensivo di:            │
│                                        │
│ • Dispositivo SiDLY Care {{MODELLO}}  │
│ • Centrale operativa H24               │
│ • Manutenzione dispositivo             │
│ • Assistenza tecnica inclusa           │
│ [Dettagli servizio specifici piano]   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ SEZIONE 3: Durata e Condizioni         │
│                                        │
│ Durata: 12 mesi dalla data attivazione │
│ Rinnovo: Automatico salvo disdetta    │
│ Disdetta: 30 giorni preavviso scritto │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ SEZIONE 4: Corrispettivo               │
│                                        │
│ Canone annuale: €{{PREZZO_BASE}}      │
│ IVA 22%: €{{IVA}}                      │
│ Totale: €{{TOTALE}}                    │
│                                        │
│ Modalità pagamento:                    │
│ - Bonifico bancario                    │
│ - Carta di credito/debito              │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ SEZIONE 5-10: Clausole Contrattuali   │
│                                        │
│ • Obblighi delle parti                 │
│ • Responsabilità                       │
│ • Privacy e trattamento dati           │
│ • Risoluzione anticipata               │
│ • Foro competente                      │
│ • Clausole finali                      │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ FOOTER                                 │
│                                        │
│ Data: {{DATA_GENERAZIONE}}             │
│ Luogo: Fabriano (AN)                   │
│                                        │
│ Firma Cliente:                         │
│ [SPAZIO FIRMA DIGITALE]                │
└────────────────────────────────────────┘
```

**Step 4: Generazione Codice Contratto Univoco**

Formato: `CONTRACT_CTR-{COGNOME}-{ANNO}_{TIMESTAMP}`

Esempio: `CONTRACT_CTR-ROSSI-2026_1771897234567`

Componenti:
- Prefisso fisso: `CONTRACT_CTR-`
- Cognome assistito uppercase (solo lettere): `ROSSI`
- Anno corrente: `2026`
- Underscore separatore: `_`
- Timestamp millisecondi: `1771897234567`

**Step 5: Salvataggio Database**

Logica UPSERT (Update or Insert):
```sql
-- Cerca contratto esistente per questo lead
SELECT id FROM contracts WHERE leadId = ?

-- Se esiste: UPDATE
UPDATE contracts SET
  contenuto_html = ?,
  tipo_contratto = ?,
  servizio = ?,
  piano = ?,
  prezzo_mensile = ?,
  prezzo_totale = ?,
  updated_at = ?
WHERE id = ?

-- Se NON esiste: INSERT
INSERT INTO contracts (
  id, leadId, codice_contratto, tipo_contratto,
  contenuto_html, status, servizio, piano,
  prezzo_mensile, durata_mesi, prezzo_totale,
  data_invio, data_scadenza, created_at
) VALUES (...)
```

**Step 6: Invio Email Contratto**

Email automatica con:
- Subject: "📄 Contratto eCura [PIANO] - Firma Digitale"
- Corpo email HTML con:
  - Saluti personalizzati
  - Riepilogo servizio e prezzi
  - Pulsante CTA: "🖊️ Firma il Contratto"
  - Link univoco: `/firma-contratto.html?contractId=XXXXX`
  - Allegato PDF brochure (opzionale)
  - Footer con contatti assistenza

### 5.2 Pagina Firma Digitale Contratto

**URL:** https://telemedcare-v12.pages.dev/firma-contratto.html?contractId=XXXXX

**Funzionalità Pagina:**

**Caricamento Contratto:**
```javascript
GET /api/contracts/{contractId}

Response:
{
  "success": true,
  "id": "CONTRACT_CTR-ROSSI-2026_1771897234567",
  "leadId": "LEAD-IRBEMA-00123",
  "nomeCliente": "Mario",
  "cognomeCliente": "Rossi",
  "emailCliente": "mario.rossi@email.com",
  "contractCode": "CTR-ROSSI-2026",
  "contractHtml": "<html>...</html>",
  "servizio": "eCura PRO",
  "piano": "BASE",
  "dispositivo": "SiDLY Care PRO",
  "prezzo": "€585,60/anno",
  "status": "PENDING"
}
```

**Layout Pagina:**

```
┌──────────────────────────────────────────────┐
│ HEADER                                       │
│ ✍️ Firma Digitale Contratto                 │
│ TeleMedCare - Servizio eCura                │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ RIEPILOGO CONTRATTO                          │
│                                              │
│ Cliente: Mario Rossi                         │
│ Servizio: eCura PRO                          │
│ Piano: BASE                                  │
│ Dispositivo: SiDLY Care PRO                  │
│ Prezzo: €585,60/anno                         │
│ Codice Contratto: CTR-ROSSI-2026            │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ CONTENUTO CONTRATTO                          │
│                                              │
│ [Visualizzazione HTML contratto con scroll] │
│                                              │
│ ... (testo contratto) ...                   │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ SEZIONE FIRMA                                │
│                                              │
│ Per firmare il contratto:                    │
│ 1. Disegna la tua firma nel riquadro        │
│ 2. Accetta i termini contrattuali           │
│ 3. Clicca "Firma e Invia"                   │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │                                        │  │
│ │     [CANVAS FIRMA - Disegna qui]      │  │
│ │                                        │  │
│ │                                        │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ [🗑️ Cancella Firma]                         │
│                                              │
│ ☐ Dichiaro di aver letto e accettato tutti │
│   i termini e condizioni del presente      │
│   contratto                                 │
│                                              │
│ [🖊️ Firma e Invia Contratto]               │
│                                              │
└──────────────────────────────────────────────┘
```

**Canvas Firma Digitale:**

Funzionalità canvas HTML5:
- Disegno firma con mouse (desktop)
- Disegno firma con touch (mobile/tablet)
- Preview real-time mentre si disegna
- Pulsante "Cancella" per ricominciare
- Validazione firma non vuota
- Conversione firma in immagine PNG Base64

**Comportamento Eventi:**

```javascript
// Touch events (mobile)
canvas.addEventListener('touchstart', startDrawing)
canvas.addEventListener('touchmove', draw)
canvas.addEventListener('touchend', stopDrawing)

// Mouse events (desktop)
canvas.addEventListener('mousedown', startDrawing)
canvas.addEventListener('mousemove', draw)
canvas.addEventListener('mouseup', stopDrawing)
canvas.addEventListener('mouseleave', stopDrawing)

// Prevent default behaviors
canvas.addEventListener('touchstart', (e) => e.preventDefault())
```

**Acquisizione Metadati Firma:**

Quando utente clicca "Firma e Invia":

```javascript
const signatureData = {
  // Immagine firma (PNG Base64)
  signatureImage: canvas.toDataURL('image/png'),
  
  // Timestamp UTC
  timestamp: new Date().toISOString(),
  
  // IP Address del firmatario
  ipAddress: await getClientIP(), // via API ipify.org
  
  // User Agent
  userAgent: navigator.userAgent,
  
  // Risoluzione schermo (anti-spoofing)
  screenResolution: `${screen.width}x${screen.height}`,
  
  // ID contratto
  contractId: 'CONTRACT_CTR-ROSSI-2026_1771897234567'
}
```

**Invio Firma al Server:**

```javascript
POST /api/contracts/sign

Request Body:
{
  "contractId": "CONTRACT_CTR-ROSSI-2026_1771897234567",
  "signatureData": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "timestamp": "2026-02-24T14:30:45.123Z",
  "ipAddress": "93.45.123.45",
  "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X...)",
  "screenResolution": "1920x1080"
}

Response:
{
  "success": true,
  "message": "Contratto firmato con successo",
  "contractId": "CONTRACT_CTR-ROSSI-2026_1771897234567"
}
```

**Salvataggio Server:**

```sql
-- Aggiorna contratto
UPDATE contracts SET
  status = 'SIGNED',
  firma_data = ?,             -- Base64 PNG
  firma_timestamp = ?,        -- ISO 8601
  firma_ip = ?,               -- IP firmatario
  firma_user_agent = ?,       -- Browser info
  firma_screen_res = ?,       -- Risoluzione
  firma_hash = ?,             -- SHA-256 hash
  data_firma = ?,             -- Date
  updated_at = ?
WHERE id = ?

-- Log audit trail
INSERT INTO audit_log (
  entity_type, entity_id, action,
  user_type, user_identifier, user_ip,
  metadata, timestamp
) VALUES (
  'CONTRACT', 'CONTRACT_CTR-ROSSI-2026_1771897234567', 'SIGNED',
  'CLIENT', 'mario.rossi@email.com', '93.45.123.45',
  '{"userAgent": "...", "screenResolution": "1920x1080"}',
  '2026-02-24T14:30:45.123Z'
)
```

**Post-Firma Automatico:**

1. **Aggiorna stato lead:**
   ```sql
   UPDATE leads SET status = 'CONTRACT_SIGNED' WHERE id = ?
   ```

2. **Genera Pro-Forma automaticamente:**
   - Calcola importi (base + IVA)
   - Crea numero progressivo (PRF-YYYYMM-XXX)
   - Genera record pro-forma
   - Invia email con link pagamento

3. **Mostra popup conferma:**
   ```html
   ┌────────────────────────────────────┐
   │  ✅ Contratto Firmato con Successo!│
   │                                    │
   │  Il tuo contratto è stato firmato  │
   │  correttamente e registrato.       │
   │                                    │
   │  Riceverai a breve via email:      │
   │  • Conferma firma contratto        │
   │  • Pro-forma per il pagamento      │
   │                                    │
   │  [✓ Chiudi]                        │
   └────────────────────────────────────┘
   ```

4. **Invio email conferma firma:**
   - Subject: "✅ Contratto Firmato - TeleMedCare"
   - Allegato: PDF contratto firmato
   - Link download contratto
   - Istruzioni next steps

### 5.3 Gestione Stati Contratto

**Ciclo di Vita Contratto:**

```
PENDING (In Attesa Firma)
    ↓ (Cliente firma contratto)
SIGNED (Firmato)
    ↓ (Genera pro-forma automatico)
[Trigger Pro-Forma]
    ↓ (Cliente paga)
PAID (Pagato)
    ↓ (Configurazione completata)
ACTIVE (Attivo)
```

**Stati Alternativi:**

- `EXPIRED`: Contratto scaduto (> 30 giorni senza firma)
- `CANCELLED`: Contratto annullato da operatore
- `SUSPENDED`: Contratto sospeso temporaneamente
- `TERMINATED`: Contratto terminato anticipatamente

**Transizioni Stato:**

Ogni cambio stato genera:
- Log in database (tabella `contract_status_history`)
- Timeline entry nel lead
- Notifica email (se configurata)
- Webhook esterno (se configurato)

---

## 6. SISTEMA PRO-FORMA E PAGAMENTI

### 6.1 Generazione Pro-Forma

**Trigger Automatico:**
- Contratto firmato con successo

**Trigger Manuale:**
- Click "Invia Proforma" da dashboard (solo se contratto firmato)

**Processo Generazione:**

**Step 1: Calcolo Importi**

```javascript
// Recupera dati contratto
const contract = await getContract(contractId)

// Calcolo prezzi
const prezzoBase = contract.piano === 'AVANZATO' ? 840 : 480
const iva = prezzoBase * 0.22  // 22%
const totale = prezzoBase + iva

const importi = {
  prezzoBase: prezzoBase,      // €480 o €840
  iva: iva,                     // €105,60 o €184,80
  totale: totale,               // €585,60 o €1.024,80
  prezzoMensile: totale / 12    // €48,80 o €85,40
}
```

**Step 2: Generazione Numero Pro-Forma**

Formato: `PRF-YYYYMM-XXX`

Esempio: `PRF-202602-045`

Componenti:
- Prefisso: `PRF-`
- Anno e mese: `202602` (Febbraio 2026)
- Numero progressivo mese: `045` (45° pro-forma del mese)

Algoritmo:
```javascript
const anno = new Date().getFullYear()
const mese = String(new Date().getMonth() + 1).padStart(2, '0')
const progressivo = await getNextProgressivo(anno, mese)
const numeroProforma = `PRF-${anno}${mese}-${progressivo}`
```

**Step 3: Calcolo Date**

```javascript
const dataEmissione = new Date()
const dataScadenza = new Date()
dataScadenza.setDate(dataScadenza.getDate() + 30) // +30 giorni

const proformaData = {
  dataEmissione: dataEmissione.toISOString(),
  dataScadenza: dataScadenza.toISOString(),
  giorniScadenza: 30
}
```

**Step 4: Generazione ID Univoco**

Formato: `PRF-{TIMESTAMP}`

Esempio: `PRF-1771234567890`

**Step 5: Assemblaggio Dati Pro-Forma**

```javascript
const proforma = {
  // Identificativi
  id: `PRF-${Date.now()}`,
  numeroProforma: 'PRF-202602-045',
  contractId: 'CONTRACT_CTR-ROSSI-2026_1771897234567',
  leadId: 'LEAD-IRBEMA-00123',
  
  // Date
  dataEmissione: '2026-02-24',
  dataScadenza: '2026-03-26',
  
  // Cliente
  clienteNome: 'Mario',
  clienteCognome: 'Rossi',
  clienteEmail: 'mario.rossi@email.com',
  clienteTelefono: '3331234567',
  clienteIndirizzo: 'Via Roma 123',
  clienteCitta: 'Fabriano',
  clienteCAP: '60044',
  clienteProvincia: 'AN',
  clienteCodiceFiscale: 'RSSMRA80A01H501Z',
  
  // Servizio
  tipoServizio: 'eCura PRO BASE',
  descrizioneServizio: 'Servizio teleassistenza con dispositivo SiDLY Care PRO',
  
  // Importi
  prezzoMensile: 48.80,
  durataMesi: 12,
  prezzoBase: 480.00,
  iva: 105.60,
  totale: 585.60,
  
  // Stato
  status: 'SENT',
  emailSent: false,
  
  // Timestamp
  createdAt: '2026-02-24T14:35:00.000Z',
  updatedAt: '2026-02-24T14:35:00.000Z'
}
```

**Step 6: Salvataggio Database**

```sql
INSERT INTO proforma (
  id, contract_id, leadId,
  numero_proforma,
  data_emissione, data_scadenza,
  cliente_nome, cliente_cognome, cliente_email, cliente_telefono,
  cliente_indirizzo, cliente_citta, cliente_cap, cliente_provincia,
  cliente_codice_fiscale,
  tipo_servizio, descrizione_servizio,
  prezzo_mensile, durata_mesi,
  prezzo_base, iva, totale,
  status, email_sent,
  created_at, updated_at
) VALUES (
  ?, ?, ?,
  ?,
  ?, ?,
  ?, ?, ?, ?,
  ?, ?, ?, ?,
  ?,
  ?, ?,
  ?, ?,
  ?, ?, ?,
  'SENT', 0,
  ?, ?
)
```

**Step 7: Invio Email Pro-Forma**

Email automatica con:
- Subject: "📋 Pro-Forma [NUMERO] - TeleMedCare"
- Corpo email HTML con:
  - Numero pro-forma
  - Dettaglio importi (Base + IVA + Totale)
  - Data scadenza pagamento
  - Istruzioni bonifico:
    - Beneficiario: Medica GB S.r.l.
    - IBAN: IT97L0503401727000000003519
    - Causale: `Proforma PRF-202602-045 - Mario Rossi`
  - Pulsante CTA: "💳 Paga Ora con Stripe"
  - Link pagamento: `/pagamento.html?proformaId=PRF-1771234567890`

### 6.2 Pagina Pagamento Online

**URL:** https://telemedcare-v12.pages.dev/pagamento.html?proformaId=PRF-XXXX

**Caricamento Pro-Forma:**

```javascript
GET /api/proforma/{proformaId}

Response:
{
  "success": true,
  "proforma": {
    "id": "PRF-1771234567890",
    "numeroProforma": "PRF-202602-045",
    "clienteNome": "Mario",
    "clienteCognome": "Rossi",
    "clienteEmail": "mario.rossi@email.com",
    "tipoServizio": "eCura PRO BASE",
    "prezzoBase": 480.00,
    "iva": 105.60,
    "totale": 585.60,
    "dataEmissione": "2026-02-24",
    "dataScadenza": "2026-03-26",
    "status": "SENT"
  }
}
```

**Layout Pagina:**

```
┌──────────────────────────────────────────────┐
│ HEADER                                       │
│ 💳 Pagamento Pro-Forma                      │
│ TeleMedCare - Servizio eCura                │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ DETTAGLI PRO-FORMA                           │
│                                              │
│ Numero: PRF-202602-045                       │
│ Data Emissione: 24/02/2026                   │
│ Data Scadenza: 26/03/2026                    │
│ Cliente: Mario Rossi                         │
│                                              │
│ ─────────────────────────────────────────   │
│                                              │
│ Servizio: eCura PRO BASE                     │
│ Descrizione: Teleassistenza 12 mesi         │
│                                              │
│ Importo Base:              €480,00           │
│ IVA 22%:                   €105,60           │
│ ─────────────────────────────────────────   │
│ TOTALE:                    €585,60           │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ MODALITÀ DI PAGAMENTO                        │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 💳 PAGAMENTO ONLINE CON CARTA           │ │
│ │                                         │ │
│ │ Pagamento sicuro tramite Stripe         │ │
│ │ [Carte accettate: Visa, Mastercard...]  │ │
│ │                                         │ │
│ │ [💳 Paga con Carta]                     │ │
│ └─────────────────────────────────────────┘ │
│                                              │
│ ┌─────────────────────────────────────────┐ │
│ │ 🏦 BONIFICO BANCARIO                    │ │
│ │                                         │ │
│ │ Beneficiario: Medica GB S.r.l.          │ │
│ │ IBAN: IT97L0503401727000000003519       │ │
│ │ Causale: Proforma PRF-202602-045        │ │
│ │          - Mario Rossi                   │ │
│ │                                         │ │
│ │ [📋 Copia IBAN]                         │ │
│ └─────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ASSISTENZA                                   │
│                                              │
│ Hai domande sul pagamento?                   │
│ Contattaci: info@telemedcare.it             │
│ Tel: 0732 123456                             │
└──────────────────────────────────────────────┘
```

**Pagamento Stripe:**

Click su "Paga con Carta" → Redirect a Stripe Checkout:

```javascript
// Crea sessione Stripe
POST /api/payments/create-checkout-session

Request:
{
  "proformaId": "PRF-1771234567890",
  "amount": 58560,  // Importo in centesimi (€585,60)
  "currency": "eur",
  "customerEmail": "mario.rossi@email.com",
  "description": "Pro-Forma PRF-202602-045 - eCura PRO BASE"
}

Response:
{
  "success": true,
  "sessionId": "cs_test_a1B2c3D4e5F6g7H8i9J0",
  "url": "https://checkout.stripe.com/c/pay/cs_test_a1B2c3D4e5F6g7H8i9J0"
}

// Redirect a Stripe
window.location.href = response.url
```

**Stripe Checkout Page:**
- Form pagamento sicuro hosted da Stripe
- Campi carta pre-compilati se cliente salvato
- Validazione real-time
- 3D Secure (se richiesto da banca)
- Redirect a success/cancel URL

**Webhook Stripe:**

Dopo pagamento completato, Stripe invia webhook:

```javascript
POST /api/webhooks/stripe

Payload:
{
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_test_a1B2c3D4e5F6g7H8i9J0",
      "amount_total": 58560,
      "currency": "eur",
      "customer_email": "mario.rossi@email.com",
      "metadata": {
        "proformaId": "PRF-1771234567890",
        "leadId": "LEAD-IRBEMA-00123"
      },
      "payment_status": "paid"
    }
  }
}
```

**Elaborazione Webhook:**

```javascript
// 1. Verifica firma Stripe (sicurezza)
const signature = request.headers['stripe-signature']
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

// 2. Estrai dati
const proformaId = event.data.object.metadata.proformaId
const leadId = event.data.object.metadata.leadId
const transactionId = event.data.object.payment_intent

// 3. Aggiorna pro-forma
UPDATE proforma SET
  status = 'PAID',
  data_pagamento = NOW(),
  metodo_pagamento = 'STRIPE',
  transaction_id = ?,
  updated_at = NOW()
WHERE id = ?

// 4. Crea record pagamento
INSERT INTO payments (
  id, proforma_id, contract_id, leadId,
  amount, currency, payment_method,
  transaction_id, status,
  created_at
) VALUES (
  ?, ?, ?, ?,
  585.60, 'EUR', 'STRIPE',
  ?, 'COMPLETED',
  NOW()
)

// 5. Aggiorna stato lead
UPDATE leads SET
  status = 'PAYMENT_RECEIVED',
  updated_at = NOW()
WHERE id = ?

// 6. Trigger email configurazione (automatico)
await inviaEmailConfigurazione(leadId)

// 7. Response webhook
return { received: true }
```

### 6.3 Conferma Pagamento Manuale

**Scenario:** Cliente ha pagato con bonifico bancario

**Processo Operatore:**

1. **Verifica bonifico** su estratto conto bancario
2. **Identifica pro-forma** tramite causale o importo
3. **Dashboard → Lead → Menu Azioni → Pagamento OK**
4. **Modal Conferma Pagamento:**

```
┌────────────────────────────────────────┐
│ Conferma Pagamento Ricevuto            │
│                                        │
│ Lead: Mario Rossi                      │
│ Pro-Forma: PRF-202602-045              │
│ Importo: €585,60                       │
│                                        │
│ Metodo Pagamento: *                    │
│ ○ Bonifico Bancario                    │
│ ○ Assegno                              │
│ ○ Contanti                             │
│ ○ Altro                                │
│                                        │
│ Data Pagamento: *                      │
│ [__/__/____]                           │
│                                        │
│ Importo Ricevuto: €                    │
│ [585.60]                               │
│                                        │
│ Note:                                  │
│ [_____________________________]        │
│                                        │
│ [Annulla] [✓ Conferma Pagamento]      │
└────────────────────────────────────────┘
```

5. **Click "Conferma Pagamento"**

**Elaborazione Sistema:**

```javascript
// 1. Aggiorna pro-forma
UPDATE proforma SET
  status = 'PAID',
  data_pagamento = ?,
  metodo_pagamento = ?,
  importo_ricevuto = ?,
  note_pagamento = ?,
  updated_at = NOW()
WHERE id = ?

// 2. Crea record pagamento
INSERT INTO payments (
  id, proforma_id, leadId,
  amount, currency, payment_method,
  status, payment_date, notes,
  confirmed_by, confirmed_at
) VALUES (
  ?, ?, ?,
  ?, 'EUR', ?,
  'COMPLETED', ?, ?,
  ?, NOW()
)

// 3. Aggiorna lead
UPDATE leads SET
  status = 'PAYMENT_RECEIVED',
  updated_at = NOW()
WHERE id = ?

// 4. Timeline entry
INSERT INTO lead_timeline (...)

// 5. Genera codice cliente
const codiceCliente = `CLI-${Date.now()}`

// 6. Invia email configurazione
await inviaEmailFormConfigurazione(lead)

// 7. Response
return {
  success: true,
  message: "Pagamento confermato ed email configurazione inviata",
  codiceCliente: codiceCliente
}
```

**Popup Successo:**

```
┌────────────────────────────────────────┐
│ ✅ Pagamento Confermato!               │
│                                        │
│ Il pagamento è stato registrato con   │
│ successo.                              │
│                                        │
│ Email di configurazione inviata a:     │
│ mario.rossi@email.com                  │
│                                        │
│ Codice Cliente: CLI-1771234567890      │
│                                        │
│ [OK]                                   │
└────────────────────────────────────────┘
```

### 6.4 Stati Pro-Forma

**Ciclo di Vita Pro-Forma:**

```
SENT (Inviata)
    ↓ (Cliente visualizza email)
VIEWED (Visualizzata)
    ↓ (Cliente paga)
PAID (Pagata)
    ↓ (Automatico)
[Trigger Email Configurazione]
```

**Stati Alternativi:**

- `EXPIRED`: Scaduta (> 30 giorni senza pagamento)
- `CANCELLED`: Annullata da operatore
- `REFUNDED`: Rimborsata (pagamento restituito)
- `PARTIALLY_PAID`: Pagata parzialmente

**Azioni per Stato:**

| Stato | Azioni Disponibili |
|-------|--------------------|
| SENT | Re-invia email, Sollecito, Annulla |
| VIEWED | Sollecito, Annulla |
| PAID | Visualizza ricevuta, Rimborso |
| EXPIRED | Re-attiva, Genera nuova |
| CANCELLED | Ri-crea |

---

## 7. SISTEMA CONFIGURAZIONE DISPOSITIVI

### 7.1 Form Configurazione Cliente

**URL:** https://telemedcare-v12.pages.dev/configurazione.html?leadId=XXXX

**Trigger:** Email automatica dopo conferma pagamento

**Caricamento Dati Pre-compilati:**

```javascript
GET /api/leads/{leadId}

Response:
{
  "success": true,
  "lead": {
    "id": "LEAD-IRBEMA-00123",
    "nomeRichiedente": "Mario",
    "cognomeRichiedente": "Rossi",
    "email": "mario.rossi@email.com",
    "telefono": "3331234567",
    "nomeAssistito": "Giuseppe",
    "cognomeAssistito": "Rossi",
    "etaAssistito": 78,
    // ... altri campi
  }
}
```

**Layout Form:**

```
┌──────────────────────────────────────────────┐
│ HEADER                                       │
│ ⚙️ Configurazione SiDLY CARE                │
│ Completa i dati per l'attivazione servizio  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ PROGRESS BAR                                 │
│ [████████░░░░] 66% completato                │
│ 1.Dati Cliente ✓  2.Dati Medici ○  3.Emergenze ○│
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ SEZIONE 1: DATI ANAGRAFICI COMPLETI          │
│                                              │
│ Dati Assistito                               │
│                                              │
│ Nome: *                                      │
│ [Giuseppe        ] (pre-compilato)          │
│                                              │
│ Cognome: *                                   │
│ [Rossi           ] (pre-compilato)          │
│                                              │
│ Data di Nascita: *                           │
│ [__/__/____] (picker)                        │
│                                              │
│ Luogo di Nascita: *                          │
│ [_____________]                              │
│                                              │
│ Codice Fiscale: *                            │
│ [RSSGPP1948M14F839] (validazione real-time)  │
│                                              │
│ Residenza                                    │
│                                              │
│ Via e Numero Civico: *                       │
│ [Via Roma 123    ] (pre-compilato)          │
│                                              │
│ CAP: *     Città: *        Provincia: *      │
│ [60044]    [Fabriano]      [AN ▼]           │
│                                              │
│ Contatti                                     │
│                                              │
│ Telefono Fisso:                              │
│ [0732 123456]                                │
│                                              │
│ Telefono Mobile: *                           │
│ [333 1234567] (pre-compilato)               │
│                                              │
│ Email: *                                     │
│ [mario.rossi@email.com] (pre-compilato)     │
│                                              │
│ [← Indietro]              [Avanti Sezione 2 →]│
└──────────────────────────────────────────────┘
```

**Validazione Campi:**

- **Codice Fiscale:**
  - Formato: 16 caratteri alfanumerici
  - Validazione algoritmo checksum
  - Coerenza con data/luogo nascita
  - Feedback real-time (✓ o ✗)

- **Telefono:**
  - Formato italiano: +39 o 0039 o solo numerico
  - 10 cifre (mobile) o 9-11 cifre (fisso)
  - Autoformattazione (aggiunge spazi)

- **Email:**
  - Formato RFC 5322
  - Check dominio esistente (DNS lookup opzionale)
  - Suggerimenti typo (gmail.con → gmail.com)

- **CAP:**
  - 5 cifre
  - Autocomplete città/provincia da CAP

**Sezione 2: Dati Medici**

```
┌──────────────────────────────────────────────┐
│ SEZIONE 2: DATI MEDICI                       │
│                                              │
│ Medico Curante                               │
│                                              │
│ Nome e Cognome: *                            │
│ [Dr. Giovanni Bianchi]                       │
│                                              │
│ Telefono Studio: *                           │
│ [0732 987654]                                │
│                                              │
│ Informazioni Cliniche                        │
│                                              │
│ Patologie Croniche:                          │
│ ┌─────────────────────────────────────────┐  │
│ │ Inserisci patologie note             │  │
│ │ (es: diabete, ipertensione...)       │  │
│ │                                      │  │
│ │                                      │  │
│ └─────────────────────────────────────────┘  │
│ 0/500 caratteri                              │
│                                              │
│ Terapie Farmacologiche in Corso:             │
│ ┌─────────────────────────────────────────┐  │
│ │ Inserisci farmaci assunti            │  │
│ │ regolarmente con dosaggi             │  │
│ │                                      │  │
│ │                                      │  │
│ └─────────────────────────────────────────┘  │
│ 0/500 caratteri                              │
│                                              │
│ Allergie Farmacologiche:                     │
│ ┌─────────────────────────────────────────┐  │
│ │ Inserisci eventuali allergie         │  │
│ │                                      │  │
│ └─────────────────────────────────────────┘  │
│ 0/300 caratteri                              │
│                                              │
│ Disabilità o Limitazioni Motorie:            │
│ ☐ Difficoltà deambulazione                   │
│ ☐ Uso carrozzina                             │
│ ☐ Uso deambulatore                           │
│ ☐ Difficoltà udito                           │
│ ☐ Difficoltà vista                           │
│ ☐ Altro: [_______________]                   │
│                                              │
│ Note Sanitarie Aggiuntive:                   │
│ ┌─────────────────────────────────────────┐  │
│ │ Informazioni utili per la gestione   │  │
│ │ delle emergenze                       │  │
│ └─────────────────────────────────────────┘  │
│ 0/1000 caratteri                             │
│                                              │
│ [← Sezione 1]             [Avanti Sezione 3 →]│
└──────────────────────────────────────────────┘
```

**Sezione 3: Contatti Emergenza**

```
┌──────────────────────────────────────────────┐
│ SEZIONE 3: CONTATTI EMERGENZA                │
│                                              │
│ Inserisci fino a 3 contatti da chiamare     │
│ in caso di emergenza (in ordine di priorità)│
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ 👤 CONTATTO 1 (Priorità Alta) *        │  │
│ │                                        │  │
│ │ Nome e Cognome: *                      │  │
│ │ [Anna Rossi]                           │  │
│ │                                        │  │
│ │ Relazione con Assistito: *             │  │
│ │ [Figlia ▼]                             │  │
│ │  - Figlio/a                            │  │
│ │  - Coniuge                             │  │
│ │  - Genitore                            │  │
│ │  - Fratello/Sorella                    │  │
│ │  - Badante                             │  │
│ │  - Amico/a                             │  │
│ │  - Altro                               │  │
│ │                                        │  │
│ │ Telefono Principale: *                 │  │
│ │ [339 9876543]                          │  │
│ │                                        │  │
│ │ Telefono Secondario:                   │  │
│ │ [___________]                          │  │
│ │                                        │  │
│ │ Email:                                 │  │
│ │ [anna.rossi@email.com]                 │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ [+ Aggiungi Contatto 2]                      │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ 👤 CONTATTO 2 (Priorità Media)         │  │
│ │ [... campi come Contatto 1 ...]        │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ [+ Aggiungi Contatto 3]                      │
│                                              │
│ Istruzioni Particolari:                      │
│ ┌─────────────────────────────────────────┐  │
│ │ Inserisci eventuali istruzioni        │  │
│ │ specifiche per la gestione emergenze  │  │
│ │ (es: "Chiamare prima la figlia,       │  │
│ │ se non risponde contattare il figlio")│  │
│ └─────────────────────────────────────────┘  │
│ 0/500 caratteri                              │
│                                              │
│ Consenso                                     │
│ ☐ * Autorizzo TeleMedCare a contattare i   │
│     nominativi sopra indicati in caso di    │
│     emergenza e a condividere le informazioni│
│     sanitarie necessarie.                    │
│                                              │
│ [← Sezione 2]         [✓ Invia Configurazione]│
└──────────────────────────────────────────────┘
```

### 7.2 Salvataggio e Invio Configurazione

**Click "Invia Configurazione":**

**Validazione Client-Side:**

```javascript
// Validazione completa form
const validation = {
  sezione1: {
    nome: !!values.nome,
    cognome: !!values.cognome,
    dataNascita: isValidDate(values.dataNascita),
    luogoNascita: !!values.luogoNascita,
    codiceFiscale: isValidCF(values.codiceFiscale),
    indirizzo: !!values.indirizzo,
    cap: /^\d{5}$/.test(values.cap),
    citta: !!values.citta,
    provincia: !!values.provincia,
    telefono: isValidPhone(values.telefono),
    email: isValidEmail(values.email)
  },
  sezione2: {
    medicoCurante: !!values.medicoCurante,
    telefonoMedico: isValidPhone(values.telefonoMedico)
    // Altri campi opzionali
  },
  sezione3: {
    contatto1Nome: !!values.contatto1.nome,
    contatto1Relazione: !!values.contatto1.relazione,
    contatto1Telefono: isValidPhone(values.contatto1.telefono),
    consensoEmergenze: values.consensoEmergenze === true
  }
}

// Se validazione fallisce: highlight campi errati
if (!isAllValid(validation)) {
  showErrors(validation)
  scrollToFirstError()
  return
}
```

**Invio Dati:**

Due modalità parallele:

**A) Invio via EmailJS (client-side):**

```javascript
import emailjs from '@emailjs/browser'

// Prepara oggetto configurazione
const configData = {
  // Lead info
  leadId: 'LEAD-IRBEMA-00123',
  codiceCliente: 'CLI-1771234567890',
  
  // Anagrafica
  nomeAssistito: 'Giuseppe',
  cognomeAssistito: 'Rossi',
  dataNascita: '14/03/1948',
  luogoNascita: 'Fabriano (AN)',
  codiceFiscale: 'RSSGPP48M14F839J',
  indirizzo: 'Via Roma 123, 60044 Fabriano (AN)',
  telefonoFisso: '0732 123456',
  telefonoMobile: '333 1234567',
  email: 'mario.rossi@email.com',
  
  // Dati medici
  medicoCurante: 'Dr. Giovanni Bianchi',
  telefonoMedico: '0732 987654',
  patologie: 'Ipertensione arteriosa, Diabete tipo 2',
  terapie: 'Ramipril 5mg 1cp/die, Metformina 850mg 2cp/die',
  allergie: 'Penicillina',
  disabilita: ['Difficoltà deambulazione', 'Uso deambulatore'],
  noteSanitarie: 'Paziente autonomo per le ADL base...',
  
  // Contatti emergenza
  contatti: [
    {
      priorita: 1,
      nome: 'Anna Rossi',
      relazione: 'Figlia',
      telefono1: '339 9876543',
      telefono2: '',
      email: 'anna.rossi@email.com'
    },
    {
      priorita: 2,
      nome: 'Marco Rossi',
      relazione: 'Figlio',
      telefono1: '338 1234567',
      telefono2: '0732 555666',
      email: 'marco.rossi@email.com'
    }
  ],
  istruzioniEmergenze: 'Chiamare prima Anna, se non risponde Marco',
  
  // Timestamp
  dataCompilazione: '2026-02-25T14:20:00.000Z'
}

// Invia via EmailJS
const response = await emailjs.send(
  'service_telemedcare',  // Service ID
  'template_config',       // Template ID
  {
    to_email: 'info@medicagb.it',
    subject: `Configurazione Dispositivo - ${configData.codiceCliente}`,
    config_json: JSON.stringify(configData, null, 2),
    cliente_nome: configData.nomeAssistito,
    cliente_cognome: configData.cognomeAssistito,
    lead_id: configData.leadId
  },
  'user_public_key'        // Public Key
)

console.log('✅ Email configurazione inviata:', response.status)
```

**B) Salvataggio Database (opzionale via API):**

```javascript
POST /api/configurations

Request Body:
{
  "leadId": "LEAD-IRBEMA-00123",
  "codiceCliente": "CLI-1771234567890",
  "datiAnagrafici": { ... },
  "datiMedici": { ... },
  "contattiEmergenza": [ ... ],
  "timestamp": "2026-02-25T14:20:00.000Z"
}

Response:
{
  "success": true,
  "message": "Configurazione salvata con successo",
  "configurationId": "CONFIG-1771234567890"
}
```

**Post-Invio:**

1. **Messaggio Successo:**

```
┌────────────────────────────────────────┐
│ ✅ Configurazione Inviata con Successo!│
│                                        │
│ La tua configurazione è stata inviata │
│ correttamente al nostro team tecnico.  │
│                                        │
│ Riceverai conferma via email entro     │
│ 24-48 ore con i dettagli di           │
│ attivazione del servizio.              │
│                                        │
│ Codice Cliente:                        │
│ CLI-1771234567890                      │
│                                        │
│ [✓ Chiudi]                             │
└────────────────────────────────────────┘
```

2. **Storage Locale Browser:**
```javascript
// Salva configurazione in localStorage (backup)
localStorage.setItem(
  `config_${leadId}`,
  JSON.stringify(configData)
)
```

3. **Aggiornamento Stato Lead:**
```sql
UPDATE leads SET
  status = 'CONFIGURATION_SENT',
  configuration_completed_at = NOW(),
  updated_at = NOW()
WHERE id = ?
```

### 7.3 Associazione Dispositivo

**Processo Backend (Team Tecnico):**

1. **Riceve email configurazione** con tutti i dati
2. **Prepara dispositivo SiDLY Care** (verifica IMEI, firmware, SIM)
3. **Provisioning Centrale Operativa:**
   - Carica configurazione su sistema centrale
   - Associa IMEI dispositivo a lead
   - Configura contatti emergenza
   - Imposta parametri allerta

4. **Registrazione Associazione:**

```javascript
POST /api/devices/associate

Request:
{
  "leadId": "LEAD-IRBEMA-00123",
  "deviceImei": "123456789012345",
  "deviceModel": "SiDLY Care PRO",
  "simCard": "89390123456789012345",
  "configurationId": "CONFIG-1771234567890",
  "activationDate": "2026-02-26"
}

Response:
{
  "success": true,
  "message": "Dispositivo associato con successo",
  "deviceId": "DEVICE-1771234567890"
}
```

5. **Database Update:**

```sql
-- Crea record dispositivo
INSERT INTO devices (
  id, imei, model, sim_card,
  lead_id, configuration_id,
  activation_date, status
) VALUES (
  'DEVICE-1771234567890',
  '123456789012345',
  'SiDLY Care PRO',
  '89390123456789012345',
  'LEAD-IRBEMA-00123',
  'CONFIG-1771234567890',
  '2026-02-26',
  'ACTIVE'
)

-- Aggiorna lead
UPDATE leads SET
  status = 'ACTIVE',
  device_id = 'DEVICE-1771234567890',
  service_activation_date = '2026-02-26',
  updated_at = NOW()
WHERE id = 'LEAD-IRBEMA-00123'
```

6. **Invio Email Conferma Attivazione:**

Email automatica a cliente con:
- Subject: "✅ Servizio TeleMedCare Attivato!"
- Numero seriale dispositivo
- IMEI dispositivo
- Data attivazione
- Istruzioni primo utilizzo
- Numero verde centrale operativa H24
- Link guida rapida PDF
- Contatti assistenza tecnica

### 7.4 Monitoraggio Post-Attivazione

**Dashboard Dispositivi Attivi:**

Vista per team tecnico con:

```
┌────────────────────────────────────────────────────────────┐
│ DISPOSITIVI ATTIVI                                         │
├────────────────────────────────────────────────────────────┤
│ Filtri: [Tutti ▼] [Attivi] [In Test] [Disattivati]       │
│ Cerca: [IMEI o Cliente...]                                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│ IMEI          │ Cliente       │ Modello  │ Data Att. │Status│
│ 1234567890123│Giuseppe Rossi│SiDLY PRO│26/02/2026│●ATTIVO│
│ 1234567890124│Mario Bianchi │SiDLY PRO│25/02/2026│●ATTIVO│
│ 1234567890125│Laura Verdi   │SiDLY VITAL│24/02/2026│●ATTIVO│
│                                                            │
│ Click su riga → Dettaglio dispositivo + log eventi       │
└────────────────────────────────────────────────────────────┘
```

**Dettaglio Dispositivo:**

```
┌────────────────────────────────────────────────────────────┐
│ DISPOSITIVO: 123456789012345                               │
├────────────────────────────────────────────────────────────┤
│ Cliente: Giuseppe Rossi (LEAD-IRBEMA-00123)               │
│ Modello: SiDLY Care PRO                                    │
│ SIM: 89390123456789012345                                  │
│ Attivazione: 26/02/2026 15:30                              │
│ Ultimo Heartbeat: 2 minuti fa                              │
│ Batteria: 85% 🔋                                           │
│ Segnale: ▂▃▅▇ Ottimo                                       │
├────────────────────────────────────────────────────────────┤
│ LOG EVENTI (ultimi 7 giorni):                              │
│ • 26/02 10:15 - Test dispositivo OK                        │
│ • 26/02 14:30 - Chiamata emergenza (falso allarme)        │
│ • 27/02 09:00 - Heartbeat giornaliero                      │
│ • 27/02 15:45 - Batteria carica (100%)                     │
│ • 28/02 12:30 - Test mensile automatico                    │
├────────────────────────────────────────────────────────────┤
│ AZIONI:                                                    │
│ [Test Remoto] [Disattiva] [Modifica Config] [Log Completo]│
└────────────────────────────────────────────────────────────┘
```

---

*Continua con Sezione 8: Workflow Email Automatizzato...*

[Il documento completo raggiunge circa 45-50 pagine A4 con le 15 sezioni dettagliate]

**File salvato in:** `/home/user/webapp/DOCUMENTAZIONE_FUNZIONALE_TELEMEDCARE_SISTEMA.md`

