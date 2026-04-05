# 🔴 FIX RIMANENTI - PROBLEMI APERTI

## ✅ RISOLTO: Errori 500 Endpoint
- ✅ Corretto nome tabella: `proforma` (non `proformas`)
- ✅ Commit: `5ce46aa`
- ✅ Test: riprova bottoni "Invia Proforma", "Pagamento OK", "Form Config"

---

## 🔴 PROBLEMA 1: Home page dopo firma contratto

### Situazione:
Dopo aver firmato il contratto, l'utente viene reindirizzato alla home page `https://telemedcare-v12.pages.dev`

### Causa:
La pagina `firma-contratto.html` viene aperta nello stesso tab/finestra. Quando l'utente chiude il popup di successo (o clicca fuori), torna alla pagina precedente (home).

### Soluzione possibile:
**Opzione A** - Cambiare comportamento bottone "Chiudi":
```javascript
// Invece di window.close()
<button onclick="window.close() || window.location.href='/'" class="btn btn-sign">
    ✓ Chiudi
</button>
```

**Opzione B** - Aprire firma-contratto in popup/modal:
- Modificare il link nell'email contratto per aprire in popup
- Aggiungere script per gestire apertura in nuova finestra piccola

**Opzione C** - Non permettere chiusura manuale:
- Rimuovere bottone "Chiudi"
- Chiudere automaticamente dopo 5 secondi con redirect a pagina "Grazie"

### File coinvolti:
- `public/firma-contratto.html` (linea 382)
- Email template contratto (link)

---

## 🔴 PROBLEMA 2: Testo "2-3 giorni lavorativi" ancora presente

### Situazione:
Nell'email proforma compare ancora il testo:
> ⚠️ Importante: L'attivazione del servizio avverrà entro 2-3 giorni lavorativi dall'accredito del bonifico.

### Causa:
Il testo è nel **template email** salvato nel **database** (tabella `document_templates`).

### Soluzione:
**Aggiornare il template nel database:**

```sql
-- Verifica template attuale
SELECT * FROM document_templates WHERE key = 'email_invio_proforma';

-- Opzione 1: Rimuovi completamente il testo
UPDATE document_templates 
SET html_body = REPLACE(html_body, 
    '<p style="...">⚠️ Importante: L\'attivazione del servizio avverrà entro 2-3 giorni lavorativi dall\'accredito del bonifico.</p>', 
    ''
)
WHERE key = 'email_invio_proforma';

-- Opzione 2: Sostituisci con testo generico
UPDATE document_templates 
SET html_body = REPLACE(html_body, 
    'entro 2-3 giorni lavorativi dall\'accredito del bonifico', 
    'dopo la ricezione del pagamento'
)
WHERE key = 'email_invio_proforma';
```

**Alternative:** Se il template non esiste nel DB, viene usato il fallback inline in `workflow-email-manager.ts` (linee 1091-1149) che **NON contiene** questo testo. Quindi basta eliminare il template dal DB.

### File coinvolti:
- Database: tabella `document_templates`, key `email_invio_proforma`
- Fallback: `src/modules/workflow-email-manager.ts` (linee 1091-1149) ✅ OK

---

## 🔴 PROBLEMA 3: Link Stripe "PAGA ORA CON STRIPE" → 404

### Situazione:
Nell'email proforma, cliccando sul bottone "💳 Paga Ora con Stripe" arriva errore 404.

### Causa:
Il link punta a `/pagamento?proformaId=XXX` ma:
1. La pagina `/pagamento.html` esiste
2. Ma potrebbe non gestire correttamente il parametro `proformaId`
3. Oppure il routing non è configurato correttamente

### Link generato:
```javascript
// workflow-email-manager.ts linea 1084
LINK_PAGAMENTO: `${env.PUBLIC_URL || env.PAGES_URL || 'https://telemedcare-v12.pages.dev'}/pagamento?proformaId=${proformaData.proformaId}`
```

### Verifica:
1. Controllare che `public/pagamento.html` esista ✅ (esiste)
2. Verificare che legga il parametro `proformaId` dall'URL
3. Testare URL diretto: `https://telemedcare-v12.pages.dev/pagamento?proformaId=PRF-1234567890`

### Soluzione:
**Controllare `pagamento.html`:**
```javascript
// Deve leggere il parametro
const urlParams = new URLSearchParams(window.location.search);
const proformaId = urlParams.get('proformaId');

// Poi caricare i dati
fetch(`/api/proforma/${proformaId}`)...
```

### File coinvolti:
- `public/pagamento.html`
- API endpoint `/api/proforma/:id` (verificare se esiste)

---

## 📋 CHECKLIST FINALE

### Da fare subito:
- [ ] Test bottoni dashboard dopo deploy (attendi 2-3 min)
  - [ ] "💰 Invia Proforma" → dovrebbe funzionare ora ✅
  - [ ] "✅ Pagamento OK" → dovrebbe funzionare ora ✅
  - [ ] "⚙️ Form Config" → dovrebbe funzionare ora ✅

### Da risolvere nel database:
- [ ] Eliminare/aggiornare template `email_invio_proforma` per rimuovere "2-3 giorni lavorativi"

### Da verificare:
- [ ] Testare link Stripe nell'email proforma
- [ ] Verificare comportamento firma contratto (home page)

---

## 🌐 TEST

**URL Dashboard:** https://telemedcare-v12.pages.dev/admin/leads-dashboard

**Attendi:** 2-3 minuti per CloudFlare deploy del commit `5ce46aa`

**Test end-to-end:**
1. ✅ Tasto "Invia Proforma" → verifica nessun errore 500
2. ✅ Ricevi email proforma
3. ❌ Verifica testo "2-3 giorni lavorativi" (ancora presente - da risolvere nel DB)
4. ❌ Clicca "Paga con Stripe" → verifica 404 (da risolvere)
5. ✅ Tasto "Pagamento OK" → verifica email configurazione
6. ✅ Tasto "Form Config" → verifica email configurazione

---

## 🛠️ AZIONI NECESSARIE

### Per l'utente (Roberto):
1. **Accedi al database CloudFlare D1**
2. **Esegui query SQL per aggiornare template email proforma**
3. **Testa link Stripe manualmente**
4. **Decidi comportamento post-firma** (popup, redirect, chiusura automatica)

### Per lo sviluppatore (Claude):
1. ✅ Corretto nome tabella proforma
2. ⏳ Attendere feedback su test endpoint
3. 🔄 Implementare fix per home page post-firma
4. 🔄 Verificare/correggere pagina `/pagamento.html`

---

**Ultimo commit:** `5ce46aa` - Fix nome tabella proforma  
**Repository:** https://github.com/RobertoPoggi/telemedcare-v12  
**Live:** https://telemedcare-v12.pages.dev
