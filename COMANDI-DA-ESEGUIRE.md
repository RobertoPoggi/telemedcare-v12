# 🎯 COMANDI DA ESEGUIRE - COPIA E INCOLLA

## SETUP COMPLETO IN 5 COMANDI

### 1️⃣ AGGIUNGI SECRET SU GITHUB
Vai su browser: https://github.com/RobertoPoggi/telemedcare-v11/settings/secrets/actions

Clicca "New repository secret":
- Name: `CLOUDFLARE_API_TOKEN`
- Value: `zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3`

---

### 2️⃣ CREA DATABASE (esegui nel terminale)

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN="zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3"
npx wrangler d1 create telemedcare-leads
```

**IMPORTANTE**: Copia il `database_id` che ti darà (tipo: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

---

### 3️⃣ AGGIORNA wrangler.jsonc CON IL DATABASE ID

Sostituisci `e49ad96c-a4c7-4d3e-b2b9-4f3e8a1c5d7f` con il tuo database_id alle righe 32 e 48 di `wrangler.jsonc`

---

### 4️⃣ APPLICA MIGRATIONS

```bash
cd /home/user/webapp
export CLOUDFLARE_API_TOKEN="zc-7hBL9xX4S7cBj-ZneYA9tyZYBf_lSZAgyODq3"
npx wrangler d1 migrations apply telemedcare-leads --remote
```

---

### 5️⃣ COMMIT E PUSH

```bash
cd /home/user/webapp
git add .
git commit -m "feat: Setup complete automatic deployment pipeline"
git push origin main
```

---

## ✅ VERIFICA DEPLOY

Dopo il push, vai su:
- **GitHub Actions**: https://github.com/RobertoPoggi/telemedcare-v11/actions
- Vedrai il workflow che parte automaticamente
- Aspetta 2-3 minuti

---

## 🌐 CONFIGURA CLOUDFLARE PAGES BINDINGS

1. Vai su: https://dash.cloudflare.com
2. Workers & Pages → `telemedcare-v11` → Settings
3. Scroll fino a "Bindings" 
4. Add binding:
   - Type: `D1 database`
   - Variable name: `DB`
   - D1 database: seleziona `telemedcare-leads`
5. Save

---

## 🎉 FATTO!

Il sito sarà live su: **https://telemedcare-v11.pages.dev**

Da ora ogni `git push` farà deploy automatico! 🚀
