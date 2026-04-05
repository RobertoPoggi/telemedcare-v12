# 🔄 INTEGRAZIONE HUBSPOT IRBEMA - Documentazione Completa

**Data**: 9 Febbraio 2026  
**Sistema**: TeleMedCare V12.0  
**Partner**: IRBEMA (Digital Marketing)  
**CRM**: HubSpot  
**Source**: Form su www.ecura.it

---

## 📊 STATO ATTUALE

### ✅ Sistema Completamente Funzionante
L'integrazione HubSpot è **attiva e funzionante** con 3 modalità di sincronizzazione.

---

## 🔄 TRE MODALITÀ DI SINCRONIZZAZIONE

### 1️⃣ SINCRONIZZAZIONE MANUALE (Bottone IRBEMA)
**Trigger**: Operatore clicca pulsante "IRBEMA" nella dashboard  
**Endpoint**: `POST /api/import/irbema`  
**File**: `src/index.tsx` linea 11295

**Funzionamento**:
- Importa **TUTTI** i lead da HubSpot
- Filtro: Solo lead da **ecura.it** (tramite URL tracking)
- Controllo duplicati: Verifica email esistente
- Genera ID sequenziale: `LEAD-IRBEMA-00001`, `LEAD-IRBEMA-00002`, etc.
- Invia notifica email automatica a info@telemedcare.it

**Quando usare**:
- Prima sincronizzazione iniziale
- Dopo periodi di inattività
- Per forzare import completo

**Switch necessario**: `hubspot_auto_import_enabled` = ON

---

### 2️⃣ SINCRONIZZAZIONE GIORNALIERA (CRON GitHub Actions)
**Trigger**: Automatico ogni giorno alle **08:00 ora italiana** (7:00 UTC)  
**File**: `.github/workflows/hubspot-sync-cron.yml`  
**Endpoint**: `POST /api/hubspot/sync`

**Funzionamento**:
```yaml
schedule:
  - cron: '0 7 * * *'  # 7:00 UTC = 8:00 Italia
```

**Cosa fa**:
1. Verifica se switch `hubspot_auto_import_enabled` è ON
2. Se ON: sincronizza lead degli **ultimi 7 giorni**
3. Se OFF: skip (log: "Import Auto HubSpot è disabilitato")
4. Importa solo lead da ecura.it
5. Invia email notifica automatica per ogni nuovo lead

**Parametri**:
```json
{
  "days": 7,
  "dryRun": false,
  "onlyEcura": true
}
```

**Log disponibili**: GitHub Actions → Workflow runs

**Verifica Status**: ✅ ATTIVO (se switch ON)

---

### 3️⃣ SINCRONIZZAZIONE INCREMENTALE (Refresh Dashboard)
**Trigger**: Automatico ogni volta che si carica una dashboard  
**File**: `src/modules/auto-import-script.ts`  
**Endpoint**: `POST /api/hubspot/auto-import`

**Funzionamento**:
- Script JavaScript iniettato in tutte le dashboard
- Esegue import silenzioso in background
- Importa lead delle **ultime 24 ore**
- Filtro: Solo lead da **Form eCura** (hs_object_source_detail_1 = 'Form eCura')
- NO intervallo minimo: esegue ad **ogni refresh**

**Cosa fa**:
```javascript
// Auto-import config
{
  enabled: true,
  silent: true,              // NO notifiche se 0 lead
  showSuccessToast: true,    // Mostra toast se nuovi lead
  minIntervalMinutes: 0      // Sempre esegui
}
```

**Parametri API**:
```json
{
  "enabled": true,
  "startHour": 0,           // Ultimi 24h (non solo dalle 9:00)
  "onlyEcura": true,        // Solo Form eCura
  "dryRun": false
}
```

**Post-Import**:
- Fix automatico prezzi (`POST /api/leads/fix-prices`)
- Refresh automatico dati dashboard
- Toast notifica se lead importati > 0

**Verifica Status**: ✅ ATTIVO (console browser durante caricamento dashboard)

---

## 🔑 SWITCH DI CONTROLLO

### Switch `hubspot_auto_import_enabled`
**Posizione**: Dashboard Operativa → Impostazioni Sistema → Import Auto HubSpot

**Stato ON** ✅:
- Modalità 1 (manuale): Funziona
- Modalità 2 (CRON): Funziona
- Modalità 3 (refresh): Funziona

**Stato OFF** ❌:
- Modalità 1 (manuale): Bloccata (403)
- Modalità 2 (CRON): Skip silenzioso
- Modalità 3 (refresh): Continua (non controllato da questo switch)

