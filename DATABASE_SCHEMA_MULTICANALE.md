# 🗄️ Database Schema Multi-Canale - TeleMedCare V12

## Aggiornamenti Necessari per Multi-Canale

### 1. Tabella LEADS - Campi Aggiuntivi

```sql
-- Aggiungere campi per gestione multi-canale
ALTER TABLE leads ADD COLUMN canale TEXT DEFAULT 'PRIVATI'; 
  -- 'PRIVATI', 'WELFARE_AZIENDA', 'WELFARE_PROVIDER', 'VIGILANZA', 'BADANTI'

ALTER TABLE leads ADD COLUMN partner_id TEXT;
  -- ID partner (IRBEMA, AON, DOUBLEYOU, ENDERED, società vigilanza, etc.)

ALTER TABLE leads ADD COLUMN codice_convenzione TEXT;
  -- Codice convenzione aziendale o welfare

ALTER TABLE leads ADD COLUMN azienda_dipendente TEXT;
  -- Nome azienda se canale welfare (Mondadori, Luxottica, etc.)

ALTER TABLE leads ADD COLUMN codice_dipendente TEXT;
  -- Matricola dipendente per welfare aziendale

ALTER TABLE leads ADD COLUMN sconto_applicato REAL DEFAULT 0;
  -- % sconto per convenzioni

ALTER TABLE leads ADD COLUMN tipo_fatturazione TEXT DEFAULT 'CLIENTE_DIRETTO';
  -- 'CLIENTE_DIRETTO', 'WELFARE_CREDITI', 'AZIENDA_RIMBORSA', 'PARTNER_FATTURA'

ALTER TABLE leads ADD COLUMN referral_source TEXT;
  -- Chi ha referenziato (es. badante, società vigilanza)

-- Campi tracking campagne digital (già discussi)
ALTER TABLE leads ADD COLUMN utm_source TEXT;
ALTER TABLE leads ADD COLUMN utm_medium TEXT;
ALTER TABLE leads ADD COLUMN utm_campaign TEXT;
ALTER TABLE leads ADD COLUMN utm_content TEXT;
ALTER TABLE leads ADD COLUMN utm_term TEXT;
```

---

### 2. Nuova Tabella: PARTNERS

```sql
CREATE TABLE partners (
  id TEXT PRIMARY KEY,
  tipo_partner TEXT NOT NULL, 
    -- 'DIGITAL_MARKETING', 'WELFARE_PROVIDER', 'AZIENDA_DIRETTA', 'VIGILANZA', 'BADANTI', 'FARMACIA', 'ASSICURAZIONE'
  
  nome_partner TEXT NOT NULL,
  ragione_sociale TEXT,
  partita_iva TEXT,
  
  -- Contatti
  referente_nome TEXT,
  referente_email TEXT,
  referente_telefono TEXT,
  
  -- Commerciali
  commissione_percentuale REAL DEFAULT 0, -- % su vendita
  commissione_fissa REAL DEFAULT 0, -- € fissi per lead convertito
  sconto_clienti REAL DEFAULT 0, -- % sconto per clienti partner
  
  -- Integrazione tecnica
  api_key TEXT, -- Per integrazioni API
  webhook_url TEXT, -- Notifiche eventi
  codici_convenzione TEXT, -- JSON array codici validi
  
  -- Contratto
  contratto_firmato BOOLEAN DEFAULT 0,
  data_firma_contratto TEXT,
  data_inizio_validita TEXT,
  data_fine_validita TEXT,
  
  -- Metriche
  lead_totali INTEGER DEFAULT 0,
  lead_convertiti INTEGER DEFAULT 0,
  revenue_totale REAL DEFAULT 0,
  commissioni_pagate REAL DEFAULT 0,
  
  status TEXT DEFAULT 'ATTIVO', -- 'ATTIVO', 'SOSPESO', 'TERMINATO'
  note TEXT,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indici per performance
CREATE INDEX idx_partners_tipo ON partners(tipo_partner);
CREATE INDEX idx_partners_status ON partners(status);
```

---

### 3. Nuova Tabella: AZIENDE_WELFARE

