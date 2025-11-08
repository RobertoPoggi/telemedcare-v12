# 🔧 AGGIUNGI WORKFLOW GITHUB MANUALMENTE

Il token GitHub non ha permessi per creare workflow automaticamente.
Devi aggiungere il file manualmente via web interface.

## PROCEDURA (2 minuti):

### 1️⃣ Vai su GitHub
https://github.com/RobertoPoggi/telemedcare-v11

### 2️⃣ Crea la struttura
1. Clicca su **"Add file"** → **"Create new file"**
2. Nel nome file scrivi: `.github/workflows/deploy.yml`
   (GitHub creerà automaticamente le cartelle)

### 3️⃣ Copia questo contenuto nel file:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: 73e144e1ddc4f4af162d17c313e00c06
          projectName: telemedcare-v11
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          branch: main
```

### 4️⃣ Commit
- Scrivi commit message: `feat: Add automatic deployment workflow`
- Clicca **"Commit new file"**

---

## ✅ FATTO!

Ora il workflow è attivo e partirà automaticamente ad ogni push!

---

## ALTERNATIVA PIÙ VELOCE:

Oppure copia il file che ho già preparato:

```bash
# Il file esiste già in locale in: .github/workflows/deploy.yml
# Puoi aggiungerlo manualmente copiando il contenuto
cat .github/workflows/deploy.yml
```

Poi incollalo nella web interface di GitHub come descritto sopra.