**Verifica Switch**:
```bash
curl https://telemedcare-v12.pages.dev/api/settings/hubspot_auto_import_enabled
```

---

## 📋 WORKFLOW IMPORT COMPLETO

### Step-by-Step

1. **Fetch Contatti da HubSpot**
   ```
   GET https://api.hubapi.com/crm/v3/objects/contacts
   Headers: Authorization: Bearer ${HUBSPOT_ACCESS_TOKEN}
   Params: 
     - limit: 100
     - properties: firstname, lastname, email, mobilephone, city, 
                   servizio_di_interesse, piano_desiderato, message,
                   createdate, hs_analytics_first_url, hs_analytics_last_url
   ```

2. **Filtraggio Lead eCura**
   ```javascript
   const firstUrl = contact.properties.hs_analytics_first_url
   const lastUrl = contact.properties.hs_analytics_last_url
   const isEcuraLead = firstUrl.includes('ecura.it') || lastUrl.includes('ecura.it')
   
   if (!isEcuraLead) skip
   ```

3. **Mapping Dati**
   ```javascript
   // Servizio
   servizio_di_interesse → servizio
   - 'family' → 'eCura FAMILY'
   - 'pro' → 'eCura PRO'
   - 'premium' → 'eCura PREMIUM'
   
   // Piano
   piano_desiderato → piano
   - 'avanzato' → 'AVANZATO'
   - default → 'BASE'
   ```

4. **Generazione ID Sequenziale**
   ```sql
   -- Trova ultimo ID IRBEMA
   SELECT id FROM leads 
   WHERE id LIKE 'LEAD-IRBEMA-%' 
   ORDER BY id DESC 
   LIMIT 1;
   
   -- Genera nuovo ID
   LEAD-IRBEMA-00146  (se ultimo era 00145)
   ```

5. **Controllo Duplicati**
   ```sql
   SELECT id FROM leads 
   WHERE email = ? OR emailRichiedente = ?
   LIMIT 1;
   
   IF EXISTS → skip
   ```

6. **Inserimento Lead**
   ```sql
   INSERT INTO leads (
     id, nomeRichiedente, cognomeRichiedente, emailRichiedente, telefonoRichiedente,
     servizio, piano, tipoServizio, prezzo_anno, prezzo_rinnovo,
     fonte, status, vuoleBrochure, vuoleContratto,
     note, created_at, updated_at
   ) VALUES (...);
   ```

7. **Email Notifica Admin** (`email_notifica_info.html`)
   ```
   TO: info@telemedcare.it
   SUBJECT: 🆕 Nuovo Lead: {Nome} {Cognome} - {Piano}
   TEMPLATE: email_notifica_info
   ```

8. **Email Completamento Dati Lead** (`email_richiesta_completamento_form.html`)
   ```
   TO: lead.email
   SUBJECT: 📝 Completa la tua richiesta eCura - Ultimi dettagli necessari
   TEMPLATE: email_richiesta_completamento_form
   LINK: /api/form/{leadId}?leadId={leadId}
   ```

9. **Fix Prezzi Automatico**
   ```
   POST /api/leads/fix-prices
   - Calcola prezzo_anno in base a servizio/piano
   - Calcola prezzo_rinnovo
   - Aggiorna lead con prezzi corretti
   ```

---

## 🔧 CONFIGURAZIONE NECESSARIA

### Variabili Ambiente (Cloudflare Pages)
```bash
HUBSPOT_ACCESS_TOKEN=pat-xxx-yyy-zzz  # Token API HubSpot
HUBSPOT_PORTAL_ID=12345678            # Portal ID HubSpot
RESEND_API_KEY=re_xxx                 # Per invio email
PUBLIC_URL=https://telemedcare-v12.pages.dev
```

### Switch Database
```sql
INSERT INTO settings (key, value) VALUES 
  ('hubspot_auto_import_enabled', 'true');
```

### GitHub Actions Secrets
- Nessun secret necessario (usa endpoint pubblico)

---

## 🧪 TEST & VERIFICA

### Test Modalità 1 (Manuale)
```bash
# 1. Verifica switch ON
curl https://telemedcare-v12.pages.dev/api/settings/hubspot_auto_import_enabled

# 2. Esegui import manuale
curl -X POST https://telemedcare-v12.pages.dev/api/import/irbema

# Expected output:
{
  "success": true,
  "message": "Import HubSpot completato",
  "imported": 5,
  "skipped": 120,
  "filtered": 0,
  "total": 125,
  "pages": 2
}
```

