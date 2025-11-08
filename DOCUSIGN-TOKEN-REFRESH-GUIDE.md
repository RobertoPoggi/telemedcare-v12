# 🔐 Guida al Refresh del Token DocuSign

## 📋 Situazione Attuale

Il token DocuSign nel database è **scaduto**. Per continuare a usare DocuSign, dobbiamo ottenere un nuovo token.

---

## 🎯 Due Metodi Disponibili

### **Metodo 1: OAuth Flow Completo** ✅ CONSIGLIATO ORA

Usa questo metodo **ADESSO** perché non abbiamo un refresh token valido.

**Vantaggi:**
- Più sicuro
- Ottieni anche un refresh token per il futuro
- Sempre funzionante

**Procedura:**

```bash
./refresh-docusign-token.sh
```

Lo script ti guiderà attraverso questi passaggi:

1. **Apre un URL di autorizzazione** - Copia e incolla nel browser
2. **Login DocuSign** - Accedi con le tue credenziali Developer
3. **Autorizza l'app** - Clicca "Allow"
4. **Copia il codice** - Dalla URL di redirect (dopo `code=`)
5. **Incolla il codice** - Nello script
6. **Automatico** - Lo script salva il nuovo token nel database

**Tempo richiesto:** ~2 minuti

---

### **Metodo 2: Refresh Token** ⏭️ PER IL FUTURO

Usa questo metodo **IN FUTURO** quando avrai già un refresh token salvato.

**Vantaggi:**
- Velocissimo (10 secondi)
- Automatico (nessun browser)
- Usa il refresh token salvato

**Procedura:**

```bash
./refresh-with-refresh-token.sh
```

**NOTA:** Questo metodo **NON funziona ora** perché il token attuale non ha un refresh token associato.

---

## 🚀 Come Procedere ADESSO

### Step 1: Esegui il refresh

```bash
cd /home/user/webapp
./refresh-docusign-token.sh
```

### Step 2: Segui le istruzioni

Lo script ti chiederà di:

1. Aprire questo URL nel browser:
   ```
   https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=baf7dff3-8bf8-4587-837d-406adb8be309&redirect_uri=http://localhost:3001/api/docusign/callback
   ```

2. Fare login su DocuSign Developer (account-d.docusign.com)

3. Autorizzare l'applicazione "TeleMedCare"

4. Copiare il codice dalla URL di redirect:
   ```
   http://localhost:3001/api/docusign/callback?code=QUESTO_E_IL_CODICE
   ```

5. Incollare solo il codice (la parte dopo `code=`)

### Step 3: Verifica

Lo script confermerà:
- ✅ Token salvato nel database
- ✅ Scadenza (dovrebbe essere tra ~8 ore)
- ✅ Refresh token salvato (per usi futuri)

### Step 4: Testa

Invia un nuovo form dal sito e verifica che ricevi l'email da **dse@docusign.net** invece dell'email classica.

---

## 🔄 Ciclo di Vita del Token

```
1. PRIMO ACCESSO (OAuth Flow)
   ↓
   Access Token (valido 8 ore)
   Refresh Token (valido 30 giorni)
   
2. DOPO 8 ORE (Token scaduto)
   ↓
   Usa Refresh Token → Nuovo Access Token
   Nuovo Refresh Token
   
3. RIPETI ogni 8 ore
   ↓
   refresh-with-refresh-token.sh
```

---

## 🛠️ Troubleshooting

### Errore: "Invalid authorization code"

**Causa:** Il codice OAuth è scaduto (durata: 5 minuti)

**Soluzione:** Riprova il processo dall'inizio

---

### Errore: "Invalid refresh token"

**Causa:** Il refresh token è scaduto (durata: 30 giorni)

**Soluzione:** Usa il Metodo 1 (OAuth flow completo)

---

### Errore: "USER_AUTHENTICATION_FAILED"

**Causa:** Token scaduto o non valido

**Soluzione:** Esegui `./refresh-docusign-token.sh`

---

## 🔮 Automazione Futura

In futuro, possiamo implementare:

1. **Auto-refresh automatico** - Quando il token sta per scadere
2. **Cron job** - Refresh ogni 7 ore
3. **Webhook** - Notifica quando il token è scaduto

Ma per ora, il refresh manuale è sufficiente per testing.

---

## 📊 Verifica Stato Token

Per controllare lo stato attuale del token:

```bash
npx wrangler d1 execute telemedcare-leads --local --command "
  SELECT 
    id,
    CASE 
      WHEN datetime(expires_at) > datetime('now') THEN 'VALIDO'
      ELSE 'SCADUTO'
    END as status,
    expires_at,
    CASE
      WHEN refresh_token IS NOT NULL AND refresh_token != 'null' THEN 'SÌ'
      ELSE 'NO'
    END as has_refresh_token,
    created_at
  FROM docusign_tokens
  ORDER BY created_at DESC
  LIMIT 1
"
```

---

## ✅ Checklist

Prima di testare DocuSign:

- [ ] Token refreshato tramite `./refresh-docusign-token.sh`
- [ ] Verifica scadenza > adesso
- [ ] Refresh token salvato nel database
- [ ] Dev server in esecuzione
- [ ] Credenziali DocuSign in `.dev.vars`

---

## 🎯 Prossimo Passo

**Esegui ora:**

```bash
./refresh-docusign-token.sh
```

E segui le istruzioni! 🚀
