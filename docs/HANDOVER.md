# 🔄 PASSAGGIO DI CONSEGNE - TeleMedCare V12

**Data:** 2026-03-01  
**Progetto:** TeleMedCare V12  
**Repository:** https://github.com/RobertoPoggi/telemedcare-v12  
**Deploy:** https://telemedcare-v12.pages.dev  

---

## 🔴 PROBLEMI CRITICI NON RISOLTI

### **1. 🚨 GRAVISSIMO: Redirect a home page dopo firma contratto (VIOLAZIONE GDPR)**

**Descrizione:**  
Dopo la firma del contratto, il lead viene reindirizzato a `https://telemedcare-v12.pages.dev/` che mostra la **dashboard interna** con dati sensibili di centinaia di altri lead.

**Rischio:**  
- Violazione GDPR  
- Multa fino a €20M o 4% fatturato annuo  
- Esposizione dati personali di terzi

**File coinvolto:**  
- `public/app/sign-contract.html` (righe 564-575)

**Comportamento attuale:**
```javascript
// Dopo firma contratto:
setTimeout(() => {
    alert('✅ Contratto firmato con successo!...');
    window.close();  // NON FUNZIONA!
    
    setTimeout(() => {
        // Questo dovrebbe mostrare pagina vuota, ma FALLISCE
        document.body.innerHTML = '<div>...</div>';
    }, 500);
}, 500);

// RISULTATO: Il browser fa redirect a '/' → https://telemedcare-v12.pages.dev/
```

**Soluzione richiesta:**  
- **OPZIONE A:** Dopo alert, fare `window.location.href = 'about:blank'` (pagina vuota)
- **OPZIONE B:** Dopo alert, fare redirect a pagina di ringraziamento pubblica `/grazie.html` (da creare)
- **OPZIONE C:** Implementare popup modale che blocca la pagina (come in `completa-dati.html`)

**Test per verificare fix:**
1. Firmare un contratto
2. Cliccare OK sull'alert
3. **Verificare:** NON deve apparire la dashboard con lead/proforma/pagamenti

---

### **2. 🔴 CRITICO: Contratto intestato all'assistito invece dell'intestatario**

**Descrizione:**  
Nel form completamento dati, l'utente indica intestatario ≠ assistito, ma il contratto generato usa i dati dell'**assistito** invece dell'**intestatario**.

**File coinvolto:**  
- `src/index.tsx` (endpoint `/api/contracts/:id` - circa riga 11307)
- Template contratto (variabili mappate male)

**Dati attesi vs attuali:**

| Campo | Atteso | Attuale |
|-------|--------|---------|
| Nome contratto | `lead.nomeIntestatario` | `lead.nomeAssistito` ❌ |
| Cognome contratto | `lead.cognomeIntestatario` | `lead.cognomeAssistito` ❌ |
| Email contratto | `lead.emailIntestatario` | `lead.emailAssistito` ❌ |
| Telefono contratto | `lead.telefonoIntestatario` | `lead.telefonoAssistito` ❌ |

**Soluzione richiesta:**  
Modificare endpoint `GET /api/contracts/:id` per usare campi `intestatario` invece di `assistito`:

```typescript
contractData = {
  cliente_nome: lead.nomeIntestatario || lead.nomeRichiedente,
  cliente_cognome: lead.cognomeIntestatario || lead.cognomeRichiedente,
  cliente_email: lead.emailIntestatario || lead.email,
  cliente_telefono: lead.telefonoIntestatario || lead.telefono,
  // ...
}
```

**Test per verificare fix:**
1. Creare lead con intestatario ≠ assistito
2. Generare contratto
3. Verificare che il contratto mostri **nome intestatario**, non nome assistito

---

### **3. 🔴 CRITICO: Servizio proforma errato (perdita economica)**

**Descrizione:**  
Il lead firma un contratto per **eCura Premium** (€990/anno), ma la proforma viene generata per **eCura Professional** (€811,48/anno).

**File coinvolto:**  
- `src/index.tsx` (endpoint `POST /api/contracts/sign` - circa riga 10920-10950)

**Codice attuale (ERRATO):**
```typescript
// Riga 10926-10928 circa
const piano = contract.piano || 'BASE';
const servizio = contract.servizio || 'eCura PRO';  // ❌ HARD-CODED!
const prezzoBase = piano === 'AVANZATO' ? 840 : 480;  // ❌ IGNORA contract.prezzo!
```

**Problema:**  
Il codice **ignora** `contract.servizio` e `contract.prezzo_totale` e usa valori hard-coded.

