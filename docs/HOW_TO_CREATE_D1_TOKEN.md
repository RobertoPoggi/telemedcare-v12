# 🔑 Come Creare API Token Cloudflare per D1 Database

## ❌ Problema Attuale

Il token API che hai fornito (`7qHv_fdmFEXaRI8v1LKOTXWC7P7iPaYXB4-9HqqD`) ha solo permessi per **Cloudflare Pages**, ma NON per **D1 Database**.

**Errore ricevuto:**
```
The given account is not valid or is not authorized to access this service
```

---

## ✅ Soluzione: Creare Nuovo Token con Permessi D1

### 🔗 Passo 1: Vai alla pagina API Tokens

**Link diretto**: https://dash.cloudflare.com/profile/api-tokens

### 📝 Passo 2: Crea Custom Token

1. Click su **"Create Token"**
2. Seleziona **"Create Custom Token"** (in fondo alla lista)

### 🔐 Passo 3: Configura Permessi

Imposta questi permessi:

```
Token name: TeleMedCare D1 + Pages Full Access

Permissions:
┌──────────────┬────────────────────────┬──────────┐
│ Resource     │ Permission             │ Access   │
├──────────────┼────────────────────────┼──────────┤
│ Account      │ D1                     │ Edit     │
│ Account      │ Cloudflare Pages       │ Edit     │
│ Account      │ Workers Scripts        │ Edit     │ (opzionale)
└──────────────┴────────────────────────┴──────────┘

Account Resources:
  Include: Specific account
  Select: Telecareh24srl@gmail.com's Account

Client IP Address Filtering: (lascia vuoto o specifica IP)

TTL: Start now, End never (o specifica scadenza)
```

### 🎯 Screenshot Guida

**Configurazione permessi corretti:**

```
┌─────────────────────────────────────────────────┐
│ 📋 Permissions                                  │
├─────────────────────────────────────────────────┤
│ Account                                         │
│   ├─ D1                                → Edit   │
│   ├─ Cloudflare Pages                  → Edit   │
│   └─ Workers Scripts (opt)             → Edit   │
├─────────────────────────────────────────────────┤
│ 🏢 Account Resources                            │
│   Include: Specific account                     │
│   ├─ Telecareh24srl@gmail.com's Account ✓      │
├─────────────────────────────────────────────────┤
│ 🌐 Zone Resources: (non necessario)             │
│   All zones                                     │
└─────────────────────────────────────────────────┘
```

### ✅ Passo 4: Salva e Copia Token

1. Click **"Continue to summary"**
2. Review delle impostazioni
3. Click **"Create Token"**
4. **COPIA IL TOKEN IMMEDIATAMENTE** (non lo vedrai più!)

Il token sarà simile a:
```
AbC123XyZ456_example_token_here_789
```

---

## 🚀 Uso del Nuovo Token

### Metodo 1: Export Temporaneo

```bash
export CLOUDFLARE_API_TOKEN='<il-nuovo-token-qui>'
cd /home/user/webapp
./clone-d1-quick.sh
```

### Metodo 2: Inline

```bash
CLOUDFLARE_API_TOKEN='<token>' ./clone-d1-quick.sh
```

---

## 🔍 Verifica Permessi Token

Dopo aver creato il token, verifica:

```bash
# Test 1: Verifica token valido
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/verify" \
  -H "Authorization: Bearer <TOKEN>" | jq .

# Test 2: Lista databases D1
curl -X GET "https://api.cloudflare.com/client/v4/accounts/8eee3bb064814aa60b770a979332a914/d1/database" \
  -H "Authorization: Bearer <TOKEN>" | jq .
```

Output atteso:
```json
{
  "success": true,
  "result": [
    {
      "uuid": "ef89ed07-bf97-47f1-8f4c-c5049b102e57",
      "name": "telemedcare-leads",
      ...
    }
  ]
}
```

---

## 📋 Checklist Creazione Token

Prima di creare il token, verifica:

- [ ] Sei loggato su Cloudflare Dashboard
- [ ] Hai accesso all'account: `Telecareh24srl@gmail.com's Account`
- [ ] Hai permessi di Super Administrator

Durante la creazione:

- [ ] Selezionato **"Create Custom Token"**
- [ ] Aggiunto permesso: **Account → D1 → Edit**
- [ ] Aggiunto permesso: **Account → Cloudflare Pages → Edit**
- [ ] Selezionato account specifico: **Telecareh24srl@gmail.com's Account**
- [ ] Copiato il token generato

Dopo la creazione:

- [ ] Token salvato in luogo sicuro
- [ ] Testato con `curl` o `wrangler`
- [ ] Usato per clonare database D1

---

## 🆚 Confronto Token Vecchio vs Nuovo

### Token Attuale (limitato)
```
7qHv_fdmFEXaRI8v1LKOTXWC7P7iPaYXB4-9HqqD

Permessi:
  ✅ Cloudflare Pages → Edit
  ❌ D1 Database → No access
  
Può fare:
  ✅ Clone Environment Variables
  ❌ Clone Database D1
```

### Nuovo Token (completo)
```
<DA CREARE>

Permessi:
  ✅ Cloudflare Pages → Edit
  ✅ D1 Database → Edit
  
Può fare:
  ✅ Clone Environment Variables
  ✅ Clone Database D1
  ✅ Export/Import dati
```

---

## 🛡️ Sicurezza Token

### ✅ Best Practices

1. **Non condividere**: Il token è sensibile come una password
2. **Scadenza**: Imposta una scadenza (es. 1 anno)
3. **IP Filtering**: Opzionale, limita accesso da IP specifici
4. **Rotazione**: Cambia token periodicamente
5. **Storage sicuro**: Usa password manager

### ❌ Non fare

- ❌ Non committare il token nel codice
- ❌ Non condividerlo in chat/email non crittografate
- ❌ Non usare lo stesso token per ambienti diversi (dev/prod)

---

## 🆘 Troubleshooting

### Errore: "Authentication error [code: 10000]"
**Causa**: Token non valido o scaduto  
**Soluzione**: Verifica il token con `curl` e ricrea se necessario

### Errore: "Account not authorized [code: 7403]"
**Causa**: Token non ha permessi D1  
**Soluzione**: Aggiungi permesso "Account → D1 → Edit"

### Errore: "Token expired"
**Causa**: Token scaduto (TTL)  
**Soluzione**: Crea nuovo token con TTL più lungo

---

## 📞 Link Utili

- **Cloudflare API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **D1 Documentation**: https://developers.cloudflare.com/d1/
- **API Token Permissions**: https://developers.cloudflare.com/fundamentals/api/reference/permissions/

---

## 🎯 Prossimi Passi

1. **Crea il nuovo token** seguendo la guida sopra
2. **Fornisci il nuovo token** (qui o via variabile export)
3. **Esegui lo script di clone**: `./clone-d1-quick.sh`
4. **Verifica il risultato** nel dashboard Cloudflare

---

**File**: `HOW_TO_CREATE_D1_TOKEN.md`  
**Data**: 2026-01-06  
**Account ID**: `8eee3bb064814aa60b770a979332a914`
