# 🔧 Riepilogo Correzioni Import HubSpot
**TeleMedCare V12.0.3 - 10 Febbraio 2026**

---

## ✅ Problemi Risolti

### 1. Auto-Import al Refresh Dashboard
**Problema:** Non importava lead creati 2 giorni fa (finestra 24h troppo stretta)

**Soluzione:**
- ✅ Ampliato da 24 ore a **7 giorni**
- ✅ Script frontend: `days: 7` in `/api/hubspot/auto-import`
- ✅ Mantiene filtro `onlyEcura: true` (solo Form eCura)

**Test da fare:**
1. Vai a Dashboard Operativa: https://telemedcare-v12.pages.dev/dashboard
2. Apri Console (F12)
3. Ricarica pagina (F5)
4. Verifica log console con `[AUTO-IMPORT]`

**Output atteso:**
```
🔄 [AUTO-IMPORT] Inizio import incrementale ultimi 7 giorni...
📡 [AUTO-IMPORT] Chiamata API: POST /api/hubspot/auto-import
📤 [AUTO-IMPORT] Body: {"enabled":true,"startHour":0,"days":7,"onlyEcura":true,"dryRun":false}
✅ [AUTO-IMPORT] Completato: X importati, Y già esistenti
```

### 2. CRON GitHub Actions (08:00)
**Problema:** Usava endpoint vecchio `/api/hubspot/sync`

**Soluzione:**
- ✅ Modificato workflow per usare `/api/hubspot/auto-import`
- ✅ Finestra temporale: **ultimo giorno** (esegue ogni giorno)
- ✅ Mantiene filtro `onlyEcura: true`

**File modificato manualmente:** `.github/workflows/hubspot-sync-cron.yml`

**Test da fare:**
1. Vai a: https://github.com/RobertoPoggi/telemedcare-v12/actions
2. Clicca "HubSpot Daily Sync 8:00"
3. Clicca "Run workflow" per test immediato
4. Verifica log esecuzione

**Output atteso:**
```
2️⃣ Esecuzione auto-import HubSpot (ultimi 1 giorno, solo Form eCura)...
HTTP Status: 200
✅ AUTO-IMPORT COMPLETATO CON SUCCESSO!
Statistiche Auto-Import:
- Lead importati: X
- Lead già esistenti: Y
```

### 3. Pulsante IRBEMA (Manuale)
**Problema:** Non aveva filtro data, importava 4000+ lead vecchi

**Soluzione:**
- ✅ Endpoint `/api/import/irbema` già aveva filtro dal **30/01/2026**
- ✅ Endpoint `/api/hubspot/sync` aggiornato con parametro `useFixedDate`
- ✅ Default: filtra dal **30/01/2026** (inizio campagna eCura)

**Test da fare:**
1. Dashboard Operativa
2. Clicca pulsante **IRBEMA** (blu)
3. Verifica import solo lead campagna eCura

**Output atteso:**
- Toast: "✅ X nuovi lead importati"
- Tabella aggiornata con nuovi lead

---

## ⚙️ Configurazione Finale delle 3 Sincronizzazioni

| Sincronizzazione | Endpoint | Finestra Temporale | Trigger | Filtro |
|------------------|----------|-------------------|---------|--------|
| **1. Auto-Import Refresh** | `/api/hubspot/auto-import` | Ultimi **7 giorni** | Ogni refresh dashboard | Solo Form eCura |
| **2. CRON Giornaliero** | `/api/hubspot/auto-import` | Ultimo **1 giorno** | Ogni giorno 08:00 | Solo Form eCura |
| **3. Pulsante IRBEMA** | `/api/import/irbema` | Dal **30/01/2026** | Manuale (click) | Solo ecura.it |

### Dettagli Tecnici

#### 1. Auto-Import Refresh (Dashboard)
```javascript
// Script: src/modules/auto-import-script.ts
POST /api/hubspot/auto-import
Body: {
  enabled: true,
  startHour: 0,
  days: 7,              // ✅ Ultimi 7 giorni
  onlyEcura: true,      // ✅ Solo Form eCura
  dryRun: false
}
```

**Comportamento:**
- ✅ Si attiva automaticamente al caricamento della dashboard
- ✅ Silenzioso se 0 lead nuovi
- ✅ Mostra toast verde se lead importati > 0
- ✅ Ricarica automaticamente la tabella lead