**Soluzione richiesta:**  
```typescript
// Leggi servizio e prezzo dal contratto firmato
const servizio = contract.servizio || contract.service_type || 'eCura PRO';
const prezzoTotale = contract.prezzo_totale || contract.prezzo_iva_inclusa || 0;
const prezzoBase = prezzoTotale / 1.22;  // Scorporo IVA 22%
const prezzoMensile = prezzoBase / 12;

const proformaData = {
  tipoServizio: servizio,  // ✅ eCura Premium
  prezzoMensile: prezzoMensile,  // ✅ Calcolato da contract.prezzo_totale
  prezzoTotale: prezzoTotale,
  // ...
};
```

**Test per verificare fix:**
1. Firmare contratto per eCura Premium (€990/anno)
2. Verificare email proforma ricevuta
3. Controllare che servizio sia **eCura Premium** e prezzo **€990,00**

---

### **4. ❌ Campo Provincia sempre NULL → appare come "()"**

**Descrizione:**  
Il campo `provinciaIntestatario` e `provinciaAssistito` non viene mai salvato nel DB, quindi nei documenti appare come "()".

**File coinvolti:**  
- `public/completa-dati-minimal.html` (form completamento dati)
- `src/index.tsx` (endpoint `PUT /api/leads/:id` - riga 9219)

**Problema 1: Form non mostra il campo**  
Il codice JavaScript in `completa-dati-minimal.html` genera dinamicamente i campi, ma la griglia CSS ha solo 3 colonne (`cols-3`) invece di 4.

**Problema 2: Backend non salva il campo**  
L'endpoint `PUT /api/leads/:id` ha il mapping `provinciaIntestatario` nel `fieldMapping`, ma il deploy Cloudflare non applica le modifiche.

**Soluzione richiesta:**

**A) Fix form HTML (completa-dati-minimal.html):**
```javascript
// Riga 306 circa - cambia cols-3 in cols-4
html += '<div class="form-row cols-4">';  // ✅ 4 colonne invece di 3

// Riga 67 circa - aggiungi CSS per cols-4
.form-row.cols-4 {
    grid-template-columns: 3fr 1fr 2fr 1fr;  /* Indirizzo | CAP | Città | Provincia */
}

// Riga 339 circa - aggiungi campo Provincia DENTRO la griglia
if (!lead.provinciaIntestatario) {
    html += `
        <div class="form-group">
            <label for="provinciaIntestatario">Provincia <span class="required">*</span></label>
            <input type="text" id="provinciaIntestatario" name="provinciaIntestatario" 
                   placeholder="MI" required maxlength="2" 
                   style="text-transform: uppercase;">
        </div>
    `;
}
```

**B) Fix backend (src/index.tsx):**
```typescript
// Endpoint PUT /api/leads/:id - riga 9235 circa
const fieldMapping: Record<string, string> = {
  // ... altri campi ...
  provinciaIntestatario: 'provinciaIntestatario',  // ✅ Già presente
  provinciaAssistito: 'provinciaAssistito',        // ✅ Già presente
};
```

**Nota importante:**  
Il codice è **CORRETTO** nel repository, ma **Cloudflare Pages non sta deployando** le modifiche.

**Workaround temporaneo:**
1. Deploy **manuale** via Wrangler CLI:
   ```bash
   cd /home/user/webapp
   npm run build
   npx wrangler pages deploy dist --project-name=telemedcare-v12
   ```

2. Oppure trigger manuale su **Cloudflare Dashboard**:
   - Vai su https://dash.cloudflare.com
   - Progetto: **telemedcare-v12**
   - Deployments → **Create deployment**

**Test per verificare fix:**
1. Aprire form: `https://telemedcare-v12.pages.dev/completa-dati-minimal.html?leadId=LEAD-XXX`
2. Verificare che appaiano **4 campi**: Indirizzo | CAP | Città | **Provincia**
3. Compilare e salvare
4. Verificare in DB che `provinciaIntestatario` sia valorizzato (es. "MI")

---

## 📊 COMMIT RILEVANTI (NON FUNZIONANTI)

| Commit | Descrizione | Problema |
|--------|-------------|----------|
| `8146a8b` | Fix 4 problemi critici E2E | ❌ NESSUN fix funziona |
| `0ea4a72` | Testo bonifico 10 giorni | ✅ Funziona |
| `4c7503a` | Griglia 4 colonne provincia | ❌ Non deployed |
| `0b8d492` | Provincia in minimal | ❌ Non deployed |
| `7cb13ed` | Force trigger deploy | ❌ Non deployed |