```sql
CREATE TABLE aziende_welfare (
  id TEXT PRIMARY KEY,
  nome_azienda TEXT NOT NULL,
  ragione_sociale TEXT,
  partita_iva TEXT,
  
  -- Tipo contratto
  tipo_contratto TEXT, -- 'CONVENZIONE_DIRETTA', 'TRAMITE_PROVIDER'
  provider_welfare_id TEXT, -- FK a partners (se tramite provider)
  
  -- Contatti HR
  hr_referente_nome TEXT,
  hr_referente_email TEXT,
  hr_referente_telefono TEXT,
  
  -- Termini commerciali
  sconto_dipendenti REAL DEFAULT 10, -- % sconto
  numero_dipendenti INTEGER,
  budget_welfare_annuale REAL,
  
  -- Fatturazione
  tipo_pagamento TEXT, -- 'DIPENDENTE_DIRETTO', 'AZIENDA_RIMBORSA', 'CREDITI_WELFARE'
  giorni_pagamento INTEGER DEFAULT 60, -- gg pagamento fattura
  
  -- Contratto
  contratto_attivo BOOLEAN DEFAULT 1,
  data_inizio_contratto TEXT,
  data_scadenza_contratto TEXT,
  
  -- Metriche
  dipendenti_attivati INTEGER DEFAULT 0,
  revenue_totale REAL DEFAULT 0,
  
  -- Comunicazione
  newsletter_interna_inviata BOOLEAN DEFAULT 0,
  data_ultimo_report TEXT,
  
  status TEXT DEFAULT 'ATTIVO',
  note TEXT,
  
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_aziende_tipo ON aziende_welfare(tipo_contratto);
CREATE INDEX idx_aziende_provider ON aziende_welfare(provider_welfare_id);
```

---

### 4. Nuova Tabella: LEAD_PARTNER_TRACKING

```sql
-- Traccia commissioni e referral per partner
CREATE TABLE lead_partner_tracking (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  
  -- Dati acquisizione
  data_lead TEXT DEFAULT (datetime('now')),
  fonte_dettaglio TEXT, -- URL landing, codice promo, etc.
  
  -- Commissioni
  commissione_tipo TEXT, -- 'PERCENTUALE', 'FISSA', 'NESSUNA'
  commissione_importo REAL DEFAULT 0,
  commissione_pagata BOOLEAN DEFAULT 0,
  data_pagamento_commissione TEXT,
  
  -- Tracking conversione
  lead_convertito BOOLEAN DEFAULT 0,
  data_conversione TEXT,
  valore_vendita REAL DEFAULT 0,
  
  note TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_tracking_lead ON lead_partner_tracking(lead_id);
CREATE INDEX idx_tracking_partner ON lead_partner_tracking(partner_id);
CREATE INDEX idx_tracking_pagato ON lead_partner_tracking(commissione_pagata);
```

---

### 5. Aggiornamento Tabella CONTRACTS

```sql
-- Aggiungere campi per gestione multi-canale
ALTER TABLE contracts ADD COLUMN canale TEXT DEFAULT 'PRIVATI';
ALTER TABLE contracts ADD COLUMN partner_id TEXT;
ALTER TABLE contracts ADD COLUMN codice_convenzione TEXT;
ALTER TABLE contracts ADD COLUMN sconto_percentuale REAL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN sconto_importo REAL DEFAULT 0;
ALTER TABLE contracts ADD COLUMN prezzo_listino REAL; -- Prezzo base prima sconto
ALTER TABLE contracts ADD COLUMN prezzo_finale REAL; -- Prezzo dopo sconto
```

---

### 6. Aggiornamento Tabella PROFORMAS

```sql
-- Aggiungere riferimenti partner e sconti
ALTER TABLE proformas ADD COLUMN partner_id TEXT;
ALTER TABLE proformas ADD COLUMN codice_convenzione TEXT;
ALTER TABLE proformas ADD COLUMN sconto_percentuale REAL DEFAULT 0;
ALTER TABLE proformas ADD COLUMN sconto_importo REAL DEFAULT 0;
ALTER TABLE proformas ADD COLUMN note_fatturazione TEXT; 
  -- Es. "Fattura da inviare ad AON Flex per conto dipendente"
```

---

## 📊 Query Utili Multi-Canale

### Lead per Canale
```sql
SELECT 
  canale,
  COUNT(*) as totale_lead,
  SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as clienti_attivi,
  ROUND(AVG(CASE WHEN status = 'ACTIVE' THEN 1.0 ELSE 0 END) * 100, 2) as conversion_rate
FROM leads
GROUP BY canale
ORDER BY totale_lead DESC;
```

### Performance Partner
```sql
SELECT 
  p.nome_partner,
  p.tipo_partner,
  COUNT(lpt.id) as lead_totali,
  SUM(CASE WHEN lpt.lead_convertito = 1 THEN 1 ELSE 0 END) as lead_convertiti,
  ROUND(SUM(lpt.commissione_importo), 2) as commissioni_dovute,
  ROUND(SUM(CASE WHEN lpt.commissione_pagata = 1 THEN lpt.commissione_importo ELSE 0 END), 2) as commissioni_pagate
FROM partners p
LEFT JOIN lead_partner_tracking lpt ON lpt.partner_id = p.id
WHERE p.status = 'ATTIVO'
GROUP BY p.id
ORDER BY lead_totali DESC;
```