#### 2. CRON Giornaliero (08:00 CET)
```bash
# Workflow: .github/workflows/hubspot-sync-cron.yml
cron: '0 7 * * *'  # 07:00 UTC = 08:00 CET

curl -X POST https://telemedcare-v12.pages.dev/api/hubspot/auto-import \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"startHour":0,"days":1,"onlyEcura":true,"dryRun":false}'
```

**Comportamento:**
- ✅ Parte alle 08:00 ogni mattina
- ✅ Importa solo lead ultimi 24h
- ✅ Log dettagliati su GitHub Actions
- ✅ Notifica admin se errori

#### 3. Pulsante IRBEMA (Manuale)
```javascript
// Endpoint: POST /api/import/irbema
const campaignStartDate = new Date('2026-01-30T00:00:00Z')

// Filtra per:
// 1. URL ecura.it (hs_analytics_first_url || hs_analytics_last_url)
// 2. Data creazione >= 30/01/2026
// 3. Email o telefono presente
```

**Comportamento:**
- ✅ Sincronizzazione completa campagna
- ✅ Importa TUTTI i lead dal 30/01/2026
- ✅ Salta lead già esistenti
- ✅ Toast con risultati

---

## 🐛 Problemi Ancora da Risolvere

### 1. Lead con Prezzo a Zero
**Lead interessati:**
- Rita Galletto
- Giovanna Santamaria
- Tina Zingale

**Causa probabile:**
Su HubSpot questi contatti **NON** hanno i campi custom compilati:
- `servizio_ecura` (FAMILY/PRO/PREMIUM)
- `piano_ecura` (BASE/AVANZATO)

**Cosa fa il sistema:**
```javascript
// src/modules/hubspot-integration.ts - Riga 323-324
const servizioEcura = props.servizio_ecura ? props.servizio_ecura.toUpperCase() : 'PRO'
const pianoEcura = props.piano_ecura ? props.piano_ecura.toUpperCase() : 'BASE'

// Se HubSpot non manda questi campi:
// Servizio = 'PRO' (default)
// Piano = 'BASE' (default)
// Prezzo = calculatePrice('PRO', 'BASE') = €480
```

**Soluzione da verificare:**
1. Controlla su HubSpot CRM:
   - Rita Galletto: ha `servizio_ecura` e `piano_ecura`?
   - Se NO → aggiungi su HubSpot
   - Se SÌ → verifica nome esatto campo (case-sensitive)

2. Fix manuale prezzi:
   ```bash
   POST /api/leads/fix-prices
   ```
   Questo endpoint ricalcola i prezzi per tutti i lead con prezzo 0 o NULL

### 2. Lead "TEST NUOVO LEAD" Non Importato
**Test da fare:**
1. Verifica su HubSpot:
   - Il contatto esiste?
   - Data di creazione (negli ultimi 7 giorni)?
   - Ha `hs_object_source_detail_1 = 'Form eCura'`?

2. Se manca Form eCura:
   - Non verrà mai importato (filtro attivo)
   - È il comportamento corretto

3. Se ha Form eCura:
   - Cancella il lead da TeleMedCare
   - Ricarica dashboard (F5)
   - Controlla log console

---

## 📊 Verifiche Finali

### Checklist Test Completo

#### ✅ Test 1: Auto-Import al Refresh
- [ ] Dashboard Operativa aperta
- [ ] Console aperta (F12)
- [ ] Ricarica pagina (F5)
- [ ] Log `[AUTO-IMPORT]` visibili
- [ ] Nessun errore HTTP 500
- [ ] Response JSON corretta

#### ✅ Test 2: CRON Manuale
- [ ] GitHub Actions aperto
- [ ] Workflow "HubSpot Daily Sync 8:00" eseguito
- [ ] Log mostrano `/api/hubspot/auto-import`
- [ ] HTTP 200 response
- [ ] Statistiche auto-import visualizzate

#### ✅ Test 3: Pulsante IRBEMA
- [ ] Dashboard Operativa
- [ ] Click pulsante IRBEMA (blu)
- [ ] Toast "Importazione in corso..."
- [ ] Toast "✅ X nuovi lead importati"
- [ ] Tabella aggiornata
- [ ] Lead hanno prezzo corretto