### Test Modalità 2 (CRON)
```bash
# Esegui manualmente workflow GitHub
# 1. Vai su GitHub → Actions
# 2. Seleziona "HubSpot Daily Sync 8:00"
# 3. Click "Run workflow"
# 4. Verifica logs

# Oppure attendi domani alle 8:00
```

### Test Modalità 3 (Refresh Dashboard)
```bash
# 1. Apri dashboard: https://telemedcare-v12.pages.dev/dashboard
# 2. Apri Console Browser (F12)
# 3. Cerca log: [AUTO-IMPORT]
# 4. Verifica output:
#    ✅ [AUTO-IMPORT] Completato: 2 importati, 5 già esistenti
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Import automatico HubSpot disabilitato"
**Causa**: Switch `hubspot_auto_import_enabled` = OFF  
**Soluzione**:
1. Vai su Dashboard → Impostazioni Sistema
2. Trova switch "Import Auto HubSpot"
3. Metti ON
4. Salva

### Problema: "Token HubSpot non configurato"
**Causa**: `HUBSPOT_ACCESS_TOKEN` mancante in env  
**Soluzione**:
1. Vai su Cloudflare Pages → Settings → Environment variables
2. Aggiungi `HUBSPOT_ACCESS_TOKEN` con valore token
3. Redeploy

### Problema: Lead duplicati
**Causa**: Email già esistente  
**Comportamento**: Lead viene skipped automaticamente  
**Verifica**:
```sql
SELECT id, nomeRichiedente, email, created_at 
FROM leads 
WHERE email = 'test@example.com';
```

### Problema: CRON non parte
**Verifica**:
1. GitHub → Actions → Workflows
2. Seleziona "HubSpot Daily Sync 8:00"
3. Verifica ultimo run
4. Se fallito, leggi logs

### Problema: Email non inviate
**Causa**: `RESEND_API_KEY` mancante o invalida  
**Verifica**:
```bash
# Test Resend API key
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer ${RESEND_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"from":"test@telemedcare.it","to":"test@example.com","subject":"Test","text":"Test"}'
```

---

## 📊 METRICHE & MONITORING

### KPI da Monitorare
- **Lead importati/giorno**: Target 5-20 (dipende da campagne)
- **Lead duplicati**: Normale se > 80% (contatti ricorrenti)
- **Tempo import**: < 10 secondi per 100 lead
- **Email deliverability**: > 99%

### Log Locations
1. **Browser Console**: Modalità 3 (refresh dashboard)
2. **Cloudflare Logs**: Tutte le modalità
3. **GitHub Actions**: Modalità 2 (CRON)

### Alert da Configurare
- CRON fallisce 2 giorni consecutivi
- Import 0 lead per 7 giorni (possibile problema campagne)
- Errori email > 5%

---

## 📝 NOTE TECNICHE

### Paginazione HubSpot
- Max 100 contatti per chiamata
- Usa `after` parameter per paginazione
- Continue loop finché `paging.next.after` esiste

### Rate Limits HubSpot
- Standard: 100 richieste / 10 secondi
- Import smart: 1 richiesta ogni 100 lead

### Filtri eCura
Due metodi paralleli:
1. URL tracking: `hs_analytics_first_url` o `hs_analytics_last_url` contiene "ecura.it"
2. Form source: `hs_object_source_detail_1` = "Form eCura"

### Prezzi Automatici
Calcolo IVA inclusa:
- BASE: €480 + 22% IVA = €585.60
- AVANZATO: €840 + 22% IVA = €1,024.80

---

## ✅ CHECKLIST OPERATIVA

### Setup Iniziale
- [x] Token HubSpot configurato
- [x] Switch import abilitato
- [x] CRON GitHub Actions attivo
- [x] Auto-import script iniettato in dashboard
- [x] Email template verificati

### Operatività Giornaliera
- [ ] Verificare CRON run ore 8:00 (GitHub Actions)
- [ ] Controllare nuovi lead in dashboard
- [ ] Verificare email inviate correttamente
- [ ] Monitorare campagne eCura attive

### Manutenzione Mensile
- [ ] Review duplicati (se % > 90%)
- [ ] Verifica accuratezza mapping servizio/piano
- [ ] Controllo prezzi automatici
- [ ] Pulizia lead test se necessario

---

**Status Sistema**: ✅ **OPERATIVO E FUNZIONANTE**

**Ultimo aggiornamento**: 9 Febbraio 2026  
**Verificato da**: GenSpark AI Developer
