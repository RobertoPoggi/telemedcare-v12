# Sistema di Tracciamento Interazioni Lead

## 📋 Panoramica

Il sistema di tracciamento interazioni permette di tenere uno storico completo di tutti i contatti con ogni lead, includendo:
- **Data** dell'interazione
- **Tipo** di contatto (telefono, email, whatsapp, meeting, etc.)
- **Nota** descrittiva
- **Azione** intrapresa o da intraprendere
- **Operatore** che ha gestito il contatto

## 🗄️ Struttura Database

### Tabella `leads` - Nuova Colonna
```sql
ALTER TABLE leads ADD COLUMN cm TEXT DEFAULT NULL;
```
- **cm**: Contact Manager - Nome della persona responsabile del lead

### Tabella `lead_interactions`
```sql
CREATE TABLE lead_interactions (
  id TEXT PRIMARY KEY,              -- INT-{timestamp}
  lead_id TEXT NOT NULL,            -- LEAD-IRBEMA-00001
  data TEXT NOT NULL,               -- 2026-02-12T22:30:00.000Z
  tipo TEXT NOT NULL,               -- telefono, email, whatsapp, meeting
  nota TEXT,                        -- Descrizione del contatto
  azione TEXT,                      -- Azione intrapresa/pianificata
  operatore TEXT,                   -- Nome operatore
  created_at TEXT NOT NULL,
  FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);
```

## 🔌 API Endpoints

### 1. Aggiorna Contact Manager
**PUT** `/api/leads/:id/cm`

```bash
curl -X PUT https://telemedcare-v12.pages.dev/api/leads/LEAD-IRBEMA-00001/cm \
  -H "Content-Type: application/json" \
  -d '{"cm": "Mario Rossi"}'
```

**Response:**
```json
{
  "success": true,
  "leadId": "LEAD-IRBEMA-00001",
  "cm": "Mario Rossi"
}
```

### 2. Aggiungi Interazione
**POST** `/api/leads/:id/interactions`

```bash
curl -X POST https://telemedcare-v12.pages.dev/api/leads/LEAD-IRBEMA-00001/interactions \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "telefono",
    "nota": "Chiamato cliente per chiarimenti sul piano AVANZATO",
    "azione": "Inviare brochure via email",
    "operatore": "Mario Rossi"
  }'
```

**Response:**
```json
{
  "success": true,
  "interaction": {
    "id": "INT-1770935052188",
    "lead_id": "LEAD-IRBEMA-00001",
    "data": "2026-02-12T22:30:52.188Z",
    "tipo": "telefono",
    "nota": "Chiamato cliente per chiarimenti sul piano AVANZATO",
    "azione": "Inviare brochure via email",
    "operatore": "Mario Rossi"
  }
}
```

### 3. Ottieni Storico Interazioni
**GET** `/api/leads/:id/interactions`

```bash
curl https://telemedcare-v12.pages.dev/api/leads/LEAD-IRBEMA-00001/interactions
```

**Response:**
```json
{
  "success": true,
  "interactions": [
    {
      "id": "INT-1770935052188",
      "lead_id": "LEAD-IRBEMA-00001",
      "data": "2026-02-12T22:30:52.188Z",
      "tipo": "telefono",
      "nota": "Chiamato cliente per chiarimenti sul piano AVANZATO",
      "azione": "Inviare brochure via email",
      "operatore": "Mario Rossi",
      "created_at": "2026-02-12T22:30:52.188Z"
    },
    {
      "id": "INT-1770934800000",
      "lead_id": "LEAD-IRBEMA-00001",
      "data": "2026-02-12T22:20:00.000Z",
      "tipo": "email",
      "nota": "Inviata presentazione servizi",
      "azione": "Follow-up tra 3 giorni",
      "operatore": "Laura Bianchi",
      "created_at": "2026-02-12T22:20:00.000Z"
    }
  ]
}
```

## 📊 Tipi di Interazione Consigliati

- **telefono**: Chiamata telefonica
- **email**: Comunicazione via email
- **whatsapp**: Messaggio WhatsApp
- **sms**: Messaggio SMS
- **meeting**: Incontro di persona
- **videocall**: Videochiamata (Zoom, Meet, etc.)
- **nota**: Nota interna senza contatto diretto
- **follow-up**: Attività di follow-up

## 💡 Casi d'Uso

### Esempio 1: Primo Contatto
```json
{
  "tipo": "telefono",
  "nota": "Primo contatto. Cliente interessato a eCura FAMILY. Ha chiesto info su prezzi e copertura geografica.",
  "azione": "Inviare preventivo personalizzato via email",
  "operatore": "Mario Rossi"
}
```

### Esempio 2: Follow-up
```json
{
  "tipo": "email",
  "nota": "Inviato preventivo e brochure. Cliente vuole pensarci per qualche giorno.",
  "azione": "Richiamare tra 3 giorni per feedback",
  "operatore": "Mario Rossi"
}
```

### Esempio 3: Chiusura
```json
{
  "tipo": "telefono",
  "nota": "Cliente ha deciso di procedere con piano AVANZATO. Firmato contratto.",
  "azione": "Preparare documentazione e attivazione servizio",
  "operatore": "Laura Bianchi"
}
```

### Esempio 4: Nota Interna
```json
{
  "tipo": "nota",
  "nota": "Cliente ha richiesto di essere ricontattato a Settembre. È in ferie fino ad allora.",
  "azione": "Reminder automatico per 1° Settembre",
  "operatore": "Sistema"
}
```

## 🔄 Workflow Consigliato

1. **Assegnazione Lead**: Assegna il Contact Manager
   ```bash
   PUT /api/leads/LEAD-IRBEMA-00001/cm
   {"cm": "Mario Rossi"}
   ```

2. **Primo Contatto**: Registra la prima interazione
   ```bash
   POST /api/leads/LEAD-IRBEMA-00001/interactions
   {"tipo": "telefono", "nota": "...", "azione": "...", "operatore": "Mario Rossi"}
   ```

3. **Follow-up**: Aggiungi ogni successivo contatto
   ```bash
   POST /api/leads/LEAD-IRBEMA-00001/interactions
   {"tipo": "email", "nota": "...", "azione": "...", "operatore": "Mario Rossi"}
   ```

4. **Review**: Consulta lo storico completo
   ```bash
   GET /api/leads/LEAD-IRBEMA-00001/interactions
   ```

## 📈 Metriche Possibili

Con questo sistema puoi tracciare:
- **Numero di contatti** per lead
- **Tempo medio** tra primo contatto e conversione
- **Tipo di interazione** più efficace
- **Performance** per operatore
- **Lead warming** (numero di touch point necessari)
- **Lead abandonment** (ultimo contatto > X giorni fa)

## 🎯 Prossimi Sviluppi Suggeriti

1. **UI Dashboard** per visualizzare interazioni
2. **Timeline visuale** per ogni lead
3. **Reminder automatici** per follow-up
4. **Export Excel** dello storico
5. **Statistiche** per operatore
6. **CRM integrato** nella dashboard lead

## 🚀 Deployment

Le modifiche sono state deployate su:
- **Production**: https://telemedcare-v12.pages.dev
- **Commit**: 2e431f7

La migrazione del database avverrà automaticamente al primo riavvio dell'applicazione.