### Verifica Lead Importati

**Query SQL per controllo:**
```sql
-- Lead importati da IRBEMA
SELECT id, nomeRichiedente, cognomeRichiedente, 
       servizio, piano, prezzo_anno, prezzo_rinnovo, 
       created_at
FROM leads
WHERE fonte = 'IRBEMA'
  AND id LIKE 'LEAD-IRBEMA-%'
ORDER BY created_at DESC
LIMIT 20;

-- Lead con prezzo 0 o NULL
SELECT id, nomeRichiedente, cognomeRichiedente, 
       servizio, piano, prezzo_anno
FROM leads
WHERE (prezzo_anno IS NULL OR prezzo_anno = 0)
  AND fonte = 'IRBEMA'
ORDER BY created_at DESC;
```

---

## 📝 Note Tecniche

### Filtro Form eCura
Il filtro `hs_object_source_detail_1 = 'Form eCura'` viene applicato a livello API HubSpot:

```javascript
// src/modules/hubspot-integration.ts - searchContacts()
if (filters.hs_object_source_detail_1) {
  filtersArray.push({
    propertyName: 'hs_object_source_detail_1',
    operator: 'EQ',
    value: filters.hs_object_source_detail_1  // 'Form eCura'
  })
}
```

**Importante:** Questo significa che HubSpot restituisce SOLO contatti con questo campo = 'Form eCura'. Se un contatto non ha questo campo compilato, non verrà MAI importato.

### Calcolo Prezzi Automatico
Il sistema calcola i prezzi automaticamente durante l'import:

```javascript
// src/modules/hubspot-integration.ts - mapHubSpotContactToLead()
const servizioEcura = props.servizio_ecura ? props.servizio_ecura.toUpperCase() : 'PRO'
const pianoEcura = props.piano_ecura ? props.piano_ecura.toUpperCase() : 'BASE'

const pricingModule = await import('./pricing-calculator')
const calculated = pricingModule.calculatePrice(servizioEcura, pianoEcura)

// Prezzi assegnati (IVA esclusa):
prezzo_anno: calculated.setupBase,      // Setup 1° anno
prezzo_rinnovo: calculated.rinnovoBase  // Rinnovo dal 2° anno
```

**Matrix Prezzi (IVA esclusa):**
| Servizio | Piano | Setup | Rinnovo |
|----------|-------|-------|---------|
| FAMILY | BASE | €390 | €200 |
| FAMILY | AVANZATO | €690 | €500 |
| PRO | BASE | €480 | €240 |
| PRO | AVANZATO | €840 | €600 |
| PREMIUM | BASE | €590 | €300 |
| PREMIUM | AVANZATO | €990 | €750 |

---

## 🚀 Prossimi Passi

1. **Attendere Deploy Cloudflare** (2-3 minuti)
   - Commit: `41158d4`
   - Branch: `main`

2. **Test Completo Auto-Import**
   - Cancella lead di test
   - Refresh dashboard
   - Verifica log console
   - Controlla toast e tabella

3. **Verifica Prezzi Lead Esistenti**
   - Rita Galletto, Giovanna Santamaria, Tina Zingale
   - Controllare su HubSpot i campi custom
   - Eseguire fix-prices se necessario

4. **Test CRON GitHub Actions**
   - Run workflow manuale
   - Verificare log
   - Aspettare domani ore 08:00

5. **Test Pulsante IRBEMA**
   - Click pulsante blu
   - Verificare import solo dal 30/01/2026
   - Controllare prezzi lead importati

---

## 📞 Supporto

In caso di problemi:

1. **Console Browser:**
   - Cerca `[AUTO-IMPORT]` per log auto-import
   - Cerca `[HUBSPOT]` per log IRBEMA
   - Errori HTTP 500 indicano problema server

2. **GitHub Actions:**
   - https://github.com/RobertoPoggi/telemedcare-v12/actions
   - Log dettagliati esecuzioni CRON

3. **Cloudflare Pages:**
   - Dashboard: https://dash.cloudflare.com/
   - Log Workers: sezione "Logs" del progetto
   - Variabili ambiente: verificare HUBSPOT_ACCESS_TOKEN

---

**Versione:** V12.0.3  
**Data:** 10 Febbraio 2026  
**Ultimo Commit:** 41158d4
