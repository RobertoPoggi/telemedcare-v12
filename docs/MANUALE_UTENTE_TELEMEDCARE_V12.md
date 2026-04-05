# 📖 MANUALE UTENTE - TELEMEDCARE V12

## Sistema di Gestione Telemedicina eCura

**Versione applicazione:** V12.0  
**Data manuale:** 9 Febbraio 2026  
**URL applicazione:** https://telemedcare-v12.pages.dev/  
**Supporto:** info@telemedcare.it

---

## 📑 INDICE

1. [Introduzione al Sistema](#1-introduzione-al-sistema)
2. [Come Iniziare](#2-come-iniziare)
3. [Dashboard Principale](#3-dashboard-principale)
4. [Gestione Lead (Richieste)](#4-gestione-lead-richieste)
5. [Gestione Contratti](#5-gestione-contratti)
6. [Gestione Clienti Attivi](#6-gestione-clienti-attivi)
7. [Workflow Automatici](#7-workflow-automatici)
8. [Configurazione Sistema](#8-configurazione-sistema)
9. [Import Lead da Partner](#9-import-lead-da-partner)
10. [Documenti e Template](#10-documenti-e-template)
11. [Report e Statistiche](#11-report-e-statistiche)
12. [Domande Frequenti (FAQ)](#12-domande-frequenti-faq)
13. [Risoluzione Problemi](#13-risoluzione-problemi)

---

## 1. INTRODUZIONE AL SISTEMA

### 🎯 Cos'è TeleMedCare V12?

TeleMedCare V12 è una **piattaforma completa di gestione** per i servizi di telemedicina **eCura**. Il sistema gestisce automaticamente l'intero percorso del cliente, dalla prima richiesta fino all'attivazione del servizio.

### ✨ Funzionalità Principali

- ✅ **Acquisizione automatica richieste** da sito web e partner
- ✅ **Generazione automatica contratti** personalizzati
- ✅ **Gestione firme elettroniche** dei contratti
- ✅ **Generazione proforma** per pagamenti
- ✅ **Workflow email automatici** per ogni fase
- ✅ **Tracking completo** dello stato delle richieste
- ✅ **Dashboard operativa** intuitiva
- ✅ **Statistiche e report** in tempo reale

### 🎨 Interfaccia del Sistema

L'applicazione ha un'interfaccia moderna e semplice da usare:
- **Colori:** Blu (#3B82F6) per le azioni principali, Verde per conferme
- **Layout:** Responsive (si adatta a computer, tablet e smartphone)
- **Navigazione:** Menu intuitivo con icone chiare
- **Feedback visivi:** Notifiche colorate per ogni azione

---

## 2. COME INIZIARE

### 🔗 Accesso al Sistema

1. **Apri il browser** (Chrome, Firefox, Safari, Edge)
2. **Vai all'indirizzo:** https://telemedcare-v12.pages.dev/
3. **Attendi il caricamento** (circa 2-3 secondi)
4. **Vedrai la Dashboard Principale** con tutte le funzioni disponibili

> ⚠️ **Nota:** Non è richiesto login. Il sistema è accessibile direttamente.

### 📱 Compatibilità Browser

Il sistema funziona perfettamente su:
- ✅ **Google Chrome** (consigliato)
- ✅ **Mozilla Firefox**
- ✅ **Microsoft Edge**
- ✅ **Safari** (Mac/iPhone)
- ✅ **Opera**

### 🖥️ Requisiti Minimi

- **Connessione internet** stabile
- **Browser aggiornato** (ultima versione)
- **Risoluzione schermo:** Minimo 1024x768px
- **JavaScript abilitato**

### 🎓 Prima Volta sul Sistema?

Se è la tua prima volta, segui questa guida passo-passo:

1. **Esplora la Dashboard** - Familiarizza con il layout
2. **Guarda i Lead esistenti** - Capire come sono organizzati i dati
3. **Prova le Statistiche** - Vedi i grafici in tempo reale
4. **Leggi le FAQ** - Risposte alle domande comuni

---

## 3. DASHBOARD PRINCIPALE

### 📊 Panoramica Dashboard

La Dashboard è il **cuore del sistema**. Qui trovi tutte le informazioni più importanti in un colpo d'occhio.

#### Cosa Vedi nella Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  📊 TELEMEDCARE V12 - DASHBOARD PRINCIPALE              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  📈 STATISTICHE RAPIDE                                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  │
│  │ Lead    │  │ Contratti│  │ Firmati │  │ Attivi  │  │
│  │ Totali  │  │ Inviati  │  │         │  │         │  │
│  │   125   │  │    85    │  │   72    │  │   68    │  │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  │
│                                                          │
│  🔔 ULTIMI LEAD (Ultime 10 richieste)                   │
│  [Tabella con nome, email, servizio, stato]             │
│                                                          │
│  📊 GRAFICO CONVERSIONI                                  │
│  [Grafico a barre: Lead → Contratti → Firmati → Attivi] │
│                                                          │
│  ⚙️ AZIONI RAPIDE                                        │
│  [Pulsante IRBEMA] [Aggiungi Lead] [Impostazioni]      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 📈 Box Statistiche

#### 1. **Lead Totali** (Blu)
- **Cosa mostra:** Numero totale di richieste ricevute
- **Include:** Tutti i lead (nuovi, in lavorazione, convertiti)
- **Clic:** Apre la pagina Lead Dashboard con lista completa

#### 2. **Contratti Inviati** (Arancione)
- **Cosa mostra:** Numero di contratti generati e inviati
- **Include:** Contratti in attesa firma + già firmati
- **Clic:** Filtra i lead con contratto inviato

#### 3. **Contratti Firmati** (Verde)
- **Cosa mostra:** Numero di contratti firmati elettronicamente
- **Include:** Contratti firmati in attesa pagamento o già pagati
- **Clic:** Filtra i lead con contratto firmato

#### 4. **Clienti Attivi** (Viola)
- **Cosa mostra:** Numero di clienti con servizio attivo
- **Include:** Solo servizi già attivati e operativi
- **Clic:** Apre lista clienti attivi

### 📋 Tabella "Ultimi Lead"

Mostra le **ultime 10 richieste** ricevute in ordine cronologico inverso:

| Colonna | Descrizione | Esempio |
|---------|-------------|---------|
| **Nome** | Nome e cognome richiedente | Mario Rossi |
| **Email** | Email di contatto | mario.rossi@example.com |
| **Telefono** | Numero telefono | +39 333 1234567 |
| **Servizio** | Piano richiesto | eCura PRO - BASE |
| **Stato** | Fase corrente | 🟢 Contratto Firmato |
| **Data** | Data richiesta | 08/02/2026 15:30 |
| **Azioni** | Pulsanti azione | [👁️ Dettagli] [✉️ Email] |

#### Stati Possibili

| Icona | Stato | Significato | Colore |
|-------|-------|-------------|--------|
| 🆕 | Nuovo | Richiesta appena ricevuta | Blu |
| 📧 | Email Inviata | Email documenti inviata | Celeste |
| 📄 | Contratto Inviato | Contratto generato e inviato | Arancione |
| ✍️ | Contratto Firmato | Contratto firmato dal cliente | Verde |
| 💰 | Pagamento Ricevuto | Proforma pagata | Verde scuro |
| ⚙️ | In Configurazione | Cliente compila form config | Giallo |
| ✅ | Attivo | Servizio attivo | Verde brillante |

### 🎯 Pulsanti Azione Rapida

#### 1. **Pulsante "IRBEMA"** (Arancione)
- **Funzione:** Importa lead dal partner IRBEMA
- **Quando usarlo:** Ogni giorno/settimana per sincronizzare
- **Risultato:** Importa automaticamente nuove richieste da HubSpot

#### 2. **Pulsante "Aggiungi Lead Manuale"** (Blu)
- **Funzione:** Inserisci manualmente un nuovo lead
- **Quando usarlo:** Lead arrivati per telefono, fiere, eventi
- **Risultato:** Apre form di inserimento dati

#### 3. **Pulsante "Impostazioni Sistema"** (Grigio)
- **Funzione:** Accedi alle configurazioni
- **Quando usarlo:** Per attivare/disattivare funzioni automatiche
- **Risultato:** Apre pannello impostazioni

### 📊 Grafico Conversioni

Il grafico mostra visivamente il **funnel di conversione**:

```
Lead Totali (125) ──┐
                    ├──→ Contratti Inviati (85)  ──┐
                                                    ├──→ Firmati (72) ──┐
                                                                        ├──→ Attivi (68)
```

- **Blu:** Lead totali
- **Arancione:** Contratti inviati
- **Verde:** Contratti firmati
- **Viola:** Clienti attivi

---

## 4. GESTIONE LEAD (RICHIESTE)

### 📋 Cos'è un Lead?

Un **Lead** è una **richiesta di informazioni o servizio** che arriva tramite:
- 🌐 Sito web eCura.it
- 🤝 Partner (IRBEMA, AON, DoubleYou)
- 📞 Telefono (inserimento manuale)
- 👥 Eventi/fiere (inserimento manuale)
- 💼 Welfare aziendale

### 🔍 Vedere Tutti i Lead

1. **Dalla Dashboard** → Clic su "Lead Totali" (box blu)
2. **Dal Menu** → Clic su "📊 Leads Dashboard"
3. **Vedrai:** Lista completa di tutti i lead

### 📊 Leads Dashboard

#### Filtri Disponibili

La Leads Dashboard permette di **filtrare** i lead per:

| Filtro | Valori | Esempio Uso |
|--------|--------|-------------|
| **Fonte** | WEB, IRBEMA, AON, VIGILANZA, NETWORKING | Vedere solo lead da IRBEMA |
| **Stato** | Nuovo, Contratto Inviato, Firmato, Pagato, Attivo | Vedere solo contratti firmati |
| **Servizio** | eCura PRO, eCura FAMILY, eCura PREMIUM | Vedere solo richieste PRO |
| **Piano** | BASE, AVANZATO | Vedere solo piani AVANZATO |
| **Data** | Da... A... | Vedere lead di gennaio |

#### Come Usare i Filtri

1. **Scegli il filtro** dal menu a tendina
2. **Seleziona il valore** desiderato
3. **Clicca "Applica Filtri"**
4. **La tabella si aggiorna** automaticamente

#### Esempio Pratico

**Voglio vedere solo i contratti firmati da IRBEMA:**
1. Filtro "Fonte" → Seleziona "IRBEMA"
2. Filtro "Stato" → Seleziona "Contratto Firmato"
3. Clicca "Applica Filtri"
4. Risultato: Lista filtrata

### 📝 Dettagli Lead

Per vedere **tutte le informazioni** di un lead:

1. **Nella lista lead** → Clicca pulsante **[👁️ Dettagli]**
2. **Si apre un popup** con tutte le info:

```
┌───────────────────────────────────────────────┐
│  📋 DETTAGLI LEAD: LEAD-IRBEMA-00123          │
├───────────────────────────────────────────────┤
│                                                │
│  👤 RICHIEDENTE                                │
│  Nome: Mario Rossi                             │
│  Email: mario.rossi@example.com                │
│  Telefono: +39 333 1234567                     │
│                                                │
│  👨‍⚕️ ASSISTITO                                 │
│  Nome: Giulia Rossi                            │
│  Parentela: Madre                              │
│  Età: 78 anni                                  │
│  CF: RSSGLL45A01F205X                          │
│  Indirizzo: Via Roma 123, Milano (MI)         │
│                                                │
│  📦 SERVIZIO RICHIESTO                         │
│  Servizio: eCura PRO                           │
│  Piano: BASE                                   │
│  Prezzo 1° anno: 480,00 €                      │
│  Prezzo rinnovo: 200,00 €                      │
│                                                │
│  📊 STATO WORKFLOW                             │
│  Stato corrente: ✍️ Contratto Firmato          │
│  Data acquisizione: 05/02/2026 10:30           │
│  Ultima modifica: 08/02/2026 16:45             │
│                                                │
│  📧 EMAIL INVIATE                               │
│  ✅ Notifica info@ (05/02 10:31)               │
│  ✅ Documenti informativi (05/02 10:32)        │
│  ✅ Contratto (06/02 09:15)                    │
│  ✅ Proforma (08/02 16:45)                     │
│                                                │
│  🔗 AZIONI                                      │
│  [📄 Vedi Contratto] [💰 Vedi Proforma]        │
│  [✉️ Invia Email] [📝 Modifica]                │
│                                                │
└───────────────────────────────────────────────┘
```

### ➕ Aggiungere Lead Manualmente

Se ricevi una **richiesta per telefono o di persona**:

1. **Dashboard** → Clicca **"Aggiungi Lead Manuale"**
2. **Compila il form** con i dati:

#### Form Inserimento Lead

```
┌─────────────────────────────────────────────┐
│  ➕ NUOVO LEAD - INSERIMENTO MANUALE         │
├─────────────────────────────────────────────┤
│                                              │
│  👤 DATI RICHIEDENTE (obbligatori)           │
│  Nome: [_________________]                   │
│  Cognome: [_________________]                │
│  Email: [_________________]                  │
│  Telefono: [_________________]               │
│                                              │
│  👨‍⚕️ DATI ASSISTITO                          │
│  Nome: [_________________]                   │
│  Cognome: [_________________]                │
│  Parentela: [▾ Seleziona]                    │
│  ☐ L'assistito è il richiedente             │
│                                              │
│  📦 SERVIZIO                                  │
│  Servizio: [▾ eCura PRO]                     │
│  Piano: [▾ BASE]                             │
│                                              │
│  📌 FONTE                                     │
│  Fonte: [▾ NETWORKING]                       │
│  Note: [____________________]                │
│                                              │
│  [✅ Salva Lead] [❌ Annulla]                │
└─────────────────────────────────────────────┘
```

3. **Clicca "Salva Lead"**
4. **Il sistema:**
   - Genera automaticamente un Lead ID
   - Invia email notifica a info@telemedcare.it
   - Aggiunge il lead alla lista
   - Avvia il workflow automatico (se configurato)

### 🔄 Convertire Lead in Cliente

Quando un lead completa il percorso e diventa cliente attivo:

1. **Apri Dettagli Lead**
2. **Clicca "Converti in Cliente Attivo"**
3. **Il sistema:**
   - Crea record "Assistito"
   - Cambia stato a "Attivo"
   - Invia email conferma attivazione
   - Aggiorna statistiche

---

## 5. GESTIONE CONTRATTI

### 📄 Cos'è un Contratto nel Sistema?

Il contratto è il **documento legale** che formalizza l'accordo tra Medica GB e il cliente per il servizio eCura.

### 🔄 Workflow Contratti

Il sistema gestisce **automaticamente** questi step:

```
1. Lead Completa Dati
         ↓
2. [AUTOMATICO] Sistema Genera Contratto HTML
         ↓
3. [AUTOMATICO] Conversione HTML → PDF
         ↓
4. [AUTOMATICO] Salvataggio PDF in Cloud
         ↓
5. [AUTOMATICO] Email con Contratto al Cliente
         ↓
6. Cliente Clicca Link e Firma
         ↓
7. [AUTOMATICO] Sistema Salva Firma
         ↓
8. [AUTOMATICO] Genera Proforma Pagamento
```

### 📧 Email Invio Contratto

Il cliente riceve un'email con:
- ✉️ **Oggetto:** "eCura - Il tuo contratto è pronto"
- 📎 **Allegato:** Contratto PDF personalizzato
- 🔗 **Link:** "Firma il contratto online"
- 📄 **Brochure:** Informazioni servizio

### ✍️ Firma Elettronica

Il cliente firma il contratto così:

1. **Clicca link** nell'email
2. **Si apre pagina** di firma
3. **Vede il contratto** completo
4. **Firma con il dito/mouse** su canvas
5. **Clicca "Invia Firma"**
6. **Riceve conferma** immediata

#### Cosa Viene Salvato

Il sistema salva **automaticamente**:
- ✅ Immagine firma (PNG)
- ✅ Data e ora firma
- ✅ Indirizzo IP del cliente
- ✅ Browser usato
- ✅ Risoluzione schermo
- ✅ Contratto firmato (PDF aggiornato)

### 🔍 Vedere Contratti Firmati

**Dashboard** → **Filtro Stato:** "Contratto Firmato"

Vedrai lista con:
- Nome cliente
- Data firma
- Pulsante **[📄 Scarica Contratto]**
- Pulsante **[👁️ Vedi Firma]**

### 📥 Scaricare Contratto Firmato

1. **Trova il lead** nella lista
2. **Clicca [📄 Vedi Contratto]**
3. **Si apre il PDF** nel browser
4. **Salva** con tasto destro → "Salva con nome"

---

## 6. GESTIONE CLIENTI ATTIVI

### 👥 Cos'è un Cliente Attivo?

Un **Cliente Attivo** è un assistito con:
- ✅ Contratto firmato
- ✅ Proforma pagata
- ✅ Configurazione completata
- ✅ Dispositivo spedito/ricevuto
- ✅ Servizio TeleAssistenza ATTIVO

### 📊 Lista Clienti Attivi

**Dashboard** → **Box "Clienti Attivi"** (viola)

Vedrai:

| Info | Descrizione |
|------|-------------|
| **Nome Assistito** | Nome completo persona assistita |
| **Dispositivo** | Modello dispositivo (es: SiDLY Care PRO) |
| **Numero Seriale** | Codice univoco dispositivo |
| **Piano** | BASE o AVANZATO |
| **Data Attivazione** | Data inizio servizio |
| **Stato Servizio** | 🟢 Attivo / 🟡 In attesa / 🔴 Sospeso |
| **Scadenza** | Data scadenza annuale |
| **Azioni** | [👁️] [🔧] [📞] |

### 🔧 Dettagli Cliente Attivo

Cliccando **[👁️ Dettagli]** vedi:

```
┌────────────────────────────────────────────┐
│  👤 CLIENTE ATTIVO: Giulia Rossi           │
├────────────────────────────────────────────┤
│                                             │
│  📋 ANAGRAFICA                              │
│  CF: RSSGLL45A01F205X                       │
│  Data Nascita: 01/01/1945                   │
│  Indirizzo: Via Roma 123, Milano 20100     │
│  Telefono: +39 333 1234567                  │
│  Email: giulia.rossi@example.com            │
│                                             │
│  📞 CONTATTI EMERGENZA                      │
│  1. Mario Rossi (Figlio) - 333 1234567     │
│  2. Laura Rossi (Figlia) - 333 7654321     │
│                                             │
│  📱 DISPOSITIVO                              │
│  Modello: SiDLY Care PRO                    │
│  Seriale: SCPro-2026-00123                  │
│  IMEI: 123456789012345                      │
│  Numero SIM: 335 9876543                    │
│                                             │
│  📦 SERVIZIO                                 │
│  Piano: eCura PRO - BASE                    │
│  Data Attivazione: 01/02/2026               │
│  Data Scadenza: 01/02/2027                  │
│  Stato: 🟢 ATTIVO                           │
│  Prezzo 1° anno: 480,00 €                   │
│  Prezzo rinnovo: 200,00 €                   │
│                                             │
│  👨‍⚕️ INFO MEDICHE                            │
│  Medico Curante: Dr. Giuseppe Verdi         │
│  Tel. Medico: 02 12345678                   │
│  Patologie: Ipertensione, Diabete tipo 2    │
│  Terapie: Ramipril 5mg, Metformina 850mg    │
│  Allergie: Penicillina                      │
│                                             │
│  🔗 DOCUMENTI                                │
│  [📄 Contratto] [💰 Proforma] [🧾 Fattura]  │
│                                             │
└────────────────────────────────────────────┘
```

### 🔔 Notifiche Scadenza

Il sistema invia **automaticamente** reminder rinnovo a:
- 📧 **60 giorni prima** scadenza
- 📧 **30 giorni prima** scadenza  
- 📧 **15 giorni prima** scadenza
- 📧 **Giorno scadenza** (ultimo avviso)

### 🔄 Rinnovo Servizio

Quando un cliente è in scadenza:

1. **Sistema genera** proforma rinnovo automatica
2. **Invia email** al cliente con proforma
3. **Cliente paga** tramite link Stripe
4. **Sistema rileva** pagamento
5. **Estende automaticamente** contratto di 12 mesi

---

## 7. WORKFLOW AUTOMATICI

### 🤖 Cosa Sono i Workflow Automatici?

I **workflow** sono sequenze di azioni che il sistema esegue **automaticamente** quando accade un evento.

### 📧 Workflow Email Principali

#### 1. **Workflow "Nuovo Lead"**

**Trigger:** Arriva nuova richiesta

**Azioni automatiche:**
1. ✅ Salva lead nel database
2. ✅ Genera Lead ID univoco
3. ✅ Invia email notifica a **info@telemedcare.it**
4. ✅ (Se richiesto) Invia brochure al lead
5. ✅ (Se dati incompleti) Invia email "Completa i tuoi dati"

**Email inviate:**
- 📧 A info@: "Nuovo lead ricevuto - [Nome Lead]"
- 📧 Al lead: "Grazie per l'interesse in eCura" (con brochure)

#### 2. **Workflow "Completamento Dati"**

**Trigger:** Lead ha dati mancanti

**Azioni automatiche:**
1. ✅ Genera token sicuro
2. ✅ Crea link personalizzato form
3. ✅ Invia email con link al lead
4. ✅ (Se non completa) Invia reminder dopo 3 giorni
5. ✅ (Se non completa) Invia reminder dopo 7 giorni

**Email inviata:**
- 📧 "Completa i tuoi dati per eCura"
- 🔗 Link form: `https://telemedcare-v12.pages.dev/completa-dati?token=XXX`

#### 3. **Workflow "Contratto"**

**Trigger:** Lead ha dati completi

**Azioni automatiche:**
1. ✅ Genera contratto HTML da template
2. ✅ Sostituisce tutti i placeholder (nome, CF, prezzo, etc.)
3. ✅ Converte HTML in PDF
4. ✅ Salva PDF in cloud storage
5. ✅ Crea record contratto nel database
6. ✅ Invia email al lead con contratto allegato

**Email inviata:**
- 📧 "Il tuo contratto eCura è pronto"
- 📎 Allegato: `contratto_LEADID.pdf`
- 🔗 Link firma: "Firma il contratto online"

#### 4. **Workflow "Firma Contratto"** ✨ APPENA AGGIORNATO

**Trigger:** Cliente firma contratto

**Azioni automatiche:**
1. ✅ Salva firma nel database (PNG base64)
2. ✅ Registra metadata (IP, data, ora, browser)
3. ✅ Aggiorna stato contratto: "SIGNED"
4. ✅ **[NUOVO] Genera automaticamente proforma** (da commit 6be33c7)
5. ✅ **[NUOVO] Calcola prezzi automatici** (servizio + piano)
6. ✅ **[NUOVO] Salva proforma nel database** (tabella proformas)
7. ✅ **[NUOVO] Invia email proforma al cliente** con PDF allegato
8. ✅ Invia notifica firma a info@

**Dettagli Proforma Automatica:**
- **Numero Proforma:** `PRF-YYYYMM-NNNN` (es: PRF-202602-0001)
- **Prezzo:** Calcolato da servizio+piano (es: €480 BASE, €840 AVANZATO)
- **IVA:** 22% inclusa
- **Scadenza:** 30 giorni dalla firma
- **Link Pagamento:** Stripe checkout (da implementare)

**Email inviate:**
- 📧 Al cliente: "✅ Contratto Firmato - Proforma per Pagamento"
  - Dettagli contratto firmato
  - Proforma PDF allegato
  - Istruzioni pagamento
  - Link pagamento Stripe (quando disponibile)
- 📧 A info@: "✅ Contratto Firmato - [Codice Contratto]"
  - Nome cliente
  - Codice contratto
  - Data/ora firma
  - IP cliente

**⚠️ Importante:**
Questo workflow è stato **appena implementato** (commit 6be33c7). Prima di questo fix, la proforma doveva essere generata manualmente dopo la firma.

**Vantaggi:**
- ⚡ **Automazione completa** firma → proforma → email
- 💰 **Prezzi corretti** calcolati automaticamente
- 📧 **Email immediate** senza intervento manuale
- 📊 **Tracciamento completo** in database

**Prossimi Step dopo Firma:**
- Cliente riceve email con proforma
- Cliente clicca link pagamento Stripe
- Workflow "Pagamento Ricevuto" parte automaticamente

#### 5. **Workflow "Pagamento Ricevuto"**

**Trigger:** Stripe conferma pagamento

**Azioni automatiche:**
1. ✅ Riceve webhook da Stripe
2. ✅ Verifica autenticità webhook
3. ✅ Aggiorna stato proforma: "pagata"
4. ✅ Aggiorna stato contratto: "pagato"
5. ✅ Invia email benvenuto al cliente
6. ✅ Include link form configurazione
7. ✅ Notifica info@ pagamento ricevuto

**Email inviate:**
- 📧 Al cliente: "Benvenuto in eCura - Configura il tuo dispositivo"
- 📧 A info@: "Pagamento ricevuto - [Nome Cliente]"

#### 6. **Workflow "Configurazione Ricevuta"**

**Trigger:** Cliente compila form configurazione

**Azioni automatiche:**
1. ✅ Salva configurazione nel database
2. ✅ Valida dati contatti emergenza
3. ✅ Notifica operatore logistica
4. ✅ Email a info@ con riepilogo configurazione
5. ✅ Crea reminder "Genera DDT"

**Email inviata:**
- 📧 A info@: "Configurazione ricevuta - Pronto per DDT"

#### 7. **Workflow "Attivazione Servizio"**

**Trigger:** Operatore associa dispositivo

**Azioni automatiche:**
1. ✅ Crea record "Assistito" attivo
2. ✅ Registra data attivazione
3. ✅ Invia email conferma attivazione al cliente
4. ✅ Email richiesta fattura a commercialista
5. ✅ Notifica info@ attivazione completata
6. ✅ Programma reminder check-in 30 giorni
7. ✅ Programma reminder rinnovo 11 mesi

**Email inviate:**
- 📧 Al cliente: "Il tuo servizio eCura è attivo!"
- 📧 Al commercialista: "Richiesta emissione fattura"
- 📧 A info@: "Servizio attivato - [Nome Cliente]"

### ⚙️ Configurare i Workflow

Alcuni workflow possono essere **attivati/disattivati** dalle Impostazioni:

**Dashboard** → **Impostazioni Sistema** → **Sezione Workflow**

#### Switch Disponibili

| Switch | Nome | Funzione | Default |
|--------|------|----------|---------|
| 🔘 | **Email Notifica Info** | Invia notifica a info@ per ogni nuovo lead | ✅ ON |
| 🔘 | **Email Completamento Dati** | Invia email completamento dati al lead | ✅ ON |
| 🔘 | **Email Reminder Firma** | Invia reminder se contratto non firmato | ✅ ON |
| 🔘 | **Email Promemoria Pagamento** | Invia reminder se proforma non pagata | ✅ ON |

#### Come Attivare/Disattivare

1. **Vai a Impostazioni**
2. **Trova lo switch** che vuoi modificare
3. **Clicca sullo switch** per cambiare stato
4. **Verde = ON** (attivo)
5. **Grigio = OFF** (disattivo)
6. **Salva modifiche** automaticamente

---

## 8. CONFIGURAZIONE SISTEMA

### ⚙️ Accesso Impostazioni

**Dashboard** → **Pulsante "Impostazioni Sistema"** (icona ingranaggio)

### 🎛️ Pannello Impostazioni

```
┌────────────────────────────────────────────────┐
│  ⚙️ IMPOSTAZIONI SISTEMA                        │
├────────────────────────────────────────────────┤
│                                                 │
│  📧 WORKFLOW EMAIL                              │
│  ┌─────────────────────────────────────────┐  │
│  │ Email Notifica Info@     [🟢 ON]        │  │
│  │ Email Completamento Dati [🟢 ON]        │  │
│  │ Email Reminder Firma     [🟢 ON]        │  │
│  │ Promemoria Pagamento     [🟢 ON]        │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  🔄 IMPORT AUTOMATICI                           │
│  ┌─────────────────────────────────────────┐  │
│  │ Import IRBEMA Auto       [⚪ OFF]        │  │
│  │ Frequenza Import: [▾ Ogni 6 ore]        │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  🔔 NOTIFICHE                                   │
│  ┌─────────────────────────────────────────┐  │
│  │ Notifiche Desktop        [🟢 ON]        │  │
│  │ Suoni Notifica           [🟢 ON]        │  │
│  │ Badge Contatore          [🟢 ON]        │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  💾 BACKUP                                      │
│  ┌─────────────────────────────────────────┐  │
│  │ Ultimo backup: 08/02/2026 23:00         │  │
│  │ [📥 Scarica Backup] [🔄 Backup Ora]     │  │
│  └─────────────────────────────────────────┘  │
│                                                 │
│  [💾 Salva Modifiche] [🔄 Ripristina]          │
└────────────────────────────────────────────────┘
```

### 📧 Configurazione Email

#### Email Sender (Da chi partono le email)

- **Nome:** TeleMedCare - Medica GB
- **Email:** noreply@telemedcare.it
- **Reply-To:** info@telemedcare.it

#### Template Email

Ogni email usa un template HTML professionale con:
- 🎨 Design responsive (si adatta a mobile)
- 📱 Logo Medica GB
- 🔗 Link personalizzati
- 📞 Contatti footer
- 🔒 Link privacy e termini

### 🔐 Sicurezza e Privacy

Il sistema rispetta:
- ✅ **GDPR** - Regolamento europeo privacy
- ✅ **Crittografia** - Tutti i dati sensibili sono crittografati
- ✅ **Backup automatici** - Ogni notte alle 23:00
- ✅ **Log accessi** - Registro completo operazioni

---

## 9. IMPORT LEAD DA PARTNER (HUBSPOT/IRBEMA)

### 🤝 Cos'è l'Import da Partner?

TeleMedCare V12 importa automaticamente i lead dal **CRM HubSpot di IRBEMA**, che raccoglie le richieste dal sito **www.ecura.it** tramite form di contatto.

### 🏢 Partner Supportati

| Partner | Sistema | Import Automatico | Status |
|---------|---------|-------------------|--------|
| **IRBEMA** | HubSpot CRM | ✅ 3 Metodi Attivi | 🟢 100% Operativo |
| **AON** | API Custom | 🔄 In sviluppo | 🟡 Q2 2026 |
| **DoubleYou** | API Custom | 🔄 In sviluppo | 🟡 Q2 2026 |
| **Mondadori** | B2B Portal | 📅 Pianificato | ⚪ Q3 2026 |

---

### 🔄 TRE METODI DI SINCRONIZZAZIONE HUBSPOT

Il sistema offre **3 metodi** per importare lead da HubSpot/IRBEMA:

#### **1️⃣ METODO 1: Tasto IRBEMA (Sincronizzazione Manuale Completa)**

**Quando usarlo:** Quando vuoi fare una **sincronizzazione completa manuale** degli ultimi 7 giorni.

**Come funziona:**
1. **Apri Dashboard** → https://telemedcare-v12.pages.dev/dashboard
2. **Clicca pulsante "IRBEMA"** (arancione, in alto)
3. **Sistema importa:**
   - Lead creati negli **ultimi 7 giorni**
   - Solo lead da **Form eCura** (filtro automatico)
   - Esclude lead già presenti (no duplicati)
4. **Vedi risultato:** 
   - ✅ "Importati 5 nuovi lead da HubSpot"
   - ⏭️ "3 lead già esistenti (skipped)"

**Parametri Sincronizzazione:**
- **Finestra temporale:** Ultimi 7 giorni
- **Filtro:** `hs_object_source_detail_1 = 'Form eCura'`
- **Controllo duplicati:** Email + external_source_id
- **ID generati:** `LEAD-IRBEMA-00146`, `LEAD-IRBEMA-00147`, etc.

---

#### **2️⃣ METODO 2: CRON Giornaliero Automatico (GitHub Actions)**

**Quando funziona:** Ogni giorno alle **8:00 ora italiana** (7:00 UTC) automaticamente.

**Come funziona:**
1. **GitHub Actions** esegue workflow schedulato
2. **Verifica switch** `hubspot_auto_import_enabled` nel DB
3. **Se switch ON:**
   - Chiama `POST /api/hubspot/sync`
   - Parametri: `days=7, onlyEcura=true, dryRun=false`
   - Importa lead ultimi 7 giorni
4. **Se switch OFF:**
   - Skip sincronizzazione
   - Log: "Sync disabilitata da dashboard"

**Dove verificare:**
- **GitHub:** https://github.com/RobertoPoggi/telemedcare-v12/actions
- **Workflow:** "HubSpot Daily Sync 8:00"
- **Log completi:** Clicca su ultimo run → Job "sync-hubspot"

**Come abilitare/disabilitare:**
- Vai su: **Dashboard** → **Impostazioni** → **Import Automatici**
- **Switch "Import HubSpot Giornaliero":** ON/OFF

**Orario esecuzione:** 
- **8:00 AM** ogni giorno (ora italiana)
- **7:00 AM** UTC (configurato in `.github/workflows/hubspot-sync-cron.yml`)

---

#### **3️⃣ METODO 3: Auto-Sync al Refresh Dashboard (Ultimi 24h)**

**Quando funziona:** **Ogni volta** che apri o ricarichi la Dashboard.

**Come funziona:**
1. **Apri/Ricarica** Dashboard
2. **JavaScript automatico** chiama `POST /api/hubspot/auto-import`
3. **Importa solo:**
   - Lead creati nelle **ultime 24 ore**
   - Solo **Form eCura**
   - Esclude già importati
4. **Modalità silenziosa:**
   - Se 0 nuovi lead: **nessuna notifica** (silenzioso)
   - Se >0 nuovi lead: **Toast verde** in basso a destra
5. **Console log dettagliati:** (Apri F12 per vedere)

**Esempio log console:**
```
🤖 [AUTO-IMPORT] Script caricato e pronto
✅ [AUTO-IMPORT] DOM già caricato, eseguo executeAutoImport tra 500ms
🚀 [AUTO-IMPORT] executeAutoImport() chiamata
📡 [AUTO-IMPORT] Chiamata API: POST /api/hubspot/auto-import
📡 [AUTO-IMPORT] Response status: 200
✅ [AUTO-IMPORT] Completato: 2 importati, 0 già esistenti (09:15 - 09:45)
```

**Parametri:**
- **Finestra temporale:** Ultime **24 ore** (non più dalle 9:00)
- **Filtro:** Solo **Form eCura**
- **Intervallo minimo:** 0 minuti (sempre esegui)
- **Modalità:** Silent (no popup se 0 nuovi lead)

**Debug (se non funziona):**
1. **Apri Dashboard**
2. **Premi F12** (Developer Tools)
3. **Tab "Console"**
4. **Ricarica pagina** (Ctrl+R)
5. **Cerca log** che iniziano con `[AUTO-IMPORT]`
6. **Se non vedi log:**
   - Cache browser → Premi **Ctrl+Shift+R** (hard refresh)
   - Modalità incognito → Prova in **finestra privata**
   - Aspetta 2-3 minuti (deploy Cloudflare)

---

### 📊 CONFRONTO TRE METODI

| Aspetto | Tasto IRBEMA | CRON Giornaliero | Auto-Sync Refresh |
|---------|--------------|------------------|-------------------|
| **Trigger** | Click manuale | Automatico 8:00 | Refresh dashboard |
| **Finestra** | 7 giorni | 7 giorni | 24 ore |
| **Frequenza** | A richiesta | 1x/giorno | Ogni refresh |
| **Notifica** | ✅ Sempre | ⚠️ Solo errori | ✅ Se >0 lead |
| **Log** | Dashboard | GitHub Actions | Browser Console |
| **Controllo** | Manuale | Switch ON/OFF | Sempre attivo |
| **Uso ideale** | Sync massiva | Routine giornaliera | Monitoraggio real-time |

---

### 💡 STRATEGIA CONSIGLIATA

**Setup Ottimale per Produzione:**

1. ✅ **CRON Giornaliero:** **ABILITATO** (backup notturno)
2. ✅ **Auto-Sync Refresh:** **SEMPRE ATTIVO** (monitoraggio continuo)
3. ✅ **Tasto IRBEMA:** **Usa solo se necessario** (es: problemi CRON)

**Quando usare ciascun metodo:**

- **Auto-Sync:** Uso normale, apri dashboard più volte al giorno
- **CRON:** Backup automatico notturno se nessuno apre dashboard
- **Tasto IRBEMA:** Solo per recupero massivo o troubleshooting

---

### 🛠️ RISOLUZIONE PROBLEMI

#### **❌ Problema: Auto-Sync non importa nulla**

**Verifica passo-passo:**

1. **Console Browser (F12):**
   ```
   Cerca log: [AUTO-IMPORT]
   Se non vedi log → Cache browser (Ctrl+Shift+R)
   Se vedi "Credenziali mancanti" → Env vars non configurate
   ```

2. **Verifica Credenziali HubSpot:**
   - Dashboard Cloudflare → Pages → telemedcare-v12
   - Settings → Environment variables
   - Controlla: `HUBSPOT_ACCESS_TOKEN` e `HUBSPOT_PORTAL_ID`

3. **Verifica Switch:**
   ```
   GET https://telemedcare-v12.pages.dev/api/settings/hubspot_auto_import_enabled
   
   Risposta attesa: { "value": "true", "enabled": true }
   ```

4. **Test Manuale API:**
   ```bash
   curl -X POST https://telemedcare-v12.pages.dev/api/hubspot/auto-import \
     -H "Content-Type: application/json" \
     -d '{"enabled": true, "startHour": 0, "onlyEcura": true, "dryRun": false}'
   ```

#### **❌ Problema: CRON non esegue alle 8:00**

**Verifica:**
1. GitHub → Actions → "HubSpot Daily Sync 8:00"
2. Controlla ultimo run (deve essere giornaliero)
3. Se errore 403: Switch `hubspot_auto_import_enabled` è OFF
4. Se errore 401: Credenziali HubSpot scadute/errate

**Fix:**
- Abilita switch in Dashboard → Impostazioni
- Rigenera HUBSPOT_ACCESS_TOKEN se scaduto

#### **❌ Problema: Lead importati hanno prezzo = €0**

**Causa:** Errore nel calcolo automatico prezzi.

**Verifica Log:**
```javascript
// Console browser dopo import:
Cerca: [HUBSPOT MAPPING] Calcolo prezzi per: servizio=XXX, piano=YYY
Se vedi: "ERRORE calcolo prezzi" → Servizio/Piano non validi
```

**Fix:**
1. **Verifica servizio/piano in HubSpot:**
   - Deve essere: `servizio_ecura` = PRO/FAMILY/PREMIUM
   - Deve essere: `piano_ecura` = BASE/AVANZATO

2. **Se mancanti in HubSpot:**
   - Sistema usa default: `servizio=PRO, piano=BASE`
   - Prezzo automatico: €480 (setup) + €240 (rinnovo)

3. **Fix manuale prezzi:**
   ```
   Dashboard → Leads → Seleziona lead → Edit
   Aggiorna: Prezzo Anno e Prezzo Rinnovo
   ```

---

### 📋 Lead ID Generati

Tutti i lead importati da HubSpot hanno ID formato:
- `LEAD-IRBEMA-00146`
- `LEAD-IRBEMA-00147`
- `LEAD-IRBEMA-00148`

**Numerazione:**
- Incrementale automatica
- Parte da 00146 (se nessun lead IRBEMA esistente)
- Univoca (no duplicati possibili)

---

### 📧 Email Automatiche dopo Import

**Dopo ogni import**, il sistema invia automaticamente:

1. **📩 Email Notifica Admin** (a `info@telemedcare.it`)
   - Template: `NOTIFICA_INFO`
   - Contenuto: Nuovo lead ricevuto, nome, email, servizio

2. **📧 Email Completamento Dati** (al lead)
   - Template: `email_richiesta_completamento_form`
   - Link personale: `https://telemedcare-v12.pages.dev/api/form/{leadId}`
   - Allegato: Brochure eCura PDF
   - **Solo se switch** `lead_email_notifications_enabled` è **ON**

**Controllo invio email:**
- Dashboard → Impostazioni → Email Notifications
- Switch "Email Completamento Dati": ON/OFF

---

### 🎯 Workflow Completo dopo Import

```
1. Lead importato da HubSpot
   ↓
2. Prezzi calcolati automaticamente (servizio+piano)
   ↓
3. Email notifica admin inviata
   ↓
4. Email completamento dati al lead (con link)
   ↓
5. Lead clicca link e completa form
   ↓
6. Contratto generato automaticamente
   ↓
7. Email contratto inviata (con PDF)
   ↓
8. Lead firma contratto
   ↓
9. Proforma generata automaticamente
   ↓
10. Email proforma inviata (con link pagamento)
    ↓
11. Lead paga con Stripe
    ↓
12. Form configurazione dispositivo
    ↓
13. IMEI associato e DDT generato
    ↓
14. Email attivazione finale
```

---

### 📊 Verifica Import Riuscito

Dopo import (qualsiasi metodo):

1. **Dashboard** → **Filtro Fonte:** "IRBEMA"
2. **Vedi tutti** i lead importati
3. **Controlla campi:**
   - ✅ Nome e Cognome presenti
   - ✅ Email valida
   - ✅ Telefono (se disponibile)
   - ✅ Servizio = "eCura PRO" (o FAMILY/PREMIUM)
   - ✅ Piano = "BASE" o "AVANZATO"
   - ✅ **Prezzo Anno ≠ €0** (es: €480)
   - ✅ **Prezzo Rinnovo ≠ €0** (es: €240)
4. **Se prezzi = €0:**
   - Vedi sezione "Risoluzione Problemi" sopra
   - Oppure aggiorna manualmente i prezzi

---

## 10. DOCUMENTI E TEMPLATE

### 📄 Tipi di Documenti

Il sistema genera automaticamente questi documenti:

| Documento | Quando | Formato | Personalizzato |
|-----------|--------|---------|----------------|
| **Contratto** | Lead completa dati | PDF | ✅ Sì |
| **Proforma** | Contratto firmato | PDF | ✅ Sì |
| **DDT** | Pagamento ricevuto | PDF | ✅ Sì |
| **Fattura** | *Via commercialista* | PDF | ⚪ No |
| **Brochure** | *Già pronta* | PDF | ⚪ No |

### 📋 Template Contratto

Il contratto è generato da un **template HTML** che contiene **placeholder** sostituiti automaticamente con i dati reali del cliente.

#### Placeholder Contratto

```
{{NOME_RICHIEDENTE}} → Mario
{{COGNOME_RICHIEDENTE}} → Rossi
{{EMAIL_RICHIEDENTE}} → mario.rossi@example.com
{{TELEFONO_RICHIEDENTE}} → +39 333 1234567

{{NOME_ASSISTITO}} → Giulia
{{COGNOME_ASSISTITO}} → Rossi
{{CF_ASSISTITO}} → RSSGLL45A01F205X
{{DATA_NASCITA_ASSISTITO}} → 01/01/1945
{{INDIRIZZO_ASSISTITO}} → Via Roma 123
{{CAP_ASSISTITO}} → 20100
{{CITTA_ASSISTITO}} → Milano

{{SERVIZIO}} → eCura PRO
{{PIANO}} → BASE
{{PREZZO_PRIMO_ANNO}} → 480,00 €
{{PREZZO_ANNI_SUCCESSIVI}} → 200,00 €

{{DATA_CONTRATTO}} → 08/02/2026
{{CODICE_CONTRATTO}} → CONTR-ECURA-00123
{{DISPOSITIVO}} → SiDLY Care PRO
```

#### Personalizzazione Contratto

Il contratto contiene:
- ✅ Logo Medica GB
- ✅ Intestazione con dati azienda
- ✅ Dati cliente completi
- ✅ Descrizione servizio scelto
- ✅ Prezzi (1° anno + rinnovo)
- ✅ Condizioni contrattuali
- ✅ Spazio firma elettronica
- ✅ Footer con contatti

### 💰 Template Proforma

La proforma è generata con:

```
PROFORMA N. {{NUMERO_PROFORMA}}
Data Emissione: {{DATA_EMISSIONE}}

CLIENTE:
{{NOME_CLIENTE}} {{COGNOME_CLIENTE}}
{{INDIRIZZO_COMPLETO}}
{{CAP}} {{CITTA}} ({{PROVINCIA}})
CF: {{CF_CLIENTE}}

DESCRIZIONE:
{{DESCRIZIONE_SERVIZIO}}
(es: Servizio eCura PRO - Piano BASE - Durata 12 mesi)

IMPORTO:
Quantità: 1
Prezzo Unitario: {{PREZZO_UNITARIO}} €
Totale: {{TOTALE_DOCUMENTO}} €
IVA: Esente Art. 10

PAGAMENTO:
IBAN: {{IBAN}}
Intestatario: {{INTESTATARIO}}
Causale: {{NUMERO_PROFORMA}} - {{NOME_CLIENTE}}
Scadenza: {{SCADENZA_PAGAMENTO}}
```

### 📦 DDT (Documento di Trasporto)

Il DDT include:

- Mittente: Medica GB S.r.l.
- Destinatario: Cliente
- Descrizione merce: 1x Dispositivo SiDLY Care PRO
- Numero colli: 1
- Corriere: GLS/BRT/DHL
- Tracking number: XXX
- Causale: Vendita
- Numero seriale dispositivo

### 📥 Scaricare Documenti

Per scaricare qualsiasi documento:

1. **Apri Dettagli Lead/Cliente**
2. **Sezione "Documenti"**
3. **Clicca nome documento** (es: [📄 Contratto])
4. **PDF si apre** nel browser
5. **Salva** con Ctrl+S o tasto destro

---

## 11. REPORT E STATISTICHE

### 📊 Tipi di Report

Il sistema genera automaticamente questi report:

#### 1. **Report Giornaliero**

Ogni giorno alle 23:00:
- Numero lead ricevuti oggi
- Numero contratti inviati
- Numero firme ricevute
- Numero pagamenti ricevuti
- Conversion rate del giorno

#### 2. **Report Settimanale**

Ogni lunedì mattina:
- Riassunto settimana precedente
- Trend lead in crescita/decrescita
- Lead in attesa da più di 7 giorni
- Top 3 fonti lead
- Conversion funnel completo

#### 3. **Report Mensile**

Primo giorno del mese:
- Totali del mese precedente
- Confronto con mesi precedenti
- Fatturato mensile
- Clienti attivati
- Clienti in scadenza prossimo mese
- Previsioni rinnovi

### 📈 Grafici Dashboard

#### Grafico Conversioni

Mostra il funnel completo:
- Lead acquisiti
- Contratti generati
- Contratti firmati
- Pagamenti ricevuti
- Servizi attivati

**Formula Conversion Rate:**
```
Conversion Rate = (Clienti Attivi / Lead Totali) × 100
```

Esempio:
- Lead Totali: 125
- Clienti Attivi: 68
- Conversion Rate: 54,4%

#### Grafico Fonti Lead

Mostra da dove arrivano i lead:
- 🌐 WEB: 45%
- 🤝 IRBEMA: 30%
- 👥 NETWORKING: 15%
- 🏛️ VIGILANZA: 10%

#### Grafico Servizi

Distribuzione richieste per servizio:
- eCura PRO BASE: 40%
- eCura PRO AVANZATO: 35%
- eCura FAMILY BASE: 15%
- eCura FAMILY AVANZATO: 10%

### 📥 Esportare Dati

Per esportare dati in Excel/CSV:

1. **Leads Dashboard** → **Applica filtri** desiderati
2. **Clicca "Esporta CSV"** in alto a destra
3. **File CSV si scarica** automaticamente
4. **Apri con Excel** o Google Sheets

Il CSV contiene tutte le colonne:
- Lead ID
- Nome, Cognome, Email, Telefono
- Servizio, Piano, Stato
- Data acquisizione
- Fonte
- Prezzo

---

## 12. DOMANDE FREQUENTI (FAQ)

### ❓ Domande Generali

#### **Q: Il sistema è sempre online?**
**A:** Sì, il sistema è ospitato su Cloudflare Pages con uptime 99.9%. È accessibile 24/7 da qualsiasi dispositivo.

#### **Q: Serve un login per accedere?**
**A:** No, il sistema non richiede login. Tuttavia si consiglia di configurare autenticazione per produzione.

#### **Q: Posso usarlo da smartphone?**
**A:** Sì, il sistema è completamente responsive e funziona perfettamente su smartphone e tablet.

#### **Q: Quanti utenti possono usarlo contemporaneamente?**
**A:** Illimitati. Non ci sono limiti di utenti simultanei.

### ❓ Lead e Richieste

#### **Q: Come faccio a sapere se arriva un nuovo lead?**
**A:** Il sistema invia automaticamente una email a info@telemedcare.it per ogni nuovo lead.

#### **Q: Posso modificare i dati di un lead?**
**A:** Sì, apri i Dettagli Lead e clicca "Modifica". Puoi aggiornare qualsiasi campo.

#### **Q: Cosa succede se un lead non completa i dati?**
**A:** Il sistema invia automaticamente reminder dopo 3 e 7 giorni.

#### **Q: Posso eliminare un lead?**
**A:** Sì, ma solo lead nello stato "Nuovo". Lead con contratto o già convertiti non possono essere eliminati per motivi legali.

### ❓ Contratti e Firma

#### **Q: Il contratto è legalmente valido?**
**A:** Sì, il sistema registra tutti i metadati necessari (data, ora, IP, firma) per validità legale in Italia.

#### **Q: Il cliente può firmare da smartphone?**
**A:** Sì, la firma funziona perfettamente su touch screen (smartphone/tablet).

#### **Q: Cosa succede se il cliente non firma?**
**A:** Dopo 5 giorni senza firma, il sistema invia un reminder automatico.

#### **Q: Posso rigenerare un contratto?**
**A:** Sì, se ci sono errori puoi rigenerare il contratto dai Dettagli Lead.

### ❓ Pagamenti

#### **Q: Quali metodi di pagamento sono supportati?**
**A:** Attualmente Stripe (carta credito/SEPA). In futuro anche bonifico bancario.

#### **Q: Come so se il cliente ha pagato?**
**A:** Ricevi una email automatica e lo stato cambia in "Pagamento Ricevuto".

#### **Q: Posso emettere rimborsi?**
**A:** Sì, tramite dashboard Stripe (link in Impostazioni).

### ❓ Import Partner

#### **Q: L'import IRBEMA funziona sempre?**
**A:** Sì, ma richiede che le API HubSpot siano attive e il token valido.

#### **Q: Cosa succede se importo lo stesso lead due volte?**
**A:** Il sistema riconosce i duplicati e non importa lo stesso lead due volte.

#### **Q: Posso vedere l'ultimo import?**
**A:** Sì, in Dashboard c'è la data e ora dell'ultimo import IRBEMA.

### ❓ Email

#### **Q: Le email arrivano sempre?**
**A:** Sì, il sistema usa provider professionali (Resend + SendGrid) con delivery rate >99%.

#### **Q: Posso personalizzare i template email?**
**A:** Sì, ma richiede modifiche tecniche. Contatta il supporto tecnico.

#### **Q: Cosa succede se un'email non viene consegnata?**
**A:** Il sistema registra l'errore nei log e ritenta l'invio dopo 1 ora.

---

## 13. RISOLUZIONE PROBLEMI

### 🔧 Problemi Comuni

#### ❌ Problema: "Dashboard non si carica"

**Sintomi:**
- Pagina bianca
- Errore "Impossibile connettersi"
- Caricamento infinito

**Soluzioni:**
1. ✅ **Verifica connessione internet**
   - Apri un altro sito (es: google.com)
   - Se Google funziona, il problema è del sistema
2. ✅ **Aggiorna la pagina**
   - Premi `Ctrl + F5` (Windows) o `Cmd + Shift + R` (Mac)
3. ✅ **Cancella cache browser**
   - Chrome: Impostazioni → Privacy → Cancella dati navigazione
   - Firefox: Opzioni → Privacy → Cancella cronologia
4. ✅ **Prova altro browser**
   - Se funziona su Chrome ma non Firefox, problema browser-specific
5. ✅ **Controlla status sistema**
   - Vai a: https://telemedcare-v12.pages.dev/api/system/health
   - Dovrebbe rispondere: `{"status": "online"}`

#### ❌ Problema: "Lead non viene salvato"

**Sintomi:**
- Form non si invia
- Messaggio errore "Salvataggio fallito"
- Lead non appare in lista

**Soluzioni:**
1. ✅ **Controlla campi obbligatori**
   - Nome, Cognome, Email, Telefono sono obbligatori
   - Email deve essere valida (es: nome@dominio.com)
2. ✅ **Verifica formato telefono**
   - Deve iniziare con + e numero (es: +39 333 1234567)
3. ✅ **Riprova dopo 1 minuto**
   - Potrebbe essere un problema temporaneo
4. ✅ **Copia i dati**
   - Salva i dati in un file di testo
   - Ricarica la pagina
   - Riprova l'inserimento

#### ❌ Problema: "Email non arrivano"

**Sintomi:**
- Cliente dice di non aver ricevuto email
- Email notifica non arriva a info@

**Soluzioni:**
1. ✅ **Controlla spam/posta indesiderata**
   - Email automatiche spesso finiscono in spam
   - Aggiungi noreply@telemedcare.it ai contatti sicuri
2. ✅ **Verifica indirizzo email**
   - Controlla che sia scritto correttamente
   - No spazi prima/dopo
3. ✅ **Controlla log invii**
   - Dettagli Lead → Sezione "Email Inviate"
   - Vedi se email risulta inviata
4. ✅ **Reinvia email manualmente**
   - Dettagli Lead → Clicca "Reinvia Email"

#### ❌ Problema: "Import IRBEMA non funziona"

**Sintomi:**
- Cliccando "IRBEMA" non succede nulla
- Messaggio errore "Connessione fallita"
- Zero lead importati

**Soluzioni:**
1. ✅ **Verifica token HubSpot**
   - Vai in Impostazioni → Integrazioni
   - Controlla che token sia valido
2. ✅ **Riprova dopo qualche minuto**
   - API HubSpot potrebbe essere temporaneamente down
3. ✅ **Controlla filtri import**
   - Forse non ci sono nuovi lead che rispettano i criteri
4. ✅ **Contatta supporto**
   - Se problema persiste > 24 ore

#### ❌ Problema: "Contratto non si genera"

**Sintomi:**
- Cliccando "Genera Contratto" → Errore
- Lead rimane in stato "Dati Completi"
- Nessuna email inviata

**Soluzioni:**
1. ✅ **Verifica completezza dati**
   - Apri Dettagli Lead
   - Controlla che TUTTI i campi siano compilati:
     - Nome, Cognome, CF assistito
     - Indirizzo completo
     - Data nascita
2. ✅ **Riprova generazione**
   - Dettagli Lead → "Rigenera Contratto"
3. ✅ **Controlla log errori**
   - In fondo alla pagina c'è sezione "Log Sistema"
   - Vedi se ci sono errori

#### ❌ Problema: "Firma non si salva"

**Sintomi:**
- Cliente firma ma riceve errore
- Firma non appare in Dettagli Lead
- Stato non cambia in "Firmato"

**Soluzioni:**
1. ✅ **Riprova firma**
   - Reinvia link firma al cliente
   - Cliente deve firmare su canvas e cliccare "Invia"
2. ✅ **Usa altro browser**
   - Alcuni browser vecchi non supportano canvas HTML5
   - Consigliare Chrome o Firefox aggiornati
3. ✅ **Disattiva blocca popup**
   - Alcuni popup blocker impediscono il salvataggio
4. ✅ **Verifica connessione cliente**
   - Cliente deve avere internet stabile durante firma

### 📞 Quando Contattare Supporto

Contatta **info@telemedcare.it** se:
- ❌ Problema persiste dopo tutte le soluzioni
- ❌ Errore critico che blocca il lavoro
- ❌ Dati persi o danneggiati
- ❌ Sistema completamente offline
- ❌ Problemi di sicurezza o accessi non autorizzati

**Includi sempre:**
- 📝 Descrizione dettagliata problema
- 🖥️ Browser e versione usati
- ⏰ Quando è successo (data e ora)
- 📸 Screenshot dell'errore (se possibile)
- 🆔 Lead ID coinvolto (se applicabile)

---

## 📚 GLOSSARIO

| Termine | Significato |
|---------|-------------|
| **Lead** | Richiesta di informazioni o servizio non ancora convertita in cliente |
| **Assistito** | Persona che riceve il servizio TeleAssistenza |
| **Richiedente** | Persona che compila il form (può essere diversa dall'assistito) |
| **Workflow** | Sequenza automatica di azioni eseguite dal sistema |
| **Template** | Modello di documento o email con placeholder da sostituire |
| **Placeholder** | Segnaposto nel template (es: {{NOME}}) sostituito con valore reale |
| **Proforma** | Documento di pagamento preliminare (prima della fattura) |
| **DDT** | Documento Di Trasporto (accompagna la merce spedita) |
| **Conversion Rate** | Percentuale di lead che diventano clienti attivi |
| **Funnel** | Imbuto di conversione: Lead → Contratto → Firma → Pagamento → Attivo |
| **Backend** | Parte del sistema che gira sul server (invisibile all'utente) |
| **Frontend** | Parte del sistema visibile (interfaccia grafica) |
| **Dashboard** | Cruscotto con statistiche e comandi principali |
| **API** | Interfaccia di programmazione per comunicazione tra sistemi |
| **Webhook** | Notifica automatica da sistema esterno (es: Stripe) |
| **Token** | Codice sicuro univoco per link personalizzati |
| **Canvas** | Area disegno HTML5 per firma elettronica |
| **Responsive** | Design che si adatta a diverse dimensioni schermo |
| **Cloudflare** | Servizio hosting utilizzato per il sistema |
| **D1** | Database cloud di Cloudflare |
| **GDPR** | Regolamento europeo sulla protezione dati personali |

---

## 📝 NOTE FINALI

### 🎓 Formazione Consigliata

Per usare al meglio il sistema:
1. **Leggi questo manuale** per intero (20-30 minuti)
2. **Esplora la Dashboard** senza paura (non puoi rompere nulla)
3. **Prova con dati di test** prima di usare dati reali
4. **Consulta le FAQ** quando hai dubbi
5. **Contatta supporto** per problemi persistenti

### 🔄 Aggiornamenti Sistema

Il sistema viene aggiornato regolarmente. Quando c'è un aggiornamento:
- ✅ Vedi notifica in Dashboard
- ✅ Aggiornamento automatico (no azioni richieste)
- ✅ Nuove funzioni disponibili subito
- ✅ Changelog visibile in Impostazioni

### 📊 Monitoraggio Prestazioni

Il sistema traccia automaticamente:
- ⏱️ Tempi di risposta (devono essere <2 secondi)
- ✉️ Email deliverability (>99%)
- 💾 Spazio storage utilizzato
- 🔄 Uptime sistema (>99.9%)

### 🆘 Supporto Prioritario

Per problemi urgenti:
- 📧 Email: info@telemedcare.it
- 📞 Telefono: +39 XX XXXX XXXX (orari ufficio)
- 💬 Chat: In Dashboard (prossimamente)

---

## 📝 CHANGELOG ULTIMI AGGIORNAMENTI

### **🔥 9 Febbraio 2026 - V12.0.3 (OGGI)**

#### ✨ **Nuove Funzionalità**

1. **🔄 Auto-Sync Dashboard con HubSpot**
   - Import automatico lead ogni volta che apri/ricarichi dashboard
   - Finestra: Ultimi 24 ore
   - Modalità silenziosa (no notifiche se 0 nuovi lead)
   - Logging dettagliato in console browser (F12)

2. **⚡ Trigger Automatico Proforma dopo Firma**
   - Proforma generata automaticamente appena contratto firmato
   - Calcolo prezzi automatico da servizio + piano
   - Email proforma inviata immediatamente al cliente
   - Salvato in database (tabella proformas)

3. **💰 Calcolo Automatico Prezzi Lead Import**
   - Prezzi calcolati automaticamente da servizio+piano HubSpot
   - Supporto FAMILY, PRO, PREMIUM + BASE/AVANZATO
   - Logging dettagliato per troubleshooting

#### 🐛 **Bug Fix**

1. Prezzi lead importati = €0 → Risolto con logging e gestione errori
2. Auto-Sync non parte al refresh → Aggiunto debug completo

#### 📖 **Documentazione Aggiunta**

- INTEGRAZIONE_HUBSPOT_COMPLETA.md (10.5 KB)
- STRATEGIA_IMPLEMENTAZIONE_COMPLETA.md (18 KB)
- DATABASE_SCHEMA_MULTICANALE.md (11 KB)
- PIANO_OPERATIVO_MULTICANALE.md (11 KB)
- Manuale Utente aggiornato (Sezione 9 completamente riscritta)

#### 🎯 **Progresso Workflow End-to-End**

**Completato:** 85% (+10% questa sessione)

- ✅ Steps 1-9: 100% funzionanti
- 🔄 Steps 10-14: In completamento (Stripe, IMEI, DDT)

---

## ✅ CHECKLIST RAPIDA OPERATORE

Copia questa checklist per uso quotidiano:

### **Al Mattino**
- [ ] Apri Dashboard
- [ ] Controlla nuovi lead notturni
- [ ] Clicca "IRBEMA" per import giornaliero
- [ ] Verifica lead in attesa > 3 giorni
- [ ] Controlla email notifiche ricevute

### **Durante il Giorno**
- [ ] Rispondi a eventuali richieste info lead
- [ ] Controlla contratti da firmare in attesa
- [ ] Verifica pagamenti ricevuti oggi
- [ ] Controlla configurazioni da processare
- [ ] Genera DDT per pagamenti confermati

### **Prima di Chiudere**
- [ ] Verifica tutti i lead oggi gestiti
- [ ] Controlla statistiche giornaliere
- [ ] Pianifica follow-up per domani
- [ ] Backup dati (automatico alle 23:00)

---

**Fine Manuale Utente TeleMedCare V12**

*Documento versione 1.1 - 9 Febbraio 2026 (Aggiornato)*
*Per supporto: info@telemedcare.it*
*Sito: https://telemedcare-v12.pages.dev/*
*GitHub: https://github.com/RobertoPoggi/telemedcare-v12*
*Per supporto: info@telemedcare.it*
*Sito: https://telemedcare-v12.pages.dev/*