---

## 🗂️ STRUTTURA PROGETTO

```
telemedcare-v12/
├── src/
│   └── index.tsx                    # Backend Hono (API endpoints)
├── public/
│   ├── app/
│   │   └── sign-contract.html       # 🔴 Firma contratto (redirect GDPR)
│   ├── completa-dati-minimal.html   # 🔴 Form dati (provincia mancante)
│   ├── pagamento.html               # ✅ Pagina pagamento (OK)
│   └── proforma-view.html           # Visualizza proforma
├── migrations/                      # Migrazioni D1
├── templates/
│   └── contracts/                   # Template contratti HTML
├── dist/                            # Build output (deploy qui)
├── wrangler.toml                    # Config Cloudflare
└── package.json
```

---

## 🔧 COMANDI UTILI

### **Build locale:**
```bash
cd /home/user/webapp
npm run build
```

### **Deploy manuale (richiede token API):**
```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
npx wrangler pages deploy dist --project-name=telemedcare-v12
```

### **Deploy automatico:**
```bash
git add -A
git commit -m "Fix: descrizione"
git push origin main
# Cloudflare Pages deploierà automaticamente in ~3-5 min
```

### **Test locale:**
```bash
npm run dev
# Apri http://localhost:3000
```

---

## 🗄️ DATABASE (Cloudflare D1)

**Nome:** `telemedcare-leads`  
**Dashboard:** https://dash.cloudflare.com → D1 Databases

### **Tabelle principali:**
- `leads` - Dati lead (nome, email, servizio, piano, provincia, ecc.)
- `contracts` - Contratti generati (contenuto_html, status, prezzi)
- `proforma` - Proforma generate (numero_proforma, prezzi, scadenze)
- `pagamenti` - Pagamenti ricevuti (Stripe, bonifico)

### **Query utili:**

```sql
-- Verifica lead test
SELECT id, nomeRichiedente, cognomeRichiedente, 
       nomeIntestatario, cognomeIntestatario,
       nomeAssistito, cognomeAssistito,
       provinciaIntestatario, provinciaAssistito
FROM leads
WHERE id = 'LEAD-1RBEEM-00252';

-- Verifica proforma
SELECT id, numero_proforma, contract_id, 
       tipo_servizio, prezzo_totale, status
FROM proforma
ORDER BY created_at DESC
LIMIT 5;

-- Cancella proforma test (per riprovare)
DELETE FROM proforma WHERE id IS NULL;  -- Rimuove record corrotti
```

---

## 🔐 VARIABILI D'AMBIENTE (Cloudflare)

**Dashboard:** https://dash.cloudflare.com → telemedcare-v12 → Settings → Environment variables

### **Variabili configurate:**
- `EMAIL_FROM` = info@telemedcare.it
- `EMAIL_TO_INFO` = info@telemedcare.it
- `HUBSPOT_PORTAL_ID` = 145726645
- `ENVIRONMENT` = production

### **Variabili mancanti (per Stripe):**
- `STRIPE_PUBLIC_KEY` = pk_test_... (da configurare)
- `STRIPE_SECRET_KEY` = sk_test_... (da configurare)

---

## 📧 CONTATTI

**Repository:** https://github.com/RobertoPoggi/telemedcare-v12  
**Owner:** RobertoPoggi  
**Email:** info@telemedcare.it

---

## ⚠️ NOTE FINALI PER IL NUOVO SVILUPPATORE

1. **Deploy Cloudflare Pages ha problemi di cache**: A volte le modifiche non vengono deployate automaticamente. Soluzione: trigger manuale da Dashboard.

2. **Test con lead reale:** Usa `LEAD-1RBEEM-00252` (Roberto Poggi) per i test. Ricorda di pulire proforma/contratti dopo ogni test.

3. **Priorità:**
   - **1. CRITICO GDPR:** Fix redirect dopo firma (rischio multa)
   - **2. CRITICO BUSINESS:** Fix servizio proforma (perdita economica)
   - **3. IMPORTANTE:** Fix intestatario contratto (correttezza dati)
   - **4. MEDIO:** Fix provincia (completezza dati)

4. **Budget crediti:** Cliente ha già speso 10.000 crediti senza risultati. Lavora con **commit piccoli e test immediati**.

5. **Test E2E obbligatorio:** Dopo OGNI modifica, testa tutto il flusso:
   - Firma contratto → verifica redirect
   - Email proforma → verifica servizio e prezzo
   - Form dati → verifica salvataggio provincia

---

**Buon lavoro! 🚀**

*Documento generato: 2026-03-01*