### Revenue per Canale e Partner
```sql
SELECT 
  l.canale,
  p.nome_partner,
  COUNT(DISTINCT l.id) as clienti,
  SUM(c.prezzo_finale) as revenue_totale,
  ROUND(AVG(c.prezzo_finale), 2) as avg_order_value
FROM leads l
INNER JOIN contracts c ON c.leadId = l.id
LEFT JOIN partners p ON p.id = l.partner_id
WHERE c.status = 'SIGNED'
GROUP BY l.canale, p.nome_partner
ORDER BY revenue_totale DESC;
```

### Aziende Welfare Top Performer
```sql
SELECT 
  aw.nome_azienda,
  aw.dipendenti_attivati,
  aw.revenue_totale,
  ROUND(aw.revenue_totale / NULLIF(aw.dipendenti_attivati, 0), 2) as revenue_per_dipendente,
  COUNT(l.id) as lead_totali,
  ROUND(COUNT(l.id) * 1.0 / NULLIF(aw.numero_dipendenti, 0) * 100, 2) as penetrazione_percentuale
FROM aziende_welfare aw
LEFT JOIN leads l ON l.azienda_dipendente = aw.nome_azienda
WHERE aw.contratto_attivo = 1
GROUP BY aw.id
ORDER BY revenue_totale DESC;
```

---

## 🔄 Workflow Modifiche per Multi-Canale

### Acquisizione Lead con Codice Convenzione

```typescript
// Esempio: Lead da welfare provider AON
const leadData = {
  nomeRichiedente: 'Mario',
  cognomeRichiedente: 'Rossi',
  emailRichiedente: 'mario.rossi@mondadori.it',
  
  // Dati multi-canale
  canale: 'WELFARE_PROVIDER',
  partner_id: 'partner_aon_flex',
  codice_convenzione: 'MONDADORI2026',
  azienda_dipendente: 'Mondadori S.p.A.',
  codice_dipendente: 'MD12345',
  
  // Calcolo sconto automatico
  servizio: 'eCura PRO',
  piano: 'BASE',
  prezzo_listino: 480, // Prezzo base
  sconto_applicato: 15, // 15% sconto Mondadori
  prezzo_finale: 408, // 480 - 15% = 408€
  
  tipo_fatturazione: 'WELFARE_CREDITI' // AON gestisce pagamento
}
```

### Generazione Contratto con Sconto

```typescript
// Nel contratto, mostrare entrambi i prezzi
const contractData = {
  ...leadData,
  html: `
    <h2>Condizioni Economiche</h2>
    <p><strong>Servizio:</strong> ${servizio} - Piano ${piano}</p>
    <p><strong>Prezzo Listino:</strong> €${prezzo_listino}/anno</p>
    <p><strong>Sconto Convenzione ${azienda_dipendente}:</strong> -${sconto_applicato}%</p>
    <p><strong>Prezzo Finale:</strong> €${prezzo_finale}/anno + IVA</p>
    <p><em>Pagamento tramite crediti welfare ${partner_nome}</em></p>
  `
}
```

---

## 📧 Template Email Multi-Canale

### Email Benvenuto Welfare Aziendale

```html
<!-- templates/email_benvenuto_welfare.html -->
<h2>Benvenuto in eCura, {{NOME_CLIENTE}}!</h2>

<p>Grazie per aver attivato il servizio eCura tramite la convenzione aziendale <strong>{{AZIENDA_NOME}}</strong>.</p>

<div style="background: #f0f8ff; padding: 20px; margin: 20px 0;">
  <h3>🎉 Condizioni Speciali Riservate</h3>
  <p><strong>Sconto Applicato:</strong> {{SCONTO_PERCENTUALE}}%</p>
  <p><strong>Investimento Annuale:</strong> €{{PREZZO_FINALE}} (invece di €{{PREZZO_LISTINO}})</p>
  <p><em>Pagamento tramite crediti welfare {{PROVIDER_NOME}}</em></p>
</div>

<p>Il tuo servizio sarà attivato entro 48 ore...</p>
```

---

## 🎯 Dashboard Multi-Canale Necessarie

### 1. Dashboard Canali Performance
**URL**: `/admin/channels-performance`

**Widget**:
- Revenue per canale (pie chart)
- Lead per canale (bar chart)
- Conversion rate per canale
- Average Order Value per canale

### 2. Dashboard Partners
**URL**: `/admin/partners-dashboard`

**Widget**:
- Lista partner attivi
- Lead generati per partner
- Commissioni dovute/pagate
- Performance partner (tabella sortable)

### 3. Dashboard Welfare Aziendale
**URL**: `/admin/welfare-companies`

**Widget**:
- Lista aziende welfare attive
- Penetrazione dipendenti (% attivati)
- Revenue per azienda
- Scadenze contratti prossime

---

**Fine Schema Database Multi-Canale** 🗄️
